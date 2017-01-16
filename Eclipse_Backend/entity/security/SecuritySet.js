/**
 * 
 */
"use strict";

var SecuritySet = {
		tableName : 'securitySet',
		columns : {
			id : 'securitySet.id',
			name : 'securitySet.name',
			description : 'securitySet.description',
			isDynamic : 'securitySet.isDynamic',
			isFavorite : 'securitySet.isFavorite',
			toleranceType : 'securitySet.toleranceType',
			toleranceTypeValue : 'securitySet.toleranceTypeValue',
			isDeleted : 'securitySet.isDeleted',
			createdBy : 'securitySet.createdBy',
			createdDate : 'securitySet.createdDate',
			editedBy : 'securitySet.editedBy',
			editedDate : 'securitySet.editedDate'			
		}
}

module.exports = SecuritySet;