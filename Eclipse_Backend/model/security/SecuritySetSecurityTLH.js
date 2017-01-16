"use strict";

var _ = require('lodash');

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();
var RequestModel = require('model/base/RequestModel.js');

var Security = {
		securitySetId : null,
		securityId : null,
		tlhSecurityId : null,
		priority : null
};

module.exports = function(){
	baseModel.user = new RequestModel();
	_.assign(this, Security, baseModel);
}