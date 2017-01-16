/**
 *
 * Mapped to assetSubClass Table
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var SubClass = {
		id : null,
		name : null,
		color : null,
		assetClassId : null
}

module.exports = function(){
	_.assign(this, SubClass, basicEntity);
}
