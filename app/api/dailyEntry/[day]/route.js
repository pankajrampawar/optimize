import connectDB from '@/lib/mongodb';
import Entry from '@/models/Entry';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await connectDB();

        const { day } = params; // Get day from URL params (e.g., 2025-05-30)

        // Parse the input day and create a date range for the entire day
        const startDate = new Date(day);
        if (isNaN(startDate)) {
            return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
        }
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1); // End of the day

        // Query for entries on the specified day for both users
        const entries = await Entry.find({
            day: {
                $gte: startDate,
                $lt: endDate,
            },
            user: { $in: ['sujal', 'pankaj'] },
        });

        // Organize entries by user
        const sujalEntry = entries.find((entry) => entry.user === 'sujal') || null;
        const pankajEntry = entries.find((entry) => entry.user === 'pankaj') || null;

        return NextResponse.json(
            {
                data: {
                    sujal: sujalEntry,
                    pankaj: pankajEntry,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching entries:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}