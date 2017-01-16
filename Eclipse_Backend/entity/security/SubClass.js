/**
 *
 * Mapped to assetSubClass Table
 */

"use strict";

var SubClass = {
		tableName : 'assetSubClass',
		columns : {
			id : 'assetSubClass.id',
			name : 'assetSubClass.name',
			color : 'assetSubClass.color',
			isImported : 'assetSubClass.isImported',
			isDeleted : 'assetSubClass.isDeleted',
			createdBy : 'assetSubClass.createdBy',
			createdDate : 'assetSubClass.createdDate',
			editedBy : 'assetSubClass.editedBy',
			editedDate : 'assetSubClass.editedDate',
		}
}

module.exports = SubClass;