const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kurs adı zorunludur'],
        unique: true,
        trim: true,
        minlength: [3, 'Kurs adı en az 3 karakter olmalıdır']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'Kurs açıklaması zorunludur'],
        trim: true,
        minlength: [10, 'Kurs açıklaması en az 10 karakter olmalıdır']
    },
    image: {
        type: String,
        required: [true, 'Kurs resmi zorunludur']
    },
    duration: {
        type: Number,
        min: [1, 'Kurs süresi en az 1 saat olmalıdır']
    },
    category: {
        type: String,
        required: [true, 'Kurs kategorisi zorunludur'],
        enum: {
            values: ['YKS', 'LGS', 'YDS'],
            message: '{VALUE} geçerli bir kategori değil'
        }
    },
    features: {
        type: [String],
        default: []
    },
    featured: {
        type: Boolean,
        default: false
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
courseSchema.pre('save', function(next) {
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

// Hata mesajlarını Türkçeleştirme
courseSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('Bu kurs adı zaten kullanılıyor'));
    } else {
        next(error);
    }
});

// Sık sorgulanan alanlara index ekleyelim
courseSchema.index({ name: 1, category: 1, active: 1 });
courseSchema.index({ slug: 1 });

module.exports = mongoose.model('Course', courseSchema); 