const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Announcement = require('../models/Announcement');
const Gallery = require('../models/Gallery');

// Ana Sayfa
router.get('/', async (req, res) => {
    try {
        const [courses, teachers, announcements] = await Promise.all([
            Course.find({ featured: true }).limit(6),
            Teacher.find().limit(4),
            Announcement.find({ important: true }).limit(3)
        ]);

        res.render('pages/index', {
            currentPage: 'home',
            courses: courses,
            teachers,
            announcements
        });
    } catch (error) {
        console.error('Ana sayfa hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Kurslar Sayfası
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.render('pages/courses', { 
            currentPage: 'courses',
            courses 
        });
    } catch (error) {
        res.status(500).send('Sunucu hatası');
    }
});

// Öğretmenler Sayfası
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.render('pages/teachers', { 
            currentPage: 'teachers',
            teachers 
        });
    } catch (error) {
        res.status(500).send('Sunucu hatası');
    }
});

// Duyurular Sayfası
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort('-createdAt');
        res.render('pages/announcements', { announcements });
    } catch (error) {
        res.status(500).send('Sunucu hatası');
    }
});

// Galeri Sayfası
router.get('/gallery', async (req, res) => {
    try {
        const images = await Gallery.find();
        const categories = await Gallery.distinct('category');
        res.render('pages/gallery', { 
            currentPage: 'gallery',
            images, 
            categories,
            selectedCategory: 'all'
        });
    } catch (error) {
        res.status(500).send('Sunucu hatası');
    }
});

// Hakkımızda Sayfası
router.get('/about', (req, res) => {
    res.render('pages/about', {
        currentPage: 'about'
    });
});

// İletişim Sayfası
router.get('/contact', (req, res) => {
    res.render('pages/contact', {
        currentPage: 'contact'
    });
});

module.exports = router; 