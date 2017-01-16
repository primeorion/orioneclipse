"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var roleService = new (require('service/admin/RoleService.js'))();
var RoleConverter = require('converter/role/RoleConverter.js');

var roleConverter = new RoleConverter();

var logger = helper.logger(moduleName);
var validate = helper.validate;

var createRoleSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
			is : "notEmpty",
            required: true
        },
        roleTypeId: {
            type: ['number'],
            required: true
        },
        status : {
        	enum : [0,1, true, false]
        },
        startDate: {
            type: 'string',
            is: 'date'
        },
        expireDate: {
            type: 'string',
            is: 'date'
        },
        privileges: {
            type: 'array',
            items : {
            	type : 'object',
            	properties:{
            		id : {
                		type : 'number',
                		required : true
                	},
                	canAdd : {
                		enum : [0,1, true, false]
                	},
                	canDelete : {
                		enum : [0,1, true, false]
                	},
                	canUpdate : {
                		enum : [0,1, true, false]
                	},
                	canRead : {
                		enum : [0,1, true, false]
                	}
            	}
            },
            required: false
        }
    }
};
var updateRoleSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        status : {
            enum : [0,1, true, false]
        },
        startDate: {
            type: 'string',
            is: 'date'
        },
        expireDate: {
            type: 'string',
            is: 'date'
        },
        privileges: {
            type: 'array',
            items : {
                type : 'object',
                properties:{
                    id : {
                        type : 'number',
                        required : true
                    },
                    canAdd : {
                        enum : [0,1, true, false]
                    },
                    canDelete : {
                        enum : [0,1, true, false]
                    },
                    canUpdate : {
                        enum : [0,1, true, false]
                    },
                    canRead : {
                        enum : [0,1, true, false]
                    }
                }
            },
            required: false
        }
    }
};
var roleIdSchema = {
		type : 'object',
		properties : {
			id : {
				type : 'string',
				is : 'numeric',
				required : true
			}
		}
};

var roleReassignSchema = {
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

var roleList = {
		type : 'object',
		properties : {
			oldId : {
				type : 'string',
				required : true
			},
			newId : {
				type : 'string',
				required : true
			}
		}
};

var isDeletedParam = {
		type : 'object',
		properties : {
			isDeleted : {
				type : 'string',
				required : false,
				is : 'boolean'
			}
		}
};
/**
 * @api {get} /admin/roles?search={id/name} Search Roles 
 * @apiName SearchRoles
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API search role. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles?search=1
 * 
 * @apiSuccess {Number}     id              The Role ID.
 * @apiSuccess {String}     name            Name of the Role.
 * @apiSuccess {String}     roleType        Name of the Role Type.
 * @apiSuccess {Number}     numberOfUsers   Number of Users associated with Role.
 * @apiSuccess {Boolean}    status          Status of the Role
 * @apiSuccess {Date}       startDate       Role start date into application.
 * @apiSuccess {Date}       expireDate      Role expire date into application.
 * @apiSuccess {Boolean}    isDeleted       Role exist or not into the system.
 * @apiSuccess {Date}       createdOn       Role creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Role into the system.
 * @apiSuccess {Date}       editedOn        Role edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Role details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 1,
                "name": "Manager",
                "roleType": "FIRM ADMIN",
                "numberOfUsers": 19,
                "status" : 1
                "startDate": "2016-05-05T18:30:00.000Z",
                "expireDate": "2016-06-05T18:30:00.000Z",
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
 * @api {get} /admin/roles Get All Roles 
 * @apiName GetAllRoles
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API gets role list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles
 * 
 * @apiSuccess {Number}     id              The Role ID.
 * @apiSuccess {String}     name            Name of the Role.
 * @apiSuccess {String}     roleType        Name of the Role Type.
 * @apiSuccess {Number}     numberOfUsers   Number of Users associated with Role.
 * @apiSuccess {Boolean}    status          Status of the Role
 * @apiSuccess {Date}       startDate 	    Role start date into application.
 * @apiSuccess {Date}       expireDate 	    Role expire date into application.
 * @apiSuccess {Boolean}    isDeleted       Role exist or not into the system.
 * @apiSuccess {Date}       createdOn       Role creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Role into the system.
 * @apiSuccess {Date}       editedOn 	    Role edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Role details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 1,
                "name": "Manager",
                "roleType": "FIRM ADMIN",
                "numberOfUsers": 19,
                "status" : 1
                "startDate": "2016-05-05T18:30:00.000Z",
                "expireDate": "2016-06-05T18:30:00.000Z",
                "isDeleted": 1,
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
 * @api {get} /admin/roles?search={NAME/ID} Get Roles 
 * @apiName GetRoles
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API gets role list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles
 * 
 * @apiSuccess {Number}     id              The Role ID.
 * @apiSuccess {String}     name            Name of the Role.
 * @apiSuccess {String}     roleType        Name of the Role Type.
 * @apiSuccess {Number}     numberOfUsers   Number of Users associated with Role.
 * @apiSuccess {Boolean}    status          Status of the Role
 * @apiSuccess {Date}       startDate 	    Role start date into application.
 * @apiSuccess {Date}       expireDate 	    Role expire date into application.
 * @apiSuccess {Boolean}    isDeleted       Role exist or not into the system.
 * @apiSuccess {Date}       createdOn       Role creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Role into the system.
 * @apiSuccess {Date}       editedOn 	    Role edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Role details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 1,
                "name": "Manager",
                "roleType": "FIRM ADMIN",
                "numberOfUsers": 19,
                "status" : 1
                "startDate": "2016-05-05T18:30:00.000Z",
                "expireDate": "2016-06-05T18:30:00.000Z",
                "isDeleted": 1,
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

app.get('/', validate( {query : isDeletedParam} ), function (req, res) {
	logger.info("Get all roles request received");

    var data = req.data;

    data.search = req.query.search;
    data.roleType = req.query.roleType;
    
    data.exactSearch = req.query.exactSearch;
    
    var model = roleConverter.roleListRequestToModel(data);

    roleService.getRoleList(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {post} /admin/roles Add Role
 * @apiName AddRole
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API Add Role. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the Role.
 * @apiParam {String}       roleTypeId      RoleType id.
 * @apiParam {String[]}     privileges      Privileges list.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *        "name":"test14",
          "roleTypeId":1,
          "status" : 1,
          "startDate": "01/22/2016",
          "expireDate": "12/25/2016",
          "privileges":[{
                        "id":67,
                        "canAdd":true,
                        "canUpdate":false,
                        "canDelete":true,
                        "canRead":false
            }]
 *    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles
 * 
 * @apiSuccess {Number}     id              The Role ID.
 * @apiSuccess {String}     name            Name of the Role.
 * @apiSuccess {number}     roleTypeId      RoleType id
 * @apiSuccess {String}     roleType        RoleType name. 
 * @apiSuccess {Boolean}    status          Status of the Role
 * @apiSuccess {Date}       startDate 	    Role start date into application.
 * @apiSuccess {Date}       expireDate 	    Role expire date into application.
 * @apiSuccess {Boolean}    isDeleted       Role exist or not into the system.
 * @apiSuccess {Date}       createdOn       Role creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Role into the system.
 * @apiSuccess {Date}       editedOn 	    Role edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Role details into the system.
 * @apiSuccess {String[]}   privileges      Privileges list.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
        {
            "id": 1,
            "name": "Madan sinha",
            "roleTypeId": "1",
            "roleType": "FIRM ADMIN",
            "isDeleted": 1,
            "createdOn": "2016-06-08T09:24:16.000Z",
            "createdBy": "Prime Prime",
            "editedOn": "2016-06-30T04:33:14.000Z",
            "editedBy" : "Prime Prime",
            "privileges": [
                {
                   "id": 57,
                   "name": "Teams",
                   "code": "TEAMS",
                   "category": "Security",
                   "canAdd": true,
                   "canUpdate": false,
                   "canDelete": true,
                   "canRead": false,
                   "isDeleted": 0,
                   "type": "Record"
                 }
            ]
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
 * @apiError Unprocessable_Entity When role already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Role already exist with same name"
 *     }
 * 
 *
 */

app.post('/', validate({ body: createRoleSchema }), function (req, res) {

	logger.info("Create role request received");
	var model = roleConverter.roleCreateRequestToRoleModel(req.data);
	
    roleService.addRole(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /admin/roles/roleType Get Role Types List 
 * @apiName GetRoleTypesList
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API gets role type list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles/roleType
 * 
 * @apiSuccess {Number}     id              The Role type ID.
 * @apiSuccess {String}     roleTypeName    Role type name.
 * @apiSuccess {Number}     bitValue        Role type bit value.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 1,
                "roleType": "FIRM ADMIN",
                "bitValue": 1
            },
            {
                "id": 2,
                "roleType": "TEAM ADMIN",
                "bitValue": 2
            },
            {
                "id": 3,
                "roleType": "USER",
                "bitValue": 4
            }
        ]
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 * 
 */
app.get('/roleType', function (req, res) {
   	logger.info("Get all role types request received");
    roleService.getRoleTypeList(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
})




/**
 * @api {put} /admin/roles/:id Update Role
 * @apiName UpdateRole
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API Update Role. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the Role.
 * @apiParam {String}       roleTypeId      RoleType id.
 * @apiParam {String[]}     privileges      Privileges list.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
            "name": "Rep Manager",
            "roleTypeId" : 1,
            "startDate": "01/22/2016",
            "expireDate": "12/25/2016",
            "privileges": [
                    {
                    "id":67,
                    "canAdd": true,
                    "canUpdate": false,
                    "canDelete": true,
                    "canRead": false,
                    "isDeleted": 0
                    }
            ]
       }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles/1
 * 
 * @apiSuccess {Number}     id              The Role ID.
 * @apiSuccess {String}     name            Name of the Role.
 * @apiSuccess {number}     roleTypeId      RoleType id
 * @apiSuccess {String}     roleType        RoleType name. 
 * @apiSuccess {Boolean}    status         Status of the Role
 * @apiSuccess {Date}       startDate 	    Role start date into application.
 * @apiSuccess {Date}       expireDate 	    Role expire date into application.
 * @apiSuccess {Boolean}    isDeleted       Role exist or not into the system.
 * @apiSuccess {Date}       createdOn       Role creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Role into the system.
 * @apiSuccess {Date}       editedOn 	    Role edited date into application.
 * @apiSuccess {Number}     editedBy        Full Name of user who edited the Role details into the system.
 * @apiSuccess {String[]}   privileges      Privileges list.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "id": 1,
            "name": "Madan sinha",
            "roleTypeId": "1",
            "roleType": "FIRM ADMIN",
            "status" : 1,
            "isDeleted": 1,
            "createdOn": "2016-06-08T09:24:16.000Z",
            "createdBy": "Prime Prime",
            "editedOn": "2016-06-30T04:33:14.000Z",
            "editedBy" : "Prime Prime",
            "privileges": [
                {
                   "id": 57,
                   "name": "Teams",
                   "code": "TEAMS",
                   "category": "Security",
                   "canAdd": true,
                   "canUpdate": false,
                   "canDelete": true,
                   "canRead": false,
                   "isDeleted": 0,
                   "type": "Record"
                 }
            ]
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
 * @apiError Unprocessable_Entity When role already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Role already exist with same name"
 *     }
 */

//update Role to Eclipse
app.put('/:id', validate( {params : roleIdSchema} ), validate({ body: updateRoleSchema }), function (req, res) {

   	logger.info("Update role details request received");
    
    var data = req.data;
    data.id = req.params.id;
    
    var model = roleConverter.roleCreateRequestToRoleModel(req.data);
    
    roleService.updateRole(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {delete} /admin/roles/:id Delete Role 
 * @apiName DeleteRole
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API deletes role (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles/1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Role deleted successfully"
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
 * @apiError Not_Found When role does not exist or already deleted.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Role does not exist or already deleted"
 *     }
 * 
 */
app.delete('/:id', validate( {params : roleIdSchema} ), function (req, res) {
    logger.info("Delete role request received");

    var data = req.data;
    data.id = req.params.id;
    
    var model = roleConverter.roleCreateRequestToRoleModel(req.data);
    
    roleService.deleteRole(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {post} /admin/roles/:id Assign Privileges to Role
 * @apiName AddPrivilegeToRole
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API add privilege to role.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiSuccess {String[]}   privileges      Privileges list.
 * 
 * @apiParamExample {json} Request-Example:
 *    {
        "privileges":[{
            "id":67,
            "canAdd":true,
            "canUpdate":false,
            "canDelete":true,
            "canRead":false
        }]
        }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles/1
 * 
 * @apiSuccess {String}     data         Role privileges message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
     {   
        "data":"Privileges Added Successfully"
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
 * @apiError Not_Found When role does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Role does not exist"
 *     }
 */


app.post('/:id', validate( {params : roleIdSchema} ), function (req, res) {

   	logger.info("Add privileges to role request received");

    var data = req.data;
    data.id = req.params.id;
    roleService.addPrivilege(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {post} /admin/roles/action/reassignRole Reassign Role
 * @apiName ReassignRole
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API Reassign Role. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {number}       oldId            The old roleId.
 * @apiParam {number}       newId            The New roleId.
 * 
 * @apiParamExample {json} Request-Example:
 *    {
        "oldId":1,
        "newId":167
      }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles/action/reassignRole
 * 
 * @apiSuccess {String}     message         Role reassign message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Role reassigned successfully"
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
 */

//reassign role
app.post('/action/reassignRole', validate( {body : roleReassignSchema} ), function (req, res) {

   	logger.info("Reassign user to new role request received");

   	var data = req.data;
   	data.oldRoleId = data.oldId;
   	data.newRoleId = data.newId;
   	
    roleService.reassignRole(data, function (err, status, data) {
        return response(err, status, data, res);
    });
})

/**
 * @api {get} /admin/roles/summary Get Roles Summary 
 * @apiName GetRolesSummary
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API gets role summary. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles/summary
 * 
 * @apiSuccess {Number}     totalRoles                  Total roles.
 * @apiSuccess {Number}     newRoles                    New Roles.
 * @apiSuccess {Number}     existingRoles               Existing Roles.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
          "totalRoles": 139,
          "newRoles": 116,
          "existingRoles": 23
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
    logger.info("Get all role summary request recevied");

    var data = req.data;
    roleService.getRoleSummary(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

 /**
 * @api {get} /admin/roles/:id Get Role Details 
 * @apiName GetRoleDetails
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API gets role details. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles/168
 * 
 * @apiSuccess {Number}     id              The Role ID.
 * @apiSuccess {String}     name            Name of the Role.
 * @apiSuccess {String}     roleTypeId      Role type id.
 * @apiSuccess {String}     roleTypeName    Role type name.
 * @apiSuccess {Boolean}    status          Status of the Role
 * @apiSuccess {Date}       startDate       Role start date into application.
 * @apiSuccess {Date}       expireDate      Role expire date into application.
 * @apiSuccess {Boolean}    isDeleted       Role exist or not into the system.
 * @apiSuccess {Date}       createdOn       Role creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the Role into the system.
 * @apiSuccess {Date}       editedOn        Role edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the Role details into the system.
 * @apiSuccess {JSON[]}     privileges      List of Privileges details associated with Role.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "id": 168,
            "name": "Sub Advisor",
            "roleTypeId": "2",
            "roleType": "TEAM ADMIN",
            "status" : 1,
            "startDate": "2016-05-05T18:30:00.000Z",
            "expireDate": "2016-06-05T18:30:00.000Z",
            "isDeleted": 1,
            "createdOn": "2016-06-13T09:02:20.000Z",
            "createdBy": "Prime Prime",
            "editedOn": "2016-06-22T09:34:20.000Z",
            "editedBy": "Prime Prime",
            "privileges": [
                    {
                      "id": 59,
                      "name": "Roles",
                      "code": "ROLES",
                      "category": "Admin",
                      "type": 0,
                      "canAdd": 1,
                      "addDisabled": 0,
                      "canUpdate": 1,
                      "updateDisabled": 0,
                      "canDelete": 1,
                      "deleteDisabled": 0,
                      "canRead": 1,
                      "readDisabled": "0",
                      "isDeleted": 0
                    },
                    {
                      "id": 57,
                      "name": "Teams",
                      "code": "TEAMS",
                      "category": "Admin",
                      "type": 0,
                      "canAdd": 0,
                      "addDisabled": 0,
                      "canUpdate": 0,
                      "updateDisabled": 0,
                      "canDelete": 0,
                      "deleteDisabled": 0,
                      "canRead": 0,
                      "readDisabled": "0",
                      "isDeleted": 0
                    }]
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
 * @apiError Not_Found When role does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Role does not exist"
 *     }
 * 
 */

//Get Role Detail 
app.get('/:id', validate( {params : roleIdSchema} ), validate( {query : isDeletedParam} ), function (req, res) {
        
    logger.info("Get role details by id request received");

    var data = req.data;
    data.id = req.params.id;
    
    roleService.getRoleDetail(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /admin/roles/:id/users Get Role Users
 * @apiName GetRoleUsers
 * @apiVersion 1.0.0
 * @apiGroup Roles
 * @apiPermission appuser
 *
 * @apiDescription This API gets role users. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/roles/168/users
 * 
 * @apiSuccess {Number}     id              The User ID.
 * @apiSuccess {String}     name            Full Name of the User.
 * @apiSuccess {Boolean}    status          Status of the User.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {Date}       startDate       Date from which user will be active in system.
 * @apiSuccess {Date}       expireDate      Date after which user will be inactive in system.
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       createdOn       User Role creation date into application.
 * @apiSuccess {String}     createdBy       Full Name of user who created the User Role into the system.
 * @apiSuccess {Date}       editedOn        User Role edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User Role details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
        {
            "id": 34,
            "name": "RajneeshFinalTest ",
            "status": 1,
            "email": "param1@gmail.com",
            "startDate": "2015-12-30T18:30:00.000Z",
            "expireDate": "2050-12-30T18:30:00.000Z",
            "isDeleted": 0,
            "createdOn": "2016-07-07T01:17:52.000Z",
            "createdBy": 370925,
            "editedOn": "2016-07-09T02:00:47.000Z",
            "editedBy": 370925
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
 * @apiError Not_Found When role does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Role does not exist"
 *     }
 * 
 */
 
app.get('/:id/users', validate( {params : roleIdSchema} ), function (req, res) {
        
    logger.info("Get role details by id request received");

    var data = req.data;
    data.id = req.params.id;
    roleService.getRoleUsers(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;

