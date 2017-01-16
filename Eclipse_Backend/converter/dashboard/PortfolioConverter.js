"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var PortfolioResponse = require("model/dashboard/PortfolioResponse.js");
var messages = config.messages;
var logger = helper.logger(moduleName);

var PortfolioConverter = function () { }

PortfolioConverter.prototype.getResponseModel = function (data, cb) {
    if (data.length == 5) {
        logger.debug("Converting data to dashboardPortfolioSummaryData in getResponseModel()");
        var self = this;
        var portfolio = data[0][0] ? data[0][0] : [];
        var issues = data[1][0] ? data[1][0] : [];
        var AUM = data[2][0] ? data[2][0] : [];
        var summary = data[3][0] ? data[3][0] : [];

        var portfolioResponse = new PortfolioResponse();

        portfolioResponse.analyticsOn = summary.dateOfAnalytics ? summary.dateOfAnalytics : null;

        portfolioResponse.portfolio = {};
        portfolioResponse.portfolio.total = portfolio.total ? portfolio.total : 0;
        portfolioResponse.portfolio.existing = portfolio.existing ? portfolio.existing : 0;
        portfolioResponse.portfolio.new = portfolio.new ? portfolio.new : 0;

        portfolioResponse.AUM = {};
        portfolioResponse.AUM.total = AUM.totalAUM ? AUM.totalAUM : 0;
        portfolioResponse.AUM.changeValue = AUM.changeInDollar ? AUM.changeInDollar : 0;
        portfolioResponse.AUM.changePercent = AUM.changeInPercent ? AUM.changeInPercent : 0;
        portfolioResponse.AUM.status = AUM.changeInDollar ? ((AUM.changeInDollar > 0) ? "high" : "low") : "no";

        portfolioResponse.issues = {};
        portfolioResponse.issues.total = issues.issues ? issues.issues : 0;
        portfolioResponse.issues.errors = issues.errors ? issues.errors : 0;
        portfolioResponse.issues.warning = issues.warnings ? issues.warnings : 0;

        portfolioResponse.outOfTolerance = summary.outOfTolerance ? summary.outOfTolerance : 0;
        portfolioResponse.cashNeed = summary.cashNeed ? summary.cashNeed : 0;
        portfolioResponse.setForAutoRebalance = summary.setForAutoRebalance ? summary.setForAutoRebalance : 0;
        portfolioResponse.contribution = summary.contribution ? summary.contribution : 0;
        portfolioResponse.distribution = summary.distribution ? summary.distribution : 0;
        portfolioResponse.noModel = summary.noModel ? summary.noModel : 0;
        portfolioResponse.doNotTrade = summary.blocked ? summary.blocked : 0;
        portfolioResponse.TLHOpportunity = summary.taxLossHarvestOpportunity ? summary.taxLossHarvestOpportunity : 0;
        portfolioResponse.dataErrors = summary.dataErrors ? summary.dataErrors : 0;
        portfolioResponse.pendingTrades = summary.pendingTrades ? summary.pendingTrades : 0;
        return cb(null, portfolioResponse);
    } else {
        return cb("Error in Getting Data from DB", portfolioResponse);
    }
};

module.exports = PortfolioConverter;
