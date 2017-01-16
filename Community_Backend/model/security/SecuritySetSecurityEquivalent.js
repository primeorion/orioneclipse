"use strict";

var _ = require('lodash');

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();
var RequestModel = require('model/base/RequestModel.js');

var Security = {
		securitySetId : null,
		securityId : null,
		equivalentSecurityId : null,
		taxableSecurityId : null,
		taxDeferredSecurityId : null,
		taxExemptSecurityId : null,
		minTradeAmount : null,
	    minInitialBuyDollar : null,
	    buyPriority : null,
	    sellPriority : null,
		rank : null
};

module.exports = function(){
	baseModel.user = new RequestModel();
	_.assign(this, Security, baseModel);
}