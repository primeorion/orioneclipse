"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.model = null;
	this.sleevePortfolio = null;
	this.team = null;
	this.managedValue = null;
	this.excludedValue = null;
	this.cashReserve = null;
	this.cash = null;
	return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
}