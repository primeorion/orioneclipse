"use strict";

var moduleName = __filename;

var squel = require("squel");

var config = require('config');
var localCache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao');
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var squelUtils = require("service/util/SquelUtils.js");

var SecuritySetConverter = require("converter/security/SecuritySetConverter.js");
var SecuritySetEntity = require('entity/security/SecuritySet.js');
var SecurityTypeEntity = require('entity/security/SecurityType1.js');
var SecuritySetDetailEntity = require('entity/security/SecuritySetDetail.js');
var SecurityEquivalenceInSecuritySetEntity = require('entity/security/SecuritySetSecurityEquivalent.js');
var SecurityTLHInSecuritySetEntity = require('entity/security/SecuritySetSecurityTLH.js');
var SecurityEntity = require('entity/security/Security.js');
var SellPriorityEntity = require('entity/security/SellPriority.js');
var BuyPriorityEntity = require('entity/security/BuyPriority.js');
var ModelElement = require('entity/model/ModelElement1.js');
var UserEntity = require("entity/user/User.js");
var SecuritySetTeamFavorite = require("entity/security/SecuritySetTeamFavorite.js");
var utilService = new (require('service/util/UtilService'))();

var applicationEnum = config.applicationEnum;
var reverseSecuritySetToleranceType = applicationEnum.reverseSecuritySetToleranceType;
var roleType = applicationEnum.roleType;

var _ = require("lodash");

var SecuritySetDao = function(){
	
}

SecuritySetDao.prototype.getAllSecuritySets = function(data, cb){

      var connection = baseDao.getConnection(data);
      var roleTypeId = utilService.getRoleTypeId(data.user);
      var teams = utilService.getAllTeamsForUser(data.user);
      
      var securityQuery = squel.select()
      							.field(SecuritySetEntity.columns.id, 'id').distinct()
      							.field(SecuritySetEntity.columns.name, 'name').field(SecuritySetEntity.columns.description, 'description')
      							.field(SecuritySetEntity.columns.isDynamic, 'isDynamic')
      							.field(SecuritySetEntity.columns.isDeleted, 'isDeleted')
      					
      							if(roleTypeId == roleType["FIRMADMIN"]){
						securityQuery
      								.field(SecuritySetEntity.columns.isFavorite, "isFavorite")
      							}else{
						securityQuery
  									.field("CASE WHEN (" + SecuritySetTeamFavorite.columns.isFavorite + " IS NULL) THEN 0 ELSE " + SecuritySetTeamFavorite.columns.isFavorite + " END " , "isFavorite")
      							}
      							
						securityQuery
      							.field("CASE WHEN ( " + ModelElement.columns.id + " IS NULL) THEN 0 ELSE 1 END AS isModelAssigned")
      							.field("CASE WHEN ( " + SecuritySetEntity.columns.toleranceType + "  = 0) THEN '" + reverseSecuritySetToleranceType[0] + "' ELSE '" + reverseSecuritySetToleranceType[1] + "' END AS toleranceType" )
      							.field(SecuritySetEntity.columns.toleranceTypeValue, 'toleranceTypeValue')
      							.field(SecuritySetEntity.columns.createdDate, 'createdOn')
      							.field(UserEntity.usCreated.userLoginId, 'createdBy').field(UserEntity.usEdited.userLoginId, 'editedBy')
      							.field(SecuritySetEntity.columns.editedDate, 'editedOn')
      							.from(SecuritySetEntity.tableName)
      							.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(SecuritySetEntity.columns.createdBy, UserEntity.usCreated.id))
								.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(SecuritySetEntity.columns.editedBy, UserEntity.usEdited.id))
								.left_join(ModelElement.tableName, null, squel.expr().and(squelUtils.eql( ModelElement.columns.relatedType ,'SECURITYSET')).and(squelUtils.joinEql(ModelElement.columns.relatedTypeId, SecuritySetEntity.columns.id)).and(squelUtils.joinEql(ModelElement.columns.isDeleted, 0)))
							      
      
      var secondaryQuery = squel.expr();
      if(data.search){
    	  if(data.search.match(/^[0-9]+$/g)){
    		  secondaryQuery = secondaryQuery.and(squelUtils.eql(SecuritySetEntity.columns.id, data.search));
    	  }
    	  secondaryQuery = secondaryQuery.or(squelUtils.like(SecuritySetEntity.columns.name, data.search));
      }
      
    	  
	  if(roleTypeId != roleType["FIRMADMIN"]){    			  
		  securityQuery.left_join(SecuritySetTeamFavorite.tableName, null, squel.expr().and(squelUtils.joinEql( SecuritySetTeamFavorite.columns.securitySetId, SecuritySetEntity.columns.id)).and(squelUtils.in(SecuritySetTeamFavorite.columns.teamId, teams)))
	  }
	  
	  if(data.assetCategoryId || data.assetClassId || data.assetSubClassId){
		  securityQuery.join(SecuritySetDetailEntity.tableName, null, squel.expr().and(squelUtils.joinEql( SecuritySetEntity.columns.id, SecuritySetDetailEntity.columns.securitySetId))
				  																.and(squelUtils.in(SecuritySetDetailEntity.columns.isDeleted, 0)))
          securityQuery.join(SecurityEntity.tableName, null, squel.expr().and(squelUtils.joinEql( SecurityEntity.columns.id, SecuritySetDetailEntity.columns.securityId))
				  																.and(squelUtils.in(SecurityEntity.columns.isDeleted, 0)))
	  }

      securityQuery.where(squelUtils.eql(SecuritySetEntity.columns.isDeleted,0));
      securityQuery.where(secondaryQuery)
      
      if(data.assetCategoryId){    	  
    	  securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetCategoryId, data.assetCategoryId));
      }
      if(data.assetClassId){    	  
    	  securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetClassId, data.assetClassId));
      }
      if(data.assetSubClassId){    	  
    	  securityQuery.where(squelUtils.eql(SecurityEntity.columns.assetSubClassId, data.assetSubClassId));
      }
      
      if(data.search){    	  
    	  securityQuery.order(SecuritySetEntity.columns.name);
      }
      
      securityQuery = securityQuery.toString();
      
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, function(err, data) {
			cb(err, data);
		});
};

SecuritySetDao.prototype.sellPriorities = function (data, cb) {
    var connection = baseDao.getConnection(data);
    
    var query = squel.select()
    				 .from(SellPriorityEntity.tableName).toString();
    				 
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

SecuritySetDao.prototype.buyPriorities = function (data, cb) {
    var connection = baseDao.getConnection(data);
    
    var query = squel.select()
    				 .from(BuyPriorityEntity.tableName).toString();
    				 
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
  
SecuritySetDao.prototype.getSecuritiesInSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      
      var securityQuery = squel.select()
      							.field(SecuritySetDetailEntity.columns.securityId)
      							.from(SecuritySetDetailEntity.tableName)
      							.where(squelUtils.eql(SecuritySetDetailEntity.columns.securitySetId, securitySetId))
      							.where(squelUtils.eql(SecuritySetDetailEntity.columns.isDeleted, 0)).toString();
      							
      logger.debug(securityQuery);
		
      connection.query(securityQuery, securitySetId, function(err, data) {
			cb(err, data);
		});
};

SecuritySetDao.prototype.securitySetExistence = function(data, cb){

    var connection = baseDao.getConnection(data);
   
    var securitySetId = data.id;
    
    var securityQuery = squel.select()
    							.field(SecuritySetEntity.columns.id)
    							.field(SecuritySetEntity.columns.isDynamic)
    							.from(SecuritySetEntity.tableName)
    							.where(squelUtils.eql(SecuritySetEntity.columns.isDeleted, 0))
    							.where(squelUtils.in(SecuritySetEntity.columns.id, securitySetId)).toString();
    							

    logger.debug(securityQuery);
		
    if(securitySetId && securitySetId.length > 0){
		var queryString = connection.query(securityQuery, function(err, rs){
			cb(err, rs);
		});
	}else{
		cb(null, []);
	}
};
  
SecuritySetDao.prototype.getSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetEntity = SecuritySetConverter.getSecuritySetEntityFromSecuritySetRequest(data);
      
      var securitySetId = securitySetEntity[SecuritySetEntity.columns.id];
      
      var securityQuery = squel.select()
      							.field(SecuritySetEntity.columns.id, 'id')
      							.from(SecuritySetEntity.tableName)
      							.where(squelUtils.eql(SecuritySetEntity.columns.id, securitySetId))
      							.where(squelUtils.eql(SecuritySetEntity.columns.isDeleted, 0)).toString();
      
      logger.debug(securityQuery);
	
      if(securitySetId){
    	  var queryString = connection.query(securityQuery, securitySetId, function(err, data) {
    		  cb(err, data);
    	  });    	  
      }else{
    	  cb(null,[]);
      }
};
  
SecuritySetDao.prototype.createSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetEntity = SecuritySetConverter.getSecuritySetEntityFromSecuritySetRequest(data);
      
      var securityQuery = [];
      securityQuery.push(" INSERT INTO " + SecuritySetEntity.tableName + " SET ? ");
      // can work without this line
      securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, [securitySetEntity, securitySetEntity], function(err, data) {
			cb(err, data);
		});
      
};
  
SecuritySetDao.prototype.updateSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetEntity = SecuritySetConverter.getSecuritySetEntityFromSecuritySetRequest(data);
      
      var securitySetId = securitySetEntity[SecuritySetEntity.columns.id];

      var securitySet = {};
      securitySet[SecuritySetEntity.columns.name] = securitySetEntity[SecuritySetEntity.columns.name],
      securitySet[SecuritySetEntity.columns.description] = securitySetEntity[SecuritySetEntity.columns.description],
      securitySet[SecuritySetEntity.columns.isDynamic] = securitySetEntity[SecuritySetEntity.columns.isDynamic],
      securitySet[SecuritySetEntity.columns.toleranceType] = securitySetEntity[SecuritySetEntity.columns.toleranceType],
      securitySet[SecuritySetEntity.columns.toleranceTypeValue] = securitySetEntity[SecuritySetEntity.columns.toleranceTypeValue],
      securitySet[SecuritySetEntity.columns.editedBy] = securitySetEntity[SecuritySetEntity.columns.editedBy],
      securitySet[SecuritySetEntity.columns.editedDate] = securitySetEntity[SecuritySetEntity.columns.editedDate];

      var securityQuery = [];

      securityQuery.push(" UPDATE " + SecuritySetEntity.tableName + " SET ? WHERE "+SecuritySetEntity.columns.id+" = ? AND "+SecuritySetEntity.columns.isDeleted+" = 0 ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securitySetEntity, securitySetId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.deleteSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);

      var securitySet = SecuritySetConverter.getSecuritySetEntityFromSecuritySetRequest(data);
      var securitySetId = securitySet[SecuritySetEntity.columns.id];
      
      var securitySetEntity = {};
      securitySetEntity[SecuritySetEntity.columns.isDeleted] = 1;
      securitySetEntity[SecuritySetEntity.columns.editedBy] = securitySet[SecuritySetEntity.columns.editedBy];
      securitySetEntity[SecuritySetEntity.columns.editedDate] = securitySet[SecuritySetEntity.columns.editedDate];
     
      var securityQuery = [];

      securityQuery.push(" UPDATE " + SecuritySetEntity.tableName + " SET ? WHERE "+SecuritySetEntity.columns.id+" = ? AND "+SecuritySetEntity.columns.isDeleted+" = 0 ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securitySetEntity, securitySetId], function(err, data) {
			cb(err, data);
		});
};

  
SecuritySetDao.prototype.getSecuritySetDetail = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetEntity = SecuritySetConverter.getSecuritySetDetailEntityFromSecuritySetModel(data);
      
      var securitySetId = securitySetEntity[SecuritySetDetailEntity.columns.securitySetId];
      var securityId = securitySetEntity[SecuritySetDetailEntity.columns.securityId];

      var securityQuery = squel.select()
								.field(SecuritySetDetailEntity.columns.securitySetId)
								.from(SecuritySetDetailEntity.tableName)
								.where(squelUtils.eql(SecuritySetDetailEntity.columns.securitySetId, securitySetId))
								.where(squelUtils.eql(SecuritySetDetailEntity.columns.securityId, securityId))
								.where(squelUtils.eql(SecuritySetDetailEntity.columns.isDeleted, 0)).toString();

      logger.debug(securityQuery);

      var queryString = connection.query(securityQuery, [securitySetId, securityId], function(err, data) {
			cb(err, data);
	  });
};
  
SecuritySetDao.prototype.createSecuritySetDetail = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetDetailEntity = SecuritySetConverter.getSecuritySetDetailEntityFromSecuritySetModel(data);
      
      var securityQuery = [];
      
      securityQuery.push(" INSERT INTO " + SecuritySetDetailEntity.tableName + " SET ? ");
      securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
      
      var queryString = connection.query(securityQuery, [securitySetDetailEntity, securitySetDetailEntity], function(err, data) {
			cb(err, data);
	  });
};
  
SecuritySetDao.prototype.updateSecuritySetDetail = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetDetailEntity = SecuritySetConverter.getSecuritySetDetailEntityFromSecuritySetModel(data);
      
      var securitySetId = securitySetDetailEntity[SecuritySetDetailEntity.columns.securitySetId];
      var securityId = securitySetDetailEntity[SecuritySetDetailEntity.columns.securityId];
      
      var securityQuery = [];
      
      var securityDetailEntity = {};
      securityDetailEntity[SecuritySetDetailEntity.columns.rank] = securitySetDetailEntity[SecuritySetDetailEntity.columns.rank],
	  securityDetailEntity[SecuritySetDetailEntity.columns.targetPercent] = securitySetDetailEntity[SecuritySetDetailEntity.columns.targetPercent],
	  securityDetailEntity[SecuritySetDetailEntity.columns.lowerModelTolerancePercent] = securitySetDetailEntity[SecuritySetDetailEntity.columns.lowerModelTolerancePercent],
	  securityDetailEntity[SecuritySetDetailEntity.columns.upperModelTolerancePercent] = securitySetDetailEntity[SecuritySetDetailEntity.columns.upperModelTolerancePercent],
	  securityDetailEntity[SecuritySetDetailEntity.columns.lowerModelToleranceAmount] = securitySetDetailEntity[SecuritySetDetailEntity.columns.lowerModelToleranceAmount],
	  securityDetailEntity[SecuritySetDetailEntity.columns.upperModelToleranceAmount] = securitySetDetailEntity[SecuritySetDetailEntity.columns.upperModelToleranceAmount],
	  securityDetailEntity[SecuritySetDetailEntity.columns.taxableSecurityId] = securitySetDetailEntity[SecuritySetDetailEntity.columns.taxableSecurityId], 
      securityDetailEntity[SecuritySetDetailEntity.columns.taxDeferredSecurityId] = securitySetDetailEntity[SecuritySetDetailEntity.columns.taxDeferredSecurityId],
 	  securityDetailEntity[SecuritySetDetailEntity.columns.taxExemptSecurityId] = securitySetDetailEntity[SecuritySetDetailEntity.columns.taxExemptSecurityId],
	  securityDetailEntity[SecuritySetDetailEntity.columns.minTradeAmount] = securitySetDetailEntity[SecuritySetDetailEntity.columns.minTradeAmount],
	  securityDetailEntity[SecuritySetDetailEntity.columns.minInitialBuyDollar] = securitySetDetailEntity[SecuritySetDetailEntity.columns.minInitialBuyDollar],
	  securityDetailEntity[SecuritySetDetailEntity.columns.buyPriority] = securitySetDetailEntity[SecuritySetDetailEntity.columns.buyPriority],
	  securityDetailEntity[SecuritySetDetailEntity.columns.sellPriority] = securitySetDetailEntity[SecuritySetDetailEntity.columns.sellPriority],
	  securityDetailEntity[SecuritySetDetailEntity.columns.editedBy] = securitySetDetailEntity[SecuritySetDetailEntity.columns.editedBy],
	  securityDetailEntity[SecuritySetDetailEntity.columns.editedDate] = securitySetDetailEntity[SecuritySetDetailEntity.columns.editedDate]
      
      securityQuery.push(" UPDATE " + SecuritySetDetailEntity.tableName + " SET ? WHERE "+SecuritySetDetailEntity.columns.securitySetId+" = ? AND "+SecuritySetDetailEntity.columns.securityId+" = ?  AND "+SecuritySetDetailEntity.columns.isDeleted+" = 0 ");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securityDetailEntity, securitySetId, securityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.deleteSecuritySetDetail = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySet = SecuritySetConverter.getSecuritySetDetailEntityFromSecuritySetModel(data);
      
      var securitySetId = securitySet[SecuritySetDetailEntity.columns.securitySetId];
      
      var securitySetEntity = {};
      securitySetEntity[SecuritySetDetailEntity.columns.isDeleted] = 1,
      securitySetEntity[SecuritySetDetailEntity.columns.editedBy] = securitySet[SecuritySetDetailEntity.columns.editedBy],
      securitySetEntity[SecuritySetDetailEntity.columns.editedDate] = securitySet[SecuritySetDetailEntity.columns.editedDate]
      
      var idsNotToDelete = data.idsNotToDelete;
      var securityQuery = [];
      
      securityQuery.push(" UPDATE " + SecuritySetDetailEntity.tableName + " SET ? WHERE "+SecuritySetDetailEntity.columns.securitySetId+" = ? ");
      
      if(idsNotToDelete && idsNotToDelete.length > 0){
    	  securityQuery.push(" AND "+SecuritySetDetailEntity.columns.securityId+" NOT IN (?) ");
      }
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, [securitySetEntity, securitySetId, idsNotToDelete], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.getSecuritySetSecuritiesIdsToDelete = function(data, cb){

      var connection = baseDao.getConnection(data);
      
      var securitySetEntity = SecuritySetConverter.getSecuritySetDetailEntityFromSecuritySetModel(data);
      var securitySetId = securitySetEntity[SecuritySetDetailEntity.columns.securitySetId];

      var idsNotToDelete = data.idsNotToDelete;
      
      var securityQuery = squel.select()
								.field(SecuritySetDetailEntity.columns.securityId)
								.from(SecuritySetDetailEntity.tableName)
								.where(squelUtils.eql(SecuritySetDetailEntity.columns.securitySetId, securitySetId))
      
      if(idsNotToDelete && idsNotToDelete.length > 0){
    	  securityQuery = securityQuery.where(squelUtils.notIn(SecuritySetDetailEntity.columns.securityId, idsNotToDelete));
      }

      
      securityQuery = securityQuery.toString();
      
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, [securitySetId, idsNotToDelete], function(err, data) {	
    	    if(err){
    	    	cb(err, data);    	    	
    	    }else{
    	    	var securityIdsToDelete = [];
    	    	if(data){
    	    		data.forEach(function(value){
    	    			securityIdsToDelete.push(value.securityId);
    	    		});
    	    		cb(null, securityIdsToDelete);
    	    	}
    	    }
		});
};
  
SecuritySetDao.prototype.getEquivalentSecuritiesInSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetEntity = SecuritySetConverter.getSecuritySetDetailEquivalentEntityFromSecuritySetSecurityRequest(data);
      
      var securitySetId = securitySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.securitySetId];
      var securityId = securitySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.securityId];
      var equivalentSecurityId = securitySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId];
      
      var securityQuery = squel.select()
								.field(SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId)
								.from(SecurityEquivalenceInSecuritySetEntity.tableName)
								.where(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.securitySetId, securitySetId))
								.where(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.securityId, securitySetId))
								.where(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId, equivalentSecurityId))
								.where(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.isDeleted, 0)).toString();
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securitySetId, securitySetId, equivalentSecurityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.createSecuritySetEquivalence = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var equivalenceSecuritySetEntity = SecuritySetConverter.getSecuritySetDetailEquivalentEntityFromSecuritySetSecurityRequest(data);
  
      var securityQuery = [];
      
      securityQuery.push(" INSERT INTO " + SecurityEquivalenceInSecuritySetEntity.tableName + " SET ? ");
      securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, [equivalenceSecuritySetEntity, equivalenceSecuritySetEntity], function(err, data) {
    	  console.log(queryString);
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.updateSecuritySetEquivalence = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var equivalenceSecuritySetEntity = SecuritySetConverter.getSecuritySetDetailEquivalentEntityFromSecuritySetSecurityRequest(data);
      
      var securitySetId = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.securitySetId];
      var securityId = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.securityId];
      var equivalentSecurityId = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId];
      
      var securityQuery = [];

      var securityDetailEntity = {};
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.rank] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.rank],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.taxableSecurityId] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.taxableSecurityId],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.taxDeferredSecurityId] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.taxDeferredSecurityId],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.taxExemptSecurityId] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.taxExemptSecurityId],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.minTradeAmount] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.minTradeAmount],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.minInitialBuyDollar] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.minInitialBuyDollar],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.buyPriority] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.buyPriority],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.sellPriority] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.sellPriority],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.editedBy] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.editedBy],
      securityDetailEntity[SecurityEquivalenceInSecuritySetEntity.columns.editedDate] = equivalenceSecuritySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.editedDate]
      
      securityQuery.push(" UPDATE " + SecurityEquivalenceInSecuritySetEntity.tableName + " SET ? WHERE "+SecurityEquivalenceInSecuritySetEntity.columns.securitySetId+" = ? AND "+SecurityEquivalenceInSecuritySetEntity.columns.securityId+" = ? AND "+SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId+" = ? AND "+SecurityEquivalenceInSecuritySetEntity.columns.isDeleted+" = 0 ");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securityDetailEntity, securitySetId, securityId, equivalentSecurityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.deleteSecuritySetEquivalence = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetEquivalenceEntity = SecuritySetConverter.getSecuritySetDetailEquivalentEntityFromSecuritySetSecurityRequest(data);
      
      var securitySetId = securitySetEquivalenceEntity[SecurityEquivalenceInSecuritySetEntity.columns.securitySetId];
      var securityId = securitySetEquivalenceEntity[SecurityEquivalenceInSecuritySetEntity.columns.securityId];
      
      if(data.securityIdsToDelete){
    	  securityId = data.securityIdsToDelete;
      }
      
      var securitySetEntity = {};
      
      securitySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.isDeleted] = 1;
      securitySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.editedBy] = securitySetEquivalenceEntity[SecurityEquivalenceInSecuritySetEntity.columns.editedBy];
      securitySetEntity[SecurityEquivalenceInSecuritySetEntity.columns.editedDate] = securitySetEquivalenceEntity[SecurityEquivalenceInSecuritySetEntity.columns.editedDate];
    	
      var idsNotToDelete = data.equivalencesNotToRemove;
      var securityQuery = [];

      securityQuery.push(" UPDATE " + SecurityEquivalenceInSecuritySetEntity.tableName + " SET ? WHERE "+SecurityEquivalenceInSecuritySetEntity.columns.securitySetId+" = ? AND "+SecurityEquivalenceInSecuritySetEntity.columns.isDeleted+" = 0 ");
      
      if(data.idsNotToDelete){
    	  securityId = data.idsNotToDelete;
    	  securityQuery.push(" AND "+SecurityEquivalenceInSecuritySetEntity.columns.securityId+" NOT IN (?) ");
      }else{
    	  securityQuery.push(" AND "+SecurityEquivalenceInSecuritySetEntity.columns.securityId+" IN (?) ");    	  
      }
      
      if(idsNotToDelete && idsNotToDelete.length > 0){
    	  securityQuery.push(" AND "+SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId+" NOT IN (?) ");
      }
      
      securityQuery = securityQuery.join("");
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, [securitySetEntity, securitySetId, securityId, idsNotToDelete], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.getTLHSecuritiesInSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetEntity = SecuritySetConverter.getSecuritySetDetailTLHEntityFromSecuritySetSecurityRequest(data);
      
      var securitySetId = securitySetEntity[SecurityTLHInSecuritySetEntity.columns.securitySetId];
      var securityId = securitySetEntity[SecurityTLHInSecuritySetEntity.columns.securityId];
      var tlhSecurityId = securitySetEntity[SecurityTLHInSecuritySetEntity.columns.tlhSecurityId];
      
      var securityQuery = squel.select()
								.field(SecurityTLHInSecuritySetEntity.columns.tlhSecurityId)
								.from(SecurityTLHInSecuritySetEntity.tableName)
								.where(squelUtils.eql(SecurityTLHInSecuritySetEntity.columns.securitySetId, securitySetId))
								.where(squelUtils.eql(SecurityTLHInSecuritySetEntity.columns.securityId, securitySetId))
								.where(squelUtils.eql(SecurityTLHInSecuritySetEntity.columns.tlhSecurityId, tlhSecurityId))
								.where(squelUtils.eql(SecurityTLHInSecuritySetEntity.columns.isDeleted, 0)).toString();

      logger.debug(securityQuery);

      connection.query(securityQuery, [securitySetId, securityId, tlhSecurityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.createSecuritySetTLH = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var tlhSecuritySetEntity = SecuritySetConverter.getSecuritySetDetailTLHEntityFromSecuritySetSecurityRequest(data);
      
      var securityQuery = [];
      
      securityQuery.push(" INSERT INTO " + SecurityTLHInSecuritySetEntity.tableName + " SET ? ");
      securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [tlhSecuritySetEntity, tlhSecuritySetEntity], function(err, data) {
			cb(err, data);
		});
};

SecuritySetDao.prototype.createSecuritySetFavoriteForTeams = function(data, cb){

    var connection = baseDao.getConnection(data);
   
    var tlhSecuritySetEntity = SecuritySetConverter.getSecuritySetDetailTLHEntityFromSecuritySetSecurityRequest(data);
    
    var securityQuery = [];
    
    securityQuery.push(" INSERT INTO " + SecurityTLHInSecuritySetEntity.tableName + " SET ? ");
    securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
    
    securityQuery = securityQuery.join("");
    
    logger.debug(securityQuery);
		
    connection.query(securityQuery, [tlhSecuritySetEntity, tlhSecuritySetEntity], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.updateSecuritySetTLH = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var tlhSecuritySetEntity = SecuritySetConverter.getSecuritySetDetailTLHEntityFromSecuritySetSecurityRequest(data);
      
      var securitySetId = tlhSecuritySetEntity[SecurityTLHInSecuritySetEntity.columns.securitySetId];
      var securityId = tlhSecuritySetEntity[SecurityTLHInSecuritySetEntity.columns.securityId];
      var tlhSecurityId = tlhSecuritySetEntity[SecurityTLHInSecuritySetEntity.columns.tlhSecurityId];
      
      var securityQuery = [];

      var securityDetailEntity = {};
      securityDetailEntity[SecurityTLHInSecuritySetEntity.columns.priority] = tlhSecuritySetEntity[SecurityTLHInSecuritySetEntity.columns.priority],
      securityDetailEntity[SecurityTLHInSecuritySetEntity.columns.editedBy] = tlhSecuritySetEntity[SecurityTLHInSecuritySetEntity.columns.editedBy],
      securityDetailEntity[SecurityTLHInSecuritySetEntity.columns.editedDate] = tlhSecuritySetEntity[SecurityTLHInSecuritySetEntity.columns.editedDate]
      
      
      securityQuery.push(" UPDATE " + SecurityTLHInSecuritySetEntity.tableName + " SET ? WHERE "+SecurityTLHInSecuritySetEntity.columns.securitySetId+" = ? AND "+SecurityTLHInSecuritySetEntity.columns.securityId+" = ? AND "+SecurityTLHInSecuritySetEntity.columns.tlhSecurityId+" = ? AND "+SecurityTLHInSecuritySetEntity.columns.isDeleted+" = 0 ");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securityDetailEntity, securitySetId, securityId, tlhSecurityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.deleteSecuritySetTLH = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetTLHEntity = SecuritySetConverter.getSecuritySetDetailTLHEntityFromSecuritySetSecurityRequest(data);
      
      var securitySetId = securitySetTLHEntity[SecurityTLHInSecuritySetEntity.columns.securitySetId];
      var securityId = securitySetTLHEntity[SecurityTLHInSecuritySetEntity.columns.securityId];
      
      if(data.securityIdsToDelete){
    	  securityId = data.securityIdsToDelete;
      }
      
      var securitySetEntity = {};
      securitySetEntity[SecurityTLHInSecuritySetEntity.columns.isDeleted] = 1;
      securitySetEntity[SecurityTLHInSecuritySetEntity.columns.editedBy] = securitySetTLHEntity[SecurityTLHInSecuritySetEntity.columns.editedBy];
      securitySetEntity[SecurityTLHInSecuritySetEntity.columns.editedDate] = securitySetTLHEntity[SecurityTLHInSecuritySetEntity.columns.editedDate];
    	
      var idsNotToDelete = data.tlhNotToRemove;
      var securityQuery = [];
      securityQuery.push(" UPDATE " + SecurityTLHInSecuritySetEntity.tableName + " SET ? WHERE "+SecurityTLHInSecuritySetEntity.columns.securitySetId+" = ? AND "+SecurityTLHInSecuritySetEntity.columns.isDeleted+" = 0 ");
      
      if(data.idsNotToDelete){
    	  securityId = data.idsNotToDelete;
    	  securityQuery.push(" AND "+SecurityTLHInSecuritySetEntity.columns.securityId+" NOT IN (?) ");
      }else{
    	  securityQuery.push(" AND "+SecurityTLHInSecuritySetEntity.columns.securityId+" IN (?) ");    	  
      }
      
      if(idsNotToDelete && idsNotToDelete.length > 0){
    	  securityQuery.push(" AND "+SecurityTLHInSecuritySetEntity.columns.tlhSecurityId+" NOT IN (?) ");
      }
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securitySetEntity, securitySetId, securityId, idsNotToDelete], function(err, data) {
			cb(err, data);
		});
};

SecuritySetDao.prototype.getDetailedSecuritySetById = function(reqData, cb){

      var connection = baseDao.getConnection(reqData);
      var securitySetId = reqData.id;

      var securityQuery = squel.select()
      							.field(SecuritySetEntity.columns.id, 'id').distinct()
      							.field(SecuritySetEntity.columns.name, 'name').field(SecuritySetEntity.columns.description, 'description')
								.field(SecuritySetEntity.columns.isDynamic, 'isDynamic')
								.field(SecuritySetEntity.columns.isDeleted, 'isDeleted')
								.field("CASE WHEN ( " + SecuritySetEntity.columns.toleranceType + "  = 0) THEN '" + reverseSecuritySetToleranceType[0] + "' ELSE '" + reverseSecuritySetToleranceType[1] + "' END AS toleranceType" )
      							.field(SecuritySetEntity.columns.toleranceTypeValue, 'toleranceTypeValue')
      							.field(SecuritySetEntity.columns.createdDate, 'createdOn')
      							.field(UserEntity.usCreated.userLoginId, 'createdBy').field(UserEntity.usEdited.userLoginId, 'editedBy')
      							.field(SecuritySetEntity.columns.editedDate, 'editedOn')
      							.field(SecuritySetDetailEntity.columns.securityId, 'securityId')
      							.field(SecurityEntity.columns.name, 'securityName')
      							.field(SecurityEntity.columns.symbol, 'securitySymbol')
      							.field(SecurityEntity.columns.securityTypeId, 'securityTypeId')
      							.field(SecurityTypeEntity.columns.name, 'securityType')
      							.field(SecuritySetDetailEntity.columns.rank, 'rank')
      							.field(SecuritySetDetailEntity.columns.targetPercent, 'targetPercent')
      							.field(SecuritySetDetailEntity.columns.lowerModelTolerancePercent, 'lowerModelTolerancePercent')
      							.field(SecuritySetDetailEntity.columns.upperModelTolerancePercent, 'upperModelTolerancePercent')
      							.field(SecuritySetDetailEntity.columns.lowerModelToleranceAmount, 'lowerModelToleranceAmount')
      							.field(SecuritySetDetailEntity.columns.upperModelToleranceAmount, 'upperModelToleranceAmount')
      							.field(SecuritySetDetailEntity.columns.taxableSecurityId, 'taxableSecurityId')
      							.field(SecurityEntity.alias('s6', 'name'), 'taxableSecurityName')
      							.field(SecurityEntity.alias('s6', 'symbol'), 'taxableSecuritySymbol')
      							.field(SecurityEntity.alias('s6', 'securityTypeId'), 'taxableSecurityTypeId')
      							.field(SecurityTypeEntity.alias('st6', 'name'), 'taxableSecurityType')
      							.field(SecuritySetDetailEntity.columns.taxDeferredSecurityId, 'taxDeferredSecurityId')
      							.field(SecurityEntity.alias('s7', 'name'), 'taxDeferredSecurityName')
      							.field(SecurityEntity.alias('s7', 'symbol'), 'taxDeferredSecuritySymbol')
      							.field(SecurityEntity.alias('s7', 'securityTypeId'), 'taxDeferredSecurityTypeId')
      							.field(SecurityTypeEntity.alias('st7', 'name'), 'taxDeferredSecurityType')
      							.field(SecuritySetDetailEntity.columns.taxExemptSecurityId, 'taxExemptSecurityId')
      							.field(SecurityEntity.alias('s8', 'name'), 'taxExemptSecurityName')
      							.field(SecurityEntity.alias('s8', 'symbol'), 'taxExemptSecuritySymbol')
      							.field(SecurityEntity.alias('s8', 'securityTypeId'), 'taxExemptSecurityTypeId')
      							.field(SecurityTypeEntity.alias('st8', 'name'), 'taxExemptSecurityType')
      							.field(SecuritySetDetailEntity.columns.minTradeAmount, 'minTradeAmount')
      							.field(SecuritySetDetailEntity.columns.minInitialBuyDollar, 'minInitialBuyDollar')
      							.field(SecuritySetDetailEntity.columns.buyPriority, 'buyPriorityId')
      							.field(BuyPriorityEntity.columns.displayName, 'buyPriorityDisplayName')
      							.field(SecuritySetDetailEntity.columns.sellPriority, 'sellPriorityId')
      							.field(SellPriorityEntity.columns.displayName, 'sellPriorityDisplayName')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId, 'equivalentSecurityId')
      							.field(SecurityEntity.alias('s2', 'name'), 'equivalenceSecurityName')
      							.field(SecurityEntity.alias('s2', 'symbol'), 'equivalenceSecuritySymbol')
      							.field(SecurityEntity.alias('s2', 'securityTypeId'), 'equivalenceSecurityTypeId')
      							.field(SecurityTypeEntity.alias('st2', 'name'), 'equivalenceSecurityType')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.taxableSecurityId, 'tEquivalenceSecurityId')
      							.field(SecurityEntity.alias('s3', 'name'), 'tEquivalenceSecurityName')
      							.field(SecurityEntity.alias('s3', 'symbol'), 'tEquivalenceSecuritySymbol')
      							.field(SecurityEntity.alias('s3', 'securityTypeId'), 'tEquivalenceSecurityTypeId')
      							.field(SecurityTypeEntity.alias('st3', 'name'), 'tEquivalenceSecurityType')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.taxDeferredSecurityId, 'tdEquivalenceSecurityId')
      							.field(SecurityEntity.alias('s4', 'name'), 'tdEquivalenceSecurityName')
      							.field(SecurityEntity.alias('s4', 'symbol'), 'tdEquivalenceSecuritySymbol')
      							.field(SecurityEntity.alias('s4', 'securityTypeId'), 'tdEquivalenceSecurityTypeId')
      							.field(SecurityTypeEntity.alias('st4', 'name'), 'tdEquivalenceSecurityType')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.taxExemptSecurityId, 'teEquivalenceSecurityId')
      							.field(SecurityEntity.alias('s5', 'name'), 'teEquivalenceSecurityName')
      							.field(SecurityEntity.alias('s5', 'symbol'), 'teEquivalenceSecuritySymbol')
      							.field(SecurityEntity.alias('s5', 'securityTypeId'), 'teEquivalenceSecurityTypeId')
      							.field(SecurityTypeEntity.alias('st5', 'name'), 'teEquivalenceSecurityType')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.minTradeAmount, 'equivalenceMinTradeAmount')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.minInitialBuyDollar, 'equivalenceMinInitialBuyDollar')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.buyPriority, 'equivalenceBuyPriorityId')
      							.field(BuyPriorityEntity.alias('ebp', 'displayName'), 'equivalenceBuyPriorityDisplayName')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.sellPriority, 'equivalenceSellPriorityId')
      							.field(SellPriorityEntity.alias('esp', 'displayName'), 'equivalenceSellPriorityDisplayName')
      							.field(SecurityEquivalenceInSecuritySetEntity.columns.rank, 'equivalenceRank')
      							.from(SecuritySetEntity.tableName)
      							.join(UserEntity.tableName, UserEntity.usCreated.alias, squelUtils.joinEql(SecuritySetEntity.columns.createdBy, UserEntity.usCreated.id))
								.join(UserEntity.tableName, UserEntity.usEdited.alias, squelUtils.joinEql(SecuritySetEntity.columns.editedBy, UserEntity.usEdited.id))
								.left_join(SecuritySetDetailEntity.tableName, null, 
										squel.expr()
												.and(squelUtils.joinEql(SecuritySetDetailEntity.columns.securitySetId, securitySetId))
												.and(squelUtils.joinEql(SecuritySetDetailEntity.columns.isDeleted, 0)))
								.left_join(SellPriorityEntity.tableName, null, squelUtils.joinEql(SellPriorityEntity.columns.id, SecuritySetDetailEntity.columns.sellPriority))
								.left_join(BuyPriorityEntity.tableName, null, squelUtils.joinEql(BuyPriorityEntity.columns.id, SecuritySetDetailEntity.columns.buyPriority))
								.left_join(SecurityEntity.tableName, null, squelUtils.joinEql(SecuritySetDetailEntity.columns.securityId, SecurityEntity.columns.id))
								.left_join(SecurityTypeEntity.tableName, null, squelUtils.joinEql(SecurityEntity.columns.securityTypeId, SecurityTypeEntity.columns.id))
								.left_join(SecurityEntity.tableName, 's6', squelUtils.joinEql(SecuritySetDetailEntity.columns.taxableSecurityId, SecurityEntity.alias('s6', 'id')))
								.left_join(SecurityTypeEntity.tableName, 'st6', squelUtils.joinEql(SecurityEntity.alias('s6', 'securityTypeId'), SecurityTypeEntity.alias('st6', 'id')))
								.left_join(SecurityEntity.tableName, 's7', squelUtils.joinEql(SecuritySetDetailEntity.columns.taxDeferredSecurityId, SecurityEntity.alias('s7', 'id')))
								.left_join(SecurityTypeEntity.tableName, 'st7', squelUtils.joinEql(SecurityEntity.alias('s7', 'securityTypeId'), SecurityTypeEntity.alias('st7', 'id')))
								.left_join(SecurityEntity.tableName, 's8', squelUtils.joinEql(SecuritySetDetailEntity.columns.taxExemptSecurityId, SecurityEntity.alias('s8', 'id')))
								.left_join(SecurityTypeEntity.tableName, 'st8', squelUtils.joinEql(SecurityEntity.alias('s8', 'securityTypeId'), SecurityTypeEntity.alias('st8', 'id')))
								.left_join(SecurityEquivalenceInSecuritySetEntity.tableName, null, 
										squel.expr()
										.and(squelUtils.joinEql(SecuritySetDetailEntity.columns.securityId, SecurityEquivalenceInSecuritySetEntity.columns.securityId))
										.and(squelUtils.joinEql(SecurityEquivalenceInSecuritySetEntity.columns.securitySetId, securitySetId))
										.and(squelUtils.joinEql(SecurityEquivalenceInSecuritySetEntity.columns.isDeleted, 0)))
								.left_join(SellPriorityEntity.tableName, 'esp' ,squelUtils.joinEql(SellPriorityEntity.alias('esp', 'id'), SecurityEquivalenceInSecuritySetEntity.columns.sellPriority))
								.left_join(BuyPriorityEntity.tableName, 'ebp', squelUtils.joinEql(BuyPriorityEntity.alias('ebp', 'id'), SecurityEquivalenceInSecuritySetEntity.columns.buyPriority))
								.left_join(SecurityEntity.tableName, 's2', squelUtils.joinEql(SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId, SecurityEntity.alias('s2', 'id')))
								.left_join(SecurityTypeEntity.tableName, 'st2', squelUtils.joinEql(SecurityEntity.alias('s2', 'securityTypeId'), SecurityTypeEntity.alias('st2', 'id')))
								.left_join(SecurityEntity.tableName, 's3', squelUtils.joinEql(SecurityEquivalenceInSecuritySetEntity.columns.taxableSecurityId, SecurityEntity.alias('s3', 'id')))
								.left_join(SecurityTypeEntity.tableName, 'st3', squelUtils.joinEql(SecurityEntity.alias('s3', 'securityTypeId'), SecurityTypeEntity.alias('st3', 'id')))
								.left_join(SecurityEntity.tableName, 's4', squelUtils.joinEql(SecurityEquivalenceInSecuritySetEntity.columns.taxDeferredSecurityId, SecurityEntity.alias('s4', 'id')))
								.left_join(SecurityTypeEntity.tableName, 'st4', squelUtils.joinEql(SecurityEntity.alias('s4', 'securityTypeId'), SecurityTypeEntity.alias('st4', 'id')))
								.left_join(SecurityEntity.tableName, 's5', squelUtils.joinEql(SecurityEquivalenceInSecuritySetEntity.columns.taxExemptSecurityId, SecurityEntity.alias('s5', 'id')))
								.left_join(SecurityTypeEntity.tableName, 'st5', squelUtils.joinEql(SecurityEntity.alias('s5', 'securityTypeId'), SecurityTypeEntity.alias('st5', 'id')))
								.where(squelUtils.eql(SecuritySetEntity.columns.id, securitySetId))
								.where(squelUtils.eql(SecuritySetEntity.columns.isDeleted, 0)).toString();
	  
	  
	  var securitySetTLHQuery = squel.select()
	  								.field(SecuritySetEntity.columns.id, 'id')
	  								.field(SecuritySetEntity.columns.name, 'name')
	  								.field(SecuritySetDetailEntity.columns.securityId, 'securityId')
	  								.field(SecurityTLHInSecuritySetEntity.columns.priority, 'priority')
	  								.field(SecurityTLHInSecuritySetEntity.columns.tlhSecurityId, 'tlhSecurityId')
	  								.field(SecurityEntity.alias('s2', 'name'), 'tlhSecurityName')
	      							.field(SecurityEntity.alias('s2', 'symbol'), 'tlhSecuritySymbol')
	      							.field(SecurityEntity.alias('s2', 'securityTypeId'), 'tlhSecurityTypeId')
	      							.field(SecurityTypeEntity.alias('st2', 'name'), 'tlhSecurityType')
	  								.from(SecuritySetEntity.tableName)
	  								.join(SecuritySetDetailEntity.tableName, null,
	  										squel.expr()
											.and(squelUtils.joinEql(SecuritySetDetailEntity.columns.securitySetId, securitySetId))
											.and(squelUtils.joinEql(SecuritySetDetailEntity.columns.isDeleted, 0)))
									.join(SecurityTLHInSecuritySetEntity.tableName, null,
	  										squel.expr()
											.and(squelUtils.joinEql(SecurityTLHInSecuritySetEntity.columns.securitySetId, securitySetId))
											.and(squelUtils.joinEql(SecurityTLHInSecuritySetEntity.columns.securityId, SecuritySetDetailEntity.columns.securityId))
											.and(squelUtils.joinEql(SecurityTLHInSecuritySetEntity.columns.isDeleted, 0)))
									.left_join(SecurityEntity.tableName, 's2', squelUtils.joinEql(SecurityTLHInSecuritySetEntity.columns.tlhSecurityId, SecurityEntity.alias('s2', 'id')))
									.left_join(SecurityTypeEntity.tableName, 'st2', squelUtils.joinEql(SecurityEntity.alias('s2', 'securityTypeId'), SecurityTypeEntity.alias('st2', 'id')))
									.where(squelUtils.eql(SecuritySetEntity.columns.id, securitySetId))
									.where(squelUtils.eql(SecuritySetEntity.columns.isDeleted, 0))
									.order(SecurityTLHInSecuritySetEntity.columns.priority).toString();
	  
	  
      logger.debug(securityQuery);
      logger.debug(securitySetTLHQuery);

      var rs = {};
      connection.query(securityQuery, [ securitySetId, securitySetId, securitySetId ], function(err, data) {
    	  if(err){
    		  return cb(err);
    	  }
    	  rs.equivalence = data;
    	  connection.query(securitySetTLHQuery, [ securitySetId, securitySetId, securitySetId ], function(err, data) {
			if(err){
				return cb(err, data);
			}
			rs.tlh = data;
			cb(null, rs);
		});
      });
};

SecuritySetDao.prototype.getSecuritiesOnlyInSecuritySet = function(reqData, cb){

    var connection = baseDao.getConnection(reqData);
    var securitySetId = reqData.id;

    var securityQuery = squel.select()
    							.field(SecuritySetEntity.columns.id, 'id').distinct()
    							.field(SecuritySetDetailEntity.columns.securityId, 'securityId')
    							.field(SecurityEntity.columns.assetClassId, 'assetClassId')
    							.field(SecurityEntity.columns.assetCategoryId, 'assetCategoryId')
    							.field(SecurityEntity.columns.assetSubClassId, 'assetSubClassId')
    							.from(SecuritySetEntity.tableName)
    							.left_join(SecuritySetDetailEntity.tableName, null, 
										squel.expr()
												.and(squelUtils.joinEql(SecuritySetDetailEntity.columns.securitySetId, securitySetId))
												.and(squelUtils.joinEql(SecuritySetDetailEntity.columns.isDeleted, 0)))
								.join(SecurityEntity.tableName, null, 
										squel.expr()
												.and(squelUtils.joinEql(SecurityEntity.columns.id, SecuritySetDetailEntity.columns.securityId))
												.and(squelUtils.joinEql(SecurityEntity.columns.isDeleted, 0)))
								.where(squelUtils.eql(SecuritySetEntity.columns.id, securitySetId))
								.where(squelUtils.eql(SecuritySetEntity.columns.isDeleted, 0)).toString();
	  
    logger.debug(securityQuery);

    var rs = {};
    connection.query(securityQuery, [ securitySetId, securitySetId, securitySetId ], function(err, data) {
	  	  if(err){
	  		  return cb(err);
	  	  }
	  	  cb(null, data);
    });
};
  
SecuritySetDao.prototype.securityInSecuritySet = function(data, cb){
	  
	  var connection = baseDao.getConnection(data);
	  var securityId = data.securityId;
	  
	  var queryData = [];
	  for(var i = 0; i < 9; i++){
		  queryData.push(securityId);
	  }
	  
	  var query = squel.select()
	  							.field(SecuritySetDetailEntity.columns.securitySetId, 'id')
	  							.from(SecuritySetDetailEntity.tableName)
	  							.where(squelUtils.eql(SecuritySetDetailEntity.columns.isDeleted, 0))
	  							.where(
	  									squel.expr()
	  										.or(squelUtils.eql(SecuritySetDetailEntity.columns.securityId, securityId))
	  										.or(squelUtils.eql(SecuritySetDetailEntity.columns.taxableSecurityId, securityId))
	  										.or(squelUtils.eql(SecuritySetDetailEntity.columns.taxExemptSecurityId, securityId))
	  										.or(squelUtils.eql(SecuritySetDetailEntity.columns.taxDeferredSecurityId, securityId))
	  								)
	  							.union(
	  									squel.select()
	  											.field(SecurityEquivalenceInSecuritySetEntity.columns.securitySetId, 'id')
	  											.from(SecurityEquivalenceInSecuritySetEntity.tableName)
	  											.where(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.isDeleted, 0))
	  											.where(
	  													squel.expr()
	  														.or(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.equivalentSecurityId, securityId))
	  														.or(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.taxableSecurityId, securityId))
	  														.or(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.taxExemptSecurityId, securityId))
	  														.or(squelUtils.eql(SecurityEquivalenceInSecuritySetEntity.columns.taxDeferredSecurityId, securityId))
	  											      )
	  							  )
	  							 .union(
	  									 squel.select()
	  									 		.field(SecurityTLHInSecuritySetEntity.columns.securitySetId, 'id')
	  									 		.from(SecurityTLHInSecuritySetEntity.tableName)
	  									 		.where(squelUtils.eql(SecurityTLHInSecuritySetEntity.columns.isDeleted, 0))
	  									 		.where(
	  													squel.expr()
	  														.or(squelUtils.eql(SecurityTLHInSecuritySetEntity.columns.tlhSecurityId, securityId))
	  											      )
	  							  ).toString();
	  	  
	  logger.debug(query);
	  
	  var queryString = connection.query(query, queryData, function(err, data){
		  cb(err, data);
	  });
};

SecuritySetDao.prototype.setUnsetSecuritySetFavorite = function(reqData, cb){

    var connection = baseDao.getConnection(reqData);
    var securitySetId = reqData.id;

    var securitySetEntity = {};
    securitySetEntity.securitySetId = reqData.id;
    securitySetEntity.teamId = reqData.teamId;
    securitySetEntity.isFavorite = reqData.isFavorite;
    
    var securityQuery = "INSERT INTO securitySetTeamFavorite SET ? ON DUPLICATE KEY UPDATE ?"
	  
    logger.debug(securityQuery);

    var rs = {};
    connection.query(securityQuery, [ securitySetEntity, securitySetEntity ], function(err, data) {
	  	  if(err){
	  		  return cb(err);
	  	  }
	  	  cb(null, data);
    });
};


SecuritySetDao.prototype.setUnsetSecuritySetFavoriteInSecuritySetTable = function(reqData, cb){

    var connection = baseDao.getConnection(reqData);

    var securitySetId = reqData.id;
    var isFavorite = reqData.isFavorite;
    
    var securityQuery = "UPDATE securitySet SET isFavorite = ? WHERE id = ? "
	  
    logger.debug(securityQuery);

    var rs = {};
    
    var queryString = connection.query(securityQuery, [ isFavorite, securitySetId ], function(err, data) {
	  	  if(err){
	  		  return cb(err);
	  	  }
	  	  cb(null, data);
    });
};

module.exports = new SecuritySetDao();