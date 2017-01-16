"use strict";

module.exports  = {
	tableName:'securityType',
	columns:{
		id:"securityType.id",
		name:"securityType.name",
		isDeleted:"securityType.isDeleted",
		createdDate:"securityType.createdDate",
		createdBy:"securityType.createdBy",
		editedDate:"securityType.editedDate",
		editedBy:"securityType.editedBy"
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
