"use strict";

var BaseOutput = require('model/base/BaseOutputModel.js');

var baseOutput = new BaseOutput();

var _ = require('lodash');

var SubClass = {
		id : null,
		name : null,
		color : null,
		assetClassId : null,
		isImported : null
}

module.exports = function(){
	_.assign(this,SubClass, baseOutput);
}