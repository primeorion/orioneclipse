"use strict";

var moduleName = __filename;

var _ = require('lodash');

var logger = require("helper").logger(moduleName);

var BaseDao = require('dao/BaseDao');

var SubClass = function(){
	
}

var tableNames = [
                  	'assetSubClass',
                  	'user'
                 ];


SubClass.prototype.getSubClassList = function(data, cb){
	var connection = BaseDao.getConnection(data);
	
	var SubClassQuery = [];

	SubClassQuery.push(" SELECT ac.id, ac.name, ac.color, ac.isDeleted, ac.createdDate , ac.editedDate, uc.userLoginId as createdBy, ac.createdBy AS createdById, ");
	SubClassQuery.push(" ue.userLoginId as editedBy ");
	SubClassQuery.push(" FROM " + tableNames[0] + " AS ac  ");
	SubClassQuery.push(" INNER JOIN " + tableNames[1] + "  AS uc ON ac.createdBy = uc.id ");
	SubClassQuery.push(" INNER JOIN " + tableNames[1] + "  AS ue ON ac.editedBy = ue.id ");
	SubClassQuery.push(" WHERE ac.isDeleted = 0 ");
	
	if(data.search){
		
	}
	
	SubClassQuery = SubClassQuery.join("");
	
	connection.query(SubClassQuery, function(err, rs){
		cb(err, rs);
	});
	
}

SubClass.prototype.getSubClassDetail = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var SubClassQuery = [];
	
	var id = data.id;
	
	SubClassQuery.push(" SELECT ac.id, ac.name, ac.color, ac.isDeleted, ac.createdDate , ac.editedDate, uc.userLoginId as createdBy, ac.createdBy AS createdById, ");
	SubClassQuery.push(" ue.userLoginId as editedBy ");
	SubClassQuery.push(" FROM " + tableNames[0] + " AS ac  ");
	SubClassQuery.push(" INNER JOIN " + tableNames[1] + "  AS uc ON ac.createdBy = uc.id ");
	SubClassQuery.push(" INNER JOIN " + tableNames[1] + "  AS ue ON ac.editedBy = ue.id ");
	SubClassQuery.push(" WHERE ac.id = ? AND ac.isDeleted = 0 ");

	SubClassQuery = SubClassQuery.join("");

	connection.query(SubClassQuery, [id], function(err, rs){
		return cb(err, rs);
	});
	
}

SubClass.prototype.uniquenessCheckAndImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var SubClassQuery = [];
	
	var id = data.id;
	var name = data.name;
	
	SubClassQuery.push(" SELECT id as id, name as name, createdBy as createdById FROM " + tableNames[0] + " WHERE isDeleted = 0 AND ( 1=1 ");
	
	if(name){
		SubClassQuery.push(" AND name = ? ");
	}else{
		name = id;
		SubClassQuery.push(" AND id = ? ");
	}
	if(id){
		SubClassQuery.push(" OR id = ? ");
	}
	
	SubClassQuery.push(" ) ");
	
	
	SubClassQuery = SubClassQuery.join("");
	
	var queryString = connection.query(SubClassQuery, [name, id, id], function(err, rs){
		cb(err, rs);
	});
	
}

SubClass.prototype.isImportedCheck = function(data, cb){
	
	var connection = BaseDao.getConnection(data);
	
	var subClassQuery = [];
	
	var id = data.id;
	
	subClassQuery.push(" SELECT id as id, name as name, createdBy as createdById FROM " + tableNames[0] + " WHERE id = ? AND isDeleted = 0 ");
	
	subClassQuery = subClassQuery.join("");

	connection.query(subClassQuery, [id], function(err, rs){
		cb(err, rs);
	});
}

SubClass.prototype.updateSubClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var SubClassQuery = [];
	
	var id = data.id;
	
	var updateData = {
			name : data.name,
			color : data.color,
			editedBy : data.editedBy,
			editedDate : data.editedDate
	};
	
	SubClassQuery.push(" UPDATE " + tableNames[0] + " SET ? WHERE id = ? ");
	
	SubClassQuery = SubClassQuery.join("");
	
	connection.query(SubClassQuery, [updateData, id], function(err, rs){
		return cb(err, rs);
	});
}

SubClass.prototype.deleteSubClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var subClassQuery = [];
	
	var id = data.id;
	
	var updateData = {
			isDeleted : 1,
			editedBy : data.editedBy,
			editedDate : data.editedDate
	};
	
	subClassQuery.push(" UPDATE " + tableNames[0] + " SET ? WHERE id = ? ");
	
	subClassQuery = subClassQuery.join("");
	
	connection.query(subClassQuery, [updateData, id], function(err, rs){
		return cb(err, rs);
	});
}

SubClass.prototype.createSubClass = function(data, cb){

	var connection = BaseDao.getConnection(data);
	
	var subClassQuery = [];
	
	var id = data.id;
	var entityBean = data;
	
	entityBean = _.omit(entityBean, [ "reqId" ]);
	
	subClassQuery.push(" INSERT INTO " + tableNames[0] + " SET ? ON DUPLICATE KEY UPDATE ? ");
	var updateBean = _.omit(entityBean,['id']);
	
	subClassQuery = subClassQuery.join("");
	
	connection.query(subClassQuery, [entityBean, updateBean], function(err, rs){
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

module.exports = new SubClass();
