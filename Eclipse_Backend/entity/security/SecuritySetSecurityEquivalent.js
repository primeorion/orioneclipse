/**
 * 
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Security = {
		tableName : 'securityEquivalenceInSecuritySet',
		columns : {
			securitySetId : 'securityEquivalenceInSecuritySet.securitySetId',
			securityId : 'securityEquivalenceInSecuritySet.securityId',
			equivalentSecurityId : 'securityEquivalenceInSecuritySet.equivalentSecurityId',
			taxableSecurityId : 'securityEquivalenceInSecuritySet.taxableSecurityId',
			taxDeferredSecurityId : 'securityEquivalenceInSecuritySet.taxDeferredSecurityId',
			taxExemptSecurityId : 'securityEquivalenceInSecuritySet.taxExemptSecurityId',
			minTradeAmount : 'securityEquivalenceInSecuritySet.minTradeAmount',
			minInitialBuyDollar : 'securityEquivalenceInSecuritySet.minInitialBuyDollar',
			buyPriority : 'securityEquivalenceInSecuritySet.buyPriority',
			sellPriority : 'securityEquivalenceInSecuritySet.sellPriority',
			rank : 'securityEquivalenceInSecuritySet.rank',
			isDeleted : 'securityEquivalenceInSecuritySet.isDeleted',
			createdBy : 'securityEquivalenceInSecuritySet.createdBy',
			createdDate : 'securityEquivalenceInSecuritySet.createdDate',
			editedBy : 'securityEquivalenceInSecuritySet.editedBy',
			editedDate : 'securityEquivalenceInSecuritySet.editedDate'	
		}
};

module.exports = Security;