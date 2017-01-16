"use strict";
var cache = require('memory-cache');
var constdata = require('./../../test/config/Constants.js').Constants;
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var data = {
    baseurl: constdata.baseurl
};
var baseurl = data.baseurl;
var UtilTest = function () { };
chai.use(chaiHttp);

UtilTest.prototype.getInvalidToken = function (api, cb) {
    describe("Unauthorized request/ Invalid Token", function () {
        it("Should Return 401 ", function (done) {
            chai.request(baseurl)
                .get(api)
                .set('Authorization', cache.get('testLoginToken')) // called without Session keyword
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(401);
                        done();
                    });
                });
        });
    });
};

UtilTest.prototype.getWithoutToken = function (api, cb) {
    describe("Unauthorized request/ Without Token", function () {
        it("Should Return 401 ", function (done) {
            chai.request(baseurl)
                .get(api) // called without token
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(401);
                        done();
                    });
                });
        });
    });
};

UtilTest.prototype.getNotFound = function (api, cb) {
    describe("Not Found ", function () {
        it("Should Return 404 ", function (done) {
            chai.request(baseurl)
                .get(api)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(404);
                        done();
                    });
                });
        });
    });
};

UtilTest.prototype.postInvalidToken = function (api, postdata, cb) {
    describe("Unauthorized request/ Invalid Token", function () {
        it("Should Return 401 ", function (done) {
            chai.request(baseurl)
                .post(api)
                .set('Authorization', cache.get('testLoginToken')) // called without Session keyword
                .send(postdata)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(401);
                        done();
                    });
                });
        });
    });
};

UtilTest.prototype.postWithoutToken = function (api, postdata, cb) {
    describe("Unauthorized request/ Without Token", function () {
        it("Should Return 401 ", function (done) {
            chai.request(baseurl)
                .post(api) // called without token
                .send(postdata)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(401);
                        done();
                    });
                });
        });
    });
};

UtilTest.prototype.putInvalidToken = function (api, postdata, cb) {
    describe("Unauthorized request/ Invalid Token", function () {
        it("Should Return 401 ", function (done) {
            chai.request(baseurl)
                .put(api)
                .set('Authorization', cache.get('testLoginToken')) // called without Session keyword
                .send(postdata)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(401);
                        done();
                    });
                });
        });
    });
};

UtilTest.prototype.putWithoutToken = function (api, postdata, cb) {
    describe("Unauthorized request/ Without Token", function () {
        it("Should Return 401 ", function (done) {
            chai.request(baseurl)
                .put(api) // called without token
                .send(postdata)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(401);
                        done();
                    });
                });
        });
    });
};

module.exports = UtilTest;



