"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');
var config = require('config');

var response = require('controller/ResponseController.js');
var FirmService = require('service/admin/FirmService.js');
var FirmDao = require('dao/admin/FirmDao.js');

var firmService = new FirmService();
var firmDao = new FirmDao();

var s3 = require('helper/AwsS3.js');
var logger = helper.logger(moduleName);
var s3Properties = config.env.prop.orion.aws.s3;

/**
 * @api {post} /admin/firms/profile Add Firm Profile logo
 * @apiName Add Firm Profile Logo
 * @apiVersion 1.0.0
 * @apiGroup Firms
 * @apiPermission appuser
 *
 * @apiDescription This API adds Profile logo to logged in user's firm. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiParam {File}     logo          Logo file for logged in user's firm.
 * @apiParam {String}     name          Name for logged in user's firm.
 * 
 * @apiParamExample {form-data} Request-Example:
 *     {
 *        "logo":filepath,
          "name":"firm name"
 *    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/admin/firms/profile
 * 
 * @apiSuccess {Number}    id                   The Firm Id.
 * @apiSuccess {String}    name                 Name of the Firm.
 * @apiSuccess {String}    imagePath            Path of firm profile image.
 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
      "id": 66,
      "name": "1020",
      "imagePath": "https://orioneclipsedata.s3.amazonaws.com/dev/images/1/66/man.jpg?AWSAccessKeyId=AKIAJGVS4663WQJQURLQ&Expires=1478601682&Signature=BR7T9iFEoRu3caq7bz2FplRI1wo%3D"
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
 *
 */
app.post('/profile', s3.fileServeMiddleware("FIRM_LOGO",s3Properties.imageRoot), function (req, res) {
    logger.debug("upload firm logo service call started");
      var fileUpload = s3.upload.single('logo');

      fileUpload(req, res, function (err) {
        if(req.file){
            if (err) {
                return cb(err,responseCodes.INTERNAL_SERVER_ERROR);
            }
          var filePath = req.filePath;
          var inputData = req.data;
          s3.getUrl(filePath, function (err, status, data) {
              var tempUrl = data.url;
              inputData.url = tempUrl.split("?")[0];
              inputData.name = req.body.name;
              firmService.saveProfile(inputData,function (err, status, result) {
                  return response(err, status, result, res);
              });
          });  
        }else{
          var inputData = req.data;
          inputData.name = req.body.name;
          firmService.saveProfile(inputData,function (err, status, result) {
              return response(err, status, result, res);
          });
        }
      });
});


/**
 * @api {get} /admin/firms/profile Get Firm Profile
 * @apiName Get Firm Profile
 * @apiVersion 1.0.0
 * @apiGroup Firms
 * @apiPermission appuser
 *
 * @apiDescription This API get Profile of logged in user's firm. 
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
 * curl -i http://baseurl/v1/admin/firms/profile
 * 
 * @apiSuccess {Number}    id                   The Firm Id.
 * @apiSuccess {String}    name                  Name of the Firm.
 * @apiSuccess {String}    imagePath            Path of firm profile image.
 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
      "id": 66,
      "name": "1020",
      "imagePath": "https://orioneclipsedata.s3.amazonaws.com/dev/images/1/66/man.jpg?AWSAccessKeyId=AKIAJGVS4663WQJQURLQ&Expires=1478601682&Signature=BR7T9iFEoRu3caq7bz2FplRI1wo%3D"
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
 *
 */
app.get('/profile',function(req,res){
    logger.info("Get firm profile request received");
    
    var data = req.data;
    firmService.getProfile(data, function (err, status, result) {
        return response(err, status, result, res);
    });
});
 module.exports = app;
