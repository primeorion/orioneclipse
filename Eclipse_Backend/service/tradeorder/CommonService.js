"use strict";

var moduleName = __filename;
var TradeDao = require('dao/tradeorder/TradeDao.js');
var lodash = require("lodash");
var tradeDao = new TradeDao();
var CommonDao = require('dao/tradeorder/CommonDao.js');
var PortfolioDao = require('dao/portfolio/PortfolioDao.js');
var ModelDao = require('dao/model/ModelDao.js');
var TradeInstanceDao = require('dao/tradeorder/TradeInstanceDao.js');
var securityDao = require('dao/security/SecurityDao.js');
var securityService = require('service/security/SecurityService.js');
var TradeOrderConverter = require('converter/tradeorder/TradeOrderConverter.js');
var TradeInstanceConverter = require('converter/tradeorder/TradeInstanceConverter.js');
var NotificationService = require('service/notification/NotificationService.js');
var UtilService = require('service/util/UtilService.js');
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var enums = config.applicationEnum;
var rebalanceUrl = config.env.prop.rebalanceUrl;
var messages = config.messages;
var request = require("request");
var responseCodes = config.responseCode;
var localCache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao.js');
var CommonService = function () { }
var commonDao = new CommonDao();
var portfolioDao = new PortfolioDao();
var modelDao = new ModelDao();
var tradeInstanceDao = new TradeInstanceDao();
var tradeOrderConverter = new TradeOrderConverter();
var tradeInstanceConverter = new TradeInstanceConverter();
var notificationService = new NotificationService();
var helper = require("helper");
var asyncFor = helper.asyncFor;
var utilService = new UtilService();
var util = require('util');

CommonService.prototype.generateQuickTrade = function (data, cb) {
    var self = this;
    data.tradeInstance = {};
    data.tradeInstance.tradingAppId = 2;
    //convert json according to validate trade;
    console.log(data);
    self.validateTrade(data, function(err, status, trades){
        if(err){
            logger.error("error while validating the trades "+err);
            if(status = responseCodes.UNPROCESSABLE){
                err = "Error- "+err;
            }
            cb(err, status);
        }   
        else{   
            if(trades && trades.length > 0){
                data.trades = trades;
                self.generateTrade(data, function(err, response){
                    if(err){
                        logger.error("Error during trade generation "+err);
                        return cb(responseCodes.INTERNAL_SERVER_ERROR, {"message":messages.tradeGenerationError});
                    }
                    else {
                        if(data.trades[0].warningMessages){
                            return cb(null, responseCodes.SUCCESS, {"Warnings": data.trades[0].warningMessages});
                        }
                        else{
                            return cb(null, responseCodes.SUCCESS, {"message":messages.tradeGenerationSuccess});
                        }
                    }
                });
            }
            else {
                return cb(err, status, {message:"No Trade to genrate"});
            }
        }
     })
};
CommonService.prototype.validateTrade = function(data, cb){
    var trades = [];
    var self = this;
    //call  validation logic
    // call convertor multiple times
    data.errorList = [];    
    self.generateTradeOrder(data, function(err, status, response){
       if(err) {
            return cb(err, status, response);
       }  
       if(response && response.trades && response.trades.length>0){
            response.trades.forEach(function(tradeObject){
                tradeOrderConverter.getNewEntity(tradeObject, function(err,result){
                    if(err){
                        logger.error("error while converting trade object"+ err);
                        return cb(err, null);
                    }
                     if(data.actionId === enums.TRADE_ORDER.ACTION.SELL){
                        console.log(result.accountId);
                        data.accountId = result.accountId;
                        tradeDao.checkDuplicateTrade(data, function(err, duplicateTrade){
                            if(duplicateTrade && duplicateTrade.length >0){
                                var tradeOrderMessage  = {};
                                tradeOrderMessage.shortCode = enums.TRADE_ORDER_MESSAGE.SHORT_CODES.TRADE_RULE_ALREADY_TRADED;
                                tradeOrderMessage.arguments = duplicateTrade[0].id+";"+duplicateTrade[0].createdDate;
                                result.tradeOrderMessages.push(tradeOrderMessage); 
                                result.warningMessages.push(messages.tradeAlreadyExistWarning+duplicateTrade[0].tradeInstanceId);
                            }
                        })
                    }
                    trades.push(result);
                });
            });
            return cb(null, responseCodes.SUCCESS, trades);
       }else{
            return cb(null, responseCodes.SUCCESS, []);
       }   
    });
}
CommonService.prototype.generateTrade = function (data, cb) {
    logger.info("Generate trade service called (generateTrade())");

    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    data.tradesInstance = {};
    // TODO - create converter to get tradeInstance object from data
    data.tradesInstance.tradingAppId = data.tradeInstance.tradingAppId;
    data.tradesInstance.notes = data.tradeInstance.notes ? data.tradeInstance.notes : null;
    data.tradesInstance.description = "description";
    var self = this;
    // above code will be replaced by converter
    tradeInstanceDao.saveTradeInstance(data, function (err, tradeInstanceValue) {
        if (err) {
            logger.error("Error in saving trade instance (generateTrade()) " + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (tradeInstanceValue.affectedRows > 0) {
            data.tradeInstanceId = tradeInstanceValue.insertId;
             var tradeIds = [];
             asyncFor(data.trades, function(trade, index, next){
                // trade.positionId  =63818;
                data.tradeData = trade;
                commonDao.generateTrade1(data, function (err, result) {
                    if (err) {
                        logger.error("Error in generating trades (generateTrade()) " + err);
                        next(err);
                        return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                    }
                    if (result && result.affectedRows > 0) {
                        logger.info("Trades generated successfully (generateTrade()) " + err);
                        trade.id = result.insertId;
                        tradeIds.push(result.insertId);
                        if(trade.tradeOrderMessages && trade.tradeOrderMessages.length>0){
                            data.warningMessages = trade.tradeOrderMessages;
                            data.tradeId = trade.id;
                            commonDao.generateTradeOrderMessages(data, function(err, result){
                                if(err){
                                    next();
                                    return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                                }                            
                                else{
                                    next();
                                }
                            })
                        }
                        else{
                            next();
                        }
                        
                    } else {
                        logger.error("Unable to generate trade orders (generateTrade()) " + err);
                        next();
                    }
                });
            }, function(err, result){
                var instance = {
                    instanceId: tradeInstanceValue.insertId,
                    tradeId: tradeIds
                }
                data.tradeLength = tradeIds.length;
                if(!err) {
                    self.sendNotification(data, function(err, status, result){
                      
                           return cb(null, responseCodes.CREATED, instance);
                      
                    });
                }
                else{
                    return cb(null, responseCodes.CREATED, instance);
                }
            });
        } else {
            logger.error("Unable to saving  trade instance (generateTrade()) " + err);
            return cb(null, responseCodes.UNPROCESSABLE, messages.unableToSavingTradeInstance );
        }
    });
}

CommonService.prototype.sendNotification = function(data, cb){
   logger.info("Send notification service called sendNotification()");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    tradeDao.getCountOfTrades(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting trades count " + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched.length > 0) {
              var notificationData = {
                "typeId": 3,
                "code": "TRADEORD",
                "menuNotification": {
                    "total": fetched[0],
                    "increment": data.tradeLength
                },
                "user":data.user
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
        } else {
            logger.info("Empty trades List returned (getList())");
            return cb(null, responseCodes.SUCCESS, []);
        }
    });
    
};

CommonService.prototype.generateTradeByRebalance = function (data, cb) {
    var self = this;
    var portfolioId = data.portfolioId;
    var finalUrl = rebalanceUrl + "rebalance/model?modelId=" + 15 + "&portfolioId=" + portfolioId;
    if (data.rebalanceType == "cashDistribution" || data.rebalanceType == "cashContribution") {
        finalUrl = rebalanceUrl + "rebalance?accountId=" + data.accountId + "&portfolioId=" + portfolioId + "&amountToRaiseOrSpend=" + data.amount
            + "&rebalanceType=" + data.rebalanceType;
    }
    else if (data.rebalanceType == "cashNeed") {
        finalUrl = rebalanceUrl + "cashNeedRebalance?portfolioId=" + portfolioId;
    }
    var url = {
        url: finalUrl + "",
        timeout: self.CONNECT_API_TIMEOUT
    };
    request.get(url, function (err, response, body) {
        if (err) {
            logger.error("Err while rebalancing model " + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (response.statusCode !== responseCodes.SUCCESS) {
            return cb(messages.rebalanceError, responseCodes.INTERNAL_SERVER_ERROR);
        }
		/*if(response.statusCode === responseCodes.SUCCESS && !response.success){
			return cb(messages.rebalanceError, responseCodes.INTERNAL_SERVER_ERROR);
		}*/
        try {
            body = JSON.parse(body);
        } catch (e) {
            return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        cb(err, response.statusCode, { "message": "Trades generated successfully" });
    });

}
/*******Input for Below service*********************/
// {
// "typeId":account(1)/portfolio(2),
// "id":"acccountId/portfolioId",
// "actionId":"SELL(2)/BUY(1)/REBALANCE(3) etc",
// "securityId":,
// "sendTradesImmediate":{Boolean},
// "actionProperties":{
//     "typeId":"Dolar(1)/Share(2)/Percent(3)",
//     "value":VALUE
//     }
// }   
/***************************************************/
CommonService.prototype.generateTradeOrder = function (data, cb) {
    var self = this;
    data.actualTypeId = data.typeId;
    data.warningMessage = {};
    data.tradeOrderMessages = {};
    var accounts = [];
    if (data.typeId === enums.TRADE_ORDER.TYPE.PORTFOLIO) {
        self.genrateTradeOrderForPortfolio(data, function (err, status, result) {
            return cb(err, status, result);
        });
    } else if (data.typeId === enums.TRADE_ORDER.TYPE.ACCOUNT) {
        data.accountId = data.id;
        accounts.push(data);
        self.getAccountsDetailAndGenrateTradeOrder(data, accounts, function(err, status, result){
            return cb(err, status, result);
        });
    } else {
        logger.debug("Wrong trade order type (genrateTradeOrder())");
        return cb(messages.invalidTradeOrderTypeId, responseCodes.UNPROCESSABLE);
    }
}
CommonService.prototype.getAccountSecuritiesAndGenrateTradeOrdersForAccounts = function(data, inputAccounts, cb){
    logger.info("in getAccountSecuritiesAndGenrateTradeOrdersForAccounts() ");
    var tradeOrders = [];
    var self = this;
    var outerCounter = 0;
    if(inputAccounts && inputAccounts.length>0 ){
        inputAccounts.forEach(function(account){
            outerCounter++;
            var innerCounter = 0;
            var accountId = account[1][0].accountId;
            var positionDetail = account[2];
            if(positionDetail && positionDetail.length>0 ){
                positionDetail.forEach(function(position){
                    innerCounter++;
                    var securityId = position.securityId;
                    var tempData = {};
                    var actProp = {};
                    tempData.typeId = data.typeId;
                    tempData.id = position.accountId;
                    tempData.actionId = data.actionId;
                    tempData.securityId = securityId;
                    tempData.sendTradesImmediate = data.sendTradesImmediate;
                    tempData.warningMessage = {};
                    tempData.warningMessage[accountId] = data.warningMessage[accountId];
                    tempData.tradeOrderMessages = {};
                    tempData.tradeOrderMessages[accountId] = data.tradeOrderMessages[accountId]
                    self.genrateTradeOrderForAccount(tempData, account,function(err, status, tradeOrder){
                        if(err){
                            logger.error("Error in order genration (genrateTradeOrdersForAccounts())"+err);
                            if(data.typeId === enums.TRADE_ORDER.TYPE.ACCOUNT){
                                return cb(err, status);
                            } 
                        }
                        tradeOrders.push(tradeOrder);
                        if(positionDetail.length === innerCounter){
                            return ;
                        }
                    });
                });
            }else{
                logger.debug("No position found for account ");
                return outcb(null, null);;
            }
            if(inputAccounts.length === outerCounter){
                if(tradeOrders && tradeOrders.length>0){
                    var finalTrades = {};
                    finalTrades.trades = tradeOrders;
                    finalTrades.reqId = data.reqId;
                    finalTrades.user = data.user;
                    return cb(null, responseCodes.SUCCESS, finalTrades);
                }else{
                    logger.debug("No order to generate");
                    return cb(messages.noTradeOrder, responseCodes.UNPROCESSABLE)
                }
            }
        });
    }else{
        logger.debug("No account to genrate trade (genrateTradeOrdersForAccounts())");
        return cb(messages.noAccountToGenerateTradeFound, responseCodes.UNPROCESSABLE);
    }
}
CommonService.prototype.getAccountsDetailAndGenrateTradeOrder = function(data, accounts, cb){
    //logger.info("In getAccountsDetailAndGenrateTradeOrder()"+JSON.stringify(accounts));
    var inputAccounts = [];
    var validAccountIds = [];
    var self = this;
    if(accounts && accounts.length>0){
        var counter = 0;
        asyncFor(accounts, function(account, index, next){
            data.typeId = enums.TRADE_ORDER.TYPE.ACCOUNT;
            data.id = account.id;
            var temp = {};
            data.tradeOrderMessages[account.id] = [];
            data.warningMessage[account.id] = [];
            self.getAccountDetailAndValidate(data, function (err, status, result) {
                counter++;
                if (err) {
                    logger.error("Error in get account detail and genrate order (getAccountsDetailAndGenrateTradeOrder())"+err);
                    if (data.actualTypeId === enums.TRADE_ORDER.TYPE.ACCOUNT){
                        return cb(err, status);
                    }
                }
                if(result && result.length>0){
                    if(enums.TRADE_ORDER.ACTION.SELL === data.actionId){
                        var tempPositionDetail = result[2];
                        var position  = utilService.getObjectArrayByPropertyValueFromArray(tempPositionDetail,"securityId",data.securityId);
                        logger.info("The post detail is"+JSON.stringify(position));
                        if(typeof position !== undefined ){
                            validAccountIds.push(result[1][0].accountId);
                            inputAccounts.push(result);
                        }
                    }else{
                        validAccountIds.push(result[1][0].accountId);
                        inputAccounts.push(result); 
                    }
                 }
                 return next(null, result);
             });
        },function(err,result){
            if(enums.TRADE_ORDER.ACTION.LIQUIDATE === data.actionId){
                self.getAccountSecuritiesAndGenrateTradeOrdersForAccounts(data, inputAccounts,function(err, status, result){
                    return cb(err, status, result);
                });
            }else{
                if(validAccountIds && validAccountIds.length>0){
                    data.id = validAccountIds.pop();
                }
                self.applyPrefrencesAndGenrateTradeOrder(data, function(err, status, prefInput, prefMap){
                    if(err){
                        logger.error("Error in apply prefrences (getAccountsDetailAndGenrateTradeOrder())"+err);
                        return cb(err, status);
                    }
                    self.genrateFinalTrade(prefInput, inputAccounts, prefMap, function(err, status, tradeObjects){
                        if(err){
                            logger.error("Error in genrateOrder (getAccountsDetailAndGenrateTradeOrder())"+err);
                            return cb(err, status);
                        }
                        return cb(err, status, tradeObjects);
                    });
                });
            }
        });
        /*accounts.forEach(function(account){
            data.typeId = enums.TRADE_ORDER.TYPE.ACCOUNT;
            data.id = account.id;
            self.getAccountDetailAndValidate(data, function (err, status, result) {
                counter++;
                if (err) {
                    logger.error("Error in get account detail and genrate order (getAccountsDetailAndGenrateTradeOrder())"+err);
                    if (data.actualTypeId === enums.TRADE_ORDER.TYPE.ACCOUNT){
                        return cb(err, status);
                    }
                }
                if(result && result.length>0){
                    inputAccounts.push(result); 
                 }
               if(accounts.length === counter){
                    if(enums.TRADE_ORDER.ACTION.LIQUIDATE === data.actionId){
                        self.getAccountSecuritiesAndGenrateTradeOrdersForAccounts(data, inputAccounts,function(err, status, result){
                            return cb(err, status, result);
                        });
                    }else{
                        self.applyPrefrencesAndGenrateTradeOrder(data, function(err, status, prefInput, prefMap){
                            if(err){
                                logger.error("Error in apply prefrences (getAccountsDetailAndGenrateTradeOrder())"+err);
                                return cb(err, status);
                            }
                            self.genrateFinalTrade(prefInput, inputAccounts, prefMap, function(err, status, tradeObjects){
                                if(err){
                                    logger.error("Error in genrateOrder (getAccountsDetailAndGenrateTradeOrder())"+err);
                                    return cb(err, status);
                                }
                                return cb(err, status, tradeObjects);
                            });
                        }); 
                    }
               }
            });
        });*/
    }else{
        logger.debug("Input should be array (getAccountsDetailAndGenrateTradeOrder())");
        return cb("Wrong Input",responseCodes.UNPROCESSABLE);
    }
}
CommonService.prototype.genrateFinalTrade = function(inputData, accounts, prefrenceMap, cb){
    var self = this;
     var tradeOrders = [];
    self.filterAndSortAccounts(inputData, accounts, prefrenceMap, function(err, status, sortedAccounts){
        if(err){
            logger.error("Error sorting accounts according to prefrence (applyPrefrencesAndGenrateTradeOrder())"+err);
            return cb(err, responseCodes.UNPROCESSABLE);
        }
        self.genrateTradeOrdersForAccounts(inputData, sortedAccounts,function(err, status, result){
            return cb(err, status, result);
        });
    });   
}
CommonService.prototype.genrateTradeOrderForPortfolio = function (data, cb) {
    var self = this;
    portfolioDao.getAccountsListSimple(data, function (err, accounts) {
        if (err) {
            logger.error("Error in get account list for portfolio (genrateTradeOrderForPortfolio())" + err);
            return cb(err, responseCodes.UNPROCESSABLE);
        }
        if (accounts && accounts.length > 0) {
            self.getAccountsDetailAndGenrateTradeOrder(data, accounts, function(err, status, result){
                return cb(err, status, result);
            });
        } else {
            logger.debug("Errror no account found in portfolio (genrateTradeOrderForPortfolio())");
            return cb(messages.NoAccountExistInPortfolio, responseCodes.UNPROCESSABLE);
        }
    })
}

CommonService.prototype.getAccountDetailAndValidate = function (data, cb) {
    var self = this;
    //call sp for account detail
    commonDao.getAccountsSecuritiesTaxLotsForAccount(data, function (err, result) {
        if (err) {
            logger.error("Error in get account detail (getAccountDetailAndValidate)" + err);
            return cb(err, responseCodes.UNPROCESSABLE);
        }
        if (result && result.length > 0) {
            if(enums.TRADE_ORDER.ACTION.LIQUIDATE === data.actionId){
                return cb(null, responseCodes.SUCCESS, result)
            }else{
               self.validateTradeOrderInfo(result, data, function (err, status, validated) {
                    if (err) {
                        return cb(err, status);
                    }
                    return cb(null, responseCodes.SUCCESS, result)
                }); 
            } 
        } else {
            logger.info("The Account does not exist, or you do not have rights to the specified account");
            return cb(messages.accountNotExist, responseCodes.UNPROCESSABLE);
        }
    })
}

CommonService.prototype.validateTradeOrderInfo = function (data, input, cb) {
    var self = this;

    var portfolioDetail = data[0];
    var accountDetail = data[1];
    var positionsDetail = data[2];
    var securitiesDetail = data[4];
    var taxLotsDetail = data[3];

    self.validateAccountInfo(accountDetail, input, function (err, status, result) {
        if (err) {
            logger.error("Error validating account info (validateTradeOrderInfo())");
            return cb(err, status);
        }
        self.validatePortfolioInfo(portfolioDetail, input, function (err, status, result) {
            if (err) {
                logger.error("Error validating portfolio info (validateTradeOrderInfo())");
                return cb(err, status);
            }
            self.validateSecurityInfo(securitiesDetail, input, function (err, status, result) {
                if (err) {
                    logger.error("Error validating security info (validateTradeOrderInfo())");
                    return cb(err, status);
                }
                self.validatePositionInfo(positionsDetail, input, function (err, status, result) {
                    if (err) {
                        logger.error("Error validating position info (validateTradeOrderInfo())");
                        return cb(err, status);
                    }
                    self.validateTaxLotInfo(taxLotsDetail, input, function (err, status, result) {
                        if (err) {
                            logger.error("Error validating taxLot info (validateTradeOrderInfo())");
                            return cb(err, status);
                        }
                        return cb(null, responseCodes.SUCCESS, true);
                    });
                });
            });
        });
    })
}

CommonService.prototype.validateAccountInfo = function (data, input, cb) {
    logger.info("Validate Account Info service called (validateAccountInfo())");
    var accountInfo = data[0];
    if (!accountInfo || !accountInfo.accountId) {
        logger.info("The Account does not exist, or you do not have rights to the specified account");
        return cb(messages.accountNotExist, responseCodes.UNPROCESSABLE);
    } else if (accountInfo.isDisabled === 1) {
        logger.info("Account is not active"+JSON.stringify(accountInfo));
        return cb(messages.accountInactive, responseCodes.UNPROCESSABLE);
    } else {
        data.custodianId = accountInfo.custodianId; 
        return cb(null, responseCodes.SUCCESS, true);
    }
}


CommonService.prototype.validatePortfolioInfo = function (data, input, cb) {
    logger.info("Validate Portfolio Info service called (validatePortfolioInfo())");
    var portfolioInfo = data[0];
    if (!portfolioInfo || portfolioInfo.doNotTrade) {
        logger.info("Account is trade blocked");
        return cb(messages.accountTradeBlocked, responseCodes.UNPROCESSABLE);
    } else {
        data.portfolioId = portfolioInfo.portfolioId;
        return cb(null, responseCodes.SUCCESS, true);
    }
}

CommonService.prototype.validateSecurityInfo = function (data, input, cb) {
    logger.info("Validate Security Info service called (validateSecurityInfo())"+JSON.stringify(data));
    var securitiesInfo = data;
    var securityId = input.securityId;
    var actionId = input.actionId;
    if (enums.TRADE_ORDER.ACTION.SELL === actionId) {
        if (securitiesInfo && securitiesInfo.length > 0) {
            var securityInfo = utilService.getObjectByPropertyValueFromArray(securitiesInfo, "securityId", securityId);
            if (securityInfo) {
                var securityPrice = securityInfo.price;
                if (securityPrice) {
                    return cb(null, responseCodes.SUCCESS, true);
                } else {
                    return cb(messages.noPriceForSecurity, responseCodes.UNPROCESSABLE);
                }
            } else {
                logger.debug("Security not found (validateSecurityInfo())");
                return cb(messages.securityNotFound, responseCodes.UNPROCESSABLE);
            }
        } else {
            return cb(messages.noSecurityFound, responseCodes.UNPROCESSABLE);
        }
    }else{
        return cb(null, responseCodes.SUCCESS, true);
    }
}

CommonService.prototype.validatePositionInfo = function (data, input, cb) {
    logger.info("Validate Position Info service called (validatePositionInfo())");
    var self = this;
    var positionsInfo = data;
    var securityId = input.securityId;
    var actionId = input.actionId;
    var actionProperties = input.actionProperties;
    var isCustodialCashPosition = utilService.getObjectByPropertyValueFromArray(positionsInfo, "isCustodialCash", 1);
    if (enums.TRADE_ORDER.ACTION.BUY === actionId) {
        if(actionProperties.typeId === enums.TRADE_ORDER.ACTION_PROP_TYPE.PERCENT){
            logger.debug("You cant buy any percent for security");
            return cb(messages.cantBuyPercentSecurity, responseCodes.UNPROCESSABLE);
        }
        if(isCustodialCashPosition){
            var positionInfo = utilService.getObjectByPropertyValueFromArray(positionsInfo, "securityId", securityId);
            var allActionTypePropMap = self.getPostionAllActionPropTypeMap(positionInfo, actionProperties);
            if ((allActionTypePropMap.price > isCustodialCashPosition.marketValue)) {
                var tradeOrderMessage = {};
                tradeOrderMessage.shortCode =  enums.TRADE_ORDER_MESSAGE.SHORT_CODES.TRADE_OVER_SPEND_CASH;
                tradeOrderMessage.arguments = isCustodialCashPosition.marketValue;
                tradeOrderMessage.accountId = input.id;
                input.tradeOrderMessages[input.id].push(tradeOrderMessage);
                logger.debug("The selected buy amount will overspend cash.");
                input.warningMessage[input.id].push(messages.overspendCashWarning + " = " + isCustodialCashPosition.marketValue);
            }
        }else{
            logger.debug("The selected buy amount will overspend cash.");
            input.warningMessage[input.id].push(messages.overspendCashWarning + " = 0");
        }
         return cb(null, responseCodes.SUCCESS, true);
    } else if (positionsInfo && positionsInfo.length > 0) {
        if(enums.TRADE_ORDER.ACTION.LIQUIDATE === actionId){
            return cb(null, responseCodes.SUCCESS, true);
        }else{
            var positionInfo = utilService.getObjectByPropertyValueFromArray(positionsInfo, "securityId", securityId);
            if (enums.TRADE_ORDER.ACTION.SELL === actionId) {
                if (positionInfo) {
                    positionInfo.isOrderPercent = true;
                    var allActionTypePropMap = self.getPostionAllActionPropTypeMap(positionInfo, actionProperties);
                    if (allActionTypePropMap.price > positionInfo.marketValue) {
                        logger.debug("The requested trade amount is more than what is available");
                        var tradeOrderMessage = {};
                        tradeOrderMessage.shortCode =  enums.TRADE_ORDER_MESSAGE.SHORT_CODES.TRADE_AMOUNT_MORE;
                        tradeOrderMessage.arguments = positionInfo.marketValue;
                        tradeOrderMessage.accountId = input.id;
                        input.tradeOrderMessages[input.id].push(tradeOrderMessage);
                        input.warningMessage[input.id].push(messages.tradeAmountGreaterThenAvailable + " = " + positionInfo.marketValue);
                    }
                    return cb(null, responseCodes.SUCCESS, true);
                } else {
                    logger.debug("Position not found (validatePositionInfo())");
                    return cb(messages.cantSellDisownedPosition, responseCodes.UNPROCESSABLE);
                }
            } else {
                return cb(null, responseCodes.SUCCESS, true);
            }
        }
    } else {
        return cb(messages.noPositionFound, responseCodes.UNPROCESSABLE);
    }
}

CommonService.prototype.validateTaxLotInfo = function (data, input, cb) {
    logger.info("Validate Tax Lot Info service called (validateTaxLotInfo())");
    var actionId = input.actionId;
    if(enums.TRADE_ORDER.ACTION.LIQUIDATE === actionId || enums.TRADE_ORDER.ACTION.BUY === actionId){
        return cb(null, responseCodes.SUCCESS, true);
    }else{
        var securityId = input.securityId;
        var taxLotInfos = utilService.getObjectArrayByPropertyValueFromArray(data, "securityId", securityId);
        if (taxLotInfos && taxLotInfos.length > 0) {
            var lastTaxLot = utilService.getObjectByLowestPropertyValueFromArray(taxLotInfos, "dateAcquired");
            var lastTaxLotDate = utilService.mySqlToJavascriptDate(lastTaxLot.dateAcquired);
            var diffrenceInDays = utilService.dayDiffrenceInTwoDates(lastTaxLotDate, new Date());
            logger.debug("Diff in days are"+diffrenceInDays);
            if (enums.TRADE_ORDER.ACTION.SELL === actionId) {
                if (diffrenceInDays < 365) {
                    var responseMessage = [];
                    responseMessage.push(messages.shortTermFeeWarning);
                    responseMessage.push(' The product was purchased ' + diffrenceInDays + ' days ago.');
                    responseMessage.push('(STF Days is 365).')
                    responseMessage = responseMessage.join('');
                    var tradeOrderMessage = {};
                    tradeOrderMessage.shortCode =  enums.TRADE_ORDER_MESSAGE.SHORT_CODES.SHORT_TERM_FEES;
                    tradeOrderMessage.arguments = diffrenceInDays;
                    tradeOrderMessage.accountId = input.id;
                    input.tradeOrderMessages[input.id].push(tradeOrderMessage);
                    input.warningMessage[input.id].push(responseMessage);
                }
                return cb(null, responseCodes.SUCCESS, true);
            } else {
                return cb(null, responseCodes.SUCCESS, true);
            }
        } else {
            return cb(messages.taxLotNotFound, responseCodes.UNPROCESSABLE)
        }
    }
}
CommonService.prototype.getPreferencesValuesForAccount = function(data, cb){
    logger.info("Get prefrence values for account service called (getPreferencesValuesForAccount())");
    commonDao.getPreferencesValuesForAccount(data, function(err, result){
        if(err){
            logger.error("Error in get account prefrences (getPreferencesValuesForAccount())"+err);
            return cb(err , responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("return from (getPreferencesValuesForAccount())");
        return cb(null,responseCodes.SUCCESS, result);
    });
}
CommonService.prototype.getPreferencesValuesForPortfolio = function(data, cb){
    logger.info("Get prefrence values for portfolio service called (getPreferencesValuesForPortfolio())");
    commonDao.getPreferencesValuesForPortfolio(data, function(err, result){
        if(err){
            logger.error("Error in get portfolio prefrences (getPreferencesValuesForPortfolio())"+err);
            return cb(err , responseCodes.INTERNAL_SERVER_ERROR);
        }
        return cb(null,responseCodes.SUCCESS, result);
    });
}

CommonService.prototype.getPreferencesValues = function(data, cb){
    logger.info("Get prefrence service called (getPreferencesValues())");
    var self = this;
    if (data.typeId === enums.TRADE_ORDER.TYPE.PORTFOLIO) {
        self.getPreferencesValuesForPortfolio(data, function(err, status, result){
            return cb(err, status, result);
        })
    } else if (data.typeId === enums.TRADE_ORDER.TYPE.ACCOUNT) {
        self.getPreferencesValuesForAccount(data, function(err, status, result){
            logger.info("return from (getPreferencesValues())");
            return cb(err, status, result);
        })
    } else {
        logger.debug("Wrong trade order type (getPreferencesValues())");
        return cb(messages.invalidTradeOrderTypeId, responseCodes.UNPROCESSABLE);
    }
}
CommonService.prototype.getPreferencesValuesMap = function(data, cb){
    logger.info("Get prefrence map service called (getPreferencesValuesMap())");
    var self = this;
    self.getPreferencesValues(data, function(err, status, result){
        if(err){
            return cb(err, status);
        }
        self.preparePrefrencesValueMap(result, function(err, status, prefrenceMap){
            logger.info("Get prefrence map service result (getPreferencesValuesMap())");
                return cb(err, status, prefrenceMap);
        });
    });
}
CommonService.prototype.preparePrefrencesValueMap = function(data, cb){
    logger.info("Prepare prefrence map service called (preparePrefrencesValueMap())");
    var self = this;
    var accountAndAbovePrefs = data[0];
    var taxLotPrefs = data[1];
    var securityAccountPrefs = data[2];
    var taxPrefs = data[3];

    var prefrenceMap = {};
    var taxPrefMap ={};
    prefrenceMap.taxPref = {};
    var securityAccountMap = {};
    accountAndAbovePrefs.forEach(function(accountAndAbovePref){
        if(accountAndAbovePref.accountId){
            accountAndAbovePref.securities = {};
            prefrenceMap[accountAndAbovePref.accountId] = accountAndAbovePref;
        }else{
            prefrenceMap["masterPref"] = accountAndAbovePref;
        }
    });
    securityAccountPrefs.forEach(function(securityAccountPref){
        var accountId = securityAccountPref.accountId;
        var accountPref = prefrenceMap[accountId];
        var securities = accountPref.securities;
        securities[securityAccountPref.securityId] = securityAccountPref;
    });
    taxPrefs.forEach(function(taxPref){
        var assetSubClassId = taxPref.assetSubClassId
        taxPrefMap[assetSubClassId] = taxPref;
    })
    prefrenceMap.taxPref = taxPrefMap;
    prefrenceMap.taxablePref = taxLotPrefs;
    return cb(null, responseCodes.SUCCESS, prefrenceMap);
}

CommonService.prototype.applyPrefrencesAndGenrateTradeOrder = function(inputData, cb){
    logger.info("Apply prefrences and genrate trade order service call start (applyPrefrencesAndGenrateTradeOrder())");
    var self = this;
    var securityId = inputData.securityId;
    var accountId = inputData.id;
    var actionProp = inputData.actionProperties;
    var tempData = {};
    tempData.reqId = inputData.reqId;
    tempData.user = inputData.user;
    tempData.id = accountId;
    tempData.securityId = securityId;
    self.getSecurityAccountInfo(tempData, function(err, status, positionInfo){
        if(err){
            return cb(err, status);
        }
        console.log("The position info i got here is "+JSON.stringify(positionInfo));
        if(enums.TRADE_ORDER.ACTION.BUY === inputData.actionId){
            positionInfo.isOrderPercent = false;
        }else{
            positionInfo.isOrderPercent = true;
        }
        var allActionPropTypeMap = self.getPostionAllActionPropTypeMap(positionInfo, actionProp)
        inputData.price = allActionPropTypeMap.price;
        inputData.quantity = allActionPropTypeMap.orderQty;
        if(allActionPropTypeMap.orderPercent != null) {
            inputData.percent = allActionPropTypeMap.orderPercent;
        }
        self.getPreferencesValuesMap(inputData, function(err, status, prefrenceMap){
            if(err){
                logger.error("Error in getting prefrence map(applyPrefrencesAndGenrateTradeOrder())"+err);
                return cb(err, status);
            }
            var tradeOrders = [];
            var masterPref = prefrenceMap.masterPref;
            
            var isTransactionCostIncludedPref = false;
            if(masterPref){
                if(enums.SECURITY_TYPE.MUTUAL_FUND = positionInfo.securityTypeId){
                    if(masterPref.roundingforMutualFunds){
                        logger.info("Value change by prefrence = roundingforMutualFunds in (applyPrefrencesAndGenrateTradeOrder)");
                        inputData.price = utilService.roundOfValue(inputData.price, masterPref.roundingforMutualFunds);
                    }
                }else if(enums.SECURITY_TYPE.EQUITY = positionInfo.securityTypeId){
                    if(masterPref.roundingforEquities){
                        logger.info("Value change by prefrence = roundingforEquities in (applyPrefrencesAndGenrateTradeOrder)");
                        inputData.quantity = utilService.roundOfValue(inputData.quantity, masterPref.roundingforEquities);
                    }
                }
                if(prefrenceMap[accountId].transactionCostIncludedOrAddedToTrade != null){
                    isTransactionCostIncludedPref = prefrenceMap[accountId].transactionCostIncludedOrAddedToTrade;
                }else{
                    isTransactionCostIncludedPref = masterPref.transactionCostIncludedOrAddedToTrade;
                }
            }

            var transactionCost = 0;
            var minTransactionAmount = 0;
            var maxTransactionAmount = 0;
            var minTransactionPercent = 0;
            var maxTransactionPercent = 0;
            var accountSecuritiesPref = null;
            if(prefrenceMap && prefrenceMap[accountId]){
                accountSecuritiesPref = prefrenceMap[accountId].securities;
            }
             var accountSecurityPref = null;
            if(accountSecuritiesPref){
                accountSecurityPref = accountSecuritiesPref[securityId];
            }
            if(accountSecurityPref){
                if(inputData.actionId === enums.TRADE_ORDER.ACTION.BUY){
                    transactionCost = accountSecurityPref.buyTransactionFee;
                    minTransactionAmount = accountSecurityPref.buyTradeMinAmtBySecurity;
                    maxTransactionAmount = accountSecurityPref.buyTradeMaxAmtBySecurity;
                    minTransactionPercent = accountSecurityPref.buyTradeMinPctBySecurity;
                    maxTransactionPercent = accountSecurityPref.buyTradeMaxPctBySecurity;
                }
                else if(inputData.actionId === enums.TRADE_ORDER.ACTION.SELL){
                    transactionCost = accountSecurityPref.sellTransactionFee;
                    minTransactionAmount = accountSecurityPref.sellTradeMinAmtBySecurity;
                    maxTransactionAmount = accountSecurityPref.sellTradeMaxAmtBySecurity;
                    minTransactionPercent = accountSecurityPref.sellTradeMinPctBySecurity;
                    maxTransactionPercent = accountSecurityPref.sellTradeMaxPctBySecurity;
                }
                if(isTransactionCostIncludedPref){
                    inputData.isTransactionFeeIncluded = true;
                    inputData.price = Number(inputData.price) + Number(transactionCost);
                }else{
                    inputData.isTransactionFeeIncluded = false;
                }
                if(transactionCost > masterPref.transactionCostLimit){
                    logger.info("Transaction cost is more then the limit set (applyPrefrencesAndGenrateTradeOrder())");
                    return cb(messages.moreTransactionCost, responseCodes.UNPROCESSABLE);
                }
                if(actionProp.typeId === enums.TRADE_ORDER.ACTION_PROP_TYPE.DOLLAR){
                    if(minTransactionAmount>inputData.price){
                        logger.info("Trade value is less then the minimum transaction amount (applyPrefrencesAndGenrateTradeOrder())");
                        return cb(messages.lessTradeValue, responseCodes.UNPROCESSABLE);
                    }
                    if(maxTransactionAmount<inputData.price){
                        logger.info("Trade value is more then the maximum transaction amount (applyPrefrencesAndGenrateTradeOrder())"+maxTransactionAmount+" trade "+actionProp.value);
                        return cb(messages.moreTradeValue, responseCodes.UNPROCESSABLE);
                    }
                }else if(actionProp.typeId === enums.TRADE_ORDER.ACTION_PROP_TYPE.SHARE){

                }else{
                    if(minTransactionPercent>inputData.percent){
                        logger.info("Trade value is less then the minimum transaction percent (applyPrefrencesAndGenrateTradeOrder())");
                        return cb(messages.lessTradePercent, responseCodes.UNPROCESSABLE);
                    }
                    if(maxTransactionPercent<inputData.percent){
                        logger.info("Trade value is more then the maximum transaction percent (applyPrefrencesAndGenrateTradeOrder())");
                        return cb(messages.moreTradePercent, responseCodes.UNPROCESSABLE);
                    }
                }
                return cb(null, responseCodes.SUCCESS, inputData, prefrenceMap);
            }else{
              return cb(null, responseCodes.SUCCESS, inputData, prefrenceMap);
            }
        });
    });
}
CommonService.prototype.genrateTradeOrdersForAccounts = function(inputData, accounts, cb){
    logger.info("GenrateTradeOrdersForAccounts() method called");
    var self = this;
    var tradeOrders = [];
    var counter = 0;
    var isPortfolio = false;
    if(accounts && accounts.length > 0){
        asyncFor(accounts,function(account, index, next){
            self.genrateTradeOrderForAccount(inputData, account, function(err, status, tradeOrder){
                counter++;
                if(err){
                    logger.error("Error in order genration (genrateTradeOrdersForAccounts())"+err);
                    if(inputData.actualTypeId === enums.TRADE_ORDER.TYPE.ACCOUNT){
                        next(err);
                        return cb(err, status);
                    }
                }
                tradeOrders.push(tradeOrder);
                if(inputData.actualTypeId === enums.TRADE_ORDER.TYPE.PORTFOLIO){
                    next("success");
                    return cb(null, responseCodes.SUCCESS,createFinalTradeObject(tradeOrders, inputData));
                }else{
                    next();
                }
            });
        }, function(err, result){
            if(tradeOrders && tradeOrders.length>0){
                return cb(null, responseCodes.SUCCESS, createFinalTradeObject(tradeOrders, inputData));
            }else{
                logger.debug("No order to generate");
                return cb(messages.noTradeOrder, responseCodes.UNPROCESSABLE)
            }
        });
        function createFinalTradeObject(tradeOrders, inputData){
            var finalTrades = {};
            finalTrades.trades = tradeOrders;
            finalTrades.reqId = inputData.reqId;
            finalTrades.user = inputData.user;
            return finalTrades;
        }
    }else{
        logger.error("No account to genrate trade order");
        return cb(messages.noAccountToGenerateTradeFound, responseCodes.UNPROCESSABLE);
    }
}
CommonService.prototype.genrateTradeOrderForAccount = function (inputData, account, cb) {
    var self = this;
    var portfolioDetail = account[0];
    var accountDetail = account[1];
    var positionsDetail = account[2];
    var taxLotsDetail = account[3];
    var securitiesDetail = account[4];
    var accountId = accountDetail[0].accountId; 
    var positionInfo = utilService.getObjectByPropertyValueFromArray(positionsDetail, "securityId", inputData.securityId);
    var taxLotInfo = utilService.getObjectByPropertyValueFromArray(taxLotsDetail, "securityId", inputData.securityId);
    if(inputData.actionId === enums.TRADE_ORDER.ACTION.SELL){
        if(typeof positionInfo === "undefined"){
            return cb(messages.noPositionFound, responseCodes.UNPROCESSABLE);
        }
        if(typeof taxLotInfo === "undefined"){
            return cb(messages.taxLotNotFound, responseCodes.UNPROCESSABLE);
        }
    }
    var positionId = null;
    if(positionInfo){
        positionId = positionInfo.positionId;
    }
    var tradeObject = {};
    tradeObject.isEnabled = !accountDetail[0].isSMA;
    tradeObject.advisorId = accountDetail[0].advisorId;
    tradeObject.isSendImmediately = inputData.sendTradesImmediate || false;
    tradeObject.isTransactionFeeIncluded = inputData.isTransactionFeeIncluded;
    tradeObject.warningMessage = inputData.warningMessage[accountId];
    tradeObject.tradeOrderMessages = inputData.tradeOrderMessages[accountId];
    tradeObject.accountId = accountId;
    tradeObject.securityId = inputData.securityId;
    tradeObject.portfolioId = portfolioDetail[0].id;
    tradeObject.accountValue = accountDetail[0].accountMarketValue;
    if(inputData.actionId === enums.TRADE_ORDER.ACTION.LIQUIDATE){
        tradeObject.tradeActionId = enums.TRADE_ORDER.ACTION.SELL;
    }else{
        tradeObject.tradeActionId = enums.TRADE_ORDER.ACTION[enums.TRADE_ORDER.ACTION_NAME[inputData.actionId]];
    }
    tradeObject.custodianId = accountDetail[0].custodianId;
    tradeObject.modelId = portfolioDetail[0].modelId;
    tradeObject.positionId = positionId;
    tradeObject.cashValue = accountDetail[0].accountCash;
    tradeObject.daysUntilLongTerm = null;
    tradeObject.gainLossMessage = "";
    tradeObject.instanceId = null;
    tradeObject.longTremGain = null;
    tradeObject.rebalanceLevel = null;
    tradeObject.reInviestDividends = accountDetail[0].reInviestDividends||false;
    tradeObject.reInvestLongTerm = accountDetail[0].reInvestLongTerm||false;
    tradeObject.reInvestShortTerm = accountDetail[0].reInvestShortTerm||false;
    var positionInfo = utilService.getObjectByPropertyValueFromArray(positionsDetail, "securityId", inputData.securityId);
    if(inputData.actionId === enums.TRADE_ORDER.ACTION.LIQUIDATE){
        tradeObject.price = positionInfo.price;
        tradeObject.tradeAmount = positionInfo.marketValue;
        tradeObject.orderQty = positionInfo.quantity;
        tradeObject.orderPercent = 100;
        tradeObject.tradePercentageOfAccount = ((positionInfo.marketValue)/(accountDetail[0].accountMarketValue))*100;
        tradeObject.cashValuePostTrade = accountDetail[0].accountCash + positionInfo.marketValue;
        return cb(null, responseCodes.SUCCESS, tradeObject);
    }else{
        if(positionInfo){
            tradeObject.price = positionInfo.price;
            tradeObject.tradeAmount = inputData.price;
            tradeObject.orderQty = inputData.quantity;
            tradeObject.orderPercent = inputData.percent;
            if(inputData.actionId === enums.TRADE_ORDER.ACTION.SELL){
                tradeObject.cashValuePostTrade = accountDetail[0].accountCash + tradeObject.tradeAmount;
            }else{
                tradeObject.cashValuePostTrade = accountDetail[0].accountCash - tradeObject.tradeAmount;
            }
            tradeObject.tradePercentageOfAccount = ((tradeObject.tradeAmount)/(accountDetail[0].accountMarketValue))*100;
            return cb(null, responseCodes.SUCCESS, tradeObject);
        }else{
            var tempData = {};
            tempData.reqId = inputData.reqId;
            tempData.user = inputData.user;
            tempData.securityId = inputData.securityId;
            tempData.id = accountId;

            self.getSecurityAccountInfo(tempData, function(err, status, positionInfo){
                if(err){
                    return cb(err, status);
                }
                tradeObject.price = positionInfo.price;
                tradeObject.tradeAmount = inputData.price;
                tradeObject.orderQty = inputData.quantity;
                tradeObject.orderPercent = inputData.percent;
                if(inputData.actionId === enums.TRADE_ORDER.ACTION.SELL){
                    tradeObject.cashValuePostTrade = accountDetail[0].accountCash + tradeObject.tradeAmount;
                }else{
                    tradeObject.cashValuePostTrade = accountDetail[0].accountCash - tradeObject.tradeAmount;
                }
                tradeObject.tradePercentageOfAccount = ((tradeObject.tradeAmount)/(accountDetail[0].accountMarketValue))*100;
                return cb(null, responseCodes.SUCCESS, tradeObject);
            });
        }
        
    }
    
}
CommonService.prototype.filterAndSortAccounts = function(inputData, accounts, prefrenceMap, cb){
//    logger.info("Filter and sort account according to prefrence service called (filterAndSortAccounts())"+JSON.stringify(inputData));
    var sortedAccounts = [];
    var tempAccountArray = [];
    var inputSecurityId = inputData.securityId;
    securityDao.getSecurityById(inputData, function(err, result){
        if(err){
            logger.error("Error get security by detail(filterAndSortAccounts())"+err);
            return cb(err, responseCodes.UNPROCESSABLE)
        }
        if(result && result.length>0){
            var assetSubClassId = result[0].assetSubClassId;
            var taxPreference = null;
            if(assetSubClassId){
               taxPreference = prefrenceMap["taxPref"][assetSubClassId];
            }
            var taxPrefMap = {};
            var accountTempOrder = {};
            if(taxPreference){
                if(inputData.actionId === enums.TRADE_ORDER.ACTION.BUY){
                    taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAXABLE] = taxPreference.buyTaxable;
                    taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAX_DEFFERED] = taxPreference.buyTaxDeferred;
                    taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAX_EXEMPT] = taxPreference.buyTaxExempt;
                }else if(inputData.actionId === enums.TRADE_ORDER.ACTION.SELL){
                    taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAXABLE] = taxPreference.sellTaxable;
                    taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAX_DEFFERED] = taxPreference.sellTaxDeferred;
                    taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAX_EXEMPT] = taxPreference.sellTaxExempt;
                }
               accountTempOrder[taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAXABLE]]  = [];
               accountTempOrder[taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAX_DEFFERED]]  = [];
               accountTempOrder[taxPrefMap[enums.TRADE_ORDER.ACCOUNT_TAXABLE_TYPE.TAX_EXEMPT]]  = [];
                
            }
            var tempAccountArray = [];
            var finalAccountOrder = [];
            if(accountTempOrder && accountTempOrder.length>0){
                accounts.forEach(function(account){
                    var portfolioDetail = account[0][0];
                    var accountDetail = account[1][0];
                    var positionsDetail = account[2];
                    var taxLotsDetail = account[3];
                    var securitiesDetail = account[4];
                    var accountType = accountDetail.taxableType;
                    tempAccountArray = accountTempOrder[taxPrefMap[accountType]];
                    if(!tempAccountArray){
                        tempAccountArray = [];
                    }
                    tempAccountArray.push(account);
                });
                for (var i=1;i<=3;i++){
                    var tempAccountsArray = accountTempOrder[i];
                    tempAccountsArray = lodash.sortBy(tempAccountsArray, [function(account) {
                        if(inputData.actionId === enums.TRADE_ORDER.ACTION.BUY){
                            var isCustodialCashPosition = utilService.getObjectByPropertyValueFromArray(account[2], "isCustodialCash", 1);
                            return isCustodialCashPosition.marketValue;
                        }else if(inputData.actionId === enums.TRADE_ORDER.ACTION.SELL){
                            var isCustodialCashPosition = utilService.getObjectByPropertyValueFromArray(account[2], "isCustodialCash", 0);
                             return isCustodialCashPosition.quantity;
                        }
                    }]);
                    finalAccountOrder = lodash.concat(finalAccountOrder, tempAccountsArray);
                }
            }else{
                finalAccountOrder = lodash.sortBy(accounts, [function(account) {
                    if(inputData.actionId === enums.TRADE_ORDER.ACTION.BUY){
                        var isCustodialCashPosition = utilService.getObjectByPropertyValueFromArray(account[2], "isCustodialCash", 1);
                        if(isCustodialCashPosition  && typeof isCustodialCashPosition !== "undefined"){return isCustodialCashPosition.marketValue;}
                        else{return null;}
                    }else if(inputData.actionId === enums.TRADE_ORDER.ACTION.SELL){
                        var isCustodialCashPosition = utilService.getObjectByPropertyValueFromArray(account[2], "isCustodialCash", 0);
                         if(isCustodialCashPosition && typeof isCustodialCashPosition !== "undefined"){return isCustodialCashPosition.quantity;}
                         else{return null;}
                    }
                }]);
            }
            
            return cb(null, responseCodes.SUCCESS, finalAccountOrder);
        }
        else{
            logger.info("Security not found in system (filterAndSortAccounts())");
            return cb(messages.securityNotFound, responseCodes.UNPROCESSABLE);
        }
    })
    
}
CommonService.prototype.getAllActionPropTypeMap = function(inputData, account, cb){
    var self = this;
    var allActionPropTypeMap = {};
    var actionProp = inputData.actionProperties;
    var securityId = inputData.securityId;
    var positionsDetail = account[2];
    var positionInfo = null;
    if(inputData.actionId === enums.TRADE_ORDER.ACTION.BUY){
        var tempData = {};
        tempData.reqId = inputData.reqId;
        tempData.user = inputData.user;
        tempData.securityIdid = inputData.securityId;
        tempData.id = inputData.id;
        self.getSecurityAccountInfo(tempData, function(err, status, positionInfo){
            if(err){
                return cb(err, status);
            }
            positionInfo.isOrderPercent = false;
            allActionPropTypeMap = self.getPostionAllActionPropTypeMap(positionInfo, actionProp)
            return cb(null, responseCodes.SUCCESS, allActionPropTypeMap);
        });
    }else if(inputData.actionId === enums.TRADE_ORDER.ACTION.SELL){
        positionInfo = utilService.getObjectByPropertyValueFromArray(positionsDetail, "securityId", securityId);
        positionInfo.isOrderPercent = true;
        allActionPropTypeMap = self.getPostionAllActionPropTypeMap(positionInfo, actionProp)
        return cb(null, responseCodes.SUCCESS, allActionPropTypeMap);
    }
}
CommonService.prototype.getPostionAllActionPropTypeMap = function(positionInfo, actionProp){
    var allActionPropTypeMap = {};
    var price = null;
    var orderQty = null;
    var orderPercent = null;
    var perUnitPrice = null;
    var availableQuantity = null;
    if(positionInfo){
        perUnitPrice = positionInfo.price;
        availableQuantity = positionInfo.quantity;
    }
    if(availableQuantity){

    }else{
        availableQuantity = 0; 
    }
    if(actionProp.typeId === enums.TRADE_ORDER.ACTION_PROP_TYPE.DOLLAR){
        orderQty = actionProp.value/perUnitPrice;
        if(positionInfo && positionInfo.isOrderPercent){
            if(orderQty && availableQuantity){
                orderPercent = (orderQty/availableQuantity)*100;
            }else{
                orderPercent = 0;
            }
        }
        price = actionProp.value;
    }else if(actionProp.typeId === enums.TRADE_ORDER.ACTION_PROP_TYPE.SHARE){
        orderQty = actionProp.value;
        if(positionInfo && positionInfo.isOrderPercent){
            orderPercent = (orderQty/availableQuantity)*100;
        }
        price = orderQty*perUnitPrice;
    }else {
        orderPercent = actionProp.value;
        if(positionInfo && positionInfo.isOrderPercent){
            orderQty = (availableQuantity*orderPercent)/100;
        }
        price = orderQty*perUnitPrice;
    }
    allActionPropTypeMap.orderQty = orderQty;
    allActionPropTypeMap.orderPercent = orderPercent;
    allActionPropTypeMap.price = price;
    console.log("The action map"+JSON.stringify(allActionPropTypeMap));
    return allActionPropTypeMap;
}
CommonService.prototype.getSecurityAccountInfo = function(tempData, cb){
    var positionInfo = {
        quantity : null,
        price : null,
        securityTypeId: null
    }

    modelDao.getCurrentAllocationsForSecuritiesInAccount(tempData, function(err, result){
        if(err){
            logger.error("Error getting security price by id (getSecurityAccountInfo())");
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        var securityInput = {};
        securityInput.id = tempData.securityId;
        securityInput.user = tempData.user;
        securityInput.reqId = tempData.reqId;
        securityDao.getSecurityType(securityInput, function(err, securityTypeOutput){
            if(err){
                logger.error("Error getting security type (getSecurityAccountInfo())");
                return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
            }
            if(result && result.length> 0){
                positionInfo.quantity = result[0].quantity;
                positionInfo.price = result[0].price;
                positionInfo.securityTypeId = securityTypeOutput[0].securityTypeId;
                return cb(null, responseCodes.SUCCESS, positionInfo);
            }else{
                tempData.id = tempData.securityId;
                securityService.getSecurityPriceById(tempData, function(err, status, result){
                    if(err){
                        logger.error("Error getting security price(getSecurityAccountInfo())");
                        return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                    }
                    positionInfo.price = result.price;
                    positionInfo.securityTypeId = securityTypeOutput[0].securityTypeId;
                    return cb(null, responseCodes.SUCCESS, positionInfo);
                });
            }
        });
    });
}
module.exports = CommonService;