/**
 * Orion mock api's file
 *
 * Created just in case when actual orion connect api's are down
 */

"use strict";

var app = require('express')();
var logger = require('helper').logger(__filename);
var jwtServiceClass = require('service/admin/JwtService');
var jwtService = new jwtServiceClass();
var httpResponseCode = require('config').responseCodes;

var moduleName = "Connect.js";

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/connect/getToken', function(req, res){
	logger.info("Connect dummy api called for token");
	var user = {
			dummy:''
	};
	jwtService.sign(user, function(err, token){
		if(err){
			logger.error(err);
			res.status(httpResponseCode.INTERNAL_SERVER_ERROR).send({});
		}
		setTimeout(function(){
			res.send({"access_token" : token, "expires_in" : 3600});			
		}, 10);
	});
});

app.get('/connect/security', function(req, res){
	logger.info("Connect dummy api called for token");
	var user = {
			dummy:''
	};
	var searchKeyword = req.query.search ? req.query.search : "temp name";
	
	res.json([{
	        	    "productId": 20120,
	        	    "ticker": "AAPL",
	        	    "productName": "Apple Inc",
	        	    "productType": 4
	          }]);
});

app.get('/connect/getUser', function(req, res){
	logger.info("Connect dummy api called for user");
	res.send({userId : 370925, firmId: 999});
});

module.exports = app;