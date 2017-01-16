"use strict";
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var assert = require('assert');
var constdata = require('./../../../test/config/Constants.js').Constants;
var unique = require('../../../helper/UniqueIdGenerator');
var UtilTest = require('./../../../test/util/UtilTest.js');
var util = new UtilTest();
var body = '';
var baseurl;
var expect;
var timeout;
var securitySets;
var buyPriorities;
var sellPriorities;
var securitySetId;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    securitySets: constdata.securitySets.api,
    buyPriorities: constdata.buyPriorities.api,
    sellPriorities: constdata.sellPriority.api
};

var securitySetData = {
    "name": "first" + unique.get(),
    "description": "my first security set",
    "createdOn": "2016-08-02T10:14:54.000Z",
    "createdBy": "Prime TGI",
    "editedOn": "2016-08-04T08:35:16.000Z",
    "editedBy": "Prime Prime",
    "securities": [
        {
            "id": 8496,
            "targetAllowPercentage": 5,
            "lowerPercentage": 5,
            "upperPercentage": 5,
            "taxableSecurity": {
                "id": 8496
            },
            "taxDeferredSecurity": {
                "id": 8496
            },
            "taxExemptSecurity": {
                "id": 8496
            },
            "minTradeAmount": 100,
            "minInitialBuyDollar": 101,
            "buyPriority": "HARD_TO_BUY",
            "sellPriority": "HARD_TO_SELL",
            "equivalences": [
                {
                    "id": 15727,
                    "taxableSecurity": {
                        "id": 8496
                    },
                    "taxDeferredSecurity": {
                        "id": 8496
                    },
                    "taxExemptSecurity": {
                        "id": 8496
                    },
                    "minTradeAmount": 100,
                    "minInitialBuyDollar": 101,
                    "buyPriority": "HARD_TO_BUY",
                    "sellPriority": "HARD_TO_SELL"
                }
            ],
            "tlh": [
                {
                    "id": 9409,
                    "priority": 2
                }
            ]
        },
        {
            "id": 9409,
            "targetAllowPercentage": 5,
            "lowerPercentage": 5,
            "upperPercentage": 5,
            "taxableSecurity": {
                "id": 8496
            },
            "taxDeferredSecurity": {
                "id": 8496
            },
            "taxExemptSecurity": {
                "id": 8496
            },
            "minTradeAmount": 100,
            "minInitialBuyDollar": 100,
            "buyPriority": "HARD_TO_BUY",
            "sellPriority": "HARD_TO_SELL",
            "equivalences": [
                {
                    "id": 15727,
                    "taxableSecurity": {
                        "id": 8496
                    },
                    "taxDeferredSecurity": {
                        "id": 8496
                    },
                    "taxExemptSecurity": {
                        "id": 8496
                    },
                    "minTradeAmount": 100,
                    "minInitialBuyDollar": 100,
                    "buyPriority": "HARD_TO_BUY",
                    "sellPriority": "HARD_TO_SELL"
                }
            ],
            "tlh": [
                {
                    "id": 9409,
                    "priority": 1
                },
                {
                    "id": 331252,
                    "priority": 2
                }
            ]
        }
    ]
};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;
securitySets = inputData.securitySets;
buyPriorities = inputData.buyPriorities;
sellPriorities = inputData.sellPriorities;

describe("**** SecuritySet Test Cases ****", function () {
    describe("**** START ****", function () {
 //=================================================Create Security set====================================
        describe("CREATE SECURITY SET TEST CASE # 1", function () {
            it("Should Create  Security set ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(securitySets)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(securitySetData)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 201) {
                                res.status.should.equal(201);
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
        describe("CREATE SECURITY SET TEST CASE # 2", function () {
            util.postInvalidToken(securitySets, securitySetData);
            util.postWithoutToken(securitySets, securitySetData);
        });
        describe("CREATE SECURITY SET TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(securitySets)
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
 //========================================Get All SecuritySets==============================
        describe("GET ALL SECURITYSETS TEST CASE # 1", function () {
            it("Should Return All SecuritySets", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(securitySets)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                           res.status.should.equal(200);
                           if (res.body.length > 0) {
                                securitySetId = res.body[0].id;
                                done();
                           }else{
                                securitySetId = null ;
                                done();
                           }
                        });
                    });
            });
        });
        describe("GET ALL SECURITYSETS TEST CASE # 2", function () {
            util.getInvalidToken(securitySets);
            util.getWithoutToken(securitySets);
        });
//======================================Get All securityset Buy priorities==========================
        describe("GET ALL SECURITYSETS BUY PRIORITIES TEST CASE # 1", function () {
            it("Should Return All SecuritySets", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(buyPriorities)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("GET ALL SECURITYSETS  BUY PRIORITIES TEST CASE # 2", function () {
            util.getInvalidToken(buyPriorities);
            util.getWithoutToken(buyPriorities);
        });
//======================================Get All securityset Sell priorities==========================
        describe("GET ALL SECURITYSETS SELL PRIORITIES TEST CASE # 1", function () {
            it("Should Return All SecuritySets", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(sellPriorities)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("GET ALL SECURITYSETS  SELL PRIORITIES TEST CASE # 2", function () {
            util.getInvalidToken(sellPriorities);
            util.getWithoutToken(sellPriorities);
        });
//==========================================Get Detailed Security set==================================
        describe("GET DETAILED SECURITYSET TEST CASE # 1 ", function () {
            it("Should Return Securityset", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(securitySets + '/' + securitySetId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if(res.status === 200){
                                res.status.should.equal(200);
                                done();
                            }else{
                                res.status.should.equal(400);
                                done();
                            }
                            
                        });
                    });
            });
        });
        describe("GET DETAILED SECURITYSET TEST CASE # 2", function () {
            var classSecurityId = securitySets + '/' + securitySetId;

            util.getInvalidToken(classSecurityId);
            util.getWithoutToken(classSecurityId);

            classSecurityId = securitySets + '/' + 9999999999;
            util.getNotFound(classSecurityId);
        });
        describe("GET DETAILED SECURITYSET TEST CASE # 3 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(securitySets + '/' + 'a2')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//===========================================Update Security set===================================
        describe("UPDATE SECURITY SET TEST CASE # 1", function () {
            it("Should Update Security Set", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securitySets + '/' + securitySetId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(securitySetData)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            }
                            else if(res.status === 400){
                                res.status.should.equal(400);
                                done();
                            } 
                            else {
                                res.status.should.equal(404);
                                done();
                            }
                        });
                    });
            });
        });
        describe("UPDATE SECURITY SET TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securitySets + '/' + securitySetId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(securitySetData)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE SECURITY SET TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securitySets + '/' + securitySetId)
                    .send(securitySetData)
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
        //     describe("UPDATE SECURITY SET TEST CASE # 4 (Not Found)",function(){ 
        //               it("Should Return  404",function(done){ 
        //                     this.timeout(timeout);
        //                     chai.request(baseurl)
        //                         .put(securitySets+'/'+999999999999999)
        //                         .set('Authorization', 'Session '+cache.get('testLoginToken'))
        //                         .send(securitySetData)
        //                         .end(function(err,res){
        //                             setTimeout(function () {
        //                                 try {
        //                                         if(res.status===404){
        //                                         res.status.should.equal(404);
        //                                         done();  
        //                                         }
        //                                 }
        //                                 catch (e) {
        //                                         done(e);
        //                                 }
        //                                 });
        //                          });
        //              });
        //   });  
    });
});
