"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var util = require('util');
var ModelResponse = require("model/community/model/ModelResponse.js");
var ApprovedModelResponse = require("model/community/model/ApprovedModelResponse.js");

var messages = config.messages;
var logger = helper.logger(moduleName);

var ModelConverter = function () { }

ModelConverter.prototype.getResponseModelOfModelList = function (data, cb) {
    logger.debug("Converting data to ApprovedModelListData in getResponseModelOfModelList()");
    var approvedModelList = [];
    if (data) {
        data.forEach(function (model) {
            if (model.id) {
                var modelResponse = new ApprovedModelResponse();
                modelResponse.id = model.id;
                modelResponse.name = model.modelName ? model.modelName : null;
                modelResponse.isDeleted = model.isDeleted ? model.isDeleted : 0;
                modelResponse.createdOn = model.createdDate ? model.createdDate : null;
                modelResponse.createdBy = model.createdBy ? model.createdBy : null;
                modelResponse.editedOn = model.editedDate ? model.editedDate : null;
                modelResponse.editedBy = model.editedBy ? model.editedBy : null;
                approvedModelList.push(modelResponse);
            }
        }, this);
    }
    return cb(null, approvedModelList);
};

ModelConverter.prototype.getGeneralModelFromModelRequest = function (data, cb) {
    logger.debug("Converting data to ModelRequestData in getGeneralModelFromModelRequest()");
    var modelResponse = {};
    if (data) {
        modelResponse.communityModelId = data.id ? data.id : null;
        modelResponse.name = data.name;
        modelResponse.namespace = data.namespace ? data.namespace : null;
        modelResponse.description = data.description ? data.description : null;
        // modelResponse.statusId = data.status ? data.status : null;
        modelResponse.statusId = 1;
        //  modelResponse.managementStyleId = model.managementStyleId ? model.managementStyleId : null;
        modelResponse.isCommunityModel = true;
        modelResponse.byCommunity = true;
        modelResponse.strategistId = data.strategistId ? data.strategistId : null;
        // modelResponse.isDynamic = data.isDynamic ? data.isDynamic : null;
        modelResponse.isDynamic = false;
        var securities = data.securities;
        modelResponse.securities = [];
        modelResponse.allocation = [];
        modelResponse.lowerTolerancePercent = [];
        modelResponse.upperTolerancePercent = [];

        securities.forEach(function (security) {
            modelResponse.securities.push(security.orionConnectExternalId);
            modelResponse.allocation.push(security.allocation);
            modelResponse.lowerTolerancePercent.push(security.lowerTolerancePercent);
            modelResponse.upperTolerancePercent.push(security.upperTolerancePercent);
        })
    }
    //   console.log("___________________________modelResponse_______________________________"+util.inspect(modelResponse));
    return cb(null, modelResponse);
};

ModelConverter.prototype.getSecuritySetCompleteModel = function (data, model, modelRequest, validSecurity, cb) {
    logger.debug("Converting data to SecuritySetData in getSecuritySetCompleteModel()");
    var securitySetModel =
        [
            {
                "id": 14612,
                "targetPercent": 50
            },
            {
                "id": 14612,
                "targetPercent": 50
            }
        ];

    var modelResponse = {};
    // console.log("************modelRequest*******"+ util.inspect(modelRequest));
    // modelResponse.name = model.name + model.ownerUserId + validSecurity.length;
    modelResponse.name = model.name + "-" + modelRequest.strategistId + "-" + validSecurity.length;

    modelResponse.securities = [];
    // if (securitySetModel) {
    //     securitySetModel.forEach(function (security) {
    //         securitySet.id = security.id ? security.id : null;
    //         securitySet.targetPercent = security.targetPercent ? security.targetPercent : null;
    //         modelResponse.securities.push(securitySet);
    //     }, this);
    // }
    //  if (securitySetModel) {
    //  "lowerModelTolerancePercent": 5,
    // 				      "upperModelTolerancePercent": 5,
    validSecurity.forEach(function (security) {
        ;
        var securitySet = {};
        securitySet.id = security.id ? security.id : null;
        securitySet.targetPercent = security.allocation ? security.allocation : null;
        securitySet.lowerModelTolerancePercent = security.lowerTolerancePercent ? security.lowerTolerancePercent : null;
        securitySet.upperModelTolerancePercent = security.upperTolerancePercent ? security.upperTolerancePercent : null;

        modelResponse.securities.push(securitySet);
    }, this);
    return cb(null, modelResponse);
};

ModelConverter.prototype.getValidateSecurityResponse = function (data, cb) {
    logger.debug("Converting get validateSecurity in getValidateSecurityResponse()");
    var eclipseOrionConnectExternalId = [];
    var securityId = [];
    var security = {}
    if (data.securityId) {
        for (var i = 0; i < data.securityId.length; i++) {
            if (data.securityId[i]) {
                if (eclipseOrionConnectExternalId.indexOf(data.orionConnectExternalId[i]) == -1) {

                    securityId.push(data.securityId[i]);
                    eclipseOrionConnectExternalId.push(data.orionConnectExternalId[i]);
                }
            }
        }
        security["securityId"] = securityId;
        security["eclipseOrionConnectExternalId"] = eclipseOrionConnectExternalId;
    }
    return cb(null, security);
};

ModelConverter.prototype.getModelElementModel = function (modelDetail, securitySetDetail, cb) {
    logger.debug("Converting get Model Element Model in ( getModelElementModel())");
    var subModel = {};
    subModel.name = modelDetail.name;
    subModel.nameSpace = modelDetail.nameSpace;
    subModel.modelTypeId = 4;
    subModel.isFavorite = 1;
    subModel.securityAsset = {
        "id": securitySetDetail.id
    };
    return cb(null, subModel);
};

ModelConverter.prototype.getModelDetailModel = function (modelDetail, securitySetDetail, subModel, cb) {
    logger.debug("Converting get Model Element Model in ( getModelDetailModel())");
    var communityModelDetail = {};
    communityModelDetail.id = modelDetail.id
    communityModelDetail.modelDetail = {
        "name": modelDetail.name,
        "targetPercent": 100,
        "rank": 1,
        "lowerModelTolerancePercent": 0,
        "upperModelTolerancePercent": 0,
        "lowerModelToleranceAmount": 0,
        "upperModelToleranceAmount": 0,
        "lowerTradeTolerancePercent": 0,
        "upperTradeTolerancePercent": 0,
        "children": [
            {
                "id": subModel.id,
                "name": modelDetail.name,
                "nameSpace": "namespace",
                "modelTypeId": 4,
                "securityAsset": {
                    "id": securitySetDetail.id
                },
                "targetPercent": 100,
                "rank": 1,
                "lowerModelTolerancePercent": 0,
                "upperModelTolerancePercent": 0
            }
        ]
    }
    return cb(null, communityModelDetail);
};

module.exports = ModelConverter;
