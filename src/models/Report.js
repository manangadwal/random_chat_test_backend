/**
 * Report Model
 * Stores device reports with multiple reports per device in a single document
 * Simple structure: only report text and time
 */

const mongoose = require('mongoose');

// Schema for individual report entries
const reportEntrySchema = new mongoose.Schema({
    reportText: {
        type: String,
        required: true,
        trim: true
    },
    reportTime: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    _id: true // Each report entry gets its own ID
});

// Main report schema - one document per device_id
const reportSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    reports: [reportEntrySchema]
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'device_reports'
});

// Static method to add a new report to a device
reportSchema.statics.addReport = async function (deviceId, reportText) {
    try {
        const report = await this.findOneAndUpdate(
            { deviceId },
            {
                $push: {
                    reports: {
                        reportText: reportText,
                        reportTime: new Date()
                    }
                }
            },
            {
                new: true,
                upsert: true, // Create if doesn't exist
                runValidators: true
            }
        );
        return report;
    } catch (error) {
        throw new Error(`Failed to add report: ${error.message}`);
    }
};

// Static method to get reports for a device
reportSchema.statics.getDeviceReports = async function (deviceId) {
    try {
        return await this.findOne({ deviceId }).lean();
    } catch (error) {
        throw new Error(`Failed to get device reports: ${error.message}`);
    }
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;