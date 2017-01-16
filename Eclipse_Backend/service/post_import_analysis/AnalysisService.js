"use strict";

var moduleName = __filename;
var config = require('config');
var sharedCache = require('service/cache').shared;
var localCache = require('service/cache').local
var messages = config.messages;
var responseCode = config.responseCode;
var constants = config.orionConstants;
var logger = require('helper/Logger')(moduleName);
var response = require('controller/ResponseController');
var privilegeDao = new(require('dao/admin/PrivilegeDao'))();
var analysisDao = new(require('dao/post_import_analysis/AnalysisDao'))();
var Promise = require("bluebird");

var AnalysisService = function() {};

/** 
* Full Analysis
**/
AnalysisService.prototype.fullAnalysis = function(data, cb) {
  logger.info("Full POST import analysis service started");
  analysisDao.fullAnalysis(data)
  .then(function(resp){
    return cb(null, responseCode.SUCCESS, resp);
  })
  .catch(function(error) { 
    return cb(messages.badRequest, responseCode.BAD_REQUEST, error);
  });
}

/** 
* Partial Analysis on updation of (Portfolio, Account, Preference, Model, Price, Security)
* Params
    data = {      
      controller: 'preference' OR 'account' OR 'model' OR 'security' OR 'holding' etc.(NOTE: Make sure it is lowercase always)
      model: 'team' OR 'model' OR 'account' OR 'holding' OR 'portfolio'
      model_id: 55
    }
**/

AnalysisService.prototype.partialAnalysis = function(data, cb) {  
  logger.info("Delta Run analysis started");
  if(data.controller == 'preferences' && (data.model == 'firm' || data.model == 'custodian')){
    var self = this;
    self.fullAnalysis(data, function(err, resp){
      if(err){
        logger.error("Error in delta run import analysis in function AnalysisService.partialAnalysis(). \n Error :" + err);
        return cb(messages.badRequest, responseCode.BAD_REQUEST, err);
      }else{
        return cb(null, responseCode.SUCCESS, resp);
      }
    })
  }else{
    analysisDao.partialAnalysis(data)
    .then(function(resp){
      return cb(null, responseCode.SUCCESS, resp);
    })
    .catch(function(error) {
      logger.error("Error in delta run import analysis in function AnalysisService.partialAnalysis(). \n Error :" + error); 
     return cb(messages.badRequest, responseCode.BAD_REQUEST, error);
    });
  }
  
}

module.exports = AnalysisService;