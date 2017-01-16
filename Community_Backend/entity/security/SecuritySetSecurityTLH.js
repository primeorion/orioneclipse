/**
 * 
 */


"use strict";


var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Security = {
		securitySetId : null,
		securityId : null,
		tlhSecurityId : null,
		priority : null
};

module.exports = function(){
	_.assign(this, Security, basicEntity);
}