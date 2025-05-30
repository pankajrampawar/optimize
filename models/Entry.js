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
        trim: true,
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
            const meditationContribution = Math.min(this.meditationMinutes / 60, 1) * 20; // Max 20 points for 60+ min
            const exerciseContribution = this.exercise ? 10 : 0; // 10 points if exercised
            const taskCompletionContribution = taskScoreAvg * 3; // Task scores contribute (avg * 3)
            const majorTaskContribution = (majorTasksCompleted / 3) * 30; // Up to 30 points for 3 tasks
            const productiveHours =
                (this.hoursKutumbiq + this.hoursReading + this.hoursImprovingLearning) /
                24; // Normalize to fraction of day
            const wastedHoursPenalty = Math.max(0, (10 - this.hoursWasted) / 10) * 20; // Penalty for wasted hours

            return Math.round(
                meditationContribution +
                exerciseContribution +
                taskCompletionContribution +
                majorTaskContribution +
                (productiveHours * 20) +
                wastedHoursPenalty
            );
        },
    },
});

module.exports = mongoose.model('Entry', EntrySchema);