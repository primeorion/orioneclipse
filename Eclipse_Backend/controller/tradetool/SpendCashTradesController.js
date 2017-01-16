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
var SpendCashTradeService = require('service/tradetool/SpendCashTradeService.js');
var spendCashTradeService = new SpendCashTradeService();

var spendCashPostJsonSchema = {
	    type: 'object',
	    properties: {
	        selectedMethodId: {
	            type: 'number',
	            required: true
	        },
	        spendFullAmount: {
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
 * @api {get} /tradetool/spendcash/calculation_methods Get Spend Cash Trade Methods 
 * @apiName getSpendCashTradeMethods.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This api will provide a list of available Spend Cash calculation method and on selected method.
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
 * curl -i  http://baseurl/v1/tradetool/spendcash/calculation_methods
 * 
 *
 * 
 **@apiSuccess {List}  	 methods       			 List of spend cash methods.
 *@apiSuccess {Number}   selectedMethodId        Id of selected Sepend cash methods.
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
*
*{
  "methods": [
    {
      "id": 44,
      "name": "Use Default (Selected by Default)"
    },
    {
      "id": 40,
      "name": "Pro-Rata"
    },
    {
      "id": 41,
      "name": "Buy Rebalance"
    },
    {
      "id": 42,
      "name": "Buy Rebalance OverBuy"
    },
    {
      "id": 43,
      "name": "Buy Rebalance with Emphasis"
    },
    {
      "id": 44,
      "name": "Buy with full rebalance"
    }
  ],
  "selectedMethodId": 44
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
	logger.info("SpendCash getMethods request recieved.");
	
	var data=req.data;
	data.firmId=data.user.firmId
	
	spendCashTradeService.getCalculationMethods(data, function(err, status, data) {
		return response(err, status, data, res);
	});
	
});

/**
 * @api {post} /tradetool/spendcash/action/generatetrade Generate Spend Cash Trade
 * @apiName generateSpendCashTrade.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This api will accept set of portfolios to generate spend cash trade.
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
 * curl -i  http://baseurl/v1/tradetool/spendcash/action/generatetrade
 * 
 * @apiParamExample Body Param
 * {
    "selectedMethodId": 40,
    "spendFullAmount": false,
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
    body: spendCashPostJsonSchema
})], function(req, res) {
	logger.info("SpendCash rebalce request recieved.");

	if (req.body.selectedMethodId == undefined || isNaN(req.body.selectedMethodId)) {
		logger.error("SpendCash Rebalance request error :: \n Invalida or Null selectedMethodId.");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}

	if (req.body.spendFullAmount === undefined) {
		logger.error("SpendCash Rebalance request error :: \n spendFullAmount is Null or Invalid");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}

	if (req.body.filterType == undefined || req.body.filterType == "") {
		logger.error("SpendCash Rebalance request error :: \n filterType is Null or Invalid");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}
	if(req.body.accounts == null && req.body.emphasiedAccounts == null && req.body.sleevedPortfolios == null){
		logger.error("spendCash Rebalance request error :: \n Invalid or wrong query parameters");
		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
	}
	
	var SpendCash = {
		selectedMethodId : req.body.selectedMethodId,
		spendFullAmount : req.body.spendFullAmount,
		filterType : req.body.filterType,
		accounts : req.body.accounts ? req.body.accounts : null,
		emphasiedAccounts : req.body.emphasiedAccounts ? req.body.emphasiedAccounts : null,
		sleevedPortfolios : req.body.sleevedPortfolios ? req.body.sleevedPortfolios : null,
		description : req.body.reason
	}

	req.data.spendCash = SpendCash;

	req.data.hostname = req.headers['host'];
	req.data.authKey = req.headers['authorization'];
	logger.debug(JSON.stringify(req.headers));
	req.data.rebalanceType == "spendCash";

	spendCashTradeService.spendCashRebalance(req.data, function(err, status, data) {
		return response(err, status, data, res);
	});
});




module.exports = app;