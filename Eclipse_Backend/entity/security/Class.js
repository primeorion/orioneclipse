/**
 * Mapped to assetClass Table 
 */

"use strict";

var BasicEntity = require('entity/base/BasicEntity');
var basicEntity = new BasicEntity();

var _ = require('lodash');

var Class = {
		tableName : 'assetClass',
		columns : {
			id : 'assetClass.id',
			name : 'assetClass.name',
			color : 'assetClass.color',
			isImported : 'assetClass.isImported',
			isDeleted : 'assetClass.isDeleted',
			createdBy : 'assetClass.createdBy',
			createdDate : 'assetClass.createdDate',
			editedBy : 'assetClass.editedBy',
			editedDate : 'assetClass.editedDate',
		}
}

module.exports = Class;
