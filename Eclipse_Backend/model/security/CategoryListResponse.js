"use strict";

var BaseOutput = require('model/base/BaseOutputModel.js');

var baseOutput = new BaseOutput();

var _ = require('lodash');

var Category = {
		id : null,
		name : null,
		color : null,
		isImported : null
}

module.exports = function(){
	_.assign(this,Category, baseOutput);
}