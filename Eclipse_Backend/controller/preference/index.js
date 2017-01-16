"use strict";
/**
 * index file
 */

var app = require('express')();

app.use(require('./PreferenceController.js'));

module.exports = app;