"use strict";
var lodash = require("lodash");

var PreferenceDetailObj = require('model/preference/PreferenceDetail');
var preferenceDetail = new PreferenceDetailObj();

var PreferenceDetailResponse = function(data) {
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

PreferenceDetailResponse.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, preferenceDetail), lodash.keys(preferenceDetail));
};

module.exports = PreferenceDetailResponse;