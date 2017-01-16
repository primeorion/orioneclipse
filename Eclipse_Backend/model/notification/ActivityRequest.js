"use strict";
var lodash = require("lodash");
var BaseInputModel = require('model/base/BaseInputModel.js');

module.exports = function () {
	this.name = null;
	this.description = null;
	this.isCompleted = null;
	return lodash.assignIn(new BaseInputModel(), this);
}
