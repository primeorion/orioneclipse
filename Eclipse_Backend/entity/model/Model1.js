"use strict";

var ModelElement = {
		tableName : 'model',
		columns : {
			id : 'model.id',
			name : 'model.name',
			namespace : 'model.namespace',
			statusId : 'model.statusId',
			description : 'model.description',
			dynamicModel : 'model.dynamicModel',
			scope : 'model.scope',
			tags : 'model.tags',
			managementStyleId : 'model.managementStyleId',
			ownerUserId : 'model.ownerUserId',
			approvedBy : 'model.approvedBy',
			isSubModel : 'model.isSubModel',
			isCommunityModel : 'model.isCommunityModel',
			communityModelled : 'model.communityModelId',
			isSubstitutedForPortfolio : 'model.isSubstitutedForPortfolio',
			isSubstitutedForSleeve : 'model.isSubstitutedForSleeve',
			subsituteOfModelId : 'model.subsituteOfModelId',
			isDeleted : 'model.isDeleted',
			createdBy : 'model.createdBy',
			createdDate : 'model.createdDate',
			editedBy : 'model.editedBy',
			editedDate : 'model.editedDate',
		}
}

module.exports = ModelElement;