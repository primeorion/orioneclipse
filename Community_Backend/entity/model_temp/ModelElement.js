/**
 * 
 * Mapped to model element Table
 * 
 */
"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var ModelElement = {
		id : null,
		name : null
}

module.exports = function(){
	_.assign(this, ModelElement, basicEntity);
}
