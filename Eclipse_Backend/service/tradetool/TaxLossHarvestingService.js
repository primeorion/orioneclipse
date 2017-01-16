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
var taxLossHarvestingDao = new(require('dao/tradetool/TaxLossHarvestingDao.js'))();
var tradeToolCommonServices = new(require('service/tradeorder/CommonService.js'))();
var commonDao = new(require('dao/tradeorder/CommonDao.js'))();
var accountDao = new(require('dao/account/AccountDao.js'))();
var localCache = require('service/cache').local;
var TickerSwapService = new(require('service/tradetool/TickerSwapService.js'))();
var tickerSwapDao = new(require('dao/tradetool/TickerSwapDao.js'))();

var TaxLossHarvestingService = function () {};

/** 
* Create trades as per input and conditions specified by user
**/
TaxLossHarvestingService.prototype.createTrades = function(data, cb) {
  try{
    logger.info("TLH create trades service called."); 
    var session = localCache.get(data.reqId).session;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    data.portfolioAllAccess = session.portfolioAllAccess;

    accountDao.getSimpleAccountList(data, function (err, resp) {
      if(err){
        logger.error("Error in function TaxLossHarvestingService.createTrades. \n Error: " + error + ". \n Error STACK: " + error.stack);
          return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
        }
      else{
        logger.info("Account list returned successfully (getSimpleAccountList())");
        data.account_ids = _.map(resp, 'id');        
        taxLossHarvestingDao.createTrades(data, function(err, resp){
          if(err){
            logger.error("Error in function TaxLossHarvestingService.createTrades. \n Error: " + error + ". \n Error STACK: " + error.stack);
            return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
          }
          else{
            logger.info("Tax Loss Harvesting trades created successfully!!!");
            return cb(null, responseCodes.SUCCESS, resp);
          }          
        });
      }      
    });
  }
  catch(error){
    logger.error("Error in TaxLossHarvestingService.createTrades() in try-catch. \n Error :" + error);
    return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
  }
}

/** 
* Generate trades on user selected trades
**/
TaxLossHarvestingService.prototype.generateTrades = function(data, cb) {
  try{
    logger.info("TLH generate trades service called.");
    var output = {trades: []},
    trades;  
    return new Promise(function(resolve, reject) {
      // 
      arrangeTradesAccountWise(data.trades)
      .then(function(sorted_trades_detail){
        data.account_ids = _.uniq(sorted_trades_detail.accounts);
        data.sorted_trades = sorted_trades_detail.trades;
        // validating trades for insertion
        return validateTrades(data)
      })
      .then(function(valid_trades_result){
        output.trades.push(valid_trades_result.failed_trades);
        data.successful_trades = valid_trades_result.successful_trades;
        data.buy_security_ids = valid_trades_result.buy_security_ids;
        data.sell_security_ids = valid_trades_result.sell_security_ids;
        data.account_ids = valid_trades_result.account_ids;
        if(data.sell_security_ids.length > 0 ){
          // Get Security with all details in all accounts
          return taxLossHarvestingDao.getSecuritiesDetails(data);
        }
        else{          
          return cb(null, responseCodes.SUCCESS, output);
        }

      })
      .then(function(security_details){
        data.buy_security_details = security_details.buy_tickers_info;
        data.sell_security_details = security_details.sell_tickers_info;
        data.accounts_attached = security_details.account_attached;
        data.buy_security_ids = security_details.buy_tickers;
        data.sell_security_ids = security_details.sell_tickers;
        
        return updateTradesInformation(data);
      })
      .then(function(trades_before_preference){
        output.trades.push(trades_before_preference.failed_trades)
        data.trades_before_preference = trades_before_preference.successful_trades;
        return TickerSwapService.generateTradeInstanceId(data);
      })
      .then(function(tradeInstanceId){
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
        return TickerSwapService.insert_successful_trades(data);
      })
      .then(function(final_response){
        // Return Result
        return cb(null, responseCodes.SUCCESS, output);
      })     
      .catch(function(error){          
        logger.error("Error in function TaxLossHarvestingService.generateTrades. \n Error: " + error + ". \n Error STACK: " + error.stack);
        if(typeof(error) == 'string')
          return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
        else
          return cb(error[0], error[1]);
      })    
    });
  }
  catch(error){
    logger.error("Error in TaxLossHarvestingService.generateTrades() in try-catch. \n Error :" + error);
    return cb(error, responseCodes.INTERNAL_SERVER_ERROR);
  }
}

/** 
* Service to sort trades account wise
**/
var arrangeTradesAccountWise = function(trades){
  return new Promise(function(resolve, reject) {
    try{
      logger.info("TLH arranging trades account wise.");
      var sorted_trades_detail = {accounts: [], trades: {}};
      _.map(trades, function(trade){
        if(!(_.includes(sorted_trades_detail.accounts, trade.accountId))){
          sorted_trades_detail.accounts.push(trade.accountId);
          sorted_trades_detail.trades[trade.accountId] = [];
        }
        sorted_trades_detail.trades[trade.accountId].push(trade);
      });
      resolve(sorted_trades_detail);
    }catch(error){
      logger.error("Error while generating trade instance in function TaxLossHarvestingService.arrangeTradesAccountWise. \n Error: " + error);
      reject(error);
    }
  });
}

/** 
* Service to check validations of trades e.g. duplicate trade, vice-versa duplicate trades, irrelevant percent(< 0 OR > 100)
**/
var validateTrades = function(trades){
  return new Promise(function(resolve, reject) {
    try{
      logger.info("Validating Trades account wise.");
      var failed_trades = [], 
        successful_trades = [], 
        buy_security_ids = [],
        sell_security_ids = [],
        accounts_length = trades.account_ids.length,
        accountIds = [],
        init = 0;
      _.map(trades.account_ids, function(id){
        validateTradesAccountWise(trades.sorted_trades[id], function(err, result){
          init++;
          failed_trades.push(result.failed);
          successful_trades.push(result.success);
          sell_security_ids.push(result.sell_tickers);
          buy_security_ids.push(result.buy_tickers);
          if(result.account_id != null)
            accountIds.push(result.account_id);
          if(init == accounts_length){
            var trades = {
              failed_trades: _.flatten(failed_trades),
              successful_trades: _.flatten(successful_trades),
              buy_security_ids: _.pull(_.uniq(_.flatten(buy_security_ids)), -1),
              sell_security_ids: _.uniq(_.flatten(sell_security_ids)),
              account_ids: accountIds
            };
            resolve(trades);
          }
        });
      });
    }catch(error){
      logger.error("Error while generating trade instance in function TaxLossHarvestingService.validateTrades. \n Error: " + error);
      reject(error);
    }
  });
}

/** 
* Service to check validations of TLH trades account wise e.g. duplicate trade, vice-versa duplicate trades, irrelevant percent(< 0 OR > 100)
**/
var validateTradesAccountWise = function(trades, cb){
  try{
    logger.info("Checking Swap Trade Validations.");
    var swap_validated = {failed: [], success: [], sell_tickers: [], buy_tickers: [], sell_tickers_position: {}},
    ticker_info = {},
    tickers = [],
    duplicate_trades_index = [],
    reverse_duplicate_trade_index = [],
    total_percent_failed_trade_index = [],
    failed_index = [];
    _.map(trades, function(trade, index){        
      if(trade.percent <= 0){
        // delete(trade.percent);
        // trade.accountId = null;
        trade.status = 'failed';
        trade.reason = 'Selling percentage cannot be equal to or less than 0%.';
        swap_validated.failed.push(trade);
        failed_index.push(index);
      }
      else if(trade.percent > 100){
        // delete(trade.percent);
        // trade.accountId = null;
        trade.status = 'failed';
        trade.reason = 'Selling percentage cannot be more than 100%.';
        swap_validated.failed.push(trade);
        failed_index.push(index);
      }
      // else if(trade.buyPercent <= 0 && trade.buyTickerId != -1){
      //   // delete(trade.percent);
      //   // trade.accountId = null;
      //   trade.status = 'failed';
      //   trade.reason = 'Buying percentage cannot be equal to or less than 0%.';
      //   swap_validated.failed.push(trade);
      //   failed_index.push(index);
      // }
      // else if(trade.buyPercent > 100 && trade.buyTickerId != -1){
      //   // delete(trade.percent);
      //   // trade.accountId = null;
      //   trade.status = 'failed';
      //   trade.reason = 'Buying percentage cannot be more than 100%.';
      //   swap_validated.failed.push(trade);
      //   failed_index.push(index);
      // }
      else if(trade.sellTickerId == trade.buyTickerId){
        // delete(trade.percent);
        // trade.accountId = null;
        trade.status = 'failed';
        trade.reason = 'Same ticker selected for sell and buy.';
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
    
    _.map(trades, function(trade, index){
      if(_.includes(failed_index, index)){
        if(_.includes(duplicate_trades_index, index)){
          // delete(trade.percent);
          // trade.accountId = null;
          trade.status = 'failed';
          trade.reason = 'Duplicate Trades.';
          swap_validated.failed.push(trade);
        }
        else if(_.includes(reverse_duplicate_trade_index, index)){
          // delete(trade.percent);
          // trade.accountId = null;
          trade.status = 'failed';
          trade.reason = 'Vice Versa Trades. Selling security to buy a secuirty & again selling bought security to buy sold security.';
          swap_validated.failed.push(trade);
        }else if(_.includes(total_percent_failed_trade_index, index)){
          // delete(trade.percent);
          // trade.accountId = null;
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
    swap_validated.account_id = null;
    if(swap_validated.success.length > 0)
      swap_validated.account_id = trades[0].accountId;
    return cb(null, swap_validated);
  }catch(error){
    logger.error("Error while generating trade instance in function TaxLossHarvestingService.validateTradesAccountWise. \n Error: " + error);
    return cb(error);
  }
};

var updateTradesInformation = function(input){
  return new Promise(function(resolve, reject) {
    try{
      logger.info("Update trades information.");
      var trades = {
        failed: [],
        success: [],
        generated_trades: {sell: {}, buy: {}},
        successful_trade_index: []
      },
      ind = 0;
      
      _.map(data.successful_trades, function(trade){
        var message = null,
        sell_ticker_info = data.security_details[trade.sellTickerId];
        buy_ticker_info = data.security_details[trade.buyTickerId];

        if(sell_ticker_info == null || _.includes(data.accounts_attached[trade.sellTickerId], trade.accountId))
          message = "Trade doesn\'t qualify for conditions provided by you in this account .";       
        else if(trade.buyTickerId != -1 && buy_ticker_info == null)
          message = "Buy Security not found in system.";                       
        if(message == null){
          trade.success.push(trade);
          trades.generated_trades.sell = {
            accountId: trade.accountId,
            securityId: trade.sellSecurityId,
            action: 'sell',
            market_price: sell_ticker_info.sell_price,
            value: sell_ticker_info.quantity * (trade.percent / 100) * sell_ticker_info.sell_price,
            quantity: sell_ticker_info.quantity * (trade.percent / 100),
            index_at: ind,
            portfolioId: sell_ticker_info.portfolio_id,
            custodianId: sell_ticker_info.custodian_id,
            positionId: sell_ticker_info.position_id,
            isEnabled: 1,
            isSendImmediately: 0,
            tradeActionId: 2
          };
          trades.generated_trades.buy = {
            accountId: sell_ticker_info.account_id,
            securityId: trade.buyTickerId < 0 ? null : trade.buyTickerId,
            action: 'buy',
            market_price: buy_ticker_info.price,
            value: sell_ticker_info.quantity * (trade.percent / 100) * sell_ticker_info.sell_price,
            index_at: ind,
            quantity: (sell_ticker_info.quantity * (trade.percent / 100) * sell_ticker_info.sell_price) / buy_ticker_info.price,
            portfolioId: sell_ticker_info.portfolio_id,
            custodianId: sell_ticker_info.custodian_id,
            positionId: null,
            isEnabled: 1,
            isSendImmediately: 0,
            tradeActionId: 1 
          };
          trades.success.push(trade);
          trades.successful_trade_index.push(ind);
          ind++;
        }
        else{
          trade.status = 'failed';
          trade.reason = message;
          trades.failed.push(trade);          
        }
      });
    }
    catch(error){
      logger.error("Error while generating trade instance in function TaxLossHarvestingService.updateTradesInformation. \n Error: " + error);
      reject(error);
    }
  });
}

module.exports = TaxLossHarvestingService;