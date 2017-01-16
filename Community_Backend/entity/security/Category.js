/**
 * 
 * Mapped to assetCategory Table
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Category = {
		id : null,
		name : null,
		color : null
}

module.exports = function(){
	_.assign(this, Category, basicEntity);
}