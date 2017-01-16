"use strict";

var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var moduleName = __filename;
var cache = require('service/cache').local;
var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');

var userEntity = require("entity/user/User.js");
var teamEntity = require("entity/team/Team.js");
var roleEntity = require("entity/role/Role.js");
var userTeamEntity = require("entity/user/UserTeam.js");
var userFirmEntity = require("entity/user/UserFirm.js");
var roleTypeEntity = require("entity/role/RoleType.js");
var rolePrivilegeEntity = require("entity/role/RolePrivilege.js");
var privilegeEntity = require("entity/privilege/Privilege.js");

var UserDao = function () { }

UserDao.prototype.add = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("User object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[userEntity.columns.orionConnectExternalId] = data.orionConnectExternalId;
    queryData[userEntity.columns.userLoginId] = data.userLoginId;
    queryData[userEntity.columns.firstName] = data.firstName;
    queryData[userEntity.columns.lastName] = data.lastName;
    queryData[userEntity.columns.email] = data.email;
    queryData[userEntity.columns.roleId] = data.roleId;
    queryData[userEntity.columns.status] = data.status;
    queryData[userEntity.columns.isDeleted] = data.isDeleted | 0;
    queryData[userEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[userEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userEntity.columns.createdDate] = currentDate;
    queryData[userEntity.columns.editedDate] = currentDate;

    if (data.startDate) {
        queryData[userEntity.columns.startDate] = data.startDate;
    }
    if (data.expireDate) {
        queryData[userEntity.columns.expireDate] = data.expireDate;
    }

    var query = ' INSERT INTO '+userEntity.tableName+' SET ? ON DUPLICATE KEY UPDATE ? ';
    connection.query(query, [queryData,queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserDao.prototype.getDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("User object", JSON.stringify(data.user));
    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }
    var query = squel.select()
    .field(userEntity.columns.id,'id')
    .field(userEntity.columns.orionConnectExternalId,'orionConnectExternalId')
    .field(userEntity.columns.email,'email')
    .field(userEntity.columns.userLoginId,'userLoginId')
    .field(userEntity.columns.createdDate,'createdDate')
    .field(userEntity.columns.editedDate,'editedDate')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .field(userEntity.columns.createdDate,'createdDate')
    .field(userEntity.columns.startDate,'startDate')
    .field(userEntity.columns.expireDate,'expireDate')
    .field(userEntity.columns.firstName,'firstName')
    .field(userEntity.columns.lastName,'lastName')
    .field(userEntity.columns.status,'status')
    .field(userEntity.columns.isDeleted,'isDeleted')
    .field(teamEntity.columns.id,'teamId')
    .field(teamEntity.columns.name,'teamName')
    .field(roleEntity.columns.id,'roleId')
    .field(roleEntity.columns.name,'roleName')
    .from(userEntity.tableName)
    .left_join(roleEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleEntity.columns.id,userEntity.columns.roleId))
                .and(squelUtils.joinEql(roleEntity.columns.isDeleted,0))
              )
    .left_join(userTeamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(userTeamEntity.columns.userId,userEntity.columns.id))
                .and(squelUtils.joinEql(userTeamEntity.columns.isDeleted, 0))
              )
    .left_join(teamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(teamEntity.columns.id,userTeamEntity.columns.teamId))
                .and(squelUtils.joinEql(teamEntity.columns.isDeleted,0))
              )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,userEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,userEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.eql(userEntity.columns.id,data.id))
    );

    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(userEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(userEntity.columns.isDeleted,0))
        )
    }
    query = query.toString();
    logger.debug("User Detail Query", query);

    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

UserDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = squel.select()
    .from(userEntity.tableName)
    .where(squel.expr()
        .and(squel.expr()
        .or(squelUtils.eql(userEntity.columns.id,data.id))
        .or(squelUtils.eql(userEntity.columns.orionConnectExternalId,data.orionConnectExternalId)))
        .and(squelUtils.eql(userEntity.columns.isDeleted,0))
    );

    query = query.toString();
    logger.debug("User Get Query", query);

    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var roleTypeId = data.user.roleTypeId;
    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }
    var query = squel.select()
    .field(userEntity.columns.id,'id')
    .field(userEntity.columns.orionConnectExternalId,'orionConnectExternalId')
    .field(userEntity.columns.email,'email')
    .field(userEntity.columns.userLoginId,'userLoginId')
    .field(userEntity.columns.createdDate,'createdDate')
    .field(userEntity.columns.editedDate,'editedDate')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .field(userEntity.columns.createdDate,'createdDate')
    .field(userEntity.columns.startDate,'startDate')
    .field(userEntity.columns.expireDate,'expireDate')
    .field(userEntity.columns.firstName,'firstName')
    .field(userEntity.columns.lastName,'lastName')
    .field(userEntity.columns.status,'status')
    .field(userEntity.columns.isDeleted,'isDeleted')
    .field(teamEntity.columns.id,'teamId')
    .field(teamEntity.columns.name,'teamName')
    .field(roleEntity.columns.id,'roleId')
    .field(roleEntity.columns.name,'roleName')
    .from(userEntity.tableName)
    .left_join(roleEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleEntity.columns.id,userEntity.columns.roleId))
                .and(squelUtils.joinEql(roleEntity.columns.isDeleted,0))
              )
    .left_join(userTeamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(userTeamEntity.columns.userId,userEntity.columns.id))
                .and(squelUtils.joinEql(userTeamEntity.columns.isDeleted, 0))
              )
    .left_join(teamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(teamEntity.columns.id,userTeamEntity.columns.teamId))
                .and(squelUtils.joinEql(teamEntity.columns.isDeleted,0))
              )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,userEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,userEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.eql(1,1))
    );
    if(roleTypeId !== enums.roleType.FIRMADMIN){
        query.where(
            squel.expr().and(squelUtils.in(teamEntity.columns.id,data.user.teamIds))
        )
    }
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(userEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(userEntity.columns.isDeleted,0))
        )
    }
    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.where(
                squel.expr().and(
                    squel.expr()
                    .or(squelUtils.eql(userEntity.columns.id,data.search))
                    .or(squelUtils.like(squelUtils.concat(userEntity.columns.firstName,userEntity.columns.lastName,null),data.search))
                )
            )
        } else {
            query.where(
                squel.expr().and(
                    squelUtils.like(squelUtils.concat(userEntity.columns.firstName,userEntity.columns.lastName,null),data.search)
                )
            )
        }
    }
 query = query.toString();
 logger.debug("Get User List Query" + query);
 connection.query(query, function (err, data) {
    if (err) {
        return cb(err);
    }
    var users = [];
    data.forEach(function (user) {
        users.push(user);
    });
    return cb(null, users);
});
};

UserDao.prototype.update = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("User Object", data);

    var queryData = {};
    queryData[userEntity.columns.id] = data.id;
    queryData[userEntity.columns.status] = data.status;
    queryData[userEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    queryData[userEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    if(data.orionConnectExternalId) {
        queryData[userEntity.columns.orionConnectExternalId] = data.orionConnectExternalId;
    }
    if (data.isDeleted) {
        queryData[userEntity.columns.isDeleted] = data.isDeleted;
    }
    if(data.userLoginId){
        queryData[userEntity.columns.userLoginId] = data.userLoginId;
    }
    if (data.firstName) {
        queryData[userEntity.columns.firstName] = data.firstName;
    }
    if (data.lastName) {
        queryData[userEntity.columns.lastName] = data.lastName;
    }
    if (data.email) {
        queryData[userEntity.columns.email] = data.email;
    }
    if (data.roleId) {
        queryData[userEntity.columns.roleId] = data.roleId;
    }
    if (data.startDate) {
        queryData[userEntity.columns.startDate] = data.startDate;
    }
    if (data.expireDate) {
        queryData[userEntity.columns.expireDate] = data.expireDate;
    }
    var query = 'UPDATE '+userEntity.tableName+' SET ? WHERE '+userEntity.columns.id+' = ? and '+userEntity.columns.isDeleted+' = 0';
    connection.query(query, [queryData, data.id], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);

    });
};

UserDao.prototype.delete = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("User Delete Object", data);

    var queryData = {};
    queryData[userEntity.columns.isDeleted] = 1;
    queryData[userEntity.columns.status] = 0;
    queryData[userEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    queryData[userEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    var query = 'UPDATE '+userEntity.tableName+' SET ? where '+userEntity.columns.id+' = ? AND '+userEntity.columns.isDeleted+' = 0 '
    connection.query(query, [queryData, data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserDao.prototype.getEclipseUserByConnectUserId = function (data, cb) {
    var connection = baseDao.getCommonDBConnection(data);
    logger.debug("Orion UserId", data.orionUserId);

    var query = squel.select()
    .from(userEntity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(userEntity.columns.orionConnectExternalId,data.orionUserId))
        .and(squelUtils.eql(userEntity.columns.isDeleted,0))
    );
    query = query.toString();

    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
UserDao.prototype.updateUserTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Update User Team", data);
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[userTeamEntity.columns.teamId] = data.teamId;
    queryData[userTeamEntity.columns.userId] = data.userId;
    queryData[userTeamEntity.columns.isDeleted] = data.isDeleted | 0;
    queryData[userTeamEntity.columns.editedDate] = currentDate;
    queryData[userTeamEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    var query = 'UPDATE '+userTeamEntity.tableName+' set ? WHERE '+userTeamEntity.columns.userId+' = ? AND '+userTeamEntity.columns.teamId+' = ? AND '+userTeamEntity.columns.isDeleted+' = 0';
    connection.query(query, [queryData, data.userId, data.teamId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
UserDao.prototype.removeTeamfromUser = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Remove Team From User", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);
    
    var query = [];
    query.push('Update '+userTeamEntity.tableName+' SET '+userTeamEntity.columns.isDeleted+' = 1 WHERE '+userTeamEntity.columns.userId+' = ? AND '+userTeamEntity.columns.isDeleted+' = 0');
    if(data.teamIds && data.teamIds.length > 0){
    	query.push(" AND teamId NOT IN(?) ");
    }  
    query = query.join("");
        
    logger.debug("remove team from user Query"+query);    
    connection.query(query, [data.userId, data.teamIds], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};


UserDao.prototype.assignUserToTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Assign Team To User", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);

    var query = 'INSERT INTO '+userTeamEntity.tableName
    + ' ('+userTeamEntity.columns.userId+', '+userTeamEntity.columns.teamId
    + ' , '+userTeamEntity.columns.createdBy+', '+userTeamEntity.columns.createdDate
    + ' ,'+userTeamEntity.columns.editedBy+', '
    + ' '+userTeamEntity.columns.editedDate+') VALUES ? ON DUPLICATE KEY UPDATE ?';
    
    var userTeams = [];
    var teams = data.teamIds;
    if (teams) {
        teams.forEach(function (teamId) {
            var userTeam = [];
            userTeam.push(data.userId);
            userTeam.push(teamId);
            userTeam.push(utilService.getAuditUserId(data.user));
            userTeam.push(currentDate);
            userTeam.push(utilService.getAuditUserId(data.user));
            userTeam.push(currentDate);
            userTeams.push(userTeam);  
        });
    }

    var updateUserTeam = {};
    updateUserTeam[userTeamEntity.columns.isDeleted] = 0;
    updateUserTeam[userTeamEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    updateUserTeam[userTeamEntity.columns.createdDate] = currentDate;
    updateUserTeam[userTeamEntity.columns.editedDate] = currentDate;
    updateUserTeam[userTeamEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    

    if (userTeams.length > 0) {
        var queryString = connection.query(query, [userTeams, updateUserTeam], function (err, resultSet) {
            if (err) {
                return cb(err);
            }
            return cb(null, resultSet);
        });
        logger.debug("Assign user team Query "+queryString.sql);
    } else {
        return cb(null, []);
    }
};

UserDao.prototype.assignRoleToUser = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Assign Role to User", data);

    var queryData = {};
    queryData[userEntity.columns.id] = data.id;
    queryData[userEntity.columns.roleId] = data.roleId;
    queryData[userEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userEntity.columns.editedDate] = utilDao.getSystemDateTime(null);

    var query = 'UPDATE '+userEntity.tableName+' SET ? WHERE '+userEntity.columns.id+' = ? ';
    connection.query(query, [queryData, data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserDao.prototype.updateUserRole = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Update Role to User", data);

    var queryData = {};
    queryData[userEntity.columns.id] = data.id;
    queryData[userEntity.columns.roleId] = data.roleId;
    queryData[userEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userEntity.columns.editedDate] = utilDao.getSystemDateTime(null);

    var query = 'UPDATE '+userEntity.tableName+' SET ? WHERE '+userEntity.columns.id+' = ? ';
    connection.query(query, [queryData, data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserDao.prototype.assignUserToFirm = function (data, cb) {

	var connection = baseDao.getCommonDBConnection(data);

    logger.debug("Assign Firm to User", JSON.stringify(data));

    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[userFirmEntity.columns.id] = data.id;
    queryData[userFirmEntity.columns.orionConnectExternalId] = data.orionConnectExternalId;
    queryData[userFirmEntity.columns.firmId] = data.firmId || data.user.firmId;
    queryData[userFirmEntity.columns.isDefault] = data.isDefault || 1;
    queryData[userFirmEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[userFirmEntity.columns.createdDate] = currentDate;
    queryData[userFirmEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userFirmEntity.columns.editedDate] = currentDate;

    var query = 'INSERT INTO '+userFirmEntity.tableName+' SET ? ON DUPLICATE KEY UPDATE ? ';
    connection.query(query, [queryData, queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserDao.prototype.removeUserFromFirm = function (data, cb) {
	logger.debug(" Remove user from Firm ", data);

	var connection = baseDao.getCommonDBConnection(data);

    var currentDate = utilDao.getSystemDateTime(null);

    var id = data.id;
    var firmId = data.firmId || data.user.firmId;
    
    var queryData = {};
    queryData[userFirmEntity.columns.isDeleted] = 1;
    queryData[userFirmEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userFirmEntity.columns.editedDate] = currentDate;

    var query = 'UPDATE '+userFirmEntity.tableName+' SET ?  WHERE '+userFirmEntity.columns.id+' = ? AND '+userFirmEntity.columns.firmId+' = ? AND '+userFirmEntity.columns.isDeleted+' = 0 ';
    connection.query(query, [queryData, id, firmId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

UserDao.prototype.getUserRoleandPrivilege = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }

    var query = squel.select()
    .field(privilegeEntity.columns.id,'id')
    .field(privilegeEntity.columns.isDeleted,'isDeleted')
    .field(privilegeEntity.columns.name,'name')
    .field(rolePrivilegeEntity.columns.canAdd,'canAdd')
    .field(rolePrivilegeEntity.columns.canUpdate,'canUpdate')
    .field(rolePrivilegeEntity.columns.canDelete,'canDelete')
    .field(rolePrivilegeEntity.columns.canRead,'canRead')
    .field(rolePrivilegeEntity.columns.createdDate,'createdDate')
    .field(rolePrivilegeEntity.columns.editedDate,'editedDate')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(userEntity.tableName)
    .left_join(roleEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleEntity.columns.id,userEntity.columns.roleId))
                .and(squelUtils.joinEql(roleEntity.columns.isDeleted,0))
              )
    .left_join(rolePrivilegeEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(rolePrivilegeEntity.columns.roleId,roleEntity.columns.id))
                .and(squelUtils.joinEql(rolePrivilegeEntity.columns.isDeleted,0))
              )
    .left_join(privilegeEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(privilegeEntity.columns.id,rolePrivilegeEntity.columns.privilegeId))
                .and(squelUtils.joinEql(privilegeEntity.columns.isDeleted,0))
              )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,userEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,userEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.eql(userEntity.columns.id,data.id))
    )
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(userEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(userEntity.columns.isDeleted,0))
        )
    }
    query = query.toString();

    logger.debug("Get User role and privileges query", query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

UserDao.prototype.getUserRoleAndTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }
     var query = squel.select()
    .field(userEntity.columns.id,'id')
    .field(userEntity.columns.orionConnectExternalId,'orionConnectExternalId')
    .field(roleEntity.columns.id,'roleId')
    .field(roleEntity.columns.name,'roleName')
    .field('GROUP_CONCAT('+teamEntity.columns.id+' SEPARATOR ",")','teamId')
    .field('GROUP_CONCAT('+teamEntity.columns.name+' SEPARATOR ",")','teamName')
    .from(userEntity.tableName)
    .left_join(roleEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleEntity.columns.id,userEntity.columns.roleId))
                .and(squelUtils.joinEql(roleEntity.columns.isDeleted,0))
              )
    .left_join(userTeamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(userTeamEntity.columns.userId,userEntity.columns.id))
                .and(squelUtils.joinEql(userTeamEntity.columns.isDeleted, 0))
              )
    .left_join(teamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(teamEntity.columns.id,userTeamEntity.columns.teamId))
                .and(squelUtils.joinEql(teamEntity.columns.isDeleted,0))
              )
    .where(
        squel.expr().and(squelUtils.eql(userEntity.columns.id,data.id))
    )
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(userEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(userEntity.columns.isDeleted,0))
        )
    }
    query.group(userEntity.columns.id);

    query = query.toString();
    logger.debug("Get User role and team query", query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });i
};

UserDao.prototype.getLoggedInUserWithUserId = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("get user object", JSON.stringify(data));
    var query = 'SELECT users.id as id, users.name as name,users.eclipseDbId AS eclipseDbId, userRole.roleId as roleId, roles.roleName as roleType,';
    query += ' users.isDeleted as isDeleted, users.userLoginName as createdBy, users.userLoginName as editedBy,';
    query += ' users.createdDate as createdOn, users.editedDate as editedOn, users.email as email,';
    query += ' rolePrivilege.canAdd, rolePrivilege.canUpdate, rolePrivilege.canDelete, rolePrivilege.canRead,';
    query += ' prv.name, prv.id AS privilegeId, prv.code AS code'
    query += ' FROM user as users';
    query += ' left outer join userRole as userRole on users.id = userRole.userId';
    query += ' left outer join role as roles on roles.id = userRole.roleId';
    query += ' left outer join roleTypePrivilege AS rolePrivilege ON rolePrivilege.roleId = roles.id';
    query += ' left outer join privilege AS prv ON prv.id = rolePrivilege.privilegeId';
    query += ' WHERE users.id = '+data.userId;
    query += ' and users.isDeleted = 0';
    logger.info("query for get loggedIn user  " + query); 
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

UserDao.prototype.getEclipseUserPrivilege = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("get user object");
    var query = 'SELECT userRole.id, userRole.roleName, rpv.canAdd, rpv.canUpdate, rpv.canDelete, rpv.canRead,';
    query += ' pv.code, pv.name, pv.id as privilegeId';
    query += ' from role as userRole';
    query +=' left outer join roleTypePrivilege as rpv on rpv.roleId = userRole.id';
    query += ' left outer join privilege as pv on pv.id = rpv.privilegeId';
    query += ' WHERE userRole.id = '+data.eclipseUserRoleId;
    logger.info("query for get loggedIn user  " + query); 
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

/*UserDao.prototype.getLoggedInUserWithUserId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    data.isDeleted = 0;

    var query = squel.select()
    .field(userEntity.columns.id,'id')
    .field(userEntity.columns.orionConnectExternalId,'orionConnectExternalId')
    .field(roleEntity.columns.id,'roleId')
    .field(roleEntity.columns.name,'roleName')
    .field(roleTypeEntity.columns.id,'roleTypeId')
    .field(roleTypeEntity.columns.bitValue,'roleTypeBitValue')
    .field(roleTypeEntity.columns.roleType,'roleType')
    .field(privilegeEntity.columns.code,'code')
    .field(privilegeEntity.columns.category,'category')
    .field(privilegeEntity.columns.name,'name')
    .field(rolePrivilegeEntity.columns.privilegeId,'privilegeId')
    .field(rolePrivilegeEntity.columns.canAdd,'canAdd')
    .field(rolePrivilegeEntity.columns.canUpdate,'canUpdate')
    .field(rolePrivilegeEntity.columns.canDelete,'canDelete')
    .field(rolePrivilegeEntity.columns.canRead,'canRead')
    .field(teamEntity.columns.id,'teamId')
    .field(teamEntity.columns.name,'teamName')
    .from(userEntity.tableName)
    .left_join(roleEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleEntity.columns.id,userEntity.columns.roleId))
                .and(squelUtils.joinEql(roleEntity.columns.isDeleted,0))
                .and(squelUtils.joinEql(roleEntity.columns.status,1))
              )
    .left_join(roleTypeEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleTypeEntity.columns.id,roleEntity.columns.roleTypeId))
              )
    .left_join(rolePrivilegeEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(rolePrivilegeEntity.columns.roleId,roleEntity.columns.id))
                .and(squelUtils.joinEql(rolePrivilegeEntity.columns.isDeleted,0))
              )
    .left_join(privilegeEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(rolePrivilegeEntity.columns.privilegeId,privilegeEntity.columns.id))
                .and(squelUtils.joinEql(privilegeEntity.columns.isDeleted,0))
              )
    .left_join(userTeamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(userTeamEntity.columns.userId,userEntity.columns.id))
                .and(squelUtils.joinEql(userTeamEntity.columns.isDeleted, 0))
              )
    .left_join(teamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(teamEntity.columns.id,userTeamEntity.columns.teamId))
                .and(squelUtils.joinEql(teamEntity.columns.isDeleted,0))
                .and(squelUtils.joinEql(teamEntity.columns.status,1))
              )
    .where(
        squel.expr().and(squelUtils.eql(userEntity.columns.id,data.userId))
                .and(squelUtils.eql(userEntity.columns.isDeleted,0))
                .and(squelUtils.eql(userEntity.columns.status,1))
    )

    query = query.toString();

    logger.debug("Get User details for logged-in user query", query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};*/

UserDao.prototype.changeStatusToActive  = function(data,cb){
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' UPDATE '+userEntity.tableName+' SET '+userEntity.columns.status+' = 1 ');
    query.push(' WHERE ('+userEntity.columns.startDate+' <= NOW() ');
    query.push(' OR '+userEntity.columns.startDate+' IS NULL) ');
    query.push(' AND '+userEntity.columns.expireDate+' > NOW() ');
    query.push(' AND '+userEntity.columns.roleId+' IN (SELECT '+roleEntity.columns.id);
    query.push(' from '+roleEntity.tableName+' where '+roleEntity.columns.status);
    query.push(' = 1 and '+roleEntity.columns.isDeleted+' = 0) ');

    query = query.join(" ");
    connection.query(query, function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);

    });
};
UserDao.prototype.changeStatusToInActive  = function(data,cb){
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' UPDATE '+userEntity.tableName+' SET '+userEntity.columns.status+' = 0 ');
    query.push(' WHERE ('+userEntity.columns.startDate+' > NOW()) ');
    query.push(' OR '+userEntity.columns.expireDate+' <= NOW() ');
    query.push(' AND '+userEntity.columns.roleId+' IN ');
    query.push(' (SELECT '+roleEntity.columns.id+' from '+roleEntity.tableName);
    query.push(' where '+roleEntity.columns.status+' = 1 and '+roleEntity.columns.isDeleted+' = 0) ');

    query = query.join(" ");
    connection.query(query, function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);

    });
};

UserDao.prototype.getAccessForUser  = function(data,cb){
    var connection = baseDao.getConnection(data);
    var userId = data.userId;

    var query = squel.select()
    .field(teamEntity.columns.id,'teamId')
    .field(teamEntity.columns.portfolioAccess,'portfolioAccess')
    .field(teamEntity.columns.modelAccess,'modelAccess')
    .from(userTeamEntity.tableName)
    .join(teamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(teamEntity.columns.id,userTeamEntity.columns.teamId))
              )
    .where(
        squel.expr().and(squelUtils.eql(userTeamEntity.columns.userId,userId))
                .and(squelUtils.eql(userTeamEntity.columns.isDeleted,0))
                .and(squelUtils.eql(teamEntity.columns.isDeleted,0))
    )
    
    query = query.toString();
    logger.debug(query);
    
    connection.query(query, function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

UserDao.prototype.roleTypeForUser  = function(data,cb){
    var connection = baseDao.getConnection(data);
    var userId = data.userId;

     var query = squel.select()
    .field(teamEntity.columns.id,'teamId')
    .field(teamEntity.columns.portfolioAccess,'portfolioAccess')
    .field(teamEntity.columns.modelAccess,'modelAccess')
    .from(userTeamEntity.tableName)
    .join(teamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(teamEntity.columns.id,userTeamEntity.columns.teamId))
              )
    .where(
        squel.expr().and(squelUtils.eql(userTeamEntity.columns.userd,userId))
                .and(squelUtils.eql(userTeamEntity.columns.isDeleted,0))
                .and(squelUtils.eql(teamEntity.columns.isDeleted,0))
    );

    query = query.toString();
    logger.debug("Role type for user query "+query);
    
    connection.query(query, function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

UserDao.prototype.getLogInUserRoleAndTeam = function(data,cb){
    var connection = baseDao.getConnection(data);
    var id = data.userId;

     var query = squel.select()
    .field(userEntity.columns.id,'id')
    .field(userEntity.columns.orionConnectExternalId,'orionConnectExternalId')
    .field(userEntity.columns.roleId,'roleId')
    .field(userTeamEntity.columns.teamId,'teamId')
    .from(userEntity.tableName)
    .join(roleEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(roleEntity.columns.id,userEntity.columns.roleId))
              )
    .join(userTeamEntity.tableName, null, squel.expr()
                .and(squelUtils.joinEql(userEntity.columns.id,userTeamEntity.columns.userId))
              )
    .where(
        squel.expr().and(squelUtils.eql(userEntity.columns.id,id))
                .and(squelUtils.eql(userTeamEntity.columns.isDeleted,0))
                .and(squelUtils.eql(userEntity.columns.isDeleted,0))
                .and(squelUtils.eql(roleEntity.columns.isDeleted,0))
    );

    query = query.toString();

    logger.debug("GetLogInUserRoleAndTeam Query = "+query);
    connection.query(query, [id], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

UserDao.prototype.getUserSummary  = function(data,cb){
    var connection = baseDao.getConnection(data);
    var query = "CALL getDashboardSummaryUsers(?)" ;
    var currentUserId =data.user.userId;
    connection.query(query,[currentUserId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet[0][0]);
    });
};

UserDao.prototype.changeUserStatusBasedOnRoleStatus = function(data,cb){
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[userEntity.columns.status] = data.status;
    queryData[userEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userEntity.columns.editedDate] = currentDate;

    var query = [];
    query.push("Update "+userEntity.tableName+" set ? ");
    query.push(" where "+userEntity.columns.roleId+" = ? ");

    query = query.join(" ");

    connection.query(query,[queryData,data.roleId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
}

/*authenticate with community db*/
UserDao.prototype.getLoggedInUserDetails = function (data, cb){
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT users.id as id, users.name as name, users.eclipseDbId AS eclipseDbId, userRole.roleId as roleId, roles.roleName as roleType,';
    query += ' users.isDeleted as isDeleted, users.userLoginName as createdBy, users.userLoginName as editedBy,';
    query += ' users.createdDate as createdOn, users.editedDate as editedOn, users.email as email';
    query += ' FROM  user as users';
    query += ' left outer join userRole as userRole on users.id = userRole.userId';
    query += ' left outer join role as roles on roles.id = userRole.roleId'; 
    query += ' WHERE users.userLoginName = "' + data.loginUserId + '"';
    query += ' and users.isDeleted = 0';
    logger.info("query for get loggedin user  " + query); 
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

module.exports = UserDao;    
