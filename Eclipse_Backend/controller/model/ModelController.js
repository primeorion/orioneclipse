"use strict";

var app = require("express")();

var moduleName = __filename;

var config = require('config');
var logger = require("helper/Logger.js")(moduleName);
var helper = require("helper");
var jsonPatch = require("jsonpatch");
var response = require('controller/ResponseController.js');
var modelService = require('service/model/ModelService.js');
var modelConverter = require('converter/model/ModelConverter.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var analysisMiddleware = require('middleware/AnalysisMiddleware.js')
var ModelAnalysisService = require('service/model/ModelAnalysisService.js');
var modelAnalysisService = new ModelAnalysisService();

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
				is : "notEmpty",
				required : true
			},
			nameSpace : {
				type : 'string',
				is : "notEmpty",
				required : true
			}
		}
}

var modelStatusCreateSchema = {
		type : 'object',
		properties : {
			statusId : {
				enum : [1, 2, 3, 4],
				required : true
			}
		}
}

/**
 * @api {get} /modeling/models/managementStyles Get All Model Management Styles
 * @apiName GetModelsManagementStyles
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model managementStyles. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/managementStyles
 * 
 * @apiSuccess {Number}     id   				             The managementStyle Id.
 * @apiSuccess {String}     name                			 Name of the managementStyle.
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

app.get('/managementStyles', function(req, res){
	
	logger.info("Get managementStyles in models request received");
	
	var data = req.data;
	
	modelService.getMangementStyles(data, function(err, status, json){		
		response(null, responseCodes.SUCCESS, json, res);
	});
})

app.get('/tempoapi', function(req, res){
	
	logger.info("Get managementStyles in models request received");
	
	var data = req.data;
	
	setTimeout(function(){		
		console.log("settimeout");
		response(null, responseCodes.SUCCESS, null, res);
	}, 10000);
//	modelService.getMangementStyles(data, function(err, status, json){		
//	});
})

/**
 * @api {get} /modeling/models/modelTypes Get All Model types
 * @apiName GetModelsTypes
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model types. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/modelTypes
 * 
 * @apiSuccess {Number}     id   				             The modelType Id.
 * @apiSuccess {String}     name                			 Name of model TypeId
 * @apiSuccess {String}     displayName                			 Name of model TypeId
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": "1",
		    "name": "CATEGORY",
		    "displayName": "Category"
		  },
		  {
		    "id": "2",
		    "name": "CLASS",
		    "displayName": "Class"
		  },
		  {
		    "id": "3",
		    "name": "SUBCLASS",
		    "displayName": "Sub Class"
		  },
		  {
		    "id": "4",
		    "name": "SECURITYSET",
		    "displayName": "Security Set"
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

app.get('/modelTypes', function(req, res){
	
	logger.info("Get modelTypes in models request received");
	var relatedTypes = [];
	
	for(var val in reverseRelatedTypeCodeToId){
		var json = {};
		json.id = val;
		var code = reverseRelatedTypeCodeToId[val];
		json.name = code;
		json.displayName = relatedTypeCodeToDisplayName[code];
		relatedTypes.push(json);		
	}
	
	response(null, responseCodes.SUCCESS, relatedTypes, res);
})

/**
 * @api {get} /modeling/models/filterTypes Get All Model Filter Types 
 * @apiName GetModelsFilterTypes
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model all filters of model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/filterTypes
 * 
 * @apiSuccess {Number}     id   				             The filter Id.
 * @apiSuccess {String}     name                			 Name of the filter.
 * @apiSuccess {String}     filterType                		 the filter code.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[
		  {
		    "id": 1,
		    "name": "Approved Models",
		    "filterType": "APPROVED_MODELS"
		  },
		  {
		    "id": 2,
		    "name": "Waiting For Approval",
		    "filterType": "WAITING_FOR_APPROVAL"
		  },
		  {
		    "id": 3,
		    "name": "Draft Models",
		    "filterType": "DRAFT_MODELS"
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
app.get('/filterTypes', function(req, res){
	logger.info("Get filterTypes in models request received");
	
	var data = req.data;
	
	modelService.getFilterTypes(data, function(err, status, json){
		response(null, responseCodes.SUCCESS, json, res);		
	});
})

/**
 * @api {get} /modeling/models/modelStatus Get All Model status
 * @apiName GetModelStatuses
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model modelStatus. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/modelStatus
 * 
 * @apiSuccess {Number}     id   				             The modelStatus Id.
 * @apiSuccess {String}     status                			 Name of the model status.
 * @apiSuccess {String}     displayName					     Display-Name of the model status.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
[
		  {
		    "id": 1,
		    "status": "APPROVED",
		    "displayName": "Approved"
		  },
		  {
		    "id": 2,
		    "status": "NOT_ACTIVE",
		    "displayName": "Not Active"
		  },
		  {
		    "id": 3,
		    "status": "WAITITNG_FOR_APPROVAL",
		    "displayName": "Waiting For Approval"
		  },
		  {
		    "id": 4,
		    "status": "DRAFT",
		    "displayName": "Draft"
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
app.get('/modelStatus', function(req, res){
	logger.info("Get modelStatus in models request received");
	var data = req.data;
	
	modelService.getModelStatus(data, function(err, status, json){
		response(null, responseCodes.SUCCESS, json, res);		
	});
});

app.use("/upload", require("./ModelImportController.js"));

app.use(UserMiddleWare.getDifferentAccessForUser);

/**
 * @api {get} /modeling/models?search={id/name} Search Models 
 * @apiName SearchModels
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API search model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models?search={id/name}
 * 
 * @apiSuccess {Number}          id                       The model Id.
 * @apiSuccess {String}          name                     Name of the Model.
 * @apiSuccess {String}          description              Description of Model
 * @apiSuccess {Number}          portfolioCount           Number of portfolio's model is assigned to.
 * @apiSuccess {String}          source			          Source.
 * @apiSuccess {Number}          statusId                 StatusId of model.
 * @apiSuccess {String}          status	                  Status of model.
 * @apiSuccess {String}          nameSpace		          namespace.
 * @apiSuccess {String}          tags                     Tags.
 * @apiSuccess {Number}          isDynamic		          Whether model is Dynamic.
 * @apiSuccess {Number}          isSubstitutedForPortfolio Whether model is Substituted.
 * @apiSuccess {Number}          ownerUserId              OwnerUserId of model.
 * @apiSuccess {String}          ownerUser                OwnerUser model
 * @apiSuccess {Number}          managementStyleId        ManagementStyleId of model
 * @apiSuccess {String}          managementStyle          ManagementStyle of model
 * @apiSuccess {Boolean}         isCommunityModel         flag if Model is imported from community.
 * @apiSuccess {Number}			 communityModelId		  community modelId.
 * @apiSuccess {String}		     lastSyncDate		      community model last sync date.
 * @apiSuccess {Number}          approvedByUserId         UserId who approved the Model
 * @apiSuccess {String}          approvedByUser           User who approved the model.
 * @apiSuccess {Boolean}         isDeleted                If model is deleted
 * @apiSuccess {String}          createdOn                Created Date of Model
 * @apiSuccess {String}          createdBy                User who created the Model
 * @apiSuccess {String}          editedOn                 Edited Date of Model
 * @apiSuccess {String}          editedBy                 User who edited the Model
 * @apiSuccess {Array}           teams                    Teams
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 2,
		    "name": "model",
		    "description": "ksdjfl",
		    "portfolioCount": 5,
		    "source": "Team",
		    "statusId": 4,
		    "status": "DRAFT",
		    "namespace": null,
		    "tags": null,
		    "isDynamic": 0,
		    "isSubstitutedForPortfolio": 0,
		    "ownerUserId": 66,
		    "ownerUser": "prime@tgi.com",
		    "managementStyleId": 2,
		    "managementStyle": "Aggressive",
		    "isCommunityModel": null,
	     	"communityModelId": null,
    		"lastSyncDate": "2016-09-02T10:15:50.000Z",
		    "approvedByUserId": null,
		    "approvedByUser": "prime@tgi.com",
		    "isDeleted": 0,
		    "createdOn": "2016-10-03T14:22:37.000Z",
		    "createdBy": "prime@tgi.com",
		    "editedOn": "2016-10-03T16:44:44.000Z",
		    "editedBy": "prime@tgi.com",
		    "teams": [
		      {
		        "id": 1,
		        "name": "newest team1"
		      }
		    ]
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
/**
 * @api {get} /modeling/models Get All Models 
 * @apiName GetAllModels
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models
 * 
 * @apiSuccess {Number}          id                       The model Id.
 * @apiSuccess {String}          name                     Name of the Model.
 * @apiSuccess {String}          description              Description of Model
 * @apiSuccess {Number}          portfolioCount           Number of portfolio's model is assigned to.
 * @apiSuccess {String}          source			          Source.
 * @apiSuccess {Number}          statusId                 StatusId of model.
 * @apiSuccess {String}          status	                  Status of model.
 * @apiSuccess {String}          nameSpace		          namespace.
 * @apiSuccess {String}          tags                     Tags.
 * @apiSuccess {Number}          isDynamic		          Whether model is Dynamic.
 * @apiSuccess {Number}          isSubstitutedForPortfolio Whether model is Substituted.
 * @apiSuccess {Number}          ownerUserId              OwnerUserId of model.
 * @apiSuccess {String}          ownerUser                OwnerUser model
 * @apiSuccess {Number}          managementStyleId        ManagementStyleId of model
 * @apiSuccess {String}          managementStyle          ManagementStyle of model
 * @apiSuccess {Boolean}         isCommunityModel         flag if Model is imported from community.
 * @apiSuccess {Number}			 communityModelId		  community modelId.
 * @apiSuccess {String}		     lastSyncDate		      community model last sync date.
 * @apiSuccess {Number}          approvedByUserId         UserId who approved the Model
 * @apiSuccess {String}          approvedByUser           User who approved the model.
 * @apiSuccess {Boolean}         isDeleted                If model is deleted
 * @apiSuccess {String}          createdOn                Created Date of Model
 * @apiSuccess {String}          createdBy                User who created the Model
 * @apiSuccess {String}          editedOn                 Edited Date of Model
 * @apiSuccess {String}          editedBy                 User who edited the Model
 * @apiSuccess {Array}           teams                    Teams
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 2,
		    "name": "model",
		    "portfolioCount": 5,
		    "source": "Team",
		    "statusId": 4,
		    "status": "DRAFT",
		    "namespace": null,
		    "tags": null,
		    "isDynamic": 0,
		    "isSubstitutedForPortfolio": 0,
		    "description": "ksdjfl",
		    "ownerUserId": 66,
		    "ownerUser": "prime@tgi.com",
		    "managementStyleId": 2,
		    "managementStyle": "Aggressive",
		    "isCommunityModel": null,
		    "approvedByUserId": null,
		    "approvedByUser": "prime@tgi.com",
		    "isDeleted": 0,
		    "createdOn": "2016-10-03T14:22:37.000Z",
		    "createdBy": "prime@tgi.com",
		    "editedOn": "2016-10-03T16:44:44.000Z",
		    "editedBy": "prime@tgi.com",
		    "teams": [
		      {
		        "id": 1,
		        "name": "newest team1"
		      }
		    ]
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
/**
 * @api {get} /modeling/models?filter={FILTER_ID1,FILTER_ID2} Get All Models with filter 
 * @apiName GetAllModelsWithFilter
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model list with filters. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models?filter=1
 * 
 * @apiSuccess {Number}          id                       The model Id.
 * @apiSuccess {String}          name                     Name of the Model.
 * @apiSuccess {String}          description              Description of Model
 * @apiSuccess {Number}          portfolioCount           Number of portfolio's model is assigned to.
 * @apiSuccess {String}          source			          Source.
 * @apiSuccess {Number}          statusId                 StatusId of model.
 * @apiSuccess {String}          status	                  Status of model.
 * @apiSuccess {String}          nameSpace		          namespace.
 * @apiSuccess {String}          tags                     Tags.
 * @apiSuccess {Number}          isDynamic		          Whether model is Dynamic.
 * @apiSuccess {Number}          isSubstitutedForPortfolio Whether model is Substituted.
 * @apiSuccess {Number}          ownerUserId              OwnerUserId of model.
 * @apiSuccess {String}          ownerUser                OwnerUser model
 * @apiSuccess {Number}          managementStyleId        ManagementStyleId of model
 * @apiSuccess {String}          managementStyle          ManagementStyle of model
 * @apiSuccess {Boolean}         isCommunityModel         flag if Model is imported from community.
 * @apiSuccess {Number}			 communityModelId		  community modelId.
 * @apiSuccess {String}		     lastSyncDate		      community model last sync date.
 * @apiSuccess {Number}          approvedByUserId         UserId who approved the Model
 * @apiSuccess {String}          approvedByUser           User who approved the model.
 * @apiSuccess {Boolean}         isDeleted                If model is deleted
 * @apiSuccess {String}          createdOn                Created Date of Model
 * @apiSuccess {String}          createdBy                User who created the Model
 * @apiSuccess {String}          editedOn                 Edited Date of Model
 * @apiSuccess {String}          editedBy                 User who edited the Model
 * @apiSuccess {Array}           teams                    Teams
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 2,
		    "name": "model",
		    "portfolioCount": 5,
		    "source": "Team",
		    "statusId": 4,
		    "status": "DRAFT",
		    "namespace": null,
		    "tags": null,
		    "isDynamic": 0,
		    "isSubstitutedForPortfolio": 0,
		    "description": "ksdjfl",
		    "ownerUserId": 66,
		    "ownerUser": "prime@tgi.com",
		    "managementStyleId": 2,
		    "managementStyle": "Aggressive",
		    "isCommunityModel": null,
		    "approvedByUserId": null,
		    "approvedByUser": "prime@tgi.com",
		    "isDeleted": 0,
		    "createdOn": "2016-10-03T14:22:37.000Z",
		    "createdBy": "prime@tgi.com",
		    "editedOn": "2016-10-03T16:44:44.000Z",
		    "editedBy": "prime@tgi.com",
		    "teams": [
		      {
		        "id": 1,
		        "name": "newest team1"
		      }
		    ]
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

/**
 * @api {get} /modeling/models?name={NAME}&nameSpace={NAMESPACE} Get All Models with with name and nameSpace 
 * @apiName GetAllModelsWithNameAndNamespace
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model list by name and nameSpace. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models?name=prime&nameSpace=xyz
 * 
 * @apiSuccess {Number}          id                       The model Id.
 * @apiSuccess {String}          name                     Name of the Model.
 * @apiSuccess {String}          description              Description of Model
 * @apiSuccess {Number}          portfolioCount           Number of portfolio's model is assigned to.
 * @apiSuccess {String}          source			          Source.
 * @apiSuccess {Number}          statusId                 StatusId of model.
 * @apiSuccess {String}          status	                  Status of model.
 * @apiSuccess {String}          nameSpace		          namespace.
 * @apiSuccess {String}          tags                     Tags.
 * @apiSuccess {Number}          isDynamic		          Whether model is Dynamic.
 * @apiSuccess {Number}          isSubstitutedForPortfolio Whether model is Substituted.
 * @apiSuccess {Number}          ownerUserId              OwnerUserId of model.
 * @apiSuccess {String}          ownerUser                OwnerUser model
 * @apiSuccess {Number}          managementStyleId        ManagementStyleId of model
 * @apiSuccess {String}          managementStyle          ManagementStyle of model
 * @apiSuccess {Boolean}         isCommunityModel         flag if Model is imported from community.
 * @apiSuccess {Number}			 communityModelId		  community modelId.
 * @apiSuccess {String}		     lastSyncDate		      community model last sync date.
 * @apiSuccess {Number}          approvedByUserId         UserId who approved the Model
 * @apiSuccess {String}          approvedByUser           User who approved the model.
 * @apiSuccess {Boolean}         isDeleted                If model is deleted
 * @apiSuccess {String}          createdOn                Created Date of Model
 * @apiSuccess {String}          createdBy                User who created the Model
 * @apiSuccess {String}          editedOn                 Edited Date of Model
 * @apiSuccess {String}          editedBy                 User who edited the Model
 * @apiSuccess {Array}           teams                    Teams
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 2,
		    "name": "model",
		    "portfolioCount": 5,
		    "source": "Team",
		    "statusId": 4,
		    "status": "DRAFT",
		    "namespace": null,
		    "tags": null,
		    "isDynamic": 0,
		    "isSubstitutedForPortfolio": 0,
		    "description": "ksdjfl",
		    "ownerUserId": 66,
		    "ownerUser": "prime@tgi.com",
		    "managementStyleId": 2,
		    "managementStyle": "Aggressive",
		    "isCommunityModel": null,
		    "approvedByUserId": null,
		    "approvedByUser": "prime@tgi.com",
		    "isDeleted": 0,
		    "createdOn": "2016-10-03T14:22:37.000Z",
		    "createdBy": "prime@tgi.com",
		    "editedOn": "2016-10-03T16:44:44.000Z",
		    "editedBy": "prime@tgi.com",
		    "teams": [
		      {
		        "id": 1,
		        "name": "newest team1"
		      }
		    ]
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


app.get('/', function (req, res) {
	logger.info("Get all models request received");
    
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    if(req.query.name){
    	data.name = req.query.name;
    }
    if(req.query.nameSpace){
    	data.namespace = req.query.nameSpace;
    }
    if(req.query.filter){
    	var filterList = req.query.filter;
    	var filterIdsArr =  filterList.split(",");
    	data.filterId = filterIdsArr; 
    	modelService.getModelsByFilter(data, function(err, status, data){
    		return response(err, status, data, res);
    	});
    }else{
    	modelService.getModelList(data, function (err, status, data) {
    		return response(err, status, data, res);
    	});    	
    }
});

app.use(require("./SubModelController.js"));
app.use(require("./ModelPortfolioController.js"));
app.use(require("./ModelSleeveController.js"));
app.use(require("./SubstitutedModelController.js"));


/**
 * @api {get} /modeling/models/:id/teams Get All teams for Models
 * @apiName GetTeamsForModels
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets All teams for Models
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/teams
 * 
 * @apiSuccess {Number}     id   				             The team Id.
 * @apiSuccess {Number}     name                			 Name of the team.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
		    "id": 491,
		    "name": "Test2016"
		  },
		  {
		    "id": 492,
		    "name": "HDC team1"
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

app.get('/:id/teams', validate({ params: modelIdSchema }),   UserMiddleWare.getSpecificModelAccessForUser, function(req, res){
	
	logger.info("Get teams in models request received");
	
	var data = req.data;
	data.id = req.params.id;
	
	modelService.getTeamsForModel(data, function(err, status, json){		
		response(null, responseCodes.SUCCESS, json, res);
	});
})

/**
 * @api {post} /modeling/models/:id/modelDetail Add Model Detail for model
 * @apiName AddModelDetail
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API Add Model Detail or Structure. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 *     
 * @apiParam {ModelDetail}    modelDetail 	                                Complete Tree Structure.
 * @apiParam {String}		  modelDetail.id 	                            id of submodel
 * @apiParam {String}		  modelDetail.name 	                            name
 * @apiParam {String}         modelDetail.nameSpace 	                    nameSpace
 * @apiParam {securityAsset}  modelDetail.securityAsset						Security Asset Obj.
 * @apiParam {Number}         modelDetail.securityAsset.id			 	    Actual id of asset which is used.
 * @apiParam {Number}         modelDetail.targetPercent 		            Target Percent.
 * @apiParam {String}         modelDetail.toleranceType 		            ToleranceType can be one of two vlaues range/(fixband%) Id
 * @apiParam {Number}         modelDetail.toleranceTypeValue 	            value of tolerance type.
 * @apiParam {Number}         modelDetail.rank 	                            rank
 * @apiParam {Number}         modelDetail.lowerModelTolerancePercent		lowerModelTolerancePercent.
 * @apiParam {Number}         modelDetail.upperModelTolerancePercent 	    upperModelTolerancePercent
 * @apiParam {Number}         modelDetail.upperTradeTolerancePercent 	    upperTradeTolerancePercent
 * @apiParam {Number}         modelDetail.upperTradeTolerancePercent		upperTradeTolerancePercent
 * @apiParam {Number}         modelDetail.lowerModelToleranceAmount 	    lowerModelToleranceAmount
 * @apiParam {Number}         modelDetail.upperModelToleranceAmount 	    upperModelToleranceAmount
 * @apiParam {ModelDetail[]}  modelDetail.children 	                        Children of current Node
 * @apiParam {Number}         modelDetail.isEdited 	          				When using submodel, and if you change the submodel. \n Changes can of two types 1. adding/removing child or changing the child, changing percentages of child.
 * @apiParam {Number}         modelDetail.isSubstituted 	                If current submodel is isSubstituted.
 * @apiParam {Number}         modelDetail.substitutedOf 	                The submodel which is acting substitute of this node
 * 
 * @apiParamExample {json} Request-Example:
 * 
{	
	"modelDetail": {
			"name" : "asdf",
			"targetPercent": 100,
			"toleranceType": "RANGE",
			"toleranceTypeValue": 44,
			"rank" : 1,
			"lowerModelTolerancePercent": 0,
			"upperModelTolerancePercent": 0,
			"lowerModelToleranceAmount": 0,
			"upperModelToleranceAmount": 0,
			"lowerTradeTolerancePercent": 0,
			"upperTradeTolerancePercent": 0,
			"isSubstituted" : 1, 
			"substitutedOf" : oldsubmodeiId,
			"isEdited" : 1,  
			"children": [
			  {
				"id": 9,
				"name": "Test Model 13",
				"nameSpace" : "namespace"
				"modelTypeId" : 1,
				"securityAsset" : {
					"id" : 1
				},
				"targetPercent": 5,
				"rank" : 1,
				"toleranceType": "RANGE",
				"toleranceTypeValue": 44,
				"lowerModelTolerancePercent": 5,
				"upperModelTolerancePercent": 5,
				"lowerModelToleranceAmount": 5,
				"upperModelToleranceAmount": 5,
				"lowerTradeTolerancePercent": null,
				"upperTradeTolerancePercent": null,
				"children": [
				  {
					"id": 7,
					"name": "Test Model 13",
					"modelTypeId" : 1,
					"securityAsset" : {
						"id" : 1
					},
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
					"children": []
				  },
				  {
					"id": 8,
					"name": "Test Model 13",
					"modelTypeId" : 1,
					"securityAsset" : {
						"id" : 1
					},
					"targetPercent": 5,
					"rank" : 1,
					"lowerModelTolerancePercent": 5,
					"upperModelTolerancePercent": 5,
					"toleranceType": "RANGE",
					"toleranceTypeValue": 44,
					"lowerModelToleranceAmount": null,
					"upperModelToleranceAmount": null,
					"lowerTradeTolerancePercent": 5,
					"upperTradeTolerancePercent": 5,
					"children": []
				  }
				]
			  },
			  {
				"id": 12,
				"name": "Large cap",
				"modelTypeId" : 1,
				"securityAsset" : {
					"id" : 1
				},
				"targetPercent": 5,
				"rank" : 1,
				"lowerModelTolerancePercent": 5,
				"upperModelTolerancePercent": 5,
				"toleranceType": "RANGE",
				"toleranceTypeValue": 44,
				"lowerModelToleranceAmount": 5,
				"upperModelToleranceAmount": 5,
				"lowerTradeTolerancePercent": null,
				"upperTradeTolerancePercent": null,
				"children": []
			  }
		   ]
	}
}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/modelDetail
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
				"modelType": null,
				"modelTypeId": null,
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
				"children": [
				  {
					"id": 7,
					"name": "Test Model 13",
					"modelType": null,
					"modelTypeId": null,
					"targetPercent": 5,
					"rank" : 1,
					"lowerModelTolerancePercent": 5,
					"upperModelTolerancePercent": 5,
					"toleranceType": "RANGE",
					"toleranceTypeValue": 44,
					"lowerModelToleranceAmount": 5,
					"upperModelToleranceAmount": 5,
					"lowerTradeTolerancePercent": null,
					"upperTradeTolerancePercent": null,
					"level": "2",
					"leftValue": 3,
					"rightValue": 4,
					"children": []
				  },
				  {
					"id": 8,
					"name": "Test Model 13",
					"modelType": null,
					"modelTypeId": null,
					"targetPercent": 5,
					"rank" : 1,
					"lowerModelTolerancePercent": 5,
					"upperModelTolerancePercent": 5,
					"toleranceType": "RANGE",
					"toleranceTypeValue": 44,
					"lowerModelToleranceAmount": 5,
					"upperModelToleranceAmount": 5,
					"lowerTradeTolerancePercent": null,
					"upperTradeTolerancePercent": null,
					"level": "2",
					"leftValue": 5,
					"rightValue": 6,
					"children": []
				  }
				]
			},
			{
				"id": 12,
				"name": "Large cap",
				"modelType": null,
				"modelTypeId": null,
				"targetPercent": 5,
				"rank" : 1,
				"lowerModelTolerancePercent": 5,
				"upperModelTolerancePercent": 5,
				"toleranceType": "RANGE",
				"toleranceTypeValue": 44,
				"lowerModelToleranceAmount": null,
				"upperModelToleranceAmount": null,
				"lowerTradeTolerancePercent": 5,
				"upperTradeTolerancePercent": 5,
				"level": "1",
				"leftValue": 8,
				"rightValue": 9,
				"children": []
			}
		]
	}
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
 *
 */
							
app.post("/:id/modelDetail", 
		validate({ params: modelIdSchema }), 
		UserMiddleWare.getSpecificModelAccessForUser,
		analysisMiddleware.post_import_analysis,
		function(req, res){
	logger.info("create model detail request received");

	var data = req.data;
	var id = req.params.id;
	data.id = id;
	
	modelService.saveCompleteModel(data, function(err, status, data){		
		return response(err, status, data, res);
	});
});

/**
 * @api {post} /modeling/models Add Model
 * @apiName AddModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API Add Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}          id                     The model Id.
 * @apiParam {String}          name                   Name of the Model.
 * @apiParam {String}          nameSpace              Namespace of the Model.
 * @apiParam {String}          description            Description of Model 
 * @apiParam {String}          tags                   tags of Model
 * @apiParam {Number}          statusId               StatusId of model
 * @apiParam {Number}          managementStyleId      ManagementStyleId of model
 * @apiParam {Boolean}         isCommunityModel       flag if Model is imported from community.
 * @apiParam {Boolean}         isDynamic 	      	  Flag if Model is dynamic.
 * 
 * @apiParamExample {json} Request-Example:
		{
		  "name": "Test Model 13",
		  "nameSpace" : "dsf",
		  "description": null,
		  "statusId": 1,
		  "managementStyleId": 2,
		  "isCommunityModel": null,
		  "isDynamic": 0
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {String}          nameSpace              Namespace of the Model.
 * @apiSuccess {Number}          statusId               StatusId of model
 * @apiSuccess {String}          status                 status of model
 * @apiSuccess {String}          tags                   Tags.
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
 * @apiSuccess {String}          createdOn              Created Date of Model
 * @apiSuccess {String}          editedOn               Edited Date of Model
 * @apiSuccess {String}          createdBy              User who created the Model
 * @apiSuccess {String}          editedBy               User who edited the Model
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
		  "createdBy": 66,
		  "editedOn": "2016-09-27T05:00:59.000Z",
		  "editedBy": 66
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
 *
 */

app.post("/", validate({ body: modelUpdateCreateSchema }), function(req, res){
	logger.info("create model request received");

	var data = req.data;
	
	var model = modelConverter.getGeneralModelModelFromModelRequest(data);
	
	modelService.createOrUpdateGeneralModel(model, function(err, status, data){		
		return response(err, status, data, res);
	});
});

/**
 * @api {put} /modeling/models/:id/modelDetail update Model Detail
 * @apiName UpdateModelDetail
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API update Model Detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}		  substitutedModelId 	                        When creating substitute no need to send it. but when updating substitute you need to send the subsituted modelId. which you will get from portfolio.
 * @apiParam {Number}		  substitutedFor		 	                    Id of portfolio for which this model is substituted.
 * @apiParam {ModelDetail}    modelDetail 	                                Complete Tree Structure.
 * @apiParam {String}		  modelDetail.id 	                            id of submodel
 * @apiParam {String}		  modelDetail.modelDetailId 	                internal id of model-submodel associations
 * @apiParam {String}		  modelDetail.name 	                            name
 * @apiParam {String}         modelDetail.nameSpace 	                    nameSpace
 * @apiParam {securityAsset}  modelDetail.securityAsset						Security Asset Obj.
 * @apiParam {Number}         modelDetail.securityAsset.id			 	    Actual id of asset which is used.
 * @apiParam {Number}         modelDetail.targetPercent 		            Target Percent.
 * @apiParam {String}         modelDetail.toleranceType 		            ToleranceType can be one of two vlaues range/fixband% Id
 * @apiParam {Number}         modelDetail.toleranceTypeValue 	            value of tolerance type.
 * @apiParam {Number}         modelDetail.rank 	                            rank
 * @apiParam {Number}         modelDetail.lowerModelTolerancePercent		lowerModelTolerancePercent.
 * @apiParam {Number}         modelDetail.upperModelTolerancePercent 	    upperModelTolerancePercent
 * @apiParam {Number}         modelDetail.upperTradeTolerancePercent 	    upperTradeTolerancePercent
 * @apiParam {Number}         modelDetail.upperTradeTolerancePercent		upperTradeTolerancePercent
 * @apiParam {Number}         modelDetail.lowerModelToleranceAmount 	    lowerModelToleranceAmount
 * @apiParam {Number}         modelDetail.upperModelToleranceAmount 	    upperModelToleranceAmount
 * @apiParam {ModelDetail[]}  modelDetail.children 	                        Children of current Node
 * @apiParam {Number}         modelDetail.isEdited 	          				When using submodel, and if you change the submodel. \n Changes can of two types 1. adding/removing child or changing the child, changing percentages of child.
 * @apiParam {Number}         modelDetail.isSubstituted 	                If current submodel is isSubstituted.
 * @apiParam {Number}         modelDetail.substitutedOf 	                The submodel which is acting substitute of this node
 * 
 * @apiParamExample {json} Request-Example:
{	
	"substitutedModelId" : 1,
	"substitutedFor" : "PORTFOLIO_ID"
	"modelDetail": {
			"name" : "asdf",
			"targetPercent": 100,
			"toleranceType": "RANGE",
			"toleranceTypeValue": 44,
			"rank" : 1,
			"lowerModelTolerancePercent": 0,
			"upperModelTolerancePercent": 0,
			"lowerModelToleranceAmount": 0,
			"upperModelToleranceAmount": 0,
			"lowerTradeTolerancePercent": 0,
			"upperTradeTolerancePercent": 0,
			"isSubstituted" : 1, 
			"substitutedOf" : oldsubmodeiId,
			"isEdited" : 1,  
			"children": [
			  {
				"id": 9,
				"name": "Test Model 13",
				"nameSpace" : "namespace"
				"modelTypeId" : 1,
				"securityAsset" : {
					"id" : 1
				},
				"targetPercent": 5,
				"rank" : 1,
				"toleranceType": "RANGE",
				"toleranceTypeValue": 44,
				"lowerModelTolerancePercent": 5,
				"upperModelTolerancePercent": 5,
				"lowerModelToleranceAmount": 5,
				"upperModelToleranceAmount": 5,
				"lowerTradeTolerancePercent": null,
				"upperTradeTolerancePercent": null,
				"children": [
				  {
					"id": 7,
					"name": "Test Model 13",
					"modelTypeId" : 1,
					"securityAsset" : {
						"id" : 1
					},
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
					"children": []
				  },
				  {
					"id": 8,
					"name": "Test Model 13",
					"modelTypeId" : 1,
					"securityAsset" : {
						"id" : 1
					},
					"targetPercent": 5,
					"rank" : 1,
					"lowerModelTolerancePercent": 5,
					"upperModelTolerancePercent": 5,
					"toleranceType": "RANGE",
					"toleranceTypeValue": 44,
					"lowerModelToleranceAmount": null,
					"upperModelToleranceAmount": null,
					"lowerTradeTolerancePercent": 5,
					"upperTradeTolerancePercent": 5,
					"children": []
				  }
				]
			  },
			  {
				"id": 12,
				"name": "Large cap",
				"modelTypeId" : 1,
				"securityAsset" : {
					"id" : 1
				},
				"targetPercent": 5,
				"rank" : 1,
				"lowerModelTolerancePercent": 5,
				"upperModelTolerancePercent": 5,
				"toleranceType": "RANGE",
				"toleranceTypeValue": 44,
				"lowerModelToleranceAmount": 5,
				"upperModelToleranceAmount": 5,
				"lowerTradeTolerancePercent": null,
				"upperTradeTolerancePercent": null,
				"children": []
			  }
		   ]
	}
}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/modelDetail
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {Number}          statusId               StatusId of model
 * @apiSuccess {String}          status                 status of model
 * @apiSuccess {String}          tags                   Tags.
 * @apiSuccess {Number}          portfolioCount         Number of portfolio's model is assigned to.
 * @apiSuccess {Number}          modelAUM               Total sum of money invested in model.
 * @apiSuccess {Number}          ownerUserId            OwnerUserId of model.
 * @apiSuccess {String}          ownerUser              OwnerUser model
 * @apiSuccess {Number}          managementStyleId      ManagementStyleId of model
 * @apiSuccess {String}          managementStyle        ManagementStyle of model
 * @apiSuccess {Boolean}         isCommunityModel       flag if Model is imported from community.
 * @apiSuccess {Number}          approvedByUserId       UserId who approved the Model
 * @apiSuccess {String}          approvedByUser         User who approved the model.
 * @apiSuccess {Boolean}         isDynamic  	        Flag if Model is dynamic.
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
				"modelType": null,
				"modelTypeId": null,
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
				"children": [
				  {
					"id": 7,
					"name": "Test Model 13",
					"modelType": null,
					"modelTypeId": null,
					"targetPercent": 5,
					"rank" : 1,
					"lowerModelTolerancePercent": 5,
					"upperModelTolerancePercent": 5,
					"toleranceType": "RANGE",
					"toleranceTypeValue": 44,
					"lowerModelToleranceAmount": 5,
					"upperModelToleranceAmount": 5,
					"lowerTradeTolerancePercent": null,
					"upperTradeTolerancePercent": null,
					"level": "2",
					"leftValue": 3,
					"rightValue": 4,
					"children": []
				  },
				  {
					"id": 8,
					"name": "Test Model 13",
					"modelType": null,
					"modelTypeId": null,
					"targetPercent": 5,
					"rank" : 1,
					"lowerModelTolerancePercent": 5,
					"upperModelTolerancePercent": 5,
					"toleranceType": "RANGE",
					"toleranceTypeValue": 44,
					"lowerModelToleranceAmount": 5,
					"upperModelToleranceAmount": 5,
					"lowerTradeTolerancePercent": null,
					"upperTradeTolerancePercent": null,
					"level": "2",
					"leftValue": 5,
					"rightValue": 6,
					"children": []
				  }
				]
			},
			{
				"id": 12,
				"name": "Large cap",
				"modelType": null,
				"modelTypeId": null,
				"targetPercent": 5,
				"rank" : 1,
				"lowerModelTolerancePercent": 5,
				"upperModelTolerancePercent": 5,
				"toleranceType": "RANGE",
				"toleranceTypeValue": 44,
				"lowerModelToleranceAmount": null,
				"upperModelToleranceAmount": null,
				"lowerTradeTolerancePercent": 5,
				"upperTradeTolerancePercent": 5,
				"level": "1",
				"leftValue": 8,
				"rightValue": 9,
				"children": []
			}
		]
	}
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
 *
 */

app.put("/:id/modelDetail", 
		validate({ params: modelIdSchema }), 
		UserMiddleWare.getSpecificModelAccessForUser,
		analysisMiddleware.post_import_analysis,
		function(req, res){
	logger.info("udpate model detail request received");

	var data = req.data;
	var id = req.params.id;
	data.id = id;
	
	modelService.saveCompleteModel(data, function(err, status, data){		
		return response(err, status, data, res);
	});
	
});


/**

 * @api {put} /modeling/models/:id update Model
 * @apiName UpdateModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API update Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}          id                     The model Id.
 * @apiParam {String}          name                   Name of the Model.
 * @apiParam {String}          nameSpace              Namespace of the Model.
 * @apiParam {String}          description            Description of Model
 * @apiParam {String}          tags                   tags of Model 
 * @apiParam {Number}          statusId               StatusId of model
 * @apiParam {Number}          managementStyleId      ManagementStyleId of model
 * @apiParam {Boolean}         isCommunityModel       flag if Model is imported from community.
 * 
 * @apiParamExample {json} Request-Example:
		{
		  "name": "Test Model 13",
		  "nameSpace" : "sdf",
		  "description": null,
		  "statusId": 1,
		  "managementStyleId": 2,
		  "isCommunityModel": null,
		  "isDynamic": 0
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {String}          nameSpace              Namespace of Model
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
 * @apiSuccess {Boolean}         isDynamic  	        Flag if Model is dynamic.
 * @apiSuccess {Boolean}         isDeleted              If model is deleted
 * @apiSuccess {String}          createdOn              Created Date of Model
 * @apiSuccess {String}          editedOn               Edited Date of Model
 * @apiSuccess {String}          createdBy              User who created the Model
 * @apiSuccess {String}          editedBy               User who edited the Model
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
 *
 */

app.put("/:id", 
		validate({ params: modelIdSchema }), 
		validate({ body: modelUpdateCreateSchema }), 
		validate({ body: modelStatusCreateSchema }),
		UserMiddleWare.getSpecificModelAccessForUser, 
function(req, res){
	logger.info("update model request received");

	var data = req.data;
	var id = req.params.id;
	data.id = id;
	
	var model = modelConverter.getGeneralModelModelFromModelRequest(data);
	modelService.createOrUpdateGeneralModel(model, function(err, status, data){		
		return response(err, status, data, res);
	});

});

/**
 * @api {patch} /modeling/models/:id update certain fields in Model
 * @apiName UpdateCertainFieldsModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API certain fields in update Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Array}          data                   Array of operationss.
 * 
 * @apiParamExample {json} Request-Example:
		{
			"data" : [
					{ "op" : "replace", "path" : "/name" , "value" : "model name"	},
					{ "op" : "replace", "path" : "/nameSpace" , "value" : "team name"	}
				]
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {String}          nameSpace              Namespace of Model
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
 * @apiSuccess {Boolean}         isDynamic  	        Flag if Model is dynamic.
 * @apiSuccess {Boolean}         isDeleted              If model is deleted
 * @apiSuccess {String}          createdOn              Created Date of Model
 * @apiSuccess {String}          editedOn               Edited Date of Model
 * @apiSuccess {String}          createdBy              User who created the Model
 * @apiSuccess {String}          editedBy               User who edited the Model
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
 *
 */
app.patch("/:id", 
		validate({ params: modelIdSchema }), 
		UserMiddleWare.getSpecificModelAccessForUser, 
function(req, res){
	logger.info("update certain fields in model request received");

	var data = req.data;
	var id = req.params.id;
	data.id = id;
	modelService.getModelAsResponse(data, function(err, status, model){
		if (err) {
	        logger.error("Error service (getModelAsResponse())" + err);
	        return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
	    }
		if(status == responseCodes.SUCCESS){			
			model = jsonPatch.apply_patch(model, data.data);
			model.user = {};
			model = modelConverter.getGeneralModelModelFromModelRequestByPatch(data, model);
			model = modelConverter.getGeneralModelModelFromModelRequest(model);
			modelService.createOrUpdateGeneralModel(model, function(err, status, data){		
				return response(err, status, data, res);
			});
		}else{
			return response(err, status, model, res);
		}
	})

});

/**
 * @api {delete} /modeling/models/:id Delete Model 
 * @apiName DeleteModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Model (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Model deleted Successfully"
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
 * @apiError Unprocessable_Entity When Security does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Model does not exists "
 *     }
 * 
 */
app.delete("/:id", validate({ params: modelIdSchema }), UserMiddleWare.getSpecificModelAccessForUser, function(req, res){
	logger.info("delete model request received");

	var data = req.data;
	var id = req.params.id;
	data.id = id;
	
	modelService.deleteModel(data, function(err, status, data){		
		return response(err, status, data, res);
	});
});

/**
 * @api {get} /modeling/models/:id/canDelete Can Delete Model
 * @apiName CanDeleteModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API returns whether model can be deleted or not(soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/canDelete
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
        	"status" : 1,
            "message": "model can be deleted"
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
 * @apiError Unprocessable_Entity When Security does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Model does not exists "
 *     }
 * 
 */
app.get("/:id/canDelete", validate({ params: modelIdSchema }), UserMiddleWare.getSpecificModelAccessForUser, function(req, res){
	logger.info("delete model request received");

	var data = req.data;
	var id = req.params.id;
	data.id = id;
	
	modelService.modelDeleteCheck(data, function(err, status, data){		
		return response(err, status, data, res);
	});
});


/**
 * @api {get} /modeling/models/:id Get Detailed Model 
 * @apiName GetDetailedModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model with Details. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id
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
 * @apiSuccess {Boolean}         isDynamic 	            Flag if Model is dynamic.
 * @apiSuccess {Boolean}         isDeleted              If model is deleted
 * @apiSuccess {String}          createdOn              Created Date of Model
 * @apiSuccess {String}          editedOn               Edited Date of Model
 * @apiSuccess {String}          createdBy              User who created the Model
 * @apiSuccess {String}          editedBy               User who edited the Model
 * @apiSuccess {ModelElement}    modelDetail            Compelete Structure of Model
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
{
  "id": 1,
  "name": "Community Model 1",
  "description": null,
  "nameSpace": "asdfa",
  "statusId": 3,
  "status": "Waiting For Approval",
  "tags": null,
  "ownerUserId": 66,
  "ownerUser": "prime@tgi.com",
  "managementStyleId": 1,
  "managementStyle": "Conservative",
  "isCommunityModel": null,
  "communityModelId": null,
  "lastSyncDate": "2016-09-02T10:15:50.000Z",
  "approvedByUserId": null,
  "approvedByUser": null,
  "isDynamic": 0,
  "isDeleted": 0,
  "createdOn": "2016-09-02T10:15:50.000Z",
  "editedOn": "2016-11-15T09:43:17.000Z",
  "createdBy": "prime@tgi.com",
  "editedBy": "prime@tgi.com",
  "modelDetail": {
    "modelDetailId": 1529,
    "id": 343083,
    "name": "Test Model 13",
    "nameSpace": null,
    "children": [
      {
        "id": 343023,
        "name": "Raj Categor24919",
        "modelType": "Category",
        "modelTypeId": 1,
        "nameSpace": "test",
        "securityAsset": {
          "id": 1,
          "name": "Asset Category 1",
          "color": "#123456"
        },
        "leftValue": 2,
        "rightValue": 5,
        "modelDetailId": 1524,
        "targetPercent": 50,
        "lowerModelTolerancePercent": 5,
        "upperModelTolerancePercent": 5,
        "lowerModelToleranceAmount": 5,
        "upperModelToleranceAmount": 5,
        "lowerTradeTolerancePercent": null,
        "upperTradeTolerancePercent": null,
        "rank": 1,
        "toleranceType": "RANGE",
        "toleranceTypeValue": 44,
        "isSubstituted": null,
        "substitutedOf": null,
        "children": [
          {
            "id": 343028,
            "name": "Raj Sset24919",
            "modelType": "Security Set",
            "modelTypeId": 4,
            "nameSpace": "test",
            "securityAsset": {
              "id": 36,
              "color": null
            },
            "leftValue": 3,
            "rightValue": 4,
            "modelDetailId": 1523,
            "targetPercent": 100,
            "lowerModelTolerancePercent": 5,
            "upperModelTolerancePercent": 5,
            "lowerModelToleranceAmount": 5,
            "upperModelToleranceAmount": 5,
            "lowerTradeTolerancePercent": null,
            "upperTradeTolerancePercent": null,
            "rank": 1,
            "toleranceType": "RANGE",
            "toleranceTypeValue": 44,
            "isSubstituted": null,
            "substitutedOf": null,
            "children": []
          }
        ]
      },
      {
        "id": 343024,
        "name": "Raj Cagor24949",
        "modelType": "Category",
        "modelTypeId": 1,
        "nameSpace": "test",
        "securityAsset": {
          "id": 101,
          "name": "Asset Category 101",
          "color": "#96e499"
        },
        "leftValue": 6,
        "rightValue": 13,
        "modelDetailId": 1528,
        "targetPercent": 50,
        "lowerModelTolerancePercent": 5,
        "upperModelTolerancePercent": 5,
        "lowerModelToleranceAmount": 5,
        "upperModelToleranceAmount": 5,
        "lowerTradeTolerancePercent": null,
        "upperTradeTolerancePercent": null,
        "rank": 1,
        "toleranceType": "RANGE",
        "toleranceTypeValue": 44,
        "isSubstituted": null,
        "substitutedOf": null,
        "children": [
          {
            "id": 343025,
            "name": "Raj Class24919",
            "modelType": "Class",
            "modelTypeId": 2,
            "nameSpace": "test",
            "securityAsset": {
              "id": 528,
              "name": "ass cla",
              "color": null
            },
            "leftValue": 7,
            "rightValue": 12,
            "modelDetailId": 1527,
            "targetPercent": 100,
            "lowerModelTolerancePercent": 5,
            "upperModelTolerancePercent": 5,
            "lowerModelToleranceAmount": 5,
            "upperModelToleranceAmount": 5,
            "lowerTradeTolerancePercent": null,
            "upperTradeTolerancePercent": null,
            "rank": 1,
            "toleranceType": "RANGE",
            "toleranceTypeValue": 44,
            "isSubstituted": null,
            "substitutedOf": null,
            "children": [
              {
                "id": 343026,
                "name": "Raj Subclass24919",
                "modelType": "Sub Class",
                "modelTypeId": 3,
                "nameSpace": "test",
                "securityAsset": {
                  "id": 2413,
                  "name": "Asset Sub Class 2413",
                  "color": "#123456"
                },
                "leftValue": 8,
                "rightValue": 11,
                "modelDetailId": 1526,
                "targetPercent": 100,
                "lowerModelTolerancePercent": 5,
                "upperModelTolerancePercent": 5,
                "lowerModelToleranceAmount": 5,
                "upperModelToleranceAmount": 5,
                "lowerTradeTolerancePercent": null,
                "upperTradeTolerancePercent": null,
                "rank": 1,
                "toleranceType": "RANGE",
                "toleranceTypeValue": 44,
                "isSubstituted": null,
                "substitutedOf": null,
                "children": [
                  {
                    "id": 343027,
                    "name": "Raj Secset24919",
                    "modelType": "Security Set",
                    "modelTypeId": 4,
                    "nameSpace": "test",
                    "securityAsset": {
                      "id": 52,
                      "color": null
                    },
                    "leftValue": 9,
                    "rightValue": 10,
                    "modelDetailId": 1525,
                    "targetPercent": 100,
                    "lowerModelTolerancePercent": 5,
                    "upperModelTolerancePercent": 5,
                    "lowerModelToleranceAmount": 5,
                    "upperModelToleranceAmount": 5,
                    "lowerTradeTolerancePercent": null,
                    "upperTradeTolerancePercent": null,
                    "rank": 1,
                    "toleranceType": "RANGE",
                    "toleranceTypeValue": 44,
                    "isSubstituted": null,
                    "substitutedOf": null,
                    "children": []
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    "level": "0",
    "leftValue": 1,
    "rightValue": 14
  },
  "portfolioCount": 291,
  "modelAUM": 1602.4
}
		
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.get('/:id', validate({ params: modelIdSchema }), UserMiddleWare.getSpecificModelAccessForUser, function (req, res) {
	logger.info("Get all models request received");
    
    var data = req.data;
    data.id = req.params.id;
    
    data.approved = true;
    modelService.getCompleteModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /modeling/models/:id/pending Get Changed Detailed Model 
 * @apiName GetChangedDetailedModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets model Detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/pending
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {Number}          statusId               StatusId of model
 * @apiSuccess {String}          status                 status of model
 * @apiSuccess {String}          editedOn               Edited Date of Model
 * @apiSuccess {String}          editedBy               User who edited the Model
 * @apiSuccess {ModelElement}    modelDetail            Compelete Structure of Model
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
{
	  "id": 2,
	  "statusId": 1,
	  "status": "APPROVED",
	  "editedOn": "2016-09-27T05:00:59.000Z",
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
				"modelType": null,
				"modelTypeId": null,
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
				"children": [
				  {
					"id": 7,
					"name": "Test Model 13",
					"modelType": null,
					"modelTypeId": null,
					"targetPercent": 5,
					"rank" : 1,
					"lowerModelTolerancePercent": 5,
					"upperModelTolerancePercent": 5,
					"toleranceType": "RANGE",
					"toleranceTypeValue": 44,
					"lowerModelToleranceAmount": 5,
					"upperModelToleranceAmount": 5,
					"lowerTradeTolerancePercent": null,
					"upperTradeTolerancePercent": null,
					"level": "2",
					"leftValue": 3,
					"rightValue": 4,
					"children": []
				  },
				  {
					"id": 8,
					"name": "Test Model 13",
					"modelType": null,
					"modelTypeId": null,
					"targetPercent": 5,
					"rank" : 1,
					"lowerModelTolerancePercent": 5,
					"upperModelTolerancePercent": 5,
					"toleranceType": "RANGE",
					"toleranceTypeValue": 44,
					"lowerModelToleranceAmount": 5,
					"upperModelToleranceAmount": 5,
					"lowerTradeTolerancePercent": null,
					"upperTradeTolerancePercent": null,
					"level": "2",
					"leftValue": 5,
					"rightValue": 6,
					"children": []
				  }
				]
			},
			{
				"id": 12,
				"name": "Large cap",
				"modelType": null,
				"modelTypeId": null,
				"targetPercent": 5,
				"rank" : 1,
				"lowerModelTolerancePercent": 5,
				"upperModelTolerancePercent": 5,
				"toleranceType": "RANGE",
				"toleranceTypeValue": 44,
				"lowerModelToleranceAmount": null,
				"upperModelToleranceAmount": null,
				"lowerTradeTolerancePercent": 5,
				"upperTradeTolerancePercent": 5,
				"level": "1",
				"leftValue": 8,
				"rightValue": 9,
				"children": []
			}
		]
	}
}
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.get('/:id/pending', validate({ params: modelIdSchema }), UserMiddleWare.getSpecificModelAccessForUser, function (req, res) {
	logger.info("Get all models request received");
    
    var data = req.data;
    data.id = req.params.id;
    data.pending = true;
    modelService.getCompleteModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /modeling/models/:id/levels Get all the levels in Model. 
 * @apiName GetLevelsForModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets all the levels for model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/levels
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name               	name of level
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
	[
	  {},
	  {
	    "id": 1,
	    "name": "Category"
	  },
	  {
	    "id": 2,
	    "name": "Class"
	  },
	  {
	    "id": 4,
	    "name": "Security Set"
	  },
	  {
	    "id": 3,
	    "name": "Sub Class"
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

app.get('/:id/levels', validate({ params: modelIdSchema }), UserMiddleWare.getSpecificModelAccessForUser, function (req, res) {
	logger.info("Get all models request received");
    
    var data = req.data;
    data.id = req.params.id;
    
    modelService.getLevelsInModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {put} /modeling/models/:id/pending/{approve/reject} Approve reject temporary model
 * @apiName approveRejectTemporaryModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API approves the approved model changes which are waiting for approval. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/pending/{approve/reject}
 * 
 * @apiSuccess {String}          message                     Success Message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    { 
 *    		message : "Model changes are reflected in approved model"  
 *    }
 *    
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    { 
 *    		message : "Model changes are rejected"
 *    }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.put('/:id/pending/:actionStatus', validate({params: modelIdSchema}), 
									  validate({params : actionStatus}), UserMiddleWare.getSpecificModelAccessForUser, 
									  function (req, res) {
	logger.info("Get all models request received");
    
    var data = req.data;
    data.id = req.params.id;
    
    var model = modelConverter.getGeneralModelModelFromModelRequest(data);
    model.actionStatus = req.params.actionStatus;
    
    modelService.approveRejectTemporaryModel(model, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /modeling/models/1/allocations  Get Model Allocations For securities
 * @apiName GetModelAllocations
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get holding list by for securities in model.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/1/allocations

 * @apiSuccess {Number}     id               Holding Id.
 * @apiSuccess {String}     symbol           Account number associated with holding.
 * @apiSuccess {String}     name		     Security name.
 * @apiSuccess {Number}     targetInPercent  Holding value.
 *
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
	[
	  {
	    "id": 1,
	    "name" : "apple",
	    "symbol": "APPL",
	    "targetInPercent": 50,
	  },
	  {
	    "id": 2,
	    "name" : "microsoft",
	    "symbol": "MSFT",
	    "targetInPercent": 50,
	  }
	]
 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

app.get('/:id/allocations', function (req, res) {
    logger.info("Get allocations details request received");

    var data = req.data;
    data.id = req.params.id;
    var dummyData = [];
    
    modelService.getTargetAllocationsForSecuritiesInSecuritySet(data, function(err, status, data){    	
    	return response(err, status, data, res);
    })
});

/**
 * @apiignore
 * @api {get} /modeling/models/1/canSavePending  Get Whether changes in model will be saved as temporary.
 * @apiName GetModelTemporarySaveCheck
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get whether save is temporary or not.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/1/canSavePending

 * @apiSuccess {Number}     status            Status whether will used for temporary save if 1 than will be saved temporary other wise directly reflected.
 * @apiSuccess {String}     message           Message.
 *
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

app.get('/:id/canSavePending', function (req, res) {
    logger.info("Get allocations details request received");

    var json = {};
    json.status = 1;
    json.message = "The changes in model needs approval";
    

    return response(null, "SUCCESS", json, res);
});

/**
 * @api {post} /modeling/models/:id/copy Copy Model
 * @apiName CopyModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API Copy Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}          name                   Name of the Model.
 * @apiParam {String}          nameSpace              Namespace of the Model.
 * 
 * @apiParamExample {json} Request-Example:
		{
		  "name": "Test Model 13",
		  "namespace" : "dsf"
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/copy
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {String}          nameSpace              Namespace of the Model.
 * @apiSuccess {Number}          statusId               StatusId of model
 * @apiSuccess {String}          status                 status of model
 * @apiSuccess {String}          tags                   Tags.
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
 * @apiSuccess {String}          createdOn              Created Date of Model
 * @apiSuccess {String}          editedOn               Edited Date of Model
 * @apiSuccess {String}          createdBy              User who created the Model
 * @apiSuccess {String}          editedBy               User who edited the Model
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
		  "createdBy": 66,
		  "editedOn": "2016-09-27T05:00:59.000Z",
		  "editedBy": 66
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
 *
 */

app.post("/:id/copy", validate({ body: modelUpdateCreateSchema }), function(req, res){
	logger.info("copy model request received");

	var data = req.data;
	data.id = req.params.id;

	modelService.copyModel(data, function(err, status, data){		
		return response(err, status, data, res);
	});
});


/**
 * @api {get} /modeling/models/:id/canRebalance Whether rebalancer for Model can be run.
 * @apiName canRebalancerRunForModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This just checks whether rebalancer can be run or not. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/:id/canRebalance
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     
 * @apiSuccess {Number}     status            Status whether can rebalancer can be run or not.
 * @apiSuccess {String}     message           Message.

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
 *
 */

app.get("/:id/canRebalance", function(req, res){
	logger.info("copy model request received");

	 var json = {};
	 json.status = 1;
	 json.message = "rebalancer can be run for model";
	    

    return response(null, "SUCCESS", json, res);
    
});

app.get("/:id/dynamicModel", function(req, res){
	logger.info("create quantity of scuriites in dynamic model");

	var data = req.data;
	data.id = req.params.id;

	modelService.createOrUpdateDynamicModelSecuritiesQuantities(data, function(err, status, data){		
		return response(err, status, data, res);
	});
    
});

/**
 * @api {get} /modeling/models/{modelId}/modelAnalysis?assetType={securityset/category/class/subclass}&isIncludeTradeBlockAccount=0&isExcludeAsset=0 Get Model Analysis 
 * @apiName Get ModelAnalysis
 * @apiVersion 1.0.0
 * @apiGroup Models
 *
 * @apiDescription This API get model analysis for securityset, category, class or subclass
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/{modelId}/modelAnalysis?assetType={securityset/category/class/subclass}&isIncludeTradeBlockAccount=0&isExcludeAsset=0
 * 
 * @apiSuccess {Number}      assetId:                        	Asset id Which can be securityId, classId, subclassId or categoryId.
 * @apiSuccess {String}      assetName:                         Asset name Which can be securityName, className, subclassName, categoryName. 
 * @apiSuccess {String}      assetSymbol:                       Asset symbol same as security symbol not available for others. 
 * @apiSuccess {Decimal}     targetInPercentage                 Target value in percentage.         
 * @apiSuccess {Decimal}     currentInPercentage:               Current value in percentage.
 * @apiSuccess {Decimal}     postTradeInPercentage:             Post trade value in percentage.
 * @apiSuccess {Decimal}     differenceInPercentage:            Difference in percentage.
 * @apiSuccess {Decimal}     lowerModelTolerancePercentage:     Lower Model Tolerance in percentage.
 * @apiSuccess {Decimal}     upperModelTolerancePercentage:     Upper Model Tolerance in percentage.
 * @apiSuccess {Decimal}     currentInDollar                    Current value in dollar amount.
 * @apiSuccess {Boolean}     targetInDollar                     Target value in dollar amount.
 * @apiSuccess {Decimal}     differenceInDollar                 Difference in dollar.
 * @apiSuccess {String}      postTradeInDollar                  Post trade value in dollar.
 * @apiSuccess {Decimal}     currentInShares                    Current value in shares.
 * @apiSuccess {Boolean}     targetInShares                     Target value in shares.
 * @apiSuccess {Decimal}     differenceInShares                 Difference in shares
 * @apiSuccess {Boolean}     postTradeInShares                  Post trade value in shares.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  [
 *    {
 *         "assetId": 14630,
 *         "assetName": "Int IQ Smart Annuity: Janus Balanced",
 *         "assetSymbol": "ABCD126",
 *         "targetInPercentage": 0,
 *         "currentInPercentage": 22.8,
 *         "postTradeInPercentage": 22.8,
 *         "differenceInPercentage": 0,
 *         "lowerModelTolerancePercentage": 0,
 *         "upperModelTolerancePercentage": 0,
 *         "currentInDollar": 16000,
 *         "targetInDollar": 0,
 *         "differenceInDollar": 16000,
 *         "postTradeInDollar": 16000,
 *         "currentInShares": 40,
 *         "targetInShares": 0,
 *         "differenceInShares": 40,
 *         "postTradeInShares": 40
 *   }
 * ]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/:id/modelAnalysis', function (req, res) {
    logger.info("Get Model Tolerance list of security request received");
    var data = req.data;
    data.id = req.params.id;
	if(req.query.assetType){
        data.assetType = req.query.assetType
    }
	if (req.query.isIncludeCostBasis) {
        data.isIncludeCostBasis = req.query.isIncludeCostBasis;
    }  
    if (req.query.isIncludeTradeBlockAccount) {
        data.isIncludeTradeBlockAccount = req.query.isIncludeTradeBlockAccount;
    }  
    if (req.query.isExcludeAsset) {
        data.isExcludeAsset = req.query.isExcludeAsset;
    }  
    modelAnalysisService.getModelAnalysis(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @api {get} /modeling/models/{modelId}/modelAnalysis/modelAggregate?isIncludeCostBasis=0&isIncludeTradeBlockAccount=0&isExcludeAsset=0 Get Model Analysis Aggregate 
 * @apiName Get Model Analysis Aggregate
 * @apiVersion 1.0.0
 * @apiGroup Models
 *
 * @apiDescription This API get model aggregate detail for model analysis. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/{modelId}/modelAnalysis/modelAggregate?isIncludeCostBasis=0&isIncludeTradeBlockAccount=0&isExcludeAsset=0
 * 
 * @apiSuccess {Decimal}      costBasis                         Cost basis.
 * @apiSuccess {Decimal}      cashValue:                        Cash value.
 * @apiSuccess {Decimal}      cashDiffrence:                    Cash Diffrence. 
 * @apiSuccess {Decimal}      totalCash:                        Total Cash. 
 * @apiSuccess {Decimal}      marketValue:                      Market value.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * {
 *      "costBasis": 0,
 *      "cashValue": 24000,
 *      "cashDifference": 0,
 *      "totalCash": 24000,
 *      "marketValue": 286950    
 * }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/:id/modelAnalysis/modelAggregate', function (req, res) {
    logger.info("Get Model Tolerance list of security request received");
    var data = req.data;
    data.modelId = req.params.id;
	if (req.query.isIncludeCostBasis) {
        data.isIncludeCostBasis = req.query.isIncludeCostBasis;
    }  
    if (req.query.isIncludeTradeBlockAccount) {
        data.isIncludeTradeBlockAccount = req.query.isIncludeTradeBlockAccount;
    }  
    if (req.query.isExcludeAsset) {
        data.isExcludeAsset = req.query.isExcludeAsset;
    }  
    modelAnalysisService.getModelAggregate(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


module.exports = app;