"use strict";

var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();

var userEntity = require("entity/user/User.js");
var ViewTypeEntity = require('entity/settings/ViewTypes.js');
var viewEntity = require('entity/settings/View.js');
var defaultViewEntity = require('entity/settings/DefaultView.js');

var ViewDao = function () { }

//Get list of all View Types
ViewDao.prototype.getViewTypes = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = squel.select()
        .from(ViewTypeEntity.tableName)
        .where(
        squel.expr().and(squelUtils.eql(1, 1))
        );
    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(ViewTypeEntity.columns.id, data.search))
                        .or(squelUtils.like(ViewTypeEntity.columns.viewType, data.search))
                )
            )
        } else {
            query.where(
                squel.expr().and(
                    squelUtils.like(ViewTypeEntity.columns.viewType, data.search)
                )
            )
        }
    }

    query = query.toString();
    logger.debug("Get View Types List Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Get list of Views
ViewDao.prototype.getViewsList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var name = data.name ? '' + data.name + '' : null;
    var search = data.search ? data.search : null;

    // var query = 'SELECT ugv.id, ugv.viewName, ugv.viewTypeId, ugvt.typeName, ';
    // query = query + ' (CASE WHEN (ugv.id = ugdv.viewId) THEN 1 ELSE 0 END ) AS isDefault, ';
    // query = query + ' ugv.isPublic, usCreated.userLoginId as createdBy, ugv.createdDate, usEdited.userLoginId as editedBy, ';
    // query = query + ' ugv.editedDate FROM userGridView AS ugv ';
    // query = query + ' LEFT OUTER JOIN userGridDefaultView AS ugdv ON ugv.id = ugdv.viewId AND ugdv.userId = ' + userId + ' AND ugdv.isDeleted = 0 ';
    // query = query + ' LEFT JOIN userGridViewType AS ugvt ON ugv.viewTypeId = ugvt.id  ';
    // query = query + ' LEFT OUTER JOIN user as usCreated on usCreated.id = ugv.createdBy ';
    // query = query + ' LEFT OUTER JOIN user as usEdited on usEdited.id = ugv.editedBy ';
    // query = query + ' WHERE ugv.isDeleted = 0 AND (ugv.createdBy = ' + userId + ' OR ugv.isPublic = 1) ';

    // if (name) {
    //     name = name.replace(/\"/g, "'");
    //     query = query + ' AND ugv.viewName = "' + name + '" ';
    // }

    // if (data.search) {
    //     search = search.replace(/\"/g, "'");
    //     query = query + ' AND '
    //     if (data.search.match(/^[0-9]+$/g)) {
    //         query = query + ' (ugv.id = "' + data.search + '" OR ';
    //     }
    //     query = query + ' ugv.viewName LIKE "%' + search + '%" ';
    //     if (data.search.match(/^[0-9]+$/g)) {
    //         query = query + ' ) ';
    //     }
    // }

    // if (data.type && data.type.match(/^[0-9]+$/g)) {
    //     query = query + ' AND '
    //     query = query + ' ugv.viewTypeId = "' + data.type + '"';
    // } else if (data.type && !data.type.match(/^[0-9]+$/g)) {
    //     return cb(null, []);
    // }
    // query = query + ' ORDER BY ugv.id ';

    var queryBuilder = squel.select()
        .field(viewEntity.columns.id, 'id')
        .field(viewEntity.columns.viewName, 'viewName')
        .field(viewEntity.columns.viewTypeId, 'viewTypeId')
        .field(ViewTypeEntity.columns.viewType, 'typeName')

        .field('(CASE WHEN (' + viewEntity.columns.id + ' = ' + defaultViewEntity.columns.viewId + ') THEN 1 ELSE 0 END )', 'isDefault')

        .field(viewEntity.columns.isPublic, 'isPublic')
        .field(viewEntity.usCreated.userLoginId, 'createdBy')
        .field(viewEntity.columns.createdDate, 'createdDate')
        .field(viewEntity.usEdited.userLoginId, 'editedBy')
        .field(viewEntity.columns.editedDate, 'editedDate')
        .from(viewEntity.tableName)
        .left_join(defaultViewEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(defaultViewEntity.columns.viewId, viewEntity.columns.id))
            .and(squelUtils.joinEql(defaultViewEntity.columns.userId, userId))
            .and(squelUtils.joinEql(defaultViewEntity.columns.isDeleted, 0))
        )
        .left_join(ViewTypeEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(ViewTypeEntity.columns.id, viewEntity.columns.viewTypeId))
        )
        .left_join(userEntity.tableName, userEntity.usCreated.alias,
        squelUtils.joinEql(userEntity.usCreated.id, viewEntity.columns.createdBy)
        )
        .left_join(userEntity.tableName, userEntity.usEdited.alias,
        squelUtils.joinEql(userEntity.usEdited.id, viewEntity.columns.editedBy)
        )
        .where(
        squel.expr().and(squelUtils.eql(viewEntity.columns.isDeleted, 0))
            .and(squel.expr().and(squelUtils.eql(viewEntity.columns.createdBy, userId))
                .or(squelUtils.eql(viewEntity.columns.isPublic, 1))
            )
        );

    if (name) {
        // name = name.replace(/\"/g, "'");
        queryBuilder.where(
            squel.expr().and(squelUtils.eql(viewEntity.columns.viewName, name))
        )
    }

    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            queryBuilder.where(
                squel.expr().and(
                    squel.expr()
                        .or(squelUtils.eql(viewEntity.columns.id, data.search))
                        .or(squelUtils.like(viewEntity.columns.viewName, data.search))
                )
            )
        } else {
            queryBuilder.where(
                squel.expr().and(
                    squelUtils.like(viewEntity.columns.viewName, data.search)
                )
            )
        }
        queryBuilder.order(viewEntity.columns.viewName)
    } else {
        queryBuilder.order(viewEntity.columns.id)
    }

    if (data.type && data.type.match(/^[0-9]+$/g)) {
        queryBuilder.where(
            squel.expr().and(
                squelUtils.eql(viewEntity.columns.viewTypeId, data.type)
            )
        )
        queryBuilder.order(viewEntity.columns.viewName)

    } else if (data.type && !data.type.match(/^[0-9]+$/g)) {
        return cb(null, []);
    }

    queryBuilder = queryBuilder.toString();

    logger.debug("Get View list query: " + queryBuilder);
    connection.query(queryBuilder, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Get details of View
ViewDao.prototype.getViewDetails = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var viewId = 0;
    if (data.id) {
        viewId = data.id;
    }
    // var query = 'SELECT ugv.id, ugv.viewName, ugv.viewTypeId, ugvt.typeName, ';
    // query = query + ' (CASE WHEN (ugv.id = ugdv.viewId) THEN 1 ELSE 0 END ) AS isDefault, ';
    // query = query + ' ugv.isPublic, ugv.filter, ugv.gridColumnDefs, usCreated.userLoginId as createdBy, ugv.createdDate, ';
    // query = query + ' usEdited.userLoginId as editedBy, ugv.editedDate FROM userGridView AS ugv ';
    // query = query + ' LEFT OUTER JOIN userGridDefaultView AS ugdv ON ugv.id = ugdv.viewId AND ugdv.userId = ' + userId + ' AND ugdv.isDeleted = 0 ';
    // query = query + ' LEFT JOIN userGridViewType AS ugvt ON ugv.viewTypeId = ugvt.id ';
    // query = query + ' left outer join user as usCreated on usCreated.id = ugv.createdBy ';
    // query = query + ' left outer join user as usEdited on usEdited.id = ugv.editedBy ';
    // query = query + ' WHERE ugv.isDeleted = 0 AND (ugv.createdBy = ' + userId + ' OR ugv.isPublic = 1) AND ugv.id = "' + viewId + '"';

    var query = squel.select()
        .field(viewEntity.columns.id, 'id')
        .field(viewEntity.columns.viewName, 'viewName')
        .field(viewEntity.columns.viewTypeId, 'viewTypeId')
        .field(ViewTypeEntity.columns.viewType, 'typeName')

        .field('(CASE WHEN (' + viewEntity.columns.id + ' = ' + defaultViewEntity.columns.viewId + ') THEN 1 ELSE 0 END )', 'isDefault')

        .field(viewEntity.columns.isPublic, 'isPublic')
        .field(viewEntity.columns.filter, 'filter')
        .field(viewEntity.columns.gridColumnDefs, 'gridColumnDefs')
        .field(viewEntity.usCreated.userLoginId, 'createdBy')
        .field(viewEntity.columns.createdDate, 'createdDate')
        .field(viewEntity.usEdited.userLoginId, 'editedBy')
        .field(viewEntity.columns.editedDate, 'editedDate')
        .from(viewEntity.tableName)
        .left_join(defaultViewEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(defaultViewEntity.columns.viewId, viewEntity.columns.id))
            .and(squelUtils.joinEql(defaultViewEntity.columns.userId, userId))
            .and(squelUtils.joinEql(defaultViewEntity.columns.isDeleted, 0))
        )
        .left_join(ViewTypeEntity.tableName, null, squel.expr()
            .and(squelUtils.joinEql(ViewTypeEntity.columns.id, viewEntity.columns.viewTypeId))
        )
        .left_join(userEntity.tableName, userEntity.usCreated.alias,
        squelUtils.joinEql(userEntity.usCreated.id, viewEntity.columns.createdBy)
        )
        .left_join(userEntity.tableName, userEntity.usEdited.alias,
        squelUtils.joinEql(userEntity.usEdited.id, viewEntity.columns.editedBy)
        )
        .where(
        squel.expr().and(squelUtils.eql(viewEntity.columns.id, viewId))
            .and(squelUtils.eql(viewEntity.columns.isDeleted, 0))
            .and(squel.expr().and(squelUtils.eql(viewEntity.columns.createdBy, userId))
                .or(squelUtils.eql(viewEntity.columns.isPublic, 1))
            )
        );

    query = query.toString();

    logger.debug("Get View details query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result[0]);
    });
};

ViewDao.prototype.getViewIdByName = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var viewName = data.viewName ? "'" + data.viewName + "'" : "";
    var viewId = null;
    var query = "SELECT id from userGridView where isDeleted = 0 AND (isPublic = 1 OR createdBy = " + userId + ") ";
    query = query + " AND viewName = " + viewName + " AND viewTypeId = " + data.viewTypeId;

    logger.debug("Get View Id by View name query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result[0]) {
            viewId = result[0]["id"];
        }
        return cb(null, viewId);
    });
};

//Add new View
ViewDao.prototype.addView = function (data, cb) {
    var self = this;
    self.createView(data, function (err, myResult) {
        if (err) {
            return cb(err);
        }
        data.id = myResult.insertId;
        if (data.isDefault) {
            self.setDefaultView(data, function (err, output) {
                if (err) {
                    return cb(err);
                }
                return cb(null, myResult);
            });
        } else {
            return cb(null, myResult);
        }
    });
};

//Get View Count [Internally Called]
ViewDao.prototype.getViewCountById = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var viewId = 0;
    var count = null;
    var query = 'SELECT COUNT(*) FROM ' + viewEntity.tableName + ' WHERE ' + viewEntity.columns.id + ' = ? AND ' + viewEntity.columns.isDeleted + ' = 0 ';
    query = query + 'AND (' + viewEntity.columns.createdBy + ' = ' + userId + ' OR ' + viewEntity.columns.isPublic + ' = 1)';
    if (data.id) {
        viewId = data.id;
    }
    logger.debug("Get View Count by id query: " + query);
    connection.query(query, viewId, function (err, result) {
        if (err) {
            logger.error("Error in query execution for view count " + err);
            return cb(err);
        }
        if (result) {
            count = result[0]['COUNT(*)'];
        }
        return cb(null, count);
    });
};

//Update View
ViewDao.prototype.updateView = function (data, cb) {
    var self = this;
    // if (data.isDefault) {
    //     self.resetDefaultViews(data, function (err, output) {
    //         if (err) {
    //             return cb(err);
    //         }
    //     });
    // }
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var queryData = {
        gridColumnDefs: data.gridColumnDefs,
        editedBy: userId,
        editedDate: currentDate
    };
    if (data.viewName !== null) {
        queryData["viewName"] = data.viewName;
    }
    if (data.viewTypeId !== null) {
        queryData["viewTypeId"] = data.viewTypeId;
    }
    if (data.filter || data.filter == "") {
        queryData["filter"] = data.filter;
    }
    if (data.isPublic != 2) {
        queryData["isPublic"] = data.isPublic;
    }
    var query = 'UPDATE ' + viewEntity.tableName + ' SET ? WHERE ' + viewEntity.columns.id + ' = ? AND ' + viewEntity.columns.isDeleted + ' = 0 ';
    query = query + ' AND (' + viewEntity.columns.createdBy + ' = ' + userId + ' OR ' + viewEntity.columns.isPublic + ' = 1)';

    logger.debug("Update View query: " + query);
    connection.query(query, [queryData, data.id], function (err, updated) {
        if (err) {
            return cb(err);
        }
        if (data.isDefault != 2) {
            if (data.isDefault) {
                self.setDefaultView(data, function (err, result) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, updated);
                });
            } else {
                self.deleteDefaultView(data, function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, updated);
                });
            }
        } else {
            return cb(null, updated);
        }
    });
};

//Resets isDefault Value of Views for current user [Internally Called]
/*    ViewDao.prototype.resetDefaultViews = function (data, cb) {
        var connection = baseDao.getConnection(data);
        var userId = utilService.getAuditUserId(data.user);
        var query = 'UPDATE userGridView SET isDefault = 0 WHERE isDeleted = 0 AND isDefault = 1 AND isPublic = 0 AND createdBy = ?';

        logger.debug("Query: " + query);
        connection.query(query, userId, function (err, data) {
            if (err) {
                logger.error("Error in query execution for resetting default values (resetDefaultViews()) " + err);
                return cb(err, null);
            }
            return cb(null, data);
        });
    };
*/

//Validate View Type Id that exists or not [Internally Called]
ViewDao.prototype.validateViewTypeId = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var count = null;
    var viewTypeId = 0;
    var query = 'SELECT COUNT(*) FROM ' + ViewTypeEntity.tableName + ' WHERE ' + ViewTypeEntity.columns.id + ' = ? ';

    if (data.viewTypeId) {
        viewTypeId = data.viewTypeId;
    } else {
        return cb(null, true);
    }
    logger.debug("Get View Type count by id query: " + query);
    connection.query(query, viewTypeId, function (err, result) {
        if (err) {
            logger.error("Error in query execution for View type id validation (validateViewTypeId()) " + err);
            return cb(err);
        }
        if (result) {
            count = result[0]['COUNT(*)'];
            if (count > 0) {
                return cb(null, true);
            }
            return cb(null, false);
        }
        return cb(null, count);
    });
};

//deletes View
ViewDao.prototype.deleteView = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();

    var queryData = {};
    queryData[viewEntity.columns.isDeleted] = 1;
    queryData[viewEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    queryData[viewEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    // var query = 'UPDATE userGridView SET isDeleted = 1, editedBy = ' + userId + ', editedDate = "' + currentDate + '" WHERE id = ? AND createdBy = ? ';
    var query = 'UPDATE ' + viewEntity.tableName + ' SET ? WHERE ' + viewEntity.columns.id + ' = ? AND ' + viewEntity.columns.createdBy + ' = ? ';
    var self = this;
    logger.debug("Query: " + query);
    connection.query(query, [queryData, data.id, userId], function (err, result) {
        if (err) {
            logger.error("Error in deleting View in dao (deleteView()) " + err);
            return cb(err);
        }
        self.deleteDefaultView(data, function (err, deletedDefaultView) {
            if (err) {
                logger.error("Error in deleting default View in dao (deleteDefaultView()) " + err);
                return cb(err);
            }
            if (deletedDefaultView.affectedRows > 0) {
                logger.debug("Default View Deleted Successfully");
            }
        });
        return cb(null, result);
    });
}

//create new View in userGridView table
ViewDao.prototype.createView = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var queryData = {};

    queryData[viewEntity.columns.viewName] = data.viewName;
    queryData[viewEntity.columns.viewTypeId] = data.viewTypeId;
    queryData[viewEntity.columns.isDefault] = 0;
    queryData[viewEntity.columns.isPublic] = data.isPublic;
    queryData[viewEntity.columns.filter] = data.filter;
    queryData[viewEntity.columns.gridColumnDefs] = data.gridColumnDefs;
    queryData[viewEntity.columns.isDeleted] = 0;
    queryData[viewEntity.columns.createdBy] = userId;
    queryData[viewEntity.columns.editedBy] = userId;
    queryData[viewEntity.columns.createdDate] = currentDate;
    queryData[viewEntity.columns.editedDate] = currentDate;

    var query = 'INSERT INTO ' + viewEntity.tableName + ' SET ? ';

    logger.debug("Create View query: " + query);
    connection.query(query, queryData, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//sets a view as default View
ViewDao.prototype.setDefaultView = function (data, cb) {
    var self = this;
    var userId = utilService.getAuditUserId(data.user);
    self.getDefaultView(data, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result) {
            data.viewId = result;
            self.updateDefaultView(data, function (err, updatedDefaultView) {
                if (err) {
                    return cb(err);
                }
                return cb(null, updatedDefaultView);
            });
        } else {
            self.createDefaultView(data, function (err, createdDefaultView) {
                if (err) {
                    return cb(err);
                }
                return cb(null, createdDefaultView);
            });
        }
    });
};

//gets default view id for user
ViewDao.prototype.getDefaultView = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var viewId = data.id ? data.id : 0;
    var userId = utilService.getAuditUserId(data.user);
    var output = null;
    var query = [];
    query.push(' SELECT viewId FROM userGridDefaultView AS ugdv ');
    query.push(' WHERE ugdv.isDeleted = 0 AND ugdv.userId = ' + userId + ' ');
    query.push(' AND ugdv.viewId IN (SELECT ugv.id FROM userGridView AS ugv ');
    query.push(' WHERE ugv.isDeleted = 0 AND (ugv.createdBy = ' + userId + ' OR ugv.isPublic = 1) ');
    query.push(' AND ugv.viewTypeId IN (SELECT viewTypeId FROM userGridView ');
    query.push(' WHERE id = ' + viewId + ' AND createdBy = ' + userId + ' AND isDeleted = 0)) ');
    query = query.join(" ");

    logger.debug('Get default view query: ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        if (result[0]) {
            output = result[0].viewId;
        }
        return cb(null, output);
    });
};

//updates default View in userGridDefaultView table
ViewDao.prototype.updateDefaultView = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();

    var queryData = {};
    queryData[defaultViewEntity.columns.viewId] = data.id;
    queryData[defaultViewEntity.columns.userId] = userId;
    queryData[defaultViewEntity.columns.isDeleted] = 0;
    queryData[defaultViewEntity.columns.editedDate] = currentDate;
    queryData[defaultViewEntity.columns.editedBy] = userId;

    var query = 'UPDATE ' + defaultViewEntity.tableName + ' SET ? WHERE ' + defaultViewEntity.columns.viewId + ' = ? ';

    logger.debug('Update default View entry query: ' + query);
    connection.query(query, [queryData, data.viewId], function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

//creates default View in userGridDefaultView table
ViewDao.prototype.createDefaultView = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);

    // var query = 'INSERT INTO userGridDefaultView (`viewId`,`userId`,`isDeleted`,`createdDate`,`createdBy`,`editedDate`,`editedBy`)';
    var query = 'INSERT INTO ' + defaultViewEntity.tableName + ' (' + defaultViewEntity.columns.viewId + ', ' + defaultViewEntity.columns.userId + ', ';
    query = query + ' ' + defaultViewEntity.columns.isDeleted + ', ' + defaultViewEntity.columns.createdDate + ', ' + defaultViewEntity.columns.createdBy + ', ';
    query = query + ' ' + defaultViewEntity.columns.editedDate + ', ' + defaultViewEntity.columns.editedBy + ') ';
    query = query + ' VALUES (' + data.id + ', ' + userId + ', 0, "' + currentDate + '", ' + userId + ', "' + currentDate + '", ' + userId + ' ) ';

    logger.debug('Create Default View query: ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

//deletes default view entry from userGridDefaultView table
ViewDao.prototype.deleteDefaultView = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();

    var queryData = {};
    queryData[defaultViewEntity.columns.isDeleted] = 1;
    queryData[defaultViewEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    queryData[defaultViewEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    // var query = 'UPDATE userGridDefaultView SET isDeleted = 1 , editedBy = ' + userId + ', editedDate = "' + currentDate + '" WHERE viewId = ? AND userId = ? ';
    var query = 'UPDATE ' + defaultViewEntity.tableName + ' SET ? WHERE ' + defaultViewEntity.columns.viewId + ' = ? AND ' + defaultViewEntity.columns.userId + ' = ? ';

    logger.debug("Delete default View query: " + query);
    connection.query(query, [queryData, data.id, userId], function (err, result) {
        if (err) {
            logger.error("Error in query execution for View count " + err);
            return cb(err);
        }
        return cb(null, result);
    });
}

module.exports = ViewDao;