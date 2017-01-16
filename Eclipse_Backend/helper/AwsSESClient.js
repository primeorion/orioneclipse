"use strict";

var moduleName = __filename;
var awsSesMail = require('aws-ses-mail');
var config = require('config');
var awsConfig = config.env.prop.orion.aws;
var logger = require('helper/Logger.js')(moduleName);
var sesMail = new awsSesMail();
var sesConfig = {
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region
};
sesMail.setConfig(sesConfig);

var from = awsConfig.ses.senderMail;

module.exports = function(data){
	var options = {
	  from: from,
	  to: data.toList,
	  subject: data.emailArgs.subject,
	  template: data.emailTemplate,
	  templateArgs: data.emailArgs
	};
 
	sesMail.sendEmailBatchByHtml(options, function(data) {
	    logger.info("Email sent : "+JSON.stringify(data));
	});
}