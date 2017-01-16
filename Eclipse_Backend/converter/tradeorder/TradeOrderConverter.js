    "use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var util = require('util');
var TradeResponse = require("model/tradeorder/TradeOrderResponse.js");

var messages = config.messages;
var logger = helper.logger(moduleName);
var enums = config.applicationEnum;
var TradeOrderConverter = function () { }

TradeOrderConverter.prototype.getResponseOfTradeList = function (data, cb) {
    logger.debug("Converting data to tradeListData in getResponseOfTradeList()");
    var self = this;
    var tradeOrderList = [];
    if (data) {
        data.forEach(function (trade) {
            if (trade.tradeId) {
                var tradeResponse = new TradeResponse();
                tradeResponse.id = trade.tradeId;
                tradeResponse.action = trade.action;
                tradeResponse.isEnabled = trade.isEnabled == 1 ? true : false;
                tradeResponse.estimateAmmount = trade.estimateAmount;
                tradeResponse.price = trade.price;
                tradeResponse.createdBy = trade.createdBy;
                tradeResponse.createdDate = trade.createdDate;
                tradeResponse.editedBy = trade.editedBy;
                tradeResponse.editedDate = trade.editedDate;
                tradeResponse.warningMessages = trade.warningMessage;
                tradeResponse.tradeOrderMessage = trade.tradeOrderMessages;
                tradeResponse.orderQty = trade.orderQty;
                tradeResponse.orderPercent = trade.orderPercent;
                tradeResponse.cashValuePostTrade = trade.cashValuePostTrade ? trade.cashValuePostTrade : null;
               // tradeResponse.tradingInstructions = trade.tradingInstructions;
                tradeResponse.account.id = trade.idAccount; 
                tradeResponse.account.accountId = trade.accountId;
                tradeResponse.account.number = trade.accountNumber;
                tradeResponse.account.name = trade.accountName;
                tradeResponse.account.value = trade.accountValue;
                tradeResponse.account.type = trade.accountType;
                tradeResponse.security.symbol = trade.securitySymbol;
                tradeResponse.security.name = trade.securityName;
                tradeResponse.security.id = trade.securityId;
                tradeResponse.security.securityType = trade.securityType;
                tradeResponse.custodian = trade.custodianName;
                tradeResponse.portfolio.id = trade.portfolioId;
                tradeResponse.portfolio.name = trade.portfolioName;
                tradeResponse.portfolio.isSleevedPortfolio = trade.isSleevePortfolio == 1 ? true : false;
                tradeResponse.orderType.id = trade.orderTypeId; 
                tradeResponse.orderType.name = trade.orderType;
                tradeResponse.allocationStatus.id = trade.allocationStatusId;
                tradeResponse.allocationStatus.name = trade.allocationStatusName;
                tradeResponse.approvalStatus.id = trade.approvalStatusId;
                tradeResponse.approvalStatus.name = trade.tradeApprovalStatus;
                tradeResponse.holding.id = trade.holdingId;
                tradeResponse.holding.units = trade.holdingUnits;
                //tradeResponse.blockId = 1;
                tradeResponse.cashValue = trade.cashValue;
                tradeResponse.daysUntilLongTerm = trade.daysUntilLongTerm;
                tradeResponse.execInst = trade.execInst;
                tradeResponse.expireTime = trade.expireTime;
                tradeResponse.fullSetDate = trade.fullSetDate;
                tradeResponse.gainLossMessage = trade.gainLossMessage;
                tradeResponse.handlInst = trade.handlInst;
                tradeResponse.hasBlock = trade.hasBlock == 1 ? true : false;
                tradeResponse.instanceId = trade.instanceId;
                tradeResponse.instanceNotes = trade.instanceNotes;
                tradeResponse.isDiscretionary = trade.isDiscretionary == 1 ? true : false;
                tradeResponse.locateReqd = trade.isLocateRequired == 1 ? true : false;
                tradeResponse.longTermGain = trade.longTermGain;
                tradeResponse.managementStyle = trade.managementStyle;
                tradeResponse.masterAccountNumber = trade.masterAccountNumber;
                tradeResponse.marketValue = trade.marketValue;
                tradeResponse.notes = trade.notes;
                if(trade.orderStatus == null){
                    tradeResponse.orderStatus.id = null;
                    if(trade.isEnabled){
                        tradeResponse.orderStatus.name = "Enabled";
                    }
                    else {
                        tradeResponse.orderStatus.name = "Disabled";
                    }
                }
                else {
                    tradeResponse.orderStatus.id = trade.orderStatusId;
                    tradeResponse.orderStatus.name = trade.orderStatusName;
                }
                tradeResponse.originalOrderQty = trade.originalOrderQty;
                tradeResponse.isQualified = trade.qualified == 1 ? true : false;
                tradeResponse.rebalanceLevel.id = trade.rebalanceLevelId;
                tradeResponse.rebalanceLevel.name = trade.rebalanceLevel;
                tradeResponse.reinvestDividends = trade.reinvestDividends == 1 ? true : false;
                tradeResponse.reinvestLongTermGains = trade.reinvestLongTermGains == 1 ? true : false;
                tradeResponse.reinvestShortTermGains = trade.reinvestShortTermGains == 1 ? true : false;
                tradeResponse.rowVersion = trade.rowversion;
                tradeResponse.settlementType.id = trade.settlementTypeId;
                tradeResponse.settlementType.name = trade.settlementName;
                tradeResponse.pendingUnits = trade.pendingUnits;
                tradeResponse.shortTermGain = trade.shorttermGain;
                tradeResponse.stopPrice = trade.stopPrice;
                //tradeResponse.timeInForce = "Day";
                tradeResponse.totalGain = trade.totalGain;
                tradeResponse.tradePercentOfAccount = trade.tradePercentageOfAccount;
                tradeResponse.transactionId = trade.transactionId;
                tradeResponse.washAmount = trade.washAmount;
                tradeResponse.washUnits = trade.washUnits;
                tradeResponse.assetClassName = trade.assetClassName;
                tradeResponse.clientDirect = trade.isClientDirected == 1 ? true : false;
                tradeResponse.minimmCashBalance = trade.minCashBalance;
                tradeResponse.repNotes = null;
                tradeResponse.representativeName = trade.representativeName;
                tradeResponse.isSolicited = trade.isSolicited == 1 ? true : false;
                tradeResponse.holdUntil = trade.holdUntil;
                tradeResponse.currentModelName = trade.currentModelName;
                tradeResponse.model.id = trade.orderModelId;
                tradeResponse.model.name = trade.orderModelName;
                tradeResponse.canEdit = trade.canUpdate ? true: false;
                tradeResponse.canExecute = trade.canExecute ? true: false;
                tradeResponse.duration.id = trade.durationId;
                tradeResponse.duration.name = trade.durationName;
                tradeResponse.shortCodeMessages = trade.shortCodeMessages;
         //       tradeResponse.isAutoAllocate = trade.isAutoAllocate;
                tradeOrderList.push(tradeResponse);
             }
        }, this);
    }
    return cb(null, tradeOrderList);
};

TradeOrderConverter.prototype.getTradeDetail = function (data, cb) {
    logger.debug("Converting trade data entity to trade detail in getTradeDetail()");
    var tradeResponse = {};
    if (data) {
          data.forEach(function (trade) {
            if (trade.id) {
                tradeResponse.id = trade.id;
               // tradeResponse.action = trade.action;
                tradeResponse.isEnabled = trade.isEnabled;
                tradeResponse.estimateAmount = trade.estAmount;
                tradeResponse.price = trade.price;
                tradeResponse.createdBy = trade.createdBy;
                tradeResponse.createdDate = trade.createdDate;
                tradeResponse.editedBy = trade.editedBy;
                tradeResponse.editedDate = trade.editedDate;
                tradeResponse.warningMessage = trade.warningMessage;
                tradeResponse.orderQty = trade.orderQty;
                tradeResponse.orderPercent = trade.orderPercent;
                tradeResponse.cashValuePostTrade = trade.cashValuePostTrade;
                tradeResponse.tradingInstructions = trade.tradingInstructions;
                var account = {};
                account.id = trade.accId; 
                account.accountId = trade.accountId;
                account.number = trade.accountNumber;
                account.name = trade.accountName;
                tradeResponse.account = account;
                var security = {};
                security.symbol = trade.securitySymbol;
                security.name = trade.securityName;
                security.id = trade.securityId;
                security.securityType = trade.securityType;
                tradeResponse.security = security;
                tradeResponse.custodian = trade.custodian;
                tradeResponse.limitPrice = trade.limitPrice;
                tradeResponse.stopPrice = trade.stopPrice;
                var orderType = {};
                orderType.id = trade.orderTypeId;
                orderType.name = trade.orderTypeName;
                tradeResponse.orderType = orderType;
                var qualifier = {};
                qualifier.id = trade.qualifierId;
                qualifier.name = trade.qualifierName;
                tradeResponse.qualifier = qualifier;
                var duration = {};
                duration.id = trade.durationId;
                duration.name = trade.durationName;
                tradeResponse.duration = duration;
                var action = {};
                action.id = trade.tradeActionId;
                action.name = trade.tradeActionName;
                tradeResponse.action = action;
                tradeResponse.isDiscretionary = trade.isDiscretionary;
                tradeResponse.isSolicited = trade.isSolicited;
                tradeResponse.isAutoAllocate = trade.isAutoAllocate;
             }
          },this);
        };
    return cb(null, tradeResponse);
};
TradeOrderConverter.prototype.getTradeDetailEntity = function (data, cb) {
    logger.debug("Converting data to trade data entity in getTradeDetailEntity()");
    var tradeEntity = {};
    var trade = data;
    tradeEntity.id = trade.tradeId;
    tradeEntity.price = trade.price;
    tradeEntity.orderQty = trade.orderQty;
    tradeEntity.limitPrice = trade.limitPrice;
    tradeEntity.stopPrice = trade.stopPrice;
    tradeEntity.orderTypeId = trade.orderTypeId ? trade.orderTypeId : null;
    tradeEntity.qualifierId = trade.qualifierId ? trade.qualifierId : null;
    tradeEntity.durationId = trade.durationId ? trade.durationId : null;
    tradeEntity.tradeActionId = trade.actionId;
    tradeEntity.isDiscretionary = trade.isDiscretionary;
    tradeEntity.isSolicited = trade.isSolicited;
    tradeEntity.isAutoAllocate = trade.isAutoAllocate;
    tradeEntity.isSendImmediately = trade.isSendImmediately;
    tradeEntity.approvalStatusId = enums.TRADE_ORDER.APPROVAL_TYPE_PENDING_APPROVAL;
    return cb(null, tradeEntity);
};
TradeOrderConverter.prototype.getNewEntity = function (data, cb) {
    logger.debug("Converting data to trade data entity in getTradeDetailEntity()");
    var tradeEntity = {};
    var trade = data;
    tradeEntity.accountId = trade.accountId;
    tradeEntity.portfolioId = trade.portfolioId ? trade.portfolioId : null;
    tradeEntity.securityId = trade.securityId; 
    tradeEntity.tradeActionId = trade.tradeActionId;
    tradeEntity.price = trade.price;
    tradeEntity.orderQty = trade.orderQty;
    tradeEntity.tradeOrderMessages = trade.tradeOrderMessages;                
    tradeEntity.orderPercent = trade.orderPercent ? trade.orderPercent : null;
    tradeEntity.warningMessages = trade.warningMessage;
    tradeEntity.custodianId = trade.custodianId;
    tradeEntity.positionId = trade.positionId ? trade.positionId : null;
    tradeEntity.modelId = trade.modelId ? trade.modelId : null;
    tradeEntity.advisorId = trade.advisorId ? trade.advisorId : null;
    tradeEntity.cashValuePostTrade = trade.cashValuePostTrade ? trade.cashValuePostTrade : null;
    tradeEntity.orderTypeId = trade.orderTypeId ? trade.orderTypeId : null;
    tradeEntity.limitPrice = trade.limitPrice ? trade.limitPrice : null;
    tradeEntity.stopPrice = trade.stopPrice ? trade.stopPrice : null;
    tradeEntity.qualifierId = trade.qualifierId ? trade.qualifierId : null;
    tradeEntity.durationId = trade.durationId ? trade.durationId : null;
    tradeEntity.approvalStatusId = enums.TRADE_ORDER.APPROVAL_TYPE_PENDING_APPROVAL;
    tradeEntity.holdUntil = trade.holdUntil ? trade.holdUntil : null;
    tradeEntity.accountValue = trade.accountValue;
    tradeEntity.settlementTypeId = trade.settlementTypeId ? trade.settlementTypeId : null;
    tradeEntity.originalOrderQty = trade.orderQty;
    tradeEntity.isSendImmediately = trade.isSendImmediately;
    tradeEntity.marketValue = trade.marketValue;
    tradeEntity.isEnabled = trade.isEnabled == undefined || trade.isEnabled == null ? true : trade.isEnabled;
    tradeEntity.tradeAmount = trade.tradeAmount ? trade.tradeAmount: 0;
    tradeEntity.notes = null;
    return cb(null, tradeEntity);
};


TradeOrderConverter.prototype.convertJsonToValidateData = function (data, cb) {
    logger.debug("Converting data to trade data entity in getTradeDetailEntity()");
    var tradeEntity = {};
    var trade = data;
    tradeEntity.id = trade.id;
    tradeEntity.accountId = trade.accountId;
    tradeEntity.portfolioId = trade.portfolioId;
    tradeEntity.securityId = trade.securityId; 
    tradeEntity.actionId = trade.actionId;
    tradeEntity.price = trade.price;
    tradeEntity.orderQty = trade.orderQty;
    tradeEntity.orderPercent = trade.orderPercent;
    return cb(null, tradeEntity);
};
module.exports = TradeOrderConverter;
