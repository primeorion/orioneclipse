"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCode;
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var TradeInstanceService = require('service/tradetool/TradeInstanceService.js');
var tradeInstanceService = new TradeInstanceService();

/**
 * @api {post} /tradetool/tradeInstance/action/generateinstance Generate Trade Instance Id
 * @apiName GenerateTradeInstance.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will retrun/generate new instance id for requested application id.
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 * 
 * @apiHeaderExample Header-Example: 
 * 	  { 
 * 			"Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *                   	"Content-Type" : application/json 
 *                   }
 * 
 * @apiExample Example usage: 
 * curl -i  http://baseurl/v1/tradetool/tradeInstance/action/generateinstance
 * 
 * @apiParamExample Body Param
*
{
    "appId" : 7,
    "reason": "Testing purpose."
}
 * 
 * @apiSuccess {Number} API will return trade instanceId against request.
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
*
{
  "tradeInstanceId": 35
}
*
 * @apiError Unauthorized Invalid / Without JWT Token.
 * 
 * @apiErrorExample Response (example): 
* HTTP / 1.1 401 Unauthorized {
*     "message": "Invalid Authorization Header"
* }
 * @apiError Bad_Request When without request data.
 * 
 * @apiErrorExample Response (example): 
* HTTP / 1.1 400 Bad_Request {
*     "message": "Bad Request: Verify request data"
* }
* 
* * @apiError Not Found When App id not exist.
 * 
 * @apiErrorExample Response (example): 
* HTTP / 1.1 404 Not Found {
*     "message": "Data not found"
* }
 * 
 */

app.post('/action/generateinstance', function(req, res) {
	logger.info("generate trade instance request received.");

	// Trade need to handle

	if (req.body.appId == undefined) {
		logger.error("generate trade request error :: \n Invalida or Null application  id.");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}

	var tradeInstance = {
			appId : req.body.appId,
			description : req.body.reason
	}

	req.data.tradeInstance = tradeInstance;
	
	tradeInstanceService.generateTradeInstance(req.data, function(err, status, data) {
		return response(err, status, data, res);
	});
});

/**
 * @apiIgnore Not needed now
 * @api {delete} /tradetool/action/deleteTradeInstance/:id Delete Trade Instance Id
 * @apiName DeleteTradeInstance.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will retrun/generate new instance id for requested application id.
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 * 
 * @apiHeaderExample Header-Example: 
 * 	  { 
 * 			"Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *                   	"Content-Type" : application/json 
 *                   }
 * 
 * @apiExample Example usage: 
 * curl -i  http://baseurl/v1/tradetool/action/deleteTradeInstance/12
 * 
 * @apiParamExample Body Param
 * 
 * {
    "appId" : 7,
    "reason": "Testing purpose."
}
*
 * 
 * @apiError Unauthorized Invalid / Without JWT Token.
 * 
 * @apiErrorExample Response (example): 
* HTTP / 1.1 401 Unauthorized {
*     "message": "Invalid Authorization Header"
* }
 * @apiError Bad_Request When without request data.
 * 
 * @apiErrorExample Response (example): 
* HTTP / 1.1 400 Bad_Request {
*     "message": "Bad Request: Verify request data"
* }
* 
* * @apiError Not Found When App id not exist.
 * 
 * @apiErrorExample Response (example): 
* HTTP / 1.1 404 Not Found {
*     "message": "Data not found"
* }
 * 
 */

app.delete('/action/deleteTradeInstance/:id', function(req, res) {
	logger.info("generate trade instance request received.");

	// Trade need to handle

	if (req.params.id == undefined) {
		logger.error("delete trade instance request error :: \n Invalida or Null instance id.");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}

	var tradesInstance = {
			instanceId : req.params.id,
	}

	req.data.tradesInstance = tradesInstance;
	
	tradeInstanceService.deleteTradeInstance(req.data, function(err, status, data) {
		return response(err, status, data, res);
	});
});

module.exports = app;