"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');
var util = require('util');
var response = require('controller/ResponseController.js');
var TacticalTradeToolService = require('service/tradetool/TacticalTradeToolService.js');
var tacticalTradeToolService = new TacticalTradeToolService();
var logger = helper.logger(moduleName);
var validate = helper.validate;
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js").getDifferentAccessForUser;
var analysisMiddleware = require('middleware/AnalysisMiddleware.js')


/**
@api {get} /tradetool/tacticaltradetool/portfolio/{:portfolioId}/securityset/{:securityset}/securities  Get Security List by securitSet Id
* @apiName GetSecuritylist
* @apiVersion 1.0.0
* @apiGroup  TacticalTradeTool
* @apiPermission appUser
*
* @apiDescription This api will be used to get security list.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/tradetool/tacticaltradetool/portfolio/1/securityset/14421/securities

* @apiSuccess {Number}     id                         System generated id.
* @apiSuccess {String}     securityName               Security name.
* @apiSuccess {String}     tradeOrderAction           Trade order action detail. 
* @apiSuccess {Number}     tradeOrderShares           Trade order shares detail. 
* @apiSuccess {Number}     tradeOrderRedemptionFee    Redemption fee detail. 
* @apiSuccess {Number}     tradeCost                  Trade cst detail. 
* @apiSuccess {Number}     tradeOrderAmount           Trade order amount detail. 

* @apiSuccess {Number}     postTradeShares            Post trade shares.
* @apiSuccess {Number}     postTradeAmount            Post trade amount. 
* @apiSuccess {Number}     postTradePer               Post trade percentage. 

* @apiSuccess {Number}     modelTargetShares          Model target shares. 
* @apiSuccess {Number}     modelTargetAmount          Model target amount. 
* @apiSuccess {Number}     modelTargetPer             Model target percentage

* @apiSuccess {Number}     currentShares              Current shares. 
* @apiSuccess {Number}     currentAmount              Current amount. 
* @apiSuccess {Number}     currentPer                 Current percentage.

* @apiSuccess {Number}     gainLossCostShortTerm      Cost short term detail. 
* @apiSuccess {Number}     gainLossCostLongTerm       Cost long term detail. 
* @apiSuccess {Number}     gainAmount                 Gain amount. 
* @apiSuccess {Number}     gainPer                    Gain percentage.
* @apiSuccess {Number}     tradeGain                  Trade gain.
* @apiSuccess {String}     commentsTradeReason        Trade reason. 
* @apiSuccess {String}     commentsMessage            Message
* @apiSuccess {Number}     exclude                    Exclude security flag. 


*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*   [
*    {
*    "id": 14612,
     "securityName":"CUSTODIAL_CASH",
*    "tradeOrderAction": 1,
*    "tradeOrderShares": 50,
*    "tradeOrderRedemptionFee": 100,
*    "tradeCost": 500,
*    "tradeOrderAmount": 1500,
*    "postTradeShares": 150,
*    "postTradeAmount": 2000,
*    "postTradePer": 15,
*    "modelTargetShares": 0,
*    "modelTargetAmount": 0,
*    "modelTargetPer": 0,
*    "currentShares": 230,
*    "currentAmount": 92000,
*    "currentPer": 64.47,
*    "gainLossCostShortTerm": 6,
*    "gainLossCostLongTerm": 600,
*    "gainAmount": 600,
*    "gainPer": 6,
*    "tradeGain": 600,
*    "commentsTradeReason": "test Reason",
*    "commentsMessage": "Test message",
*    "exclude": 1
*  }
* ]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/

app.get('/portfolio/:id/securityset/:securitySetId/securities', function (req, res) {
    logger.info("Get securit List request received");

    var data = req.data;
    data.portfolioId = req.params.id;
    data.securitySetId = req.params.securitySetId;
    data.exclude = req.query.exclude;
    tacticalTradeToolService.getSecurityListByPortAndSecurityId(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /tradetool/tacticaltradetool/portfolio/{:portfolioId}/security/{:securityId}/accounts  Get Account List by Security Id
* @apiName GetAccountlist
* @apiVersion 1.0.0
* @apiGroup  TacticalTradeTool
* @apiPermission appUser
*
* @apiDescription This api will be used to get account list based on security id.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/tradetool/tacticaltradetool/portfolio/1/security/14421/accounts

* @apiSuccess {Number}     id                         System generated id.
* @apiSuccess {String}     accountName                Account name. 
* @apiSuccess {String}     custodian                  Custodian name. 
* @apiSuccess {String}     type                       Account type. 
* @apiSuccess {Number}     currentShares              Current shares. 
* @apiSuccess {Number}     currentAmount              Current amount. 
* @apiSuccess {Number}     costShortTerm              Cost short term detail. 
* @apiSuccess {Number}     costLongTerm               Cost long term detail. 
* @apiSuccess {Number}     gainAmount                 Gain amount. 
* @apiSuccess {Number}     gainPer                    Gain percentage.
* @apiSuccess {Number}     tradeGain                  Trade gain.
* @apiSuccess {String}     alternative                Alternative
* @apiSuccess {Number}     isSMA                      Is SMA flag. 
* @apiSuccess {Number}     exclude                    Exclude account flag. 

* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*   [
  {
    "id": 1,
    "accountName": "Kane, Jr.  Fredric ",
    "custodian": "Prime",
    "type":"IRA",
    "currentShares": 150,
    "currentAmount": 15000,
    "costShortTerm": 4122,
    "costLongTerm": 5000,
    "gainAmount": 1000,
    "gainPer": 75,
    "tradeGain": 6000,
    "alternative": "test",
    "isSMA": 1,
    "exclude": 1
  },
  {
    "id": 2,
    "accountName": "Kane, Jr.  Fredric ",
    "custodian": "Prime",
    "type":"IRA",
    "currentShares": 23,
    "currentAmount": 690,
    "costShortTerm": 4122,
    "costLongTerm": 5000,
    "gainAmount": 1000,
    "gainPer": 75,
    "tradeGain": 6000,
    "alternative": "test",
    "isSMA": 1,
    "exclude": 1
  }]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/

app.get('/portfolio/:id/security/:securityId/accounts', function (req, res) {
    logger.info("Get accounts list request received");

    var data = req.data;
    data.portfolioId = req.params.id;
    data.securityId = req.params.securityId;
    data.exclude = req.query.exclude;
    tacticalTradeToolService.getAccountListByPortAndSecurityId(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
@api {get} /tradetool/tacticaltradetool/portfolio/{:portfolioId}/security/{:securityId}/account/{:accountId}/taxlots  Get Taxlot List by Account and security Id 
* @apiName GetTaxlotlist
* @apiVersion 1.0.0
* @apiGroup  TacticalTradeTool
* @apiPermission appUser
*
* @apiDescription This api will be used to get taxlot list based on account and security id.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/tradetool/tacticaltradetool/portfolio/1/security/1/account/1/taxlots

* @apiSuccess {Number}     id                         System generated id.
* @apiSuccess {String}     acquiredDate               Acquired date. 
* @apiSuccess {Number}     taxlotShares               Taxlot shares. 
* @apiSuccess {Number}     taxlotPrice                Taxlot Price. 
* @apiSuccess {Number}     costShortTerm              Cost short term detail. 
* @apiSuccess {Number}     costLongTerm               Cost long term detail. 
* @apiSuccess {Number}     gainAmount                 Gain amount. 
* @apiSuccess {Number}     gainPer                    Gain percentage.
* @apiSuccess {Number}     tradeGain                  Trade gain.

* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*[
*  {
*    "id": 1,
*    "acquiredDate": "2016-08-09T06:40:38.000Z",
*    "taxlotShares": 10,
     "taxlotPrice" :500,
*    "costShortTerm": 4122,
*    "costLongTerm": 5000,
*    "gainAmount": 1000,
*    "gainPer": 75,
*    "tradeGain": 6000
*  }
*]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/


app.get('/portfolio/:id/security/:securityId/account/:accountId/taxlots', function (req, res) {
    logger.info("Get taxlot list request received");

    var data = req.data;
    data.portfolioId = req.params.id;
    data.securityId = req.params.securityId;
    data.accountId = req.params.accountId;

    tacticalTradeToolService.getTaxlotListByPortAndSecurityId(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /tradetool/tacticaltradetool/portfolio/{:portfolioId}/unassignedsecurity  Get Level data 
* @apiName GetLevelData
* @apiVersion 1.0.0
* @apiGroup  TacticalTradeTool
* @apiPermission appUser
*
* @apiDescription This api will be used to get security list.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/tradetool/tacticaltradetool/

* @apiSuccess {JSON}       portfolioInfo              PortfolioInfo Info.
* @apiSuccess {Number}     -id                         System generated id.
* @apiSuccess {String}     -portfolioName              Portfolio name.
* @apiSuccess {Number}     -AUM                        AUM detail.
* @apiSuccess {Number}     -netCash                    Net Cash detail.
* @apiSuccess {Number}     -targetAmount               Target amount.
* @apiSuccess {Number}     -targetPer                  Target percentage.
* @apiSuccess {Number}     -currentAmount              Current amount. 
* @apiSuccess {Number}     -currentPer                 Current percentage. 

* @apiSuccess {JSON}       model                      Model Summary.
* @apiSuccess {Number}     isSleeve                   isSleeve flag. 
* @apiSuccess {JSON}       genearalInfo               Genearal Info summary
* @apiSuccess {JSON}       sleeveInfo                 SleeveInfo summary.
* @apiSuccess {Number}     -id                        System generated id.
* @apiSuccess {Number}     -sleeveAUM                 Sleeve AUM.
* @apiSuccess {Number}     -netCash                   Net cash
* @apiSuccess {Number}     -cashTarget                Cash target. 
* @apiSuccess {Number}     -cashTargetPer             Cash percentage. 
* @apiSuccess {Number}     -cashCurrentPer            Cash current percentage. 
* @apiSuccess {Number}     -cashCurrent               Cash current. 

* @apiSuccess {JSON}       accountInfo                Account summary.
* @apiSuccess {Number}     -id                        System generated id.
* @apiSuccess {String}     -accountName               Account name. 
* @apiSuccess {String}     -custodian                 Custodian name. 
* @apiSuccess {Number}     -currentShares             Current shares. 
* @apiSuccess {Number}     -currentAmount             Current amount. 
* @apiSuccess {Number}     -costShortTerm             Cost short term detail. 
* @apiSuccess {Number}     -costLongTerm              Cost long term detail. 
* @apiSuccess {Number}     -gainAmount                Gain amount. 
* @apiSuccess {Number}     -gainPer                   Gain percentage.
* @apiSuccess {Number}     -tradeGain                 Trade gain.
* @apiSuccess {String}     -alternative               Alternative
* @apiSuccess {Number}     -isSMA                     Is SMA flag. 
* @apiSuccess {Number}     -exclude                   Exclude account flag. 

* @apiSuccess {JSON}       level1                     level1 summary
* @apiSuccess {Number}     id                         System generated id.
* @apiSuccess {Number}     levelName                  level name. 
* @apiSuccess {Number}     targetAmount               Target amount.
* @apiSuccess {Number}     targetPercentage           Target percentage.
* @apiSuccess {Number}     currentAmount              Current amount. 
* @apiSuccess {Number}     currentPercentage          Current percentage. 

* @apiSuccess {JSON}       level2                     level2 summary
* @apiSuccess {Number}     id                         System generated id.
* @apiSuccess {Number}     levelName                  leve2 name. 
* @apiSuccess {Number}     targetAmount               Target amount.
* @apiSuccess {Number}     targetPercentage           Target percentage.
* @apiSuccess {Number}     currentAmount              Current amount. 
* @apiSuccess {Number}     currentPercentage          Current percentage. 

* @apiSuccess {JSON}       level3                     level3 summary
* @apiSuccess {Number}     id                         System generated id.
* @apiSuccess {Number}     levelName                  leve3 name. 
* @apiSuccess {Number}     targetAmount               Target amount.
* @apiSuccess {Number}     targetPercentage           Target percentage.
* @apiSuccess {Number}     currentAmount              Current amount. 
* @apiSuccess {Number}     currentPercentage          Current percentage. 

* @apiSuccess {JSON}       level4                     leve4 summary
* @apiSuccess {Number}     id                         System generated id.
* @apiSuccess {Number}     levelName                  leve4 name. 
* @apiSuccess {Number}     targetAmount               Target amount.
* @apiSuccess {Number}     targetPercentage           Target percentage.
* @apiSuccess {Number}     currentAmount              Current amount. 
* @apiSuccess {Number}     currentPercentage          Current percentage. 

* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*  {
  "portfolioInfo": {
    "id": 1,
    "portfolioName": "test Portfolio",
    "AUM": 5000,
    "netCash": 6000,
    "targetAmount": 5000,
    "targetPer": 50,
    "currentAmount": 5000,
    "currentPer": 30
  },
  "model": [
    {
      "isSleeve": 1,
      "genearalInfo": {
        "sleeveInfo": {
          "id": 999,
          "sleeveAUM": 1,
          "netCash": 1,
          "cashTarget": 1,
          "cashTargetPer": 1,
          "cashCurrentPer": 1,
          "cashCurrent": 1
        },
        "accountInfo": {
          "id": 1,
          "accountName": "Kane",
          "custodian": "Test",
          "type": "ITA",
          "currentShares": 100,
          "currentAmount": 1000,
          "costShortTerm": 5000,
          "costLongTerm": 10000,
          "gainAmount": 8000,
          "gainPer": 10,
          "tradeGain": 1000,
          "alternative": 1
        }
      },
      "level1": [
        {
          "id": 1,
          "levelName": "levelOne",
          "targetAmount": 100,
          "targetPercentage": 10,
          "currentAmount": 200,
          "currentPercentage": 30,
          "level2": [
            {
              "id": 1,
              "levelName": "level2",
              "targetAmount": 100,
              "targetPercentage": 10,
              "currentAmount": 200,
              "currentPercentage": 30,
              "level3": [
                {
                  "id": 1,
                  "levelName": "Kane, Jr.  Fredric ",
                  "targetAmount": 100,
                  "targetPercentage": 10,
                  "currentAmount": 200,
                  "currentPercentage": 30,
                  "level4": [
                    {
                      "id": 1,
                      "levelName": "Kane, Jr.  Fredric ",
                      "targetAmount": 100,
                      "targetPercentage": 10,
                      "currentAmount": 200,
                      "currentPercentage": 30
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/

app.get('/portfolio/:portfolioId/levels', function (req, res) {
    logger.info("Get level list request received");

    var data = req.data;
    data.portfolioId = req.query.portfolioId;
    data.pendingValue = req.query.pendingValue;
    data.defaultAction = req.query.defaultAction;
    data.accountId = req.query.accountId;

    tacticalTradeToolService.getLevelDataList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
@api {get} /tradetool/tacticaltradetool/portfolio/{:portfolioId}/unassignedsecurity  Get Unassigned  Security List
* @apiName GetUnassignSecuritylist
* @apiVersion 1.0.0
* @apiGroup  TacticalTradeTool
* @apiPermission appUser
*
* @apiDescription This api will be used to get security list.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/tradetool/tacticaltradetool/portfolio/1/unassignedsecurity

* @apiSuccess {Number}     id                         System generated id.
* @apiSuccess {String}     securityName               Security name.
* @apiSuccess {String}     tradeOrderAction           Trade order action detail. 
* @apiSuccess {Number}     tradeOrderShares           Trade order shares detail. 
* @apiSuccess {Number}     tradeOrderRedemptionFee    Redemption fee detail. 
* @apiSuccess {Number}     tradeCost                  Trade cst detail. 
* @apiSuccess {Number}     tradeOrderAmount           Trade order amount detail. 

* @apiSuccess {Number}     postTradeShares            Post trade shares.
* @apiSuccess {Number}     postTradeAmount            Post trade amount. 
* @apiSuccess {Number}     postTradePer               Post trade percentage. 

* @apiSuccess {Number}     modelTargetShares          Model target shares. 
* @apiSuccess {Number}     modelTargetAmount          Model target amount. 
* @apiSuccess {Number}     modelTargetPer             Model target percentage

* @apiSuccess {Number}     currentShares              Current shares. 
* @apiSuccess {Number}     currentAmount              Current amount. 
* @apiSuccess {Number}     currentPer                 Current percentage.

* @apiSuccess {Number}     gainLossCostShortTerm      Cost short term detail. 
* @apiSuccess {Number}     gainLossCostLongTerm       Cost long term detail. 
* @apiSuccess {Number}     gainAmount                 Gain amount. 
* @apiSuccess {Number}     gainPer                    Gain percentage.
* @apiSuccess {Number}     tradeGain                  Trade gain.
* @apiSuccess {String}     commentsTradeReason        Trade reason. 
* @apiSuccess {String}     commentsMessage            Message
* @apiSuccess {Number}     exclude                    Exclude security flag. 


*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*   [
*    {
*    "id": 14612,
     "securityName":"CUSTODIAL_CASH",
*    "tradeOrderAction": 1,
*    "tradeOrderShares": 50,
*    "tradeOrderRedemptionFee": 100,
*    "tradeCost": 500,
*    "tradeOrderAmount": 1500,
*    "postTradeShares": 150,
*    "postTradeAmount": 2000,
*    "postTradePer": 15,
*    "modelTargetShares": 0,
*    "modelTargetAmount": 0,
*    "modelTargetPer": 0,
*    "currentShares": 230,
*    "currentAmount": 92000,
*    "currentPer": 64.47,
*    "gainLossCostShortTerm": 6,
*    "gainLossCostLongTerm": 600,
*    "gainAmount": 600,
*    "gainPer": 6,
*    "tradeGain": 600,
*    "commentsTradeReason": "test Reason",
*    "commentsMessage": "Test message",
*    "exclude": 1
*  }
* ]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/


app.get('/portfolio/:id/unassignedsecurity/', function (req, res) {
    logger.info("Get taxlot list request received");

    var data = req.data;
    data.portfolioId = req.params.id;
    data.accountId = req.query.accountId;


    tacticalTradeToolService.getUnAssignSecurityListByPortId(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});



module.exports = app;