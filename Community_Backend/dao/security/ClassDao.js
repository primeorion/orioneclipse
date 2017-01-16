"use strict";

var moduleName = __filename;

var _ = require('lodash');

var logger = require("helper").logger(moduleName);

var BaseDao = require('dao/BaseDao');

var Class = function(){
	
}

var tableNames = [
                  	'assetClass',
                  	'assetCategory',
                  	'user'
                 ];


Class.prototype.getClassList = function(data, cb){
	var connection = BaseDao.getConnection(data);
	
	var classQuery = [];
	
	classQuery.push(" SELECT ac.id, ac.name, ac.color, ac.isDeleted, ac.createdDate , ac.editedDate, uc.userLoginId as createdBy, ac.createdBy AS createdById, ");
	classQuery.push(" ue.userLoginId as editedBy ");
	classQuery.push(" FROM " + tableNames[0] + " AS ac ");
	classQuery.push(" INNER JOIN " + tableNames[2] + "  AS uc ON ac.createdBy = uc.id ");
	classQuery.push(" INNER JOIN " + tableNames[2] + "  AS ue ON ac.editedBy = ue.id ");
	classQuery.push(" WHERE ac.isDeleted = 0 ");
	
	if(data.search){
		
	}
	
	classQuery = classQuery.join("");
	
	connection.query(classQuery, function(err, rs){
		cb(err, rs);
	});
	
}

Class.prototype.getClassDetail = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var classQuery = [];
	
	var id = data.id;
	
	classQuery.push(" SELECT ac.id, ac.name, ac.color, ac.isDeleted, ac.createdDate , ac.editedDate, uc.userLoginId as createdBy, ac.createdBy AS createdById, ");
	classQuery.push(" ue.userLoginId as editedBy ");
	classQuery.push(" FROM " + tableNames[0] + " AS ac ");
	classQuery.push(" INNER JOIN " + tableNames[2] + "  AS uc ON ac.createdBy = uc.id ");
	classQuery.push(" INNER JOIN " + tableNames[2] + "  AS ue ON ac.editedBy = ue.id ");
	classQuery.push(" WHERE ac.id = ? AND ac.isDeleted = 0 ");
	
	classQuery = classQuery.join("");

	connection.query(classQuery, [id], function(err, rs){
		return cb(err, rs);
	});
	
}

Class.prototype.uniquenessCheckAndImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var classQuery = [];
	
	var id = data.id;
	var name = data.name;
	
	classQuery.push(" SELECT id as id, name as name, createdBy as createdById FROM " + tableNames[0] + " WHERE isDeleted = 0 AND ( 1=1 ");
	
	if(name){
		classQuery.push(" AND name = ? ");
	}else{
		name = id;
		classQuery.push(" AND id = ? ");
	}
	if(id){
		classQuery.push(" OR id = ? ");
	}
	
	classQuery.push(" ) ");
	
	classQuery = classQuery.join("");
	
	connection.query(classQuery, [name, id], function(err, rs){
		cb(err, rs);
	});
	
}

Class.prototype.isImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var classQuery = [];
	
	var id = data.id;
	
	classQuery.push(" SELECT id as id, name as name, createdBy as createdById FROM " + tableNames[0] + " WHERE id = ? AND isDeleted = 0 ");
	
	classQuery = classQuery.join("");

	connection.query(classQuery, [id], function(err, rs){	
		cb(err, rs);
	});
}

Class.prototype.updateClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var classQuery = [];
	
	var id = data.id;
	
	var updateData = {
			name : data.name,
			color : data.color,
			editedBy : data.editedBy,
			editedDate : data.editedDate
	};
	
	classQuery.push(" UPDATE " + tableNames[0] + " SET ? WHERE id = ? ");
	
	classQuery = classQuery.join("");
	
	connection.query(classQuery, [updateData, id], function(err, rs){
		return cb(err, rs);
	});
}

Class.prototype.deleteClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var classQuery = [];
	
	var id = data.id;
	
	var updateData = {
			isDeleted : 1,
			editedBy : data.editedBy,
			editedDate : data.editedDate
	};
	
	classQuery.push(" UPDATE " + tableNames[0] + " SET ? WHERE id = ? ");
	
	classQuery = classQuery.join("");
	
	connection.query(classQuery, [updateData, id], function(err, rs){
		return cb(err, rs);
	});
}

Class.prototype.createClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var classQuery = [];
	
	var id = data.id;
	var entityBean = data;
	entityBean = _.omit(entityBean, [ "reqId" ]);
	
	classQuery.push(" INSERT INTO " + tableNames[0] + " SET ? ON DUPLICATE KEY UPDATE ? ");
	var updateBean = _.omit(entityBean,['id']);
	
	classQuery = classQuery.join("");
	
	connection.query(classQuery, [entityBean, updateBean], function(err, rs){
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

module.exports = new Class();