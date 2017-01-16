"use strict";

var config = require('config');
var applicationEnum = config.applicationEnum;

var RolePrivilege = function(data){
	
	/*
	 * ui - entity
	*/
	//var type = data.privilegeType;
	
	this.id = data.privilegeId,
	this.name = data.privilegeName,
	this.code = data.privilegeCode,
	this.category = data.privilegeCategory,
	this.type = data.privilegeType
	this.canAdd = data.canAdd,
	this.addDisabled = data.addDisabled,
	this.canUpdate =  data.canUpdate,
	this.updateDisabled = data.updateDisabled,
	this.canDelete = data.canDelete,
	this.deleteDisabled = data.deleteDisabled,
	this.canRead = data.canRead,
	this.readDisabled = data.readDisabled,
	this.isDeleted = data.privilegeIsDeleted;
	
	/*if (type !== null) {
		type = applicationEnum.privilege[type];
		this.type = type;
	}*/

}

module.exports = RolePrivilege;