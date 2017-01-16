/**
 * 
 */
var fs = require("mkdirp");
var multer  = require('multer');

var config = require("config");

var env = config.env;
var uploadFileDirectory = env.prop["uploaded-temp-path"];

fs.sync(uploadFileDirectory);

var storage = multer.diskStorage({
	destination : function(req, file, cb){
		return cb(null, uploadFileDirectory);
	},filename : function(req, file, cb){
		return cb(null, req.reqId);
	}
});

var upload = multer({storage : storage});

module.exports = upload;