"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var ModelRequest = require("model/community/model/ModelRequest.js");
var ModelService = require('service/community/ModelService.js');

var modelService = new ModelService();
var logger = helper.logger(moduleName);
var validate = helper.validate;

/**
 * @api {get} /community/models?strategistId={id_list} Get Community Model by Strategist Ids
 * @apiName GetModelByStrategistId
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API returns community model as per strategist Ids
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiSuccess {Number}     id                      The model id.
 * @apiSuccess {Name}       name                    Model name.
 * @apiSuccess {Boolean}    isDeleted               Model exist or not into the system.
 * @apiSuccess {Date}       createdOn               Model creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Model into the system.
 * @apiSuccess {Date}       editedOn                Model edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Model into the system.
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/models?strategistId=1,2
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * [
 *  {
        "id": 1,
        "name": "Test Model",
        "isDeleted": 0,
        "createdOn": "2016-09-21T05:16:43.000Z",
        "createdBy": "prime@tgi.com",
        "editedOn": "2016-09-21T05:16:48.000Z",
        "editedBy": "prime@tgi.com"
    }
 * ]
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
    logger.info("Get all model request received");

    var data = req.data;
    
    if (req.query.strategistIds) {
        data.strategistId = req.query.strategistIds;
    }
    modelService.getList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /community/models/approved?strategistId={:id} List of Approved Model by strategistId
 * @apiName ListOfModelsBasedOnFirmLevelPreference
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API returns list of  models based on firm level preference setting
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiSuccess {Number}     id                      The model id.
 * @apiSuccess {Name}       name                    Model name.
 * @apiSuccess {Boolean}    isDeleted               Model exist or not into the system.
 * @apiSuccess {Date}       createdOn               Model creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Model into the system.
 * @apiSuccess {Date}       editedOn                Model edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Model into the system.
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/models/approved?strategistId=1
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * [
    {
      "id":1,
      "name":"Demo Model",
      "isDeleted": 0,
      "createdBy": "prime@tgi.com",
      "createdOn": "2016-09-15T23:52:55.000Z",
      "editedBy": "prime@tgi.com",
      "editedOn": "2016-09-15T23:52:55.000Z"
    },
    {
      "id":2,
      "name":"Test Model",
      "isDeleted": 0,
      "createdBy": "prime@tgi.com",
      "createdOn": "2016-09-15T23:52:55.000Z",
      "editedBy": "prime@tgi.com",
      "editedOn": "2016-09-15T23:52:55.000Z"
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
app.get('/approved', function (req, res) {
    logger.info("Get approved models request received");

    var data = req.data;
    
    if (req.query.strategistId) {
        data.id = req.query.strategistId;
    }
    modelService.getApprovedModelsList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {post} /community/models/import/:modelId Import community model details
 * @apiName ImportCommunityModelDetails
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API import community model details
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/models/import/1
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {String}          nameSpace              Namespace of the Model.
 * @apiSuccess {Number}          statusId               StatusId of model
 * @apiSuccess {String}          status                 status of model
 * @apiSuccess {Number}          portfolioCount         Number of portfolio's model is assigned to.
 * @apiSuccess {Number}          modelAUM               Total sum of money invested in model.
 * @apiSuccess {Number}          ownerUserId            OwnerUserId of model.
 * @apiSuccess {String}          ownerUser              OwnerUser model
 * @apiSuccess {Number}          managementStyleId      ManagementStyleId of model
 * @apiSuccess {String}          managementStyle        ManagementStyle of model
 * @apiSuccess {Boolean}         isCommunityModel       flag if Model is imported from community.
 * @apiSuccess {Number}          approvedByUserId       UserId who approved the Model
 * @apiSuccess {String}          approvedByUser         User who approved the model.
 * @apiSuccess {Boolean}         isDynamic   	        Flag if Model is dynamic.
 * @apiSuccess {Boolean}         isDeleted              If model is deleted
 * @apiSuccess {Date}            createdOn              Created Date of Model
 * @apiSuccess {Date}            editedOn               Edited Date of Model
 * @apiSuccess {Number}          createdBy              User who created the Model
 * @apiSuccess {Number}          editedBy               User who edited the Model
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
		  "editedBy": 66
	}
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/import/:modelId', function (req, res) {
    logger.info("Import Community models request received");

    var data = req.data;
    
    if (req.params.modelId) {
        data.modelId = req.params.modelId;
    }
    modelService.importCommunityModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;