"use strict";

var moduleName = __filename;

var config = require('config');
var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var localCache = require('service/cache').local;
var Promise = require("bluebird");
var _ = require("lodash");
var responseCodes = config.responseCode;
var TickerSwapDao = function () { }

TickerSwapDao.prototype.getSecuritiesDetails=function(data,cb){  
  return new Promise(function(resolve, reject) {  
    try{
      var firmConnection = baseDao.getConnection(data),
      result = {buy_tickers_info: {}, sell_tickers_info: {}, sell_tickers: []};

      // Get Buying Ticker Prices with names
      var buy_ticker_query = "SELECT security.id as id, security.name as name, price \
                    FROM security \
                    INNER JOIN securityPrice ON securityPrice.securityId = security.id \
                    WHERE security.id IN (" + data.buy_tickers.toString() + ")";

      logger.debug("Executing Query: " + buy_ticker_query);
      firmConnection.query(buy_ticker_query, function(err, rows) {
        if(err){
          logger.error("Error while executing Query : " + buy_ticker_query + " in TickerSwapDao.prototype.getSecuritiesDetails(). \n Error :" + err);
            reject(err);        
        } 
        else{        
          logger.info("Successfully executed Query : " + buy_ticker_query + " in TickerSwapDao.prototype.getSecuritiesDetails().");

          _.map(rows, function(ticker){
            result.buy_tickers_info[ticker.id] = ticker;
          });        
          var type_selected = false;
          if(data.modelIds != null){
            data.type = 'model';
            data.ids = data.modelIds;
            type_selected = true;
          }else if (data.portfolioIds != null){
            data.type = 'portfolio';
            data.ids = data.portfolioIds;
            type_selected = true;
          }else if (data.accountIds != null){
            data.type = 'account';
            data.ids = data.accountIds;
            type_selected = true;
          }
          if(type_selected){
            // Get Selling Ticker details after applying swap conditions
            var sell_ticker_query = "CALL ValidTickerSwapTrades(?,?,?,?,?,?,?,?,?)";        
            logger.debug("Executing query: " + sell_ticker_query + "\n Parameters: " + [data.type, data.ids.join(","), data.sell_tickers.join(","), data.swapOptions.tickerBatch, data.swapOptions.profitLoss, data.swapOptions.value, data.swapOptions.valueType, data.swapOptions.includeTaxDeferredOrExemptAccounts, null]);

            firmConnection.query(sell_ticker_query, [data.type, data.ids.join(","), data.sell_tickers.join(","), data.swapOptions.tickerBatch, data.swapOptions.profitLoss, data.swapOptions.value, data.swapOptions.valueType, data.swapOptions.includeTaxDeferredOrExemptAccounts, null], function(err, rows) {
              if(err){
                logger.error("Error while executing Query : " + sell_ticker_query + " \n Parameters: " + [data.type, data.ids.join(","), data.sell_tickers.join(","), data.swapOptions.tickerBatch, data.swapOptions.profitLoss, data.swapOptions.value, data.swapOptions.valueType, data.swapOptions.includeTaxDeferredOrExemptAccounts, null] + " in TickerSwapDao.prototype.getSecuritiesDetails(). \n Error :" + err);
                reject(err);            
              } else {                
                logger.info("Successfully executed Query : " + sell_ticker_query + " \n Parameters: " + [data.type, data.ids.join(","), data.sell_tickers.join(","), data.swapOptions.tickerBatch, data.swapOptions.profitLoss, data.swapOptions.value, data.swapOptions.valueType, data.swapOptions.includeTaxDeferredOrExemptAccounts, null] + " in TickerSwapDao.prototype.getSecuritiesDetails().");
                
                 _.map(rows[0], function(ticker){
                  if(_.indexOf(result.sell_tickers, ticker.security_id) < 0)
                    result.sell_tickers_info[ticker.security_id] = [];
                  result.sell_tickers_info[ticker.security_id].push(ticker);
                  result.sell_tickers.push(ticker.security_id);              
                });            
                
                resolve(result);             
              }
            });
          }else{
            logger.error("Error in TickerSwapDao.prototype.getSecuritiesDetails(). \n Error : No TYPE selected");
            reject(["Error: No TYPE selected.", responseCodes.UNPROCESSABLE])
          }          
        }
      });   
    }
    catch(error){
      logger.error("Error in TickerSwapDao.prototype.getSecuritiesDetails(). \n Error :" + error);
      reject([error, ]);
    }   
  });    
};


module.exports = TickerSwapDao;