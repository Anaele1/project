const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');
const providerController = require('../controllers/providerController');

//===================================================================================================
                             // POST METHOD
router.post('/signup', providerController.signUp);
router.post('/login', providerController.signIn);
router.post('/update-specialty', requireLogin, providerController.editSpecialty);
router.post('/update-location', requireLogin, providerController.editLocation);
router.post('/update-language', requireLogin, providerController.editLanguage);
router.post('/delete-account', requireLogin, providerController.providerAccountDelete);
router.post('/respond', requireLogin, providerController.appointmentResponse);

router.get('/provider_dashboard', requireLogin, providerController.dashboard);
router.get('/appointments', requireLogin, providerController.providerAppointments);
router.get('/providerProfile', requireLogin, providerController.profile);
router.get('/myPatients', requireLogin, providerController.patientsList);
router.get('/chat', requireLogin, providerController.chat);
router.get('/logout', providerController.logout);
                           
module.exports = router;
