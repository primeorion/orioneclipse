"use strict";

var ModelElement = {
		tableName : 'tempModelDetails',
		columns : {
			id : 'tempModelDetails.id',			
			modelId : 'tempModelDetails.modelId',
			modelElementId : 'tempModelDetails.modelElementId',
			leftValue : 'tempModelDetails.leftValue',
			rightValue : 'tempModelDetails.rightValue',
			rank : 'tempModelDetails.rank',
			level : 'tempModelDetails.level',
			isSubstituted : 'tempModelDetails.isSubstituted',
			substituteOf : 'tempModelDetails.substituteOf',
			targetPercent : 'tempModelDetails.targetPercent',
			lowerModelTolerancePercent : 'tempModelDetails.lowerModelTolerancePercent',
			upperModelTolerancePercent : 'tempModelDetails.upperModelTolerancePercent',
			toleranceType : 'tempModelDetails.toleranceType',
			toleranceTypeValue : 'tempModelDetails.toleranceTypeValue',
			lowerModelToleranceAmount : 'tempModelDetails.lowerModelToleranceAmount',
			upperModelToleranceAmount : 'tempModelDetails.upperModelToleranceAmount',
			lowerTradeTolerancePercent : 'tempModelDetails.lowerTradeTolerancePercent',
			upperTradeTolerancePercent : 'tempModelDetails.upperTradeTolerancePercent',
			isDeleted : 'tempModelDetails.isDeleted',
			createdBy : 'tempModelDetails.createdBy',
			createdDate : 'tempModelDetails.createdDate',
			editedBy : 'tempModelDetails.editedBy',
			editedDate : 'tempModelDetails.editedDate',
		}
}

module.exports = ModelElement;