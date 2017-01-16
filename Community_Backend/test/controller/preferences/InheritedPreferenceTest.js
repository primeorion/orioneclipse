
"use strict";

var where = require("lodash.where")
var utils = require("util")
var cache = require('memory-cache');
var chai = require("chai");
var should = require("chai").should();
var chaiHttp = require('chai-http');
var assert = require('assert');
var constdata = require('./../../config/Constants.js').Constants;
var preferenceInput = require('./../../config/PreferenceInput.js').PreferenceInput;
var unique = require('../../../helper/UniqueIdGenerator');
var UtilTest = require('./../../../test/util/UtilTest.js');
var util = new UtilTest();
var body = '';
var expect;
var baseurl;
var timeout;
var levels;
var preference;
var oldValue = 0;
var newValue = 0;
var updatePreferenceData;
var levelName;
var recordId
var parentPreferenceData;
var oldInheritedValue;
var newInheritedValue;
var inheritedValue = "";
var input;
var eclipseAccessToken = cache.get('testLoginToken')

chai.use(chaiHttp);

var inputData = {
    baseurl: constdata.baseurl,
    timeout: constdata.timeout,
    expect: constdata.expect,
    preference: constdata.preference.api,

};

var updateInput = {
    input: preferenceInput.updatePreferenceData,
    levelName: preferenceInput.levelName,
    recordId: preferenceInput.recordId,
    parentPreferenceData: preferenceInput.parentPreferenceData
}

updatePreferenceData = updateInput.input;
levelName = updateInput.levelName;
recordId = updateInput.recordId;
parentPreferenceData = updateInput.parentPreferenceData;
inheritedValue = '' + parentPreferenceData.defaultPreferences[0].value + '';

baseurl = inputData.baseurl;
timeout = inputData.timeout;
expect = inputData.expect,
preference = inputData.preference;

describe("**** Inherited Preference Test Cases ****", function () {
    describe("**** START ****", function () {
        updatePreferenceData.forEach(function (inheritedInput) {
            var updateValue = "";
            var preferenceId;
            preferenceId = inheritedInput.defaultPreferences[0].preferenceId;
            updateValue = '' + inheritedInput.defaultPreferences[0].value + '';
            describe("LIST PREFERENCE BEFORE TEST CASE # 1", function () {
                it("Should Return Portfolio Preference ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(preference + '/' + levelName + '/' + recordId)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(expect);
                                var beforePreferences = res.body.preferences;
                                if (beforePreferences) {
                                    var filtered = where(beforePreferences, { "preferenceId": preferenceId });

                                    oldValue = filtered[0].value;
                                    oldInheritedValue = filtered[0].inheritedValue;
                                    done();
                                } else {
                                    console.log("--List Empty--");
                                    done();
                                }

                            });
                        });
                });
            });
            
            describe("UPDATE PORTFOLIO PREFERENCE TEST CASE # 1", function () {
                it("Should Update Portfolio Preference ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(preference + '/updateAll')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(inheritedInput)
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(expect);
                                done();
                            });
                        });
                });
            });

            describe("UPDATE MODEL PREFERENCE TEST CASE # 1", function () {
                it("Should Update Model Preference ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .post(preference + '/updateAll')
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .send(parentPreferenceData)
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(expect);
                                done();
                            });
                        });
                });
            });

            describe("LIST PREFERENCE AFTER TEST CASE # 1", function () {
                it("Should Return Portfolio Preference ", function (done) {
                    this.timeout(timeout);
                    chai.request(baseurl)
                        .get(preference + '/' + levelName + '/' + recordId)
                        .set('Authorization', 'Session ' + cache.get('testLoginToken'))
                        .end(function (err, res) {
                            setTimeout(function () {
                                res.status.should.equal(expect);
                                var afterPreferences = res.body.preferences;

                                if (afterPreferences) {
                                    var filtered = where(afterPreferences, { "preferenceId": preferenceId });
                                    newValue = filtered[0].value;
                                    newInheritedValue = filtered[0].inheritedValue;

                                    if (oldValue === newValue) {
                                        console.log("--Value are Same--");

                                    } else if (updateValue === newValue) {
                                        console.log("--Value Updated--");

                                    } else {
                                        console.log("--Value Not Updated--");

                                    }
                                    if (oldInheritedValue === newInheritedValue) {
                                        console.log("--Inherited value are same--");
                                        done();
                                    } else if (inheritedValue === newInheritedValue) {
                                        console.log("--Inherited value are updated--");
                                        done();
                                    } else {
                                        console.log("--Inherited Value Not Updated--");
                                        done();
                                    }
                                } else {
                                    console.log("--List Empty--");
                                    done();
                                }

                            });
                        });
                });
            });
        });
    });
});
