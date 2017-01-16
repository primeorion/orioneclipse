"use strict";

var app = require("express")();
var util = require('util');
var moduleName = __filename;
var helper = require('helper');

var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');

var PortfolioRequest = require("model/portfolio/PortfolioRequest.js");
var PortfolioService = require('service/portfolio/PortfolioService.js');
var portfolioService = new PortfolioService();
var modelService = require('service/model/ModelService.js');
var HoldingService = require('service/holding/HoldingService.js');
var holdingService = new HoldingService();
var PortfolioToleranceService = require('service/portfolio/PortfolioToleranceService.js');
var portfolioToleranceService = new PortfolioToleranceService();

var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js").getDifferentAccessForUser;
var analysisMiddleware = require('middleware/AnalysisMiddleware.js')

var validate = helper.validate;

var portfolioIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}

var deletePortfolioIdSchema = {
    type: 'object',
    properties: {
        ids: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: true
        },
    }
}

var postPortfolioSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        modelId: {
            type: ['number', null]
        },
        isSleevePortfolio: {
            enum: [0, 1, true, false, null]
        },
        doNotTrade: {
            enum: [0, 1, true, false, null]
        },
        tags: {
            type: ['string', null]
        },
        teamIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: true
        },
        primaryTeamId: {
            type: 'number',
            required: true
        }
    }
};

var portfolioSummarySchema = {
    type: 'object',
    properties: {
        accountIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: true
        }
    }
}

var accountIdsSchema = {
    type: 'object',
    properties: {
        accountIds: {
            type: 'array',
            items: {
                type: 'number'
            }
        }
    }
}

/** @api {get} /portfolio/portfolios/simple?search={id/name/tags} Search Portfolios(Simple)
 * @apiName SearchSimplePortfolios
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API search simple Portfolios. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?search=1 
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     source              Portfolio created by team/advisor.
 * @apiSuccess {Number}     modelId             Associated Model Id.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
          {
            "id": 1,
            "name": "Test Portfolio",
            "source": "Advisor",
            "modelId": 1,
            "sleevePortfolio": 0,
            "isDeleted": 0,
            "createdOn": "2016-06-17T05:57:22.000Z",
            "createdBy": 0,
            "editedOn": "2016-06-17T05:57:22.000Z",
            "editedBy": 0
          }
        ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
/** @api {get} /portfolio/portfolios/simple Get list of all Portfolios(Simple) 
 * @apiName GetSimplePortfolioList
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Portfolios(Simple). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/simple
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     source              Portfolio created by team/advisor.
 * @apiSuccess {Number}     modelId             Associated Model Id.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
          {
            "id": 1,
            "name": "Test Portfolio",
            "source": "Advisor",
            "modelId": 1,
            "sleevePortfolio": 0,
            "isDeleted": 0,
            "createdOn": "2016-06-17T05:57:22.000Z",
            "createdBy": 0,
            "editedOn": "2016-06-17T05:57:22.000Z",
            "editedBy": 0
          }
        ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
/** @api {get} /portfolio/portfolios/simple?inSleeve={true/false}&search={id/name/tags} Search Sleeved/Non-Sleeved Portfolios(Simple)
 * @apiName SearchSleevedOrNonSleevedPortfolios
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API search simple Sleeved/Non-Sleeved Portfolios. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?inSleeve=true&search=1 
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?inSleeve=false&search=1 
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     source              Portfolio created by team/advisor.
 * @apiSuccess {Number}     modelId             Associated Model Id.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
          {
            "id": 1,
            "name": "Test Portfolio",
            "source": "Advisor",
            "modelId": 1,
            "sleevePortfolio": 0,
            "isDeleted": 0,
            "createdOn": "2016-06-17T05:57:22.000Z",
            "createdBy": 0,
            "editedOn": "2016-06-17T05:57:22.000Z",
            "editedBy": 0
          }
        ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
/** @api {get} /portfolio/portfolios/simple?inSleeve={true/false} Get list of all Sleeved/Non-Sleeved Portfolios(Simple) 
 * @apiName GetSleevedOrNonSleevedPortfolioList
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Sleeved/Non-Sleeved Portfolios(Simple). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?inSleeve=true
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?inSleeve=false
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     source              Portfolio created by team/advisor.
 * @apiSuccess {Number}     modelId             Associated Model Id.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
          {
            "id": 1,
            "name": "Test Portfolio",
            "source": "Advisor",
            "modelId": 1,
            "sleevePortfolio": 0,
            "isDeleted": 0,
            "createdOn": "2016-06-17T05:57:22.000Z",
            "createdBy": 0,
            "editedOn": "2016-06-17T05:57:22.000Z",
            "editedBy": 0
          }
        ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
/** @api {get} /portfolio/portfolios/simple?includevalue=true Get & Search Portfolio List With Holding Value  
 * @apiName GetPortfolioListWithHoldingValue  
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Portfolios(Simple). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?includevalue=true
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?includevalue=true&search=1
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     source              Source Name.
 * @apiSuccess {Number}     value               Holding value associated with Portfolio.
 * @apiSuccess {String}     accountId           The account Id.
 * @apiSuccess {String}     accountNumber       Account Number.
 * @apiSuccess {String}     accountName         Account Name.
 * @apiSuccess {Number}     modelId             Associated Model Id.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {
 *           "id": 1,
 *           "name": "Test Portfolio",
 *           "source": "Team",
 *           "value": 38500,
 *           "accountId": null,
 *           "accountNumber": null,
 *           "accountName": null,
 *           "modelId": 1,
 *           "sleevePortfolio": 0,
 *           "isDeleted": 0,
 *           "createdOn": "2016-06-17T05:57:22.000Z",
 *           "createdBy": 0,
 *           "editedOn": "2016-06-17T05:57:22.000Z",
 *           "editedBy": 0
 *         }
 *       ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
/** @api {get} /portfolio/portfolios/simple?includevalue=true&searchAccounts=true Search Portfolios(Simple) by Account numbers With Holding Value 
 * @apiName GetPortfolioListWithSearchByAccountNumbers
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API searches Portfolios(Simple) list of all Portfolios(Simple). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?includevalue=true&searchAccounts=true
 * curl -i http://baseurl/v1/portfolio/portfolios/simple?includevalue=true&searchAccounts=true&search=1
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     source              Source Name.
 * @apiSuccess {Number}     value               Holding value associated with Portfolio.
 * @apiSuccess {String}     accountId           The account Id.
 * @apiSuccess {String}     accountNumber       Account Number.
 * @apiSuccess {String}     accountName         Account Name.
 * @apiSuccess {Number}     modelId             Associated Model Id.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {
 *           "id": 1,
 *           "name": "Test Portfolio",
 *           "source": "Team",
 *           "value": 38500,
 *           "accountId": "1022_12",
 *           "accountNumber": "L0704C0669",
 *           "accountName": "Test Account",
 *           "modelId": 1,
 *           "sleevePortfolio": 0,
 *           "isDeleted": 0,
 *           "createdOn": "2016-06-17T05:57:22.000Z",
 *           "createdBy": 0,
 *           "editedOn": "2016-06-17T05:57:22.000Z",
 *           "editedBy": 0
 *         }
 *       ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/simple', UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get all simple portfolios request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    if (req.query.includevalue) {
        data.includevalue = req.query.includevalue;
    }
    if (req.query.searchAccounts) {
        data.searchAccounts = req.query.searchAccounts;
    }
    if (req.query && req.query.hasOwnProperty('inSleeve')) {
        data.isSleeved = req.query.inSleeve;
    }
    if (req.query.isDeleted) {
        data.isDeleted = req.query.isDeleted;
    }
    portfolioService.getSimplePortfolioList(data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

/** @api {get} /portfolio/portfolios/Simple/:id Get simple Portfolio by id
 * @apiName  GetSimplePortfolioById
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets simple Portfolio by id. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/simple/1
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     model               Model assigned to Portfolio.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     team                Primary Team of Portfolio.
 * @apiSuccess {Number}     managedValue        Portfolio value managed by user.
 * @apiSuccess {Number}     excludedValue       Portfolio value not managed by current user.
 * @apiSuccess {Number}     cashReserve         Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     cash                Cash (held by Portfolio) managed by user(value in $).
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "id": 1,
            "name": "Demo Portfolio",
            "model": "Demo Model",
            "sleevePortfolio": 1,
            "team": "1022 team1",
            "managedValue": 0,
            "excludedValue": 0,
            "cashReserve": 48,
            "cash": 0,
            "isDeleted": 0,
            "createdOn": "2016-08-30T10:33:19.000Z",
            "createdBy": 66,
            "editedOn": "2016-09-27T13:25:43.000Z",
            "editedBy": 66
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

app.get('/simple/:id', validate({ params: portfolioIdSchema }), UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get all simple portfolios request received");
    var data = req.data;
    data.id = req.params.id;
    portfolioService.getList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/portfolioFilters Get list of all Portfolios Filters
 * @apiName GetPortfolioFilters
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Portfolios Status. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/portfolioFilters
 * 
 * @apiSuccess {Number}     id                      The Portfolio id.
 * @apiSuccess {String}     filter                  The Portfolio Filter.
 * @apiSuccess {String}     priority                Priority of filter.
 * @apiSuccess {String}     actionText              Filter action Text.
 * @apiSuccess {String}     portfolioStatusValue    The Portfolio Status Value.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
         {
            "id": 1,
            "filter": "Out of Tolerance",
            "priority": 50,
            "actionText": "Assign Model",
            "portfolioStatusValue": "getCategoryNoModelForPortfolio"
         }
       ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/portfolioFilters', function (req, res) {
    logger.info("Get all Portfolio Status request received");
    var data = req.data;
    portfolioService.getStatus(data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

/** @apiIgnore Not in use
 * @api {get} /portfolio/portfolios?search={id/name} Search Portfolios 
 * @apiName SearchPortfolios
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API search Portfolios. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios?search=1
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     model               Model assigned to Portfolio.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     team                Primary Team of Portfolio.
 * @apiSuccess {Number}     managedValue        Portfolio value managed by user.
 * @apiSuccess {Number}     excludedValue       Portfolio value not managed by current user.
 * @apiSuccess {Number}     totalValue          Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {String}     action              Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).
 * @apiSuccess {Boolean}    tradesPending       True/False – Whether trades are pending on this Portfolio.
 * @apiSuccess {Number}     percentDeviations   Percent Deviations of the Portfolio.
 * @apiSuccess {Number}     cashReserve         Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     cashNeed            Cash needed (in %) to maintain reserves.
 * @apiSuccess {Number}     cash                Cash (held by Portfolio) managed by user(value in $).
 * @apiSuccess {Number}     cashPercent         Cash (held by Portfolio) managed by user(value in %).
 * @apiSuccess {Number}     minCash             Minimum Cash to be held in Portfolio (from Preferences) – value in $.
 * @apiSuccess {Number}     minCashPercent      Minimum Cash to be held in Portfolio (from Preferences) – value in %.
 * @apiSuccess {Number}     totalCash           Sum of Cash reserve and Cash $.
 * @apiSuccess {Number}     totalCashPercent    Total cash held by Portfolio in terms of %.
 * @apiSuccess {Date}       autoRebalanceDate   Next Auto Rebalance date.
 * @apiSuccess {Boolean}    OUB                 True/False – Whether Portfolio is currently Out of Balance.
 * @apiSuccess {Number}     contribution        Portfolio contribution.
 * @apiSuccess {Boolean}    tradeBlocked        True/False – Whether trades are blocked on this Portfolio.
 * @apiSuccess {String}     status              Will contain an icon for [Ok,Warning,Error]
 * @apiSuccess {Boolean}    TLH                 True/False – Tax loss harvesting.
 * @apiSuccess {String}     style               Style (from the assigned model).
 * @apiSuccess {Date}       lastRebalancedOn    Last Rebalanced Date.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
        {
        "id" : 1,
        "name" : "Test Portfolio",
        "model" : "aggressive",
        "team" : "Team-One" ,
        "managedValue" : 100000,
        "excludedValue" : 90000,
        "totalValue" : 190000,
        "action" : "Rebalance",
        "tradesPending" : true,
        "percentDeviations": 5,
        "cashReserve": 1000,
        "cashNeed": 8,
        "cash": 10000,
        "cashPercent": 10,
        "minCash": 1000,
        "minCashPercent": 10,
        "totalCash": 11000,
        "totalCashPercent": 30,
        "autoRebalanceDate": "0000-00-00",
        "OUB": true,
        "contribution": 1000,
        "tradeBlocked": true,
        "status": "ok",
        "TLH": true,
        "style": "style",
        "lastRebalancedOn": "0000-00-00",
        "isDeleted": 0,
        "createdOn": "0000-00-00 00:00:00",
        "createdBy": "ETL ETL",
        "editedOn": "0000-00-00 00:00:00",
        "editedBy": "ETL ETL"
        }
       ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
/** @api {get} /portfolio/portfolios?householdIds={Household_Id} Get list of all Portfolios by HouseholdIds 
 * @apiName  PortfoliosListOnHousehold
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Portfolios by HouseholdIds. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios?householdIds=1
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     model               Model assigned to Portfolio.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     team                Primary Team of Portfolio.
 * @apiSuccess {Number}     managedValue        Portfolio value managed by user.
 * @apiSuccess {Number}     excludedValue       Portfolio value not managed by current user.
 * @apiSuccess {Number}     cashReserve         Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     cash                Cash (held by Portfolio) managed by user(value in $).
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [ {
            "id": 1,
            "name": "Demo Portfolio",
            "model": "Demo Model",
            "sleevePortfolio": 1,
            "team": "1022 team1",
            "managedValue": 0,
            "excludedValue": 0,
            "cashReserve": 48,
            "cash": 0,
            "isDeleted": 0,
            "createdOn": "2016-08-30T10:33:19.000Z",
            "createdBy": 66,
            "editedOn": "2016-09-27T13:25:43.000Z",
            "editedBy": 66
        } ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
/** @api {get} /portfolio/portfolios?filter={Portfolio_Filter_Id} Get list of all Portfolios by filter  
 * @apiName PortfoliosListOnPortfolioFilter
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Portfolios by filter. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios?filter=1
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     model               Model assigned to Portfolio.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     team                Primary Team of Portfolio.
 * @apiSuccess {Number}     managedValue        Portfolio value managed by user.
 * @apiSuccess {Number}     excludedValue       Portfolio value not managed by current user.
 * @apiSuccess {Number}     totalValue          Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {String}     action              Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).
 * @apiSuccess {Boolean}    tradesPending       True/False – Whether trades are pending on this Portfolio.
 * @apiSuccess {Number}     percentDeviations   Percent Deviations of the Portfolio.
 * @apiSuccess {Number}     cashReserve         Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     cashNeed            Cash needed (in %) to maintain reserves.
 * @apiSuccess {Number}     cash                Cash (held by Portfolio) managed by user(value in $).
 * @apiSuccess {Number}     cashPercent         Cash (held by Portfolio) managed by user(value in %).
 * @apiSuccess {Number}     minCash             Minimum Cash to be held in Portfolio (from Preferences) – value in $.
 * @apiSuccess {Number}     minCashPercent      Minimum Cash to be held in Portfolio (from Preferences) – value in %.
 * @apiSuccess {Number}     totalCash           Sum of Cash reserve and Cash $.
 * @apiSuccess {Number}     totalCashPercent    Total cash held by Portfolio in terms of %.
 * @apiSuccess {Date}       autoRebalanceDate   Next Auto Rebalance date.
 * @apiSuccess {Boolean}    OUB                 True/False – Whether Portfolio is currently Out of Balance.
 * @apiSuccess {Number}     contribution        Portfolio contribution.
 * @apiSuccess {Boolean}    tradeBlocked        True/False – Whether trades are blocked on this Portfolio.
 * @apiSuccess {String}     status              will contain an icon for [Ok,Warning,Error]
 * @apiSuccess {String}     statusInfo          Status information for user.
 * @apiSuccess {Boolean}    TLH                 True/False – Tax loss harvesting.
 * @apiSuccess {String}     style               Style (from the assigned model).
 * @apiSuccess {Date}       lastRebalancedOn    Last Rebalanced Date.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
        {
        "id" : 1,
        "name" : "Test Portfolio",
        "model" : "aggressive",
        "team" : "Team-One" ,
        "managedValue" : 100000,
        "excludedValue" : 90000,
        "totalValue" : 190000,
        "action" : "Rebalance",
        "tradesPending" : true,
        "percentDeviations": 5,
        "cashReserve": 1000,
        "cashNeed": 8,
        "cash": 10000,
        "cashPercent": 10,
        "minCash": 1000,
        "minCashPercent": 10,
        "totalCash": 11000,
        "totalCashPercent": 30,
        "autoRebalanceDate": "0000-00-00",
        "OUB": true,
        "contribution": 1000,
        "tradeBlocked": true,
        "status": "ok",
        "statusInfo": "Status Info",
        "TLH": true,
        "style": "style",
        "lastRebalancedOn": "0000-00-00",
        "isDeleted": 0,
        "createdOn": "0000-00-00 00:00:00",
        "createdBy": "ETL ETL",
        "editedOn": "0000-00-00 00:00:00",
        "editedBy": "ETL ETL"
        }
       ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
/** @api {get} /portfolio/portfolios Get list of all Portfolios 
 * @apiName GetAllPortfolios
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Portfolios. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     model               Model assigned to Portfolio.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     team                Primary Team of Portfolio.
 * @apiSuccess {Number}     managedValue        Portfolio value managed by user.
 * @apiSuccess {Number}     excludedValue       Portfolio value not managed by current user.
 * @apiSuccess {Number}     totalValue          Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {String}     action              Actions needed on Portfolio (Rebalance, TLH, Cash Needs etc).
 * @apiSuccess {Boolean}    tradesPending       True/False – Whether trades are pending on this Portfolio.
 * @apiSuccess {Number}     percentDeviations   Percent Deviations of the Portfolio.
 * @apiSuccess {Number}     cashReserve         Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     cashNeed            Cash needed (in %) to maintain reserves.
 * @apiSuccess {Number}     cash                Cash (held by Portfolio) managed by user(value in $).
 * @apiSuccess {Number}     cashPercent         Cash (held by Portfolio) managed by user(value in %).
 * @apiSuccess {Number}     minCash             Minimum Cash to be held in Portfolio (from Preferences) – value in $.
 * @apiSuccess {Number}     minCashPercent      Minimum Cash to be held in Portfolio (from Preferences) – value in %.
 * @apiSuccess {Number}     totalCash           Sum of Cash reserve and Cash $.
 * @apiSuccess {Number}     totalCashPercent    Total cash held by Portfolio in terms of %.
 * @apiSuccess {Date}       autoRebalanceDate   Next Auto Rebalance date.
 * @apiSuccess {Boolean}    OUB                 True/False – Whether Portfolio is currently Out of Balance.
 * @apiSuccess {Number}     contribution        Portfolio contribution.
 * @apiSuccess {Boolean}    tradeBlocked        True/False – Whether trades are blocked on this Portfolio.
 * @apiSuccess {String}     status              will contain an icon for [Ok,Warning,Error]
 * @apiSuccess {String}     statusInfo          Status information for user.
 * @apiSuccess {Boolean}    TLH                 True/False – Tax loss harvesting.
 * @apiSuccess {String}     style               Style (from the assigned model).
 * @apiSuccess {Date}       lastRebalancedOn    Last Rebalanced Date.
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
        {
        "id" : 1,
        "name" : "Test Portfolio",
        "model" : "aggressive",
        "team" : "Team-One" ,
        "managedValue" : 100000,
        "excludedValue" : 90000,
        "totalValue" : 190000,
        "action" : "Rebalance",
        "tradesPending" : true,
        "percentDeviations": 5,
        "cashReserve": 1000,
        "cashNeed": 8,
        "cash": 10000,
        "cashPercent": 10,
        "minCash": 1000,
        "minCashPercent": 10,
        "totalCash": 11000,
        "totalCashPercent": 30,
        "autoRebalanceDate": "0000-00-00",
        "OUB": true,
        "contribution": 1000,
        "tradeBlocked": true,
        "status": "ok",
        "statusInfo": "Status Info",
        "TLH": true,
        "style": "style",
        "lastRebalancedOn": "0000-00-00",
        "isDeleted": 0,
        "createdOn": "0000-00-00 00:00:00",
        "createdBy": "ETL ETL",
        "editedOn": "0000-00-00 00:00:00",
        "editedBy": "ETL ETL"
        }
       ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/', function (req, res) {
    logger.info("Get all portfolios request received");
    var data = req.data;
    data.newPortfolios = 0;
    if (req.query.search) {
        data.search = req.query.search;
    }
    if (req.query.householdIds) {
        data.householdIds = req.query.householdIds;
    }
    if (req.query.filter) {
        data.filter = req.query.filter;
    }

    portfolioService.getList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/new Get list of all new Portfolios
 * @apiName  GetListOfAllNewPortfolios
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all new Portfolios. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/new
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {String}     name                Name of the Portfolio.
 * @apiSuccess {String}     model               Model assigned to Portfolio.
 * @apiSuccess {Boolean}    sleevePortfolio     True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     team                Primary Team of Portfolio.
 * @apiSuccess {Number}     managedValue        Portfolio value managed by user.
 * @apiSuccess {Number}     excludedValue       Portfolio value not managed by current user.
 * @apiSuccess {Number}     cashReserve         Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     cash                Cash (held by Portfolio) managed by user(value in $).
 * @apiSuccess {Boolean}    isDeleted           Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn           Portfolio creation date into application.
 * @apiSuccess {String}     createdBy           Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn            Portfolio edited date into application.
 * @apiSuccess {String}     editedBy            Id of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [ {
            "id": 1,
            "name": "Demo Portfolio",
            "model": "Demo Model",
            "sleevePortfolio": 1,
            "team": "1022 team1",
            "managedValue": 0,
            "excludedValue": 0,
            "cashReserve": 48,
            "cash": 0,
            "isDeleted": 0,
            "createdOn": "2016-08-30T10:33:19.000Z",
            "createdBy": 66,
            "editedOn": "2016-09-27T13:25:43.000Z",
            "editedBy": 66
        } ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/new', function (req, res) {
    logger.info("Get all newly created portfolios request received");
    var data = req.data;

    data.newPortfolios = 1;
    portfolioService.getList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/:id Get Portfolio Details
 * @apiName  PortfolioDetails.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets Portfolio Details. 
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
 * curl -i http://baseurl/v1/portfolio/portfolios/13
 * 
 * @apiSuccess {Number}     id                      The Portfolio id.
 * @apiSuccess {JSON}       general                 General information of the Portfolio.
 * @apiSuccess {String}     -portfolioName          Name of the Portfolio.
 * @apiSuccess {Boolean}    -sleevePortfolio        True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     -custodialAccountNumber Custodial Account Number.
 * @apiSuccess {String}     -registrationId         Registration Id.
 * @apiSuccess {String}     -sleeveStrategy         Sleeve Strategy.
 * @apiSuccess {String}     -contributionMethod     Contribution Method.
 * @apiSuccess {String}     -distributionMethod     Distribution Method.
 * @apiSuccess {Number}     -modelId                Model Id.
 * @apiSuccess {String}     -modelName              Name of Model.
 * @apiSuccess {String}     -autoRebalance          Auto Rebalance option - None/Annual/Semi-Annual/Quarterly/Monthly.
 * @apiSuccess {Date}       -monthAndDate           Auto Rebalance Month & Date.
 * @apiSuccess {Boolean}    -doNotTrade             Do not trade Portfolio - 0/1(true/false).
 * @apiSuccess {String}     -tags                   Portfolio tags.
 * @apiSuccess {Array}      teams                   Teams of the Portfolio.
 * @apiSuccess {Number}     -id                     Team Id.
 * @apiSuccess {String}     -name                   Team Name.
 * @apiSuccess {Boolean}    -isPrimary              True/False – Team is Primary.
 * @apiSuccess {Boolean}    -portfolioAccess        True/False – Team has limited Portfolio Access.
 * @apiSuccess {JSON}       issues                  Issues In Portfolio.
 * @apiSuccess {Number}     -outOfTolerance         Out of Tolerance of Portfolio - in Percentage.
 * @apiSuccess {Number}     -cashNeed               Portfolio's cash need amount.
 * @apiSuccess {Boolean}    -setForAutoRebalance    True/False – Whether the Portfolio is set for Auto rebalance.
 * @apiSuccess {Number}     -contribution           Portfolio's contribution amount.
 * @apiSuccess {Number}     -distribution           Portfolio's distribution amount.
 * @apiSuccess {Boolean}    -modelAssociation       True/False – Whether the model is associated with Portfolio.
 * @apiSuccess {Boolean}    -doNotTrade             True/False – Whether the Portfolio is blocked from being traded.
 * @apiSuccess {Boolean}    -TLHOpportunity         True/False – Whether the Portfolio has TLH Opportunity.
 * @apiSuccess {Number}     -dataErrors             Count of import errors (if any).
 * @apiSuccess {Number}     -pendingTrades          Number of pending trades under Portfolio.
 * @apiSuccess {JSON}       summary                 Portfolio summary.
 * @apiSuccess {Date}       -analyticsOn            Analytics Date.
 * @apiSuccess {JSON}       -AUM                    Portfolio's AUM(Assets Under Management) information.
 * @apiSuccess {Number}     --total                 Portfolio AUM total (totalValue + totalCash).
 * @apiSuccess {Number}     --totalValue            Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {Number}     --managedValue          Portfolio value managed by user.
 * @apiSuccess {Number}     --excludedValue         Portfolio value not managed by current user.
 * @apiSuccess {JSON}       --totalCash             Total Portfolio cash information.
 * @apiSuccess {Number}     ---total                Total Portfolio cash (cash + reserve + setAsideCash).
 * @apiSuccess {Number}     ---reserve              Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     ---cash                 Cash (held by Portfolio) managed by user.
 * @apiSuccess {Number}     ---setAsideCash         Portfolio's aside cash.
 * @apiSuccess {JSON}       -realized               Realized Portfolio information.
 * @apiSuccess {Number}     --total                 Realized total value (shortTerm + longTerm).
 * @apiSuccess {String}     --totalStatus           Realized total value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Number}     --shortTerm             Realized short term value.
 * @apiSuccess {String}     --shortTermStatus       Realized short term value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Number}     --longTerm              Realized long term value.
 * @apiSuccess {String}     --longTermStatus        Realized long term value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Boolean}    isDeleted               Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn               Portfolio creation date into application.
 * @apiSuccess {String}     createdBy               Full Name of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn                Portfolio edited date into application.
 * @apiSuccess {String}     editedBy                Full Name of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       {
        "id":13,
        "general" : {
            "portfolioName" : "Demo Portfolio",
            "sleevePortfolio" : false,
            "custodialAccountNumber": 0,
            "registrationId": 0,
            "sleeveStrategy": "sleeveStrategy",
            "contributionMethod": "contributionMethod",
            "distributionMethod": "distributionMethod",
            "modelId" : 1,
            "modelName" : "My Model",
            "autoRebalance": 0,
            "monthAndDate": "2016-08-30",
            "doNotTrade": 0,
            "tags" : "test"
        },
        "teams" : [{
            "id" : 1,
            "name" : "Team-One",
            "isPrimary" : true,
            "portfolioAccess" : 1
            },{
            "id" : 2,
            "name" : "Team-Two",
            "isPrimary" : false,
            "portfolioAccess" : 1
            },{
            "id" : 5,
            "name" : "Team-Five",
            "isPrimary" : false,
            "portfolioAccess" : 1
        }],
        "issues" : {
            "outOfTolerance" : 12,
            "cashNeed" : 1200,
            "setForAutoRebalance" : true,
            "contribution" : 100,
            "distribution" : 4000,
            "modelAssociation" : true,
            "doNotTrade" : 0,
            "TLHOpportunity" : false,
            "dataErrors" : 15,
            "pendingTrades" : 7
        },
        "summary" : {
            "analyticsOn": "2016-08-30T06:19:20.000Z",
            "AUM" : {
                "total" : 4000,
                "totalValue" : 2250,
                "managedValue" : 1250,
                "excludedValue" : 1000,
                "totalCash" : {
                        "total" : 1750,
                        "reserve" : 1000,
                        "cash" : 500,
                        "setAsideCash" : 250
                    }
                },
            "realized" : {
                "total" : 400,
                "totalStatus": "high",
                "shortTerm" : 500,
                "shortTermStatus"  :"high",
                "longTerm" : 100,
                "longTermStatus"  :"low"
            }
        },
        "isDeleted": 0,
        "createdOn": "0000-00-00 00:00:00",
        "createdBy": "ETL ETL",
        "editedOn": "0000-00-00 00:00:00",
        "editedBy": "ETL ETL"
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
 * @apiError Not_Found When Portfolio does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Portfolio does not exist"
 *     }
 * 
 */
app.get('/:id', validate({ params: portfolioIdSchema }), function (req, res) {
    logger.info("Get Portfolio details request received");

    var data = req.data;
    data.id = req.params.id;

    portfolioService.getDetails(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/:id/accounts Get list of all Accounts of Portfolio
 * @apiName  GetAccountsList.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Accounts of Portfolio. 
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
 * curl -i http://baseurl/v1/portfolio/portfolios/13/accounts
 * 
 * @apiSuccess {Number}     id                          System Generated Id.
 * @apiSuccess {String}     accountId                   Account Id.
 * @apiSuccess {String}     name                        Account Name.
 * @apiSuccess {String}     accountNumber               Account Number.
 * @apiSuccess {String}     accountType                 Type of Account.
 * @apiSuccess {String}     model                       Assigned Model Name.
 * @apiSuccess {String}     managementStyle             Management Style - derived from assigned Model.
 * @apiSuccess {Number}     managedValue                Value managed by user.
 * @apiSuccess {Number}     excludedValue               Value not managed by current user.
 * @apiSuccess {Number}     totalValue                  Sum of values for all holdings.
 * @apiSuccess {Number}     pendingValue                ManagedValue +/- Enabled TradeOrders.
 * @apiSuccess {String}     sleeveType                  Account Sleeve Type.
 * @apiSuccess {Number}     sleeveTarget                Target percent for each sleeve.
 * @apiSuccess {Number}     sleeveContributionPercent   Contribution percent for each sleeve.
 * @apiSuccess {Number}     sleeveDistributionPercent   Distribution percent for each sleeve.
 * @apiSuccess {Number}     sleeveToleranceLower        Lower Tolerance level for each sleeve.
 * @apiSuccess {Number}     sleeveToleranceUpper        Upper Tolerance level for each sleeve.
 * @apiSuccess {String}     status                      Will contain an icon for [Ok,Warning,Error].
 * @apiSuccess {String}     statusInfo                  Status information for user.
 * @apiSuccess {Boolean}    isDeleted                   Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn                   Portfolio creation date into application.
 * @apiSuccess {String}     createdBy                   Id of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn                    Portfolio edited date into application.
 * @apiSuccess {String}     editedBy                    Id of user who edited the Portfolio details into the system.
 *  
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
      [{
            "id": 1,
            "accountId": 123,
            "name": "account1",
            "accountNumber": "L05C900669",
            "accountType": "IRC",
            "model": "Community Model 1",
            "managementStyle": "Aggressive",
            "managedValue": 10000,
            "excludedValue": 9000,
            "totalValue": 19000,
            "pendingValue": 1000,
            "sleeveType": "None",
            "sleeveTarget": 100,
            "sleeveContributionPercent": 1,
            "sleeveDistributionPercent": 1,
            "sleeveToleranceLower": 10,
            "sleeveToleranceUpper": 20,
            "status": "ok",
            "statusInfo": null,
            "isDeleted": 0,
            "createdOn": "2016-10-15T03:30:00.000Z",
            "createdBy": 66,
            "editedOn": "2016-10-18T04:54:53.000Z",
            "editedBy": 66
      }]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
app.get('/:id/accounts', validate({ params: portfolioIdSchema }), function (req, res) {
    logger.info("Get account list associated to Portfolio request received");

    var data = req.data;
    data.id = req.params.id;

    portfolioService.getAccountsList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/:id/accounts/simple Get list of all Accounts of Portfolio (Simple)
 * @apiName  GetAccountsListSimple.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Accounts (only id, orion accountId and  name) of Portfolio. 
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
 * curl -i http://baseurl/v1/portfolio/portfolios/13/accounts
 * 
 * @apiSuccess {Number}     id                          System Generated Id.
 * @apiSuccess {String}     accountId                   Account Id.
 * @apiSuccess {String}     name                        Account Name.
 *
 *  
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
      [{
            "id": 1,
            "accountId": 123,
            "name": "account1
      }]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
app.get('/:id/accounts/simple', validate({ params: portfolioIdSchema }), function (req, res) {
    logger.info("Get account list simple associated to Portfolio request received");

    var data = req.data;
    data.id = req.params.id;
    if (req.query.search) {
        data.search = req.query.search;
    }
    portfolioService.getAccountsListSimple(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @apiIgnore No more in use
 * @api {get} /portfolio/portfolios/:id/accounts/regular Get list of all Regular type Accounts of Portfolio
 * @apiName  GetRegularTypeAccountsList.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Regular type Accounts of Portfolio. 
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
 * curl -i http://baseurl/v1/portfolio/portfolios/13/accounts/regular
 * 
 * @apiSuccess {Number}     accountId       Account Id.
 * @apiSuccess {String}     accountName     Account Name.
 * @apiSuccess {String}     accountNumber   Account Number.
 * @apiSuccess {String}     accountType     Type of Account.
 * @apiSuccess {Number}     managedValue    Value managed by user.
 * @apiSuccess {Number}     excludedValue   Value not managed by current user.
 * @apiSuccess {Number}     totalValue      Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {Number}     pendingValue    ManagedValue +/- Enabled TradeOrders.
 * @apiSuccess {String}     status          Will contain an icon for [Ok,Warning,Error].
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
      [{
            "accountId": 123,
            "accountName": "account1",
            "accountNumber": "L05C900669",
            "accountType": "IRC",
            "managedValue": 10000,
            "excludedValue": 9000,
            "totalValue": 19000,
            "pendingValue": 1000,
            "status": "ok"
      }]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
/*
app.get('/:id/accounts/regular', validate({ params: portfolioIdSchema }), function (req, res) {
    logger.info("get account list associated to Portfolio request received");

    var data = req.data;
    data.id = req.params.id;
    data.regular = 1;

    portfolioService.getAccountsList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
*/

/**
 * @apiIgnore No more in use
 * @api {get} /portfolio/portfolios/:id/accounts/sma Get list of all SMA type Accounts of Portfolio
 * @apiName  GetSMATypeAccountsList.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all SMA type Accounts of Portfolio. 
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
 * curl -i http://baseurl/v1/portfolio/portfolios/13/accounts/sma
 * 
 * @apiSuccess {Number}     accountId       Account Id.
 * @apiSuccess {String}     accountName     Account Name.
 * @apiSuccess {String}     accountNumber   Account Number.
 * @apiSuccess {String}     accountType     Type of Account.
 * @apiSuccess {Number}     managedValue    Value managed by user.
 * @apiSuccess {Number}     excludedValue   Value not managed by current user.
 * @apiSuccess {Number}     totalValue      Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {Number}     pendingValue    ManagedValue +/- Enabled TradeOrders.
 * @apiSuccess {String}     status          Will contain an icon for [Ok,Warning,Error].
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
      [{
            "accountId": 123,
            "accountName": "account1",
            "accountNumber": "L05C900669",
            "accountType": "IRC",
            "managedValue": 10000,
            "excludedValue": 9000,
            "totalValue": 19000,
            "pendingValue": 1000,
            "status": "ok"
      }]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
/*
app.get('/:id/accounts/sma', validate({ params: portfolioIdSchema }), function (req, res) {
    logger.info("get account list associated to Portfolio request received");

    var data = req.data;
    data.id = req.params.id;
    data.sma = 1;

    portfolioService.getAccountsList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
*/

/**
 * @apiIgnore No more in use
 * @api {get} /portfolio/portfolios/:id/accounts/sleeved Get list of all Sleeved type Accounts of Portfolio
 * @apiName  GetSleevedTypeAccountsList.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets list of all Sleeved type Accounts of Portfolio. 
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
 * curl -i http://baseurl/v1/portfolio/portfolios/13/accounts/sleeved
 * 
 * @apiSuccess {String}     accountId                   Account Id.
 * @apiSuccess {String}     accountName                 Account Name.
 * @apiSuccess {String}     accountNumber               Account Number.
 * @apiSuccess {String}     accountType                 Type of Account.
 * @apiSuccess {String}     managedValue                Value managed by user.
 * @apiSuccess {String}     excludedValue               Value not managed by current user.
 * @apiSuccess {String}     totalValue                  Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {String}     pendingValue                ManagedValue +/- Enabled TradeOrders.
 * @apiSuccess {String}     sleeveType                  Account Sleeve Type.
 * @apiSuccess {String}     sleeveTarget                Target percent for each sleeve.
 * @apiSuccess {String}     sleeveContributionPercent   Contribution percent for each sleeve.
 * @apiSuccess {String}     sleeveDistributionPercent   Distribution percent for each sleeve.
 * @apiSuccess {String}     sleeveToleranceLower        Lower Tolerance level for each sleeve.
 * @apiSuccess {String}     sleeveToleranceUpper        Upper Tolerance level for each sleeve.
 * @apiSuccess {String}     status                      Will contain an icon for [Ok,Warning,Error].
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
      [{
            "accountId": 123,
            "accountName": "account1",
            "accountNumber": "L05C900669",
            "accountType": "IRC",
            "managedValue": 10000,
            "excludedValue": 9000,
            "totalValue": 19000,
            "pendingValue": 1000,
            "sleeveType": "None",
            "sleeveTarget": 100,
            "sleeveContributionPercent": 1,
            "sleeveDistributionPercent": 1,
            "sleeveToleranceLower": 10,
            "sleeveToleranceUpper": 20,
            "status": "ok"
      }]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
/*
app.get('/:id/accounts/sleeved', validate({ params: portfolioIdSchema }), function (req, res) {
    logger.info("get account list associated to Portfolio request received");

    var data = req.data;
    data.id = req.params.id;
    data.sleeved = 1;

    portfolioService.getSleevedAccountsList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
*/

/** @api {post} /portfolio/portfolios/:id/accounts Assign Portfolio to Accounts
 * @apiName  AssignPortfolioToAccounts.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API Assign Portfolio to Accounts. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {Array}        accountIds              Accounts ids.
 * @apiParamExample {json} Request-Example:
 *     {
         "accountIds" : [1120129,2324242]
       }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/13/accounts
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       {
         "message": "Portfolio assigned to accounts successfully"
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
app.post('/:id/accounts', validate({ params: portfolioIdSchema, body: portfolioSummarySchema }), UserTeamAccessMiddleWare, analysisMiddleware.post_import_analysis, function (req, res) {
    logger.info("Portfolio to account assigning request received");

    var data = new PortfolioRequest(req.data);
    data.id = req.params.id;

    portfolioService.assignPortfolioToAccounts(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /portfolio/portfolios/:id/accounts Un-Assign Portfolio from Accounts
 * @apiName  UnAssignPortfolioFromAccounts.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API Un-Assign Portfolio from Accounts. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {Array}        accountIds              Accounts ids.
 * @apiParamExample {json} Request-Example:
 *     {
         "accountIds" : [1,2]
       }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/1/accounts
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       {
         "message": "Portfolio un-assigned from accounts successfully"
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
/** @api {put} /portfolio/portfolios/:id/accounts Un-Assign Portfolio from all Accounts
 * @apiName  UnAssignPortfolioFromAllAccounts.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API Un-Assign Portfolio from Accounts. 
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
 * curl -i http://baseurl/v1/portfolio/portfolios/13/accounts
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       {
         "message": "Portfolio un-assigned from accounts successfully"
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
app.put('/:id/accounts', validate({ params: portfolioIdSchema, body: accountIdsSchema }), UserTeamAccessMiddleWare, analysisMiddleware.post_import_analysis, function (req, res) {
    logger.info("Portfolio from accounts Un-Assigning request received");

    var data = new PortfolioRequest(req.data);
    data.id = req.params.id;

    portfolioService.unAssignPortfolioFromAccounts(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/:id/accounts/summary Get count of Accounts with Portfolio
 * @apiName  GetAccountsCountOfPortfolio.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API gets count of Accounts with Portfolio
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
 * curl -i http://baseurl/v1/portfolio/portfolios/13/accounts/summary
 * 
 * @apiSuccess {Number}     count                      Total number of Accounts with Portfolio.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       {
         "count" : 2
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
app.get('/:id/accounts/summary', validate({ params: portfolioIdSchema }), function (req, res) {
    logger.info("Get Portfolio Accounts summary request received");

    var data = req.data;
    data.id = req.params.id;

    portfolioService.getPortfolioAccountsSummary(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {post} /portfolio/portfolios/ Add New Portfolio
 * @apiName  AddNewPortfolio.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API Adds New Portfolio. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {String}       name                Name of the Portfolio.
 * @apiParam {Number}       modelId             Model Id.
 * @apiParam {Boolean}      isSleevePortfolio   Sleeve Portfolio - 0/1(true/false).
 * @apiParam {Boolean}      doNotTrade          Do not trade Portfolio - 0/1(true/false).
 * @apiParam {String}       tags                Portfolio tags.
 * @apiParam {Array}        teamIds             Team ids of Portfolio.
 * @apiParam {Number}       primaryTeamId       Primary team id of Portfolio.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
         "name": "Demo Portfolio",
         "modelId": 1,
         "isSleevePortfolio" : false,
         "doNotTrade" : 0,
         "tags" : "test",
         "teamIds": [1,2,5],
         "primaryTeamId": 1
       }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/
 * 
 * @apiSuccess {Number}     id                      The Portfolio id.
 * @apiSuccess {JSON}       general                 General information of the Portfolio.
 * @apiSuccess {String}     -portfolioName          Name of the Portfolio.
 * @apiSuccess {Boolean}    -sleevePortfolio        True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     -custodialAccountNumber Custodial Account Number.
 * @apiSuccess {String}     -registrationId         Registration Id.
 * @apiSuccess {String}     -sleeveStrategy         Sleeve Strategy.
 * @apiSuccess {String}     -contributionMethod     Contribution Method.
 * @apiSuccess {String}     -distributionMethod     Distribution Method.
 * @apiSuccess {Number}     -modelId                Model Id.
 * @apiSuccess {String}     -modelName              Name of Model.
 * @apiSuccess {String}     -autoRebalance          Auto Rebalance option - None/Annual/Semi-Annual/Quarterly/Monthly.
 * @apiSuccess {Date}       -monthAndDate           Auto Rebalance Month & Date.
 * @apiSuccess {Boolean}    -doNotTrade             Do not trade Portfolio - 0/1(true/false).
 * @apiSuccess {String}     -tags                   Portfolio tags.
 * @apiSuccess {Array}      teams                   Teams of the Portfolio.
 * @apiSuccess {Number}     -id                     Team Id.
 * @apiSuccess {String}     -name                   Team Name.
 * @apiSuccess {Boolean}    -isPrimary              True/False – Team is Primary.
 * @apiSuccess {Boolean}    -portfolioAccess        True/False – Team has limited Portfolio Access.
 * @apiSuccess {JSON}       issues                  Issues In Portfolio.
 * @apiSuccess {Number}     -outOfTolerance         Out of Tolerance of Portfolio - in Percentage.
 * @apiSuccess {Number}     -cashNeed               Portfolio's cash need amount.
 * @apiSuccess {Boolean}    -setForAutoRebalance    True/False – Whether the Portfolio is set for Auto rebalance.
 * @apiSuccess {Number}     -contribution           Portfolio's contribution amount.
 * @apiSuccess {Number}     -distribution           Portfolio's distribution amount.
 * @apiSuccess {Boolean}    -modelAssociation       True/False – Whether the model is associated with Portfolio.
 * @apiSuccess {Boolean}    -doNotTrade             True/False – Whether the Portfolio is blocked from being traded.
 * @apiSuccess {Boolean}    -TLHOpportunity         True/False – Whether the Portfolio has TLH Opportunity.
 * @apiSuccess {Number}     -dataErrors             Count of import errors (if any).
 * @apiSuccess {Number}     -pendingTrades          Number of pending trades under Portfolio.
 * @apiSuccess {JSON}       summary                 Portfolio summary.
 * @apiSuccess {Date}       -analyticsOn            Analytics Date.
 * @apiSuccess {JSON}       -AUM                    Portfolio's AUM(Assets Under Management) information.
 * @apiSuccess {Number}     --total                 Portfolio AUM total (totalValue + totalCash).
 * @apiSuccess {Number}     --totalValue            Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {Number}     --managedValue          Portfolio value managed by user.
 * @apiSuccess {Number}     --excludedValue         Portfolio value not managed by current user.
 * @apiSuccess {JSON}       --totalCash             Total Portfolio cash information.
 * @apiSuccess {Number}     ---total                Total Portfolio cash (cash + reserve + setAsideCash).
 * @apiSuccess {Number}     ---reserve              Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     ---cash                 Cash (held by Portfolio) managed by user.
 * @apiSuccess {Number}     ---setAsideCash         Portfolio's aside cash.
 * @apiSuccess {JSON}       -realized               Realized Portfolio information.
 * @apiSuccess {Number}     --total                 Realized total value (shortTerm + longTerm).
 * @apiSuccess {String}     --totalStatus           Realized total value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Number}     --shortTerm             Realized short term value.
 * @apiSuccess {String}     --shortTermStatus       Realized short term value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Number}     --longTerm              Realized long term value.
 * @apiSuccess {String}     --longTermStatus        Realized long term value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Boolean}    isDeleted               Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn               Portfolio creation date into application.
 * @apiSuccess {String}     createdBy               Full Name of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn                Portfolio edited date into application.
 * @apiSuccess {String}     editedBy                Full Name of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 OK
       {
        "id":13,
        "general" : {
            "portfolioName" : "Demo Portfolio",
            "sleevePortfolio" : false,
            "custodialAccountNumber": 0,
            "registrationId": 0,
            "sleeveStrategy": "sleeveStrategy",
            "contributionMethod": "contributionMethod",
            "distributionMethod": "distributionMethod",
            "modelId" : 1,
            "modelName" : "My Model",
            "autoRebalance": 0,
            "monthAndDate": "2016-08-30",
            "doNotTrade": 0,
            "tags" : "test"
        },
        "teams" : [{
            "id" : 1,
            "name" : "Team-One",
            "isPrimary" : true,
            "portfolioAccess" : 0
            },{
            "id" : 2,
            "name" : "Team-Two",
            "isPrimary" : false,
            "portfolioAccess" : 0
            },{
            "id" : 5,
            "name" : "Team-Five",
            "isPrimary" : false,
            "portfolioAccess" : 0
        }],
        "issues" : {
            "outOfTolerance" : 12,
            "cashNeed" : 1200,
            "setForAutoRebalance" : true,
            "contribution" : 100,
            "distribution" : 4000,
            "modelAssociation" : true,
            "doNotTrade" : 0,
            "TLHOpportunity" : false,
            "dataErrors" : 15,
            "pendingTrades" : 7
        },
        "summary" : {
            "analyticsOn": "2016-08-30T06:19:20.000Z",
            "AUM" : {
                "total" : 4000,
                "totalValue" : 2250,
                "managedValue" : 1250,
                "excludedValue" : 1000,
                "totalCash" : {
                "total" : 1750,
                "reserve" : 1000,
                "cash" : 500,
                "setAsideCash" : 250
                }
                },
            "realized" : {
                "total" : 400,
                "totalStatus": "high",
                "shortTerm" : 500,
                "shortTermStatus"  :"high",
                "longTerm" : 100,
                "longTermStatus"  :"low"
            }
        },
        "isDeleted": 0,
        "createdOn": "0000-00-00 00:00:00",
        "createdBy": "ETL ETL",
        "editedOn": "0000-00-00 00:00:00",
        "editedBy": "ETL ETL"
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
app.post('/', validate({ body: postPortfolioSchema }), function (req, res) {
    logger.info("Add New Portfolio request received");
    req.data.modelId = req.data.hasOwnProperty('modelId') ? (req.data.modelId ? req.data.modelId : 0) : null;
    var data = new PortfolioRequest(req.data);
    portfolioService.addPortfolio(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @apiIgnore No More Use
 * @api {delete} /portfolio/portfolios Delete Portfolios
 * @apiName DeletePortfolios
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API deletes Portfolios (Soft Delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiParam {Array}       ids                Portfolio ids.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
       "ids" : [11,12]
    }
 *
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Portfolio deleted successfully"
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
 * @apiError Not_Found When Portfolio does not exist or already deleted.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Portfolio does not exist or already deleted"
 *     }
 * 
 */
/*
    app.delete('/', validate({ body: deletePortfolioIdSchema }), function (req, res) {
        logger.info("Delete Portfolio request received");

        var data = req.data;

        portfolioService.deletePortfolio(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    });
 */

/** @api {delete} /portfolio/portfolios/:id Delete Portfolio
 * @apiName DeletePortfolio
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API deletes Portfolio (Soft Delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 *
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/15
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Portfolio deleted successfully"
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
 * @apiError Not_Found When Portfolio does not exist or already deleted.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Portfolio does not exist or already deleted"
 *     }
 * 
 */
app.delete('/:id', validate({ params: portfolioIdSchema }), analysisMiddleware.post_import_analysis, function (req, res) {
    logger.info("Delete Portfolio request received");
    var ids = [];
    var data = req.data;
    ids.push(req.params.id);
    data.ids = ids;
    portfolioService.deletePortfolio(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /portfolio/portfolios/:id Update Portfolio
 * @apiName   UpdatePortfolio.
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API Update Portfolio. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {String}       name                Name of the Portfolio.
 * @apiParam {Number}       modelId             Model Id.
 * @apiParam {Boolean}      isSleevePortfolio   Sleeve Portfolio - 0/1(true/false).
 * @apiParam {Boolean}      doNotTrade          Do not trade Portfolio - 0/1(true/false).
 * @apiParam {String}       tags                Portfolio tags.
 * @apiParam {Array}        teamIds             Team ids of Portfolio.
 * @apiParam {Number}       primaryTeamId       Primary team id of Portfolio.
 * @apiParamExample {json} Request-Example:
 *     {
         "name": "Demo Portfolio",
         "modelId": 1,
         "isSleevePortfolio" : false,
         "doNotTrade" : 0,
         "tags" : "test",
         "teamIds": [1,2,5],
         "primaryTeamId": 1
       }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/1
 * 
 * @apiSuccess {Number}     id                      The Portfolio id.
 * @apiSuccess {JSON}       general                 General information of the Portfolio.
 * @apiSuccess {String}     -portfolioName          Name of the Portfolio.
 * @apiSuccess {Boolean}    -sleevePortfolio        True/False – Portfolio is Sleeved.
 * @apiSuccess {String}     -custodialAccountNumber Custodial Account Number.
 * @apiSuccess {String}     -registrationId         Registration Id.
 * @apiSuccess {String}     -sleeveStrategy         Sleeve Strategy.
 * @apiSuccess {String}     -contributionMethod     Contribution Method.
 * @apiSuccess {String}     -distributionMethod     Distribution Method.
 * @apiSuccess {Number}     -modelId                Model Id.
 * @apiSuccess {String}     -modelName              Name of Model.
 * @apiSuccess {String}     -autoRebalance          Auto Rebalance option - None/Annual/Semi-Annual/Quarterly/Monthly.
 * @apiSuccess {Date}       -monthAndDate           Auto Rebalance Month & Date.
 * @apiSuccess {Boolean}    -doNotTrade             Do not trade Portfolio - 0/1(true/false).
 * @apiSuccess {String}     -tags                   Portfolio tags.
 * @apiSuccess {Array}      teams                   Teams of the Portfolio.
 * @apiSuccess {Number}     -id                     Team Id.
 * @apiSuccess {String}     -name                   Team Name.
 * @apiSuccess {Boolean}    -isPrimary              True/False – Team is Primary.
 * @apiSuccess {Boolean}    -portfolioAccess        True/False – Team has limited Portfolio Access.
 * @apiSuccess {JSON}       issues                  Issues In Portfolio.
 * @apiSuccess {Number}     -outOfTolerance         Out of Tolerance of Portfolio - in Percentage.
 * @apiSuccess {Number}     -cashNeed               Portfolio's cash need amount.
 * @apiSuccess {Boolean}    -setForAutoRebalance    True/False – Whether the Portfolio is set for Auto rebalance.
 * @apiSuccess {Number}     -contribution           Portfolio's contribution amount.
 * @apiSuccess {Number}     -distribution           Portfolio's distribution amount.
 * @apiSuccess {Boolean}    -modelAssociation       True/False – Whether the model is associated with Portfolio.
 * @apiSuccess {Boolean}    -doNotTrade             True/False – Whether the Portfolio is blocked from being traded.
 * @apiSuccess {Boolean}    -TLHOpportunity         True/False – Whether the Portfolio has TLH Opportunity.
 * @apiSuccess {Number}     -dataErrors             Count of import errors (if any).
 * @apiSuccess {Number}     -pendingTrades          Number of pending trades under Portfolio.
 * @apiSuccess {JSON}       summary                 Portfolio summary.
 * @apiSuccess {Date}       -analyticsOn            Analytics Date.
 * @apiSuccess {JSON}       -AUM                    Portfolio's AUM(Assets Under Management) information.
 * @apiSuccess {Number}     --total                 Portfolio AUM total (totalValue + totalCash).
 * @apiSuccess {Number}     --totalValue            Total Portfolio Value (Managed Value + Excluded Value).
 * @apiSuccess {Number}     --managedValue          Portfolio value managed by user.
 * @apiSuccess {Number}     --excludedValue         Portfolio value not managed by current user.
 * @apiSuccess {JSON}       --totalCash             Total Portfolio cash information.
 * @apiSuccess {Number}     ---total                Total Portfolio cash (cash + reserve + setAsideCash).
 * @apiSuccess {Number}     ---reserve              Min cash value that Portfolio needs to hold to be active.
 * @apiSuccess {Number}     ---cash                 Cash (held by Portfolio) managed by user.
 * @apiSuccess {Number}     ---setAsideCash         Portfolio's aside cash.
 * @apiSuccess {JSON}       -realized               Realized Portfolio information.
 * @apiSuccess {Number}     --total                 Realized total value (shortTerm + longTerm).
 * @apiSuccess {String}     --totalStatus           Realized total value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Number}     --shortTerm             Realized short term value.
 * @apiSuccess {String}     --shortTermStatus       Realized short term value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Number}     --longTerm              Realized long term value.
 * @apiSuccess {String}     --longTermStatus        Realized long term value status for Gain, Loss and no Gain/Loss ["high", "low", "no"].
 * @apiSuccess {Boolean}    isDeleted               Portfolio exist or not into the system.
 * @apiSuccess {Date}       createdOn               Portfolio creation date into application.
 * @apiSuccess {String}     createdBy               Full Name of user who created the Portfolio into the system.
 * @apiSuccess {Date}       editedOn                Portfolio edited date into application.
 * @apiSuccess {String}     editedBy                Full Name of user who edited the Portfolio details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       {
        "id":1,
        "general" : {
            "portfolioName" : "Demo Portfolio",
            "sleevePortfolio" : false,
            "custodialAccountNumber": 0,
            "registrationId": 0,
            "sleeveStrategy": "sleeveStrategy",
            "contributionMethod": "contributionMethod",
            "distributionMethod": "distributionMethod",
            "modelId" : 1,
            "modelName" : "My Model",
            "autoRebalance": 0,
            "monthAndDate": "2016-08-30",
            "doNotTrade": 0,
            "tags" : "test"
        },
        "teams" : [{
            "id" : 1,
            "name" : "Team-One",
            "isPrimary" : true,
            "portfolioAccess" : 0
            },{
            "id" : 2,
            "name" : "Team-Two",
            "isPrimary" : false,
            "portfolioAccess" : 0
            },{
            "id" : 5,
            "name" : "Team-Five",
            "isPrimary" : false,
            "portfolioAccess" : 1
        }],
        "issues" : {
            "outOfTolerance" : 12,
            "cashNeed" : 1200,
            "setForAutoRebalance" : true,
            "contribution" : 100,
            "distribution" : 4000,
            "modelAssociation" : true,
            "doNotTrade" : 0,
            "TLHOpportunity" : false,
            "dataErrors" : 15,
            "pendingTrades" : 7
        },
        "summary" : {
            "analyticsOn": "2016-08-30T06:19:20.000Z",
            "AUM" : {
                "total" : 4000,
                "totalValue" : 2250,
                "managedValue" : 1250,
                "excludedValue" : 1000,
                "totalCash" : {
                "total" : 1750,
                "reserve" : 1000,
                "cash" : 500,
                "setAsideCash" : 250
                }
                },
            "realized" : {
                "total" : 400,
                "totalStatus": "high",
                "shortTerm" : 500,
                "shortTermStatus"  :"high",
                "longTerm" : 100,
                "longTermStatus"  :"low"
            }
        },
        "isDeleted": 0,
        "createdOn": "0000-00-00 00:00:00",
        "createdBy": "ETL ETL",
        "editedOn": "0000-00-00 00:00:00",
        "editedBy": "ETL ETL"
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
app.put('/:id', validate({ params: portfolioIdSchema, body: postPortfolioSchema }), analysisMiddleware.post_import_analysis, function (req, res) {
    logger.info("Update Portfolio details request received");

    var data = req.data;
    data.id = req.params.id;
    req.data.modelId = req.data.hasOwnProperty('modelId') ? (req.data.modelId ? req.data.modelId : 0) : null;
    req.data.doNotTrade = req.data.hasOwnProperty('doNotTrade') ? (req.data.doNotTrade ? req.data.doNotTrade : 0) : null;
    data = new PortfolioRequest(data);

    portfolioService.updatePortfolio(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/{:id}/holdings  Get Holding List by Portfolio Id
 * @apiName GetHoldingListByPortfolioId
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get holding list by Portfolio id
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/1/holdings
 * 
 * @apiSuccess {Number}     id                      Holding Id.
 * @apiSuccess {String}     accountNumber           Account number associated with holding.
 * @apiSuccess {String}     securityName            Security name.
 * @apiSuccess {Number}     price                   Price of holding.
 * @apiSuccess {Number}     shares                  Shares.
 * @apiSuccess {Number}     value                   Holding value.
 * @apiSuccess {Number}     currentInPer            Current holding percentage.
 * @apiSuccess {Number}     targetInPer             Target holding percentage.
 * @apiSuccess {Number}     pendingValue            Pending value.
 * @apiSuccess {Number}     pendingInPer            Pending percentage
 * @apiSuccess {String}     excluded                Holding excluded detail.
 * @apiSuccess {String}     isCash                  Holding "isCash" detail. 
 * @apiSuccess {String}     inModel                 Holding "inModel" detail. 
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
 *   "accountNumber": "L05C900669",
 *   "securityName": "Agilent Technologies Inc",
 *   "price": 10,
 *   "shares": 230,
 *   "value": 2300,
 *   "currentInPer": 10.32,
 *   "targetInPer": 5,
 *   "pendingValue": 0,
 *   "pendingInPer": 0,
 *   "excluded": "No",
 *   "isCash": "Yes",
 *   "inModel": "Yes",
 *   "isDeleted": 0,
 *   "createdOn": "2016-07-14T03:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-07-14T03:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 * }
 *]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/** @api {get} /portfolio/portfolios/1/holdings?filter={filterId}  Get Portfolio Holding List by Filters
 * @apiName GetPortfolioHoldingByFilter
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get holding list by filters
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/1/holdings?filter=1

 * @apiSuccess {Number}     id                      Holding Id.
 * @apiSuccess {String}     accountNumber           Account number associated with holding.
 * @apiSuccess {String}     securityName            Security name.
 * @apiSuccess {Number}     price                   Price of holding.
 * @apiSuccess {Number}     shares                  Shares.
 * @apiSuccess {Number}     value                   Holding value.
 * @apiSuccess {Number}     currentInPer            Current holding percentage.
 * @apiSuccess {Number}     targetInPer             Target holding percentage.
 * @apiSuccess {Number}     pendingValue            Pending value.
 * @apiSuccess {Number}     pendingInPer            Pending percentage
 * @apiSuccess {String}     excluded                Holding excluded detail.
 * @apiSuccess {String}     isCash                  Holding "isCash" detail. 
 * @apiSuccess {String}     inModel                 Holding "inModel" detail. 
 * @apiSuccess {Boolean}    isDeleted               Holding exist or not into the system.
 * @apiSuccess {Date}       createdOn               Holding creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Holding into the system.
 * @apiSuccess {Date}       editedOn                Holding edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Holding details into the system.
 *
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 * [
 *  {
 *   "id": 1,
 *   "accountNumber": "L05C900669",
 *   "securityName": "Agilent Technologies Inc",
 *   "price": 10,
 *   "shares": 230,
 *   "value": 2300,
 *   "currentInPer": 10.32,
 *   "targetInPer": 5,
 *   "pendingValue": 0,
 *   "pendingInPer": 0,
 *   "excluded": "No",
 *   "isCash": "Yes",
 *   "inModel": "Yes",
 *   "isDeleted": 0,
 *   "createdOn": "2016-07-14T03:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-07-14T03:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 * }
 *]
 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

app.get('/:id/holdings', function (req, res) {
    logger.info("Get holding details request received");

    var data = req.data;
    data.id = req.params.id;
    data.searchType = 'PORTFOLIO'
    if (req.query.filter) {
        data.filter = req.query.filter;
    }
    holdingService.getHoldingByPortId(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/1/allocations  Get Portfolio Allocations For securities
 * @apiName GetPortfolioAllocations
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to allocations for securities in portfolio.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/1/allocations

 * @apiSuccess {Number}     id                      Portfolio Id.
 * @apiSuccess {String}     symbol                  symbol of security.
 * @apiSuccess {String}     name            		Security name.
 * @apiSuccess {Number}     targetInAmt             target amount of security.
 * @apiSuccess {Number}     currentInAmt            current amount of security.
 * @apiSuccess {Number}     targetInPercent         target percent of security.
 * @apiSuccess {Number}     currentInPercent        current percent of security.
 *
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
	[
	  {
	    "id": 1,
	    "symbol": "APPL",
	    "targetInAmt": 55000,
	    "currentInAmt": 56000,
	    "targetInPercent": 50,
	    "currentInPercent": 56
	  },
	  {
	    "id": 2,
	    "symbol": "MSFT",
	    "targetInAmt": 55000,
	    "currentInAmt": 56000,
	    "targetInPercent": 50,
	    "currentInPercent": 56
	  }
	]
 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

app.get('/:id/allocations', function (req, res) {
    logger.info("Get allocations details request received");

    var data = req.data;
    data.id = req.params.id;

    modelService.getCurrentAndTargetAllocationsForSecuritiesInPortfolio(data, function (err, status, rs) {
        console.log(err);
        return response(err, status, rs, res);
    })
});


/** @api {get} /portfolio/portfolios/{portfolioId}/modelTolerance/:accountId?assetType={securityset/category,class,subClass}&isSleevedPortfolio=0 Get ModelTolerance
 * @apiName Get Model Tolerance
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 *
 * @apiDescription This API get model tolerance of security, category,class and subclass 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/{portfolioId}/modelTolerance/:accountId?assetType={securityset/category,class,subClass}&isSleevedPortfolio=0
 * 
 * @apiSuccess {Number}      portfolioId                        Protfolio id.
 * @apiSuccess {String}      portfolioName                      Portfolio Name.
 * @apiSuccess {Number}      assetId:                        	Asset id Which can be securityId, classId, subclassId or categoryId.
 * @apiSuccess {String}      assetName:                         Asset name Which can be securityName, className, subclassName, categoryName. 
 * @apiSuccess {String}      assetSymbol:                       Asset symbol same as security symbol not available for others. 
 * @apiSuccess {Number}      modelId                            Model id.
 * @apiSuccess {Decimal}     targetInPercentage                 Target value in percentage.         
 * @apiSuccess {Decimal}     currentInPercentage:               Current value in percentage.
 * @apiSuccess {Decimal}     postTradeInPercentage:             Post trade value in percentage.
 * @apiSuccess {Decimal}     differenceInPercentage:            Difference in percentage.
 * @apiSuccess {Decimal}     lowerModelTolerancePercentage:     Lower Model Tolerance in percentage.
 * @apiSuccess {Decimal}     upperModelTolerancePercentage:     Upper Model Tolerance in percentage.
 * @apiSuccess {Boolean}     outofTolerance                     Out of tolerance.
 * @apiSuccess {String}      rangeInPercentage                  Range in percentage.
 * @apiSuccess {Decimal}     currentInDollar                    Current value in dollar amount.
 * @apiSuccess {Boolean}     targetInDollar                     Target value in dollar amount.
 * @apiSuccess {Decimal}     differenceInDollar                 Difference in dollar.
 * @apiSuccess {String}      postTradeInDollar                  Post trade value in dollar.
 * @apiSuccess {Decimal}     currentInShares                    Current value in shares.
 * @apiSuccess {Boolean}     targetInShares                     Target value in shares.
 * @apiSuccess {Decimal}     differenceInShares                 Difference in shares
 * @apiSuccess {Boolean}     postTradeInShares                  Post trade value in shares.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  [
 *    {
 *         "portfolioId": 1,
 *         "portfolioName": test1
 *         "assetId": 14630,
 *         "assetName": "Int IQ Smart Annuity: Janus Balanced",
 *         "assetSymbol": "ABCD126",
 *         "modelId": 3,
 *         "targetInPercentage": 0,
 *         "currentInPercentage": 22.8,
 *         "postTradeInPercentage": 22.8,
 *         "differenceInPercentage": 0,
 *         "lowerModelTolerancePercentage": 0,
 *         "upperModelTolerancePercentage": 0,
 *         "outofTolerance": 0,
 *         "rangeInPercentage": "0.000-0.000",
 *         "currentInDollar": 16000,
 *         "targetInDollar": 0,
 *         "differenceInDollar": 16000,
 *         "postTradeInDollar": 16000,
 *         "currentInShares": 40,
 *         "targetInShares": 0,
 *         "differenceInShares": 40,
 *         "postTradeInShares": 40
 *   }
 *  ]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/:id/modelTolerance/:accountId', function (req, res) {
    logger.info("Get Model Tolerance request received");
    var data = req.data;
    data.id = req.params.id;
    data.accountId = req.params.accountId;
    if (req.query.assetType) {
        data.assetType = req.query.assetType;
    }
    if (req.query.isSleevedPortfolio) {
        data.isSleevePortfolio = req.query.isSleevedPortfolio;
    }
    portfolioToleranceService.getModelTolerance(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/:modelId/outOfTolerance/:assetId?assetType={securityset/category,class,subClass} Get Out Of Tolerance Portfolios
 * @apiName Get Out Of Tolerance Portfolios
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 *
 * @apiDescription This API get ot of tolerance portfolios by security, category,class and subclass.
 * asset id can be securityId, categoryId, classId or subclassId. also we beed type of asset inquery string.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/:modelId/outOfTolerance/:assetId?assetType={securityset/category,class,subClass}
 * 
 * @apiSuccess {Number}      portfolioId                        Protfolio id.
 * @apiSuccess {String}      portfolioName                      Portfolio Name.
 * @apiSuccess {Decimal}     currentInPercentage:               Current value in percentage.
 * @apiSuccess {Decimal}     postTradeInPercentage:             Post trade value in percentage.
 * @apiSuccess {Decimal}     differenceInPercentage:            Difference in percentage.
 * @apiSuccess {Decimal}     currentInDollar                    Current value in dollar amount.
 * @apiSuccess {Decimal}     differenceInDollar                 Difference in dollar.
 * @apiSuccess {String}      postTradeInDollar                  Post trade value in dollar.
 * @apiSuccess {Decimal}     currentInShares                    Current value in shares.
 * @apiSuccess {Decimal}     differenceInShares                 Difference in shares
 * @apiSuccess {Boolean}     postTradeInShares                  Post trade value in shares.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  [
 *    {
 *         "portfolioId": 1,
 *         "portfolioName": test1
 *         "currentInPercentage": 22.8,
 *         "postTradeInPercentage": 22.8,
 *         "differenceInPercentage": 0,
 *         "currentInDollar": 16000,
 *         "differenceInDollar": 16000,
 *         "postTradeInDollar": 16000,
 *         "currentInShares": 40,
 *         "differenceInShares": 40,
 *         "postTradeInShares": 40
 *    }
 *  ]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/:modelId/outOfTolerance/:assetId', function (req, res) {
    logger.info("Get out of tolerance portfolio list request received");
    var data = req.data;
    data.modelId = req.params.modelId;
    data.assetId = req.params.assetId;
    if (req.query.assetType) {
        data.assetType = req.query.assetType;
    }
    portfolioToleranceService.getPortfoliosWithOutOfTolerance(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/{portfolioId}/Model/nodes Get Portfolio's Model Nodes
 * @apiName GetPortfolioModelNodes
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 *
 * @apiDescription This API will return list of Portfolios/Model's nodes (Level and Sub Models).
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i  https://baseurl/v1/portfolio/portfolios/{portfolioId}/Model/nodes

 * 
 * @apiSuccess {Number}      portfolioId                        Protfolio id.
 * @apiSuccess {Number}      modelId                        Modle id.
 * @apiSuccess {JSON}       levels                   Levels/Nodes for model.
 * @apiSuccess {JSON}       subModels                   List of nodes( id from ModelDetail table and name) with node id and node name.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
    {
    "portfolioId": 1,
    "modelId": 604,
    "levels": [
        {
        "level": "0",
        "subModels": [
            {
            "id": 343685,
            "subModelName": "asddf"
            }
        ]
        },
        {
        "level": "1",
        "subModels": [
            {
            "id": 343684,
            "subModelName": "Test ModDedld d13"
            }
        ]
        },
        {
        "level": "2",
        "subModels": [
            {
            "id": 343684,
            "subModelName": "Test ModDedld d13"
            },
            {
            "id": 343682,
            "subModelName": "Test Moddeld 13"
            },
            {
            "id": 343683,
            "subModelName": "SSd1"
            }
        ]
        },
        {
        "level": "3",
        "subModels": [
            {
            "id": 343684,
            "subModelName": "Test ModDedld d13"
            },
            {
            "id": 343682,
            "subModelName": "Test Moddeld 13"
            },
            {
            "id": 343683,
            "subModelName": "SSd1"
            },
            {
            "id": 343681,
            "subModelName": "Test dMdoSdel 13"
            },
            {
            "id": 343679,
            "subModelName": "Test Mdoddel 13"
            },
            {
            "id": 343678,
            "subModelName": "SdS1"
            }
        ]
        },
        {
        "level": "3",
        "subModels": [
            {
            "id": 343684,
            "subModelName": "Test ModDedld d13"
            },
            {
            "id": 343682,
            "subModelName": "Test Moddeld 13"
            },
            {
            "id": 343683,
            "subModelName": "SSd1"
            },
            {
            "id": 343681,
            "subModelName": "Test dMdoSdel 13"
            },
            {
            "id": 343679,
            "subModelName": "Test Mdoddel 13"
            },
            {
            "id": 343678,
            "subModelName": "SdS1"
            },
            {
            "id": 343680,
            "subModelName": "SdSS1"
            }
        ]
        }
    ],
    "preSelectedNodeId": null
    }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/:portfolioId/model/nodes', function (req, res) {
    logger.info("Get nodes from model of prtfolio request recieved");
    var data = req.data;

    if (req.params.portfolioId == undefined) {
        logger.error("Get Portfolio Node Error : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    data.portfolioId = req.params.portfolioId;

    portfolioService.getPortfolioNodes(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/{:portfolioId}/cashsummary Get Portfolio's cash and account summary
 * @apiName GetPortfolioCashAndAccountSummary
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 *
 * @apiDescription This API will return portfolio cash and account cash summary detail.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i  https://baseurl/v1/portfolio/portfolios/1/cashsummary

 * @apiSuccess {JSON}       portfolioCashSummary       Portfolio cash summary.
 * @apiSuccess {Number}     -id                        System generated id.
 * @apiSuccess {String}     -portfolioName             Portfolio name. 
 * @apiSuccess {String}     -modelName                 Model name.
 * @apiSuccess {JSON}       -totalTradeCost            Total trade cost.
 * @apiSuccess {Number}     -totalRedemptionFee        Total Redemption Fee.
 * @apiSuccess {Number}     -totalValue                Total value.
 * @apiSuccess {Number}     -currentValue              Current value. 
 * @apiSuccess {Number}     -reserveValue              Reserve value. 
 * @apiSuccess {Number}     -excludedValue             excluded value. 
 * @apiSuccess {Number}     -setAsideValue             setAside value. 
 * @apiSuccess {Number}     -targetValue               Target value.
 * @apiSuccess {Number}     -postTradeValue            Post Trade value.
 * @apiSuccess {Number}     -needsValue                Needs value. 

 * @apiSuccess {JSON}       accountCashSummary         Account cash summary.
 * @apiSuccess {Number}     --id                       System generated id.
 * @apiSuccess {String}     --accountName              Account name. 
 * @apiSuccess {Number}     --currentValue             Current value. 
 * @apiSuccess {Number}     --reserveValue             Reserve value. 
 * @apiSuccess {Number}     --totalValue               Total value.
 * @apiSuccess {Number}     --targetValue              Target value.
 * @apiSuccess {Number}     --postTradeValue           Post Trade value.
 * @apiSuccess {Number}     --needsValue               Needs value.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
    {
    "portfolioCashSummary": {
        "id": 1,
        "portfolioName": "Kane, Jr.  Fredric ",
        "modelName": "Kane, Jr.  Fredric ",
        "totalTradeCost": 100,
        "totalRedemptionFee": 200,
        "totalValue": 300,
        "currentValue": 400,
        "reserveValue": 500,
        "excludedValue": 300,
        "setAsideValue": 400,
        "targetValue": 500,
        "postTradeValue": 500,
        "needsValue": 500
    },
    "accountCashSummary": [
        {
        "id": 1,
        "accountName": "McDonald - American Podiatric Medical Students Ass",
        "currentValue": 0,
        "reserveValue": 200,
        "totalValue": 300,
        "targetValue": 400,
        "postTradeValue": 500,
        "needsValue": 600
        },
        {
        "id": 2,
        "accountName": "Ashe Aaron M.",
        "currentValue": 0,
        "reserveValue": 200,
        "totalValue": 300,
        "targetValue": 400,
        "postTradeValue": 500,
        "needsValue": 600
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

app.get('/:id/cashsummary', validate({ params: portfolioIdSchema }), function (req, res) {
    logger.info("Get account list with cash detail  associated to Portfolio request received");

    var data = req.data;
    data.id = req.params.id;

    portfolioService.getPortfolioDetailWithAccountCashSummary(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /portfolio/portfolios/{portfolioId}/contributionamount Get Portfolio Contribution Amount 
 * @apiName getContributionAmount
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This API return contribution amount for portfolio. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/portfolios/1/contributionamount
 * 
 * @apiSuccess {Number}     id                  The Portfolio id.
 * @apiSuccess {Number}     amount               Total contribution Amount for portfolio.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {
 *           "id": 1,
 *           "amount": 100,
 *         }
 *       ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *     
 *    HTTP/1.1 404 NOT FOUND
 *     {
 *       "message": "portfolio not found."
 *     }
 */
app.get('/:portfolioId/contributionamount', UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get Portfolio contribution Amount request received.");
    var data = req.data;

    if (req.params.portfolioId) {
        data.portfolioId = req.params.portfolioId;
    }

    portfolioService.getPortfolioContributionAmount(data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

module.exports = app;
