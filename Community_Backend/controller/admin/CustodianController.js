"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var CustodianService = require('service/admin/CustodianService.js');
var CustodianRequest = require("model/custodian/CustodianRequest.js");

var logger = helper.logger(moduleName);
var validate = helper.validate;

var custodianService = new CustodianService();

var custodianBodySchema = {
    type: 'object',
    properties: {
        externalId: {
            type: 'number',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        accountNumber:{
            type: 'string',
            required: true
        },
        code: {
            type: 'string',
            required: true
        },
        tradeExecutionTypeId: {
            type: 'number'
        },
        tradeExecutions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    tradeExecutionTypeId: {
                        type: 'number',
                        required: true
                    },
                    securityTypeId: {
                        type: 'number',
                        required: true
                    }
                }
            }
        }
    }
};
var custodianIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
};
var custodianPutSchema = {
    type: 'object',
    properties: {
        externalId: {
            type: 'number',
            required: true
        },
        name: {
            type: 'string',
            required: true
        },
        code: {
            type: 'string',
            required: true
        },
        accountNumber:{
            type: 'string',
            required: true
        },
        tradeExecutionTypeId: {
            type: 'number'
        },
        tradeExecutions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    tradeExecutionTypeId: {
                        type: 'number',
                        required: true
                    },
                    securityTypeId: {
                        type: 'number',
                        required: true
                    }
                }
            }
        }
    }
};
/**@apiIgnore

 * @api {get} /admin/custodians?search={id/name} Search Custodians 
 * @apiName SearchCustodians
 * @apiVersion 1.0.0
 * @apiGroup Custodians
 * @apiPermission appuser
 *
 * @apiDescription This API search custodian. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/custodians?search=123467
 * 
 * @apiSuccess {Number}     id                  The custodian ID.
 * @apiSuccess {Number}     externalId          The custodian orion connect external id.
 * @apiSuccess {String}     name                Name of the Custodian.
 * @apiSuccess {String}     code                Code of the Custodian.
 * @apiSuccess {String}     accountNumber       Account number of the Custodian.
 * @apiSuccess {Boolean}     isDeleted           Custodian exist or not into the system.
 * @apiSuccess {Date}       createdOn           Custodian creation date into application.
 * @apiSuccess {Number}     createdBy           Full Name of user who created the Custodian into the system.
 * @apiSuccess {Date}       editedOn            Custodian edited date into application.
 * @apiSuccess {Number}     editedBy            Full Name of user who edited the Custodian details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 123467,
                "externalId": 143546,
                "name": "new custodian4",
                "code": "CUST",
                "accountNumber": 123456,
                "isDeleted": 0,
                "createdOn": "2016-07-18T11:55:08.000Z",
                "createdBy": "Prime Prime",
                "editedOn": "2016-07-18T11:55:08.000Z",
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
/**@apiIgnore

 * @api {get} /admin/custodians Get All Custodians 
 * @apiName GetAllCustodians
 * @apiVersion 1.0.0
 * @apiGroup Custodians
 * @apiPermission appuser
 *
 * @apiDescription This API gets custodian list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/custodians
 * 
 * @apiSuccess {Number}     id                  The custodian ID.
 * @apiSuccess {Number}     externalId          The custodian orion connect external id.
 * @apiSuccess {String}     name                Name of the Custodian.
 * @apiSuccess {String}     code                Code of the Custodian.
 * @apiSuccess {String}     accountNumber       Account number of the Custodian.
 * @apiSuccess {Boolean}     isDeleted           Custodian exist or not into the system.
 * @apiSuccess {Date}       createdOn           Custodian creation date into application.
 * @apiSuccess {Number}     createdBy           Full Name of user who created the Custodian into the system.
 * @apiSuccess {Date}       editedOn 	        Custodian edited date into application.
 * @apiSuccess {Number}     editedBy            Full Name of user who edited the Custodian details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
            {
                "id": 123467,
                "externalId": 345234,
                "name": "new custodian4",
                "code": "CUST4",
                "accountNumber": 123456,
                "isDeleted": 0,
                "createdOn": "2016-07-18T11:55:08.000Z",
                "createdBy": "Prime Prime",
                "editedOn": "2016-07-18T11:55:08.000Z",
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

 app.get('/', function (req, res) {
    logger.info("Get all custodians request recevied");

    var data = req.data;

    custodianService.getCustodianList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});



/**@apiIgnore

 * @api {get} /admin/custodians/:id/accounts Get Custodians Accounts 
 * @apiName GetCustodianAccount
 * @apiVersion 1.0.0
 * @apiGroup Custodians
 * @apiPermission appuser
 *
 * @apiDescription This API gets custodian accounts list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/custodians/1/accounts
 * 
 * @apiSuccess {Number}     id                  The account ID.
 * @apiSuccess {String}     accountNumber       Account Number of custodian
 * @apiSuccess {String}     name                Name of Account
 * @apiSuccess {Number}     portfolioId         Portfolio Id associate with account
 * @apiSuccess {Boolean}     isDeleted           Account exist or not into the system.
 * @apiSuccess {Date}       createdOn           Account creation date into application.
 * @apiSuccess {Number}     createdBy           Full Name of user who created the Account into the system.
 * @apiSuccess {Date}       editedOn            Account edited date into application.
 * @apiSuccess {Number}     editedBy            Full Name of user who edited the Account details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
          {
            "id": "1",
            "accountNumber": "3423648723",
            "name": "sadasdasd",
            "portfolioId": 1,
            "isDeleted": 0,
            "createdOn": "2016-07-18T11:55:08.000Z",
            "createdBy": "Prime Prime",
            "editedOn": "2016-07-18T11:55:08.000Z",
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
 app.get('/:id/accounts', validate({ params: custodianIdSchema }), function (req, res) {
    logger.info("Get custodian accounts by id request received");

    var data = req.data;
    data.id = req.params.id;

    custodianService.getCustodianAccounts(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**@apiIgnore

 * @apiIgnore Api not active
 * @api {post} /admin/custodians Add Custodian
 * @apiName AddCustodian
 * @apiVersion 1.0.0
 * @apiGroup Custodians
 * @apiPermission appuser
 *
 * @apiDescription This API adds Orion Connect Custodian into application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}     externalId          The custodian orion connect external id.
 * @apiParam {String}       name                    Full name of the User.
 * @apiParam {String}       code                    User email id.
 * @apiParam {String}       accountNumber           Account number of the Custodian.
 * @apiParam {Number}       tradeExecutionsTypeId   Trade execution type for all security type.
 * @apiParam {Array}        tradeExecutions         Trade execution type for security type.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "externalId": 623466,
 *       "name": "new custodian3",
 *       "code": "CUST3",
 *       "accountNumber":"123456",
 *       "tradeExecutions":[
 *          {
 *              "securityTypeId":1,
 *             "tradeExecutionTypeId":1
 *        }
 *          ]
 *      }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/custodians
 * 
 * @apiSuccess {Number}     id                  The custodian ID.
 * @apiSuccess {Number}     externalId          The custodian orion connect external id.
 * @apiSuccess {String}     name                Name of the Custodian.
 * @apiSuccess {String}     code                Code of the Custodian.
 * @apiSuccess {String}     accountNumber       Account number of the Custodian.
 * @apiSuccess {Number}     tradeExecutionTypeId       Trade execution type for all security type.
 * @apiSuccess {Array}      tradeExecutions       Trade execution type for security type.
 * @apiSuccess {Boolean}    isDeleted           Custodian exist or not into the system.
 * @apiSuccess {Date}       createdOn           Custodian creation date into application.
 * @apiSuccess {Number}     createdBy           Full Name of user who created the Custodian into the system.
 * @apiSuccess {Date}       editedOn 	        Custodian edited date into application.
 * @apiSuccess {Number}     editedBy            Full Name of user who edited the Custodian details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
        "id": 623466,
        "name": "new custodian3",
        "externalId":345624,
        "code": "CUST3",
        "accountNumber": 123456,
        "tradeExecutions": [
            {
            "securityTypeId": 1,
            "securityTypeName": "MUTUAL FUND",
            "tradeExecutionTypeId": 1,
            "tradeExecutionTypeName": "FIX DIRECT"
            }
        ],
        "isDeleted": 0,
        "createdOn": "2016-07-19T09:09:37.000Z",
        "createdBy": "Prime Prime",
        "editedOn": "2016-07-19T09:09:37.000Z",
        "editedBy": "Prime Prime"
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
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 * @apiError Unprocessable_Entity When user already exist with same id.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": "Custodian already exist with same id"
 *     }
 * 
 * 
 *
 */
 /*app.post('/', validate({ body: custodianBodySchema }), function (req, res) {
    logger.info("Create custodian request received");

    var data = new CustodianRequest(req.data);

    custodianService.addCustodian(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});*/
/**@apiIgnore

 * @api {put} /admin/custodians/:id Update Custodian
 * @apiName  Update Custodian.
 * @apiVersion 1.0.0
 * @apiGroup Custodians
 * @apiPermission appuser
 *
 * @apiDescription This API Update Custodian. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {Number}     externalId          The custodian orion connect external id.
 * @apiParam {String}       name            Full name of the User.
 * @apiParam {String}       code           User email id.
 * @apiParam {String}     accountNumber       Account number of the Custodian.
 * @apiParam {Number}     tradeExecutionTypeId       Trade execution type for all security type.
 * @apiParam {Array}     tradeExecutions       Trade execution type for security type.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
        "externalId":3456,
 *       "name": "Gurdeep",
 *       "code": "CUST3",
 *       "accountNumber": "123456",   
 *       "tradeExecutions":[
 *          {
 *              "securityTypeId":1,
 *             "tradeExecutionTypeId":1
 *        }
 *          ]
 *      }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/custodians/1
 * 
 * @apiSuccess {Number}     id                  The custodian ID.
 * @apiSuccess {String}     name                Name of the Custodian.
 * @apiSuccess {Number}     externalId          The custodian orion connect external id.
 * @apiSuccess {String}     code                Code of the Custodian.
 * @apiSuccess {String}     accountNumber       Account number of the Custodian.
 * @apiSuccess {Number}     tradeExecutionsTypeId       Trade execution type for all security type.
 * @apiSuccess {Array}     tradeExecutions       Trade execution type for security type.
 * @apiSuccess {Boolean}     isDeleted           Custodian exist or not into the system.
 * @apiSuccess {Date}       createdOn           Custodian creation date into application.
 * @apiSuccess {Number}     createdBy           Full Name of user who created the Custodian into the system.
 * @apiSuccess {Date}       editedOn 	        Custodian edited date into application.
 * @apiSuccess {Number}     editedBy            Full Name of user who edited the Custodian details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
        "id": 623466,
        "name": "new custodian3",
        "externalId:: 34562,
        "code": "CUST3",
        "accountNumber": 123456,
        "tradeExecutions": [
            {
            "securityTypeId": 1,
            "securityTypeName": "MUTUAL FUND",
            "tradeExecutionTypeId": 1,
            "tradeExecutionTypeName": "FIX DIRECT"
            }
        ],
        "isDeleted": 0,
        "createdOn": "2016-07-19T09:09:37.000Z",
        "createdBy": "Prime Prime",
        "editedOn": "2016-07-19T09:09:37.000Z",
        "editedBy": "Prime Prime"
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
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 */
 app.put('/:id',validate({ params: custodianIdSchema }),validate({ body: custodianPutSchema }), function (req, res) {
    logger.info("update custodian request received");
    
    var data = req.data;
    data.id = req.params.id;
    data = new CustodianRequest(data);
    
    custodianService.updateCustodian(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**@apiIgnore

 * @api {delete} /admin/custodians/:id Delete Custodian
 * @apiName DeleteCustodian
 * @apiVersion 1.0.0
 * @apiGroup Custodians
 * @apiPermission appuser
 *
 * @apiDescription This API deletes (soft delete) custodian in application. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/custodians/324578
 * 
 * @apiSuccess {String}     message            Custodian deleted message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     
 *    {
        "message": "Custodian deleted successfully"
      }
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
 * @apiError Not_Found When custodian does not exist or already deleted.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
         "message": "Custodian does not exist or already deleted"
       }
 *
 */
 app.delete('/:id', validate({ params: custodianIdSchema }), function (req, res) {
    logger.info("Delete custodian request received");
    
    var data = req.data;
    data.id = req.params.id;
    data = new CustodianRequest(data);
    
    custodianService.deleteCustodian(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore

 * @api {get} /admin/custodians/summary Get Custodians Summary 
 * @apiName GetCustodiansSummary
 * @apiVersion 1.0.0
 * @apiGroup Custodians
 * @apiPermission appuser
 *
 * @apiDescription This API gets custodian summary. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/custodians/summary
 * 
 * @apiSuccess {Number}     totalCustodians                  Total custodians.
 * @apiSuccess {Number}     activeCustodians                 Active Custodians.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
          "totalCustodians": 23,
          "activeCustodians": 0
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

 app.get('/summary', function (req, res) {
    logger.info("Get all custodians summaryrequest recevied");

    var data = req.data;
    
    custodianService.getCustodianSummary(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**@apiIgnore

 * @api {get} /admin/custodians/:id Get Custodians Detail 
 * @apiName GetCustodianDetail
 * @apiVersion 1.0.0
 * @apiGroup Custodians
 * @apiPermission appuser
 *
 * @apiDescription This API gets custodian list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/custodians/1
 * 
 * @apiSuccess {Number}     id                  The custodian ID.
 * @apiSuccess {String}     name                Name of the Custodian.
 * @apiSuccess {Number}     externalId          The custodian orion connect external id.
 * @apiSuccess {String}     code                Code of the Custodian.
 * @apiSuccess {String}     accountNumber       Account number of the Custodian.
 * @apiSuccess {Number}     tradeExecutionsTypeId       Trade execution type for all security type.
 * @apiSuccess {Array}     tradeExecutions       Trade execution type for security type.
 * @apiSuccess {Boolean}     isDeleted           Custodian exist or not into the system.
 * @apiSuccess {Date}       createdOn           Custodian creation date into application.
 * @apiSuccess {Number}     createdBy           Full Name of user who created the Custodian into the system.
 * @apiSuccess {Date}       editedOn            Custodian edited date into application.
 * @apiSuccess {Number}     editedBy            Full Name of user who edited the Custodian details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
        "id": 123466,
        "name": "new custodian",
        "externalId": 34562,
        "code": "CUST",
        "accountNumber": 123456,
        "tradeExecutions": [
            {
            "securityTypeId": 1,
            "securityTypeName": "MUTUAL FUND",
            "tradeExecutionTypeId": 1,
            "tradeExecutionTypeName": "FIX DIRECT"
            }
        ],
        "isDeleted": 0,
        "createdOn": "2016-07-18T11:29:08.000Z",
        "createdBy": "Prime Prime",
        "editedOn": "2016-07-18T11:29:08.000Z",
        "editedBy": "Prime Prime"
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
 app.get('/:id', validate({ params: custodianIdSchema }), function (req, res) {
    logger.info("Get custodian details by id request received");

    var data = req.data;
    data.id = req.params.id;

    custodianService.getCustodianDetail(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;
