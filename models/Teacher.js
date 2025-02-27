const mongoose = require('mongoose');
const slugify = require('slugify');

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'İsim zorunludur'],
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Ünvan zorunludur'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Fotoğraf zorunludur']
    },
    branch: {
        type: String,
        required: [true, 'Branş zorunludur'],
        trim: true
    },
    education: {
        type: String,
        required: [true, 'Eğitim bilgisi zorunludur'],
        trim: true
    },
    experience: {
        type: Number,
        required: [true, 'Deneyim yılı zorunludur'],
        min: [0, 'Deneyim yılı 0 veya daha büyük olmalıdır']
    },
    description: {
        type: String,
        required: [true, 'Açıklama zorunludur'],
        trim: true,
        minlength: [10, 'Açıklama en az 10 karakter olmalıdır']
    },
    achievements: {
        type: [String],
        default: []
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    socialMedia: {
        linkedin: String,
        twitter: String,
        instagram: String
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Slug oluşturma
teacherSchema.pre('save', function(next) {
    if (!this.isModified('name')) {
        return next();
    }
    this.slug = slugify(this.name, {
        lower: true,
        strict: true,
        locale: 'tr'
    });
    next();
});

module.exports = mongoose.model('Teacher', teacherSchema); 