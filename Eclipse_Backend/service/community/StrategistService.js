"use strict";

var moduleName = __filename;
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var cbCaller = helper.cbCaller;
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var util = require('util');
var StrategistDao = require('dao/community/StrategistDao.js');
var StrategistConverter = require("converter/community/StrategistConverter.js");
var strategistDao = new StrategistDao();
var strategistConverter = new StrategistConverter();

var StrategistService = function () { };

StrategistService.prototype.getList = function (inputData, cb) {
    logger.info("Get Strategist  list service called (getList())");

    strategistDao.getList(inputData, function (err, fetched) {
        if (err) {
            logger.error("Getting Strategist  list (getList()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            strategistConverter.getResponseModelOfStrategistList(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in getting Strategist list (getList()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Strategist List returned successfully (getList())");
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.info("Empty Strategist List returned (getList())");
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

StrategistService.prototype.addStrategist = function (data, cb) {
    logger.info("Add Strategist service called (updateStrategist())");
    var self = this;
    self.validateCommunityStrategist(data, function (err, exist) {
        if (err) {
            logger.error("Error in validate community strategist (addStrategist()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (exist.status) {
            strategistDao.updateStrategist(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in updating / adding Strategist (addStrategist()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (fetched) {
                    //   data.communityStrategistId = data.id;
                    self.getStrategistDetails(data, function (err, result) {
                        if (err) {
                            logger.error("Error in Geting Strategist Details(addStrategist()) " + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (result) {
                            return cb(null, responseCode.SUCCESS, result);
                        }
                    });
                }
            });
        } else {
            strategistDao.addStrategist(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in adding Strategist (addStrategist()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (fetched) {
                    // data.communityStrategistId = data.id;
                    self.getStrategistDetails(data, function (err, result) {
                        if (err) {
                            logger.error("Error in Geting Strategist Details(addStrategist()) " + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (result) {
                            return cb(null, responseCode.CREATED, result);
                        }
                    });
                }
            });
        }
    });
};

StrategistService.prototype.getStrategistDetails = function (data, cb) {
    logger.info("Update Strategist service called (getStrategistDetails())");
    var self = this;
    strategistDao.getStrategistDetails(data, function (err, fetched) {
        if (err) {
            logger.error("Error in geting Strategist Details (getStrategistDetails()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            strategistConverter.getResponseModelOfStrategistDetails(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in converting Strategist Details (getStrategistDetails()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (result) {
                    return cb(null, result);
                }
            });
        }
    });
};

StrategistService.prototype.updateStrategist = function (data, cb) {
    logger.info("Update Strategist service called (updateStrategist())");
    var self = this;
    self.validateCommunityStrategist(data, function (err, exist) {
        if (err) {
            logger.error("Error in validate community strategist (updateStrategist()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (exist.status) {
            strategistDao.updateStrategist(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in updating Strategist (updateStrategist()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (fetched) {
                    self.getStrategistDetails(data, function (err, result) {
                        if (err) {
                            logger.error("Error in Geting Strategist Details(updateStrategist()) " + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (result) {
                            return cb(null, responseCode.SUCCESS, result);
                        }
                    });
                }
            });
        } else {
            logger.debug("Strategist does not exist (updateStrategist()) " + data.strategistId);
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
};

StrategistService.prototype.deleteStrategist = function (data, cb) {
    logger.info("Delete Strategist service called (deleteStrategist())");
    var self = this;
    var counter = 1;
    self.validateCommunityStrategist(data, function (err, exist) {
        if (err) {
            logger.error("Error in validate community strategist (deleteStrategist()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (exist.status) {
            data.strategistId = exist.strategistId;
            strategistDao.validateCommunityStrategistModels(data, function (err, modelExist) {
                if (err) {
                    logger.error("Error in validate community strategist models (deleteStrategist()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (modelExist.length > 0) {
                    counter = 2;
                }
                var cbfn = cbCaller(counter, function (err, data) {
                    if (err) {
                        logger.error("Error in Delete Strategists Models (deleteStrategist()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    return cb(null, responseCode.SUCCESS, { "message": messages.strategistDeleted });
                });
                if (modelExist.length > 0) {
                    data.models = modelExist;
                    strategistDao.deleteStrategistModels(data, function (err, deletedModels) {
                        if (err) {
                            logger.error("Error in Delete Strategists Models (deleteStrategist()) " + err);
                            return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        strategistDao.deleteStragistFromPreference(data, function (err, record) {
                            if (err) {
                                logger.error("Error in Delete Stragist From Preference (deleteStrategist()) " + err);
                                return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            strategistDao.deleteModelsFromModels(data, function (err, models) {
                                if (err) {
                                    logger.error("Error in Delete Models From Preference (deleteStrategist()) " + err);
                                    return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                strategistDao.deleteModelsFromPreference(data, function (err, models) {
                                    if (err) {
                                        logger.error("Error in Delete Models From Preference (deleteStrategist()) " + err);
                                        return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    return cbfn(null, null);
                                });
                            });
                        });
                    });
                }
                // else {
                //     console.log("********ELSE********")
                //     return cbfn(null, null);
                // }
                strategistDao.deleteStrategist(data, function (err, result) {
                    if (err) {
                        logger.error("Error in delete Strategist (deleteStrategist()) " + err);
                        return fn(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    return cbfn(null, null);
                    //return cb(null, responseCode.SUCCESS, { "message": messages.strategistDeleted });
                    // return cb(messages.strategistDeleted, responseCode.SUCCESS);
                });
            });

        } else {
            logger.debug("Strategist does not exist (deleteStrategist()) " + data.strategistId);
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
};

StrategistService.prototype.addStrategistModels = function (data, cb) {
    logger.info("Add Strategist Model service called (addStrategistModels()) ");
    var self = this;
    self.validateCommunityStrategist(data, function (err, exist) {
        if (err) {
            logger.error("Error in validate community strategist (addStrategistModels()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (exist.status) {
            data.strategistId = exist.strategistId;
            strategistDao.addStrategistModels(data, function (err, result) {
                if (err) {
                    logger.error("Error in Add Strategists Models (addStrategistModels()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (result && result.affectedRows > 0) {
                    self.getCommunityModelDetail(data, function (err, fetched) {
                        if (err) {
                            logger.error("Error in getting  Strategists Models details(addStrategistModels()) " + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        return cb(null, responseCode.CREATED, fetched);
                    });
                } else {
                    logger.debug("Strategist does not exist (addStrategistModels()) " + data.strategistId);
                    return cb(messages.modelDuplicate, responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.debug("Strategist does not exist (addStrategistModels()) " + data.strategistId);
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
};

StrategistService.prototype.updateStrategistModels = function (data, cb) {
    logger.info("Update Strategist Model service called (updateStrategistModels()) ");
    var self = this;
    self.validateCommunityStrategist(data, function (err, exist) {
        if (err) {
            logger.error("Error in validate community strategist (updateStrategistModels()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (exist.status) {
            data.strategistId = exist.strategistId;
            strategistDao.updateStrategistModels(data, function (err, result) {
                if (err) {
                    logger.error("Error in Update Strategists Models (updateStrategistModels()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                self.getCommunityModelDetail(data, function (err, fetched) {
                    if (err) {
                        logger.error("Error in getting  Strategists Models details(addStrategistModels()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    return cb(null, responseCode.SUCCESS, fetched);
                });
            });
        } else {
            logger.debug("Strategist does not exist (updateStrategistModels()) " + data.strategistId);
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
};

StrategistService.prototype.deleteStrategistModels = function (data, cb) {
    logger.info("Delete Strategist Model service called (deleteStrategistModels()) ");
    var self = this;
    self.validateCommunityStrategist(data, function (err, exist) {
        if (err) {
            logger.error("Error in validate community strategist (deleteStrategistModels()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (exist.status) {
            data.strategistId = exist.strategistId;
            strategistDao.deleteStrategistModels(data, function (err, result) {
                if (err) {
                    logger.error("Error in Delete Strategists Models (deleteStrategistModels()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.SUCCESS, { "message": messages.strategistModeldeleted });
                //  return cb(messages.strategistModeldeleted, responseCode.CREATED);
            });
        } else {
            logger.debug("Strategist does not exist (deleteStrategistModels()) " + data.strategistId);
            return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
        }
    });
};

StrategistService.prototype.getApprovedStrategistList = function (inputData, cb) {
    logger.info("Get Approved Strategist list service called (getApprovedStrategistList())");

    strategistDao.getApprovedStrategistList(inputData, function (err, fetched) {
        if (err) {
            logger.error("Getting Approved Strategist  list (getApprovedStrategistList()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            strategistConverter.getResponseModelOfStrategistList(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in getting Approved Strategist list (getApprovedStrategistList()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Approved Strategist List returned successfully (getApprovedStrategistList())");
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.info("Empty Approved Strategist List returned (getApprovedStrategistList())");
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

StrategistService.prototype.validateCommunityStrategist = function (data, cb) {
    logger.info("Validate strategist service called (validateStrategist())");
    var result;
    strategistDao.validateCommunityStrategist(data, function (err, fetched) {
        if (err) {
            logger.error("Error in validate community strategist (validateCommunityStrategist())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.count > 0) {
            result = {
                status: true,
                strategistId: fetched.strategistId
            };
            return cb(null, result);
        } else {
            result = {
                status: false,
                strategistId: fetched.strategistId
            };
            return cb(null, result);
        }
    });
};

StrategistService.prototype.validateCommunityStrategistModels = function (data, cb) {
    logger.info("Validate community Strategist Models service called (validateCommunityStrategistModels())");
    var status = false;
    strategistDao.validateCommunityStrategistModels(data, function (err, fetched) {
        if (err) {
            logger.error("Error in validate strategist Models (validateCommunityStrategistModels())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.count > 0) {
            status = true;
            return cb(null, status);
        } else {
            return cb(null, false);
        }
    });
};

StrategistService.prototype.validateStrategist = function (data, cb) {
    logger.info("Validate strategist service called (validateStrategist())");
    var status = false;
    strategistDao.validateStrategist(data, function (err, fetched) {
        if (err) {
            logger.error("Error in validate strategist (validateStrategist())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.count > 0) {
            status = true;
            return cb(null, status);
        } else {
            return cb(null, false);
        }
    });
};

StrategistService.prototype.validateApprovedStrategist = function (data, cb) {
    logger.info("Validate approved strategist service called (validateApprovedStrategist())");

    strategistDao.validateApprovedStrategist(data, function (err, fetched) {
        if (err) {
            logger.error("Error in validate approved strategist (validateApprovedStrategist())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            return cb(null, fetched);
        } else {
            return cb(null, fetched);
        }
    });
};

StrategistService.prototype.getCommunityModelDetail = function (data, cb) {
    logger.info("Update Strategist service called (getStrategistDetails())");
    var self = this;
    strategistDao.getCommunityModelDetail(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting Strategist Model Details (getCommunityModelDetail()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            strategistConverter.getCommunityModelDetailResponse(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in converting Strategist Details (getStrategistDetails()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (result) {
                    return cb(null, result);
                }
            });
        }
    });
};

module.exports = StrategistService;