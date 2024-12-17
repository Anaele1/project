const db = require('./database');

//authenticate user
const authenticateUser = async (username, password) => {
  try {
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const [user] = await db.execute(query, [username, password]);
    return user;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

//registering user
const registerUser = async (username, password) => {
    try {
      const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
      await db.execute(query, [username, password]);
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  };
  
  module.exports = { authenticateUser, registerUser };
  
