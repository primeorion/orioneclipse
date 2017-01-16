"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var UtilService = require("service/util/UtilService");
var baseConverter = require('converter/base/BaseConverter.js');
var AdvisorResponse = require("model/advisor/AdvisorResponse.js");
var AdvisorRequest = require("model/advisor/AdvisorRequest.js");

var messages = config.messages;
var httpResponseCode = config.responseCodes;
var logger = helper.logger(moduleName);

var utilService = new UtilService();

var AdvisorConverter = function () { }

AdvisorConverter.prototype.getRequestToModel = function(data){
	var advisor = new AdvisorRequest();
	baseConverter(advisor, data);

	advisor.id = data.id;

	return advisor;
}

AdvisorConverter.prototype.getModelToResponse = function (data, cb) {
	var advisorResponse = {};
	var advisorList = [];
	data.forEach(function (advisor) {
		advisorResponse = new AdvisorResponse();
		advisorResponse.id = advisor.id;
		advisorResponse.name = advisor.name;
		advisorResponse.externalId = advisor.externalId;
		advisorResponse.isDeleted = advisor.isDeleted;
		advisorResponse.createdOn = advisor.createdOn;
		advisorResponse.createdBy = advisor.createdBy;
		advisorResponse.editedOn = advisor.editedOn;
		advisorResponse.editedBy = advisor.editedBy;
		advisorList.push(advisorResponse);
	});
	return cb(null,advisorList);
}

module.exports = AdvisorConverter;