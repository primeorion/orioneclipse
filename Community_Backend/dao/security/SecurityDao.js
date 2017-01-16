"use strict";

var moduleName = __filename;
var config = require("config");

var _ = require("lodash");

var localCache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao');
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var tableNames = [ "security", //0
                   "assetCategory", //1
                   "assetClass", //2
                   "assetSubClass", //3
                   "securityPrice", //4
                   "securityType", //5
                   "custodian",//6
                   "custodianSecuritySymbol",//7
                   "user", //8
                   "securityStatus" //9
                 ];

var SecurityDao = function(){
	
}

SecurityDao.prototype.getSecuritiesList = function(data, cb){

      var connection = baseDao.getConnection(data);
      var securityId = data.id;
      
      var securityStatus = data.statusId;
      
      var securityQuery = [];
      
	  securityQuery.push(" SELECT s.id as id, s.orionConnectExternalId as orionConnectExternalId, s.name as name, s.symbol as symbol ");
	  securityQuery.push(" ,s.securityTypeId as securityTypeId, st.name as securityType, sp.price as price " );
	  securityQuery.push(" ,s.statusId, ss.status ");
	  securityQuery.push(" ,s.isDeleted as isDeleted " );
	  securityQuery.push(" ,s.assetCategoryId as assetCategoryId, s.assetClassId as assetClassId " );
	  securityQuery.push(" ,s.assetSubClassId as assetSubClassId " );
	  securityQuery.push(" ,ac.name as assetCategory ");
	  securityQuery.push(" ,acl.name as assetClass, ascl.name as assetSubClass ");
	  securityQuery.push(" ,s.custodialCash as custodialCash, s.createdDate as createdOn,uc.userLoginId as createdBy " );
	  securityQuery.push(" ,s.editedDate as editedOn, ue.userLoginId as editedBy ");
	  securityQuery.push(" FROM " + tableNames[0] + " AS s ");
	  securityQuery.push(" INNER JOIN " + tableNames[8] + "  AS uc ON s.createdBy = uc.id ");
	  securityQuery.push(" INNER JOIN " + tableNames[8] + "  AS ue ON s.editedBy = ue.id ");
	  securityQuery.push(" INNER JOIN " + tableNames[9] + "  AS ss ON s.statusId = ss.id ");
	  securityQuery.push(" LEFT JOIN " + tableNames[1] + " AS ac ");
	  securityQuery.push(" ON s.assetCategoryId = ac.id ");
	  securityQuery.push(" LEFT JOIN  " +tableNames[2]+ " AS acl ON s.assetClassId = acl.id ");
	  securityQuery.push(" LEFT JOIN  " +tableNames[3]+ " AS ascl ON s.assetSubClassId = ascl.id ");
	  securityQuery.push(" LEFT JOIN  " +tableNames[5]+ " AS st ON s.securityTypeId = st.id ");
	  securityQuery.push(" LEFT JOIN  " +tableNames[4]+ " AS sp ON sp.securityId = s.id ");
	  securityQuery.push(" INNER JOIN  (SELECT MAX(priceDateTime) AS `time`, securityId FROM " +tableNames[4]+ " GROUP BY securityId) maxt " );
	  securityQuery.push(" ON ( sp.securityId = maxt.securityId AND sp.priceDateTime = maxt.time OR sp.securityId IS NULL AND sp.priceDateTime IS NULL) ");
      
      securityQuery.push(' WHERE ');
      securityQuery.push(' s.isDeleted = 0 ');
      
      if(securityStatus){    	  
    	  securityQuery.push(' AND s.statusId & ' + securityStatus + ' >=  ' + securityStatus);
      }
      
      if(data.search){
    	  securityQuery.push(' AND ');
    	  var tempStatus = false;
    	  if(data.search.match(/^[0-9]+$/g)){
    		  tempStatus = true;
      		securityQuery.push(" ( s.id = " + connection.escape(data.search) + " OR ");
    	  }
    	  if(!tempStatus){
    		  securityQuery.push(" ( ");
    	  }
    	  securityQuery.push(" s.name LIKE '%" + data.search + "%' ");
    	  securityQuery.push(" OR ");
    	  securityQuery.push(" s.symbol LIKE '%" + data.search + "%' ) ");
      }
      
      if(data.assetClassId){
		  securityQuery.push(' AND ');
    	  securityQuery.push(' s.assetClassId = ' + connection.escape(data.assetClassId));
      }
      
      if(data.assetSubClassId){
		  securityQuery.push(' AND ');
    	  securityQuery.push(' s.assetSubClassId = ' + connection.escape(data.assetSubClassId));
      }
      
      if(data.assetCategoryId){
		  securityQuery.push(' AND ');
    	  securityQuery.push(' s.assetCategoryId = ' + connection.escape(data.assetCategoryId));
      }
      
	  securityQuery.push(" GROUP BY s.id ");
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
		
      var queryString = connection.query(securityQuery, function(err, data) {
			cb(err, data);
	  });

};

SecurityDao.prototype.getDetailedSecurity = function(reqData, cb){

      var connection = baseDao.getConnection(reqData);
      var securityId = reqData.id;
      var orionConnectExternalId = reqData.orionConnectExternalId;
      
      var symbol = reqData.symbol;
      
      var securityQuery = [];
      securityQuery.push(" SELECT id as id, orionConnectExternalId, symbol FROM " + tableNames[0] + " WHERE isDeleted = 0 AND (  ");
      
      if(securityId){
    	  securityQuery.push(" id = ? ");
      }else if(orionConnectExternalId){  
    	      securityId = orionConnectExternalId;
        	  securityQuery.push(" orionConnectExternalId = ? ");  
      }
      if(symbol){
    	  securityQuery.push(" OR symbol = ? ");
      }
      
      securityQuery.push(" ) ");
      
      securityQuery = securityQuery.join("");

      logger.debug(securityQuery);
      
      var queryString = connection.query(securityQuery,  [securityId, symbol], function(err, data) {
			cb(err, data);
	  });

};

SecurityDao.prototype.getDetailedSecurityById = function(reqData, cb){

      var connection = baseDao.getConnection(reqData);
      var securityId = reqData.id;

      var securityQuery = [];
      
      securityQuery.push(" SELECT sp.priceDateTime, s.id AS id, s.orionConnectExternalId as orionConnectExternalId, s.symbol AS symbol "); 
      securityQuery.push(" ,s.name AS name , s.securityTypeId AS securityTypeId, st.name AS securityType, sp.price AS price ");
      securityQuery.push(" ,css.securitySymbol AS custodianSecuritySymbol ");
      securityQuery.push(" ,c.id AS custodianId, c.name AS custodianName, c.code AS custodianCode ");
      securityQuery.push(" ,s.statusId as statusId, ss.status, s.isDeleted AS isDeleted "); 
      securityQuery.push(" ,s.assetCategoryId AS assetCategoryId, s.assetClassId AS assetClassId "); 
      securityQuery.push(" ,s.assetSubClassId AS assetSubClassId ");
      securityQuery.push(" ,s.custodialCash AS custodialCash, s.createdDate AS createdOn "); 
      securityQuery.push(" ,s.editedDate AS editedOn, ac.name AS assetCategory "); 
	  securityQuery.push(" ,uc.userLoginId as createdBy, ue.userLoginId as editedBy ");
	  securityQuery.push(" ,acl.name AS assetClass, ascl.name AS assetSubClass ");
	  securityQuery.push(" ,ac.isDeleted AS assetCategoryIsDeleted ");
	  securityQuery.push(" FROM " + tableNames[0] + " AS s ");
	  securityQuery.push(" INNER JOIN " + tableNames[8] + "  AS uc ON s.createdBy = uc.id ");
	  securityQuery.push(" INNER JOIN " + tableNames[8] + "  AS ue ON s.editedBy = ue.id ");
	  securityQuery.push(" INNER JOIN " + tableNames[9] + "  AS ss ON s.statusId = ss.id ");
	  securityQuery.push(" LEFT JOIN " + tableNames[1] + " AS ac ");
	  securityQuery.push(" ON s.assetCategoryId = ac.id ");
	  securityQuery.push(" LEFT JOIN " +tableNames[2]+ " AS acl ON s.assetClassId = acl.id "); 
	  securityQuery.push(" LEFT JOIN " +tableNames[3]+ " AS ascl ON s.assetSubClassId = ascl.id "); 
	  securityQuery.push(" LEFT JOIN " +tableNames[5]+ " AS st ON s.securityTypeId = st.id ");
	  securityQuery.push(" LEFT JOIN " +tableNames[4]+ " AS sp ON sp.securityId = ? ");
	  securityQuery.push(" INNER JOIN  (SELECT MAX(priceDateTime) AS `time` FROM  " +tableNames[4]+ " WHERE securityId = ? ) maxt ");
	  securityQuery.push(" ON ( sp.priceDateTime = maxt.time ) OR sp.priceDateTime IS NULL AND maxt.time IS NULL ");
	  securityQuery.push(" LEFT JOIN  " +tableNames[7]+ " AS css ON s.id = css.securityId AND css.isDeleted = 0 "); 
	  securityQuery.push(" LEFT JOIN  " +tableNames[6]+ " AS c ON c.id = css.custodianId ");
	  securityQuery.push(" WHERE s.isDeleted = 0 AND s.id = ? ");
	  
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);

      var queryString = connection.query(securityQuery, [ securityId, securityId, securityId ], function(err, data) {
			cb(err, data);
		});
};

SecurityDao.prototype.updateSecurityGeneral = function(securityEntity, cb){
	  
	  var self = this;
      var connection = baseDao.getConnection(securityEntity);
      
      var securityId = securityEntity.id;
      
      var security = {
    	  symbol : securityEntity.symbol,
    	  securityTypeId : securityEntity.securityTypeId,
    	  assetCategoryId : securityEntity.assetCategoryId, 
    	  assetClassId : securityEntity.assetClassId,
    	  assetSubClassId : securityEntity.assetSubClassId,
    	  statusId : securityEntity.statusId,
    	  custodialCash : securityEntity.custodialCash,
          editedBy : securityEntity.editedBy,
          editedDate : securityEntity.editedDate
      };
      
      var securityQuery = [];

      securityQuery.push(" UPDATE " + tableNames[0] + " SET ? where id = ? AND isDeleted = 0 ");

      securityQuery = securityQuery.join("");
      logger.debug(securityQuery);

      connection.query(securityQuery,[security, securityId], function(err, data){
          if(err){
        	  logger.error(err);
        	  return cb(err);
          }
          cb(err, data);
      });
};
  
SecurityDao.prototype.createSecurityGeneral = function(security, cb){
	  
	  var self = this;
      var connection = baseDao.getConnection(security);

      var securityEntity = _.omit(security, ["reqId"]);
      
      var securityQuery = [];

      securityQuery.push(" INSERT INTO " + tableNames[0] + " SET ? ");
      securityQuery.push(" ON DUPLICATE KEY UPDATE ? ");
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);

      connection.query(securityQuery,[securityEntity, securityEntity], function(err, data){
          if(err){
        	  logger.error(err);
        	  return cb(err);
          }
          cb(err, data);
      });
};
  
SecurityDao.prototype.deleteSecurity = function(securityEntity, cb){
		  
		  var self = this;
	      var connection = baseDao.getConnection(securityEntity);
	      
	      var securityId = securityEntity.id;
	      
	      var security = {
	          isDeleted : 1,
	          statusId : securityEntity.statusId,
	          editedBy : securityEntity.editedBy,
	          editedDate : securityEntity.editedDate
	      };
	
	      var securityQuery = [];
	
	      securityQuery.push(" UPDATE " + tableNames[0] + " SET ? where id = ? AND isDeleted = 0 ");
	
	      securityQuery = securityQuery.join("");
	      
	      logger.debug(securityQuery);
	
	      var query = connection.query(securityQuery,[security, securityId], function(err, data){
	          if(err){
	        	  logger.error(err);
	        	  return cb(err);
	          }
	          cb(err, data);
	      });
};
  
SecurityDao.prototype.insertSecurityPrice = function(securityPrice, cb){
	  
	  var self = this;
      var connection = baseDao.getConnection(securityPrice);
      
      var securityId = securityPrice.securityId;

      var securityPriceEntity = _.omit(securityPrice, ["reqId"]);
      
      var securityQuery = [];
      
      securityQuery.push(" INSERT INTO " + tableNames[4] + " SET ? ");
      
      securityQuery = securityQuery.join("");
      logger.debug(securityQuery);
      connection.query(securityQuery,[securityPriceEntity], function(err, data){
          if(err){
        	  logger.error(err);
        	  return cb(err);
          }
          cb(err, data);
      });

};
  
SecurityDao.prototype.deleteSecurityPrice = function(securityPrice, cb){
	  
	  var self = this;
      var connection = baseDao.getConnection(securityPrice);
      
      var securityId = securityPrice.securityId;

      var securityPriceEntity = {
    		  isDeleted : 1,
    		  editedBy : securityPrice.editedBy,
    		  editedDate : securityPrice.editedDate
      }
      
      var securityQuery = [];
      
      securityQuery.push(" UPDATE " + tableNames[4] + " SET ? WHERE securityId = ? AND isDeleted = 0 ");
      
      securityQuery = securityQuery.join("");
      
      logger.debug(securityQuery);
      connection.query(securityQuery,[securityPriceEntity, securityId], function(err, data){
          if(err){
        	  logger.error(err);
        	  return cb(err);
          }
          cb(err, data);
      });

};

SecurityDao.prototype.checkSecurityForAssetClass = function(data, cb){
	  
	  var self = this;
      var connection = baseDao.getConnection(data);
      var status = false;
      
      var securityQuery = [];
      securityQuery.push(" SELECT id as id FROM security ");
      
      var categoryId = data.assetCategoryId;
      var classId = data.assetClassId;
      var subClassId = data.assetSubClassId;
      
      if(categoryId || classId || subClassId){
    	  securityQuery.push(" WHERE ");  
      }
      
      securityQuery.push(" isDeleted = 0 ");
      
      if(categoryId){
    	  securityQuery.push(" AND assetCategoryId = " + categoryId);
      }
      
      if(classId){
    	  securityQuery.push(" AND assetClassId = " + classId);
    	  status = true;
      }
      
      if(subClassId){
    	  securityQuery.push(" AND assetSubClassId = " + subClassId);
      }
      
      securityQuery = securityQuery.join(" ");
        logger.debug(" Query is"+securityQuery);
      connection.query(securityQuery, function(err, rs){
    	  if(err){
    		return cb(err);
    	  }
    	  if(rs && rs.length>0){
    		return cb(null, false);  
    	  }else{
    		  return cb(null, true);
    	  }

      });
	  
};
SecurityDao.prototype.getAssetWeightingsForSecurity = function(data, cb){
	
	      var connection = baseDao.getConnection(data);
	      var securityId = data.id;
	
	      var securityQuery = [];
		  securityQuery.push(" SELECT aw.securityId AS id, aw.relatedType, aw.weightingPercentage, aw.isDeleted ");
		  securityQuery.push(" ,aw.createdBy AS createdBy, aw.editedBy AS editedBy, aw.createdDate AS createdOn, aw.editedDate AS editedOn "); 
		  securityQuery.push(" ,aw.relatedTypeId AS assetCategoryId ");
		  securityQuery.push(" ,aw.relatedTypeId AS assetClassId, aw.relatedTypeId AS assetSubClassId ");
		  securityQuery.push(" ,ac.name AS assetCategoryName,acl.name AS assetClassName,ascl.name AS assetSubClassName ");
		  securityQuery.push(" FROM assetWeighting AS aw ");
		  securityQuery.push(" LEFT JOIN assetCategory AS ac ON ac.id = relatedTypeId ");
		  securityQuery.push(" LEFT JOIN assetClass AS acl ON acl.id = relatedTypeId ");
		  securityQuery.push(" LEFT JOIN assetSubClass AS ascl ON ascl.id = relatedTypeId ");
		  securityQuery.push(" WHERE aw.securityId = ? AND aw.isDeleted = 0 ");
	      
	      securityQuery = securityQuery.join("");
	      
	      logger.info(securityQuery);
			
	      connection.query(securityQuery, securityId,  function(err, data) {
				cb(err, data);
			});
};
	  
SecurityDao.prototype.createOrUpdateAssetWeightingsForSecurity = function(data, cb){
	      var connection = baseDao.getConnection(data);
	      var securityId = data.id;
	      var entityList = data.entityList;
	      
	      var securityQuery = [];
		  securityQuery.push(" INSERT INTO assetWeighting (createdDate, isDeleted, editedDate, createdBy, editedBy, " +
		  					 " securityId, relatedType, relatedTypeId, weightingPercentage ) VALUES ? ");
		  securityQuery.push(" ON DUPLICATE KEY UPDATE weightingPercentage=VALUES(weightingPercentage), isDeleted=VALUES(isDeleted)  "); 
		  securityQuery.push(" ,editedBy=VALUES(editedBy), editedDate=VALUES(editedDate)  ");
		  
	      securityQuery = securityQuery.join("");
	      
	      logger.info(securityQuery);
			
	      var queryString = connection.query(securityQuery, [entityList],  function(err, data) {
				cb(err, data);
			});
};
SecurityDao.prototype.deleteAssetWeightingsForSecurity = function(data, cb){
			
		  var connection = baseDao.getConnection(data);
		  var securityId = data.securityId;
		  
		  var updateData = {};
		  updateData.isDeleted = 1;
		  updateData.editedBy = data.editedBy;
		  updateData.editedDate = data.editedDate;
		  
		  var securityQuery = [];
		  securityQuery.push(" UPDATE assetWeighting SET ? WHERE securityId = ? AND isDeleted = 0 ");
		  
		  securityQuery = securityQuery.join("");
		  
		  logger.debug(securityQuery);
		
		  var queryString = connection.query(securityQuery, [updateData, securityId],  function(err, data) {
				cb(err, data);
		  });
		     
};
  
SecurityDao.prototype.checkForSecurityStatus = function(data, cb){
		  
		  var connection = baseDao.getConnection(data);
		  
		  var securityIds = data.securityIds;
		  
		  var query = "SELECT id AS id, `statusId` as status FROM " + tableNames[0] + " WHERE id IN (?) ";
		  
		  logger.debug(query);
		  
		  var queryString = connection.query(query, [securityIds], function(err, rs){
			  cb(err, rs);
		  });
		  
}
	  
module.exports = new SecurityDao();