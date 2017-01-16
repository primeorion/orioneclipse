"use strict";

var moduleName = __filename;

var ModelService =  function() {}
module.exports = new ModelService();

var _ = require("lodash");

var xlsx = require("xlsx");
var config = require('config');
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var TeamDao = require('dao/admin/TeamDao.js');
var ModelDao = require('dao/model/ModelDao.js');
var modelConverter = require('converter/model/ModelConverter.js');
var localCache = require('service/cache').local;
var baseConverter = require('converter/base/BaseConverter.js');
var modelService = require('service/model/ModelService.js');
var modelUtil = require("service/model/ModelUtilService.js");
var CategoryService = require("service/security/CategoryService.js");
var ClassService = require("service/security/ClassService.js");
var SubClassService = require("service/security/SubClassService.js");
var SecuritySetService = require("service/security/SecuritySetService.js");
var SecurityService = require("service/security/SecurityService.js");
var utilService = new (require('service/util/UtilService'))();
var SecuritySetConverter = require("converter/security/SecuritySetConverter.js");
var s3Service = require("helper/AwsS3.js");

var applicationEnum = config.applicationEnum;
var asyncFor = helper.asyncFor;
var messages = config.messages;
var codes = config.responseCode;
var teamDao = new TeamDao();
var modelDao = new ModelDao();

var modelValidationMessages = messages.modelValidations;
var modelStatus = config.applicationEnum.modelStatus;
var relatedTypeCodeToDisplayName = applicationEnum.relatedTypeCodeToDisplayName;
var relatedTypeCodeToId = applicationEnum.relatedTypeCodeToId;
var tempUploadFilesPath = config.env.prop["uploaded-temp-path"];
var templates = applicationEnum.templates;

var numberFromPercentageRegex = /([-\d]*)/;

var constants = {
		"startingCell" : {
			"rowId" : 1,
			"columnId" : "A"
		}, 
		"noOfColumns" : 7
	}

	var indexToBean = {
			"name" : "Model Name" , 
			"managementStyle" : "Management Style" ,
			"securitySymbol" : "Ticker" ,
			"targetPercent" : "Target %",
			"lowerModelTolerancePercent" : "Lower Tolerance %",
			"upperModelTolerancePercent" : "Upper Tolerance %",
			"modelNotes" : "Model Notes"
	}
	var noOfColumns = constants.noOfColumns; 

ModelService.prototype.parseImportedFile = function(model, cb){

	logger.info(" Parse Imported File (parseImportedFile())");
	var filePath = tempUploadFilesPath + model.reqId;
	var workbook = xlsx.readFile( filePath );
	var sheetName = workbook.SheetNames[0];
	var workSheet = workbook.Sheets[sheetName];
	
	var array = xlsx.utils.sheet_to_row_object_array(workSheet);
	
	var mainMap = {};
	var inputJson = null;
	
	array.forEach(function(value){
		var managementStyle = value[indexToBean["managementStyle"]];
		
		var modelName = value[indexToBean["name"]];
		modelName = modelName ? modelName : null;
		
		var targetPercent = numberFromPercentageRegex.exec(value[indexToBean["targetPercent"]]);
		if(targetPercent && targetPercent.length > 0){
			targetPercent = targetPercent[0];
		}
		var lowerModelTolerancePercent = numberFromPercentageRegex.exec(value[indexToBean["lowerModelTolerancePercent"]]);
		if(lowerModelTolerancePercent && lowerModelTolerancePercent.length > 0){
			lowerModelTolerancePercent = lowerModelTolerancePercent[0];
		}
		var upperModelTolerancePercent = numberFromPercentageRegex.exec(value[indexToBean["upperModelTolerancePercent"]]);
		if(upperModelTolerancePercent && upperModelTolerancePercent.length > 0){
			upperModelTolerancePercent = upperModelTolerancePercent[0];
		}
		if(modelName in mainMap){
			inputJson = mainMap[modelName];
		}else{
			inputJson = {};
			inputJson.securitySet = {};
			inputJson.securitySet.securities = [];
			mainMap[modelName] = inputJson;
		}
		inputJson["name"] = modelName;
		inputJson["nameSpace"] = modelConverter.getNamespaceTeam(model);
		inputJson["managementStyleName"] = managementStyle;
		inputJson["isDynamic"] = 0
		
		var securitySet = inputJson.securitySet;
		securitySet.name = modelName;
		securitySet.isDynamic = 0;
		
		var security = {};
		security.symbol = value[indexToBean["securitySymbol"]];
		security.targetPercent = targetPercent;
		security.lowerModelTolerancePercent = lowerModelTolerancePercent;
		security.upperModelTolerancePercent = upperModelTolerancePercent;
		inputJson.securitySet.securities.push(security);
	});

	return mainMap;
};

ModelService.prototype.createModelFromImportBulk = function(mainArr, cb){
	logger.info(" create Model From Import (createModelFromImportBulk())");
	var self = this;

	if(mainArr && mainArr.length > 0){		
		asyncFor(mainArr, function(value, index, next){
			self.createModelFromImport(value, function(err, status, rs){
				if (err) {
			        logger.error("Error (createModelFromImport())" + err);
			        next(err);
			        return cb(err, codes.INTERNAL_SERVER_ERROR);
			    }
				if(status == codes.UNPROCESSABLE){
					next(rs);
					var rTurn = [];
					if(Array.isArray(rs.message)){
						rTurn = rs.message;
					}else{						
						rTurn.push(rs.message);
					}
					return cb(null, status, {message : rTurn});
				}
				next(null, rs);
			})
		}, function(err, data){
			return cb(null, codes.SUCCESS, data);
		});
	}else{
		return cb(null, codes.UNPROCESSABLE, {message : messages.modelEmptyImportFile});
	}
}

ModelService.prototype.validateModelInBulk = function(mainArr, cb){
	logger.info(" create Model From Import (validateModelInBulk())");
	var self = this;

	if(mainArr && mainArr.length > 0){		
		asyncFor(mainArr, function(value, index, next){
			self.modelImportValidator(value, function(err, status, rs){
				if (err) {
			        logger.error("Error (createModelFromImport())" + err);
			        next(err);
			        return cb(err, codes.INTERNAL_SERVER_ERROR);
			    }
				if(status == codes.UNPROCESSABLE){
					next(rs);
					var rTurn = [];
					if(Array.isArray(rs.message)){
						rTurn = rs.message;
					}else{						
						rTurn.push(rs.message);
					}
					return cb(null, status, {message : rTurn});
				}
				next(null, rs);
			})
		}, function(err, data){
			return cb(null, codes.SUCCESS, data);
		});
	}else{
		return cb(null, codes.UNPROCESSABLE, {message : messages.modelEmptyImportFile});
	}
}


var util = require("util");
ModelService.prototype.createModelFromImport = function(model, cb){

	var self = this;
	logger.info(" create Model From Import (createModelFromImport())");
	
	self.modelImportValidator(model, function(err, status, rs){
		
		if (err) {
			logger.error("Error (createModelFromImport())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}
		
		if(status == codes.UNPROCESSABLE){
			return cb(null, status, rs);
		}
		
		self.createSecuritySetJsonFromModelImportJson(model.securitySet, function(err, status, rs){
			if (err) {
				logger.error("Error (createModelFromImport())" + err);
				return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			if(status != codes.SUCCESS){
				return cb(null, status, rs);
			}else{
				self.createSecuritySetFromModelImport(model.securitySet, function(err, status, rs){
					if (err) {
						logger.error("Error (createModelFromImport())" + err);
						if(status != codes.INTERNAL_SERVER_ERROR){
							return cb(err, status);
						}
						return cb(err, codes.INTERNAL_SERVER_ERROR);
					}
					if(status != codes.SUCCESS){
						return cb(null, status, rs);
					}else{
						
						var node = {};
						node.name = model.name;
						node.nameSpace = model.nameSpace;
						node.modelTypeId = relatedTypeCodeToId["SECURITYSET"];
						node.securityAsset = {};
						node.securityAsset.id = rs.id;
						node.targetPercent = 100;
						model.children = [];
						model.children.push(node);
						var mod = modelConverter.getGeneralModelModelFromModelRequest(model);
						
						modelService.checkAndCreateModelManagementStyleByName(mod, function(err, status, rs){
							if (err) {
								logger.error("Error (createModelFromImport())" + err);
								return cb(err, codes.INTERNAL_SERVER_ERROR);
							}
							mod.managementStyleId = rs.id;
							modelService.createOrUpdateGeneralModel(mod, function(err, status, data){
								if (err) {
									logger.error("Error (createModelFromImport())" + err);
									return cb(err, codes.INTERNAL_SERVER_ERROR);
								}
								if(status == codes.UNPROCESSABLE){
									return cb(null, status, data);
								}
								var serviceModel = {};
								serviceModel.id = data.id;
								serviceModel.user = model.user;
								serviceModel.reqId = model.reqId;
								serviceModel.modelDetail = model;
								serviceModel.modelDetail.nameSpace = null;
								modelService.saveCompleteModel(serviceModel, function(err, status, data){		
									if (err) {
										logger.error("Error (createModelFromImport())" + err);
										return cb(err, codes.INTERNAL_SERVER_ERROR);
									}
									return cb(null, status, data);
								});
							});
						})
					}
				})
			}
		})
	})
};

ModelService.prototype.modelImportValidator = function(data, cb){

	var self = this;
	logger.info(" MODEL Import validator (modelImportValidator())");
	
	var rTurnMessages = [];
	self.createSecuritySetJsonFromModelImportJson(data.securitySet, function(err, status, rs){
		if (err) {
	        logger.error("Error (createModelFromImport())" + err);
	        return cb(err, codes.INTERNAL_SERVER_ERROR);
	    }
		if(status != codes.SUCCESS){
			rTurnMessages.push(rs.message);
		}
			SecuritySetConverter.getSecuritySetCompleteModelFromSecuritySetRequest(data.securitySet, function(err, securitySet){
				SecuritySetService.checkForSecurityStatusBeingAddedInSecuritySet(securitySet, function(err, status){
					if(err){
						 logger.error(err);
						 if(status != codes.INTERNAL_SERVER_ERROR){
							 rTurnMessages.push(err); 
						 }else{							 
							 return cb(err, codes.INTERNAL_SERVER_ERROR);
						 }
					}
					var node = {};
					node.name = data.name;
					node.nameSpace = data.nameSpace;
					node.modelTypeId = relatedTypeCodeToId["SECURITYSET"];
					node.securityAsset = {};
					node.securityAsset.id = rs.id;
					node.targetPercent = 100;
					data.children = [];
					data.children.push(node);
					var mod = modelConverter.getGeneralModelModelFromModelRequest(data);
					if(!data.name){
						rTurnMessages.push(messages.modelNameRequired);
					}
					if(!data.managementStyleName){
						rTurnMessages.push(messages.modelManagementStyleRequired);
					}
					modelService.checkUniqueNameConsideringNamespace(mod, function(err, status, rs){
						if(err){
							logger.error(err);
							return cb(err, codes.INTERNAL_SERVER_ERROR);
						}
						if(rs && rs.length != 0){
							rTurnMessages.push(messages.modelNameConstraintWithinNamespace);
						}
						if(rTurnMessages.length > 0){
							return cb(null, codes.UNPROCESSABLE, {message : rTurnMessages});
						}else{
							return cb(null, codes.SUCCESS, {message : rTurnMessages});
						}
					});
				})
			});
	});
};

ModelService.prototype.createSecuritySetJsonFromModelImportJson = function(securitySet, cb){

	logger.info(" create Security Set Json (createSecuritySetJsonFromModelImportJson())");
	
	var securities = securitySet.securities;
	
	var targetPercentCheck = 0;
	if(securities && securities.length > 0){
		asyncFor(securities, function(val, index, next){
			val.reqId = securitySet.reqId; 
			val.user = securitySet.user;
			SecurityService.getSecurityBySymbol(val, function(err, status, rs){
				if (err) {
			        logger.error("Error (createSecuritySetJsonFromModelImportJson())" + err);
			        return cb(err, codes.INTERNAL_SERVER_ERROR);
			    }
				if(rs && rs.length > 0){					
					val.id = rs[0].id;
					var targetPercent = parseInt(val.targetPercent);
					if(targetPercent < 0){
						next(modelValidationMessages.percentCannotBeNegative);
						return cb(null, codes.UNPROCESSABLE, {message : modelValidationMessages.percentCannotBeNegative.percentCannotBeNegative});
					}
					targetPercentCheck += targetPercent;
					next();
				}else{
					next(messages.securityNotFound);
					return cb(null, codes.UNPROCESSABLE, {message : messages.securityNotFound});
				}
			})
		}, function(err, data){
			if(targetPercentCheck == 100){
				return cb(null, codes.SUCCESS, securitySet);
			}else{
				return cb(null, codes.UNPROCESSABLE, {message : messages.securitySetTargetPercentageNot100});
			}
		})
	}
};

ModelService.prototype.createSecuritySetFromModelImport = function(securitySet, cb){

	logger.info(" create Security Set from import (createSecuritySetFromModelImport())");
	
	SecuritySetConverter.getSecuritySetCompleteModelFromSecuritySetRequest(securitySet, function(err, model){
		SecuritySetService.checkForSecurityStatusBeingAddedInSecuritySet(model, function(err, status, data){
			if(err){
				 logger.error(err);
				 if(status != codes.INTERNAL_SERVER_ERROR){
					 return cb(err, status); 
				 }
				 return cb(err, codes.INTERNAL_SERVER_ERROR);
			}
			SecuritySetService.createSecuritySet(model, function(err, status, data){
				if (err) {
					logger.error("Error (createSecuritySetFromModelImport())" + err);
					return cb(err, codes.INTERNAL_SERVER_ERROR);
				}else{
					if(status == codes.CREATED){						
						securitySet.id = data.id;
						return cb(null, codes.SUCCESS, data);
					}else{
						return cb(null, status, data);
					}
				}
			});		
		})
	});
};

ModelService.prototype.getModelTemplateUrlFromS3 = function(data, cb){

	logger.info(" create model template url (getModelTemplateUrlFromS3())");
	
	var format = data.format; 
	var path = templates + "/model/model" + (format ? "." + format : ".xls");
	s3Service.getUrl(path, function(err, status, rs){
		if (err) {
			logger.error("Error (getModelTemplateUrlFromS3())" + err);
			return cb(err, codes.INTERNAL_SERVER_ERROR);
		}else{
			cb(null, codes.SUCCESS, rs);
		}
	});
};


var modelPortfolioService = require('service/model/ModelPortfolioService.js');