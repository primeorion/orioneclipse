"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var notificationService = new (require('service/notification/NotificationService.js'))();
var NotificationConverter = require('converter/notification/NotificationConverter.js');

var notificationConverter = new NotificationConverter();

var logger = helper.logger(moduleName);
var validate = helper.validate;

var readNotificationSchema = {
    type: 'object',
    properties: {
        ids: {
            type: 'array',
            items: {
                type: 'number',
                required: true
            },
            required: true
        },
        readStatus:{
            enum : [0,1, true, false],
            required: true
        }
    }
};
/**
 * @api {get} /notification/notifications?search={id} Search Notifications 
 * @apiName SearchNotification
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API search notifications. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/notifications?search=1
 * 
 * @apiSuccess {Number}     id              The Notification ID.
 * @apiSuccess {String}     subject         Subject of the Notification.
 * @apiSuccess {String}     body        	Body of the Notification.
 * @apiSuccess {Boolean}    readStatus      Read Status of the Notification.
 * @apiSuccess {Object}     notificationCategory            Category of the Notification.
 * @apiSuccess {Object}     notificationCategoryType            Category Type of the Notification.
 * @apiSuccess {Boolean}    isDeleted       Notification exist or not into the system.
 * @apiSuccess {Date}       createdOn       Notification creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Notification into the system.
 * @apiSuccess {Date}       editedOn        Notification edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Notification details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[
	{
	"id": 1,
	"subject": "Trading",
	"body": "10 Trades happened successfully"
	"readStatus": 1,
    "notificationCategory": {
        "id": 1,
        "name":"Trading"
    },
    "notificationCategoryType":{
        "id": 1,
        "name": "Trading Faliure",
        "code": "TRADEGEN"
    },
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
 * @api {get} /notification/notifications Get Notifications List
 * @apiName Get Notification List
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API get notifications list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/notifications
 * 
 * @apiSuccess {Number}     id              The Notification ID.
 * @apiSuccess {String}     subject         Subject of the Notification.
 * @apiSuccess {String}     body        	Body of the Notification.
 * @apiSuccess {Boolean}    readStatus      Read Status of the Notification.
 * @apiSuccess {Object}     notificationCategory            Category of the Notification.
 * @apiSuccess {Object}     notificationCategoryType            Category Type of the Notification.
 * @apiSuccess {Boolean}    isDeleted       Notification exist or not into the system.
 * @apiSuccess {Date}       createdOn       Notification creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Notification into the system.
 * @apiSuccess {Date}       editedOn        Notification edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Notification details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[{
    "id": 1,
    "subject": "Trading",
    "body": "10 Trades happened successfully"
    "readStatus": 1,
    "notificationCategory": {
        "id": 1,
        "name":"Trading"
    },
    "notificationCategoryType":{
        "id": 1,
        "name": "Trading Faliure",
        "code": "TRADEGEN"
    },
    "isDeleted": 0,
    "createdOn": "2016-06-08T09:24:16.000Z",
    "createdBy": "Prime Prime",
    "editedOn": "2016-06-30T04:33:14.000Z",
    "editedBy" : "Prime Prime"
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


app.get('/',  function (req, res) {
	logger.info("Get all notifications request received");

    var data = req.data;
    data.id = req.query.search;

    var model = notificationConverter.getRequestToModel(data);

    notificationService.getNotificationList(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /notification/notifications/read Read Notification
 * @apiName Read Notification
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API adds Notification into application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
{
  "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
  "Content-Type" : application/json
}
 * 
 * @apiParam {Array}     ids          The notification Id to read.
 * @apiParam {Boolean}   readStatus    Read/Unread notifications. 
 * 
 * @apiParamExample {json} Request-Example:
{
    "ids":[1122,234],
    "readStatus": 0
}
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/notifications/read
 * 
 * @apiSuccess {String}     message           Notification read successfully by user.
 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
{
    "message" : "Notification read successfully by user"
}
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
{
    "message": "Invalid Authorization Header"
}
 * 
 * @apiError FORBIDDEN When user already exist with same id.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 403 FORBIDDEN
{
    "message": "Invalid notification Id for logged in user"
}
 * 
 *
 *
 */

app.put('/read', validate({ body: readNotificationSchema }), function (req, res) {
    logger.info("Read notifications request received");

    var data = req.data;
    data.ids = req.body.ids;
    logger.debug("the data in controller"+JSON.stringify(data));
    var model = notificationConverter.getRequestToModel(data);
    logger.debug("the model in controller"+JSON.stringify(model));
    notificationService.readNotification(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {delete} /notification/notifications/:id Delete notification
 * @apiName Delete notification 
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API deletes (soft delete) notification for logged in user from application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/notifications/324578
 * 
 * @apiSuccess {String}     message            Notification deleted message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     
 *    {
        "message": "Notification deleted successfully"
      }
 *
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *  
 * @apiError Not_Found When notification does not exist or already deleted.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
         "message": "Notification does not exist or already deleted"
       }
 *
 */
app.delete('/:id',  function (req, res) {
    logger.info("Delete user notifications request received");

    var data = req.data;
    data.id = req.params.id;

    var model = notificationConverter.getRequestToModel(data);

    notificationService.deleteUserNotification(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.delete('/action/notificationcategorytype', function (req, res){
    logger.info("Delete notification category type from cache request received");
    notificationService.deleteNotificationCategoryTypeFromCache(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**
 * @api {get} /notification/notifications/topics Get subscribed notification topics
 * @apiName Get subscribed notification topics
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API get subscribed notifications topic list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/notifications/topics
 * 
 * @apiSuccess {Number}     id                          Notification category type id.
 * @apiSuccess {String}     name                        Notification category type name.
 * @apiSuccess {String}     code                        Notification category type code.
 * @apiSuccess {String}     description                 Notification category type description.
 * @apiSuccess {String}     subject                     Notification category type subject.
 * @apiSuccess {Number}     deliveryMode                Notification category type delivery mode.
 * @apiSuccess {Number}     notificationCategoryId      Notification category id.
 * @apiSuccess {String}     notificationCategoryName    Notification category name.
 * @apiSuccess {Boolean}    enabled                     Notification enable status
 * @apiSuccess {Boolean}    sendEmail                   Send mail for notification check
 * @apiSuccess {Boolean}    isDeleted                   Notification subscription exist or not into the system.
 * @apiSuccess {Date}       createdOn                   Notification subscription creation date into application.
 * @apiSuccess {Date}       editedOn                    Notification subscription edit date into application.
 * @apiSuccess {Number}     createdBy                   Full Name of user who created the user subscription for Notification into the system.
 * @apiSuccess {Number}     editedBy                    Full Name of user who edited the user subscription for Notification into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[
  {
    "id": 1,
    "name": "Trade Generation",
    "code": "TRADEGEN",
    "description": "Once Trade generation process is complete, all the failures (Errors and Warnings) count should be updated on Notification window.",
    "subject": "Trade Genration Notification",
    "deliveryMode": 4,
    "notificationCategoryId": 1,
    "notificationCategoryName": "Trading",
    "enabled": 1,
    "sendEmail": 1,
    "isDeleted": 1,
    "createdOn": null,
    "editedOn": "2016-11-05T06:42:31.000Z",
    "createdBy": "prime@tgi.com",
    "editedBy": "prime@tgi.com"
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
 *
 */

app.get('/topics', function (req,res){
    logger.info("Get logged in user topics request received");
    notificationService.getLoggedInUserNotificationSubscriptions(req.data, function(err, status, data){
        return response(err, status, data, res);
    });
});
/**
 * @api {put} /notification/notifications/topics Subscribe Notification Topic
 * @apiName Subscribe Notification Topic
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API adds Orion Connect User into application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}   email                   The email of login User on which notifications will be send.
 * @apiParam {Array}     notificationTopics          The notification topics to subscribe.
 * 
 * @apiParamExample {json} Request-Example:
{
    "email":"test@gmail.com",
    "notificationTopics":
    [
        {
            "id":1,
            "isEnable":1,
            "isEmail":1
        }
    ]
}
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/notifications/topics
 * 
 * @apiSuccess {String}     message           Notification Category Types subscribed successfully
 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "message" : "Notification Category Types subscribed successfully"
 *     }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 */
app.put('/topics', function (req,res){
    logger.info("Add logged in user topics request received");
    notificationService.addLoggedInUserNotificationSubscription(req.data, function(err, status, data){
        return response(err, status, data, res);
    });
});
/**
 * @api {delete} /notification/notifications/topics/2 Unsubscribe Notification Topic
 * @apiName Unsubscribe Notification Topic
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API unsubscribe logged in user from notificationCategoryTypeId 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/notifications/topics/2
 * 
 * @apiSuccess {String}     message            User unsubscribed from notificationCategoryTypeId.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     
{
    "message": "Notification category type unsubscribed successfully"
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
 * @apiError Not_Found When Notification category type id is not subscribed for user.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
{
    "message": "Notification category type id is not subscribed for user"
}
 *
 */

app.delete('/topics/:id', function (req,res){
    logger.info("Remove logged in user topics request received");
    var data = req.data;
    data.notificationCategoryTypeId = req.params.id;

    notificationService.deleteLoggedInUserNotificationSubscription(data, function(err, status, data){
        return response(err, status, data, res);
    });
});
/**
 * @api {get} /notification/notifications/topics/master Get all notification topics
 * @apiName Get all notification topics
 * @apiVersion 1.0.0
 * @apiGroup Notifications
 * @apiPermission appuser
 *
 * @apiDescription This API get notifications topic list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/notification/notifications/topics/master
 * 
 * @apiSuccess {Number}         id                          Notification category type id.
 * @apiSuccess {String}         name                        Notification category type name.
 * @apiSuccess {String}         code                        Notification category type code.
 * @apiSuccess {String}         subject                     Notification category Type subject.
 * @apiSuccess {Number}         notificationCategoryId      Notification category id
 * @apiSuccess {String}         notificationCategoryName    Notification category name
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[
   {
    "id": 1,
    "name": "Trade Generation",
    "code": "TRADEGEN",
    "description": "Once Trade generation process is complete, all the failures (Errors and Warnings) count should be updated on Notification window.",
    "subject": "Trade Genration Notification",
    "notificationCategoryId": 1,
    "notificationCategoryName": "Trading"
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
 *
 */
app.get('/topics/master', function (req,res){
    logger.info("Get topics request received");
    notificationService.getNotificationCategoryTypeList(req.data, function(err, status, data){
        return response(err, status, data, res);
    });
});
app.post('/', function (req,res){
    notificationService.createAndSendNotification(req.data, function(err, status, data){
        return response(err, status, data, res);
    });
});
module.exports = app;