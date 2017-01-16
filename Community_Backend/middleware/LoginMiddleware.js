"use strict";

var moduleName = __filename;
var config = require('config');
var localCache = require('service/cache').local;
var sharedCache = require('service/cache/').shared;
var response = require('controller/ResponseController.js');

var logger = require('helper/Logger.js')(moduleName);
var unique = require('helper').uniqueIdGenerator;
var constants = config.constants;
var messages = config.messages;
var middlewareUtils = require('helper').middlewareUtils;
var responseCodes = config.responseCodes;

var loginReqCleanup = function(reqId, cacheObject){
    
	logger.info("Login cache cleanup middleware called (loginReqCleanup())");
    
	var connection = cacheObject.connection;
    if(!!connection){
      logger.info(" Releasing Firm connection with threadId - " + connection.threadId);
      connection.release();
    }
//	if(!!cacheObject.common){
//		cacheObject.common.release();
//	}
	localCache.del(reqId);	
	logger.info("Login cache cleanup middleware completed (loginReqCleanup())");
}

module.exports.login = function(req, res, next){
    logger.info("Login middleware called (login())");
    var reqId = req.data.reqId;
    var cacheObject = localCache.get(reqId);
    logger.debug("cacheObject i got here is", reqId);
    
    res.on('finish', function (){
    	loginReqCleanup(reqId, cacheObject);
    });
    
    res.on('close', function (){
    	loginReqCleanup(reqId, cacheObject);
    });
    
    next();
    
//    middlewareUtils.associateDBCommonConnectionWithReq(req, res, function(err, connection){
//        if(err) {
//            logger.error("Error in login middleware (login())" + err);
//            return response(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR, null, res);
//        }
//    });
};

module.exports.logout = function(req, res, next){
    logger.info('Logout middleware function called (logout())');
    var token = req.data.token;
    if(token){
        sharedCache.get(token,function(err,result){
            if(err || !result){
                logger.error("Error in get token (logInAs())" + err);
            }else{
                var tokens = JSON.parse(result).logInAsToken ? JSON.parse(result).logInAsToken : [];
                tokens.push(token);
                sharedCache.del(tokens, function(err, reply){
                    if(err){
                        logger.error("Error in Logout middleware function (logout())"+ err);
                        var key = "{\""+constants.ERROR_MESSAGE_KEY+"\":\""+messages.internalServerError+"\"}";
                        return response(JSON.parse(key), responseCodes.INTERNAL_SERVER_ERROR, null, res);
                    }else{
                       logger.info('Deleted token on logout', reply);
                   }             
               }); 
            }
            
        });

    }
    next();
};