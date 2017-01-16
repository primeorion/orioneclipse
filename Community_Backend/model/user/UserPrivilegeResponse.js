"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.canAdd = null;
	this.canUpdate = null;
	this.canDelete = null;
	this.canRead = null;
	return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
}