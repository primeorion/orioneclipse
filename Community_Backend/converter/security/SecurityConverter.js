"use strict";

var config = require('config');

var utilDao = require('dao/util/UtilDao.js');
var baseConverter = require('converter/base/BaseConverter.js');

var SecurityListRequestModel = require('model/security/SecurityListRequest.js');
var SecurityRequest = require("model/security/SecurityRequest.js");
var SecurityDetailResponse = require("model/security/SecurityDetailResponse.js");
var CustodianSecuritySymbol = require("model/custodian/CustodianSecuritySymbol.js");
var CustodianSecuritySymbolDetailResponse = require('model/custodian/CustodianSecuritySymbolDetailResponse.js');
var SecurityPriceEntity = require("entity/security/SecurityPrice.js");
var SecurityEntity = require("entity/security/Security.js");
var AssetWeightingEntity = require("entity/security/assetWeighting.js");
var SecurityType = require("entity/security/SecurityType.js");
var utilService = new (require('service/util/UtilService'))();
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

SecurityConverter.prototype.getSecurityRequestToModel = function(data){
	var model = new SecurityListRequestModel();

	baseConverter(model, data);
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
	var securityEntity = new SecurityEntity();
	
	securityEntity.reqId = data.reqId;
	var dateTime = utilDao.getSystemDateTime(null);
	
	securityEntity.id = data.id;
	securityEntity.orionConnectExternalId = data.orionConnectExternalId;
	securityEntity.name = data.name;
	securityEntity.symbol = data.symbol;
	securityEntity.custodialCash = data.custodialCash ? data.custodialCash : 0;
	securityEntity.statusId = data.status ? securityStatus[data.status] : securityStatus.ACTIVE;
	securityEntity.securityTypeId = data.securityTypeId;
	
	securityEntity.assetCategoryId = data.assetCategoryId;
	securityEntity.assetClassId = data.assetClassId;
	securityEntity.assetSubClassId = data.assetSubClassId;

	securityEntity.createdDate = dateTime;
	securityEntity.editedDate = dateTime;
	securityEntity.editedBy = utilService.getAuditUserId(data.user);
	securityEntity.createdBy = utilService.getAuditUserId(data.user);
	securityEntity.isDeleted = data.isDeleted ? data.isDeleted : 0;
	
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
	
	var securityPrice = new SecurityPriceEntity();
	
	var dateTime = utilDao.getSystemDateTime(null);
	
	securityPrice.reqId = data.reqId;
	
	securityPrice.securityId = data.id;
	securityPrice.price = data.price;

	securityPrice.isDeleted = data.isDeleted ? data.isDeleted : 0;
	securityPrice.priceDateTime  = data.priceDateTime ? data.priceDateTime : dateTime; 
	
	securityPrice.createdDate = dateTime;
	securityPrice.editedDate = dateTime;

	securityPrice.editedBy = utilService.getAuditUserId(data.user);
	securityPrice.createdBy = utilService.getAuditUserId(data.user);
	
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

SecurityConverter.prototype.securityTypeEntityFromSecurityModel = function(data, cb){
	var securityType = new SecurityType();
	
	securityType.reqId = data.reqId;
	securityType.id = data.securityTypeId;
	
	return securityType;
};

module.exports = new SecurityConverter();