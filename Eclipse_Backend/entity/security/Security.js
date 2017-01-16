/**
 * 
 * Mapped to security Table
 * 
 */
"use strict";

var Security = {
		tableName : 'security',
		columns : {
			id : 'security.id',
			orionEclipseFirmId : 'security.orionEclipseFirmId',
			orionConnectExternalId : 'security.orionConnectExternalId',
			symbol : 'security.symbol',
			name : 'security.name',
			custodialCash : 'security.isCustodialCash',
			statusId : 'security.statusId',
			assetCategoryId : 'security.assetCategoryId',
			assetClassId : 'security.assetClassId',
			assetSubClassId : 'security.assetSubClassId',
			securityTypeId : 'security.securityTypeId',
			isDeleted : 'security.isDeleted',
			createdBy : 'security.createdBy',
			createdDate : 'security.createdDate',
			editedBy : 'security.editedBy',
			editedDate : 'security.editedDate',
		},
		alias : function(alias, column){
			var self = this;
			var columnName = self.columns[column];
			if(columnName){
				var arr = columnName.split(".");
				if(arr && arr.length > 0){
					return alias + "." + arr[1];
				}
			}
			return null;
		}
}

module.exports = Security;