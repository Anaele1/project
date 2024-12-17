// CONST
//set up express
const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./database');
const routes = require('./pages/routes');
const { authenticateUser, registerUser } = require('./auth');
const port = process.env.PORT

//APP USE
app.use(express.json());
app.use('/', routes);
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

// APP SET
app.set('view engine', 'ejs');

// APP POST
     //register post
app.post('/register', async (req, res) => {
const { username, password } = req.body;
const registered = await registerUser(username, password);
if (registered) {
    res.redirect('/login');
} else {
    res.status(500).send('Error registering user');
}
});
      //login post
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);
    if (user) {
      req.session.user = user;
      res.redirect('/patdash');
    } else {
      res.status(401).send('Invalid username or password');
    }
  });

   // 404 catch-all handler (middleware)
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

    // 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

  

//test database connection
db.getConnection()
 .then((conn) => {
    console.log('db connection established');
    conn.release();
 })
 .catch((err) => {
    console.error('error connecting to db:', err);
    conn.release();
 });

// server listening(url)
app.listen(port, () => {
    console.log(`Express started on http://localhost port ${port}`);
}); 