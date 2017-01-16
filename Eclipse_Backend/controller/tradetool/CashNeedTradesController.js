"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCode;
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var CashNeedTradeService = require('service/tradetool/CashNeedTradeService.js');
var cashNeedTradeService = new CashNeedTradeService();

/**
 * @api {post} /tradetool/cashneeds/action/generatetrade Cash Needs Trade Tool
 * @apiName Cash Needs Trade Tool.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will rebalance the CashNeeds Portfolios.
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
 * curl -i  http://baseurl/v1/tradetool/cashneeds/action/generatetrade
 * 
 * @apiParamExample Body Param
 * {
 *   "portfolioIds": [11214807,1],
 *   "portfolioTradeGroupIds": [],
 *   "reason": "reason" 
 * }
 * 
 * @apiSuccess {Number} API will return trade instanceId against request and list of portfolio id which were fail to generate trade.
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
*
*{
*  "instanceId": 112,
*  "issues": [
*    {
*      "portfolioId": 11214807,
*      "message": "Unable to generate CashNeeds Trade for portfolio"
*    },
*    {
*      "portfolioId": 1,
*      "message": "Unable to generate CashNeeds Trade for portfolio"
*    }
*  ]
*}
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
 */

app.post('/action/generatetrade', function(req, res) {
	logger.info("CashNeeds rebalance request received.");

	// Trade need to handle

	if (req.body.portfolioIds == undefined) {
		logger.error("CashNeeds Rebalance request error :: \n Invalida or Null Portfolio ids list.");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}

	if (req.body.portfolioIds) {
		req.data.portfolioIds = req.body.portfolioIds;
	}

	req.data.rebalanceType == "cashNeed";
	
	req.data.hostname = req.headers['host'];
	req.data.authKey =  req.headers['authorization'];
	logger.debug(JSON.stringify(req.headers));
	
	var cashNeeds = {
			portfolioIds : req.body.portfolioIds,
			description : req.body.reason
	}

	req.data.cashNeeds = cashNeeds;
	
	cashNeedTradeService.cashNeedsRebalance(req.data, function(err, status, data) {
		return response(err, status, data, res);
	});
});

module.exports = app;