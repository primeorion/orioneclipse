"use strict";

var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var AccountData = require('model/account/Account.js');
var accountData = new AccountData();

var requestData = {
    accountIds: null,
    modelIds: null,
    security: null,
    preferences: null,
}

var TradeToTargetRequest = function (data) {

    var tradeToTarget = lodash.assignIn(baseModel, requestData);
    return lodash.pick(lodash.defaultsDeep(data, tradeToTarget), lodash.keys(tradeToTarget));
}

module.exports = TradeToTargetRequest;

