"use strict";

var app = require("express")();

var moduleName = __filename;
var config = require("config");
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var CommonTradeService = require('service/tradetool/CommonTradeService.js');
var commonTradeService = new CommonTradeService();
var util = require("util");
var mkdirp = require('mkdirp');
var multer = require('multer');
var messages = config.messages;
var responseCode = config.responseCode;
var localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = req.uploadContext;
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
        var fileName = file.originalname;
        return cb(null, fileName);
    }
});

var upload = multer({
    storage: localStorage
});

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

/**
 * 
 * @api {post} /tradetool/uploadfile Upload single file
 * @apiName  UploadFileSingleFile
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 *
 * @apiDescription This API upload  single XLS OR XLSX Or CSV file and file have only one header at a time { Portfolio Id, Account Id Or Account Number } 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradetool/uploadfile
 * 
 * @apiParam {File}         document               Select XLS/XLSX/CSV file here.
 * 
 * @apiSuccess {String}     recordType             The recordType name
 * @apiSuccess {Number}     id                     The  id
 * @apiSuccess {String}     name                   Name of Account or Portfolio
 * @apiSuccess {Number}     accountId              The accountId
 * @apiSuccess {String}     accountNumber          The accountNumber
 * @apiSuccess {Boolean}    isValid                Account Id or Account Number Or Portfolio Id is valid or not
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
     {
        "recordType": "portfolio",
        "records": [
            {
            "id": 1,
            "name": "Demo Portfolio Kate",
            "accountId": null,
            "accountNumber": null,
            "isValid": true
            },
            {
            "id": 3,
            "name": "Test Portfolio 3",
            "accountId": null,
            "accountNumber": null,
            "isValid": true
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
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 */

/**
 * 
 * @api {post} /tradetool/uploadfile?isSleeve={true/false} Upload single file for sleeve
 * @apiName  UploadFileForSleeveSingleFile
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 *
 * @apiDescription This API upload  single XLS OR XLSX Or CSV file and file have only one header at a time { Portfolio Id, Account Id Or Account Number } 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradetool/uploadfile?isSleeve=true
 * 
 * @apiParam {File}         document               Select XLS/XLSX/CSV file here.
 * 
 * @apiSuccess {String}     recordType             The recordType name
 * @apiSuccess {Number}     id                     The  id
 * @apiSuccess {String}     name                   Name of Account or Portfolio
 * @apiSuccess {Number}     accountId              The accountId
 * @apiSuccess {String}     accountNumber          The accountNumber
 * @apiSuccess {Boolean}    isValid                Account Id or Account Number Or Portfolio Id is valid or not
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
     {
        "recordType": "portfolio",
        "records": [
            {
            "id": 1,
            "name": "Demo Portfolio Kate",
            "accountId": null,
            "accountNumber": null,
            "isValid": true
            },
            {
            "id": 3,
            "name": "Test Portfolio 3",
            "accountId": null,
            "accountNumber": null,
            "isValid": true
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
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 */

app.post('/uploadfile', fileServeMiddleware('document', '/tradetool/globalTrades/'), upload.single('document'), function (req, res) {
    logger.info("XLS/XLSX/CSV document upload request received");
    ///  req.data.documentType = "portfolios";
    //var data = req.data;
    if (req.query.isSleeve === "true") {
        req.isSleeve = true;
    } else {
        req.isSleeve = false;
    }
    commonTradeService.importDocument(req, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * 
 * @api {get} /tradetool/tradeside Get trade side list
 * @apiName  GetTradeSideList
 * @apiVersion 1.0.0
 * @apiGroup TradeTool-TradeToTarget
 * @apiPermission appuser
 *
 * @apiDescription This API get trade side list
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradetool/tradeside
 * 
 * 
 * @apiSuccess {Number}     id                     The  id
 * @apiSuccess {String}     name                   The trade side name
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
     [
        {
            "id": 1,
            "name": "Buy"
        },
        {
            "id": 2,
            "name": "Sell"
        },
        {
            "id": 3,
            "name": "Buy/Sell"
        }
     ]
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
app.get('/tradeside', function (req, res) {
    logger.info("Get Trade side request received");
    commonTradeService.getTradeSide(req, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * 
 * @api {get} /tradetool/allowwashsales Get allow wash sales list
 * @apiName  GetAllowWashSalesList
 * @apiVersion 1.0.0
 * @apiGroup TradeTool-TradeToTarget
 * @apiPermission appuser
 *
 * @apiDescription This API get allow wash sales list
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradetool/allowwashsales
 * 
 * 
 * @apiSuccess {Number}     id                     The  id
 * @apiSuccess {String}     name                   The allow wash sales name
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
     [
        {
            "id": 1,
            "name": "Yes"
        },
        {
            "id": 2,
            "name": "No"
        }
    ]
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
app.get('/allowwashsales', function (req, res) {
    logger.info("Get allow wash sales request received");
    commonTradeService.getAllowWashSales(req, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * 
 * @api {get} /tradetool/allowshorttermgains Get allow short term gains list
 * @apiName  GetSllowShortTermGainsList
 * @apiVersion 1.0.0
 * @apiGroup TradeTool-TradeToTarget
 * @apiPermission appuser
 *
 * @apiDescription This API get allow short term gains list
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradetool/allowshorttermgains
 * 
 * 
 * @apiSuccess {Number}     id                     The  id
 * @apiSuccess {String}     name                   The allow short term gains name
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
    [
        {
            "id": 1,
            "name": "Allow"
        },
        {
            "id": 2,
            "name": "Full Position Disallow"
        },
        {
            "id": 3,
            "name": "TaxLot Disallow"
        }
    ]
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
app.get('/allowshorttermgains', function (req, res) {
    logger.info("Get allow short term gains request received");
    commonTradeService.getAllowShortTermGains(req, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @apiIgnore
 * @api {get} /tradetool/modeltypes?portfolioIds={:id}&accountIds={:id}&modelIds={:id} Get model Type list
 * @apiName   GetModelTypeList
 * @apiVersion 1.0.0
 * @apiGroup TradeTool-TradeToTarget
 * @apiPermission appuser
 *
 * @apiDescription This API get model Type list
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradetool/modeltypes?portfolioIds=1
 * 
 * 
 * @apiSuccess {Number}     id                     The  id
 * @apiSuccess {String}     name                   The model Type name
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
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
app.get('/modeltypes', function (req, res) {
    logger.info("Get Model Type For Trades request received");
    var data = req.data;
    if (req.query.modelIds) {
        data.modelIds = req.query.modelIds;
    } else {
        if (req.query.portfolioIds) {
            data.portfolioIds = req.query.portfolioIds;
        } else {
            if (req.query.accountIds) {
                data.accountIds = req.query.accountIds;
            } else {
                return response(null, responseCode.BAD_REQUEST, { "message": messages.badRequest }, res);
            }
        }
    }
    commonTradeService.getModelTypeForTrades(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
module.exports = app;