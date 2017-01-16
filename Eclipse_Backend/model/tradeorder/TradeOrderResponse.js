"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');
module.exports = function () {
	this.id = null;
    this.isEnabled = true;
    this.account = {
        id: null,
        accountId : null,
        name : null,
        number : null,
        value: null,
        type : null        
    };
    this.warningMessage = null;
    this.action = null;
    this.orderQty = null;
    this.orderPercent = null;
    this.cashValuePostTrade = null;
    this.estimateAmmount = null;
    this.price = null;
    this.createdBy = null;
    this.createdDate = null;
    this.instanceDescription = null;
    this.tradingInstructions = null;
    this.custodian = null;
    this.security ={
        id: null,
        name : null,
        symbol : null,
        securityType : null
    };
    this.model ={
        id: null,
        name : null
    };
    this.portfolio ={
        id: null,
        name : null,
        isSleevedPortfolio: false
    };
    this.holdUntil = null;
    this.allocationStatus = {
        id : null,
        name : null
    }
    this.approvalStatus = {
        id : null,
        name : null
    }
    this.holding = {
        id : null,
        units : null
    }
    this.blockId = null;
    this.cashValue = null;
    this.daysUntilLongTerm = null;
    this.execInst = null;
    this.expireTime = null;
    this.fullSetDate = null;
    this.gainLossMessage = null;
    this.handlInst = null;
    this.hasBlock = false;  
    this.instanceId = null;
    this.instanceNotes = null;
    this.isDiscretionary = null;
    this.locateReqd = null;
    this.longTermGain = 0;
    this.managementStyle = null;
    this.masterAccountNumber = null;
    this.marketValue = 0;
    this.notes= null;
    this.orderStatus = {
        id : null,
        name : null
    }
    this.orderType = {
        id : null,
        name : null
    }
    this.originalOrderQty = null;
    this.isQualified = false;
    this.rebalanceLevel = {
        id : null,
        name: null
    };
    this.reinvestDividends = false;
    this.reinvestLongTermGains = false;
    this.reinvestShortTermGains = false;
    this.rowVersion = null;
    this.settlementType = {
        id : null,
        name : null
    }
    this.pendingUnits = null;
    this.shortTermGain = null;
    this.stopPrice = null;
    this.timeInForce = null;
    this.totalGain = null;
    this.tradePercentOfAccount = null;
    this.transactionId = null;
    this.washAmount = null;
    this.washUnits = null;
    this.assetClassName = null;
    this.clientDirect = null;
    this.minimmCashBalance = null;
    this.repNotes = null;
    this.representativeName = null;
    this.isSolicited = null;
    this.isAutoAllocate = null;
    this.canEdit = false;
    this.canExecute = false;
    this.currentModelName = null;
    this.duration = {
        id : null,
        name : null
    }
    this.shortCodeMessages = null;
    return lodash.assignIn(this);
}


