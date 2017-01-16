"use strict";

var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var SecurityData = require('model/community/security/Security.js');
var securityData = new SecurityData();

var requestData = {
    symbol: null,
    securityType: null,
    category: null,
    assetClass: null,
    subClass: null,
    custodialCash: null,

}

var SecurityRequest = function (data) {
    securityData = lodash.assignIn(baseModel, securityData, requestData);
    return lodash.pick(lodash.defaultsDeep(data, securityData), lodash.keys(securityData));
}

module.exports = SecurityRequest;