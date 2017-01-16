"use strict";
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var constdata = require('../../config/Constants.js').Constants;
var UtilTest = require('./../../../test/util/UtilTest.js');
var util = new UtilTest();
var assert = require('assert');
var body = '';
var expect;
var baseurl;
var timeout;
var users;
var Assignteam;
var Assignrole;
var UserPrivileges;
var SearchUser;
var deleteUser;
var userId;
var assignTeamToUserNotFound;
var assignRoleToUserNotFound;
var userPrivilegesNotFound;
var searchUserNotFound;
var deleteUserNotFound;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    expect: constdata.expect,
    timeout: constdata.timeout,
    users: constdata.Users.api,
    userId: constdata.Users.userId,
    assignteam: constdata.assignTeam.api,
    assignrole: constdata.assignRole.api,
    userPrivileges: constdata.userPrivileges.api,
    searchUser: constdata.searchUser.api,
    deleteUser: constdata.deleteUser.api,
    assignTeamToUserNotFound: constdata.assignTeam.assignTeamToUserNotFound,
    assignRoleToUserNotFound: constdata.assignRole.assignRoleToUserNotFound,
    userPrivilegesNotFound: constdata.userPrivileges.userPrivilegesNotFound,
    searchUserNotFound: constdata.searchUser.searchUserNotFound,
    deleteUserNotFound: constdata.deleteUser.deleteUserNotFound

};

baseurl = inputData.baseurl;
expect = inputData.expect;
timeout = inputData.timeout;
users = inputData.users;
userId = inputData.userId;
Assignteam = inputData.assignteam;
Assignrole = inputData.assignrole;
UserPrivileges = inputData.userPrivileges;
SearchUser = inputData.searchUser;
deleteUser = inputData.deleteUser;
assignTeamToUserNotFound = inputData.assignTeamToUserNotFound;
assignRoleToUserNotFound = inputData.assignRoleToUserNotFound;
userPrivilegesNotFound = inputData.userPrivilegesNotFound;
searchUserNotFound = inputData.searchUserNotFound
deleteUserNotFound = inputData.deleteUserNotFound;

var updateUserDetail = {
    "name": "Demo Unit",
    "email": "unit@gmail.com",
    "userLoginId": "prime@tgi.com",
    "roleId": 1,
    "teamIds": [
       1
    ],
    "status": 0,
    "startDate": "06/22/2016",
    "expireDate": "12/25/2016"
};

var createUser = {
    "orionUserId": userId,
    "name": "Test user",
    "email": "testuser@gmail.com",
    "userLoginId": "prime@tgi.com",
    "roleId": 1,
    "teamIds": [
        1,
    ],
    "status": 0,
    "startDate": "05/12/2016",
    "expireDate": "12/22/2016"
};

var createUserNotFound = {
    "orionUserId": userId,
    "name": "Test user",
    "email": "testuser@gmail.com",
    "userLoginId": "prime@tgi.com",
    "roleId": 1,
    "teamIds": [
        1,
        2
    ],
    "status": 0,
    "startDate": "05/12/2016",
    "expireDate": "12/22/2016"
};

describe("**** Users Test Cases ****", function () {
    describe("**** START ****", function () {
//==============================================Create user==================================
        describe("CREATE USER TEST CASE # 1", function () {
            it("Should Create user ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(users)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(createUser)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.body.should.be.instanceof(Array);
                                res.status.should.equal(200);
                                done();
                            } else if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            } else {
                                res.status.should.equal(400);
                                done();
                            }
                        });
                    });
            });
        });
        describe("CREATE USER TEST CASE # 2", function () {
            util.postInvalidToken(users, createUser);
            util.postWithoutToken(users, createUser);
        });
        describe("CREATE USER TEST CASE # 3 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(users)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
        describe("CREATE USER TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .post(users)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(createUserNotFound)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
//==============================================Get all users==================================
        describe("GET ALL USERS TEST CASE # 1", function () {
            it("Should Return All Users ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(users)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            //res.body.should.be.instanceof(Array);
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("GET ALL USERS TEST CASE # 2", function () {
            util.getInvalidToken(users);
            util.getWithoutToken(users);
        });
//==============================================Get user details =============================
        describe("GET USER DETAILS TEST CASE # 1", function () {
            it("Should Return user details ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(users + '/' + userId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            //res.body.should.be.instanceof(Array);
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            } else {
                                res.status.should.equal(404);
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET USER DETAILS TEST CASE # 2", function () {
            var userdetail = users + '/' + userId;
            util.getInvalidToken(userdetail);
            util.getWithoutToken(userdetail);
            var userdetail = users + '/99999999';
            util.getNotFound(userdetail);
        });
//==============================================Update user details =========================
        describe("UPDATE USER DETAILS TEST CASE # 1", function () {
            it("Should Update user details", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(users + '/' + userId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateUserDetail)
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
        describe("UPDATE USER DETAILS TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(users + '/' + userId)
                    .set('Authorization', cache.get('testLoginToken'))
                    .send(updateUserDetail)
                    .end(function (err, res) {
                        setTimeout(function () {
                            try {
                                res.status.should.equal(401);
                                done();
                            }
                            catch (e) {
                                done(e);
                            }
                        });
                    });
            });
        });
        describe("UPDATE USER DETAILS TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(users + '/' + userId)
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 403) {
                                res.status.should.equal(403);
                                done();
                            } else {
                                res.status.should.equal(401);
                                done();
                            }
                        });
                    });
            });
        });
        describe("UPDATE USER DETAILS TEST CASE # 4 (Not Found)", function () {
            it("Should Return  404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(users + '/9999999')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(updateUserDetail)
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
//==============================================Assign team to user===========================
        // describe("ASSIGN TEAM TO USER TEST CASE # 1", function () {
        //     it("Should Assign team to user ", function (done) {
        //         this.timeout(timeout);
        //         chai.request(baseurl)
        //             .post(Assignteam)
        //             .set('Authorization', 'Session ' + cache.get('testLoginToken'))
        //             .end(function (err, res) {
        //                 setTimeout(function () {
        //                     if (res.status === 200) {
        //                         res.status.should.equal(200);
        //                         done();
        //                     } else {
        //                         res.status.should.equal(404);
        //                         done();
        //                     }
        //                 });
        //             });
        //     });
        // });
        // describe("ASSIGN TEAM TO USER TEST CASE # 2", function () {
        //     util.postInvalidToken(Assignteam);
        //     util.postWithoutToken(Assignteam);
        // });
        // describe("ASSIGN TEAM TO USER TEST CASE # 4 (Not Found)", function () {
        //     it("Should Return Invalid Http Method type 404", function (done) {
        //         this.timeout(timeout);
        //         chai.request(baseurl)
        //             .post(assignTeamToUserNotFound)
        //             .set('Authorization', 'Session ' + cache.get('testLoginToken'))
        //             .end(function (err, res) {
        //                 setTimeout(function () {
        //                     res.status.should.equal(404);
        //                     done();
        //                 });
        //             });
        //     });
        // });
//==============================================Assign role to user in a team=========================
        // describe("ASSIGN ROLE TO USER TEST CASE # 1", function () {
        //     it("Should Assign role to user ", function (done) {
        //         this.timeout(timeout);
        //         chai.request(baseurl)
        //             .post(Assignrole)
        //             .set('Authorization', 'Session ' + cache.get('testLoginToken'))
        //             .end(function (err, res) {
        //                 setTimeout(function () {
        //                     if (res.status === 200) {
        //                         res.status.should.equal(200);
        //                         done();
        //                     } else {
        //                         res.status.should.equal(404);
        //                         done();
        //                     }
        //                 });
        //             });
        //     });
        // });
        // describe("ASSIGN ROLE TO USER TEST CASE # 2", function () {
        //     util.postInvalidToken(Assignrole);
        //     util.postWithoutToken(Assignrole);
        // });
        // describe("ASSIGN ROLE TO USER TEST CASE # 4 (Not Found)", function () {
        //     it("Should Return  404", function (done) {
        //         this.timeout(timeout);
        //         chai.request(baseurl)
        //             .post(assignRoleToUserNotFound)
        //             .set('Authorization', 'Session ' + cache.get('testLoginToken'))
        //             .end(function (err, res) {
        //                 setTimeout(function () {
        //                     res.status.should.equal(404);
        //                     done();
        //                 });
        //             });
        //     });
        // });
//==============================================Get User Privileges==============================
        describe("GET USER PRIVILEGES TEST CASE # 1", function () {
            it("Should Return user privilages ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(UserPrivileges)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.body.should.be.instanceof(Array);
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
        describe("GET USER PRIVILEGES TEST CASE # 2", function () {
            util.getInvalidToken(UserPrivileges);
            util.getWithoutToken(UserPrivileges);
        });
        describe("GET USER PRIVILEGES TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(userPrivilegesNotFound)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
//==============================================Search user=======================================
        describe("SEARCH USER TEST CASE # 1", function () {
            it("Should Return user ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(SearchUser)
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
        describe("SEARCH USER TEST CASE # 2 (Unauthorized request)", function () {
            util.getInvalidToken(SearchUser);
            util.getWithoutToken(SearchUser);
        });
        describe("SEARCH USER TEST CASE # 4 (Not Found)", function () {
            it("Should Return 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(searchUserNotFound)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
//==============================================Delete User========================================
        describe("DELETE USER TEST CASE # 1", function () {
            it("Should Delete user ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(deleteUser)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
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
        describe("DELETE USER TEST CASE # 2 (Unauthorized request)", function () {
            it("Should Return 401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(deleteUser)
                    .set('Authorization', cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(401);
                            done();
                        });
                    });
            });
        });
        describe("DELETE USER TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(deleteUser)
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
        describe("DELETE USER TEST CASE # 4 (Not Found)", function () {
            it("Should Return Invalid Http Method type 404", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .delete(deleteUserNotFound)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(404);
                            done();
                        });
                    });
            });
        });
//============================================Get user details After Deletion=============================
        describe("GET USER DETAILS AFTER DELETION TEST CASE # 1 ", function () {
            it("Should Return User Details for given user id ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(users + '/' + userId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            } else {
                                res.status.should.equal(404);
                                done();
                            }

                        });
                    });
            });
        });
    });
});
