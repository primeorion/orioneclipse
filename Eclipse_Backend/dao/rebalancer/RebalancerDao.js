"use strict";

var moduleName = __filename;
var async = require('async');
var config = require('config');
var casting = require('casting');
var helper = require("helper");
var request = require("request");
var asyncFor = helper.asyncFor;
var messages = config.messages;
var constants = config.orionConstants;
var responseCode = config.responseCodes;
var localCache = require('service/cache').local
var logger = require('helper/Logger')(moduleName);
var utilFunctions = require('dao/util/UtilDao');
var baseDao = require('dao/BaseDao');
var LOCATION_SETTING = 'location_Setting';
var utilService = new(require('service/util/UtilService'))();
var Promise = require("bluebird");
var _ = require("lodash");
const number = 3; //this const will send these many requests in 1 time to DB for model rebalance
var enums = config.applicationEnum;
var poolCluster = require('dao/dbpool/Init.js').poolCluster;
var localCache = require('service/cache').local;
var middlewareUtils = require('helper').middlewareUtils;
var securityService  = require('service/security/SecurityService.js');
var loginService  = require('service/admin/LoginService.js');
var unique = require('helper').uniqueIdGenerator;
var rebalanceUrl = config.env.prop.rebalanceUrl + "rebalance";
const http = require('http');
var Client = require('node-rest-client').Client; 
var client = new Client();
var RebalancerDao = function() {this.CONNECT_API_TIMEOUT = 100000;};

/** 
* Calling SP to analyze full import
**/
RebalancerDao.prototype.rebalance = function(data, cb){
  logger.info("Initializiing Rebalance for Portfolio or Model!!!");
  return new Promise(function(resolve, reject) { 
    getPortfolioIdDetails(data)
    .then(function(portfolio_detail){   
      // Async. rebalance portfolio parallely for different types whether on API or SP.
      if(portfolio_detail == "No Portfolio to rebalance")
        return portfolio_detail;
      else{
        data.model_ids = portfolio_detail.models;      
        return Promise.all([
          normalPortfolio({portfolio_ids: portfolio_detail.normal, instance_id: data.instance_id, firm_id: data.user.firmId}), 
          sleevedPortfolio({portfolio_ids: portfolio_detail.sleeved, instance_id: data.instance_id, firm_id: data.user.firmId}),
          sleevedAccount({portfolio_ids: portfolio_detail.sleeved_account, instance_id: data.instance_id, firm_id: data.user.firmId}), 
          modelSPRebalance(data)
          ]);      
      }
    }).then(function(response){
      if(response == "No Portfolio to rebalance")      
        return cb(response, null);
      else
        return cb(null, response);      
    }).catch(function(error) {                        
      logger.error("Error in RebalancerDao.rebalance(). \n Error :" + error + ". Stack: ", error.stack);     
      return cb(error, null);        
    });
  });
}

/** 
* Get Portfolio Details whether sleeved or not
* {
* 	type: 'portfolio' OR type: 'model' OR type: 'account'
* 	ids: [1,3,4,5,6,7,8]
**/
var getPortfolioIdDetails;
RebalancerDao.prototype.getPortfolioIdDetails = getPortfolioIdDetails = function(data){
  return new Promise(function(resolve, reject) { 
    try{
      logger.info("Getting portfolio details w.r.t dynamic, sleeved or not!!!");
      var firmConnection = baseDao.getConnection(data),
      portfolio_detail = {
        normal: [],
        sleeved: [],
        sleeved_account: {},
        models: {}
      },
      sleeved_portfolio_accounts = [];      
      var query = "CALL GetPortfolioIdsDetailForRebalancer(?, ?)";
      firmConnection.query(query, [data.type, data.ids.join(",")], function(err, rows, fields) {
        if(err){
          logger.error("Error while executing Query : " + query + " in RebalancerDao.getPortfolioIdDetails(). \n Error :" + err);
          reject(err);
        }else{
          rows = rows[0];
          if(rows.length < 1 || Object.keys(rows[0]).length == 1)
            resolve("No Portfolio to rebalance");
          else{
            _.map(rows, function(resp){
              if(resp.isSleevePortfolio == 0){
                if(resp.dynamicModel == 1){                
                  if(!Object.keys(portfolio_detail.models).includes(resp.model_id.toString())){
                    portfolio_detail.models[resp.model_id] = []; 
                  }
                  portfolio_detail.models[resp.model_id].push({portfolio_id: resp.portfolio_id, account_id: null});
                }
                else
                  portfolio_detail.normal.push(resp.portfolio_id);
              }
              else{              
                if(resp.account_dynamic_model == 0 || resp.account_dynamic_model == null){
                  portfolio_detail.sleeved.push(resp.portfolio_id);
                  if(!Object.keys(portfolio_detail.sleeved_account).includes(resp.portfolio_id.toString())) {
                    portfolio_detail.sleeved_account[resp.portfolio_id] = {account_id: []}; 
                  }
                  portfolio_detail.sleeved_account[resp.portfolio_id].account_id.push(resp.account_id);
                }else{
                  sleeved_portfolio_accounts.push(resp.portfolio_id);                
                  if(!Object.keys(portfolio_detail.models).includes(resp.account_model_id.toString())){
                    portfolio_detail.models[resp.account_model_id] = []; 
                  }
                  portfolio_detail.models[resp.account_model_id].push({portfolio_id: resp.portfolio_id, account_id: resp.account_id});
                }              
              }
            })          
            portfolio_detail.sleeved = _.uniq(portfolio_detail.sleeved);
            sleeved_portfolio_accounts = _.uniq(sleeved_portfolio_accounts);
            portfolio_detail.sleeved = _.difference(portfolio_detail.sleeved, sleeved_portfolio_accounts);       
            _.map(portfolio_detail.sleeved, function(id){
              delete portfolio_detail.sleeved_account[id];
            });          
            resolve(portfolio_detail);          
          }        
        }
      });
    }catch(err){
      logger.error("Error in RebalancerDao.getPortfolioIdDetails(). \n Error :" + err);
      reject(err);
    }     
  }); 
}

/** 
* Rebalance NORMAL type portfolio
**/
var normalPortfolio = function(data){
  return new Promise(function(resolve, reject) { 
    try{
      logger.info("Rebalancing Normal Portfolios!!!");
      var portfolio_length = data.portfolio_ids.length,
      index_count = 0,
      resp = {},
      firm_id = data.firm_id;

      if(portfolio_length == 0)
        resolve("Success!!!");

      _.map(data.portfolio_ids, function(portfolio_id){
        var args = {
          data: { 
            portfolioId: portfolio_id,
            type: "NORMAL_PORTFOLIO",
            tradeInstanceId: data.instance_id,
            firmId: firm_id
          },
          headers: { "Content-Type": "application/json" }
        };
        logger.debug("Rebalancer POST API called:", rebalanceUrl + ". Args: " + JSON.stringify(args));         
        client.post(rebalanceUrl, args, function(dta, response) {          
          index_count += 1;                    
          if(response.statusCode > 210)
            logger.error("Error while HTTP POST request to rebalancer in RebalancerDao.rebalancerAnalysis().\nURL: " + rebalanceUrl + "\n ARGS: " + JSON.stringify(args) + "\n Status Code :" + response.statusCode + "\n  Data in response: " + JSON.stringify(dta));            
          if(index_count == portfolio_length)          
            resolve(resp);                  
          resp[portfolio_id] = {link: rebalanceUrl, arg: args, status: response.statusCode, response: dta}
        }).on('error', function(err){
          logger.error("Error while HTTP POST request to rebalancer in RebalancerDao.rebalancerAnalysis(). \n Error :" + err);
          reject(err);
        });      
      }); 
    }catch(err){
      logger.error("Error in RebalancerDao.normalPortfolio(). \n Error :" + err);
      reject(err);
    } 
  }); 
}

/** 
* Rebalance Sleeved type portfolio
**/
var sleevedPortfolio = function(data){
  return new Promise(function(resolve, reject) { 
    try{
      logger.info("Rebalancing Sleeved Portfolios!!!");
      var portfolio_length = data.portfolio_ids.length,
      index_count = 0,
      resp = {},
      firm_id = data.firm_id;
      
      if(portfolio_length == 0)
        resolve("Success!!!");

      _.map(data.portfolio_ids, function(portfolio_id){
        var args = {
          data: { 
            portfolioId: portfolio_id,
            type: "SLEEVE_PORTFOLIO",
            tradeInstanceId: data.instance_id,
            firmId: firm_id
          },
          headers: { "Content-Type": "application/json" }
        };
        logger.debug("Rebalancer POST API called:", rebalanceUrl + ". Args: " + JSON.stringify(args));         
        client.post(rebalanceUrl, args, function(dta, response) {          
          index_count += 1;
          if(response.statusCode > 210)
            logger.error("Error while HTTP POST request to rebalancer in RebalancerDao.rebalancerAnalysis().\nURL: " + rebalanceUrl + "\n ARGS: " + JSON.stringify(args) + "\n Status Code :" + response.statusCode + "\n  Data in response: " + JSON.stringify(dta));
          if(index_count == portfolio_length)
            resolve(resp);                  
          resp[portfolio_id] = {link: rebalanceUrl, arg: args, status: response.statusCode, response: dta}
        }).on('error', function(err){
          logger.error("Error while HTTP POST request to rebalancer in RebalancerDao.sleevedPortfolio(). \n Error :" + err);
          reject(err);
        });      
      });   
    }catch(err){
      logger.error("Error in RebalancerDao.sleevedPortfolio(). \n Error :" + err);
      reject(err);
    }     
  }); 
}

/** 
* Rebalance Sleeved type portfolio having sleeved account
**/
var sleevedAccount = function(data){
  return new Promise(function(resolve, reject) {
    try{
      logger.info("Rebalancing Sleeved Portfolios with sleeved account!!!");      
      var portfolio_ids = Object.keys(data.portfolio_ids),
      portfolio_length = portfolio_ids.length,
      index_count = 0,
      resp = {},
      firm_id = data.firm_id;

      if(portfolio_length == 0)
        resolve("Success!!!");

      _.map(portfolio_ids, function(portfolio_id){
        _.map(data.portfolio_ids[portfolio_id], function(account_id){
          var args = {
            data: { 
              portfolioId: portfolio_id,
              account_id: account_id,
              type: "SLEEVE_ACCOUNT",
              tradeInstanceId: data.instance_id,
              firmId: firm_id
            },
            headers: { "Content-Type": "application/json" }
          };
          logger.debug("Rebalancer API called:", rebalanceUrl + ". Args: " + JSON.stringify(args));         
          client.post(rebalanceUrl, args, function(dta, response) {          
            index_count += 1;
            if(response.statusCode > 210)
              logger.error("Error while HTTP POST request to rebalancer in RebalancerDao.rebalancerAnalysis(). \n URL: " + rebalanceUrl + "\n ARGS: " + JSON.stringify(args) + "\n Status Code :" + response.statusCode + "\n  Data in response: " + JSON.stringify(dta));
            if(index_count == portfolio_length){              
              resolve(resp);        
            }
            resp[portfolio_id] = {link: rebalanceUrl, arg: args, status: response.statusCode, response: dta}
          }).on('error', function(err){
            logger.error("Error while HTTP POST request to rebalancer in RebalancerDao.sleevedAccount(). \n Error :" + err);
            reject(err);
          });
        });      
      });
    }catch(err){
      logger.error("Error in RebalancerDao.sleevedAccount(). \n Error :" + err);
      reject(err);
    }     
  }); 
}

/** 
* Rebalance Model from SP
* {data: data, model_ids: portfolio_detail.models}
**/
var modelSPRebalance;
RebalancerDao.prototype.modelSPRebalance = modelSPRebalance = function(data){
  return new Promise(function(resolve, reject) { 
    logger.info("Rebalancing MODELS from SP");   
    var self = this; 
    confirmSecurityPriceUpdate(data, function(err, result){
      // if(err){
      //   // reject(err);
      // }
      // else{
        var model_ids = Object.keys(data.model_ids);    
        if(model_ids.length == 0)
          resolve("success!!!");
        else{
          try{       
            var firmConnection = baseDao.getConnection(data);
            var query = "CALL updateTargetPercentForDynamicModel(?)",
            body;
            
            var ids = model_ids.splice(0,number),
            model_length = model_ids.length,
            last_lot = false,
            loop_iteration = 0,
            num = number,
            resp = {};

            if(model_length < number){
              last_lot = true;
              num = model_length;
            }
            var loop = function(ids, last_lot){
              num = last_lot ? ids.length : num;
              loop_iteration++;
              var index = 0;
              if(ids.length > 0){
                _.map(ids, function(id){
                  logger.debug("Query Ran:", query +  ". Parameters: " + id);
                  firmConnection.query(query, id, function(err, rows, fields) {
                    index++;
                    if (err){
                      logger.error("Error while executing Query : " + query + " in RebalancerDao.modelSPRebalance(). \n Error :" + err);
                      resp[id] = {SP: query, status: 400, response: err, model_data: data.model_ids[id]}
                    }
                    else 
                      resp[id] = {SP: query, status: 200, response: "Model Successfully Rebalanced!!!", model_data: data.model_ids[id]};            
                    
                    if(index == num){
                      if(last_lot){                    
                        resolve(resp);
                      }
                      else{
                        ids = [];
                        ids = model_ids.splice(number * loop_iteration, number * (loop_iteration+1));

                        if(model_length / number > loop_iteration)               
                          return loop(ids, false);
                        else
                          return loop(ids, true);
                      }
                    }                            
                  });
                });
              }else{
                resolve("success!!!");
              }                
            }
            loop(ids, last_lot);    
          }catch(err){
            logger.error("Error in RebalancerDao.modelSPRebalance(). \n Error :" + err);        
            reject(err);
          }
              
        }
      // }
      });
  });
}
var getModelPreferenceForPrice;
RebalancerDao.prototype.getModelPreferenceForPrice = getModelPreferenceForPrice = function(data, cb){
  var connection = baseDao.getConnection(data);
  var query = "CALL getGeneralPreferenceValueForPreferenceLevel('priceSource',1,?,?)";
  var modelId = data.id;
  connection.query(query, [data.user.firmId,data.user.firmId], function(err, resultSet) {
    if (err) {
      logger.error("error get detail"+err);
      return cb(err);
    }
    if(resultSet && resultSet.length>0){
      logger.info("the result is"+JSON.stringify(resultSet[0][0]));
      return cb(null, (resultSet[0][0].prefValue).trim());
    }
    return cb(messages.priceSourcePreferenceNotSet, null);
  });
}

var getUniqueAccountIdsAndPortfolioIdsFromDynamicModel;
RebalancerDao.prototype.getUniqueAccountIdsAndPortfolioIdsFromDynamicModel = getUniqueAccountIdsAndPortfolioIdsFromDynamicModel = function(pricePreferece, models_info, cb){
  if(pricePreferece === enums.priceSource.XIGNITE_REALTIME){
    var accountIds = [];
    var portfolioIds = [];
    for (var model_info in models_info){
      var model_detail_array = models_info[model_info];
      model_detail_array.forEach(function(model_detail){
        console.log(model_detail);
        if(model_detail.account_id){
          if(!accountIds.includes(model_detail.account_id)){
            accountIds.push(model_detail.account_id);
          }
        }else{
          if(!portfolioIds.includes(model_detail.portfolio_id)){
            portfolioIds.push(model_detail.portfolio_id);
          }
        }
      });
    }
    var output = {};
    output.accountIds = accountIds;
    output.portfolioIds = portfolioIds;
    return cb(null, output)
  }else if(pricePreferece === enums.priceSource.ORION_PRICE){
     return cb(messages.securityPriceUpdated);
  }else{
   return cb(messages.priceSourcePreferenceNotSet, null);
  }
}

var getSecurityListWithType;
RebalancerDao.prototype.getSecurityListWithType = getSecurityListWithType = function(data,cb){
  var connection = baseDao.getConnection(data);
  var query = "CALL getSecurityListWithType(?,?)";
  var id = (data.ids).toString();
  var type = data.type;
  connection.query(query, [type, id], function(err, resultSet) {
    if (err) {
      return cb(err);
    }
    return cb(null, resultSet);
  });
}

var getUniqueSecuritySymbols;
RebalancerDao.prototype.getUniqueSecuritySymbols = getUniqueSecuritySymbols= function(securities,cb){
  var securitySymbols = [];
  var securitySymbolIdMap ={};
  var securityIds = [];
  securities.forEach(function(security){
    if(!(securityIds.includes(security.securityId))){
      securitySymbols.push(security.SecuritySymbol);
      securityIds.push(security.securityId);
      securitySymbolIdMap[security.SecuritySymbol] = security.securityId;
    }
  });
  var result = {};
  result.securitySymbols = securitySymbols;
  result.securitySymbolIdMap = securitySymbolIdMap;
  return cb(null,result);
}

var confirmSecurityPriceUpdate;
RebalancerDao.prototype.confirmSecurityPriceUpdate = confirmSecurityPriceUpdate = function(data, cb){
  var models_info = data.model_ids;
  var pricePreferece = 2;
  getModelPreferenceForPrice(data, function(err, pricePreferece){
    if(err){
      return(err);
    }
    console.log("price preference is "+pricePreferece);
    getUniqueAccountIdsAndPortfolioIdsFromDynamicModel(pricePreferece,models_info,function(err, result){
      if(err){
        logger.error("Error getting unique portfolio and account Id"+err);
        return cb(err);
      }
      if(result){
        var accountIds = result.accountIds;
        var portfolioIds = result.portfolioIds;
        var account_data = {};
        account_data.ids = accountIds || '';
        account_data.type = 'ACCOUNT';
        account_data.user = data.user;
        account_data.reqId = data.reqId;
        getSecurityListWithType(account_data, function(err,result){
          if(err){
            logger.error("Error in getting account securities"+err);
            return cb(err);
          }
          var accountsSecurityResult = result[0];
          var portfolio_data = {};
          portfolio_data.ids = portfolioIds;
          portfolio_data.type = 'PORTFOLIO';
          portfolio_data.user = data.user;
          portfolio_data.reqId = data.reqId;
          getSecurityListWithType(portfolio_data, function(err,result){
            if(err){
              logger.error("Error in getting account securities"+err);
              return cb(err);
            }
            var portfolioSecurityResult = result[0];
            var securities = utilService.joinArrayValues(accountsSecurityResult, portfolioSecurityResult);
            getUniqueSecuritySymbols(securities, function(err, resp){
              if(err){
                logger.error("Error in getting unique security symbols"+err);
                return cb(err);
              }
              data.securityIds = resp.securitySymbols;
              getPricesFromConnect(data, function(err, status, result){
                if(err){
                  logger.error("Error in getting price  " + err);
                  return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                var security_data = {};
                security_data.reqId = data.reqId;
                security_data.user = data.user;
                security_data.securities = result;
                security_data.securitySymbolIdMap = resp.securitySymbolIdMap;
                securityService.updateSecurityPrice(security_data, function(err, status, result){
                  if(err){
                    return cb(err);
                  }
                  return cb(null, result);
                });
              });
            });
          });
        })
      }else{
        logger.info("No account or portfolio found");
        return cb(null, messages.noPortfolioAccountFound);
        // return cb(messages.noPortfolioAccountFound);
      }
    })
  });


} 
var getPricesFromConnect;
RebalancerDao.prototype.getPricesFromConnect = getPricesFromConnect = function(data, cb){
  var self = this;
  logger.info("Get prices from connect service called (getPricesFromConnect())");
  var connectData = {};
  connectData.authorizationHeaders = "Basic cHJpbWV0Z2k6cHJpbWV0Z2kyMiE=";
  getTokenFromConnectAPI(connectData, function(err, status, response){
    if(err){
      logger.error("Error getting token from connect"+err);
      return cb(err, status);
    }
    var orion_access_token = response.access_token;
    //Lets configure and request
        request({
            url: constants.api.getSecurityPrice, //URL to hit
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
                'Authorization': 'Session '+orion_access_token
            },
            json: data.securityIds
        }, function (error, response, body) {
            if (error) {
                logger.error("Error while getting price (getPricesFromConnect()) " + error);
                return cb(error, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                logger.info("Get price successfully from connect : " + JSON.stringify(body));
              prepareSecuritySymbolPrice(body,function(err, status, result){
                if(err){
                  logger.error("Error preparing security symbol price");
                  return cb(err, status);
                }
                return cb(null, status, result);
              })
            }
        });
  })
}
var prepareSecuritySymbolPrice;
RebalancerDao.prototype.prepareSecuritySymbolPrice = prepareSecuritySymbolPrice = function(securities, cb){
  var security_array = [];
  securities.forEach(function(security){
    var temp_security = {};
    temp_security.price = security.last;
    temp_security.symbol = security.symbol;
    security_array.push(temp_security);
  });
  return cb(null, responseCode.SUCCESS, security_array);
}

var getTokenFromConnectAPI;
RebalancerDao.prototype.getTokenFromConnectAPI = getTokenFromConnectAPI = function (data, cb) {
  logger.info("Verify token with orion connect (getTokenFromConnectAPI())");
  
  var self = this;
  
  var authorization = data.authorizationHeaders;
  var url = {
    url: constants.api.logIn,
    headers: {
      'Authorization': authorization
    },
    timeout : 100000
  };

  request.get(url, function (err, response, data) {
    logger.info("Get details from orion connect API");
    if (err) {
      logger.error("Error in connecting orion connect API" + err);
      return cb(err, responseCode.INTERNAL_SERVER_ERROR);
    }
    if(response.statusCode !== responseCode.SUCCESS){
      return cb(response[orionApiResponseKeys.errorMessage], response.statusCode, null);
    }
    var result;
    try{
      result = JSON.parse(data);
    }catch(e){
      logger.error("Error in JSON pasring" + e);
      return cb(messages.jsonParserError, responseCode.INTERNAL_SERVER_ERROR);
    }
    cb(err, response.statusCode, result);
  });

};
module.exports = RebalancerDao;