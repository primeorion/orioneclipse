
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
var strategists;
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    strategists: constdata.strategists.api

};
var addStrategistsData = {
    "id": 1,
    "name": "Test strategist"
};
var addStrategists = {
    "name": "Test strategist"
};
baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect;
strategists = inputData.strategists;
describe("**** Eclipse Community Stategist Test Cases ****", function () {
    describe("**** START ****", function () {
        //======================Add community strategists======================
        describe("ADD COMMUNITY STRATEGIST TEST CASE # 1", function () {
            it("Should Add community strategists ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(strategists)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addStrategistsData)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            done();
                        });
                    });
            });
        });
        describe("ADD COMMUNITY STRATEGIST TEST CASE # 2", function () {
            util.postInvalidToken(strategists, addStrategistsData);
            util.postWithoutToken(strategists, addStrategistsData);
        });
        describe("ADD COMMUNITY STRATEGIST TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(strategists)
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
        describe("ADD COMMUNITY STRATEGIST TEST CASE # 5 (Bad Request)", function () {
            it("Should Return 400", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(strategists)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addStrategists) //Without id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
        //====================Update  community strategists=======================
        describe("UPDATE COMMUNITY STRATEGIST TEST CASE # 1", function () {
            it("Should Update community strategists", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(strategists + '/' + 1)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addStrategists)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
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
        describe("UPDATE COMMUNITY STRATEGIST TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(strategists + '/' + 1)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(addStrategists)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE COMMUNITY STRATEGIST TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(strategists + '/' + 1)
                    .send(addStrategists)
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
        describe("UPDATE COMMUNITY STRATEGIST TEST CASE # 4 (Not Found)", function () {
            it("Should Return  404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(strategists + '/' + 999999999999999) ///Wrong  id
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addStrategists)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
        //================Get All community strategists================
        describe("GET ALL COMMUNITY STRATEGIST CASE # 1", function () {
            it("Should Return All community strategists", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(strategists)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        })
                    });
            });
        });
        describe("GET ALL COMMUNITY STRATEGIST TEST CASE # 2", function () {
            util.getInvalidToken(strategists);
            util.getWithoutToken(strategists);
        });
        //================Get All community Approved strategists================
        describe("GET ALL COMMUNITY APPROVED STRATEGIST CASE # 1", function () {
            it("Should Return All community approved strategists", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(strategists + '/approved')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        })
                    });
            });
        });
        describe("GET ALL COMMUNITY APPROVED STRATEGIST TEST CASE # 2", function () {
            util.getInvalidToken(strategists + '/approved');
            util.getWithoutToken(strategists) + '/approved';
        });
        //==================Delete community strategists========================
/*        describe("DELETE COMMUNITY STRATEGIST TEST CASE # 1", function () {
            it("Should Delete community strategists ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(strategists + '/' + 1)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("DELETE COMMUNITY STRATEGIST TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(strategists + '/' + 1)
                    .set('Authorization', cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE COMMUNITY STRATEGIST TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(strategists + '/' + 1)
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
        describe("DELETE COMMUNITY STRATEGIST TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404/422", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(strategists + '/99999999999')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else {
                                res.status.should.equal(422);
                                done();
                            }
                        });
                    });
            });
        });*/
    });
});
