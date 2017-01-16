/**
 * 
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

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
		upperModelToleranceAmount : null,
		lowerTradeTolerancePercent : null,
		upperTradeTolerancePercent : null
}

module.exports = function(){
	_.assign(this, Security, basicEntity);
}