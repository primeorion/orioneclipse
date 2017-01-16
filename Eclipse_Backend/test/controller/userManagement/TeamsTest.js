"use strict";
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var constdata = require('../../config/Constants.js').Constants;
var unique = require('../../../helper/UniqueIdGenerator');
var UtilTest = require('./../../../test/util/UtilTest.js');
var util = new UtilTest();
var assert = require('assert');
var body = '';
var expect;
var baseurl;
var timeout;
var teams;
var teamId;
var teamName;
var searchTeam;
var searchUser;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var createTeam = {
    "name": "newteam" + unique.get(),
    "portfolioAccess": true,
    "modelAccess": true,
    "status": 1

};

var updateTeam = {
    "name": "updatingname" + unique.get(),
    "portfolioAccess": true,
    "modelAccess": true,
    "status": 1
};

var portfolioAccessWrong = {
    "name": "newestteam",
    "portfolioAccess": 10,
    "modelAccess": true,
};

var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    teams: constdata.Teams.api,
    searchTeam: constdata.searchTeam.api,
    searchUser: constdata.searchUser.api
};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;
teams = inputData.teams;
searchTeam = inputData.searchTeam;
searchUser = inputData.searchUser;

describe("**** Teams Test Cases ****", function () {
    describe("**** START ****", function () {
//===================================================Create Team===============================
        describe("CREATE TEAM TEST CASE # 1", function () {
            it("Should Create Team ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(teams)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(createTeam)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            teamId = res.body.id;
                            teamName = res.body.name;
                            done();
                        });
                    });
            });
        });
        describe("CREATE TEAM TEST CASE # 2", function () {
            util.postInvalidToken(teams, createTeam);
            util.postWithoutToken(teams, createTeam);
        });
        describe("CREATE TEAM TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(teams)
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
            describe("CREATE TEAM TEST CASE # 4 (Unprocessable Entity)", function () {
                it("Should Return 422 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(createTeam)
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(422);
                                done();
                            });
                        });
                });
            });
            describe("CREATE TEAM TEST CASE # 5 (Bad Request)", function () {
                it("Should Return 400", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(portfolioAccessWrong) //Wrong portfolioAccess id
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
//==============================================Get all teams====================================
            describe("GET ALL TEAMS TEST CASE # 1", function () {
                it("Should Return All Teams ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(teams)
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
            describe("GET ALL TEAMS TEST CASE # 2", function () {
                util.getInvalidToken(teams);
                util.getWithoutToken(teams);
            });
//===============================================================Get Team Details====================
            describe("GET TEAM DETAILS TEST CASE # 1", function () {
                it("Should Return Team details ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(teams + '/' + teamId)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(expect);
                                res.body.should.have.property('id');
                                res.body.should.have.property('name');
                                res.body.should.have.property('portfolioAccess');
                                res.body.should.have.property('modelAccess');
                                done();
                            });
                        });
                });
            });
            describe("GET TEAM DETAILS TEST CASE # 2", function () {
                var teamsDetail = teams + '/' + teamId;
                util.getInvalidToken(teamsDetail);
                util.getWithoutToken(teamsDetail);

                teamsDetail = teams + '/9999999999999999999';
                util.getNotFound(teamsDetail);
            });
//===================================================Update Team====================================
            describe("UPDATE TEAM TEST CASE # 1", function () {
                it("Should Update Team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .put(teams + '/' + teamId)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(updateTeam)
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(200);
                                done();
                            });
                        });
                });
            });
            describe("UPDATE TEAM TEST CASE # 2 (Bad request)", function () {
                it("Should Return 400 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .put(teams + '/' + teamId)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
            describe("UPDATE TEAM TEST CASE # 3 (Unauthorized request)", function () {
                it("Should Return 401 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .put(teams + '/' + teamId)
                        .set('Authorization', cache.get('testLoginToken'))
                        .send(updateTeam)
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(401);
                                done();
                            });
                        });
                });
            });
            describe("UPDATE TEAM TEST CASE # 4 (Forbidden request)", function () {
                it("Should Return 403/401 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .put(teams + '/' + teamId)
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
            describe("UPDATE TEAM TEST CASE # 5 (Unprocessable Entity)", function () {
                it("Should Return 422", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .put(teams + '/99999999')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(updateTeam)
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(422);
                                done();
                            });
                        });
                });
            });
//===================================================Assign Advisors to team===========================
            describe("ASSIGN ADVISORS TO TEAM TEST CASE # 1", function () {
                it("Should Assign Advisors to team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/Advisors')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(
                        {
                            "advisorIds": 1
                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                if (res.status === 200) {
                                    res.status.should.equal(200);
                                    done();
                                }
                                else {
                                    res.status.should.equal(400);
                                    done();
                                }
                            });
                        });
                });
            });
            describe("ASSIGN ADVISORS TO TEAM TEST CASE # 2 (Bad request)", function () {
                it("Should Return 400 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/Advisors')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
            describe("ASSIGN ADVISORS TO TEAM TEST CASE # 3", function () {
                var assignAdvisor = {
                    "advisorIds": 1
                };
                util.postInvalidToken(teams + '/' + teamId + '/Advisors', assignAdvisor);
                util.postWithoutToken(teams + '/' + teamId + '/Advisors', assignAdvisor);
            });
            describe("ASSIGN ADVISORS TO TEAM TEST CASE # 4 (Bad Request)", function () {
                it("Should Return 400 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/Advisors')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(
                        {

                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
            describe("ASSIGN ADVISORS TO TEAM TEST CASE # 5 (Bad Request)", function () {
                it("Should Return 400", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/Advisors')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(
                        {
                            "advisorIds": 11212
                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
//===================================================Assign User to team==================================
            describe("ASSIGN USER TO TEAM TEST CASE # 1", function () {
                it("Should Assign User to team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/users')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .set('Content-Type', 'application/json')
                        .send(
                        {
                            "userIds": 324578
                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                if (res.status === 200) {
                                    res.status.should.equal(200);
                                    done();
                                }
                                else {
                                    res.status.should.equal(400);
                                    done();
                                }
                            });
                        });
                });
            });
            describe("ASSIGN USER TO TEAM TEST CASE # 2 (Bad request)", function () {
                it("Should Return 400 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/users')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
            describe("ASSIGN USER TO TEAM TEST CASE # 3 ", function () {
                var assignData = {
                    "userIds": 324578
                };
                util.postInvalidToken(teams + '/' + teamId + '/users', assignData);
                util.postWithoutToken(teams + '/' + teamId + '/users', assignData);
            });
            describe("ASSIGN USER TO TEAM TEST CASE # 4 (Bad Request)", function () {
                it("Should Return 400 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/users')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(
                        {

                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
            describe("ASSIGN USER TO TEAM TEST CASE # 5 (Bad Request)", function () {
                it("Should Return 400", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/users')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(
                        {
                            "userIds": 3245781
                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
//=================================================Assign Portfolios to team=============================
            describe("ASSIGN PORTFOLIOS TO TEAM TEST CASE # 1", function () {
                it("Should Assign Portfolios to team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/Portfolios')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(
                        {
                            "portfolioIds": 1
                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                if (res.status === 200) {
                                    res.status.should.equal(200);
                                    done();
                                }
                                else {
                                    res.status.should.equal(400);
                                    done();
                                }
                            });
                        });
                });
            });
            describe("ASSIGN PORTFOLIOS TO TEAM TEST CASE # 2 (Bad request)", function () {
                it("Should Return 400 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/Portfolios')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });

            });
            describe("ASSIGN PORTFOLIOS TO TEAM TEST CASE # 3", function () {
                var assignPortfolos = {
                    "portfolioIds": 1
                };
                util.postInvalidToken(teams + '/' + teamId + '/Portfolios', assignPortfolos);
                util.postWithoutToken(teams + '/' + teamId + '/Portfolios', assignPortfolos);
            });
            describe("ASSIGN PORTFOLIOS TO TEAM TEST CASE # 5 (Unprocessable Entity)", function () {
                it("Should Return 422/400 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/Portfolios')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(
                        {

                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                if (res.status === 422) {
                                    res.status.should.equal(422);
                                    done();
                                }
                                else {
                                    res.status.should.equal(400);
                                    done();
                                }
                            });
                        });
                });
            });
            describe("ASSIGN PORTFOLIOS TO TEAM TEST CASE # 5 (Bad Request)", function () {
                it("Should Return 400", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/Portfolios')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(
                        {
                            "portfolioIds": 11111111
                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(400);
                                done();
                            });
                        });
                });
            });
//==============================================Search team=====================================
            describe("SEARCH TEAM TEST CASE # 1", function () {
                it("Should Return Team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(searchTeam + teamName)
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
            describe("SEARCH TEAM TEST CASE # 2", function () {
                util.getInvalidToken(searchTeam + teamName);
                util.getWithoutToken(searchTeam + teamName);
            });
            describe("SEARCH TEAM TEST CASE # 4 (Not Found)", function () {
                it("Should Return 200", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(searchTeam + 'teamtunit')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(200);
                                done();
                            });
                        });
                });
            });
//==============================================Delete team========================================
            describe("DELETE TEAM TEST CASE # 1", function () {
                it("Should Delete Team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .delete(teams + '/' + teamId)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(expect);
                                done();
                            });
                        });
                });
            });
            describe("DELETE TEAM TEST CASE # 2 (Unauthorized request)", function () {
                it("Should Return 401 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .delete(teams + '/' + teamId)
                        .set('Authorization', cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(401);
                                done();
                            });
                        });
                });
            });
            describe("DELETE TEAM TEST CASE # 3 (Forbidden request)", function () {
                it("Should Return 403/401 ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .delete(teams + '/' + teamId)
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
            describe("DELETE TEAM TEST CASE # 4 (Not Found)", function () {
                it("Should Return 404", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .delete(teams + '/99999999999')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                if (res.status === 404) {
                                    res.status.should.equal(404);
                                    done();
                                }
                                else {
                                    res.status.should.equal(200);
                                    done();
                                }
                            });
                        });
                });
            });
//===============================================================Get Team Details After Deletion=============
            describe("GET TEAM DETAILS AFTER DELETION TEST CASE # 1", function () {
                it("Should Return Team details ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(teams + '/' + teamId)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(404);
                                done();
                            });
                        });
                });
            });
// =================================================User And Team Dependent Unit Test =========================
            describe("USER AND TEAM DEPENDENT TEST CASE # 1 ", function () {
                it("Should Create Team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(createTeam)
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(201);
                                teamId = res.body.id;
                                teamName = res.body.name;
                                done();
                            });
                        });
                });
            });
            describe("USER AND TEAM DEPENDENT TEST CASE # 2", function () {
                it("Should Assign User to team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(teams + '/' + teamId + '/users')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .set('Content-Type', 'application/json')
                        .send(
                        {
                            "userIds": 324578
                        }
                        )
                        .end(function (err, res) {
                            setTimeout(function () {
                                if (res.status === 200) {
                                    res.status.should.equal(200);
                                    done();
                                }
                                else {
                                    res.status.should.equal(400);
                                    done();
                                }
                            });
                        });
                });
            });
            describe("USER AND TEAM DEPENDENT TEST CASE # 3 ", function () {
                it("Should Not Delete Team ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .delete(teams + '/' + teamId)
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



