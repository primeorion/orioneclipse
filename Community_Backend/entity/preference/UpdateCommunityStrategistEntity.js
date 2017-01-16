"use strict";
var lodash = require("lodash");

var CommunityStrategistPreferenceObj = require('entity/preference/CommunityStrategistPreference');
var communityStrategistPreference = new CommunityStrategistPreferenceObj();

var UpdateCommunityStrategistEntity = function(data) {
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

UpdateCommunityStrategistEntity.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, communityStrategistPreference), lodash.keys(communityStrategistPreference));
};

module.exports = UpdateCommunityStrategistEntity;