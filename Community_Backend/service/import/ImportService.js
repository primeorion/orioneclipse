"use strict";

var moduleName = __filename;
var path = require("path");
var node_ssh = require('node-ssh');
var ssh = new node_ssh();

var config = require('config');
var logger = require('helper/Logger.js')(moduleName);
var messages = config.messages;
var responseCode = config.responseCode;
var constants = config.orionConstants;
var dataImport = constants.import;
var importConf = config.env.prop.orion.import;

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
        return cb(null, responseCode.SUCCESS, { 'Message': messages.importSucessfull });
    },
        function (error) {
            logger.error("Connection problem, please check the host server detail :", error);
            return cb(messages.dataImportServerError, responseCode.INTERNAL_SERVER_ERROR);
        });

};

module.exports = ImportService;


