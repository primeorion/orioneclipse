/**
 * Mapped to assetClass Table 
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Class = {
		id : null,
		name : null,
		color : null,
		assetCategoryId : null
}

module.exports = function(){
	_.assign(this, Class, basicEntity);
}
