"use strict";

var RoleResponse = require('model/role/RoleListResponse.js');
var RoleDetailResponse = require('model/role/RoleDetailResponse.js');
var RolePrivilegeResponse = require('model/privilege/RolePrivilegeResponse.js');
var RoleType  = require("model/role/RoleTypeResponse.js");
var RoleRequest = require('model/role/RoleRequest.js');
var RolePrivilegeRequest = require('model/privilege/RolePrivilegeRequest.js');
var RoleEntity = require('entity/role/Role.js');
var RolePrivilegeEntity = require('entity/Privilege.js');
var roleListRequest = require('model/role/RoleListRequest.js');
var baseConverter = require('converter/base/BaseConverter.js');

var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();

var moduleName = __filename;
var logger = require('helper').logger(moduleName);

var RoleConverter = function(){
};

RoleConverter.prototype.roleListFromEntityToModel = function(data, cb){
	var self = this;
	var response = [];
	
	data.forEach(function(value){
		response.push( self.roleFromEntityToModel(value) );
	});
	
	return response;
};

RoleConverter.prototype.roleListRequestToModel = function(data){
	var bean = new roleListRequest();
	
	baseConverter(bean, data);
	
	bean.id = data.id,
	bean.isDeleted = data.isDeleted,
	bean.name = data.name;
	bean.exactSearch = data.exactSearch;
	
	bean.roleType = data.roleType;
	bean.search = data.search;
	
	return bean;	
}

RoleConverter.prototype.roleCreateRequestToRoleModel = function(data){
	
	var bean = new RoleRequest();
	
	baseConverter(bean, data);
	
	bean.id = data.id,
	bean.isDeleted = data.isDeleted,
	bean.name = data.name;
	bean.status =  1;

	bean.roleTypeId = data.roleTypeId;
	if (data.startDate) {
		var startDate = data.startDate;
		var startDateArray = startDate.split("/");
		bean.startDate = startDateArray[2]+"-"+startDateArray[0]+"-"+startDateArray[1];
		if(utilService.compareDate(bean.startDate) <= 0 ){
			bean.status = 1;
        }else{
        	bean.status = 0;
        }
	}
	if (data.expireDate) {
		var expireDate = data.expireDate;
		var expireDateArray = expireDate.split("/");
		bean.expireDate = expireDateArray[2]+"-"+expireDateArray[0]+"-"+expireDateArray[1];
		if(utilService.compareDate(bean.expireDate) > 0 && data.startDate && bean.status != 0){
			bean.status = 1;
        }else{
        	bean.status = 0;
        }
	}
	return this.rolePrivilegeRequestToModel(data.privileges, function(err, list){
		bean.privileges = list;

		return bean;	
	});
	
}

RoleConverter.prototype.rolePrivilegeRequestToModel = function (privileges, cb){
	var self = this;

//	this.baseConverter(bean, data);
	var privilegeList = [];


	if(privileges){
		privileges.forEach(function(privilege){
			
			var bean = new RolePrivilegeRequest();
			
			bean.id = privilege.id;
			bean.canAdd = privilege.canAdd;
			bean.canDelete = privilege.canDelete;
			bean.canUpdate = privilege.canUpdate;
			bean.canRead = privilege.canRead;
			bean.isDeleted = privilege.isDeleted ? privilege.isDeleted : 0;
			
			privilegeList.push(bean);
		});		
	}
	
	return cb(null, privilegeList);
};


RoleConverter.prototype.roleFromEntityToModel = function(data){
	var bean = new RoleResponse();
	
	bean.roleType = data.roleType;
	bean.createdOn = data.createdOn;
	bean.editedOn = data.editedOn;
	bean.editedBy = data.editedBy;
	bean.createdBy = data.createdBy;
	bean.numberOfUsers = data.numberOfUsers;
	bean.startDate = data.startDate;
	bean.expireDate = data.expireDate;
	bean.id = data.id;
	bean.name = data.name;
	bean.isDeleted = data.isDeleted;
	bean.status = data.status;
	return bean;
};

RoleConverter.prototype.roleDetailEntityToModel = function (fetched, cb){
	var roleDetail = null;
	
	
    if (fetched && fetched.length > 0) {
        roleDetail = new RoleDetailResponse();
        var fetchedOne = fetched[0];

        roleDetail.id = fetchedOne.roleId;
        roleDetail.name = fetchedOne.roleName;
        roleDetail.status = fetchedOne.status;
        roleDetail.isDeleted = fetchedOne.roleIsDeleted;
        roleDetail.createdBy = fetchedOne.roleCreatedBy;
        roleDetail.editedOn = fetchedOne.roleEditedOn;
        roleDetail.editedBy = fetchedOne.roleEditedBy;
        roleDetail.createdOn = fetchedOne.roleCreatedOn;
        roleDetail.roleTypeId = fetchedOne.roleType;
        roleDetail.roleType = fetchedOne.roleTypeName;
		roleDetail.startDate = fetchedOne.startDate;
		roleDetail.expireDate = fetchedOne.expireDate;
        //roleDetail.roleName = fetchedOne.roleName;
        
        var privilegeList = roleDetail.privileges;
        fetched.forEach(function (userRolePrivilege) {
        	var privilege = new RolePrivilegeResponse(userRolePrivilege);
            if (privilege.id) {
                privilegeList.push(privilege);
            }
        });
        roleDetail.privileges = privilegeList;
    }
    return cb(null, roleDetail);
};

RoleConverter.prototype.roleType = function (data){
	var roleType = new RoleType(data);
	return roleType;
};

RoleConverter.prototype.roleTypeListEntityToRequest = function (fetched, cb){
	var self = this;

	var responseToReturn = [];
	fetched.forEach(function(roletype){
		responseToReturn.push(self.roleType(roletype));
	});
	
	cb(null, responseToReturn);
};

RoleConverter.prototype.roleModelToEntity = function (data, cb){
	var self = this;
	
	var bean = new RoleEntity();

	var roleId = data.id;
	
	bean.reqId = data.reqId;
	
	bean.id = roleId,
	bean.name = data.name;
	bean.status = data.status;
	bean.isDeleted = data.isDeleted ? isDeleted : 0;
	
	bean.roleTypeId = data.roleTypeId;
	
	/*
	 * run when create
	*///if(!data.toUpdate){
		bean.createdDate = utilDao.getSystemDateTime(null);
		bean.createdBy = utilService.getAuditUserId(data.user);		
	//}
	/*
	 * run when update
	*/
//	if(data.toUpdate){
		bean.editedDate = utilDao.getSystemDateTime(null);
		bean.editedBy = utilService.getAuditUserId(data.user);		
//	}
	if (data.startDate) {
        bean.startDate = data.startDate;
    }
    if (data.expireDate) {
        bean.expireDate = data.expireDate;
    }
	cb(null, bean);

};

RoleConverter.prototype.roleModelToRolePrivilegeEntityList = function (data, cb){
	var self = this;

	var privilegeList = [];
	if(data.privileges){

		data.privileges.forEach(function(privilegeRequest){

			var privilege = new RolePrivilegeEntity();
			
			privilege.reqId = data.reqId;
			
			privilege.roleId = data.id;
			privilege.privilegeId = privilegeRequest.id;
			privilege.canAdd = privilegeRequest.canAdd;
			privilege.canDelete = privilegeRequest.canDelete;
			privilege.canUpdate = privilegeRequest.canUpdate;
			privilege.canRead = privilegeRequest.canRead;

			privilege.isDeleted = privilegeRequest.isDeleted ? privilegeRequest.isDeleted : 0;
			
			/*
			 * run when create
//			 *///if(!data.toUpdate){
				 privilege.createdDate = utilDao.getSystemDateTime(null);
				 privilege.createdBy = utilService.getAuditUserId(data.user);			
//			 }
			 
			 /*
			  * run when update
			  */
//		if(data.toUpdate){
			 privilege.editedDate = utilDao.getSystemDateTime(null);
			 privilege.editedBy = utilService.getAuditUserId(data.user);		
//		}
			 
//			 privilege.editedDate = utilDao.getSystemDateTime(null);
//			 privilege.editedBy = data.user.userId;
			 privilegeList.push(privilege);
		});		
	}
	
	cb(null, privilegeList);
};

RoleConverter.prototype.userModelToRoleEntity = function (data, cb){
	var bean = new RoleEntity();
	
	bean.id = data.roleId;
	bean.reqId = data.reqId;
	
	return cb(null, bean);
};

module.exports = RoleConverter;

