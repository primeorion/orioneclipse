"use strict";

var moduleName = __filename;

var helper = require('helper');

var UtilService = require("service/util/UtilService");
var AccountRequest = require("model/account/AccountRequest.js");
var AccountResponse = require("model/account/AccountResponse.js");
var AllAccountsResponse = require("model/account/AllAccountsResponse.js");
var AccountDetailResponse = require("model/account/AccountDetailResponse.js");

var logger = helper.logger(moduleName);
var utilService = new UtilService();

var AccountConverter = function () { }

AccountConverter.prototype.getRequestToModel = function (data) {
    var accounts = new AccountRequest();

    accounts.id = data.id;
    accounts.name = data.name;
    accounts.accountNumber = data.accountNumber;
    accounts.accountTypeId = data.accountType;
    return accounts;
};

AccountConverter.prototype.getModelToResponse = function (data, cb) {
    logger.info(" Account  Converter called (getModelToResponse())");
    var accountList = [];
    var accountResponse = {};
    data.forEach(function (data) {
        accountResponse = new AccountResponse();
        accountResponse.id = data.id;
        accountResponse.orionConnectExternalId = data.orionConnectExternalId;
        accountResponse.name = data.name;
        accountResponse.accountNumber = data.accountNumber;
        accountResponse.accountType = data.accountTypeId;
        accountResponse.createdOn = data.createdDate;
        accountResponse.createdBy = data.createdBy;
        accountResponse.editedOn = data.editedDate;
        accountResponse.editedBy = data.editedBy;
        accountResponse.isDeleted = data.isDeleted;
        accountList.push(accountResponse);

    });
    return cb(null, accountList);
};


AccountConverter.prototype.getAllAccountModelToResponse = function (data, cb) {
    logger.info(" Account  Converter called (getModelToResponse())");
    var accountList = [];
    var allAccountsResponse = {};
    data.forEach(function (data) {
        allAccountsResponse = new AllAccountsResponse();

        allAccountsResponse.id = data.id;
        allAccountsResponse.accountId = data.accountId;
        allAccountsResponse.orionConnectExternalId = data.orionConnectExternalId;
        allAccountsResponse.name = data.name;
        allAccountsResponse.accountNumber = data.accountNumber;
        allAccountsResponse.accountType = data.accountType;//To do
        allAccountsResponse.portfolio = data.portfolio;//To do
        allAccountsResponse.custodian = data.custodian;//To do
        allAccountsResponse.model = data.model;//To do
        allAccountsResponse.ssn = data.ssn;
        allAccountsResponse.value = data.value;
        allAccountsResponse.managedValue = data.managedValue;
        allAccountsResponse.excludedValue = data.excludedValue;
        allAccountsResponse.pendingValue = data.pendingValue;
        allAccountsResponse.ssn = data.ssn;
        allAccountsResponse.style = data.style;
        allAccountsResponse.sleeveType = data.sleeveType;
        allAccountsResponse.distributionAmount = data.distributionAmount;
        allAccountsResponse.contributionAmount = data.contributionAmount;
        allAccountsResponse.mergeIn = data.mergeIn;
        allAccountsResponse.mergeOut = data.mergeOut;
        allAccountsResponse.cashNeedAmount = data.cashNeedAmount;
        allAccountsResponse.cashTarget = data.cashTarget;
        allAccountsResponse.targetCashReserve = data.targetCashReserve;
        allAccountsResponse.systematicAmount = data.systematicAmount;
        allAccountsResponse.systematicDate = data.systematicDate;
        allAccountsResponse.sma = data.sma;
        allAccountsResponse.status = data.status;
        allAccountsResponse.pendingTrades = data.pendingTrades;
        allAccountsResponse.createdOn = data.createdDate;
        allAccountsResponse.createdBy = data.createdBy;
        allAccountsResponse.editedOn = data.editedDate;
        allAccountsResponse.editedBy = data.editedBy;
        allAccountsResponse.isDeleted = data.isDeleted;
        accountList.push(allAccountsResponse);

   });
    return cb(null, accountList);
};




AccountConverter.prototype.getADModelToResponse = function (data, cb) {
    logger.info(" Account  Converter called (getModelToResponse())");
    var accountList = [];
    var AccountDetailResponse = {};
   // data.forEach(function (data) {
        AccountDetailResponse = new AccountDetailResponse();

        AccountDetailResponse.id = data.id;
        AccountDetailResponse.accountId = data.accountId;
      
        AccountDetailResponse.name = data.name;
        AccountDetailResponse.accountNumber = data.accountNumber;
        AccountDetailResponse.accountType = data.accountType;//To do
        AccountDetailResponse.portfolio = data.portfolio;//To do
        AccountDetailResponse.custodian = data.custodian;//To do
      
        AccountDetailResponse.ssn = data.ssn;
       
    
     
        AccountDetailResponse.sleeveType = data.sleeveType;
       
        AccountDetailResponse.createdOn = data.createdDate;
        AccountDetailResponse.createdBy = data.createdBy;
        AccountDetailResponse.editedOn = data.editedDate;
        AccountDetailResponse.editedBy = data.editedBy;
        AccountDetailResponse.isDeleted = data.isDeleted;
        accountList.push(AccountDetailResponse);

  // });
    return cb(null, accountList);
};


module.exports = AccountConverter;
