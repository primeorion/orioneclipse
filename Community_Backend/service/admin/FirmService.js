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
            cb(messages.Unauthorized, responseCodes.UNAUTHORIZED);
        }
    });
};

module.exports = FirmService;