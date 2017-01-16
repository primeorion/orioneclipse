"use strict";
/**
 * index file
 */

var app = require('express')();
app.use(require('./AnalysisController.js'));

// app.use('/postimport', require('controller/post_import_analysis/AnalysisController.js'));

module.exports = app;