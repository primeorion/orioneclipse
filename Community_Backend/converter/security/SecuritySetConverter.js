"use strict";

var config = require("config");
var baseConverter = require('converter/base/BaseConverter.js');

var SecuritySetEntity = require("entity/security/SecuritySet.js");
var SecuritySetDetailEntity = require("entity/security/SecuritySetDetail.js");
var SecuritySetSecurityEquivalentEntity = require("entity/security/SecuritySetSecurityEquivalent.js");
var SecuritySetSecurityTLHEntity = require("entity/security/SecuritySetSecurityTLH.js");

var SecuritySetModel = require("model/security/SecuritySetRequest.js");
var SecuritySetDetailModel = require("model/security/SecuritySetSecurity.js");
var SecuritySetSecurityEquivalentModel = require("model/security/SecuritySetSecurityEquivalent.js");
var SecuritySetSecurityTLHModel = require("model/security/SecuritySetSecurityTLH.js");
var utilService = new (require('service/util/UtilService'))();
var applicationEnum = config.applicationEnum;
var sellPriorities = applicationEnum.sellPriorities;
var buyPriorities = applicationEnum.buyPriorities;

var securitySetToleranceType = applicationEnum.securitySetToleranceType;
var reverseSecuritySetToleranceType = applicationEnum.securitySetToleranceType;

var utilDao = require('dao/util/UtilDao.js');

var SecuritySetConverter = function() {

}

SecuritySetConverter.prototype.getSecuritySetCompleteModelFromSecuritySetRequest = function(
		data, cb) {

	var securityIds = [];
	var dateTime = utilDao.getSystemDateTime(null);

	var securitySetModel = new SecuritySetModel();
	baseConverter(securitySetModel, data);

	securitySetModel.id = data.id;
	securitySetModel.name = data.name;
	securitySetModel.description = data.description;
	securitySetModel.isDynamic = data.isDynamic;
	securitySetModel.toleranceType = data.toleranceType;
	securitySetModel.toleranceTypeValue = data.toleranceTypeValue;

	securitySetModel.isDeleted = data.isDeleted ? data.isDeleted : 0;
	securitySetModel.createdBy = utilService.getAuditUserId(data.user);
	securitySetModel.editedBy = utilService.getAuditUserId(data.user);
	securitySetModel.createdDate = dateTime;
	securitySetModel.editedDate = dateTime;
	securitySetModel.securityIds = securityIds;

	var securities = data.securities;

	var securityEntityList = [];
	securitySetModel.securities = securityEntityList;
	if (securities && securities.length > 0) {
		securities.forEach(function(value, index) {
					var model = new SecuritySetDetailModel();
					securityEntityList.push(model);
					baseConverter(model, data);

					model.isDeleted = data.isDeleted ? data.isDeleted : 0;
					model.createdBy = utilService.getAuditUserId(data.user);
					model.createdDate = dateTime;
					model.editedBy = utilService.getAuditUserId(data.user);
					model.editedDate = dateTime;

					model.securitySetId = data.id;
					model.securityId = value.id;
					securityIds.push(value.id);

					model.targetPercent = value.targetPercent;
					model.lowerModelTolerancePercent = value.lowerModelTolerancePercent;
					model.upperModelTolerancePercent = value.upperModelTolerancePercent;
					model.lowerModelToleranceAmount = value.lowerModelToleranceAmount;
					model.upperModelToleranceAmount = value.upperModelToleranceAmount;
					
					model.minTradeAmount = value.minTradeAmount;
					model.minInitialBuyDollar = value.minInitialBuyDollar;
					model.buyPriority = value.buyPriority;
					model.sellPriority = value.sellPriority;
					model.rank = value.rank;
					
					if (value.taxableSecurity) {
						model.taxableSecurityId = value.taxableSecurity.id;
						securityIds.push(value.taxableSecurity.id);
					}
					if (value.taxDeferredSecurity) {
						model.taxDeferredSecurityId = value.taxDeferredSecurity.id;
						securityIds.push(value.taxDeferredSecurity.id);
					}
					if (value.taxExemptSecurity) {
						model.taxExemptSecurityId = value.taxExemptSecurity.id;
						securityIds.push(value.taxExemptSecurity.id);
					}

					model.equivalences = [];

					var equivalences = value.equivalences;
					if (equivalences && equivalences.length > 0) {
						equivalences.forEach(function(equi) {
									var securitySetSecurityEquivalentModel = new SecuritySetSecurityEquivalentModel();
									model.equivalences.push(securitySetSecurityEquivalentModel);
									baseConverter(securitySetSecurityEquivalentModel, data);
									securitySetSecurityEquivalentModel.securitySetId = data.id;
									securitySetSecurityEquivalentModel.securityId = value.id;
									securitySetSecurityEquivalentModel.equivalentSecurityId = equi.id;
									securityIds.push(equi.id);
									
									if (equi.taxableSecurity) {
										securitySetSecurityEquivalentModel.taxableSecurityId = equi.taxableSecurity.id;
										securityIds.push(equi.taxableSecurity.id);
									}
									
									if (equi.taxDeferredSecurity) {
										securitySetSecurityEquivalentModel.taxDeferredSecurityId = equi.taxDeferredSecurity.id;
										securityIds.push(equi.taxDeferredSecurity.id);
									}
									
									if (equi.taxExemptSecurity) {
										securitySetSecurityEquivalentModel.taxExemptSecurityId = equi.taxExemptSecurity.id;
										securityIds.push(equi.taxExemptSecurity.id);
									}
									
									securitySetSecurityEquivalentModel.minTradeAmount = equi.minTradeAmount;
									securitySetSecurityEquivalentModel.minInitialBuyDollar = equi.minInitialBuyDollar;
									securitySetSecurityEquivalentModel.buyPriority = equi.buyPriority;
									securitySetSecurityEquivalentModel.sellPriority = equi.sellPriority;
									securitySetSecurityEquivalentModel.rank = equi.rank;
								});
					}
					// else{
					// var tempSecuritySetSecurityEquivalentModel = new
					// SecuritySetSecurityEquivalentModel();
					// model.equivalences.push(tempSecuritySetSecurityEquivalentModel);
					// baseConverter(tempSecuritySetSecurityEquivalentModel,
					// data);
					// tempSecuritySetSecurityEquivalentModel.securitySetId =
					// data.id;
					// tempSecuritySetSecurityEquivalentModel.securityId =
					// value.id;
					// }

					var tlh = value.tlh;
					model.tlh = [];
					if (tlh && tlh.length > 0) {
						tlh.forEach(function(equi) {
									var securitySetSecurityTLHModel = new SecuritySetSecurityTLHModel();
									model.tlh.push(securitySetSecurityTLHModel);
									baseConverter(securitySetSecurityTLHModel, data);
									securitySetSecurityTLHModel.securitySetId = data.id;
									securitySetSecurityTLHModel.securityId = value.id;
									securitySetSecurityTLHModel.tlhSecurityId = equi.id;
									securityIds.push(equi.id);
									securitySetSecurityTLHModel.priority = equi.priority;
								});
					}
					// else{
					// var tempSecuritySetSecurityTLHModel = new
					// SecuritySetSecurityTLHModel();
					// model.tlh.push(tempSecuritySetSecurityTLHModel);
					// baseConverter(tempSecuritySetSecurityTLHModel, data);
					// tempSecuritySetSecurityTLHModel.securitySetId = data.id;
					// tempSecuritySetSecurityTLHModel.securityId = value.id;
					// }
				});
	} else {
		// var model = new SecuritySetDetailModel();
		// securityEntityList.push(model);
		//		
		// var tempSecuritySetSecurityEquivalentModel = new
		// SecuritySetSecurityEquivalentModel();
		// model.equivalences.push(tempSecuritySetSecurityEquivalentModel);
		// baseConverter(tempSecuritySetSecurityEquivalentModel, data);
		// tempSecuritySetSecurityEquivalentModel.securitySetId = data.id;
		//		
		// var tempSecuritySetSecurityTLHModel = new
		// SecuritySetSecurityTLHModel();
		// model.tlh.push(tempSecuritySetSecurityTLHModel);
		// baseConverter(tempSecuritySetSecurityTLHModel, data);
		// tempSecuritySetSecurityTLHModel.securitySetId = data.id;
		//		
		// baseConverter(model, data);
		//		
		// model.securitySetId = data.id;
	}

	cb(null, securitySetModel);
};

SecuritySetConverter.prototype.getSecuritySetDetailEntityListFromSecuritySetRequest = function(
		data, cb) {

	var securities = data.securities;

	var dateTime = utilDao.getSystemDateTime(null);

	var securityEntityList = [];
	if (securities && securities.length > 0) {
		securities.forEach(function(value, index) {
			var entity = new SecuritySetDetailEntity();
			securityEntityList.push(entity);

			entity.reqId = data.reqId;
			entity.isDeleted = data.isDeleted ? data.isDeleted : 0;
			entity.createdBy = utilService.getAuditUserId(data.user);
			entity.createdDate = dateTime;
			entity.editedBy = utilService.getAuditUserId(data.user);
			entity.editedDate = dateTime;

			entity.securitySetId = value.securitySetId;
			entity.securityId = value.securityId;
			entity.rank = value.rank;
			entity.targetPercent = value.targetPercent;
			entity.lowerModelTolerancePercent = value.lowerModelTolerancePercent;
			entity.upperModelTolerancePercent = value.lowerModelTolerancePercent;
			entity.lowerModelToleranceAmount = value.lowerModelToleranceAmount;
			entity.upperModelToleranceAmount = value.lowerModelToleranceAmount;
			
			entity.minTradeAmount = value.minTradeAmount;
			entity.minInitialBuyDollar = value.minInitialBuyDollar;
			entity.buyPriority = buyPriorities[value.buyPriority];
			entity.sellPriority = sellPriorities[value.sellPriority];

		});
	} else {
		var entity = new SecuritySetDetailEntity();
		securityEntityList.push(entity);
		entity.reqId = data.reqId;
	}

	cb(null, securityEntityList);
};

/*
 * needs to refactored change name fromSecuritySetModel
*/SecuritySetConverter.prototype.getSecuritySetEntityFromSecuritySetRequest = function(
		data) {
	var entity = new SecuritySetEntity();

	var dateTime = utilDao.getSystemDateTime(null);
	entity.reqId = data.reqId;
	entity.id = data.id;
	entity.name = data.name;
	entity.description = data.description;
	
	if (data.isDynamic) {
		entity.isDynamic = data.isDynamic;
	}
	entity.toleranceType = securitySetToleranceType[data.toleranceType];
	entity.toleranceTypeValue = data.toleranceTypeValue;
	
	entity.isDeleted = data.isDeleted ? data.isDeleted : 0;
	entity.createdBy = utilService.getAuditUserId(data.user);
	entity.createdDate = dateTime;
	entity.editedBy = utilService.getAuditUserId(data.user);
	entity.editedDate = dateTime;

	return entity;
};

SecuritySetConverter.prototype.getSecuritySetDetailEntityFromSecuritySetModel = function(data, cb) {

	var dateTime = utilDao.getSystemDateTime(null);

	var entity = new SecuritySetDetailEntity();

	entity.reqId = data.reqId;
	entity.isDeleted = data.isDeleted ? data.isDeleted : 0;
	entity.createdBy = utilService.getAuditUserId(data.user);
	entity.createdDate = dateTime;
	entity.editedBy = utilService.getAuditUserId(data.user);
	entity.editedDate = dateTime;

	entity.securitySetId = data.securitySetId;
	entity.securityId = data.securityId;
	entity.rank = data.rank;
	
	entity.targetPercent = data.targetPercent;
	entity.lowerModelTolerancePercent = data.lowerModelTolerancePercent;
	entity.upperModelTolerancePercent = data.lowerModelTolerancePercent;
	entity.lowerModelToleranceAmount = data.lowerModelToleranceAmount;
	entity.upperModelToleranceAmount = data.lowerModelToleranceAmount;
	
	entity.minTradeAmount = data.minTradeAmount;
	entity.taxableSecurityId = data.taxableSecurityId;
	entity.taxDeferredSecurityId = data.taxDeferredSecurityId;
	entity.taxExemptSecurityId = data.taxExemptSecurityId;
	entity.minInitialBuyDollar = data.minInitialBuyDollar;
	entity.buyPriority = buyPriorities[data.buyPriority];
	entity.sellPriority = sellPriorities[data.sellPriority];
	return entity;
};

SecuritySetConverter.prototype.getSecuritySetDetailEquivalentEntityFromSecuritySetSecurityRequest = function(
		data, cb) {

	var dateTime = utilDao.getSystemDateTime(null);

	var entity = new SecuritySetSecurityEquivalentEntity();

	entity.reqId = data.reqId;
	entity.isDeleted = data.isDeleted ? data.isDeleted : 0;
	entity.createdBy = utilService.getAuditUserId(data.user);
	entity.createdDate = dateTime;
	entity.editedBy = utilService.getAuditUserId(data.user);
	entity.editedDate = dateTime;

	entity.securitySetId = data.securitySetId;
	entity.securityId = data.securityId;
	entity.equivalentSecurityId = data.equivalentSecurityId;
	entity.taxableSecurityId = data.taxableSecurityId;
	entity.taxDeferredSecurityId = data.taxDeferredSecurityId;
	entity.taxExemptSecurityId = data.taxExemptSecurityId;
	entity.minTradeAmount = data.minTradeAmount;
	entity.minInitialBuyDollar = data.minInitialBuyDollar;
	entity.buyPriority = buyPriorities[data.buyPriority];
	entity.sellPriority = sellPriorities[data.sellPriority];
	entity.rank = data.rank;
	
	return entity;
};

SecuritySetConverter.prototype.getSecuritySetDetailTLHEntityFromSecuritySetSecurityRequest = function(
		data, cb) {

	var dateTime = utilDao.getSystemDateTime(null);

	var entity = new SecuritySetSecurityTLHEntity();

	entity.reqId = data.reqId;
	entity.isDeleted = data.isDeleted ? data.isDeleted : 0;
	entity.createdBy = utilService.getAuditUserId(data.user);
	entity.createdDate = dateTime;
	entity.editedBy = utilService.getAuditUserId(data.user);
	entity.editedDate = dateTime;

	entity.securitySetId = data.securitySetId;
	entity.securityId = data.securityId;
	entity.tlhSecurityId = data.tlhSecurityId;
	entity.priority = data.priority;

	return entity;
};

module.exports = new SecuritySetConverter();