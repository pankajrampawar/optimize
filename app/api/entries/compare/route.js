import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Entry from '@/models/Entry';

// GET - Get comparison data between Pankaj and Sujal
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const metric = searchParams.get('metric') || 'all';
        const range = searchParams.get('range') || 'week';
        const date = searchParams.get('date');
        const format = searchParams.get('format') || 'detailed';

        let startDate, endDate;

        // Calculate date range
        if (date) {
            // Specific date comparison
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
        } else {
            // Range-based comparison
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            startDate = new Date();

            switch (range) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startDate.setDate(startDate.getDate() - 30);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                default:
                    // Default to week
                    startDate.setDate(startDate.getDate() - 7);
                    startDate.setHours(0, 0, 0, 0);
            }
        }

        // Fetch entries for both users
        const entries = await Entry.find({
            date: {
                $gte: startDate,
                $lt: endDate
            }
        }).sort({ date: -1 });

        // Separate entries by user
        const pankajEntries = entries.filter(entry => entry.user === 'pankaj');
        const sujalEntries = entries.filter(entry => entry.user === 'sujal');

        let comparisonData;

        if (format === 'summary') {
            // Summary format for dashboard cards
            comparisonData = generateSummaryComparison(pankajEntries, sujalEntries, metric);
        } else if (format === 'chart') {
            // Chart format for graphs
            comparisonData = generateChartComparison(pankajEntries, sujalEntries, metric, range);
        } else {
            // Detailed format (default)
            comparisonData = generateDetailedComparison(pankajEntries, sujalEntries, metric);
        }

        // Add metadata
        const response = {
            data: comparisonData,
            metadata: {
                range,
                metric,
                format,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                totalEntries: {
                    pankaj: pankajEntries.length,
                    sujal: sujalEntries.length
                }
            }
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error('GET /api/entries/compare error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comparison data', details: error.message },
            { status: 500 }
        );
    }
}

// Generate summary comparison for dashboard
function generateSummaryComparison(pankajEntries, sujalEntries, metric) {
    const metrics = metric === 'all'
        ? ['distractions', 'consciousTimepass', 'workoutTime', 'sleepHours', 'productivityScore']
        : [metric];

    const summary = {};

    metrics.forEach(m => {
        const pankajValues = pankajEntries.map(entry => entry[m]).filter(val => val != null);
        const sujalValues = sujalEntries.map(entry => entry[m]).filter(val => val != null);

        const pankajAvg = pankajValues.length > 0
            ? pankajValues.reduce((sum, val) => sum + val, 0) / pankajValues.length
            : 0;
        const sujalAvg = sujalValues.length > 0
            ? sujalValues.reduce((sum, val) => sum + val, 0) / sujalValues.length
            : 0;

        summary[m] = {
            pankaj: {
                average: Math.round(pankajAvg * 100) / 100,
                total: pankajValues.reduce((sum, val) => sum + val, 0),
                count: pankajValues.length,
                latest: pankajEntries[0]?.[m] || 0
            },
            sujal: {
                average: Math.round(sujalAvg * 100) / 100,
                total: sujalValues.reduce((sum, val) => sum + val, 0),
                count: sujalValues.length,
                latest: sujalEntries[0]?.[m] || 0
            },
            winner: pankajAvg > sujalAvg ? 'pankaj' : sujalAvg > pankajAvg ? 'sujal' : 'tie',
            difference: Math.abs(pankajAvg - sujalAvg)
        };
    });

    return summary;
}

// Generate detailed comparison
function generateDetailedComparison(pankajEntries, sujalEntries, metric) {
    const comparison = {
        pankaj: calculateUserStats(pankajEntries),
        sujal: calculateUserStats(sujalEntries),
        headToHead: generateHeadToHead(pankajEntries, sujalEntries),
        leaderboard: generateLeaderboard(pankajEntries, sujalEntries)
    };

    return comparison;
}

// Generate chart-friendly comparison data
function generateChartComparison(pankajEntries, sujalEntries, metric, range) {
    const metrics = metric === 'all'
        ? ['distractions', 'consciousTimepass', 'workoutTime', 'sleepHours', 'productivityScore']
        : [metric];

    const chartData = {};

    metrics.forEach(m => {
        const dataPoints = [];

        // Create a map of dates to values
        const dateMap = new Map();

        pankajEntries.forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0];
            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { date: dateKey });
            }
            dateMap.get(dateKey).pankaj = entry[m];
        });

        sujalEntries.forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0];
            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { date: dateKey });
            }
            dateMap.get(dateKey).sujal = entry[m];
        });

        // Convert to array and sort by date
        chartData[m] = Array.from(dateMap.values())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(item => ({
                date: item.date,
                pankaj: item.pankaj || 0,
                sujal: item.sujal || 0
            }));
    });

    return chartData;
}

// Calculate comprehensive user statistics
function calculateUserStats(entries) {
    if (entries.length === 0) {
        return {
            totalEntries: 0,
            averages: {},
            totals: {},
            trends: {},
            streak: 0
        };
    }

    const metrics = ['distractions', 'consciousTimepass', 'workoutTime', 'sleepHours', 'productivityScore'];
    const averages = {};
    const totals = {};
    const trends = {};

    metrics.forEach(metric => {
        const values = entries.map(entry => entry[metric]).filter(val => val != null);

        averages[metric] = values.length > 0
            ? Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 100) / 100
            : 0;

        totals[metric] = values.reduce((sum, val) => sum + val, 0);

        // Calculate trend (last 3 vs first 3 entries)
        if (values.length >= 6) {
            const recent = values.slice(0, 3);
            const older = values.slice(-3);
            const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
            const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

            trends[metric] = {
                direction: recentAvg > olderAvg ? 'up' : recentAvg < olderAvg ? 'down' : 'stable',
                change: Math.round((recentAvg - olderAvg) * 100) / 100,
                percentage: olderAvg !== 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0
            };
        } else {
            trends[metric] = { direction: 'stable', change: 0, percentage: 0 };
        }
    });

    return {
        totalEntries: entries.length,
        averages,
        totals,
        trends,
        streak: calculateStreak(entries),
        bestDay: findBestDay(entries),
        consistency: calculateConsistency(entries)
    };
}

// Generate head-to-head comparison
function generateHeadToHead(pankajEntries, sujalEntries) {
    const metrics = ['distractions', 'consciousTimepass', 'workoutTime', 'sleepHours', 'productivityScore'];
    const headToHead = {};

    metrics.forEach(metric => {
        const pankajValues = pankajEntries.map(entry => entry[metric]).filter(val => val != null);
        const sujalValues = sujalEntries.map(entry => entry[metric]).filter(val => val != null);

        const pankajAvg = pankajValues.reduce((sum, val) => sum + val, 0) / (pankajValues.length || 1);
        const sujalAvg = sujalValues.reduce((sum, val) => sum + val, 0) / (sujalValues.length || 1);

        headToHead[metric] = {
            winner: pankajAvg > sujalAvg ? 'pankaj' : sujalAvg > pankajAvg ? 'sujal' : 'tie',
            pankajScore: Math.round(pankajAvg * 100) / 100,
            sujalScore: Math.round(sujalAvg * 100) / 100,
            margin: Math.round(Math.abs(pankajAvg - sujalAvg) * 100) / 100
        };
    });

    return headToHead;
}

// Generate leaderboard
function generateLeaderboard(pankajEntries, sujalEntries) {
    const pankajStats = calculateUserStats(pankajEntries);
    const sujalStats = calculateUserStats(sujalEntries);

    const categories = [
        { name: 'Productivity', metric: 'productivityScore', higher: true },
        { name: 'Workout Time', metric: 'workoutTime', higher: true },
        { name: 'Sleep Quality', metric: 'sleepHours', higher: true },
        { name: 'Focus (Low Distractions)', metric: 'distractions', higher: false },
        { name: 'Consistency', metric: 'streak', higher: true }
    ];

    const leaderboard = categories.map(category => {
        const pankajValue = category.metric === 'streak'
            ? pankajStats.streak
            : pankajStats.averages[category.metric];
        const sujalValue = category.metric === 'streak'
            ? sujalStats.streak
            : sujalStats.averages[category.metric];

        let winner;
        if (category.higher) {
            winner = pankajValue > sujalValue ? 'pankaj' : sujalValue > pankajValue ? 'sujal' : 'tie';
        } else {
            winner = pankajValue < sujalValue ? 'pankaj' : sujalValue < pankajValue ? 'sujal' : 'tie';
        }

        return {
            category: category.name,
            metric: category.metric,
            winner,
            pankaj: pankajValue,
            sujal: sujalValue
        };
    });

    return leaderboard;
}

// Helper functions
function calculateStreak(entries) {
    // Implementation same as in main entries route
    if (entries.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const sortedEntries = entries.sort((a, b) => b.date - a.date);

    for (const entry of sortedEntries) {
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

function findBestDay(entries) {
    if (entries.length === 0) return null;

    return entries.reduce((best, current) => {
        return current.productivityScore > best.productivityScore ? current : best;
    });
}

function calculateConsistency(entries) {
    if (entries.length < 2) return 100;

    const productivityScores = entries.map(entry => entry.productivityScore);
    const average = productivityScores.reduce((sum, score) => sum + score, 0) / productivityScores.length;
    const variance = productivityScores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / productivityScores.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency percentage (lower deviation = higher consistency)
    const consistencyScore = Math.max(0, 100 - (standardDeviation * 10));
    return Math.round(consistencyScore);
}