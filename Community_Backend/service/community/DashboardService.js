"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var _ = require('underscore');
var messages = config.messages;
var responseCode = config.responseCode;
var StrategistDao = require('dao/community/StrategistDao.js');
var DashboardDao = require ('dao/community/DashboardDao.js');
var dashboardDao = new DashboardDao(); 
var strategistDao = new StrategistDao();
var DashboardDao = require('dao/community/DashboardDao.js');
var dashboardDao = new DashboardDao();
var DashboardConverter = require('converter/community/DashboardConverter.js');
var dashboardConverter = new DashboardConverter();
var moment = require('moment');
    moment.locale('en');

var DashboardService = function () { };

DashboardService.prototype.getDashboardSummaryData = function (inputData, cb) {
    logger.info("Get getDashboardSummaryData service called (getDashboardSummaryData())");
    strategistDao.getDashboardSummaryData(inputData, function(err, data){
        if(err){
            logger.error("getDashboardSummaryData (getDashboardSummaryData())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        cb(null, responseCode.SUCCESS, data[0]);
    })
};

DashboardService.prototype.getFirmsCashFlowData = function (inputData, cb) {
    var startDate, endDate;
    if(inputData.startDate == undefined && inputData.endDate == undefined){
       var endDate = moment().format('L');
       var startDate    = moment().subtract(1, 'month').format('L');
       logger.error("start date is  " + startDate);
        var cashFlowSummaryData = generateCashflowDataFirms(startDate, endDate, function(cashflowData){
            return cb(null, cashflowData);
        });
    }else{
        startDate = inputData.startDate;
        endDate = inputData.endDate;
        generateCashflowDataFirms(startDate, endDate, function(cashflowData){
            return cb(null, cashflowData);
        });
    }    
}

DashboardService.prototype.getModelsCashFlowData = function (inputData, cb) {
   var startDate, endDate;
    if(inputData.startDate == undefined && inputData.endDate == undefined){
        var endDate = moment().format('L');
       var startDate    = moment().subtract(1, 'month').format('L');
        var cashFlowSummaryData = generateCashflowDataModels(startDate, endDate, function(cashflowData){
            return cb(null, cashflowData);
        });
    }else{
        startDate = inputData.startDate;
        endDate = inputData.endDate; 
        generateCashflowDataModels(startDate, endDate, function(cashflowData){
            return cb(null, cashflowData);
        });
    }    
}

DashboardService.prototype.getAdvisorsCashFlowData = function (inputData, cb) {
    var startDate, endDate;
    if(inputData.startDate == undefined && inputData.endDate == undefined){
       var endDate = moment().format('L');
       var startDate    = moment().subtract(1, 'month').format('L'); 
        var cashFlowSummaryData = generateCashflowDataAdvisors(startDate, endDate, function(cashflowData){
            return cb(null, cashflowData);
        });
    }else{
        startDate = inputData.startDate;
        endDate = inputData.endDate; 
        generateCashflowDataAdvisors(startDate, endDate, function(cashflowData){
            return cb(null, cashflowData);
        });
    } 
}

DashboardService.prototype.getCashFlowSummaryByType = function (inputData, cb) {
    logger.info("Get getCashFlowSummaryByType service called (getCashFlowSummaryByType())");
    var self = this;
    if(inputData.type){
        dashboardDao.getCashFlowSummaryData(inputData, function(err, summaryData){
            if(err){
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            self.convertCashFlowData(summaryData, inputData.type, function(err, requiredData){
                if(err){
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.SUCCESS, requiredData);
            });
        });
    }else{
        logger.error("getDashboardCashFlowData (getDashboardCashFlowData())");
        return cb(messages.typeQueryParamNotFound, responseCode.BAD_REQUEST);
    }
}

DashboardService.prototype.convertCashFlowData = function(summaryData, type, cb){
    if(summaryData && summaryData[0].length == 0){
        return cb(null, {});
    }
    var data = summaryData[0];
    var graph = summaryData[1];
    var requiredFormat = {
        totalCashflow :0,
        totalDistribution :0,
        totalContribution :0
    };
    requiredFormat.totalCashflow = data[0].totalAccountCashflow;
    requiredFormat.totalContribution = data[0].totalAccountContribution;
    requiredFormat.totalDistribution = data[0].totalAccountDistribution;
    if(type == 'model'){
        type = 'models';
    }
    if(type == 'firm'){
        type = 'firms';
    }
    if(type == 'advisor'){
        type = 'advisors'
    }
    requiredFormat[type] = [];
    data.forEach(function(row){
      var record = {}
      record.name = row.name;
      record.distribution = row.distribution;
      record.contribution = row.contribution;
      record.cashflow = row.cashflow;  
      record.dailyStatistics = [];
      var stats = graph.filter(function(item){return item.name == row.name});
      record.dailyStatistics = stats;
      requiredFormat[type].push(record);
    });
    return cb(null, requiredFormat);
}

DashboardService.prototype.getDashboardAccountData = function(inputData, cb) {

  if (!inputData.date) {
    return response('Date is missing', responseCode.BAD_REQUEST);
    }

    if( inputData.type != 'firm' && inputData.type != 'advisor' && inputData.type != 'model') {
          return cb(messages.typeQueryParamInvalid, responseCode.UNPROCESSABLE);        
    }
    
    dashboardDao.getDashboardAccountDetails(inputData, function( err, result){
       if(err){
          logger.error("getDashboardAccountDetails (getDashboardAccountDetails())" + err);
          return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
       }
       if( !result || result.length == 0 ) {
           return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
       } else if( result.length > 0) {
         
          result[1].type = inputData.type;
          dashboardConverter.getModelToResponseAccount(result ,function(err, result){
             if(err) {
               return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);  
             }
             return cb(null , responseCode.SUCCESS, result);
          });
       } else {
          logger.error("getDashboardAccountDetails (getDashboardAccountDetails())" + err);
          return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
       }
    });
};

DashboardService.prototype.getDashboardAum = function(inputData, cb) {
   if( inputData.type != 'firm' && inputData.type != 'advisor' && inputData.type != 'model') {
          return cb(messages.typeQueryParamInvalid, responseCode.UNPROCESSABLE);        
    }
    dashboardDao.getDashboardAumDetails(inputData, function( err, result){
       if(err){
          logger.error("getDashboardAumDetails (getDashboardAumDetails())" + err);
          return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
       }
       if( !result || result.length == 0 ) {
           return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
       } else if( result.length > 0) {
         
          result[1].type = inputData.type;
          dashboardConverter.getModelToResponseAUM(result ,function(err, result){
             if(err) {
               return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);  
             }
             return cb(null , responseCode.SUCCESS, result);
          });
       } else {
          logger.error("getDashboardAccountDetails (getDashboardAccountDetails())" + err);
          return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
       }
    });
};


 
module.exports = DashboardService;