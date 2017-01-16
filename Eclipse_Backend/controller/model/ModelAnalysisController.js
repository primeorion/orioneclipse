"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js");
var ModelAnalysisService = require('service/model/ModelAnalysisService.js');
var modelAnalysisService = new ModelAnalysisService();

app.get('/:id/modelAggregate', function (req, res) {
    logger.info("Get Model Tolerance list of security request received");
    var data = req.data;
    data.modelId = req.params.id;
    if (req.query.isIncludeCostBasis) {
        data.isIncludeCostBasis = req.query.isIncludeCostBasis;
    }  
    if (req.query.isIncludeTradeBlockAccount) {
        data.isIncludeTradeBlockAccount = req.query.isIncludeTradeBlockAccount;
    }  
    if (req.query.isExcludeAsset) {
        data.isExcludeAsset = req.query.isExcludeAsset;
    }  
    modelAnalysisService.getModelAggregate(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:id/security', function (req, res) {
    logger.info("Get Model Tolerance list of security request received");
    var data = req.data;
    data.id = req.params.id;
    modelAnalysisService.getModelAggregate(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:id/class', function (req, res) {
    logger.info("Get Model Tolerance list of class request received");
    var data = req.data;
    data.id = req.params.id;
    modelAnalysisService.getModelAnalysisForClass(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


app.get('/:id/category', function (req, res) {
    logger.info("Get Model Tolerance list of category request received");
    var data = req.data;
    data.id = req.params.id;
    modelAnalysisService.getModelAnalysisForCategory(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:id/subClass', function (req, res) {
    logger.info("Get Model Tolerance of list subclass request received");
    var data = req.data;
    data.id = req.params.id;
    modelAnalysisService.getModelAnalysisForSubClass(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;

