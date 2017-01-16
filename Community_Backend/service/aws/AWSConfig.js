"use strict";

var moduleName = __filename;

var aws = require("aws-sdk");
var config = require("config");
var AWSConfig = config.env.prop.orion.aws;

var logger = require("helper").logger(moduleName);
aws.config.update(AWSConfig)

module.exports = aws;



