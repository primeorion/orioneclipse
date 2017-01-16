"use strict";

var _ = require("lodash");

var PORT = 3001;
var isPropGiven = false;

process.argv.forEach(function (val, index, array) {

	var arg = val.split("=");
	if (arg.length > 0) {
		if (arg[0] === 'env') {
			
			var env = require('./env/' + arg[1] + '.json');
			exports.prop = env;
			exports.name = arg[1];
			
			exports.sessionsecret = env.sessionsecret;
			
			PORT = env.port;
			isPropGiven = true;
		}else{
			/*
			 * for assigining other properties than env
			*/var obj = {};
			obj[arg[0]] = arg[1];
			_.assign(exports.prop, obj);
		}
		
	}
});

if(!isPropGiven){

	var env = require('./env/local.json');
	
	exports.prop = env;
	exports.name = 'local';
	exports.prop["console-log"] = true;
	exports.sessionsecret = env.sessionsecret;
	
	PORT = env.port;
}

