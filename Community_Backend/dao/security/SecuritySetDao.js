"use strict";

var moduleName = __filename;
var localCache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao');
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var config = require('config');
var applicationEnum = config.applicationEnum;
var reverseSecuritySetToleranceType = applicationEnum.reverseSecuritySetToleranceType;

var _ = require("lodash");

var tableNames = [ "securitySet", //0
                   "securitySetDetail", //1
                   "securityEquivalenceInSecuritySet", //2
                   "securityTLHInSecuritySet", //3
                   "security", // 4
                   "user", //5,
                   "securityType" //6
                 ];

var SecuritySetDao = function(){
	
}

SecuritySetDao.prototype.getAllSecuritySets = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securityQuery = [];
      securityQuery.push(" SELECT DISTINCT ss.id, ss.`name`, ss.description, ss.isDynamic ");
      securityQuery.push(" ,CASE WHEN (me.id IS NULL) THEN 0 ELSE 1 END AS isModelAssigned, ss.isDeleted ");
      securityQuery.push(" ,CASE WHEN (ss.toleranceType = 0) THEN '" + reverseSecuritySetToleranceType[0] + "' ELSE '" + reverseSecuritySetToleranceType[1] + "' END AS toleranceType, ss.toleranceTypeValue ");
      securityQuery.push(" ,ss.createdDate AS createdOn, uc.userLoginId as createdBy ");
      securityQuery.push(" ,ss.editedDate AS editedOn, ue.userLoginId as editedBy ");
      securityQuery.push(" FROM " + tableNames[0] + " AS ss ");
	  securityQuery.push(" INNER JOIN " + tableNames[5] + "  AS uc ON ss.createdBy = uc.id ");
	  securityQuery.push(" INNER JOIN " + tableNames[5] + "  AS ue ON ss.editedBy = ue.id ");
	  securityQuery.push(" LEFT JOIN modelElements AS me ON me.relatedType = 'SECURITYSET' AND me.relatedTypeId = ss.id AND me.isDeleted = 0 ");
      securityQuery.push(" WHERE ss.isDeleted=0 ");
      
      
      if(data.search){
    	  securityQuery.push(' AND ');
    	  if(data.search.match(/^[0-9]+$/g)){
      		securityQuery.push(" ( ss.id = " + connection.escape(data.search) + " OR ");
    	  }
    	  securityQuery.push(" ss.name LIKE '%" + data.search + "%' ");
      }
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.getSecuritiesInSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      
      var securityQuery = [];
      
      securityQuery.push(" SELECT securityId FROM " + tableNames[1] + " WHERE securitySetId = ? AND isDeleted = 0 ");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, securitySetId, function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.getSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.id;
      
      var securityQuery = [];
      
      securityQuery.push(" SELECT id FROM " + tableNames[0] + " WHERE id = ? AND isDeleted = 0");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
	
      if(securitySetId){
    	  connection.query(securityQuery, securitySetId, function(err, data) {
    		  cb(err, data);
    	  });    	  
      }else{
    	  cb(null,[]);
      }
};
  
SecuritySetDao.prototype.createSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.id;
      var securitySetEntity = _.omit(data, ["reqId"]);
      
      var securityQuery = [];
      
      securityQuery.push(" INSERT INTO " + tableNames[0] + " SET ? ");
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
     
      var securitySetId = data.id;
      var securitySetEntity = {
    		  name : data.name,
    		  description : data.description,
    		  isDynamic : data.isDynamic,
    		  toleranceType : data.toleranceType,
    		  toleranceTypeValue : data.toleranceTypeValue,
    		  editedBy : data.editedBy,
    		  editedDate : data.editedDate
      }
      
      var securityQuery = [];

      securityQuery.push(" UPDATE " + tableNames[0] + " SET ? WHERE id = ? AND isDeleted = 0 ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securitySetEntity, securitySetId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.deleteSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.id;
      
      var securitySetEntity = {
    		  isDeleted : 1,
    		  editedBy : data.editedBy,
    		  editedDate : data.editedDate
    		  
      }
      
      var securityQuery = [];

      securityQuery.push(" UPDATE " + tableNames[0] + " SET ? WHERE id = ? AND isDeleted = 0 ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securitySetEntity, securitySetId], function(err, data) {
			cb(err, data);
		});
};

  
SecuritySetDao.prototype.getSecuritySetDetail = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      var securityId = data.securityId;
      var securityQuery = [];
      
      securityQuery.push(" SELECT securitySetId FROM " + tableNames[1] + " WHERE securitySetId = ? AND securityId = ? AND isDeleted = 0");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);

      var queryString = connection.query(securityQuery, [securitySetId, securityId], function(err, data) {
			cb(err, data);
	  });
};
  
SecuritySetDao.prototype.createSecuritySetDetail = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.id;
      var securityDetailEntity = _.omit(data, ["reqId"]);
      
      var securityQuery = [];
      
      securityQuery.push(" INSERT INTO " + tableNames[1] + " SET ? ");
      securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
      
      var queryString = connection.query(securityQuery, [securityDetailEntity, securityDetailEntity], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.updateSecuritySetDetail = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      var securityId = data.securityId;
      var securityQuery = [];
      
      var securityDetailEntity = {
    		  rank : data.rank,
    		  targetPercent : data.targetPercent,
    		  lowerModelTolerancePercent : data.lowerModelTolerancePercent,
    		  upperModelTolerancePercent : data.lowerModelTolerancePercent,
    		  lowerModelToleranceAmount : data.lowerModelToleranceAmount,
    		  upperModelToleranceAmount : data.lowerModelToleranceAmount,
    		  taxableSecurityId : data.taxableSecurityId, 
    		  taxDeferredSecurityId : data.taxDeferredSecurityId,
    		  taxExemptSecurityId : data.taxExemptSecurityId,
    	      minTradeAmount : data.minTradeAmount,
    	      minInitialBuyDollar : data.minInitialBuyDollar,
    	      buyPriority : data.buyPriority,
    	      sellPriority : data.sellPriority,
    		  editedBy : data.editedBy,
    		  editedDate : data.editedDate
      };
      securityQuery.push(" UPDATE " + tableNames[1] + " SET ? WHERE securitySetId = ? AND securityId = ?  AND isDeleted = 0 ");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securityDetailEntity, securitySetId, securityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.deleteSecuritySetDetail = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      
      var securitySetEntity = {
    		  isDeleted : 1,
    		  editedBy : data.editedBy,
    		  editedDate : data.editedDate
      }
      var idsNotToDelete = data.idsNotToDelete;
      var securityQuery = [];
      
      securityQuery.push(" UPDATE " + tableNames[1] + " SET ? WHERE securitySetId = ? ");
      
      if(idsNotToDelete && idsNotToDelete.length > 0){
    	  securityQuery.push(" AND securityId NOT IN (?) ");
      }
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, [securitySetEntity, securitySetId, idsNotToDelete], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.getSecuritySetSecuritiesIdsToDelete = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;

      var idsNotToDelete = data.idsNotToDelete;
      var securityQuery = [];
      
      securityQuery.push(" SELECT securityId FROM " + tableNames[1] + " WHERE securitySetId = ? ");
      
      if(idsNotToDelete && idsNotToDelete.length > 0){
    	  securityQuery.push(" AND securityId NOT IN (?) ");
      }
      
      securityQuery = securityQuery.join("");
      
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
     
      var securitySetId = data.securitySetId;
      var securityId = data.securityId;
      var equivalentSecurityId = data.equivalentSecurityId;
      
      var securityQuery = [];
      
      securityQuery.push(" SELECT equivalentSecurityId FROM " + tableNames[2] + " WHERE securitySetId = ? AND securityId = ? AND equivalentSecurityId = ? AND isDeleted = 0");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securitySetId, securitySetId, equivalentSecurityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.createSecuritySetEquivalence = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.id;
      var equivalenceSecuritySetEntity = _.omit(data, ["reqId"]);
      
      var securityQuery = [];
      
      securityQuery.push(" INSERT INTO " + tableNames[2] + " SET ? ");
      securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [equivalenceSecuritySetEntity, equivalenceSecuritySetEntity], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.updateSecuritySetEquivalence = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      var securityId = data.securityId;
      var equivalentSecurityId = data.equivalentSecurityId;
      var securityQuery = [];

      var securityDetailEntity = {
    		  rank : data.rank,
    	      taxableSecurityId : data.taxableSecurityId,
    	      taxDeferredSecurityId : data.taxDeferredSecurityId,
    	      taxExemptSecurityId : data.taxExemptSecurityId,
    	      minTradeAmount : data.minTradeAmount,
    	      minInitialBuyDollar : data.minInitialBuyDollar,
    	      buyPriority : data.buyPriority,
    	      sellPriority : data.sellPriority,
    	      editedBy : data.editedBy,
    		  editedDate : data.editedDate
      };
      securityQuery.push(" UPDATE " + tableNames[2] + " SET ? WHERE securitySetId = ? AND securityId = ? AND equivalentSecurityId = ? AND isDeleted = 0 ");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securityDetailEntity, securitySetId, securityId, equivalentSecurityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.deleteSecuritySetEquivalence = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      var securityId = data.securityId;
      
      var securitySetEntity = {
    		  isDeleted : 1,
    		  editedBy : data.editedBy,
    		  editedDate : data.editedDate
    		  
      }
      var idsNotToDelete = data.eidsNotToDelete;
      var securityQuery = [];

      securityQuery.push(" UPDATE " + tableNames[2] + " SET ? WHERE securitySetId = ? AND isDeleted = 0 ");
      
      if(data.idsNotToDelete){
    	  securityId = data.idsNotToDelete;
    	  securityQuery.push(" AND securityId NOT IN (?) ");
      }else{
    	  securityQuery.push(" AND securityId IN (?) ");    	  
      }
      
      if(idsNotToDelete && idsNotToDelete.length > 0){
    	  securityQuery.push(" AND equivalentSecurityId NOT IN (?) ");
      }
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, [securitySetEntity, securitySetId, securityId, idsNotToDelete], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.getTLHSecuritiesInSecuritySet = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      var securityId = data.securityId;
      var tlhSecurityId = data.tlhSecurityId;
      
      var securityQuery = [];
      
      securityQuery.push(" SELECT tlhSecurityId FROM " + tableNames[3] + " WHERE securitySetId = ? AND securityId = ? AND tlhSecurityId = ? AND isDeleted = 0");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);

      connection.query(securityQuery, [securitySetId, securityId, tlhSecurityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.createSecuritySetTLH = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.id;
      var tlhSecuritySetEntity = _.omit(data, ["reqId"]);
      
      var securityQuery = [];
      
      securityQuery.push(" INSERT INTO " + tableNames[3] + " SET ? ");
      securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [tlhSecuritySetEntity, tlhSecuritySetEntity], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.updateSecuritySetTLH = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      var securityId = data.securityId;
      var tlhSecurityId = data.tlhSecurityId;
      
      var securityQuery = [];

      var securityDetailEntity = {
    	      priority : data.priority,
    	      editedBy : data.editedBy,
    	      editedDate : data.editedDate
      };
      
      securityQuery.push(" UPDATE " + tableNames[3] + " SET ? WHERE securitySetId = ? AND securityId = ? AND tlhSecurityId = ? AND isDeleted = 0 ");

      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      connection.query(securityQuery, [securityDetailEntity, securitySetId, securityId, tlhSecurityId], function(err, data) {
			cb(err, data);
		});
};
  
SecuritySetDao.prototype.deleteSecuritySetTLH = function(data, cb){

      var connection = baseDao.getConnection(data);
     
      var securitySetId = data.securitySetId;
      var securityId = data.securityId;
      
      var securitySetEntity = {
    		  isDeleted : 1,
    		  editedBy : data.editedBy,
    		  editedDate : data.editedDate
    		  
      }
      var idsNotToDelete = data.tidsNotToDelete;
      var securityQuery = [];

      securityQuery.push(" UPDATE " + tableNames[3] + " SET ? WHERE securitySetId = ? AND isDeleted = 0 ");
      
      if(data.idsNotToDelete){
    	  securityId = data.idsNotToDelete;
    	  securityQuery.push(" AND securityId NOT IN (?) ");
      }else{
    	  securityQuery.push(" AND securityId IN (?) ");    	  
      }
      
      if(idsNotToDelete && idsNotToDelete.length > 0){
    	  securityQuery.push(" AND tlhSecurityId NOT IN (?) ");
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

      var securityQuery = [];
      
      securityQuery.push(" SELECT ss.id, ss.name, ss.description, ss.isDynamic ");
      securityQuery.push(" ,CASE WHEN (ss.toleranceType = 0) THEN '" + reverseSecuritySetToleranceType[0] + "' ELSE '" + reverseSecuritySetToleranceType[1] + "' END AS toleranceType, ss.toleranceTypeValue ");
      securityQuery.push(" , ss.createdDate as createdOn, ss.editedDate as editedOn "); 
      securityQuery.push(" ,uc.userLoginId as createdBy, ue.userLoginId as editedBy ");
      securityQuery.push(" ,ssd.securityId , s.name AS securityName, s.symbol AS securitySymbol, s.securityTypeId, st.name as securityType, ssd.rank ");
      securityQuery.push(" ,ssd.targetPercent as targetPercent, ssd.lowerModelTolerancePercent as lowerModelTolerancePercent, ssd.upperModelTolerancePercent as upperModelTolerancePercent ");
      securityQuery.push(" ,ssd.lowerModelToleranceAmount as lowerModelToleranceAmount, ssd.upperModelToleranceAmount as upperModelToleranceAmount ");
      securityQuery.push(" ,ssd.taxableSecurityId, s6.name AS taxableSecurityName, s6.symbol AS taxableSecuritySymbol, s6.securityTypeId as taxableSecurityTypeId, st6.name as taxableSecurityType ");
	  securityQuery.push(" ,ssd.taxDeferredSecurityId, s7.name AS taxDeferredSecurityName, s7.symbol AS taxDeferredSecuritySymbol, s7.securityTypeId as taxDeferredSecurityTypeId, st7.name as taxDeferredSecurityType ");
	  securityQuery.push(" ,ssd.taxExemptSecurityId, s8.name AS taxExemptSecurityName, s8.symbol AS taxExemptSecuritySymbol,s8.securityTypeId as taxExemptSecurityTypeId, st8.name as taxExemptSecurityType ");
	  securityQuery.push(" ,ssd.minTradeAmount, ssd.minInitialBuyDollar, ssd.buyPriority, ssd.sellPriority ");
	  securityQuery.push(" ,sess.equivalentSecurityId, s2.name AS equivalenceSecurityName, s2.symbol AS equivalenceSecuritySymbol, s2.securityTypeId as equivalenceSecurityTypeId, st2.name as equivalenceSecurityType ");
      securityQuery.push(" ,sess.taxableSecurityId AS tEquivalenceSecurityId, s3.name AS tEquivalenceSecurityName, s3.symbol AS tEquivalenceSecuritySymbol, s3.securityTypeId as tEquivalenceSecurityTypeId, st3.name as tEquivalenceSecurityType "); 
      securityQuery.push(" ,sess.taxDeferredSecurityId AS tdEquivalenceSecurityId, s4.name AS tdEquivalenceSecurityName, s4.symbol AS tdEquivalenceSecuritySymbol, s4.securityTypeId as tdEquivalenceSecurityTypeId, st4.name as tdEquivalenceSecurityType ");
      securityQuery.push(" ,sess.taxExemptSecurityId AS teEquivalenceSecurityId, s5.name AS teEquivalenceSecurityName, s5.symbol AS teEquivalenceSecuritySymbol, s5.securityTypeId as teEquivalenceSecurityTypeId, st5.name as teEquivalenceSecurityType ");
      securityQuery.push(" ,sess.minTradeAmount AS equivalenceMinTradeAmount, sess.minInitialBuyDollar AS equivalenceMinInitialBuyDollar, sess.buyPriority AS equivalenceBuyPriority, sess.buyPriority AS equivalenceSellPriority, sess.rank as equivalenceRank ");
      securityQuery.push("  FROM " +tableNames[0]+ " AS ss "); 
	  securityQuery.push(" INNER JOIN " + tableNames[5] + "  AS uc ON ss.createdBy = uc.id ");
	  securityQuery.push(" INNER JOIN " + tableNames[5] + "  AS ue ON ss.editedBy = ue.id ");
      securityQuery.push(" LEFT JOIN " +tableNames[1]+ " AS ssd ON ssd.securitySetId = ? AND ssd.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS s ON ssd.securityId = s.id ");
	  securityQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st ON s.securityTypeId = st.id AND st.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS s6 ON ssd.taxableSecurityId = s6.id ");
	  securityQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st6 ON s6.securityTypeId = st6.id AND st6.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS s7 ON ssd.taxDeferredSecurityId = s7.id "); 
	  securityQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st7 ON s7.securityTypeId = st7.id AND st7.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS s8 ON ssd.taxExemptSecurityId = s8.id ");
	  securityQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st8 ON s8.securityTypeId = st8.id AND st8.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[2]+ " AS sess ON sess.securitySetId = ? AND ssd.securityId = sess.securityId AND sess.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS s2 ON sess.equivalentSecurityId = s2.id "); 
	  securityQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st2 ON s2.securityTypeId = st2.id AND st2.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS s3 ON sess.taxableSecurityId = s3.id ");
	  securityQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st3 ON s3.securityTypeId = st3.id AND st3.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS s4 ON sess.taxDeferredSecurityId = s4.id "); 
	  securityQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st4 ON s4.securityTypeId = st4.id AND st4.isDeleted = 0 ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS s5 ON sess.taxExemptSecurityId = s5.id ");
	  securityQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st5 ON s5.securityTypeId = st5.id AND st5.isDeleted = 0 ");
	  securityQuery.push(" WHERE ss.id = ? ");
	  
	  var securitySetTLHQuery = [];
	  
	  securitySetTLHQuery.push(" SELECT ss.id, ssd.securityId, ");
	  securitySetTLHQuery.push(" stss.tlhSecurityId, stss.priority, s2.name AS tlhSecurityName, s2.symbol AS tlhSecuritySymbol, s2.securityTypeId as tlhSecurityTypeId, st2.name as tlhSecurityType ");
	  securitySetTLHQuery.push(" FROM " +tableNames[0]+ " AS ss  ");
	  securitySetTLHQuery.push(" INNER JOIN " +tableNames[1]+ " AS ssd ON ssd.securitySetId = ? AND ssd.isDeleted = 0 ");
	  securitySetTLHQuery.push(" INNER JOIN " +tableNames[3]+ " AS stss ON stss.securitySetId = ? AND stss.securityId = ssd.securityId AND stss.isDeleted = 0 ");
	  securitySetTLHQuery.push(" INNER JOIN " +tableNames[4]+ " AS s2 ON s2.id = stss.tlhSecurityId  ");
	  securitySetTLHQuery.push(" LEFT JOIN " +tableNames[6]+ " AS st2 ON s2.securityTypeId = st2.id AND st2.isDeleted = 0 ");
	  securitySetTLHQuery.push(" WHERE ss.id = ? ");
	  securitySetTLHQuery.push(" ORDER BY stss.priority ASC ");
	  
      securityQuery = securityQuery.join("");
      securitySetTLHQuery = securitySetTLHQuery.join("");
      
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
  
SecuritySetDao.prototype.securityInSecuritySet = function(data, cb){
	  
	  var connection = baseDao.getConnection(data);
	  var securityId = data.securityId;
	  
	  var queryData = [];
	  for(var i = 0; i < 9; i++){
		  queryData.push(securityId);
	  }
	  
	  var query = [];
	  
	  query.push(" SELECT securitySetId AS id FROM securitySetDetail AS ssd WHERE  ssd.isDeleted = 0 "); 
	  query.push(" AND (  ssd.SecurityId  = ?  OR ssd.taxableSecurityId = ?  OR ssd.taxExemptSecurityId = ?  OR ssd.taxDeferredSecurityId = ? ) ");  
	  query.push(" UNION ");
	  query.push(" SELECT securitySetId AS id FROM `securityEquivalenceInSecuritySet` AS sess WHERE  sess.isDeleted = 0 "); 
	  query.push(" AND (  sess.equivalentSecurityId = ?  OR sess.taxableSecurityId = ?  OR sess.taxExemptSecurityId = ?  OR sess.taxDeferredSecurityId = ? ) ");  
	  query.push(" UNION ");
	  query.push(" SELECT securitySetId AS id FROM `securityTLHInSecuritySet` AS stss WHERE  stss.isDeleted = 0 AND (  stss.tlhSecurityId = ? ) ");  

	  
	  query = query.join("");
	  
	  logger.debug(query);
	  
	  var queryString = connection.query(query, queryData, function(err, data){
		  cb(err, data);
	  });
}; 

module.exports = new SecuritySetDao();
