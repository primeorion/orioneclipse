"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js");
var PortfolioToleranceService = require('service/portfolio/PortfolioToleranceService.js');
var portfolioToleranceService = new PortfolioToleranceService();


app.get('/:id/modelTolerance', function (req, res) {
    logger.info("Get Model Tolerance list of security request received");
    var data = req.data;
    data.id = req.params.id;
    req.query
    portfolioToleranceService.getModelToleranceSecurity(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
app.get('/:id/modelTolerance/class', function (req, res) {
    logger.info("Get Model Tolerance list of class request received");
    var data = req.data;
    data.id = req.params.id;
    portfolioToleranceService.getModelToleranceClass(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
app.get('/:id/modelTolerance/category', function (req, res) {
    logger.info("Get Model Tolerance list of category request received");
    var data = req.data;
    data.id = req.params.id;
    portfolioToleranceService.getModelToleranceCategory(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:id/modelTolerance/subClass', function (req, res) {
    logger.info("Get Model Tolerance of list subclass request received");
    var data = req.data;
    data.id = req.params.id;
    portfolioToleranceService.getModelToleranceSubClass(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;

