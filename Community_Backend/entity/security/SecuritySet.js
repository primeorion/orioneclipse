/**
 * 
 */
"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Security = {
		id : null,
		name : null,
		description : null,
		isDynamic : 0,
		toleranceType : 0,
		toleranceTypeValue : null
}

module.exports = function(){
	_.assign(this, Security, basicEntity);
}