"use strict";

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var request = require("request");
var constants = require('config').orionConstants;
var LoginService = require('service/admin/LoginService.js');
var loginService = new LoginService();

var testUtils = require('test/util/Utils.js');

describe("Login", function(){

    describe("Authentication", function() {
            var TokenFromOrionApi = null;
            it("Get token From Orion Api", function (done) {
                this.timeout(5000);
                var data = {
                    authorizationHeaders: "Basic cHJpbWV0Z2k6cHJpbWV0Z2kyMiE="
                }
                loginService.getTokenFromConnectAPI(data, function (err, response, body) {
                    expect(err).to.be.null;
                    TokenFromOrionApi = body.access_token;
                    testUtils.failOnNullandUndefinedValue(TokenFromOrionApi);
                    done();
                });
            });

            it("Get UserDetail From Orion Api", function (done) {
                this.timeout(5000);
                var data = {
                    authorizationHeaders: "Session " + TokenFromOrionApi
                };

                loginService.getUserDetailFromConnectAPI(data, function (err, data) {
                    expect(err).to.be.null;
                    done();
                });
            });
    });
});
