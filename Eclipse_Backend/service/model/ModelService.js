
var moduleName = __filename;

var ModelService =  function() {}
module.exports = new ModelService();

var config = require('config');
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var TeamDao = require('dao/admin/TeamDao.js');
var ModelDao = require('dao/model/ModelDao.js');
var modelConverter = require('converter/model/ModelConverter.js');
var localCache = require('service/cache').local;
var baseConverter = require('converter/base/BaseConverter.js');
var _ = require("lodash");
var modelUtil = require("service/model/ModelUtilService.js");
var CategoryService = require("service/security/CategoryService.js");
var ClassService = require("service/security/ClassService.js");
var SubClassService = require("service/security/SubClassService.js");
var SecuritySetService = require("service/security/SecuritySetService.js");
var PortfolioDao = require('dao/portfolio/PortfolioDao.js');
var utilService = new (require('service/util/UtilService'))();
var AccountDao = require('dao/account/AccountDao.js');
var securityDao = require('dao/security/SecurityDao.js');
var utilDao = require('dao/util/UtilDao.js');
var NotificationService = require("service/notification/NotificationService.js");
var modelSleeveService = require("service/model/ModelSleeveService.js");
var accountDao = new AccountDao();
var sharedCache = require('service/cache/').shared;
var applicationEnum = config.applicationEnum;
var asyncFor = helper.asyncFor;
var cbCaller = helper.cbCaller;
var messages = config.messages;
var codes = config.responseCode;
var teamDao = new TeamDao();
var modelDao = new ModelDao();
var portfolioDao = new PortfolioDao();
var notificationService = new NotificationService();
var modelValidationMessages = messages.modelValidations;
var modelStatus = config.applicationEnum.modelStatus;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var privilegeForModelApproval = applicationEnum.modelApprovePrivilege;
var dynamicModelArbitraryAmount= applicationEnum.dynamicModelArbitraryAmount;

ModelService.prototype.getModelList = function (data, cb) {
    logger.info("Get model list service called (getModelList())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.getList(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting model list service (getModelList())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        teamDao.getTeamsWithCompleteModelAccess(data, function(err, rs){
        	 
        	if (err) {
                 logger.error("Error in getting model list service (getModelList())" + err);
                 return cb(err, codes.INTERNAL_SERVER_ERROR);
             }
        	 
        	logger.info("Model list service returned successfully (getModelList())");
        	var rTurn = modelConverter.getModelListFromModelEntityList(fetched, rs);
        	return cb(null, codes.SUCCESS, rTurn);
        })
    });
};

ModelService.prototype.getLevelsInModel = function (data, cb) {
    logger.info("Get model list service called (getModelList())");
    
    modelDao.getLevelsInModel(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting model list service (getModelList())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        var rTurn = [];
        fetched.forEach(function(value, index){
        	value = value.relatedType;
        	var json = {};
        	if(value){        		
        		json.id = relatedTypeCodeToId[value];
        		json.name = relatedTypeCodeToDisplayName[value];
        		rTurn.push(json);
        	}
        })
        return cb(null, codes.SUCCESS, rTurn);
    });
};

ModelService.prototype.getModelDashboardSummary = function (data, cb) {
    logger.info("Get model dashboard summary called (getModelDashboardSummary())");
    
    modelDao.getDashboardSummary(data, function(err, rs){
    	if (err) {
            logger.error("Error (getModelDashboardSummary())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	try{    		
    		var json = {};
    		var totalModelRS = rs[0][0];
    		var statusBasedRS = rs[1][0];
    		var OUTRS = rs[2][0];
    		json.totalNumberOfModels = totalModelRS.total;
    		json.newModels = totalModelRS.new;
    		json.existingModels = totalModelRS.existing;
    		json.approvedModels = statusBasedRS.approved;
    		json.waitingForApprovalModels = statusBasedRS.waitingForApproval;
    		json.draftModels = statusBasedRS.draft;
    		json.notActiveModels = statusBasedRS.notActive;
    		json.analyticsOn = statusBasedRS.lastUpdateDate;
    		
    		json.OUBalanceModels = OUTRS.outModel;
    		cb(null, codes.SUCCESS, json);
    	}catch(e){
    		 logger.error(e);
    		 return cb(e, codes.INTERNAL_SERVER_ERROR);
    	}
    });
    
};

ModelService.prototype.getModelPreferences = function (data, cb) {
    logger.info("Get model preference (getModelPreferences())");
    
//    modelDao.getModelPreferences(data, function(err, rs){
//    	if (err) {
//            logger.error("Error (getModelPreferences())" + err);
//            return cb(err, codes.INTERNAL_SERVER_ERROR);
//        }
//    	if(rs && rs.length > 0){ 
//    		var value = rs[0][0];
//    		if(value.value){    			
    			return cb(null, codes.SUCCESS, true);
//    		}else{
//    			return cb(null, codes.SUCCESS, false);
//    		}
//    	}else{
//    		return cb(null, codes.SUCCESS, false);
//    	}
//    });
    
};

ModelService.prototype.getModelApprovalPreference = function (data, cb) {
    logger.info("Get model approval preference (getModelApprovalPreference())");
    var self = this;
    data.preference = "modelChangeApproval";
    self.getModelPreferences(data, function(err, status, rs){
    	if (err) {
            logger.error("Error (getModelApprovalPreference())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	cb(null, status, rs);
    });
};

ModelService.prototype.getModelPortfolioAssignmentApprovalPreference = function (data, cb) {
    logger.info("Get model portfolio assignment approval preference (getModelPortfolioAssignmentApprovalPreference())");
    var self = this;
    data.preference = "modelAssignmentApproval";
    self.getModelPreferences(data, function(err, status, rs){
    	if (err) {
            logger.error("Error (getModelPortfolioAssignmentApprovalPreference())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	return cb(null, status, rs);
    });
    
};

ModelService.prototype.getTargetAllocationsForSecuritiesInSecuritySet = function (data, cb) {
    logger.info("Get target allocations for securities in security set (getTargetAllocationsForSecuritiesInSecuritySet())");
    
    if(data.id){
    	modelDao.getTargetAllocationsForSecuritiesInSecuritySetInModel(data, function(err, rs){
    		if (err) {
    			logger.error("Error (getTargetAllocationsForSecuritiesInSecuritySet())" + err);
    			return cb(err, codes.INTERNAL_SERVER_ERROR);
    		}
    		try{
    			var json = {};
    			if(rs && rs.length > 0){
    				for(var i = 0 ; i< rs.length -1 ;i++){    	
    					var value = rs[i];
    					value = value[0];
    					var securityId = value.id;
    					if(securityId in json){
    						var security = json[securityId];
    						security.targetInPercent += value.targetInPercent;
    					}else{
    						json[securityId] = value;
    					}
    				}
    			}
    			var rTurn = [];
    			for(var i in json){
    				var security = json[i];
    				security.targetInPercent = security.targetInPercent;
    				rTurn.push(security);
    			}
    			return cb(null, codes.SUCCESS, rTurn);
    		}catch(e){
    			logger.error(e);
    			return cb(e, codes.INTERNAL_SERVER_ERROR);
    		}
    	});
    }else{
    	return cb(null, codes.SUCCESS, []);
    }
    
};

ModelService.prototype.getCurrentAndTargetAllocationsForSecuritiesInSleevedAccounts = function (data, cb) {
	
    logger.info("Get current and target  (getCurrentAndTargetAllocationsForSecuritiesInSleevedAccounts())");
    
    var self = this;
    accountDao.getAccount(data, function(err, rs){
    	if (err) {
            logger.error("Error service(getCurrentAndTargetAllocationsForSecuritiesInSleevedAccounts())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	if(rs && rs.length > 0){
    		var row = rs[0];
    		var modelId = row.modelId;
    		var tmpObj = {};
    		tmpObj.reqId = data.reqId;
    		tmpObj.id = data.id;
    		tmpObj.user = data.user;
    		modelDao.getCurrentAllocationsForSecuritiesInSleevedAccounts(data, function(err, result){
    	    	if (err) {
    	            logger.error("Error service (getCurrentAndTargetAllocationsForSecuritiesInSleevedAccounts())" + err);
    	            return cb(err, codes.INTERNAL_SERVER_ERROR);
    	        }
    	    	try{
    	    		var securitiesInPortfolios = {};
    	    		var totalAmount = 0;
    	    		if(result && result.length > 0){
    	    			result.forEach(function(value, index){
    	    				totalAmount = value.total;
    	    				securitiesInPortfolios[value.securityId] = value;
    	    			})
    	    			self.getTargetAllocationsForSecuritiesInSecuritySet(tmpObj, function(err, status, rs){    	    			
    	    				if (err) {
    	    					logger.error("Error service (getCurrentAndTargetAllocationsForSecuritiesInSleevedAccounts())" + err);
    	    					return cb(err, codes.INTERNAL_SERVER_ERROR);
    	    				}
    	    				rs.forEach(function(value, index){
    	    					var security = securitiesInPortfolios[value.securityId];
    	    					value.targetInAmt = value.targetInPercent * totalAmount;
    	    					if(security){    	    						
    	    						value.currentInAmt = security.value;
    	    						value.currentInPercent = (security.value/totalAmount) *100;
    	    					}else{
    	    						value.currentInAmt = 0;
    	    						value.currentInPercent = 0;
    	    					}
    	    				})
    	    				var toSet = _.differenceWith(result, rs, function(first, second){
    	    					if(first.securityId == second.securityId)
    	    						return true;
    	    				})
    	    				toSet.forEach(function(value, index){
    	    					value.targetInAmt = 0;
    	    					value.targetInPercent = 0;
    	    					value.currentInAmt = value.value;
    	    					value.currentInPercent = (value.value/totalAmount)*100;
    	    					rs.push(value);
    	    				})
    	    				return cb(null, codes.SUCCESS, rs);
    	    			})
    	    		}else{
    	    			return cb(null, codes.SUCCESS, []);
    	    		}
    	    	}catch(e){
    	    		 logger.error(e);
    	    		 return cb(e, codes.INTERNAL_SERVER_ERROR);
    	    	}
    	    });
    	}else{
    		return cb(messages.accountNotFound, codes.UNPROCESSABLE);
    	}
    })
};

ModelService.prototype.getCurrentAndTargetAllocationsForSecuritiesInPortfolio = function (data, cb) {
	
    logger.info("Get current and target  (getCurrentAndTargetAllocationsForSecuritiesInPortfolio())");
    
    var self = this;
    portfolioDao.get(data, function(err, rs){
    	if (err) {
            logger.error("Error service(getCurrentAndTargetAllocationsForSecuritiesInPortfolio())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	if(rs && rs.length > 0){
    		var row = rs[0];
    		var modelId = row.modelId;
    		var tmpObj = {};
    		tmpObj.reqId = data.reqId;
    		tmpObj.id = modelId;
    		tmpObj.user = data.user;
    		modelDao.getCurrentAllocationsForSecuritiesInPortfolio(data, function(err, result){
    	    	if (err) {
    	            logger.error("Error service (getCurrentAndTargetAllocationsForSecuritiesInPortfolio())" + err);
    	            return cb(err, codes.INTERNAL_SERVER_ERROR);
    	        }
    	    	try{
    	    		var securitiesInPortfolios = {};
    	    		var totalAmount = 0;
    	    		if(result && result.length > 0){
    	    			result.forEach(function(value, index){
    	    				totalAmount = value.total;
    	    				securitiesInPortfolios[value.securityId] = value;
    	    			})
    	    			self.getTargetAllocationsForSecuritiesInSecuritySet(tmpObj, function(err, status, rs){    	    			
    	    				if (err) {
    	    					logger.error("Error service (getCurrentAndTargetAllocationsForSecuritiesInPortfolio())" + err);
    	    					return cb(err, codes.INTERNAL_SERVER_ERROR);
    	    				}
    	    				rs.forEach(function(value, index){
    	    					var security = securitiesInPortfolios[value.securityId];
    	    					value.targetInAmt = value.targetInPercent * totalAmount;
    	    					if(security){    	    						
    	    						value.currentInAmt = security.value;
    	    						value.currentInPercent = (security.value/totalAmount) *100;
    	    					}else{
    	    						value.currentInAmt = 0;
    	    						value.currentInPercent = 0;
    	    					}
    	    				})
    	    				var toSet = _.differenceWith(result, rs, function(first, second){
    	    					if(first.securityId == second.securityId)
    	    						return true;
    	    				})
    	    				toSet.forEach(function(value, index){
    	    					value.targetInAmt = 0;
    	    					value.targetInPercent = 0;
    	    					value.currentInAmt = value.value;
    	    					value.currentInPercent = (value.value/totalAmount)*100;
    	    					rs.push(value);
    	    				})
    	    				return cb(null, codes.SUCCESS, rs);
    	    			})
    	    		}else{
    	    			return cb(null, codes.SUCCESS, []);
    	    		}
    	    	}catch(e){
    	    		 logger.error(e);
    	    		 return cb(e, codes.INTERNAL_SERVER_ERROR);
    	    	}
    	    });
    	}else{
    		return cb(messages.portfolioNotFound, codes.UNPROCESSABLE);
    	}
    	
    })
};

ModelService.prototype.getTeamsForModel = function (data, cb) {
    logger.info("Get service (getTeamsForModel())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.getTeamAccessForModel(data, function (err, fetched) {
        if (err) {
            logger.error("Error service (getTeamsForModel())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        teamDao.getTeamsWithCompleteModelAccess(data, function(err, rs){
        	 
        	if (err) {
                 logger.error("Error service (getTeamsForModel())" + err);
                 return cb(err, codes.INTERNAL_SERVER_ERROR);
             }
        	 
        	logger.info("Model list service returned successfully (getTeamsForModel())");
        	var rTurn = modelConverter.getTeamsForModelEntityListToModel(fetched, rs);
        	return cb(null, codes.SUCCESS, rTurn);
        })
    });
};


ModelService.prototype.getCompleteModel = function (data, cb) {
	
	logger.info("Get complete model by base called (getCompleteModel())");
	
    var self = this;
    
    self.getModel(data, function(err, status, rs){
    	if (err) {
            logger.error(err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	if(rs && rs.length > 0){
    		var row = rs[0];
    		
    		if(data.pending){    			
    			if(row.statusId == modelStatus["APPROVED"]){
    				self.getCompleteTempModelById(data, cb);
    			}else{    				
    				self.getCompleteModelById(data, cb);
    			}
    		}else{
    			if(row.statusId == modelStatus["APPROVED"]){
    				self.getCompleteModelById(data, cb);
    			}else{    				
    				self.getCompleteTempModelById(data, cb);
    			}
    		}
    	}else{
    		return cb(null, codes.UNPROCESSABLE, {message : messages.modelNotFound});
    	}
    })
};

/*
 * returns complete tree
*/ModelService.prototype.getCompleteModelById = function (data, cb) {
	
	logger.info("Get complete model by id service called (getCompleteModelById())");
	
    var self = this;
    modelDao.getCompleteModelById(data, function (err, fetched) {
        if (err) {
            logger.error(err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        var model = {};
        if(fetched && fetched.length > 0){
        	
        	var currentLevel = 0;
        	model = {
        			id : null
        	};
        	var tempModel = {
        			
        	}
        	fetched = fetched.reverse();
        	fetched.forEach(function(value){
        		var node = {};
        		
        		/*
        		 * will run every time when making the parent node to set to model.structure
        		*/
        		
        		modelConverter.generalModelModelFromModelEntity(value, model);
        		
        		var leftValue = value.leftValue;
        		var rightValue = value.rightValue;
        		
        		model.modelDetail = null;
        		if(value.meId){

        			model.modelDetail = node;
        			node.modelDetailId = value.modelDetailId;
        			node.id = value.meId;
        			node.name = value.meName;
        			node.nameSpace = value.meNamespace;
        			node.children = [];
        			node.level = value.meLevel;
        			node.leftValue = leftValue;
        			node.rightValue = rightValue;
        			
        		}
        		
        		tempModel[leftValue] = {};
        		tempModel[leftValue]["right"] = rightValue;
        		tempModel[leftValue]["actual"] = value;
        	});
        	self.EntityListToModelStructure(model.modelDetail, tempModel);
        	
        	modelPortfolioService.getPortfoliosForModel(data, function(err, status, rs){
        		if (err) {
                    logger.error(err);
                    return cb(err, codes.INTERNAL_SERVER_ERROR);
                }
        		model.portfolioCount = rs.length;
        		
        		/*
        		 * model aum is pending
        		*/
        		model.modelAUM = 0;
//        		modelDao.getModelAUM(data, function(err, rs){
//        			if (err) {
//        	            logger.error(err);
//        	            return cb(err, codes.INTERNAL_SERVER_ERROR);
//        	        }
//        			if(rs && rs.length > 0){
//        				try{        					
//        					model.modelAUM = rs[0][0].totalAUM;
//        				}catch(e){
//        					logger.error(e);
//        					return cb(null, codes.SUCCESS, model);
//        				}
//        				return cb(null, codes.SUCCESS, model);
//        			}
//        		})
        		return cb(null, codes.SUCCESS, model);
        	})
        }else{
        	return cb(null, codes.NOT_FOUND, {"message" : messages.modelNotFound});
        }
    });
};

/*
 * returns complete tree
*/ModelService.prototype.getCompleteTempModelById = function (data, cb) {
	
	logger.info("Get complete temp model by id service called (getCompleteTempModelById())");

    var self = this;
    modelDao.getCompleteTempModelById(data, function (err, fetched) {
        if (err) {
            logger.error(err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        var model = {};
        logger.info("getting complete model by id (getCompleteTempModelById())");
        if(fetched && fetched.length > 0){
        	
        	var currentLevel = 0;
        	model = {
        			id : null
        	};
        	var tempModel = {
        			
        	}
        	fetched = fetched.reverse();
        	fetched.forEach(function(value){
        		var node = {};
        		
        		/*
        		 * will run every time when making the parent node to set to model.structure
        		*/
        		modelConverter.generalModelModelFromModelEntity(value, model);
    			model.id = value.id;
    			model.name = value.name;
    			model.description = value.description;
    			model.isDynamic = value.dynamicModel;
    			model.statusId = value.statusId;
    			model.status = value.status;
    			
    			var leftValue = value.leftValue;
    			var rightValue = value.rightValue;
    			
    			model.modelDetail = null;
    			if(value.meId){

    				model.modelDetail = node;
        			node.id = value.meId;
        			node.name = value.meName;
        			node.nameSpace = value.meNamespace;
        			node.children = [];
        			node.level = value.meLevel;
        			node.leftValue = leftValue;
        			node.rightValue = rightValue;
        			
        			// more fields need to added into need
        			node.children = [];        			
        		}
        		
        		tempModel[leftValue] = {};
        		tempModel[leftValue]["right"] = rightValue;
        		tempModel[leftValue]["actual"] = value;
        	});
        	self.EntityListToModelStructure(model.modelDetail, tempModel);
        	
        	modelPortfolioService.getPortfoliosForModel(data, function(err, status, rs){
        		if (err) {
                    logger.error(err);
                    return cb(err, codes.INTERNAL_SERVER_ERROR);
                }
        		model.portfolioCount = rs.length;
        		model.modelAUM = 0;
        		return cb(null, codes.SUCCESS, model);
        	})
        }else{
        	return cb(null, codes.NOT_FOUND, {"message" : messages.modelNotFound});
        }
    });
};

ModelService.prototype.EntityListToModelStructure = function (data, tempMap) {
    logger.info("conversion of entity list to model structure service called (EntityListToModelStructure())");
    try{    	
    	if(!data){
    		return ;
    	}
    	
    	if(data.children && data.children.length > 0){
    		
    	}else{
    		data.children = [];
    	}
    	var leftValue = data.leftValue+1;
    	var rightValue = data.rightValue-1;
    	var tempObj = tempMap[leftValue];
    	
    	var tmpChildrens = [];
    	
    	while(tempObj && rightValue > leftValue){
    		leftValue = tempObj.right + 1; 
    		var modelElementModel = modelConverter.getSubModelModelFromModelElementEntity(tempObj.actual);
    		modelConverter.otherPropertiesForModelElementsFromEntityToModel(tempObj.actual, modelElementModel);
    		data.children.push(modelElementModel);
    		tmpChildrens.push(tempObj.actual);
    		tempObj = tempMap[leftValue];
    	}
//    tempMap[]
    	var self = this;
    	data.children.forEach(function(value){
    		
    		if(value.isSubstituted){
    			data.childSubstituted = 1;
    		}

    		self.EntityListToModelStructure(value, tempMap);

    	});
    }catch(e){
    	logger.error(e);
    	return;
    }
};

ModelService.prototype.modelValidations = function (data, cb) {
    logger.info("model validtions service called called (modelValidations())");
    
    var self = this;
    
    var inModel = " in model ";
    
//  var model = modelConverter.getCompleteModelModelFromModelRequest(data);
    
    var modelStructureArray = data.modelStructureArray;
    var modelTypeArrays = data.modelTypeArrays;
    var catObj = {};
    var classObj = {};
    var subclassObj = {};
    var securitySetObj = {};
    var modelElementObj = {};
    
    var categoriesList = modelTypeArrays["1"]; 
    var classesList = modelTypeArrays["2"];
    var subclassList = modelTypeArrays["3"];
    var securitySetList = modelTypeArrays["4"];
    var modelElementList = [];
    
    catObj.reqId = data.reqId;
    catObj.id = categoriesList;
    classObj.reqId = data.reqId;
    classObj.id = classesList;
    subclassObj.reqId = data.reqId;
    subclassObj.id = subclassList;
    securitySetObj.reqId = data.reqId;
    securitySetObj.id = securitySetList;
    modelElementObj.reqId = data.reqId;
    modelElementObj.id = modelElementList;
    modelStructureArray.forEach(function(value){
    	if(value.id){
    		modelElementList.push(value.id);
    	}
    })
    modelElementList = self.getUniqueElementsFromList(modelElementList);
    var isDynamicCheckFail = false; 
    self.getModel(data, function(err, status, rs){
    	if (err) {
			logger.error("Error service (modelValidations())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	var isDynamic = null;
    	if(rs && rs.length > 0){
    		var row = rs[0];
    		isDynamic = row.dynamicModel;
    	}else{
    		logger.error("Error service (modelValidations())");
			return cb(messages.modelNotFound, codes.UNPROCESSABLE);
    	}
    	self.getModelElementExistence(modelElementObj, function(err, status, rs){
    		if (err) {
    			logger.error("Error  (modelValidations())" + err);
    			return cb(err, codes.INTERNAL_SERVER_ERROR);
    		}
    		if(rs && rs.length == modelElementList.length || modelElementList.length == 0){
    	    	CategoryService.categoriesExistence(catObj, function(err, status, rs){
    	    		if (err) {
    	    			logger.error("Error  (modelValidations())" + err);
    	    			return cb(err, codes.INTERNAL_SERVER_ERROR);
    	    		}
    	    		var rsListOfIds = [];
    	    		if(rs){
    	    			rs.forEach(function(val){
    	    				rsListOfIds.push(val.id);
    	    			});
    	    		}
    	    		var rss = _.difference(categoriesList, rsListOfIds);
    	    		if(rss && rss.length > 0){
    	    			var finalMsg = modelValidationMessages.assetCategoriesNotExists + rss;
    	    			if(data.id){
    	    				finalMsg += inModel + data.id;
    	    			}
    	    			return cb(finalMsg, codes.UNPROCESSABLE);
    	    		}
    	    		ClassService.classesExistence(classObj, function(err, status, rs){
    	    			if (err) {
    	    				logger.error("Error service (modelValidations())" + err);
    	    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    	    			}
    	    			var rsListOfIds = [];
    	    			if(rs){
    	    				rs.forEach(function(val){
    	    					rsListOfIds.push(val.id);
    	    				});
    	    			}
    	    			var rss = _.difference(classesList, rsListOfIds);
    	    			if(rss && rss.length > 0){
    	    				var finalMsg = modelValidationMessages.assetClassNotExists + rss;
        	    			if(data.id){
        	    				finalMsg += inModel + data.id;
        	    			}
    	    				return cb(finalMsg, codes.UNPROCESSABLE);
    	    			}
    	    			SubClassService.subclassesExistence(subclassObj, function(err, status, rs){
    	    				if (err) {
    	    					logger.error("Error service (modelValidations())" + err);
    	    					return cb(err, codes.INTERNAL_SERVER_ERROR);
    	    				}
    	    				var rsListOfIds = [];
    	    				if(rs){
    	    					rs.forEach(function(val){
    	    						rsListOfIds.push(val.id);
    	    					});
    	    				}
    	    				var rss = _.difference(subclassList, rsListOfIds);
    	    				
    	    				if(rss && rss.length > 0){
    	    					var finalMsg = modelValidationMessages.assetSubClassNotExists + rss;
            	    			if(data.id){
            	    				finalMsg += inModel + data.id;
            	    			}
    	    					return cb(finalMsg, codes.UNPROCESSABLE);
    	    				}
    	    				
    	    				SecuritySetService.securitySetExistence(securitySetObj, function(err, status , rs){
    	    					if (err) {
    	    						logger.error("Error service (modelValidations())" + err);
    	    						return cb(err, codes.INTERNAL_SERVER_ERROR);
    	    					}
    	    					var rsListOfIds = [];
    	    					if(rs){
    	    						rs.forEach(function(val){
    	    							if(isDynamic != val.isDynamic){
    	    								isDynamicCheckFail = true;
    	    							}
    	    							rsListOfIds.push(val.id);
    	    						});
    	    					}
    	    					var rss = _.difference(securitySetList, rsListOfIds);
    	    					
    	    					if(isDynamicCheckFail){
    	    						return cb(modelValidationMessages.securitySetisDynamicFlagDoesNotMatch, codes.UNPROCESSABLE);
    	    					}
    	    					if(rss && rss.length > 0){
    	    						var finalMsg = modelValidationMessages.assetSecuritySetNotExists + rss;
                	    			if(data.id){
                	    				finalMsg += inModel + data.id;
                	    			}
    	    						return cb(finalMsg, codes.UNPROCESSABLE);
    	    					}
    	    					
    	    					var securitySetAssetClassArray = data.securitySetAssetClassArray;
    	    					if(securitySetAssetClassArray && securitySetAssetClassArray.length == 0){
    	    						return cb(null, codes.SUCCESS, null);
    	    					}
    	    					asyncFor(securitySetAssetClassArray, function(value, index, next){
    	    						value.reqId = data.reqId;
    	    						SecuritySetService.getSecuritySetWithSecuritiesOnly(value, function(err, status, securitySet){
    	    							if (err) {
    	    								logger.error("Error service (modelValidations())" + err);
    	    								next(err);
    	    								return cb(err, status);
    	    							}
    	    							var modelTypes = value.parentModelType;
    	    							var possibleCategoryId = modelTypes[relatedTypeCodeToId["CATEGORY"]];
    	    							var possibleClassId = modelTypes[relatedTypeCodeToId["CLASS"]];
    	    							var possibleSubClassId = modelTypes[relatedTypeCodeToId["SUBCLASS"]];
    	    							var validationStatus = true;
    	    							var message = null;
    	    							securitySet.forEach(function(security){
    	    								var actualCategoryId = security.assetCategoryId;
    	    								var actualClassId = security.assetClassId;
    	    								var actualSubClassId = security.assetSubClassId;
    	    								if(actualCategoryId && possibleCategoryId){
    	    									if(actualCategoryId != possibleCategoryId){
    	    										validationStatus = false;
    	    										message = "Security Set with id: " + value.securitySetId + " has security with assetCategory different than child parent node ";
    	    									}
    	    								}
    	    								
    	    								if(actualClassId && possibleClassId){
    	    									if(actualClassId != possibleClassId){
    	    										validationStatus = false;
    	    										message = "Security Set with id: " + value.securitySetId + " has security with assetClass different than child parent node ";
    	    									}
    	    								}
    	    								
    	    								if(actualSubClassId && possibleSubClassId){
    	    									if(actualSubClassId != possibleSubClassId){
    	    										validationStatus = false;
    	    										message = "Security Set with id: " + value.securitySetId + " has security with assetSubClass different than child parent node ";
    	    									}
    	    								}
    	    							})
    	    							if(validationStatus){
    	    								next();
    	    							}else{
    	    								next(message);
    	                	    			if(data.id){
    	                	    				message += inModel + data.id;
    	                	    			}
    	    								return cb(message, codes.UNPROCESSABLE);
    	    							}
    	    						});
    	    					}, function(err, data){
    	    							return cb(null, codes.SUCCESS, null);
    	    					})
    	    					
    	    				})
    	    			});
    	    		});
    	    	});
    		}else{
    			return cb(messages.subModelListExistenceCheck + modelElementList, codes.UNPROCESSABLE);
    		}
    	})
    })
};

/*
 * input model is complete tree
*/ModelService.prototype.saveCompleteModelWithoutUpdatingFurtherModels = function (data, cb) {
	logger.info("Saving complete model without updating others service called (saveCompleteModelWithoutUpdatingFurtherModels())");
	
	var self = this;
	var status = false;
	
	var model = modelConverter.getCompleteModelModelFromModelRequest(data, function(err){
		if(err){
			logger.error(err);
			status = true;
			return cb(null, codes.UNPROCESSABLE, {message : err});
		}
	});
	data.modelmodel = model;
	if(status){
		return;
	}
	self.modelValidations(model, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, status);
		}
		if(status ==  codes.UNPROCESSABLE){
			return cb(null, status, rs);
		}
		self.tempModelStoreCheck(model, function(err, status, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			self.getModel(model, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				if(rs && rs.length > 0){
					var row = rs[0];
					model.isDynamic = row.dynamicModel;
					if(model.isSubstitutedForPortfolio){
						
						var tcb = function(err, status, rs){
							if(err){
								logger.error(err);
								return cb(err, codes.INTERNAL_SERVER_ERROR);
							}
							var tmpObj = {};
							tmpObj.reqId = model.reqId;
							tmpObj.user = model.user;
							tmpObj.modelId = model.substituteOfModelId;
							tmpObj.substitutedModelId = model.id;
							tmpObj.portfolioId = model.portfolioId;
							tmpObj.sleevedAccountId = model.portfolioId;
							console.log(tmpObj);
							if(!model.forceFullUpdateOfApprovedModel){
								if(model.isSubstitutedForSleeve){
									modelSleeveService.assignModelToSleeve(tmpObj, function(errr, statuss){
										if(errr){
											logger.error(errr);
											return cb(errr, codes.INTERNAL_SERVER_ERROR);
										}
										return cb(err, status, rs);
									})
								}else{								
									modelPortfolioService.assignModelToPortfolio(tmpObj, function(errr, statuss){
										if(errr){
											logger.error(errr);
											return cb(errr, codes.INTERNAL_SERVER_ERROR);
										}
										return cb(err, status, rs);
									})
								}
							}else{
								return cb(err, status, rs);
							}
						}
						
						var substituteOfModelId = model.id;
						model.id = model.substitutedModelId;
						model.substituteOfModelId = substituteOfModelId;
						if(model.substitutedModelId){
							self.saveModelElementAndDetail(model, tcb);
						}else{
							model.name = row.name;
							model.namespace = null;
							model.isDynamic = row.dynamicModel;
							model.description = row.description;
							model.ownerUserId = row.ownerUserId;
							model.approvedByUserId = row.approvedByUserId;
							model.managementStyleId = row.managementStyleId;
							model.statusId = row.statusId;
							self.createOrUpdateGeneralModel(model, function(err, status, rs){
								if(err){
									logger.error(err);
									return cb(err, codes.INTERNAL_SERVER_ERROR);
								}
								self.saveModelElementAndDetail(model, tcb);
							})
						}
					}else{
						self.saveModelElementAndDetail(model, cb);
					}
				}else{
					return cb(null, codes.NOT_FOUND, {message : messages.modelNotFound});
				}
			});
		});
	});
};

ModelService.prototype.saveModelElementAndDetail = function (model, cb) {
	logger.info(" save modelElements and modelDetail(saveModelElementAndDetail())");
	
	var self = this;
	/*
	 * independent of modelId
	 */
	self.createModelElementInBulk(model, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(status != codes.SUCCESS){			
			//var modelDetailList = modelConverter.getModelDetailEntityListFromModelDetailModelList(model);
			return cb(null, status, rs);
		}else{
			modelConverter.getModelDetailAFterInsertionFromModelDetailModelList(model);
			self.createTempModel(model, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				self.createOrUpdateModelDetail(model, function(err, status, rs){
					if(err){
						logger.error(err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					self.modelStatusChange(model, function(err, status, rs){
						if(err){
							logger.error(err);
							return cb(err, codes.INTERNAL_SERVER_ERROR);
						}
						if(model.isDynamic){		
							self.createOrUpdateDynamicModelSecuritiesQuantities(model, function(err, status, rs){
								if(err){
									logger.error(err);
									return cb(err, codes.INTERNAL_SERVER_ERROR);
								}
								return cb(null, codes.SUCCESS, model);
							})
						}else{
							return cb(null, codes.SUCCESS, model);
						}
					})		
				});
			})
		}
	});					
}

var SMAService = require('service/account/SMAService.js');
ModelService.prototype.saveCompleteModel = function (data, cb) {
	
	logger.info("Saving complete model service called (saveCompleteModel())");
	
	var self = this;
	
	self.saveCompleteModelWithoutUpdatingFurtherModels(data, function(err, statuss, model){
		if(err){
			logger.error(err);
			return cb(err, statuss);
		}
		
		if(statuss != codes.SUCCESS){
			return cb(null, statuss, model);
		}

		self.postServicesModel(data.modelmodel, function(err, status, rs){		
			
			if(err){
				 logger.error(err);
				 return cb(err, codes.INTERNAL_SERVER_ERROR);
			 }
			
			/*
			 * when there is change, than that change needs to reflected in others
			 * When there is change in original model
			 */var toBeStoredAsTemp = model.tempModel;
             
             var tcb = function(){
            	 if(!toBeStoredAsTemp){
    				 self.updatingOtherModels(model, function(err, status, rs){
    					 
    					 if(err){
    						 logger.error(err);
    						 return cb(err, status);
    					 }
    					 
    					 self.getCompleteModelById(model, function(err, status, modelDetailed){
    						 if(err){
    							 logger.error(err);
    							 return cb(err, codes.INTERNAL_SERVER_ERROR);
    						 }
    						 cb(err, statuss, modelDetailed);
    					 });
    				 })			
    			 }else{
    				 self.getCompleteTempModelById(model, function(err, status, modelDetailed){
    					 return cb(err, statuss, modelDetailed);
    				 });
    			 }
             }
			 if(data.statusId == modelStatus["NOT_APPROVED"]){
				 self.modelNotificationsForApproval(data, function(){
					 return tcb();
				 })
			 }else{
				 return tcb();
			 }
		})
	});
};

ModelService.prototype.postServicesModel = function (data, cb) {
	SMAService.removeSMAForModel(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		cb(err, status, rs);
	})
}

ModelService.prototype.modelNotificationsForApproval = function (data, cb) {
	var notificationInputData = {
        reqId: data.reqId,
        user: data.user,
        subject: messages.modelNotification.modelApprovalSubject,
        body: messages.modelNotification.modelApprovalBody + data.id,
        notificationCategoryType:applicationEnum.notificationCategoryType.MODEL_CHANGE_APPROVAL
    };
	notificationService.createAndSendNotification(notificationInputData, function(err,result){
	    if(err){
	        logger.debug("error in create and send notification (modelNotificationsForApproval())");
	        logger.error(err);
	    }
	    return cb();
	});
}

ModelService.prototype.createModelElementInBulk = function (data, cb) {
	
	logger.info("create model Element in bulk service called (createModelElementInBulk())");
	
	var self = this;
	
	var modelStructureArray = data.modelStructureArray;
	asyncFor(modelStructureArray, function(value, index, next){
		if(!value.id){			
			self.createModelElement(value, function(err, status, rs){
				if(err){
					logger.error(err);
					next(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}else{
					if(status == codes.CREATED){					
						next();
					}else{
						logger.error(rs);
						next(rs);
						return cb(null, codes.UNPROCESSABLE, rs);
					}
				}
			});			
		}else{
			next();
		}
	}, function(err, data){
		cb(err, codes.SUCCESS, data);
	});
	
};


ModelService.prototype.createTempModel = function (data, cb) {
	
	logger.info("create Temp Model Element in service called (createTempModel())");
	
	var self = this;
	if(data.tempModel){
		logger.info("creating Temp Model Element");
		 modelDao.createTempModel(data, function(err, rs){
			 if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
			 }
			 return cb(null, codes.SUCCESS, rs);
		 });
	}else{
		return cb(null, codes.SUCCESS, null);
	}
};

ModelService.prototype.clearTempModel = function (data, cb) {
	
	logger.info(" clear model Element in bulk service called (clearTempModel())");
	
	var self = this;
	
	var obj = {};
	obj.reqId = data.reqId;
	obj.modelId = data.id;
	 modelDao.deleteTempModel(obj, function(err, status, rs){
		 if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
		 }
		 modelDao.deleteTempModelDetail(obj, function(){
			 if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
			 }
			 return cb(null, codes.SUCCESS, rs);
		 })
	 });

};

ModelService.prototype.createModelElement = function (data, cb) {
	
	logger.info("create model Element service called (createModelElement())");
	
	var self = this;
	var modelElementEntity = modelConverter.getModelElementEntity(data);
	self.checkUniqueNameConsideringNamespaceForSubmodel(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(rs && rs.length > 0){
			logger.info("name : " + data.name + "  " + "namespace : " +  data.namespace);
			logger.error(messages.submodelNameConstraintWithinNamespace);
			return cb(null, codes.UNPROCESSABLE, {message : messages.submodelNameConstraintWithinNamespace});
		}else{
			self.relatedTypeExistenceCheck(data, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				if(rs && "id" in rs){					
					modelDao.createAndUpdateModelElement(modelElementEntity, function(err, rs){
						if(err){
							logger.error(err);
							return cb(err, codes.INTERNAL_SERVER_ERROR);
						}else{
							if(rs.insertId){
								data.id = rs.insertId;
							}
							self.getModelElementDetail(data, function(err, status, model){
								if(err){
									logger.error(err);
									return cb(err, codes.INTERNAL_SERVER_ERROR);
								}else{			
									var rTurn = modelConverter.getSubModelModelFromModelElementEntity(model[0]);
									return cb(null, codes.CREATED, rTurn);
								}
							});
						}
					});					
				}else{
					return cb(null, codes.UNPROCESSABLE, {message : messages.securityAssetOfModelTypeNotExists + data.relatedTypeId});
				}
			})
		}
	})
};

ModelService.prototype.updateModelElement = function (data, cb) {
	
	logger.info("update model Element service called (updateModelElement())");
	
	var self = this;
	
	var modelElementEntity = modelConverter.getModelElementEntity(data);
	self.getModelElementExistence(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(rs && rs.length > 0){
			self.checkUniqueNameConsideringNamespaceForSubmodel(data, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				if(rs && rs.length > 0){
					return cb(null, codes.UNPROCESSABLE, {message : messages.submodelNameConstraintWithinNamespace});
				}else{			
						modelDao.updateModelElement(modelElementEntity, function(err, rs){
							if(err){
								logger.error(err);
								return cb(err, codes.INTERNAL_SERVER_ERROR);
							}else{
								if(rs.insertId){
									data.id = rs.insertId;
								}
								self.getModelElementDetail(data, function(err, status, model){
									if(err){
										logger.error(err);
										return cb(err, codes.INTERNAL_SERVER_ERROR);
									}else{	
										var rTurn = modelConverter.getSubModelModelFromModelElementEntity(model[0]);
										return cb(null, codes.CREATED, rTurn);
									}
								});
							}
						});
				}
			})
		}else{
			return cb(null, codes.UNPROCESSABLE, {message : messages.subModelNotFound});
		}
	})
};

ModelService.prototype.relatedTypeExistenceCheck = function (data, cb) {
	
	logger.info("relatedType Existence check (relatedTypeExistenceCheck())");
	
	var self = this;
	var relatedTypeModel = modelConverter.getRelatedTypeModelFromModelModel(data);
	if(relatedTypeModel.id){
		if(relatedTypeModel.relatedType == "CATEGORY"){
			CategoryService.getCategoryDetail(relatedTypeModel, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				cb(null, codes.SUCCESS, rs);
			});
		}else if(relatedTypeModel.relatedType == "CLASS"){
			ClassService.getClassDetail(relatedTypeModel, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				cb(null, codes.SUCCESS, rs);
			});
		}else if(relatedTypeModel.relatedType == "SUBCLASS"){
			SubClassService.getSubClassDetail(relatedTypeModel, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				cb(null, codes.SUCCESS, rs);
			});
		}else if(relatedTypeModel.relatedType == "SECURITYSET"){
			SecuritySetService.getSecuritySet(relatedTypeModel, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				if(rs && rs.length > 0){				
					cb(null, codes.SUCCESS, rs[0]);
				}else{
					cb(null, codes.SUCCESS, null);
				}
			});
		}else{
			cb(null, codes.SUCCESS, {"id" : 1});
		}
	}else{
		cb(null, codes.SUCCESS, {"id" : 1});
	}
};

ModelService.prototype.setUnsetFavoriteForSubModel = function (data, cb) {
	logger.info("set/unset favorite for submodel service called (setUnsetFavoriteForSubModel())");
	
	var self = this;
//	var modelElementEntity = modelConverter.getModelElementEntity(data);
	modelDao.setUnsetFavoritesSubModel(data, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}else{
			return cb(null, codes.SUCCESS, {message : messages.modelFlagForFavoriteUpdated});
		}
	});					
};
var util = require("util");
ModelService.prototype.copySubModel = function (data, cb) {
	logger.info(" copy sub-model service called (copySubModel())");
	
	var submodelPostFix = "_submodel";
	
	var self = this;
	var modelEntity = modelConverter.getModelEntityFromModelModel(data);
	
	self.getSubModelStructure(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(status == codes.SUCCESS){
			var model = {};
			var node = {};
			model.name = data.name + submodelPostFix;
			model.modelDetail = node;
			node.modelTypeId = 0;
			node.name = data.name + submodelPostFix;
			node.children = [];
			
			var submodel = rs;
			submodel.targetPercent= 100;
			submodel.id = null;
			submodel.name = data.name;
			submodel.nameSpace = data.nameSpace;
			node.children.push(submodel);
			
			model.user = {};
			model.modelDetail.user = {};
			baseConverter(model, data);
			baseConverter(model.modelDetail, data);
			
			var sStatus = false;
			var modelModel = modelConverter.getCompleteModelModelFromModelRequest(model, function(err){
				if(err){
					logger.error(err);
					sStatus = true;
					return cb(null, codes.UNPROCESSABLE, {message : err});
				}
			});
			if(sStatus){
				return;
			}
			modelModel.id = null;
			modelModel.name = data.name;
			modelModel.namespace = data.nameSpace;
			modelModel.isSubModel = 1;
			modelModel.resetModelId = 1;
			
			self.createOrUpdateGeneralModel(modelModel, function(err, status, newM){
				if(err){
					logger.error(err);
					return cb(err, codes.UNPROCESSABLE);
				}else{
					if(status != codes.UNPROCESSABLE){						
						model.id = newM.id;
						modelModel.id = newM.id;
						model.modelDetail.id = null;
						model.modelDetail.name = data.name;
						model.copyModel = true;
						self.saveCompleteModelWithoutUpdatingFurtherModels(model, function(err, status, rs){
							if(err){
								logger.error(err);
								return cb(err, status);
							}
							if(status == codes.SUCCESS){
								self.getCompleteModelById(model, function(err, status, rs){
									if(err){
										logger.error(err);
										return cb(err, codes.UNPROCESSABLE);
									}
									
									var submodelId = rs.modelDetail.children[0].id;
									data.id = submodelId;
									self.getSubModelStructure(data, function(err, status, rs){
										if(err){
											logger.error(err);
											return cb(err, codes.UNPROCESSABLE);
										}
										return cb(err, codes.CREATED, rs);
									})
								})
							}else{
								return cb(err, status, rs);
							}
						})
					}else{
						return cb(null, status, newM);
					}
				}
			})
		}else{
			return cb(null, codes.UNPROCESSABLE, {message : messages.subModelNotFound});
		}
	});
};

ModelService.prototype.copyModel = function (data, cb) {
	logger.info(" copy model service called (copyModel())");
	
	var self = this;
	var modelEntity = modelConverter.getModelEntityFromModelModel(data);
	
	self.getCompleteModelById(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(status == codes.SUCCESS){
			rs.user = {};
			baseConverter(rs, data);
			if(rs.modelDetail){
				rs.modelDetail.user = {};
				baseConverter(rs.modelDetail, data);
			}
			var sStatus = false;
			var modelModel = modelConverter.getCompleteModelModelFromModelRequest(rs, function(err){
				if(err){
					logger.error(err);
					sStatus = true;
					return cb(err, codes.UNPROCESSABLE);
				}
			});
			if(sStatus){
				return;
			}
			modelModel.id = null;
			modelModel.name = data.name;
			modelModel.namespace = data.nameSpace;
			self.createOrUpdateGeneralModel(modelModel, function(err, status, newM){
				if(err){
					logger.error(err);
					return cb(err, codes.UNPROCESSABLE);
				}else{
					if(status != codes.UNPROCESSABLE){						
						rs.id = newM.id;
						modelModel.id = newM.id;
						if(rs.modelDetail){							
							rs.modelDetail.id = null;
							rs.modelDetail.name = data.name;
							rs.modelDetail.nameSpace = data.nameSpace;
							rs.copyModel = true;
							self.saveCompleteModelWithoutUpdatingFurtherModels(rs, function(err, status, rs){
								if(err){
									logger.error(err);
									return cb(err, codes.UNPROCESSABLE);
								}
								self.getCompleteModelById(rs, function(err, status, rs){
									if(err){
										logger.error(err);
										return cb(err, codes.UNPROCESSABLE);
									}
									return cb(err, codes.CREATED, rs);
								})
							})
						}else{
							self.getCompleteModelById(rs, function(err, status, rs){
								if(err){
									logger.error(err);
									return cb(err, codes.UNPROCESSABLE);
								}
								return cb(err, codes.CREATED, rs);
							})
						}
					}else{
						return cb(null, status, newM);
					}
				}
			})
		}else{
			return cb(null, codes.UNPROCESSABLE, {message : messages.modelNotFound});
		}
	});
};

ModelService.prototype.createOrUpdateGeneralModel = function (data, cb) {
	logger.info(" create or update general model service called (createOrUpdateGeneralModel())");
	
	var self = this;
	var modelEntity = modelConverter.getModelEntityFromModelModel(data);
	
	self.checkUniqueNameConsideringNamespace(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(rs.length == 0){			
			self.getModel(modelEntity, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}else{
					if(rs && rs.length == 0){
						if(data.id){
							return cb(err, codes.NOT_FOUND, {messages : messages.modelNotFound});
						}
						if(!data.isSubstitutedForPortfolio){							
							modelEntity.statusId = modelStatus["DRAFT"];
						}
						modelDao.createGeneralModelInformation(modelEntity, function(err, rs){
							if(err){
								logger.error(err);
								return cb(err, codes.INTERNAL_SERVER_ERROR);
							}else{
								data.id = rs.insertId;
								self.assignModelToUserTeams(data, function(err, status, rs){
									if(err){
										logger.error(err);
										return cb(err, codes.INTERNAL_SERVER_ERROR);
									}
									/*
									 * Draft will set by this service
									 */
										self.getCompleteModelById(data, function(err, status, rs){
											if(err){
												logger.error(err);
												return cb(err, codes.INTERNAL_SERVER_ERROR);
											}
											return cb(null, codes.CREATED, rs);				
									})
								})
							}
						});				
					}else{
						var row = rs[0];
						
						if(!data.byCommunity){							
							if(row.isCommunityModel){
								return cb(null, codes.UNPROCESSABLE, {messages : userCannotEditCommunityModel});
							}
						}
						
						self.modelStatusChangeValidator(data, row, function(err, status, rs){
							if(err){
								 logger.error(err);
								 return cb(err, status);
							 }
							/*
							 * When model is not_active only status can be changed by firmAdmin user
							 */if(row.statusId == modelStatus["NOT_ACTIVE"]){
								 self.modelStatusChange(data, function(err, status, rs){
									 if(err){
										 logger.error(err);
										 return cb(err, codes.INTERNAL_SERVER_ERROR);
									 }else{
										 self.modelNotificcation(data, function(){											 
											 self.getCompleteModelById(data, function(err, status, rs){
												 if(err){
													 logger.error(err);
													 return cb(err, codes.INTERNAL_SERVER_ERROR);
												 }
												 return cb(null, codes.SUCCESS, rs);				
											 })				
										 })
									 }
								 })
							 }else{
								 modelDao.updateGeneralModelInformation(modelEntity, function(err, rs){
									 if(err){
										 logger.error(err);
										 return cb(err, codes.INTERNAL_SERVER_ERROR);
									 }else{
										 self.modelStatusChange(data, function(err, status, rs){
											 if(err){
												 logger.error(err);
												 return cb(err, codes.INTERNAL_SERVER_ERROR);
											 }
											 var tcb = function(){
												 if(data.currentStatusId == modelStatus["APPROVED"]){
													 data.actionStatus = "approve";
													 self.approveRejectTemporaryModel(data, function(err, status, rs){
														 if(err){
															 logger.error(err);
															 return cb(err, status);
														 }
														 if(status == codes.SUCCESS){													 
															 self.getCompleteModelById(data, function(err, status, rs){
																 if(err){
																	 logger.error(err);
																	 return cb(err, status);
																 }
																 return cb(null, codes.SUCCESS, rs);				
															 })				
														 }else{
															 return cb(null, status, rs);
														 }
													 })												 
												 }else{
													 self.getCompleteModelById(data, function(err, status, rs){
														 if(err){
															 logger.error(err);
															 return cb(err, codes.INTERNAL_SERVER_ERROR);
														 }
														 return cb(null, codes.SUCCESS, rs);				
													 })	
												 }
											 }
											 if(data.statusId == modelStatus["NOT_APPROVED"]){
												 self.modelNotificationsForApproval(data, function(){
													 return tcb();
												 })
											 }else{
												 return tcb();
											 }
										 })
									 }
								 });							
							 }
						});
					}
				}
			});
		}else{
			return cb(null, codes.UNPROCESSABLE, {message : messages.modelNameConstraintWithinNamespace});
		}
	});
};

ModelService.prototype.updateGeneralModelByPatch = function (data, cb) {
	logger.info(" update general model by patch service called (updateGeneralModelByPatch())");
	
	var self = this;
	var modelEntity = modelConverter.getModelEntityFromModelModel(data);
	
	self.checkUniqueNameConsideringNamespace(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(rs.length == 0){			
			self.getModel(modelEntity, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}else{
					if(rs && rs.length == 0){
						if(data.id){
							return cb(err, codes.NOT_FOUND, {messages : messages.modelNotFound});
						}
						if(!data.isSubstitutedForPortfolio){							
							modelEntity.statusId = modelStatus["DRAFT"];
						}
						modelDao.createGeneralModelInformation(modelEntity, function(err, rs){
							if(err){
								logger.error(err);
								return cb(err, codes.INTERNAL_SERVER_ERROR);
							}else{
								data.id = rs.insertId;
								self.assignModelToUserTeams(data, function(err, status, rs){
									if(err){
										logger.error(err);
										return cb(err, codes.INTERNAL_SERVER_ERROR);
									}
									/*
									 * Draft will set by this service
									 */
										self.getCompleteModelById(data, function(err, status, rs){
											if(err){
												logger.error(err);
												return cb(err, codes.INTERNAL_SERVER_ERROR);
											}
											return cb(null, codes.CREATED, rs);				
									})
								})
							}
						});				
					}else{
						var row = rs[0];
						
						if(!data.byCommunity){							
							if(row.isCommunityModel){
								return cb(null, codes.UNPROCESSABLE, {messages : userCannotEditCommunityModel});
							}
						}
						
						self.modelStatusChangeValidator(data, row, function(err, status, rs){
							if(err){
								 logger.error(err);
								 return cb(err, status);
							 }
							/*
							 * When model is not_active only status can be changed by firmAdmin user
							 */if(row.statusId == modelStatus["NOT_ACTIVE"]){
								 self.modelStatusChange(data, function(err, status, rs){
									 if(err){
										 logger.error(err);
										 return cb(err, codes.INTERNAL_SERVER_ERROR);
									 }else{
										 self.getCompleteModelById(data, function(err, status, rs){
											 if(err){
												 logger.error(err);
												 return cb(err, codes.INTERNAL_SERVER_ERROR);
											 }
											 return cb(null, codes.SUCCESS, rs);				
										 })				
									 }
								 })
							 }else{
								 modelDao.updateGeneralModelInformation(modelEntity, function(err, rs){
									 if(err){
										 logger.error(err);
										 return cb(err, codes.INTERNAL_SERVER_ERROR);
									 }else{
										 self.modelStatusChange(data, function(err, status, rs){
											 if(err){
												 logger.error(err);
												 return cb(err, codes.INTERNAL_SERVER_ERROR);
											 }
											 self.getCompleteModelById(data, function(err, status, rs){
												 if(err){
													 logger.error(err);
													 return cb(err, codes.INTERNAL_SERVER_ERROR);
												 }
												 return cb(null, codes.SUCCESS, rs);				
											 })				
										 })
									 }
								 });							
							 }
						});
					}
				}
			});
		}else{
			return cb(null, codes.UNPROCESSABLE, {message : messages.modelNameConstraintWithinNamespace});
		}
	});
};

ModelService.prototype.modelStatusChangeValidator = function(data, row, cb){
	logger.info(" model status change validator service called modelStatusChangeValidator()");
	var self = this;
	var canChangeStatus = modelUtil.statusChangeCheckBasedOnUser(data);
	data.privilegeToCheck = privilegeForModelApproval;
	self.isPrivilegedUserForApprovingStatus(data, function(err, status, rs){
			if(err){
				logger.error(err);
				next(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			var privilegedUserCheck = rs;
			if(data.statusId && row.statusId != data.statusId){
				if(data.statusId == modelStatus["DRAFT"]){
					return cb(messages.modelStatusCannotBeChangedByUserToDraft, codes.UNPROCESSABLE);
				}else if(row.statusId == ["NOT_ACTIVE"] && !canChangeStatus){
					return cb(messages.modelStatusCannotBeChangedByUserFromNotActive, codes.UNPROCESSABLE);
				}else if(row.statusId == modelStatus["DRAFT"]){
					return cb(messages.modelStatusCannotBeChangedByUserFromDraft, codes.UNPROCESSABLE);
				}else if(data.statusId == modelStatus["APPROVED"]){
					if(row.statusId == modelStatus["NOT_APPROVED"]){						
						if(privilegedUserCheck){
							cb(null, codes.SUCCESS, true);
						}else{
							return cb(messages.modelStatusCannotBeChangedByUserPrivilegedUserOnly, codes.UNPROCESSABLE);
						}
					}else{
						return cb(messages.modelStatusCannotBeChangedByUserFromNotApproved, codes.UNPROCESSABLE);
					}
				}else{
					return cb(null, codes.SUCCESS, true);
				}
			}else{
				cb(null, codes.SUCCESS, true);
			}
	});
};

ModelService.prototype.isPrivilegedUserForApprovingStatus = function(data, cb){
	logger.info(" user privileged for approving model called isPrivilegedUserForApprovingStatus()");
	
	var token = data.token;
	var privilegeToCheck = data.privilegeToCheck;
	sharedCache.get(token, function (err, data) {
		if(err){
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
        if (!!data) {
            var userLoggedIn;
            try {
                userLoggedIn = JSON.parse(data);
            } catch(err){
                logger.error("Has privilege failed (isPrivilegedUserForApprovingStatus()) " + err);
                return unauthorisedResponse(res, messages.unauthorized);    
            }
            var privilegeMap = userLoggedIn.privileges;
            privilegeToCheck = privilegeToCheck.toLowerCase(); 
            if(privilegeToCheck in privilegeMap){
            	return cb(null, codes.SUCCESS, true);
            }else{
            	return cb(null, codes.UNPROCESSABLE, false);
        	}
        }else{
        	return cb(null, codes.UNPROCESSABLE, false);
        }
	});
}

ModelService.prototype.assignModelToUserTeams = function(data, cb){
	logger.info(" assign model to user teams model called assignModelToUserTeams()");
	
	var teams = utilService.getAllTeamsForUser(data.user);
	if(teams && teams.length == 0){
		return cb(null, codes.SUCCESS, null);
	}
	asyncFor(teams, function(teamId, index, next){
		data.teamId = teamId;
		var model = modelConverter.assignModelToTeamModelFromModelModel(data);
		
		teamDao.assignModelToTeam(model, function(err, rs){
			if(err){
				logger.error(err);
				next(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			next(null, rs);
		})		
	}, function(err, data){
		return cb(null, codes.SUCCESS, data);
	})
}

ModelService.prototype.getTempModel = function (data, cb) {
	logger.info(" get tempModel (getTempModel())");
	
	modelDao.getTempModel(data, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(rs && rs.length > 0){
			return cb(null, codes.SUCCESS, rs);
		}else{
			return cb(null, codes.UNPROCESSABLE, rs);
		}
	})

};

ModelService.prototype.approveRejectTemporaryModel = function (data, cb) {
	logger.info(" approve/reject temporary model (approveRejectTemporaryModel())");
	
	var modelEntity = modelConverter.getModelEntityFromModelModel(data);
	var self  = this;
	
	var canChangeStatus = modelUtil.statusChangeCheckBasedOnUser(data);
	
	if(!canChangeStatus ){
			return cb(messages.modelStatusCannotBeChangedByUser, codes.UNPROCESSABLE);
	}
	self.getTempModel(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(status == codes.SUCCESS){
			if(data.actionStatus == "approve"){

				self.getTempModelAndSaveAsPermanent(data, function(err, status, rs){
					if(err){
						logger.error(err);
						return cb(err, status);
					}
					if(status != codes.SUCCESS){
						return cb(null, status, rs);
					}else{						
						data.statusId = modelStatus["APPROVED"];
						self.modelStatusChange(data, function(err, status, rs){
							if(err){
								logger.error(err);
								return cb(err, status);
							}else{
								return cb(null, codes.SUCCESS, {message : messages.modelApproved});	
							}
						})
					}
				})
			}else{
				self.clearTempModel(data, function(err, status, data){
					if(err){
						logger.error(err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					return cb(null, codes.SUCCESS, {message : messages.modelRejected});
				})
			}
		}else{
			self.getModel(data, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				if(rs && rs.length > 0){
					var row = rs[0];
					if(data.actionStatus == "approve"){
						if(row.statusId == modelStatus["APPROVED"]){
							return cb(null, codes.UNPROCESSABLE, {message : messages.tempModelDoesNotExist});
						}else if(row.statusId == modelStatus["NOT_APPROVED"]){
							data.statusId = modelStatus["APPROVED"];
							self.modelStatusChange(data, function(err, status, rs){
								if(err){
									logger.error(err);
									return cb(err, codes.INTERNAL_SERVER_ERROR);
								}
								return cb(null, codes.SUCCESS, {message : messages.modelApproved});
							})
						}else{
							return cb(null, codes.SUCCESS, {message : messages.modelStatusCannotBeChangedByUserFromNotApproved});
						}						
					}else{
						self.deleteModel(data, function(err, status, rs){
							if(err){
								logger.error(err);
								return cb(err, codes.INTERNAL_SERVER_ERROR);
							}
							return cb(null, codes.SUCCESS, {message : messages.modelRejected});
						})
					}
				}else{					
					return cb(null, codes.UNPROCESSABLE, {message : messages.modelNotFound});
				}
			})
		}
	})
};

ModelService.prototype.getTempModelAndSaveAsPermanent = function (data, cb) {
	logger.info(" get temp model and save as permanent service called (getTempModelAndSaveAsPermanent())");
	
	var modelEntity = modelConverter.getModelEntityFromModelModel(data);
	var self  = this;
	
	self.getCompleteTempModelById(data, function(err, status, completeModel){
		if(!completeModel.id){
			return cb(err, status, null);
		}
		if(completeModel.currentStatusId == modelStatus["NOT_APPROVED"]){			
			completeModel.user = {};
			baseConverter(completeModel, data);
			var tempModelEntity = modelEntity;
			tempModelEntity.statusId = modelStatus["NOT_APPROVED"];
			tempModelEntity.user = {};
			baseConverter(tempModelEntity, data);
			completeModel.fromTempModel = 1;
			
			/* this thing is unnessary
			*/self.modelStatusChange(tempModelEntity, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}else{
					
					self.saveCompleteModel(completeModel, function(err, status, rs){									
						if(err){
							logger.error(err);
							return cb(err, status);
						}
						if(status != codes.SUCCESS){
							return cb(err, status, rs);
						}	
						self.clearTempModel(data, function(err, status, rs){
							if(err){
								logger.error(err);
								return cb(err, status);
							}
							return cb(err, status, rs);			
						})
					});			
				}
			});
		}else{
			return cb(null,codes.UNPROCESSABLE, {message : messages.tempModelIsNotWaitingForApproval});
		}
		
	})

};

ModelService.prototype.modelStatusChange = function (data, cb) {
	logger.info(" model status change service called (modelStatusChange())");
	var self = this;
	var modelEntity = modelConverter.getModelEntityFromModelModel(data);
	
	if(data.statusId == modelStatus["APPROVED"]){
		modelUtil.setApprovedByBasedOnStatus(data);
		modelEntity.approvedBy = data.approvedByUserId;
	}
	if(!data.tempModel){
		modelDao.modelStatusChange(modelEntity, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}else{
				self.getCompleteModelById(data, function(err, status, rs){
					if(err){
						logger.error(err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					return cb(null, codes.SUCCESS, rs);				
				})				
			}
		});				
	}else{
		return cb(null, codes.SUCCESS, null);
	}

};

/*
 * update main model obj with modelId and modelElementid
*/ModelService.prototype.createOrUpdateModelDetail = function (data, cb) {
	logger.info(" model createOrUpdateModelDetail change service called (createOrUpdateModelDetail())");
	
	var self = this;
	var modelEntityObj = modelConverter.getModelDetailEntityListFromModelDetailModelList(data);
	var obj = {
		reqId : data.reqId,
		list : modelEntityObj.list
	};
	self.getModelElementsForModel(data, function(err, status, rs){
		
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		var modelDetailIdsToRemoveFromModelDetail = _.differenceWith(rs, data.idsNotToRemove, function(obj, id){
			if(obj.modelDetailId == id)
				return true;
			else 
				return false;
		})
		
		data.modelDetailIdsToRemoveFromModelDetail= modelDetailIdsToRemoveFromModelDetail;
		self.deleteModelDetailForModel(data, function(err, status, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			if(!data.tempModel){
				modelDao.createAndUpdateModelDetail(obj, function(err, rs){
					if(err){
						logger.error(err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					cb(null, codes.SUCCESS, rs);
				})
			}else{
				modelDao.createAndUpdateTempModelDetail(obj, function(err, rs){
					if(err){
						logger.error(err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					
					cb(null, codes.SUCCESS, rs);
					//			self.deleteModelDetailForModel(data, function(err, status, rs){
					//				if(err){
					//					logger.error(err);
					//					return cb(err, codes.INTERNAL_SERVER_ERROR);
					//				}
					//			})
				});	
			}
		});		
	})

};

ModelService.prototype.getModelElementsForModel = function (data, cb) {
	logger.info(" get model elements (getModelElementsForModel())");
	
	var tmpObj = {};
	tmpObj.reqId = data.reqId;
	tmpObj.modelId = data.id;
	if(!data.tempModel){
		modelDao.getModelElementsForModel(tmpObj, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			cb(null, codes.SUCCESS, rs);
		});		
	}else{
		return cb(null, codes.SUCCESS, []);
	}

};

ModelService.prototype.deleteModelDetailForModel = function (data, cb) {
	logger.info(" delete modelDetail service called (deleteModelDetailForModel())");
	
	var modelEntityObj = modelConverter.getModelDetailEntityObjFromModelModel(data);
	modelEntityObj.idsNotToRemove = data.idsNotToRemove;
	if(!data.tempModel){
		modelDao.deleteModelDetail(modelEntityObj, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			cb(null, codes.SUCCESS, rs);
		});		
	}else{
		modelDao.deleteTempModelDetail(modelEntityObj, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			cb(null, codes.SUCCESS, rs);
		});
	}

};

ModelService.prototype.getModelIdsWithGivenModelElments = function (data, cb) {
	logger.info(" get model ids for given modelElement service called (getModelIdsWithGivenModelElments())");
	
	var idsWhichAreEdited = [];
	var entity = {
			reqId : data.reqId,
			id : idsWhichAreEdited
	}
	data.modelStructureArray.forEach(function(value){
		if(value.isEdited){
			idsWhichAreEdited.push(value.id);
		}
	});
	
	logger.debug("Following submodels ids were edited: " + idsWhichAreEdited);
	if(idsWhichAreEdited && idsWhichAreEdited.length >0){
		entity.doneModelId = data.modelId;
		modelDao.getModelIdsWithModelElements(entity, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			cb(null, codes.SUCCESS, rs);
		});		
	}else{
		cb(null, codes.NOT_FOUND,null);
	}

};

ModelService.prototype.updatingOtherModels = function (data, cb) {
	logger.info(" updating other models service called (updatingOtherModels())");
	var self = this;
/*
 * model
*/	var dsMap = data.modelStructureMap;
	self.getModelIdsWithGivenModelElments(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err);
		}
		if(status == codes.SUCCESS){
			if(rs && rs.length == 0){
				return cb(null, codes.SUCCESS, []);
			}
			asyncFor(rs , function(value, index, next){
				
				var tempObj = {};
				tempObj["reqId"] = data.reqId;
				tempObj["id"] = value.id;
				tempObj["user"] = data.user;
				self.getCompleteModelById(tempObj, function(err, status, modelTreeReq){
					if(err){
						logger.error(err);
						next(err);
						return cb(err);
					}
					if(status != codes.SUCCESS){
						return next(null, modelTreeReq);
					}
					var sStatus = false;
					modelTreeReq.user = {};
					baseConverter(modelTreeReq, data);
					modelTreeReq.modelDetail.user = {};
					baseConverter(modelTreeReq.modelDetail, data);
					var modelTreeModel = modelConverter.getCompleteModelModelFromModelRequest(modelTreeReq, function(err){
						if(err){
							logger.error(err);
							sStatus = true;
							return cb(err, codes.UNPROCESSABLE);
						}
					});
					if(sStatus){
						return;
					}
					/*
					 * request,model(request)
					*/var serviceStatus = self.updateTreeChildNodes(modelTreeReq.modelDetail, dsMap);
					if(serviceStatus){
						modelTreeReq.forceFullUpdateOfApprovedModel = true;
						/*
						 * reuest
						*/self.saveCompleteModelWithoutUpdatingFurtherModels(modelTreeReq, function(err, status, rs){
							if(err){
								logger.error(err);
								next(err);
								return cb(err, status);
							}
							next(err, rs);
						});						
					}else{
						var tmpObj = {};
						tmpObj.reqId = data.reqId;
						tmpObj.substitutedModelId = modelTreeModel.id;
						tmpObj.user = data.user;
						
						var tcb = function(err, status, rs){
							if(err){
								logger.error(err);
								next(err);
								return cb(err, codes.INTERNAL_SERVER_ERROR);
							}
							self.deleteModel(modelTreeModel, function(err, status, rs){
								if(err){
									logger.error(err);
									next(err);
									return cb(err, codes.INTERNAL_SERVER_ERROR);
								}
								next(err, rs);
							});
						
						}
						if(modelTreeModel.isSubstitutedForSleeve){
							modelSleeveService.unassignSubstitutedModelToSleeve(tmpObj, tcb);
						}else{							
							modelPortfolioService.unassignSubstitutedModelToPortfolio(tmpObj, tcb)
						}
					}
//				self.saveCompleteModelWithoutUpdatingFurtherModels()
					
				});
			}, function(err, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				return cb(err, codes.SUCCESS, data);
			})			
		}else{
			cb(null, codes.NOT_FOUND, null);
		}
	});
	
};

/*
 * 1. new node have substituted
 * 2. saved modle has sustituted
*/
													//  savedModel, newModel
ModelService.prototype.updateTreeChildNodes = function (modelTree, newModelMap) {
	logger.info(" updating treeChildNodes models service called (updateTreeChildNodes())");
	
	var serviceStatus = true;
	var self = this;
	var children = modelTree.children;
	
	if(children){
		children.forEach(function(value, index){
			serviceStatus = self.updateTreeChildNodes(value, newModelMap);
		});
		//if(modelTree.level != 0){
		
		
		var newNode = newModelMap[modelTree.id];
		if(newNode){
			var childrensByWhichToReplace = newNode.children;
			childrensByWhichToReplace = self.includeCurrentNodesNotChildren(childrensByWhichToReplace, modelTree.children)
			
			if(newNode.childSubstituted){
				childrensByWhichToReplace = modelTree.children;
			}else if(modelTree.childSubstituted){
				
				var newNodeChildrensWithoutSubstitute = self.getCommonNodes(childrensByWhichToReplace, modelTree.children);
				
				/*
				 * is Node who have subsitutes does not come again, than that node will not be included here
				*/
				/*
				 * will saved nodes
				*/var getPossibleSubstituteNodes = self.getPossibleSubsitutes(modelTree.children, newNode.children);
				
				if(getPossibleSubstituteNodes && getPossibleSubstituteNodes.length > 0){
					getPossibleSubstituteNodes.forEach(function(val){
						newNodeChildrensWithoutSubstitute.push(val);
					});
				}else{
					serviceStatus = false;
				}
				
				childrensByWhichToReplace = newNodeChildrensWithoutSubstitute;

			}
			modelTree.user = {};
			if(newNode){
				baseConverter(modelTree, newNode);
				modelTree.children = childrensByWhichToReplace;
			}				
		}
		//}
	}
	
	return serviceStatus;
};

ModelService.prototype.getMangementStyles = function (data, cb) {
    logger.info("Get model managementStyle service called (getMangementStyles())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.managementStyles(data, function (err, fetched) {
        if (err) {
            logger.error("Error service (getMangementStyles())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Model managementStyle service returned successfully (getMangementStyles())");
        
        return cb(null, codes.SUCCESS, fetched);
    });
};

ModelService.prototype.getFilterTypes = function (data, cb) {
    logger.info("Get model list filterTypes called (getFilterTypes())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.filterTypes(data, function (err, fetched) {
        if (err) {
            logger.error("Error service (getFilterTypes())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Model filterTypes service returned successfully (getFilterTypes())");
        
        return cb(null, codes.SUCCESS, fetched);
    });
};

ModelService.prototype.getModelStatus = function (data, cb) {
    logger.info("Get model status list called (getModelStatus())");
    
    modelDao.modelStatus(data, function (err, fetched) {
        if (err) {
            logger.error("Error service (getModelStatus())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Model modelStatus service returned successfully (getModelStatus())");
        
        return cb(null, codes.SUCCESS, fetched);
    });
};

ModelService.prototype.getModelsByFilter = function (data, cb) {
    logger.info("Get model list by filter called (getModelsByFilter())");
    
    var self = this;

    self.getFilterTypes(data, function(err, status, rs){
    	 if (err) {
             logger.error("Error service (getFilterTypes())" + err);
             return cb(err, codes.INTERNAL_SERVER_ERROR);
         }
    	 if(rs && rs.length > 0){
    		 var statusIdArr = [];
    		 data.statusId = statusIdArr;
    		 rs.forEach(function(row){
    			 var value = row.filterType;
    			 if(value == "APPROVED_MODELS"){
    				 statusIdArr.push(1);
    			 }else if(value == "WAITING_FOR_APPROVAL"){
    				 statusIdArr.push(3);
    			 }else if(value == "DRAFT_MODELS"){
    				 statusIdArr.push(4);
    			 }else if(value == "OUT_MODELS"){
    				 data.outToleranceFilter = true;
    			 }
    		 })
    		 self.getModelList(data, function(err, status, rs){
    			 if (err) {
    	             logger.error("Error service (getFilterTypes())" + err);
    	             return cb(err, codes.INTERNAL_SERVER_ERROR);
    	         }
    			 return cb(err, status, rs);
    		 })
    	 }else{
    		 return cb(null, codes.UNPROCESSABLE, {"message" : messages.modelFilterNotDefined});
    	 }
    })
};


ModelService.prototype.deleteSubModel = function (data, cb) {
    logger.info("delete model called (deleteSubModel())");
    
    var self = this;
    
    self.canDeleteSubModel(data, function(err, status, rs){    	
    	if (err) {
			logger.error("Error service (deleteSubModel())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	if(status != codes.SUCCESS){
    		return cb(null, status, rs);
    	}
    	var modelEntity = modelConverter.getModelElementEntity(data);
    	modelDao.deleteModelElement(modelEntity, function(err, rs){
    		if (err) {
    			logger.error("Error service (deleteSubModel())" + err);
    			return cb(err, codes.INTERNAL_SERVER_ERROR);
    		}else{
    			return cb(null, codes.SUCCESS, {message : messages.subModelDeletedSuccessfully});
    		}
    	})
    })
};

ModelService.prototype.canDeleteSubModel = function (data, cb) {
    logger.info("delete model called (canDeleteSubModel())");
    
    var self = this;
    
    modelDao.getModelElementDetail(data, function(err, rs){
    	if (err) {
			logger.error("Error service (canDeleteSubModel())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	if(rs && rs.length > 0){
    		modelDao.modelElementUsageInModelDetailAndTempModelDetail(data, function(err, rs){
    			if (err) {
    				logger.error("Error service (canDeleteSubModel())" + err);
    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    			}else{
    				if(rs && rs.length == 0){
	    				return cb(null, codes.SUCCESS, {
	    					status : true, message : messages.canDeleteSubModel
	    				});
    				}else{
    					return cb(null, codes.UNPROCESSABLE, {status : false, message : messages.subModelCannotBeDeleted});
    				}
    			}
    		})
    	}else{
    		return cb(null, codes.NOT_FOUND, {status : false, message : messages.subModelNotFound});
    	}
    })
};

ModelService.prototype.deleteModel = function (data, cb) {
    logger.info("delete model called (deleteModel())");
    
    var self = this;
    var modelEntity = modelConverter.getModelEntityFromModelModel(data);
    
    self.getModel(data, function(err, rs){
    	if (err) {
			logger.error("Error service (deleteModel())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	if(rs && rs.length > 0){
    		self.modelDeleteCheck(data, function(err, status, rs){
    			if (err) {
    				logger.error("Error service (deleteModel())" + err);
    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    			}else{
    				if(status != codes.SUCCESS){
    					return cb(null, status, rs);
    				}else{						
    					modelDao.deleteModelGeneral(modelEntity, function(err, rs){
    						if (err) {
    							logger.error("Error service (deleteModel())" + err);
    							return cb(err, codes.INTERNAL_SERVER_ERROR);
    						}
    						self.clearTempModel(data, function(err, status, rs){
    							if (err) {
									logger.error("Error service (deleteModel())" + err);
									return cb(err, codes.INTERNAL_SERVER_ERROR);
								}
    							self.deleteModelDetailForModel(data, function(err, status, rs){
    								if (err) {
    									logger.error("Error service (deleteModel())" + err);
    									return cb(err, codes.INTERNAL_SERVER_ERROR);
    								}
    								cb(null, codes.SUCCESS, {"message" : messages.modelDeletedSuccessfully});
    							});
    						})
    					})    		
    				}
    			}
    		})
    	}else{
    		return cb(messages.modelNotFound, codes.NOT_FOUND);
    	}
    })
};

ModelService.prototype.modelDeleteCheck = function (data, cb) {
    logger.info("delete model called (modelDeleteCheck())");
    
    var self = this;
    
	modelPortfolioService.getPortfoliosForModel(data, function(err, status, rs){
		if (err) {
				logger.error("Error service (modelDeleteCheck())" + err);
				return cb(err, status);
			}else{
				if(rs && rs.length > 0){
					return cb(null, codes.UNPROCESSABLE, {status : false, message : messages.modelHasPortfolio});
				}else{
					var tmpObj = {};
					tmpObj.reqId = data.reqId;
					tmpObj.user = data.user;
					tmpObj.modelId = data.id;
					accountDao.getSmasForModel(tmpObj, function(err, rs){
						if (err) {
							logger.error("Error service (modelDeleteCheck())" + err);
							return cb(err, status);
						}
						if(rs && rs.length > 0){
							return cb(null, codes.UNPROCESSABLE, {status : false, message : messages.modelHasSMA});
						}else{							
							return cb(null, codes.SUCCESS, {status : true, message : messages.canDeleteModel});
						}
					})
				}
			}
	})
};

ModelService.prototype.checkUniqueNameConsideringNamespace = function(model, cb){
	logger.info(" checking uniquenames using namespace models service called (checkUniqueNameConsideringNamespace())");
	
	modelDao.getBasedOnNamespace(model, function(err, rs){
		if(err){
			return cb(err);
		}else{
			return cb(null, codes.SUCCESS, rs);
		}
	});
}

ModelService.prototype.checkUniqueNameConsideringNamespaceForSubmodel = function(model, cb){
	logger.info(" checking uniquenames using namespace submodels service called (checkUniqueNameConsideringNamespaceForSubmodel())");
	
	modelDao.getBasedOnNamespaceForSubmodel(model, function(err, rs){
		if(err){
			cb(err);
		}else{
			cb(null, codes.SUCCESS, rs);
		}
	});
}
										// newNode, oldNode
ModelService.prototype.getCommonNodes = function(arr1, arr2){
	logger.info(" get (getCommonNodes())");
	
	var self = this;
	
	var newNodesClonedArray = [];
	_.forEach(arr1, function(val){
		var newNode = self.copyNode(val);
		newNodesClonedArray.push(newNode);
	})
	
	return _.intersection(newNodesClonedArray, arr2, function(val1, val2){
		if(val1.id == val2.id){
			val1.modelDetailId = val2.modelDetailId;
			return true;
		}
	})
}

ModelService.prototype.getSubstitutedNode = function(arr1, arr2){
	logger.info(" get (getSubstitutedNode())");
	
	return _.intersection(arr1, arr2, function(val1, val2){
		if(val1.isSubstituted == 1){
			return true;
		}
	})
}

ModelService.prototype.getOtherThanSustitutesNodes = function(arr1, arr2){
	logger.info(" get (getOtherThanSustitutesNodes())");
	
	return _.differenceWith(arr1, arr2, function(val1, val2){
		if(val1.isSubstituted == 1){
			return true;
		}
	})
}

ModelService.prototype.getOtherThanSustitutesNodesFromSecondArray = function(arr1, arr2){
	logger.info(" get (getOtherThanSustitutesNodesFromSecondArray())");
	
	return _.differenceWith(arr2, arr1, function(val1, val2){
		if(val2.isSubstituted == 1){
			return true;
		}
	})
}
													// oldNode, newNode	
ModelService.prototype.getPossibleSubsitutes = function(arr1, arr2){
	logger.info(" get substitutes (getPossibleSubsitutes())");
	   
	var self = this;
	var map = {};
	arr2.forEach(function(value){
		map[value.id] = value;
	})
	var substituteOfArray = [];
	arr1.forEach(function(val){
		if(val.isSubstituted == 1){
			var node = map[val.substituteOf];
			if(node){
				substituteOfArray.push(val);				
			}
		}
	});
	
	return substituteOfArray;
}
																// newchildrens, oldchildrens
ModelService.prototype.includeCurrentNodesNotChildren = function(arr1, arr2){
	logger.info(" just current nodes to be included not  (includeCurrentNodesNotChildren())");
    
	var self = this;
	var map = {};
	arr2.forEach(function(value){
		map[value.id] = value;
	})
	var rTurn = [];
	arr1.forEach(function(value){
		var node = self.copyNode(value);
		if(map[value.id]){
			node.modelDetailId = map[value.id].modelDetailId;
			node.children = map[value.id].children;
		}
		rTurn.push(node);
	})
	return rTurn;
}

ModelService.prototype.copyNode = function(node1){
	logger.info(" create clone of node (copyNode())");
    
	var rTurn = {};
	return _.assign(rTurn, node1);
}

ModelService.prototype.getUniqueElementsFromList = function(arr){
	logger.info(" Get unique element list (getUniqueElementsFromList())");
    
	var rTurn = {};
	return _.uniqWith(arr, function(val1, val2){
		if(val1 == val2){
			return true;
		}
	});
}

ModelService.prototype.reflectChangesFromSubstitutedToNormal = function(substituted, node1){
	logger.info(" assign value to json from other json (reflectChangesFromSubstitutedToNormal())");
    
	node1.targetPercent = substituted.targetPercent;
	node1.toleranceType = substituted.toleranceType;
	node1.toleranceTypeValue = substituted.toleranceTypeValue;
	node1.lowerModelTolerancePercent = substituted.lowerModelTolerancePercent;
	node1.upperModelTolerancePercent = substituted.upperModelTolerancePercent;
	node1.lowerTradeTolerancePercent = substituted.lowerTradeTolerancePercent;
	node1.lowerModelToleranceAmount = substituted.lowerModelToleranceAmount;
	node1.upperModelToleranceAmount = substituted.upperModelToleranceAmount;
	node1.rank = substituted.rank;
}

ModelService.prototype.getNodeList = function (data, cb) {
    logger.info("Get model list service called (getNodeList())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.getNodesList(data, function (err, fetched) {
        if (err) {
            logger.error("Error service (checkModelAccessToUser())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        var modelList = modelConverter.getSubModelListFromModelElementEntityList(fetched);
        return cb(null, codes.SUCCESS, modelList);
    });
};

ModelService.prototype.getModelElementDetail = function (data, cb) {
    logger.info("Get model list service called (getNodeList())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.getModelElementDetail(data, function (err, fetched) {
        if (err) {
            logger.error("Error service (checkModelAccessToUser())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, codes.SUCCESS, fetched);
    });
};




ModelService.prototype.checkModelAccessToUser = function (data, cb) {
    logger.info("Get portfolio for model list service called (checkModelAccessToUser())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.checkModelAccessToUser(data, function (err, fetched) {
        if (err) {
            logger.error("Error service (checkModelAccessToUser())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, codes.SUCCESS, fetched);
    });
};

ModelService.prototype.tempModelStoreCheck = function (data, cb) {
    logger.info("temp Model Store check service called (tempModelStoreCheck())");
    
    var self = this;
//    var model = modelConverter.getCompleteModelModelFromModelRequest(data);
    self.getModel(data, function(err, status, rs){
    	if (err) {
            logger.error("Error service (tempModelStoreCheck())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	if(rs && rs.length > 0){
    		self.getModelStatusAccordingToPreference(data, function(err, pref){
    			if (err) {
    				logger.error("Error service (tempModelStoreCheck())" + err);
    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    			}
				var row = rs[0];
				if(row.statusId == modelStatus["NOT_APPROVED"] || row.statusId == modelStatus["DRAFT"] || row.statusId == modelStatus["NOT_ACTIVE"]){
					data.tempModel = false;
				}else{
					/*
					 * When model is updated from temporary saved model
					*/if(data.fromTempModel){
						data.tempModel = false;
					}
					/*
					 * When other models are approved.
					*/else if(data.forceFullUpdateOfApprovedModel){
						data.tempModel = false;
					}
					/*
					 * When substitute model are changed
					*/else if(data.isSubstitutedForPortfolio){
						data.tempModel = false;
					}else{
						if(pref){							
							data.tempModel = true;
						}else{
							data.tempModel = false;
						}
					}
				}
				return cb(err, codes.SUCCESS, data);
    		});    		
    	}else{
    		return cb(err, codes.UNPROCESSABLE, {message : messages.modelNotFound});
    	}
    });
};

ModelService.prototype.getModelStatusAccordingToPreference = function(model, cb){
	logger.info(" get preference for Model service called (getModelStatusAccordingToPreference())");

	var self = this;
	self.getModelApprovalPreference(model, function(err, status, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		return cb(null, rs);
	});
}

ModelService.prototype.getModel = function(model, cb){

	logger.info(" get model for Model service called (getModel())");
	
//	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	
	modelDao.get(model, function(err, rs){
		if (err) {
	        logger.error("Error service (getModel())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		
		return cb(err, codes.SUCCESS, rs);
	});
	
};

ModelService.prototype.getModelAsResponse = function(model, cb){

	logger.info(" get model as resposne service called (getModelAsResponse())");
	
//	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	
	modelDao.get(model, function(err, rs){
		if (err) {
	        logger.error("Error service (getModelAsResponse())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		if(rs && rs.length > 0){			
			var model = {};
			modelConverter.generalModelModelFromModelEntity(rs[0], model)
			cb(err, codes.SUCCESS, model);
		}else{			
			cb(err, codes.UNPROCESSABLE, {
				message : messages.modelNotFound
			});
		}
	});
	
};


ModelService.prototype.getModelElement = function(model, cb){

	logger.info(" get modelElement for Model service called (getModelElement())");
	
//	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	
	modelDao.getNodesList(model, function(err, rs){
		if (err) {
	        logger.error("Error service (getModelElement())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		cb(err, codes.SUCCESS, rs);
	});
};

ModelService.prototype.getModelElementExistence = function(model, cb){

	logger.info(" get modelElement for Model service called (getModelElementExistence())");
	
//	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	
	modelDao.getModelElementExistence(model, function(err, rs){
		if (err) {
	        logger.error("Error service (getModelElementExistence())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		cb(err, codes.SUCCESS, rs);
	});
};

ModelService.prototype.getAllModelsWithSecuritySet = function(model, cb){

	logger.info(" Get Modles with security set (getAllModelsWithSecuritySet())");
	
//	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	modelDao.getAllModelsWithSecuritySet(model, function(err, rs){
		if (err) {
	        logger.error("Error (getAllModelsWithSecuritySet())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		cb(err, codes.SUCCESS, rs);
	});
};

ModelService.prototype.changeModelStatusInBulk = function(model, cb){

	logger.info(" change model status in bulk (changeModelStatusInBulk())");
	
	var modelEntity = modelConverter.getModelEntityFromModelModel(model);
	
//	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	modelDao.modelStatusToINACTIVEInBulk(modelEntity, function(err, rs){
		if (err) {
	        logger.error("Error (changeModelStatusInBulk())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		cb(err, codes.SUCCESS, rs);
	});
};

ModelService.prototype.changeModelStatusWhenSecurityIsExcluded = function(model, cb){

	logger.info(" Security Set Presence Check (changeModelStatusWhenSecurityIsExcluded())");
	
	var self = this;
	SecuritySetService.getAllSecuritySetWithSecurity(model, function(err, status, rs){
		if (err) {
			logger.error("Error (changeModelStatusWhenSecurityIsExcluded())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		var securitySets = [];
		if(rs && rs.length > 0){
			rs.forEach(function(val){
				securitySets.push(val.id);
			})
			model.id = securitySets;
			self.getAllModelsWithSecuritySet(model, function(err, status, rs){
				if (err) {
					logger.error("Error (changeModelStatusWhenSecurityIsExcluded())" + err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				var modelIds = [];
				if(rs && rs.length > 0){
					rs.forEach(function(val){
						modelIds.push(val.id);
					})
					model.id = modelIds;
					model.statusId = modelStatus["NOT_ACTIVE"];
					self.changeModelStatusInBulk(model, function(err, status, rs){
						if (err) {
							logger.error("Error (changeModelStatusWhenSecurityIsExcluded())" + err);
							return cb(err, codes.INTERNAL_SERVER_ERROR);
						}
						return cb(err, status, rs);
					})
				}else{
					return cb(err, status, rs);
				}
			})
		}else{
			return cb(err, status, rs);
		}
	})
};

ModelService.prototype.getSubModelStructure = function(model, cb){

	logger.info(" get subModelStructure for Model service called (getSubModelStructure())");
	
//	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	var self = this;
	
	modelDao.getModelForModelElement(model, function(err, rs){
		if (err) {
	        logger.error("Error in getting model list service (getSubModelStructure())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		if(rs && rs.length > 0){	
			var modelDetail = rs[0];
			for(var i in rs){
				if(rs[i].count == 1)
					modelDetail = rs[i];
			}
			model.modelId = modelDetail.modelId;
			modelDao.getLeftRightValueForModelWithModelElement(model, function(err, rs){
				model.leftValue = rs[0].leftValue;
				model.rightValue = rs[0].rightValue;
				model.modelId = modelDetail.modelId;
				modelDao.getSubModelStructureForModelElement(model, function(err, fetched){
					if (err) {
						logger.error("Error service (getSubModelStructure())" + err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					var model = {};
					logger.info("getting complete model by id (getSubModelStructure())");
					if(fetched && fetched.length > 0){
						var currentLevel = 0;
						model = {
								id : null
						};
						var tempModel = {
								
						}
						fetched = fetched.reverse();
						var final = null;
						var entityNode = null;
						fetched.forEach(function(value){
							
							var leftValue = value.leftValue;
							var rightValue = value.rightValue;
							
							var node = {};
							node.id = value.meId;
							node.name = value.meName;
							node.nameSpace = value.meNamespace;
							node.children = [];
							node.level = value.meLevel;
							node.leftValue = leftValue;
							node.rightValue = rightValue;
							
							// more fields need to added into need
							node.children = [];        			
							
							
							tempModel[leftValue] = {};
							tempModel[leftValue]["right"] = rightValue;
							tempModel[leftValue]["actual"] = value;
							final = node;
							entityNode = value;
						});
						self.EntityListToModelStructure(final, tempModel);
						var rTurn = modelConverter.getSubModelModelFromModelElementEntity(entityNode);
						
						rTurn.children= final.children;
						return cb(null, codes.SUCCESS, rTurn);
					}else{
						return cb(null, codes.NOT_FOUND, {"message" : messages.subModelNotFound});
					}
				});
			})
		}else{
			self.getModelElementDetail(model, function(err, status, modelList){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}else{		
					if(modelList && modelList.length > 0){
						var rTurn = modelConverter.getSubModelModelFromModelElementEntity(modelList[0]);
						rTurn.children = [];
						return cb(null, codes.CREATED, rTurn);						
					}else{
						return cb(null, codes.NOT_FOUND, {message : messages.subModelNotFound } );
					}
				}
			});
		}
	});
};

ModelService.prototype.createModelFromImport = function(model, cb){

	logger.info(" create model Elements from import (createModelFromImport())");
	
	var modelEntity = modelConverter.getModelEntityFromModelModel(model);
	
//	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	modelDao.modelStatusToINACTIVEInBulk(modelEntity, function(err, rs){
		if (err) {
	        logger.error("Error (createModelFromImport())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		cb(err, codes.SUCCESS, rs);
	});
};

ModelService.prototype.getNamespaceTeam = function(node){
	var primaryTeam = utilService.getPrimaryTeamForUser(node.user);
	if(primaryTeam == undefined || primaryTeam == null){
		var tmpObj = {};
		tmpObj.reqId = node.reqId;
		tmpObj.user = node.user;
		tmpOjb.userId = node.user.userId;
		userService.getLogInUserRoleAndTeam(tmpObj, function(err, status, rs){
			if (err) {
		        logger.error("Error (createModelFromImport())" + err);
		        return cb(err, codes.INTERNAL_SERVER_ERROR);
		    }
			if(rs && rs.length > 0){				
				tmpObj.id = rs[0].id;
			}else{
				return cb(null, codes.SUCCESS, undefined);
			}
			teamDao.get(tmpObj,function(err, rs){
				if (err) {
			        logger.error("Error (createModelFromImport())" + err);
			        return cb(err, codes.INTERNAL_SERVER_ERROR);
			    }
				if(rs && rs.length > 0){								
					return cb(null, codes.SUCCESS, rs[0].name);
				}else{
					return cb(null, codes.SUCCESS, undefined);
				}
			});
		})
	}
	
	return primaryTeam;
}

ModelService.prototype.checkAndCreateModelManagementStyleByName = function(node, cb){

	var managementStyleEntity = modelConverter.getModelManagementEntity(node);
	
	modelDao.getManagementStyleByName(managementStyleEntity, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		if(rs && rs.length > 0){
			cb(null, codes.SUCCESS, rs[0]);
		}else{
			if(managementStyleEntity.name){				
				modelDao.createManagementStyle(managementStyleEntity, function(err, rs){
					if(err){
						logger.error(err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					managementStyleEntity.id = rs.insertId;
					return cb(null, codes.CREATED, managementStyleEntity);
				})
			}else{
				return cb(null, codes.UNPROCESSABLE, {message : messages.modelManagementStyleRequired});
			}
		}
	})

}

ModelService.prototype.createOrUpdateDynamicModelSecuritiesQuantities = function (data, cb) {
	logger.info(" create or update dynamic model securities quantities service called (createOrUpdateDynamicModelSecuritiesQuantities())");
	
	var self = this;
	var totalAmount = dynamicModelArbitraryAmount;
	
	var modelEntity = modelConverter.modelSecuritiesResponseToDynamicModelSecuritiesQuantitiesEntity(data);
	
	if(!data.tempModel){
		modelDao.deleteDynamicModelSecurityQuantity(modelEntity, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			modelDao.getTargetAllocationsForSecuritiesInSecuritySetInModel(data, function(err, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				try{
					var json = {};
					console.log("securitites");
					console.log(rs);
					var validArray = [];
					if(rs && rs.length > 0){
						asyncFor(rs, function(value, index, next){
							if(index == (rs.length - 1))
								return next();
							
							value = value[0];
							var securityId = value.id;
							
							var tmpObj = {};
							tmpObj.reqId = data.reqId;
							tmpObj.securityId = securityId;
							
							securityDao.getLatestSecurityPrice(tmpObj, function(err, rs){
								if(err){
									logger.error(err);
									next(err);
									return cb(err, codes.INTERNAL_SERVER_ERROR);
								}
								console.log(rs);
								value.price = rs[0].price;
								value.isDeleted = 0;
								value.quantity = parseInt((value.targetInPercent * totalAmount)/(value.price * 100));
								if(!isNaN(value.quantity)){
									validArray.push(value);
								}
								next();
							})
							
						}, function(err, rss){
							
							var tmpObj = {};
							tmpObj.reqId = data.reqId;
							tmpObj.id = data.id;
							tmpObj.user = data.user;
							tmpObj.list = validArray;
							
							var dynamicModelObj = modelConverter.modelSecuritiesResponseToDynamicModelSecuritiesQuantitiesEntityList(tmpObj);
							dynamicModelObj.fromCorporate = 0;
							if(tmpObj.list && tmpObj.list.length > 0){								
								modelDao.createDynamicModelSecurityQuantity(dynamicModelObj, function(err, rs){
									if(err){
										logger.error(err);
										return cb(err, codes.INTERNAL_SERVER_ERROR);
									}else{							
										return cb(null, codes.SUCCESS, {message : messages.dynamicModelSecuritiesQuantityUpdated});
									}
								})
							}else{
								return cb(null, codes.SUCCESS, {message : messages.dynamicModelSecuritiesQuantityUpdated});
							}
						})
					}else{
						return cb(null, codes.SUCCESS, null);
					}
				}catch(e){
					logger.error(e);
					return cb(e, codes.INTERNAL_SERVER_ERROR);
				}
			});
		})
	}else{
		return cb(null, codes.SUCCESS, null);
	}
	
};

ModelService.prototype.reflectSpinOffSecurity = function (data, cb) {
	logger.info(" reflect spinoff security service called (reflectSpinOffSecurity())");
	
	var self = this;
	var totalAmount = dynamicModelArbitraryAmount;
	
	modelDao.getAllModelSecuritiesQuantitiesWithSecurity(data, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		asyncFor(rs, function(row, index, next){
			var dateTime = utilDao.getSystemDateTime(null);
			var tmpObj = {};
			tmpObj.reqId = data.reqId;
			tmpObj.user = data.user;
			baseConverter(tmpObj, data);
			
			tmpObj.id = row.modelId;
			row.id = data.spinOfSecurityId;
			row.quantity = (data.to / data.from) * row.quantity;
			row.createdDate =  dateTime;
			row.editedDate = dateTime;
			
			tmpObj.list = [row];
			var dynamicModelObj = modelConverter.modelSecuritiesResponseToDynamicModelSecuritiesQuantitiesEntityList(tmpObj);
			dynamicModelObj.fromCorporate = 1;
			modelDao.createDynamicModelSecurityQuantity(dynamicModelObj, function(){
				if(err){
					logger.error(err);
					next(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				next();
			})
			
		}, function(err, status){
			cb(err, status, null);
		})
		
	})
	
};


var modelPortfolioService = require('service/model/ModelPortfolioService.js');