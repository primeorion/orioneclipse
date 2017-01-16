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

var prefService = new PreferenceService();

var modelStatus = config.applicationEnum.modelStatus;
var roleTypeWhoCanChangeModelStatus = config.applicationEnum.roleTypeWhoCanModelChangeStatus;

var applicationEnum = config.applicationEnum;

var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var reverseRelatedTypeCodeToId = applicationEnum.reverseRelatedTypeCodeToId;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var reverseRelatedTypeCodeToDisplayName = applicationEnum.reverseRelatedTypeCodeToDisplayName;

var ModelConverter = function(){

}

ModelConverter.prototype.getPortfolioEntityFromModelModel = function(model){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var node = {};
	
	node.reqId = model.reqId;
	node.modelId = model.modelId;
	node.id = model.portfolioId;
	node.substitutedModelId = model.substitutedModelId;
	node.editedBy = utilService.getAuditUserId(model.user);
	node.editedDate = dateTime;
	
	return node;
	
};

ModelConverter.prototype.getSleevedAccountEntityFromModelModel = function(model){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var node = {};
	
	node.reqId = model.reqId;
	node.modelId = model.modelId;
	node.id = model.sleevedAccountId;
	node.substitutedModelId = model.substitutedModelId;
	node.editedBy = utilService.getAuditUserId(model.user);
	node.editedDate = dateTime;
	
	return node;
	
};

ModelConverter.prototype.getTempPortfolioEntityFromModelModel = function(model, commonTeams){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var node = {};
	
	node.reqId = model.reqId;
	node.modelId = model.modelId;
	node.portfolioId = model.portfolioId;
	node.substitutedModelId = model.substitutedModelId;
	node.isDeleted = 0;
	node.createdBy = utilService.getAuditUserId(model.user);
	node.createdDate = dateTime;
	
	return node;
	
};

ModelConverter.prototype.getPreferenceForPortfolio = function(model, commonTeams){
	
	var node = {};

	node.reqId = model.reqId;
	node.id = model.modelId;
	
	return node;
	
};

ModelConverter.prototype.getModelPortfolioFromModelRequest = function(data, sec2){
	
	var self = this;

	
	var model = new ModelModel();
	
	if(sec2){		
		baseConverter(model, sec2);
		model.reqId = sec2.reqId;
	}else{
		baseConverter(model, data);
		model.reqId = data.reqId;
	}
	
	model.portfolioId = data.id;
	model.substitutedModelId = data.substitutedModelId;
	
	return model;
};

ModelConverter.prototype.getModelSleeveFromModelRequest = function(data, sec2){
	
	var self = this;

	
	var model = new ModelModel();
	
	if(sec2){		
		baseConverter(model, sec2);
		model.reqId = sec2.reqId;
	}else{
		baseConverter(model, data);
		model.reqId = data.reqId;
	}
	model.sleevedAccountId = data.id;
	model.substitutedModelId = data.substitutedModelId;
	
	return model;
};

ModelConverter.prototype.getModelPortfolioListFromModelRequest = function(data){
	
	var self = this;
	
	var model = new ModelModel();

	baseConverter(model, data);
	model.reqId = data.reqId;
	var status = data.actionStatus;
	model.actionStatus = status;
	model[status] =   [];
	var portfolioIds = data.portfolioIds;
	if(portfolioIds){		
		portfolioIds.forEach(function(value){
			var tmpObj = {};
			tmpObj["id"] = value;
			model[status].push(self.getModelPortfolioFromModelRequest(tmpObj, data));
		})
	}
	
	return model;
};

ModelConverter.prototype.getModelPortfolioPendingListFromModelPortfolioEntityList = function(data){
	
	var self = this;
	
	var rTurn = [];
	data.forEach(function(val){
		var nJson = {};
		nJson.newModel = {
				id : val.newModelId,
				name : val.newModelName,
		}
		nJson.oldModel = {
				id : val.oldModelId,
				name : val.oldModelName
		}
		nJson.portfolio = {
				id : val.portfolioId,
				name : val.portfolioName
		}
		nJson.requesterUserId = val.requesterUserId;
		nJson.requesterUser = val.requesterUser;
		nJson.createdOn = val.createdOn;
		rTurn.push(nJson);
	})
	return rTurn;
};

module.exports = new ModelConverter();