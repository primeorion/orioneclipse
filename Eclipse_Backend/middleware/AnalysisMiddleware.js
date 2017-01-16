"use strict";

var moduleName = __filename;
var config = require('config');

var responseController = require('controller/ResponseController.js');
var logger = require("helper/Logger.js")(moduleName);

var constants = config.orionConstants;
var messages = config.messages;
var responseCodes = config.responseCodes;
var analysisService = new(require('service/post_import_analysis/AnalysisService'))();

module.exports.post_import_analysis = function(req, res, next){  
  res.on('finish', function(){
    try{
      logger.info("Triggered Analysis Middleware from URL: ", req.originalUrl);
      if(res.statusCode < 210){
        var data = {req: req}, call_service = true, full_analysis = false;
        data["url"] = req.originalUrl;
        data["controller"] = req.baseUrl.split("/")[2].toLowerCase();
        data["reqId"] = req.data.reqId;
        if(data.controller == 'preference'){
          data["model"] = req.body.level.toLowerCase();
          data["model_id"] = req.body.id;          
          if(data.model == "firm" || data.model == "custodian")
            full_analysis = true;  
        }
        else if(data.controller == 'account'){
          data["model"] = 'account';
          data["model_id"] = req.data.accountId;
        }
        else if(data.controller == 'portfolio'){
          data["model"] = 'portfolio';
          data["model_id"] = req.data.id || req.url.split("/")[1];
        }  
        else if(data.controller == 'security'){
          data["model"] = 'security';
          data["model_id"] = req.data.id;
        }
        else if(data.controller == 'modeling'){
          data["model"] = 'model';
          data["model_id"] = req.data.id;
        }else
          call_service = false;
        if(call_service && full_analysis)
          analysisService.fullAnalysis(data, function(err, resp){});
        else if(call_service && !full_analysis)
          analysisService.partialAnalysis(data, function(err, resp){});
      } 
    }catch(err){
      logger.error("Error in Analysis Middleware. \n Error :" + err);      
    }      
  });
  next();  
}