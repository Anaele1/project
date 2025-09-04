const express = require('express');
const router = express.Router();
const db = require('../database');
const session = require('express-session');
const { requireLogin } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//==================================================================================================
                            // POST METHOD
// Sign-Up Route 
router.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = 'INSERT INTO patients (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
        db.query(sql, [first_name, last_name, email, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            } else {
                res.redirect('/account/user');
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Error hashing password.' });
    }
});

//Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const sql = 'SELECT * FROM patients WHERE email = ?';
    db.query(sql, [email], async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        if (result.length > 0) {
            const user = result[0];
            // Compare provided password with hashed password
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                // Regenerate the session before storing user data
                req.session.regenerate(err => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ error: 'Error regenerating session.' });
                    }
                    // Store user in the new session
                    req.session.user = {
                        id: user.patient_id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email,
                    };
                    res.redirect('/patients/patient_dashboard');
                });
            } else {
                res.status(401).json({ error: 'Invalid email or password.' });
            }
        } else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    });
});

// Patient Book appointment with provider
router.post('/book', requireLogin, (req, res) => {
    const { providerId, date, time } = req.body;
    const patientId = req.session.user.id;
    const sql = 'INSERT INTO appointment (patient_id, provider_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, "pending")';
    db.query(sql, [patientId, providerId, date, time], (err, result) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to book appointment');
            return res.redirect('/patients/patient_dashboard');
        }
        req.flash('success', 'Appointment request sent!');
        res.redirect('/patients/patient_dashboard');
    });
});


//===================================================================================================
                            // GET METHOD
// View all providers on patient's dashboard
router.get('/patient_dashboard', requireLogin, (req, res) => {
    const providerSql = 'SELECT * FROM providers';
    const appointmentSql = `
        SELECT a.*, p.first_name as provider_first_name, p.last_name as provider_last_name, a.status
        FROM appointment a
        JOIN providers p ON a.provider_id = p.provider_id
        WHERE a.patient_id = ?
    `;
    db.query(providerSql, (err, providers) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to fetch providers');
            return res.redirect('/patients/patient_dashboard');
        }
        db.query(appointmentSql, [req.session.user.id], (err, appointments) => {
            if (err) {
                console.log(err);
                req.flash('error', 'Failed to fetch appointments');
                return res.redirect('/patients/patient_dashboard');
            }
            res.render('patientsDashboard', { providers, appointments, user: req.session.user, messages: req.flash() });
        });
    });
});

//===================================================================================================
                            // UPDATE METHOD
//====================================================================================================
                            // DELETE METHOD





module.exports = router;
