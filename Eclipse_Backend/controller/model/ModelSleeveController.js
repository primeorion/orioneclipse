"use strict";

var app = require("express")();

var moduleName = __filename;

var config = require('config');
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var modelSleeveService = require('service/model/ModelSleeveService.js');
var modelConverter = require('converter/model/ModelPortfolioConverter.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var analysisMiddleware = require('middleware/AnalysisMiddleware.js')

var responseCodes = config.responseCode;
var applicationEnum = config.applicationEnum;
var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var reverseRelatedTypeCodeToId = applicationEnum.reverseRelatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var reverseRelatedTypeCodeToDisplayName = applicationEnum.reverseRelatedTypeCodeToDisplayName;


/**
 * @api {get} /modeling/models/:id/sleeves Get All sleeved accounts for given Model
 * @apiName GetAllSleevedAccountsForGivenModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets sleeved accounts for models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/sleeves
 * 
 * @apiSuccess {Number}     id   				            The model node Id.
 * @apiSuccess {String}     name                			Name of the model node.
 * @apiSuccess {Number}     accountId                		AccountId.
 * @apiSuccess {Number}     accountNumber   				accountNumber
 * @apiSuccess {Number}     portfolioId   					portfolioId whose this account is part of.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
		    "id": 2,
		    "name": "Ashe Aaron M.",
		    "accountId": "1020_5",
		    "accountNumber": "L0704C0669",
		    "portfolioId": 3
		  }
		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.get('/:id/sleeves', UserMiddleWare.getSpecificModelAccessForUser, function (req, res) {
	logger.info("Get all Portfolios for given model in request received");
    
    var data = req.data;
    data.id = req.params.id;
    
    modelSleeveService.getSleevedAccountForModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {POST} /modeling/models/:id/sleeves Add sleeve to model
 * @apiName AddSleeveForModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API Add sleeve to Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}         id 	          				  sleeveAccountId
 * @apiParam {Number}         substitutedModelId 	          SubstitutedModelId.
 * 
 * @apiParamExample {json} Request-Example:
		{
			"id" : ID,
			"substitutedModelId" : "SUBSTITUTED_MODEL_ID"
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/sleeves
 * 
 * @apiSuccess {String}    messages            Shows the status of result
 * 
 * @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   {
   	"messages" : "Model assigned with sleeved account"
   }
       
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 *  
 *
 */
		

app.post("/:id/sleeves", 
		UserMiddleWare.getSpecificModelAccessForUser,
		analysisMiddleware.post_import_analysis,
		function(req, res){
	
	var modelId = req.params.id;
	var data = req.data;
	
	var modelPortfolio = modelConverter.getModelSleeveFromModelRequest(data);
	
	modelPortfolio.modelId = modelId;
	
	modelSleeveService.assignModelToSleeve(modelPortfolio, function (err, status, data) {
        return response(err, status, data, res);
    });
})



module.exports = app;