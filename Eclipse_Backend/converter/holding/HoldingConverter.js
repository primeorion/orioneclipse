"use strict";

var moduleName = __filename;
var helper = require('helper');

var UtilService = require("service/util/UtilService");
var AllHoldingResponse = require("model/holding/AllHoldingResponse.js");
var HoldingDetailResponse = require("model/holding/HoldingDetailResponse.js");
var HoldingTransactionResponse = require("model/holding/HoldingTransactionResponse.js");
var HoldingTaxlotResponse = require("model/holding/HoldingTaxlotResponse.js");
var HoldingSearchResponse = require("model/holding/HoldingSearchResponse.js");
var HoldingWithValueResponse = require("model/holding/HoldingWithValueResponse.js");

var logger = helper.logger(moduleName);
var utilService = new UtilService();
var HoldingConverter = function () { }

HoldingConverter.prototype.getAllHoldingToResponse = function (data, cb) {
    logger.info(" Holding  Converter called (getAllHoldingToResponse())");
    var holdingList = [];
    var holdingResponse = {};
    data.forEach(function (data) {
        holdingResponse = new AllHoldingResponse();
        if (data.id) {
            holdingResponse.id = data.id;
            holdingResponse.accountNumber = data.accountNumber ? data.accountNumber : null;
            holdingResponse.securityName = data.securityName ? data.securityName : null;
            holdingResponse.price = data.price ? data.price : 0;
            holdingResponse.shares = data.shares ? data.shares : 0;
            holdingResponse.value = data.value ? data.value : 0;
            holdingResponse.currentInPer = data.currentInPer ? data.currentInPer : 0;
            holdingResponse.targetInPer = data.targetInPer ? data.targetInPer : 0;  // todao Pending Field
            holdingResponse.pendingValue = data.pendingValue ? data.pendingValue : 0;
            holdingResponse.pendingInPer = data.pendingInPer ? data.pendingInPer : 0;
            holdingResponse.excluded = data.excluded ? data.excluded : "No";  // todao Pending Field
            holdingResponse.isCash = data.isCash ? data.isCash : "No";
            holdingResponse.inModel = data.inModel ? data.inModel : "No";
            holdingResponse.createdOn = data.createdDate ? data.createdDate : "0000-00-00T00:00:00.000Z";
            holdingResponse.createdBy = data.createdBy ? data.createdBy : null;
            holdingResponse.editedOn = data.editedDate ? data.editedDate : "0000-00-00T00:00:00.000Z";
            holdingResponse.editedBy = data.editedBy ? data.editedBy : null;
            holdingResponse.isDeleted = data.isDeleted ? data.isDeleted : 0;
            holdingList.push(holdingResponse);
        }
    });
    return cb(null, holdingList);
};
 
HoldingConverter.prototype.getHoldingDetailToResponse = function (data, cb) {
    logger.info(" Holding  Converter called (getAllHoldingToResponse())");
    var holdingDetailList = [];
    var holdingDetailResponse = {};
    data.forEach(function (data) {
        holdingDetailResponse = new HoldingDetailResponse();
        if (data.id) {
            holdingDetailResponse.id = data.id;
            holdingDetailResponse.accountName = data.accountName ? data.accountName : null;
            holdingDetailResponse.accountNumber = data.accountNumber ? data.accountNumber : null;
            holdingDetailResponse.securityName = data.securityName ? data.securityName : null;
            holdingDetailResponse.securitySymbol = data.securitySymbol ? data.securitySymbol : null;
            holdingDetailResponse.portfolioName = data.portfolioName ? data.portfolioName : null;
            holdingDetailResponse.price = data.price ? data.price : 0;
            holdingDetailResponse.shares = data.shares ? data.shares : 0;
            holdingDetailResponse.value = data.value ? data.value : 0;
            holdingDetailResponse.currentInPer = data.currentInPer ? data.currentInPer : 0;
            holdingDetailResponse.targetInPer = data.targetInPer ? data.targetInPer : 0; // todao Pending Field
            holdingDetailResponse.pendingValue = data.pendingValue ? data.pendingValue : 0;
            holdingDetailResponse.pendingInPer = data.pendingInPer ? data.pendingInPer : 0;
            holdingDetailResponse.excluded = data.excluded ? data.excluded : "No"; // todao Pending Field
            holdingDetailResponse.isCash = data.isCash ? data.isCash : "No";
            holdingDetailResponse.inModel = data.inModel ? data.inModel : "No";

            if (data.id) {
                holdingDetailResponse.GLSection.totalGainLoss = data.totalGainLoss ? data.totalGainLoss : 0;
                holdingDetailResponse.GLSection.totalGainLossStatus = data.totalGainLossStatus ? data.totalGainLossStatus : null;
                holdingDetailResponse.GLSection.shortTermGL = data.shortTermGL ? data.shortTermGL : 0;
                holdingDetailResponse.GLSection.shortTermGLStatus = data.shortTermGLStatus ? data.shortTermGLStatus : null;
                holdingDetailResponse.GLSection.longTermGL = data.longTermGL ? data.longTermGL : 0;
                holdingDetailResponse.GLSection.longTermGLStatus = data.longTermGLStatus ? data.longTermGLStatus : null;
            }
            holdingDetailResponse.createdOn = data.createdDate ? data.createdDate : "0000-00-00T00:00:00.000Z";
            holdingDetailResponse.createdBy = data.createdBy ? data.createdBy : null;
            holdingDetailResponse.editedOn = data.editedDate ? data.editedDate : "0000-00-00T00:00:00.000Z";
            holdingDetailResponse.editedBy = data.editedBy ? data.editedBy : null;
            holdingDetailResponse.isDeleted = data.isDeleted ;
            holdingDetailList.push(holdingDetailResponse);
        }
    });

    return cb(null, holdingDetailList);
};

HoldingConverter.prototype.getHoldingTransactionsResponse = function (data, cb) {
    logger.info(" Holding  Converter called (getAllHoldingToResponse())");
    var holdingTransactionList = [];
    var holdingTransactionResponse = {};

    data.forEach(function (data) {
        holdingTransactionResponse = new HoldingTransactionResponse();
        if (data.id) {
            holdingTransactionResponse.id = data.id;
            holdingTransactionResponse.date = data.tradeDate ? data.tradeDate : "0000-00-00T00:00:00.000Z";
            holdingTransactionResponse.type = data.type ? data.type : null;
            holdingTransactionResponse.amount = data.amount ? data.amount : 0;
            holdingTransactionResponse.units = data.units ? data.units : 0;
            holdingTransactionResponse.cost = data.cost ? data.cost : 0;
            holdingTransactionResponse.price = data.price ? data.price : 0;
            holdingTransactionResponse.createdOn = data.createdDate ? data.createdDate : "0000-00-00T00:00:00.000Z";
            holdingTransactionResponse.createdBy = data.createdBy ? data.createdBy : null;
            holdingTransactionResponse.editedOn = data.editedDate ? data.editedDate : "0000-00-00T00:00:00.000Z";
            holdingTransactionResponse.editedBy = data.editedBy ? data.editedBy : null;
            holdingTransactionResponse.isDeleted = data.isDeleted;
            holdingTransactionList.push(holdingTransactionResponse);
        }
    });
    return cb(null, holdingTransactionList);
};

HoldingConverter.prototype.getHoldingTaxlotsResponse = function (data, cb) {
    logger.info(" Holding  Converter called (getAllHoldingToResponse())");
    var holdingTaxlotList = [];
    var holdingTaxlotResponse = {};
    data.forEach(function (data) {
        holdingTaxlotResponse = new HoldingTaxlotResponse();
        if (data.id) {
            holdingTaxlotResponse.id = data.id;
            holdingTaxlotResponse.dateAcquired = data.dateAcquired ? data.dateAcquired : "0000-00-00T00:00:00.000Z";
            holdingTaxlotResponse.quantity = data.quantity ? data.quantity : 0;
            holdingTaxlotResponse.costAmount = data.costAmount ? data.costAmount : 0;
            holdingTaxlotResponse.costPerShare = data.costPerShare ? data.costPerShare : 0;
            holdingTaxlotResponse.createdOn = data.createdDate ? data.createdDate : "0000-00-00T00:00:00.000Z";
            holdingTaxlotResponse.createdBy = data.createdBy ? data.createdBy : null;
            holdingTaxlotResponse.editedOn = data.editedDate ? data.editedDate : "0000-00-00T00:00:00.000Z";
            holdingTaxlotResponse.editedBy = data.editedBy ? data.editedBy : null;

            if (data.id) {
                holdingTaxlotResponse.GLSection.totalGainLoss = data.totalGainLoss ? data.totalGainLoss : 0;
                holdingTaxlotResponse.GLSection.totalGainLossStatus = data.totalGainLossStatus;
                holdingTaxlotResponse.GLSection.shortTermGL = data.shortTermGL ? data.shortTermGL : 0;
                holdingTaxlotResponse.GLSection.shortTermGLStatus = data.shortTermGLStatus;
                holdingTaxlotResponse.GLSection.longTermGL = data.longTermGL ? data.longTermGL : 0;
                holdingTaxlotResponse.GLSection.longTermGLStatus = data.longTermGLStatus;
            }

            holdingTaxlotResponse.isDeleted = data.isDeleted;
            holdingTaxlotList.push(holdingTaxlotResponse);
        }
    });
    return cb(null, holdingTaxlotList);
};

HoldingConverter.prototype.getHoldingSearchResponse = function (data, cb) {
    logger.info(" Holding  Converter called (getAllHoldingToResponse())");
    var holdingSearchList = [];
    var holdingSearchResponse = {};
    data.forEach(function (data) {
        holdingSearchResponse = new HoldingSearchResponse();
        if (data.id) {
            holdingSearchResponse.id = data.id;
            holdingSearchResponse.accountNumber = data.accountNumber ? data.accountNumber : null;
            holdingSearchResponse.securityName = data.securityName ? data.securityName : null;
            holdingSearchResponse.price = data.price ? data.price : 0;
            holdingSearchResponse.shares = data.shares ? data.shares : 0;
            holdingSearchResponse.value = data.value ? data.value : 0;
            holdingSearchResponse.securitySymbol = data.securitySymbol ? data.securitySymbol : null;
            holdingSearchResponse.portfolioName = data.portfolioName ? data.portfolioName : null;
            holdingSearchResponse.accountName = data.accountName ? data.accountName : null;
            holdingSearchResponse.createdOn = data.createdDate ? data.createdDate : "0000-00-00T00:00:00.000Z";
            holdingSearchResponse.createdBy = data.createdBy ? data.createdBy : null;
            holdingSearchResponse.editedOn = data.editedDate ? data.editedDate : "0000-00-00T00:00:00.000Z";
            holdingSearchResponse.editedBy = data.editedBy ? data.editedBy : null;
            holdingSearchResponse.isDeleted = data.isDeleted;
            holdingSearchList.push(holdingSearchResponse);
        }
    });
    return cb(null, holdingSearchList);
};

HoldingConverter.prototype.getAccAndPortWithHoldingValue = function (data, cb) {
    logger.info(" Holding  Converter called (getAccAndPortWithHoldingValue())");
    var holdingList = [];
    var holdingResponse = {};

    data.forEach(function (data) {
        holdingResponse = new HoldingWithValueResponse();
        if (data.id) {
            holdingResponse.id = data.id;
            holdingResponse.name = data.name ? data.name : null;
            holdingResponse.value = data.value ? data.value : 0;
            holdingResponse.type = data.type ? data.type : null;
            holdingResponse.createdOn = data.createdDate ? data.createdDate : "0000-00-00T00:00:00.000Z";
            holdingResponse.createdBy = data.createdBy ? data.createdBy : null;
            holdingResponse.editedOn = data.editedDate ? data.editedDate : "0000-00-00T00:00:00.000Z";
            holdingResponse.editedBy = data.editedBy ? data.editedBy : null;
            holdingResponse.isDeleted = data.isDeleted;
            holdingList.push(holdingResponse);
        }
    });
    return cb(null, holdingList);
};


module.exports = HoldingConverter;
