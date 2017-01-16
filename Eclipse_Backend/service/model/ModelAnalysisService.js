"use strict";

var moduleName = __filename;
var ModelAnalysisDao = require('dao/model/ModelAnalysisDao.js');
var modelAnalysisDao = new ModelAnalysisDao();
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;

var localCache = require('service/cache').local;
var ModelAnalysisService =  function() {}
var helper = require("helper");
var asyncFor = helper.asyncFor;


ModelAnalysisService.prototype.getModelAnalysis = function (data, cb) {
    var self = this;
    if(data.isIncludeTradeBlockAccount == undefined || data.isExcludeAsset == undefined){
         return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " isIncludeTradeBlockAccount or isExcludeAsset"});
    }
    if(data.assetType == "securityset") {
        self.getModelAnalysisForSecurity(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "category") {
        self.getModelAnalysisForCategory(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "class") {
        self.getModelAnalysisForClass(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "subclass") {
        self.getModelAnalysisForSubClass(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else{
            return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " asset type" });
    }
};

ModelAnalysisService.prototype.getModelAggregate = function (data, cb) {
    var self = this;
    modelAnalysisDao.getModelAggregate(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

ModelAnalysisService.prototype.getModelAnalysisForSecurity = function (data, cb) {
    var self = this;
    modelAnalysisDao.getModelAnalysisForSecurity(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};
ModelAnalysisService.prototype.getModelAnalysisForClass = function (data, cb) {
    var self = this;
    modelAnalysisDao.getModelAnalysisForClass(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};
ModelAnalysisService.prototype.getModelAnalysisForCategory = function (data, cb) {
    var self = this;
    modelAnalysisDao.getModelAnalysisForCategory(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};
ModelAnalysisService.prototype.getModelAnalysisForSubClass = function (data, cb) {
    var self = this;
    modelAnalysisDao.getModelAnalysisForSubClass(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};
module.exports = ModelAnalysisService;