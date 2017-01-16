"use strict";
var lodash = require("lodash");
var BaseInputModel = require('model/base/BaseInputModel.js');

module.exports = function () {
	this.firstName = null;
	this.lastName = null;
	this.orionConnectExternalId = null;
    this.status = null;
    this.email = null;
	this.firmId =  null;
	this.userLoginId = null;
	this.roleId = null;
	this.teamIds = [];
	this.teamId = null;
	this.startDate = null;
	this.expireDate = null;
	return lodash.assignIn(new BaseInputModel(), this);
}
