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
var categoriesId;
var categories;
var assetCategory;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var newCategories = {
    "name": "Equit1y" + unique.get(),
    "color": "#343443"

};

var wrongCategories = {
    "name": "Equit1y" + unique.get(),
    "color": "343443"

};

var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    categories: constdata.categories.api,
    assetCategory: constdata.assetCategory.api,
};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;
categories = inputData.categories;
assetCategory = inputData.assetCategory;

describe("**** Security Categories Test Cases ****", function () {
    describe("**** START ****", function () {
//===================================================Create categories=========================================
        describe("CREATE CATEGORIES TEST CASE # 1", function () {
            it("Should Create categories ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(categories)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newCategories)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            categoriesId = res.body.id;
                            done();
                        });
                    });
            });
        });
        describe("CREATE CATEGORIES TEST CASE # 2", function () {
            util.postInvalidToken(categories, newCategories);
            util.postWithoutToken(categories, newCategories);
        });
        describe("CREATE CATEGORIES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(categories)
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
        describe("CREATE CATEGORIES TEST CASE # 4 (Unprocessable Entity)", function () {
            it("Should Return 422 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(categories)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newCategories)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });
        describe("CREATE CATEGORIES TEST CASE # 5 (Bad Request)", function () {
            it("Should Return 400", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(categories)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(wrongCategories) //Wrong Color id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//===================================================Get All Categories Test Case================================
        describe("GET ALL CATEGORIES TEST CASE # 1", function () {
            it("Should Return All Categories", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(categories)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        })
                    });
            });
        });
        describe("GET ALL CATEGORIES TEST CASE # 2", function () {
            util.getInvalidToken(categories);
            util.getWithoutToken(categories);
        });
//==============================================Update Categories=================================================
        describe("UPDATE CATEGORIES TEST CASE # 1", function () {
            it("Should Update Categories", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(categories + '/' + categoriesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newCategories)
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
        describe("UPDATE CATEGORIES TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(categories + '/' + categoriesId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(newCategories)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE CATEGORIES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(categories + '/' + categoriesId)
                    .send(newCategories)
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
        describe("UPDATE CATEGORIES TEST CASE # 4 (Not Found)", function () {
            it("Should Return  404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(categories + '/' + 999999999999999)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(wrongCategories) //Wrong Color id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//=======================================Get Securities under given Category============================================
        describe("GET SECURITIES UNDER GIVEN CATEGORY TEST CASE # 1", function () {
            it("Should Return Securities under given Category ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(assetCategory + categoriesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.body.should.be.instanceof(Array);
                                res.status.should.equal(expect);
                                done();
                            } else if (categoriesId === null) {
                                console.log("--id was NULL--");
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET SECURITIES UNDER GIVEN CATEGORY TEST CASE # 2", function () {
            util.getInvalidToken(assetCategory + categoriesId);
            util.getWithoutToken(assetCategory + categoriesId);
        });
        describe("GET SECURITIES UNDER GIVEN CATEGORY TEST CASE # 4 (Not Found)", function () {
            it("Should Return 200", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(assetCategory + 'teamtunit')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
//==============================================Delete categories==============================================
        describe("DELETE CATEGORIES TEST CASE # 1", function () {
            it("Should Delete categories ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(categories + '/' + categoriesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("DELETE CATEGORIES TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(categories + '/' + categoriesId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE CATEGORIES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(categories + '/' + categoriesId)
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
        describe("DELETE CATEGORIES TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404/422", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(categories + '/99999999999')
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
        });
    });
});
