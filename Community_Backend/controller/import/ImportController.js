"use strict";

var moduleName = __filename;
var app = require("express")();
var helper = require('helper');
var response = require('controller/ResponseController.js');
var sharedCache = require('service/cache/').shared;
var ImportService = require('service/import/ImportService.js');
var importService = new ImportService();
var logger = helper.logger(moduleName);
var validate = helper.validate;

app.use(require('middleware/DBConnection.js').common); // add common connection cabability in user

var postDataImport = {
    type: 'object',
    properties: {
        inputDir: {
            type: 'string',
            required: true
        },

    }
};
/**@apiIgnore
 * @api {post} /dataimport/action/initiate Import Process Notification 
 * @apiName DataImportNotification
 * @apiVersion 1.0.0
 * @apiGroup Import
 * 
 * @apiDescription This API notify the import process about data file upload on S3  
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
 * curl -i http://baseurl/v1/dataimport/action/initiate
 * 
 * @apiParam {String}       inputDir       AWS S3 path of uploaded data file
  
 * @apiParamExample {json} Request-Example:
 *     {
 *        "inputDir": "Firm Data New/firm1000/2016/July/week28/15_07_2016/"
 *     }
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "Message": "Successfully notified data import startup process."
 *     }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 * @apiError Bad_Request When passed inappropriate request data.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *       "message": "Unable to notify import process, please contact administrator."
 *     }
 */

app.post('/action/initiate/', validate({ body: postDataImport }), function (req, res) {
    logger.info("Data import notificatipon request received");
    var data = req.data;
    data.inputDir = req.body.inputDir;
    importService.dataImport(req.data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

module.exports = app;