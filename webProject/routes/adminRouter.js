const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

//POST
router.post('/signup', adminController.signUp);
router.post('/login', adminController.signIn);
router.post('/appointments/delete', requireLogin, adminController.deleteUsersAppointment);
router.post('/patients/delete', requireLogin, adminController.deletePatient);
router.post('/providers/delete', requireLogin, adminController.deleteProviders);
router.post('/verify', requireLogin, adminController.providerVerificationUpdate);

//GET
router.get('/appointments', requireLogin, adminController.appointmentsBtwPatientsAndProviders);
router.get('/dashboard', requireLogin, adminController.admDashboard);
router.get('/logout', adminController.logout);

module.exports = router;
