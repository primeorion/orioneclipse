"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var enums = config.applicationEnum;
var s3Latest = require('helper/s3Latest.js');

var MainDashboardResponse = require("model/dashboard/MainDashboardResponse.js");
var messages = config.messages;
var logger = helper.logger(moduleName);

var MainDashboardConverter = function () { }

MainDashboardConverter.prototype.getResponseModel = function (data, etlMetaInfo, firmResult, prefResult, cb) {
    var self = this;
    var mainDashboardResponse = new MainDashboardResponse();
    if (data.length >1) {
        logger.debug("Converting data to mainDashboardSummaryData in getResponseModel()"+JSON.stringify(prefResult));
        var date = null;
        var time = null;
        var lastImportedDate = null;
        var lastImportProcessTime = null;
        if(etlMetaInfo && etlMetaInfo.length>0){
            lastImportedDate = etlMetaInfo[0].moment;
            lastImportProcessTime = etlMetaInfo[0].duration;
            var dateTime = new Date(etlMetaInfo[0].moment);
            date = (dateTime.getMonth()+1)+"/"+dateTime.getDate()+"/"+dateTime.getFullYear();
            time = dateTime.getHours()+":"+dateTime.getMinutes()+":"+dateTime.getSeconds();
            /*var dateTimeArray = dateTime.split("T");
            date = dateTimeArray[0];
            time = dateTimeArray[1].split(".")[0];*/
        }
        var prefValue = false;
        if(prefResult && prefResult.length>0){
            var prefRow = prefResult[0][0];
            if(prefRow){
                prefValue = prefRow.prefValue;
            }
            if(prefValue === "true"){
                prefValue = true;
            }else{
                prefValue = false;
            }
        }
        var latestAvailableImport = null;
       self.getAvailableImportDate(firmResult,function(err,result){
        if(err){

        }else{
            latestAvailableImport = result
        }
        var model = data[0][0];
        var account = data[1][0];
        var holding = data[2][0];
        var portfolio = data[3][0];
        var trade = data[4][0];
        var aum = data[5][0];
        var total = data[6][0];
        var priceRange = data[7][0];

        mainDashboardResponse.importAnalysisSummary.lastImportedDate = lastImportedDate||null;
        mainDashboardResponse.importAnalysisSummary.isAutoImport = prefValue||null;
        mainDashboardResponse.importAnalysisSummary.warnings = (total)?total.totalWarnings:0;
        mainDashboardResponse.importAnalysisSummary.errors = (total)?total.totalErrors:0;
        mainDashboardResponse.importAnalysisSummary.latestAvailableImport = latestAvailableImport;
        mainDashboardResponse.importAnalysisSummary.totalAUM = (aum)?aum.totalAUM:0;
        mainDashboardResponse.importAnalysisSummary.changeInAum = (aum)?aum.changeInDollar:0;
        mainDashboardResponse.importAnalysisSummary.lastImportProcessTime = lastImportProcessTime||null;
        mainDashboardResponse.importAnalysisSummary.priceRange = {};
        mainDashboardResponse.importAnalysisSummary.priceRange.maxPriceDate = (priceRange)?priceRange.maxPriceDate:null;
        mainDashboardResponse.importAnalysisSummary.priceRange.securityCount = (priceRange)?priceRange.securityCount:0;

        //For model
        var modelObject = {};
        modelObject.moduleName = enums.MODULE_NAME.MODEL;
        modelObject.total = (model)?model.totalModels:0;
        modelObject.warning = (model)?model.modelsWithWarnig:0;
        mainDashboardResponse.warningsSummary.push(modelObject);
        //For account
        var accountObject = {};
        accountObject.moduleName = enums.MODULE_NAME.ACCOUNT;
        accountObject.total = (account)?account.totalAccounts:0;
        accountObject.warning = (account)?account.accountWithIssues:0;
        mainDashboardResponse.warningsSummary.push(accountObject);
        //For holding
        var holdingObject = {};
        holdingObject.moduleName = enums.MODULE_NAME.HOLDING;
        holdingObject.total = (holding)?holding.totalHoldings:0;
        holdingObject.warning = (holding)?holding.holdingsWithIssues:0;
        mainDashboardResponse.warningsSummary.push(holdingObject);
        //For portfolio
        var portfolioObject = {};
        portfolioObject.moduleName = enums.MODULE_NAME.PORTFOLIO;
        portfolioObject.total = (portfolio)?portfolio.totalPortfolios:0;
        portfolioObject.warning = (portfolio)?portfolio.portfolioswithIssues:0;
        mainDashboardResponse.warningsSummary.push(portfolioObject);
        //For trade
        var tradeObject = {};
        tradeObject.moduleName = enums.MODULE_NAME.TRADE;
        tradeObject.total = (trade)?trade.totalTrades:0;
        tradeObject.warning = (trade)?trade.tradesWithIssues:0;
        mainDashboardResponse.warningsSummary.push(tradeObject);

        return cb(null, mainDashboardResponse);
       });  
    } else {
        return cb("Error in Getting Data from DB", mainDashboardResponse);
    }
};
MainDashboardConverter.prototype.getAvailableImportDate = function(firmResult, cb){
    if(firmResult && firmResult.length>0){
        s3Latest.getLatestKeyForFirm(firmResult[0].orionConnectFirmId, function(err,key){
            return cb(null, key);
        })
    }else{
        return cb("No firm data found on S3");
    }
}
module.exports = MainDashboardConverter;
