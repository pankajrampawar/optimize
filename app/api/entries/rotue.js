import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Entry from '@/models/Entry';
import User from '@/models/User';

// GET - Fetch entries with optional filters
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const user = searchParams.get('user');
        const date = searchParams.get('date');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit')) || 50;
        const page = parseInt(searchParams.get('page')) || 1;

        // Build query object
        let query = {};

        if (user) {
            query.user = user.toLowerCase();
        }

        // Handle date filtering
        if (date) {
            if (date === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                query.date = {
                    $gte: today,
                    $lt: tomorrow
                };
            } else {
                // Specific date
                const targetDate = new Date(date);
                targetDate.setHours(0, 0, 0, 0);
                const nextDay = new Date(targetDate);
                nextDay.setDate(nextDay.getDate() + 1);

                query.date = {
                    $gte: targetDate,
                    $lt: nextDay
                };
            }
        } else if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const entries = await Entry.find(query)
            .sort({ date: -1, createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        // Get total count for pagination
        const total = await Entry.countDocuments(query);

        // Format response
        const response = {
            entries,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error('GET /api/entries error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch entries', details: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new entry
export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { user, date, distractions, consciousTimepass, workoutTime, sleepHours, productivityScore, notes, mood } = body;

        // Validation
        if (!user || !['pankaj', 'sujal'].includes(user.toLowerCase())) {
            return NextResponse.json(
                { error: 'Valid user is required (pankaj or sujal)' },
                { status: 400 }
            );
        }

        // Validate required fields
        const requiredFields = ['distractions', 'consciousTimepass', 'workoutTime', 'sleepHours', 'productivityScore'];
        const missingFields = requiredFields.filter(field => body[field] === undefined || body[field] === null);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Set date (default to today if not provided)
        let entryDate = date ? new Date(date) : new Date();
        entryDate.setHours(0, 0, 0, 0);

        // Check if entry already exists for this user and date
        const existingEntry = await Entry.findOne({
            user: user.toLowerCase(),
            date: entryDate
        });

        if (existingEntry) {
            return NextResponse.json(
                { error: 'Entry already exists for this date. Use PUT to update.' },
                { status: 409 }
            );
        }

        // Create new entry
        const entryData = {
            user: user.toLowerCase(),
            date: entryDate,
            distractions: Number(distractions),
            consciousTimepass: Number(consciousTimepass),
            workoutTime: Number(workoutTime),
            sleepHours: Number(sleepHours),
            productivityScore: Number(productivityScore),
            notes: notes || '',
            mood: mood || 'okay'
        };

        const newEntry = await Entry.create(entryData);

        // Update user stats
        await updateUserStats(user.toLowerCase(), entryDate);

        return NextResponse.json(
            {
                message: 'Entry created successfully',
                entry: newEntry
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('POST /api/entries error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { error: 'Validation failed', details: validationErrors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create entry', details: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update existing entry
export async function PUT(request) {
    try {
        await connectDB();

        const body = await request.json();
        const { id, user, date, ...updateFields } = body;

        if (!id && !(user && date)) {
            return NextResponse.json(
                { error: 'Either entry ID or user+date is required' },
                { status: 400 }
            );
        }

        let entry;

        if (id) {
            // Update by ID
            entry = await Entry.findById(id);
        } else {
            // Update by user and date
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            entry = await Entry.findOne({
                user: user.toLowerCase(),
                date: targetDate
            });
        }

        if (!entry) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        // Update fields
        Object.keys(updateFields).forEach(key => {
            if (updateFields[key] !== undefined) {
                entry[key] = updateFields[key];
            }
        });

        await entry.save();

        // Update user stats
        await updateUserStats(entry.user, entry.date);

        return NextResponse.json(
            {
                message: 'Entry updated successfully',
                entry
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('PUT /api/entries error:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return NextResponse.json(
                { error: 'Validation failed', details: validationErrors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update entry', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete entry
export async function DELETE(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const user = searchParams.get('user');
        const date = searchParams.get('date');

        if (!id && !(user && date)) {
            return NextResponse.json(
                { error: 'Either entry ID or user+date is required' },
                { status: 400 }
            );
        }

        let entry;

        if (id) {
            entry = await Entry.findByIdAndDelete(id);
        } else {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);

            entry = await Entry.findOneAndDelete({
                user: user.toLowerCase(),
                date: targetDate
            });
        }

        if (!entry) {
            return NextResponse.json(
                { error: 'Entry not found' },
                { status: 404 }
            );
        }

        // Update user stats
        await updateUserStats(entry.user, entry.date);

        return NextResponse.json(
            { message: 'Entry deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('DELETE /api/entries error:', error);
        return NextResponse.json(
            { error: 'Failed to delete entry', details: error.message },
            { status: 500 }
        );
    }
}

// Helper function to update user statistics
async function updateUserStats(username, entryDate) {
    try {
        const user = await User.findOne({ username });
        if (!user) return;

        // Get total entries count
        const totalEntries = await Entry.countDocuments({ user: username });

        // Calculate streak
        const recentEntries = await Entry.find({ user: username })
            .sort({ date: -1 })
            .limit(30);

        const streak = calculateStreak(recentEntries);

        // Update user stats
        user.stats.totalEntries = totalEntries;
        user.stats.streak = streak;
        user.stats.lastEntryDate = entryDate;

        await user.save();
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

// Helper function to calculate streak
function calculateStreak(entries) {
    if (entries.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of entries) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        if (entryDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}