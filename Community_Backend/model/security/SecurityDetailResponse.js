
"use strict";

var _ = require('lodash');

var BaseOutput = require('model/base/BaseOutputModel.js');

var baseModel = new BaseOutput();

var Security = {
		id : null,
		orionConnectExternalId : null,
		name : null,
		symbol : null,
		statusId : null,
		status : null,
		price: null,
		custodialCash : null,
		assetCategoryId : null,
		assetClassId : null,
		assetSubClassId : null,
		assetCategory : null,
		assetClass : null,
		assetSubClass : null,
		securityTypeId : null,
		securityType : null,
};

module.exports = function(){
	_.assign(this, Security, baseModel);
	this.custodians = [];
}
