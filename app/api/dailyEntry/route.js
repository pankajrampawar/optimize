import Entry from '@/models/Entry';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();

        // Validate user
        if (!['pankaj', 'sujal'].includes(data.user)) {
            return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
        }

        // Validate assignedTasks and majorTasks (exactly 3 each)
        if (data.assignedTasks.length !== 3 || data.majorTasks.length !== 3) {
            return NextResponse.json({ error: 'Exactly 3 assigned tasks and 3 major tasks are required' }, { status: 400 });
        }

        const dailyEntry = new Entry(data);
        await dailyEntry.save();
        return NextResponse.json({ message: 'Entry saved', data: dailyEntry }, { status: 201 });
    } catch (error) {
        console.error('Error saving entry:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}