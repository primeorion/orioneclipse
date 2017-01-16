"use strict";

var moduleName = __filename;


var config = require('config');
var logger = require('helper/Logger.js')(moduleName);
var localCache = require('service/cache').local;
var SearchDao = require('dao/search/SearchDao.js');

var messages = config.messages;
var responseCodes = config.responseCodes;

var searchDao = new SearchDao();

var SearchService =  function() {};

SearchService.prototype.addSearchModule = function (data, cb) {
	logger.info("Add search module service request started (addSearchModule())");
	searchDao.addSearchModule(data,function(err,result){
		if(err){
			logger.error("Error in add search module (addSearchModule())");
			return cb(err,responseCodes.INTERNAL_SERVER_ERROR);
		}
		return cb(null,responseCodes.SUCCESS,{message:messages.searchModuleAdded});
	});
}

SearchService.prototype.addSearchPage = function (data, cb) {
	logger.info("Add search page service request started (addSearchPage())");
	searchDao.addSearchPage(data,function(err,result){
		if(err){
			logger.error("Error in add search page (addSearchPage())");
			return cb(err,responseCodes.INTERNAL_SERVER_ERROR);
		}
		return cb(null,responseCodes.SUCCESS,{message:messages.searchPageAdded});
	});
}

SearchService.prototype.getSearchModule = function (data, cb) {
	logger.info("Get search module service request started (getSearchModule())");
	searchDao.getSearchModule(data,function(err,result){
		if(err){
			logger.error("Error in get search module (getSearchModule())");
			return cb(err,responseCodes.INTERNAL_SERVER_ERROR);
		}
		return cb(null,responseCodes.SUCCESS,result);
	});
}

SearchService.prototype.getSearchPage = function (data, cb) {
	logger.info("Get search page service request started (getSearchPage())");
	searchDao.getSearchPage(data,function(err,result){
		if(err){
			logger.error("Error in get search page (getSearchPage())");
			return cb(err,responseCodes.INTERNAL_SERVER_ERROR);
		}
		return cb(null,responseCodes.SUCCESS,result);
	});
}

module.exports = SearchService;