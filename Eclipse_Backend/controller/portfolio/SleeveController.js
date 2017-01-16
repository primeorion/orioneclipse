"use strict";

var app = require("express")();

var moduleName = __filename;

var config = require('config');
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var modelSleeveService = require('service/model/ModelSleeveService.js');
var modelService = require('service/model/ModelService.js');
var modelConverter = require('converter/model/ModelPortfolioConverter.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var responseCodes = config.responseCode;

var applicationEnum = config.applicationEnum;

var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var reverseRelatedTypeCodeToId = applicationEnum.reverseRelatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var reverseRelatedTypeCodeToDisplayName = applicationEnum.reverseRelatedTypeCodeToDisplayName;


/**
 * @api {get} /portfolio/sleeves Get Sleeved accounts
 * @apiName GetSleevedAccount
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appuser
 *
 * @apiDescription This API get sleeved accounts 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/sleeves 
 * 
 * @apiSuccess {Number}     id   				            The model node Id.
 * @apiSuccess {String}     name                			Name of the model node.
 * @apiSuccess {Number}     accountId                		AccountId.
 * @apiSuccess {Number}     accountNumber   				accountNumber
 * @apiSuccess {Number}     portfolioId   					portfolioId whose this account is part of.
 * @apiSuccess {Number}     isDeleted   					Whether sleeved accounts are deleted or not.
 * @apiSuccess {Number}     createdOn		   				createdOn.
 * @apiSuccess {Number}     createdBy   					createdBy.
 * @apiSuccess {Number}     editedOn	   					editedOn.
 * @apiSuccess {Number}     editedBy	   					editedBy.
 *   
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
		  {
		    "id": 1,
		    "name": "Kane, Jr.  Fredric ",
		    "accountId": "15",
		    "accountNumber": "L05C900669",
		    "portfolioId": 1
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
/**
 * @api {get} /portfolio/sleeves?search={accountNumber/portfolioName/accountNumber} Search Sleeved accounts
 * @apiName SearchSleevedAccounts
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appuser
 *
 * @apiDescription This API search sleeved accounts 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/sleeves?search=1
 * 
 * @apiSuccess {Number}     id   				            The model node Id.
 * @apiSuccess {String}     name                			Name of the model node.
 * @apiSuccess {Number}     accountId                		AccountId.
 * @apiSuccess {Number}     accountNumber   				accountNumber
 * @apiSuccess {Number}     portfolioId   					portfolioId whose this account is part of.
 * @apiSuccess {Number}     isDeleted   					Whether sleeved accounts are deleted or not.
 * @apiSuccess {Number}     createdOn		   				createdOn.
 * @apiSuccess {Number}     createdBy   					createdBy.
 * @apiSuccess {Number}     editedOn	   					editedOn.
 * @apiSuccess {Number}     editedBy	   					editedBy.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
		  {
		    "id": 1,
		    "name": "Kane, Jr.  Fredric ",
		    "accountId": "15",
		    "accountNumber": "L05C900669",
		    "portfolioId": 1
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

app.get('/', function (req, res) {
    logger.info("Get all sleeved request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
   
    modelSleeveService.getSleevedAccount(data, function (err, status, data) {
        return response(err, status, data, res);
    });

});


/**
 * @api {get} /portfolio/sleeves/:id/allocations  Get Sleeved account Allocations For securities
 * @apiName GetSleeveAllocations
 * @apiVersion 1.0.0
 * @apiGroup Portfolios
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get allocations for sleeved accounts.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/portfolio/sleeves/1/allocations

 * @apiSuccess {Number}     id                      account Id.
 * @apiSuccess {String}     symbol                  symbol of security.
 * @apiSuccess {String}     name		            Security name.
 * @apiSuccess {Number}     targetInAmt             target amount of security.
 * @apiSuccess {Number}     currentInAmt            current amount of security.
 * @apiSuccess {Number}     targetInPercent         taget percent of security.
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

app.get('/:id/allocations', function(req, res) {
    logger.info("Get allocations details request received");
    var data = req.data;
    data.id = req.params.id;

    modelService.getCurrentAndTargetAllocationsForSecuritiesInSleevedAccounts(data, function(err, status, rs) {
        return response(err, status, rs, res);
    })
});


module.exports = app;
