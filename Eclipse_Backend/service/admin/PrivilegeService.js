"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require('helper');


var PrivilegeDao = require('dao/admin/PrivilegeDao.js');
var logger = require('helper/Logger.js')(moduleName);

var messages = config.messages;
var responseCodes = config.responseCodes;
var logger = helper.logger(moduleName);

var privilegeDao = new PrivilegeDao();

var PrivilegeService = function() {}

PrivilegeService.prototype.getPrivilegeList = function (data,cb) {
    logger.info("Get privilege list service called (getPrivilegeList())");
    privilegeDao.getAll(data, function (err, result) {
        if (err) {
            logger.error("Error in getting privilege list (getPrivilegeList())" + err);
            return cb(err,responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Get privilege list service returned successfully (getPrivilegeList())");
        return cb(null,responseCodes.SUCCESS, result);
    });
};

module.exports = PrivilegeService;