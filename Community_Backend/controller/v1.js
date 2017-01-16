/**
 * New node file
 */

var app = require("express")();
app.use('/admin', require('./admin'));
app.use('/community', require('./community'));
app.use('/settings', require('./settings'));

module.exports = app;
