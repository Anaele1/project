const db = require('../config/database')

class Admin {

    // SIGNUP / SIGNIN
  static async create( [name, admin_code, email, password]) {
    //const sql = 'INSERT INTO patients SET ?'
    const sql = 'INSERT INTO admin (name, admin_code, email, password) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [ name, admin_code, email, password])
    return result;
  }

  static async emailRead(email) {
    const sql = 'SELECT * FROM admin WHERE email = ?';
    const [result] = await db.query(sql, (email))
    return result;
  }






    static async admDelelteAppointment(appointment_id) {
        const sql = 'DELETE FROM appointment WHERE appointment_id = ?';
        const [result] = await db.query(sql, [appointment_id])
        return result
    }

    static async verifyProvider([provider_id, verify]) {
        const sql = 'UPDATE providers SET verify = ? WHERE provider_id = ?';
        const [result] = await db.query(sql, [provider_id, verify])
        return result
    }

    static async providersPatientsAppointments([provider_id, patient_id, status]) {
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
        WHERE 1=1 `;
        // Filter search
        const sqlFilter = [];
        if (provider_id) {
            sql += ' AND a.provider_id = ?';
            sqlFilter.push(provider_id);
        }
        if (patient_id) {
            sql += ' AND a.patient_id = ?';
            sqlFilter.push(patient_id);
        }
        if (status) {
            sql += ' AND a.status = ?';
            sqlFilter.push(status);
        }
        const [result] = await db.query(sql, sqlFilter, [provider_id, patient_id, status])
        return result
    }

    static async appointmentStatusCount() {
        const sql = `
        SELECT
            COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
            COUNT(CASE WHEN status = 'accepted' THEN 1 END) AS accepted,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
        FROM appointment`;
        const [result] = await db.query(sql)
        return result
    }

    static async getAllPatients() {
        const sql = 'SELECT * FROM patients';
        const [result] = await db.query(sql)
        return result
    }

    static async getAllPatientsWithoutAppointment() {
        const sql = `
            SELECT p.*
            FROM patients p
            LEFT JOIN appointment a ON p.patient_id = a.patient_id
            WHERE a.patient_id IS NULL`;
        const [result] = await db.query(sql)
        return result
    }

    static async getAllPatientsWithAppointment() {
        const sql = `
            SELECT DISTINCT p.*
            FROM patients p
            INNER JOIN appointment a ON p.patient_id = a.patient_id`;
        const [result] = await db.query(sql)
        return result
    }

    static async getAllProviders() {
        const sql = 'SELECT * FROM providers';
        const [result] = await db.query(sql)
        return result
    }

    static async getAllProvidersWithoutAppointment() {
        const sql = `
            SELECT pr.*
            FROM providers pr
            LEFT JOIN appointment a ON pr.provider_id = a.provider_id
            WHERE a.provider_id IS NULL `;
        const [result] = await db.query(sql)
        return result
    }

    static async getAllProvidersWithAppointment() {
        const sql = `
            SELECT DISTINCT pr.*
            FROM providers pr
            INNER JOIN appointment a ON pr.provider_id = a.provider_id `;
        const [result] = await db.query(sql)
        return result
    }

    static async numberOfPatientsPerProvider() {
        const sql = `
            SELECT
                pr.provider_id,
                CONCAT(pr.first_name, ' ', pr.last_name) AS provider_name,
                COUNT(DISTINCT a.patient_id) AS patient_count
            FROM
                providers pr
            LEFT JOIN
                appointment a ON pr.provider_id = a.provider_id
            GROUP BY
                pr.provider_id, pr.first_name, pr.last_name;
        `;
        const [result] = await db.query(sql)
        return result
    }

    static async numberOfProvidersPerPatient() {
        const sql = `
            SELECT
                p.patient_id,
                CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
                COUNT(DISTINCT a.provider_id) AS provider_count
            FROM
                patients p
            LEFT JOIN
                appointment a ON p.patient_id = a.patient_id
            GROUP BY
                p.patient_id, p.first_name, p.last_name;
        `;
        const [result] = await db.query(sql)
        return result
    }
}

module.exports = Admin