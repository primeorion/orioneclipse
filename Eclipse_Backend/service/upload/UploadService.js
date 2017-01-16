"use strict";

var moduleName  =   __filename;

var express     =   require('express');
var helper      =   require('helper');
var logger      =   helper.logger(moduleName);
var validate    =   helper.validate;
var app     = express();
var config = require('config');
var logger = require('helper/Logger.js')(moduleName);
var messages = config.messages;
var responseCode = config.responseCode;
var UploadService = function () {};
var localCache = require('service/cache').local;
var UploadDao = require('dao/upload/UploadDao.js');
var uploadDao = new UploadDao();

UploadService.prototype.uploadSmallLogo = function (req, res, cb) {
 var data = req.data;
 var session = localCache.get(data.reqId).session;

 var filePath = req.filesArray;
 var extArray = filePath[0].split('.');
 var fileType = extArray[extArray.length -1];
 var fileName = filePath[0].split('/');
 fileName = fileName[fileName.length -1]

 logger.info("Upload small logo requrest received (uploadLogo())");
 uploadDao.smallLogoUploader(req, res, function(result){
  if(result){
    var signedUrlCache = {};
    var logo = [];
    logo.push({"name" : fileName, "path" : JSON.stringify(req.signedUrls), "type" : fileType});
    signedUrlCache.logo = logo;
    res.locals.signedUrlCache = signedUrlCache;
    return cb(null, responseCode.SUCCESS,null, res);
  }else{
    return cb(responseCode.INTERNAL_SERVER_ERROR,null, res);
  }
});
};

UploadService.prototype.uploadLargeLogo = function (req, res, cb) {
 var data = req.data;
 var session = localCache.get(data.reqId).session;

 var filePath = req.filesArray;
 var extArray = filePath[0].split('.');
 var fileType = extArray[extArray.length -1];
 var fileName = filePath[0].split('/');
 fileName = fileName[fileName.length -1]

 logger.info("Upload large logo requrest received (uploadLogo())");
 uploadDao.smallLogoUploader(req, res, function(result){
  if(result){
    var signedUrlCache = {};
    var logo = [];
    logo.push({"name" : fileName, "path" : JSON.stringify(req.signedUrls), "type" : fileType});
    signedUrlCache.logo = logo;
    res.locals.signedUrlCache = signedUrlCache;
    return cb(null, responseCode.SUCCESS,null, res);
  }else{
    return cb(responseCode.INTERNAL_SERVER_ERROR,null, res);
  }
});
};

UploadService.prototype.uploadDocument = function (req, res, cb) {
 var data = req.data;
 var session = localCache.get(data.reqId).session;
 var filePath = req.filesArray;
 var extArray = filePath[0].split('.');
 var fileType = extArray[extArray.length -1];
 var fileName = filePath[0].split('/');
 fileName = fileName[fileName.length -1]
 logger.info("Upload document requrest received (uploadDocument())");
 uploadDao.documentUploader(req, res, function(err, result){
   if(result){
    var signedUrlCache = {};
    var documents = [];
    documents.push({"name" : fileName, "path" : JSON.stringify(req.signedUrls), "type" : fileType});
    signedUrlCache.document = documents;
    res.locals.signedUrlCache = signedUrlCache;
    return cb(err, responseCode.SUCCESS,messages.documentUploded, res);
  }else{
    return cb(err, responseCode.INTERNAL_SERVER_ERROR,messages.documentUploded,res);
  }
});
};

var modelParser = require('xlsx');
var tempFilePath   = 'uploads/model/1/karams model.xls';

var to_json   = function(req, workbook, resultCallback) {
  var result = {};
  workbook.SheetNames.forEach(function(sheetName) {
    var roa = modelParser.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    req.activeSheet = sheetName;
    if(roa.length > 0){
      result[sheetName] = roa;
    }
    result['activeSheet'] = sheetName;
  });

  return resultCallback(result);
}
var parseFile = function(req, fileJsonObjectCallback){
  var workbook = modelParser.readFile(tempFilePath);
  to_json(req, workbook, function(convertedFileData){
    if(convertedFileData){
     return fileJsonObjectCallback(convertedFileData); 
   }
 });

}

UploadService.prototype.uploadModel = function (req, res, cb) {
  logger.info("Upload model requrest received (uploadModel())");
  //step 0 : Insert file in db and upload to s3
  var data = req.data;
  var session = localCache.get(data.reqId).session;
  var filePath = req.filesArray;
  var extArray = filePath[0].split('.');
  var fileType = extArray[extArray.length -1];
  var fileName = filePath[0].split('/');
  fileName = fileName[fileName.length -1]
  uploadDao.modelUploader(req, res, function(err, result){
   if(result){
    var signedUrlCache = {};
    var models = [];
    models.push({"name" : fileName, "path" : JSON.stringify(req.signedUrls), "type" : fileType});
    signedUrlCache.models = models;
    res.locals.signedUrlCache = signedUrlCache;
    return cb(err, responseCode.SUCCESS,messages.modelUploaded, res);
  }else{
    return cb(err, responseCode.INTERNAL_SERVER_ERROR,messages.modelUploadFailed,res);
  }
});

  /*******************-------------------*********************/
  //step 1 : parse file after validation
  /*parseFile(req, function(data){
    // return cb(JSON.stringify(data));
    return cb(data);
  });*/
  //step 2 : upload parsed file data in table
    /*uploadDao.modelUploader(req, res, function(result){
      if(result){
          cb(true);
      }else{
         cb(false);
      }
    });*/
  };

  module.exports = UploadService;