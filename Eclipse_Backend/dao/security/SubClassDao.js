"use strict";

var moduleName = __filename;

var squel = require("squel");
var _ = require('lodash');

var logger = require("helper").logger(moduleName);
var BaseDao = require('dao/BaseDao');

var squelUtils = require("service/util/SquelUtils.js");
var SubClassCoverter = require('converter/security/SubClassConverter.js');
var SubClassEntity = require('entity/security/SubClass.js');
var UserEntity = require("entity/user/User.js");

var SubClass = function(){
	
}

var tableNames = [
                  	'assetSubClass',
                  	'user'
                 ];


SubClass.prototype.getSubClassList = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var subClassQuery = squel.select()
								.field(SubClassEntity.columns.id, 'id')
								.field(SubClassEntity.columns.name, 'name')
								.field(SubClassEntity.columns.color, 'color')
								.field(SubClassEntity.columns.isImported, 'isImported')
								.field(SubClassEntity.columns.isDeleted, 'isDeleted')
								.field(SubClassEntity.columns.createdDate, 'createdDate')
								.field(SubClassEntity.columns.editedDate, 'editedDate')
								.field(SubClassEntity.columns.createdBy, 'createdById')
								.field(UserEntity.usCreated.userLoginId, 'createdBy')
								.field(UserEntity.usEdited.userLoginId, 'editedBy')
								.from(SubClassEntity.tableName)
								.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(SubClassEntity.columns.createdBy, UserEntity.usCreated.id))
								.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(SubClassEntity.columns.editedBy, UserEntity.usEdited.id))
								.where(squelUtils.eql(SubClassEntity.columns.isDeleted, 0))
								.order(SubClassEntity.columns.name).toString();
	
	logger.debug(subClassQuery);
	
	connection.query(subClassQuery, function(err, rs){
		cb(err, rs);
	});
	
}

SubClass.prototype.getSubClassDetail = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var id = data.id;
	
	var subClassQuery = squel.select()
							.field(SubClassEntity.columns.id, 'id')
							.field(SubClassEntity.columns.name, 'name')
							.field(SubClassEntity.columns.color, 'color')
							.field(SubClassEntity.columns.isImported, 'isImported')
							.field(SubClassEntity.columns.isDeleted, 'isDeleted')
							.field(SubClassEntity.columns.createdDate, 'createdDate')
							.field(SubClassEntity.columns.editedDate, 'editedDate')
							.field(SubClassEntity.columns.createdBy, 'createdById')
							.field(UserEntity.usCreated.userLoginId, 'createdBy')
							.field(UserEntity.usEdited.userLoginId, 'editedBy')
							.from(SubClassEntity.tableName)
							.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(SubClassEntity.columns.createdBy, UserEntity.usCreated.id))
							.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(SubClassEntity.columns.editedBy, UserEntity.usEdited.id))
							.where(squelUtils.eql(SubClassEntity.columns.isDeleted, 0))
							.where(squelUtils.eql(SubClassEntity.columns.id, id)).toString();
	
	logger.debug(subClassQuery);
	
	connection.query(subClassQuery, function(err, rs){
		return cb(err, rs);
	});
	
}

SubClass.prototype.uniquenessCheckAndImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = squel.select()
						.field(SubClassEntity.columns.id, 'id')
						.field(SubClassEntity.columns.name, 'name')
						.field(SubClassEntity.columns.isImported, 'isImported')
						.field(SubClassEntity.columns.createdBy, 'createdById')
						.from(SubClassEntity.tableName)
						.where(squelUtils.eql(SubClassEntity.columns.isDeleted, 0));
	
	var secondaryQuery = null;
	
	secondaryQuery = squel.expr()
	 					  .and(squelUtils.joinEql(1,1));
	
	var id = data.id;
	var name = data.name;

	if(name){
		secondaryQuery.and(squelUtils.eql(SubClassEntity.columns.name, name));
	}else{
		name = id;
		secondaryQuery.and(squelUtils.eql(SubClassEntity.columns.id, name));
	}
	if(id){
		secondaryQuery.or(squelUtils.eql(SubClassEntity.columns.id, id));
	}
	
	categoryQuery = categoryQuery.where(secondaryQuery).toString();
	
	logger.debug(categoryQuery);
	
	var queryString = connection.query(categoryQuery, function(err, rs){
		cb(err, rs);
	});
}

SubClass.prototype.subclassesExistence = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var id = data.id;
	
	var categoryQuery = squel.select()
						.field(SubClassEntity.columns.id, 'id')
						.from(SubClassEntity.tableName)
						.where(squelUtils.in(SubClassEntity.columns.id, id));
	
		
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

SubClass.prototype.updateSubClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var updateData = {};
	SubClassCoverter.subClassModelToEntity(data, function(err, entityBean){

		var id = entityBean[SubClassEntity.columns.id];
		
		updateData[SubClassEntity.columns.name] = entityBean[SubClassEntity.columns.name];
		updateData[SubClassEntity.columns.color] = entityBean[SubClassEntity.columns.color];
		updateData[SubClassEntity.columns.editedBy] = entityBean[SubClassEntity.columns.editedBy];
		updateData[SubClassEntity.columns.editedDate] = entityBean[SubClassEntity.columns.editedDate];
		
		var categoryQuery = [];

		
		categoryQuery.push(" UPDATE " + SubClassEntity.tableName + " SET ? WHERE id = ? ");
		
		categoryQuery = categoryQuery.join("");
		
		logger.debug(categoryQuery);
		
		connection.query(categoryQuery, [updateData, id], function(err, rs){
			return cb(err, rs);
		});
		
	});
	
}

SubClass.prototype.deleteSubClass = function(data, cb){

	var connection = BaseDao.getConnection(data);

	SubClassCoverter.subClassModelToEntity(data, function(err, entityBean){

		var id = entityBean[SubClassEntity.columns.id];
		
		var updateData = {};
		updateData[SubClassEntity.columns.isDeleted] = 1;
		updateData[SubClassEntity.columns.editedBy] = entityBean[SubClassEntity.columns.editedBy];
		updateData[SubClassEntity.columns.editedDate] = entityBean[SubClassEntity.columns.editedDate];
		
		var categoryQuery = [];
		categoryQuery.push(" UPDATE " + SubClassEntity.tableName + " SET ? WHERE id = ? ");
		
		categoryQuery = categoryQuery.join("");
		
		logger.debug(categoryQuery);
		
		connection.query(categoryQuery, [updateData, id], function(err, rs){
			return cb(err, rs);
		});
		
	});

}

SubClass.prototype.createSubClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	SubClassCoverter.subClassModelToEntity(data, function(err, entityBean){
		
		var categoryQuery = [];

		categoryQuery.push(" INSERT INTO " + SubClassEntity.tableName + " SET ? ");
		
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

module.exports = new SubClass();
