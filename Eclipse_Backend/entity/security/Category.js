/**
 * 
 * Mapped to assetCategory Table
 */

"use strict";

var Category = {
		tableName : 'assetCategory',
		columns : {
			id : 'assetCategory.id',
			name : 'assetCategory.name',
			color : 'assetCategory.color',
			isImported : 'assetCategory.isImported',
			isDeleted : 'assetCategory.isDeleted',
			createdBy : 'assetCategory.createdBy',
			createdDate : 'assetCategory.createdDate',
			editedBy : 'assetCategory.editedBy',
			editedDate : 'assetCategory.editedDate',
		}
}

module.exports = Category;