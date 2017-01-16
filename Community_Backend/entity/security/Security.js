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
		id : null,
		orionConnectExternalId : null,
		symbol : null,
		name : null,
		custodialCash : null,
		statusId : null,
		assetCategoryId : null,
		assetClassId : null,
		assetSubClassId : null,
		securityTypeId : null
}

module.exports = function(){
	_.assign(this, Security, basicEntity);
}
