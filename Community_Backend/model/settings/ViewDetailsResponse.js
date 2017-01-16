"use strict";
var lodash = require("lodash");

var BaseModel = require('model/base/BaseModel.js');
var View = require('model/settings/View.js');

module.exports = function () {
	this.viewTypeId = null;
	this.isDefault = null;
	this.isPublic = null;
	this.filter = null;
	this.gridColumnDefs = null;
    this.createdBy = null;
	this.createdOn = null;
	this.editedBy = null;
	this.editedOn = null;
	return lodash.assignIn(new BaseModel(), new View(), this);
}