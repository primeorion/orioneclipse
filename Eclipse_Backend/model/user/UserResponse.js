"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var BaseOutputModel = require('model/base/BaseOutputModel.js');

module.exports = function () {
	this.orionUserId = null;
    this.status = null;
    this.email = null;
    this.userLogo = null;
	this.userLoginId = null;
	this.role = { id: null, name: null };
	this.teams = [];
	this.startDate = null;
	this.expireDate = null;
	return lodash.assignIn(new BaseModel(), this, new BaseOutputModel());
}