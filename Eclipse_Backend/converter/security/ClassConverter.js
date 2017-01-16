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
	
	model.isImported = classEntity.isImported;

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
	classRequest.isImported = data.isImported || 0;
	
	return classRequest;
	
};

ClassConverter.prototype.classModelToEntity = function(data, cb){
	var category = {};
	
	category[Class.columns.id] = data.id;
	category[Class.columns.name] = data.name;
	category[Class.columns.color] = data.color;
	category[Class.columns.isImported] = data.isImported;
	category[Class.columns.createdDate] = utilDao.getSystemDateTime();
	category[Class.columns.createdBy] = utilService.getAuditUserId(data.user);
	category[Class.columns.editedDate] = utilDao.getSystemDateTime();
	category[Class.columns.editedBy] = utilService.getAuditUserId(data.user);
	category[Class.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
	
	cb(null, category);
	
};

ClassConverter.prototype.classModelToSecurityEntity = function(data, cb){
	var security = {};
	
	security[SecurityEntity.columns.assetClassId] = data.id;
	
	return security;
};

ClassConverter.prototype.securityModelToClassModel = function(data, cb){
	var clas = new ClassRequest();
	
	clas.reqId = data.reqId;
	clas.user = data.user;
	
	clas.id = data.assetClassId;
	
	cb(null, clas);
	
};

module.exports = new ClassConverter();