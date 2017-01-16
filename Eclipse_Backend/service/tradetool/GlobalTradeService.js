var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var helper = require("helper");
var asyncFor = helper.asyncFor;

var config = require('config');
var enums = config.applicationEnum;

var messages = config.messages;
var responseCode = config.responseCode;
var request = require('request');
var util = require('util');
var GlobalTradeDao = require('dao/tradetool/GlobalTradeDao.js');
var UtilService = require('service/util/UtilService.js');

var multer = require('multer');
var util = require('util');
var ModelParser = require('xlsx');
var fs = require('fs');
var _ = require('underscore');
var cbCaller = helper.cbCaller;
var CommonService = require('service/tradeorder/CommonService.js');
var commonService = new CommonService();
var GlobalTradeConverter = require("converter/tradetool/GlobalTradeConverter.js");
var globalTradeConverter = new GlobalTradeConverter();
var utilService = new UtilService();
var globalTradeDao = new GlobalTradeDao();
var GlobalTradeService = function () { };

// GlobalTradeService.prototype.getSecurityCount = function(data, cb) {
//     logger.info("Get security count service called (getSecurityCount())");
//     globalTradeDao.getSecurityCount(data, function(err, count) {
//         if (err) {
//             logger.error("Error in getting security count (getSecurityCount())" + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         logger.info("Security count returned successfully (getSecurityCount())");
//         return cb(null, responseCode.SUCCESS, count);
//     });
// };

// GlobalTradeService.prototype.getSecurity = function(data, cb) {
//     logger.info("Get security service called (getSecurity())");
//     globalTradeDao.getSecurity(data, function(err, securityList) {
//         if (err) {
//             logger.error("Error in getting security  (getSecurity())" + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         logger.info("Security returned successfully (getSecurity())");
//         return cb(null, responseCode.SUCCESS, securityList);
//     });
// };

// GlobalTradeService.prototype.getSecurityList = function(data, cb) {
//     logger.info("Get security List service called (getSecurityList())");
//     var self = this;
//     self.getSecurity(data, function(err, status, securityIds) {
//         if (err) {
//             logger.error("Error in getting security Ids  (getSecurityList())" + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         console.log("************* " + util.inspect(securityIds));
//         if (securityIds.length > 0) {
//             data.securityIds = securityIds;
//             console.log("************* " + util.inspect(data));
//             globalTradeDao.getSecurityList(data, function(err, securityList) {
//                 if (err) {
//                     logger.error("Error in getting security List (getSecurityList())" + err);
//                     return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//                 }
//                 logger.info("Security returned successfully (getSecurityList())");
//                 return cb(null, responseCode.SUCCESS, securityList);
//             });
//         } else {
//             return cb(null, responseCode.SUCCESS, []);
//         }
//     });
// };

GlobalTradeService.prototype.generateTrade11111111 = function (data, cb) {
    logger.info("Generate Trade service called (generateTrade())");
    var self = this;
    var finalIssues = [];
    self.validateTrade(data, function (err, status, message) {
        if (err && !(status === "SUCCESS")) {
            logger.debug("Error in Validating  Account / Portfolio / Model / Sell security / Buy Security (generateTrade())" + err);
            return cb(err, status, message);
        }
        if (status && status === "SUCCESS") {
            var securities = data.security;
            var sellSecurityIds = _.pluck(securities, "sellSecurityId");
            data.sellSecurityIds = sellSecurityIds;
            self.getSecurityDetailListForAccounts(data, function (err, securityDetailList, message) {
                if (err) {
                    logger.debug("Error in getting security detail list for accounts (generateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (securityDetailList && securityDetailList.length > 0) {
                    data.securityDetailList = securityDetailList;
                    self.calculateSellSecurityPriceAndQtyForAccounts(data, function (err, calculation) {
                        if (err) {
                            logger.debug("Error in calculating sell security Price and Qty for accounts (generateTrade())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (calculation && calculation.length > 0) {
                            data.calculation = calculation;
                            self.applyPreferencesForSellTrade(data, function (err, sellTrade) {
                                if (err) {
                                    logger.debug("Error in applying preferences for trade (generateTrade())" + err);
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (sellTrade && sellTrade.length > 0) {
                                    globalTradeConverter.getIssuesAfterPreferencesSetting(sellTrade, function (err, sellTradeValid, sellTradeInValid) {
                                        data.preferences = sellTradeValid;
                                        var sellTradeError = {
                                            sellTradeError: sellTradeInValid
                                        }
                                        finalIssues.push(sellTradeError);
                                        if (sellTradeValid && sellTradeValid.length > 0) {
                                            self.applyPreferencesForBuyTrade(data, function (err, buyTrade) {
                                                if (err) {
                                                    logger.debug("Error in applying preferences for trade (generateTrade())" + err);
                                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                // console.log("*******buyTrade********" + util.inspect(buyTrade));
                                                if (buyTrade) {
                                                    globalTradeConverter.getIssuesAfterPreferencesSetting(buyTrade, function (err, buyTradeValid, buyTradeInValid) {
                                                        var buyTradeError = {
                                                            buyTradeError: buyTradeInValid
                                                        }
                                                        finalIssues.push(buyTradeError);
                                                        if (buyTradeValid && buyTradeValid.length > 0) {
                                                            data.buyTradeValid = buyTradeValid;
                                                            globalTradeDao.getBuySecurityPrice(data, function (err, securityPrice) {
                                                                if (err) {
                                                                    logger.error("Error in getting buy security price (generateTrade())" + err);
                                                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                                }
                                                                if (securityPrice && securityPrice.length > 0) {
                                                                    globalTradeConverter.getSecurityPriceResponse(buyTradeValid, securityPrice, function (err, securityPriceList) {
                                                                        if (err) {
                                                                            logger.error("Error in converting security price List (generateTrade())" + err);
                                                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                                        }
                                                                        globalTradeConverter.breakSellAndBuyTrade(securityPriceList, function (err, tradeList) {
                                                                            if (err) {
                                                                                logger.error("Error in breaking Sell And Buy Trade (generateTrade())" + err);
                                                                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                                            }
                                                                            if (tradeList && tradeList.length > 0) {
                                                                                var trade = {
                                                                                    "tradingAppId": 3,
                                                                                    "notes": data.notes
                                                                                }
                                                                                data.tradeInstance = trade;
                                                                                data.trades = tradeList;
                                                                                commonService.generateTrade(data, function (err, status, fetched) {
                                                                                    if (err) {
                                                                                        logger.error("Error in Generating Trade (generateTrade())" + err);
                                                                                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                                                    }
                                                                                    if (status && status === "CREATED") {
                                                                                        globalTradeConverter.instanceAndIssuesResponse(fetched, finalIssues, function (err, result) {
                                                                                            if (err) {
                                                                                                logger.error("Error in converting global-trade final result (generateTrade())" + err);
                                                                                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                                                            }
                                                                                            if (result) {
                                                                                                logger.info("Global-trade generated successfully (generateTrade())" + err);
                                                                                                return cb(null, status, result);
                                                                                            }
                                                                                        });
                                                                                    } else {
                                                                                        logger.debug("Unable to generate global-trade orders(generateTrade())");
                                                                                        return cb(fetched, status);
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                //   return cb(null, responseCode.SUCCESS, tradeList);
                                                                                return cb(messages.tradeList, responseCode.UNPROCESSABLE);
                                                                            }
                                                                        });
                                                                    });
                                                                } else {
                                                                    logger.debug(" Security Price List return empty (generateTrade())" + securityPrice);
                                                                    return cb(messages.calculationEmpty, responseCode.UNPROCESSABLE);
                                                                }
                                                            });
                                                        } else {
                                                            logger.debug(" Get issues After Buy Preferences Setting return successfully (generateTrade())" + finalIssues[0]);
                                                            return cb(null, responseCode.UNPROCESSABLE, finalIssues[0].sellTradeError[0]);
                                                        }
                                                    });
                                                } else {
                                                    //     return cb(null, responseCode.SUCCESS, buyTrade);                                                    
                                                    logger.debug("Preferences For BuyTrade return empty (generateTrade())" + buyTrade);
                                                    return cb(messages.calculationEmpty, responseCode.UNPROCESSABLE);
                                                }
                                            });
                                        } else {
                                            logger.debug(" Get issues After Sell Preferences Setting return successfully (generateTrade())" + finalIssues[0]);
                                            return cb(null, responseCode.UNPROCESSABLE, finalIssues[0].sellTradeError[0]);
                                        }
                                    });
                                } else {
                                    // return cb(null, responseCode.SUCCESS, sellTrade);
                                    logger.debug("Preferences For SellTrade return empty (generateTrade())" + calculation);
                                    return cb(messages.calculationEmpty, responseCode.UNPROCESSABLE);
                                }
                            });
                        } else {
                            logger.debug("Sell Security Price And Qty calculation return empty (generateTrade())" + calculation);
                            return cb(messages.calculationEmpty, responseCode.UNPROCESSABLE);
                        }
                    });
                } else {
                    logger.debug("Account / Portfolio / Model association does not exist(generateTrade())");
                    return cb(message, responseCode.NOT_FOUND);
                }
            });
        }
    });
};

GlobalTradeService.prototype.getSecurityDetailListForAccounts = function (data, cb) {
    logger.info("Get security detail list for accounts service called (getSecurityDetailListForAccounts())");
    var self = this;
    self.getAccountsForTrades(data, function (err, accountList, issuesList) {
        if (err) {
            logger.error("Error in getting  security detail list for accounts (getSecurityDetailListForAccounts()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (accountList && accountList.length > 0) {
            data.accountIds = accountList;
            globalTradeDao.getSecurityDetailListForAccounts(data, function (err, securityDetailList) {
                if (err) {
                    logger.error("Error in getting  security detail list for accounts (getSecurityDetailListForAccounts()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (securityDetailList) {
                    var securities = data.security;
                    var outPut = [];
                    var fetchedAccountIdsList = [];
                    var fetchedSecurityIdsList = [];
                    _.filter(securities, function (input) {
                        _.filter(securityDetailList, function (fetched) {
                            if (input.sellSecurityId == fetched.sellSecurityId) {
                                var finalOutPut = _.extend(fetched, input);
                                fetchedAccountIdsList.push(fetched.accountId);
                                fetchedSecurityIdsList.push(fetched.sellSecurityId);

                                outPut.push(finalOutPut);
                            }
                        });
                    });
                    fetchedAccountIdsList = _.uniq(fetchedAccountIdsList);
                    accountList = _.uniq(accountList);
                    var inValidAccountIds = _.difference(accountList, fetchedAccountIdsList);

                    logger.info("Security Detail return successfully for accounts (getAccountsForTrades()) " + outPut);
                    inValidAccountIds.forEach(function (accountId) {
                        var portfolioIssuesJson = {
                            "message": "No security Found ",
                            "accountId": accountId
                        };
                        issuesList.push(portfolioIssuesJson);
                    }, this);

                    fetchedSecurityIdsList = _.uniq(fetchedSecurityIdsList);

                    var inValidSecurityIds = _.difference(data.sellSecurityIds, fetchedSecurityIdsList);

                    inValidSecurityIds.forEach(function (sellSecurityId) {
                        var sellSecurityIssuesJson = {
                            "message": "Security does not exist with account ",
                            "sellSecurityId": sellSecurityId
                        };
                        issuesList.push(sellSecurityIssuesJson);
                    }, this);
                    return cb(null, outPut, issuesList);
                }
            });
        } else {
            logger.debug(" Account list empty (getAccountsForTrades()) ");
            return cb(null, null, issuesList);
        }
        //return cb(null, accountList, issuesList);
    })
};

GlobalTradeService.prototype.getAccountsForTrades = function (data, cb) {
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

GlobalTradeService.prototype.calculateSellSecurityPriceAndQtyForAccounts = function (data, cb) {
    logger.info("Calculate sell security Price and Qty for accounts service called (calculateSellSecurityPriceAndQtyForAccounts())");
    var securityDetailList = data.securityDetailList;
    var result = [];
    securityDetailList.forEach(function (securityDetail) {
        var securityData = {};
        var percent = securityDetail.percent;
        var quantity = securityDetail.quantity;
        var price = securityDetail.price;
        var totalSellQty = quantity * percent / 100;
        //    var targetQty = parseFloat(Math.round(totalqty* sourcepercent/ 100)).toFixed(2);
        var totalSellPrice = totalSellQty * price;
        // var totalSellPrice = parseFloat(Math.round(totalSellQty * price)).toFixed(2);
        securityData["accountId"] = securityDetail.accountId;
        securityData["sellSecurityId"] = securityDetail.sellSecurityId;
        securityData["price"] = securityDetail.price;
        securityData["quantity"] = securityDetail.quantity;
        securityData["buySecurityId"] = securityDetail.buySecurityId;
        securityData["percent"] = securityDetail.percent;
        securityData["totalSellQty"] = totalSellQty;
        securityData["totalSellPrice"] = totalSellPrice;
        securityData["custodianId"] = securityDetail.custodianId;
        securityData["portfolioId"] = securityDetail.portfolioId;
        securityData["positionId"] = securityDetail.positionId;
        securityData["sma"] = securityDetail.sma;
        securityData["advisorId"] = securityDetail.advisorId;
        securityData["smaTradeable"] = securityDetail.smaTradeable;
        securityData["sellSecurityTypeId"] = securityDetail.sellSecurityTypeId;

        result.push(securityData);
    }, this);
    logger.debug(" Calculate sell security price And Qty for Accounts (getAccountsForTrades()) " + result);
    return cb(null, result);
};

GlobalTradeService.prototype.applyPreferencesForSellTrade = function (data, cb) {
    logger.info("Apply preferences for trade service called (applyPreferencesForSellTrade())");
    var self = this;
    var calculation = data.calculation;
    var result = [];
    var issues = [];
    var counter = calculation.length;
    var cbfn = cbCaller(counter, function (err, data) {
        if (err) {
            logger.error("Error in cbCaller for applying preferences for trade (applyPreferencesForSellTrade()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, data);
    });
    calculation.forEach(function (account) {
        var accountId = account.accountId
        var actualSellPrice = null;
        var isValid = true;
        var issues = [];
        var sellSecurityTypeId = account.sellSecurityTypeId;
        var totalSellPrice = account.totalSellPrice;
        var quantity = account.quantity;
        var issuesData = {};
        var securityData = {};
        var modelId = null;
        var tradeMessage = [];
        var tradeOrderMessageFirst = {};
        globalTradeDao.applyPreferencesForTrade(data, accountId, function (err, fetched) {
            if (err) {
                logger.error("Error in applying preferences for trade (applyPreferencesForSellTrade()) " + err);
                return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched[0].tradeSetting && fetched[0].tradeSetting.length > 0) {
                logger.debug("Account preference exist  (applyPreferencesForSellTrade()) ");
                fetched[0].tradeSetting.forEach(function (preference) {
                    if (account.sellSecurityId === preference.securityId) {
                        modelId = preference.modelId ? preference.modelId : null;
                        if (preference.excludeHolding === 'true' || preference.excludeHolding === 1) {
                            tradeOrderMessageFirst.shortCode = orderMessageShortCodes.TRADE_BLOCKED_ASSET_SELL;
                            tradeOrderMessageFirst.arguments = null;
                            tradeMessage.push(tradeOrderMessageFirst);
                        }
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
                                    if (sellSecurityTypeId === 1) {
                                        logger.debug("sell securityTypeId is  MutualFunds (applyPreferencesForSellTrade()) ");

                                        roundingForMutualFunds = fetched[0].accountSetting[1].roundingforMutualFunds;
                                        if (roundingForMutualFunds === null) {
                                            roundingForMutualFunds = fetched[0].accountSetting[0].roundingforMutualFunds;
                                        }
                                        roundingForMutualFunds = parseInt(roundingForMutualFunds);
                                        if (roundingForMutualFunds !== 0) {
                                            logger.debug("Rounding For Mutual Funds Preferences Applied (applyPreferencesForSellTrade()) ");
                                            // quantity = utilService.roundOfValue(quantity, roundingForMutualFunds);
                                            //console.log("***********totalSellPrice*************" + util.inspect(totalSellPrice));
                                            totalSellPrice = utilService.roundOfValue(account.totalSellPrice, roundingForMutualFunds);
                                            //   console.log("***********totalSellPrice*****totalSellPrice********" + util.inspect(totalSellPrice));

                                            // var newTotalSellPrice = utilService.roundOfValue(3958.6008, 5);
                                        } else {
                                            logger.debug("Rounding For  Mutual Funds Preferences Value is NULL Or Zero(0) Found(applyPreferencesForSellTrade()) ");
                                        }
                                    } else if (sellSecurityTypeId === 5) {
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
                                if (transactionCostIncludedOrAddedToTrade === 'true') {
                                    actualSellPrice = (totalSellPrice + parseInt(preference.sellTransactionFee));
                                    logger.debug("Trade sell TransactionFee (applyPreferencesForSellTrade()) " + actualSellPrice);
                                } else {
                                    actualSellPrice = totalSellPrice;
                                }
                                logger.debug(" SellTradeMinAmtBySecurity  (applyPreferencesForSellTrade()) " + parseInt(preference.sellTradeMinAmtBySecurity));
                                if (actualSellPrice >= parseInt(preference.sellTradeMinAmtBySecurity)) {
                                    logger.debug("ActualSellPrice After sellTradeMinAmtBySecurity checked  (applyPreferencesForSellTrade()) " + actualSellPrice);
                                    if (actualSellPrice <= parseInt(preference.sellTradeMaxAmtBySecurity)) {
                                        actualSellPrice = actualSellPrice;
                                        logger.debug("ActualSellPrice After sellTradeMaxAmtBySecurity checked  (applyPreferencesForSellTrade()) " + actualSellPrice);
                                    } else {
                                        //actualSellPrice = parseInt(preference.sellTradeMaxAmtBySecurity);
                                        isValid = false;
                                        issuesData = {
                                            "accountId": account.accountId,
                                            "securityId": account.sellSecurityId,
                                            "message": "Sell price is more then to max amount from the Preferences "
                                        }
                                        issues.push(issuesData);
                                        logger.debug("ActualSellPrice is more then sellTradeMaxAmtBySecurity  (applyPreferencesForSellTrade()) " + issues);
                                    }
                                } else {
                                    isValid = false;
                                    issuesData = {
                                        "accountId": account.accountId,
                                        "securityId": account.sellSecurityId,
                                        "message": "Sell price is less then to min amount from the Preferences "
                                    }
                                    issues.push(issuesData);
                                    logger.debug("ActualSellPrice is more then sellTradeMinAmtBySecurity  (applyPreferencesForSellTrade()) " + issues);
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
            securityData["accountId"] = account.accountId;
            securityData["sellSecurityId"] = account.sellSecurityId;
            securityData["price"] = account.price;
            securityData["quantity"] = quantity;
            securityData["buySecurityId"] = account.buySecurityId;
            securityData["percent"] = account.percent;
            securityData["totalSellQty"] = account.totalSellQty;
            securityData["totalSellPrice"] = account.totalSellPrice;
            securityData["actualSellPrice"] = actualSellPrice;
            securityData["custodianId"] = account.custodianId;
            securityData["portfolioId"] = account.portfolioId;
            securityData["positionId"] = account.positionId;
            securityData["modelId"] = modelId;
            securityData["advisorId"] = account.advisorId;
            // securityData["tradeOrderMessage"] = tradeMessage;
            securityData["sellTradeOrderMessage"] = tradeMessage;

            securityData["sma"] = account.sma;
            securityData["smaTradeable"] = account.smaTradeable;

            securityData["isValid"] = isValid;
            securityData["issues"] = issues;
            result.push(securityData);

            logger.debug("Final result for an account  (applyPreferencesForSellTrade()) " + result);
            return cbfn(null, result);
        });
    }, this);
};

GlobalTradeService.prototype.applyPreferencesForBuyTrade = function (data, cb) {
    logger.info("Apply preferences for trade service called (applyPreferencesForBuyTrade())");
    var self = this;
    var preferences = data.preferences;
    var result = [];
    var issues = [];
    var counter = preferences.length;
    var cbfn = cbCaller(counter, function (err, data) {
        if (err) {
            logger.error("Error in cbCaller for applying preferences for trade (applyPreferencesForBuyTrade()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, data);
    });
    preferences.forEach(function (account) {
        var accountId = account.accountId
        var actualBuyPrice = account.totalSellPrice;
        var isValid = true;
        var securityData = {};
        var tradeMessage = [];
        var tradeOrderMessageFirst = {};
        globalTradeDao.applyPreferencesForTrade(data, accountId, function (err, fetched) {
            if (err) {
                logger.error("Error in applying preferences for trade (applyPreferencesForBuyTrade()) " + err);
                return cbfn(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched[0].tradeSetting && fetched[0].tradeSetting.length > 0) {
                logger.debug("Account preference exist  (applyPreferencesForBuyTrade()) ");
                fetched[0].tradeSetting.forEach(function (preference) {
                    if (account.buySecurityId === preference.securityId) {
                        if (preference.excludeHolding === 'true' || preference.excludeHolding === 1) {
                            tradeOrderMessageFirst.shortCode = orderMessageShortCodes.TRADE_BLOCKED_ASSET_SELL;
                            tradeOrderMessageFirst.arguments = null;
                            tradeMessage.push(tradeOrderMessageFirst);
                        }
                        if (parseInt(preference.buyTradeMinPctBySecurity) <= account.percent || parseInt(preference.buyTradeMinPctBySecurity) === 0) {
                            if (parseInt(preference.buyTradeMaxPctBySecurity) >= account.percent || parseInt(preference.buyTradeMaxPctBySecurity) === 0) {
                                var transactionCostIncludedOrAddedToTrade = null;

                                if (fetched[0].accountSetting) {
                                    if (fetched[0].accountSetting[1]) {
                                        transactionCostIncludedOrAddedToTrade = fetched[0].accountSetting[1].transactionCostIncludedOrAddedToTrade;
                                    } else {
                                        transactionCostIncludedOrAddedToTrade = fetched[0].accountSetting[0].transactionCostIncludedOrAddedToTrade;
                                    }
                                }
                                if (transactionCostIncludedOrAddedToTrade === 'true') {
                                    actualBuyPrice = (account.totalSellPrice + parseInt(preference.buyTransactionFee));
                                    logger.debug("Trade buy TransactionFee (applyPreferencesForBuyTrade()) " + actualBuyPrice);
                                } else {
                                    actualBuyPrice = account.totalSellPrice;
                                }
                                logger.debug(" BuyTradeMinAmtBySecurity  (applyPreferencesForBuyTrade()) " + parseInt(preference.buyTradeMinAmtBySecurity));
                                if (actualBuyPrice >= parseInt(preference.buyTradeMinAmtBySecurity)) {
                                    logger.debug("ActualBuyPrice After buyTradeMinAmtBySecurity checked  (applyPreferencesForBuyTrade()) " + actualBuyPrice);
                                    if (actualBuyPrice <= parseInt(preference.buyTradeMaxAmtBySecurity)) {
                                        actualBuyPrice = actualBuyPrice;
                                        logger.debug("ActualBuyPrice After buyTradeMaxAmtBySecurity checked  (applyPreferencesForBuyTrade()) " + actualBuyPrice);
                                    } else {
                                        // actualBuyPrice = parseInt(preference.buyTradeMaxAmtBySecurity);
                                        isValid = false;
                                        issuesData = {
                                            "accountId": account.accountId,
                                            "securityId": account.buySecurityId,
                                            "message": "Buy price is more then to the max amount trade preferences"
                                        }
                                        issues.push(issuesData);
                                        logger.debug("ActualBuyPrice is more then buyTradeMaxAmtBySecurity  (applyPreferencesForBuyTrade()) " + issues);
                                    }
                                } else {
                                    isValid = false;
                                    var issuesData = {
                                        "accountId": account.accountId,
                                        "securityId": account.buySecurityId,
                                        "message": "Buy price is less then to the min amount trade preferences"
                                    }
                                    issues.push(issuesData);
                                    logger.debug("ActualBuyPrice is more then buyTradeMinAmtBySecurity  (applyPreferencesForBuyTrade()) " + issues);
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
            securityData["accountId"] = account.accountId;
            securityData["sellSecurityId"] = account.sellSecurityId;
            securityData["price"] = account.price;
            securityData["quantity"] = account.quantity;
            securityData["buySecurityId"] = account.buySecurityId;
            securityData["percent"] = account.percent;
            securityData["totalSellQty"] = account.totalSellQty;
            securityData["totalSellPrice"] = account.totalSellPrice;
            securityData["actualSellPrice"] = account.actualSellPrice;
            securityData["actualBuyPrice"] = actualBuyPrice;
            securityData["custodianId"] = account.custodianId;
            securityData["portfolioId"] = account.portfolioId;
            securityData["positionId"] = account.positionId;
            securityData["modelId"] = account.modelId;
            securityData["advisorId"] = account.advisorId;

            securityData["sellTradeOrderMessage"] = account.sellTradeOrderMessage;
            securityData["butTradeOrderMessage"] = tradeMessage;


            securityData["sma"] = account.sma;
            securityData["smaTradeable"] = account.smaTradeable;

            securityData["isValid"] = isValid;
            securityData["issues"] = issues;
            result.push(securityData);

            logger.debug("Final result for an account  (applyPreferencesForBuyTrade()) " + result);
            return cbfn(null, result);
        });
    }, this);
};

GlobalTradeService.prototype.validateTrade = function (data, cb) {
    logger.info("Validate Trade service called (validateTrade())");
    var self = this;

    self.validateSecurityForTrade(data, function (err, status, validate) {
        if (err) {
            logger.error("Error in Validating  Security (validateTrade())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        // if (status) {
        //     self.validateSecurityPercentForTrade(data, function (err, securityList, issues) {
        //         if (err) {
        //             logger.error("Error in Validating security percent(validateTrade())" + err);
        //             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        //         }
        //         else {
        //             return cb(null, true, securityList, issues);
        //         }
        //     });
        // } else {
        return cb(null, status, validate);
        // }
    });
};

GlobalTradeService.prototype.validateSecurityForTrade = function (data, cb) {
    logger.info("Validate Security service called (validateSecurityForTrade())");
    var securities = data.security;
    var message = null;
    var status = true;
    securities.forEach(function (security) {
        if (security.percent > 100) {
            message = messages.cannotSellMoreThan;
            status = false;
        }
        else if (security.percent <= 0) {
            message = messages.tradePercentCanNotBeZero;
            status = false;
        }
        else if (security.sellSecurityId === security.buySecurityId) {
            message = messages.canNotSellSndBuySameSecurities;
            status = false;
        }
    }, this);
    logger.info("Validate Security for trade successfully (validateSecurityForTrade())");
    return cb(null, status, message);
};

GlobalTradeService.prototype.validateSecurityPercentForTrade = function (data, cb) {
    logger.info("Validate Security Percent service called (validateSecurityPercentForTrade())");
    var securities = data.security;
    var message = null;
    var status = true;
    var securityList = [];
    var finalSecurityList = [];
    var issuesList = [];
    var sellSecurityPercentSum;
    var buySecurityPercentSum;
    var sellSecurityIds = _.pluck(securities, "sellSecurityId");
    var buySecurityIds = _.pluck(securities, "buySecurityId");
    securities.forEach(function (sellSecurity) {
        sellSecurityPercentSum = _.pluck(_(securities).filter({ 'sellSecurityId': sellSecurity.sellSecurityId }), 'percent').reduce(function (sum, el) { return sum + el }, 0)
        if (sellSecurityPercentSum > 100) {
            var issues = {};
            issues.sellSecurityId = sellSecurity.sellSecurityId
            issues.message = "Due to more the 100 %"
            issuesList.push(issues);
        } else {
            securityList.push(sellSecurity);
        }
    }, this);
    securityList.forEach(function (buySecurity) {
        buySecurityPercentSum = _.pluck(_(securityList).filter({ 'buySecurityId': buySecurity.buySecurityId }), 'percent').reduce(function (sum, el) { return sum + el }, 0)
        if (buySecurityPercentSum > 100) {
            var issues = {};
            issues.buySecurityId = buySecurity.buySecurityId
            issues.message = "Due to more the 100 %"
            issuesList.push(issues);
        } else {
            finalSecurityList.push(buySecurity);
        }
    }, this);

    // console.log("*******finalSecurityList**********" + util.inspect(finalSecurityList));
    // console.log("*******issuesList**********" + util.inspect(issuesList));

    logger.info("Validate Security Percent For Trade successfully (validateSecurityPercentForTrade())");
    return cb(null, finalSecurityList, issuesList);
};


GlobalTradeService.prototype.validateSellSecurity = function (data, cb) {
    logger.info("Validate sell security service called (validateSellSecurity())");
    var securities = data.security;
    var sellSecurityIds = _.pluck(securities, "sellSecurityId");
    var message = null;
    var status = false;
    globalTradeDao.validateSellSecurity(data, sellSecurityIds, function (err, validateSellSecurityList) {
        if (err) {
            logger.error("Error in validate sell security (validateSellSecurity())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (validateSellSecurityList.length > 0) {
            sellSecurityIds = _.uniq(sellSecurityIds);
            var validSecurityIds = _.difference(sellSecurityIds, validateSellSecurityList);
            //  console.log("******validateSellSecurityList*******" + util.inspect(validateSellSecurityList));
            //  console.log("*******validSecurityIds******" + util.inspect(validSecurityIds));
            // if (validSecurityIds.length === 0) {
            //     logger.info("Sell SecurityIds Validate successfully (validateSellSecurity())");
            //     status = true
            //     return cb(null, status, null);
            // } else {
            //     logger.info("Sell SecurityIds Not Validate (validateSellSecurity())");
            //     message = messages.sellSecurityNotFound;
            //     return cb(null, status, message);
            // }
            //if (securityDetailList) {
            //   var securities = data.security;
            var valid = [];
            var inValid = [];
            validateSellSecurityList = _.uniq(validateSellSecurityList);

            _.filter(validateSellSecurityList, function (fetched) {
                _.filter(securities, function (input) {
                    //     console.log("*****fetched********" + util.inspect(fetched));
                    if (input.sellSecurityId === fetched) {
                        //     var finalOutPut = _.extend(fetched, input);
                        valid.push(input);
                        //          console.log("********valid******" + util.inspect(valid.length));
                    }
                });
            });
            var validSecurityIds = _.difference(securities, valid);
            _.uniq(standardsList, JSON.stringify)
            logger.info("Security Detail return successfully for accounts (validateSellSecurity()) " + valid);
            //   console.log("********valid******" + util.inspect(valid));
            //    console.log("********inValid******" + util.inspect(validSecurityIds));

            return cb(null, valid);
            // }
        }
        else {
            logger.info("Sell SecurityIds Not Validate (validateSellSecurity())");
            message = messages.sellSecurityNotFound;
            return cb(null, status, message);
        }
    });
};

GlobalTradeService.prototype.validateBuySecurity = function (data, cb) {
    logger.info("Validate buy security service called (validateBuySecurity())");
    var securities = data.security;
    var buySecurityIds = _.pluck(securities, "buySecurityId");
    var message = null;
    var status = false;
    globalTradeDao.validateBuySecurity(data, buySecurityIds, function (err, validateBuySecurity) {
        if (err) {
            logger.error("Error in validate sell security (validateBuySecurity())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (validateBuySecurity.length > 0) {
            buySecurityIds = _.uniq(buySecurityIds);
            var validSecurityIds = _.difference(buySecurityIds, validateBuySecurity);
            if (validSecurityIds.length === 0) {
                logger.info("Buy SecurityIds Validate successfully (validateBuySecurity())");
                status = true
                return cb(null, status, null);
            } else {
                logger.info("Buy SecurityIds Not Validate (validateBuySecurity())");
                message = messages.buySecurityNotFound;
                return cb(null, status, message);
            }
        }
        else {
            logger.info("Buy SecurityIds Not Validate (validateBuySecurity())");
            message = messages.buySecurityNotFound;
            return cb(null, status, message);
        }
    });
};

GlobalTradeService.prototype.validateAccountPortfolioModel = function (data, cb) {
    logger.info("Validate Account/Portfolio/Model service called (validateAccountPortfolioModel())");
    var message = null;
    var status = false;
    if (data.accountIds && data.accountIds.length > 0) {
        var accountIds = data.accountIds;
        globalTradeDao.validateAccount(data, function (err, validateAccount) {
            if (err) {
                logger.error("Error in validate account (validateAccount())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (validateAccount.length > 0) {
                accountIds = _.uniq(accountIds);
                var validAccountIds = _.difference(accountIds, validateAccount);
                if (validAccountIds.length === 0) {
                    logger.info("Account Validate successfully (validateAccount())");
                    status = true
                    return cb(null, status, null);
                } else {
                    logger.info("Account does Not exist (validateAccount())");
                    message = messages.accountNotFound;
                    return cb(null, status, message);
                }
            }
            else {
                logger.info("Account does Not exist (validateAccount())");
                message = messages.accountNotFound;
                return cb(null, status, message);
            }
        });
    } else {
        if (data.portfolioIds && data.portfolioIds.length > 0) {
            var portfolioIds = data.portfolioIds;
            globalTradeDao.validatePortfolio(data, function (err, validatePortfolio) {
                if (err) {
                    logger.error("Error in validate account (validatePortfolio())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (validatePortfolio.length > 0) {
                    portfolioIds = _.uniq(portfolioIds);
                    var validatePortfolios = _.difference(portfolioIds, validatePortfolio);
                    if (validatePortfolios.length === 0) {
                        logger.info("Portfolio Validate successfully (validatePortfolio())");
                        status = true
                        return cb(null, status, null);
                    } else {
                        logger.info("Portfolio does Not exist (validatePortfolio())");
                        message = messages.portfolioNotFound;
                        return cb(null, status, message);
                    }
                }
                else {
                    logger.info("Portfolio does Not exist (validatePortfolio())");
                    message = messages.portfolioNotFound;
                    return cb(null, status, message);
                }
            });
        } else {
            if (data.modelIds && data.modelIds.length > 0) {
                var modelIds = data.modelIds;
                globalTradeDao.validateModel(data, function (err, validateModel) {
                    if (err) {
                        logger.error("Error in validate account (validateModel())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (validateModel.length > 0) {
                        modelIds = _.uniq(modelIds);
                        var validateModels = _.difference(modelIds, validateModel);
                        if (validateModels.length === 0) {
                            logger.info("Model Validate successfully (validateModel())");
                            status = true
                            return cb(null, status, null);
                        } else {
                            logger.info("Model does Not exist (validateModel())");
                            message = messages.modelNotFound;
                            return cb(null, status, message);
                        }
                    }
                    else {
                        logger.info("Model does Not exist (validatePortfolio())");
                        message = messages.modelNotFound;
                        return cb(null, status, message);
                    }
                });
            } else {
                logger.info("No Account / Portfolio /  Model Provide (validatePortfolio())");
                message = messages.NoTradeMethodProvide;
                return cb(null, status, message);
            }
        }
    }
};

GlobalTradeService.prototype.generateTrade = function (data, cb) {
    logger.info("Generate Trade service called (generateTrade())");
    var self = this;
    var finalIssues = [];
    self.validateTrade(data, function (err, status, message) {
        if (err) {
            logger.error("Error in getting security detail list for accounts (generateTrade())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (status) {
            self.validateSecurityPercentForTrade(data, function (err, securityList, issues) {
                if (err) {
                    logger.error("Error in Validating security percent(validateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }

                if (securityList && securityList.length > 0) {
                    data.security = securityList;
                    var securities = data.security;
                    var sellSecurityIds = _.pluck(securities, "sellSecurityId");
                    data.sellSecurityIds = sellSecurityIds;
                    self.getSecurityDetailListForAccounts(data, function (err, securityDetailList, issuesList) {
       //                 console.log("**********issuesList**************" + util.inspect(issuesList));
                        finalIssues = issuesList.length > 0 ? issuesList.concat(issues) : issues;
                        if (err) {
                            logger.error("Error in getting security detail list for accounts (generateTrade())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        //   return cb(null, responseCode.SUCCESS, securityDetailList);
                        if (securityDetailList && securityDetailList.length > 0) {

                            data.securityDetailList = securityDetailList;
                            self.calculateSellSecurityPriceAndQtyForAccounts(data, function (err, calculation) {
                                if (err) {
                                    logger.debug("Error in calculating sell security Price and Qty for accounts (generateTrade())" + err);
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (calculation && calculation.length > 0) {
                                    data.calculation = calculation;
                                    self.tradePreferences(data, function (err, preferencesStatus, tradeList, tradeIssues) {
                                        if (err) {
                                            logger.debug("Error in calculating sell security Price and Qty for accounts (generateTrade())" + err);
                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        if (preferencesStatus === 'SUCCESS' && tradeList && tradeList.length > 0) {
                                            var trade = {
                                                "tradingAppId": 3,
                                                "notes": data.notes
                                            }
                                            data.tradeInstance = trade;
                                            data.trades = tradeList;
                                            //     console.log("***********tradeList*****" + util.inspect(tradeList));

                                            commonService.generateTrade(data, function (err, status, fetched) {
                                                if (err) {
                                                    logger.error("Error in Generating Trade (generateTrade())" + err);
                                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                if (status && status === "CREATED") {
                                                    //       finalIssues = finalTrades.finalIssues
                                                    finalIssues = issuesList.length > 0 ? issuesList.concat(issues) : issues;
                                                    finalIssues = finalIssues.length > 0 ? finalIssues.concat(tradeIssues) : tradeIssues;
                                                    //  console.log("********************" + util.inspect(tradeIssues, false, null));
                                                    globalTradeConverter.instanceAndIssuesResponse(fetched, finalIssues, function (err, result) {
                                                        if (err) {
                                                            logger.error("Error in converting global-trade final result (generateTrade())" + err);
                                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                        }
                                                        if (result) {
                                                            logger.info("Global-trade generated successfully (generateTrade())" + err);
                                                            return cb(null, status, result);
                                                        }
                                                    });
                                                } else {
                                                    logger.debug("Unable to generate global-trade orders(generateTrade())");
                                                    return cb(fetched, status);
                                                }
                                            });
                                        } else {
                                            if (tradeIssues && tradeIssues.length > 0) {
                                                logger.debug("Some issues found (generateTrade())");
                                                finalIssues = finalIssues.length > 0 ? finalIssues.concat(tradeIssues) : tradeIssues;

                                                return cb(null, responseCode.UNPROCESSABLE, finalIssues);

                                            } else {
                                                return cb(tradeIssues, responseCode.UNPROCESSABLE);
                                            }
                                        }
                                    });
                                } else {
                                    logger.debug("Sell Security Price And Qty calculation return empty (generateTrade())" + calculation);
                                    return cb(messages.calculationEmpty, responseCode.UNPROCESSABLE);
                                }
                            });
                        } else {
                            logger.debug("Account / Portfolio / Model association does not exist(generateTrade())");
                            return cb(null, responseCode.UNPROCESSABLE, finalIssues);
                        }
                    });
                } else {
                    return cb(null, responseCode.UNPROCESSABLE, issues);
                }
            });
        } else {
            return cb(message, responseCode.UNPROCESSABLE);
        }
    });
};

GlobalTradeService.prototype.tradePreferences = function (data, cb) {
    logger.info("Trade Preferences service called (tradePreferences())");
    var self = this;
    var finalIssues = [];
    self.applyPreferencesForSellTrade(data, function (err, sellTrade) {
        if (err) {
            logger.debug("Error in applying preferences for trade (tradePreferences())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        //    console.log("********************sellTrade " + util.inspect(sellTrade));
        if (sellTrade && sellTrade.length > 0) {
            globalTradeConverter.getIssuesAfterPreferencesSetting(sellTrade, function (err, sellTradeValid, sellTradeInValid) {
                data.preferences = sellTradeValid;
                // var sellTradeError = {
                //     sellTradeError: sellTradeInValid
                // }
                // finalIssues.push(sellTradeError);
                //        console.log("***********sellTradeValid********* " + util.inspect(sellTradeValid));
                if (sellTradeValid && sellTradeValid.length > 0) {
                    self.applyPreferencesForBuyTrade(data, function (err, buyTrade) {
                        if (err) {
                            logger.debug("Error in applying preferences for trade (tradePreferences())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        //          console.log("***********buyTrade********* " + util.inspect(buyTrade));

                        if (buyTrade) {
                            globalTradeConverter.getIssuesAfterPreferencesSetting(buyTrade, function (err, buyTradeValid, buyTradeInValid) {
                                // var buyTradeError = {
                                //     buyTradeError: buyTradeInValid
                                // }
                                // finalIssues.push(buyTradeError);
                                finalIssues = sellTradeInValid.length > 0 ? sellTradeInValid.concat(buyTradeInValid) : buyTradeInValid;
                                if (buyTradeValid && buyTradeValid.length > 0) {
                                    data.buyTradeValid = buyTradeValid;
                                    //  data.finalIssues = finalIssues;
                                    //       console.log("***********buyTradeValid********* " + util.inspect(buyTradeValid));
                                    self.prepareTradeList(data, function (err, tradeList) {
                                        if (err) {
                                            logger.debug("Error in preparing TradeList (tradePreferences())" + err);
                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        if (tradeList && tradeList.length > 0) {
                                            logger.info("Prepare Trade List successfully (tradePreferences())");
                                            return cb(null, responseCode.SUCCESS, tradeList, finalIssues);
                                        } else {
                                            logger.info("Problem in preparing Trade List  (tradePreferences())");
                                            return cb(null, responseCode.UNPROCESSABLE, tradeList, finalIssues);
                                        }
                                    })
                                } else {
                                    logger.debug(" Get issues After Buy Preferences Setting return successfully (tradePreferences())" + finalIssues[0]);

                                    return cb(null, responseCode.UNPROCESSABLE, null, finalIssues);
                                }
                            });
                        } else {
                            //     return cb(null, responseCode.SUCCESS, buyTrade);                                                    
                            logger.debug("Preferences For BuyTrade return empty (tradePreferences())" + buyTrade);
                            return cb(null, responseCode.UNPROCESSABLE, null, messages.calculationEmpty);
                        }
                    });
                } else {
                    logger.debug(" Get issues After Sell Preferences Setting return successfully (tradePreferences())" + finalIssues[0]);
                    return cb(null, responseCode.UNPROCESSABLE, null, sellTradeInValid);
                }
            });
        } else {
            // return cb(null, responseCode.SUCCESS, sellTrade);
            logger.debug("Preferences For SellTrade return empty (tradePreferences())" + calculation);
            return cb(null, responseCode.UNPROCESSABLE, null, messages.calculationEmpty);
        }
    });
};

GlobalTradeService.prototype.prepareTradeList = function (data, cb) {
    logger.info("Prepare TradeList service called (prepareTradeList())");
    var self = this;
    globalTradeDao.getBuySecurityPrice(data, function (err, securityPrice) {
        if (err) {
            logger.error("Error in getting buy security price (prepareTradeList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (securityPrice && securityPrice.length > 0) {
            //   console.log("*******data.buyTradeValid*******" + util.inspect(data.buyTradeValid));
            // console.log("*******data.securityPrice*******" + util.inspect(securityPrice));

            globalTradeConverter.getSecurityPriceResponse(data.buyTradeValid, securityPrice, function (err, securityPriceList) {
                if (err) {
                    logger.error("Error in converting security price List (prepareTradeList())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                //   console.log("*******securityPriceList*******" + util.inspect(securityPriceList));

                globalTradeConverter.breakSellAndBuyTrade(securityPriceList, function (err, tradeList) {
                    if (err) {
                        logger.error("Error in breaking Sell And Buy Trade (prepareTradeList())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    //  console.log("*******tradeList*******" + util.inspect(tradeList));

                    if (tradeList && tradeList.length > 0) {
                        logger.info("Break Sell And Buy Trade successfully (prepareTradeList())");
                        //var finalDataForTrades = {}
                        //finalDataForTrades.finalIssues = data.finalIssues
                        // finalDataForTrades.tradeList = tradeList
                        // return cb(null, responseCode.SUCCESS, finalDataForTrades);
                        return cb(null, tradeList);

                    } else {
                        //   return cb(null, responseCode.SUCCESS, tradeList);
                        logger.debug("Problem in breakings sell & buy trade (prepareTradeList())");
                        return cb(null, responseCode.UNPROCESSABLE, tradeList);
                    }
                });
            });
        } else {
            logger.debug(" Security Price List return empty (prepareTradeList())" + securityPrice);
            return cb(null, responseCode.UNPROCESSABLE, messages.calculationEmpty);
        }
    });
};



GlobalTradeService.prototype.generateTradeOld = function (data, cb) {
    logger.info("Generate Trade service called (generateTrade())");
    var self = this;
    var finalIssues = [];
    self.validateTrade(data, function (err, status, message) {
        if (err && !(status === "SUCCESS")) {
            logger.debug("Error in Validating  Account / Portfolio / Model / Sell security / Buy Security (generateTrade())" + err);
            return cb(err, status, message);
        }
        if (status && status === "SUCCESS") {
            var securities = data.security;
            var sellSecurityIds = _.pluck(securities, "sellSecurityId");
            data.sellSecurityIds = sellSecurityIds;
            self.getSecurityDetailListForAccounts(data, function (err, securityDetailList, message) {
                if (err) {
                    logger.debug("Error in getting security detail list for accounts (generateTrade())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.debug("")
                if (securityDetailList && securityDetailList.length > 0) {
                    // var temp = {
                    //     "typeId": enums.TRADE_ORDER.TYPE.ACCOUNT,
                    //     "id": 1,
                    //     "actionId": 1,
                    //     "securityId": 14616,
                    //     "sendTradesImmediate": false,
                    //     "actionProperties": {
                    //         "typeId": 1,
                    //         "value": 15
                    //     }
                    // };
                    // data.trades= temp;
                    // data.typeId = enums.TRADE_ORDER.TYPE.ACCOUNT
                    // data.id = 1

                    // data.actionId = 2

                    // data.securityId = 14616

                    // {
                    // "typeId":1,
                    // "id":82289,
                    // "actionId":1,
                    // "securityId":14837,
                    // "sendTradesImmediate":1,
                    // "actionProperties":{
                    // "typeId":1,
                    // "value":4
                    // }
                    // }


                    // data.sendTradesImmediate = false

                    // var actionProperties = {
                    //     "actionProperties": {
                    //         "typeId": 1,
                    //         "value": 15
                    //     }
                    // }

                    data.typeId = 1
                    data.id = 1

                    data.actionId = 1

                    data.securityId = 14616
                    data.sendTradesImmediate = 1

                    var actionProperties = {
                        "actionProperties": {
                            "typeId": 1,
                            "value": 1
                        }
                    }
                    data.actionProperties = actionProperties

                    commonService.generateTradeOrder(data, function (err, status, result) {
                        //   console.log("*******************" + util.inspect(result))
                        if (err) {
                            logger.debug("Error in generate Trade Order (generateTrade())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        } else {
                            return cb(responseCode.SUCCESS, result);
                        }
                    })
                } else {
                    logger.debug("Account / Portfolio / Model association does not exist(generateTrade())");
                    return cb(message, responseCode.NOT_FOUND);
                }
            });
        }
    });
};

module.exports = GlobalTradeService;

