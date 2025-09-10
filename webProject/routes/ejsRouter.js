const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../database');
const { requireLogin } = require('../middleware/auth');


//provider account 
router.get('/provider_a', (req, res) => {
    res.render('provider')
});

//patient account
router.get('/users_patient_a', (req, res) => {
    res.render('patient')
});

//admin account
router.get('/admin_a', (req, res) => {
    res.render('admin')
});

module.exports = router;