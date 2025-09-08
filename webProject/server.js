//CONST, VARIABLE NAMING AND IMPORTATION 
const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);
const patientsRouter = require('./routes/patientRouter');
const providersRouter = require('./routes/providerRouter');
const appointmentsRouter = require('./routes/appointmentRouter');
const adminsRouter = require('./routes/adminRouter');
const ejsRouter = require('./routes/ejsRouter');

// PORT
const port = 3016;


io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Attach io to app for use in routes
app.set('io', io);

// VIEW ENGINE SETUP
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// USE SECTION
app.use(bodyParser.urlencoded({ extended: false }));
// Add session middleware
app.use(session({
    secret: 'gigigigigigigigigigigigigigigigigogogogigigigigi', // Change this to a random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(flash());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/patients', patientsRouter);
app.use('/providers', providersRouter);
app.use('/appointments', appointmentsRouter);
app.use('/admins', adminsRouter);
app.use('/account', ejsRouter);

// GET HOME PAGE
app.get('/', (req, res) => {
    res.render('home');
});



// APP TO LOAD AND RUN ON
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
