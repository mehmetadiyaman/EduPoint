const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    cdn_subdomain: true // CDN alt alan adını etkinleştir
});

// Cloudinary bağlantısını test et
cloudinary.api.ping()
    .then(result => {
        console.log('Cloudinary bağlantısı başarılı:', result);
        
        // Desteklenen formatları kontrol et
        return cloudinary.api.upload_presets();
    })
    .then(presets => {
        console.log('Desteklenen formatlar:', presets);
    })
    .catch(error => {
        console.error('Cloudinary bağlantı hatası:', error);
    });

module.exports = cloudinary; 