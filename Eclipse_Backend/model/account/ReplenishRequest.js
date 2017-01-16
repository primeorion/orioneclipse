"use strict";

var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var AccountData = require('model/account/Account.js');
var accountData = new AccountData();

var requestData = {
    accountId : null,
    isReplenish: false
}

var AsideRequest = function (data) {

    accountData = lodash.assignIn(baseModel, accountData, requestData);
    return lodash.pick(lodash.defaultsDeep(data, accountData), lodash.keys(accountData));
}

module.exports = AsideRequest;