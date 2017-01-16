"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var util = require('util');
var _ = require('underscore');
var PortfolioResponse = require("model/portfolio/PortfolioResponse.js");
var PortfolioSearchResponse = require("model/portfolio/PortfolioSearchResponse.js");
var PortfolioAccountResponse = require("model/portfolio/PortfolioAccountResponse.js");
var PortfolioSleevedResponse = require("model/portfolio/PortfolioSleevedResponse.js");
var PortfolioDetailsResponse = require("model/portfolio/PortfolioDetailsResponse.js");
var PortfolioTeamResponse = require("model/portfolio/PortfolioTeamResponse.js");
var PortfolioResWithHoldingValue = require("model/portfolio/PortfolioResWithHoldingValue.js");
var PortfolioCashSummaryResponse = require("model/portfolio/PortfolioCashSummaryResponse.js");
var AccountCashSummary = require("model/portfolio/AccountCashSummary.js");



var messages = config.messages;
var logger = helper.logger(moduleName);

var PortfolioConverter = function () { }

PortfolioConverter.prototype.getResponseModelOfPortfolioList = function (data, cb) {
    logger.debug("Converting data to portfolioListData in getResponseModelOfPortfolioList()");
    var self = this;
    var portfolioList = [];
    if (data) {
        data.forEach(function (portfolio) {
            if (portfolio.portfolioId) {
                var portfolioResponse = new PortfolioResponse();
                portfolioResponse.id = portfolio.portfolioId;
                portfolioResponse.name = portfolio.name ? portfolio.name : null;
                portfolioResponse.model = portfolio.modelName ? portfolio.modelName : null;
                portfolioResponse.sleevePortfolio = portfolio.isSleevePortfolio ? portfolio.isSleevePortfolio : 0;
                portfolioResponse.team = portfolio.primaryTeam ? portfolio.primaryTeam : null;
                portfolioResponse.managedValue = portfolio.managedValue ? portfolio.managedValue : 0;
                portfolioResponse.excludedValue = portfolio.excludedValue ? portfolio.excludedValue : 0;
                portfolioResponse.totalValue = portfolio.totalValue ? portfolio.totalValue : 0;
                portfolioResponse.action = portfolio.action ? portfolio.action : null;
                portfolioResponse.tradesPending = portfolio.tradesPending ? portfolio.tradesPending : 0;
                portfolioResponse.percentDeviations = portfolio.deviationPercent ? portfolio.deviationPercent : 0;
                portfolioResponse.cashReserve = portfolio.cashReserve ? portfolio.cashReserve : 0;
                portfolioResponse.cashNeed = portfolio.cashNeedPercent ? portfolio.cashNeedPercent : 0;
                portfolioResponse.cash = portfolio.cashDollar ? portfolio.cashDollar : 0;
                portfolioResponse.cashPercent = portfolio.cashPercent ? portfolio.cashPercent : 0;
                portfolioResponse.minCash = portfolio.minCashDollar ? portfolio.minCashDollar : 0;
                portfolioResponse.minCashPercent = portfolio.minCashPercent ? portfolio.minCashPercent : 0;
                portfolioResponse.totalCash = portfolio.totalCashDollar ? portfolio.totalCashDollar : 0;
                portfolioResponse.totalCashPercent = portfolio.totalCashPercent ? portfolio.totalCashPercent : 0;
                portfolioResponse.autoRebalanceOn = portfolio.autoRebalanceDate ? portfolio.autoRebalanceDate : null;
                portfolioResponse.OUB = portfolio.outOfBalance ? portfolio.outOfBalance : 0;
                portfolioResponse.contribution = portfolio.contribution ? portfolio.contribution : 0;
                portfolioResponse.tradeBlocked = portfolio.tradeBlocked ? portfolio.tradeBlocked : 0;
                portfolioResponse.status = portfolio.status ? portfolio.status : "ok";
                portfolioResponse.statusInfo = portfolio.statusReason ? portfolio.statusReason : null;
                portfolioResponse.TLH = portfolio.hasTaxLossHarvest ? portfolio.hasTaxLossHarvest : 0;
                // portfolioResponse.advisor = portfolio.advisor ? portfolio.advisor : null;
                // portfolioResponse.value = portfolio.value ? portfolio.value : 0;
                portfolioResponse.style = portfolio.style ? portfolio.style : null;
                portfolioResponse.lastRebalancedOn = portfolio.lastRebalancedDate ? portfolio.lastRebalancedDate : null;
                portfolioResponse.isDeleted = portfolio.isDeleted ? portfolio.isDeleted : 0;
                portfolioResponse.createdOn = portfolio.createdDate ? portfolio.createdDate : null;
                portfolioResponse.createdBy = portfolio.createdBy ? portfolio.createdBy : null;
                portfolioResponse.editedOn = portfolio.editedDate ? portfolio.editedDate : null;
                portfolioResponse.editedBy = portfolio.editedBy ? portfolio.editedBy : null;
                portfolioList.push(portfolioResponse);
            }
        }, this);
    }
    return cb(null, portfolioList);
};

PortfolioConverter.prototype.getResponseModelOfPortfolioSearch = function (data, cb) {
    logger.debug("Converting data to portfolioSearchData in getResponseModelOfPortfolioSearch()");
    var self = this;
    var portfolioList = [];
    if (data) {
        data.forEach(function (portfolio) {
            if (portfolio.portfolioId) {
                var portfolioResponse = new PortfolioSearchResponse();
                portfolioResponse.id = portfolio.portfolioId;
                portfolioResponse.name = portfolio.name ? portfolio.name : null;
                portfolioResponse.model = portfolio.modelName ? portfolio.modelName : null;
                portfolioResponse.sleevePortfolio = portfolio.isSleevePortfolio ? portfolio.isSleevePortfolio : 0;
                portfolioResponse.team = portfolio.primaryTeam ? portfolio.primaryTeam : null;
                portfolioResponse.managedValue = portfolio.managedValue ? portfolio.managedValue : 0;
                portfolioResponse.excludedValue = portfolio.excludedValue ? portfolio.excludedValue : 0;
                portfolioResponse.cashReserve = portfolio.cashReserve ? portfolio.cashReserve : 0;
                portfolioResponse.cash = portfolio.cashDollar ? portfolio.cashDollar : 0;
                portfolioResponse.isDeleted = portfolio.isDeleted ? portfolio.isDeleted : 0;
                portfolioResponse.createdOn = portfolio.createdDate ? portfolio.createdDate : null;
                portfolioResponse.createdBy = portfolio.createdBy ? portfolio.createdBy : null;
                portfolioResponse.editedOn = portfolio.editedDate ? portfolio.editedDate : null;
                portfolioResponse.editedBy = portfolio.editedBy ? portfolio.editedBy : null;
                portfolioList.push(portfolioResponse);
            }
        }, this);
    }
    return cb(null, portfolioList);
};

PortfolioConverter.prototype.getResponseModelOfPortfolioDetails = function (data, cb) {
    if (data[0][0].portfolioId) {
        logger.debug("Converting data to portfolioDetailsData in getResponseModelOfPortfolioDetails()");
        var self = this;
        var portfolio = data[0][0] ? data[0][0] : [];
        var teams = data[1] ? data[1] : [];
        var AUM = data[2][0] ? data[2][0] : [];
        var realized = data[3][0] ? data[3][0] : [];

        var portfolioDetails = new PortfolioDetailsResponse();

        portfolioDetails.id = portfolio.portfolioId;

        portfolioDetails.general = {};
        portfolioDetails.general.portfolioName = portfolio.name ? portfolio.name : null;
        portfolioDetails.general.sleevePortfolio = portfolio.isSleevePortfolio ? portfolio.isSleevePortfolio : 0;
        if (!portfolio.isSleevePortfolio) {
            portfolioDetails.general.custodialAccountNumber = null; // 0 replace with null
            portfolioDetails.general.registrationId = null; // 0 replace with null
            portfolioDetails.general.sleeveStrategy = null;
            portfolioDetails.general.contributionMethod = null;
            portfolioDetails.general.distributionMethod = null;
        } else {
            portfolio.modelId = null; // 0 replace with null
            portfolio.model = null; // 0 replace with null
            portfolioDetails.general.custodialAccountNumber = portfolio.custodialAccountNumber ? portfolio.custodialAccountNumber : null; // 0 replace with null
            portfolioDetails.general.registrationId = portfolio.registrationId ? portfolio.registrationId : null; // 0 replace with null
            portfolioDetails.general.sleeveStrategy = portfolio.sleeveStrategyName ? portfolio.sleeveStrategyName : null;
            portfolioDetails.general.contributionMethod = portfolio.sleeveContributionMethod ? portfolio.sleeveContributionMethod : null;
            portfolioDetails.general.distributionMethod = portfolio.sleeveDistributionMethod ? portfolio.sleeveDistributionMethod : null;
        }

        portfolioDetails.general.modelId = portfolio.modelId ? portfolio.modelId : null; // 0 replace with null
        portfolioDetails.general.modelName = portfolio.model ? portfolio.model : null;
        portfolioDetails.general.autoRebalance = portfolio.autoRebalance ? portfolio.autoRebalance : "None";
        portfolioDetails.general.monthAndDate = portfolio.autoRebalanceDate ? portfolio.autoRebalanceDate : null;
        portfolioDetails.general.doNotTrade = portfolio.doNotTrade ? portfolio.doNotTrade : false; // 0 replace with false
        portfolioDetails.general.tags = portfolio.tags ? portfolio.tags : null;

        portfolioDetails.teams = [];

        teams.forEach(function (team) {
            var portfolioTeamResponse = new PortfolioTeamResponse();
            if (team.portfolioId === portfolio.portfolioId) {
                portfolioTeamResponse.id = team.teamId ? team.teamId : null; // 0 replace with null
                portfolioTeamResponse.name = team.teamName ? team.teamName : null;
                portfolioTeamResponse.isPrimary = team.isPrimaryTeam ? team.isPrimaryTeam : 0;
                portfolioTeamResponse.portfolioAccess = team.portfolioAccess ? team.portfolioAccess : 0;
                portfolioDetails.teams.push(portfolioTeamResponse);
            }
        }, this);

        portfolioDetails.issues = {};
        portfolioDetails.issues.outOfTolerance = portfolio.outOfTolerance ? portfolio.outOfTolerance : 0;
        portfolioDetails.issues.cashNeed = portfolio.cashNeed ? portfolio.cashNeed : 0;
        portfolioDetails.issues.setForAutoRebalance = portfolio.setForAutoRebalance ? portfolio.setForAutoRebalance : 0;
        portfolioDetails.issues.contributions = portfolio.contribution ? portfolio.contribution : 0;
        portfolioDetails.issues.distribution = portfolio.distribution ? portfolio.distribution : 0;
        portfolioDetails.issues.modelAssociation = portfolio.modelAssociation ? portfolio.modelAssociation : 0;
        portfolioDetails.issues.doNotTrade = portfolio.blocked ? portfolio.blocked : 0;
        portfolioDetails.issues.TLHOpportunity = portfolio.hasTaxLossHarvest ? portfolio.hasTaxLossHarvest : 0;
        portfolioDetails.issues.dataErrors = portfolio.dataErrors ? portfolio.dataErrors : 0;
        portfolioDetails.issues.pendingTrades = portfolio.pendingTrades ? portfolio.pendingTrades : 0;

        portfolioDetails.summary = {};
        portfolioDetails.summary.analyticsOn = portfolio.dateOfAnalytics ? portfolio.dateOfAnalytics : null;
        portfolioDetails.summary.AUM = {};
        portfolioDetails.summary.AUM.totalCash = {};

        // if(AUM.portfolioId === portfolio.portfolioId){
        portfolioDetails.summary.AUM.total = AUM.total ? AUM.total : 0;
        portfolioDetails.summary.AUM.totalValue = AUM.totalValue ? AUM.totalValue : 0;
        portfolioDetails.summary.AUM.managedValue = AUM.managedValue ? AUM.managedValue : 0;
        portfolioDetails.summary.AUM.excludedValue = AUM.excludedValue ? AUM.excludedValue : 0;

        portfolioDetails.summary.AUM.totalCash.total = AUM.totalCash ? AUM.totalCash : 0;
        portfolioDetails.summary.AUM.totalCash.reserve = AUM.cashReserve ? AUM.cashReserve : 0;
        portfolioDetails.summary.AUM.totalCash.cash = AUM.cash ? AUM.cash : 0;
        portfolioDetails.summary.AUM.totalCash.setAsideCash = AUM.setAside ? AUM.setAside : 0;
        // }

        // if(realized.portfolioId === portfolio.portfolioId){
        portfolioDetails.summary.realized = {};
        portfolioDetails.summary.realized.total = realized.total ? realized.total : 0;
        portfolioDetails.summary.realized.totalStatus = realized.total ? ((realized.total > 0) ? "high" : "low") : "no";
        portfolioDetails.summary.realized.shortTerm = realized.shortTerm ? realized.shortTerm : 0;
        portfolioDetails.summary.realized.shortTermStatus = realized.shortTerm ? ((realized.shortTerm > 0) ? "high" : "low") : "no";
        portfolioDetails.summary.realized.longTerm = realized.longTerm ? realized.longTerm : 0;
        portfolioDetails.summary.realized.longTermStatus = realized.longTerm ? ((realized.longTerm > 0) ? "high" : "low") : "no";
        // }

        portfolioDetails.isDeleted = 0;
        portfolioDetails.createdBy = portfolio.createdBy ? portfolio.createdBy : null; // 0 replace with null
        portfolioDetails.createdOn = portfolio.createdDate ? portfolio.createdDate : null;
        portfolioDetails.editedBy = portfolio.editedBy ? portfolio.editedBy : null; // 0 replace with null
        portfolioDetails.editedOn = portfolio.editedDate ? portfolio.editedDate : null;

        return cb(null, portfolioDetails);
    } else {
        return cb("Portfolio doesn't exist", portfolioDetails);
    }
};

PortfolioConverter.prototype.getResponseModelOfSleevedAccountList = function (data, cb) {
    logger.debug("Converting data to accountListData in getResponseModelOfAccountList()");
    var self = this;
    var accountList = [];
    var sleeved = data.sleeved;
    if (data) {
        data.forEach(function (account) {
            if (account.id && account.accountId) {
                var portfolioAccountResponse = new PortfolioSleevedResponse();
                portfolioAccountResponse.id = account.id;
                portfolioAccountResponse.accountId = account.accountId;
                portfolioAccountResponse.name = account.name ? account.name : null;
                portfolioAccountResponse.accountNumber = account.accountNumber ? account.accountNumber : null;
                portfolioAccountResponse.accountType = account.accountType ? account.accountType : null;
                portfolioAccountResponse.model = account.modelName ? account.modelName : null;
                portfolioAccountResponse.managementStyle = account.managementStyle ? account.managementStyle : null;
                portfolioAccountResponse.managedValue = account.managedValue ? account.managedValue : 0;
                portfolioAccountResponse.excludedValue = account.excludedValue ? account.excludedValue : 0;
                portfolioAccountResponse.totalValue = account.totalValue ? account.totalValue : 0;
                portfolioAccountResponse.pendingValue = account.pendingValue ? account.pendingValue : 0;

                portfolioAccountResponse.sleeveType = account.sleeveType ? account.sleeveType : "None";
                portfolioAccountResponse.sleeveTarget = account.sleeveTarget ? account.sleeveTarget : 0;
                portfolioAccountResponse.sleeveContributionPercent = account.sleeveContributionPercent ? account.sleeveContributionPercent : 0;
                portfolioAccountResponse.sleeveDistributionPercent = account.sleeveDistributionPercent ? account.sleeveDistributionPercent : 0;
                portfolioAccountResponse.sleeveToleranceLower = account.sleeveToleranceLower ? account.sleeveToleranceLower : 0;
                portfolioAccountResponse.sleeveToleranceUpper = account.sleeveToleranceUpper ? account.sleeveToleranceUpper : 0;

                portfolioAccountResponse.status = account.status ? account.status : "ok";
                portfolioAccountResponse.statusInfo = account.statusReason ? account.statusReason : null;
                portfolioAccountResponse.isDeleted = 0;
                portfolioAccountResponse.createdOn = account.createdDate ? account.createdDate : null;
                portfolioAccountResponse.createdBy = account.createdBy ? account.createdBy : null;
                portfolioAccountResponse.editedOn = account.editedDate ? account.editedDate : null;
                portfolioAccountResponse.editedBy = account.editedBy ? account.editedBy : null;
                accountList.push(portfolioAccountResponse);
            }
        }, this);
    }
    return cb(null, accountList);
};

PortfolioConverter.prototype.getResponseModelOfSleevedAccountListSimple = function (data, cb) {
    logger.debug("Converting data to accountListData in getResponseModelOfAccountListSimple()");
    var self = this;
    var accountList = [];
    var sleeved = data.sleeved;
    if (data) {
        data.forEach(function (account) {
            if (account.accountId) {
                var portfolioAccountResponse = new PortfolioSleevedResponse();
                portfolioAccountResponse.id = account.id;
                portfolioAccountResponse.accountId = account.accountId;
                portfolioAccountResponse.name = account.accountName ? account.accountName : null;
                portfolioAccountResponse.accountNumber = account.accountNumber ? account.accountNumber : null;

                // delete portfolioAccountResponse.accountNumber;
                delete portfolioAccountResponse.accountType;
                delete portfolioAccountResponse.model;
                delete portfolioAccountResponse.managementStyle;
                delete portfolioAccountResponse.managedValue;
                delete portfolioAccountResponse.excludedValue;
                delete portfolioAccountResponse.totalValue;
                delete portfolioAccountResponse.pendingValue;
                delete portfolioAccountResponse.sleeveType;
                delete portfolioAccountResponse.sleeveTarget;
                delete portfolioAccountResponse.sleeveContributionPercent;
                delete portfolioAccountResponse.sleeveDistributionPercent;
                delete portfolioAccountResponse.sleeveToleranceLower;
                delete portfolioAccountResponse.sleeveToleranceUpper;
                delete portfolioAccountResponse.status;
                delete portfolioAccountResponse.statusInfo;
                delete portfolioAccountResponse.isDeleted;
                delete portfolioAccountResponse.createdOn;
                delete portfolioAccountResponse.createdBy;
                delete portfolioAccountResponse.editedOn;
                delete portfolioAccountResponse.editedBy;

                accountList.push(portfolioAccountResponse);
            }
        });
    }
    return cb(null, accountList);
};

PortfolioConverter.prototype.getResponseModelOfAccountList = function (data, cb) {
    logger.debug("Converting data to accountListData in getResponseModelOfAccountList()");
    var self = this;
    var accountList = [];
    if (data) {
        data.forEach(function (account) {
            if (account.id && account.accountId) {
                var portfolioAccountResponse = new PortfolioAccountResponse();
                portfolioAccountResponse.id = account.id;
                portfolioAccountResponse.accountId = account.accountId;
                portfolioAccountResponse.name = account.name ? account.name : null;
                portfolioAccountResponse.accountNumber = account.accountNumber ? account.accountNumber : null;
                portfolioAccountResponse.accountType = account.accountType ? account.accountType : null;
                portfolioAccountResponse.managedValue = account.ManagedValue ? account.ManagedValue : 0;
                portfolioAccountResponse.excludedValue = account.ExcludedValue ? account.ExcludedValue : 0;
                portfolioAccountResponse.totalValue = account.totalValue ? account.totalValue : 0;
                portfolioAccountResponse.pendingValue = account.pendingValue ? account.pendingValue : 0;
                portfolioAccountResponse.status = account.status ? account.status : "ok";
                portfolioAccountResponse.isDeleted = 0;
                portfolioAccountResponse.createdOn = account.createdDate ? account.createdDate : null;
                portfolioAccountResponse.createdBy = account.createdBy ? account.createdBy : null;
                portfolioAccountResponse.editedOn = account.editedDate ? account.editedDate : null;
                portfolioAccountResponse.editedBy = account.editedBy ? account.editedBy : null;
                accountList.push(portfolioAccountResponse);
            }
        }, this);
    }
    return cb(null, accountList);
};

PortfolioConverter.prototype.getPortResWithHoldingValue = function (data, cb) {
    logger.info(" Account  Converter called (getPortResWithHoldingValue())");
    var portfolioHoldingValueList = [];
    var portfolioResWithHoldingValue = {};
    data[0].forEach(function (portfolio) {
        portfolioResWithHoldingValue = new PortfolioResWithHoldingValue();
        portfolioResWithHoldingValue.id = portfolio.id;
        portfolioResWithHoldingValue.name = portfolio.name;
        portfolioResWithHoldingValue.value = portfolio.value;
        portfolioResWithHoldingValue.source = portfolio.source;

        if ((_.pluck(data[1], "portfolioId")).indexOf(portfolio.id) === -1) {
            portfolio.accountId = null;
            portfolio.accountNumber = null;
            portfolio.accountName = null;
        }
        if (data[1]) {
            portfolioResWithHoldingValue.accountId = portfolio.accountId;
            portfolioResWithHoldingValue.accountNumber = portfolio.accountNumber;
            portfolioResWithHoldingValue.accountName = portfolio.accountName;
        }
        portfolioResWithHoldingValue.modelId = portfolio.modelId;
        portfolioResWithHoldingValue.sleevePortfolio = portfolio.sleevePortfolio;
        portfolioResWithHoldingValue.createdOn = portfolio.createdOn;
        portfolioResWithHoldingValue.createdBy = portfolio.createdBy;
        portfolioResWithHoldingValue.editedOn = portfolio.editedOn;
        portfolioResWithHoldingValue.editedBy = portfolio.editedBy;
        portfolioResWithHoldingValue.isDeleted = portfolio.isDeleted;
        portfolioHoldingValueList.push(portfolioResWithHoldingValue);

    });
    return cb(null, portfolioHoldingValueList);
};



PortfolioConverter.prototype.portfolioCashSummaryResponse = function (data, cb) {
    if (data.length > 1) {
        logger.debug("Converting data to account dashboard in accountDashBoardResponse()");

        var portfolioCashSummary = data[1][0] ? data[1][0] : [];
        var accountCash = data[0] ? data[0] : [];

        var portfolioCashSummaryResponse = new PortfolioCashSummaryResponse();

        portfolioCashSummaryResponse.portfolioCashSummary = {};

        portfolioCashSummaryResponse.portfolioCashSummary.id = portfolioCashSummary.id ? portfolioCashSummary.id : null; // 0 replace with null
        portfolioCashSummaryResponse.portfolioCashSummary.portfolioName = portfolioCashSummary.portfolioName ? portfolioCashSummary.portfolioName : null;
        portfolioCashSummaryResponse.portfolioCashSummary.modelName = portfolioCashSummary.modelName ? portfolioCashSummary.modelName : null;
        portfolioCashSummaryResponse.portfolioCashSummary.totalTradeCost = portfolioCashSummary.totalTradeCost ? portfolioCashSummary.totalTradeCost : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.totalRedemptionFee = portfolioCashSummary.totalRedemptionFee ? portfolioCashSummary.totalRedemptionFee : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.totalValue = portfolioCashSummary.totalValue ? portfolioCashSummary.totalValue : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.currentValue = portfolioCashSummary.currentValue ? portfolioCashSummary.currentValue : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.reserveValue = portfolioCashSummary.reserveValue ? portfolioCashSummary.reserveValue : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.excludedValue = portfolioCashSummary.excludedValue ? portfolioCashSummary.excludedValue : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.setAsideValue = portfolioCashSummary.setaSideValue ? portfolioCashSummary.setaSideValue : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.targetValue = portfolioCashSummary.targetValue ? portfolioCashSummary.targetValue : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.postTradeValue = portfolioCashSummary.postTradeValue ? portfolioCashSummary.postTradeValue : 0;
        portfolioCashSummaryResponse.portfolioCashSummary.needsValue = portfolioCashSummary.needsValue ? portfolioCashSummary.needsValue : 0;


        portfolioCashSummaryResponse.accountCashSummary = [];
        accountCash.forEach(function (accountList) {
            var accountCashSummaryDetail = new AccountCashSummary();
            accountCashSummaryDetail.id = accountList.id ? accountList.id : null;
            accountCashSummaryDetail.accountName = accountList.accountName ? accountList.accountName : null;
            accountCashSummaryDetail.currentValue = accountList.currentValue ? accountList.currentValue : 0;
            accountCashSummaryDetail.reserveValue = accountList.reserveValue ? accountList.reserveValue : 0;
            accountCashSummaryDetail.totalValue = accountList.totalValue ? accountList.totalValue : 0;
            accountCashSummaryDetail.targetValue = accountList.targetValue ? accountList.targetValue : 0;

            accountCashSummaryDetail.postTradeValue = accountList.postTradeValue ? accountList.postTradeValue : 0;
            accountCashSummaryDetail.needsValue = accountList.needsValue ? accountList.needsValue : 0;

            portfolioCashSummaryResponse.accountCashSummary.push(accountCashSummaryDetail);
        });


        return cb(null, portfolioCashSummaryResponse);
    }
    else {
        return cb("Error in Getting Data from DB", portfolioCashSummaryResponse);
    }
};

module.exports = PortfolioConverter;
