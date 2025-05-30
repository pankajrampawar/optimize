import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Goal from '@/models/Goal'; // Adjust path based on your model location

// Database connection helper
async function connectDB() {
    if (mongoose.connections[0].readyState) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        throw new Error('Database connection failed');
    }
}

// GET - Fetch goals with various filters
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const user = searchParams.get('user');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const goalType = searchParams.get('goalType');
        const completed = searchParams.get('completed');
        const limit = parseInt(searchParams.get('limit')) || 50;
        const page = parseInt(searchParams.get('page')) || 1;
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build query object
        let query = {};

        if (user) {
            query.user = user.toLowerCase();
        }

        if (category) {
            query.category = category;
        }

        if (priority) {
            query.priority = priority;
        }

        if (goalType) {
            query.goalType = goalType;
        }

        if (completed !== null && completed !== undefined) {
            query.completed = completed === 'true';
        }

        // Handle status filtering (virtual field logic)
        if (status) {
            const today = new Date();
            switch (status) {
                case 'active':
                    query.completed = false;
                    query.startDate = { $lte: today };
                    query.endDate = { $gte: today };
                    break;
                case 'completed':
                    query.completed = true;
                    break;
                case 'expired':
                    query.completed = false;
                    query.endDate = { $lt: today };
                    break;
                case 'upcoming':
                    query.startDate = { $gt: today };
                    break;
            }
        }

        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const goals = await Goal.find(query)
            .sort(sortObj)
            .limit(limit)
            .skip(skip)
            .lean();

        // Get total count for pagination
        const totalCount = await Goal.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        // Add virtual fields manually since we're using lean()
        const goalsWithVirtuals = goals.map(goal => {
            const progressPercentage = goal.target === 0 ? 0 : Math.min(Math.round((goal.current / goal.target) * 100), 100);
            const today = new Date();
            const daysRemaining = Math.ceil((goal.endDate - today) / (1000 * 60 * 60 * 24));

            let status = 'active';
            if (goal.completed) status = 'completed';
            else if (goal.endDate < today) status = 'expired';
            else if (goal.startDate > today) status = 'upcoming';
            else if (progressPercentage >= 100) status = 'achieved';
            else if (progressPercentage >= 75) status = 'on-track';
            else if (progressPercentage >= 50) status = 'behind';
            else status = 'at-risk';

            const timeFrame = `${goal.startDate.toDateString()} - ${goal.endDate.toDateString()}`;

            return {
                ...goal,
                progressPercentage,
                daysRemaining,
                status,
                timeFrame
            };
        });

        return NextResponse.json({
            success: true,
            data: goalsWithVirtuals,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('GET /api/goals error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch goals' },
            { status: 500 }
        );
    }
}

// POST - Create a new goal
export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        // Validate required fields
        const requiredFields = ['user', 'title', 'category', 'metric', 'target', 'unit', 'endDate'];
        const missingFields = requiredFields.filter(field => !body[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Missing required fields: ${missingFields.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Create new goal
        const goal = new Goal(body);
        await goal.save();

        return NextResponse.json({
            success: true,
            data: goal,
            message: 'Goal created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('POST /api/goals error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { success: false, error: errors.join(', ') },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create goal' },
            { status: 500 }
        );
    }
}

// PUT - Update a goal
export async function PUT(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Goal ID is required' },
                { status: 400 }
            );
        }

        const goal = await Goal.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!goal) {
            return NextResponse.json(
                { success: false, error: 'Goal not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: goal,
            message: 'Goal updated successfully'
        });

    } catch (error) {
        console.error('PUT /api/goals error:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { success: false, error: errors.join(', ') },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update goal' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a goal
export async function DELETE(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Goal ID is required' },
                { status: 400 }
            );
        }

        const goal = await Goal.findByIdAndDelete(id);

        if (!goal) {
            return NextResponse.json(
                { success: false, error: 'Goal not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Goal deleted successfully'
        });

    } catch (error) {
        console.error('DELETE /api/goals error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete goal' },
            { status: 500 }
        );
    }
}