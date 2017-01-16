"use strict";

var moduleName = __filename;
var config = require('config');
var FirmDao = require('dao/admin/FirmDao.js');
var logger = require('helper/Logger.js')(moduleName);

var messages = config.messages;
var responseCodes = config.responseCode;

var firmDao = new FirmDao();

var FirmService =  function() {}

FirmService.prototype.getDefaultFirmIdUsingConnectUserId = function (data, cb){
    firmDao.getDefaultFirmIdUsingConnectUserId(data, function(err, result){
        if (err) {
            logger.error(err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        } else if(!!result){
            return cb(null, responseCodes.SUCCESS, result);
        } else{
            logger.info("Unauthorized");
            cb(messages.unauthenticated, responseCodes.UNAUTHORIZED);
        }
    });
};
FirmService.prototype.saveProfile = function(data, cb){
    logger.info("save firm profile call start (saveProfile())");
    var self = this;
    firmDao.saveProfile(data,function(err,result){
        if (err) {
            logger.error("Error saving firm profile (saveProfile())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        self.getProfile(data, function(err,status, result){
            if(err){
                logger.debug("Error getting fimr profile(saveProfile())" + err);
                return cb(err,responseCodes.INTERNAL_SERVER_ERROR);
            }
        return cb(null, responseCodes.SUCCESS, result);
        })
    });
}
FirmService.prototype.getProfile = function(data, cb){
    logger.info("get firm profile call start (getProfile())");

    firmDao.getProfile(data,function(err,result){
        if (err) {
            logger.error("Error getting firm profile (getProfile())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        cb(null, responseCodes.SUCCESS, result);
    });
}
module.exports = FirmService;