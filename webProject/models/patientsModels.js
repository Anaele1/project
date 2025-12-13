const db = require('../config/database')

class Patient {

    static async findExistingAppointment([providerId, patientId]) {
        const sql = 'SELECT * FROM appointment WHERE provider_id = ? AND patient_id = ?';
        const [result] = await db.query(sql, [providerId, patientId])
        return result
    };

    static async patientCreateAppointment([patientId, providerId, date, time]) {
        const sql = `
            INSERT INTO appointment
            (patient_id, provider_id, appointment_date, appointment_time, status)
            VALUES (?, ?, ?, ?, "pending") `;
        const [result] = await db.query(sql, [patientId, providerId, date, time])
        return result
    };

    static async updateLocation([location, patientId]) {
        const sql = 'UPDATE patients SET location = ? WHERE patient_id = ?';
        const [result] = await db.query(sql, [location, patientId])
        return result
    };

    static async updateLanguage([language, patientId]) {
        const sql = 'UPDATE patients SET language = ? WHERE patient_id = ?';
        const [result] = await db.query(sql, [language, patientId])
        return result
    };

    static async patientDeleteAccount(patientId) {
        const sql = 'DELETE FROM patients WHERE patient_id = ?';
        const [result] = await db.query(sql, [patientId])
        return result
    };

    static async patientDeleteAppointment(patientId) {
        const sql = 'DELETE FROM appointment WHERE patient_id = ?';
        const [result] = await db.query(sql, [patientId])
        return result
    };

    static async numberOfProvidersPerPatient(patientId) {
        const sql = `
        SELECT COUNT(DISTINCT a.provider_id) AS provider_count
        FROM appointment a
        WHERE a.patient_id = ?`;
        const [result] = await db.query(sql, [patientId])
        return result
    };

    static async appointmentStatusCount(patientId) {
        const sql = `
            SELECT
                COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
            FROM appointment
            WHERE patient_id = ?`;
        const [result] = await db.query(sql, [patientId])
        return result
    };

    static async availabilityUpdate(patientId) {
        const sql = 'UPDATE patients SET availability = "online" WHERE patient_id = ?';
        const [result] = await db.query(sql, [patientId])
        return result
    };

    static async appointmentStatusCheck([patientId, status]) {
        const sql = `
        SELECT p.first_name AS provider_first_name, p.last_name AS provider_last_name, p.availability AS provider_availability,
        a.appointment_id AS appointment_id, a.appointment_date, a.appointment_time, a.status
        FROM appointment a
        JOIN providers p ON a.provider_id = p.provider_id
        WHERE a.patient_id = ? AND a.status = ?`;
        const [result] = await db.query(sql, [patientId, status])
        return result
    };

    static async verifiedProviders() {
        const sql = 'SELECT * FROM providers WHERE verify = "verified"';
        const [result] = await db.query(sql)
        return result
    };

    static async appointmentsWithProviders(patientId) {
        const sql = `
        SELECT a.*, p.first_name as provider_first_name, p.last_name as provider_last_name, p.availability AS provider_availability, a.status
        FROM appointment a
        JOIN providers p ON a.provider_id = p.provider_id
        WHERE a.patient_id = ?`;
        const [result] = await db.query(sql, [patientId])
        return result
    };

}

module.exports = Patient;