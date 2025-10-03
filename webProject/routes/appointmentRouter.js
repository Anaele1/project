const express = require('express');
const router = express.Router();
const db = require('../database');
const session = require('express-session');
const { requireLogin } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//===================================================================================================
                            // GET METHOD
const appointmentdata = `SELECT * FROM appointment`;
router.get('/', (req, res) => {
    db.query(appointmentdata, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        } else {
            res.render('xxxx', {result});
        }
    });
});


const appoi = `SELECT patient_id FROM appointment`;
router.get('/appo', (req, res) => {
    db.query(appoi, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        } else {
            res.json(result);
        }
    });
});

//==================================================================================================

                            // POST METHOD

                            // UPDATE METHOD

                            // DELETE METHOD



                            // GET: Fetch appointment status counts
router.get('/status-counts', requireLogin, (req, res) => {
    const sql = `
        SELECT
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
        FROM appointment
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: err.message });
        }
        const counts = result[0];
        res.json(counts);
    });
});


module.exports = router;
