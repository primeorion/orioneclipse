var app = require('express')();

app.use('/classes', require('./ClassController.js'));
app.use('/subclasses', require('./SubClassController.js'));
app.use('/categories', require('./CategoryController.js'));
app.use('/securities',require('./SecurityController.js'));
app.use('/securityset',require('./SecuritySetController.js'));

module.exports = app;