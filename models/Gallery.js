const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    image: {
        type: String,
        required: [true, 'Fotoğraf zorunludur']
    },
    category: {
        type: String,
        required: [true, 'Kategori zorunludur'],
        enum: {
            values: ['etkinlik', 'ogrenci', 'egitim', 'okul'],
            message: 'Geçersiz kategori seçimi'
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema); 