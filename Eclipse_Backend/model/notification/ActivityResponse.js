"use strict";
var lodash = require("lodash");

var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.id = null;
    this.name = null;
    this.description = null;
	this.isCompleted = null;
	return lodash.assignIn(this, new BaseOutputModel());
}