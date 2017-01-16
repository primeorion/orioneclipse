var S3Latest = require('s3-latest');
var config = require('config');
var awsConfig = config.env.prop.orion.aws;

process.env["AWS_ACCESS_KEY_ID"] = awsConfig.accessKeyId;
process.env["AWS_SECRET_ACCESS_KEY"] = awsConfig.secretAccessKey;

module.exports.getLatestKeyForFirm = function(orionConnectFirmId, cb){
	var configuration = {
	  bucket: 'orioneclipse',
	  prefix:'extracts/test/1200',
	  before: new Date()
	}
	S3Latest.stream(configuration, function(err, backup) {
	if(err){
		console.error(err.toString());
		return cb(err);
	} 
	var key = backup.Key;
	var n = key.lastIndexOf('/');
	var resultPath = key.substring(0,n);
	var finalResult = null;
	if(resultPath){
		var resultPathArray = resultPath.split("/");
		finalResult = resultPathArray[4]+"/"+resultPathArray[5]+"/"+resultPathArray[3];
	}
	return cb(null, finalResult);
	});
}
