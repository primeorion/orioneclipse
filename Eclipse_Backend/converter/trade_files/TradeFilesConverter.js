"use strict";

var moduleName = __filename;

var helper = require('helper');
var util = require('util');
var moment = require('moment');
var TradeFilesResponse = require("model/trade_files/TradeFilesResponse.js");
var TradeFilesDataResponse = require("model/trade_files/TradeFilesDataResponse.js");

var logger = helper.logger(moduleName);

var TradeFilesConverter = function () { }

TradeFilesConverter.prototype.getResponseModelOfTradeFilesList = function (data, cb) {
    var tradeFilesList = [];
    if (data) {
        data.forEach(function (tradeFile) {
            if (tradeFile.id) {
                var tradeFilesResponse = new TradeFilesResponse();
                tradeFilesResponse.id = tradeFile.id;
                tradeFilesResponse.name = tradeFile.name;
                tradeFilesResponse.format = tradeFile.format;
                tradeFilesResponse.path = tradeFile.path;
                tradeFilesResponse.status = tradeFile.status;
                tradeFilesResponse.URL = tradeFile.URL;
                tradeFilesResponse.isDeleted = tradeFile.isDeleted;
                tradeFilesResponse.createdOn = tradeFile.createdDate;
                tradeFilesResponse.createdBy = tradeFile.createdBy;
                tradeFilesResponse.editedOn = tradeFile.editedDate;
                tradeFilesResponse.editedBy = tradeFile.editedBy;
                tradeFilesList.push(tradeFilesResponse);
            }
        }, this);
    }
    return cb(null, tradeFilesList);
};

TradeFilesConverter.prototype.getResponseModelOfTradeFileDetails = function (data, cb) {
    var tradeFilesResponse = new TradeFilesResponse();
    if (data && data.id) {
        tradeFilesResponse.id = data.id;
        tradeFilesResponse.name = data.name;
        tradeFilesResponse.format = data.format;
        tradeFilesResponse.path = data.path;
        tradeFilesResponse.status = data.status;
        tradeFilesResponse.URL = data.URL;
        tradeFilesResponse.isDeleted = data.isDeleted;
        tradeFilesResponse.createdOn = data.createdDate;
        tradeFilesResponse.createdBy = data.createdBy;
        tradeFilesResponse.editedOn = data.editedDate;
        tradeFilesResponse.editedBy = data.editedBy;
        return cb(null, tradeFilesResponse);
    } else {
        return cb(null, null);
    }
};

TradeFilesConverter.prototype.getResponseModelOfTradeFileData = function (data, cb) {
    var tradeFilesDataList = [];
    if (data) {
        data.forEach(function (element) {
            var tradeFilesDataResponse = new TradeFilesDataResponse();
            if (element && element.id) {
                tradeFilesDataResponse.id = element.id;
                tradeFilesDataResponse.securityId = element.securityId;
                tradeFilesDataResponse.securityTypeId = element.securityTypeId;
                tradeFilesDataResponse.securityType = element.securityType;
                tradeFilesDataResponse.securitySymbol = element.securitySymbol;
                tradeFilesDataResponse.securityName = element.securityName;
                tradeFilesDataResponse.tradeExecutionTypeId = element.tradeExecutionTypeId;
                tradeFilesDataResponse.tradeActionName = element.tradeActionName;
                tradeFilesDataResponse.tradeActionId = element.tradeActionId;
                tradeFilesDataResponse.orderQty = element.orderQty;
                tradeFilesDataResponse.tradeAmount = element.tradeAmount;
                tradeFilesDataResponse.solicited = element.isSolicited ? true : false;
                // tradeFilesDataResponse.orderStatusId = element.orderStatusId;
                tradeFilesDataResponse.accountNumber = element.accountNumber;
                tradeFilesDataResponse.accountTypeId = element.accountTypeId;
                tradeFilesDataResponse.accountType = element.accountType;
                tradeFilesDataResponse.accountName = element.accountName;
                tradeFilesDataResponse.custodianId = element.custodianId;
                tradeFilesDataResponse.blockAccountNumber = element.blockAccountNumber;
                tradeFilesDataResponse.reinvestDividends = element.reinvestDividends;
                tradeFilesDataResponse.reinvestCapGains = element.reinvestCapGains;
                tradeFilesDataResponse.includeTransactionFee = element.isTransactionFeeIncluded ? 'Y' : 'N';
                tradeFilesDataResponse.combined = element.combined;
                tradeFilesDataResponse.timeInForce = element.timeInForce;
                tradeFilesDataResponse.shareQuantity = element.orderQty;//
                tradeFilesDataResponse.importType = "IMST";//
                // tradeFilesDataResponse.hasBlock = element.hasBlock;
                // tradeFilesDataResponse.blockId = element.blockId;
                // tradeFilesDataResponse.allocationStatusId = element.allocationStatusId;
                tradeFilesDataResponse.genericAccountNumber = element.blockAccountNumber;//
                tradeFilesDataResponse.orderType = element.orderType;
                tradeFilesDataResponse.masterAccountNumber = element.masterAccountNumber;
                tradeFilesDataResponse.fidelityOrderActionCode = element.fidelityOrderActionCode;
                tradeFilesDataResponse.fidelityLimitPrice = element.fidelityLimitPrice;
                tradeFilesDataResponse.fidelityPriceType = element.fidelityPriceType;
                tradeFilesDataResponse.fidelityQuantityTypeCode = element.fidelityQuantityTypeCode;
                tradeFilesDataResponse.fidelityQuantity = element.fidelityQuantity ? parseInt(element.fidelityQuantity) : 0;
                tradeFilesDataResponse.fidelityTimeInForce = element.fidelityTimeInForce;
                tradeFilesDataResponse.tdaOrderActionCode = element.tdaOrderActionCode;
                tradeFilesDataResponse.tdaQuantityTypeCode = element.tdaQuantityTypeCode;
                tradeFilesDataResponse.tdaQuantity = element.tdaQuantity ? parseInt(element.tdaQuantity) : 0;
                tradeFilesDataResponse.tdaTimeInForce = element.tdaTimeInForce;
                tradeFilesDataResponse.tdaOrderType = element.tdaOrderType;
                tradeFilesDataResponse.tdaSecurityType = element.tdaSecurityType;
                tradeFilesDataResponse.tdaLimitPrice = element.tdaLimitPrice;
                tradeFilesDataResponse.schwabOrderActionCode = element.schwabOrderActionCode;
                tradeFilesDataResponse.schwabQuantity = element.schwabQuantity ? parseInt(element.schwabQuantity) : 0;
                tradeFilesDataResponse.schwabTiming = element.schwabTiming;
                tradeFilesDataResponse.schwabSecurityType = element.schwabSecurityType;
                tradeFilesDataResponse.schwabLimitPrice = element.schwabLimitPrice;
                tradeFilesDataResponse.schwabReinvestDividends = element.schwabReinvestDividends;
                tradeFilesDataResponse.perishingOrderActionCode = element.perishingOrderActionCode;
                tradeFilesDataResponse.perishingSolicited = element.perishingSolicited;
                tradeFilesDataResponse.perishingTransaction = element.perishingTransaction;
                tradeFilesDataResponse.perishingAccountNumber = element.perishingAccountNumber;
                tradeFilesDataResponse.perishingBlockAccountNumber = element.perishingBlockAccountNumber;
                tradeFilesDataResponse.perishingDollarAmount = element.perishingDollarAmount;
                tradeFilesDataResponse.perishingShare = element.perishingShare;
                tradeFilesDataResponse.perishingReinvestDividends = element.perishingReinvestDividends;
                tradeFilesDataResponse.perishingTradeDate = moment().format('MM/DD/YYYY');
                tradeFilesDataResponse.perishingAllocationAccountNumber = element.perishingBlockAccountNumber;
                tradeFilesDataResponse.calculatedSharesOrTradeAmount = element.calculatedSharesOrTradeAmount;
                if (element.calculatedSharesOrTradeAmount != null) {
                    if (element.calculatedSharesOrTradeAmount === element.orderQty) {
                        tradeFilesDataResponse.fidelityQuantityTypeCode = "S";
                        tradeFilesDataResponse.fidelityQuantity = element.calculatedSharesOrTradeAmount ? parseInt(element.calculatedSharesOrTradeAmount) : 0;
                        tradeFilesDataResponse.tdaQuantityTypeCode = "S";
                        tradeFilesDataResponse.tdaQuantity = element.calculatedSharesOrTradeAmount ? parseInt(element.calculatedSharesOrTradeAmount) : 0;
                        tradeFilesDataResponse.schwabQuantity = element.calculatedSharesOrTradeAmount ? parseInt(element.calculatedSharesOrTradeAmount) : 0;
                        tradeFilesDataResponse.perishingDollarAmount = element.calculatedSharesOrTradeAmount ? parseInt(element.calculatedSharesOrTradeAmount) : 0;
                    } else if (element.calculatedSharesOrTradeAmount === element.tradeAmount) {
                        tradeFilesDataResponse.fidelityQuantityTypeCode = "D";
                        tradeFilesDataResponse.fidelityQuantity = element.calculatedSharesOrTradeAmount ? parseInt(element.calculatedSharesOrTradeAmount) : 0;
                        tradeFilesDataResponse.tdaQuantityTypeCode = "D";
                        tradeFilesDataResponse.tdaQuantity = element.calculatedSharesOrTradeAmount ? parseInt(element.calculatedSharesOrTradeAmount) : 0;
                        tradeFilesDataResponse.schwabQuantity = element.calculatedSharesOrTradeAmount ? parseInt(element.calculatedSharesOrTradeAmount) : 0;
                        tradeFilesDataResponse.perishingDollarAmount = element.calculatedSharesOrTradeAmount ? parseInt(element.calculatedSharesOrTradeAmount) : 0;
                    }
                }
                tradeFilesDataList.push(tradeFilesDataResponse);
            }
        }, this);
    }
    return cb(null, tradeFilesDataList);
};

module.exports = TradeFilesConverter;
