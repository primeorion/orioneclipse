"use strict";

var baseInput = new (require('model/base/BaseInputModel.js'))();

var _ = require("lodash");

var roleListRequest = {
		canAdd : null,
		canDelete : null,
		canRead : null,
		canUpdate : null
};

var privilegeRequest = function(){
	_.assignIn(this,roleListRequest, baseInput);
}

module.exports = privilegeRequest;