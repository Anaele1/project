//CONST, VARIABLE NAMING AND IMPORTATION 
const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const db = require('./config/database')
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
//const socketIo = require('socket.io');
const server = http.createServer(app);
//const io = socketIo(server);
const patientsRouter = require('./routes/patientRouter');
const providersRouter = require('./routes/providerRouter');
const adminsRouter = require('./routes/adminRouter');
const ejsRouter = require('./routes/ejsRouter');
require('dotenv').config();


// PORT
const port = process.env.PORT;


// io.on('connection', (socket) => {
//     console.log('New client connected');
//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });

// Attach io to app for use in routes
//app.set('io', io);

// VIEW ENGINE SETUP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// USE SECTION
// MIDDLEWARE The order of middleware matters. express-session must be used before any route that uses req.session.
app.use(bodyParser.urlencoded({ extended: false }));
// Add session middleware
app.use(session({
    secret: process.env.SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(flash());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/patients', patientsRouter);
app.use('/providers', providersRouter);
app.use('/admins', adminsRouter);
app.use('/account', ejsRouter);

// GET HOME PAGE
app.get('/', (req, res) => {
    res.render('home');
});


//Using promise for db - connection test 
db.getConnection()

.then(connection => {

  //DB connection
  console.log('Successfully connected to the database!');
  connection.release(); // Release the connection back to the pool

  // App Lidtening
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });

})

.catch(error => {
  console.error('Error connecting to the database:', error);
});