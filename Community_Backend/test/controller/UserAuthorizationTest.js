"use strict";
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var constdata = require('./../../test/config/Constants.js').Constants;
var UtilTest = require('./../../test/util/UtilTest.js');
var util = new UtilTest();
var btoa = require('btoa')
var jwt = require('jsonwebtoken');
var Constants = require('../../config').env;
var assert = require('assert');
var baseurl;
var token;
var username;
var password;
var type;
var expect;
var timeout;
var data;
var user;
var communityAccessToken = '';
var communityAccessToken = '';
var body = '';
var loginAs;
var loginAsInput;
var loginAsToken;
var loginAsRevert;
chai.use(chaiHttp);
var request = require('supertest');

var tokenInput = {
    baseurl: constdata.baseurl,
    api: constdata.login.api,
    username: constdata.login.input.username,
    password: constdata.login.input.password,
    type: constdata.login.type,
    expect: constdata.expect,
    timeout: constdata.timeout,
    user: constdata.user.api,
    loginAs: constdata.loginAs.api,
    loginAsInput: constdata.loginAs.input,
    loginAsRevert: constdata.loginAsRevert.api
};

baseurl = tokenInput.baseurl;
token = tokenInput.api;
username = tokenInput.username;
password = tokenInput.password;
type = tokenInput.type;
expect = tokenInput.expect;
timeout = tokenInput.timeout;
user = tokenInput.user;
loginAs = tokenInput.loginAs;
loginAsInput = tokenInput.loginAsInput;
loginAsRevert = tokenInput.loginAsRevert;

var server = require('supertest')(baseurl);

describe("**** User Authorization Test Cases ****", function () {
    describe("**** START ****", function () {
        describe("LOGIN TEST CASE # 1", function () {
            it("Should Return Auth Token", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(token)
                    .set('Authorization', 'Basic ' + btoa(username + ':' + password))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            res.body.should.have.property('community_access_token');
                            should.not.equal(res.body.community_access_token, undefined);
                            should.not.equal(res.body.community_access_token, null);
                            res.body.should.have.property('orion_access_token');
                            should.not.equal(res.body.orion_access_token, undefined);
                            should.not.equal(res.body.orion_access_token, null);
                            res.body.should.have.property('expires_in');
                            should.not.equal(res.body.expires_in, undefined);
                            should.not.equal(res.body.expires_in, null);
                            communityAccessToken = res.body.community_access_token;
                            cache.put('testLoginToken', communityAccessToken);
                            done();
                        });
                    });
            });
        });
        describe("VALIDATE AUTH TOKEN # ", function () {
            if (communityAccessToken != null) {
                it("Should Validate Auth Token", function (done) {
                    jwt.verify(communityAccessToken, Constants.sessionsecret, function (fail, cb) {
                        if (fail) {
                            return fail;
                        }
                        else {
                            communityAccessToken = communityAccessToken;
                        }
                    })
                    done();
                });
            }
        });
        describe("LOGIN TEST CASE # 3 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(token)
                    .set('Authorization', 'Basic ' + btoa(username + password)) // Invalid paramter, without colon 
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });

//==============================================================GET USER API TEST CASE================================================
        describe("GET USER API TEST CASE # 1", function () {
            it("Should Return User", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(user)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("GET API TEST CASE ", function () {
            util.getInvalidToken(user);
            util.getWithoutToken(user);

        });

//==============================================================Authentication - Login As ==================================================
        describe("LOGIN AS TEST CASE # 1", function () {
            it("Should Return Auth Token for another user", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(loginAs)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(loginAsInput)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                res.body.should.have.property('community_access_token');
                                should.not.equal(res.body.community_access_token, undefined);
                                should.not.equal(res.body.community_access_token, null);
                                res.body.should.have.property('orion_access_token');
                                should.not.equal(res.body.orion_access_token, undefined);
                                should.not.equal(res.body.orion_access_token, null);
                                res.body.should.have.property('expire_time');
                                should.not.equal(res.body.expire_time, undefined);
                                should.not.equal(res.body.expire_time, null);
                                loginAsToken = res.body.community_access_token;
                                done();
                            }
                            else {
                                console.log("--" + res.body.message + "--");
                                done();
                            }
                        });
                    });
            });
        });
        describe("LOGIN AS TEST CASE # 2 ", function () {
            util.postInvalidToken(loginAs, loginAsInput);
            util.postInvalidToken(loginAs, loginAsInput);

        });
        describe("LOGIN AS TEST CASE # 3 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(loginAs)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send({
                        "userId": 1 //Without FirmId
                    })
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
        describe("LOGIN AS TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(loginAs)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(
                    {
                        "userId": 99999999999, //Wrong UserId
                        "firmId": 477
                    }
                    )
                    .end(function (err, res) {
                        setTimeout(function () {
                            if(res.status === 404){
                                res.status.should.equal(404);
                                done();
                            }
                            else{
                                res.status.should.equal(401);
                                done();
                            }
                        });
                    });
            });
        });
        
//========================================Authentication - Revert logIn as =================================================
        describe("REVERT LOGIN AS TEST CASE # 1", function () {
            it("Should Revert login  user", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(loginAsRevert)
                    .set('Authorization', 'Session ' + loginAsToken)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            }
                            else {
                                console.log("--" + res.body.message + "--");
                                done();
                            }
                        });
                    });
            });
        });
        describe("REVERT LOGIN AS TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(loginAsRevert)
                    .set('Authorization', 'Session ' + loginAsToken)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
    });
});