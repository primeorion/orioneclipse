"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var RequestModel = require('./RequestModel.js');

module.exports = function(){
	this.user = new RequestModel();
	this.search = null;
	this.exactSearch = null;
	this.reqId = null;
	this.isDeleted = null;
	this.token = null;
	lodash.assignIn(this,new BaseModel());
}