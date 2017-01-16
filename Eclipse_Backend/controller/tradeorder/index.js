"use strict";
var app = require('express')();

app.use('/trades',require('./TradeController.js'));
app.use('/tradefiles',require('./TradeFilesController.js'));
app.use('/',require('./TradeImportController.js'));
module.exports = app;
