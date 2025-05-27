import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        enum: ['pankaj', 'sujal'],
        unique: true,
        lowercase: true,
        trim: true
    },
    displayName: {
        type: String,
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    config: {
        theme: {
            type: String,
            default: 'light',
            enum: ['light', 'dark']
        },
        notifications: {
            type: Boolean,
            default: true
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    stats: {
        totalEntries: {
            type: Number,
            default: 0
        },
        streak: {
            type: Number,
            default: 0
        },
        lastEntryDate: {
            type: Date,
            default: null
        }
    }
}, {
    timestamps: true,
    collection: 'users'
});

// Create indexes for better performance
UserSchema.index({ username: 1 });

// Virtual for getting user's latest stats
UserSchema.virtual('isActive').get(function () {
    if (!this.stats.lastEntryDate) return false;
    const daysDiff = Math.floor((new Date() - this.stats.lastEntryDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 1; // Active if logged entry within last day
});

// Export model
export default mongoose.models.User || mongoose.model('User', UserSchema);