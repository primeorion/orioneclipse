"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCode;
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var tickerSwapService = new(require('service/tradetool/TickerSwapService.js'))();
var helper = require('helper');
var validate = helper.validate;

var ticker_swap_data = {
  type: "object",
  properties: {
    portfolioIds: {
      type: ["array", null],
      required: true,
      minItems: 1
    },
    modelIds: {
      type: ["array", null],
      required: true,
      minItems: 1
    },
    accountIds: {
      type: ["array", null],
      required: true,
      minItems: 1
    },
    tradeGroupForAccountIds: {
      type: ["array", null],
      required: true,
      minItems: 1
    },
    tradeGroupForPortfolioIds: {
      type: ["array", null],
      required: true,
      minItems: 1
    },
    tickerSwap: {
      type: "array",
      required: true
    },
    swapOptions: {
      type: "object",
      properties: {
        tickerBatch: {
          type: "number",
          required: true,
          enum: [1, 2, 3]
        },
        profitLoss: {
          type: "number",
          required: true,
          enum: [0, 1]
        },
        value: {
          type: "number",
          required: true
        },
        valueType: {
          type: "number",
          required: true,
          enum: [1, 2]
        },
        includeTaxDeferredOrExemptAccounts: {
          type: "boolean",
          required: true
        },
        instanceNote: {
          type: "string",
          required: true
        } 
      }
    }       
  }
}

/**
 * @api {post} /tradetool/tickerswap/action/generateTrade Swap Ticker
 * @apiName Ticker Swap Trade Tool
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will swap ticker. User will select one of the selected ids (model, portfolio, account, trader group accounts or trade group portfolios)
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 * 
 * @apiHeaderExample Header-Example: 
 *    { 
 *      "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *      "Content-Type" : application/json 
 *    }
 * 
 * @apiExample Example usage: 
 * curl -i  http://baseurl/v1/tradetool/tickerswap/action/generateTrade
 *
 * @apiParam {Array}        portfolioIds               Portfolio ids
 * @apiParam {Array}        modelIds                   Model ids
 * @apiParam {Array}        accountIds                 Account ids
 * @apiParam {Array}        tradeGroupForAccountIds    Trade Group Account ids
 * @apiParam {Array}        tradeGroupForPortfolioIds  Trade Group Portfolio ids
 * @apiParam {Array}        tickerSwap                 Tickers to Swap.
 * @apiParam {Object}       swapOptions                Swap options to consider while making trades
 * @apiParam {Integer}      swapOptions[tickerBatch]   Batch to consider. Options (1: "Total", 2: "Short Term", 3: "Long Term")
 * @apiParam {Integer}      swapOptions[profitLoss]    Profit/Loss to consider for swap. Options(0: Loss, 1: Gain)
 * @apiParam {Integer}      swapOptions[value]         Value of Profit-Loss to consider for swap ticker
 * @apiParam {Integer}      swapOptions[valueType]     Value Type like (Dollar, Percent) to consider for swapping. Options(1: "Dollar", 2: "Percent")
 * @apiParam {Boolean}      swapOptions[includeTaxDeferredOrExemptAccounts]  Also include Tax Deferred & Tax Exempt Accounts
 * @apiParam {String}       swapOptions[instanceNote]  Note to make in particular instance. 
 * 
 * @apiParamExample {json} Request-Example:
 * {
 *   "portfolioIds": [1,2,5],
 *   "modelIds": null,
 *   "accountIds": null, 
 *   "tradeGroupForAccountIds": null,
 *   "tradeGroupForPortfolioIds": null,
 *   "tickerSwap": [
 *       {
 *          "sellTickerId": 25,
 *          "sellTickerName": "AAPL",
 *          "buyTickerId": 42,
 *          "buyTickerName": "MSFT",
 *          "percent": 20
 *       },
 *       {
 *          "sellTickerId": 65,
 *          "sellTickerName": "IBM",
 *          "buyTickerId": 90,
 *          "buyTickerName": "TLE",
 *          "percent": 40
 *       },
 *       {
 *          "sellTickerId": 65,
 *          "sellTickerName": "IBM",
 *          "buyTickerId": -1,   // NOTE: Raising Cash by selling ticker
 *          "buyTickerName": "Raise Cash",
 *          "percent": 40
 *       }
 *    ],
 *   "swapOptions": {
 *      "tickerBatch": 1,
 *      "profitLoss": 1,
 *      "value": 50,
 *      "valueType": 0,
 *      "includeTaxDeferredOrExemptAccounts": false,
 *      "instanceNote": "Booking Profit and investing in under performed securities"
 *    }
 * }
 * 
 * @apiSuccess {Number} API will return trades with different responses if not considered
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
 *
 * {
 *   "tradeInstanceId": 35,
 *   "trades": [
 *      {
 *          "accountId": 1, 
 *          "sellTickerId": 25,
 *          "sellTickerName": "AAPL",
 *          "buyTickerId": 45,
 *          "buyTickerName": "MSFT",
 *          "percent": 20,
 *          "status": "Success",
 *          "reason": "Successful executed swap."
 *      },
 *      {
 *          "accountId": 5, 
 *          "sellTickerId": 25,
 *          "sellTickerName": "AAPL",
 *          "buyTickerId": 45,
 *          "buyTickerName": "MSFT",
 *          "percent": 20,
 *          "status": "Failed",
 *          "reason": "Duplicate trade swap."
 *      },
 *      {
 *          "accountId": 2, 
 *          "sellTickerId": 65,
 *          "sellTickerName": "IBM",
 *          "buyTickerId": 45,
 *          "buyTickerName": "FCBK",
 *          "percent": 20,
 *          "status": "Failed",
 *          "reason": "Gain percent far below the specified percent."
 *      },    
 *      {
 *          "accountId": null, 
 *          "sellTickerId": 65,
 *          "sellTickerName": "IBM",
 *          "buyTickerId": 65,
 *          "buyTickerName": "IBM",
 *          "percent": 20,
 *          "status": "Failed",
 *          "reason": "Same Securities."
 *      },    
 *      {
 *          "accountId": null, 
 *          "sellTickerId": 165,
 *          "sellTickerName": "TRE",
 *          "buyTickerId": 85,
 *          "buyTickerName": "SFA",
 *          "percent": 20,
 *          "status": "Failed",
 *          "reason": "Selling Percentage exceed 100%."
 *      }, 
 *   ]
 * }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 * 
 * @apiErrorExample Response (example): 
*  HTTP / 1.1 401 Unauthorized {
*     "message": "Invalid Authorization Header"
*  }
*  @apiError Bad_Request When without request data.
* 
*  @apiErrorExample Response (example): 
*  HTTP / 1.1 400 Bad_Request {
*     "message": "Bad Request: Verify request data"
*  }
* 
*  @apiErrorExample Response (example):
*     HTTP/1.1 500 INTERNAL_SERVER_ERROR
*     {
*       "message": "INTERNAL_SERVER_ERROR."
*     }
* 
*/

app.post('/action/generateTrade', validate({ body: ticker_swap_data }), function(req, res) {
  logger.info("Ticker Swap Trades controller called.");
  // Ticker Swap Trade to be Calculated
  tickerSwapService.swapTrade(req.data, function(err, status, data) {
    return response(err, status, data, res);
  });
});

module.exports = app;