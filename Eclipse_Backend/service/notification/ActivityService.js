"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var sharedCache = require('service/cache').shared;
var ActivityDao = require('dao/notification/ActivityDao.js');
var ActivityConverter = require("converter/notification/ActivityConverter.js");
var UtilService = require('service/util/UtilService.js');
var UserDao = require('dao/admin/UserDao.js');
var eventGenerator = require("helper/EventGenerator.js");

var enums = config.applicationEnum;
var constant = config.orionConstants;
var messages = config.messages;
var responseCode = config.responseCode;
var logger = helper.logger(moduleName);

var activityConverter = new ActivityConverter();
var activityDao = new ActivityDao();
var utilService = new UtilService();
var userDao = new UserDao();

var ActivityService = function () { };

ActivityService.prototype.getActivityList = function (data, cb) {
	logger.info("Get activity list service called (getActivityList())");
	
	activityDao.getList(data, function (err, fetched) {
		if (err) {
			logger.error("Getting activity list (getActivityList())" + err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.info("Preparing activity list for UI (getActivityList())");
		activityConverter.getModelToResponse(fetched, function (err,result) {
			logger.info("Activity list returned successfully (getActivityList())");
			return cb(null, responseCode.SUCCESS, result);
		});
	});
};

ActivityService.prototype.getActivityDetail = function (data, cb) {
	logger.info("Get activity detail service called (getActivityDetail())");
	
	activityDao.getDetail(data, function (err, fetched) {
		if (err) {
			logger.error("Getting activity detail (getActivityDetail())" + err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.info("Preparing activity detail for UI (getActivityDetail())");
		activityConverter.getModelToResponse(fetched, function (err,result) {
			logger.info("Activity detail returned successfully (getActivityDetail())");
			if(result && result.length >0){
				return cb(null, responseCode.SUCCESS, result[0]);
			}else{
				return cb(messages.activityNotFound, responseCode.NOT_FOUND);
			}
		});
	});
};

ActivityService.prototype.getActivityById = function (data, cb) {
	logger.info("Get activity by id service called (getActivityById())");
	
	activityDao.getActivityById(data, function (err, result) {
		if (err) {
			logger.error("Getting activity by id (getActivityById())" + err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		if(result && result.length >0){
			return cb(null, responseCode.SUCCESS, result[0]);
		}else{
			return cb(messages.activityNotFound, responseCode.NOT_FOUND);
		}
	});
};

ActivityService.prototype.createActivity = function (data, cb) {
	logger.info("Create activity service called (createActivity())");
	var self = this;
	activityDao.createActivity(data, function (err, output) {
		if (err) {
			logger.error("Error in create activity (createActivity())" + err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.info("Preparing activity detail for UI (createActivity())");
		data.id = output.insertId;
		data.userIds = [];
		data.userIds.push(data.user.userId);
		self.assignUserToActivity(data, function(err, status, result){
			if(err){
				logger.error("Error in assign user to activity (createActivity())")
				return cb(err,status);
			}
			self.getActivityDetail(data, function(err, status, result){
				if(err){
					logger.error("Error getting activity detail (createActivity())"+err);
					return cb(err,status);
				}
				return cb(null, status, result);
			});
		});
	});
};

ActivityService.prototype.updateActivity = function (data, cb){
	logger.info("Update activity service called (updateActivity())");
	var self = this;
	self.getActivityById(data, function(err, status, result){
		if(err){
			logger.debug("Error in get detail activity (updateActivity())"+err);
			return cb(err, status);
		}
		activityDao.updateActivity(data, function(err, result){
			if(err){
				logger.debug("Error in gupdate activity (updateActivity())"+err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			self.getActivityDetail(data, function(err,status, finalResult){
				if(err){
					logger.debug("Error in get detail activity (updateActivity())"+err);
					return cb(err, status);
				}
				if(finalResult.isCompleted === 1){
					logger.debug("the final result i have is"+JSON.stringify(finalResult));
					var emitData = finalResult;
					var tempUsers = [];
					tempUsers.push(emitData.createdBy);
					return cb(null, status, finalResult);
					emitData.userIds = tempUsers;
					emitData.user = data.user;
					eventGenerator.notification('realTimeActivityNotification', emitData);
				}else{
					return cb(null, status, finalResult);
				}
			});
		});
	});
}

ActivityService.prototype.assignUserToActivity = function (data, cb) {
	logger.info("assign activity to user service called (assignUserToActivity())");
	var self = this;
	self.validUsers(data,function(isValid,userIds){
        if(isValid){
        	self.getActivityById(data, function(err, status, result){
        		if(err){
        			logger.debug("Error in get detail activity (assignUserToActivity())"+err);
        			return cb(err, status);
        		}
        		activityDao.assignUserToActivity(data, function (err, output) {
					if (err) {
						logger.error("Error in assign user to activity (assignUserToActivity())" + err);
						return cb(err, responseCode.INTERNAL_SERVER_ERROR);
					}
					eventGenerator.notification('realTimeActivityNotification', data);
					logger.info("User assigned successfully to activity (assignUserToActivity())");
					return cb(null, responseCode.SUCCESS,  { "message": messages.userAssignedToActivity});
				});
        	});
        }else{
            logger.info("User not Found (assignUserToActivity())");
            return cb(messages.userNotFound+" with Ids = "+userIds, responseCode.NOT_FOUND);
        }
    });
};

ActivityService.prototype.getAssignedUserToActivity = function(data, cb){
	logger.info("Get assigned users to activity service called (getAssignedUserToActivity())");
	var self = this;
	self.getActivityById(data, function(err, status, result){
		if(err){
			logger.debug("Error in get detail activity (getAssignedUserToActivity())"+err);
			return cb(err, status);
		}
		activityDao.getAssignedUserToActivity(data, function(err, output){
			if (err) {
				logger.error("Error in get assigned user to activity (getAssignedUserToActivity())" + err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			}
			return cb(null, responseCode.SUCCESS, output);
		});
	});
};

ActivityService.prototype.validUsers = function(data,cb){
    var isValid = true;
    logger.debug("the data we got to validate is"+JSON.stringify(data));
    var userIds = data.userIds;
    var usersNotFound = [];
    var counter = 0;
    var tempData  = {};
    tempData.user = data.user;
    tempData.reqId = data.reqId;
    if(userIds && userIds.length > 0 ){
        userIds.forEach(function(id){
         tempData.id = id
         userDao.get(tempData,function(err,fetched){
           counter++;
           if(err){
            logger.error("Fetching user (validUsers())" + err);
        }
        if(fetched && fetched.length > 0){

        }else{
            isValid = false;
            logger.info("User not Found (validUsers())" + id);
            usersNotFound.push(id)
        }
        if(counter === userIds.length){
            return cb(isValid,usersNotFound);
        }
    });

     });
    }else{
        return cb(isValid,usersNotFound);
    }
};
module.exports = ActivityService;