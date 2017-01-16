"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');
var util = require('util');
var response = require('controller/ResponseController.js');

var AccountRequest = require("model/account/AccountRequest.js");
var AsideRequest = require("model/account/AsideRequest.js");
var ReplenishRequest = require("model/account/ReplenishRequest.js");
var AccountService = require('service/account/AccountService.js');
var SMAService = require('service/account/SMAService.js');
var AccountConverter = require("converter/account/AccountConverter.js");

var accountService = new AccountService();
var accountConverter = new AccountConverter();
var HoldingService = require('service/holding/HoldingService.js');
var holdingService = new HoldingService();

var logger = helper.logger(moduleName);
var validate = helper.validate;
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js").getDifferentAccessForUser;
var analysisMiddleware = require('middleware/AnalysisMiddleware.js')

var accountIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}


var putIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        },
        asidecashId: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
};

var postIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
};

var postAsideCashSchema = {
    type: 'object',
    properties: {
        cashAmountTypeId: {
            type: 'number',
            required: true
        },
        cashAmount: {
            type: 'number',
            required: true
        },
        expirationTypeId: {
            type: 'number',
            required: true
        },
        // expirationValue: {
        //     type: 'string',
        //     required: false
        // },
        // toleranceValue: {
        //     type: 'number',
        //     required: false
        // }
    }
};

var putAsideCashSchema = {
    type: 'object',
    properties: {
        cashAmountTypeId: {
            type: 'number',
            required: false
        },
        cashAmount: {
            type: 'number',
            required: false
        },
        expirationTypeId: {
            type: 'number',
            required: false
        },
        // expirationValue: {
        //     type: 'string',
        //     required: false
        // },
        // toleranceValue: {
        //     type: 'number',
        //     required: false
        // },
        description: {
            type: 'string',
            required: false
        },
    }
};

var putSmaSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'number',
            is: 'numeric',
            required: true
        },
        subModelId: {
            type: 'number',
            is: 'numeric',
            required: true
        },
        weightPercent: {
            type: 'number',
            is: 'numeric',
            required: true
        }
    }
};
var paramSmaSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
};


var smaBodySchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
        },
        subModelId: {
            type: 'number',
        },
        weightPercent: {
            type: 'number',
        },
        modelId: {
            type: 'number',
        },
        modelDetailId: {
            type: 'number',
        },
        levelId: {
            type: 'number',
        }

    }
};


/**
@api {get} /account/accounts/asideCashAmountType  Get aside Cash Amount Type
* @apiName GetAsideCashAmountType
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get aside cash amount type.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/asideCashAmountType

* @apiSuccess {String}     id                      The asideCashAmountType Id.
* @apiSuccess {String}     name                    Aside Cash Amount Type name
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
     [
      {
        "id": 1,
        "name": "$"
      },
      {
        "id": 2,
        "name": "%"
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


app.get('/asideCashAmountType', function (req, res) {
    logger.info("Get asideCashAmountType request received");

    var data = req.data;
    data.asideCashAmountType = 'asideCashAmountType';
    accountService.getAsideType(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /account/accounts/asideCashExpirationType  Get aside Cash Expiration Type
* @apiName GetAsideCashExpirationType
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get aside cash expiration type.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/asideCashExpirationType

* @apiSuccess {String}     id                      The asideCashExpirationType Id.
* @apiSuccess {String}     name                    Aside Cash Expiration Type name
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
   [
        {
            "id": 1,
            "name": "Date"
        },
        {
            "id": 2,
            "name": "Transaction"
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


app.get('/asideCashExpirationType', function (req, res) {
    logger.info("Get asideCashExpirationType request received");

    var data = req.data;
    data.asideCashExpirationType = 'asideCashExpirationType';
    accountService.getAsideType(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /account/accounts/asideCashTransactionType  Get aside Cash Transaction Type
* @apiName GetAsideCashTransactionType
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get aside cash expiration type.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/asideCashTransactionType

* @apiSuccess {String}     id                      The asideCashTransactionType Id.
* @apiSuccess {String}     name                    Aside Cash Transaction Type name
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
    [
        {
            "id": 1,
            "name": "Distribution"
        },
        {
            "id": 2,
            "name": "Merge Out"
        },
        {
            "id": 3,
            "name": "Fee"
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


app.get('/asideCashTransactionType', function (req, res) {
    logger.info("Get asideCashTransactionType request received");

    var data = req.data;
    data.asideCashTransactionType = 'asideCashTransactionType';
    accountService.getAsideType(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /account/accounts/:id/asidecash  Get all aside list
* @apiName GetAllAsideList
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get aside all aside list.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/1/asidecash

* @apiSuccess {Number}     id                      The Aside Id.
* @apiSuccess {String}     description             The aside description.
* @apiSuccess {Number}     cashAmountTypeId        Aside cashAmountTypeId
* @apiSuccess {String}     cashAmountTypeName      Aside cashAmountTypeName
* @apiSuccess {Number}     cashAmount              Aside cashAmount
* @apiSuccess {Number}     expirationTypeId        Aside expirationTypeId
* @apiSuccess {String}     expirationTypeName      Aside expirationTypeName
* @apiSuccess {String}     expirationValue         Aside Date or TransactionTypeName
* @apiSuccess {Number}     toleranceValue          Aside toleranceValue
* @apiSuccess {Date}       expiredOn               Aside expiredOn
* @apiSuccess {Boolean}    isExpired               Aside isExpired
* @apiSuccess {Boolean}    isDeleted               Aside exist or not into the system.
* @apiSuccess {Date}       createdOn               Aside creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Aside into the system.
* @apiSuccess {Date}       editedOn                Aside edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Aside details into the system.
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
   [
     {
        "id": 1,
        "description": null,
        "cashAmountTypeId": 1,
        "cashAmountTypeName": "Dollar",
        "cashAmount": 900,
        "expirationTypeId": 1,
        "expirationTypeName": "Date",
        "expirationValue": null,
        "toleranceValue": 86,
        "expiredOn": "2016-11-02T07:21:51.000Z",
        "isExpired": true,
        "isDeleted": 0,
        "createdOn": "2016-10-24T10:15:13.000Z",
        "createdBy": "prime@tgi.com",
        "editedOn": "2016-10-25T05:29:24.000Z",
        "editedBy": "prime@tgi.com"
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


app.get('/:id/asidecash', validate({ params: postIdSchema }), function (req, res) {
    logger.info("Get All Aside List request received");

    var data = req.data;
    data.accountId = req.params.id;
    accountService.getAllAsideList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /account/accounts/:id/asidecash/:asidecashId  Get aside details
* @apiName GetAsideDetails
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get aside details.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/1/asidecash/41

* @apiSuccess {Number}     id                      The Aside Id.
* @apiSuccess {Number}     accountId               The account Id.
* @apiSuccess {String}     description             The Aside description.
* @apiSuccess {Number}     cashAmountTypeId        Aside cashAmountTypeId
* @apiSuccess {Number}     cashAmount              Aside cashAmount
* @apiSuccess {Number}     expirationTypeId        Aside expirationTypeId
* @apiSuccess {String}     expirationValue         Aside Date or TransactionTypeName
* @apiSuccess {String}     toleranceValue          Aside toleranceValue
* @apiSuccess {Boolean}    isExpired               Aside isExpired
* @apiSuccess {Boolean}    isDeleted               Aside exist or not into the system.
* @apiSuccess {Date}       createdOn               Aside creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Aside into the system.
* @apiSuccess {Date}       editedOn                Aside edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Aside details into the system.
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
    {
        "id": 41,
        "accountId": 1,
        "description": "null",
        "cashAmountTypeId": 1,
        "cashAmount": 1900,
        "expirationTypeId": 1,
        "expirationValue": "2016-11-02T11:18:35.000Z",
        "toleranceValue": null,
        "isExpired": false,
        "isDeleted": 0,
        "createdOn": "2016-11-02T11:18:35.000Z",
        "createdBy": "prime@tgi.com",
        "editedOn": "2016-10-25T05:29:24.000Z",
        "editedBy": "prime@tgi.com"
    }
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/


app.get('/:id/asidecash/:asidecashId', validate({ params: putIdSchema }), function (req, res) {
    logger.info("Get Aside Details request received");

    var data = req.data;
    data.accountId = req.params.id;
    data.id = req.params.asidecashId;
    accountService.getAsideDetails(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {post} /account/accounts/:id/asidecash  Add aside
* @apiName AddAside
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to add aside.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/1/asidecash

 * @apiParam {Number}       cashAmountTypeId           The aside cashAmountTypeId.
 * @apiParam {Number}       cashAmount                 The aside cashAmount.
 * @apiParam {Number}       expirationTypeId           The aside expirationTypeId.
 * @apiParam {String}       expirationValue            The aside expirationValue.
 * @apiParam {Number}       toleranceValue             The aside toleranceValue.
 * @apiParam {String}       description                The aside description.
 * @apiParamExample {json} Request-Example:
 *   {
        "cashAmountTypeId":1,
        "cashAmount":900,
        "expirationTypeId":1,
        "expirationValue":"02/22/2015",
        "toleranceValue":87,
        "description":"Aside Cash"
    }
* @apiSuccess {Number}     id                      The Aside Id.
* @apiSuccess {String}     accountId               The account Id.
* @apiSuccess {String}     description             The aside description.
* @apiSuccess {Number}     cashAmountTypeId        Aside cashAmountTypeId
* @apiSuccess {Number}     cashAmount              Aside cashAmount
* @apiSuccess {Number}     expirationTypeId        Aside expirationTypeId
* @apiSuccess {String}     expirationValue         Aside Date or TransactionTypeName
* @apiSuccess {String}     toleranceValue          Aside toleranceValue
* @apiSuccess {Boolean}    isExpired               Aside isExpired
* @apiSuccess {Date}       createdOn               Aside creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Aside into the system.
* @apiSuccess {Date}       editedOn                Aside edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Aside details into the system.
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 201 OK
    {
        "id": 41,
        "accountId": 1,
        "description": "null",
        "cashAmountTypeId": 1,
        "cashAmount": 1900,
        "expirationTypeId": 1,
        "expirationValue": "2016-11-02T11:18:35.000Z",
        "toleranceValue": null,
        "isExpired": false,
        "isDeleted": 0,
        "createdOn": "2016-11-02T11:18:35.000Z",
        "createdBy": "prime@tgi.com",
        "editedOn": "2016-10-25T05:29:24.000Z",
        "editedBy": "prime@tgi.com"
    }
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/


app.post('/:id/asidecash', validate({ params: postIdSchema, body: postAsideCashSchema }), analysisMiddleware.post_import_analysis, function (req, res) {
    logger.info("Add Aside Details request received");

    var data = req.data;
    data.accountId = req.params.id;
    data = new AsideRequest(data);
    accountService.addAsideDetails(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {put} /account/accounts/:id/asidecash/:asidecashId  Update aside
* @apiName UpdateAside
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to update aside.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/1/asidecash/41

 * @apiParam {Number}       cashAmountTypeId           The aside cashAmountTypeId.
 * @apiParam {Number}       cashAmount                 The aside cashAmount.
 * @apiParam {Number}       expirationTypeId           The aside expirationTypeId.
 * @apiParam {String}       expirationValue            The aside expirationValue.
 * @apiParam {Number}       toleranceValue             The aside toleranceValue.
 * @apiParam {String}       description                The aside description.
 * @apiParamExample {json} Request-Example:
 *   {
        "cashAmountTypeId":1,
        "cashAmount":900,
        "expirationTypeId":1,
        "expirationValue":"02/22/2015",
        "toleranceValue":87,
        "description":"Aside Cash"
    }
* @apiSuccess {Number}     id                      The Aside Id.
* @apiSuccess {Number}     accountId               The account Id.
* @apiSuccess {String}     description             The aside description.
* @apiSuccess {Number}     cashAmountTypeId        Aside cashAmountTypeId
* @apiSuccess {Number}     cashAmount              Aside cashAmount
* @apiSuccess {Number}     expirationTypeId        Aside expirationTypeId
* @apiSuccess {String}     expirationValue         Aside Date or TransactionTypeName
* @apiSuccess {String}     toleranceValue          Aside toleranceValue
* @apiSuccess {Boolean}    isExpired               Aside isExpired
* @apiSuccess {Boolean}    isDeleted               Aside exist or not into the system.
* @apiSuccess {Date}       createdOn               Aside creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Aside into the system.
* @apiSuccess {Date}       editedOn                Aside edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Aside details into the system.
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 201 OK
    {
        "id": 41,
        "accountId": 1,
        "description": "null",
        "cashAmountTypeId": 1,
        "cashAmount": 1900,
        "expirationTypeId": 1,
        "expirationValue": "2016-11-02T11:18:35.000Z",
        "toleranceValue": null,
        "isExpired": false,
        "isDeleted": 0,
        "createdOn": "2016-11-02T11:18:35.000Z",
        "createdBy": "prime@tgi.com",
        "editedOn": "2016-10-25T05:29:24.000Z",
        "editedBy": "prime@tgi.com"
    }
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/
app.put('/:id/asidecash/:asidecashId', validate({ params: putIdSchema, body: putAsideCashSchema }), analysisMiddleware.post_import_analysis, function (req, res) {
    logger.info("Update Aside Details request received");

    var data = req.data;
    data.accountId = req.params.id;
    data.id = req.params.asidecashId;
    data = new AsideRequest(data);
    accountService.updateAsideDetails(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {delete} /account/accounts/:id/asidecash/:asidecashId  Delete aside
* @apiName DeleteAside
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to delete aside.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/1/asidecash/32

 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Set aside cash deleted successfully"
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
app.delete('/:id/asidecash/:asidecashId', validate({ params: putIdSchema, body: putAsideCashSchema }), analysisMiddleware.post_import_analysis, function (req, res) {
    logger.info("Update Aside Details request received");

    var data = req.data;
    data.accountId = req.params.id;
    data.id = req.params.asidecashId;
    accountService.deleteAsideDetails(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /account/accounts/:id/model/modelTypes Get account model Type
* @apiName GetAccountModelType
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get account model Type.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/1/model/modelTypes
* @apiSuccess {Number}     id                 Model level Id.
* @apiSuccess {String}     name               Model level name.
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
    [
        {
            "id": 1,
            "name": "Category"
        },
        {
            "id": 2,
            "name": "Class"
        },
        {
            "id": 3,
            "name": "Sub Class"
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

app.get('/:id/model/modelTypes', validate({ params: postIdSchema }), function (req, res) {
    logger.info("Get Model Level Type request received");

    var data = req.data;
    data.accountId = req.params.id;
    accountService.getModelLevelType(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /account/accounts/:id/model/submodels?modelTypeId={id} Get SubNodes for model
* @apiName GetSubNodesFor/Model
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get subnodes for model.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/1/model/submodels?modelTypeId=1

* @apiSuccess {Number}     id                 Model node id.
* @apiSuccess {String}     name               Model node name.
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*  [
*  {
*    "subModelId": 343681,
*    "subModelName": "Test dMdoSdel 13",
*    "modelId": 604,
*    "modelDetailId": 1945
*  },
*  {
*    "subModelId": 343679,
*    "subModelName": "Test Mdoddel 13",
*    "modelId": 604,
*    "modelDetailId": 1943
*  }
*]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/

app.get('/:id/model/submodels', validate({ params: postIdSchema }), function (req, res) {
    logger.info("Get Model Node Type request received");

    var data = req.data;
    data.accountId = req.params.id;
    data.modelTypeId = req.query.modelTypeId;
    if (data.modelTypeId === '1') {
        data.relatedType = 'CATEGORY';
    }
    if (data.modelTypeId === '2') {
        data.relatedType = 'CLASS';
    }
    if (data.modelTypeId === '3') {
        data.relatedType = 'SUBCLASS';
    }
    accountService.getModelNode(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
* 
* @api {get} /account/accounts/:id/action/getReplenish Get replenish status
* @apiName GetReplenishStatus
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get replenish status.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/:id/action/getReplenish

* @apiSuccess {Boolean}     isReplenish               Replenish value
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
       {
         "isReplenish": true
       }
       
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/

app.get('/:id/action/getReplenish', validate({ params: postIdSchema }), function (req, res) {
    logger.info("Get Model Level Type request received");

    var data = req.data;
    data.accountId = req.params.id;
    accountService.getReplenish(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {put} /account/accounts/:id/action/setreplenish?value={false/true} Set Replenish
* @apiName SetReplenish
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to set replenish.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/:id/action/setreplenish?value=true

* @apiSuccess {Boolean}     isReplenish               Set Replenish value
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
       {
         "isReplenish": true
       }
       
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/

app.put('/:id/action/setreplenish', validate({ params: postIdSchema }), analysisMiddleware.post_import_analysis, function (req, res) {
    logger.info("Set Replenish request received");

    var data = req.data;
    data.accountId = req.params.id;
    data.isReplenish = req.query.value;
    data = new ReplenishRequest(data);
    accountService.setReplenish(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /account/accounts/simple?search={id/accountName/accountNumber/portfolioName} Search Account (Simple)
 * @apiName SearchSimpleAccount
 * @apiVersion 1.0.0
 * @apiGroup Account 
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to search of Account according to accountName or accountNumber   
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/account/accounts/simple?search=demo

 * @apiSuccess {Number}     id                      System Genarated Id.
 * @apiSuccess {String}     name                    Account Name.
 * @apiSuccess {String}     acccountId              Account Id.
 * @apiSuccess {String}     accountNumber           Account Numder.
 * @apiSuccess {String}     accountType             Account Type.
 * @apiSuccess {Boolean}    isDeleted               Account exist or not into the system.
 * @apiSuccess {Date}       createdOn               Account creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
 * @apiSuccess {Date}       editedOn                Account edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *   [ {
 *     "id": 4,
 *     "name": "Test Account",
 *     "accountId": "1020_46",
 *     "accountNumber": "123654",
 *     "accountType": "IND",
 *     "isDeleted": 0,
 *     "portfolioName":"demo"
 *     "createdOn": "2016-08-11T06:32:32.000Z",
 *     "createdBy": "test@gmail.com",,
 *     "editedOn":  "2016-08-11T07:24:15.000Z",
 *     "editedBy":  "test1@gmail.com",
 *     }]
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
/**
* @api {get} /account/accounts/simple Get All Accounts (Simple)
* @apiName GetAllSimpleAccount
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get all account list. 
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/simple

* @apiSuccess {Number}     id                      System Genarated Id.
* @apiSuccess {String}     name                    Account Name.
* @apiSuccess {String}     acccountId              Account Id.
* @apiSuccess {String}     accountNumber           Account Numder.
* @apiSuccess {String}     accountType             Account type detail.
* @apiSuccess {Boolean}    isDeleted               Account exist or not into the system.
* @apiSuccess {Date}       createdOn               Account creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
* @apiSuccess {Date}       editedOn                Account edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*    [{
*     "id": 4,
*     "name": "Test Account",
*     "accountId": "1020_46",
*     "accountNumber": "123654",
*     "accountType": "IND",
*     "isDeleted": 0,
*     "createdOn": "2016-08-11T06:32:32.000Z",
*     "createdBy": "test@gmail.com",,
*     "editedOn":  "2016-08-11T07:24:15.000Z",
*     "editedBy":  "test1@gmail.com",
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


/**
 * @api {get} /account/accounts/simple?includevalue=true&search={id/accountName} Get & Search Account With Holding Value
 * @apiName SearchAccountWithHoldingValue
 * @apiVersion 1.0.0
 * @apiGroup Account
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to search of account according to id and accountName    
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/account/accounts/simple?includevalue=true
 * curl -i http://baseurl/v1/account/accounts/simple?includevalue=true&search=1
 * curl -i http://baseurl/v1/account/accounts/simple?includevalue=true&inModel=true&search=1

 * @apiSuccess {Number}     id                      System Generated Id.
 * @apiSuccess {String}     name                    Account Name.
 * @apiSuccess {String}     accountNumber           Account Number.
 * @apiSuccess {String}     accountType             Account Type.
 * @apiSuccess {Number}     value                   Holding value associated with this accountId
 * @apiSuccess {Boolean}    isDeleted               Account exist or not into the system.
 * @apiSuccess {Date}       createdOn               Account creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
 * @apiSuccess {Date}       editedOn                Account edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  [{
 *     "id": 4,
 *     "name": "Test Account",
 *     "accountNumber": "123654",
 *     "accountType": "IND",
 *     "value": 38500,
 *     "isDeleted": 0,
 *     "createdOn": "2016-08-11T06:32:32.000Z",
 *     "createdBy": "test@gmail.com",,
 *     "editedOn":  "2016-08-11T07:24:15.000Z",
 *     "editedBy":  "test1@gmail.com",
 *     }]
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


/**
 * @api {get} /account/accounts/simple?inSleeve=true&search={id/accountName} Search Simple Account in Sleeve Case 
 * @apiName SearchAccountInSleeveWithHoldingValue
 * @apiVersion 1.0.0
 * @apiGroup Account
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to search of account according to id and accountName    
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/account/accounts/simple?inSleeve=true&search=1
 * curl -i http://baseurl/v1/account/accounts/simple?inSleeve=true&inModel=true&search=1

 * @apiSuccess {Number}     id                      System Generated Id.
 * @apiSuccess {String}     name                    Account Name.
 * @apiSuccess {String}     accountNumber           Account Number.
 * @apiSuccess {String}     accountType             Account Type.
 * @apiSuccess {Boolean}    isDeleted               Account exist or not into the system.
 * @apiSuccess {Date}       createdOn               Account creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
 * @apiSuccess {Date}       editedOn                Account edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [{
 *     "id": 4,
 *     "name": "Test Account",
 *     "accountNumber": "123654",
 *     "accountType": "IND",
 *     "isDeleted": 0,
 *     "createdOn": "2016-08-11T06:32:32.000Z",
 *     "createdBy": "test@gmail.com",,
 *     "editedOn":  "2016-08-11T07:24:15.000Z",
 *     "editedBy":  "test1@gmail.com",
 *     }]
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


/**
 * @api {get} /account/accounts/simple?inModel=true&search={id/accountName} Search Simple Account in Model  
 * @apiName SearchAccountInModel
 * @apiVersion 1.0.0
 * @apiGroup Account
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to search of account according to id and accountName    
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
  * curl -i http://baseurl/v1/account/accounts/simple?inModel=true&search=1

 * @apiSuccess {Number}     id                      System Generated Id.
 * @apiSuccess {String}     name                    Account Name.
 * @apiSuccess {String}     accountNumber           Account Number.
 * @apiSuccess {String}     accountType             Account Type.
 * @apiSuccess {Boolean}    isDeleted               Account exist or not into the system.
 * @apiSuccess {Date}       createdOn               Account creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
 * @apiSuccess {Date}       editedOn                Account edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [{
 *     "id": 4,
 *     "name": "Test Account",
 *     "accountNumber": "123654",
 *     "accountType": "IND",
 *     "isDeleted": 0,
 *     "createdOn": "2016-08-11T06:32:32.000Z",
 *     "createdBy": "test@gmail.com",,
 *     "editedOn":  "2016-08-11T07:24:15.000Z",
 *     "editedBy":  "test1@gmail.com",
 *     }]
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

app.get('/simple', UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get all simple account request received");

    var data = req.data;
    if (req.query.includevalue === 'true' || (req.query.includevalue === 'true' && req.query.search) || (req.query.includevalue === 'true' && data.inModel)) {

        data.includevalue = req.query.includevalue;
        accountService.getSimpleAccountList(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }
    else if (req.query.inSleeve === 'true' || (req.query.inSleeve === 'true' && req.query.search) || (data.inSleeve && data.inModel)) {

        data.inSleeve = req.query.inSleeve;

        accountService.getSimpleAccountList(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }

    else if (req.query.inModel === 'true' || (req.query.inModel === 'true' && req.query.search)) {

        data.inModel = req.query.inModel;

        accountService.getSimpleAccountList(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }
    else if (req.query.search) {

        data.search = req.query.search;
        accountService.getSimpleAccountListwithPortfolioName(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }

    else if (req.query.includevalue) {
        data.includevalue = req.query.includevalue;
        accountService.getSimpleAccountList(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }
    else
        accountService.getSimpleAccountList(data, function (err, status, data) {
            return response(err, status, data, res);
        });
});


/**
** 
@apiIgnore No more in use
@api {get} /account/accounts/simple/:id Get Simple Account Details 
* @apiName GetSimpleAccountDetail
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get perticular simple account detail. 
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/simple/1

* @apiSuccess {Number}     id                      System Genarated Id.
* @apiSuccess {String}     name                    Account Name.
* @apiSuccess {String}     accountId               Account Id.
* @apiSuccess {String}     accountNumber           Account Numder.
* @apiSuccess {String}     accountType             Account type detail.
* @apiSuccess {Boolean}    isDeleted               Account exist or not into the system.
* @apiSuccess {Date}       createdOn               Account creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
* @apiSuccess {Date}       editedOn                Account edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.

*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*    {
*     "id": 4,
*     "name": "Test Account",
*     "accountId": "1020_46",
*     "accountNumber": "123654",
*     "accountType": "IND",
*     "isDeleted": 0,
*     "createdOn": "2016-08-11T06:32:32.000Z",
*     "createdBy": "test@gmail.com",,
*     "editedOn":  "2016-08-11T07:24:15.000Z",
*     "editedBy":  "test1@gmail.com",
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

app.get('/simple/:id', validate({ params: accountIdSchema }), UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get simple account details request received");

    var data = req.data;
    data.id = req.params.id;
    accountService.getSimpleAccountDetail(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
* @api {get}sounts Get All Accounts
* @apiName GetAccountList
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get all account list. 
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts

* @apiSuccess {Number}     id                      System Generated Id.
* @apiSuccess {String}     name                    Account Name.
* @apiSuccess {String}     accountNumber           Account Number.
* @apiSuccess {String}     accountId               Account Id.
* @apiSuccess {String}     accountType             Account Type.
* @apiSuccess {String}     portfolio               Portfolio Name.
* @apiSuccess {String}     custodian               Custodian Name.
* @apiSuccess {Number}     value                   Total value.
* @apiSuccess {Number}     managedValue            Total Managed Value.
* @apiSuccess {Number}     excludedValue           Total Excluded Value.
* @apiSuccess {Number}     pendingValue            Total Pending Value.
* @apiSuccess {String}     ssn                     SSN Value.
* @apiSuccess {String}     style                   Name of the style.
* @apiSuccess {String}     model                   Model Name associated on Account.
* @apiSuccess {String}     sleeveType              Sleeve Type detail.
* @apiSuccess {Number}     distributionAmount      Distribution Amount.
* @apiSuccess {Number}     contributionAmount      Contribution Amount.
* @apiSuccess {Number}     mergeIn                 Account in mergeIn detail.
* @apiSuccess {Number}     mergeOut                Account in mergeOut detail.
* @apiSuccess {Number}     cashNeedAmount          Cash need amount detail.
* @apiSuccess {Number}     cashTarget              Cash target detail.
* @apiSuccess {Number}     targetCashReserve       Target cash reserve detail .
* @apiSuccess {Number}     systematicAmount        Systematic amount detail.
* @apiSuccess {Date}       systematicDate          Systematic Date.
* @apiSuccess {String}     sma                     Single manage account detail.
* @apiSuccess {String}     status                  Status.
* @apiSuccess {String}     reason                  Reason.
* @apiSuccess {String}     pendingTrades           Pending trades detail.
* @apiSuccess {Date}       eclipseCreatedDate      Eclipse created date.
* @apiSuccess {Date}       createdOn               Account creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
* @apiSuccess {Date}       editedOn                Account edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
* [
*  {
*    "id": 1,
*    "accountNumber": "L05C900669",
*    "accountType": "TRU",
*    "accountId": "15",
*    "name": "Kane, Jr.  Fredric ",
*    "portfolio": "Demo Portfolio Kate",
*    "custodian": "Prime",
*    "value": 200120,
*    "managedValue": 578610,
*    "excludedValue": 0,
*    "pendingValue": 61,
*    "ssn": "xxxxxxx1372",
*    "style": "Aggressive",
*    "model": "Community Model 1",
*    "sleeveType": "Custodial",
*    "distributionAmount": 100,
*    "contributionAmount": 200,
*    "mergeIn": 61,
*    "mergeOut": 0,
*    "cashNeedAmount": 300,
*    "cashTarget": 10,
*    "targetCashReserve": "10",
*    "systematicAmount": "10",
*    "systematicDate": "0000-00-00 00:00:00",
*    "sma": "Yes",
*    "status": "Warning",
*    "reason": "Ok",
*    "pendingTrades": "No",
*    "eclipseCreatedDate": "2016-10-15T03:30:00.000Z",
*    "createdOn": "2016-11-02T03:30:00.000Z",
*    "createdBy": "prime@tgi.com",
*    "editedOn": "2016-10-28T09:57:03.000Z",
*    "editedBy": "prime@tgi.com"
*  }
*]
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
* @api {get} /account/accounts?filterId={filterId} Get Account List by Filter Id
* @apiName GetAccountListByFilter
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get all account list by filter Id. 
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts?filterId=1

* @apiSuccess {Number}     id                      System Generated Id.
* @apiSuccess {String}     name                    Account Name.
* @apiSuccess {String}     accountNumber           Account Number.
* @apiSuccess {String}     accountId               Account Id.
* @apiSuccess {String}     accountType             Account Type.
* @apiSuccess {String}     portfolio               Portfolio Name.
* @apiSuccess {String}     custodian               Custodian Name.
* @apiSuccess {Number}     value                   Total value.
* @apiSuccess {Number}     managedValue            Total Managed Value.
* @apiSuccess {Number}     excludedValue           Total Excluded Value.
* @apiSuccess {Number}     pendingValue            Total Pending Value.
* @apiSuccess {String}     ssn                     SSN Value.
* @apiSuccess {String}     style                   Name of the style.
* @apiSuccess {String}     model                   Model Name associated on Account.
* @apiSuccess {String}     sleeveType              Sleeve Type detail.
* @apiSuccess {Number}     distributionAmount      Distribution Amount.
* @apiSuccess {Number}     contributionAmount      Contribution Amount.
* @apiSuccess {Number}     mergeIn                 Account in mergeIn detail.
* @apiSuccess {Number}     mergeOut                Account in mergeOut detail.
* @apiSuccess {Number}     cashNeedAmount          Cash need amount detail.
* @apiSuccess {Number}     cashTarget              Cash target detail.
* @apiSuccess {Number}     targetCashReserve       Target cash reserve detail .
* @apiSuccess {Number}     systematicAmount        Systematic amount detail.
* @apiSuccess {Date}       systematicDate          Systematic Date.
* @apiSuccess {String}     sma                     Single manage account detail.
* @apiSuccess {String}     status                  Status.
* @apiSuccess {String}     reason                  Reason.
* @apiSuccess {String}     pendingTrades           Pending trades detail.
* @apiSuccess {Date}       eclipseCreatedDate      Eclipse created date.
* @apiSuccess {Date}       createdOn               Account creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
* @apiSuccess {Date}       editedOn                Account edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.
*
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
* [
*  {
*    "id": 1,
*    "accountNumber": "L05C900669",
*    "accountType": "TRU",
*    "accountId": "15",
*    "name": "Kane, Jr.  Fredric ",
*    "portfolio": "Demo Portfolio Kate",
*    "custodian": "Prime",
*    "value": 200120,
*    "managedValue": 578610,
*    "excludedValue": 0,
*    "pendingValue": 61,
*    "ssn": "xxxxxxx1372",
*    "style": "Aggressive",
*    "model": "Community Model 1",
*    "sleeveType": "Custodial",
*    "distributionAmount": 100,
*    "contributionAmount": 200,
*    "mergeIn": 61,
*    "mergeOut": 0,
*    "cashNeedAmount": 300,
*    "cashTarget": 10,
*    "targetCashReserve": "10",
*    "systematicAmount": "10",
*    "systematicDate": "0000-00-00 00:00:00",
*    "sma": "Yes",
*    "status": "Warning",
*    "reason": "Ok",
*    "pendingTrades": "No",
*    "eclipseCreatedDate": "2016-10-15T03:30:00.000Z",
*    "createdOn": "2016-11-02T03:30:00.000Z",
*    "createdBy": "prime@tgi.com",
*    "editedOn": "2016-10-28T09:57:03.000Z",
*    "editedBy": "prime@tgi.com"
*  }
*]
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
    logger.info("Get all account request received");

    var data = req.data;
    if (req.query.filterId) {
        data.filterId = req.query.filterId;
    }
    accountService.getAccountList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
@api {get} /account/accounts/new  Get New Account List 
* @apiName GetNewAccountList
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get new account list.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/new

* @apiSuccess {Number}     id                      System Genarated Id.
* @apiSuccess {String}     name                    Account Name.
* @apiSuccess {String}     accountNumber           Account Numder.
* @apiSuccess {String}     accountType             Account type detail.
* @apiSuccess {Boolean}    isDeleted               Account exist or not into the system.
* @apiSuccess {Date}       createdOn               Account creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
* @apiSuccess {Date}       editedOn                Account edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.

*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*[
*  {
*    "id": 1,
*    "name": "Kane, Jr.  Fredric",
*    "accountNumber": "L05C900669",
*    "accountType": "TRU",
*    "isDeleted": 0,
*    "createdBy": "prime@tgi.com",
*    "editedBy": "prime@tgi.com"
*    "createdOn": "2016-07-14 09:00:00",
*    "editedOn": "2016-07-14 09:00:00"
*  },
*  {
*   "id": 1000,
*    "name": "McElhenie Richard L.",
*    "accountNumber": "L0050C0669",
*    "accountType": null,
*    "isDeleted": 0,
*    "createdBy": "prime@tgi.com",
*    "editedBy": "prime@tgi.com",.
*    "createdOn": "2016-07-14 09:00:00",
*    "editedOn": "2016-07-14 09:00:00"
*  }
*]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/


app.get('/new', function (req, res) {
    logger.info("Get all new account request received");

    var data = req.data;

    accountService.getNewAccountList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
@api {get} /account/accounts/noPortfolio  Get Account List with NO Portfolio 
* @apiName GetAccountListWithNOPortfolio
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get account list with no portfolio.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/noPortfolio

* @apiSuccess {Number}     id                      System Genarated Id.
* @apiSuccess {String}     name                    Account Name.
* @apiSuccess {String}     accountNumber           Account Numder.
* @apiSuccess {String}     accountType             Account type detail.
* @apiSuccess {Boolean}    isDeleted               Account exist or not into the system.
* @apiSuccess {Date}       createdOn               Account creation date into application.
* @apiSuccess {String}     createdBy               Id of user who created the Account into the system.
* @apiSuccess {Date}       editedOn                Account edited date into application.
* @apiSuccess {String}     editedBy                Id of user who edited the Account details into the system.

*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*[
*  {
*    "id": 11,
*    "name": "Akin Bernard Edwards",
*    "accountNumber": "L06C600669",
*    "accountType": "IND",
*    "isDeleted": 0,
*    "createdBy": "prime@tgi.com",
*    "editedBy": "prime@tgi.com",
*    "createdOn": "2016-07-14 09:00:00",
*    "editedOn": "2016-07-14 09:00:00"
*  },
*  {
*    "id": 12,
*    "name": "Annadale Beverly J.",
*    "accountNumber": "L05CD79669",
*    "accountType": "IND",
*    "isDeleted": 0,
*    "createdBy": "prime@tgi.com",
*    "editedBy": "prime@tgi.com",
*    "createdOn": "2016-07-14 09:00:00",
*    "editedOn": "2016-07-14 09:00:00"
*  }]
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/


app.get('/noPortfolio', function (req, res) {
    logger.info("Get all account with no portfolio request received");

    var data = req.data;

    accountService.getAccountListWithNoPortfolio(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});



/**
* @api {get} /account/accounts/accountfilters Get Accounts Filters List
* @apiName GetAccountFilterList
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get all account filter list. 
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
*  
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/accountfilters

* @apiSuccess {Number}     id                      System Genarated Id.
* @apiSuccess {String}     name                    Account Filter Name.

* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
* [
*  {
*    "id": 1,
*    "name": "Accounts set to Systematic"
*  },
*  {
*    "id": 2,
*    "name": "Accounts with Merge In"
*  }]
* 
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/

app.get('/accountfilters', function (req, res) {
    logger.info("Get all account filters request received");
    var data = req.data;
    accountService.getAccountFilters(data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

/**
@api {get} /account/accounts/:id Get Account Details 
* @apiName GetAccountDetails
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to get particular account detail. 
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/1

* @apiSuccess {Number}     id                          System Generated Id.
* @apiSuccess {String}     name                        Account Name.
* @apiSuccess {String}     accountNumber               Account Number.
* @apiSuccess {String}     accountId                   Account Id.
* @apiSuccess {String}     billingAccount              Billing Account detail.
* @apiSuccess {String}     portfolio                   Portfolio Name.
* @apiSuccess {String}     custodian                   Custodian Name.
* @apiSuccess {String}     sleeveType                  Sleeve Type detail.
* @apiSuccess {String}     advisor                     Advisor Name.
* @apiSuccess {String}     ssn                         SSN Value.
* @apiSuccess {String}     style                       Name of the style.
* @apiSuccess {String}     model                       Model Name associated on Account.
* @apiSuccess {Number}     registrationId              Registration Id.
* @apiSuccess {Boolean}    isReplenish                 isReplenish detail
* @apiSuccess {Number}     sleeveContributionPercent   Sleeve Contribution Percentage.
* @apiSuccess {Number}     sleeveDistributionPercent   Sleeve Distribution Percentage.
* @apiSuccess {Number}     sleeveTarget                Sleeve Target.
* @apiSuccess {Number}     sleeveToleranceLower        Sleeve Tolerance Lower.
* @apiSuccess {Number}     sleeveToleranceUpper        Sleeve Tolerance Upper.
* @apiSuccess {String}     smaTradeable                Sma Tradeable.
* @apiSuccess {Number}     sleeveCurrent               Sleeve Current.
* @apiSuccess {JSON}       summarySection              Summary Section.
* @apiSuccess {Number}     -grandTotal                 Grand Total.
* @apiSuccess {Number}     -totalValue                 Total Value.
* @apiSuccess {Number}     -managedValue               Managed Value.
* @apiSuccess {Number}     -excludedValue              Excluded Value.
* @apiSuccess {Number}     -totalCashValue             Total Cash Value
* @apiSuccess {Number}     -cashReserve                Cash Reserve.
* @apiSuccess {Number}     -cashAvailable              Cash Available.
* @apiSuccess {Number}     -setAsideCash               Set Aside Cash.
* @apiSuccess {JSON}       ytdGl                       YTD Gain-Loss Summary.
* @apiSuccess {Number}     -totalGainLoss              Total Gain-Loss Value.
* @apiSuccess {String}     -totalGainLossStatus        High or low as compare previous day value.
* @apiSuccess {Number}     -shortTermGL                Short Term Gain-Loss Value.
* @apiSuccess {String}     -shortTermGLStatus          High or low as compare previous day value.
* @apiSuccess {Number}     -longTermGL                 Long Term Gain-Loss Value.
* @apiSuccess {String}     -longTermGLStatus           High or low as compare previous day value.
* @apiSuccess {JSON}       accountValue                Account Value Summary.
* @apiSuccess {Date}       -totalValueOn               Date.
* @apiSuccess {Number}     ---totalValue               Total value as on date.
* @apiSuccess {String}     -status                     High or low as compare previous day value.
* @apiSuccess {JSON}       holdings                    Holding Summary.
* @apiSuccess {String}     securityName                Name of security.
* @apiSuccess {Number}     marketValue                 Market Value of security.
* @apiSuccess {Number}     units                       Security units.
* @apiSuccess {Number}     price                       Security price.
* @apiSuccess {Number}     percentage                  Security percentage detail.
* @apiSuccess {JSON}       errorAndWarnings            errorAndWarnings summary.
* @apiSuccess {String}     -systematic                 Systematic bar detail.
* @apiSuccess {Number}     -mergeIn                    Account mergeIn detail.
* @apiSuccess {Number}     -mergeOut                   Account mergeOut detail.
* @apiSuccess {Number}     -newAccount                 This is a new account or not.
* @apiSuccess {String}     -hasPortfolios              This account has Portfolios or not.
* @apiSuccess {String}     -custodialRestrictions      Custodial Restrictions.
* @apiSuccess {String}     -sma                        Single manage account detail.
* @apiSuccess {Number}     -importError                Import Error detail.
* @apiSuccess {String}     -hasPendingTrades           Pending Trades detail.
* @apiSuccess {Date}       createdOn                   Account import date into application.
* @apiSuccess {String}     createdBy                   Id of user who created the Account into the system.
* @apiSuccess {Date}       editedOn                    Account edited date into application.
* @apiSuccess {String}     editedBy                    Id of user who edited the Account details into the system.
*  
* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 200 OK
*
*  {
*    "id": 1,
*    "accountNumber": "L05C900669",
*    "accountId": "15",
*    "name": "Kane, Jr.  Fredric ",
*    "billingAccount": "Yes",
*    "portfolio": "Demo Portfolio Kate",
*    "custodian": "Prime",
*    "sleeveType": "Custodial",
*    "advisior": "BOI",
*    "ssn": "xxxxxxx1372",
*    "model": "Community Model 1",
*    "style": "Aggressive",
*    "registrationId": 12,
*    "isReplenish":True,
*    "sleeveContributionPercent": 10,
*    "sleeveDistributionPercent": 10,
*    "sleeveTarget": 0,
*    "sleeveToleranceLower": 5,
*    "sleeveToleranceUpper": 5,
*    "smaTradeable": "0",
*    "sleeveCureent": 0,
*    "summarySection": {
*      "grandTotal": 602800,
*      "totalValue": 24190,
*      "managedValue": 578610,
*      "excludedValue": 0,
*      "totalCashValue": 578610,
*      "cashReserve": 0,
*      "cashAvailable": 600,
*      "setAsideCash": 700
*    },
*    "ytdGl": {
*      "totalGainLoss": 0,
*      "shortTermGL": 0,
*      "longTermGL": 0,
*      "shortTermGLStatus": "High",
*      "longTermGLStatus": "High",
*      "totalGainLossStatus": "High"
*    },
*    "accountValue": {
*      "totalValueOn": "2016-10-24T03:30:00.000Z",
*      "totalValue": 20190,
*      "status": "Low",
*      "holdings": [
*        {
*          "securityName": "Agilent Technologies Inc",
*          "marketValue": 2300,
*          "unit": 230,
*          "price": 10,
*          "percentage": 7.18
*        },
*        {
*          "securityName": "Dominion Resources Inc",
*          "marketValue": 2500,
*          "unit": 250,
*          "price": 10,
*          "percentage": 7.81
*        }
*       ]
*    },
*    "errorAndWarnings": {
*      "systematic": "Yes",
*      "mergeIn": 61,
*      "mergeOut": 0,
*      "newAccount": "Yes",
*      "hasPortfolios": "Yes",
*      "custodialRestrictions": "Yes",
*      "sma": "Yes",
*      "importError": "Account",
*      "hasPendingTrades": "No"
*    },
*    "createdOn": "2016-11-02T03:30:00.000Z",
*    "createdBy": "prime@tgi.com",
*    "editedOn": "2016-10-28T09:57:03.000Z",
*    "editedBy": "prime@tgi.com"
*  }
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

app.get('/:id', validate({ params: accountIdSchema }), UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get account details request received");

    var data = req.data;
    data.id = req.params.id;
    accountService.getAccountDetail(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /account/accounts/{:id}/holdings  Get Holding List by Account Id
 * @apiName GetHoldinglistByAccountId
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get holding list by account id
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/account/accounts/1/holdings

 * @apiSuccess {Number}     id                      System Genarated Id.
 * @apiSuccess {String}     accountNumber           Account number assocaited with holding.
 * @apiSuccess {String}     securityName            Security name.
 * @apiSuccess {Number}     price                   Price of holding.
 * @apiSuccess {Number}     shares                  Shares.
 * @apiSuccess {Number}     value                   Holding value.
 * @apiSuccess {Number}     currentInPer            Current holding percentage.
 * @apiSuccess {Number}     targetInPer             Target holding percentage.
 * @apiSuccess {Number}     pendingValue            Pending value.
 * @apiSuccess {Number}     pendingInPer            Pending percentage
 * @apiSuccess {String}     excluded                Holding excluded detail.
 * @apiSuccess {String}     isCash                  Holding "iscash" detail. 
 * @apiSuccess {String}     inModel                 Holding "inModel" detail. 
 * @apiSuccess {Boolean}    isDeleted               Holding exist or not into the system.
 * @apiSuccess {Date}       createdOn               Holding creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Holding into the system.
 * @apiSuccess {Date}       editedOn                Holding edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Holding details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 * [
 *  {
 *   "id": 14615,
 *   "accountNumber": "L05C900669",
 *   "securityName": "Agilent Technologies Inc",
 *   "price": 10,
 *   "shares": 230,
 *   "value": 2300,
 *   "currentInPer": 10.32,
 *   "targetInPer": 5,
 *   "pendingValue": 0,
 *   "pendingInPer": 0,
 *   "excluded": "No",
 *   "isCash": "Yes",
 *   "inModel": "Yes",
 *   "isDeleted": 0,
 *   "createdOn": "2016-07-14T03:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-07-14T03:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 * }
 *]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/**
 * @api {get} /account/accounts/1/holdings?filter={filterId}  Get Account Holding List by Filters
 * @apiName GetAccountHoldingbyFilter
 * @apiVersion 1.0.0
 * @apiGroup Holding
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get holding list by filter
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/account/accounts/1/holdings?filter=1
 * 
 * @apiSuccess {Number}     id                      System Genarated Id.
 * @apiSuccess {String}     accountNumber           Account number assocaited with holding.
 * @apiSuccess {String}     securityName            Security name.
 * @apiSuccess {Number}     price                   Price of holding.
 * @apiSuccess {Number}     shares                  Shares.
 * @apiSuccess {Number}     value                   Holding value.
 * @apiSuccess {Number}     currentInPer            Current holding percentage.
 * @apiSuccess {Number}     targetInPer             Target holding percentage.
 * @apiSuccess {Number}     pendingValue            Pending value.
 * @apiSuccess {Number}     pendingInPer            Pending percentage
 * @apiSuccess {String}     excluded                Holding excluded detail.
 * @apiSuccess {String}     isCash                  Holding "iscash" detail. 
 * @apiSuccess {String}     inModel                 Holding "inModel" detail. 
 * @apiSuccess {Boolean}    isDeleted               Holding exist or not into the system.
 * @apiSuccess {Date}       createdOn               Holding creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the Holding into the system.
 * @apiSuccess {Date}       editedOn                Holding edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the Holding details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *   
 * [
 *  {
 *   "id": 14615,
 *   "accountNumber": "L05C900669",
 *   "securityName": "Agilent Technologies Inc",
 *   "price": 10,
 *   "shares": 230,
 *   "value": 2300,
 *   "currentInPer": 10.32,
 *   "targetInPer": 5,
 *   "pendingValue": 0,
 *   "pendingInPer": 0,
 *   "excluded": "No",
 *   "isCash": "Yes",
 *   "inModel": "Yes",
 *   "isDeleted": 0,
 *   "createdOn": "2016-07-14T03:30:00.000Z",
 *   "createdBy": "prime@tgi.com",
 *   "editedOn": "2016-07-14T03:30:00.000Z",
 *   "editedBy": "prime@tgi.com"
 * }
 *]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 */


app.get('/:id/holdings', validate({ params: accountIdSchema }), UserTeamAccessMiddleWare, function (req, res) {
    logger.info("Get holding details request received");

    var data = req.data;
    data.id = req.params.id;
    // data.searchType = 'ACCOUNT'
    if (req.query.filter) {
        data.filter = req.query.filter;
    }
    holdingService.getHoldingByAccountId(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /account/accounts/{:id}/sma  Get SMA List 
 * @apiName GetSMAList
 * @apiVersion 1.0.0
 * @apiGroup Account
 * @apiPermission appUser
 *
 * @apiDescription This api will be used to get sma list
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/account/accounts/1/sma

 * @apiSuccess {Number}     selectedLevelId       Selected Level Id.
 * @apiSuccess {JSON}       weightings              Weightings Info.
 * @apiSuccess {Number}     id                      System Genarated Id.
 * @apiSuccess {Number}     subModelId              Sub ModelId.
 * @apiSuccess {String}     subModelName            Sub Model Name.
 * @apiSuccess {Number}     weightPercent           Weight Percent detail.
 * @apiSuccess {Number}     modelId                 Model Id assocaited with acccountId
 * @apiSuccess {Number}     modelDetailId           Model Detail Id.
 * @apiSuccess {Boolean}    isDeleted               SMA exist or not into the system.
 * @apiSuccess {Date}       createdOn               SMA creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the SMA into the system.
 * @apiSuccess {Date}       editedOn                SMA edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the SMA details into the system.
 * *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 * {
  "selectedLevelId": 2,
  "weightings": [
    {
      "id": 28,
      "subModelId": 7,
      "subModelName": "CLS1",
      "weightPercent": 30,
      "modelId": 1,
      "modelDetailId": 30,
      "isDeleted": 0,
      "createdOn": "2016-12-20T18:17:37.000Z",
      "createdBy": "prime@tgi.com",
      "editedOn": "2016-12-20T18:17:37.000Z",
      "editedBy": "prime@tgi.com"
    },
    {
      "id": 29,
      "subModelId": 8,
      "subModelName": "CLS1",
      "weightPercent": 10,
      "modelId": 1,
      "modelDetailId": 30,
      "isDeleted": 0,
      "createdOn": "2016-12-20T18:17:37.000Z",
      "createdBy": "prime@tgi.com",
      "editedOn": "2016-12-20T18:17:37.000Z",
      "editedBy": "prime@tgi.com"
    }
  ]
}
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

app.get('/:id/sma', function (req, res) {
    logger.info("Get sma node details request received");
    var data = req.data;
    data.id = req.params.id;
    if (data.id) {
        logger.info("Get sma category node details request received");
        accountService.getSmaNodeList(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }

    else {
        return response(null, responseCode.SUCCESS, [], res);
    }
});

/**
@api {put} /account/accounts/{:id}/sma/  Add SMA Node Detail
* @apiName addSmaNode
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to add sma node.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage 1:
* curl -i http://baseurl/v1/account/accounts/1/sma
 
 * @apiParam {Number}       selectedLevelId    Selected Level Id.
 * @apiParam {JSON}         weightings         Weightings Info.
 * @apiParam {Number}       id                 System Genarated Id.
 * @apiParam {Number}       subModelId         Sub Model Id.
 * @apiParam {Number}       weightPercent      Weight Percent.
 * @apiParam {Number}       modelId            Model Id assocaited with acccountId
 * @apiParam {Number}       modelDetailId      Model Detail Id.

 * @apiParamExample {json} Request-Example:
 *{
  "selectedLevelId": 2,
  "weightings": [
    {
      "id": 28,
      "subModelId": 7,
      "weightPercent": 30,
      "modelId": 1,
      "modelDetailId": 30
      
    },
    {
      "id": 29,
      "subModelId": 8,
      "weightPercent": 10,
      "modelId": 1,
      "modelDetailId": 30
      
    }
  ]
}
 * @apiSuccess {Number}     selectedLevelId       Selected Level Id.
 * @apiSuccess {JSON}       weightings              Weightings Info.
 * @apiSuccess {Number}     id                      System Genarated Id.
 * @apiSuccess {Number}     subModelId              Sub ModelId.
 * @apiSuccess {String}     subModelName            Sub Model Name.
 * @apiSuccess {Number}     weightPercent           Weight Percent detail.
 * @apiSuccess {Number}     modelId                 Model Id assocaited with acccountId
 * @apiSuccess {Number}     modelDetailId           Model Detail Id.
 * @apiSuccess {Boolean}    isDeleted               SMA exist or not into the system.
 * @apiSuccess {Date}       createdOn               SMA creation date into application.
 * @apiSuccess {String}     createdBy               Id of user who created the SMA into the system.
 * @apiSuccess {Date}       editedOn                SMA edited date into application.
 * @apiSuccess {String}     editedBy                Id of user who edited the SMA details into the system.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 
 * {
  "selectedLevelId": 2,
  "weightings": [
    {
      "id": 28,
      "subModelId": 7,
      "subModelName": "CLS1",
      "weightPercent": 30,
      "modelId": 1,
      "modelDetailId": 30,
      "isDeleted": 0,
      "createdOn": "2016-12-20T18:17:37.000Z",
      "createdBy": "prime@tgi.com",
      "editedOn": "2016-12-20T18:17:37.000Z",
      "editedBy": "prime@tgi.com"
    },
    {
      "id": 29,
      "subModelId": 8,
      "subModelName": "CLS1",
      "weightPercent": 10,
      "modelId": 1,
      "modelDetailId": 30,
      "isDeleted": 0,
      "createdOn": "2016-12-20T18:17:37.000Z",
      "createdBy": "prime@tgi.com",
      "editedOn": "2016-12-20T18:17:37.000Z",
      "editedBy": "prime@tgi.com"
    }
  ]
}
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


/**
@apiIgnore {put} /account/accounts/{:id}/sma/  Delete All SMA Node
* @apiName deleteSmaNode
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will be used to add aside.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage 1:
* curl -i http://baseurl/v1/account/accounts/1/sma

* @apiParam {JSON}         sma                 empty array.
 
* @apiParamExample {json} Request-Example:
* {
  
  "weightings": []
    
  }
*   @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*       {
*        "message": "SMA Node deleted successfully."
*       }
* 
*  
*  @apiError Unauthorized Invalid/Without JWT Token.
* 
*  @apiErrorExample Response (example):
*      HTTP/1.1 401 Unauthorized
*      {
*        "message": "Invalid Authorization Header""
*     }
* 
*/


app.put('/:id/sma', validate({ body: smaBodySchema }, { params: paramSmaSchema }), function (req, res) {
    logger.info("Add New SMA node detail request received");
    var data = req.data;
    data.accountId = req.params.id;

    var smaBodySchema = req.body.weightings;
    if (smaBodySchema == '') {
        accountService.deleteSmaNode(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }
    else {
        var smaData = accountConverter.smaRequest(data);
        accountService.addSmaNode(data, function (err, status, data) {
            return response(err, status, data, res);
        });
    }

});

/**
 * @api {get} /account/accounts/:modelId/outOfTolerance/:assetId?assetType={securityset/category,class,subClass} Get Out Of Tolerance Accounts
 * @apiName Get Out Of Tolerance Accounts
 * @apiVersion 1.0.0
 * @apiGroup Account
 *
 * @apiDescription This API get ot of tolerance sleeve account by security, category,class and subclass.
 * asset id can be securityId, categoryId, classId or subclassId. also we beed type of asset inquery string.
 
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/account/accounts/:modelId/outOfTolerance/:assetId?assetType={securityset/category,class,subClass}
 * 
 * @apiSuccess {Number}      accountId                          Account id.
 * @apiSuccess {String}      accountName                        Account Name.
 * @apiSuccess {Decimal}     currentInPercentage:               Current value in percentage.
 * @apiSuccess {Decimal}     postTradeInPercentage:             Post trade value in percentage.
 * @apiSuccess {Decimal}     differenceInPercentage:            Difference in percentage.
 * @apiSuccess {Decimal}     currentInDollar                    Current value in dollar amount.
 * @apiSuccess {Decimal}     differenceInDollar                 Difference in dollar.
 * @apiSuccess {String}      postTradeInDollar                  Post trade value in dollar.
 * @apiSuccess {Decimal}     currentInShares                    Current value in shares.
 * @apiSuccess {Decimal}     differenceInShares                 Difference in shares
 * @apiSuccess {Boolean}     postTradeInShares                  Post trade value in shares.

 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *  [
 *    {
 *         "accountId": 1,
 *         "accountName": test1
 *         "currentInPercentage": 22.8,
 *         "postTradeInPercentage": 22.8,
 *         "differenceInPercentage": 0,
 *         "currentInDollar": 16000,
 *         "differenceInDollar": 16000,
 *         "postTradeInDollar": 16000,
 *         "currentInShares": 40,
 *         "differenceInShares": 40,
 *         "postTradeInShares": 40
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
app.get('/:modelId/outOfTolerance/:assetId', function (req, res) {
    logger.info("Get out of tolerance sleeve accounts list request received");
    var data = req.data;
    data.modelId = req.params.modelId;
    data.assetId = req.params.assetId;
    if (req.query.assetType) {
        data.assetType = req.query.assetType;
    }
    accountService.getAccountsWithOutOfTolerance(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/:modelId/removeSma', function (req, res) {
    logger.info("Get out of tolerance sleeve accounts list request received");
    var data = req.data;
    data.portfolioId = req.params.modelId;

    SMAService.removeSMAForPortfolio(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
@api {get} /account/accounts/:accountId/portfolioId Get Portfolio Id By Account
* @apiName GetPortfolioIdByAccount
* @apiVersion 1.0.0
* @apiGroup  Account
* @apiPermission appUser
*
* @apiDescription This api will return portolio id against given accountId.
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/account/accounts/{accountId}/portfolioId

* @apiSuccess {String}     acountId                      Account id .
* @apiSuccess {String}     portfolioId                   Account's Portfolio id.
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
      {
        "accountId": 1,
        "portfolioI": 5
      }
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/


app.get('/:accountId/portfolioId', function (req, res) {
    logger.info("Get Portfolio id request received");

    var data = req.data;
    
    if(req.params.accountId == undefined || req.params.accountId == null){
    		logger.error("Get Portfolio By Account ID request error :: \n Invalid or Null accountId.");
    		return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }
    
    data.accountId = req.params.accountId;
    
    accountService.getPortfolios(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
module.exports = app;
