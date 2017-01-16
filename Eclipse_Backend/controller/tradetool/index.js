"use strict";
var app = require('express')();

app.use('/globaltrades',require('./GlobalTradesController.js'));
app.use('/cashneeds',require('./CashNeedTradesController.js'));
app.use('/tradeInstance',require('./TradeInstanceController.js'));
app.use('/tickerswap',require('./TickerSwapController.js'));
app.use('/proratedcash',require('./ProratedCashTradesController.js'));
app.use('/tradetotarget',require('./TradeToTargetController.js'));
app.use('/spendcash',require('./SpendCashTradesController.js'));
app.use('/raisecash',require('./RaiseCashTradesController.js'));
app.use('/',require('./CommonTradesController.js'));
app.use('/tacticaltradetool',require('./TacticalTradeToolController.js'));
app.use('/taxLossHarvesting',require('./TaxLossHarvestingController.js'));

module.exports = app;
