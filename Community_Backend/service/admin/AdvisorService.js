"use strict";

var moduleName = __filename;


var config = require('config');
var logger = require('helper/Logger.js')(moduleName);
var localCache = require('service/cache').local;
var AdvisorDao = require('dao/admin/AdvisorDao.js');
var AdvisorConverter = require("converter/advisor/AdvisorConverter.js");

var messages = config.messages;
var responseCodes = config.responseCodes;

var advisorDao = new AdvisorDao();
var advisorConverter = new AdvisorConverter();

var AdvisorService =  function() {}

AdvisorService.prototype.getAdvisorList = function (data, cb) {
	logger.info("Get advisor list service called (getAdvisorList())");
	
    var session = localCache.get(data.reqId).session;

    data.modelLimitedAccess = session.advisorLimitedAccess;
    data.modelAllAccess = session.advisorAllAccess;
    
    advisorDao.getList(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting advisor list (getAdvisorList())" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        advisorConverter.getModelToResponse(fetched, function (err,result) {
            logger.info("Advisor list service returned successfully (getAdvisorList())");
            return cb(null, responseCodes.SUCCESS, result);
        });
    });
};

module.exports = AdvisorService;