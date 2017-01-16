"use strict";

var moduleName = __filename;

var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var localCache = require('service/cache').local;
var Promise = require("bluebird");
var _ = require("lodash");
var sign_hash = {1: '<', 2: '>', 3: '='};
var TaxLossHarvestingDao = function () { }

TaxLossHarvestingDao.prototype.createTrades=function(data,cb){
  try{
    logger.info("TLH create trades dao called.");    
    var firmConnection = baseDao.getConnection(data),
    query = "CALL CreateTradesForTLH(?,?,?,?,?,?)";    
    logger.debug("Executing Query: " + query + ". Parameters: ", [data.account_ids, data.term, data.gainLoss, data.amount, sign_hash[data.sign], data.taxableAccountsOnly]);
    firmConnection.query(query, [data.account_ids.toString(), data.term, data.gainLoss, data.amount, sign_hash[data.sign], data.taxableAccountsOnly], function(err, rows) {
      if(err){
          logger.error("Error while executing Query : " + query + " Parameters: " + [data.account_ids, data.term, data.gainLoss, data.amount, sign_hash[data.sign], data.taxableAccountsOnly] + " in TaxLossHarvestingDao.prototype.createTrades(). \n Error :" + err);
            return cb(err);        
        } 
        else{        
          logger.info("Successfully executed Query : " + query + " Parameters: " + [data.account_ids, data.term, data.gainLoss, data.amount, data.sign, data.taxableAccountsOnly] + " in TaxLossHarvestingDao.prototype.createTrades().");
          return cb(null, rows[0]);
        }
    });
  }
  catch(error){
    logger.error("Error in TaxLossHarvestingDao.createTrades() in try-catch. \n Error :" + error);
    return cb(error);
  }
}

TaxLossHarvestingDao.prototype.getSecuritiesDetails=function(data,cb){  
  return new Promise(function(resolve, reject) {  
     try{
      
      var firmConnection = baseDao.getConnection(data),
      result = {
        buy_tickers_info: {}, 
        sell_tickers_info: {}, 
        sell_tickers: [], 
        account_attached: {},
        buy_tickers: [],
      };

      // Get Buying Ticker Prices with names
      var buy_ticker_query = "SELECT security.id as id, security.name as name, price \
                    FROM security \
                    INNER JOIN securityPrice ON securityPrice.securityId = security.id \
                    WHERE security.id IN (" + data.buy_security_ids.toString() + ")";

      logger.debug("Executing Query: " + buy_ticker_query);
      firmConnection.query(buy_ticker_query, function(err, rows) {
        if(err){
          logger.error("Error while executing Query : " + buy_ticker_query + " in TaxLossHarvestingDao.prototype.getSecuritiesDetails(). \n Error :" + err);
            reject(err);        
        } 
        else{        
          logger.info("Successfully executed Query : " + buy_ticker_query + " in TaxLossHarvestingDao.prototype.getSecuritiesDetails().");

          _.map(rows, function(ticker){
            result.buy_tickers_info[ticker.id] = ticker;
            result.buy_tickers.push(ticker.id);
          });              

          // Get Selling Ticker details after applying swap conditions
          var sell_ticker_query = "CALL ValidTickerSwapTrades(?,?,?,?,?,?,?,?,?)";        
          logger.debug("Executing query: " + sell_ticker_query + "\n Parameters: " + ['account', data.account_ids.join(","), data.sell_security_ids.join(","), data.filter.term, data.filter.gainLoss, data.filter.amount, 1, !data.filter.taxableAccountsOnly, sign_hash[data.filter.sign]]);

          firmConnection.query(sell_ticker_query, ['account', data.account_ids.join(","), data.sell_security_ids.join(","), data.filter.term, data.filter.gainLoss, data.filter.amount, 1, !data.filter.taxableAccountsOnly, sign_hash[data.filter.sign]], function(err, rows) {
            if(err){
              logger.error("Error while executing Query : " + sell_ticker_query + " \n Parameters: " + ['account', data.account_ids.join(","), data.sell_security_ids.join(","), data.filter.term, data.filter.gainLoss, data.filter.amount, 1, !data.filter.taxableAccountsOnly, sign_hash[data.filter.sign]] + " in TaxLossHarvestingDao.prototype.getSecuritiesDetails(). \n Error :" + err);
              reject(err);            
            } else {                
              logger.info("Successfully executed Query : " + sell_ticker_query + " \n Parameters: " + ['account', data.account_ids.join(","), data.sell_security_ids.join(","), data.filter.term, data.filter.gainLoss, data.filter.amount, 1, !data.filter.taxableAccountsOnly, sign_hash[data.filter.sign]] + " in TaxLossHarvestingDao.prototype.getSecuritiesDetails().");
              
               _.map(rows[0], function(ticker){
                if(_.indexOf(result.sell_tickers, ticker.security_id) < 0){
                  result.sell_tickers_info[ticker.security_id] = [];
                  result.account_attached[ticker.security_id] = []
                }
                
                result.sell_tickers_info[ticker.security_id].push(ticker);
                result.account_attached[ticker.security_id].push(ticker.account_id);
                result.sell_tickers.push(ticker.security_id);     
              });                          
              resolve(result);             
            }
          });          
        }
      });   
    }
    catch(error){
      logger.error("Error in TaxLossHarvestingDao.prototype.getSecuritiesDetails(). \n Error :" + error);
      reject([error, ]);
    }   
  });    
};

module.exports = TaxLossHarvestingDao;