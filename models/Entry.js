const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
    day: {
        type: Date,
        required: true,
        default: Date.now,
    },
    user: {
        type: String,
        required: true,
        enum: ['pankaj', 'sujal'],
    },
    meditationMinutes: {
        type: Number,
        required: true,
        min: 0,
    },
    exercise: {
        type: Boolean,
        required: true,
    },
    assignedTasks: [
        {
            task: {
                type: String,
                required: true,
                trim: true,
            },
            score: {
                type: Number,
                required: true,
                min: 1,
                max: 10,
            },
        },
    ],
    hoursKutumbiq: {
        type: Number,
        required: true,
        min: 0,
    },
    hoursReading: {
        type: Number,
        required: true,
        min: 0,
    },
    hoursTimepass: {
        type: Number,
        required: true,
        min: 0,
    },
    hoursImprovingLearning: {
        type: Number,
        required: true,
        min: 0,
    },
    majorTasks: [
        {
            task: {
                type: String,
                required: true,
                trim: true,
            },
            completed: {
                type: Boolean,
                required: true,
            },
        },
    ],
    hoursWasted: {
        type: Number,
        required: true,
        min: 0,
    },
    overallLearnings: {
        type: String,
        required: true,
    },
    overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: function () {
            // Example calculation: adjust weights as needed
            const taskScoreAvg =
                this.assignedTasks.length > 0
                    ? this.assignedTasks.reduce((sum, task) => sum + task.score, 0) /
                    this.assignedTasks.length
                    : 0;

            const majorTasksCompleted = this.majorTasks.filter(
                (task) => task.completed
            ).length;

            // Contribution calculations (ensure each stays within reasonable bounds)
            const meditationContribution = Math.min(this.meditationMinutes / 60, 1) * 15; // Max 15 points for 60+ min
            const exerciseContribution = this.exercise ? 10 : 0; // 10 points if exercised
            const taskCompletionContribution = (taskScoreAvg / 10) * 25; // Max 25 points (normalized from 10-point scale)
            const majorTaskContribution = (majorTasksCompleted / 3) * 20; // Max 20 points for all 3 tasks

            // Productive hours contribution (max 20 points)
            const totalProductiveHours = this.hoursKutumbiq + this.hoursReading + this.hoursImprovingLearning;
            const productiveHoursContribution = Math.min(totalProductiveHours / 12, 1) * 20; // Max 20 points for 12+ productive hours

            // Wasted hours penalty (max 10 points deduction)
            const wastedHoursPenalty = Math.max(0, Math.min(this.hoursWasted, 10)) * -1; // -1 point per wasted hour, max -10

            // Calculate total score
            const totalScore =
                meditationContribution +
                exerciseContribution +
                taskCompletionContribution +
                majorTaskContribution +
                productiveHoursContribution +
                wastedHoursPenalty;

            // Ensure the score is between 0 and 100
            return Math.max(0, Math.min(100, Math.round(totalScore)));
        },
    },
});

module.exports = mongoose.models.Entry || mongoose.model('Entry', EntrySchema);