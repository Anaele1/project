const express = require('express');
const router = express.Router();
const db = require('../database');


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



module.exports = router;
