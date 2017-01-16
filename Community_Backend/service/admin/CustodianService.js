"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require('helper');

var CustodianDao = require('dao/admin/CustodianDao.js');
var CustodianConverter = require("converter/custodian/CustodianConverter.js");
var RoleConverter = require("converter/role/RoleConverter.js");

var messages = config.messages;
var responseCode = config.responseCode;
var logger = helper.logger(moduleName);

var custodianConverter = new CustodianConverter();
var roleConverter = new RoleConverter();
var custodianDao = new CustodianDao();
var asyncFor = helper.asyncFor;

var CustodianService = function () { };

CustodianService.prototype.addCustodian = function (data, cb) {
    logger.info("Add Custodian service called (addCustodian())"+JSON.stringify(data));
    var data = custodianConverter.modelToEntity(data);
     logger.info("Adda Custodian service called (addCustodian())"+JSON.stringify(data));
    var self = this;
    custodianDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("getting custodian (addCustodian())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (typeof fetched !== "undefined" && fetched.length > 0) {
            logger.info("Custodian already exist (addCustodian())");
            return cb(messages.custodianAlreadyExist, responseCode.UNPROCESSABLE);
        } else {
            custodianDao.add(data, function (err, result) {
                if (err) {
                    logger.error("Adding custodian (addCustodian())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                data.id = result.insertId;
                if (data.tradeExecutions && data.tradeExecutions.length > 0) {
                    self.isValidTradeExecutions(data,function(isValid,invalidTradeExecutions){
                        if(isValid){
                            custodianDao.updateSecurityTradeExecutionType(data, function (err, result) {
                                if (err) {
                                    logger.error("Assigning security trade execution type (addCustodian())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                self.getCustodianDetail(data, function (err, code, result) {
                                    if (err) {
                                        logger.error("Getting Custodian detail (addCustodian())" + err);
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    logger.info("Custodian created successfully (addCustodian())");
                                    return cb(null, responseCode.CREATED, result);
                                });
                            });
                        }else{
                            logger.error("Invalid security trade execution (addCustodian())" + invalidTradeExecutions);
                            return cb(messages.tradeExecutionsNotFound+" with combination "+invalidTradeExecutions, responseCode.NOT_FOUND);
                        }
                    });
                } else {
                    self.getCustodianDetail(data, function (err, code, result) {
                        if (err) {
                            logger.error("Getting Custodian detail (addCustodian())" + err);
                            return cb(err, code);
                        }
                        logger.info("Custodian created successfully (addCustodian())");
                        return cb(null, responseCode.CREATED, result);
                    });
                }
            });
        }
    });
};
CustodianService.prototype.updateCustodian = function (inputData, cb) {
    logger.info("update Custodian service called (updateCustodian())");
    var data = custodianConverter.modelToEntity(inputData);
    var self = this;
    custodianDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("getting custodian (addCustodian())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (typeof fetched !== "undefined" && fetched.length > 0) {
            custodianDao.removeSecurityTradeExecutionType(data, function (err, result) {
                if (err) {
                    logger.error("removing security trade execution type (updateCustodian())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                custodianDao.updateCustodian(data, function (err, result) {
                    if (err) {
                        logger.error("updating Custodian detail (updateCustodian())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (data.tradeExecutions && data.tradeExecutions.length > 0) {
                       self.isValidTradeExecutions(data,function(isValid,invalidTradeExecutions){
                        if(isValid){
                            custodianDao.updateSecurityTradeExecutionType(data, function (err, result) {
                                if (err) {
                                    logger.error("Updating security trade execution type (updateCustodian())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                self.getCustodianDetail(data, function (err, code, result) {
                                    if (err) {
                                        logger.error("Getting Custodian detail (updateCustodian())" + err);
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    logger.info("Custodian created successfully (updateCustodian())");
                                    return cb(null, responseCode.SUCCESS, result);
                                });
                            });
                        }else{
                            logger.error("Invalid security trade execution (updateCustodian())" + invalidTradeExecutions);
                            return cb(messages.tradeExecutionsNotFound+" with combination "+invalidTradeExecutions, responseCode.NOT_FOUND);
                        }
                    });
                   } else {
                    self.getCustodianDetail(data, function (err, code, result) {
                        if (err) {
                            logger.error("Getting Custodian detail (updateCustodian())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        logger.info("Custodian created successfully (updateCustodian())");
                        return cb(null, responseCode.SUCCESS, result);
                    });
                }
            });
            });
        } else {
            logger.info("Custodian doesnot exist  (updateCustodian())");
            return cb(messages.custodianNotFound, responseCode.NOT_FOUND);
        }
    });
};
CustodianService.prototype.getCustodianList = function (data, cb) {
    logger.info("Get custodian service called (getCustodianList())");
    var inputEntity = custodianConverter.modelToEntity(data);
    custodianDao.getList(data, function (err, entities) {
        if (err) {
            logger.error("Getting custodian list (getCustodianList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCode.SUCCESS, custodianConverter.entitiesToModels(entities));
    });
};

CustodianService.prototype.getCustodianDetail = function (data, cb) {
    var self = this;
    logger.info("Get custodian detail service called (getCustodianDetail())");
    var inputEntity = custodianConverter.modelToEntity(data);
    custodianDao.getDetail(inputEntity, function (err, entities) {
        if (err) {
            logger.error("Getting custodian detail (getCustodianDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (entities && entities.length > 0) {
            logger.info("Custodian detail returned successfully (getCustodianDetail())");
            var entity = self.CustodianDetailEntitiesToEntity(entities);
            return cb(null, responseCode.SUCCESS, custodianConverter.entityToModel(entity));
        } else {
            logger.info("Custodian does not found (getCustodianDetail())" + data.id);
            return cb(messages.custodianNotFound, responseCode.NOT_FOUND);
        }

    });
};

CustodianService.prototype.checkCustodianExistence = function (data, cb) {
    var self = this;
    logger.info("Get custodian detail service called (getCustodianDetail())");

    custodianDao.get(data, function (err, rs) {
        if (err) {
            logger.error("Getting custodian detail (getCustodianDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(rs && (Array.isArray(rs) && rs.length > 0) || (rs.id != null || rs.id != undefined )){
        	return cb(null, responseCode.SUCCESS, rs);
        }else{
        	return cb(messages.custodianForSecurityDoesNotExists, responseCode.UNPROCESSABLE);
        }
    });
};

CustodianService.prototype.checkCustodianSecuritySymbolExistence = function (data, cb) {
    var self = this;
    logger.info("Get custodian detail service called (getCustodianDetail())");
    custodianDao.getCustodianSecuritySymbol(data, function (err, rs) {
        if (err) {
            logger.error("Getting custodian detail (getCustodianDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(rs && (Array.isArray(rs) && rs.length > 0)){
        	return cb(messages.custodianSymbolAlreadyExistsForOtherSecurity, responseCode.DUPLICATE_ENTRY);
        }else{
        	return cb(null, responseCode.SUCCESS, rs);
        }
    });
};

CustodianService.prototype.CustodianDetailEntitiesToEntity = function (entities) {
    var entity = {};
    entity["id"] = entities[0].id;
    entity["externalId"] = entities[0].externalId;
    entity["name"] = entities[0].name;
    entity["code"] = entities[0].code;
    entity["isDeleted"] = entities[0].isDeleted;
    entity["masterAccountNumber"] = entities[0].masterAccountNumber;
    entity["createdDate"] = entities[0].createdDate;
    entity["editedDate"] = entities[0].editedDate;
    entity["createdBy"] = entities[0].createdBy;
    entity["editedBy"] = entities[0].editedBy;
    var tradeExecutionTypeId = entities[0].custodianTradeExecutionTypeId;
    if (tradeExecutionTypeId === -1) {
        var tradeExecutions = [];
        entities.forEach(function (input, cb) {
            if(input.securityTypeId){
                var tradeExecutionType = {};
                tradeExecutionType["securityTypeId"] = input.securityTypeId;
                tradeExecutionType["securityTypeName"] = input.securityTypeName;
                tradeExecutionType["tradeExecutionTypeId"] = input.tradeExecutionTypeId;
                tradeExecutionType["tradeExecutionTypeName"] = input.tradeExecutionTypeName;
                tradeExecutions.push(tradeExecutionType);
            }
        });
        entity["tradeExecutions"] = tradeExecutions;
    } else {
        entity["tradeExecutionId"] = tradeExecutionTypeId;
        if (tradeExecutionTypeId) {
            entity["tradeExecutionName"] = entities[0].tradeExecutionTypeName;
        }
    }

    return entity;
};

CustodianService.prototype.createOrUpdateCustodianSecuritySymbol = function (models, cb) {

	var self = this;
    var doneCustodianIds = [];
    
    var custodianIds = [];
    var custodianEntityWithIds = {};
    
    models.forEach(function(value){
    	custodianEntityWithIds.reqId = value.reqId;
    	custodianIds.push(value.custodianId);
    });

    custodianEntityWithIds.id = custodianIds;
    self.checkCustodianExistence(custodianEntityWithIds, function(err, status, rs){
    	if(err){
    		logger.error(err);
    		return cb(err, status);
    	}else{
    		if(rs.length != custodianIds.length){
    			return cb(messages.custodianForSecurityDoesNotExists, responseCode.UNPROCESSABLE);
    		}
    		asyncFor(models, function(value, index, next){
    			doneCustodianIds.push(value.custodianId);
    			var custodianEntity = custodianConverter.custodianSecuritySymbolModelToCustodianSecuritySymbolEntity(value);
    			self.checkCustodianSecuritySymbolExistence(custodianEntity, function(err,status, rs){
    				if (err) {
						logger.error(err);
						next(err);
						return cb(err, status);
					}
    				custodianDao.createCustdianSecuritySymbol(custodianEntity, function (err, rs) {
    					if (err) {
    						logger.error(err);
    						next(err);
    						return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    					}
    					next(err, custodianEntity);
    				});
    			})
    		}, function(err, custodianEntity){
    			if (err) {
					logger.error(err);
					return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
				}
				custodianEntity.idsNotToDelete = doneCustodianIds;
				custodianDao.deleteCustdianSecuritySymbol(custodianEntity, function (err, rs) {
					if (err) {
						logger.error(err);
						return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
					}
					cb(null, responseCode.SUCCESS, rs);
				});
    		});
    	}
    });

};

CustodianService.prototype.deleteCustodianSecuritySymbol = function (model, cb) {
    var custodianEntity = custodianConverter.custodianSecuritySymbolModelToCustodianSecuritySymbolEntity(model);
    custodianDao.deleteCustdianSecuritySymbol(custodianEntity, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        cb(null, responseCode.SUCCESS, rs);
    });

};

CustodianService.prototype.deleteCustodian = function (inputData, cb) {
    logger.info("Delete custodian service called (deleteCustodian())");
    var data = custodianConverter.modelToEntity(inputData);
    custodianDao.getCustodianAccountsCount(data, function (err, result) {
        if (err) {
            logger.error("get custodian account count (deleteCustodian())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result && result[0].count > 0) {
            logger.info("custodian has account account assosiated to it (deleteCustodian())" + result[0].count);
            return cb(messages.accountAssociated, responseCode.UNPROCESSABLE);
        } else {
            custodianDao.delete(data, function (err, deleted) {
                if (err) {
                    logger.error("Deleting custodian (deleteCustodian())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (deleted.affectedRows > 0) {
                 custodianDao.removeSecurityTradeExecutionType(data, function (err, result) {
                    if (err) {
                        logger.error("removing security trade execution type (deleteCustodian())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    logger.info("Custodian deleted successfully (deleteCustodian())" + data.id);
                    return cb(null, responseCode.SUCCESS, { "message": messages.custodianDeleted });
                });
             } else {
                logger.info("Custodian not found (deleteCustodian())" + data.id);
                return cb(messages.custodianNotFoudOrDeleted, responseCode.NOT_FOUND);
            }
        });
        }

    });

};
CustodianService.prototype.getCustodianAccounts = function(inputData, cb){
    logger.info("Get custodian account service called (getCustodianAccounts())");
    var data = custodianConverter.modelToEntity(inputData);
    var self = this;
    custodianDao.get(data, function (err, fetched) {
        if (err) {
            logger.error("getting custodian (getCustodianAccounts())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(fetched && fetched.length>0){
            custodianDao.getCustodianAccounts(data,function(err,accounts){
                if (err) {
                    logger.error("Getting custodian accounts (getCustodianAccounts())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Custodian accouts fetch successfully (getCustodianAccounts())");
                return cb(null, responseCode.SUCCESS, accounts);
            });
        }else{
            logger.info("Custodian doesnot exist  (getCustodianAccounts())");
            return cb(messages.custodianNotFound, responseCode.NOT_FOUND);
        }
    });
};
CustodianService.prototype.getCustodianSummary = function(data,cb){
    custodianDao.getCustodianSummary(data,function(err,result){
        if(err){
            logger.error("error fetching summary getCustodianSummary())"+err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("summary fetched successfully (getCustodianSummary())");
        return cb(null,responseCode.SUCCESS,result);
    });
};

CustodianService.prototype.isValidTradeExecutions = function(data,cb){
    var isValid = true;
    var invalidTradeExecutions = [];
    /*pending***/
    /********will write code here to check for valid tradeExecutionTypeId and securityTypeId***/
    logger.info("CODE is pending to check for valid tradeExecutionTypeId and securityTypeId");
    /*pending***/
    return cb(isValid,invalidTradeExecutions);
}
module.exports = CustodianService;

