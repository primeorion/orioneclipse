/**
 * Logger file
 */
"use strict";

var fs = require('fs');
var winston = require('winston');

var config = require('config');
var env = config.env.name;
var logDirectory = !!config.env.prop["logging-path"] ? config.env.prop["logging-path"] : './log';
var loggingLevel = !!config.env.prop["log-level"] ? config.env.prop["log-level"] : 'error';
var consoleLogging = config.env.prop["console-log"] ? config.env.prop["console-log"] : false;

var logger = null;

if(!consoleLogging){
	fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
	logger = new winston.Logger({
				transports : 
						[	new (require('winston-daily-rotate-file'))({
																name : 'normal',
																datePattern : 'yyyy-MM-dd-',
																prepend : true,
																filename: logDirectory + '/info.log',
																colorize: true}),
							new (require('winston-daily-rotate-file'))({
																name : 'error',
																datePattern : 'yyyy-MM-dd-',
																prepend : true,
																filename: logDirectory + '/error.log',
																level : 'error',
																colorize: true})
						]
		});
//	winston.add(winston.transports.File, { filename: 'somefile.log' });
}else{
	logger = new winston.Logger().add(winston.transports.Console, {colorize: true});
}


var customLogger = function(moduleName){
	this.moduleName = moduleName;
	var self = this;
	for(var i in logger){
		if(logger.hasOwnProperty(i)){
			(function(i){
				self[i] = function(msg, meta){
					if(meta){
						logger[i](moduleName, msg, meta);						
					}else{
						logger[i](moduleName, msg);
					}
				};				
			})(i);
		}
	}
};

logger.level = loggingLevel ;
module.exports = function(moduleName){
	return new customLogger(moduleName);
}
