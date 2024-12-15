//const express = require('express');

//const app = express();

//app.get('/', (req, res) => {
//    res.send('Hello from Node.js server!');
//});

//const port = 3000;
//app.listen(port, () => {
   // console.log(`Server listening on port ${port}`);
//});

//set up express
const express = require('express');
const app = express();

// set up handlebars view engine
const handlebars = require('express-handlebars')
.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//port
app.set('port', process.env.PORT || 3000);

//static files
app.use(express.static(__dirname + '/public'));

//routes
app.get('/', function(req, res) {
    res.render('home');
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/aidoc', function(req, res){
    res.render('aidoc');
});

app.get('/admin', function(req, res){
    res.render('admind');
});

app.get('/patient', function(req, res){
    res.render('patientd');
});

app.get('/provider', function(req, res){
    res.render('providerd');
});

app.get('/form', function(req, res){
    res.render('signuplogin');
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

// server / app listening(url)
app.listen(app.get('port'), function(){
    console.log( 'Express started on http://localhost:' +
    app.get('port'));
});