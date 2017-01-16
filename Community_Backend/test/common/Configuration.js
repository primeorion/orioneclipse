"use strict";

//require('startup');

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
//var mysql = require('mysql');

var testUtils = require('test/util/Utils.js');

describe('ENV.json file', function() {
	describe('Checking application configuration variables', function () {

		it('Environment variable be present in config', function () {
				var env = require('config').env;
				expect(env).to.contains.all.keys('name' , 'prop', 'sessionsecret');
				testUtils.failOnNullandUndefinedValueInObject(env);
	    });

	    it('CommonDatabase configuration variables should be present', function(){
				var env = require('config').env.prop;
				var db = env.orion.db;
				testUtils.dbConfigurationCheck(db, 'database');
				//expect(db).to.contains.all.keys('pools');
				testUtils.failOnNullandUndefinedValueInObject(db);
	    });
	    
	    //it('FirmsDatabase configuration should be present', function () {
	    //	var pools = require('config').env.prop.orion.db.pools;
	    //	pools = !! pools ? pools : {};
        //
			//testUtils.failOnNullandUndefinedValueInObject(pools);
        //
	    //	for(var pool in pools){
	    //		pool = pools[pool];
			//	testUtils.dbConfigurationCheck(pool.config);
	    //		expect(pool.db).to.be.instanceof(Array);
	    //	}
	    //
	    //});
	});
});
