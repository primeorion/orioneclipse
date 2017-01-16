"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCode;
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var taxLossHarvestingService = new(require('service/tradetool/TaxLossHarvestingService.js'))();
var helper = require('helper');
var validate = helper.validate;
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js").getDifferentAccessForUser;

/**
 * @api {post} /tradetool/taxLossHarvesting/action/createTrade Create Trade in TLH on user conditions
 * @apiName TLH Trade Tool - Create Trades
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will create trades on user conditions.
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
 * curl -i  http://baseurl/v1/tradetool/taxLossHarvesting/action/createTrade
 *
 * @apiParam {Boolean}      taxableAccountsOnly        To include taxable accounts or not. Default - TRUE
 * @apiParam {Integer}      gainLoss                   Profit/Loss to consider. Options(0: Loss, 1: Gain)
 * @apiParam {Integer}      term                       Term to consider. Options (1: "Both", 2: "Short Term", 3: "Long Term")
 * @apiParam {Integer}      sign                       Sign selected. Options (1: '<', 2: '>', 3: '=')
 * @apiParam {Decimal}      amount                     Amount Specified to filter trades
 * 
 * @apiParamExample {json} Request-Example:
 * {
 *   "taxableAccountsOnly": false,
 *   "gainLoss": 1,
 *   "term": 1, 
 *   "sign": 1,
 *   "amount": 123.23
 * }
 * 
 * @apiSuccess {Number} API will return trades which fulfill conditions specified by user
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
 *
 * [
 *  {
      "accountName": "Rogers Roy and Dale",
      "accountNumber": "L204-ELPMAS",
      "accountType": "TAXABLE",
      "symbol": "DIS",
      "sell_price": 98,
      "portfolioRealizedYTDGL$": 123456,
      "totalGLAmount": 62596.05,
      "GLPercent": 526.7276452695,
      "STGLAmount": null,
      "LTGLAmount": 62596.05,
      "accountValue": 1234,
      "cashValue": 123,
      "securityName": "Disney Walt Co",
      "currentShares": 760,
      "currentValue$": 9031802,
      "currentPercent": 25,
      "custodian": "Schwab",
      "managementStyle": "Neutral",
      "accountId": 556,
      "portfolioId": 118,
      "equivalentSecurityId": null,
      "equivalentSecurityName": null,
      "securityId": 1029
 *  },
 *  {
      "accountName": "Rogers Roy and Dale",
      "accountNumber": "L204-ELPMAS",
      "accountType": "TAXABLE",
      "symbol": "PG",
      "sell_price": 82,
      "portfolioRealizedYTDGL$": 123456,
      "totalGLAmount": 34294.92,
      "GLPercent": 27.3037682871,
      "STGLAmount": null,
      "LTGLAmount": 34294.92,
      "accountValue": 1234,
      "cashValue": 123,
      "securityName": "Procter & Gamble Co",
      "currentShares": 1950,
      "currentValue$": 244929906,
      "currentPercent": 25,
      "custodian": "Schwab",
      "managementStyle": "Neutral",
      "accountId": 556,
      "portfolioId": 118,
      "equivalentSecurityId": 946,     // Default Buy Security Id
      "equivalentSecurityName": "iShares S&P SmallCap 600 Growth ETF",   // Default Buy Security Name
      "securityId": 1124
 *  }
 * ]
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

app.post('/action/createTrade', UserTeamAccessMiddleWare, function(req, res) {
  logger.info("Tax Loss Harvesting Trades controller called with conditions.");


  // var data = [
  //   {
  //     accountName: 'dummy1',
  //     accountNumber: 123,
  //     accountType: 'Taxable',
  //     securitySymbol: 'AAPL',
  //     portfolioRealizedYtdGL: 20,
  //     totalGLAmount: 50,
  //     GLPercent: 3.45,
  //     STGLAmount: 15,
  //     LTGLAmount: 25,
  //     accountValue: 54444,
  //     cashValue: 4332,
  //     securityName: "Apple",
  //     currentShares: 3232,
  //     currentPercent: 25,
  //     custodian: "dummy",
  //     managementStyle: "dummy1",
  //     accountId: 123,
  //     portfolioId: 321
  //   },
  //   {
  //     accountName: 'dummy1',
  //     accountNumber: 123,
  //     accountType: 'Taxable',
  //     securitySymbol: 'AAPL',
  //     portfolioRealizedYtdGL: 20,
  //     totalGLAmount: 50,
  //     GLPercent: 3.45,
  //     STGLAmount: 15,
  //     LTGLAmount: 25,
  //     accountValue: 54444,
  //     cashValue: 4332,
  //     securityName: "Apple",
  //     currentShares: 3232,
  //     currentPercent: 25,
  //     custodian: "dummy",
  //     managementStyle: "dummy1",
  //     accountId: 123,
  //     portfolioId: 321
  //   },
  //   {
  //     accountName: 'dummy1',
  //     accountNumber: 123,
  //     accountType: 'Taxable',
  //     securitySymbol: 'AAPL',
  //     portfolioRealizedYtdGL: 20,
  //     totalGLAmount: 50,
  //     GLPercent: 3.45,
  //     STGLAmount: 15,
  //     LTGLAmount: 25,
  //     accountValue: 54444,
  //     cashValue: 4332,
  //     securityName: "Apple",
  //     currentShares: 3232,
  //     currentPercent: 25,
  //     custodian: "dummy",
  //     managementStyle: "dummy1",
  //     accountId: 123,
  //     portfolioId: 321
  //   }
  // ]
  // return response(null, 'SUCCESS', data, res);
  
  // Gain Loss Harvesting Trades to be Calculated
  taxLossHarvestingService.createTrades(req.data, function(err, status, data) {
    return response(err, status, {trades: data}, res);
  });
});

/**
 * @api {post} /tradetool/taxLossHarvesting/action/generateTrade TLH Generate Trade
 * @apiName TLH Trade Tool - Generate Trades
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will generate trades as per user input.
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
 * curl -i  http://baseurl/v1/tradetool/taxLossHarvesting/action/generateTrade
 *
 * @apiParam {Object}       trades                     Array of trades selected for swap
 * @apiParam {Integer}      accountId                  Account id of trade
 * @apiParam {Integer}      sellTickerId               Ticker id to be sold in trade
 * @apiParam {String}       sellTickerName             Name of ticker to be sold in trade
 * @apiParam {Decimal}      sellPercent                Percent of Ticker to be sold
 * @apiParam {Integer}      buyTickerId                Ticker id to be bought in trade
 * @apiParam {String}       buyTickerName              Name of ticker to be bought in trade
 * @apiParam {Decimal}      buyPercent                 Percent of cash raised from sold ticker to be invested in buying the security
 * 
 * @apiParamExample {json} Request-Example:
 * {trades: [
 *   {
 *      "accounId": 1,
 *      "sellTickerId": 25,
 *      "sellTickerName": "AAPL",
 *      "percent": 20,
 *      "buyTickerId": 42,
 *      "buyTickerName": "MSFT"
 *    },
 *   {
 *      "accounId": 1,
 *      "sellTickerId": 35,
 *      "sellTickerName": "AAPL",
 *      "percent": 20,
 *      "buyTickerId": 45,
 *      "buyTickerName": "MSFT"
 *    },
 *   {
 *      "accounId": 1,
 *      "sellTickerId": 85,
 *      "sellTickerName": "AAPL",
 *      "percent": 20,
 *      "buyTickerId": 92,
 *      "buyTickerName": "MSFT"
 *    }
 * ]}
 * 
 * @apiSuccess {Number} API will return trades with are successfully executed
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
 *          "percent": 20,
 *          "buyTickerId": 45,
 *          "buyTickerName": "MSFT",
 *          "status": "Success",
 *          "reason": "Successful executed swap."
 *      },
 *      {
 *          "accountId": 5, 
 *          "sellTickerId": 25,
 *          "sellTickerName": "AAPL",
 *          "percent": 20,
 *          "buyTickerId": 45,
 *          "buyTickerName": "MSFT",
 *          "status": "Failed",
 *          "reason": "Duplicate trade swap."
 *      },
 *      {
 *          "accountId": 2, 
 *          "sellTickerId": 65,
 *          "sellTickerName": "IBM",
 *          "percent": 20,
 *          "buyTickerId": 45,
 *          "buyTickerName": "FCBK",
 *          "status": "Failed",
 *          "reason": "Gain percent far below the specified percent."
 *      },    
 *      {
 *          "accountId": 15, 
 *          "sellTickerId": 65,
 *          "sellTickerName": "IBM",
 *          "percent": 20,
 *          "buyTickerId": 65,
 *          "buyTickerName": "IBM",
 *          "status": "Failed",
 *          "reason": "Same Securities."
 *      },    
 *      {
 *          "accountId": 8, 
 *          "sellTickerId": 165,
 *          "sellTickerName": "TRE",
 *          "percent": 20,
 *          "buyTickerId": 85,
 *          "buyTickerName": "SFA",
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

app.post('/action/generateTrade', UserTeamAccessMiddleWare, function(req, res) {
  logger.info("TLH  Trade Tool controller called.");

  var data = [
    {
      "accountId": 1, 
      "sellTickerId": 165,
      "sellTickerName": "TRE",
      "buyTickerId": 85,
      "buyTickerName": "SFA",
      "percent": 20,
      "status": "Failed",
      "reason": "Selling Percentage exceed 100%."
    }, 
    {
      "accountId": 1, 
      "sellTickerId": 165,
      "sellTickerName": "TRE",
      "buyTickerId": 85,
      "buyTickerName": "SFA",
      "percent": 20,
      "status": "Failed",
      "reason": "Selling Percentage exceed 100%."
    },
    {
      "accountId": 1, 
      "sellTickerId": 165,
      "sellTickerName": "TRE",
      "buyTickerId": 85,
      "buyTickerName": "SFA",
      "percent": 20,
      "status": "Failed",
      "reason": "Selling Percentage exceed 100%."
    }
  ]
  return response(null, 'SUCCESS', data, res);
  
  // TLH Trade to be Generated
  // taxLossHarvestingService.generateTrades(req.data, function(err, status, data) {
  //   return response(err, status, data, res);
  // });
});

/**
 * @api {get} /tradetool/taxLossHarvesting/gainloss/options TLH Selection Filter Gain Loss Drop Down
 * @apiName TLH Trade Tool - Selection Filter Param Dropdown For Gain Loss
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will give drop down of gain loss params.
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
 * curl -i  http://baseurl/v1/tradetool/taxLossHarvesting/gainloss/options
 * 
 * 
 * @apiSuccess {Number} API will return params drop down details for gain loss
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
 *
 * { methods: [
 *  {
 *    "id": "1", 
 *    "name": "Loss"     
 *  },
 *  {
 *    "id": "2", 
 *    "name": "Gain"    
 *   }
*  ]}
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

app.get('/gainloss/options', function(req, res) {
  logger.info("TLH selection filter params called for gain loss drop down.");

  var data = [
    {
      "id": 1, 
      "name": "Loss"           
    },
    {
      "id": 2, 
      "name": "Gain"      
    }
  ]
  return response(null, 'SUCCESS', {methods: data}, res);
});

/**
 * @api {get} /tradetool/taxLossHarvesting/term/options TLH Selection Filter Term Drop Down
 * @apiName TLH Trade Tool - Selection Filter Param Dropdown For Term
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will give drop down of term params.
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
 * curl -i  http://baseurl/v1/tradetool/taxLossHarvesting/term/options
 * 
 * 
 * @apiSuccess {Number} API will return params drop down details for gain loss
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
 *
 * {methods: [
 *  {
 *    "id": "1", 
 *    "name": "Both"     
 *  },
 *  {
 *    "id": "2", 
 *    "name": "Short Term"    
 *   },
 *  {
 *    "id": "3", 
 *    "name": "Long Term"    
 *   }
 *  ]}
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

app.get('/term/options', function(req, res) {
  logger.info("TLH selection filter params called.");

  var data = [
    {
      "id": 1, 
      "name": "Both"           
    },
    {
      "id": 2, 
      "name": "Short Term"      
    },
    {
      "id": 3, 
      "name": "Long Term"      
    }
  ]

  return response(null, 'SUCCESS', {methods: data}, res);
});

/**
 * @api {get} /tradetool/taxLossHarvesting/sign/options TLH Selection Filter Sign Drop Down
 * @apiName TLH Trade Tool - Selection Filter Param Dropdown For Sign
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 * 
 * @apiDescription This API will give drop down of sign params.
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
 * curl -i  http://baseurl/v1/tradetool/taxLossHarvesting/sign/options
 * 
 * 
 * @apiSuccess {Number} API will return params drop down details for gain loss
 * 
 * @apiSuccessExample {json} Success-Response: HTTP/1.1 200 OK 
 *
 * {methods: [
 *  {
 *    "id": "1", 
 *    "name": "<"     
 *  },
 *  {
 *    "id": "2", 
 *    "name": ">"    
 *   },
 *  {
 *    "id": "3", 
 *    "name": "="    
 *   }
 *  ]}
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

app.get('/sign/options', function(req, res) {
  logger.info("TLH selection filter params called.");

  var data = [
    {
      "id": 1, 
      "name": "<"           
    },
    {
      "id": 2, 
      "name": ">"      
    },
    {
      "id": 3, 
      "name": "="      
    }
  ]
  return response(null, 'SUCCESS', {methods: data}, res);
});

module.exports = app;