"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var ModelDao = require('dao/model_temp/ModelDao.js');
var modelConverter = require('converter/model_temp/ModelConverter.js');
var localCache = require('service/cache').local;
var baseConverter = require('converter/base/BaseConverter.js');

var asyncFor = helper.asyncFor;
var messages = config.messages;
var codes = config.responseCode;

var modelDao = new ModelDao();

var ModelService =  function() {}

ModelService.prototype.getModelList = function (data, cb) {
    logger.info("Get model list service called (getModelList())");
    
    var session = localCache.get(data.reqId).session;

    data.modelAllAccess = session.modelAllAccess;
    data.modelLimitedAccess = session.modelLimitedAccess;

    modelDao.getList(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting model list service (getModelList())" + err);
            return cb(messages.internalServerError, codes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Model list service returned successfully (getModelList())");
        
        return cb(null, codes.SUCCESS, fetched);
    });
};
/*
 * returns complete tree
*/ModelService.prototype.getCompleteModelById = function (data, cb) {
	
    logger.info("Get complete model by id service called (getCompleteModelById())");
    var self = this;
    modelDao.getCompleteModelById(data, function (err, fetched) {
        if (err) {
            logger.error(err);
            return cb(messages.internalServerError, codes.INTERNAL_SERVER_ERROR);
        }
        var model = {};
        logger.info("getting complete model by id (getCompleteModelById())");
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
        		 * will run every tiem making the parent node to set to model.structure
        		*/
    			model.id = value.id;
    			model.name = value.name;
    			model.description = value.description;
    			model.modelDetail = node;
        		model.ownerUserId = value.ownerUserId;
        		model.dynamicModel = value.dynamicModel;
        		model.isDeleted = value.isDeleted;
        		model.createdOn = value.createdDate;
        		model.editedOn = value.editedDate;
        		model.createdBy = value.createdBy;
        		model.editedBy = value.editedBy;
        		
        		node.id = value.meId;
        		node.name = value.meName;
        		node.relatedTypeId = value.meRelatedTypeId;
				node.targetPercent = value.targetPercent;
        		node.lowerModelTolerancePercent = value.lowerModelTolerancePercent;
        		node.upperModelTolerancePercent = value.upperModelTolerancePercent;
        		node.toleranceBand = value.toleranceBand;
        		node.lowerModelToleranceAmount = value.lowerModelToleranceAmount;
        		node.upperModelToleranceAmount = value.upperModelToleranceAmount;
        		node.lowerTradeTolerancePercent = value.lowerTradeTolerancePercent;
        		node.upperTradeTolerancePercent = value.upperTradeTolerancePercent;
				node.level = value.meLevel;
        		node.leftValue = value.meLeftValue;
        		node.rightValue = value.meRightValue;
        		
        		// more fields need to added into need
        		node.children = [];
        		var leftValue = value.meLeftValue;
        		var rightValue = value.meRightValue;
        		
        		tempModel[leftValue] = {};
        		tempModel[leftValue]["right"] = rightValue;
        		tempModel[leftValue]["actual"] = node;
        	});
        	self.EntityListToModelStructure(model.modelDetail, tempModel);
        }
        return cb(null, codes.SUCCESS, model);
    });
};

ModelService.prototype.EntityListToModelStructure = function (data, tempMap) {
    logger.info("conversion of entity list to model structure service called (EntityListToModelStructure())");
    
    if(data.children && data.children.length > 0){
    	
    }else{
    	data.children = [];
    }
    
    var leftValue = data.leftValue+1;
    var rightValue = data.rightValue-1;
    var tempObj = tempMap[leftValue];

    while(rightValue > leftValue){
    	leftValue = tempObj.right + 1; 
    	data.children.push(tempObj.actual);
    	tempObj = tempMap[leftValue];
    }
//    tempMap[]
    
    var self = this;
    data.children.forEach(function(value){
    	self.EntityListToModelStructure(value, tempMap);
    });
    
};

/*
 * input model is complete tree
*/ModelService.prototype.saveCompleteModelWithoutUpdatingFurtherModels = function (data, cb) {
	
	var self = this;
	
	var model = modelConverter.getCompleteModelModelFromModelRequest(data);
	
	self.createOrUpdateGeneralModel(model, function(err, status, rs){
		
		/*
		 * independent of modelId
		*/self.createModelElement(model, function(err, status, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
//			var modelDetailList = modelConverter.getModelDetailEntityListFromModelDetailModelList(model);
			modelConverter.getModelDetailAFterInsertionFromModelDetailModelList(model);
			self.createOrUpdateModelDetail(model, function(err, status, rs){
				if(err){
					logger.error(err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}
				return cb(null, codes.SUCCESS, model);
			});
		});		
	});
	
};

ModelService.prototype.getTreeFromArray = function(){
	
}

ModelService.prototype.saveCompleteModel = function (data, cb) {
	
	var self = this;
	
	self.saveCompleteModelWithoutUpdatingFurtherModels(data, function(err, status, model){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		
		self.updatingOtherModels(model, function(err, status, rs){
			
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}

			self.getCompleteModelById(model, cb);
		})
	});

};


ModelService.prototype.createModelElement = function (data, cb) {
	
	var self = this;
	
	var modelStructureArray = data.modelStructureArray;
	asyncFor(modelStructureArray, function(value, index, next){
	
		var modelElementEntity = modelConverter.getModelElementEntity(value);
		modelDao.createAndUpdateModelElement(modelElementEntity, function(err, rs){
			if(err){
				logger.error(err);
				next(err);
				return cb(messages.internalServerError, codes.INTERNAL_SERVER_ERROR);
			}else{
				if(rs.insertId){
					value.id = rs.insertId;
				}
				next(null, data);
			}
		});				
	}, function(err, data){
		cb(null, codes.SUCCESS, data);
	});
	
};

ModelService.prototype.createOrUpdateGeneralModel = function (data, cb) {
	
	var self = this;
	
	var modelEntity = modelConverter.getModelEntityFromModelModel(data);
	modelDao.get(modelEntity, function(err, rs){
		if(err){
			logger.error(err);
			return cb(messages.internalServerError, codes.INTERNAL_SERVER_ERROR);
		}else{
			if(rs && rs.length == 0){
				modelDao.createGeneralModelInformation(modelEntity, function(err, rs){
					if(err){
						logger.error(err);
						return cb(messages.internalServerError, codes.INTERNAL_SERVER_ERROR);
					}else{
						data.id = rs.insertId;
						cb(null, codes.SUCCESS, {
							id : rs.insertId
						});				
					}
				});				
			}else{
				modelDao.updateGeneralModelInformation(modelEntity, function(err, rs){
					if(err){
						logger.error(err);
						return cb(messages.internalServerError, codes.INTERNAL_SERVER_ERROR);
					}else{
						cb(null, codes.SUCCESS, modelEntity);				
					}
				});	
			}
		}
	});
};

/*
 * update main model obj with modelId and modelElementid
*/ModelService.prototype.createOrUpdateModelDetail = function (data, cb) {
	
	var self = this;
	var modelEntityObj = modelConverter.getModelDetailEntityListFromModelDetailModelList(data);
	var obj = {
		reqId : data.reqId,
		list : modelEntityObj.list
	};
	modelDao.createAndUpdateModelDetail(obj, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		self.deleteModelDetailForModel(data, function(err, status, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			cb(null, codes.SUCCESS, rs);
		})
	});

};

ModelService.prototype.deleteModelDetailForModel = function (data, cb) {
	var modelEntityObj = modelConverter.getModelDetailEntityObjFromModelModel(data);
	
	modelEntityObj.idsNotToRemove = data.idsNotToRemove;
	
	modelDao.deleteModelDetail(modelEntityObj, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		cb(null, codes.SUCCESS, rs);
	});

};

ModelService.prototype.getModelIdsWithGivenModelElments = function (data, cb) {
	
	var entity = {
			reqId : data.reqId,
			id : data.idsNotToRemove
	}
	modelDao.getModelIdsWithModelElements(entity, function(err, rs){
		if(err){
			logger.error(err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		cb(null, codes.SUCCESS, rs);
	});

};

ModelService.prototype.updatingOtherModels = function (data, cb) {
	
	var self = this;

	var dsMap = data.modelStructureMap;
	self.getModelIdsWithGivenModelElments(data, function(err, status, rs){
		asyncFor(rs , function(value, index, next){
			
			var tempObj = {};
			tempObj["reqId"] = data.reqId;
			tempObj["id"] = value.id;
			self.getCompleteModelById(tempObj, function(err, status, modelTree){
				if(err){
					logger.error(err);
					next(err);
					return cb(err);
				}
				self.updateTreeChildNodes(modelTree.modelDetail, dsMap);
				modelTree.user = {};
				baseConverter(modelTree, data);
				self.saveCompleteModelWithoutUpdatingFurtherModels(modelTree, function(err, status, rs){
					if(err){
						logger.error(err);
						next(err);
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					next(err, rs);
				});
//				self.saveCompleteModelWithoutUpdatingFurtherModels()

			});
		}, function(err, rs){
			if(err){
				logger.error(err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			return cb(err, codes.SUCCESS, data);
		})
	});
	
};

ModelService.prototype.updateTreeChildNodes = function (modelTree, newModelMap) {
	
	var self = this;
	var children = modelTree.children;
	
	if(children){
		children.forEach(function(value, index){
			self.updateTreeChildNodes(value, newModelMap);
		});
		if(modelTree.level != 0){
			var newNode = newModelMap[modelTree.id];
			modelTree.user = {};
			if(newNode){
				baseConverter(modelTree, newNode);
				modelTree.children = newNode.children;
			}			
		}
	}
	
	return modelTree;
};

module.exports = ModelService;
