"use strict";

var moduleName = __filename;

var app = require("express")();

var helper = require('helper');

var response = require("controller/ResponseController.js");
var ClassConverter = require('converter/security/ClassConverter.js');
var ClassService = require("service/security/ClassService.js");

var logger = helper.logger(moduleName);
var validate = helper.validate;

var createOrUpdateClassSchema = {
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

var classIdSchema = {
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
 * @api {get} /security/classes Get All classes 
 * @apiName GetAllClasses
 * @apiVersion 1.0.0
 * @apiGroup Classes
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
 * curl -i http://baseurl/v1/security/classes
 * 
 * @apiSuccess {Number}     id          			The class ID.                                               
 * @apiSuccess {String}     name                    Name of the Class.                                     
 * @apiSuccess {String}     color                   Color to be used for This Class.
 * @apiSuccess {Number}     isImported              Class is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               Class exists in system or not.      
 * @apiSuccess {Date}       createdOn               Class creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Class into the system.           
 * @apiSuccess {Date}       editedOn                Class edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Class details into the system.
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

	logger.info("Get all category request received");
	
	var data = req.data;
	
	data.search = req.query.search;

	ClassService.getList(data, function(err, status, data){
		response(err, status, data, res);
	});
	
});


/**
 * @api {post} /security/classes Create New Classes
 * @apiName createNewClass
 * @apiVersion 1.0.0
 * @apiGroup Classes
 * @apiPermission appuser
 *
 * @apiDescription This API Add Class. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the Class.
 * @apiParam {String}       color      		Color to be used for class.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
	    "name": "Equit1y",
	    "color": "#343443"
    }
    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/classes
 * 
 * @apiSuccess {Number}     id          			The class ID.                                               
 * @apiSuccess {String}     name                    Name of the Class.                                     
 * @apiSuccess {String}     color                   Color to be used for This Class.
 * @apiSuccess {Number}     isImported              Class is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               Class exists in system or not.      
 * @apiSuccess {Date}       createdOn               Class creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Class into the system.           
 * @apiSuccess {Date}       editedOn                Class edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Class details into the system.
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
 * @apiError Unprocessable_Entity When class already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Class name already exists"
 *     }
 * 
 *
 */

app.post("/", validate( {body : createOrUpdateClassSchema} ), function(req, res){
	
	logger.info(" Create class request received");
	
	var data = req.data;
	
	var model = ClassConverter.classCreateRequestTOModel(data);
	
	ClassService.createClass(model, function(err, status, data){
		response(err, status, data, res);
	});
	
});


/**
 * @api {put} /security/classes/:id update class
 * @apiName UpdateClass
 * @apiVersion 1.0.0
 * @apiGroup Classes
 * @apiPermission appuser
 *
 * @apiDescription This API updates class. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the Class.
 * @apiParam {String}       color      		Color to be used for class.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
	    "name": "Equit1y",
	    "color": "#343443"
    }
    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/classes/1
 * 
 * @apiSuccess {Number}     id          			The class ID.                                               
 * @apiSuccess {String}     name                    Name of the Class.                                     
 * @apiSuccess {String}     color                   Color to be used for This Class.
 * @apiSuccess {Number}     isImported              Class is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               Class exists in system or not.      
 * @apiSuccess {Date}       createdOn               Class creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Class into the system.           
 * @apiSuccess {Date}       editedOn                Class edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Class details into the system.
 * 
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
 * @apiError Unprocessable_Entity When Class already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Class name already exists"
 *     }
 * 
 * @apiError Unprocessable_Entity When Class does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Class does not exists "
 *     }
 *     
 * @apiError Unprocessable_Entity When Class is imported.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Imported Class cannot be updated"
 *     }
 *
 */

app.put("/:id", validate( {params : classIdSchema} ), 
	       validate( {body : createOrUpdateClassSchema} ), function(req, res){

	logger.info(" Put class request received");
	
	var data = req.data;
	
	data.id = req.params.id;
	
	var model = ClassConverter.classCreateRequestTOModel(data);
	
	ClassService.updateClass(model, function(err, status, data){
		response(err, status, data, res);
	});
	
});

/**
 * @api {delete} /security/classes/:id Delete Class 
 * @apiName DeleteClass
 * @apiVersion 1.0.0
 * @apiGroup Classes
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Class (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/classes/1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Class deleted Successfully"
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
 *       "message": "Imported Class cannot be removed"
 *     }
 *     
 * @apiError Unprocessable_Entity When Class does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Class does not exists "
 *     }
 *     
 * @apiError UNPROCESSABLE when trying to delete when associated with other
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 UNPROCESSABLE
 *     {
 *       "message": "Class cannot be removed as it is associated with security"
 *     }   
 * 
 */

app.delete("/:id", validate( {params : classIdSchema} ), function(req, res){

	logger.info(" delete class request received ");
	
	var data = req.data;
	data.name = null;
	data.id = req.params.id;
	
	var model = ClassConverter.classCreateRequestTOModel(data);
	
	ClassService.deleteClass(model, function(err, status, data){
		response(err, status, data, res);
	});

});



module.exports = app;