
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
var asideCashAmountType;
var asideCashExpirationType;
var asideCashTransactionType;
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    asideCashAmountType: constdata.asideCashAmountType.api,
    asideCashExpirationType:constdata.asideCashExpirationType.api,
    asideCashTransactionType:constdata.asideCashTransactionType.api
};

baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect;
asideCashAmountType = inputData.asideCashAmountType;
asideCashExpirationType = inputData.asideCashExpirationType;
asideCashTransactionType = inputData.asideCashTransactionType;
describe("**** Accounts Test Cases ****", function () {
    describe("**** START ****", function () {
        //============Get aside CashAmountType=======================
        describe("GET ASIDE CASH AMOUNT TYPE TEST CASE # 1", function () {
            it("Should Return aside CashAmountType", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(asideCashAmountType)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                           // res.body.should.be.instanceof(Array);
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("GET ASIDE CASH AMOUNT TYPE TEST CASE # 2", function () {
            util.getInvalidToken(asideCashAmountType);
            util.getWithoutToken(asideCashAmountType);
        });

         //============Get aside CashExpirationType======================
        describe("GET ASIDE CASH EXPIRATION TYPE TEST CASE # 1", function () {
            it("Should Return aside CashExpirationType", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(asideCashExpirationType)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                           // res.body.should.be.instanceof(Array);
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("GET ASIDE CASH EXPIRATION TYPE TEST CASE # 2", function () {
            util.getInvalidToken(asideCashExpirationType);
            util.getWithoutToken(asideCashExpirationType);
        });

         //============Get aside CashTransactionType======================
        describe("GET ASIDE CASH TRANSACTION TYPE TEST CASE # 1", function () {
            it("Should Return aside CashTransactionType", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(asideCashTransactionType)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                           // res.body.should.be.instanceof(Array);
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("GET ASIDE CASH TRANSACTION TYPE TEST CASE # 2", function () {
            util.getInvalidToken(asideCashTransactionType);
            util.getWithoutToken(asideCashTransactionType);
        });
    });
});
