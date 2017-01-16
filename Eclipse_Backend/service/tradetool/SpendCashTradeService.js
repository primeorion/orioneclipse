var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var _ = require('lodash');
var util = require('util');

var messages = config.messages;
orionConstants = config.orionConstants;
var responseCode = config.responseCode;
var responseCodes = config.responseCodes;
var request = require('request');
var emphasiedMethodId = config.orionConstants.spendCash.emphasiedMethodId;
var sleevePortfolio = config.orionConstants.sleevePortfolio;
var accountType = config.orionConstants.accounts;
var helper = require("helper");
var rebalanceUrl = config.env.prop.rebalanceUrl;
var generateTradeInstanceId = config.env.prop.generateTradeInstanceId;
var constants = config.applicationEnum;
var cashNeedTradeService = require('service/tradetool/CashNeedTradeService.js');
var TradeInstanceDao = require('dao/tradeorder/TradeInstanceDao.js');
var SpendCashTradeDao = require('dao/tradetool/SpendCashTradeDao.js');
var RebalancerDao = require('dao/rebalancer/RebalancerDao.js');
var PortfolioService = require('service/portfolio/PortfolioService.js');
var spendCashTradeDao = new SpendCashTradeDao();
var cbCaller = helper.cbCaller;
var constants = config.applicationEnum;
var portfolioService = new PortfolioService();
var rebalancerDao = new RebalancerDao();
var tradeInstanceDao = new TradeInstanceDao();

var SpendCashTradeService = function () {};
SpendCashTradeService.prototype.getCalculationMethods = function (data, cb) {
    logger.info("spendCash Get calculation methods service called (getCalculationMethods())");
    var methodsList;
    var selectedMethodId;
    var list = [];

    spendCashTradeDao.getSelectedMethodId(data, function (err, resp) {
        if (err) {
            logger.error("Error while getting selectedMethodId (selectedMethodId()) " + error);
            return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
        }
        selectedMethodId = resp[0][0].optionId;
    });

    spendCashTradeDao.getMethodsList(data, function (error, response) {
        if (error) {
            logger.error("Error while getting Methods list (getMethodsList()) " + error);
            return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
        }

        var resp = response[0];
        var x;
        var defaultMethod = {
            "id": selectedMethodId,
            "name": "Use Default (Selected by Default)"
        }
        list.push(defaultMethod);
        for (x in resp) {
            var details = {
                "id": response[0][x].optionId,
                "name": response[0][x].optionName
            }
            list.push(details);
        }
        methodsList = {
            "methods": list,
            "selectedMethodId": selectedMethodId
        }

        return cb(null, responseCode.SUCCESS, methodsList);
    });

}

SpendCashTradeService.prototype.spendCashRebalance = function (data, cb) {
    logger.info("spendCash Rebalance Service Called (spendCashRebalance())");
    var self = this;
    var portfolioIds = [],
        portfolioDetails = [],
        accountDetails = [],
        accounts = [],
        accountIds = [],
        modelDetails = [],
        errResponseArray = [];
    var description, jsonBody, spendCash = {};
    var x, y;

    self.getMethodName(data.spendCash.selectedMethodId, data, function (error, response) {
        if (error) {
            logger.error("Error while getting Methods list (spendCashRebalance()) " + error);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        data.spendCash.method = response.name;

        self.generateInstanceId(data, function (error, instanceId) {
            if (error) {
                logger.error("Error while getting instance id (spendCashRebalance()) " + error);
                return cb(error, responseCode.INTERNAL_SERVER_ERROR);
            }
            // instance id generated and added to data as
            // data.tradeInstanceId
            data.spendCash.description = data.spendCash.reason;

            self.generateFinalJson(data, function (error, generatedJson) {
                if (error) {
                    logger.error("Error while generating json/preparing Rebal call (spendCashRebalance()) " + error);
                   
                    return cb(error, responseCode.INTERNAL_SERVER_ERROR);
//                    return cb(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null);
                }

                logger.debug("Success Trade generated : \n\n" + JSON.stringify(generatedJson));
                

	   if (data.spendCash.filterType == sleevePortfolio || (data.spendCash.filterType == accountType && data.spendCash.selectedMethodId != emphasiedMethodId)) {
					var sourcelength = null;
					
					if (data.spendCash.filterType == sleevePortfolio){
						sourcelength = data.spendCash.sleevedPortfolios.length;
					} 
					
					if(data.spendCash.filterType == accountType){
						sourcelength = data.spendCash.accounts.length;
					}
					
					var failedPorfoliosLength = generatedJson.issues.length;
					if (sourcelength == failedPorfoliosLength) {
						data.tradesInstance.instanceId = data.tradeInstanceId;
						tradeInstanceDao.deleteTradeInstance(data, function(error, response) {
							if (error) {
								logger.error("Error while deleting un-used traind instance (cashNeedsRebalance()) " + error);
							}

							generatedJson.instanceId = null;
							return cb(null, responseCode.SUCCESS, generatedJson);
						});
					} else {
						return cb(null, responseCode.SUCCESS, generatedJson);
					}
				} else {
					return cb(null, responseCodes.SUCCESS, generatedJson);
				}
                
                
             
            });
        });

    });
}

SpendCashTradeService.prototype.getMethodName = function (methodId, data, cb) {

    spendCashTradeDao.getMethodsList(data, function (error, response) {
        if (error) {
            logger.error("Error while getting Methods list (getMethodsList()) " + error);
            return cb(error, responseCode.INTERNAL_SERVER_ERROR);
        }

        var resp = response[0];
        var x;
        var methodName = {
            "id": data.spendCash.selectedMethodId,
            "name": null
        }
        for (x in resp) {
            if (resp[x].optionId == data.spendCash.selectedMethodId)
                methodName.name = resp[x].optionName;
        }

        return cb(null, methodName);
    });
}

SpendCashTradeService.prototype.generateInstanceId = function (data, cb) {

    data.tradesInstance = {};

    data.tradesInstance.tradingAppId = orionConstants.tradeAppIds.spendCash;
    data.tradesInstance.notes = "";
    data.tradesInstance.description = data.spendCash.description;
    var tradeResponse, responseArray = [];

    var tradeInstanceIdURL = "http://" + data.hostname + "" + generateTradeInstanceId
    request({
        url: tradeInstanceIdURL,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': data.authKey
        },
        json: {
            "appId": data.tradesInstance.tradingAppId,
            "reason": data.tradesInstance.description
        }
    }, function (error, response, body) {
        if (error) {
            logger.error("Error while generating trade instance (spendCashRebalance()) " + error);
            return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
        } else {
            logger.info("Generate Instance Id request response : " + body);
            
            if(body.tradeInstanceId == null || body.tradeInstanceId == undefined){
            	   logger.error("not able to generate  generating trade instance (spendCashRebalance()) " + error);
                   return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
            }
            
            data.tradeInstanceId = body.tradeInstanceId;
            return cb(null, data.tradeInstanceId);
        }
    });
}

SpendCashTradeService.prototype.generateFinalJson = function (data, cb) {
    var self = this;
    var spendCash = {};
    var RebalJsonList = [];

    if (data.spendCash.selectedMethodId == emphasiedMethodId) {

        self.prepareWithEmphasisJson(data, function (error, reballist) {
            if (error) {
                logger.error("Error while getting portfolio for account (generateFinalJson()) " + error);
                return cb(error, responseCode.INTERNAL_SERVER_ERROR);
            }

            self.executeTradeGenerationService(data, reballist, function (error, rebalResponse) {
                if (error) {
                    logger.error("Error while generating trde to rebal (generateFinalJson()) " + error);
                    return cb(error, responseCode.INTERNAL_SERVER_ERROR);
                }

                return cb(null, {
                    "instanceId": data.tradeInstanceId,
                    "issues": rebalResponse
                })
            });
        });
    } else if (data.spendCash.filterType == sleevePortfolio) {
        self.prepareSleevePortfolioJson(data, function (error, sleevePortfolioRbalList) {
            if (error) {
                logger.error("Error while getting portfolio for account (generateFinalJson()) " + error);
                return cb(error, responseCode.INTERNAL_SERVER_ERROR);
            }

            self.executeTradeGenerationService(data, sleevePortfolioRbalList, function (error, rebalResponse) {
                if (error) {
                    logger.error("Error while generating trde to rebal (generateFinalJson()) " + error);
                    return cb(error, responseCode.INTERNAL_SERVER_ERROR);
                }

                return cb(null, {
                    "instanceId": data.tradeInstanceId,
                    "issues": rebalResponse
                })
            });
        });
    } else if (data.spendCash.filterType == accountType) {
        self.prepareAccountJson(data, function (error, accountRebalList) {
            if (error) {
                logger.error("Error while getting portfolio for account (generateFinalJson()) " + error);
                return cb(error, responseCode.INTERNAL_SERVER_ERROR);
            }

            self.executeTradeGenerationService(data, accountRebalList, function (error, rebalResponse) {
                if (error) {
                    logger.error("Error while generating trde to rebal (generateFinalJson()) " + error);
                    return cb(error, responseCode.INTERNAL_SERVER_ERROR);
                }

                return cb(null, {
                    "instanceId": data.tradeInstanceId,
                    "issues": rebalResponse
                })
            });
        });
    } else {
        logger.error("No data to generate trade.");
        return cb(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null);
    }
}

SpendCashTradeService.prototype.getAccountDetails = function (data, accountId, cb) {
    var self = this;
    var Obj = {
        "id": null,
        "type": null,
        "portfolioId": null
    }
    spendCashTradeDao.getAccountPortfolio(data, accountId, function (error, resp) {
        if (error) {
            logger.error("Error while getting portfolio for account (getAccountDetails()) " + error);
            return cb(error, responseCode.INTERNAL_SERVER_ERROR);
        }
        
        var resp = resp[0];
       
        if (resp == null || resp == undefined) {
            logger.error("Error while getting portfolio. No account exist");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
        
        Obj.id = accountId;
        Obj.portfolioId = resp.portfolioId;

        spendCashTradeDao.getAccountType(data, accountId, function (error, response) {

            if (error) {
                logger.error("Error while getting type for account (getAccountDetails()) " + error);
                return cb(error, responseCode.INTERNAL_SERVER_ERROR);
            }

            Obj.type = response[0].type;

            return cb(null, Obj);
        });
    });
}

SpendCashTradeService.prototype.prepareWithEmphasisJson = function (data, cb) {
    var self = this;
    var firmId = data.user.firmId;
    var emphasisGeneratedJson = {};
    var finalCallList = [];
    var masterFormat = {
        "portfolioId": null,
        "accountId": null,
        "type": null, // "NORMAL_ACCOUNT/SLEEVE_ACCOUNT",
        "amount": null,
        "modelDetailId": null,
        "tradeInstanceId": data.tradeInstanceId,
        "firmId": firmId,
        "method": data.spendCash.method, //'Buy Rebalance with Emphasis',
        "raiseOrSpendFullAmount": data.spendCash.spendFullAmount
    }

    var len = data.spendCash.emphasiedAccounts.length;
    for (var x = 0; x < data.spendCash.emphasiedAccounts.length; x++) {
        if (data.spendCash.emphasiedAccounts[x].id == "" || data.spendCash.emphasiedAccounts[x].id == null) {
            return cb(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null)
        }

        self.prepareForEachNode(data, data.spendCash.emphasiedAccounts[x], masterFormat, function (error, genratedList) {
            if (error) {
                logger.error("Error while getting account details (prepareWithEmphasisJson()) " + error);
                return cb(error, responseCode.INTERNAL_SERVER_ERROR);
            }
            finalCallList.push(genratedList);

            len--;

            if (len == 0) {
                logger.debug("Final Json Prepared for Rebal : " + JSON.stringify(finalCallList));
                cb(null, finalCallList);
            }
        });
    }
}

SpendCashTradeService.prototype.prepareForEachNode = function (data, srcEmphasisObj, jsonBody, cb) {
    var self = this;
    var emphasisObj = JSON.parse(JSON.stringify(jsonBody));
    var finalListEmpasis = [];
    self.getAccountDetails(data, srcEmphasisObj.id, function (error, accountResposne) {
        if (error) {
            logger.error("Error while getting account details (prepareForEachNode()) " + error);
            return cb(error, responseCode.INTERNAL_SERVER_ERROR);
        }
        emphasisObj.portfolioId = accountResposne.portfolioId;
        emphasisObj.accountId = accountResposne.id;
        emphasisObj.type = accountResposne.type;

        if (srcEmphasisObj.node.id != "" || srcEmphasisObj.node.id != null) {
            emphasisObj.modelDetailId = srcEmphasisObj.node.id;
            emphasisObj.amount = srcEmphasisObj.node.amount;
        }
        logger.debug("Prepared Rebal Json for node id : " + srcEmphasisObj.node.id + " \n" + JSON.stringify(emphasisObj));
        return cb(null, emphasisObj);

    });
}

SpendCashTradeService.prototype.prepareSleevePortfolioJson = function (data, cb) {
    var self = this;
    var firmId = data.user.firmId;
    var finalCallList = [];
    var masterFormat = {
        "portfolioId": null,
        "accountId": null,
        "type": 'SLEEVE_PORTFOLIO', // "NORMAL_ACCOUNT/SLEEVE_ACCOUNT",
        "amount": null,
        "modelDetailId": null,
        "tradeInstanceId": data.tradeInstanceId,
        "firmId": firmId,
        "method": data.spendCash.method, // 'Buy Rebalance with Emphasis',
        "raiseOrSpendFullAmount": data.spendCash.spendFullAmount
    }

    var len = data.spendCash.sleevedPortfolios.length;
    logger.debug("Portfolios length : " + len)
    for (var x = 0; x < data.spendCash.sleevedPortfolios.length; x++) {
        if (data.spendCash.sleevedPortfolios[x].id == "" || data.spendCash.sleevedPortfolios[x].id == null) {
            return cb(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null)
        }

        var perPortfolioObj = JSON.parse(JSON.stringify(masterFormat));

        perPortfolioObj.portfolioId = data.spendCash.sleevedPortfolios[x].id;
        perPortfolioObj.amount = data.spendCash.sleevedPortfolios[x].amount;

        logger.debug("Generated Single Json for Portfolio : \n" + JSON.stringify(perPortfolioObj));
        finalCallList.push(perPortfolioObj);

        len--;

        if (len == 0) {
            logger.debug("Final Json Prepared for Rebal : " + JSON.stringify(finalCallList));
            cb(null, finalCallList);
        }
    }
}

SpendCashTradeService.prototype.prepareAccountJson = function (data, cb) {
    var self = this;
    var firmId = data.user.firmId;
    var emphasisGeneratedJson = {};
    var finalCallList = [];
    var masterFormat = {
        "portfolioId": null,
        "accountId": null,
        "type": null, // "NORMAL_ACCOUNT/SLEEVE_ACCOUNT",
        "amount": null,
        "modelDetailId": null,
        "tradeInstanceId": data.tradeInstanceId,
        "firmId": firmId,
        "method": data.spendCash.method, // 'Buy Rebalance with Emphasis',
        "raiseOrSpendFullAmount": data.spendCash.spendFullAmount
    }

    var len = data.spendCash.accounts.length;
    
    
    var processItems = function(x){
    	   if( x < data.spendCash.accounts.length ) {
    	       var accountObjPerNode = JSON.parse(JSON.stringify(masterFormat));
    	         self.prepareForEachAccount(data, data.spendCash.accounts[x], accountObjPerNode, function (error, accountRebalObj) {
    	             if (error) {
    	                 logger.error("Error while getting account details (prepareForEachNode()) " + error);
    	                
    	                 return cb(error, responseCode.INTERNAL_SERVER_ERROR);
    	             }
    	 
    	             finalCallList.push(accountRebalObj);
    	 
    	             len--;
    	 
    	             if (len == 0) {
    	                 logger.debug("Final Json Prepared for Rebal : " + JSON.stringify(finalCallList));
    	                 cb(null, finalCallList);
    	             }
    	             processItems(x+1);
    	 
    	         });
    	   }
    	};
    processItems(0);
    
//    for (var x = 0; x < data.spendCash.accounts.length; x++) {
//        if (data.spendCash.accounts[x].id == "" || data.spendCash.accounts[x].id == null) {
//            return cb(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null)
//        }
//
//        var accountObjPerNode = JSON.parse(JSON.stringify(masterFormat));
//        self.prepareForEachAccount(data, data.spendCash.accounts[x], accountObjPerNode, function (error, accountRebalObj) {
//            if (error) {
//                logger.error("Error while getting account details (prepareForEachNode()) " + error);
//                x=data.spendCash.accounts.length;
//                return cb(error, responseCode.INTERNAL_SERVER_ERROR);
//            }
//
//            finalCallList.push(accountRebalObj);
//
//            len--;
//
//            if (len == 0) {
//                logger.debug("Final Json Prepared for Rebal : " + JSON.stringify(finalCallList));
//                cb(null, finalCallList);
//            }
//
//        });
//    }
}

SpendCashTradeService.prototype.prepareForEachAccount = function (data, accountObj, jsonBody, cb) {
    var self = this;
    var finalListEmpasis = [];
    self.getAccountDetails(data, accountObj.id, function (error, accountResposne) {
        if (error) {
            logger.error("Error while getting account details (prepareForEachNode()) " + error);
            return cb(error, responseCode.INTERNAL_SERVER_ERROR);
        }
        jsonBody.portfolioId = accountResposne.portfolioId;
        jsonBody.accountId = accountResposne.id;
        jsonBody.type = accountResposne.type;
        jsonBody.amount = accountObj.amount;

        logger.debug("Prepared Rebal Json for Account id : " + accountObj.id + " \n" + JSON.stringify(jsonBody));

        return cb(null, jsonBody);
    });
}

SpendCashTradeService.prototype.executeTradeGenerationService = function (data, rebalPostJsonList, cb) {
    var self = this;
    var firmId = data.user.firmId;
    var successList = [];
    var failList = [];


    var len = rebalPostJsonList.length;
    for (var x = 0; x < rebalPostJsonList.length; x++) {

        self.generateSpendCashTradeByRebalance(data, rebalPostJsonList[x], function (error, code, generateStatus) {
            if (error) {
                logger.error("Error while final call to trade service (executeTradeGenerationService()) " + error);
                //				return cb(error, responseCode.INTERNAL_SERVER_ERROR);
                failList.push(generateStatus);

            } else if (responseCodes.INTERNAL_SERVER_ERROR == code) {
                logger.error("Error while final call to trade service (executeTradeGenerationService()) " + error);
                //				return cb(error, responseCode.INTERNAL_SERVER_ERROR);
                failList.push(generateStatus);
            } else {
                successList.push(generateStatus)
            }

            len--;

            if (len == 0) {
                logger.debug("\n\nFinal Status for Rebal calls : \n Success-------------------->\n" + JSON.stringify(successList)+"\n\n Success-------------------->\n" + JSON.stringify(failList));
                cb(null, failList);
            }
        });
    }
}

SpendCashTradeService.prototype.generateSpendCashTradeByRebalance = function (data, jsonBody, cb) {
    var self = this;
    var firmId = jsonBody.firmId;
    logger.debug("Firm Id :" + firmId);

    var finalUrl = rebalanceUrl + "contributeCash"

    console.log("Currently generating tradr for POST BODY  ::\n**********\n" + JSON.stringify(jsonBody) + "\n********");

    request({
        url: finalUrl, // URL to hit
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: jsonBody
    }, function (error, response, body) {
        logger.debug("Rebal API Response ::: \n***Error**-> " + error + "\n***Response Code**-> " + JSON.stringify(response) + "\n***Body** : " +
            body);

        if (error) {
            logger.error("Error while rebalancing SpendCash " + error);
            return cb(error, responseCodes.INTERNAL_SERVER_ERROR, {
                "portfolioId": jsonBody.portfolioId,
                "message": "Unable to generate SpendCash Trade for portfolio"
            });
        }

        if (response.statusCode !== responseCodes.SUCCESS) {
            return cb(error, responseCodes.INTERNAL_SERVER_ERROR, {
                "portfolioId": jsonBody.portfolioId,
                "message": "Unable to generate SpendCash Trade for portfolio"
            });
        }

        logger.debug("\n\nTrade generated successfully\n Trade Response Body  :\n " + JSON.stringify(body) + "\n\n");
        
        cb(null, responseCodes.SUCCESS, {
            instanceId: data.tradeInstanceId,
            "message": "SpendCash Rebalance Trades generated successfully"
        });
    });

}


module.exports = SpendCashTradeService;