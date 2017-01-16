"use strict";

var app = require('express')();
var config = require('config');
var response = require('controller/ResponseController.js');
var ModelService = require('service/model/ModelService.js');
var responseCodes = config.responseCode;
/**
 * @api {get} /dashboard/model/summary Get Dashboard summary Models 
 * @apiName GetModelsDashboardSummary
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model dashboard summary. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dashboard/model/summary
 * 
 * @apiSuccess {Number}     totalNumberOfModels              Total Number of models.
 * @apiSuccess {Number}     newModels              			 The new models.
 * @apiSuccess {Number}     existingModels              	 The existing models.
 * @apiSuccess {Number}     approvedModels                   Approved models.
 * @apiSuccess {Number}     waitingForApprovalModels         Number of waiting for approval models.
 * @apiSuccess {Number}     draftModels       	  			 Number of draft models.
 * @apiSuccess {Number}     OUBalanceModels                  Out of Balance model users
 * @apiSuccess {Number}     notActiveModels                  Not-Active models.
 * @apiSuccess {String}     analyticsOn                      Model edited date into application.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
	{
	  "totalNumberOfModels": 438,
	  "newModels": 0,
	  "existingModels": 438,
	  "approvedModels": 153,
	  "waitingForApprovalModels": 108,
	  "draftModels": 171,
	  "OUBalanceModels": 1,
	  "notActiveModels" : 1,
	  "analyticsOn": "2016-12-13T04:44:17.000Z",
	}
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.get('/summary', function(req, res){
	var data = req.data;
	ModelService.getModelDashboardSummary(data, function(err, status, rs){		
		response(null, status, rs, res);
	})
})


module.exports = app;