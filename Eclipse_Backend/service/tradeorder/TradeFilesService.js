"use strict";

var moduleName = __filename;

var helper = require("helper");
var config = require('config');
var logger = require('helper/Logger.js')(moduleName);
var localCache = require('service/cache').local;
var TradeFilesDao = require('dao/tradeorder/TradeFilesDao.js');
var TradeFilesConverter = require("converter/trade_files/TradeFilesConverter.js");
var NotificationService = require('service/notification/NotificationService.js');
var _ = require('underscore');
var moment = require('moment');
var fs = require('fs');
var util = require('util');
var json2csv = require('json2csv');
var mkdirp = require('mkdirp');
var aws = require('aws-sdk');
var s3 = require('s3');
var baseDao = require('dao/BaseDao');

var constants = config.orionConstants;
var asyncFor = helper.asyncFor;
var envName = config.env.name;
var s3Properties = config.env.prop.orion["aws"];
aws.config.region = s3Properties.region;
aws.config.update({
    accessKeyId: s3Properties.accessKeyId,
    secretAccessKey: s3Properties.secretAccessKey,
});
var messages = config.messages;
var responseCode = config.responseCode;
var applicationEnum = config.applicationEnum;
var cbCaller = helper.cbCaller;
var tradeFileTemplates = applicationEnum.tradeFileTemplates;

var awsS3 = new aws.S3();
var tradeFilesDao = new TradeFilesDao();
var tradeFilesConverter = new TradeFilesConverter();
var notificationService = new NotificationService();

var TradeFilesService = function () { }

TradeFilesService.prototype.getTradeFilesList = function (data, cb) {
    logger.info("Get Trade Files list service called (getTradeFilesList)");
    var self = this;
    var isValid = true;
    if (data.fromDate) {
        isValid = moment(data.fromDate, "MM/DD/YYYY", true).isValid();
        data.fromDate = moment(new Date(data.fromDate)).format("YYYY-MM-DD");
    } else {
        data.fromDate = moment().format('YYYY-MM-DD');
    }
    if (isValid) {
        tradeFilesDao.getTradeFilesList(data, function (err, filesList) {
            if (err) {
                logger.error("Error in getting Trade Files list (getTradeFilesList) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            data.filesList = filesList;
            self.getSignedUrl(data, function (err, response) {
                if (err) {
                    logger.error("Error in getting Trade Files list after conversion (getTradeFilesList()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                tradeFilesConverter.getResponseModelOfTradeFilesList(data.filesList, function (err, response) {
                    if (err) {
                        logger.error("Error in getting Trade Files list after conversion (getTradeFilesList()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    return cb(null, responseCode.SUCCESS, response);
                });
            });
            // tradeFilesConverter.getResponseModelOfTradeFilesList(filesList, function (err, response) {
            //     if (err) {
            //         logger.error("Error in getting Trade Files list after conversion (getTradeFilesList) " + err);
            //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            //     }
            //     return cb(null, responseCode.SUCCESS, response);
            // });
        });
    } else {
        logger.debug("Invalid fromDate Parameter " + data.fromDate);
        return cb(null, responseCode.BAD_REQUEST, { "message": messages.invalidDateFormat });
    }
};

TradeFilesService.prototype.getTradeFilesCount = function (data, cb) {
    logger.info("Get Trade Files count service called (getTradeFilesCount)");
    data.fromDate = moment().format('YYYY-MM-DD');
    tradeFilesDao.getTradeFilesList(data, function (err, filesList) {
        if (err) {
            logger.error("Error in getting Trade Files count (getTradeFilesCount) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        tradeFilesConverter.getResponseModelOfTradeFilesList(filesList, function (err, response) {
            if (err) {
                logger.error("Error in getting Trade Files count after conversion (getTradeFilesCount) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            return cb(null, responseCode.SUCCESS, { "count": response.length });
        });
    });
};

TradeFilesService.prototype.updateTradeFilesStatus = function (data, cb) {
    logger.info("Update Trade Files status service called (updateTradeFilesStatus())");
    var self = this;
    tradeFilesDao.getDetailsById(data, function (err, record) {
        if (err) {
            logger.error("Error in getting Trade Files details (updateTradeFilesStatus()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (record) {
            tradeFilesDao.updateTradeFilesStatus(data, function (err, response) {
                if (err) {
                    logger.error("Error in Updating Trade Files status (updateTradeFilesStatus()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (response.affectedRows > 0) {
                    tradeFilesDao.getDetailsById(data, function (err, record) {
                        if (err) {
                            logger.error("Error in getting Trade Files details (updateTradeFilesStatus()) " + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        } else {
                            var path = record.path + "" + record.name;
                            self.createSignedURL(path, function (err, output) {
                                if (err) {
                                    logger.error("Error in generating signed URL for (updateTradeFilesStatus()) " + err);
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                } else {
                                    record.URL = output;
                                    tradeFilesConverter.getResponseModelOfTradeFileDetails(record, function (err, fileDetails) {
                                        if (err) {
                                            logger.error("Error in getting Trade Files details after conversion (updateTradeFilesStatus()) " + err);
                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                        } else {
                                            // return cb(null, responseCode.SUCCESS, fileDetails);
                                            self.notificationProcess(data, '-1', function (err, status) {
                                                if (err) {
                                                    logger.error("Error in notification Process (updateTradeFilesStatus()) " + err);
                                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                } else {
                                                    return cb(null, responseCode.SUCCESS, fileDetails);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                        // return cb(null, responseCode.SUCCESS, record);
                    });
                } else {
                    logger.debug("Failed to update Trade File status (updateTradeFilesStatus()) ");
                    return cb(messages.failedToUpdateStatus, responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.debug("Trade File does not exist (updateTradeFilesStatus()) " + data.id);
            return cb(messages.tradeFileNotFound, responseCode.NOT_FOUND);
        }
    });
};

TradeFilesService.prototype.deleteTradeFile = function (data, cb) {
    logger.info("Delete Trade File service called (deleteTradeFile)");
    var self = this;
    tradeFilesDao.getDetailsById(data, function (err, record) {
        if (err) {
            logger.error("Error in getting Trade File details (deleteTradeFile) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (record) {
            var name = record.name;
            logger.debug(" Actual File name (deleteTradeFile()) " + name);
            var splitName = name.split("_")
            if (splitName[1] === "Blocks" || splitName[1] === "EquityBlocks") {
                splitName[1] = "Allocation";
                splitName[4] = null;
            } else if (splitName[1] == "Allocation") {
                splitName[1] = "Blocks";
                splitName[4] = "EquityBlocks";
            }
            var firstTradeFileName = splitName[0] + "_" + splitName[1] + "_" + splitName[2] + "_" + splitName[3];
            var secondTradeFileName = splitName[4] ? splitName[0] + "_" + splitName[4] + "_" + splitName[2] + "_" + splitName[3] : null;
            logger.debug("Associated file names (deleteTradeFile()): " + firstTradeFileName + " and " + secondTradeFileName);

            data.firstTradeFileName = firstTradeFileName;
            data.secondTradeFileName = secondTradeFileName;
            tradeFilesDao.deleteTradeFile(data, function (err, response) {
                if (err) {
                    logger.error("Error in deleting Trade File (deleteTradeFile) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (response.affectedRows > 0) {
                    tradeFilesDao.removeTradeFileFromTrades(data, function (err, response) {
                        if (err) {
                            logger.error("Error in removing Trade File from Trades (deleteTradeFile) " + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        } else {
                            logger.debug("Trade File deleted successfully (deleteTradeFile) ");
                            // return cb(null, responseCode.SUCCESS, { "message": messages.tradeFileDeleted });
                            self.notificationProcess(data, '-1', function (err, status) {
                                if (err) {
                                    logger.error("Error in notification Process (deleteTradeFile()) " + err);
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                } else {
                                    return cb(null, responseCode.SUCCESS, { "message": messages.tradeFileDeleted });
                                }
                            });
                        }
                    });
                } else {
                    logger.debug("Failed to delete Trade File (deleteTradeFile) ");
                    return cb(messages.failedToDeleteFile, responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.debug("Trade File does not exist (deleteTradeFile) " + data.id);
            return cb(messages.tradeFileNotFound, responseCode.NOT_FOUND);
        }
    });
};

TradeFilesService.prototype.generateTradeFiles = function (data, cb) {
    logger.info("File Generate service called(generateTradeFiles)");
    var connection = baseDao.getConnection(data);
    data.connection = connection;
    var self = this;
    var templateKeys = tradeFileTemplates ? Object.keys(tradeFileTemplates) : null;
    var custodianMapKeys = data.custodianMap ? Object.keys(data.custodianMap) : null;
    var isValidKeys = _.difference(custodianMapKeys, templateKeys);
    if (data.custodianMap && isValidKeys.length == 0 && custodianMapKeys && templateKeys) {
        // custodianMapKeys.forEach(function (element) {
        asyncFor(custodianMapKeys, function (element, index, next) {

            data.custodianName = tradeFileTemplates[element];
            data.template = require("config/tradeFiles/" + data.custodianName + ".json");
            tradeFilesConverter.getResponseModelOfTradeFileData(data.custodianMap[element], function (err, tradeFileData) {
                if (err) {
                    logger.error("Error in Converting Trade File Data(generateTradeFiles)");
                    return next(err);
                } else {
                    data.tradeFileData = tradeFileData;
                    self.createTradeFiles(data, function (err, response) {
                        if (err) {
                            logger.error("Error in creating trade files(generateTradeFiles) " + err);
                            return next(err);
                        }
                        self.directorySyncProcess(data);

                        return next(err, response);
                    });
                }
            });
        }, function (err, data) {
            return cb(null, responseCode.SUCCESS, { message: "SUCCESS" });
        });
        // self.directorySyncProcess(data);
    } else {
        logger.debug("No Operation performed for Trade File generation(generateTradeFiles)");
        return cb(null, []);
    }
};

TradeFilesService.prototype.createTradeFiles = function (data, cb) {
    logger.info("Create Trade File service called(createTradeFiles)");
    var self = this;
    data.fileNameDate = (moment().format("YYYYMMDD_hhmmss"));
    // data.fileType = "Blocks";
    // data.fileName = data.custodianName + "_" + data.fileType + "_" + data.fileNameDate + ".csv";
    data.showTitle = (data.custodianName == "Perishing") ? true : false;
    self.categorizeTradeData(data, function (err, blockData, allocationData, tradeIds) {
        if (err) {
            logger.error("Error in dividing custodian Trade File data(createTradeFiles) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (blockData.length > 0) {
            data.fileType = "Blocks";
            data.fileName = data.custodianName + "_" + data.fileType + "_" + data.fileNameDate + ".csv";
            self.writeTradeFileData(data, blockData, data.template.block, tradeIds, function (err, blockFileResponse) {
                if (err) {
                    logger.error("Error in saving block Trade File data(createTradeFiles) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                } else if (allocationData.length > 0 && !err) {
                    data.fileType = "Allocation";
                    data.fileName = data.custodianName + "_" + data.fileType + "_" + data.fileNameDate + ".csv";
                    self.writeTradeFileData(data, allocationData, data.template.allocation, [], function (err, allocationFileResponse) {
                        if (err) {
                            logger.error("Error in saving allocation Trade File data(createTradeFiles) " + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        } else {
                            return cb(null, allocationFileResponse);
                        }
                    });
                } else {
                    logger.debug("No Allocation Trade File created because of either unavailability of allocation trade data Or because of Error in creating block File(createTradeFiles)");
                    return cb(null, blockFileResponse);
                }
            });
        } else {
            logger.error("Error in creating Trade File (createTradeFiles): " + "File Data not found");
            return cb(null, blockData);
        }
    });
};

TradeFilesService.prototype.writeTradeFileData = function (data, fileData, dataFormat, tradeIds, cb) {
    // logger.info("Write file data service called(writeTradeFileData)");
    // var self = this;
    // data.tradeIds = tradeIds;
    // // var errorOccurred = false;
    // data.relativePath = "tradefiles/" + config.env.name + "/firm" + data.user.firmId + "/" + data.custodianName + "/" + (moment().format("YYYYMMDD_hhmmss")) + "/";
    // data.filePath = "/" + data.relativePath + "" + data.fileName;
    // var titles = dataFormat ? Object.keys(dataFormat) : null;
    // var csvFileData = self.tradeFileDataMapper(fileData, dataFormat);

    // self.startTradeFileWriting(data, titles, csvFileData, function (err, response) {
    //     if (err) {
    //         logger.error("Error in cbCaller for creating tradeFile and saving info (writeTradeFileData()) " + err);
    //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    //     }
    //     return cb(null, response);
    // });
    var self = this;
    if (data.custodianName == "Perishing" && data.fileType == "Blocks") {
        var genAllocation = null;
        var templateKeyArray = dataFormat ? Object.keys(dataFormat) : [];
        for (var i = 0; i < templateKeyArray.length; i++) {
            data.fileType = templateKeyArray[i];
            if (fileData[i].length > 0) {
                self.initTradeFileWriting(data, fileData[i], dataFormat[templateKeyArray[i]], tradeIds, function (err, response) {
                    if (err) {
                        logger.error("Error in cbCaller for creating tradeFile and saving info (writeTradeFileData()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    genAllocation = true;
                });
            } else {
                genAllocation = false;
            }
        }
        return cb(null, genAllocation);
    } else {
        self.initTradeFileWriting(data, fileData, dataFormat, tradeIds, function (err, response) {
            if (err) {
                logger.error("Error in cbCaller for creating tradeFile and saving info (writeTradeFileData()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            return cb(null, response);
        });
    }
    // var csv = json2csv({ data: csvFileData, hasCSVColumnTitle: data.showTitle, fields: titles });

    // var cbFunction = cbCaller(2, function(err, data) {
    //     if (err) {
    //         logger.error("Error in cbCaller for creating tradeFile and saving info (writeTradeFileData()) " + err);
    //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    //     }
    //     return cb(null, data);
    // });

    // mkdirp("/" + data.relativePath, function(err) {
    //     if (err) {
    //         errorOccurred = err;
    //         logger.error('Error in creating directory for Trade File(writeTradeFileData) ' + err);
    //         return cbFunction(err);
    //     } else {
    //         fs.writeFile(data.filePath, csv, function(err) {
    //             if (err) {
    //                 errorOccurred = err;
    //                 logger.error('Error in Trade File creation(writeTradeFileData) ' + err);
    //                 return cbFunction(err);
    //             } else {
    //                 logger.debug('Trade File created successfully(writeTradeFileData)');
    //                 self.directorySyncProcess();
    //                 return cbFunction(null, fileData);
    //             }
    //         });
    //     }
    // });
    // if (!errorOccurred) {
    //     self.saveTradeFilesInfo(data, function(err, response) {
    //         if (err) {
    //             logger.error("Error in saving Trade File information(writeTradeFileData) " + err);
    //             return cbFunction(err);
    //         }
    //         return cbFunction(null, response);
    //     });
    // } else {
    //     return cbFunction(errorOccurred);
    // }
};

TradeFilesService.prototype.initTradeFileWriting = function (data, fileData, dataFormat, tradeIds, cb) {
    data.fileName = data.custodianName + "_" + data.fileType + "_" + data.fileNameDate + ".csv";

    var self = this;
    data.tradeIds = tradeIds;
    data.relativePath = "tradefiles/" + envName + "/firm" + data.user.firmId + "/" + data.custodianName + "/" + data.fileNameDate + "/";
    data.filePath = "/" + data.relativePath + "" + data.fileName;
    var titles = dataFormat ? Object.keys(dataFormat) : null;
    var csvFileData = self.csvFormatDataGenerator(data, titles, fileData, dataFormat);
    if (csvFileData) {
        self.startTradeFileWriting(data, titles, csvFileData, function (err, response) {
            if (err) {
                logger.error("Error in cbCaller for creating tradeFile and saving info (initTradeFileWriting()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                return cb(null, response);
            }
        });
    } else {
        logger.error("Unable to get CSV file data(initTradeFileWriting)");
        return cb(null, data);
    }
}

TradeFilesService.prototype.tradeFileDataMapper = function (fileData, dataFormat) {
    var csvFileData = fileData.map(function (element) {
        return Object.keys(dataFormat).reduce(function (object, key) {
            object[key] = element.hasOwnProperty(dataFormat[key]) ? element[dataFormat[key]] : dataFormat[key];
            return object;
        }, {});
    });
    return csvFileData;
};

TradeFilesService.prototype.csvFormatDataGenerator = function (data, titles, fileData, dataFormat) {
    try {
        var self = this;
        if ((data.custodianName == "Schwab" || data.custodianName == "Tda") && data.fileType == "Allocation") {
            var allocationDataPositions = [];
            var indexCounter = 0;
            for (var i = 0; i < data.combinedIndexes.length; i++) {
                if (data.combinedIndexes[i].length > 1) {
                    indexCounter += data.combinedIndexes[i].length;
                    allocationDataPositions.push(data.combinedIndexes[i]);
                }
            }
            var headerDataType = dataFormat["header"];
            var detailDataType = dataFormat["detail"];
            var trailerDataType = dataFormat["trailer"];
            var headerFields = Object.keys(headerDataType);
            var detailFields = Object.keys(detailDataType);
            var trailerFields = Object.keys(trailerDataType);
            var index = 0;
            var finalString = "";
            for (var i = 0; i < allocationDataPositions.length; i++) {

                var inputArray = [];
                var shareQuantity = 0;
                for (var j = 0; j < allocationDataPositions[i].length; j++) {
                    shareQuantity += fileData[index].orderQty;
                    // fileData[index].shareQuantity = fileData[index].orderQty;
                    fileData[index].tradeDate = moment().format('YYYYMMDD');
                    inputArray.push(fileData[index]);
                    index++;
                }
                // inputArray[0].shareQuantity = shareQuantity;
                inputArray[0].totalShareQuantity = shareQuantity;
                var headerCsvFileData = self.tradeFileDataMapper([inputArray[0]], headerDataType);
                var headerCsv = json2csv({ data: headerCsvFileData, hasCSVColumnTitle: false, fields: headerFields });
                inputArray[0].numberOfAllocationDetails = allocationDataPositions[i].length;
                var trailerCsvFileData = self.tradeFileDataMapper([inputArray[0]], trailerDataType);
                var trailerCsv = json2csv({ data: trailerCsvFileData, hasCSVColumnTitle: false, fields: trailerFields });

                var detailCsvFileData = self.tradeFileDataMapper(inputArray, detailDataType);
                var detailCsv = json2csv({ data: detailCsvFileData, hasCSVColumnTitle: false, fields: detailFields });

                finalString += headerCsv + "\r\n" + detailCsv + "\r\n" + trailerCsv + "\r\n";
            }
            return finalString;
            //     var result = [];
            //     var type = ["header", "detail", "trailer"];
            //     type.forEach(function(typeId) {
            //         var dataType = dataFormat[typeId];
            //         var fields = Object.keys(dataType);
            //         var csvFileData = self.tradeFileDataMapper(fileData, dataType);
            //         var csv = json2csv({ data: csvFileData, hasCSVColumnTitle: false, fields: fields });
            //         result.push(csv);
            //     }, this);

            //     var header = result[0].split("\r\n");

            //     var detail = result[1].split("\r\n");

            //     var trailer = result[2].split("\r\n");
            //     var csvData = "";
            //     for (var i = 0; i < header.length; i++) {
            //         csvData = csvData + "" + header[i] + "\r\n";
            //         csvData = csvData + "" + detail[i] + "\r\n";
            //         csvData = csvData + "" + trailer[i] + "\r\n";
            //     }
            //     return csvData;
        } else {
            var csvFileData = self.tradeFileDataMapper(fileData, dataFormat);
            var csv = json2csv({ data: csvFileData, hasCSVColumnTitle: data.showTitle, fields: titles });
            return csv;
        }
    } catch (err) {
        logger.error("Error in creating CSV file Data before writing that data into File(csvFormatDataGenerator) " + err);
        return null;
    }
};

TradeFilesService.prototype.startTradeFileWriting = function (data, titles, csvFileData, cb) {
    var tradeIds = data.tradeIds;
    var errorOccurred = false;
    var self = this;
    // var csv = json2csv({ data: csvFileData, hasCSVColumnTitle: data.showTitle, fields: titles });
    var filePath = data.filePath;
    var cbFunction = cbCaller(2, function (err, record) {
        if (err) {
            logger.error("Error in cbCaller for creating tradeFile and saving info (startTradeFileWriting()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, record);
    });
    mkdirp("/" + data.relativePath, function (err) {
        if (err) {
            errorOccurred = err;
            logger.error('Error in creating directory for Trade File(startTradeFileWriting) ' + err);
            return cbFunction(err);
        } else {
            fs.writeFile(filePath, csvFileData, function (err) {
                if (err) {
                    errorOccurred = err;
                    logger.error('Error in Trade File creation(startTradeFileWriting) ' + err);
                    return cbFunction(err);
                } else {
                    logger.debug('Trade File created successfully(startTradeFileWriting)');

                    // self.saveTradeFilesInfo(data, function (err, response) {
                    //     if (err) {
                    //         logger.error("Error in saving Trade File information(startTradeFileWriting) " + err);
                    //         return cb(err);
                    //     } else {
                    //         return cb(null, response);
                    //     }
                    // });
                    // self.directorySyncProcess();
                    return cbFunction(null, data);
                }
            });
        }
    });
    // if (!errorOccurred) {
    //     self.saveTradeFilesInfo(data, function (err, response) {
    //         if (err) {
    //             logger.error("Error in saving Trade File information(startTradeFileWriting) " + err);
    //             return cbFunction(err);
    //         }
    //         return cbFunction(null, response);
    //     });
    // } else {
    //     return cbFunction(errorOccurred);
    // }

    if (!errorOccurred) {
        self.saveTradeFilesInfo(data, function (err, response) {
            if (err) {
                logger.error("Error in saving Trade File information(startTradeFileWriting) " + err);
                return cbFunction(err);
            } else if (response.insertId) {
                if (tradeIds.length > 0) {
                    data.tradeFileId = response.insertId;
                    data.tradeIds = tradeIds;
                    tradeFilesDao.updateTradesByTradeFiles(data, function (err, result) {
                        if (err) {
                            logger.error("Error in updating Trade File information in trades(startTradeFileWriting) " + err);
                            return cbFunction(err);
                        } else {
                            logger.debug("Successfully saving Trade File information(startTradeFileWriting)");
                            return cbFunction(null, response.insertId);
                        }
                    });
                } else {
                    logger.debug("No Trade Id to save Trade File info (startTradeFileWriting)");
                    return cbFunction(null, response.insertId);
                }
            } else {
                logger.debug("Unable to save Trade File Info (startTradeFileWriting)");
                return cbFunction("Failed to save Trade File info in DB", responseCode.INTERNAL_SERVER_ERROR);
            }
        });
    } else {
        return cbFunction(errorOccurred);
    }
};

TradeFilesService.prototype.categorizeTradeData = function (data, cb) {
    logger.info("Divide custodian File data service called(categorizeTradeData)");
    var perishingElement = [];
    var custodianData = data.tradeFileData;
    var self = this;
    data.combinedValues = [];
    data.combinedIndexes = [];
    var blockData = [];
    var fidelityAllocationData = [];
    var perishingAllocationData = [];
    var perishingAllocation = [];
    var allocationData = [];
    var tradeIds = [];
    try {
        for (var i = 0; i < custodianData.length; i++) {
            var combinedIndex = [];
            var storedValueIndex = data.combinedValues.indexOf(custodianData[i].combined);
            if (storedValueIndex >= 0) {
                data.combinedIndexes[storedValueIndex].push(i);
            } else {
                combinedIndex.push(i);
                data.combinedIndexes.push(combinedIndex);
                data.combinedValues.push(custodianData[i].combined);
            }
        }
        for (var j = 0; j < data.combinedValues.length; j++) {
            var orderQtySum = 0;
            var fidelityQuantitySum = 0;
            var schwabQuantitySum = 0;
            var tdaQuantitySum = 0;
            var combinedIndex = data.combinedIndexes[j];
            var element = JSON.stringify(custodianData[combinedIndex[0]]);
            element = JSON.parse(element);
            if (combinedIndex.length > 1) {
                element.blockIndicator = "Y";
                custodianData[combinedIndex[0]].blockIndicator = "N";
                allocationData.push(custodianData[combinedIndex[0]]);
                // blockData = (data.custodianName == "Fidelity") ? blockData.concat(custodianData[combinedIndex[0]]) : blockData;
                if (data.custodianName == "Fidelity") {
                    fidelityAllocationData.push(custodianData[combinedIndex[0]]);
                } else if (data.custodianName == "Perishing" && custodianData[combinedIndex[0]].securityTypeId == 5) {
                    custodianData[combinedIndex[0]].perishingAllocationAccountNumber = custodianData[combinedIndex[0]].perishingAccountNumber;
                    custodianData[combinedIndex[0]].importType = "IMSA";
                    perishingElement.push(custodianData[combinedIndex[0]]);
                }
            } else if (combinedIndex.length === 1) {
                element.blockIndicator = "";
                element.genericAccountNumber = element.accountNumber;
                // if (data.custodianName == "Perishing" && custodianData[combinedIndex[0]].securityTypeId == 5) {
                //     custodianData[combinedIndex[0]].importType = "IMSA";
                //     custodianData[combinedIndex[0]].perishingAllocationAccountNumber = custodianData[combinedIndex[0]].perishingAccountNumber;
                //     perishingElement.push(custodianData[combinedIndex[0]]);
                // }
            }
            for (var i = 0; i < combinedIndex.length; i++) {
                tradeIds.push(custodianData[combinedIndex[i]].id);
                if (i > 0) {
                    custodianData[combinedIndex[i]].blockIndicator = "N";
                    allocationData.push(custodianData[combinedIndex[i]]);
                    // blockData = (data.custodianName == "Fidelity") ? blockData.concat(custodianData[combinedIndex[i]]) : blockData;
                    if (data.custodianName == "Fidelity") {
                        fidelityAllocationData.push(custodianData[combinedIndex[i]]);
                    } else if (data.custodianName == "Perishing" && custodianData[combinedIndex[i]].securityTypeId == 5) {
                        custodianData[combinedIndex[i]].perishingAllocationAccountNumber = custodianData[combinedIndex[i]].perishingAccountNumber;
                        custodianData[combinedIndex[i]].importType = "IMSA";
                        perishingElement.push(custodianData[combinedIndex[i]]);
                    }
                }
                orderQtySum += custodianData[combinedIndex[i]].orderQty;
                fidelityQuantitySum += custodianData[combinedIndex[i]].fidelityQuantity;
                schwabQuantitySum += custodianData[combinedIndex[i]].schwabQuantity;
                tdaQuantitySum += custodianData[combinedIndex[i]].tdaQuantity;
            }
            element.orderQty = orderQtySum;
            element.fidelityQuantity = fidelityQuantitySum;
            element.schwabQuantity = schwabQuantitySum;
            element.tdaQuantity = tdaQuantitySum;
            perishingAllocationData.push(element);
            blockData.push(element);
            blockData = (fidelityAllocationData.length > 0 && data.custodianName == "Fidelity") ? blockData.concat(fidelityAllocationData) : blockData;
            perishingAllocationData = (perishingElement.length > 0 && data.custodianName == "Perishing") ? perishingAllocationData.concat(perishingElement) : [];

            if (perishingAllocationData.length > 2) {
                perishingAllocation = perishingAllocation.concat(perishingAllocationData);
            }
            fidelityAllocationData = [];
            perishingElement = [];
        }
        allocationData = (data.custodianName == "Fidelity") ? [] : allocationData;
        allocationData = (data.custodianName == "Perishing") ? perishingAllocation : allocationData;
        if (data.custodianName == "Perishing" && blockData && blockData.length > 0) {
            self.categorizeBlockData(blockData, function (err, mutualFundData, equityData) {
                if (err) {
                    logger.error("Error in categorizing block data in mutualFundData and equityData parts(categorizeTradeData) " + err);
                    return cb(err);
                } else {
                    blockData = [];
                    blockData.push(equityData);
                    blockData.push(mutualFundData);
                    return cb(null, blockData, allocationData, tradeIds);
                }
            });
        } else {
            return cb(null, blockData, allocationData, tradeIds);
        }
    } catch (err) {
        logger.error("Error in Separating trade data in block and allocation parts(categorizeTradeData) " + err);
        return cb(err);
    }
};

TradeFilesService.prototype.categorizeBlockData = function (blockData, cb) {
    logger.debug("Categorize Block Data in Mutual Fund and Equity parts service called(categorizeBlockData())");
    var mutualFundData = [];
    var equityData = [];
    try {
        var dataArray = _.filter(blockData, function (element) {
            if (element.securityTypeId == 1) {
                mutualFundData.push(element);
            } else if (element.securityTypeId == 5) {
                equityData.push(element);
            }
        });
        return cb(null, mutualFundData, equityData);
    } catch (err) {
        logger.error("Error in categorize Block Data in Mutual Fund and Equity parts(categorizeBlockData())");
        throw err;
        //return cb(err);
    }
};

// TradeFilesService.prototype.categorizeAllocationData = function (allocationData, cb) {

// };

TradeFilesService.prototype.saveTradeFilesInfo = function (data, cb) {
    logger.info("Save created Trade File information service called(saveTradeFilesInfo())");
    var self = this;
    // var errorOccurred = false;
    // var cbFunction = cbCaller(2, function (err, data) {
    //     if (err) {
    //         logger.error("Error in cbCaller for creating tradeFile and saving info (writeTradeFileData()) " + err);
    //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    //     }
    //     return cb(null, data);
    // });

    tradeFilesDao.saveTradeFilesInfo(data, function (err, response) {
        if (err) {
            // errorOccurred = err;
            logger.error("Error in saving Trade File information(saveTradeFilesInfo()) " + err);
            return cb(err);
        } else if (response) {
            data.tradeFileId = response.insertId;
            return cb(null, response);
        } else {
            logger.debug("Unable to save newly created Trade Files(saveTradeFilesInfo())");
            return cb(null, response);
            // return cbFunction(null, response);
        }
    });

    // if (!errorOccurred) {
    //     self.updateTradesByTradeFiles(data, function (err, result) {
    //         if (err) {
    //             logger.error("Error in updating Trade File information(saveTradeFilesInfo()) " + err);
    //             return cbFunction(err);
    //         }
    //         if (result) {
    //             logger.debug("Successfully updated Trades with newly created Trade File Id(saveTradeFilesInfo())");

    //         }
    //         return cbFunction(null, result);
    //     });
    // } else {
    //     return cbFunction(errorOccurred);
    // }
};

TradeFilesService.prototype.updateTradesByTradeFiles = function (data, cb) {
    logger.info("Update Trades by created Trade Files service called(updateTradesByTradeFiles())");
    tradeFilesDao.updateTradesByTradeFiles(data, function (err, response) {
        if (err) {
            logger.error("Error in updating Trades by created Trade Files(updateTradesByTradeFiles()) " + err);
            return cb(err);
        }
        if (response.affectedRows > 0) {
            logger.debug("Successfully updated Trades with newly created Trade File Id(updateTradesByTradeFiles())");

        }
    });
};

TradeFilesService.prototype.createSignedURL = function (data, cb) {
    logger.info("Create Signed URL service called (createSignedURL()) ");
    var urlToSign = data;
    var signedUrlExpireTime = constants.TOKEN_EXPIRES_IN;
    var params = {
        Bucket: s3Properties.s3.bucket,
        Key: urlToSign,
        Expires: signedUrlExpireTime
    };
    awsS3.getSignedUrl('getObject', params, function (err, url) {
        if (err) {
            logger.error("Error in getting Signed Url from S3 (createSignedURL()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Create Signed URL return successfully (createSignedURL()) ");
        return cb(null, url);
    });
};

TradeFilesService.prototype.getSignedUrl = function (data, cb) {
    logger.info("Get Signed Url service called (getSignedUrl()) ");
    var tradeFilesList = [];
    var self = this;
    for (var i = 0; i < data.filesList.length; i++) {
        var path = data.filesList[i].path + "" + data.filesList[i].name;
        self.createSignedURL(path, function (err, newSignedURL) {
            if (err) {
                logger.error("Error in creating signedURL (getSignedUrl()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            data.filesList[i].URL = newSignedURL
        });
    }
    logger.info("Signed Url response return successfully (getSignedUrl()) ");
    return cb(null, data);
};

TradeFilesService.prototype.directorySyncProcess = function (data, cb) {
    logger.info(" Directory Sync Process service called (directorySyncProcess())");
    var self = this;
    var client = s3.createClient({
        maxAsyncS3: 10,     // this is the default 
        s3RetryCount: 5,    // this is the default 
        s3RetryDelay: 10, // this is the default 
        multipartUploadThreshold: 20971520, // this is the default (20 MB) 
        multipartUploadSize: 15728640, // this is the default (15 MB) 
        s3Options: {
            accessKeyId: s3Properties.accessKeyId,
            secretAccessKey: s3Properties.secretAccessKey,
        },
    });

    logger.info("Create s3 client for sync Process (directorySyncProcess()) ");
    var params = {
        localDir: "/tradefiles",
        deleteRemoved: false,

        s3Params: {
            Bucket: s3Properties.s3.bucket,
            Prefix: "tradefiles",
        },
    };
    logger.info("Prepare params for s3 sync Process (directorySyncProcess()) ");

    var syncProcess = client.uploadDir(params);
    syncProcess.on('error', function (err) {
        logger.error(" Error in  s3 sync Process (directorySyncProcess()) " + err.stack);
    });
    syncProcess.on('progress', function (res) {
        logger.info(" S3 sync Process inProgress (directorySyncProcess()) ");
        logger.debug("Progress -> Total Size = " + syncProcess.progressTotal + " and Processed Size = " + syncProcess.progressAmount);
    });
    syncProcess.on('fileUploadStart', function (data, part) {
        logger.info(" S3 sync Process fileUploadStart (directorySyncProcess()) ");
    });
    syncProcess.on('fileUploadEnd', function (data, part) {
        logger.info(" S3 sync Process fileUploadEnd (directorySyncProcess()) ");
    });
    syncProcess.on('end', function () {
        logger.debug(" S3 sync Process done (directorySyncProcess()) ");
        self.notificationProcess(data, '1', function (err, status) {
            if (err) {
                logger.error("Error in notification Process (directorySyncProcess()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                return status;
            }
        });
    });
};

TradeFilesService.prototype.notificationProcess = function (data, value, cb) {
    logger.info("Notification Process  service called (notificationProcess()) ");
    var self = this;
    self.getTradeFilesCount(data, function (err, self, count) {
        if (err) {
            logger.error("Error in getting TradeFiles Count   (notificationProcess()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        var notificationData = {
            "typeId": 3,
            "code": "TRADEORD",
            "menuNotification": {
                "total": count.count,
                "increment": value
            },
            user:data.user
        };
        logger.info("Notification Process  START (notificationProcess()) " + util.inspect(notificationData));
        notificationService.sendNotification(notificationData, function (err, status, success) {
            if (err) {
                logger.error("Error in sending Notification  (notificationProcess()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("Notification Process  END (notificationProcess()) ");
                return cb(null, true);
            }
        });
    });
};

module.exports = TradeFilesService;