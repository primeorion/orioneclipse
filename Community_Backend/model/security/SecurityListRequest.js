"use strict";

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();

var _ = require('lodash');

var Security = function(){
	this.search = null;
	this.assetClassId = null,
	this.assetCategoryId = null,
	this.assetSubClassId = null, 
	_.assign(this,baseModel);
};


module.exports = Security;