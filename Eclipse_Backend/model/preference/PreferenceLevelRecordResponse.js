"use strict";
var lodash = require("lodash");

var PreferenceLevelRecordObj = require('model/preference/PreferenceLevelRecord');
var preferenceLevelRecord = new PreferenceLevelRecordObj();

var PreferenceLevelRecordResponse = function(data) {
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

PreferenceLevelRecordResponse.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, preferenceLevelRecord), lodash.keys(preferenceLevelRecord));
};

module.exports = PreferenceLevelRecordResponse;