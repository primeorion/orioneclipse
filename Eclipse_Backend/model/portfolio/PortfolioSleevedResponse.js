"use strict";
var lodash = require("lodash");

var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.id = null;
	this.accountId = null;
	this.name = null;
	this.accountNumber = null;
	this.accountType = null;
	this.model = null;
	this.managementStyle = null;
	this.managedValue = null;
	this.managedValue = null;
	this.excludedValue = null;
	this.totalValue = null;
	this.pendingValue = null;

	this.sleeveType = null;
	this.sleeveTarget = null;
	this.sleeveContributionPercent = null;
	this.sleeveDistributionPercent = null;
	this.sleeveToleranceLower = null;
	this.sleeveToleranceUpper = null;

	this.status = null;
	this.statusInfo = null;
	return lodash.assignIn(this, new BaseOutputModel());
}