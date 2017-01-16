
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
var approvedModels;
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    models: constdata.models.api,
    approvedModels:constdata.approvedModels.api

};

baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect;
models = inputData.models;
approvedModels = inputData.approvedModels;
describe("**** Eclipse Community Model Test Cases ****", function () {
    describe("**** START ****", function () {
        //============Get Community Model by Strategist Ids================
        describe("GET COMMUNITY MODELS TEST CASE # 1", function () {
            it("Should Return Community Models ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(models)
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
        describe("GET COMMUNITY MODELS TEST CASE # 2", function () {
            util.getInvalidToken(models);
            util.getWithoutToken(models);
        });
        describe("GET COMMUNITY MODELS TEST CASE # 4 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get('v1/community/models?strategistId=999999999999,9999999')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        //============List of Approved Model by strategistId================
        describe("LIST OF APPROVED COMMUNITY MODELS TEST CASE # 1", function () {
            it("Should Return Approved Community Models ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(approvedModels)
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
        describe("LIST OF APPROVED COMMUNITY MODELS TEST CASE # 2", function () {
            util.getInvalidToken(approvedModels);
            util.getWithoutToken(approvedModels);
        });
        describe("LIST OF APPROVED COMMUNITY MODELS TEST CASE # 4 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get('v1/community/models/approved?strategistId=999999999999999')
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
