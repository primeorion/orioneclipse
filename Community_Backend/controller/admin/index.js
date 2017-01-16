"use strict";
var app = require('express')();

app.use(require('./LoginController.js'));
app.use('/users', require('./UserController.js'));
app.use('/roles',require('./RoleController.js'));
app.use('/teams',require('./TeamController.js'));
app.use('/privileges',require('./PrivilegeController.js'));
app.use('/advisors',require('./AdvisorController.js'));
app.use('/custodians',require('./CustodianController.js'));
app.use('/aws', require("./AWSController.js"));

module.exports = app;