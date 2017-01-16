var app = require('express')();

app.use('/strategists',require('./StrategistController.js'));
app.use('/models',require('./ModelController.js'));
app.use('/security',require('./SecurityController.js'));

module.exports = app;