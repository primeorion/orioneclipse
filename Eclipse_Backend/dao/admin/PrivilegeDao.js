"use strict";

var moduleName = __filename;
var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var cache = require('service/cache').local;
var baseDao = require('dao/BaseDao');
var logger = require('helper/Logger')(moduleName);
var privilegeEntity = require("entity/privilege/Privilege.js");
var roleTypeEntity = require("entity/role/RoleType.js");
var userEntity = require("entity/user/User.js");
var rolePrivilegeEntity = require("entity/role/RolePrivilege.js");
var roleTypePrivilegeEntity = require('entity/role/RoleTypePrivilege.js');

var PrivilegeDao = function () {}

PrivilegeDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = squel.select()
    .from(privilegeEntity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(privilegeEntity.columns.id,data.privilegeId))
        .and(squelUtils.eql(privilegeEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Get privilege Query" + query);
    connection.query(query, function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};
PrivilegeDao.prototype.getAll = function (data,cb) {
    var connection = baseDao.getConnection(data);

    var query = null;
    if(data.roleTypeId){
        query = squel.select()
        .field(privilegeEntity.columns.id,"id")
        .field(privilegeEntity.columns.name,"name")
        .field(privilegeEntity.columns.code,"code")
        .field(privilegeEntity.columns.type,"type")
        .field(privilegeEntity.columns.userLevel,"userLevel")
        .field(privilegeEntity.columns.category,"category")
        .field(roleTypePrivilegeEntity.columns.addDisabled,'addDisabled')
        .field(roleTypePrivilegeEntity.columns.updateDisabled,'updateDisabled')
        .field(roleTypePrivilegeEntity.columns.deleteDisabled,'deleteDisabled')
        .field(roleTypePrivilegeEntity.columns.readDisabled,'readDisabled')
        .field(privilegeEntity.columns.isDeleted,"isDeleted")
        .field(privilegeEntity.columns.createdDate,"createdOn")
        .field(privilegeEntity.columns.editedDate,"editedOn")
        .field(userEntity.usCreated.userLoginId,'createdBy')
        .field(userEntity.usEdited.userLoginId,'editedBy')
        .from(roleTypeEntity.tableName)
        .left_join(privilegeEntity.tableName,null,
            squelUtils.joinEql("("+privilegeEntity.columns.userLevel+"&"+roleTypeEntity.columns.bitValue+")",roleTypeEntity.columns.bitValue)
        )
        .join(roleTypePrivilegeEntity.tableName, null,  squel.expr()
            .and(squelUtils.joinEql(roleTypeEntity.columns.id,roleTypePrivilegeEntity.columns.roleTypeId))
            .and(squelUtils.joinEql(privilegeEntity.columns.id,roleTypePrivilegeEntity.columns.privilegeId))
              )
        .left_join(userEntity.tableName, userEntity.usCreated.alias,
           squelUtils.joinEql(userEntity.usCreated.id,privilegeEntity.columns.createdBy)
        )
        .left_join(userEntity.tableName, userEntity.usEdited.alias,
            squelUtils.joinEql(userEntity.usEdited.id,privilegeEntity.columns.editedBy)
        )
        .where(
            squel.expr().and(squelUtils.eql(roleTypeEntity.columns.id,data.roleTypeId))
            .and(squelUtils.eql(privilegeEntity.columns.isDeleted,0))
        )
    }else{
        query = squel.select()
        .field(privilegeEntity.columns.id,"id")
        .field(privilegeEntity.columns.name,"name")
        .field(privilegeEntity.columns.code,"code")
        .field(privilegeEntity.columns.type,"type")
        .field(privilegeEntity.columns.userLevel,"userLevel")
        .field(privilegeEntity.columns.category,"category")
        .field(privilegeEntity.columns.isDeleted,"isDeleted")
        .field(privilegeEntity.columns.createdDate,"createdOn")
        .field(privilegeEntity.columns.editedDate,"editedOn")
        .field(userEntity.usCreated.userLoginId,'createdBy')
        .field(userEntity.usEdited.userLoginId,'editedBy')
        .from(privilegeEntity.tableName)
        .left_join(userEntity.tableName, userEntity.usCreated.alias,
           squelUtils.joinEql(userEntity.usCreated.id,privilegeEntity.columns.createdBy)
        )
        .left_join(userEntity.tableName, userEntity.usEdited.alias,
            squelUtils.joinEql(userEntity.usEdited.id,privilegeEntity.columns.editedBy)
        )
        .where(
            squel.expr().and(squelUtils.eql(privilegeEntity.columns.isDeleted,0))
        )
    }
    query = query.toString();

    logger.debug("Get all privileges Query" + query);
    connection.query(query, function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

PrivilegeDao.prototype.getPrivilegeByUserAndModule = function (data, cb){
    var connection = baseDao.getConnection(data);

    var query = squel.select()
    .from(rolePrivilegeEntity.tableName)
    .left_join(privilegeEntity.tableName,null,
        squelUtils.joinEql(privilegeEntity.columns.id,rolePrivilegeEntity.columns.privilegeId)
    )
    .where(
        squel.expr().and(squelUtils.eql(rolePrivilegeEntity.columns.roleId,data.user.roleId))
        .and(squelUtils.eql(privilegeEntity.columns.code,data.categoryCode))
        .and(squelUtils.eql(privilegeEntity.columns.category,data.moduleName))
        .and(squelUtils.eql(privilegeEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Get privilege by user and module Query" + query);
    connection.query(query, [data.user.roleId, data.categoryCode, data.moduleName], function(err, result){
        if(err){
            return cb(err);
        } else {
            return cb(null, result);
        }
    });
};

module.exports = PrivilegeDao;