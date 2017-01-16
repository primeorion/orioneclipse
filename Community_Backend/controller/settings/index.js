"use strict";
var app = require('express')();
app.use('/views', require('controller/settings/ViewController.js'));

module.exports = app;