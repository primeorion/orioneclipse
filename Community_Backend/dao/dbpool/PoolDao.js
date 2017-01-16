"use strict";

var moduleName = __filename;

var poolCluster = require('dao/dbpool/Init.js').poolCluster;
var logger = require('helper').logger(moduleName);

module.exports = {
	getAllFirms : function(cb){
		poolCluster.getConnection('common', function (err, connection) {
			if(err) {
				logger.error("Error in getting DB connection for common DB",err);
				return;
				//return process.exit(1);
			}
			
			var sqlQuery = "SELECT * FROM firm"; 
			connection.query(sqlQuery, function(err, rows){
				connection.release();
				if(err){
					logger.error("Error in fetching firm data", err);
					return;
					//return process.exit(1);
				}
				return cb(err, rows);
			});
		});			
	}
}
