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
var multer = require('multer');
var util = require('util');
var ModelParser = require('xlsx');
// var ModelParser = require('xlsjs');
var fs = require('fs');
var _ = require('underscore');
var helper = require("helper");
var TradeService  = require('service/tradeorder/TradeService.js');
var TradeImportDao = require('dao/tradeorder/TradeImportDao');
var tradeService = new TradeService();
var tradeImportDao = new TradeImportDao();

var asyncFor = helper.asyncFor;
var TradeImportService = function () { };

TradeImportService.prototype.importDocument = function (data, cb) {
    var self = this;
    var user = data.user;
    var reqId = data.reqId;
    logger.info("Account document import Service called (importDocument())");
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
            return cb(err, responseCode.UNPROCESSABLE);
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
            data.importedData = result;
            self.validateImportedData(data, function (err, validate) {
                if (err) {
                    logger.error("Error in validating Imported Data (importDocument())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Validate Imported Data successfully (importDocument())");
                return cb(null, responseCode.SUCCESS, validate);
            })
        }
        else{
            return cb(null, responseCode.SUCCESS, "No result found");
        }
    });
};

TradeImportService.prototype.importFile = function (req, fileType, filePath, cb) {
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
                var headers = headers[0].split(',');
             
                 var templateHeaders = [];
                // if (documentType === 'portfolios') {
                // }
                // if (documentType === 'accounts') {
                templateHeaders.push("Account Id");
                templateHeaders.push("Account Number");
                templateHeaders.push("Action");
                templateHeaders.push("Security");
                templateHeaders.push("Dollar");
                templateHeaders.push("Shares");
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

TradeImportService.prototype.parseWorkBookToJson = function (workbook, cb) {
    var first_sheet_name = workbook.SheetNames[0];
    var row = ModelParser.utils.sheet_to_row_object_array(workbook.Sheets[first_sheet_name]);
    if (row.length == 0) {
        return cb(messages.NORowFound, null);
    }
    return cb(null, row);
};

TradeImportService.prototype.headerValidator = function (workbook, documentType, cb) {
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
    
    // }
    // if (documentType === 'accounts') {
    templateHeaders.push("Account Id");
    templateHeaders.push("Account Number");
    templateHeaders.push("Action");
    templateHeaders.push("Security");
    templateHeaders.push("Dollar");
    templateHeaders.push("Shares");
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

TradeImportService.prototype.validateImportedData = function (data, cb) {
    logger.info("Validate Imported Data service called (validateImportedData())");
    var self = this;
    var accountIdList = [];
    var accountNumberList  = [];
    var securityList = [];
    var trades = [];
    var securityMap = {};
    var accountIdMap = {};
    var accountNumberMap = {};
    var accountId = 'Account Id';
    var accountNumber = 'Account Number';
    var action = "Action";
    var security = "Security";
    var dollars = 'Dollars';
    var shares = "Shares";
    var importedData = data.importedData;
    importedData.forEach(function (element) {
        var trade = {};
        trade.error = "";
        trade.isValid = true;
        if(element[accountId]) {
            trade.accountId = element[accountId] ;
            accountIdList.push('"'+element[accountId]+'"');
        }
        else if(element[accountNumber]) {
            trade.accountNumber = element[accountNumber] ;
            accounts.push('"'+element[accountNumber]+'"');
        }
        else {
            trade.error = "Account id or Account number";
        }
        if(element[action]) {
            trade.action = element[action];
        }
        else {
            if(trade.error.length >0) {
                trade.error += ", ";    
            }
            trade.error += "Action";
        }
        if(element[security]) {
            trade.security =  element[security] ;
            securityList.push('"'+element[security]+'"');
        }
        else {
            if(trade.error.length >0) {
                trade.error += ", ";    
            }
            trade.error += "Security";
        }
        if(element[dollars]) {
            trade.dollars = element[dollars];
        }
        else if(element[shares]) {
            trade.shares = element[shares];
        }
        else {
            if(trade.error.length >0) {
                trade.error += ", ";    
            }
            trade.error += " Dollars or Shares";
        }
        if(trade.error.length>0){
            trade.isValid = false;
            trade.error += " Can not be null";
        }
        trades.push(trade);
    }, this);
    if (trades.length >0) {
        data.trades = trades;
        data.accountIdList = accountIdList;
        data.accountNumberList = accountNumberList;
        data.securityList = securityList;
        self.validateImportData(data, function(err, result){
            if(err) {
                return cb(err, null);    
            }
            else {
               asyncFor(result, function(element, index, next) {
                    if(element.isValid){
                            data.accountId = element.accId;
                            data.securityId = element.securityId;
                            data.actionId = element.actionId;
                            data.quantity = element.shares;
                            data.dollarAmount = element.dollars
                            tradeService.validateTrade(data, function(err, status, result){
                                if(err){
                                    logger.error("error in validating trade "+err);
                                    element.isValid = false;
                                    element.error = err;
                                    next();
                                }
                                else {
                                    console.log(data.data.isPending);
                                    if((data.data.isPending == "true" || data.data.isPending == 1) && element.isValid){
                                        tradeService.checkDuplicateTrade(data, function(err, status, result){
                                            if(result && result.length > 0){
                                                element.isValid = false;
                                                element.error = messages.tradeAlreadyExistWarning+result[0].tradeInstanceId;
                                                next();
                                            }
                                            else{
                                                next();
                                            }
                                        });
                                    }
                                    else{
                                        next();
                                    }
                                }
                            });
                    }
                    else {
                        next(null);
                    }
              
                },
                function(err, response) {
                   return cb(null, result);
                }); 
            }
        });
    }
    else {
        return cb(null, trades);
    }
};

TradeImportService.prototype.validateImportData = function(data, cb){
    tradeImportDao.getValidAccounts(data, function (err, accounts) {
            if (err) {
                logger.error("Error in validating Imported Data (validateImportedData())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            tradeImportDao.getValidSecurities(data, function (err, securities) {
                if (err) {
                    logger.error("Error in validating Imported Data (validateImportedData())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                tradeService.getTradeActions(data, function(err, status, tradeActions){
                        if(err){
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        data.trades.forEach(function(trade){
                        if(trade.isValid) {
                                accounts.forEach(function(account){
                                if(trade.accountId == account.accountId || trade.accountNumber == account.accountNumber) {
                                    trade.accId = account.id;
                                } 
                                });
                                if(trade.accId == undefined || trade.accId == null){
                                    trade.isValid = false;
                                    trade.error = messages.accountNotFound;
                                }
                        }
                        if(trade.isValid) {
                            securities.forEach(function(security){
                                if(trade.security == security.symbol){
                                    trade.securityId = security.id;
                                } 
                            });
                        
                                if(trade.securityId == undefined || trade.securityId == null) {
                                    trade.isValid = false;
                                    trade.error = messages.securityNotFound;
                                }
                        }
                        if(trade.isValid){
                                tradeActions.forEach(function(tradeAction){
                                    if(trade.action == tradeAction.name){
                                        trade.actionId = tradeAction.id; 
                                    }
                                });
                                if(trade.actionId == undefined || trade.actionId == null) {
                                    trade.isValid = false;
                                    trade.error = messages.tradeActionNotFound;
                                }
                           }
                        });
                        return cb(null, data.trades); 
                    });
            });
        });    
}

TradeImportService.prototype.uploadTrades = function(data, cb) {
    logger.info("Trade upload service called uploadTrades()");
    if(data.trades && data.trades.length > 0) {
        asyncFor(data.trades, function(element, index, next) {
            if(element.isValid){
                data.accountId = element.accId;
                data.securityId = element.securityId;
                data.actionId = element.actionId;
                data.quantity = element.shares;
                data.dollarAmount = element.dollars;
                tradeService.saveTrade(data, function(err, status, response){
                    if(err){
                        logger.error(err);
                    }
                    return next(null, response);
                    
                }); 
            } 
            else {
                return next();
            }        
        },
        function(err, rsponse) {
            cb(null, responseCode.SUCCESS, { message: "Trades generated successfully" });
        }); 
    }
    else {
        return cb(null, responseCode.INTERNAL_SERVER_ERROR, "No Trade found");
    }
        
}

module.exports = TradeImportService;

