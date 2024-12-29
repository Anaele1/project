const bcrypt = require('bcrypt')
const db = require('./database');



//PATIENTS SECTION 
  //registering patient
const registerPatient = async (firstname, email, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const query = 'INSERT INTO patient (firstname, email, password) VALUES (?, ?, ?)';
    await db.execute(query, [firstname, email, password]);
    return true;
  } catch (error) {
    console.error('Error registering patient:', error);
    return false;
  }
};

//authenticate patient
const authenticatePatient = async (email, password) => {
  try {
    const query = 'SELECT * FROM patient WHERE email = ?';
    const [user] = await db.execute(query, [email]);
    if (!user.length)
    return null;
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    return isValidPassword ? user[0] : null;
  } catch (error) {
    console.error('Error authenticating patient:', error);
    return null;
  }
};


//PROVIDER SECTION
  //registering providerf
  const registerProvider = async (firstname, specialty, email, password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const query = 'INSERT INTO provider (firstname, specialty, email, password) VALUES (?, ?, ?, ?)';
      await db.execute(query, [firstname, specialty, email, password]);
      return true;
    } catch (error) {
      console.error('Error registering provider:', error);
      return false;
    }
  };
  
  //authenticate provider
  const authenticateProvider = async (email, password) => {
    try {
      const query = 'SELECT * FROM provider WHERE email = ?';
      const [provider] = await db.execute(query, [email]);
      if (!provider.length)
      return null;
      const isValidPassword = await bcrypt.compare(password, provider[0].password);
      return isValidPassword ? provider[0] : null;
    } catch (error) {
      console.error('Error authenticating provider:', error);
      return null;
    }
  };


  //ADMIN SECTION
  //registering admin
  const registerAdmin = async (email, password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const query = 'INSERT INTO admin (email, password) VALUES (?, ?)';
      await db.execute(query, [email, password]);
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  };
  
  //authenticate admin
  const authenticateAdmin = async (email, password) => {
    try {
      const query = 'SELECT * FROM admin WHERE email = ?';
      const [admin] = await db.execute(query, [email]);
      if (!admin.length)
      return null;
      const isValidPassword = await bcrypt.compare(password, admin[0].password);
      return isValidPassword ? admin[0] : null;
    } catch (error) {
      console.error('Error authenticating admin:', error);
      return null;
    }
  };
  
  module.exports = { registerPatient, authenticatePatient, registerProvider, authenticateProvider, registerAdmin, authenticateAdmin };