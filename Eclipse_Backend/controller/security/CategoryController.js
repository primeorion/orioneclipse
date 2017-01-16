"use strict";

var moduleName = __filename;

var app = require("express")();

var helper = require('helper');
var response = require("controller/ResponseController.js");
var CategoryConverter = require('converter/security/CategoryConverter.js');
var CategoryService = require("service/security/CategoryService.js");

var logger = helper.logger(moduleName);
var validate = helper.validate;

var createOrUpdateCategorySchema = {
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

var categoryIdSchema = {
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
 * @api {get} /security/categories Get All categories 
 * @apiName GetAllCategories
 * @apiVersion 1.0.0
 * @apiGroup Categories
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
 * curl -i http://baseurl/v1/security/categories
 * 
 * @apiSuccess {Number}     id          			The Category ID.                                               
 * @apiSuccess {String}     name                    Name of the Category.                                     
 * @apiSuccess {String}     color                   Color to be used for This Category.
 * @apiSuccess {Number}     isImported              Category is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               Category exists in system or not.      
 * @apiSuccess {Date}       createdOn               Category creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Category into the system.           
 * @apiSuccess {Date}       editedOn                Category edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Category details into the system.
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

	
	CategoryService.getList(data, function(err, status, data){
		response(err, status, data, res);
	});
	
});


/**
 * @api {post} /security/categories Create New category
 * @apiName createNewCategories
 * @apiVersion 1.0.0
 * @apiGroup Categories
 * @apiPermission appuser
 *
 * @apiDescription This API Add Category. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the Category.
 * @apiParam {String}       color      		color.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
	    "name": "Equit1y",
	    "color": "#343443"
    }
    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/categories
 * 
 * @apiSuccess {Number}     id          			The Category ID.                                               
 * @apiSuccess {String}     name                    Name of the Category.                                     
 * @apiSuccess {String}     color                   Color to be used for This Category.
 * @apiSuccess {Number}     isImported              Category is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               Category exists in system or not.      
 * @apiSuccess {Date}       createdOn               Category creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Category into the system.           
 * @apiSuccess {Date}       editedOn                Category edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Category details into the system.
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
 * @apiError Unprocessable_Entity When category already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Category name already exists "
 *     }
 * 
 *
 */

app.post("/", validate( {body : createOrUpdateCategorySchema} ), function(req, res){
	
	logger.info(" Create category request received");
	
	var data = req.data;
	
	var model = CategoryConverter.categoryCreateRequestTOModel(data);
	
	CategoryService.createCategoryClass(model, function(err, status, data){
		response(err, status, data, res);
	});
	
});

/**
 * @api {put} /security/categories/:id update category
 * @apiName UpdateCategory
 * @apiVersion 1.0.0
 * @apiGroup Categories
 * @apiPermission appuser
 *
 * @apiDescription This API updates Category. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}       name            Full Name of the Category.
 * @apiParam {String}       color      		color.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
	    "name": "Equit1y",
	    "color": "#343443"
    }
    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/categories/123
 * 
 * @apiSuccess {Number}     id          			The Category ID.                                               
 * @apiSuccess {String}     name                    Name of the Category.                                     
 * @apiSuccess {String}     color                   Color to be used for This Category.
 * @apiSuccess {Number}     isImported              Category is imported from connect or not.                         
 * @apiSuccess {Number}     isDeleted               Category exists in system or not.      
 * @apiSuccess {Date}       createdOn               Category creation Date.                      
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Category into the system.           
 * @apiSuccess {Date}       editedOn                Category edited date into the system.                    
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Category details into the system.
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
 * @apiError Unprocessable_Entity When Category already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Category name already exists"
 *     }
 * 
 * @apiError Unprocessable_Entity When Category does not exist.
 *
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Category does not exists "
 *     }
 *     
 * @apiError Unprocessable_Entity When Category is imported.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Imported Category cannot be updated"
 *     }
 *
 */


app.put("/:id",validate( {params : categoryIdSchema} ), 
		       validate( {body : createOrUpdateCategorySchema} ), function(req, res){

	logger.info(" Put category request received");
	
	var data = req.data;
	data.id = req.params.id;
	
	var model = CategoryConverter.categoryCreateRequestTOModel(data);
	
	CategoryService.updateCategoryClass(model, function(err, status, data){
		response(err, status, data, res);
	});

});

/**
 * @api {delete} /security/categories/:id Delete Category 
 * @apiName DeleteCategory
 * @apiVersion 1.0.0
 * @apiGroup Categories
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Category (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/categories/1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Category deleted Successfully"
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
 * @apiError UNPROCESSABLE when trying to delete imported category
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 UNPROCESSABLE
 *     {
 *       "message": "Imported Category cannot be removed"
 *     }
 *     
 * @apiError Unprocessable_Entity When Category does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Category does not exists "
 *     }
 *     
 * @apiError UNPROCESSABLE when trying to delete when associated with other
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 UNPROCESSABLE
 *     {
 *       "message": "Category cannot be removed as it is associated with security"
 *     }   
 * 
 */

app.delete("/:id", validate( {params : categoryIdSchema} ), function(req, res){

	logger.info(" delete category request received");
	
	var data = req.data;
	data.name = null;
	data.id = req.params.id;
	
	var model = CategoryConverter.categoryCreateRequestTOModel(data);
	
	CategoryService.deleteCategoryClass(model, function(err, status, data){
		response(err, status, data, res);
	});

});

module.exports = app;