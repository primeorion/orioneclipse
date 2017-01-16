"use strict";
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var assert = require('assert');
var constdata = require('./../../../test/config/Constants.js').Constants;
var UtilTest = require('./../../../test/util/UtilTest.js');
var util = new UtilTest();
var body = '';
var baseurl;
var expect;
var timeout;
var securityId;
var securities;
var orionSecuritiesSearch;
var eclipseSecuritiesSearch;
var securityType;
var securityStatus;
var orionSecurityId;
var securitiesAssetweightings;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    securities: constdata.securities.api,
    orionSecuritiesSearch: constdata.orionSecuritiesSearch.api,
    securityType: constdata.securityType.api,
    securityStatus: constdata.securityStatus.api,
    eclipseSecuritiesSearch: constdata.eclipseSecuritiesSearch.api,
    securitiesAssetweightings: constdata.securitiesAssetweightings.api
};

var updateSecurityDetailed = {
    "price": 400,
    "status": "ACTIVE",
    "symbol": "KYT",
    "securityTypeId": 1,
    "assetCategoryId": 1,
    "assetClassId": 2,
    "assetSubClassId": 1,
    "custodialCash": 0,
    "custodians": [
        {
            "id": 1,
            "custodianSecuritySymbol": "IYC"
        }
    ]
};

var updateSecurityList = {
    "price": 400,
    "status": "ACTIVE",
    "symbol": "KYT",
    "securityTypeId": 1,
    "assetCategoryId": 1,
    "assetClassId": 2,
    "assetSubClassId": 1,
    "custodialCash": 0
};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;
securities = inputData.securities;
orionSecuritiesSearch = inputData.orionSecuritiesSearch;
securityType = inputData.securityType;
securityStatus = inputData.securityStatus;
eclipseSecuritiesSearch = inputData.eclipseSecuritiesSearch;
securitiesAssetweightings = inputData.securitiesAssetweightings;

describe("**** Security Test Cases ****", function () {
    describe("**** START ****", function () {
//==========================================Search Securities from orion======================================
        describe("SEARCH SECURITIES FROM ORION TEST CASE # 1", function () {
            it("Should Return Securities ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(orionSecuritiesSearch)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            res.status.should.equal(expect);
                            if (res.body.length > 0) {
                                orionSecurityId = res.body[0].id;
                                done();
                            }
                            else {
                                orionSecurityId = null;
                                done();
                            }
                       });
                    });
            });
        });
        describe("SEARCH SECURITIES FROM ORION TEST CASE # 2", function () {
            util.getInvalidToken(orionSecuritiesSearch);
            util.getWithoutToken(orionSecuritiesSearch);
        });
        describe("SEARCH SECURITIES FROM ORION TEST CASE # 4 (Not Found)", function () {
            it("Should Return 200", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(orionSecuritiesSearch)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
//===================================================Add Security======================================================
        describe("ADD SECURITIES TEST CASE # 1", function () {
            it("Should Add Security ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(securities)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send({
                        "id": orionSecurityId
                    })
                    .end(function (err, res) {
                         setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
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
        describe("ADD SECURITIES TEST CASE # 2", function () {
            var osId = {
                "id": orionSecurityId
            };
            util.postInvalidToken(securities, osId);
            util.postWithoutToken(securities, osId);
        });
        describe("ADD SECURITIES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(securities)
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
        describe("ADD SECURITIES TEST CASE # 4 ((Not Found))", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(securities)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send({
                        "id": 99999999999999 //Wrong orionSecurityId
                    })
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
//===================================================Get All Securities Test Case================================
        describe("GET ALL SECURITIES TEST CASE # 1", function () {
            it("Should Return All Securities", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(securities)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            if (res.body.length > 0) {
                                securityId = res.body[0].id;
                            }
                            else {
                                securityId = null;
                            }
                            done();
                        });
                    });
            });
        });
        describe("GET ALL SECURITIES TEST CASE # 2", function () {
            util.getInvalidToken(securities);
            util.getWithoutToken(securities);
        });

//=====================================Get All security Status======================================================
        describe("GET ALL SECURITY STATUS TEST CASE # 1 ", function () {
            it("Should Security Status ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(securityStatus)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            res.body.should.be.instanceof(Array);
                            done();
                        });
                    });
            });
        });
        describe("GET ALL SECURITY STATUS TEST CASE # 2", function () {
            util.getInvalidToken(securityStatus);
            util.getWithoutToken(securityStatus);
        });
//================================Search Securities from eclipse============================
        describe("SEARCH SECURITIES FROM ECLIPSE TEST CASE # 1", function () {
            it("Should Return Securities ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(orionSecuritiesSearch)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            res.status.should.equal(expect);
                            if (res.body.length > 0) {
                                orionSecurityId = res.body[0].id;
                            }
                            else {
                                orionSecurityId = null;
                            }
                            done();
                        });
                    });
            });
        });
        describe("SEARCH SECURITIES FROM ECLIPSE TEST CASE # 2", function () {
            util.getInvalidToken(orionSecuritiesSearch);
            util.getWithoutToken(orionSecuritiesSearch);
        });
        describe("SEARCH SECURITIES FROM ECLIPSE TEST CASE # 4 (Not Found)", function () {
            it("Should Return 200", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(orionSecuritiesSearch)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });

//==============================================Update Security Detailed  =====================================================================
        describe("UPDATE SECURITY DELAILED TEST CASE # 1", function () {
            it("Should Update Security", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securities + '/' + securityId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateSecurityDetailed)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            }
                            else if(res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }else {
                                res.status.should.equal(400);
                                done();
                            }
                           });
                    });
            });
        });
        describe("UPDATE SECURITY DELAILED TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securities + '/' + securityId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(updateSecurityDetailed)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE SECURITY DELAILED TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securities + '/' + securityId)
                    .send(updateSecurityDetailed)
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
        describe("UPDATE SECURITY DELAILED TEST CASE # 4 (Unprocessable Entity)", function () {
            it("Should Return  422", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securities + '/' + 999999999999999)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateSecurityDetailed)
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
//==============================================Update Security List=====================================================================
        describe("UPDATE SECURITY LIST TEST CASE # 1", function () {
            it("Should Update Security", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securities + '/' + securityId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateSecurityList)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            }
                            else if(res.status === 404){
                                res.status.should.equal(404);
                                done();
                            }else {
                                res.status.should.equal(400);
                                done();
                            }
                         });
                    });
            });
        });
        describe("UPDATE SECURITY LIST TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securities + '/' + securityId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(updateSecurityList)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE SECURITY LIST TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securities + '/' + securityId)
                    .send(updateSecurityList)
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
        describe("UPDATE SECURITY LIST TEST CASE # 4 (Unprocessable Entity)", function () {
            it("Should Return  422", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(securities + '/' + 999999999999999)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateSecurityList)
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

//==============================================Get All Details==================================================
        describe("GET SECURITY TEST CASE # 1 ", function () {
            it("Should Return Security ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(securities + '/' + securityId)
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
        describe("GET SECURITY TEST CASE # 2", function () {
            var classSecurityId = securities + '/' + securityId;

            util.getInvalidToken(classSecurityId);
            util.getWithoutToken(classSecurityId);

            classSecurityId = securities + '/' + 9999999999;
            util.getNotFound(classSecurityId);
        });
        describe("GET SECURITY TEST CASE # 3 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(securities + '/' + 'a2')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//==========================================Get Security Asset weightings=========================================
//        describe("GET SECURITY ASSET WEIGHTINGS TEST CASE # 1 ", function () {
//            it("Should Security Asset weightings", function (done) {
//                this.timeout(timeout);
//                chai.request(baseurl)
//                    .get(securitiesAssetweightings + '/' + securityId)
//                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
//                    .end(function (err, res) {
//                        setTimeout(function () {
//                            if(res.status === expect){
//                                done();
//                            }else{
//                                res.status.should.equal(400);
//                                done();
//                            }
//                        });
//                    });
//            });
//        });
//        describe("GET SECURITY ASSET WEIGHTINGS TEST CASE # 2", function () {
//            var classSecurityId = securitiesAssetweightings + '/' + securityId;
//
//            util.getInvalidToken(classSecurityId);
//            util.getWithoutToken(classSecurityId);
//
//            classSecurityId = securities + '/' + 9999999999;
//            util.getNotFound(classSecurityId);
//        });
//        describe("GET SECURITY ASSET WEIGHTINGS TEST CASE # 3 (Bad Request)", function () {
//            it("Should Return 400 ", function (done) {
//                this.timeout(timeout);
//                chai.request(baseurl)
//                    .get(securitiesAssetweightings + '/' + 'a2')
//                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
//                    .end(function (err, res) {
//                        setTimeout(function () {
//                            res.status.should.equal(400);
//                            done();
//                        });
//                    });
//            });
//        });
//=====================================Get Security Type============================================================
        describe("GET SECURITY TYPE TEST CASE # 1 ", function () {
            it("Should Security Type ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(securityType)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            res.body.should.be.instanceof(Array);
                            done();
                        });
                    });
            });
        });
        describe("GET SECURITY TYPE TEST CASE # 2", function () {
            util.getInvalidToken(securityType);
            util.getWithoutToken(securityType);
        });
    });
});
