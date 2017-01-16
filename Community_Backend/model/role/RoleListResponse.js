"use strict";



var BaseOutput = require('model/base/BaseOutputModel.js');
var BaseModel = require('model/base/BaseModel.js');
var lodash = require("lodash");


var role = function(){
	this.roleType = null;
	this.numberOfUsers = null;
	this.status = null;
	this.startDate = null;
	this.expireDate = null;
	return lodash.assignIn(new BaseModel(), this, new BaseOutput());
};

module.exports = role;




