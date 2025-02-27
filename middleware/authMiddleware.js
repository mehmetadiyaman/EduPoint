// Admin kontrolü
const isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Admin değilse kontrolü
const isNotAdmin = (req, res, next) => {
    if (!req.session.isAdmin) {
        next();
    } else {
        res.redirect('/admin/dashboard');
    }
};

module.exports = {
    isAdmin,
    isNotAdmin
}; 