/**
 * 
 * Mapped to security Table
 * 
 */
"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Security = {
		modelId : null,
		modelElementId : null,
		leftValue : null,
		rigthValue : null,
		rank : 1,
		level : null
}

module.exports = function(){
	_.assign(this, Security);
}
