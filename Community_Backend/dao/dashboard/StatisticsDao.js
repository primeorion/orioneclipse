/**
 * 
 */
"use strict";

var baseDao = require('dao/BaseDao');
var _ = require("lodash");

module.exports = {
		getDashboardSummary : function(data, cb){
			
			var firmConnection = baseDao.getConnection(data);
			var currentUserId = data.data.user.userId;

			firmConnection.query("CALL getDashboardSummary(?)",currentUserId, function(err, rows){
				if(err){
					return cb(err);
				}
				
				var rTurn = {};
				if(rows && rows.length > 0){
					rows.forEach(function(value, index){
						if(value && value.length > 0){
							_.assign(rTurn, value[0]);							
						}
					});		
					cb(null, rTurn);
				}
			});
		}
}