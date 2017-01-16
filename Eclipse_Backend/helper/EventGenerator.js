"use strict";

var moduleName = __filename;

var events = require('events');
var eventEmitter = require('controller/socket/SocketController.js').eventEmitter;

var helper = require('helper');
var config = require('config');


var enums = config.applicationEnum;
var constant = config.orionConstants;
var messages = config.messages;
var responseCode = config.responseCode;
var logger = helper.logger(moduleName);

module.exports.notification = function(type, data){
	eventEmitter.emit(type, data);
}
