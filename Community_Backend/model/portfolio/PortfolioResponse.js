"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.model = null;
	this.team = null;
	this.managedValue = null;
	this.excludedValue = null;
	this.totalValue = null;
	this.action = null;
	this.tradesPending = null;
	this.percentDeviations = null;
	this.cashReserve = null;
	this.cashNeed = null;
	this.cash = null;
	this.cashPercent = null; 
	this.minCash = null;
	this.minCashPercent = null;
	this.totalCash = null;
	this.totalCashPercent = null;
	this.autoRebalanceDate = null;
	this.OUB = null;
	this.contribution = null;
	this.tradeBlocked = null;
	this.status = null;
	this.TLH = null;
	this.advisor = null;
	this.value = null;
	this.style = null;
	this.lastRebalancedOn = null;
	return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
}