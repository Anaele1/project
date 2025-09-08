function requireLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/account/user');
    }
}
module.exports = { requireLogin };