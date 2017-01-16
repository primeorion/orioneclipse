"use strict";

var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var AccountData = require('model/account/Account.js');
var accountData = new AccountData();

var requestData = {
    accountIds: null,
    portfolioIds: null,
    modelIds: null,
    tradeGroupIds: null,
    security: null,
    notes: null,
}

var GlobalTradeRequest = function (data) {

    accountData = lodash.assignIn(baseModel, accountData, requestData);
    return lodash.pick(lodash.defaultsDeep(data, accountData), lodash.keys(accountData));
}

module.exports = GlobalTradeRequest;

