"use strict";

var _ = require('lodash');

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();
var RequestModel = require('model/base/RequestModel.js');

var Security = {
		securitySetId : null,
		securityId : null,
		rank : null,
		targetPercent : null,
		lowerModelTolerancePercent : null,
		upperModelTolerancePercent : null,
		minTradeAmount : null,
		minInitialBuyDollar : null,
		buyPriority : null,
		sellPriority : null,
		taxableSecurityId : null,
		taxDeferredSecurityId : null,
		taxExemptSecurityId : null,
		lowerModelToleranceAmount : null,
		upperModelToleranceAmount : null
};

module.exports = function(){
	this.equivalences = []; 
	this.tlh = [];
	baseModel.user = new RequestModel();
	_.assign(this, Security, baseModel);
}