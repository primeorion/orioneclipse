"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var tableNames = [
    'security',
    'user'
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
    query.push('SELECT CS.id,CS.name, CS.status,CS.isDeleted, ');
    query.push(' CS.createdDate as createdOn,CS.editedDate as editedOn');
    query.push(' ,CS.symbol,CS.securityType');
    query.push(' ,CS.category,CS.assetClass');
    query.push(' ,CS.subClass,CS.custodialCash');
    query.push(' ,USER.userLoginId as createdBy ,USERS.userLoginId as editedBy');
    query.push(' from ' + tableNames[0] + ' as CS ');
    query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.userId = CS.createdBy ');
    query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.userId = CS.editedBy ');
    query.push(' WHERE CS.id=? ');
    query.push(' AND CS.isDeleted=0 ');
    query = query.join("");

    logger.info("Security detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            return cb(err);
        }
        var securityList = [];
        if (result.length > 0) {
            result.forEach(function (security) {
                securityList.push(security);
            });
        }
        return cb(null, securityList);
    });
};

module.exports = SecurityDao;   