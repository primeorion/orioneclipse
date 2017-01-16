"use strict";

var moduleName = __filename;
var cache = require('service/cache').local;
var baseDao = require('dao/BaseDao');
var logger = require('helper/Logger')(moduleName);


var PrivilegeDao = function () {}

PrivilegeDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT * FROM privilege WHERE id = ? AND isDeleted = 0 ';
    logger.debug("Query : " + query + "id : " + data.privilegeId);
    connection.query(query, [data.privilegeId], function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};
PrivilegeDao.prototype.getAll = function (data,cb) {
    var query = null;
    if(data.roleTypeId){
        query = 'SELECT PR.id,PR.name,PR.code,PR.type,PR.userLevel,PR.category '
        +' ,PR.isDeleted,PR.createdDate as createdOn ' 
        +' ,usCreated.userLoginId as createdBy,PR.editedDate as editedOn '
        +' ,usEdited.userLoginId as editedBy FROM roleType as RT '
        +' left outer join privilege as PR on ((PR.userLevel)& RT.bitValue) = RT.bitValue '
        +' left outer join user as usCreated on usCreated.id = PR.createdBy '
        +' left outer join user as usEdited on usEdited.id = PR.editedBy '
        +' WHERE RT.id = ? AND PR.isDeleted = 0 ';
    }else{
        query = 'SELECT PR.id,PR.name,PR.code,PR.type,PR.userLevel,PR.category '
        + ',PR.isDeleted,PR.createdDate as createdOn ' 
        +' ,usCreated.userLoginId as createdBy,PR.editedDate as editedOn '
        +' ,usEdited.userLoginId as editedBy FROM privilege as PR '
        +' left outer join user as usCreated on usCreated.id = PR.createdBy '
        +' left outer join user as usEdited on usEdited.id = PR.editedBy '
        +' WHERE PR.isDeleted = 0 ';
    }
    var connection = baseDao.getConnection(data);
    
    logger.debug("Query: " + query);
    connection.query(query,[data.roleTypeId], function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

PrivilegeDao.prototype.getPrivilegeByUserAndModule = function (data, cb){
    var connection = baseDao.getConnection(data);
    var query = 'Select * from rolePrivilege rp '
    +' left Join privilege p on p.id = rp.privilegeId '
    +' Where rp.roleId = ? And p.code = ? And p.category = ? And p.isDeleted = 0 ' ;
    
    logger.debug("Query: " + query + ", roleId: " + data.user.roleId + ", code: " + data.categoryCode
    		+ ", category: " + data.moduleName);
    
    connection.query(query, [data.user.roleId, data.categoryCode, data.moduleName], function(err, result){
        if(err){
            return cb(err);
        } else {
            return cb(null, result);
        }
    });
};

module.exports = PrivilegeDao;