"use strict";

var moduleName = __filename;

var multer = require('multer');
var multerS3 = require('multer-s3');
var helper = require('helper');
var config = require('config');
var s3 = require('helper/AwsSdkConnect.js').s3;
var responseController = require("controller/ResponseController.js");

var constants = config.orionConstants;
var s3Properties = config.env.prop.orion.aws.s3;
var logger = helper.logger(moduleName);

var maxSize = 1 * 1000 * 1000;
module.exports.upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: s3Properties.bucket,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: 'public-read',
		metadata: function (req, file, cb) {
			logger.debug("the file is"+JSON.stringify(file));
			var obj = {};
			obj = req.body;
			return cb(null, obj);
		},
		key: function (req, file, cb) {
			var contextPath = "eclipse/"+req.data.user.firmId+"/";
			var originalFileName = file.originalname; 
			var fileName = originalFileName.split('.');
			var fileExtention = '.' + fileName[fileName.length - 1];
			var s3ObjectKey = req.uploadContext+'/'+req.data.user.firmId;
			if(req.uploadContent === "FIRM_LOGO"){
				s3ObjectKey = s3ObjectKey+'/'+originalFileName;
			}else if(req.uploadContent === "USER_LOGO"){
				s3ObjectKey = s3ObjectKey+'/'+req.data.user.userId+'/'+originalFileName;
			}else{
				s3ObjectKey = s3ObjectKey+'/'+originalFileName;
			}
			req.filePath = s3ObjectKey;
			logger.debug("the user in request is "+JSON.stringify(req.data))
			return cb(null, s3ObjectKey);
		}
	}),
	 limits: { fileSize: maxSize },
	 fileFilter: function (req, file, cb) {
	 	logger.debug("inside file filter "+JSON.stringify(file));
	 	if(file.fieldname !== "logo"){
	 		logger.debug("Logo field is missing");
	 		return cb("Logo input field is missing", false);
	 	}else if(file.length > maxSize) {
	 		logger.debug("File size is greater then 1MB so cant upload");
	 		return cb("File size is more then 1 MB",false);
	 	}else{
	 	 return cb(null, true);
	 	}
	 }
});

module.exports.getUrl = function(filePath,cb){
	var params = {
        Bucket: s3Properties.bucket,
        Key: filePath
    };
	s3.getSignedUrl('getObject', params, function (err, url) {
		if(err){
			logger.debug("Error in get signed url"+err);
			return cb(err,500);
		}
		return cb(null, 200, {"url":url});
	});
}
module.exports.fileServeMiddleware = function(uploadContent,uploadContext) {
    return function (req, res, next) {
        req.uploadContext = uploadContext;
        req.uploadContent = uploadContent;
        next();
    }
}

module.exports.getLatestKeyInBucket = function(){
	var params = {
  Bucket: 'orioneclipse', 
  /*Delimiter: '/',
  EncodingType: 'url',*/
  //Marker: '2016',
  //MaxKeys: 0,
  Prefix: 'extracts/test/1200',
  StartAfter: 'extracts/test/1200'
  //RequestPayer: 'requester'
};
s3.listObjectsV2(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
}