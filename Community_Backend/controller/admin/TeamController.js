"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var TeamService = require('service/admin/TeamService.js');
var TeamConverter = require("converter/team/TeamConverter.js");

var teamService = new TeamService();
var teamConverter = new TeamConverter();

var logger = helper.logger(moduleName);
var validate = helper.validate;

var teamBodySchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        portfolioAccess: {
        	enum : [0,1, true, false],
            required: true
        },
        modelAccess: {
        	enum : [0,1, true, false],
            required: true
        },
        status: {
            enum : [0,1, true, false],
             required: true
        }
    }
};
var teamIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
};

var userSchema = {
    type: 'object',
    properties: {
        userIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: true
        }
    }
};
var portfolioSchema = {
    type: 'object',
    properties: {
        portfolioIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: true
        }
    }
};
var modelSchema = {
    type: 'object',
    properties: {
        modelIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: true
        }
    }
};
var advisorSchema = {
    type: 'object',
    properties: {
        advisorIds: {
            type: 'array',
            items: {
                type: 'number'
            },
            required: true
        }
    }
};
var teamReassignSchema = {
		type : 'object',
		properties : {
			oldId : {
				type : 'number',
				required : true
			},
			newId : {
				type : 'number',
				required : true
			}
		}
};
/**@apiIgnore
 * @api {get} /admin/teams?search={id/name} Search Teams 
 * @apiName  SearchTeams
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API search Team. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams?search=1
 * 
 * @apiSuccess {Number}     id                      The Team Id.
 * @apiSuccess {String}     name                    Name of the Team.
 * @apiSuccess {Number}     portfolioAccess         Portfolio Access - 1/0.
 * @apiSuccess {Number}     modelAccess             Model Access - 1/0
 * @apiSuccess {Boolean}     status                  Team status - 1/0.
 * @apiSuccess {Number}     numberOfUsers           Number of Users associated with Team.
 * @apiSuccess {Number}     numberOfModels          Number of Models associated with Team.
 * @apiSuccess {Number}     numberOfPortfolios      Number of Portfolios associated with Team.
 * @apiSuccess {Number}     numberOfAdvisors        Number of Advisors associated with Team.
 * @apiSuccess {Boolean}     isDeleted               Team exist or not into the system.
 * @apiSuccess {Date}       createdOn               Team creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the team into the system.
 * @apiSuccess {Date}       editedOn                Team edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Team into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 1,
                "name": "paxcel team",
                "portfolioAccess": 1,
                "modelAccess": 1,
                "status":1,
                "numberOfUsers": 16,
                "numberOfModels": 0,
                "numberOfPortfolios": 1,
                "numberOfAdvisors": 0,
                 "isDeleted": 0,
                "createdOn": "2016-06-17T05:57:22.000Z",
                "createdBy": "Prime Prime",
                "editedOn": "2016-07-06T10:40:45.000Z",
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
 *
 */
/**@apiIgnore
 * @api {get} /admin/teams Get All Teams 
 * @apiName  GetAllTeams
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API gets All Team List. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams
 * 
 * @apiSuccess {Number}     id                      The Team Id.
 * @apiSuccess {String}     name                    Name of the Team.
 * @apiSuccess {Number}     portfolioAccess         Portfolio Access - 1/0.
 * @apiSuccess {Number}     modelAccess             Model Access - 1/0
 * @apiSuccess {Boolean}     status                  Team status - 1/0.
 * @apiSuccess {Number}     numberOfUsers           Number of Users associated with Team.
 * @apiSuccess {Number}     numberOfModels          Number of Models associated with Team.
 * @apiSuccess {Number}     numberOfPortfolios      Number of Portfolios associated with Team.
 * @apiSuccess {Number}     numberOfAdvisors        Number of Advisors associated with Team.
 * @apiSuccess {Boolean}     isDeleted               Team exist or not into the system.
 * @apiSuccess {Date}       createdOn               Team creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the team into the system.
 * @apiSuccess {Date}       editedOn                Team edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Team into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 1,
                "name": "paxcel team",
                "portfolioAccess": 1,
                "modelAccess": 1,
                "status":1,
                "numberOfUsers": 16,
                "numberOfModels": 0,
                "numberOfPortfolios": 1,
                "numberOfAdvisors": 0,
                "isDeleted": 0,
                "createdOn": "2016-06-17T05:57:22.000Z",
                "createdBy": "Prime Prime",
                "editedOn": "2016-07-06T10:40:45.000Z",
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
 *
 */

app.get('/', function (req, res) {
   	logger.info("Get all teams request received");

    var data = req.data;
    var model = teamConverter.getRequestToModel(data);
    teamService.getTeamList(model, function (err, status, data) {
        return response(err, status, data, res);
    });

});


/**@apiIgnore
 * @api {post} /admin/teams Add Team
 * @apiName  AddTeam.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API Adds Team. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {String}       name                 Name of the Team.
 * @apiParam {number}       portfolioAccess      Portfolio Access - 1/0.
 * @apiParam {number}       modelAccess          Model Access - 1/0.
 * @apiParam {Boolean}      status               Team status - 1/0.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
         "name":"newest team1",
         "portfolioAccess":1,
         "modelAccess":1,
         "status":1   
        }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams
 * 
 * @apiSuccess {Number}     id                      The Team Id.
 * @apiSuccess {String}     name                    Name of the Team.
 * @apiSuccess {Number}     portfolioAccess         Portfolio Access - 1/0.
 * @apiSuccess {Number}     modelAccess             Model Access - 1/0
 * @apiSuccess {Boolean}     status                  Team status - 1/0.
 * @apiSuccess {Number}     numberOfUsers           Number of Users associated with Team.
 * @apiSuccess {Number}     numberOfModels          Number of Models associated with Team.
 * @apiSuccess {Number}     numberOfPortfolios      Number of Portfolios associated with Team.
 * @apiSuccess {Number}     numberOfAdvisors        Number of Advisors associated with Team.
 * @apiSuccess {Boolean}     isDeleted               Team exist or not into the system.
 * @apiSuccess {Date}       createdOn               Team creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Team into the system.
 * @apiSuccess {Date}       editedOn                Team edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Team details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
        [
            {
                "id": 1,
                "name": "paxcel team",
                "portfolioAccess": 1,
                "modelAccess": 1,
                "status": 0,
                "numberOfUsers": 16,
                "numberOfModels": 0,
                "numberOfPortfolios": 1,
                "numberOfAdvisors": 0,
                "isDeleted": 0,
                "createdOn": "2016-06-17T05:57:22.000Z",
                "createdBy": "Prime Prime",
                "editedOn": "2016-07-06T10:40:45.000Z",
                "editedBy": "Prime Prime"
            }
        ]
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
 * @apiError Unprocessable_Entity When team already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Team already exist with same name"
 *     }
 * 
 */

app.post('/', validate({ body: teamBodySchema }), function (req, res) {
   	logger.info("Create team request received");

    var data = req.data;
    var model = teamConverter.getRequestToModel(data);

    teamService.addTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {put} /admin/teams/:id Update Team
 * @apiName  UpdateTeam.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API Update Team. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {String}       name                 Name of the Team.
 * @apiParam {number}       portfolioAccess      Portfolio Access - 1/0.
 * @apiParam {number}       modelAccess          Model Access - 1/0
 * @apiParam {Boolean}     status               Team status - 1/0.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
         "name":"newest team1",
         "portfolioAccess":1,
         "modelAccess":1,
         "status":1
                
        }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/1
 * 
 * @apiSuccess {Number}     id                      The Team Id.
 * @apiSuccess {String}     name                    Name of the Team.
 * @apiSuccess {Number}     portfolioAccess         Portfolio Access - 1/0.
 * @apiSuccess {Number}     modelAccess             Model Access - 1/0
 * @apiSuccess {Boolean}     status                  Team status - 1/0.
 * @apiSuccess {Number}     numberOfUsers           Number of Users associated with Team.
 * @apiSuccess {Number}     numberOfModels          Number of Models associated with Team.
 * @apiSuccess {Number}     numberOfPortfolios      Number of Portfolios associated with Team.
 * @apiSuccess {Number}     numberOfAdvisors        Number of Advisors associated with Team.
 * @apiSuccess {Boolean}     isDeleted               Team exist or not into the system.
 * @apiSuccess {Date}       createdOn               Team creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Team into the system.
 * @apiSuccess {Date}       editedOn                Team edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Team details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 1,
                "name": "paxcel team",
                "portfolioAccess": 1,
                "modelAccess": 1,
                "status":1,
                "numberOfUsers": 16,
                "numberOfModels": 0,
                "numberOfPortfolios": 1,
                "numberOfAdvisors": 0,
                "isDeleted": 0,
                "createdOn": "2016-06-17T05:57:22.000Z",
                "createdBy": "Prime Prime",
                "editedOn": "2016-07-06T10:40:45.000Z",
                "editedBy": "Prime Prime"
            }
        ]
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
 * @apiError Unprocessable_Entity When team already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Team already exist with same name"
 *     }
 */
app.put('/:id', validate({ body: teamBodySchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Update team details request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);
    
    teamService.updateTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {delete} /admin/teams/:id Delete Team
 * @apiName  DeleteTeam.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API Deletes Team. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/22
 * 
 * @apiSuccess {String}     message            Team delete message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Team deleted successfully"
        }
 *
  @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Not_Found When team does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Team does not exist"
 *     }
 */
app.delete('/:id', validate({ params: teamIdSchema }), function (req, res) {
   	logger.info("Delete team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);
    teamService.deleteTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {post} /admin/teams/:id/users Assign Users to Team
 * @apiName  AssignUsersToTeam.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API Assigns Users to Team.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {number[]}       userIds      List of User Ids.
 * 
 * @apiParamExample {json} Request-Example:
 * 
 *     { 
         "userIds":[{userId},{userId}] 
        }
 *
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/2/users
 * 
 * @apiSuccess {String}     message               Message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
      {
        "message": "User assigned to team successfully"
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
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 * 
 * @apiError Internal_Server_Error Internal Server Error.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 Internal_Server_Error
 *     {
 *       "message": ""Your request cannot be processed at the moment, please verify parameters"
 *     }
 */
app.post('/:id/users', validate({ body: userSchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Assign users to team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);
    
    teamService.assignUserToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {post} /admin/teams/:id/portfolios Assign Portfolios to Team
 * @apiName  AssignPortfoliosToTeam.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API Assigns Portfolios to team.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {number[]}       portfolioIds      Portfolio Ids.
 * 
 * @apiParamExample {json} Request-Example:
 * 
 *     {
         "portfolioIds":[{portfolioId},{portfolioId}]
        }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/1/portfolios
 * 
 * @apiSuccess {String}     message               Team Assign message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
      {
        "message": "Portfolio assigned to team successfully" 
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
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 * 
 * @apiError Internal_Server_Error Internal Server Error.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 Internal_Server_Error
 *     {
 *       "message": ""Your request cannot be processed at the moment, please verify parameters"
 *     }
 */
app.post('/:id/portfolios', validate({ body: portfolioSchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Assign portfolios to team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);
    
    teamService.assignPortfolioToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**@apiIgnore
 * @api {post} /admin/teams/:id/advisors Assign Advisors to Team
 * @apiName  AssignAdvisorsToTeam.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API Assigns Advisors to Team.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {number[]}       advisorIds      Advisor Ids.
 * 
 * @apiParamExample {json} Request-Example:
 * 
 *     {
          "advisorIds":[{advisorId},{advisorId}]
        }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/1/advisors
 * 
 * @apiSuccess {String}     message               Team Assign message.
 * 
 * @apiSuccessExample {json} Success-Response:
 * 
 *     HTTP/1.1 200 OK
      {
         "message": "Advisor assigned to team successfully" 
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
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 * 
 * @apiError Internal_Server_Error Internal Server Error.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 Internal_Server_Error
 *     {
 *       "message": ""Your request cannot be processed at the moment, please verify parameters"
 *     }
 */
app.post('/:id/advisors', validate({ body: advisorSchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Assign advisors to team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);
    
    teamService.assignAdvisorToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {post} /admin/teams/:id/models Assign Models to team
 * @apiName  AssignModelsToTeam.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API Assigns Models to team.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {number[]}       modelIds      Model Ids.
 * 
 * @apiParamExample {json} Request-Example:
 * 
 *    {
        "modelIds":[{modelId},{modelId}]
      }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/12/models
 * 
 * @apiSuccess {String}     message               Team Assign message.
 * 
 * @apiSuccessExample {json} Success-Response:
 * 
 *     HTTP/1.1 200 OK
      {
         "message": "Model assigned to team successfully"
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
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 * 
 * @apiError Internal_Server_Error Internal Server Error.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 Internal_Server_Error
 *     {
 *       "message": ""Your request cannot be processed at the moment, please verify parameters"
 *     }
 */

app.post('/:id/models', validate({ body: modelSchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Assign models to team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);
    
    teamService.assignModelToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**@apiIgnore
 * @api {get} /admin/teams/:id/users Get Team Users
 * @apiName  GetTeamUsers.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API gets Team Users.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/1/users
 * 
 * @apiSuccess {Number}     id                      User id.
 * @apiSuccess {String}     firstName               User FirstName.
 * @apiSuccess {String}     lastName                User LastName.
 * @apiSuccess {Date}       createdOn               Team creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Team into the system.
 * @apiSuccess {Date}       editedOn 	            Team edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Team details into the system.
  
 * 
 * @apiSuccessExample {json} Success-Response:
 * 
 *    HTTP/1.1 200 OK
      [
        {
            "id": 324578,
            "firstName": "parama",
            "lastName": "singha",
            "createdOn": "2016-06-30T04:53:37.000Z",
            "createdBy": 370925,
            "editedOn": "2016-06-30T04:53:37.000Z",
            "editedBy": 0
        }
      ]
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

app.get('/:id/users', validate({ params: teamIdSchema }), function (req, res) {
   	logger.info("Get all users of team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);

    teamService.getUserToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {get} /admin/teams/:id/portfolios Get Team Portfolios
 * @apiName  GetTeamPortfolios.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API gets Team Portfolios.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/1/portfolios
 * 
 * @apiSuccess {Number}     id                      Portfolio id.
 * @apiSuccess {String}     name                    Portfolio Name.
 * @apiSuccess {Boolean}     isDeleted              Portfolio exist or not into system.
 * @apiSuccess {Date}       createdOn               Team creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Team into the system.
 * @apiSuccess {Date}       editedOn 	            Team edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Team details into the system.
  
 * 
 * @apiSuccessExample {json} Success-Response:
 * 
 *    HTTP/1.1 200 OK
      [
        {
            "id": 1,
            "name": "Test Portfolio",
            "source": "Advisor",
            "isDeleted": 0,
            "createdOn": "2016-07-07T08:05:37.000Z",
            "createdBy": "Prime Prime",
            "editedOn": "2016-07-07T08:05:37.000Z",
            "editedBy": "Prime Prime"
          }
      ]
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
app.get('/:id/portfolios', validate({ params: teamIdSchema }), function (req, res) {
   	logger.info("Get all portfolios of team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);

    teamService.getPortfolioToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {get} /admin/teams/:id/advisors Get Team Advisors
 * @apiName  GetTeamAdvisors.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API gets Team Advisors.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/1/advisors
 * 
 * @apiSuccess {Number}     id                      User id.
 * @apiSuccess {String}     firstName               User FirstName.
 * @apiSuccess {String}     lastName                User LastName.
 * @apiSuccess {Boolean}     isDeleted              Advisor exist or not into system.
 * @apiSuccess {Date}       createdOn               Team creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Team into the system.
 * @apiSuccess {Date}       editedOn 	            Team edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Team details into the system.
  
 * 
 * @apiSuccessExample {json} Success-Response:
 * 
 *    HTTP/1.1 200 OK
      [
        {
            "id": 324578,
            "firstName": "parama",
            "lastName": "singha",
            "createdOn": "2016-06-30T04:53:37.000Z",
            "createdBy": 370925,
            "editedOn": "2016-06-30T04:53:37.000Z",
            "editedBy": 0
        }
      ]
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
 */
app.get('/:id/advisors', validate({ params: teamIdSchema }), function (req, res) {
   	logger.info("Get all advisors of team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);

    teamService.getAdvisorToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

//get team models
/**@apiIgnore
 * @api {get} /admin/teams/:id/models Get Team Models
 * @apiName  GetTeamModels.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API gets Team Models.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/1/models
 * 
 * @apiSuccess {Number}     id                      Model id.
 * @apiSuccess {String}     name                    Model Name.
 * @apiSuccess {Boolean}     isDeleted              Model exist or not into system.
 * @apiSuccess {Date}       createdOn               Team creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Team into the system.
 * @apiSuccess {Date}       editedOn 	            Team edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Team details into the system.
  
 * 
 * @apiSuccessExample {json} Success-Response:
 * 
 *    HTTP/1.1 200 OK
      [
        {
            "id": 1,
            "name": "Test Model",
            "isDeleted": 1,
            "createdOn": "2016-06-30T04:53:37.000Z",
            "createdBy": 370925,
            "editedOn": "2016-06-30T04:53:37.000Z",
            "editedBy": 0
        }
      ]
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

app.get('/:id/models', validate({ params: teamIdSchema }), function (req, res) {
   	logger.info("Get all models of team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);
    teamService.getModelToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

//Assign User to team
app.put('/:id/users', validate({ body: userSchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Assign users to team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);

    teamService.assignUserToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

//Assign Portfolio to team
app.put('/:id/portfolios', validate({ body: portfolioSchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Assign portfolios to team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);

    teamService.assignPortfolioToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

//Assign Advisor to team
app.put('/:id/advisors', validate({ body: advisorSchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Assign advisors to team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);

    teamService.assignAdvisorToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

//Assign Model to team
app.put('/:id/models', validate({ body: modelSchema }, { params: teamIdSchema }), function (req, res) {
   	logger.info("Assign models to team request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);

    teamService.assignModelToTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {post} /admin/teams/action/reassignTeam Re-Assign team
 * @apiName  Re-Assign Team.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API Re-Assigns Users from one team to another team.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {number}       oldId      Old Team Id.
 * @apiParam {number}       newId      New Team Id.
 * 
 * @apiParamExample {json} Request-Example:
 * 
 *    {
        "oldId":{oldId},
        "newId":{newId}
      }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/action/reassignTeam
 * 
 * @apiSuccess {String}     message               Team Re-Assign message.
 * 
 * @apiSuccessExample {json} Success-Response:
 * 
 *     HTTP/1.1 200 OK
      {
         "message": "Team reassigned successfully"
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
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 * 
 * @apiError Internal_Server_Error Internal Server Error.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 Internal_Server_Error
 *     {
 *       "message": ""Your request cannot be processed at the moment, please verify parameters"
 *     }
 */
app.post('/action/reassignTeam', validate( {body : teamReassignSchema} ), function (req, res) {
   	logger.info("Reassign user to new team request received");

   	var data = req.data;
   	var model = teamConverter.getRequestToModel(data);

    teamService.reassignTeam(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore
 * @api {get} /admin/teams/summary Get Teams Summary 
 * @apiName GetTeamsSummary
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API gets team summary. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/summary
 * 
 * @apiSuccess {Number}     id                  The custodian ID.
 * @apiSuccess {String}     name                Name of the Custodian.
 * @apiSuccess {String}     code                Code of the Custodian.
 * @apiSuccess {String}     accountNumber       Account number of the Custodian.
 * @apiSuccess {Boolean}     isDeleted           Custodian exist or not into the system.
 * @apiSuccess {Date}       createdOn           Custodian creation date into application.
 * @apiSuccess {Number}     createdBy           Full Name of user who created the Custodian into the system.
 * @apiSuccess {Date}       editedOn            Custodian edited date into application.
 * @apiSuccess {Number}     editedBy            Full Name of user who edited the Custodian details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 123467,
                "name": "new custodian4",
                "code": "NEWCUST4",
                "accountNumber": null,
                "isDeleted": 0,
                "createdOn": "2016-07-18T11:55:08.000Z",
                "createdBy": "Prime Prime",
                "editedOn": "2016-07-18T11:55:08.000Z",
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
 *
 */

 app.get('/summary', function (req, res) {
    logger.info("Get all team summary request recevied");

    var data = req.data;
    var model = teamConverter.getRequestToModel(data);

    teamService.getTeamSummary(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});
 /**@apiIgnore
 * @api {get} /admin/teams/:id Get Team Details
 * @apiName  GetTeamDetails.
 * @apiVersion 1.0.0
 * @apiGroup Teams
 * @apiPermission appuser
 *
 * @apiDescription This API gets Team detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/teams/1
 * 
 * @apiSuccess {Number}     totalTeams                      Total teams.
 * @apiSuccess {Number}     existingTeams                   Existing teams.
 * @apiSuccess {Number}     newTeams                        New Teams
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
          "totalTeams": 50,
          "existingTeams": 0,
          "newTeams": 50
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
 * @apiError Not_Found When Team does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Team does not exist"
 *     }
 */
app.get('/:id', validate({ params: teamIdSchema }), function (req, res) {
    logger.info("Get team details request received");

    var data = req.data;
    data.id = req.params.id;
    var model = teamConverter.getRequestToModel(data);
    teamService.getTeamDetail(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;


