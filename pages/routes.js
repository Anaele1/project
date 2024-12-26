const express = require('express');
const router = express.Router();
//const expressLayouts = require('express-ejs-layouts');
//router.use(expressLayouts);



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

  //provider dashboard page route
  router.get('/provider', (req, res) => {
    res.render('prodash');
  });

  //provider dashboard page route
  router.get('/patient', (req, res) => {
    res.render('patdash');
  });

  // admin dashboard page route
  router.get('/admin', (req, res) => {
    res.render('admdash');
  });

  // aidoc AI  page route
  router.get('/aidoc', (req, res) => {
    res.render('aidoc');
  });
  
  module.exports = router;
  
