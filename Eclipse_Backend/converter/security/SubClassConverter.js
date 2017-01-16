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
	
	model.isImported = subClassEntity.isImported;
	
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
	subClassModel.isImported = data.isImported || 0;
	
	return subClassModel;
	
};

SubClassConverter.prototype.subClassModelToEntity = function(data, cb){
	var category = {};
	
	category[SubClass.columns.id] = data.id;
	category[SubClass.columns.name] = data.name;
	category[SubClass.columns.color] = data.color;
	category[SubClass.columns.isImported] = data.isImported;
	category[SubClass.columns.createdDate] = utilDao.getSystemDateTime();
	category[SubClass.columns.createdBy] = utilService.getAuditUserId(data.user);
	category[SubClass.columns.editedDate] = utilDao.getSystemDateTime();
	category[SubClass.columns.editedBy] = utilService.getAuditUserId(data.user);
	category[SubClass.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
	
	cb(null, category);
	
};

SubClassConverter.prototype.subClassModelToSecurityEntity = function(data, cb){
	var security = {};
	
	security[SecurityEntity.columns.assetSubClassId] = data.id;

	return security;
	
};

SubClassConverter.prototype.securityModelToSubClassModel = function(data, cb){
	var subClass = new SubClassRequest();
	
	subClass.reqId = data.reqId;
	subClass.user = data.user;
	
	subClass.id = data.assetSubClassId;
	
	cb(null, subClass);
	
};


module.exports = new SubClassConverter();