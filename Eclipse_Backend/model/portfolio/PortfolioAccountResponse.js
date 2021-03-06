"use strict";
var lodash = require("lodash");

// var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.id = null;
	this.accountId = null;
	this.name = null;
	this.accountNumber = null;
	this.accountType = null;
	this.managedValue = null;
	this.excludedValue = null;
	this.totalValue = null;
	this.pendingValue = null;
	this.status = null;
	return lodash.assignIn(this, new BaseOutputModel());
}