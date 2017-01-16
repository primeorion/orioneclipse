"use strict";

var appEnum = require('config').applicationEnum;

var utilDao = require('dao/util/UtilDao.js');
var baseConverter = require('converter/base/BaseConverter.js');

var ClassResponse = require('model/security/ClassListResponse.js');
var ClassRequest = require('model/security/ClassRequest.js');
var Class = require('entity/security/Class.js');
var SecurityEntity = require('entity/security/Security');
var utilService = new (require('service/util/UtilService'))();
var etlUserId = appEnum.ETLUserId;

var ClassConverter = function(){
	
}

ClassConverter.prototype.classEntityToModel = function(classEntity){
	var model = new ClassResponse();

	model.id = classEntity.id;
	model.name = classEntity.name;
	model.color = classEntity.color;
	model.assetCategoryId = classEntity.assetCategoryId;
	
	var isImported = 0;
	if(classEntity.createdById === etlUserId){
		isImported = 1;
	}
	model.isImported = isImported;

	model.isDeleted = classEntity.isDeleted;
	model.createdOn = classEntity.createdDate;
	model.editedOn = classEntity.editedDate;
	model.createdBy = classEntity.createdBy;
	model.editedBy = classEntity.editedBy;
	
	return model;
};

ClassConverter.prototype.classListEntityToModel = function(classEntityList, cb){
	
	var self = this;
	
	var response = [];

	classEntityList.forEach(function(classEntity){
		response.push(self.classEntityToModel(classEntity));
	});
	
	cb(null, response);
	
};


ClassConverter.prototype.classCreateRequestTOModel = function(data){
	
	var classRequest = new ClassRequest();
	
	baseConverter(classRequest, data);
	
	classRequest.id = data.id;
	classRequest.name = data.name;
	classRequest.color = data.color;

	//classRequest.isImported = data.isImported;
	
	return classRequest;
	
};

ClassConverter.prototype.classModelToEntity = function(data, cb){
	
	var ClassBean = new Class();
	
	ClassBean.reqId = data.reqId;
	
	ClassBean.id = data.id;
	ClassBean.name = data.name;
	ClassBean.color = data.color;
	ClassBean.assetCategoryId = data.assetCategoryId;
	
	ClassBean.isDeleted = data.isDeleted ? data.isDeleted : 0;
	ClassBean.createdDate = utilDao.getSystemDateTime();
	ClassBean.createdBy = utilService.getAuditUserId(data.user);
	ClassBean.editedDate = utilDao.getSystemDateTime();
	ClassBean.editedBy = utilService.getAuditUserId(data.user);

	cb(null, ClassBean);
	
};

ClassConverter.prototype.classModelToSecurityEntity = function(data, cb){
	var security = new SecurityEntity();
	
	security.reqId = data.reqId;
	
	security.assetClassId = data.id;
	
	cb(null, security);
	
};

ClassConverter.prototype.securityModelToClassModel = function(data, cb){
	var clas = new ClassRequest();
	
	clas.reqId = data.reqId;
	clas.user = data.user;
	
	clas.id = data.assetClassId;
	
	cb(null, clas);
	
};

module.exports = new ClassConverter();