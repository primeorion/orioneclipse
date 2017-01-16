"use strict";

var moduleName = __filename;

var config = require('config');
var helper = require("helper");
var logger = require('helper/Logger.js')(moduleName);
var localCache = require('service/cache').local;
var loginService  = new (require('service/admin/LoginService.js'))();
var securityService  = require('service/security/SecurityService.js');
var constants = config.applicationEnum;
var asyncFor = helper.asyncFor;
var messages = config.messages;
var codes = config.responseCode;
var _ = require('lodash');
var cbCaller = helper.cbCaller;
var orionConstants = config.orionConstants;
var request = require("request");
var httpResponseCodes = config.responseCodes;
var responseCodes = config.responseCode;
var responseCode = config.responseCodes;
var rebalanceUrl = config.env.prop.rebalanceUrl;
var lambdaRebalanceUrl = config.env.prop.lambdaRebalanceUrl;
var PortfolioDao = require('dao/portfolio/PortfolioDao.js');
var portfolioDao = new PortfolioDao();
var generateTradeInstanceId = config.env.prop.generateTradeInstanceId;
var tradeInstanceDao = new(require('dao/tradeorder/TradeInstanceDao.js'));
var rebalancerDao = new(require('dao/rebalancer/RebalancerDao'))();

var RebalanceService =  function() {
	this.CONNECT_API_TIMEOUT = 100000;
}

RebalanceService.prototype.rebalanceModelAndPortfolio = function (data, cb) {
  logger.info("Rebalance model and portfolio");
 	var self = this;
	var portfolioId = data.portfolioId;
	var form = {portfolioId: portfolioId};
	var finalUrl;
	if(data.isAccessLambda == "true"){
	   finalUrl = lambdaRebalanceUrl;
	}else{
	   finalUrl = rebalanceUrl;
	}
    console.log(data);
	if(data.rebalanceType == "CASH_DISTRIBUTION") {
	
		finalUrl = finalUrl+"distributeCash";
		form.accountId = data.accountId;
		form.amount = data.amount;
		
	}else if(data.rebalanceType == "CASH_CONTRIBUTION"){
	
		finalUrl = finalUrl+"contributeCash";
		form.accountId = data.accountId;
		form.amount = data.amount;
	}
	else if(data.rebalanceType == "cashNeed") {
		finalUrl = finalUrl+"cashNeedRebalance";
	}else{
	    finalUrl = finalUrl+"rebalance";
	}
	
	self.generateTradeInstance(data, function(err, response, status){
      if(err){
        return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
      }
      console.log("InstanceId = "+response);
	  
	  form.type = constants.portfolioType.NORMAL_PORTFOLIO;
	  form.tradeInstanceId = response;
	  form.firmId = data.user.firmId;
      
      var url = {
        url: finalUrl+"",
        timeout : self.CONNECT_API_TIMEOUT,
        json : form
      };   
      console.log(url);
      console.log("url of rebalance api is: "+finalUrl);
      request.post(url, function (err, response, body) {
    	  console.log(body);
        if (err) {
          logger.error("Err while rebalancing model " + err);
          return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
        }
        console.log(response.statusCode);
        if(response.statusCode !== httpResponseCodes.SUCCESS){
          return cb(messages.rebalanceError, httpResponseCodes.INTERNAL_SERVER_ERROR);
        }
        /*if(response.statusCode === httpResponseCodes.SUCCESS && !response.success){
          return cb(messages.rebalanceError, httpResponseCodes.INTERNAL_SERVER_ERROR);
        }*/
        console.log(body);
//        try{
//          body = JSON.parse(body);
//        }catch(e){
//        	console.log(e);
//          return cb(messages.jsonParserError, responseCodes.INTERNAL_SERVER_ERROR);
//        }
        cb(err, response.statusCode, body);
      });
      
  });
};

RebalanceService.prototype.assignModelToPortfolio = function (data, cb) {
     logger.info("assign model to Portfolio in rebalance service");
    portfolioDao.assignModel(data, function (err, result) {
        if (err) {
            logger.error("Error in update model in Portfolio" + err);
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (result.affectedRows > 0) {
            return cb(null, responseCodes.SUCCESS, result);
        } else {
            return cb(messages.internalServerError, responseCodes.INTERNAL_SERVER_ERROR);
        }
    });
};
RebalanceService.prototype.downloadRebalancerLogs = function (data, cb) {
    logger.info("Download Rebalancer Logs ");
 	var self = this;
	var url = {
		url: rebalanceUrl+"downloadOutputFile?rebalancerToken="+data.token,
		timeout : self.CONNECT_API_TIMEOUT
	};
	request.get(url, function (err, response, body) {
	    if (err) {
			logger.error("Err while getting rebalance logs " + err);
			return cb(err, httpResponseCodes.INTERNAL_SERVER_ERROR);
		}
		if(response.statusCode !== httpResponseCodes.SUCCESS){
			return cb(messages.rebalanceError, httpResponseCodes.INTERNAL_SERVER_ERROR);
		}
		/*if(response.statusCode === httpResponseCodes.SUCCESS && !response.success){
			return cb(messages.rebalanceError, httpResponseCodes.INTERNAL_SERVER_ERROR);
		}*/
		return cb(err, response, body);
	});
};

/** 
* Rebalance Portfolio
**/
RebalanceService.prototype.rebalance = function (data, cb) {  
  var self = this;
  logger.info("Rebalance Portfolio or Model!!!");
  // Get Instance ID
  data.appId = 1;
  data.userId =  null;
  data.description = "Rebalancer"; 
  data.notes = "Rebalancing Portfolios";

  tradeInstanceDao.createTradeInstance(data, function(err, resp){
    if(err){    
      logger.error("Error in saving  trade instance id: " + err);
      return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
    }else{
      logger.info("Generate Instance Id generated : " +JSON.stringify(resp));
      data.instance_id = resp.instance_id;      
      rebalancerDao.rebalance(data, function(err, resp){        
        if(err){          
          logger.error("Error in initializing rebalancer: " + err);
          data.tradesInstance = {instanceId: data.instance_id};
          tradeInstanceDao.deleteTradeInstance(data, function(error, res){
            if(error)
              logger.error("Not able to delete instance Id: " + error + " in case of error occured.");
            return cb(messages.badRequest, responseCode.BAD_REQUEST, err);  
          });          
        }else{          
          return cb(null, responseCode.SUCCESS, resp);
        }
      });
    }
  })
};

RebalanceService.prototype.generateTradeInstance = function (data, cb) {
      var self = this;
      logger.info("generate Trade instance Service Called (generateTradeInstance())");
      data.tradesInstance = {};
      data.tradesInstance.tradingAppId = 1; // CashNeeds App id from tradeApplication
      data.tradesInstance.notes = "";
      data.tradesInstance.description = "";
    
      var tradeInstanceIdURL = "http://" + data.hostname + "" + generateTradeInstanceId
    
      logger.info("******************************\nGenerateTrade API url is : "+tradeInstanceIdURL+"\n Session key is "+data.authKey+"\n************************");
        //Lets configure and request
        request({
            url: tradeInstanceIdURL, //URL to hit
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': data.authKey
            },
            json: {
                "appId": 1,
                "reason": data.tradesInstance.description
            } //Set the body as a string
        }, function (error, response, body) {
            if (error) {
                logger.error("Error while generating trade instance (generateTradeInstance()) " + error);
                return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("Generate Instance Id request response : " + body);
                return cb(null, body.tradeInstanceId, responseCodes.SUCCESS);
    
            }
        });
}

RebalanceService.prototype.generateTradeByRebalancer = function (data, cb) {    
        logger.info("Call rebalance service request recieve generateTradeByRebalancer()");
        var self = this;
        data.ids = [];
        data.ids.push(data.portfolioId);
        data.type = "portfolio";
        data.firmId = data.user.firmId;
        console.log(data);        
        self.rebalance(data, function(err, status, response){
            if(err){
                return cb("Error - Can not Rebalance", responseCodes.UNPROCESSABLE);
            }            
            else{
                return cb(null, status, response);
            }
        })    
}

module.exports = RebalanceService;
