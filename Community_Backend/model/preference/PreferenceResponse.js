"use strict";
var lodash = require("lodash");

var PreferenceObj = require('model/preference/Preference');
var preference = new PreferenceObj();

var PreferenceResponse = function(data) {
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

PreferenceResponse.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, preference), lodash.keys(preference));
};

module.exports = PreferenceResponse;