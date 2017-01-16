"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var activityService = new (require('service/notification/ActivityService.js'))();
var ActivityConverter = require('converter/notification/ActivityConverter.js');

var activityConverter = new ActivityConverter();

var logger = helper.logger(moduleName);
var validate = helper.validate;

/**
 * @api {get} /notification/activities?search={id} Search Activities 
 * @apiName Search Activities
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API search notification activities. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/activities?search=1
 * 
 * @apiSuccess {Number}     id              The activity ID.
 * @apiSuccess {String}     name         	Name of activity.
 * @apiSuccess {String}     description     Description of activity
 * @apiSuccess {Boolean}    isCompleted     Activity complete status
 * @apiSuccess {Boolean}    isDeleted       Activity exist or not into the system.
 * @apiSuccess {Date}       createdOn       Activity creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Activity into the system.
 * @apiSuccess {Date}       editedOn        Activity edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Activity details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[
	{
	"id": 1,
	"name": "Team Create",
	"description": "We have to create team"
	"isCompleted": 1,
	"isDeleted": 0,
	"createdOn": "2016-06-08T09:24:16.000Z",
    "createdBy": "Prime Prime",
    "editedOn": "2016-06-30T04:33:14.000Z",
    "editedBy" : "Prime Prime"
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
 */


/**
 * @api {get} /notification/activities Get Activity List
 * @apiName Get Activity List
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API get activity list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/activities
 * 
 * @apiSuccess {Number}     id              The activity ID.
 * @apiSuccess {String}     name         	Name of activity.
 * @apiSuccess {String}     description     Description of activity
 * @apiSuccess {Boolean}    isCompleted     Activity complete status
 * @apiSuccess {Boolean}    isDeleted       Activity exist or not into the system.
 * @apiSuccess {Date}       createdOn       Activity creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Activity into the system.
 * @apiSuccess {Date}       editedOn        Activity edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Activity details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[
{
	"id": 1,
	"name": "Team Create",
	"description": "We have to create team"
	"isCompleted": 1,
	"isDeleted": 0,
	"createdOn": "2016-06-08T09:24:16.000Z",
    "createdBy": "Prime Prime",
    "editedOn": "2016-06-30T04:33:14.000Z",
    "editedBy" : "Prime Prime"
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
 */


app.get('/',  function (req, res) {
	logger.info("Get all activities request received");

    var data = req.data;
    data.id = req.query.search;

    var model = activityConverter.getRequestToModel(data);

    activityService.getActivityList(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:id',  function (req, res) {
	logger.info("Get activity detail request received");

    var data = req.data;
    data.id = req.params.id;

    var model = activityConverter.getRequestToModel(data);

    activityService.getActivityDetail(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**
 * @api {post} /notification/activities Create Activity
 * @apiName Create Activity
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API adds activity into application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}     name          The activity name.
 * @apiParam {String}     description          The activity description.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *        "name":"name of Activity",
 *		  "description":"description for the activity"
 *    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/activities
 * 
 * @apiSuccess {Number}     id              The activity ID.
 * @apiSuccess {String}     name         	Name of activity.
 * @apiSuccess {String}     description     Description of activity
 * @apiSuccess {Boolean}    isCompleted     Activity complete status
 * @apiSuccess {Boolean}    isDeleted       Activity exist or not into the system.
 * @apiSuccess {Date}       createdOn       Activity creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Activity into the system.
 * @apiSuccess {Date}       editedOn        Activity edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Activity details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
{
	"id": 1,
	"name": "Team Create",
	"description": "We have to create team"
	"isCompleted": 1,
	"isDeleted": 0,
	"createdOn": "2016-06-08T09:24:16.000Z",
	"createdBy": "Prime Prime",
	"editedOn": "2016-06-30T04:33:14.000Z",
	"editedBy" : "Prime Prime"
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
 * @apiError FORBIDDEN When user already exist with same id.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 403 FORBIDDEN
 *     {
 *       "message": "Invalid notification Id for logged in user"
 *     }
 * 
 *
 *
 */
app.post('/', function(req,res){
	logger.info("Create Activity request received");

	var data = req.data;
    var model = activityConverter.getRequestToModel(data);

	activityService.createActivity(model, function(err, status, data){
		return response(err, status, data, res);
	});
});
/**
 * @api {put} /notification/activities/:id Update Activity
 * @apiName Update Activity
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API update activity into application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}     name          The activity name.
 * @apiParam {String}     description          The activity description.
 * @apiParam {Boolean}     isCompleted          The activity complete status.
 * 
 * @apiParamExample {json} Request-Example:
{
	"name":"name of Activity",
	"description":"description for the activity",
	"isCompleted":true	
}
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/activities/1
 * 
 * @apiSuccess {Number}     id              The activity ID.
 * @apiSuccess {String}     name         	Name of activity.
 * @apiSuccess {String}     description     Description of activity
 * @apiSuccess {Boolean}    isCompleted     Activity complete status
 * @apiSuccess {Boolean}    isDeleted       Activity exist or not into the system.
 * @apiSuccess {Date}       createdOn       Activity creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Activity into the system.
 * @apiSuccess {Date}       editedOn        Activity edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Activity details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
{
	"id": 1,
	"name": "Team Create",
	"description": "We have to create team"
	"isCompleted": 1,
	"isDeleted": 0,
	"createdOn": "2016-06-08T09:24:16.000Z",
	"createdBy": "Prime Prime",
	"editedOn": "2016-06-30T04:33:14.000Z",
	"editedBy" : "Prime Prime"
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
 * @apiError FORBIDDEN When user already exist with same id.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 403 FORBIDDEN
 *     {
 *       "message": "Invalid notification Id for logged in user"
 *     }
 * 
 *
 *
 */
app.put('/:id', function(req,res){
	logger.info("Update Activity request received");

	var data = req.data;
	data.id = req.params.id;
	var model = activityConverter.getRequestToModel(data);

	activityService.updateActivity(data, function(err, status, data){
		return response(err, status, data, res);
	});
});
/**
 * @api {post} /notification/activities/:id/users Assign user to activity
 * @apiName  Assign user to activity
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API adds user to activity. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Array}     userIds          The usersIds assign to activity.
 * 
 * @apiParamExample {json} Request-Example:
 {
 	"userIds":[66,144]
 }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/activities/14/users
 * 
 * @apiSuccess {String}     message              User assigned to activity successfully

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
{
	"message":"User assigned to activity successfully"
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
 *
 *
 */
app.post('/:id/users', function(req,res){
	logger.info("Assign users to Activity request received");

	var data = req.data;
	data.id = req.params.id;

	activityService.assignUserToActivity(data, function(err, status, data){
		return response(err, status, data, res);
	});
});

/**
 * @api {get} /notification/activities/:id/users Get users assigned to Activity
 * @apiName Get users assigned to Activity
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API get users assigned to the activity. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/activities/14/users
 * 
 * @apiSuccess {Number}     userId          The user id.
 * @apiSuccess {String}     name         	The user name.
 * @apiSuccess {String}     role     		The role name of user.
 * @apiSuccess {Boolean}    status     		User status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[{
	"userId": 66,
	"userName": "Demo Unit",
	"role": "Rep Manag1er",
	"status": 1
}]

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
app.get('/:id/users', function(req,res){
	logger.info("Get assigned user to Activity request received");

	var data = req.data;
	data.id = req.params.id;

	activityService.getAssignedUserToActivity(data, function(err, status, data){
		return response(err, status, data, res);
	});
})
module.exports = app;