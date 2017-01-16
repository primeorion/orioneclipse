"use strict";

var appEnum = require('config').applicationEnum;

var utilDao = require('dao/util/UtilDao.js');
var baseConverter = require('converter/base/BaseConverter.js');

var SubClassResponse = require('model/security/SubClassListResponse.js');
var SubClassRequest = require('model/security/SubClassRequest.js');
var SubClass = require('entity/security/SubClass.js');
var SecurityEntity = require('entity/security/Security');
var utilService = new (require('service/util/UtilService'))();
var etlUserId = appEnum.ETLUserId;

var SubClassConverter = function(){
	
}

SubClassConverter.prototype.subClassEntityToModel = function(subClassEntity){
	var model = new SubClassResponse();

	model.id = subClassEntity.id;
	model.orionConnectId = subClassEntity.orionConnectExternalId;
	model.name = subClassEntity.name;
	model.color = subClassEntity.color;
	model.assetClassId = subClassEntity.assetClassId;
	
	var isImported = 0;
	if(subClassEntity.createdById === etlUserId){
		isImported = 1;
	}
	model.isImported = isImported;
	
	model.isDeleted = subClassEntity.isDeleted;
	model.createdOn = subClassEntity.createdDate;
	model.editedOn = subClassEntity.editedDate;
	model.createdBy = subClassEntity.createdBy;
	model.editedBy = subClassEntity.editedBy;
	
	return model;
};

SubClassConverter.prototype.subClassListEntityToModel = function(subClassEntityList, cb){
	
	var self = this;
	var response = [];

	subClassEntityList.forEach(function(subClassEntity){
		response.push(self.subClassEntityToModel(subClassEntity));
	});
	
	cb(null, response);
	
};

SubClassConverter.prototype.subClassCreateRequestTOModel = function(data){
	var subClassModel = new SubClassRequest();
	
	baseConverter(subClassModel, data);
	
	subClassModel.id = data.id;
	subClassModel.name = data.name;
	subClassModel.color = data.color;
	
	return subClassModel;
	
};

SubClassConverter.prototype.subClassModelToEntity = function(data, cb){

	var subClass = new SubClass();
	
	subClass.reqId = data.reqId;
	
	subClass.id = data.id;
	subClass.name = data.name;
	subClass.color = data.color;
	subClass.assetClassId  = subClass.assetClassId;
	
	subClass.createdDate = utilDao.getSystemDateTime();
	subClass.createdBy = utilService.getAuditUserId(data.user);
	subClass.editedDate = utilDao.getSystemDateTime();
	subClass.editedBy = utilService.getAuditUserId(data.user);
	subClass.isDeleted = data.isDeleted ? data.isDeleted : 0;
	
	cb(null, subClass);
	
};

SubClassConverter.prototype.subClassModelToSecurityEntity = function(data, cb){
	var security = new SecurityEntity();
	
	security.reqId = data.reqId;
	
	security.assetSubClassId = data.id;
	
	cb(null, security);
	
};

SubClassConverter.prototype.securityModelToSubClassModel = function(data, cb){
	var subClass = new SubClassRequest();
	
	subClass.reqId = data.reqId;
	subClass.user = data.user;
	
	subClass.id = data.assetSubClassId;
	
	cb(null, subClass);
	
};


module.exports = new SubClassConverter();