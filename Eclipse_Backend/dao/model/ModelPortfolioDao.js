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
	'portfolio', //0
	'tempModelPortfolio' //1
];

PortfolioDao.prototype.getPortfoliosForModel = function (data, cb) {
	var connection = baseDao.getConnection(data);

	var query = [];

	var modelId = data.id;

	query.push(' SELECT p.id, p.name, p.substitutedModelId , "APPROVED" as status');
	query.push(' FROM portfolio as p ');
	query.push(' where p.modelId = ? or p.substitutedModelId = ? ');
	query.push(' AND p.isDeleted = 0 ');
	query.push(" UNION ")
	query.push(' SELECT tmp.portfolioId as id, p.name as name, tmp.substitutedModelId , "PENDING" as status');
	query.push(' FROM tempModelPortfolio as tmp INNER JOIN portfolio as p ON p.id = tmp.portfolioId ');
	query.push(' where (tmp.modelId = ? or tmp.substitutedModelId = ?) AND tmp.isDeleted = 0 AND p.isDeleted = 0 ');

	query = query.join("");
	logger.debug("Query: " + query);
	var queryString = connection.query(query, [modelId, modelId, modelId, modelId], function (err, data) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		return cb(null, data);
	});
};

PortfolioDao.prototype.getAllModelPortfolios = function (data, cb) {
	var connection = baseDao.getConnection(data);

	var query = [];

	var arr = [];
	var limitedAccess = data.portfolioLimitedAccess;
	var allAccess = data.portfolioAllAccess;
	var roleTypeId = data.user.roleTypeId;

	var modelId = data.id;
	var portfolioId = data.portfolioId;
	
	query.push(' SELECT p.id as portfolioId, p.name as portfolioName, tmp.createdBy as requesterUserId, u.userLoginId as requesterUser, tmp.createdDate as createdOn ');
	query.push(' ,tmp.modelId as newModelId, m.name as newModelName, p.modelId as oldModelId, tmpm.name as oldModelName ');
	query.push(' FROM tempModelPortfolio as tmp ');
	query.push(' INNER JOIN portfolio as p ON p.id = tmp.portfolioId AND p.isDeleted = 0 ');
	query.push(' INNER JOIN model as m ON tmp.modelId = m.id AND m.isDeleted = 0 ');
	query.push(' LEFT JOIN model as tmpm ON p.modelId = tmpm.id AND tmpm.isDeleted = 0 ');
	query.push(' LEFT JOIN user as u on tmp.createdBy = u.id ')

//	if (roleTypeId !== enums.roleType.FIRMADMIN) {
//		if (allAccess && allAccess.length === 0 && limitedAccess && limitedAccess.length > 0) {
//			arr = limitedAccess;
//			query.push(' INNER JOIN teamPortfolioAccess AS tpa ON tmp.portfolioId = tpa.portfolioId AND tpa.teamId IN (?) AND tpa.isDeleted = 0 ');
//		}
//	}

	query.push(' WHERE tmp.modelId = ? ')
	query.push(' AND tmp.isDeleted = 0 ');
	
	if(data.portfolioId){
		query.push(' AND tmp.portfolioId = ? ');
	}
	
	query = query.join("");

	logger.debug("Query: " + query);
	connection.query(query, [modelId, portfolioId], function (err, data) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		return cb(null, data);
	});
};

PortfolioDao.prototype.assignModelToPortfolio = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);

	var portfolioId = data.id;

	var modelEntity = {
		modelId: data.modelId,
		substitutedModelId: data.substitutedModelId,
		editedBy: data.editedBy,
		editedDate: data.editedDate
	};
	var modelQuery = [];
	modelQuery.push(" UPDATE " + tableNames[0] + " SET ? where id = ? ");

	modelQuery = modelQuery.join("");

	logger.debug(modelQuery);

	connection.query(modelQuery, [modelEntity, portfolioId], function (err, data) {
		cb(err, data);
	});

};

PortfolioDao.prototype.unassignModelToPortfolio = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);

	var portfolioId = data.substitutedModelId;

	var modelEntity = {
		substitutedModelId: null,
		editedBy: data.editedBy,
		editedDate: data.editedDate
	};
	var modelQuery = [];
	modelQuery.push(" UPDATE " + tableNames[0] + " SET ? where substitutedModelId = ? ");

	modelQuery = modelQuery.join("");

	logger.debug(modelQuery);

	connection.query(modelQuery, [modelEntity, portfolioId], function (err, data) {
		cb(err, data);
	});

};

PortfolioDao.prototype.deleteModelToPortfolio = function (data, cb) {

	   var self = this;
	   var connection = baseDao.getConnection(data);

	   var portfolioId = data.id;
	   var modelId = data.modelId;

	   var modelEntity = {
		modelId: null,
		substitutedModelId: null,
		editedBy: data.editedBy,
		editedDate: data.editedDate
	   };

	   var modelQuery = [];
	   modelQuery.push(" UPDATE " + tableNames[0] + " SET ? where id = ? AND modelId = ? ");

	   modelQuery = modelQuery.join("");

	   logger.debug(modelQuery);

	   connection.query(modelQuery, [modelEntity, portfolioId, modelId], function (err, data) {
		cb(err, data);
	   });

};

PortfolioDao.prototype.unassignModelToPortfolioTemp = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);

	var substitutedModelId = data.substitutedModelId;
	
	var modelEntity = {
		isDeleted: 0,
		substitutedModelId: null,
		editedBy: data.editedBy,
		editedDate: data.editedDate
	};

	var self = this;
	var connection = baseDao.getConnection(data);

	var modelEntity = _.omit(data, ["reqId"]);

	var modelQuery = [];
	modelQuery.push(" UPDATE " + tableNames[1] + " SET ? WHERE substitutedModelId = ? ");

	modelQuery = modelQuery.join("");

	logger.debug(modelQuery);

	connection.query(modelQuery, [modelEntity, substitutedModelId], function (err, data) {
		cb(err, data);
	});

};

PortfolioDao.prototype.assignModelToPortfolioTemp = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);

	var modelEntity = {
		portfolioId: data.portfolioId,
		modelId: data.modelId,
		isDeleted: 0,
		substitutedModelId: data.substitutedModelId,
		editedBy: data.editedBy,
		editedDate: data.editedDate
	};

	var self = this;
	var connection = baseDao.getConnection(data);

	var modelEntity = _.omit(data, ["reqId"]);

	var modelQuery = [];
	modelQuery.push(" INSERT INTO " + tableNames[1] + " SET ? ");
	modelQuery.push(" ON DUPLICATE KEY UPDATE ? ");

	modelQuery = modelQuery.join("");

	logger.debug(modelQuery);

	connection.query(modelQuery, [modelEntity, modelEntity], function (err, data) {
		cb(err, data);
	});

};

PortfolioDao.prototype.deleteModelToPortfolioTemp = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);

	var modelEntity = {
		portfolioId: data.portfolioId,
		modelId: data.modelId,
		isDeleted: 1,
		createdBy: data.editedBy,
		createdDate: data.editedDate
	};

	var modelQuery = [];
	modelQuery.push(" INSERT INTO " + tableNames[1] + " SET ? ");
	modelQuery.push(" ON DUPLICATE KEY UPDATE ? ");

	modelQuery = modelQuery.join("");
	logger.debug(modelQuery);

	connection.query(modelQuery, [modelEntity, modelEntity], function (err, data) {
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
	modelQuery.push(" SELECT * FROM " + tableNames[1] + " WHERE portfolioId = ? AND isDeleted = 0 ");

	modelQuery = modelQuery.join("");

	logger.debug(modelQuery);

	connection.query(modelQuery, [portfolioId, modelEntity], function (err, rs) {
		cb(err, rs);
	});

};

// Get Portfolios For Model Account Count
PortfolioDao.prototype.getPortfoliosForModelAccountCount = function (data, cb) {
	var connection = baseDao.getConnection(data);

	var query = [];

	var modelId = data.id;
	query.push(' SELECT p.id, p.name, p.substitutedModelId , "APPROVED" as status ');
	query.push(' , COUNT(account.id) AS "accountCount"  ');
	query.push(' FROM portfolio as p ');
	query.push(' LEFT JOIN account ON (account.portfolioId = p.id) ');
	query.push(' where p.modelId = ? or p.substitutedModelId = ? ');
	query.push(' AND p.isDeleted = 0 ');
	query.push(' GROUP BY p.id ');
	query.push(" UNION ")
	query.push(' SELECT tmp.portfolioId as id, p.name as name, tmp.substitutedModelId , "PENDING" as status');
	query.push(' , COUNT(account.id) AS "accountCount" ');
	query.push(' FROM tempModelPortfolio as tmp INNER JOIN portfolio as p ON p.id = tmp.portfolioId ');
	query.push(' LEFT JOIN account ON (account.portfolioId = p.id)  ');

	query.push(' where (tmp.modelId = ? or tmp.substitutedModelId = ?) AND tmp.isDeleted = 0 AND p.isDeleted = 0 ');
	query.push(' GROUP BY p.id ');

	query = query.join("");
	logger.debug("Query: " + query);
	connection.query(query, [modelId, modelId, modelId, modelId], function (err, data) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		return cb(null, data);
	});
}
module.exports = PortfolioDao;