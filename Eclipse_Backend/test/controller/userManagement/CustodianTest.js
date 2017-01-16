"use strict";
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
var AllCustodians;
var custodianId;
var custodianSearch;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    allCustodians: constdata.Allcustodians.api,
    custodianSearch: constdata.custodianSearch.api
};

var addCustodian = {
    "id": 1211 + unique.get(),
    "name": "new custod2ian3",
    "code": "NEWCUST3",
    "accountNumber": "123456",
    "tradeExecutions": [
        {
            "securityTypeId": 1,
            "tradeExecutionTypeId": 1
        }
    ]
};

var wrongAddCustodian = {
    "id": 63426,
    "name": "new custodian3",
    "tradeExecutions": [
        {
            "securityTypeId": 1,
            "tradeExecutionTypeId": 1
        },
        {
            "securityTypeId": 1,
            "tradeExecutionTypeId": 2
        }
    ]
};

var updateCustodian = {
    "externalId": 3456,
    "name": "Prime",
    "code": "CUST3",
    "accountNumber": "123456",
    "tradeExecutions": [
        {
            "securityTypeId": 1,
            "tradeExecutionTypeId": 1
        }
    ]
};

baseurl = inputData.baseurl;
timeout = inputData.timeout;
AllCustodians = inputData.allCustodians;
custodianSearch = inputData.custodianSearch;
expect = inputData.expect;

describe("**** Custodian Test Cases ****", function () {
    describe("**** START ****", function () {
//==========================================Get All Custodian==================================================
        describe("GET ALL CUSTODIAN TEST CASE # 1", function () {
            it("Should Return All Custodians", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(AllCustodians)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            if (res.body.length > 0) {
                                custodianId = res.body[0].id;
                                done();
                            }
                            else {
                                custodianId = null;
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET ALL CUSTODIAN TEST CASE # 2", function () {
            util.getInvalidToken(AllCustodians);
            util.getWithoutToken(AllCustodians);
        });
//=========================================================GET Custodian Detail==============================
        describe("GET CUSTODIAN DETAIL TEST CASE # 1 ", function () {
            it("Should Return Custodian Detail", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(AllCustodians + '/' + custodianId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                res.body.should.have.property('id');
                                res.body.should.have.property('name');
                                res.body.should.have.property('externalId');
                                res.body.should.have.property('code');
                                done();
                            } else if (custodianId === null) {
                                console.log("--id was NULL--");
                                done();
                            } else {
                                done();
                            }

                        });
                    });
            });
        });
        describe("GET CUSTODIAN DETAIL TEST CASE # 2", function () {
            var custodian = AllCustodians + '/' + custodianId;

            util.getInvalidToken(custodian);
            util.getWithoutToken(custodian);

            custodian = AllCustodians + '/' + 9999999999;
            util.getNotFound(custodian);

        });
        describe("GET CUSTODIAN DETAIL TEST CASE # 3 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(AllCustodians + '/' + 'a2')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//========================================================GET Custodians Accounts======================================
        describe("GET CUSTODIANS ACCOUNTS TEST CASE # 1 ", function () {
            it("Should Return Custodian Detail", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(AllCustodians + '/' + custodianId + '/' + 'accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            } else if (custodianId === null) {
                                console.log("--id was NULL--");
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET CUSTODIAN ACCOUNTS TEST CASE # 2", function () {
            var custodianAccounts = AllCustodians + '/' + custodianId + '/' + 'accounts';

            util.getInvalidToken(custodianAccounts);
            util.getWithoutToken(custodianAccounts);

            custodianAccounts = AllCustodians + '/' + 9999999999 + '/' + 'accounts';
            util.getNotFound(custodianAccounts);

        });
        describe("GET CUSTODIAN ACCOUNTS TEST CASE # 3 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(AllCustodians + '/' + 'a2' + '/' + 'accounts')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//===========================================================Update Custodian===========================================
        describe("UPDATE CUSTODIAN TEST CASE # 1", function () {
            it("Should Update Team ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(AllCustodians + '/' + custodianId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateCustodian)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            } else if (custodianId === null) {
                                console.log("--id was NULL--");
                                done();
                            }

                        });
                    });
            });
        });
        describe("UPDATE CUSTODIAN TEST CASE # 2 (Bad request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(AllCustodians + '/' + custodianId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE CUSTODIAN TEST CASE # 3 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(AllCustodians + '/' + custodianId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(updateCustodian)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE CUSTODIAN TEST CASE # 4 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(AllCustodians + '/' + custodianId)
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
        describe("UPDATE CUSTODIAN TEST CASE # 5 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(AllCustodians + '/99999999999')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateCustodian)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if(res.status === 404){
                                res.status.should.equal(404);
                                done();  
                            }else{
                                res.status.should.equal(500);
                                done();
                            }
                        });
                    });
            });
        });
//==============================================Search Custodian============================================================
        describe("SEARCH CUSTODIANS TEST CASE # 1", function () {
            it("Should Return Custodian ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(custodianSearch + custodianId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.body.should.be.instanceof(Array);
                                res.status.should.equal(expect);
                                done();
                            } else if (custodianId === null) {
                                console.log("--id was NULL--");
                                done();
                            }
                        });
                    });
            });
        });
        describe("SEARCH CUSTODIANS TEST CASE # 2", function () {
            util.getInvalidToken(custodianSearch + custodianId);
            util.getWithoutToken(custodianSearch + custodianId);
        });
        describe("SEARCH CUSTODIANS TEST CASE # 4 (Not Found)", function () {
            it("Should Return 200", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(custodianSearch + 'teamtunit')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
//==============================================Delete Custodian=========================================================
        describe("DELETE CUSTODIAN TEST CASE # 1", function () {
            it("Should Delete Custodian ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(AllCustodians + '/' + custodianId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                        	
                            if (res.status === 200) {
                                res.status.should.equal(expect);
                                done();
                            } else if (custodianId === null) {
                                console.log("--id was NULL--");
                                done();
                            }
                        });
                    });
            });
        });
        describe("DELETE CUSTODIAN TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(AllCustodians + '/' + custodianId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE CUSTODIAN TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(AllCustodians + '/' + custodianId)
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
        describe("DELETE CUSTODIAN TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(AllCustodians + '/' + custodianId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 404) {
                                res.status.should.equal(404);
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
//===============================================Get Custodian Details After Deletion=======================================
        describe("GET CUSTODIAN DETAIL AFTER DELETION TEST CASE # 1 ", function () {
            it("Should Return Custodian Detail", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(AllCustodians + '/' + custodianId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            } else if (custodianId === null) {
                                console.log("--id was NULL--");
                                done();
                            }
                        });
                    });
            });
        });
    });
});
