"use strict";

var moduleName = __filename;


var _ = require("lodash");
var config = require('config');
var helper = require("helper");
var util = require('util');

var SecuritySetService = function(){};
module.exports = new SecuritySetService();

var baseConverter = require('converter/base/BaseConverter.js');
var sharedCache = require('service/cache/').shared;
var localCache = require('service/cache/').local;
var SecurityService = require("service/security/SecurityService.js");
var CustodianService = require("service/admin/CustodianService.js");
var modelService = require('service/model/ModelService.js');
var SecuritySetConverter = require("converter/security/SecuritySetConverter.js");
var securitySetDao = require('dao/security/SecuritySetDao.js');

var SecuritySetDetailEntity = require("entity/security/SecuritySetDetail.js");
var SecuritySetSecurityEquivalentEntity = require("entity/security/SecuritySetSecurityEquivalent.js");
var SecuritySetSecurityTLHEntity = require("entity/security/SecuritySetSecurityTLH.js");
var SecuritySetDetailModel = require("model/security/SecuritySetSecurity.js");
var SecuritySetSecurityEquivalentModel = require("model/security/SecuritySetSecurityEquivalent.js");
var SecuritySetSecurityTLHModel = require("model/security/SecuritySetSecurityTLH.js");
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();

var UtilHelper = helper.utilHelper;

var logger = helper.logger(moduleName);
var messages = config.messages;
var constants = config.orionConstants;
var responseCodes = config.responseCode;
var orionApiResponseKeys = constants.orionApiResponseKey;
var applicationEnum = config.applicationEnum;
var asyncFor = helper.asyncFor;
var cbCaller = helper.cbCaller;
var securityStatus = applicationEnum.securityStatus;
var roleType = applicationEnum.roleType;
var custodianService = new CustodianService();

SecuritySetService.prototype.getAllSecuritySets = function(data, cb){
	logger.info(" Get all securitysets (getAllSecuritySets())");
	
	securitySetDao.getAllSecuritySets(data, function(err, data){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			if(!!data){
				cb(null, responseCodes.SUCCESS, data);
			}else{
				cb(null, responseCodes.SUCCESS, []);
			}
		}
	});
};

SecuritySetService.prototype.getSellPriorities = function(data, cb){
	logger.info(" Get SellPriorities (getSellPriorities())");
	
	securitySetDao.sellPriorities(data, function(err, data){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			if(!!data){
				cb(null, responseCodes.SUCCESS, data);
			}else{
				cb(null, responseCodes.SUCCESS, []);
			}
		}
	});
};

SecuritySetService.prototype.getBuyPriorities = function(data, cb){	
	logger.info(" Get BuyPriorities (getBuyPriorities())");

	securitySetDao.buyPriorities(data, function(err, data){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			if(!!data){
				cb(null, responseCodes.SUCCESS, data);
			}else{
				cb(null, responseCodes.SUCCESS, []);
			}
		}
	});
};

SecuritySetService.prototype.getDetailedSecuritySetById = function(data, cb){
	logger.info(" Get getDetailedSecuritySetById (getDetailedSecuritySetById())");

	securitySetDao.getDetailedSecuritySetById(data, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			var equivalence = rs.equivalence;
			var tlh = rs.tlh;
			
			var rTurn = {};
			if(equivalence){
				equivalence.forEach(function(value, index){
					
					if(!rTurn.id){
						rTurn.id = value.id;
						rTurn.name = value.name;
						rTurn.description = value.description;	
						rTurn.isDynamic = value.isDynamic;
						rTurn.toleranceType = value.toleranceType;
						rTurn.toleranceTypeValue = value.toleranceTypeValue;
						rTurn.createdOn = value.createdOn;
						rTurn.createdBy = value.createdBy;
						rTurn.editedOn = value.editedOn;
						rTurn.editedBy = value.editedBy;
						rTurn.securities = {};
					}
					
					var security = {};
					
					security.id = value.securityId;
					security.name = value.securityName;
					security.symbol = value.securitySymbol;
					security.securityTypeId = value.securityTypeId;
					security.securityType = value.securityType;
					security.targetPercent = value.targetPercent;
					
					security.lowerModelTolerancePercent = value.lowerModelTolerancePercent;
					security.upperModelTolerancePercent = value.upperModelTolerancePercent;
					security.lowerModelToleranceAmount = value.lowerModelToleranceAmount;
					security.upperModelToleranceAmount = value.upperModelToleranceAmount;
					
					security.symbol = value.securitySymbol;
					security.rank = value.rank;
					
					var taxableSecurity = {
							id : value.taxableSecurityId,
							name : value.taxableSecurityName,
							symbol : value.taxableSecuritySymbol,
							securityTypeId : value.taxableSecurityTypeId,
							securityType : value.taxableSecurityType
					};
					var taxableDeferredSecurity = {
							id : value.taxDeferredSecurityId,
							name : value.taxDeferredSecurityName,
							symbol : value.taxDeferredSecuritySymbol,
							securityTypeId : value.taxDeferredSecurityTypeId,
							securityType : value.taxDeferredSecurityType
					};
					var taxExemptSecurity = {
							id : value.taxExemptSecurityId,
							name : value.taxExemptSecurityName,
							symbol : value.taxExemptSecuritySymbol,
							securityTypeId : value.taxExemptSecurityTypeId,
							securityType : value.taxExemptSecurityType
					};
					
					security.taxableSecurity = taxableSecurity;
					security.taxDeferredSecurity = taxableDeferredSecurity;
					security.taxExemptSecurity = taxExemptSecurity
				
					security.minTradeAmount = value.minTradeAmount;
					security.minInitialBuyDollar = value.minInitialBuyDollar;
					security.buyPriority = {
							id : value.buyPriorityId,
							displayName : value.buyPriorityDisplayName
					}
					
					security.sellPriority = {
							id : value.sellPriorityId,
							displayName : value.sellPriorityDisplayName
					}
					
					security.equivalences = [];
					security.tlh = [];
						
					var equivalence = {};
					equivalence.id = value.equivalentSecurityId;
					equivalence.name = value.equivalenceSecurityName;
					equivalence.symbol = value.equivalenceSecuritySymbol;
					equivalence.securityTypeId = value.equivalenceSecurityTypeId;
					equivalence.securityType = value.equivalenceSecurityType;
					
					var etaxableSecurity = {
							id : value.tEquivalenceSecurityId,
							name : value.tEquivalenceSecurityName,
							symbol : value.tEquivalenceSecuritySymbol,
							securityTypeId : value.tEquivalenceSecurityTypeId,
							securityType : value.tEquivalenceSecurityType
					};
					var etaxableDeferredSecurity = {
							id : value.tdEquivalenceSecurityId,
							name : value.tdEquivalenceSecurityName,
							symbol : value.tdEquivalenceSecuritySymbol,
							securityTypeId : value.tdEquivalenceSecurityTypeId,
							securityType : value.tdEquivalenceSecurityType
					};
					var etaxExemptSecurity = {
							id : value.teEquivalenceSecurityId,
							name : value.teEquivalenceSecurityName,
							symbol : value.teEquivalenceSecuritySymbol,
							securityTypeId : value.teEquivalenceSecurityTypeId,
							securityType : value.teEquivalenceSecurityType
					};
					equivalence.taxableSecurity = etaxableSecurity;
					equivalence.taxDeferredSecurity = etaxableDeferredSecurity;
					equivalence.taxExemptSecurity = etaxExemptSecurity;
					

					equivalence.minTradeAmount = value.equivalenceMinTradeAmount;
					equivalence.minInitialBuyDollar = value.equivalenceMinInitialBuyDollar;
					equivalence.buyPriority = {
							id : value.equivalenceBuyPriorityId,
							displayName : value.equivalenceBuyPriorityDisplayName
					}
					equivalence.sellPriority = {
							id : value.equivalenceSellPriorityId,
							displayName : value.equivalenceSellPriorityDisplayName
					}
					
					equivalence.rank = value.equivalenceRank;
					
					if(security.id){
						var securityInSet = rTurn.securities[security.id];
						if(securityInSet){
							if(equivalence.id){
								securityInSet.equivalences.push(equivalence);										
							}
						}else{
							rTurn.securities[security.id] = security;
							if(equivalence.id){
								security.equivalences.push(equivalence);										
							} 
						}
					}
				});
			}
			
			if(tlh){
				tlh.forEach(function(value, index){
					var security = rTurn.securities[value.securityId];
					var securityTlh = rTurn.securities[value.securityId].tlh;
					var tempTlh = {};
					
					tempTlh.id = value.tlhSecurityId;
					tempTlh.name = value.tlhSecurityName;
					tempTlh.symbol = value.tlhSecuritySymbol;
					tempTlh.securityTypeId = value.tlhSecurityTypeId;
					tempTlh.securityType = value.tlhSecurityType;
					tempTlh.priority = value.priority;
					securityTlh.push(tempTlh);
				});
		    }
			var objSecurities = rTurn.securities;
			
			if(objSecurities){
				rTurn.securities = [];
				_.keys(objSecurities).forEach(function(value, index){
					var security = objSecurities[value];
					rTurn.securities.push(security);
				});						
				cb(null, responseCodes.SUCCESS, rTurn);
			}else{
				cb(messages.securitySetNotFound, responseCodes.NOT_FOUND);
			}
		}
	});
};

SecuritySetService.prototype.getSecuritySetWithSecuritiesOnly = function(data, cb){
	logger.info(" Get security set with it's securitiesby security setid (getSecuritySetWithSecuritiesOnly())");
	
	var obj = {
			id : data.securitySetId,
			reqId : data.reqId
	}
	securitySetDao.getSecuritiesOnlyInSecuritySet(obj, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			return cb(null, responseCodes.SUCCESS, rs);
		}
	});
};
		 
SecuritySetService.prototype.getSecuritySet = function(data, cb){
	logger.info(" Get security set (getSecuritySet())");
	var self = this;
	
	securitySetDao.getSecuritySet(data, function(err, rs){
		 if(err){
			 logger.error(err);
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 cb(null, responseCodes.SUCCESS, rs);
	});
};
		 
SecuritySetService.prototype.deleteSecuritySet = function(data, cb){
	 logger.info(" delete security set (deleteSecuritySet())");
		
	 var self = this;
	 
	 self.checkForSecuritySetDelete(data, function(err, status, rs){
		 if(err){
			 logger.error(err);
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 if(status != responseCodes.SUCCESS){			 
			 return cb(null, status, rs);
		 }
		 
		 securitySetDao.deleteSecuritySet(data, function(err, rs){
			 if(err){
				 logger.error(err);
				 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			 }
			 if (rs.affectedRows > 0) {
				 var model = new SecuritySetDetailModel();
				 baseConverter(model, data);
				 model.securitySetId = data.id;
				 self.deleteSecuritySetDetail(model, function(err, rs){
					 if(err){
						 logger.error(err);
						 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					 }
					 logger.info("securityset deleted successfully (deleteSecuritySet())" + data.roleId);
					 return cb(null, responseCodes.SUCCESS, { "message": messages.securitySetDeleted });
				 });
			 } else {
				 logger.info("securityset  not Found Or already deleted(deleteSecuritySet())" + data.orionConnectExternalId);
				 return cb(messages.securitySetNotFoudOrDeleted, responseCodes.NOT_FOUND);
			 }
		 });
		 
	 })
};

SecuritySetService.prototype.checkForSecuritySetDelete = function(data, cb){
	 logger.info(" check for if security set can be deleted (checkForSecuritySetDelete())");

	 var self = this;
	 
	 modelService.getAllModelsWithSecuritySet(data, function(err, status, rs){
		 if(err){
			 logger.error(err);
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 if(rs && rs.length > 0){
			 return cb(err, responseCodes.UNPROCESSABLE, {message : messages.securitySetSecurityCannotBeDeletedBecauseOfModel});
		 }else{
			 return cb(err, responseCodes.SUCCESS, null);
		 }
	 })	 
};

/*	PENDING REFACTORING		 
*/SecuritySetService.prototype.deleteSecuritySetDetail = function(data, cb){
	 logger.info(" delete security set detail (deleteSecuritySetDetail())");

	var self = this;
	 
	 var dateTime = utilDao.getSystemDateTime(null);
	 securitySetDao.getSecuritySetSecuritiesIdsToDelete(data, function(err, rs){
		 if(err){
			 logger.error(err);
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 data.securityIdsToDelete = rs;
		 securitySetDao.deleteSecuritySetDetail(data, function(err, rs){
			 if(err){
				 logger.error(err);
				 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			 }
			 if (rs.affectedRows > 0) {
				 securitySetDao.deleteSecuritySetEquivalence(data, function(err, rs){
					 if(err){
						 logger.error(err);
						 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					 }
					 securitySetDao.deleteSecuritySetTLH(data, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
						 }
						 logger.info("securityset deleted successfully (deleteSecuritySet())" + data.roleId);
						 return cb(null, responseCodes.SUCCESS, { "message": messages.securitySetDeleted });
					 });
				 });
			 } else {
//						logger.info("securityset  not Found Or already deleted(deleteSecuritySet())" + data.orionConnectExternalId);
				 return cb(null, responseCodes.SUCCESS);
			 }
		 });	 
	 });
};

SecuritySetService.prototype.deleteSecuritySetTLH = function(data, cb){
	logger.info(" delete security set tlh (deleteSecuritySetTLH())");

	securitySetDao.deleteSecuritySetTLH(data, function(err, rs){
		 if(err){
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 return cb(err, responseCodes.SUCCESS, rs);
	});
	
};

SecuritySetService.prototype.deleteSecuritySetEquivalence = function(data, cb){
	logger.info(" delete security set equivalence (deleteSecuritySetEquivalence())");

	securitySetDao.deleteSecuritySetEquivalence(data, function(err, rs){
		 if(err){
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 return cb(err, responseCodes.SUCCESS, rs);
	});
};
		 
SecuritySetService.prototype.createOrUpdateSecuritySet = function(data, cb){
	logger.info(" create or update security set (createOrUpdateSecuritySet())");
	 var self = this;
	 
	 var securitySetEntity = SecuritySetConverter.getSecuritySetEntityFromSecuritySetRequest(data);
	 securitySetDao.getSecuritySet(data, function(err, rs){
		 if(err){
			 logger.error(err);
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 if(rs && rs.length === 0){
			 securitySetDao.createSecuritySet(data, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 data.id = rs.insertId; 
					 cb(null, responseCodes.CREATED, rs);
				 }
			 });				 					 
		 }else{
			 securitySetDao.updateSecuritySet(data, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 cb(null, responseCodes.SUCCESS, rs);
				 }
			 });
		 }
	 });			 
};
		 /*
		  * handled all three cases
		  *  a. creating first time
		  *  b. updating
		  *  c. creating after deleting(insert on duplicate key update)
		  *  */
SecuritySetService.prototype.createOrUpdateSecuritySetDetail = function(data, cb){
	logger.info(" create or update security set detail (createOrUpdateSecuritySetDetail())");
	
	 var self = this;
	 securitySetDao.getSecuritySetDetail(data, function(err, rs){
		 if(err){
			 logger.error(err);
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 if(rs && rs.length === 0){
			 securitySetDao.createSecuritySetDetail(data, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 cb(null, responseCodes.SUCCESS, rs);
				 }
			 });				 					 
		 }else{
			 securitySetDao.updateSecuritySetDetail(data, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 cb(null, responseCodes.SUCCESS, rs);
				 }
			 });
		 }
	 });	 
};
		 
SecuritySetService.prototype.createOrUpdateSecuritySetDetailEquivalent = function(data, cb){
	logger.info(" create or update security set equivalent (createOrUpdateSecuritySetDetailEquivalent())");
	
	var self = this;
	 
	securitySetDao.getEquivalentSecuritiesInSecuritySet(data, function(err, rs){
		 if(err){
			 logger.error(err);
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 if(rs && rs.length === 0){
			 securitySetDao.createSecuritySetEquivalence(data, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 cb(null, responseCodes.SUCCESS, rs);
				 }
			 });				 					 
		 }else{
			 securitySetDao.updateSecuritySetEquivalence(data, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 cb(null, responseCodes.SUCCESS, rs);
				 }
			 });
		 }
	 });
};
		 
SecuritySetService.prototype.createOrUpdateSecuritySetDetailTLH = function(data, cb){
	logger.info(" create or update security set tlh (createOrUpdateSecuritySetDetailTLH())");
	
	 var self = this;
	 
	 securitySetDao.getTLHSecuritiesInSecuritySet(data, function(err, rs){
		 if(err){
			 logger.error(err);
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 if(rs && rs.length === 0){
			 securitySetDao.createSecuritySetTLH(data, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 cb(null, responseCodes.SUCCESS, rs);
				 }
			 });				 					 
		 }else{
			 securitySetDao.updateSecuritySetTLH(data, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 cb(null, responseCodes.SUCCESS, rs);
				 }
			 });
		 }
	 });
};
		 
SecuritySetService.prototype.createSecuritySet = function(data, cb){
	logger.info(" create security set (createSecuritySet())");
	
	 var self = this;
	 
	 var securityCreateUpdateStatus = null;
	 
	 self.checkForSecurityStatusBeingAddedInSecuritySet(data, function(err, status, rs){
		 if(err){
			 logger.error(err);
			 if(status != responseCodes.INTERNAL_SERVER_ERROR){
				 return cb(err, status); 
			 }
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 self.createOrUpdateSecuritySet(data, function(err, status, rs){
			 securityCreateUpdateStatus = status;
			 if(err){
				 logger.error(err);
				 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			 }else{
				 var securities = data.securities;
				 var securitiesNotToRemove = [];
				 if(securities && securities.length > 0){
					 asyncFor(securities, function(value, index, next){

						 /* usefull when creating new securitySet
						 */value.securitySetId = data.id;
						 securitiesNotToRemove.push(value.securityId);
						 self.createOrUpdateSecuritySetDetail(value, function(err, status, rs){
							 if(err){
								 logger.error(err);
								 next(err);
								 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							 }else{
								 
								 var cbFun = cbCaller(2, function(err, rs){
									 if(err){
										 next(err);
										 logger.error(err);
										 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
									 }
									 next(err, value);
								 });
								 
								 var equivalences = value.equivalences;
								 var equivalencesNotToRemove = [];
								 var tlhNotToRemove = [];
								 if(equivalences && equivalences.length > 0){
									 asyncFor(equivalences, function(equi, index, next){
										 equi.securitySetId = value.securitySetId;
										 equivalencesNotToRemove.push(equi.equivalentSecurityId);
										 self.createOrUpdateSecuritySetDetailEquivalent(equi, function(err, status, rs){
											 if(err){
												 logger.error(err);
												 next(err);
												 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
											 }
											 next(err, equi); 
										 });
									 }, function(err, data){
										 data.equivalencesNotToRemove = equivalencesNotToRemove;
										 self.deleteSecuritySetEquivalence(data, function(err, rs){
											 if(err){
												 logger.error(err);
											 }
											 cbFun(err, rs);
										 })
									 });
								 }else{
									var securitySetSecurityEquivalentModel = new SecuritySetSecurityEquivalentModel();
									baseConverter(securitySetSecurityEquivalentModel, data);
									securitySetSecurityEquivalentModel.securitySetId = data.id;
									securitySetSecurityEquivalentModel.securityId = value.securityId;
									self.deleteSecuritySetEquivalence(securitySetSecurityEquivalentModel, function(err, rs){
										 if(err){
											 logger.error(err);
										 }
										 cbFun(err, rs);
									 })
								 }
								 
								 
								 var tlh = value.tlh;
								 if(tlh && tlh.length > 0){
									 asyncFor(tlh, function(tlhh, index, next){
										 tlhNotToRemove.push(tlhh.tlhSecurityId);
										 tlhh.securitySetId = value.securitySetId;
										 self.createOrUpdateSecuritySetDetailTLH(tlhh, function(err, status, rs){
											 if(err){
												 logger.error(err);
												 next(err);
												 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
											 }
											 next(err, tlhh); 
										 })
									 }, function(err, tlhh){
										 tlhh.tlhNotToRemove = tlhNotToRemove;
										 self.deleteSecuritySetTLH(tlhh, function(err, rs){
											 if(err){
												 logger.error(err);
											 }
											 cbFun(err, rs);
										 })
									 });
								 }else{
									var securitySetSecurityTLHModel = new SecuritySetSecurityTLHModel();
									baseConverter(securitySetSecurityTLHModel, data);
									securitySetSecurityTLHModel.securitySetId = data.id;
									securitySetSecurityTLHModel.securityId = value.securityId;
									self.deleteSecuritySetTLH(securitySetSecurityTLHModel, function(err, rs){
										 if(err){
											 logger.error(err);
										 }
										 cbFun(err, rs);
									});
								}
							 }
						 });
					 }, function(err, value){
						 if (err) {
								logger.error(err);
								return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
						 }
						 value.idsNotToDelete = securitiesNotToRemove;
						 self.deleteSecuritySetDetail(value, function(err, status,  rs){
							 if(err){
								 if(status!=responseCodes.NOT_FOUND){
									 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);							 
								 }
							 }
							 self.getDetailedSecuritySetById(data, function(err, status, rs){
								 if(err){
									 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
								 }
								 cb(null, securityCreateUpdateStatus, rs);
							 });
						 });
					 });
				 }else{
					 var model = new SecuritySetDetailModel();
					 baseConverter(model, data);
					 model.securitySetId = data.id;
					 self.deleteSecuritySetDetail(model, function(err, status,  rs){
						 if(err){
							 if(status!=responseCodes.NOT_FOUND){
								 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);							 
							 }
						 }
						 self.getDetailedSecuritySetById(data, function(err, status, rs){
							 if(err){
								 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							 }
							 cb(null, securityCreateUpdateStatus, rs);
						 });
					 });
			 }
	 }
	 });
 });
};

SecuritySetService.prototype.checkForSecurityStatusBeingAddedInSecuritySet = function(data, cb){
	logger.info(" check for security status which are added in security set (checkForSecurityStatusBeingAddedInSecuritySet())");
	
	 var securityIds = data.securityIds;
	 if(securityIds && securityIds.length > 0){
			data.securityIds = UtilHelper.getUniqueElementsFromList(securityIds);
		 SecurityService.checkForStatusOfSecurityBeingAddedInSecuritySet(data, function(err, status, rs){
			 if(err){
				 logger.error(err);
				 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
			 }else{
				 if(rs[securityStatus.EXCLUDED].length){
					 cb(messages.securitySetSecurityCannotBeAddedBecauseOfStatus, responseCodes.UNPROCESSABLE);
				 }else if(rs[securityStatus.OPEN].length != data.securityIds.length){
					 cb(messages.securitySetSecurityCannotBeAddedBecauseTheyAreDeleted, responseCodes.UNPROCESSABLE);
				 }else{
					 cb(null, responseCodes.SUCCESS, null)
				 }
			 } 
		 });				 
	 }else{
		 cb(null, responseCodes.SUCCESS, null);
	 }
};

SecuritySetService.prototype.securityAssociationInSecuritySetCheck = function(data, cb){
	logger.info(" check if securities are present in security set (securityAssociationInSecuritySetCheck())");
	
	var self = this;
	 self.getAllSecuritySetWithSecurity(data, function(err, status, rs){
		 if(err){
				logger.error(err);
				 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 if(rs.length === 0){
			 cb(null, responseCodes.SUCCESS, null)						 
		 }else{
			 cb(null, responseCodes.UNPROCESSABLE, null)
		 }
	 })
};

SecuritySetService.prototype.getAllSecuritySetWithSecurity = function(data, cb){
	logger.info(" get all security set with securities (getAllSecuritySetWithSecurity())");
	
	 data.securityId = data.id;
	 securitySetDao.securityInSecuritySet(data, function(err, rs){
		 if(err){
				logger.error(err);
				 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }else{
		 	logger.debug("response length is"+JSON.stringify(rs));
			 cb(null, responseCodes.SUCCESS, rs)						 
		 }
	 });
};

SecuritySetService.prototype.securitySetExistence = function(model, cb){
	logger.info(" check for security set existence (securitySetExistence())");
	
	securitySetDao.securitySetExistence(model, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}else{
			cb(null, responseCodes.SUCCESS, rs);
		}
	});
};

SecuritySetService.prototype.setUnsetFavoriteForSecuritySet = function(model, cb){
	logger.info(" update security set favorite (setUnsetFavoriteForSecuritySet())");
	
	var self = this;
	var teams = utilService.getAllTeamsForUser(model.user);
	var roleTypeId = utilService.getRoleTypeId(model.user);
	
	self.securitySetExistence(model, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		}
		if(rs && rs.length == 0){
			return cb(null, responseCodes.UNPROCESSABLE, {message : messages.securitySetNotFound});
		}
		if(teams.length == 0 && roleTypeId == roleType["FIRMADMIN"]){
			securitySetDao.setUnsetSecuritySetFavoriteInSecuritySetTable(model, function(err, rs){
				if(err){
					logger.error(err);
					return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
				}else{
					return cb(null, responseCodes.SUCCESS, {message : messages.favoriteSecuritySet});
				}
			});
		}else if(teams.length == 0){
			cb(null, responseCodes.UNPROCESSABLE, {message : messages.notAbleToSecuritySetAsFavorite});
		}else{
			asyncFor(teams, function(teamId, index, next){			
				var tmpObj = {};
				tmpObj.reqId = model.reqId;
				tmpObj.id = model.id;
				tmpObj.teamId = teamId;
				tmpObj.isFavorite = model.isFavorite;
				securitySetDao.setUnsetSecuritySetFavorite(tmpObj, function(err, rs){
					if(err){
						logger.error(err);
						return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
					}else{
						return next(err, responseCodes.SUCCESS);
					}
				});
			}, function(err, data){
				return cb(null, responseCodes.SUCCESS, {message : messages.favoriteSecuritySet});
			});
		}
	})
};
