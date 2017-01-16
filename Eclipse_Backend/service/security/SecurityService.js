"use strict";

var moduleName = __filename;

var request = require("request");
var _ = require("lodash");

var SecurityService = function(){}
module.exports = new SecurityService();

var config = require('config');
var sharedCache = require('service/cache/').shared;
var localCache = require('service/cache/').local;
var logger = require("helper").logger(moduleName);
var utilDao = require('dao/util/UtilDao.js');
var cbCaller = require("helper").cbCaller;
var asyncFor = require("helper").asyncFor;

var SecurityConverter = require("converter/security/SecurityConverter.js");
var SecurityConverter = require('converter/security/SecurityConverter.js');
var SubClassConverter = require('converter/security/SubClassConverter.js');
var ClassConverter = require('converter/security/ClassConverter.js');
var CategoryConverter = require('converter/security/CategoryConverter.js');
var CustodianService = require("service/admin/CustodianService.js");
var CustodianSecuritySymbol = require('model/custodian/CustodianSecuritySymbol.js');
var CategoryService = require('service/security/CategoryService.js');
var ClassService = require('service/security/ClassService.js');
var SubClassService = require('service/security/SubClassService.js');
var SecuritySetService = require('service/security/SecuritySetService.js');
var SecurityTypeService = require("service/security/SecurityTypeService.js");
var securityPrivilegeValidator = require("service/security/SecurityPrivilegesValidator.js");
var modelService = require('service/model/ModelService.js');
var securityDao = require('dao/security/SecurityDao.js');
var AccountService = require('service/account/AccountService.js');
var accountService = new AccountService();

var constants = config.orionConstants;
var messages = config.messages;
var responseCodes = config.responseCode;
var httpResponseCodes = config.responseCodes;
var orionApiResponseKeys = constants.orionApiResponseKey;
var applicationEnum = config.applicationEnum;
var securityStatus = applicationEnum.securityStatus;

var utilService = new (require('service/util/UtilService'))();
var securityTypeService = new SecurityTypeService();
var custodianService = new CustodianService();


SecurityService.prototype.getDetailedSecurityById = function(data, cb){
		logger.info("Get security details by id service called (getDetailedSecurityById())");

		securityDao.getDetailedSecurityById(data, function(err, result){
			if(err){
				logger.error(err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}else{
				if(result && result.length > 0){
					var securityDetailModel = SecurityConverter.securityDetailListEntityToSecurityModel(result);
					cb(null, responseCodes.SUCCESS, securityDetailModel);
				}else{
					return cb(messages.securityNotFound, responseCodes.NOT_FOUND, null);
				}
			}
		});
 };
 
 SecurityService.prototype.getSecurityPriceById = function(data, cb){
		logger.info("Get security price by id service called (getSecurityPriceById())");

		securityDao.getSecurityPriceById(data, function(err, result){
			if(err){
				logger.error(err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}else{
				if(result && result.length > 0){
					var securityDetailModel = SecurityConverter.securityDetailListEntityToSecurityModel(result);
					cb(null, responseCodes.SUCCESS, result[0]);
				}else{
					return cb(messages.securityNotFound, responseCodes.NOT_FOUND, null);
				}
			}
		});
};

SecurityService.prototype.checkForSecurityExistence = function(data, cb){
	logger.info("Check Existence of security by symbol, orionConnectExternalId (checkForSecurityExistence())");

	securityDao.getDetailedSecurity(data, function(err, result){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		if(result && result.length>0){
			if(result.length >= 2){
				return cb(messages.securityExists, responseCodes.EXISTS);
			}else if(result[0].symbol == data.symbol){
				if(data.orionConnectExternalId && result[0].orionConnectExternalId != data.orionConnectExternalId){
					return cb(messages.securitySymbolDuplicateConstraint, responseCodes.DUPLICATE_ENTRY);
				}else if(data.id && result[0].id != data.id){
					return cb(messages.securitySymbolDuplicateConstraint, responseCodes.DUPLICATE_ENTRY);
				}
			}
			return cb(null, responseCodes.SUCCESS, result);
		}else{
			return cb(messages.securityNotFound, responseCodes.ALREADY_DELETED);
		}
	});
};
	
SecurityService.prototype.getSecurityList = function(data, cb){
	logger.info("Get all security service called (getSecurityList())");
	
	securityDao.getSecuritiesList(data, function(err, result){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			if(!!result){
				cb(null, responseCodes.SUCCESS, result);
			}else{
				cb(null, responseCodes.SUCCESS, []);
			}
		}
	});
};
	  
SecurityService.prototype.orionSecuritySearch = function(data, cb){
	logger.info("Search Security in Orion (orionSecuritySearch())");
	
	var eclipseToken = localCache.get(data.reqId).session.token;
	var search = data.search;
	search = search ? search : '';
	var count = data.count;
	count = count ? count : 50;
	
	sharedCache.get(eclipseToken, function (err, data) {
        if (err) {
            logger.error(err);
            return response(err, responseCodes.internalServerError, data, res);
        } else {
            var token;
            try {
                token = JSON.parse(data).connect_token;
            } catch (err) {
                logger.error(err);
                return response(messages.interServerError, responseCodes.INTERNAL_SERVER_ERROR, null, res);
            }
            
            var self = this;
            
            var url = {
            		url: constants.api.tickerSearchAPI + "?search=" + search + "&top=" + count,
            		headers: {
            			'Authorization': "Session " + token
            		}
            };

            request.get(url, function (err, response, body) {
            	if (err) {
            		logger.error("Error in get security search from orion connect service (orionSecuritySearch())" + err);
            		return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
            	}
            	if(response.statusCode !== httpResponseCodes.SUCCESS){
            		logger.error(response[orionApiResponseKeys.errorMessage]);
            		return cb(response[orionApiResponseKeys.errorMessage], response.statusCode, null);
            	}
            	try{
            		body = JSON.parse(body);
            	}catch(e){
            		logger.error("Error in get security search from orion connect service (orionSecuritySearch())" + err);
            		return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
            	}
            	body = SecurityConverter.getSecurityToResponseListFromOrionList(body);
            	logger.info("Get security search from orion connect service completed successfully (orionSecuritySearch())");
            	cb(err, response.statusCode, body);
            });
        }
    });
		
};

SecurityService.prototype.getSecurityDetailFromOrion = function(securityModel, cb){
	logger.info("get Security Detail in Orion (getSecurityDetailFromOrion())");
	
	var eclipseToken = localCache.get(securityModel.reqId).session.token;
	var id = securityModel.id;
	
	sharedCache.get(eclipseToken, function (err, data) {
        if (err) {
            logger.error(err);
            return response(err, responseCodes.internalServerError, data, res);
        } else {
            var token;
            try {
                token = JSON.parse(data).connect_token;
            } catch (err) {
                logger.error(err);
                return response(messages.interServerError, responseCodes.INTERNAL_SERVER_ERROR, null, res);
            }
            
            var self = this;
            
            var url = {
            		url: constants.api.tickerDetailAPI + "/" + id,
            		headers: {
            			'Authorization': "Session " + token
            		}
            };
            request.get(url, function (err, response, body) {
            	if (err) {
            		logger.error("Error in get security detail from orion connect service (getSecurityDetailFromOrion())" + err);
            		return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
            	}
            	if(response.statusCode !== httpResponseCodes.SUCCESS){
            		logger.error(response[orionApiResponseKeys.errorMessage]);
            		return cb(response[orionApiResponseKeys.errorMessage], response.statusCode, null);
            	}
            	try{
            		body = JSON.parse(body);
            	}catch(e){
            		logger.error("Error in get security detail from orion connect service (getSecurityDetailFromOrion())" + err);
            		return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
            	}
            	body = SecurityConverter.getOrionSecurityResponseModelFromOrionSecurityResponse(body, securityModel);
            	logger.info("Get security detail from orion connect service completed successfully (getSecurityDetailFromOrion())");
            	cb(err, response.statusCode, body);
            });
        }
    });
	
};
	  
SecurityService.prototype.createOrUpdateSecurityPrice = function(data, cb){
	logger.info("create or update security price (createOrUpdateSecurityPrice())");
	
	if(data.price !=null || data.price != undefined){
		securityDao.insertSecurityPrice(data, function(err, result){
			if(err){
				logger.error(err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}else{
				cb(err, responseCodes.SUCCESS, result);
			}
		});			
	}else{
		cb(null, responseCodes.SUCCESS, {});
	}	
};
	  
SecurityService.prototype.updateSecurityPrice = function(data, cb){
	logger.info(" update security price service called (updateSecurityPrice())"+JSON.stringify(data));
	var securities = data.securities;
	var securitySymbolIdMap = data.securitySymbolIdMap
	if(securities && securities.length >0){
		asyncFor(securities, function(security, index, cb) {

			var inputData = {};
	        inputData.id = securitySymbolIdMap[security.symbol];
	        inputData.price = security.price;
	        inputData.reqId = data.reqId;
	        inputData.user = data.user;
	        securityDao.updateSecurityPrice(inputData, function(err, result){
				if(err){
					logger.error("Error updating security prices");
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
	           return cb(err, result);
	        });
	    }, function(err, result) {
	    	return cb(null, responseCodes.SUCCESS, {message:messages.securityPricesUpdated});
	    });
	}else{
		logger.info("No security to update (updateSecurityPrice())");
		return cb(messages.noSecurityToUpdate, responseCodes.UNPROCESSABLE);
	}
}
SecurityService.prototype.updateSecurityGeneral = function(data, cb){
	
	logger.info(" update security General called (updateSecurityGeneral())");
	var self = this;

	securityTypeService.checkSecurityTypeExistence(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, status);
		}
		self.assetClassExistenceCheck(data, function(err, status, rs){
			if(err){
				if(status === responseCodes.INTERNAL_SERVER_ERROR){
					logger.error(err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}else if(status === responseCodes.ALREADY_DELETED){
					logger.error("updateSecurityGeneral() " + err);
					return cb(err, responseCodes.NOT_FOUND);
				}else{
					logger.error("updateSecurityGeneral() " + err);
					return cb(err, status);
				}
			}else{
				SecuritySetService.securityAssociationInSecuritySetCheck(data, function(err, status, rs){
					if(err){
						logger.error(err);
						return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					}
					if(status === responseCodes.SUCCESS){
						securityDao.updateSecurityGeneral(data, function(err, result){
							if(err){
								logger.error(err);
								return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							}else{									
									return cb(err, responseCodes.SUCCESS, result);
							}
						});								
					}else{
						self.getDetailedSecurityById(data, function(err, status, rs){
							if(err){
								logger.error(err);
								return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							}
							if(rs.status === data.status || data.statusId == securityStatus["EXCLUDED"]){
								securityDao.updateSecurityGeneral(data, function(err, result){
									if(err){
										logger.error(err);
										return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
									}else{
										if(data.statusId == securityStatus["EXCLUDED"]){
											var model = SecurityConverter.securityModelToModelModel(data);
											modelService.changeModelStatusWhenSecurityIsExcluded(model, function(err, status, rs){
												if(err){
													logger.error(err);
													return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
												}else{
													return cb(err, responseCodes.SUCCESS, result);
												}
											})
										}else{											
											return cb(err, responseCodes.SUCCESS, result);
										}
									}
								});
							}else{
								return cb(messages.securityStatusCannotBeUpdated, responseCodes.UNPROCESSABLE, rs);
							}
						});
					}
				});
			}
		});
	});
};
	
SecurityService.prototype.createSecurityGeneral = function(data, cb){
		
	logger.info(" Create Security in General (createSecurityGeneral())");
	var self = this;

	securityTypeService.checkSecurityTypeExistence(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, status);
		}
		securityDao.createSecurityGeneral(data, function(err, result){
			if(err){
				logger.error(err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}
			data.id = result.insertId;
			return cb(null, responseCodes.CREATED, result);
			
		});			
	});
};
	
SecurityService.prototype.deleteSecurityGeneral = function(data, cb){
		
	logger.info("Delete security General called (deleteSecurityGeneral())");
	var self = this;
	
	self.checkForSecurityExistence(data, function(err, status, rs){
		if(err){
			if(status != responseCodes.SUCCESS){
				return cb(err, status);
			}
		}
		
		SecuritySetService.securityAssociationInSecuritySetCheck(data, function(err, status, rs){
			if(err){
				logger.error(err);
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			}
			if(status === responseCodes.SUCCESS){
				
				accountService.getAccountsWithSecurity(data, function(err, status, rs){
					if(err){
						logger.error(err);
						return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					}
					if(rs && rs.length == 0){						
						securityDao.deleteSecurity(data, function(err, result){
							if(err){
								logger.error(err);
								return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							}else{
								if (result.affectedRows > 0) {
									securityDao.deleteSecurityPrice(data, function(err, rs){
										if(err){
											logger.error(err);
											return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
										}					
										custodianService.deleteCustodianSecuritySymbol(data, function(err, status, rs){
											if(err){
												logger.error(err);
												return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
											}	
											logger.info("security deleted successfully (deleteSecurityGeneral())" + data.roleId);
											return cb(null, responseCodes.SUCCESS, { "message": messages.securityDeleted });
										})
									});
								} else {
									logger.info("secrity  not Found Or already deleted(deleteSecurityGeneral())" + data.orionConnectExternalId);
									return cb(messages.securityNotFound, responseCodes.NOT_FOUND);
								}
							}
						});
					}else{
						var list = [];
						rs.forEach(function(value){
							list.push(value.id);
						})
						return cb(messages.securityIsFoundInAccount + list, responseCodes.NOT_FOUND);
					}
				})
				
			}else{
				return cb(messages.securityCannotBeDeleted, responseCodes.UNPROCESSABLE);
			}
		});
	})
};

SecurityService.prototype.createSecurityAssociations = function(data, cb){
	
	logger.info(" Create all associations like securityType, assetCategory, assetClass, assetSubClass service called (createSecurityAssociations())");
	
	var rTurn = {};
	
	var finalCb = cbCaller(4, function(err, data){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		return cb(null, responseCodes.SUCCESS, rTurn);
	});
	
	var categoryModel = SecurityConverter.getCategoryModelFromOrionSecurityResponseModel(data)
	CategoryService.alreadyExistCheck(categoryModel, function(err, status, category){
		if(err){
			finalCb(null, rTurn);
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		if(status){
			CategoryService.createCategoryClass(categoryModel, function(err, status, rs){
				if(err){
					finalCb(err);
					logger.error(err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if(status == responseCodes.CREATED){
					rTurn.assetCategoryId = rs.id;					
				}
				finalCb(null, rTurn);
			});
		}else{
			rTurn.assetCategoryId = category.id;	
			finalCb(null, rTurn);
		}
	});
	var classModel = SecurityConverter.getClassModelFromOrionSecurityResponseModel(data)
	ClassService.alreadyExistCheck(classModel, function(err, status, classs){
		if(err){
			finalCb(null, rTurn);
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		if(status){
			ClassService.createClass(classModel, function(err, status, rs){
				if(err){
					finalCb(err, rTurn);
					logger.error(err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if(status == responseCodes.CREATED){
					rTurn.assetClassId = rs.id;					
				}
				finalCb(null, rTurn);
			});
		}else{
			rTurn.assetClassId = classs.id;	
			finalCb(null, rTurn);
		}
	});
	var subClassModel = SecurityConverter.getSubClassModelFromOrionSecurityResponseModel(data);
	SubClassService.alreadyExistCheck(subClassModel, function(err, status, subclass){
		if(err){
			finalCb(null, rTurn);
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		
		if(status){
			SubClassService.createSubClass(subClassModel, function(err, status, rs){
				if(err){
					finalCb(null, rTurn);
					logger.error(err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if(status == responseCodes.CREATED){
					rTurn.assetSubClassId = rs.id;					
				}
				finalCb(null, rTurn);
			});
		}else{
			rTurn.assetSubClassId = subclass.id;
			finalCb(null, rTurn);
		}
	});
	var securityTypeModel = SecurityConverter.getSecurityTypeModelFromOrionSecurityResponseModel(data);
	securityTypeService.checkSecurityTypeExistenceByName(securityTypeModel, function(err, status, securityType){
		if(err && status == responseCodes.INTERNAL_SERVER_ERROR){
			finalCb(null, rTurn);
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		
		if(status == responseCodes.SUCCESS){
			rTurn.securityTypeId = securityType.id;
			finalCb(null, rTurn);
		}else{
			securityTypeService.createSecurityType(securityTypeModel, function(err, status, rs){
				if(err){
					finalCb(null, rTurn);
					logger.error(err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if(status == responseCodes.CREATED){
					rTurn.securityTypeId = rs.id;					
				}
				finalCb(null, rTurn);
			});	
		}
	});
}
	
SecurityService.prototype.createSecurity = function(data, cb){
		
	logger.info("create security service called (createSecurity())");
	var self = this;
	self.checkForSecurityExistence(data, function(err, status, rs){
		if(err && err !== messages.securityNotFound){
			logger.error("security not found"+err);
			if(status === responseCodes.INTERNAL_SERVER_ERROR){
				return cb(err, responseCodes.INTERNAL_SERVER_ERROR);					
			}else if(status == responseCodes.DUPLICATE_ENTRY || status == responseCodes.EXISTS){
				return cb(err, status);
			}
		}

		if(status != responseCodes.SUCCESS){
			self.createSecurityGeneral(data, function(err, status, result){
				if(err){
					logger.error("Error create security general (createSecurity())"+err);
					if(status === responseCodes.UNPROCESSABLE){
						return cb(err, status);
					}
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				logger.debug("Result to get security general is"+JSON.stringify(result));
				self.createOrUpdateSecurityPrice(data, function(err, result){
					if(err){
						logger.error("Error create or update security price (createSecurity())"+err);
						return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					}else{
						logger.debug("Result to get detail is"+JSON.stringify(result));
						self.getDetailedSecurityById(data, function(err, status, rs){
							if(err){
								logger.error(err);
								return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							}
							cb(null, responseCodes.CREATED, rs);
						});
					}
				});			
			});
		}else{
			cb(messages.securityExists, responseCodes.UNPROCESSABLE);
		}
	})

};

SecurityService.prototype.securityTypeChangeCheck = function(data, security, cb){
	
	logger.info(" security type change privilege check (securityTypeChangeCheck())");
	
	if(security.secuirtyTypeId != data.securityTypeId){
		securityPrivilegeValidator.securityTypeUpdatePrivilegeCheck(data, function(err, status, rs){
			cb(null, status, rs);
		})
	}else{
		return cb(null, responseCodes.SUCCESS);
	}
}

SecurityService.prototype.securityPriceChangeCheck = function(data, security, cb){
	
	logger.info(" security price change privilege check (securityPriceChangeCheck())");
	
	if(security.price != data.price){
		securityPrivilegeValidator.securityPriceUpdatePrivilegeCheck(data, function(err, status, rs){
			cb(null, status, rs);
		})
	}else{
		return cb(null, responseCodes.SUCCESS);
	}
}

/*
 * two privileges on 
 * 	1. security price
 *  2. security type
*/SecurityService.prototype.updateSecurity = function(data, cb){
		
	logger.info(" Updte security service called (updateSecurity())");
	var self = this;
	
	self.checkForSecurityExistence(data, function(err, status, rs){
		if(err){
			if(status == responseCodes.EXISTS){
				return cb(messages.securitySymbolDuplicateConstraint, responseCodes.DUPLICATE_ENTRY);
			}else{
				return cb(err, status);
			}
		}
		
		/*
		 * check for change in security type
		*/
		var security = rs[0];
		self.securityTypeChangeCheck(data, security, function(err, status, rs){
			if(err){
				logger.error(err);
				return cb(err, status);
			}
			if(status != responseCodes.SUCCESS){
				logger.info(rs);
				return cb(null, status, rs);
			}
			self.securityPriceChangeCheck(data, security, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, status);
				}
				if(status != responseCodes.SUCCESS){
					logger.info(rs);
					return cb(null, status, rs);
				}
			self.updateSecurityGeneral(data, function(err, status, result){
				if(err){
					logger.error(err);
					if(status === responseCodes.NOT_FOUND){
						return cb(err, status);
					}else if(status === responseCodes.UNPROCESSABLE){
						return cb(err, status);
					}
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if(result && result.affectedRows>0){
					self.createOrUpdateSecurityPrice(data, function(err, status, result){
						if(err){
							logger.error(err);
							return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
						}else{
							if(!data.LIST_UPDATE){
								var custodians = data.custodians;
								if(custodians && Array.isArray(custodians) && custodians.length > 0){
									custodianService.createOrUpdateCustodianSecuritySymbol(custodians, function(err, status, rs){
										if(err){
											logger.error(err);
											if(status != responseCodes.INTERNAL_SERVER_ERROR){
												return cb(err, status);
											}
											return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
										}
										self.getDetailedSecurityById(data, cb);
									});						
								}else{
									var tempCustodianModel = {};
									tempCustodianModel.reqId = data.reqId;
									tempCustodianModel.securityId = data.id
									tempCustodianModel.user = data.user;
									
									custodianService.deleteCustodianSecuritySymbol(tempCustodianModel, function(err, rs){
										if(err){
											logger.error(err);
											return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
										}
										self.getDetailedSecurityById(data, cb);
									});
								}
							}else{
								self.getDetailedSecurityById(data, cb);
							}
						}
					});							
				}else{
					cb(messages.securityNotFound, responseCodes.NOT_FOUND, null);
				}
			});
			});
		})
	})
};


SecurityService.prototype.assetClassExistenceCheck = function(data, cb){
	
	logger.info(" assetClassesExistenceCheck service (assetClassExistenceCheck())");
	
	CategoryConverter.securityModelToCategoryModel(data, function(err, categoryEntity){

		CategoryService.uniquenessCheckAndImportedCheck(categoryEntity, function(err, status, rs){
			if(err){
				if(status === responseCodes.INTERNAL_SERVER_ERROR){
					logger.error(err);
					return cb(err, responseCode.INTERNAL_SERVER_ERROR);
				}else if(status === responseCodes.ALREADY_DELETED){
					logger.error("assetClassExistenceCheck() " + err);
					return cb(err, responseCodes.NOT_FOUND);
				}
			}
			ClassConverter.securityModelToClassModel(data, function(err, classEntity){
				ClassService.uniquenessCheckAndImportedCheck(classEntity, function(err, status, rs){
					if(err){
						if(status === responseCodes.INTERNAL_SERVER_ERROR){
							logger.error(err);
							return cb(err, responseCode.INTERNAL_SERVER_ERROR);
						}else if(status === responseCodes.ALREADY_DELETED){
							logger.error("assetClassExistenceCheck() " + err);
							return cb(err, responseCodes.NOT_FOUND);
						}
					}
					SubClassConverter.securityModelToSubClassModel(data, function(err, subClassEntity){

						SubClassService.uniquenessCheckAndImportedCheck(subClassEntity, function(err, status, rs){
							if(err){
								if(status === responseCodes.INTERNAL_SERVER_ERROR){
									logger.error(err);
									return cb(err, responseCode.INTERNAL_SERVER_ERROR);
								}else if(status === responseCodes.ALREADY_DELETED){
									logger.error("assetClassExistenceCheck() " + err);
									return cb(err, responseCodes.NOT_FOUND);
								}
							}
							cb(null, responseCodes.SUCCESS, null);
						});
				    });
				});
		  });
		});
	});
};
	
SecurityService.prototype.checkForStatusOfSecurityBeingAddedInSecuritySet = function(data, cb){
	
	logger.info(" check for status security which is being added in security set service (checkForStatusOfSecurityBeingAddedInSecuritySet())");
		
	securityDao.checkForSecurityStatus(data, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			var rTurn = {};
			rTurn[securityStatus.EXCLUDED] = {length : 0};
			rTurn[securityStatus.OPEN] = {length : 0};
			rTurn[securityStatus.NOT_APPROVED] = {length : 0};
			rTurn["isDeleted"] = {length : 0};
			rs.forEach(function(value){
				if(value.isDeleted === 1){
					rTurn["isDeleted"][value.id] = 1;	
					if(rTurn["isDeleted"].length){
						rTurn["isDeleted"].length++;
					}else{
						rTurn["isDeleted"].length = 1;
					}
				}else if(value.status === securityStatus.EXCLUDED){
					rTurn[securityStatus.EXCLUDED][value.id] = 1;
					if(rTurn[securityStatus.EXCLUDED].length){
						rTurn[securityStatus.EXCLUDED].length++;
					}else{
						rTurn[securityStatus.EXCLUDED].length = 1;
					}
				}else if(value.status === securityStatus.OPEN){
					rTurn[securityStatus.OPEN][value.id] = 1;	
					if(rTurn[securityStatus.OPEN].length){
						rTurn[securityStatus.OPEN].length++;
					}else{
						rTurn[securityStatus.OPEN].length = 1;
					}
				}else if(value.status === securityStatus.NOT_APPROVED){
					rTurn[securityStatus.NOT_APPROVED][value.id] = 1;	
					if(rTurn[securityStatus.NOT_APPROVED].length){
						rTurn[securityStatus.NOT_APPROVED].length++;
					}else{
						rTurn[securityStatus.NOT_APPROVED].length = 1;
					}
				}
			});
			cb(null, responseCodes.SUCCESS, rTurn);
		}
	})
};

SecurityService.prototype.getSecurityBySymbol = function(data, cb){
	logger.info(" get security by symbol (getSecurityBySymbol())");
	
	securityDao.getSecurityBySecuritySymbol(data, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			return cb(null, responseCodes.SUCCESS, rs);
		}
	})
};

// For Trade tool
SecurityService.prototype.getSecurity = function (data, cb) {
    logger.info("Get security service called (getSecurity())");
    securityDao.getSecurity(data, function (err, securityList) {
        if (err) {
            logger.error("Error in getting security  (getSecurity())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Security returned successfully (getSecurity())");
        return cb(null, responseCodes.SUCCESS, securityList);
    });
};
// For Trade tool
SecurityService.prototype.getSellSecurityList = function (data, cb) {
    logger.info("Get security List service called (getSellSecurityList())");
    var self = this;
    self.getSecurity(data, function (err, status, securityIds) {
        if (err) {
            logger.error("Error in getting security Ids  (getSellSecurityList())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (securityIds.length > 0) {
            data.securityIds = securityIds;
            securityDao.getSellSecurityList(data, function (err, securityList) {
                if (err) {
                    logger.error("Error in getting security List (getSellSecurityList())" + err);
                    return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                }
                logger.info("Security returned successfully (getSellSecurityList())");
                return cb(null, responseCodes.SUCCESS, securityList);
            });
        } else {
            return cb(null, responseCodes.SUCCESS, []);
        }
    });
};
//Get Security List Exclude PortfolioIds
SecurityService.prototype.getSecurityListExcludePortfolioIds = function (data, cb) {
    logger.info("Get security service called (getSecurity())");
    securityDao.getSecurityListExcludePortfolioIds(data, function (err, securityList) {
        if (err) {
            logger.error("Error in getting security  (getSecurity())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Security returned successfully (getSecurity())");
        return cb(null, responseCodes.SUCCESS, securityList);
    });
};
