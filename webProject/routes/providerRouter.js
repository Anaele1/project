const express = require('express');
const router = express.Router();
const db = require('../database');
const session = require('express-session');
const { requireLogin } = require('../middleware/auth');
const bcrypt = require('bcrypt');
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
                    };
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


//==================================================================================================
                             // GET METHOD
//admin dashboard route
router.get('/provider_dashboard', requireLogin, (req, res) => {
    if (!req.session.user) {
        return res.redirect('/account/user')
    }
    res.render('providersDashboard', { user: req.session.user })
});

// Pending patients appointment
router.get('/pending', requireLogin, (req, res) => {
    const sql = `
    SELECT p.first_name AS patient_first_name, p.last_name AS patient_last_name, a.appointment_id AS appointment_id, a.appointment_date, a.appointment_time, a.status
    FROM appointment a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.provider_id = ? AND a.status = 'pending'
    `;
    console.log("Provider ID from session:", req.session.user.id, typeof req.session.user.id);

    db.query(sql, [req.session.user.id], (err, appointment) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to fetch appointments');
            return res.redirect('/providers/provider_dashboard');
        }
        res.render('providersDashboard', {
            appointments: appointment,
            user: req.session.user,
            messages: req.flash()
        });
    });
});

// Accepted patients appointment
router.get('/accepted', requireLogin, (req, res) => {
    const sql = `
    SELECT p.first_name AS patient_first_name, p.last_name AS patient_last_name, a.appointment_id AS appointment_id, a.appointment_date, a.appointment_time, a.status
    FROM appointment a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.provider_id = ? AND a.status = 'accepted'
    `;
    console.log("Provider ID from session:", req.session.user.id, typeof req.session.user.id);

    db.query(sql, [req.session.user.id], (err, appointment) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to fetch appointments');
            return res.redirect('/providers/provider_dashboard');
        }
        res.render('providersDashboard', {
            appointments: appointment,
            user: req.session.user,
            messages: req.flash()
        });
    });
});

// Cancelled Patients appointment
router.get('/cancelled', requireLogin, (req, res) => {
    const sql = `
    SELECT p.first_name AS patient_first_name, p.last_name AS patient_last_name, a.appointment_id AS appointment_id, a.appointment_date, a.appointment_time, a.status
    FROM appointment a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.provider_id = ? AND a.status = 'cancelled'
    `;
    console.log("Provider ID from session:", req.session.user.id, typeof req.session.user.id);

    db.query(sql, [req.session.user.id], (err, appointment) => {
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to fetch appointments');
            return res.redirect('/providers/provider_dashboard');
        }
        res.render('providersDashboard', {
            appointments: appointment,
            user: req.session.user,
            messages: req.flash()
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
