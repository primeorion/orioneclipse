"use strict";

var moduleName = __filename;
var socketioJwt = require('socketio-jwt');
var secretKey = require('config').env.sessionsecret;
var sharedCache = require('service/cache').shared;
var logger = require('helper/Logger.js')(moduleName);
var NotificationService = require('service/notification/NotificationService.js');
var notificationService = new NotificationService();

module.exports = function(io){

    io.use(socketioJwt.authorize({
        secret: secretKey,
        handshake: true
    })).use(function(data, accept){
        var token = data.request._query.token;
        if(!!token){
           sharedCache.get(token, function(err, userSession){
                //var userSession = null;
                try{
                    userSession = JSON.parse(userSession);
                }catch(err){
                    logger.error(moduleName, err);
                    userSession = {};
                }
                var topicsToJoin = [];
                topicsToJoin.push(userSession.firmId);
                data["topicsToJoin"] = topicsToJoin;
                data.firmId = userSession.firmId;
                accept(null, false);
            });
        }
    });
};