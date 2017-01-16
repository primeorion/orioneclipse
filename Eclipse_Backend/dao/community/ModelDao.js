"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var ModelDao = function () { }
var util = require('util');
// All Model List
/*
ModelDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Community Models object", JSON.stringify(data.id));
    var query = [];
    query.push(' SELECT m.id, m.name ,sm.strategistId ,m.isDeleted ,');
    query.push(' m.createdDate , u.userLoginId AS createdBy , m.editedDate , u.userLoginId AS editedBy  FROM model m ');
    query.push(' INNER JOIN `user` AS u ON m.createdBy = u.id AND m.editedBy = u.id ');
    query.push(' INNER JOIN strategistModel sm ON m.id = sm.modelId WHERE ');

    if (data.strategistId) {
        query.push("  sm.strategistId  IN (" + data.strategistId + ") ");
    }
    query.push(' AND m.isDeleted = 0 AND sm.isDeleted = 0 ORDER BY m.id ASC ');

    query = query.join("");
    logger.debug("Get Community model List Query" + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        var models = [];
        data.forEach(function (model) {
            models.push(model);
        });
        return cb(null, models);
    });
};
*/
// All Model List

ModelDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Community Models object", JSON.stringify(data.id));
    var query = [];
    query.push(' SELECT sm.id, sm.modelName, sm.isDeleted ,');
    query.push(' sm.createdDate , u.userLoginId AS createdBy , sm.editedDate , u.userLoginId AS editedBy  FROM strategistModel sm ');
    query.push(' INNER JOIN `user` AS u ON sm.createdBy = u.id AND sm.editedBy = u.id  WHERE ');
    if (data.strategistId) {
        query.push("  sm.strategistId  IN (" + data.strategistId + ") AND sm.isDeleted = 0 ORDER BY sm.id ASC ");
    }
    query = query.join("");
    logger.debug("Get Community model List Query" + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        var models = [];
        data.forEach(function (model) {
            models.push(model);
        });
        return cb(null, models);
    });
};

//Get Approved Models List
ModelDao.prototype.getApprovedModelsList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Community Approved Models object");
    var models = data.models;
    var modelIds;

    var query = 'SELECT sm.id, sm.modelName ,sm.isDeleted , sm.createdDate , u.userLoginId AS createdBy , ';
    query = query + 'sm.editedDate , u.userLoginId AS editedBy FROM strategistModel sm INNER JOIN `user` AS u ON sm.createdBy = u.id AND sm.editedBy = u.id ';
    query = query + ' WHERE sm.isDeleted = 0 AND ';

    if (models.modelId) {
        modelIds = models.modelId
        query = query + ' sm.id IN ( ';
    }

    modelIds.forEach(function (model) {
        query = query + model + ',';
    });
    query = query.substr(0, query.length - 1);
    query = query + ' );';
    logger.debug("Get Community Approved model List Query " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        var result = [];
        data.forEach(function (model) {
            result.push(model);
        });
        return cb(null, result);
    });
};

// Get All Approved Models List [internally called]
ModelDao.prototype.getAccessModelsList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Community Access  Models List object");
    var result = {};
    var query = [];
    if (data.accessLevel === 1) {
        var strategistId = data.strategistId;
        query.push('SELECT id FROM strategistModel  WHERE isDeleted = 0 ');
        query.push(' AND strategistId = ' + strategistId + '');
    } else {
        var communityStrategistpreferenceId = data.communityStrategistpreferenceId;
        query.push('SELECT modelId FROM communityStrategistModel  WHERE isDeleted = 0 ');
        query.push(' AND communityStrategistpreferenceId = ' + communityStrategistpreferenceId + '');
    }
    query = query.join("");
    logger.debug("Get Community model List Query" + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        var models = [];
        data.forEach(function (model) {
            if (model.modelId) {
                models.push(model.modelId);
            } else {
                models.push(model.id);
            }
        });
        result.modelId = models;

        return cb(null, result);
    });
};

// Validate Model Access Level  [internally called]
ModelDao.prototype.validateModelAccessLevel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug(" Validate Model Access Level object");
    var communityStrategistpreferenceId = data.communityStrategistpreferenceId;
    var result = [];
    var query = [];

    query.push(' SELECT modelAccessLevel FROM communityStrategistPreferenceValue WHERE isDeleted = 0 AND id = ');
    query.push('' + communityStrategistpreferenceId + '');

    query = query.join("");
    logger.debug("Validate Model Access Level Query " + query);
    connection.query(query, function (err, accessLevel) {
        if (err) {
            return cb(err);
        }
        if (accessLevel.length > 0) {
            result.accessLevel = accessLevel[0].modelAccessLevel;
        }
        return cb(null, result);
    });
};

//Validate Model  [internally called]
ModelDao.prototype.validateModel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Validate Model object");
    var modelId = data.modelId;
    var result = [];
    var query = [];

    query.push(' SELECT communityModelId, strategistId FROM strategistModel WHERE isDeleted = 0 AND id = ');
    query.push('' + modelId + '');

    query = query.join("");
    logger.debug("Validate Model Query " + query);
    connection.query(query, function (err, model) {
        if (err) {
            return cb(err);
        }
        if (model.length > 0) {
            result.communityModelId = model[0].communityModelId;
            result.strategistId = model[0].strategistId;
        }
        return cb(null, result);
    });
};

//validate Eclipse Model  [internally called]
ModelDao.prototype.validateEclipseModel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Validate Model object");
    var communityModelId = data.communityModelId;
    var result = [];
    var query = [];

    query.push(' SELECT id FROM model WHERE isDeleted = 0 AND communityModelId = ' + communityModelId);
    //    query.push('' + modelId + '');

    query = query.join("");
    logger.debug("Validate Eclipse Model Query " + query);
    connection.query(query, function (err, eclipseModel) {
        if (err) {
            return cb(err);
        }
        // if (eclipseModel) {
        //     result.count = eclipseModel[0]['COUNT(*)'];
        // }
        eclipseModel.forEach(function (eclipseModelId) {
            
                result.push(eclipseModelId.id);
            });
        return cb(null, result);
    });
};

//Validate Security  [internally called]
ModelDao.prototype.validateSecurity = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Validate Security object");
    var securities = data.securities;
    var result = [];
    var query = [];

    query.push(' SELECT `id`, `orionConnectExternalId` FROM `security` WHERE isDeleted = 0 AND orionConnectExternalId IN (');
    query.push('' + securities + ' ) GROUP BY  orionConnectExternalId ;');

    query = query.join("");
    logger.debug("Validate Model " + query);
    connection.query(query, function (err, security) {
        if (err) {
            logger.error("Error in : " + err);

            return cb(err);
        }
        // result.securityId = [];
        // result.orionConnectExternalId = [];
        else {
            logger.info("eclipseSecurity in : ");

            security.forEach(function (eclipseSecurity) {
                var securityData = {};
                securityData.securityId = eclipseSecurity.id;
                securityData.orionConnectExternalId = eclipseSecurity.orionConnectExternalId;
                result.push(securityData);
            });
            return cb(null, result);

        }

    });
};

/*
ModelDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("Community Models object", JSON.stringify(data.id));
    var query = [];
    query.push('SELECT CM.id,CM.name, CM.status,CM.isDeleted, ');
    query.push(' USER.userLoginId as createdBy ,USERS.userLoginId as editedBy,');
    query.push(' CM.targetRiskLower,CM.targetRiskUpper,');
    query.push(' CM.currentRisk,CM.minimumAmount,');
    query.push(' CM.style,CM.tickersWithTargetInPercentage,');
    query.push(' CM.lowerUpperToleranceInPercentage,CM.requireCash,');
    query.push(' CM.advisorFee,CM.weightedAvgNetExpense,');
    query.push(' CM.strategistId,CM.createdDate as createdOn,CM.editedDate as editedOn');
    query.push(' from ' + tableNames[0] + '  as CM ');
    query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.userId = CM.createdBy ');
    query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.userId = CM.editedBy ');
    query.push(' WHERE 1=1 ');
    query.push(' AND CM.isDeleted=0 ');

    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' AND CM.id= "' + data.search + '" ');
        } else {
            query.push(' AND  CM.name LIKE "%' + data.search + '%" ');

        }

    }
    if (data.strategistId) {
        query.push(" AND CM.strategistId  IN (" + data.strategistId + ") ");
    }
    query = query.join("");
    logger.debug("Get Community model List Query" + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        var models = [];
        data.forEach(function (model) {
            models.push(model);
        });
        return cb(null, models);
    });
};
*/

module.exports = ModelDao;   