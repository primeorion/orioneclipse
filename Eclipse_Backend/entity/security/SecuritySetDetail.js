/**
 * 
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var SecuritySetDetail = {
		tableName : 'securitySetDetail',
		columns : {
			securitySetId : 'securitySetDetail.securitySetId',
			securityId : 'securitySetDetail.securityId',
			rank : 'securitySetDetail.rank',
			targetPercent : 'securitySetDetail.targetPercent',
			lowerModelTolerancePercent : 'securitySetDetail.lowerModelTolerancePercent',
			upperModelTolerancePercent : 'securitySetDetail.upperModelTolerancePercent',
			minTradeAmount : 'securitySetDetail.minTradeAmount',
			minInitialBuyDollar : 'securitySetDetail.minInitialBuyDollar',
			buyPriority : 'securitySetDetail.buyPriority',
			sellPriority : 'securitySetDetail.sellPriority',
			taxableSecurityId : 'securitySetDetail.taxableSecurityId',
			taxDeferredSecurityId : 'securitySetDetail.taxDeferredSecurityId',
			taxExemptSecurityId : 'securitySetDetail.taxExemptSecurityId',
			lowerModelToleranceAmount : 'securitySetDetail.lowerModelToleranceAmount',
			upperModelToleranceAmount : 'securitySetDetail.upperModelToleranceAmount',
			lowerTradeTolerancePercent : 'securitySetDetail.lowerTradeTolerancePercent',
			upperTradeTolerancePercent : 'securitySetDetail.upperTradeTolerancePercent',
			isDeleted : 'securitySetDetail.isDeleted',
			createdBy : 'securitySetDetail.createdBy',
			createdDate : 'securitySetDetail.createdDate',
			editedBy : 'securitySetDetail.editedBy',
			editedDate : 'securitySetDetail.editedDate'			
		}
}

module.exports = SecuritySetDetail;