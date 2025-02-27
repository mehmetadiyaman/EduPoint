const Teacher = require('../models/Teacher');

const teacherController = {
    // Tüm öğretmenleri getir
    getAllTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find({ active: true })
                .populate('courses')
                .sort('name');

            res.render('pages/teachers', {
                title: 'Öğretmenlerimiz',
                currentPage: 'teachers',
                teachers
            });
        } catch (error) {
            console.error('Öğretmen listesi hatası:', error);
            req.flash('error', 'Öğretmenler yüklenirken bir hata oluştu');
            res.redirect('/');
        }
    },

    // ID'ye göre öğretmen detayı
    getTeacherBySlug: async (req, res) => {
        try {
            const teacher = await Teacher.findOne({ 
                slug: req.params.slug,
                active: true 
            }).populate('courses');

            if (!teacher) {
                return res.status(404).render('pages/404', {
                    title: 'Öğretmen Bulunamadı',
                    currentPage: 'teachers'
                });
            }

            res.render('pages/teacher-detail', {
                title: teacher.name,
                currentPage: 'teachers',
                teacher
            });
        } catch (error) {
            console.error('Öğretmen detay hatası:', error);
            req.flash('error', 'Öğretmen bilgileri yüklenirken bir hata oluştu');
            res.redirect('/teachers');
        }
    },

    // Branşa göre öğretmenleri getir
    getTeachersByBranch: async (req, res) => {
        try {
            const teachers = await Teacher.find({ 
                branch: req.params.branch,
                active: true 
            }).populate('courses').sort('name');
            
            res.render('pages/teachers', {
                title: `${req.params.branch} Öğretmenleri`,
                currentPage: 'teachers',
                teachers,
                branch: req.params.branch
            });
        } catch (error) {
            console.error('Branş öğretmenleri hatası:', error);
            req.flash('error', 'Öğretmenler yüklenirken bir hata oluştu');
            res.redirect('/teachers');
        }
    }
};

module.exports = teacherController; 