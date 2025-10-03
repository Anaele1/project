// routes/adminRouter.js
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
    const { name, admin_code, email, password } = req.body;
    if (!name || !admin_code || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = 'INSERT INTO admin (name, admin_code, email, password) VALUES (?, ?, ?, ?)';
        db.query(sql, [name, admin_code, email, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            } else {
                req.flash('success', 'Successfuly Signed Up');
                res.redirect('/account/admin_a');
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

    const sql = 'SELECT * FROM admin WHERE email = ?';
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
                        id: user.admin_id,
                        name: user.name,
                        code: user.admin_code,
                        email: user.email,
                    };
                    req.flash('success', 'Successfuly Logged in');
                    res.redirect('/admins/dashboard');
                });
            } else {
                res.status(401).json({ error: 'Invalid email or password.' });
            }
        } else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    });
});

// POST: Delete an appointment by appointment_id
router.post('/appointments/delete', requireLogin, (req, res) => {
    const { appointment_id } = req.body;
    if (!appointment_id) {
        return res.status(400).json({ error: 'appointment_id is required.' });
    }

    const sql = 'DELETE FROM appointment WHERE appointment_id = ?';
    db.query(sql, [appointment_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        res.redirect('/admins/appointments');
    });
});
//===================================================================================================
                            // GET METHOD
// GET: Admin dashboard route
router.get('/dashboard', requireLogin, (req, res) => {
    if (!req.session.user) {
        return res.redirect('/account/admin_a');
    }

    // Fetch appointment status counts
    const statusCountsSql = `
        SELECT
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
        FROM appointment
    `;

    db.query(statusCountsSql, (err, statusCountsResult) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        const statusCounts = statusCountsResult[0];

        // Fetch all patients
        const patientsQuery = 'SELECT * FROM patients';
        db.query(patientsQuery, (err, patients) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: err.message });
            }
            // Fetch all patients without appointment
            const patientsWithoutAppointmentQuery = `
                SELECT p.*
                FROM patients p
                LEFT JOIN appointment a ON p.patient_id = a.patient_id
                WHERE a.patient_id IS NULL
            `;
            db.query(patientsWithoutAppointmentQuery, (err, patientsWithoutAppointment) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: err.message });
                }
                // Fetch all patients with appointment
                const patientsWithAppointmentQuery = `
                    SELECT DISTINCT p.*
                    FROM patients p
                    INNER JOIN appointment a ON p.patient_id = a.patient_id
                `;
                db.query(patientsWithAppointmentQuery, (err, patientsWithAppointment) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ error: err.message });
                    }
                    // Fetch all providers
                    const providersQuery = 'SELECT * FROM providers';
                    db.query(providersQuery, (err, providers) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ error: err.message });
                        }
                        // Fetch all providers without appointment
                        const providersWithoutAppointmentQuery = `
                            SELECT pr.*
                            FROM providers pr
                            LEFT JOIN appointment a ON pr.provider_id = a.provider_id
                            WHERE a.provider_id IS NULL
                        `;
                        db.query(providersWithoutAppointmentQuery, (err, providersWithoutAppointment) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({ error: err.message });
                            }
                            // Fetch all providers with appointment
                            const providersWithAppointmentQuery = `
                                SELECT DISTINCT pr.*
                                FROM providers pr
                                INNER JOIN appointment a ON pr.provider_id = a.provider_id
                            `;
                            db.query(providersWithAppointmentQuery, (err, providersWithAppointment) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({ error: err.message });
                                }
                                res.render('dashb', {
                                    user: req.session.user,
                                    patients,
                                    patientsWithoutAppointment,
                                    patientsWithAppointment,
                                    providers,
                                    providersWithoutAppointment,
                                    providersWithAppointment,
                                    statusCounts: statusCounts
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// GET: Fetch appointments with provider and patient names
router.get('/appointments', requireLogin, (req, res) => {
    const { provider_id, patient_id, status } = req.query;
    let sql = `
        SELECT
            a.*,
            p.first_name AS patient_first_name,
            p.last_name AS patient_last_name,
            pr.first_name AS provider_first_name,
            pr.last_name AS provider_last_name
        FROM appointment a
        LEFT JOIN patients p ON a.patient_id = p.patient_id
        LEFT JOIN providers pr ON a.provider_id = pr.provider_id
        WHERE 1=1
    `;
    const params = [];

    if (provider_id) {
        sql += ' AND a.provider_id = ?';
        params.push(provider_id);
    }
    if (patient_id) {
        sql += ' AND a.patient_id = ?';
        params.push(patient_id);
    }
    if (status) {
        sql += ' AND a.status = ?';
        params.push(status);
    }

    db.query(sql, params, (err, appointments) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        res.render('appointments', {
            user: req.session.user,
            appointments,
            provider_id,
            patient_id,
            status
        });
    });
});

//logout admin
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out.' });
        }
        res.redirect('/account/admin_a');
    });
});


//===================================================================================================
                            // UPDATE METHOD
//====================================================================================================
                            // DELETE METHOD



                            // GET: Select all patients
router.get('/patients', requireLogin, (req, res) => {
    const sql = 'SELECT * FROM patients';
    db.query(sql, (err, patients) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        res.render('patients', { user: req.session.user, patients });
    });
});

// POST: Delete a patient by patient_id
router.post('/patients/delete', requireLogin, (req, res) => {
    const { patient_id } = req.body;
    if (!patient_id) {
        return res.status(400).json({ error: 'patient_id is required.' });
    }
    const sql = 'DELETE FROM patients WHERE patient_id = ?';
    db.query(sql, [patient_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        res.redirect('/admins/patients');
    });
});

// GET: Select all patients without appointment
router.get('/patients/without-appointment', requireLogin, (req, res) => {
    const sql = `
        SELECT p.*
        FROM patients p
        LEFT JOIN appointment a ON p.patient_id = a.patient_id
        WHERE a.patient_id IS NULL
    `;
    db.query(sql, (err, patients) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        res.render('patients_without_appointment', { user: req.session.user, patients });
    });
});

// GET: Select all providers
router.get('/providers', requireLogin, (req, res) => {
    const sql = 'SELECT * FROM providers';
    db.query(sql, (err, providers) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        res.render('providers', { user: req.session.user, providers });
    });
});

// POST: Delete a provider by provider_id
router.post('/providers/delete', requireLogin, (req, res) => {
    const { provider_id } = req.body;
    if (!provider_id) {
        return res.status(400).json({ error: 'provider_id is required.' });
    }
    const sql = 'DELETE FROM providers WHERE provider_id = ?';
    db.query(sql, [provider_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        res.redirect('/admins/providers');
    });
});

// GET: Select all providers without appointment
router.get('/providers/without-appointment', requireLogin, (req, res) => {
    const sql = `
        SELECT pr.*
        FROM providers pr
        LEFT JOIN appointment a ON pr.provider_id = a.provider_id
        WHERE a.provider_id IS NULL
    `;
    db.query(sql, (err, providers) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        res.render('providers_without_appointment', { user: req.session.user, providers });
    });
});


// Verify providers
router.post('/verify', requireLogin, (req, res) => {
    const { provider_id, action } = req.body;
    console.log("Appointment ID:", provider_id);
    console.log("Action:", action)
    const verify = action === 'verified' ? 'verified' : 'declined';
    console.log("verification:", action);
    const sql = 'UPDATE providers SET verify = ? WHERE provider_id = ?';
    db.query(sql, [verify, provider_id], (err, result) => {
        console.log("SQL Result:", result);
        if (err) {
            console.log(err);
            req.flash('error', 'Failed to update appointment');
            return res.redirect('/providers/provider_dashboard');
        }
        req.flash('success', `Account ${action}`);
        res.redirect('/admins/dashboard');
    });
});


module.exports = router;
