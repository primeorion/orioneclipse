"use strict";

var moduleName = __filename;
var path = require("path");
var node_ssh = require('node-ssh');
var shell = require('shelljs/global');
var ssh = new node_ssh();
var config = require('config');
var logger = require('helper/Logger.js')(moduleName);
var messages = config.messages;
var responseCode = config.responseCode;
var constants = config.orionConstants;
var dataImport = constants.import;
var enums = config.applicationEnum;
var importConf = config.env.prop.orion.import;
var S3 = require('helper/AwsSdkConnect.js').s3;
var _ = require("lodash");
var PortfolioDao = new(require('dao/portfolio/PortfolioDao.js'))();
var ImportLogDao = new(require('dao/import_log/ImportLogDao.js'))();
var notificationService = new(require('service/notification/NotificationService.js'))();
var analysisDao = new(require('dao/post_import_analysis/AnalysisDao'))();
var localCache = require('service/cache').local;
const crypto = require('crypto');

var ImportService = function () { };

ImportService.prototype.dataImport = function (inputData, cb) {

    logger.info("Data Import Service get the executed command");
    var command = dataImport.command;
    var contextParam = dataImport.contextParam;
    var inputDirParam = dataImport.inputDirParam;
    var inputDir = inputDirParam + '"' + inputData.inputDir + '"';
    var finalCommand = command + contextParam + inputDir;
    var privateKeyPath = appBasePath + importConf.privateKey

    logger.debug("final command detail :", finalCommand);

    ssh.connect({
        host: importConf.host,
        username: importConf.username,
        privateKey: privateKeyPath
    }).then(function () {
        ssh.execCommand(finalCommand).then(function (result) {
            if (result.stderr) {
                logger.error("Please provide valid command:", result.stderr);
            }
        });
        logger.info("Successfully notified data import startup process.");
        return cb(null, responseCode.SUCCESS, { 'Message': messages.importSucessful });
    },
    function (error) {
            logger.error("Connection problem, please check the host server detail :", error);
            return cb(messages.dataImportServerError, responseCode.INTERNAL_SERVER_ERROR);
    });

};
ImportService.prototype.completeEtlImport = function (inputData, cb) {
    logger.info("Complete ETL Import Service get the executed command");
    var command = dataImport.ETL_command;
    var contextParam = null;
    var date = new Date();
    if(inputData.importType === 1){
      contextParam = dataImport.ETL_contextParam+importConf.fullImportConfig;
    }else if(inputData.importType === 2){
      contextParam = dataImport.ETL_contextParam+importConf.partialImportConfig;
    }else if(inputData.importType === 3){
      contextParam = dataImport.ETL_contextParam+importConf.fullImportConfig;
    }else{
      return cb(messages.WrongImportType, responseCode.INTERNAL_SERVER_ERROR);
    }
    var baseDir = "extracts/test/1300";
    var s3Path = baseDir+'/'+date.getFullYear()+'/'+(date.getMonth()+1)+'/16/';//+date.getDate()+'/';
    var inputDirParam = dataImport.inputDirParam;
    var inputDir = inputDirParam + '"' + s3Path + '"';
    var finalCommand = command + contextParam + inputDir;
    var privateKeyPath = appBasePath + importConf.privateKey
    logger.debug("final command detail :", finalCommand);

    ssh.connect({
        host: importConf.host,
        username: importConf.username,
        privateKey: privateKeyPath
    }).then(function () {
        ssh.execCommand(finalCommand).then(function (result) {
            logger.debug("the result i got here is"+JSON.stringify(result));
            if (result.code !== 0 ) {
                logger.error("Please provide valid command:", result.stderr);
                return cb(result.stderr, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("Import process completed Successfully");
            return cb(null, responseCode.SUCCESS, true);
        });
    },
    function (error) {
        logger.error("Error during Import process:", error);
         return cb(messages.importError, responseCode.INTERNAL_SERVER_ERROR);
    });

};
ImportService.prototype.importData = function(data, cb){
  logger.info("Import Data Service called (importData())");
  var self = this;
  var progressData = {};
  progressData.message = messages.importRunning;
  progressData.progress = 40;
  progressData.status = enums.IMPORT.STATUS.PROGRESS;
  self.sendNotificationForImport(data, progressData);
  self.executeETL(data, function(err, status, result){
    progressData.message = messages.importCompleted;
    progressData.progress = 100;
    progressData.status = enums.IMPORT.STATUS.DONE; 
    self.sendNotificationForImport(data, progressData);
    if(data.importType === 1 || data.importType === 3){
      analysisDao.fullAnalysis(data, function(err, result){});
    }else if(data.importType === 2){
      analysisDao.partialAnalysis(data, function(err, result){});
    }
  });
  return cb(null, responseCode.SUCCESS, {message:"Import Initiated successfully"});
};
ImportService.prototype.sendNotificationForImport = function(data, progressData, cb){
  var notificationInput = {};
  var type = null;
  if(data.importType === 1){
    type = enums.IMPORT.TYPE.FULL;
  }else if(data.importType === 2){
    type = enums.IMPORT.TYPE.PARTIAL;
  }else if(data.importType === 3){
    type = enums.IMPORT.TYPE.ACCEPT;
  }
  notificationInput.code = enums.notificationCategoryType.DATA_IMPORT;
  notificationInput.user = data.user;
  notificationInput.processNotification ={};
  notificationInput.processNotification.message = type+" "+progressData.message;
  notificationInput.processNotification.status = progressData.status;
  notificationInput.processNotification.progress = progressData.progress;
  notificationService.sendNotification(notificationInput, function(err,status,result){
  });
};
ImportService.prototype.executeETL = function(data, cb){
  logger.info("Execute ETL service called (executeETL())");
  var self = this;
  self.completeEtlImport(data, function(err, status, result){
    if(err){
      logger.error("Error in import process (completeEtlImport())"+err);
      return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    }
    return cb(null, responseCode.SUCCESS, {message:"Import Initiated successfully"});
  })
}
ImportService.prototype.sleeveDataImport = function (inputData, cb) {
    logger.info("Sleeve Import Service get the executed command");
    var command = dataImport.importSleeveCommand;
    var contextParam = dataImport.sleeveContextParam+importConf.envConfig;
    var inputDirParam = dataImport.inputDirParam;
    var inputDir = inputDirParam + '"' + inputData.inputDir + '"';
    var finalCommand = command + contextParam + inputDir;
    var privateKeyPath = appBasePath + importConf.privateKey
    // sh '/home/ETLJobs/test8thDec/orionETLjobV2/orionETLjobV2_run.sh' --context_param contextDir=/home/orion_config_dev  --context_param inputDir="extracts/test/1100/2016/12/6/"
    logger.debug("final command detail :", finalCommand);

    ssh.connect({
        host: importConf.host,
        username: importConf.username,
        privateKey: privateKeyPath
    }).then(function () {
        ssh.execCommand(finalCommand).then(function (result) {
            logger.debug("the result i got here is"+JSON.stringify(result));
            if (result.code !== 0 ) {
                logger.error("Please provide valid command:", result.stderr);
                return cb(result.stderr, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("Sleeve import process completed Successfully"+messages.sleeveImportSucess);
            return cb(null, responseCode.SUCCESS, { message: messages.sleeveImportSucess });
        });
    },
    function (error) {
        logger.error("Error during sleeve import process:", error);
         return cb(messages.sleeveImportError, responseCode.INTERNAL_SERVER_ERROR);
    });

};

/** 
* ETL Initialization from S3 server.
**/
ImportService.prototype.initETL = function (data, cb) {
  logger.info("Initialize ETL");
  if(data.status.toLowerCase().includes('started')){
    // Creating sessionId if it is not there.
    if(data.sessionId == null || data.sessionId == ''){
      data.sessionId = crypto.createHmac('sha256', constants.CRYPTO_SECRET).update((new Date() * 1000).toString()).digest('hex');
    }
    // Log ETL extraction start extract time in a table importLog
    data.column_name = 'startExtractTime';
    logger.info("Updating start extract time of import log for session: " + data.sessionId);
    ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
      if(err){
        logger.error("Not able to Update startExtractTime for import sessionId: ", data.sessionId);
        return cb(err, responseCode.BAD_REQUEST, null);        
      }
      else
        return cb(null, responseCode.SUCCESS, { sessionId: data.sessionId });
    });    
  }
  else if(data.status.toLowerCase().includes('ended') && data.sessionId != null){  
    // Log ETL extraction end extract time in a table importLog
    data.column_name = 'endExtractTime';
    logger.info("Updating end extract time of import log for session: " + data.sessionId);
    ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
      if(err){
        logger.error("Not able to Update endExtractTime for import sessionId: " + data.sessionId);
      }
    });

    // Log ETL import start import time in a table importLog
    data.column_name = 'startImportTime';
    logger.info("Updating start import time of import log for session: " + data.sessionId);
    ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
      if(err){
        logger.error("Not able to Update startImportTime for import sessionId: " + data.sessionId);
      }
    });

    logger.info("Check File Status in S3 server for Regular Import");
    var params = {"Bucket": data.bucket, "Prefix": data.path};  

    S3.listObjectsV2(params, function(err, resp){
      if(err){
        logger.error("Error in import data in function ImportService.initETL(). \n Error :" + err);  
        return cb(messages.badRequest, responseCode.BAD_REQUEST, err);
      }      
      else{
        // Checking count of files specified in request parameter and on S3, if request count is zero, then will throw error.      
        if(resp.KeyCount == 0)
          return cb("Path specified have no files.", responseCode.BAD_REQUEST, null);
        else{
          // Initializing ETL
          var return_message = true;
          data["message"] = {success: "ETL Process ran successfully!!! Import Analysis Started!!!", error: "Unable to start ETL Process!!! Please contact Administrator.", init_success: "ETL Process initiated successfully!!!"}  
          triggerETLProcess(data, function(err, code, result){
            if(err){  
              return_message = false;                
              return cb(err, code, null);
            }else{
              if(return_message){
                return_message = false;                    
                return cb(null, code, result);
              }
            }
          });
          setTimeout(function(){ 
            if(return_message){
              return_message = false;
              return cb(null, responseCode.SUCCESS, { message: data.message.init_success });  
            }                
          }, 45000);
        }
      }
    });
  }
  else
    return cb("Invalid Input Data!!! Check your Data like sessionId, Status, etc.", responseCode.BAD_REQUEST, null);
}

/** 
* Checking files properties on S3 and verifying with parameters to trigger ETL process.
**/
// ImportService.prototype.checkFileImport = function (data, cb) {
//   logger.info("Check File Status in S3 server for Regular Import");  
//   var params = {"Bucket": data.params.bucket, "Prefix": data.params.path};  
//   S3.listObjectsV2(params, function(err, resp){
//     if(err){
//       logger.error("Error in import data in function ImportService.checkFileImport(). \n Error :" + err);  
//       return cb(messages.badRequest, responseCode.BAD_REQUEST, err);
//     }      
//     else{
//       // Checking count of files specified in request parameter and on S3, if request count is more, then will throw error.      
//       if(data.params.files.length > resp.KeyCount)
//         return cb("Path specified have less files of count " + resp.KeyCount + " , whereas it should be " + data.params.files.length + ".", responseCode.BAD_REQUEST, null);
//       else{        
//         var param_files_array = [],
//         files_hash = {},
//         files_on_S3 = [],
//         files_hash_on_s3 = {},
//         files_difference;

//         _.map(data.params.files, function(file){
//           param_files_array.push(file.name);
//           files_hash[file.name] = file.size.split(" ")[0];
//         });

//         _.map(resp.Contents, function(file){          
//           var name = file.Key.replace(data.params.path, '');
//           files_on_S3.push(name);
//           files_hash_on_s3[name] = file.Size;
//         });

//         // Check duplicate files in request parameters
//         var duplicate_files = _(param_files_array).groupBy().pickBy(x => x.length > 1).keys().value();
//         if(duplicate_files.length > 0)
//           return cb("Duplicate File Entries in request parameters: " + duplicate_files.join(", "), responseCode.BAD_REQUEST, null);
//         else{
//           files_difference = _.difference(param_files_array, files_on_S3);
//           // Check if any file is missing from S3 but mentioned in request parameters. If yes, then will throw back error.
//           if(files_difference.length > 0)
//             return cb("Following Files specified in parameters are not found on S3 server: " + files_difference.join(", \n") + " on path: " + data.params.path + ".", responseCode.BAD_REQUEST, null);
//           else{
//             // Check Size of files as mentioned in request parameters. If mismatch found, then will throw back error.
//             var mismatch_file_size = "";
//             _.map(param_files_array, function(file){              
//               if(files_hash[file] > Math.ceil(files_hash_on_s3[file]/1000))
//                 mismatch_file_size += "File: " + file + " is given size " + files_hash[file] + " kB, but found size "+ Math.ceil(files_hash_on_s3[file]/1000) + " kB on S3."
//             });

//             if(mismatch_file_size != "")
//               return cb("Mismatch in SIZE found in following files: " + mismatch_file_size, responseCode.BAD_REQUEST, null);
//             else{
//               var checkFirmAuthenticity = localCache.get(data.reqId).connection.config.database.includes(dat.firmName) && data.path.includes(data.firmName);
//               if(checkFirmAuthenticity){

//               }
//               // CALLING ETL PROCESS
//               var return_message = true;
//               data["message"] = {success: "ETL Process ran successfully!!!", error: "Unable to start ETL Process!!! Please contact Administrator."}

//               triggerETLProcess(data, function(err, code, result){
//                 if(err){  
//                   return_message = false;                
//                   return cb(err, code, null);
//                 }else{
//                   if(return_message){
//                     return_message = false;                    
//                     return cb(null, code, result);
//                   }
//                 }
//               });
//               setTimeout(function(){ 
//                 if(return_message){
//                   return_message = false;
//                   return cb(null, responseCode.SUCCESS, { message: data.message.success });  
//                 }                
//               }, 15000);
//             }            
//           }  
//         }               
//       }           
//     }
//   });  
// };

/** 
* Trigger ETL Process.
* Parameters: 
* {
*    path: "/extracts/test/1300/2016/11/16/",
*    message: {
*       success: "Success Message",
*       error: "Error Message"
*   }
* }
**/
var triggerETLProcess = function(data, cb){
    logger.info("Triggering ETL Process");
    var command = dataImport.ETL_command,
    contextParam = dataImport.ETL_contextParam + importConf.etl_config,    
    // contextParam = dataImport.ETL_contextParam,
    inputDirParam = dataImport.ETL_inputDirParam,
    inputDir = inputDirParam + '"' + data.params.path + '"',
    finalCommand = command + contextParam + inputDir,
    privateKeyPath = appBasePath + importConf.privateKey;    
    // sh '/home/ETLJobs/testJob_Main_Includind_lessConnection_3/orionETLjobV2/orionETLjobV2_run.sh' --context_param contextDir=/home/orion_config_dev --context_param inputDir="extracts/test/1300/2016/11/18/"    
    logger.debug("final command detail :", finalCommand);
    
    /*
     * third entry in db
    */ssh.connect({
        host: importConf.host,
        username: importConf.username,
        privateKey: privateKeyPath
    }).then(function () {
        ssh.execCommand(finalCommand).then(function (result) {          
            logger.debug("ETL Result: " + JSON.stringify(result));
            var dta = {};
            dta["command"] = finalCommand;
            dta["result"] = result.stderr;            
            if (result.code !== 0 ) {
                logger.error("Please provide valid command:", result.stderr);
                dta["error"] = data.message.error; 
                // Log ETL import end import time in a table importLog
                data.column_name = 'endImportTime';
                data.reason = result.stderr;
                data.etl_status = "Failed";
                ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
                  if(err){
                    logger.error("Not able to Update endImportTime for import sessionId: " + data.sessionId);
                  }
                });                        
                return cb(dta, responseCode.BAD_REQUEST, null);
            }else{
              logger.info(data.message.success);
              dta["message"] = data.message.success; 

              // Log ETL import end import time in a table importLog
              data.column_name = 'endImportTime';
              logger.info("Updating end import time of import log for session: " + data.sessionId);
              ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
                if(err){
                  logger.error("Not able to Update endImportTime for import sessionId: " + data.sessionId);
                }
              }); 

              // Log ETL import start analytics time in a table importLog
              data.column_name = 'startAnalyticsTime';
              logger.info("Updating start analytics time of import log for session: " + data.sessionId);
              ImportLogDao.createOrUpdateImportLog(data, function(err, resp){
                if(err){
                  logger.error("Not able to Update startAnalyticsTime for import sessionId: " + data.sessionId);
                }
              });

              PortfolioDao.allotTeamsToPortfolio(data, function(err, resp){
                data.end_session = true;   
                analysisDao.fullAnalysis(data)
                .then(function(resp){
                  /*
                   * sixth entry in db
                  */return 1;
                })
                .catch(function(error) { 
                  return 1;
                });
              });
              return cb(null, responseCode.SUCCESS, dta);
            }            
        });
    },
    function (error) {
        logger.error("Error during ETL import process:", error);
         return cb(data.message.error, responseCode.INTERNAL_SERVER_ERROR, null);
    });
}
module.exports = ImportService;


