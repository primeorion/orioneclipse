"use strict";

var moduleName = __filename;
var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var enums = require('config/constants/ApplicationEnum.js');

var advisorEntity = require("entity/advisor/Advisor.js");
var userEntity = require("entity/user/User.js");
var teamAdvisorEntity = require("entity/team/TeamAdvisor.js");

var AdvisorDao = function () { }

AdvisorDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var teamIds = data.user.teamIds;
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is "+roleTypeId);

    var query = squel.select()
    .field(advisorEntity.columns.id,"id")
    .field(advisorEntity.columns.externalId,"externalId")
    .field(advisorEntity.columns.name,"name")
    .field(advisorEntity.columns.isDeleted,"isDeleted")
    .field(advisorEntity.columns.createdDate,"createdOn")
    .field(advisorEntity.columns.editedDate,"editedOn")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(advisorEntity.tableName)
    if(roleTypeId !== enums.roleType.FIRMADMIN){
        query.join(teamAdvisorEntity.tableName,null,squel.expr()
            .and(squelUtils.joinEql(advisorEntity.columns.id,teamAdvisorEntity.columns.advisorId))
            .and(squelUtils.in(teamAdvisorEntity.columns.teamId,teamIds))
            .and(squelUtils.joinEql(teamAdvisorEntity.columns.isDeleted,0))
        )        
    }
    query.left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,advisorEntity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,advisorEntity.columns.editedBy)
    )
    .where(
        squel.expr().and(squelUtils.eql(1,1))
        .and(squelUtils.eql(advisorEntity.columns.isDeleted,0))
    );
    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.where(
                squel.expr().and(
                    squel.expr()
                    .or(squelUtils.eql(advisorEntity.columns.id,data.search))
                    .or(squelUtils.like(advisorEntity.columns.name,data.search))
                )
            )
        } else {
            query.where(
                squel.expr().and(
                    squelUtils.like(advisorEntity.columns.name,data.search)
                )
            )
        }
         query.order(advisorEntity.columns.name);
    }
   
    query = query.toString();

	logger.debug("Get advisor list Query: " + query);
	connection.query(query, function (err, data) {
	    if (err) {
	        logger.error("Error: " + err);
	        return cb(err);
	    }

    return cb(null, data);
});
};

AdvisorDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = squel.select()
    .from(advisorEntity.tableName)
    .where(
        squel.expr().and(squelUtils.eql(advisorEntity.columns.id,data.id))
        .and(squelUtils.eql(advisorEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Advisor get Query"+query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

module.exports = AdvisorDao;