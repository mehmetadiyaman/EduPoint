require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Önce mevcut admin kullanıcısını kontrol et
        const existingAdmin = await User.findOne({ username: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin kullanıcısı zaten mevcut!');
            process.exit(0);
        }

        // Yeni admin kullanıcısı oluştur
        const admin = new User({
            username: 'admin',
            password: 'admin123', // Bu şifre otomatik olarak hashlenecek
            role: 'admin'
        });

        await admin.save();
        console.log('Admin kullanıcısı başarıyla oluşturuldu!');
        process.exit(0);
    } catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}

createAdmin(); 