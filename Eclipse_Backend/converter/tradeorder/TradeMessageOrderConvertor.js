    "use strict";

var moduleName = __filename;

var config = require('config');
var helper = require('helper');
var logger = helper.logger(moduleName);
var TradeMessageOrderConvertor = function () { }

TradeMessageOrderConvertor.prototype.getResponseFromEntity = function (data, cb) {
    logger.debug("Converting data to tradeOrderMessageListData in getResponseFromEntity()");
    var self = this;
    var tradeOrderMessageList = [];
    if (data) {
        data.forEach(function (message) {
            var tradeOrderMessage = {};
            tradeOrderMessage.id = message.id;
            tradeOrderMessage.severity = message.severity;
            tradeOrderMessage.shortCode = message.shortCode;
            if(message.arguments){
                var args = message.arguments.split(';');
                 args.forEach(function (arg, index) {   
                    message.message = message.message.replace("{"+index+"}", arg);
                 });    
            }
            console.log(message);
            tradeOrderMessage.message = message.message;
            tradeOrderMessageList.push(tradeOrderMessage);
        });
    }
    return cb(null, tradeOrderMessageList);
};

module.exports = TradeMessageOrderConvertor;