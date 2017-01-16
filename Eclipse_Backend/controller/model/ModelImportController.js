var app = require("express")();

var moduleName = __filename;

var config = require('config');
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var modelService = require('service/model/ModelService.js');
var modelImportService = require('service/model/ModelImportService.js');
var modelConverter = require('converter/model/ModelConverter.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var responseCodes = config.responseCode;
var applicationEnum = config.applicationEnum;

var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var reverseRelatedTypeCodeToId = applicationEnum.reverseRelatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var reverseRelatedTypeCodeToDisplayName = applicationEnum.reverseRelatedTypeCodeToDisplayName;
var fileUpload = require("middleware/FileUploader");
var templates = applicationEnum.templates;


/**
 * @api {get} /modeling/models/upload/templates Get Model Templates
 * @apiName GetModelsFileTemplate
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model template. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/upload/templates
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    
 *    FILE
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.get('/templates', function(req, res){
	
	logger.info("get model template request received");
	
	var data = req.data;
	
	data.format = req.query.format;

	modelImportService.getModelTemplateUrlFromS3(data, function(err, status, rs){
		return response(err, status, rs, res);
	})
	
})

/**
 * @api {post} /modeling/models/upload/validate Validate Uploaded model import file
 * @apiName validateModelFromFile
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API validates model from file in specific format. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/upload/validate
 * 
* @apiParam {FILE}		  file 	                  Upload model file with securities in it.
* 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    
 * @apiSuccess {String}          message                   []
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
[]

 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.post('/validate', fileUpload.single('file'), function(req, res){
	
	logger.info("post validate upload model request received");
	
	var data = req.data;
	var inputJson = modelImportService.parseImportedFile(data);

	var mainArr = [];
	for(var i in inputJson){
		var model = inputJson[i];
		model.reqId = data.reqId;
		model.user = data.user;
		model.securitySet.reqId = data.reqId;
		model.securitySet.user = data.user;
		mainArr.push(model);
	}
	
	modelImportService.validateModelInBulk(mainArr, function(err, status, rs){			
		response(err, status, rs, res);
	})
	
})

/**
 * @api {post} /modeling/models/upload Upload model import file
 * @apiName importModelFromFile
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API imports model from file in specific format. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/upload
 * 
* @apiParam {FILE}		  file 	                  Upload model file with securities in it.
* 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {String}          nameSpace              Namespace of Model
 * @apiSuccess {Number}          statusId               StatusId of model
 * @apiSuccess {String}          status                 status of model
 * @apiSuccess {Number}          ownerUserId            OwnerUserId of model.
 * @apiSuccess {String}          ownerUser              OwnerUser model
 * @apiSuccess {Number}          portfolioCount         Number of portfolio's model is assigned to.
 * @apiSuccess {Number}          modelAUM               Total sum of money invested in model.
 * @apiSuccess {Number}          managementStyleId      ManagementStyleId of model
 * @apiSuccess {String}          managementStyle        ManagementStyle of model
 * @apiSuccess {Boolean}         isCommunityModel       flag if Model is imported from community.
 * @apiSuccess {Number}          approvedByUserId       UserId who approved the Model
 * @apiSuccess {String}          approvedByUser         User who approved the model.
 * @apiSuccess {Boolean}         isDynamic   	        Flag if Model is dynamic.
 * @apiSuccess {Boolean}         isDeleted              If model is deleted
 * @apiSuccess {String}          createdOn              Created Date of Model
 * @apiSuccess {String}          editedOn               Edited Date of Model
 * @apiSuccess {String}          createdBy              User who created the Model
 * @apiSuccess {String}          editedBy               User who edited the Model
 * @apiSuccess {ModelElement}    modelDetail            Compelete Structure of Model
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
{
	  "id": 2,
	  "name": "Test Model 13",
	  "description": null,
	  "statusId": 1,
	  "status": "APPROVED",
	  "portfolioCount": 0,
	  "modelAUM": 0,
	  "ownerUserId": 66,
	  "ownerUser": "prime@tgi.com",
	  "managementStyleId": 2,
	  "managementStyle": "Aggressive",
	  "isCommunityModel": null,
	  "approvedByUserId": null,
	  "approvedByUser": "prime@tgi.com",
	  "isDynamic": 0,
	  "isDeleted": 0,
	  "createdOn": "2016-09-27T04:37:53.000Z",
	  "editedOn": "2016-09-27T05:00:59.000Z",
	  "createdBy": 66,
	  "editedBy": 66,
	  "modelDetail": {
		"id": 126,
		"name": "Test Model 13",
		"modelType": null,
		"modelTypeId": null,
		"targetPercent": null,
		"lowerModelTolerancePercent": null,
		"upperModelTolerancePercent": null,
		"rank" : 1,
		 "toleranceType": "RANGE",
		"toleranceTypeValue": 44,
		"lowerModelToleranceAmount": null,
		"upperModelToleranceAmount": null,
		"lowerTradeTolerancePercent": null,
		"upperTradeTolerancePercent": null,
		"level": "0",
		"leftValue": 1,
		"rightValue": 10,
		"children": [
			{
				"id": 9,
				"name": "Test Model 13",
				"modelType": "SECURITYSET",
				"modelTypeId": 4,
				"targetPercent": 5,
				"lowerModelTolerancePercent": 5,
				"upperModelTolerancePercent": 5,
				"rank" : 1,
				"toleranceType": "RANGE",
				"toleranceTypeValue": 44,
				"lowerModelToleranceAmount": null,
				"upperModelToleranceAmount": null,
				"lowerTradeTolerancePercent": 5,
				"upperTradeTolerancePercent": 5,
				"level": "1",
				"leftValue": 2,
				"rightValue": 7,
				"children": []
		}]	
	}
}
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
var util = require("util");
app.post('/', fileUpload.single('file'), function(req, res){
	
	logger.info("post upload model request received");

	var data = req.data;
	var inputJson = modelImportService.parseImportedFile(data);

	var mainArr = [];
	for(var i in inputJson){
		var model = inputJson[i];
		model.reqId = data.reqId;
		model.user = data.user;
		model.securitySet.reqId = data.reqId;
		model.securitySet.user = data.user;
		mainArr.push(model);
	}
	//console.log(util.inspect(inputJson, false, null))
	modelImportService.createModelFromImportBulk(mainArr, function(err, status, rs){			
		response(err, status, rs, res);
	})
})

module.exports = app;