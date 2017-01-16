"use strict";

var baseDao = require('dao/BaseDao');
var _ = require("lodash");

module.exports = {
		getAccountsSecuritiesTaxLotsForPortfolio : function(data, cb){
			
			var firmConnection = baseDao.getConnection(data);
			var portfolioId = data.portfolioId;
			firmConnection.query("CALL getAccountsSecuritiesTaxLotsForPortfolio(?)",portfolioId, function(err, rows){
				if(err){
					return cb(err);
				}
				cb(null, rows);
			});
		}
}