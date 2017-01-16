"use strict";

var moduleName = __filename;

var _ = require('lodash');
var squel = require("squel");

var logger = require("helper").logger(moduleName);
var BaseDao = require('dao/BaseDao');
var squelUtils = require("service/util/SquelUtils.js");
var ClassCoverter= require('converter/security/ClassConverter.js');
var ClassEntity = require('entity/security/Class.js');
var UserEntity = require("entity/user/User.js");

var Class = function(){
	
}

var tableNames = [
                  	'assetClass',
                  	'assetCategory',
                  	'user'
                 ];


Class.prototype.getClassList = function(data, cb){
	var connection = BaseDao.getConnection(data);
	
	var classQuery = squel.select()
								.field(ClassEntity.columns.id, 'id')
								.field(ClassEntity.columns.name, 'name')
								.field(ClassEntity.columns.color, 'color')
								.field(ClassEntity.columns.isImported, 'isImported')
								.field(ClassEntity.columns.isDeleted, 'isDeleted')
								.field(ClassEntity.columns.createdDate, 'createdDate')
								.field(ClassEntity.columns.editedDate, 'editedDate')
								.field(ClassEntity.columns.createdBy, 'createdById')
								.field(UserEntity.usCreated.userLoginId, 'createdBy')
								.field(UserEntity.usEdited.userLoginId, 'editedBy')
								.from(ClassEntity.tableName)
								.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(ClassEntity.columns.createdBy, UserEntity.usCreated.id))
								.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(ClassEntity.columns.editedBy, UserEntity.usEdited.id))
								.where(squelUtils.eql(ClassEntity.columns.isDeleted, 0))
								.order(ClassEntity.columns.name).toString();
	
	logger.debug(classQuery);
	
	connection.query(classQuery, function(err, rs){
		cb(err, rs);
	});
	
}

Class.prototype.getClassDetail = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var id = data.id;
	
	var classQuery = squel.select()
							.field(ClassEntity.columns.id, 'id')
							.field(ClassEntity.columns.name, 'name')
							.field(ClassEntity.columns.color, 'color')
							.field(ClassEntity.columns.isImported, 'isImported')
							.field(ClassEntity.columns.isDeleted, 'isDeleted')
							.field(ClassEntity.columns.createdDate, 'createdDate')
							.field(ClassEntity.columns.editedDate, 'editedDate')
							.field(ClassEntity.columns.createdBy, 'createdById')
							.field(UserEntity.usCreated.userLoginId, 'createdBy')
							.field(UserEntity.usEdited.userLoginId, 'editedBy')
							.from(ClassEntity.tableName)
							.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(ClassEntity.columns.createdBy, UserEntity.usCreated.id))
							.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(ClassEntity.columns.editedBy, UserEntity.usEdited.id))
							.where(squelUtils.eql(ClassEntity.columns.isDeleted, 0))
							.where(squelUtils.eql(ClassEntity.columns.id, id)).toString();
	
	logger.debug(classQuery);
	
	connection.query(classQuery, function(err, rs){
		return cb(err, rs);
	});
	
}

Class.prototype.uniquenessCheckAndImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var classQuery = squel.select()
						.field(ClassEntity.columns.id, 'id')
						.field(ClassEntity.columns.name, 'name')
						.field(ClassEntity.columns.isImported, 'isImported')
						.field(ClassEntity.columns.createdBy, 'createdById')
						.from(ClassEntity.tableName)
						.where(squelUtils.eql(ClassEntity.columns.isDeleted, 0));
	
	var secondaryQuery = null;
	
	secondaryQuery = squel.expr()
	 					  .and(squelUtils.joinEql(1,1));
	
	var id = data.id;
	var name = data.name;

	if(name){
		secondaryQuery.and(squelUtils.eql(ClassEntity.columns.name, name));
	}else{
		name = id;
		secondaryQuery.and(squelUtils.eql(ClassEntity.columns.id, name));
	}
	if(id){
		secondaryQuery.or(squelUtils.eql(ClassEntity.columns.id, id));
	}
	
	classQuery = classQuery.where(secondaryQuery).toString();
	
	logger.debug(classQuery);
	
	var queryString = connection.query(classQuery, function(err, rs){
		cb(err, rs);
	});
}

Class.prototype.classesExistence = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var id = data.id;
	
	var classQuery = squel.select()
						.field(ClassEntity.columns.id, 'id')
						.from(ClassEntity.tableName)
						.where(squelUtils.in(ClassEntity.columns.id, id));
		
	classQuery = classQuery.toString();
	
	logger.debug(classQuery);
	
	if(id && id.length > 0){
		var queryString = connection.query(classQuery, function(err, rs){
			cb(err, rs);
		});
	}else{
		cb(null, []);
	}
}


//Class.prototype.isImportedCheck = function(data, cb){
//	
//	var connection = BaseDao.getConnection(data);
//	
//	var classQuery = [];
//	
//	var id = data.id;
//	
//	classQuery.push(" SELECT id as id, name as name, createdBy as createdById FROM " + tableNames[0] + " WHERE id = ? AND isDeleted = 0 ");
//	
//	classQuery = classQuery.join("");
//
//	connection.query(classQuery, [id], function(err, rs){	
//		cb(err, rs);
//	});
//}

Class.prototype.updateClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var updateData = {};
	ClassCoverter.classModelToEntity(data, function(err, entityBean){

		var id = entityBean[ClassEntity.columns.id];
		
		updateData[ClassEntity.columns.name] = entityBean[ClassEntity.columns.name];
		updateData[ClassEntity.columns.color] = entityBean[ClassEntity.columns.color];
		updateData[ClassEntity.columns.editedBy] = entityBean[ClassEntity.columns.editedBy];
		updateData[ClassEntity.columns.editedDate] = entityBean[ClassEntity.columns.editedDate];
		
		var classQuery = [];

		
		classQuery.push(" UPDATE " + ClassEntity.tableName + " SET ? WHERE id = ? ");
		
		classQuery = classQuery.join("");
		
		logger.debug(classQuery);
		
		connection.query(classQuery, [updateData, id], function(err, rs){
			return cb(err, rs);
		});
		
	});
	
}

Class.prototype.deleteClass = function(data, cb){

	var connection = BaseDao.getConnection(data);

	ClassCoverter.classModelToEntity(data, function(err, entityBean){

		var id = entityBean[ClassEntity.columns.id];
		
		var updateData = {};
		
		updateData[ClassEntity.columns.isDeleted] = 1;
		updateData[ClassEntity.columns.editedBy] = entityBean[ClassEntity.columns.editedBy];
		updateData[ClassEntity.columns.editedDate] = entityBean[ClassEntity.columns.editedDate];
		
		var classQuery = [];
		classQuery.push(" UPDATE " + ClassEntity.tableName + " SET ? WHERE id = ? ");
		
		classQuery = classQuery.join("");
		
		logger.debug(classQuery);
		
		connection.query(classQuery, [updateData, id], function(err, rs){
			return cb(err, rs);
		});
		
	});

}

Class.prototype.createClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	ClassCoverter.classModelToEntity(data, function(err, entityBean){
		
		var classQuery = [];

		classQuery.push(" INSERT INTO " + ClassEntity.tableName + " SET ? ");
		
		classQuery = classQuery.join("");
		
		connection.query(classQuery, [entityBean], function(err, rs){
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

module.exports = new Class();