var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var _ = require('lodash');
var util = require('util');

var messages = config.messages;
var responseCodes = config.responseCode;
var util = require('util');
var helper = require("helper");
var constants = config.applicationEnum;
var Promise = require("bluebird");
var _ = require("lodash");
var tradeInstanceDao = new(require('dao/tradeorder/TradeInstanceDao.js'))();
var tickerSwapDao = new(require('dao/tradetool/TickerSwapDao.js'))();
var tradeToolCommonServices = new(require('service/tradeorder/CommonService.js'))();
var commonDao = new(require('dao/tradeorder/CommonDao.js'))();

var TickerSwapService = function () {};

/** 
* Service to swap ticker as per input and conditions specified by user
**/
TickerSwapService.prototype.swapTrade = function(data, cb) {
  try{
    logger.info("Ticker Swap Trades service called.");
    var output = {trades: []},
    trades;  
    return new Promise(function(resolve, reject) {  
      // Check All Validations
        checkSwapValidations(data.tickerSwap)
        .then(function(swap_validated){       
          output.trades.push(swap_validated.failed);
          data.ticker_swap = swap_validated.success;
          data.sell_tickers = swap_validated.sell_tickers;
          data.buy_tickers = swap_validated.buy_tickers;
          data.sell_tickers_position = swap_validated.sell_tickers_position;

          if(data.buy_tickers.length > 0){
            // Get Security with all details in all accounts
            return tickerSwapDao.getSecuritiesDetails(data);
          }
          else{          
            return cb(null, responseCodes.SUCCESS, output);
          }
        })
        .then(function(ticker_details){                
          data.buy_tickers_info = ticker_details.buy_tickers_info;
          data.sell_tickers_info = ticker_details.sell_tickers_info;
          data.tickers_to_be_sold = ticker_details.sell_tickers;         
          // Check Conditions of all swaps & Generate Trades
          return generateTradesOfSwaps(data);
        })
        .then(function(trades){
          output.trades.push(trades.failed);
          // data.ticker_swap = trades.success;
          data.trades_generated_before_preferences = trades.generated_trades;          
          // Create Intance Id
          return generateTradeInstanceId(data);
        })
        .then(function(trade_instance_id){          
          output.tradeInstanceId = trade_instance_id;
          data.tradeInstanceId = trade_instance_id;
          // Get Successful Trades w.r.t preferences
          return generate_trades_after_preferences(data);
        })
        .then(function(trades){
          output.trades.push(trades.failed);
          output.trades.push(trades.success);
          output.trades = _.flatten(output.trades);
          data.trades = trades.successful_generated_trades;
          
          // Insert Successful Trades
          return insert_successful_trades(data);
        })
        .then(function(final_response){
          // Return Result
          return cb(null, responseCodes.SUCCESS, output);
        })
        .catch(function(error){          
          logger.error("Error in function TickerSwapService.swapTrade. \n Error: " + error + ". \n Error STACK: " + error.stack);
          if(typeof(error) == 'string')
            return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
          else
            return cb(error[0], error[1]);
        })    
    });  
  }
  catch(error){
    logger.error("Error in TickerSwapService.swapTrade() in try-catch. \n Error :" + error);
    return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
  }  
}

/** 
* Service to check validations of swap trades e.g. duplicate trade, vice-versa duplicate trades, irrelevant percent(< 0 OR > 100)
**/
var checkSwapValidations;
TickerSwapService.prototype.checkSwapValidations = checkSwapValidations = function(tickerSwapTrades){
  return new Promise(function(resolve, reject) {
    try{
      logger.info("Checking Swap Trade Validations.");
      var swap_validated = {failed: [], success: [], sell_tickers: [], buy_tickers: [], sell_tickers_position: {}},
      ticker_info = {},
      tickers = [],
      duplicate_trades_index = [],
      reverse_duplicate_trade_index = [],
      total_percent_failed_trade_index = [],
      failed_index = [];
      _.map(tickerSwapTrades, function(trade, index){        
        if(trade.percent <= 0){
          // delete(trade.percent);
          trade.accountId = null;
          trade.status = 'failed';
          trade.reason = 'Selling percentage cannot be equal to or less than 0%.';
          swap_validated.failed.push(trade);
          failed_index.push(index);
        }
        else if(trade.percent > 100){
          // delete(trade.percent);
          trade.accountId = null;
          trade.status = 'failed';
          trade.reason = 'Selling percentage cannot be more than 100%.';
          swap_validated.failed.push(trade);
          failed_index.push(index);
        }
        else if(trade.sellTickerId == trade.buyTickerId){
          // delete(trade.percent);
          trade.accountId = null;
          trade.status = 'failed';
          trade.reason = 'Same ticker selected for sell and buy.';
          swap_validated.failed.push(trade);
          failed_index.push(index);
        }
        // Checking empty sellerId
        else if(trade.sellTickerId == null || trade.sellTickerId == "" ){
         // delete(trade.percent);
          trade.accountId = null;
          trade.status = 'failed';
          trade.reason = 'Sell Ticker ID is blank.';
          swap_validated.failed.push(trade);
          failed_index.push(index);
        }
        else{
          if(_.indexOf(tickers, trade.sellTickerId) < 0)
            ticker_info[trade.sellTickerId] = {percent: 0, buy_ticker_id: [], indexx: [], reject: false};

          tickers.push(trade.sellTickerId);          

          ticker_info[trade.sellTickerId].percent += trade.percent;
          // Check Total Percent of selling and reject if it is more than 100%
          if(ticker_info[trade.sellTickerId].percent > 100){
            ticker_info[trade.sellTickerId].reject = true;
            total_percent_failed_trade_index.push(ticker_info[trade.sellTickerId].indexx);
            total_percent_failed_trade_index.push(index);
          }
          // Checking duplicate trade records
          else if(_.includes(ticker_info[trade.sellTickerId].buy_ticker_id, trade.buyTickerId)){
            duplicate_trades_index.push(index);
            duplicate_trades_index.push(ticker_info[trade.sellTickerId].indexx[_.indexOf(ticker_info[trade.sellTickerId].buy_ticker_id, trade.buyTickerId)]);
          }
          // Checking reverse trade records  
          else if(_.includes(tickers, trade.buyTickerId) &&
             _.includes(ticker_info[trade.buyTickerId].buy_ticker_id, trade.sellTickerId)){
            reverse_duplicate_trade_index.push(index);
            reverse_duplicate_trade_index.push(ticker_info[trade.buyTickerId].indexx[_.indexOf(ticker_info[trade.buyTickerId].buy_ticker_id, trade.sellTickerId)]);
          }          
          else{
            ticker_info[trade.sellTickerId].buy_ticker_id.push(trade.buyTickerId);
            ticker_info[trade.sellTickerId].indexx.push(index);
          }        
        }      
      });
      failed_index.push(total_percent_failed_trade_index);
      failed_index.push(duplicate_trades_index);
      failed_index.push(reverse_duplicate_trade_index);
      failed_index = _.uniq(_.flattenDeep(failed_index));
      duplicate_trades_index = _.uniq(_.flattenDeep(duplicate_trades_index));
      reverse_duplicate_trade_index = _.uniq(_.flattenDeep(reverse_duplicate_trade_index));
      total_percent_failed_trade_index = _.uniq(_.flattenDeep(total_percent_failed_trade_index));

      var success_index = 0;
      
      _.map(tickerSwapTrades, function(trade, index){
        if(_.includes(failed_index, index)){
          if(_.includes(duplicate_trades_index, index)){
            // delete(trade.percent);
            trade.accountId = null;
            trade.status = 'failed';
            trade.reason = 'Duplicate Trades.';
            swap_validated.failed.push(trade);
          }
          else if(_.includes(reverse_duplicate_trade_index, index)){
            // delete(trade.percent);
            trade.accountId = null;
            trade.status = 'failed';
            trade.reason = 'Vice Versa Trades. Selling security to buy a secuirty & again selling bought security to buy sold security.';
            swap_validated.failed.push(trade);
          }else if(_.includes(total_percent_failed_trade_index, index)){
            // delete(trade.percent);
            trade.accountId = null;
            trade.status = 'failed';
            trade.reason = 'Cannot Sell same ticker in multiple trades with sum of total percentage above 100%.';
            swap_validated.failed.push(trade);
          }
        }else{
          if(_.indexOf(swap_validated.sell_tickers, trade.sellTickerId) < 0)
            swap_validated.sell_tickers_position[trade.sellTickerId] = [];
          swap_validated.success.push(trade);
          swap_validated.sell_tickers.push(trade.sellTickerId);
          swap_validated.buy_tickers.push(trade.buyTickerId);
          swap_validated.sell_tickers_position[trade.sellTickerId].push(success_index);
          success_index += 1;
        }
      });
      swap_validated.sell_tickers = _.uniq(swap_validated.sell_tickers);
      swap_validated.buy_tickers = _.uniq(swap_validated.buy_tickers);
      resolve(swap_validated);
    }catch(error){
      logger.error("Error while generating trade instance in function TickerSwapService.checkSwapValidations. \n Error: " + error);
      reject(error);
    }
    
  });
};

/** 
* Generate trades of successful swaps irrespective of preferences (Generate trades of swaps on basis of user conditions)
**/
var generateTradesOfSwaps;
TickerSwapService.prototype.generateTradesOfSwaps = generateTradesOfSwaps = function(data){  
  return new Promise(function(resolve, reject) {
    try{
      logger.info("Generate Trade of swaps with user conditions.");
      var trades = {
        failed: [],
        success: [],
        generated_trades: {sell: {}, buy: {}}        
      },
      generated_trades_index = [],
      array; 
      // Filtering successful swaps
      _.map(data.tickers_to_be_sold, function(ticker){
        _.map(data.sell_tickers_info[ticker], function(account_info){
          _.map(data.sell_tickers_position[ticker], function(position){
            var input_trade = data.ticker_swap[position],
            buying_ticker_info = data.buy_tickers_info[input_trade.buyTickerId] || {},
            generated_trade = {
              sell: {
                accountId: account_info.account_id,
                securityId: account_info.security_id,
                action: 'sell',
                market_price: account_info.sell_price,
                value: account_info.quantity * (input_trade.percent / 100) * account_info.sell_price,
                quantity: account_info.quantity * (input_trade.percent / 100),
                index_at: position,
                portfolioId: account_info.portfolio_id,
                custodianId: account_info.custodian_id,
                positionId: account_info.position_id,
                isEnabled: 1,
                isSendImmediately: 0,
                tradeActionId: 2
              },
              buy: {
                accountId: account_info.account_id,
                securityId: input_trade.buyTickerId < 0 ? null : input_trade.buyTickerId,
                action: 'buy',
                market_price: buying_ticker_info.price,
                value: account_info.quantity * (input_trade.percent / 100) * account_info.sell_price,
                index_at: position,
                quantity: (account_info.quantity * (input_trade.percent / 100) * account_info.sell_price) / buying_ticker_info.price,
                portfolioId: account_info.portfolio_id,
                custodianId: account_info.custodian_id,
                positionId: null,
                isEnabled: 1,
                isSendImmediately: 0,
                tradeActionId: 1      
              }
            };            
            // delete(input_trade.percent);
            input_trade.accountId = account_info.account_id;
            input_trade.status = 'successful';
            input_trade.reason = 'Successfully Swap Trades.'; 
            trades.success.push(input_trade);           
            trades.generated_trades.sell[account_info.security_id + "_" + account_info.account_id] =generated_trade.sell;
            trades.generated_trades.buy[account_info.security_id + "_" + account_info.account_id] = generated_trade.buy;
            generated_trades_index.push(position);
          });
        });
      });
      array = _.range(data.ticker_swap.length);
      array = _.difference(array, generated_trades_index);
      
      // Raising alarms of failed swaps
      _.map(array, function(arr_ind){
        var failed_trade = data.ticker_swap[arr_ind];
        // delete(failed_trade.percent);
        failed_trade.accountId = null;
        failed_trade.status = 'failed';
        failed_trade.reason = 'Trade doesn\'t qualify for conditions provided by you in any account.'; 
        trades.failed.push(failed_trade);
      })

      resolve(trades);  
    }
    catch(error){
      logger.error("Error in TickerSwapService.generateTradesOfSwaps(). \n Error :" + error);
      reject(error);
    }     
  });   
};

/** 
* Generate Trade Instance ID
**/
var generateTradeInstanceId;
TickerSwapService.prototype.generateTradeInstanceId = generateTradeInstanceId = function(data){
  return new Promise(function(resolve, reject) {
    logger.info("Generating Trade Instance ID.");
    data.tradesInstance = {
      tradingAppId: 10,
      notes: data.notes || null,
      description: "Swaping trades on information given by user."
    };
    tradeInstanceDao.saveTradeInstance(data, function(err, resp){
      if(err){
        logger.error("Error while generating trade instance in function TickerSwapService.generateTradeInstanceId. \n Error: " + err);
        reject(err);
      }else{                
        resolve(resp.insertId);;
      }
    });
  });
}

/** 
* Generate Trades After checking Preferences
**/
var generate_trades_after_preferences;
TickerSwapService.prototype.generate_trades_after_preferences = generate_trades_after_preferences = function(data){
  return new Promise(function(resolve, reject) { 
    try{
      logger.info("Generating trades with preferences check.");
      var trades_to_sell = Object.keys(data.trades_generated_before_preferences.sell),
      trades = {
          failed: [],
          success: [],
          successful_generated_trades: []
      };
      var sell_trades_length = trades_to_sell.length,
      init_index = 0;
      if(sell_trades_length > 0){
        _.map(trades_to_sell, function(trade_key){
          var sell_trade_info = data.trades_generated_before_preferences.sell[trade_key] || {};
          var input_data_sell_ticker = {
            reqId: data.reqId,
            typeId: 1,
            id:  sell_trade_info.accountId,
            actionId: 2,
            securityId: sell_trade_info.securityId,
            sendTradesImmediate: false,
            actionProperties: {
              typeId: 1,
              value: sell_trade_info.value
            }
          };        
          return tradeToolCommonServices.applyPrefrencesAndGenrateTradeOrder(input_data_sell_ticker,function(err, resp, sell_result){
            if(sell_result == null){
              init_index += 1;
              var failed_trade_info = data.ticker_swap[sell_trade_info.index_at];
              var failed_trade = {
                sellTickerId: failed_trade_info.sellTickerId,
                sellTickerName: failed_trade_info.sellTickerName,
                buyTickerId: failed_trade_info.buyTickerId,
                buyTickerName: failed_trade_info.buyTickerName,
                percent: failed_trade_info.percent
              }
              failed_trade.accountId = sell_trade_info.accountId;
              failed_trade.status = 'failed';
              failed_trade.reason = err + " for sell ticker."; 
              trades.failed.push(failed_trade);
              
              if(init_index == sell_trades_length)
                resolve(trades);
            }else{
              var buy_trade_info = data.trades_generated_before_preferences.buy[trade_key] || {};
              var input_data_buy_ticker = {
                reqId: data.reqId,
                typeId: 1,
                id:  buy_trade_info.accountId,
                actionId: 1,
                securityId: buy_trade_info.securityId,
                sendTradesImmediate: false,
                actionProperties: {
                  typeId: 1,
                  value: buy_trade_info.value
                }
              };
              sell_trade_info.price = sell_result.price / sell_result.quantity;
              sell_trade_info.orderQty = sell_result.quantity;
              sell_trade_info.orderPercent = sell_result.percent;              
              sell_trade_info.tradeAmount = sell_trade_info.value;
              
              return tradeToolCommonServices.applyPrefrencesAndGenrateTradeOrder(input_data_buy_ticker, function(err, resp, buy_result){
                init_index += 1;
                if(buy_result == null){
                  var failed_trade_info = data.ticker_swap[buy_trade_info.index_at];
                  var failed_trade = {
                    sellTickerId: failed_trade_info.sellTickerId,
                    sellTickerName: failed_trade_info.sellTickerName,
                    buyTickerId: failed_trade_info.buyTickerId,
                    buyTickerName: failed_trade_info.buyTickerName,
                    percent: failed_trade_info.percent
                  }
                  failed_trade.accountId = buy_trade_info.accountId;
                  failed_trade.status = 'failed';
                  failed_trade.reason = err + " for buy ticker."; 
                  trades.failed.push(failed_trade);
                }else{
                  var success_trade_info = data.ticker_swap[buy_trade_info.index_at];
                  var success_trade = {
                    sellTickerId: success_trade_info.sellTickerId,
                    sellTickerName: success_trade_info.sellTickerName,
                    buyTickerId: success_trade_info.buyTickerId,
                    buyTickerName: success_trade_info.buyTickerName,
                    percent: success_trade_info.percent
                  }
                  success_trade.accountId = buy_trade_info.accountId;
                  success_trade.status = 'success';
                  success_trade.reason = "Successfully Swap Trades."; 
                  trades.success.push(success_trade);
                  buy_trade_info.price = buy_result.price / buy_result.quantity;
                  buy_trade_info.orderQty = buy_result.quantity;
                  buy_trade_info.orderPercent = buy_result.percent;
                  buy_trade_info.tradeAmount = buy_trade_info.value;
                  
                  trades.successful_generated_trades.push(sell_trade_info);
                  trades.successful_generated_trades.push(buy_trade_info);
                }

                if(init_index == sell_trades_length)
                    resolve(trades);
                
              });   
            }
          });
        });
      }else{
        resolve(trades);
      }
    }
    catch(error){
      logger.error("Error in TickerSwapService.generate_trades_after_preferences(). \n Error :" + error);
      reject(error);
    }        
  });
}

/** 
* Insert Successful Trades After checking Preferences
**/
var insert_successful_trades;
TickerSwapService.prototype.insert_successful_trades = insert_successful_trades = function(data){
  return new Promise(function(resolve, reject) { 
    logger.info("Inserting Successful Trades!!!");
    if(data.trades.length > 0){
      commonDao.generateTrade(data, function (err, resp) {
        if(err)
          reject(err)
        else  
        resolve("Success");
      });
    }else{
      resolve("Success");
    }           
  });
}
module.exports = TickerSwapService;