"use strict";

var moduleName = __filename;

var app = require("express")();
var logger = require("helper/Logger.js")(moduleName);

var response = require('controller/ResponseController.js');
var PrivilegeService = require('service/admin/PrivilegeService.js');
var privilegeService = new PrivilegeService();


/**
 * @api {get} /admin/privileges?roleTypeId={roleTypeid} Get Privileges based on roleTypeId 
 * @apiName GetPrivilegesOnRoleType
 * @apiVersion 1.0.0
 * @apiGroup Privileges
 * @apiPermission appuser
 *
 * @apiDescription This API gets privileges list based on roleTypeId 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/privileges?roleTypeId=3
 * 
 * @apiSuccess {String}     id              The privilege Id.
 * @apiSuccess {String}     name            Name of the Privilege.
 * @apiSuccess {String}     code            Code of the Privilege.
 * @apiSuccess {Number}     type            Type of the Privilege.
 * @apiSuccess {Number}     userLevel       User Level of the Privilege.
 * @apiSuccess {String}     category        Category of the Privilege.
 * @apiSuccess {Boolean}     addDisabled     Add privilege is enabled/disabled for roleType.
 * @apiSuccess {Boolean}     updateDisabled     Update privilege is enabled/disabled for roleType.
 * @apiSuccess {Boolean}     deleteDisabled     Delete privilege is enabled/disabled for roleType.
 * @apiSuccess {Boolean}     readDisabled     Read privilege is enabled/disabled for roleType.
 * @apiSuccess {Boolean}     isDeleted       Privilege exist or not into the system.
 * @apiSuccess {Date}       createdOn       Privilege creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Privilege into the system.
 * @apiSuccess {Date}       editedOn        Privilege edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Privilege details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [ {
            "id": 60,
            "name": "Models",
            "code": "MODELS",
            "type": 0,
            "userLevel": 7,
            "category": "Modeling",
            "addDisabled": 0,
            "updateDisabled": 0,
            "deleteDisabled": 0,
            "readDisabled": "0",
            "isDeleted": 0,
            "createdOn": "2016-06-14T16:55:16.000Z",
            "createdBy": "Prime Prime",
            "editedOn": "2016-06-14T16:55:16.000Z",
            "editedBy": "Prime Prime"
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


/**
 * @api {get} /admin/privileges Get All Privileges 
 * @apiName GetAllPrivileges
 * @apiVersion 1.0.0
 * @apiGroup Privileges
 * @apiPermission appuser
 *
 * @apiDescription This API gets privileges list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/privileges
 * 
 * @apiSuccess {String}     id              The privilege Id.
 * @apiSuccess {String}     name            Name of the Privilege.
 * @apiSuccess {String}     code            Code of the Privilege.
 * @apiSuccess {Number}     type            Type of the Privilege.
 * @apiSuccess {Number}     userLevel       User Level of the Privilege.
 * @apiSuccess {String}     category        Category of the Privilege.
 * @apiSuccess {Boolean}     isDeleted       Privilege exist or not into the system.
 * @apiSuccess {Date}       createdOn       Privilege creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Privilege into the system.
 * @apiSuccess {Date}       editedOn        Privilege edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Privilege details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [ {
            "id": 57,
            "name": "Teams",
            "code": "TEAMS",
            "type": 0,
            "userLevel": 1,
            "category": "Security",
            "isDeleted": 0,
            "createdOn": "2016-06-14T11:25:16.000Z",
            "createdBy": "Prime Prime",
            "editedOn": "2016-06-14T11:25:16.000Z",
            "editedBy": "Prime Prime"
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
	logger.info("Get all privileges request received");

    var data = req.data;
    privilegeService.getPrivilegeList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


module.exports = app;
