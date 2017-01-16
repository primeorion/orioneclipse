"use strict";
var app = require('express')();
app.use('/portfolios', require('controller/portfolio/PortfolioController.js'));
app.use('/portfolioRebalance', require('controller/portfolio/PortfolioSecurityTaxlotController.js'));
// app.use(require('controller/portfolio/PortfolioController.js'));
app.use("/sleeves", require("controller/portfolio/SleeveController.js"));
app.use("/portfolioTolerance", require("controller/portfolio/PortfolioToleranceController.js"));
module.exports = app;