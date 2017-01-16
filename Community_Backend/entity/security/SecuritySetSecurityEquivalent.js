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
		equivalentSecurityId : null,
		taxableSecurityId : null,
		taxDeferredSecurityId : null,
		taxExemptSecurityId : null,
	    minTradeAmount : null,
	    minInitialBuyDollar : null,
	    buyPriority : null,
	    sellPriority : null,
	    rank : 0
};

module.exports = function(){
	_.assign(this, Security, basicEntity);
}