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
var securitySetDao = require('dao/security/SecuritySetDao.js');
var SecuritySetConverter = require("converter/security/SecuritySetConverter.js");

var CustodianSecuritySymbol = require('entity/custodian/CustodianSecuritySymbol.js');
var SecuritySetDetailEntity = require("entity/security/SecuritySetDetail.js");
var SecuritySetSecurityEquivalentEntity = require("entity/security/SecuritySetSecurityEquivalent.js");
var SecuritySetSecurityTLHEntity = require("entity/security/SecuritySetSecurityTLH.js");

var SecuritySetDetailModel = require("model/security/SecuritySetSecurity.js");
var SecuritySetSecurityEquivalentModel = require("model/security/SecuritySetSecurityEquivalent.js");
var SecuritySetSecurityTLHModel = require("model/security/SecuritySetSecurityTLH.js");
var utilService = new (require('service/util/UtilService'))();
var utilDao = require('dao/util/UtilDao.js');

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
var reverseSellPriorities = applicationEnum.reverseSellPriorities;
var reverseBuyPriorities = applicationEnum.reverseBuyPriorities;

var custodianService = new CustodianService();

SecuritySetService.prototype.getAllSecuritySets = function(data, cb){
			securitySetDao.getAllSecuritySets(data, function(err, data){
				if(err){
					logger.error(err);
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
			securitySetDao.getDetailedSecuritySetById(data, function(err, rs){
				if(err){
					logger.error(err);
					return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
							security.buyPriority = reverseBuyPriorities[value.buyPriority];
							security.sellPriority = reverseSellPriorities[value.sellPriority];
							
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
							equivalence.buyPriority = reverseBuyPriorities[value.equivalenceBuyPriority];
							equivalence.sellPriority = reverseSellPriorities[value.equivalenceSellPriority];
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
		 
SecuritySetService.prototype.getSecuritySet = function(data, cb){
			 var self = this;
			 
			 var securitySetEntity = SecuritySetConverter.getSecuritySetEntityFromSecuritySetRequest(data);
			 securitySetDao.getSecuritySet(securitySetEntity, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }
				 cb(null, responseCodes.SUCCESS, rs);
			 });
			 
};
		 
SecuritySetService.prototype.deleteSecuritySet = function(data, cb){
			 var self = this;
			 
			 var securitySetEntity = SecuritySetConverter.getSecuritySetEntityFromSecuritySetRequest(data);
			 securitySetDao.deleteSecuritySet(securitySetEntity, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }
				 if (rs.affectedRows > 0) {
					 var model = new SecuritySetDetailModel();
					 baseConverter(model, data);
					 model.securitySetId = data.id;
					 	self.deleteSecuritySetDetail(model, function(err, rs){
					 		if(err){
					 			logger.error(err);
					 			 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
					 		}
					 		logger.info("securityset deleted successfully (deleteSecuritySet())" + data.roleId);
					 		return cb(null, responseCodes.SUCCESS, { "message": messages.securitySetDeleted });
					 	});
					} else {
						logger.info("securityset  not Found Or already deleted(deleteSecuritySet())" + data.orionConnectExternalId);
						return cb(messages.securitySetNotFoudOrDeleted, responseCodes.NOT_FOUND);
					}
			 });	
			 
};
		 
SecuritySetService.prototype.deleteSecuritySetDetail = function(data, cb){
			 var self = this;
			 
			 var dateTime = utilDao.getSystemDateTime(null);
			 
			 var securitySetDetailEntity = new SecuritySetDetailEntity();
			 securitySetDetailEntity.reqId = data.reqId;
			 securitySetDetailEntity.securitySetId = data.securitySetId;
			 securitySetDetailEntity.editedBy = utilService.getAuditUserId(data.user);
			 securitySetDetailEntity.editedDate = dateTime;
			 securitySetDetailEntity.idsNotToDelete = data.idsNotToDelete;
			 securitySetDao.getSecuritySetSecuritiesIdsToDelete(securitySetDetailEntity, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }
				 var securityIdsToDelete = rs;
				 securitySetDao.deleteSecuritySetDetail(securitySetDetailEntity, function(err, rs){
					 if(err){
						 logger.error(err);
						 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
					 }
					 if (rs.affectedRows > 0) {
						 securitySetDetailEntity.securityId = securityIdsToDelete;
						 securitySetDao.deleteSecuritySetEquivalence(securitySetDetailEntity, function(err, rs){
							 if(err){
								 logger.error(err);
								 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
							 }
							 securitySetDao.deleteSecuritySetTLH(securitySetDetailEntity, function(err, rs){
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
	
	var securitySetEntity = SecuritySetConverter.getSecuritySetDetailTLHEntityFromSecuritySetSecurityRequest(data);
	securitySetEntity.tidsNotToDelete = data.tlhNotToRemove;
	securitySetDao.deleteSecuritySetTLH(securitySetEntity, function(err, rs){
		 if(err){
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 return cb(err, responseCodes.SUCCESS, rs);
	});
	
};

SecuritySetService.prototype.deleteSecuritySetEquivalence = function(data, cb){
	
	var securitySetEntity = SecuritySetConverter.getSecuritySetDetailEquivalentEntityFromSecuritySetSecurityRequest(data);
	securitySetEntity.eidsNotToDelete = data.equivalencesNotToRemove;
	securitySetDao.deleteSecuritySetEquivalence(securitySetEntity, function(err, rs){
		 if(err){
			 return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
		 }
		 return cb(err, responseCodes.SUCCESS, rs);
	});
};
		 
SecuritySetService.prototype.createOrUpdateSecuritySet = function(data, cb){
			 var self = this;
			 
			 var securitySetEntity = SecuritySetConverter.getSecuritySetEntityFromSecuritySetRequest(data);
			 securitySetDao.getSecuritySet(securitySetEntity, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }
				 if(rs && rs.length === 0){
					 securitySetDao.createSecuritySet(securitySetEntity, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						 }else{
							 data.id = rs.insertId; 
							 cb(null, responseCodes.CREATED, rs);
						 }
					 });				 					 
				 }else{
					 securitySetDao.updateSecuritySet(securitySetEntity, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
			 var self = this;
			 var securitySetEntity = SecuritySetConverter.getSecuritySetDetailEntityFromSecuritySetModel(data);
			 securitySetDao.getSecuritySetDetail(securitySetEntity, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }
				 if(rs && rs.length === 0){
					 securitySetDao.createSecuritySetDetail(securitySetEntity, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						 }else{
							 cb(null, responseCodes.SUCCESS, rs);
						 }
					 });				 					 
				 }else{
					 securitySetDao.updateSecuritySetDetail(securitySetEntity, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						 }else{
							 cb(null, responseCodes.SUCCESS, rs);
						 }
					 });
				 }
			 });
			 
			 
};
		 
SecuritySetService.prototype.createOrUpdateSecuritySetDetailEquivalent = function(data, cb){
			 var self = this;
			 
			 var securitySetEntity = SecuritySetConverter.getSecuritySetDetailEquivalentEntityFromSecuritySetSecurityRequest(data);
			 securitySetDao.getEquivalentSecuritiesInSecuritySet(securitySetEntity, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }
				 if(rs && rs.length === 0){
					 securitySetDao.createSecuritySetEquivalence(securitySetEntity, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						 }else{
							 cb(null, responseCodes.SUCCESS, rs);
						 }
					 });				 					 
				 }else{
					 securitySetDao.updateSecuritySetEquivalence(securitySetEntity, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						 }else{
							 cb(null, responseCodes.SUCCESS, rs);
						 }
					 });
				 }
			 });
};
		 
SecuritySetService.prototype.createOrUpdateSecuritySetDetailTLH = function(data, cb){
			 var self = this;
			 
			 var securitySetEntity = SecuritySetConverter.getSecuritySetDetailTLHEntityFromSecuritySetSecurityRequest(data);
			 securitySetDao.getTLHSecuritiesInSecuritySet(securitySetEntity, function(err, rs){
				 if(err){
					 logger.error(err);
					 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }
				 if(rs && rs.length === 0){
					 securitySetDao.createSecuritySetTLH(securitySetEntity, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						 }else{
							 cb(null, responseCodes.SUCCESS, rs);
						 }
					 });				 					 
				 }else{
					 securitySetDao.updateSecuritySetTLH(securitySetEntity, function(err, rs){
						 if(err){
							 logger.error(err);
							 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
						 }else{
							 cb(null, responseCodes.SUCCESS, rs);
						 }
					 });
				 }
			 });
};
		 
SecuritySetService.prototype.createSecuritySet = function(data, cb){
			 var self = this;
			 
			 var securityCreateUpdateStatus = null;
			 
			 self.checkForSecurityStatusBeingAddedInSecuritySet(data, function(err, status, rs){
				 if(err){
					 logger.error(err);
					 if(status != responseCodes.INTERNAL_SERVER_ERROR){
						 return cb(err, status); 
					 }
					 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }
				 self.createOrUpdateSecuritySet(data, function(err, status, rs){
					 securityCreateUpdateStatus = status;
					 if(err){
						 logger.error(err);
						 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
										 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
									 }else{
										 
										 var cbFun = cbCaller(2, function(err, rs){
											 if(err){
												 next(err);
												 logger.error(err);
												 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
														 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
														 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
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
										return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
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
							 baseConverter(securitySetDetailEntity, data);
							 securitySetDetailEntity.securitySetId = data.id;
							 self.deleteSecuritySetDetail(securitySetDetailEntity, function(err, status,  rs){
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
			 var securityIds = data.securityIds;
			 if(securityIds && securityIds.length > 0){
					data.securityIds = UtilHelper.getUniqueElementsFromList(securityIds);
				 SecurityService.checkForStatusOfSecurityBeingAddedInSecuritySet(data, function(err, status, rs){
					 if(err){
						 logger.error(err);
						 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
					 }else{
						 if(rs[securityStatus.EXCLUDED].length){
							 cb(messages.securitySetSecurityCannotBeAddedBecauseOfStatus, responseCodes.UNPROCESSABLE);
						 }else if(rs[securityStatus.INACTIVE].length){
							 cb(messages.securitySetSecurityCannotBeAddedBecauseOfStatus, responseCodes.UNPROCESSABLE);
						 }else if(rs[securityStatus.ACTIVE].length != data.securityIds.length){
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
			 data.securityId = data.id;
			 securitySetDao.securityInSecuritySet(data, function(err, rs){
				 if(err){
						logger.error(err);
						 return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
				 }else{
					 if(rs.length === 0 ){
						 cb(null, responseCodes.SUCCESS, null)						 
					 }else{
						 cb(null, responseCodes.UNPROCESSABLE, null)
					 }
				 }
			 });
};
