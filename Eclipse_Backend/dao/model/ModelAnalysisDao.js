"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');
var ModelAnalysisDao = function () { }


/* This Query used to get all securities by model id. This data is showing in trade->model analysis */
ModelAnalysisDao.prototype.getModelAggregate = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    firmConnection.query("CALL getModelAnalysisForAggregate(?,?,?,?)", [data.modelId, data.isIncluseCostBasis, 
                              data.isIncludeTradeBlockAccount, data.isExcludeAsset], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows[0]);
    });
}

/* This Query used to get all securities by model id. This data is showing in trade->model analysis */
ModelAnalysisDao.prototype.getModelAnalysisForSecurity = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var modelId = data.id;
    firmConnection.query("CALL getModelAnalysisForSecurityForModel(?,?,?)", [modelId, data.isIncludeTradeBlockAccount, data.isExcludeAsset], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all classes of securities by model id. This data is showing in trade->model analysis */
ModelAnalysisDao.prototype.getModelAnalysisForClass = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var portfolioId = data.id;
    firmConnection.query("CALL getModelAnalysisForAssetClassForModel(?,?,?)", [data.id, data.isIncludeTradeBlockAccount, data.isExcludeAsset], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}


/* This Query used to get all Categories of securities by model id. This data is showing in trade->model analysis */
ModelAnalysisDao.prototype.getModelAnalysisForCategory = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var portfolioId = data.id;
    firmConnection.query("CALL getModelAnalysisForAssetCategoryForModel(?,?,?)", [data.id, data.isIncludeTradeBlockAccount, data.isExcludeAsset], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}


/* This Query used to get all subclasses of securities by model id. This data is showing in trade->model analysis */
ModelAnalysisDao.prototype.getModelAnalysisForSubClass = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var portfolioId = data.id;
    firmConnection.query("CALL getModelAnalysisForSubClassForModel(?,?,?)", [data.id, data.isIncludeTradeBlockAccount, data.isExcludeAsset], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

module.exports = ModelAnalysisDao;
