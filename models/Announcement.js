const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Başlık zorunludur']
    },
    content: {
        type: String,
        required: [true, 'İçerik zorunludur']
    },
    image: {
        type: String
    },
    important: {
        type: Boolean,
        default: false
    },
    expiryDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema); 