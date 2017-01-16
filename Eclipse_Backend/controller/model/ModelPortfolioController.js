"use strict";

var app = require("express")();

var moduleName = __filename;

var config = require('config');
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var modelPortfolioService = require('service/model/ModelPortfolioService.js');
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
 * @api {get} /modeling/models/:id/portfolios/pending Get All Waiting For Approval Portfolios.
 * @apiName GetAllPendingPortfoliosForGivenModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets portfolio's for models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/portfolios/pending
 * 
 * @apiSuccess {Object}     newModel   				        Model Object
 * @apiSuccess {Number}     newModel.id   				    New model node Id.
 * @apiSuccess {String}     newModel.name                	New Model Name.
 * @apiSuccess {Object}     oldModel   				        Model Object
 * @apiSuccess {Number}     oldModel.id   				    old model node Id.
 * @apiSuccess {String}     oldModel.name                	old Model Name.
 * @apiSuccess {Number}     requesterUserId   				requester User id. user who wanted this model to be assigned with portfolio.
 * @apiSuccess {String}     requesterUser 					requester User.
 * @apiSuccess {String}     createdOn 						creation date.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "newModel": {
		      "id": 83,
		      "name": "Raj Model652"
		    },
		    "oldModel": {
		      "id": null,
		      "name": null
		    },
		    "portfolio": {
		      "id": 11211591,
		      "name": "Portflio"
		    },
		    "requesterUserId": 66,
		    "requesterUser": "prime@tgi.com",
		    "createdOn": "2016-10-18T00:18:38.000Z"
		  },
		  {
		    "newModel": {
		      "id": 2,
		      "name": "Community Model 2"
		    },
		    "oldModel": {
		      "id": 2,
		      "name": "Community Model 2"
		    },
		    "portfolio": {
		      "id": 3,
		      "name": "Test Portfolio 3"
		    },
		    "requesterUserId": 66,
		    "requesterUser": "prime@tgi.com",
		    "createdOn": "2016-10-21T08:33:38.000Z"
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

app.get('/:id/portfolios/pending', UserMiddleWare.getSpecificModelAccessForUser, function (req, res) {
	logger.info("Get all Portfolios for given model in request received");

	var data = req.data;
	data.id = req.params.id;

	modelPortfolioService.getAllPendingModelPortfolios(data, function (err, status, data) {
		return response(err, status, data, res);
	});
});

/**
 * @api {get} /modeling/models/:id/portfolios Get All Portfolios for given Model
 * @apiName GetAllPortfoliosForGivenModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets portfolio's for models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/portfolios
 * 
 * @apiSuccess {Number}     id   				            The model node Id.
 * @apiSuccess {String}     name                			Name of the model node.
 * @apiSuccess {Number}     substitutedModelId   			Substituted model id
 * @apiSuccess {String}     status                			Status of model-portfolio relation
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
		    "id": 3,
		    "name": "Test Portfolio 3",
		    "substitutedModelId": 0,
		    "status": "PENDING"
		  },
		  {
		    "id": 1,
		    "name": "Demo Portfolio Kate",
		    "substitutedModelId": 0,
		    "status": "PENDING"
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

/**
 * @api {get} /modeling/models/:id/portfolios?includeaccountcount=true Get All Portfolios for given Model with account count
 * @apiName GetAllPortfoliosForGivenModelWithAccountCount
 * @apiVersion 1.0.0
 * @apiGroup TradeTool-TradeToTarget
 * @apiPermission appuser
 *
 * @apiDescription This API gets portfolio's for models with account count. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/portfolios?includeaccountcount=true
 * 
 * @apiSuccess {Number}     id   				            The Portfolio  Id
 * @apiSuccess {String}     name                			Name of Portfolio
 * @apiSuccess {Number}     substitutedModelId   			Substituted model id
 * @apiSuccess {String}     status                			Status of model-portfolio relation
 * @apiSuccess {Number}     accountCount                	Number of account with portfolio 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
			"id": 11211238,
			"name": "Demo Portfolio 1212",
			"substitutedModelId": null,
			"status": "APPROVED",
			"accountCount": 2
		},
		{
			"id": 11211241,
			"name": "P1001",
			"substitutedModelId": null,
			"status": "APPROVED",
			"accountCount": 0
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

app.get('/:id/portfolios', UserMiddleWare.getSpecificModelAccessForUser, function (req, res) {
	logger.info("Get all Portfolios for given model in request received");

	var data = req.data;
	data.id = req.params.id;
	if (req.query.includeaccountcount == "true") {
		modelPortfolioService.getPortfoliosForModelAccountCount(data, function (err, status, data) {
			return response(err, status, data, res);
		});
	} else {
		modelPortfolioService.getPortfoliosForModel(data, function (err, status, data) {
			return response(err, status, data, res);
		});
	}
});


/**
 * @api {POST} /modeling/models/:id/portfolios Add Portfolio to model
 * @apiName AddPortfolioForModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API Add Portfolio to Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}         id 	          				  PortfolioId
 * @apiParam {Number}         substitutedModelId 	          SubstitutedModelId.
 * 
 * @apiParamExample {json} Request-Example:
		{
			"id" : ID,
			"substitutedModelId" : "SUBSTITUTED_MODEL_ID"
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/portfolios
 * 
 * @apiSuccess {String}    messages            Shows the status of result
 * 
 * @apiSuccessExample {json} Success-Response:
   HTTP/1.1 200 OK
   {
   	"messages" : "Model assigned with Portfolios"
   }
   
   HTTP/1.1 201 OK
   {
   	"messages" : "Model assigned with Portfolios but waiting for approval"
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


app.post("/:id/portfolios",
	UserMiddleWare.getSpecificModelAccessForUser,
	analysisMiddleware.post_import_analysis,
	function (req, res) {

		var modelId = req.params.id;
		var data = req.data;

		var modelPortfolio = modelConverter.getModelPortfolioFromModelRequest(data);

		modelPortfolio.modelId = modelId;

		modelPortfolioService.savePortfolioForModel(modelPortfolio, function (err, status, data) {
			return response(err, status, data, res);
		});
	})


/**
 * @api {PUT} /modeling/models/:id/portfolios/:actionStatus approve/reject portfolios for model
 * @apiName ApproveRejectPortfoliosForModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API Approve/reject Portfolio to Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Object}         portfolioIds	 	          				  List of portfolio Ids
 * 
 * @apiParamExample {json} Request-Example:
		{
			"portfolioIds" : [4, 5]
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/1/portfolios/approve
 * curl -i http://baseurl/v1/modeling/models/1/portfolios/reject
 * 
 * @apiSuccess {String}    messages            Shows the status of result
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
       {
       	"messages" : "Model approved for Portfolio"
       }
       
 *
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
app.put("/:id/portfolios/:status", UserMiddleWare.getSpecificModelAccessForUser, function (req, res) {

	var modelId = req.params.id;
	var actionStatus = req.params.status;
	var data = req.data;
	data.actionStatus = actionStatus;
	var modelPortfolio = modelConverter.getModelPortfolioListFromModelRequest(data);

	modelPortfolio.modelId = modelId;

	modelPortfolioService.approveModelForPortfolio(modelPortfolio, function (err, status, data) {
		return response(err, status, data, res);
	});
})

/**
 * @api {DELETE} /modeling/models/:id/portfolios/:portfolioId Unassign portfolio from model
 * @apiName UnassignPortfoliosForModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API unassign portfolio from model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 *     
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/2/portfolios/2
 * 
 * @apiSuccess {String}    messages            Shows the status of result
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
       {
       	"messages" : "Model unassigned from Portfolios"
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
app.delete("/:id/portfolios/:portfolioId", UserMiddleWare.getSpecificModelAccessForUser, function (req, res) {

	var modelId = req.params.id;
	var portfolioId = req.params.portfolioId;
	var data = req.data;

	var modelPortfolio = modelConverter.getModelPortfolioFromModelRequest(data);

	modelPortfolio.modelId = modelId;
	modelPortfolio.portfolioId = portfolioId;
	modelPortfolioService.deletePortolioFromModel(modelPortfolio, function (err, status, data) {
		return response(err, status, data, res);
	});
})


module.exports = app;