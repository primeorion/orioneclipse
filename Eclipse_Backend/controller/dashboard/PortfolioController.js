"use strict";

var app = require("express")();
var util = require('util');
var moduleName = __filename;
var helper = require('helper');

var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');

var PortfolioService = require('service/dashboard/PortfolioService.js');
var portfolioService = new PortfolioService();
var HoldingDashBoardService = require('service/dashboard/HoldingDashBoardService.js');
var holdingDashBoardService = new HoldingDashBoardService();

/**
 * @api {get} /dashboard/portfolio/summary Get Portfolio Dashboard Summary
 * @apiName GetPortfoliosSummaryOnDashboard
 * @apiVersion 1.0.0
 * @apiGroup Dashboard
 * @apiPermission appuser
 *
 * @apiDescription This API gets Portfolio Summary on Dashboard. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dashboard/portfolio/summary
 * 
 * @apiSuccess {Date}       analyticsOn         Date and Time (on which the analytics report was run).
 * @apiSuccess {JSON}       portfolio           Portfolio Summary.
 * @apiSuccess {Number}     -total              Total number of Portfolios for which the current user has access.
 * @apiSuccess {Number}     -existing           Number of portfolios created > 24 hours ago.
 * @apiSuccess {Number}     -new                Newly created Portfolio (Total - Existing).
 * @apiSuccess {JSON}       AUM                 Assets under management of Portfolios.
 * @apiSuccess {Number}     -total              Total AUM for all portfolios for which the current user has access
 * @apiSuccess {Number}     -changeValue        Change in AUM value (Total AUM- Previous day’s AUM)
 * @apiSuccess {Number}     -changePercent      Percentage of changed AUM value (% change in Previous day’s AUM).
 * @apiSuccess {String}     -status             Status value of changed AUM value for Positive change, Negative change and No change ["high", "low", "no"].
 * @apiSuccess {JSON}       issues              Issues in Portfolio.
 * @apiSuccess {Number}     -total              Number of Portfolios with errors or warnings in portfolios for which the current user has access.
 * @apiSuccess {Number}     -errors             Number of portfolios with Import Errors.
 * @apiSuccess {Number}     -warnings           Number of portfolios with 1 or more items in the actionable dashboard items (Ex. Out of tolerance, distributions etc).
 * @apiSuccess {Number}     outOfTolerance      Out of Tolerance status of Portfolios.
 * @apiSuccess {Number}     cashNeed            Cash Needed in Portfolios.
 * @apiSuccess {Number}     setForAutoRebalance AutoRebalance value of Portfolios.
 * @apiSuccess {Number}     contribution        Portfolio's contribution amount.
 * @apiSuccess {Number}     distribution        Portfolio's Distribution amount.
 * @apiSuccess {Number}     noModel             Portfolios with no model.
 * @apiSuccess {Number}     doNotTrade          Blocked Portfolios.
 * @apiSuccess {Number}     TLHOpportunity      Tax Loss Harvesting in Portfolios.
 * @apiSuccess {Number}     dataErrors          Data Errors in Portfolios.
 * @apiSuccess {Number}     pendingTrades       Pending Trades in Portfolios.
 * 
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *     {
            "analyticsOn" : "2016-09-02 12:21:39",
            "portfolio" : {
                    "total" : 200,
                    "existing" : 150,
                    "new" : 50
            },
            "AUM" : {
                    "total" : 284,
                    "changeValue" : 40,
                    "changePercent" : 3,
                    "status"  :"high"
            },
            "issues" : {
                    "total" : 235,
                    "errors" : 16,
                    "warnings" : 69
            },
            "outOfTolerance" : 50,
            "cashNeed" : 87,
            "setForAutoRebalance" : 41,
            "contribution" : 29,
            "distribution" : 54,
            "noModel" : 5,
            "doNotTrade" : 34,
            "TLHOpportunity" : 76,
            "dataErrors" : 25,
            "pendingTrades" : 65,
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
app.get('/summary', function (req, res) {
    logger.info("Get all portfolios request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    if (req.query.option) {
        data.option = req.query.option;
    }
    if (req.query.type) {
        data.type = req.query.type;
    }
    if (req.query.isDeleted) {
        data.isDeleted = req.query.isDeleted;
    }
    
//    var json = {
//    		  "analyticsOn": "2016-12-26T08:05:52.000Z",
//    		  "portfolio": {
//    		    "total": 364,
//    		    "existing": 364,
//    		    "new": 0
//    		  },
//    		  "AUM": {
//    		    "total": 34414876.19354,
//    		    "changeValue": 0,
//    		    "changePercent": 0,
//    		    "status": "no"
//    		  },
//    		  "issues": {
//    		    "total": 215,
//    		    "errors": 0,
//    		    "warning": 215
//    		  },
//    		  "outOfTolerance": 0,
//    		  "cashNeed": 1,
//    		  "setForAutoRebalance": 1,
//    		  "contribution": 0,
//    		  "distribution": 0,
//    		  "noModel": 207,
//    		  "doNotTrade": 44,
//    		  "TLHOpportunity": 1,
//    		  "dataErrors": 0,
//    		  "pendingTrades": 0
//    		}
//    
//    return response(null, 200, json, res);
    
    portfolioService.getSummary(data, function (err, status, data) {
        return response(err, status, data, res);
    });

});


/**
 * @api {get} /dashboard/portfolio/{:id}/holdings/summary  Get Holding Dashboard Summary by Portfolio Id 
 * @apiName GetHoldingDashboardSummaryByPortfolioId
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appuser
 *
 * @apiDescription This API is used to get holding dashboard summary by portfolio id. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dashboard/portfolio/1/holdings/summary
 * 
  * @apiSuccess {Date}      dateTime                  Dashboard detail as on Date.
 * @apiSuccess {JSON}       value                     Total holding summary.
 * @apiSuccess {Number}     -total                    Total value.
 * @apiSuccess {Number}     -changeValueAmount        Change in value amount.
 * @apiSuccess {Number}     -changeValuePercent       Change in percentage.
 * @apiSuccess {String}     -status                   Status symbol
 * @apiSuccess {JSON}       holdings                  Holding Summary.
 * @apiSuccess {Number}     total                     Total holding.
 * @apiSuccess {Number}     -existing                 Existing holding.
 * @apiSuccess {Number}     -new                      New holding.
 * @apiSuccess {JSON}       issues                    Issue summary.
 * @apiSuccess {Number}     --total                   Total No. of issue.
 * @apiSuccess {Number}     -errors                   Total No .of errors in holding.
 * @apiSuccess {Number}     -warnings                 Total No. of warning.
 * @apiSuccess {JSON}       bars                      Bar summary.
 * @apiSuccess {Number}     -exclude                  No. of exclude holdings
 * @apiSuccess {Number}     -notInModel               No. of "Not in model" holdings.
 * @apiSuccess {JSON}       topTenHoldings             Top 10 holdings summary.
 * @apiSuccess {Number}     totalHoldingValue         Total holding value.
 * @apiSuccess {String}     totalHoldingValueStatus   Total holding value status as compare to previous value.
 * @apiSuccess {JSON}       -holdings                 Holdings summary.
 * @apiSuccess {String}     -securityName             Security name.
 * @apiSuccess {Number}     -marketValue              Holding market value.
 * @apiSuccess {Number}     -unit                     No. of holding.
 * @apiSuccess {Number}     -price                    Holding price.
 * @apiSuccess {Number}     -percentage               Holding percentage.
   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *{
 * "dateTime": "2016-10-30T06:19:20.000Z",
 * "value": {
 *   "total": 22285,
 *   "changeValueAmount": 500,
 *   "changeValuePercent": 5,
 *   "status": "High"
 * },
 * "holdings": {
 *   "total": 10,
 *   "existing": 10,
 *   "new": 0
 * },
 * "issues": {
 *   "total": 505,
 *   "errors": 500,
 *   "warnings": 5
 *  },
 * "bars": {
 *   "exclude": 0,
 *   "notInModel": 3
 * },
 * "topTenHoldings": {
 *   "totalHoldingValue": 100,
 *   "totalHoldingValueStatus": "High",
 *   "holdings": [
 *     {
 *       "securityName": "Sprint Corporation",
 *       "marketValue": 9000,
 *       "unit": 360,
 *       "price": 25,
 *       "percentage": 37.82
 *     },
 *      {
 *       "securityName": "Sprint Corporation",
 *       "marketValue": 2500,
 *       "unit": 250,
 *       "price": 10,
 *       "percentage": 10.51
 *     }
 *    ]
 *  }
 *}
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */


app.get('/:id/holdings/summary', function (req, res) {
    logger.info("Get all holding request received");
    var data = req.data;
    data.id = req.params.id;
    if (req.query.search) {
        data.search = req.query.search;
    }
  
    holdingDashBoardService.getSummaryByPortfolioId(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });

});



module.exports = app;
