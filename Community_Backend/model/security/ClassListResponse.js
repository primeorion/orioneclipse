"use strict";

var BaseOutput = require('model/base/BaseOutputModel.js');

var baseOutput = new BaseOutput();

var _ = require('lodash');

var Class = {
		id : null,
		name : null,
		color : null,
		assetCategoryId : null,
		isImported : null
}

module.exports = function(){
	_.assign(this,Class, baseOutput);
}