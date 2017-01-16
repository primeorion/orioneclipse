"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var ViewDao = function () {}

//Get list of all View Types
ViewDao.prototype.getViewTypes = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var query = 'SELECT * FROM userGridViewType  WHERE 1=1 ';

    if (data.search) {
        query = query + ' AND '
        if (data.search.match(/^[0-9]+$/g)) {
            query = query + ' (id = "' + data.search + '" OR ';
        }
        query = query + ' typeName LIKE "%' + data.search + '%" ';
        if (data.search.match(/^[0-9]+$/g)) {
            query = query + ' ) ';
        }
    }
    logger.debug("Query: " + query);
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
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var name = data.name ? '' + data.name + '' : null;
    var search = data.search ? data.search : null;
    var query = 'SELECT ugv.id, ugv.viewName, ugv.viewTypeId, ugvt.typeName, ';
    query = query + ' (CASE WHEN (ugv.id = ugdv.viewid) THEN 1 ELSE 0 END ) AS isDefault, ';
    query = query + ' ugv.isPublic, usCreated.userLoginName as createdBy, ugv.createdDate, usEdited.userLoginName as editedBy, ';
    query = query + ' ugv.editedDate FROM userGridView AS ugv ';
    query = query + ' LEFT OUTER JOIN userGridDefaultView AS ugdv ON ugv.id = ugdv.viewid AND ugdv.userId = ' + userId + ' AND ugdv.isDeleted = 0 ';
    query = query + ' LEFT JOIN userGridViewType AS ugvt ON ugv.viewTypeId = ugvt.id  ';
    query = query + ' LEFT OUTER JOIN user as usCreated on usCreated.id = ugv.createdBy ';
    query = query + ' LEFT OUTER JOIN user as usEdited on usEdited.id = ugv.editedBy ';
    query = query + ' WHERE ugv.isDeleted = 0 AND (ugv.createdBy = ' + userId + ' OR ugv.isPublic = 1) ';

    if (name) {
        name = name.replace(/\"/g, "'");
        query = query + ' AND ugv.viewName = "' + name + '" ';
    }

    if (data.search) {
        search = search.replace(/\"/g, "'");
        query = query + ' AND '
        if (data.search.match(/^[0-9]+$/g)) {
            query = query + ' (ugv.id = "' + data.search + '" OR ';
        }
        query = query + ' ugv.viewName LIKE "%' + search + '%" ';
        if (data.search.match(/^[0-9]+$/g)) {
            query = query + ' ) ';
        }
    }

    if (data.type && data.type.match(/^[0-9]+$/g)) {
        query = query + ' AND '
        query = query + ' ugv.viewTypeId = "' + data.type + '"';
    } else if (data.type && !data.type.match(/^[0-9]+$/g)) {
        return cb(null, []);
    }
    query = query + ' ORDER BY ugv.id ';
    logger.debug("Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Get details of View
ViewDao.prototype.getViewDetails = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var viewId = 0;
    if (data.id) {
        viewId = data.id;
    }
    var query = 'SELECT ugv.id, ugv.viewName, ugv.viewTypeId, ugvt.typeName, ';
    query = query + ' (CASE WHEN (ugv.id = ugdv.viewid) THEN 1 ELSE 0 END ) AS isDefault, ';
    query = query + ' ugv.isPublic, ugv.filter, ugv.gridColumnDefs, usCreated.userLoginName as createdBy, ugv.createdDate, ';
    query = query + ' usEdited.userLoginName as editedBy, ugv.editedDate FROM userGridView AS ugv ';
    query = query + ' LEFT OUTER JOIN userGridDefaultView AS ugdv ON ugv.id = ugdv.viewid AND ugdv.userId = ' + userId + ' AND ugdv.isDeleted = 0 ';
    query = query + ' LEFT JOIN userGridViewType AS ugvt ON ugv.viewTypeId = ugvt.id ';
    query = query + ' left outer join user as usCreated on usCreated.id = ugv.createdBy ';
    query = query + ' left outer join user as usEdited on usEdited.id = ugv.editedBy ';
    query = query + ' WHERE ugv.isDeleted = 0 AND (ugv.createdBy = ' + userId + ' OR ugv.isPublic = 1) AND ugv.id = "' + viewId + '"';

    logger.debug("Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result[0]);
    });
};

ViewDao.prototype.getViewIdByName = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
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
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var viewId = 0;
    var count = null;
    var query = 'SELECT COUNT(*) FROM userGridView WHERE id = ? AND isDeleted = 0 AND (createdBy = ' + userId + ' OR isPublic = 1)';
    if (data.id) {
        viewId = data.id;
    }
    logger.debug("Query: " + query);
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
// ViewDao.prototype.updateView = function (data, cb) {
//     var self = this;
//     // if (data.isDefault) {
//     //     self.resetDefaultViews(data, function (err, output) {
//     //         if (err) {
//     //             return cb(err);
//     //         }
//     //     });
//     // }
//     var connection = baseDao.getCommunityDBConnection(data);
//     var currentDate = utilDao.getSystemDateTime();
//     var userId = utilService.getAuditUserId(data.user);
//     var queryData = {
//         gridColumnDefs: data.gridColumnDefs,
//         editedBy: userId,
//         editedDate: currentDate
//     };
//     // if (data.viewName !== null) {
//     //     queryData["viewName"] = data.viewName;
//     // }
//     // if (data.viewTypeId !== null) {
//     //     queryData["viewTypeId"] = data.viewTypeId;
//     // }
//     if (data.filter !== null) {
//         queryData["filter"] = data.filter;
//     }
//     // if (data.isDefault !== null) {
//     // queryData["isDefault"] = data.isDefault;
//     // }
//     // if (data.isPublic !== null) {
//     // queryData["isPublic"] = data.isPublic;
//     // }
//     var query = 'UPDATE userGridView SET ? WHERE id = ? AND isDeleted = 0 AND (createdBy = ' + userId + ' OR isPublic = 1)';

//     logger.debug("Query: " + query);
//     connection.query(query, [queryData, data.id], function (err, updated) {
//         if (err) {
//             return cb(err);
//         }
//         return cb(null, updated);
//     });
// };

//Resets isDefault Value of Views for current user [Internally Called]
/*    ViewDao.prototype.resetDefaultViews = function (data, cb) {
        var connection = baseDao.getCommunityDBConnection(data);
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
    logger.debug('reached in validate view type' + JSON.stringify(data));
    var connection = baseDao.getCommunityDBConnection(data);
    var count = null;
    var viewTypeId = 0;
    var query = 'SELECT COUNT(*) FROM userGridViewType WHERE id = ? ';

    if (data.viewTypeId) {
        viewTypeId = data.viewTypeId;
    }
    logger.debug("Query: " + query);
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

ViewDao.prototype.deleteView = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();

    var query = 'UPDATE userGridView SET isDeleted = 1, editedBy = ' + userId + ', editedDate = "' + currentDate + '" WHERE id = ? AND createdBy = ? ';
    var self = this;
    logger.debug("Query: " + query);
    connection.query(query, [data.id, userId], function (err, result) {
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

ViewDao.prototype.createView = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var gridData = '"' + data.gridColumnDefs + '"';
    var query = 'INSERT INTO userGridView ( viewName, viewTypeId, isDefault, isPublic, filter, ';
    query = query + ' gridColumnDefs, isDeleted, createdBy, editedBy, createdDate, editedDate) ';
    query = query + ' VALUES ( ';
    query = query + ' "' + data.viewName + '", "' + data.viewTypeId + '",  0, "' + data.isPublic + '", "' + data.filter + '", ';
    query = query + ' ' + gridData + ' , "0", "' + userId + '", "' + userId + '",  ';
    query = query + ' "' + currentDate + '",  "' + currentDate + '")';

    logger.debug("Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

ViewDao.prototype.setDefaultView = function (data, cb) {
    var self = this;
    var userId = utilService.getAuditUserId(data.user);
    self.getDefaultView(data, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result) {
            // console.log("VIEW ID + + + "+util.inspect(result));
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

ViewDao.prototype.getDefaultView = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
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

    // console.log('My Queryy = =  ' + util.inspect(query));
    logger.debug('Query: ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        // console.log("VIEW ID + + + "+util.inspect(result));
        if (result[0]) {
            output = result[0].viewId;
            // console.log("Inside   -= "+ util.inspect(output));
        }
        return cb(null, output);
    });
};

ViewDao.prototype.updateDefaultView = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();
    var queryData = ' viewId = ' + data.id + ', userId = ' + userId + ', isDeleted = 0, editedDate = "' + currentDate + '", editedBy = ' + userId + ' ';

    var query = 'UPDATE userGridDefaultView SET ' + queryData + ' ';
    query = query + ' WHERE viewId = ' + data.viewId + ' ';

    logger.debug('Query: ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

ViewDao.prototype.createDefaultView = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);

    var query = 'INSERT INTO userGridDefaultView (`viewId`,`userId`,`isDeleted`,`createdDate`,`createdBy`,`editedDate`,`editedBy`)';
    query = query + ' VALUES (' + data.id + ', ' + userId + ', 0, "' + currentDate + '", ' + userId + ', "' + currentDate + '", ' + userId + ' ) ';

    logger.debug('Query: ' + query);
    connection.query(query, function (err, result) {
        if (err) {
            return cb(err);
        }
        return cb(null, result);
    });
};

ViewDao.prototype.deleteDefaultView = function (data, cb) {
    var connection = baseDao.getCommunityDBConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();
    
    var query = 'UPDATE userGridDefaultView SET isDeleted = 1 , editedBy = ' + userId + ', editedDate = "' + currentDate + '" WHERE viewId = ? AND userId = ? ';

    logger.debug("Query: " + query);
    connection.query(query, [data.id, userId], function (err, result) {
        if (err) {
            logger.error("Error in query execution for view count " + err);
            return cb(err);
        }
        return cb(null, result);
    });
};


ViewDao.prototype.updateView = function (data, cb) {
    var self = this;
    // if (data.isDefault) {
    //     self.resetDefaultViews(data, function (err, output) {
    //         if (err) {
    //             return cb(err);
    //         }
    //     });
    // }
    var connection = baseDao.getCommunityDBConnection(data);
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
    var query = 'UPDATE userGridView SET ? WHERE id = ? AND isDeleted = 0 ';
    query = query + ' AND (createdBy = ' + userId + ' OR isPublic = 1)';

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

module.exports = ViewDao;