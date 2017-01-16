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
var classesId;
var classes;
var assetClass;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var newClasses = {
    "name": "Equit1y" + unique.get(),
    "color": "#343443"

};

var wrongclasses = {
    "name": "Equit1y" + unique.get(),
    "color": "343443"

};

var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    classes: constdata.classes.api,
    assetClass: constdata.assetClass.api
};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;
classes = inputData.classes;
assetClass = inputData.assetClass;

describe("**** Security Classes Test Cases ****", function () {
    describe("**** START ****", function () {
//===================================================Create Classes======================================================
        describe("CREATE CLASSES TEST CASE # 1", function () {
            it("Should Create Classes ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(classes)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newClasses)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            classesId = res.body.id;
                            done();
                        });
                    });
            });
        });
        describe("CREATE CLASSES TEST CASE # 2", function () {
            util.postInvalidToken(classes, newClasses);
            util.postWithoutToken(classes, newClasses);
        });
        describe("CREATE CLASSES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(classes)
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
        describe("CREATE CLASSES TEST CASE # 4 (Unprocessable Entity)", function () {
            it("Should Return 422 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(classes)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newClasses)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });
        describe("CREATE CLASSES TEST CASE # 5 (Bad Request)", function () {
            it("Should Return 400", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(classes)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(wrongclasses) //Wrong Color id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//===================================================Get All Classes Test Case================================
        describe("GET ALL CLASSES TEST CASE # 1", function () {
            it("Should Return All Classes", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(classes)
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
        describe("GET ALL CLASSES TEST CASE # 2", function () {
            util.getInvalidToken(classes);
            util.getWithoutToken(classes);
        });
//=======================================Get Securities under given Class============================================
        describe("GET SECURITIES UNDER GIVEN CLASS TEST CASE # 1", function () {
            it("Should Return Securities under given Class ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(assetClass + classesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if(res.status === 200){
                                res.body.should.be.instanceof(Array);
                                res.status.should.equal(expect);
                                done();
                            }else if (classesId === null) {
                                console.log("--id was NULL--");
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET SECURITIES UNDER GIVEN CLASS TEST CASE # 2", function () {
            util.getInvalidToken(assetClass + classesId);
            util.getWithoutToken(assetClass + classesId);
        });
        describe("GET SECURITIES UNDER GIVEN CLASS TEST CASE # 4 (Not Found)", function () {
            it("Should Return 200", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(assetClass + 'teamtunit')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
//==============================================Update Classes=====================================================================
        describe("UPDATE CLASSES TEST CASE # 1", function () {
            it("Should Update Classes", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(classes + '/' + classesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(newClasses)
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
        describe("UPDATE CLASSES TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(classes + '/' + classesId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(newClasses)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE CLASSES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(classes + '/' + classesId)
                    .send(newClasses)
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
        describe("UPDATE CLASSES TEST CASE # 4 (Not Found)", function () {
            it("Should Return  404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(classes + '/' + 999999999999999)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(wrongclasses) //Wrong Color id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//==============================================Delete Classes==============================================================
        describe("DELETE CLASSES TEST CASE # 1", function () {
            it("Should Delete Classes ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(classes + '/' + classesId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("DELETE CLASSES TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(classes + '/' + classesId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE CLASSES TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(classes + '/' + classesId)
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
        describe("DELETE CLASSES TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404/422", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(classes + '/99999999999')
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
