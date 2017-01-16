"use strict";

var app = require("express")();

var moduleName = __filename;
var config = require("config");
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var TradeImportService = require('service/tradeorder/TradeImportService.js');
var TradeImportService = new TradeImportService();
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
 * @api {post} /tradeorder/uploadfile Upload single file
 * @apiName  UploadFileSingleFile
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API upload  single XLS OR XLSX Or CSV file and file have only one header at a time { Account Id Or Account Number, Action, Security, Dollars, Shares } 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/uploadfile
 * 
 * @apiParam {File}         document               Select XLS/XLSX/CSV file here.
 * @apiParam {Boolean}      isPending              pending flag
 * 
 * @apiSuccess {Number}     accountId              The accountId
 * @apiSuccess {String}     accountNumber          The accountNumber
 * @apiSuccess {String}     action        		   Action that is require on trade
 * @apiSuccess {Number}     securityId             Id of the security which Need to Trade
 * @apiSuccess {String}     securityName           Name of the security which Need to Trade
 * @apiSuccess {Number}     dollars          	   Dollar amount to spent while trade
 * @apiSuccess {Number}     shares          	   Shares to be spent while Trade
 * @apiSuccess {Boolean}    isValid                Account Id or Account Number Or Portfolio Id is valid or not
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *       "records": [
 *           
 * 
 *           {
 *              "error": "",
 *              "isValid": true,
 *              "accId": 1,
 *				"accountId": null,
 *              "actionId":1,
 *              "action":"BUY",   
 *				"securityId":1,
 *				"securityName":"APPL",
 *				"dollars":200
 *           },
 *           {
 *              "error": "",
 *              "isValid": true,
 *              "accId": 1,
 *				"accountNumber": 1111,
 *              "actionId":1,
 *              "action":"SELL",   
 *				"securityId":1,
 *				"securityName":"APPL",
 *				"shares":12
 *          }
 *    ]
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
    req.data.isPending = req.body.isPending; 
    TradeImportService.importDocument(req, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/**
 * 
 * @api {post} /tradeorder/uploadTrades Upload Trades
 * @apiName  UploadTrades
 * @apiVersion 1.0.0
 * @apiGroup Trades
 * @apiPermission appuser
 *
 * @apiDescription This API upload trades which are import by xlx or csv file 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/tradeorder/uploadTrades
 * 
 * @apiParam {Number}     accId                  The incremented value of account table
 * @apiParam {Number}     accountId              The accountId
 * @apiParam {String}     accountNumber          The accountNumber
 * @apiParam {String}     action        		 Action that is require on trade
 * @apiParam {String}     actionId        	     Action Id that is require on trade
 * @apiParam {Number}     securityId             Id of the security which Need to Trade
 * @apiParam {String}     securityName           Name of the security which Need to Trade
 * @apiParam {Number}     dollars          	     Dollar amount to spent while trade
 * @apiParam {Number}     shares          	     Shares to be spent while Trade
 * @apiParam {Boolean}    isValid                Account Id or Account Number Or Portfolio Id is valid or not
 * 
 * @apiParamExample {json} Request-Example:
 *    HTTP/1.1 200 OK
 *        [
 *           
 * 
 *           {
 *              "error": "",
 *              "isValid": true,
 *              "accId": 1,
 *				"accountId": null,
 *              "actionId":1,
 *              "action":"BUY",   
 *				"securityId":1,
 *				"securityName":"APPL",
 *				"dollars":200
 *           },
 *           {
 *              "error": "",
 *              "isValid": true,
 *              "accId": 1,
 *				"accountNumber": 1111,
 *              "actionId":1,
 *              "action":"SELL",   
 *				"securityId":1,
 *				"securityName":"APPL",
 *				"shares":12
 *          }
 *    ]
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 Unauthorized
 *     {
 *       "message": "Success"
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
 */
app.post('/uploadTrades', function (req, res) {
    logger.info("uploadTrades request recieved");
    var data = req.data;
    data.trades = req.body;
    TradeImportService.uploadTrades(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;