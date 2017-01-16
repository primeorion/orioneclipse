"use strict";

var moduleName = __filename;
var config = require('config');
var helper = require("helper");
var asyncFor = helper.asyncFor;
var localCache = require('service/cache').local;
var sharedCache = require('service/cache').shared;
var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new(require('service/util/UtilService'))();
var ModelDao = function () {}

var messages = config.messages;
var responseCode = config.responseCode;

var tableNames = [
    'model',
    'user',
    'security',
    'securityType',
    'modelSecurities',
    'modelStatus',
    'assetClass',
    'assetCategory',
    'assetSubClass',
    'document',
    'performance'
];

ModelDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("Community Models object", JSON.stringify(data.id));
    var flag = false;
    var communityToken = localCache.get(data.reqId).session.token;
    sharedCache.get(communityToken, function (err, tokenData) {
        var tokenData = JSON.parse(tokenData);
        if (tokenData.roleName == 'Strategist Admin' || tokenData.roleName == 'Strategist User') {
            flag = true;
        }

        var query = [];
        query.push('SELECT CM.id,CM.name, CM.status,CM.isDeleted, ');
        query.push(' USER.userLoginName as createdBy ,USERS.userLoginName as editedBy,');
        query.push(' CM.targetRiskLower,CM.targetRiskUpper,');
        query.push(' CM.style, CM.advisorFee, CM.weightedAvgNetExpenses as weightedAvgNetExpense, CM.isDynamic, ');
        query.push(' CM.currentRisk,CM.minimumAmount, CM.allocation as allocation, ');
        query.push(' CM.strategistId,CM.createdDate as createdOn,CM.editedDate as editedOn');
        query.push(' from ' + tableNames[0] + '  as CM ');
        query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.id = CM.createdBy ');
        query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.id = CM.editedBy ');
        if (flag) {
            query.push(' left outer join strategistUser as su on su.strategistId = CM.strategistId');
            query.push(' WHERE su.userId = ' + data.user.userId);
        } else {
            query.push(' WHERE 1=1 ');
        }
        query.push(' AND CM.isDeleted=0 ');

        if (data.search) {
            if (data.search.match(/^[0-9]+$/g)) {
                query.push(' AND CM.id= "' + data.search + '" ');
            } else {
                query.push(' AND  CM.name LIKE "%' + data.search + '%" ');

            }

        }
        if (data.id) {
            query.push(" AND CM.strategistId  IN (" + data.id + ") ");
        }
        query = query.join("");
        logger.debug("Get Community model List Query" + query);;
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
    });
};

ModelDao.prototype.getModelDetail = function (data, cb) {
    logger.info("Get community model details dao called (getModelDetail())");
    var connection = '';
    if(data.connection){
        connection = data.connection.community;
    }else{
        connection = baseDao.getCommunityDBConnection(data);
    }
    var query = [];
    query.push('SELECT CM.id,CM.name as name, CM.status,CM.isDeleted, ');
    query.push(' USER.userLoginName as createdBy ,USERS.userLoginName as editedBy,');
    query.push(' CM.targetRiskLower,CM.targetRiskUpper,');
    query.push(' CM.currentRisk,CM.minimumAmount,');
    query.push(' CM.style, CM.allocation as allocation, ');
    query.push(' CM.isDynamic,');
    query.push(' CM.advisorFee,CM.weightedAvgNetExpenses as weightedAvgNetExpense,');
    query.push(' CM.strategistId,CM.createdDate as createdOn,CM.editedDate as editedOn');
    query.push(' from ' + tableNames[0] + '  as CM ');
    query.push(' left outer join ' + tableNames[1] + ' as USER  on USER.id = CM.createdBy ');
    query.push(' left outer join ' + tableNames[1] + ' as USERS  on USERS.id = CM.editedBy ');
    query.push(' WHERE CM.id=? ');
    query.push(' AND CM.isDeleted=0 ');
    query = query.join("");
    logger.info("Community Models Query", query + '---------------- ' + util.inspect(data));
    connection.query(query, data.modelId, function (err, result) {
        if (err) {
            logger.error('error in get model detail ' + err);
            return cb(err);
        }
        return cb(null, result);
    });
};

ModelDao.prototype.add = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("Community Models object", JSON.stringify(data.id));

    var currentDate = utilDao.getSystemDateTime();
    var inputData = {
        name: data.name,
        targetRiskLower: data.targetRiskLower,
        targetRiskUpper: data.targetRiskUpper,
        currentRisk: data.currentRisk,
        minimumAmount: data.minimumAmount,
        strategistId: data.strategistId,
        style: data.style,
        tickersWithTargetInPercentage: data.tickersWithTargetInPercentage,
        lowerUpperToleranceInPercentage: data.lowerUpperToleranceInPercentage,
        requireCash: data.requireCash,
        advisorFee: data.advisorFee,
        weightedAvgNetExpense: data.weightedAvgNetExpense,
        createdBy: utilService.getAuditUserId(data.user),
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: currentDate,
        createdDate: currentDate
    };

    var query = 'INSERT INTO ' + tableNames[0] + ' SET ? ON DUPLICATE KEY UPDATE ?';
    logger.info("Community Models Query", query);
    connection.query(query, [inputData, inputData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.update = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("Community Model update object", data);
    var currentDate = utilDao.getSystemDateTime();
    var updateData = {
        name: data.name,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: currentDate,
        targetRiskLower: data.targetRiskLower,
        targetRiskUpper: data.targetRiskUpper,
        isDynamic: data.isDynamic,
        currentRisk: data.currentRisk,
        minimumAmount: data.minimumAmount,
        strategistId: data.strategistId,
        style: data.style,
        advisorFee: data.advisorFee,
        weightedAvgNetExpense: data.weightedAvgNetExpense,
        createdBy: utilService.getAuditUserId(data.user),
        createdDate: currentDate
    };

    var query = 'UPDATE ' + tableNames[0] + ' SET ? WHERE id = ? AND isDeleted = 0 ';
    logger.info("Community Models Query", query);
    connection.query(query, [updateData, data.modelId], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

ModelDao.prototype.delete = function (data, cb) {
    var connection = '';
    if(data.connection){
        connection = data.connection.community;
    }else{
        connection = baseDao.getCommunityDBConnection(data);
    }
    var queryData = {
        isDeleted: 1,
        editedDate: utilDao.getSystemDateTime(null),
        editedBy: utilService.getAuditUserId(data.user)
    };
    var query = 'UPDATE ' + tableNames[0] + ' SET ? ';
    query += ' WHERE ';
    if(data.modelId){
        query += ' id = '+ data.modelId +' AND';
    }
    if(data.id){
        query += ' strategistId = '+ data.id + ' and';
    }
    query += ' isDeleted = 0 ';
    logger.info("Community Models delete Query "+ query);
    connection.query(query, [queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getModel = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT * FROM ' + tableNames[0] + ' WHERE id=' + data.modelId + ' AND isDeleted = 0';
    logger.debug("get model detail query", query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getModelSecurity = function (data, securityId, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT security.id as id, security.orionConnectExternalId ,security.name as name, security.symbol as symbol,';
    query += ' security.company as company, securityAssetCategory.name as category, securityAssetClass.name as assetClass,';
    query += ' securityAssetSubClass.name as subClass, securityType.name as type,';
    query += ' securityModel.allocation as allocation, securityModel.lowerTolerance as lowerTolerancePercent,';
    query += ' securityModel.upperTolerance as upperTolerancePercent';
    query += ' from ' + tableNames[2] + ' as security';
    query += ' left outer join ' + tableNames[4] + ' as securityModel on securityModel.securityId = security.id';
    query += ' left outer join ' + tableNames[3] + ' as securityType on security.securityType = securityType.id';
    query += ' left outer join ' + tableNames[6] + ' as securityAssetClass on security.class = securityAssetClass.id';
    query += ' left outer join ' + tableNames[7] + ' as securityAssetCategory on security.category = securityAssetCategory.id';
    query += ' left outer join ' + tableNames[8] + ' as securityAssetSubClass on security.subClass = securityAssetSubClass.id';
    query += ' WHERE security.id IN ('
    securityId.forEach(function (id) {
        query += id + ',';
    });
    query = query.substr(0, query.length - 1);
    query += ') AND securityModel.modelId = ' + data.modelId;
    logger.debug('query to get security details ' + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
}

ModelDao.prototype.getModelSecurityId = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT securityId as id from ' + tableNames[4] + ' WHERE modelId = ? and isDeleted = 0';
    logger.debug('query to get security details ' + query);
    connection.query(query, [data.modelId], function (err, data) {
        if (err) {
            return cb(err);
        }
        var securityId = [];
        if (data.length > 0) {
            data.forEach(function (security) {
                securityId.push(security.id);
            });
        }
        logger.debug("The value of id is: ", data);
        return cb(null, securityId);
    });
}

ModelDao.prototype.getMasterListStatus = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT id as id, name as name FROM ' + tableNames[5];
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//to be used for model creation via file import
ModelDao.prototype.createModelUsingImport = function (req, res, dataToInsert, cb) {
    var self = this;
    var data = req.data;
    var strategistId = req.data.id;
    var connection = '';
    if(data.connection){
        connection = data.connection.community;
    }else{
        connection = baseDao.getCommunityDBConnection(data);
    }
    var errorArray = [];
    var validationModelResult = [];
    var validateModelQuery = 'SELECT  `name` FROM  ' + tableNames[0] + ' WHERE `isDeleted` = 0 AND `strategistId` = ' + strategistId + ' AND `name` IN (';
    dataToInsert.forEach(function (element) {
        validateModelQuery += "'" + element.name + "',"
    }, this);
    validateModelQuery = validateModelQuery.substr(validateModelQuery, validateModelQuery.length - 1);
    validateModelQuery += ')';

    logger.debug('model validation query ' + validateModelQuery);

    connection.query(validateModelQuery, function (err, result) {
        if (err) {
            logger.error("Error occurred while validating existing model ", err);
            return cb(err, null, responseCode.INTERNAL_SERVER_ERROR, null);
        }
        var foundModelsList = [];
        if (result.length > 0) {
            logger.debug("Model already exist for same strategistId ", JSON.stringify(result));
            var r = [];
            result.forEach(function (d) {
                r.push({
                    message: 'duplicate model name',
                    error: 'Model already exist in database with same model name',
                    data: d.name
                });
            });
            return cb(null, responseCode.DUPLICATE_ENTRY, messages.communityModelAlreadyExist, r);
        } else {
            if (!Array.isArray(dataToInsert)) {
                dataToInsert = [dataToInsert];
            };
            //insert model if not exist
            var currentDate = utilDao.getSystemDateTime();
            var insertedIds = [];
            var count = 0;
            if (dataToInsert && dataToInsert.length > 0) {
              asyncFor(dataToInsert, function (model, index, next) {  //dataToInsert.forEach(function (model) {
                    var inputData = {
                        name: model.name,
                        targetRiskLower: model.targetRiskLower,
                        targetRiskUpper: model.targetRiskUpper,
                        style: model.style,
                        advisorFee: model.advisorFee,
                        weightedAvgNetExpenses: model.weightedAvgNetExpense,
                        isDynamic: 0,
                        currentRisk: model.currentRisk,
                        minimumAmount: model.minimumAmount,
                        strategistId: strategistId,
                        status: model.status ? model.status : 1,
                        allocation: model.allocation,
                        isDeleted: 0,
                        createdDate: currentDate,
                        createdBy: data.user.userId,
                        editedDate: currentDate,
                        editedBy: data.user.userId
                    };
                    var query = 'INSERT INTO model SET ?';
                    connection.query(query, [inputData], function (err, result) {
                       // count++;
                        if (err) {
                            return cb(err);
                        }
                        insertedIds.push(result.insertId);
                        logger.debug('inserted models id are ******************** ' + insertedIds);
                        self.createOrUpdateSecuritiesUsingImport(req, res, dataToInsert, function (err, data) {
                            if (err) {
                                return cb(err, responseCode.INTERNAL_SERVER_ERROR, messages.modelImportFailed);
                            }
                            return next(null, data);
                        });
                    });
                }, function(err, response){
                    return cb(err, responseCode.CREATED, messages.modelImport, insertedIds);
                });
            }
        }
    });
};

ModelDao.prototype.createModelUsingForm = function (req, dataToInsert, cb) {
    var self = this;
    var data = req.data;
    var strategistId = req.data.id;
    var connection = baseDao.getCommunityDBConnection(data);
    var errorArray = [];
    var validationModelResult = [];
    var validateModelQuery = 'SELECT  `name` FROM  ' + tableNames[0];
    validateModelQuery += ' WHERE `isDeleted` = 0 AND `strategistId` = ' + strategistId + ' AND `name` IN (';
    validateModelQuery += '"' + dataToInsert.name + '")';

    logger.debug('model validation query ' + validateModelQuery);

    connection.query(validateModelQuery, function (err, result) {
        if (err) {
            logger.error("Error occurred while validating existing model ", err);
            return cb(err, null, responseCode.INTERNAL_SERVER_ERROR, null);
        }
        if (result.length > 0) {
            var r = [];
            r.push({
                message: 'duplicate model name',
                error: 'Model already exist in database with same model name',
                data: result[0].name
            });
            return cb(null, responseCode.DUPLICATE_ENTRY, messages.communityModelAlreadyExist, r);
        } else {
            var currentDate = utilDao.getSystemDateTime();
            var insertedIds = [];
            var model = dataToInsert;
            var inputData = {
                name: model.name,
                targetRiskLower: model.targetRiskLower,
                targetRiskUpper: model.targetRiskUpper,
                style: model.style,
                advisorFee: model.advisorFee,
                weightedAvgNetExpenses: model.weightedAvgNetExpense,
                isDynamic: model.isDynamic ? model.isDynamic : 0,
                currentRisk: model.currentRisk,
                minimumAmount: model.minimumAmount,
                strategistId: strategistId,
                status: model.status ? model.status : 1,
                allocation: model.allocationPercent,
                isDeleted: 0,
                createdDate: currentDate,
                createdBy: data.user.userId,
                editedDate: currentDate,
                editedBy: data.user.userId
            };
            var query = 'INSERT INTO model SET ?';
            connection.query(query, [inputData], function (err, result) {
                if (err) {
                    return cb(err, null, responseCode.INTERNAL_SERVER_ERROR, null);
                }
                insertedIds.push(result.insertId);
                self.createOrUpdateSecuritiesUsingForm(req, dataToInsert, function (err, data) {
                    if (err) {
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR, messages.modelImportFailed);
                    }
                    return cb(err, responseCode.CREATED, messages.modelImport, insertedIds);
                });
            });
        }
    });
};

ModelDao.prototype.createOrUpdateSecuritiesUsingForm = function (req, dataToInsert, cb) {
    var data = req.data;
    var strategistId = req.data.id;
    var connection = baseDao.getCommunityDBConnection(data);

    var currentDate = utilDao.getSystemDateTime();
    var values = [];
    var sqlArray = [];

    var securitiesArray = dataToInsert.securities;
    for (var index in securitiesArray) {
        var security = securitiesArray[index];
        var symbol = security['symbol'];
        var modelName = dataToInsert.name;
        var allocation = security['allocation'];
        var lowerTolerance = security['lowerTolerancePercent'];
        var upperTolerance = security['upperTolerancePercent'];
        var sql = [];
        sql.push('INSERT INTO ' + tableNames[4] + ' ( modelId, securityId, allocation, upperTolerance, lowerTolerance, isDeleted) VALUES ( ( SELECT id FROM ' + tableNames[0] + ' WHERE name = ' + "'" + modelName + "' AND strategistId = " + strategistId + " AND isDeleted = 0) ");
        sql.push('( SELECT id FROM ' + tableNames[2] + ' WHERE symbol = ' + "'" + symbol + "') ");
        sql.push(allocation);
        sql.push(upperTolerance);
        sql.push(lowerTolerance);
        sql.push('0) ;');
        sqlArray.push(sql.toString());
        logger.debug('query to insert sercurity ' + sql);
    }
    var errorArray = [];
    for (var i = 0; i < sqlArray.length; i++) {
        (function (data) {
            var query = sqlArray[i];
            logger.info("Community Model Security create Query", query);
            connection.query(query, function (err, result) {
                if (err) {
                    errorArray.push({
                        error: err,
                        query: query,
                        result: result
                    })
                }
            });
        })(i);
    }

    if (errorArray.length > 0) {
        return cb(errorArray.toString(), data); //to be removed
    } else {
        return cb(null, true); //to be removed
    }
};

ModelDao.prototype.createOrUpdateSecuritiesUsingImport = function (req, res, dataToInsert, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("Community Models object", JSON.stringify(data.id));
    var strategistId = data.id;
    var currentDate = utilDao.getSystemDateTime();
    var values = [];
    var sqlArray = [];
    logger.debug('data to be insert ' + JSON.stringify(dataToInsert));
    if (!Array.isArray(dataToInsert)) {
        dataToInsert = [dataToInsert];
    }

    for (var i = 0; i < dataToInsert.length; i++) {
        var model = dataToInsert[i];
        var securitiesArray = model.securities;
        securitiesArray.forEach(function (security) {
            var symbol = security['symbol'];
            var modelName = model.name;
            var allocation = security['allocation'];
            var lowerTolerance = security['lowerTolerancePercent'];
            var upperTolerance = security['upperTolerancePercent'];
            var sql = [];
            sql.push('INSERT INTO ' + tableNames[4] + ' ( modelId, securityId, allocation, upperTolerance, lowerTolerance, isDeleted ) VALUES ( ( SELECT id FROM ' + tableNames[0] + ' WHERE name = ' + "'" + modelName + "' AND strategistId = " + strategistId + " AND isDeleted = 0) ");
            sql.push('( SELECT id FROM ' + tableNames[2] + ' WHERE symbol = ' + "'" + symbol + "') ");
            sql.push(allocation);
            sql.push(upperTolerance);
            sql.push(lowerTolerance);
            sql.push('0) ;');
            sqlArray.push(sql.toString());
            logger.debug('query to insert security ' + sql);
        });
    }
    var errorArray = [];
    for (var i = 0; i < sqlArray.length; i++) {
        (function (data) {
            var query = sqlArray[i];
            logger.info("Community Model Security create Query", query);
            connection.query(query, function (err, result) {
                if (err) {
                    errorArray.push({
                        error: err,
                        query: query,
                        result: result
                    })
                }
            });
        })(i);
    }

    if (errorArray.length > 0) {
        return cb(errorArray.toString(), data); //to be removed
    } else {
        return cb(null, true); //to be removed
    }
};

ModelDao.prototype.get = function (req, symbolArray, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT symbol FROM ' + tableNames[2] + ' WHERE `symbol` IN ?';
    connection.query(query, [symbolArray], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.checkSymbol = function (req, symbolArray, cb) {
    var data = req.data;
    var connection = '';
    if(data.connection){
        connection = data.connection.community;
    }else{
        connection = baseDao.getCommunityDBConnection(data);
    }
    var query = 'SELECT symbol FROM ' + tableNames[2] + ' WHERE `symbol` IN (?)';
    connection.query(query, [symbolArray], function (err, data) {
        if (err) {
            logger.info(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.checkSymbolById = function (req, symbolArray, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT `id` FROM ' + tableNames[2] + ' WHERE `id` IN (?)';
    connection.query(query, [symbolArray], function (err, data) {
        if (err) {
            logger.info(err);
            return cb(err);
        }
        var dbSymbolIdList = [];
        for (var i in data) {
            dbSymbolIdList.push(data[i].id);
        }
        return cb(null, dbSymbolIdList);
    });
};

ModelDao.prototype.getModelIdNameMapByModelName = function (req, cb) {
    var data = req.data;
    var modelName = req.data.modelName;
    var strategistId = req.data.strategistId;
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT id FROM ' + tableNames[0] + ' WHERE `name` = ?';
    logger.info("Get modelId Query", query);
    connection.query(query, modelName, function (err, data) {
        if (err) {
            logger.info(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.getModelSecurityMappingById = function (data, cb) {
    var modelId = data.modelId;
    var strategistId = data.id;
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT `securityId` FROM `modelSecurities` WHERE `modelId` = ?';
    logger.info("Get model security mapping Query", query);
    connection.query(query, modelId, function (err, data) {
        if (err) {
            logger.info(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

//todo
ModelDao.prototype.updateModel = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var modelId = data.modelId;
    var strategistId = data.id;
    var allocationPercent = 0;
    var currentDate = utilDao.getSystemDateTime();
    data.securities.forEach(function (security) {
        allocationPercent += security.allocation
    });

    if (allocationPercent != 100) {
        return cb('Model security allocation is not equal to 100', 'BAD_REQUEST');
    }

    var values = {
        name: data.name,
        targetRiskLower: data.targetRiskLower,
        targetRiskUpper: data.targetRiskUpper,
        style: data.style,
        advisorFee: data.advisorFee,
        weightedAvgNetExpenses: data.weightedAvgNetExpense,
        isDynamic: data.isDynamic != undefined ? data.isDynamic : 0,
        currentRisk: data.currentRisk,
        minimumAmount: data.minimumAmount,
        strategistId: strategistId,
        status: data.status,
        allocation: allocationPercent,
        editedDate: currentDate,
        editedBy: utilService.getAuditUserId(data.user)
    }
    var query = 'UPDATE ' + tableNames[0] + ' SET ? WHERE id = ?';
    connection.query(query, [values, modelId], function (err, data) {
        if (err) {
            logger.info(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

ModelDao.prototype.updateModelSecuritiesByModelId = function (req, cb) {
    var data = req.data;
    var modelName = req.data.modelName;
    var strategistId = req.data.strategistId;
    var connection = baseDao.getCommunityDBConnection(data);
};

/*ModelDao.prototype.getModelIds = function(req, nameArray, cb){
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT `id` FROM ' + tableNames[0] + ' WHERE `isDeleted` = 0 AND `strategistId` = ' +  req.params.strategistId + ' AND `name` IN (?)';
    connection.query(query, [nameArray], function(err, data){
        if( err ) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
}*/

ModelDao.prototype.addSecurityToModel = function (req, securityNotInDb, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'INSERT INTO `modelSecurities` (`modelId`, `securityId`,`allocation`,`lowerTolerance`,`upperTolerance`) VALUES ?';
    logger.info('add security to model query : ' + query);
    var values = [];
    var securities = data.securities;
    for (var h in securityNotInDb) {
        for (var i in securities) {
            var security = securities[i];
            if (security.id == securityNotInDb[h]) { //h is the id of security to be inserted in modelSecurities table as it is new security added.
                var row = [];
                row.push(data.modelId);
                row.push(security.id);
                row.push(security.allocation);
                row.push(security.lowerTolerancePercent);
                row.push(security.upperTolerancePercent);
                values.push(row);
            }
        }
    }
    logger.info('Insert security query for model update ' + values.join())
    connection.query(query, [values], function (err, data) {
        if (err) {
            return cb(err, data);
        }
        return cb(null, data);
    });
}

ModelDao.prototype.softDeleteSecurityModel = function (req, securityIdNotInRequest, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'UPDATE `modelSecurities` SET isDeleted = 1 WHERE securityId IN (?) AND modelId = ?';
    connection.query(query, [securityIdNotInRequest, data.modelId], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
}
ModelDao.prototype.updateSecurityToModel = function (req, securityIdNotInRequest, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var query = null;
    query = 'UPDATE `modelSecurities` SET `isDeleted` = 0,  `allocation` = (CASE ';
    var securities = data.securities;
    for (var i in securities) {
        var security = securities[i];
        query += ' WHEN securityId = ' + security.id + ' THEN ' + security.allocation;
    }
    query += ' END ), `lowerTolerance` = (CASE ';
    for (var i in securities) {
        var security = securities[i];
        query += ' WHEN securityId = ' + security.id + ' THEN ' + security.lowerTolerancePercent;
    }
    query += ' END ), `upperTolerance` = (CASE ';
    for (var i in securities) {
        var security = securities[i];
        query += ' WHEN securityId = ' + security.id + ' THEN ' + security.upperTolerancePercent;
    }
    query += ' END ) '
    query += ' WHERE securityId in (?) AND modelId = ?'
    logger.info('update security to model query ' + query);
    connection.query(query, [securityIdNotInRequest, data.modelId], function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
}

ModelDao.prototype.verifyModel = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("verifyModel object", JSON.stringify(data));
    var query = 'Select * from ' + tableNames[0];
    query += ' WHERE id = ' + data.modelId;
    query += ' and isDeleted = 0';

    logger.debug("verifyModel query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }

        // logger.error("result is ", result[0].strategistId);
        return cb(null, result);
    });
}

ModelDao.prototype.getModelDocuments = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("getModelDocuments object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime();
    var query = '';
    query = "SELECT * FROM " + tableNames[9];
    query += " WHERE strategistId=? and NOT documentName = 'smallLogo' and NOT documentName = 'largeLogo' and isDeleted = 0 and modelId = ?";

    logger.info("Strategist get documents detail query", query);
    connection.query(query, [data.id, data.modelId], function (err, result) {
        if (err) {
            logger.info("error in result of get strategist documents" + err);
            return cb(err);
        }

        return cb(null, result);
    });
};

/** Strategist model commentary */
ModelDao.prototype.addCommentary = function (req, cb) {
    var modelId = req.params.id
    var commentary = req.data.commentary;
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("addCommentary ", JSON.stringify(data));
    var query = 'SELECT name from model where id=' + modelId + " and isDeleted=0";
    logger.debug("addCommentary query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        if (result.length == 0) {
            return cb('Model does not exist', 'NOT_FOUND');
        }
        var query = 'UPDATE model SET commentary = ? WHERE id = ? ';
        logger.debug("modifyCommentary query " + query);
        connection.query(query, [commentary, modelId], function (err, result) {
            if (err) {
                return cb(err);
            }
            return cb(null, result);
        });
    });
}
ModelDao.prototype.updateCommentary = function (req, cb) {
    var modelId = req.params.id;
    var commentary = req.data.commentary;
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("modifyCommentary ", JSON.stringify(data));
    var query = 'UPDATE model SET commentary = ? WHERE id =  ? ';
    logger.debug("modifyCommentary query " + query);
    connection.query(query, [commentary, modelId], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}
ModelDao.prototype.getCommentary = function (req, cb) {
    var modelId = req.params.id;
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("getCommentary ", JSON.stringify(data));
    var query = 'SELECT * FROM model WHERE id = ?';
    query += ' and isDeleted = 0';
    logger.debug("getCommentary query " + query);
    connection.query(query, [modelId], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}
ModelDao.prototype.deleteCommentary = function (req, cb) {
    var modelId = req.params.id;
    var data = req.data;
    var commentary = null;
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("deleteCommentary ", JSON.stringify(data));
    var query = 'UPDATE model SET commentary = ? WHERE id = ?;';
    logger.debug("modifyCommentary query " + query);
    connection.query(query, [commentary, modelId], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

ModelDao.prototype.addAdvertisement = function (req, cb) {
    var modelId = req.params.modelId;
    var advertisement = req.data.advertisement;
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("advertisement data ", JSON.stringify(data));
    var query = 'SELECT name from model where id=' + modelId;
    logger.debug("addAdvertisement query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        if (result.length == 0) {
            return cb('Model does not exist', 'NOT_FOUND');
        }
        var query = 'UPDATE `model` SET `advertisementMessage`=\'"' + advertisement + '"\' WHERE `id`=' + modelId;
        logger.debug("modifyAdvertisement query " + query);
        connection.query(query, function (err, result) {
            if (err) {
                return cb(err);
            }
            return cb(null, result);
        });
    });
}

/** strategist model performance */
ModelDao.prototype.addPerformance = function (req, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var modelId = parseInt(req.params.modelId);
    var currentDate = utilDao.getSystemDateTime();
    logger.debug("performance data ", JSON.stringify(data));
    var query = 'SELECT name from model where id=' + modelId + ' and isDeleted=0';
    logger.debug("The query for adding performance is " + query);

    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        if (result.length == 0) {
            return cb('Model does not exist', 'NOT_FOUND');
        }
        var inputData = {
            modelId: modelId,
            mtd: data.mtd,
            qtd: data.qtd,
            ytd: data.ytd,
            oneYear: data.oneYear,
            threeYear: data.threeYear,
            fiveYear: data.fiveYear,
            tenYear: data.tenYear,
            inception: data.inception,
            isDeleted: 0,
            asOnDate: new Date(data.asOnDate),
            createdDate: currentDate,
            createdBy: data.user.userId,
            editedDate: currentDate,
            editedBy: data.user.userId
        };
        var query = 'INSERT INTO ' + tableNames[10] + ' SET ? ';
        logger.debug("addPerformance query " + query);
        connection.query(query, [inputData], function (err, result) {
            if (err) {
                return cb(err);
            }
            inputData.id = result.insertId;

            var query = "SELECT PF.id as id, PF.modelId as modelId, PF.mtd as mtd,";
            query += " PF.qtd as qtd, PF.ytd as ytd, PF.oneYear as oneYear, PF.threeYear as threeYear,";
            query += " PF.fiveYear as fiveYear, PF.tenYear as tenYear, PF.inception as inception,";
            query += " PF.isDeleted as isDeleted, PF.asOnDate as asOnDate, PF.createdDate as createdDate,";
            query += " USER.userLoginName as createdBy, PF.editedDate as editedDate,";
            query += " USERS.userLoginName as editedBy FROM " + tableNames[10] + " AS PF";
            query += " left outer join " + tableNames[1] + " as USER  on USER.id = PF.createdBy ";
            query += " left outer join " + tableNames[1] + " as USERS  on USERS.id = PF.editedBy ";
            query += " WHERE PF.id=" + result.insertId;

            logger.info(' performance fetch query ' + query);

            connection.query(query, function (err, result) {

                if (err) {
                    return cb(err);
                }

                return cb(null, result);

            });
        });
    });
};

ModelDao.prototype.updatePerformance = function (req, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var modelId = parseInt(req.params.modelId);
    var currentDate = utilDao.getSystemDateTime();
    var query = 'SELECT * from ' + tableNames[10] + ' where modelId=' + modelId + " and isDeleted=0 and id=" + data.id;

    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        if (result.length == 0) {
            return cb('Model or Performance does not exist', 'NOT_FOUND');
        }
        var updatedData = {
            modelId: modelId,
            mtd: data.mtd,
            qtd: data.qtd,
            ytd: data.ytd,
            oneYear: data.oneYear,
            threeYear: data.threeYear,
            fiveYear: data.fiveYear,
            tenYear: data.tenYear,
            inception: data.inception,
            isDeleted: 0,
            asOnDate: new Date(data.asOnDate),
            editedDate: currentDate,
            editedBy: data.user.userId
        };
        var query = 'UPDATE ' + tableNames[10] + ' SET ? WHERE id = ?';
        logger.debug("update query " + query);
        connection.query(query, [updatedData, data.id], function (err, result) {
            if (err) {
                return cb(err);
            }
            var query = "SELECT PF.id as id, PF.modelId as modelId, PF.mtd as mtd,";
            query += " PF.qtd as qtd, PF.ytd as ytd, PF.oneYear as oneYear, PF.threeYear as threeYear,";
            query += " PF.fiveYear as fiveYear, PF.tenYear as tenYear, PF.inception as inception,";
            query += " PF.isDeleted as isDeleted, PF.asOnDate as asOnDate, PF.createdDate as createdDate,";
            query += " USER.userLoginName as createdBy, PF.editedDate as editedDate,";
            query += " USERS.userLoginName as editedBy FROM " + tableNames[10] + " AS PF";
            query += " left outer join " + tableNames[1] + " as USER  on USER.id = PF.createdBy ";
            query += " left outer join " + tableNames[1] + " as USERS  on USERS.id = PF.editedBy ";
            query += " WHERE PF.id=" + data.id;

            logger.info(' performance update query ' + query);

            connection.query(query, function (err, result) {
                if (err) {
                    return cb(err);
                }
                return cb(null, result);
            });
        });
    });
};

ModelDao.prototype.getPerformanceDetails = function (req, cb) {
    var modelId = req.params.id;
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("getPerformance ", JSON.stringify(data));

    var query = "SELECT PF.id as id, PF.modelId as modelId, PF.mtd as mtd,";
    query += " PF.qtd as qtd, PF.ytd as ytd, PF.oneYear as oneYear, PF.threeYear as threeYear,";
    query += " PF.fiveYear as fiveYear, PF.tenYear as tenYear, PF.inception as inception,";
    query += " PF.asOnDate as asOnDate, PF.createdDate as createdDate,";
    query += " USER.userLoginName as createdBy, PF.editedDate as editedDate,";
    query += " USERS.userLoginName as editedBy FROM " + tableNames[10] + " AS PF";
    query += " left outer join " + tableNames[1] + " as USER  on USER.id = PF.createdBy ";
    query += " left outer join " + tableNames[1] + " as USERS  on USERS.id = PF.editedBy ";
    query += " WHERE PF.modelId = ? and PF.isDeleted = 0";

    logger.debug("getPerformance query " + query);
    connection.query(query, [modelId], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

ModelDao.prototype.getPerformanceDetailsFromModelName = function (req, cb) {
    var modelName = req.params.value;
    var strategistId = req.data.strategistId;
    var connection = baseDao.getCommunityDBConnection(req.data);
    logger.debug("getPerformance ", JSON.stringify(req.data));
    var query = 'SELECT PM.id as id, PM.modelId as modelId, PM.mtd as mtd,';
    query += ' PM.qtd as qtd, PM.ytd as ytd, PM.oneYear as oneYear, PM.threeYear as threeYear,';
    query += ' PM.fiveYear as fiveYear, PM.tenYear as tenYear, PM.inception as inception,';
    query += ' PM.isDeleted as isDeleted, PM.asOnDate as asOnDate, PM.createdDate as createdDate,';
    query += ' USER.userLoginName as createdBy, PM.editedDate as editedDate,';
    query += ' USERS.userLoginName as editedBy';
    query += ' from ' + tableNames[0] + ' AS MM';
    query += ' inner join ' + tableNames[10] + ' AS PM on';
    query += ' PM.modelId = MM.id';
    query += ' left outer join ' + tableNames[1] + ' as USER  on USER.id = PM.createdBy ';
    query += ' left outer join ' + tableNames[1] + ' as USERS  on USERS.id = PM.editedBy ';
    query += ' where MM.name="' + modelName + '" and MM.strategistId=' + strategistId;
    query += ' AND MM.isDeleted=0 and PM.isDeleted=0';

    logger.debug("getPerformance by model name query " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        logger.debug("!!!!!!!!!!!!" + JSON.stringify(result));
        return cb(null, result);
    });

};

ModelDao.prototype.deletePerformance = function (req, cb) {
    var modelId = req.params.modelId;
    var performanceId = req.params.performanceId;
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    logger.debug("deletePerformance ", JSON.stringify(data));
    var query = 'UPDATE ' + tableNames[10] + ' SET isDeleted = 1 WHERE id = ? and modelId = ?';
    logger.debug("modifyCommentary query " + query);
    connection.query(query, [performanceId, modelId], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

ModelDao.prototype.getModelsAgainstStrategist = function (inputData, cb) {
    var connection = baseDao.getCommunityDBConnection(inputData);
    var query = 'SELECT * from model WHERE strategistId = ? and isDeleted = 0';
    logger.debug("select models against strategist query  " + query);
    connection.query(query, [inputData.strategistId], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

module.exports = ModelDao;