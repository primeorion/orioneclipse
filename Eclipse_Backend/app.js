"use strict";
global.appBasePath = __dirname;

require('app-module-path').addPath(appBasePath);

var moduleName = __filename;
var config = require("config");
var PORT = config.env.prop.port;
var redisConf = config.env.prop.orion.redis;

require('service/dbpool/DBPoolInitService.js');
var logger = require('helper/Logger.js')(moduleName);
var express = require('express');
var app = express();
var socket = require("socket.io");
var redisSocket = require('socket.io-redis');
var path = require("path");
var guid = require('guid');
var get_ip = require('ipware')().get_ip;
//var ses = require('helper/AwsSES.js')("asdasd");
/*
Mocked Connect api's
*/
app.use(require('mockapi/connect.js'));

/*
 * For documentation
*/

app.use(assignId)

function assignId(req, res, next) {
  req.correlationId = guid.create()
  var ip_info = get_ip(req);
  next()
}
app.use('/doc', express.static(path.join(__dirname, 'doc')));

require('middleware')(app);
require('controller')(app);
require('helper/Scheduler.js');
var io = null;

var startServer = function (app) {
	logger.info('Server Started at ' + PORT || 3001);
	var server = app.listen(PORT || 3001);
	io = socket.listen(server);
	//server.setTimeout(1000);
	server.on('clientError', function(err, socket){
		logger.error(" exceptional error ");
		logger.error(err);
		socket.end();
	});	
};

startServer(app);

if(!!io){
	io.adapter(redisSocket(redisConf))
	require('middleware/SocketsMiddleware.js')(io);
	require('controller/socket')(io);
}

//process.on('uncaughtException', function (err) {
//	logger.error("Got exception but handeled gracefully", err);
//});