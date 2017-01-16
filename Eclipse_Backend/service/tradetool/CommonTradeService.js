var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var csv = require('csv-parser')
var fs = require('fs');
var parse = require('csv-parse');
var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var request = require('request');
var util = require('util');
var CommonTradeDao = require('dao/tradetool/CommonTradeDao.js');
var CommonTradeConverter = require("converter/tradetool/CommonTradeConverter.js");

var multer = require('multer');
var util = require('util');
var ModelParser = require('xlsx');
// var ModelParser = require('xlsjs');
var fs = require('fs');
var _ = require('underscore');

var commonTradeDao = new CommonTradeDao();
var commonTradeConverter = new CommonTradeConverter();
var CommonTradeService = function () { };


CommonTradeService.prototype.importDocument = function (data, cb) {
    var self = this;
    var user = data.user;
    var reqId = data.reqId;
    logger.info("Account/Portfolio document import Service called (importDocument())");
    if (data.fileAttributeName != 'document') {
        return cb(messages.invalidFileAttributeName, responseCode.BAD_REQUEST);
    }
    if (data.file == undefined) {
        return cb(messages.fileDataNotFound, responseCode.BAD_REQUEST);
    }
    var fileName = data.file.originalname;
    var fileNameArray = fileName.split('.');
    var fileType = fileNameArray[fileNameArray.length - 1];
    var fileLocation = data.file.path;
    if (fileType != 'xls' && fileType != 'xlsx' && fileType != 'csv') {
        return cb(messages.invalidModelType, responseCode.BAD_REQUEST);
    }
    //parse file start
    self.importFile(data, fileType, fileLocation, function (err, status, result) {
        if (err) {
            logger.error("Error in parsing imported file (importDocument())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (status && result) {
            logger.debug("Error while Validating uploaded file Format (importDocument())");
            return cb(messages.inValidFileFormat, responseCode.UNPROCESSABLE);
        }
        if (status) {
            logger.debug("Error while Validating uploaded file headings, headers are no valid. (importDocument())");
            return cb(messages.fileHeadersNotValid, responseCode.UNPROCESSABLE);
        }
        logger.info("Imported file parse successfully (importDocument())");
        if (result) {
            data.importedData = result
            self.validateImportedData(data, function (err, validate) {
                if (err) {
                    logger.error("Error in validating Imported Data (importDocument())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Validate Imported Data successfully (importDocument())");
                return cb(null, responseCode.SUCCESS, validate);
            })
        }
    });
};

CommonTradeService.prototype.importFile = function (req, fileType, filePath, cb) {
    var self = this;
    var documentType = req.data.documentType;
    if (fileType === 'xls' || fileType === 'xlsx') {
        try {
            var workbook = ModelParser.readFile(filePath);
        } catch (error) {
            return cb(null, responseCode.UNPROCESSABLE, error);
        }
        self.headerValidator(workbook, documentType, function (err, result) {
            if (err) {
                logger.error('Error while Validating uploaded file headings, headers are no valid.');
                return cb(null, responseCode.UNPROCESSABLE, null);
            }
            logger.info('heading validation of imported file Successfully passed.');
            logger.info('Converting file data to readable object --> JSON format');
            self.parseWorkBookToJson(workbook, function (err, convertedFileData) {
                if (err) {
                    logger.error('Error occurred while converting file data to parsable format --> JSON format' + err);
                    return cb(err);
                }
                logger.info('Imported file successfully converted to readable format.');
                return cb(null, null, convertedFileData);
            });
        });
    }
    if (fileType === 'csv') {
        var workbook = [];
        var result = [];
        var keyValue = {};
        var counter = 0;
        var keyName = null;
        fs.createReadStream(filePath)
            .pipe(parse({ delimiter: ':' }))
            .on('data', function (csvRow) {
                if (counter == 0) {
                    keyName = csvRow;
                }
                if (counter >= 1) {
                    var myResultJson = {};
                    myResultJson[keyName] = csvRow[0];
                    result.push(myResultJson);
                }
                workbook.push(csvRow);
                counter++;
            })
            .on('end', function () {
                var headers = workbook[0];

                var templateHeaders = [];
                // if (documentType === 'portfolios') {
                templateHeaders.push("Portfolio Id");
                // }
                // if (documentType === 'accounts') {
                templateHeaders.push("Account Id");
                templateHeaders.push("Account Number");
                //  }

                var invalidOrMissingHeader = _.indexOf(templateHeaders, headers[0]);

                if (invalidOrMissingHeader < 0) {
                    return cb(null, invalidOrMissingHeader);
                }
                if (invalidOrMissingHeader >= 0) {
                    return cb(null, null, result);
                }
            });
    }
};

CommonTradeService.prototype.parseWorkBookToJson = function (workbook, cb) {
    var first_sheet_name = workbook.SheetNames[0];
    var row = ModelParser.utils.sheet_to_row_object_array(workbook.Sheets[first_sheet_name]);
    if (row.length == 0) {
        return cb(messages.emptyModel, null);
    }
    return cb(null, row);
};

CommonTradeService.prototype.headerValidator = function (workbook, documentType, cb) {
    var first_sheet_name = workbook.SheetNames[0];
    /* Get worksheet */
    var worksheet = workbook.Sheets[first_sheet_name];

    /**validate cell sheet headers */
    var fileHeaderArray = [];
    var errorArray = [];
    for (var document in worksheet) {
        if (document == "A2") {
            break; //break because we want to read only first row which is header.
        }

        if (document == "!ref") {
            continue;
        }

        if (worksheet[document].v == undefined) {
            errorArray.push({
                "error": "Missing heading in Sheet name : " + first_sheet_name + "on first row"
            });
            continue;
        }
        fileHeaderArray.push(worksheet[document].v);
    }
    var templateHeaders = [];
    //   if (documentType === 'portfolios') {
    templateHeaders.push("Portfolio Id");
    // }
    // if (documentType === 'accounts') {
    templateHeaders.push("Account Id");
    templateHeaders.push("Account Number");
    // }
    var invalidOrMissingHeader = _.indexOf(templateHeaders, fileHeaderArray[0]);
    if (invalidOrMissingHeader < 0) {
        return cb(invalidOrMissingHeader);
    }
    // if (errorArray.length > 0) {
    //     return cb(errorArray, null);
    // }
    return cb(null, {});
};

CommonTradeService.prototype.validateImportedData = function (data, cb) {
    logger.info("Validate Imported Data service called (validateImportedData())");
    var self = this;
    var validData = {};
    var portfolioId = 'Portfolio Id';
    var portfolios = [];
    var accounts = [];
    var accountId = 'Account Id';
    var amount = 'Amount';
    var accountNumber = 'Account Number';
    var importedData = data.importedData;
    var amountMap = {
			
	};
    
    importedData.forEach(function (element) {

//    	var enteredAmount  = element[amount];
    	
        if (element[accountId]) {
        	
        	
            // accounts.push(parseInt(element[accountId], 10));
            accounts.push('"' + element[accountId] + '"');
            
            amountMap[element[accountId]] = element[amount] ? parseFloat(element[amount]) : null;
            validData = {
                "accounts": accounts,
                "accountId": true
            };
        }
        if (element[accountNumber]) {
            accounts.push('"' + element[accountNumber] + '"');
            amountMap[element[accountNumber]] = element[amount] ? parseFloat(element[amount]) : null;
            
            validData = {
                "accounts": accounts,
                "accountNumber": true
            };
        }
        if (element[portfolioId]) {
            portfolios.push(parseInt(element[portfolioId], 10));
            amountMap[element[portfolioId]] = element[amount] ? parseFloat(element[amount]) : null;
            
            validData = {
                "portfolios": portfolios,
            };
        }
    }, this);
    if (validData) {
        data.validData = validData;
        commonTradeDao.validateImportedData(data, function (err, valid) {
            if (err) {
                logger.error("Error in validating Imported Data (validateImportedData())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (valid) {
                data.valid = valid;
                logger.debug(JSON.stringify(amountMap));
                self.prepareFinalImportedData(data, amountMap, function (err, result) {
                    if (err) {
                        logger.error("Error in prepare final Imported Data (validateImportedData())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    logger.info("Prepare Final Imported Data successfully (validateImportedData())");
                    return cb(null, result);
                });
            }
        });
    }
    else {
        return cb(null, validData);
    }
};

CommonTradeService.prototype.prepareFinalImportedData = function (data, amountMap, cb) {
    logger.info("Prepare final imported Data service called (prepareFinalImportedData())");
    var allData;
    var valid = data.valid;
    var varifyedId = [];
    var result = [];
    var finalResult = {};

    if (data.validData.portfolios) {
        allData = data.validData.portfolios;
        allData = _.uniq(allData);
        valid.forEach(function (element) {
            varifyedId.push(element.id);
        }, this);
        var inValid = _.difference(allData, varifyedId);
        finalResult.recordType = 'portfolio'
        valid.forEach(function (varifyed) {
            var finalValidId = {};
            finalValidId.id = varifyed.id;
            finalValidId.name = varifyed.name;
            finalValidId.accountId = null;
            finalValidId.accountNumber = null;
//            finalValidId.amount = amountMap[varifyed.id];
            finalValidId.isValid = true;
            result.push(finalValidId);
        });
        inValid.forEach(function (inValidId) {
            var finalInValidId = {};
            finalInValidId.id = inValidId;
            finalInValidId.name = null;
            finalInValidId.accountId = null;
            finalInValidId.accountNumber = null;
//            finalInValidId.amount = amountMap[inValidId];
            finalInValidId.isValid = false;
            result.push(finalInValidId);
        });
        finalResult.records = result;
    }

    if (data.validData.accountId) {
        allData = data.validData.accounts;
        allData = _.uniq(allData);
        valid.forEach(function (element) {
            varifyedId.push(element.accountId);
        }, this);
        //var inValid = _.difference(allData, varifyedId);
        var inValid = [];
        allData.forEach(function (element) {
            var tt = (element.replace('"', '').replace('"', ''));
            var ww = varifyedId.indexOf(tt);
            if (ww >= 0) {

            } else {
                inValid.push(tt);
            }
        });

        finalResult.recordType = 'account'
        valid.forEach(function (varifyed) {
            var finalValidId = {};
            finalValidId.id = varifyed.id;
            finalValidId.name = varifyed.name;
            finalValidId.accountId = varifyed.accountId;
            finalValidId.accountNumber = varifyed.accountNumber;
            finalValidId.amount = amountMap[varifyed.accountId];
            finalValidId.isValid = true;
            result.push(finalValidId);
        });
        inValid.forEach(function (inValidId) {
            var finalInValidId = {};
            finalInValidId.id = null;
            finalInValidId.name = null;
            finalInValidId.accountId = inValidId;
            finalInValidId.accountNumber = null;
            finalInValidId.amount = amountMap[inValidId];
            finalInValidId.isValid = false;
            result.push(finalInValidId);
        });
        finalResult.records = result;

    }

    if (data.validData.accountNumber) {
        allData = data.validData.accounts;
        valid.forEach(function (element) {
            varifyedId.push(element.accountNumber);
        }, this);
        var inValid = [];
        allData.forEach(function (element) {
            var tt = (element.replace('"', '').replace('"', ''));
            var ww = varifyedId.indexOf(tt);
            if (ww >= 0) {

            } else {
                inValid.push(tt);
            }
        });
        finalResult.recordType = 'account'
        valid.forEach(function (varifyed) {
            var finalValidId = {};
            finalValidId.id = varifyed.id;
            finalValidId.name = varifyed.name;
            finalValidId.accountId = varifyed.accountId;
            finalValidId.accountNumber = varifyed.accountNumber;
            finalValidId.amount = amountMap[varifyed.accountNumber];
            finalValidId.isValid = true;
            result.push(finalValidId);
        });
        inValid.forEach(function (inValidId) {
            var finalInValidId = {};
            finalInValidId.id = null;
            finalInValidId.name = null;
            finalInValidId.accountId = null;
            finalInValidId.accountNumber = inValidId;
            finalInValidId.amount = amountMap[inValidId];
            finalInValidId.isValid = false;
            result.push(finalInValidId);
        });
        finalResult.records = result;
    }
    return cb(null, finalResult);
};

CommonTradeService.prototype.getTradeSide = function (data, cb) {
    logger.info("Get trade side service called (getTradeSide())");

    commonTradeConverter.getTradeSideResponse(data, function (err, result) {
        if (err) {
            logger.error("Error in getting Trade Side list (getTradeSide()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCode.SUCCESS, result);
    });
};

CommonTradeService.prototype.getAllowWashSales = function (data, cb) {
    logger.info("Get trade side service called (getAllowWashSales())");

    // commonTradeDao.getAllowWashSales(data, function (err, result) {
    //     if (err) {
    //         logger.error("Error in getting allow wash sales list (getAllowWashSales()) " + err);
    //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    //     }
    //     return cb(null, responseCode.SUCCESS, result);
    // });
    var result = [
        {
            "id": 1,
            "name": "Yes"
        },
        {
            "id": 2,
            "name": "No"
        }
    ];
    return cb(null, responseCode.SUCCESS, result);
};

CommonTradeService.prototype.getAllowShortTermGains = function (data, cb) {
    logger.info("Get Allow Short Term Gains service called (getAllowShortTermGains())");

    // commonTradeDao.getAllowShortTermGains(data, function (err, result) {
    //     if (err) {
    //         logger.error("Error in getting allow short term gains list (getAllowShortTermGains()) " + err);
    //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    //     }
    //     return cb(null, responseCode.SUCCESS, result);
    // });
    var result = [
        {
            "id": 1,
            "name": "Allow"
        },
        {
            "id": 2,
            "name": "Full Position Disallow"
        },
        {
            "id": 3,
            "name": "TaxLot Disallow"
        }
    ];
    return cb(null, responseCode.SUCCESS, result);
};
CommonTradeService.prototype.getModelTypeForTrades = function (data, cb) {
    logger.info("Get Model Type For Trades service called (getModelTypeForTrades())");

    commonTradeDao.getModelTypeForTrades(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting Model Type For Trades (getModelTypeForTrades()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            commonTradeConverter.getModelTypeForTradesResponse(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in converting  Model Type For Trades (getModelTypeForTrades()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            return cb(null, responseCode.SUCCESS, []);

        }
    });
};

module.exports = CommonTradeService;

