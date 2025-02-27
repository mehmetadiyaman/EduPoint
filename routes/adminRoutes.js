const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin, isNotAdmin } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Auth routes
router.get('/login', isNotAdmin, adminController.getLogin);
router.post('/login', isNotAdmin, adminController.postLogin);
router.get('/logout', isAdmin, adminController.logout);

// Dashboard
router.get('/dashboard', isAdmin, adminController.getDashboard);

// Kurs yönetimi
router.get('/courses', isAdmin, adminController.getCourses);
router.post('/courses', isAdmin, uploadMiddleware, adminController.createCourse);
router.put('/courses/:id', isAdmin, uploadMiddleware, adminController.updateCourse);
router.delete('/courses/:id', isAdmin, adminController.deleteCourse);
router.get('/courses/:id', isAdmin, adminController.getCourseById);

// Öğretmen yönetimi
router.get('/teachers', isAdmin, adminController.getTeachers);
router.get('/teachers/:id', isAdmin, adminController.getTeacherById);
router.post('/teachers', isAdmin, uploadMiddleware, adminController.createTeacher);
router.put('/teachers/:id', isAdmin, uploadMiddleware, adminController.updateTeacher);
router.delete('/teachers/:id', isAdmin, adminController.deleteTeacher);

// Duyuru yönetimi
router.get('/announcements', isAdmin, adminController.getAnnouncements);
router.get('/announcements/:id', isAdmin, adminController.getAnnouncementById);
router.post('/announcements', isAdmin, uploadMiddleware, adminController.createAnnouncement);
router.put('/announcements/:id', isAdmin, uploadMiddleware, adminController.updateAnnouncement);
router.delete('/announcements/:id', isAdmin, adminController.deleteAnnouncement);

// Galeri yönetimi
router.get('/gallery', isAdmin, adminController.getGalleryManagement);
router.get('/gallery/:id', isAdmin, adminController.getGalleryById);
router.post('/gallery', isAdmin, uploadMiddleware, adminController.createGalleryItem);
router.put('/gallery/:id', isAdmin, uploadMiddleware, adminController.updateGalleryItem);
router.delete('/gallery/:id', isAdmin, adminController.deleteGalleryItem);

module.exports = router; 