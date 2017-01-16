/**
 * 
 */

var BaseEntity = require('entity/base/BasicEntity');

var baseEntity = new BaseEntity();

var _ = require('lodash');

var CustodianSecuritySymbol = {
		custodianId : null,
		securityId : null,
		securitySymbol : null
}

module.exports = function(){
	_.assign(this, CustodianSecuritySymbol, baseEntity);
};