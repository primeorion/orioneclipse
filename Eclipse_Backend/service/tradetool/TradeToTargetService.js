var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var helper = require("helper");
var baseDao = require('dao/BaseDao.js');

var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var request = require('request');
var TradeToTargetDao = require('dao/tradetool/TradeToTargetDao.js');
var GlobalTradeService = require('service/tradetool/GlobalTradeService.js');
var GlobalTradeDao = require('dao/tradetool/GlobalTradeDao.js');
var GlobalTradeConverter = require("converter/tradetool/GlobalTradeConverter.js");
var CommonService = require('service/tradeorder/CommonService.js');
var UtilService = require('service/util/UtilService.js');
var asyncFor = helper.asyncFor;

var CommonTradeDao = require('dao/tradetool/CommonTradeDao.js');

var commonService = new CommonService();
var globalTradeConverter = new GlobalTradeConverter();
var cbCaller = helper.cbCaller;

var util = require('util');
var _ = require('underscore');

var tradeToTargetDao = new TradeToTargetDao();
var commonTradeDao = new CommonTradeDao();
var globalTradeService = new GlobalTradeService();
var globalTradeDao = new GlobalTradeDao();
var utilService = new UtilService();

var applicationEnum = config.applicationEnum;

var orderMessageShortCodes = applicationEnum.TRADE_ORDER_MESSAGE.SHORT_CODES;

var TradeToTargetService = function () { };


TradeToTargetService.prototype.validateAllInput = function (data, cb) {
    logger.info("Validate All Input service called (validateAllInput())");
    var self = this;
    var message = null;
    var tradeAction = [1, 2, 3];
    var allowWashSales = [1, 2];
    var allowShortTermGains = [1, 2, 3];

    var side = data.security.side;
    var validTradeAction = _.indexOf(tradeAction, side);
    if (validTradeAction === 0 || validTradeAction === 1 || validTradeAction === 2) {
        if (data.security.targetPercent <= 100 && data.security.targetPercent != 0) {
            if (data.preferences.minimumTradePercent <= 100 && data.preferences.minimumTradePercent != 0) {

                if (data.preferences.allowWashSalesId != null) {
                    var allowWashSalesId = data.preferences.allowWashSalesId;
                    var validAllowWashSales = _.indexOf(allowWashSales, allowWashSalesId);
                    if (validAllowWashSales === 0 || validAllowWashSales === 1) {

                        if (data.preferences.allowShortTermGainsId != null) {
                            var allowShortTermGainsId = data.preferences.allowShortTermGainsId;
                            var validAllowShortTermGains = _.indexOf(allowShortTermGains, allowShortTermGainsId);
                            if (validAllowShortTermGains == 0 || validAllowShortTermGains == 1 || validAllowShortTermGains == 2) {

                                cb(null, true);
                            } else {
                                logger.info("Trade Allow Short Term Gains not valid(validateAllInput())");
                                message = "Allow Short Term Gains Id not valid ";
                                cb(null, false, message)
                            }
                        } else {
                            cb(null, true);
                        }
                    } else {
                        logger.info("Trade Allow Wash Sales not valid(validateAllInput())");
                        message = "Allow Wash Sales Id not valid";
                        cb(null, false, message)
                    }
                } else {
                    if (data.preferences.allowShortTermGainsId != null) {
                        var allowShortTermGainsId = data.preferences.allowShortTermGainsId;
                        var validAllowShortTermGains = _.indexOf(allowShortTermGains, allowShortTermGainsId);
                        if (validAllowShortTermGains == 0 || validAllowShortTermGains == 1 || validAllowShortTermGains == 2) {
                            cb(null, true);
                        } else {
                            logger.info("Trade Allow Short Term Gains not valid(validateAllInput())");
                            message = "Allow Short Term  Gains Id not valid ";
                            cb(null, false, message)
                        }
                    } else {
                        cb(null, true);
                    }
                }
            } else {
                logger.info("Minimum Trade Percent should not be more then 100 and 0(validateAllInput())");
                message = "Minimum Trade Percent should not be more then 100 and 0";
                cb(null, false, message)
            }
        } else {
            logger.info("Target percent should not be more then 100 and 0(validateAllInput())");
            message = "Target percent should not be more then 100 and 0";
            cb(null, false, message)
        }
    } else {
        logger.info("Trade Side not valid(validateAllInput())");
        message = "Trade Side Id not valid";
        cb(null, false, message)
    }
};

// TradeToTargetService.prototype.getAccountsForTrades = function (data, cb) {
//     logger.info("Get Accounts For Trades service called (getAccountsForTrades())");
//     var self = this;
//     if (data.accountIds && data.accountIds.length > 0) {
//         var accountIds = data.accountIds;
//         globalTradeDao.validateAccount(data, function (err, validateAccount) {
//             if (err) {
//                 logger.error("Error in validate account (getAccountsForTrades())" + err);
//                 return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//             }
//             if (validateAccount.length > 0) {
//                 accountIds = _.uniq(accountIds);
//                 var validAccountIds = _.difference(accountIds, validateAccount);
//                 if (validAccountIds.length === 0) {
//                     logger.info("Account Validate successfully (getAccountsForTrades())");
//                     status = true
//                     // return cb(null, status, null);
//                     return cb(null, data);
//                 } else {
//                     logger.info("Account does Not exist (getAccountsForTrades())");
//                     message = messages.accountNotFound;
//                     return cb(null, null, message);
//                 }
//             }
//             else {
//                 logger.info("Account does Not exist (getAccountsForTrades())");
//                 message = messages.accountNotFound;
//                 return cb(null, null, message);
//             }
//         });
//         logger.info("Account list return successfully for accounts (getAccountsForTrades()) " + data.accountIds);
//         // return cb(null, data);
//     } else {
//         if (data.modelIds && data.modelIds.length > 0) {
//             var modelIds = data.modelIds;
//             globalTradeDao.validateModel(data, function (err, validateModel) {
//                 if (err) {
//                     logger.error("Error in validate account (getAccountsForTrades())" + err);
//                     return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//                 }
//                 if (validateModel.length > 0) {
//                     modelIds = _.uniq(modelIds);
//                     var validateModels = _.difference(modelIds, validateModel);
//                     if (validateModels.length === 0) {
//                         logger.info("Model Validate successfully (getAccountsForTrades())");
//                         //  status = true
//                         tradeToTargetDao.getAccountsForModels(data, function (err, accountList) {
//                             if (err) {
//                                 logger.error("Error in getting accounts for models  (getAccountsForTrades())" + err);
//                                 return cd(err, responseCode.INTERNAL_SERVER_ERROR);
//                             }
//                             if (accountList && accountList.length > 0) {
//                                 data.accountIds = accountList;
//                                 logger.info("Account list return successfully for models (getAccountsForTrades()) " + accountList);
//                                 return cb(null, data);
//                             } else {
//                                 logger.debug(" No account for models (getAccountsForTrades()) " + accountList);
//                                 return cb(null, null, " No account found for models");
//                             }
//                         });
//                         //     return cb(null, status, null);
//                     } else {
//                         logger.info("Model does Not exist (getAccountsForTrades())");
//                         message = messages.modelNotFound;
//                         return cb(null, null, message);
//                     }
//                 }
//                 else {
//                     logger.info("Model does Not exist (validatePortfolio())");
//                     message = messages.modelNotFound;
//                     return cb(null, null, message);
//                 }
//             });
//         } else {
//             logger.debug("Please Provide account for trade");
//             return cb(null, null, "Please Provide account for trade");
//         }
//     }
// };

TradeToTargetService.prototype.getAccountsForTradesOld = function (data, cb) {
    logger.info("Get accounts for trades service called (getAccountsForTrades())");
    var issues = [];
    if (data.accountIds && data.accountIds.length > 0) {
        var accountIds = data.accountIds;
        logger.info("Account list return successfully (getAccountsForTrades()) " + accountIds);
        return cb(null, accountIds, issues);
    } else {
        if (data.portfolioIds && data.portfolioIds.length > 0 || data.modelIds && data.modelIds.length > 0) {
            var ids = (data.portfolioIds && data.portfolioIds.length > 0) ? data.portfolioIds : data.modelIds;
            globalTradeDao.getAccountList(data, function (err, accountsList, portfolioList) {
                if (err) {
                    logger.error("Error in Getting accounts for portfolio (getAccountsForTrades()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                var inValidPortfolioIds = _.difference(ids, portfolioList);
                inValidPortfolioIds.forEach(function (id) {
                    var portfolioIssuesJson = {
                        "message": "No account found"
                    };
                    if (data.portfolioIds && data.portfolioIds.length > 0) {
                        portfolioIssuesJson["portfolioId"] = id;
                    } else {
                        portfolioIssuesJson["modelId"] = id;
                    }
                    issues.push(portfolioIssuesJson);
                }, this);
                return cb(null, accountsList, issues);
            });
        } else {
            logger.info("No Account / Portfolio /  Model Provide (getAccountsForTrades())");
            return cb(null, null, messages.NoTradeMethodProvide);
        }
    }
};

TradeToTargetService.prototype.getAccountsForTrades = function (data, cb) {
    logger.info("Get accounts for trades service called (getAccountsForTrades())");
    var issues = [];
    if (data.accountIds && data.accountIds.length > 0) {
        var accountIds = data.accountIds;
        logger.info("Account list return successfully (getAccountsForTrades()) " + accountIds);
        return cb(null, accountIds, issues);
    } else {
        if (data.modelIds && data.modelIds.length > 0) {
            var ids = (data.portfolioIds && data.portfolioIds.length > 0) ? data.portfolioIds : data.modelIds;
            tradeToTargetDao.getAccountsForModels(data, function (err, accountsList, modelList) {
                if (err) {
                    logger.error("Error in Getting accounts for portfolio (getAccountsForTrades()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                var inValidPortfolioIds = _.difference(ids, modelList);
                inValidPortfolioIds.forEach(function (id) {
                    var portfolioIssuesJson = {
                        "message": "No account found"
                    };
                    if (data.portfolioIds && data.portfolioIds.length > 0) {
                        portfolioIssuesJson["portfolioId"] = id;
                    } else {
                        portfolioIssuesJson["modelId"] = id;
                    }
                    issues.push(portfolioIssuesJson);
                }, this);
                return cb(null, accountsList, issues);
            });
        } else {
            logger.info("No Account / Portfolio /  Model Provide (getAccountsForTrades())");
            return cb(null, null, messages.NoTradeMethodProvide);
        }
    }
};
// TradeToTargetService.prototype.validateAllTrade = function (data, cb) {
//     logger.info("Generate Trade service called (validateAllTrade())");
//     var self = this;
//     var tradeList = [];
//     var issues = [];
//     self.getAccountsForTrades(data, function (err, tradesAccounts, message) {
//         if (err) {
//             logger.error("Error in getting Accounts For Trades  (validateAllTrade())" + err);
//             return next(err, responseCode.INTERNAL_SERVER_ERROR);
//         }

//         if (tradesAccounts && tradesAccounts.accountIds && tradesAccounts.accountIds.length > 0) {
//             var accountIds = tradesAccounts.accountIds;
//             var counter = accountIds.length;
//             asyncFor(accountIds, function (accountId, index, next) {
//                 logger.debug("Account & Security info not return (validateAllTrade())***********" + util.inspect(accountId));

//                 data.accountId = accountId;
//                 // data.connection = baseDao.getConnection(data);
//                 self.validateTrade(data, function (err, status, isValidTrade) {
//                     if (err) {
//                         logger.error("Error in validate trade  (validateAllTrade())" + err);
//                         return next(err, responseCode.INTERNAL_SERVER_ERROR);
//                     }
//                     if (isValidTrade.isValid) {
//                         logger.info("Account & Security info return successfully (validateAllTrade())");
//                         tradeList.push(isValidTrade);
//                         return next(null, isValidTrade);
//                     }
//                     else {
//                         logger.debug("Account & Security info not return (validateAllTrade())");
//                         issues.push(isValidTrade);
//                         return next(null, isValidTrade);
//                     }
//                 });
//             }, function (err, data) {
//                 return cb(null, tradeList, issues);
//             });
//         } else {
//             logger.debug("No account Found for trades (validateAllTrade())");
//             return cb(null, null, message);
//         }
//     });
// };

TradeToTargetService.prototype.validateAllTrade = function (data, cb) {
    logger.info("Generate Trade service called (validateAllTrade())");
    var self = this;
    var tradeList = [];
    var issues = [];
    var finalIssues = [];
    self.getAccountsForTrades(data, function (err, tradesAccounts, issuesList) {
        if (err) {
            logger.error("Error in getting Accounts For Trades  (validateAllTrade())" + err);
            return next(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        // console.log("**********issuesList*********" + util.inspect(issuesList));
        // console.log("**********tradesAccounts*********" + util.inspect(tradesAccounts));
        if (tradesAccounts && tradesAccounts.length > 0) {
            //issues = issuesList;

            var accountIds = tradesAccounts;
            var counter = accountIds.length;
            asyncFor(accountIds, function (accountId, index, next) {
                logger.debug("Account & Security info not return (validateAllTrade())***********" + util.inspect(accountId));

                data.accountId = accountId;
                // data.connection = baseDao.getConnection(data);
                self.validateTrade(data, function (err, status, isValidTrade) {
                    if (err) {
                        logger.error("Error in validate trade  (validateAllTrade())" + err);
                        return next(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (isValidTrade.isValid) {
                        logger.info("Account & Security info return successfully (validateAllTrade())");
                        tradeList.push(isValidTrade);
                        return next(null, isValidTrade);
                    }
                    else {
                        logger.debug("Account & Security info not return (validateAllTrade())");
                        issues.push(isValidTrade);
                        return next(null, isValidTrade);
                    }
                });
            }, function (err, data) {
                finalIssues = issuesList.length > 0 ? issuesList.concat(issues) : issues;
                // console.log("************finalIssues*******" + util.inspect(finalIssues));
                return cb(null, tradeList, finalIssues);
            });
        } else {
            logger.debug("No account Found for trades (validateAllTrade())");
            finalIssues = issuesList.length > 0 ? issuesList.concat(issues) : issues;
            return cb(null, null, finalIssues);
        }
    });
};

TradeToTargetService.prototype.checkPreferences = function (data, cb) {
    logger.info("Check Preferences service called (checkPreferences())");
    var self = this;
    self.tradePreferences(data, function (err, preferences) {
        if (err) {
            logger.error("Error in Checking Preferences  (checkPreferences())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } else {
            globalTradeConverter.sellAndBuyTradeListResponse(preferences, function (err, result, inValid) {
                if (err) {
                    logger.error("Error in sell And Buy Trade List Response  (generateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (result && result.length > 0) {
                    logger.info("Sell And Buy Trade return (generateTrade()) ");
                    // tradeList.push(result);
                    // issues.push(inValid);
                    return cb(null, result, inValid);
                }
                else {
                    logger.info("Sell And Buy Trade issues return (generateTrade()) ");
                    // tradeList.push(result);
                    // issues.push(inValid);
                    return cb(null, null, inValid);
                }
            });
        }
    })
};

TradeToTargetService.prototype.generateTradeOrder = function (data, cb) {
    logger.info("Generate Trade Order service called (generateTradeOrder())");
    var self = this;
    self.checkPreferences(data, function (err, tradeList, issues) {
        if (err) {
            logger.error("Error in validate trade  (generateTrade())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (tradeList && tradeList.length > 0) {
            var trade = {
                "tradingAppId": 6,
                "notes": data.reason
            }
            data.tradeInstance = trade;
            data.trades = tradeList;
            //console.log("******issues***********" + util.inspect(issues));
            // console.log("******tradeList***********" + util.inspect(tradeList));
            commonService.generateTrade(data, function (err, status, fetched) {
                if (err) {
                    logger.error("Error in Generating Trade (generateTradeForAll())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (status && status === "CREATED") {
                    logger.info(" Trade generated successfully (generateTradeForAll())");
                    // return cb(null, responseCode.CREATED, fetched);
                    return cb(null, fetched, issues);
                } else {
                    logger.debug("Unable to generate trade-to target(generateTradeForAll())");
                    return cb(null, fetched, issues);
                }
            });
        } else {
            logger.info("Empty sell And Buy Trade List Response  (generateTradeForAll())");
            return cb(null, null, issues);
        }
        // return cb(null, responseCode.UNPROCESSABLE, tradeList);
    });
};

TradeToTargetService.prototype.generateTradeForAll = function (data, cb) {
    logger.info("Generate Trade For All service called (generateTradeForAll())");
    var self = this;
    // data.connection = baseDao.getConnection(data);
    var sellPriority = null;
    var buyPriority = null;
    var finalIssues = [];
    self.validateAllInput(data, function (err, isValid, message) {

        if (err) {
            logger.error("Error in validate all input  (generateTrade())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (isValid) {
            commonTradeDao.getSecurityPreferenceSettingValue(data, function (err, exist) {
                if (err) {
                    logger.error("Error in validate trade  (generateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (exist.length > 0) {
                    sellPriority = (exist[0].securitySettingPreferenceId == 11) ? exist[0].value : ((exist[1].securitySettingPreferenceId == 11) ? exist[1].value : null);
                    buyPriority = (exist[0].securitySettingPreferenceId == 12) ? exist[0].value : ((exist[1].securitySettingPreferenceId == 12) ? exist[1].value : null);
                    // var buyPriority = exist[1].securitySettingPreferenceId;
                }

                if ((sellPriority != null && (data.security.side === 1 && buyPriority && buyPriority != 1)) ||
                    ((buyPriority != null && (data.security.side === 2 && sellPriority && sellPriority != 1)))
                    || sellPriority === null || buyPriority === null) {
                    self.validateAllTrade(data, function (err, validTradeData, issues) {
                        if (err) {
                            logger.error("Error in validate trade  (generateTrade())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        // console.log("******validTradeData********" + util.inspect(validTradeData));
                        // console.log("*****issues*********" + util.inspect(issues));
                        if (validTradeData && validTradeData.length > 0) {
                            data.isValidTrade = validTradeData;
                            self.generateTradeOrder(data, function (err, result, tradeIssues) {
                                if (err) {
                                    logger.error("Error in generate trade order(generateTrade())" + err);
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (result && result.instanceId) {
                                    finalIssues = issues.length > 0 ? issues.concat(tradeIssues) : tradeIssues;
                                    globalTradeConverter.instanceAndIssuesResponse(result, finalIssues, function (err, result) {
                                        if (err) {
                                            logger.error("Error in converting global-trade final result (generateTrade())" + err);
                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        if (result) {
                                            logger.info("Global-trade generated successfully (generateTrade())" + err);
                                            return cb(null, responseCode.CREATED, result);
                                        }
                                    });
                                }
                                else {
                                    data.issues = issues.length > 0 ? issues.concat(tradeIssues) : tradeIssues;

                                    // data.issues = tradeIssues;
                                    globalTradeConverter.tradeResponse(data, function (err, outPut) {
                                        if (err) {
                                            logger.error("Error in converting response (generateTrade())" + err);
                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                        } else {
                                            return cb(null, responseCode.UNPROCESSABLE, outPut);
                                        }
                                    });
                                }
                            })
                        } else {
                            if (issues && Array.isArray(issues)) {
                                //    console.log("**********************" + util.inspect(issues, false, null));
                                data.issues = issues;
                                globalTradeConverter.tradeResponse(data, function (err, outPut) {
                                    if (err) {
                                        logger.error("Error in converting response (generateTrade())" + err);
                                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                    } else {
                                        return cb(null, responseCode.UNPROCESSABLE, outPut);
                                    }
                                });
                            } else {
                                return cb(issues, responseCode.UNPROCESSABLE);
                            }
                            // return cb(null, responseCode.UNPROCESSABLE, issues);

                        }
                    });
                } else {
                    return cb("Do not trade  due to security preference", responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.debug("some input data not Valid (generateTrade())");
            return cb(message, responseCode.NOT_FOUND);
        }
    });
};

TradeToTargetService.prototype.getAccountAndSecurityInfo = function (data, cb) {
    logger.info("Validate Trade service called (getAccountAndSecurityInfo())");
    tradeToTargetDao.getAccountAndSecurityInfo(data, function (err, result) {
        if (err) {
            logger.error("Error in getting Account And Security Info (getAccountAndSecurityInfo())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } else {
            logger.info("Account & Security info return successfully (getAccountAndSecurityInfo())");
            return cb(null, responseCode.SUCCESS, result);
        }
    });
};

TradeToTargetService.prototype.validateTrade = function (data, cb) {
    logger.info("Validate Trade service called (validateTrade())");
    var self = this;
    self.getAccountAndSecurityInfo(data, function (err, status, result) {
        if (err) {
            logger.error("Error in validate trade  (validateTrade())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        // if (result[0].accountSetting && result[0].accountSetting.length > 0) {
        data.accountAndSecurityInfo = result;
        if (data.security.side === 1) {
            self.validateTradeForBuy(data, function (err, status, tradeForBuy) {
                if (err) {
                    logger.error("Error in validate Trade For Buy   (validateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                } else {
                    logger.info("Validate Trade For Buy successfully  (validateTrade())");
                    return cb(null, responseCode.SUCCESS, tradeForBuy);
                }
            })
        } else if (data.security.side === 2) {
            self.validateTradeForSell(data, function (err, status, tradeForSell) {
                if (err) {
                    logger.error("Error in validate Trade For Sell   (validateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                } else {
                    logger.info("Validate Trade For Sell successfully  (validateTrade())");
                    return cb(null, responseCode.SUCCESS, tradeForSell);
                }
            })
        } else {
            self.validateTradeForBuySell(data, function (err, status, tradeForBuy) {
                if (err) {
                    logger.error("Error in validate Trade For Buy Sell   (validateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                } else {
                    logger.info("Validate Trade For Buy Sell successfully  (validateTrade())");
                    return cb(null, responseCode.SUCCESS, tradeForBuy);
                }
            })
        }
        // }
        // else {
        //     logger.info("Account & Security info return successfully (validateTrade())");
        //     return cb(null, responseCode.SUCCESS, result);
        // }
        // return cb(null, responseCode.SUCCESS, result);

    })
};

TradeToTargetService.prototype.validateTradeForBuy = function (data, cb) {
    logger.info("Validate Trade For Buy service called (validateTradeForBuy())");
    var self = this;
    var accountAndSecurityInfo = data.accountAndSecurityInfo[0]
    var accountSetting = accountAndSecurityInfo.accountSetting;
    var holdingSetting = accountAndSecurityInfo.holdingSetting;
    var securitySetting = accountAndSecurityInfo.securitySetting;
    var buyWashSetting = accountAndSecurityInfo.buyWashSetting;
    var recentOrExistingBuy = accountAndSecurityInfo.recentOrExistingBuy;
    var modelElementSetting = accountAndSecurityInfo.modelElementSetting;
    var buyAccountSetting = accountAndSecurityInfo.buyAccountSetting;
    var securityPriceSetting = accountAndSecurityInfo.securityPriceSetting;

    var securityId = data.security.securityId;
    var isFullTrade = data.security.isFullTrade;
    //  var accountIds = data.accountIds;
    var accountId = data.accountId;
    var targetPercent = data.security.targetPercent;
    var allowWashSalesId = data.preferences.allowWashSalesId;
    var currentPercent = 0;
    var price = 0;
    var accountValue = 0;
    var excluded = 'No';
    var orderQty = 0;
    var securityTypeId;
    var targetAmount = 0;
    var cashAvailable = 0
    var cashReserve = 0;
    var targetCashAvailable = 0
    var newTargetPercent = 0
    var message = '';
    var newTargetAmount = 0;
    var finalBuyData = {};
    var isValid = true;
    var portfolioId = null;
    var custodianId = null;
    var positionId = null;
    var advisorId = null;
    var smaTradeable = null;
    var sma = null;
    var tradeMessage = [];
    var tradeOrderMessageFirst = {};
    var tradeOrderMessageSecond = {};
    var tradeOrderMessageThird = {};

    if (holdingSetting && holdingSetting.length > 0) {
        logger.debug("Holding Setting Found(validateTradeForBuy())");
        currentPercent = holdingSetting[0].currentInPer;
        //    price = holdingSetting[0].price;
        excluded = holdingSetting[0].excluded;
        //  securityTypeId = holdingSetting[0].securityTypeId;
    }
    if (securitySetting && securitySetting.length > 0) {
        logger.debug("Holding Setting Found(validateTradeForBuy())");
        // currentPercent = securitySetting[0].currentInPer;
        price = securitySetting[0].price;
        // excluded = holdingSetting[0].excluded;
        securityTypeId = securitySetting[0].securityTypeId;
        portfolioId = securitySetting[0].portfolioId;
        custodianId = securitySetting[0].custodianId;
        positionId = securitySetting[0].positionId;
        price = securitySetting[0].price;


    } else {
        if (buyAccountSetting && buyAccountSetting.length > 0) {
            portfolioId = buyAccountSetting[0].portfolioId;
            custodianId = buyAccountSetting[0].custodianId;
            advisorId = buyAccountSetting[0].advisorId;
            sma = buyAccountSetting[0].sma;
            smaTradeable = buyAccountSetting[0].smaTradeable;

        }

        if (securityPriceSetting && securityPriceSetting.length > 0) {
            price = securityPriceSetting[0].price;
        }
    }
    if (accountSetting && accountSetting.length > 0) {
        logger.debug("Account Setting Found(validateTradeForBuy())");
        if (excluded === '1' || excluded === "true") {
            logger.debug("Selected security is excluded for trading (validateTradeForBuy())");
            accountValue = accountSetting[0].managedValue;
            cashAvailable = accountSetting[0].cashAvailable;
            cashReserve = accountSetting[0].cashReserve;

            tradeOrderMessageFirst.shortCode = orderMessageShortCodes.TRADE_BLOCKED_ASSET_BUY;
            tradeOrderMessageFirst.arguments = null;
            tradeMessage.push(tradeOrderMessageFirst);

        } else {
            logger.debug("Selected security is not excluded for trading (validateTradeForBuy())");
            accountValue = accountSetting[0].totalValue;
            cashAvailable = accountSetting[0].cashAvailable;
            cashReserve = accountSetting[0].cashReserve;
        }
    }
    targetAmount = (accountValue * (targetPercent - currentPercent)) / 100;
    var modelElementTargetPercent = modelElementSetting[0].targetPercent;

    if (modelElementTargetPercent != 0) {
        targetPercent = (modelElementTargetPercent * targetPercent) / 100
    }

    if (buyAccountSetting && buyAccountSetting.length > 0 && accountSetting && accountSetting.length > 0) {
        if (custodianId != null) {
            if (securityPriceSetting && securityPriceSetting.length > 0) {
                if (currentPercent < targetPercent) {
                    targetCashAvailable = (cashAvailable - cashReserve);
                    if (cashReserve != 0) {
                        if (isFullTrade === true || isFullTrade === 1) {
                            //targetCashAvailable = cashAvailable;
                            logger.debug("cash Reserve is used for full trade in account (validateTradeForBuy())");
                            newTargetPercent = 100 * ((1500 / accountValue) + currentPercent / 100);
                            newTargetAmount = cashAvailable;
                            message = 'Not enough cash for account id ' + accountId + 'Resulting percentage will be ' + newTargetPercent + '%';

                            tradeOrderMessageFirst.shortCode = orderMessageShortCodes.NOT_ENOUGH_CASH;
                            tradeOrderMessageFirst.arguments = accountId;
                            tradeMessage.push(tradeOrderMessageFirst);

                            tradeOrderMessageSecond.shortCode = orderMessageShortCodes.RESULTING_PERCENTAGE;
                            tradeOrderMessageSecond.arguments = newTargetPercent;
                            tradeMessage.push(tradeOrderMessageSecond);

                            tradeOrderMessageThird.shortCode = orderMessageShortCodes.CASH_WAS_OVERSPENT;
                            tradeOrderMessageThird.arguments = null;
                            tradeMessage.push(tradeOrderMessageThird);

                        } else {
                            logger.debug("cash Reserve is available for account (validateTradeForBuy())");
                            newTargetPercent = 100 * ((1500 / accountValue) + currentPercent / 100);
                            newTargetAmount = targetCashAvailable;
                            message = 'Not enough cash for account id ' + accountId + 'Resulting percentage will be ' + newTargetPercent + '%';

                            tradeOrderMessageFirst.shortCode = orderMessageShortCodes.NOT_ENOUGH_CASH;
                            tradeOrderMessageFirst.arguments = accountId;
                            tradeMessage.push(tradeOrderMessageFirst);

                            tradeOrderMessageSecond.shortCode = orderMessageShortCodes.RESULTING_PERCENTAGE;
                            tradeOrderMessageSecond.arguments = newTargetPercent;
                            tradeMessage.push(tradeOrderMessageSecond);
                        }
                    } else if (cashAvailable < targetAmount) {
                        logger.debug("targetAmount is greater then cashAvailable (validateTradeForBuy())");
                        newTargetAmount = cashAvailable;
                        newTargetPercent = (targetPercent - currentPercent);
                        message = 'Reserve cash preference leaves available cash at $0';

                        tradeOrderMessageFirst.shortCode = orderMessageShortCodes.RESERVE_CASH;
                        tradeOrderMessageFirst.arguments = 0;
                        tradeMessage.push(tradeOrderMessageFirst);
                    } else if (cashAvailable === 0) {
                        logger.debug("cashAvailable is 0 (validateTradeForBuy())");
                        newTargetAmount = cashAvailable;
                        newTargetPercent = (targetPercent - currentPercent);
                        message = 'Available Cash is $0';

                        tradeOrderMessageFirst.shortCode = orderMessageShortCodes.AVAILABLE_CASH;
                        tradeOrderMessageFirst.arguments = 0;
                        tradeMessage.push(tradeOrderMessageFirst);
                    } else {
                        logger.debug("targetAmount is set (validateTradeForBuy())");
                        newTargetPercent = (targetPercent - currentPercent);
                        newTargetAmount = targetAmount;
                    }
                    if (price != 0) {
                        logger.debug("Seurity price is not 0 (validateTradeForBuy())");
                        orderQty = (((targetPercent - currentPercent) / 100) * newTargetAmount) / price;
                        logger.debug("Security OrderQty id " + util.inspect(orderQty) + " (validateTradeForBuy())");
                    }
                //    console.log("************orderQty********************" + util.inspect(orderQty));
                    if (securityTypeId === 5) {
                        logger.debug("Selected Security Type is Equity (validateTradeForBuy())");
                        orderQty = Math.floor(orderQty);
                    }
                    finalBuyData.quantity = orderQty;
                    finalBuyData.totalSellPrice = newTargetAmount;
                    finalBuyData.price = price;
                    finalBuyData.percent = targetPercent;
                    finalBuyData.newTargetPercent = newTargetPercent;
                    finalBuyData.buySecurityId = securityId;
                    finalBuyData.accountId = accountId;
                    finalBuyData.securityTypeId = securityTypeId;
                    finalBuyData.portfolioId = portfolioId;
                    finalBuyData.custodianId = custodianId;
                    finalBuyData.positionId = positionId;
                    finalBuyData.advisorId = advisorId;
                    finalBuyData.smaTradeable = smaTradeable;
                    finalBuyData.sma = sma;
                    finalBuyData.buyWashSetting = buyWashSetting;
                    finalBuyData.recentOrExistingBuy = recentOrExistingBuy;
                    finalBuyData.allowWashSalesId = allowWashSalesId;
                    finalBuyData.cashValuePostTrade = (cashAvailable - newTargetAmount);
                    finalBuyData.accountValue = accountValue;
                    finalBuyData.accountId = accountId;
                    finalBuyData.side = 1;
                    finalBuyData.tradeOrderMessage = tradeMessage;

                    logger.debug("final Buy Data return successfully (validateTradeForBuy())");
                } else {
                    isValid = false;
                    message = "Current Percent is already  greater then the target percent";
                }

                // finalBuyData.tradeOrderMessage = []
                //  finalBuyData.tradeOrderMessage.push(tradeMessage);
                //   console.log("********finalBuyData*******" + util.inspect(finalBuyData));
            } else {
                isValid = false;
                finalBuyData.securityId = securityId;
                message = "Security does not exist ";
            }
        } else {
            isValid = false;
            finalBuyData.accountId = accountId;
            message = "Invalid account as custodian is not attached with account ";
        }
    } else {
        isValid = false;
        finalBuyData.accountId = accountId;
        message = "Account does not exist ";
    }
    finalBuyData.message = message;
    finalBuyData.isValid = isValid;

    return cb(null, responseCode.SUCCESS, finalBuyData);
};

TradeToTargetService.prototype.validateTradeForSell = function (data, cb) {
    logger.info("Validate Trade For Sell service called (validateTradeForSell())");
    var self = this;
    var accountAndSecurityInfo = data.accountAndSecurityInfo[0]
    var accountSetting = accountAndSecurityInfo.accountSetting;
    var holdingSetting = accountAndSecurityInfo.holdingSetting;
    var securitySetting = accountAndSecurityInfo.securitySetting;
    var taxLotSetting = accountAndSecurityInfo.taxLotSetting;
    var buyWashSetting = accountAndSecurityInfo.buyWashSetting;
    var recentOrExistingBuy = accountAndSecurityInfo.recentOrExistingBuy;
    var modelElementSetting = accountAndSecurityInfo.modelElementSetting;
    var targetPercent = data.security.targetPercent;
    var securityId = data.security.securityId;
    var allowWashSalesId = data.preferences.allowWashSalesId;
    var allowShortTermGainsId = data.preferences.allowShortTermGainsId;
    // var accountIds = data.accountIds;
    var accountId = data.accountId;
    var currentPercent = 0;
    var price = 0;
    var accountValue = 0;
    var cashAvailable = 0;
    var excluded = 'No';
    var orderQty = 0;
    var securityTypeId;
    var targetAmount = 0;
    var message = '';
    var finalSellData = {}
    var isValid = true;
    var newTargetPercent = 0
    var portfolioId = null;
    var custodianId = null;
    var positionId = null;
    var advisorId = null;
    var smaTradeable = null;
    var sma = null;
    var tradeMessage = [];
    var tradeOrderMessageFirst = {};
    if (holdingSetting && holdingSetting.length > 0) {
        logger.debug("Holding Setting Found(validateTradeForSell())");
        currentPercent = holdingSetting[0].currentInPer;
        //  price = holdingSetting[0].price;
        excluded = holdingSetting[0].excluded;
        // excluded === '1'
        //    securityTypeId = holdingSetting[0].securityTypeId;
    }
    if (securitySetting && securitySetting.length > 0) {
        logger.debug("Holding Setting Found(validateTradeForBuy())");
        // currentPercent = securitySetting[0].currentInPer;
        price = securitySetting[0].price;
        // excluded = holdingSetting[0].excluded;
        securityTypeId = securitySetting[0].securityTypeId;
        portfolioId = securitySetting[0].portfolioId;
        custodianId = securitySetting[0].custodianId;
        positionId = securitySetting[0].positionId;
        advisorId = securitySetting[0].advisorId;
        smaTradeable = securitySetting[0].smaTradeable;
        sma = securitySetting[0].sma;
    }
    if (accountSetting && accountSetting.length > 0) {
        logger.debug("Account Setting Found(validateTradeForSell())");
        if (excluded === '1' || excluded === "true") {
            logger.debug("Selected security is excluded for trading (validateTradeForSell())");
            accountValue = accountSetting[0].managedValue;
            cashAvailable = accountSetting[0].cashAvailable;
            tradeOrderMessageFirst.shortCode = orderMessageShortCodes.TRADE_BLOCKED_ASSET_SELL;
            tradeOrderMessageFirst.arguments = null;
            tradeMessage.push(tradeOrderMessageFirst);

        } else {
            logger.debug("Selected security is excluded for trading (validateTradeForSell())");
            accountValue = accountSetting[0].totalValue;
        }
    }
    if (securitySetting && securitySetting.length > 0 && holdingSetting && holdingSetting.length > 0 && accountSetting && accountSetting.length > 0) {
        if (custodianId != null) {
            //   console.log("*********accountValue*****"+ util.inspect(accountValue));
            //     console.log("*******currentPercent - targetPercent****"+ util.inspect(currentPercent - targetPercent));
            targetAmount = (accountValue * (currentPercent - targetPercent)) / 100;
            var modelElementTargetPercent = modelElementSetting[0].targetPercent;
            if (modelElementTargetPercent != 0) {
                targetPercent = (modelElementTargetPercent * targetPercent) / 100
            }
            if (targetPercent < currentPercent) {
                if (price != 0) {
                    orderQty = (((currentPercent - targetPercent) / 100) * targetAmount) / price;
                    logger.debug("Security OrderQty is " + util.inspect(orderQty) + " (validateTradeForSell())");
                }
                if (securityTypeId === 5) {
                    logger.debug("Selected Security Type is Equity (validateTradeForSell())");
                    orderQty = Math.floor(orderQty);
                    logger.debug("Security OrderQty is " + util.inspect(orderQty) + " (validateTradeForSell())");
                }
                newTargetPercent = (currentPercent - targetPercent);

                finalSellData.quantity = orderQty
                finalSellData.totalSellPrice = targetAmount
                finalSellData.price = price;
                //   console.log("************targetAmount**********"+ util.inspect(targetAmount));
                finalSellData.percent = targetPercent;
                finalSellData.newTargetPercent = newTargetPercent;
                finalSellData.sellSecurityId = securityId;
                finalSellData.securityTypeId = securityTypeId;
                finalSellData.portfolioId = portfolioId;
                finalSellData.custodianId = custodianId;
                finalSellData.positionId = positionId;
                finalSellData.advisorId = advisorId;
                finalSellData.smaTradeable = smaTradeable;
                finalSellData.sma = sma;
                finalSellData.accountValue = accountValue;
                finalSellData.cashValuePostTrade = (cashAvailable + newTargetPercent);

                finalSellData.taxLotSetting = taxLotSetting;
                finalSellData.allowWashSalesId = allowWashSalesId;
                finalSellData.allowShortTermGainsId = allowShortTermGainsId;
                finalSellData.buyWashSetting = buyWashSetting;
                finalSellData.recentOrExistingBuy = recentOrExistingBuy;
                finalSellData.tradeOrderMessage = tradeMessage;

                finalSellData.side = 2;

            } else {
                message = "Target Percent is more to current Percent"
                isValid = false;
            }
        } else {
            isValid = false;
            finalSellData.accountId = accountId;
            message = "Invalid account as custodian is not attached with account or disabled ";
        }
    } else {
        isValid = false;
        message = "Account does not hold security for sell ";
    }
    finalSellData.accountId = accountId;
    finalSellData.message = message;
    finalSellData.isValid = isValid;


    logger.debug("final Buy Data return successfully");
    return cb(null, responseCode.SUCCESS, finalSellData);
};

TradeToTargetService.prototype.validateTradeForBuySell = function (data, cb) {
    logger.info("Validate Trade For Buy Sell service called (validateTradeForBuySell())");
    var self = this;
    var accountAndSecurityInfo = data.accountAndSecurityInfo[0]
    var holdingSetting = accountAndSecurityInfo.holdingSetting;
    var targetPercent = data.security.targetPercent;
    var currentPercent = 0;
    if (holdingSetting && holdingSetting.length > 0) {
        currentPercent = holdingSetting[0].currentInPer;
    }
    if (targetPercent < currentPercent) {
        self.validateTradeForSell(data, function (err, status, tradeForSell) {
            if (err) {
                logger.error("Error in validate Trade For  Sell   (validateTradeForBuySell())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("Validate Trade For Sell successfully  (validateTradeForBuySell())");
                tradeForSell.side = 2;
                return cb(null, responseCode.SUCCESS, tradeForSell);
            }
        });
    } else {
        self.validateTradeForBuy(data, function (err, status, tradeForBuy) {
            if (err) {
                logger.error("Error in validate Trade For Buy   (validateTradeForBuySell())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("Validate Trade For Buy successfully  (validateTradeForBuySell())");
                tradeForBuy.side = 1;
                return cb(null, responseCode.SUCCESS, tradeForBuy);
            }
        });
    }
};

TradeToTargetService.prototype.tradePreferences = function (data, cb) {
    logger.info("Trade preferences service called (tradePreferences())");
    var self = this;
    // var minimumTradePercent = data.preferences.minimumTradePercent ? data.preferences.minimumTradePercent : null;
    // var minimumTradeDollar = data.preferences.minimumTradeDollar ? data.preferences.minimumTradeDollar : null;
    var isValidTrade = data.isValidTrade;
    // var ignoreMinimumTrade = false;
    // data.minimumTradePercent = minimumTradePercent;
    // data.minimumTradeDollar = minimumTradeDollar;
    var cbFunction = cbCaller(1, function (err, data) {
        if (err) {
            logger.error("Error in cbCaller for trade Preferences (tradePreferences()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, data);
    });
    /*    if (minimumTradePercent != null || minimumTradeDollar != null) {
            data.minimumTradePercent = minimumTradePercent;
            data.minimumTradeDollar = minimumTradeDollar;
            self.directPreferencesCheck(data, function (err, isValidDirectPreferencesStatus, isValidDirectPreferences) {
                if (err) {
                    logger.error("Error in direct Preferences Check  (tradePreferences())" + err);
                    return cbFunction(err, responseCode.INTERNAL_SERVER_ERROR);
                } else {
                    logger.info("Direct preferences check successfully ");
                    // data.ignoreMinimumTrade = true;
                    cbFunction(null, isValidDirectPreferences);
                }
            });
        } else {
            logger.info("No Direct preferences Found ");
            cbFunction(null, isValidTrade);
    }*/
    if (isValidTrade[0].side && isValidTrade[0].side === 1) {
        self.inDirectPreferencesCheckForBuy(data, function (err, isValidInDirectPreferences) {
            if (err) {
                logger.error("Error in InDirect Preferences Check  (tradePreferences())" + err);
                return cbFunction(err, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("InDirect preferences check for Buy successfully ");
                self.allowWashSales(isValidInDirectPreferences, function (err, allowWash) {
                    if (err) {
                        logger.error("Error in allow Wash buy Check  (tradePreferences())" + err);
                        return cbFunction(err, responseCode.INTERNAL_SERVER_ERROR);
                    } else {
                        logger.info("Allow Wash Sales Check successfully  (tradePreferences())" + err);
                        cbFunction(null, allowWash);
                    }
                })
                //   cbFunction(null, isValidInDirectPreferences);
            }
        });
    }
    if (isValidTrade[0].side === 2) {
        self.inDirectPreferencesCheckForSell(data, function (err, isValidInDirectPreferences) {
            if (err) {
                logger.error("Error in InDirect Preferences Check  (tradePreferences())" + err);
                return cbFunction(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            // if (isValidInDirectPreferences[0].isValid === true) {
            logger.info(" Allow Short Term Gains Checking ");
            self.allowShortTermGains(isValidInDirectPreferences, function (err, allowShort) {
                if (err) {
                    logger.error("Error in allow Short term Gains ( tradePreferences())");
                    return cbFunction(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                else {
                    logger.info("Allow short term Gains is happing  ( tradePreferences())");
                    self.allowWashSales(allowShort, function (err, allowWash) {
                        if (err) {
                            logger.error("Error in allow Wash Sale Check  (tradePreferences())" + err);
                            return cbFunction(err, responseCode.INTERNAL_SERVER_ERROR);
                        } else {
                            logger.info("Allow Wash Sales Check successfully  (tradePreferences())" + err);
                            cbFunction(null, allowWash);
                        }
                    })
                    // cbFunction(null, allowShort);
                }
            });
            //  cbFunction(null, isValidInDirectPreferences);

            // } else {
            //     logger.info("InDirect preferences check sell successfully ");
            //     cbFunction(null, isValidInDirectPreferences);
            // }
            // cbFunction(null, isValidInDirectPreferences);
        });
    }

};

TradeToTargetService.prototype.tradePreferencesOld = function (data, cb) {
    logger.info("Trade preferences service called (tradePreferences())");
    var self = this;
    var minimumTradePercent = data.preferences.minimumTradePercent ? data.preferences.minimumTradePercent : null;
    var minimumTradeDollar = data.preferences.minimumTradeDollar ? data.preferences.minimumTradeDollar : null;
    var isValidTrade = data.isValidTrade;
    var ignoreMinimumTrade = false;
    var cbFunction = cbCaller(2, function (err, data) {
        if (err) {
            logger.error("Error in cbCaller for trade Preferences (tradePreferences()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, data);
    });
    if (minimumTradePercent != null || minimumTradeDollar != null) {
        data.minimumTradePercent = minimumTradePercent;
        data.minimumTradeDollar = minimumTradeDollar;
        self.directPreferencesCheck(data, function (err, isValidDirectPreferencesStatus, isValidDirectPreferences) {
            if (err) {
                logger.error("Error in direct Preferences Check  (tradePreferences())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                data.isValidTrade
                logger.info("Direct preferences check successfully ");
                data.ignoreMinimumTrade = true;
                cbFunction(null, isValidDirectPreferences);
            }
        });
    } else {
        logger.info("No Direct preferences Found ");
        cbFunction(null, isValidTrade);
    }
    if (isValidTrade.side === 1) {
        self.inDirectPreferencesCheckForBuy(data, function (err, isValidInDirectPreferences) {
            if (err) {
                logger.error("Error in InDirect Preferences Check  (tradePreferences())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("InDirect preferences check for Buy successfully ");
                self.allowWashSales(isValidInDirectPreferences, function (err, allowWash) {
                    if (err) {
                        logger.error("Error in allow Wash buy Check  (tradePreferences())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    } else {
                        logger.info("Allow Wash Sales Check successfully  (tradePreferences())" + err);
                        cbFunction(null, allowWash);
                    }
                })
                //  cbFunction(null, isValidInDirectPreferences);
            }
        });
    }
    if (isValidTrade.side === 2) {
        self.inDirectPreferencesCheckForSell(data, function (err, isValidInDirectPreferences) {
            if (err) {
                logger.error("Error in InDirect Preferences Check  (tradePreferences())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (isValidInDirectPreferences[0].isValid === true) {
                logger.info(" Allow Short Term Gains Checking ");
                self.allowShortTermGains(isValidInDirectPreferences, function (err, allowShort) {
                    if (err) {
                        logger.error("Error in allow Short term Gains ( tradePreferences())");
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    else {
                        logger.info("Allow short term Gains is happing  ( tradePreferences())");
                        self.allowWashSales(isValidInDirectPreferences, function (err, allowWash) {
                            if (err) {
                                logger.error("Error in allow Wash Sale Check  (tradePreferences())" + err);
                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                            } else {
                                logger.info("Allow Wash Sales Check successfully  (tradePreferences())" + err);
                                cbFunction(null, allowWash);
                            }
                        })
                        cbFunction(null, allowShort);
                    }
                })
            } else {
                logger.info("InDirect preferences check sell successfully ");
                cbFunction(null, isValidInDirectPreferences);
            }
        });
    }
};

TradeToTargetService.prototype.directPreferencesCheck = function (data, cb) {
    logger.info("Direct Preferences Check service called (directPreferencesCheck())");
    var isValidTrades = data.isValidTrade;
    var directPreferences = [];
    isValidTrades.forEach(function (isValidTrade) {
        if (data.minimumTradePercent <= isValidTrade.newTargetPercent) {
            logger.info("Minimum Trade Percent Applied   ");
            isValidTrade.isValid = true;
        } else {
            logger.info("Minimum Trade Percent Not Applied   ");
            isValidTrade.message = "Minimum Trade Percent is more than to target Percent";
            isValidTrade.isValid = false;
        }
        if (data.minimumTradeDollar <= isValidTrade.totalSellPrice) {
            logger.info("Minimum Trade Dollar Applied  ");
            isValidTrade.isValid = true;
        } else {
            logger.info("Minimum Trade Dollar Not Applied ");
            isValidTrade.message = "Minimum Trade Dollar is more than to target amount";
            isValidTrade.isValid = false;
        }
        directPreferences.push(isValidTrade);
        logger.info("Direct Preferences Applied successfully");
    }, this);

    cb(null, responseCode.SUCCESS, directPreferences);
};

TradeToTargetService.prototype.directPreferencesCheckOld = function (data, cb) {
    logger.info("Direct Preferences Check service called (directPreferencesCheck())");
    var isValidTrade = data.isValidTrade;
    var directPreferences = {};
    if (data.minimumTradePercent <= isValidTrade.newTargetPercent) {
        logger.info("Minimum Trade Percent Applied   ");
        isValidTrade.isValid = true;
    } else {
        logger.info("Minimum Trade Percent Not Applied   ");
        isValidTrade.message = "Minimum Trade Percent is more than to target Percent";
        isValidTrade.isValid = false;
    }
    if (data.minimumTradeDollar <= isValidTrade.finalPrice) {
        logger.info("Minimum Trade Dollar Applied  ");
        isValidTrade.isValid = true;
    } else {
        logger.info("Minimum Trade Dollar Not Applied ");
        isValidTrade.message = "Minimum Trade Dollar is more than to target amount";
        isValidTrade.isValid = false;
    }
    logger.info("Direct Preferences Applied successfully");
    cb(null, responseCode.SUCCESS, isValidTrade);
};

TradeToTargetService.prototype.inDirectPreferencesCheckForBuy = function (data, cb) {
    logger.info("In direct Preferences Check Buy service called (inDirectPreferencesCheck())");
    var self = this;
    var calculation = data.isValidTrade;
    // var minimumTradePercent = data.minimumTradePercent;
    // var minimumTradeDollar = data.minimumTradeDollar;
    // var issues = [];
    // var valid = [];
    // calculation.forEach(function (element) {

    //     if (element.isValid === true) {
    //         valid.push(element);
    //     } else {
    //         issues.push(element);
    //     }
    // }, this);
    data.calculation = calculation;
    // data.minimumTradePercent = minimumTradePercent;
    // data.minimumTradeDollar = minimumTradeDollar;
    self.applyPreferencesForBuyTrade(data, function (err, buyTrade) {
        if (err) {
            logger.debug("Error in applying preferences for Sell trade (inDirectPreferencesCheck())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        else {
            return cb(null, buyTrade);
        }
    });
};

TradeToTargetService.prototype.inDirectPreferencesCheckForSell = function (data, cb) {
    logger.info("In direct Preferences Check Sell service called (inDirectPreferencesCheckForSell())");
    // var calculation = [];
    // var isValidTrade = data.isValidTrade;
    // var tradeData = {};
    var self = this;
    // var finalIssues = [];
    // tradeData.accountId = [];
    // tradeData.accountId.push(isValidTrade.accountId);
    // tradeData.sellSecurityId = isValidTrade.securityId;
    // tradeData.totalSellPrice = isValidTrade.finalPrice;
    // tradeData.quantity = isValidTrade.orderQty;
    // tradeData.side = isValidTrade.side;
    // tradeData.securityTypeId = isValidTrade.securityTypeId;
    // tradeData.portfolioId = isValidTrade.portfolioId;
    // tradeData.custodianId = isValidTrade.custodianId;
    // tradeData.positionId = isValidTrade.positionId;
    // tradeData.allowWashSalesId = isValidTrade.allowWashSalesId;
    // tradeData.allowShortTermGainsId = isValidTrade.allowShortTermGainsId;
    // tradeData.buyWashSetting = isValidTrade.buyWashSetting;
    // tradeData.recentOrExistingBuy = isValidTrade.recentOrExistingBuy;

    // tradeData.taxLotSetting = isValidTrade.taxLotSetting;


    // calculation.push(tradeData);
    var calculation = data.isValidTrade;
    data.calculation = calculation;
    self.applyPreferencesForSellTrade(data, function (err, sellTrade) {
        if (err) {
            logger.debug("Error in applying preferences for Sell trade (inDirectPreferencesCheckForSell())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        else {
            return cb(null, sellTrade);
        }
    });
};

TradeToTargetService.prototype.applyPreferencesForSellTrade = function (data, cb) {
    logger.info("Apply preferences for trade service called (applyPreferencesForSellTrade())");
    var self = this;
    var minimumTradePercent = data.preferences.minimumTradePercent ? data.preferences.minimumTradePercent : null;
    var minimumTradeDollar = data.preferences.minimumTradeDollar ? data.preferences.minimumTradeDollar : null;
    var calculation = data.calculation;
    var result = [];
    //var issues = [];
    var counter = calculation.length;
    // var cbfn = cbCaller(counter, function (err, data) {
    //     if (err) {
    //         logger.error("Error in cbCaller for applying preferences for trade (applyPreferencesForSellTrade()) " + err);
    //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    //     }
    //     return cb(null, data);
    // });
    //  calculation.forEach(function (account) {
    asyncFor(calculation, function (account, index, next) {
        //   data.connection = baseDao.getConnection(data);
        var accountId = account.accountId
        var actualSellPrice = null;
        var quantity = account.quantity;
        var totalSellPrice = account.totalSellPrice;
        var isValid = true;
        var issues = [];
        var issuesData = {};
        var securityData = {};
        var modelId = null;
        globalTradeDao.applyPreferencesForTrade(data, accountId, function (err, fetched) {
            if (err) {
                logger.error("Error in applying preferences for trade (applyPreferencesForSellTrade()) " + err);
                return next(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("The new targetPercent is " + util.inspect(account.newTargetPercent));
            if (minimumTradePercent === null || minimumTradePercent <= account.newTargetPercent) {
                logger.info("The new trade amount is  " + util.inspect(account.totalSellPrice));
                if (minimumTradeDollar === null || minimumTradeDollar <= account.totalSellPrice) {
                    if (fetched[0].tradeSetting && fetched[0].tradeSetting.length > 0) {
                        logger.debug("Account preference exist  (applyPreferencesForSellTrade()) ");
                        fetched[0].tradeSetting.forEach(function (preference) {

                            if (account.sellSecurityId === preference.securityId) {
                                modelId = preference.modelId ? preference.modelId : null;

                                if (parseInt(preference.sellTradeMinPctBySecurity) <= account.percent || parseInt(preference.sellTradeMinPctBySecurity) === 0) {
                                    if (parseInt(preference.sellTradeMaxPctBySecurity) >= account.percent || parseInt(preference.sellTradeMaxPctBySecurity) === 0) {
                                        var transactionCostIncludedOrAddedToTrade = null;
                                        var roundingForMutualFunds = null;
                                        var roundEquityRollup = null;
                                        var roundingforEquities = null;
                                        if (fetched[0].accountSetting) {
                                            if (fetched[0].accountSetting[1]) {
                                                transactionCostIncludedOrAddedToTrade = fetched[0].accountSetting[1].transactionCostIncludedOrAddedToTrade;
                                            } else {
                                                transactionCostIncludedOrAddedToTrade = fetched[0].accountSetting[0].transactionCostIncludedOrAddedToTrade;
                                            }
                                            //   console.log("********************" + util.inspect(account.totalSellPrice));
                                            if (account.securityTypeId === 1) {
                                                logger.debug("sell securityTypeId is  MutualFunds (applyPreferencesForSellTrade()) ");

                                                roundingForMutualFunds = fetched[0].accountSetting[1].roundingforMutualFunds;
                                                if (roundingForMutualFunds === null) {
                                                    roundingForMutualFunds = fetched[0].accountSetting[0].roundingforMutualFunds;
                                                }
                                                //    console.log("**********roundingForMutualFunds**********" + util.inspect(roundingForMutualFunds));

                                                roundingForMutualFunds = parseInt(roundingForMutualFunds);
                                                if (roundingForMutualFunds !== 0) {
                                                    logger.debug("Rounding For Mutual Funds Preferences Applied (applyPreferencesForSellTrade()) ");
                                                    // quantity = utilService.roundOfValue(quantity, roundingForMutualFunds);
                                                    totalSellPrice = utilService.roundOfValue(account.totalSellPrice, roundingForMutualFunds);
                                                    // var newTotalSellPrice = utilService.roundOfValue(3958.6008, 5);
                                                } else {
                                                    logger.debug("Rounding For  Mutual Funds Preferences Value is NULL Or Zero(0) Found(applyPreferencesForSellTrade()) ");
                                                }
                                            } else if (account.securityTypeId === 5) {
                                                logger.debug("sell securityTypeId is  Equity (applyPreferencesForSellTrade()) ");

                                                roundEquityRollup = fetched[0].accountSetting[1].roundEquityRollup;

                                                if (roundEquityRollup === null) {
                                                    roundEquityRollup = fetched[0].accountSetting[0].roundEquityRollup;
                                                }
                                                if (roundEquityRollup === 'true' || roundEquityRollup === 1 || roundEquityRollup === '1') {
                                                    roundingforEquities = fetched[0].accountSetting[0].roundingforEquities;
                                                    if (roundingforEquities === null) {
                                                        roundingforEquities = fetched[0].accountSetting[0].roundingforEquities;
                                                    }
                                                }
                                                roundingforEquities = parseInt(roundingforEquities);
                                                if (roundingforEquities !== 0) {
                                                    logger.debug("Rounding For Equity Preferences Applied (applyPreferencesForSellTrade()) ");
                                                    // totalSellPrice = utilService.roundOfValue(account.totalSellPrice, roundingforEquities);
                                                    quantity = utilService.roundOfValue(quantity, roundingforEquities);
                                                } else {
                                                    logger.debug("Rounding For Equity Preferences Value is NULL Or Zero(0) Found(applyPreferencesForSellTrade()) ");
                                                }
                                            }
                                        }
                                        // console.log("*********totalSellPrice***********" + util.inspect(totalSellPrice));

                                        if (transactionCostIncludedOrAddedToTrade === 'true') {
                                            actualSellPrice = (totalSellPrice + parseInt(preference.sellTransactionFee));
                                            logger.debug("Trade sell TransactionFee (applyPreferencesForSellTrade()) " + actualSellPrice);
                                        } else {
                                            actualSellPrice = (totalSellPrice);
                                        }
                                        logger.debug(" SellTradeMinAmtBySecurity  (applyPreferencesForSellTrade()) " + parseInt(preference.sellTradeMinAmtBySecurity));

                                        if (actualSellPrice <= parseInt(preference.sellTradeMaxAmtBySecurity)) {
                                            actualSellPrice = actualSellPrice;
                                            logger.debug("ActualSellPrice After sellTradeMaxAmtBySecurity checked  (applyPreferencesForSellTrade()) " + actualSellPrice);
                                        } else {

                                            isValid = false;
                                            issuesData = {
                                                "accountId": account.accountId,
                                                "securityId": account.sellSecurityId,
                                                "message": "Sell price is more then to the max amount from preferences"
                                            }
                                            issues.push(issuesData);
                                            logger.debug("ActualSellPrice is more then sellTradeMaxAmtBySecurity  (applyPreferencesForSellTrade()) " + issues);
                                        }
                                    } else {
                                        isValid = false;
                                        issuesData = {
                                            "accountId": account.accountId,
                                            "securityId": account.sellSecurityId,
                                            "message": "Sell percent is more then to the max percent trade Preferences "
                                        }
                                        issues.push(issuesData);
                                        logger.debug("ActualSellPrice is more then sellTradeMinAmtBySecurity  (applyPreferencesForSellTrade()) " + issues);
                                    }
                                } else {
                                    isValid = false;
                                    issuesData = {
                                        "accountId": account.accountId,
                                        "securityId": account.sellSecurityId,
                                        "message": "Sell percent is more then to the min percent trade Preferences "
                                    }
                                    issues.push(issuesData);
                                    logger.debug("ActualSellPrice is more then sellTradeMinAmtBySecurity  (applyPreferencesForSellTrade()) " + issues);
                                }
                            }
                        }, this);
                    } else {
                        logger.debug("Account preference does not exist  (applyPreferencesForSellTrade()) ");
                        actualSellPrice = account.totalSellPrice;
                    }
                } else {
                    isValid = false;
                    issuesData = {
                        "accountId": account.accountId,
                        "securityId": account.sellSecurityId,
                        "message": " Minimum Trade Dollar is more than to target amount"
                    }
                    issues.push(issuesData);
                    logger.debug(" Minimum Trade Dollar Not Applied   (applyPreferencesForBuyTrade()) " + issues);
                    //           logger.info("Minimum Trade Dollar Not Applied ");
                    // isValidTrade.message = "Minimum Trade Dollar is more than to target amount";
                    // isValidTrade.isValid = false;
                }
            } else {
                isValid = false;
                issuesData = {
                    "accountId": account.accountId,
                    "securityId": account.sellSecurityId,
                    "message": "Minimum Trade Percent is more than to target Percent"
                }
                issues.push(issuesData);
                logger.debug(" Minimum Trade Percent Not Applied   (applyPreferencesForBuyTrade()) " + issues);

                //     logger.info("Minimum Trade Percent Not Applied   ");
                // isValidTrade.message = "Minimum Trade Percent is more than to target Percent";
                // isValidTrade.isValid = false;
            }
            securityData["accountId"] = account.accountId;
            securityData["sellSecurityId"] = account.sellSecurityId;
            securityData["quantity"] = quantity;
            securityData["totalSellPrice"] = account.totalSellPrice;
            securityData["price"] = account.price;
            securityData["percent"] = account.percent;
            securityData["actualSellPrice"] = actualSellPrice;
            securityData["isValid"] = isValid;
            securityData["issues"] = issues;
            securityData["side"] = account.side;
            securityData["securityTypeId"] = account.securityTypeId;
            securityData["custodianId"] = account.custodianId;
            securityData["portfolioId"] = account.portfolioId;
            securityData["positionId"] = account.positionId;
            securityData["advisorId"] = account.advisorId;
            securityData["modelId"] = modelId;
            securityData["smaTradeable"] = account.smaTradeable;
            securityData["sma"] = account.sma;
            securityData["accountValue"] = account.accountValue;
            securityData["cashValuePostTrade"] = account.cashValuePostTrade;

            securityData["taxLotSetting"] = account.taxLotSetting;
            securityData["allowWashSalesId"] = account.allowWashSalesId;
            securityData["allowShortTermGainsId"] = account.allowShortTermGainsId;
            securityData["allowShortTermGainsId"] = account.allowShortTermGainsId;
            securityData["buyWashSetting"] = account.buyWashSetting;
            securityData["recentOrExistingBuy"] = account.recentOrExistingBuy;
            securityData["tradeOrderMessage"] = account.tradeOrderMessage;

            result.push(securityData);

            logger.debug("Final result for an account  (applyPreferencesForSellTrade()) ");
            // return cbfn(null, result);
            return next(null, result);

        });
        //  }, this);
    }, function (err, data) {
        return cb(null, result);
    });
};

TradeToTargetService.prototype.applyPreferencesForBuyTrade = function (data, cb) {
    logger.info("Apply preferences for trade service called (applyPreferencesForBuyTrade())");
    var self = this;
    var minimumTradePercent = data.preferences.minimumTradePercent ? data.preferences.minimumTradePercent : null;
    var minimumTradeDollar = data.preferences.minimumTradeDollar ? data.preferences.minimumTradeDollar : null;
    var calculation = data.calculation;
    // console.log("********data*********" + util.inspect(data));
    // console.log("********minimumTradePercent*********" + util.inspect(minimumTradePercent));
    //    console.log("********minimumTradeDollar*********" + util.inspect(minimumTradeDollar));
    var result = [];
    // var issues = [];
    var counter = calculation.length;
    // var cbfn = cbCaller(counter, function (err, data) {
    //     if (err) {
    //         logger.error("Error in cbCaller for applying preferences for trade (applyPreferencesForBuyTrade()) " + err);
    //         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    //     }
    //     return cb(null, data);
    // });
    //  calculation.forEach(function (account) {
    // console.log("*****************" + util.inspect(account));
    asyncFor(calculation, function (account, index, next) {
        // data.connection = baseDao.getConnection(data);
        var accountId = account.accountId
        var accountId = accountId
        var modelId = null;
        var actualBuyPrice = account.totalSellPrice;
        var isValid = true;
        var totalSellPrice = account.totalSellPrice;
        var quantity = account.quantity;
        var issues = [];
        var issuesData = {};
        var securityData = {};
        globalTradeDao.applyPreferencesForTrade(data, accountId, function (err, fetched) {
            if (err) {
                logger.error("Error in applying preferences for trade (applyPreferencesForBuyTrade()) " + err);
                //return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
                return next(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("The new targetPercent is " + util.inspect(account.newTargetPercent));
            if (minimumTradePercent === null || minimumTradePercent <= account.newTargetPercent) {
                logger.info("The new trade amount is  " + util.inspect(account.totalSellPrice));
                if (minimumTradeDollar === null || minimumTradeDollar <= account.totalSellPrice) {
                    if (fetched[0].tradeSetting && fetched[0].tradeSetting.length > 0) {
                        logger.debug("Account preference exist  (applyPreferencesForBuyTrade()) ");
                        fetched[0].tradeSetting.forEach(function (preference) {
                            if (account.buySecurityId === preference.securityId) {
                                modelId = preference.modelId ? preference.modelId : null;
                                if (parseInt(preference.buyTradeMinPctBySecurity) <= account.percent || parseInt(preference.buyTradeMinPctBySecurity) === 0) {
                                    if (parseInt(preference.buyTradeMaxPctBySecurity) >= account.percent || parseInt(preference.buyTradeMaxPctBySecurity) === 0) {
                                        var transactionCostIncludedOrAddedToTrade = null;
                                        var roundingForMutualFunds = null;
                                        var roundEquityRollup = null;
                                        var roundingforEquities = null;
                                        var transactionCostIncludedOrAddedToTrade = null;
                                        if (fetched[0].accountSetting) {
                                            if (fetched[0].accountSetting[1]) {
                                                transactionCostIncludedOrAddedToTrade = fetched[0].accountSetting[1].transactionCostIncludedOrAddedToTrade;
                                            } else {
                                                transactionCostIncludedOrAddedToTrade = fetched[0].accountSetting[0].transactionCostIncludedOrAddedToTrade;
                                            }
                                            if (account.securityTypeId === 1) {
                                                logger.debug("sell securityTypeId is  MutualFunds (applyPreferencesForSellTrade()) ");

                                                roundingForMutualFunds = fetched[0].accountSetting[1].roundingforMutualFunds;
                                                if (roundingForMutualFunds === null) {
                                                    roundingForMutualFunds = fetched[0].accountSetting[0].roundingforMutualFunds;
                                                }
                                                roundingForMutualFunds = parseInt(roundingForMutualFunds);
                                                if (roundingForMutualFunds !== 0) {
                                                    logger.debug("Rounding For Mutual Funds Preferences Applied (applyPreferencesForBuyTrade()) ");
                                                    //   quantity = utilService.roundOfValue(quantity, roundingForMutualFunds);
                                                    totalSellPrice = utilService.roundOfValue(totalSellPrice, roundingForMutualFunds);
                                                } else {
                                                    logger.debug("Rounding For  Mutual Funds Preferences Value is NULL Or Zero(0) Found(applyPreferencesForBuyTrade()) ");
                                                }
                                            } else if (account.securityTypeId === 5) {
                                                logger.debug("sell securityTypeId is  Equity (applyPreferencesForBuyTrade()) ");

                                                roundEquityRollup = fetched[0].accountSetting[1].roundEquityRollup;

                                                if (roundEquityRollup === null) {
                                                    roundEquityRollup = fetched[0].accountSetting[0].roundEquityRollup;
                                                }
                                                if (roundEquityRollup === 'true' || roundEquityRollup === 1 || roundEquityRollup === '1') {
                                                    roundingforEquities = fetched[0].accountSetting[0].roundingforEquities;
                                                    if (roundingforEquities === null) {
                                                        roundingforEquities = fetched[0].accountSetting[0].roundingforEquities;
                                                    }
                                                }
                                                roundingforEquities = parseInt(roundingforEquities);
                                                if (roundingforEquities !== 0) {
                                                    logger.debug("Rounding For Equity Preferences Applied (applyPreferencesForBuyTrade()) ");
                                                    //    actualBuyPrice = utilService.roundOfValue(actualBuyPrice, roundingforEquities);
                                                    quantity = utilService.roundOfValue(quantity, roundingforEquities);

                                                } else {
                                                    logger.debug("Rounding For Equity Preferences Value is NULL Or Zero(0) Found(applyPreferencesForBuyTrade()) ");
                                                }
                                            }
                                        }
                                        if (transactionCostIncludedOrAddedToTrade === 'true') {
                                            actualBuyPrice = (totalSellPrice + parseInt(preference.buyTransactionFee));
                                            logger.debug("Trade buy TransactionFee (applyPreferencesForBuyTrade()) " + actualBuyPrice);
                                        } else {
                                            actualBuyPrice = (totalSellPrice);
                                        }
                                        logger.debug(" BuyTradeMinAmtBySecurity  (applyPreferencesForBuyTrade()) " + parseInt(preference.buyTradeMinAmtBySecurity));
                                        if (actualBuyPrice <= parseInt(preference.buyTradeMaxAmtBySecurity)) {
                                            actualBuyPrice = actualBuyPrice;
                                            logger.debug("ActualBuyPrice After buyTradeMaxAmtBySecurity checked  (applyPreferencesForBuyTrade()) " + actualBuyPrice);
                                        } else {
                                            // actualBuyPrice = parseInt(preference.buyTradeMaxAmtBySecurity);
                                            isValid = false;
                                            issuesData = {
                                                "accountId": account.accountId,
                                                "securityId": account.buySecurityId,
                                                "message": "Buy price is more then to thr max amount from preferences "
                                            }
                                            issues.push(issuesData);
                                            logger.debug("ActualBuyPrice is more then buyTradeMaxAmtBySecurity  (applyPreferencesForBuyTrade()) " + issues);
                                        }
                                    } else {
                                        isValid = false;
                                        issuesData = {
                                            "accountId": account.accountId,
                                            "securityId": account.sellSecurityId,
                                            "message": "Buy percent is more then to the max percent trade Preferences "
                                        }
                                        issues.push(issuesData);
                                        logger.debug("ActualSellPrice is more then sellTradeMinAmtBySecurity  (applyPreferencesForSellTrade()) " + issues);
                                    }
                                } else {
                                    isValid = false;
                                    issuesData = {
                                        "accountId": account.accountId,
                                        "securityId": account.sellSecurityId,
                                        "message": "Buy percent is more then to the min percent trade Preferences "
                                    }
                                    issues.push(issuesData);
                                    logger.debug("ActualSellPrice is more then sellTradeMinAmtBySecurity  (applyPreferencesForSellTrade()) " + issues);
                                }
                            }
                        }, this);
                    }
                    else {
                        logger.debug("Account preference does not exist  (applyPreferencesForBuyTrade()) ");
                        actualBuyPrice = account.totalSellPrice;
                    }
                } else {
                    isValid = false;
                    issuesData = {
                        "accountId": account.accountId,
                        "securityId": account.buySecurityId,
                        "message": " Minimum Trade Dollar is more than to target amount"
                    }
                    issues.push(issuesData);
                    logger.debug(" Minimum Trade Dollar Not Applied   (applyPreferencesForBuyTrade()) " + issues);
                    //           logger.info("Minimum Trade Dollar Not Applied ");
                    // isValidTrade.message = "Minimum Trade Dollar is more than to target amount";
                    // isValidTrade.isValid = false;
                }
            } else {
                isValid = false;
                issuesData = {
                    "accountId": account.accountId,
                    "securityId": account.buySecurityId,
                    "message": "Minimum Trade Percent is more than to target Percent"
                }
                issues.push(issuesData);
                logger.debug(" Minimum Trade Percent Not Applied   (applyPreferencesForBuyTrade()) " + issues);

                //     logger.info("Minimum Trade Percent Not Applied   ");
                // isValidTrade.message = "Minimum Trade Percent is more than to target Percent";
                // isValidTrade.isValid = false;
            }
            securityData["accountId"] = account.accountId;
            securityData["buySecurityId"] = account.buySecurityId;
            securityData["quantity"] = quantity;

            securityData["percent"] = account.percent;
            securityData["totalSellQty"] = account.totalSellQty;
            securityData["price"] = account.price;
            securityData["totalSellPrice"] = account.totalSellPrice;
            securityData["actualSellPrice"] = account.actualSellPrice;
            securityData["actualBuyPrice"] = actualBuyPrice;
            securityData["isValid"] = isValid;
            securityData["side"] = account.side;
            securityData["securityTypeId"] = account.securityTypeId;
            securityData["custodianId"] = account.custodianId;
            securityData["portfolioId"] = account.portfolioId;
            securityData["positionId"] = account.positionId;
            securityData["modelId"] = modelId;

            securityData["smaTradeable"] = account.smaTradeable;
            securityData["sma"] = account.sma;
            securityData["advisorId"] = account.advisorId;
            securityData["accountValue"] = account.accountValue;
            securityData["cashValuePostTrade"] = account.cashValuePostTrade;
            securityData["buyWashSetting"] = account.buyWashSetting;
            securityData["recentOrExistingBuy"] = account.recentOrExistingBuy;
            securityData["allowWashSalesId"] = account.allowWashSalesId;
            securityData["tradeOrderMessage"] = account.tradeOrderMessage;

            securityData["issues"] = issues;
            result.push(securityData);

            logger.debug("Final result for an account  (applyPreferencesForBuyTrade()) " + result);
            return next(null, result);
        });
    }, function (err, data) {
        // console.log("*************result**********" + util.inspect(result, false, null));
        return cb(null, result);
    });
    // }, this);
};

TradeToTargetService.prototype.allowShortTermGains = function (data, cb) {
    logger.info("Allow Short Tern Gains service called (allowShortTernGains())");

    // var STGQty = data[0].taxLotSetting[0].STGQty;
    // var allowShortTermGainsId = data[0].allowShortTermGainsId ? data[0].allowShortTermGainsId : null;
    var message = "Do not trade due to short term loss"
    var isValidTrades = data;
    var shortTermList = [];
    // console.log("*************isValidTrades****************" + util.inspect(isValidTrades));
    isValidTrades.forEach(function (isValidTrade) {
        //  var shortTermGains = false;
        var shortTermIssues = {};
        if (isValidTrade.isValid === true) {
            var STGQty = data[0].taxLotSetting[0].STGQty;
            if (isValidTrade.allowShortTermGainsId === 1 || isValidTrade.allowShortTermGainsId === null) {
                //No logic needed for Allow
                logger.info("allowShortTermGains for Allow (allowShortTermGains) ");
                //shortTermGains = true
                shortTermList.push(isValidTrade);
                //  cb(null, data)
            } else if (isValidTrade.allowShortTermGainsId === 2) {
                logger.info("allowShortTermGains for Full Position Disallow (allowShortTermGains) ");
                if (STGQty === null || STGQty === 0) {
                    logger.info("Go to the trade  (allowShortTermGains) ");
                    //shortTermGains = true;
                    shortTermList.push(isValidTrade);
                    // cb(null, data)
                } else {
                    // short term loss is happing
                    logger.info("Do not trade  due to short term loss is happing(allowShortTermGains) ");
                    // data[0].issues.push(message);
                    // data[0].isValid = shortTermGains
                    //  isValidTrade.issues.push(message);
                    isValidTrade.isValid = false;
                    shortTermIssues = {
                        "message": message,
                        "accountId": isValidTrade.accountId,
                        "securityId": isValidTrade.sellSecurityId
                    }
                    isValidTrade.issues.push(shortTermIssues);
                    shortTermList.push(isValidTrade);
                    // cb(null, data)
                }
            } else {
                logger.info("allowShortTermGains for TaxLot Disallow (allowShortTermGains) ");
                if (STGQty > isValidTrade.quantity) {
                    shortTermGains = true;
                    logger.info("Go to the trade  (allowShortTermGains) ");
                    shortTermList.push(isValidTrade);
                    // cb(null, data)
                } else {
                    // short term loss is happing
                    logger.info("Do not trade  due to short term loss is happing(allowShortTermGains) ");
                    isValidTrade.isValid = false;
                    shortTermIssues = {
                        "message": message,
                        "accountId": isValidTrade.accountId,
                        "securityId": isValidTrade.sellSecurityId
                    }
                    isValidTrade.issues.push(shortTermIssues);
                    shortTermList.push(isValidTrade);
                    //isValidTrade.issues.push(message);
                }
            }
        } else {
            shortTermList.push(isValidTrade);
            // directPreferences.push(isValidTrade);
        }
        // isValidTrade.issues.push(message);
        //isValidTrade.isValid = shortTermGains
    }, this);

    cb(null, shortTermList)
};

TradeToTargetService.prototype.allowShortTermGainsOld = function (data, cb) {
    logger.info("Allow Short Tern Gains service called (allowShortTernGains())");
    var STGQty = data[0].taxLotSetting[0].STGQty;
    var allowShortTermGainsId = data[0].allowShortTermGainsId ? data[0].allowShortTermGainsId : null;
    var message = "Do not trade due to short term loss"
    var shortTermGains = false;
    if (allowShortTermGainsId === 1 || allowShortTermGainsId === null) {
        //No logic needed for Allow
        logger.info("allowShortTermGains for Allow (allowShortTermGains) ");
        shortTermGains = true
        cb(null, data)
    } else if (allowShortTermGainsId === 2) {
        logger.info("allowShortTermGains for Full Position Disallow (allowShortTermGains) ");
        if (data.STGQty === null || data.STGQty === 0) {
            logger.info("Go to the trade  (allowShortTermGains) ");
            shortTermGains = true;
            cb(null, data)
        } else {
            // short term loss is happing
            logger.info("Do not trade  due to short term loss is happing(allowShortTermGains) ");
            data[0].issues.push(message);
            data[0].isValid = shortTermGains
            cb(null, data)
        }
    } else if (allowShortTermGainsId === 3) {
        logger.info("allowShortTermGains for TaxLot Disallow (allowShortTermGains) ");
        if (data.STGQty > data.quantity) {
            shortTermGains = true;
            logger.info("Go to the trade  (allowShortTermGains) ");
            cb(null, data)
        } else {
            // short term loss is happing
            logger.info("Do not trade  due to short term loss is happing(allowShortTermGains) ");

            data[0].issues.push(message);
            data[0].isValid = shortTermGains
            cb(null, data)
        }
    };
};

TradeToTargetService.prototype.allowWashSales = function (data, cb) {

    logger.info("Allow Wash Sales service called (allowWashSales())");
    // var allowWashSalesId = data[0].allowWashSalesId ? data[0].allowWashSalesId : null;
    // var buyWashCount = data[0].buyWashSetting[0].butWashCount;
    // var recentBuy = data[0].recentOrExistingBuy[0].recentBuy;
    //  var existingBuy = data[0].recentOrExistingBuy[0].existingBuy;
    var message = "Do not trade due to wash sale";
    var allowWashSales = false;
    var isValidTrades = data;
    // console.log("**********data************" + util.inspect(data, false, null));
    var allowWashList = [];
    isValidTrades.forEach(function (isValidTrade) {
        var allowWashSalesIssues = {};
        if (isValidTrade.isValid === true) {
            var buyWashCount = isValidTrade.buyWashSetting[0].butWashCount;
            var recentBuy = isValidTrade.recentOrExistingBuy[0].recentBuy;
            var existingBuy = isValidTrade.recentOrExistingBuy[0].existingBuy;
            if (isValidTrade.allowWashSalesId === 1 || isValidTrade.allowWashSalesId === true || isValidTrade.allowWashSalesId === null) {
                logger.info("allowWashSales for Allow (allowShortTermGains) ");
                allowWashSales = true
                allowWashList.push(isValidTrade);
                // cb(null, data)
            } else {
                if (isValidTrade && isValidTrade.side && isValidTrade.side === 1) {
                    logger.info("allowWashSales for Buy (allowShortTermGains) ");

                    if (buyWashCount === 0 || buyWashCount === null) {
                        allowWashSales = true
                        allowWashList.push(isValidTrade);

                        // cb(null, data)
                    } else {
                        // data[0].issues.push(message);
                        // data[0].isValid = allowWashSales
                        // cb(null, data)
                        isValidTrade.isValid = false;
                        allowWashSalesIssues = {
                            "message": message,
                            "accountId": isValidTrade.accountId,
                            "securityId": isValidTrade.buySecurityId
                        }
                        isValidTrade.issues.push(allowWashSalesIssues);
                        allowWashList.push(isValidTrade);
                        // allowWashSales = false;
                    }
                } else {
                    logger.info("allowWashSales for Sell (allowShortTermGains) ");
                    if (recentBuy === 0 || recentBuy === null || existingBuy === 0 || existingBuy === null) {
                        allowWashSales = true
                        allowWashList.push(isValidTrade);
                        // cb(null, data)
                    } else {
                        // data[0].issues.push(message);
                        // data[0].isValid = allowWashSales
                        // cb(null, data)
                        // isValidTrade.issues.push(message);
                        // allowWashSales = false;
                        isValidTrade.isValid = false;
                        allowWashSalesIssues = {
                            "message": message,
                            "accountId": isValidTrade.accountId,
                            "securityId": isValidTrade.sellSecurityId
                        }
                        isValidTrade.issues.push(allowWashSalesIssues);
                        allowWashList.push(isValidTrade);
                    }
                }
            }
            // isValidTrade.issues.push(message);
        } else {
            //  isValidTrade.isValid = allowWashSales
            allowWashList.push(isValidTrade);
        }

    }, this);
    cb(null, allowWashList)
};

TradeToTargetService.prototype.allowWashSalesOld = function (data, cb) {

    logger.info("Allow Wash Sales service called (allowWashSales())");
    var allowWashSalesId = data[0].allowWashSalesId ? data[0].allowWashSalesId : null;
    var buyWashCount = data[0].buyWashSetting[0].butWashCount;
    var recentBuy = data[0].recentOrExistingBuy[0].recentBuy;
    var existingBuy = data[0].recentOrExistingBuy[0].existingBuy;
    var message = "Do not trade due to wash sale";
    var allowWashSales = false;

    if (allowWashSalesId === 1 || allowWashSalesId === true) {
        logger.info("allowWashSales for Allow (allowShortTermGains) ");
        cb(null, data)
    } else {
        if (data[0] && data[0].side && data[0].side === 1) {
            logger.info("allowWashSales for Buy (allowShortTermGains) ");

            if (buyWashCount === 0 || buyWashCount === null) {
                cb(null, data)
            } else {
                data[0].issues.push(message);
                data[0].isValid = allowWashSales
                cb(null, data)
            }
        } else {
            logger.info("allowWashSales for Sell (allowShortTermGains) ");
            if (recentBuy === 0 || recentBuy === null || existingBuy === 0 || existingBuy === null) {
                cb(null, data)
            } else {
                data[0].issues.push(message);
                data[0].isValid = allowWashSales
                cb(null, data)
            }
        }
    }
};

TradeToTargetService.prototype.generateTradeOld = function (data, cb) {
    logger.info("Generate Trade service called (generateTrade())");
    // var result = {
    //     "instanceId": 100
    // };
    var self = this;

    self.validateTrade(data, function (err, status, isValidTrade) {
        if (err) {
            logger.error("Error in validate trade  (generateTrade())" + err);
            return cb(err, status, message);
        }
        if (isValidTrade.isValid) {
            logger.info("Account & Security info return successfully (generateTrade())");
            data.isValidTrade = isValidTrade;
            self.tradePreferences(data, function (err, preferences) {
                if (err) {
                    logger.error("Error in validate trade  (generateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                } else {
                    globalTradeConverter.sellAndBuyTradeListResponse(preferences, function (err, result, inValid) {
                        if (err) {
                            logger.error("Error in sell And Buy Trade List Response  (generateTrade())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        // if (result && result.length > 0) {
                        //     var trade = {
                        //         "tradingAppId": 6,
                        //         //  "notes": data.notes
                        //     }
                        //     data.tradeInstance = trade;
                        //     data.trades = result;
                        //     commonService.generateTrade(data, function (err, status, fetched) {
                        //         if (err) {
                        //             logger.error("Error in Generating Trade (generateTrade())" + err);
                        //             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        //         }
                        //         if (status && status === "CREATED") {
                        //             logger.info(" Trade generated successfully (generateTrade())");
                        //             return cb(null, responseCode.CREATED, fetched);
                        //         } else {
                        //             logger.debug("Unable to generate trade-to target(generateTrade())");
                        //             return cb(fetched, status);
                        //         }
                        //     });
                        // } else {
                        //     logger.info("Empty sell And Buy Trade List Response  (generateTrade())");
                        //     return cb(null, responseCode.UNPROCESSABLE, inValid);
                        // }
                    });
                    //  logger.info("Trade Preferences check successfully  (generateTrade())");
                    //  return cb(null, responseCode.CREATED, preferences);
                }
            })
        }
        else {
            logger.debug("Account & Security info not return (generateTrade())");
            return cb(null, responseCode.UNPROCESSABLE, isValidTrade);
        }
    })
};

module.exports = TradeToTargetService;

