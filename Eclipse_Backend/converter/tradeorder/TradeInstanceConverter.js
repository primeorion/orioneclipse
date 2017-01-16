    "use strict";

var moduleName = __filename;

var config = require('config');
var TradeInstanceConverter = function () { }

TradeInstanceConverter.prototype.getEntity = function (data, cb) {
    logger.debug("Converting data to trade data entity in getTradeDetailEntity()");
    var tradeInstanceEntity = {};
    var tradeInstance = data.tradeInstance;
    tradeInstanceEntity.description = tradeInstance.description ? tradeInstance.description : null;
    tradeInstanceEntity.tradingAppId = tradeInstance.tradingAppId;
    tradeInstanceEntity.notes = tradeInstance.notes ? tradeInstance.notes : null;
    return cb(null, tradeInstanceEntity);
};

module.exports = TradeInstanceConverter;
