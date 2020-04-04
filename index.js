const express = require("express");
const bodyParser = require('body-parser');
const router = require('express').Router();
const bcrypt = require('bcrypt');
// const expressValidator = require('express-validator');
// const session = require('express-session');
const jwt = require('jsonwebtoken')

const port = process.env.PORT || 8080;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fruit', { useNewUrlParser: true});
// mongoose.connect('mongodb+srv://mohit:mohitkadel@cluster0-o0vsh.mongodb.net/school?retryWrites=true&w=majority', { useNewUrlParser: true});
var db = mongoose.connection;

// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")


const routes = require('./routes');

/**
 * Create Express server.
 */
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTION");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, x-access-token, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(expressValidator)
app.use('/api', routes);


/**
 * Start Express server.
 */
app.listen(port, () => {
    console.log('App is running at http://localhost:' + port);
    console.log('Press CTRL-C to stop\n');
});

module.exports = app;