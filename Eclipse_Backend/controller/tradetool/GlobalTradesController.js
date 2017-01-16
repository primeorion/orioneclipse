"use strict";

var app = require("express")();

var moduleName = __filename;
var helper = require('helper');

var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var GlobalTradeService = require('service/tradetool/GlobalTradeService.js');
var GlobalTradeRequest = require('model/tradetool/GlobalTradeRequest.js');

var globalTradeService = new GlobalTradeService();
var validate = helper.validate;

var util = require("util");
var generateTradeSchema = {
    type: 'object',
    properties: {
        accountIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: false
        },
        portfolioIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: false
        },
        modelIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: false
        },
        security: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    sellSecurityId: {
                        type: 'number',
                        required: true
                    },
                    buySecurityId: {
                        type: 'number',
                        required: true
                    },
                    percent: {
                        type: 'number',
                        required: true
                    },
                }
            },
            required: true
        },
        notes: {
            type: ['String',null],
             required: false
        },
    }
};
/**
 * @apiIgnore
 * @api {get} /tradetool/globaltrades/counts?portfolioIds={portfolioIds}&accountIds={accountIds}&modelIds={modelIds}&securityId={securityId} Get sell security count
 * @apiName  GetSellSecurityCount.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 *
 * @apiDescription This API gets sell security count.
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
 * curl -i http://baseurl/v1/tradetool/globaltrades/counts?portfolioIds=1&accountIds=1&modelIds=1&securityId=14612
 * 
 * @apiSuccess {Number}     count                      Total Sell Security Count.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       {
         "count": 1
       }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 */
// app.get('/counts', function (req, res) {
//     logger.info("Get golbal security count request received");

//     var data = req.data;
//     if (req.query.accountIds) {
//         data.accountId = req.query.accountIds;
//     }
//     if (req.query.portfolioIds) {
//         data.portfolioId = req.query.portfolioIds;
//     }
//     if (req.query.modelIds) {
//         data.modelId = req.query.modelIds;
//     }
//     if (req.query.securityId) {
//         data.securityId = req.query.securityId;
//     }
//     globalTradeService.getSecurityCount(data, function (err, status, data) {
//         return response(err, status, data, res);
//     });
// });

/**
 * @apiIgnore
 * @api {get} /tradetool/globaltrades/counts?portfolioIds={portfolioIds}&accountIds={accountIds}&modelIds={modelIds}&securityId={securityId} Get sell security count
 * @apiName  GetSellSecurityCount.
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 *
 * @apiDescription This API gets sell security count.
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
 * curl -i http://baseurl/v1/tradetool/globaltrades/counts?portfolioIds=1&accountIds=1&modelIds=1&securityId=14612
 * 
 * @apiSuccess {Number}     count                      Total Sell Security Count.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       {
         "count": 1
       }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 */
app.get('/counts', function (req, res) {
    logger.info("Get global security  request received");

    var data = req.data;
    if (req.query.accountIds) {
        data.accountId = req.query.accountIds;
    }
    if (req.query.portfolioIds) {
        data.portfolioId = req.query.portfolioIds;
    }
    if (req.query.modelIds) {
        data.modelId = req.query.modelIds;
    }
    if (req.query.securityId) {
        data.securityId = req.query.securityId;
    }
    globalTradeService.getSecurityList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {post} /tradetool/globaltrades/action/generateTrade Generate Global Trade
 * @apiName  GenerateGlobalTrade
 * @apiVersion 1.0.0
 * @apiGroup TradeTool-Global Trade
 * @apiPermission appuser
 *
 * @apiDescription This API generate global trade.
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
 * curl -i http://baseurl/v1/tradetool/globaltrades/action/generateTrade
 * 
 * @apiParam {Array}        accountIds                  The valid accountIds.
 * @apiParam {Array}        portfolioIds                The valid portfolioIds.
 * @apiParam {Array}        modelIds                    The valid modelIds.
 * @apiParam {Array}        tradeGroupIds               The valid modelIds.
 * @apiParam {Number}       sellSecurityId              The valid sellSecurityId.
 * @apiParam {Number}       buySecurityId               The valid buySecurityId.
 * @apiParam {Number}       percent                     The percent.
 * @apiParam {String}       notes                       Notes.
 * @apiParamExample {json} Request-Example:
 *  {
        "accountIds": [1,3,4],
        "portfolioIds": [1,2,3],        
        "modelIds": [442],        
        "tradeGroupIds": [1111,3333],
        "security": [
            {
            "sellSecurityId": 14616,
            "buySecurityId": 14612,
            "percent": 70
            },
            {
            "sellSecurityId": 14616,
            "buySecurityId": 14612,
            "percent": 30
            }
        ],
        "notes": "Hello"
    }
 * @apiSuccess {Number}     instanceId               Generate Trade instanceId.
 *  @apiSuccess {Array}     issues                   If any issues.
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 OK
       {
        "instanceId": 100,
        "issues": []
       }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 */
app.post('/action/generateTrade', validate({ body: generateTradeSchema }), function (req, res) {
    logger.info("Generate Trades  request received");

    var data = req.data;
    data = new GlobalTradeRequest(data);
    globalTradeService.generateTrade(data, function (err, status, data) {

        return response(err, status, data, res);
    });
});


module.exports = app;