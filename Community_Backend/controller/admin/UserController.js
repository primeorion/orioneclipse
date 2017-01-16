"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');
var config = require('config');

var response = require('controller/ResponseController.js');
var UserRequest = require("model/user/UserRequest.js");
var UserConverter = require("converter/user/UserConverter.js");
var UserService = require('service/admin/UserService.js');
var UserDao = require('dao/admin/UserDao.js');
var userDao = new UserDao();
var validate = helper.validate;
var logger = helper.logger(moduleName);

var userService = new UserService();
var userConverter = new UserConverter();

var postUserSchema = {
    type: 'object',
    properties: {
        orionUserId: {
            type: 'number',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        roleId: {
            type: 'number',
            required: true
        },
        email: {
            type: 'string',
            format: 'email'
        },
        userLoginId: {
            type: 'string',
            required: true
        },
        teamIds: {
            type: 'array',
            items: {
                type: 'number',
                required: true
            },
            required: true
        },
        status: {
        	enum : [0,1, true, false]
        },
        startDate: {
            type: 'string',
            is: 'date'
        },
        expireDate: {
            type: 'string',
            is: 'date'
        }
    }
};
var putUserSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        roleId: {
            type: 'number',
            required: true
        },
        email: {
            type: 'string',
            format: 'email'
        },
        userLoginId: {
            type: 'string',
            required: true
        },
        teamIds: {
            type: 'array',
            items: {
                type: 'number',
                required: true
            },
            required: true
        },
        status: {
        	enum : [0,1, true, false]
        },
        startDate: {
            type: 'string',
            is: 'date'
        },
        expireDate: {
            type: 'string',
            is: 'date'
        }
    }
};

var userIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}

var userToTeamIdSchema = {
    type: 'object',
    properties: {
        userId: {
            type: 'string',
            is: 'numeric',
            required: true
        },
        teamId: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}

var userToRoleIdSchema = {
    type: 'object',
    properties: {
        userId: {
            type: 'string',
            is: 'numeric',
            required: true
        },
        roleId: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}

var userToFirmIdSchema = {
    type: 'object',
    properties: {
        userId: {
            type: 'string',
            is: 'numeric',
            required: true
        },
        firmId: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}
/**@apiIgnore
 * @api {get} /admin/users?search={id/name} Search Users 
 * @apiName SearchUsers
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiPermission appuser
 *
 * @apiDescription This API search user. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users?search=370925
 * 
 * @apiSuccess {Number}     id              The User Id.
 * @apiSuccess {Date}       name            Full Name of the User.
 * @apiSuccess {Number}     orionUserId          The user orion connect external id.
 * @apiSuccess {Boolean}    status          User status - Active/Inactive.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {String}     userLoginId     User Login id.
 * @apiSuccess {String}     role            User role details.
 * @apiSuccess {String[]}   teams           User teams details.
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       startDate       Date from which user will be active in system.
 * @apiSuccess {Date}       expireDate      Date after which user will be inactive in system.
 * @apiSuccess {Date}       createdOn       User creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn        User edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
        "id": 34,
        "name": "RajneeshFinalTest ",
        "orionUserId": 33,
        "status": 0,
        "email": "param1@gmail.com",
        "userLoginId": "prime@tgi.com",
        "role": {
          "id": 170,
          "name": "Agent Manager"
        },
        "teams": [
          {
            "id": 30,
            "name": "newestteam"
          },
          {
            "id": 38,
            "name": "newest team2"
          },
          {
            "id": 40,
            "name": "11"
          }
        ],
        "startDate": "2016-01-03T18:30:00.000Z",
        "expireDate": "2050-12-30T18:30:00.000Z",
        "isDeleted": 0,
        "createdOn": "2016-07-07T01:17:52.000Z",
        "createdBy": "Prime Prime",
        "editedOn": "2016-07-09T02:00:47.000Z",
        "editedBy": "Prime Prime"
      }]
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
 * @api {get} /admin/users Get All Users 
 * @apiName GetAllUsers
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiPermission appuser
 *
 * @apiDescription This API gets user list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users
 * 
 * @apiSuccess {Number}     id              The User Id.
 * @apiSuccess {Date}       name            Full Name of the User.
 * @apiSuccess {Number}     orionUserId          The user orion connect external id.
 * @apiSuccess {Boolean}    status          User status - Active/Inactive.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {String}     userLoginId     User Login id.
 * @apiSuccess {String}     role            User role details.
 * @apiSuccess {String[]}   teams           User teams details.
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       startDate       Date from which user will be active in system.
 * @apiSuccess {Date}       expireDate      Date after which user will be inactive in system.
 * @apiSuccess {Date}       createdOn       User creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn        User edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
        "id": 34,
        "name": "RajneeshFinalTest ",
        "orionUserId": 33,
        "status": 0,
        "email": "param1@gmail.com",
        "userLoginId": "prime@tgi.com",
        "role": {
          "id": 170,
          "name": "Agent Manager"
        },
        "teams": [
          {
            "id": 30,
            "name": "newestteam"
          },
          {
            "id": 38,
            "name": "newest team2"
          },
          {
            "id": 40,
            "name": "11"
          }
        ],
        "startDate": "2016-01-03T18:30:00.000Z",
        "expireDate": "2050-12-30T18:30:00.000Z",
        "isDeleted": 0,
        "createdOn": "2016-07-07T01:17:52.000Z",
        "createdBy": "Prime Prime",
        "editedOn": "2016-07-09T02:00:47.000Z",
        "editedBy": "Prime Prime"
      }]
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
    logger.info("Get users request received");
    
    var data = req.data;
    var model = userConverter.getRequestToModel(data);
    
    userService.getUserList(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});




/**@apiIgnore
 * @api {get} /admin/users/connect/:loginUserId Get User From Orion Connect
 * @apiName GetUserDetailFromOrionConnect
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiPermission appuser
 *
 * @apiDescription This API searches user in Orion Connect.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users/connect/john
 * 
 * @apiSuccess {String}     userName              Orion connect userName
 * @apiSuccess {number}     loginUserId           Orion connect user login id
 * @apiSuccess {number}     userId                Orion connect user id
 * @apiSuccess {number}     userDetailId          Orion connect user detail Id  
 * @apiSuccess {String}     selected              Orion connect user selected value 
 * @apiSuccess {String}     userGuid              Orion connect user GUID
 * @apiSuccess {String}     entity                Orion connect user entity value
 * @apiSuccess {String}     entityId              Orion connect user entity Id
 * @apiSuccess {String}     entityName            Orion connect user entity name
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     
 *    [
        {
            "userName": "Leyboldt, Joe",
            "loginUserId": "joe.leyboldt",
            "userId": 2801,
            "userDetailId": 186055,
            "selected": false,
            "userGuid": "20af52c4-0bed-4da9-97b6-29bd639536ac",
            "entity": "Administrator",
            "entityId": null,
            "entityName": "Leyboldt, Joe"
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
app.get('/connect/:loginUserId', function (req, res) {
    logger.info("Get user details from orion connect request received");
    
    var data = req.data;
    data.loginUserId = req.params.loginUserId;
    
    userService.searchUserFromConnect(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {post} /admin/users Add User
 * @apiName AddUser
 * @apiVersion 1.0.0
 * @apiGroup Users
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
 * @apiParam {Number}     orionUserId          The user orion connect external id.
 * @apiParam {String}       name            Full name of the User.
 * @apiParam {String}       email           User email id.
 * @apiParam {String}     userLoginId     User Login id.
 * @apiParam {Number}       roleId          Actual role Id.
 * @apiParam {String[]}     teamIds         Actual team Id.
 * @apiParam {Boolean}       status          User status - Active/Inactive.
 * @apiParam {Date}         startDate       User started date into application.
 * @apiParam {Date}         expireDate      User expired date into application.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *        "orionUserId":1122,
 *        "name": "param singh",
 *        "email": "param1@gmail.com",
 *        "userLoginId": "prime@tgi.com",
 *        "roleId":1,
 *        "teamIds":[1,2],
 *        "status": 0,
 *        "startDate": "05/12/2016",
 *        "expireDate": "12/22/2016"
 *    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users
 * 
 * @apiSuccess {Number}     id              The User Id.
 * @apiSuccess {Date}       name            Full Name of the User.
 * @apiSuccess {Number}     orionUserId          The user orion connect external id.
 * @apiSuccess {Boolean}    status          User status - Active/Inactive.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {String}     userLoginId     User Login id.
 * @apiSuccess {String}     role            User role details.
 * @apiSuccess {String[]}   teams           User teams details.
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       startDate       Date from which user will be active in system.
 * @apiSuccess {Date}       expireDate      Date after which user will be inactive in system.
 * @apiSuccess {Date}       createdOn       User creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn        User edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
        "id": 34,
        "name": "RajneeshFinalTest ",
        "orionUserId": 33,
        "status": 0,
        "email": "param1@gmail.com",
        "userLoginId": "prime@tgi.com",
        "role": {
          "id": 170,
          "name": "Agent Manager"
        },
        "teams": [
          {
            "id": 30,
            "name": "newestteam"
          },
          {
            "id": 38,
            "name": "newest team2"
          },
          {
            "id": 40,
            "name": "11"
          }
        ],
        "startDate": "2016-01-03T18:30:00.000Z",
        "expireDate": "2050-12-30T18:30:00.000Z",
        "isDeleted": 0,
        "createdOn": "2016-07-07T01:17:52.000Z",
        "createdBy": "Prime Prime",
        "editedOn": "2016-07-09T02:00:47.000Z",
        "editedBy": "Prime Prime"
      }]
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
 * @apiError Unprocessable_Entity When user already exist with same id.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "User already exist with same id"
 *     }
 * 
 * @apiError Not_Found ,When user does not exist.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
         "message": "User does not exist"
       }
 *
 *
 */

 app.post('/', validate({ body: postUserSchema }), function (req, res) {
    logger.info("Create user request received");
    
    var data = req.data;
    var model = userConverter.getRequestToModel(data);
    model.token = req.data.token;
    userService.addUser(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {put} /admin/users/:id Update User
 * @apiName UpdateUser
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiPermission appuser
 *
 * @apiDescription This API updates user details. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the User.
 * @apiParam {String}       email           User email id.
 * @apiParam {String}     userLoginId     User Login id.
 * @apiParam {Number}       roleId          Actual role Id.
 * @apiParam {String[]}     teamIds         Actual team Id.
 * @apiParam {Boolean}      status         User status - Active/Inactive.
 * @apiParam {Date}         startDate       User started date into application.
 * @apiParam {Date}         expireDate      User expired date into application.
 * 
 * @apiParamExample {json} Request-Example:
 *   {
 *      "name": "param singh",
 *      "email": "param1@gmail.com",
 *      "userLoginId": "prime@tgi.com",
 *      "roleId":167,
 *      "teamIds":[27,2],
 *      "status": 0,
 *      "startDate":"06/22/2016",
 *      "expireDate":"12/25/2016"
 *   }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users/370925
 * 
 * @apiSuccess {Number}     id              The User Id.
 * @apiSuccess {Date}       name            Full Name of the User.
 * @apiSuccess {Number}     orionUserId          The user orion connect external id.
 * @apiSuccess {Boolean}    status          User status - Active/Inactive.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {String}     userLoginId     User Login id.
 * @apiSuccess {String}     role            User role details.
 * @apiSuccess {String[]}   teams           User teams details.
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       startDate       Date from which user will be active in system.
 * @apiSuccess {Date}       expireDate      Date after which user will be inactive in system.
 * @apiSuccess {Date}       createdOn       User creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn        User edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
        "id": 34,
        "name": "RajneeshFinalTest ",
        "orionUserId": 33,
        "status": 0,
        "email": "param1@gmail.com",
        "userLoginId": "prime@tgi.com",
        "role": {
          "id": 170,
          "name": "Agent Manager"
        },
        "teams": [
          {
            "id": 30,
            "name": "newestteam"
          },
          {
            "id": 38,
            "name": "newest team2"
          },
          {
            "id": 40,
            "name": "11"
          }
        ],
        "startDate": "2016-01-03T18:30:00.000Z",
        "expireDate": "2050-12-30T18:30:00.000Z",
        "isDeleted": 0,
        "createdOn": "2016-07-07T01:17:52.000Z",
        "createdBy": "Prime Prime",
        "editedOn": "2016-07-09T02:00:47.000Z",
        "editedBy": "Prime Prime"
      }]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When Invalid request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 *  
 * @apiError Not_Found When user does not exist.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
         "message": "User does not exist"
       }
 *
 */
 app.put('/:id', validate({ params: userIdSchema }), validate({ body: putUserSchema }), function (req, res) {
    logger.info("Update user details request received");

    var data = req.data;
    data.id = req.params.id;
    var model = userConverter.getRequestToModel(data);
    
    userService.updateUser(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {delete} /admin/users/:id Delete User
 * @apiName DeleteUser
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiPermission appuser
 *
 * @apiDescription This API deletes (soft delete) user in application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users/324578
 * 
 * @apiSuccess {String}     message            User deleted message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     
 *    {
        "message": "User deleted successfully"
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
 * @apiError Not_Found When user does not exist or already deleted.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
         "message": "User does not exist or already deleted"
       }
 *
 */
 app.delete('/:id', validate({ params: userIdSchema }), function (req, res) {
    logger.info("Delete user request received");
    
    var data = req.data;
    data.id = req.params.id;
    var model = userConverter.getRequestToModel(data);
    
    userService.deleteUser(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});


// Associate team and user
app.post('/:userId/teams/:teamId', validate({ params: userToTeamIdSchema }), function (req, res) {
    logger.info("Associate team and user request received");

    var data = req.data;
    data.teamId = req.params.teamId;
    data.id = req.params.userId;
    var model = userConverter.getRequestToModel(data);
    
    userService.assignUserToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

// Associate roles and user
app.post('/:userId/roles/:roleId', validate({ params: userToRoleIdSchema }), function (req, res) {
    logger.info("Assign role to use user request received");

    var data = req.data;
    data.roleId = req.params.roleId;
    data.id = req.params.userId;
    var model = userConverter.getRequestToModel(data);
    
    userService.assignRoleToUser(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

//Associate User and Firm
app.post('/:userId/firms/:firmId', validate({ params: userToFirmIdSchema }), function (req, res) {
    logger.info("Assign user to firm request received");

    var data = req.data;
    data.firmId = req.params.firmId;
    data.id = req.params.userId;
    var model = userConverter.getRequestToModel(data);
    
    userService.assignUserToFirm(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {get} /admin/users/:userId/privileges Get User Privileges
 * @apiName GetUserPrivileges
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiPermission appuser
 *
 * @apiDescription This API gets user privileges. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users/324578/privileges
 * 
 * @apiSuccess {number}         id                    Privilege id.
 * @apiSuccess {String}         name                  Privilege name.
 * @apiSuccess {Boolean}        canAdd                Can Add - 0/1.
 * @apiSuccess {Boolean}        canUpdate             Can Update - 0/1.
 * @apiSuccess {Boolean}        canRead               Can Read - 0/1.
 * @apiSuccess {Boolean}        canDelete             Can Delete - 0/1.
 * @apiSuccess {Boolean}        isDeleted             User Privilege exist or not in system - 0/1.
 * @apiSuccess {Date}           createdOn             User Privilege creation date into application.
 * @apiSuccess {Number}         createdBy             Full Name of user who created the User Privilege into the system.
 * @apiSuccess {Date}           editedOn              User Privilege edited date into application.
 * @apiSuccess {String}         editedBy              Full Name of user who edited the User Privilege into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     
 *     [
          {
            "id": 57,
            "name": "Teams",
            "canAdd": 1,
            "canUpdate": 1,
            "canDelete": 1,
            "canRead": 1,
            "isDeleted": 0,
            "createdOn": "0000-00-00 00:00:00",
            "createdBy": "rahyikg TGI",
            "editedOn": "2016-07-14T07:48:16.000Z",
            "editedBy": "Prime Prime"
          }
        ]
 *
 * @apiError Unauthorized ,Invalid / without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *  
 * @apiError Not_Found ,When user does not exist.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
         "message": "User does not exist"
       }
 *
 */
 app.get('/:id/privileges', validate({ params: userIdSchema }), function (req, res) {
    logger.info("Get user privileges request received");

    var data = req.data;
    data.id = req.params.id;
    var model = userConverter.getRequestToModel(data);
    
    userService.getUserRoleandPrivilege(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {get} /admin/users/summary Get Users Summary 
 * @apiName GetUsersSummary
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiPermission appuser
 *
 * @apiDescription This API gets user summary. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users/summary
 * 
 * @apiSuccess {Number}     totalUsers                  Total Users
 * @apiSuccess {Number}     newUsers                    New Users
 * @apiSuccess {Number}     existingUsers               Existing Users
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
          "totalUsers": 38,
          "newUsers": 30,
          "existingUsers": 8
        }
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

 app.get('/summary', function (req, res) {
    logger.info("Get all user summary request recevied");

    var data = req.data;
    var model = userConverter.getRequestToModel(data);

    userService.getUserSummary(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**@apiIgnore
 * @api {get} /admin/users/:id Get User Details 
 * @apiName GetUsersDetail
 * @apiVersion 1.0.0
 * @apiGroup Users
 * @apiPermission appuser
 *
 * @apiDescription This API gets user details. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/users/370925
 * @apiSuccess {String}     id              The User Id.
 * @apiSuccess {Date}       name            Full Name of the User.
 * @apiSuccess {Number}     orionUserId          The user orion connect external id.
 * @apiSuccess {Boolean}    status          User status - Active/Inactive.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {String}     userLoginId     User Login id.
 * @apiSuccess {String}     role            User role details.
 * @apiSuccess {String[]}   teams           User teams details.
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       startDate       Date from which user will be active in system.
 * @apiSuccess {Date}       expireDate      Date after which user will be inactive in system.
 * @apiSuccess {Date}       createdOn       User creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn        User edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
        "id": 34,
        "name": "Paramveer Singh",
        "orionUserId": 33,
        "status": 0,
        "email": "param1@gmail.com",
        "userLoginId": "karam@gmail.com"
        "role": {
          "id": 170,
          "name": "Agent Manager"
        },
        "teams": [
          {
            "id": 30,
            "name": "newestteam"
          },
          {
            "id": 38,
            "name": "newest team2"
          },
          {
            "id": 40,
            "name": "11"
          }
        ],
        "startDate": "2016-01-03T18:30:00.000Z",
        "expireDate": "2050-12-30T18:30:00.000Z",
        "isDeleted": 0,
        "createdOn": "2016-07-07T01:17:52.000Z",
        "createdBy": "Prime Prime",
        "editedOn": "2016-07-09T02:00:47.000Z",
        "editedBy": "Prime Prime"
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
 * @apiError Not Found Invalid UserId.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
         "message": "User does not exist"
       }
 *     
 */
 app.get('/:id', validate({ params: userIdSchema }), function (req, res) {
    logger.info("Get user details request received");

    var data = req.data;
    data.id = req.params.id;
    var model = userConverter.getRequestToModel(data);
    
    userService.getUserDetail(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});


 module.exports = app;