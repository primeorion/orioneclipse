
"use strict";

var _ = require('lodash');

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();
var RequestModel = require('model/base/RequestModel.js');

var Security = {
		symbol : null,
		status : null,
		price: null,
		custodialCash : null,
		assetCategoryId : null,
		assetClassId : null,
		assetSubClassId : null,
		securityTypeId : null,
};

module.exports = function(){
	this.custodians = []; 
	baseModel.user = new RequestModel();
	_.assign(this, Security, baseModel);
}
