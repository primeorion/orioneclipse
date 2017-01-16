"use strict";

var BaseInput = require('model/base/BaseInputModel.js');
//var RequestModel = require('model/base/RequestModel.js');

var lodash = require("lodash");

var roleRequest = function(){
	this.roleTypeId = null;
	this.exactSearch = null;
	this.startDate  = null;
	this.expireDate  = null;
	this.privileges = [];
	return lodash.assignIn(this, new BaseInput());
}

module.exports = roleRequest;