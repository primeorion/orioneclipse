"use strict";

var moduleName = __filename;

var _ = require("lodash");
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');
var PortfolioDao = function () { }

var tableNames = [
                  'account', //0
                  ];

PortfolioDao.prototype.getAllSleeveAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = [];

    var modelId = data.search;

    query.push(' SELECT a.id, a.name, a.accountId AS accountId, a.accountNumber AS accountNumber, a.portfolioId, a.isDeleted, a.createdDate as createdOn, a.editedDate as editedOn ');
	query.push(' , usc.userLoginId as createdBy, used.userLoginId as editedBy FROM account AS a ');
	query.push(' INNER JOIN portfolio AS p ON a.portfolioId = p.id AND p.isSleevePortfolio = 1 ');
	query.push(' INNER JOIN user AS usc ON a.createdBy = usc.id ');
	query.push(' INNER JOIN user AS used ON a.editedBy = used.id ');
	query.push(' WHERE a.isDeleted = 0 ');
	
	if(data.search){		
		query.push(' AND ');
		query.push(' p.name LIKE "%'+data.search+'%" OR a.accountId = ? OR a.accountNumber = ? ');
	}
	
	
    query = query.join("");
    logger.debug("Query: " + query);
    
    var queryString = connection.query(query, [modelId, modelId, modelId], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

PortfolioDao.prototype.getAllSleeveAccountsForModel = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = [];

    var modelId = data.id;

    query.push(' SELECT a.id, a.name, a.accountId AS accountId, a.accountNumber AS accountNumber ');
	query.push(' ,a.portfolioId, a.modelId as modelId, a.substitutedModelId as substitutedModelId FROM account AS a ');
	query.push(' INNER JOIN portfolio AS p ON a.portfolioId = p.id AND p.isSleevePortfolio = 1 ');
	query.push(' WHERE a.modelId = ? ');
	
    query = query.join("");
    logger.debug("Query: " + query);
    
    connection.query(query, [modelId], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

PortfolioDao.prototype.unassignSubstitutedModelToSleevedAccount = function (data, cb) {

	   var self = this;
	   var connection = baseDao.getConnection(data);

	   var sleevedAccountId = data.substitutedModelId;
	   
	   var modelEntity = {
			   substitutedModelId : null,
			   editedBy : data.editedBy,
			   editedDate : data.editedDate
	   };
	   var modelQuery = [];
	   modelQuery.push(" UPDATE " + tableNames[0] + " SET ? where substitutedModelId = ? ");

	   modelQuery = modelQuery.join("");
	   
	   logger.debug(modelQuery);

	   var queryString = connection.query(modelQuery,[modelEntity, sleevedAccountId], function(err, data){
	       cb(err, data);
	   });   
	   
	};

PortfolioDao.prototype.assignModelToSleevedAccount = function (data, cb) {

   var self = this;
   var connection = baseDao.getConnection(data);

   var sleevedAccountId = data.id;
   
   var modelEntity = {
		   modelId : data.modelId,
		   substitutedModelId : data.substitutedModelId,
		   editedBy : data.editedBy,
		   editedDate : data.editedDate
   };
   var modelQuery = [];
   modelQuery.push(" UPDATE " + tableNames[0] + " SET ? where id = ? ");

   modelQuery = modelQuery.join("");
   
   logger.debug(modelQuery);

   var queryString = connection.query(modelQuery,[modelEntity, sleevedAccountId], function(err, data){
       cb(err, data);
   });   
   
};

PortfolioDao.prototype.deleteModelToPortfolio = function (data, cb) {

	   var self = this;
	   var connection = baseDao.getConnection(data);

	   var portfolioId = data.id;
	   var modelId = data.modelId;
	   
	   var modelEntity = {
			   modelId : null,
			   substitutedModelId : null,
			   editedBy : data.editedBy,
			   editedDate : data.editedDate
	   };
	   
	   var modelQuery = [];
	   modelQuery.push(" UPDATE " + tableNames[0] + " SET ? where id = ? AND modelId = ? ");

	   modelQuery = modelQuery.join("");
	   
	   logger.debug(modelQuery);

	   connection.query(modelQuery,[modelEntity, portfolioId, modelId], function(err, data){
	       cb(err, data);
	   });   
	   
	};

PortfolioDao.prototype.assignModelToPortfolioTemp = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);
	   
	var modelEntity = {
	   portfolioId : data.portfolioId,
	   modelId : data.modelId,
	   isDeleted : 0,
	   substitutedModelId : data.substitutedModelId,
	   editedBy : data.editedBy,
	   editedDate : data.editedDate
	};
	   
	var self = this;
	var connection = baseDao.getConnection(data);
	
	var modelEntity = _.omit(data, ["reqId"]);
	 
	var modelQuery = [];
	modelQuery.push(" INSERT INTO " + tableNames[1] + " SET ? ");
	modelQuery.push(" ON DUPLICATE KEY UPDATE ? ");
	
	modelQuery = modelQuery.join("");
	 
	logger.debug(modelQuery);
	
	connection.query(modelQuery,[modelEntity, modelEntity], function(err, data){
	     cb(err, data);
	});

};

PortfolioDao.prototype.deleteModelToPortfolioTemp = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);
	   
	var modelEntity = {
	   portfolioId : data.portfolioId,
	   modelId : data.modelId,
	   isDeleted : 1,
	   createdBy : data.editedBy,
	   createdDate : data.editedDate
	};
	 
	var modelQuery = [];
	modelQuery.push(" INSERT INTO " + tableNames[1] + " SET ? ");
	modelQuery.push(" ON DUPLICATE KEY UPDATE ? ");
	
	modelQuery = modelQuery.join("");
	logger.debug(modelQuery);
	
	connection.query(modelQuery,[modelEntity, modelEntity], function(err, data){
	     cb(err, data);
	});

};

PortfolioDao.prototype.getTempModelSubstitutedForPortfolio = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);
	
	var portfolioId = data.portfolioId;
	   
	var self = this;
	var connection = baseDao.getConnection(data);
	
	var modelEntity = _.omit(data, ["reqId"]);
	 
	var modelQuery = [];
	modelQuery.push(" SELECT * FROM " + tableNames[1] + " WHERE portfolioId = ? ");
	
	modelQuery = modelQuery.join("");
	 
	logger.debug(modelQuery);
	
	connection.query(modelQuery,[portfolioId, modelEntity], function(err, rs){
	     cb(err, rs);
	});

};


module.exports = PortfolioDao;