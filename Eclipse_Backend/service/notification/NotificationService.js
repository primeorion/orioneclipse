"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var sharedCache = require('service/cache').shared;
var NotificationDao = require('dao/notification/NotificationDao.js');
var NotificationConverter = require("converter/notification/NotificationConverter.js");
var eventGenerator = require("helper/EventGenerator.js");
var ses = require('helper/AwsSESClient.js');


var enums = config.applicationEnum;
var constant = config.orionConstants;
var messages = config.messages;
var responseCode = config.responseCode;
var logger = helper.logger(moduleName);

var notificationConverter = new NotificationConverter();
var notificationDao = new NotificationDao();

var NotificationService = function () { };

NotificationService.prototype.getNotificationList = function (data, cb) {
	logger.info("Get notification list service called (getNotificationList())");
	
	notificationDao.getList(data, function (err, fetched) {
		if (err) {
			logger.error("Getting notification list (getNotificationList())" + err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.info("Preparing notification list for UI (getNotificationList())");
		notificationConverter.getModelToResponse(fetched, function (err,result) {
			logger.info("Notification list returned successfully (getNotificationList())");
			return cb(null, responseCode.SUCCESS, result);
		});
	});
};

NotificationService.prototype.createNotification = function (data, cb) {
	logger.info("Create Notification service called (createNotification())");

	notificationDao.createNotification(data, function (err, result) {
		if (err) {
			logger.error("Creating notification (createNotification())" + err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.info("Notification Created Successfully (createNotification())");
		return cb(null, responseCode.SUCCESS, result);
	});
}

NotificationService.prototype.getNotificationCategoryTypeList = function (data, cb) {
	logger.info("Get notification category type list service called (getNotificationCategoryTypeList())");
	var self = this;
	notificationDao.getNotificationCategoryTypeList(data, function (err, result) {
		if (err) {
			logger.error("Getting notification category type list (getNotificationCategoryTypeList())" + err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.info("Get Notification Category type list Successfully (getNotificationCategoryTypeList())");
		
		return cb(null, responseCode.SUCCESS, result);
	});
}

NotificationService.prototype.prepareNotificationCategoryTypeMap = function(notificationCategoryTypes){
	var notificationCategoryTypeMap = {};
	notificationCategoryTypes.forEach(function(notificationCategoryType){
		notificationCategoryTypeMap[notificationCategoryType.code] = notificationCategoryType.id;
	});
	logger.debug("Notification Category Map returning is"+JSON.stringify(notificationCategoryTypeMap));
	return notificationCategoryTypeMap;
}

NotificationService.prototype.storeNotificationCategoryTypeInCache = function(data, cb){
	var self = this;
	self.getNotificationCategoryTypeList(data,function(err,code,notificationList){
		if (err) {
			logger.error("Error in getting notification category type "+ err);
			return cb(err, code);
		}
		var notificationMap = self.prepareNotificationCategoryTypeMap(notificationList);
		sharedCache.put(enums.notificationCategoryCode, JSON.stringify(notificationMap), function (err, data) {
			if (err) {
				logger.error("Error in putting notification category code in cache "+err);
				return cb(err, responseCode.INTERNAL_SERVER_ERROR);
			} 
			return cb(null, responseCode.SUCCESS, notificationMap);
		});
	});
}

NotificationService.prototype.getNotificationCategoryTypeFromCache = function(data, cb){
	var self = this;
	sharedCache.get(enums.notificationCategoryCode,  function(err, result){
	    if(err){
	        logger.error("Error in get notificationCategoryCode (getNotificationCategoryTypeInCache())" + err);
	        return cb(err,responseCode.INTERNAL_SERVER_ERROR);
	    }
	    if(result && result.length>0){
	        var notificationMap = JSON.parse(result);
	        return cb(null, responseCode.SUCCESS, notificationMap);
	    }
	    self.storeNotificationCategoryTypeInCache(data, function(err,status, result){
	    	if(err){
	    		logger.error("Error in store notificationCategoryCodeInCache (getNotificationCategoryTypeInCache())" + err);
	        	return cb(err,responseCode.INTERNAL_SERVER_ERROR);
	    	}
	    	return cb(null, responseCode.SUCCESS, result);
	    });
	});
}
NotificationService.prototype.deleteNotificationCategoryTypeFromCache = function(data, cb){
	logger.info("Delete Notification Category Type From Cache service called (deleteNotificationCategoryTypeFromCache())");
	sharedCache.del(enums.notificationCategoryCode,  function(err, result){
		if(err){
	        logger.error("Error in delete notificationCategoryType from cache (deleteNotificationCategoryTypeFromCache())" + err);
	        return cb(err,responseCode.INTERNAL_SERVER_ERROR);
	    }
	    logger.debug("Notification category type from cache deleted successfully (deleteNotificationCategoryTypeFromCache())");
	    return cb(null,responseCode.SUCCESS,{ "message": messages.notificationCategoryTypeDeleted});
	});
}

NotificationService.prototype.createAndSendNotification = function(data,cb) {
	var self = this;
	var notificationCategoryType = data.code;
	var firmId = data.user.firmId;
	self.getNotificationCategoryTypeFromCache(data, function(err, status, notificationMap){
		if(err){
			logger.error("Get notification category type from cache (createAndSendNotification())" +err);
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		logger.debug("the data we got is"+JSON.stringify(notificationMap));
        var notificationCategoryTypeId = notificationMap[notificationCategoryType];
        if(notificationCategoryTypeId){
        	data.notificationCategoryTypeId = notificationCategoryTypeId;
        }
        var notificationTopics = [];
        var notificationTopic = {};
        notificationTopic.id = notificationCategoryTypeId;
        notificationTopic.isEnable = 1;
        notificationTopic.isEmail = null;
        notificationTopics.push(notificationTopic);
        var subscribeData ={};
        subscribeData.user = data.user;
        subscribeData.reqId = data.reqId;
        subscribeData.notificationTopics = notificationTopics;
        self.addLoggedInUserNotificationSubscription(subscribeData, function(err, status, result){
        	if(err){
        		logger.error("Error subscribing notification category type id");
        		return cb(err, status);
        	}
	        self.createNotification(data, function(err, status, result){
	        	if(err){
	        		logger.error("Error saving notification in db");
	        		return cb(err, status);
	        	}
	        	logger.info("Notification saved in database successfully");
	        	data.id = result.insertId;
	        	self.getNotificationList(data,function(err,status,result){
	        		if(err){
	        			return cb(err, status);
	        		}
	        		self.sendEmailNotification(data, result[0],function(err, status,emailResult){
	        			var emitData = {
		        			typeId:1,
		        			code:notificationCategoryType,
		        			userNotification:result[0],
		        			progressNotification:null,
		        			menuNotification:null
		        		}
		        		var emitDataWrapper = {
		        			emitData: emitData,
		        			firmId:data.user.firmId,
		        			userId:data.user.userId
		        		}
	        		eventGenerator.notification('realTimeNotification', emitDataWrapper);
		        	return cb(null,responseCode.SUCCESS,result[0]);
	        		});
	        	});
	        });
	    });
	});	        
}
NotificationService.prototype.sendEmailNotification = function(data, emailData, cb){
	var self = this;
	var notificationEmailData = {};
	notificationEmailData.user = data.user;
	notificationEmailData.reqId = data.reqId;
	notificationEmailData.id = emailData.notificationCategoryType.id;
	self.getUserEmailsForSubscribedNotificationCategoryType(notificationEmailData, function(err, status, result){
		if(err){
			logger.error("Error get logged in user subscriptions");
			return cb(err, status);
		}
		if(result && result.length>0){
			var mailData = {};
			var emailArgs = {};
			emailArgs.subject = emailData.subject;
			emailArgs.body = emailData.body;
			mailData.emailArgs = emailArgs;
			mailData.toList = result;
			mailData.emailTemplate = constant.EMAIL_TEMPLATE_PATH.NOTIFICATION_EMAIL;
			ses(mailData);
		}
		return cb(null, status, result);
	});
}
NotificationService.prototype.getUserEmailsForSubscribedNotificationCategoryType = function(data, cb){
	logger.info("The getEmail for Notification category type service called (getUserEmailsForSubscribedNotificationCategoryType())");
	notificationDao.getUserEmailsForSubscribedNotificationCategoryType(data, function(err, result){
		if(err){
			logger.error("Error get email for notification category type");
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		var emails = [];
		if(result && result.length>0){
			result.forEach(function(email){
				emails.push(email.notificationEmail);
			});
		}
		return cb(null, responseCode.SUCCESS, emails);
	});
}
NotificationService.prototype.sendNotification = function(data, cb){
	var notificationCategoryType = data.notificationCategoryType;
	var emitData = {
		typeId:null,
		code:data.code,
		userNotification:null,
		progressNotification:null,
		menuNotification:null
	}
	console.log("meu notification is"+data.menuNotification);
	if(data.menuNotification){
		emitData.typeId = 3;
		emitData.menuNotification = data.menuNotification;
	}else if(data.processNotification){
		emitData.typeId = 2;
		emitData.progressNotification = data.processNotification;
	}
	var emitDataWrapper = {
		emitData: emitData,
		firmId:data.user.firmId,
		userId:data.user.userId
	}
	eventGenerator.notification('realTimeNotification', emitDataWrapper);
	return cb(null,responseCode.SUCCESS,true);
}

NotificationService.prototype.readNotification = function(data, cb){
	logger.info("Read notification service called (readNotification())"+JSON.stringify(data));
	var self = this;
	self.validNotificationIds(data, function(valid, invalidIds){
		if(valid){
			notificationDao.readNotification(data, function(err,result){
				if(err){
					logger.error("Error in read notification (readNotification())"+err)
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}
				return cb(null, responseCode.SUCCESS, { "message": messages.readNotificationSuccess});
			});
		}else{
			logger.debug("Invalid notification input (readNotification())"+invalidIds);
			return cb(messages.invalidNotificationForUser +" with ids = "+invalidIds,responseCode.UNPROCESSABLE);
		}
	});
}
NotificationService.prototype.validNotificationIds = function(data,cb){
	var self = this;
	var notificationIds = data.ids;
	var noOfNotifications = notificationIds.length;
	var counter = 0;
	var invalidIds = [];
	if(notificationIds && notificationIds.length > 0){
		notificationIds.forEach(function(notificationId){
			data.id = notificationId;
			self.getUserNotificationFromId(data, function(err, status, result){
				counter++;
				if(err){
					logger.error("Error in get user notification from id (validNotificationIds())"+err);
					return cb(false,invalidIds);
				}
				if(result && result.length>0){
				}else{
					logger.debug("Not a valid notification for User (validNotificationIds())"+notificationId);
					invalidIds.push(notificationId);
				}
				if(noOfNotifications === counter){
					if(invalidIds && invalidIds.length > 0){
						return cb(false,invalidIds);
					}else{
						return cb(true,invalidIds);
					}
				}
			});
		});
	}else{
		return cb(false,invalidIds);
	}
}
NotificationService.prototype.deleteUserNotification = function(data, cb){
	logger.info("Delete user notification service called (deleteNotification())");
	var self = this;
	self.getUserNotificationFromId(data, function(err, status, result){
		if(err){
			logger.error("Error in get user notification from id (deleteUserNotification())"+err);
			return cb(err,responseCode.INTERNAL_SERVER_ERROR);
		}
		if(result && result.length>0){
			notificationDao.deleteUserNotification(data, function(err, result){
				if(err){
					logger.debug("Error in delete user notification (deleteNotification())"+err);
					return cb(err,messages.INTERNAL_SERVER_ERROR);
				}
				return cb(null, responseCode.SUCCESS, { "message": messages.userNotificationDeleted});
			});
		}
		else{
			logger.debug("Not a valid notification for User (deleteUserNotification())");
			return cb(messages.notficationNotFoundOrAlreadyDeleted, responseCode.NOT_FOUND);
		}
	});
}

NotificationService.prototype.getUserNotificationFromId = function(data, cb){
	logger.info("Get user notification service called (getUserNotification())");
	notificationDao.getList(data, function(err, result){
		if(err){
			logger.error("Error in get user notification (getUserNotification())"+err)
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		return cb(null, responseCode.SUCCESS, result);
	});
}

NotificationService.prototype.getLoggedInUserNotificationSubscriptions = function(data, cb){
	logger.info("Get logged in user notification subscriptions called (getLoggedInUserNotificationSubscriptions())");
	notificationDao.getLoggedInUserNotificationSubscriptions(data, function(err, result){
		if(err){
			logger.error("Error in get user notification subscriptions(getLoggedInUserNotificationSubscriptions())"+err)
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		return cb(null, responseCode.SUCCESS, result);
	});
}

NotificationService.prototype.addLoggedInUserNotificationSubscription = function(data, cb){
	logger.info("Add subscriptions for logged in user (addLoggedInUserNotificationSubscription())");
	notificationDao.addLoggedInUserNotificationSubscription(data, function(err, result){
		if(err){
			logger.error("Error in add user notification subscriptions(addLoggedInUserNotificationSubscription())"+err)
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		if(data.email){
			notificationDao.addUserEmailForNotification(data, function(err, result){
				if(err){
					logger.error("Error adding email for user notification"+err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}
				return cb(null, responseCode.SUCCESS, { "message": messages.notificationCategorySubscribed });
			})
		}else{
			return cb(null, responseCode.SUCCESS, { "message": messages.notificationCategorySubscribed });
		}
	});
}

NotificationService.prototype.deleteLoggedInUserNotificationSubscription = function(data, cb){
	logger.info("Delete subscriptions for logged in user (deleteLoggedInUserNotificationSubscription())");
	var self = this;
	notificationDao.deleteLoggedInUserNotificationSubscription(data, function(err, result){
		if(err){
			logger.error("Error in delete user notification subscriptions(deleteLoggedInUserNotificationSubscription())"+err)
			return cb(err, responseCode.INTERNAL_SERVER_ERROR);
		}
		return cb(null, responseCode.SUCCESS, { "message": messages.notificationCategoryUnsubscribed });
	});
}

module.exports = NotificationService;