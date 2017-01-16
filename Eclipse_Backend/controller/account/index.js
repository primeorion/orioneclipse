var app = require('express')();

app.use('/accounts',require('./AccountController.js'));

module.exports = app;