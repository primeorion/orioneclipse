"use strict";

var moduleName = __filename;
var express = require('express');
var app = express();
var helper = require('helper');
var util = require('util');
var response = require('controller/ResponseController.js');
var StrategistRequest = require("model/community/strategist/StrategistRequest.js");
var StrategistService = require('service/community/StrategistService.js');
var UploadService = require('service/upload/UploadService.js');
var ModelService = require('service/community/ModelService.js');
var UserService = require('service/community/UserService.js');
var UtilService = require('service/util/Util.js');
var userAccessMiddleware = require('middleware/UserAccessMiddleware.js');
var RebalanceService = require('service/rebalancer/RebalanceService.js');
var privilegeValidator = require('middleware/PrivilegeValidator.js').hasPrivilege();

var strategistService = new StrategistService();
var uploadService = new UploadService();
var modelService = new ModelService();
var userService = new UserService();
var utilService = new UtilService();
var rebalanceService = new RebalanceService();

var logger = helper.logger(moduleName);
var validate = helper.validate;
var multer = require('multer');
var multerS3 = require('multer-s3') 
var aws = require('aws-sdk')
var guid = require('guid');
var mkdirp = require('mkdirp');
var config = require('config');
var env = config.env.name;
var s3Properties = config.env.prop.orion["s3"];
var moment = require('moment');

app.use(require('middleware/DBConnection').community);
app.use(require('middleware/DBConnection').common);

var localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = req.uploadContext + req.params.strategistId;
        mkdirp(uploadDir, function (err) {
            if (err) {
                cb(null, uploadDir);
            } else {
                cb(null, uploadDir);
            }
        });
    },
    filename: function (req, file, cb) {
        var fileExtention = file.originalname.split('.');
        if (file.fieldname == 'logo') {
            var fileName = file.fieldname + '-' + Date.now() + '.' + fileExtention[fileExtention.length - 1];
            return cb(null, fileName);
        } else {
            var fileName = file.originalname;
            return cb(null, fileName);
        }
    }
});

/*s3 related conf*/
aws.config.region = s3Properties.region;
aws.config.update({
    accessKeyId: s3Properties.accessKeyId,
    secretAccessKey: s3Properties.secretAccessKey
});
var s3 = new aws.S3();

var upload = multer({
    storage: localStorage
});

var s3upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: s3Properties.bucket,
        metadata: function (req, file, cb) {
            var obj = {};
            obj = req.body;
            cb(null, obj);
        },
        key: function (req, file, cb) {
            var timeStamp = moment().format();
            var user = req.params.strategistId;
            var contextPath = req.uploadContext;
            if (file.fieldname == 'logo' && req.fileAttributeName == 'small') {
                var fileName = file.originalname.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + user + '/' + contextPath + req.fileAttributeName + '/' + timeStamp + '/' + file.originalname; // req.params.strategistId+fileExtention;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if (file.fieldname == 'logo' && req.fileAttributeName == 'large') {
                var fileName = file.originalname.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + user + '/' + contextPath + req.fileAttributeName + '/' + timeStamp + '/' + file.originalname; // req.params.strategistId+fileExtention;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if (req.params.modelId) {
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + 'model' + req.params.modelId + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else {
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + user + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            }
        }
    })
})

function fileServeMiddleware(fileAttributeName, uploadContext) {
    return function (req, res, next) {
        req.uploadContext = uploadContext;
        req.fileAttributeName = fileAttributeName;
        req.filesArray = [];
        req.signedUrls = [];
        req.fileServer = req.headers.host;
        next();
    }
}

var postStrategistSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        status: {
            required: true
        },
        eclipseDatabaseId :{
            required: true
        },
        users: {
            type: 'object Array',
            required: true
        }
    }
};

var postStrategistAddUserSchema = {
    type: 'object',
    properties: {
        users: {
            type: 'object Array',
            required: true
        }
    }
}

var postStrategistSchemaForUpdate = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        eclipseDatabaseId :{
            type: 'number',
            required: true
        },
        status: {
            required: true
        }
    }
};

var putStrategistCommentary = {
    type: 'object',
    properties: {
        strategyCommentary: {
            type: 'string'
        }
    }
}

var deleteStrategistSchema = {
    type: 'object',
    properties: {
        ids: {
            type: 'array',
            required: true
        },
    }
}

var putStrategistSales = {
    type: 'object',
    properties: {
        salesEmail: {
            type: 'string'
        },
        salesPhone: {
            type: 'string'
        },
        salesContact: {
            type: 'string'
        }
    }
}

var putStrategistSupport = {
    type: 'object',
    properties: {
        supportEmail: {
            type: 'string'
        },
        supportPhone: {
            type: 'string'
        },
        supportContact: {
            type: 'string'
        }
    }
}

var putStrategistLegalAgreement = {
    type: 'object',
    properties: {
        legalAgreement: {
            type: 'string',
            required: true
        }
    }
}

var putStrategistAdvertisement = {
    type: 'object',
    properties: {
        advertisementMessage: {
            type: 'string'
        }
    }
}

var putUpdateUser = {
    type: 'object',
    properties: {
        roleId: {
            type: 'number',
            required: true
        }
    }
}

var postModelSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        targetRiskLower: {
            type: 'number',
            required: true
        },
        targetRiskUpper: {
            type: 'number',
            required: true
        },
        minimumAmount: {
            type: 'number',
            required: true
        },
        currentRisk: {
            type: 'number',
            required: true
        },
        style: {
            type: 'string',
            required: true
        },
        advisorFee: {
            type: 'number',
            required: true
        },
        weightedAvgNetExpense: {
            type: 'number',
            required: true
        },
        securities: {
            type: 'object Array',
            required: true
        }
    }
}

var modelInputSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        targetRiskLower: {
            type: 'numeric',
            required: true
        },
        targetRiskUpper: {
            type: 'numeric',
            required: true
        },
        minimumAmount: {
            type: 'numeric',
            required: true
        },
        currentRisk: {
            type: 'numeric',
            required: true
        },
        style: {
            type: 'string',
            required: true
        },
        advisorFee: {
            type: 'numeric',
            required: true
        },
        weightedAvgNetExpense: {
            type: 'numeric',
            required: true
        },
        securities: {
            type: 'object Array',
            required: true
        },

    }
};

var deleteModelSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'numeric',
            required: true
        },
        name: {
            type: 'string',
            required: false
        },
        targetRiskLower: {
            type: 'numeric',
            required: false
        },
        targetRiskUpper: {
            type: 'numeric',
            required: false
        },
        minimumAmount: {
            type: 'numeric',
            required: false
        },
        currentRisk: {
            type: 'numeric',
            required: false
        },
        style: {
            type: 'string',
            required: false
        },
        advisorFee: {
            type: 'numeric',
            required: false
        },
        weightedAvgNetExpense: {
            type: 'numeric',
            required: false
        },
        securities: {
            type: 'object Array',
            required: false
        },

    }
};


/**@api {get} /community/strategists/models?search={id/name} Get LoggedIn User Models
 * @apiName GetLoggedInUserModels
 * @apiVersion 1.0.0
 * @apiGroup  Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets LoggedInUser models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models
 * 
 * @apiSuccess {Number}         id                              id of model
 * @apiSuccess {String}         name                            name of model 
 * @apiSuccess {Number}         status                          status of model        
 * @apiSuccess {Number}         targetRiskLower                 targetRiskLower of model 
 * @apiSuccess {Number}         targetRiskUpper                 targetRiskUpper of model 
 * @apiSuccess {Number}         currentRisk                     currentRisk of model 
 * @apiSuccess {Number}         minimumAmount                   minimum amount of model 
 * @apiSuccess {Number}         strategistId                    id of strategists.
 * @apiSuccess {String}         style                           style of model 
 * @apiSuccess {Number}         tickersWithTargetInPercentage   tickersWithTargetInPercentage of model 
 * @apiSuccess {Number}         lowerUpperToleranceInPercentage lowerUpperToleranceInPercentage of model 
 * @apiSuccess {Number}         requireCash                     requireCash of model 
 * @apiSuccess {Number}         advisorFee                      advisorFee of model
 * @apiSuccess {Number}         weightedAvgNetExpense           weightedAvgNetExpense of model
 * @apiSuccess {Number}         isDeleted                       isDeleted
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [
          {
            "id": 1,
            "name": "Growth11",
            "status": 1,
            "targetRiskLower": "10",
            "targetRiskUpper": "10",
            "currentRisk": "10",
            "minimumAmount": 10,
            "strategistId": 13,
            "style": "balanced",
            "tickersWithTargetInPercentage": null,
            "lowerUpperToleranceInPercentage": null,
            "requireCash": 10,
            "advisorFee": 50,
            "securities": [],
            "weightedAvgNetExpense": null,
            "isDynamic": 0,
            "isDeleted": 0,
            "createdOn": "2016-09-27T15:15:50.000Z",
            "createdBy": "Test Userlogin Id ",
            "editedOn": "2016-09-27T15:15:50.000Z",
            "editedBy": "Test Userlogin Id "
          },
          {
            "id": 2,
            "name": "Model2",
            "status": 1,
            "targetRiskLower": "10",
            "targetRiskUpper": "10",
            "currentRisk": "10",
            "minimumAmount": 10,
            "strategistId": 37,
            "style": "balanced",
            "tickersWithTargetInPercentage": null,
            "lowerUpperToleranceInPercentage": null,
            "requireCash": 10,
            "advisorFee": 50,
            "securities": [],
            "weightedAvgNetExpense": null,
            "isDynamic": 1,
            "isDeleted": 0,
            "createdOn": "2016-09-27T15:15:50.000Z",
            "createdBy": "Test Userlogin Id ",
            "editedOn": "2016-09-27T15:15:50.000Z",
            "editedBy": "Test Userlogin Id "
          },
          {
            "id": 3,
            "name": "Growth17",
            "status": 1,
            "targetRiskLower": "10",
            "targetRiskUpper": "10",
            "currentRisk": "10",
            "minimumAmount": 10,
            "strategistId": 13,
            "style": "conservative",
            "tickersWithTargetInPercentage": null,
            "lowerUpperToleranceInPercentage": null,
            "requireCash": 10,
            "advisorFee": 50,
            "securities": [],
            "weightedAvgNetExpense": null,
            "isDynamic": 1,
            "isDeleted": 0,
            "createdOn": "2016-09-27T15:15:50.000Z",
            "createdBy": "Test Userlogin Id ",
            "editedOn": "2016-09-27T15:15:50.000Z",
            "editedBy": "Test Userlogin Id "
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
 **/
app.get('/models', privilegeValidator,function (req, res) {
    logger.info("Get all model request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    modelService.getModelList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {get} /community/strategists/models/master/status Get master list of model status
 * @apiName GetMasterListOfModelStatus
 * @apiVersion 1.0.0
 * @apiGroup  Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets master list of model status. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/master/status
 * 
 * @apiSuccess {Number}         id                              id of model
 * @apiSuccess {String}         name                            name of model
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [
        {
          "id": 1,
          "name": "Approved"
        },
        {
          "id": 2,
          "name": "Waiting For Approval"
        },
        {
          "id": 3,
          "name": "Not Active"
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
 **/
app.get('/models/master/status', function (req, res) {
    logger.info("Get all model master status list request received");
    var data = req.data;
    modelService.getModelMasterListStatus(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {get} /community/strategists/models/:id Get model details
 * @apiName GetModelDetails
 * @apiVersion 1.0.0
 * @apiGroup  Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets details of models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/1
 * 
 * @apiSuccess {Number}         id                              id of model
 * @apiSuccess {String}         name                            name of model 
 * @apiSuccess {Number}         status                          status of model        
 * @apiSuccess {Number}         targetRiskLower                 targetRiskLower of model 
 * @apiSuccess {Number}         targetRiskUpper                 targetRiskUpper of model 
 * @apiSuccess {Number}         currentRisk                     currentRisk of model 
 * @apiSuccess {Number}         minimumAmount                   minimum amount of model 
 * @apiSuccess {Number}         strategistId                    id of strategists.
 * @apiSuccess {String}         style                           style of model 
 * @apiSuccess {Number}         tickersWithTargetInPercentage   tickersWithTargetInPercentage of model 
 * @apiSuccess {Number}         lowerUpperToleranceInPercentage lowerUpperToleranceInPercentage of model 
 * @apiSuccess {Number}         requireCash                     requireCash of model 
 * @apiSuccess {Number}         advisorFee                      advisorFee of model 
 * @apiSuccess {Number}         securities                      securities of model 
 * @apiSuccess {Number}         weightedAvgNetExpense           weightedAvgNetExpense of model
 * @apiSuccess {Number}         isDeleted                       isDeleted
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {"id": 241,
      "name": "modelFromHDC30",
      "status": 1,
      "isDeleted": 0,
      "createdBy": "primetgi",
      "editedBy": "primetgi",
      "targetRiskLower": 50,
      "targetRiskUpper": 100,
      "currentRisk": 10,
      "minimumAmount": 100000,
      "style": "Balanced",
      "allocation": null,
      "isDynamic": 0,
      "advisorFee": 50,
      "securities": [
        {
          "id": 1,
          "name": "growth12",
          "symbol": "AAPL",
          "securityType": "stock",
          "company": "Apple Inc.",
          "targetRiskLower": "5",
          "targetRiskUpper": "10",
          "minimumAmount": 100000,
          "allocation": 20,
          "upperTolerance": 10,
          "lowerTolerance": 10,
          "createdOn": "2016-09-27T15:15:50.000Z",
          "createdBy": 66,
          "editedBy": 66,
          "isDeleted": 0,
          "editedOn": "2016-09-27T15:15:50.000Z",
          "category": 0
        },
        {
          "id": 2,
          "name": "growth13",
          "symbol": "GOOG",
          "securityType": "stock",
          "company": "Google INC",
          "targetRiskLower": "5",
          "targetRiskUpper": "10",
          "minimumAmount": 100000,
          "allocation": 20,
          "upperTolerance": 10,
          "lowerTolerance": 10,
          "createdOn": "2016-09-27T15:15:50.000Z",
          "createdBy": 66,
          "editedBy": 66,
          "isDeleted": 0,
          "editedOn": "2016-09-27T15:15:50.000Z",
          "category": 0
        }
      ],
      "weightedAvgNetExpense": null,
      "isDynamic": 0,
      "isDeleted": 0,
      "createdOn": "2016-09-27T15:15:50.000Z",
      "createdBy": "Test Userlogin Id ",
      "editedOn": "2016-09-27T15:15:50.000Z",
      "editedBy": "Test Userlogin Id "
    }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 **/
app.get('/models/:modelId', function (req, res) {
    logger.info("Get community model request received");
    var data = req.data;
    data.modelId = req.params.modelId;
    modelService.getModelDetail(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {get} /community/strategists/count Get Strategist count
 * @apiName GetStrategistCount
 * @apiVersion 1.0.0
 * @apiGroup  Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets strategist Count. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/count
 * 
 * @apiSuccess {Number}       totalStrategist          Total Number of strategist.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *         {
 *           "strategistCount": 23
 *         }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/count', function (req, res) {
    logger.info("Get strategist count data request received");
    var data = req.data;
    strategistService.getStrategistCount(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/master/status Get Strategist Status List
 * @apiName Strategist Status List
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API returns the status for strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/master/status
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
 *       {
 *         "status": 0,
 *         "statusLabel": "Not Active"
 *       },
 *       {
 *         "status": 1,
 *         "statusLabel": "Approved"
 *       },
 *       {
 *         "status": 2,
 *         "statusLabel": "Waiting Approval"
 *       }
 *     ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/master/status', function (req, res) {
    logger.info("Strategist status list request received");
    var data = new StrategistRequest(req.data);
    strategistService.getStrategistStatusList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /community/strategists?search={id/name} Search Strategist
 * @apiName SearchStrategist
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission strategistUser
 *
 * @apiDescription This API search Strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists?search=370925
 * 
 * @apiSuccess {String}     id                      The Strategist user Id.
 * @apiSuccess {Date}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "salesContact": "GroundFloor",
 *      "salesPhone": "8882124685",
 *      "legalAgreement": "104",
 *      "salesEmail": "Test@gmail.com",
 *      "supportEmail": "Test@gmail.com",
 *      "supportContact": "9369874",
 *      "supportPhone": "1236478",
 *      "strategyCommentary": "10",
 *      "advertisementMessage": "Test Message",
 *      "isDeleted": 0,
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "Test",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "Test"
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
/**@api {get} /community/strategists Get All Strategist 
 * @apiName GetAllStrategist
 * @apiVersion 1.0.0
 * @apiGroup  Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets strategist list. 
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
 * @apiSuccess {String}     id                      The Strategist user Id.
 * @apiSuccess {Name}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     statusLabel             Strategist user status label - Active/Inactive.
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {Number}     userCount               Count of users associated to Strategist.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "id": 53,
 *       "name": "hello Strategist",
 *       "status": 1,
 *       "statusLabel": "Approved",
 *       "salesContact": null,
 *       "salesPhone": null,
 *       "legalAgreement": null,
 *       "salesEmail": null,
 *       "supportEmail": null,
 *       "supportContact": null,
 *       "supportPhone": null,
 *       "strategyCommentary": null,
 *       "advertisementMessage": null,
 *       "userCount": 1,
 *       "modelCount" : 1,
 *       "isDeleted": 0,
 *       "createdOn": "2016-09-08T06:37:13.000Z",
 *       "createdBy": "Test Userlogin Id ",
 *       "editedOn": "2016-09-08T06:37:13.000Z",
 *       "editedBy": "Test Userlogin Id "
 *     ]}
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 **/
app.get('/', privilegeValidator,function (req, res) {
    logger.info("Get all strategist request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    strategistService.getStrategistList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {get} /community/strategists/simple Get All Strategist Simple 
 * @apiName GetAllStrategist-Simple
 * @apiVersion 1.0.0
 * @apiGroup  Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API provides simple strategist list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/simple
 * 
 * @apiSuccess {String}     id                      The Strategist user Id.
 * @apiSuccess {Name}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     statusLabel             Strategist user status label - Active/Inactive
 * @apiSuccess {Array}      users                   Users associated with Strategist.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "statusLabel": "Not Active",
 *      "isDeleted": 0,
 *      "users": [],
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "370925",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "370925"
 *     }]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/simple', privilegeValidator, function (req, res) {
    logger.info("Get all strategist request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    strategistService.getStrategistSimpleList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/id?modelStatus={modelStatus} Get Strategist Detail
 * @apiName GetStrategistDetail
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets strategist Detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/12?modelStatus="approved"
 * 
 * @apiSuccess {Number}     id                      The Strategist user Id.
 * @apiSuccess {Number}     orionConnectExternalId  orion connect id when search from orion connect database.
 * @apiSuccess {Name}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     statusLabel             Strategist user status label - Active/Inactive.
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {Number}     userCount               Count of users associated to Strategist.
 * @apiSuccess {Array}      users                   Array of users associated to Strategist.
 * @apiSuccess {Array}      models                  Array of models associated to Strategist.
 * @apiSuccess {String}      smallLogo                  SmallLogo url of Strategist.
 * @apiSuccess {String}      largeLogo                  LargeLogo url of Strategist.
 * @apiSuccess {Number}     eclipseDatabaseId           Eclipse Firm Id.
 * @apiSuccess {String}     eclipseDatabaseName         Eclipse firm name.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "eclipseDatabaseId":1,
 *      "eclipseDatabaseName":"firm01",
 *      "statusLabel": "Not Active",
 *      "salesContact": "GroundFloor",
 *      "salesPhone": "8882124685",
 *      "legalAgreement": "104",
 *      "salesEmail": "test@gmail.com",
 *      "supportEmail": "test@gmail.com",
 *      "supportContact": "9369874",
 *      "supportPhone": "1236478258",
 *      "strategyCommentary": "10",
 *      "users": [
 *           {
 *             "id": 205,
               "orionConnectExternalId" : 5522,
 *             "name": "john kumar",
 *             "status": 0,
 *             "statusLabel": "Not Active",
 *             "isDeleted": 0,
 *             "createdOn": "2016-09-06T11:21:49.000Z",
 *             "editedOn": "2016-09-06T11:21:49.000Z",
 *             "createdBy": "createdBy",
 *             "editedBy": "editedBy"
 *             "roleId": 1,
 *             "roleType": "Admin"
 *           }
 *       ],
 *      "models": [{
            "id": 36,
            "name": "Demo Strategist",
            "status": 1,
            "isDeleted": 0,
            "statusLabel": "Approved",
            "createdOn": "2016-10-02T13:08:05.000Z",
            "editedOn": "2016-12-05T06:23:45.000Z",
            "salesContact": "gurgaon",
            "salesPhone": "123456789",
            "salesEmail": "test@gmail.com",
            "legalAgreement": "legal agreement",
            "supportEmail": "test@gmail.com",
            "supportContact": "gurgaon",
            "supportPhone": "123456789",
            "commentary": "<p>commentary info mmm</p>",
            "advertisementMessage": "advertisementMessage",
            "eclipseDatabaseId": 0,
            "isSubscribed": 0,
            "subscribedOn": "2016-12-06T04:09:59.000Z",
            "createdBy": "Test Userlogin Id ",
            "editedBy": "primetgi",
            "path": "",
            "userCount": 6,
            "modelCount": 0,
            "eclipseDatabaseName": null,
            "url": ""
        }],
 *      "advertisementMessage": "147852",
 *      "isDeleted": 0,
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "370925",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "370925",
 *      "smallLogo": "https://paxorions3.s3.amazonaws.com/dev/13/logo/small/2016-10-14T13%3A38%3A34%2B00%3A00/Hydrangeas.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1476568737&Signature=gmtWt1QQNqoNVUU%2F0adoAYOonzo%3D",
 *      "largeLogo": "https://paxorions3.s3.amazonaws.com/dev/13/logo/large/2016-10-14T13%3A38%3A34%2B00%3A00/Chrysanthemum.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1476568737&Signature=r19r5vxrKhm3Uu8U6tCx0xSbXYo%3D"
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
app.get('/:id', privilegeValidator, function (req, res) {
    logger.info("Get strategist details request received");
    var data = req.data;
    data.id = req.params.id;
    if(req.query.modelStatus){
        data.modelStatus = req.query.modelStatus;
    }
    strategistService.getStrategistDetail(data, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }else{
            var userDetails = data;
            strategistService.getStrategistLogo(req.data, function (err, status, data) {
                if (err) {
                    return response(err, status, data);
                }
                if(userDetails && data){
                    userDetails['smallLogo'] = data.smallLogo ? data.smallLogo : null;
                    userDetails['largeLogo'] = data.largeLogo ? data.largeLogo : null;
                }
                return response(err, status, userDetails, res);
            });
        }
    });
});

/** @api {get} /community/strategists/simple/id Get Strategist Detail - Simple 
 * @apiName GetStrategistDetail-Simple 
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets simple strategist Detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/simple/12
 * 
 * @apiSuccess {Number}     id                      The Strategist user Id.
 * @apiSuccess {Number}     orionConnectExternalId  orion connect id when search from orion connect database.
 * @apiSuccess {Date}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     statusLabel             Strategist user status label - Active/Inactive
 * @apiSuccess {String}     users                   Users associated with strategist.
 * @apiSuccess {Array}      documents               Strategist documents.
 * @apiSuccess {Number}     eclipseDatabaseId       Eclipse Firm Id.
 * @apiSuccess {String}     eclipseDatabaseName     Eclipse firm name.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "statusLabel": "Not Active",
 *       "eclipseDatabaseId" : 1,
 *      "eclipseDatabaseName" : "firm01",
 *      "documents" : [
        {
          "id": 1,
          "type": 0,
          "displayName": "10461419_928933007135710_3071132668502355688_n.jpg",
          "documentName": "small logo  to do",
          "description": "small logo description",
          "path": "dev/13/logo/small/10461419_928933007135710_3071132668502355688_n.jpg",
          "createdDate": "2016-09-28T09:14:18.000Z",
          "createdBy": 13,
          "strategistId": 13,
          "editedDate": "2016-09-28T09:14:18.000Z",
          "editedBy": 13,
          "small logo": "https://paxorions3.s3.amazonaws.com/dev/13/logo/small/10461419_928933007135710_3071132668502355688_n.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1475109165&Signature=AFlGoabPBsRjxw1za0kTnGkyEtk%3D"
        }],
 *      "users": [
 *           {
 *             "id": 205,
               "orionConnectExternalId" : 1243,
 *             "name": "john kumar",
 *             "status": 0,
 *             "statusLabel": "Not Active",
 *             "isDeleted": 0,
 *             "createdOn": "2016-09-06T11:21:49.000Z",
 *             "editedOn": "2016-09-06T11:21:49.000Z",
 *             "createdBy": "createdBy",
 *             "editedBy": "editedBy",
 *             "roleId": 1,
 *             "roleType": "Admin"
 *           }
 *       ],
 *      "isDeleted": 0,
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "370925",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "370925"
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
app.get('/simple/:id', privilegeValidator, function (req, res) {
    logger.info("Get strategist profile request received");
    var data = req.data;
    data.id = req.params.id;
    strategistService.getStrategistDetailSimple(req.data, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }
        var userDetails = data;
        strategistService.getStrategistLogo(req.data, function (err, status, data) {
            if (err) {
                return response(err, status, data);
            }
            userDetails['smallLogo'] = data.smallLogo;
            userDetails['largeLogo'] = data.largeLogo;
            return response(err, status, userDetails, res);
        });
    });
});

/** @api {get} /community/strategists/id/profile Get Strategist Profile Detail 
 * @apiName GetStrategistProfileDetails
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets strategist profile details. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/12/profile
 * 
 * @apiSuccess {String}     id                      The Strategist user Id.
 * @apiSuccess {Date}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     statusLabel             Strategist user status label - Active/Inactive.
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "statusLabel": "Not Active",
 *      "salesContact": "GroundFloor",
 *      "salesPhone": "8882124685",
 *      "legalAgreement": "104",
 *      "salesEmail": "test@gmail.com",
 *      "supportEmail": "test@gmail.com",
 *      "supportContact": "9369874",
 *      "supportPhone": "1236478258",
 *      "strategyCommentary": "10",
 *      "advertisementMessage": "147852",
 *      "isDeleted": 0,
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "370925",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "370925"
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
app.get('/:id/profile', privilegeValidator,function (req, res) {
    logger.info("Get strategist profile request received");
    var data = req.data;
    data.id = req.params.id;
    strategistService.getStrategistProfileDetail(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {post} /community/strategists/ Create Strategist
 * @apiName CreateStrategist
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API create strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json 
 *     }
 *
 * @apiParam {String}        name                       Name of strategist.
 * @apiParam {Number}        status                     Status of strategist whether Not active or Approved or Not approved.
 * @apiParam {Number}        orionConnectExternalId     orion connect id when user search from orion connect.
 * @apiParam {String}        loginUserId                login user id of user search from orion connect.
 * @apiParam {Number}        eclipseDatabaseId          Eclipse Firm Id.
 *
 * @apiParamExample {json} Request-Example:
 *    {
          "name" : "mark",
          "status" : 1,
          "eclipseDatabaseId":1,
          "users" : [{
               "orionConnectExternalId" : 12732,
               "roleId" : 2,          
               "loginUserId": "Steve.VanVoorst"
          },{
               "orionConnectExternalId" : 266912,
               "roleId" : 2,         
               "loginUserId": "Benjamin.Rawlings"
          
          }]
        }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists
 * 
 * @apiSuccess {Number}     id                      The Strategist user Id.
 * @apiSuccess {Number}     orionConnectExternalId  orion connect id when search from orion connect database.
 * @apiSuccess {Name}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {Number}     userCount               Count of users associated to Strategist.
 * @apiSuccess {Number}     modelCount              Count of models associated to Strategist.
 * @apiSuccess {Array}      users                   Array of users associated to Strategist.
 * @apiSuccess {Array}      models                  Array of models associated to Strategist.
 * @apiSuccess {Number}     eclipseDatabaseId       Eclipse Firm Id.
 * @apiSuccess {String}     eclipseDatabaseName     Eclipse firm name.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 1,
 *      "statusLabel": "Approved",
 *      "salesContact": "physical address",
 *      "salesPhone": "8882124685",
 *      "legalAgreement": "legal agreement",
 *      "salesEmail": "test@gmail.com",
 *      "supportEmail": "test@gmail.com",
 *      "supportContact": "physical address",
 *      "supportPhone": "1236478258",
 *      "strategyCommentary": "strategy commentary",
 *      "eclipseDatabaseId":1,
 *      "eclipseDatabaseName":"firm01",
 *      "userCount": 2,
 *      "modelCount": 0,
 *      "user": [
 *           {
 *             "id": 205,
               "orionConnectExternalId" : 12732,
               "loginUserId" : "Steve.VanVoorst",
 *             "name": "VanVoorst Steve",
 *             "status": 0,
 *             "statusLabel": "Not Active",
 *             "isDeleted": 0,
 *             "createdOn": "2016-09-06T11:21:49.000Z",
 *             "editedOn": "2016-09-06T11:21:49.000Z",
 *             "createdBy": "primetgi",
 *             "editedBy": "primetgi"
 *             "roleId": 2,
 *             "roleType": "Strategist Admin"
 *           },
 *          {
 *             "id": 206,
               "orionConnectExternalId" : 266912,
               "loginUserId" : "Benjamin.Rawlings",
 *             "name": "Rawlings Benjamin",
 *             "status": 0,
 *             "statusLabel": "Not Active",
 *             "isDeleted": 0,
 *             "createdOn": "2016-09-06T11:21:49.000Z",
 *             "editedOn": "2016-09-06T11:21:49.000Z",
 *             "createdBy": "primetgi",
 *             "editedBy": "primetgi"
 *             "roleId": 2,
 *             "roleType": "Strategist Admin"
 *           }
 *       ],
 *      "models": [],
 *      "advertisementMessage": "advertisement message",
 *      "isDeleted": 0,
 *      "createdOn": "2016-11-21 15:38:56",
 *      "createdBy": "primetgi",
 *      "editedOn": "2016-11-21 15:38:56",
 *      "editedBy": "primetgi"
 *     }
 *
 *
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
 * 
 **/
app.post('/', validate({ body: postStrategistSchema}), userAccessMiddleware.authorizedUser, privilegeValidator, function (req, res) {
    logger.info("Create strategist request received");
    var data = new StrategistRequest(req.data);
    strategistService.addStrategist(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/user/verify/:id verify user
 * @apiName Verify User
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API verifies User is already assgined or not. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {Number}          id       loginUserId of the user to verify               
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/user/verify/briank
 * 
 * @apiSuccess {String}     message                    Message whether the user is assigned or not.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "isVerified": 1,
 *      "message" : "User is not assigned."
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
app.get('/user/verify/:id', function (req, res) {
    logger.info("Verify user request received");
   // var data = new StrategistRequest(req.data);
   // data.assignedUserId = req.params.id;
    req.data.loginUserId = req.params.id;
    strategistService.verifyUser(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/*app.post('/:id/users', function(req, res){
    logger.info("Add user to strategist request received");
    var data = new StrategistRequest(req.data);
    data.strategistId = req.params.id;
    strategistService.addStrategistUser(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});*/

/** @api {put} /community/strategists/:id update Strategist
 * @apiName update Strategist
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * @apiParam {String}        name                       Name of strategist.
 * @apiParam {Number}        status                     Status of strategist whether Not active or Approved or Not approved.
 * @apiParam {Number}        orionConnectExternalId     orion connect id when user search from orion connect.
 * @apiParam {Number}        loginUserId                login user id of user search from orion connect.
 * @apiSuccess {Number}     eclipseDatabaseId           Eclipse Firm Id.
 *
 * @apiParamExample {json} Request-Example:
 *   {
          "name" : "mark",
          "status" : 1,
          "eclipseDatabaseId":1,
          "users" : [{
               "orionConnectExternalId" : 12732,
               "roleId" : 2,        
               "loginUserId": "Steve.VanVoorst"
          },{
               "orionConnectExternalId" : 266912,
               "roleId" : 2,          
               "loginUserId": "Benjamin.Rawlings"
          }]
        }
 * 
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1
 * 
 * @apiSuccess {String}     name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "eclipseDatabaseId":1,
 *      "eclipseDatabaseName":"firm01",
 *      "statusLabel" : "Not Active",
 *      "salesContact": "GroundFloor",
 *      "salesPhone": "8882124685",
 *      "legalAgreement": "104",
 *      "salesEmail": "test@gmail.com",
 *      "supportEmail": "test@gmail.com",
 *      "supportContact": "9369874",
 *      "supportPhone": "1236478258",
 *      "strategyCommentary": "10",
 *      "advertisementMessage": "147852",
 *      "isDeleted": 0,
 *      "users" : [],
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "370925",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "370925"
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
app.put('/:id', validate({body: postStrategistSchemaForUpdate}), userAccessMiddleware.authorizedUser, privilegeValidator,function (req, res) {
    logger.info("update strategist request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.updateStrategist(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /community/strategists/:id/commentary/ update Strategist Commentary Info
 * @apiName update Strategist Commentary
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update strategist Commentary Info. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * @apiParamExample {json} Request-Example:
 *
 *     {   
 *       "strategyCommentary" : "commentary"   
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/commentary
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,  
 *      "strategyCommentary": "commentary"
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
app.put('/:id/commentary', validate({ body: putStrategistCommentary}), privilegeValidator,function (req, res) {
    logger.info("update strategist commentary info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.updateStrategistCommentary(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /community/strategists/:id/sales update Strategist Sales Info
 * @apiName update Strategist Sales
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update strategist sales. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * @apiParamExample {json} Request-Example:
 *
 *     {
 *      "salesContact": "gurgaon",
 *      "salesPhone": "123456789",
 *      "salesEmail": "test@gmail.com",
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/sales
 * 
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,  
 *      "salesContact": "gurgaon",
 *      "salesPhone": "123456789",
 *      "salesEmail": "test@gmail.com"
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
app.put('/:id/sales', validate({body: putStrategistSales}), privilegeValidator,function (req, res) {
    logger.info("update strategist sales info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.updateStrategistSales(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /community/strategists/:id/support update Strategist Support Info
 * @apiName update Strategist Support Info
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update strategist Support Info. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * @apiParamExample {json} Request-Example:
 *
 *     {   
 *      "supportContact": "gurgaon",
 *      "supportPhone": "123456789",
 *      "supportEmail": "test@gmail.com",
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/support
 * 
 * @apiSuccess {String}     supportPhone             Strategist user phone number.
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,  
 *      "supportEmail": "test@gmail.com",
 *      "supportContact": "gurgaon",
 *      "supportPhone": "123456789"
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
app.put('/:id/support', validate({body: putStrategistSupport}), privilegeValidator, function (req, res) {
    logger.info("update strategist sales info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.updateStrategistSupport(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /community/strategists/:id/legalAgreement update Strategist legalAgreement Info
 * @apiName update Strategist Legal Agreement Info
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update strategist legal aggrement info. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * @apiParamExample {json} Request-Example:
 *
 *     {
 *      "legalAgreement": "Test"
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/legalAgreement
 * 
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,  
 *      "legalAgreement": "test"
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
app.put('/:id/legalAgreement', validate({body: putStrategistLegalAgreement}), function (req, res) {
    logger.info("update strategist legalAgreement info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.updateStrategistLegalAgreement(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /community/strategists/:id/advertisementMessage update Strategist advertisementMessage Info
 * @apiName update Strategist Advertisement Message
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update strategist advertisement message. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * @apiParamExample {json} Request-Example:
 *
 *     {  
 *      "advertisementMessage": "Test"
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/advertisementMessage
 * 
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,
 *      "advertisementMessage": "147852"
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
app.put('/:id/advertisementMessage', validate({body: putStrategistAdvertisement}), privilegeValidator,function (req, res) {
    logger.info("update strategist advertisementMessage info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.updateStrategistAdvertisementMessage(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/:id/commentary get Strategist Commentary Info
 * @apiName Get Strategist Commentary
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Get strategist Commentary Info. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/commentary
 * 
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,  
 *      "strategyCommentary": "commentary"
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
app.get('/:id/commentary', function (req, res) {
    logger.info("get strategist commentary info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.getStrategistCommentary(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/:id/sales Get Strategist Sales Info
 * @apiName Get Strategist Sales
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Get strategist sales. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/sales
 * 
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,  
 *      "salesContact": "gurgaon",
 *      "salesPhone": "123456789"
 *      "salesEmail": "test@gmail.com"
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
app.get('/:id/sales', privilegeValidator,function (req, res) {
    logger.info("get strategist sales info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.getStrategistSales(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/:id/support Get Strategist Support Info
 * @apiName Get Strategist Support Info
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Get strategist Support Info. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/support
 * 
 * @apiSuccess {String}     supportPhone              Strategist user phone number.
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,  
 *      "supportEmail": "test@gmail.com",
 *      "supportContact": "gurgaon",
 *      "supportPhone": "123456789"
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
app.get('/:id/support', privilegeValidator,function (req, res) {
    logger.info("get strategist sales info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.getStrategistSupport(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/:id/legalAgreement Get Strategist legalAgreement Info
 * @apiName Get Strategist Legal Agreement Info
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Get strategist legal aggrement info. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/legalAgreement
 * 
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id" : 1,  
 *      "legalAgreement": "test"
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
app.get('/:id/legalAgreement', function (req, res) {
    logger.info("get strategist legalAgreement info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.getStrategistLegalAgreement(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/:id/advertisementMessage Get Strategist 
advertisementMessage Info
 * @apiName Get Strategist Advertisement Message
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Get strategist advertisement message. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/advertisementMessage
 * 
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id" : 1,  
 *      "advertisementMessage": "147852"
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
app.get('/:id/advertisementMessage', privilegeValidator,function (req, res) {
    logger.info("get strategist advertisementMessage info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.getStrategistAdvertisementMessage(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /community/strategists/:id/profile update Strategist Profile
 * @apiName update Strategist Profile
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update strategist profile. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 * @apiParam {String}     name                    Fullname of the Strategist User.
 * @apiParam {Number}     status                  Strategist user status - Active/Inactive.
 * @apiParam {String}     salesEmail              Strategist user email id.
 * @apiParam {String}     salesContact            Strategist user physical address detail.
 * @apiParam {String}     salesPhone              Strategist user phone number.
 * @apiParam {String}     legalAgreement          Agreement detail of strategist user.
 * @apiParam {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiParam {String}     advertisementMessage    Strategist advertisement message
 * @apiParam {String}     supportEmail            Support Email  of strategist user.
 * @apiParam {String}     supportContact          Support physical address detail of strategist user.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *         "name": "New Test",
 *         "status": 1,
 *         "salesContact": "physical address",
 *         "salesPhone": 8882124685,
 *         "legalAgreement": "legalAgreement",
 *         "salesEmail": "test@gmail.com",
 *         "supportEmail": "test@gmail.com",
 *         "supportContact": "physical address",
 *         "supportPhone": 1236478258,
 *         "strategyCommentary": "strategyCommentary",
 *         "advertisementMessage": "advertisementMessage"
 *       }
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/profile
 * 
 * @apiSuccess {String}     name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiParam {Number}       statusLabel             Strategist statusLabel - Active/Inactive.
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 0,
 *      "statuslabel" : "Approved",
 *      "salesContact": "GroundFloor",
 *      "salesPhone": "8882124685",
 *      "legalAgreement": "104",
 *      "salesEmail": "test@gmail.com",
 *      "supportEmail": "test@gmail.com",
 *      "supportContact": "9369874",
 *      "supportPhone": "1236478258",
 *      "strategyCommentary": "10",
 *      "advertisementMessage": "147852",
 *      "isDeleted": 0,
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "370925",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "370925"
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
app.put('/:id/profile', privilegeValidator,function (req, res) {
    logger.info("Update Strategist profile request received");
    var data = new StrategistRequest(req.data);
    data.id = req.params.id;
    strategistService.updateStrategistProfile(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /community/strategists/user/:id update User
 * @apiName update User
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update user. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }

 * @apiParam {number}     roleId                    role of User.
 * @apiParam {number}     eclipseDatabaseId         firm id of user.
 * @apiParam {number}     id                        strategistId assigned to normal user.

 * @apiParamExample {json} Request-Example:
 *
 *     {
 *      "roleId": 1,
 *      "eclipseDatabaseId":1
 *     }
 *      OR
 *      {
 *          "roleId":2,
 *          "id":1
 *       }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/user/66
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
          "id": 66,
          "name": "john kumar",
          "isDeleted": 0,
          "createdOn": "2016-09-27T09:36:24.000Z",
          "editedOn": "2016-09-29T07:52:20.000Z",
          "createdBy": "Test Userlogin Id ",
          "editedBy": "Test Userlogin Id ",
          "roleId": 0,
          "roleType": "User"
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
app.put('/user/:id', validate({body: putUpdateUser}), privilegeValidator,function (req, res) {
    logger.info("update user request received");
    var data = req.data;
    data.assignedUserId = req.params.id;
    strategistService.updateUser(data, function (err, status, data){
        return response(err, status, data, res);
    });
    // var data = req.data;
    // data.assignedUserId = req.params.id;
    // strategistService.getStrategistAgainstUsers(data, function (err, status, strategistData) {
    //     if (err) {
    //         return response(err, status, data, res);
    //     }
    //     data.id = strategistData.strategistId;
    //     data = new StrategistRequest(data);
    //     strategistService.updateUser(data, function (err, status, data) {
    //         return response(err, status, data, res);
    //     });
    // });
});

/** @api {delete} /community/strategists/:id Delete Strategist
 * @apiName DeleteStrategist
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Delete Strategist. 
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
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         message : Strategist is deleted successfully.
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
app.delete('/:id', privilegeValidator, function (req, res) {
    logger.info("delete strategist request received");
    var data = req.data;
    data.id = req.params.id;
    strategistService.deleteStrategist(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {delete} /community/strategists/id/userId/user Delete Strategist user
 * @apiName DeleteStrategist User
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Delete Strategist User. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj  
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/12/5/user
 * 
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         message : User deleted successfully.
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
app.delete('/:strategistId/:userId/user', privilegeValidator,function (req, res) {
    logger.info("delete strategist user request received");
    var data = req.data;
    data.id = req.params.strategistId;
    data.assignedUserId = req.params.userId;
    strategistService.deleteStrategistUser(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {post} /community/strategists/:id/user/add Add user to strategist
 * @apiName Assign Users to Strategist
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API assigns users to strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json 
 *     }
 *
 * @apiParam {Array}        users            users which are assigned to strategist.
 *
 * @apiParamExample {json} Request-Example:
 *     {
          "users" : [{
               "orionConnectExternalId" : 380049,
               "roleId" : 2,
               "name": "marketdatasupport@orionadvisor.com",          
               "loginUserId": "_SME Market Data"
          }]
        }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/10/user/add
 * 
 * @apiSuccess {String}     id                      The Strategist user Id.
 * @apiSuccess {Name}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {Number}     userCount               Count of users associated to Strategist.
 * @apiSuccess {Number}     modelCount              Count of models associated to Strategist.
 * @apiSuccess {Array}      users                   Array of users associated to Strategist.
 * @apiSuccess {Array}      models                  Array of models associated to Strategist.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "id": 1,
 *      "name": "Test",
 *      "status": 1,
 *      "statusLabel" : "Approved",
 *      "salesContact": "GroundFloor",
 *      "salesPhone": "8882124685",
 *      "legalAgreement": "104",
 *      "salesEmail": "test@gmail.com",
 *      "supportEmail": "test@gmail.com",
 *      "supportContact": "9369874",
 *      "supportPhone": "1236478258",
 *      "strategyCommentary": "10",
 *      "userCount": 1,
 *      "modelCount": 1,
 *      "users": [
 *           {
 *             "id": 370942,
                "orionConnectExternalId" : 380049,
 *             "name": "john kumar",
 *             "status": 0,
 *             "isDeleted": 0,
 *             "createdOn": "2016-09-06T11:21:49.000Z",
 *             "editedOn": "2016-09-06T11:21:49.000Z",
 *             "createdBy": "createdBy",
 *             "editedBy": "editedBy",
 *             "roleId" : 1,
 *             "roleType" : admin
 *           }
 *       ],
 *      "models": [],
 *      "advertisementMessage": "147852",
 *      "isDeleted": 0,
 *      "createdOn": "0000-00-00 00:00:00",
 *      "createdBy": "370925",
 *      "editedOn": "0000-00-00 00:00:00",
 *      "editedBy": "370925"
 *     }
 *
 *
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
 * 
 **/
app.post('/:id/user/add', privilegeValidator,validate({body: postStrategistAddUserSchema}), function (req, res) {
    logger.info("Assign users to strategist request received");
    var data = new StrategistRequest(req.data);
    data.id = req.params.id;
    strategistService.assignUserToStrategist(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/strategists/:id/documents Get Strategist documents
 * @apiName Get Strategist documents
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Get Strategist documents. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/1/documents
 * 
 * @apiSuccess {Integer}    type                    Document type
 * @apiSuccess {String}     displayName             display name of document
 * @apiSuccess {String}     documentName            document name 
 * @apiSuccess {String}     path                    path of document
 * @apiSuccess {String}     small logo  to do       signed url of document
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
      {
        "id": 1,
        "type": 0,
        "displayName": "10461419_928933007135710_3071132668502355688_n.jpg",
        "documentName": "small logo  to do",
        "description": "small logo description",
        "path": "dev/13/logo/small/10461419_928933007135710_3071132668502355688_n.jpg",
        "createdDate": "2016-09-28T09:14:18.000Z",
        "createdBy": 13,
        "strategistId": 13,
        "editedDate": "2016-09-28T09:14:18.000Z",
        "editedBy": 13,
        "small logo  to do": "https://paxorions3.s3.amazonaws.com/dev/13/logo/small/10461419_928933007135710_3071132668502355688_n.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1475114005&Signature=vR09feejWa%2Bk1q9%2Bh%2B7aaJNtdJU%3D"
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
app.get('/:id/documents', function (req, res) {
    logger.info("get strategist documents info request received");
    var data = req.data;
    data.id = req.params.id;
    data = new StrategistRequest(data);
    strategistService.getStrategistDocuments(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/*var deleteItem = function(objectToDelete){
    s3.deleteObjects({
        Bucket: s3Properties.bucket,
        Delete: {
            Objects: [
                { Key: objectToDelete }]
        }
    }, function(err, data) {

        if (err)
            return console.log(err);

        console.log('success');

    });    
}*/

/**@api {post} /community/strategists/:strategistId/logo/small Upload strategist small sized logo.
 * @apiName Upload Strategist Profile logo - Small
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API uploads strategist small sized logo. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/2/logo/small
 *
 * @apiParam {Number}           strategistId                      Strategist unique ID.
 *
 * @apiParam (Multipart/Form-Data)  {file}             logo=File A resource file to be uploaded
 *
 * @apiSuccess {String}     strategistId                      The Strategist user Id.
 * @apiSuccess {String}     url                     URL to access uploaded file.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
        "strategistId": "2",
        "url": "https://paxorions3.s3.amazonaws.com/2/logo/small/mac-bok-pro.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1475043049&Signature=4OGms3zNnnGHgkn7d2gVz2TDv68%3D"
      }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Strategist does not exist."
 *      }
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/:strategistId/logo/small', fileServeMiddleware('small', 'logo/'), s3upload.single('logo'), function (req, res) {
    logger.info("Upload logo for strategist request received");
    req.data.id = req.params.strategistId;
    strategistService.verifyStrategist(req.data, function (err, status, data) {
        if (err) {
            logger.error("Error occured while verifyStrategist verifyStrategist() " + err);
            return response(err, status, data, res);
        }
        uploadService.uploadSmallLogo(req, res, function (err, status, data) {
            if (err) {
                logger.error("Error occured while upload small logo uploadSmallLogo() " + err);
                return response(err, status, data, res);
                /*deleteItem(res.locals.filename);*/
            }
            return response(err, status, data, res);
        });
    });
});

/**@api {post} /community/strategists/:strategistId/logo/large Upload strategist  large sized logo.
 * @apiName Upload Strategist  logo - Large
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API uploads strategist  large sized logo. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/2/logo/large
 *
 * @apiParam (PathParam)    {Number}           strategistId                      Strategist unique ID.
 * @apiParam (Multipart/Form-Data)  {file}             logo=File A resource file to be uploaded
 *
 * @apiSuccess {String}     strategistId                      The Strategist user Id.
 * @apiSuccess {String}     message                 Upload message success / failure.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
        "strategistId": "2",
        "url": "https://paxorions3.s3.amazonaws.com/2/logo/small/mac-bok-pro.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1475043049&Signature=4OGms3zNnnGHgkn7d2gVz2TDv68%3D"
       }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Strategist does not exist."
 *      }
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.post('/:strategistId/logo/large', fileServeMiddleware('large', 'logo/'), s3upload.single('logo'), function (req, res) {
    logger.info("Upload logo for strategist request received");
    req.data.id = req.params.strategistId;
    strategistService.verifyStrategist(req.data, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }
        uploadService.uploadLargeLogo(req, res, function (err, status, data) {
            return response(err, status, data, res);
        });
    });
});

/**@api {post} /community/strategists/:strategistId/document Upload strategist document
 * @apiName Upload document
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API uploads strategist document. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/2/document
 * 
 * @apiParam (PathParam)                 {Number}   strategistId    Strategist unique ID.
 * @apiParam (Multipart/Form-Data)       {Text}     name            Display Name of document. 
 * @apiParam (Multipart/Form-Data)       {Text}     description     A breif description about document .
 * @apiParam (Multipart/Form-Data)       {file}     document=File   A resource file/files to be uploaded. Must be last feild in form.

 *
 * @apiSuccess {Number}     id                      The doucment id.
 * @apiSuccess {Number}     type                    Document type value.
 * @apiSuccess {String}     displayName             Document display name.
 * @apiSuccess {String}     documentName            Name of the doucment/file.
 * @apiSuccess {String}     description             Description of document.
 * @apiSuccess {Number}     strategistId            The Strategist user Id.
 * @apiSuccess {String}     createdDate             Date when doucment was created.
 * @apiSuccess {Number}     createdBy               User Id.
 * @apiSuccess {String}     editedDate              The Strategist user Id.
 * @apiSuccess {Number}     editedBy                Date when last doucment was updated.
 * @apiSuccess {String}     url                     User Id.
 * @apiSuccess {Number}     isDeleted               Indicate status of document, 1 states document is deleted & 0 states not deleted.
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "id": 9,
        "type": 0,
        "displayName": "Import Model template",
        "documentName": "oops1.pdf",
        "description": "Sample model with sample values",
        "path": "dev/13/document/2016-10-15T12:18:31+05:30/oops1.pdf",
        "strategistId": 13,
        "createdDate": "2016-10-15T06:48:34.000Z",
        "createdBy": 13,
        "editedDate": "2016-10-15T06:48:34.000Z",
        "editedBy": 13,
        "url": "https://paxorions3.s3.amazonaws.com/qa/13/document/2016-10-15T12%3A18%3A31%2B05%3A30/oops1.pdf?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1476550227&Signature=aZols72pDxL38F9jlZZ9WMaNUkw%3D"
        }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Strategist does not exist."
 *      }
 *
 * @apiError Unprocessable_Entity When without request data.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 UNPROCESSABLE ENTITY
 *    {
 *       "message": "Document with this name already exists."
 *    }
 *
 * @apiError Bad_Request When without request data.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.post('/:strategistId/document', fileServeMiddleware('document', 'document/'), s3upload.array('document', 12), function (req, res) {
    logger.info("Upload document for strategist request received");
    req.data.id = req.params.strategistId;

    uploadService.check(req, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }
        req.data.documentName = req.files[0]['originalname'];
        strategistService.verifyStrategist(req.data, function (err, status, data) {
            if (err) {
              return response(err, status, data, res);
            }
            uploadService.verifyDocument(req, res, function (err, statusCode, status, data) {
               if (err) {
                     return response(err, status, data, res);
                }
                if (statusCode == 'DUPLICATE_ENTRY') {
                     return response(status, statusCode, status, res);
                }
                uploadService.uploadDocument(req, res, function (err, status, data) {
                    return response(err, status, data, res);
                     });
                });
            });
    });
});


/**@api {delete} /community/strategists/:strategistId/document?documentId={documentId} Delete strategist document
 * @apiName Delete document
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API soft deletes uploaded document of strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/2/document?documentId={documentId}
 * 
 * @apiParam (PathParam) {Number}          strategistId    Strategist unique ID.
 * @apiParam (QueryParam){Text}     name     Name of document to delete.
 *
 * @apiSuccess {Number}     id                      The doucment id.
 * @apiSuccess {Number}     type                    Document type value.
 * @apiSuccess {String}     displayName             Document display name.
 * @apiSuccess {String}     documentName            Name of the doucment/file.
 * @apiSuccess {String}     description             Description of document.
 * @apiSuccess {Number}     strategistId            The Strategist user Id.
 * @apiSuccess {String}     createdDate             Date when doucment was created.
 * @apiSuccess {Number}     createdBy               User Id.
 * @apiSuccess {String}     editedDate              The Strategist user Id.
 * @apiSuccess {Number}     editedBy                Date when last doucment was updated.
 * @apiSuccess {Number}     isDeleted               Indicate status of document, 1 states document is deleted & 0 states not deleted.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "id": 57,
        "type": 0,
        "displayName": "Import Model template",
        "documentName": "oops1.pdf",
        "description": "Sample model with sample values",
        "path": "dev/13/document/2016-10-14T17:47:28+05:30/oops1.pdf",
        "strategistId": 13,
        "createdDate": "2016-10-14T12:17:32.000Z",
        "createdBy": 13,
        "editedDate": "2016-10-15T07:19:29.000Z",
        "editedBy": 13,
        "isDeleted": 1
        }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Strategist does not exist."
 *      }
 *
 * @apiError Unprocessable_Entity When without request data.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 UNPROCESSABLE ENTITY
 *    {
 *       "message": "Document with this name already deleted."
 *    }
 *
 * @apiError Bad_Request When without request data.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.delete('/:strategistId/document', function (req, res) {
    logger.info("Delete document for strategist request received");
    req.data.id = req.params.strategistId;
    req.data.documentId = req.query.documentId;
    strategistService.verifyStrategist(req.data, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }
        uploadService.deleteDocument(req, res, function (err, statusCode, status, data) {
            return response(err, statusCode, status, res);
        });
    });
});

/**@api {post} /community/strategists/:strategistId/models/import Upload strategist model
 * @apiName Upload Model
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist-model
 * @apiPermission appstrategist
 *
 * @apiDescription This API imports model using file upload. Excel Files only. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/2/models/import
 * 
 * @apiParam {Number}       strategistId            Strategist unique ID.
 *
 * @apiParam (Multipart/Form-Data)       {Text}     name            Name of model. 
 * @apiParam (Multipart/Form-Data)       {Text}     description     A breif description about model .
 * @apiParam (Multipart/Form-Data)       {file}     model=File      A resource file/files to be uploaded. Must be last feild in form.
 *
 * @apiSuccess {String}     message                 Upload message success / failure.
 *
 * @apiSuccessExample {json} Success-Response:
 *        
 *  [
  {
    "id": 266,
    "name": "Model-new-growth6",
    "status": 1,
    "isDeleted": 0,
    "createdBy": "primetgi",
    "editedBy": "primetgi",
    "targetRiskLower": 10,
    "targetRiskUpper": 5,
    "currentRisk": 10,
    "minimumAmount": 10,
    "style": "balanced",
    "allocation": 100,
    "isDynamic": 0,
    "advisorFee": 1200,
    "weightedAvgNetExpense": 50000,
    "strategistId": 13,
    "createdOn": "2016-10-26T08:24:42.000Z",
    "editedOn": "2016-10-26T08:24:42.000Z",
    "securities": [
      {
        "id": 1,
        "name": "Apple",
        "symbol": "AAPL",
        "company": "Apple Inc.",
        "category": "0",
        "assetClass": "Equity",
        "subClass": "LargeCap",
        "type": "stock",
        "allocation": 50,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 9
      },
      {
        "id": 2,
        "name": "Google",
        "symbol": "GOOG",
        "company": "Google INC",
        "category": "0",
        "assetClass": "Equity",
        "subClass": "LargeCap",
        "type": "stock",
        "allocation": 25,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 10
      },
      {
        "id": 13,
        "name": "CUSTODIAL_CASH",
        "symbol": "CCASH",
        "company": null,
        "category": "0",
        "assetClass": "Cash",
        "subClass": "Cash",
        "type": "custodialCash",
        "allocation": 25,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 9
      }
    ]
  },
  {
    "id": 267,
    "name": "Model-new-growth7",
    "status": 1,
    "isDeleted": 0,
    "createdBy": "primetgi",
    "editedBy": "primetgi",
    "targetRiskLower": 10,
    "targetRiskUpper": 10,
    "currentRisk": 10,
    "minimumAmount": 10,
    "style": "balanced",
    "allocation": 100,
    "isDynamic": 0,
    "advisorFee": 1500,
    "weightedAvgNetExpense": 80000,
    "strategistId": 13,
    "createdOn": "2016-10-26T08:24:42.000Z",
    "editedOn": "2016-10-26T08:24:42.000Z",
    "securities": [
      {
        "id": 1,
        "name": "Apple",
        "symbol": "AAPL",
        "company": "Apple Inc.",
        "category": "0",
        "assetClass": "Equity",
        "subClass": "LargeCap",
        "type": "stock",
        "allocation": 50,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 9
      },
      {
        "id": 2,
        "name": "Google",
        "symbol": "GOOG",
        "company": "Google INC",
        "category": "0",
        "assetClass": "Equity",
        "subClass": "LargeCap",
        "type": "stock",
        "allocation": 25,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 10
      },
      {
        "id": 13,
        "name": "CUSTODIAL_CASH",
        "symbol": "CCASH",
        "company": null,
        "category": "0",
        "assetClass": "Cash",
        "subClass": "Cash",
        "type": "custodialCash",
        "allocation": 25,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 9
      }
    ]
  }
  ]
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Strategist does not exist."
 *      }
 *
 * @apiError UNPROCESSABLE Model Import error list.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     [
        {
            "message": "Duplicate ticker not allowed for same security.",
            "data": "model2 & model2",
            "error": "ADBE == ADBE"
        },
        {
            "message": "Allocation is not equal to 100",
            "data": "model1",
            "error": 110
        },
        {
            "message": "Allocation is not equal to 100",
            "data": "model3",
            "error": 80
        }
 ]
 
 * @apiError UNPROCESSABLE Model Import error list.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 [      
        {
            "message": "duplicate model name",
            "error": "Model already exist in database with same model name",
            "data": "model1"
        },
        {
            "message": "duplicate model name",
            "error": "Model already exist in database with same model name",
            "data": "model2"
        },
        {
            "message": "duplicate model name",
            "error": "Model already exist in database with same model name",
            "data": "model3"
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
 **/
app.post('/:strategistId/models/import', fileServeMiddleware('model', '/uploads/models/'), upload.single('model'), privilegeValidator,function (req, res) {
    logger.info("model import for strategist request received");
    req.data.id = req.params.strategistId;
    strategistService.verifyStrategist(req.data, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }
        uploadService.uploadModel(req, res, function (err, statusCode, status, data) {
            return response(err, statusCode, status, res);
        });
    });
});

/**@api {post} /community/strategists/models/import Upload strategist model of loggedIn user
 * @apiName Upload Model of Logged In user
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist-model
 * @apiPermission appstrategist
 *
 * @apiDescription This API imports model using file upload. Excel Files only. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/import
 * 
 * @apiParam {Number}       strategistId            Strategist unique ID.
 *
 * @apiParam {Number}                               strategistId    Strategist unique ID.
 * @apiParam (Multipart/Form-Data)       {Text}     name            Name of model. 
 * @apiParam (Multipart/Form-Data)       {Text}     description     A breif description about model .
 * @apiParam (Multipart/Form-Data)       {file}     model=File      A resource file/files to be uploaded. Must be last feild in form.
 *
 * @apiSuccess {String}     message                 Upload message success / failure.
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK  
 *   [
  {
    "id": 266,
    "name": "Model-new-growth6",
    "status": 1,
    "isDeleted": 0,
    "createdBy": "primetgi",
    "editedBy": "primetgi",
    "targetRiskLower": 10,
    "targetRiskUpper": 5,
    "currentRisk": 10,
    "minimumAmount": 10,
    "style": "balanced",
    "allocation": 100,
    "isDynamic": 0,
    "advisorFee": 1200,
    "weightedAvgNetExpense": 50000,
    "strategistId": 13,
    "createdOn": "2016-10-26T08:24:42.000Z",
    "editedOn": "2016-10-26T08:24:42.000Z",
    "securities": [
      {
        "id": 1,
        "name": "Apple",
        "symbol": "AAPL",
        "company": "Apple Inc.",
        "category": "0",
        "assetClass": "Equity",
        "subClass": "LargeCap",
        "type": "stock",
        "allocation": 50,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 9
      },
      {
        "id": 2,
        "name": "Google",
        "symbol": "GOOG",
        "company": "Google INC",
        "category": "0",
        "assetClass": "Equity",
        "subClass": "LargeCap",
        "type": "stock",
        "allocation": 25,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 10
      },
      {
        "id": 13,
        "name": "CUSTODIAL_CASH",
        "symbol": "CCASH",
        "company": null,
        "category": "0",
        "assetClass": "Cash",
        "subClass": "Cash",
        "type": "custodialCash",
        "allocation": 25,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 9
      }
    ]
  },
  {
    "id": 267,
    "name": "Model-new-growth7",
    "status": 1,
    "isDeleted": 0,
    "createdBy": "primetgi",
    "editedBy": "primetgi",
    "targetRiskLower": 10,
    "targetRiskUpper": 10,
    "currentRisk": 10,
    "minimumAmount": 10,
    "style": "balanced",
    "allocation": 100,
    "isDynamic": 0,
    "advisorFee": 1500,
    "weightedAvgNetExpense": 80000,
    "strategistId": 13,
    "createdOn": "2016-10-26T08:24:42.000Z",
    "editedOn": "2016-10-26T08:24:42.000Z",
    "securities": [
      {
        "id": 1,
        "name": "Apple",
        "symbol": "AAPL",
        "company": "Apple Inc.",
        "category": "0",
        "assetClass": "Equity",
        "subClass": "LargeCap",
        "type": "stock",
        "allocation": 50,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 9
      },
      {
        "id": 2,
        "name": "Google",
        "symbol": "GOOG",
        "company": "Google INC",
        "category": "0",
        "assetClass": "Equity",
        "subClass": "LargeCap",
        "type": "stock",
        "allocation": 25,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 10
      },
      {
        "id": 13,
        "name": "CUSTODIAL_CASH",
        "symbol": "CCASH",
        "company": null,
        "category": "0",
        "assetClass": "Cash",
        "subClass": "Cash",
        "type": "custodialCash",
        "allocation": 25,
        "lowerTolerancePercent": 9,
        "upperTolerancePercent": 9
      }
    ]
  }
  ]   
 *  
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Strategist does not exist."
 *      }
 *
 * @apiError UNPROCESSABLE Model Import error list.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     [
        {
            "message": "Duplicate ticker not allowed for same security.",
            "data": "model2 & model2",
            "error": "ADBE == ADBE"
        },
        {
            "message": "Allocation is not equal to 100",
            "data": "model1",
            "error": 110
        },
        {
            "message": "Allocation is not equal to 100",
            "data": "model3",
            "error": 80
        }
 ]
 
 * @apiError UNPROCESSABLE Model Import error list.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 [      
        {
            "message": "duplicate model name",
            "error": "Model already exist in database with same model name",
            "data": "model1"
        },
        {
            "message": "duplicate model name",
            "error": "Model already exist in database with same model name",
            "data": "model2"
        },
        {
            "message": "duplicate model name",
            "error": "Model already exist in database with same model name",
            "data": "model3"
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
 **/
app.post('/models/import', fileServeMiddleware('model', '/uploads/models/'), upload.single('model'), privilegeValidator,function (req, res) {
    logger.info("model import for strategist request received");
    var data = req.data;
    data.assignedUserId = data.user.userId;
    strategistService.getStrategistAgainstUsers(data, function (err, status, strategistData) {
        if (err) {
            return response(err, status, strategistData, res);
        }
        data.id = strategistData.strategistId;
        strategistService.verifyStrategist(data, function (err, status, data) {
            if (err) {
                return response(err, status, data, res);
            }
            uploadService.uploadModel(req, res, function (err, status, data) {
                return response(err, status, data, res);
            });
        });
    });
});

/**@api {post} /community/strategists/:strategistId/models Create strategist model 
 * @apiName Add Model
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist-model
 * @apiPermission appstrategist
 *
 * @apiDescription This API add strategist model using Form. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type": application/json
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/2/models
 * 
 *
 * @apiParam {String}        name               Display Name of model. 
 * @apiParam {Number}        targetRiskLower         Percentage of lower Target risk
 * @apiParam {Number}        targetRiskUpper         Percentage of upper Target risk
 * @apiParam {Number}        minimumAmount           Minimum amount to invest 
 * @apiParam {Number}        currentRisk             Value of current risk
 * @apiParam {String}        style                   Style of the model.
 * @apiParam {Number}        advisorFee              Value of Advisor's fees
 * @apiParam {Number}        weightedAvgNetExpense   Value of Weighted Average Net Expanse
 * @apiParam {Array}         securities              Array of securities containing id, symbol, allocation, upperTolerancePercent and lowerTolerancePercent               
 * @apiParam {Number}         id                     Id of security                
 * @apiParam {String}         symbol                 Symbol of security               
 * @apiParam {Number }        allocation             Allocation of the secuity percentagewise               
 * @apiParam {Number}         upperTolerancePercent   Upper Tolerance Percentage of the security
 * @apiParam {Number}         lowerTolerancePercent   Lower Tolerance Percentage of the security
 * 
 * 
 * @apiParamExample {json} Request-Example:
 *    {
        "name": "modeltestNew",
        "targetRiskLower": 5,
        "targetRiskUpper": 10,
        "minimumAmount": 100000,
        "currentRisk": 10,
        "isDynamic":0,
        "style": "Balanced",
        "advisorFee": 50,
        "style": "Balanced",
        "weightedAvgNetExpense": 1200,
        "securities": [
            {
            "symbol":"GOOG",
            "allocation": 25,
            "upperTolerancePercent": 10,
            "lowerTolerancePercent": 5
            },
            {
            "symbol":"MSFT",
            "allocation": 25,
            "upperTolerancePercent": 10,
            "lowerTolerancePercent": 5
            },
            {
            "symbol":"ADI",
            "allocation": 25,
            "upperTolerancePercent": 10,
            "lowerTolerancePercent": 5
            },
            {
            "symbol":"CCASH",
            "allocation": 25,
            "upperTolerancePercent": 10,
            "lowerTolerancePercent": 5
            }
        ]
   }
 * 
 *
 * 
 * 
 * @apiSuccess {String}        name               Display Name of model. 
 * @apiSuccess {Number}        targetRiskLower         Percentage of lower Target risk
 * @apiSuccess {Number}        targetRiskUpper         Percentage of upper Target risk
 * @apiSuccess {Number}        minimumAmount           Minimum amount to invest 
 * @apiSuccess {Number}        currentRisk             Value of current risk
 * @apiSuccess {String}        style                   Style of the model.
 * @apiSuccess {Number}        advisorFee              Value of Advisor's fees
 * @apiSuccess {Number}        weightedAvgNetExpense   Value of Weighted Average Net Expanse
 * @apiSuccess {Array}         securities              Array of securities containing json of id, symbol, allocation, upperTolerancePercent and lowerTolerancePercent
 * @apiSuccess {Number}         allocationPercent      Total percentage of the constituting security
 * @apiSuccess {Number}         id                     Id of security                
 * @apiSuccess {String}         symbol                 Symbol of security               
 * @apiSuccess {Number }        allocation             Allocation of the secuity percentagewise               
 * @apiSuccess {Number}         upperTolerancePercent   Upper Tolerance Percentage of the security
 * @apiSuccess {Number}         lowerTolerancePercent   Lower Tolerance Percentage of the security
 * 
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK  
 * {
        "id": 244,
        "name": "modeltestNew",
        "status": 1,
        "isDeleted": 0,
        "createdBy": "primetgi",
        "editedBy": "primetgi",
        "targetRiskLower": 5,
        "targetRiskUpper": 10,
        "currentRisk": 10,
        "minimumAmount": 100000,
        "style": "Balanced",
        "allocation": null,
        "isDynamic": 0,
        "advisorFee": 50,
        "weightedAvgNetExpense": 1200,
        "strategistId": 1,
        "createdOn": "2016-10-25T12:27:30.000Z",
        "editedOn": "2016-10-25T12:27:30.000Z",
        "securities": [
            {
            "id": 2,
            "name": "Google",
            "symbol": "GOOG",
            "company": "Google INC",
            "category": "0",
            "assetClass": "Equity",
            "subClass": "LargeCap",
            "type": "stock",
            "allocation": 25,
            "lowerTolerancePercent": 5,
            "upperTolerancePercent": 10
            },
            {
            "id": 3,
            "name": "Microsoft",
            "symbol": "MSFT",
            "company": "Microsoft Corporation",
            "category": "0",
            "assetClass": "Equity",
            "subClass": "LargeCap",
            "type": "stock",
            "allocation": 25,
            "lowerTolerancePercent": 5,
            "upperTolerancePercent": 10
            },
            {
            "id": 13,
            "name": "CUSTODIAL_CASH",
            "symbol": "CCASH",
            "company": null,
            "category": "0",
            "assetClass": "Cash",
            "subClass": "Cash",
            "type": "custodialCash",
            "allocation": 25,
            "lowerTolerancePercent": 5,
            "upperTolerancePercent": 10
            },
            {
            "id": 6,
            "name": "Analog Device",
            "symbol": "ADI",
            "company": "Analog Devices Inc",
            "category": "0",
            "assetClass": "Equity",
            "subClass": "LargeCap",
            "type": null,
            "allocation": 25,
            "lowerTolerancePercent": 5,
            "upperTolerancePercent": 10
            }
        ]
     }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Strategist does not exist."
 *      }
 *
 * @apiError UNPROCESSABLE Model Import error list.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     [
        {
            "message": "Duplicate ticker not allowed for same security.",
            "data": "model2 & model2",
            "error": "ADBE == ADBE"
        },
        {
            "message": "Allocation is not equal to 100",
            "data": "model1",
            "error": 110
        },
        {
            "message": "Allocation is not equal to 100",
            "data": "model3",
            "error": 80
        }
 ]
 
 * @apiError UNPROCESSABLE Model Import error list.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
        [
        {
            "message": "duplicate model name",
            "error": "Model already exist in database with same model name",
            "data": "modelY"
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
 **/
app.post('/:strategistId/models', validate({
    body: postModelSchema
}), privilegeValidator,function (req, res) {
    logger.info("model import for strategist request received");
    req.data.id = req.params.strategistId;
    strategistService.verifyStrategist(req.data, function (err, status, data) {
        if (err) {
            logger.debug('form upload error');
            return response(err, status, data, res);
        }
        uploadService.postModelForForm(req, res, function (err, status, data) {
            logger.debug('form upload finish');
            return response(err, status, data, res);
        });
    });
});

/**@api {post} /community/strategists/models Create strategist model corresponding to LoggedIn user 
 * @apiName Add Model of loggedIn User
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist-model
 * @apiPermission appstrategist
 *
 * @apiDescription This API add strategist model using Form. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type": application/json
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models
 * 
 *
 * @apiParam {Number}        strategistId            Strategist unique ID.
 * @apiParam {String}        name                    Display Name of model. 
 * @apiParam {Number}        targetRiskLower         Percentage of lower Target risk
 * @apiParam {Number}        targetRiskUpper         Percentage of upper Target risk
 * @apiParam {Number}        minimumAmount           Minimum amount to invest 
 * @apiParam {Number}        currentRisk             Value of current risk
 * @apiParam {String}        style                   Style of the model.
 * @apiParam {Number}        advisorFee              Value of Advisor's fees
 * @apiParam {Number}        weightedAvgNetExpense   Value of Weighted Average Net Expanse
 * @apiParam {Array}         securities              Array of securities containing id, symbol, allocation, upperTolerancePercent and lowerTolerancePercent               
 * @apiParam {Number}         id                     Id of security                
 * @apiParam {String}         symbol                 Symbol of security               
 * @apiParam {Number }        allocation             Allocation of the secuity percentagewise               
 * @apiParam {Number}         upperTolerancePercent   Upper Tolerance Percentage of the security
 * @apiParam {Number}         lowerTolerancePercent   Lower Tolerance Percentage of the security
 * 
 * 
 * @apiParamExample {json} Request-Example:
 *    {
        "name": "modelY",
        "targetRiskLower": 5,
        "targetRiskUpper": 10,
        "minimumAmount": 100000,
        "isDynamic" : 1,
        "currentRisk": 10,
        "style": "Balanced",
        "advisorFee": 50,
        "weightedAvgNetExpense": 1200,
        "securities": [
            {
            "id":123,
            "symbol":"GOOG",
            "allocation": 25,
            "upperTolerancePercent": 10,
            "lowerTolerancePercent": 5
            },
            {
            "id":124,
            "symbol":"MSFT",
            "allocation": 25,
            "upperTolerancePercent": 10,
            "lowerTolerancePercent": 5
            },
            {
            "id":125,
            "symbol":"ADI",
            "allocation": 50,
            "upperTolerancePercent": 10,
            "lowerTolerancePercent": 5
            }
        ]
    }
 * 
 *
 * 
 * 
 * @apiSuccess {String}        name               Display Name of model. 
 * @apiSuccess {Number}        targetRiskLower         Percentage of lower Target risk
 * @apiSuccess {Number}        targetRiskUpper         Percentage of upper Target risk
 * @apiSuccess {Number}        minimumAmount           Minimum amount to invest 
 * @apiSuccess {Number}        currentRisk             Value of current risk
 * @apiSuccess {String}        style                   Style of the model.
 * @apiSuccess {Number}        advisorFee              Value of Advisor's fees
 * @apiSuccess {Number}        weightedAvgNetExpense   Value of Weighted Average Net Expanse
 * @apiSuccess {Array}         securities              Array of securities containing json of id, symbol, allocation, upperTolerancePercent and lowerTolerancePercent
 * @apiSuccess {Number}         allocationPercent      Total percentage of the constituting security
 * @apiSuccess {Number}         id                     Id of security                
 * @apiSuccess {String}         symbol                 Symbol of security               
 * @apiSuccess {Number}         allocation             Allocation of the secuity percentagewise               
 * @apiSuccess {Number}         upperTolerancePercent   Upper Tolerance Percentage of the security
 * @apiSuccess {Number}         lowerTolerancePercent   Lower Tolerance Percentage of the security
 * 
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK  
 *  {
  "id": 237,
  "name": "modelFromHDC28",
  "status": 1,
  "isDeleted": 0,
  "createdBy": "primetgi",
  "editedBy": "primetgi",
  "targetRiskLower": "50",
  "isDynamic" : 1,
  "targetRiskUpper": "100",
  "currentRisk": "10",
  "minimumAmount": 100000,
  "style": "Balanced",
  "allocation": null,
  "isDynamic": 0,
  "advisorFee": 50,
  "weightedAvgNetExpense": 1200,
  "strategistId": 13,
  "createdOn": "2016-10-25T10:16:01.000Z",
  "editedOn": "2016-10-25T10:16:01.000Z",
  "securities": [
        {
          "id": 2,
          "name": "Google",
          "symbol": "GOOG",
          "company": "Google INC",
          "category": "0",
          "assetClass": "Equity",
          "subClass": "LargeCap",
          "type": "stock",
          "allocation": 25,
          "lowerTolerancePercent": 5,
          "upperTolerancePercent": 10
        },
        {
          "id": 3,
          "name": "Microsoft",
          "symbol": "MSFT",
          "company": "Microsoft Corporation",
          "category": "0",
          "assetClass": "Equity",
          "subClass": "LargeCap",
          "type": "stock",
          "allocation": 25,
          "lowerTolerancePercent": 6,
          "upperTolerancePercent": 10
        },
        {
          "id": 13,
          "name": "CUSTODIAL_CASH",
          "symbol": "CCASH",
          "company": null,
          "category": "0",
          "assetClass": "Cash",
          "subClass": "Cash",
          "type": "custodialCash",
          "allocation": 25,
          "lowerTolerancePercent": 5,
          "upperTolerancePercent": 10
        },
        {
          "id": 6,
          "name": "Analog Device",
          "symbol": "ADI",
          "company": "Analog Devices Inc",
          "category": "0",
          "assetClass": "Equity",
          "subClass": "LargeCap",
          "type": null,
          "allocation": 25,
          "lowerTolerancePercent": 5,
          "upperTolerancePercent": 10
        }
      ]
    }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Strategist does not exist."
 *      }
 *
 * @apiError UNPROCESSABLE Model Import error list.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     [
        {
            "message": "Duplicate ticker not allowed for same security.",
            "data": "model2 & model2",
            "error": "ADBE == ADBE"
        },
        {
            "message": "Allocation is not equal to 100",
            "data": "model1",
            "error": 110
        },
        {
            "message": "Allocation is not equal to 100",
            "data": "model3",
            "error": 80
        }
 ]
 
 * @apiError UNPROCESSABLE Model Import error list.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
        [
        {
            "message": "duplicate model name",
            "error": "Model already exist in database with same model name",
            "data": "modelY"
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
 **/
app.post('/models', validate({
    body: postModelSchema
}), privilegeValidator,function (req, res) {
    logger.info("model import for strategist request received");
    var data = req.data;
    data.assignedUserId = data.user.userId;
    strategistService.getStrategistAgainstUsers(data, function (err, status, strategistData) {
        if (err) {
            return response(err, status, data, res);
        }
        data.id = strategistData.strategistId;
        strategistService.verifyStrategist(data, function (err, status, verifiedData) {
            if (err) {
                logger.debug('form upload error');
                return response(err, status, verifiedData, res);
            }
            uploadService.postModelForForm(req, res, function (err, status, data) {
                logger.debug('form upload finish');
                return response(err, status, data, res);
            });
        });
    });
});

/**@api {get} /community/strategists/models/template/download Get Model Template.
 * @apiName Get model template. 
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist-model
 * @apiPermission appstrategist
 *
 * @apiDescription This API returns template of a model. The same template can be used to import model in community. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/template/download
 * 
 *  
 * @apiSuccess {String}     url                                 Url of a model template.
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
        "url": "https://paxorions3.s3.amazonaws.com/templates/model/ImportModelTemplate.xlsx?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1475189028&Signature=pSiEQCygzu22DvtlgW9D65JhwB8%3D"
     }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 **/
app.get("/models/template/download", function (req, res) {
    logger.info("Get model template API called.");
    uploadService.getModelTemplate(req, res, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @apiIgnore
 * @api {get} /community/strategists/user/verify/:id verify user
 * @apiName Verify User
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API verifies User is already assgined or not. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/user/verify/999
 * 
 * @apiSuccess {String}     message                    Message whether the user is assigned or not.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "message" : "User is not assigned."
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
app.get('/:id/document/verify', function (req, res) {
    logger.info("Verify document request received");
    req.data.id = req.params.id;
    req.data.documentName = req.query.name;
    strategistService.verifyStrategist(req.data, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }
        uploadService.verifyDocument(req, res, function (err, statusCode, status, data) {
            return response(err, statusCode, status, res);
        });
    });
});

/** @api {delete} /community/strategists/models/:id Delete Strategist Model
 * @apiName DeleteStrategistModel
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API Delete Strategist Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 * @apiHeader {String} Content-Type application/json.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj  
 *       "Content-Type" : application/json   
 *     }
 * 
 * @apiParam {Number}        id                     Model id {Required}

 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/13
 * 
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         message : Model deleted successfully."
 *     }
 *     
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 * 
 * @apiError NOTFOUND Invalid modelId or Already Deleted Model id .
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 NOT FOUND
 *     {
 *       "message": "Model does not exist or already deleted."
 *     }
 * 
 * @apiError BADREQUEST  Missing model id.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 BAD REQUEST
 *     {
 *       "message": "message": [
                "id is required "
            ]
 *     }
 * 
 * */
app.delete("/models/:id", privilegeValidator, function (req, res) {
    logger.info("Delete model for strategist request received");
    var data = req.data;
    data.assignedUserId = data.user.userId;
    strategistService.getStrategistAgainstUsers(data, function (err, status, strategistData) {
        if (err) {
            return response(err, status, strategistData, res);
        }
        data.id = strategistData.strategistId;
        data.modelId = req.params.id;
        strategistService.verifyStrategist(data, function (err, status, verifiedData) {
            if (err) {
                return response(err, status, verifiedData, res);
            }
            modelService.deleteModel(data, function (err, statusCode, status, data) {
                return response(err, statusCode, status, res);
            });
        });
    });
});

/**@api {put} /community/strategists/:strategistId/model Update strategist model 
 * @apiName Update Model
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist-model
 * @apiPermission appstrategist
 *
 * @apiDescription This API update strategist model using Form. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 * @apiHeader {String} ContentType application/json.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json    
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/2/model
 * 
 *
 * @apiParam {Number}        modelId                 Strategist unique ID.
 * @apiParam {Number}        strategistId            Strategist unique ID.
 * @apiParam {String}        name               Display Name of model. 
 * @apiParam {Number}        targetRiskLower         Percentage of lower Target risk
 * @apiParam {Number}        targetRiskUpper         Percentage of upper Target risk
 * @apiParam {Number}        minimumAmount           Minimum amount to invest 
 * @apiParam {Number}        currentRisk             Value of current risk
 * @apiParam {String}        style                   Style of the model.
 * @apiParam {Number}        advisorFee              Value of Advisor's fees
 * @apiParam {Number}        weightedAvgNetExpense   Value of Weighted Average Net Expanse
 * @apiParam {Array}         securities              Array of securities containing id, symbol, allocation, upperTolerancePercent and lowerTolerancePercent               
 * @apiParam {Number}         id                     Id of security                
 * @apiParam {String}         symbol                 Symbol of security               
 * @apiParam {Number}        allocation             Allocation of the secuity percentagewise               
 * @apiParam {Number}         upperTolerancePercent   Upper Tolerance Percentage of the security
 * @apiParam {Number}         lowerTolerancePercent   Lower Tolerance Percentage of the security
 * 
 * 
 * @apiParamExample {json} Request-Example:
 *    {
        "modelId" : 77,
        "name": "GrowthNew",
        "targetRiskLower": 15,
        "targetRiskUpper": 20,
        "minimumAmount": 900000,
        "currentRisk": 110,
        "style": "Flexible",
        "advisorFee": 500,
        "weightedAvgNetExpense": 12200,
        "securities": [
            {
                "id":2,
                "symbol": "GOOG",
                "allocation": 30,
                "upperTolerancePercent": 20,
                "lowerTolerancePercent": 10
            },
            {
                "id":3,
                "symbol": "MSFT",
                "allocation": 20,
                "upperTolerancePercent": 20,
                "lowerTolerancePercent": 10
            },
            {
                "id": 6,
                "symbol": "ADI",
                "allocation": 20,
                "upperTolerancePercent": 20,
                "lowerTolerancePercent": 10
            },
            {
                "id": 7,
                "symbol": "ADP",
                "allocation": 30,
                "upperTolerancePercent": 20,
                "lowerTolerancePercent": 10
            }
        ]
    }
 *  
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK  
 *   {
        "message": "Model successfully updated."
     }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *    {
        "message": "Strategist does not exists."
        }
 *
 * 
 * @apiError ModelNotFound The id of Model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *    {
        "message": "Model does not exists."
        }

 * @apiError SecuritySymbolNotFound Securty id provided was not found.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not Found
 *      {
            "message": "Following security Id does not exists :77"
        }
 
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 **/
app.put('/:strategistId/model', privilegeValidator, validate({
    body: modelInputSchema
}), function (req, res) {
    logger.info("update model for strategist request received");
    req.data.id = req.params.strategistId;
    strategistService.verifyStrategist(req.data, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }
        modelService.updateModel(req, function (err, statusCode, status, data) {
            return response(err, statusCode, status, res);
        });
    });
});


/**@api {put} /community/strategists/models/:id Update LoggedIn user strategist model 
 * @apiName Update Model of LoggedIn user
 * @apiVersion 1.0.0
 * @apiGroup Community-Strategist-model
 * @apiPermission appstrategist
 *
 * @apiDescription This API update strategist model using Form. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 * @apiHeader {String} ContentType application/json.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json    
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/model/2
 * 
 *
 * @apiParam {Number}        modelId                 Strategist unique ID.
 * @apiParam {Number}        strategistId            Strategist unique ID.
 * @apiParam {String}        name               Display Name of model. 
 * @apiParam {Number}        targetRiskLower         Percentage of lower Target risk
 * @apiParam {Number}        targetRiskUpper         Percentage of upper Target risk
 * @apiParam {Number}        minimumAmount           Minimum amount to invest 
 * @apiParam {Number}        currentRisk             Value of current risk
 * @apiParam {String}        style                   Style of the model.
 * @apiParam {Number}        advisorFee              Value of Advisor's fees
 * @apiParam {Number}        weightedAvgNetExpense   Value of Weighted Average Net Expanse
 * @apiParam {Array}         securities              Array of securities containing id, symbol, allocation, upperTolerancePercent and lowerTolerancePercent               
 * @apiParam {Number}         id                     Id of security                
 * @apiParam {String}         symbol                 Symbol of security               
 * @apiParam {Number}        allocation             Allocation of the secuity percentagewise               
 * @apiParam {Number}         upperTolerancePercent   Upper Tolerance Percentage of the security
 * @apiParam {Number}         lowerTolerancePercent   Lower Tolerance Percentage of the security
 * 
 * 
 * @apiParamExample {json} Request-Example:
 *    {
        "modelId" : 77,
        "name": "GrowthNew",
        "targetRiskLower": 15,
        "targetRiskUpper": 20,
        "minimumAmount": 900000,
        "currentRisk": 110,
        "style": "Flexible",
        "advisorFee": 500,
        "weightedAvgNetExpense": 12200,
        "securities": [
            {
                "id":2,
                "symbol": "GOOG",
                "allocation": 30,
                "upperTolerancePercent": 20,
                "lowerTolerancePercent": 10
            },
            {
                "id":3,
                "symbol": "MSFT",
                "allocation": 20,
                "upperTolerancePercent": 20,
                "lowerTolerancePercent": 10
            },
            {
                "id": 6,
                "symbol": "ADI",
                "allocation": 20,
                "upperTolerancePercent": 20,
                "lowerTolerancePercent": 10
            },
            {
                "id": 7,
                "symbol": "ADP",
                "allocation": 30,
                "upperTolerancePercent": 20,
                "lowerTolerancePercent": 10
            }
        ]
    }
 *  
 *
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK  
 *   {
        "message": "Model successfully updated."
     }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *    {
        "message": "Strategist does not exists."
        }
 *
 * 
 * @apiError ModelNotFound The id of Model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *    {
        "message": "Model does not exists."
        }

 * @apiError SecuritySymbolNotFound Securty id provided was not found.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not Found
 *      {
            "message": "Following security Id does not exists :77"
        }
 
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 **/
app.put('/models/:id', validate({
    body: modelInputSchema
}), function (req, res) {
    logger.info("model import for strategist request received");
    var data = req.data;
    data.assignedUserId = data.user.userId;
    strategistService.getStrategistAgainstUsers(data, function (err, status, strategistData) {
        if (err) {
            return response(err, status, data, res);
        }
        data.id = strategistData.strategistId;
        data.modelId = req.params.id;
        strategistService.verifyStrategist(data, function (err, status, verifiedData) {
            if (err) {
                return response(err, status, verifiedData, res);
            }
            modelService.updateModel(req, function (err, status, data) {
                return response(err, status, data, res);
            });
        });
    });
});


/**Model marketing APIs */

var postCommentaryModelSchema = {
    type: 'object',
    properties: {
        commentary: {
                 type: 'string',
                 required: true
        }
    }
};

/**@api {post} community/strategists/models/:id/commentary  Add model commentary
 * @apiName Add Commentary
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API adds model commentary to model of a particular strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/72/commentary
 * 
 * @apiParam (PathParam)  {Number}     modelId          Model Id.
 * @apiParam (Body)       {String}     commentary     Commentary Content. 
 * @apiParam (Body)       {Number}     modelId        Model Id.
 * @apiParam (Body)       {String}     modelName      Model Name. 
 * 
 * @apiParamExample {json} Request-Example:
 * {
        "modelId": 79,
        "modelName": "model2",
        "commentary": "I am changing this to that."
   }
 * 
 * @apiSuccess (Body)       {String}     commentary     Commentary Content. 
 * @apiSuccess (Body)       {Number}     modelId        Model Id.
 * @apiSuccess (Body)       {String}     modelName      Model Name. 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "modelId": 79,
            "modelName": "model2",
            "commentary": "This is a test."
        }
 *
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
        "message": "Model does not exists."
       }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

/**@api {get} community/strategists/models/:id/commentary  Get model commentary
 * @apiName Get Commentary
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API retrives model commentary to model of a particular strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/72/commentary
 * 
 * @apiParam (PathParam)  {Number}   modelId        Model Id.
 * 
 * @apiSuccess {Number}     modelId                    Model Id
 * @apiSuccess {String}     modelName                   Model name
 * @apiSuccess {String}     commentary                  commentary content.
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
        "modelId": 62,
        "modelName": "mod1",
        "commentary": "This is sample data to be added "
        }
 *
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
        "message": "Model does not exists."
       }
 *

 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */


app.post('/models/:id/commentary',validate({
    body: postCommentaryModelSchema
}), function (req, res) {
    modelService.addCommentary(req, function (err, statusCode, data) {
        return response(err, statusCode, data, res);
    });
});

app.get('/models/:id/commentary', function (req, res) {
    modelService.getCommentary(req, function (err, statusCode, data) {
        return response(err, statusCode, data, res);
    });
});

/**@api {post} /community/strategists/models/:id/document  document Upload for strategist with particular model
 * @apiName Upload document with particular model
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API uploads document to a particular model of a particular strategist . 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/74/document
 * 
 * @apiParam (PathParam)                 {Number}   id              Model Id.
 * @apiParam (Multipart/Form-Data)       {Text}     name            Display Name of document. 
 * @apiParam (Multipart/Form-Data)       {Text}     description     A breif description about document .
 * @apiParam (Multipart/Form-Data)       {file}     document=File   A resource file to be uploaded. Must be last field in form.

 *
 * @apiSuccess {Number}     id                      The doucment id.
 * @apiSuccess {Number}     type                    Document type value.
 * @apiSuccess {String}     displayName             Document display name.
 * @apiSuccess {String}     documentName            Name of the doucment/file.
 * @apiSuccess {String}     description             Description of document.
 * @apiSuccess {String}     path                    Path of document on S3 server  
 * @apiSuccess {Number}     strategistId            The Strategist user Id.
 * @apiSuccess {String}     createdDate             Date when doucment was created.
 * @apiSuccess {Number}     createdBy               User Id.
 * @apiSuccess {String}     editedDate              Date when doucment was updated last.
 * @apiSuccess {Number}     editedBy                User Id updating the document.
 * @apiSuccess {String}     url                     Actual url of the document.
 * @apiSuccess {Number}     isDeleted               Indicate status of document, 1 states document is deleted & 0 states not deleted.
 * @apiSuccess {Number}     modelId                 Model Id 
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "id": 299,
        "TYPE": 0,
        "displayName": "Test",
        "documentName": "Security UI Updates_new4.pdf",
        "description": "testing a document",
        "path": "dev/model304/documentModel/2016-11-17T16:16:11+05:30/Security UI Updates_new4.pdf",
        "strategistId": null,
        "createdDate": "2016-11-17T10:46:18.000Z",
        "createdBy": "john login name",
        "editedDate": "2016-11-17T10:46:18.000Z",
        "editedBy": "john login name",
        "modelId": 304,
        "isDeleted": 0,
        "url": "https://paxorions3.s3.amazonaws.com/dev/model304/documentModel/2016-11-17T16%3A16%3A11%2B05%3A30/Security%20UI%20Updates_new4.pdf?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1479415579&Signature=bzyI3AK6ZOzZZ%2Fbu4iuYl4KSlfI%3D"
  }
 *
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "message": "Model does not exist for the provided strategist."
 *     }
 *
 * @apiError Unprocessable_Entity When without request data.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 UNPROCESSABLE ENTITY
 *    {
 *       "message": "Document with this name already exists."
 *    } 
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/models/:modelId/document', fileServeMiddleware('document', 'documentModel/'), s3upload.array('document', 12), function (req, res) {
    logger.info("Upload document for model request received");
    req.data.id = req.params.strategistId;
    req.data.modelId = req.params.modelId;

    uploadService.check(req, function (err, status, data) {

        if (err) {
            return response(err, status, data, res);
        }
        req.data.documentName = req.files[0]['originalname'];
        modelService.verifyModel(req.data, function (err, status, data) {
            if (err) {
                return response(err, status, data, res);
            }
            req.data.id = data[0].strategistId;
            uploadService.verifyDocument(req, res, function (err, statusCode, status, data) {
                if (err) {
                    return response(err, status, data, res);
                }
                if (statusCode == 'DUPLICATE_ENTRY') {
                    return response(status, statusCode, status, res);
                }
                uploadService.uploadDocument(req, res, function (err, status, data) {
                    ///      data.modelId = parseInt(req.params.modelId);
                    return response(err, status, data, res);
                });
            });
        });
    });
});

/** @api {get} /community/strategists/models/:id/documents Get model documents
 * @apiName Get model documents
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API Get Strategist documents. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/74/documents
 * 
 * @apiSuccess {Integer}    id                      Document id
 * @apiSuccess {Integer}    type                    Document type
 * @apiSuccess {String}     displayName             display name of document
 * @apiSuccess {String}     documentName            document name 
 * @apiSuccess {String}     path                    path of document
 * @apiSuccess {Integer}    strategistId            strategist id of the model provided
 * @apiSuccess {String}     createdBy               strategist id creating the document
 * @apiSuccess {String}     createdDate             date of creation
 * @apiSuccess {String}     editedDate              date of last editing
 * @apiSuccess {String}     editedBy                strategist id editing the document
 * @apiSuccess {Integer}    isDeleted               status of the document i.e. deleted or not
 * @apiSuccess {Integer}    modelId                 model Id
 * 
 *  
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
  {
    "id": 260,
    "type": 0,
    "displayName": "Test",
    "documentName": "Security UI Updates_new2.pdf",
    "description": "testing a file",
    "path": "dev/13/documentModel/2016-11-02T13:53:21+05:30/Security UI Updates_new2.pdf",
    "strategistId": 13,
    "createdDate": "2016-11-02T08:23:28.000Z",
    "createdBy": 13,
    "editedDate": "2016-11-02T08:23:28.000Z",
    "editedBy": 13,
    "isDeleted": 0,
    "modelId": 74,
    "Security UI Updates_new2.pdf": "https://paxorions3.s3.amazonaws.com/dev/13/documentModel/2016-11-02T13%3A53%3A21%2B05%3A30/Security%20UI%20Updates_new2.pdf?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1478111986&Signature=3%2BhIoUnIIdf%2FRAZuZqGJWAs19lo%3D"
  },
  {
    "id": 261,
    "type": 0,
    "displayName": "Test",
    "documentName": "Security UI Updates_new3.pdf",
    "description": "testing a file",
    "path": "dev/undefined/documentModel/2016-11-02T13:56:51+05:30/Security UI Updates_new3.pdf",
    "strategistId": 13,
    "createdDate": "2016-11-02T08:27:00.000Z",
    "createdBy": 13,
    "editedDate": "2016-11-02T08:27:00.000Z",
    "editedBy": 13,
    "isDeleted": 0,
    "modelId": 74,
    "Security UI Updates_new3.pdf": "https://paxorions3.s3.amazonaws.com/dev/undefined/documentModel/2016-11-02T13%3A56%3A51%2B05%3A30/Security%20UI%20Updates_new3.pdf?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1478111986&Signature=39z%2BUmapVPH1MphHkbijjcZWpIw%3D"
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
app.get('/models/:modelId/documents', function (req, res) {
    logger.info("get documents of strategist for a model request received");
    var data = req.data;
    data.modelId = req.params.modelId;
    strategistService.getDocuments(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {delete} /community/strategists/models/:id/document?documentId={documentId} Delete model document
 * @apiName Delete model document
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API soft deletes uploaded document of strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/74/document?documentId=259
 * 
 * @apiParam (PathParam) {Number}          modelId    model unique ID.
 * @apiParam (QueryParam){Number}          id         Id of document to delete.
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
         "message": "Document successfully deleted."
    }
 *
 * @apiError StrategistNotFound The id of the Strategist was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *    {
 *     "message": "Model does not exist for the provided strategist."
 *     }
 *
 *
 * @apiError Bad_Request When without request data.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.delete('/models/:modelId/document', privilegeValidator,function (req, res) {
    logger.info("Delete document for model request received.");
    req.data.modelId = req.params.modelId;
    req.data.documentId = req.query.documentId;

    modelService.verifyModel(req.data, function (err, status, data) {
        if (err) {
            return response(err, status, data, res);
        }
        req.data.id = data[0].strategistId;
        uploadService.deleteDocument(req, res, function (err, statusCode, status, data) {
            return response(err, statusCode, status, res);
        });
    });
});



/**@api {get} /models/:{modelId/modelName}/performance Get model performance
 * @apiName Get performance
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API retrives model performance of a particular strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/74/performance
 * 
 * 
 * @apiSuccess {Number}     id                          id of the performance
 * @apiSuccess {String}     modelId                     modelId of the performance
 * @apiSuccess {Number}     MTD                         MTD value in %
 * @apiSuccess {Number}     QTD                         QTD value in %
 * @apiSuccess {Number}     YTD                         YTD value in %
 * @apiSuccess {Number}     oneYear                     1YR value in %
 * @apiSuccess {Number}     threeYear                   3YR value in %
 * @apiSuccess {Number}     fiveYear                    5YR value in %
 * @apiSuccess {Number}     tenYear                     10YR value in %
 * @apiSuccess {Number}     inception                   inception value 
 * @apiSuccess {String}     asOnDate                    As on date value of the performance
 * @apiSuccess {Number}     createdBy                   user id to create the performance 
 * @apiSuccess {Number}     editedBy                    user id to edit the performance
 * @apiSuccess {String}     createdDate                 Date of creation
 * @apiSuccess {String}     editedDate                  Date of last edit
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
            {
                "id": 3,
                "modelId": 74,
                "mtd": -0.026,
                "qtd": 0,
                "ytd": 0,
                "oneYear": -0.018,
                "threeYear": 0,
                "fiveYear": 0,
                "tenYear": -0.0671,
                "inception": 0,
                "isDeleted": 0,
                "asOnDate": "10/20/2016",
                "createdDate": "2016-11-04T10:28:30.000Z",
                "createdBy": "primetgi",
                "editedDate": "2016-11-07T05:15:54.000Z",
                "editedBy": "primetgi"
            }
      ]
 *
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     [
       ]
 *

 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/models/:value/performance', function (req, res) {
    logger.info("performace model request received.");

    modelService.getPerformanceDetails(req, function (err, status, data) {
        return response(err, status, data, res);
    });
});


var postPerformanceModelSchema = {
    type: 'object',
    properties: {
        asOnDate: {
            type: 'string',
            required: true
        },
        mtd: {
            type: 'number',
            required: true
        },
        qtd: {
            type: 'number',
            required: true
        },
        ytd: {
            type: 'number',
            required: true
        },
        oneYear: {
            type: 'number',
            required: true
        },
        threeYear: {
            type: 'number',
            required: true
        },
        fiveYear: {
            type: 'number',
            required: true
        },
        tenYear: {
            type: 'number',
            required: true
        },
        inception: {
            type: 'number',
            required: true
        }
    }
};

/**@api {post} /models/:id/performance  Add model performance
 * @apiName Add performance
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API adds model performance of a particular strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/79/performance
 * 
 * @apiParam (PathParam)  {Number}   id              Model Id.
 * 
 * @apiParam {Number}     mtd                         MTD value in %
 * @apiParam {Number}     qtd                         QTD value in %
 * @apiParam {Number}     ytd                         YTD value in %
 * @apiParam {Number}     oneYear                     1YR value in %
 * @apiParam {Number}     threeYear                   3YR value in %
 * @apiParam {Number}     fiveYear                    5YR value in %
 * @apiParam {Number}     tenYear                     10YR value in %
 * @apiParam {Number}     inception                   inception value 
 * @apiParam {String}     asOnDate                    As On date value of the performance 
 * 
 * 
 * @apiParamExample {json} Request-Example:
 *    {
            "mtd": 0.026,
            "qtd": 0,
            "ytd": 0,
            "oneYear": -0.018,
            "threeYear": 0,
            "fiveYear": 0,
            "tenYear": -0.0671,
            "inception": 0,
            "asOnDate": "11/10/2016"
	
    }
 * 
 * @apiSuccess {Number}     id                          Performance Id
 * @apiSuccess {Number}     modelId                     Model Id
 * @apiSuccess {Number}     mtd                         MTD value in %
 * @apiSuccess {Number}     qtd                         QTD value in %
 * @apiSuccess {Number}     ytd                         YTD value in %
 * @apiSuccess {Number}     oneYear                     1YR value in %
 * @apiSuccess {Number}     threeYear                   3YR value in %
 * @apiSuccess {Number}     fiveYear                    5YR value in %
 * @apiSuccess {Number}     tenYear                     10YR value in %
 * @apiSuccess {Number}     inception                   inception value 
 * @apiSuccess {String}     createdDate                 created date 
 * @apiSuccess {String}     editedDate                  Last edited date
 * @apiSuccess {Number}     editedBy                    user id to edit
 * @apiSuccess {Number}     createdBy                   user id to create
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "id": 45,
        "modelId": 78,
        "mtd": 0.026,
        "qtd": 0,
        "ytd": 0,
        "oneYear": -0.018,
        "threeYear": 0,
        "fiveYear": 0,
        "tenYear": -0.0671,
        "inception": 0,
        "isDeleted": 0,
        "asOnDate": "11/10/2016",
        "createdDate": "2016-11-17T07:28:07.000Z",
        "createdBy": "primetgi",
        "editedDate": "2016-11-17T07:28:07.000Z",
        "editedBy": "primetgi"
        }
 *
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 
 *     {
        "message": "Model does not exists."
       }
 *
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/models/:modelId/performance', validate({
    body: postPerformanceModelSchema
}), function (req, res) {
    logger.info("add performace model request received.");
    modelService.addPerformance(req, function (err, status, data) {
        return response(err, status, data, res);
    });
});

var putPerformanceModelSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'number',
            required: true
        },
        asOnDate: {
            type: 'string',
            required: true
        },
        mtd: {
            type: 'number',
            required: true
        },
        qtd: {
            type: 'number',
            required: true
        },
        ytd: {
            type: 'number',
            required: true
        },
        oneYear: {
            type: 'number',
            required: true
        },
        threeYear: {
            type: 'number',
            required: true
        },
        fiveYear: {
            type: 'number',
            required: true
        },
        tenYear: {
            type: 'number',
            required: true
        },
        inception: {
            type: 'number',
            required: true
        }
    }
};

/**@api {put} /models/:id/performance  Update model performance
 * @apiName Update performance
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API Update model performance of a particular strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/72/performance
 * 
 * @apiParam (PathParam)  {Number}   modelId        Model Id.
 * 
 * @apiParam (Number)     id                          Performance id to edit.
 * @apiParam {Number}     mtd                         MTD value in %
 * @apiParam {Number}     qtd                         QTD value in %
 * @apiParam {Number}     ytd                         YTD value in %
 * @apiParam {Number}     oneYear                     1YR value in %
 * @apiParam {Number}     threeYear                   3YR value in %
 * @apiParam {Number}     fiveYear                    5YR value in %
 * @apiParam {Number}     tenYear                     10YR value in %
 * @apiParam {Number}     inception                   inception value 
 * @apiParam {String}     asOnDate                    AS on date performance value 
 * 
 * @apiParamExample {json} Request-Example:
 *      {
	        "id": 45,
            "mtd": 0.026,
            "qtd": 0,
            "ytd": 0,
            "oneYear": -0.018,
            "threeYear": 0,
            "fiveYear": 0,
            "tenYear": -0.0671,
            "inception": 0,
            "asOnDate": "1/10/2016"
	
        }
 * 
 * 
 * @apiSuccess {Number}     id                          Performance Id
 * @apiSuccess {Number}     modelId                     Model Id
 * @apiSuccess {Number}     mtd                         MTD value in %
 * @apiSuccess {Number}     qtd                         QTD value in %
 * @apiSuccess {Number}     ytd                         YTD value in %
 * @apiSuccess {Number}     oneYear                     1YR value in %
 * @apiSuccess {Number}     threeYear                   3YR value in %
 * @apiSuccess {Number}     fiveYear                    5YR value in %
 * @apiSuccess {Number}     tenYear                     10YR value in %
 * @apiSuccess {Number}     inception                   inception value 
 * @apiSuccess {String}     createdDate                 created date 
 * @apiSuccess {String}     editedDate                  Last edited date
 * @apiSuccess {Number}     editedBy                    user id to edit
 * @apiSuccess {Number}     createdBy                   user id to create
 * 

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * {
        "id": 45,
        "modelId": 78,
        "mtd": 0.026,
        "qtd": 0,
        "ytd": 0,
        "oneYear": -0.018,
        "threeYear": 0,
        "fiveYear": 0,
        "tenYear": -0.0671,
        "inception": 0,
        "isDeleted": 0,
        "asOnDate": "1/10/2016",
        "createdDate": "2016-11-17T07:28:07.000Z",
        "createdBy": "primetgi",
        "editedDate": "2016-11-17T07:30:29.000Z",
        "editedBy": "primetgi"
    }
 *
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
        "message": ""Model or Performance for specified Model does not exists.""
       }
 *

 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.put('/models/:modelId/performance', validate({
    body: putPerformanceModelSchema
}), function (req, res) {
    logger.info("update performance model request received.");

    modelService.updatePerformance(req, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {delete} /models/:id/performance/:performanceId  Delete model performance
 * @apiName Delete performance
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API Delete model performance of a particular strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/79/performance/22
 * 
 * @apiParam (PathParam)  {Number}   modelId              Model Id.
 * @apiParam (PathParam)  {Number}   performanceId        Performance Id.
 * 
 * @apiSuccess {String}     message                 Success/Failure message.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "message": "Model performance successfully deleted."
        }
 *       
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
        "message": "Model or Performance for specified Model does not exists."
       }
 *

 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.delete('/models/:modelId/performance/:performanceId', function (req, res) {
    logger.info("delete performance model request received.");

    modelService.deletePerformance(req, function (err, statusCode, data) {
        return response(err, statusCode, data, res);
    });
});


/**@api {get} /models/:id/advertisement  Get model advertisement
 * @apiName Get Advertisement
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API retrives model advertisement of a particular strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/19/advertisement
 * 
 * @apiParam (PathParam)  {Number}   modelId        Model Id.
 * 
 * @apiSuccess {Number}     modelId                    Model Id
 * @apiSuccess {String}     modelName                  Model name
 * @apiSuccess {String}     advertisement              Advertisement content.
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "modelId": 1,
            "modelName": "model1",
            "advertisement": "This is a test message."
       }
 *
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
        "message": "Model does not exists."
       }
 *

 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/models/:modelId/advertisement', function (req, res) {
    modelService.getAdvertisement(req, function (err, statusCode, data) {
        return response(err, statusCode, data, res);
    });
});


var postAdvertisementModelSchema = {
    type: 'object',
    properties: {
        advertisement: {
                 type: 'string',
                 required: true
        }
    }
};

/**@api {post} /models/:id/advertisement  Add model advertisement
 * @apiName Add advertisement
 * @apiVersion 1.0.0
 * @apiGroup Community-Model-Marketing
 * @apiPermission appstrategist
 *
 * @apiDescription This API adds model advertisement of a particular strategist. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/models/72/advertisement
 * 
 * @apiParam (PathParam)  {Number}   modelId          Model Id.
 * @apiParam (Body)       {JSON}     advertisement    Commentary Content.
 * @apiParam (Body)       {Number}     modelId        Model Id.
 * @apiParam (Body)       {String}     modelName      Model Name.  
 * 
 * 
 * @apiSuccess {String}     message                 Success/Failure message.
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "modelId": 79,
            "modelName": "model2",
            "advertisement": "This is a test."
       }
 *
 * @apiError ModelNotFound The id of the model was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
        "message": "Model does not exists."
       }
 *
 * @apiError Unprocessable_Entity When without request data.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 UNPROCESSABLE ENTITY
 *    {
        "message": "Model advertisement already exists."
        }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/models/:modelId/advertisement',validate({body: postAdvertisementModelSchema}), function (req, res) {
    modelService.addAdvertisement(req, function (err, statusCode, data) {
        return response(err, statusCode, data, res);
    });
});

var postSubscribeStrategistSchema = {
    type: 'object',
    properties: {
        isSubscribe: {
                 type: 'boolean',
                 required: true
        }
    }
};


/**@api {post}/:id/subscribe  subscribe/unsubscribe Strategist
 * @apiName Subscribe/unsubscribe Strategist
 * @apiVersion 1.0.0
 * @apiGroup Eclipse-Integeration
 * @apiPermission appstrategist
 *
 * @apiDescription This API subscribe/unsubscribe particular strategist and there models. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 *  @apiParamExample {json} Request-Example:
 *   {
 *       "isSubscribe" : true/false
 *   }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/2/subscribe 
 * 
 * 
 * @apiSuccess {String}     message                 Success/Failure message.
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     on unsubscibe successfully
 *      {
            "message": "Strategist is unsubscribe Successfully"
        }
        on subscribe successfully
        {
            "id": 221,
            "name": "Wissink Jonathan13",
            "communityStrategistId": 13,
            "isDeleted": 0,
            "createdOn": "2016-11-11T14:43:58.000Z",
            "createdBy": 66,
            "editedOn": "2016-11-11T14:44:01.000Z",
            "editedBy": 66,
            "firmId": 3,
            "smallLogo": "https://paxorions3.s3.amazonaws.com/dev/user13/logo/2016-11-09T14%3A05%3A56%2B05%3A30/images.png?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1478911441&Signature=JwtKiNkKQby6z5%2F0ysSsdJ0AwN4%3D",
            "largeLogo": "https://paxorions3.s3.amazonaws.com/dev/13/logo/large/2016-10-14T13%3A38%3A34%2B00%3A00/Chrysanthemum.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1478911441&Signature=AWjFhiV2dR%2FgXJCGX1LMpdil4ms%3D",
            "models": []
        }
 *
 * @apiError StrategistNotFound The id of the strategist` was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
        "message": "Strategist does not exists."
       }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post("/:id/subscribe",validate({body: postSubscribeStrategistSchema}), privilegeValidator, function (req, res) {
    logger.debug('subscribe/unsubscribe strategist request received');
    var data = req.data;
    data.id = req.params.id;
    if(data.isSubscribe == true){
        logger.debug('subscibe strategist request');
        strategistService.subscribeStrategist(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }else{
        logger.debug('unsubscibe strategist request');
        strategistService.unsubscribeStrategist(data, function (err, status, data){
            return response(err, status, data, res);
        });
    };
});

/**@apiIgnore @api {post}/eclipse/users/roles  Get Eclispse User Role
 * @apiName Get Eclispse User Role
 * @apiVersion 1.0.0
 * @apiGroup Eclipse-Integeration
 * @apiPermission appstrategist
 *
 * @apiDescription This API returns the eclipse user role. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/eclispse/users/roles 
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 *         {
            "roleTypeId": 1,
            "roleType": "FIRM ADMIN",
            "firmId": 3
        }
 *
 * @apiError UserNOtFound The id of the user was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
        "message": "User does not exists."
       }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get("/eclipse/users/roles", function (req, res) {
    logger.debug('eclispse users roles request received');
    utilService.getEclipseUserRoles(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

// app.delete("/:id/unsubscribe", function (req, res){
//     logger.debug('unsubscribe strategist request received()');
//     var data = req.data;
//     data.id = req.params.id;
//     strategistService.unsubscribeStrategist(data, function (err, status, data){
//         return response(err, status, data, res);
//     });
// });

app.get('/models/:modelId/eclipse', function (req, res) {
    logger.info("Get community model request received");
    var data = req.data;
    data.modelId = req.params.modelId;
    modelService.getModelDetailForEclipseUser(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {get} /community/strategists/profile/subscribe Get All Strategist With Subscribed Details 
 * @apiName GetAllStrategistWithSubscribedDetails
 * @apiVersion 1.0.0
 * @apiGroup  Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets strategist list with subsribed details. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/profile/subscribe
 * 
 * @apiSuccess {String}     id                      The Strategist user Id.
 * @apiSuccess {Name}       name                    Fullname of the Strategist User.
 * @apiSuccess {Number}     isDeleted               Strategist user exist or not into the system.
 * @apiSuccess {Date}       createdOn               Strategist user creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the Strategist user into the system.
 * @apiSuccess {Date}       editedOn                Strategist user edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Strategist user details into the system.
 * @apiSuccess {Number}     status                  Strategist user status - Active/Inactive.
 * @apiSuccess {String}     statusLabel             Strategist user status label - Active/Inactive.
 * @apiSuccess {String}     salesEmail              Strategist user email id.
 * @apiSuccess {String}     salesContact            Strategist user contact detail.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {String}     legalAgreement          Agreement detail of strategist user.
 * @apiSuccess {String}     strategyCommentary      Strategy Commentary detail of strategist user.
 * @apiSuccess {String}     advertisementMessage    Strategist advertisement message
 * @apiSuccess {String}     supportEmail            Support Email  of strategist user.
 * @apiSuccess {String}     supportContact          Support contact detail of strategist user.
 * @apiSuccess {String}     salesPhone              Strategist user phone number.
 * @apiSuccess {Number}     isSubscribed            Strategist is subscibed or not.
 * @apiSuccess {Date}       subscibedOn             Date when strategist is subscibed.
 * @apiSuccess {Number}     userCount               Count of users associated to Strategist.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "id": 53,
 *       "name": "hello Strategist",
 *       "status": 1,
 *       "statusLabel": "Approved",
 *       "salesContact": null,
 *       "salesPhone": null,
 *       "legalAgreement": null,
 *       "salesEmail": null,
 *       "supportEmail": null,
 *       "supportContact": null,
 *       "supportPhone": null,
 *       "strategyCommentary": null,
 *       "advertisementMessage": null,
 *       "userCount": 1,
 *       "modelCount" : 1,
 *       "isDeleted": 0,
 *       "isSubscribed": 1,
 *       "subscibedOn" : "2016-11-09T15:09:34.000Z",
 *       "createdOn": "2016-09-08T06:37:13.000Z",
 *       "createdBy": "Test Userlogin Id ",
 *       "editedOn": "2016-09-08T06:37:13.000Z",
 *       "editedBy": "Test Userlogin Id ",
 *       "path": "test/44/logo/small/2016-11-23T14:28:04+05:30/logo.jpg",
 *       "url": "https://paxorions3.s3.amazonaws.com/test/44/logo/small/2016-11-23T14%3A28%3A04%2B05%3A30/logo.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1479927882&Signature=bxqsPF0oe5YlS7saeolH8N3p2P4%3D"
 *     ]}
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 **/
app.get('/profile/subscribe', privilegeValidator ,function (req, res) {
    logger.info("Get all strategist with subscription request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }
    strategistService.getStrategistListWithSubscribed(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {put} /community/strategists/:strategistId/verify/legalAgreement To Store Or Update Acceptance time of legal Agreement 
 * @apiName VerifyLegalAgreementAcceptance
 * @apiVersion 1.0.0
 * @apiGroup  Community-Strategist
 * @apiPermission appstrategist
 *
 * @apiDescription This API store or update the legalAgreement timestamp. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/13/verify/legalAgreement
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "isAccepted": 1
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
app.put('/:strategistId/verify/legalAgreement', function (req, res) {
    logger.info("Update timeStamp of accceptance request received");
    var data = req.data;
    data.id = req.params.strategistId;
    strategistService.verifyLegalAgreement(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@api {get} /model/action/rebalance/:id Rebalance model
 * @apiName Rebalance model
 * @apiVersion 1.0.0
 * @apiGroup  Rebalancer
 * @apiPermission appstrategist
 *
 * @apiDescription This API rebalance the model on firms. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/strategists/model/action/rebalance/3
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 **/
app.get('/model/action/rebalance/:id', privilegeValidator, function (req, res) {
    logger.info("rebalance model request received");
    var data = req.data;
    data.modelId = req.params.id;
    rebalanceService.rebalanceModel(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


// //for test purpose
// app.post('/test/udpate/model/ETL', function (req, res){
//     logger.debug('test/udpate/model/ETL');
//     var data = req.data;
//     data.modelId = 3;
//     var firmId = [3];
//     modelService.runModelUpdateJob(data, firmId, function(err,status,data){
//         return response(err, status, data, res);
//     });
// });

module.exports = app;