const jwt = require('jsonwebtoken');

function requireLogin(req, res, next) {
    if (req.session.user) {
        req.user = req.session.user;
        next();
    } else {
        res.redirect('/account/users_patient_a');
    }
}

// JWT authentication
function JWT(req, res, next) {
  // JWT logic
  const token = req.cookies.token;
    if (!token) return res.redirect('/account/users_patient_a');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect('/account/users_patient_a');
    }
};


module.exports = { requireLogin, JWT};