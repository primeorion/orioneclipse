var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var UtilService = require("service/util/UtilService");
var baseConverter = require('converter/base/BaseConverter.js');
var ActivityRequest = require("model/notification/ActivityRequest.js");
var ActivityResponse = require("model/notification/ActivityResponse.js");

var messages = config.messages;
var httpResponseCode = config.responseCodes;
var logger = helper.logger(moduleName);

var utilService = new UtilService();

var ActivityConverter = function () { }

ActivityConverter.prototype.getRequestToModel = function(data){
	var activity = new ActivityRequest();
	baseConverter(activity, data);
	activity.id = data.id;
	activity.name = data.name;
	activity.description = data.description;
	activity.isCompleted = data.isCompleted;
	return activity;
};

ActivityConverter.prototype.getModelToResponse = function (data, cb) {
	var activityList = [];
	data.forEach(function (activity) {
		var activityResponse = new ActivityResponse();	
		activityResponse.id = activity.id;
		activityResponse.name = activity.name;
		activityResponse.description = activity.description;
		activityResponse.isCompleted = activity.isCompleted;
		activityResponse.isDeleted = activity.isDeleted;
		activityResponse.createdOn = activity.createdOn;
		activityResponse.createdBy = activity.createdBy;
		activityResponse.editedOn = activity.editedOn;
		activityResponse.editedBy = activity.editedBy;

		activityList.push(activityResponse);
	});
	return cb(null,activityList);
};


module.exports = ActivityConverter;
