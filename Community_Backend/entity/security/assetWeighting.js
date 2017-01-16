/**
 * 
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Security = {
		securityId : null,
		relatedType : null,
		relatedTypeId : null,
		weightingPercentage : null,
}

module.exports = function(){
	_.assign(this, Security, basicEntity);
}