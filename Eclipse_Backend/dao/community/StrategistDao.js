"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var util = require('util');
var StrategistDao = function () { }

// All Strategist List
StrategistDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("strategist object", JSON.stringify(data));
    var query = [];

    query.push(' SELECT s.id, s.name, s.isDeleted, s.createdDate AS createdDate, u.userLoginId AS createdBy, ');
    query.push(' s.editedDate, u.userLoginId AS editedBy FROM `strategist` AS s ');
    query.push(' INNER JOIN `user` AS u ON s.createdBy = u.id AND s.editedBy = u.id WHERE s.isDeleted = 0 ');

    if (data.search) {
        query.push(' AND ');
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' (s.id = "' + data.search + '" OR ');
        }
        query.push(' s.name LIKE "%' + data.search + '%" ');
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' ) ');
        }
        query.push(' ORDER BY s.name, s.id DESC ');
    }
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

// Add Strategist
StrategistDao.prototype.addStrategist = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Add strategist object", JSON.stringify(data));
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();
    var inputData = {
        name: data.name,
        communityStrategistId: data.communityStrategistId,
        isDeleted: data.isDeleted ? data.isDeleted : 0,
        createdBy: userId,
        editedBy: userId,
        editedDate: currentDate,
        createdDate: currentDate
    };

    var query = 'INSERT INTO strategist SET ? ';
    logger.debug("Query: " + query);
    connection.query(query, [inputData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

// Get Strategist
StrategistDao.prototype.getStrategistDetails = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Get strategist object", JSON.stringify(data));
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();
    var inputData = {
        communityStrategistId: data.communityStrategistId
    };
    var query = 'SELECT * FROM strategist WHERE isDeleted = 0 AND communityStrategistId = ' + inputData.communityStrategistId + '';
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Update Strategist
StrategistDao.prototype.updateStrategist = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var queryData = {
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime()
    };
    if (data.name !== null) {
        queryData["name"] = data.name;
    }
    if (data.communityStrategistId !== null) {
        queryData["communityStrategistId"] = data.communityStrategistId;
    }
    if (data.id !== null) {
        queryData["communityStrategistId"] = data.id;
    }
    var query = 'UPDATE strategist SET ? WHERE communityStrategistId = ? AND isDeleted = 0 ';

    connection.query(query, [queryData, queryData.communityStrategistId], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

//Delete Strategist
StrategistDao.prototype.deleteStrategist = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var queryData = {
        isDeleted: 1,
        communityStrategistId: data.communityStrategistId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime()
    };
    var query = 'UPDATE strategist SET ? WHERE communityStrategistId = ? AND isDeleted = 0 ';
    logger.debug(query);
    connection.query(query, [queryData, queryData.communityStrategistId], function (err, deleted) {
        if (err) {
            return cb(err);
        }
        return cb(null, deleted);
    });
};

// Add Strategist Models
StrategistDao.prototype.addStrategistModels = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Add strategist model object", JSON.stringify(data));
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();
    var models = data.models;
    var query = 'INSERT INTO strategistModel(`communityModelId`,`modelName`,`strategistId`,`isDeleted`,`createdDate`,`createdBy`,`editedDate`,`editedBy`) VALUES';
    var inputData = {
        strategistId: data.strategistId,
        isDeleted: data.isDeleted ? data.isDeleted : 0,
        createdBy: userId,
        editedBy: userId,
        editedDate: currentDate,
        createdDate: currentDate
    };
    var queryData = inputData.strategistId + ',' + inputData.isDeleted + ',"' + inputData.createdDate + '","' + inputData.createdBy + '","' + inputData.editedDate + '","' + inputData.editedBy + '"';

    models.forEach(function (model) {
        query = query + '(' + model.id + ',"' + model.name + '" ,' + queryData + '),';
    }, this);
    query = query.substr(0, query.length - 1);
    query = query + ' ON DUPLICATE KEY UPDATE  modelName = VALUES(modelName) ';
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

// Update Strategist Models
StrategistDao.prototype.updateStrategistModels = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Update strategist model object", JSON.stringify(data));
    var models = data.models;
    var queryData = {
        strategistId: data.strategistId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    };
    var query = 'UPDATE strategistModel SET editedBy = ' + queryData.editedBy + ' , editedDate = "' + queryData.editedDate + '" , modelName = (CASE ';
    models.forEach(function (model) {
        query = query + ' WHEN communityModelId = ' + model.id + ' THEN ' + '"' + model.name + '"';

    });

    query = query + ' END) ';
    query = query + ' WHERE isDeleted = 0 AND strategistId = ' + queryData.strategistId;
    logger.debug(query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

// Delete Strategist Models
StrategistDao.prototype.deleteStrategistModels = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var self = this;
    logger.debug("Delete strategist model object", JSON.stringify(data));
    var modelIds = data.ids;
    var queryData = {
        strategistId: data.strategistId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    };
    var query = 'UPDATE strategistModel SET editedBy = ' + queryData.editedBy + ' , editedDate = "' + queryData.editedDate + '" , isDeleted = ';
    if (data.ids) {
        query = query + '(CASE ';
        modelIds.forEach(function (id) {
            query = query + ' WHEN communityModelId = ' + id + ' THEN 1 ';

        });
        query = query + ' END) ';
    }
    else {
        query = query + '1'
    }
    query = query + ' WHERE isDeleted = 0 AND strategistId = ' + queryData.strategistId;
    logger.debug(query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

// All Approved Strategist List
StrategistDao.prototype.getApprovedStrategistList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Approved strategist object", JSON.stringify(data));
    var query = [];

    query.push(' SELECT csv.id , s.name, s.isDeleted , ');
    query.push(' u.userLoginId AS createdBy , s.createdDate , u.userLoginId AS editedBy , s.createdDate, s.editedDate ');
    query.push(' FROM strategist s INNER JOIN `user` AS u ON s.createdBy = u.id AND s.editedBy = u.id ');
    query.push(' INNER JOIN communityStrategistValue csv ');
    query.push(' ON csv.strategistId = s.id AND s.isDeleted = 0 AND csv.isDeleted = 0 ');
    query.push(' INNER JOIN communityStrategistPreferenceValue cspv ');
    query.push(' ON cspv.id = csv.communityStrategistpreferenceId  AND cspv.isDeleted = 0 ');
    /*   query.push(' WHERE cspv.preferenceValueId = ');
       query.push(' (SELECT id FROM preferenceValue ');
       query.push(' WHERE `preferenceId` = 7 AND relatedType = 1 AND relatedTypeId = 3 AND isDeleted = 0) ');
   */
    query.push(' ORDER BY  csv.id ASC ');
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

// Delete Stragist From Preference [internally called]
StrategistDao.prototype.deleteStragistFromPreference = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Delete Stragist From Preference object", JSON.stringify(data));
    var queryData = {
        strategistId: data.communityStrategistId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    };
    var query = ' UPDATE communityStrategistValue SET editedBy = ' + queryData.editedBy + ' , ';
    query = query + ' editedDate = "' + queryData.editedDate + '" , isDeleted = 1 ';
    query = query + ' WHERE isDeleted = 0 AND strategistId = ' + queryData.strategistId;
    logger.debug(query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

// Delete Models From Preference [internally called]
StrategistDao.prototype.deleteModelsFromPreference = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Delete Models From Preference object", JSON.stringify(data));
    var modelIds = data.models;

    var queryData = {
        strategistId: data.communityStrategistId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    };
    var query = ' UPDATE communityStrategistModel SET editedBy = ' + queryData.editedBy + ' , ';
    query = query + ' editedDate = "' + queryData.editedDate + '" , isDeleted = 1 ';
    query = query + ' WHERE isDeleted = 0 AND modelId  IN ( ';
    query = query + modelIds + ')';

    query = query + '; ';
    logger.debug(query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

// Delete Models From Models [internally called]
StrategistDao.prototype.deleteModelsFromModels = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Delete Models From Preference object", JSON.stringify(data));
    var modelIds = data.models;

    var queryData = {
        strategistId: data.communityStrategistId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    };
    var query = ' UPDATE model SET editedBy = ' + queryData.editedBy + ' , ';
    query = query + ' editedDate = "' + queryData.editedDate + '" , isDeleted = 1 ';
    query = query + ' WHERE isDeleted = 0 AND Id  IN ( ';
    query = query + modelIds + ')';

    query = query + ' ;';
    logger.debug(query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

// Validate Community Strategist [internally called]
StrategistDao.prototype.validateCommunityStrategist = function (data, cb) {

    var connection = baseDao.getConnection(data);
    var result = [];
    var communityStrategistId;
    if (data.communityStrategistId) {
        communityStrategistId = data.communityStrategistId;
    }
    if (data.id) {
        communityStrategistId = data.id;
    }
    var query = '';
    query = 'SELECT id, COUNT(*) FROM strategist WHERE isDeleted = 0 AND communityStrategistId = ';
    query = query + communityStrategistId + ';';
    logger.debug(query);

    connection.query(query, function (err, out) {
        if (err) {
            return cb(err);
        }
        if (out) {
            result.count = out[0]['COUNT(*)'];
            result.strategistId = out[0].id;
        }
        return cb(null, result);
    });
};

// Validate Community Strategist Models [internally called]
StrategistDao.prototype.validateCommunityStrategistModels = function (data, cb) {

    var connection = baseDao.getConnection(data);
    var result = {};
    var strategistId = data.strategistId;

    var query = '';
    query = 'SELECT  communityModelId FROM strategistModel WHERE isDeleted = 0 AND strategistId = ';
    query = query + strategistId + ';';
    logger.debug(query);

    connection.query(query, function (err, out) {
        if (err) {
            return cb(err);
        }
        var models = [];
        out.forEach(function (model) {
            if (model.modelId) {
                models.push(model.communityModelId);
            } else {
                models.push(model.communityModelId);
            }
        });
        return cb(null, models);
    });
};

// Validate Strategist [internally called]
StrategistDao.prototype.validateStrategist = function (data, cb) {

    var connection = baseDao.getConnection(data);
    var result = [];
    var strategistIds = data.strategistId;
    var query = '';

    query = 'SELECT COUNT(*) FROM strategist WHERE  isDeleted = 0 AND id IN (';
    query = query + strategistIds + ');';
    logger.debug(query);

    connection.query(query, function (err, out) {
        if (err) {
            return cb(err);
        }
        if (out) {
            result.count = out[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

// Validate Approved Strategist [internally called]
StrategistDao.prototype.validateApprovedStrategist = function (data, cb) {

    var connection = baseDao.getConnection(data);
    var result = [];
    var id = data.id;
    var query = '';

    query = ' SELECT communityStrategistpreferenceId, strategistId ';
    query = query + ' FROM communityStrategistValue WHERE isDeleted = 0 AND id = ';
    query = query + id + '';
    logger.debug(query);

    connection.query(query, function (err, out) {
        if (err) {
            return cb(err);
        }
        if (out.length > 0) {
            result.communityStrategistpreferenceId = out[0].communityStrategistpreferenceId;
            result.strategistId = out[0].strategistId;
        }
        return cb(null, result);
    });
};

// Get Community Model Detail [internally called]
StrategistDao.prototype.getCommunityModelDetail = function (data, cb) {

    var connection = baseDao.getConnection(data);
    var models = data.models;
    var communityStrategistId = data.communityStrategistId;
    var query = '';
    query = ' SELECT * FROM strategistModel WHERE communityModelId IN ( ';
    models.forEach(function (model) {
        query = query + model.id + ',';
    }, this);
    query = query.substr(0, query.length - 1);
    query = query + ' ) AND strategistId = ';
    query = query + ' (SELECT id FROM strategist WHERE ';
    query = query + ' communityStrategistId =  ' + communityStrategistId;
    query = query + ' AND isDeleted = 0 ) AND isDeleted = 0';
    logger.debug(query);

    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};
module.exports = StrategistDao;   