"use strict";

var lodash = require("lodash");
var CustodianResponse = require("model/custodian/CustodianResponse.js");
var CustodianRequest = require("model/custodian/CustodianRequest.js");
var baseConverter = require('converter/base/BaseConverter.js');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var CustodianConverter = function(){};

CustodianConverter.prototype.getRequestToModel = function(data){
    var custodian = new CustodianRequest();
    baseConverter(custodian, data);

    custodian.id = data.id;
    custodian.name = data.name;
    custodian.externalId = data.externalId;
    custodian.code = data.code;
    custodian.masterAccountNumber = data.accountNumber;
    if(data.tradeExecutions){
        custodian.tradeExecutionTypeId = -1;
        custodian.tradeExecutions = data.tradeExecutions;
    }else{
        custodian = lodash.omit(custodian, ['tradeExecutions']);
        custodian.tradeExecutionTypeId = data.tradeExecutionTypeId; 
    }
 
    return custodian;
}

CustodianConverter.prototype.getDetailModelToResponse = function(data,cb){
    var custodianResponse = new CustodianResponse();
    custodianResponse.id = data.id;
    custodianResponse.name = data.name;
    custodianResponse.externalId = data.externalId;
    custodianResponse.code = data.code;
    custodianResponse.accountNumber = data.masterAccountNumber;
    custodianResponse.tradeExecutionTypeId = data.tradeExecutionId;
    custodianResponse.tradeExecutionTypeName = data.tradeExecutionName;
    if (data.tradeExecutions) {
        custodianResponse = lodash.omit(custodianResponse, ['tradeExecutionTypeId']);
        custodianResponse = lodash.omit(custodianResponse, ['tradeExecutionTypeName']);
        var tradeExecutionList = [];
       (data.tradeExecutions).forEach(function(tradeExecution){
            var tradeExecutionResponse = {};
            tradeExecutionResponse.securityTypeId = tradeExecution.securityTypeId;
            tradeExecutionResponse.securityTypeName = tradeExecution.securityTypeName;
            tradeExecutionResponse.tradeExecutionTypeId = tradeExecution.tradeExecutionTypeId;
            tradeExecutionResponse.tradeExecutionTypeName = tradeExecution.tradeExecutionTypeName;
            tradeExecutionList.push(tradeExecutionResponse);
       }); 
       custodianResponse.tradeExecutions = tradeExecutionList;
    }else {
        custodianResponse = lodash.omit(custodianResponse, ['tradeExecutions']);
    } 
    custodianResponse.isDeleted = data.isDeleted;
    custodianResponse.createdOn = data.createdDate;
    custodianResponse.createdBy = data.createdBy;
    custodianResponse.editedOn = data.editedDate;
    custodianResponse.editedBy = data.editedBy;
    return cb(null,custodianResponse);
}
CustodianConverter.prototype.getListModelToResponse = function(data,cb){
    var custodianResponse = {};
    var custodianList = [];
    data.forEach(function(custodian){
        custodianResponse = new CustodianResponse();
        custodianResponse.id = custodian.id;
        custodianResponse.name = custodian.name;
        custodianResponse.externalId = custodian.externalId;
        custodianResponse.code = custodian.code;
        custodianResponse.accountNumber = custodian.accountNumber;
        custodianResponse.isDeleted = custodian.isDeleted;
        custodianResponse.createdOn = custodian.createdDate;
        custodianResponse.createdBy = custodian.createdBy;
        custodianResponse.editedOn = custodian.editedDate;
        custodianResponse.editedBy = custodian.editedBy;
        custodianResponse = lodash.omit(custodianResponse, ['tradeExecutions']);
        custodianResponse = lodash.omit(custodianResponse, ['tradeExecutionTypeId']);
        custodianResponse = lodash.omit(custodianResponse, ['tradeExecutionTypeName']);
        custodianList.push(custodianResponse);
    });
    return cb(null,custodianList);
}


module.exports = CustodianConverter;

