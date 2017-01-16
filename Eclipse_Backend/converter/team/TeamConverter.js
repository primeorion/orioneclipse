"use strict";

var moduleName = __filename;

var helper = require('helper');
var config = require('config');

var UtilService = require("service/util/UtilService");
var baseConverter = require('converter/base/BaseConverter.js');
var TeamRequest = require("model/team/TeamRequest.js");
var TeamResponse = require("model/team/TeamResponse.js");
var TeamUserResponse = require("model/team/TeamUserResponse.js");
var TeamAdvisorResponse = require("model/team/TeamAdvisorResponse.js");
var TeamModelResponse = require("model/team/TeamModelResponse.js");
var TeamPortfolioResponse = require("model/team/TeamPortfolioResponse.js");

var messages = config.messages;
var httpResponseCode = config.responseCodes;
var logger = helper.logger(moduleName);

var utilService = new UtilService();

var TeamConverter = function () { }

TeamConverter.prototype.getRequestToModel = function(data){
	var team = new TeamRequest();
	baseConverter(team, data);

	team.id = data.id;
	team.name = data.name;
	team.portfolioAccess = data.portfolioAccess;
	team.modelAccess = data.modelAccess;
	team.status = data.status;
	team.teamId = data.teamId;
    team.advisorIds = data.advisorIds;
    team.modelIds = data.modelIds;
    team.portfolioIds = data.portfolioIds;
    team.userIds = data.userIds;
    team.userId = data.userId;
    team.modelId = data.modelId;
    team.portfolioId = data.portfolioId;
    team.advisorId = data.advisorId;
    team.oldId = data.oldId;
    team.newId = data.newId;
    team.isActive = data.isOnlyActive;

	return team;
}
TeamConverter.prototype.getModelToResponse = function (data, cb) {
	var teamResponse = {};
	var teamList = [];
	data.forEach(function (team) {
		teamResponse = new TeamResponse();
		teamResponse.id = team.id;
		teamResponse.name = team.name;
		teamResponse.portfolioAccess = team.portfolioAccess;
		teamResponse.modelAccess = team.modelAccess;
		teamResponse.status = team.status;
		teamResponse.numberOfUsers = team.numberOfUsers;
		teamResponse.numberOfModels = team.numberOfModels;
		teamResponse.numberOfPortfolios = team.numberOfPortfolios;
		teamResponse.numberOfAdvisors = team.numberOfAdvisors;
		teamResponse.isDeleted = team.isDeleted;
		teamResponse.createdOn = team.createdOn;
		teamResponse.createdBy = team.createdBy;
		teamResponse.editedOn = team.editedOn;
		teamResponse.editedBy = team.editedBy;
		teamList.push(teamResponse);
	});
	return cb(null,teamList);
}

TeamConverter.prototype.getTeamAdvisorModelToResponse = function (data, cb) {
	var teamAdvisorList = [];
	data.forEach(function(advisor){
		var teamAdvisorResponse = new TeamAdvisorResponse();
		teamAdvisorResponse.id = advisor.id;
		teamAdvisorResponse.name = advisor.name;
		teamAdvisorResponse.isDeleted = advisor.isDeleted;
		teamAdvisorResponse.createdOn = advisor.createdOn;
		teamAdvisorResponse.createdBy = advisor.createdBy;
		teamAdvisorResponse.editedOn = advisor.editedOn;
		teamAdvisorResponse.editedBy = advisor.editedBy;
		teamAdvisorList.push(teamAdvisorResponse);
	});
	return cb(null,teamAdvisorList);
}

TeamConverter.prototype.getTeamPortfolioModelToResponse = function (data, cb) {
	var teamPortfolioList = [];
	data.forEach(function(portfolio){
		var teamPortfolioResponse = new TeamPortfolioResponse();
		teamPortfolioResponse.id = portfolio.id;
		teamPortfolioResponse.name = portfolio.name;
		teamPortfolioResponse.source = portfolio.source;
		teamPortfolioResponse.isDeleted = portfolio.isDeleted;
		teamPortfolioResponse.createdOn = portfolio.createdOn;
		teamPortfolioResponse.createdBy = portfolio.createdBy;
		teamPortfolioResponse.editedOn = portfolio.editedOn;
		teamPortfolioResponse.editedBy = portfolio.editedBy;
		teamPortfolioList.push(teamPortfolioResponse);
	});
	return cb(null,teamPortfolioList);
}

TeamConverter.prototype.getTeamModelModelToResponse = function (data, cb) {
	var teamModelList = [];
	data.forEach(function(model){
		var teamModelResponse = new TeamModelResponse();
		teamModelResponse.id = model.id;
		teamModelResponse.name = model.name;
		teamModelResponse.status = model.status;
		teamModelResponse.source = model.source;
		teamModelResponse.isDeleted = model.isDeleted;
		teamModelResponse.createdOn = model.createdOn;
		teamModelResponse.createdBy = model.createdBy;
		teamModelResponse.editedOn = model.editedOn;
		teamModelResponse.editedBy = model.editedBy;
		teamModelList.push(teamModelResponse);
	});
	return cb(null,teamModelList);
}

TeamConverter.prototype.getTeamUserModelToResponse = function (data, cb) {
	var teamUserList = [];
	data.forEach(function(user){
		var teamUserResponse = new TeamUserResponse();
		teamUserResponse.id = user.id;
		teamUserResponse.firstName = user.firstName;
		teamUserResponse.lastName = user.lastName;
		teamUserResponse.isDeleted = user.isDeleted;
		teamUserResponse.createdOn = user.createdOn;
		teamUserResponse.createdBy = user.createdBy;
		teamUserResponse.editedOn = user.editedOn;
		teamUserResponse.editedBy = user.editedBy;
		teamUserList.push(teamUserResponse);
	});
	return cb(null,teamUserList);
}
module.exports = TeamConverter;