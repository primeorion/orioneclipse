
"use strict";

var _ = require('lodash');

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();
var RequestModel = require('model/base/RequestModel.js');

var Security = {
		id : null,
		productName : null,
		ticker : null,
		productType : null,
		currentOrionPrice : null,	
		currentOrionPriceDate : null,
		isCustodialCash : null,
		productCategoryAbbreviation : null,
		assetClassDescription : null,	
		riskCategoryName : null
};

module.exports = function(){
	this.custodians = []; 
	baseModel.user = new RequestModel();
	_.assign(this, Security, baseModel);
}
