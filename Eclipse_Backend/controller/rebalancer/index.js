"use strict";
/**
 * index file
 */

var app = require('express')();

app.use(require('./RebalancerController.js'));

module.exports = app;