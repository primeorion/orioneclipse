"use strict";

var moduleName = __filename;

var squel = require("squel");
var _ = require("lodash");

var config = require('config');
var cache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao');
var baseDao = require('dao/BaseDao');
var logger = require('helper/Logger')(moduleName);
var enums = require('config/constants/ApplicationEnum.js');
var squelUtils = require("service/util/SquelUtils.js");
var utilService = new (require('service/util/UtilService'))();

var UserEntity = require("entity/user/User.js");
var TeamEntity = require("entity/team/Team.js");
var ManagementStyleEntity = require('entity/model/ManagementStyle.js');
var FilterTypeEntity = require('entity/model/FilterTypes.js');
var ModelEntity = require('entity/model/Model1.js');
var TempModelEntity = require('entity/model/TempModel.js');
var PortfolioEntity = require('entity/portfolio/Portfolio.js');
var PortfolioAnalyticsEntity = require('entity/portfolio/PortfolioAnalytics.js');
var ModelDetailEntity = require('entity/model/ModelDetail1.js');
var TempModelDetailEntity = require('entity/model/TempModelDetail.js');
var ModelElementEntity = require('entity/model/ModelElement1.js');
var ModelStatusEntity = require('entity/model/ModelStatus.js');
var ClassEntity = require('entity/security/Class.js');
var TeamModelAccessEntity = require('entity/model/TeamModelAccess.js');
var CategoryEntity = require('entity/security/Category.js');
var SubClassEntity = require('entity/security/SubClass.js');
var SecuritySetEntity = require('entity/security/SecuritySet.js');
var TempModelDetail = require("entity/model/TempModelDetail.js");
var applicationEnum = config.applicationEnum;

var preferenceLevel = applicationEnum.preferenceLevel;

var ModelDao = function () { }

var tableNames = [
                   'model', //0
                   'modelDetails', //1
                   'modelElements', //2
                   'modelStatus', //3,
                   'modelManagementStyle',//4
                   'portfolio', //5
                   'tempModelDetails', //6
                   'portfolioAnalytics', //7
                   'tempModel', //8
                   "dynamicModelSecurities" //9
                  ];

ModelDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    var arr = [];
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is "+roleTypeId);
    var limitedAccess = data.modelLimitedAccess;
    var allAccess = data.modelAllAccess;
    var query = [];
    
    var query2  = squel.select()
			    	.field(ModelEntity.columns.id, "id")
			    	.field(ModelEntity.columns.name, "name")
			    	.field("CASE when "+PortfolioEntity.columns.id+" IS NULL THEN 0 ELSE count("+ModelEntity.columns.id+") END", "portfolioCount")
					.field("CASE when ("+ModelEntity.columns.isCommunityModel+" = 0) THEN 'Advisor' ELSE 'Team' END", "source")
					.field(ModelEntity.columns.statusId, "statusId")
			    	.field(ModelStatusEntity.columns.displayName, "status")
					.field(ModelEntity.columns.namespace, "nameSpace")
					.field(TempModelEntity.columns.statusId, "currentStatusId")
					.field(ModelEntity.columns.tags, "tags")
					.field(ModelEntity.columns.dynamicModel, "isDynamic")
					.field(ModelEntity.columns.isSubstitutedForPortfolio, "isSubstitutedForPortfolio")
					.field(ModelEntity.columns.description, "description")
					.field(ModelEntity.columns.ownerUserId, "ownerUserId")
					.field(UserEntity.alias("ownUs", "userLoginId"), "ownerUser")
					.field(ModelEntity.columns.managementStyleId, "managementStyleId")
					.field(ManagementStyleEntity.columns.name, "managementStyle")
					.field(ModelEntity.columns.isCommunityModel, "isCommunityModel")
					.field(ModelEntity.columns.communityModelled, "communityModelId")
					.field(ModelEntity.columns.createdDate, "lastSyncDate")
					.field(ModelEntity.columns.approvedBy, "approvedByUserId")
					.field(UserEntity.alias("appUs", "userLoginId"), "approvedByUser")
					.field(ModelEntity.columns.isDeleted, "isDeleted")
					.field(ModelEntity.columns.createdDate, "createdOn")
					.field(ModelEntity.columns.editedDate, "editedOn")
					.field(TeamModelAccessEntity.columns.teamId, "teamId")
					.field(TeamEntity.columns.name, "teamName")
					.field(ModelEntity.columns.ownerUserId, "ownerUserId")
					.field(UserEntity.usCreated.userLoginId, 'createdBy')
					.field(UserEntity.usEdited.userLoginId, 'editedBy')
					.from(ModelEntity.tableName)
					.left_join(TempModelEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(ModelEntity.columns.id, TempModelEntity.columns.modelId))
									.and(
										squelUtils.eql(TempModelEntity.columns.isDeleted, 0)))
					.left_join(ModelStatusEntity.tableName, null, squelUtils.joinEql(ModelStatusEntity.columns.id, ModelEntity.columns.statusId))
					.left_join(ModelStatusEntity.tableName, "ms2", squelUtils.joinEql(ModelStatusEntity.alias("ms2","id"), TempModelEntity.columns.statusId))
					.left_join(ManagementStyleEntity.tableName, null, squelUtils.joinEql(ManagementStyleEntity.columns.id, ModelEntity.columns.managementStyleId))
					.left_join(PortfolioEntity.tableName, null, squelUtils.joinEql(PortfolioEntity.columns.modelId, ModelEntity.columns.id))
					.left_join(UserEntity.tableName, "ownUs", squelUtils.joinEql(ModelEntity.columns.ownerUserId, UserEntity.alias("ownUs", "id")))
					.left_join(UserEntity.tableName, "appUs", squelUtils.joinEql(ModelEntity.columns.approvedBy, UserEntity.alias("appUs", "id")))
					.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(ModelEntity.columns.createdBy, UserEntity.usCreated.id))
					.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(ModelEntity.columns.editedBy, UserEntity.usEdited.id))
					.left_join(TeamModelAccessEntity.tableName, null, squelUtils.joinEql(TeamModelAccessEntity.columns.modelId, ModelEntity.columns.id))
					.left_join(TeamEntity.tableName, null, squelUtils.joinEql(TeamEntity.columns.id, TeamModelAccessEntity.columns.teamId));
					
				 if(data.outToleranceFilter){
					 	query2.join(PortfolioAnalyticsEntity.tableName, null, 
					 			squel.expr().and(
					 					squelUtils.joinEql(PortfolioEntity.columns.id, PortfolioAnalyticsEntity.columns.portfolioId)))
//					 					.and(squelUtils.eql(PortfolioAnalyticsEntity.columns.outOfTolerance, 1)))
				    }
				    
				    if(roleTypeId !== enums.roleType.FIRMADMIN){
				        if(allAccess && allAccess.length ===0 && limitedAccess && limitedAccess.length > 0){
				        	arr = limitedAccess; 
				        	query2.join(TeamModelAccessEntity.tableName, "tma1", 
				        				squel.expr().and(
				        						squelUtils.joinEql(ModelEntity.columns.originalModelId, ModelEntity.columns.id)
											).or(
													squel.expr().and(
																squelUtils.eql(ModelEntity.columns.id, TeamModelAccessEntity.alias("tma1", "modelId"))
															).and(
																squelUtils.in(TeamModelAccessEntity.alias("tma1", "teamId"), arr)
															).and(
																squelUtils.eql(TeamModelAccessEntity.alias("tma1", "isDeleted"), 0)
															)
												)
										) 
				        }
				    }
				    
//				    query2.where("1=1")   
				    if (data.search) {
				    	var innerQuery = squel.expr().and(squelUtils.like(ModelEntity.columns.name, data.search))
				    								 .or(squelUtils.like(ModelEntity.columns.tags, data.search))
				    	innerQuery.or(squel.expr().and(squelUtils.like(ModelEntity.columns.id, data.search)))
				    	query2.where(innerQuery);
				    }
				    
				    if(data.name){
				    	query2.where(squelUtils.eql(ModelEntity.columns.name, data.name));
				    }
				    if(data.namespace){
				    	query2.where(squelUtils.eql(ModelEntity.columns.namespace, data.namespace));
				    }
				    
				    if(data.statusId && data.statusId.length > 0){
				    	query2.where("CASE WHEN " + data.statusId + " = 1 THEN " + squelUtils.in(ModelEntity.columns.statusId, 1) + " AND "
				    				+ squelUtils.isNUll(TempModelEntity.columns.statusId) + " ELSE " + squelUtils.in(ModelEntity.columns.statusId, data.statusId)
				    				+ " OR " + squelUtils.in(TempModelEntity.columns.statusId, data.statusId) + " END "
				    	);
				    }
				    
				    if(data.outToleranceFilter){
				    	query2.where(squel.expr().and(squelUtils.eql(PortfolioAnalyticsEntity.columns.outOfTolerance, 1)))//.or(squelUtils.isNUll(PortfolioAnalyticsEntity.columns.outOfTolerance)));
				    }
				    
				    if(roleTypeId !== enums.roleType.FIRMADMIN){    	
				    	query2.where(squelUtils.notEql(ModelEntity.columns.statusId, 2))
				    }
				    query2.where(squelUtils.eql(ModelEntity.columns.isDeleted, 0))
				    query2.where(squelUtils.notEql(ModelEntity.columns.isSubModel, 1))
				    query2.where(squelUtils.eql(ModelEntity.columns.isSubstitutedForPortfolio, 0))
				    query2.group(ModelEntity.columns.id);
				    
				    if (data.search) {
				    	query2.order(ModelEntity.columns.name);
					}
				    
    query2 = query2.toString();
    logger.debug("Query: " + query2);
    var queryString = connection.query(query2, [ data.statusId ], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

/*
 * NOT USED
*/ModelDao.prototype.getSubstituteModelListForModel = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    var query = [];
    var arr = [];
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is "+roleTypeId);
    var limitedAccess = data.modelLimitedAccess;
    var allAccess = data.modelAllAccess;
    var query = [];

    query.push(' SELECT m.id, m.name, (CASE when p.id IS NULL THEN 0 ELSE count(m.originalModelId) END) as portfolioCount');
    query.push(' ,(CASE when tm.statusId IS NULL THEN m.statusId ELSE tm.statusId END) as statusId ');
    query.push(' ,(CASE when tm.statusId IS NULL THEN ms.displayName ELSE ms2.displayName END) as status ');
    query.push(', m.namespace, m.tags, m.dynamicModel as isDynamic, m.description, m.ownerUserId as ownerUserId, ownUs.userLoginId as ownerUser, m.managementStyleId as managementStyleId, mst.name as managementStyle ');
    query.push(' ,m.approvedBy as approvedByUserId, appUs.userLoginId as approvedByUser ');
    query.push(' ,m.isDeleted, m.createdDate as createdOn ');
    query.push(' ,usCreated.userLoginId as createdBy ');
    query.push(' ,m.editedDate as editedOn ');
    query.push(' ,usEdited.userLoginId as editedBy ');
    query.push(' FROM ' + tableNames[0] + ' AS m ');
    query.push(" LEFT JOIN " + tableNames[8] + " AS tm ON m.id = tm.modelId AND tm.isDeleted = 0  ");
    query.push(" LEFT JOIN " + tableNames[3] + " AS ms ON ms.id = m.statusId  ");
    query.push(" LEFT JOIN " + tableNames[3] + " AS ms2 ON ms2.id = tm.statusId  ");
    query.push(" LEFT JOIN " + tableNames[4] + " AS mst ON mst.id = m.managementStyleId  ");
    query.push(" LEFT JOIN " + tableNames[5] + " AS p ON p.modelId = m.originalModelId AND p.substitutedModelId = m.id  ");
    
    query.push(" left outer join user as ownUs on m.ownerUserId = ownUs.id ");
    query.push(" left outer join user as appUs on m.ownerUserId = appUs.id ")
    query.push(" left outer join user as usCreated on usCreated.id = m.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = m.editedBy ");
    
    if(data.outToleranceFilter){
    	query.push(" INNER JOIN " + tableNames[7] + " AS pa ON ( p.id = pa.portfolioId  AND pa.outOfTolerance = 1 ) ");
    }
    
    if(roleTypeId !== enums.roleType.FIRMADMIN){
        if(allAccess && allAccess.length ===0 && limitedAccess && limitedAccess.length > 0){
        	arr = limitedAccess; 
        	query.push(' INNER JOIN teamModelAccess AS tma1 ON (m.originalModelId = m.id) OR (m.id = tma1.modelId AND tma1.teamId IN (' + arr + ') AND tma1.isDeleted = 0)  '); 
        }
    }
    query.push(' WHERE 1=1 ');
    
    if (data.search) {
        query.push(' AND ');
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' (m.id= "' + data.search + '" OR ');
        }
        query.push(' m.name LIKE "%' + data.search + '%" ');
        if (data.search.match(/^[0-9]+$/g)) {
             query.push(' ) ');
         }
    }
    
    if(data.name && data.namespace){
    	query.push(" AND ");
    	query.push(" m.name = '" + data.name + "' AND m.namespace = '" + data.namespace +"'");
    }
    
    if(data.statusId && data.statusId.length > 0){
    	query.push(' AND m.statusId IN (?) ')
    }
    
    if(data.outToleranceFilter){
    	query.push(' AND (pa.outOfTolerance = 1 OR pa.outOfTolerance IS NULL )');
    }
    
    if(roleTypeId !== enums.roleType.FIRMADMIN){    	
    	query.push(' AND m.statusId != 2 ');
    }
    
    query.push(' AND m.isDeleted = 0 AND m.isSubstitutedForPortfolio = 1 ');
    query.push(' GROUP BY m.id ');
    
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, [ data.statusId ], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getTeamAccessForModel = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    var query = [];
    
    query.push(" SELECT tma.teamId as teamId, t.name as teamName ")
    query.push(" FROM teamModelAccess as tma ");
    query.push(" INNER JOIN team as t on tma.teamId = t.id ");
    query.push(" WHERE tma.modelId = ? ")
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, [ data.id ], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT * FROM ' + tableNames[0] + ' WHERE id = ? AND isDeleted = 0 ';
    
    logger.debug(query);
    if(data.id || data.id == 0){
    	var queryString = connection.query(query, data.id, function (err, data) {
    		if (err) {
    			return cb(err);
    		}
    		return cb(null, data);
    	});    	
    }else{
    	cb(null, []);
    }
};

ModelDao.prototype.getTempModel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT * FROM ' + tableNames[8] + ' WHERE modelId = ? AND isDeleted = 0 ';
    
    logger.debug(query);
    var id = data.id;
    if(data.id || data.id == 0){
    	var queryString = connection.query(query, id, function (err, data) {
    		if (err) {
    			return cb(err);
    		}
    		return cb(null, data);
    	});    	
    }else{
    	cb(null, []);
    }
};

ModelDao.prototype.getDashboardSummary = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var query = 'CALL getDashboardSummaryModels ('+userId+',' +null+')';
    
    logger.debug(query);

	var queryString = connection.query(query, data.id, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});    	
    
};

ModelDao.prototype.getModelPreferences = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    
    var preferenceId = data.preference;
    var firmRelatedType = preferenceLevel.FIRM;
    var modelRelatedType = preferenceLevel.MODEL;
    var modelId = data.id;
    var query = 'CALL getPreferencesForModel ("'+preferenceId+'",' +firmRelatedType+','+modelRelatedType+','+modelId+')';
    
    logger.debug(query);

	var queryString = connection.query(query, data.id, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});    	
    
};


ModelDao.prototype.getTargetAllocationsForSecuritiesInSecuritySetInModel = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    var modelId = data.id;
    var query = 'CALL getTargetAllocationsForSecuritiesInSecuritySetInModel ('+modelId+')';
    
    logger.debug(query);

	var queryString = connection.query(query, data.id, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});    	
    
};


ModelDao.prototype.getCurrentAllocationsForSecuritiesInPortfolio = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    var portfolioId = data.id;
    
    var query = " SELECT a.accountId, s.id as id, s.symbol AS symbol, s.name AS name, sp.price AS price, p.quantity, sp.price * p.quantity AS value, " 
			     + " SUM(sp.price * p.quantity) AS total FROM account AS a " 
			     + " LEFT OUTER JOIN `position` AS p ON p.accountId = a.id "
			     + " LEFT OUTER JOIN `security` AS s ON s.id = p.securityId "
			     + " LEFT OUTER JOIN `securityPrice` AS sp ON s.id = sp.securityId "
			     + " WHERE a.portfolioId = ? GROUP BY s.id ";
    
    logger.debug(query);

	var queryString = connection.query(query, portfolioId, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});    	
    
};

ModelDao.prototype.getCurrentAllocationsForSecuritiesInAccount = function (data, cb) {
    
    var connection = baseDao.getConnection(data);
    var accountId = data.id;
    var securityId = data.securityId;
    
    var query = " SELECT a.id, a.accountId, s.id as id, s.symbol AS symbol, s.name AS name, sp.price AS price, p.quantity, sp.price * p.quantity AS value, " 
                 + " SUM(sp.price * p.quantity) AS total FROM account AS a " 
                 + " INNER JOIN `position` AS p ON p.accountId = a.id "
                 + " INNER JOIN `security` AS s ON s.id = p.securityId "
                 + " INNER JOIN (SELECT sp.securityId AS securityId, MAX(sp.priceDateTime) AS priceDateTime FROM securityPrice AS sp GROUP BY sp.securityId) " 
                 + " AS maxTime ON s.id = maxTime.securityId "
                 + " INNER JOIN `securityPrice` AS sp ON s.id = sp.securityId AND sp.priceDateTime = maxTime.priceDateTime "
                 + " WHERE a.id = ? AND s.id = ? GROUP BY s.id ";
    
    logger.debug(query);

    var queryString = connection.query(query, [accountId, securityId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });     
    
};
ModelDao.prototype.getCurrentAllocationsForSecuritiesInSleevedAccounts = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    var portfolioId = data.id;
    
    var query = " SELECT a.accountId, s.id as id, s.symbol AS symbol, s.name AS name, sp.price AS price, p.quantity, sp.price * p.quantity AS value, " 
			     + " SUM(sp.price * p.quantity) AS total FROM account AS a " 
			     + " INNER JOIN `position` AS p ON p.accountId = a.id "
			     + " INNER JOIN `security` AS s ON s.id = p.securityId "
			     + " INNER JOIN (SELECT sp.securityId AS securityId, MAX(sp.priceDateTime) AS priceDateTime FROM securityPrice AS sp GROUP BY sp.securityId) " 
			     + " AS maxTime ON s.id = maxTime.securityId "
			     + " INNER JOIN `securityPrice` AS sp ON s.id = sp.securityId AND sp.priceDateTime = maxTime.priceDateTime "
			     + " WHERE a.id = ? GROUP BY s.id ";
    
    logger.debug(query);

	var queryString = connection.query(query, portfolioId, function (err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});    	
    
};


ModelDao.prototype.getSubModel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT * FROM ' + tableNames[2] + ' WHERE id = ? AND isDeleted = 0 ';
    
    logger.debug(query);
    if(data.id || data.id == 0){
    	var queryString = connection.query(query, data.id, function (err, data) {
    		if (err) {
    			return cb(err);
    		}
    		return cb(null, data);
    	});    	
    }else{
    	cb(null, []);
    }
};

ModelDao.prototype.getAllModelsWithSecuritySet = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT DISTINCT(md.modelId) as id FROM ' + tableNames[2] + ' as me ' + 
    			' INNER JOIN ' + tableNames[1] + ' as md ON me.id = md.modelElementId AND md.isDeleted = 0 ' +
    			' LEFT JOIN tempModelDetails as tmd ON me.id = tmd.modelElementId AND tmd.isDeleted = 0 WHERE me.relatedType="SECURITYSET" AND me.isDeleted = 0 ';
    
    query += " AND ";
    if(Array.isArray(data.id)){
    	query = query+ 'me.relatedTypeId IN (?)'; 
    }else{
    	query = query+ 'me.relatedTypeId = ?';
    }
    
//    if(data.modelId){
//    	query+= ' AND md.modelId  '
//    }
    
    logger.debug(query);
    if(data.id || data.id == 0){
    	var queryString = connection.query(query, data.id, function (err, data) {
    		if (err) {
    			return cb(err);
    		}
    		return cb(null, data);
    	});    	
    	
    }else{
    	cb(null, []);
    }
};


ModelDao.prototype.getModelAUM = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var modelId = data.id;

    var query = ' CALL 	getModelAUMStatsByDateForUser(?, ?)';
    
    logger.debug(query);
    if(data.id || data.id == 0){
    	var queryString = connection.query(query, [userId, modelId], function (err, data) {
    		if (err) {
    			return cb(err);
    		}
    		return cb(null, data);
    	});    	
    }else{
    	cb(null, []);
    }
};

ModelDao.prototype.getBasedOnNamespace = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var name = data.name;
    var namespace = data.namespace;
    var id = data.id;
    var query = 'SELECT * FROM ' + tableNames[0] + ' WHERE name = ? AND namespace = ? AND isDeleted = 0 AND isSubstitutedForPortfolio = 0 ';
    if(id!=undefined || id !=null){
    	query = query + ' AND id != ? '; 
    }
    var queryString = connection.query(query, [name, namespace, id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};


ModelDao.prototype.getBasedOnNamespaceForSubmodel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var name = data.name;
    var namespace = data.namespace;
    var id = data.id;
    var query = 'SELECT * FROM ' + tableNames[2] + ' WHERE name = ? AND namespace = ? AND isDeleted = 0 ';
    if(id!=undefined || id !=null){
    	query = query + ' AND id != ? '; 
    }
    var queryString = connection.query(query, [name, namespace, id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.managementStyles = function (data, cb) {
    var connection = baseDao.getConnection(data);
    
    var query = squel.select()
    				 .from(ManagementStyleEntity.tableName).toString();
    				 
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.filterTypes = function (data, cb) {
    var connection = baseDao.getConnection(data);
    
    var query = squel.select()
    						.from(FilterTypeEntity.tableName);

    if(data.filterId){
    	query = query.where(squelUtils.in(FilterTypeEntity.columns.id, data.filterId))
    }
    
    query = query.toString();
    
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.modelStatus = function (data, cb) {
    var connection = baseDao.getConnection(data);
    
    var query = squel.select()
    						.from(ModelStatusEntity.tableName);
    
    query = query.toString();
    
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};


ModelDao.prototype.getModelIdsWithModelElements = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    
    var ids = data.id;
    var doneModelId = data.doneModelId;
    var query = 'SELECT DISTINCT(modelId) as id FROM modelDetails WHERE modelElementId IN (?) AND isDeleted = 0 ';
    
    if(data.doneModelId){
    	query += " AND modelId != ?";
    }
    logger.debug(query);
    var queryString = connection.query(query, [ids, doneModelId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getCompleteModelById = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    var id = data.id;
    
    var query2 = squel.select()
    				.field(ModelEntity.columns.id, "id")
			    	.field(ModelEntity.columns.name, "name")
			    	.field(ModelEntity.columns.description, "description")
			    	.field(ModelEntity.columns.namespace, "namespace")
			    	.field(ModelEntity.columns.ownerUserId, "ownerUserId")
			    	.field(UserEntity.alias("ownUs", "userLoginId"), "ownerUser")
					.field(ModelEntity.columns.dynamicModel, "dynamicModel")
					.field(ModelEntity.columns.tags, "tags")
					.field(ModelEntity.columns.statusId, "statusId")
					.field(ModelStatusEntity.columns.displayName, "status")
					.field(TempModelEntity.columns.statusId, "currentStatusId")
					.field(ModelStatusEntity.alias("ms2", "displayName"), "currentStatus")
					.field(ModelEntity.columns.managementStyleId, "managementStyleId")
					.field(ManagementStyleEntity.columns.name, "managementStyle")
					.field(ModelEntity.columns.isSubstitutedForSleeve, "isSubstitutedForSleeve")
					.field(ModelEntity.columns.communityModelled, "communityModelId")
					.field(ModelEntity.columns.isCommunityModel, "isCommunityModel")
					.field(ModelEntity.columns.createdDate, "lastSyncDate")
					.field(ModelEntity.columns.approvedBy, "approvedByUserId")
					.field(UserEntity.alias("appUs", "userLoginId"), "approvedByUser")
					.field(ModelEntity.columns.isDeleted, "isDeleted")
					.field(ModelEntity.columns.createdDate, "createdDate")
					.field(ModelEntity.columns.editedDate, "editedDate")
					.field(UserEntity.usCreated.userLoginId, 'createdBy')
					.field(UserEntity.usEdited.userLoginId, 'editedBy')
					.field(ModelDetailEntity.columns.id, "modelDetailId")
					.field(ModelDetailEntity.columns.modelElementId, "meId")
					.field(ModelDetailEntity.columns.isSubstituted, "isSubstituted")
					.field(ModelDetailEntity.columns.substituteOf, "substituteOf")
					.field(ModelDetailEntity.columns.leftValue, "leftValue")
					.field(ModelDetailEntity.columns.rightValue, "rightValue")
					.field(ModelDetailEntity.columns.rank, "meRanking")
					.field(ModelDetailEntity.columns.rank, "rank")
					.field(ModelDetailEntity.columns.level, "meLevel")
					.field(ModelDetailEntity.columns.isDeleted, "isDeleted")
					.field(ModelElementEntity.columns.name, "meName")
					.field(ModelElementEntity.columns.namespace, "meNamespace")
					.field(ModelDetailEntity.columns.targetPercent, "targetPercent")
					.field(ModelDetailEntity.columns.lowerModelTolerancePercent, "lowerModelTolerancePercent")
					.field(ModelDetailEntity.columns.upperModelTolerancePercent, "upperModelTolerancePercent")
					.field(ModelDetailEntity.columns.toleranceType, "toleranceType")
					.field(ModelDetailEntity.columns.toleranceTypeValue, "toleranceTypeValue")
					.field(ModelDetailEntity.columns.lowerModelToleranceAmount, "lowerModelToleranceAmount")
					.field(ModelDetailEntity.columns.upperModelToleranceAmount, "upperModelToleranceAmount")
					.field(ModelDetailEntity.columns.lowerTradeTolerancePercent, "lowerTradeTolerancePercent")
					.field(ModelDetailEntity.columns.upperTradeTolerancePercent, "upperTradeTolerancePercent")
					.field(ModelElementEntity.columns.relatedType, "relatedType")
					.field(ModelElementEntity.columns.relatedTypeId, "relatedTypeId")
					.field(ModelElementEntity.columns.validateTickerSet, "meValidateTickerSet")
					.field(CategoryEntity.columns.name, "assetCategoryName")
					.field(CategoryEntity.columns.color, "assetCategoryColor")
					.field(SubClassEntity.columns.name, "assetSubClassName")
					.field(SubClassEntity.columns.color, "assetSubClassColor")
					.field(ClassEntity.columns.name, "assetClassName")
					.field(ClassEntity.columns.color, "assetClassColor")
					.field(ModelElementEntity.columns.rebalancePriority, "meRebalancePriority")
					.from(ModelEntity.tableName)
					.left_join(TempModelEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelEntity.columns.id , TempModelEntity.columns.modelId))
																			.and(squelUtils.eql(TempModelEntity.columns.isDeleted, 0)))
					.left_join(ModelDetailEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(ModelEntity.columns.id, ModelDetailEntity.columns.modelId))
									.and(
										squelUtils.eql(ModelDetailEntity.columns.isDeleted, 0)))
					.left_join(ModelStatusEntity.tableName, null, squelUtils.joinEql(ModelStatusEntity.columns.id, ModelEntity.columns.statusId))
					.left_join(ModelStatusEntity.tableName, "ms2", squelUtils.joinEql(ModelStatusEntity.alias("ms2", "id"), TempModelEntity.columns.statusId))
					.left_join(ManagementStyleEntity.tableName, null, squelUtils.joinEql(ManagementStyleEntity.columns.id, ModelEntity.columns.managementStyleId))
					.left_join(PortfolioEntity.tableName, null, squelUtils.joinEql(PortfolioEntity.columns.modelId, ModelEntity.columns.id))
					.left_join(UserEntity.tableName, "ownUs", squelUtils.joinEql(ModelEntity.columns.ownerUserId, UserEntity.alias("ownUs", "id")))
					.left_join(UserEntity.tableName, "appUs", squelUtils.joinEql(ModelEntity.columns.approvedBy, UserEntity.alias("appUs", "id")))
					.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(ModelEntity.columns.createdBy, UserEntity.usCreated.id))
					.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(ModelEntity.columns.editedBy, UserEntity.usEdited.id))
					.left_join(ModelElementEntity.tableName, null, squelUtils.joinEql(ModelElementEntity.columns.id, ModelDetailEntity.columns.modelElementId))
					.left_join(CategoryEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(CategoryEntity.columns.id, ModelElementEntity.columns.relatedTypeId))
									.and(
										squelUtils.eql(ModelElementEntity.columns.relatedType, "CATEGORY")))
					.left_join(ClassEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(ClassEntity.columns.id, ModelElementEntity.columns.relatedTypeId))
									.and(
										squelUtils.eql(ModelElementEntity.columns.relatedType, "CLASS")))
					.left_join(SubClassEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(SubClassEntity.columns.id, ModelElementEntity.columns.relatedTypeId))
									.and(
										squelUtils.eql(ModelElementEntity.columns.relatedType, "SUBCLASS")))
					.left_join(SecuritySetEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(SecuritySetEntity.columns.id, ModelElementEntity.columns.relatedTypeId))
									.and(
										squelUtils.eql(ModelElementEntity.columns.relatedType, "SECURITYSET")))
					.where(squelUtils.eql(ModelEntity.columns.id, id))
					.where(squelUtils.eql(ModelEntity.columns.isDeleted, 0))
					.order(ModelDetailEntity.columns.level);
    
    query2 = query2.toString();
	
	logger.debug(query2);
    
	var queryString = connection.query(query2, id, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getCompleteTempModelById = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var id = data.id;
    
    var query2 = squel.select()
    				.field(ModelEntity.columns.id, "id")
			    	.field(ModelEntity.columns.name, "name")
			    	.field(ModelEntity.columns.description, "description")
			    	.field(ModelEntity.columns.namespace, "namespace")
			    	.field(ModelEntity.columns.ownerUserId, "ownerUserId")
			    	.field(UserEntity.alias("ownUs", "userLoginId"), "ownerUser")
					.field(ModelEntity.columns.dynamicModel, "dynamicModel")
					.field(ModelEntity.columns.tags, "tags")
					.field(ModelEntity.columns.statusId, "statusId")
					.field(ModelStatusEntity.columns.displayName, "status")
					.field(TempModelEntity.columns.statusId, "currentStatusId")
					.field(ModelStatusEntity.alias("ms2", "displayName"), "currentStatus")
					.field(ModelEntity.columns.managementStyleId, "managementStyleId")
					.field(ManagementStyleEntity.columns.name, "managementStyle")
					.field(ModelEntity.columns.communityModelled, "communityModelId")
					.field(ModelEntity.columns.isCommunityModel, "isCommunityModel")
					.field(ModelEntity.columns.createdDate, "lastSyncDate")
					.field(ModelEntity.columns.approvedBy, "approvedByUserId")
					.field(ModelEntity.columns.createdDate, "createdDate")
					.field(ModelEntity.columns.editedDate, "editedDate")
					.field(UserEntity.usCreated.userLoginId, 'createdBy')
					.field(UserEntity.usEdited.userLoginId, 'editedBy')
					.field(TempModelDetailEntity.columns.id, "modelDetailId")
					.field(TempModelDetailEntity.columns.modelElementId, "meId")
					.field(TempModelDetailEntity.columns.isSubstituted, "isSubstituted")
					.field(TempModelDetailEntity.columns.substituteOf, "substituteOf")
					.field(TempModelDetailEntity.columns.leftValue, "leftValue")
					.field(TempModelDetailEntity.columns.rightValue, "rightValue")
					.field(TempModelDetailEntity.columns.rank, "meRanking")
					.field(TempModelDetailEntity.columns.rank, "rank")
					.field(TempModelDetailEntity.columns.level, "meLevel")
					.field(TempModelDetailEntity.columns.isDeleted, "isDeleted")
					.field(ModelElementEntity.columns.name, "meName")
					.field(ModelElementEntity.columns.namespace, "meNamespace")
					.field(TempModelDetailEntity.columns.targetPercent, "targetPercent")
					.field(TempModelDetailEntity.columns.lowerModelTolerancePercent, "lowerModelTolerancePercent")
					.field(TempModelDetailEntity.columns.upperModelTolerancePercent, "upperModelTolerancePercent")
					.field(TempModelDetailEntity.columns.toleranceType, "toleranceType")
					.field(TempModelDetailEntity.columns.toleranceTypeValue, "toleranceTypeValue")
					.field(TempModelDetailEntity.columns.lowerModelToleranceAmount, "lowerModelToleranceAmount")
					.field(TempModelDetailEntity.columns.upperModelToleranceAmount, "upperModelToleranceAmount")
					.field(TempModelDetailEntity.columns.lowerTradeTolerancePercent, "lowerTradeTolerancePercent")
					.field(TempModelDetailEntity.columns.upperTradeTolerancePercent, "upperTradeTolerancePercent")
					.field(ModelElementEntity.columns.relatedType, "relatedType")
					.field(ModelElementEntity.columns.relatedTypeId, "relatedTypeId")
					.field(ModelElementEntity.columns.validateTickerSet, "meValidateTickerSet")
					.field(CategoryEntity.columns.name, "assetCategoryName")
					.field(CategoryEntity.columns.color, "assetCategoryColor")
					.field(SubClassEntity.columns.name, "assetSubClassName")
					.field(SubClassEntity.columns.color, "assetSubClassColor")
					.field(ClassEntity.columns.name, "assetClassName")
					.field(ClassEntity.columns.color, "assetClassColor")
					.field(ModelElementEntity.columns.rebalancePriority, "meRebalancePriority")
					.from(ModelEntity.tableName)
					.left_join(TempModelEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelEntity.columns.id , TempModelEntity.columns.modelId))
																			.and(squelUtils.eql(TempModelEntity.columns.isDeleted, 0)))
					.left_join(TempModelDetailEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(TempModelEntity.columns.modelId, TempModelDetailEntity.columns.modelId))
									.and(
										squelUtils.eql(TempModelDetailEntity.columns.isDeleted, 0)))
					.left_join(ModelStatusEntity.tableName, null, squelUtils.joinEql(ModelStatusEntity.columns.id, ModelEntity.columns.statusId))
					.left_join(ModelStatusEntity.tableName, "ms2", squelUtils.joinEql(ModelStatusEntity.alias("ms2", "id"), TempModelEntity.columns.statusId))
					.left_join(ManagementStyleEntity.tableName, null, squelUtils.joinEql(ManagementStyleEntity.columns.id, ModelEntity.columns.managementStyleId))
					.left_join(UserEntity.tableName, "ownUs", squelUtils.joinEql(ModelEntity.columns.ownerUserId, UserEntity.alias("ownUs", "id")))
					.left_join(UserEntity.tableName, "appUs", squelUtils.joinEql(ModelEntity.columns.approvedBy, UserEntity.alias("appUs", "id")))
					.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(ModelEntity.columns.editedBy, UserEntity.usEdited.id))
					.left_join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(TempModelEntity.columns.createdBy, UserEntity.usCreated.id))
					.left_join(ModelElementEntity.tableName, null, squelUtils.joinEql(ModelElementEntity.columns.id, TempModelDetailEntity.columns.modelElementId))
					.left_join(CategoryEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(CategoryEntity.columns.id, ModelElementEntity.columns.relatedTypeId))
									.and(
										squelUtils.eql(ModelElementEntity.columns.relatedType, "CATEGORY")))
					.left_join(ClassEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(ClassEntity.columns.id, ModelElementEntity.columns.relatedTypeId))
									.and(
										squelUtils.eql(ModelElementEntity.columns.relatedType, "CLASS")))
					.left_join(SubClassEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(SubClassEntity.columns.id, ModelElementEntity.columns.relatedTypeId))
									.and(
										squelUtils.eql(ModelElementEntity.columns.relatedType, "SUBCLASS")))
					.left_join(SecuritySetEntity.tableName, null, 
							squel.expr().and(
										squelUtils.joinEql(SecuritySetEntity.columns.id, ModelElementEntity.columns.relatedTypeId))
									.and(
										squelUtils.eql(ModelElementEntity.columns.relatedType, "SECURITYSET")))
					.where(squelUtils.eql(ModelEntity.columns.id, id))
					.where(squelUtils.eql(ModelEntity.columns.isDeleted, 0))
					.order(TempModelDetailEntity.columns.level);
				
	query2 = query2.toString();
	logger.debug(query2);
    var queryString = connection.query(query2, id, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getModelElementExistence = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var id = data.id;
    
    var query = [];
    
	query.push(" SELECT * ");
	
	if(Array.isArray(id)){
		if(id.length > 0){			
			query.push(" FROM modelElements where id in (?) ");
		}else{
			return cb(null, []);
		}
	}else{		
		query.push(" FROM modelElements where id = ? ");
	}

	query = query.join("");
	logger.debug(query);
    var queryString = connection.query(query, [id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};


ModelDao.prototype.createGeneralModelInformation = function (data, cb) {
	
	 var self = this;
     var connection = baseDao.getConnection(data);

     var modelEntity = _.omit(data, ["reqId"]);
     
     var modelQuery = [];
     modelQuery.push(" INSERT INTO " + tableNames[0] + " SET ? ");
     modelQuery.push(" ON DUPLICATE KEY UPDATE ? ");
     modelQuery = modelQuery.join("");
     
     logger.debug(modelQuery);
     connection.query(modelQuery,[modelEntity, modelEntity], function(err, data){
         cb(err, data);
     });    
}

ModelDao.prototype.updateGeneralModelInformation = function (data, cb) {
	
	 var self = this;
    var connection = baseDao.getConnection(data);

    var modelEntity = _.omit(data, ["reqId"]);
    
    var modelQuery = [];
    
    var id = data.id;
    var updateEntity = {
    		name : data.name,
    		statusId : data.statusId,
    		managementStyleId : data.managementStyleId,
    		isCommunityModel : data.isCommunityModel,
    		communityModelId : data.communityModelId,
    		namespace : data.namespace,
    		description : data.description,
    		ownerUserId : data.ownerUserId,
    		scope : data.scope,
    		//dynamicModel : data.dynamicModel,
    		tags : data.tags,
    		approvedBy : data.approvedBy,
    		isSubstitutedForPortfolio : data.isSubstitutedForPortfolio,
    		editedDate : data.editedDate,
    		editedBy : data.editedBy
    }
    
    modelQuery.push(" UPDATE " + tableNames[0] + " SET ? ");
    modelQuery.push(" WHERE id = ? ");
    
    modelQuery = modelQuery.join("");
    
    logger.debug(modelQuery);
    connection.query(modelQuery,[updateEntity, id], function(err, data){
        cb(err, data);
    });
    
}

ModelDao.prototype.modelStatusChange = function (data, cb) {
	
	 var self = this;
   var connection = baseDao.getConnection(data);

   var modelEntity = _.omit(data, ["reqId"]);
   
   var modelQuery = [];
   
   var id = data.id;
   var updateEntity = {
   		statusId : data.statusId,
   		approvedBy : data.approvedBy,
   		editedDate : data.editedDate,
   		editedBy : data.editedBy
   }
   
   modelQuery.push(" UPDATE " + tableNames[0] + " SET ? ");
   modelQuery.push(" WHERE id = ? ");
   
   modelQuery = modelQuery.join("");
   
   logger.debug(modelQuery);
   connection.query(modelQuery,[updateEntity, id], function(err, data){
       cb(err, data);
   });
   
}

ModelDao.prototype.createAndUpdateModelDetail = function (data, cb) {
	
	var self = this;
    var connection = baseDao.getConnection(data);

    var modelEntity = data.list;
    
    var modelQuery = [];
    /*
     * when isDeleted=1 createdDate, createdBy will be added other wise
     * other fields will added
    */
    modelQuery.push(" INSERT INTO " + tableNames[1] + " (id, modelId, modelElementId, leftValue, rightValue, level, isDeleted, targetPercent,rank, toleranceType, toleranceTypeValue, lowerModelTolerancePercent ");
    modelQuery.push(" ,upperModelTolerancePercent, lowerModelToleranceAmount, upperModelToleranceAmount, lowerTradeTolerancePercent, upperTradeTolerancePercent, isSubstituted, substituteOf, createdDate, createdBy, editedDate, editedBy) VALUES ?");
    modelQuery.push(" ON DUPLICATE KEY UPDATE leftValue=VALUES(leftValue), rightValue=VALUES(rightValue), rank=VALUES(rank), level=VALUES(level), isDeleted=Values(isDeleted) ");
    modelQuery.push(" ,targetPercent=VALUES(targetPercent), rank=VALUES(rank),toleranceType=VALUES(toleranceType), toleranceTypeValue=VALUES(toleranceTypeValue), lowerModelTolerancePercent=VALUES(lowerModelTolerancePercent), upperModelTolerancePercent=VALUES(upperModelTolerancePercent) ");
    modelQuery.push(" ,lowerTradeTolerancePercent=VALUES(lowerTradeTolerancePercent), upperTradeTolerancePercent=VALUES(upperTradeTolerancePercent), lowerModelToleranceAmount=VALUES(lowerModelToleranceAmount), upperModelToleranceAmount=VALUES(upperModelToleranceAmount) ");
    modelQuery.push(" ,isSubstituted=VALUES(isSubstituted), substituteOf=VALUES(substituteOf),editedDate=VALUES(editedDate), editedBy=VALUES(editedBy) ");
    modelQuery = modelQuery.join("");
    
    logger.debug(modelQuery);

    var queryString = connection.query(modelQuery,[modelEntity], function(err, data){
        cb(err, data);
    });
}

ModelDao.prototype.deleteDynamicModelSecurityQuantity = function (data, cb) {
	
	var self = this;
    var connection = baseDao.getConnection(data);


    var modelId = data.id;
    
    var json = {};
    
    json.isDeleted = 1;
    json.editedBy = data.editedBy;
    json.editedDate = data.editedDate;
    
    var modelQuery = [];
    /*
     * when isDeleted=1 createdDate, createdBy will be added other wise
     * other fields will added
    */
    modelQuery.push(" UPDATE " + tableNames[9] + " SET ? where modelId = ? ");
    modelQuery = modelQuery.join("");
    
    logger.debug(modelQuery);

    var queryString = connection.query(modelQuery,[json, modelId], function(err, data){
        cb(err, data);
    });
}

ModelDao.prototype.createDynamicModelSecurityQuantity = function (data, cb) {
	
	var self = this;
    var connection = baseDao.getConnection(data);

    var modelEntity = data.list;
    
    var modelQuery = [];
    /*
     * when isDeleted=1 createdDate, createdBy will be added other wise
     * other fields will added
    */

    modelQuery.push(" INSERT INTO " + tableNames[9] + " (modelId, modelDetailId, modelElementId, securityId, quantity, isDeleted ");
    modelQuery.push(" ,createdDate, createdBy, editedDate, editedBy) VALUES ?");
    modelQuery.push(" ON DUPLICATE KEY UPDATE isDeleted=Values(isDeleted) ");
    modelQuery.push(" ,quantity=(CASE WHEN " + data.fromCorporate + "=1 THEN dynamicModelSecurities.quantity + VALUES(quantity) ");
	modelQuery.push(" ELSE VALUES(quantity) END) ");
    modelQuery.push(" ,editedDate=VALUES(editedDate), editedBy=VALUES(editedBy) ");
    modelQuery = modelQuery.join("");
    logger.debug(modelQuery);
    console.log(modelEntity);
    var queryString = connection.query(modelQuery,[modelEntity], function(err, data){
    	console.log(queryString.sql)
        cb(err, data);
    });
}

ModelDao.prototype.getAllModelSecuritiesQuantitiesWithSecurity = function (data, cb) {
	
	var self = this;
    var connection = baseDao.getConnection(data);

    var securityId = data.securityId;
    
    var modelDetailQuery = [];
    /*
     * when isDeleted=1 createdDate, createdBy will be added other wise
     * other fields will added
    */
    modelDetailQuery.push(" SELECT * FROM dynamicModelSecurities WHERE securityId = ? ");
    modelDetailQuery = modelDetailQuery.join("");
    
    logger.debug(modelDetailQuery);

    var queryString = connection.query(modelDetailQuery,[securityId], function(err, data){
        cb(err, data);
    });
}

ModelDao.prototype.createAndUpdateTempModelDetail = function (data, cb) {
	
	var self = this;
    var connection = baseDao.getConnection(data);

    var modelEntity = data.list;
    
    var modelDetailQuery = [];
    /*
     * when isDeleted=1 createdDate, createdBy will be added other wise
     * other fields will added
    */
    modelDetailQuery.push(" INSERT INTO " + tableNames[6] + " (id, modelId, modelElementId, leftValue, rightValue, level, isDeleted, targetPercent, rank, toleranceType, toleranceTypeValue, lowerModelTolerancePercent ");
    modelDetailQuery.push(" ,upperModelTolerancePercent, lowerModelToleranceAmount, upperModelToleranceAmount, lowerTradeTolerancePercent, upperTradeTolerancePercent, isSubstituted, substituteOf, createdDate, createdBy, editedDate, editedBy) VALUES ?");
    modelDetailQuery.push(" ON DUPLICATE KEY UPDATE leftValue=VALUES(leftValue), rightValue=VALUES(rightValue), rank=VALUES(rank), level=VALUES(level), isDeleted=Values(isDeleted) ");
    modelDetailQuery.push(" ,targetPercent=VALUES(targetPercent), rank=VALUES(rank),toleranceType=VALUES(toleranceType), toleranceTypeValue=VALUES(toleranceTypeValue), lowerModelTolerancePercent=VALUES(lowerModelTolerancePercent), upperModelTolerancePercent=VALUES(upperModelTolerancePercent) ");
    modelDetailQuery.push(" ,lowerTradeTolerancePercent=VALUES(lowerTradeTolerancePercent), upperTradeTolerancePercent=VALUES(upperTradeTolerancePercent), lowerModelToleranceAmount=VALUES(lowerModelToleranceAmount), upperModelToleranceAmount=VALUES(upperModelToleranceAmount) ");
    modelDetailQuery.push(" ,isSubstituted=VALUES(isSubstituted), substituteOf=VALUES(substituteOf),editedDate=VALUES(editedDate), editedBy=VALUES(editedBy) ");
    modelDetailQuery = modelDetailQuery.join("");
    
    logger.debug(modelDetailQuery);

    var queryString = connection.query(modelDetailQuery,[modelEntity], function(err, data){
        cb(err, data);
    });
}

ModelDao.prototype.createTempModel = function (data, cb) {
	
	var self = this;
    var connection = baseDao.getConnection(data);

    var modelEntity = {
    		modelId : data.id,
    		statusId : data.statusId,
    		isDeleted : 0,
    		createdBy : utilService.getAuditUserId(data.user),
    		createdDate : utilDao.getSystemDateTime(null),
    }
    
    /*
     * when isDeleted=1 createdDate, createdBy will be added other wise
     * other fields will added
    */var modelQuery = [];

    modelQuery.push(" INSERT INTO " + tableNames[8] + " SET ? ON DUPLICATE KEY UPDATE ? ");
    
    modelQuery = modelQuery.join("");
    
    logger.debug(modelQuery);

    var queryString = connection.query(modelQuery,[modelEntity, modelEntity], function(err, data){
        cb(err, data);
    });
}

ModelDao.prototype.createAndUpdateModelElement = function (data, cb) {
	
	var self = this;
    var connection = baseDao.getConnection(data);

    var modelEntity = _.omit(data, ["reqId"]);

    var modelQuery = [];

    /*
     * when isDeleted=1 createdDate, createdBy will be added other wise
     * other fields will added
    */modelQuery.push(" INSERT INTO " + tableNames[2] + " SET ? ");
      modelQuery.push(" ON DUPLICATE KEY UPDATE ? ");
    
    modelQuery = modelQuery.join("");
    
    logger.debug(modelQuery);
    var queryString = connection.query(modelQuery,[modelEntity, modelEntity], function(err, data){
        cb(err, data);
    });
}

ModelDao.prototype.updateModelElement = function (data, cb) {
	
	var self = this;
    var connection = baseDao.getConnection(data);

    var modelEntity = _.omit(data, ["reqId"]);

    var modelQuery = [];

    /*
     * when isDeleted=1 createdDate, createdBy will be added other wise
     * other fields will added
    */
    var id = data.id;
    var entityBean = {};
    entityBean["name"] = data.name;
    entityBean["namespace"] = data.namespace;
    entityBean["editedBy"] = data.editedBy;
    entityBean["editedDate"] = data.editedDate;
    
    modelQuery.push(" UPDATE " + tableNames[2] + " SET ? WHERE id = ?");

    modelQuery = modelQuery.join("");
    
    logger.debug(modelQuery);

    var queryString = connection.query(modelQuery,[entityBean, id], function(err, data){
        cb(err, data);
    });
}

ModelDao.prototype.deleteModelDetail = function (data, cb) {
	
   var self = this;
   var connection = baseDao.getConnection(data);

   var idsNotToDelete = data.idsNotToRemove;
   var modelEntity = _.omit(data, ["reqId"]);
   
   var modelQuery = [];
   
   var id = data.modelId;
   var updateEntity = {
   		isDeleted : 1
   }
   
   modelQuery.push(" UPDATE " + tableNames[1] + " SET ? ");
   modelQuery.push(" WHERE modelId = ? ");
   
//   if( idsNotToDelete && idsNotToDelete.length > 0 ){
//	   modelQuery.push(" AND modelElementId NOT IN (?) ");
//   }
   
   modelQuery = modelQuery.join("");
   
   logger.debug(modelQuery);

   var queryString = connection.query(modelQuery,[updateEntity, id, idsNotToDelete], function(err, data){
       cb(err, data);
   });
}

ModelDao.prototype.deleteModelElement = function (data, cb) {
	
	   var self = this;
	   var connection = baseDao.getConnection(data);
	   
	   var modelQuery = [];
	   
	   var id = data.id;
	   
	   var updateEntity = {
	   		isDeleted : 1,
	   		editedBy : data.editedBy,
	   		editedDate : data.editedDate
	   }
	   
	   modelQuery.push(" UPDATE " + tableNames[2] + " SET ? ");
	   modelQuery.push(" WHERE id = ? ");
	   
	   modelQuery = modelQuery.join("");
	   
	   logger.debug(modelQuery);

	   var queryString = connection.query(modelQuery,[updateEntity, id], function(err, data){
	       cb(err, data);
	   });
	}

ModelDao.prototype.deleteTempModelDetail = function (data, cb) {
	
	   var self = this;
	   var connection = baseDao.getConnection(data);

	   var idsNotToDelete = data.idsNotToRemove;
	   var modelEntity = _.omit(data, ["reqId"]);
	   
	   var modelQuery = [];
	   
	   var id = data.modelId;
	   var updateEntity = {
	   		isDeleted : 1
	   }
	   
	   modelQuery.push(" UPDATE " + tableNames[6] + " SET ? ");
	   modelQuery.push(" WHERE modelId = ? ");
//	   
//	   if( idsNotToDelete && idsNotToDelete.length > 0 ){
//		   modelQuery.push(" AND modelElementId NOT IN (?) ");
//	   }
//	   
	   modelQuery = modelQuery.join("");
	   
	   logger.debug(modelQuery);

	   var queryString = connection.query(modelQuery,[updateEntity, id, idsNotToDelete], function(err, data){
	       cb(err, data);
	   });
}

ModelDao.prototype.deleteTempModel = function (data, cb) {
	
	   var self = this;
	   var connection = baseDao.getConnection(data);

	   var idsNotToDelete = data.idsNotToRemove;
	   var modelEntity = _.omit(data, ["reqId"]);
	   
	   var modelQuery = [];
	   
	   var id = data.modelId;
	   var updateEntity = {
	   		isDeleted : 1
	   }
	   
	   modelQuery.push(" UPDATE " + tableNames[8] + " SET ? ");
	   modelQuery.push(" WHERE modelId = ? ");
	   
//	   if( idsNotToDelete && idsNotToDelete.length > 0 ){
//		   modelQuery.push(" AND modelElementId NOT IN (?) ");
//	   }
	   
	   modelQuery = modelQuery.join("");
	   
	   logger.debug(modelQuery);

	   var queryString = connection.query(modelQuery,[updateEntity, id, idsNotToDelete], function(err, data){
	       cb(err, data);
	   });
}

ModelDao.prototype.deleteModelGeneral = function (data, cb) {
	
	   var self = this;
	   var connection = baseDao.getConnection(data);

	   var idsNotToDelete = data.idsNotToRemove;
	   var modelEntity = _.omit(data, ["reqId"]);
	   
	   var modelQuery = [];
	   
	   var id = data.id;
	   
	   var updateEntity = {
	   		isDeleted : 1,
	   		editedDate : data.editedDate,
	   		editedBy : data.editedBy
	   }
	   
	   modelQuery.push(" UPDATE " + tableNames[0] + " SET ? ");
	   modelQuery.push(" WHERE id = ? ");
	   
	   modelQuery = modelQuery.join("");
	   
	   logger.debug(modelQuery);

	   var queryString = connection.query(modelQuery,[updateEntity, id], function(err, data){
	       cb(err, data);
	   });
}

ModelDao.prototype.getNodesList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    
    var id = data.id;
    var isFavorite = data.isFavorite;
    var roleTypeId = data.user.roleTypeId;
    var relatedType = data.relatedType;
    var limitedAccess = data.modelLimitedAccess;
    var allAccess = data.modelAllAccess;
    var arr = [];
    
    var name = data.name;
    var namespace = data.namespace;

    var query = squel.select()
    					.field(ModelElementEntity.columns.id, "meId")
    					.field(ModelElementEntity.columns.name, "meName")
    					.field(ModelElementEntity.columns.relatedType)
    					.field(ModelElementEntity.columns.relatedTypeId)
    					.field(ModelElementEntity.columns.namespace, "meNamespace")
    					.field(CategoryEntity.columns.name, "assetCategoryName")
    					.field(CategoryEntity.columns.color, "assetCategoryColor")
    					.field(ClassEntity.columns.name, "assetClassName")
    					.field(ClassEntity.columns.color, "assetClassColor")
    					.field(SubClassEntity.columns.name, "assetSubClassName")
    					.field(SubClassEntity.columns.color, "assetSubClassColor")
    					.field(SecuritySetEntity.columns.name, "securitySetName")
    					.field(ModelElementEntity.columns.isFavorite)
    					.from(ModelElementEntity.tableName)
    					.left_join(CategoryEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, CategoryEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "CATEGORY")))
    					.left_join(ClassEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, ClassEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "CLASS")))
    					.left_join(SubClassEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, SubClassEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "SUBCLASS")))
    					.left_join(SecuritySetEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, SecuritySetEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "SECURITYSET")))
    
	query.where(squelUtils.eql(ModelElementEntity.columns.isDeleted, 0));
   
    
    if(id){
    	query.where(squelUtils.eql(ModelElementEntity.columns.id, id));
    }
    
    if(isFavorite){
    	query.where(squelUtils.eql(ModelElementEntity.columns.isFavorite, isFavorite));
    }
     
	if(roleTypeId !== enums.roleType.FIRMADMIN){
        if(allAccess && allAccess.length ===0 && limitedAccess && limitedAccess.length > 0){
        	arr = limitedAccess;
        	var innerQuery = squel.select()
        							.field(ModelDetailEntity.columns.modelElementId)
        							.distinct()
        							.from(ModelDetailEntity.tableName)
        							.join(TeamModelAccessEntity.tableName, null,  
        									squel.expr()
        									.and(squelUtils.joinEql(TeamModelAccessEntity.columns.modelId, ModelDetailEntity.columns.modelId))
        									.and(squelUtils.in(TeamModelAccessEntity.columns.teamId, arr))
        									.and(squelUtils.eql(TeamModelAccessEntity.columns.isDeleted, 0)));
          query.where(squelUtils.in(ModelElementEntity.columns.id, innerQuery));
        }
    }
					
   if(data.relatedType){
	   query.where(squelUtils.eql(ModelElementEntity.columns.relatedType, relatedType))
   }
   
   if(name){
	   query.where(squelUtils.eql(ModelElementEntity.columns.name, name));
   }
   
   if(namespace){	   
	   query.where(squelUtils.eql(ModelElementEntity.columns.namespace, namespace));
   }
   
   if (data.search) {
	   var secondaryQuery = squel.expr();
       if (data.search.match(/^[0-9]+$/g)) {
    	   secondaryQuery.and(squelUtils.eql(ModelElementEntity.columns.id, data.search));
       }
       secondaryQuery.or(squelUtils.eql(ModelElementEntity.columns.name, data.search));
       query.where(secondaryQuery);
       query.order(ModelElementEntity.columns.name);
   }
   
   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getModelElementDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);
    
    var id = data.id;
    var isFavorite = data.isFavorite;
    var roleTypeId = data.user.roleTypeId;
    var relatedType = data.relatedType;
    var limitedAccess = data.modelLimitedAccess;
    var allAccess = data.modelAllAccess;
    var arr = [];
    
    var name = data.name;
    var namespace = data.namespace;

    var query = squel.select()
    					.field(ModelElementEntity.columns.id, "meId")
    					.field(ModelElementEntity.columns.name, "meName")
    					.field(ModelElementEntity.columns.relatedType)
    					.field(ModelElementEntity.columns.relatedTypeId)
    					.field(ModelElementEntity.columns.namespace, "meNamespace")
    					.field(CategoryEntity.columns.name, "assetCategoryName")
    					.field(CategoryEntity.columns.color, "assetCategoryColor")
    					.field(ClassEntity.columns.name, "assetClassName")
    					.field(ClassEntity.columns.color, "assetClassColor")
    					.field(SubClassEntity.columns.name, "assetSubClassName")
    					.field(SubClassEntity.columns.color, "assetSubClassColor")
    					.field(SecuritySetEntity.columns.name, "securitySetName")
    					.field(ModelElementEntity.columns.isFavorite)
    					.from(ModelElementEntity.tableName)
    					.left_join(CategoryEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, CategoryEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "CATEGORY")))
    					.left_join(ClassEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, ClassEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "CLASS")))
    					.left_join(SubClassEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, SubClassEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "SUBCLASS")))
    					.left_join(SecuritySetEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, SecuritySetEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "SECURITYSET")))
    
	query.where(squelUtils.eql(ModelElementEntity.columns.isDeleted, 0));
   
    
    if(id){
    	query.where(squelUtils.eql(ModelElementEntity.columns.id, id));
    }
     
	if(roleTypeId !== enums.roleType.FIRMADMIN){
        if(allAccess && allAccess.length ===0 && limitedAccess && limitedAccess.length > 0){
        	arr = limitedAccess;
        	var innerQuery = squel.select()
        							.field(ModelDetailEntity.columns.modelElementId)
        							.distinct()
        							.from(ModelDetailEntity.tableName)
        							.join(TeamModelAccessEntity.tableName, null,  
        									squel.expr()
        									.and(squelUtils.joinEql(TeamModelAccessEntity.columns.modelId, ModelDetailEntity.columns.modelId))
        									.and(squelUtils.in(TeamModelAccessEntity.columns.teamId, arr))
        									.and(squelUtils.eql(TeamModelAccessEntity.columns.isDeleted, 0)));
          query.where(squelUtils.in(ModelElementEntity.columns.id, innerQuery));
        }
    }
   
   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};



ModelDao.prototype.checkModelAccessToUser = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var limitedAccess = data.modelLimitedAccess;
    var modelId = data.id;
    
    var query = squel.select()
					   .from(TeamModelAccessEntity.tableName)  
					   .where(squelUtils.in(TeamModelAccessEntity.columns.teamId, limitedAccess))
					   .where(squelUtils.eql(TeamModelAccessEntity.columns.modelId, modelId))

   
   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.modelElementUsageInModelDetailAndTempModelDetail = function (data, cb) {
	
    var connection = baseDao.getConnection(data);

    var modelElementId = data.id;
    var modelId = data.modelId;
    
    var query = squel.select()
    				   .field(ModelDetailEntity.columns.modelId, "id")
					   .from(ModelDetailEntity.tableName)  
					   .where(squelUtils.in(ModelDetailEntity.columns.modelElementId, modelElementId))
					   .where(squelUtils.notEql(ModelDetailEntity.columns.modelId, modelId))
					   .where(squelUtils.eql(ModelDetailEntity.columns.isDeleted, 0))
					   .union(squel
							   .select()
							   .field(TempModelDetail.columns.modelId, "id")
							   .from(TempModelDetail.tableName)  
							   .where(squelUtils.in(TempModelDetail.columns.modelElementId, modelElementId))
							   .where(squelUtils.notEql(TempModelDetail.columns.modelId, modelId))
							   .where(squelUtils.eql(TempModelDetail.columns.isDeleted, 0)))
//					   .where(squelUtils.notEql(ModelDetailEntity.columns.isSubstituted, 1))

   
   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
    
};

ModelDao.prototype.getModelForModelElement = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var modelElementId = data.id;
    
    var query = squel.select()
    				   .field(ModelDetailEntity.columns.modelId)
    				   .field(ModelDetailEntity.columns.rightValue)
    				   .field(ModelDetailEntity.columns.leftValue)
    				   .field("count(*)", "count")
					   .from(squel.select()
							 .field(ModelDetailEntity.columns.modelId)
							 .field(ModelDetailEntity.columns.leftValue)
							 .field(ModelDetailEntity.columns.rightValue)
							 .from(ModelDetailEntity.tableName)
							 .join(squel.select()
									 .field(ModelDetailEntity.columns.modelId)
									 .field(ModelDetailEntity.columns.leftValue)
									 .field(ModelDetailEntity.columns.rightValue)
									 .from(ModelDetailEntity.tableName)
									 .where(squelUtils.in(ModelDetailEntity.columns.modelElementId, modelElementId))
									 .where(squelUtils.in(ModelDetailEntity.columns.isDeleted, 0))
								  , "md2",
								  squel.expr().and(squelUtils.joinEql(ModelDetailEntity.columns.modelId, "md2.modelId"))
								  			  .and(squelUtils.joinGtEql(ModelDetailEntity.columns.leftValue, "md2.leftValue"))
								  			  .and(squelUtils.joinLtEql(ModelDetailEntity.columns.rightValue, "md2.rightValue"))
							  ).group(ModelDetailEntity.columns.isSubstituted)
							  .group(ModelDetailEntity.columns.modelId),
							 ModelDetailEntity.tableName
					   ).group(ModelDetailEntity.columns.modelId)  

   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getLeftRightValueForModelWithModelElement = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var modelElementId = data.id;
    var modelId = data.modelId;
    
    var query = squel.select()
    				   .field(ModelDetailEntity.columns.modelId)
    				   .field(ModelDetailEntity.columns.rightValue)
    				   .field(ModelDetailEntity.columns.leftValue)
					   .from(ModelDetailEntity.tableName)
     				   .where(squelUtils.eql(ModelDetailEntity.columns.modelElementId, modelElementId))
     				   .where(squelUtils.eql(ModelDetailEntity.columns.modelId, modelId))
     				   .where(squelUtils.eql(ModelDetailEntity.columns.isDeleted, 0))  

   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getModelElement = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var modelElementId = data.id;
    
    var query = squel.select()
					   .from(ModelElementEntity.tableName)  
					   .where(squelUtils.in(ModelElementEntity.columns.id, modelElementId))
					   .where(squelUtils.eql(ModelElementEntity.columns.isDeleted, 0))
   
   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getSubModelStructureForModelElement = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var modelId = data.modelId;
    var leftValue = data.leftValue;
    var rightValue = data.rightValue;
    
     var query = squel.select()
    				   .field(ModelElementEntity.columns.id, "meId")
    				   .field(ModelElementEntity.columns.name, "meName")
    				   .field(ModelElementEntity.columns.namespace, "meNamespace")
    				   .field(ModelElementEntity.columns.relatedType, "relatedType")
    				   .field(ModelElementEntity.columns.relatedTypeId, "relatedTypeId")
    				   .field(ModelDetailEntity.columns.leftValue, "leftValue")  
    				   .field(ModelDetailEntity.columns.rightValue, "rightValue")
    				   .field(ModelDetailEntity.columns.targetPercent, "targetPercent")
    				   .field(ModelDetailEntity.columns.toleranceType, "toleranceType")
    				   .field(ModelDetailEntity.columns.toleranceTypeValue, "toleranceTypeValue")
    				   .field(ModelDetailEntity.columns.lowerModelTolerancePercent, "lowerModelTolerancePercent")
    				   .field(ModelDetailEntity.columns.upperModelTolerancePercent, "upperModelTolerancePercent")
    				   .field(ModelDetailEntity.columns.lowerModelToleranceAmount, "lowerModelToleranceAmount")
    				   .field(ModelDetailEntity.columns.upperModelToleranceAmount, "upperModelToleranceAmount")
    				   .field(ModelDetailEntity.columns.lowerTradeTolerancePercent, "lowerTradeTolerancePercent")
    				   .field(ModelDetailEntity.columns.upperTradeTolerancePercent, "upperTradeTolerancePercent")
    				   .field(ModelDetailEntity.columns.isSubstituted, "isSubstituted")
    				   .field(ModelDetailEntity.columns.substituteOf, "subsitutedOf")
    				   .field(ModelDetailEntity.columns.level, "level")
   					   .field(CategoryEntity.columns.name, "assetCategoryName")
    				   .field(CategoryEntity.columns.color, "assetCategoryColor")
    					.field(ClassEntity.columns.name, "assetClassName")
    					.field(ClassEntity.columns.color, "assetClassColor")
    					.field(SubClassEntity.columns.name, "assetSubClassName")
    					.field(SubClassEntity.columns.color, "assetSubClassColor")
    					.field(SecuritySetEntity.columns.name, "securitySetName")
					   .from(ModelDetailEntity.tableName)  
					   .join(ModelElementEntity.tableName, null, squelUtils.joinEql(ModelElementEntity.columns.id, ModelDetailEntity.columns.modelElementId))
					   .left_join(CategoryEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, CategoryEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "CATEGORY")))
    				   .left_join(ClassEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, ClassEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "CLASS")))
    				   .left_join(SubClassEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, SubClassEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "SUBCLASS")))
    				   .left_join(SecuritySetEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelElementEntity.columns.relatedTypeId, SecuritySetEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.relatedType, "SECURITYSET")))
					   .where(squelUtils.in(ModelDetailEntity.columns.modelId, modelId))
					   .where(squelUtils.gtEql(ModelDetailEntity.columns.leftValue, leftValue))
					   .where(squelUtils.ltEql(ModelDetailEntity.columns.rightValue, rightValue))
					   .order(ModelDetailEntity.columns.level);
   
   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.setUnsetFavoritesSubModel = function (data, cb) {
	
	 var self = this;
   var connection = baseDao.getConnection(data);

   var modelEntity = _.omit(data, ["reqId"]);
   
   var modelQuery = [];
   
   var id = data.id;
   var isFavorite = data.isFavorite;
   var updateEntity = {
   		isFavorite : isFavorite
   }
   
   modelQuery.push(" UPDATE " + tableNames[2] + " SET ? ");
   modelQuery.push(" WHERE id = ? ");
   
   modelQuery = modelQuery.join("");
   
   logger.debug(modelQuery);

   var queryString = connection.query(modelQuery,[updateEntity, id], function(err, data){
       cb(err, data);
   });
}

ModelDao.prototype.modelStatusToINACTIVEInBulk = function (data, cb) {
	
  var self = this;
  var connection = baseDao.getConnection(data);

  var modelEntity = _.omit(data, ["reqId"]);
  
  var modelQuery = [];
  
  var id = data.id;
  
  var updateEntity = {
  		statusId : data.statusId,
  		editedDate : data.editedDate,
  		editedBy : data.editedBy
  }
  
  modelQuery.push(" UPDATE " + tableNames[0] + " SET ? ");
  modelQuery.push(" WHERE id IN (?) ");
  
  modelQuery = modelQuery.join("");
  
  logger.debug(modelQuery);
  var queryStirng = connection.query(modelQuery,[updateEntity, id], function(err, data){
      cb(err, data);
  });
  
}

ModelDao.prototype.getLevelsInModel = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var modelId = data.id;
    
    var query = squel.select()
    				   .field(ModelElementEntity.columns.relatedType, "relatedType")
					   .from(ModelDetailEntity.tableName)  
					   .join(ModelElementEntity.tableName, null, squelUtils.joinEql(ModelElementEntity.columns.id, ModelDetailEntity.columns.modelElementId))
					   .where(squelUtils.in(ModelDetailEntity.columns.modelId, modelId))
					   .where(squelUtils.eql(ModelDetailEntity.columns.isDeleted, 0))
					   .group(ModelElementEntity.columns.relatedType);
   
   query = query.toString();
   
   logger.debug(query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};


ModelDao.prototype.getManagementStyleByName = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var name = data.name;
    
    var query = squel.select()
    				   .field(ManagementStyleEntity.columns.id, "id")
					   .from(ManagementStyleEntity.tableName)  
					   .where(squelUtils.eql(ManagementStyleEntity.columns.name, name))
   
   query = query.toString();
   
   logger.debug(query);
   var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.createManagementStyle = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var modelEntity = _.omit(data, ["reqId"]);
    
    var query = " INSERT INTO " + ManagementStyleEntity.tableName + " SET ? ";
   
   query = query.toString();
   
   var queryString = connection.query(query, [modelEntity], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getModelElementsForModel = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var modelEntity = _.omit(data, ["reqId"]);
    var query = squel.select()
    				.field(ModelDetailEntity.columns.id, "modelDetailId")
    				.field(ModelDetailEntity.columns.modelElementId, "modelElementId")
    				.field(ModelElementEntity.columns.relatedType, "modelTypeId")
    				.from(ModelDetailEntity.tableName)
    				.join(ModelElementEntity.tableName, null, squel.expr().and(squelUtils.joinEql(ModelDetailEntity.columns.modelElementId, ModelElementEntity.columns.id)).and(squelUtils.eql(ModelElementEntity.columns.isDeleted, 0)))
    				.where(squelUtils.eql(ModelDetailEntity.columns.modelId, data.modelId))
    				.where(squelUtils.eql(ModelDetailEntity.columns.isDeleted, 0))
    		
   query = query.toString();
   var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

module.exports = ModelDao;
