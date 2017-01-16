"use strict";

var moduleName = __filename;
var config = require('config');
var localCache = require('service/cache').local;
var sharedCache = require('service/cache/').shared;
var response = require('controller/ResponseController.js');
var _ = require('underscore');
var UserService = require('service/admin/UserService.js');
var userService = new UserService();
var asyncLoop = require('node-async-loop');

var logger = require('helper/Logger.js')(moduleName);
var constants = config.constants;
var messages = config.messages;
var responseCodes = config.responseCodes;

var defaultKeys = ['orionConnectExternalId', 'roleId', 'loginUserId'];
module.exports.authorizedUser = function(req, res, next){
    var data = req.data;
    var errorLog = [];
    var len = data.users.length;
    if(data.users && data.users.length > 0){
            asyncLoop(data.users, function (user, next)
            {
                var userKeys = _.keys(user);
                var validatedKeys =  _.difference(defaultKeys, userKeys);
                if(validatedKeys.length == 0){
                data.loginUserId = user.loginUserId;
                userService.searchUserFromConnect(data, function(err, status, connectUser){
                    if (err)
                    {
                        
                        next(err, status);
                    } else {
                    if( connectUser && connectUser.length > 0) {
                       var flag = 0;
                      // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"+ JSON.stringify(connectUser));
                       var k = _.filter(connectUser, function(item){ return (item.userId == user.orionConnectExternalId && user.loginUserId == item.loginUserId) });
                       if( k.length == 0) {
                        next(('User with loginUserId ' + data.loginUserId + ' not found'), responseCodes.NOT_FOUND);                           
                       } else {
                           user.name = k[0].name;
                       next();
                       }
                    } else {
                        next(('User with loginUserId ' + data.loginUserId + ' not found'), responseCodes.NOT_FOUND);
                    }
                }
                  });
                } else {
                     next(messages.badRequest, responseCodes.BAD_REQUEST);
                }
             }, function (err){
                if (err)
                {
                    console.error('Error: ' + JSON.stringify(err));
                    return response(err, responseCodes.UNPROCESSABLE, null, res);
                } else {
                next();
                }
             });
    }else{
       next();
    }
}