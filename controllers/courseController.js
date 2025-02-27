const Course = require('../models/Course');

const courseController = {
    // Web tarafı için kurs işlemleri
    getAllCourses: async (req, res) => {
        try {
            const courses = await Course.find({ active: true })
                .select('name description image category')
                .lean()
                .limit(20);

            res.render('pages/courses', {
                title: 'Kurslarımız',
                currentPage: 'courses',
                courses
            });
        } catch (error) {
            console.error('Kurs listesi hatası:', error);
            req.flash('error', 'Kurslar yüklenirken bir hata oluştu');
            res.redirect('/');
        }
    },

    getCourseBySlug: async (req, res) => {
        try {
            const course = await Course.findOne({ 
                slug: req.params.slug,
                active: true 
            });

            if (!course) {
                return res.status(404).render('pages/404', {
                    title: 'Kurs Bulunamadı',
                    currentPage: 'courses'
                });
            }

            res.render('pages/course-detail', {
                title: course.name,
                currentPage: 'courses',
                course
            });
        } catch (error) {
            console.error('Kurs detay hatası:', error);
            req.flash('error', 'Kurs detayları yüklenirken bir hata oluştu');
            res.redirect('/courses');
        }
    },

    getCoursesByCategory: async (req, res) => {
        try {
            const courses = await Course.find({ 
                category: req.params.category,
                active: true 
            }).sort('-createdAt');
            
            res.render('pages/courses', {
                title: `${req.params.category} Kursları`,
                currentPage: 'courses',
                category: req.params.category,
                courses
            });
        } catch (error) {
            console.error('Kategori kursları hatası:', error);
            req.flash('error', 'Kurslar yüklenirken bir hata oluştu');
            res.redirect('/courses');
        }
    },

    // API Endpoints
    getFeaturedCourses: async (req, res) => {
        try {
            const courses = await Course.find({ 
                featured: true,
                active: true 
            }).limit(6);
            
            res.json({
                success: true,
                courses
            });
        } catch (error) {
            console.error('Öne çıkan kurslar hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Kurslar yüklenirken bir hata oluştu'
            });
        }
    },

    searchCourses: async (req, res) => {
        try {
            const { query } = req.query;
            
            const courses = await Course.find({
                $and: [
                    { active: true },
                    {
                        $or: [
                            { name: { $regex: query, $options: 'i' } },
                            { description: { $regex: query, $options: 'i' } },
                            { category: { $regex: query, $options: 'i' } }
                        ]
                    }
                ]
            }).limit(10);

            res.json({
                success: true,
                courses
            });
        } catch (error) {
            console.error('Kurs arama hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Arama yapılırken bir hata oluştu'
            });
        }
    }
};

module.exports = courseController; 