"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var response = require("controller/ResponseController.js");
var SubClassConverter = require('converter/security/SubClassConverter.js');
var SubClassService = require("service/security/SubClassService.js");

var logger = helper.logger(moduleName);
var validate = helper.validate;

var createOrUpdateSubClassSchema = {
	    type: 'object',
	    properties: {
	        name: {
	            type: 'string',
	            required: true
	        },
	        color: {
	            type: 'string',
	            required : true,
	            is : 'hexColor'
	        }
	    }
	};

var subClassIdSchema = {
		type : 'object',
		properties : {
			id : {
				type : 'string',
				is : 'numeric',
				required : true
			}
		}
};

/**
 * @api {get} /security/subclasses Get All Sub-Classes 
 * @apiName GetAllSubClasses
 * @apiVersion 1.0.0
 * @apiGroup SubClasses
 * @apiPermission appuser
 *
 * @apiDescription This API gets category list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/subclasses
 * 
 * @apiSuccess {Number}     id          			The SubClass ID.                                               
 * @apiSuccess {String}     name                    Name of the SubClass.                                     
 * @apiSuccess {String}     color                   Color to be used for This SubClass.
 * @apiSuccess {Number}     isImported              SubClass is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               SubClass exists in system or not.      
 * @apiSuccess {Date}       createdOn               SubClass creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the SubClass into the system.           
 * @apiSuccess {Date}       editedOn                SubClass edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the SubClass details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
			{
			    "id": 1,
			    "name": "Equity",
			    "color": "#000000",
			    "isImported": 1,
			    "isDeleted": 0,
			    "createdOn": null,
			    "createdBy": "Prime Prime",
			    "editedOn": "2016-07-13T12:13:54.000Z",
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

app.get("/", function(req, res){

	logger.info("Get all subclass request received");
	
	var data = req.data;
	
	data.search = req.query.search;
	
	SubClassService.getList(data, function(err, status, data){
		response(err, status, data, res);
	});
	
});


/**
 * @api {post} /security/subclasses Create New SubClasses
 * @apiName createNewSubClasses
 * @apiVersion 1.0.0
 * @apiGroup SubClasses
 * @apiPermission appuser
 *
 * @apiDescription This API Add SubClass. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the SubClass.
 * @apiParam {String}       color      		color.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
	    "name": "Equit1y",
	    "color": "#343443"
    }
    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/subclasses
 * 
 * @apiSuccess {Number}     id          			The SubClass ID.                                               
 * @apiSuccess {String}     name                    Name of the SubClass.                                     
 * @apiSuccess {String}     color                   Color to be used for This SubClass.
 * @apiSuccess {Number}     isImported              SubClass is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               SubClass exists in system or not.      
 * @apiSuccess {Date}       createdOn               SubClass creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the SubClass into the system.           
 * @apiSuccess {Date}       editedOn                SubClass edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the SubClass details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
			{
			    "id": 1,
			    "name": "Equity",
			    "color": "#000000",
			    "isImported": 1,
			    "isDeleted": 0,
			    "createdOn": null,
			    "createdBy": "Prime Prime",
			    "editedOn": "2016-07-13T12:13:54.000Z",
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
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 * 
 * @apiError Unprocessable_Entity When subclass already exist with same name.
 *
 * 
 *
 */

app.post("/", validate( {body : createOrUpdateSubClassSchema} ), function(req, res){
	
	logger.info(" Create subclass request received");
	
	var data = req.data;
	
	var model = SubClassConverter.subClassCreateRequestTOModel(data);
	
	SubClassService.createSubClass(model, function(err, status, data){
		response(err, status, data, res);
	});
	
});

/**
 * @api {put} /security/subclasses/:id update subclass
 * @apiName UpdateClass
 * @apiVersion 1.0.0
 * @apiGroup SubClasses
 * @apiPermission appuser
 *
 * @apiDescription This API updates SubClass. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the subclass.
 * @apiParam {String}       color      		color.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
	    "name": "Equit1y",
	    "color": "#343443"
    }
    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/subclasses/1
 * 
 * @apiSuccess {Number}     id          			The SubClass ID.                                               
 * @apiSuccess {String}     name                    Name of the SubClass.                                     
 * @apiSuccess {String}     color                   Color to be used for This SubClass.
 * @apiSuccess {Number}     isImported              SubClass is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               SubClass exists in system or not.      
 * @apiSuccess {Date}       createdOn               SubClass creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the SubClass into the system.           
 * @apiSuccess {Date}       editedOn                SubClass edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the SubClass details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
			{
			    "id": 1,
			    "name": "Equity",
			    "color": "#000000",
			    "isImported": 1,
			    "isDeleted": 0,
			    "createdOn": null,
			    "createdBy": "Prime Prime",
			    "editedOn": "2016-07-13T12:13:54.000Z",
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
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 * 
 * @apiError Unprocessable_Entity When SubClass already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "subclass name already exists"
 *     }
 * 
 * @apiError Unprocessable_Entity When SubClass does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " SubClass does not exists "
 *     }
 *     
 * @apiError Unprocessable_Entity When SubClass is imported.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Imported SubClass cannot be updated"
 *     }
 *     
 */

app.put("/:id", validate( {params : subClassIdSchema} ), 
	            validate( {body : createOrUpdateSubClassSchema} ), function(req, res){

	logger.info(" Put subclass request received");
	
	var data = req.data;
	data.id = req.params.id;
	var model = SubClassConverter.subClassCreateRequestTOModel(data);
	
	SubClassService.updateSubClass(model, function(err, status, data){
		response(err, status, data, res);
	});
	
});

/**
 * @api {delete} /security/subclasses/:id Deletes subclass 
 * @apiName DeleteSubClass
 * @apiVersion 1.0.0
 * @apiGroup SubClasses
 * @apiPermission appuser
 *
 * @apiDescription This API deletes SubClass (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/subclasses/1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "SubClass deleted Successfully"
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
 * @apiError UNPROCESSABLE when trying to delete imported class
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 UNPROCESSABLE
 *     {
 *       "message": "Imported SubClass cannot be updated"
 *     }
 *     
 * @apiError Unprocessable_Entity When SubClass does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " SubClass does not exists "
 *     }
 *     
 * @apiError UNPROCESSABLE when trying to delete when associated with other
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 UNPROCESSABLE
 *     {
 *       "message": "SubClass cannot be removed as it is associated with security"
 *     }   
 * 
 */

app.delete("/:id", validate( {params : subClassIdSchema} ), function(req, res){

	logger.info(" delete sub class request received");
	
	var data = req.data;
	data.name = null;
	data.id = req.params.id;
	
	var model = SubClassConverter.subClassCreateRequestTOModel(data);
	
	SubClassService.deleteSubClass(model, function(err, status, data){
		response(err, status, data, res);
	});

});

module.exports = app;