var app = require('express')();

app.use(require('./SearchController.js'));

module.exports = app;