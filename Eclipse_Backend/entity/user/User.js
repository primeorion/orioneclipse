module.exports  = {
	tableName:'user',
	columns:{
		id:'user.id',
		orionConnectExternalId:'user.orionConnectExternalId',
		firstName:'user.firstName',
		lastName:'user.lastName',
		roleId:'user.roleId',
		path:'user.path',
		email:'user.email',
		status:'user.status',
		tags:'user.tags',
		startDate:'user.startDate',
		expireDate:'user.expireDate',
		userLoginId:'user.userLoginId',
		isDeleted:'user.isDeleted',
		createdDate:'user.createdDate',
		createdBy:'user.createdBy',
		editedDate:'user.editedDate',
		editedBy:'user.editedBy',
		notificationEmail:'user.notificationEmail'
	},
	usCreated:{
		alias:'usCreated',
		id:'usCreated.id',
		userLoginId:'usCreated.userLoginId', 
                isDeleted:'usCreated.isDeleted'
	},
	usEdited:{
		alias:'usEdited',
		id:'usEdited.id',
		userLoginId:'usEdited.userLoginId'
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
