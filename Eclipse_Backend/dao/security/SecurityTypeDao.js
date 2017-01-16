"use strict";

var moduleName = __filename;

var _ = require("lodash");

var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var utilDao = require('dao/util/UtilDao.js');

var SecurityDao = function () { }

SecurityDao.prototype.getSecurityTypeList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(" SELECT ST.id,ST.name,ST.isDeleted,ST.createdDate as createdOn,uc.userLoginId as createdBy, ");
    query.push(" ST.editedDate as editedOn,ue.userLoginId as editedBy from securityType AS ST ");
    query.push(" INNER JOIN user  AS uc ON ST.createdBy = uc.id ");
    query.push(" INNER JOIN user  AS ue ON ST.editedBy = ue.id ");
    query.push(" WHERE 1=1 ");

    if (data.search) {
        query.push(" AND ");
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(" ST.id= '" + data.search + "' OR ");
        }
        query.push(" ST.name LIKE '%" + data.search + "%' ");
    }
    
    query.push(' AND ST.isDeleted = 0 ');

    query = query.join("");
    logger.debug("Query: " + query);
    
    connection.query(query, function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, resultSet);
    });
};

SecurityDao.prototype.getSecurityTypeById = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    
    var query = [];
    var id = data.id;
    
    query.push(" SELECT ST.id,ST.name,ST.isDeleted");
    query.push(" FROM securityType AS ST ");
    query.push(" WHERE ST.id = ? AND ST.isDeleted = 0 ");
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, [id], function (err, resultSet) {
        return cb(err, resultSet);
    });
};

SecurityDao.prototype.getSecurityTypeByName = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    
    var query = [];
    var id = data.name;
    
    query.push(" SELECT ST.id,ST.name,ST.isDeleted");
    query.push(" FROM securityType AS ST ");
    query.push(" WHERE ST.name = ? AND ST.isDeleted = 0 ");

    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, id, function (err, resultSet) {
        return cb(err, resultSet);
    });
};

SecurityDao.prototype.createSecurityType = function(data, cb){

	var connection = baseDao.getConnection(data);
	
	 var entityBean = data;
	 entityBean = _.omit(entityBean,['reqId']);
	
	var categoryQuery = [];

	categoryQuery.push(" INSERT INTO securityType SET ? ");
	
	categoryQuery = categoryQuery.join("");
	
	var updateBean = _.omit(entityBean,['id']);
	
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
}

module.exports = SecurityDao;