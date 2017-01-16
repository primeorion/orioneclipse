"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var HoldingDashBoardResponse = require("model/dashboard/HoldingDashBoardResponse.js");
var TopTenHoldingResponse = require("model/dashboard/TopTenHoldingResponse.js");

var util = require('util');
var messages = config.messages;
var logger = helper.logger(moduleName);

var HoldingDashboardConverter = function () { }

HoldingDashboardConverter.prototype.getDashboardResponseModel = function (data, cb) {
    if (data.length > 1) {
        logger.debug("Converting data to Holding dashboard in getDashboardResponseModel()");

        var value = data[0][0] ? data[0][0] : [];
        var holdings = data[1][0] ? data[1][0] : [];
        var bars = data[2][0] ? data[2][0] : [];
        var topTenHoldingsDetail = data[3];//[i] ? data[3][i] : [];
        var issues = data[5][0] ? data[5][0] : [];
        var dateTimeVal = data[4][0] ? data[4][0] : '2000-00-30T06:19:20.000Z';
        var holdingDashBoardResponse = new HoldingDashBoardResponse();
        var dateTime = null;

        holdingDashBoardResponse.dateTime = dateTimeVal.dateTime;

        holdingDashBoardResponse.value = {};
        holdingDashBoardResponse.value.total = value.total ? value.total : 0;
        holdingDashBoardResponse.value.changeValueAmount = value.changeValueAmount ? value.changeValueAmount : 0;
        holdingDashBoardResponse.value.changeValuePercent = value.changeValuePercent ? value.changeValuePercent : 0;
        holdingDashBoardResponse.value.status = value.changeValueStatus ? value.changeValueStatus : null;

        holdingDashBoardResponse.holdings = {};
        holdingDashBoardResponse.holdings.total = holdings.total ? holdings.total : 0;
        holdingDashBoardResponse.holdings.existing = holdings.existing ? holdings.existing : 0;
        holdingDashBoardResponse.holdings.new = holdings.new ? holdings.new : 0;


        holdingDashBoardResponse.bars = {};
        holdingDashBoardResponse.bars.exclude = bars.exclude ? bars.exclude : 0;
        holdingDashBoardResponse.bars.notInModel = bars.notInmodel ? bars.notInmodel :0;

        holdingDashBoardResponse.topTenHoldings = {};
        holdingDashBoardResponse.topTenHoldings.totalHoldingValue = bars.totalHoldingValue ? bars.totalHoldingValue : 0;
        holdingDashBoardResponse.topTenHoldings.totalHoldingValueStatus = bars.totalHoldingValueStatus ? bars.totalHoldingValueStatus : null;  // todao Pending Field

        holdingDashBoardResponse.topTenHoldings.holdings = [];
 
        topTenHoldingsDetail.forEach(function (holdingSummary) {
            var topTenHoldingResponse = new TopTenHoldingResponse();

            topTenHoldingResponse.securityName = holdingSummary.securityName ? holdingSummary.securityName : null;
            topTenHoldingResponse.marketValue = holdingSummary.marketValue ? holdingSummary.marketValue : 0;
            topTenHoldingResponse.unit = holdingSummary.unit ? holdingSummary.unit : 0;
            topTenHoldingResponse.price = holdingSummary.price ? holdingSummary.price : 0;
            topTenHoldingResponse.percentage = holdingSummary.percentage ? holdingSummary.percentage : 0;

            holdingDashBoardResponse.topTenHoldings.holdings.push(topTenHoldingResponse);
        });

        holdingDashBoardResponse.issues = {};
        holdingDashBoardResponse.issues.total = issues.total ? issues.total : 0;
        holdingDashBoardResponse.issues.errors = issues.errors ? issues.errors : 0;
        holdingDashBoardResponse.issues.warnings = issues.warnings ? issues.warnings : 0;

        return cb(null, holdingDashBoardResponse);
    } else {
        return cb("Error in Getting Data from DB", holdingDashBoardResponse);
    }
};
 
module.exports = HoldingDashboardConverter;
