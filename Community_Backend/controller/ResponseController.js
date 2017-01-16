"use strict";

var moduleName = __filename;

var config = require('config');

var logger = require('helper/Logger.js')(moduleName);
var dblogger = require('service/reqreslogger/DBLogger.js');

var responseToHttpResponseMapper = require('helper/ResponseToHttpResponseCodeMapper.js');

var constants = config.orionConstants;
var messages = config.messages;

var responseCode = config.responseCode;

module.exports = function (err, status, data, res) {
		//Commented: Request and Response Logger. Enable it for production
		dblogger.requestlogger(res, function(err){if(err){logger.error(err);}});
		dblogger.responselogger(res, data, function(err){if(err){logger.error(err);}});

        if(( status !== responseCode.SUCCESS) && !!err ){
        	var finalMessage = null;
            if( status === responseCode.INTERNAL_SERVER_ERROR ) {
            	if(!!err.message || !!err.Message){
					finalMessage = !!err.message ? err.message : err.Message;
            		data = JSON.parse("{\""+constants.ERROR_MESSAGE_KEY+"\":\""+ finalMessage + "\"}");
            	}else{
            		data = JSON.parse("{\""+constants.ERROR_MESSAGE_KEY+"\":\""+err+"\"}");
            	}
            }
            else {
            	if(!!err.Message){
            		finalMessage = !!err.Message ? err.Message : err;
            		data = JSON.parse('{ "' + constants.ERROR_MESSAGE_KEY + '":"' + finalMessage + '" }');
            	}else{
            		data = JSON.parse("{\""+constants.ERROR_MESSAGE_KEY+"\":\""+ err +"\"}");
            	}
            }
        }
		if(!!status){
        	res.status(responseToHttpResponseMapper(status));
		}

        res.json(data);
        return res.end();
};
