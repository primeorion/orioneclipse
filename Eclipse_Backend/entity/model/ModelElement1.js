/**
 * 
 * Mapped to model element Table
 * 
 */
"use strict";

var ModelElement = {
		tableName : 'modelElements',
		columns : {
			id : 'modelElements.id',
			name : 'modelElements.name',
			relatedType : 'modelElements.relatedType',
			relatedTypeId : 'modelElements.relatedTypeId',
			isFavorite : 'modelElements.isFavorite',
			namespace : 'modelElements.namespace',
			tags : 'modelElements.tags',
			validateTickerSet : 'modelElements.validateTickerSet',
			rebalancePriority : 'modelElements.rebalancePriority',
			isDeleted : 'modelElements.isDeleted',
			createdBy : 'modelElements.createdBy',
			createdDate : 'modelElements.createdDate',
			editedBy : 'modelElements.editedBy',
			editedDate : 'modelElements.editedDate',
		}
}

module.exports = ModelElement;
