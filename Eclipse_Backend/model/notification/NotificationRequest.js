"use strict";
var lodash = require("lodash");
var BaseInputModel = require('model/base/BaseInputModel.js');

module.exports = function () {
	this.ids = null;
	this.readStatus = null;
	return lodash.assignIn(new BaseInputModel(), this);
}
