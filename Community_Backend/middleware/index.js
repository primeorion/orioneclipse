"use strict";

var moduleName = __filename;
var cors = require('cors');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path'); 
var config = require("config");

var corsOptions = require('config/cors.js').corsOptions;
var dbConnection = require('./DBConnection.js');
var authorization = require('./Authorization.js').authorization;
var hasPrivilege = require('./PrivilegeValidator.js').hasPrivilege;
var unique = require('helper').uniqueIdGenerator;
var localCache = require('service/cache').local;
var messages = config.messages;
var responseCodes = config.responseCodes;
var responseController = require("controller/ResponseController.js");
var logger = require('helper/Logger.js')(moduleName);

module.exports = function(app){	
	
	app.use(function(req,res,next){
		req.data = {};
		next();
	});
	app.use(cors(corsOptions));
	
	app.use(bodyParser.json());
	
	app.use(bodyParser.urlencoded({extended:true}));
	
	app.use(function(err, req, res, next){
			logger.error(err);
			return responseController(messages.internalServerError, responseCodes.BAD_REQUEST, null, res);			
	});

	/*
		req.reqId
	 	req.data.reqId
	*/
	app.use(function(req, res, next){
		var id = unique.get();
		req.reqId = id;
		req.data.reqId = id;
		var cacheObject = {};
		localCache.put(id, cacheObject);

		res.on('finish', function(){
			localCache.del(id);
		});

		next();
	});

	var apiWithoutAuthorization = [
		new RegExp('^\/v1\/admin\/token(\/)?$', 'i'),
		'/dev/updatePoolCluster',
		'/dev/localcache',
		'/dev/poolCluster',
		'/dev/temp'
	];
	var whiteListedApisForPrivilegeCheck = [];
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/admin\/logout(\/)?$', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/admin\/authorization\/user(\/)?$', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/admin\/token(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/admin\/privileges(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/tradeorder\/trades\/tradeExecutionType(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/admin\/advisors(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/preference\/levels(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/preference\/summary(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/dev\/updatePoolCluster(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/dev\/localcache(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/dev\/poolCluster(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/dev\/temp(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/admin\/aws\/firms(\/)?', 'i'));
	whiteListedApisForPrivilegeCheck.push(new RegExp('^\/v1\/dashboard\/admin\/summary(\/)?', 'i'));

	/*
		req.data.user
	 	localCache.session
	 	localCache.session.token
	*/
	app.use(authorization().unless({path : apiWithoutAuthorization}));

	app.use(dbConnection.firm().unless({path : apiWithoutAuthorization}));

//	app.use(hasPrivilege().unless({path : whiteListedApisForPrivilegeCheck}));
};
