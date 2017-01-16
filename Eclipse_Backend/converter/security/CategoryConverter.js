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
	
	model.isImported = categoryEntity.isImported;
	
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
	categoryModel.isImported = data.isImported || 0;
	
	return categoryModel;
	
};

CategoryConverter.prototype.categoryModelToEntity = function(data, cb){
	var category = {};
	
	category[Category.columns.id] = data.id;
	category[Category.columns.name] = data.name;
	category[Category.columns.color] = data.color;
	category[Category.columns.isImported] = data.isImported;
	category[Category.columns.createdDate] = utilDao.getSystemDateTime();
	category[Category.columns.createdBy] = utilService.getAuditUserId(data.user);
	category[Category.columns.editedDate] = utilDao.getSystemDateTime();
	category[Category.columns.editedBy] = utilService.getAuditUserId(data.user);
	category[Category.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
	
	cb(null, category);
	
};

CategoryConverter.prototype.categoryModelToSecurityEntity = function(data, cb){
	var security = {};
	
	security[SecurityEntity.columns.assetCategoryId] = data.id;
	
	return security;
};

CategoryConverter.prototype.securityModelToCategoryModel = function(data, cb){
	var category = new CategoryRequest();
	
	category.reqId = data.reqId;
	category.user = data.user;
	
	category.id = data.assetCategoryId;
	
	cb(null, category);
	
};

module.exports = new CategoryConverter();