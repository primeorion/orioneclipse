
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
var strategists;
var strategistId;
var strategistSimple; 
var strategistStatusList;
var strategistUserVerify;
var communityAccessToken = cache.get('testLoginToken')

chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    strategists: constdata.strategists.api,
    strategistSimple : constdata.strategistSimple.api,
    strategistStatusList : constdata.strategistStatusList.api,
    strategistUserVerify : constdata.strategistUserVerify.api
};

var addStrategist = {
    "name": "Demo Strategist",
    "status": 1,
    "users" : [{
        "id" : 912,
        "roleId" : 1,
        "email" : "test@gmail.com",
        "name" : "demo test"
    }]
};

var addStrategistWrongObject = {
    "name": "Demo Strategist",
    "status": 1,
    "users" : []
};

var updateStrategistSalesInfo = {
    "salesContact": "gurgaon",
    "salesPhone": "123456789",
    "salesEmail": "test@gmail.com",
};

var updateStrategistSupportInfo = {
    "supportContact": "gurgaon",
    "supportPhone": "123456789",
    "supportEmail": "test@gmail.com",
};

var updateStrategistCommentaryInfo = {
    "strategyCommentary" : "commentary info"
};

var updateStrategistLegalAgreementInfo = {
    "legalAgreement": "legal agreement"
};

var updateStrategistAdvertisementInfo = {
    "advertisementMessage": "advertisementMessage"
}

var updateStrategistProfile = {
    "name": "New Test",
    "status": 1,
    "salesContact": "physical address",
    "salesPhone": 8882124685,
    "legalAgreement": "legalAgreement",
    "salesEmail": "test11111@gmail.com",
    "supportEmail": "test11111@gmail.com",
    "supportContact": "physical address", 
    "supportPhone": 1236478258,
    "strategyCommentary": "strategyCommentary",
    "advertisementMessage": "advertisementMessage"
}

baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect;
strategists =  inputData.strategists;
strategistSimple = inputData.strategistSimple;
strategistStatusList = inputData.strategistStatusList;
strategistUserVerify = inputData.strategistUserVerify;

describe("**** Strategists Test Cases ****", function () {
    describe("**** START ****", function () {
        //=======================================Add new Strategist==================================
        describe("ADD NEW STRATEGIST TEST CASE # 1", function () {
            it("Should Add New Strategist", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(strategists)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(addStrategist)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(201);
                        if (res.body.id) {
                            strategistId = res.body.id;
                            done();
                        } else {
                            strategistId = null;
                            done();
                        }
                    });
                });
            });
        });
        describe("ADD NEW STRATEGIST TEST CASE # 2", function () {
            util.postInvalidToken(strategists, addStrategist);
            util.postWithoutToken(strategists, addStrategist);
        });
        describe("ADD NEW STRATEGIST TEST CASE # 3 (Forbidden request)", function () {
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
        describe("ADD NEW STRATEGIST TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .post(strategists)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(addStrategistWrongObject) //Missing users object
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(404);
                        done();
                    });
                });
            });
        });
         //=======================================Update Strategist==================================
        describe("UPDATE STRATEGIST TEST CASE # 1", function () {
            it("Should Update Strategist", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(addStrategist)
                .end(function (err, res) {
                    setTimeout(function () {
                        if(res.status === 201){
                            res.status.should.equal(201);
                            done();
                        }else if(res.status === 200){
                            res.status.should.equal(200);
                            done();
                        }
                    });
                });
            });
        });
        describe("UPDATE STRATEGIST TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId;
            util.putInvalidToken(temp, addStrategist);
            util.putWithoutToken(temp, addStrategist);
        });
        describe("UPDATE STRATEGIST TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId)
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
        //=======================================Update Strategist Sales Info==================================
        describe("UPDATE STRATEGIST SALES INFO TEST CASE # 1", function () {
            it("Should Update Strategist Sales Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' +  strategistId + '/sales')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(updateStrategistSalesInfo)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("UPDATE STRATEGIST SALES INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId + '/sales';
            util.putInvalidToken(temp, updateStrategistSalesInfo);
            util.putWithoutToken(temp, updateStrategistSalesInfo);
        });
        describe("UPDATE STRATEGIST SALES INFO TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId + '/sales')
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
        //=======================================Update Strategist Support Info==================================
        describe("UPDATE STRATEGIST SUPPORT INFO TEST CASE # 1", function () {
            it("Should Update Strategist Support Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId + '/support')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(updateStrategistSupportInfo)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("UPDATE STRATEGIST SUPPORT INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId + '/support';
            util.putInvalidToken(temp, updateStrategistSupportInfo);
            util.putWithoutToken(temp, updateStrategistSupportInfo);
        });
        describe("UPDATE STRATEGIST SUPPORT INFO TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId + '/support')
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
         //=======================================Update Strategist Commentary Info==================================
        describe("UPDATE STRATEGIST COMMENTARY INFO TEST CASE # 1", function () {
            it("Should Update Strategist Commentary Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId +'/commentary')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(updateStrategistCommentaryInfo)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("UPDATE STRATEGIST COMMENTARY INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId +'/commentary';
            util.putInvalidToken(temp, updateStrategistCommentaryInfo);
            util.putWithoutToken(temp, updateStrategistCommentaryInfo);
        });
        describe("UPDATE STRATEGIST COMMENTARY INFO TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId +'/commentary')
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
        //=======================================Update Strategist legalAgreement Info==================================
        describe("UPDATE STRATEGIST LEGAL AGREEMENT INFO TEST CASE # 1", function () {
            it("Should Update Strategist legal Agreement Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId +'/legalAgreement')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(updateStrategistLegalAgreementInfo)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("UPDATE STRATEGIST LEGAL AGREEMENT INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId +'/legalAgreement';
            util.putInvalidToken(temp, updateStrategistLegalAgreementInfo);
            util.putWithoutToken(temp, updateStrategistLegalAgreementInfo);
        });
        describe("UPDATE STRATEGIST LEGAL AGREEMENT INFO TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId +'/legalAgreement')
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
        //=======================================Update Strategist advertisement Info==================================
        describe("UPDATE STRATEGIST ADVERTSEMENT INFO TEST CASE # 1", function () {
            it("Should Update Strategist advertisement Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId +'/advertisementMessage')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(updateStrategistAdvertisementInfo)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("UPDATE STRATEGIST ADVERTSEMENT INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId +'/advertisementMessage';
            util.putInvalidToken(temp, updateStrategistAdvertisementInfo);
            util.putWithoutToken(temp, updateStrategistAdvertisementInfo);
        });
        describe("UPDATE STRATEGIST ADVERTSEMENT INFO TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId +'/advertisementMessage')
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
         //=======================================Update Strategist Profile==================================
        describe("UPDATE STRATEGIST PROFILE TEST CASE # 1", function () {
            it("Should Update Strategist Profile", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId + '/profile')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .send(updateStrategistProfile)
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("UPDATE STRATEGIST PROFILE TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId + '/profile';
            util.putInvalidToken(temp, updateStrategistProfile);
            util.putWithoutToken(temp, updateStrategistProfile);
        });
        describe("UPDATE STRATEGIST PROFILE TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .put(strategists + '/' + strategistId + '/profile')
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
        //===============================Get Strategist Count ===================================
        describe("GET STRATEGIST COUNT TEST CASE # 1", function () {
            it("Should Return Count of strategist ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/count')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST COUNT TEST CASE # 2", function () {
            var temp = strategists + '/count';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //===============================Get Strategist Status List ===================================
        describe("GET STRATEGIST STATUS LIST TEST CASE # 1", function () {
            it("Should Return status list of strategist ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategistStatusList)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST STATUS LIST TEST CASE # 2", function () {
            util.getInvalidToken(strategistStatusList);
            util.getWithoutToken(strategistStatusList);
        });
        //===============================Get ALL Strategist List ===================================
        describe("GET ALL STRATEGIST TEST CASE # 1", function () {
            it("Should Return list of all strategist ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists)
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
        describe("GET ALL STRATEGIST TEST CASE # 2", function () {
            util.getInvalidToken(strategists);
            util.getWithoutToken(strategists);
        });
        //===============================Get ALL Strategist Simple List ===================================
        describe("GET ALL STRATEGIST SIMPLE TEST CASE # 1", function () {
            it("Should Return list of all strategist Simple ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategistSimple)
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
        describe("GET ALL STRATEGIST SIMPLE TEST CASE # 2", function () {
            util.getInvalidToken(strategistSimple);
            util.getWithoutToken(strategistSimple);
        });
        //===============================Get Strategist Detail ===================================
        describe("GET STRATEGIST DETAIL TEST CASE # 1", function () {
            it("Should Return list of all strategist Simple ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/' + strategistId)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST DETAIL TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId;
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //===============================Get Strategist Detail Simple ===================================
        describe("GET STRATEGIST DETAIL SIMPLE TEST CASE # 1", function () {
            it("Should Return details of strategist Simple ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategistSimple + '/' + strategistId)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST DETAIL SIMPLE TEST CASE # 2", function () {
            var temp = strategistSimple + '/' + strategistId;
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //===============================Get Strategist Profile Detail ===================================
        describe("GET STRATEGIST PROFILE TEST CASE # 1", function () {
            it("Should Return details of strategist profile ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/' + strategistId + '/profile')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST PROFILE TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId + '/profile';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //===============================Verify Strategist User ===================================
        describe("VERIFY STRATEGIST USER TEST CASE # 1", function () {
            it("Should Return status of strategist user", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategistUserVerify + '/1')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("VERIFY STRATEGIST USER TEST CASE # 2", function () {
            var temp = strategistUserVerify + '/2';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //=======================================Get Strategist Sales Info==================================
        describe("GET STRATEGIST SALES INFO TEST CASE # 1", function () {
            it("Should return Strategist Sales Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/' +  strategistId + '/sales')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST SALES INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId + '/sales';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //=======================================Get Strategist Support Info==================================
        describe("GET STRATEGIST SUPPORT INFO TEST CASE # 1", function () {
            it("Should return Strategist Support Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/' + strategistId + '/support')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST SUPPORT INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId + '/support';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
         //=======================================Get Strategist Commentary Info==================================
        describe("GET STRATEGIST COMMENTARY INFO TEST CASE # 1", function () {
            it("Should return Strategist Commentary Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/' + strategistId +'/commentary')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST COMMENTARY INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId +'/commentary';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //=======================================Get Strategist legalAgreement Info==================================
        describe("GET STRATEGIST LEGAL AGREEMENT INFO TEST CASE # 1", function () {
            it("Should return Strategist legal Agreement Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/' + strategistId +'/legalAgreement')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST LEGAL AGREEMENT INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId +'/legalAgreement';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //=======================================Get Strategist advertisement Info==================================
        describe("GET STRATEGIST ADVERTSEMENT INFO TEST CASE # 1", function () {
            it("Should return Strategist advertisement Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/' + strategistId +'/advertisementMessage')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST ADVERTSEMENT INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId +'/advertisementMessage';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //=======================================Get Strategist documents Info==================================
        describe("GET STRATEGIST DOCUMENTS TEST CASE # 1", function () {
            it("Should return Strategist documents Info", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .get(strategists + '/' + strategistId +'/documents')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("GET STRATEGIST ADVERTSEMENT INFO TEST CASE # 2", function () {
            var temp = strategists + '/' + strategistId +'/documents';
            util.getInvalidToken(temp);
            util.getWithoutToken(temp);
        });
        //==================================Delete Strategist User========================================
        describe("DELETE STRATEGIST USER TEST CASE # 1", function () {
            it("Should Delete Strategist User ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .delete(strategists + '/' + strategistId + '/' + addStrategist.users[0].id + '/user')
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("DELETE STRATEGIST USER TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .delete(strategists + '/' + strategistId + '/' + addStrategist.users[0].id + '/user')
                .set('Authorization', cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(401);
                        done();
                    });
                });
            });
        });
        describe("DELETE STRATEGIST USER TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .delete(strategists + '/' + strategistId + '/' + addStrategist.users[0].id + '/user')
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
        describe("DELETE STRATEGIST USER TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .delete(strategists + '/' + strategistId + '/999999999999' + '/user')
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
        //==================================Delete Strategist========================================
        describe("DELETE STRATEGIST TEST CASE # 1", function () {
            it("Should Delete Strategist ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .delete(strategists + '/' + strategistId)
                .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(expect);
                        done();
                    });
                });
            });
        });
        describe("DELETE STRATEGIST TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .delete(strategists + '/' + strategistId)
                .set('Authorization', cache.get('testLoginToken'))
                .end(function (err, res) {
                    setTimeout(function () {
                        res.status.should.equal(401);
                        done();
                    });
                });
            });
        });
        describe("DELETE STRATEGIST TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
            this.timeout(timeout);
            chai.request(baseurl)
                .delete(strategists + '/' + strategistId)
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
        describe("DELETE STRATEGIST TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
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