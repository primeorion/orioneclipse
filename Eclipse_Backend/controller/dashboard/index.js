"use strict";
/**
 * 
 */

var app = require('express')();

app.use('/admin', require('./StatisticsController.js'));
app.use('/portfolio', require('./PortfolioController.js'));
app.use('/account/', require('./AccountDashBoardController.js'));
app.use('/model', require('./ModelDashboardController.js'));
app.use('/main', require('./MainDashboardController.js'));

module.exports = app;