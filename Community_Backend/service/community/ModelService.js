"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var _ = require('underscore');
var config = require('config');
var helper = require("helper");
var baseDao = require('dao/BaseDao.js');
var constants = config.orionConstants;
var env = config.env.prop;
var util = require('util');
var UtilCommunity = require('service/util/Util.js');
var utilCommunity = new UtilCommunity();
var asyncLoop = require('node-async-loop');
var asyncFor = helper.asyncFor;
var localCache = require('service/cache').local;
var messages = config.messages;
var responseCode = config.responseCode;
var node_ssh = require('node-ssh');
var shell = require('shelljs/global');
var ssh = new node_ssh();

var poolService = require('service/dbpool/PoolService.js');
var ModelDao = require('dao/community/ModelDao.js');
var modelDao = new ModelDao();
var UserDao = require('dao/community/UserDao.js');
var userDao = new UserDao();
var StrategistDao = require('dao/community/StrategistDao.js');
var strategistDao = new StrategistDao();
var ModelResponse = require("model/community/model/ModelResponse.js");
var UploadFileUtil = require('service/util/UploadFileUtil.js');
var uploadFileUtil = new UploadFileUtil();

var ModelService = function () {};

ModelService.prototype.getModelList = function (inputData, cb) {
    logger.info("Get community model list service called (getModelList())");
    modelDao.getList(inputData, function (err, fetched) {
        if (err) {
            logger.error("Getting community model list (getModelList()) " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        return cb(null, responseCode.SUCCESS, new ModelResponse(fetched));
    });
};

ModelService.prototype.getModelDetail = function (inputData, cb) {
    logger.info("Get community model details service called (getModelDetail())");
    var self = this;
    //check the role of loggedIn user
    userDao.getLoggedInUserRole(inputData, function (err, userRoleDetails) {
        if (err) {
            logger.debug('Error in getLoggedInUserRole ' + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (userRoleDetails && userRoleDetails.length > 0) {
            if (userRoleDetails[0].roleType != 'Firm Admin') {
                if (inputData.modelId) {
                    modelDao.getModelDetail(inputData, function (err, fetched) {
                        if (err) {
                            logger.error("Getting community model (getModelDetail())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (fetched.length > 0 && fetched) {
                            logger.info("Preparing community model  (getModelDetail())" + JSON.stringify(fetched));
                            self.getModelSecurities(inputData, function (err, details) {
                                if (err) {
                                    logger.error("Getting community model securities (getModelDetail())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                fetched[0].securities = [];
                                fetched[0].securities = details;
                                return cb(null, responseCode.SUCCESS, fetched[0]);
                            });
                        } else {
                            logger.info("community model Detail not found (getModelDetail())" + inputData.id);
                            return cb(messages.communityModelNotFound, responseCode.NOT_FOUND);
                        }
                    });
                } else {
                    logger.info("community model Detail not found (getModelDetail())" + inputData.id);
                    return cb(messages.communityModelNotFound, responseCode.NOT_FOUND);
                }
            }
        } else {
            return cb(messages.userNotFound, responseCode.NOT_FOUND);
        }
    });
};

ModelService.prototype.getModelDetailMultiple = function (inputData, cb) {
    logger.info("Get community model details service called (getModelDetail())");
    var self = this;
    logger.info("this is to check the input data." + JSON.stringify(inputData.modelId));
    if (!isNaN(inputData.modelIds)) {
        modelDao.getModelDetailsMultiple(inputData, function (err, fetched) {
            if (err) {
                logger.error("Getting community model (getModelDetail())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            return cb(null, responseCode.SUCCESS, fetched[0]);
        });
    } else {
        logger.info("community model Detail not found (getModelDetail())" + inputData.id);
        return cb(messages.communityModelNotFound, responseCode.NOT_FOUND);
    }
};

ModelService.prototype.addModel = function (inputData, cb) {
    logger.info("Create Community Model service called  (addModel())");

    var self = this;
    if (inputData.name) {
        modelDao.get(inputData, function (err, fetched) {
            if (err) {
                logger.error("Getting Community model (addModel())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched && fetched.length > 0) {
                logger.error("Community model already exist with name(addModel())" + inputData.name);
                return cb(messages.communityModelAlreadyExist, responseCode.UNPROCESSABLE);
            } else {
                modelDao.add(inputData, function (err, added) {
                    if (err) {
                        logger.error("Adding Community model (addModel())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    inputData.id = added.insertId;
                    logger.info("Community model created successfully  (addModel())");
                    self.getModelDetail(inputData, function (err, code, fetched) {
                        if (err) {
                            return cb(err, code);
                        }
                        return cb(null, responseCode.CREATED, fetched);
                    });
                });
            }
        });
    } else {
        logger.info("Missing Required Parameters for add Community model  (addModel())");
        return cb(messages.missingParameters, responseCode.BAD_REQUEST);
    }
};

/*ModelService.prototype.updateModel = function (inputData, cb) {
    logger.info("Update Community model service called (updateModel())");

    var self = this;
    if (inputData.name) {
        modelDao.get(inputData, function (err, fetched) {
            if (err) {
                logger.error("Getting Community model (updateModel())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.debug("fetched Community model is" + JSON.stringify(fetched));
            if (fetched && fetched.length > 0 && ((fetched[0].id != inputData.id && fetched[0].name === inputData.name) ||
                    fetched[1] && fetched[1].name === inputData.name)) {
                logger.error("Model already exist with name(updateModel())" + inputData.name);
                return cb(messages.communityModelAlreadyExist, responseCode.UNPROCESSABLE);
            } else {
                modelDao.update(inputData, function (err, updated) {
                    if (err) {
                        logger.error("Updating Community model (updateModel())" + JSON.stringify(err));
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    logger.info(" Community Model updated successfully  (updateMode())");
                    self.getModelDetail(inputData, function (err, code, fetched) {
                        if (err) {
                            return cb(err, code);
                        }
                        return cb(null, responseCode.SUCCESS, fetched);
                    });
                });
            }
        });
    } else {
        logger.info("Missing Required Parameters for update Community Model   (updateMode())");
        return cb(messages.missingParameters, responseCodes.BAD_REQUEST);
    }
};*/

ModelService.prototype.deleteModel = function (inputData, cb) {
    logger.info("Delete Community Model service called (deleteModel())");
    var self = this;
    inputData.connection = {};
    inputData.connection.common = baseDao.getCommonDBConnection(inputData);
    inputData.connection.community = baseDao.getCommunityDBConnection(inputData);
    if (inputData.modelId) {
        modelDao.getModelDetail(inputData, function (err, modelDetails) {
            if (err) {
                logger.error("Deleting Community Model (deleteModel())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (modelDetails && modelDetails.length > 0) {
                inputData.modelObj = modelDetails[0];
                utilCommunity.modelUpdateNotificationJob(inputData, function (err, status, updateModelResult) {});
                modelDao.delete(inputData, function (err, deleted) {
                    if (err) {
                        logger.error("Deleting Community Model (deleteModel())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (deleted.affectedRows > 0) {
                        logger.info("Community Model  deleted successfully (deleteModel())" + inputData.id);
                        return cb(null, responseCode.SUCCESS, {
                            "message": messages.communityModelDeleted
                        });
                    } else {
                        logger.info("Model not found (deleteModel())" + inputData.id);
                        return cb(messages.communityModelNotFoundOrDeleted, responseCode.NOT_FOUND);
                    }
                });
            } else {
                logger.info("Model not found (deleteModel())" + inputData.id);
                return cb(messages.communityModelNotFoundOrDeleted, responseCode.NOT_FOUND);
            }   
        });
    } else {
        logger.info("Missing required parameters (deleteModel())" + inputData.id);
        return cb(messages.missingParameters, responseCode.BAD_REQUEST)
    }
};

ModelService.prototype.getModelSecurities = function (inputData, cb) {
    logger.debug('get securities of models serivce called (getModelSecurities())');
    var self = this;
    modelDao.getModelSecurityId(inputData, function (err, securityIds) {
        if (err) {
            logger.error('error in get model securities (getModelSecurities())' + err);
            return cb(err);
        }
        if (securityIds && securityIds.length > 0) {
            modelDao.getModelSecurity(inputData, securityIds, function (err, securityDetails) {
                if (err) {
                    logger.error('error in get model securities (getModelSecurities())' + err);
                    return cb(err);
                }
                return cb(null, securityDetails);
            });
        } else {
            return cb(null, securityIds);
        }
    });
}

ModelService.prototype.getModelMasterListStatus = function (inputData, cb) {
    logger.debug('get models master status list serivce called (getModelMasterListStatus())');
    var self = this;
    modelDao.getMasterListStatus(inputData, function (err, statusList) {
        if (err) {
            logger.error('models master status list (getModelMasterListStatus())' + err);
            return cb(err);
        }
        logger.debug('statusList are ' + statusList);
        return cb(null, responseCode.SUCCESS, statusList);
    });
}

ModelService.prototype.updateModel = function (req, cb) {
    logger.debug('Update model service called (updateModel())');
    /**
     * 1. get modelSecurityMappingsByModelId
     * 2. update securities already present in db
     * 3. insert securities not in db
     * 4. delete securities not in request
     */

    //updating model first
    var self = this;
    var inputData = req.data;
    if (inputData.id) {
        modelDao.getModelDetail(inputData, function (err, data) {
            if (err) {
                logger.error("Error occurred while updating model  service updateModel() ", err);
                return cb(messages.internalServerError, responseCode.internalServerError);
            }
            if (data && data.length > 0) {
                uploadFileUtil.contentValidation(inputData, function (modelVerifyerr, modelVerify) {
                    if (modelVerifyerr && modelVerifyerr.length > 0) {
                        logger.error("Error occurred while verifying model  service updateModel() ", modelVerifyerr);
                        return cb(null, responseCode.UNPROCESSABLE, modelVerifyerr);
                    }
                    modelDao.updateModel(inputData, function (err, data) {
                        if (err) {
                            logger.error("Error occurred while updating model  service updateModel() ", err);
                            return cb(messages.internalServerError, responseCode.internalServerError);
                        }
                        modelDao.getModelSecurityMappingById(inputData, function (err, data) {
                            if (err) {
                                logger.error("Error loading model securities mapping");
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            if (data.length > 0) {
                                var securitiesInDb = getSecuritiesInDb(data);
                                var securityInRequest = getSecuritiesInRequest(req.data);

                                logger.info('securities in db : ' + securitiesInDb.join());
                                logger.info('securities in Request : ' + securityInRequest.join());

                                modelDao.checkSymbolById(req, securityInRequest, function (err, data) {
                                    if (err) {
                                        logger.debug('Error occurred while validating request security symbol in db');
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    var invalidSymbolIdList = _.difference(securityInRequest, data);
                                    logger.debug('invalid invalidSymbolIdList ' + invalidSymbolIdList);

                                    if (invalidSymbolIdList.length > 0) {
                                        logger.debug('Security not found in security table. Following invalid Security ids : ' + invalidSymbolIdList);
                                        return cb(null, responseCode.NOT_FOUND, {
                                            'message': 'Following security Id does not exists :' + invalidSymbolIdList.join()
                                        });
                                    } else {
                                        /** execute update model and security here */
                                        var securityNotInDb = _.difference(securityInRequest, securitiesInDb);
                                        var securityNotInRequest = _.difference(securitiesInDb, securityInRequest);

                                        logger.info('securities not in db : ' + securityNotInDb.join());
                                        logger.info('securities not in Request : ' + securityNotInRequest.join());
                                        //run update model job for notification
                                        utilCommunity.modelUpdateNotificationJob(inputData, function (err, result) {});
                                        if (securityNotInDb.length > 0) {
                                            modelDao.addSecurityToModel(req, securityNotInDb, function (err, data) {
                                                if (err) {
                                                    logger.debug("Failed to add model security due to ", err);
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }

                                                var securityNotInRequest = _.difference(securitiesInDb, securityInRequest);
                                                if (securityNotInRequest.length > 0) {
                                                    logger.info('soft delete securities in db but not in request : ' + securityInRequest.join());
                                                    modelDao.softDeleteSecurityModel(req, securityNotInRequest, function (err, data) {
                                                        if (err) {
                                                            logger.debug("Failed to updated model security due to ", err);
                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                        }
                                                        logger.info('update securities in db : ' + securityInRequest.join());
                                                        //finally updated all model in db
                                                        modelDao.updateSecurityToModel(req, securityInRequest, function (err, data) {
                                                            if (err) {
                                                                logger.debug("Failed to updated model security due to ", err);
                                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                            }
                                                            self.getModelDetail(inputData, function (err, status, modelDetail) {
                                                                if (err) {
                                                                    logger.debug("Failed to updated model security due to ", err);
                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                                }
                                                                return cb(err, status, modelDetail);
                                                            });
                                                        });
                                                    });
                                                }

                                            });
                                        } else if (securityNotInRequest.length > 0) {
                                            logger.info('soft delete securities in db but not in request : ' + securityInRequest.join());
                                            modelDao.softDeleteSecurityModel(req, securityNotInRequest, function (err, data) {
                                                if (err) {
                                                    logger.debug("Failed to soft delete security due to ", err);
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                logger.info('update securities in db : ' + securityInRequest.join());
                                                modelDao.updateSecurityToModel(req, securityInRequest, function (err, data) {
                                                    if (err) {
                                                        logger.debug("Failed to updated model security due to ", err);
                                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                    }
                                                    self.getModelDetail(inputData, function (err, status, modelDetail) {
                                                        if (err) {
                                                            logger.debug("Failed to updated model security due to ", err);
                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                        }
                                                        return cb(err, status, modelDetail);
                                                    });
                                                });
                                            });
                                        } else {
                                            modelDao.updateSecurityToModel(req, securityInRequest, function (err, data) {
                                                if (err) {
                                                    logger.debug("Failed to updated model security due to ", err);
                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                self.getModelDetail(inputData, function (err, status, modelDetail) {
                                                    if (err) {
                                                        logger.debug("Failed to updated model security due to ", err);
                                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                                    }
                                                    return cb(err, status, modelDetail);
                                                });
                                            });
                                        }
                                    } //out if else
                                }); //check symbol by id
                            } else {
                                logger.debug("Failed to updated model security non existing model id.");
                                return cb(messages.nonExistingModel, responseCode.NOT_FOUND);
                                //no securities found for model id
                            }
                        }); //model security by mapping id
                    }); //update model
                }); //content validation
            } else {
                return cb(messages.communityModelNotFound, responseCode.NOT_FOUND);
            }
        })
    } else {
        return cb(messages.communityModelNotFound, responseCode.NOT_FOUND);
    }
}

function getSecuritiesInDb(data) {
    var securitiesIdArray = [];
    for (var id in data) {
        securitiesIdArray.push(data[id].securityId);
    }
    return securitiesIdArray;
}

function getSecuritiesInRequest(data) {
    var securitiesIdArray = [];
    var securities = data.securities;
    for (var id in securities) {
        securitiesIdArray.push(securities[id].id);
    }
    return securitiesIdArray;
}

ModelService.prototype.createModelUsingImport = function (req, res, dataToInsert, cb) {
    req.data.connection = {};
    req.data.connection.community = baseDao.getCommunityDBConnection(req.data);
    req.data.connection.common = baseDao.getCommonDBConnection(req.data);
    var symbolArray = [];
    var self = this;
    dataToInsert.forEach(function (model) {
        var securities = model.securities;
        securities.forEach(function (security) {
            symbolArray.push(security.symbol.toUpperCase());
        });
    });

    modelDao.checkSymbol(req, symbolArray, function (err, data) {
        if (err) {
            return cb(err, message.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.debug(JSON.stringify(data));
        var k = [];
        for (var t in data) {
            k.push(data[t].symbol);
        }
        logger.info(symbolArray);
        var na = _.difference(symbolArray, k);

        if (na.length > 0) {
            var errorArray = [];
            var error = {
                'message': 'Following symbols missing : ' + JSON.stringify(na)
            }
            logger.error(JSON.stringify(error));
            errorArray.push(error);
            return cb(null, responseCode.BAD_REQUEST, errorArray);
        }
        modelDao.createModelUsingImport(req, res, dataToInsert, function (err, statusCode, status, data) {
            logger.debug('ids received after insertion ' + JSON.stringify(data));
            var before = req.data;
            if (err) {
                logger.error("Error while importing model in model service (createModelUsingImport())" + err);
                return cb(err, statusCode, status);
            }
            if (statusCode == 'DUPLICATE_ENTRY') {
                return cb(null, responseCode.UNPROCESSABLE, data);
            }
            logger.info("Model creation via file import service returned successfully (createModelUsingImport())");

            var outputModel = [];
            var errLog = [];
            var inputData = req.data;

            var fetched = [];
            var count = 0;
            if (data && data.length > 0) {
                asyncLoop(data, function (model, next) {
                    logger.debug('model id in loop ' + model);
                    inputData.modelId = model;
                    self.getModelDetail(inputData, function (err, statusCode, modelDetail) {
                        if (err) {
                            logger.error("Getting community model (getModelDetail())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        fetched.push(modelDetail);
                        next(null);
                    });
                }, function (err) {
                    if (err) {
                        logger.error("Getting community model (getModelDetail())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    self.updateFirms(inputData, data, function (err, result) {});
                    return cb(null, responseCode.SUCCESS, fetched);
                });

            }
        });
    });
}

ModelService.prototype.createModelUsingForm = function (req, cb) {
    req.data.connection = {};
    req.data.connection.community = baseDao.getCommunityDBConnection(req.data);
    req.data.connection.common = baseDao.getCommonDBConnection(req.data);
    var dataToInsert = req.data;
    var symbolArray = [];
    var self = this;
    dataToInsert.securities.forEach(function (security) {
        symbolArray.push(security.symbol);
    });
    modelDao.checkSymbol(req, symbolArray, function (err, data) {
        if (err) {
            logger.error("getting Symbol information: " + err);
            return cb(err);
        }
        logger.debug(JSON.stringify(data));
        var k = [];
        for (var t in data) {
            k.push(data[t].symbol.toUpperCase());
        }
        logger.info(symbolArray);
        var na = _.difference(symbolArray, k);

        if (na.length > 0) {
            var error = {
                'message': 'Following symbols missing : ' + na
            }
            return cb(null, 'MISSING SYMBOL', error, error);
        }

        modelDao.createModelUsingForm(req, dataToInsert, function (err, statusCode, status, result) {
            if (err) {
                return cb(err, statusCode, status);
            }
            if (statusCode == 'DUPLICATE_ENTRY') {
                return cb(null, responseCode.UNPROCESSABLE, result, result);
            }
            if (result && result.length > 0) {
                dataToInsert.modelId = parseInt(result[0]);
                self.getModelDetail(dataToInsert, function (err, status, result) {
                    if (err) {
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    utilCommunity.modelUpdateNotificationJob(dataToInsert, function (err, result) {});
                    return cb(null, responseCode.SUCCESS, result, result);
                });
            } else {
                return cb(messages.communityModelNotFound, responseCode.NOT_FOUND, responseCode.NOT_FOUND);
            }
        });
    });
};


ModelService.prototype.verifyModel = function (inputData, cb) {
    logger.info("verify model service called (verifyModel()) " + JSON.stringify(inputData));
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

        if (result[0].id) {
            return cb(null, responseCode.EXISTS, result);
        }
    });
}

/**Strategist Model commentary services */

// ModelService.prototype.addCommentary = function(req, cb){
//     if(req.params.id == undefined || isNaN(req.params.id)){
//         return cb(messages.emptyModelId, responseCode.BAD_REQUEST);
//     }
//     if(req.data.commentary == undefined || req.data.commentary == ''){
//         return cb(messages.emptyCommentary, responseCode.BAD_REQUEST);
//     }
//     var modelId = req.params.id; 
//     req.params.id = parseInt(modelId);

//     logger.info("Add Strategist model commentary service request received addCommentary()");
//     modelDao.addCommentary(req, function(err, result){
//       if(err){
//          if(err == 'Model does not exist'){
//              return cb(messages.nonExistingModel, responseCode.NOT_FOUND);
//          } 
//          logger.error("Failed to add Strategist model commentary caused by ", err);
//          return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//       }
//           return cb(null, responseCode.SUCCESS, {"message" : messages.modelAdvertisementAdded});  
//     });        
// }

ModelService.prototype.addCommentary = function (req, cb) {
    var self = this;
    if (req.params.id == undefined || isNaN(req.params.id)) {
        return cb(messages.emptyModelId, responseCode.BAD_REQUEST);
    }
    if (req.data.commentary == undefined || req.data.commentary == '') {
        return cb(messages.emptyCommentary, responseCode.BAD_REQUEST);
    }
    var modelId = req.params.id;
    req.params.id = parseInt(modelId);

    logger.info("Add Strategist model commentary service request received addCommentary()");
    modelDao.addCommentary(req, function (err, result) {
        if (err) {
            if (err == 'Model does not exist') {
                return cb(messages.nonExistingModel, responseCode.NOT_FOUND);
            }
            logger.error("Failed to add Strategist model commentary caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        self.getCommentary(req, function (err, code, result) {
            if (err) {
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            return cb(null, code, result);
        });
    });
}

ModelService.prototype.deleteCommentary = function (req, cb) {
    if (req.params.id == undefined || isNaN(req.params.id)) {
        return cb('Missing or Invalid Model Id', responseCode.BAD_REQUEST);
    }
    var modelId = req.params.id;
    req.params.id = parseInt(modelId);
    logger.info("Delete Strategist model commentary service request received deleteCommentary()");
    modelDao.deleteCommentary(req, function (err, result) {
        if (err) {
            logger.error("Failed to delete Strategist model commentary caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result['affectedRows'] == 1 && result['changedRows'] == 1) {
            logger.info("successfully deleted model commentary.");
            return cb(null, responseCode.SUCCESS, {
                "message": messages.modelCommentaryDeleted
            });
        }
        if (result['affectedRows'] == 1 && result['changedRows'] == 0) {
            logger.info("Model already commentary already exists.");
            return cb(messages.modelCommentaryAlreadyDeleted, responseCode.DUPLICATE_ENTRY);
        }
        return cb('Model not found.', responseCode.NOT_FOUND);
    })
}

ModelService.prototype.updateCommentary = function (req, cb) {
    if (req.params.id == undefined || isNaN(req.params.id)) {
        return cb(messages.emptyModelId, responseCode.BAD_REQUEST);
    }
    if (req.data.commentary == undefined || req.data.commentary == '') {
        return cb(messages.emptyCommentary, responseCode.BAD_REQUEST);
    }
    var modelId = req.params.id;
    req.params.id = parseInt(modelId);

    logger.info("Add Strategist model commentary service request received addCommentary()");
    modelDao.updateCommentary(req, function (err, result) {
        if (err) {
            logger.error("Failed to add Strategist model commentary caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result['affectedRows'] == 1) {
            logger.info("successfully updated model commentary.");
            return cb(null, responseCode.SUCCESS, {
                "message": messages.modelCommentaryUpdated
            });
        }
        return cb(null, responseCode.SUCCESS, messages.modelCommentaryUpdated);
    })
}

ModelService.prototype.getCommentary = function (req, cb) {
    if (req.params.id == undefined || isNaN(req.params.id)) {
        return cb('Missing or Invalid Model Id', responseCode.BAD_REQUEST);
    }
    var modelId = req.params.id;
    req.params.id = parseInt(modelId);
    logger.info("Get Strategist model commentary service request received getCommentary()");
    modelDao.getCommentary(req, function (err, result) {
        if (err) {
            logger.error("Failed to Get Strategist model commentary caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.length == 0 || result[0].id == undefined) {
            logger.error("Failed to Get Strategist model commentary caused by ", err);
            return cb(messages.nonExistingModel, responseCode.NOT_FOUND);
        }
        var result = result[0];
        var modelCommentary = {
            modelId: result.id,
            modelName: result.name,
            commentary: result.commentary
        };

        return cb(null, responseCode.SUCCESS, modelCommentary);
    });
}


/**Strategist Model performance services */
ModelService.prototype.getPerformanceDetails = function (req, cb) {
    var self = this;
    if (req.params.value == undefined) {
        return cb('Missing or Invalid Model Id', responseCode.BAD_REQUEST);
    } else if (isNaN(req.params.value)) {
        self.getPerformanceDetailsFromModelName(req, function (err, code, result) {
            if (err) {
                logger.error("Failed to Get Strategist model commentary caused by ", err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }

            return cb(null, responseCode.SUCCESS, result);
        });
    } else {
        var modelId = req.params.value;
        req.params.id = modelId;
        req.data.modelId = parseInt(modelId);
        logger.info("Get Strategist model performance service request received getCommentary()");
        self.verifyModel(req.data, function (err, code, result) {

            if (err) {
                logger.error("Error occured while verifying model " + err);
                return cb(err, code);
            }


            modelDao.getPerformanceDetails(req, function (err, result) {
                if (err) {
                    logger.error("Failed to Get Strategist model commentary caused by ", err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }

                if (result.length) {
                    for (var i = 0; i < result.length; i++) {
                        result[i].asOnDate = result[i].asOnDate.mmddyyyy();
                    }
                }

                return cb(null, responseCode.SUCCESS, result);
            });
        });
    }
}

ModelService.prototype.getPerformanceDetailsFromModelName = function (req, cb) {
    var self = this;
    var modelName = req.params.value;
    req.data.modelName = modelName;

    self.getStrategistIdFromUserId(req, function (err, responseCode, strategistData) {
        if (err) {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }

        req.data.strategistId = strategistData.strategistId;

        logger.info("Get Strategist model performance from model name service request received getPerformanceDetailsFromModelName()");
        modelDao.getPerformanceDetailsFromModelName(req, function (err, result) {
            if (err) {
                logger.error("Failed to Get Strategist model commentary caused by ", err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }

            if (result.length) {
                for (var i = 0; i < result.length; i++) {
                    result[i].asOnDate = result[i].asOnDate.mmddyyyy();
                }
            }

            return cb(null, responseCode.SUCCESS, result);
        });
    });
}


ModelService.prototype.getStrategistIdFromUserId = function (req, cb) {
    logger.debug('get strategist against users service called (getStrategistAgainstUsers())');
    req.data.assignedUserId = req.data.user.userId;
    strategistDao.getStrategistAgainstUsers(req.data, function (err, result) {
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

ModelService.prototype.addPerformance = function (req, cb) {

    if (req.params.modelId == undefined || isNaN(req.params.modelId)) {
        return cb(messages.emptyModelId, responseCode.BAD_REQUEST);
    }
    var modelId = req.params.modelId;
    req.data.modelId = parseInt(modelId);
    logger.info("Add Strategist model performance service request received addPerformance()");

    modelDao.addPerformance(req, function (err, result) {
        if (err) {
            if (err == 'Model does not exist') {
                return cb(messages.nonExistingModel, responseCode.NOT_FOUND);
            }
            logger.error("Failed to add Strategist model commentary caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result == undefined || result == null || result.length == 0) {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.length) {
            result[0].asOnDate = result[0].asOnDate.mmddyyyy();
        }
        return cb(null, responseCode.SUCCESS, result[0]);
    });
}

ModelService.prototype.updatePerformance = function (req, cb) {

    if (req.params.modelId == undefined || isNaN(req.params.modelId)) {
        return cb(messages.emptyModelId, responseCode.BAD_REQUEST);
    }
    var modelId = req.params.modelId;
    req.data.modelId = parseInt(modelId);
    logger.info("Update Strategist model performance service request received updatePerformance()");

    modelDao.updatePerformance(req, function (err, result) {
        if (err) {
            if (err == 'Model or Performance does not exist') {
                return cb(messages.nonExistingModelOrPerformance, responseCode.NOT_FOUND);
            }
            logger.error("Failed to add Strategist model commentary caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result == undefined || result == null || result.length == 0) {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.length) {
            result[0].asOnDate = result[0].asOnDate.mmddyyyy();
        }
        return cb(null, responseCode.SUCCESS, result[0]);
    });
}

ModelService.prototype.deletePerformance = function (req, cb) {

    if (req.params.modelId == undefined || isNaN(req.params.modelId)) {
        return cb('Missing or Invalid Model Id', responseCode.BAD_REQUEST);
    }
    if (req.params.performanceId == undefined || isNaN(req.params.performanceId)) {
        return cb('Missing or Invalid Model Id', responseCode.BAD_REQUEST);
    }
    var modelId = req.params.modelId;
    req.data.modelId = parseInt(modelId);
    var performanceId = req.params.performanceId;
    req.data.performanceId = parseInt(performanceId);
    logger.info("Delete Strategist model performance service request received deletePerformance()");

    modelDao.deletePerformance(req, function (err, result) {
        if (err) {
            logger.error("Failed to delete Strategist model commentary caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result['affectedRows'] == 1 && result['changedRows'] == 1) {
            logger.info("successfully deleted model performance.");
            return cb(null, responseCode.SUCCESS, {
                "message": messages.modelPerformanceDeleted
            });
        }
        if (result['affectedRows'] == 1 && result['changedRows'] == 0) {
            logger.info("Performance is already deleted.");
            return cb(messages.modelPerformanceAlreadyDeleted, responseCode.DUPLICATE_ENTRY);
        }
        return cb(messages.nonExistingModelOrPerformance, responseCode.NOT_FOUND);
    });
}


/**Strategist Model advertisement services */
ModelService.prototype.getAdvertisement = function (req, cb) {

    if (req.params.modelId == undefined || isNaN(req.params.modelId)) {
        return cb('Missing or Invalid Model Id', responseCode.BAD_REQUEST);
    }
    var modelId = req.params.modelId;
    req.data.modelId = parseInt(modelId);
    logger.info("Get Strategist model advertisement service request received getAdvertisement()");

    modelDao.getModel(req.data, function (err, result) {
        if (err) {
            logger.error("Failed to Get Strategist model commentary caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.length == 0 || result[0].id == undefined) {
            logger.error("Failed to Get Strategist model commentary caused by ", err);
            return cb(messages.nonExistingModel, responseCode.NOT_FOUND);
        }
        var result = result[0];
        var str = result.advertisementMessage;

        if (str && str.length > 1 && (str.charAt(0) == '"' || str.charAt(0) == "'") && (str.charAt(str.length - 1) == '"' || str.charAt(str.length - 1) == "'")) {
            str = str.substring(1, (str.length - 1));
        }

        result.advertisementMessage = str;

        var modelAdvertisement = {
            modelId: parseInt(result.id),
            modelName: result.name,
            advertisement: result.advertisementMessage
        };

        return cb(null, responseCode.SUCCESS, modelAdvertisement);
    });
}

ModelService.prototype.addAdvertisement = function (req, cb) {
    var self = this;
    if (req.params.modelId == undefined || isNaN(req.params.modelId)) {
        return cb(messages.emptyModelId, responseCode.BAD_REQUEST);
    }
    if (req.data.advertisement == undefined || req.data.advertisement == '') {
        return cb(messages.emptyAdvertisement, responseCode.BAD_REQUEST);
    }

    var modelId = req.params.modelId;
    req.data.modelId = parseInt(modelId);

    logger.info("Add Strategist model Advertisement service request received addAdvertisement()");

    modelDao.addAdvertisement(req, function (err, result) {
        if (err) {
            if (err == 'Model does not exist') {
                return cb(err, responseCode.NOT_FOUND);
            }
            logger.error("Failed to add Strategist model advertisement caused by ", err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        self.getAdvertisement(req, function (err, code, result) {
            if (err) {
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            return cb(null, code, result);
        });
        //     return cb(null, responseCode.SUCCESS, {"message" : messages.modelAdvertisementAdded});  
    });
}

//not used
ModelService.prototype.updateAdvertisement = function (data, cb) {

    data = {
        "message": "Model advertisement successfully updated."
    };

    return cb(null, responseCode.SUCCESS, data);

}

//not used
ModelService.prototype.deleteAdvertisement = function (data, cb) {

    data = {
        "message": "Model advertisement successfully deleted."
    };

    return cb(null, responseCode.SUCCESS, data);

}

Date.prototype.mmddyyyy = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [mm, dd, this.getFullYear()].join('/'); // padding
};

ModelService.prototype.getModelDetailForEclipseUser = function (inputData, cb) {
    logger.debug('get model detail for eclipse user service called (getModelDetailForEclipseUser())');
    var self = this;
    self.getEclipseUserRoles(inputData, function (err, status, userRoleDetails) {
        if (err) {
            return (err, status);
        }
        if (userRoleDetails) {
            if (userRoleDetails.roleType == 'FIRM ADMIN') {
                strategistDao.getStrategistFirm(inputData, userRoleDetails, function (err, strategistFirmDetails) {
                    if (err) {
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (strategistFirmDetails && strategistFirmDetails.length > 0) {
                        if (strategistFirmDetails[0].isSubscribed == 1) {
                            var strategistId = strategistFirmDetails[0].strategistId;
                            modelDao.getModelDetail(inputData, function (err, modelDetails) {
                                if (err) {
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (modelDetails && modelDetail.length > 0) {
                                    if (modelDetails[0].strategistId == strategistId) {
                                        inputData.modelId = modelDetails[0].id;
                                        self.getModelSecurities(inputData, function (err, status, securitiesResult) {
                                            if (err) {
                                                return (err, status);
                                            }
                                            modelDetails[0].securities = securitiesResult;
                                            return cb(null, responseCode.SUCCESS, modelDetails);
                                        });
                                    } else {
                                        return cb(messages.modelNotSubscribedAgainstStrategist, responseCode, UNPROCESSABLE);
                                    }
                                } else {
                                    return cb(null, responseCode.SUCCESS, modelDetail);
                                }
                            });
                        } else {
                            return cb(messages.notSubscribed, responseCode.UNPROCESSABLE);
                        }
                    } else {
                        return cb(messages.notSubscribed, responseCode.UNPROCESSABLE);
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

// ModelService.prototype.modelUpdateNotificationJob = function (inputData, cb) {
//     logger.debug('model update notification job service called (modelUpdateNotificationJob)');
//     var self = this;
//     /*
//         steps to be followed :-
//         1. get model detail to get the strategist
//         1. check if the model is subscribed to any Firm
//         2. get the firm details like username, password, host
//         3. get common db connection details
//         4. get communityDB connection details
//         5. run the job.
//     */

//     modelDao.getModelDetail(inputData, function (err, modelDetails) {
//         if (err) {
//             logger.debug('ETL JOB: error in get model details during notification ' + err);
//             return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         if (modelDetails && modelDetails.length > 0) {
//             inputData.communityStrategistId = modelDetails[0].strategistId;
//             strategistDao.getStrategistFirm(inputData, inputData, function (err, strategistFirmDetails) {
//                 if (err) {
//                     logger.debug('ETL JOB: error in get strategist firms during notification ' + err);
//                     return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                 }
//                 if (strategistFirmDetails && strategistFirmDetails.length > 0) {
//                     var onlySubscribedFirm = strategistFirmDetails.filter(function (item) {
//                         return item.isSubscribed == 1
//                     });
//                     var firmIds = _.pluck(onlySubscribedFirm, 'firmId');
//                     if (onlySubscribedFirm && onlySubscribedFirm.length > 0) {
//                         self.runModelUpdateJob(inputData, firmIds);
//                         return cb(null, responseCode.SUCCESS);
//                     } else {
//                         logger.debug('ETL JOB: No subscribed firms found');
//                         return cb(null, responseCode.SUCCESS);
//                     }
//                 } else {
//                     logger.debug('ETL JOB: No strategist  firm details found');
//                     return cb(null, responseCode.SUCCESS);
//                 }
//             });
//         } else {
//             return cb(messages.modelNotFound, responseCode.NOT_FOUND);
//             logger.debug('ETL JOB: No model details found');
//         }
//     });
// }

// ModelService.prototype.runModelUpdateJob = function (inputData, firmIds, cb) {
//     logger.debug('run model update job cal_____________________________________________________' + firmIds);
//     /*
//         1. get firm details form common
//         2. prepare required params
//         3. do call the job
//     */
//     var updateModelInfo = constants.updateModel;
//     var command = updateModelInfo.command;
//     var contextParam = '--context_param';
//     var envInfo = env.orion;
//     var firmDetail = '';
//     var commonDBDetail = contextParam + ' commonHostName=' + envInfo.db.host;
//     commonDBDetail += ' ' + contextParam + ' commonDBName=' + envInfo.db.database;
//     commonDBDetail += ' ' + contextParam + ' commonDBPort=3306';
//     var communityDBDetail = contextParam + ' communityHostName=' + envInfo.db.community.host;
//     communityDBDetail += ' ' + contextParam + ' communityDB=' + envInfo.db.community.database;
//     communityDBDetail += ' ' + contextParam + ' communityDBPort=3306';
//     var modelParam = contextParam + ' communityModelId=' + inputData.modelId;
//     var serverIP = contextParam + ' serverIP=' + envInfo.rebalance.url;
//     var serverPort = contextParam + ' serverPort=' + envInfo.rebalance.port;
//     var privateKeyPath = appBasePath + envInfo.modelUpdate.privateKey;

//     strategistDao.getFirmDetailsFromCommon(inputData, firmIds, function (err, firmDetails) {
//         if (err) {
//             logger.error('error in getting firm details form db' + err);
//             return cb();
//         }
//         if (firmDetails && firmDetails.length > 0) {
//             ssh.connect({
//                 host: envInfo.modelUpdate.host,
//                 username: envInfo.modelUpdate.username,
//                 privateKey: privateKeyPath
//             }).then(function () {
//                     var count = 0;
//                     firmDetails.forEach(function (firm) {
//                         var firm = poolService.configurationDecoder(firm, ['username', 'password']);
//                         firmDetail += contextParam + ' userName=' + firm.username + ' ' + contextParam + ' password=' + firm.password;
//                         var finalCommand = command + ' ' + firmDetail + ' ' + commonDBDetail + ' ' + communityDBDetail + ' ' + modelParam;
//                         finalCommand += ' ' + serverIP + ' ' + serverPort;
//                         ssh.execCommand(finalCommand).then(function (result) {
//                             logger.debug("the result i got here is" + JSON.stringify(result));
//                             count++;
//                             if (result.code !== 0) {
//                                 logger.error("Please provide valid command:", result.stderr);
//                             }
//                             if (count == firmDetails.length) {
//                                 return cb();
//                             }
//                         });
//                     });
//                 },
//                 function (error) {
//                     logger.error("Error during model update process:", error);
//                     return cb();
//                 });
//         } else {
//             logger.error("no firm details found:", error);
//             return cb();
//         }
//     });
// }

ModelService.prototype.updateFirms = function (inputData, data, cb) {
    logger.debug('update firms service called');
    asyncFor(data, function (model, index, next) {
        inputData.modelId = model;
        utilCommunity.modelUpdateNotificationJob(inputData, function (err, status, result) {
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
}

module.exports = ModelService;