var AWS = require('aws-sdk');
var config = require('config');
var awsConfig = config.env.prop.orion.aws;

AWS.config.update({accessKeyId: awsConfig.accessKeyId, secretAccessKey: awsConfig.secretAccessKey});
AWS.config.update({region: awsConfig.region});


module.exports.sns = new AWS.SNS();
module.exports.s3 = new AWS.S3();
module.exports.ses = new AWS.SES();