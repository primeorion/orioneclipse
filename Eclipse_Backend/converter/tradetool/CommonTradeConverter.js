"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require('helper');
var util = require('util');
var UtilService = require("service/util/UtilService");
var logger = helper.logger(moduleName);

var applicationEnum = config.applicationEnum;

var tradeSideCodeId = applicationEnum.tradeSideCodeId;
var tradeSideCode = applicationEnum.tradeSideCode;
var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var utilService = new UtilService();

var CommonTradeConverter = function () { }

CommonTradeConverter.prototype.getTradeSideResponse = function (data, cb) {
    logger.info("Trade side response List data (getTradeSideResponse())");
    var tradeSideResponse = [];
    if (data) {
        if (tradeSideCode.BUY) {
            var tradeSideBuy = {};
            tradeSideBuy.id = tradeSideCodeId.BUY ? tradeSideCodeId.BUY : null;
            tradeSideBuy.name = tradeSideCode.BUY ? tradeSideCode.BUY : null;
            tradeSideResponse.push(tradeSideBuy);
        }
        if (tradeSideCode.SELL) {
            var tradeSideSell = {};
            tradeSideSell.id = tradeSideCodeId.SELL ? tradeSideCodeId.SELL : null;
            tradeSideSell.name = tradeSideCode.SELL ? tradeSideCode.SELL : null;
            tradeSideResponse.push(tradeSideSell);
        }
    }
    return cb(null, tradeSideResponse);
};

CommonTradeConverter.prototype.getModelTypeForTradesResponse = function (data, cb) {
    logger.info(" Get Model Type For Trades  List data (getModelLevelTypeResponse())");
    var modelLevelResponse = [];
    if (data) {
        data.forEach(function (level) {
            var modelLevel = {};
            if (level.relatedType === 'CATEGORY') {
                modelLevel.id = relatedTypeCodeToId.CATEGORY ? relatedTypeCodeToId.CATEGORY : null;
                modelLevel.name = relatedTypeCodeToDisplayName.CATEGORY ? relatedTypeCodeToDisplayName.CATEGORY : null;
            }
            if (level.relatedType === 'CLASS') {
                modelLevel.id = relatedTypeCodeToId.CLASS ? relatedTypeCodeToId.CLASS : null;
                modelLevel.name = relatedTypeCodeToDisplayName.CLASS ? relatedTypeCodeToDisplayName.CLASS : null;
            }
            if (level.relatedType === 'SUBCLASS') {
                modelLevel.id = relatedTypeCodeToId.SUBCLASS ? relatedTypeCodeToId.SUBCLASS : null;
                modelLevel.name = relatedTypeCodeToDisplayName.SUBCLASS ? relatedTypeCodeToDisplayName.SUBCLASS : null;
            }
            modelLevelResponse.push(modelLevel);
        }, this);
    }
    return cb(null, modelLevelResponse);
};
module.exports = CommonTradeConverter;
