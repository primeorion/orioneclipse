"use strict";

var moduleName = __filename;

var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var TradeFilesDao = function () { }

//Get Trade Files List
TradeFilesDao.prototype.getTradeFilesList = function (data, cb) {
    var connection = data.connection ? data.connection : baseDao.getConnection(data);
    var query = 'SELECT tf.id, tf.name, tf.format, tf.path, tf.status, tf.isDeleted, tf.createdDate, ';
    query = query + ' u.userLoginId as createdBy, tf.editedDate,u.userLoginId as editedBy ';
    query = query + 'FROM tradeFiles as tf ';
    query = query + ' LEFT OUTER JOIN `user` AS u ON tf.createdBy = u.id AND tf.editedBy = u.id ';
    query = query + ' WHERE DATE(tf.createdDate) =  "' + data.fromDate + '" AND tf.isDeleted = 0 ';
    query = query + ' ORDER BY tf.createdDate DESC';

    logger.debug("Get Trade Files list query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Update Trade Files List Status
TradeFilesDao.prototype.updateTradeFilesStatus = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);

    var queryData = {
        "status": 1,
        "editedDate": currentDate,
        "editedBy": userId
    }

    var query = 'UPDATE `tradeFiles` SET ? WHERE `id` = ? AND isDeleted = 0 ';

    logger.debug("Update Trade Files status query: " + query);
    connection.query(query, [queryData, data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Get Trade Files details by Id
TradeFilesDao.prototype.getDetailsById = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = 'SELECT tf.id, tf.name, tf.format, tf.path, tf.status, tf.isDeleted, tf.createdDate, ';
    query = query + ' u.userLoginId as createdBy, tf.editedDate, u.userLoginId as editedBy ';
    query = query + ' FROM `tradeFiles` as tf ';
    query = query + ' LEFT OUTER JOIN `user` AS u ON tf.createdBy = u.id AND tf.editedBy = u.id ';
    query = query + ' WHERE tf.id = ? AND tf.isDeleted = 0 ';
    logger.debug("Get Trade Files details query: " + query);
    connection.query(query, [data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result[0]);
    });
};

//Delete Trade Files by Id
TradeFilesDao.prototype.deleteTradeFile = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);

    var queryData = {
        "isDeleted": 1,
        "editedDate": currentDate,
        "editedBy": userId
    }

    // var query = 'UPDATE `tradeFiles` SET ? WHERE `id` = ? AND isDeleted = 0 ';
    var query = 'UPDATE `tradeFiles` SET ? WHERE  isDeleted = 0 ';
    query = query + ' AND ( `id` = ? OR `name` IN ("' + data.firstTradeFileName + '"';
    if (data.secondTradeFileName) {
        query = query + ' , "' + data.secondTradeFileName + '" ';
    }
    query = query + ' )) ';
    logger.debug("Delete Trade File query: " + query);
    connection.query(query, [queryData, data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Removes Trade File from Trades 
TradeFilesDao.prototype.removeTradeFileFromTrades = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var queryData = {
        "t.approvalStatusId": 1,
        "t.allocationStatusId": null,
        "t.orderStatusId": null,
        "t.tradeFileId": null,
        "t.editedDate": currentDate,
        "t.editedBy": userId
    }
    var query = 'UPDATE `trades` AS t ';
    if (data.finalName) {
        query = query + ' JOIN tradeFiles AS tf ON t.tradeFileId = tf.id ';
    }
    query = query + ' SET ? WHERE t.isDeleted = 0 AND  ( t.`tradeFileId` = ? ';

    if (data.finalName) {
        query = query + ' OR tf.name = "' + data.finalName + '" ';
    }
    query = query + ' ) ';
    logger.debug("Remove Trade File from trades query: " + query);
    connection.query(query, [queryData, data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

TradeFilesDao.prototype.saveTradeFilesInfo = function (data, cb) {
    // var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var self = this;

    var queryData = {
        name: data.fileName,
        format: data.custodianName + " " + data.fileType,
        path: data.relativePath,
        status: 0,
        isDeleted: 0,
        createdBy: userId,
        createdDate: currentDate,
        editedBy: userId,
        editedDate: currentDate
    };

    var query = 'INSERT tradeFiles SET ? ';

    logger.debug("Insert Trade File from trades query: " + query);
    data.connection.query(query, queryData, function (err, result) {
        if (err) {
            logger.error("Error in inserting Trade File from trades" + err);
            return cb(err);
        }
        // if (result && result.insertId & data.tradeIds.length > 0) {
        //     data.tradeFileId = result.insertId;
        //     self.updateTradesByTradeFiles(data, data.connection, function(err, response) {
        //         if (err) {
        //             logger.error(err);
        //             return cb(err);
        //         }
        //         return cb(null, result.insertId)
        //     });
        else {
            return cb(null, result);
        }
    });
};

TradeFilesDao.prototype.updateTradesByTradeFiles = function (data, cb) {
    // var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var queryData = {
        allocationStatusId: 3,
        orderStatusId: 4,
        editedBy: userId,
        editedDate: currentDate,
        tradeFileId: data.tradeFileId
    };

    var query = 'UPDATE trades  SET ? WHERE isDeleted = 0 ';
    query = query + ' AND id IN ( ' + data.tradeIds + ' ) ';
    logger.debug("Update Trade File entry in trades table: " + query);
    data.connection.query(query, queryData, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

module.exports = TradeFilesDao;