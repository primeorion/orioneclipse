"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');

var UtilDao = function(){}

UtilDao.prototype.getNextSeqId = function(data, cb) {
	var firmConnection = baseDao.getConnection(data);
	var queryData = {
		entityName : data.entityName
	};
	var selectQuery = 'SELECT * from entityIdSequence WHERE entityName = ?';
	logger.debug("Query :" + query);
	firmConnection.query(selectQuery, [ queryData.entityName ], function(err, data) {
		if (err) {
			logger.error(err)
			return cb(err);
		}
		return cb(null, data);
	});
};

UtilDao.prototype.storeNextSeqId = function(data, cb) {
	var firmConnection = baseDao.getConnection(data);
	var queryData = {
		entityName : data.entityName,
		seqId : data.seqId
	};
	var insertQuery = 'INSERT INTO entityIdSequence SET ? ';
	firmConnection.query(insertQuery, queryData, function(err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
};

UtilDao.prototype.updateNextSeqId = function(data, cb) {
	var firmConnection = baseDao.getConnection(data);
	var queryData = {
		entityName : data.entityName,
		seqId : data.seqId
	};
	var updateQuery = 'UPDATE entityIdSequence SET ? WHERE seqId = ? ';
	
	firmConnection.query(updateQuery, [ queryData, data.prevSeqId ], function(err, data) {
		if (err) {
			return cb(err);
		}
		return cb(null, data);
	});
};

UtilDao.prototype.getSystemDateTime = function(date) {
	Date.prototype.getFromFormat = function(format) {
		var yyyy = this.getFullYear().toString();
		format = format.replace(/yyyy/g, yyyy);
		var mm = (this.getMonth()+1).toString(); 
		format = format.replace(/mm/g, (mm[1]?mm:"0"+mm[0]));
		var dd  = this.getDate().toString();
		format = format.replace(/dd/g, (dd[1]?dd:"0"+dd[0]));
		var hh = this.getHours().toString();
		format = format.replace(/hh/g, (hh[1]?hh:"0"+hh[0]));
		var ii = this.getMinutes().toString();
		format = format.replace(/ii/g, (ii[1]?ii:"0"+ii[0]));
		var ss  = this.getSeconds().toString();
		format = format.replace(/ss/g, (ss[1]?ss:"0"+ss[0]));
		
		return format;
	};

	if (date) {
		return date.getFromFormat('yyyy-mm-dd hh:ii:ss');
	}
	return new Date().getFromFormat('yyyy-mm-dd hh:ii:ss');
//	return new Date().toUTCString();
};
	
module.exports = new UtilDao();