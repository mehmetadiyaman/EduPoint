const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const slugify = require('slugify');
const cloudinary = require('cloudinary');

const adminController = {
    // Login sayfasını göster
    getLogin: (req, res) => {
        if (req.session.isAdmin) {
            return res.redirect('/admin/dashboard');
        }
        res.render('admin/login', { layout: false });
    },

    // Login işlemi
    postLogin: (req, res) => {
        const { username, password } = req.body;
        if (username === process.env.ADMIN_USERNAME && 
            password === process.env.ADMIN_PASSWORD) {
            req.session.isAdmin = true;
            req.flash('success', 'Başarıyla giriş yaptınız');
            res.redirect('/admin/dashboard');
        } else {
            res.render('admin/login', { 
                layout: false,
                error: 'Geçersiz kullanıcı adı veya şifre' 
            });
        }
    },

    // Dashboard
    getDashboard: async (req, res) => {
        try {
            const [courseCount, teacherCount, announcementCount, galleryCount] = 
                await Promise.all([
                    Course.countDocuments(),
                    Teacher.countDocuments(),
                    Announcement.countDocuments(),
                    Gallery.countDocuments()
                ]);

            res.render('admin/dashboard', {
                title: 'Dashboard',
                currentPage: 'dashboard',
                courseCount,
                teacherCount,
                announcementCount,
                galleryCount
            });
        } catch (error) {
            req.flash('error', 'Bir hata oluştu');
            res.redirect('/admin/dashboard');
        }
    },

    // Logout
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
    },

    // Kurs yönetimi
    getCourses: async (req, res) => {
        try {
            const courses = await Course.find().sort('-createdAt');
            res.render('admin/courses', {
                title: 'Kurs Yönetimi',
                currentPage: 'courses',
                courses
            });
        } catch (error) {
            req.flash('error', 'Kurslar listelenirken bir hata oluştu');
            res.redirect('/admin/dashboard');
        }
    },

    createCourse: async (req, res) => {
        try {
            const { name, description, duration, category, features } = req.body;
            
            // Form validasyonu
            if (!name || !description || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Kurs adı, açıklama ve kategori zorunludur'
                });
            }

            // Özellikleri işle
            const featuresList = features ? 
                features.split('\n').map(f => f.trim()).filter(f => f.length > 0) : 
                [];

            // Kurs oluştur
            const course = await Course.create({
                name,
                description,
                duration: duration ? parseInt(duration) : null,
                category,
                image: req.file.path,
                features: featuresList,
                active: true
            });

            res.json({
                success: true,
                message: 'Kurs başarıyla eklendi',
                course
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: messages.join(', ')
                });
            }

            res.status(500).json({
                success: false,
                message: 'Kurs eklenirken bir hata oluştu: ' + error.message
            });
        }
    },

    updateCourse: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, duration, category, features } = req.body;

            // Zorunlu alan kontrolü
            if (!name || !description || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Kurs adı, açıklama ve kategori zorunludur'
                });
            }

            const updateData = {
                name,
                description,
                category,
                duration: duration || null,
                features: features ? features.split('\n').map(f => f.trim()).filter(f => f) : []
            };

            // Eğer yeni resim yüklendiyse
            if (req.file) {
                updateData.image = req.file.path;
            }

            const course = await Course.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Kurs bulunamadı'
                });
            }

            res.json({
                success: true,
                message: 'Kurs başarıyla güncellendi',
                course
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: messages.join(', ')
                });
            }

            res.status(500).json({
                success: false,
                message: 'Kurs güncellenirken bir hata oluştu'
            });
        }
    },

    deleteCourse: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Kurs bulunamadı'
                });
            }

            // Cloudinary'den resmi sil
            if (course.image) {
                const publicId = course.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            await course.deleteOne();

            res.json({
                success: true,
                message: 'Kurs başarıyla silindi'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Kurs silinirken bir hata oluştu'
            });
        }
    },

    // Öğretmen yönetimi
    getTeachers: async (req, res) => {
        try {
            const teachers = await Teacher.find().sort('name');
            res.render('admin/teachers', {
                title: 'Öğretmen Yönetimi',
                currentPage: 'teachers',
                teachers
            });
        } catch (error) {
            req.flash('error', 'Öğretmenler listelenirken bir hata oluştu');
            res.redirect('/admin/dashboard');
        }
    },

    createTeacher: async (req, res) => {
        try {
            const { 
                name, title, branch, education, 
                experience, description, socialMedia 
            } = req.body;

            // Form validasyonu
            if (!name || !title || !branch || !education || !experience || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'Tüm zorunlu alanları doldurun'
                });
            }

            // Açıklama uzunluğu kontrolü
            if (description.length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Açıklama en az 10 karakter olmalıdır'
                });
            }

            // Resim kontrolü
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Lütfen bir fotoğraf yükleyin'
                });
            }

            const teacher = await Teacher.create({
                name,
                title,
                branch,
                education,
                experience: parseInt(experience),
                description,
                image: req.file.path,
                socialMedia: {
                    linkedin: socialMedia?.linkedin || '',
                    twitter: socialMedia?.twitter || '',
                    instagram: socialMedia?.instagram || ''
                }
            });

            res.json({
                success: true,
                message: 'Öğretmen başarıyla eklendi',
                teacher
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: messages.join(', ')
                });
            }

            res.status(500).json({
                success: false,
                message: 'Öğretmen eklenirken bir hata oluştu'
            });
        }
    },

    // Öğretmen detayını getir
    getTeacherById: async (req, res) => {
        try {
            const teacher = await Teacher.findById(req.params.id);
            
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Öğretmen bulunamadı'
                });
            }

            res.json({
                success: true,
                teacher
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Öğretmen bilgileri alınırken bir hata oluştu'
            });
        }
    },

    updateTeacher: async (req, res) => {
        try {
            const { 
                id, name, title, branch, education, 
                experience, description, socialMedia 
            } = req.body;

            const updateData = {
                name,
                title,
                branch,
                education,
                experience: parseInt(experience),
                description,
                socialMedia: {
                    linkedin: socialMedia?.linkedin || '',
                    twitter: socialMedia?.twitter || '',
                    instagram: socialMedia?.instagram || ''
                }
            };

            if (req.file) {
                updateData.image = req.file.path;
            }

            const teacher = await Teacher.findByIdAndUpdate(
                id, 
                updateData,
                { new: true, runValidators: true }
            );

            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Öğretmen bulunamadı'
                });
            }

            res.json({
                success: true,
                message: 'Öğretmen başarıyla güncellendi',
                teacher
            });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: messages.join(', ')
                });
            }

            res.status(500).json({
                success: false,
                message: 'Öğretmen güncellenirken bir hata oluştu'
            });
        }
    },

    deleteTeacher: async (req, res) => {
        try {
            const teacher = await Teacher.findByIdAndDelete(req.params.id);
            
            if (!teacher) {
                return res.status(404).json({
                    success: false,
                    message: 'Öğretmen bulunamadı'
                });
            }

            res.json({
                success: true,
                message: 'Öğretmen başarıyla silindi'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Öğretmen silinirken bir hata oluştu'
            });
        }
    },

    // Duyuru yönetimi
    getAnnouncements: async (req, res) => {
        try {
            const announcements = await Announcement.find().sort('-createdAt');
            res.render('admin/announcements', {
                announcements,
                title: 'Duyuru Yönetimi'
            });
        } catch (error) {
            res.status(500).send('Sunucu hatası');
        }
    },

    createAnnouncement: async (req, res) => {
        try {
            const { title, content, important, expiryDate } = req.body;
            
            if (!title || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'Başlık ve içerik alanları zorunludur'
                });
            }

            const announcementData = {
                title,
                content,
                important: !!important,
                expiryDate: expiryDate || null
            };

            if (req.file) {
                announcementData.image = req.file.path;
            }

            const announcement = await Announcement.create(announcementData);

            res.json({
                success: true,
                message: 'Duyuru başarıyla oluşturuldu',
                announcement
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Duyuru oluşturulurken bir hata oluştu'
            });
        }
    },

    // Duyuru güncelle
    updateAnnouncement: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content, important, expiryDate } = req.body;
            
            // Form validasyonu
            if (!title || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'Başlık ve içerik alanları zorunludur'
                });
            }

            const updateData = {
                title,
                content,
                important: !!important,
                expiryDate: expiryDate || null
            };

            // Eğer yeni dosya yüklendiyse
            if (req.file) {
                updateData.image = req.file.path;
            }

            const announcement = await Announcement.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!announcement) {
                return res.status(404).json({
                    success: false,
                    message: 'Duyuru bulunamadı'
                });
            }

            res.json({
                success: true,
                message: 'Duyuru başarıyla güncellendi',
                announcement
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Duyuru güncellenirken bir hata oluştu'
            });
        }
    },

    // Duyuru sil
    deleteAnnouncement: async (req, res) => {
        try {
            await Announcement.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'Duyuru başarıyla silindi' });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: 'Duyuru silinirken bir hata oluştu' 
            });
        }
    },

    // Galeri yönetimi sayfasını göster
    getGalleryManagement: async (req, res) => {
        try {
            const images = await Gallery.find().sort('-createdAt');
            const categories = await Gallery.distinct('category');
            
            res.render('admin/gallery', {
                images,
                categories,
                title: 'Galeri Yönetimi'
            });
        } catch (error) {
            res.status(500).send('Sunucu hatası');
        }
    },

    // Yeni galeri öğesi oluştur
    createGalleryItem: async (req, res) => {
        try {
            const { title, category, description } = req.body;
            const image = req.file.path;

            await Gallery.create({
                title,
                category,
                description,
                image
            });

            req.flash('success', 'Resim başarıyla eklendi');
            res.redirect('/admin/gallery');
        } catch (error) {
            req.flash('error', 'Resim eklenirken bir hata oluştu');
            res.redirect('/admin/gallery');
        }
    },

    // Galeri öğesini güncelle
    updateGalleryItem: async (req, res) => {
        try {
            const { title, category, description } = req.body;
            const updateData = { title, category, description };
            
            if (req.file) {
                // Eski resmi Cloudinary'den sil
                const oldItem = await Gallery.findById(req.params.id);
                if (oldItem && oldItem.image) {
                    const publicId = oldItem.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
                updateData.image = req.file.path;
            }

            const updatedItem = await Gallery.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            if (!updatedItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Galeri öğesi bulunamadı'
                });
            }
            
            res.json({
                success: true,
                message: 'Resim başarıyla güncellendi',
                item: updatedItem
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Güncelleme sırasında bir hata oluştu'
            });
        }
    },

    // Galeri öğesini sil
    deleteGalleryItem: async (req, res) => {
        try {
            await Gallery.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'Resim başarıyla silindi' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Silme sırasında bir hata oluştu' });
        }
    },

    // Duyuru detayını getir
    getAnnouncementById: async (req, res) => {
        try {
            const announcement = await Announcement.findById(req.params.id);

            if (!announcement) {
                return res.status(404).json({
                    success: false,
                    message: 'Duyuru bulunamadı'
                });
            }

            res.json({
                success: true,
                announcement
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Duyuru bilgileri alınırken bir hata oluştu'
            });
        }
    },

    // Kurs detayını getir
    getCourseById: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Kurs bulunamadı'
                });
            }

            res.json({
                success: true,
                course
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Kurs bilgileri alınırken bir hata oluştu'
            });
        }
    },

    // Galeri öğesi detayını getir
    getGalleryById: async (req, res) => {
        try {
            const galleryItem = await Gallery.findById(req.params.id);
            
            if (!galleryItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Galeri öğesi bulunamadı'
                });
            }

            res.json({
                success: true,
                galleryItem
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Galeri öğesi bilgileri alınırken bir hata oluştu'
            });
        }
    }
};

module.exports = adminController; 