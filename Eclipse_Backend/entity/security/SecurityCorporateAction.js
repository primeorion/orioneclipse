/**
 * 
 * Mapped to security Table
 * 
 */
"use strict";

var Security = {
		tableName : 'securityCorporateAction',
		columns : {
			id : 'securityCorporateAction.id',
			corporateActionTypeId : 'securityCorporateAction.corporateActionTypeId',
			to : 'securityCorporateAction.to',
			from : 'securityCorporateAction.from',
			securityId : 'securityCorporateAction.securityId',
			spinOfSecurityId : 'securityCorporateAction.spinOfSecurityId',
			isDeleted : 'securityCorporateAction.isDeleted',
			createdBy : 'securityCorporateAction.createdBy',
			createdDate : 'securityCorporateAction.createdDate',
			editedBy : 'securityCorporateAction.editedBy',
			editedDate : 'securityCorporateAction.editedDate',
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