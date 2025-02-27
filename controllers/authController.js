const User = require('../models/User');

const authController = {
    // Login sayfasını göster
    getLogin: (req, res) => {
        if (req.session.isAdmin) {
            return res.redirect('/admin/dashboard');
        }
        res.render('admin/login');
    },

    // Login işlemi
    postLogin: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // .env'den admin bilgilerini kontrol et
            if (username === process.env.ADMIN_USERNAME && 
                password === process.env.ADMIN_PASSWORD) {
                
                // Session'a admin bilgisini kaydet
                req.session.isAdmin = true;
                
                res.redirect('/admin/dashboard');
            } else {
                return res.render('admin/login', { 
                    error: 'Geçersiz kullanıcı adı veya şifre' 
                });
            }
        } catch (error) {
            console.error('Login hatası:', error);
            res.render('admin/login', { 
                error: 'Bir hata oluştu, lütfen tekrar deneyin' 
            });
        }
    },

    // Logout işlemi
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
    }
};

module.exports = authController; 