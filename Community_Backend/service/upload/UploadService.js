"use strict";

var moduleName = __filename;

var express = require('express');
var helper = require('helper');
var logger = helper.logger(moduleName);
var validate = helper.validate;
var app = express();
var config = require('config');
var constants = config.orionConstants;

var logger = require('helper/Logger.js')(moduleName);
var messages = config.messages;
var responseCode = config.responseCode;
var UploadService = function () {};
var localCache = require('service/cache').local;
var sharedCache = require('service/cache').shared;

var UploadDao = require('dao/upload/UploadDao.js');
var uploadDao = new UploadDao();
var multer = require('multer');
var multerS3 = require('multer-s3')
var aws = require('aws-sdk')
var util = require('util');
var ModelParser = require('xlsx');
var fs = require('fs');
var moment = require('moment');

var modelService = require('service/community/ModelService.js');
var modelService = new modelService();

var UploadFileUtil = require('service/util/UploadFileUtil.js');
var uploadFileUtil = new UploadFileUtil();

var modelTemplate = 'template/modal/';

var env = config.env.name;
var s3Properties = config.env.prop.orion["s3"];
var _ = require('underscore');
/*s3 related conf*/
aws.config.region = s3Properties.region;
aws.config.update({
  accessKeyId: s3Properties.accessKeyId, //"AKIAJYQJPK7K377QTDXA",
  secretAccessKey: s3Properties.secretAccessKey, // "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"
});

var s3 = new aws.S3();

UploadService.prototype.uploadSmallLogo = function (req, res, cb) {
  var self = this;
  if (req.fileAttributeName != 'small' && req.fileAttributeName != 'user') {
    logger.error("Invalid file attribur name uploadSmallLogo()");
    return cb(messages.invalidFileAttributeName, responseCode.BAD_REQUEST, null, res);
  }
  if (req.file == undefined || req.file == 'undefined') {
    logger.error("File not found uploadSmallLogo()");
    return cb(messages.fileDataNotFound, responseCode.BAD_REQUEST, null, res);
  }
  var myMimeType = req.file.mimetype.split('/');
  if (myMimeType[0] != undefined && myMimeType[0] != 'image') {
    logger.error("Invalid image file uploadSmallLogo()");
    return cb(messages.invalidLogoType, responseCode.BAD_REQUEST, null, res);
  }
  if (req.file.size > 1000000) {
    logger.error("File size is large uploadSmallLogo()");
    return cb(messages.invalidLogoSize, responseCode.BAD_REQUEST, null, res);
  }

  var filePath = req.filesArray;
  var extArray = filePath[0].split('.');
  var fileType = extArray[extArray.length - 1];
  var fileName = filePath[0].split('/');
  fileName = fileName[fileName.length - 1]

  logger.info("Upload small logo request received (uploadLogo())");
  uploadDao.smallLogoUploader(req, res, function (err, data) {
    if (err) {
      return cb(messages.logoUploadFailed, responseCode.INTERNAL_SERVER_ERROR, data, res);
    }
    //todo***************************************** 
    var documentData = {
      documentType: "logo",
      documentName: "small-logo",
      path: req.filesArray[0]
    }
    req.query.url = req.filesArray[0]; //logo will be always in this location.
    self.getSignedUrl(req.headers.authorization.split(' ')[1], documentData, function (err, signedUrl) {
      if (err) {
        return cb(err);
      }
      var responseData = {
        "strategistId": req.params.strategistId,
        "url": signedUrl
      }
      return cb(null, responseCode.SUCCESS, responseData);
    });
    //return cb(err, responseCode.SUCCESS,messages.logoUploaded, res);
  });
};

UploadService.prototype.uploadLargeLogo = function (req, res, cb) {
  var self = this;

  if (req.fileAttributeName != 'large') {
    return cb(messages.invalidFileAttributeName, responseCode.BAD_REQUEST, null, res);
  }
  if (req.file == undefined || req.file == 'undefined') {
    return cb(messages.fileDataNotFound, responseCode.BAD_REQUEST, null, res);
  }
  var myMimeType = req.file.mimetype.split('/');
  if (myMimeType[0] != undefined && myMimeType[0] != 'image') {
    return cb(messages.invalidLogoType, responseCode.BAD_REQUEST, null, res);
  }
  if (req.file.size > 1000000) {
    return cb(messages.invalidLogoSize, responseCode.BAD_REQUEST, null, res);
  }

  var filePath = req.filesArray;
  var extArray = filePath[0].split('.');
  var fileType = extArray[extArray.length - 1];
  var fileName = filePath[0].split('/');
  fileName = fileName[fileName.length - 1]

  logger.info("Upload large logo request received (uploadLogo())");

  uploadDao.largeLogoUploader(req, res, function (err, data) {
    if (err) {
      return cb(messages.logoUploadFailed, responseCode.INTERNAL_SERVER_ERROR, data, res);
    }
    //  var documentData = {
    //    type : "logo",
    //    name : "large-logo"
    //  }
    var documentData = {
      documentType: "logo",
      documentName: "large-logo",
      path: req.filesArray[0]
    }
    req.query.url = req.filesArray[0]; //logo will be always in this location.
    self.getSignedUrl(req.headers.authorization.split(' ')[1], documentData, function (err, signedUrl) {
      var responseData = {
        "strategistId": req.params.strategistId,
        "url": signedUrl
      }
      return cb(null, responseCode.SUCCESS, responseData);
    });
  });
};

UploadService.prototype.uploadDocument = function (req, res, cb) {
  var self = this;
  logger.info("Upload document request received (uploadDocument())");

  if (req.fileAttributeName != 'document') {
    return cb(messages.invalidFileAttributeName, responseCode.BAD_REQUEST, null, res);
  }
  if (req.files.length == 0) {
    return cb(messages.fileDataNotFound, responseCode.BAD_REQUEST, null, res);
  }

  // for(var i=0; i<req.files.length; i++){
  //   if(req.files[i].mimetype != 'application/pdf'){
  //     logger.debug("unexpected file type");
  //     return cb(messages.invalidDocumentType, responseCode.BAD_REQUEST ,null, res);
  //   }
  // }

  var data = req.data;
  var session = localCache.get(data.reqId).session;
  var filePath = req.filesArray;
  var extArray = filePath[0].split('.');
  var fileType = extArray[extArray.length - 1];
  var fileName = filePath[0].split('/');
  fileName = fileName[fileName.length - 1];
  if (fileType != 'pdf') {
    logger.error("unexpected file type");
    return cb(messages.invalidDocumentType, responseCode.BAD_REQUEST, null, res);
  }
  uploadDao.documentUploader(req, res, function (err, data) {
    var insertedDocumentData = data[0];
    if (err) {
      return cb(messages.logoUploadFailed, responseCode.INTERNAL_SERVER_ERROR, data, res);
    }
    var documentData = {
      type: "document",
      name: data[0]['documentName'],
      path: data[0]['path']
    }
    req.query.url = req.filesArray[0]; //logo will be always in this location.
    self.getSignedUrl(req.headers.authorization.split(' ')[1], documentData, function (err, signedUrl) {
      insertedDocumentData['strategistId'] = parseInt(req.params.strategistId);
      insertedDocumentData['url'] = signedUrl ? signedUrl : 'Invalid Signed URL';
      return cb(err, responseCode.SUCCESS, insertedDocumentData);
    });
  });
};

//not used
var to_json = function (req, workbook, resultCallback) {
  var result = {};
  workbook.SheetNames.forEach(function (sheetName) {
    var roa = ModelParser.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
    req.activeSheet = sheetName;
    if (roa.length > 0) {
      result[sheetName] = roa;
    }
    result['activeSheet'] = sheetName;
  });

  return resultCallback(result);
}

UploadService.prototype.importFile = function (req, filePath, cb) {
  /**
   * Step 0 : read file [x]
   * Step 1 : validate file columns [x]
   * ste2 2 : validate file contents [x]
   * step 3 : validate as per business logic. [x]
   */

  //step 0
  var workbook = ModelParser.readFile(filePath);

  headerValidator(workbook, function (err, result) {
    logger.info('Validating uploaded file headings.');
    if (err) {
      logger.error('Error while parsing workbook, headers are no valid.');
      return cb(messages.invalidModelTemplateFormat);
    }
    logger.info('heading validation of imported file Successfully passed.');
    logger.info('Converting file data to readable object --> JSON format');
    parseWorkBookToJson(workbook, function (err, convertedFileData) {
      if (err) {
        logger.error('Error occurred while converting file data to parsable format --> JSON format', err);
        return cb(err);
      }
      logger.info('Imported file successfully converted to readable format.');
      if (convertedFileData) {
        logger.info('Validating imported file for valid contents');

        modelFormatConversion(convertedFileData, function(err, result){
            if(err){
              logger.error('Error occurred while converting parsed file data to model format.');
              return cb(err);
            }
             logger.info("Everything went fine in modelFormatConversion()");

              var errorArray = [];
              var models = result;

              models.forEach(function(model){
                uploadFileUtil.contentValidation(model, function (err, result){
                  if(err){
                    logger.error('Some validation occurred, content validation error log sent to UI');
                    errorArray = errorArray.concat(err);
                  }
                });
              });

              if (errorArray.length > 0) {
                  return cb(errorArray);
              }

             return cb(null, result);
        });
      }
    });
  });
};

function parseWorkBookToJson(workbook, cb) {
  var first_sheet_name = workbook.SheetNames[0];
  var roa = ModelParser.utils.sheet_to_row_object_array(workbook.Sheets[first_sheet_name]);
  var error = {};
  if (roa.length == 0) {
    error.message = "Empty file found.";
    error.error = messages.emptyModel;
    return cb([error], null);
  }
  return cb(null, roa);
}

function headerValidator(workbook, cb) {
  var first_sheet_name = workbook.SheetNames[0];
  /* Get worksheet */
  var worksheet = workbook.Sheets[first_sheet_name];

  /**validate cell sheet headers */
  var fileHeaderArray = [];
  var errorArray = [];
  for (var model in worksheet) {
    logger.debug('module name are ' + worksheet[model].v);
    if (model == "A2") {
      break; //break because we want to read only first row which is header.
    }

    if (model == "!ref") {
      continue;
    }

    if (worksheet[model].v == undefined) {
      errorArray.push({
        "error": "Missing heading in Sheet name : " + first_sheet_name + "on first row"
      });
      continue;
    }
    fileHeaderArray.push(worksheet[model].v);
  }
  var templateHeaders = [
  "Model Name",
  "Target Risk Lower(%)",	
  "Target Risk Upper(%)",
  "Minimum Amount($)",
  "Style",	
  "Advisor Fee(bps)",
  "Weighted Avg. Net Expense($)",
  "Security",
  "Allocation %",
  "Upper Tolerance %",
  "Lower Tolerance%",
  "Current Risk"
  ];
  var invalidOrMissingHeader = _.difference(templateHeaders, fileHeaderArray);
  logger.debug('difference is ____________________________ ' + templateHeaders);
  logger.debug('difference is ____________________________ ' + fileHeaderArray);
  logger.debug('difference is ____________________________ ' + invalidOrMissingHeader);
  if(invalidOrMissingHeader.length > 0){
    return cb(invalidOrMissingHeader);
  }
  if (errorArray.length > 0) {
    return cb(errorArray, null);
  }
  return cb(null, {});
}

/*function contentValidation (json, cb){
  var total = 0;
  var errorLog = [];
  var model = json;
  var securities = model.securities || [];

  //validating that securities should be present.
  if(securities.length == 0){
      errorLog.push({
                  'message': 'No security present in the model'
      });
  }else{   
    for( var i = 0; i < securities.length; i++) {
        if(!('symbol' in securities[i])) {
           errorLog.push({message: "No symbol for the " + securities[i] + " security found."});              
        }
     }

    if( errorLog.length > 0) {
        return cb(errorLog, null);
    }
    var data = securities.sort(function (a, b) {
    var predecessor = a['symbol'].toUpperCase();
    var successor = b['symbol'].toUpperCase();
    if (predecessor > successor) {
      return 1;
    }
    if (predecessor < successor) {
      return -1;
    }
    return 0;
   });
   securities = data;
  }

  //logger.info("the value of securities is:", securities);

  if( model.targetRiskLower != undefined) {
  if( isNaN(model.targetRiskLower) ) {
      errorLog.push({
                  'message': 'Target Risk Lower should be a number. Provided value is: ' + model.targetRiskLower
      });
  }else {
      if( parseFloat(model.targetRiskLower) > 100 || parseFloat(model.targetRiskLower) < 0) {
        errorLog.push({
                  'message': 'Target Risk Lower % should be a number between 0 and 100. Provided value is: ' + model.targetRiskLower
        });          
      }
  }
  }else{
      errorLog.push({
                  'message': 'Target Risk Lower should have some value.'
      });
  }
    
    
  if( model.targetRiskUpper != undefined) {
  if( isNaN(model.targetRiskUpper) ) {
      errorLog.push({
                  'message': 'Target Risk Upper should be a number. Provided value is: ' + model.targetRiskUpper
      });  
  }else{
      if( parseFloat(model.targetRiskUpper) > 100 || parseFloat(model.targetRiskUpper) < 0) {
        errorLog.push({
                  'message': 'Target Risk Upper % should be a number between 0 and 100. Provided value is: ' + model.targetRiskUpper
        });          
      }
  }
  }else {
          errorLog.push({
                  'message': 'Target Risk Upper should have some value.'
          });
  }

  if( model.minimumAmount != undefined) {
 if( isNaN(model.minimumAmount) ) {
      errorLog.push({
                  'message': 'Minimum amount should be a number. Provided value is: ' + model.minimumAmount
      });  
  }else{
      if(parseFloat(model.minimumAmount) < 0) {
        errorLog.push({
                  'message': 'Minimum Amount should be a positive number. Provided value is: ' + model.minimumAmount
        });          
      }
  }
  }else {
          errorLog.push({
                  'message': 'Minimum Amount should have some value.'
          });
  }

  if( model.currentRisk != undefined) {
  if( isNaN(model.currentRisk) ) {
       errorLog.push({
                   'message': 'Current risk should be a number. Provided value is: ' + model.currentRisk
       });    
  }else{
      if(parseFloat(model.currentRisk) < 0) {
        errorLog.push({
                  'message': 'Current Risk should be a positive number. Provided value is: ' + model.currentRisk
        });          
      }
  }
    }else {
          errorLog.push({
                  'message': 'Current Risk should have some value.'
          });
    }

  if( model.advisorFee != undefined) {
    if( isNaN(model.advisorFee) ) {
        errorLog.push({
                    'message': 'Advisor fees should be a number. Provided value is: ' + model.advisorFee
        });    
   }else{
        if(parseFloat(model.advisorFee) < 0) {
          errorLog.push({
                    'message': 'Advisor Fees should be a positive number. Provided value is: ' + model.advisorFee
          });          
        }
    }
  }else {
            errorLog.push({
                  'message': 'Advisor Fees should have some value.'
          });
  }

  if( model.weightedAvgNetExpense != undefined) {
     if( isNaN(model.weightedAvgNetExpense) ) {
        errorLog.push({
                    'message': 'Weighted Average net expanse should be a number. Provided value is:' + model.weightedAvgNetExpense
        });    
   }else{
        if(parseFloat(model.weightedAvgNetExpense) < 0) {
          errorLog.push({
                    'message': 'Weighted Avg Net Expense should be a positive number. Provided value is: ' + model.weightedAvgNetExpense
          });          
        }
    }
  }else {
            errorLog.push({
                    'message': 'Weighted Avg Net Expense should have some value.'
            });
  }
    
  var flag =0;

  for(var i = 0; i < securities.length; i++){
    // logger.info("security name is:", model.securities[i].security);
      
     if( securities[i].symbol == "CCASH") {
         flag = 1;
           if('allocation' in securities[i]) {
              if( isNaN(securities[i].allocation) ) {
                    errorLog.push({
                      'message': 'Security allocation % expanse should be a number.' + securities[i].allocation + ' found.'
                    });        
              }
              else {
                  if( parseFloat(securities[i].allocation) > 100 || parseFloat(securities[i].allocation) < 1) {
                    errorLog.push({
                              'message': 'Allocation % should be a number between 1 and 100 for CUSTODIAL_CASH. Provided value is: ' + securities[i].allocation
                    });          
                  }
                    total += parseInt(securities[i].allocation);
              }  
          }
         continue;
     }

     if( (i!= securities.length - 1) && (securities.length > 1) && (securities[i].symbol == securities[i + 1].symbol) ) {
      // logger.info("The security name has been repeated.");
       errorLog.push({
                  'message': 'Duplicate security name found.' + securities[i].symbol + ' should != ' + securities[i + 1].symbol
      });
     }
     
     if( 'upperTolerancePercent' in securities[i]) {
             if( isNaN(securities[i].upperTolerancePercent) ) {
                 errorLog.push({
                    'message': 'Upper tolerance % expanse should be a number.' + securities[i].upperTolerancePercent + ' found.'
                });      
             }else{
              if( parseFloat(securities[i].upperTolerancePercent) > 100 || parseFloat(securities[i].upperTolerancePercent) < 0) {
                errorLog.push({
                          'message': 'Upper Tolernace % should be a number between 0 and 100. Provided value is: ' + securities[i].upperTolerancePercent
                });          
              }
            }
     }else {
         errorLog.push({
                          'message': 'upperTolerancePercent field missing from ' + securities[i]
                });
     }
      
    if('lowerTolerancePercent' in securities[i] ) {
    if( isNaN(securities[i].lowerTolerancePercent) ) {
         errorLog.push({
            'message': 'Lower tolerance % expanse should be a number.' + securities[i].lowerTolerancePercent
        });      
     }else{
      if( parseFloat(securities[i].lowerTolerancePercent) > 100 || parseFloat(securities[i].lowerTolerancePercent) < 0) {
        errorLog.push({
                  'message': 'Target Risk Upper % should be a number between 0 and 100. Provided value is: ' + securities[i].lowerTolerancePercent
        });          
      }
    }
    }else {
                errorLog.push({
                          'message': 'lowerTolerancePercent field missing from ' + securities[i]
                }); 
    }

     if('allocation' in securities[i]) {
          if( isNaN(securities[i].allocation) ) {
                errorLog.push({
                  'message': 'Security allocation % expanse should be a number.' + securities[i].allocation
                });        
          }
          else {
              if( parseFloat(securities[i].allocation) > 100 || parseFloat(securities[i].allocation) < 0) {
                errorLog.push({
                          'message': 'Allocation % should be a number between 0 and 100. Provided value is: ' + securities[i].allocation
                });          
              }
                total += parseInt(securities[i].allocation);
          }  
     }
     else if('Allocation %' in securities[i]){
             if( isNaN(securities[i]['Allocation %']) ) {
                 errorLog.push({
                  'message': 'Security allocation % expanse should be a number.' + securities[i]['Allocation %']
                });        
             }
             else {
               if( parseFloat(securities[i]['Allocation %']) > 100 || parseFloat(securities[i]['Allocation %']) < 0) {
                errorLog.push({
                          'message': 'Allocation % should be a number between 0 and 100. Provided value is: ' + securities[i].allocation
                });          
              }
                total += parseInt(securities[i]['Allocation %']);
             }
     }
     else{
      errorLog.push({
                  'message': 'Allocation percentage missing for the security' + securities[i].security + ' for model ' + model.name
      });
   //   return cb(errorLog, null);
     }

  }

  if(total != 100 && securities.length != 0){
     errorLog.push({
                  'message': 'Allocation percentage not equal to 100. It is ' + total + ' in model ' + model.name
      });
    //  return cb(errorLog, null);
  }

  if( flag == 0) {
      errorLog.push({
                  'message': 'CUSTODIAL_CASH security found missing for model ' + model.name 
      });
  }
    
  model.allocationPercent = total;

    if (errorLog.length > 0) {
      return cb(errorLog, null);
    }

  return cb(null, model);
}*/

function contentValidator (modelJson, cb) {
  var errorLog = [];

  //todo : add business logic here
  //sorting row by model names
  var data = modelJson.sort(function (a, b) {
    var predecessor = a['Model Name'].toUpperCase();
    var successor = b['Model Name'].toUpperCase();
    if (predecessor > successor) {
      return 1;
    }
    if (predecessor < successor) {
      return -1;
    }
    return 0;
  });

  var securityTarget = 0;
  var models = {};
  for (var i = 0; i < data.length; i++) {
    var previousRow = data[i];
    var currentRow = data[i + 1];

    if (data.length == 1) {
      currentRow = data[i];
      securityTarget += parseInt(currentRow['Allocation %']);
      models[currentRow['Model Name']] = {
        'modelName': currentRow['Model Name'],
        'allocationPercent': currentRow['Allocation %'],
        'targetRiskLower': currentRow['Target Risk Lower(%)'],
        'targetRiskUpper': currentRow['Target Risk Upper(%)'],
        'minimumAmount': currentRow['Minimum Amount($)'],
        'style': currentRow['Style'],
        'advisorFee': currentRow['Advisor Fee(bps)'],
        'weightedAvgNetExpense': currentRow['Weighted Avg. Net Expense($)'],
        'security': currentRow['Security'],
        'upperTolerancePercent': currentRow['Upper Tolerance %'],
        'lowerTolerancePercent': currentRow['Lower Tolerance%']
      }
      continue;
    }

    if (currentRow == undefined) {
      continue;
    }

    //case multiple security exists
    if (currentRow['Model Name'] == previousRow['Model Name']) {
      //style validator
      if (currentRow['Style'] != previousRow['Style']) {
        errorLog.push({
          'message': 'Style does not match',
          'data': currentRow['Model Name'] + ' & ' + previousRow['Model Name'],
          'error': currentRow['Style'] + ' < > ' + previousRow['Style']
        });
      }

      //security name validator
      if (currentRow['Security'] == previousRow['Security']) {
        errorLog.push({
          'message': 'Duplicate ticker not allowed for same security.',
          'data': currentRow['Model Name'] + ' & ' + previousRow['Model Name'],
          'error': currentRow['Security'] + ' == ' + previousRow['Security']
        });
      }

      //security name validator
      if (parseInt(currentRow['Target Risk Lower(%)']) != parseInt(previousRow['Target Risk Lower(%)'])) {
        errorLog.push({
          'message': 'Target Risk Lower(%) does not match',
          'data': currentRow['Model Name'] + ' & ' + previousRow['Model Name'],
          'error': currentRow['Target Risk Lower(%)'] + ' < > ' + previousRow['Target Risk Lower(%)']
        });
      }

      //Weighted Avg. Net Expense($) number validation
      if (isNaN(currentRow['Weighted Avg. Net Expense($)']) || isNaN(previousRow['Weighted Avg. Net Expense($)'])) {
        errorLog.push({
          'message': 'Weighted Avg. Net Expense($) value must be a number.',
          'data': currentRow['Model Name'] + ' & ' + previousRow['Model Name'],
          'error': currentRow['Weighted Avg. Net Expense($)']
        });
      }

      if (securityTarget == 0) {
        securityTarget += parseInt(currentRow['Allocation %']) + parseInt(previousRow['Allocation %']);
      } else {
        securityTarget += parseInt(currentRow['Allocation %']);
      }
      models[currentRow['Model Name']] = {
        'modelName': currentRow['Model Name'],
        'allocationPercent': securityTarget,
        'targetRiskLower': currentRow['Target Risk Lower(%)'],
        'targetRiskUpper': currentRow['Target Risk Upper(%)'],
        'minimumAmount': currentRow['Minimum Amount($)'],
        'style': currentRow['Style'],
        'advisorFee': currentRow['Advisor Fee(bps)'],
        'weightedAvgNetExpense': currentRow['Weighted Avg. Net Expense($)'],
        'security': currentRow['Security'],
        'upperTolerancePercent': currentRow['Upper Tolerance %'],
        'lowerTolerancePercent': currentRow['Lower Tolerance%']
      }
      continue;
    } else {
      securityTarget = 0;
    }

    if ((currentRow['Model Name'] != previousRow['Model Name']) && (data.length == 2)) {
      securityTarget = parseInt(previousRow['Allocation %']);
      models[previousRow['Model Name']] = {
        'modelName': previousRow['Model Name'],
        'allocationPercent': previousRow['Allocation %'],
        'targetRiskLower': previousRow['Target Risk Lower(%)'],
        'targetRiskUpper': previousRow['Target Risk Upper(%)'],
        'minimumAmount': previousRow['Minimum Amount($)'],
        'style': previousRow['Style'],
        'advisorFee': previousRow['Advisor Fee(bps)'],
        'weightedAvgNetExpense': previousRow['Weighted Avg. Net Expense($)'],
        'security': previousRow['Security'],
        'upperTolerancePercent': previousRow['Upper Tolerance %'],
        'lowerTolerancePercent': previousRow['Lower Tolerance%']
      }

      models[currentRow['Model Name']] = {
        'modelName': currentRow['Model Name'],
        'allocationPercent': currentRow['Allocation %'],
        'targetRiskLower': currentRow['Target Risk Lower(%)'],
        'targetRiskUpper': currentRow['Target Risk Upper(%)'],
        'minimumAmount': currentRow['Minimum Amount($)'],
        'style': currentRow['Style'],
        'advisorFee': currentRow['Advisor Fee(bps)'],
        'weightedAvgNetExpense': currentRow['Weighted Avg. Net Expense($)'],
        'security': currentRow['Security'],
        'upperTolerancePercent': currentRow['Upper Tolerance %'],
        'lowerTolerancePercent': currentRow['Lower Tolerance%']
      }
      continue;
    }

    if (currentRow['Model Name'] != previousRow['Model Name']) {
      if (models[previousRow['Model Name']] == undefined) {
        models[previousRow['Model Name']] = {
          'modelName': previousRow['Model Name'],
          'allocationPercent': parseInt(previousRow['Allocation %']),
          'targetRiskLower': previousRow['Target Risk Lower(%)'],
          'targetRiskUpper': previousRow['Target Risk Upper(%)'],
          'minimumAmount': previousRow['Minimum Amount($)'],
          'style': previousRow['Style'],
          'advisorFee': previousRow['Advisor Fee(bps)'],
          'weightedAvgNetExpense': previousRow['Weighted Avg. Net Expense($)'],
          'security': previousRow['Security'],
          'upperTolerancePercent': previousRow['Upper Tolerance %'],
          'lowerTolerancePercent': previousRow['Lower Tolerance%']
        }
      }

      securityTarget = parseInt(currentRow['Allocation %']);
      models[currentRow['Model Name']] = {
        'modelName': currentRow['Model Name'],
        'allocationPercent': securityTarget,
        'targetRiskLower': currentRow['Target Risk Lower(%)'],
        'targetRiskUpper': currentRow['Target Risk Upper(%)'],
        'minimumAmount': currentRow['Minimum Amount($)'],
        'style': currentRow['Style'],
        'advisorFee': currentRow['Advisor Fee(bps)'],
        'weightedAvgNetExpense': currentRow['Weighted Avg. Net Expense($)'],
        'security': currentRow['Security'],
        'upperTolerancePercent': currentRow['Upper Tolerance %'],
        'lowerTolerancePercent': currentRow['Lower Tolerance%']
      }
      continue;
    }
  }

  //check populated data
  //todo : apply business login
  var keySet = Object.keys(models);
  for (var i = 0; i < keySet.length; i++) {
    var key = keySet[i];
    if (models[key] != undefined) {
      var model = models[key];
      if (model.allocationPercent != 100) {
        errorLog.push({
          'message': 'Allocation is not equal to 100',
          'security': model.modelName,
          'error': model.allocationPercent
        });
      }
    }
  }

  var contentValidationResult = {
    'models': models,
    'securities': data
  }

  if (errorLog.length > 0) {
    return cb(errorLog, null);
  } else {
    return cb(null, contentValidationResult);
  }
}

function  modelFormatPostConversion (sourceData, cb){
  return cb(null, sourceData);
 /* var error;

  var models = {};
  var modelName = sourceData.modelName;
  var key = modelName;
  var models = {
     "models": {}
  }
  models.models[key] = sourceData;
  return cb(null, models);*/
}

function modelFormatConversion (sourceData, cb) {
  logger.debug('sourceData is  ' + JSON.stringify(sourceData));
  var model = {};
  var models = [];
  var errorLog = [];
  for(var i = 0; i < sourceData.length; i++){
    var row = sourceData[i];
    var oldData = model[row['Model Name']];
    if(oldData){
      verifyData (oldData, row, function (err, result){
        if (err) {
          logger.debug('error is ' + JSON.stringify(err));
          errorLog.push(err);
        }
        var security = {
          "symbol": row['Security'],
          "allocation": row['Allocation %'],
          "upperTolerancePercent": row['Upper Tolerance %'],
          "lowerTolerancePercent": row['Lower Tolerance%']
        }
        oldData.allocation += parseInt(row['Allocation %']);
        oldData.securities.push(security);
        model[row['Model Name']] = oldData;
        for(var i=0; i<models.length; i++){
          logger.debug ('model mod is ' + models[i]);
          if(models[i].name == model[row['Model Name']]){
            models[i] = model;
          }
        }
      });
    }else{
      var security = {
        "symbol": row['Security'],
        "allocation": row['Allocation %'],
        "upperTolerancePercent": row['Upper Tolerance %'],
        "lowerTolerancePercent": row['Lower Tolerance%']
      }

      var securities = [];
      securities.push(security);
      var modelData = {
        "allocation" : parseInt(row['Allocation %']),
        "securities" : securities,
        "name": row['Model Name'],
        "targetRiskLower": row['Target Risk Lower(%)'],
        "targetRiskUpper": row['Target Risk Upper(%)'],
        "minimumAmount": row['Minimum Amount($)'],
        "currentRisk": row['Current Risk'],
        "advisorFee": row['Advisor Fee(bps)'],
        "style": row['Style'],
        "weightedAvgNetExpense":row['Weighted Avg. Net Expense($)'] 
      };
      model[row['Model Name']] = modelData;
      models.push(modelData);
    }
  }

  if(errorLog && errorLog.length > 0){
    return cb (errorLog);
  }else{
    return cb (null, models);
  }
}

function verifyData (oldRow, newRow, cb){
  if (!oldRow){
    return null;
  }
  var errorLog = {};
  if ((oldRow['targetRiskLower']) != (newRow['Target Risk Lower(%)'])) {
    errorLog = {
      'message' : 'Target Risk Lower(%) does not match in ' + oldRow['targetRiskLower'] + ' < > ' + newRow['Target Risk Lower(%)'] + ' for model '+ oldRow['name']
    }
    /*errorLog.push({
      'message': 'Target Risk Lower(%) does not match in ' + oldRow['targetRiskLower'] + ' < > ' + newRow['Target Risk Lower(%)']
    });*/
    return cb(errorLog);
  }

  //target risk upper percentage validator
  if ((oldRow['targetRiskUpper']) != (newRow['Target Risk Upper(%)'])) {
    errorLog = {
      'message' : 'Target Risk Upper(%) does not match in ' + oldRow['targetRiskUpper'] + ' < > ' + newRow['Target Risk Upper(%)'] + ' for model '+ oldRow['name']
    }
    return cb(errorLog);
    /*errorLog.push({
      'message': 'Target Risk Upper(%) does not match in ' + oldRow['targetRiskUpper'] + ' < > ' + newRow['Target Risk Upper(%)']
    });*/
  }

  //minimum amount validator
  if ((oldRow['minimumAmount']) != (newRow['Minimum Amount($)'])) {
     errorLog = {
      'message' : 'Minimum Amount($) does not match in ' + oldRow['minimumAmount'] + ' < > ' + newRow['Minimum Amount($)']  + ' for model '+ oldRow['name']
    }
    return cb(errorLog);
    /*errorLog.push({
      'message': 'Minimum Amount($) does not match in ' + oldRow['minimumAmount'] + ' < > ' + newRow['Minimum Amount($)'] 
    });*/
  }

  //Advisor fees validator
  if ((oldRow['advisorFee']) != (newRow['Advisor Fee(bps)'])) {
     errorLog = {
      'message' : 'Advisor Fee(bps) does not match in ' + oldRow['advisorFee'] + ' < > ' + newRow['Advisor Fee(bps)']  + ' for model '+ oldRow['name']
    }
    return cb(errorLog);
    /*errorLog.push({
      'message': 'Advisor Fee(bps) does not match in ' + oldRow['advisorFee'] + ' < > ' + newRow['Advisor Fee(bps)'] 
    });*/
  }

 //Current Rsik validator
 if ((oldRow['currentRisk']) != (newRow['Current Risk'])) {
   errorLog = {
      'message' : 'Current Risk does not match in ' + oldRow['currentRisk'] + ' < > ' + newRow['Current Risk']  + ' for model '+ oldRow['name']
    }
    return cb(errorLog);
    /*errorLog.push({
      'message': 'Current Risk does not match in ' + oldRow['currentRisk'] + ' < > ' + newRow['Current Risk'] 
    });*/
  }

  //Weighted Avg. Net Expense($) equality validation
  if ((oldRow['weightedAvgNetExpense']) != (newRow['Weighted Avg. Net Expense($)'])) {
     errorLog = {
      'message' : 'Weighted Avg. Net Expense($) does not match in ' + oldRow['weightedAvgNetExpense'] + ' < > ' + newRow['Weighted Avg. Net Expense($)']  + ' for model '+ oldRow['name']
    }
    return cb(errorLog);
    /*errorLog.push({
      'message': 'Weighted Avg. Net Expense($) does not match in ' + oldRow['weightedAvgNetExpense'] + ' < > ' + newRow['Weighted Avg. Net Expense($)'] 
    });*/
  }/*

  if (securityTarget == 0) {
    securityTarget += parseInt(oldRow['Allocation %']) + parseInt(newRow['Allocation %']);
  } else {
    securityTarget += parseInt(oldRow['Allocation %']);
  }*/
  return cb(null);
}

function createLocalFileMiddleware(req, res, cb) {
  var filePath = req.filesArray;
  var extArray = filePath[0].split('.');
  var fileName = filePath[0].split('/');
  fileName = fileName[fileName.length - 1];
  var tempFileName = req.data.id + '-' + new Date().getTime() + '-' + fileName;
  var params = {
    Bucket: s3Properties.bucket,
    Key: filePath[0]
  };
  var tempModelPath = modelTemplate + tempFileName;
  var file = fs.createWriteStream(tempModelPath);
  s3.getObject(params)
    .on('httpData', function (chunk) {
      file.write(chunk);
    }).
  on('httpDone', function () {
    file.end();
    return cb(null, tempModelPath);
  }).
  on('httpError', function (err) {
    return cb(err, null);
  }).
  send();
}

UploadService.prototype.postModelForForm = function(req, res, cb){
  var model = req.body;
  uploadFileUtil.contentValidation(model, function (err, res){
    if(err){
      logger.error('Error occurred while converting parsed file data to model format.' + JSON.stringify(err));
      return cb(null, responseCode.UNPROCESSABLE, err);
    }
    modelService.createModelUsingForm(req, function (err,statusCode,status,data){
        if(err){
          return cb(err, statusCode, status);
        }
        if(statusCode == 'DUPLICATE_ENTRY'){
          return cb(null, responseCode.UNPROCESSABLE, data);
        } else if( statusCode == 'MISSING SYMBOL' ) {
          return cb(null, responseCode.NOT_FOUND, data);
        }
        return cb(null, responseCode.SUCCESS, data);
    });
  });
};

UploadService.prototype.uploadModel = function (req, res, cb) {
  var self = this;
  logger.info("Model import Service received a call (uploadModel())");
  if (req.fileAttributeName != 'model') {
    return cb(messages.invalidFileAttributeName, responseCode.BAD_REQUEST);
  }
  if (req.file == undefined) {
    return cb(messages.fileDataNotFound, responseCode.BAD_REQUEST);
  }
  var timeStamp = moment().format();
  var data = req.data;
  var session = localCache.get(data.reqId).session;
  var fileName = req.file.originalname;
  var fileNameArray = fileName.split('.');
  var fileType = fileNameArray[fileNameArray.length - 1];
  var fileLocation = req.file.path;
  var s3path = s3Properties.root + req.params.strategistId + '/' + req.file.fieldname + '/' + timeStamp + '/' + req.file.originalname;
  req.file.s3path = s3path; // set path in request for dao
  if (fileType != 'xls' && fileType != 'xlsx') {
    return cb(messages.invalidModelType, responseCode.BAD_REQUEST);
  }
  //parse file start
    self.importFile(req, fileLocation, function (err, result) {
       if(err == messages.invalidModelTemplateFormat){
         return cb(err, responseCode.BAD_REQUEST);
       }
      var finalParsingResult = result;
      if (err) {
        //delete uploaded file on local 
        fs.unlinkSync(fileLocation);
        logger.error('error occurred while parsing file.', err);
        return cb(null,responseCode.UNPROCESSABLE, err);
      } else {
           //1. insert file entry in db
        uploadDao.modelUploader(req, res, function (err, data) {
          if (err) {
            //delete uploaded file on local 
            fs.unlinkSync(fileLocation);
            logger.info('error occurred while uploading model using file import '+err);
            return cb(messages.logoUploadFailed, responseCode.INTERNAL_SERVER_ERROR);
          }
          //upload to s3 here and return uploaded response to ui
            var fileData = fs.createReadStream(fileLocation);
            var signedUrlExpireTime = constants.TOKEN_EXPIRES_IN;
            var params = {
              Bucket: s3Properties.bucket,
              Key: req.file.s3path,
              Expires: signedUrlExpireTime,
              Body: fileData
            };
            s3.upload(params, function(err, data) {
              if (err) {
                logger.error("Error uploading data: ", err);
              } else {
                logger.info("Successfully uploaded to s3 : "+JSON.stringify(data));
                 modelService.createModelUsingImport(req, res, finalParsingResult, function (err,statusCode,data){
                    if(err){
                      return cb(err);
                    }
                    return cb(null, statusCode, data);
                });

              }
            });
          //s3 upload ends
        });
        //s3 upload ends
      //});
    }
  });
};

UploadService.prototype.getSignedUrl = function (token, documentData, cb) {
  var self = this;
  self.createSignedURL(token, documentData, function (err, newSignedURL) {
    cb(err, newSignedURL);
  });
}

UploadService.prototype.createSignedURL = function (token, documentData, cb) {
  var urlToSign = documentData.path;
  var signedUrlExpireTime = constants.TOKEN_EXPIRES_IN;
  var params = {
    Bucket: s3Properties.bucket,
    Key: urlToSign,
    Expires: signedUrlExpireTime
  };
  s3.getSignedUrl('getObject', params, function (err, url) {
    return cb(err, url);
  });
}

UploadService.prototype.getModelTemplate = function (req, res, cb) {
  var self = this;
  logger.info("Get template call reached in service getModelTemplate()");
  var template = '';
  logger.info("Sign in url called");
  if (constants.template == undefined || constants.template.model == undefined) {
    logger.error("Failed to received template location while processing model template signing.");
    return cb(responseCode.INTERNAL_SERVER_ERROR, messages.urlSignatureCreationFailed, null);
  }
  template = constants.template.model;
  var signedUrlExpireTime = constants.TOKEN_EXPIRES_IN;
  var params = {
    Bucket: s3Properties.bucket,
    Key: template,
    Expires: signedUrlExpireTime
  };
  var signedModelTemplateUrl = '';
  try {
    signedModelTemplateUrl = s3.getSignedUrl('getObject', params);
  } catch (exception) {
    logger.error("Failed to sign template url");
    return cb(responseCode.INTERNAL_SERVER_ERROR, messages.urlSignatureCreationFailed, null);
  }
  logger.info("Sign in url created.")

  // if (req.params.strategistId == undefined) {
  //   logger.error("Strategist not found.");
  //   return cb(responseCode.INTERNAL_SERVER_ERROR, messages.urlSignatureCreationFailed, null);
  // }

  var responseData = {
    "strategistId": req.params.strategistId,
    "url": signedModelTemplateUrl
  }
  return cb(null, responseCode.SUCCESS, responseData)
};

UploadService.prototype.verifyDocument = function (req, res, cb) {
  uploadDao.verifyDocument(req, res, function (err, data) {
    if (err) {
      return cb(err);
    }
    if (data.length == 0) {
      return cb(null, responseCode.SUCCESS, messages.documentNotInDb, null);
    } else {
      return cb(null, responseCode.DUPLICATE_ENTRY, messages.documentAlreadyExists, data);
    }

  });
}

UploadService.prototype.deleteDocument = function (req, res, cb) {
    uploadDao.deleteDocument(req, res, function (err, data) {
        if (err) {
          return cb(err);
        }
        logger.error("the result is :" + JSON.stringify(data));
        if(data.affectedRows == 0 && data.affectedRows != undefined){
          return cb(messages.nonExistingDocument, responseCode.NOT_FOUND);
        }
        if(data['affectedRows'] == 1 && data['changedRows'] == 1 ){
        logger.info("document successfully deleted.");
        return cb(null, responseCode.SUCCESS, {"message" : messages.documentDeleted});  
       }
       if(data['affectedRows'] == 1 && data['changedRows'] == 0 ){
        logger.info("document is already deleted.");
        return cb(messages.documentAlreadyDeleted, responseCode.DUPLICATE_ENTRY);
       }
        return cb (null, responseCode.SUCCESS, {'message' :messages.documentDeleted});
      });
}

UploadService.prototype.check = function(req, cb){
   if( req.files && req.files.length > 0) {
     return cb(null, responseCode.SUCCESS, null);
   }else  {
     return cb(messages.fileDataNotFound, responseCode.BAD_REQUEST, null);
   }
};


module.exports = UploadService;