"use strict";
var lodash = require("lodash");
var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {

	this.value = null;
	this.source = null;
	this.accountId = null;
	this.accountNumber = null;
	this.accountName = null;
	this.modelId = null;
	this.sleevePortfolio = null;

	return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
}