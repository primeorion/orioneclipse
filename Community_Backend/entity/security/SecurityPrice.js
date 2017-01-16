/**
 * 
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var SecurityPrice = {
		id : null,
		securityId : null,
		price : null,
		priceType : null,
		priceDateTime : null
}

module.exports = function(){
	_.assign(this, SecurityPrice, basicEntity);
}
