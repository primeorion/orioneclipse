"use strict";

var moduleName = __filename;

var localCache = require('service/cache').local;
var commonDBName = require('config').env.prop.orion.db.database;
var poolCluster = require('dao/dbpool/Init.js').poolCluster;
var dbToPoolMap = require('dao/dbpool/Init.js').dbPoolMap;
var logger = require('helper').logger(moduleName);
var poolService = require('service/dbpool/PoolService');
var util = require('util');

var poolDao = require("dao/dbpool/PoolDao.js");


poolDao.getAllFirms(function (err, rows) {
	var orionConnectFirmList = {};
	for (var i = 0; i < rows.length; i++) {
		var value = rows[i];
		/*
		 * FIRM_ID ==== FIRM_DATABASE_NAME
		 */
		//localCache.put(row["orionEclipseFirmId"], row["database"]);
		var rTurn = {};
		rTurn["poolName"] = value.server;
		rTurn["database"] = value.database;
		var userNameAndPassword = poolService.configurationDecoder(value, ['username', 'password']);
		rTurn["user"] = userNameAndPassword.username;
		rTurn["password"] = userNameAndPassword.password;

		if (rTurn["database"] && rTurn["user"] && rTurn["password"]) {
			localCache.put(value["orionEclipseFirmId"], rTurn);
		}
		orionConnectFirmList[value.orionConnectFirmId] = value.orionEclipseFirmId;
	}
	localCache.put("orionConnectFirmList", orionConnectFirmList);
});

//localCache.put("dbToPoolMap", dbToPoolMap);
localCache.put("poolCluster", poolCluster);
logger.debug("Local cache Data " + localCache.keys());