"use strict";

var _ = require('lodash');

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();

var CustodianSecuritySybol = {
		custodianId : null,
		securityId : null,
		securitySymbol : null
};

module.exports = function(){
	_.assign(this, CustodianSecuritySybol, baseModel);
}
