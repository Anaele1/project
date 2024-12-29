const express = require('express');
const routerp = express.Router();
const {authenticatePatient, registerPatient, registerProvider, authenticateProvider, registerAdmin, authenticateAdmin } = require('./auth');
const bcrypt = require('bcrypt');

// // REGISTER PATIENT
routerp.post('/register/patient', async (req, res) => {
  try {
    const {firstname, email, password } = req.body;
    const user = await registerPatient(firstname, email, password);
    if (!user) return res.render('register/patient', { message: 'Registration failed.'}); //status(500).send('error registering patient');
    res.redirect('/login', {message: 'Registration successful'});
  } catch (err) {
    console.error(err);
    res.status(500).send('error 1 of 2');
  }
});

//LOGIN PATIENT
routerp.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    const user = await authenticatePatient(email, password);
    if (!user) return res.status(401).send('invalid email or password');
    req.session.user = user;
    res.redirect('/register/patient');
  } catch (err) {
    console.error(err);
    res.status(500).send('error loggin in')
  }
});




// // REGISTER PROVIDER
routerp.post('/register/provider', async (req, res) => {
  try {
    const {firstname, specialty, email, password } = req.body;
    const provider = await registerProvider(firstname, specialty, email, password);
    if (!provider) return res.status(500).send('error registering provider');
    res.redirect('/login/provider');
  } catch (err) {
    console.error(err);
    res.status(500).send('error 1 of 2');
  }
});

//LOGIN PROVIDER
routerp.post('/login/provider', async (req, res) => {
  try {
    const {specialty, email, password} = req.body;

    const provider = await authenticateProvider(specialty, email, password);
    if (!provider) return res.status(401).send('invalid email or password');
    req.session.provider = provider;
    res.redirect('/prodash');
  } catch (err) {
    console.error(err);
    res.status(500).send('error loggin in')
  }
});

//  // REGISTER ADMIN
// routerp.post('/registeradm', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const admin = await registerAdmin(email, password);
//     if (!admin) return res.status(500).send('error registering admin');
//     res.redirect('/login');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('error 1 of 2');
//   }
// });

//LOGIN ADMIN
routerp.post('/login/admin', async (req, res) => {
  try {
    const {codenum, email, password} = req.body;

    const admin = await authenticateAdmin(codenum, email, password);
    if (!admin) return res.status(401).send('invaliD email or password');
    req.session.admin = admin;
    res.redirect('/register/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('error loggin in')
  }
});

//LOGOUT
routerp.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) 
      return
     res.status(500).send('error logging out');
     res.redirect('/login');
  });
});

module.exports = routerp;