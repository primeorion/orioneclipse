"use strict";

var config = require('config');

var utilDao = require('dao/util/UtilDao.js');
var baseConverter = require('converter/base/BaseConverter.js');

var SecurityListRequestModel = require('model/security/SecurityListRequest.js');
var SecurityRequest = require("model/security/SecurityRequest.js");
var SecurityDetailResponse = require("model/security/SecurityDetailResponse.js");
var OrionSecurityResponseModel = require("model/security/OrionSecurityResponseModel.js");
var CategoryRequest = require('model/security/CategoryRequest.js');
var ClassRequest = require('model/security/ClassRequest.js');
var SubClassRequest = require('model/security/SubClassRequest.js');
var CustodianSecuritySymbol = require("model/custodian/CustodianSecuritySymbol.js");
var CustodianSecuritySymbolDetailResponse = require('model/custodian/CustodianSecuritySymbolDetailResponse.js');
var SecurityPriceEntity = require("entity/security/SecurityPrice.js");
var SecurityEntity = require("entity/security/Security.js");
var SecurityTypeModel = require("model/security/SecurityType.js");
var SecurityType = require("entity/security/SecurityType.js");
var utilService = new (require('service/util/UtilService'))();
var CorporateActionTypeEntity = require("entity/security/CorporateActionType.js");
var SecurityCorporateActionEntity = require("entity/security/SecurityCorporateAction.js");

var applicationEnum = config.applicationEnum;
var relatedTypeEnum = applicationEnum.relatedType;
var securityStatus = applicationEnum.securityStatus;

var reverseSecurityStatus = {};

var SecurityConverter = function(){
	
	for(var key in securityStatus){
		if (securityStatus.hasOwnProperty(key)) {
			reverseSecurityStatus[securityStatus[key]] = key;
		}
	}
}

SecurityConverter.prototype.getCorporateActionForSecurityFromEntityToModel = function(data){
	var model = {};

	model.id = data.id;
	model.name = data.name;
	
	
	return model;
};

SecurityConverter.prototype.getSecurityRequestToModel = function(data){
	var model = new SecurityListRequestModel();

	baseConverter(model, data);

	model.id = data.id;
	model.search = data.search;
	model.count = data.top;
	model.assetClassId = data.assetClassId;
	model.assetCategoryId = data.assetCategoryId;
	model.assetSubClassId = data.assetSubClassId;
	
	return model;
};

SecurityConverter.prototype.getSecurityToRequestFromOrion = function(data){
	
	var ui = {	};

	ui.orionConnectExternalId = data.productId;
	ui.name = data.productName;
	ui.symbol = data.ticker;
	ui.securityTypeId = data.productType;
	
	return ui;
};

SecurityConverter.prototype.getOrionSecurityResponseModelFromOrionSecurityResponse = function(data, model){
	
	var security = new OrionSecurityResponseModel();
	
	baseConverter(security, model);
	
	security.id = data.id;
	security.productName = data.productName;
	security.ticker = data.ticker;
	security.productType = data.productType;
	security.currentOrionPrice = data.currentOrionPrice
	security.currentOrionPriceDate = data.currentOrionPriceDate 
	security.isCustodialCash = data.isCustodialCash;
	security.productCategoryAbbreviation = data.productCategoryAbbreviation;
	security.assetClassDescription = data.assetClassDescription; 	
	security.riskCategoryName = data.riskCategoryName;
	
	return security;
};

SecurityConverter.prototype.getSecurityModelFromOrionSecurityResponseModel = function(data){
	
	var security = new SecurityRequest();
	
	baseConverter(security, data);
	security.orionConnectExternalId = data.id;
	security.name = data.productName;
	security.symbol = data.ticker;
	security.price = data.currentOrionPrice;
	security.priceDateTime = data.currentOrionPriceDate;
	security.custodialCash = data.isCustodialCash;
	
	return security;
};

SecurityConverter.prototype.getCategoryModelFromOrionSecurityResponseModel = function(data){
	
	var category = new CategoryRequest();
	
	baseConverter(category, data);
	category.name = data.productCategoryAbbreviation;
	category.isImported = 1;
	
	return category;
};

SecurityConverter.prototype.getClassModelFromOrionSecurityResponseModel = function(data){
	
	var classModel = new ClassRequest();
	
	baseConverter(classModel, data);
	classModel.name = data.assetClassDescription;
	classModel.isImported = 1;
	
	return classModel;

};
SecurityConverter.prototype.getSubClassModelFromOrionSecurityResponseModel = function(data){
	
	var classModel = new SubClassRequest();
	
	baseConverter(classModel, data);
	classModel.name = data.riskCategoryName;
	classModel.isImported = 1;
	
	return classModel;
};

SecurityConverter.prototype.getSecurityTypeModelFromOrionSecurityResponseModel = function(data){
	
	var securityType = new SecurityTypeModel();
	
	baseConverter(securityType, data);
	
	securityType.name = data.productType;
	
	return securityType;

};

SecurityConverter.prototype.getSecurityToResponseListFromOrionList = function(data){
	var self = this;
	var uiList = [];
	if(data){
		data.forEach(function(value){
			uiList.push(self.getSecurityToRequestFromOrion(value));
		});
	}
	
	return uiList;
};

SecurityConverter.prototype.createOrUpdateSecurityRequestToModel = function(data){
	var security = new SecurityRequest();

	
	baseConverter(security, data);

	security.id = data.id;
	security.orionConnectExternalId = data.orionConnectExternalId;
	security.name = data.name;
	security.symbol = data.symbol;
	security.code = data.code;
	security.status = data.status;
	security.statusId = data.status ? securityStatus[data.status] : securityStatus.OPEN;
	security.price = data.price;
	security.custodialCash = data.custodialCash;
	
	security.assetCategoryId = data.assetCategoryId;
	security.assetClassId = data.assetClassId;
	security.assetSubClassId = data.assetSubClassId;
	security.securityTypeId = data.securityTypeId;
	
	var custodians = security.custodians;
	
	if(data.custodians){
		data.custodians.forEach(function(value, index){
			var custodianSymbol = new CustodianSecuritySymbol();
			
			baseConverter(custodianSymbol, data);
			
			custodianSymbol.securityId = data.id;
			custodianSymbol.custodianId = value.id;
			custodianSymbol.securitySymbol = value.custodianSecuritySymbol;
			
			custodians.push(custodianSymbol);
		});		
	}
	
	return security;
};

SecurityConverter.prototype.securityModelToSecurityEntity = function(data){
	var securityEntity = {};
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	securityEntity[SecurityEntity.columns.id] = data.id;
	securityEntity[SecurityEntity.columns.orionEclipseFirmId] = data.user.firmId;
	securityEntity[SecurityEntity.columns.orionConnectExternalId] = data.orionConnectExternalId;
	securityEntity[SecurityEntity.columns.name] = data.name;
	securityEntity[SecurityEntity.columns.symbol] = data.symbol;
	securityEntity[SecurityEntity.columns.custodialCash] = data.custodialCash ? data.custodialCash : 0;
	securityEntity[SecurityEntity.columns.statusId] = data.status ? securityStatus[data.status] : securityStatus.OPEN;
	securityEntity[SecurityEntity.columns.securityTypeId] = data.securityTypeId;
	
	securityEntity[SecurityEntity.columns.assetCategoryId] = data.assetCategoryId;
	securityEntity[SecurityEntity.columns.assetClassId] = data.assetClassId;
	securityEntity[SecurityEntity.columns.assetSubClassId] = data.assetSubClassId;

	securityEntity[SecurityEntity.columns.createdDate] = dateTime;
	securityEntity[SecurityEntity.columns.editedDate] = dateTime;
	securityEntity[SecurityEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
	securityEntity[SecurityEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
	securityEntity[SecurityEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
	
	return securityEntity;
};

SecurityConverter.prototype.securityDetailListEntityToSecurityModel = function(data){

	var security = new SecurityDetailResponse();
	data.forEach(function(value, index){
		
		if(!security.id){
			security.id = value.id;
			security.orionConnectExternalId = value.orionConnectExternalId;
			security.symbol = value.symbol;
			security.name = value.name;
			security.status = value.status;
			security.statusId = value.statusId;
			security.custodialCash = value.custodialCash;
			security.securityTypeId = value.securityTypeId;
			security.securityType = value.securityType;
			security.price = value.price;
			security.assetCategoryId = value.assetCategoryId;
			security.assetClassId = value.assetClassId;
			security.assetSubClassId = value.assetSubClassId;
			security.assetCategory = value.assetCategory;
			security.assetClass = value.assetClass;
			security.assetSubClass = value.assetSubClass;			
			security.assetCategory = value.assetCategory;
			security.assetClass = value.assetClass;
			security.assetSubClass = value.assetSubClass;
			security.isDeleted = value.isDeleted;	
			security.createdOn = value.createdOn;			
			security.editedOn = value.editedOn;
			security.createdBy = value.createdBy;
			security.editedBy = value.editedBy;
		}
		
		if(value.custodianId){
			var custodianDetail = new CustodianSecuritySymbolDetailResponse();
			security.custodians.push(custodianDetail);
			
			custodianDetail.custodianSecuritySymbol = value.custodianSecuritySymbol;
			custodianDetail.id = value.custodianId;
			custodianDetail.name = value.custodianName;
//			custodianDetail.code = value.custodianCode;
			custodianDetail.isDeleted = value.custodianIsDeleted;			
		}
	});
	
	return security;

}

SecurityConverter.prototype.securityModelToSecurityPriceEntity = function(data){
	
	var securityPrice = {};
	
	var dateTime = utilDao.getSystemDateTime(null);
		
	securityPrice[SecurityPriceEntity.columns.securityId] = data.id;
	securityPrice[SecurityPriceEntity.columns.price] = data.price;

	securityPrice[SecurityPriceEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
	securityPrice[SecurityPriceEntity.columns.priceDateTime]  = data.priceDateTime ? data.priceDateTime : dateTime; 
	
	securityPrice[SecurityPriceEntity.columns.createdDate] = dateTime;
	securityPrice[SecurityPriceEntity.columns.editedDate] = dateTime;

	securityPrice[SecurityPriceEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
	securityPrice[SecurityPriceEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
	
	return securityPrice;
};

SecurityConverter.prototype.securityModelToAssetWeightingsEntity = function(data, cb){
	
	var securityId = data.id;
	var dateTime = utilDao.getSystemDateTime(null);

	var entityList = [];
	
	var assetCategories = data.assetCategories;
	if(assetCategories && assetCategories.length>0){
		assetCategories.forEach(function(value, index){
			var assetWeightingEntity = [];

			assetWeightingEntity.push(dateTime);
			assetWeightingEntity.push(value.isDeleted ? value.isDeleted : 0);
			assetWeightingEntity.push(dateTime);
			assetWeightingEntity.push(utilService.getAuditUserId(data.user));
			assetWeightingEntity.push(utilService.getAuditUserId(data.user));
			
			entityList.push(assetWeightingEntity);
			assetWeightingEntity.push(securityId);
			assetWeightingEntity.push(relatedTypeEnum.CATEGORY);
			assetWeightingEntity.push(value.id);			
			assetWeightingEntity.push(value.weightPercentage);	

		});
	}

	var assetClass = data.assetClasses;
	if(assetClass && assetClass.length>0){
		assetClass.forEach(function(value, index){
			var assetWeightingEntity = [];

			assetWeightingEntity.push(dateTime);
			assetWeightingEntity.push(value.isDeleted ? value.isDeleted : 0);
			assetWeightingEntity.push(dateTime);
			assetWeightingEntity.push(utilService.getAuditUserId(data.user));
			assetWeightingEntity.push(utilService.getAuditUserId(data.user));
			
			entityList.push(assetWeightingEntity);
			assetWeightingEntity.push(securityId);
			assetWeightingEntity.push(relatedTypeEnum.CLASS);
			assetWeightingEntity.push(value.id);			
			assetWeightingEntity.push(value.weightPercentage);	
		});
	}

	var assetSubClasses = data.assetSubClasses;
	if(assetSubClasses && assetSubClasses.length>0){
		assetSubClasses.forEach(function(value, index){
			var assetWeightingEntity = [];

			assetWeightingEntity.push(dateTime);
			assetWeightingEntity.push(value.isDeleted ? value.isDeleted : 0);
			assetWeightingEntity.push(dateTime);
			assetWeightingEntity.push(utilService.getAuditUserId(data.user));
			assetWeightingEntity.push(utilService.getAuditUserId(data.user));
			
			entityList.push(assetWeightingEntity);
			assetWeightingEntity.push(securityId);
			assetWeightingEntity.push(relatedTypeEnum.SUBCLASS);
			assetWeightingEntity.push(value.id);			
			assetWeightingEntity.push(value.weightPercentage);
			
		});
	}
	
	return cb(null, entityList);
};

SecurityConverter.prototype.securityTypeEntityFromSecurityTypeModel = function(data, cb){
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	var securityType = new SecurityType();
	
	securityType.id = data.id;
	securityType.reqId = data.reqId;
	securityType.name = data.name;
	securityType.createdDate = dateTime;
	securityType.editedDate = dateTime;
	securityType.isDeleted = data.isDeleted ? data.isDeleted : 0;
	
	securityType.editedBy = utilService.getAuditUserId(data.user);
	securityType.createdBy = utilService.getAuditUserId(data.user);

	return securityType;
};

SecurityConverter.prototype.securityModelToModelModel = function(data, cb){
	
	var model = {};
	model.reqId = data.reqId;
	model.user = data.user;
	model.id = data.id;
	
	return model;
};

SecurityConverter.prototype.getCorporateActionEntity = function(data){
	
	var securityPrice = {};
	
	var dateTime = utilDao.getSystemDateTime(null);
		
	securityPrice[SecurityCorporateActionEntity.columns.corporateActionTypeId] = data.corporateActionTypeId;
	securityPrice[SecurityCorporateActionEntity.columns.to] = data.to
	securityPrice[SecurityCorporateActionEntity.columns.from] = data.from;
	securityPrice[SecurityCorporateActionEntity.columns.securityId] = data.securityId;
	securityPrice[SecurityCorporateActionEntity.columns.spinOfSecurityId] = data.spinOfSecurityId;
	securityPrice[SecurityCorporateActionEntity.columns.createdDate] = dateTime;
	securityPrice[SecurityCorporateActionEntity.columns.editedDate] = dateTime;
	securityPrice[SecurityCorporateActionEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
	securityPrice[SecurityCorporateActionEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
	
	return securityPrice;
};

module.exports = new SecurityConverter();