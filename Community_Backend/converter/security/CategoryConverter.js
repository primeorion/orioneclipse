"use strict";

var appEnum = require('config').applicationEnum;

var utilDao = require('dao/util/UtilDao.js');
var baseConverter = require('converter/base/BaseConverter.js');

var CategoryResponse = require('model/security/CategoryListResponse.js');
var CategoryRequest = require('model/security/CategoryRequest.js');
var Category = require('entity/security/Category.js');
var SecurityEntity = require('entity/security/Security');
var utilService = new (require('service/util/UtilService'))();
var etlUserId = appEnum.ETLUserId;

var CategoryConverter = function(){
	
}

CategoryConverter.prototype.categoryEntityToModel = function(categoryEntity){
	var model = new CategoryResponse();
	model.id = categoryEntity.id;
	model.name = categoryEntity.name;
	model.color = categoryEntity.color;

	var isImported = 0;
	if(categoryEntity.createdById === etlUserId){
		isImported = 1;
	}
	model.isImported = isImported;
	
	model.isDeleted = categoryEntity.isDeleted;
	model.createdOn = categoryEntity.createdDate;
	model.editedOn = categoryEntity.editedDate;
	model.createdBy = categoryEntity.createdBy;
	model.editedBy = categoryEntity.editedBy;
	
	return model;
};

CategoryConverter.prototype.categoryListEntityToModel = function(categoryEntityList, cb){
	
	var self = this;
	
	var response = [];

	categoryEntityList.forEach(function(categoryEntity){
		response.push(self.categoryEntityToModel(categoryEntity));
	});
	
	cb(null, response);
	
};

CategoryConverter.prototype.categoryCreateRequestTOModel = function(data){
	var categoryModel = new CategoryRequest();
	
	baseConverter(categoryModel, data);
	
	categoryModel.id = data.id;
	categoryModel.name = data.name;
	categoryModel.color = data.color;
	categoryModel.isImported = data.isImported;
	
	return categoryModel;
	
};

CategoryConverter.prototype.categoryModelToEntity = function(data, cb){
	var category = new Category();
	
	category.reqId = data.reqId;
	
	category.id = data.id;
	category.name = data.name;
	category.color = data.color;

	category.createdDate = utilDao.getSystemDateTime();
	category.createdBy = utilService.getAuditUserId(data.user);
	category.editedDate = utilDao.getSystemDateTime();
	category.editedBy = utilService.getAuditUserId(data.user);
	category.isDeleted = data.isDeleted ? data.isDeleted : 0;
	
	cb(null, category);
	
};

CategoryConverter.prototype.categoryModelToSecurityEntity = function(data, cb){
	var security = new SecurityEntity();
	
	security.reqId = data.reqId;
	
	security.assetCategoryId = data.id;
	
	cb(null, security);
	
};

CategoryConverter.prototype.securityModelToCategoryModel = function(data, cb){
	var category = new CategoryRequest();
	
	category.reqId = data.reqId;
	category.user = data.user;
	
	category.id = data.assetCategoryId;
	
	cb(null, category);
	
};

module.exports = new CategoryConverter();