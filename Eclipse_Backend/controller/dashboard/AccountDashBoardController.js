"use strict";

var app = require("express")();
var util = require('util');
var moduleName = __filename;
var helper = require('helper');

var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');

var AccountDashBoardService = require('service/dashboard/AccountDashBoardService.js');
var accountDashBoardService = new AccountDashBoardService();
var HoldingDashBoardService = require('service/dashboard/HoldingDashBoardService.js');
var holdingDashBoardService = new HoldingDashBoardService();

/**
 * @api {get} /dashboard/account/summary Get Account dashboard 
 * @apiName GetAccountDashboard
 * @apiVersion 1.0.0
 * @apiGroup Account
 * @apiPermission appuser
 *
 * @apiDescription This API is used to get account dashboard. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dashboard/account/summary
 * 
 * @apiSuccess {Date}       dateTime                 Dashboard detail as on Date.
 * @apiSuccess {JSON}       value                    Total AUM summary.
 * @apiSuccess {Number}     -total                    Total value.
 * @apiSuccess {Number}     -changeValueAmount        Change in Value Amount.
 * @apiSuccess {Number}     -changeValuePercent       Change in percentage.
 * @apiSuccess {String}     -status                   status symbol
 * @apiSuccess {JSON}       accounts                 Accounts Summary.
 * @apiSuccess {Number}     --total                    Total account.
 * @apiSuccess {Number}     -existing                 Existing accounts.
 * @apiSuccess {Number}     -new                      New accounts.
 * @apiSuccess {JSON}       issues                   Issue summary.
 * @apiSuccess {Number}     ---total                    Total no. of issue.
 * @apiSuccess {Number}     -errors                   Total No .of errors in portfolios.
 * @apiSuccess {Number}     -warnings                 Total No. of warning.
 * @apiSuccess {JSON}       bars                     Progress bar summary
 * @apiSuccess {Number}     -systematic               Systematic Bar detail.
 * @apiSuccess {Number}     -accountWithMergeIn       Account With Merge In Detail.
 * @apiSuccess {Number}     -accountWithMergeOut      Account With Merge Out Detail.
 * @apiSuccess {Number}     -newAccount               New Account detail.
 * @apiSuccess {Number}     -accountWithNoPortfolio   Account With No Portfolio detail.
 * @apiSuccess {Number}     -toDo                     To do Detail.
 * @apiSuccess {Number}     -sma                      Single manage account detail.
 * @apiSuccess {Number}     -accountWithDataError     Account With Data Error.
 * @apiSuccess {Number}     -accountWithPedingTrades  Account With Peding Trades detail.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *   {
 * "dateTime": "2016-10-24T03:30:00.000Z",
 * "value": {
 *   "total": 20190,
 *   "changeValueAmount": 20190,
 *   "changeValuePercent": 0,
 *   "status": "High"
 * },
 * "accounts": {
 *   "total": 22,
 *   "existing": 22,
 *   "new": 0
 * },
 * "issues": {
 *   "total": 7,
 *   "errors": 1,
 *   "warnings": 6
 * },
 * "bars": {
 *   "systematic": 1,
 *   "accountWithMergeIn": 200,
 *   "accountWithMergeOut": 300,
 *   "newAccount": 1,
 *   "accountWithNoPortfolio": 7,
 *   "toDo": 1,
 *   "sma": 17,
 *   "accountWithDataError": 1,
 *   "accountWithPedingTrades": 0
 * }
 * }
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
    logger.info("Get account dashboard request received");
    var data = req.data;
    accountDashBoardService.getSummary(data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

/**
 * @api {get} /dashboard/account/{:id}/holdings/summary  Get Holding Dashboard Summary by Account Id 
 * @apiName GetHoldingDashboardSummaryByAccountId
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appuser
 *
 * @apiDescription This API is used to get holding dashboard summary by account id . 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dashboard/account/1/holdings/summary
 * 
 * @apiSuccess {Date}       dateTime                  Dashboard detail as on Date.
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
 * @apiSuccess {JSON}       -holdings                 Holding summary.
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
    logger.info("Get holding dashboard request received");
    var data = req.data;
    data.id = req.params.id;
    // if (req.query.search) {
    //     data.search = req.query.search;
    // }

    holdingDashBoardService.getSummaryByAccountId(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

module.exports = app;
