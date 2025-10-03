// routes/providersRouters.js
const express = require('express');
const router = express.Router();
const db = require('../database');
const session = require('express-session');
const { requireLogin } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const { verify } = require('jsonwebtoken');
const saltRounds = 10;

//===================================================================================================
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
        const sql = 'INSERT INTO providers (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
        db.query(sql, [first_name, last_name, email, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            } else {
                req.flash('success', 'Successfuly Signed Up');
                res.redirect('/account/provider_a');
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

    const sql = 'SELECT * FROM providers WHERE email = ?';
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
                        id: user.provider_id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email,
                        specialty: user.specialty,
                        verify: user.verify,
                        language: user.language,
                        location: user.location,
                    };
                    req.flash('success', 'Successfuly Logged in');
                    res.redirect('/providers/provider_dashboard');
                });
            } else {
                res.status(401).json({ error: 'Invalid email or password.' });
            }
        } else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    });
});

// Responding to appointment
router.post('/respond', requireLogin, (req, res) => {
    const { appointmentId, action } = req.body;
    console.log("Appointment ID:", appointmentId);
    console.log("Action:", action)
    const status = action === 'accept' ? 'accepted' : 'cancelled';
    console.log("New status:", status);
    const sql = 'UPDATE appointment SET status = ? WHERE appointment_id = ?';
    db.query(sql, [status, appointmentId], (err, result) => {
        console.log("SQL Result:", result);
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to update appointment');
            return res.redirect('/providers/provider_dashboard');
        }
        req.flash('success', `Appointment ${status}`);
        res.redirect('/providers/provider_dashboard');
    });
});

// Update provider's specialty
router.post('/update-specialty', requireLogin, (req, res) => {
    const { providerId, specialty } = req.body;
    if (!providerId || !specialty) {
        req.flash('error', 'Provider ID and specialty are required.');
        return res.redirect('/providers/provider_dashboard');
    }
    const sql = 'UPDATE providers SET specialty = ? WHERE provider_id = ?';
    db.query(sql, [specialty, providerId], (err, result) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to update specialty.');
            return res.redirect('/providers/provider_dashboard');
        }
        req.flash('success', 'Specialty updated successfully.');
        res.redirect('/providers/provider_dashboard');
    });
});

// Update provider's location
router.post('/update-location', requireLogin, (req, res) => {
    const { providerId, location } = req.body;
    if (!providerId || !location) {
        req.flash('error', 'Provider ID or location column are required.');
        return res.redirect('/providers/provider_dashboard');
    }
    const sql = 'UPDATE providers SET location = ? WHERE provider_id = ?';
    db.query(sql, [location, providerId], (err, result) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to add location.');
            return res.redirect('/providers/provider_dashboard');
        }
        req.flash('success', 'location added successfully.');
        res.redirect('/providers/provider_dashboard');
    });
});

// Update provider's language
router.post('/update-language', requireLogin, (req, res) => {
    const { providerId, language } = req.body;
    if (!providerId || !language) {
        req.flash('error', 'Provider ID or language column are required.');
        return res.redirect('/providers/provider_dashboard');
    }
    const sql = 'UPDATE providers SET language = ? WHERE provider_id = ?';
    db.query(sql, [language, providerId], (err, result) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to add language.');
            return res.redirect('/providers/provider_dashboard');
        }
        req.flash('success', 'language added successfully.');
        res.redirect('/providers/provider_dashboard');
    });
});

// Delete provider's account
router.post('/delete-account', requireLogin, (req, res) => {
    const { providerId } = req.body;
    if (!providerId) {
        req.flash('error', 'Provider ID is required.');
        return res.redirect('/providers/provider_dashboard');
    }

    // First, delete all appointments for the provider
    const deleteAppointmentsSql = 'DELETE FROM appointment WHERE provider_id = ?';
    db.query(deleteAppointmentsSql, [providerId], (err, result) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to delete appointments.');
            return res.redirect('/providers/provider_dashboard');
        }

        // Then, delete the provider
        const deleteProviderSql = 'DELETE FROM providers WHERE provider_id = ?';
        db.query(deleteProviderSql, [providerId], (err, result) => {
            if (err) {
                console.log(err);
                req.flash('error', 'Failed to delete account.');
                return res.redirect('/providers/provider_dashboard');
            }
            req.session.destroy(err => {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Failed to log out.');
                    return res.redirect('/providers/provider_dashboard');
                }
                req.flash('success', 'Account deleted successfully.');
                res.redirect('/account/provider_a');
            });
        });
    });
});

//==================================================================================================
                             // GET METHOD
// Dashboard routes  
router.get('/provider_dashboard', requireLogin, (req, res) => {
    if (!req.session.user) {
        return res.redirect('/account/user');
    }
    // Fetch provider's specialty
    const sql = 'SELECT specialty FROM providers WHERE provider_id = ?';
    db.query(sql, [req.session.user.id], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/providers/provider_dashboard');
        }
        const specialty = result.length > 0 ? result[0].specialty : null;
        res.render('providersDashboard', {
            user: { ...req.session.user, specialty: specialty},
            status: '',
            appointments: '',
            messages: req.flash()
        });
    });
});

//Appointments status filter 
router.get('/appointments', requireLogin, (req, res) => {
    const status = req.query.status || 'pending';
    if (!['pending', 'accepted', 'cancelled'].includes(status)) {
        req.flash('error', 'Invalid status');
        return res.redirect('/providers/provider_dashboard');
    }

    const sql = `
        SELECT p.first_name AS patient_first_name, p.last_name AS patient_last_name,
               a.appointment_id AS appointment_id, a.appointment_date, a.appointment_time, a.status
        FROM appointment a
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE a.provider_id = ? AND a.status = ?
    `;

    db.query(sql, [req.session.user.id, status], (err, appointments) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to fetch appointments');
            return res.redirect('/providers/provider_dashboard');
        }
        res.render('providersDashboard', {
            appointments: appointments,
            user: req.session.user,
            messages: req.flash(),
            status: status
        });
    });
});

//logout admin
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out.' });
        }
        res.redirect('/account/provider_a');
    });
});

//==================================================================================================
                             // UPDATE METHOD
//=====================================================================================================
                             // DELETE METHOD



module.exports = router;
