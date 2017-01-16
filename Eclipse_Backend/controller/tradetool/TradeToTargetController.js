"use strict";

var app = require("express")();

var moduleName = __filename;
var helper = require('helper');

var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var TradeToTargetService = require('service/tradetool/TradeToTargetService.js');
var TradeToTargetRequest = require('model/tradetool/TradeToTargetRequest.js');

var tradeToTargetService = new TradeToTargetService();
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
        modelIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: false
        },
        security: {
            type: 'json',

            properties: {
                securityId: {
                    type: 'number',
                    required: true
                },
                targetPercent: {
                    type: 'number',
                    required: true
                },
                side: {
                    type: 'String',
                    required: true
                },
                isFullTrade: {
                    enum: [0, 1, true, false, null]
                },
                modelTypeId: {
                    type: ['number', null],
                    required: false
                },
                reason: {
                    type: 'String',
                    required: false
                },
            },
            required: true
        },
        preferences: {
            type: 'json',
            properties: {
                minimumTradePercent: {
                    type: ['number', null],
                    required: false
                },
                minimumTradeDollar: {
                    type: ['number', null],
                    required: false
                },
                allowWashSalesId: {
                    type: ['number', null],
                    required: false
                },
                allowShortTermGainsId: {
                    type: ['number', null],
                    required: false
                }
            },
            required: true
        }
    }
};

/**
 * @api {post} /tradetool/tradetotarget/action/generateTrade Generate trade
 * @apiName  GenerateTradeToTarget
 * @apiVersion 1.0.0
 * @apiGroup TradeTool-TradeToTarget
 * @apiPermission appuser
 *
 * @apiDescription This API generate trade to target.
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
 * curl -i http://baseurl/v1/tradetool/tradetotarget/action/generateTrade
 * 
 * @apiParam {Array}       accountIds              Account Ids for Trades .
 * @apiParam {Array}       modelIds                Model Ids for Trades .
 * @apiParam {JSON}        security                Security .
 * @apiParam {JSON}        preferences             Preferences .
 * @apiParamExample {json} Request-Example:
 *  {
        "accountIds": [1],
        "modelIds": [1]
        "security":{
            "securityId":14616,
            "targetPercent":12,
            "side":1,
            "isFullTrade":false,
            "modelTypeId":1,
            "reason":"To buy"
        },
        "preferences":{
            "minimumTradePercent":33,
            "minimumTradeDollar":35,
            "allowWashSalesId":88,
            "allowShortTermGainsId":89
        }
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
    logger.info("Generate Trade to target  request received");

    var data = req.data;
    data = new TradeToTargetRequest(data);

    tradeToTargetService.generateTradeForAll(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


module.exports = app;