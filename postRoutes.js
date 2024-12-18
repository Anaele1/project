const express = require('express');
const routerp = express.Router();
const db = require('./database');
const bcrypt = require('bcrypt');
const { registerUser } = require('./auth');

routerp.post('/login', async (req, res) => {
 
  try {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    
    const [user] = await db.execute(query, [username]);
    console.log('user data:', user);
    if (!user) {
      return res.status(401).send('invalid username or password');
    }
    if (!user.password) {
      console.log('password field not found');
      return res.status(500).send('internal server error: password not found');
    }

    console.log('password field:', user.password);

    const isInvalidPassword = await bcrypt.compare(password, user.password);
    if (!isInvalidPassword) {
      return res.status(401).send('invalid username or passwod');
    }

    req.session.user = user;
    res.redirect('/patdash');
  }catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ message: 'internal server error', error: error.message});
  }
});

//   const user = await authenticateUser(username, password);
//   if (user) {
//     req.session.user = user;
//     res.redirect('/patdash');
//   } else {
//     res.status(401).send('Invalid username or password');
//   }
// });

routerp.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const registered = await registerUser(username, password);
  if (registered) {
    res.redirect('/login');
  } else {
    res.status(500).send('Error registering user');
  }
});

 // patient dashboard page route
 routerp.get('/patdash', (req, res) => {
  if (req.session.user) {
    res.render('patdash');
  } else {
    res.redirect('/login');
  }
});

routerp.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

module.exports = routerp;
