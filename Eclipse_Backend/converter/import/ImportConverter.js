"use strict";

var config = require('config');
var _ = require("lodash");
var utilDao = require('dao/util/UtilDao.js');
var baseConverter = require('converter/base/BaseConverter.js');

var ModelModel = require("model/model/CompleteModel.js"); 
var ModelEntity = require("entity/model/Model.js");
var ModelDetail = require("entity/model/ModelDetail.js");
var ModelElementEntity = require("entity/model/ModelElement.js");
var ModelNode = require("model/model/Node.js");
var utilService = new (require('service/util/UtilService'))();

var PreferenceService = require("service/preference/PreferenceService.js");
var modelUtil = require("service/model/ModelUtilService.js");
var jsonPatch = require("jsonpatch");

var prefService = new PreferenceService();

var modelStatus = config.applicationEnum.modelStatus;
var roleTypeWhoCanChangeModelStatus = config.applicationEnum.roleTypeWhoCanModelChangeStatus;

var applicationEnum = config.applicationEnum;

var messages = config.messages;
var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var reverseRelatedTypeCodeToId = applicationEnum.reverseRelatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var reverseRelatedTypeCodeToDisplayName = applicationEnum.reverseRelatedTypeCodeToDisplayName;
var modelValidations = applicationEnum.modelValidations;
var modelTypeHierachy = modelValidations.modelTypeHierachy;
var modelValidationMessages = messages.modelValidations;
var ModelConverter = function(){

}

ModelConverter.prototype.getImportLogEntity = function(data){
	
	var entity = {};
	entity.reqId = data.reqId;
	
	entity.session = data.session;
	entity.columnName = data.columnName;
	entity.status = data.status;
	entity.userId = data.userId;
	entity.type = data.type;
	entity.reason = data.reason;
	
	return entity;
};

ModelConverter.prototype.getTeamsForModelEntityListToModel = function(entityList, commonTeams){
	var modelList = [];
	var map = {};
	entityList.forEach(function(entity){
		var team = {};
		
		team.id = entity.teamId;
		team.name = entity.teamName;

		modelList.push(team);
		
	});
	return _.concat(modelList, commonTeams);
};

ModelConverter.prototype.getSubModelListFromModelElementEntityList = function(entityList, commonTeams){
	
	var self = this;
	var modelList = [];
	var map = {};
	entityList.forEach(function(entity){
		var model = self.getSubModelModelFromModelElementEntity(entity);;
		modelList.push(model);
	});

	return modelList;
};

ModelConverter.prototype.getCompleteModelModelFromModelRequest = function(data, cb){
	
	var self = this;
	
	var model = self.getGeneralModelModelFromModelRequest(data);
	
	var bulkRecords = [];
	var bulkRecords2 = [];
	/*
	 * Initialization
	*/model.statusId = modelStatus["NOT_APPROVED"];
	  if(model.modelDetail){
		  model.modelDetail.modelTypeId = 0;
	  }
	  
	var modelTypeArrays = {
			1 : [],
			2 : [],
			3 : [],
			4 : [],
	};
	
	var modelTypeByLevel = {
			"1" : null,
			"2" : null,
			"3" : null,
			"4" : null,
	};

	model.modelTypeByLevel = modelTypeByLevel;
	model.modelTypeArrays = modelTypeArrays;
	model.securitySetAssetClassArray = [];
	model.substitutedModelId = data.substitutedModelId;
	model.portfolioId = data.substitutedFor;
	
	if(data.modelDetail){
		data.modelDetail.targetPercent = 100;
	}
	
	var baseNode = self.getNodeModelFromModelRequest(data.modelDetail, 0, {value : 1}, model, bulkRecords, bulkRecords2, cb);
	
	// model properties set to root node
//	baseNode.id = model.id;
	if(baseNode){		
		baseNode.name = data.modelDetail.name;
		bulkRecords.push(baseNode);
		model.modelStructureArray = bulkRecords;
		model.modelStructureArrayOfRequest = bulkRecords2;
		model.modelStructureTree = baseNode;
	}
	return model;
};

ModelConverter.prototype.getGeneralModelModelFromModelRequest = function(data){
	
	var self = this;
	
	var canChangeStatus = false;
	
	var model = new ModelModel();

	baseConverter(model, data);
	
	model.reqId = data.reqId;
	
	model.id = data.id;
	model.name = data.name;
		
//	model.namespace = self.getNamespaceTeam(model);
	model.namespace = data.nameSpace;
	
	model.statusId = data.statusId ?  data.statusId : model.status;
	model.managementStyleId = data.managementStyleId;
	model.managementStyleName = data.managementStyleName;
	model.communityModelId = data.communityModelId;
	model.isCommunityModel = data.isCommunityModel;
	model.description = data.description;
	model.ownerUserId = data.ownerUserId;
	model.scope = data.scope;
	model.isDynamic = data.isDynamic;
	model.isDeleted = data.isDeleted;
	model.isSubstitutedForPortfolio = data.isSubstitutedForPortfolio || 0;
	model.tags = data.tags;
	model.tempModel = data.tempModel;
	model.fromTempModel = data.fromTempModel;
	model.copyModel = data.copyModel;
	return model;
};

ModelConverter.prototype.getGeneralModelModelFromModelRequestByPatch = function(data, model){
	
	var self = this;

	baseConverter(model, data);
	
	model.reqId = data.reqId;
	
	model.id = data.id;
	
	return model;
};

ModelConverter.prototype.assignModelToTeamModelFromModelModel = function(data){
	
	var self = this;
	
	var model = new ModelModel();

	baseConverter(model, data);
	
	model.reqId = data.reqId;
	var modelIds = [];
	modelIds.push(data.id);
	model.modelIds = modelIds;
	model.id = data.teamId;
	
	return model;
};

/*
	When node is isEdited we use it 
					a. node itself
					b. parent node
	
	In substitute Case
					a. node Iteself
					b. parent node act as point of substitution
*/ModelConverter.prototype.getNodeModelFromModelRequest = function(data, level, left, base, bulkRecords, bulkRecords2, cb){
	var self = this;
	
	if(!data)
		return ;
	
	var possibleModelTypes = null;
	if(data.modelTypeId){		
		possibleModelTypes = modelTypeHierachy[data.modelTypeId];
	}else{
		possibleModelTypes = modelTypeHierachy[0];
	}

//	if(!self.nodeModelTypeAtLevelCheck(data.modelTypeId, level, base.modelTypeByLevel)){
//		return cb(modelValidationMessages.nodeAtLevelMustBeSame + level);
//	}
	
	/*
	 * preparing data for existence check;
	*/var modelTypeArrays = base.modelTypeArrays;
	var modelTypeArray = modelTypeArrays[data.modelTypeId];
	var securityAsset = data.securityAsset;
	if(modelTypeArray){
		if(securityAsset){			
			modelTypeArray.push(securityAsset.id);
		}
	};
	if(data.modelTypeId == relatedTypeCodeToId["SECURITYSET"]){	
		//TODO need to change to add securiyt set id also
		if(securityAsset){			
			var obj = {
					securitySetId : securityAsset.id,
					parentModelType : data.parentModelType
			}
			base.securitySetAssetClassArray.push(obj);
		}
	}
	
	var node = self.getModelElementModelFromModelRequest(data, base);
	node.modelId = base.id;
	node.level = level;
	
	node.isEdited = data.isEdited;
	node.isSubstituted = data.isSubstituted;
	node.substituteOf = data.substituteOf;
	
//	node.leftValue = level;
//	node.rightValue = level;
//	
	bulkRecords2.push(data);
	node.leftValue = left.value;
	if(data.children){
		level++;
		if(data.children.length == 0){
//			node.leftValue = left;
			self.checkForDraftAndAddModelStatus(!self.lastNodeSecuritySetFilter(data), data, base);
		}else{
			var targetPercentSum = 0;
			
			//Only For check targetPercent.
			var msgToReturn = null;
			for(var i = 0; i < data.children.length; i++){
				var value = data.children[i];
				if(value.targetPercent && utilService.isNegativePercent(value.targetPercent)){
					msgToReturn = modelValidationMessages.percentCannotBeNegative;
				}
				targetPercentSum += value.targetPercent ? value.targetPercent : 0;
			}
			if(msgToReturn){
				return cb(msgToReturn);
			}
			if(targetPercentSum != 100){
				msgToReturn = modelValidationMessages.targetPercentSumOfChildrenIsNot100;
				if(node.id){
					msgToReturn += " of submodels: " + node.id
				}
				if(base.id){						
					msgToReturn += " in model " + base.id;
				}
				return cb(msgToReturn);
			}
			
			for(var i = 0; i < data.children.length; i++){
				
				var value = data.children[i];
				
				/*
				 * Validations should be first
				 * 
				*/
				
				if(!self.childModelTypeCheckWithPossibleModelTypes(value, possibleModelTypes)){
					var message = "";
					if(value.id){
						message += value.id;
					}else{
						message += " '"+ value.name +"' ";
					}
					message += modelValidationMessages.modelTypeHierarchy + possibleModelTypes;
					cb(message);
					return;
				}
				
				var parentModelType = null;
				if(data.parentModelType){
					parentModelType = data.parentModelType;	
				}else{
					parentModelType = {};
				}
				
				value.parentModelType = {};
				_.assign(value.parentModelType, parentModelType);
				var securityAsset = value.securityAsset;
				
				if(securityAsset){					
					value.parentModelType[value.modelTypeId] = securityAsset.id;
				}
				
				/*
				 * whenever there is isEdited on node we do it on parent node too.
				*/if(value.isEdited){
					node.isEdited = 1;
				  }
				
				if(value.isSubstituted){
					node.childSubstituted = 1;
					base.isSubstitutedForPortfolio = 1;
			    }
				
				
				left.value += 1;
				var record = self.getNodeModelFromModelRequest(value, level, left, base, bulkRecords, bulkRecords2, cb);
				
				node.children.push(record);
				
				if(base.fromTempModel){
					record.isEdited = 1;
				}
				
				bulkRecords.push(record);
			}
		}
	}else{
		self.checkForDraftAndAddModelStatus(!self.lastNodeSecuritySetFilter(data), data, base);
	}
	left.value += 1;
	node.rightValue = left.value;
	return node;
}

ModelConverter.prototype.childModelTypeCheckWithPossibleModelTypes = function(node, possibleModelTypes){
	
	return possibleModelTypes.some(function(value){
		return node.modelTypeId == value
	});
	
}

ModelConverter.prototype.nodeModelTypeAtLevelCheck = function(nodeModelType, level, modelTypeLevels){
	
	var modelTypeOfNodeAtLevel = modelTypeLevels[level]; 
	if(modelTypeOfNodeAtLevel){
		if(nodeModelType == modelTypeOfNodeAtLevel){
			return true;
		}else
			return false;
	}else{
		modelTypeLevels[level] = nodeModelType;
		return true;
	}
	
}


ModelConverter.prototype.getModelStatusAccordingToPreference = function(model, cb){
	
	var preferencesFetchCriteria = {
			levelName: "MODEL",
			recordId: model.id,
			levelBitValue: null
	};
//	prefService.listPreferencesByLevel(preferencesFetchCriteria, function(err, status, rs){
		cb(null, modelStatus.NOT_APPROVED);
//	});
}

/*
 * This is called when saving model structure.
*/
ModelConverter.prototype.checkForDraftAndAddModelStatus = function(status, node, baseNode){
	if(baseNode.statusId == modelStatus.DRAFT){
		return;
	}
	
	if(status){
		baseNode.statusId = modelStatus.DRAFT;
	}else{
		baseNode.statusId = modelStatus.NOT_APPROVED;
	}
}


ModelConverter.prototype.getNamespaceTeam = function(node){
	var primaryTeam = utilService.getPrimaryTeamForUser(node.user);
	if(primaryTeam == undefined || primaryTeam == null){
		primaryTeam = utilService.getFirstTeamForUser(node.user);
	}
	
	return primaryTeam;
}

ModelConverter.prototype.lastNodeSecuritySetFilter = function(node){
	if(reverseRelatedTypeCodeToId[node.modelTypeId] === "SECURITYSET"){
		return true;
	}else{
		return false;
	}
}

ModelConverter.prototype.checkStatusChange = function(newNode, oldNode){
	if(newNode.statusId = oldNode.statusId){
		return true;
	}else{
		return false;
	}
}

ModelConverter.prototype.getModelEntityFromModelModel = function(data){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var model = new ModelEntity();

	model.reqId = data.reqId;
	
	model.id = data.id;
	model.name = data.name;
	model.statusId = data.statusId ? data.statusId : model.statusId;
	model.managementStyleId = data.managementStyleId;
	model.isCommunityModel = data.isCommunityModel;
	model.communityModelId = data.communityModelId;
	model.namespace = data.namespace;
	model.description = data.description;
	
	model.ownerUserId = data.strategistId ? data.strategistId : utilService.getAuditUserId(data.user);
	model.scope = data.scope;
	model.dynamicModel = data.isDynamic ? data.isDynamic : model.dynamicModel;
	model.tags = data.tags;
	model.approvedBy = data.approvedByUserId;
	model.isDeleted = data.isDeleted ? data.isDeleted : 0;
	model.isSubstitutedForPortfolio = data.isSubstitutedForPortfolio ? data.isSubstitutedForPortfolio : model.isSubstitutedForPortfolio;
	model.substituteOfModelId = data.substituteOfModelId;
	model.createdBy = utilService.getAuditUserId(data.user);
	model.editedBy = utilService.getAuditUserId(data.user);
	model.createdDate = dateTime;
	model.editedDate = dateTime;
	
	return model;
};

ModelConverter.prototype.getModelDetailEntityFromModelDetailModel = function(data){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var model = new ModelDetail();
	var model = [];
	
//	model.reqId = data.reqId;
//	
//	model.modelId = data.modelId;
//	model.modelElementId = data.id;
//	
//	model.leftValue = data.leftValue;
//	model.rightValue = data.rightValue;
//	model.level = data.level;

	model.push(data.modelDetailId);
	model.push(data.modelId);
	model.push(data.id);
	model.push(data.leftValue);
	model.push(data.rightValue);
	model.push(data.level);
	model.push(0);
	
	model.push(data.targetPercent);
	model.push(data.rank);
	model.push(data.toleranceType);
	model.push(data.toleranceTypeValue);
	model.push(data.lowerModelTolerancePercent);
	model.push(data.upperModelTolerancePercent);
	model.push(data.lowerModelToleranceAmount);
	model.push(data.upperModelToleranceAmount);
	model.push(data.lowerTradeTolerancePercent);
	model.push(data.upperTradeTolerancePercent);
	model.push(data.isSubstituted);
	model.push(data.substituteOf);
	model.push(dateTime);
	model.push(utilService.getAuditUserId(data.user));
	model.push(dateTime);
	model.push(utilService.getAuditUserId(data.user));
	return model;
};

ModelConverter.prototype.getModelDetailEntityObjFromModelModel = function(data){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var model = new ModelDetail();
//	var model = [];
	
	model.reqId = data.reqId;
	
	model.modelId = data.id;
	
	model.createdBy = utilService.getAuditUserId(data.user);
	model.editedBy = utilService.getAuditUserId(data.user);
	model.createdDate = dateTime;
	model.editedDate = dateTime;
	
//	model.modelElementId = data.id;
	
	return model;
};


ModelConverter.prototype.getModelDetailEntityListFromModelDetailModelList = function(data){

	var dateTime = utilDao.getSystemDateTime(null);
	var self = this;
	
	var tempObj = {};
	var idsNotToRemove = [];
	var entityList = [];

	data["idsNotToRemove"] = idsNotToRemove;
	
	tempObj["list"] = entityList;
	
	var modelStructureArray = data.modelStructureArray;
	
	modelStructureArray.forEach(function(modelElement){
		/*
		 * assgins newly created model id
		modelDetail.modelId = data.id;
		
//		if(modelDetail.level == 0){			
//			modelDetail.id = data.id;
//		}*/

		idsNotToRemove.push(modelElement.id);
		
		entityList.push(self.getModelDetailEntityFromModelDetailModel(modelElement));
	})
	
	return tempObj;

};

ModelConverter.prototype.getModelDetailAFterInsertionFromModelDetailModelList = function(data){
	var self = this;
	
	var modelStructureArray = data.modelStructureArray;
	
	var mapFromModelTree = {};
	modelStructureArray.forEach(function(modelDetail){
		modelDetail.modelId = data.id;
		mapFromModelTree[modelDetail.id] = modelDetail;
	});
	
	data.modelStructureMap = mapFromModelTree;
	return data;
}

ModelConverter.prototype.getModelElementEntity = function(data){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var modelElementEntity = new ModelElementEntity();

	modelElementEntity.reqId = data.reqId;
	
	modelElementEntity.id = data.id;
	modelElementEntity.name = data.name;
	modelElementEntity.namespace = data.namespace;
	modelElementEntity.relatedType = data.relatedType;
	modelElementEntity.relatedTypeId = data.relatedTypeId;
	modelElementEntity.isFavorite = data.isFavorite;
	modelElementEntity.isDeleted = data.isDeleted ? data.isDeleted : 0;
	modelElementEntity.createdBy = utilService.getAuditUserId(data.user);
	modelElementEntity.editedBy = utilService.getAuditUserId(data.user);
	modelElementEntity.createdDate = dateTime;
	modelElementEntity.editedDate = dateTime;
	
	return modelElementEntity;
};

ModelConverter.prototype.responseToRequest = function(response, request){
	baseConverter(response, request);
}

ModelConverter.prototype.modelArrayToModelTree = function(data){
	
}

ModelConverter.prototype.getModelElementModelFromModelRequest = function(data, base){	
	
	var node = new ModelNode();
	
	if(base){
		baseConverter(node, base);		
	}else{
		baseConverter(node, data);
	}
	
	node.modelDetailId = data.modelDetailId;
	if(base && base.copyModel){
		node.modelDetailId = null;
	}
	node.id = data.id;
	node.name = data.name;
	node.namespace = data.nameSpace;
	node.relatedType = reverseRelatedTypeCodeToId[data.modelTypeId];
	var securityAsset = data.securityAsset;
	
	if(securityAsset){		
		node.relatedTypeId = data.securityAsset.id;
		node.securityAsset = securityAsset;
	}
	
	node.isFavorite = data.isFavorite;

	node.targetPercent = data.targetPercent;
	node.lowerModelTolerancePercent = data.lowerModelTolerancePercent;
	node.upperModelTolerancePercent = data.upperModelTolerancePercent;
	node.rank = data.rank;
	node.toleranceType = data.toleranceType;
	node.toleranceTypeValue = data.toleranceTypeValue;
	node.lowerModelToleranceAmount = data.lowerModelToleranceAmount;
	node.upperModelToleranceAmount = data.upperModelToleranceAmount;
	
	node.lowerTradeTolerancePercent = data.lowerTradeTolerancePercent;
	node.upperTradeTolerancePercent = data.upperTradeTolerancePercent;
	node.validateTickerSet = data.validateTickerSet;
	node.rebalancePriority = data.rebalancePriority;
	
	node.tags = data.tags;
	
	node.modelTypeId = data.modelTypeId;
	
	return node;
}

ModelConverter.prototype.getRelatedTypeModelFromModelModel = function(data){	
	
	var node = new ModelNode();
	
	baseConverter(node, data);
	
	node.id = data.relatedTypeId;
	node.relatedType = data.relatedType;
	
	return node;
	
}

ModelConverter.prototype.getSubModelModelFromModelElementEntity = function(entity){
	var nJson = {};
	var securityAsset = {};
	var typeId = relatedTypeCodeToId[entity.relatedType];
	var typeDisplayName = relatedTypeCodeToDisplayName[entity.relatedType];
	var securityAssetId = entity.relatedTypeId;
	var securityAssetName = entity.assetCategoryName || entity.assetClassName || entity.assetSubClassName || entity.securitySetName;
	var securityAssetColor = entity.assetCategoryColor || entity.assetClassColor || entity.assetSubClassColor;
	var isFavorite = entity.isFavorite;
	
	nJson.id = entity.meId;
	nJson.name = entity.meName;
	nJson.modelType = typeDisplayName ? typeDisplayName : null;
	nJson.modelTypeId = typeId ? typeId : null;
	nJson.isFavorite = isFavorite;
	nJson.nameSpace = entity.meNamespace;
	nJson.securityAsset = null;
	
	if(securityAssetId){		
		nJson.securityAsset = securityAsset;
	}
	
	nJson.leftValue = entity.leftValue;
	nJson.rightValue = entity.rightValue;
	securityAsset.id = securityAssetId;
	securityAsset.name = securityAssetName;
	securityAsset.color = securityAssetColor;
	
	return nJson;

}

ModelConverter.prototype.otherPropertiesForModelElementsFromEntityToModel = function(value, node){
	
	node.modelDetailId = value.modelDetailId;
	node.targetPercent = value.targetPercent;
	node.lowerModelTolerancePercent = value.lowerModelTolerancePercent;
	node.upperModelTolerancePercent = value.upperModelTolerancePercent;
	node.lowerModelToleranceAmount = value.lowerModelToleranceAmount;
	node.upperModelToleranceAmount = value.upperModelToleranceAmount;
	node.lowerTradeTolerancePercent = value.lowerTradeTolerancePercent;
	node.upperTradeTolerancePercent = value.upperTradeTolerancePercent;
	node.rank = value.rank;
	node.toleranceType = value.toleranceType;
	node.toleranceTypeValue = value.toleranceTypeValue;
	node.isSubstituted = value.isSubstituted;
	node.substituteOf = value.substituteOf;
	
	return node ;

}

ModelConverter.prototype.modelSecuritiesResponseToDynamicModelSecuritiesQuantitiesEntityList = function(data){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var json = {};
	var rList = [];
	
	var modelId = data.id;
	
	data.list.forEach(function(value){		
		var rowList = [];
		rowList.push(modelId);
		rowList.push(value.modelElementId);
		rowList.push(value.id);
		rowList.push(value.quantity);
		rowList.push(value.isDeleted);
		rowList.push(dateTime);
		rowList.push(utilService.getAuditUserId(data.user));
		rowList.push(dateTime);
		rowList.push(utilService.getAuditUserId(data.user));
		rList.push(rowList);
	})
	
	json.reqId = data.reqId;
	json.list = rList;
	
	return json;
}


ModelConverter.prototype.modelSecuritiesResponseToDynamicModelSecuritiesQuantitiesEntity = function(data){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var json = {};

	json.id = data.id;
	json.reqId = data.reqId;
	
	json.editedDate = dateTime;
	json.editedBy = utilService.getAuditUserId(data.user);
	
	
	return json;
}

ModelConverter.prototype.generalModelModelFromModelEntity = function(value, model){
	
	model.id = value.id;
	model.name = value.name;
	model.description = value.description;
	model.nameSpace = value.namespace;
	model.statusId = value.statusId;
	model.status = value.status;
	model.currentStatusId = value.currentStatusId;
	model.currentStatus = value.currentStatus;
	model.tags = value.tags;
	model.ownerUserId = value.ownerUserId;
	model.ownerUser = value.ownerUser;
	model.managementStyleId = value.managementStyleId;
	model.managementStyle = value.managementStyle;
	model.isCommunityModel = value.isCommunityModel;
	model.communityModelId = value.communityModelId;
	model.lastSyncDate = value.lastSyncDate;
	model.approvedByUserId = value.approvedByUserId;
	model.approvedByUser = value.approvedByUser;
	model.isDynamic = value.dynamicModel;
	model.isDeleted = value.isDeleted;
	model.createdOn = value.createdDate;
	model.editedOn = value.editedDate;
	model.createdBy = value.createdBy;
	model.editedBy = value.editedBy;
	
	return model ;

}

ModelConverter.prototype.getModelManagementEntity = function(value){
	
	var model = {};
	model.reqId = value.reqId;
	model.id = value.managementStyleId;
	model.name = value.managementStyleName;
	
	return model ;

}


module.exports = new ModelConverter();