"use strict";
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var assert = require('assert');
var constdata = require('../../config/Constants.js').Constants;
var unique = require('../../../helper/UniqueIdGenerator');
var UtilTest = require('./../../../test/util/UtilTest.js');
var util = new UtilTest();
var body = '';
var expect;
var baseurl;
var timeout;
var Roles;
var roleType;
var roleId = '';
var roleName = '';
var onRoleType = '';
var searchRole = '';
var reAssignRole = '';
var roleTypeNotFound;
var searchRoleNotFound;
var users;
var userId;
var reAssignRoleInput;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var createRole = {
    "name": "UnitTestRole" + unique.get(),
    "roleTypeId": 1,
    "status": 1,
    "startDate": "01/22/2016",
    "expireDate": "12/25/2016",
    "privileges": [
        {
            "id": 57,
            "canAdd": true,
            "canUpdate": true,
            "canDelete": true,
            "canRead": true
        }]
};

var updateRole = {
    "name": "Admin Manager " + unique.get(),
    "roleTypeId": 1,
    "privileges": [
        {
            "id": 57,
            "canAdd": true,
            "canUpdate": true,
            "canDelete": true,
            "canRead": true,
            "isDeleted": false
        }
    ]
};

var updateRoleSingleValue = {
    "name": "UnitTestRole",
    "roleTypeId": 1
};

var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    Roles: constdata.Roles.api,
    roleType: constdata.roleType.api,
    onRoleType: constdata.onRoleType.api,
    searchRole: constdata.searchRole.api,
    reAssignRole: constdata.reAssignRole.api,
    reAssignRoleInput: constdata.reAssignRole.input,
    roleTypeNotFound: constdata.roleType.roleTypeNotFound,
    searchRoleNotFound: constdata.searchRole.searchRoleNotFound,
    users: constdata.Users.api,
    userId: constdata.Users.userId,
};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;
Roles = inputData.Roles;
roleType = inputData.roleType;
onRoleType = inputData.onRoleType;
searchRole = inputData.searchRole;
reAssignRole = inputData.reAssignRole;
roleTypeNotFound = inputData.roleTypeNotFound;
searchRoleNotFound = inputData.searchRoleNotFound;
users = inputData.users;
userId = inputData.userId;
reAssignRoleInput = inputData.reAssignRoleInput;

describe("**** User Role Test Cases ****", function () {
    describe("**** START ****", function () {
//=============================================Create role====================================================================
        describe("CREATE ROLE TEST CASE # 1 ", function () {
            it("Should Create Role ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(Roles)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(createRole)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            roleId = res.body.id;
                            roleName = res.body.name;
                            done();
                        });
                    });
            });
        });
        describe("CREATE ROLE TEST CASE # 2 (Duplicate Role)", function () {
            it("Should Return role already exist ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(Roles)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(createRole)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(422);
                            done();
                        });
                    });
            });
        });
        describe("CREATE ROLE TEST CASE # 3 ", function () {
            util.postInvalidToken(Roles, createRole);
            util.postWithoutToken(Roles, createRole);
        });
        describe("CREATE ROLE TEST CASE # 4 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(Roles)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//==========================================GET ALL ROLES TEST CASE==========================================================
        describe("GET ALL ROLES TEST CASE # 1", function () {
            it("Should Return All Users Roles ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(Roles)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            assert.equal(res.status, expect);
                            done();
                        });
                    });
            });
        });
        describe("GET ALL ROLES TEST CASE # 2", function () {
            util.getInvalidToken(Roles);
            util.getWithoutToken(Roles);
        });
//========================================Get Role details===================================================================
        describe("GET ROLE DETAILS TEST CASE # 1 ", function () {
            it("Should Return Role Details for given role id ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(Roles + '/' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            res.body.should.have.property('id');
                            res.body.should.have.property('name');
                            res.body.should.have.property('roleTypeId');
                            res.body.should.have.property('roleType');
                            done();
                        });
                    });
            });
        });
        describe("GET ROLE DETAILS TEST CASE # 2", function () {
            var rolesRoleId = Roles + '/' + roleId;

            util.getInvalidToken(rolesRoleId);
            util.getWithoutToken(rolesRoleId);

            rolesRoleId = Roles + '/' + 9999999999;
            util.getNotFound(rolesRoleId);

        });
//=====================================Get Role Type list================================================================
        describe("GET ROLE TYPE LIST TEST CASE # 1 ", function () {
            it("Should Return Role List ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(roleType)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            res.body.should.be.instanceof(Array);
                            done();
                        });
                    });
            });
        });
        describe("GET ROLE TYPE LIST TEST CASE # 2", function () {
            util.getInvalidToken(roleType);
            util.getWithoutToken(roleType);
        });
//===========================================Update role===================================================================
        describe("UPDATE ROLE TEST CASE # 1 ", function () {
            it("Should Update Role ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(Roles + '/' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateRole)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE ROLE TEST CASE # 2 ", function () {
            it("Should Update Role Single Value", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(Roles + '/' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateRoleSingleValue)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                res.status.should.equal(expect);
                                done();
                            } else {
                                res.status.should.equal(422);
                                done();
                            }
                        });
                    });
            });
        });
        describe("UPDATE ROLE TEST CASE # 3 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(Roles + '/' + roleId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(updateRole)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE ROLE TEST CASE # 4 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(Roles + '/' + roleId)
                    .send(updateRole)
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
        describe("UPDATE ROLE TEST CASE # 5 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(Roles + '/' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
        describe("UPDATE ROLE TEST CASE # 6 (Not Found)", function () {
            it("Should Return 404 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(Roles + '/' + 99999999)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateRole)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            } else {
                                res.status.should.equal(422);
                                done();
                            }
                        });
                    });
            });
        });
//===========================================Get Roles based on role type==================================================
        describe("GET ROLES BASED ON ROLE TYPE TEST CASE # 1 ", function () {
            it("Should Return Role on roleType ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(onRoleType)
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
        describe("GET ROLES BASED ON ROLE TYPE TEST CASE # 2 ", function () {
            util.getInvalidToken(onRoleType);
            util.getWithoutToken(onRoleType);
        });
        describe("GET ROLES BASED ON ROLE TYPE TEST CASE # 3 (Not Found)", function () {
            it("Should Return  expect ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(roleTypeNotFound)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
//==========================================Search role===================================================================
        describe("SEARCH ROLE TEST CASE # 1 ", function () {
            it("Should Return Search Role ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(searchRole + roleName)
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
        describe("SEARCH ROLE TEST CASE # 2", function () {
            util.getInvalidToken(searchRole + roleName);
            util.getWithoutToken(searchRole + roleName);
        });
        describe("SEARCH ROLE TEST CASE # 3 (Not Found)", function () {
            it("Should Return  expect ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(searchRoleNotFound)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
//==========================================Reassign Role =============================================================
        describe("REASSIGN ROLE TEST CASE # 1 ", function () {
            it("Should Reassign Role ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(reAssignRole)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(reAssignRoleInput)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                assert.equal(res.status, expect);
                                done();
                            }
                            else if (res.status === 404) {
                                assert.equal(res.status, 404);
                                done();
                            }
                            else {
                                assert.equal(res.status, 400);
                                done();
                            }
                        });
                    });
            });
        });
        describe("REASSIGN ROLE TEST CASE # 2", function () {
            var reAssignRoleData = {
                "oldId": 167,
                "newId": roleId
            };
            util.postInvalidToken(Roles, reAssignRoleData);
            util.postWithoutToken(Roles, reAssignRoleData);

        });
        describe("REASSIGN ROLE TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(reAssignRole)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(reAssignRoleInput)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
        describe("REASSIGN ROLE TEST CASE # 5 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(reAssignRole)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send({
                        "oldId": 111
                    })
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
//=======================================Delete role=========================================================================================
        describe("DELETE ROLE TEST CASE # 1 ", function () {
            it("Should Delete Role ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(Roles + '/' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateRole)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(expect);
                            done();
                        });
                    });
            });
        });
        describe("DELETE ROLE TEST CASE # 3 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(Roles + '/' + roleId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(updateRole)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE ROLE TEST CASE # 4 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(Roles + '/' + roleId)
                    .send(updateRole)
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
        describe("DELETE ROLE TEST CASE # 5 (Not Found)", function () {
            it("Should Return 404 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(Roles + '/' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
        describe("DELETE ROLE TEST CASE # 6 (Not Found(Wrong Id))", function () {
            it("Should Return 404 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(Roles + '/' + 99999999)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
//============================================Get Role details After Deletion=============================================================
        describe("GET ROLE DETAILS AFTER DELETION TEST CASE # 1 ", function () {
            it("Should Return Role Details for given role id ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(Roles + '/' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
// =================================================User And Role Dependent Unit Test =========================================================
        describe("USER AND ROLE DEPENDENT TEST CASE # 1 ", function () {
            it("Should Create Role ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(Roles)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(createRole)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(201);
                            roleId = res.body.id;
                            roleName = res.body.name;
                            done();
                        });
                    });
            });
        });
        describe("USER AND ROLE DEPENDENT TEST CASE # 2", function () {
            it("Should Assign role to user ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(users + '/' + userId + '/Roles' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === expect) {
                                res.status.should.equal(expect);
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
        describe("USER AND ROLE DEPENDENT TEST CASE # 3 ", function () {
            it("Should Not Delete Role ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(Roles + '/' + roleId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateRole)
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
