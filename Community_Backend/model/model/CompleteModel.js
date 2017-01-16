"use strict";

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();

var _ = require('lodash');


var Class = {
		id : null,
		name : null,
		status : null,
		communityModelledId : null,
		description : null,
		ownerUserId : null,
		scope : null,
		dynamicModel : null,
		isDeleted : null,
		isSubsitutedForPortfolio : null,
		children : []
};

module.exports = function(){
	_.assign(this, Class, baseModel);
}