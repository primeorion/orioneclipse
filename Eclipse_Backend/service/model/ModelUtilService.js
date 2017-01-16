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

ModelConverter.prototype.statusChangeCheckBasedOnUser = function(node){
	var status = false;
	var roleTypeId = utilService.getRoleTypeId(node.user);
	roleTypeWhoCanChangeModelStatus.forEach(function(value){
		if(roleTypeId == value){
			status = true;
		}
	})
	
	return status;
}

ModelConverter.prototype.setApprovedByBasedOnStatus = function(node){
	
	if(node.statusId == modelStatus["APPROVED"]){
		node.approvedByUserId = utilService.getAuditUserId(node.user);
	}
	
	return node;
	
}

module.exports = new ModelConverter();