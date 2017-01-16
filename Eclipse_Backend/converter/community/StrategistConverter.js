"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var util = require('util');
var StrategistResponse = require("model/community/strategist/StrategistResponse.js");
var ApprovedStrategistResponse = require("model/community/strategist/ApprovedStrategistResponse..js");
var StrategistDetails = require("model/community/strategist/StrategistDetails.js");

var messages = config.messages;
var logger = helper.logger(moduleName);

var StrategistConverter = function () { }

StrategistConverter.prototype.getResponseModelOfStrategistList = function (data, cb) {
    logger.debug("Converting data to StrategistListData in getResponseModelOfStrategistList()");
    var self = this;
    var approvedStrategistList = [];
    if (data) {
        data.forEach(function (strategist) {
            if (strategist.id) {
                var strategistResponse = new ApprovedStrategistResponse();
                strategistResponse.id = strategist.id;
                strategistResponse.name = strategist.name ? strategist.name : null;
                strategistResponse.isDeleted = strategist.isDeleted ? strategist.isDeleted : 0;
                strategistResponse.createdOn = strategist.createdDate ? strategist.createdDate : null;
                strategistResponse.createdBy = strategist.createdBy ? strategist.createdBy : null;
                strategistResponse.editedOn = strategist.editedDate ? strategist.editedDate : null;
                strategistResponse.editedBy = strategist.editedBy ? strategist.editedBy : null;
                approvedStrategistList.push(strategistResponse);
            }
        }, this);
    }
    return cb(null, approvedStrategistList);
};

StrategistConverter.prototype.getResponseModelOfStrategistDetails = function (data, cb) {
    logger.debug("Converting data to StrategistDetails in getResponseModelOfStrategistDetails()");
    var self = this;
    if (data) {
        data.forEach(function (strategist) {
            if (strategist.id) {
                var strategistDetails = new StrategistDetails();
                strategistDetails.id = strategist.id;
                strategistDetails.name = strategist.name ? strategist.name : null;
                strategistDetails.communityStrategistId = strategist.communityStrategistId ? strategist.communityStrategistId : null;
                strategistDetails.isDeleted = strategist.isDeleted ? strategist.isDeleted : 0;
                strategistDetails.createdOn = strategist.createdDate ? strategist.createdDate : "0000-00-00 00:00:00";
                strategistDetails.createdBy = strategist.createdBy ? strategist.createdBy : null;
                strategistDetails.editedOn = strategist.editedDate ? strategist.editedDate : "0000-00-00 00:00:00";
                strategistDetails.editedBy = strategist.editedBy ? strategist.editedBy : null;
                return cb(null, strategistDetails);
            }
        }, this);
    }
};

StrategistConverter.prototype.getCommunityModelDetailResponse = function (data, cb) {
    logger.debug("Converting data to Models list Data in getCommunityModelDetailResponse()");
    var self = this;
    var modelDetailList = [];
    if (data) {
        data.forEach(function (model) {      
                var modelDetail = {}
                modelDetail.id = model.id;
                modelDetail.communityModelId = model.communityModelId ? model.communityModelId:null;
                modelDetail.name = model.modelName ? model.modelName : null;
                modelDetail.communityStrategistId = model.strategistId ? model.strategistId : null;
                modelDetail.isDeleted = model.isDeleted ? model.isDeleted : 0;
                modelDetail.createdOn = model.createdDate ? model.createdDate : null;
                modelDetail.createdBy = model.createdBy ? model.createdBy : null;
                modelDetail.editedOn = model.editedDate ? model.editedDate : null;
                modelDetail.editedBy = model.editedBy ? model.editedBy : null;
                modelDetailList.push(modelDetail);
            
        }, this);
    }
    return cb(null, modelDetailList);
};

module.exports = StrategistConverter;
