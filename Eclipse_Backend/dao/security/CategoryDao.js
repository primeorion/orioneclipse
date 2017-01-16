"use strict";

var moduleName = __filename;

var squel = require("squel");
var _ = require('lodash');

var logger = require("helper").logger(moduleName);
var BaseDao = require('dao/BaseDao');

var squelUtils = require("service/util/SquelUtils.js");
var CategoryCoverter = require('converter/security/CategoryConverter.js');
var CategoryEntity = require('entity/security/Category.js');
var UserEntity = require("entity/user/User.js");

var etlUserId = require('config').applicationEnum.ETLUserId;

var Category = function(){
	
}

var tableNames = [
                  	'assetCategory',
                  	'user'
                 ];


Category.prototype.getCategories = function(data, cb){
	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = squel.select()
								.field(CategoryEntity.columns.id, 'id')
								.field(CategoryEntity.columns.name, 'name')
								.field(CategoryEntity.columns.color, 'color')
								.field(CategoryEntity.columns.isImported, 'isImported')
								.field(CategoryEntity.columns.isDeleted, 'isDeleted')
								.field(CategoryEntity.columns.createdDate, 'createdDate')
								.field(CategoryEntity.columns.editedDate, 'editedDate')
								.field(CategoryEntity.columns.createdBy, 'createdById')
								.field(UserEntity.usCreated.userLoginId, 'createdBy')
								.field(UserEntity.usEdited.userLoginId, 'editedBy')
								.from(CategoryEntity.tableName)
								.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(CategoryEntity.columns.createdBy, UserEntity.usCreated.id))
								.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(CategoryEntity.columns.editedBy, UserEntity.usEdited.id))
								.where(squelUtils.eql(CategoryEntity.columns.isDeleted, 0))
								.order(CategoryEntity.columns.name).toString();
	
	logger.debug(categoryQuery);
	
	connection.query(categoryQuery, function(err, rs){
		cb(err, rs);
	});
	
}

Category.prototype.getCategoryDetail = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var id = data.id;
	
	var categoryQuery = squel.select()
							.field(CategoryEntity.columns.id, 'id')
							.field(CategoryEntity.columns.name, 'name')
							.field(CategoryEntity.columns.color, 'color')
							.field(CategoryEntity.columns.isImported, 'isImported')
							.field(CategoryEntity.columns.isDeleted, 'isDeleted')
							.field(CategoryEntity.columns.createdDate, 'createdDate')
							.field(CategoryEntity.columns.editedDate, 'editedDate')
							.field(CategoryEntity.columns.createdBy, 'createdById')
							.field(UserEntity.usCreated.userLoginId, 'createdBy')
							.field(UserEntity.usEdited.userLoginId, 'editedBy')
							.from(CategoryEntity.tableName)
							.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(CategoryEntity.columns.createdBy, UserEntity.usCreated.id))
							.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(CategoryEntity.columns.editedBy, UserEntity.usEdited.id))
							.where(squelUtils.eql(CategoryEntity.columns.isDeleted, 0))
							.where(squelUtils.eql(CategoryEntity.columns.id, id)).toString();
	
	logger.debug(categoryQuery);
	
	connection.query(categoryQuery, function(err, rs){
		return cb(err, rs);
	});
	
}


Category.prototype.uniquenessCheckAndImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = squel.select()
						.field(CategoryEntity.columns.id, 'id')
						.field(CategoryEntity.columns.name, 'name')
						.field(CategoryEntity.columns.isImported, 'isImported')
						.field(CategoryEntity.columns.createdBy, 'createdById')
						.from(CategoryEntity.tableName)
						.where(squelUtils.eql(CategoryEntity.columns.isDeleted, 0));
	
	var secondaryQuery = null;
	
	secondaryQuery = squel.expr()
	 					  .and(squelUtils.joinEql(1,1));
	
	var id = data.id;
	var name = data.name;

	if(name){
		secondaryQuery.and(squelUtils.eql(CategoryEntity.columns.name, name));
	}else{
		name = id;
		secondaryQuery.and(squelUtils.eql(CategoryEntity.columns.id, name));
	}
	if(id){
		secondaryQuery.or(squelUtils.eql(CategoryEntity.columns.id, id));
	}
	
	categoryQuery = categoryQuery.where(secondaryQuery).toString();
	
	logger.debug(categoryQuery);
	
	var queryString = connection.query(categoryQuery, function(err, rs){
		cb(err, rs);
	});
}

Category.prototype.categoriesExistence = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var id = data.id;
	
	var categoryQuery = squel.select()
						.field(CategoryEntity.columns.id, 'id')
						.from(CategoryEntity.tableName)
						.where(squelUtils.in(CategoryEntity.columns.id, id));
	
	
	categoryQuery = categoryQuery.toString();
	
	logger.debug(categoryQuery);
	
	if(id && id.length > 0){
		var queryString = connection.query(categoryQuery, function(err, rs){
			cb(err, rs);
		});
	}else{
		cb(null, []);
	}
}

Category.prototype.updateCategory = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var updateData = {};
	CategoryCoverter.categoryModelToEntity(data, function(err, entityBean){

		var id = entityBean[CategoryEntity.columns.id];
		
		updateData[CategoryEntity.columns.name] = entityBean[CategoryEntity.columns.name];
		updateData[CategoryEntity.columns.color] = entityBean[CategoryEntity.columns.color];
		updateData[CategoryEntity.columns.editedBy] = entityBean[CategoryEntity.columns.editedBy];
		updateData[CategoryEntity.columns.editedDate] = entityBean[CategoryEntity.columns.editedDate];
		
		var categoryQuery = [];

		
		categoryQuery.push(" UPDATE " + CategoryEntity.tableName + " SET ? WHERE id = ? ");
		
		categoryQuery = categoryQuery.join("");
		
		logger.debug(categoryQuery);
		
		connection.query(categoryQuery, [updateData, id], function(err, rs){
			return cb(err, rs);
		});
		
	});
	
}

Category.prototype.deleteCategory = function(data, cb){

	var connection = BaseDao.getConnection(data);

	CategoryCoverter.categoryModelToEntity(data, function(err, entityBean){

		var id = entityBean[CategoryEntity.columns.id];
		
		var updateData = {};
		updateData[CategoryEntity.columns.isDeleted] = 1;
		updateData[CategoryEntity.columns.editedBy] = entityBean[CategoryEntity.columns.editedBy];
		updateData[CategoryEntity.columns.editedDate] = entityBean[CategoryEntity.columns.editedDate];
		
		var categoryQuery = [];
		categoryQuery.push(" UPDATE " + CategoryEntity.tableName + " SET ? WHERE id = ? ");
		
		categoryQuery = categoryQuery.join("");
		
		logger.debug(categoryQuery);
		
		connection.query(categoryQuery, [updateData, id], function(err, rs){
			return cb(err, rs);
		});
		
	});

}

Category.prototype.createCategory = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	CategoryCoverter.categoryModelToEntity(data, function(err, entityBean){
		
		var categoryQuery = [];

		categoryQuery.push(" INSERT INTO " + CategoryEntity.tableName + " SET ? ");
		
		categoryQuery = categoryQuery.join("");
		
		connection.query(categoryQuery, [entityBean], function(err, rs){
			if(err){
				return cb(err);
			}
			if(rs && rs.insertId){
				var result = {
						id : rs.insertId
				}
				
				return cb(null, result);
			}
		});
	});

}

module.exports = new Category();