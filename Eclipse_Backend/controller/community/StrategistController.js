"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var express = require('express');
var app = express();
var helper = require('helper');
var util = require('util');
var response = require('controller/ResponseController.js');
var StrategistService = require('service/community/StrategistService.js');
var StrategistRequest = require('model/community/strategist/StrategistRequest.js');
var ModelRequest = require('model/community/model/ModelRequest.js');

var strategistService = new StrategistService();

var validate = helper.validate;

var communityStrategistIdSchema = {
    type: 'object',
    properties: {
        communityStrategistId: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}

var postCommunityStrategistSchema = {
    type: 'object',
    properties: {
        communityStrategistId: {
            type: 'number',
            required: true
        },
        name: {
            type: 'string',
            required: true
        }
    }
};

var putCommunityStrategistSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        }
    }
};

var postCommunityModelsSchema = {
    type: 'object',
    properties: {
        models: {
            type: 'array',
            required: true
        },
    }
};

var deleteCommunityModelsSchema = {
    type: 'object',
    properties: {
        ids: {
            type: 'array',
            items: {
                type: 'number',
            },
            required: true
        },
    }
};

/**
 * @api {get} /community/strategists Get All Strategist 
 * @apiName GetAllStrategist
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API provides  strategist list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists
 * 
 * @apiSuccess {Number}     id                      The Strategist id.
 * @apiSuccess {String}     name                    Fullname of the Strategist User.
 * @apiSuccess {Boolean}    isDeleted               Strategist exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Strategist into the system.
 * @apiSuccess {Date}       editedOn                Strategist edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist into the system.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
        "id": 3,
        "name": "Test strategist",
        "isDeleted": 0,
        "createdOn": "2016-09-21T07:29:41.000Z",
        "createdBy": "prime@tgi.com",
        "editedOn": "2016-09-28T07:29:53.000Z",
        "editedBy": "prime@tgi.com"
       }]
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
    logger.info("Get all strategist request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    strategistService.getList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {post} /community/strategists Add community strategists 
 * @apiName AddCommunityStrategists
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API provides  add community strategists. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiParam {Number}       id              Community strategist id. 
 * @apiParam {String}       name            Community Strategist Name.
 * 
 * @apiParamExample {json} Request-Example:
 *    {
        "id":1,
        "name":"Test strategist"
      }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists
 * 
 * @apiSuccess {Number}     id                      The Strategist Id.
 * @apiSuccess {String}     name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     communityStrategistId   The community StrategistId.
 * @apiSuccess {Boolean}    isDeleted               Strategist exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist into the system.
 * @apiSuccess {Date}       editedOn                Strategist edited date into application.
 * @apiSuccess {Number}     editedBy                Id of user who edited the Strategist into the system.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
            "id": 1,
            "name": "Demo strategist",
            "communityStrategistId": 1,
            "isDeleted": 0,
            "createdOn": "2016-11-03T11:42:35.000Z",
            "createdBy": 66,
            "editedOn": "2016-11-03T11:50:38.000Z",
            "editedBy": 66
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

app.post('/', validate({ body: postCommunityStrategistSchema }), function (req, res) {
    logger.info("Add  strategist request received");

    var data = new StrategistRequest(req.data);

    strategistService.addStrategist(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /community/strategists/:communityStrategistId  Update community strategists 
 * @apiName UpdateCommunityStrategists
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API provides  update community strategists. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiParam {String}       name            Community Strategist Name.
 * 
 * @apiParamExample {json} Request-Example:
 *    {
        "name":"Test strategist"
      }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1
 * 
 * @apiSuccess {Number}     id                      The Strategist Id.
 * @apiSuccess {String}     name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     communityStrategistId   The community StrategistId.
 * @apiSuccess {Boolean}    isDeleted               Strategist exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist into the system.
 * @apiSuccess {Date}       editedOn                Strategist edited date into application.
 * @apiSuccess {Number}     editedBy                Id of user who edited the Strategist into the system.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "id": 1,
            "name": "Demo strategist",
            "communityStrategistId": 1,
            "isDeleted": 0,
            "createdOn": "2016-11-03T11:42:35.000Z",
            "createdBy": 66,
            "editedOn": "2016-11-03T11:50:38.000Z",
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

app.put('/:communityStrategistId', validate({ params: communityStrategistIdSchema, body: putCommunityStrategistSchema }), function (req, res) {
    logger.info("Update  strategist request received");

    var data = req.data;
    data.communityStrategistId = req.params.communityStrategistId;
    data = new StrategistRequest(req.data);
    strategistService.updateStrategist(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {delete} /community/strategists/:communityStrategistId  Delete community strategists 
 * @apiName DeleteCommunityStrategists
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API provides  delete community strategists. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1
 * 
 * @apiSuccess {String}     message     Success message.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
         "message": "Strategists deleted successfully"
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

app.delete('/:communityStrategistId', validate({ params: communityStrategistIdSchema }), function (req, res) {
    logger.info("Update  strategist request received");

    var data = req.data;
    data.communityStrategistId = req.params.communityStrategistId;

    strategistService.deleteStrategist(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {post} /community/strategists/:communityStrategistId/models Add community models 
 * @apiName AddCommunityStrategistsModels
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API provides  add community strategists models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiParam {Number}       id              Community model id. 
 * @apiParam {String}       name            Community model Name.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
        "models" :[
            {
            "id":1,
            "name":"Test Model"
            },
            {
            "id":2,
            "name":"Demo Model"
            }
        ]        
    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/models
 * 
 * @apiSuccess {Number}     id                      The Model Id.
 * @apiSuccess {Number}     communityModelId        Community ModelId.
 * @apiSuccess {String}     name                    The Model name.
 * @apiSuccess {Number}     communityStrategistId   Community StrategistId.
 * @apiSuccess {Boolean}    isDeleted               Model exist or not into the system.
 * @apiSuccess {Date}       createdOn               Model creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the community model into the system.
 * @apiSuccess {Date}       editedOn                Model edited date into application.
 * @apiSuccess {Number}     editedBy                Id of user who edited the community model into the system.
 *  
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *    [
        {
            "id": 811,
            "communityModelId": 1,
            "name": "Test Model",
            "communityStrategistId": 203,
            "isDeleted": 0,
            "createdOn": "2016-11-11T06:46:42.000Z",
            "createdBy": 66,
            "editedOn": "2016-11-11T08:34:56.000Z",
            "editedBy": 66
            },
            {
            "id": 812,
            "communityModelId": 2,
            "name": "Demo Model",
            "communityStrategistId": 203,
            "isDeleted": 0,
            "createdOn": "2016-11-11T06:46:42.000Z",
            "createdBy": 66,
            "editedOn": "2016-11-11T08:34:56.000Z",
            "editedBy": 66
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

app.post('/:communityStrategistId/models', validate({ params: communityStrategistIdSchema, body: postCommunityModelsSchema }), function (req, res) {
    logger.info("Add  model request received");

    var data = req.data;
    data.communityStrategistId = req.params.communityStrategistId;
    data = new ModelRequest(req.data);

    strategistService.addStrategistModels(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /community/strategists/:communityStrategistId/models Update community models 
 * @apiName UpdateCommunityStrategistsModels
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API provides  update community strategists models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiParam {Number}       id              Community model id. 
 * @apiParam {String}       name            Community model Name.
 * 
 * @apiParamExample {json} Request-Example:
 *  {
        "models" :[
            {
            "id":1,
            "name":"Test Model"
            },
            {
            "id":2,
            "name":"Demo Model"
            }
        ]        
    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/models
 * 
 * @apiSuccess {Number}     id                      The Model Id.
 * @apiSuccess {Number}     communityModelId        Community ModelId.
 * @apiSuccess {String}     name                    The Model name.
 * @apiSuccess {Number}     communityStrategistId   Community StrategistId.
 * @apiSuccess {Boolean}    isDeleted               Model exist or not into the system.
 * @apiSuccess {Date}       createdOn               Model creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the community model into the system.
 * @apiSuccess {Date}       editedOn                Model edited date into application.
 * @apiSuccess {Number}     editedBy                Id of user who edited the community model into the system.
 *  
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *    [
        {
            "id": 811,
            "communityModelId": 1,
            "name": "Test Model",
            "communityStrategistId": 203,
            "isDeleted": 0,
            "createdOn": "2016-11-11T06:46:42.000Z",
            "createdBy": 66,
            "editedOn": "2016-11-11T08:34:56.000Z",
            "editedBy": 66
            },
            {
            "id": 812,
            "communityModelId": 2,
            "name": "Demo Model",
            "communityStrategistId": 203,
            "isDeleted": 0,
            "createdOn": "2016-11-11T06:46:42.000Z",
            "createdBy": 66,
            "editedOn": "2016-11-11T08:34:56.000Z",
            "editedBy": 66
            }
    ]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.put('/:communityStrategistId/models', validate({ params: communityStrategistIdSchema, body: postCommunityModelsSchema }), function (req, res) {
    logger.info("Update  model request received");

    var data = req.data;
    data.communityStrategistId = req.params.communityStrategistId;
    data = new ModelRequest(req.data);

    strategistService.updateStrategistModels(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {delete} /community/strategists/:communityStrategistId/models Delete community models 
 * @apiName DeleteCommunityStrategists
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API provides  delete community strategists models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiParam {Array}       ids              Community model id. 
 * 
 * @apiParamExample {json} Request-Example:
 *  {
     "ids":[1,2,3,4,5]
    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/models
 * 
 * @apiSuccess {String}     message     Success message.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
         "message": "Models deleted successfully"
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

app.delete('/:communityStrategistId/models', validate({ params: communityStrategistIdSchema, body: deleteCommunityModelsSchema }), function (req, res) {
    logger.info("Delete  model request received");

    var data = req.data;
    data.communityStrategistId = req.params.communityStrategistId;

    strategistService.deleteStrategistModels(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /community/strategists/approved Get all Approved strategists
 * @apiName  GetAllApprovedStrategists
 * @apiVersion 1.0.0
 * @apiGroup  Eclipse-Community
 * @apiPermission appuser
 *
 * @apiDescription This API provides  get all Approved strategists
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/approved
 * 
 * @apiSuccess {Number}     id          The strategist id.
 * @apiSuccess {String}     name        The strategist name.
 * @apiSuccess {Boolean}    isDeleted   Strategist exist or not into the system.
 * @apiSuccess {Date}       createdOn   Strategist creation date into application.
 * @apiSuccess {String}     createdBy   Id of user who created the Strategist into the system.
 * @apiSuccess {Date}       editedOn    Strategist edited date into application.
 * @apiSuccess {String}     editedBy    Id of user who edited the Strategist into the system.
 
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *   [
       {
        "id":1,
        "name":"Demo Strategist"
        "isDeleted": 0,
        "createdBy": "prime@tgi.com",
        "createdOn": "2016-09-15T23:52:55.000Z",
        "editedBy": "prime@tgi.com",
        "editedOn": "2016-09-15T23:52:55.000Z"
       },
       {
        "id":2,
        "name":"Test Strategist"
        "isDeleted": 0,
        "createdBy": "66",
        "createdOn": "2016-09-15T23:52:55.000Z",
        "editedBy": "66",
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
    logger.info("Get list of approved strategists request received");

    var data = req.data;

    strategistService.getApprovedStrategistList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;