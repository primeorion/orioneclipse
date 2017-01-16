"use strict";

var CustodianResponse = require("model/custodian/CustodianResponse.js");

var CustodianSecuritySymbol = require('entity/custodian/CustodianSecuritySymbol.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var CustodianConverter = function(){
};

CustodianConverter.prototype.entityToModel = function(entity){
	var model = entity;
    model.accountNumber = entity.masterAccountNumber;
    model.createdOn = entity.createdDate;
    model.editedOn = entity.editedDate;
    if(entity.tradeExecutions && (entity.tradeExecutions).length>0){
        model.tradeExecutions = entity.tradeExecutions;
    }else if(entity.tradeExecutionId){
        model.tradeExecutionTypeId = entity.tradeExecutionId;
        model.tradeExecutionTypeName = entity.tradeExecutionName;
    }
	return new CustodianResponse(model);
};

CustodianConverter.prototype.entitiesToModels = function(entities){
	var models = [];
    var self = this;
	entities.forEach(function(entity){
        var model = {};
		models.push( self.entityToModel(entity) );
	});
    return new CustodianResponse(models);	
};

CustodianConverter.prototype.modelToEntity = function(model){
    var entity = model;
    entity.masterAccountNumber = model.accountNumber;
    if(model.tradeExecutions && model.tradeExecutions.length>0){
        entity.tradeExecutionTypeId = -1;
    }
    return entity;
}

CustodianConverter.prototype.custodianSecuritySymbolModelToCustodianSecuritySymbolEntity = function(model){

	var custodianSecuritySymbol = new CustodianSecuritySymbol();
	custodianSecuritySymbol.reqId = model.reqId;
	
	custodianSecuritySymbol.custodianId = model.custodianId ;
	custodianSecuritySymbol.securityId = model.securityId ;
	custodianSecuritySymbol.securitySymbol = model.securitySymbol ;
	custodianSecuritySymbol.isDeleted = model.isDeleted ? model.isDeleted : 0;
	custodianSecuritySymbol.createdDate = utilDao.getSystemDateTime(null);
	custodianSecuritySymbol.createdBy = utilService.getAuditUserId(model.user);
	custodianSecuritySymbol.editedDate = utilDao.getSystemDateTime(null);
	custodianSecuritySymbol.editedBy = utilService.getAuditUserId(model.user);
	
	return custodianSecuritySymbol;
}

CustodianConverter.prototype.custodianSecuritySymbolModelToCustodianEntity = function(model){

	var custodianEntity = {};
	
	custodianEntity.reqId = model.reqId;
	custodianEntity.id = model.custodianId;
	
	return custodianEntity;
}

module.exports = CustodianConverter;

