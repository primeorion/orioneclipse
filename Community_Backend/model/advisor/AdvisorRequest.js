"use strict";
var lodash = require("lodash");

var BaseInputModel = require('model/base/BaseInputModel.js');

var AdvisorRequest = function () {
    this.id = null;
    return lodash.assignIn(new BaseInputModel(), this);
}


module.exports = AdvisorRequest;