var app = require('express')();

app.use('/strategists',require('./StrategistController.js'));
app.use('/users', require('./UserController.js'));
app.use('/models',require('./ModelController.js'));
app.use('/security',require('./SecurityController.js'));
app.use('/token',require('./LoginController.js'));
app.use('/dashboard',require('./DashboardController.js'));

module.exports = app;