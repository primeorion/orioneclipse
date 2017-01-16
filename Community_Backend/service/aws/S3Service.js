"use strict";
var moduleName = __filename;

var aws = require('./AWSConfig.js');
var Config = require("config");
var logger = require("helper").logger(moduleName);

var Messages = Config.messages;
var ResponseCode = Config.responseCode;
var OrionConstants = Config.orionConstants;
var s3Options = OrionConstants.aws.s3;

var s3 = new aws.S3();

module.exports = {
	getContentInFolder : function(obj, cb){
		var bucketName = s3Options.BucketName;
		var BaseFolderForFirms = s3Options.BaseFolderForFirms;
		var respObj = {};
		s3.listObjects({Bucket : bucketName, Prefix: BaseFolderForFirms, Delimiter : '/'}, function(err, data){
			if(err){
				logger.error(err);
				cb(Messages.internalServerError, ResponseCode.INTERNAL_SERVER_ERROR);
			}else{
				var folderObjectList = data.CommonPrefixes;
				var folderObjectResponseList = [];
				folderObjectList.forEach(function(value, data){
					var folderPath = value.Prefix;
					var folderNameArr = folderPath.split('/');
					var length = folderNameArr.length;
					var folderName = folderNameArr[length - 2];
					folderObjectResponseList.push(folderName);
				});
				respObj.firms = folderObjectResponseList;
				cb(null, ResponseCode.SUCCESS, respObj);
			}
		});
	}
}