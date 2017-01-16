"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var rebalanceUrl = config.env.prop.rebalanceUrl;
var messages = config.messages;
var request = require("request");
var responseCodes = config.responseCodes;
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var util = require('util');
var CashNeedTradeDao = function() {
}



module.exports = CashNeedTradeDao;