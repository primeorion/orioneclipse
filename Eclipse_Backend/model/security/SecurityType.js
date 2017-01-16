/**
 * 
 */

"use strict";

var _ = require('lodash');

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();
var RequestModel = require('model/base/RequestModel.js');

var SecurityType = {
		name : null
}

module.exports = function(){
	baseModel.user = new RequestModel();
	_.assign(this, SecurityType, baseModel);
}
