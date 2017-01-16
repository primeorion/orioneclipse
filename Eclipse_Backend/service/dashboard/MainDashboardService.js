"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var util = require('util');
var MainDashboardConverter = require("converter/dashboard/MainDashboardConverter.js");

var localCache = require('service/cache').local;
var responseCode = config.responseCode;
var messages = config.messages;

var MainDashboardDao = require('dao/dashboard/MainDashboardDao.js');
var mainDashboardDao = new MainDashboardDao();
var FirmDao = require("dao/admin/FirmDao.js");
var firmDao = new FirmDao();
var mainDashboardConverter = new MainDashboardConverter();

var MainDashboardService = function () { }

MainDashboardService.prototype.getSummary = function (data, cb) {
    logger.info("Get Main Dashboard summary service called (getSummary())");

    mainDashboardDao.getSummary(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting main Dashboard summary (getSummary())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        mainDashboardDao.getEtlMetaInfo(data, function(err, etlMetaInfo){
            if(err){
                logger.error("Error getting ETL meta information");
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            data.firmId = data.user.firmId;
            firmDao.get(data, function (err, firmResult){
                if(err){
                    logger.error("Error getting firm information");
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                mainDashboardDao.getAutoImportPreference(data, function(err, prefResult){
                    if(err){
                        logger.error("Error getting auto import prefrence"+err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if(fetched){
                        mainDashboardConverter.getResponseModel(fetched, etlMetaInfo,firmResult, prefResult, function (err, result) {
                            if (err) {
                                logger.error("Error in getting main Dashboard summary (getSummary())" + err);
                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            logger.info("Main dashboard summary service returned successfully (getSummary())");
                            return cb(null, responseCode.SUCCESS, result);
                        });
                    } else {
                        logger.error("Unable to get main dashboard summary (getSummary())");
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                }); 
            });
        });
    });
};

module.exports = MainDashboardService;