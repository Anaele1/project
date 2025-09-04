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
                    
                    res.redirect('/dashboard');
                });
            } else {
                res.status(401).json({ error: 'Invalid email or password.' });
            }
        } else {
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    });
});

//===================================================================================================
                            // GET METHOD
//admin dashboard route
router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/account/user')
    }
    res.render('dashb', { user: req.session.user, result })
});
// select all patients
const patientdata = `SELECT * FROM providers`;
router.get('/ptall', (req, res) => {
    db.query(patientdata, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        } else {
            res.render('dashb', { db });
        }
    });
});

//===================================================================================================
                            // UPDATE METHOD
//====================================================================================================
                            // DELETE METHOD





module.exports = router;
