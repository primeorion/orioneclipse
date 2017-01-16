"use strict";

var _ = require('lodash');

var CustodianSecuritySymbol = {
		id: null,
		name : null,
		custodianSecuritySymbol : null
};

module.exports = function(){
	_.assign(this, CustodianSecuritySymbol);
}
