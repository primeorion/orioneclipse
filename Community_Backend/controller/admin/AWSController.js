"use strict";

var moduleName = __filename;

var app = require("express")();

var S3Service = require('service/aws/S3Service'); 
var response = require('controller/ResponseController.js');
var logger = require("helper").logger(moduleName);


/**@apiIgnore

 * @api {get} /admin/aws/firms Get All Firms From s3 
 * @apiName GetAllFirms
 * @apiVersion 1.0.0
 * @apiGroup aws
 * @apiPermission appuser
 *
 * @apiDescription This API gets category list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/aws/firms
 * 
 * @apiSuccess {String[]}     firms          		List of Firms.                                               
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
			{
			    firms : ['firm1', 'firm2', 'firm3', 'firm4']
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
app.get('/firms', function (req, res) {
	S3Service.getContentInFolder(null, function(err, status, data){
		   return response(err, status, data, res);
	})
});

module.exports = app;