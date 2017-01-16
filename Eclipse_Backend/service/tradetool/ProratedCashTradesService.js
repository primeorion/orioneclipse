var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var responseCodes = config.responseCodes;
var request = require('request');
var rebalanceUrl = config.env.prop.rebalanceUrl;
var generateTradeInstanceId = config.env.prop.generateTradeInstanceId;
var util = require('util');
var ProratedCashTradesDao = require('dao/tradetool/ProratedCashTradesDao.js');
var TradeInstanceDao = require('dao/tradeorder/TradeInstanceDao.js');
var multer = require('multer');
var util = require('util');
var ModelParser = require('xlsx');
var fs = require('fs');
var _ = require('underscore');

var proratedCashTradesDao = new ProratedCashTradesDao();
var tradeInstanceDao = new TradeInstanceDao();
//var commonService = CommonService();

var ProratedCashTradesDao = function () { };

ProratedCashTradesDao.prototype.generateProrateCash = function (data, cb) {
	var self = this;
    logger.info("Prorated Cash Trade Service Called (generateProrateCash())");

    self.generateProrateCashTrade(data, function(err, responseJson){
    	if(err){
    		logger.error("Error while generating prorated Cash trades : "+err);
    		return cb(err, responseJson);
    	} else {
    		logger.debug("Prorated Cash Trade Response Generated Successfully : \n"+JSON.stringify(responseJson));
    		return cb(err, responseCode.SUCCESS, responseJson);
    	}
    });

};

ProratedCashTradesDao.prototype.generateDummyResponse = function(data, cb) {
	
	var responseJson = {
		    "type": data.prorateCash.requestType,
		    "instanceId" : data.tradeInstanceId,
		    "portfolios": null,
		    "models": null,
		    "groups": null,
		    "sleevePortfolios": null
	};
	
	logger.debug("------------------\n"+JSON.stringify(responseJson));
	logger.debug("------------------\n"+data.prorateCash.requestType);
	if(data.prorateCash.requestType == "Portfolio"){
		responseJson["portfolios"] = [{
	        "id": 1,
	        "name": "Smith & Company"
	    }, {
	        "id": 5,
	        "name": "James and Garry"
	    }];
	} else if(data.prorateCash.requestType == "Model") {
		responseJson.models = [{
	        "id": 1,
	        "name": "Temp Model XYZ",
	        "portfolios": [{
	            "id": 1,
	            "name": "Smith & Company"
	        }, {
	            "id": 5,
	            "name": "James and Garry"
	        }]
	    }, {
	        "id": 5,
	        "name": "Temp Model 123",
	        "portfolios": [{
	            "id": 1,
	            "name": "Smith & Company"
	        }]
	    }];
	} else if (data.prorateCash.requestType == "Group"){
		responseJson.groups = [{
	        "id": 12,
	        "name": "Portfolio Group 1",
	        "portfolios": [{
	            "id": 1,
	            "name": "Smith & Company"
	        }]
	    }, {
	        "id": 5,
	        "name": "Temp Model 123",
	        "portfolios": [{
	            "id": 1,
	            "name": "Smith & Company"
	        }]
	    }];
	} else if (data.prorateCash.requestType == "SleevePortfolio") {
		responseJson.portfolios = [{
	        "id": 1,
	        "name": "Smith & Company"
	    }, {
	        "id": 5,
	        "name": "James and Garry"
	    }];
		
		responseJson.sleevePortfolios = [{
	        "id": 12,
	        "name": "Sleeve Portfolio 1",
	        "accounts": [{
	            "id": 1,
	            "name": "Smith and Jessus Account",
	            "accountNo": 1234
	        }, {
	            "id": 1,
	            "name": "Smith & Company",
	            "accountNo": 132323
	        }]
	    }];
	} else {
		
	}
	
	return cb(null, responseJson);
}


ProratedCashTradesDao.prototype.generateProrateCashTrade = function(data, cb) {
var self = this;

data.tradesInstance = {};
// TODO - create converter to get tradeInstance object from data
data.tradesInstance.tradingAppId = 8;// generateProrateCashTrade App id from tradeApplication
data.tradesInstance.notes = "";
data.tradesInstance.description = 	data.prorateCash.description;


   var tradeInstanceIdURL = "http://"+data.hostname+""+generateTradeInstanceId
   
//   logger.info("******************************\nGenerateTrade API url is : "+tradeInstanceIdURL+"\n Session key is "+data.authKey+"\n************************");
 //Lets configure and request
 request({
     url: tradeInstanceIdURL, //URL to hit
     method: 'POST',
     headers: {
         'Content-Type': 'application/json',
     	  'Authorization': data.authKey
         },
    json: {
   	    "appId" : 8,
   	    "reason": data.tradesInstance.description
   	} //Set the body as a string
 }, function(error, response, body){
     if(error) {
   	  logger.error("Error while generating trade instance (generateProrateCashTrade()) " + error);
         return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
     } else {
   	  logger.info("Generate Instance Id request response : "+body);
         data.tradeInstanceId = body.tradeInstanceId;

       self.generateDummyResponse(data, function(err, responseData){
     	if(err){
     		 logger.error("Error in saving  trade instance (generateProrateCashTrade()) " + err);
              return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
     	} else {
     		 logger.info("Trade generated for CashNeeds. InstanceId is : "+data.tradeInstanceId+"");
     		 return cb(null, responseData);
     	}
     });
     }
 });
 
}

module.exports = ProratedCashTradesDao;

