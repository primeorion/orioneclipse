"use strict";
var lodash = require("lodash");
var BaseInputModel = require('model/base/BaseInputModel.js');

module.exports = function () {
	this.viewName = null;
	this.viewTypeId = null;
	this.isDefault = null;
    this.isPublic = null;
    this.filter = null;
	this.gridColumnDefs =  null;
	return lodash.assignIn(new BaseInputModel(), this);
}