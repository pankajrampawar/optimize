import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
    user: {
        type: String,
        required: [true, 'User is required'],
        enum: ['pankaj', 'sujal'],
        lowercase: true
    },
    title: {
        type: String,
        required: [true, 'Goal title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [300, 'Description cannot exceed 300 characters'],
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['fitness', 'productivity', 'sleep', 'wellness', 'learning', 'other'],
        default: 'other'
    },
    // Goal metrics
    metric: {
        type: String,
        required: [true, 'Metric type is required'],
        enum: ['distractions', 'workoutTime', 'sleepHours', 'productivityScore', 'consciousTimepass', 'custom']
    },
    target: {
        type: Number,
        required: [true, 'Target value is required'],
        min: [0, 'Target cannot be negative']
    },
    current: {
        type: Number,
        default: 0,
        min: [0, 'Current value cannot be negative']
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        enum: ['count', 'minutes', 'hours', 'score', 'days', 'times'],
        default: 'count'
    },
    // Time frame
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    // Goal status
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    // Goal type
    goalType: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'custom'],
        default: 'custom'
    },
    // Repeat settings for recurring goals
    recurring: {
        enabled: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            default: 'daily'
        },
        daysOfWeek: [{
            type: Number,
            min: 0,
            max: 6 // 0 = Sunday, 6 = Saturday
        }]
    },
    // Progress tracking
    milestones: [{
        value: Number,
        achievedAt: Date,
        note: String
    }],
    // Priority and difficulty
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium'
    }
}, {
    timestamps: true,
    collection: 'goals'
});

// Indexes
GoalSchema.index({ user: 1, completed: 1 });
GoalSchema.index({ user: 1, endDate: 1 });
GoalSchema.index({ user: 1, category: 1 });
GoalSchema.index({ startDate: 1, endDate: 1 });

// Virtual for progress percentage
GoalSchema.virtual('progressPercentage').get(function () {
    if (this.target === 0) return 0;
    return Math.min(Math.round((this.current / this.target) * 100), 100);
});

// Virtual for days remaining
GoalSchema.virtual('daysRemaining').get(function () {
    const today = new Date();
    const timeDiff = this.endDate - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
});

// Virtual for status
GoalSchema.virtual('status').get(function () {
    if (this.completed) return 'completed';

    const today = new Date();
    if (this.endDate < today) return 'expired';
    if (this.startDate > today) return 'upcoming';

    const progress = this.progressPercentage;
    if (progress >= 100) return 'achieved';
    if (progress >= 75) return 'on-track';
    if (progress >= 50) return 'behind';
    return 'at-risk';
});

// Virtual for time frame description
GoalSchema.virtual('timeFrame').get(function () {
    const start = this.startDate.toDateString();
    const end = this.endDate.toDateString();
    return `${start} - ${end}`;
});

// Pre-save middleware
GoalSchema.pre('save', function (next) {
    // Auto-complete goal if target is reached
    if (this.current >= this.target && !this.completed) {
        this.completed = true;
        this.completedAt = new Date();
    }

    // Unmark completion if current drops below target
    if (this.current < this.target && this.completed && !this.completedAt) {
        this.completed = false;
        this.completedAt = null;
    }

    next();
});

// Static methods
GoalSchema.statics.getActiveGoals = function (user) {
    const today = new Date();
    return this.find({
        user: user,
        completed: false,
        startDate: { $lte: today },
        endDate: { $gte: today }
    }).sort({ priority: -1, endDate: 1 });
};

GoalSchema.statics.getCompletedGoals = function (user) {
    return this.find({
        user: user,
        completed: true
    }).sort({ completedAt: -1 });
};

GoalSchema.statics.getGoalsByCategory = function (user, category) {
    return this.find({
        user: user,
        category: category
    }).sort({ createdAt: -1 });
};

// Method to update progress
GoalSchema.methods.updateProgress = function (newValue, note = '') {
    this.current = newValue;

    // Add milestone if it's a significant progress
    if (note || newValue > 0) {
        this.milestones.push({
            value: newValue,
            achievedAt: new Date(),
            note: note
        });
    }

    return this.save();
};

// Export model
export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);