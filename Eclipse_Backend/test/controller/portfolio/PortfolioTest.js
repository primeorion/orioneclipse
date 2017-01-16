
"use strict";

var where = require("lodash.where")
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
var portfolios;
var portfolioId;
var portfoliosSimple;
var portfoliosSimpleSearch;
var portfoliosStatus;
var portfoliosSearch;
var assignAccounts;
var eclipseAccessToken = cache.get('testLoginToken')

chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    portfolios: constdata.portfolios.api,
    portfoliosSimple: constdata.portfoliosSimple.api,
    portfoliosSimpleSearch: constdata.portfoliosSimpleSearch.api,
    portfoliosStatus: constdata.portfoliosStatus.api,
    assignAccounts: constdata.portfolios.assignAccounts,
    portfoliosSearch: constdata.portfoliosSearch.api
};

var addPortfolio = {
    "name": "Demo Portfolio Unit",
    "modelId": 545,
    "isSleevePortfolio": false,
    "tags": "test",
    "teamIds": [
        1
    ],
    "primaryTeamId": 1
};

var wrongModelIdaddPortfolio = {
    "name": "Demo Portfolio Unit",
    "modelId": 999999999999,
    "isSleevePortfolio": false,
    "tags": "test",
    "teamIds": [
        1,
    ],
    "primaryTeamId": 1
};

baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect;
portfolios = inputData.portfolios;
portfoliosSimple = inputData.portfoliosSimple;
portfoliosSimpleSearch = inputData.portfoliosSimpleSearch;
portfoliosStatus = inputData.portfoliosStatus;
assignAccounts = inputData.assignAccounts;
portfoliosSearch = inputData.portfoliosSearch;

describe("**** Portfolios Test Cases ****", function () {
    describe("**** START ****", function () {
        //=======================================Add new Portfolio==================================
        describe("ADD NEW PORTFOLIO TEST CASE # 1", function () {
            it("Should Add New Portfolio", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(portfolios)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addPortfolio)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            if (res.body.id) {
                                portfolioId = res.body.id;
                                done();
                            } else {
                                portfolioId = null;
                                done();
                            }
                        });
                    });
            });
        });
        describe("ADD NEW PORTFOLIO TEST CASE # 2", function () {
            util.postInvalidToken(portfolios, addPortfolio);
            util.postWithoutToken(portfolios, addPortfolio);
        });
        describe("ADD NEW PORTFOLIO TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(portfolios)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 403) {
                                res.status.should.equal(403);
                                done();
                            }
                            else {
                                res.status.should.equal(401);
                                done();
                            }
                        });
                    });
            });
        });
        describe("ADD NEW PORTFOLIO TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(portfolios)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(wrongModelIdaddPortfolio) //Wrong Model id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
        //=======================================Update Portfolio==================================
        describe("UPDATE PORTFOLIO TEST CASE # 1", function () {
            it("Should Update Portfolio", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addPortfolio)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE PORTFOLIO TEST CASE # 2", function () {
            var temp = portfolios + '/' + portfolioId;
            util.putInvalidToken(temp, addPortfolio);
            util.putWithoutToken(temp, addPortfolio);
        });
        describe("UPDATE PORTFOLIO TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 403) {
                                res.status.should.equal(403);
                                done();
                            }
                            else {
                                res.status.should.equal(401);
                                done();
                            }
                        });
                    });
            });
        });
        describe("UPDATE PORTFOLIO TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(wrongModelIdaddPortfolio) //Wrong Model id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });

        //===============================Get All Portfolio simple ===================================
        describe("GET ALL PORTFOLIO SIMPLE TEST CASE # 1", function () {
            it("Should Return All Portfolios Simple ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfoliosSimple)
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
        describe("GET ALL PORTFOLIO SIMPLE TEST CASE # 2", function () {
            util.getInvalidToken(portfoliosSimple);
            util.getWithoutToken(portfoliosSimple);
        });
        //===============================Portfolios, Search Simple=====================================
        describe("PORTFOLIOS SEARCH SIMPLE TEST CASE # 1", function () {
            it("Should Return Portfolios ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfoliosSimpleSearch + portfolioId)
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
        describe("PORTFOLIOS SEARCH SIMPLE TEST CASE # 2", function () {
            util.getInvalidToken(portfoliosSimpleSearch + portfolioId);
            util.getWithoutToken(portfoliosSimpleSearch + portfolioId);
        });
        describe("PORTFOLIOS SEARCH SIMPLE CASE # 4 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfoliosSimpleSearch + 'cxcxc222222222')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        //===============================Portfolios Search ====================================
        describe("PORTFOLIOS SEARCH  TEST CASE # 1", function () {
            it("Should Return Portfolios ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfoliosSearch)
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
        describe("PORTFOLIOS SEARCH  TEST CASE # 2", function () {
            util.getInvalidToken(portfoliosSearch);
            util.getWithoutToken(portfoliosSearch);
        });
        describe("PORTFOLIOS SEARCH  CASE # 4 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get('v1/portfolio/portfolios?search=9999999999')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        //============================Get list of all Portfolios Status=============================
        describe("GET ALL PORTFOLIO STATUS TEST CASE # 1", function () {
            it("Should Return All Portfolio Status ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfoliosStatus)
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
        describe("GET ALL PORTFOLIO STATUS TEST CASE # 2", function () {
            util.getInvalidToken(portfoliosStatus);
            util.getWithoutToken(portfoliosStatus);
        });

        //===============================Get All Portfolios ===================================
        describe("GET ALL PORTFOLIOS TEST CASE # 1", function () {
            it("Should Return All Portfolios ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios)
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
        describe("GET ALL PORTFOLIOS TEST CASE # 2", function () {
            util.getInvalidToken(portfolios);
            util.getWithoutToken(portfolios);
        });

        //===========================================Get Portfolio Details=======================
        describe("GET PORTFOLIO DETAILS TEST CASE # 1", function () {
            it("Should Return Portfolio Details ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios + '/' + portfolioId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            res.body.should.have.property('id');
                            res.body.should.have.property('general');
                            res.body.should.have.property('teams');
                            res.body.should.have.property('issues');
                            done();
                        });
                    });
            });
        });
        describe("GET PORTFOLIO DETAILS TEST CASE # 2", function () {
            var portfolioDetail = portfolios + '/' + portfolioId;
            util.getInvalidToken(portfolioDetail);
            util.getWithoutToken(portfolioDetail);

            portfolioDetail = portfolios + '/9999999999999999999';
            util.getNotFound(portfolioDetail);
        });

        //=================================Get count of Accounts with Portfolio=====================
        describe("GET COUNT OF ACCOUNTS WITH PORTFOLIO TEST CASE # 1", function () {
            it("Should Return count of Accounts with Portfolio ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios + '/' + portfolioId + '/accounts/summary')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            res.body.should.have.property('count');
                            done();
                        });
                    });
            });
        });
        describe("GET COUNT OF ACCOUNTS WITH PORTFOLIO TEST CASE # 2", function () {
            var portfolioCount = portfolios + '/' + portfolioId + '/accounts/summary';
            var portfolioCount = portfolios + '/' + portfolioId + '/accounts/summary';
            util.getInvalidToken(portfolioCount);
            util.getWithoutToken(portfolioCount);
        });

        //===============================Get list of all Accounts of Portfolio======================
        describe("GET LIST OF ALL ACCOUNTS OF PORTFOLIO TEST CASE # 1", function () {
            it("Should Return list of all Accounts of Portfolio ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                done();
                            } else {
                                res.status.should.equal(404);
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET LIST OF ALL ACCOUNTS OF PORTFOLIO TEST CASE # 2", function () {

            var portfolioAccounts = portfolios + '/' + portfolioId + '/accounts';
            util.getInvalidToken(portfolioAccounts);
            util.getWithoutToken(portfolioAccounts);
        });
        describe("GET LIST OF ALL ACCOUNTS OF PORTFOLIO TEST CASE # 3 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios + '/9999999999999999999' + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });

        //=============================Get list of all Regular type Accounts of Portfolio====================
        describe("GET LIST OF ALL REGULAR TYPE ACCOUNTS OF PORTFOLIO TEST CASE # 1", function () {
            it("Should Return list of all Regular type Accounts of Portfolio ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios + '/' + portfolioId + '/accounts/regular')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                done();
                            } else {
                                res.status.should.equal(404);
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET LIST OF ALL REGULAR TYPE ACCOUNTS OF PORTFOLIO TEST CASE # 2", function () {

            var portfolioRegular = portfolios + '/' + portfolioId + '/accounts/regular';
            util.getInvalidToken(portfolioRegular);
            util.getWithoutToken(portfolioRegular);

            portfolioRegular = portfolios + '/9999999999999999999' + '/accounts/regular';
            util.getNotFound(portfolioRegular);
        });

        //=============================Get list of all SMA type Accounts of Portfolio====================
        describe("GET LIST OF ALL SMA TYPE ACCOUNTS OF PORTFOLIO TEST CASE # 1", function () {
            it("Should Return list of all SMA type Accounts of Portfolio ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios + '/' + portfolioId + '/accounts/sma')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                done();
                            } else {
                                res.status.should.equal(404);
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET LIST OF ALL SMA TYPE ACCOUNTS OF PORTFOLIO TEST CASE # 2", function () {

            var portfolioSMA = portfolios + '/' + portfolioId + '/accounts/sma';
            util.getInvalidToken(portfolioSMA);
            util.getWithoutToken(portfolioSMA);

            portfolioSMA = portfolios + '/9999999999999999999' + '/accounts/sma';
            util.getNotFound(portfolioSMA);
        });

        //=============================Get list of all Sleeved  type Accounts of Portfolio====================
        describe("GET LIST OF ALL SLEEVED TYPE ACCOUNTS OF PORTFOLIO TEST CASE # 1", function () {
            it("Should Return list of all Sleeved type Accounts of Portfolio ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios + '/' + portfolioId + '/accounts/sleeved')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                done();
                            } else {
                                res.status.should.equal(404);
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET LIST OF ALL SLEEVED TYPE ACCOUNTS OF PORTFOLIO TEST CASE # 2", function () {

            var portfolioSleeved = portfolios + '/' + portfolioId + '/accounts/sleeved';
            util.getInvalidToken(portfolioSleeved);
            util.getWithoutToken(portfolioSleeved);

            portfolioSleeved = portfolios + '/9999999999999999999' + '/accounts/sleeved';
            util.getNotFound(portfolioSleeved);
        });

        //===========================Get list of all new Portfolios==================================
        describe("GET LIST OF ALL NEW PORTFOLIOS TEST CASE # 1", function () {
            it("Should Return list of all new Portfolios ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(portfolios + '/new')
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
        describe("GET LIST OF ALL NEW PORTFOLIOS TEST CASE # 2", function () {
            util.getInvalidToken(portfolios + '/new');
            util.getWithoutToken(portfolios + '/new');
        });

        //=======================================Assign Portfolio to Accounts======================
        describe("ASSIGN PORTFOLIO TO ACCOUNTS TEST CASE # 1", function () {
            it("Should Assign Portfolio to Accounts ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(assignAccounts)
                    .end(function (err, res) {
                    	
                        setTimeout(function () {
                            if (res.status === expect) {
                                res.status.should.equal(expect);
                                done();
                            }
                            else  if (res.status === 422) {
                                res.status.should.equal(422);
                                done();
                            }
                            else {
                                res.status.should.equal(400);
                                done();
                            }
                        });
                    });
            });
        });
        describe("ASSIGN PORTFOLIO TO ACCOUNTS TEST CASE # 2 (Bad request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
        describe("ASSIGN PORTFOLIO TO ACCOUNTS TEST CASE # 3", function () {

            util.postInvalidToken(portfolios + '/' + portfolioId + '/accounts', assignAccounts);
            util.postWithoutToken(portfolios + '/' + portfolioId + '/accounts', assignAccounts);
        });
        describe("ASSIGN PORTFOLIO TO ACCOUNTS TEST CASE # 4 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(
                    {

                    }
                    )
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
        describe("ASSIGN PORTFOLIO TO ACCOUNTS TEST CASE # 5 (Unprocessable Entity)", function () {
            it("Should Return 400", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(
                    {
                        "accountIds": [
                            99999999999999999,
                            88888888888888888
                        ]
                    }
                    )
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });

        //====================================Un-Assign Portfolio from Accounts  ==================
        describe("UN-ASSIGN PORTFOLIO FROM ACCOUNTS TEST CASE # 1", function () {
            it("Should Assign Portfolio to Accounts ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send({
                        "accountIds": [
                            1,
                            2
                        ]
                    })
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                res.status.should.equal(expect);
                                done();
                            }
                            else if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else if (res.status === 422) {
                                res.status.should.equal(422);
                                done();
                            }
                            else {
                                res.status.should.equal(400);
                                done();
                            }
                        });
                    });
            });
        });
        describe("UN-ASSIGN PORTFOLIO FROM ACCOUNTS TEST CASE # 2 (Bad request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 422) {
                                res.status.should.equal(422);
                                done();
                            }
                            else {
                                res.status.should.equal(400);
                                done();
                            }
                        });
                    });
            });
        });
        describe("UN-ASSIGN PORTFOLIO FROM ACCOUNTS TEST CASE # 3", function () {

            util.putInvalidToken(portfolios + '/' + portfolioId + '/accounts', assignAccounts);
            util.putInvalidToken(portfolios + '/' + portfolioId + '/accounts', assignAccounts);
        });
        describe("UN-ASSIGN PORTFOLIO TO ACCOUNTS TEST CASE # 4 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(

                    )
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });
        describe("UN-ASSIGN PORTFOLIO TO ACCOUNTS TEST CASE # 5 (Unprocessable Entity)", function () {
            it("Should Return 400", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(
                    {
                        "accountIds": [
                            1,
                            2
                        ]
                    }
                    )
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });
        describe("ADD NEW PORTFOLIO FOR UN-ASSIGN ALL ACCOUNTS TEST CASE # 1", function () {
            it("Should Add New Portfolio", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(portfolios)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addPortfolio)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            if (res.body.id) {
                                portfolioId = res.body.id;
                                done();
                            } else {
                                portfolioId = null;
                                done();
                            }
                        });
                    });
            });
        });
        //=========================Un-Assign Portfolio from all Accounts==================
        describe("UN-ASSIGN PORTFOLIO FROM ALL ACCOUNTS TEST CASE # 1", function () {
            it("Should Assign Portfolio to Accounts ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                res.status.should.equal(expect);
                                done();
                            }
                            else if (res.status === 422) {
                                res.status.should.equal(422);
                                done();
                            }
                            else {
                                res.status.should.equal(400);
                                done();
                            }
                        });
                    });
            });
        });
        describe("UN-ASSIGN PORTFOLIO FROM ALL ACCOUNTS TEST CASE # 2 (Bad request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 422) {
                                res.status.should.equal(422);
                                done();
                            }
                            else {
                                res.status.should.equal(400);
                                done();
                            }
                        });
                    });
            });
        });
        describe("UN-ASSIGN PORTFOLIO FROM ALL ACCOUNTS TEST CASE # 3", function () {

            util.putInvalidToken(portfolios + '/' + portfolioId + '/accounts', assignAccounts);
            util.putInvalidToken(portfolios + '/' + portfolioId + '/accounts', assignAccounts);
        });
        describe("UN-ASSIGN PORTFOLIO TO ACCOUNTS TEST CASE # 4 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });
        describe("UN-ASSIGN PORTFOLIO TO ALL ACCOUNTS TEST CASE # 5 (Unprocessable Entity)", function () {
            it("Should Return 400", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(portfolios + '/' + portfolioId + '/accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });
        // ==================================Delete Portfolio========================================
        describe("DELETE PORTFOLIO TEST CASE # 1", function () {
            it("Should Delete Portfolio ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(portfolios + '/' + portfolioId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("DELETE PORTFOLIO TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(portfolios + '/' + portfolioId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE PORTFOLIO TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(portfolios + '/' + portfolioId)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 403) {
                                res.status.should.equal(403);
                                done();
                            }
                            else {
                                res.status.should.equal(401);
                                done();
                            }
                        });
                    });
            });
        });
        describe("DELETE PORTFOLIO TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(portfolios + '/' + 999999999)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else if (res.status === 422) {
                                res.status.should.equal(422);
                                done();
                            } else {
                                res.status.should.equal(expect);
                                done();
                            }
                        });
                    });
            });
        });
        //=============================Get Portfolio Dashboard Summary==========================
        describe("GET PORTFOLIO DASHBOARD TEST CASE # 1", function () {
            it("Should Return portfolio Dashboard ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get('dashboard/portfolio/summary')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                        	
                          //  res.body.should.be.instanceof(Array);
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("GET PORTFOLIO DASHBOARD TEST CASE # 2", function () {
            util.getInvalidToken(portfoliosSimple);
            util.getWithoutToken(portfoliosSimple);
        });
    });
});
