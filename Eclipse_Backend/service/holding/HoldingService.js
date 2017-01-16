"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);

var config = require('config');
var messages = config.messages;
var responseCode = config.responseCode;
var localCache = require('service/cache').local;
var HoldingDao = require('dao/holding/HoldingDao.js');
var holdingDao = new HoldingDao();
var AllHoldingResponse = require("model/holding/AllHoldingResponse.js");
var HoldingConverter = require("converter/holding/HoldingConverter.js");
var holdingConverter = new HoldingConverter();
var HoldingService = function () { };

HoldingService.prototype.getSearchHoldingDetail = function (data, cb) {

    logger.info("Get holding list service called (getSearchHoldingDetail())");
    holdingDao.getSearchHoldingDetail(data, function (err, fetched) {
        if (err) {
            logger.error("Getting holding list (getSearchHoldingDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Preparing holding list for UI (getSearchHoldingDetail())");
        holdingConverter.getHoldingSearchResponse(fetched, function (err, result) {

            logger.info("Holding list returned successfully (getSearchHoldingDetail())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};

HoldingService.prototype.getAccAndPortWithHoldingValue = function (data, cb) {

    logger.info("Get holding list service called (getAccAndPortWithHoldingValue())");
    holdingDao.getAccAndPortWithHoldingValue(data, function (err, fetched) {
        if (err) {
            logger.error("Getting holding list (getAccAndPortWithHoldingValue())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing holding list for UI (getAccAndPortWithHoldingValue())");
            holdingConverter.getAccAndPortWithHoldingValue(fetched, function (err, result) {

                logger.info("Holding list returned successfully (getAccAndPortWithHoldingValue())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

HoldingService.prototype.getHoldingDetail = function (data, cb) {
    logger.info("Get holding details service called (getHoldingDetail())");
    holdingDao.getHoldingDetail(data, function (err, fetched) {
        if (err) {
            logger.error("Getting holding detail (getHoldingDetail())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        } if (fetched.length > 0) {
            logger.info("Preparing holding  for UI (getHoldingDetail())");
            holdingConverter.getHoldingDetailToResponse(fetched, function (err, result) {
                if (result.length > 1) {
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    return cb(null, responseCode.SUCCESS, result[0]);
                }
            });
        } else {
            logger.info("holding  detail not found (getHoldingDetail())" + data.id);
            return cb(messages.holdingNotFound, responseCode.NOT_FOUND);
        }
    });
};


HoldingService.prototype.getHoldingByPortId = function (data, cb) {

    logger.info("Get holding list service called (getHoldingByPortId())");
    holdingDao.getHoldingByPortId(data, function (err, fetched) {
        if (err) {
            logger.error("Getting holding list (getHoldingByPortId())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing holding list for UI (getHoldingByPortId())");
            holdingConverter.getAllHoldingToResponse(fetched, function (err, result) {

                logger.info("Holding list returned successfully (getHoldingByPortId())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

HoldingService.prototype.getHoldingTransactions = function (data, cb) {

    logger.info("Get holding transaction list service called (getHoldingTransactions())");
    holdingDao.getHoldingTransactions(data, function (err, fetched) {
        if (err) {
            logger.error("Getting transaction holding list (getHoldingTransactions())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing  transaction holding list for UI (getHoldingTransactions())");
            holdingConverter.getHoldingTransactionsResponse(fetched, function (err, result) {

                logger.info("Holding transaction list returned successfully (getHoldingTransactions())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

HoldingService.prototype.getHoldingTaxlots = function (data, cb) {

    logger.info("Get holding list service called (getHoldingTaxlots())");
    holdingDao.getHoldingTaxlots(data, function (err, fetched) {
        if (err) {
            logger.error("Getting holding list (getHoldingTaxlots())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing holding list for UI (getHoldingTaxlots())");
            holdingConverter.getHoldingTaxlotsResponse(fetched, function (err, result) {

                logger.info("Holding list returned successfully (getHoldingTaxlots())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

HoldingService.prototype.getHoldingFilters = function (data, cb) {
    logger.info("Get holding filter service called (getHoldingFilters())");
    holdingDao.getHoldingFilters(data, function (err, result) {
        if (err) {
            logger.error("Error in getting holding filter (getHoldingFilters())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.length > 0) {
            logger.info("Holding filter service returned successfully (getHoldingFilters())");
            return cb(null, responseCode.SUCCESS, result);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

HoldingService.prototype.getHoldingByAccountId = function (data, cb) {

    logger.info("Get holding list service called (getHoldingByAccountId())");
    holdingDao.getHoldingByAccountId(data, function (err, fetched) {
        if (err) {
            logger.error("Getting holding list (getHoldingByAccountId())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing holding list for UI (getHoldingByAccountId())");
            holdingConverter.getAllHoldingToResponse(fetched, function (err, result) {

                logger.info("Holding list returned successfully (getHoldingByAccountId())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};


// HoldingService.prototype.getAccAndPortWithHoldingValue = function (data, cb) {

//     logger.info("Get holding list service called (getAccAndPortWithHoldingValue())");
//     holdingDao.getAccAndPortWithHoldingValue(data, function (err, fetched) {
//         if (err) {
//             logger.error("Getting holding list (getAccAndPortWithHoldingValue())" + err);
//             return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         if (fetched.length > 0) {
//             logger.info("Preparing holding list for UI (getAccAndPortWithHoldingValue())");
//             holdingConverter.getAccAndPortWithHoldingValue(fetched, function (err, result) {

//                 logger.info("Holding returned successfully (getAccAndPortWithHoldingValue())");
//                 return cb(null, responseCode.SUCCESS, result);
//             });
//         }
//         else {
//             return cb(null, responseCode.SUCCESS, []);
//         }
//     });
// };

module.exports = HoldingService;
