function requireLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/account/users_patient_a');
    }
}
module.exports = { requireLogin };