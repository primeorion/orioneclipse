"use strict";

var moduleName = __filename;
var app = require("express")();
var validate = require('express-jsonschema').validate;
var config = require('config');
var sharedCache = require('service/cache/').shared;
var logger = require("helper/Logger")(moduleName);
var messages = config.messages;
var responseCodes = config.responseCodes;
var response = require('controller/ResponseController');
var analysisService = new(require('service/post_import_analysis/AnalysisService'))();
app.use(require('middleware/DBConnection').common); // add common connection capability in preference


/**
 * @api {get} /postimport/post_import_analysis    Post Import Analysis
 * @apiName Post Import Analysis
 * @apiVersion 1.0.0
 * @apiGroup Analysis
 * @apiPermission appuser
 *
 * @apiDescription This API will start post import analysis and notify user via socket i/o about the status of analysis going on in backend.
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/postimport/post_import_analysis
 *
 *@apiSuccess {Boolean}  success  Specify whether analysis has started. 
 * 
 * @apiSuccessExample Response (example):
 *     HTTP/1.1 200 Success
 *        {
 *          "Analysis Started!!!"
 *        }
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *     "message": "Invalid Authorization Header"
 *      }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *     "message": "Internal Server Error"
 *      }
 *
 */
app.get('/post_import_analysis', function(req, res) {
  logger.info("Start Post Import Analysis");
  analysisService.fullAnalysis(req.data, function(err, status, levels) {
      logger.info("Post Import Analysis Started.");
      return response(err, status, levels, res);
  });
});

module.exports = app;