"use strict";

var moduleName = __filename;
var socketioJwt = require('socketio-jwt');
var secretKey = require('config').env.sessionsecret;
var sharedCache = require('service/cache').shared;
var logger = require('helper/Logger.js')(moduleName);

module.exports = function(io){

    io.use(socketioJwt.authorize({
        secret: secretKey,
        handshake: true
    })).use(function(data, accept){
        var token = data.request._query.token;
        if(!!token){
            sharedCache.get(token, function(err, userSession){
                var privileges = null;
                try{
                    privileges = JSON.parse(userSession).privileges;
                }catch(err){
                    logger.error(moduleName, err);
                    privileges = {};
                }
                var roomsToJoin = [];
                for(var i in privileges){
                	if (privileges.hasOwnProperty(i)) {
	                    if(!!privileges[i].code.toLowerCase()){
	                        roomsToJoin.push(privileges[i].code.toLowerCase());
	                    }
                	}
                }
                data["roomsToJoin"] = roomsToJoin;
                accept(null, false);
            });
        }
    });
};