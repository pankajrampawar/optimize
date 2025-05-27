import mongoose from 'mongoose';

const EntrySchema = new mongoose.Schema({
    user: {
        type: String,
        required: [true, 'User is required'],
        enum: ['pankaj', 'sujal'],
        lowercase: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: () => {
            // Set to start of today (00:00:00)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return today;
        }
    },
    // Core metrics
    distractions: {
        type: Number,
        required: [true, 'Distractions count is required'],
        min: [0, 'Distractions cannot be negative'],
        max: [100, 'Distractions seems too high']
    },
    consciousTimepass: {
        type: Number,
        required: [true, 'Conscious timepass is required'],
        min: [0, 'Time cannot be negative'],
        max: [24 * 60, 'Cannot exceed 24 hours'] // in minutes
    },
    workoutTime: {
        type: Number,
        required: [true, 'Workout time is required'],
        min: [0, 'Time cannot be negative'],
        max: [300, 'Workout time seems too high'] // in minutes, max 5 hours
    },
    sleepHours: {
        type: Number,
        required: [true, 'Sleep hours is required'],
        min: [0, 'Sleep cannot be negative'],
        max: [24, 'Cannot sleep more than 24 hours']
    },
    productivityScore: {
        type: Number,
        required: [true, 'Productivity score is required'],
        min: [1, 'Minimum score is 1'],
        max: [10, 'Maximum score is 10']
    },
    // Optional fields
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
        trim: true,
        default: ''
    },
    mood: {
        type: String,
        enum: ['excellent', 'good', 'okay', 'bad', 'terrible'],
        default: 'okay'
    },
    // Calculated fields
    totalActiveTime: {
        type: Number, // in minutes, calculated from other metrics
        default: 0
    }
}, {
    timestamps: true,
    collection: 'entries'
});

// Compound index to prevent duplicate entries for same user on same date
EntrySchema.index({ user: 1, date: 1 }, { unique: true });

// Additional indexes for queries
EntrySchema.index({ date: -1 });
EntrySchema.index({ user: 1, createdAt: -1 });

// Pre-save middleware to calculate total active time
EntrySchema.pre('save', function (next) {
    // Calculate total active time (workout + conscious activities)
    this.totalActiveTime = this.workoutTime + this.consciousTimepass;
    next();
});

// Static methods for common queries
EntrySchema.statics.findByDateRange = function (startDate, endDate, user = null) {
    const query = {
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    };

    if (user) {
        query.user = user;
    }

    return this.find(query).sort({ date: -1 });
};

EntrySchema.statics.getTodaysEntries = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.find({
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });
};

EntrySchema.statics.getComparisonData = function (metric, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return this.aggregate([
        {
            $match: {
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    user: '$user',
                    date: '$date'
                },
                value: { $first: `$${metric}` }
            }
        },
        {
            $sort: { '_id.date': 1 }
        }
    ]);
};

// Virtual for formatted date
EntrySchema.virtual('formattedDate').get(function () {
    return this.date.toISOString().split('T')[0];
});

// Virtual for productivity grade
EntrySchema.virtual('productivityGrade').get(function () {
    if (this.productivityScore >= 9) return 'A+';
    if (this.productivityScore >= 8) return 'A';
    if (this.productivityScore >= 7) return 'B';
    if (this.productivityScore >= 6) return 'C';
    if (this.productivityScore >= 5) return 'D';
    return 'F';
});

// Export model
export default mongoose.models.Entry || mongoose.model('Entry', EntrySchema);