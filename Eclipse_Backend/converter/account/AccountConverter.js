"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require('helper');
var util = require('util');
var UtilService = require("service/util/UtilService");
var AccountRequest = require("model/account/AccountRequest.js");
var AccountResponseWithOutHoldingValue = require("model/account/AccountResponseWithOutHoldingValue.js");
var AllAccountsResponse = require("model/account/AllAccountsResponse.js");
var AccountDetailResponse = require("model/account/AccountDetailResponse.js");
var AccountResponseWithHoldingValue = require("model/account/AccountResponseWithHoldingValue.js");
var AsideDetailsResponse = require("model/account/AsideDetailsResponse.js");
var AsideListResponse = require("model/account/AsideListResponse.js");
var SmaRequest = require("model/account/SmaRequest.js");
var SmaResponse = require("model/account/SmaResponse.js");
var TopTenHoldingResponse = require("model/dashboard/TopTenHoldingResponse.js");
var AccountListwithPortfolioName = require("model/account/AccountListwithPortfolioName.js");
var SMAWeightingsResponse = require("model/account/SMAWeightingsResponse.js");


var utilDao = require('dao/util/UtilDao.js');

var logger = helper.logger(moduleName);

var applicationEnum = config.applicationEnum;

var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;

var utilService = new UtilService();

var AccountConverter = function () { }

AccountConverter.prototype.getRequestToModel = function (data) {
    logger.info(" Account  Converter called (getRequestToModel())");
    var accounts = new AccountRequest();

    accounts.id = data.id;
    accounts.name = data.name;
    accounts.accountNumber = data.accountNumber;
    accounts.accountTypeId = data.accountType;
    return accounts;
};

AccountConverter.prototype.getSmaAssetEntity = function (data) {
    var dateTime = utilDao.getSystemDateTime(null);
    var userId = utilService.getAuditUserId(data.user);

    var obj = {};
    var entity = {};
    obj.reqId = data.reqId;
    obj.modelDetailId = data.modelDetailId;
    obj.modelId = data.id;
    obj.accountId = data.accountId;
    obj.entity = entity;

    entity.isDeleted = 1;
    entity.editedBy = userId;
    entity.editedDate = dateTime;
    console.log(data);
    return obj;
};

AccountConverter.prototype.getAccountResponseWithOutHolding = function (data, cb) {
    logger.info(" Account  Converter called (GetAccountResponseWithOutHolding())");
    var accountList = [];
    var accountResponse = {};
    data.forEach(function (data) {
        accountResponse = new AccountResponseWithOutHoldingValue();
        accountResponse.id = data.id;
        accountResponse.name = data.name;
        accountResponse.accountNumber = data.accountNumber;
        accountResponse.accountType = data.accountTypeId;
        accountResponse.accountId = data.accountId;
        accountResponse.portfolioId = data.portfolioId;
        accountResponse.portfolioName = data.portfolioName;
        accountResponse.createdOn = data.createdOn;
        accountResponse.createdBy = data.createdBy;
        accountResponse.editedOn = data.editedOn;
        accountResponse.editedBy = data.editedBy;
        accountResponse.isDeleted = data.isDeleted;

        accountList.push(accountResponse);

    });
    return cb(null, accountList);
};

AccountConverter.prototype.getAllAccountModelToResponse = function (data, cb) {
    logger.info(" Account  Converter called (getAllAccountModelToResponse())");
    var accountList = [];
    var allAccountsResponse = {};

    data.forEach(function (data) {

        allAccountsResponse = new AllAccountsResponse();
        if (data.id) {
            allAccountsResponse.id = data.id;
            allAccountsResponse.accountId = data.accountId ? data.accountId : null;
            allAccountsResponse.name = data.accountName ? data.accountName : null;
            allAccountsResponse.accountNumber = data.accountNumber ? data.accountNumber : null;
            allAccountsResponse.accountType = data.accountTypeName ? data.accountTypeName : null;
            allAccountsResponse.portfolio = data.portfolio ? data.portfolio : null;
            allAccountsResponse.custodian = data.custodian ? data.custodian : null;
            allAccountsResponse.model = data.model ? data.model : null;
            allAccountsResponse.ssn = data.ssn ? data.ssn : null;
            allAccountsResponse.value = data.value ? data.value : 0;
            allAccountsResponse.managedValue = data.managedValue ? data.managedValue : 0;
            allAccountsResponse.excludedValue = data.excludedValue ? data.excludedValue : 0;
            allAccountsResponse.pendingValue = data.pendingValue ? data.pendingValue : 0;
            allAccountsResponse.style = data.style ? data.style : null;
            allAccountsResponse.sleeveType = data.sleeveType ? data.sleeveType : null;
            allAccountsResponse.distributionAmount = data.distributionAmount ? data.distributionAmount : 0;
            allAccountsResponse.contributionAmount = data.contributionAmount ? data.contributionAmount : 0;
            allAccountsResponse.mergeIn = data.mergeIn ? data.mergeIn : 0;
            allAccountsResponse.mergeOut = data.mergeOut ? data.mergeOut : 0;
            allAccountsResponse.cashNeedAmount = data.cashNeedAmount ? data.cashNeedAmount : 0;
            allAccountsResponse.cashTarget = data.cashTarget ? data.cashTarget : 0;
            allAccountsResponse.targetCashReserve = data.targetCashReserve ? data.targetCashReserve : 0;
            allAccountsResponse.systematicAmount = data.systematicAmount ? data.systematicAmount : 0;
            allAccountsResponse.systematicDate = data.systematicDate ? data.systematicDate : null;
            allAccountsResponse.sma = data.sma ? data.sma : null;
            allAccountsResponse.status = data.status ? data.status : null;
            allAccountsResponse.reason = data.statusReason ? data.statusReason : null;
            allAccountsResponse.pendingTrades = data.pendingTrades ? data.pendingTrades : null;
            allAccountsResponse.createdOn = data.createdDate;
            allAccountsResponse.createdBy = data.createdBy;
            allAccountsResponse.editedOn = data.editedDate;
            allAccountsResponse.editedBy = data.editedBy;
            allAccountsResponse.isDeleted = data.isDeleted;
            allAccountsResponse.eclipseCreatedDate = data.eclipseCreatedDate;

            accountList.push(allAccountsResponse);
        }
    });
    return cb(null, accountList);
};

AccountConverter.prototype.getAccountDetailModelToResponse = function (data, cb) {
    logger.debug("Converting data to account detail in getAccountDetailModelToResponse()");
    if (data.length >= 1) {

        var accountSummary = data[0][0] ? data[0][0] : [];
        var holdingsDetail = data[1] ? data[1] : [];
        var totalValueSummary = data[2][0] ? data[2][0] : [];
        var summarySectionDetail = data[3][0] ? data[3][0] : [];
        var analyticesDate = data[4][0] ? data[4][0] : [];
        var setaSideSummary = data[5] ? data[5] : [];
        // var accountList = [];
        var accountDetailResponse = {};
        accountDetailResponse = new AccountDetailResponse();
        if (accountSummary.id) {
            accountDetailResponse.id = accountSummary.id;
            accountDetailResponse.accountId = accountSummary.accountId ? accountSummary.accountId : null;
            accountDetailResponse.name = accountSummary.accountName ? accountSummary.accountName : null;
            accountDetailResponse.accountNumber = accountSummary.accountNumber ? accountSummary.accountNumber : null;
            accountDetailResponse.portfolio = accountSummary.portfolio ? accountSummary.portfolio : null;
            accountDetailResponse.custodian = accountSummary.custodian ? accountSummary.custodian : null;
            accountDetailResponse.ssn = accountSummary.ssn ? accountSummary.ssn : null;
            accountDetailResponse.model = accountSummary.model ? accountSummary.model : null;
            accountDetailResponse.style = accountSummary.style ? accountSummary.style : null;
            accountDetailResponse.billingAccount = accountSummary.billingAccount ? accountSummary.billingAccount : null;
            accountDetailResponse.advisior = accountSummary.advisior ? accountSummary.advisior : null;
            accountDetailResponse.sleeveType = accountSummary.sleeveType ? accountSummary.sleeveType : null;
            accountDetailResponse.createdOn = accountSummary.createdDate;
            accountDetailResponse.createdBy = accountSummary.createdBy;
            accountDetailResponse.editedOn = accountSummary.editedDate;
            accountDetailResponse.editedBy = accountSummary.editedBy;
            accountDetailResponse.isDeleted = accountSummary.isDeleted;
            accountDetailResponse.registrationId = accountSummary.registrationId ? accountSummary.registrationId : null;
            accountDetailResponse.isReplenish = accountSummary.isReplenish ? accountSummary.isReplenish : false;
            accountDetailResponse.sleeveContributionPercent = accountSummary.sleeveContributionPercent ? accountSummary.sleeveContributionPercent : 0;
            accountDetailResponse.sleeveDistributionPercent = accountSummary.sleeveDistributionPercent ? accountSummary.sleeveDistributionPercent : 0;
            accountDetailResponse.sleeveTarget = accountSummary.sleeveTarget ? accountSummary.sleeveTarget : 0;
            accountDetailResponse.sleeveToleranceLower = accountSummary.sleeveToleranceLower ? accountSummary.sleeveToleranceLower : 0;
            accountDetailResponse.sleeveToleranceUpper = accountSummary.sleeveToleranceUpper ? accountSummary.sleeveToleranceUpper : 0;
            accountDetailResponse.smaTradeable = accountSummary.smaTradeable ? accountSummary.smaTradeable : 0;
            accountDetailResponse.sleeveCureent = accountSummary.sleeveCureent ? accountSummary.sleeveCureent : 0;
            if (accountSummary.id) {
                accountDetailResponse.ytdGl.totalGainLoss = accountSummary.totalGainLoss ? accountSummary.totalGainLoss : 0;
                accountDetailResponse.ytdGl.totalGainLossStatus = accountSummary.totalGainLossStatus ? accountSummary.totalGainLossStatus : null;
                accountDetailResponse.ytdGl.shortTermGL = accountSummary.shortTermGL ? accountSummary.shortTermGL : 0;
                accountDetailResponse.ytdGl.shortTermGLStatus = accountSummary.shortTermGLStatus ? accountSummary.shortTermGLStatus : null;
                accountDetailResponse.ytdGl.longTermGL = accountSummary.longTermGL ? accountSummary.longTermGL : 0;
                accountDetailResponse.ytdGl.longTermGLStatus = accountSummary.longTermGLStatus ? accountSummary.longTermGLStatus : null;
            }
            accountDetailResponse.accountValue = {};
            accountDetailResponse.accountValue.totalValueOn = analyticesDate.dateTime ? analyticesDate.dateTime : null;
            accountDetailResponse.accountValue.totalValue = totalValueSummary.total ? totalValueSummary.total : 0;
            accountDetailResponse.accountValue.status = totalValueSummary.changeValueStatus ? totalValueSummary.changeValueStatus : null;
            accountDetailResponse.accountValue.holdings = [];
            holdingsDetail.forEach(function (holdingSummary) {
                var topTenHoldingResponse = new TopTenHoldingResponse();

                topTenHoldingResponse.securityName = holdingSummary.securityName ? holdingSummary.securityName : null;
                topTenHoldingResponse.marketValue = holdingSummary.value ? holdingSummary.value : 0;
                topTenHoldingResponse.unit = holdingSummary.shares ? holdingSummary.shares : 0;
                topTenHoldingResponse.price = holdingSummary.price ? holdingSummary.price : 0;
                topTenHoldingResponse.percentage = holdingSummary.currentInPer ? holdingSummary.currentInPer : 0;

                accountDetailResponse.accountValue.holdings.push(topTenHoldingResponse);
            });
            // Error and warning pannel
            accountDetailResponse.errorAndWarnings = {};
            accountDetailResponse.errorAndWarnings.systematic = accountSummary.systematic ? accountSummary.systematic : 'NO';
            accountDetailResponse.errorAndWarnings.mergeIn = accountSummary.mergeIn ? accountSummary.mergeIn : 0;//to dao
            accountDetailResponse.errorAndWarnings.mergeOut = accountSummary.mergeOut ? accountSummary.mergeOut : 0;//to dao
            accountDetailResponse.errorAndWarnings.newAccount = accountSummary.newAccount ? accountSummary.newAccount : 'NO';
            accountDetailResponse.errorAndWarnings.hasPortfolios = accountSummary.hasPortfolios ? accountSummary.hasPortfolios : 'NO';
            accountDetailResponse.errorAndWarnings.custodialRestrictions = accountSummary.custodialRestrictions ? accountSummary.custodialRestrictions : 'NO';
            accountDetailResponse.errorAndWarnings.sma = accountSummary.sma ? accountSummary.sma : 'NO';
            accountDetailResponse.errorAndWarnings.importError = accountSummary.importError ? accountSummary.importError : 0;//to dao
            accountDetailResponse.errorAndWarnings.hasPendingTrades = accountSummary.hasPendingTrades ? accountSummary.hasPendingTrades : 'NO';
            // Summary Section
            accountDetailResponse.summarySection = {};
            accountDetailResponse.summarySection.grandTotal = summarySectionDetail.grandTotal ? summarySectionDetail.grandTotal : 0;
            accountDetailResponse.summarySection.totalValue = summarySectionDetail.totalValue ? summarySectionDetail.totalValue : 0;
            accountDetailResponse.summarySection.managedValue = summarySectionDetail.managedValue ? summarySectionDetail.managedValue : 0;//to dao
            accountDetailResponse.summarySection.excludedValue = summarySectionDetail.excludedValue ? summarySectionDetail.excludedValue : 0;//to dao
            accountDetailResponse.summarySection.totalCashValue = summarySectionDetail.totalCashValue ? summarySectionDetail.totalCashValue : 0;
            accountDetailResponse.summarySection.cashReserve = summarySectionDetail.cashReserve ? summarySectionDetail.cashReserve : 0;;
            accountDetailResponse.summarySection.cashAvailable = summarySectionDetail.cashAvailable ? summarySectionDetail.cashAvailable : 0;
            accountDetailResponse.summarySection.setAsideCash = summarySectionDetail.setAsideCash ? summarySectionDetail.setAsideCash : 0;
            // accountList.push(accountDetailResponse);
            return cb(null, accountDetailResponse);
        } else {
            return cb("Error in Getting Data from DB", accountDetailResponse);
        }

    } else {
        return cb("Error in Getting Data from DB", accountDetailResponse);
    }
};

AccountConverter.prototype.getAccountResponseWithHoldingValue = function (data, cb) {
    logger.info(" Account  Converter called (getAccountResponseWithHoldingValue())");
    var accountList = [];
    var accountWithHoldingValue = {};

    data.forEach(function (data) {
        if (data.id) {
            accountWithHoldingValue = new AccountResponseWithHoldingValue();
            accountWithHoldingValue.id = data.id;
            accountWithHoldingValue.orionConnectExternalId = data.orionConnectExternalId;
            accountWithHoldingValue.name = data.name;
            accountWithHoldingValue.accountNumber = data.accountNumber;
            accountWithHoldingValue.accountType = data.accountTypeId;
            accountWithHoldingValue.portfolioId = data.portfolioId;
            accountWithHoldingValue.portfolioName = data.portfolioName;
            accountWithHoldingValue.value = data.value;
            accountWithHoldingValue.createdOn = data.createdOn;
            accountWithHoldingValue.createdBy = data.createdBy;
            accountWithHoldingValue.editedOn = data.editedOn;
            accountWithHoldingValue.editedBy = data.editedBy;
            accountWithHoldingValue.isDeleted = data.isDeleted;
            accountList.push(accountWithHoldingValue);
        }
        else {
            return cb("Error in Getting Data from DB", accountList);
        }
    });

    return cb(null, accountList);
};

AccountConverter.prototype.getAsideTypeResponse = function (data, cb) {
    logger.info(" Get  AsideTypeResponseData (getAsideTypeResponse())");
    var asideTypeList = [];

    data.forEach(function (type) {
        var asideType = {};
        asideType.id = type.id;
        if (type.setAsideCashAmountType) {
            asideType.name = type.setAsideCashAmountType ? type.setAsideCashAmountType : null;
        }
        if (type.setAsideCashExpirationType) {
            asideType.name = type.setAsideCashExpirationType ? type.setAsideCashExpirationType : null;
        }
        if (type.setAsideCashTransactionType) {
            asideType.name = type.setAsideCashTransactionType ? type.setAsideCashTransactionType : null;
        }
        asideTypeList.push(asideType);
    });
    return cb(null, asideTypeList);
};

AccountConverter.prototype.getAsideDetailsResponse = function (data, cb) {
    logger.info(" Get AsideDetailsData (getAsideDetailsResponse())");
    if (data) {
        data.forEach(function (aside) {
            if (aside.id) {
                var asideDetailsResponse = new AsideDetailsResponse();
                asideDetailsResponse.id = aside.id;
                asideDetailsResponse.accountId = aside.accountId;
                asideDetailsResponse.description = aside.description;

                asideDetailsResponse.cashAmountTypeId = aside.cashAmountTypeId ? aside.cashAmountTypeId : null;

                asideDetailsResponse.cashAmount = aside.cashAmount ? aside.cashAmount : null;

                asideDetailsResponse.expirationTypeId = aside.expirationTypeId ? aside.expirationTypeId : null;

                if (aside.expirationTypeId === 1) {
                    asideDetailsResponse.expirationValue = aside.expireDate ? aside.expireDate : null;
                }
                if (aside.expirationTypeId !== 1) {
                    asideDetailsResponse.expirationValue = '"' + aside.transactionTypeId ? aside.transactionTypeId : null + '"';
                }
                asideDetailsResponse.toleranceValue = aside.toleranceValue ? aside.toleranceValue : null;

                if (aside.systemExpiredOn === null) {
                    asideDetailsResponse.isExpired = false;
                } else {
                    asideDetailsResponse.isExpired = true;
                }
                //asideDetailsResponse.isReplenish = aside.isReplenish ? aside.isReplenish : 0;

                asideDetailsResponse.isDeleted = aside.isDeleted ? aside.isDeleted : 0;
                asideDetailsResponse.createdOn = aside.createdDate ? aside.createdDate : null;
                asideDetailsResponse.createdBy = aside.createdBy ? aside.createdBy : null;
                asideDetailsResponse.editedOn = aside.editedDate ? aside.editedDate : null;
                asideDetailsResponse.editedBy = aside.editedBy ? aside.editedBy : null;
                return cb(null, asideDetailsResponse);
            }
        }, this);
    }
};

AccountConverter.prototype.getAsideListResponse = function (data, cb) {
    logger.info(" Get Aside List data (getAsideListResponse())");
    var asideList = [];
    if (data) {
        data.forEach(function (aside) {
            if (aside.id) {
                var asideListResponse = new AsideListResponse();
                asideListResponse.id = aside.id;
                asideListResponse.description = aside.description;
                asideListResponse.cashAmountTypeId = aside.cashAmountTypeId ? aside.cashAmountTypeId : null;
                asideListResponse.cashAmountTypeName = aside.cashAmountTypeName ? aside.cashAmountTypeName : null;
                asideListResponse.cashAmount = aside.cashAmount ? aside.cashAmount : null;

                asideListResponse.expirationTypeId = aside.expirationTypeId ? aside.expirationTypeId : null;
                asideListResponse.expirationTypeName = aside.expirationTypeName ? aside.expirationTypeName : null;
                if (aside.expirationTypeId === 1) {
                    asideListResponse.expirationValue = aside.expireDate ? aside.expireDate : null;
                }
                if (aside.expirationTypeId !== 1) {
                    asideListResponse.expirationValue = aside.transactionTypeName ? aside.transactionTypeName : null;
                }
                asideListResponse.toleranceValue = aside.toleranceValue ? aside.toleranceValue : null;
                asideListResponse.expiredOn = aside.systemExpiredOn ? aside.systemExpiredOn : null;

                if (aside.systemExpiredOn === null) {
                    asideListResponse.isExpired = false;
                } else {
                    asideListResponse.isExpired = true;
                }
                // asideListResponse.isReplenish = aside.isReplenish ? aside.isReplenish : 0;
                asideListResponse.isDeleted = aside.isDeleted ? aside.isDeleted : 0;
                asideListResponse.createdOn = aside.createdDate ? aside.createdDate : null;
                asideListResponse.createdBy = aside.createdBy ? aside.createdBy : null;
                asideListResponse.editedOn = aside.editedDate ? aside.editedDate : null;
                asideListResponse.editedBy = aside.editedBy ? aside.editedBy : null;
                asideList.push(asideListResponse);
            }
        }, this);
    }
    return cb(null, asideList);
};

AccountConverter.prototype.getModelLevelTypeResponse = function (data, cb) {
    logger.info(" Get Aside List data (getModelLevelTypeResponse())");
    var modelLevelResponse = [];
    if (data) {
        data.forEach(function (level) {
            var modelLevel = {};
            if (level.relatedType === 'CATEGORY') {
                // modelLevel.id = relatedTypeCodeToId.CATEGORY 
                modelLevel.id = relatedTypeCodeToId.CATEGORY ? relatedTypeCodeToId.CATEGORY : null;
                //modelLevel.name = level.relatedType ? level.relatedType : null;
                modelLevel.name = relatedTypeCodeToDisplayName.CATEGORY ? relatedTypeCodeToDisplayName.CATEGORY : null;
            }
            if (level.relatedType === 'CLASS') {
                modelLevel.id = relatedTypeCodeToId.CLASS ? relatedTypeCodeToId.CLASS : null;
                // modelLevel.name = level.relatedType ? level.relatedType : null;
                modelLevel.name = relatedTypeCodeToDisplayName.CLASS ? relatedTypeCodeToDisplayName.CLASS : null;
            }
            if (level.relatedType === 'SUBCLASS') {
                modelLevel.id = relatedTypeCodeToId.SUBCLASS ? relatedTypeCodeToId.SUBCLASS : null;
                // modelLevel.name = level.relatedType ? level.relatedType : null;
                modelLevel.name = relatedTypeCodeToDisplayName.SUBCLASS ? relatedTypeCodeToDisplayName.SUBCLASS : null;
            }
            modelLevelResponse.push(modelLevel);
        }, this);
    }
    return cb(null, modelLevelResponse);
};

AccountConverter.prototype.smaResponseNodes = function (data, cb) {
    logger.info(" Account  Converter called (smaResponseNodes())");
    var smaNodeList = [];
    var smaResponse = new SmaResponse();
    data.forEach(function (level) {
        smaResponse.selectedLevelId = level.levelId ? level.levelId : 0;
    });
    smaResponse.weightings = [];
    data.forEach(function (smaWeightings) {
        var sMAWeightingsResponse = new SMAWeightingsResponse();
        sMAWeightingsResponse.id = smaWeightings.id ? smaWeightings.id : 0;
        sMAWeightingsResponse.subModelId = smaWeightings.subModelId ? smaWeightings.subModelId : 0;
        sMAWeightingsResponse.subModelName = smaWeightings.subModelName ? smaWeightings.subModelName : null;
        sMAWeightingsResponse.weightPercent = smaWeightings.weightPercent ? smaWeightings.weightPercent : 0;
        sMAWeightingsResponse.modelId = smaWeightings.modelId ? smaWeightings.modelId : 0;
        sMAWeightingsResponse.modelDetailId = smaWeightings.modelDetailId ? smaWeightings.modelDetailId : 0;

        sMAWeightingsResponse.createdOn = smaWeightings.createdOn ? smaWeightings.createdOn : 0;
        sMAWeightingsResponse.createdBy = smaWeightings.createdBy ? smaWeightings.createdBy : 0;
        sMAWeightingsResponse.editedOn = smaWeightings.editedOn ? smaWeightings.editedOn : 0;
        sMAWeightingsResponse.editedBy = smaWeightings.editedBy ? smaWeightings.editedBy : 0;
        sMAWeightingsResponse.isDeleted = smaWeightings.isDeleted ? smaWeightings.isDeleted : 0;


        smaResponse.weightings.push(sMAWeightingsResponse);
    });

    // smaNodeList.push(smaResponse);


    return cb(null, smaResponse);
};

AccountConverter.prototype.setReplenishResponse = function (data, cb) {
    logger.info(" set Replenish Response Converter called (setReplenishResponse())");
    var result = {};
    if (data.isReplenish === 'true') {
        result.isReplenish = true;
        return cb(null, result);
    }
    if (data.isReplenish === null || data.isReplenish === 'false') {
        result.isReplenish = false;
        return cb(null, result);
    }
};

AccountConverter.prototype.getReplenishResponse = function (data, cb) {
    logger.info("Get Replenish Response Converter called (getReplenishResponse())");
    var result = {};
    data.forEach(function (replenish) {
        var replenishResponse = {};
        if (replenish && replenish.isReplenish === 1) {
            replenishResponse.isReplenish = replenish.isReplenish ? true : false;

        } else {
            replenishResponse.isReplenish = false;
        }
        return cb(null, replenishResponse);
    });
};

AccountConverter.prototype.getSimpleAccountListwithPortfolioNameResponse = function (data, cb) {
    logger.info(" Account  Converter called (GetAccountResponseWithOutHolding())");
    var accountList = [];
    var accountResponse = {};
    data.forEach(function (data) {
        accountResponse = new AccountListwithPortfolioName();
        accountResponse.id = data.id;
        accountResponse.name = data.name;
        accountResponse.accountNumber = data.accountNumber;
        accountResponse.accountType = data.accountTypeId;
        accountResponse.accountId = data.accountId;
        accountResponse.portfolioName = data.portfolioName;
        accountResponse.createdOn = data.createdOn;
        accountResponse.createdBy = data.createdBy;
        accountResponse.editedOn = data.editedOn;
        accountResponse.editedBy = data.editedBy;
        accountResponse.isDeleted = data.isDeleted;
        accountList.push(accountResponse);

    });
    return cb(null, accountList);
};


AccountConverter.prototype.smaRequest = function (data, cb) {
    var smaAsset = data;
    var smaRequestsList = [];
    smaRequestsList.push(data.selectedLevelId);
    // baseConverter(smaRequest, data);
    data.weightings.forEach(function (record) {
        var smaRequest = new SmaRequest();
        smaRequest.id = record.id ? record.id : 0;
        smaRequest.subModelId = record.subModelId ? record.subModelId : 0;
        smaRequest.weightPercent = record.weightPercent ? record.weightPercent : 0;
        smaRequest.accountId = data.accountId ? data.accountId : 0;
        smaRequest.modelId = data.modelId ? data.modelId : 0;
        smaRequest.modelDetailId = data.modelDetailId ? data.modelDetailId : 0;
        smaRequest.selectedLevelId = data.selectedLevelId ? data.selectedLevelId : 0;
        smaRequestsList.push(smaRequest);
        smaRequest = null;

    });

    return smaRequestsList;
};

module.exports = AccountConverter;
