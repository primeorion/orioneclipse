"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");

var utilDao = require('dao/util/UtilDao.js');
var baseDao = require('dao/BaseDao');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');

var userEntity = require("entity/user/User.js");
var searchModule = require('entity/search/SearchModule.js'); 
var searchPage = require('entity/search/SearchPage.js'); 

var SearchDao = function(){};

SearchDao.prototype.addSearchModule =  function (data, cb) {
	logger.debug("Add Search module dao request");
	var connection = baseDao.getConnection(data);
	
	var queryData = {};
	queryData[searchModule.columns.name] = data.name;
	queryData[searchModule.columns.relativePath] = data.relativePath;

	var query = 'INSERT INTO '+searchModule.tableName+' SET ?';

	logger.debug("Insert search module Query = >"+query);
	connection.query(query, [queryData], function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
}

SearchDao.prototype.addSearchPage =  function (data, cb) {
	logger.debug("Add Search page dao request");
	var connection = baseDao.getConnection(data);
	
	var queryData = {};
	queryData[searchPage.columns.name] = data.name;
	queryData[searchPage.columns.relativePath] = data.relativePath;
	queryData[searchPage.columns.searchModuleId] = data.searchModuleId;

	var query = 'INSERT INTO '+searchPage.tableName+' SET ?';

	logger.debug("Insert search page Query = >"+query);
	connection.query(query, [queryData], function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
}

SearchDao.prototype.getSearchModule =  function (data, cb) {
	logger.debug("Get Search module dao request");
	var connection = baseDao.getConnection(data);
	
	var query = squel.select()
	.field(searchModule.columns.id,"id")
	.field(searchModule.columns.name,"name")
	.field(searchModule.columns.relativePath,"relativePath")
	.from(searchModule.tableName)
	if(data.moduleIds){
		var ids = [];
		var modules = data.moduleIds.split(",");
		modules.forEach(function(moduleId){
			ids.push(moduleId);
		});
		query.where(squel.expr().and(squelUtils.in(searchModule.columns.id,ids)));
	}
	
	if (data.search) {
        query.where(
            squel.expr().and(
                squelUtils.like(searchModule.columns.name,data.search)
            )
        )
    }
	query = query.toString();	

	logger.debug("Get search module Query = >"+query);
	connection.query(query, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
}

SearchDao.prototype.getSearchPage =  function (data, cb) {
	logger.debug("Get Search page dao request");
	var connection = baseDao.getConnection(data);
	
	var query = squel.select()
	.field(searchPage.columns.id,"id")
	.field(searchPage.columns.name,"name")
	.field(searchPage.columns.relativePath,"relativePath")
	.field(searchModule.columns.id,"searchModuleId")
	.field(searchModule.columns.name,"searchModuleName")
	.from(searchPage.tableName)
	.join(searchModule.tableName,null, squel.expr()
        .and(squelUtils.joinEql(searchModule.columns.id,searchPage.columns.searchModuleId))
    )
    if(data.moduleIds){
		var ids = [];
		var modules = data.moduleIds.split(",");
		modules.forEach(function(moduleId){
			ids.push(moduleId);
		});
		query.where(squel.expr().and(squelUtils.in(searchModule.columns.id,ids)));
	}
	if (data.search) {
        query.where(
            squel.expr().and(
                squelUtils.like(searchPage.columns.name,data.search)
            )
        )
    }
	query = query.toString();	

	logger.debug("Get search page Query = >"+query);
	connection.query(query, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
}
module.exports = SearchDao;