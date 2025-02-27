const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// Tüm galeri görsellerini listele
router.get('/', galleryController.getAllImages);

// Kategoriye göre görselleri getir
router.get('/category/:category', galleryController.getImagesByCategory);

module.exports = router; 