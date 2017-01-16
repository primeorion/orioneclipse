"use strict";

var ModelPortfolioService =  function() {}

var moduleName = __filename;

var _ = require("lodash");

var config = require('config');
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var TeamDao = require('dao/admin/TeamDao.js');
var ModelDao = require('dao/model/ModelDao.js');
var modelConverter = require('converter/model/ModelPortfolioConverter.js');
var localCache = require('service/cache').local;
var baseConverter = require('converter/base/BaseConverter.js');
var ModelPortfolioDao = require('dao/model/ModelPortfolioDao.js');
var modelUtil = require("service/model/ModelUtilService.js");
var PortfolioService = require('service/portfolio/PortfolioService.js');
var modelService = require('service/model/ModelService.js');
var SMAService = require('service/account/SMAService.js');
var NotificationService = require("service/notification/NotificationService.js");

var portfolioService = new PortfolioService();
var asyncFor = helper.asyncFor;
var applicationEnum = config.applicationEnum;
var asyncFor = helper.asyncFor;
var messages = config.messages;
var codes = config.responseCode;
var teamDao = new TeamDao();
var modelDao = new ModelDao();
var modelPortfolioDao = new ModelPortfolioDao();
var notificationService = new NotificationService();
var modelStatus = config.applicationEnum.modelStatus;
var modelPortfolioStatus = config.applicationEnum.modelPortfolioStatus;  
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;

ModelPortfolioService.prototype.getPortfoliosForModel = function (data, cb) {
    logger.info("Get portfolio for model list service called (getPortfoliosForModel())");
    
    var self = this;
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;
    modelService.getModel(data, function(err, status, rs){
    	if (err) {
            logger.error("Error in getting portfolio list for model service (getPortfoliosForModel())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	if(rs && rs.length > 0){
    		modelPortfolioDao.getPortfoliosForModel(data, function (err, fetched) {
    			if (err) {
    				logger.error("Error in getting model list service (getPortfoliosForModel())" + err);
    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    			}
    			return cb(null, codes.SUCCESS, fetched);
    		});
    	}else{
    		return cb(null, codes.NOT_FOUND, {message : messages.modelNotFound});
    	}
    })
};


ModelPortfolioService.prototype.getAllPendingModelPortfolios = function (data, cb) {
    logger.info("Get portfolio for model list service called (getAllPendingModelPortfolios())");
    
    var self = this;
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelPortfolioDao.getAllModelPortfolios(data, function (err, fetched) {
		if (err) {
			logger.error("Error in getting model list service (getAllPendingModelPortfolios())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		var result = modelConverter.getModelPortfolioPendingListFromModelPortfolioEntityList(fetched);
		return cb(null, codes.SUCCESS, result);
	});
    	
};


ModelPortfolioService.prototype.getPendingModelForPortfolios = function (data, cb) {
    logger.info("Get portfolio for model list service called (getAllPendingModelPortfolios())");
    
    var self = this;
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelPortfolioDao.getAllModelPortfolios(data, function (err, fetched) {
		if (err) {
			logger.error("Error in getting model list service (getAllPendingModelPortfolios())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		return cb(null, codes.SUCCESS, fetched);
	});
    	
};

ModelPortfolioService.prototype.assignModelToPortfolio = function (data, cb) {
    logger.info("Get portfolio for model list service called (assignModelToPortfolio())");
    
    var self = this;
    var portfolioEntity = modelConverter.getPortfolioEntityFromModelModel(data);
    modelPortfolioDao.assignModelToPortfolio(portfolioEntity, function(err, rs){
    	if (err) {
			logger.error("Error in getting model list service (assignModelToPortfolio())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	SMAService.removeSMAForPortfolio(data, function(err, rs){
    		if (err) {
    			logger.error("Error in getting model list service (assignModelToPortfolio())" + err);
    			return cb(err, codes.INTERNAL_SERVER_ERROR);
    		}
    		cb(err, codes.SUCCESS, rs);
    	})
    })
};

ModelPortfolioService.prototype.unassignSubstitutedModelToPortfolio = function (data, cb) {
    logger.info("Get portfolio for model list service called (unassignSubstitutedModelToPortfolio())");
    
    var self = this;
    var portfolioEntity = modelConverter.getPortfolioEntityFromModelModel(data);
    modelPortfolioDao.unassignModelToPortfolio(portfolioEntity, function(err, rs){
    	if (err) {
			logger.error("Error in getting model list service (unassignSubstitutedModelToPortfolio())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	self.unassignSubstitutedModelToPortfolioTemp(data, function(err, status, rs){
        	if (err) {
    			logger.error("Error in getting model list service (unassignSubstitutedModelToPortfolio())" + err);
    			return cb(err, codes.INTERNAL_SERVER_ERROR);
    		}
    		SMAService.removeSMAForPortfolio(data, function(err, rs){
    			if (err) {
    				logger.error("Error in getting model list service (unassignSubstitutedModelToPortfolio())" + err);
    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    			}
    			cb(err, codes.SUCCESS, rs);
    		})
    	})
    })
};

ModelPortfolioService.prototype.unassignSubstitutedModelToPortfolioTemp = function (data, cb) {
    logger.info("Get portfolio for model list service called (assignModelToPortfolioTemp())");
    
    var self = this;
    
    var portfolioEntity = modelConverter.getTempPortfolioEntityFromModelModel(data);
    modelPortfolioDao.unassignModelToPortfolioTemp(portfolioEntity, function(err, rs){
    	if (err) {
			logger.error("Error in getting model list service (assignModelToPortfolioTemp())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	cb(err, codes.SUCCESS, rs);
    })
};


ModelPortfolioService.prototype.assignModelToPortfolioTemp = function (data, cb) {
    logger.info("Get portfolio for model list service called (assignModelToPortfolioTemp())");
    
    var self = this;
    
    var portfolioEntity = modelConverter.getTempPortfolioEntityFromModelModel(data);
    modelPortfolioDao.assignModelToPortfolioTemp(portfolioEntity, function(err, rs){
    	if (err) {
			logger.error("Error in getting model list service (assignModelToPortfolioTemp())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
    	self.modelNotifications(data, function(){    		
    		cb(err, codes.SUCCESS, rs);
    	})
    })
};

ModelPortfolioService.prototype.modelNotifications = function (data, cb) {
	var notificationInputData = {
        reqId: data.reqId,
        user: data.user,
        subject: messages.modelNotification.modelApprovalSubject,
        body: messages.modelNotification.modelApprovalBody + data.modelId + " withPortfolio: " + data.portfolioId,
        notificationCategoryType:applicationEnum.notificationCategoryType.MODEL_ASSIGNMENT_APPROVAL
    };
	notificationService.createAndSendNotification(notificationInputData, function(err,result){
	    if(err){
	        logger.debug("error in create and send notification (modelNotifications())");
	        logger.error(err);
	    }
	    return cb();
	});
}

ModelPortfolioService.prototype.getPreferenceForPortfolio = function (data, cb) {
//    logger.info("Get portfolio for model list service called (getPreferenceForPortfolio())");
//    
//    var self = this;
//    
//    var prefEntity = modelConverter.getPreferenceForPortfolio(data);
//    
//    modelService.getModelPortfolioAssignmentApprovalPreference(prefEntity, function(err, status, rs){
//    	if (err) {
//			logger.error("Error in getting model list service (getPreferenceForPortfolio())" + err);
//			return cb(err, codes.INTERNAL_SERVER_ERROR);
//		}
//    	return cb(err, codes.SUCCESS, rs);
//    })
	return cb(null, codes.SUCCESS, true);
};

ModelPortfolioService.prototype.savePortfolioForModel = function (portfolio, cb) {
    logger.info("Get portfolio for model list service called (savePortfolioForModel())");
    
    var self = this;

	var portfolioId = portfolio.id;
	var substitutedModelId = portfolioId;
	var tmpObj = {};
	tmpObj.reqId = portfolio.reqId;
	tmpObj.id = portfolio.modelId;
	
	var portfolioModel = {};
	portfolioModel.id = portfolio.portfolioId;
	portfolioModel.reqId = portfolio.reqId;
	portfolioModel.user = portfolio.user;
	
	portfolioService.portfolioExist(portfolioModel, function(err, status, rs){
		if(!status){
			return cb(messages.portfolioNotFound, codes.UNPROCESSABLE);
		}
		var portfolioInDb = rs[0];
		var tmpObj = {}
		tmpObj.reqId = portfolio.reqId;
		tmpObj.id = portfolio.modelId;
		tmpObj.portfolioId = portfolio.portfolioId;
		tmpObj.user = portfolio.user;
		self.getPendingModelForPortfolios(tmpObj, function(err, status, pendingPortfolios){
			if (err) {
				logger.error("Error in getting model list service (savePortfolioForModel())" + err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			if(pendingPortfolios && pendingPortfolios.length > 0){
					return cb(null, codes.UNPROCESSABLE, {message : messages.modelPortfolioRelationAlreadyExists});
			}
			
			modelService.getModel(tmpObj, function(err, status, rs){
				if (err) {
					logger.error("Error in getting model list service (savePortfolioForModel())" + err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				if(portfolioInDb.modelId == portfolio.modelId && !portfolio.substitutedModelId){
					return cb(null, codes.UNPROCESSABLE, {message : messages.modelPortfolioRelationAlreadyExists});
				}
				
				
				if(rs && rs.length > 0){
					var row = rs[0];
					if(row.statusId == modelStatus["APPROVED"]){
						self.getPreferenceForPortfolio(portfolio, function(err, status, rs){
							
							/*
							 * when true than it means that need approval before beign assigned to protfolio
							 */if(status){
								 self.assignModelToPortfolioTemp(portfolio, function(err, status, rs){
									 if (err) {
										 logger.error("Error service (savePortfolioForModel())" + err);
										 return cb(err, codes.INTERNAL_SERVER_ERROR);
									 }
									 return cb(null, codes.SUCCESS, {status : messages.modelAssignedToPortfoliosButWaitingForApproval, message : modelPortfolioStatus["NOT_APPROVED"]});
								 });
							 }else{
								 self.assignModelToPortfolio(portfolio, function(err, status, rs){
									 if (err) {
										 logger.error("Error service (savePortfolioForModel())" + err);
										 return cb(err, codes.INTERNAL_SERVER_ERROR);
									 }
									 return cb(null, codes.CREATED, {status : messages.modelAssignedToPortfolios, message : modelPortfolioStatus["APPROVED"]});
								 });
							 }
						})					
					}else{
						return cb(null, codes.UNPROCESSABLE, {"messages" : messages.modelCannotBeAssignedToPortfolio});
					}			
				}else{
					return cb(null, codes.UNPROCESSABLE, {"messages" : messages.modelNotFound});
				}
			})
		})
	})
};

ModelPortfolioService.prototype.deletePortolioFromModel = function (portfolio, cb) {
	
    logger.info(" Delete model from portfolio service called (deletePortolioFromModel())");
    
    var self = this;

	self.deleteTempPortolioFromModel(portfolio, function(err, status, rs){
		if (err) {
			logger.error("Error service (deletePortolioFromModel())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		
		var portfolioEntity = modelConverter.getPortfolioEntityFromModelModel(portfolio);;
		modelPortfolioDao.deleteModelToPortfolio(portfolioEntity, function(err, rs){
			if (err) {
				logger.error("Error service (deletePortolioFromModel())" + err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			cb(null, codes.SUCCESS,{messages : messages.modelUnAssignedToPortfolios} );	
		})
	})
    
};

ModelPortfolioService.prototype.deleteTempPortolioFromModel = function (portfolio, cb) {
	
    logger.info(" Delete temp model-portfolio service called (deleteTempPortolioFromModel())");
    
    var self = this;

	var portfolioEntity = modelConverter.getTempPortfolioEntityFromModelModel(portfolio);;
	modelPortfolioDao.deleteModelToPortfolioTemp(portfolioEntity, function(err, rs){
		if (err) {
			logger.error("Error service (deleteTempPortolioFromModel())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		
		cb(null, codes.SUCCESS,{messages : messages.tempModelUnAssignedToPortfolios} );
		
	})
    
};

ModelPortfolioService.prototype.approveModelForPortfolio = function (data, cb) {
    logger.info(" Approve model for portfolio service called (approveModelForPortfolio())");

    var self = this;

	var portfolioId = data.id;
	var substitutedModelId = data;
	if(data.approve && data.approve.length > 0){
		asyncFor(data.approve, function(portfolio, index, next){
			portfolio.modelId = data.modelId;
			var tmpObj = {};
			tmpObj.id = portfolio.portfolioId;
			tmpObj.reqId = portfolio.reqId;
			tmpObj.user = portfolio.user;
			var modelObj = {};
			modelObj.id = portfolio.modelId;
			modelObj.reqId = portfolio.reqId;
			portfolioService.portfolioExist(tmpObj, function(err, status, rs){
				if(!status){
					return cb(messages.portfolioNotFound, codes.UNPROCESSABLE);
				}
				
				modelService.getModel(modelObj, function(err, status, rs){
					if (err) {
						logger.error("Error in getting model list service (approveModelForPortfolio())" + err);
						next(err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					if(rs && rs.length > 0 && rs[0].statusId == modelStatus["APPROVED"]){
						var portfolioEntity = modelConverter.getTempPortfolioEntityFromModelModel(portfolio);
						modelPortfolioDao.getTempModelSubstitutedForPortfolio(portfolioEntity, function(err, rs){
							if (err) {
								logger.error("Error in getting model list service (approveModelForPortfolio())" + err);
								next(err);
								return cb(err, codes.INTERNAL_SERVER_ERROR);
							}
							if(rs && rs.length > 0){
								var row = rs[0];
								row.reqId = portfolio.reqId
								row.user = portfolio.user;
								self.assignModelToPortfolio(row, function(err, status, rs){
									if (err) {
										logger.error("Error in getting model list service (approveModelForPortfolio())" + err);
										next(err);
										return cb(err, codes.INTERNAL_SERVER_ERROR);
									}
									self.deleteTempPortolioFromModel(portfolio, function(err, status, rs){
										if (err) {
											logger.error("Error in getting model list service (approveModelForPortfolio())" + err);
											next(err);
											return cb(err, codes.INTERNAL_SERVER_ERROR);
										}
										return next(err, codes.SUCCESS, {"messages" : messages.modelApprovedForPortfolio});
									})
								})
							}else{
								return next(null, codes.NOT_FOUND);	
							}
						})
					}else{
						next(messages.modelCannotBeApprovedWithPortfolio);
						return cb(null, codes.UNPROCESSABLE, {messages : messages.modelCannotBeApprovedWithPortfolio});
					}
				});
			})
		}, function(err, status){
			if(status == codes.SUCCESS){
				return cb(null, codes.SUCCESS, {"messages" : messages.modelApprovedForPortfolio});
			}else{
				return cb(null, codes.NOT_FOUND, {"messages" : messages.noModelPortfolioRelationWaitingForApproval});
			}
		})
	}else if(data.reject && data.reject.length > 0){
		asyncFor(data.reject, function(portfolio, index, next){
			portfolio.modelId = data.modelId;
			self.deleteTempPortolioFromModel(portfolio, function(err, status, rs){
				if (err) {
					logger.error("Error service (approveModelForPortfolio())" + err);
					next(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				next(err, codes.SUCCESS, {"messages" : messages.modelRejectedForPortfolio});
			});
		}, function(err, status){
			if(status == codes.SUCCESS){
				return cb(null, codes.SUCCESS, {"messages" : messages.modelRejectedForPortfolio});
			}
		})
	}else{
		return cb(null, codes.SUCCESS, {"messages" : messages.modelForPortfolioFailed});
	}
    
};

ModelPortfolioService.prototype.getPortfoliosForModelAccountCount = function (data, cb) {
    logger.info("Get portfolio for model list service called (getPortfoliosForModelAccountCount())");
    
    var self = this;
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;
    modelService.getModel(data, function(err, status, rs){
    	if (err) {
            logger.error("Error in getting portfolio list for model service (getPortfoliosForModelAccountCount())" + err);
            return cb(err, codes.INTERNAL_SERVER_ERROR);
        }
    	if(rs && rs.length > 0){
    		modelPortfolioDao.getPortfoliosForModelAccountCount(data, function (err, fetched) {
    			if (err) {
    				logger.error("Error in getting model list service (getPortfoliosForModelAccountCount())" + err);
    				return cb(err, codes.INTERNAL_SERVER_ERROR);
    			}
    			return cb(null, codes.SUCCESS, fetched);
    		});
    	}else{
    		return cb(null, codes.NOT_FOUND, {message : messages.modelNotFound});
    	}
    })
};

module.exports = new ModelPortfolioService();

var modelService = require('service/model/ModelService.js');
