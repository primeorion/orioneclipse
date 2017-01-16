"use strict";

var app = require("express")();

var moduleName = __filename;

var config = require('config');
var helper = require("helper");
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var modelService = require('service/model/ModelService.js');
var modelConverter = require('converter/model/ModelConverter.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var responseCodes = config.responseCode;

var applicationEnum = config.applicationEnum;

var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var reverseRelatedTypeCodeToId = applicationEnum.reverseRelatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var reverseRelatedTypeCodeToDisplayName = applicationEnum.reverseRelatedTypeCodeToDisplayName;
var validate = helper.validate;

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

/**
 * @api {get} /modeling/models/submodels?modelType={ModelTypeId} Get Sub Model based on type
 * @apiName GetSubModelsBasedOnType
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets sub model by modelTypeId. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels?modelType=1
 * 
 * @apiSuccess {Number}         id   				            The model node Id.
 * @apiSuccess {String}         name                			Name of the model node.
 * @apiSuccess {String}         modelType   				    The model Display name of relatedType.
 * @apiSuccess {Number}         modelTypeId   				    The modeltype Id.
 * @apiSuccess {Boolean}        isFavorite					    Just to tell whether this is favorite or not
 * @apiSuccess {String}         nameSpace					    Namespace
 * @apiSuccess {SecurityAsset}  securityAsset                   model node securityAssetType.
 * @apiSuccess {Number}   		 securityAsset.id			   id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name			   name of actual security asset.
 * @apiSuccess  {String}   		 securityAsset.color		   color of actual security asset.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 3,
		    "name": "1 dfakdshfkh",
		    "modelType": "Category",
		    "modelTypeId": 1,
		    "isFavorite" : 1,
		    "securityAsset": {
		      "id": 1,
		      "name": "Asset Category 1",
		      "color": "#123456"
		    }
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
 * @api {get} /modeling/models/submodels?favorites={BOOLEAN} Get All Sub Model based favorites flag.
 * @apiName GetSubModelsBasedOnFavorite
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets all submodels based on favorites flag. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels?favorites={BOOLEAN}
 * 
 * @apiSuccess {Number}         id   				            The model node Id.
 * @apiSuccess {String}         name                			Name of the model node.
 * @apiSuccess {String}         modelType   				    The model Display name of relatedType.
 * @apiSuccess {Number}         modelTypeId   				    The modeltype Id.
 * @apiSuccess {Boolean}        isFavorite					    Just to tell whether this is favorite or not
 * @apiSuccess {String}         nameSpace					    Namespace
 * @apiSuccess {SecurityAsset}  securityAsset                   model node securityAssetType.
 * @apiSuccess {Number}   		 securityAsset.id			   id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name			   name of actual security asset.
 * @apiSuccess  {String}   		 securityAsset.color		   color of actual security asset.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 3,
		    "name": "1 dfakdshfkh",
		    "modelType": "Category",
		    "modelTypeId": 1,
		    "isFavorite" : 1,
		    "securityAsset": {
		      "id": 1,
		      "name": "Asset Category 1",
		      "color": "#123456"
		    }
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
 * @api {get} /modeling/models/submodels?modelType={ModelTypeId}&search={ID/NAME} Get All Sub Model based on type and search name and id
 * @apiName GetSubModelsBasedOnTypeAndSearch
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets sub-model based on two criterias modelType and search on name and id. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels?modelType=1&search=equity
 * 
 * @apiSuccess {Number}         id   				            The model node Id.
 * @apiSuccess {String}         name                			Name of the model node.
 * @apiSuccess {String}         modelType   				    The model Display name of relatedType.
 * @apiSuccess {Number}         modelTypeId   				    The modeltype Id.
 * @apiSuccess {Boolean}        isFavorite					    Just to tell whether this is favorite or not
 * @apiSuccess {String}         nameSpace					    Namespace
 * @apiSuccess {SecurityAsset}  securityAsset                   model node securityAssetType.
 * @apiSuccess {Number}   		 securityAsset.id			   id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name			   name of actual security asset.
 * @apiSuccess  {String}   		 securityAsset.color		   color of actual security asset.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 3,
		    "name": "1 dfakdshfkh",
		    "modelType": "Category",
		    "modelTypeId": 1,
		    "isFavorite" : 1,
		    "securityAsset": {
		      "id": 1,
		      "name": "Asset Category 1",
		      "color": "#123456"
		    }
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
 * @api {get} /modeling/models/submodels?name={NAME}&nameSpace={NAMESPACE} Get All Sub Model based on name and id
 * @apiName GetSubModelsBasedOnNameAndNamespace
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets submodels by name and namespace. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels?name=equity&nameSpace=prime
 * 
 * @apiSuccess {Number}         id   				            The model node Id.
 * @apiSuccess {String}         name                			Name of the model node.
 * @apiSuccess {String}         modelType   				    The model Display name of relatedType.
 * @apiSuccess {Number}         modelTypeId   				    The modeltype Id.
 * @apiSuccess {Boolean}        isFavorite					    Just to tell whether this is favorite or not
 * @apiSuccess {String}         nameSpace					    Namespace
 * @apiSuccess {SecurityAsset}  securityAsset                   model node securityAssetType.
 * @apiSuccess {Number}   		 securityAsset.id			   id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name			   name of actual security asset.
 * @apiSuccess  {String}   		 securityAsset.color		   color of actual security asset.
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
		  {
		    "id": 3,
		    "name": "1 dfakdshfkh",
		    "modelType": "Category",
		    "modelTypeId": 1,
		    "isFavorite" : 1,
		    "securityAsset": {
		      "id": 1,
		      "name": "Asset Category 1",
		      "color": "#123456"
		    }
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

app.get('/submodels', function (req, res) {
	logger.info("Get nodes models request received");
    
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    
    if (req.query.favorites) {
        data.isFavorite = req.query.favorites;
    }
    
    if(req.query.name){
    	data.name = req.query.name;
    }
    if(req.query.nameSpace){
    	data.namespace = req.query.nameSpace;
    }
    
    if(req.query.modelType){
    	data.relatedType = reverseRelatedTypeCodeToId[req.query.modelType];
    }
	modelService.getNodeList(data, function (err, status, data) {
		return response(err, status, data, res);    	
	});
});

/**
 * @api {post} /modeling/models/submodels Create model submodel
 * @apiName AddSubModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API Add SubModel. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}          name                          Name of the Model.
 * @apiParam {String}          nameSpace					 Namespace
 * @apiParam {Number}          modelTypeId                   relatedTypeId of Model
 * @apiParam {Boolean}         isFavorite					 Just to tell whether this is favorite or not
 * @apiParam {securityAsset}   securityAsset				 Actual security class which is being represented by this node.
 * @apiSuccess {Number}   		 securityAsset.id			   id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name			   name of actual security asset.
 * @apiSuccess  {String}   		 securityAsset.color		   color of actual security asset.
 * 
 * @apiParamExample {json} Request-Example:
		{
			 name : NAME,
			 nameSpace : "kulwant",
			 modelTypeId : 1/2/3 (Category/Class/SubClass),
			 isFavorite : 1,
			 securityAsset : 
			 {
			   "id" : ID
			 }
		}

 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels
 * 
 * @apiSuccess {String}          name                          Name of the Model.
 * @apiSuccess {String}          nameSpace					   Namespace
 * @apiSuccess {String}          modelType                     modelType can be either of CATEGORY/CLASS/SUBCLASS
 * @apiSuccess {Number}          modelTypeId                   relatedTypeId of Model
 * @apiSuccess {Boolean}         isFavorite					   Just to tell whether this is favorite or not
 * @apiSuccess {securityAsset}   securityAsset				   security Asset object
 * @apiSuccess {Number}   		 securityAsset.id			   id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name			   name of actual security asset.
 * @apiSuccess  {String}   		 securityAsset.color		   color of actual security asset.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
		{
		    "id": 3,
		    "name": "1 dfakdshfkh",
		    "nameSpace" : "namespace",
		    "modelType": "Category",
		    "modelTypeId": 1,
		    "isFavorite" : 1,
		    "securityAsset": {
		      "id": 1,
		      "name": "Asset Category 1",
		      "color": "#123456"
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
app.post('/submodels', validate({ body: modelUpdateCreateSchema }), function (req, res) {
	logger.info("Get nodes models request received");
    
    var data = req.data;
    var model = modelConverter.getModelElementModelFromModelRequest(data);
	modelService.createModelElement(model, function (err, status, data) {
		return response(err, status, data, res);    	
	});
});

/**
 * @api {put} /modeling/models/submodels/:id Update submodel
 * @apiName UpdateSubModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API update SubModel. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}          name                          Name of the Model.
 * @apiParam {String}          nameSpace					 Namespace
 * @apiParam {Boolean}         isFavorite					 Just to tell whether this is favorite or not
 * 
 * @apiParamExample {json} Request-Example:
		{
		    "name": "1 dfakdshfkh",
		    "nameSpace" : "namespace",
		    "isFavorite" : 1
		}

 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels/1
 * 
 * @apiSuccess {String}          name                          Name of the Model.
 * @apiSuccess {String}          nameSpace					   Namespace
 * @apiSuccess {String}          modelType                     modelType can be either of CATEGORY/CLASS/SUBCLASS
 * @apiSuccess {Number}          modelTypeId                   relatedTypeId of Model
 * @apiSuccess {Boolean}         isFavorite					   Just to tell whether this is favorite or not
 * @apiSuccess {securityAsset}   securityAsset				   security Asset object
 * @apiSuccess {Number}   		 securityAsset.id			   id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name			   name of actual security asset.
 * @apiSuccess  {String}   		 securityAsset.color		   color of actual security asset.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
		{
		    "id": 3,
		    "name": "1 dfakdshfkh",
		    "nameSpace" : "namespace",
		    "modelType": "Category",
		    "modelTypeId": 1,
		    "isFavorite" : 1,
		    "securityAsset": {
		      "id": 1,
		      "name": "Asset Category 1",
		      "color": "#123456"
		    }
		 }
		  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
		{
		    "message": "model updated"
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
app.put('/submodels/:id', validate({ params: modelIdSchema }), validate({ body: modelUpdateCreateSchema }), function (req, res) {
	logger.info("Get sub-models request received");
    
    var data = req.data;
    var id = req.params.id;    
    data.id = id;
    
    var model = modelConverter.getModelElementModelFromModelRequest(data);
    
	modelService.updateModelElement(model, function (err, status, data) {
		return response(err, status, data, res);    	
	});
});


/**
 * @api {put} /modeling/models/submodels/favorites/:id Update submodel favorite status
 * @apiName UpdateSubModelFavoriteStatus
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API update favorite flag for SubModel. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Boolean}         isFavorite					 Just to tell whether this is favorite or not
 * 
 * @apiParamExample {json} Request-Example:
		{
			   "isFavorite" : BOOLEAN
		}

 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels/favorites/:id
 * 
 * @apiSuccess {String}          message                          Favorites updated.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
		{
		    "message": "Model flag for favorite updated"
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
app.put('/submodels/favorites/:id', validate({ params: modelIdSchema }), function (req, res) {
	logger.info("Get nodes models request received");
    
    var data = req.data;
    var id = req.params.id;    
    data.id = id;
    
    var model = modelConverter.getModelElementModelFromModelRequest(data);
    
	modelService.setUnsetFavoriteForSubModel(model, function (err, status, data) {
		return response(err, status, data, res);    	
	});
});


/**
 * @api {get} /modeling/models/submodels/:id Get Detailed Sub Model 
 * @apiName GetDetailedSubModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API gets submodel detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels/:id
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          nameSpace				Namespace
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {String}          modelType              modelType
 * @apiSuccess {Number}   		 securityAsset.id		id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name		name of actual security asset.
 * @apiSuccess {String}   		 securityAsset.color	color of actual security asset.
 * @apiSuccess {ModelElement[]}  children 				childrens
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		{
		  "id": 2,
		  "name": "1 2 child",
		  "modelType": "Security Set",
		  "securityAsset": {
		    "id": 1
		  },
		  "level": "2",
		  "leftValue": 5,
		  "rightValue": 6,
		  "isSubstituted": null,
		  "substituteOf": null,
		  "children": []
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

app.get('/submodels/:id', validate({ params: modelIdSchema }), function (req, res) {
	logger.info("Get all submodels request received");
    
    var data = req.data;
    data.id = req.params.id;
    
    modelService.getSubModelStructure(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {delete} /modeling/models/submodels/:id?modelId={ID}  Delete Sub-Model 
 * @apiName DeleteSubModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Sub-Model (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/modeling/models/submodels/:id?modelId=1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Sub-Model deleted Successfully"
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
 *       "message": " Sub-Model does not exists "
 *     }
 * 
 */
app.delete("/submodels/:id", validate({ params: modelIdSchema }), function(req, res){
	logger.info("delete model request received");

	var data = req.data;
	var id = req.params.id;
	data.id = id;
	data.modelId = req.query.modelId;
	
	modelService.deleteSubModel(data, function(err, status, data){		
		return response(err, status, data, res);
	});
});

/**
 * @api {get} /modeling/models/submodels/:id/canDelete?modelId={ID} Can Delete Sub-Model
 * @apiName CanDeleteSubModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API returns whether sub-model can be deleted or not(soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/modeling/models/submodels/:id/canDelete?modelId=1
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
app.get("/submodels/:id/canDelete", validate({ params: modelIdSchema }), function(req, res){
	logger.info("delete model request received");

	var data = req.data;
	var id = req.params.id;
	data.id = id;
	data.modelId = req.query.modelId;
	
	modelService.canDeleteSubModel(data, function(err, status, data){		
		return response(err, status, data, res);
	});
});

/**
 * @api {post} /modeling/models/submodels/:id/copy Copy SubModel
 * @apiName CopySubModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API Copy Sub-Model. 
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
 * curl -i http://baseurl/v1/modeling/models/submodel/:id/copy
 * 
 * @apiSuccess {Number}          id                     The model Id.
 * @apiSuccess {String}          name                   Name of the Model.
 * @apiSuccess {String}          nameSpace				Namespace
 * @apiSuccess {String}          description            Description of Model
 * @apiSuccess {String}          modelType              modelType
 * @apiSuccess {Number}   		 securityAsset.id		id of actual security asset.
 * @apiSuccess {String}   		 securityAsset.name		name of actual security asset.
 * @apiSuccess {String}   		 securityAsset.color	color of actual security asset.
 * @apiSuccess {ModelElement[]}  children 				childrens
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
{
  "id": 350,
  "name": "phani",
  "modelType": "Category",
  "modelTypeId": 1,
  "nameSpace": "10221 team",
  "securityAsset": null,
  "leftValue": 4,
  "rightValue": 11,
  "children": [
    {
      "id": 286,
      "name": "Model-Class1",
      "modelType": "Class",
      "modelTypeId": 2,
      "nameSpace": null,
      "securityAsset": null,
      "leftValue": 5,
      "rightValue": 8,
      "targetPercent": 50,
      "lowerModelTolerancePercent": 25,
      "upperModelTolerancePercent": 25,
      "lowerModelToleranceAmount": null,
      "upperModelToleranceAmount": null,
      "lowerTradeTolerancePercent": null,
      "upperTradeTolerancePercent": null,
      "toleranceType": null,
      "toleranceTypeValue": 25,
      "isSubstituted": null,
      "children": [
        {
          "id": 292,
          "name": "SubClass-28-OCT3",
          "modelType": "Sub Class",
          "modelTypeId": 3,
          "nameSpace": null,
          "securityAsset": null,
          "leftValue": 6,
          "rightValue": 7,
          "targetPercent": 100,
          "lowerModelTolerancePercent": 5,
          "upperModelTolerancePercent": 5,
          "lowerModelToleranceAmount": 5,
          "upperModelToleranceAmount": 5,
          "lowerTradeTolerancePercent": null,
          "upperTradeTolerancePercent": null,
          "toleranceType": null,
          "toleranceTypeValue": null,
          "isSubstituted": null,
          "children": []
        }
      ]
    },
    {
      "id": 287,
      "name": "Model-Class2",
      "modelType": "Class",
      "modelTypeId": 2,
      "nameSpace": null,
      "securityAsset": null,
      "leftValue": 9,
      "rightValue": 10,
      "targetPercent": 50,
      "lowerModelTolerancePercent": 12.5,
      "upperModelTolerancePercent": 12.5,
      "lowerModelToleranceAmount": null,
      "upperModelToleranceAmount": null,
      "lowerTradeTolerancePercent": null,
      "upperTradeTolerancePercent": null,
      "toleranceType": null,
      "toleranceTypeValue": 25,
      "isSubstituted": null,
      "children": []
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
 *
 */

app.post("/submodels/:id/copy", validate({ body: modelUpdateCreateSchema }), function(req, res){
	logger.info("copy submodel request received");

	var data = req.data;
	data.id = req.params.id;

	modelService.copySubModel(data, function(err, status, data){		
		return response(err, status, data, res);
	});
});



module.exports = app;
