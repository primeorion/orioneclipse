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
var subClassesId;
var subClasses;
var assetSubClass;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var newSubClasses = {
    "name": "Equit1y" + unique.get(),
    "color": "#343443"

};

var wrongSubClasses = {
    "name": "Equit1y" + unique.get(),
    "color": "343443"

};

var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    subClasses: constdata.subClasses.api,
    assetSubClass: constdata.assetSubClass.api
};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;
subClasses = inputData.subClasses;
assetSubClass = inputData.assetSubClass;

describe("**** Security Sub Classes Test Cases ****", function () {
    describe("**** START ****", function () {
//===================================================Create Sub Classes=================================================
        describe("CREATE SUB CLASSES TEST CASE # 1", function () {
            it("Should Create Sub Classes ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(subClasses)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newSubClasses)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            subClassesId = res.body.id;
                            done();
                        });
                    });
            });
        });
        describe("CREATE SUB CLASSES TEST CASE # 2", function () {
            util.postInvalidToken(subClasses, newSubClasses);
            util.postWithoutToken(subClasses, newSubClasses);
        });
        describe("CREATE SUB CLASSES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(subClasses)
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
        describe("CREATE SUB CLASSES TEST CASE # 4 (Unprocessable Entity)", function () {
            it("Should Return 422 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(subClasses)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newSubClasses)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });
        describe("CREATE SUB CLASSES TEST CASE # 5 (Bad Request)", function () {
            it("Should Return 400", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(subClasses)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(wrongSubClasses) //Wrong Color id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//===================================================Get All Sub Classes Test Case================================
        describe("GET ALL SUB CLASSES TEST CASE # 1", function () {
            it("Should Return All Sub Classes", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(subClasses)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("GET ALL SUB CLASSES TEST CASE # 2", function () {
            util.getInvalidToken(subClasses);
            util.getWithoutToken(subClasses);
        });
//=======================================Get Securities under given subClass============================================
        describe("GET SECURITIES UNDER GIVEN SUBCLASS TEST CASE # 1", function () {
            it("Should Return Securities under given subClass ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(assetSubClass + subClassesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if(res.status === 200){
                                res.body.should.be.instanceof(Array);
                                res.status.should.equal(expect);
                                done();
                            }else if (subClassesId === null) {
                                console.log("--id was NULL--");
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET SECURITIES UNDER GIVEN SUBCLASS TEST CASE # 2", function () {
            util.getInvalidToken(assetSubClass + subClassesId);
            util.getWithoutToken(assetSubClass + subClassesId);
        });
        describe("GET SECURITIES UNDER GIVEN SUBCLASS TEST CASE # 4 (Not Found)", function () {
            it("Should Return 200", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(assetSubClass + 'teamtunit')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
//==============================================Update Sub Classes=====================================================================
        describe("UPDATE SUB CLASSES TEST CASE # 1", function () {
            it("Should Update Sub Classes", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(subClasses + '/' + subClassesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newSubClasses)
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
        describe("UPDATE SUB CLASSES TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(subClasses + '/' + subClassesId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(newSubClasses)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE SUB CLASSES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(subClasses + '/' + subClassesId)
                    .send(newSubClasses)
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
        describe("UPDATE SUB CLASSES TEST CASE # 4 (Not Found)", function () {
            it("Should Return  404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(subClasses + '/' + 999999999999999)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(wrongSubClasses) //Wrong Color id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//==============================================Delete Sub Classes==============================================================
        describe("DELETE SUB CLASSES TEST CASE # 1", function () {
            it("Should Delete Sub Classes ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(subClasses + '/' + subClassesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                     });
            });
        });
        describe("DELETE SUB CLASSES TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(subClasses + '/' + subClassesId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE SUB CLASSES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(subClasses + '/' + subClassesId)
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
        describe("DELETE SUB CLASSES TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404/422", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(subClasses + '/99999999999')
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
