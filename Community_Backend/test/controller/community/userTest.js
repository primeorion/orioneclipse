
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
var userRoles;
var loggedInUserRole;

var communityAccessToken = cache.get('testLoginToken')

chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    userRoles : constdata.userRoles.api,
    loggedInUserRole : constdata.loggedInUserRole.api
};

baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect;
userRoles = inputData.userRoles;
loggedInUserRole = inputData.loggedInUserRole;

describe("**** Users Test Cases ****", function () {
    describe("**** START ****", function () {
        //===============================Get User Roles Master List ===================================
        describe("GET USER ROLES MASTER LST TEST CASE # 1", function () {
            it("Should Return Users Master List of Roles ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(userRoles)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET USER ROLES MASTER LST TEST CASE # 2", function () {
            util.getInvalidToken(userRoles);
            util.getWithoutToken(userRoles);
        });
        //===============================Get LoggedIn user Role ===================================
        describe("GET LOGGED IN USER ROLE TEST CASE # 1", function () {
            it("Should Return LoggedIn User Role ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(loggedInUserRole)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET LOGGED IN USER ROLE TEST CASE # 2", function () {
            util.getInvalidToken(loggedInUserRole);
            util.getWithoutToken(loggedInUserRole);
        });
    });
});