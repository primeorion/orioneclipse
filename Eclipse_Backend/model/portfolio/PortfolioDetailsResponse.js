"use strict";
var lodash = require("lodash");

var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
    this.id = null;
    this.general = {
        portfolioName : null,
        sleevePortfolio : null,
        modelId : null,
        modelName : null,
        custodialAccountNumber : null,
        registrationId : null,
        sleeveStrategy : null,
        contributionMethod : null,
        distributionMethod : null,
        autoRebalance : null,
        monthAndDate : null,
        doNotTrade : null,
        tags : null
    };
    this.teams = [];
    this.issues = {
        outOfTolerance : null,
        cashNeed : null,
        setForAutoRebalance : null,
        contributions : null,
        distribution : null,
        modelAssociation : null,
        doNotTrade : null,
        TLHOpportunity : null,
        dataErrors : null,
        pendingTrades : null
    };
    this.summary = {
        analyticsOn : null,
        AUM : {
            total : null,
            totalValue : null,
            managedValue : null,
            excludedValue : null,
            totalCash : {
                total : null,
                reserve : null,
                setAsideCash : null,
                cash : null
            }
        },
        realized : {
            total : null,
            totalStatus : null,
            shortTerm : null,
            shortTermStatus : null,
            longTerm : null,
            longTermStatus : null
        }
    };

    return lodash.assignIn(this, new BaseOutputModel());
}