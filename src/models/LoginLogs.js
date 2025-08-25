/**
 * LoginLogs Model
 * Stores login and logout history for devices
 */

const mongoose = require('mongoose');

const loginLogsSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    loginTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    logoutTime: {
        type: Date,
        default: null
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'loginlogs'
});

// Static method to log user login
loginLogsSchema.statics.logLogin = async function(deviceId) {
    try {
        const loginLog = new this({
            deviceId: deviceId,
            loginTime: new Date()
        });
        
        await loginLog.save();
        return loginLog;
    } catch (error) {
        throw new Error(`Failed to log login: ${error.message}`);
    }
};

// Static method to log user logout
loginLogsSchema.statics.logLogout = async function(deviceId) {
    try {
        // Find the most recent login entry without logout time
        const loginLog = await this.findOneAndUpdate(
            { 
                deviceId: deviceId,
                logoutTime: null
            },
            {
                $set: {
                    logoutTime: new Date()
                }
            },
            {
                sort: { loginTime: -1 }, // Get the most recent login
                new: true
            }
        );
        
        return loginLog;
    } catch (error) {
        throw new Error(`Failed to log logout: ${error.message}`);
    }
};

// Static method to get login history for a device
loginLogsSchema.statics.getLoginHistory = async function(deviceId, limit = 50) {
    try {
        return await this.find({ deviceId })
            .sort({ loginTime: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        throw new Error(`Failed to get login history: ${error.message}`);
    }
};

// Static method to get active sessions (logged in but not logged out)
loginLogsSchema.statics.getActiveSessions = async function() {
    try {
        return await this.find({ logoutTime: null })
            .sort({ loginTime: -1 })
            .lean();
    } catch (error) {
        throw new Error(`Failed to get active sessions: ${error.message}`);
    }
};

// Static method to get login stats for a device
loginLogsSchema.statics.getLoginStats = async function(deviceId) {
    try {
        const stats = await this.aggregate([
            { $match: { deviceId: deviceId } },
            {
                $group: {
                    _id: '$deviceId',
                    totalLogins: { $sum: 1 },
                    firstLogin: { $min: '$loginTime' },
                    lastLogin: { $max: '$loginTime' },
                    completedSessions: {
                        $sum: {
                            $cond: [{ $ne: ['$logoutTime', null] }, 1, 0]
                        }
                    }
                }
            }
        ]);
        
        return stats.length > 0 ? stats[0] : null;
    } catch (error) {
        throw new Error(`Failed to get login stats: ${error.message}`);
    }
};

// Instance method to calculate session duration
loginLogsSchema.methods.getSessionDuration = function() {
    if (!this.logoutTime) return null; // Session still active
    
    return this.logoutTime.getTime() - this.loginTime.getTime();
};

// Instance method to check if session is active
loginLogsSchema.methods.isActiveSession = function() {
    return this.logoutTime === null;
};

// Create indexes for better performance
loginLogsSchema.index({ deviceId: 1, loginTime: -1 });
loginLogsSchema.index({ logoutTime: 1 });
loginLogsSchema.index({ loginTime: -1 });

const LoginLogs = mongoose.model('LoginLogs', loginLogsSchema);

module.exports = LoginLogs;