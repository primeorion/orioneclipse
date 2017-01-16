"use strict";
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
var levels;
var levelId;
var levelName;
var levelById;
var preferenceSummary;
var bitValue;
var bitValueId;
var levelRecordId;
var preference;
var preferenceCategories;
var preferenceMaster;
var communityStrategistSetting;
var locationOptimization;
var massUpdate;
var eclipseAccessToken = cache.get('testLoginToken')
chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    levels: constdata.levels.api,
    preference: constdata.preference.api,
    preferenceCategories: constdata.preferenceCategories.api,
    levelById: constdata.levelById.api,
    bitValue: constdata.bitValue.api,
    preferenceSummary: constdata.preferenceSummary.api,
    preferenceMaster: constdata.preferenceMaster.api,
    communityStrategistSetting: constdata.communityStrategistSetting.api,
    locationOptimization: constdata.locationOptimization.api,
    massUpdate: constdata.massUpdate.api
};

var updatePreferenceData = {
    "recordType": 1,
    "recordTypeId": 999,
    "preferenceList": [
        {
            "id": null,
            "preferenceId": 1,
            "recordType": 1,
            "recordTypeId": 999,
            "valueType": "Date",
            "value": "2016-07-08 10:45:22",
            "options": []
        }]
};

var updatePreferenceWrongData = {
    "preferenceList": [{
        "id": null,
        "preferenceId": 7,
        "recordType": 1,
        "recordTypeId": 3,
        "valueType": "OptionList",
        "value": "XYZ12368",
        "options": [1]
    }]
};

var massUpdateData = {
    "level": "Firm",
    "id": null,
    "ids": [3],
    "defaultPreferences": [
        {
            "id": null,
            "preferenceId": 11,
            "valueType": "Boolean",
            "componentType": "default",
            "componentName": "Checkbox",
            "selectedOptions": [],
            "value": false
        }
       ]
};

var massUpdateDataWithoutId = {
    "level": "portfolio",
    "defaultPreferences": [
        {
            "id": null,
            "preferenceId": 11,
            "valueType": "Boolean",
            "componentType": "default",
            "componentName": "Checkbox",
            "selectedOptions": [],
            "value": false
        }
       ]
};
baseurl = inputData.baseurl;
timeout = inputData.timeout;
preferenceSummary = inputData.preferenceSummary;
levels = inputData.levels;
preference = inputData.preference;
preferenceCategories = inputData.preferenceCategories
levelById = inputData.levelById;
bitValue = inputData.bitValue;
preferenceMaster = inputData.preferenceMaster;
communityStrategistSetting = inputData.communityStrategistSetting;
locationOptimization = inputData.locationOptimization;
massUpdate = inputData.massUpdate;

describe("**** Preference Test Cases ****", function () {
    describe("**** START ****", function () {
        //==============================================Get Preference Summary==============================
        describe("GET PREFERENCE SUMMMARY TEST CASE # 1", function () {
            it("Should Return Preference Summary ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preferenceSummary)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("GET PREFERENCE SUMMMARY TEST CASE# 2", function () {
            util.getInvalidToken(preferenceSummary);
            util.getWithoutToken(preferenceSummary);
        });
        //==========================================Get Preference Levels=============================================
        describe("GET ALL LEVELS TEST CASE # 1", function () {
            it("Should Return All Levels", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(levels)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.body.should.be.instanceof(Array);
                            if (res.body.length > 0) {
                                levelId = res.body[0].id;
                                levelName = res.body[0].name;
                                bitValueId = res.body[0].bitValue;
                            }
                            else {
                                levelId = null;
                                levelName = null;
                                bitValueId = null;
                            }
                            done();
                        });
                    });
            });
        });
        describe("GET ALL LEVELS TEST CASE # 2", function () {
            util.getInvalidToken(levels);
            util.getWithoutToken(levels);
        });
        describe("GET ALL LEVELS TEST CASE # 3", function () {
            it("Should Check No of Levels ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(levels)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                         setTimeout(function () {
                            var levelLength = res.body.length;
                            if (levelLength >= 7) { // Checking length of preference array
                                done();
                            }else{
                                res.status.should.equal(200);
                                done();
                            }
                        });
                    });
            });
        });
        describe("GET ALL LEVELS TEST CASE # 4", function () {
            it("Should Check Different Levels ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(levels)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            //without recordType
                            var firmLevel = res.body[0].name;
                            var custodianLevel = res.body[1].name;
                            var teamLevel = res.body[2].name;
                            var portfolioLevel = res.body[3].name;
                            var modelLevel = res.body[4].name;
                            var accountLevel = res.body[5].name;
                            var securityLevel = res.body[6].name;
                            //Checking All preference
                            if (firmLevel === 'Firm' &&
                                custodianLevel === 'Custodian' &&
                                teamLevel === 'Team' &&
                                portfolioLevel === 'Portfolio' &&
                                modelLevel === 'Model' &&
                                accountLevel === 'Account' &&
                                securityLevel === 'Security') {
                                done();
                            }else{
                                res.status.should.equal(200);
                                done();
                            }
                        });
                       
                    });
            });
        });
        //======================================List Preferences By Level=================================================
        describe("GET LIST PREFERENCE BY LEVEL TEST CASE # 1 ", function () {
            it("Should Return List Preferences By Level", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preference + '/' + levelName + '/' + levelId)
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
        describe("GET LIST PREFERENCE BY LEVEL TEST CASE # 2", function () {
            var level = preference + '/' + levelName + '/' + levelId;

            util.getInvalidToken(level);
            util.getWithoutToken(level);

            level = preference + '/' + 'fffffffffff' + '/' + 99999999999
            util.getNotFound(level);

        });
        describe("GET LIST PREFERENCE BY LEVEL TEST CASE # 3 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preference + '/' + levelName + '/' + 'a2')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });
        //==================================Get Community Strategist Setting===========================================
        describe("GET COMMUNITY STRATEGIST SETTING TEST CASE # 1 ", function () {
            it("Should Return List Preferences By Level", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(communityStrategistSetting + '/' + levelName + '/' + bitValueId + '/' + levelId)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if (res.status === 200) {
                                res.status.should.equal(200);
                                done();
                            }
                            else if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else {
                                res.status.should.equal(403);
                                done();
                            }
                         });
                    });
            });
        });
        describe("GET COMMUNITY STRATEGIST SETTRING TEST CASE # 2", function () {
            var level = communityStrategistSetting + '/' + levelName + '/' + bitValueId + '/' + levelId;

            util.getInvalidToken(level);
            util.getWithoutToken(level);

            level = communityStrategistSetting + '/' + 'fffffffffff' + '/' + 99999999999 + '/' + 99999999999
            util.getNotFound(level);

        });
        describe("GET COMMUNITY STRATEGIST SETTRING TEST CASE # 3 (Not Found)", function () {
            it("Should Return 404 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(communityStrategistSetting + '/' + levelName + '/' + levelId + '/' + 'a2')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                           if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else {
                                res.status.should.equal(403);
                                done();
                            }
                        });
                    });
            });
        });
        //==================================Get Location Optimization Setting======================================
        describe("GET LOCATION OPTIMIZATION SETTING TEST CASE # 1 ", function () {
            it("Should Return Location Optimization Setting", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preference + '/' + levelName + '/' + bitValueId + '/' + levelId)
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
        describe("GET LOCATION OPTIMIZATION SETTING TEST CASE # 2", function () {
            var level = preference + '/' + levelName + '/' + bitValueId + '/' + levelId;

            util.getInvalidToken(level);
            util.getWithoutToken(level);

            level = preference + '/' + 'fffffffffff' + '/' + 99999999999 + '/' + 99999999999
            util.getNotFound(level);

        });
        describe("GET LOCATION OPTIMIZATION SETTING TEST CASE # 3 (Bad Request)", function () {
            it("Should Return 400 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preference + '/' + levelName + '/' + levelId + '/' + 'a2')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            if(res.status === 400){
                                 res.status.should.equal(400);
                                done();
                            }else{
                                 res.status.should.equal(404);
                                done();
                            }
                           
                        });
                    });
            });
        });
        //======================================List Preferences By Categories=================================================
        describe("GET PREFERENCE BY CATEGORIES TEST CASE # 1 ", function () {
            it("Should Return Preferences By Categories", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preferenceCategories + '/' + levelName +'/categories')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("GET PREFERENCE BY CATEGORIES TEST CASE # 2", function () {
            var level = preferenceCategories + '/' + levelName +'/categories';

            util.getInvalidToken(level);
            util.getWithoutToken(level);

            level = preferenceCategories + '/' + 'fffffffffff' +'/categories';
            util.getNotFound(level);

        });
        describe("GET PREFERENCE BY CATEGORIES TEST CASE # 3 (Not Found)", function () {
            it("Should Return 404 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preferenceCategories + '/' + "A2" +'/categories')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                           if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else {
                                res.status.should.equal(403);
                                done();
                            }
                        });
                    });
            });
        });
        //====================================List MasterPreferences =====================================
        describe("GET MASTER PREFERENCES TEST CASE # 1 ", function () {
            it("Should Return Preferences By Level For Mass Update", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preference + '/' + levelName+'/Master')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(200);
                            done();
                        });
                    });
            });
        });
        describe("GET MASTER PREFERENCES TEST CASE # 2", function () {
            var level = preference + '/' + levelName+'/Master';

            util.getInvalidToken(level);
            util.getWithoutToken(level);

            level = preference + '/' + 'FFFFFFFFFFFFFF'+'/Master';
            util.getNotFound(level);

        });
        describe("GET MASTER PREFERENCES TEST CASE # 3 (Not Found)", function () {
            it("Should Return 404 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .get(preference + '/' + 'A222'+'/Master')
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .end(function (err, res) {
                        setTimeout(function () {
                           if (res.status === 404) {
                                res.status.should.equal(404);
                                done();
                            }
                            else {
                                res.status.should.equal(403);
                                done();
                            }
                        });
                    });
            });
        });
        // //=========================================Get List Of Records By RecordType=======================
        //           describe("GET LIST OF RECORDS  BY RECORDTYPE TEST CASE # 1 ",function(){ 
        //                     it("Should Return records by recordType ",function(done){ 
        //                         this.timeout(timeout);
        //                         chai.request(baseurl)
        //                             .get(bitValue+'/'+bitValueId)
        //                             .set('Authorization', 'Session '+cache.get('testLoginToken'))
        //                             .end(function(err,res){
        //                                 try{
        //                                     if(err){
        //                                      throw (err);
        //                                     } 
        //                                     setTimeout(function () {
        //                                         res.status.should.equal(200);
        //                                         if(res.body.length>0){
        //                                             levelRecordId =res.body[0].id;
        //                                         }
        //                                        done();
        //                                     });
        //                                 }
        //                                 catch(err){
        //                                     setTimeout(function () {
        //                                         try {
        //                                             assert.equal(res.status, 200);
        //                                             done();
        //                                         }
        //                                         catch (e) {
        //                                             done(e);
        //                                         }
        //                                     });
        //                                 }  
        //                             });
        //                     });
        //           });
        //           describe("GET LIST OF RECORDS  BY RECORDTYPE TEST CASE # 2",function(){ 
        //                     var recordId= bitValue+'/'+bitValueId;

        //                     util.getInvalidToken(recordId);
        //                     util.getWithoutToken(recordId);

        //                     recordId= bitValue+'/'+9999999999;
        //                     util.getNotFound(recordId);

        //           });
        //           describe("GET LIST OF RECORDS  BY RECORDTYPE TEST CASE # 3 (Bad Request)",function(){ 
        //                     it("Should Return 400 ",function(done){ 
        //                         this.timeout(timeout);
        //                         chai.request(baseurl)
        //                             .get(bitValue+'/'+'a2')
        //                             .set('Authorization', 'Session '+cache.get('testLoginToken'))
        //                             .end(function(err,res){
        //                                     setTimeout(function () {
        //                                     try {
        //                                             res.status.should.equal(400);
        //                                             done();  
        //                                         }
        //                                     catch (e) {
        //                                             done(e);
        //                                     }
        //                                     });
        //                             });
        //                       });
        //           });
        //========================================Update Prefereces=================================
        // describe("UPDATE PREFERENCE TEST CASE # 1", function () {
        //     it("Should Update Preferece ", function (done) {
        //         this.timeout(timeout);
        //         chai.request(baseurl)
        //             .post(preference)
        //             .set('Authorization', 'Session ' + cache.get('testLoginToken'))
        //             .send(updatePreferenceData)
        //             .end(function (err, res) {
        //                 setTimeout(function () {
        //                         if (res.status === 200) {
        //                             res.body.should.be.instanceof(Array);
        //                             res.status.should.equal(200);
        //                             done();
        //                         }
        //                         else {
        //                             res.status.should.equal(400);
        //                             done();
        //                         }
        //                 });
        //             });
        //     });
        // });
        // describe("UPDATE PREFERENCE TEST CASE # 2", function () {
        //     util.postInvalidToken(preference, updatePreferenceData);
        //     util.postWithoutToken(preference, updatePreferenceData);
        // });
        // describe("UPDATE PREFERENCE TEST CASE # 3 (Forbidden request)", function () {
        //     it("Should Return 403/401 ", function (done) {
        //         this.timeout(timeout);
        //         chai.request(baseurl)
        //             .post(preference)
        //             .end(function (err, res) {
        //                 setTimeout(function () {
        //                   if (res.status == 403) {
        //                     res.status.should.equal(403);
        //                     done();
        //                  }
        //                  else {
        //                     res.status.should.equal(401);
        //                     done();
        //                  }
        //              });
        //          });
        //     });
        // });
        // describe("UPDATE PREFERENCE TEST CASE # 4 (Bad Request)", function () {
        //     it("Should Return 400", function (done) {
        //         this.timeout(timeout);
        //         chai.request(baseurl)
        //             .post(preference)
        //             .set('Authorization', 'Session ' + cache.get('testLoginToken'))
        //             .send(updatePreferenceWrongData) //without recordType
        //             .end(function (err, res) {
        //                 setTimeout(function () {
        //                     res.status.should.equal(400);
        //                     done();
        //                 });
        //             });
        //     });
        // });
        //=======================================Update Mass Preferences=========================
        describe("UPDATE MASS PREFERENCE TEST CASE # 1", function () {
            it("Should Update Mass Preferece ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(massUpdate)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(massUpdateData)
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
        describe("UPDATE MASS PREFERENCE TEST CASE # 2", function () {
            util.putInvalidToken(massUpdate, massUpdateData);
            util.putWithoutToken(massUpdate, massUpdateData);
        });
        describe("UPDATE MASS PREFERENCE TEST CASE # 3 (Forbidden request)", function () {
            it("Should Return 403/401 ", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(massUpdate)
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
        describe("UPDATE MASS PREFERENCE TEST CASE # 4 (Bad Request)", function () {
            it("Should Return 400", function (done) {
                this.timeout(timeout);
                chai.request(baseurl)
                    .put(massUpdate)
                    .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                    .send(massUpdateDataWithoutId) //without recordType
                    .end(function (err, res) {
                        setTimeout(function () {
                            res.status.should.equal(400);
                            done();
                        });
                    });
            });
        });

    });

});
