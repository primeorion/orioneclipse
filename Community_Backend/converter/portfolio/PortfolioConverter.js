"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var util = require('util');
var PortfolioResponse = require("model/portfolio/PortfolioResponse.js");
var PortfolioAccountResponse = require("model/portfolio/PortfolioAccountResponse.js");

var messages = config.messages;
var logger = helper.logger(moduleName);

var PortfolioConverter = function () { }

PortfolioConverter.prototype.getResponseModelOfPortfolioList = function (data, cb) {
	logger.debug("Converting data to portfolioListData in getResponseModelOfPortfolioList()");
    var self = this;
    var portfolioList = [];
	data.forEach(function (portfolio) {
        var portfolioResponse = new PortfolioResponse();
        portfolioResponse.id = portfolio.id;
        portfolioResponse.name = portfolio.name;             
        portfolioResponse.model = portfolio.model;            
        portfolioResponse.team = portfolio.team;            
        portfolioResponse.managedValue = portfolio.managedValue;            
        portfolioResponse.excludedValue = portfolio.excludedValue;
        portfolioResponse.totalValue = portfolio.totalValue;          
        portfolioResponse.action = portfolio.ACTION;          
        portfolioResponse.tradesPending = portfolio.tradesPending;           
        portfolioResponse.percentDeviations = portfolio.deviationPercent;
        portfolioResponse.cashReserve = portfolio.cashReserve;
        portfolioResponse.cashNeed = portfolio.cashNeed;
        portfolioResponse.cash = portfolio.cashDollar;
        portfolioResponse.cashPercent = portfolio.cashPercent;
        portfolioResponse.minCash = portfolio.minCash;
        portfolioResponse.minCashPercent = portfolio.minCashPercent;
        portfolioResponse.totalCash = portfolio.totalCash;
        portfolioResponse.totalCashPercent = portfolio.totalCashPercent;
        portfolioResponse.autoRebalanceDate = portfolio.autoRebalanceDate;
        portfolioResponse.OUB = portfolio.OUB;
        portfolioResponse.contribution = portfolio.contribution;
        portfolioResponse.tradeBlocked = portfolio.tradeBlocked;
        portfolioResponse.status = portfolio.status;
        portfolioResponse.TLH = portfolio.TLH;
        portfolioResponse.advisor = portfolio.advisor;
        portfolioResponse.value = portfolio.VALUE;
        portfolioResponse.style = portfolio.style;
        portfolioResponse.lastRebalancedOn = portfolio.lastRebalancedOn;
        portfolioResponse.isDeleted = portfolio.isDeleted;
        portfolioResponse.createdOn = portfolio.createdOn;
        portfolioResponse.createdBy = portfolio.createdBy;
        portfolioResponse.editedOn = portfolio.editedOn;
        portfolioResponse.editedBy = portfolio.editedBy;
        portfolioList.push(portfolioResponse);
	},this);
	return cb(null,portfolioList);
};

/*

    // PortfolioConverter.prototype.getResponseModelOfPortfolioDetails = function (data, cb) {
    // 	logger.debug("Converting data to userResponseData in getResponseModelOfPortfolioList()");
    //     var self = this;
    //     var portfolioList = [];
    // 	data.forEach(function (portfolio) {
    //         var portfolioResponse = new PortfolioResponse();
    //         portfolioResponse.id = portfolio.id;
    //         portfolioResponse.name = portfolio.name;             
    //         portfolioResponse.model = portfolio.model;            
    //         portfolioResponse.team = portfolio.team;            
    //         portfolioResponse.managedValue = portfolio.managedValue;            
    //         portfolioResponse.excludedValue = portfolio.excludedValue;
    //         portfolioResponse.totalValue = portfolio.totalValue;          
    //         portfolioResponse.action = portfolio.ACTION;          
    //         portfolioResponse.tradesPending = portfolio.tradesPending;           
    //         portfolioResponse.percentDeviations = portfolio.deviationPercent;
    //         portfolioResponse.cashReserve = portfolio.cashReserve;
    //         portfolioResponse.cashNeed = portfolio.cashNeed;
    //         portfolioResponse.cash = portfolio.cashDollar;
    //         portfolioResponse.cashPercent = portfolio.cashPercent;
    //         portfolioResponse.minCash = portfolio.minCash;
    //         portfolioResponse.minCashPercent = portfolio.minCashPercent;
    //         portfolioResponse.totalCash = portfolio.totalCash;
    //         portfolioResponse.totalCashPercent = portfolio.totalCashPercent;
    //         portfolioResponse.autoRebalanceDate = portfolio.autoRebalanceDate;
    //         portfolioResponse.OUB = portfolio.OUB;
    //         portfolioResponse.contribution = portfolio.contribution;
    //         portfolioResponse.tradeBlocked = portfolio.tradeBlocked;
    //         portfolioResponse.status = portfolio.status;
    //         portfolioResponse.TLH = portfolio.TLH;
    //         portfolioResponse.advisor = portfolio.advisor;
    //         portfolioResponse.value = portfolio.VALUE;
    //         portfolioResponse.style = portfolio.style;
    //         portfolioResponse.lastRebalancedOn = portfolio.lastRebalancedOn;
    //         portfolioResponse.isDeleted = portfolio.isDeleted;
    //         portfolioResponse.createdOn = portfolio.createdOn;
    //         portfolioResponse.createdBy = portfolio.createdBy;
    //         portfolioResponse.editedOn = portfolio.editedOn;
    //         portfolioResponse.editedBy = portfolio.editedBy;
    //         portfolioList.push(portfolioResponse);
    // 	},this);
    // 	return cb(null,portfolioList);
    // };

*/

PortfolioConverter.prototype.getResponseModelOfAccountList = function (data, cb) {
	logger.debug("Converting data to accountListData in getResponseModelOfAccountList()");
    var self = this;
    var accountList = [];
	data.forEach(function (account) {
        var portfolioAccountResponse = new PortfolioAccountResponse();
        portfolioAccountResponse.accountId = account.id;
        portfolioAccountResponse.accountName = account.name;             
        portfolioAccountResponse.accountNumber = account.accountNumber;            
        portfolioAccountResponse.accountType = account.accountType;            
        portfolioAccountResponse.managedValue = account.ManagedValue;            
        portfolioAccountResponse.excludedValue = account.ExcludedValue;
        portfolioAccountResponse.totalValue = account.totalValue;  
        portfolioAccountResponse.pendingValue = account.pendingValue;  
        portfolioAccountResponse.status = account.status;  
        portfolioAccountResponse.isDeleted = 0;
        portfolioAccountResponse.createdOn = account.createdOn;
        portfolioAccountResponse.createdBy = account.createdBy;
        portfolioAccountResponse.editedOn = account.editedOn;
        portfolioAccountResponse.editedBy = account.editedBy;
        accountList.push(portfolioAccountResponse);
	},this);
	return cb(null,accountList);
};
module.exports = PortfolioConverter;
