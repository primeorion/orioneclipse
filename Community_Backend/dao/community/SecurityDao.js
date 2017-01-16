"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var tableNames = [
    'security',
    'user',
    'securityType',
    'modelSecurities'
];
var SecurityDao = function () { }

SecurityDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("security object", JSON.stringify(data.security));
    var query = [];
    query.push('SELECT CS.id,CS.name, CS.status,CS.isDeleted, ');
    query.push(' CS.createdDate as createdOn,CS.editedDate as editedOn');
    query.push(' ,CS.symbol,CS.securityType');
    query.push(' ,CS.category,CS.assetClass');
    query.push(' ,CS.subClass,CS.custodialCash');
    query.push(' ,USER.userLoginId as createdBy ,USERS.userLoginId as editedBy');
    query.push(' from ' + tableNames[0] + ' as CS ');
    query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.userId = CS.createdBy ');
    query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.userId = CS.editedBy ');
    query.push(' WHERE 1=1 ');
    query.push(' AND CS.isDeleted=0 ');
    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' AND CS.id= "' + data.search + '" OR ');
        } else {
            query.push(' AND ');
        }
        query.push('CS.name LIKE "%' + data.search + '%" ');

    }
    query = query.join("");

    logger.debug("Get Security List Query" + query);;
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        var securities = [];
        data.forEach(function (security) {
            securities.push(security);
        });
        return cb(null, securities);
    });
};

SecurityDao.prototype.getDetail = function (data, cb) {

    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("security object", JSON.stringify(data.security));
    var query = [];
    // query.push('SELECT CS.id,CS.name, CS.status,CS.isDeleted, ');
    // query.push(' CS.createdDate as createdOn,CS.editedDate as editedOn');
    // query.push(' ,CS.symbol,CS.securityType');
    // query.push(' ,CS.category,CS.assetClass');
    // query.push(' ,CS.subClass,CS.custodialCash');
    // query.push(' ,USER.userLoginId as createdBy ,USERS.userLoginId as editedBy');
    // query.push(' from ' + tableNames[0] + ' as CS ');
    // query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.userId = CS.createdBy ');
    // query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.userId = CS.editedBy ');
    // query.push(' WHERE CS.id=? ');
    // query.push(' AND CS.isDeleted=0 ');
    query.push('SELECT S.id, S.name, S.orionConnectExternalId, S.symbol, S.company, AC.name as category, ACL.name as class, ASCL.name as subClass, S.securityType, S.securityId FROM security AS S');
    query.push(' left outer join `assetCategory` AS AC ON AC.id = S.`category`'); 
    query.push(' left outer join `assetClass` AS ACL ON ACL.id = S.`class`');
    query.push(' left outer join `assetSubClass` AS ASCL ON ASCL.id = S.`subClass`');
    query.push(' WHERE S.id=?');
    query = query.join("");

    logger.info("Security detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);

        // var securityList = [];
        // if (result.length > 0) {
        //     result.forEach(function (security) {
        //         securityList.push(security);
        //     });
        // }
        // return cb(null, securityList);
    });
};

// SecurityDao.prototype.getSecurityByIdOrName = function(data, cb){
//           var connection = baseDao.getCommunityDBConnection(data);
// 		  var securityIds = data.securityIds;
// 		  var search = data.search;
// 		  var query = "SELECT DISTINCT(id), `name`,`securityId`, `symbol`, `company`, `category`, `class`, `subclass` FROM `security` WHERE (`name` LIKE '"+search+"%' OR `symbol` LIKE '"+search+"%' OR `company` LIKE '"+search+"%');";
// 		 // var query = "select * from security";
// 		  logger.debug(query);
		  
// 		  var queryString = connection.query(query, function(err, rs){
// 			  return cb(err, rs);
// 		  });
// }

SecurityDao.prototype.getSecurityByIdOrName = function(data, cb){
          var connection = baseDao.getCommunityDBConnection(data);
		  var securityIds = data.securityIds;
		  var search = data.search;
		  var query = null;
    	    query = "SELECT DISTINCT(securityMaster.id), securityMaster.`name` AS name, securityMaster.`symbol` as symbol"; 
            query += " ,securityMaster.`company` as company";
            query += " ,AC.`name` as category, securityTypeValue.name AS type , ACL.`name` AS assetClass";
            query += " ,ASCL.`name` AS subclass FROM "+ tableNames[0] +" AS securityMaster";
            query += " LEFT JOIN " + tableNames[2] + " AS securityTypeValue ON securityTypeValue.id = securityMaster.`securityType`";
            query += " LEFT OUTER JOIN `assetCategory` AS AC ON AC.id = securityMaster.`category`";
            query += " LEFT OUTER JOIN `assetClass` AS ACL ON ACL.id = securityMaster.`class`";
            query += " LEFT OUTER JOIN `assetSubClass` AS ASCL ON ASCL.id = securityMaster.`subClass`";          
            query += " WHERE (securityMaster.`name` LIKE '"+search+"%' OR  securityMaster.`symbol` LIKE '"+search+"%'";
            query += " OR securityMaster.`company` LIKE '"+search+"%');";
          
          logger.debug('query to get security list ' + query);		  
		  connection.query(query, function(err, rs){
			  if(err){
                  return cb(err);
              }
                return cb(err, rs);
		  });
}
module.exports = SecurityDao;   