"use strict";

var app = require("express")();

var moduleName = __filename;

var config = require('config');
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var ModelService = require('service/model_temp/ModelService.js');
var modelConverter = require('converter/model_temp/ModelConverter.js');
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js").getDifferentAccessForUser;
var responseCodes = config.responseCode;

var modelService = new ModelService();

app.get('/', UserTeamAccessMiddleWare, function (req, res) {
	logger.info("Get all models request received");
    
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    
    modelService.getModelList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:id', function (req, res) {
	logger.info("Get all models request received");
    
    var data = req.data;
    data.id = req.params.id;
    
    modelService.getCompleteModelById(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.post("/", function(req, res){
	logger.info("create model request received");

	var data = req.data;
	
	modelService.saveCompleteModel(data, function(err, status, data){		
		return response(err, status, data, res);
	});
});


module.exports = app;