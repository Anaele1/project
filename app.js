
// CONST
//set up express
const express = require('express');
const app = express();
const postRoutes = require('./postRoutes');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const routes = require('./pages/routes');


const port = process.env.PORT

//APP SET
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//APP USE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret', 
  resave: false, 
  saveUninitialized: true, 
  cookie: {
   secure: false, httpOnly: true, maxAge: 3600000 }
}));
app.use('/', routes);
app.use('/', postRoutes);


//server listening(url)
app.listen(port, () => {
  console.log(`Express started on http://localhost port ${port}`);
}); 