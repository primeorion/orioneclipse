"use strict";
var lodash = require("lodash");
//var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    //account detail general section
    this.id = null;
    this.accountNumber = null;
    // this.accountType = null;
    this.accountId = null;
    this.name = null;
    this.billingAccount = null;
    this.portfolio = null;
    this.custodian = null;
    this.sleeveType = null;
    this.advisior = null;
    this.ssn = null;
    this.model = null;
    this.style = null;
    this.registrationId = null;
    this.registrationId = null;
    this.isReplenish = null;
    
    //account detail sleeve section
    this.sleeveContributionPercent = null;
    this.sleeveDistributionPercent = null;
    this.sleeveTarget = null;
    this.sleeveToleranceLower = null;
    this.sleeveToleranceUpper = null;
    this.smaTradeable = null;
    this.sleeveCureent = null;

    //account detail summary section
    this.summarySection = {
        grandTotal: null,
        totalValue: null,
        managedValue: null,
        excludedValue: null,
        totalCashValue: null,
        cashReserve: null,
        cashAvailable: null,
        setAsideCash: null,

    }
      //account detail Gain-Loss section
    this.ytdGl = {
        totalGainLoss: null,
        shortTermGL: null,
        longTermGL: null,
        shortTermGLStatus: null,
        longTermGLStatus: null,
        totalGainLossStatus: null
    }
      //account detail holding section
    this.accountValue = {
        totalValueOn: null,
        totalValue: null,
        status: null,
        holdings: []
    }
     //account detail error And Warnings
    this.errorAndWarnings = {
        systematic: null,
        mergeIn: null,
        mergeOut: null,
        newAccount: null,
        hasPortfolios: null,
        custodialRestrictions: null,
        sma: null,
        importError: null,
        hasPendingTrades: null
    }

    return lodash.assignIn(this, new BaseOutputModel());
};
