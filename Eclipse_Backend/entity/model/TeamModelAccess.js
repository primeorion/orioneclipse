/**
 * 
 */

"use strict";

var ModelElement = {
		tableName : 'teamModelAccess',
		columns : {
			teamId : 'teamModelAccess.teamId',
			modelId : 'teamModelAccess.modelId',
			access : 'teamModelAccess.access',
			isDeleted : 'teamModelAccess.isDeleted',
			createdBy : 'teamModelAccess.createdBy',
			createdDate : 'teamModelAccess.createdDate',
			editedBy : 'teamModelAccess.editedBy',
			editedDate : 'teamModelAccess.editedDate',
		}
}

module.exports = ModelElement;