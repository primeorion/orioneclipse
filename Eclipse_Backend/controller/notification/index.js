"use strict";
var app = require('express')();

app.use('/notifications',require('./NotificationController.js'));
app.use('/activities',require('./ActivityController.js'));

module.exports = app;