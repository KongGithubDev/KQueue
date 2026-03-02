const mongoose = require('mongoose');

const queueItemSchema = new mongoose.Schema({
    position: { type: Number, default: 0 },
    projectName: { type: String, required: true, trim: true },
    nickname: { type: String, default: '', trim: true },
    classroom: { type: String, default: '', trim: true },
    boardType: {
        type: String,
        enum: ['ESP32', 'ESP8266', 'Arduino', 'Raspberry Pi', 'Other'],
        default: 'ESP32'
    },
    features: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    contactType: {
        type: String,
        enum: ['Instagram', 'Line', 'Facebook', 'Phone', 'Email', 'Other'],
        default: 'Instagram'
    },
    budget: { type: String, default: '' },
    deadline: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'waiting_parts', 'hardware_issue', 'in_progress', 'done'],
        default: 'pending'
    },
    submittedBy: { type: String, default: 'client' }, // 'client' or 'admin'
}, {
    timestamps: true
});

module.exports = mongoose.model('QueueItem', queueItemSchema);
