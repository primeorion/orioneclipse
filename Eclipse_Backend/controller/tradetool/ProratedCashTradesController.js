"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCode;
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var ProratedCashTradesService = require('service/tradetool/ProratedCashTradesService.js');
var proratedCashTradesService = new ProratedCashTradesService();

/**
 * @api {post} /tradetool/proratedcash/action/generatetrade Prorated Cash Trade Tool
 * @apiName Prorated Cash Trade Tool.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will used to generate trades for Prorated Cash.
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 * 
 * @apiHeaderExample Header-Example:
 *                   { 
 *                   "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *                   "Content-Type" : application/json 
 *                   }
 *                   
 * 
 * @apiExample Example usage: 
 * curl -i http://baseurl/v1/tradetool/proratedcash/action/generatetrade
 * 
 * @apiParamExample Body Param
 *  {
 *  "action": 1,
 * "portfolioIds": [1,2,5],
 * "modelIds": null,
 * "sleeveAccountIds": [12], 
 * "tradeGroupIds": null,
 * "reason": "reason to Raise or Spend cash"
 *}
 * 
 * @apiSuccess {json} API will return trade instanceId against request and list of failed ids depends on trade request type.
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
 *
*{
*  "type": "SleevePortfolio",
*  "instanceId": 119,
*  "portfolios": [
*    {
*      "id": 1,
*      "name": "Smith & Company"
*    },
*    {
*      "id": 5,
*      "name": "James and Garry"
*    }
*  ],
*  "models": null,
*  "groups": null,
*  "sleevePortfolios": [
*    {
*      "id": 12,
*      "name": "Sleeve Portfolio 1",
*      "accounts": [
*        {
*          "id": 1,
*          "name": "Smith and Jessus Account",
*          "accountNo": 1234
*        },
*        {
*          "id": 1,
*          "name": "Smith & Company",
*          "accountNo": 132323
*        }
*      ]
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

app.post('/action/generatetrade', function (req, res) {
    logger.info("Prorated Cash trades request received.");

    var prorateTradeRequestType = null;

    if ((!req.body.portfolioIds) && (!req.body.modelIds) && (!req.body.sleeveAccountIds) && (!req.body.tradeGroupIds)) {
        logger.error("Prorated Cash trades request error :: \n Please provide models/Portfolios list to generate trades.");
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    if (req.body.portfolioIds) {
        req.data.portfolioIds = req.body.portfolioIds;
        if (req.body.sleeveAccountIds) {
            req.data.sleeveAccountIds = req.body.sleeveAccountIds;
            prorateTradeRequestType = "SleevePortfolio";
        } else {
            prorateTradeRequestType = "Portfolio";
        }

    } else if (req.body.modelIds) {
        req.data.modelIds = req.body.modelIds;
        prorateTradeRequestType = "Model";
    } else if (req.body.tradeGroupIds) {
        req.data.tradeGroupIds = req.body.tradeGroupIds;
        prorateTradeRequestType = "Group";
    } else {
        logger.error("Prorated Cash trades request error :: \n Please provide models/Portfolios list to generate trades.");
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

	req.data.hostname = req.headers['host'];
	req.data.authKey =  req.headers['authorization'];
	logger.debug(JSON.stringify(req.headers));
	
    var prorateCash = {
    		requestType: prorateTradeRequestType,
			action : req.body.action,
			portfolioIds : req.body.portfolioIds,
			modelIds : req.body.modelIds,
			sleeveAccountIds : req.body.sleeveAccountIds,
			tradeGroupIds : req.body.tradeGroupIds,
			description : req.body.reason,
	}

	req.data.prorateCash = prorateCash;
    
    proratedCashTradesService.generateProrateCash(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;