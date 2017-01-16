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

app.use(require('middleware/DBConnection').community);
app.use(require('middleware/DBConnection').common);

var modelBodySchema = {
    type: 'object',
    properties: {

        name: {
            type: 'string',
            required: true
        },
        targetRiskLower: {
            type: 'string',
            required: true
        },
        targetRiskUpper: {
            type: 'string',
        },
        currentRisk: {
            type: 'string',
        },
        minimumAmount: {
            type: 'number',
        },
        style: {
            type: 'string',
        },
        tickersWithTargetInPercentage: {
            type: 'number',
        },
        lowerUpperToleranceInPercentage: {
            type: 'number',
        },
        requireCash: {
            type: 'number',
        },
        advisorFee: {
            type: 'number',
        },
        weightedAvgNetExpense: {
            type: 'number',
        },

    }
};
/**
 * @apiIgnore 
 * @api {get} /community/models?search={id/name} Search Community Model
 * @apiName SearchModel
 * @apiVersion 1.0.0
 * @apiGroup Community-Model
 * @apiPermission appCommunity
 *
 * @apiDescription This API search for community model
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/model?search=123
 * 
 * @apiSuccess {String}     id                      The model Id.
 * @apiSuccess {String}     name                    Name of the model.
 * @apiSuccess {String}     targetRiskLower         Target risk lower of the model.
 * @apiSuccess {String}     targetRiskUpper         Target risk upper of the model.
 * @apiSuccess {String}     currentRisk             Current risk of the model
 * @apiSuccess {Number}     minimumAmount           Minimum Amount of the model
 * @apiSuccess {Number}     tickersWithTarget       Tickers with target of the model
 * @apiSuccess {Number}     lowerUpperTolerance     Lower-Upper Tolerance of the model
 * @apiSuccess {Number}     requireCash             Require Cash in the model
 * @apiSuccess {Number}     advisorFee              Advisor Fee of the model
 * @apiSuccess {Number}     weightedAvgNetExpense   Weighted Avg Net Expense of the model
 * @apiSuccess {String}     style                   Style of the model
 * @apiSuccess {Number}     isDeleted               Model exist or not into the system.
 * @apiSuccess {Date}       createdOn               Model creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Community model into the system.
 * @apiSuccess {Date}       editedOn                Community model edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Community model details into the system.
 * @apiSuccess {Number}     status                  Community model status - Active/Inactive.

 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     "id": 4,
 *     "name": "Model1",
 *     "targetRiskLower": "TestLower",
 *     "targetRiskUpper": "TestUpper",
 *     "currentRisk": "100",
 *     "minimumAmount": 1000,
 *     "strategistId": 1001,
 *     "style": "abc",
 *     "tickersWithTarget": null,
 *     "lowerUpperTolerance": null,
 *     "requireCash": 2000,
 *     "advisorFee": 1000,
 *     "weightedAvgNetExpense": 200,
 *     "status": 0,
 *     "isDeleted": 1,
 *     "createdOn": "2016-08-11T06:32:32.000Z",
 *     "createdBy": 1001,
 *     "editedOn": "2016-08-11T07:24:15.000Z",
 *     "editedBy": 1001
 *     }
 * 
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 **/
/**
 * @apiIgnore
 * @api {get} /community/models?strategistId={id_list} Get Community Model by Strategist Ids
 * @apiName GetModelByStrategistId
 * @apiVersion 1.0.0
 * @apiGroup Community-Model
 * @apiPermission appCommunity
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
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/model?strategistId=4,5
 * 
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * [
 * {
 *   "id": 15,
 *   "name": "demro12",
 *   "status": 0,
 *   "targetRiskLower": "vivek",
 *   "targetRiskUpper": "kumar",
 *   "currentRisk": "10",
 *   "minimumAmount": 1000,
 *   "strategistId": 4,
 *   "style": "abc",
 *   "tickersWithTargetInPercentage": 10,
 *   "lowerUpperToleranceInPercentage": 20,
 *   "requireCash": 2000,
 *   "advisorFee": 1000,
 *   "weightedAvgNetExpense": 200,
 *   "isDeleted": 0,
 *   "createdDate": "2016-08-11T14:51:19.000Z",
 *   "createdBy": 370925,
 *   "editedDate": "2016-08-11T14:51:19.000Z",
 *   "editedBy": 370925
 * }
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
/**
 * @apiIgnore
 * @api {get} /community/models Get All Community Model 
 * @apiName GetAllModel
 * @apiVersion 1.0.0
 * @apiGroup  Community-Model
 * @apiPermission appCommunity
 *
 * @apiDescription This API gets community model list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/models
 * 
 * @apiSuccess {String}    id                      The model Id.
 * @apiSuccess {String}     name                    Name of the model.
 * @apiSuccess {String}     targetRiskLower         Target risk lower of the model.
 * @apiSuccess {String}     targetRiskUpper         Target risk upper of the model.
 * @apiSuccess {String}     currentRisk             Current risk of the model
 * @apiSuccess {Number}     minimumAmount           Minimum Amount of the model
 * @apiSuccess {Number}     tickersWithTarget       Tickers with target of the model
 * @apiSuccess {Number}     lowerUpperTolerance     Lower-Upper Tolerance of the model
 * @apiSuccess {Number}     requireCash             Require Cash in the model
 * @apiSuccess {Number}     advisorFee              Advisor Fee of the model
 * @apiSuccess {Number}     weightedAvgNetExpense   Weighted Avg Net Expense of the model
 * @apiSuccess {String}     style                   Style of the model
 * @apiSuccess {Number}     isDeleted               Model exist or not into the system.
 * @apiSuccess {Date}       createdOn               Model creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Community model into the system.
 * @apiSuccess {Date}       editedOn                Community model edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Community model details into the system.
 * @apiSuccess {Number}     status                  Community model status - Active/Inactive.
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *     "id": 4,
 *     "name": "Model1",
 *     "targetRiskLower": "TestLower",
 *     "targetRiskUpper": "TestUpper",
 *     "currentRisk": "100",
 *     "minimumAmount": 1000,
 *     "strategistId": 1001,
 *     "style": "abc",
 *     "tickersWithTarget": null,
 *     "lowerUpperTolerance": null,
 *     "requireCash": 2000,
 *     "advisorFee": 1000,
 *     "weightedAvgNetExpense": 200,
 *     "status": 0,
 *     "isDeleted": 1,
 *     "createdOn": "2016-08-11T06:32:32.000Z",
 *     "createdBy": 1001,
 *     "editedOn": "2016-08-11T07:24:15.000Z",
 *     "editedBy": 1001
 *     }
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
    if (req.query.search) {
        data.search = req.query.search;
    }
    if (req.query.strategistIds) {
        data.strategistId = req.query.strategistIds;
    }
    modelService.getModelList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:id', function (req, res) {
    logger.info("Get community model request received");

    var data = req.data;
    data.modelId = req.params.id;
    modelService.getModelDetail(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @apiIgnore
 * @api {post} /community/models Add Community Model
 * @apiName  addModel.
 * @apiVersion 1.0.0
 * @apiGroup Community-Model
 * @apiPermission Community User
 *
 * @apiDescription This API Add Community Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam{String}      name                    Name of the model.
 * @apiParam {String}     targetRiskLower         Target risk lower of the model.
 * @apiParam {String}     targetRiskUpper         Target risk upper of the model.
 * @apiParam {String}     currentRisk             Current risk of the model
 * @apiParam {Number}     minimumAmount           Minimum Amount of the model
 * @apiParam {Number}     tickersWithTarget       Tickers with target of the model
 * @apiParam {Number}     lowerUpperTolerance     Lower-Upper Tolerance of the model
 * @apiParam {Number}     requireCash             Require Cash in the model
 * @apiParam {Number}     advisorFee              Advisor Fee of the model
 * @apiParam {Number}     weightedAvgNetExpense   Weighted Avg Net Expense of the model
 * @apiParam {String}     style                   Style of the model
 
 * @apiParamExample {json} Request-Example:
 *
 *    {
 *     "name": "Model1",
 *     "targetRiskLower": "TestLower",
 *     "targetRiskUpper": "TestUpper",
 *     "currentRisk": "100",
 *     "minimumAmount": 1000,
 *     "strategistId": 1001,
 *     "style": "abc",
 *     "tickersWithTarget": null,
 *     "lowerUpperTolerance": null,
 *     "requireCash": 2000,
 *     "advisorFee": 1000,
 *     "weightedAvgNetExpense": 200,
 *     }
 * 
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/models
 * 
 * @apiSuccess {String}      name                    Name of the model.
 * @apiSuccess {String}     targetRiskLower         Target risk lower of the model.
 * @apiSuccess {String}     targetRiskUpper         Target risk upper of the model.
 * @apiSuccess {String}     currentRisk             Current risk of the model
 * @apiSuccess {Number}     minimumAmount           Minimum Amount of the model
 * @apiSuccess {Number}     tickersWithTarget       Tickers with target of the model
 * @apiSuccess {Number}     lowerUpperTolerance     Lower-Upper Tolerance of the model
 * @apiSuccess {Number}     requireCash             Require Cash in the model
 * @apiSuccess {Number}     advisorFee              Advisor Fee of the model
 * @apiSuccess {Number}     weightedAvgNetExpense   Weighted Avg Net Expense of the model
 * @apiSuccess {String}     style                   Style of the model
 * @apiSuccess {Boolean}  isDeleted               Model exist or not into the system.
 * @apiSuccess {Date}     createdOn               Model creation date into application.
 * @apiSuccess {Number}   createdBy               Full Name of user who created the Model into the system.
 * @apiSuccess {Date}     editedOn                Model edited date into application.
 * @apiSuccess {Number}   ditedBy                 Full Name of user who edited the Model details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *     "id": 4,
 *     "name": "Model1",
 *     "targetRiskLower": "TestLower",
 *     "targetRiskUpper": "TestUpper",
 *     "currentRisk": "100",
 *     "minimumAmount": 1000,
 *     "strategistId": 1001,
 *     "style": "abc",
 *     "tickersWithTarget": 10,
 *     "lowerUpperTolerance": 5,
 *     "requireCash": 2000,
 *     "advisorFee": 1000,
 *     "weightedAvgNetExpense": 200,
 *     "status": 0,
 *     "isDeleted": 1,
 *     "createdOn": "2016-08-11T06:32:32.000Z",
 *     "createdBy": 1001,
 *     "editedOn": "2016-08-11T07:24:15.000Z",
 *     "editedBy": 1001
 *     }
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 * @apiError Unprocessable_Entity When Model already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Model already exist with same name"
 *     }
 * 
 */


app.post('/', validate({ body: modelBodySchema }), function (req, res) {
    logger.info("Create community model request received");

    var data = new ModelRequest(req.data);
    modelService.addModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @apiIgnore
 * @api {put} /community/models/:id Update Community Model
 * @apiName  updateModel.
 * @apiVersion 1.0.0
 * @apiGroup Community-Model
 * @apiPermission Community User
 *
 * @apiDescription This API Update Community Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {String}      name                    Name of the model.
 * @apiParam {String}     targetRiskLower         Target risk lower of the model.
 * @apiParam {String}     targetRiskUpper         Target risk upper of the model.
 * @apiParam {String }     currentRisk             Current risk of the model
 * @apiParam {Number}     minimumAmount           Minimum Amount of the model
 * @apiParam {Number}     tickersWithTarget       Tickers with target of the model
 * @apiParam {Number}     lowerUpperTolerance     Lower-Upper Tolerance of the model
 * @apiParam {Number}     requireCash             Require Cash in the model
 * @apiParam {Number}     advisorFee              Advisor Fee of the model
 * @apiParam {Number}     weightedAvgNetExpense   Weighted Avg Net Expense of the model
 * @apiParam {String}     style                   Style of the model
 
 * @apiParamExample {json} Request-Example:
 *
 *    {
 *     "name": "Model1",
 *     "targetRiskLower": "TestLower",
 *     "targetRiskUpper": "TestUpper",
 *     "currentRisk": "100",
 *     "minimumAmount": 1000,
 *     "strategistId": 1001,
 *     "style": "abc",
 *     "tickersWithTarget": null,
 *     "lowerUpperTolerance": null,
 *     "requireCash": 2000,
 *     "advisorFee": 1000,
 *     "weightedAvgNetExpense": 200,
 *     }
 * 
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/models/:id
 * 
 * @apiSuccess {String}     name                    Name of the model.
 * @apiSuccess {String}     targetRiskLower         Target risk lower of the model.
 * @apiSuccess {String}     targetRiskUpper         Target risk upper of the model.
 * @apiSuccess {String}     currentRisk             Current risk of the model
 * @apiSuccess {Number}     minimumAmount           Minimum Amount of the model
 * @apiSuccess {Number}     tickersWithTarget       Tickers with target of the model
 * @apiSuccess {Number}     lowerUpperTolerance     Lower-Upper Tolerance of the model
 * @apiSuccess {Number}     requireCash             Require Cash in the model
 * @apiSuccess {Number}     advisorFee              Advisor Fee of the model
 * @apiSuccess {Number}     weightedAvgNetExpense   Weighted Avg Net Expense of the model
 * @apiSuccess {String}     style                   Style of the model
 * @apiSuccess {Boolean}    isDeleted               Model exist or not into the system.
 * @apiSuccess {Date}       createdOn               Model creation date into application.
 * @apiSuccess {Number}     createdBy               Full Name of user who created the Model into the system.
 * @apiSuccess {Date}       editedOn                Model edited date into application.
 * @apiSuccess {Number}     editedBy                Full Name of user who edited the Model details into the system.
 * 
* @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *     "id": 4,
 *     "name": "Model1",
 *     "targetRiskLower": "TestLower",
 *     "targetRiskUpper": "TestUpper",
 *     "currentRisk": "100",
 *     "minimumAmount": 1000,
 *     "strategistId": 1001,
 *     "style": "abc",
 *     "tickersWithTarget": 10,
 *     "lowerUpperTolerance": 5,
 *     "requireCash": 2000,
 *     "advisorFee": 1000,
 *     "weightedAvgNetExpense": 200,
 *     "status": 0,
 *     "isDeleted": 1,
 *     "createdOn": "2016-08-11T06:32:32.000Z",
 *     "createdBy": 1001,
 *     "editedOn": "2016-08-11T07:24:15.000Z",
 *     "editedBy": 1001
 *     }
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 * @apiError Unprocessable_Entity When Model already exist with same name.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Model already exist with same name"
 *     }
 * 
 */

app.put('/:id', validate({ body: modelBodySchema }), function (req, res) {
    logger.info("Update Community Model details request received");

    var data = req.data;
    data.id = req.params.id;
    var data = new ModelRequest(req.data);
    modelService.updateModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * @apiIgnore
 * @api {delete} /community/models/:id Delete Community Model
 * @apiName  DeleteModel.
 * @apiVersion 1.0.0
 * @apiGroup Community-Model
 * @apiPermission Community User
 *
 * @apiDescription This API Community Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/models/22
 * 
 * @apiSuccess {String}     message            Model delete message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Model deleted successfully"
        }
 *
  @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Not_Found When Model does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Model does not exist."
 *     }
 */

app.delete('/:id', function (req, res) {
   	logger.info("Delete Community Model request received");
    var data = req.data;
    data.modelId = req.params.id;
    modelService.deleteModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

// app.get('/:id/securities', function(req, res){
//     logger.info("Get security od a model request received");

//     var data = req.data;
//     data.id = req.params.id;

//     if (req.query.viewBy) {
//         data.viewBy = req.query.viewBy;
//     }else {
//         data.viewBy = "category";
//     }

//     modelService.getModelSecurities(data, function (err, details) {
//         if (err) {
//             logger.error("Getting community model securities (getModelDetail())" + err);
//             return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         return response(null, 200, details, res);
//     });
// });

module.exports = app;