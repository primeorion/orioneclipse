"use strict";

var moduleName = __filename;
var PortfolioToleranceDao = require('dao/portfolio/PortfolioToleranceDao.js');
var portfolioToleranceDao = new PortfolioToleranceDao();
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var TradeOrderConverter = require("converter/tradeorder/TradeOrderConverter.js");

var localCache = require('service/cache').local;
var PortfolioToleranceService =  function() {}
var tradeOrderConverter = new TradeOrderConverter
var helper = require("helper");
var asyncFor = helper.asyncFor;

PortfolioToleranceService.prototype.getModelTolerance = function (data, cb) {
    var self = this;
    if(data.isSleevePortfolio == undefined) {
        return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " isSleevePortfolio" });
    }
    if(data.assetType == "securityset") {
        self.getModelToleranceSecurity(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "category") {
        self.getModelToleranceCategory(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "class") {
        self.getModelToleranceClass(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "subclass") {
        self.getModelToleranceSubClass(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else{
            return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " asset type" });
    }
    
};
PortfolioToleranceService.prototype.getModelToleranceSecurity = function (data, cb) {
    var self = this;
    portfolioToleranceDao.getModelToleranceSecurity(data, function (err, rs) {
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
PortfolioToleranceService.prototype.getModelToleranceClass = function (data, cb) {
    var self = this;
    portfolioToleranceDao.getModelToleranceClass(data, function (err, rs) {
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
PortfolioToleranceService.prototype.getModelToleranceCategory = function (data, cb) {
    var self = this;
    portfolioToleranceDao.getModelToleranceCategory(data, function (err, rs) {
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
PortfolioToleranceService.prototype.getModelToleranceSubClass = function (data, cb) {
    var self = this;
    portfolioToleranceDao.getModelToleranceSubClass(data, function (err, rs) {
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

PortfolioToleranceService.prototype.getPortfoliosWithOutOfTolerance = function(data, cb) {
    var self = this;
    if(data.assetType == "securityset") {
        self.getPortfoliosWithOutOfToleranceBySecurity(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "category") {
        self.getPortfoliosWithOutOfToleranceByCategory(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "class") {
        self.getPortfoliosWithOutOfToleranceByClass(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else if(data.assetType == "subclass") {
        self.getPortfoliosWithOutOfToleranceBySubClass(data, function (err, status, rs) {
                return cb(err, status, rs);
        });
    }
    else{
            return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " asset type" });
    }
}

PortfolioToleranceService.prototype.getPortfoliosWithOutOfToleranceBySecurity = function(data, cb) {

     portfolioToleranceDao.getPortfoliosWithOutOfToleranceSecurity(data, function (err, rs) {
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
}


PortfolioToleranceService.prototype.getPortfoliosWithOutOfToleranceByCategory = function(data, cb) {

     portfolioToleranceDao.getPortfoliosWithOutOfToleranceCategory(data, function (err, rs) {
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
}

PortfolioToleranceService.prototype.getPortfoliosWithOutOfToleranceByClass = function(data, cb) {

     portfolioToleranceDao.getPortfoliosWithOutOfToleranceClass(data, function (err, rs) {
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
}

PortfolioToleranceService.prototype.getPortfoliosWithOutOfToleranceBySubClass = function(data, cb) {

     portfolioToleranceDao.getPortfoliosWithOutOfToleranceSubClass(data, function (err, rs) {
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
}
module.exports = PortfolioToleranceService;