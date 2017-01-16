"use strict";
//It will import all controllers in it

var moduleName = __filename;

var config = require('config');

var response = require('./ResponseController.js');
var logger = require('helper').logger(moduleName); 

var httpResponseCodes = config.responseCodes;
var messages = config.messages;

module.exports = function(app){

	app.use('/v1', require('./v1.js'));
	app.use('/dev', require('./dev/AppManagerController.js'));
	
	app.use(function(err, req, res, next) {
		if (err.name === 'JsonSchemaValidation') {
			logger.debug("Error here is"+JSON.stringify(err));
			logger.info(err.validations);
			var validationErrorMessages = [];

			var validationErrors = null;
			if(err.validations.body){
				validationErrors = err.validations.body;
			}else{
				validationErrors = err.validations.params;
			}
			(validationErrors).forEach(function(validationError){
				var validationMessage = '';
					var propertys = validationError.property.split(".");
					var propertyLength = propertys.length;
					var property = propertys[propertyLength-1]
					if(validationError.messages.length > 0){
						validationMessage = validationMessage+""+property+" "+validationError.messages.toString() + " ";					
						validationErrorMessages.push(validationMessage);
					}

				});
			return response(null, httpResponseCodes.BAD_REQUEST, {message:validationErrorMessages}, res);
		} else {
			return next(err);
		}
	});

};

