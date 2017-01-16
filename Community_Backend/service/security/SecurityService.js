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
var securityDao = require('dao/security/SecurityDao.js');
var CustodianService = require("service/admin/CustodianService.js");
var SecurityConverter = require("converter/security/SecurityConverter.js");
var CustodianSecuritySymbol = require('model/custodian/CustodianSecuritySymbol.js');
var SecurityConverter = require('converter/security/SecurityConverter.js');
var CategoryConverter = require('converter/security/CategoryConverter.js');
var CategoryService = require('service/security/CategoryService.js');
var ClassConverter = require('converter/security/ClassConverter.js');
var ClassService = require('service/security/ClassService.js');
var SubClassConverter = require('converter/security/SubClassConverter.js');
var SubClassService = require('service/security/SubClassService.js');
var SecuritySetService = require('service/security/SecuritySetService.js');
var SecurityTypeService = require("service/security/SecurityTypeService.js");
var securityTypeService = new SecurityTypeService();
var utilService = new (require('service/util/UtilService'))();
var constants = config.orionConstants;
var messages = config.messages;
var responseCodes = config.responseCode;
var httpResponseCodes = config.responseCodes;
var orionApiResponseKeys = constants.orionApiResponseKey;
var applicationEnum = config.applicationEnum;
var securityStatus = applicationEnum.securityStatus;

var custodianService = new CustodianService();


SecurityService.prototype.getDetailedSecurityById = function(data, cb){
		logger.info("Get security details by id service called (getDetailedSecurityById())");

		securityDao.getDetailedSecurityById(data, function(err, result){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
 
SecurityService.prototype.checkForSecurityExistence = function(data, cb){
		
		var securityEntity = SecurityConverter.securityModelToSecurityEntity(data);
		securityDao.getDetailedSecurity(securityEntity, function(err, result){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
				return cb(null, responseCodes.SUCCESS);
			}else{
				return cb(messages.securityNotFound, responseCodes.ALREADY_DELETED);
			}
		});
		
};
	
SecurityService.prototype.getSecurityList = function(data, cb){
		logger.info("Get all security service called (getDetailedSecurity())");
//		if(!data.statusId){
//			data.statusId = securityStatus.EXCLUDED;
//		}
		securityDao.getSecuritiesList(data, function(err, result){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
			}else{
				if(!!result){
					cb(null, responseCodes.SUCCESS, result);
				}else{
					cb(null, responseCodes.SUCCESS, []);
				}
			}
		});
};
	  
SecurityService.prototype.orionTickerSearch = function(data, cb){
		
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
	            		logger.error("Error in get user detail from orion connect service (getUserDetailFromConnectAPI())" + err);
	            		return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
	            	}
	            	if(response.statusCode !== httpResponseCodes.SUCCESS){
	            		logger.error(response[orionApiResponseKeys.errorMessage]);
	            		return cb(response[orionApiResponseKeys.errorMessage], response.statusCode, null);
	            	}
	            	try{
	            		body = JSON.parse(body);
	            	}catch(e){
	            		logger.error("Error in get user detail from orion connect service (getUserDetailFromConnectAPI())" + err);
	            		return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
	            	}
	            	body = SecurityConverter.getSecurityToResponseListFromOrionList(body);
	            	logger.info("Get user detail from orion connect service completed successfully (getUserDetailFromConnectAPI())");
	            	cb(err, response.statusCode, body);
	            });
	        }
	    });
		
};
	  
SecurityService.prototype.createOrUpdateSecurityPrice = function(data, cb){
		
		var securityPriceEntity = SecurityConverter.securityModelToSecurityPriceEntity(data);
		if(data.price !=null || data.price != undefined){
			securityDao.insertSecurityPrice(securityPriceEntity, function(err, result){
				if(err){
					logger.error(err);
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				}else{
					cb(err, responseCodes.SUCCESS, result);
				}
			});			
		}else{
			cb(null, responseCodes.SUCCESS, {});
		}
		
};
	  
SecurityService.prototype.updateSecurityGeneral = function(data, cb){
	
		var self = this;
		logger.info("Updte security price service called (updateSecurityPrice())");


		var securityEntity = SecurityConverter.securityModelToSecurityEntity(data);
		self.assetClassExistenceCheck(data, function(err, status, rs){
			if(err){
				if(status === responseCodes.INTERNAL_SERVER_ERROR){
					logger.error(err);
					return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
				}else if(status === responseCodes.ALREADY_DELETED){
					logger.error("updateSecurityGeneral() " + err);
					return cb(err, responseCodes.NOT_FOUND);
				}else{
					logger.error("updateSecurityGeneralClass() " + err);
					return cb(err, status);
				}
			}else{
				SecuritySetService.securityAssociationInSecuritySetCheck(data, function(err, status, rs){
					if(err){
						logger.error(err);
						return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
					}
					if(status === responseCodes.SUCCESS){
							securityDao.updateSecurityGeneral(securityEntity, function(err, result){
								if(err){
									logger.error(err);
									return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
								}else{
									cb(err, responseCodes.SUCCESS, result);
								}
							});								
					}else{
						self.getDetailedSecurityById(data, function(err, status, rs){
							if(err){
								logger.error(err);
								return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
							}
							if(rs.status === data.status){
								securityDao.updateSecurityGeneral(securityEntity, function(err, result){
									if(err){
										logger.error(err);
										return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
									}else{
										cb(err, responseCodes.SUCCESS, result);
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
};
	
SecurityService.prototype.createSecurityGeneral = function(data, cb){
		
		var self = this;
		logger.info("Updte security price service called (updateSecurityPrice())");

		var securityEntity = SecurityConverter.securityModelToSecurityEntity(data);
		
		securityTypeService.checkSecurityTypeExistence(data, function(err, status, rs){
			if(err){
				logger.error(err);
				return cb(err, status);
			}
			securityDao.createSecurityGeneral(securityEntity, function(err, result){
				if(err){
					logger.error(err);
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				}
				data.id = result.insertId;
				return cb(null, responseCodes.CREATED, result);
				
			});			
		});
};
	
SecurityService.prototype.deleteSecurityGeneral = function(data, cb){
		
		logger.info("Updte security price service called (deleteSecurityGeneral())");
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
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if(status === responseCodes.SUCCESS){
					var securityEntity = SecurityConverter.securityModelToSecurityEntity(data);
					securityEntity.statusId = securityStatus.INACTIVE;
					securityDao.deleteSecurity(securityEntity, function(err, result){
						if(err){
							logger.error(err);
							return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						}else{
							if (result.affectedRows > 0) {
								var securityPriceEntity = SecurityConverter.securityModelToSecurityPriceEntity(data);
								securityDao.deleteSecurityPrice(securityPriceEntity, function(err, rs){
									if(err){
										logger.error(err);
										return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
									}					
									custodianService.deleteCustodianSecuritySymbol(data, function(err, status, rs){
										if(err){
											logger.error(err);
											return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
					return cb(messages.securityCannotBeDeleted, responseCodes.UNPROCESSABLE);
				}
			});
		})
		
};
	
SecurityService.prototype.createSecurity = function(data, cb){
		
		var self = this;
		logger.info("create security service called (createSecurity())");
		var securityEntity = SecurityConverter.securityModelToSecurityEntity(data);
		self.checkForSecurityExistence(data, function(err, status, rs){
			if(err){
				logger.error(err);
				if(status === responseCodes.INTERNAL_SERVER_ERROR){
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);					
				}else if(status == responseCodes.DUPLICATE_ENTRY || status == responseCodes.EXISTS){
					return cb(err, status);
				}
			}

			if(status != responseCodes.SUCCESS){
				self.createSecurityGeneral(data, function(err, status, result){
					if(err){
						logger.error(err);
						if(status === responseCodes.UNPROCESSABLE){
							return cb(err, status);
						}
						return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
					}
					
					self.createOrUpdateSecurityPrice(data, function(err, result){
						if(err){
							logger.error(err);
							return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						}else{
							self.getDetailedSecurityById(data, function(err, status, rs){
								if(err){
									logger.error(err);
									return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
	
SecurityService.prototype.updateSecurity = function(data, cb){
		
		var self = this;
		
		logger.info("Updte security service called (updateSecurity())");
		self.checkForSecurityExistence(data, function(err, status, result){
			if(err){
				if(status == responseCodes.EXISTS){
					return cb(messages.securitySymbolDuplicateConstraint, responseCodes.DUPLICATE_ENTRY);
				}else{
					return cb(err, status);
				}
			}
			self.updateSecurityGeneral(data, function(err, status, result){
				if(err){
					logger.error(err);
					if(status === responseCodes.NOT_FOUND){
						return cb(err, status);
					}else if(status === responseCodes.UNPROCESSABLE){
						return cb(err, status);
					}
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				}
				if(result && result.affectedRows>0){
					self.createOrUpdateSecurityPrice(data, function(err, status, result){
						if(err){
							logger.error(err);
							return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
											return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
										}
										self.getDetailedSecurityById(data, cb);
									});						
								}else{
									var tempCustodianEntity = new CustodianSecuritySymbol();
									tempCustodianEntity.reqId = data.reqId;
									tempCustodianEntity.securityId = data.id
									tempCustodianEntity.user = data.user;
									
									custodianService.deleteCustodianSecuritySymbol(tempCustodianEntity, function(err, rs){
										if(err){
											logger.error(err);
											return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
		})
};
	
SecurityService.prototype.getAssetWeightingsForSecurity = function(data, cb){
		securityDao.getAssetWeightingsForSecurity(data, function(err, rs){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
			}
			var securityDetail = {};

			if(rs && rs.length>0){
				
				securityDetail.id = null;
				securityDetail.assetCategories = [];
				securityDetail.assetClasses = [];
				securityDetail.assetSubClasses = [];
				
				rs.forEach(function(value, index){
					securityDetail.id = value.id;
					var temp = {};
					
					
					if(value.relatedType === "CLASS"){
						temp.id = value.assetClassId;
						temp.name = value.assetClassName;
						securityDetail.assetClasses.push(temp);
					}else if(value.relatedType === "SUBCLASS"){
						temp.id = value.assetSubClassId;
						temp.name = value.assetSubClassName;
						securityDetail.assetSubClasses.push(temp);
					}else if(value.relatedType === "CATEGORY"){
						temp.id = value.assetCategoryId;
						temp.name = value.assetCategoryName;
						securityDetail.assetCategories.push(temp);
					}					

					temp.weightPercentage = value.weightingPercentage;
					temp.isDeleted = value.isDeleted;
					temp.createdOn = value.createdOn;
					temp.createdBy = value.createdBy;
					temp.editedOn = value.editedOn;
					temp.editedBy = value.editedBy;
				})
			}

			cb(null, responseCodes.SUCCESS, securityDetail);
		})
};
	/*
	 * need to check if security exists*/
SecurityService.prototype.updateAssetWeightingsForSecurity = function(data, cb){
		var self = this;
		var dateTime = utilDao.getSystemDateTime(null);;
		SecurityConverter.securityModelToAssetWeightingsEntity(data, function(err, entityList){
				var entity = {}; 
				entity.reqId = data.reqId;
				entity.securityId = data.id;
				entity.editedBy = utilService.getAuditUserId(data.user);
				entity.editedDate = dateTime;
				securityDao.deleteAssetWeightingsForSecurity(entity, function(err, rs){
					if(err){
						logger.error(err);
						return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
					}
					var obj = {};
					obj.reqId = data.reqId;
					obj.entityList = entityList;
					securityDao.createOrUpdateAssetWeightingsForSecurity(obj, function(err, rs){
						if(err){
							logger.error(err);
							return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						}
						self.getAssetWeightingsForSecurity(data, cb);
					});
			})
		});
};

SecurityService.prototype.assetClassExistenceCheck = function(data, cb){
		
		CategoryConverter.securityModelToCategoryModel(data, function(err, categoryEntity){

			CategoryService.uniquenessCheckAndImportedCheck(categoryEntity, function(err, status, rs){
				if(err){
					if(status === responseCodes.INTERNAL_SERVER_ERROR){
						logger.error(err);
						return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
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
								return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
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
										return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
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
	
		
		securityDao.checkForSecurityStatus(data, function(err, rs){
			if(err){
				logger.error(err);
				return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
			}else{
				var rTurn = {};
				rTurn[securityStatus.EXCLUDED] = {length : 0};
				rTurn[securityStatus.ACTIVE] = {length : 0};
				rTurn[securityStatus.NOT_APPROVED] = {length : 0};
				rTurn[securityStatus.INACTIVE] = {length : 0};
				rs.forEach(function(value){
					if(value.status === securityStatus.EXCLUDED){
						rTurn[securityStatus.EXCLUDED][value.id] = 1;
						if(rTurn[securityStatus.EXCLUDED].length){
							rTurn[securityStatus.EXCLUDED].length++;
						}else{
							rTurn[securityStatus.EXCLUDED].length = 1;
						}
					}else if(value.status === securityStatus.ACTIVE){
						rTurn[securityStatus.ACTIVE][value.id] = 1;	
						if(rTurn[securityStatus.ACTIVE].length){
							rTurn[securityStatus.ACTIVE].length++;
						}else{
							rTurn[securityStatus.ACTIVE].length = 1;
						}
					}else if(value.status === securityStatus.NOT_APPROVED){
						rTurn[securityStatus.NOT_APPROVED][value.id] = 1;	
						if(rTurn[securityStatus.NOT_APPROVED].length){
							rTurn[securityStatus.NOT_APPROVED].length++;
						}else{
							rTurn[securityStatus.NOT_APPROVED].length = 1;
						}
					}else if(value.status === securityStatus.INACTIVE){
						rTurn[securityStatus.INACTIVE][value.id] = 1; 
						if(rTurn[securityStatus.INACTIVE].length){
							rTurn[securityStatus.INACTIVE].length++;
						}else{
							rTurn[securityStatus.INACTIVE].length = 1;
						}
					}
				});
				cb(null, responseCodes.SUCCESS, rTurn);
			}
		})
};