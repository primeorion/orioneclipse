
"use strict";

var _ = require('lodash');

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();
var RequestModel = require('model/base/RequestModel.js');

var Security = {
		description : null,
		isDynamic : null,
		toleranceType : 0,
		toleranceTypeValue : 0
};

module.exports = function(){
	this.securities = []; 
	baseModel.user = new RequestModel();
	_.assign(this, Security, baseModel);
}