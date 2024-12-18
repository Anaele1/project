// CONST
//set up express
const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./database');
const routes = require('./pages/routes');
const postRoutes = require('./postRoutes');
const session = require('express-session');
const port = process.env.PORT

//APP SET
app.set('view engine', 'ejs');//test database connection
db.getConnection()
 .then((conn) => {
    console.log('db connection established');
    conn.release();
 })
 .catch((err) => {
    console.error('error connecting to db:', err);
    conn.release();
 });

//APP USE
app.use(express.json());
app.use('/', routes);
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({secret: 'secret', resave: false, saveUninitialized: true, cookie: {
   secure: false, httpOnly: true, maxAge: 3600000 // 1 hour
}
}));
app.use('/', postRoutes);

//server listening(url)
app.listen(port, () => {
    console.log(`Express started on http://localhost port ${port}`);
}); 