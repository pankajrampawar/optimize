import connectDB from './mongodb';
import User from '../models/User';
import Entry from '../models/Entry';
import Goal from '../models/Goal';

/**
 * Initialize database with default users
 */
export async function initializeDatabase() {
    try {
        await connectDB();

        // Create default users if they don't exist
        const users = [
            {
                username: 'pankaj',
                displayName: 'Pankaj',
                config: {
                    theme: 'light',
                    notifications: true,
                    timezone: 'Asia/Kolkata'
                }
            },
            {
                username: 'sujal',
                displayName: 'Sujal',
                config: {
                    theme: 'dark',
                    notifications: true,
                    timezone: 'Asia/Kolkata'
                }
            }
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({ username: userData.username });
            if (!existingUser) {
                await User.create(userData);
                console.log(`✅ Created user: ${userData.displayName}`);
            }
        }

        console.log('✅ Database initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
}

/**
 * Get comparison data for dashboard
 */
export async function getComparisonData(date = null) {
    try {
        await connectDB();

        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const entries = await Entry.find({
            date: {
                $gte: targetDate,
                $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        // Format data for comparison
        const comparison = {
            pankaj: entries.find(e => e.user === 'pankaj') || null,
            sujal: entries.find(e => e.user === 'sujal') || null,
            date: targetDate.toISOString().split('T')[0]
        };

        return comparison;
    } catch (error) {
        console.error('Error getting comparison data:', error);
        throw error;
    }
}

/**
 * Get user statistics
 */
export async function getUserStats(username) {
    try {
        await connectDB();

        const user = await User.findOne({ username });
        if (!user) throw new Error('User not found');

        // Get entries from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const entries = await Entry.find({
            user: username,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 });

        // Calculate statistics
        const stats = {
            totalEntries: entries.length,
            averageProductivity: entries.length > 0
                ? entries.reduce((sum, entry) => sum + entry.productivityScore, 0) / entries.length
                : 0,
            averageWorkout: entries.length > 0
                ? entries.reduce((sum, entry) => sum + entry.workoutTime, 0) / entries.length
                : 0,
            averageSleep: entries.length > 0
                ? entries.reduce((sum, entry) => sum + entry.sleepHours, 0) / entries.length
                : 0,
            averageDistractions: entries.length > 0
                ? entries.reduce((sum, entry) => sum + entry.distractions, 0) / entries.length
                : 0,
            streak: calculateStreak(entries),
            lastEntry: entries[0] || null
        };

        return stats;
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
}

/**
 * Calculate current streak
 */
function calculateStreak(entries) {
    if (entries.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Sort entries by date descending
    const sortedEntries = entries.sort((a, b) => b.date - a.date);

    for (const entry of sortedEntries) {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        // Check if entry is from current date or consecutive previous date
        if (entryDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(metric = 'productivityScore', days = 7) {
    try {
        await connectDB();

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const results = await Entry.aggregate([
            {
                $match: {
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$user',
                    average: { $avg: `$${metric}` },
                    total: { $sum: `$${metric}` },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { average: -1 }
            }
        ]);

        return results.map(result => ({
            user: result._id,
            average: Math.round(result.average * 100) / 100,
            total: result.total,
            entries: result.count
        }));
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        throw error;
    }
}

/**
 * Utility to format comparison data for charts
 */
export function formatChartData(entries, metric) {
    const data = entries.reduce((acc, entry) => {
        const date = entry.date.toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);

        if (existing) {
            existing[entry.user] = entry[metric];
        } else {
            acc.push({
                date,
                [entry.user]: entry[metric]
            });
        }

        return acc;
    }, []);

    return data.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export { connectDB, User, Entry, Goal };