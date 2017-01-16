"use strict";

var BaseInput = require('model/base/BaseInputModel.js');

var lodash = require("lodash");

var roleList = function(){
	this.roleType = null;
	this.search = null;
	return lodash.assignIn(this, new BaseInput());	
}

module.exports = roleList;