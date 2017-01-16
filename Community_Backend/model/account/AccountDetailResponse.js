"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.accountNumber = null;
    this.accountType = null;
    this.accountId = null;
    this.name = null;
    this.billingAccount = null;
    this.portfolio = null;
    this.custodian = null;
    this.sleeveType = null;
    this.advisior = null;
    this.ssn = null;
    this.ytdGl = { totalGainLoss: null, shortTermGL: null, longTermGL: null };
    this.accountValue = [];
   // this.accountValue = {
     //   totalValueOn: null,
     //   totalValue: null,
       // holdings = { name: null, marketValue: null, units: null, price: null, percentage: null },
  //  },

        this.issues = {
            systematic: null, mergeIn: null, merge: null,
            newAccount: null, hasPortfolios: null, custodialRestrictions: null,
            sma: null, importError: null, hasPendingTrades: null
        }

    return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
};
