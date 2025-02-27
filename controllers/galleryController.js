const Gallery = require('../models/Gallery');

const galleryController = {
    // Tüm görselleri getir
    getAllImages: async (req, res) => {
        try {
            const images = await Gallery.find().sort('-createdAt');
            const categories = await Gallery.distinct('category');
            
            res.render('gallery', { 
                images,
                categories,
                selectedCategory: 'all'
            });
        } catch (error) {
            console.error('Galeri görüntülenirken hata:', error);
            res.status(500).send('Sunucu hatası');
        }
    },

    // Kategoriye göre görselleri getir
    getImagesByCategory: async (req, res) => {
        try {
            const categories = await Gallery.distinct('category');
            const images = await Gallery.find({ 
                category: req.params.category 
            }).sort('-createdAt');
            
            res.render('gallery', { 
                images,
                categories,
                selectedCategory: req.params.category
            });
        } catch (error) {
            console.error('Kategori resimleri getirilirken hata:', error);
            res.status(500).send('Sunucu hatası');
        }
    }
};

module.exports = galleryController; 