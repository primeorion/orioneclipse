"use strict";

var BaseOutput = require('model/base/BaseOutputModel.js');

var lodash = require('lodash');

var RoleDetail = function(){
	this.id = null;
	this.name = null;
	this.status = null;
	this.roleTypeId = null;
	this.roleType = null;	
	this.startDate = null;
	this.expireDate = null;
	this.privileges =  [];
	return lodash.assignIn(this, new BaseOutput());
};                           

module.exports = RoleDetail;