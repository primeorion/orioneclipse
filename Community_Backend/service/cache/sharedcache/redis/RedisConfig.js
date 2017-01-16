"use strict";

var moduleName = __filename;
var redisConf = require('config').env.prop.orion.redis;
var logger  = require("helper/Logger.js")(moduleName);

var redis = require("redis"),
client = redis.createClient(redisConf);


client.on('ready', function(){
	logger.info("Connected to redis Successfully");
});

client.on("error", function (err) {
	logger.error("Error in redis client " + err);
});


process.on('customerror', function (err) {
	logger.error("Error in redis connection " + err);
	client.quit();
});

module.exports = client;