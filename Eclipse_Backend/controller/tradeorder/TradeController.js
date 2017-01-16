"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var TradeService = require('service/tradeorder/TradeService.js');
var tradeService = new TradeService();

var CommonService = require('service/tradeorder/CommonService.js');
var commonService = new CommonService();
/**
 * @api {get} /tradeorder/trades/tradeExecutionType?search={id/name} Search trade type 
 * @apiName SearchTradeExecutionType
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API search trade execution type. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/tradeExecutionType?search=1
 * 
 * @apiSuccess {String}     id              The trade type Id.
 * @apiSuccess {String}     name          Name of the Trade Type.
 * @apiSuccess {Boolean}    isDeleted       Trade Type exist or not into the system.
 * @apiSuccess {Date}       createdOn       Trade Type creation date into application.
 * @apiSuccess {String}     createdBy       Full Name of user who created the Trade Type into the system.
 * @apiSuccess {Date}       editedOn        Trade Type edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Trade Type details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "FIX DIRECT",
 *      "isDeleted": 0,
 *      "createdOn": "2016-06-17T05:57:22.000Z",
 *      "createdBy": 0,
 *      "editedOn": "2016-06-17T05:57:25.000Z",
 *        "editedBy": 0
 *      }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
/**
 * @api {get} /tradeorder/trades/tradeExecutionType Get All trade type 
 * @apiName GetAllTradeExecutionType
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API gets trade execution type list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/tradeExecutionType 
 * 
 * @apiSuccess {String}     id              The trade type Id.
 * @apiSuccess {String}       name            Name of the Trade Type.
 * @apiSuccess {Boolean}     isDeleted       Trade Type exist or not into the system.
 * @apiSuccess {Date}       createdOn       Trade Type creation date into application.
 * @apiSuccess {String}     createdBy       Full Name of user who created the Trade Type into the system.
 * @apiSuccess {Date}       editedOn 	    Trade Type edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Trade Type details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "FIX DIRECT",
 *      "isDeleted": 0,
 *      "createdOn": "2016-06-17T05:57:22.000Z",
 *      "createdBy": 0,
 *      "editedOn": "2016-06-17T05:57:25.000Z",
 *      "editedBy": 0
 *      }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/tradeExecutionType', function (req, res) {
   	logger.info("Get all advisors request received");

    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    if (req.query.isDeleted) {
        data.isDeleted = req.query.isDeleted;
    }
    tradeService.getTradeExecutionTypeList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/tradeListByPortfolio/:id', function(req, res) {
        
    var data = req.data;
    data.id = req.params.id;
    if (req.query.tradeCode) {
        data.tradeCode = req.query.tradeCode;
    }
    tradeService.getTradeListByPortfolio(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**
 * @api {get} /tradeorder/trades?portfolioId={portfolioId} Get All Trades 
 * @apiName Get All trades
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission Get only those order whose portfolios assignied to his team
 *
 * @apiDescription This API get all trades. portfolio id is optional. This will work as filter of portfolio id
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades?portfolioId={portfolioId}
 * 
 * @apiSuccess {Number}      id                     Trade order Id.
 * @apiSuccess {Boolean}     isEnabled:             It indicates wheter trade order is enable ot not.
 * @apiSuccess {Number}      account_id             Account id
 * @apiSuccess {Number}      account_accountId:     Account id of orion connect
 * @apiSuccess {String}      account_name:          Account name 
 * @apiSuccess {String}      account_number:        Account number 
 * @apiSuccess {Decimal}     account_value           Account value
 * @apiSuccess {Decimal}     account.type            Account type
 * @apiSuccess {String}      warningMesage:         Text message containing warnings about the trade.
 * @apiSuccess {String}      action:                Action contains either buy or sell.
 * @apiSuccess {Number}      orderQty:              Number of shares to be sell or buy  
 * @apiSuccess {Decimal}     orderPercent:          The percent of position being sold or buy
 * @apiSuccess {Decimal}     cashValuePostTrade:    The cash balance remaining in the account after the trade orders 
 * @apiSuccess {Decimal}     estimateAmount:        Security Price * Order Qty 
 * @apiSuccess {String}      orderType:             Trade order Type 
 * @apiSuccess {Decimal}     price:                 The price used to stage the order.
 * @apiSuccess {String}      instanceDescription:   Description of trade.
 * @apiSuccess {String}      tradingInstructions:   Instructions of trade.
 * @apiSuccess {String}      custodian:             Name of custodian.
 * @apiSuccess {Number}      security_id:           Trade related security id.
 * @apiSuccess {String}      security_name:         Security name
 * @apiSuccess {String}      security_symbol:       Secirity symbol
 * @apiSuccess {String}      security_securityType: Security type name
 * @apiSuccess {Number}      portfolio_id:          Portfolio id
 * @apiSuccess {String}      portfolio_name:        Portfolio name
 * @apiSuccess {Boolean}     isSleevedPortfolio:    Portfolio sleeve or not
 * @apiSuccess {String}       createdBy              Full Name of user who created the Trade order into the system.
 * @apiSuccess {Date}        createdDate            Trade order creation date into application.
 * @apiSuccess {Date}        holdUntill             Trade order hold until date.
 * @apiSuccess {Number}      model_id               Model Id.
 * @apiSuccess {String}      model_name             Model name. 
 * @apiSuccess {Number}      allocationStatus_id    Allocation status id
 * @apiSuccess {Sring}       allocationStatus_name  Allocation status name
 * @apiSuccess {Number}      approvalStatus_id      ApprovalStatus id
 * @apiSuccess {Sring}       allrovalStatus.name    Approval status name
 * @apiSuccess {Number}      holding_id             Holding id
 * @apiSuccess {Sring}       holding_name           Holding name
 * @apiSuccess {Number}      blockId                Block id
 * @apiSuccess {Decimal}     cashValue              Available cash in the account
 * @apiSuccess {Number}      daysUntilLongTerm      No. of days from Acquired date to current date
 * @apiSuccess {String}      execInst               Trade execution instructions
 * @apiSuccess {Date}        expireTime             Trade expiration time
 * @apiSuccess {Date}        fullSetDate            Trade full set trade
 * @apiSuccess {String}      gainLossMessage        Trade gain loss message
 * @apiSuccess {String}      handlInst              Trade handl instructions
 * @apiSuccess {Boolean}     hasBlock = false       Trade is block or not
 * @apiSuccess {Number}      instanceId             Trade instance id
 * @apiSuccess {String}      instanceNotes          Trade instance instructions
 * @apiSuccess {Boolean}     isDiscretionary        Trade is discretionary
 * @apiSuccess {Boolean}     locateReqd             Trade is locate required
 * @apiSuccess {Number}      longTermGain           Trade long term gain
 * @apiSuccess {Number}      managementStyle        Trade management style
 * @apiSuccess {String}      masterAccountNumber    custodian master account
 * @apiSuccess {Decimal}     marketValue = 0        Trade market value
 * @apiSuccess {Number}      notes                  Trade notes
 * @apiSuccess {Number}      orderStatus_id         Trade order status id
 * @apiSuccess {Number}      orderStatus.name       Trade order status name
 * @apiSuccess {Number}      originalOrderQty       Original quantity of order during trade generation
 * @apiSuccess {Boolean}     isQualified = false;   Trade is qualified
 * @apiSuccess {String}      rebalanceLevel         Trade rebalance level
 * @apiSuccess {Boolean}     reinvestDividends      Trade reinvest dividends
 * @apiSuccess {Boolean}     reinvestLongTermGains  Trade long term gain
 * @apiSuccess {Boolean}     reinvestShortTermGains Trade short term gain
 * @apiSuccess {Number}     rowVersion              Trade row version
 * @apiSuccess {Number}      settlementType.id      Settlement type id
 * @apiSuccess {Number}      settlementType.name    Settlement type name
 * @apiSuccess {Number}      pendingUnits           Trade pending units
 * @apiSuccess {Number}      shortTermGain          Trade short term gain
 * @apiSuccess {Number}      stopPrice              Trade stop price
 * @apiSuccess {Number}      timeInForce            Trade time in force
 * @apiSuccess {Number}      totalGain              Trade total gain
 * @apiSuccess {Number}      tradePercentOfAccount  Trade percent amount
 * @apiSuccess {Number}      transactionId          Transation id
 * @apiSuccess {Decimal}     washAmount             Wash amount
 * @apiSuccess {Number}      washUnits              Wash units
 * @apiSuccess {String}      assetClassName         Security asset class name
 * @apiSuccess {String}      clientDirect           Trade is client direct
 * @apiSuccess {Decimal}     minimmCashBalance      Trade minimy=um balance
 * @apiSuccess {String}      repNotes               Repersentative notes
 * @apiSuccess {String}      representativeName     Repersentative name
 * @apiSuccess {Boolean}     isSolicited            Trade is solicited
 * @apiSuccess {Sring}       editedBy               Full Name of user who edited the Trade order into the system.
 * @apiSuccess {Date}        editedDate             Trade order edit date into application.  
 * @apiSuccess {Boolean}     canEdit                Whether user can edit trade or not
 * @apiSuccess {Boolean}     canExecute             Whether user can execute trade or not
 * @apiSuccess {String}      shortCodeMessages      Trade Error messages
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *     "id": 5,
 *      "isEnabled": 0,
 *      "account": {
 *          "id": 80004,
 *          "accountId": "80004",
 *          "name": "Kane, Jr.  Fredric",
 *          "number": "TE1001",
 *          "value" : null, 
 *          "type" : null
 *       },
 *      "warningMessage": null,
 *      "action": "BUY",
 *      "orderQty": 6,
 *      "orderPercent": 50,
 *      "cashValuePostTrade": null,
 *      "estimateAmmount": 41304,
 *      "orderType": null,
 *      "price": 61,
 *      "createdBy": "prime@tgi.com",
 *      "createdDate": "2016-09-13T04:33:36.000Z",
 *      "instanceDescription": null,
 *      "tradingInstructions": null,
 *      "custodian": "Prime",
 *      "security": {
 *          "id": 7,
 *          "name": null,
 *          "symbol": null,
 *          "securityType": null
 *      },
 *      "portfolio": {
 *          "id": 15,
 *          "name": "P1001",
 *          "isSleevedPortfolio": true
 *       },
 *       "model": {
 *           "id": 1,
 *          "name": "testModel"
 *       },
 *      "holdUntil": null,
 *      "allocationStatus":{
 *          "id":3,
 *          "name":"Accepted"
 *       },
*       "approvalStatus":{
*           "id":3,
*           "name":"Pending Approval"
*       },
*       "holding":{
*           "id":2,
*           "units":100
*       },
*       "blockId":1,
*       "cashValue":1000,
*       "daysUntilLongTerm":20,
*       "execInst":"None",
*       "expireTime":null,
*       "fullSetDate":null,
*       "gainLossMessage":null,
*       "handlInst":"private",
*       "hasBlock":false,
*       "instanceId":1,
*       "instanceNotes":null,
*       "locateReqd":null,
*       "longTermGain":0,
*       "managementStyle":"",
*       "marketValue":0,
*       "notes":null,
*       "orderStatus":{
*           "id":1,
*           "name":"Filled"
*           },
*       "originalOrderQty":20,
*       "isQualified":true,
*       "rebalanceLevel":"Portfolio",
*       "reinvestDividends":true,
*       "reinvestLongTermGains":false,
*       "reinvestShortTermGains":false,
*       "rowVersion":2,
*       "settlementType":{
*           "id":2,
*           "name":"cash"
*        },
*       "pendingUnits":2,
*       "shortTermGain":200,
*       "stopPrice":2000,
*       "timeInForce":"Day",
*       "totalGain":400,
*       "tradePercentOfAccount":20.08,
*       "transactionId":null,
*       "washUnits":20,
*       "assetClassName":"cash",
*       "clientDirect":false,
*       "minimmCashBalance":300,
*       "repNotes":null,
*       "representativeName":"orion test",
*       "isAutoAllocate":null,
*       "editedBy":"prime@tgi.com",
*       "editedDate":"2016-11-07T03:34:25.000Z",
*       "washAmount":200,
*       "canEdit" : true,
*       "canExecute" : true,
*       "shortCodeMessages":AccountNeg;ProductZer
*    }]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/
/**
 * @api {get} /tradeorder/trades/count Count of Trade Order 
 * @apiName GetCountOfTradeOrder
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission Count only those order whose portfolios assignied to his team
 *
 * @apiDescription This API gets trade count. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/count
 * 
 * @apiSuccess {Number}     noOfTrades: Count of trades. 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          noOfTrades:200
 *     }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.get('/', UserMiddleWare.getDifferentAccessForUser, function (req, res) {
    logger.info("Get all trades log request received");
    var data = req.data;
    data.tradeTabTypeFilter = 1;
    data.newPortfolios = 0;
    if (req.query.search) {
        data.search = req.query.search;
    }
    if (req.query.status) {
        data.status = req.query.status;
    }
    if(req.query.portfolioId){
        data.portfolioId = req.query.portfolioId;
    }
    else{
        data.portfolioId;
    }
    tradeService.getList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/count', UserMiddleWare.getDifferentAccessForUser, function (req, res) {
    logger.info("Get total no. of trades request received");
    tradeService.getCountOfTrades(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /tradeorder/trades/action/enable Enable Trade Orders 
 * @apiName EnableTradeOrder
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API enables trade orders. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}      tradeIds :  List of Trade order ids.
 * Json is optional. Please dont pass json in case of enable all
 * @apiParamExample {json} Request-Example:
 *     
 * {
 *           "tradeIds" : [11,12]
 * }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/action/enable
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Trades enabled successfully"
        }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */

app.put('/action/enable', UserMiddleWare.getDifferentAccessForUser, function (req, res) {
    logger.info("Enable trades request received");
    tradeService.enableTrades(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /tradeorder/trades/action/disable disable Trade Orders 
 * @apiName DisableTradeOrder
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API disables the trade orders. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}      tradeIds :  List of Trade order ids.
 * 
 * @apiParamExample {json} Request-Example:
 * Json is optional. Please dont pass json in case of disable all     
 * {
 *           "tradeIds" : [11,12]
 * }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/action/disable
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Trades disabled successfully"
        }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
app.put('/action/disable', UserMiddleWare.getDifferentAccessForUser, function (req, res) {
    logger.info("Disable trades request received");
    tradeService.disableTrades(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /tradeorder/trades/action/processTrades Process Trade Orders 
 * @apiName ProcessTradeOrder
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API process trade orders. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}   tradeIds :  List of Trade order ids.
 * 
 * @apiParamExample {json} Request-Example:
 * Json is optional. Please dont pass json in case of process all
 * {
 *           "tradeIds" : [11,12]
 * }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/action/processTrades
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [11,12]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */

app.put('/action/processTrades', UserMiddleWare.getDifferentAccessForUser, function (req, res) {
    logger.info("process trades request received");
    tradeService.processTrades(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {put} /tradeorder/trades/action/setApprovalStatus/:approvalStatusId Approve Trade Orders 
 * @apiName ApproveTradeOrder
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API approve trade orders. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam{number}       approvalStatusId : pass approvalStatus id in url
 * @apiParam {Number}      tradeIds :  List of Trade order ids.
 * 
 * @apiParamExample {json} Request-Example:
 * {
 *           "tradeIds" : [11,12]
 * }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/action/setApprovalStatus/1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [11,12]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */

app.put('/action/setApprovalStatus/:approvalStatusId', UserMiddleWare.getDifferentAccessForUser, function (req, res) {
    logger.info("Approval trade request received");
    var data = req.data;
    data.approvalStatusId = req.params.approvalStatusId;
    tradeService.setApprovalStatus(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {post} /tradeorder/trades/ Save Trade Detail 
 * @apiName saveTradeDetail
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser
 *
 * @apiDescription This API generate trade order. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}      accountId              Account id
 * @apiParam {Number}      portfolioId:           Portfolio id.
 * @apiParam {String}      actionId:              Action id
 * @apiParam {Number}      security_id:           security id.
 * @apiParam {Boolean}     isSendImmediately:     Trade to send for process.
 * @apiParam {Number}      dollarAmount:          Dollar amount to be spent for buy or sell
 * @apiParam {Number}      quantity:              Number of shares to be sell or buy  
 * @apiParam {Decimal}     percentage:            The percent of position being sold or buy
 
 * @apiParamExample {json} Request-Example:
 *     
 * {
 *    "accountId":9006,
 *    "portfolioId": 15,
 *    "actionId":1,
 *    "securityId":14630,
 *    "dollarAmount":0,
 *    "quantity":0,
 *    "percentage":0,
 *    "isSendImmediately":0
 *   }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "message": Trade generated successfully
 *      }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Save trade request received");
    req.data.hostname = req.headers['host'];
	req.data.authKey =  req.headers['authorization'];
    tradeService.saveTrade(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {post} /tradeorder/trades/validate Validate Trade 
 * @apiName Validate Trade
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser
 *
 * @apiDescription This API validate trade order. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}      accountId              Account id
 * @apiParam {Number}      portfolioId:           Portfolio id.
 * @apiParam {String}      actionId:              Action id
 * @apiParam {Number}      security_id:           security id.
 * @apiParam {Boolean}     isAutoAllocate:        Trade isAutoAllocate.
 * @apiParam {Number}      dollarAmount:          Dollar amount to be spent for buy or sell
 * @apiParam {Number}      quantity:              Number of shares to be sell or buy  
 * @apiParam {Decimal}     percentage:            The percent of position being sold or buy
 
 * @apiParamExample {json} Request-Example:
 *     
 * {
 *    "accountId":9006,
 *    "portfolioId": 15,
 *    "actionId":1,
 *    "securityId":14630,
 *    "dollarAmount":0,
 *    "quantity":0,
 *    "percentage":0        ,
 *    "isAutoallocate":0
 *   }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/validate
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "message": Trade validate successfully,
 *          "tradeAmount": 122,
 *          "cashValuePostTrade":12
 *      }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/validate', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("validate trade request received");
    tradeService.validateTrade(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {patch} /tradeorder/trades/:id Update Some Fields of Trade Detail 
 * @apiName updateDomeFieldsTradeDetail
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser
 *
 * @apiDescription This API will update some fields of trade order. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 *
 * @apiParam {Number}      id:                   Trade order id
 * @apiParam {Decimal}     price:                The price used to stage the order.
 * @apiParam {Number}      orderQty:             Number of shares to be sell or buy  
 * @apiParam {Number}      stopPrice:            Trade stop price.
 * @apiParam {Number}      limitPrice:           Trade limit price.
 * @apiParam {Number}      orderTypeId:          Order type id
 * @apiParam {Number}      qualifierId:          Qualifier id
 * @apiParam {Number}      durationId:           Duration id
 * @apiParam {Number}      actionId:             Trade action id
 * @apiParam {Boolean}     isDiscretionary:      Trade isDiscretionary.
 * @apiParam {Boolean}     isSolicited:          Trade isSolicited.
 * @apiParam {Boolean}     isAutoAllocate:       Trade isAutoAllocate.
 * @apiParam {Boolean}     isSendImmediately:    Trade to send for process.
 * @apiParamExample {json} Request-Example:
 *     
 * {
 *           "id":1,
 *           "price": 20,
 *           "orderQty": 6,
 *           "limitPrice": 8,
 *           "stopPrice": 7,
 *           "orderTypeId": 1,
 *           "qualifierId":2,
 *           "durationId":1,
 *           "actionId":1,
 *           "isDiscretionary": 0,
 *           "isSolicited": 1,
 *           "isAutoAllocate": 1,
 *           "isSendImmediately":1
 *   }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/3
 * 
 * @apiSuccess {Number}      id :                   Trade order id.
 * @apiSuccess {Boolean}     isEnabled:             It indicates wheter trade order is enable ot not.
 * @apiSuccess {Decimal}     estimateAmount:        Security Price * Order Qty 
 * @apiSuccess {Decimal}     price:                 The price used to stage the order.
 * @apiSuccess {String}      createdBy              Full Name of user who created the Trade order into the system.
 * @apiSuccess {Date}        createdDate            Trade order creation date into application.
 * @apiSuccess {String}      editedBy               Full Name of user who edited the Trade order into the system.  
 * @apiSuccess {Date}        editedDate             Trade order edit date into application.
 * @apiSuccess {String}      warningMesage:         Text message containing warnings about the trade.
 * @apiSuccess {Number}      orderQty:              Number of shares to be sell or buy  
 * @apiSuccess {Decimal}     orderPercent:          The percent of position being sold or buy
 * @apiSuccess {Decimal}     cashValuePostTrade:    The cash balance remaining in the account after the trade orders 
 * @apiSuccess {String}      tradingInstructions:   Instructions of trade.
 * @apiSuccess {Number}      account_id             Account id
 * @apiSuccess {Number}      account_accountId:     Account id of orion connect
 * @apiSuccess {String}      account_name:          Account name 
 * @apiSuccess {String}      account_number:        Account number 
 * @apiSuccess {Number}      security_id:           Trade related security id.
 * @apiSuccess {String}      security_name:         Security name
 * @apiSuccess {String}      security_symbol:       Secirity symbol
 * @apiSuccess {String}      security_securityType: Security type name
 * @apiSuccess {String}      custodian:             Name of custodian.
 * @apiSuccess {Number}      stopPrice:             Trade stop price.
 * @apiSuccess {Number}      limitPrice:            Trade limit price.
 * @apiSuccess {Number}      orderType_id:          Order type id
 * @apiSuccess {String}      orderType_name:        Order Type name
 * @apiSuccess {Number}      qualifier_id:          Qualifier id
 * @apiSuccess {String}      qualifier_name:        Qualifier name
 * @apiSuccess {Number}      duration_id:           Duration id
 * @apiSuccess {String}      duration_name:         Duration name
 * @apiSuccess {Number}      action_id:             Trade action id
 * @apiSuccess {String}      action_name:           Trade action name
 * @apiSuccess {Boolean}     isDiscretionary:      Trade isDiscretionary.
 * @apiSuccess {Boolean}     isSolicited:          Trade isSolicited.
 * @apiSuccess {Boolean}     isAutoAllocate:       Trade isAutoAllocate.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *           "id": 3,
 *           "isEnabled": 1,
 *           "estimateAmount": 131.25,
 *           "price": 61,
 *           "createdBy": "prime@tgi.com",
 *           "createdDate": "2016-09-28T04:33:35.000Z",
 *           "editedBy": "prime@tgi.com",
 *           "editedDate": "2016-10-15T08:05:20.000Z",
 *           "warningMessage": null,
 *           "orderQty": 6,
 *           "orderPercent": 50,
 *           "cashValuePostTrade": null,
 *           "tradingInstructions": null,
 *           "account": {
 *               "id": 2,
 *               "accountId": "8002",
 *               "number": "L0704C0669",
 *               "name": "Ashe Aaron M."
 *          },
 *           "security": {
 *               "symbol": "S",
 *               "name": "Sprint Corporation",
 *               "id": 14612,
 *               "securityType": "CD"
 *           },
 *           "custodian": "Prime",
 *           "limitPrice": 8,
 *           "stopPrice": 7,
 *           "orderType": {
 *               "id": 1,
 *               "name": "Market"
 *           },
 *           "qualifier": {
 *               "id": 2,
 *               "name": "DNR – Do not Reduce"
 *           },
 *           "duration": {
 *               "id": 1,
 *               "name": "Day"
 *           },
 *           "tradeAction": {
 *              "id": 1,
 *               "name": "BUY"
 *           },
 *           "isDiscretionary": 0,
 *           "isSolicited": 1,
 *           "isAutoAllocate": 1
 *   }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.patch('/:id', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Update trade request received");
    var data = req.data;
    data.tradeId = req.params.id
    tradeService.updateTrade(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /tradeorder/trades/:id/action/holdUntil Update Trade Hold Until Date
 * @apiName updateTradeholdUntilDate
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser
 *
 * @apiDescription This API will update hold until data of trade order. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 *
 * @apiParam {Number}      id:                   Trade order id
 * @apiParam {Date}        holdUntil:            Trade hold until date.

 * @apiParamExample {json} Request-Example:
 *     
 * {
 *           "id":1,
 *           "holdUntil": "2016-09-28T04:33:35.000Z"
 *   }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/{id}/action/holdUntil
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Hold Until Date updated successfully "
 *     }
 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.put('/:id/action/holdUntil', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Update trade request received");
    var data = req.data;
    data.id = req.params.id
    data.type = "Hold Until Date";
    tradeService.updateSomeFieldsOfTrade(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {put} /tradeorder/trades/:id/action/clientDirected Update Trade Client Directed 
 * @apiName updateTradeClientDirected
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser
 *
 * @apiDescription This API will update client directed value of trade order. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 *
 * @apiParam {Number}      id:                   Trade order id
 * @apiParam {Boolean}     clientDirected:       Trade client directed or not
 * @apiParamExample {json} Request-Example:
 *     
 * {
 *           "id":1,
 *           "clientDirected": true
 *   }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/{id}/action/clientDirected
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Client Directed updated successfully"
 *     }
 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.put('/:id/action/clientDirected', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Update client directed request received");
    var data = req.data;
    data.id = req.params.id
    data.type = "Client Directed";
    tradeService.updateSomeFieldsOfTrade(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {put} /tradeorder/trades/:id/action/settlementType Update Trade Settlement Type 
 * @apiName updateTradeSettlementType
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser
 *
 * @apiDescription This API will update settlementType of trade order. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 *
 * @apiParam {Number}      id:                   Trade order id
 * @apiParam {Number}      settlementTypeId:     Trade settlement type id.

 * @apiParamExample {json} Request-Example:
 *     
 * {
 *           "id":1,
 *           "settlementTypeId": 8
 *   }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/{id}/action/settlementType
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Settlement Type updated successfully."
 *     }
 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.put('/:id/action/settlementType', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Update settlementType request received");
    var data = req.data;
    data.id = req.params.id
    data.type = "Settlement type";
    tradeService.updateSomeFieldsOfTrade(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**
 * @api {delete} /tradeorder/trades/deleteAll Delete All Trade Order 
 * @apiName DeleteAllTradeOrder
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API deletes all trade order (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/deleteAll
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Trade deleted Successfully"
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
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Trade does not exist or already deleted "
 *     }
 * 
 */

app.delete('/deleteAll', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Delete All trades request received");
    tradeService.deleteTrades(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /tradeorder/trades/action/deleteZeroQuantity Delete Zero Quantity Trade Order 
 * @apiName DeleteZeroQuantityTradeOrder
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Trade Order with zero quantity (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/action/deleteZeroQuantity
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Trade deleted Successfully"
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
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Trade does not exist or already deleted "
 *     }
 * 
 */

app.put('/action/deleteZeroQuantity', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Delete zero quantity trades request received");
    tradeService.deleteZeroQuantityTrades(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**
 * @api {get} /tradeorder/trades/orderTypes Get Order Types
 * @apiName Get All Order Types
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get All order Types. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/orderTypes
 * 
 * @apiSuccess {Number}      id                     Order type Id.
 * @apiSuccess {String}      name                   Order type name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "id": 10,
 *           "name": "Market",
 *       }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/orderTypes', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get orderTypes request received");
    tradeService.getOrderTypes(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /tradeorder/trades/qualifiers Get Qualifiers
 * @apiName Get All Qualifiers
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get All Qualifiers. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/qualifiers
 * 
 * @apiSuccess {Number}      id                     Qualifier Id.
 * @apiSuccess {String}      name                   Qualifier name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "id": 10,
 *           "name": "DNR – Do not Reduce",
 *       }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/qualifiers', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get qualifiers request received"); 
    tradeService.getQualifiers(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /tradeorder/trades/durations Get Durations
 * @apiName Get All Durations
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get All Durations. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/durations
 * 
 * @apiSuccess {Number}      id                     Duration Id.
 * @apiSuccess {String}      name                   Duration name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "id": 10,
 *           "name": "Day",
 *       }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/durations', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get durations received");
    tradeService.getDurations(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {get} /tradeorder/trades/accountActions Get Account Actions
 * @apiName Get All Account Actions
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get All Actions when user select account in quick trade . 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/accountActions
 * 
 * @apiSuccess {Number}      id                     Action Id.
 * @apiSuccess {String}      name                   Action name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "id": 10,
 *           "name": "Buy",
 *       },
 *       {
 *           "id": 10,
 *           "name": "SellL",
 *       },
 *       {
 *           "id": 10,
 *           "name": "Liquidate",
 *       }
 *       ]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/accountActions', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get actions  request received");
    var data = req.data;
    data.isAccountActions = true;
    tradeService.getActions(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {get} /tradeorder/trades/portfolioActions Get Portfolio Actions
 * @apiName Get All Portfolio Actions
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get All Portfolio Actions While user select portfolio in quick trade. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/portfolioActions
 * 
 * @apiSuccess {Number}      id                     Action Id.
 * @apiSuccess {String}      name                   Action name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "id": 10,
 *           "name": "Buy",
 *       }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/portfolioActions', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get actions  request received");
    var data = req.data;
    data.isPortfolioActions = true;
    tradeService.getActions(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {get} /tradeorder/trades/tradeActions Get Trade Actions
 * @apiName Get All Trade Actions
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get All Trade Actions. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/tradeActions
 * 
 * @apiSuccess {Number}      id                     Trade Action Id.
 * @apiSuccess {String}      name                   Trade Action name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "id": 10,
 *           "name": "Buy",
 *       },
 *           "id": 10,
 *           "name": "Sell",
 *       }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/tradeActions', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get trade actions request received");
    tradeService.getTradeActions(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});



/**
 * @api {get} /tradeorder/trades/settlementTypes Get Settlement Type
 * @apiName Get All Settlement Types
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get All settlement types. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/settlementTypes
 * 
 * @apiSuccess {Number}      id                     Settlement Type Id.
 * @apiSuccess {String}      name                   Settlement Type name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "id": 10,
 *           "name": "Type1",
 *       },
 *           "id": 10,
 *           "name": "Type2",
 *       }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/settlementTypes', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get trade actions request received");
    tradeService.getSettlementTypes(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});



/**
 * @api {get} /tradeorder/trades/tradeApprovalStatus?tradeIds=1,2,3 Get Trade Approval Status
 * @apiName Get All Trade Approval Status
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get All Trade Approval Status. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/   tradeorder/trades/tradeApprovalStatus?tradeIds=1,2,3
 * Please pass selected trade ids in query string 
 * @apiSuccess {Number}      approvedStatusId                     Trade Action Id.
 * @apiSuccess {String}      approvedStatusName                   Trade Action name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "approvedStatusId": 10,
 *           "approvedStatusName": "Approved",
 *       },
 *           "approvedStatusId": 10,
 *           "approvedStatusName": "Not Approved",
 *       }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/tradeApprovalStatus', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get trade approval status request received");
    var data = req.data;
    if (req.query.tradeIds) {
        data.tradeIds = req.query.tradeIds;
    }
    tradeService.getTradeApprovalStatus(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @apiName Get Models by trades
 * @api {get} /tradeorder/trades/model/simple Get Models by trades
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser 
 * 
 * @apiDescription This API Get Models By Trade. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/model/simple?tradeIds=1,2,3
 * Please pass selected trade ids in query string 
 * @apiSuccess {Number}      id                     Model Id.
 * @apiSuccess {String}      name                   Model name   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [{
 *           "id": 10,
 *           "name": "Model1",
 *       },
 *           "id": 10,
 *           "name": "Model2",
 *      }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/model/simple', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get Models by trade request received");
    var data = req.data;
    if (req.query.tradeIds) {
        data.tradeIds = req.query.tradeIds;
    }
    tradeService.getModelsByTrades(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {get} /tradeorder/trades/awaitingAcceptance Get Awaiting Acceptance Trades 
 * @apiName Get Awaiting Acceptance trades
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission Get only those order whose portfolios assignied to his team
 *
 * @apiDescription This API get all trades. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/awaitingAcceptance
 * 
 * @apiSuccess {Number}      id                     Trade order Id.
 * @apiSuccess {Boolean}     isEnabled:             It indicates wheter trade order is enable ot not.
 * @apiSuccess {Number}      account_id             Account id
 * @apiSuccess {Number}      account_accountId:     Account id of orion connect
 * @apiSuccess {String}      account_name:          Account name 
 * @apiSuccess {String}      account_number:        Account number 
 * @apiSuccess {Decimal}     account_value           Account value
 * @apiSuccess {Decimal}     account.type            Account type
 * @apiSuccess {String}      warningMesage:         Text message containing warnings about the trade.
 * @apiSuccess {String}      action:                Action contains either buy or sell.
 * @apiSuccess {Number}      orderQty:              Number of shares to be sell or buy  
 * @apiSuccess {Decimal}     orderPercent:          The percent of position being sold or buy
 * @apiSuccess {Decimal}     cashValuePostTrade:    The cash balance remaining in the account after the trade orders 
 * @apiSuccess {Decimal}     estimateAmount:        Security Price * Order Qty 
 * @apiSuccess {String}      orderType:             Trade order Type 
 * @apiSuccess {Decimal}     price:                 The price used to stage the order.
 * @apiSuccess {String}      instanceDescription:   Description of trade.
 * @apiSuccess {String}      tradingInstructions:   Instructions of trade.
 * @apiSuccess {String}      custodian:             Name of custodian.
 * @apiSuccess {Number}      security_id:           Trade related security id.
 * @apiSuccess {String}      security_name:         Security name
 * @apiSuccess {String}      security_symbol:       Secirity symbol
 * @apiSuccess {String}      security_securityType: Security type name
 * @apiSuccess {Number}      portfolio_id:          Portfolio id
 * @apiSuccess {String}      portfolio_name:        Portfolio name
 * @apiSuccess {Boolean}     isSleevedPortfolio:    Portfolio sleeve or not
 * @apiSuccess {Sring}       createdBy              Full Name of user who created the Trade order into the system.
 * @apiSuccess {Date}        createdDate            Trade order creation date into application.  
 * @apiSuccess {Date}        holdUntill             Trade order hold until date.
 * @apiSuccess {Number}      model_id               Model Id.
 * @apiSuccess {String}      model_name             Model name.
 * @apiSuccess {Number}      allocationStatus_id    Allocation status id
 * @apiSuccess {Sring}       allocationStatus_name  Allocation status name
 * @apiSuccess {Number}      approvalStatus_id      ApprovalStatus id
 * @apiSuccess {Sring}       allrovalStatus.name    Approval status name
 * @apiSuccess {Number}      holding_id             Holding id
 * @apiSuccess {Sring}       holding_name           Holding name
 * @apiSuccess {Number}      blockId                Block id
 * @apiSuccess {Decimal}     cashValue              Available cash in the account
 * @apiSuccess {Number}      daysUntilLongTerm      No. of days from Acquired date to current date
 * @apiSuccess {String}      execInst               Trade execution instructions
 * @apiSuccess {Date}        expireTime             Trade expiration time
 * @apiSuccess {Date}        fullSetDate            Trade full set trade
 * @apiSuccess {String}      gainLossMessage        Trade gain loss message
 * @apiSuccess {String}      handlInst              Trade handl instructions
 * @apiSuccess {Boolean}     hasBlock = false       Trade is block or not
 * @apiSuccess {Number}      instanceId             Trade instance id
 * @apiSuccess {String}      instanceNotes          Trade instance instructions
 * @apiSuccess {Boolean}     isDiscretionary        Trade is discretionary
 * @apiSuccess {Boolean}     locateReqd             Trade is locate required
 * @apiSuccess {Number}      longTermGain           Trade long term gain
 * @apiSuccess {Number}      managementStyle        Trade management style
 * @apiSuccess {String}      masterAccountNumber    custodian master account
 * @apiSuccess {Decimal}     marketValue = 0        Trade market value
 * @apiSuccess {Number}      notes                  Trade notes
 * @apiSuccess {Number}      orderStatus_id         Trade order status id
 * @apiSuccess {Number}      orderStatus.name       Trade order status name
 * @apiSuccess {Number}      originalOrderQty       Original quantity of order during trade generation
 * @apiSuccess {Boolean}     isQualified = false;   Trade is qualified
 * @apiSuccess {String}      rebalanceLevel_Id      Trade rebalance level id
 * @apiSuccess {String}      rebalanceLevel_name    Trade rebalance level name
 * @apiSuccess {Boolean}     reinvestDividends      Trade reinvest dividends
 * @apiSuccess {Boolean}     reinvestLongTermGains  Trade long term gain
 * @apiSuccess {Boolean}     reinvesShortTermGains  Trade short term gain
 * @apiSuccess {Number}      rowVersion             Trade row version
 * @apiSuccess {Number}      settlementType.id      Settlement type id
 * @apiSuccess {Number}      settlementType.name    Settlement type name
 * @apiSuccess {Number}      pendingUnits           Trade pending units
 * @apiSuccess {Number}      shortTermGain          Trade short term gain
 * @apiSuccess {Number}      stopPrice              Trade stop price
 * @apiSuccess {Number}      timeInForce            Trade time in force
 * @apiSuccess {Number}      totalGain              Trade total gain
 * @apiSuccess {Number}      tradePercentOfAccount  Trade percent amount
 * @apiSuccess {Number}      transactionId          Transation id
 * @apiSuccess {Decimal}     washAmount Wash amount
 * @apiSuccess {Number}      washUnits               Wash units
 * @apiSuccess {String}      assetClassName          Security asset class name
 * @apiSuccess {String}      clientDirect            Trade is client direct
 * @apiSuccess {Decimal}     minimmCashBalance       Trade minimy=um balance
 * @apiSuccess {String}      repNotes                Repersentative notes
 * @apiSuccess {String}      representativeName      Repersentative name
 * @apiSuccess {Boolean}     isSolicited             Trade is solicited
 * @apiSuccess {Sring}       editedBy                Full Name of user who edited the Trade order into the system.
 * @apiSuccess {Date}        editedDate              Trade order edit date into application.  
 * @apiSuccess {Boolean}     canEdit                 Whether user can edit trade or not
 * @apiSuccess {Boolean}     canExecute              Whether user can execute trade or not
 * @apiSuccess {Number}      durationId              Trade duration id
 * @apiSuccess {String}      durationName            Trade duration name
 * @apiSuccess {String}      currentModelName        Current Model Name which is assigned to portfolio
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *     "id": 5,
 *      "isEnabled": 0,
 *      "account": {
 *          "id": 80004,
 *          "accountId": "80004",
 *          "name": "Kane, Jr.  Fredric",
 *          "number": "TE1001",
 *          "value" : null, 
 *          "type" : null
 *       },
 *      "warningMessage": null,
 *      "action": "BUY",
 *      "orderQty": 6,
 *      "orderPercent": 50,
 *      "cashValuePostTrade": null,
 *      "estimateAmmount": 41304,
 *      "orderType": null,
 *      "price": 61,
 *      "createdBy": "prime@tgi.com",
 *      "createdDate": "2016-09-13T04:33:36.000Z",
 *      "instanceDescription": null,
 *      "tradingInstructions": null,
 *      "custodian": "Prime",
 *      "security": {
 *          "id": 7,
 *          "name": null,
 *          "symbol": null,
 *          "securityType": null
 *      },
 *      "portfolio": {
 *          "id": 15,
 *          "name": "P1001",
 *          "isSleevedPortfolio":true
 *       },
 *       "model": {
 *           "id": 1,
 *          "name": "testModel"
 *       },
 *       "holdUntil": null,
 *      allocationStatus":{
 *          "id":3,
 *          "name":"Accepted"
 *       },
*       "approvalStatus":{
*           "id":3,
*           "name":"Pending Approval"
*       },
*       "holding":{
*           "id":2,
*           "units":100
*       },
*       "blockId":1,
*       "cashValue":1000,
*       "daysUntilLongTerm":20,
*       "execInst":"None",
*       "expireTime":null,
*       "fullSetDate":null,
*       "gainLossMessage":null,
*       "handlInst":"private",
*       "hasBlock":false,
*       "instanceId":1,
*       "instanceNotes":null,
*       "isDiscretionary":false,
*       "locateReqd":null,
*       "longTermGain":0,
*       "managementStyle":"",
*       "marketValue":0,
*       "notes":null,
*       "orderStatus":{
*           "id":1,
*           "name":"Filled"
*           },
*       "originalOrderQty":20,
*       "isQualified":true,
*       "rebalanceLevel":{
*           "id":1,
*           "name":"level1"
*         },
*       "reinvestDividends":true,
*       "reinvestLongTermGains":false,
*       "reinvestShortTermGains":false,
*       "rowVersion":2,
*       "settlementType":{
*           "id":2,
*           "name":"cash"
*        },
*       "pendingUnits":2,
*       "shortTermGain":200,
*       "stopPrice":2000,
*       "timeInForce":"Day",
*       "totalGain":400,
*       "tradePercentOfAccount":20.08,
*       "transactionId":null,
*       "washUnits":20,
*       "assetClassName":"cash",
*       "clientDirect":false,
*       "minimmCashBalance":300,
*       "repNotes":null,
*       "representativeName":"orion test",
*       "isAutoAllocate":null,
*       "editedBy":"prime@tgi.com",
*       "editedDate":"2016-11-07T03:34:25.000Z",
*       "washAmount":200,
*       "editedBy": "prime@tgi.com",
*       "editedDate": "2016-09-13T04:33:36.000Z",
*       "isSolicited": false,
*       "canEdit" : true,
*       "canExecute" : true,
*       "currentModelName": "Community Model 1",
*       "duration": {
*         "id": 1,
*         "name": "Day"
*       }
*    }]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example)
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/
app.get('/awaitingAcceptance', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get awaiting acceptance trade orders request received");
    var data = req.data;
    data.tradeTabTypeFilter = 2;
    tradeService.getList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /tradeorder/trades/:id Get Trade Detail 
 * @apiName GetTradeDetail
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser
 *
 * @apiDescription This API gets trade order by id. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/3
 * 
 * @apiSuccess {Number}      id :                   Trade order id.
 * @apiSuccess {Boolean}     isEnabled:             It indicates wheter trade order is enable ot not.
 * @apiSuccess {Decimal}     estimateAmount:        Security Price * Order Qty 
 * @apiSuccess {Decimal}     price:                 The price used to stage the order.
 * @apiSuccess {String}      createdBy              Full Name of user who created the Trade order into the system.
 * @apiSuccess {Date}        createdDate            Trade order creation date into application.
 * @apiSuccess {String}      editedBy               Full Name of user who edited the Trade order into the system.
 * @apiSuccess {Date}        editedDate             Trade order edit date into application.
 * @apiSuccess {String}      warningMesage:         Text message containing warnings about the trade.
 * @apiSuccess {Number}      orderQty:              Number of shares to be sell or buy  
 * @apiSuccess {Decimal}     orderPercent:          The percent of position being sold or buy
 * @apiSuccess {Decimal}     cashValuePostTrade:    The cash balance remaining in the account after the trade orders 
 * @apiSuccess {String}      tradingInstructions:   Instructions of trade.
 * @apiSuccess {Number}      account_id             Account id
 * @apiSuccess {Number}      account_accountId:     Account id of orion connect
 * @apiSuccess {String}      account_name:          Account name 
 * @apiSuccess {String}      account_number:        Account number 
 * @apiSuccess {Number}      security_id:           Trade related security id.
 * @apiSuccess {String}      security_name:         Security name
 * @apiSuccess {String}      security_symbol:       Secirity symbol
 * @apiSuccess {String}      security_securityType: Security type name
 * @apiSuccess {String}      custodian:             Name of custodian.
 * @apiSuccess {Number}      stopPrice:             Trade stop price.
 * @apiSuccess {Number}      limitPrice:            Trade limit price.
 * @apiSuccess {Number}      orderType_id:          Order type id
 * @apiSuccess {String}      orderType_name:        Order Type name
 * @apiSuccess {Number}      qualifier_id:          Qualifier id
 * @apiSuccess {String}      qualifier_name:        Qualifier name
 * @apiSuccess {Number}      duration_id:           Duration id
 * @apiSuccess {String}      duration.name:         Duration name
 * @apiSuccess {Number}      action_id:             Trade action id
 * @apiSuccess {String}      action_name:           Trade action name
 * @apiSuccess {Boolean}     isDiscretionary:      Trade isDiscretionary.
 * @apiSuccess {Boolean}     isSolicited:          Trade isSolicited.
 * @apiSuccess {Boolean}     isAutoAllocate:       Trade isAutoAllocate.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *           "id": 3,
 *           "isEnabled": 1,
 *           "estimateAmount": 131.25,
 *           "price": 61,
 *           "createdBy": "prime@tgi.com",
 *           "createdDate": "2016-09-28T04:33:35.000Z",
 *           "editedBy": "prime@tgi.com",
 *           "editedDate": "2016-10-15T08:05:20.000Z",
 *           "warningMessage": null,
 *           "orderQty": 6,
 *           "orderPercent": 50,
 *           "cashValuePostTrade": null,
 *           "tradingInstructions": null,
 *           "account": {
 *               "id": 2,
 *               "accountId": "8002",
 *               "number": "L0704C0669",
 *               "name": "Ashe Aaron M."
 *          },
 *           "security": {
 *               "symbol": "S",
 *               "name": "Sprint Corporation",
 *               "id": 14612,
 *               "securityType": "CD"
 *           },
 *           "custodian": "Prime",
 *           "limitPrice": 8,
 *           "stopPrice": 7,
 *           "orderType": {
 *               "id": 1,
 *               "name": "Market"
 *           },
 *           "qualifier": {
 *               "id": 2,
 *               "name": "DNR – Do not Reduce"
 *           },
 *           "duration": {
 *               "id": 1,
 *               "name": "Day"
 *           },
 *           "action": {
 *              "id": 1,
 *              "name": "BUY"
 *           },
 *           "isDiscretionary": 0,
 *           "isSolicited": 1,
 *           "isAutoAllocate": 1
 *   }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/:id', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get trade request received");
    var data = req.data;
    data.id = req.params.id;
    tradeService.getTradeDetail(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /tradeorder/trades/tradeOrderMessages/:id Get Trade Order Messages 
 * @apiName GetTradeOrderMessages
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appUser
 *
 * @apiDescription This API get all trade order messages by trade order id. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/tradeOrderMessages/3
 * 
 * @apiSuccess {Number}      id :                   Trade order message id.
 * @apiSuccess {String}     shortCode:              Trade order short code.
 * @apiSuccess {String}     message:                Trade order message.
 * @apiSuccess {String}     severity                Message severity.
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  [
 *     {
 *           "id": 1,
 *           "shortCode": "AccountNeg",
 *           "message": "Account value is negative.",
 *           "severity": "Error"
 *     },
 *     {
 *           "id": 2,
 *           "shortCode": "ProductZer",
 *           "message": "Holding ID 0 for stock_proxyasset is tradable, but has a price of $0.00.",
 *           "severity": "Error"
 *     },
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/tradeOrderMessages/:id', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Get trade order messages request request received");
    var data = req.data;
    data.id = req.params.id;
    tradeService.getTradeOrderMessages(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {delete} /tradeorder/trades/:id Delete Trade Order 
 * @apiName DeleteTradeOrder
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Trade Order (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/trades/1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Trade deleted Successfully"
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
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Trade does not exist or already deleted "
 *     }
 * 
 */
app.delete('/:id', UserMiddleWare.getDifferentAccessForUser,   function (req, res) {
    logger.info("Delete trades request received");
     var tradeIds = [];
    var data = req.data;
    tradeIds.push(req.params.id);
    data.tradeIds = tradeIds;
    tradeService.deleteTrades(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.post('/temp', function(req,res){
    commonService.generateTradeOrder(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
module.exports = app;