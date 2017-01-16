"use strict";

var moduleName = __filename;

var _ = require('lodash');

var logger = require("helper").logger(moduleName);
var BaseDao = require('dao/BaseDao');

var etlUserId = require('config').applicationEnum.ETLUserId;

var Category = function(){
	
}

var tableNames = [
                  	'assetCategory',
                  	'user'
                 ];


Category.prototype.getCategories = function(data, cb){
	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = [];

	categoryQuery.push(" SELECT ac.id, ac.name, ac.color, ac.isDeleted, ac.createdDate , ac.editedDate, ue.userLoginId as createdBy, ac.createdBy as createdById ");
	categoryQuery.push(" ,ue.userLoginId as editedBy ");
	categoryQuery.push(" FROM " + tableNames[0] + " AS ac ");
	categoryQuery.push(" INNER JOIN " + tableNames[1] + "  AS uc ON ac.createdBy = uc.id ");
	categoryQuery.push(" INNER JOIN " + tableNames[1] + "  AS ue ON ac.editedBy = ue.id ");
	categoryQuery.push(" WHERE ac.isDeleted = 0 ");
	
	if(data.search){
		
	}
	
	categoryQuery = categoryQuery.join("");
	
	connection.query(categoryQuery, function(err, rs){
		cb(err, rs);
	});
	
}

Category.prototype.getCategoryDetail = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = [];
	
	var id = data.id;
	
	categoryQuery.push(" SELECT ac.id, ac.name, ac.color, ac.isDeleted, ac.createdDate , ac.editedDate, uc.userLoginId as createdBy, ac.createdBy as createdById ");
	categoryQuery.push(" ,ue.userLoginId as editedBy ");
	categoryQuery.push(" FROM " + tableNames[0] + " AS ac ");
	categoryQuery.push(" INNER JOIN " + tableNames[1] + "  AS uc ON ac.createdBy = uc.id ");
	categoryQuery.push(" INNER JOIN " + tableNames[1] + "  AS ue ON ac.editedBy = ue.id ");
	categoryQuery.push(" WHERE ac.id = ? AND ac.isDeleted = 0 ");

	
	categoryQuery = categoryQuery.join("");
	
	connection.query(categoryQuery, [id], function(err, rs){
		return cb(err, rs);
	});
	
}

Category.prototype.uniquenessCheckAndImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = [];
	
	var id = data.id;
	var name = data.name;
	
	categoryQuery.push(" SELECT id as id, name as name, createdBy as createdById FROM " + tableNames[0] + " WHERE isDeleted = 0 AND ( 1=1 ");
	
	if(name){
		categoryQuery.push(" AND name = ? ");
	}else{
		name = id;
		categoryQuery.push(" AND id = ? ");
	}
	if(id){
		categoryQuery.push(" OR id = ? ");
	}
	
	categoryQuery.push(" ) ");
	
	categoryQuery = categoryQuery.join("");

	var quer = connection.query(categoryQuery, [name, id], function(err, rs){
		cb(err, rs);
	});
}

Category.prototype.isImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = [];
	
	var id = data.id;
	
	categoryQuery.push(" SELECT id as id, name as name, createdBy as createdById FROM " + tableNames[0] + " WHERE id = ? AND isDeleted = 0 ");
	
	categoryQuery = categoryQuery.join("");

	connection.query(categoryQuery, [id], function(err, rs){
		cb(err, rs);
	});
}



Category.prototype.updateCategory = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = [];
	
	var id = data.id;
	
	var updateData = {
			name : data.name,
			color : data.color,
			editedBy : data.editedBy,
			editedDate : data.editedDate
	};
	
	categoryQuery.push(" UPDATE " + tableNames[0] + " SET ? WHERE id = ? ");
	
	categoryQuery = categoryQuery.join("");
	
	connection.query(categoryQuery, [updateData, id], function(err, rs){
		return cb(err, rs);
	});
}

Category.prototype.deleteCategory = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var categoryQuery = [];
	
	var id = data.id;
	
	var updateData = {
			isDeleted : 1,
			editedBy : data.editedBy,
			editedDate : data.editedDate
	};
	
	categoryQuery.push(" UPDATE " + tableNames[0] + " SET ? WHERE id = ? ");
	
	categoryQuery = categoryQuery.join("");
	
	connection.query(categoryQuery, [updateData, id], function(err, rs){
		return cb(err, rs);
	});
}

Category.prototype.createCategory = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	 var entityBean = data;
	 entityBean = _.omit(entityBean,['reqId']);
	
	var categoryQuery = [];

	categoryQuery.push(" INSERT INTO " + tableNames[0] + " SET ? ");
	
	categoryQuery = categoryQuery.join("");
	
	var updateBean = _.omit(entityBean,['id']);
	
	connection.query(categoryQuery, [entityBean, updateBean], function(err, rs){
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
}

module.exports = new Category();