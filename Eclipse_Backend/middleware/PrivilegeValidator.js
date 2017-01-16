"use strict";

var moduleName = __filename;
var config = require('config');
var sharedCache = require('service/cache').shared;
var responseController = require('controller/ResponseController.js');
var logger = require("helper/Logger.js")(moduleName);
var enums = require('config/constants/ApplicationEnum.js');
var messages = config.messages;
var responseCodes = config.responseCodes;
var constants = config.orionConstants;
var modelActionStatus = enums.modelActionStatus;

exports.hasPrivilege = function () {
    var isAuthorized = function (req, res, next) {
        logger.info("Has privilege called (hasPrivilege())");
        /*if(req.data.user.userId == 66){
            logger.debug("The primetgi user bypass the privilege validator");
            return next();
        }else{*/
            var hasPrivilege = false;
            var token = req.data.token;
            var isTokenFound = true;
            sharedCache.get(token, function (err, data) {
                if (!!data) {
                    var userLoggedIn;
                    try {
                        userLoggedIn = JSON.parse(data);
                    } catch(err){
                        logger.error("Has privilege failed (hasPrivilege()) " + err);
                        return unauthorisedResponse(res, messages.unauthorized);    
                    }
                    var privilegeMap = userLoggedIn.privileges;
                    var tempReqType = null; 
                    logger.debug("user login privileges Map = "+JSON.stringify(privilegeMap));
                    logger.debug("url to split = "+req.url);
                    var privSize = Object.keys(privilegeMap).length;
                    if (privilegeMap && privSize > 0) {
                        var reqUrl =  req.url;
                        if(reqUrl.includes("?")){
                            reqUrl = reqUrl.split("?")[0];
                        }
                        var modules = reqUrl.split("/");
                        var moduleToAccess = modules[2].toLowerCase();
                        if(moduleToAccess === constants.moduleCodeForPrivileges.COMMUNITY){
                            //permission for community will be check here for now just ignore it
                            return next();
                        }else{
                            if(moduleToAccess === constants.moduleCodeForPrivileges.PREFERENCE){
                                moduleToAccess = modules[3].toLowerCase();
                                if(moduleToAccess === constants.moduleCodeForPrivileges.UPDATEALL 
                                    || moduleToAccess === constants.moduleCodeForPrivileges.ACTION){
                                    if(req.data.level){
                                        var level = req.data.level;
                                        moduleToAccess = level.toLowerCase() + constants.moduleCodeForPrivileges.PREF;
                                    }else{
                                        return next();
                                    }
                                }else{
                                    moduleToAccess  = moduleToAccess + constants.moduleCodeForPrivileges.PREF;
                                    
                                }
                            }else if(moduleToAccess === constants.moduleCodeForPrivileges.SECURITY){
                                moduleToAccess = constants.moduleCodeForPrivileges.SECURITIES;
                            }else if(moduleToAccess === constants.moduleCodeForPrivileges.ADMIN 
                                || moduleToAccess === constants.moduleCodeForPrivileges.PORTFOLIO 
                                || moduleToAccess === constants.moduleCodeForPrivileges.ACCOUNT){
                                moduleToAccess = modules[3].toLowerCase();
                            }else if(moduleToAccess === constants.moduleCodeForPrivileges.DATAIMPORT){
                                moduleToAccess = constants.moduleCodeForPrivileges.FULLIMPORT;
                            }else if(moduleToAccess === constants.moduleCodeForPrivileges.MODELING ){
                            	var lengthOfUrlNest = modules.length;
                            	if(modules.length == 7 || modules.length == 8){
                            		if(modules[5].toLowerCase() == "portfolios"){
                            			if(modules[6] == modelActionStatus.APPROVE || modules[6] == modelActionStatus.REJECT){
                            				moduleToAccess = constants.moduleCodeForPrivileges.APPROVEMODELASSIGN;
                            			}else{
                            				moduleToAccess = modules[3].toLowerCase();
                            			}
                            		}else{
                            			moduleToAccess = modules[3].toLowerCase();
                            		}
                            	}else{                            		
                            		moduleToAccess = modules[3].toLowerCase();
                            	}
                            }else if(moduleToAccess === constants.moduleCodeForPrivileges.POSTIMPORTANALYSIS){
                                moduleToAccess = constants.moduleCodeForPrivileges.REFANALYTICS;
                            }
                            logger.debug("module to access is = "+moduleToAccess);
                            var reqMethod = req.method;
                            var permissionNeedFor = constants.methodParse[reqMethod];
                            logger.debug("Permission need for = "+permissionNeedFor);
                            if(req.data.user.roleTypeId === enums.roleType.TEAMADMIN){
                                if((moduleToAccess === constants.moduleCodeForPrivileges.TEAMS)
                                    && (reqMethod === "GET" || reqMethod === "PUT")){
                                    return next();
                                }
                            }
                            if(req.data.user.roleTypeId === enums.roleType.USER
                                && (moduleToAccess === constants.moduleCodeForPrivileges.TEAMS 
                                    || moduleToAccess === constants.moduleCodeForPrivileges.USERS
                                    || moduleToAccess === constants.moduleCodeForPrivileges.ROLES)){
                                (reqMethod !== "GET")
                                return unauthorisedResponse(res, "User do not have "+permissionNeedFor+" permission for "+moduleToAccess);
                            }
                            if(moduleToAccess === constants.moduleCodeForPrivileges.TRADEORDER){
                                if(reqMethod === "PUT"){
                                    if(modules[5].toLowerCase() === "processTrades"){
                                        moduleToAccess = constants.moduleCodeForPrivileges.ORDEXEC;
                                    }else{
                                        moduleToAccess = constants.moduleCodeForPrivileges.ORDEDIT;
                                    }
                                }else{
                                    return next();
                                }
                            }
                            if (moduleToAccess in privilegeMap) {
                                var privilege = privilegeMap[moduleToAccess];
                                if (privilege[permissionNeedFor]) {
                                    logger.debug("Authorized User");
                                    return next();
                                }
                                else {
                                    logger.info("Unauthorized response ");
                                    return unauthorisedResponse(res, "User do not have "+permissionNeedFor+" permission for "+moduleToAccess);
                                }
                            } else {
                                logger.info("Unauthorized response ");
                                return unauthorisedResponse(res, messages.userDoNotHavePermission+" on "+ moduleToAccess);
                            }
                        }
                    }else{
                        logger.info("Unauthorized response ");
                        return unauthorisedResponse(res, messages.userDoNotHavePermission);
                    }
                }else{
                    logger.info("Unauthorized response ");
                    return unauthorisedResponse(res, messages.userDoNotHavePermission);
                }
            });
        //}
    }
    isAuthorized.unless = require("express-unless");
    return isAuthorized;
};

function unauthorisedResponse(res, msg) {
    var key = "{\"" + constants.ERROR_MESSAGE_KEY + "\":\"" + msg + "\"}";
    responseController(null, responseCodes.FORBIDDEN, JSON.parse(key), res);
}
