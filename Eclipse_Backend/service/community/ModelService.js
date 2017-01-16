"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var helper = require("helper");
var cbCaller = helper.cbCaller;

var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var request = require('request');
var util = require('util');
var _ = require('underscore');
var ModelDao = require('dao/community/ModelDao.js');
var StrategistService = require('service/community/StrategistService.js');
var SecurityConverter = require('converter/security/SecurityConverter.js');
var ModelConverter = require("converter/community/ModelConverter.js");
var securitySetConverter = require('converter/security/SecuritySetConverter.js');
var securitySetService = require("service/security/SecuritySetService.js");
var SecurityService = require("service/security/SecurityService.js");

var sharedCache = require('service/cache/').shared;
var localCache = require('service/cache/').local;
var httpResponseCodes = config.responseCodes;
var communityEnv = config.env.prop.community;

var asyncFor = helper.asyncFor;
var modelDao = new ModelDao();
var modelConverter = new ModelConverter();
var strategistService = new StrategistService();
var eclipseModelService = require('service/model/ModelService.js');
var eclipseModelConverter = require('converter/model/ModelConverter.js');

var ModelService = function () { };

ModelService.prototype.getList = function (data, cb) {
    logger.info("Get community model list service called (getList())");
    strategistService.validateStrategist(data, function (err, exist) {
        if (err) {
            logger.error("Error in validate Strategist  list (getList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (exist) {
            modelDao.getList(data, function (err, fetched) {
                if (err) {
                    logger.error("Getting community model list (getList()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (fetched) {
                    modelConverter.getResponseModelOfModelList(fetched, function (err, result) {
                        if (err) {
                            logger.error("Error in getting Model list (getList())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        logger.info("Model List returned successfully (getList())");
                        return cb(null, responseCode.SUCCESS, result);
                    });
                } else {
                    logger.info("Empty Model List returned (getList())");
                    return cb(null, responseCode.SUCCESS, []);
                }
            });
        } else {
            // logger.debug("Strategist does not exist (getList())" + data.strategistId);
            // return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
            logger.info("Empty Model List returned (getList())");
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

ModelService.prototype.getApprovedModelsList = function (data, cb) {
    logger.info("Get approved community model list service called (getApprovedModelsList())");
    strategistService.validateApprovedStrategist(data, function (err, record) {
        if (err) {
            logger.error("Error in validate approved strategist (getApprovedModelsList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (record && record.strategistId) {
            data.strategistId = record.strategistId;
            data.communityStrategistpreferenceId = record.communityStrategistpreferenceId;
            modelDao.validateModelAccessLevel(data, function (err, access) {
                if (err) {
                    logger.error("Error in validate model access Level (getApprovedModelsList()) " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (access && access.accessLevel) {
                    data.accessLevel = access.accessLevel;
                    modelDao.getAccessModelsList(data, function (err, models) {
                        if (err) {
                            logger.error("Error in getting access Model list (getApprovedModelsList())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (models.modelId.length > 0) {
                            data.models = models;
                            modelDao.getApprovedModelsList(data, function (err, fetched) {
                                if (err) {
                                    logger.error("Error in getting approved Model list (getApprovedModelsList())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (fetched) {
                                    modelConverter.getResponseModelOfModelList(fetched, function (err, result) {
                                        if (err) {
                                            logger.error("Error in converting approved Model list (getApprovedModelsList())" + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        logger.info("Model List returned successfully (getApprovedModelsList())");
                                        return cb(null, responseCode.SUCCESS, result);
                                    });
                                } else {
                                    logger.info("Empty approved Model List returned (getApprovedModelsList())");
                                    return cb(null, responseCode.SUCCESS, []);
                                }
                            });
                        }
                        else {
                            logger.info("Empty  Model List from AccessModelsList returned (getApprovedModelsList())");
                            return cb(null, responseCode.SUCCESS, []);
                        }
                    });
                }
            });
        } else {
            // logger.debug("Strategist does not exist (getApprovedModelsList())" + data.strategistId);
            // return cb(messages.strategistNotFound, responseCode.NOT_FOUND);
            logger.info("Empty approved Model List returned (getApprovedModelsList())");
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

// ModelService.prototype.importCommunityModel = function (data, cb) {
//     logger.info("Import community model  service called (importCommunityModel())");
//     var self = this;
//     var user = data.user;
//     var reqId = data.reqId;
//     var communityAccessToken;

//     modelDao.validateModel(data, function (err, communityModel) {
//         if (err) {
//             logger.error("Error in get community model id (importCommunityModel())" + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         if (communityModel.communityModelId > 0) {
//             var eclipseToken = localCache.get(data.reqId).session.token;
//             data.communityModelId = communityModel.communityModelId;
//             modelDao.validateEclipseModel(data, function (err, eclipseModel) {
//                 if (err) {
//                     logger.error("Error in get community model id (importCommunityModel())" + err);
//                     return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//                 }
//                 if (eclipseModel && eclipseModel.length === 0) {
//                     sharedCache.get(eclipseToken, function (err, data) {
//                         if (err) {
//                             logger.error(err);
//                             return response(err, responseCodes.internalServerError, data, res);
//                         } else {
//                             var token;
//                             try {
//                                 token = JSON.parse(data).connect_token;
//                             } catch (err) {
//                                 logger.error(err);
//                                 return response(messages.interServerError, responseCodes.INTERNAL_SERVER_ERROR, null, res);
//                             }
//                             var communityModelId = communityModel.communityModelId;

//                             var url = {
//                                 url: communityEnv.protocol + communityEnv.host + ":" + communityEnv.port + communityEnv.getCommunityToken,
//                                 headers: {
//                                     'Authorization': "Session " + token
//                                 }
//                             };
//                             request.get(url, function (err, response, body) {
//                                 if (err) {
//                                     logger.error("Error in get community Token  (importCommunityModel())" + err);
//                                     return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
//                                 } else if (response.statusCode !== httpResponseCodes.SUCCESS) {
//                                     return cb('Unable to get community Token', responseCode.UNPROCESSABLE);
//                                 } else {
//                                     body = JSON.parse(body);
//                                     communityAccessToken = body.community_access_token;

//                                     var modelImportUrl = {
//                                         url: communityEnv.protocol + communityEnv.host + ":" + communityEnv.port + communityEnv.communityModelImport + communityModelId,
//                                         headers: {
//                                             'Authorization': "Session " + communityAccessToken
//                                         }
//                                     };
//                                     request.get(modelImportUrl, function (err, response, body) {
//                                         if (err) {
//                                             logger.error("Error in get Model From from community api  (importCommunityModel())" + err);
//                                             return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
//                                         }
//                                         if (response.statusCode !== httpResponseCodes.SUCCESS) {
//                                             return cb('Unable to get community model', responseCode.UNPROCESSABLE);
//                                         }
//                                         try {
//                                             body = JSON.parse(body);
//                                         } catch (error) {
//                                             logger.error("Error Occurred in try catch");
//                                         }
//                                         if (body) {
//                                             body.strategistId = communityModel.strategistId;
//                                             modelConverter.getGeneralModelFromModelRequest(body, function (err, modelRequest) {
//                                                 if (err) {
//                                                     logger.error("Error in converting community Model to eclipse mode request  (importCommunityModel())" + err);
//                                                     return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                 }
//                                                 modelRequest.user = user;
//                                                 modelRequest.reqId = reqId;
//                                                 self.validateSecurity(modelRequest, function (err, validSecurityStatus) {
//                                                     if (err) {
//                                                         logger.error("Error in get validate community orionConnectExternalId security (importCommunityModel())" + err);
//                                                         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//                                                     }
//                                                     //console.log("******modelRequest*******" + util.inspect(modelRequest));

//                                                     logger.info("community Model Request returned successfully (importCommunityModel()) ************" + util.inspect(validSecurityStatus));
//                                                     if (validSecurityStatus) {


//                                                         self.prepareSecurity(modelRequest, function (err, validSecurity) {
//                                                             if (err) {
//                                                                 logger.error("Error in prepare Security (importCommunityModel())" + err);
//                                                                 return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                             }
//                                                             if (validSecurity && validSecurity.length > 0) {
//                                                                 // console.log("************modelRequest**********" + util.inspect(modelRequest));

//                                                                 var model = eclipseModelConverter.getGeneralModelModelFromModelRequest(modelRequest);

//                                                                 eclipseModelService.createOrUpdateGeneralModel(model, function (err, status, generalModel) {
//                                                                     if (err) {
//                                                                         logger.error("Error in import community Model (importCommunityModel())" + err);
//                                                                         return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                     }
//                                                                     logger.info("Create Or Update General Model info successfully***** (importCommunityModel())" + validSecurity);
//                                                                     if (status && status === "CREATED") {
//                                                                         modelConverter.getSecuritySetCompleteModel(data, model, modelRequest, validSecurity, function (err, securitySet) {
//                                                                             if (err) {
//                                                                                 logger.error("Error in converting community security Set  (importCommunityModel())" + err);
//                                                                                 return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                             }
//                                                                             securitySet.user = user;
//                                                                             securitySet.reqId = reqId;
//                                                                             logger.info("Get Security Set Complete Model successfully (importCommunityModel())");
//                                                                             securitySetConverter.getSecuritySetCompleteModelFromSecuritySetRequest(securitySet, function (err, securitySetData) {
//                                                                                 if (err) {
//                                                                                     logger.error("Error in converting community security Set Request Data (importCommunityModel())" + err);
//                                                                                     return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                                 }
//                                                                                 logger.info("Get SecuritySet Complete Model From SecuritySetRequest successfully (importCommunityModel())");

//                                                                                 securitySetService.createSecuritySet(securitySetData, function (err, status, securitySetDetail) {
//                                                                                     if (err) {
//                                                                                         logger.error("Error in create Security Set  (importCommunityModel())" + err);
//                                                                                         return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                                     }
//                                                                                     logger.info("SecuritySet  create successfully (importCommunityModel())");
//                                                                                     logger.info("Model Import  successfully (importCommunityModel())");
//                                                                                     modelConverter.getModelElementModel(generalModel, securitySetDetail, function (err, modelElementRequest) {
//                                                                                         if (err) {
//                                                                                             logger.error("Error in converting modelElement Request  (importCommunityModel())" + err);
//                                                                                             return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                                         }
//                                                                                         modelElementRequest.user = user;
//                                                                                         modelElementRequest.reqId = reqId;

//                                                                                         var modelElement = eclipseModelConverter.getModelElementModelFromModelRequest(modelElementRequest);

//                                                                                         eclipseModelService.createModelElement(modelElement, function (err, status, subModel) {
//                                                                                             if (err) {
//                                                                                                 logger.error("Error in creating Model Element   (importCommunityModel())" + err);
//                                                                                                 return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                                             }
//                                                                                             if (subModel) {
//                                                                                                 modelConverter.getModelDetailModel(generalModel, securitySetDetail, subModel, function (err, modelDetailRequest) {
//                                                                                                     if (err) {
//                                                                                                         logger.error("Error in converting modelDetail Request  (importCommunityModel())" + err);
//                                                                                                         return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                                                     }
//                                                                                                     modelDetailRequest.user = user;
//                                                                                                     modelDetailRequest.reqId = reqId;
//                                                                                                     eclipseModelService.saveCompleteModel(modelDetailRequest, function (err, status, modelDetail) {
//                                                                                                         if (err) {
//                                                                                                             logger.error("Error in saving Complete Model   (importCommunityModel())" + err);
//                                                                                                             return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                                                         }
//                                                                                                         var modelStatus = {
//                                                                                                             statusId: 1,
//                                                                                                             id: modelDetail.id
//                                                                                                         };
//                                                                                                         modelStatus.user = user;
//                                                                                                         modelStatus.reqId = reqId;
//                                                                                                         eclipseModelService.modelStatusChange(modelStatus, function (err, status, modelStatusChangeFinal) {
//                                                                                                             if (err) {
//                                                                                                                 logger.error("Error in Model Status Changing   (importCommunityModel())" + err);
//                                                                                                                 return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//                                                                                                             }
//                                                                                                             return cb(null, responseCode.CREATED, modelStatusChangeFinal);
//                                                                                                         });
//                                                                                                     });
//                                                                                                 });
//                                                                                             }
//                                                                                         });
//                                                                                     });

//                                                                                 });
//                                                                             });

//                                                                         });
//                                                                     } else {
//                                                                         logger.info("Problem in create Model (importCommunityModel())");
//                                                                         return cb("Problem in create Model", responseCode.UNPROCESSABLE);
//                                                                     }
//                                                                 });
//                                                             } else {
//                                                                 logger.info("Problem in getting security (importCommunityModel())");
//                                                                 return cb("Problem in getting security", responseCode.UNPROCESSABLE);
//                                                             }
//                                                         });
//                                                     } else {
//                                                         logger.info("Problem in security creation (importCommunityModel())");
//                                                         return cb("Problem in security creation", responseCode.UNPROCESSABLE);
//                                                     }
//                                                 });
//                                             });
//                                         } else {
//                                             logger.info("Empty Model Request returned (importCommunityModel())");
//                                             return cb(null, responseCode.SUCCESS, []);
//                                         }
//                                     });
//                                 }
//                             });
//                         }
//                     });
//                 } else {
//                     logger.debug("Model already exist in eclipse (importCommunityModel()) ");
//                     data.id = eclipseModel[0]
//                     eclipseModelService.getCompleteModelById(data, function (err, status, modelDetails) {
//                         if (err) {
//                             logger.error("Error in getting model details (importCommunityModel())" + err);
//                             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//                         }
//                         return cb(null, status, modelDetails);

//                     });
//                     // console.log("*************"+util.inspect(eclipseModel));
//                     //return cb(messages.communityModelAlreadyExist, responseCode.UNPROCESSABLE);
//                 }
//             });
//         }
//         else {
//             logger.debug("Model Not exist (importCommunityModel()) ");
//             return cb(messages.portfolioModelNotFound, responseCode.NOT_FOUND);
//         }
//     });
// };

// ModelService.prototype.validateSecurity = function (data, cb) {
//     logger.info("Validate Security  service called (validateSecurity())");
//     var securities = data.securities;
//     var self = this;
//     var security = [];
//     modelDao.validateSecurity(data, function (err, eclipseSecurity) {
//         if (err) {
//             logger.error("Error in get validate community orionConnectExternalId security (validateSecurity())" + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         var eclipseOrionConnectExternalId = eclipseSecurity.orionConnectExternalId;
//         var communityOrionConnectExternalId = _.uniq(securities);
//         var securityId = eclipseSecurity.securityId;
//         modelConverter.getValidateSecurityResponse(eclipseSecurity, function (err, validSecurity) {
//             if (err) {
//                 logger.error("Error in converting validate security security (validateSecurity())" + err);
//                 return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//             }
//             var orionConnectExternalId = _.difference(communityOrionConnectExternalId, validSecurity.eclipseOrionConnectExternalId);
//             if (orionConnectExternalId.length === 0) {
//                 var matchSecurity = validSecurity.securityId;
//                 matchSecurity.forEach(function (matchSecurityId) {
//                     security.push(matchSecurityId);
//                 })
//             } else {
//                 orionConnectExternalId.forEach(function (externalId) {
//                     data.externalId = externalId;
//                     self.createSecurity(data, function (err, status, result) {

//                     });
//                 }, this);
//             }
//             return cb(null, security);
//         });
//     });
// };

// ModelService.prototype.validateSecurity = function (data, cb) {
//     logger.info("Validate Security  service called (validateSecurity())");
//     var securities = data.securities;
//     var self = this;
//     var security = [];
//     var eclipseOrionConnectExternalId = [];
//     // var cbfn = cbCaller(2, function (err, data) {
//     //     if (err) {
//     //         logger.error("Error in cbCaller (validateSecurity()) " + err);
//     //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//     //     }
//     //     return cb(null, data);
//     // });
//     modelDao.validateSecurity(data, function (err, eclipseSecurity) {
//         if (err) {
//             logger.error("Error in get validate community orionConnectExternalId security (validateSecurity())" + err);
//             return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
//         } else {
//             var communityOrionConnectExternalId = _.uniq(securities);
//             eclipseSecurity.forEach(function (externalId) {
//                 var securityData = {};
//                 eclipseOrionConnectExternalId.push(externalId.orionConnectExternalId);
//             })

//             var orionConnectExternalId = _.difference(communityOrionConnectExternalId, eclipseOrionConnectExternalId);
//             var counter = orionConnectExternalId.length;
//             var cbfn = cbCaller(counter, function (err, data) {
//                 if (err) {
//                     logger.error("Error in cbCaller (validateSecurity()) " + err);
//                     return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//                 }
//                 return cb(null, data);
//             });
//             console.log("************orionConnectExternalId*********" + util.inspect(orionConnectExternalId));

//             if (orionConnectExternalId.length != 0) {
//                 asyncFor(orionConnectExternalId, function (externalId, index, next) {
//                     data.externalId = externalId;
//                     console.log("************asyncFor*********" + util.inspect(externalId));

//                     self.createSecurity(data, function (err, status, result) {
//                         if (err) {
//                             logger.error("Error in create security (validateSecurity())" + err);
//                             return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
//                         } else {
//                             console.log("*********************" + util.inspect(status));

//                             return next(err, result);
//                         }
//                     });
//                 }, function (err, data) {
//                     console.log("************data*********" + util.inspect(data));
//                     return cbfn(null, true);
//                 });
//             } else {
//                 console.log("************else*********");

//                 return cbfn(null, true);
//             }
//             // self.prepareSecurity(data, function (err, result) {
//             //     logger.debug("prepare Security called (validateSecurity())");

//             //     if (err) {
//             //         logger.error("Error in prepare Security (validateSecurity())" + err);
//             //         return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
//             //     } else {
//             //         logger.debug("SUCCESS In ************ prepare Security called (validateSecurity())" + util.inspect(result));
//             //         return cbfn(null, result);
//             //     }
//             // });
//         }

//     });
// };

ModelService.prototype.validateSecurity = function (data, cb) {
    logger.info("Validate Security  service called (validateSecurity())");
    var securities = data.securities;
    var self = this;
    var security = [];
    var eclipseOrionConnectExternalId = [];
    modelDao.validateSecurity(data, function (err, eclipseSecurity) {
       
        if (err) {
            logger.error("Error in get validate community orionConnectExternalId security (validateSecurity())" + err);
            return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
        } else {
            var communityOrionConnectExternalId = _.uniq(securities);
            eclipseSecurity.forEach(function (externalId) {
                var securityData = {};
                eclipseOrionConnectExternalId.push(externalId.orionConnectExternalId);
            })

            var orionConnectExternalId = _.difference(communityOrionConnectExternalId, eclipseOrionConnectExternalId);
            var counter = orionConnectExternalId.length;

            var cbfn = cbCaller(counter, function (err, data) {
                if (err) {
                    logger.error("Error in cbCaller (validateSecurity()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, data);
            });

            if (orionConnectExternalId.length != 0) {
                asyncFor(orionConnectExternalId, function (externalId, index, next) {
                    data.externalId = externalId;

                    self.createSecurity(data, function (err, status, result) {
                        if (err) {
                            logger.error("Error in create security (validateSecurity())" + err);
                            return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
                        } else {

                            return next(err, result);
                        }
                    });
                }, function (err, cbResult) {

                    return cbfn(null, true);
                });
            } else {
                return cb(null, true);
            }
        }

    });
};

ModelService.prototype.createSecurity = function (data, cb) {
    logger.info("Create Security  service called (createSecurity())");
    var securityId = data.externalId;
    var myData = {};
    myData.id = securityId;
    myData.search = securityId;
    myData.user = data.user;
    myData.reqId = data.reqId;
    var requestToModel = SecurityConverter.getSecurityRequestToModel(myData);

    SecurityService.getSecurityDetailFromOrion(requestToModel, function (err, status, orionSecurity) {
      
        if (orionSecurity) {

            SecurityService.createSecurityAssociations(orionSecurity, function (err, status, rs) {
                if (err) {
                    logger.error(err);
                    return cb(err, status);
                }
                var securityModel = SecurityConverter.getSecurityModelFromOrionSecurityResponseModel(orionSecurity);
                _.assign(securityModel, rs);

                SecurityService.createSecurity(securityModel, function (err, status, createSecurity) {
                    if (err) {
                        logger.error(err);
                        return cb(err, status);
                    }
                    cb(err, status, createSecurity);
                });
            });
        } else {

            cb(messages.notFound, responseCode.NOT_FOUND, null);
        }
    });
}

ModelService.prototype.prepareSecurity = function (data, cb) {
    logger.info("Create Security  service called (prepareSecurity())");
    var securities = data.securities;
    var allocation = data.allocation;
    var lowerTolerancePercent = data.lowerTolerancePercent;
    var upperTolerancePercent = data.upperTolerancePercent;
    var result = [];
    modelDao.validateSecurity(data, function (err, fetched) {
        if (err) {
            logger.error("Error in prepare Security Data (prepareSecurity())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            fetched.forEach(function (security) {
                var securityData = {};
                var index = _.indexOf(securities, security.orionConnectExternalId);
                securityData = {
                    id: security.securityId,
                    allocation: allocation[index],
                    lowerTolerancePercent: lowerTolerancePercent[index],
                    upperTolerancePercent: upperTolerancePercent[index]
                }
                result.push(securityData);
            }, this);
        }
        return cb(null, result);
    });
}

ModelService.prototype.importCommunityModel = function (data, cb) {
    logger.info("Import community model  service called (importCommunityModel())");
    var self = this;
    modelDao.validateModel(data, function (err, communityModel) {
        if (err) {
            logger.error("Error in get community model id (importCommunityModel())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (communityModel && communityModel.communityModelId > 0) {
            data.communityModelId = communityModel.communityModelId;
            modelDao.validateEclipseModel(data, function (err, eclipseModel) {
                if (err) {
                    logger.error("Error in get community model id (importCommunityModel())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (eclipseModel && eclipseModel.length === 0) {
                    self.getCommunityModelDetails(data, function (err, status, result) {
                        if (err) {
                            logger.error("Error in getting community model details (importCommunityModel())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (status === "CREATED") {
                            logger.info("Community model Details import successfully");
                            return cb(null, status, result);
                        } else {
                            logger.debug("Issues in community model details import process");
                            return cb(result, status);
                        }
                    })
                } else {
                    logger.debug("Model already exist in eclipse (importCommunityModel()) ");
                    data.id = eclipseModel[0]
                    eclipseModelService.getCompleteModelById(data, function (err, status, modelDetails) {
                        if (err) {
                            logger.error("Error in getting model details (importCommunityModel())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        } else {
                            logger.info("Getting Complete Model By Id successfully (importCommunityModel()) ");
                            return cb(null, status, modelDetails);
                        }
                    });
                }
            });
        } else {
            logger.debug("Model Not exist (importCommunityModel()) ");
            return cb(messages.portfolioModelNotFound, responseCode.NOT_FOUND);
        }
    });
};

ModelService.prototype.getCommunityModelDetails = function (data, cb) {
    logger.info("Get Community Model Details service called (getCommunityModelDetails())");
    var user = data.user;
    var reqId = data.reqId;
    var communityAccessToken;
    var eclipseToken = localCache.get(data.reqId).session.token;

    logger.debug("SharedCache called for connect_token (getCommunityModelDetails())");
    sharedCache.get(eclipseToken, function (err, data) {
        if (err) {
            logger.error("Error in getting connect_token from sharedCache (getCommunityModelDetails()) " + err);
            return response(err, responseCodes.internalServerError, data, res);
        } else {
            var token;
            try {
                token = JSON.parse(data).connect_token;
                logger.info("Connect_token get from SharedCache successfully (getCommunityModelDetails())" + token);
            } catch (err) {
                logger.error("Error in parse connect_token (getCommunityModelDetails())");
                return response(messages.interServerError, responseCodes.INTERNAL_SERVER_ERROR, null, res);
            }
            // var communityModelId = communityModel.communityModelId;
            var communityModelId = data.communityModelId;

            logger.debug("Prepare Url for Get community Token (getCommunityModelDetails())");
            var url = {
                url: communityEnv.protocol + communityEnv.host + ":" + communityEnv.port + communityEnv.getCommunityToken,
                headers: {
                    'Authorization': "Session " + token
                }
            };
            request.get(url, function (err, response, body) {
                if (err) {
                    logger.error("Error in get community Token  (getCommunityModelDetails())" + err);
                    return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
                } else if (response.statusCode !== httpResponseCodes.SUCCESS) {
                    logger.debug(" Unable to get community Token (getCommunityModelDetails())");
                    return cb(null, responseCode.UNPROCESSABLE, 'Unable to get community Token');
                } else {
                    try {
                        body = JSON.parse(body);
                        communityAccessToken = body.community_access_token;
                        logger.info("Community_access_token get successfully (getCommunityModelDetails())" + communityAccessToken);
                    } catch (error) {
                        logger.error("Error in parse community_access_token (getCommunityModelDetails())");
                        return response(messages.interServerError, responseCodes.INTERNAL_SERVER_ERROR);
                    }

                    logger.debug("Prepare Url for model Import (getCommunityModelDetails())");
                    var modelImportUrl = {
                        url: communityEnv.protocol + communityEnv.host + ":" + communityEnv.port + communityEnv.communityModelImport + communityModelId,
                        headers: {
                            'Authorization': "Session " + communityAccessToken
                        }
                    };
                    request.get(modelImportUrl, function (err, response, body) {
                        if (err) {
                            logger.error("Error in get Model From from community api  (getCommunityModelDetails())" + err);
                            return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
                        }
                        if (response.statusCode !== httpResponseCodes.SUCCESS) {
                            logger.debug(" Unable to get community model (getCommunityModelDetails())");
                            return cb(null, responseCode.UNPROCESSABLE, 'Unable to get community model');
                        }
                        try {
                            body = JSON.parse(body);
                            logger.info("Community model details parse successfully (getCommunityModelDetails())");
                        } catch (error) {
                            logger.error("Error in parse community model details (getCommunityModelDetails())");
                        }
                        if (body) {
                            body.strategistId = communityModel.strategistId;
                            data.body = body;
                            self.createCommunityModel(data, function (err, status, result) { 
                                if (err) {
                                    logger.error("Error in creating community model  (getCommunityModelDetails())" + err);
                                    return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
                                } else {
                                    logger.info("Create Community Model response return successfully")
                                    return cb(null, status, result);
                                }
                            });
                        } else {
                            logger.info("Empty Model Request returned (getCommunityModelDetails())");
                            return cb(null, responseCode.SUCCESS, []);
                        }
                    });
                }
            });
        }
    });

};

ModelService.prototype.createCommunityModel = function (data, cb) {
    logger.info("Create community model  service called (createCommunityModel())");
    var self = this;
    var user = data.user;
    var reqId = data.reqId;
    var body = data.body;
    modelConverter.getGeneralModelFromModelRequest(body, function (err, modelRequest) {
        if (err) {
            logger.error("Error in converting community Model to eclipse model request  (createCommunityModel())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        modelRequest.user = user;
        modelRequest.reqId = reqId;
        self.validateSecurity(modelRequest, function (err, validSecurityStatus) {
            if (err) {
                logger.error("Error in get validate community orionConnectExternalId security (createCommunityModel())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("Community Model Request returned successfully (createCommunityModel()) " + util.inspect(validSecurityStatus));
            if (validSecurityStatus) {
                self.prepareSecurity(modelRequest, function (err, validSecurity) {
                    if (err) {
                        logger.error("Error in prepare Security (createCommunityModel())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (validSecurity && validSecurity.length > 0) {
                        var model = eclipseModelConverter.getGeneralModelModelFromModelRequest(modelRequest);
                        eclipseModelService.createOrUpdateGeneralModel(model, function (err, status, generalModel) {
                            if (err) {
                                logger.error("Error in import community Model (createCommunityModel())" + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            logger.info("Create Or Update General Model info successfully (createCommunityModel())" + validSecurity);
                            if (status && status === "CREATED") {
                                data.model = model;
                                data.modelRequest = modelRequest;
                                data.validSecurity = validSecurity;
                                data.generalModel = generalModel;
                                self.createSecuritySet(data, function (err, status, result) {
                                    if (err) {
                                        logger.error("Error in creating SecuritySet (createCommunityModel())" + err);
                                        return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
                                    } else {
                                        logger.info("Create SecuritySet response return successfully (createCommunityModel())" + validSecurity);
                                        return cb(null, status, result);
                                    }
                                });
                            } else {
                                logger.info("Problem in create Model (createCommunityModel())");
                                return cb(null, responseCode.UNPROCESSABLE, "Problem in create Model");
                            }
                        });
                    } else {
                        logger.info("Problem in getting security (createCommunityModel())");
                        return cb(null, responseCode.UNPROCESSABLE, "Problem in getting security");
                    }
                });
            } else {
                logger.info("Problem in security creation (createCommunityModel())");
                return cb(null, responseCode.UNPROCESSABLE, "Problem in security creation");
            }
        });
    });
};

ModelService.prototype.createSecuritySet = function (data, cb) {
    logger.info("Create SecuritySet service called (createSecuritySet())");
    var user = data.user;
    var reqId = data.reqId;
    var model = data.model;
    var modelRequest = data.modelRequest
    var validSecurity = data.validSecurity

    modelConverter.getSecuritySetCompleteModel(data, model, modelRequest, validSecurity, function (err, securitySet) {
        if (err) {
            logger.error("Error in converting community security Set  (createSecuritySet())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        securitySet.user = user;
        securitySet.reqId = reqId;
        logger.info("Get Security Set Complete Model successfully (createSecuritySet())");
        securitySetConverter.getSecuritySetCompleteModelFromSecuritySetRequest(securitySet, function (err, securitySetData) {
            if (err) {
                logger.error("Error in converting community security Set Request Data (createSecuritySet())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("Get SecuritySet Complete Model From SecuritySetRequest successfully (createSecuritySet())");

            securitySetService.createSecuritySet(securitySetData, function (err, status, securitySetDetail) {
                if (err) {
                    logger.error("Error in create Security Set  (createSecuritySet())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("SecuritySet  create successfully (createSecuritySet())");
                //          logger.info("Model Import  successfully (createSecuritySet())");
                data.securitySetDetail = securitySetDetail;
                self.createModelElement(data, function (err, status, result) {
                    if (err) {
                        logger.error("Error in creating SecuritySet (createSecuritySet())" + err);
                        return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
                    } else {
                        logger.info("Create ModelElement response return successfully (createSecuritySet())");
                        return cb(null, status, result);
                    }
                });
            });
        });
    });
};

ModelService.prototype.createModelElement = function (data, cb) {
    logger.info("Create Model Element service called (createModelElement())");
    var user = data.user;
    var reqId = data.reqId;
    var generalModel = data.generalModel;
    var securitySetDetail = data.securitySetDetail;
    modelConverter.getModelElementModel(generalModel, securitySetDetail, function (err, modelElementRequest) {
        if (err) {
            logger.error("Error in converting modelElement Request  (createModelElement())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        modelElementRequest.user = user;
        modelElementRequest.reqId = reqId;

        var modelElement = eclipseModelConverter.getModelElementModelFromModelRequest(modelElementRequest);

        eclipseModelService.createModelElement(modelElement, function (err, status, subModel) {
            if (err) {
                logger.error("Error in creating Model Element   (createModelElement())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (subModel) {
                modelConverter.getModelDetailModel(generalModel, securitySetDetail, subModel, function (err, modelDetailRequest) {
                    if (err) {
                        logger.error("Error in converting modelDetail Request  (createModelElement())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    // modelDetailRequest.user = user;
                    // modelDetailRequest.reqId = reqId;
                    data.modelDetailRequest = modelDetailRequest;
                    self.saveCompleteModel(data, function (err, status, result) {
                        if (err) {
                            logger.error("Error in creating SecuritySet (createModelElement())" + err);
                            return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
                        } else {
                            logger.info("Save CompleteModel response return successfully (createModelElement())");
                            return cb(null, status, result);
                        }
                    });
                });
            } else {
                logger.info("Problem in create ModelElement (createModelElement())");
                return cb(null, responseCode.UNPROCESSABLE, "Problem in create ModelElement");
            }
        });
    });
};

ModelService.prototype.saveCompleteModel = function (data, cb) {
    logger.info("Save Complete Model service called (saveCompleteModel())");
    var user = data.user;
    var reqId = data.reqId;
    var modelDetailRequest = data.modelDetailRequest;
    eclipseModelService.saveCompleteModel(modelDetailRequest, function (err, status, modelDetail) {
        if (err) {
            logger.error("Error in saving Complete Model   (saveCompleteModel())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        var modelStatus = {
            statusId: 1,
            id: modelDetail.id
        };
        modelStatus.user = user;
        modelStatus.reqId = reqId;
        eclipseModelService.modelStatusChange(modelStatus, function (err, status, modelStatusChangeFinal) {
            if (err) {
                logger.error("Error in Model Status Changing   (saveCompleteModel())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("Model Status Change successfully")
                logger.info("Model Import  successfully (createSecuritySet())");
                return cb(null, responseCode.CREATED, modelStatusChangeFinal);
            }
        });
    });
};

module.exports = ModelService;

