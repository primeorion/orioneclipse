"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var sharedCache = require('service/cache').shared;
var localCache = require('service/cache').local;
var util = require('util');
var config = require('config');
var UtilService = require('service/util/UtilService.js');
var utilService = new UtilService();
var messages = config.messages;
var responseCode = config.responseCode;
var tableNames = [
    'strategist',
    'user',
    'strategistUser',
    'model',
    'userRole',
    'strategistStatus',
    'role',
    'document',
    'strategistFirm'
];

var StrategistDao = function () {}

StrategistDao.prototype.getDashboardSummaryData = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    connection.query('CALL dashboard_summary(?)', userId, function (err, data) {
        if (err) {
            logger.error('error while getting dashboard data from db ' + err);
            return cb(err);
        }
        return cb(null, data[0]);
    });
}

StrategistDao.prototype.getStrategistCount = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = '';
    query = 'select count (*) as strategistCount from strategist as strategist left outer join ' + tableNames[1] + ' as user';
    query += ' on user.id = strategist.createdBy left outer join ' + tableNames[1] + ' users on users.id = strategist.editedBy';
    query += ' WHERE 1=1';
    query += ' AND strategist.isDeleted = 0 AND strategist.status = 1';
    logger.debug('query to get strategist count ' + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
}

StrategistDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    try{
        var flag = false;
        var userId = utilService.getAuditUserId(data.user);
        var communityToken = localCache.get(data.reqId).session.token;
        sharedCache.get(communityToken, function (err, tokenData) {
            var tokenData = JSON.parse(tokenData);
            if (tokenData.roleName == 'Strategist Admin' || tokenData.roleName == 'Strategist User') {
                flag = true;
            }
            var query = [];
            query.push('SELECT strategist.id,strategist.name, strategist.status,strategist.isDeleted, strategistStatus.name as statusLabel, ');
            query.push(' strategist.createdDate as createdOn,strategist.editedDate as editedOn');
            query.push(' ,strategist.salesContact,strategist.salesPhone');
            query.push(' ,strategist.salesEmail,strategist.legalAgreement');
            query.push(' ,strategist.supportEmail,strategist.supportContact');
            query.push(' ,strategist.supportPhone,strategist.commentary');
            query.push(' ,strategist.advertisementMessage');
            query.push(', user.userLoginName as createdBy ,users.userLoginName as editedBy');
            query.push(' from ' + tableNames[0] + ' as strategist ');
            query.push(' left outer join ' + tableNames[1] + ' as user  on user.id = strategist.createdBy ');
            query.push(' left outer join ' + tableNames[1] + ' as users  on users.id = strategist.editedBy ');
            if (flag) {
                query.push(' left outer join ' + tableNames[2] + ' as strategistUser  on strategistUser.strategistId = strategist.id ');
            }
            query.push(' left outer join ' + tableNames[5] + ' as strategistStatus  on strategistStatus.id = strategist.status ');

            //check for strategist appear to strategist only
            if (flag) {
                query.push(' WHERE strategistUser.userId = ' + userId);
            } else {
                query.push(' WHERE 1=1 ');
            }

            query.push(' AND strategist.isDeleted=0 ');

            if (data.search) {
                if (data.search.match(/^[0-9]+$/g)) {
                    query.push(' AND strategist.id= "' + data.search + '" OR ');
                } else {
                    query.push(' AND ');
                }
                query.push(' strategist.name LIKE "%' + data.search + '%"');

            }
            query.push(' order by strategist.name ASC');
            query = query.join("");

            logger.debug("Get Strategist List Query" + query);
            connection.query(query, function (err, data) {
                if (err) {
                    logger.error(err);
                    return cb(err);
                }
                return cb(null, data);
            });
        });
    }catch(exception){
        logger.error('exception in getList() ' + exception);
        return cb(messages.internalServerError);
    }
};

StrategistDao.prototype.getListSimple = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var flag = false;
    try{
        var userId = utilService.getAuditUserId(data.user);
        var communityToken = localCache.get(data.reqId).session.token;
        sharedCache.get(communityToken, function (err, tokenData) {
            var tokenData = JSON.parse(tokenData);
            if (tokenData.roleName == 'Strategist Admin' || tokenData.roleName == 'Strategist User') {
                flag = true;
            }
            var query = [];
            query.push('SELECT strategist.id,strategist.name, strategist.status,strategist.isDeleted, strategistStatus.name as statusLabel, ');
            query.push(' strategist.createdDate as createdOn, strategist.editedDate as editedOn');
            query.push(',user.userLoginName as createdBy ,users.userLoginName as editedBy');
            query.push(' from ' + tableNames[0] + ' as strategist');
            query.push(' left outer join ' + tableNames[1] + ' as user on user.id = strategist.createdBy');
            query.push(' left outer join ' + tableNames[1] + ' as users on users.id = strategist.editedBy');
            if (flag) {
                query.push(' left outer join ' + tableNames[2] + ' as strategistUser  on strategistUser.strategistId = strategist.id ');
            }
            query.push(' left outer join ' + tableNames[5] + ' as strategistStatus  on strategistStatus.id = strategist.status ');

            //check for strategist appear to strategist only
            if (flag) {
                query.push(' WHERE strategistUser.userId = ' + userId);
            } else {
                query.push(' WHERE 1=1 ');
            }
            
            if (data.search) {
                if (data.search.match(/^[0-9]+$/g)) {
                    query.push(' AND strategist.id= "' + data.search + '" OR ');
                } else {
                    query.push(' AND ');
                }
                query.push(' strategist.name LIKE %' + data.search + '%');

            }
            query.push(' AND strategist.isDeleted=0 ');
            query.push(' order by strategist.name ASC');
            query = query.join("");

            logger.debug("Get Strategist List Query" + query);
            connection.query(query, function (err, data) {
                if (err) {
                    logger.error(err);
                    return cb(err);
                }
                return cb(null, data);
            });
        });
    } catch (exception) {
        logger.error('Exception in parsing token');
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }
};

StrategistDao.prototype.getDetail = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var self = this;
    try{
        var flag = false;
        var userId = utilService.getAuditUserId(data.user);
        var communityToken = localCache.get(data.reqId).session.token;
        sharedCache.get(communityToken, function (err, tokenData) {
            var tokenData = JSON.parse(tokenData);
            if (tokenData.roleName == 'Strategist Admin' || tokenData.roleName == 'Strategist User') {
                flag = true;
            }
            var query = [];
            query += 'SELECT strategist.id,strategist.name, strategist.status,strategist.isDeleted, strategistStatus.name as statusLabel';
            query += ' ,strategist.createdDate as createdOn, strategist.editedDate as editedOn';
            query += ' ,strategist.salesContact,strategist.salesPhone';
            query += ' ,strategist.salesEmail,strategist.legalAgreement';
            query += ' ,strategist.supportEmail,strategist.supportContact';
            query += ' ,strategist.supportPhone,strategist.commentary';
            query += ' ,strategist.advertisementMessage';
            query += ' ,user.userLoginName as createdBy ,users.userLoginName as editedBy';
            query += ' ,strategist.firmId as eclipseDatabaseId';
            query += ' from ' + tableNames[0] + ' as strategist';
            query += ' left outer join ' + tableNames[1] + ' as user on user.id = strategist.createdBy';
            query += ' left outer join ' + tableNames[1] + ' as users on users.id = strategist.editedBy';
            query += ' left outer join ' + tableNames[5] + ' as strategistStatus  on strategistStatus.id = strategist.status ';
            if (flag) {
                data.assignedUserId = userId;
                self.getStrategistAgainstUsers(data, function (err, strategistDetails) {
                    if (err) {
                        logger.error('Error is get strategist against users (getDetail()) ' + err);
                        return cb(err);
                    }
                    var strategistId = strategistDetails[0].strategistId;
                    if (strategistId != data.id) {
                        return cb(messages.userDoNotHavePermission);
                    } else {
                        query += ' WHERE strategist.id = ' + data.id;
                    }
                    query += ' AND strategist.isDeleted=0';

                    logger.debug("Strategist list detail query " + query);
                    connection.query(query, function (err, result) {
                        if (err) {
                            logger.error("Error in get details " + err);
                            return cb(err);
                        }
                        return cb(null, result);
                    });
                });
            } else {
                query += ' WHERE strategist.id = ' + data.id;
                query += ' AND strategist.isDeleted=0';

                logger.debug("Strategist list detail query " + query);
                connection.query(query, function (err, result) {
                    if (err) {
                        logger.error("Error in get details " + err);
                        return cb(err);
                    }
                    return cb(null, result);
                });
            }
        });
    } catch (exception) {
        logger.error('Exception in parsing token ' + exception);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }
};

StrategistDao.prototype.getStrategistDetailSimple = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = [];
    query.push('SELECT strategist.id,strategist.name, strategist.status,strategist.isDeleted, strategistStatus.name as statusLabel, ');
    query.push(' strategist.createdDate as createdOn, strategist.editedDate as editedOn');
    query.push(',user.userLoginName as createdBy ,users.userLoginName as editedBy, strategist.firmId as eclipseDatabaseId');
    query.push(' from ' + tableNames[0] + ' as strategist');
    query.push(' left outer join ' + tableNames[1] + ' as user on user.id = strategist.createdBy');
    query.push(' left outer join ' + tableNames[1] + ' as users on users.id = strategist.editedBy');
    query.push(' left outer join ' + tableNames[5] + ' as strategistStatus  on strategistStatus.id = strategist.status ');
    query.push(' WHERE strategist.id=?');
    query.push(' AND strategist.isDeleted=0');
    query = query.join("");

    logger.debug("Strategist detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("Error in getStrategistDetailSimple " + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistModals = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    if (!Array.isArray(strategistData)) {
        strategistData = [strategistData];
    }
    var query = '';
    query += 'SELECT SM.id,SM.name, SM.status, ms.name as statusLabel, SM.isDeleted';
    query += ' ,SM.targetRiskLower as targetRiskLower, SM.strategistId as strategistId, SM.targetRiskUpper as targetRiskUpper';
    query += ' ,SM.currentRisk as currentRisk, SM.minimumAmount as minimumAmount';
    query += ' ,SM.createdDate as createdOn, SM.editedDate as editedOn';
    query += ' ,SM.createdBy as createdBy, SM.editedBy as editedBy, SM.allocation as allocation';
    query += ' from ' + tableNames[3] + ' as SM';
    query += ' left outer join modelStatus as ms on ms.id = SM.status';
    query += ' WHERE SM.strategistId IN ( ';
    strategistData.forEach(function (data) {
        query += ' ' + data.id + ','
    });
    query = query.substr(query, query.length - 1);
    query += ')';
    if (data.modelStatus) {
        data.modelStatus = data.modelStatus.replace(/\'/g, '"');
        query += ' AND ms.name LIKE ' + data.modelStatus
    }
    query += ' AND SM.isDeleted=0';

    logger.debug("Strategist models detail query", query);
    connection.query(query, strategistData.id, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.addStrategist = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var inputData = {
        name: data.name,
        firmId: data.eclipseDatabaseId,
        status: data.status,
        isDeleted: 0,
        createdDate: currentDate,
        createdBy: userId,
        editedDate: currentDate,
        editedBy: userId
    };

    var query = 'INSERT INTO strategist SET ? ';
    logger.debug('query to add strategist ', query);
    connection.query(query, [inputData], function (err, result) {
        if (err) {
            logger.error("error on create strategist is " + result);
            return cb(err);
        }
        return cb(null, result);
    });
}

/*StrategistDao.prototype.addStrategistUser = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("addStrategistUser object", JSON.stringify(data.userDetails));
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = 'INSERT INTO user (userId, firstName, lastName, roleId, isDeleted, createdDate, createdBy,';
    query += 'editedBy, editedDate, email, roleId, status, tags, startDate, expireDate, userLoginName) VALUES ';
    data.userDetails.forEach(function(values){
        query += "(" + values.userId + ",'"+values.firstName+"', '" +values.lastName+ "', " + 0 + ", " +0+" ";
        query += ", '" +currentDate+ "', '"+userId+"', '"+userId+"'";
        query += ", '" +currentDate+ "', '"+ data.user.userLoginName +"', "+ 0 +", "+ 0 +", "+ null +"";
        query += ", "+ null + ", "+ null +", '"+ data.user.userLoginName +"'),";
    });

    query = query.substr(0,query.length-1);

    logger.debug("add strategist query " + query);

    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}*/

StrategistDao.prototype.mapStrategistUser = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = 'INSERT INTO ' + tableNames[2] + ' (userId, strategistId) VALUES ';
    data.users.forEach(function (values) {
        query += "(" + values.id + ", " + data.id + "";
        query += "),";
    });
    query = query.substr(0, query.length - 1);
    query += " ON DUPLICATE KEY UPDATE `userId`= VALUES(`userId`), `strategistId`=VALUES(`strategistId`)";

    logger.debug("mapping user strategy query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.unmapStrategistUser = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = '';
    var orionExternalIds = [];
    if (data.orionExternalIds) {
        query = "DELETE FROM `strategistUser` WHERE `userId` IN ";
        query += "(SELECT `id` FROM `user` AS `usr` WHERE usr.orionConnectExternalId IN (?))";
        orionExternalIds = data.orionExternalIds;
    } else {
        query = 'Delete from ' + tableNames[2] + ' WHERE strategistId IN (' + data.id + ') and userId IN (?)';
        orionExternalIds = data.ids;
    }

    logger.debug("unmap strategist user query ", query);
    connection.query(query, [orionExternalIds], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.unmapStrategist = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'Delete from ' + tableNames[2] + ' WHERE strategistId IN (';
    data.ids.forEach(function (id) {
        query += id + ',';
    });
    query = query.substr(0, query.length - 1);
    query += ')';

    logger.debug("unMap strategist query ", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.getUserDetail = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var users = [];
    var query = '';
    query = "SELECT users.id, users.orionConnectExternalId ,users.name, users.isDeleted, users.email as loginUserId, ";
    query += "users.createdDate as createdOn, users.editedDate as editedOn, ";
    query += "us.userLoginName as createdBy , users.eclipseDbId as eclipseDatabaseId ,us.userLoginName as editedBy, userRoleAlias.roleId as roleId, ";
    query += "role.roleName as roleType"
    query += " from " + tableNames[1] + " as users";
    query += " left outer join " + tableNames[4] + " as userRoleAlias on userRoleAlias.userId = users.id ";
    query += " left outer join " + tableNames[6] + " as role on role.id = userRoleAlias.roleId ";
    query += " left outer join " + tableNames[1] + " as us on us.id = users.createdBy";
    query += " WHERE ";
    if (strategistData.userId && strategistData.userId.length > 0) {
        query += " users.id IN (";
        strategistData.userId.forEach(function (user) {
            query += "" + user + ","
        });
        query = query.substr(0, query.length - 1);
        query += ") AND ";
    } else {
        return cb(null, []);
    }

    query += ' users.isDeleted=0';

    logger.debug("get user details query", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.verifyUser = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = '';
    if (data.assignedUserId) {
        query += 'SELECT * from ' + tableNames[2];
        query += ' WHERE userId= ' + data.assignedUserId;
    } else {
        query = 'SELECT SU.strategistId FROM `user` AS `user`';
        query += ' LEFT OUTER JOIN strategistUser AS SU ON `user`.id = SU.userId';
        query += ' WHERE `user`.userLoginName="' + data.loginUserId + '"  AND `user`.isDeleted=0';
    }
    logger.debug("query for verify user in strategist is " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error("error in verify user in strategist " + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

/*StrategistDao.prototype.getAlreadyAssignedUsers = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("already assigned users object", JSON.stringify(data));
    var assignedToSameStrategistQuery = 'SELECT userId from '+ tableNames[2] +' WHERE strategistId IN ('+ data.id +')';
    var assignedToDifferentStrategistQuery = 'SELECT userId from '+ tableNames[2] +' WHERE strategistId NOT IN ('+ data.id +')';
    logger.error("query to get already assigned users "+ assignedToSameStrategistQuery);
    logger.error("query to get already assigned users "+ assignedToDifferentStrategistQuery);
    var typeUsers = {};
    connection.query(assignedToSameStrategistQuery, function(err, sameStrateData){
        if(err){
            return cb(err);
        }
        typeUsers.assignedToSameStrategist = sameStrateData;
        connection.query(assignedToDifferentStrategistQuery, function(err, differentStratData){
            if(err){
                return cb(err);
            }
            typeUsers.assignedToDifferentStrategist = differentStratData;
            return cb(null, typeUsers);
        });
    });
};*/

StrategistDao.prototype.getAlreadyAssignedUsers = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var assignedToSameStrategistQuery = 'SELECT SU.userId, users.orionConnectExternalId  FROM strategistUser AS SU';
    assignedToSameStrategistQuery += ' LEFT OUTER JOIN user AS users ON users.id = SU.userId';
    assignedToSameStrategistQuery += ' WHERE SU.strategistId IN (' + data.id + ')';
    logger.debug("query to get already assigned users " + assignedToSameStrategistQuery);
    connection.query(assignedToSameStrategistQuery, function (err, sameStrateData) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, sameStrateData);
    });
};

StrategistDao.prototype.getUsersAssignedToDifferentStrategist = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var assignedToDifferentStrategistQuery = 'SELECT SU.userId, users.orionConnectExternalId  FROM strategistUser AS SU';
    assignedToDifferentStrategistQuery += ' LEFT OUTER JOIN user AS users ON users.id = SU.userId';
    assignedToDifferentStrategistQuery += ' WHERE SU.strategistId NOT IN (' + data.id + ')';

    logger.debug("query to get already assigned users " + assignedToDifferentStrategistQuery);
    connection.query(assignedToDifferentStrategistQuery, function (err, differentStrateData) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, differentStrateData);
    });
};

StrategistDao.prototype.getStrategistUser = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    if (!Array.isArray(strategistData)) {
        strategistData = [strategistData];
    }
    var query = '';
    query += 'SELECT * from ' + tableNames[2];
    query += ' WHERE strategistId IN (';

    strategistData.forEach(function (strategist) {
        query += '' + strategist.id + ',';
    });

    query = query.substr(0, query.length - 1);
    query += ')';

    logger.debug("Strategist users query" + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistAgainstUsers = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = '';
    query += 'SELECT strategistId as strategistId ';
    query += ' from ' + tableNames[2] + ' ';
    query += ' WHERE userId IN (' + data.assignedUserId + ')';

    logger.debug("Strategist against users query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getAllUserId = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT * from ' + tableNames[2];
    logger.debug("getAllUserId query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.updateStrategist = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = '';
    query = "update " + tableNames[0] + " as strategist";
    query += " SET strategist.name = '" + data.name + "', strategist.status= " + data.status;
    query += ", strategist.firmId = " + data.eclipseDatabaseId;
    query += ", strategist.editedDate = '" + currentDate + "'";
    query += ", strategist.editedBy =" + userId;
    query += " WHERE strategist.id=? ";

    logger.debug("Strategist update detail query " + query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("error in result of update strategist" + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.updateOrCreateUser = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var self = this;
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    var userId = utilService.getAuditUserId(data.user);
    self.getStrategistsForUsers(data, [strategistData.orionConnectExternalId], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result && result.length > 0) {
            query += "UPDATE user SET editedBy = " + userId + ", editedDate = '" + currentDate + "'";
            if (strategistData.eclipseDatabaseId || strategistData.eclipseDatabaseId == 0) {
                query += " , eclipseDbId = " + strategistData.eclipseDatabaseId;
            }
            query += " WHERE orionConnectExternalId = " + strategistData.orionConnectExternalId;
        } else {
            query += " INSERT INTO  `user` (`orionConnectExternalId`,`name`, `isDeleted`, `createdDate`, ";
            query += "`createdBy`, `editedDate`, `editedBy`, `email`, `userLoginName`) ";
            query += "VALUES (" + strategistData.orionConnectExternalId + ",'" + strategistData.assignedUserName + "', 0, ";
            query += "'" + currentDate + "', " + userId + ", '" + currentDate + "', " + userId + ", '" + strategistData.assignedUserEmail + "', ";
            query += "'" + strategistData.assignedUserLoginId + "')";
        }

        logger.debug("Update or create user query", query);
        connection.query(query, function (err, response) {
            if (err) {
                logger.error('Error on insert or update user is ' + err);
                return cb(err);
            }

            if (result.length > 0 && !response.insertId) {
                response.insertId = result[0].id;
            }
            return cb(null, response);
        });

    });
};

StrategistDao.prototype.addOrUpdateUserRole = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var self = this;
    var lastName = null;
    var currentDate = utilDao.getSystemDateTime();

    var query = '';
    var updateOrInsertQuery = '';
    query = ' SELECT * from ' + tableNames[4] + ' WHERE userId = ' + strategistData.assignedUserId;
    connection.query(query, function (err, resultUser) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        if (resultUser.length > 0) {
            updateOrInsertQuery = 'UPDATE ' + tableNames[4] + ' SET roleId = ' + strategistData.role + ' WHERE userId = ' + strategistData.assignedUserId;
        } else {
            updateOrInsertQuery = 'INSERT INTO ' + tableNames[4] + ' (userId, roleId) VALUES (' + strategistData.assignedUserId + ',' + strategistData.role + ') ';
        }

        logger.debug('query to add role ' + updateOrInsertQuery);
        connection.query(updateOrInsertQuery, function (err, result) {
            if (err) {
                logger.error("error in add role " + err);
                return cb(err);
            }
            cb(null, result);
        });
    });
};

StrategistDao.prototype.getUser = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var self = this;
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = ' SELECT * from ' + tableNames[1];
    query += ' as user left outer join ' + tableNames[4] + ' AS role on role.userId = user.id ';
    query += ' where user.id = ' + strategistData.assignedUserId + ' and user.isDeleted = 0 ';
    logger.debug('get user details ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.getUserIdStrategistUser = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = '';
    query = ' SELECT userId as userId, roleId as roleId from ' + tableNames[4];
    logger.debug('query : ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.getUserAndRolesDetails = function (data, userData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = '';
    query = ' SELECT userId as userId, roleId as roleId from ' + tableNames[4];
    query += ' WHERE userId IN (';
    userData.forEach(function (user) {
        query += user.userId + ','
    });
    query = query.substr(0, query.length - 1);
    query += ')';

    logger.debug('query to get user and role details ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.createUser = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var self = this;
    var query = '';
    var userLoginName = '';
    var obj = {
        assignedUserId: userId
    }
    this.getUser(data, obj, function (err, loginId) {
        if (err) {
            logger.error("error in result of create user" + err);
            return cb(err);
        }

        if (loginId && loginId.length > 0) {
            userLoginName = loginId[0].userLoginName;
            logger.debug("result for userLoginName is " + JSON.stringify(userLoginName));
            query = "INSERT into " + tableNames[1];
            query += " (id, name, isDeleted, createdDate, createdBy, editedDate, editedBy, email, "
            query += " userLoginName) VALUES (" + strategistData.assignedUserId + ", '" + strategistData.assignedUserName + "', ";
            query += " , 0, '" + currentDate + "', " + userId + ", '" + currentDate + "', " + userId + ", '" + strategistData.assignedUserEmail + "'";
            query += " , '" + userLoginName + "')";

            logger.debug("create user query", query);
            connection.query(query, data.id, function (err, result) {
                if (err) {
                    logger.error("error in result of create user" + err);
                    return cb(err);
                }
                return cb(null, result);
            });
        } else {
            return cb(null);
        }
    });
};

StrategistDao.prototype.updateStrategistProfile = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = '';
    query = "update " + tableNames[0] + " as strategist SET ";
    query += (data.name) ? (" strategist.name = '" + data.name + "', ") : ("");
    query += (data.status) ? (" strategist.status= " + data.status + ", ") : ("");
    query += (data.salesContact) ? (" strategist.salesContact = '" + data.salesContact + "', ") : ("");
    query += (data.salesPhone) ? (" strategist.salesPhone = " + data.salesPhone + ", ") : ("");
    query += (data.supportEmail) ? (" strategist.supportEmail = '" + data.supportEmail + "', ") : ("");
    query += (data.salesEmail) ? (" strategist.salesEmail = '" + data.salesEmail + "', ") : ("");
    query += (data.supportContact) ? (" strategist.supportContact = '" + data.supportContact + "', ") : ("");
    query += (data.supportPhone) ? (" strategist.supportPhone = " + data.supportPhone + ", ") : ("");
    query += (data.strategyCommentary) ? (" strategist.commentary = '" + data.strategyCommentary + "', ") : ("");
    query += (data.legalAgreement) ? (" strategist.legalAgreement = '" + data.legalAgreement + "', ") : ("");
    query += (data.advertisementMessage) ? (" strategist.advertisementMessage = '" + data.advertisementMessage + "', ") : ("");
    query += " editedDate = '" + currentDate + "', ";
    query += " editedBy =" + userId;
    query += " WHERE strategist.id=? ";

    logger.debug("Strategist profile update detail query " + query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("error in result of update strategist" + err);
            return cb(err);
        }

        return cb(null, result);
    });
};

StrategistDao.prototype.deleteStrategist = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'Update ' + tableNames[0] + ' SET isDeleted=1 WHERE id IN (' + data.id + ')';
    logger.debug("Delete Strategist query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.deleteStrategistUser = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = '';
    if (data.orionExternalIds && data.orionExternalIds.length >= 0) {
        query = 'Update ' + tableNames[1] + ' SET isDeleted=1 WHERE orionConnectExternalId IN (' + data.orionExternalIds + ')';
    } else {
        query = 'Update ' + tableNames[1] + ' SET isDeleted=1 WHERE id IN (' + data.assignedUserId + ')';
    }

    logger.debug("Delete Strategist user query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.verifyStrategist = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = [];
    query.push('SELECT strategist.id,strategist.name, strategist.status,strategist.isDeleted, strategistStatus.name as statusLabel');
    query.push(' ,strategist.createdDate as createdOn, strategist.editedDate as editedOn');
    query.push(' ,strategist.salesContact,strategist.salesPhone');
    query.push(' ,strategist.salesEmail,strategist.legalAgreement');
    query.push(' ,strategist.supportEmail,strategist.supportContact');
    query.push(' ,strategist.supportPhone,strategist.commentary');
    query.push(' ,strategist.advertisementMessage');
    query.push(' ,user.userLoginName as createdBy ,users.userLoginName as editedBy');
    query.push(' from ' + tableNames[0] + ' as strategist');
    query.push(' left outer join ' + tableNames[1] + ' as user on user.id = strategist.createdBy');
    query.push(' left outer join ' + tableNames[1] + ' as users on users.id = strategist.editedBy');
    query.push(' left outer join ' + tableNames[5] + ' as strategistStatus  on strategistStatus.id = strategist.status ');
    query.push(' WHERE strategist.id=?');
    query.push(' AND strategist.isDeleted=0');
    query = query.join("");

    logger.debug("verifyStrategist query " + query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.getStrategistStatusList = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'select id as status, name as statusLabel from ' + tableNames[5];
    logger.debug('query to get strategist status list ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

/*
StrategistDao.prototype.updateStrategistUserStatus = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    logger.debug("updateStrategistUserStatus object", JSON.stringify(data));
    var query = ' UPDATE user SET status = 0, editedDate = "'+ currentDate+'"';
        query += ' ,editedBy = '+ userId; 
        query += ' WHERE userId IN ( ';
        data.userId.forEach(function(userid){
            query += ''+ userid +',';
        });
        query = query.substr(0,query.length-1);
        query += ')';

    logger.debug("query to updateStrategistUserStatus  " + query); 

    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }

        return cb(null, result);
    });
}*/

StrategistDao.prototype.updateStrategistCommentary = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = "update " + tableNames[0] + " as strategist SET";
    if (data.strategyCommentary) {
        query += " strategist.commentary = '" + data.strategyCommentary + "', ";
    }
    query += " strategist.editedDate = '" + currentDate + "'";
    query += ", strategist.editedBy =" + userId;
    query += " WHERE strategist.id = " + data.id;

    logger.debug("Strategist update commentary detail query", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error("error in result of update strategist commentary" + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.updateStrategistSales = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = "update " + tableNames[0] + " as strategist SET";
    if (data.salesContact) {
        query += " strategist.salesContact = '" + data.salesContact + "', ";
    }
    if (data.salesPhone) {
        query += " strategist.salesPhone = '" + data.salesPhone + "', ";
    }
    if (data.salesEmail) {
        query += " strategist.salesEmail = '" + data.salesEmail + "', ";
    }
    query += " strategist.editedDate = '" + currentDate + "'";
    query += ", strategist.editedBy =" + userId;
    query += " WHERE strategist.id = " + data.id;

    logger.debug("Strategist update sales detail query", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error("error in result of update strategist sales" + err);
            return cb(err);
        }

        return cb(null, result);
    });
};

StrategistDao.prototype.updateStrategistSupport = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = '';
    query = "update " + tableNames[0] + " as strategist SET";
    if (data.supportContact) {
        query += " strategist.supportContact = '" + data.supportContact + "', ";
    }
    if (data.supportPhone) {
        query += " strategist.supportPhone = '" + data.supportPhone + "', ";
    }
    if (data.supportEmail) {
        query += " strategist.supportEmail = '" + data.supportEmail + "', ";
    }
    query += " strategist.editedDate = '" + currentDate + "'";
    query += ", strategist.editedBy =" + userId;
    query += " WHERE strategist.id = " + data.id;

    logger.debug("Strategist update support detail query", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error("error in result of update strategist support" + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.updateStrategistLegalAgreement = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = '';
    query = "update " + tableNames[0] + " as strategist SET";
    query += " strategist.legalAgreement = '" + data.legalAgreement + "'"
    query += ", strategist.editedDate = '" + currentDate + "'";
    query += ", strategist.editedBy =" + userId;
    query += " WHERE strategist.id = " + data.id;

    logger.debug("Strategist update legal agreement detail query", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error("error in result of update strategist legalAgreement" + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.updateStrategistAdvertisementMessage = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = '';
    query = "update " + tableNames[0] + " as strategist SET";
    if (data.advertisementMessage) {
        query += " strategist.advertisementMessage = '" + data.advertisementMessage + "', "
    }
    query += " strategist.editedDate = '" + currentDate + "'";
    query += ", strategist.editedBy =" + userId;
    query += " WHERE strategist.id = " + data.id;

    logger.debug("Strategist update advertisementMessage detail query", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error("error in result of update strategist advertisementMessage" + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistCommentary = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = "select strategist.id as id, strategist.commentary as strategyCommentary from " + tableNames[0] + " as strategist ";
    query += " WHERE strategist.id=? ";

    logger.debug("Strategist get commentary detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("error in result of get strategist commentary" + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistSales = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = "SELECT strategist.id as id, strategist.salesContact as salesContact,  strategist.salesPhone as salesPhone ";
    query += ", strategist.salesEmail as salesEmail FROM "
    query += tableNames[0] + " as strategist";
    query += " WHERE strategist.id=? ";

    logger.debug("Strategist get sales detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("error in result of get strategist sales" + err);
            return cb(err);
        }

        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistSupport = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = "SELECT strategist.id as id, strategist.supportContact as supportContact, strategist.supportPhone as supportPhone ";
    query += ", strategist.supportEmail as supportEmail FROM ";
    query += tableNames[0] + " as strategist ";
    query += " WHERE strategist.id=? ";

    logger.debug("Strategist get support detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("error in result of get strategist support" + err);
            return cb(err);
        }

        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistLegalAgreement = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = "SELECT strategist.id as id, strategist.legalAgreement as legalAgreement FROM " + tableNames[0] + " as strategist";
    query += " WHERE strategist.id=? ";

    logger.debug("Strategist get legal agreement detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("error in result of get strategist legalAgreement" + err);
            return cb(err);
        }

        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistAdvertisementMessage = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = "SELECT strategist.id as id, strategist.advertisementMessage as advertisementMessage FROM " + tableNames[0] + " as strategist";
    query += " WHERE strategist.id=? ";

    logger.debug("Strategist get advertisementMessage detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("error in result of get strategist advertisementMessage" + err);
            return cb(err);
        }

        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistDocuments = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = '';

    query = 'SELECT DC.id AS id, DC.type AS TYPE,';
    query += ' DC.displayName AS displayName, DC.documentName AS documentName,';
    query += ' DC.description AS description, DC.path AS path,';
    query += ' DC.strategistId AS strategistId, DC.createdDate AS createdDate, user.userLoginName AS createdBy,';
    query += ' DC.editedDate AS editedDate, users.userLoginName AS editedBy, DC.modelId AS modelId,';
    query += ' DC.isDeleted AS isDeleted';
    query += ' FROM ' + tableNames[7] + ' AS DC';
    query += ' LEFT OUTER JOIN ' + tableNames[1] + ' AS `user` ON DC.createdBy = `user`.id';
    query += ' LEFT OUTER JOIN ' + tableNames[1] + ' AS `users` ON DC.editedBy = `users`.id';
    query += ' WHERE DC.strategistId = ? ';
    query += ' AND NOT DC.documentName = "smallLogo" AND NOT DC.documentName = "largeLogo" ';
    query += ' AND DC.isDeleted = 0 ';

    if (data.modelId) {
        query += ' AND DC.modelId=' + data.modelId;
    } else {
        query += ' AND ( DC.modelId IS NULL OR DC.modelId = 0 )';
    }

    logger.debug("Strategist get documents detail query", query);
    connection.query(query, data.id, function (err, result) {
        if (err) {
            logger.error("error in result of get strategist documents" + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistIds = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT id from ' + tableNames[0] + ' WHERE id IN (';
    data.ids.forEach(function (id) {
        query += id + ',';
    });
    query = query.substr(0, query.length - 1);
    query += ')';
    query += ' AND isDeleted = 0';
    logger.debug('query for select id are ' + query);
    var strategistIds = [];
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        result.forEach(function (res) {
            strategistIds.push(res.id);
        })
        return cb(null, strategistIds);
    });
}

StrategistDao.prototype.getStrategistLogo = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT id, documentName, path FROM document WHERE strategistId = ? AND documentName IN ("smallLogo", "largeLogo") AND isDeleted = 0 ORDER BY  documentName ASC';
    logger.debug('query to get strategist logo : ' + query);
    connection.query(query, [data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
}

//subscribe strategists
StrategistDao.prototype.mapStrategistFirm = function (data, strategistData, cb) {
    var self = this;
    var connection = baseDao.getCommunityDBConnection(data);
    var firmId = strategistData.firmId;
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var inputData = {
        strategistId: strategistData.communityStrategistId,
        firmId: firmId,
        isSubscribed: data.isSubscribe,
        autopush: data.autopush ? data.autopush : 0,
        subscriptionDate: currentDate,
        createdBy: userId,
        createdDate: currentDate,
        editedBy: userId,
        editedDate: currentDate
    }
    var updateInputData = {
        firmId: firmId,
        subscriptionDate: currentDate,
        autopush: data.autopush ? data.autopush : 0,
        editedBy: userId,
        editedDate: currentDate
    }
    if (strategistData.NewFirmId) {
        updateInputData.firmId = strategistData.NewFirmId;
    }
    if (data.isSubscribe) {
        updateInputData.isSubscribed = data.isSubscribe
    }
    var query = '';
    self.getStrategistFirm(data, strategistData, function (err, strategistFirmResult) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (strategistFirmResult && strategistFirmResult.length > 0 && strategistFirmResult[0].isSubscribed == 1 && !strategistData.NewFirmId) {
            return cb('ALREADY SUBSCRIBE');
        }
        query = 'INSERT INTO strategistFirm SET ? ON DUPLICATE KEY UPDATE ?';
        logger.debug('insert or update strategistFirm query' + query);
        connection.query(query, [inputData, updateInputData], function (err, result) {
            if (err) {
                logger.error('error in insert in strategist firm is ' + err);
                return cb(err);
            }
            return cb(null, result);
        });
    });
}

StrategistDao.prototype.unMapStrategistFirm = function (data, strategistData, cb) {
    var connection = '';
    if(data.connection){
        connection = data.connection.community;
    }else{
       connection = baseDao.getCommunityDBConnection(data);
    }
    
    var firmId = strategistData.firmId;
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var inputData = {
        isSubscribed: 0,
        editedBy: userId,
        editedDate: currentDate
    }
    var query = 'UPDATE strategistFirm SET ? WHERE strategistId = ? AND firmId = ?';
    logger.debug('update strategist firm query ' + query);
    connection.query(query, [inputData, strategistData.id, firmId], function (err, result) {
        if (err) {
            logger.error('error in update in strategist firm is ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.getStrategistFirm = function (data, strategistData, cb) {
    var connection = '';
    if(data.connection){
        connection = data.connection.community;
    }else{
        connection = baseDao.getCommunityDBConnection(data);
    }
    var currentDate = utilDao.getSystemDateTime();
    var query = 'SELECT * from strategistFirm where ';
    if (strategistData.firmId) {
        query += 'firmId = ' + strategistData.firmId;
    }
    if (strategistData.firmId && strategistData.communityStrategistId) {
        query += ' AND'
    }
    if (strategistData.communityStrategistId) {
        query += ' strategistId = ' + strategistData.communityStrategistId;
    }
    logger.debug('query to get strategist firm ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error('error in update in strategist firm is ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
}

StrategistDao.prototype.getListWithSubscribedDetails = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = [];
    try {
        query.push('SELECT strategist.id,strategist.name, strategist.status,strategist.isDeleted, strategistStatus.name as statusLabel, ');
        query.push(' strategist.createdDate as createdOn,strategist.editedDate as editedOn');
        query.push(' ,strategist.salesContact,strategist.salesPhone');
        query.push(' ,strategist.salesEmail,strategist.legalAgreement');
        query.push(' ,strategist.supportEmail,strategist.supportContact');
        query.push(' ,strategist.supportPhone,strategist.commentary');
        query.push(' ,strategist.advertisementMessage, strategist.firmId as eclipseDatabaseId');
        query.push(' ,strategistFirms.isSubscribed as isSubscribed, strategistFirms.subscriptionDate as subscribedOn');
        query.push(', user.userLoginName as createdBy ,users.userLoginName as editedBy');
        query.push(' ,logo.path as path');
        query.push(' from ' + tableNames[0] + ' as strategist ');
        query.push(' left outer join ' + tableNames[1] + ' as user  on user.id = strategist.createdBy ');
        query.push(' left outer join ' + tableNames[1] + ' as users  on users.id = strategist.editedBy ');
        query.push(' left outer join ' + tableNames[5] + ' as strategistStatus  on strategistStatus.id = strategist.status ');
        query.push(' left outer join ' + tableNames[7] + ' as logo on logo.strategistId = strategist.id AND logo.type = 1 AND logo.isDeleted = 0 ');

        //check for strategist appear to firm only
        var communityToken = localCache.get(data.reqId).session.token;
        sharedCache.get(communityToken, function (err, tokenData) {
            var eclipseUserDetailsInfo = JSON.parse(tokenData);
            if (eclipseUserDetailsInfo.eclipseUserDetails) {
                var info = eclipseUserDetailsInfo.eclipseUserDetails;
                query.push(' left outer join strategistFirm as strategistFirms  on strategistFirms.strategistId = strategist.id AND strategistFirms.firmId = ' + info.firmId);
                query.push(' WHERE (( strategist.firmId = 0) OR (strategist.firmId = ' + info.firmId + ') OR (strategistFirms.firmId = ' + info.firmId + ' ) ) ');
            } else {
                query.push(' left outer join strategistFirm as strategistFirms  on strategistFirms.strategistId = strategist.id');
                query.push(' WHERE 1=1 ');
            }
            query.push(' AND strategist.isDeleted=0 ');
            query.push(' AND strategist.status=1 ');
            if (data.search) {
                if (data.search.match(/^[0-9]+$/g)) {
                    query.push(' AND strategist.id= "' + data.search + '" OR ');
                } else {
                    query.push(' AND ');
                }
                query.push(' strategist.name LIKE "%' + data.search + '%" order by strategist.name ASC');

            }
            query = query.join("");

            logger.debug("Get Strategist List Query" + query);
            connection.query(query, function (err, data) {
                if (err) {
                    logger.error(err);
                    return cb(err);
                }
                return cb(null, data);
            });
        });
    } catch (exception) {
        logger.error('exception in ' + exception);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }
};

StrategistDao.prototype.updateLegalAgreementAcceptanceTime = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = 'UPDATE strategist SET legalAgreementTime = ? WHERE id = ?'
    logger.debug("Update strategist legalAgreement timestamp query " + query);
    connection.query(query, [currentDate, data.id], function (err, res) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, res);
    });
};

StrategistDao.prototype.updateOrCreateUserWithEclipseId = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var self = this;
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = '';
    if (!strategistData.assignedUserId) {
        query += " INSERT INTO  `user` (`orionConnectExternalId`,`name`, `isDeleted`, `createdDate`, ";
        query += "`createdBy`, `editedDate`, `editedBy`, `email`, `userLoginName`, `eclipseDbId`) ";
        query += "VALUES (" + strategistData.orionConnectExternalId + ",'" + strategistData.assignedUserName + "', 0, ";
        query += "'" + currentDate + "', " + userId + ", '" + currentDate + "', " + userId + ", '" + strategistData.assignedUserEmail + "', ";
        query += "'" + strategistData.assignedUserLoginId + "', '" + strategistData.eclipseDatabaseId + "')";
    } else {
        query += "UPDATE user SET editedBy = " + userId + ", editedDate = '" + currentDate + "'";
        query += " WHERE id = " + strategistData.assignedUserId;
    }

    logger.debug("Update Strategist query", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error('Error on insert or update user is ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistFromEclipseDbId = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var self = this;
    var currentDate = utilDao.getSystemDateTime();
    var query = 'SELECT * FROM ' + tableNames[8] + ' WHERE firmId=' + data.eclipseDbId;
    logger.debug("get strategist from eclipse db id query", query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error('Error on get strategist is ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getListByID = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = [];
    query.push('SELECT strategist.id,strategist.name, strategist.status,strategist.isDeleted, strategistStatus.name as statusLabel, ');
    query.push(' strategist.createdDate as createdOn,strategist.editedDate as editedOn');
    query.push(' ,strategist.salesContact,strategist.salesPhone');
    query.push(' ,strategist.salesEmail,strategist.legalAgreement');
    query.push(' ,strategist.supportEmail,strategist.supportContact');
    query.push(' ,strategist.supportPhone,strategist.commentary');
    query.push(' ,strategist.advertisementMessage');
    query.push(', user.userLoginName as createdBy ,users.userLoginName as editedBy');
    query.push(' from ' + tableNames[0] + ' as strategist ');
    query.push(' left outer join ' + tableNames[1] + ' as user  on user.id = strategist.createdBy ');
    query.push(' left outer join ' + tableNames[1] + ' as users  on users.id = strategist.editedBy ');
    query.push(' left outer join ' + tableNames[5] + ' as strategistStatus  on strategistStatus.id = strategist.status ');

    query.push(' WHERE strategist.id IN (');
    query.push(data.ids);
    query.push(') AND strategist.isDeleted=0 ');
    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' AND strategist.id= "' + data.search + '" OR ');
        } else {
            query.push(' AND ');
        }
        query.push(' strategist.name LIKE "%' + data.search + '%" order by strategist.name ASC');

    }
    query = query.join("");

    logger.debug("Get Strategist List Query" + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

StrategistDao.prototype.getListSimpleByID = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = [];
    query.push('SELECT strategist.id,strategist.name, strategist.status,strategist.isDeleted, strategistStatus.name as statusLabel, ');
    query.push(' strategist.createdDate as createdOn, strategist.editedDate as editedOn');
    query.push(',user.userLoginName as createdBy ,users.userLoginName as editedBy');
    query.push(' from ' + tableNames[0] + ' as strategist');
    query.push(' left outer join ' + tableNames[1] + ' as user on user.id = strategist.createdBy');
    query.push(' left outer join ' + tableNames[1] + ' as users on users.id = strategist.editedBy');
    query.push(' left outer join ' + tableNames[5] + ' as strategistStatus  on strategistStatus.id = strategist.status ');

    query.push(' WHERE strategist.id IN (');
    query.push(data.ids);
    query.push(') AND strategist.isDeleted=0 ');
    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' AND strategist.id= "' + data.search + '" OR ');
        } else {
            query.push(' AND ');
        }
        query.push(' strategist.name LIKE %' + data.search + '%');

    }
    query = query.join("");

    logger.debug("Get Strategist List Query" + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

StrategistDao.prototype.getFirmDetailsFromCommon = function (data, firmIds, cb) {
    var connection = '';
    if(data.connection){
        connection = data.connection.common;
    }else{
        connection = baseDao.getCommonDBConnection(data);
    }
    var query = 'SELECT * FROM orionEclipseFirm WHERE id IN ('
    firmIds.forEach(function (id) {
        query += '' + id + ',';
    });
    query = query.substr(0, query.length - 1);
    query += ')';
    logger.debug('query to select firms frm common db' + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistIdsWithConnectId = function (data, users, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT * FROM users';
    query += 'WHERE orionConnectExternalId IN ('

    users.forEach(function (user) {
        query += '' + user.orionConnectExternalId + ',';
    });
    query = query.substr(0, query.length - 1);
    query += ')';
    logger.debug('query to select users on the basis of orionConnectExternalId' + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getStrategistsForUsers = function (data, ids, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT DISTINCT SU.strategistId, users.id as id FROM `user` AS users';
    query += ' LEFT OUTER JOIN strategistUser AS SU ON SU.userId = users.id';
    query += ' WHERE users.orionConnectExternalId IN (?) AND users.isDeleted=0 ';
    logger.debug("check orion connect id query is : " + query);
    connection.query(query, [ids], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
}

StrategistDao.prototype.updateOrCreateUserNew = function (data, strategistData, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var self = this;
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var inputData = {
        orionConnectExternalId: strategistData.orionConnectExternalId,
        name: strategistData.assignedUserName,
        isDeleted: 0,
        createdDate: currentDate,
        createdBy: userId,
        editedBy: userId,
        editedDate: currentDate,
        email: strategistData.assignedUserEmail,
        userLoginName: strategistData.assignedUserLoginId
    }
    var updateInputData = {
        editedBy: userId,
        editedDate: currentDate,
        eclipseDbId: strategistData.eclipseDatabaseId
    }

    var query = 'INSERT INTO user SET ? ON DUPLICATE KEY UPDATE ?';

    logger.debug("Update Strategist query", query);
    connection.query(query, [inputData, updateInputData], function (err, result) {
        if (err) {
            logger.error('Error on insert or update user is ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

StrategistDao.prototype.getUsersWithRoleStrategistAdmin = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();

    var query = ' SELECT COUNT(*) AS `count` FROM strategistUser AS su ';
    query += ' LEFT OUTER JOIN userRole AS ur ON ur.userId = su.userId ';
    query += ' LEFT OUTER JOIN `user` AS us ON us.id = su.userId ';
    query += ' WHERE su.strategistId IN ( SELECT strategistId FROM strategistUser WHERE userId = ?) ';
    query += ' AND ur.roleId = 2 AND us.isDeleted=0 ';

    logger.debug("get strategist admin count query", query);
    connection.query(query, [data.assignedUserId], function (err, result) {
        if (err) {
            logger.error('Error on insert or update user is ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

module.exports = StrategistDao;