"use strict";

var baseDao = require('dao/BaseDao');
/*
 *
 *
 * 
*/
function dbAssociationChecker(inputJson, keyValidators){
	var message = null;
	var status = null;
	var reqId = inputJson.reqId;
	var connection = baseDao.getConnection(reqId);
	
	keyValidators.forEach(function(value){
		inputJson(value.key);
	})
}