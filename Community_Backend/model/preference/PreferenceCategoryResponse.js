"use strict";

var lodash = require("lodash");

var PreferenceCategoryObj = require('model/preference/PreferenceCategory');
var preferenceCategory = new PreferenceCategoryObj();

var PreferenceCategoryResponse = function(data) {
    var self = this;
    if (data instanceof Array) {
        var categories = [];

        data.forEach(function(level) {
            var sanitizedObj = self.sanitize(level);
            categories.push(sanitizedObj);
        });

        return categories;
    } else if (data instanceof Object) {

        return self.data = self.sanitize(data);
    }
};

PreferenceCategoryResponse.prototype.sanitize = function(data) {
    data = data || {};
    return lodash.pick(lodash.defaultsDeep(data, preferenceCategory), lodash.keys(preferenceCategory));
};

module.exports = PreferenceCategoryResponse;