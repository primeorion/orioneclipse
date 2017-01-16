"use strict";
var lodash = require("lodash");
var BaseInputModel = require('model/base/BaseInputModel.js');


var SmaRequest = function () {
	this.accountId = null;
	this.subModelId = null;
	this.subModelName = null;
	this.weightPercent = null;
	this.modelId = null;
	this.modelDetailId = null;
    this.selectedLevelId = null;

	return lodash.assignIn(new BaseInputModel(), this);
}

module.exports = SmaRequest;