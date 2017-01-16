
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
var allViews;
var viewId;
var viewName;
var viewType;
var eclipseAccessToken = cache.get('testLoginToken')

chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    allViews: constdata.allViews.api,
    viewType:constdata.viewType.api

};

var addNewView = {
    "name": "Custom Portfolio list Vie1w111" + unique.get(),
    "viewTypeId": "1",
    "isPublic": true,
    "isDefault": false,
    "filter": "portfolioStatusId",
    "gridColumnDefs": {
        "field1": "Store whatever is needed by ng-grid to store",
        "field2": "filters/columns/sort order, column width, grouping, sums, etc"
    }
};

var addNewViewWrongViewTypeId = {
    "name": "Custom Portfolio list Vie1w111" + unique.get(),
    "viewTypeId": "99999999999",
    "isPublic": true,
    "isDefault": false,
    "filter": "portfolioStatusId",
    "gridColumnDefs": {
        "field1": "Store whatever is needed by ng-grid to store",
        "field2": "filters/columns/sort order, column width, grouping, sums, etc"
    }
};

baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect;
allViews = inputData.allViews;
viewType = inputData.viewType;
describe("**** Settings Test Cases ****", function () {
    describe("**** START ****", function () {
        //=========================Get list of all Views=================================
        describe("GET LIST OF ALL VIEWS TEST CASE # 1", function () {
            it("Should Return All Views", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(allViews)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("GET LIST OF ALL VIEWS TEST CASE # 2", function () {
            util.getInvalidToken(allViews);
            util.getWithoutToken(allViews);
        });
        //===============================Add new View==========================
        describe("ADD NEW VIEW TEST CASE # 1", function () {
            it("Should Add New View", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(allViews)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addNewView)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            if (res.body.id) {
                                viewId = res.body.id;
                                viewName = res.body.name;
                                done();
                            } else {
                                viewId = null;
                                viewName = null;
                                done();
                            }
                        });
                    });
            });
        });
        describe("ADD NEW VIEW TEST CASE # 2", function () {
            util.postInvalidToken(allViews, addNewView);
            util.postWithoutToken(allViews, addNewView);
        });
        describe("ADD NEW VIEW TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(allViews)
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
        describe("ADD NEW VIEW TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(allViews)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addNewViewWrongViewTypeId) //Wrong viewTypeId 
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });

        //===================================Get View Details=======================
        describe("GET VIEW DETAILS TEST CASE # 1", function () {
            it("Should Return View Details ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(allViews + '/' + viewId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            res.body.should.have.property('id');
                            res.body.should.have.property('name');
                            res.body.should.have.property('viewType');
                            res.body.should.have.property('viewTypeId');
                            done();
                        });
                    });
            });
        });
        describe("GET VIEW DETAILS TEST CASE # 2", function () {
            var viewsDetail = allViews + '/' + viewId;
            util.getInvalidToken(viewsDetail);
            util.getWithoutToken(viewsDetail);

            viewsDetail = allViews + '/9999999999999999999';
            util.getNotFound(viewsDetail);
        });
        //==========================Get View by name====================
        describe("GET VIEW BY NAME TEST CASE # 1", function () {
            it("Should Return View  ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(allViews + '?name=' + viewName)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("GET VIEW BY NAME TEST CASE # 2", function () {
            var viewsDetail = allViews + '?name=' + viewName;
            util.getInvalidToken(viewsDetail);
            util.getWithoutToken(viewsDetail);

        });
        //=======================================Update View==================================
        describe("UPDATE VIEW TEST CASE # 1", function () {
            it("Should Update View", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(allViews + '/' + viewId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addNewView)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE VIEW TEST CASE # 2", function () {
            var temp = allViews + '/' + viewId;
            util.putInvalidToken(temp, addNewView);
            util.putWithoutToken(temp, addNewView);
        });
        describe("UPDATE VIEW TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(allViews + '/' + viewId)
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
        describe("UPDATE VIEW TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(allViews + '/' + viewId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(addNewViewWrongViewTypeId) //Wrong Model id
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
        //==========================Get list of all View Types=====================
        describe("GET ALL VIEW TYPES STATUS TEST CASE # 1", function () {
            it("Should Return All View Types ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(allViews + '/viewTypes')
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
        describe("GET ALL VIEW TYPES TEST CASE # 2", function () {
            util.getInvalidToken(allViews + '/viewTypes');
            util.getWithoutToken(allViews + '/viewTypes');
        });
       //===========================Get list of all Views by View type Id===============================
        describe("GET LIST OF ALL VIEWS BY VIEW TYPE ID TEST CASE # 1", function () {
            it("Should Return view list ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(viewType + viewId)
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
        describe("GET LIST OF ALL VIEWS BY VIEW TYPE ID TEST CASE # 2", function () {
            util.getInvalidToken(viewType + viewId);
            util.getWithoutToken(viewType + viewId);
        });
        describe("GET LIST OF ALL VIEWS BY VIEW TYPE ID CASE # 4 (Not Found)", function () {
            it("Should Return expect", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(viewType + 'cxcxc222222222')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
// =============================Delete views==================================
        describe("DELETE VIEWS TEST CASE # 1", function () {
            it("Should Delete views ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(allViews + '/' + viewId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("DELETE VIEWS TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(allViews + '/' + viewId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE VIEWS TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(allViews + '/' + viewId)
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
        describe("DELETE VIEWS TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(allViews + '/' + viewId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else if (res.status === 422) {
                                res.status.should.equal(422);
                                done();
                            } else {
                                res.status.should.equal(expect);
                                done();
                            }
                        });
                    });
            });
        });
    
    });
});
