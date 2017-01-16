"use strict";

var Base = require('entity/base/BasicEntity.js');
var _ = require('lodash');
var base = new Base();

var RolePrivilegeBean = {
		reqId : null,
		roleId : null,
		privilegeId : null,
		canAdd : null,
		canDelete : null,
		canUpdate : null,
		canRead : null,
};

var RolePrivilegeEntity = function(){
	_.assignIn(this, RolePrivilegeBean, base);
}

module.exports = RolePrivilegeEntity;