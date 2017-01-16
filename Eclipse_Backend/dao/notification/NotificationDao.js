"use strict";

var moduleName = __filename;
var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var baseDao = require('dao/BaseDao');
var enums = require('config/constants/ApplicationEnum.js');
var logger = require('helper/Logger.js')(moduleName);

var notification = require("entity/notification/Notification.js");
var notificationCategory = require("entity/notification/NotificationCategory.js");
var notificationCategoryType = require("entity/notification/NotificationCategoryType.js");
var notificationSubscription = require("entity/notification/NotificationSubscription.js");
var readUserNotification = require("entity/notification/ReadUserNotification.js");
var roleType = require("entity/role/RoleType.js");
var userEntity = require("entity/user/User.js");

var utilService = new (require('service/util/UtilService'))();
var utilDao = require('dao/util/UtilDao.js');

var NotificationDao = function () { }

NotificationDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var roleTypeId = data.user.roleTypeId;

     var query = squel.select()
    .field(notification.columns.id,"id")
    .field(notification.columns.subject,"subject")
    .field(notification.columns.body,"body")
    .field(notification.columns.createdDate,"createdOn")
    .field(notification.columns.editedDate,"editedOn")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .field(notificationCategoryType.columns.id,"notificationCategoryTypeId")
    .field(notificationCategoryType.columns.name,"notificationCategoryTypeName")
    .field(notificationCategoryType.columns.code,"notificationCategoryTypeCode")
    .field(notificationCategory.columns.id,"notificationCategoryId")
    .field(notificationCategory.columns.name,"notificationCategoryName")
    .field(" COALESCE("+readUserNotification.columns.readStatus+",0)","readStatus")
    .field(" COALESCE("+readUserNotification.columns.isDeleted+",0)","isDeleted")
    .from(notification.tableName)
    .join(notificationCategoryType.tableName, null,
       squelUtils.joinEql(notificationCategoryType.columns.id,notification.columns.notificationCategoryTypeId)
    )
    .join(notificationCategory.tableName, null,
       squelUtils.joinEql(notificationCategoryType.columns.notificationCategoryId,notificationCategory.columns.id)
    )
    .join(notificationSubscription.tableName, null,
       squelUtils.joinEql(notificationSubscription.columns.notificationCategoryTypeId,notificationCategoryType.columns.id)
    )
    .left_join(readUserNotification.tableName, null,
       squelUtils.joinEql(readUserNotification.columns.notificationId,notification.columns.id)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,notification.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,notification.columns.editedBy)
    )
    .where(
        squel.expr()
        .and(squelUtils.eql(notification.columns.isDeleted,0))
        .and(squel.expr()
        	.or(readUserNotification.columns.readStatus+" IS NULL ")
        	.or(squelUtils.eql(readUserNotification.columns.isDeleted,0))
        )
        .and(squelUtils.eql(notificationSubscription.columns.userId,data.user.userId))
        .and(squelUtils.eql(notificationSubscription.columns.isDeleted,0))
    );
    if(data.id){
        query.where(
                squel.expr().and(squelUtils.eql(notification.columns.id,data.id))
            )
    }
    query.order(notification.columns.createdDate,'DESC');
    query = query.toString();

    logger.debug("Get notification list Query: " + query);
    connection.query(query, function (err, data) {
	    if (err) {
	        return cb(err);
	    }
	    return cb(null, data);
	});
}

NotificationDao.prototype.getNotificationCategoryTypeList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var roleTypeId = data.user.roleTypeId;

     var query = squel.select()
    .field(notificationCategoryType.columns.id,"id")
    .field(notificationCategoryType.columns.name,"name")
    .field(notificationCategoryType.columns.code,"code")
    .field(notificationCategoryType.columns.description,"description")
    .field(notificationCategoryType.columns.subject,"subject")
    .field(notificationCategory.columns.id,"notificationCategoryId")
    .field(notificationCategory.columns.name,"notificationCategoryName")
    .from(notificationCategoryType.tableName)
    .join(notificationCategory.tableName, null,
       squelUtils.joinEql(notificationCategoryType.columns.notificationCategoryId,notificationCategory.columns.id)
    );
    query = query.toString();

    logger.debug("Get notification category type list Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
 }

 NotificationDao.prototype.createNotification = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Notification object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[notification.columns.subject] = data.subject;
    queryData[notification.columns.body] = data.body;
    queryData[notification.columns.notificationCategoryTypeId] = data.notificationCategoryTypeId;
    queryData[notification.columns.isDeleted] = 0;
    queryData[notification.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[notification.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[notification.columns.createdDate] = currentDate;
    queryData[notification.columns.editedDate] = currentDate;

    var query = ' INSERT INTO '+notification.tableName+' SET ? ON DUPLICATE KEY UPDATE ? ';
    var finalQuery = connection.query(query, [queryData,queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
    logger.debug("Final Query i got is"+finalQuery.sql);
}

NotificationDao.prototype.deleteUserNotification = function (data, cb){
    var connection = baseDao.getConnection(data);

    logger.debug("Delete Notification object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[readUserNotification.columns.isDeleted] = 1;
    queryData[readUserNotification.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[readUserNotification.columns.editedDate] = currentDate;

    var query = [];
    query.push(' UPDATE '+readUserNotification.tableName);
    query.push(' SET ? WHERE '+readUserNotification.columns.notificationId);
    query.push(' = ? ');
    query = query.join('');

    connection.query(query, [queryData,data.id], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

NotificationDao.prototype.readNotification = function (data, cb) {
    var connection = baseDao.getConnection(data);

    logger.debug("Read Notification object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);

    var query = [];
    query.push(' INSERT INTO '+readUserNotification.tableName);
    query.push(' ('+readUserNotification.columns.userId+','+readUserNotification.columns.notificationId+', ');
    query.push(' '+readUserNotification.columns.readStatus+', ');
    query.push(' '+readUserNotification.columns.isDeleted+','+readUserNotification.columns.createdBy+', ');
    query.push(' '+readUserNotification.columns.createdDate+', ');
    query.push(' '+readUserNotification.columns.editedDate+', '+readUserNotification.columns.editedBy+') VALUES ? ');
    query.push(' ON DUPLICATE KEY UPDATE ? ' );
    query = query.join(" ");

    var readNotifications = [];
    var notificationIds = data.ids;
    notificationIds.forEach(function (notificationId) {
        var readNotification = [];
        readNotification.push(data.user.userId);
        readNotification.push(notificationId);
        readNotification.push(data.readStatus);
        readNotification.push(0);
        readNotification.push(utilService.getAuditUserId(data.user));
        readNotification.push(currentDate);
        readNotification.push(currentDate);
        readNotification.push(utilService.getAuditUserId(data.user));
        readNotifications.push(readNotification);
    });
    var updateNotification = {};
    updateNotification[readUserNotification.columns.readStatus] = data.readStatus;
    updateNotification[readUserNotification.columns.editedDate] = currentDate;
    updateNotification[readUserNotification.columns.editedBy] = utilService.getAuditUserId(data.user);

    logger.debug("Read notification Query",query);
    connection.query(query, [readNotifications, updateNotification], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
}

NotificationDao.prototype.getLoggedInUserNotificationSubscriptions = function (data, cb){
    var connection = baseDao.getConnection(data);

    logger.debug("Get Logged in user notification subscription");

    var query = squel.select()
    .field(notificationCategoryType.columns.id,"id")
    .field(notificationCategoryType.columns.name,"name")
    .field(notificationCategoryType.columns.code,"code")
    .field(notificationCategoryType.columns.description,"description")
    .field(notificationCategoryType.columns.subject,"subject")
    .field(notificationCategoryType.columns.deliveryMode,"deliveryMode")
    .field(notificationCategory.columns.id,"notificationCategoryId")
    .field(notificationCategory.columns.name,"notificationCategoryName")
    .field(notificationSubscription.columns.enabled,"enabled")
    .field(notificationSubscription.columns.sendEmail,"sendEmail")
    .field(notificationSubscription.columns.isDeleted,"isDeleted")
    .field(notificationSubscription.columns.createdDate,"createdOn")
    .field(notificationSubscription.columns.editedDate,"editedOn")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(notificationSubscription.tableName)
    .right_join(notificationCategoryType.tableName,null,
        squelUtils.joinEql(notificationCategoryType.columns.id,notificationSubscription.columns.notificationCategoryTypeId)
    )
    .join(notificationCategory.tableName, null,
        squelUtils.joinEql(notificationCategory.columns.id,notificationCategoryType.columns.notificationCategoryId)
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,notificationSubscription.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,notificationSubscription.columns.editedBy)
    )
    .where(
        squel.expr()
        .and(squelUtils.eql(notificationSubscription.columns.userId,data.user.userId))
        .or(notificationSubscription.columns.userId+" IS NULL")
    );
    query = query.toString();

    logger.debug("Get notification subscription list Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
}
NotificationDao.prototype.addUserEmailForNotification = function(data, cb){
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime(null);

    logger.debug("Add user email for notification dao call (addUserEmailForNotification())");
    var updateData = {};
    updateData[userEntity.columns.notificationEmail] = data.email;
    updateData[userEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    updateData[userEntity.columns.editedDate] = currentDate;

    var query = [];
    query.push("Update "+userEntity.tableName+" SET ? WHERE ");
    query.push(userEntity.columns.id+"=? ");
    query = query.join("");

    logger.debug("Add user email notification Query: " + query);
    connection.query(query,[updateData, data.user.userId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
}
NotificationDao.prototype.addLoggedInUserNotificationSubscription = function(data, cb){
    var connection = baseDao.getConnection(data);

    logger.debug("Add notification subscription object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);
    var notificationTopics = data.notificationTopics;
    var notificationSubscriptions = [];
    notificationTopics.forEach(function(notificationTopic){
        var notificationSubscriptionData = [];
        notificationSubscriptionData.push(data.user.userId);
        notificationSubscriptionData.push(notificationTopic.id);
        notificationSubscriptionData.push(notificationTopic.isEnable);
        notificationSubscriptionData.push(notificationTopic.isEmail);
        notificationSubscriptionData.push(0);
        notificationSubscriptionData.push(utilService.getAuditUserId(data.user));
        notificationSubscriptionData.push(currentDate);
        notificationSubscriptionData.push(utilService.getAuditUserId(data.user));
        notificationSubscriptionData.push(currentDate);
        notificationSubscriptions.push(notificationSubscriptionData);
    });
    
    var query = [];
    query.push(' INSERT INTO '+notificationSubscription.tableName);
    query.push(' ('+notificationSubscription.columns.userId);
    query.push(' ,'+notificationSubscription.columns.notificationCategoryTypeId);
    query.push(' ,'+notificationSubscription.columns.enabled);
    query.push(' ,'+notificationSubscription.columns.sendEmail);
    query.push(' ,'+notificationSubscription.columns.isDeleted);
    query.push(' ,'+notificationSubscription.columns.createdBy);
    query.push(' ,'+notificationSubscription.columns.createdDate);
    query.push(' ,'+notificationSubscription.columns.editedBy);
    query.push(' ,'+notificationSubscription.columns.editedDate+') ');
    query.push(' VALUES ? ON DUPLICATE KEY ');
    query.push(' UPDATE '+notificationSubscription.columns.enabled);
    query.push(' =VALUES('+notificationSubscription.columns.enabled+'), ');
    query.push(' '+notificationSubscription.columns.sendEmail);
    query.push(' = (CASE WHEN VALUES('+notificationSubscription.columns.sendEmail+') IS NOT NULL ');
    query.push(' THEN VALUES('+notificationSubscription.columns.sendEmail+') ');
    query.push(' ELSE '+notificationSubscription.columns.sendEmail+' END), ');
    query.push(' '+notificationSubscription.columns.isDeleted);
    query.push(' =0, ');
    query.push(' '+notificationSubscription.columns.editedDate);
    query.push(' ="'+currentDate+'", ');
    query.push(' '+notificationSubscription.columns.editedBy);
    query.push(' ='+utilService.getAuditUserId(data.user)+' ');
    query = query.join('');

    logger.debug("Notification subscription Query is"+query);
    connection.query(query, [notificationSubscriptions], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
}

NotificationDao.prototype.deleteLoggedInUserNotificationSubscription = function(data, cb){
    var connection = baseDao.getConnection(data);

    logger.debug("Delete Notification Subscription object", JSON.stringify(data));
    var currentDate = utilDao.getSystemDateTime(null);

    var queryData = {};
    queryData[notificationSubscription.columns.isDeleted] = 1;
    queryData[notificationSubscription.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[notificationSubscription.columns.editedDate] = currentDate;

    var query = [];
    query.push(' UPDATE '+notificationSubscription.tableName+' SET ? ');
    query.push(' WHERE '+notificationSubscription.columns.userId +' = ? ');
    query.push(' AND '+notificationSubscription.columns.notificationCategoryTypeId +' = ? ');
    query = query.join('');


    connection.query(query, [queryData,data.user.userId,data.notificationCategoryTypeId], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });

}

NotificationDao.prototype.getUserEmailsForSubscribedNotificationCategoryType = function(data, cb){
    var connection = baseDao.getConnection(data);

    logger.debug("Get email for notification category type");

    var query = squel.select()
    .field(userEntity.columns.notificationEmail,"notificationEmail")
    .from(notificationSubscription.tableName)
    .join(userEntity.tableName, null,
       squelUtils.joinEql(userEntity.columns.id,notificationSubscription.columns.userId)
    )
    .where(
        squel.expr()
        .and(squelUtils.eql(notificationSubscription.columns.notificationCategoryTypeId,data.id))
        .and(squelUtils.eql(notificationSubscription.columns.isDeleted,0))
        .and(squelUtils.eql(notificationSubscription.columns.sendEmail,1))
        .and(squelUtils.eql(userEntity.columns.id,data.user.userId))
    );
    query = query.toString();

    logger.debug("Get email for notification category type Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });

}
module.exports = NotificationDao;