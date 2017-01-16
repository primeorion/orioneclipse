var app = require('express')();

app.use('/holdings',require('./HoldingController.js'));

module.exports = app;