"use strict";
var lodash = require("lodash");

var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.id = null;
    this.subject = null;
    this.body = null;
	this.readStatus = null;
	this.notificationCategory =  {
		id: null,
		name:null
	},
	this.notificationCategoryType = {
		id: null,
		name: null,
		code: null
	}
	return lodash.assignIn(this, new BaseOutputModel());
}