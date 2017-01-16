"use strict";
var lodash = require("lodash");

var CommunityStretegistPreferenceObj = require('model/preference/CommunityStretegistPreference');
var communityStretegistPreference = new CommunityStretegistPreferenceObj();

var CommunityStrategistResponse = function(data) {
    var self = this;
    if (data instanceof Array) {
        var levels = [];

        data.forEach(function(level) {
            var sanitizedObj = self.sanitize(level);
            levels.push(sanitizedObj);
        });

        return levels;
    } else if (data instanceof Object) {

        return self.data = self.sanitize(data);
    }
};

CommunityStrategistResponse.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, communityStretegistPreference), lodash.keys(communityStretegistPreference));
};

module.exports = CommunityStrategistResponse;