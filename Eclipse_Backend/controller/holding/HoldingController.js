"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');
var response = require('controller/ResponseController.js');
var HoldingService = require('service/holding/HoldingService.js');
var holdingService = new HoldingService();

var logger = helper.logger(moduleName);
var validate = helper.validate;
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js").getDifferentAccessForUser;
var holdingIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}

/**
 * @api {get} /holding/holdings/simple?inAccountId={id}&search={id/name} Search Holding in Account Id
 * @apiName SearchHoldingsInAccountId
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to search of holding in account id   
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/holding/holdings/simple?inAccountId=1&search=1
 

 * @apiSuccess {Number}     id                      Holding Id.
 * @apiSuccess {String}     securityName            Security Name.
 * @apiSuccess {String}     securitySymbol          Security Symbol.
 * @apiSuccess {String}     accountName             Account Name.
 * @apiSuccess {String}     accountNumber           Account number assocaited with holding.
 * @apiSuccess {String}     portfolioName           Portfolio name assocaited with account.
 * @apiSuccess {Number}     price                   Price of holding.
 * @apiSuccess {Number}     shares                  Shares.
 * @apiSuccess {Number}     value                   Holding value.
 * @apiSuccess {Boolean}    isDeleted               Holding exist or not into the system.
 * @apiSuccess {Date}       createdOn               Holding creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Holding into the system.
 * @apiSuccess {Date}       editedOn                Holding edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Holding details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 * [
 *  {
 *   "id": 1,
 *   "securityName": "Int Pinnacle 3: Fid Growth Opps",
 *   "securitySymbol": "INTG44310",
 *   "accountName": "Kane, Jr.  Fredric",
 *   "accountNumber": "L05C900669",
 *   "portfolioName": "Demo Portfolio",
 *   "price": 10,
 *   "shares": 250,
 *   "value": 2500,
 *   "isDeleted": 0,
 *   "createdOn": "2016-09-29T03:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-07-14T03:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 *  }
 * ]
 * 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */


/**
 * @api {get} /holding/holdings/simple?inPortfolioId={id}&search={id/name} Search Holding in Portfolio Id
 * @apiName SearchHoldingsInPortfolioId
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to search of holding in portfolio Id   
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/holding/holdings/simple?inPortfolioId=1&search=10

 * @apiSuccess {Number}     id                      Holding Id.
 * @apiSuccess {String}     securityName            Security Name.
 * @apiSuccess {String}     securitySymbol          Security Symbol.
 * @apiSuccess {String}     accountName             Account Name.
 * @apiSuccess {String}     accountNumber           Account number assocaited with holding.
 * @apiSuccess {String}     portfolioName           Portfolio name assocaited with account.
 * @apiSuccess {Number}     price                   Price of holding.
 * @apiSuccess {Number}     shares                  Shares.
 * @apiSuccess {Number}     value                   Holding value.
 * @apiSuccess {Boolean}    isDeleted               Holding exist or not into the system.
 * @apiSuccess {Date}       createdOn               Holding creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Holding into the system.
 * @apiSuccess {Date}       editedOn                Holding edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Holding details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 * [
 *  {
 *   "id": 1,
 *   "securityName": "Int Pinnacle 3: Fid Growth Opps",
 *   "securitySymbol": "INTG44310",
 *   "accountName": "Kane, Jr.  Fredric",
 *   "accountNumber": "L05C900669",
 *   "portfolioName": "Demo Portfolio",
 *   "price": 10,
 *   "shares": 250,
 *   "value": 2500,
 *   "isDeleted": 0,
 *   "createdOn": "2016-09-29T03:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-07-14T03:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 *  }
 * ]
 * 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

app.get('/simple', function (req, res) {
    logger.info("Get all holding request received");

    var data = req.data;

    if ((req.query.search && req.query.inAccountId) || (req.query.inAccountId) || (req.query.inAccountId == '') ||
        (req.query.inPortfolioId == '') ||
        (req.query.search && req.query.inPortfolioId) || (req.query.inPortfolioId) ||

        (req.query.search == '') || (req.query.search)) {
        data.simpleSearch = req.query.search;
        data.accountId = req.query.inAccountId;
        data.portfolioId = req.query.inPortfolioId;
        holdingService.getSearchHoldingDetail(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }
    else {
        return response(messages.notImplemented, responseCode.NOT_IMPLEMENTED, null, res);
    }


});


/**
 * @api {get} /holding/holdings?search={id/name} Search Holding by Account Id and Name and Portfolio Id and Name 
 * @apiName SearchHoldingByAccountAndPortfolio
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to Search Holding by Account Id and Name and Portfolio Id and Name
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/holding/holdings?search=2
 * curl -i http://baseurl/v1/holding/holdings?search=Demo

 * @apiSuccess {Number}     id                      Holding Id.
 * @apiSuccess {String}     name                    Security name.
 * @apiSuccess {String}     value                   Holding value.
 * @apiSuccess {String}     type                    Holding type.
 * @apiSuccess {Date}       createdOn               Data creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Holding into the system.
 * @apiSuccess {Date}       editedOn                Data edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Holding details into the system.
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *[
 * {
 *   "id": 3,
 *   "name": "Anderson Alan L.",
 *   "value": 0,
 *   "type": "account",
 *   "isDeleted": 0,
 *   "createdOn": "2016-07-14T03:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-09-28T06:41:55.000Z",
 *   "editedBy": "prime@tgi.com"
 * },
 * {
 *   "id": 3,
 *   "name": "Test Portfolio 3",
 *   "value": 0,
 *   "type": "portfolio",
 *   "isDeleted": 0,
 *   "createdOn": "2016-08-30T10:33:19.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-09-27T13:25:43.000Z",
 *   "editedBy": "prime@tgi.com"
 * }]
 * 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */


app.get('/', function (req, res) {
    logger.info("Get all holding request received");

    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
        holdingService.getAccAndPortWithHoldingValue(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }
    else {
        return response(messages.notImplemented, responseCode.NOT_IMPLEMENTED, null, res);
    }
});


/**
* @api {get} /holding/holdings/holdingfilters Get Holding Filter List 
* @apiName GetHoldingFilterList
* @apiVersion 1.0.0
* @apiGroup  Holding
* @apiPermission appUser
*
* @apiDescription This api will be used to get all Holding filter list. 
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
*  
* @apiExample Example usage:
* curl -i http://baseurl/v1/holding/holdings/holdingfilters

* @apiSuccess {Number}     id                      Holding Filter Id.
* @apiSuccess {String}     name                    Holding Filter Name.

* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
* [{
*   "id": 1,
*   "name": "Holdings Not in model"
*  }]
* 
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header"
*     }
*/

app.get('/holdingfilters', function (req, res) {
    logger.info("Get all Portfolio Status request received");
    var data = req.data;
    holdingService.getHoldingFilters(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

/**
 * @api {get} /holding/holdings/{:id}  Get Holding Detail
 * @apiName GetHoldingDetail
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get holding detail   
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/holding/holdings/1

 * @apiSuccess {Number}     id                      Holding Id.
 * @apiSuccess {String}     securityName            Security name.
 * @apiSuccess {String}     securitySymbol          Security symbol.
 * @apiSuccess {String}     accountName             Account name assocaited with holding.
 * @apiSuccess {String}     accountNumber           Account number assocaited with holding.
 * @apiSuccess {String}     portfolioName           Portfolio name assocaited with account.
 * @apiSuccess {Number}     price                   Price of holding.
 * @apiSuccess {Number}     shares                  Shares.
 * @apiSuccess {Number}     value                   Holding value.
 * @apiSuccess {Number}     currentInPer            Current holding percentage.
 * @apiSuccess {Number}     targetInPer             Target holding percentage.
 * @apiSuccess {Number}     pendingValue            Pending value.
 * @apiSuccess {Number}     pendingInPer            Pending percentage.
 * @apiSuccess {String}     excluded                Holding excluded detail.
 * @apiSuccess {String}     isCash                  IsCash detail. 
 * @apiSuccess {String}     inModel                 Holding "inModel"" detail. 
 * @apiSuccess {JSON}       GLSection               Gain-Loss Summary.
 * @apiSuccess {Number}     -totalGainLoss          Total Gain Loss Detail.
 * @apiSuccess {String}     -totalGainLossStatus    Total Gain Loss status.(+/-)
 * @apiSuccess {Number}     -shortTermGL            Short Term gain loss detail.
 * @apiSuccess {String}     -shortTermGLStatus      Short Term Gain Loss status.(+/-).
 * @apiSuccess {Number}     -longTermGL             Long Term gain loss detail.
 * @apiSuccess {String}     -longTermGLStatus       Long Term Gain Loss status.(+/-).
 * @apiSuccess {Boolean}    isDeleted               Holding exist or not into the system.
 * @apiSuccess {Date}       createdOn               Holding creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Holding into the system.
 * @apiSuccess {Date}       editedOn                Holding edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Holding details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 * {
 *   "id": 1,
 *   "securityName": "Sprint Corporation",
 *   "securitySymbol": "S",
 *   "accountName": "Kane, Jr.  Fredric",
 *   "accountNumber": "L05C900669",
 *   "portfolioName": "Demo Portfolio",
 *   "price": 10,
 *   "shares": 23,
 *   "value": 230,
 *   "currentInPer": 5,
 *   "targetInPer": 10,
 *   "pendingValue": 2500,
 *   "excluded": "Yes",
 *   "isCash": "Yes",
 *   "inModel": "No",
 *   "GLSection": {
 *     "totalGainLoss": 5000,
 *     "totalGainLossStatus": "High",
 *     "shortTermGL": 12,
 *     "shortTermGLStatus": "LOw",
 *     "longTermGL": 13,
 *     "longTermGLStatus": "High"
 *   },
 *   "isDeleted": 0,
 *   "createdOn": "2016-07-14T03:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-07-14T03:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 * }
 * 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 */

app.get('/:id', validate({ params: holdingIdSchema }), UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get holding details request received");

    var data = req.data;
    data.id = req.params.id;
    holdingService.getHoldingDetail(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /holding/holdings/{:id}/transactions  Get Holding Transaction Detail
 * @apiName HoldingTransactionsDetail
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get holding transaction detail   
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/holding/holdings/1/transactions

 * @apiSuccess {Number}     id                     Transactions Id.
 * @apiSuccess {Date}       date                   Transactions date.
 * @apiSuccess {String}     type                   Transactions type.
 * @apiSuccess {Number}     amount                 Transactions amount.
 * @apiSuccess {Number}     units                  Units.
 * @apiSuccess {Number}     cost                   Cost.
 * @apiSuccess {Number}     price                  Price.
 * @apiSuccess {Boolean}    isDeleted              Transactions exist or not into the system.
 * @apiSuccess {Date}       createdOn              Transactions creation date into application.
 * @apiSuccess {String}     createdBy              Id of user who created the Transactions into the system.
 * @apiSuccess {Date}       editedOn               Transactions edited date into application.
 * @apiSuccess {String}     editedBy               Id of user who edited the Transactions details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 *[
 * {
 *   "id": 1,
 *   "date": "2016-01-01T18:30:00.000Z",
 *   "type": "Sell Exchange",
 *   "amount": 10,
 *   "units": 3,
 *   "cost": 0.01,
 *   "price": 10,
 *   "isDeleted": 0,
 *   "createdOn": "2016-01-01T18:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-01-01T18:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 * },
 * {
 *   "id": 2,
 *   "date": "2016-01-01T18:30:00.000Z",
 *   "type": "Client Contribution",
 *   "amount": 10,
 *   "units": 10,
 *   "cost": 0,
 *   "price": 20,
 *   "isDeleted": 0,
 *   "createdOn":"2016-01-01T18:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-01-01T18:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 * }
 * ]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 */

app.get('/:id/transactions', validate({ params: holdingIdSchema }), UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get holding details request received");

    var data = req.data;
    data.id = req.params.id;
    holdingService.getHoldingTransactions(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /holding/holdings/{:id}/taxlots  Get Taxlot Detail
 * @apiName HoldingTaxlotDetail
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get holding taxlot detail   
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/holding/holdings/1/taxlots

 * @apiSuccess {Number}     id                     Taxlot Id.
 * @apiSuccess {Date}       dateAcquired           Date acquired detail.
 * @apiSuccess {Number}     quantity               Quantity detail.
 * @apiSuccess {Number}     costAmount             Cost amount.
 * @apiSuccess {Number}     costPerShare           Cost per share.
 * @apiSuccess {JSON}       GLSection               Gain-Loss Summary.
 * @apiSuccess {Number}     -totalGainLoss          Total Gain Loss Detail.
 * @apiSuccess {String}     -totalGainLossStatus    Total Gain Loss status.(+/-)
 * @apiSuccess {Number}     -shortTermGL            Short Term gain loss detail.
 * @apiSuccess {String}     -shortTermGLStatus      Short Term Gain Loss status.(+/-).
 * @apiSuccess {Number}     -longTermGL             Long Term gain loss detail.
 * @apiSuccess {String}     -longTermGLStatus       Long Term Gain Loss status.(+/-).
 * @apiSuccess {Boolean}    isDeleted              Taxlot exist or not into the system.
 * @apiSuccess {Date}       createdOn              Taxlot creation date into application.
 * @apiSuccess {String}     createdBy              Id of user who created the Taxlot into the system.
 * @apiSuccess {Date}       editedOn               Taxlot edited date into application.
 * @apiSuccess {String}     editedBy               Id of user who edited the Taxlot details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 *[
 * {
 *   "id": 1,
 *   "dateAcquired": "2016-08-09T06:40:38.000Z",
 *   "quantity": 250,
 *   "costAmount": 24,
 *   "costPerShare": 22,
 *   "GLSection": {
 *     "totalGainLoss": -244,
 *     "totalGainLossStatus": "Low",
 *     "shortTermGL": 0,
 *     "shortTermGLStatus": null,
 *     "longTermGL": 278,
 *     "longTermGLStatus": "High"
 *   },
 *   "isDeleted": 0,
 *   "createdOn": "2016-08-26T06:41:42.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-08-26T06:41:47.000Z",
 *   "editedBy": "Test@gmail.com"
 * },
 * {
 *   "id": 2,
 *   "dateAcquired": "2015-08-09T06:40:38.000Z",
 *   "quantity": 250,
 *   "costAmount": 23,
 *   "costPerShare": 22,
 *   "GLSection": {
 *     "totalGainLoss": -244,
 *     "totalGainLossStatus": "Low",
 *     "shortTermGL": -822,
 *     "shortTermGLStatus": "Low",
 *     "longTermGL": 0,
 *     "longTermGLStatus": null
 *   },
 *   "isDeleted": 0,
 *   "createdOn": "2016-08-26T06:41:42.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-08-26T06:41:47.000Z",
 *   "editedBy": "Test@gmail.com"
 * }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 */

app.get('/:id/taxlots', validate({ params: holdingIdSchema }), UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get holding details request received");

    var data = req.data;
    data.id = req.params.id;
    holdingService.getHoldingTaxlots(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


module.exports = app;
