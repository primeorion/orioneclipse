"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var request = require("request");
var _ = require('underscore');
var sharedCache = require('service/cache').shared;
var localCache = require('service/cache').local;
var messages = config.messages;
var responseCode = config.responseCode;
var eclipseProperties = config.env.prop.orion["eclipse"];

var UserServiceAdmin = require('service/admin/UserService.js');
var userServiceAdmin = new UserServiceAdmin();
var UserDao = require('dao/community/UserDao.js');
var StrategistDao = require('dao/community/StrategistDao.js');
var UploadService = require('service/upload/UploadService.js');
var UtilService = require('service/util/Util.js');
var utilService = new UtilService();
var strategistDao = new StrategistDao();
var userDao = new UserDao();
var uploadService = new UploadService();

var UserService = function () {};

UserService.prototype.getUserList = function (data, cb) {
    logger.info("Get users list service called (getUserList())");
    var self = this;
    userDao.getUserList(data, function (err, fetched) {
        if (err) {
            logger.error("Getting user list (getUserList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        data.documents = fetched;
        self.getSignedUrlForDocuments(data, function (err, documentResult) {
            if (err) {
                logger.error("Get Strategist documents (getStrategistdocuments()) " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            return cb(null, responseCode.SUCCESS, documentResult[0].documents);
        });
        //  return cb(null, responseCode.SUCCESS, fetched);
    });
};

UserService.prototype.getUserRoleList = function (inputData, cb) {
    logger.info("get user role list called (getStrategistStatusList()) " + JSON.stringify(inputData));
    userDao.getUserRoleList(inputData, function (err, result) {
        if (err) {
            logger.error("get user role list called(getStrategistStatusList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCode.SUCCESS, result);
    });
}

UserService.prototype.getLoggedInUserRole = function (inputData, cb) {
    logger.info("get logged in user role called (getStrategistStatusList()) " + JSON.stringify(inputData));
    userDao.getLoggedInUserRole(inputData, function (err, result) {
        if (err) {
            logger.error("get user role list called(getStrategistStatusList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCode.SUCCESS, result);
    });
}

UserService.prototype.getLoggedinUser = function (inputData, cb) {
    logger.info("get logged in user called (getLoggedinUser()) " + JSON.stringify(inputData));
    var self = this;
    // userDao.getLoggedInUserDetails(inputData, function(err, result){
    //     if(err){
    //         logger.error("get user called(getLoggedinUser())" + err);
    //         return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    //     }
    //     if(result && result.length > 0){
    //         utilService.getUserFirm(inputData, result, function(err, status, firmDetails){
    //             if(err){
    //                 return cb(err);
    //             }
    //             result[0].eclipseDatabaseId = firmDetails[0] ? firmDetails[0].id : null;
    //             result[0].eclipseDatabaseName = firmDetails[0] ? firmDetails[0].name : null;
    //             inputData.documents = result;
    //             self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
    //                 if (err) {
    //                     logger.error("Get Strategist documents (getLoggedinUser()) " + err);
    //                     return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    //                 }
    //                 return cb(null, responseCode.SUCCESS, documentResult[0].documents);
    //             });
    //         });
    //     }else{
    //         return cb(messages.userNotFound, responseCode.NOT_FOUND);
    //     }    
    // });
    var communityToken = localCache.get(inputData.reqId).session.token;
    sharedCache.get(communityToken, function (err, tokenData){
		var eclipseUserDetailsInfo = JSON.parse(tokenData);
		if(eclipseUserDetailsInfo.eclipseUserDetails){
            var info = eclipseUserDetailsInfo.eclipseUserDetails;
            var roleType = info.roleName;
            var result = {
                "id": info.id,
                "roleId": 4,
                "roleType": 'Advisor('+ roleType +')',
                "orionConnectExternalId": '',
                "name": info.name,
                "isDeleted": 0,
                "loginUserId": info.userLoginId,
                "email": info.email,
                "createdDate": info.createdOn,
                "createdBy": info.createdBy,
                "editedDate": info.editedOn,
                "editedBy": info.editedBy,
                "eclipseDatabaseId": info.firmId,
                "eclipseDatabaseName": info.firmName,
                "path": "",
                "url": info.url
            };
			return cb(null , responseCode.SUCCESS, result);
        }else{
            inputData.assignedUserId = inputData.user.userId;
            self.getUserDetail(inputData, function (err, code, result) {
                if (err) {
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, messages.SUCCESS, result[0]);
            });
        }
    });
}

UserService.prototype.getUserDetail = function (inputData, cb) {
    var self = this;
    userDao.get(inputData, function (err, result) {
        if (err) {
            logger.error("get user detail called(getUserDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result && result.length > 0) {
            if (result[0].roleType == "Super Admin") {
                if (result[0].eclipseDatabaseId == 0) {
                    result[0].eclipseDatabaseName = null;
                    inputData.documents = result;
                    self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
                        if (err) {
                            logger.error("Get Strategist documents (getStrategistdocuments()) " + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        return cb(null, responseCode.SUCCESS, documentResult[0].documents);
                    });
                } else {
                    utilService.getUserFirm(inputData, result, function (err, status, firmDetails) {
                        if (err) {
                            return cb(err);
                        }
                        result[0].eclipseDatabaseId = firmDetails[0] ? firmDetails[0].id : null;
                        result[0].eclipseDatabaseName = firmDetails[0] ? firmDetails[0].name : null;
                        delete result[0].eclipseDbId;
                        inputData.documents = result;
                        self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
                            if (err) {
                                logger.error("Get Strategist documents (getStrategistdocuments()) " + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            return cb(null, responseCode.SUCCESS, documentResult[0].documents);
                        });
                    });
                }
            } else {
                userDao.getUserList(inputData, function (err, result) {
                    if (err) {
                        return cb(err);
                    }
                    inputData.documents = result;
                    self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
                        if (err) {
                            logger.error("Get Strategist documents (getStrategistdocuments()) " + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        return cb(null, responseCode.SUCCESS, documentResult[0].documents);
                    });
                });
            }
        } else {
            return cb(messages.userNotFound, responseCode.NOT_FOUND);
        }
    });
}

UserService.prototype.getFirms = function (data, cb) {
    logger.info("get all firms information from common db service (getFirms())");

    userDao.getFirms(data, function (err, result) {
        if (err) {
            logger.error("get firm called (getFirms()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCode.SUCCESS, result);
    });
};

UserService.prototype.getFirmId = function (data, cb) {
    logger.info("get firmId information from common db service (getFirmId())");

    userDao.getFirmId(data, function (err, result) {
        if (err) {
            logger.error("get firm called (getFirmId()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.error("The error is: ", JSON.stringify(result));
        if (result == undefined || result == null || result.length == 0) {
            return cb(messages.userNotFound, responseCode.NOT_FOUND);
        }
        if (result[0].eclipseDbId == undefined || result[0].eclipseDbId == null || result[0].eclipseDbId == "NULL" || result[0].eclipseDbId == "null" || result[0].eclipseDbId == "(NULL)") {
            return cb(messages.firmNotFound, responseCode.NOT_FOUND);
        }
        data.id = result[0].eclipseDbId;
        userDao.getFirmName(data, function (err, result) {
            if (err) {
                logger.error("get firm name called (getFirmId()) " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }

            return cb(null, responseCode.SUCCESS, result);
        });
    });
};

UserService.prototype.getLogo = function (inputData, cb) {
    logger.info("Get Strategist documents called (getStrategistdocuments()) " + JSON.stringify(inputData));
    var self = this;

    userDao.getLogo(inputData, function (err, result) {
        if (err) {
            logger.error("Get Strategist documents (getStrategistdocuments()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCode.SUCCESS, result);
        // self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
        //     if (err) {
        //         logger.error("Get Strategist documents (getStrategistdocuments()) " + err);
        //         return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        //     }

        //     return cb(null, responseCode.SUCCESS, documentResult[0].documents);
        // });
    });
}

UserService.prototype.createUser = function (req, cb) {
    var data = req.data;
    var self = this;
    userServiceAdmin.searchUserFromConnect(data, function (err, code, result) {
        if (err) {
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        var flag = 0;
        for (var i = 0; i < result.length; i++) {
            if (result[i].loginUserId == data.loginUserId && data.orionConnectExternalId == result[i].userId) {
                flag = 1;
                break;
            }
        }
        if (flag == 1) {
            userDao.getUserRoleList(data, function (err, result) {
                if (err) {
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (result == undefined || result == null || result.length == 0) {
                    return cb(messages.roleNotFound, responseCode.UNPROCESSABLE)
                }
                if (result[0].roleType != "Super Admin") {
                    return cb(messages.roleNotFound, responseCode.UNPROCESSABLE)

                }
                var role = result[0].roleType;

                userDao.getEclipseDatabaseName(data, function (err, result) {
                    if (err) {
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (role == "Super Admin" && data.eclipseDatabaseId == 0) {} else {
                        if (result == undefined || result == null || result.length == 0) {
                            return cb("Eclipse db id does not exists or no ConnectId for corresponding firm.", responseCode.UNPROCESSABLE);
                        }
                    }

                    userDao.getUserByOrionId(data, function (err, result) {
                        if (err) {
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (result && result.length > 0) {
                            return cb("User already exists.", responseCode.UNPROCESSABLE)
                        }

                        var strategistData = {
                            orionConnectExternalId: data.orionConnectExternalId,
                            assignedUserName: data.name,
                            assignedUserLoginId: data.loginUserId,
                            assignedUserEmail: data.loginUserId,
                            eclipseDatabaseId: data.eclipseDatabaseId
                        };


                        strategistDao.updateOrCreateUserWithEclipseId(data, strategistData, function (err, result) {
                            if (err) {
                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            if (!result.insertId) {
                                return cb("Could not add user.", responseCode.UNPROCESSABLE)
                            }
                            data.assignedUserId = result.insertId;

                            var strategistData = {
                                assignedUserId: result.insertId,
                                role: data.roleId
                            };

                            strategistDao.addOrUpdateUserRole(data, strategistData, function (err, result) {

                                if (err) {
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                }

                                userDao.get(data, function (err, result) {
                                    if (err) {
                                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                    }

                                    if (result == undefined || result == null || result.length == 0) {
                                        return cb("Some error occured.", responseCode.INTERNAL_SERVER_ERROR)
                                    }

                                    return cb(null, responseCode.SUCCESS, result[0]);

                                });
                            });

                        });
                    });
                });
            });
        } else {
            return cb("LoginUserId not found or Username and connect Id do not match.", responseCode.UNPROCESSABLE);
        }

    });
};

UserService.prototype.getSignedUrlForDocuments = function (inputData, cb) {
    logger.debug('get signed urls for document (getSignedUrlForDocuments())');
    if (!Array.isArray(inputData)) {
        inputData = [inputData];
    };
    inputData.forEach(function (data) {
        data.documents.forEach(function (document) {
            if (document.path == undefined || document.path == null || document.path == '') {
                document.path = "";
                document.url = "";
            } else {
                uploadService.getSignedUrl(inputData.token, document, function (err, signedUrl) {
                    if (err) {
                        logger.error("get signed urls for document (getSignedUrlForDocuments())" + err);
                        return cb(err);
                    }
                    document["url"] = signedUrl;
                });
            }
        });
    });
    return cb(null, inputData);
}

UserService.prototype.updateLogoAndName = function( req, res, cb) {
    var self = this;
    if((!('name' in req.body) || req.body.name == null ) && (req.file == undefined || req.file == 'undefined' || req.file == null)) {
        return cb(messages.nameNotFound, responseCode.UNPROCESSABLE);
    }
    if(!(req.file == undefined || req.file == 'undefined' || req.file == null)) {
    uploadService.uploadSmallLogo(req, res, function(err, status, data){
        if (err) {
            logger.error("Error ocurred while uploading logo updateLogoAndName() " + err);
            return cb(err, status);
        }
        if( req.body.name != undefined || req.body.name != null ) {
            userDao.updateUser(req, function( err, result) {
                if(err) {
                    logger.error("Error ocurred while updating name updateLogoAndName() " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                req.data.assignedUserId = req.data.user.userId;
                self.getUserDetail( req.data, function(err, code, result) {
                   if(err) { 
                       return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                   }
                   return cb(null, code, result[0]);
                });
            //  return cb(null, responseCode.SUCCESS, data);
            });
        } else {
                req.data.assignedUserId = req.data.user.userId;
                self.getUserDetail( req.data, function(err, code, result) {
                   if(err) { 
                       return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                   }
                   return cb(null, code, result[0]);
                });          

        }
    });
    } else {
        if( req.body.name != undefined || req.body.name != null ) {
            userDao.updateUser(req, function( err, result) {
                if(err) {
                    logger.error("Error ocurred while updating name updateLogoAndName() " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                req.data.assignedUserId = req.data.user.userId;
                self.getUserDetail( req.data, function(err, code, result) {
                   if(err) { 
                       return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                   }
                   return cb(null, code, result[0]);
                });
            //  return cb(null, responseCode.SUCCESS, data);
            });
        } else {
                return cb(messages.nameNotFound, responseCode.UNPROCESSABLE);        
        }        
    }
}

UserService.prototype.getUsersStrategistCount = function(data, cb){
    logger.debug('in get users and strategist count service called (getUsersStrategistCount())');
    userDao.getUsersStrategistCount(data, function(err, countResult){
        if(err){
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(countResult && countResult.length > 0){
            return cb(null, responseCode.SUCCESS, countResult[0][0]);
        }else{
            return cb(null, responseCode.SUCCESS, {});
        }
    });
}


module.exports = UserService;