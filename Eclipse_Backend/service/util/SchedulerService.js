"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCodes;

var userDao = new (require('dao/admin/UserDao.js'))();
var roleDao = new (require('dao/admin/RoleDao.js'))();
var SchedulerService = function() {};

SchedulerService.prototype.changeStatus = function (data,cb) {
    var isError = false;
    logger.info("SchedulerService change status called  (changeStatus())");
    roleDao.changeStatusToActive(data,function (err, result) {
        if (err) {
            isError = true;
            logger.error("Changing status to active role (changeStatus())" + err);
        }
        logger.info("role status change to active successfully  (changeStatus())");
        roleDao.changeStatusToInActive(data,function (err, result) {
            if (err) {
                isError = true;
                logger.error("Changing status to inactive role (changeStatus())" + err);
            }
            logger.info("role status change to inActive successfully  (changeStatus())");
            userDao.changeStatusToActive(data,function (err, result) {
                if (err) {
                    isError = true;
                    logger.error("Changing status to active user (changeStatus())" + err);
                }
                logger.info("user status change to active successfully  (changeStatus())");
                userDao.changeStatusToInActive(data,function (err, result) {
                    if (err) {
                        isError = true;
                        logger.error("Changing status to inactive user (changeStatus())" + err);
                    }
                    logger.info("user status change to inActive successfully  (changeStatus())");
                    
                    if(isError){
                        return cb(messages.errorChangeStatus);
                    }else{
                      return cb(null); 
                  }
              });
            });
        });
    });
};

module.exports = SchedulerService;

