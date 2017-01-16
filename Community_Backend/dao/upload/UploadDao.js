"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilDao = require('dao/util/UtilDao.js');
var config = require('config');

var messages = config.messages;
var responseCode = config.responseCode;
var uploadDao = function () {};

uploadDao.prototype.smallLogoUploader = function (req, res, cb) {
    var data = req.data;
    var id;
    var connection = baseDao.getCommunityDBConnection(data);
    var filePath = req.filesArray;
    var extArray = filePath[0].split('.');
    var fileName = filePath[0].split('/');
    fileName = fileName[fileName.length - 1];
    fileName = 'smallLogo'
    var displayName = '(NULL)';
    var description = '(NULL)';

    if( data.id ) {
        id = data.id;
    }else {
        id = req.data.user.userId;
    }
    if (req.body.name != undefined) {
        displayName = req.body.name;
    }

    if (req.body.description != undefined) {
        description = req.body.description;
    }

    var currentDate = utilDao.getSystemDateTime();
    var query = "";
     
    if( req.fileAttributeName == 'user') {
    query = "SELECT * FROM userDocument WHERE isDeleted=0 and userId=" + req.data.user.userId;
    } else if( req.data.id){
    query = "SELECT * FROM document WHERE isDeleted=0 and type = 1 and documentName = 'smallLogo' and strategistId=" + req.data.id;
    }
    connection.query(query, function(err, result){
    if( err ) {
        return cb(err);
    }
    logger.debug("input object " + [1, displayName, fileName, description, filePath[0], currentDate, id, id, currentDate, id]);
    var fileType = extArray[extArray.length - 1];
    var query = [];
    if( req.fileAttributeName == 'user') {
    query.push('INSERT into userDocument (type,displayName,documentName,description,path,createdDate,createdBy,userId,editedDate,editedBy) ');
    query.push('VALUES (?,?,?,?,?,?,?,?,?,?) ;');
    }else {
    query.push('INSERT into document (type,displayName,documentName,description,path,createdDate,createdBy,strategistId,editedDate,editedBy) ');    
    query.push('VALUES (?,?,?,?,?,?,?,?,?,?) ;');
    }
    query = query.join("");
    var input = [1, displayName, fileName, description, filePath[0], currentDate,id, id, currentDate, id];
    if( req.fileAttributeName == 'user' && result.length > 0) {
        var query = "UPDATE userDocument SET path= ?, editedDate = ? WHERE isDeleted=0 and userId= ?";
        input = [filePath[0], currentDate, id];
    } else if( req.data.id != null && result.length > 0) {
        var query = "UPDATE document SET path= ?, editedDate = ? WHERE isDeleted=0 and type = 1 and documentName = 'smallLogo' and strategistId= ?";
        input = [filePath[0], currentDate, req.data.id];
    }
    logger.error("final query is " + query);
    connection.query(query, input, function (err, inserted) {
            if (err) {
                logger.error('error on Upload logo ' + err);
                return cb(err);
            }
            return cb(null, inserted);
        });
    });
};

uploadDao.prototype.largeLogoUploader = function (req, res, cb) {
    var data = req.data;
    var strategistId = data.id;
    var connection = baseDao.getCommunityDBConnection(data);
    var filePath = req.filesArray;
    var extArray = filePath[0].split('.');
    var fileName = filePath[0].split('/');
    fileName = fileName[fileName.length - 1];
    fileName = 'largeLogo'
    var displayName = '(NULL)';
    var documentDescription = '(NULL)';
    var fileType = extArray[extArray.length - 1];
   // var query = [];
    var currentDate = utilDao.getSystemDateTime();
    var query = "";
     

    query = "SELECT * FROM document WHERE isDeleted=0 and type = 0 and documentName = 'largeLogo' and strategistId=" + req.data.id;

    connection.query( query, function( err, result) {

    var query = '';
    var inputArr = [];
    if(result && result.length > 0) {
        query = "UPDATE document SET path= ?, editedDate = ? WHERE isDeleted=0 and type = 0 and documentName = 'largeLogo' and strategistId= ?";
        inputArr = [filePath, currentDate, strategistId];
    }  else {
    query = [];
    query.push('INSERT into document (type,displayName,documentName,description,path,createdDate,createdBy,strategistId,editedDate,editedBy ) ');
    query.push('VALUES (?,?,?,?,?,?,?,?,?,?) ;');
    query = query.join("");
    inputArr = ['large-logo', displayName, fileName, documentDescription, filePath, currentDate, strategistId, strategistId, currentDate, strategistId];
    }
    logger.info("Upload large logo Query ", query);
    connection.query(query, inputArr, function (err, updated) {
        if (err) {
            return cb(err, false); //todo
        } else {
            return cb(null, true); //todo           
        }
    });
    });
};

uploadDao.prototype.documentUploader = function (req, res, cb) {
    var data = req.data;
    var strategistId = data.id;
    var connection = baseDao.getCommunityDBConnection(data);
    var filePath = req.filesArray;
    var extArray = filePath[0].split('.');
    var fileName = filePath[0].split('/');
    fileName = fileName[fileName.length - 1];
    var displayName = '(NULL)';
    var documentDescription = '(NULL)';
    var modelId = data.modelId || '(NULL)';
    if(data.modelId) {
        modelId = data.modelId;
    }
    if (req.body.name != undefined) {
        displayName = req.body.name;
    }

    if (req.body.description != undefined) {
        documentDescription = req.body.description;
    }
    var fileType = extArray[extArray.length - 1];
    var query = [];
    var currentDate = utilDao.getSystemDateTime();
    query.push('INSERT into document (type,displayName,documentName,description,path,createdDate,createdBy,strategistId,editedDate,editedBy,modelId) ');
    query.push('VALUES (?,?,?,?,?,?,?,?,?,?,?) ;');
    query = query.join("");
    logger.info("Upload document Query ", query);
    connection.query(query, ['document', displayName, fileName, documentDescription, filePath, currentDate, strategistId, strategistId, currentDate, strategistId,modelId], function (err, result) {
        if (err) {
            return cb(err, false); //todo
        } else {
            var documentId = result.insertId;
          //  var getDocumentQuery = 'SELECT * from document WHERE strategistId = ? and id = ?';
            var getDocumentQuery = 'SELECT DC.id AS id, DC.type AS TYPE,';
            getDocumentQuery += ' DC.displayName AS displayName, DC.documentName AS documentName,'; 
            getDocumentQuery += ' DC.description AS description, DC.path AS path,'; 
            getDocumentQuery += ' DC.strategistId AS strategistId, DC.createdDate AS createdDate, user.userLoginName AS createdBy,';
            getDocumentQuery += ' DC.editedDate AS editedDate, users.userLoginName AS editedBy, DC.modelId AS modelId,';
            getDocumentQuery += ' DC.isDeleted AS isDeleted';
            getDocumentQuery += ' FROM document AS DC'; 
            getDocumentQuery += ' LEFT OUTER JOIN `user` AS `user` ON DC.createdBy = `user`.id';  
            getDocumentQuery += ' LEFT OUTER JOIN `user` AS `users` ON DC.editedBy = `users`.id';
            getDocumentQuery += ' WHERE DC.id=' + documentId;
            // if(data.modelId) {
            //     getDocumentQuery += ' and modelId = ?';
            // }
            connection.query(getDocumentQuery, function (err, result) {
                return cb(err, result);
            });
        }
    });
};

uploadDao.prototype.modelUploader = function (req, res, cb) {
    var data = req.data;
    var strategistId = data.id;
    var connection = baseDao.getCommunityDBConnection(data);

    var fileName = req.file.originalname;
    var filePath = req.file.s3path;
    var extArray = fileName.split('.');
    var fileType = extArray[extArray.length - 1];

    var displayName = '(NULL)';
    var documentDescription = '(NULL)';

    if (req.body.name != undefined) {
        displayName = req.body.name;
    }

    if (req.body.description != undefined) {
        documentDescription = req.body.description;
    }
    var query = [];
    var currentDate = utilDao.getSystemDateTime();
    query.push('INSERT into document (type,displayName,documentName,description,path,createdDate,createdBy,strategistId,editedDate,editedBy ) ');
    query.push('VALUES (?,?,?,?,?,?,?,?,?,?) ;');
    query = query.join("");
    logger.info("Upload model Query ", query);
    connection.query(query, ['model', displayName, fileName, documentDescription, filePath, currentDate, strategistId, strategistId, currentDate, strategistId], function (err, updated) {
        if (err) {
            return cb(err, false); //todo
        } else {
            return cb(null, true); //todo           
        }
    });

};

uploadDao.prototype.deleteDocument = function (req, res, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);
    var strategistId = data.id;
    var documentId = data.documentId;
    if (documentId == undefined) {
        return cb(messages.documentIdMissing, responseCode.BAD_REQUEST, null);
    }
    var currentDate = utilDao.getSystemDateTime();
    var query = 'UPDATE document SET isDeleted = 1, editedBy=?, editedDate=?  WHERE id = ? and strategistId = ?';

    if(data.modelId) {
       query += ' and modelId=' + data.modelId;
    }

    logger.info("Delete document Query ", query);
    connection.query(query, [data.user.userId, currentDate, documentId, strategistId], function (err, result) {
        if( err ){
            return cb(err);
        }
        return cb(null, result);
    });
};

uploadDao.prototype.verifyDocument = function (req, res, cb) {
    var data = req.data;
    var connection = baseDao.getCommunityDBConnection(data);

    var strategistId = data.id;
    var documentName = data.documentName;


    if (documentName == undefined) {
        return cb(null, responseCode.BAD_REQUEST, messages.documentNameNotFound, null);
    }
    var currentDate = utilDao.getSystemDateTime();
    var query = 'SELECT * FROM document WHERE documentName = ? and isDeleted = 0';

    if( strategistId ) {
       query += ' and strategistId=' + strategistId;
    }

    if( data.modelId ){
       query += ' and modelId=' + data.modelId;
    }

    logger.info("Verify document Query ", query);
    connection.query(query, [documentName], function (err, result) {
        return cb(err, result);
    });
};

module.exports = uploadDao;