"use strict";

var app = require("express")();

var moduleName = __filename;

var config = require('config');
var logger = require("helper/Logger.js")(moduleName);
var helper = require("helper");
var response = require('controller/ResponseController.js');
var substitutedModelService = require('service/model/SubstitutedModelService.js');
var modelConverter = require('converter/model/ModelConverter.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var responseCodes = config.responseCode;
var applicationEnum = config.applicationEnum;

var validate = helper.validate;
var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var reverseRelatedTypeCodeToId = applicationEnum.reverseRelatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var reverseRelatedTypeCodeToDisplayName = applicationEnum.reverseRelatedTypeCodeToDisplayName;

var modelIdSchema = {
	    type: 'object',
	    properties: {
	        id: {
	            type: 'string',
	            is : 'numeric',
	            required: true
	        }
	    }
};

var actionStatus = {
	    type: 'object',
	    properties: {
	        actionStatus: {
	            type: 'string',
	            enum : ["approve", "reject"],
	            required: true
	        }
	    }
};

var modelUpdateCreateSchema = {
		type : 'object',
		properties : {
			name : {
				type : 'string',
				required : true
			},
			nameSpace : {
				type : 'string',
				required : false
			}
		}
}

/**
 * @apiignore
 * @api {get} /modeling/models/:id/substitutes/ Get All List of subsitutes model for model
 * @apiName getListOfSubstitutedForModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets subsitutes for model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i /modeling/models/1/substitutes/
 * 
 * @apiSuccess {Number}     id   				             The substitute model Id.
 * @apiSuccess {String}     name                			 Name of substitute model.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 1,
		    "name": "Conservative"
		  },
		  {
		    "id": 2,
		    "name": "Aggressive"
		  },
		  {
		    "id": 3,
		    "name": "Neutral"
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

app.get('/:id/subsitutes', function(req, res){
	
	logger.info("Get list of substitute models request received");
	
	var data = req.data;
	
	substitutedModelService.getSubstituteModelListForModel(data, function(err, status, json){		
		response(null, responseCodes.SUCCESS, json, res);
	});
});

module.exports = app;