"use strict";
var app = require('express')();

app.use('/models',require('./ModelController.js'));

module.exports = app;