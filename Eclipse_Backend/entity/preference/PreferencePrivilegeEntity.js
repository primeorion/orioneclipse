"use strict";
var lodash = require("lodash");

var privilege = new function () {
    this.roleId = null;
    this.privilegeId = null;
    this.canAdd = null;
    this.canUpdate = null;
    this.canDelete = null;
    this.canRead = null;
    this.isDeleted = null;
    this.createdDate = null;
    this.createdby = null;
    this.editedDate = null;
    this.editedby = null;
    this.id = null;
    this.code = null;
    this.name = null;
    this.type = null;
    this.userLevel = null;
    this.category = null;
}

var PreferencePrivilegeEntity = function (data) {
    var self = this;
    if (data instanceof Array) {
        var privileges = [];

        data.forEach(function (privilege) {
            var sanitizedObj = self.sanitize(privilege);
            privileges.push(sanitizedObj);
        });

        return privileges;
    } else if (data instanceof Object) {

        return self.data = self.sanitize(data);
    }
};

PreferencePrivilegeEntity.prototype.sanitize = function (data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, privilege), lodash.keys(privilege));
};

module.exports = PreferencePrivilegeEntity;
