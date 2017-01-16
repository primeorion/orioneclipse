"use strict";

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var request = require("request");
var constants = require('config').orionConstants;

describe("Orion Api Service", function(){
    var TokenFromOrionApi = null;
    it("Get token From Orion Api", function(done){
        this.timeout(15000);
        var authorization = "Basic cHJpbWV0Z2k6cHJpbWV0Z2kyMiE=";
        var url = {
            url: constants.api.logIn,
            headers: {
                'Authorization': authorization
            }
        };

        request.get(url, function (err, response, body) {
            expect(err).to.be.null;
            TokenFromOrionApi = JSON.parse(response.body).access_token;
            expect(TokenFromOrionApi).to.not.equal(null);
            expect(TokenFromOrionApi).to.not.equal(undefined);
            done();
        });
    });

    it("Get UserDetail From Orion Api", function(done){
        this.timeout(5000);
        var authorization = "Session " + TokenFromOrionApi;
        var url = {
            url: constants.api.logIn,
            headers: {
                'Authorization': authorization
            }
        };

        request.get(url, function (err, response, body) {
            expect(err).to.be.null;
            done();
        });
    });

});
