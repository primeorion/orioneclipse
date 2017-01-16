"use strict";

var moduleName = __filename;
var TradeDao = require('dao/tradeorder/TradeDao.js');
var tradeDao = new TradeDao();
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var messages = config.messages;
var responseCodes = config.responseCode;
var TradeOrderConverter = require("converter/tradeorder/TradeOrderConverter.js");
var TradeMessageOrderConvertor = require("converter/tradeorder/TradeMessageOrderConvertor.js");
var localCache = require('service/cache').local;
var TradeService =  function() {}
var tradeOrderConverter = new TradeOrderConverter();
var tradeMessageOrderConvertor = new TradeMessageOrderConvertor();
var helper = require("helper");
var asyncFor = helper.asyncFor;
var util = require('util');
var enums = config.applicationEnum;
var TradeFilesService = require('service/tradeorder/TradeFilesService.js');
var tradeFilesService = new TradeFilesService();
var CommonService = require('service/tradeorder/CommonService.js');
var commonService = new CommonService();
var RebalanceService = require('service/rebalancer/RebalanceService.js');
var rebalanceService = new RebalanceService();
var SpendCashTradeService = require('service/tradetool/SpendCashTradeService.js');
var spendCashTradeService = new SpendCashTradeService();
var accountType=config.orionConstants.accounts;
var RaiseCashTradeService = require('service/tradetool/RaiseCashTradeService.js');
var raiseCashTradeService = new RaiseCashTradeService();

TradeService.prototype.getTradeExecutionTypeList = function (data, cb) {
	logger.info("Get trade execution type list service called (getTradeExecutionTypeList())");
    tradeDao.getTradeExecutionTypeList(data, function (err, result) {
        if (err) {
            logger.error("Error in getting trade execution type list (getTradeExecutionTypeList())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.info("Trade executionType list returned successfully (getTradeExecutionTypeList())");
        return cb(null, responseCodes.SUCCESS, result);
    });
};
TradeService.prototype.getTradeListByPortfolio = function (data, cb) {
	logger.info("Get trade list by portfolio service called (getTradeListByPortfolio())");
    tradeDao.getTradeListByPortfolio(data, function (err, result) {
        if (err) {
            logger.error("Error in getting trade  list (getTradeListByPortfolio())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, responseCodes.SUCCESS, result);
    });
};


TradeService.prototype.getList = function (data, cb) {
    logger.info("Get Trades list service called (getList())");
    tradeDao.getList(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting trades list (getList())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            tradeOrderConverter.getResponseOfTradeList(fetched, function (err, result) {
                if (err) {
                    logger.error("Error in getting trades list (getList())" + err);
                    return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                }
                logger.info("trades List returned successfully (getList())");
                return cb(null, responseCodes.SUCCESS, result);
            });
        } else {
            logger.info("Empty trades List returned (getList())");
            return cb(null, responseCodes.SUCCESS, []);
        }
        // logger.info("Portfolios List returned successfully (getList())");
        // return cb(null, responseCode.SUCCESS, result);
    });
};

TradeService.prototype.getCountOfTrades = function (data, cb) {
    logger.info("Get Total no. of Trades service called (getCountOfTrades())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    tradeDao.getCountOfTrades(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting trades list (getList())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched.length > 0) {
                logger.info("trades List returned successfully (getList())");
                return cb(null, responseCodes.SUCCESS, fetched[0]);
        } else {
            logger.info("Empty trades List returned (getList())");
            return cb(null, responseCodes.SUCCESS, []);
        }
    });
};

TradeService.prototype.enableTrades = function (data, cb) {
    logger.info("Enable trades service called (enableTrades())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    data.isEnabled = true;
    tradeDao.toggleIsEnabled(data, function (err, fetched) {
        if (err) {
            logger.error("Error in enabling trades (enableTrades())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Trades enabled successfully (enableTrades())");
                if(data.tradeIds && fetched.affectedRows == data.tradeIds.length){
                    return cb(null, responseCodes.SUCCESS, {"message":messages.tradeEnableSuccess});
                }
                else {
                    return cb(null, responseCodes.SUCCESS, {"message":messages.tradesEnableWarning});
                }
        }
    });
};

TradeService.prototype.disableTrades = function (data, cb) {
    logger.info("Disable trades service called (disableTrades())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    data.isEnabled = false;
    tradeDao.toggleIsEnabled(data, function (err, fetched) {
        if (err) {
            logger.error("Error in disabling trades (disableTrades())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        
        else {
                logger.info("Trades disabled successfully (disableTrades())");
                if(data.tradeIds && fetched.affectedRows == data.tradeIds.length) {
                    return cb(null, responseCodes.SUCCESS, {"message":messages.tradeDisableSuccess});
                }
                else {
                    return cb(null, responseCodes.SUCCESS, {"message":messages.tradesDisableWarning});
                }
        } 
    });
};
TradeService.prototype.getTradeDetail = function(data, cb) {
    logger.info("Get trade service called (getTradeDetail())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    var self= this;
    self.checkTrade(data, function(err, result, status){
        if(err){
              logger.error("Error in lodaing trades (getTradeDetail())" + err);
               return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if(status == responseCodes.EXISTS){
            tradeDao.getTradeDetail(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in lodaing trades (getTradeDetail())" + err);
                    return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                }
                else {
                    if (fetched) {
                        tradeOrderConverter.getTradeDetail(fetched, function (err, result) {
                            if (err) {
                                logger.error("Error in getting trades detail (getTradeDetail())" + err);
                                return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                            logger.info("Trade loaded successfully (getTradeDetail())");
                            return cb(null, responseCodes.SUCCESS, result);
                        });
                    }
                    else { 
                        return cb(null, responseCodes.SUCCESS, {});

                    }
                } 
            });
         }
         else {
            return cb(err, status, {"message": result});
        }   
      });

}

TradeService.prototype.validateTrade = function(data, cb){
    var self = this;
    self.getJsonForTradePrefrence(data, function(err, result){
        commonService.generateTradeOrder(data, function(err, status, response){
            if(err) {
                    return cb(err, status, response);
            }  
            if(response.trades && response.trades.length>0){
                    var jsonOutPut = {};
                    jsonOutPut.message = "Trades valid";
                    jsonOutPut.tradeAmount = response.trades[0].tradeAmount;
                    jsonOutPut.cashValuePostTrade = response.trades[0].cashValuePostTrade;
                    jsonOutPut.warningMessage = response.trades[0].warningMessage;
                    return cb(null, responseCodes.SUCCESS, jsonOutPut);
            }else{
                    return cb("No Trade to genrate",responseCodes.SUCCESS, []);
            }   
        });
    });
}

TradeService.prototype.saveTrade = function(data, cb) {
    logger.info("Save trade service called (getTradeDetail())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    var self = this;
    if(data.actionId == enums.TRADE_ORDER.ACTION.BUY || data.actionId == enums.TRADE_ORDER.ACTION.SELL
            || data.actionId == enums.TRADE_ORDER.ACTION.LIQUIDATE || data.actionId == enums.TRADE_ORDER.ACTION.BUY_REBALANCE ||
            data.actionId == enums.TRADE_ORDER.ACTION.SELL_REBALANCE) {
       if(data.accountId || data.portfolioId){
            if(data.actionId == enums.TRADE_ORDER.ACTION.BUY || data.actionId == enums.TRADE_ORDER.ACTION.SELL
            || data.actionId == enums.TRADE_ORDER.ACTION.LIQUIDATE){
                self.getJsonForTradePrefrence(data, function(err, result){
                    commonService.generateQuickTrade(result, function (err, status, fetched) {
                        if(err){
                            logger.error(err);
                            return cb(err, status);
                        }
                        if(!err){
                            data.tradeIds = [];
                            data.tradeIds.push(data.id);
                            data.approvalStatusId = enums.TRADE_ORDER.APPROVAL_TYPE.APPROVED;
                            if(!enums.TRADE_ORDER.ACTION.LIQUIDATE && data.isSendImmediately){
                                self.setApprovalStatus(data, function(err, status, result) {
                                        return cb(err, status, result);
                                });
                            }
                            else {
                                return cb(err, status, fetched);
                            }
                        }
                        else{
                            return cb(err, status, fetched);
                        }
                    });
                });
            }
            
            else if(data.accountId && data.actionId == enums.TRADE_ORDER.ACTION.BUY_REBALANCE) {
                    data.methodId = enums.SPEND_CASH.METHOD_ID.BUY_REBALANCE
                    self.createJsonForBuyANDSellRebalance(data, function(response){
                        data.spendCash = response;
                        spendCashTradeService.spendCashRebalance(data, function(err, status, result){
                            if(err){
                                logger.error("Error during spend cash in quick trade");
                                return cb(err, status);    
                            }
                            return cb(err, status, result);
                        });    
                    })
                    
            }

            else if(data.accountId && data.actionId == enums.TRADE_ORDER.ACTION.SELL_REBALANCE) {
                  data.methodId = enums.SPEND_CASH.METHOD_ID.SELL_REBALANCE
                    self.createJsonForBuyANDSellRebalance(data, function(response){
                            data.raiseCash = response;
                        raiseCashTradeService.raiseCashRebalance(data, function(err, status, result){
                            if(err){
                                logger.error("Error during raise cash in quick trade");
                                return cb(err, status);    
                            }
                            return cb(err, status, result);
                        });    
                    })
            }
            else {
                 return cb(messages.invalidAction, responseCodes.BAD_REQUEST );
            }

       }
       else {
           return cb( messages.missingParameters+" accountId or portfolioId", responseCodes.BAD_REQUEST);
       }
    }
    
    
    else if(data.actionId == enums.TRADE_ORDER.ACTION.REBALANCE){
        if(data.portfolioId){    
            logger.info("Trade generate by rebalance")
            rebalanceService.generateTradeByRebalancer(data, function(err, status, result){
                if(err){
                    logger.error(err);
                    return cb(err, status);        
                }
                else {
                    logger.info("get response from rebalance");
                    return cb(err, status, result);
                }
            });
        }
    
        else {
             return cb(messages.invalidPortfolio, responseCodes.BAD_REQUEST );
        }
    }
    else {
        logger.error("Invalid action")
        return cb(messages.invalidAction, responseCodes.BAD_REQUEST);
    }
}

TradeService.prototype.createJsonForBuyANDSellRebalance = function(data, cb){
        var responseObject = {};
        responseObject.selectedMethodId = data.selectedMethodId;
        responseObject.spendFullAmount = false;
        responseObject.filterType = accountType;
        responseObject.reason = "Generate trade using buy or sell rebalance";
        responseObject.accounts = [];
        var account = {};
        account.id = data.accountId;
        account.amount = data.dollarAmount;
        responseObject.accounts.push(account);   
        return cb(responseObject); 
};

TradeService.prototype.getJsonForTradePrefrence = function(data, cb){
    data.actionProperties = {};
    if(data.accountId) {
        data.typeId = 1;
        data.id = data.accountId;
       // data.accountId = null;
    }
    else if(data.portfolioId) {
        data.typeId = 2;
        data.id = data.portfolioId;
       // data.portfolioId = null;
    }
    if(data.dollarAmount != undefined) {
        data.actionProperties.typeId = 1;
        data.actionProperties.value = data.dollarAmount;
    }
    else if(data.quantity != undefined) {
        data.actionProperties.typeId = 2;
        data.actionProperties.value = data.quantity;
    }
    else if(data.percentage != undefined){
        data.actionProperties.typeId = 3;
        data.actionProperties.value = data.percentage;
    }
    data.sendTradesImmediate = data.isSendImmediately;
    return cb(null, data);
}

TradeService.prototype.updateSomeFieldsOfTrade = function(data, cb) {
    logger.info("update trade some fields service called (updateSomeFieldsOfTrade())");
      if(data.holdUntil || data.clientDirected!=undefined || data.settlementTypeId){
        tradeDao.updateSomeFieldsOfTrade(data, function (err, fetched) {
            if (err) {
                logger.error("Error in lodaing trades (getTradeDetail())" + err);
                return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
            }
            else if(fetched.affectedRows==0) {
                return cb(messages.tradeCannotEdit, responseCodes.BAD_REQUEST);
            }
            
           
            return cb(null, responseCodes.SUCCESS, {"message": data.type+" updated successfully"});
           
         });
      }
      else{
          return cb(null, responseCodes.BAD_REQUEST, { "message": messages.badRequest });
      }

}
TradeService.prototype.updateTrade = function(data, cb) {
    logger.info("Get trade service called (getTradeDetail())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    var self = this;
    data.id = data.tradeId;
    tradeDao.getMinimumTradeInfo(data, function(err, result){
         if(err){
              logger.error("Error in lodaing trades (getTradeDetail())" + err);
               return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if(result && result.length>0){
            data.accountId = result[0].accountId;
            data.securityId = result[0].securityId;
            data.dollarAmount = data.price;
            data.quantity = data.orderQty;
           /* self.getJsonForTradePrefrence(data, function(err, result){
                if(err){
                     return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                }
                commonService.generateTradeOrder(data, function(err, status, response){
                    if(err) {
                            return cb(err, status, response);
                    }  
                    if(response.trades && response.trades.length>0){
                 */       tradeOrderConverter.getTradeDetailEntity(data, function (err, result) {
                            if (err) {
                                logger.error("Error in getting trades detail (getTradeDetail())" + err);
                                return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                            }
                            data.trade = result;
                            tradeDao.updateTrade(data, function (err, fetched) {
                                if (err) {
                                    logger.error("Error in lodaing trades (getTradeDetail())" + err);
                                    return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                                }
                                else if(fetched.affectedRows==0) {
                                    return cb(messages.tradeCannotEdit, responseCodes.BAD_REQUEST);
                                }
                                data.tradeIds = [];
                                data.tradeIds.push(data.id);
                                data.approvalStatusId = enums.TRADE_ORDER.APPROVAL_TYPE.APPROVED;
                                if(data.isSendImmediately){
                                    self.setApprovalStatus(data, function(err, status, result){
                                        if(err) {
                                            return cb(err, status, result);
                                        }
                                        self.getTradeDetail(data, function(err, status, result){
                                                if(err) {
                                                        return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                                                } 
                                                
                                                return cb(null, status, result);
                                            });
                                        });
                                }
                                else{
                                     self.getTradeDetail(data, function(err, status, result){
                                            if(err) {
                                                    return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                                            } 
                                            
                                            return cb(null, status, result);
                                        });
                                }
                           });
                            
                    });
                    }else{
                            return cb(err, responseCodes.ALREADY_DELETED, {"message": messages.tradeNotFoudOrDeleted});
                    }
                }); 
          //});
        //}
        /*else {
             return cb(err, responseCodes.ALREADY_DELETED, {"message": messages.tradeNotFoudOrDeleted});
        }*/
    //});
}
TradeService.prototype.deleteTrades = function (data, cb) {
    logger.info("Delete trades service called (deleteTrades())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    var self = this;
    self.checkForTradeExistence(data, function(err, result, status){
        if(status == responseCodes.EXISTS){
            tradeDao.deleteTrades(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in deleting trades (deleteTrades())" + err);
                    return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                }
                else {
                        logger.info("Trades deleted successfully (deleteTrades())");
                        return cb(null, responseCodes.SUCCESS, {"message":messages.tradeDeleteSuccess});
                } 
            });
        }
        else {
            return cb(err, status, {"message": result});
        }
    });
   
};
 
 TradeService.prototype.deleteZeroQuantityTrades = function (data, cb) {
    logger.info("Delete zero quantity trades service called (deleteZeroQuantityTrades())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    tradeDao.deleteZeroQuantityTrades(data, function (err, fetched) {
        if (err) {
            logger.error("Error in deleting trades (deleteTrades())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Trades deleted successfully (deleteTrades())");
                return cb(null, responseCodes.SUCCESS, {"message":messages.tradeDeleteSuccess});
        } 
    });   
};
TradeService.prototype.checkForTradeExistence = function(data, cb){
	  var self = this;
      if(data.tradeIds) {
        data.id = data.tradeIds[0];
		self.checkTrade(data, function(err, result, status){
            return cb(err, result, status);
        });
      }
      else {
          return cb(null, messages.tradeExists, responseCodes.EXISTS);
      }		
};
TradeService.prototype.checkTrade = function(data, cb){
    tradeDao.isTradeExist(data, function(err, result){
        if(err){
            logger.error(err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        logger.debug("the result i got here is"+JSON.stringify(result));
        if(result && result.length>0){
            return cb(err, messages.tradeExists, responseCodes.EXISTS);
        
        }else{
            return cb(err, messages.tradeNotFoudOrDeleted, responseCodes.ALREADY_DELETED);
        }
    });  
};
	
TradeService.prototype.getOrderTypes = function (data, cb) {
    logger.info("Get orderTypes service called (getOrderTypes())");
    tradeDao.getOrderTypes(data, function (err, fetched) {
        if (err) {
            logger.error("Error in loading orderTypes (getOrderTypes())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Order types load successfully (getOrderTypes())");
                return cb(null, responseCodes.SUCCESS, fetched);
        } 
    });
};
TradeService.prototype.getQualifiers = function (data, cb) {
    logger.info("Get qualifiers service called (getQualifiers())");
    tradeDao.getQualifiers(data, function (err, fetched) {
        if (err) {
            logger.error("Error in loading qualifiers (getQualifiers())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Qualifiers loaded successfully (getQualifiers())");
                return cb(null, responseCodes.SUCCESS, fetched);
        } 
    });
};
TradeService.prototype.getDurations = function (data, cb) {
    logger.info("Get durations service called (getDurations())");
    tradeDao.getDurations(data, function (err, fetched) {
        if (err) {
            logger.error("Error in loading durations (getDurations())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Durations loaded successfully (getDurations())");
                return cb(null, responseCodes.SUCCESS, fetched);
        } 
    });
};
TradeService.prototype.getActions = function (data, cb) {
    logger.info("Get actions service called (getActions())");
    tradeDao.getActions(data, function (err, fetched) {
        if (err) {
            logger.error("Error in loading actions (getActions())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Action loaded successfully (getActions())");
                return cb(null, responseCodes.SUCCESS, fetched);
        } 
    });
};

TradeService.prototype.getTradeActions = function (data, cb) {
    logger.info("Get trade actions service called (getActions())");
    tradeDao.getTradeActions(data, function (err, fetched) {
        if (err) {
            logger.error("Error in loading trade actions (getActions())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Trade action loaded successfully (getActions())");
                return cb(null, responseCodes.SUCCESS, fetched);
        } 
    });
};

TradeService.prototype.getSettlementTypes = function (data, cb) {
    logger.info("Get settlement type service called (getSettlementTypes())");
    tradeDao.getSettlementTypes(data, function (err, fetched) {
        if (err) {
            logger.error("Error in loading settlement type (getSettlementTypes())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Settlement type loaded successfully (getSettlementTypes())");
                return cb(null, responseCodes.SUCCESS, fetched);
        } 
    });
};

TradeService.prototype.processTrades = function(data, cb) {
    logger.info("Process trades service called (processTrades())");
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    var responseArray = [];
    var self = this;
    self.processTradeOrders(data, function(err, fetched) {
        responseArray = fetched.responseArray;
        // console.log(fetched);
        data.custodianMap = fetched.custodianMap;
        // console.log("%%%%%%%%%%%%%%%%%%%" + util.inspect(fetched, false, null));
        tradeFilesService.generateTradeFiles(data, function(err, response) {
            if (err) {
                logger.error(err);
                return cb(err);
            }
            logger.debug("Trade Files generated successfully ");
            // logger.debug("Trade Files generated successfully : "+util.inspect(response));
        });
        // generate files(data.custodianMap)
        return cb(null, responseCodes.SUCCESS, responseArray);
    });
    //generateTradeFiles();

};

TradeService.prototype.processTradeOrders = function(data, cb){
    logger.info("Processing Trades");
    tradeDao.getTradeForProcess(data, function (err, fetched) {
       if(fetched && fetched.length>0) {
           data.custodianMap = {};
           data.responseArray = [];
           var fixedType = "FIX DIRECT";
           var securityType = "MUTUAL FUND";
           asyncFor(fetched , function(trade, index, next){
                trade.hasBlock = true;
                trade.blockId = 1;  
                if(trade.tradeExecutionType == fixedType && trade.securityType == securityType) {
                    trade.allocationStatusId = 2;
                    trade.orderStatusId = 2
                }
                else if(trade.tradeExecutionType == fixedType && trade.securityType != securityType) {
                    trade.allocationStatusId = 1;
                    trade.orderStatusId = 1
                }
                
                else if(trade.tradeExecutionType != fixedType) {
                    data.custodianMap[trade.tradeExecutionTypeId] = data.custodianMap[trade.tradeExecutionTypeId] || [];
                    data.custodianMap[trade.tradeExecutionTypeId].push(trade);
                    trade.allocationStatusId = 3;
                    trade.orderStatusId = 4;
                }
                data.trade = trade;
                tradeDao.processTrade(data, function (err, result) {
                    if (err) {
                        logger.error("Error in processed trades (processTrades())" + err);
                        return next(err);
                    }
                    else {
                            logger.info("Trades processed successfully (processTrades())");
                            data.responseArray.push(trade.id);
                            next(null, result);
                    }
                });
                
            }, function(err, returnedData){
                logger.info("processed trade ids:"+ data.responseArray);
                cb(null, data);
            });
       }
       else {
             logger.info("Trades processed");
            return cb(null, data);
       }
     });
}

TradeService.prototype.getTradeApprovalStatus = function (data, cb) {
    var self = this;
    logger.info("Get trade approval status service called (getTradeApprovalStatus())");
    tradeDao.getTradeApprovalStatus(data, function (err, fetched) {
        if (err) {
            logger.error("Error in Get trade approval status (getTradeApprovalStatus())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Trade approval status Get successfully (getTradeApprovalStatus())");
                if(fetched.length > 0 && fetched[fetched.length-1].approvedStatusId == null){
                    fetched.splice(fetched.length-1)
                }
                return cb(null, responseCodes.SUCCESS, fetched);
            }
    });
};

TradeService.prototype.getTradePrivileges = function (data, cb) {
    logger.info("Get trade approval status service called (getTradeApprovalStatus())");
    tradeDao.getTradePrivileges(data, function (err, fetched) {
        if (err) {
            logger.error("Error in Get trade approval status (getTradeApprovalStatus())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Trade approval status Get successfully (getTradeApprovalStatus())");
                return cb(null, fetched);
        } 
    });
};

TradeService.prototype.setApprovalStatus = function (data, cb) {
    logger.info("Set approve service called setApprovalStatus()")
    var session = localCache.get(data.reqId).session;
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    var self = this;
    var approvedTradeIds = [];
    if(data.tradeIds && data.tradeIds.length>0){
        self.getTradeApprovalPrivilagesForUser(data, function(err, status, result){
            if(err){
                logger.error("error while getting trade privilages "+err);
                return cb(err, status);
            }
            if(result && result.length>0) {
            asyncFor(result, function(row, index, next) {
                    var isApproveAccess = false;
                    var approvalStatus;
                
                    if(data.approvalStatusId == 1 && row.isTradeAccessible){
                        isApproveAccess = true;
                        approvalStatus = data.approvalStatusId;
                    }
                    else if(data.approvalStatusId != 1) {
                        isApproveAccess = true;
                        approvalStatus = data.approvalStatusId;
                        if(data.approvalStatusId == 4 || data.approvalStatusId == 5 && row.isTradeAccessible){
                            approvalStatus = 1;
                        }
                    }
                    if(isApproveAccess) {
                        data.id = row.tradeId;
                        data.approvalStatus = approvalStatus;
                        tradeDao.approveTrade(data, function (err, fetched) {
                            if (err) {
                                logger.error("Error in approving trades (getTradeDetail())" + err);
                                //return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                                return cb(err);
                            }
                            else {
                                logger.info("Trade approved Successfully: " + data.id);
                                approvedTradeIds.push(row.tradeId);
                                next(null, row);
                                //return cb(null, status, result);
                            
                            } 
                        });
                    }
                    else {
                            next();
                        
                    }
                }, function(err, result){
                    data.approvedTradeIds = approvedTradeIds;
                    if(approvedTradeIds.length > 0){
                        self.sendImediateTradesToProcess(data, function(err, status, response){
                            if(err){
                                 cb(err, responseCodes.INTERNAL_SERVER_ERROR);   
                            }
                                cb(null, responseCodes.SUCCESS, approvedTradeIds);  
                        })
                    }
                    else{
                        cb(null, responseCodes.SUCCESS, approvedTradeIds);
                    }
                });
            }
            else {
                return cb(null, responseCodes.UNPROCESSABLE, {"message": messages.tradePermissionNotFound});
            }
        });
    }
    else {
         return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " tradIds" });
    }
};

TradeService.prototype.sendImediateTradesToProcess = function(data,cb){
    var self = this;
    tradeDao.getTradeToSendImediate(data, function(err, response){
        if(err){
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        if(response && response.length>0){
            data.tradeIds = [];
            response.forEach(function(tradeObject) {
                   data.tradeIds.push(tradeObject.id);
            });
            self.processTrades(data, function(err, status, response){
                cb(err, status, response);
            })
        }
        else {
            cb(err, responseCodes.SUCCESS, data.approvedTradeIds);
        }
    });
}

TradeService.prototype.getTradeApprovalPrivilagesForUser = function(data,cb){
     tradeDao.getTradeApprovalPrivilagesForUser(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in approving trades (getTradeDetail())" + err);
                    return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                }
                else {
                       return cb(null, responseCodes.SUCCESS, fetched);
                } 
            });
};


TradeService.prototype.getModelsByTrades = function (data, cb) {
    var self = this;
    logger.info("Get trade approval status service called (getTradeApprovalStatus())");
    tradeDao.getModelsByTrades(data, function (err, fetched) {
        if (err) {
            logger.error("Error in Get trade approval status (getTradeApprovalStatus())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info("Trade approval status get successfully (getTradeApprovalStatus())");
                   return cb(null, responseCodes.SUCCESS, fetched);
            }
    });
};

TradeService.prototype.getTradeOrderMessages = function (data, cb) {
    logger.info("Get trade order messages service called (getTradeOrderMessages())");
    tradeDao.getTradeOrderMessages(data, function (err, fetched) {
        if (err) {
            logger.error("Error in Get trade order messages (getTradeOrderMessages())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
               tradeMessageOrderConvertor.getResponseFromEntity(fetched, function(err, result){
                 if(err){
                      logger.error("Error in Get trade order messages (getTradeOrderMessages())" + err);
                      return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
                 }   
                 logger.info("Trade order messages get successfully (getTradeOrderMessages())");
                 return cb(null, responseCodes.SUCCESS, result);
               });
                
            }
    });
};

TradeService.prototype.checkDuplicateTrade = function(data, cb) {
    logger.info("Check duplicate trades service called (checkDuplicateTrade())");
    tradeDao.checkDuplicateTrade(data, function (err, fetched) {
        if (err) {
            logger.error("Error in Check duplicate trades (checkDuplicateTrade())" + err);
            return cb(err, responseCodes.INTERNAL_SERVER_ERROR);
        }
        else {
                logger.info(" Check duplicate trades successfully (checkDuplicateTrade())");
                   return cb(null, responseCodes.SUCCESS, fetched);
            }
    });
}
module.exports = TradeService;