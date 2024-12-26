const express = require('express');
const routerp = express.Router();
const {authenticatePatient, registerPatient, registerProvider, authenticateProvider, registerAdmin, authenticateAdmin } = require('./auth');
const bcrypt = require('bcrypt');

// // REGISTER PATIENT
routerp.post('/register', async (req, res) => {
  try {
    const {firstname, email, password } = req.body;
    const patient = await registerPatient(firstname, email, password);
    if (!patient) return res.status(500).send('error registering patient');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('error 1 of 2');
  }
});

//LOGIN PATIENT
routerp.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    const patient = await authenticatePatient(email, password);
    if (!patient) return res.status(401).send('invalid email or password');
    req.session.patient = patient;
    res.redirect('/register');
  } catch (err) {
    console.error(err);
    res.status(500).send('error loggin in')
  }
});

// // REGISTER PROVIDER
routerp.post('/registerpro', async (req, res) => {
  try {
    const {firstname, specialty, email, password } = req.body;
    const provider = await registerProvider(firstname, specialty, email, password);
    if (!provider) return res.status(500).send('error registering provider');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('error 1 of 2');
  }
});

//LOGIN PROVIDER
routerp.post('/loginpro', async (req, res) => {
  try {
    const {specialty, email, password} = req.body;

    const provider = await authenticateProvider(specialty, email, password);
    if (!provider) return res.status(401).send('invalid email or password');
    req.session.provider = provider;
    res.redirect('/register');
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
routerp.post('/loginadm', async (req, res) => {
  try {
    const {codenum, email, password} = req.body;

    const admin = await authenticateAdmin(codenum, email, password);
    if (!admin) return res.status(401).send('invaliD email or password');
    req.session.admin = admin;
    res.redirect('/register');
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