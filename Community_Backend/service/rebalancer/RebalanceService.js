"use strict";

var moduleName = __filename;

var config = require('config');
var eclipseProperties = config.env.prop.orion["eclipse"];
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var localCache = require('service/cache').local;
var constants = config.orionConstants;
var asyncFor = helper.asyncFor;
var messages = config.messages;
var codes = config.responseCode;
var request = require("request");
var asyncLoop = require('node-async-loop');
var httpResponseCodes = config.responseCodes;
var responseCodes = config.responseCode;

var ModelDao = require('dao/community/ModelDao.js');
var modelDao = new ModelDao();
var StrategistDao = require('dao/community/StrategistDao.js');
var strategistDao = new StrategistDao();

var RebalanceService = function () {};

RebalanceService.prototype.rebalanceModel = function (data, cb) {
	logger.info("Rebalance model service called (rebalanceModel())");
	var self = this;
	//check whether the model is subscribed or not
	modelDao.getModelDetail(data, function (err, modelDetails) {
		if (err) {
			return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
		}
		logger.debug('****************************' + JSON.stringify(modelDetails));
		if (modelDetails && modelDetails.length > 0) {
			var modelData = {
				communityStrategistId: 0
			};
			modelData.communityStrategistId = modelDetails[0].strategistId;
			strategistDao.getStrategistFirm(data, modelData, function (err, strategistFirmDetails) {
				if (err) {
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				}
				var onlySubscribedFirm = strategistFirmDetails.filter(function (item) {
					return item.isSubscribed == 1
				});
				if (onlySubscribedFirm.length > 0) {
					self.rebalanceModelRequest(data, onlySubscribedFirm, function (err, status, result) {
						if (err) {
							return cb(err, status);
						}
						return (null, result);
					});
				} else {
					return cb(messages.modelNotSubscribed, responseCodes.UNPROCESSABLE);
				}
			});
		} else {
			return cb(messages.modelNotFound, responseCodes.NOT_FOUND);
		}
	});
};

RebalanceService.prototype.rebalanceModelRequest = function (data, firmIds, cb) {
	var self = this;
	var requestData = {
		type: "model",
		ids: [data.modelId],
		firmId: 0
	};
	asyncLoop(firmIds, function (obj) {
		requestData.firmId = obj.firmId;
		var url = {
			url: 'http://' + eclipseProperties.host + ':' + eclipseProperties.port + '/v1/rebalancer/rebalance',
			headers: {
				'Authorization': 'master',
				'Content-Type': 'application/json'
			},
			json: true,
			body: requestData
		};
		request.post(url, function (err, response, body) {
			if (err) {
				return cb(err);
			}
			if (response.statusCode != 200 || response.statusCode != 202) {
				return cb(body.message, response.statusCode, body.error);
			}
		});
	}, function (err) {
		if (err) {
			console.error('Error: ' + JSON.stringify(err));
			return cb(err, responseCodes.UNPROCESSABLE);
		} else {
			return cb(null, responseCodes.SUCCESS, messages.rebalanceSuccessful);
		}
	});
}


module.exports = RebalanceService;