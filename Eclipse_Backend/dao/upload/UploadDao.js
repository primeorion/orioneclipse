"use strict";

var moduleName = __filename;

var logger  = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');

var uploadDao = function () { };

uploadDao.prototype.smallLogoUploader = function (req,res, cb) {
    var data = req.data;
    var strategistId = req.params.strategistId;
    var connection = baseDao.getCommunityDBConnection(data);
    var filePath = req.filesArray;
    var extArray = filePath[0].split('.');
    var fileName = filePath[0].split('/');
        fileName = fileName[fileName.length -1];
        
    var fileType = extArray[extArray.length -1];
        var query = [];
        var currentDate = utilDao.getSystemDateTime();
            query.push('INSERT into uploadDetails (name,path,category,strategistId,strategistUserId,createdBy,createOn,editedBy,editedOn,description,type,isDeleted) ');
            query.push('VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ;');
            query = query.join("");
            logger.info("Upload small Logo Query", query);
            connection.query(query, [ fileName,filePath,'logo',parseInt(req.params.strategistId),parseInt(req.data.id), parseInt(req.data.id), currentDate, parseInt(req.data.id), currentDate, 'small-logo',fileType, 0], function (err, updated) {
            if (err) {
                return cb(false); //todo
            }else{
                return cb(true);  //todo           
            }
        });
};

uploadDao.prototype.largeLogoUploader = function (req,res, cb) {
    var data = req.data;
    var strategistId = req.params.strategistId;
    var connection = baseDao.getCommunityDBConnection(data);
    var filePath = req.filesArray;
    var extArray = filePath[0].split('.');
    var fileName = filePath[0].split('/');
        fileName = fileName[fileName.length -1];
        
    var fileType = extArray[extArray.length -1];
        var query = [];
        var currentDate = utilDao.getSystemDateTime();
            query.push('INSERT into uploadDetails (name,path,category,strategistId,strategistUserId,createdBy,createOn,editedBy,editedOn,description,type,isDeleted) ');
            query.push('VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ;');
            query = query.join("");
            logger.info("Upload large Logo Query", query);
            connection.query(query, [ fileName,filePath,'logo',parseInt(req.params.strategistId),parseInt(req.data.id), parseInt(req.data.id), currentDate, parseInt(req.data.id), currentDate, 'large logo',fileType, 0], function (err, updated) {
            if (err) {
                return cb(false); //todo
            }else{
                return cb(true);  //todo           
            }
        });
};

uploadDao.prototype.documentUploader = function (req,res, cb) {
    var data = req.data;
    var strategistId = req.params.strategistId;
    var connection = baseDao.getCommunityDBConnection(data);
    var filePath = req.filesArray;
    var extArray = filePath[0].split('.');
    var fileName = filePath[0].split('/');
        fileName = fileName[fileName.length -1];
        
    var fileType = extArray[extArray.length -1];
        var query = [];
        var currentDate = utilDao.getSystemDateTime();
            query.push('INSERT into uploadDetails (name,path,category,strategistId,strategistUserId,createdBy,createOn,editedBy,editedOn,description,type,isDeleted) ');
            query.push('VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ;');
            query = query.join("");
            logger.info("Upload document Query ", query);
            connection.query(query, [fileName,filePath,'document',parseInt(req.params.strategistId),parseInt(req.data.id), parseInt(req.data.id), currentDate, parseInt(req.data.id), currentDate, 'document description',fileType, 0], function (err, updated) {
            if (err) {
                return cb(err, false); //todo
            }else{
                return cb(null,true);  //todo           
            }
        });
};

uploadDao.prototype.modelUploader = function (req,res, cb) {
    var data = req.data;
    var strategistId = req.params.strategistId;
    var connection = baseDao.getCommunityDBConnection(data);
    var filePath = req.filesArray;
    var extArray = filePath[0].split('.');
    var fileName = filePath[0].split('/');
        fileName = fileName[fileName.length -1];
        
    var fileType = extArray[extArray.length -1];
        var query = [];
        var currentDate = utilDao.getSystemDateTime();
            query.push('INSERT into uploadDetails (name,path,category,strategistId,strategistUserId,createdBy,createOn,editedBy,editedOn,description,type,isDeleted) ');
            query.push('VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ;');
            query = query.join("");
            logger.info("Upload model Query ", query);
            connection.query(query, [fileName,filePath,'model',parseInt(req.params.strategistId),parseInt(req.data.id), parseInt(req.data.id), currentDate, parseInt(req.data.id), currentDate, 'model description',fileType, 0], function (err, updated) {
            if (err) {
                return cb(err, false); //todo
            }else{
                return cb(null,true);  //todo           
            }
        });
    
};
module.exports = uploadDao;   