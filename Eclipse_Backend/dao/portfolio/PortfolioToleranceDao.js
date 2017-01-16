"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');
var PortfolioToleranceDao = function () { }

/* This Query used to get all securities by account id. This data is showing in trade->model tolerance */
PortfolioToleranceDao.prototype.getModelToleranceSecurity = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var portfolioId = data.id;
    var accountId = data.accountId;
    var isSleevePortfolio = data.isSleevePortfolio;
    firmConnection.query("CALL getModelToleranceSecurityForPortfolio(?,?,?)", [portfolioId, accountId, isSleevePortfolio], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all classes of securities by portfolio id. This data is showing in trade->model tolerance */
PortfolioToleranceDao.prototype.getModelToleranceClass = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var portfolioId = data.id;
    var accountId = data.accountId;
    var isSleevePortfolio = data.isSleevePortfolio;
    firmConnection.query("CALL getModelToleranceAssetClassForPortfolio(?,?,?)", [portfolioId, accountId, isSleevePortfolio], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}


/* This Query used to get all Categories of securities by portfolio id. This data is showing in trade->model tolerance */
PortfolioToleranceDao.prototype.getModelToleranceCategory = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var portfolioId = data.id;
    var accountId = data.accountId;
    var isSleevePortfolio = data.isSleevePortfolio;
    firmConnection.query("CALL getModelToleranceAssetCategoryForPortfolio(?,?,?)", [portfolioId, accountId, isSleevePortfolio], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}


/* This Query used to get all subclasses of securities by portfolio id. This data is showing in trade->model tolerance */
PortfolioToleranceDao.prototype.getModelToleranceSubClass = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var portfolioId = data.id;
    var accountId = data.accountId;
    var isSleevePortfolio = data.isSleevePortfolio;
    firmConnection.query("CALL getModelToleranceSubClassForPortfolio(?,?,?)", [portfolioId, accountId, isSleevePortfolio], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all portfolios which are outOfTolerance by security id. This data is showing in trade->model analysis */
PortfolioToleranceDao.prototype.getPortfoliosWithOutOfToleranceSecurity = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var assetId = data.assetId;
    var modelId = data.modelId;
    var roleId = data.user.id;
    console.log("In getPortfoliosWithOutOfToleranceSecurity ")
    firmConnection.query("CALL getModelAnalysisSecurityForPortfolioOut(?,?,?)", [assetId, modelId, roleId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all portfolios which are outOfTolerance by class id. This data is showing in trade->model analysis */
PortfolioToleranceDao.prototype.getPortfoliosWithOutOfToleranceClass = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var assetId = data.assetId;
    var modelId = data.modelId;
    var roleId = data.user.id;
    firmConnection.query("CALL getModelAnalysisAssetClassForPortfolioOut(?,?,?)", [assetId, modelId, roleId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all portfolios which are outOfTolerance by category id. This data is showing in trade->model analysis */
PortfolioToleranceDao.prototype.getPortfoliosWithOutOfToleranceCategory = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var assetId = data.assetId;
    var modelId = data.modelId;
    var roleId = data.user.id;
    firmConnection.query("CALL getModelAnalysisAssetCategoryForPortfolioOut(?,?,?)", [assetId, modelId, roleId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}

/* This Query used to get all portfolios which are outOfTolerance by subclass id. This data is showing in trade->model analysis */
PortfolioToleranceDao.prototype.getPortfoliosWithOutOfToleranceSubClass = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var assetId = data.assetId;
    var modelId = data.modelId;
    var roleId = data.user.id;
    firmConnection.query("CALL getModelAnalysisSubClassForPortfolioOut(?,?,?)", [assetId, modelId, roleId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows);
    });
}
module.exports = PortfolioToleranceDao;
    