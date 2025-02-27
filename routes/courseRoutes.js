const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Tüm kursları listele
router.get('/', courseController.getAllCourses);

// Kurs detayı
router.get('/:slug', courseController.getCourseBySlug);

// Kategori bazlı kurslar
router.get('/category/:category', courseController.getCoursesByCategory);

module.exports = router; 