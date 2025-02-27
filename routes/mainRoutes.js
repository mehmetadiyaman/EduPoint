const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Announcement = require('../models/Announcement');

// Ana sayfa
router.get('/', async (req, res) => {
    try {
        // Kursları ve öğretmenleri al
        const [courses, teachers, announcements] = await Promise.all([
            Course.find().limit(6),
            Teacher.find().limit(4),
            Announcement.find()
                .sort('-createdAt')  // En yeniden eskiye
                .limit(4)  // Son 4 duyuru
        ]);

        res.render('pages/index', {
            title: 'Ana Sayfa',
            courses,
            teachers,
            announcements
        });
    } catch (error) {
        console.error('Ana sayfa yükleme hatası:', error);
        res.render('pages/index', {
            title: 'Ana Sayfa',
            courses: [],
            teachers: [],
            announcements: []
        });
    }
});

// Diğer rotalar...

module.exports = router; 