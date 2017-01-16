"use strict";

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

describe("cache Connectivity", function(){
	it("redis Connectivity check", function(done){
		this.timeout(15000);
		var redisConf = require('config').env.prop.orion.redis;
		
		var redis = require("redis"),
		client = redis.createClient(redisConf);
		
		client.on("error", function (err) {
			expect(err).to.be.undefined;
		});
		
		client.on('ready', function(){
			done();
		});
	});	
})
	    
