"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var UtilService = require("service/util/UtilService");
var baseConverter = require('converter/base/BaseConverter.js');
var NotificationRequest = require("model/notification/NotificationRequest.js");
var NotificationResponse = require("model/notification/NotificationResponse.js");

var messages = config.messages;
var httpResponseCode = config.responseCodes;
var logger = helper.logger(moduleName);

var utilService = new UtilService();

var NotificationConverter = function () { }

NotificationConverter.prototype.getRequestToModel = function(data){
	var notification = new NotificationRequest();
	baseConverter(notification, data);
	notification.id = data.id;
	notification.ids = data.ids;
	notification.readStatus = data.readStatus;
	return notification;
};

NotificationConverter.prototype.getModelToResponse = function (data, cb) {
	var notificationList = [];
	data.forEach(function (notification) {
		var notificationResponse = new NotificationResponse();	
		notificationResponse.id = notification.id;
		notificationResponse.subject = notification.subject;
		notificationResponse.body = notification.body;
		notificationResponse.readStatus = notification.readStatus;
		notificationResponse.notificationCategory.id = notification.notificationCategoryId;
		notificationResponse.notificationCategory.name = notification.notificationCategoryName;
		notificationResponse.notificationCategoryType.id = notification.notificationCategoryTypeId;
		notificationResponse.notificationCategoryType.name = notification.notificationCategoryTypeName;
		notificationResponse.notificationCategoryType.code = notification.notificationCategoryTypeCode;
		notificationResponse.isDeleted = notification.isDeleted;
		notificationResponse.createdOn = notification.createdOn;
		notificationResponse.createdBy = notification.createdBy;
		notificationResponse.editedOn = notification.editedOn;
		notificationResponse.editedBy = notification.editedBy;

		notificationList.push(notificationResponse);
	});
	return cb(null,notificationList);
};

module.exports = NotificationConverter;