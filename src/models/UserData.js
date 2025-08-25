/**
 * UserData Model
 * Stores user information with device tracking and ban management
 */

const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    loginTime: {
        type: Date,
        default: null
    },
    logoutTime: {
        type: Date,
        default: null
    },
    activityTime: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now,
        required: true
    },
    isBan: {
        type: Boolean,
        default: false
    },
    banTimeStart: {
        type: Date,
        default: null
    },
    banTimeEnd: {
        type: Date,
        default: null
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'user_data'
});

// Static method to create or update user login
userDataSchema.statics.userLogin = async function(deviceId) {
    try {
        const userData = await this.findOneAndUpdate(
            { deviceId },
            {
                $set: {
                    loginTime: new Date(),
                    activityTime: new Date(),
                    logoutTime: null
                }
            },
            {
                new: true,
                upsert: true, // Create if doesn't exist
                runValidators: true
            }
        );
        return userData;
    } catch (error) {
        throw new Error(`Failed to login user: ${error.message}`);
    }
};

// Static method to handle user logout
userDataSchema.statics.userLogout = async function(deviceId) {
    try {
        const userData = await this.findOneAndUpdate(
            { deviceId },
            {
                $set: {
                    logoutTime: new Date()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );
        return userData;
    } catch (error) {
        throw new Error(`Failed to logout user: ${error.message}`);
    }
};

// Static method to update user activity
userDataSchema.statics.updateActivity = async function(deviceId) {
    try {
        const userData = await this.findOneAndUpdate(
            { deviceId },
            {
                $set: {
                    activityTime: new Date()
                }
            },
            {
                new: true,
                runValidators: true
            }
        );
        return userData;
    } catch (error) {
        throw new Error(`Failed to update activity: ${error.message}`);
    }
};

// Static method to ban user
userDataSchema.statics.banUser = async function(deviceId, banDuration = null) {
    try {
        const banStart = new Date();
        const banEnd = banDuration ? new Date(banStart.getTime() + banDuration) : null;
        
        const userData = await this.findOneAndUpdate(
            { deviceId },
            {
                $set: {
                    isBan: true,
                    banTimeStart: banStart,
                    banTimeEnd: banEnd
                }
            },
            {
                new: true,
                runValidators: true
            }
        );
        return userData;
    } catch (error) {
        throw new Error(`Failed to ban user: ${error.message}`);
    }
};

// Static method to unban user
userDataSchema.statics.unbanUser = async function(deviceId) {
    try {
        const userData = await this.findOneAndUpdate(
            { deviceId },
            {
                $set: {
                    isBan: false,
                    banTimeStart: null,
                    banTimeEnd: null
                }
            },
            {
                new: true,
                runValidators: true
            }
        );
        return userData;
    } catch (error) {
        throw new Error(`Failed to unban user: ${error.message}`);
    }
};

// Instance method to check if user is currently banned
userDataSchema.methods.isCurrentlyBanned = function() {
    if (!this.isBan) return false;
    
    // If no end time, it's permanent ban
    if (!this.banTimeEnd) return true;
    
    // Check if ban has expired
    return new Date() < this.banTimeEnd;
};

// Instance method to get remaining ban time
userDataSchema.methods.getRemainingBanTime = function() {
    if (!this.isCurrentlyBanned()) return 0;
    
    if (!this.banTimeEnd) return -1; // Permanent ban
    
    return this.banTimeEnd.getTime() - new Date().getTime();
};

// Create indexes for better performance
userDataSchema.index({ loginTime: -1 });
userDataSchema.index({ activityTime: -1 });
userDataSchema.index({ isBan: 1 });
userDataSchema.index({ banTimeEnd: 1 });

const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;