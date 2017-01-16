"use strict";

var moduleName = __filename;
var config = require("config");

var squel = require("squel");
var _ = require("lodash");
var util = require('util');
var utilService = new (require('service/util/UtilService'))();
var localCache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao');
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var squelUtils = require("service/util/SquelUtils.js");
var CategoryCoverter = require('converter/security/CategoryConverter.js');
var ClassCoverter = require('converter/security/ClassConverter.js');
var SubClassCoverter = require('converter/security/SubClassConverter.js');
var SecurityConverter = require('converter/security/SecurityConverter.js');

var SecurityEntity = require('entity/security/Security.js');
var CategoryEntity = require('entity/security/Category.js');
var ClassEntity = require('entity/security/Class.js');
var SubClassEntity = require('entity/security/SubClass.js');
var CustodianEntity = require('entity/custodian/Custodian.js');
var SecurityStatusEntity = require('entity/security/SecurityStatus.js');
var SecurityPriceEntity = require('entity/security/SecurityPrice.js');
var SecurityTypeEntity = require('entity/security/SecurityType1.js');
var CustodianSecuritySymbolEntity = require('entity/custodian/CustodianSecuritySymbol.js');
var UserEntity = require("entity/user/User.js");
var CorporateActionTypeEntity = require("entity/security/CorporateActionType.js");
var SecurityCorporateActionEntity = require("entity/security/SecurityCorporateAction.js");

var SecurityDao = function () {

}

SecurityDao.prototype.getSecuritiesList = function (data, cb) {

	var connection = baseDao.getConnection(data);
	var securityId = data.id;

	var securityStatus = data.statusId;
	var securityQuery = squel.select()
		.field(SecurityEntity.columns.id, 'id').field(SecurityEntity.columns.orionConnectExternalId, 'orionConnectExternalId')
		.field(SecurityEntity.columns.name, 'name').field(SecurityEntity.columns.symbol, 'symbol')
		.field(SecurityEntity.columns.securityTypeId, 'securityTypeId').field(SecurityTypeEntity.columns.name, 'securityType')
		.field(SecurityPriceEntity.columns.price, 'price').field(SecurityEntity.columns.statusId, 'statusId')
		.field(SecurityStatusEntity.columns.status, 'status').field(SecurityEntity.columns.isDeleted, 'isDeleted')
		.field(SecurityEntity.columns.assetCategoryId, 'assetCategoryId').field(CategoryEntity.columns.name, 'assetCategory')
		.field(SecurityEntity.columns.assetClassId, 'assetClassId').field(ClassEntity.columns.name, 'assetClass')
		.field(SecurityEntity.columns.assetSubClassId, 'assetSubClassId').field(SubClassEntity.columns.name, 'assetSubClass')
		.field(SecurityEntity.columns.custodialCash, 'custodialCash').field(SecurityEntity.columns.createdDate, 'createdOn')
		.field(SecurityEntity.columns.editedDate, 'editedOn')
		.field(UserEntity.usCreated.userLoginId, 'createdBy').field(UserEntity.usEdited.userLoginId, 'editedBy')
		.from(SecurityEntity.tableName)
		.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(SecurityEntity.columns.createdBy, UserEntity.usCreated.id))
								.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(SecurityEntity.columns.editedBy, UserEntity.usEdited.id))
								.join(SecurityStatusEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.statusId, SecurityStatusEntity.columns.id))
								.left_join(CategoryEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.assetCategoryId, CategoryEntity.columns.id))
								.left_join(ClassEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.assetClassId, ClassEntity.columns.id))
								.left_join(SubClassEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.assetSubClassId, SubClassEntity.columns.id))
								.left_join(SecurityTypeEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.securityTypeId, SecurityTypeEntity.columns.id))
								.left_join(SecurityPriceEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.id, SecurityPriceEntity.columns.securityId))
								.join(
		squel.select()
												.field('MAX(' + SecurityPriceEntity.columns.priceDateTime + ')', 'time')
												.field(SecurityPriceEntity.columns.securityId, 'securityId')
												.from(SecurityPriceEntity.tableName)
												.group(SecurityPriceEntity.columns.securityId),
		'maxt',
		squel.expr().and(squelUtils.joinEql(SecurityPriceEntity.columns.securityId, 'maxt.securityId'))
			.and(squelUtils.joinEql(SecurityPriceEntity.columns.priceDateTime, 'maxt.time'))
//			.or(SecurityPriceEntity.columns.securityId + " IS NULL ")
//			.or(SecurityPriceEntity.columns.priceDateTime + " IS NULL ")
		)
								.where(squelUtils.eql(SecurityEntity.columns.isDeleted, 0));

	if (securityStatus) {
		securityQuery.where(squelUtils.in(SecurityEntity.columns.statusId, securityStatus));
	}

	var secondaryQuery = null;
	secondaryQuery = squel.expr();

	if (data.search) {

		if (data.search.match(/^[0-9]+$/g)) {
			secondaryQuery = secondaryQuery.and(squelUtils.eql(SecurityEntity.columns.id, data.search));
		}

		secondaryQuery = secondaryQuery.or(squelUtils.like(SecurityEntity.columns.name, data.search, connection));
		secondaryQuery = secondaryQuery.or(squelUtils.like(SecurityEntity.columns.symbol, data.search, connection));
	}
	securityQuery = securityQuery.where(
		secondaryQuery
	)

	logger.debug(securityQuery.toString());
	if (data.assetClassId) {
		securityQuery = securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetClassId, data.assetClassId));
	}

	if (data.assetSubClassId) {
		securityQuery = securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetSubClassId, data.assetSubClassId));
	}

	if (data.assetCategoryId) {
		securityQuery = securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetCategoryId, data.assetCategoryId));
	}

	securityQuery = securityQuery
		.group(SecurityEntity.columns.id)

	if (data.search) {
		securityQuery.order(SecurityEntity.columns.name);
	}

	securityQuery = securityQuery.toString()
	var queryString = connection.query(securityQuery, function (err, data) {
		cb(err, data);
	});
};

SecurityDao.prototype.getDetailedSecurity = function (reqData, cb) {

	var connection = baseDao.getConnection(reqData);

	var securityEntity = SecurityConverter.securityModelToSecurityEntity(reqData);

	var securityId = securityEntity[SecurityEntity.columns.id];
	var orionConnectExternalId = securityEntity[SecurityEntity.columns.orionConnectExternalId];

	var symbol = securityEntity[SecurityEntity.columns.symbol];

	var securityQuery = squel.select()
		.field(SecurityEntity.columns.id, 'id').field(SecurityEntity.columns.orionConnectExternalId, 'orionConnectExternalId')
		.field(SecurityEntity.columns.symbol, 'symbol')
		.field(SecurityPriceEntity.columns.price, 'price')
		.field(SecurityEntity.columns.securityTypeId, 'securityTypeId')
		.from(SecurityEntity.tableName)
		.left_join(SecurityPriceEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.id, SecurityPriceEntity.columns.securityId))
								.join(
		squel.select()
												.field('MAX(' + SecurityPriceEntity.columns.priceDateTime + ')', 'time')
												.field(SecurityPriceEntity.columns.securityId, 'securityId')
												.from(SecurityPriceEntity.tableName)
												.group(SecurityPriceEntity.columns.securityId),
		'maxt',
		squel.expr().and(squelUtils.joinEql(SecurityPriceEntity.columns.securityId, 'maxt.securityId'))
			.and(squelUtils.joinEql(SecurityPriceEntity.columns.priceDateTime, 'maxt.time'))
			.or(SecurityPriceEntity.columns.securityId + " IS NULL ")
			.or(SecurityPriceEntity.columns.priceDateTime + " IS NULL ")
		)
		.where(squelUtils.eql(SecurityEntity.columns.isDeleted, 0))
		.group(SecurityEntity.columns.id)

	var secondaryQuery = squel.expr();

	if (securityId) {
		secondaryQuery = secondaryQuery.and(squelUtils.eql(SecurityEntity.columns.id, securityId));
	} else if (orionConnectExternalId) {
		securityId = orionConnectExternalId;
		secondaryQuery = secondaryQuery.and(squelUtils.eql(SecurityEntity.columns.orionConnectExternalId, securityId));
	}
	if (symbol) {
		secondaryQuery = secondaryQuery.or(squelUtils.eql(SecurityEntity.columns.symbol, symbol));
	}

	securityQuery = securityQuery.where(secondaryQuery).toString();

	logger.debug(securityQuery);

	var queryString = connection.query(securityQuery, [securityId, symbol], function (err, data) {
		cb(err, data);
	});

};

SecurityDao.prototype.getSecurityBySecuritySymbol = function (reqData, cb) {

	var connection = baseDao.getConnection(reqData);
	var securityEntity = SecurityConverter.securityModelToSecurityEntity(reqData);
	var symbol = securityEntity[SecurityEntity.columns.symbol];

	var securityQuery = squel.select()
		.field(SecurityEntity.columns.id, 'id').field(SecurityEntity.columns.orionConnectExternalId, 'orionConnectExternalId')
		.field(SecurityEntity.columns.symbol, 'symbol')
		.from(SecurityEntity.tableName)
		.where(squelUtils.eql(SecurityEntity.columns.isDeleted, 0))
		.where(squelUtils.eql(SecurityEntity.columns.symbol, symbol)).toString();

	logger.debug(securityQuery);

	var queryString = connection.query(securityQuery, function (err, data) {
		cb(err, data);
	});

};

SecurityDao.prototype.getDetailedSecurityById = function (reqData, cb) {

	var connection = baseDao.getConnection(reqData);
	var securityId = reqData.id;

	var securityQuery = squel.select()
		.field(SecurityEntity.columns.id, 'id').field(SecurityEntity.columns.orionConnectExternalId, 'orionConnectExternalId')
		.field(SecurityEntity.columns.name, 'name').field(SecurityEntity.columns.symbol, 'symbol')
		.field(CustodianSecuritySymbolEntity.columns.securitySymbol, 'custodianSecuritySymbol')
		.field(CustodianEntity.columns.id, 'custodianId').field(CustodianEntity.columns.name, 'custodianName').field(CustodianEntity.columns.code, 'custodianCode')
		.field(SecurityEntity.columns.securityTypeId, 'securityTypeId').field(SecurityTypeEntity.columns.name, 'securityType')
		.field(SecurityPriceEntity.columns.price, 'price').field(SecurityEntity.columns.statusId, 'statusId')
		.field(SecurityStatusEntity.columns.status, 'status').field(SecurityEntity.columns.isDeleted, 'isDeleted')
		.field(SecurityEntity.columns.assetCategoryId, 'assetCategoryId').field(CategoryEntity.columns.name, 'assetCategory')
		.field(SecurityEntity.columns.assetClassId, 'assetClassId').field(ClassEntity.columns.name, 'assetClass')
		.field(SecurityEntity.columns.assetSubClassId, 'assetSubClassId').field(SubClassEntity.columns.name, 'assetSubClass')
		.field(SecurityEntity.columns.custodialCash, 'custodialCash').field(SecurityEntity.columns.createdDate, 'createdOn')
		.field(SecurityEntity.columns.editedDate, 'editedOn')
		.field(UserEntity.usCreated.userLoginId, 'createdBy').field(UserEntity.usEdited.userLoginId, 'editedBy')
		.from(SecurityEntity.tableName)
		.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(SecurityEntity.columns.createdBy, UserEntity.usCreated.id))
		.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(SecurityEntity.columns.editedBy, UserEntity.usEdited.id))
		.join(SecurityStatusEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.statusId, SecurityStatusEntity.columns.id))
		.left_join(CategoryEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.assetCategoryId, CategoryEntity.columns.id))
		.left_join(ClassEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.assetClassId, ClassEntity.columns.id))
		.left_join(SubClassEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.assetSubClassId, SubClassEntity.columns.id))
		.left_join(SecurityTypeEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.securityTypeId, SecurityTypeEntity.columns.id))
		.left_join(SecurityPriceEntity.tableName, null, squelUtils.joinEql(SecurityPriceEntity.columns.securityId, securityId))
		.join(
		squel.select()
			.field('MAX(' + SecurityPriceEntity.columns.priceDateTime + ')', 'time')
			.field(SecurityPriceEntity.columns.securityId, 'securityId')
			.from(SecurityPriceEntity.tableName)
			.where(squelUtils.joinEql(SecurityPriceEntity.columns.securityId, securityId)),
		'maxt',
		squel.expr().and(squelUtils.joinEql(SecurityPriceEntity.columns.securityId, 'maxt.securityId'))
			.and(squelUtils.joinEql(SecurityPriceEntity.columns.priceDateTime, 'maxt.time'))
			.or(SecurityPriceEntity.columns.securityId + " IS NULL ")
			.or(SecurityPriceEntity.columns.priceDateTime + " IS NULL ")
		)
		.left_join(CustodianSecuritySymbolEntity.tableName, null, squel.expr().and(squelUtils.joinEql(SecurityEntity.columns.id, CustodianSecuritySymbolEntity.columns.securityId)).and(squelUtils.eql(CustodianSecuritySymbolEntity.columns.isDeleted, 0)))
		.left_join(CustodianEntity.tableName, null, squelUtils.joinEql(CustodianEntity.columns.id, CustodianSecuritySymbolEntity.columns.custodianId))
		.where(squelUtils.eql(SecurityEntity.columns.isDeleted, 0))
		.where(squelUtils.eql(SecurityEntity.columns.id, securityId)).toString();

	logger.debug(securityQuery);

	var queryString = connection.query(securityQuery, [securityId, securityId, securityId], function (err, data) {
		cb(err, data);
	});
};

SecurityDao.prototype.getSecurityPriceById = function (reqData, cb) {

	var connection = baseDao.getConnection(reqData);
	var securityId = reqData.id;

	var securityQuery = squel.select()
		.field(SecurityPriceEntity.columns.priceDateTime, 'priceDate').field(SecurityPriceEntity.columns.price, 'price')
		.from(SecurityEntity.tableName)
		.left_join(SecurityPriceEntity.tableName, null, squel.expr().and(squelUtils.joinEql(SecurityPriceEntity.columns.securityId, securityId))
				.and(squelUtils.joinEql(SecurityPriceEntity.columns.isDeleted, 0)))
		.join(
		squel.select()
			.field('MAX(' + SecurityPriceEntity.columns.priceDateTime + ')', 'time')
			.field(SecurityPriceEntity.columns.securityId, 'securityId')
			.from(SecurityPriceEntity.tableName)
			.where(squelUtils.joinEql(SecurityPriceEntity.columns.securityId, securityId)),
		'maxt',
		squel.expr().and(squelUtils.joinEql(SecurityPriceEntity.columns.securityId, 'maxt.securityId'))
			.and(squelUtils.joinEql(SecurityPriceEntity.columns.priceDateTime, 'maxt.time'))
		)
		.where(squelUtils.eql(SecurityEntity.columns.isDeleted, 0))
		.where(squelUtils.eql(SecurityEntity.columns.id, securityId)).toString();

	logger.debug(securityQuery);

	var queryString = connection.query(securityQuery, [securityId, securityId, securityId], function (err, data) {
		cb(err, data);
	});
};

SecurityDao.prototype.updateSecurityGeneral = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);

	var securityEntity = SecurityConverter.securityModelToSecurityEntity(data);

	var securityId = securityEntity[SecurityEntity.columns.id];
	var security = {};

	security[SecurityEntity.columns.symbol] = securityEntity[SecurityEntity.columns.symbol];
	security[SecurityEntity.columns.securityTypeId] = securityEntity[SecurityEntity.columns.securityTypeId];
	security[SecurityEntity.columns.assetCategoryId] = securityEntity[SecurityEntity.columns.assetCategoryId];
	security[SecurityEntity.columns.assetClassId] = securityEntity[SecurityEntity.columns.assetClassId];
	security[SecurityEntity.columns.assetSubClassId] = securityEntity[SecurityEntity.columns.assetSubClassId];
	security[SecurityEntity.columns.statusId] = securityEntity[SecurityEntity.columns.statusId];
	security[SecurityEntity.columns.custodialCash] = securityEntity[SecurityEntity.columns.custodialCash];
	security[SecurityEntity.columns.editedBy] = securityEntity[SecurityEntity.columns.editedBy];
	security[SecurityEntity.columns.editedDate] = securityEntity[SecurityEntity.columns.editedDate];

	var securityQuery = [];

	securityQuery.push(" UPDATE " + SecurityEntity.tableName + " SET ? where " + SecurityEntity.columns.id + " = ? AND " + SecurityEntity.columns.isDeleted + " = 0 ");

	securityQuery = securityQuery.join("");
	logger.debug(securityQuery);

	connection.query(securityQuery, [security, securityId], function (err, data) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		cb(err, data);
	});
};

SecurityDao.prototype.createSecurityGeneral = function (security, cb) {

	var self = this;
	var connection = baseDao.getConnection(security);

	var securityEntity = SecurityConverter.securityModelToSecurityEntity(security);

	var securityQuery = [];

	securityQuery.push(" INSERT INTO " + SecurityEntity.tableName + " SET ? ");
	securityQuery.push(" ON DUPLICATE KEY UPDATE name=VALUES(name), symbol=VALUES(symbol), securityTypeId = VALUES(securityTypeId), isDeleted=VALUES(isDeleted), createdDate=VALUES(createdDate), editedDate=VALUES(editedDate) ");
	securityQuery.push(" ,createdBy=VALUES(createdBy), editedBy=VALUES(editedBy) ");
	securityQuery = securityQuery.join("");

	logger.debug(securityQuery);
	connection.query(securityQuery, [securityEntity, securityEntity], function (err, data) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		cb(err, data);
	});
};

SecurityDao.prototype.deleteSecurity = function (security, cb) {

		  var self = this;
	var connection = baseDao.getConnection(security);

	var securityEntity = SecurityConverter.securityModelToSecurityEntity(security);

	var securityId = securityEntity[SecurityEntity.columns.id];

	var security = {};
	security[SecurityEntity.columns.isDeleted] = 1;
	security[SecurityEntity.columns.statusId] = securityEntity[SecurityEntity.columns.statusId];
	security[SecurityEntity.columns.editedBy] = securityEntity[SecurityEntity.columns.editedBy];
	security[SecurityEntity.columns.editedDate] = securityEntity[SecurityEntity.columns.editedDate];

	var securityQuery = [];

	securityQuery.push(" UPDATE " + SecurityEntity.tableName + " SET ? where " + SecurityEntity.columns.id + " = ? AND " + SecurityEntity.columns.isDeleted + " = 0 ");

	securityQuery = securityQuery.join("");

	logger.debug(securityQuery);

	var query = connection.query(securityQuery, [security, securityId], function (err, data) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		cb(err, data);
	});
};

SecurityDao.prototype.insertSecurityPrice = function (securityPrice, cb) {

	var self = this;
	var connection = baseDao.getConnection(securityPrice);

	var securityPriceEntity = SecurityConverter.securityModelToSecurityPriceEntity(securityPrice);

	var securityId = securityPriceEntity[SecurityPriceEntity.columns.securityId];

	var securityQuery = [];

	securityQuery.push(" INSERT INTO " + SecurityPriceEntity.tableName + " SET ? ");
	securityQuery.push(" ON DUPLICATE KEY UPDATE isDeleted=VALUES(isDeleted), priceDateTime=VALUES(priceDateTime), price=VALUES(price), editedDate=VALUES(editedBy), editedDate=VALUES(editedDate) ");

	securityQuery = securityQuery.join("");

	logger.debug(securityQuery);
	connection.query(securityQuery, [securityPriceEntity], function (err, data) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		cb(err, data);
	});

};
SecurityDao.prototype.updateSecurityPrice = function (data, cb) {
    logger.debug("Insert or Update Security Price");

    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime(null);
    
    var queryData = {};
    queryData[SecurityPriceEntity.columns.price] = data.price;
    queryData[SecurityPriceEntity.columns.isDeleted] = data.isDeleted | 0;
    queryData[SecurityPriceEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[SecurityPriceEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[SecurityPriceEntity.columns.createdDate] = currentDate;
    queryData[SecurityPriceEntity.columns.editedDate] = currentDate;
    
    var query = [];
    query.push(" UPDATE "+SecurityPriceEntity.tableName +" ");
    query.push(" SET ? ");
    query.push(" WHERE "+SecurityPriceEntity.columns.id+" = ? ");
    query = query.join("");
    
    logger.debug('Update security prices Query' + query);
    connection.query(query, [queryData, data.id], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

SecurityDao.prototype.deleteSecurityPrice = function (data, cb) {

	var self = this;
	var connection = baseDao.getConnection(data);

	var securityPriceEntity = SecurityConverter.securityModelToSecurityPriceEntity(data);

	var securityId = securityPriceEntity[SecurityPriceEntity.columns.securityId];

	var securityPrice = {};

	securityPrice[SecurityPriceEntity.columns.isDeleted] = 1;
	securityPrice[SecurityPriceEntity.columns.editedBy] = securityPriceEntity[SecurityPriceEntity.columns.editedBy];
	securityPrice[SecurityPriceEntity.columns.editedDate] = securityPriceEntity[SecurityPriceEntity.columns.editedDate];

	var securityQuery = [];

	securityQuery.push(" UPDATE " + SecurityPriceEntity.tableName + " SET ? WHERE " + SecurityPriceEntity.columns.securityId + " = ? AND " + SecurityPriceEntity.columns.isDeleted + " = 0 ");

	securityQuery = securityQuery.join("");

	logger.debug(securityQuery);
	connection.query(securityQuery, [securityPrice, securityId], function (err, data) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		cb(err, data);
	});

};

SecurityDao.prototype.checkSecurityForAssetClass = function (data, cb, type) {

	var self = this;
	var connection = baseDao.getConnection(data);
	var status = false;

	var securityQuery = squel.select()
		.field(SecurityEntity.columns.id, 'id')
		.from(SecurityEntity.tableName);

	var securityEntityByClass = ClassCoverter.classModelToSecurityEntity(data);
	var securityEntityByCategory = CategoryCoverter.categoryModelToSecurityEntity(data);
	var securityEntityBySubClass = SubClassCoverter.subClassModelToSecurityEntity(data);

	var categoryId = null;
	var classId = null;
	var subClassId = null;

	if (type == 1) {
		categoryId = securityEntityByCategory[SecurityEntity.columns.assetCategoryId];
	}
	if (type == 2) {
		classId = securityEntityByClass[SecurityEntity.columns.assetClassId];
	}
	if (type == 3) {
		subClassId = securityEntityBySubClass[SecurityEntity.columns.assetSubClassId];
	}

	securityQuery = securityQuery.where(squelUtils.eql(SecurityEntity.columns.isDeleted, 0));

	if (categoryId) {
		securityQuery = securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetCategoryId, categoryId));
	}

	if (classId) {
		securityQuery = securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetClassId, classId));
	}

	if (subClassId) {
		securityQuery = securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetSubClassId, subClassId));
	}

	securityQuery = securityQuery.toString();

	logger.debug(securityQuery);
	connection.query(securityQuery, function (err, rs) {
		if (err) {
			return cb(err);
		}
		if (rs && rs.length > 0) {
			return cb(null, false);
		} else {
			return cb(null, true);
		}

	});

};

SecurityDao.prototype.getLatestSecurityPrice = function (data, cb) {
	  var connection = baseDao.getConnection(data);

	  var securityId = data.securityId;

	  var query = "SELECT getLatestPriceForSecurity(" + securityId + " ) AS price ";

	  logger.debug(query);

	  var queryString = connection.query(query, function (err, rs) {
		  cb(err, rs);
	  });
}


SecurityDao.prototype.checkForSecurityStatus = function (data, cb) {

		  var connection = baseDao.getConnection(data);

		  var securityIds = data.securityIds;

		  var query = squel.select()
								.field(SecurityEntity.columns.id)
								.field(SecurityEntity.columns.statusId, 'status')
								.field(SecurityEntity.columns.isDeleted, 'isDeleted')
								.from(SecurityEntity.tableName)
								.where(squelUtils.in(SecurityEntity.columns.id, securityIds)).toString();

		  logger.debug(query);

		  var queryString = connection.query(query, [securityIds], function (err, rs) {
		cb(err, rs);
		  });

}

SecurityDao.prototype.getCorporateActionByInternalId = function (data, cb) {

	  var connection = baseDao.getConnection(data);

	  var id = data.id;

	  var query = squel.select()
							.field(SecurityCorporateActionEntity.columns.id)
							.field(SecurityCorporateActionEntity.columns.corporateActionTypeId, 'corporateActionTypeId')
							.field(CorporateActionTypeEntity.columns.name, 'corporateActionTypeName')
							.field(CorporateActionTypeEntity.columns.code, 'corporateActionTypeCode')
							.field(SecurityCorporateActionEntity.columns.to, 'to')
							.field(SecurityCorporateActionEntity.columns.from, 'from')
							.field(SecurityCorporateActionEntity.columns.securityId, 'securityId')
							.field(SecurityCorporateActionEntity.columns.spinOfSecurityId, 'spinOfSecurityId')
							.field(SecurityCorporateActionEntity.columns.isDeleted, 'isDeleted')
							.field(SecurityCorporateActionEntity.columns.createdDate, 'createdOn')
							.field(SecurityCorporateActionEntity.columns.createdBy, 'createdBy')
							.field(SecurityCorporateActionEntity.columns.editedDate, 'editedOn')
							.field(SecurityCorporateActionEntity.columns.editedBy, 'editedBy')
							.from(SecurityCorporateActionEntity.tableName)
							.join(CorporateActionTypeEntity.tableName, null, squelUtils.joinEql(SecurityCorporateActionEntity.columns.corporateActionTypeId, CorporateActionTypeEntity.columns.id))
							.where(squelUtils.eql(SecurityCorporateActionEntity.columns.id, id))
							.toString();

	  logger.debug(query);

	  var queryString = connection.query(query, function (err, rs) {
		  cb(err, rs);
	  });

}

SecurityDao.prototype.getCorporateActionForSecurity = function (data, cb) {

	  var connection = baseDao.getConnection(data);

	  var securityId = data.id;

	  var query = squel.select()
							.field(SecurityCorporateActionEntity.columns.id)
							.field(SecurityCorporateActionEntity.columns.corporateActionTypeId, 'corporateActionTypeId')
							.field(CorporateActionTypeEntity.columns.name, 'corporateActionTypeName')
							.field(CorporateActionTypeEntity.columns.code, 'corporateActionTypeCode')
							.field(SecurityCorporateActionEntity.columns.to, 'to')
							.field(SecurityCorporateActionEntity.columns.from, 'from')
							.field(SecurityCorporateActionEntity.columns.securityId, 'securityId')
							.field(SecurityCorporateActionEntity.columns.spinOfSecurityId, 'spinOfSecurityId')
							.field(SecurityCorporateActionEntity.columns.isDeleted, 'isDeleted')
							.field(SecurityCorporateActionEntity.columns.createdDate, 'createdOn')
							.field(SecurityCorporateActionEntity.columns.createdBy, 'createdBy')
							.field(SecurityCorporateActionEntity.columns.editedDate, 'editedOn')
							.field(SecurityCorporateActionEntity.columns.editedBy, 'editedBy')
							.from(SecurityCorporateActionEntity.tableName)
							.join(CorporateActionTypeEntity.tableName, null, squelUtils.joinEql(SecurityCorporateActionEntity.columns.corporateActionTypeId, CorporateActionTypeEntity.columns.id))
							.where(squelUtils.in(SecurityCorporateActionEntity.columns.securityId, securityId))
							.toString();

	  logger.debug(query);

	  var queryString = connection.query(query, function (err, rs) {
	cb(err, rs);
	  });

}

SecurityDao.prototype.createCorporateActionForSecurity = function (data, cb) {

	  var connection = baseDao.getConnection(data);

	  var securityId = data.id;
	  
	  var modelEntity = SecurityConverter.getCorporateActionEntity(data);
	  
	  var query = " INSERT INTO " + SecurityCorporateActionEntity.tableName + " SET ? ";

	  logger.debug(query);

	  var queryString = connection.query(query, [modelEntity], function (err, rs) {
		  cb(err, rs);
	  });

}

SecurityDao.prototype.getCorporateActionTypes = function (data, cb) {

	  var connection = baseDao.getConnection(data);

	  var securityIds = data.securityIds;

	  var query = squel.select()
							.field(CorporateActionTypeEntity.columns.id)
							.field(CorporateActionTypeEntity.columns.name, 'name')
							.field(CorporateActionTypeEntity.columns.code, 'code')
							.from(CorporateActionTypeEntity.tableName)

	  logger.debug(query);

	  var queryString = connection.query(query, [securityIds], function (err, rs) {
		  cb(err, rs);
	  });

}
SecurityDao.prototype.getSecurityById = function (data, cb) {
	var connection = baseDao.getConnection(data);

	var query = squel.select()
	.from(SecurityEntity.tableName)
	.where(squelUtils.in(SecurityEntity.columns.id, data.securityId))
	.toString();

	logger.debug("Get security by id Query"+query);
	connection.query(query, function (err, rs) {
		if(err){
			return cb(err);
		}
		return cb(null, rs);
	});
}
/* For Trade tool
   Get security ids		[internally called] */
SecurityDao.prototype.getSecurity = function (data, cb) {
	var connection = baseDao.getConnection(data);
	var result = [];

	var query = ' SELECT securityId FROM `position` WHERE accountId IN ( ';
	if (data.accountId) {
		query = query + data.accountId + ' ';
	} else {
		query = query + ' SELECT id FROM `account` WHERE portfolioId IN ( ';
		if (data.portfolioId) {
			query = query + data.portfolioId + ' ';
		} else {
			query = query + ' SELECT id FROM `portfolio` WHERE modelId IN ( ';
			query = query + data.modelId + ' ) ';
		}
		query = query + ' ) ';
	}

	query = query + ' ) ';
	//  query = query + ' ) AND securityId = ' + data.securityId + ';';

	logger.debug("Query: " + query);
	connection.query(query, function (err, securities) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		securities.forEach(function (security) {
			result.push(security.securityId);
		})
		return cb(null, result);
	});
};

/* For Trade tool
   Get security ids */
SecurityDao.prototype.getSellSecurityList = function (data, cb) {
	var connection = baseDao.getConnection(data);
	var securityIds = data.securityIds;
	var query;
	query = ' SELECT security.id AS "id", security.orionConnectExternalId AS "orionConnectExternalId", ';
	query = query + ' security.name AS "name", security.symbol AS "symbol", security.securityTypeId AS "securityTypeId", ';
	query = query + ' securityType.name AS "securityType", securityPrice.price AS "price", security.statusId AS "statusId", ';
	query = query + ' securityStatus.status AS "status", security.isDeleted AS "isDeleted", security.assetCategoryId AS "assetCategoryId", ';
	query = query + ' assetCategory.name AS "assetCategory", security.assetClassId AS "assetClassId", ';
	query = query + ' assetClass.name AS "assetClass", security.assetSubClassId AS "assetSubClassId", assetSubClass.name AS "assetSubClass", ';
	query = query + ' security.isCustodialCash AS "custodialCash", security.createdDate AS "createdOn", ';
	query = query + ' security.editedDate AS "editedOn", usCreated.userLoginId AS "createdBy", usEdited.userLoginId AS "editedBy" ';
	query = query + ' FROM `security` ';
	query = query + ' INNER JOIN `user` `usCreated` ON (security.createdBy = usCreated.id)  ';
	query = query + ' INNER JOIN `user` `usEdited` ON (security.editedBy = usEdited.id) ';
	query = query + ' INNER JOIN securityStatus ON (security.statusId = securityStatus.id) ';
	query = query + ' LEFT JOIN assetCategory ON (security.assetCategoryId = assetCategory.id) ';
	query = query + ' LEFT JOIN assetClass ON (security.assetClassId = assetClass.id) ';
	query = query + ' LEFT JOIN assetSubClass ON (security.assetSubClassId = assetSubClass.id) ';
	query = query + ' LEFT JOIN securityType ON (security.securityTypeId = securityType.id) ';
	query = query + ' LEFT JOIN securityPrice ON (security.id = securityPrice.securityId) ';
	query = query + ' INNER JOIN ';
	query = query + ' ( ';
	query = query + ' SELECT MAX(securityPrice.priceDateTime) AS "time", securityPrice.securityId AS "securityId" ';
	query = query + ' FROM securityPrice ';
	query = query + ' GROUP BY securityPrice.securityId ';
	query = query + ' ) `maxt` ON  ';
	query = query + ' ( ';
	query = query + ' securityPrice.securityId = maxt.securityId AND  ';
	query = query + ' securityPrice.priceDateTime = maxt.time OR securityPrice.securityId IS NULL  OR securityPrice.priceDateTime IS NULL ';
	query = query + ' )  ';
	query = query + '  WHERE (security.isDeleted = 0) AND  ';
	query = query + ' ( ';
	//  query = query + ' security.name LIKE \'%i%\' OR security.symbol LIKE \'%i%\' ';
	if (data.search) {
		//   query.push(' AND ');
		//   if (data.search.match(/^[0-9]+$/g)) {
		// query.push(' (security.name = "' + data.search + '" OR ');
		// query.push(' security.name LIKE "%' + data.search + '%" ');
		data.search = data.search.replace(/\"/g, "'");
		query = query + ' security.name LIKE "%' + data.search + '%" OR ';

		//  }
		query = query + ' security.symbol LIKE "%' + data.search + '%" ';
		if (data.search.match(/^[0-9]+$/g)) {
			//  query.push(' ) ');
		}
		//  query = query + ' ORDER BY security.name, security.id DESC ';
	}
	// query = query + ' ) AND security.id IN (14637,14614) ';
	query = query + ' ) AND security.id IN ( ';
	securityIds.forEach(function (securityId) {
		query = query + securityId + ',';
		//     result.push(securityId);
	})
	query = query.substr(0, query.length - 1);
	query = query + ' ) ';
	query = query + ' GROUP BY security.id ORDER BY security.name ASC '

	logger.debug("Query: " + query);
	connection.query(query, function (err, result) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		return cb(null, result);
	});
};

SecurityDao.prototype.getSecurityListExcludePortfolioIds = function (data, cb) {
	var connection = baseDao.getConnection(data);
	var result = [];
    var query = ' SELECT   `id` ,`name`  FROM `security` as SE';
    query = query + '  WHERE SE.id NOT IN  ( ';
    query = query + ' 	SELECT  PO.securityId  FROM `position`  as PO';
	query = query + ' LEFT JOIN `user` AS USER ON USER.id = PO.createdBy ';
	query = query + ' LEFT JOIN `user` AS USERS ON USERS.id = PO.editedBy';
	query = query + ' LEFT OUTER JOIN `account` AS ACC ON PO.accountId = ACC.id';
	query = query + '  AND ACC.isDisabled = 0  AND ACC.isDeleted = 0';
	query = query + '  LEFT OUTER JOIN `security` AS SE ON PO.securityId = SE.id';
	query = query + ' WHERE PO.isDeleted = 0  AND ACC.portfolioId IN ( ' + data.excludePortfolioIds + ' )';
    query = query + ' ) AND SE.isDeleted = 0 and SE.statusId=6 ';
	query = query + ' order by SE.name ';

	logger.debug("Query: " + query);
	connection.query(query, function (err, securities) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		securities.forEach(function (security) {
			result.push(security);
		})
		return cb(null, result);
	});
};
SecurityDao.prototype.getSecurityType = function (data, cb) {
	var connection = baseDao.getConnection(data);
	var result = [];
    var query = [];
    query.push(' SELECT s.id ,s.name, st.id as securityTypeId,st.name as securityTypeName ');
    query.push(' from `security` as s ');
    query.push(' INNER JOIN `securityType` as st on st.id=s.securityTypeId ');
    query.push(' WHERE s.id=? ');
    query = query.join("");

	logger.debug("Query to get security type: " + query);
	connection.query(query,[data.id], function (err, result) {
		if (err) {
			logger.error(err);
			return cb(err);
		}
		return cb(null, result);
	});
};

module.exports = new SecurityDao();