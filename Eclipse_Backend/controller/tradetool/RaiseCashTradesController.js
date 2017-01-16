"use strict";

var app=require("express")();
var moduleName=__filename;

var logger = require("helper/Logger.js")(moduleName);
var config = require('config');
var validate = require('express-jsonschema').validate;
var messages = config.messages;
var responseCodes = config.responseCode;
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var RaiseCashTradeService = require('service/tradetool/RaiseCashTradeService.js');
var raiseCashTradeService = new RaiseCashTradeService();

var raiseCashPostJsonSchema = {
	    type: 'object',
	    properties: {
	        selectedMethodId: {
	            type: 'number',
	            required: true
	        },
	        raiseFullAmount: {
	            type: ["boolean", "null", "String"],
	            required: true,
	            enum: [0, 1, "0", "1", "false", "true", false, true, "null",null]
	        },
	        filterType: {
	            type: 'String',
	            required: true,
	            enum: ["Accounts", "SleevePortfolio"]
	        },
	        reason: {
	            type: ["null", "String"],
	            required: true
	        },
	        accounts: {
	            type: ["array", "null"],
	            required: false,
	            items: {
	                type: 'object',
	                required: true,
	                properties: {
	                    id: {
	                        type: ["number"],
	                        required: true
	                    },
	                    amount: {
	                        type: 'number',
	                        required: true
	                    }
	                }
	            }
	        },
	        sleevedPortfolios: {
	            type: ["array", "null"],
	            required: false,
	            items: {
	                type: 'object',
	                properties: {
	                    id: {
	                        type: ["number"],
	                        required: true
	                    },
	                    amount: {
	                        type: 'number',
	                        required: true
	                    }
	                }
	            }
	        },
	        emphasiedAccounts: {
	            type: ["array", "null"],
	            required: false,
	            items: {
	                type: 'object',
	                required: true,
	                properties: {
	                    id: {
	                        type: ["number"],
	                        required: true
	                    },
	                    node: {
	                        type: 'object',
	                        properties: {
	                            level: {
	                                type: ["number", "String"],
	                                required: false
	                            },
	                            id: {
	                                type: ["number"],
	                                required: true
	                            },
	                            amount: {
	                                type: ["number"],
	                                required: true
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    }
	};






/**
 * @api {get} /tradetool/raisecash/calculation_methods Get Raise Cash Trade Methods 
 * @apiName getRaiseCashTradeMethods.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This api will provide a list of available Raise Cash calculation method and on selected method.
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
 * curl -i  http://baseurl/v1/tradetool/raisecash/calculation_methods
 * 
 *
 * 
 **@apiSuccess {List}  	 methods       			 List of raise cash methods.
 *@apiSuccess {Number}   selectedMethodId        Id of selected raise cash methods.
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
*
{
  "methods": [
    {
      "id": 70,
      "name": "Use Default (Selected by Default)"
    },
    {
      "id": 66,
      "name": "Pro-Rata"
    },
    {
      "id": 67,
      "name": "Sell Rebalance"
    },
    {
      "id": 68,
      "name": "Sell Rebalance Oversell"
    },
    {
      "id": 69,
      "name": "Sell Rebalance with Emphasis"
    },
    {
      "id": 70,
      "name": "Sell with full rebalance"
    },
    {
      "id": -1,
      "name": "Best Tax"
    }
  ],
  "selectedMethodId": 70
}
*
 * @apiError Unauthorized Invalid / Without JWT Token.
 * 
 * @apiErrorExample Response (example): 
* HTTP / 1.1 401 Unauthorized {
*     "message": "Invalid Authorization Header"
* }
 * 
*/



app.get('/calculation_methods',function(req,res){
	logger.info("RaiseCash getMethods request recieved.");
	
	var data=req.data;
	data.firmId=data.user.firmId
	
	raiseCashTradeService.getCalculationMethods(data, function(err, status, data) {
		return response(err, status, data, res);
	});
	
});

/**
 * @api {post} /tradetool/raisecash/action/generatetrade Generate Raise Cash Trade
 * @apiName generateRaiseCashTrade.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This api will accept set of portfolios to generate raise cash trade.
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
 * curl -i  http://baseurl/v1/tradetool/raisecash/action/generatetrade
 * 
 * @apiParamExample Body Param
 * {
    "selectedMethodId": 70,
    "raiseFullAmount": false,
    "filterType": <"Accounts"/"SleevePortfolio">,

    "accounts": [{
        "id": accountId,
        "amount": 100
    }, {
        "id": accountId,
        "amount": 110
    }],

    "sleevedPortfolios": [{
        "id": 11214807,
        "amount": 100
    }, {
        "id": 11214808,
        "amount": 110
    }],

   "emphasiedAccounts": [{
        "id": 11214807,
        "node": {
            "level": < LevelId > ,
            "id": < nodeId > ,
            "amount": 100
        }
    }, {
        "id": 11214808,
        "node": {
            "level": < LevelId > ,
            "id": < nodeId > ,
            "amount": 110
        }
    }],

    "reason": "any reason for trade"
}
 * 
 * @apiSuccess {String} API will return success message.
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
*
* {
*     "message": "Trade generated successfully."
* }
*
 * @apiError Unauthorized Invalid / Without JWT Token.
 * 
 * @apiErrorExample Response (example): 
* HTTP / 1.1 401 Unauthorized {
*     "message": "Invalid Authorization Header"
* }
 * 
 */


app.post('/action/generatetrade', [validate({
    body: raiseCashPostJsonSchema
})], function(req, res) {
	logger.info("RaiseCash rebalce request recieved.");

	if (req.body.selectedMethodId == undefined || isNaN(req.body.selectedMethodId)) {
		logger.error("RaiseCash Rebalance request error :: \n Invalida or Null selectedMethodId.");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}

	if (req.body.raiseFullAmount === undefined) {
		logger.error("RaiseCash Rebalance request error :: \n spendFullAmount is Null or Invalid");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}

	if (req.body.filterType == undefined || req.body.filterType == "") {
		logger.error("RaiseCash Rebalance request error :: \n filterType is Null or Invalid");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}
	if(req.body.accounts == null && req.body.emphasiedAccounts == null && req.body.sleevedPortfolios == null){
		logger.error("RaiseCash Rebalance request error :: \n Invalid or wrong query parameters");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}

	var RaiseCash = {
		selectedMethodId : req.body.selectedMethodId,
		raiseFullAmount : req.body.raiseFullAmount,
		filterType : req.body.filterType,
		accounts : req.body.accounts ? req.body.accounts : null,
		emphasiedAccounts : req.body.emphasiedAccounts ? req.body.emphasiedAccounts : null,
		sleevedPortfolios : req.body.sleevedPortfolios ? req.body.sleevedPortfolios : null
	}

	req.data.raiseCash = RaiseCash;

	req.data.hostname = req.headers['host'];
	req.data.authKey = req.headers['authorization'];
	logger.debug(JSON.stringify(req.headers));
	req.data.rebalanceType == "raiseCash";

	raiseCashTradeService.raiseCashRebalance(req.data, function(err, status, data) {
		return response(err, status, data, res);
	});
});




module.exports = app;