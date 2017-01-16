"use strict";
var moduleName = __filename;

var app = require("express")();

var response = require('controller/ResponseController.js');
var AdvisorService = require('service/admin/AdvisorService.js');
var logger = require("helper/Logger.js")(moduleName);
var AdvisorConverter = require("converter/advisor/AdvisorConverter.js")
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js").getDifferentAccessForUser;

var advisorService = new AdvisorService();
var advisorConverter = new AdvisorConverter();
/**@apiIgnore
 * @api {get} /admin/advisors?search={id/name} Search Advisors 
 * @apiName SearchAdvisors
 * @apiVersion 1.0.0
 * @apiGroup Advisors
 * @apiPermission appuser
 *
 * @apiDescription This API search advisor. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/advisors?search=12
 * 
 * @apiSuccess {String}     id              The advisor Id.
 * @apiSuccess {String}     externalId              The advisor orion connect external Id.
 * @apiSuccess {String}       name            Name of the Advisor.
 * @apiSuccess {Boolean}     isDeleted       Advisor exist or not into the system.
 * @apiSuccess {Date}       createdOn       Advisor creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Advisor into the system.
 * @apiSuccess {Date}       editedOn        Advisor edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Advisor details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
          {
            "id": 12,
            "externalId":344,
            "name": "Todd Bertucci",
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
/**@apiIgnore

 * @api {get} /admin/advisors Get All Advisors 
 * @apiName GetAllAdvisors
 * @apiVersion 1.0.0
 * @apiGroup Advisors
 * @apiPermission appuser
 *
 * @apiDescription This API gets advisor list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/advisors
 * 
 * @apiSuccess {String}     id              The advisor Id.
 * @apiSuccess {String}       name            Name of the Advisor.
 * @apiSuccess {Boolean}     isDeleted       Advisor exist or not into the system.
 * @apiSuccess {Date}       createdOn       Advisor creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Advisor into the system.
 * @apiSuccess {Date}       editedOn        Advisor edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Advisor details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
          {
            "id": 12,
            "name": "Todd Bertucci",
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
app.get('/', UserTeamAccessMiddleWare, function (req, res) {
	
   	logger.info("Get all advisors request received");

    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    if (req.query.isDeleted) {
        data.isDeleted = req.query.isDeleted;
    }
    var model = advisorConverter.getRequestToModel(data);
    advisorService.getAdvisorList(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});


module.exports = app;