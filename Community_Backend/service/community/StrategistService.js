"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var request = require("request");
var helper = require("helper");
var env = config.env.name;
var eclipseProperties = config.env.prop.orion["eclipse"];
var _ = require('underscore');
var sharedCache = require('service/cache').shared;
var localCache = require('service/cache').local;
var baseDao = require('dao/BaseDao.js');
var messages = config.messages;
var responseCode = config.responseCode;

var StrategistDao = require('dao/community/StrategistDao.js');
var ModelDao = require('dao/community/ModelDao.js');
var UploadService = require('service/upload/UploadService.js');
var LoginService = require('service/admin/LoginService.js');
var UserService = require('service/community/UserService.js');
var UserServiceAdmin = require('service/admin/UserService.js');
var UserDao = require('dao/community/UserDao.js');
var Util = require('service/util/Util.js');
var asyncLoop = require('node-async-loop');
var asyncFor = helper.asyncFor;
var userService = new UserService();
var util = new Util();

var strategistDao = new StrategistDao();
var modelDao = new ModelDao();
var uploadService = new UploadService();
var loginService = new LoginService();
var userDao = new UserDao();
var userServiceAdmin = new UserServiceAdmin();

var StrategistResponse = require("model/community/strategist/StrategistResponse.js");
var StrategistResponseSimpleDetail = require("model/community/strategist/StrategistResponseSimpleDetail.js");

var StrategistService = function () {};

var userRoleTypeEnum = {
    1: "Super Admin",
    2: "Strategist Admin",
    3: "Strategist User"
}

var strategistStatusEnum = {
    0: 'Not Active',
    1: 'Approved',
    2: 'Not Approved'
}

function checkDuplicates(arr, key) {
    var dupArr = [];
    var groupedByCount = _.countBy(arr, function (item) {
        return item[key];
    });
    for (var key in groupedByCount) {
        if (groupedByCount[key] > 1) {
            return true;
        }
    };
    return false;
}

StrategistService.prototype.getDashboardSummaryData = function (inputData, cb) {
    logger.info("Get getDashboardSummaryData service called (getDashboardSummaryData())");
    strategistDao.getDashboardSummaryData(inputData, function (err, data) {
        if (err) {
            logger.error("getDashboardSummaryData (getDashboardSummaryData())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        cb(null, responseCode.SUCCESS, data[0]);
    });
};

StrategistService.prototype.getStrategistCount = function (inputData, cb) {
    logger.info("Get strategist count service called (getStrategistCount())");
    strategistDao.getStrategistCount(inputData, function (err, data) {
        if (err) {
            logger.error("getStrategistCount (getStrategistCount())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        cb(null, responseCode.SUCCESS, data[0]);
    })
};

StrategistService.prototype.getStrategistList = function (inputData, cb) {
    logger.info("Get Strategist list service called (getStrategistList())");
    var userCount = 0;

    userService.getLoggedinUser(inputData, function (err, result, data) {
        if (err) {
            logger.error("getStrategistList (getStrategistList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (data.eclipseDbId == undefined || data.eclipseDbId == null || data.eclipseDbId == 'NULL' || data.eclipseDbId == 0) {
            strategistDao.getList(inputData, function (err, fetched) {
                if (err) {
                    logger.error("Getting Strategist list (getStrategistList())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                if (fetched.length > 0 && fetched) {
                    fetched.forEach(function (fetchedModalData) {
                        strategistDao.getStrategistUser(inputData, fetchedModalData, function (err, userDetail) {
                            if (err) {
                                logger.error("Getting Strategist detail with assigned users (getStrategistList())" + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            fetchedModalData.userCount = 0;
                            if (userDetail && userDetail.length > 0) {
                                fetchedModalData.userCount = userDetail.length;
                            }
                            strategistDao.getStrategistModals(inputData, fetchedModalData, function (err, model) {
                                userCount++;
                                if (err) {
                                    logger.error("Getting Strategist detail with assigned users (getStrategistList())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                fetchedModalData.modelCount = 0;
                                if (model && model.length > 0) {
                                    fetchedModalData.modelCount = model.length;
                                }
                                delete fetchedModalData['userId'];
                                if (fetched.length == userCount) {
                                    return cb(null, responseCode.SUCCESS, fetched);
                                }
                            });
                        });
                    });
                } else {
                    logger.info("Preparing Strategist list (getStrategistList()) " + JSON.stringify(fetched));
                    return cb(null, responseCode.SUCCESS, new StrategistResponse(fetched));
                }
            });

        } else {
            inputData.eclipseDbId = data.eclipseDbId;
            strategistDao.getStrategistFromEclipseDbId(inputData, function (err, result) {
                if (err) {
                    logger.error("getStrategistList (getStrategistList())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                var id = [];
                if (result.length == 0) {
                    logger.info("Preparing Strategist list (getStrategistList()) " + JSON.stringify(result));
                    return cb(null, responseCode.SUCCESS, result);
                }
                for (var i = 0; i < result.length; i++) {
                    id.push(result[i].strategistId);
                }
                inputData.ids = id;
                strategistDao.getListByID(inputData, function (err, fetched) {
                    if (err) {
                        logger.error("Getting Strategist list (getStrategistList())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    if (fetched.length > 0 && fetched) {
                        fetched.forEach(function (fetchedModalData) {
                            strategistDao.getStrategistUser(inputData, fetchedModalData, function (err, userDetail) {
                                if (err) {
                                    logger.error("Getting Strategist detail with assigned users (getStrategistList())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                fetchedModalData.userCount = 0;
                                if (userDetail && userDetail.length > 0) {
                                    fetchedModalData.userCount = userDetail.length;
                                }
                                strategistDao.getStrategistModals(inputData, fetchedModalData, function (err, model) {
                                    userCount++;
                                    if (err) {
                                        logger.error("Getting Strategist detail with assigned users (getStrategistList())" + err);
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    fetchedModalData.modelCount = 0;
                                    if (model && model.length > 0) {
                                        fetchedModalData.modelCount = model.length;
                                    }
                                    delete fetchedModalData['userId'];
                                    if (fetched.length == userCount) {
                                        return cb(null, responseCode.SUCCESS, fetched);
                                    }
                                });
                            });
                        });
                    } else {
                        logger.info("Preparing Strategist list (getStrategistList()) " + JSON.stringify(fetched));
                        return cb(null, responseCode.SUCCESS, new StrategistResponse(fetched));
                    }

                });
            });
        }
    });
};

StrategistService.prototype.getStrategistSimpleList = function (inputData, cb) {
    logger.info("Get Strategist Simple list service called (getStrategistList())");
    var userCount = 0;
    userService.getLoggedinUser(inputData, function (err, result, data) {
        if (err) {
            logger.error("Getting Strategist Simple list (getStrategistList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (data.eclipseDbId == undefined || data.eclipseDbId == null || data.eclipseDbId == 'NULL' || data.eclipseDbId == 0) {
            strategistDao.getListSimple(inputData, function (err, fetched) {
                if (err) {
                    logger.error("Getting Strategist Simple list (getStrategistList())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                if (fetched.length > 0 && fetched) {
                    fetched.forEach(function (fetchedData) {
                        strategistDao.getStrategistUser(inputData, fetchedData, function (err, result) {
                            if (err) {
                                logger.error("Getting Strategist Simple list (getStrategistList())" + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            fetchedData.userId = [];
                            result.forEach(function (user) {
                                fetchedData.userId.push(user.userId);
                            });

                            strategistDao.getUserDetail(inputData, fetchedData, function (err, out) {
                                userCount++;
                                if (err) {
                                    logger.error("Getting Strategist Simple detail with assigned users (getStrategistList())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                fetchedData.users = [];
                                fetchedData.users = out;
                                fetchedData.userCount = out.length;
                                delete fetched['userId'];
                                if (fetched.length === userCount) {
                                    return cb(null, responseCode.SUCCESS, new StrategistResponseSimpleDetail(fetched));
                                }
                            });
                        });
                    });
                } else {
                    return cb(null, responseCode.SUCCESS, new StrategistResponseSimpleDetail(fetched));
                }
            });
        } else {
            inputData.eclipseDbId = data.eclipseDbId;
            strategistDao.getStrategistFromEclipseDbId(inputData, function (err, result) {
                if (err) {
                    logger.error("Getting Strategist Simple list (getStrategistList())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                var id = [];
                if (result.length == 0) {
                    logger.info("Preparing Strategist list (getStrategistList()) " + JSON.stringify(result));
                    return cb(null, responseCode.SUCCESS, result);
                }
                for (var i = 0; i < result.length; i++) {
                    id.push(result[i].strategistId);
                }
                strategistDao.getListSimpleByID(inputData, function (err, fetched) {
                    if (err) {
                        logger.error("Getting Strategist Simple list (getStrategistList())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    if (fetched.length > 0 && fetched) {
                        fetched.forEach(function (fetchedData) {
                            strategistDao.getStrategistUser(inputData, fetchedData, function (err, result) {
                                if (err) {
                                    logger.error("Getting Strategist Simple list (getStrategistList())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                fetchedData.userId = [];
                                result.forEach(function (user) {
                                    fetchedData.userId.push(user.userId);
                                });

                                strategistDao.getUserDetail(inputData, fetchedData, function (err, out) {
                                    userCount++;
                                    if (err) {
                                        logger.error("Getting Strategist Simple detail with assigned users (getStrategistList())" + err);
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    fetchedData.users = [];
                                    fetchedData.users = out;
                                    fetchedData.userCount = out.length;
                                    delete fetched['userId'];
                                    if (fetched.length === userCount) {
                                        return cb(null, responseCode.SUCCESS, new StrategistResponseSimpleDetail(fetched));
                                    }
                                });
                            });
                        });
                    } else {
                        return cb(null, responseCode.SUCCESS, new StrategistResponseSimpleDetail(fetched));
                    }
                });
            });
        }
    });
};

StrategistService.prototype.getStrategistDetail = function (inputData, cb) {
    var self = this;
    logger.info("Get Strategist details service called (getStrategistDetail()) ");
    if (!isNaN(inputData.id)) {
        strategistDao.getDetail(inputData, function (err, fetched) {
            if (err == messages.userDoNotHavePermission) {
                logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
            } else if (err) {
                logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched.length > 0) {
                strategistDao.getStrategistUser(inputData, fetched, function (err, result) {
                    if (err) {
                        logger.error("Getting Strategist users in strategist detail (getStrategistDetail())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    fetched[0].userId = [];
                    result.forEach(function (user) {
                        fetched[0].userId.push(user.userId);
                    });

                    strategistDao.getUserDetail(inputData, fetched[0], function (err, out) {
                        if (err) {
                            logger.error("Getting Strategist detail with assigned users (getStrategistDetail())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        fetched[0].users = [];
                        fetched[0].users = out;
                        fetched[0].userCount = out.length;
                        delete fetched[0].userId;

                        strategistDao.getStrategistModals(inputData, fetched[0], function (err, models) {
                            if (err) {
                                logger.error("Getting Strategist detail with assigned users (getStrategistList())" + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }

                            fetched[0].models = [];
                            fetched[0].models = models;
                            fetched[0].modelCount = models.length;

                            if (fetched[0].eclipseDatabaseId != 0) {
                                var firmId = [];
                                firmId.push(fetched[0].eclipseDatabaseId);
                                strategistDao.getFirmDetailsFromCommon(inputData, firmId, function (err, firmResult) {
                                    if (err) {
                                        logger.error("Getting Strategist detail with assigned users (getStrategistList())" + err);
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    if (firmResult && firmResult.length > 0) {
                                        fetched[0].eclipseDatabaseName = firmResult[0].name;
                                        return cb(null, responseCode.SUCCESS, fetched[0]);
                                    } else {
                                        return cb(messages.invalidFirm, responseCode.UNPROCESSABLE);
                                    }
                                });
                            } else {
                                return cb(null, responseCode.SUCCESS, fetched[0]);
                            }
                        });
                    });
                });
            } else {
                logger.info("Strategist Detail not found (getStrategistDetail())" + fetched);
                return cb(null, responseCode.SUCCESS, new StrategistResponse(fetched));
            }
        });
    } else {
        logger.info("Strategist Detail not found (getStrategistDetail())");
        return cb(messages.strategistIdNotANumber, responseCode.UNPROCESSABLE);
    }
};

StrategistService.prototype.getStrategistDetailSimple = function (inputData, cb) {
    var self = this;
    logger.info("Get Strategist details Simple service called (getStrategistDetail()) " + JSON.stringify(inputData));
    if (!isNaN(inputData.id)) {
        strategistDao.getStrategistDetailSimple(inputData, function (err, fetched) {
            if (err) {
                logger.error("Getting Strategist detail Simple (getStrategistDetail())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched.length > 0) {
                self.getStrategistDocuments(inputData, function (err, status, result) {
                    if (err) {
                        logger.error("Getting Strategist detail for documents (getStrategistDetail())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    fetched[0].documents = [];
                    fetched[0].documents = result;
                    strategistDao.getStrategistUser(inputData, fetched, function (err, result) {
                        if (err) {
                            logger.error("Getting Strategist users in strategist detail Simple (getStrategistDetail())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        fetched[0].userId = [];
                        result.forEach(function (user) {
                            fetched[0].userId.push(user.userId);
                        });
                        strategistDao.getUserDetail(inputData, fetched[0], function (err, out) {
                            if (err) {
                                logger.error("Getting Strategist detail with assigned users Simple (getStrategistDetail())" + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            fetched[0].users = [];
                            fetched[0].users = out;
                            fetched[0].userCount = out.length;
                            delete fetched[0].userId;
                            if (fetched[0].eclipseDatabaseId != 0) {
                                var firmId = [];
                                firmId.push(fetched[0].eclipseDatabaseId);
                                strategistDao.getFirmDetailsFromCommon(inputData, firmId, function (err, firmResult) {
                                    if (err) {
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    if (firmResult && firmResult.length > 0) {
                                        fetched[0].eclipseDatabaseName = firmDetails[0].name;
                                        return cb(null, responseCode.SUCCESS, fetched[0]);
                                    } else {
                                        return cb(messages.invalidFirm, responseCode.UNPROCESSABLE);
                                    }
                                });
                            } else {
                                return cb(null, responseCode.SUCCESS, fetched[0]);
                            }
                        });
                    });
                });
            } else {
                logger.info("Strategist Detail Simple not found (getStrategistDetail())" + fetched);
                return cb(null, responseCode.SUCCESS, new StrategistResponseSimpleDetail(fetched));
            }
        });
    } else {
        logger.info("Strategist Detail Simple not found (getStrategistDetail())");
        return cb(messages.strategistIdNotANumber, responseCode.NOT_FOUND);
    }
};

StrategistService.prototype.addStrategist = function (inputData, cb) {
    logger.info("Add Strategist service called (addStrategist())");
    var self = this;
    var isTrue = false;
    if (!Array.isArray(inputData.users)) {
        inputData.users = [inputData.users];
    }

    if (inputData.users.length > 0) {
        self.setEclipseDatabaseId(inputData, function (err, status, inputData) {
            if (err) {
                return cb(err, status);
            }
            self.verifyMandatoryFieldsForStrategist(inputData, function (err, statusCode, isVerified) {
                if (err) {
                    return cb(err, statusCode);
                }
                self.verifyUserOnCreateStrategistNew(inputData, function (err, checkUserAssigned) {
                    if (err) {
                        logger.error("Add strategist (addStrategist()) " + err);
                        return cb(err, checkUserAssigned);
                    }

                    if (checkUserAssigned != 'EXISTS') {
                        strategistDao.addStrategist(inputData, function (err, result) {
                            if (err) {
                                logger.error("Add strategist (addStrategist()) " + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            inputData.id = result.insertId;
                            if (inputData.id) {
                                self.updateMultipleUser(inputData, function (err, result) {
                                    if (err) {
                                        logger.error("Add strategist (addStrategist()) " + err);
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }

                                    self.mapStrategistUser(inputData, function (err, status, result) {
                                        if (err) {
                                            logger.error("Add strategist user (addStrategist()) " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        self.getStrategistDetail(inputData, function (err, status, out) {
                                            if (err) {
                                                logger.error("Get strategist details (addStrategist()) " + err);
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                            }
                                            return cb(null, responseCode.CREATED, new StrategistResponse(out));
                                        });
                                    });
                                });
                            } else {
                                logger.error("Error while creating strategist (addStrategist()) ");
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                        });
                    } else {
                        return cb(messages.userAlreadyAssigned, responseCode.UNPROCESSABLE);
                    }
                });
            });
        });
    } else {
        return cb(messages.atleastOneUserRequired, responseCode.NOT_FOUND);
    }
}

StrategistService.prototype.assignUserToStrategist = function (inputData, cb) {
    logger.info("Assign user to Strategist service called (addUserStrategist())");
    var self = this;
    if (!Array.isArray(inputData.users)) {
        inputData.users = [inputData.users];
    }

    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            inputData.callingFromAddUser = 1;
            self.verifyUserOnCreateStrategistNew(inputData, function (err, checkUserAssigned) {
                if (err) {
                    logger.error("Assign user to strategist (assignUserToStrategist()) " + err);
                    return cb(err, responseCode.UNPROCESSABLE);
                }
                if (checkUserAssigned != 'EXISTS') {
                    self.updateMultipleUser(inputData, function (err, result) {
                        if (err) {
                            logger.error("Assign user to strategist (assignUserToStrategist()) " + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }

                        self.mapStrategistUser(inputData, function (err, status, result) {
                            if (err) {
                                logger.error("Assign user to strategist (assignUserToStrategist()) " + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }

                            logger.debug("Assign user to strategist (assignUserToStrategist())");
                            self.getStrategistDetail(inputData, function (err, status, out) {
                                if (err) {
                                    logger.error("Get strategist details (assignUserToStrategist()) " + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                return cb(null, responseCode.CREATED, new StrategistResponse(out));
                            });
                        });
                    });
                } else {
                    return cb(messages.usersAlreadyAssigned, responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.error("Assign user to strategist (assignUserToStrategist()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.updateMultipleUser = function (inputData, cb) {
    var userUpdateCount = 0;
    inputData.users.forEach(function (user) {
        var strategistData = {};
        if (user.id) {
            strategistData.assignedUserId = user.id;
        }
        strategistData.orionConnectExternalId = user.orionConnectExternalId;
        strategistData.role = user.roleId;
        strategistData.assignedUserName = user.name;
        strategistData.assignedUserEmail = user.loginUserId;
        strategistData.assignedUserLoginId = user.loginUserId;
        strategistDao.updateOrCreateUser(inputData, strategistData, function (err, updatedUser) {
            if (err) {
                logger.error("update strategist user (updateMultipleUser()) " + err);
                if (err.code == 'ER_DUP_ENTRY') {
                    return cb(messages.usersAlreadyAssigned, responseCode.UNPROCESSABLE);
                } else {
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
            }

            if (updatedUser.insertId) {
                strategistData.assignedUserId = updatedUser.insertId;
                user.id = updatedUser.insertId
            } else {
                if (!strategistData.assignedUserId) {
                    return cb(messages.missingParameters, responseCode.UNPROCESSABLE);
                }
            };
            strategistDao.addOrUpdateUserRole(inputData, strategistData, function (err, addRoleResult) {
                userUpdateCount++;
                logger.debug("count for users are " + userUpdateCount);
                if (err) {
                    logger.error("udpate strategist user (updateMultipleUser()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                if (inputData.users.length == userUpdateCount) {
                    cb(null, responseCode.SUCCESS);
                }
            });
        });
    });
}

StrategistService.prototype.mapStrategistUser = function (inputData, cb) {
    logger.info("Map Strategist User (mapStrategistUser())");
    var self = this;
    if (!Array.isArray(inputData.users)) {
        inputData.users = [inputData.users];
    }
    strategistDao.mapStrategistUser(inputData, function (err, data) {
        if (err) {
            logger.error("Map user strategist (mapStrategistUser()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        cb(null, responseCode.CREATED, data);
    });
}

StrategistService.prototype.verifyUser = function (inputData, cb) {
    logger.info("verify user service called (verifyUser())");
    var self = this;
    var response = {};
    userServiceAdmin.searchUserFromConnect(inputData, function (err, code, result) {
        if (err) {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result && result.length > 0) {
            var found = _.where(result, {
                loginUserId: inputData.loginUserId
            });
            if (found && found.length > 0) {

                strategistDao.verifyUser(inputData, function (err, result) {

                    if (err) {
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (!result || result.length == 0) {
                        response.isVerified = 1;
                        response.message = messages.userAssigned;
                        return cb(null, responseCode.SUCCESS, response);
                    } else if (result.length > 0) {
                        response.isVerified = 0;
                        response.message = messages.userAlreadyAssigned;
                        return cb(null, responseCode.SUCCESS, response);
                    }
                });
            } else {
                return cb(messages.userNotFound, responseCode.NOT_FOUND);
            }
        } else {
            return cb(messages.userNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.verifyUserOnCreateStrategist = function (inputData, cb) {
    var allUserId = [];
    var userIds = [];
    var checkUserAssigned = '';
    var isRoleTypeAdmin = false;

    inputData.users.forEach(function (user) {
        allUserId.push(user.id);
        if (user.roleId) {
            if (userRoleTypeEnum[user.roleId] == 'Strategist Admin') {
                isRoleTypeAdmin = true;
            }
        }
    });

    if (!isRoleTypeAdmin) {
        return cb(messages.atleastOneUserWithAdminRole, responseCode.UNPROCESSABLE);
    }

    strategistDao.getAllUserId(inputData, function (err, allUsers) {
        if (err) {
            logger.error("Verified user err (addStrategist(()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (allUsers.length > 0) {
            allUsers.forEach(function (user) {
                userIds.push(user.userId);
            });
        }

        var userIdDiff = _.difference(allUserId, userIds);

        if (userIdDiff.length == allUserId.length) {
            checkUserAssigned = 'ADD';
        } else {
            checkUserAssigned = 'EXISTS';
        }

        return cb(null, checkUserAssigned);
    });
}

StrategistService.prototype.updateStrategistProfile = function (inputData, cb) {
    logger.info("Update Strategist profile service called (updateStrategistProfile())");
    var self = this;
    self.verifyMandatoryFieldsForStrategist(inputData, function (err, statusCode, isVerified) {
        if (err) {
            return cb(err, statusCode);
        }
        strategistDao.getDetail(inputData, function (err, strategistData) {
            if (err == messages.userDoNotHavePermission) {
                logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
            } else if (err) {
                logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }

            if (strategistData.length > 0 && strategistData) {
                strategistDao.updateStrategistProfile(inputData, function (err, result) {
                    if (err) {
                        logger.error("Update Strategist profile (updateStrategistProfile()) " + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    strategistDao.getDetail(inputData, function (err, out) {
                        if (err) {
                            logger.error("Update Strategist profile (updateStrategistProfile()) " + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        return cb(null, responseCode.UPDATED, out[0]);
                    });
                });
            } else {
                logger.error("Update Strategist (updateStrategistProfile()) ");
                return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
            }
        });
    });
}

StrategistService.prototype.updateStrategist = function (inputData, cb) {
    logger.info("Update Strategist service called (updateStrategist())");
    var self = this;
    self.verifyMandatoryFieldsForStrategist(inputData, function (err, statusCode, isVerified) {
        if (err) {
            return cb(err, statusCode);
        }
        if (('users' in inputData) && inputData.users.length == 0) {
            return cb(messages.userListCannotBeEmpty, responseCode.UNPROCESSABLE);
        }
        strategistDao.getDetail(inputData, function (err, strategistDetails) {
            if (err == messages.userDoNotHavePermission) {
                logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
            } else if (err) {
                logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }

            if (strategistDetails.length > 0 && strategistDetails) {
                var token = localCache.get(inputData.reqId).session.token;
                sharedCache.get(token, function (err, loginUserDetails) {
                    if (err) {
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    loginUserDetails = JSON.parse(loginUserDetails);
                    var loginUserEclipseDatabaseId = loginUserDetails.eclipseDatabaseId;
                    if (strategistDetails[0].eclipseDatabaseId !== inputData.eclipseDatabaseId && (loginUserEclipseDatabaseId != 0 || loginUserEclipseDatabaseId == null)) {
                        return cb(messages.cannotUpdateEclipseDatabaseId, responseCode.UNPROCESSABLE);
                    }
                    if (inputData.users && inputData.users.length > 0) {
                        if (inputData.id) {
                            self.verifyUserOnUpdateStrategistNew(inputData, function (err, checkUserAssigned) {
                                if (err) {
                                    logger.error("Update Strategist (updateStrategist()) " + err);
                                    return cb(err, responseCode.UNPROCESSABLE);
                                }
                                if (checkUserAssigned != 'EXISTS') {
                                    if (checkUserAssigned != 'ALL USERS') {
                                        strategistDao.updateStrategist(inputData, function (err, result) {
                                            if (err) {
                                                logger.error("Update Strategist (updateStrategist()) " + err);
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                            }
                                            self.updateMultipleUser(inputData, function (err, result) {
                                                if (err) {
                                                    logger.error("Update Strategist (updateStrategist()) " + err);
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                self.mapStrategistUser(inputData, function (err, status, result) {
                                                    if (err) {
                                                        logger.error("Update Strategist (updateStrategist()) " + err);
                                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                    }
                                                    self.getStrategistDetail(inputData, function (err, status, out) {
                                                        if (err) {
                                                            logger.error("Get strategist details (addStrategist()) " + err);
                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                        }
                                                        return cb(null, responseCode.UPDATED, new StrategistResponse(out));
                                                    });
                                                });
                                            });
                                        });
                                    } else {
                                        strategistDao.updateStrategist(inputData, function (err, result) {
                                            if (err) {
                                                logger.error("Update Strategist (updateStrategist()) " + err);
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                            }
                                            self.getStrategistDetail(inputData, function (err, status, out) {
                                                if (err) {
                                                    logger.error("Get strategist details (addStrategist()) " + err);
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                return cb(null, responseCode.UPDATED, new StrategistResponse(out));
                                            });
                                        });
                                    }
                                } else {
                                    return cb(messages.userAlreadyAssigned, responseCode.UNPROCESSABLE);
                                }
                            });
                        } else {
                            logger.error("Get strategist details (addStrategist()) ");
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                    } else {
                        strategistDao.updateStrategist(inputData, function (err, result) {
                            if (err) {
                                logger.error("Update Strategist (updateStrategist()) " + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            self.getStrategistDetail(inputData, function (err, status, out) {
                                if (err) {
                                    logger.error("Get strategist details (addStrategist()) " + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                return cb(null, responseCode.UPDATED, new StrategistResponse(out));
                            });
                        });
                    }
                });
            } else {
                logger.error("Update Strategist (updateStrategist()) not found strategist");
                return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
            }

        });
    });
}

StrategistService.prototype.updateStrategistCommentary = function (inputData, cb) {
    logger.info("Update Strategist commentary service called (updateStrategistCommentary()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.updateStrategistCommentary(inputData, function (err, result) {
                if (err) {
                    logger.error("Update Strategist commentary (updateStrategistCommentary()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                self.getStrategistCommentary(inputData, function (err, status, updatedData) {
                    if (err) {
                        logger.error("Update Strategist commentary (updateStrategistCommentary()) " + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    return cb(null, responseCode.UPDATED, updatedData);
                });
            });
        } else {
            logger.error("Update Strategist commentary (updateStrategistCommentary()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }

    });
}

StrategistService.prototype.updateStrategistSales = function (inputData, cb) {
    logger.info("Update Strategist sales service called (updateStrategistSales()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.updateStrategistSales(inputData, function (err, result) {
                if (err) {
                    logger.error("Update Strategist sales (updateStrategistSales()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                self.getStrategistSales(inputData, function (err, status, updatedData) {
                    if (err) {
                        logger.error("Update Strategist sales (updateStrategistSales()) " + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    return cb(null, responseCode.UPDATED, updatedData);
                });
            });
        } else {
            logger.error("Update Strategist sales (updateStrategistSales()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.updateStrategistSupport = function (inputData, cb) {
    logger.info("Update Strategist support called (updateStrategistSales()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.updateStrategistSupport(inputData, function (err, result) {
                if (err) {
                    logger.error("Update Strategist support (updateStrategistSales()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                self.getStrategistSupport(inputData, function (err, status, updatedData) {
                    if (err) {
                        logger.error("Update Strategist support (updateStrategistSales()) " + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    return cb(null, responseCode.UPDATED, updatedData);
                });
            });
        } else {
            logger.error("Update Strategist support (updateStrategistSales()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.updateStrategistLegalAgreement = function (inputData, cb) {
    logger.info("Update Strategist support called (updateStrategistSales()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.updateStrategistLegalAgreement(inputData, function (err, result) {
                if (err) {
                    logger.error("Update Strategist support (updateStrategistSales()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                self.getStrategistLegalAgreement(inputData, function (err, status, updatedData) {
                    if (err) {
                        logger.error("Update Strategist support (updateStrategistSales()) " + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    return cb(null, responseCode.UPDATED, updatedData);
                });
            });
        } else {
            logger.error("Update Strategist support (updateStrategistSales()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.updateStrategistAdvertisementMessage = function (inputData, cb) {
    logger.info("Update Strategist support called (updateStrategistSales()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.updateStrategistAdvertisementMessage(inputData, function (err, result) {
                if (err) {
                    logger.error("Update Strategist support (updateStrategistSales()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                self.getStrategistAdvertisementMessage(inputData, function (err, status, updatedData) {
                    if (err) {
                        logger.error("Update Strategist support (updateStrategistSales()) " + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    return cb(null, responseCode.UPDATED, updatedData);
                });
            });
        } else {
            logger.error("Update Strategist support (updateStrategistSales()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.updateUser = function (inputData, cb) {
    logger.info("Update User service called (updateStrategist()) ");
    var self = this;
    if (!isNaN(inputData.assignedUserId)) {
        if (inputData.roleId < 1 || inputData.roleId > 3) {
            return cb(messages.roleTypeNotFound, responseCode.NOT_FOUND);
        }
        //get user details to check for user existence in db
        strategistDao.getUser(inputData, inputData, function (err, userDetails) {
            if (err) {
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (userDetails && userDetails.length > 0) {
                var user = userDetails[0];
                inputData.orionConnectExternalId = user.orionConnectExternalId;

                strategistDao.getUsersWithRoleStrategistAdmin(inputData, function (err, count) {
                    if (err) {
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (count[0].count < 2 && userRoleTypeEnum[user.roleId] == "Strategist Admin") {
                        return cb('Strategist should have atLeast one Super Admin.', responseCode.UNPROCESSABLE);
                    }
                    //check user role
                    if (userRoleTypeEnum[inputData.roleId] == 'Super Admin') {
                        if (inputData.eclipseDatabaseId == 0 || inputData.eclipseDatabaseId) {
                            //check if eclipseDatabaseId is valid 
                            self.getFirmDetails(inputData, function (err, status, firmDetails) {
                                if (err) {
                                    return cb(err, status);
                                }
                                if (firmDetails) {
                                    //get strategist corresponding to user
                                    strategistDao.getStrategistAgainstUsers(inputData, function (err, strategistIdDetails) {
                                        if (err) {
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        if (strategistIdDetails && strategistIdDetails.length > 0) {
                                            //unmap user from strategist
                                            inputData.id = strategistIdDetails[0].strategistId;
                                            inputData.ids = [];
                                            inputData.ids.push(inputData.assignedUserId);
                                            strategistDao.unmapStrategistUser(inputData, function (err, unmapResult) {
                                                if (err) {
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                if (unmapResult.affectedRows > 0) {
                                                    //update the user
                                                    strategistDao.updateOrCreateUser(inputData, inputData, function (err, userDetails) {
                                                        if (err) {
                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                        }
                                                        if (userDetails.affectedRows > 0) {
                                                            inputData.role = inputData.roleId;
                                                            strategistDao.addOrUpdateUserRole(inputData, inputData, function (err, userRoleDetails) {
                                                                if (err) {
                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                                }
                                                                if (userRoleDetails.affectedRows > 0) {
                                                                    var strategistData = {};
                                                                    strategistData.userId = [];
                                                                    strategistData.userId.push(inputData.assignedUserId);
                                                                    userService.getUserDetail(inputData, function (err, status, updatedUserDetail) {
                                                                        if (err) {
                                                                            logger.error("Update user (updateUser()) " + err);
                                                                            return cb(err, status);
                                                                        }
                                                                        if (updatedUserDetail && updatedUserDetail.length > 0) {
                                                                            logger.debug('update user detail ');
                                                                        } else {
                                                                            return cb(messages.userNotFound, responseCode.NOT_FOUND);
                                                                        }

                                                                        return cb(null, responseCode.UPDATED, updatedUserDetail[0]);
                                                                    });
                                                                } else {
                                                                    logger.error('Failed to update userRoleDetails');
                                                                    return cb(messages.failedToUpdate, responseCode.UNPROCESSABLE);
                                                                }
                                                            });
                                                        } else {
                                                            logger.error('Failed to update userDetails');
                                                            return cb(messages.failedToUpdate, responseCode.UNPROCESSABLE);
                                                        }
                                                    });
                                                } else {
                                                    logger.error('Failed to update unmapStrategistUser');
                                                    return cb(messages.failedToUpdate, responseCode.UNPROCESSABLE);
                                                }
                                            });
                                        } else {
                                            //update the user
                                            strategistDao.updateOrCreateUser(inputData, inputData, function (err, userDetails) {
                                                if (err) {
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                if (userDetails.affectedRows > 0) {
                                                    inputData.role = inputData.roleId;
                                                    strategistDao.addOrUpdateUserRole(inputData, inputData, function (err, userRoleDetails) {
                                                        if (err) {
                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                        }
                                                        if (userRoleDetails.affectedRows > 0) {
                                                            var strategistData = {};
                                                            strategistData.userId = [];
                                                            strategistData.userId.push(inputData.assignedUserId);
                                                            userService.getUserDetail(inputData, function (err, status, updatedUserDetail) {
                                                                if (err) {
                                                                    logger.error("Update user (updateUser()) " + err);
                                                                    return cb(err, status);
                                                                }
                                                                if (updatedUserDetail && updatedUserDetail.length > 0) {} else {
                                                                    return cb(messages.userNotFound, responseCode.NOT_FOUND);
                                                                }

                                                                return cb(null, responseCode.UPDATED, updatedUserDetail[0]);
                                                            });
                                                        } else {
                                                            logger.error('Failed to update userRoleDetails');
                                                            return cb(messages.failedToUpdate, responseCode.UNPROCESSABLE);
                                                        }
                                                    });
                                                } else {
                                                    logger.error('Failed to update userDetail');
                                                    return cb(messages.failedToUpdate, responseCode.UNPROCESSABLE);
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    logger.error('firm id is not valid');
                                    return cb(messages.firmNotFound, responseCode.NOT_FOUND);
                                }
                            });
                        } else {
                            logger.error('eclipse database id is mandatory');
                            return cb(messages.missingParameters, responseCode.UNPROCESSABLE);
                        }
                    } else {
                        //check if any strategist is associated with the user
                        if (inputData.id) {
                            var flag = false;
                            var assingedUserToDifferentUserid = [];
                            //there must be strategist associated to user check
                            strategistDao.getDetail(inputData, function (err, strategistDetails) {
                                if (err == messages.userDoNotHavePermission) {
                                    logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                                    return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
                                } else if (err) {
                                    logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (strategistDetails && strategistDetails.length > 0) {
                                    //update user table for eclipseDatabaseId set to 0
                                    var userData = {};
                                    userData.assignedUserId = inputData.assignedUserId;
                                    userData.eclipseDatabaseId = 0;
                                    userData.orionConnectExternalId = inputData.orionConnectExternalId;
                                    strategistDao.updateOrCreateUser(inputData, userData, function (err, updateUserDetails) {
                                        if (err) {
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        if (updateUserDetails.affectedRows > 0) {
                                            inputData.users = [];
                                            var obj = {
                                                id: inputData.assignedUserId
                                            }
                                            inputData.users.push(obj);
                                            strategistDao.mapStrategistUser(inputData, function (err, strategistResult) {
                                                if (err) {
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                if (strategistResult.affectedRows > 0) {
                                                    inputData.role = inputData.roleId;
                                                    strategistDao.addOrUpdateUserRole(inputData, inputData, function (err, roleDetails) {
                                                        if (err) {
                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                        }
                                                        if (roleDetails.affectedRows > 0) {
                                                            var strategistData = {};
                                                            strategistData.userId = [];
                                                            strategistData.userId.push(inputData.assignedUserId);
                                                            userService.getUserDetail(inputData, function (err, status, updatedUserDetail) {
                                                                if (err) {
                                                                    logger.error("Update user (updateUser()) " + err);
                                                                    return cb(err, status);
                                                                }
                                                                if (updatedUserDetail && updatedUserDetail.length > 0) {
                                                                    logger.debug('update user detail ' + JSON.stringify(updatedUserDetail));
                                                                } else {
                                                                    return cb(messages.userNotFound, responseCode.NOT_FOUND);
                                                                }

                                                                return cb(null, responseCode.UPDATED, updatedUserDetail[0]);
                                                            });
                                                        } else {
                                                            logger.error('Failed to update roleDetails');
                                                            return cb(messages.failedToUpdate, responseCode.UNPROCESSABLE);
                                                        }
                                                    });
                                                } else {
                                                    logger.error('Failed to update strategistResult');
                                                    return cb(messages.failedToUpdate, responseCode.UNPROCESSABLE);
                                                }
                                            });
                                        } else {
                                            logger.error('Failed to update updateUserDetails');
                                            return cb(messages.failedToUpdate, responseCode.UNPROCESSABLE);
                                        }
                                    });
                                    // });
                                } else {
                                    logger.error('Strategist not found ');
                                    return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
                                }
                            });
                        } else {
                            logger.error('atLeastOneStrategistWithUser');
                            return cb(messages.atLeastOneStrategistWithUser, responseCode.UNPROCESSABLE);
                        }
                    }
                });
            } else {
                return cb(messages.userNotFound, responseCode.NOT_FOUND);
            }
        });
    } else {
        logger.error('missing required params');
        return cb(messages.missingParameters, responseCode.UNPROCESSABLE);
    }
}

StrategistService.prototype.getStrategistProfileDetail = function (inputData, cb) {
    logger.info("Get Strategist profile details service called (getStrategistProfileDetail()) " + JSON.stringify(inputData));
    strategistDao.getDetail(inputData, function (err, fetched) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (fetched && fetched.length > 0) {
            return cb(null, responseCode.SUCCESS, new StrategistResponse(fetched[0]));
        } else {
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }

    });
}

StrategistService.prototype.deleteStrategist = function (inputData, cb) {
    logger.info("Delete Strategist service called (deleteStrategist()) ");
    var self = this;
    inputData.connection = {};
    inputData.connection.community = baseDao.getCommunityDBConnection(inputData);
    inputData.connection.common = baseDao.getCommonDBConnection(inputData);
    strategistDao.getDetail(inputData, function (err, out) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (out && out.length > 0) {
            inputData.ids = [];
            inputData.ids.push(inputData.id);
            //get users associated with strategist 
            strategistDao.getStrategistUser(inputData, [inputData], function (err, usersResult) {
                if (err) {
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (usersResult && usersResult.length > 0) {
                    strategistDao.unmapStrategist(inputData, function (err, result) {
                        if (err) {
                            logger.error("Delete Strategist (deleteStrategist())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (result.affectedRows > 0) {
                            strategistDao.deleteStrategist(inputData, function (err, deleteStratResult) {
                                if (err) {
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (deleteStratResult.affectedRows > 0) {
                                    //users associated with strategist should be deleted
                                    inputData.assignedUserId = [];
                                    usersResult.forEach(function (user) {
                                        inputData.assignedUserId.push(user.userId)
                                    });
                                    strategistDao.deleteStrategistUser(inputData, function (err, deleteUserDetails) {
                                        if (err) {
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        if (deleteUserDetails.affectedRows > 0) {
                                            var strategistData = {};
                                            strategistData.id = inputData.id;
                                            strategistDao.getStrategistModals(inputData, strategistData, function (err, strategistModelResult) {
                                                if (err) {
                                                    logger.error('error in get strategist models ' + err);
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                //delete strategist models
                                                delete inputData['modelId'];
                                                modelDao.delete(inputData, function (err, deleteModelsResults) {
                                                    if (err) {
                                                        logger.error('Error in delete models in deleteStrategist() ' + err);
                                                    }
                                                    self.deleteStrategistModelsFromEclipse(inputData, strategistModelResult, function (err, result) {});
                                                    return cb(messages.strategistDeleted, null, responseCode.SUCCESS);
                                                });
                                            });
                                        } else {
                                            return cb(messages.userNotDeleted, responseCode.UNPROCESSABLE);
                                        }
                                    });
                                } else {
                                    return cb(messages.strategistNotDeleted, responseCode.UNPROCESSABLE);
                                }
                            });
                        } else {
                            return cb(messages.strategistNotDeleted, responseCode.UNPROCESSABLE);
                        }
                    });
                } else {
                    return cb(messages.userNotFound, responseCode.NOT_FOUND);
                }
            });

        } else {
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.deleteStrategistUser = function (inputData, cb) {
    logger.info("Delete Strategist user service called (deleteStrategistUser()) ");
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.getStrategistUser(inputData, inputData, function (err, out) {
                if (err) {
                    logger.error("Delete Strategist user (deleteStrategistUser()) get strategist user error" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                if (out.length) {
                    var userId = [];
                    out.forEach(function (user) {
                        userId.push(user.userId);
                    });
                    var isExist = _.indexOf(userId, parseInt(inputData.assignedUserId));
                    if (isExist >= 0) {
                        var adminUserCount = 0;
                        var adminRolesId = '';
                        strategistDao.getUserAndRolesDetails(inputData, out, function (err, fetched) {
                            fetched.forEach(function (user) {
                                if (user.roleId == 2) {
                                    adminUserCount++;
                                    adminRolesId = user.userId;
                                }
                            });

                            if (adminUserCount == 1 && adminRolesId == inputData.assignedUserId) {
                                return cb(messages.cannotDeleteUser, responseCode.UNPROCESSABLE);
                            }
                            inputData.ids = [];
                            inputData.ids.push(inputData.assignedUserId);
                            strategistDao.unmapStrategistUser(inputData, function (err, result) {
                                if (err) {
                                    logger.error("Delete Strategist user (deleteStrategistUser())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }

                                strategistDao.deleteStrategistUser(inputData, function (err, fetched) {
                                    if (err) {
                                        logger.error("Delete Strategist user (deleteStrategistUser())" + err);
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }

                                    return cb(messages.userDeleted, null, responseCode.SUCCESS);
                                });
                            });
                        });
                    } else {
                        return cb(messages.userNotFound, responseCode.NOT_FOUND);
                    }
                } else {
                    logger.error("Delete Strategist user (deleteStrategistUser()) user count check " + out[0].userCount);
                    return cb(messages.userNotFound, responseCode.NOT_FOUND);
                }
            });
        } else {
            logger.error("Delete Strategist (deleteStrategistUser()) strategist not found error" + err);
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.verifyStrategist = function (inputData, cb) {
    logger.info("verify Strategist service called (verifyStrategist()) " + JSON.stringify(inputData));

    if (isNaN(inputData.id) || inputData.id.toString().indexOf('.') > 0) {
        return cb(messages.badRequest, responseCode.BAD_REQUEST);
    }
    strategistDao.verifyStrategist(inputData, function (err, result) {
        if (err) {
            logger.error("verifyStrategist called(verifyStrategist())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result == undefined || result[0] == undefined || result == null || result[0] == null) {
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }

        if (result[0].id) {
            return cb(null, messages.strategistFound, responseCode.EXISTS);
        }
    });
}

StrategistService.prototype.getStrategistStatusList = function (inputData, cb) {
    logger.info("get strategist status list called (getStrategistStatusList()) " + JSON.stringify(inputData));
    strategistDao.getStrategistStatusList(inputData, function (err, result) {
        if (err) {
            logger.error("get strategist status list called(getStrategistStatusList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCode.SUCCESS, result);
    });
}

StrategistService.prototype.getStrategistCommentary = function (inputData, cb) {
    logger.info("Get Strategist commentary service called (getStrategistCommentary()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.getStrategistCommentary(inputData, function (err, result) {
                if (err) {
                    logger.error("Get Strategist commentary (getStrategistCommentary()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                return cb(null, responseCode.SUCCESS, result[0]);
            });
        } else {
            logger.error("Get Strategist commentary (getStrategistCommentary()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }

    });
}

StrategistService.prototype.getStrategistSales = function (inputData, cb) {
    logger.info("Get Strategist sales service called (getStrategistSales()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.getStrategistSales(inputData, function (err, result) {
                if (err) {
                    logger.error("Get Strategist sales (getStrategistSales()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.SUCCESS, result[0]);
            });
        } else {
            logger.error("Get Strategist sales (getStrategistSales()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.getStrategistSupport = function (inputData, cb) {
    logger.info("Get Strategist support called (getStrategistSupport()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.getStrategistSupport(inputData, function (err, result) {
                if (err) {
                    logger.error("Get Strategist support (getStrategistSupport()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.SUCCESS, result[0]);
            });
        } else {
            logger.error("Get Strategist support (getStrategistSupport()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.getStrategistLegalAgreement = function (inputData, cb) {
    logger.info("Get Strategist support called (getStrategistLegalAgreement()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (strategistData.length > 0 && strategistData) {
            strategistDao.getStrategistLegalAgreement(inputData, function (err, result) {
                if (err) {
                    logger.error("Get Strategist support (getStrategistLegalAgreement()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.SUCCESS, result[0]);
            });
        } else {
            logger.error("Get Strategist support (updateStrategistSales()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.getStrategistAdvertisementMessage = function (inputData, cb) {
    logger.info("Get Strategist support called (getStrategistAdvertisementMessage()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.getStrategistAdvertisementMessage(inputData, function (err, result) {
                if (err) {
                    logger.error("Get Strategist support (getStrategistAdvertisementMessage()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                return cb(null, responseCode.SUCCESS, result[0]);
            });
        } else {
            logger.error("Get Strategist support (getStrategistAdvertisementMessage()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.getSignedUrlForDocuments = function (inputData, cb) {
    // logger.debug('get signed urls for document (getSignedUrlForDocuments())');
    // if (!Array.isArray(inputData)) {
    //     inputData = [inputData];
    // };
    // inputData.forEach(function (data) {
    //     data.documents.forEach(function (document) {
    //         uploadService.getSignedUrl(inputData.token, document, function (err, signedUrl) {
    //             if (err) {
    //                 logger.error("get signed urls for document (getSignedUrlForDocuments())" + err);
    //                 return cb(err);
    //             }
    //             document[document.documentName] = signedUrl;
    //         });
    //     });
    // });
    // return cb(null, inputData);

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
                    if (document.documentName == undefined) {
                        document["url"] = signedUrl;
                    } else {
                        document[document.documentName] = signedUrl;
                    }
                });
            }
        });
    });
    return cb(null, inputData);
}

StrategistService.prototype.getStrategistDocuments = function (inputData, cb) {
    logger.info("Get Strategist documents called (getStrategistDocuments()) " + JSON.stringify(inputData));
    var self = this;
    strategistDao.getDetail(inputData, function (err, strategistData) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (strategistData.length > 0 && strategistData) {
            strategistDao.getStrategistDocuments(inputData, function (err, result) {
                if (err) {
                    logger.error("Get Strategist documents (getStrategistDocuments()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                inputData.documents = result;
                self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
                    if (err) {
                        logger.error("Get Strategist documents (getStrategistDocuments()) " + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }

                    return cb(null, responseCode.SUCCESS, documentResult[0].documents);
                });
            });
        } else {
            logger.error("Get Strategist documents (getStrategistDocuments()) ");
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.getDocuments = function (inputData, cb) {
    logger.info("Get Strategist documents called (getStrategistdocuments()) " + JSON.stringify(inputData));
    var self = this;
    modelDao.verifyModel(inputData, function (err, result) {
        if (isNaN(inputData.modelId)) {
            return cb(messages.badRequest, responseCode.BAD_REQUEST);
        }
        if (err) {
            logger.error("verifyModel called(verifyModel())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result == undefined || result[0] == undefined || result == null || result[0] == null) {
            return cb(messages.modelNotFound, responseCode.NOT_FOUND);
        }
        inputData.id = result[0].strategistId;
        strategistDao.getStrategistDocuments(inputData, function (err, result) {
            if (err) {
                logger.error("Get Strategist documents (getStrategistDocuments()) " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            inputData.documents = result;
            self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
                if (err) {
                    logger.error("Get Strategist documents (getStrategistDocuments()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                return cb(null, responseCode.SUCCESS, documentResult[0].documents);
            });
        });
    });
}

StrategistService.prototype.getStrategistLogo = function (inputData, cb) {
    var logoObject = {
        smallLogo: null,
        largeLogo: null
    };
    var logoMap = {};
    var documentData = {};
    strategistDao.getStrategistLogo(inputData, function (err, result) {
        if (err) {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        var logoArray = [];
        if (result.length == 0) {
            return cb(null, responseCode.SUCCESS, logoObject);
        } else {
            result.forEach(function (row, index) {
                logoMap[row.documentName] = row.path;
            });
        }

        if (logoMap.largeLogo != undefined && logoMap.smallLogo == undefined) {
            documentData = {
                'path': logoMap.largeLogo
            }
            uploadService.createSignedURL({}, documentData, function (err, result) {
                if (err) {
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                logoObject.largeLogo = result;
                return cb(null, responseCode.SUCCESS, logoObject);
            });
        } else if (logoMap.smallLogo != undefined && logoMap.largeLogo == undefined) {
            documentData = {
                'path': logoMap.smallLogo
            }
            uploadService.createSignedURL({}, documentData, function (err, result) {
                if (err) {
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                logoObject.smallLogo = result;
                return cb(null, responseCode.SUCCESS, logoObject);
            });
        } else {
            documentData = {
                "path": logoMap.largeLogo
            }
            uploadService.createSignedURL({}, documentData, function (err, result) {
                if (err) {
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                documentData = {
                    'path': logoMap.smallLogo
                }
                logoObject.largeLogo = result;
                uploadService.createSignedURL({}, documentData, function (err, result) {
                    if (err) {
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    logoObject.smallLogo = result;
                    return cb(null, responseCode.SUCCESS, logoObject);
                });
            });
        }
    });
}

StrategistService.prototype.getStrategistAgainstUsers = function (inputData, cb) {
    logger.debug('get strategist against users service called (getStrategistAgainstUsers())');
    strategistDao.getStrategistAgainstUsers(inputData, function (err, result) {
        if (err) {
            logger.error("get strategist against users service called (getStrategistAgainstUsers()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (result && result.length > 0) {
            return cb(null, responseCode.SUCCESS, result[0]);
        } else {
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.subscribeStrategist = function (inputData, cb) {
    logger.debug('subscribe strategist service called (subscribeStrategist())');
    var self = this;
    self.getStrategistDetail(inputData, function (err, status, result) {
        logger.debug('in get strategist detail called (subscribeStrategist())');
        if (err) {
            return cb(err, status);
        }
        if (result) {
            var strategist = result;
            loginService.verifyConnectTokenAndReturnEclipseToken(inputData, function (err, token) {
                if (err) {
                    logger.error('error in verifying connect token ' + JSON.stringify(err));
                    var errorBody = JSON.parse(err.body);
                    return cb(errorBody.message, err.statusCode);
                }
                var tokenBody = JSON.parse(token.body);
                var eclipseToken = tokenBody.eclipse_access_token;
                var authorizationHeaders = "Session " + eclipseToken;
                util.getEclipseUserRoles(inputData, eclipseToken, function (err, status, roleResult) {
                    if (err) {
                        return cb(err, status);
                    }
                    if (roleResult) {
                        if (roleResult.role.roleType == 'FIRM ADMIN') {
                            strategist.firmId = roleResult.firmId;
                            self.createStrategistOnSubscribe(inputData, strategist, authorizationHeaders, function (err, statusCode, strategistResult) {
                                if (err) {
                                    return cb(err, statusCode);
                                }
                                if (!strategistResult || strategistResult == 'undefined') {
                                    return cb(messages.badRequest, responseCode.BAD_REQUEST);
                                }
                                self.getStrategistLogo(inputData, function (err, statusCode, logoResult) {
                                    if (err) {
                                        return cb(err, statusCode);
                                    }
                                    if (logoResult) {
                                        strategistResult['smallLogo'] = logoResult.smallLogo ? logoResult.smallLogo : null;
                                        strategistResult['largeLogo'] = logoResult.largeLogo ? logoResult.largeLogo : null;
                                    } else {
                                        strategistResult['smallLogo'] = null;
                                        strategistResult['largeLogo'] = null;
                                    }

                                    if (strategist.models && strategist.models.length > 0) {
                                        self.createModelsOnSubscribe(inputData, strategist, authorizationHeaders, function (err, statusCode, ModelResult) {
                                            if (err) {
                                                return cb(err, statusCode);
                                            }
                                            strategistResult.models = [];
                                            if (ModelResult && ModelResult.length > 0) {
                                                strategistResult.models = ModelResult;
                                                return cb(err, statusCode, strategistResult);
                                            } else {
                                                return cb(err, statusCode, strategistResult);
                                            }
                                        });
                                    } else {
                                        return cb(err, statusCode, strategistResult);
                                    }
                                });
                            });
                        } else {
                            return cb(messages.cannotSubscribeWithRole, responseCode.UNPROCESSABLE);
                        }
                    } else {
                        return cb(messages.userNotFound, responseCode.NOT_FOUND);
                    }
                });
            });
        } else {
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.verifyMandatoryFieldsForStrategist = function (inputData, cb) {
    logger.debug('verify mandatory fields for strategist service called (verifyMandatoryFieldsForStrategist())');
    if (strategistStatusEnum[inputData.status] === 'Approved') {
        if (inputData.id) {
            logger.debug('legal agreement data ' + inputData.legalAgreement);
            if (inputData.legalAgreement && inputData.legalAgreement == "null") {
                return cb(messages.missingMandatoryFields, responseCode.UNPROCESSABLE);
            } else {
                strategistDao.getDetail(inputData, function (err, strategistDetails) {
                    if (err == messages.userDoNotHavePermission) {
                        logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                        return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
                    } else if (err) {
                        logger.error("Getting Strategist detail (getStrategistDetail())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (strategistDetails && strategistDetails.length) {
                        if (!strategistDetails[0].legalAgreement || strategistDetails[0].legalAgreement == "null") {
                            return cb(messages.missingMandatoryFields, responseCode.UNPROCESSABLE);
                        } else {
                            return cb(null);
                        }
                    } else {
                        return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
                    }
                });
            }
        } else {
            if (!inputData.legalAgreement || inputData.legalAgreement == "null") {
                return cb(messages.missingMandatoryFields, responseCode.UNPROCESSABLE);
            } else {
                return cb(null);
            }
        }
    } else {
        return cb(null);
    }
}

StrategistService.prototype.createStrategistOnSubscribe = function (inputData, strategist, authorizationHeaders, cb) {

    logger.debug('create strategist on subscribe service called (createStrategistOnSubscribe())');
    var requestData = {};
    requestData['communityStrategistId'] = strategist.id;
    requestData['name'] = strategist.name;
    var url = {
        url: 'http://' + eclipseProperties.host + ':' + eclipseProperties.port + '/v1/community/strategists',
        headers: {
            'Authorization': authorizationHeaders,
            'Content-Type': 'application/json'
        },
        json: true,
        body: requestData
    };
    request.post(url, function (err, response, body) {
        if (response.statusCode != 200 && response.statusCode != 201) {
            return cb(response.body.message, response.statusCode, response.body.message);
        } else {
            body.firmId = strategist.firmId;
            strategistDao.mapStrategistFirm(inputData, body, function (err, result) {
                if (err) {
                    logger.debug('err is ' + err);
                    if (err.code == 'ER_BAD_NULL_ERROR' || err.code == 'ER_DUP_ENTRY') {
                        return cb(messages.badRequest, responseCode.BAD_REQUEST);
                    } else if (err === 'ALREADY SUBSCRIBE') {
                        return cb(messages.strategistAlreadySubscribed, responseCode.UNPROCESSABLE);
                    } else {
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                }
                logger.debug('************************************' + JSON.stringify(body));
                return cb(null, responseCode.SUCCESS, body);
            });
        }
    });
}

StrategistService.prototype.createModelsOnSubscribe = function (inputData, strategist, authorizationHeaders, cb) {
    logger.debug('create model on subscribe service called (createModelsOnSubscribe())');
    var requestData = {
        models: []
    };
    if (strategist.models.length > 0) {
        requestData.models = strategist.models.filter(function (item) {
            return item.status == 1
        });
    }
    var baseUrl = 'http://' + eclipseProperties.host + ':' + eclipseProperties.port + '/v1/community/strategists';
    var url = {
        url: baseUrl + '/' + strategist.id + '/models',
        headers: {
            'Authorization': authorizationHeaders,
            'Content-Type': 'application/json'
        },
        json: true,
        body: requestData,
        timeout: 36000
    };
    request.post(url, function (err, response, body) {
        if (response.statusCode != 201) {
            return cb(response.body.message, response.statusCode, response.body.message);
        } else {
            return cb(null, responseCode.SUCCESS, body);
        }
    });
}

StrategistService.prototype.unsubscribeStrategist = function (inputData, cb) {
    var self = this;
    logger.debug('unsubscribe strategist service called (unsubscribe())');
    strategistDao.getDetail(inputData, function (err, strategistDetails) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (strategistDetails && strategistDetails.length > 0) {
            var strategist = strategistDetails[0];
            loginService.verifyConnectTokenAndReturnEclipseToken(inputData, function (err, token) {
                if (err) {
                    logger.error('error in verifying connect token ' + err);
                    return (message.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                var tokenBody = JSON.parse(token.body);
                var eclipseToken = tokenBody.eclipse_access_token;
                var authorizationHeaders = "Session " + eclipseToken;
                util.getEclipseUserRoles(inputData, eclipseToken, function (err, status, roleResult) {
                    if (err) {
                        return cb(err, status);
                    }
                    if (roleResult) {
                        if (roleResult.role.roleType == 'FIRM ADMIN') {
                            strategist.firmId = roleResult.firmId;
                            self.deleteStrategistOnUnSubscribe(inputData, strategist, authorizationHeaders, function (err, statusCode, strategistResult) {
                                if (err) {
                                    return cb(err, statusCode);
                                }
                                if (statusCode == 'SUCCESS') {
                                    strategistDao.unMapStrategistFirm(inputData, strategist, function (err, result) {
                                        if (err) {
                                            if (err.code == 'ER_BAD_NULL_ERROR') {
                                                return cb(messages.badRequest, responseCode.BAD_REQUEST);
                                            }
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        return cb(messages.strategistUnsubscribedSuccessfully, null, responseCode.SUCCESS);
                                    });
                                } else {
                                    return cb(err, statusCode, strategistResult);
                                }
                            });
                        } else {
                            return cb(messages.cannotUnsubscribedWithRole, responseCode.UNPROCESSABLE);
                        }
                    } else {
                        return cb(messages.userNotFound, responseCode.NOT_FOUND);
                    }
                });
            });
        } else {
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.getStrategistListWithSubscribed = function (inputData, cb) {
    logger.info("Get Strategist list service called (getStrategistList())");
    var userCount = 0;
    var self = this;
    strategistDao.getListWithSubscribedDetails(inputData, function (err, fetched) {
        if (err) {
            logger.error("Getting Strategist list (getStrategistList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (fetched.length > 0 && fetched) {
            fetched.forEach(function (fetchedModalData) {
                strategistDao.getStrategistUser(inputData, fetchedModalData, function (err, userDetail) {
                    if (err) {
                        logger.error("Getting Strategist detail with assigned users (getStrategistList())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    fetchedModalData.userCount = 0;
                    if (userDetail && userDetail.length > 0) {
                        fetchedModalData.userCount = userDetail.length;
                    }
                    strategistDao.getStrategistModals(inputData, fetchedModalData, function (err, model) {
                        if (err) {
                            logger.error("Getting Strategist detail with assigned users (getStrategistList())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        fetchedModalData.modelCount = 0;
                        if (model && model.length > 0) {
                            fetchedModalData.modelCount = model.length;
                        }
                        delete fetchedModalData['userId'];
                        inputData.id = fetchedModalData.id;
                        var firmIds = [];
                        if (fetchedModalData.eclipseDatabaseName != 0) {
                            firmIds.push(fetchedModalData.eclipseDatabaseId);
                            strategistDao.getFirmDetailsFromCommon(inputData, firmIds, function (err, firmDetails) {
                                userCount++;
                                if (err) {
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (firmDetails && firmDetails.length > 0) {
                                    fetchedModalData.eclipseDatabaseName = firmDetails[0].name;
                                } else {
                                    fetchedModalData.eclipseDatabaseName = null;
                                }

                                if (fetched.length == userCount) {
                                    inputData.documents = fetched;
                                    self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
                                        if (err) {
                                            logger.error("Get Strategist documents (getStrategistDocuments()) " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        return cb(null, responseCode.SUCCESS, documentResult[0].documents);
                                    });
                                }
                            });
                        } else {
                            userCount++;
                            if (fetched.length == userCount) {
                                inputData.documents = fetched;
                                self.getSignedUrlForDocuments(inputData, function (err, documentResult) {
                                    if (err) {
                                        logger.error("Get Strategist documents (getStrategistDocuments()) " + err);
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    return cb(null, responseCode.SUCCESS, documentResult[0].documents);
                                });
                            }
                        }
                    });
                });
            });
        } else {
            logger.info("Preparing Strategist list (getStrategistList()) " + JSON.stringify(fetched));
            return cb(null, responseCode.SUCCESS, new StrategistResponse(fetched));
        }
    });
};

StrategistService.prototype.verifyLegalAgreement = function (inputData, cb) {
    logger.info("verify legal agreement service called (getStrategistList())");
    strategistDao.getDetail(inputData, function (err, strategistDetails) {
        if (err == messages.userDoNotHavePermission) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.userDoNotHavePermission, responseCode.UNAUTHORIZED);
        } else if (err) {
            logger.error("Getting Strategist detail (getStrategistDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (strategistDetails && strategistDetails.length > 0) {
            strategistDao.updateLegalAgreementAcceptanceTime(inputData, function (err, result) {
                if (err) {
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                var response = {
                    isAccepted: 0
                }
                if (result.affectedRows != 0) {
                    response.isAccepted = 1;
                    return cb(null, responseCode.SUCCESS, response);
                } else {
                    response.isAccepted = 0;
                    return cb(null, responseCode.SUCCESS, response);
                }
            });
        } else {
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
};

StrategistService.prototype.setEclipseDatabaseId = function (inputData, cb) {
    var loggedInUserEclipseDatabaseId = '';
    userDao.getLoggedInUserDetails(inputData, function (err, userDetails) {
        if (err) {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (userDetails && userDetails.length > 0) {
            loggedInUserEclipseDatabaseId = userDetails[0].eclipseDbId;
        }
        if (loggedInUserEclipseDatabaseId == 0) {
            if (inputData.eclipseDatabaseId == 0) {
                return cb(null, responseCode.SUCCESS, inputData);
            } else if (!inputData.eclipseDatabaseId || inputData.eclipseDatabaseId == undefined) {
                inputData.eclipseDatabaseId = loggedInUserEclipseDatabaseId;
                return cb(null, responseCode.SUCCESS, inputData);
            } else {
                userDao.getFirms(inputData, function (err, firmDetails) {
                    if (err) {
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (firmDetails && firmDetails.length > 0) {
                        var found = firmDetails.filter(function (item) {
                            return item.id == inputData.eclipseDatabaseId;
                        });
                        if (found && found.length > 0) {
                            return cb(null, responseCode.SUCCESS, inputData);
                        } else {
                            return cb(messages.firmNotFound, responseCode.NOT_FOUND);
                        }
                    } else {
                        return cb(messages.firmNotFound, responseCode.NOT_FOUND);
                    }
                });
            }
        } else {
            if (inputData.eclipseDatabaseId != 0 || inputData.eclipseDatabaseId != null) {
                return cb(messages.cannotUpdateEclipseDatabaseId, responseCode.UNPROCESSABLE);
            } else {
                return cb(null, responseCode.SUCCESS, inputData);
            }
        }
    });
}

StrategistService.prototype.getStrategistFirm = function (inputData, cb) {
    logger.debug('get the list of firms of strategist');
    var strategistData = {
        communityStrategistId: inputData.id
    }
    strategistDao.getStrategistFirm(inputData, strategistData, function (err, firmIds) {
        if (err) {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (firmIds && firmIds.length > 0) {
            var firmIds = _.pluck(firmIds, 'firmId');
            strategistDao.getFirmDetailsFromCommon(inputData, firmIds, function (err, firmDetails) {
                if (err) {
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.SUCCESS, firmDetails);
            });
        } else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
}

StrategistService.prototype.getFirmDetails = function (inputData, cb) {
    logger.debug('get firms details getFirmDetails()');
    if (inputData.eclipseDatabaseId == 0) {
        return cb(null, responseCode.SUCCESS, inputData);
    }
    userDao.getFirms(inputData, function (err, firmDetails) {
        if (err) {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (firmDetails && firmDetails.length > 0) {
            var found = firmDetails.filter(function (item) {
                return item.id == inputData.eclipseDatabaseId;
            });
            if (found && found.length > 0) {
                return cb(null, responseCode.SUCCESS, inputData);
            } else {
                return cb(messages.firmNotFound, responseCode.NOT_FOUND);
            }
        } else {
            return cb(messages.firmNotFound, responseCode.NOT_FOUND);
        }
    });
}

StrategistService.prototype.verifyUserOnCreateStrategistNew = function (inputData, cb) {
    var allOrionConnectExternalId = [];
    var userIds = [];
    var checkUserAssigned = '';
    var isRoleTypeAdmin = false;
    var isRoleTypeSuperAdmin = false;
    var isRoleUndefined = false;
    var allOrionConnectId = [];

    if (strategistStatusEnum[inputData.status] == undefined && inputData.callingFromAddUser != 1) {
        return cb('Status is not valid.', responseCode.UNPROCESSABLE);
    }

    inputData.users.forEach(function (user) {
        allOrionConnectId.push(user.orionConnectExternalId);
        if (user.roleId) {
            if (userRoleTypeEnum[user.roleId] == 'Strategist Admin') {
                isRoleTypeAdmin = true;
            }
            if (userRoleTypeEnum[user.roleId] == 'Super Admin') {
                isRoleTypeSuperAdmin = true;
            }
            if (userRoleTypeEnum[user.roleId] == undefined) {
                isRoleUndefined = true;
            }
        }
    });

    if (checkDuplicates(inputData.users, 'orionConnectExternalId')) {
        return cb(messages.duplicateUsersFound, responseCode.UNPROCESSABLE);
    }

    if (checkDuplicates(inputData.users, 'loginUserId')) {
        return cb(messages.duplicateUsersFound, responseCode.UNPROCESSABLE);
    }

    if (isRoleUndefined) {
        return cb(messages.roleNotFound, responseCode.UNPROCESSABLE);
    }

    if (!isRoleTypeAdmin && inputData.callingFromAddUser != 1) {
        return cb(messages.atleastOneUserWithAdminRole, responseCode.UNPROCESSABLE);
    }
    if (isRoleTypeSuperAdmin) {
        return cb(messages.atleastOneUserWithSuperAdminRole, responseCode.UNPROCESSABLE);
    }

    strategistDao.getStrategistsForUsers(inputData, allOrionConnectId, function (err, result) {
        if (err) {
            logger.error("Verified user err (addStrategist(()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (!result || result.length == 0) {
            return cb(null, 'ADD');
        } else {

            var flag = 0;

            if (inputData.callingFromAddUser == 1) {
                // for (var i = 0; i < result.length; i++) {
                //     if (result[i].strategistId != inputData.id) {
                //         flag = 1;
                //     }
                // }
            } else {
                return cb(null, 'EXISTS');
            }

            if (flag == 0) {
                return cb(null, 'EXISTS');
            } else {
                return cb(null, 'ADD');
            }
        }
    });
}

StrategistService.prototype.verifyUserOnUpdateStrategistNew = function (inputData, cb) {
    var allUserId = [];
    var assignedUsersUserId = [];
    var allOrionConnectExternalId = [];
    var assignedOrionConnectExternalId = [];
    var assingedUserToDifferentUserid = [];
    var assingedUserToDifferentOrionId = [];
    var checkUserAssigned = '';
    var isRoleTypeAdmin = false;
    var isRoleTypeSuperAdmin = false;
    var isRoleUndefined = false;

    if (strategistStatusEnum[inputData.status] == undefined) {
        return cb('Status is not valid.', responseCode.UNPROCESSABLE);
    }

    inputData.users.forEach(function (user) {
        if (user.roleId) {
            if (userRoleTypeEnum[user.roleId] == 'Strategist Admin') {
                isRoleTypeAdmin = true;
            }
            if (userRoleTypeEnum[user.roleId] == 'Super Admin') {
                isRoleTypeSuperAdmin = true
            }
            if (userRoleTypeEnum[user.roleId] == undefined) {
                isRoleUndefined = true;
            }
        }
    });

    if (checkDuplicates(inputData.users, 'orionConnectExternalId')) {
        return cb(messages.duplicateUsersFound, responseCode.UNPROCESSABLE);
    }

    if (checkDuplicates(inputData.users, 'loginUserId')) {
        return cb(messages.duplicateUsersFound, responseCode.UNPROCESSABLE);
    }


    if (isRoleUndefined) {
        return cb(messages.roleNotFound, responseCode.UNPROCESSABLE);
    }

    if (!isRoleTypeAdmin) {
        return cb(messages.atleastOneUserWithAdminRole, responseCode.UNPROCESSABLE);
    }
    if (isRoleTypeSuperAdmin) {
        return cb(messages.atleastOneUserWithSuperAdminRole, responseCode.UNPROCESSABLE);
    }

    strategistDao.getAlreadyAssignedUsers(inputData, function (err, assignedUsers) {
        if (err) {
            logger.error("Verified user err (addStrategist(()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (assignedUsers.length > 0) {
            assignedUsers.forEach(function (user) {
                assignedUsersUserId.push(user.userId);
                assignedOrionConnectExternalId.push(user.orionConnectExternalId);
            });
        }

        inputData.users.forEach(function (user) {
            allOrionConnectExternalId.push(user.orionConnectExternalId);
        });

        var difference = _.difference(allOrionConnectExternalId, assignedOrionConnectExternalId);
        var userTOBeDeleted = _.difference(assignedOrionConnectExternalId, allOrionConnectExternalId);


        if (difference.length == 0) {
            checkUserAssigned = 'ADD OR UPDATE';
            if (userTOBeDeleted != 0) {
                inputData.orionExternalIds = userTOBeDeleted;
                strategistDao.deleteStrategistUser(inputData, function (err, result) {
                    if (err) {
                        logger.error("error in unmapping of user from strategist verifyUserOnUpdateStrategist()");
                        return cb(messages.internalServerError, messages.INTERNAL_SERVER_ERROR);
                    }
                    strategistDao.unmapStrategistUser(inputData, function (err, result) {
                        if (err) {
                            logger.error("error in deleting user from strategist verifyUserOnUpdateStrategist()");
                            return cb(messages.internalServerError, messages.INTERNAL_SERVER_ERROR);
                        }
                        return cb(null, checkUserAssigned);
                    });
                });
            } else {
                return cb(null, checkUserAssigned);
            }
        } else {
            strategistDao.getUsersAssignedToDifferentStrategist(inputData, function (err, assignedUsersToDiffStrat) {
                if (err) {
                    logger.error("Verified user err (addStrategist(()) " + err);
                    return cb(messages.internalServerError, messages.INTERNAL_SERVER_ERROR);
                }

                if (assignedUsersToDiffStrat.length > 0) {
                    assignedUsersToDiffStrat.forEach(function (user) {
                        assingedUserToDifferentOrionId.push(user.orionConnectExternalId);
                        assingedUserToDifferentUserid.push(user.userId);
                    });
                }

                var notAssignedYet = _.difference(difference, assingedUserToDifferentOrionId);

                if (notAssignedYet.length === difference.length) {
                    checkUserAssigned = 'ADD OR UPDATE';
                } else {
                    checkUserAssigned = 'EXISTS';
                }
                if (userTOBeDeleted != 0) {
                    inputData.orionExternalIds = userTOBeDeleted;
                    strategistDao.deleteStrategistUser(inputData, function (err, result) {
                        if (err) {
                            logger.error("error in unmapping of user from strategist verifyUserOnUpdateStrategist()");
                            return cb(messages.internalServerError, messages.INTERNAL_SERVER_ERROR);
                        }
                        strategistDao.unmapStrategistUser(inputData, function (err, result) {
                            if (err) {
                                logger.error("error in deleting user from strategist verifyUserOnUpdateStrategist()");
                                return cb(messages.internalServerError, messages.INTERNAL_SERVER_ERROR);
                            }
                            return cb(null, checkUserAssigned);
                        });
                        //    return cb(null, checkUserAssigned);
                    });
                } else {
                    return cb(null, checkUserAssigned);
                }
            });
        }
    });
}

StrategistService.prototype.deleteStrategistOnUnSubscribe = function (inputData, strategist, authorizationHeaders, cb) {
    logger.debug('delete strategist on unsubscribe service called (deleteStrategistOnUnSubscribe())');
    var baseUrl = 'http://' + eclipseProperties.host + ':' + eclipseProperties.port + '/v1/community/strategists';
    var url = {
        url: baseUrl + '/' + strategist.id,
        headers: {
            'Authorization': authorizationHeaders
        },
        timeout: 36000
    };
    request.delete(url, function (err, response, body) {
        logger.debug('response from eclipse on delete strategist ' + response.body);
        if (response.statusCode != 200) {
            var responseBody = JSON.parse(response.body);
            return cb(responseBody.message, response.statusCode, responseBody.message);
        } else {
            return cb(null, responseCode.SUCCESS, messages.strategistUnsubscribedSuccessfully);
        }
    });
}

StrategistService.prototype.deleteStrategistModelsFromEclipse = function (inputData, strategistModelResult, cb) {
    logger.debug('Delete strategist models from eclipse service called deleteStrategistModelsFromEclipse()');
    if (strategistModelResult && strategistModelResult.length > 0) {
        asyncFor(strategistModelResult, function (model, index, next) {
            inputData.modelObj = model;
            inputData.modelId = model.id;
            util.modelUpdateNotificationJob(inputData, function (err, status, result) {
                if (err) {
                    return next(err);
                }
                return next(err, result);
            });
        }, function (err, data) {
            return cb(null, responseCode.SUCCESS, {
                message: "SUCCESS"
            });
        });
    } else {
        logger.debug('No Strategist models found in deleteStrategistModelsFromEclipse()');
        return cb(null);
    }
}


module.exports = StrategistService;