"use strict";

var moduleName = __filename;
var config = require('config');
var sharedCache = require('service/cache').shared;
var responseController = require('controller/ResponseController.js');
var logger = require("helper/Logger.js")(moduleName);
var localCache = require('service/cache').local;
var util = require('util');
var _ = require('underscore');

var messages = config.messages;
var responseCodes = config.responseCodes;
var constants = config.orionConstants;

exports.hasPrivilege = function () {
    var isAuthorized = function (req, res, next) {
        logger.info("Has privilege called (hasPrivilege())");
        var token = localCache.get(req.data.reqId).session.token;
        sharedCache.get(token, function (err, data) {
            if (!!data) {
                var userLoggedIn;
                try {
                    userLoggedIn = JSON.parse(data);
                } catch (err) {
                    logger.error("Has privilege failed (hasPrivilege()) " + err);
                    return unauthorisedResponse(res, messages.unauthorized);
                }
                if(userLoggedIn.eclipseUserDetails){
                    logger.debug('Logged In user is eclipse user');
                    userLoggedIn = userLoggedIn.eclipseUserDetails;
                }
                var privilegeMap = userLoggedIn.privileges;
                logger.debug("user login privileges Map = " + JSON.stringify(privilegeMap));
                logger.debug("url to split = " + util.inspect(req.originalUrl));
                var privSize = privilegeMap ? Object.keys(privilegeMap).length : 0;
                if (privilegeMap && privSize > 0) {
                    var reqUrl = req.originalUrl;
                    if (reqUrl.includes("?")) {
                        reqUrl = reqUrl.split("?")[0];
                    }
                    var modules = reqUrl.split("/");
                    logger.debug('modules ......................' + modules);
                    var moduleToAccess = modules[2].toLowerCase();
                    if (moduleToAccess === constants.moduleCodeForPrivileges.COMMUNITY) {
                        //permission for community will be check here
                        moduleToAccess = '';
                        if (_.contains(modules, 'subscribe')) {
                            moduleToAccess = 'subscribe';
                        }else if(_.contains(modules, 'models') || _.contains(modules, 'model')){
                            moduleToAccess = 'models';
                        }else if(_.contains(modules, 'users') && _.contains(modules, 'strategists') && _.contains(modules,'count')){
                            moduleToAccess = 'communityuserscount';
                        } else if(_.contains(modules, 'users') || _.contains(modules, 'user')){
                            moduleToAccess = 'users';
                        }else if(_.contains(modules, 'rebalance')){
                            moduleToAccess = 'rebalance';
                        }else if(_.contains(modules, 'cashflow') || _.contains(modules, 'aum') || _.contains(modules, 'account')){
                            moduleToAccess = 'communitydashboard';
                        }else if(_.contains(modules, 'summary') && _.contains(modules, 'dashboard')){
                            moduleToAccess = 'dashboard';
                        }else {
                            moduleToAccess = modules[3].toLowerCase();
                        }

                        logger.debug("module to access is = " + moduleToAccess);
                        var reqMethod = req.method;
                        var permissionNeedFor = constants.methodParse[reqMethod];
                        logger.debug("Permission need for = " + permissionNeedFor);
                        if (moduleToAccess in privilegeMap) {
                            var privilege = privilegeMap[moduleToAccess];
                            if (privilege[permissionNeedFor]) {
                                logger.debug("Authorized User");
                                return next();
                            } else {
                                logger.info("Unauthorized response ");
                                return unauthorisedResponse(res, "User do not have " + permissionNeedFor + " permission for " + moduleToAccess);
                            }
                        }else{
                            logger.info('module not found');
                            return unauthorisedResponse(res, 'Module not found');
                        }
                    } else {
                        logger.info("Unauthorized response ");
                        return unauthorisedResponse(res, messages.userDoNotHavePermission);
                    }
                } else {
                    logger.info("Unauthorized response ");
                    return unauthorisedResponse(res, messages.userDoNotHavePermission);
                }
            } else {
                logger.info("Unauthorized response ");
                return unauthorisedResponse(res, messages.userDoNotHavePermission);
            }
        });

    };

    isAuthorized.unless = require("express-unless");
    return isAuthorized;
};

function unauthorisedResponse(res, msg) {
    var key = "{\"" + constants.ERROR_MESSAGE_KEY + "\":\"" + msg + "\"}";
    responseController(null, responseCodes.FORBIDDEN, JSON.parse(key), res);
}