const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Web tarafı için öğretmen rotaları
router.get('/', teacherController.getAllTeachers);
router.get('/:slug', teacherController.getTeacherBySlug);
router.get('/branch/:branch', teacherController.getTeachersByBranch);

module.exports = router; 