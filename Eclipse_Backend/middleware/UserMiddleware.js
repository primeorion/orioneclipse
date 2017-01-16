/**	
 * 
 */
"use strict";

var helper = require("helper");
var moduleName = __filename;
var config = require('config');
var UserService = require("service/admin/UserService.js");
var response = require('controller/ResponseController.js');
var localCache = require('service/cache').local;
var modelService = require('service/model/ModelService.js');
var enums = require('config/constants/ApplicationEnum.js');
var codes = config.responseCode;
var messages = config.messages;
var logger = helper.logger(moduleName);

var userService = new UserService();

module.exports.getDifferentAccessForUser = function(req, res, next){
	
	var data = {
			reqId : req.data.reqId,
			userId : req.data.user.userId
	}

	var cacheObject = localCache.get(data.reqId);
	userService.getAccessForUser(data, function(err, status, rs){

		if(err){
			logger.error(err);
			return response(err, status,null,res);
		}

		userService.roleTypeForUser(data, function(err, result){
				
			var roleTypeId = result.roleTypeId;
			var session = cacheObject.session;

			var userAccess = rs;
			session.userAccess = userAccess;
			
			var modelAllAccess = [];
			var modelLimitedAccess = [];
			var portfolioAllAccess = [];
			var portfolioLimitedAccess = [];
			var advisorLimitedAccess = [];
			var advisorAllAccess = [];
			
			session.modelAllAccess = modelAllAccess;
			session.modelLimitedAccess = modelLimitedAccess;
			
			session.portfolioAllAccess = portfolioAllAccess;
			session.portfolioLimitedAccess = portfolioLimitedAccess;
			
			session.advisorLimitedAccess = advisorLimitedAccess;
			session.advisorAllAccess = advisorAllAccess;				

			if(roleTypeId === 1){
				advisorAllAccess.push(1);
			}
			
			if(userAccess && userAccess.length > 0){
				userAccess.forEach(function(value){
					
					advisorLimitedAccess.push(value.teamId);
					if(value.modelAccess){
						modelLimitedAccess.push(value.teamId);
					}else if(value.modelAccess === 0){
						modelAllAccess.push(value.teamId);
					}
					
					if(value.portfolioAccess){
						portfolioLimitedAccess.push(value.teamId);
					}else if(value.portfolioAccess === 0){
						portfolioAllAccess.push(value.teamId);
					}
				});
			}
			next();
		})
	});
}

module.exports.getSpecificModelAccessForUser = function(req, res, next){
	
	var data = {
			reqId : req.data.reqId,
			userId : req.data.user.userId
	}
	var roleTypeId = req.data.user.roleTypeId;
	
	var dataIdTryingToAccess = req.params.id;
	data.id = dataIdTryingToAccess;
	
	var cacheObject = localCache.get(data.reqId);

	if(cacheObject){
		var session = cacheObject.session;
		if(roleTypeId == enums.roleType.FIRMADMIN || session.modelAllAccess.length > 0){
			return next();
		}
	}
	
	modelService.checkModelAccessToUser(data, function(err, status, rs){
		if(err){
			logger.error(err);
			return response(err, status,null,res);
		}
        if(rs && rs.length > 0){          	
        	next();
        }else{
        	return response(messages.modelNotFound, codes.NOT_FOUND, null, res);
        }

		
	})
}