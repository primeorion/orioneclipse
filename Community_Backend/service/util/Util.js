 "use strict";

 var moduleName = __filename;
 var helper = require('helper');
 var utilDefault = require('util');
 var logger = helper.logger(moduleName);
 var config = require('config');
 var asyncLoop = require('node-async-loop');
 var asyncFor = helper.asyncFor;
 var messages = config.messages;
 var responseCode = config.responseCode;
 var request = require("request");
 var eclipseProperties = config.env.prop.orion["eclipse"];
 var _ = require('underscore');
 var constants = config.orionConstants;
 var env = config.env.prop;
 var node_ssh = require('node-ssh');
 var shell = require('shelljs/global');
 var poolService = require('service/dbpool/PoolService.js');
 var ssh = new node_ssh();

 var UserDao = require('dao/community/UserDao.js');
 var userDao = new UserDao();

 var ModelDao = require('dao/community/ModelDao.js')
 var modelDao = new ModelDao();

 var StrategistDao = require('dao/community/StrategistDao.js');
 var strategistDao = new StrategistDao();

 var util = function () {};
 var userRoleEnum = {
     1: 'Super Admin',
     2: 'Strategist Admin',
     3: 'Strategist User'
 }

 util.prototype.getUserFirm = function (inputData, userDetails, cb) {
     logger.debug('get the list of firms of users');
     strategistDao.getFirmDetailsFromCommon(inputData, [userDetails[0].eclipseDatabaseId], function (err, firmDetails) {
         if (err) {
             return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
         }
         return cb(null, responseCode.SUCCESS, firmDetails);
     });
 }

 util.prototype.getEclipseUserRoles = function (inputData, eclipseToken, cb) {
     var self = this;
     logger.debug('token is ' + eclipseToken);
     var authorizationHeaders = "Session " + eclipseToken;
     var url = {
         url: 'http://' + eclipseProperties.host + ':' + eclipseProperties.port + '/v1/admin/authorization/user',
         headers: {
             'Authorization': authorizationHeaders
         },
         timeout: 36000
     };
     request.get(url, function (err, response, body) {
         if (response.statusCode != 200) {
             return cb(response.body.message, response.statusCode, response.body.message);
         } else {
             var parsedBody = JSON.parse(body);
             return cb(null, responseCode.SUCCESS, parsedBody);
         }
     });
 }

 util.prototype.modelUpdateNotificationJob = function (inputData, cb) {
     logger.debug('model update notification job service called (modelUpdateNotificationJob)');
     var self = this;
     /*
         steps to be followed :-
         1. get model detail to get the strategist
         1. check if the model is subscribed to any Firm
         2. get the firm details like username, password, host
         3. get common db connection details
         4. get communityDB connection details
         5. run the job.
     */
     self.getModelInfo(inputData, function (err, modelDetails) {
         if (err) {
             logger.debug('ETL JOB: error in get model details during notification ' + err);
             return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
         }
         if (modelDetails && modelDetails.length > 0) {
             inputData.communityStrategistId = modelDetails[0].strategistId;
             strategistDao.getStrategistFirm(inputData, inputData, function (err, strategistFirmDetails) {
                 if (err) {
                     logger.debug('ETL JOB: error in get strategist firms during notification ' + err);
                     return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                 }
                 if (strategistFirmDetails && strategistFirmDetails.length > 0) {
                     var onlySubscribedFirm = strategistFirmDetails.filter(function (item) {
                         return item.isSubscribed == 1
                     });
                     var firmIds = _.pluck(onlySubscribedFirm, 'firmId');
                     if (onlySubscribedFirm && onlySubscribedFirm.length > 0) {
                         self.runModelUpdateJob(inputData, firmIds, function(err, modelUpdateResult){
                             if(err){
                                 return cb(err);
                             }
                             return cb(null, responseCode.SUCCESS);
                         });
                     } else {
                         logger.debug('ETL JOB: No subscribed firms found');
                         return cb(null, responseCode.SUCCESS);
                     }
                 } else {
                     logger.debug('ETL JOB: No strategist  firm details found');
                     return cb(null, responseCode.SUCCESS);
                 }
             });
         } else {
             logger.debug('ETL JOB: No model details found');
             return cb(messages.modelNotFound, responseCode.NOT_FOUND);
         }
     });
 }

 util.prototype.runModelUpdateJob = function (inputData, firmIds, cb) {
     logger.debug('run model update job cal_____________________________________________________' + firmIds);
     /*
         1. get firm details form common
         2. prepare required params
         3. do call the job
     */
     var self = this;
     var updateModelInfo = constants.updateModel;
     var command = updateModelInfo.command;
     var contextParam = '--context_param';
     var envInfo = env.orion;
     var firmDetail = '';
     //var count = 0;
     var commonDBDetail = contextParam + ' commonHostName=' + envInfo.db.host;
     commonDBDetail += ' ' + contextParam + ' commonDBName=' + envInfo.db.database;
     commonDBDetail += ' ' + contextParam + ' commonDBPort=3306';
     var communityDBDetail = contextParam + ' communityHostName=' + envInfo.db.community.host;
     communityDBDetail += ' ' + contextParam + ' communityDB=' + envInfo.db.community.database;
     communityDBDetail += ' ' + contextParam + ' communityDBPort=3306';
     var modelParam = contextParam + ' communityModelId=' + inputData.modelId;
     var serverIP = contextParam + ' serverIP=' + envInfo.rebalance.url;
     var serverPort = contextParam + ' serverPort=' + envInfo.rebalance.port;
     var privateKeyPath = appBasePath + envInfo.modelUpdate.privateKey;

     strategistDao.getFirmDetailsFromCommon(inputData, firmIds, function (err, firmDetails) {
         if (err) {
             logger.error('error in getting firm details form db' + err);
             return cb();
         }
         if (firmDetails && firmDetails.length > 0) {
             //checking for ssh connection
             self.checkSSHConnection(function (ssh) {
                 asyncFor(firmDetails, function (firm, index, next) {
                     var firm = poolService.configurationDecoder(firm, ['username', 'password']);
                     firmDetail += contextParam + ' userName=' + firm.username + ' ' + contextParam + ' password=' + firm.password;
                     var finalCommand = command + ' ' + firmDetail + ' ' + commonDBDetail + ' ' + communityDBDetail + ' ' + modelParam;
                     finalCommand += ' ' + serverIP + ' ' + serverPort;
                     logger.debug('final command__________________________' + finalCommand);
                     ssh.execCommand(finalCommand).then(function (result) {
                         logger.debug("the result i got here is" + JSON.stringify(result));
                         if (result.code !== 0) {
                             logger.error("Please provide valid command:", result.stderr);
                         }
                         return next(err, result);
                     });
                 }, function (err) {
                     return cb(null, responseCode.SUCCESS, {
                         message: "SUCCESS"
                     });
                 });
             });
         } else {
             logger.error("no firm details found:", error);
             return cb();
         }
     });
 }

 util.prototype.getSSHConnection = function (cb) {
     var envInfo = env.orion;
     var privateKeyPath = appBasePath + envInfo.modelUpdate.privateKey;
     ssh.connect({
         host: envInfo.modelUpdate.host,
         username: envInfo.modelUpdate.username,
         privateKey: privateKeyPath
     }).then(function () {
         return cb(ssh);
     });
 }

 util.prototype.checkSSHConnection = function (cb) {
     var self = this;
     if (!ssh.connected) {
         logger.debug('ssh is connection is not established');
         self.getSSHConnection(function (con) {
             logger.debug('ssh is connection is established now');
             ssh = con;
             return cb(ssh);
         });
     } else {
         logger.debug('ssh is connection is already established');
         return cb(ssh);
     }
 }

 util.prototype.getModelInfo = function(inputData, cb){
     if(inputData.modelObj){
         return cb(null, [inputData.modelObj]);
     }else{
         modelDao.getModelDetail(inputData, function (err, modelDetails) {
            if (err) {
                logger.debug('ETL JOB: error in get model details during notification getModelInfo() ' + err);
                return cb(err);
            }
            return cb(null, modelDetails);
        });
     }
 }

 module.exports = util;