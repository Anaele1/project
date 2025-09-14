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
                    res.redirect('admins/dashboard');
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
//admin dashboard route
router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/account/user')
    }
    res.render('dashb', { user: req.session.user})
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





module.exports = router;
