const db = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class Provider {

  // SIGNUP / SIGNIN
  static async create( [first_name, last_name, email, password]) {
    //const sql = 'INSERT INTO patients SET ?'
    const sql = 'INSERT INTO providers (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [ first_name, last_name, email, password])
    return result;
  }

  static async emailRead(email) {
    const sql = 'SELECT * FROM providers WHERE email = ?';
    const [result] = await db.query(sql, (email))
    return result;
  }

  static async specialtyUpdate([providerId, specialty]) {
    const sql = 'UPDATE providers SET specialty = ? WHERE provider_id = ?';
    const [result] = await db.query(sql, [providerId, specialty])
    return result
  };

  static async locationUpdate([providerId, location]) {
    const sql = 'UPDATE providers SET location = ? WHERE provider_id = ?';
    const [result] = await db.query(sql, [providerId, location])
    return result
  }

  static async languageUpdate([providerId, language]) {
    const sql = 'UPDATE providers SET language = ? WHERE provider_id = ?';
    const [result] = await db.query(sql, [providerId, language])
    return result
  }


  // Account Delete 2-STEP
  static async deleteAppointment(providerId) {
    const sql = 'DELETE FROM appointment WHERE provider_id = ?';
    const [result] = await db.query(sql, [providerId])
    return result
  }

  static async deleteProvider(providerId) {
    const sql = 'DELETE FROM providers WHERE provider_id = ?';
    const [result] = await db.query(sql, [providerId])
    return result
  }
  // END

  static async patientsPerProvider(providerId) {
    const sql = `
        SELECT COUNT(DISTINCT a.patient_id) AS patient_count
        FROM appointment a
        WHERE a.provider_id = ?
    `;
    const [result] = await db.query(sql, [providerId])
    return result
  }

  static async appointmentStatusCount(providerId) {
    const sql = `
        SELECT
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
        FROM appointment
        WHERE provider_id = ?`;
    const [result] = await db.query(sql, [providerId])
    return result
  }

  static async availabilityOnline(providerId) {
    const sql = 'UPDATE providers SET availability = "online" WHERE provider_id = ?';
    const [result] = await db.query(sql, [providerId])
    return result
  }

  static async appointmentStatusFilter([providerId, status]) {
    const sql = `
        SELECT p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.availability AS patient_availability,
        a.appointment_id AS appointment_id, a.appointment_date, a.appointment_time, a.status
        FROM appointment a
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE a.provider_id = ? AND a.status = ?
    `;
    const [result] = await db.query(sql, [providerId, status])
    return result
  }

  static async allStatusAppointment(providerId) {
    const sql = `
           SELECT a.*, p.first_name as patient_first_name, p.last_name as patient_last_name, p.availability AS patient_availability, a.status
           FROM appointment a
           JOIN patients p ON a.patient_id = p.patient_id
           WHERE a.provider_id = ?`;
    const [result] = await db.query(sql, [providerId])
    return result
  }

  static async availabilityOffline(providerId) {
    const sql = 'UPDATE providers SET availability = "offline" WHERE provider_id = ?';
    const [result] = await db.query(sql, [providerId])
    return result
  }

  static async appointmentUpdate([status, appointmentId]) {
    const sql = 'UPDATE appointment SET status = ? WHERE appointment_id = ?';
    const [result] = await db.query(sql, [status, appointmentId])
    return result
  }

}

module.exports = Provider;