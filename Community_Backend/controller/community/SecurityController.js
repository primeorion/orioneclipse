"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var config = require('config');
var response = require('controller/ResponseController.js');
var SecurityRequest = require("model/community/security/SecurityRequest.js");
var SecurityService = require('service/community/SecurityService.js');
var securityService = new SecurityService();

var logger = helper.logger(moduleName);
var validate = helper.validate;

app.use(require('middleware/DBConnection').community);

/**
 * @api {get} /community/security?search={SecuritySymbol} Search Community Security
 * @apiName SearchCommunitySecurity
 * @apiVersion 1.0.0
 * @apiGroup Community-Security
 * @apiPermission CommunityUser
 *
 * @apiDescription This API search for community security detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/security?search=AAPL
 * 
 * @apiParam (QueryParam) {String}     search       Search parameter to hold security symbol.
 * 
 * @apiSuccess {String}     id                      Id of the security.
 * @apiSuccess {String}     securityId              Security Id fetched from Orion.
 * @apiSuccess {Date}       securityName                    Name of the security.
 * @apiSuccess {String}     symbol                  Symbol of security.
 * @apiSuccess {String}     category                Security category detail.
 * @apiSuccess {String}     securityType            Security Type detail.
 * @apiSuccess {String}     assetClass              Asset Class detail.
 * @apiSuccess {String}     subClass                Sub Class detail.
 * @apiSuccess {String}     company                Company details of security.
 
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
        {
            "id": 2,
            "securityName": "Google",
            "securityId": null,
            "symbol": "GOOG",
            "company": "Google INC",
            "category": "0",
            "securityType": "stock",
            "assetClass": "Equity",
            "subclass": "LargeCap"
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
 * 
 * @apiError Bad_Request Invalid/Only String is allowed.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 BAD REQUEST
 *     {
        "message": "Numbers as parameter values is not allowed."
        }
 * 
 * 
 * @apiError Not_Found NonExistingSecurity/Security not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 NOT FOUND
 *    {
        "message": " Security Not Found "
        }
 * 
 * 
 * @apiError Bad_Request Missing Search criteria.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 BAD REQUEST
 *     {
        "message": "Query parameter value not specified."
       }
 * 
 * 
 * @apiError Bad_Request Missing query parameter search.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 BAD REQUEST
 *     {
        "message": "Missing query parameter "
        }
 */


/**
 * @api {get} /community/security/:id Get security By ID 
 * @apiName GetSecurityById
 * @apiVersion 1.0.0
 * @apiGroup Community-Security
 * @apiPermission appsecurity
 *
 * @apiDescription This API gets security by security Id. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/security/13
 * 
 * @apiSuccess {String}     id                      Community Id of the security.
 * @apiSuccess {Date}       name                    Name of the security.
 * @apiSuccess {String}     symbol                  Symbol of security.
 * @apiSuccess {String}     category                Security category detail.
 * @apiSuccess {String}     securityType            Security Type detail.
 * @apiSuccess {String}     class                   Asset Class detail.
 * @apiSuccess {String}     subClass                Sub Class detail.
 * @apiSuccess {String}     securityId              Orion securityId.
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
        "id": 13,
        "name": "CUSTODIAL_CASH",
        "symbol": "CCASH",
        "company": null,
        "category": "0",
        "class": "Cash",
        "subClass": "Cash",
        "securityType": 2,
        "securityId": null
        }
 * 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 * 
 * @apiError NOTFOUND Invalid/Security id.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Security does not exist."
 *     }
 */

app.get('/', function (req, res) {
    logger.info("Get all security request received");

    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    securityService.getSecurityList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:id', function (req, res) {
    logger.info("Get security details request received");

    var data = req.data;
    data.id = req.params.id;
    securityService.getSecurityDetail(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});




module.exports = app;