const express = require('express');
const router = express.Router();
const { requireLogin} = require('../middleware/auth');
const patientsController = require('../controllers/patientsControllers')

// POST ROUTES
router.post('/signup', patientsController.signUp);
router.post('/login', patientsController.signIn);
router.post('/book', requireLogin, patientsController.bookAppointment);
router.post('/update-language', requireLogin, patientsController.editLanguage);
router.post('/update-location', requireLogin, patientsController.editLocation);
router.post('/delete-account', requireLogin, patientsController.accountDelete);
router.post('/respond', requireLogin, patientsController.appointmentResponse);

// GET ROUTES
router.get('/patient_dashboard', requireLogin, patientsController.patientDashboard);
router.get('/appointments', requireLogin, patientsController.appointmentStatus);
router.get('/providers_list', requireLogin, patientsController.providersList);
router.get('/appointment_history', requireLogin, patientsController.appointments);
router.get('/chat', requireLogin, patientsController.chat);
router.get('/patientProfile', requireLogin, patientsController.profile);
router.get('/logout', patientsController.logout);


module.exports = router;
