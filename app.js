require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const compression = require('compression');

const app = express();

// Compression middleware'i en başta kullan
app.use(compression());

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express-ejs-layouts ayarları
app.use(expressLayouts);
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Flash messages
app.use(flash());

// Admin routes için özel middleware
app.use('/admin', (req, res, next) => {
    res.locals = {
        layout: 'admin/layout',
        title: 'Admin Panel',
        currentPage: req.path.split('/')[1] || 'dashboard',
        messages: {
            success: req.flash('success') || null,
            error: req.flash('error') || null
        }
    };
    next();
});

// Web routes için özel middleware
app.use('/', (req, res, next) => {
    if (!req.path.startsWith('/admin')) {
        res.locals = {
            layout: 'layouts/main',
            currentPage: req.path.split('/')[1] || 'home',
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        };
    }
    next();
});

// Routes
app.use('/admin', adminRoutes);
app.use('/', require('./routes/pageRoutes'));
app.use('/courses', require('./routes/courseRoutes'));
app.use('/teachers', teacherRoutes);
app.use('/gallery', require('./routes/galleryRoutes'));

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    res.locals.title = 'Admin Panel'; // Varsayılan başlık
    next();
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('pages/404', { 
        currentPage: '404',
        title: 'Sayfa Bulunamadı' 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/error', { 
        currentPage: 'error',
        title: 'Hata Oluştu',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    maxPoolSize: 10,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB Bağlantısı Başarılı'))
.catch(err => console.error('MongoDB Bağlantı Hatası:', err));

// Cloudinary yapılandırması
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary bağlantı testi
cloudinary.api.ping()
    .then(result => {
        console.log('Cloudinary bağlantısı başarılı:', result);
    })
    .catch(error => {
        console.error('Cloudinary bağlantı hatası:', error);
    });

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 