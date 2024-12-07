var mysql = require('mysql2');

//creating connection to database 
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Anaproc0893",
    database: "temeheth"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("connection to database created")
    
    //querring database
    //con.query(sql, function (err, result) {if (err) throw err; console.log("Result: " + result);});
   
    //con.query("CREATE DATABASE temehet", function (err, result) { if (err) throw err; console.log(" database created "); });
   
    var sql = //"CREATE TABLE patient (patientid int AUTO_INCREMENT, firstname varchar(50), lastname varchar(50), dateofbirth date, gender varchar(30), language varchar(30), PRIMARY KEY (patientid))";
    "INSERT INTO patient (firstname, lastname, dateofbirth, gender, language) VALUES ('Jude', 'Mark', '2024/05/05', 'Male', 'English')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log(" one record added");
    });   


});