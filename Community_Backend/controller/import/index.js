var app = require('express')();

app.use(require('./ImportController.js'));

module.exports = app;