"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {

    this.isSleeve = null;
    this.generalInfo = {
        sleeveInfo: {
            id: null,
            sleeveAUM: null,
            netCash: null,
            cashTarget: null,
            cashTargetPer: null,
            cashCurrentPer: null,
            cashCurrent: null,
        },
        accountInfo: {
            id: null,
            account: null,
            custodian: null,
            type: null,
            shares: null,
            amount: null,
            costShortTerm: null,
            costLongTerm: null,
            gainAmount: null,
            gainPer: null,
            tradeGain: null,
            alternative: null,
        },
    };
    this.level1 = [];
   // this.unassigned = [];
    return lodash.assignIn(this);
};
