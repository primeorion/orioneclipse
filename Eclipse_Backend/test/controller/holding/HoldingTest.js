
"use strict";

var utils = require("util")
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var assert = require('assert');
var constdata = require('./../../config/Constants.js').Constants;
var unique = require('../../../helper/UniqueIdGenerator');
var UtilTest = require('./../../../test/util/UtilTest.js');
var util = new UtilTest();
var body = '';
var expect;
var baseurl;
var timeout;
var models;
var holdingDashBoardSummmayByPortfolioId;
var holdingDashBoardSummmayByAccountId;
var holdings;
var holdingfilters;
var accountHoldings;
var portfoliosHoldings;
var accounTransactions;
var holdingsFilter;
var taxlots;
var holdingsSearch;
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    models: constdata.models.api,
    holdingDashBoardSummmayByPortfolioId: constdata.holdingDashBoardSummmayByPortfolioId.api,
    holdingDashBoardSummmayByAccountId: constdata.holdingDashBoardSummmayByAccountId.api,
    holdings: constdata.holdings.api,
    holdingfilters: constdata.holdingfilters.api,
    accountHoldings: constdata.accountHoldings.api,
    portfoliosHoldings: constdata.portfoliosHoldings.api,
    accounTransactions: constdata.accounTransactions.api,
    holdingsFilter: constdata.holdingsFilter.api,
    taxlots: constdata.taxlots.api,
    holdingsSearch: constdata.holdingsSearch.api,

};

baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect;
models = inputData.models;
holdingDashBoardSummmayByPortfolioId = inputData.holdingDashBoardSummmayByPortfolioId;
holdingDashBoardSummmayByAccountId = inputData.holdingDashBoardSummmayByAccountId;
holdings = inputData.holdings;
holdingfilters = inputData.holdingfilters;
accountHoldings = inputData.accountHoldings;
portfoliosHoldings = inputData.portfoliosHoldings;
accounTransactions = inputData.accounTransactions;
holdingsFilter = inputData.holdingsFilter;
taxlots = inputData.taxlots;
holdingsSearch = inputData.holdingsSearch;
describe("****Holding  Test Cases ****", function () {
    describe("**** START ****", function () {
        //===========Get Holding Dashboard Summary by Portfolio Id=============
        describe("GET HOLDING DASHBOARD SUMMATY BY PORTFOLIO ID TEST CASE # 1", function () {
            it("Should Return Holding Dashboard Summary ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(holdingDashBoardSummmayByPortfolioId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        res.status.should.equal(expect);
                        done();
                    });
            });
        });
        describe("GET HOLDING DASHBOARD SUMMATY BY PORTFOLIO ID TEST CASE # 2", function () {
            util.getInvalidToken(holdingDashBoardSummmayByPortfolioId);
            util.getWithoutToken(holdingDashBoardSummmayByPortfolioId);
        });
        describe("GET HOLDING DASHBOARD SUMMATY BY PORTFOLIO ID TEST CASE # 4 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get('v1/dashboard/portfolio/99999999999/holdings/summary')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        //===========Get Holding Dashboard Summary by Account Id=============
        describe("GET HOLDING DASHBOARD SUMMATY BY ACCOUNT ID TEST CASE # 1", function () {
            it("Should Return Holding Dashboard Summary ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(holdingDashBoardSummmayByAccountId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        res.status.should.equal(expect);
                        done();
                    });
            });
        });

        describe("GET HOLDING DASHBOARD SUMMATY BY ACCOUNT ID TEST CASE # 2", function () {
            util.getInvalidToken(holdingDashBoardSummmayByAccountId);
            util.getWithoutToken(holdingDashBoardSummmayByAccountId);
        });
        describe("GET HOLDING DASHBOARD SUMMATY BY ACCOUNT ID TEST CASE # 4 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get('v1/dashboard/account/99999999999/holdings/summary')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        //======================Get Holding Detail==========================
        describe("GET HOLDING DETAILS TEST CASE # 1", function () {
            it("Should Return Holding Details ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(holdings + '/' + 1)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else {
                                res.status.should.equal(expect);
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET HOLDING DETAILS TEST CASE # 2", function () {
            var holdingsDetail = holdings + '/' + 1;
            util.getInvalidToken(holdingsDetail);
            util.getWithoutToken(holdingsDetail);

            holdingsDetail = holdings + '/9999999999999999999';
            util.getNotFound(holdingsDetail);
        });
        //============================ - Get Holding Filter List=======================
        describe("GET HOLDING FILTER LIST TEST CASE # 1", function () {
            it("Should Return Holding Filter List ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(holdingfilters)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("GET HOLDING FILTER TEST CASE # 2", function () {
            util.getInvalidToken(holdingfilters);
            util.getWithoutToken(holdingfilters);
        });
        //==========Get Holding List by Account Id================
        describe("GET HOLDING LIST BY ACCOUNT ID TEST CASE # 1", function () {
            it("Should Return Holding list ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(accountHoldings)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        res.status.should.equal(expect);
                        done();
                    });
            });
        });
    });
    describe("GET HOLDING LIST BY ACCOUNT ID TEST CASE # 2", function () {
        util.getInvalidToken(accountHoldings);
        util.getWithoutToken(accountHoldings);
    });
    describe("GET HOLDING LIST BY ACCOUNT ID TEST CASE # 4 (Not Found)", function () {
        it("Should Return expect", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get('v1/account/accounts/99999999999/holdings')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
        });
        //==========Get Holding List by Portfolio Id================
        describe("GET HOLDING LIST BY PORTFOLIO ID TEST CASE # 1", function () {
            it("Should Return Holding list ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfoliosHoldings)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        res.status.should.equal(expect);
                        done();
                    });
            });
        });
    });
    describe("GET HOLDING LIST BY PORTFOLIO ID TEST CASE # 2", function () {
        util.getInvalidToken(portfoliosHoldings);
        util.getWithoutToken(portfoliosHoldings);
    });
    describe("GET HOLDING LIST BY PORTFOLIO ID TEST CASE # 4 (Not Found)", function () {
        it("Should Return expect", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get('v1/portfolio/portfolios/99999999999/holdings')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
        });
        //=========Get Holding Transaction Detail===================
        describe("GET HOLDING TRANSACTION DETAIL TEST CASE # 1", function () {
            it("Should Return Holding Transaction Detail ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(accounTransactions)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        res.status.should.equal(expect);
                        done();
                    });
            });
        });
    });
    describe("GET HOLDING TRANSACTION DETAIL TEST CASE # 2", function () {
        util.getInvalidToken(accounTransactions);
        util.getWithoutToken(accounTransactions);
    });
    describe("GET HOLDING TRANSACTION DETAIL TEST CASE # 4 (Not Found)", function () {
        it("Should Return expect", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get('v1/holding/holdings/99999999/transactions')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
        });
        //=========Get Portfolio Holding List by Filters==============
        describe("GET PORTFOLIO HOLDING LIST BY FILTER TEST CASE # 1", function () {
            it("Should Return Portfolio Holding List ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(holdingsFilter)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        res.status.should.equal(expect);
                        done();
                    });
            });
        });
    });
    describe("GET PORTFOLIO HOLDING LIST BY FILTER TEST CASE # 2", function () {
        util.getInvalidToken(holdingsFilter);
        util.getWithoutToken(holdingsFilter);
    });
    describe("GET PORTFOLIO HOLDING LIST BY FILTER TEST CASE # 4 (Not Found)", function () {
        it("Should Return expect", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get('v1/portfolio/portfolios/9999999999/holdings?filter=excluded')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
        });
        //=========Get Taxlot Detail======================================
        describe("GET TAXLOT DETAIL TEST CASE # 1", function () {
            it("Should Return Taxlot Detail ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(taxlots)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        res.status.should.equal(expect);
                        done();
                    });
            });
        });
    });
    describe("GET TAXLOT DETAIL TEST CASE # 2", function () {
        util.getInvalidToken(taxlots);
        util.getWithoutToken(taxlots);
    });
    describe("GET TAXLOT DETAIL TEST CASE # 4 (Not Found)", function () {
        it("Should Return expect", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get('v1/holding/holdings/1/taxlots')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
        });
        //==========================Search Holding by Holding Id==========================
        describe("SEARCH HOLDING BY HOLDING ID TEST CASE # 1", function () {
            it("Should Return holding ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(holdingsSearch)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("SEARCH HOLDING BY HOLDING ID TEST CASE # 2", function () {
            util.getInvalidToken(holdingsSearch);
            util.getWithoutToken(holdingsSearch);
        });
        describe("SEARCH HOLDING BY HOLDING ID TEST CASE # 4 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get('v1/holding/holdings?search=9999999999')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
    });
});

