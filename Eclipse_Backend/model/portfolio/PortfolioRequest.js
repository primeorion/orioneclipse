"use strict";
var lodash = require("lodash");
var baseModel = new (require('model/base/BaseInputModel.js'))();
var PortfolioData = require('model/portfolio/Portfolio.js');
var portfolioData = new PortfolioData();

var requestData = {
    modelId : null,
    teamIds : null,
    accountIds : null,
    isSleevePortfolio : null,
    doNotTrade : null,
    tags : null,
    primaryTeamId : null
   
}

portfolioData = lodash.assignIn(baseModel, portfolioData, requestData);


var PortfolioRequest = function (data) {
    return this.data = this.sanitize(data);
}

PortfolioRequest.prototype.sanitize = function (data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, portfolioData), lodash.keys(portfolioData));
}
module.exports = PortfolioRequest;