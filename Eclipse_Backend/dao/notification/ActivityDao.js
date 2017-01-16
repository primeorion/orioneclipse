"use strict";

var moduleName = __filename;
var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var baseDao = require('dao/BaseDao');
var enums = require('config/constants/ApplicationEnum.js');
var logger = require('helper/Logger.js')(moduleName);

var activity = require("entity/notification/Activity.js");
var userActivity = require("entity/notification/UserActivity.js");
var roleType = require("entity/role/RoleType.js");
var userEntity = require("entity/user/User.js");
var roleEntity = require("entity/role/Role.js");

var utilService = new (require('service/util/UtilService'))();
var utilDao = require('dao/util/UtilDao.js');

var ActivityDao = function () { }

ActivityDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var roleTypeId = data.user.roleTypeId;

     var query = squel.select()
    .field(activity.columns.id,"id")
    .field(activity.columns.name,"name")
    .field(activity.columns.description,"description")
    .field(activity.columns.createdDate,"createdOn")
    .field(activity.columns.editedDate,"editedOn")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .field(activity.columns.isCompleted,"isCompleted")
    .from(userActivity.tableName)
    .join(userEntity.tableName, null,
       squelUtils.joinEql(userActivity.columns.userId,userEntity.columns.id)
    )
    .join(activity.tableName, null,
       squelUtils.joinEql(userActivity.columns.activityId,activity.columns.id)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,activity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,activity.columns.editedBy)
    )
    .where(
        squel.expr()
        .and(squelUtils.eql(userActivity.columns.isDeleted,0))
        .and(squelUtils.eql(userActivity.columns.userId,data.user.userId))
    );
    if(data.id){
        query.where(
                squel.expr().and(squelUtils.eql(activity.columns.id,data.id))
                .and(squelUtils.eql(activity.columns.createdBy,data.user.userId))
            )
    }
    query.order(activity.columns.createdDate, false);
    query = query.toString();

    logger.debug("Get activity list Query: " + query);
    connection.query(query, function (err, data) {
	    if (err) {
	        return cb(err);
	    }
	    return cb(null, data);
	});
}
ActivityDao.prototype.getActivityById = function(data, cb){
    var connection = baseDao.getConnection(data);
    var query = squel.select()
    .from(activity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(activity.columns.isDeleted,0))
        .and(squelUtils.eql(activity.columns.id,data.id))
    );
    query = query.toString();

    logger.debug("Get activity by id Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}
ActivityDao.prototype.getDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var roleTypeId = data.user.roleTypeId;

     var query = squel.select()
    .field(activity.columns.id,"id")
    .field(activity.columns.name,"name")
    .field(activity.columns.description,"description")
    .field(activity.columns.createdDate,"createdOn")
    .field(activity.columns.editedDate,"editedOn")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .field(activity.columns.isCompleted,"isCompleted")
    .from(userActivity.tableName)
    .join(userEntity.tableName, null,
       squelUtils.joinEql(userActivity.columns.userId,userEntity.columns.id)
    )
    .join(activity.tableName, null,
       squelUtils.joinEql(userActivity.columns.activityId,activity.columns.id)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,activity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,activity.columns.editedBy)
    )
    .where(
        squel.expr()
        .and(squelUtils.eql(userActivity.columns.isDeleted,0))
        .and(squelUtils.eql(activity.columns.isDeleted,0))
        .and(squelUtils.eql(activity.columns.id,data.id))
    );
    query = query.toString();

    logger.debug("Get activity detail Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

ActivityDao.prototype.createActivity = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Activity object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[activity.columns.name] = data.name;
    queryData[activity.columns.description] = data.description;
    queryData[activity.columns.isCompleted] = data.isCompleted||0;
    queryData[activity.columns.isDeleted] = 0;
    queryData[activity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[activity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[activity.columns.createdDate] = currentDate;
    queryData[activity.columns.editedDate] = currentDate;

    var query = ' INSERT INTO '+activity.tableName+' SET ? ';
    connection.query(query, [queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
}

ActivityDao.prototype.updateActivity = function(data, cb){
    var connection = baseDao.getConnection(data);
    logger.debug("Activity update object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    if(data.name){
        queryData[activity.columns.name] = data.name;
    }
    if(data.description){
        queryData[activity.columns.description] = data.description;
    }
    if(data.isCompleted){
        queryData[activity.columns.isCompleted] = data.isCompleted;
    }
    
    queryData[activity.columns.isDeleted] = 0;
    queryData[activity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[activity.columns.editedDate] = currentDate;

    var query = ' UPDATE '+activity.tableName+' SET ? WHERE '+activity.columns.id+" = "+data.id;
    connection.query(query, [queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
}

ActivityDao.prototype.assignUserToActivity = function (data, cb){
    var connection = baseDao.getConnection(data);
    var self = this;
    logger.debug("Assign user to activity object",JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);
    var query = [];
    query.push(' INSERT INTO '+userActivity.tableName+' ');
    query.push(' ('+userActivity.columns.activityId+','+userActivity.columns.userId+', ');
    query.push(' '+userActivity.columns.isDeleted+', '+userActivity.columns.createdBy+', ');
    query.push(' '+userActivity.columns.createdDate+','+userActivity.columns.editedDate+', ');
    query.push(' '+userActivity.columns.editedBy+') VALUES ? ON DUPLICATE KEY UPDATE ');
    query.push(' '+userActivity.columns.isDeleted+'=0 ');
    query.push(' ,'+userActivity.columns.editedBy+'= '+utilService.getAuditUserId(data.user));
    query.push(' ,'+userActivity.columns.editedDate+'= "'+currentDate+'" ');
    query = query.join('');

    var users = [];
    if(data.userIds && data.userIds.length> 0)
    {
        users = data.userIds;
    }else{
        users.push(data.user.userId);
        data.userIds.push(data.user.userId);
    }
    var activityUsers = [];
    users.forEach(function (userId) {
        var activity = [];
        activity.push(data.id);
        activity.push(userId);
        activity.push(data.isDeleted ? data.isDeleted : 0);
        activity.push(utilService.getAuditUserId(data.user));
        activity.push(currentDate);
        activity.push(currentDate);
        activity.push(utilService.getAuditUserId(data.user));
        activityUsers.push(activity);
    });

    logger.debug("Get user assign to activity Query: " + query);
    connection.query(query, [activityUsers], function (err, activityResult) {
        if (err) {
            return cb(err);
        }
        self.removeOtherUserFromActivity(data,function(err,result){
           if (err) {
                return cb(err);
            } 
            return cb(null, activityResult);
        });
    });

}
ActivityDao.prototype.removeOtherUserFromActivity = function(data, cb){
    var connection = baseDao.getConnection(data);
    logger.debug("Remove other user from activity object",JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);
    var query = [];
    query.push('Update '+userActivity.tableName+' set isDeleted= 1 ');
    query.push(' where activityId = ? ');
    if(data.userIds){
        query.push(' and userId not in (?) ');
    }
    query = query.join('');

    logger.debug("remove user assign to activity Query: " + query);
    connection.query(query, [data.id, data.userIds], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });

}
ActivityDao.prototype.getAssignedUserToActivity = function(data, cb){
    var connection = baseDao.getConnection(data);
    var roleTypeId = data.user.roleTypeId;

     var query = squel.select()
    .field(userEntity.columns.id,"userId")
    .field("CONCAT_WS(' ',"+userEntity.columns.firstName+","+userEntity.columns.lastName+")","userName")
    .field(roleEntity.columns.name,"role")
    .field(userEntity.columns.status,"status")
    .from(userEntity.tableName)
    .join(roleEntity.tableName,null,
        squelUtils.joinEql(roleEntity.columns.id,userEntity.columns.roleId)
    )
    .join(userActivity.tableName,null,
        squelUtils.joinEql(userEntity.columns.id,userActivity.columns.userId)
    )
    .where(
        squel.expr()
        .and(squelUtils.eql(userEntity.columns.isDeleted,0))
        .and(squelUtils.eql(userActivity.columns.isDeleted,0))
        .and(squelUtils.eql(userActivity.columns.activityId,data.id))
    );
    query = query.toString();

    logger.debug("Get activity users list Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });

}
module.exports = ActivityDao;