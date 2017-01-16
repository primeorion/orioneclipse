"use strict";

var config = require('config');

var utilDao = require('dao/util/UtilDao.js');
var baseConverter = require('converter/base/BaseConverter.js');

var ModelModel = require("model/model/CompleteModel.js"); 
var ModelEntity = require("entity/model/Model.js");
var ModelDetail = require("entity/model/ModelDetail.js");
var ModelElementEntity = require("entity/model/ModelElement.js");
var ModelNode = require("model/model/Node.js");
var utilService = new (require('service/util/UtilService'))();
var ModelConverter = function(){

}

ModelConverter.prototype.getCompleteModelModelFromModelRequest = function(data){
	
	var self = this;
	var model = new ModelModel();

	baseConverter(model, data);

	model.reqId = data.reqId;
	
	model.id = data.id;
	model.name = data.name;
	model.status = data.status ?  data.status : model.status;
	model.communityModelledId = data.communityModelledId;
	model.description = data.description;
	model.ownerUserId = data.ownerUserId;
	model.scope = data.scope;
	model.dynamicModel = data.dynamicModel;
	model.isDeleted = data.isDeleted;
	model.isSubsitutedForPortfolio = data.isSubsitutedForPortfolio;

	var bulkRecords = [];
	var baseNode = self.getNodeModelFromModelRequest(data.modelDetail, 0, {value : 1}, model, bulkRecords);
	
	// model properties set to root node
//	baseNode.id = model.id;
	baseNode.name = model.name;
	
	bulkRecords.push(baseNode);
	model.modelStructureArray = bulkRecords;
	model.modelStructureTree = baseNode;
	
	return model;
};

ModelConverter.prototype.getNodeModelFromModelRequest = function(data, level, left, base, bulkRecords){
	var self = this;
	
	var node = new ModelNode();
	baseConverter(node, base);
	
	node.modelId = base.id;
	node.id = data.id;
	node.name = data.name;
	node.targetPercent = data.targetPercent;
	node.lowerModelTolerancePercent = data.lowerModelTolerancePercent;
	node.upperModelTolerancePercent = data.upperModelTolerancePercent;
	node.toleranceBand = data.toleranceBand;
	node.lowerModelToleranceAmount = data.lowerModelToleranceAmount;
	node.upperModelToleranceAmount = data.upperModelToleranceAmount;
	
	node.lowerTradeTolerancePercent = data.lowerTradeTolerancePercent;
	node.upperTradeTolerancePercent = data.upperTradeTolerancePercent;
	
	node.relatedType = data.relatedType;
	node.relatedTypeId = data.relatedTypeId;
	node.validateTickerSet = data.validateTickerSet;
	node.rebalancePriority = data.rebalancePriority;
	node.tags = data.tags;
	node.level = level;
//	node.leftValue = level;
//	node.rightValue = level;
//	
	node.leftValue = left.value;
	if(data.children){
		level++;
		if(data.children.length == 0){
//			node.leftValue = left;
		}else{
			data.children.forEach(function(value){
				left.value += 1;
				var record = self.getNodeModelFromModelRequest(value, level, left, base, bulkRecords);
				node.children.push(record);
				bulkRecords.push(record);
			});
		}
	}
	left.value += 1;
	node.rightValue = left.value;
	return node;
}

ModelConverter.prototype.getModelEntityFromModelModel = function(data){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var model = new ModelEntity();

	model.reqId = data.reqId;
	
	model.id = data.id;
	model.name = data.name;
	model.status = data.status ? data.status : model.status;
	model.communityModelled = data.communityModelled;
	model.description = data.description;
	model.ownerUserId = data.user.userId;
	model.scope = data.scope;
	model.dynamicModel = data.dynamicModel ? data.dynamicModel : model.dynamicModel;
	model.isDeleted = data.isDeleted ? data.isDeleted : 0;
	model.isSubsitutedForPortfolio = data.isSubsitutedForPortfolio ? data.isSubsitutedForPortfolio : model.isSubsitutedForPortfolio;
	
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

	model.push(data.modelId);
	model.push(data.id);
	model.push(data.leftValue);
	model.push(data.rightValue);
	model.push(0);
	model.push(data.level);
	model.push(0);
	
	model.push(data.targetPercent);
	model.push(data.toleranceBand);
	model.push(data.lowerModelTolerancePercent);
	model.push(data.upperModelTolerancePercent);
	model.push(data.lowerTradeTolerancePercent);
	model.push(data.upperTradeTolerancePercent);
	
	model.push(data.lowerModelToleranceAmount);
	model.push(data.upperModelToleranceAmount);
	
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
module.exports = new ModelConverter();