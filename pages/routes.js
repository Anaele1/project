const express = require('express');
const router = express.Router();


// Home page route
router.get('/', (req, res) => {
    res.render('home');
  });
  
  // About page route
router.get('/about', (req, res) => {
    res.render('about');
  });

  // Service page route
router.get('/register', (req, res) => {
    res.render('register');
  });
  
  // Login page route
  router.get('/login', (req, res) => {
    res.render('login');
  });

  // patient dashboard page route
  router.get('/patient', (req, res) => {
    res.render('patdash');
  });

  // provider dashboard page route
  router.get('/provider', (req, res) => {
    res.render('prodash');
  });

  // admin dashboard page route
  router.get('/admin', (req, res) => {
    res.render('admdash');
  });

  // aidoc AI  page route
  router.get('/ai', (req, res) => {
    res.render('aidoc');
  });
  
  module.exports = router;
  