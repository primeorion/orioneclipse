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
 * @apiIgnore
 * @api {get} /community/security?search={id/name} Search Community security
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
 * curl -i http://baseurl/v1/community/security?search=370925
 * 
 * @apiSuccess {String}     id                      Id of the security.
 * @apiSuccess {Date}       name                    Name of the security.
 * @apiSuccess {Number}     isDeleted               Community Security exist or not into the system.
 * @apiSuccess {Date}       createdOn               Community Security creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the security into the system.
 * @apiSuccess {Date}       editedOn                Security detail edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the security details into the system.
 * @apiSuccess {Number}     status                  Security status detail - Active/Inactive.
 * @apiSuccess {String}     symbol                  Symbol of security.
 * @apiSuccess {String}     category                Security category detail.
 * @apiSuccess {String}     securityType            Security Type detail.
 * @apiSuccess {String}     assetClass              Asset Class detail.
 * @apiSuccess {String}     subClass                Sub Class detail.
 * @apiSuccess {Number}     custodialCash           Custodial Cash.
 
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "symbol": "TestSymbol",
 *      "securityType": "Test Security Type",
 *      "category": "Test Category",
 *      "assetClass": "Test Asset Class",
 *      "subClass": "Test Sub Class",
 *      "custodialCash": "9999",
 *      "isDeleted": 0,
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "Test",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "Test"
 *     }
 * 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
/**
 * @apiIgnore
 * @api {get} /community/security Get All security 
 * @apiName GetAllsecurity
 * @apiVersion 1.0.0
 * @apiGroup Community-Security
 * @apiPermission appsecurity
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/security
 * 
 * @apiSuccess {String}     id                      Id of the security.
 * @apiSuccess {Date}       name                    Name of the security.
 * @apiSuccess {Number}     isDeleted               Community Security exist or not into the system.
 * @apiSuccess {Date}       createdOn               Community Security creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the security into the system.
 * @apiSuccess {Date}       editedOn                Security detail edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the security details into the system.
 * @apiSuccess {Number}     status                  Security status detail - Active/Inactive.
 * @apiSuccess {String}     symbol                  Symbol of security.
 * @apiSuccess {String}     category                Security category detail.
 * @apiSuccess {String}     securityType            Security Type detail.
 * @apiSuccess {String}     assetClass              Asset Class detail.
 * @apiSuccess {String}     subClass                Sub Class detail.
 * @apiSuccess {Number}     custodialCash           Custodial Cash.
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "symbol": "TestSymbol",
 *      "securityType": "Test Security Type",
 *      "category": "Test Category",
 *      "assetClass": "Test Asset Class",
 *      "subClass": "Test Sub Class",
 *      "custodialCash": "9999",
 *      "isDeleted": 0,
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "Test",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "Test"
 *     }
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