"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');
var View = require("model/settings/View.js");
var ViewRequest = require("model/settings/ViewRequest.js");
var ViewResponse = require("model/settings/ViewResponse.js");
var ViewDetailsResponse = require("model/settings/ViewDetailsResponse.js");
var baseConverter = require('converter/base/BaseConverter.js');

var messages = config.messages;
var logger = helper.logger(moduleName);
var util = require('util');
var ViewConverter = function () { }

ViewConverter.prototype.getResponseModelOfViewTypes = function (data, cb) {
    logger.debug("Converting data to ViewTypesList in getResponseModelOfViewTypes()");
    var viewTypesList = [];
    data.forEach(function (view) {
        var viewType = new View();
        viewType.id = view.id;
        viewType.viewType = view.typeName;

        viewTypesList.push(viewType);
    }, this);
    return cb(null, viewTypesList);
};

ViewConverter.prototype.getResponseModelOfViews = function (data, cb) {
    logger.debug("Converting data to ViewsList in getResponseModelOfViews()");
    var viewsList = [];
    data.forEach(function (view) {
        var viewResponse = new ViewResponse();
        viewResponse.id = view.id;
        viewResponse.name = view.viewName;
        viewResponse.viewTypeId = view.viewTypeId;
        viewResponse.viewType = view.typeName;
        viewResponse.isDefault = view.isDefault;
        viewResponse.isPublic = view.isPublic;
        viewResponse.createdBy = view.createdBy;
        viewResponse.createdOn = view.createdDate;
        viewResponse.editedBy = view.editedBy;
        viewResponse.editedOn = view.editedDate;

        viewsList.push(viewResponse);
    }, this);
    return cb(null, viewsList);
};

ViewConverter.prototype.getResponseModelOfViewDetails = function (data, cb) {
    logger.debug("Converting data for View details in getResponseModelOfViews()");
    var view = data;
    var viewDetailsResponse = new ViewDetailsResponse();
    viewDetailsResponse.id = view.id;
    viewDetailsResponse.name = view.viewName;
    viewDetailsResponse.viewTypeId = view.viewTypeId;
    viewDetailsResponse.viewType = view.typeName;
    viewDetailsResponse.isDefault = view.isDefault;
    viewDetailsResponse.isPublic = view.isPublic;
    viewDetailsResponse.filter = view.filter;
    try {
        viewDetailsResponse.gridColumnDefs = JSON.parse(JSON.stringify(eval('(' + view.gridColumnDefs + ')')));
    } catch (err) {
        return cb(err, null);
    }
    viewDetailsResponse.createdBy = view.createdBy;
    viewDetailsResponse.createdOn = view.createdDate;
    viewDetailsResponse.editedBy = view.editedBy;
    viewDetailsResponse.editedOn = view.editedDate;

    return cb(null, viewDetailsResponse);
};

ViewConverter.prototype.getRequestModel = function (data, cb) {
    var view = data;
    var viewRequest = new ViewRequest();

    baseConverter(viewRequest, data);

    viewRequest.viewName = view.name ? view.name : null;
    viewRequest.viewTypeId = view.viewTypeId ? view.viewTypeId : null;
    viewRequest.isDefault = view.hasOwnProperty('isDefault') ? (data.isDefault ? 1 : 0) : 2;
    viewRequest.isPublic = view.hasOwnProperty('isPublic') ? (data.isPublic ? 1 : 0) : 2;
    viewRequest.filter = view.filter;
    viewRequest.gridColumnDefs = util.inspect(view["gridColumnDefs"], false, null);

    return viewRequest;
};

module.exports = ViewConverter;
