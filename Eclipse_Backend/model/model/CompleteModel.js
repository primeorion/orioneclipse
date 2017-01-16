"use strict";

var BaseModel = require('model/base/BaseInputModel.js');
var baseModel = new BaseModel();

var _ = require('lodash');


var Class = {
		id : null,
		name : null,
		statusId : null,
		communityModelledId : null,
		namespace : null,
		approvedBy : null,
		description : null,
		ownerUserId : null,
		scope : null,
		dynamicModel : null,
		isDeleted : null,
		isSubstitutedForPortfolio : null,
		children : []
};

module.exports = function(){
	_.assign(this, Class, baseModel);
}