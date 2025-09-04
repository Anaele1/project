const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../database');
const { requireLogin } = require('../middleware/auth');


//home route
router.get('/home', (req, res) => {
    res.render('home')
});

//user account routes
router.get('/user', (req, res) => {
    res.render('account')
});

//logout patient route
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out.' });
        }
        res.redirect('/account/user');
    });
});

module.exports = router;