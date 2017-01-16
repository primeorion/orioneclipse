"use strict";
var lodash = require("lodash");
var BaseEntity = require('entity/base/BaseEntity.js');
var custodian = new BaseEntity();
custodian.id = null;
custodian.externalId = null;
custodian.code = null;
custodian.masterAccountNumber = null;
custodian.custodianTradeExecutionTypeId = null;
custodian.securityTypeId = null;
custodian.securityTypeName = null;
custodian.tradeExecutionTypeId = null;
custodian.tradeExecutionTypeName = null;
var User = function (data) {
    return this.data = this.sanitize(data);
}

User.prototype.sanitize = function (data) {
    if (Array.isArray(data)) {
        var custodians = lodash.map(data, function (custodian) {
            return lodash.pick(custodian, lodash.keys(custodian))
        });
        return custodians;
    } else {
        data = data || {};
        return lodash.pick(data, lodash.keys(custodian));
    }

}
module.exports = User;
