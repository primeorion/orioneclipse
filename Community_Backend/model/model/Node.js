"use strict";

var _ = require('lodash');

var baseInput = new (require('model/base/BaseInputModel.js'))();



var ModelNode = {
		  modelId : null,
		  id : null,
		  name : null,
		  targetPercent : null,
		  toleranceLowerPercent : null,
		  toleranceUpperPercent : null,
		  tolerancePercentBand : null,
		  toleranceLower$ : null,
		  toleranceUpper$ : null,
		  lowerTradePercent : null,
		  upperTradePercent : null,
		  relatedType : null,
		  relatedTypeId : null,
		  validateTickerSet : null,
		  rebalancePriority : null,
		  tags : null,
		  isDeleted : null,
		  leftValue : null,
		  rightValue : null,
		  level : null
};

module.exports = function(){
	_.assign(this, ModelNode, baseInput);
	this.children = []
}
