"use strict";

var ModelElement = {
		tableName : 'modelDetails',
		columns : {
			id : 'modelDetails.id',
			modelId : 'modelDetails.modelId',
			modelElementId : 'modelDetails.modelElementId',
			leftValue : 'modelDetails.leftValue',
			rightValue : 'modelDetails.rightValue',
			rank : 'modelDetails.rank',
			level : 'modelDetails.level',
			isSubstituted : 'modelDetails.isSubstituted',
			substituteOf : 'modelDetails.substituteOf',
			targetPercent : 'modelDetails.targetPercent',
			lowerModelTolerancePercent : 'modelDetails.lowerModelTolerancePercent',
			upperModelTolerancePercent : 'modelDetails.upperModelTolerancePercent',
			toleranceType : 'modelDetails.toleranceType',
			toleranceTypeValue : 'modelDetails.toleranceTypeValue',
			lowerModelToleranceAmount : 'modelDetails.lowerModelToleranceAmount',
			upperModelToleranceAmount : 'modelDetails.upperModelToleranceAmount',
			lowerTradeTolerancePercent : 'modelDetails.lowerTradeTolerancePercent',
			upperTradeTolerancePercent : 'modelDetails.upperTradeTolerancePercent',
			isDeleted : 'modelDetails.isDeleted',
			createdBy : 'modelDetails.createdBy',
			createdDate : 'modelDetails.createdDate',
			editedBy : 'modelDetails.editedBy',
			editedDate : 'modelDetails.editedDate',
		}
}

module.exports = ModelElement;