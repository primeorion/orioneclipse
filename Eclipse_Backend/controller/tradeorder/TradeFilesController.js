"use strict";

var app = require("express")();

var moduleName = __filename;
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var helper = require('helper');
var UserMiddleWare = require("middleware/UserMiddleware.js");
var TradeFilesService = require('service/tradeorder/TradeFilesService.js');
var tradeFilesService = new TradeFilesService();

var validate = helper.validate;

var tradeFilesIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}

/** @api {get} /tradeorder/tradefiles?fromDate=MM/DD/YYYY Get Trade File List of date
 * @apiName  GetTradeFilesList.
 * @apiVersion 1.0.0
 * @apiGroup Trade Files
 * @apiPermission appuser
 *
 * @apiDescription This API gets Trade File List for the given date. 
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
 * curl -i http://baseurl/v1/tradeorder/tradefiles?fromDate=11/17/2016
 * 
 * @apiSuccess {Number}     id                      The Trade File id.
 * @apiSuccess {String}     name                    Name of the Trade File.
 * @apiSuccess {String}     format                  Format of the Trade File.
 * @apiSuccess {String}     path                    Path of the Trade File.
 * @apiSuccess {Boolean}    status                  Status of the Trade File (1/0) [Sent/Not Sent].
 * @apiSuccess {String}     URL                     URL to download the Trade File.
 * @apiSuccess {Boolean}    isDeleted               Trade File exist or not into the system.
 * @apiSuccess {Date}       createdOn               Trade File creation date into application.
 * @apiSuccess {String}     createdBy               Full Name of user who created the Trade File into the system.
 * @apiSuccess {Date}       editedOn                Trade File edited date into application.
 * @apiSuccess {String}     editedBy                Full Name of user who edited the Trade File details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
       [
        {
            "id": 3,
            "name": "schwab_block_20161117_033632",
            "format": "block",
            "path": "",
            "status": 0,
            "URL": "https://orioneclipsedata.s3.amazonaws.com/schwab_block_20161117_033632.csv",
            "isDeleted": 0,
            "createdOn": "2016-11-17T10:18:16.000Z",
            "createdBy": "prime@tgi.com",
            "editedOn": "2016-11-17T10:18:23.000Z",
            "editedBy": "prime@tgi.com"
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
 *       "message": "Please Enter a valid date format(MM/DD/YYYY)"
 *     }
 * 
 */
app.get('/', function (req, res) {
    logger.info("Get all Trade Files request received");

    var data = req.data;

    tradeFilesService.getTradeFilesList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /tradeorder/tradefiles/count Get Trade File Count of current date
 * @apiName  GetTradeFilesCount.
 * @apiVersion 1.0.0
 * @apiGroup Trade Files
 * @apiPermission appuser
 *
 * @apiDescription This API gets Trade File Count for the current date. 
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
 * curl -i http://baseurl/v1/tradeorder/tradefiles/count
 * 
 * @apiSuccess {Number}     count           Trade Files Count for current date.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
        {
          "count": 0
        }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 */
app.get('/count', function (req, res) {
    logger.info("Get count of Trade Files request received");

    var data = req.data;

    tradeFilesService.getTradeFilesCount(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {put} /tradeorder/tradefiles/:id/action/sent Update Trade File status to sent
 * @apiName  UpdateTradeFileStatus.
 * @apiVersion 1.0.0
 * @apiGroup Trade Files
 * @apiPermission appuser
 *
 * @apiDescription This API updates Trade File status to sent. 
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
 * curl -i http://baseurl/v1/tradeorder/tradefiles/1/action/sent
 * 
 * @apiSuccess {Number}     id                      The Trade File id.
 * @apiSuccess {String}     name                    Name of the Trade File.
 * @apiSuccess {String}     format                  Format of the Trade File.
 * @apiSuccess {String}     path                    Path of the Trade File.
 * @apiSuccess {Boolean}    status                  Status of the Trade File (1/0) [Sent/Not Sent].
 * @apiSuccess {String}     URL                     URL to download the Trade File.
 * @apiSuccess {Boolean}    isDeleted               Trade File exist or not into the system.
 * @apiSuccess {Date}       createdOn               Trade File creation date into application.
 * @apiSuccess {String}     createdBy               Full Name of user who created the Trade File into the system.
 * @apiSuccess {Date}       editedOn                Trade File edited date into application.
 * @apiSuccess {String}     editedBy                Full Name of user who edited the Trade File details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
        {
            "id": 3,
            "name": "schwab_block_20161117_033632",
            "format": "block",
            "path": "",
            "status": 1,
            "URL": "https://orioneclipsedata.s3.amazonaws.com/schwab_block_20161117_033632.csv",
            "isDeleted": 0,
            "createdOn": "2016-11-17T10:18:16.000Z",
            "createdBy": "prime@tgi.com",
            "editedOn": "2016-11-17T10:18:23.000Z",
            "editedBy": "prime@tgi.com"
        }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 * @apiError Not_Found When Trade File does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Trade File does not exist"
 *     }
 *
 */
app.put('/:id/action/sent', validate({ params: tradeFilesIdSchema }), function (req, res) {
    logger.info("Update Trade Files status request received");

    var data = req.data;
    data.id = req.params.id;
    tradeFilesService.updateTradeFilesStatus(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {delete} /tradeorder/tradefiles/:id Deletes Trade File.
 * @apiName  DeleteTradeFile.
 * @apiVersion 1.0.0
 * @apiGroup Trade Files
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Trade File. 
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
 * curl -i http://baseurl/v1/tradeorder/tradefiles/3
 * 
 * @apiSuccess {Number}     message           Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
        {
          "message": "Trade File deleted successfully"
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
 * @apiError Not_Found When Trade File does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "Trade File does not exist"
 *     }
 * 
 */
app.delete('/:id', validate({ params: tradeFilesIdSchema }), function (req, res) {
    logger.info("Delete Trade Files request received");

    var data = req.data;
    data.id = req.params.id;
    tradeFilesService.deleteTradeFile(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;