const db = require('../config/database')

class accountAuth {

  static async create( [first_name, last_name, email, password]) {
    //const sql = 'INSERT INTO patients SET ?'
    const sql = 'INSERT INTO patients (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [ first_name, last_name, email, password])
    return result;
  }

  static async emailRead(email) {
    const sql = 'SELECT * FROM patients WHERE email = ?';
    const [result] = await db.query(sql, (email))
    return result;
  }

  static async availability(users) {
    const sql = 'UPDATE patients SET availability = "offline" WHERE patient_id = ?';
    const [result] = await db.query(sql, [users])
    return result;
  }

   
}

module.exports = accountAuth;