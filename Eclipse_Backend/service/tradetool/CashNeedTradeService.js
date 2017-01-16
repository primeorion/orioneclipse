var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var _ = require('lodash');
var util = require('util');
var orionConstants = config.orionConstants;
var messages = config.messages;
var responseCode = config.responseCode;
var responseCodes = config.responseCodes;
var request = require('request');
var rebalanceUrl = config.env.prop.rebalanceUrl;
var generateTradeInstanceId = config.env.prop.generateTradeInstanceId;
var util = require('util');
var CashNeedTradeDao = require('dao/tradetool/CashNeedTradeDao.js');
var TradeInstanceDao = require('dao/tradeorder/TradeInstanceDao.js');
var PortfolioService = require('service/portfolio/PortfolioService.js');

var helper = require("helper");
var RebalancerDao = require('dao/rebalancer/RebalancerDao.js');
var cashNeedTradeDao = new CashNeedTradeDao();
var tradeInstanceDao = new TradeInstanceDao();
var portfolioService = new PortfolioService();
//var commonService = CommonService();
var cbCaller = helper.cbCaller;
var constants = config.applicationEnum;

var CashNeedTradeService = function () {};
var rebalancerDao = new RebalancerDao();

CashNeedTradeService.prototype.cashNeedsRebalance = function (data, cb) {
    var self = this;
    logger.info("CashNeed Rebalance Service Called (cashNeedsRebalance())");
    console.log(data)

    if (data.cashNeeds.portfolioIds.length < 1) {
        logger.info("Nothing to generate trade.\nThere is no portfolios to generate trade.")
        return cb(null, responseCodes.BAD_REQUEST, {
           "message": "Please pass a valid list of portfolios to generate trades."
        });
    }

  data.tradesInstance = {};
  data.tradesInstance.tradingAppId = orionConstants.tradeAppIds.cashNeed; // CashNeeds App id from tradeApplication
  data.tradesInstance.notes = "";
  data.tradesInstance.description = data.cashNeeds.description;
    
        var tradeInstanceIdURL = "http://" + data.hostname + "" + generateTradeInstanceId
    
        request({
            url: tradeInstanceIdURL, //URL to hit
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
                logger.error("Error while generating trade instance (cashNeedsRebalance()) " + error);
                return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("Generate Instance Id request response : " + body);
                data.tradeInstanceId = body.tradeInstanceId;
    
                self.generateCashNeedsTrade2(data, function (error, responseCode, responseData) {
                    if (error) {
                        logger.error("Error in saving  trade instance (cashNeedsRebalance()) " + error);
                        return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
                    } else {
                        logger.info("Trade generated for CashNeeds. InstanceId is : " + data.tradeInstanceId + "");
                        var portfoliosLength = data.cashNeeds.portfolioIds.length;
                        var failedPorfoliosLength = responseData.issues.length;
                        if (portfoliosLength == failedPorfoliosLength) {
                            data.tradesInstance.instanceId = data.tradeInstanceId;
                            tradeInstanceDao.deleteTradeInstance(data, function (error, response) {
                                if (error) {
                                    logger.error("Error while deleting un-used traind instance (cashNeedsRebalance()) " + error);
                                }
    
                                responseData.instanceId = null;
                                return cb(null, responseCode.SUCCESS, responseData);
                            });
                        } else {
                            return cb(null, responseCode.SUCCESS, responseData);
                        }
                    }
                });
            }
        });
};

CashNeedTradeService.prototype.generateCashNeedsTrade2 = function (data, cb) {
    var self = this;
    var errromessages = [];

    data.ids = data.cashNeeds.portfolioIds;
    data.type = "portfolio";
    rebalancerDao.getPortfolioIdDetails(data)
    .then(function(portfolioDetail){
    	
        var portfolios = [];
        
        if(typeof portfolioDetail != 'string') {
        portfolioDetail.normal.forEach(function(portfolio){
        	var json = {
        			id : portfolio,
        			type : constants.portfolioType.NORMAL_PORTFOLIO
        	}
        	portfolios.push(json);
        })
        
        var slevedPortfolios = portfolioDetail.sleeved;
        slevedPortfolios = _.concat(slevedPortfolios, Object.keys(portfolioDetail.sleeved_account));
        
        slevedPortfolios.forEach(function(portfolio){
        	var json = {
        			id : portfolio,
        			type : constants.portfolioType.SLEEVE_PORTFOLIO
        	}
        	portfolios.push(json);
        })
        
        var tcb = cbCaller(2, function(error, rs){
            return cb(null, responseCode.SUCCESS, {
                "instanceId": data.tradeInstanceId,
                "issues": errromessages
            });
        })

        data.model_ids = portfolioDetail.models;

        rebalancerDao.modelSPRebalance(data)
        .then(function(response){
        	tcb(null, responseCodes.SUCCESS, response);
        }).error(function(error){
        	tcb(error, responseCodes.UNPROCESSABLE);
        })
        
        logger.debug(JSON.stringify(portfolios));

        } else {
        	var errorMsg = "Portfolios are not processed due to invalid data"
        	logger.error("Error in CashNeedTradeService.generateCashNeedsTrade2(). \n Error :" + portfolioDetail+"\n "+errorMsg);     
            return cb(errorMsg, responseCodes.UNPROCESSABLE); 
        }
        
        var len = portfolios.length;
        var length = len;
        console.log(portfolios);
        if(len == 0){
        	return tcb(null, responseCode.SUCCESS, {
                "instanceId": data.tradeInstanceId,
                "issues": [messages.portfolioNotFound]
            });
        }else{
        	var faultPortfolios = _.differenceWith(data.portfolioIds, portfolios, function(id, json){
        		if(id == json.id)
        			return true;
        		else return false;
        	});
        	faultPortfolios.forEach(function(id){
        		var json = {portfolioId : id, message : messages.portfolioNotFound}
        		errromessages.push(json);
        	})
        	console.log(faultPortfolios);
        }
        for (var i = 0; i < length; i++) {

            var portfolioId = portfolios[i].id;
            var portfolioType = portfolios[i].type;

            self.generateCashNeedTradeByRebalance(data, portfolioId, portfolioType, function (error, tradeResponse, failMsg) {
                if (error) {
                    logger.error("Error while generating trade for CashNeeds Rebalance (cashNeedsRebalance()).\n" + error);
                    if (failMsg)
                        errromessages.push(failMsg)
                }
                logger.info("Trade generated for CashNeeds. PortfolioId : " + data.cashNeeds.portfolioIds[(length - len)] + "");

                len--;
                if (len <= 0) {
                    return tcb(null, responseCode.SUCCESS, {
                        "instanceId": data.tradeInstanceId,
                        "issues": errromessages
                    });
                }
            });
        }
    }).catch(function(error) {                  
        logger.error("Error in CashNeedTradeService.generateCashNeedsTrade2(). \n Error :" + error);     
        return cb(error, responseCodes.UNPROCESSABLE);        
    });
}

CashNeedTradeService.prototype.generateCashNeedTradeByRebalance = function (data, portfolioId, portfolioType, cb) {
    var self = this;

    var firmId = data.user.firmId;
    logger.debug("Firm Id :"+firmId);

    var finalUrl = rebalanceUrl + "cashNeedRebalance";

    logger.debug("Trade Generation URL is  : " + finalUrl);

    request({
        url: finalUrl, //URL to hit
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: {
            "portfolioId": portfolioId,
            "type": portfolioType,
            "tradeInstanceId":  data.tradeInstanceId,
            "firmId": firmId
    }}, function (error, response, body) {
        if (error) {
            logger.error("Err while rebalancing cash needs " + error);
            return cb(error, responseCodes.INTERNAL_SERVER_ERROR, {
                "portfolioId": portfolioId,
                "message": "Unable to generate CashNeeds Trade for portfolio"
            });
        }

        if (response.statusCode !== responseCodes.SUCCESS) {
            logger.error("Err while rebalancing cash needs" + JSON.stringify(response));
            return cb(messages.rebalanceError, responseCodes.INTERNAL_SERVER_ERROR, {
                "portfolioId": portfolioId,
                "message": "Unable to generate CashNeeds Trade for portfolio"
            });
        }

        try {
            body = JSON.parse(body);
        } catch (e) {
            return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
        }

        logger.debug("\n\nTrade generated successfully Trade Response Body  :\n " + JSON.stringify(body) + "\n\n");

        cb(error, response.statusCode, {
            "message": "CashNeeds Rebalance Trades generated successfully",
        });
    });

}

module.exports = CashNeedTradeService;