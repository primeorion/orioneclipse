"use strict";
var lodash = require("lodash");

var BaseInputModel = require('model/base/BaseInputModel.js');
var TeamData = require('model/team/Team.js');

var TeamRequest = function () {
    this.teamId = null;
    this.advisorIds = [];
    this.modelIds = [];
    this.portfolioIds = [];
    this.userIds = [];
    this.userId = null;
    this.modelId = null;
    this.portfolioId = null;
    this.advisorId = null;
    this.oldId = null;
    this.newId = null;
    this.isActive = null;
    return lodash.assignIn(new BaseInputModel(), new TeamData(), this);
}


module.exports = TeamRequest;