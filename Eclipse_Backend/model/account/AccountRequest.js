"use strict";
var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var AccountData = require('model/account/Account.js');
var accountData = new AccountData();

var requestData = {
    orionConnectExternalId: null,
    orionConnectFirmId: null,
    accountNumber: null,
    portfolioId: null,
    accountType:null
}

var AccountRequest = function (data) {
    accountData = lodash.assignIn(baseModel, accountData, requestData);
    return lodash.pick(lodash.defaultsDeep(data, accountData), lodash.keys(accountData));
}
module.exports = AccountRequest;