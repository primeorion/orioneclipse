"use strict";

var moduleName = __filename;

var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var cache = require('service/cache').local;
var utilDao = require('dao/util/UtilDao.js');
var logger = require('helper/Logger.js')(moduleName);
var baseDao = require('dao/BaseDao.js');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');

var teamEntity = require("entity/team/Team.js");
var userTeamEntity = require("entity/user/UserTeam.js");
var teamModelEntity = require("entity/team/TeamModel.js");
var teamPortfolioEntity = require("entity/team/TeamPortfolio.js");
var teamAdvisorEntity = require("entity/team/TeamAdvisor.js");
var userEntity = require("entity/user/User.js");
var portfolioEntity = require("entity/portfolio/Portfolio.js");
var modelEntity = require("entity/model/ModelEntity.js");
var advisorEntity = require("entity/advisor/Advisor.js");
var accountEntity = require("entity/account/Account.js");


var TeamDao = function () { };

TeamDao.prototype.add = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Team create object", data);

    var currentDate = utilDao.getSystemDateTime();
    var queryData = {};
    queryData[teamEntity.columns.name] = data.name;
    queryData[teamEntity.columns.externalId] = data.externalId;
    queryData[teamEntity.columns.portfolioAccess] = data.portfolioAccess;
    queryData[teamEntity.columns.status] = data.status;
    queryData[teamEntity.columns.modelAccess] = data.modelAccess;
    queryData[teamEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[teamEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[teamEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[teamEntity.columns.editedDate] = currentDate;
    queryData[teamEntity.columns.createdDate] = currentDate;
    var query = 'INSERT INTO '+teamEntity.tableName+' SET ? ';
    logger.debug("Add Team Query", query);
    connection.query(query, [queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);

     var query = squel.select()
     .from(teamEntity.tableName)
    .where(squel.expr()
        .and(squel.expr()
        .or(squelUtils.eql(teamEntity.columns.id,data.id))
        .or(squelUtils.eql(teamEntity.columns.name,data.name)))
        .and(squelUtils.eql(teamEntity.columns.isDeleted,0))
    );

    query = query.toString();
    logger.debug("Get Team Query", query);
    connection.query(query, function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

TeamDao.prototype.update = function (data, cb) {
    var firmConnection = baseDao.getConnection(data);
    logger.debug("Team update object", data);

    var queryDataForFirmDb = {};
    queryDataForFirmDb[teamEntity.columns.id] =  data.id;
    queryDataForFirmDb[teamEntity.columns.name] =  data.name;
    queryDataForFirmDb[teamEntity.columns.editedBy] =  utilService.getAuditUserId(data.user);
    queryDataForFirmDb[teamEntity.columns.editedDate] =  utilDao.getSystemDateTime(null);

    
    if (data.externalId) {
        queryDataForFirmDb[teamEntity.columns.externalId] = data.externalId;
    }
    if (data.portfolioAccess !== null && (data.portfolioAccess === 1 || data.portfolioAccess ===0)) {
        queryDataForFirmDb[teamEntity.columns.portfolioAccess] = data.portfolioAccess;
    }
    if (data.status !== null && (data.status === 1 || data.status ===0)) {
        queryDataForFirmDb[teamEntity.columns.status] = data.status;
    }
    if (data.modelAccess !== null && (data.modelAccess === 1 || data.modelAccess ===0)) {
        queryDataForFirmDb[teamEntity.columns.modelAccess] = data.modelAccess;
    }
    var query = [];
    query.push(' UPDATE '+teamEntity.tableName+' SET ? ');
    query.push(' WHERE '+teamEntity.columns.id+' = ? AND '+teamEntity.columns.isDeleted+' = 0 ');

    query = query.join(" ");

    logger.debug("Update Team Query",query);
    firmConnection.query(query, [queryDataForFirmDb, data.id], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
};

TeamDao.prototype.delete = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Team to delete", data);
    var queryData = {};
    queryData[teamEntity.columns.isDeleted] = 1;
    queryData[teamEntity.columns.editedBy] =  utilService.getAuditUserId(data.user);
    queryData[teamEntity.columns.editedDate] =  utilDao.getSystemDateTime(null);

    var query = [];
    query.push(' UPDATE '+teamEntity.tableName+' SET ? ');
    query.push(' WHERE '+teamEntity.columns.id+' = ? AND '+teamEntity.columns.isDeleted+' = 0 ');

    query = query.join(" ");

    logger.debug("Delete Team Query",query);
    connection.query(query, [queryData, data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
TeamDao.prototype.getUserToInactive = function (data, cb){
     var connection = baseDao.getConnection(data);
     logger.debug("Get user to Inactive");

     
     var query = 'select uTOut.userId from userTeam AS uTOut '
     + ' inner join (select userId,count(*) AS user_count from userTeam '
     + ' group by userId) utSub ON uTOut.userId = utSub.userId '
     + ' where teamId = ? AND isDeleted = 0 AND user_count = 1 ';
     connection.query(query, [data.id], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

TeamDao.prototype.inactiveUsers = function (data,cb){
    var connection = baseDao.getConnection(data);
    logger.debug("Get user to Inactive");
    var userToInactive = data.userToInactive;
    var users = [];
    userToInactive.forEach(function(user){
        users.push(user.userId);
    });
    var query = [];
    query.push(' update '+userEntity.tableName+' set ');
    query.push( userEntity.columns.status+' = ? where '+userEntity.columns.id+' IN (?)');

    query = query.join(" ");
    logger.debug("Inactive User Query "+query);
    connection.query(query, [0, users], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
TeamDao.prototype.getAll = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is "+roleTypeId);
    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }

     var query = squel.select()
    .field(teamEntity.columns.id,'id')
    .field(teamEntity.columns.name,'name')
    .field(teamEntity.columns.portfolioAccess,'portfolioAccess')
    .field(teamEntity.columns.modelAccess,'modelAccess')
    .field(teamEntity.columns.status,'status')
    .field(teamEntity.columns.isDeleted,'isDeleted')
    .field(teamEntity.columns.createdDate,'createdOn')
    .field(teamEntity.columns.editedDate,'editedOn')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .field('count(DISTINCT '+userTeamEntity.columns.userId+')','numberOfUsers')
    .field('count(DISTINCT '+teamModelEntity.columns.modelId+')','numberOfModels')
    .field('count(DISTINCT '+teamPortfolioEntity.columns.portfolioId+')','numberOfPortfolios')
    .field('count(DISTINCT '+teamAdvisorEntity.columns.advisorId+')','numberOfAdvisors')
    .from(teamEntity.tableName)
    .left_join(squel.select()
        .field(userTeamEntity.columns.userId,'userId')
        .field(userTeamEntity.columns.teamId,'teamId')
        .from(userTeamEntity.tableName)
        .join(userEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(userTeamEntity.columns.userId,userEntity.columns.id))
        )
        .where(squel.expr()
            .and(squelUtils.eql(userTeamEntity.columns.isDeleted,0))
            .and(squelUtils.eql(userEntity.columns.isDeleted,0))
        ),userTeamEntity.tableName,squelUtils.joinEql(userTeamEntity.columns.teamId,teamEntity.columns.id)
    )
    .left_join(squel.select()
        .field(teamModelEntity.columns.modelId,'modelId')
        .field(teamModelEntity.columns.teamId,'teamId')
        .from(teamModelEntity.tableName)
        .join(modelEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(teamModelEntity.columns.modelId,modelEntity.columns.id))
        )
        .where(squel.expr()
            .and(squelUtils.eql(teamModelEntity.columns.isDeleted,0))
            .and(squelUtils.eql(modelEntity.columns.isDeleted,0))
        ),teamModelEntity.tableName,squelUtils.joinEql(teamModelEntity.columns.teamId,teamEntity.columns.id)
    )
    .left_join(squel.select()
        .field(teamPortfolioEntity.columns.portfolioId,'portfolioId')
        .field(teamPortfolioEntity.columns.teamId,'teamId')
        .from(teamPortfolioEntity.tableName)
        .join(portfolioEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(teamPortfolioEntity.columns.portfolioId,portfolioEntity.columns.id))
        )
        .where(squel.expr()
            .and(squelUtils.eql(teamPortfolioEntity.columns.isDeleted,0))
            .and(squelUtils.eql(portfolioEntity.columns.isDeleted,0))
        ),teamPortfolioEntity.tableName,squelUtils.joinEql(teamPortfolioEntity.columns.teamId,teamEntity.columns.id)
    )
    .left_join(squel.select()
        .field(teamAdvisorEntity.columns.advisorId,'advisorId')
        .field(teamAdvisorEntity.columns.teamId,'teamId')
        .from(teamAdvisorEntity.tableName)
        .join(advisorEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(teamAdvisorEntity.columns.advisorId,advisorEntity.columns.id))
        )
        .where(squel.expr()
            .and(squelUtils.eql(teamAdvisorEntity.columns.isDeleted,0))
            .and(squelUtils.eql(advisorEntity.columns.isDeleted,0))
        ),teamAdvisorEntity.tableName,squelUtils.joinEql(teamAdvisorEntity.columns.teamId,teamEntity.columns.id)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,teamEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,teamEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.eql(1,1))
    );

    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,0))
        )
    }

    if(roleTypeId !== enums.roleType.FIRMADMIN){
        if( data.user.teamIds && data.user.teamIds.length>0){
            query.where(
                squel.expr().and(squelUtils.in(teamEntity.columns.id,data.user.teamIds))
            )
        }
    }

    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.where(
                squel.expr().and(
                    squel.expr()
                    .or(squelUtils.eql(teamEntity.columns.id,data.search))
                    .or(squelUtils.like(teamEntity.columns.name,data.search))
                )
            )
        } else {
            query.where(
                squel.expr().and(
                    squelUtils.like(teamEntity.columns.name,data.search)
                )
            )
        }
    }
    if (data.exactSearch) {
        query.where(
            squel.expr().and(
                squelUtils.eql(teamEntity.columns.name,data.search)
            )
        )
    }
    
    if (data.isActive != null) {
        query.where(
            squel.expr().and(
                squelUtils.eql(teamEntity.columns.status, data.isActive)
            )
        )
    }
    
    query.group(teamEntity.columns.id)
//    if (data.search) {
        query.order(teamEntity.columns.name);
//    }
    query = query.toString();
    
logger.debug("Select Team query", query);

connection.query(query, function (err, data) {
    if (err) {
        return cb(err);
    }
    return cb(null, data);
});
};

TeamDao.prototype.getDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var isDeleted = null;
    var roleTypeId = data.user.roleTypeId;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }
    var roleTypeId = data.user.roleTypeId;
    var query = squel.select()
    .field(teamEntity.columns.id,'id')
    .field(teamEntity.columns.name,'name')
    .field(teamEntity.columns.portfolioAccess,'portfolioAccess')
    .field(teamEntity.columns.modelAccess,'modelAccess')
    .field(teamEntity.columns.status,'status')
    .field(teamEntity.columns.isDeleted,'isDeleted')
    .field(teamEntity.columns.createdDate,'createdOn')
    .field(teamEntity.columns.editedDate,'editedOn')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .field('count(DISTINCT '+userTeamEntity.columns.userId+')','numberOfUsers')
    .field('count(DISTINCT '+teamModelEntity.columns.modelId+')','numberOfModels')
    .field('count(DISTINCT '+teamPortfolioEntity.columns.portfolioId+')','numberOfPortfolios')
    .field('count(DISTINCT '+teamAdvisorEntity.columns.advisorId+')','numberOfAdvisors')
    .from(teamEntity.tableName)
    .left_join(squel.select()
        .field(userTeamEntity.columns.userId,'userId')
        .field(userTeamEntity.columns.teamId,'teamId')
        .from(userTeamEntity.tableName)
        .join(userEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(userTeamEntity.columns.userId,userEntity.columns.id))
        )
        .where(squel.expr()
            .and(squelUtils.eql(userTeamEntity.columns.isDeleted,0))
            .and(squelUtils.eql(userEntity.columns.isDeleted,0))
        ),userTeamEntity.tableName,squelUtils.joinEql(userTeamEntity.columns.teamId,teamEntity.columns.id)
    )
    .left_join(squel.select()
        .field(teamModelEntity.columns.modelId,'modelId')
        .field(teamModelEntity.columns.teamId,'teamId')
        .from(teamModelEntity.tableName)
        .join(modelEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(teamModelEntity.columns.modelId,modelEntity.columns.id))
        )
        .where(squel.expr()
            .and(squelUtils.eql(teamModelEntity.columns.isDeleted,0))
            .and(squelUtils.eql(modelEntity.columns.isDeleted,0))
        ),teamModelEntity.tableName,squelUtils.joinEql(teamModelEntity.columns.teamId,teamEntity.columns.id)
    )
    .left_join(squel.select()
        .field(teamPortfolioEntity.columns.portfolioId,'portfolioId')
        .field(teamPortfolioEntity.columns.teamId,'teamId')
        .from(teamPortfolioEntity.tableName)
        .join(portfolioEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(teamPortfolioEntity.columns.portfolioId,portfolioEntity.columns.id))
        )
        .where(squel.expr()
            .and(squelUtils.eql(teamPortfolioEntity.columns.isDeleted,0))
            .and(squelUtils.eql(portfolioEntity.columns.isDeleted,0))
        ),teamPortfolioEntity.tableName,squelUtils.joinEql(teamPortfolioEntity.columns.teamId,teamEntity.columns.id)
    )
    .left_join(squel.select()
        .field(teamAdvisorEntity.columns.advisorId,'advisorId')
        .field(teamAdvisorEntity.columns.teamId,'teamId')
        .from(teamAdvisorEntity.tableName)
        .join(advisorEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(teamAdvisorEntity.columns.advisorId,advisorEntity.columns.id))
        )
        .where(squel.expr()
            .and(squelUtils.eql(teamAdvisorEntity.columns.isDeleted,0))
            .and(squelUtils.eql(advisorEntity.columns.isDeleted,0))
        ),teamAdvisorEntity.tableName,squelUtils.joinEql(teamAdvisorEntity.columns.teamId,teamEntity.columns.id)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,teamEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,teamEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.eql(teamEntity.columns.id,data.id))
    );
    if(roleTypeId !== enums.roleType.FIRMADMIN){
        if( data.user.teamIds && data.user.teamIds.length>0){
            query.where(
                squel.expr().and(squelUtils.in(teamEntity.columns.id,data.user.teamIds))
            )
        }
    }
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,0))
        )
    }

    /*if(roleTypeId !== enums.roleType.FIRMADMIN){
        query.where(
            squel.expr().and(squelUtils.in(teamEntity.columns.id,data.user.teamIds))
        )
    }*/
    query.group(teamEntity.columns.id);

    query = query.toString();
    
    logger.debug("Select Team Detail  query", query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.assignUserToTeam = function (data, cb) {

    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[userTeamEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[userTeamEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[userTeamEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userTeamEntity.columns.createdDate] = currentDate;
    queryData[userTeamEntity.columns.editedDate] = currentDate;

    var query = [];
    query.push(' INSERT INTO '+userTeamEntity.tableName);
    query.push(' ('+userTeamEntity.columns.teamId+','+userTeamEntity.columns.userId+', ');
    query.push(' '+userTeamEntity.columns.isDeleted+','+userTeamEntity.columns.createdBy+', ');
    query.push(' '+userTeamEntity.columns.createdDate+', ');
    query.push(' '+userTeamEntity.columns.editedDate+', '+userTeamEntity.columns.editedBy+') VALUES ? ');
    query = query.join(" ");

    logger.debug("Add team User Query",query);
    var userTeams = [];
    var users = data.userIds;
    if (!Array.isArray(data.userIds)) {
        users = [];
        users.push(data.userIds);
    }
    users.forEach(function (userId) {
        var userTeam = [];
        userTeam.push(data.id);
        userTeam.push(userId);
        userTeam.push(data.isDeleted ? data.isDeleted : 0);
        userTeam.push(utilService.getAuditUserId(data.user));
        userTeam.push(currentDate);
        userTeam.push(currentDate);
        userTeam.push(utilService.getAuditUserId(data.user));
        userTeams.push(userTeam);
    });
    connection.query(query, [userTeams], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.assignPortfolioToTeam = function (data, cb) {

    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime(null);
    logger.debug("assign PortfolioTo team Data"+JSON.stringify(data));
    var queryData = {};
    queryData[teamPortfolioEntity.columns.source] = data.source;
    queryData[teamPortfolioEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[teamPortfolioEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[teamPortfolioEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[teamPortfolioEntity.columns.createdDate] = currentDate;
    queryData[teamPortfolioEntity.columns.editedDate] = currentDate;

    var query = [];
    query.push(' INSERT INTO '+teamPortfolioEntity.tableName+' ');
    query.push(' ('+teamPortfolioEntity.columns.teamId+','+teamPortfolioEntity.columns.portfolioId+', ');
    query.push(' '+teamPortfolioEntity.columns.isDeleted+','+teamPortfolioEntity.columns.source+', ');
    query.push(' '+teamPortfolioEntity.columns.createdBy+','+teamPortfolioEntity.columns.createdDate+', ' );
    query.push(' '+teamPortfolioEntity.columns.editedDate+', '+teamPortfolioEntity.columns.editedBy+') VALUES ? ');
    query = query.join(" ");

    logger.debug("Add team Portfolio Query",query);
    var teamPortfolios = [];
    var portfolios = data.portfolioIds;
    if (!Array.isArray(data.portfolioIds)) {
        portfolios = [];
        portfolios.push(data.portfolioIds);
    }
    portfolios.forEach(function (portfolioId) {
        var teamPortfolio = [];
        teamPortfolio.push(data.id);
        teamPortfolio.push(portfolioId);
        teamPortfolio.push(data.isDeleted ? data.isDeleted : 0);
        teamPortfolio.push(data.source);
        teamPortfolio.push(utilService.getAuditUserId(data.user));
        teamPortfolio.push(currentDate);
        teamPortfolio.push(currentDate);
        teamPortfolio.push(utilService.getAuditUserId(data.user));
        teamPortfolios.push(teamPortfolio);
    });
    connection.query(query, [teamPortfolios], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.assignAdvisorToTeam = function (data, cb) {

    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime(null);
    var queryData = {};
    queryData[teamAdvisorEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[teamAdvisorEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[teamAdvisorEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[teamAdvisorEntity.columns.createdDate] = currentDate;
    queryData[teamAdvisorEntity.columns.editedDate] = currentDate;
    
    var query = [];
    query.push('INSERT INTO '+teamAdvisorEntity.tableName);
    query.push(' ('+teamAdvisorEntity.columns.teamId+','+teamAdvisorEntity.columns.advisorId+', ' );
    query.push(' '+teamAdvisorEntity.columns.isDeleted+', '+teamAdvisorEntity.columns.createdBy+', ');
    query.push(' '+teamAdvisorEntity.columns.createdDate+','+teamAdvisorEntity.columns.editedDate+', ');
    query.push(' '+teamAdvisorEntity.columns.editedBy+') VALUES ? ');
    query = query.join(" ");

    logger.debug("Add team Advisor Query",query);
    var teamAdvisors = [];
    var advisors = data.advisorIds;
    if (!Array.isArray(data.advisorIds)) {
        advisors = [];
        advisors.push(data.advisorIds);
    }
    advisors.forEach(function (advisorId) {
        var teamAdvisor = [];
        teamAdvisor.push(data.id);
        teamAdvisor.push(advisorId);
        teamAdvisor.push(data.isDeleted ? data.isDeleted : 0);
        teamAdvisor.push(utilService.getAuditUserId(data.user));
        teamAdvisor.push(currentDate);
        teamAdvisor.push(currentDate);
        teamAdvisor.push(utilService.getAuditUserId(data.user));
        teamAdvisors.push(teamAdvisor);
    });
    connection.query(query, [teamAdvisors], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.assignModelToTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime(null);
    var queryData = {};
    queryData[teamModelEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[teamModelEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[teamModelEntity.columns.createdDate] = currentDate;
    queryData[teamModelEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[teamModelEntity.columns.editedDate] = currentDate;

    var query = [];
    query.push(' INSERT INTO '+teamModelEntity.tableName+' ');
    query.push(' ('+teamModelEntity.columns.teamId+','+teamModelEntity.columns.modelId+', ');
    query.push(' '+teamModelEntity.columns.isDeleted+', '+teamModelEntity.columns.createdBy+', ');
    query.push(' '+teamModelEntity.columns.createdDate+','+teamModelEntity.columns.editedDate+', ');
    query.push(' '+teamModelEntity.columns.editedBy+') VALUES ? ');
    query = query.join(" ");

    logger.debug("Add team Model Query",query);
    var teamModels = [];
    var models = data.modelIds;
    if (!Array.isArray(data.modelIds)) {
        models = [];
        models.push(data.modelIds);
    }
    models.forEach(function (modelId) {
        var teamModel = [];
        teamModel.push(data.id);
        teamModel.push(modelId);
        teamModel.push(data.isDeleted ? data.isDeleted : 0);
        teamModel.push(utilService.getAuditUserId(data.user));
        teamModel.push(currentDate);
        teamModel.push(currentDate);
        teamModel.push(utilService.getAuditUserId(data.user));
        teamModels.push(teamModel);
    });
    connection.query(query, [teamModels], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.getUserToTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }

    var query = squel.select()
    .distinct()
    .field(userTeamEntity.columns.userId,'id')
    .field(userEntity.columns.firstName,'firstName')
    .field(userEntity.columns.lastName,'lastName')
    .field(userTeamEntity.columns.isDeleted,'isDeleted')
    .field(userTeamEntity.columns.createdDate,'createdOn')
    .field(userTeamEntity.columns.editedDate,'editedOn')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(userTeamEntity.tableName)
    .join(userEntity.tableName, null, 
        squelUtils.joinEql(userEntity.columns.id,userTeamEntity.columns.userId)
    )
    .join(teamEntity.tableName, null, 
        squelUtils.joinEql(teamEntity.columns.id,userTeamEntity.columns.teamId)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,userTeamEntity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,userTeamEntity.columns.editedBy)
     )
    .where(
        squel.expr().and(squelUtils.eql(userTeamEntity.columns.teamId,data.id))
        .and(squelUtils.eql(userTeamEntity.columns.isDeleted,0))
        .and(squelUtils.eql(userEntity.columns.isDeleted,0))
    );
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,0))
        )
    }
    query = query.toString();

    logger.debug("Select Team Users query", query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.getPortfolioToTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    
    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }
    
    var query = squel.select()
    .distinct()
    .field(teamPortfolioEntity.columns.portfolioId,'id')
    .field(portfolioEntity.columns.name,'name')
    .field(teamPortfolioEntity.columns.isDeleted,'isDeleted')
    .field(teamPortfolioEntity.columns.createdDate,'createdOn')
    .field(teamPortfolioEntity.columns.editedDate,'editedOn')
    .field(teamPortfolioEntity.columns.source,'source')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(teamPortfolioEntity.tableName)
    .join(portfolioEntity.tableName, null, 
        squelUtils.joinEql(portfolioEntity.columns.id,teamPortfolioEntity.columns.portfolioId)
    )
    .join(teamEntity.tableName, null, 
        squelUtils.joinEql(teamEntity.columns.id,teamPortfolioEntity.columns.teamId)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,teamPortfolioEntity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,teamPortfolioEntity.columns.editedBy)
     )
    .where(
        squel.expr().and(squelUtils.eql(teamPortfolioEntity.columns.teamId,data.id))
        .and(squelUtils.eql(teamPortfolioEntity.columns.isDeleted,0))
        .and(squelUtils.eql(portfolioEntity.columns.isDeleted,0))
    );
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,0))
        )
    }
    query = query.toString();

    logger.debug("Select Team Portfolio query", query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.getAdvisorToTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }

    var query = squel.select()
    .distinct()
    .field(teamAdvisorEntity.columns.advisorId,'id')
    .field(advisorEntity.columns.name,'name')
    .field(teamAdvisorEntity.columns.isDeleted,'isDeleted')
    .field(teamAdvisorEntity.columns.createdDate,'createdOn')
    .field(teamAdvisorEntity.columns.editedDate,'editedOn')
    .field(teamAdvisorEntity.columns.source,'source')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(teamAdvisorEntity.tableName)
    .join(advisorEntity.tableName, null, 
        squelUtils.joinEql(advisorEntity.columns.id,teamAdvisorEntity.columns.advisorId)
    )
    .join(teamEntity.tableName, null, 
        squelUtils.joinEql(teamEntity.columns.id,teamAdvisorEntity.columns.teamId)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,teamAdvisorEntity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,teamAdvisorEntity.columns.editedBy)
     )
    .where(
        squel.expr().and(squelUtils.eql(teamAdvisorEntity.columns.teamId,data.id))
        .and(squelUtils.eql(teamAdvisorEntity.columns.isDeleted,0))
        .and(squelUtils.eql(advisorEntity.columns.isDeleted,0))
    );
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,0))
        )
    }
    query = query.toString();

    logger.debug("Select Team Advisors query", query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
}

TeamDao.prototype.getModelToTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var queryData = {
        id: data.id
    };
    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }

    var query = squel.select()
    .distinct()
    .field(teamModelEntity.columns.modelId,'id')
    .field(modelEntity.columns.name,'name')
    .field(modelEntity.columns.status,'status')
    .field(teamModelEntity.columns.isDeleted,'isDeleted')
    .field(teamModelEntity.columns.createdDate,'createdOn')
    .field(teamModelEntity.columns.editedDate,'editedOn')
    .field("case when ("+modelEntity.columns.createdBy+" = 0) THEN 'Advisor' ELSE 'Team' END",'source')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(teamModelEntity.tableName)
    .join(modelEntity.tableName, null, 
        squelUtils.joinEql(modelEntity.columns.id,teamModelEntity.columns.modelId)
    )
    .join(teamEntity.tableName, null, 
        squelUtils.joinEql(teamEntity.columns.id,teamModelEntity.columns.teamId)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,teamModelEntity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,teamModelEntity.columns.editedBy)
     )
    .where(
        squel.expr().and(squelUtils.eql(teamModelEntity.columns.teamId,data.id))
        .and(squelUtils.eql(teamModelEntity.columns.isDeleted,0))
        .and(squelUtils.eql(modelEntity.columns.isDeleted,0))
    );
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(teamEntity.columns.isDeleted,0))
        )
    }
    query = query.toString();

    logger.debug("Select Team Models query: ", query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};


TeamDao.prototype.removeUserFromTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Remove User From Team", data);
    var queryData = {};
    queryData[userTeamEntity.columns.isDeleted] = 1;
    queryData[userTeamEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userTeamEntity.columns.editedDate] = utilDao.getSystemDateTime(null);

    var query = [];
    query.push(' Update  '+userTeamEntity.tableName+' ');
    query.push(' SET ?  WHERE  '+userTeamEntity.columns.teamId+' = ? ');
    query.push(' AND '+userTeamEntity.columns.isDeleted+' = 0 ');
    if (data.userIds && data.userIds.length > 0) {
        query.push('  AND '+userTeamEntity.columns.userId+' NOT IN(?) ');
    }
    query = query.join(" ");

    logger.debug("Remove User Team Query"+query);
    connection.query(query, [queryData, data.id, data.userIds], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.removeAdvisorFromTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Remove Advisor From Team", data);
    var queryData = {};
    queryData[teamAdvisorEntity.columns.isDeleted] = 1;
    queryData[teamAdvisorEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[teamAdvisorEntity.columns.editedDate] =  utilDao.getSystemDateTime(null);

    var query = [];
    query.push(' Update '+teamAdvisorEntity.tableName+' ');
    query.push(' Set ?  WHERE '+teamAdvisorEntity.columns.teamId+' = ? ');
    query.push(' AND '+teamAdvisorEntity.columns.isDeleted+' = 0 ');
    if (data.advisorIds && data.advisorIds.length > 0) {
        query.push(' AND '+teamAdvisorEntity.columns.advisorId+' NOT IN(?) ');
    }
    query = query.join(" ");

    logger.debug('Remove advisor team Query' + query);
    connection.query(query, [queryData, data.id, data.advisorIds], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null,resultSet); 
    });
    
};

TeamDao.prototype.removeModelFromTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Remove Model From Team", data);
    var queryData = {};
    queryData[teamModelEntity.columns.isDeleted] = 1;
    queryData[teamModelEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[teamModelEntity.columns.editedDate] = utilDao.getSystemDateTime(null);

    var query = [];
    query.push(' Update '+teamModelEntity.tableName+' ');
    query.push(' Set ? WHERE '+teamModelEntity.columns.teamId+' = ? ');
    query.push(' AND '+teamModelEntity.columns.isDeleted+' = 0 ');
    if (data.modelIds && data.modelIds.length > 0) {
        query.push(' AND '+teamModelEntity.columns.modelId+' NOT IN(?) ');
    }
    query = query.join(" ");

    logger.debug("Remove model team Query" + query);
    connection.query(query, [queryData, data.id, data.modelIds], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.removePortfolioFromTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Remove Portfolio From Team", data);
    var queryData = {};
    queryData[teamPortfolioEntity.columns.isDeleted] = 1;
    queryData[teamPortfolioEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[teamPortfolioEntity.columns.editedDate] = utilDao.getSystemDateTime(null);

    var query = [];
    query.push(' Update '+teamPortfolioEntity.tableName+' ');
    query.push(' Set ?  WHERE '+teamPortfolioEntity.columns.teamId+' = ? ');
    query.push(' AND '+teamPortfolioEntity.columns.isDeleted+' = 0 ');
    /*query.push(' AND ('+teamPortfolioEntity.columns.isPrimary+' != 1 ');
    query.push(' OR ('+teamPortfolioEntity.columns.isPrimary+' = 1 ');
    query.push(' AND '+teamPortfolioEntity.columns.source+' = "Advisor")) ');*/
    if (data.portfolioIds && data.portfolioIds.length > 0) {
        query.push(' AND '+teamPortfolioEntity.columns.portfolioId+' NOT IN(?) ');
    }
    query = query.join(" ");

    logger.debug("Remove portfolio team Query" + query);
    connection.query(query, [queryData, data.id, data.portfolioIds], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
TeamDao.prototype.getPortfolioPrimaryTeam = function(data,cb){
    var connection = baseDao.getConnection(data);

    logger.debug("Get portfolio primary team",data);
    var query = squel.select()
    .field(teamPortfolioEntity.columns.portfolioId)
    .from(teamPortfolioEntity.tableName)
    .join(teamEntity.tableName,null,squel.expr()
        .and(squelUtils.joinEql(teamEntity.columns.id,teamPortfolioEntity.columns.teamId))   
    )
    .join(portfolioEntity.tableName,null,squel.expr()
        .and(squelUtils.joinEql(portfolioEntity.columns.id,teamPortfolioEntity.columns.portfolioId))
    )
    .where(squel.expr()
        .and(squelUtils.eql(teamPortfolioEntity.columns.isDeleted,0))
        .and(squelUtils.eql(portfolioEntity.columns.isDeleted,0))
        .and(squelUtils.eql(teamPortfolioEntity.columns.teamId,data.id))
        .and(squelUtils.eql(teamPortfolioEntity.columns.isPrimary,1))
        .and(squelUtils.eql(teamPortfolioEntity.columns.source,"Team"))
    );
    query = query.toString();

    logger.debug("Get portfolio primary team" + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
}


TeamDao.prototype.updateUserTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Update User To Team", data);
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = [];
    queryData.push(currentDate);
    queryData.push(utilService.getAuditUserId(data.user));
    queryData.push(currentDate);
    queryData.push(utilService.getAuditUserId(data.user));
    queryData.push(data.userId);
    queryData.push(data.id);

    var query = [];
    query.push(" UPDATE "+userTeamEntity.tableName+" ");
    query.push(" SET  "+userTeamEntity.columns.editedDate+" =  ? , ");
    query.push(" "+userTeamEntity.columns.editedBy+" = ? ,  ");
    query.push(" "+userTeamEntity.columns.createdDate);
    query.push(" = CASE WHEN "+userTeamEntity.columns.isDeleted);
    query.push(" = 1  THEN ? ELSE "+userTeamEntity.columns.createdDate+" END, ");
    query.push(" "+userTeamEntity.columns.createdBy);
    query.push(" = CASE WHEN "+userTeamEntity.columns.isDeleted);
    query.push(" = 1  THEN ? ELSE "+userTeamEntity.columns.createdBy+" END, ");
    query.push(" "+userTeamEntity.columns.isDeleted);
    query.push(" = CASE WHEN "+userTeamEntity.columns.isDeleted);
    query.push(" = 1  THEN 0 ELSE "+userTeamEntity.columns.isDeleted+" END ");
    query.push(" WHERE "+userTeamEntity.columns.userId+" = ? ");
    query.push(" AND "+userTeamEntity.columns.teamId+" = ? ");
    query = query.join(" ");

    logger.debug('Update user team Query' + query);
    connection.query(query, queryData, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.updateAdvisorTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Update Advisor To Team", data);
    var currentDate = utilDao.getSystemDateTime(null);
    
    var queryData = [];
    queryData.push(currentDate);
    queryData.push(utilService.getAuditUserId(data.user));
    queryData.push(currentDate);
    queryData.push(utilService.getAuditUserId(data.user));
    queryData.push(data.advisorId);
    queryData.push(data.id);

    var query = [];
    query.push(" UPDATE "+teamAdvisorEntity.tableName+" ");
    query.push(" SET  "+teamAdvisorEntity.columns.editedDate+" =  ? , ");
    query.push(" "+teamAdvisorEntity.columns.editedBy+" = ? ,  ");
    query.push(" "+teamAdvisorEntity.columns.createdDate+" = CASE ");
    query.push(" WHEN "+teamAdvisorEntity.columns.isDeleted+" = 1  THEN ? ");
    query.push(" ELSE "+teamAdvisorEntity.columns.createdDate+" END, ");
    query.push(" "+teamAdvisorEntity.columns.createdBy+" = CASE ");
    query.push(" WHEN "+teamAdvisorEntity.columns.isDeleted+" = 1  THEN ? ");
    query.push(" ELSE "+teamAdvisorEntity.columns.createdBy+" END, ");
    query.push(" "+teamAdvisorEntity.columns.isDeleted+" = CASE ");
    query.push(" WHEN "+teamAdvisorEntity.columns.isDeleted+" = 1  THEN 0 ");
    query.push(" ELSE "+teamAdvisorEntity.columns.isDeleted+" END ");
    query.push(" WHERE "+teamAdvisorEntity.columns.advisorId+" = ? ");
    query.push(" AND "+teamAdvisorEntity.columns.teamId+" = ?  ");
    query = query.join("");
    
    logger.debug('Update team advisor Query' + query);
    connection.query(query, queryData, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.updateModelTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Update Model To Team", data);
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = [];
    queryData.push(currentDate);
    queryData.push(utilService.getAuditUserId(data.user));
    queryData.push(currentDate);
    queryData.push(utilService.getAuditUserId(data.user));
    queryData.push(data.modelId);
    queryData.push(data.id);

    var query = [];
    query.push(" UPDATE "+teamModelEntity.tableName+" ");
    query.push(" SET  "+teamModelEntity.columns.editedDate+" =  ? , ");
    query.push(" "+teamModelEntity.columns.editedBy+" = ? ,  ");
    query.push(" "+teamModelEntity.columns.createdDate+" = CASE ");
    query.push(" WHEN "+teamModelEntity.columns.isDeleted+" = 1  THEN ? ");
    query.push(" ELSE "+teamModelEntity.columns.createdDate+" END, ");
    query.push(" "+teamModelEntity.columns.createdBy+" = CASE ");
    query.push(" WHEN "+teamModelEntity.columns.isDeleted+" = 1  THEN ? ");
    query.push(" ELSE "+teamModelEntity.columns.createdBy+" END, ");
    query.push(" "+teamModelEntity.columns.isDeleted+" = CASE ");
    query.push(" WHEN "+teamModelEntity.columns.isDeleted+" = 1  THEN 0 ");
    query.push(" ELSE "+teamModelEntity.columns.isDeleted+" END ");
    query.push(" WHERE "+teamModelEntity.columns.modelId+" = ? ");
    query.push(" AND "+teamModelEntity.columns.teamId+" = ?  ");
    query = query.join("");

    logger.debug('Update team model Query' + query);
    connection.query(query,queryData, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.updatePortfolioTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Update Portfolio To Team", data);
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = [];
    queryData.push(currentDate);
    queryData.push(utilService.getAuditUserId(data.user));
    queryData.push(data.source);
    queryData.push(currentDate);
    queryData.push(utilService.getAuditUserId(data.user));
    queryData.push(data.portfolioId);
    queryData.push(data.id);

    var query = [];
    query.push(" UPDATE "+teamPortfolioEntity.tableName+" ");
    query.push(" SET  "+teamPortfolioEntity.columns.editedDate+" =  ? , ");
    query.push(" "+teamPortfolioEntity.columns.editedBy+" = ? ,  ");
    query.push(" source = CASE ");
    query.push(" WHEN "+teamPortfolioEntity.columns.isDeleted+" = 1  THEN ? ");
    query.push(" ELSE source END, ");
    query.push(" "+teamPortfolioEntity.columns.createdDate+" = CASE ");
    query.push(" WHEN "+teamPortfolioEntity.columns.isDeleted+" = 1  THEN ? ");
    query.push(" ELSE "+teamPortfolioEntity.columns.createdDate+" END, ");
    query.push(" "+teamPortfolioEntity.columns.createdBy+" = CASE ");
    query.push(" WHEN "+teamPortfolioEntity.columns.isDeleted+" = 1  THEN ? ");
    query.push(" ELSE "+teamPortfolioEntity.columns.createdBy+" END, ");
    query.push(" "+teamPortfolioEntity.columns.isDeleted+" = CASE ");
    query.push(" WHEN "+teamPortfolioEntity.columns.isDeleted+" = 1  THEN 0 ");
    query.push(" ELSE "+teamPortfolioEntity.columns.isDeleted+" END ");
    query.push(" WHERE "+teamPortfolioEntity.columns.portfolioId+" = ? ");
    query.push(" AND "+teamPortfolioEntity.columns.teamId+" = ? ");
    query = query.join("");    
    
    logger.debug('Update team portfolioQuery' + query);
    connection.query(query,queryData, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.reassignTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime(null);
    logger.debug("Reassign User To Team", data);
    var queryData = {};
    queryData[userTeamEntity.columns.isDeleted] = 1;
    queryData[userTeamEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[userTeamEntity.columns.editedDate] = currentDate;

    var getUserQuery = squel.select()
    .field(userTeamEntity.columns.userId,'userId')
    .from(userTeamEntity.tableName)
    .where(
        squel.expr().and(squelUtils.eql(userTeamEntity.columns.teamId,data.oldId))
        .and(squelUtils.eql(userTeamEntity.columns.isDeleted,0))
    );
    getUserQuery = getUserQuery.toString();

    logger.debug("Get User Query",getUserQuery);
    connection.query(getUserQuery, function (err, result) {
        if (err) {
            return cb(err);
        }
        if(result && result.length > 0){
            var query = [];
            query.push(' Update '+userTeamEntity.tableName+'  set ? ');
            query.push(' where '+userTeamEntity.columns.teamId+' = ? ');
            query.push(' and '+userTeamEntity.columns.isDeleted+' = 0');
            query = query.join(" ");
            connection.query(query, [queryData, data.oldId], function (err, updated) {
                if (err) {
                    return cb(err);
                }
                var userTeams = [];
                result.forEach(function (user) {
                    var userTeam = [];
                    userTeam.push(user.userId);
                    userTeam.push(data.newId);
                    userTeam.push(currentDate);
                    userTeam.push(currentDate);
                    userTeam.push(utilService.getAuditUserId(data.user));
                    userTeam.push(utilService.getAuditUserId(data.user));
                    userTeams.push(userTeam);
                });
                var insertUpdateQuery = [];
                insertUpdateQuery.push(' INSERT INTO '+userTeamEntity.tableName+' ');
                insertUpdateQuery.push(' ('+userTeamEntity.columns.userId+','+userTeamEntity.columns.teamId+', ');
                insertUpdateQuery.push(' '+userTeamEntity.columns.createdDate+','+userTeamEntity.columns.editedDate+' ');
                insertUpdateQuery.push(' ,'+userTeamEntity.columns.createdBy+','+userTeamEntity.columns.editedBy+')  ');
                insertUpdateQuery.push(' VALUES ? ON DUPLICATE KEY ');
                insertUpdateQuery.push(' UPDATE '+userTeamEntity.columns.isDeleted+'=0 ');
                insertUpdateQuery.push(' AND '+userTeamEntity.columns.editedBy+' = ' + utilService.getAuditUserId(data.user));
                insertUpdateQuery.push(' AND '+userTeamEntity.columns.editedDate+' = "' + currentDate+'" ');
                insertUpdateQuery.push(' AND '+userTeamEntity.columns.createdBy+' = ' + utilService.getAuditUserId(data.user));
                insertUpdateQuery.push(' AND '+userTeamEntity.columns.editedDate+' = "' + currentDate+'" ');
                insertUpdateQuery = insertUpdateQuery.join(" ");

                logger.debug("Insert update user team query"+insertUpdateQuery);
                connection.query(insertUpdateQuery, [userTeams], function (err, output) {
                    if (err) {
                        return cb(err);
                    }
                    return cb(null, output);
                });
            });
        } else {
            return cb(null, result);
        }
    });
};

TeamDao.prototype.getTeamSummary  = function(data,cb){
    var connection = baseDao.getConnection(data);
    var query = "CALL getDashboardSummaryTeams(?)" ;
    var currentUserId =data.user.userId;
    connection.query(query,[currentUserId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet[0][0]);

    });
};
TeamDao.prototype.updateUserStatus  = function(data,cb){
    var connection = baseDao.getConnection(data);
    var query = "CALL updateUserStatus(?)" ;
    var teamId =data.id;
    connection.query(query,[teamId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
TeamDao.prototype.getAdvisorPortfolios = function(data, cb){
    var connection = baseDao.getConnection(data);

    var subQuery = squel.select()
            .field(advisorEntity.columns.id,'id')
            .from(advisorEntity.tableName)
            .where(squel.expr().and(squelUtils.in(advisorEntity.columns.id,data.advisorIds))
                .and(squelUtils.eql(advisorEntity.columns.isDeleted,0))
                );
    var query = squel.select()
    .distinct()
    .field(accountEntity.columns.portfolioId,'portfolioId')
    .from(accountEntity.tableName)
    .join(portfolioEntity.tableName,null,squel.expr()
        .and(squelUtils.joinEql(portfolioEntity.columns.id,accountEntity.columns.portfolioId))
    )
    .where(
        squel.expr().and(squelUtils.in(accountEntity.columns.advisorId,subQuery))
            .and(squelUtils.eql(accountEntity.columns.isDeleted,0))
            .and(squelUtils.eql(portfolioEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Advisor portfolio query"+query);
    connection.query(query, function(err, resultSet){
        if(err){
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
TeamDao.prototype.removeAdvisorPortfolioFromTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Remove advisor Portfolio From Team", data);

    var queryData = {};
    queryData[teamPortfolioEntity.columns.isDeleted] =  1;
    queryData[teamPortfolioEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[teamPortfolioEntity.columns.editedDate] = utilDao.getSystemDateTime(null);


    var query = [];
    query.push(' Update '+teamPortfolioEntity.tableName+' ');
    query.push(' Set ?  WHERE '+teamPortfolioEntity.columns.teamId+' = ? ');
    query.push(' AND '+teamPortfolioEntity.columns.isDeleted+'isDeleted = 0 ');
    query.push(' AND '+teamPortfolioEntity.columns.source+' = "Advisor" ');
    if (data.portfolioIds && data.portfolioIds.length > 0) {
        query.push(' AND '+teamPortfolioEntity.columns.portfolioId+' IN(?) ');
    }
    query = query.join(" ");

    logger.debug(" Remove advisor porfolio from team Query",query);
    connection.query(query, [queryData, data.id, data.portfolioIds], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

TeamDao.prototype.getPrimaryPortfolioForTeam = function(data,cb){
    var connection = baseDao.getConnection(data);

    var query = squel.select()
    .field(portfolioEntity.columns.id,'id')
    .field(portfolioEntity.columns.name,'name')
    .field(teamPortfolioEntity.columns.createdDate,'createdOn')
    .field(teamPortfolioEntity.columns.editedDate,'editedOn')
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(teamPortfolioEntity.tableName)
    .join(portfolioEntity.tableName,null,squel.expr()
        .and(squelUtils.joinEql(portfolioEntity.columns.id,teamPortfolioEntity.columns.portfolioId))
    )
    .join(teamEntity.tableName,null,squel.expr()
        .and(squelUtils.joinEql(teamEntity.columns.id,teamPortfolioEntity.columns.teamId))
        .and(squelUtils.joinEql(teamEntity.columns.status,1))
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,teamEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,teamEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.in(teamEntity.columns.id,data.id))
            .and(squelUtils.eql(teamPortfolioEntity.columns.isPrimary,1))
            .and(squelUtils.eql(teamPortfolioEntity.columns.isDeleted,0))
            .and(squelUtils.eql(portfolioEntity.columns.isDeleted,0))
            .and(squelUtils.eql(teamEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Get primary portfolio for team query"+query);
    connection.query(query, function(err, resultSet){
        if(err){
            return cb(err);
        }
        return cb(null, resultSet);
    });
}

TeamDao.prototype.getTeamsWithCompleteModelAccess = function(data,cb){
    var connection = baseDao.getConnection(data);

    var query = squel.select()
    .field(teamEntity.columns.id,'id')
    .field(teamEntity.columns.name,'name')
    .from(teamEntity.tableName)
    .where(
        squelUtils.eql(teamEntity.columns.modelAccess,0)
    ).where(
        squelUtils.eql(teamEntity.columns.isDeleted,0)
    );
    query = query.toString();

    logger.debug("Get teams with complete access query"+query);
    connection.query(query, function(err, resultSet){
        if(err){
            return cb(err);
        }
        return cb(null, resultSet);
    });
}
module.exports = TeamDao;