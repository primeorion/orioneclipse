"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var sharedCache = require('service/cache').shared;
var localCache = require('service/cache').local;
var util = require('util');

var UserDao = function () {}

var tableNames = [
    'strategist',
    'user',
    'strategistUser',
    'model',
    'userRole',
    'strategistStatus',
    'role',
    'document',
    'userDocument'
];

UserDao.prototype.getUserList = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("getUserRoleList object", JSON.stringify(data));
    var flag = false;
    var communityToken = localCache.get(data.reqId).session.token;
    sharedCache.get(communityToken, function (err, tokenData) {
        var tokenData = JSON.parse(tokenData);
        //new query
        var query = 'SELECT users.id as id , users.name as name, userRole.roleId as roleId, Role.roleName as roleType';
        query += ' ,users.orionConnectExternalId as orionConnectExternalId, users.userLoginName as loginUserId';
        query += ' ,users.createdDate as createdOn, USER.userLoginName as createdBy, users.editedDate as editedOn';
        query += ' ,USERS.userLoginName as editedBy';
        query += ' ,strategists.id as strategistId, strategists.name as strategistName';
        query += ' ,(CASE WHEN (usersStrategist.userLoginName IS NULL) THEN NULL ELSE strategists.createdDate END) AS strategistCreatedOn';
        query += ' ,usersStrategist.userLoginName as strategistCreateBy, userStrategist.userLoginName as strategistEditedBy'
        query += ' ,(CASE WHEN (userStrategist.userLoginName IS NULL) THEN NULL ELSE strategists.editedDate END) AS strategistEditedOn'
        query += ' ,logo.path as path';
        query += ' FROM ' + tableNames[1] + ' as users';
        query += ' left outer join ' + tableNames[4] + ' as userRole on userRole.userId = users.id';
        query += ' left outer join ' + tableNames[6] + ' as Role on Role.id = userRole.roleId';
        query += ' left outer join ' + tableNames[1] + ' as USER on USER.id = users.createdBy';
        query += ' left outer join ' + tableNames[1] + ' as USERS on USERS.id = users.editedBy';
        query += ' left outer join ' + tableNames[2] + ' as strategistUser on strategistUser.userId = users.id';
        query += ' left outer join ' + tableNames[0] + ' as strategists on strategists.id = strategistUser.strategistId AND strategists.isDeleted = 0';
        query += ' left outer join ' + tableNames[1] + ' as usersStrategist on usersStrategist.id = strategists.createdBy AND strategists.isDeleted = 0';
        query += ' left outer join ' + tableNames[1] + ' as userStrategist on userStrategist.id = strategists.editedBy AND strategists.isDeleted = 0';
        query += ' left outer join ' + tableNames[8] + ' as logo on logo.userId = users.id';
        query += ' where users.isDeleted = 0';

        if(data.assignedUserId != null) {
         query +=   ' AND users.id = ' + data.assignedUserId;
        } else {
          if (tokenData.roleName == 'Strategist User') {
              query += ' AND users.id = ' + data.user.userId;
          }
          else if (tokenData.roleName == 'Strategist Admin') {
            query += ' AND users.id IN (SELECT suu.userId from user as us left outer join strategistUser as su on su.userId= us.id';
            query += '  LEFT outer join strategistUser as suu on suu.strategistId = su.strategistId where us.id = ' + data.user.userId;
            query += ' )';
          }
        }
        logger.debug('list of users query is ' + query);
        connection.query(query, function (err, result) {
            if (err) {
                return cb(err);
            }

            return cb(null, result);
        });
    });

    //old query
    // var query = 'SELECT users.id as id , users.name as name, userRole.roleId as roleId, Role.roleName as roleType' 
    // query += ' ,users.createdDate as createdOn, users.userLoginName as createdBy, users.editedDate as editedOn';
    // query += ' ,users.userLoginName as editedBy'
    // query += ' ,strategists.id as strategistId, strategists.name as strategistName, strategists.createdDate as strategistCreatedOn';
    // query += ' ,users.userLoginName as strategistCreateBy, users.userLoginName as strategistEditedBy'
    // query += ' ,strategists.editedDate as strategistEditedOn'
    // query += ' ,path';
    // query += ' FROM '+ tableNames[1] + ' as users';
    // query += ' left outer join ' + tableNames[4] + ' as userRole on userRole.userId = users.id';
    // query += ' left outer join ' + tableNames[6] + ' as Role on Role.id = userRole.roleId';
    // query += ' left outer join ' + tableNames[2] + ' as strategistUser on strategistUser.userId = users.id';
    // query += ' left outer join ' + tableNames[0] + ' as strategists on strategists.id = strategistUser.strategistId';
    // query += ' left outer join ' + tableNames[8] + ' as logo on logo.userId = users.id';
    // query += ' WHERE users.createdBy = ?';
    // query += ' and users.isDeleted = 0 and strategists.isDeleted = 0';
}

UserDao.prototype.getUserDetail = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT users.id as id , users.name as name, userRole.roleId as roleId, Role.roleName as roleType';
    query += ' ,users.orionConnectExternalId as orionConnectExternalId, users.userLoginName as loginUserId';
    query += ' ,users.createdDate as createdOn, users.userLoginName as createdBy, users.editedDate as editedOn';
    query += ' ,users.userLoginName as editedBy'
    query += ' ,logo.path as path';
    query += ' FROM ' + tableNames[1] + ' as users';
    query += ' left outer join ' + tableNames[4] + ' as userRole on userRole.userId = users.id';
    query += ' left outer join ' + tableNames[6] + ' as Role on Role.id = userRole.roleId';
    query += ' left outer join ' + tableNames[8] + ' as logo on logo.userId = users.id';
    query += ' WHERE users.id = ?';
    query += ' and users.createdBy = ?';
    query += ' and users.isDeleted = 0';

    logger.debug('user details query is ' + query);
    connection.query(query, [data.assignedUserId, data.user.userId], function (err, result) {
        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
}

UserDao.prototype.getUserRoleList = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'select id as roleId, roleName as roleType from ' + tableNames[6];
    query += ' WHERE';
    if (data.roleId) {
        query += ' id=' + data.roleId + ' AND';
    }
    query += ' isVisible = 1';
    logger.debug('user role query is ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
}

UserDao.prototype.getLoggedInUserRole = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT userRole.roleId as roleId, role.roleName as roleType, logo.path FROM ' + tableNames[4];
    query += ' as userRole left outer join ' + tableNames[6] + ' as role on role.id = userRole.roleId ';
    query += ' left outer join ' + tableNames[8] + ' as logo on logo.userId = userRole.userId';
    query += ' WHERE userRole.userId = ' + data.user.userId;

    logger.info("query for get loggedIn user role  " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
}

UserDao.prototype.getLoggedInUserDetails = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT users.id as id, users.name as name, userRole.roleId as roleId, roles.roleName as roleType,';
    query += ' users.isDeleted as isDeleted,users.userLoginName as createdBy, users.eclipseDbId as eclipseDbId, users.userLoginName as editedBy,';
    query += ' users.createdDate as createdOn, users.editedDate as editedOn, users.email as email';
    query += ' FROM ' + tableNames[1] + ' as users';
    query += ' left outer join ' + tableNames[4] + ' as userRole on users.id = userRole.userId';
    query += ' left outer join ' + tableNames[6] + ' as roles on roles.id = userRole.roleId';
    query += ' WHERE users.id = ' + data.user.userId;
    logger.info("query for get loggedIn user  " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

UserDao.prototype.getFirms = function (data, cb) {
    var connection = baseDao.getCommonDBConnection(data);
    var query = 'SELECT `id`,`database` FROM `orionEclipseFirm`';
    logger.debug('The query is:' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

UserDao.prototype.getFirmId = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug('data is: ' + JSON.stringify(data));
    var userId = data.user.userId;
    var query = 'SELECT * FROM ' + tableNames[1] + ' WHERE id=' + userId;
    logger.debug('The query is:' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

UserDao.prototype.getFirmName = function (data, cb) {
    var connection = baseDao.getCommonDBConnection(data);
    var id = data.id;
    var query = 'SELECT `id`, `database` FROM orionEclipseFirm WHERE id=' + id;
    logger.debug('The query is:' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

UserDao.prototype.getLogo = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = data.user.userId;
    var query = 'select * from userDocument where userId=' + userId;
    query += ' and isDeleted=0 and type = 1';
    logger.debug('The query is:' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

UserDao.prototype.getEclipseDatabaseName = function (data, cb) {
    var connection = baseDao.getCommonDBConnection(data);
    var query = 'SELECT `id`,`database` FROM `orionEclipseFirm` WHERE id = ' + data.eclipseDatabaseId;
    logger.debug("The query is: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

UserDao.prototype.getUserByOrionId = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT * FROM `user` WHERE orionConnectExternalId=' + data.orionConnectExternalId;
    query += ' OR userLoginName="' + data.loginUserId + '"';
    logger.debug("get user from orion query is " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

UserDao.prototype.get = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT user.id AS id,userRole.roleId AS roleId, Role.roleName AS roleType, user.orionConnectExternalId AS orionConnectExternalId,';
    query += ' user.name AS name,user.isDeleted AS isDeleted, user.userLoginName AS loginUserId,';
    query += ' user.email AS email, user.createdDate AS createdDate, USER.userLoginName AS createdBy,';
    query += ' user.editedDate AS  editedDate, USERS.userLoginName AS editedBy, user.eclipseDbId AS eclipseDatabaseId';
    query += ' ,logo.path as path';
    query += ' FROM ' + tableNames[1] + ' AS `user`';
    query += ' LEFT OUTER JOIN ' + tableNames[4] + ' AS userRole ON userRole.userId = user.id';
    query += ' LEFT OUTER JOIN ' + tableNames[6] + ' AS Role ON Role.id = userRole.roleId';
    query += ' LEFT OUTER JOIN ' + tableNames[1] + ' AS USER ON USER.id = user.createdBy';
    query += ' LEFT OUTER JOIN ' + tableNames[1] + ' AS USERS ON USERS.id = user.editedBy';
    query += ' LEFT OUTER JOIN ' + tableNames[8] + ' AS logo On logo.userId = user.id';
    query += ' WHERE user.id=' + data.assignedUserId;

    logger.debug('user details query is ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
}

UserDao.prototype.updateUser = function (req, cb) {
    var connection = baseDao.getCommunityDBConnection(req.data);
    var query = 'Update ' + tableNames[1] + ' SET name="' + req.body.name + '" WHERE id IN (' + req.data.user.userId + ')';
    logger.debug('update user query is ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

UserDao.prototype.getUsersStrategistCount = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var communityToken = localCache.get(data.reqId).session.token;
    sharedCache.get(communityToken, function (err, tokenData) {
        var tokenData = JSON.parse(tokenData);
        connection.query('call getUserAndStrategistCount(?,?)', [data.user.userId, tokenData.roleName], function(err, result){
            if(err){
                return cb(err);
            }
            return cb(null, result);
        });
    });
}

module.exports = UserDao;