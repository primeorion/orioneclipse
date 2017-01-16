"use strict";

var moduleName = __filename;

var _ = require("lodash");

var cache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao');
var baseDao = require('dao/BaseDao');
var logger = require('helper/Logger')(moduleName);
var enums = require('config/constants/ApplicationEnum.js');


var ModelDao = function () { }

var tableNames = [
                   'model',
                   'modelDetails',
                   'modelElements'
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
    query.push(' SELECT m.id, m.name ');
    query.push(" ,(case when (m.createdBy = 0) THEN 'Advisor' ELSE 'Team' END) as source ");
    query.push(' ,m.isDeleted, m.createdDate as createdOn ');
    query.push(' ,usCreated.userLoginId as createdBy ');
    query.push(' ,m.editedDate as editedOn ');
    query.push(' ,usEdited.userLoginId as editedBy ');
    query.push(' FROM ' + tableNames[0] + ' AS m ');
    query.push(" left outer join user as usCreated on usCreated.id = m.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = m.editedBy ");
    if(roleTypeId !== enums.roleType.FIRMADMIN){
        if(allAccess && allAccess.length ===0 && limitedAccess && limitedAccess.length > 0){
        	arr = limitedAccess; 
        	query.push(' INNER JOIN teamModelAccess AS tma ON m.id = tma.modelId AND tma.teamId IN (?) AND tma.isDeleted = 0  '); 
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

    query.push(' AND m.isDeleted = 0 ');
   
    query = query.join("");
    logger.debug("Query: " + query);

    connection.query(query, [ arr ], function (err, data) {
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
    connection.query(query, [data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};


ModelDao.prototype.getModelIdsWithModelElements = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    
    var ids = data.id;
    
    var query = 'SELECT DISTINCT(modelId) as id FROM modelDetails WHERE modelElementId IN (?) AND isDeleted = 0 ';
    
    var queryString = connection.query(query, [ids], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getCompleteModelById = function (data, cb) {
	
    var connection = baseDao.getConnection(data);
    var id = data.id;
    var query = [];
	query.push(" SELECT "); 
	query.push("  m.id, m.name, m.status, m.description as description, m.ownerUserId, m.dynamicModel, m.isDeleted ");
	query.push(" ,m.createdDate, m.createdBy, m.editedDate, m.editedBy ");
	query.push(" ,md.modelElementId AS meId, md.leftValue AS meLeftValue, md.rightValue AS meRightValue, md.rank AS meRanking, md.level AS meLevel, md.isDeleted = 0 ");
	query.push(" ,me.name AS meName, me.relatedTypeId AS meRelatedTypeId ,md.targetPercent AS targetPercent, md.lowerModelTolerancePercent AS lowerModelTolerancePercent ");
	query.push(" ,md.upperModelTolerancePercent AS upperModelTolerancePercent, md.toleranceBand AS toleranceBand ");
	query.push(" ,md.lowerModelToleranceAmount AS lowerModelToleranceAmount, md.upperModelToleranceAmount AS upperModelToleranceAmount ");
	query.push(" ,md.lowerTradeTolerancePercent AS lowerTradeTolerancePercent, md.upperTradeTolerancePercent AS upperTradeTolerancePercent ");
	query.push(" ,me.relatedType AS meRelatedType, me.relatedTypeId AS meRelatedTypeId, me.validateTickerSet AS meValidateTickerSet ");
	query.push(" ,me.rebalancePriority AS meRebalancePriority ");
	query.push(" FROM " + tableNames[0] + " AS m LEFT JOIN " + tableNames[1] + " AS md ON m.id = md.modelId AND md.isDeleted = 0 "); 
	query.push(" LEFT JOIN " + tableNames[2] + " AS me ON md.modelElementId = me.id WHERE m.id = ? ");
	query.push(" ORDER BY md.level ");
	
	query = query.join("");
    var queryString = connection.query(query, id, function (err, data) {
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
    		status : data.status,
    		communityModelled : data.communityModelled,
    		description : data.description,
    		ownerUserId : data.ownerUserId,
    		scope : data.scope,
    		dynamicModel : data.dynamicModel,
    		tags : data.tags,
    		isSubsitutedForPortfolio : data.isSubsitutedForPortfolio,
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
    modelQuery.push(" INSERT INTO " + tableNames[1] + " (modelId, modelElementId, leftValue, rightValue, rank, level, isDeleted, targetPercent, toleranceBand, lowerModelTolerancePercent ");
    modelQuery.push(" ,upperModelTolerancePercent, lowerTradeTolerancePercent, upperTradeTolerancePercent, lowerModelToleranceAmount, upperModelToleranceAmount) VALUES ?");
    modelQuery.push(" ON DUPLICATE KEY UPDATE leftValue=VALUES(leftValue), rightValue=VALUES(rightValue), rank=VALUES(rank), level=VALUES(level), isDeleted=Values(isDeleted) ");
    modelQuery.push(" ,targetPercent=VALUES(targetPercent), toleranceBand=VALUES(toleranceBand), lowerModelTolerancePercent=VALUES(lowerModelTolerancePercent), upperModelTolerancePercent=VALUES(upperModelTolerancePercent) ");
    modelQuery.push(" ,lowerTradeTolerancePercent=VALUES(lowerTradeTolerancePercent), upperTradeTolerancePercent=VALUES(upperTradeTolerancePercent), lowerModelToleranceAmount=VALUES(lowerModelToleranceAmount), upperModelToleranceAmount=VALUES(upperModelToleranceAmount) ");
      
    modelQuery = modelQuery.join("");
    
    logger.debug(modelQuery);

    var queryString = connection.query(modelQuery,[modelEntity], function(err, data){
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
   
   if( idsNotToDelete && idsNotToDelete.length > 0 ){
	   modelQuery.push(" AND modelElementId NOT IN (?) ");
   }
   
   modelQuery = modelQuery.join("");
   
   logger.debug(modelQuery);

   var queryString = connection.query(modelQuery,[updateEntity, id, idsNotToDelete], function(err, data){
       cb(err, data);
   });
}

module.exports = ModelDao;
