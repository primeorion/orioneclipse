"use strict";

var moduleName = __filename;
var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var utilDao = require('dao/util/UtilDao.js');
var util = require('util');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');

var TradeDao = function () { }
//WE donot use model entity concept in get List api because it will increase loops
TradeDao.prototype.getTradeExecutionTypeList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(" SELECT TE.id,TE.name,TE.isDeleted,TE.createdDate as createdOn, ");
    query.push(" usCreated.userLoginId as createdBy, ");
    query.push(" TE.editedDate as editedOn, ");
    query.push(" usEdited.userLoginId as editedBy ");
    query.push(" from tradeExecutionType as TE ");
    query.push(" left outer join user as usCreated on usCreated.id = TE.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = TE.editedBy ");
    query.push(" WHERE 1=1 ");

    if (data.search) {
        query.push(" AND ");
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(" (TE.id= '" + data.search + "' OR ");
        }
        query.push(" TE.name LIKE '%" + data.search + "%' ");
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' ) ');
        }
    }

    query.push(' AND TE.isDeleted = 0 ');
    if (data.search) {
        query.push(' ORDER BY TE.name ASC ');
    }
    query = query.join("");
    logger.debug("Query: " + query);

    connection.query(query, function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, resultSet);
    });
};

TradeDao.prototype.getTradeListByPortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var portfolioId = data.id;
    var query = [];
    query.push(" SELECT T.id,T.action,T.tradeAmount,T.createdDate as createdOn, ");
    query.push(" T.portfolioId,portfolio.name as portfolioName, ");
    query.push(" T.securityId, security.name as securityName, ");
    query.push(" T.accountId, account.accountNumber as accountNumber, accountType.name as accountType ");
    query.push(" FROM trades as T ");
    query.push(" LEFT OUTER JOIN portfolio as portfolio on portfolio.id = T.portfolioId ");
    query.push(" LEFT OUTER JOIN security as security on security.id = T.securityId ");
    query.push(" LEFT OUTER JOIN account as account on account.id = T.accountId ");
    query.push(" LEFT OUTER JOIN accountType as accountType on accountType.id = account.accountTypeId ");
    query.push(" WHERE T.portfolioId = ? ");
    if (data.tradeCode) {
        query.push(" AND ");
        query.push(" T.tradeCode= '" + data.tradeCode + "'");
    }
    //  query.push(" GROUP BY T.createdDate ORDER BY T.createdDate DESC ");
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, portfolioId, function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
TradeDao.prototype.getTradeDetail = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT T.id, T.action, T.isEnabled, T.orderQty, T.orderPercent, sp.price ');
    query.push(', T.tradeAmount as estAmount, T.tradingInstructions, T.warningMessage ');
    query.push(', usCreated.userLoginId as createdBy, T.createdDate, usEdited.userLoginId as editedBy, T.editedDate, T.cashValuePostTrade ');
    query.push(" ,T.securityId, security.name as securityName, security.symbol as securitySymbol, st.name as securityType ");
    query.push(" ,T.accountId as accId, account.accountId as accountId, account.accountNumber as accountNumber, account.name as accountName ");
    query.push(" , c.name as custodian");
    query.push(" , ot.name as orderTypeName, T.orderTypeId ");
    query.push(" , q.name as qualifierName, T.qualifierId ");
    query.push(" , d.name as durationName, T.durationId ");
    query.push(" , ta.name as tradeActionName, T.tradeActionId");
    query.push(" , T.limitPrice, T.stopPrice, T.isDiscretionary, T.isSolicited, T.isAutoAllocate ");
    query.push(' FROM trades AS T ');
    self.getJoinTables(data, function (err, fromClause) {
        query.push(fromClause);
        query.push(" LEFT JOIN securityPrice as sp on sp.securityId = security.id ");
        query.push(" LEFT JOIN orderType as ot on ot.id = T.orderTypeId ");
        query.push(" LEFT JOIN duration as d on d.id = T.durationId");
        query.push(" LEFT JOIN qualifier q on q.id = T.qualifierId ");
        query.push(" LEFT JOIN tradeAction as ta on ta.id = T.tradeActionId ");
        data.query = query;
        self.setPermisions(data, function (err, data) {
            query = data.query;
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push(' AND T.id =' + data.id);
                query = query.join("");
                logger.debug("Query: " + query);
                var queryString = connection.query(query, function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err, null);
                    }
                    return cb(null, data);
                });
            });
        });
    });
};

TradeDao.prototype.getAwatingAcceptanceTrades = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT T.id, tradeAction.name as action, T.isEnabled, T.orderQty, T.orderPercent, T.price ');
    query.push(', T.tradeAmount as estAmount, T.tradingInstructions, T.warningMessage ');
    query.push(', usCreated.userLoginId as createdBy, T.createdDate, usEdited.userLoginId as editedBy, T.editedDate, T.cashValuePostTrade ');
    query.push(" ,T.securityId, security.name as securityName, security.symbol as securitySymbol, st.name as securityType ");
    query.push(" ,T.accountId as accId, account.accountId as accountId, account.accountNumber as accountNumber, account.name as accountName ");
    query.push(" , c.name as custodian");
    query.push(" ,T.portfolioId, portfolio.name as portfolioName ");
    query.push(" , orderType.name as orderType");
    query.push(' FROM trades AS T ');
    self.getJoinTables(data, function (err, fromClause) {
        query.push(fromClause);
        query.push(" LEFT OUTER JOIN portfolio as portfolio on portfolio.id = T.portfolioId ");
        query.push(" LEFT OUTER JOIN orderType as orderType on orderType.id = T.orderTypeId ");
        query.push(" LEFT OUTER JOIN tradeAction as tradeAction on tradeAction.id = T.tradeActionId ");
        query.push(" LEFT JOIN custodianTradeExecutionTypeForSecurity AS cte ON cte.custodianId = c.id AND cte.securityTypeId = st.id ");
        query.push(" LEFT JOIN tradeExecutionType AS te ON te.id = cte.tradeExecutionTypeId ");
        data.query = query;
        self.setPermisions(data, function (err, data) {
            query = data.query;
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push('AND st.name = "MUTUAL FUND"  AND te.name = "FIX DIRECT" AND T.orderStatusId IS NOT NULL ');
                if (data.search) {
                    query.push(' AND ');
                    if (data.search.match(/^[0-9]+$/g)) {
                        query.push(' (T.id= "' + data.search + '" OR ');
                    }
                }
                query.push(' GROUP BY T.id ');
                query = query.join("");
                logger.debug("Query: " + query);
                var queryString = connection.query(query, [data.statusId], function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, data);
                });
            });
        });
    });
};

//Get Portfolio Detailed List
TradeDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    var userId = data.user.userId;
    var tradeTabTypeFilter = data.tradeTabTypeFilter;
    connection.query("CALL getTrades(?,?,?)", [userId, tradeTabTypeFilter, data.portfolioId], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows[0]);
    });
};

TradeDao.prototype.getCountOfTrades = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT count(T.id) as noOfTrades ');
    query.push(' FROM trades AS T ');
    self.getJoinTables(data, function (err, fromClause) {
        query.push(fromClause);
        data.query = query;
        self.setPermisions(data, function (err, data) {
            query = data.query;
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push('AND T.orderStatusId IS NULL ');
                query = query.join("");
                logger.debug("Query: " + query);
                var queryString = connection.query(query, [data.statusId], function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, data);
                });
            });
        });
    });
};
TradeDao.prototype.getJoinTables = function (data, cb) {
    var fromClause = "";
    fromClause += " LEFT JOIN security as security on security.id = T.securityId ";
    fromClause += " LEFT JOIN securityType as st on st.id = security.securityTypeId";
    fromClause += " LEFT JOIN account as account on account.id = T.accountId ";
    fromClause += " LEFT JOIN custodian as c on c.id = T.custodianId ";
    fromClause += " LEFT JOIN user as usCreated on usCreated.id = T.createdBy";
    fromClause += " LEFT JOIN user as usEdited on usEdited.id = T.editedBy ";
    return cb(null, fromClause);
}

TradeDao.prototype.setPermisions = function (data, cb) {
    var limitedAccess = data.portfolioLimitedAccess;
    var allAccess = data.portfolioAllAccess;
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is " + roleTypeId);
    if (roleTypeId !== enums.roleType.FIRMADMIN) {
        if (allAccess && allAccess.length === 0 && limitedAccess && limitedAccess.length > 0) {
            data.query.push(' INNER JOIN teamPortfolioAccess AS tpa ON T.portfolioId = tpa.portfolioId AND tpa.teamId IN (' + limitedAccess + ') AND tpa.isDeleted = 0 ');
        }
    }
    return cb(null, data);
}

TradeDao.prototype.getWhereClause = function (data, cb) {
    var whereClause = "";
    // whereClause +='  st.name != "MUTUAL FUND" AND te.name != "FIX DIRECT"';
    whereClause += ' WHERE T.isDeleted = 0 ';
    return cb(null, whereClause);
}
TradeDao.prototype.updateTrade = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push('UPDATE trades as T ');
    self.getJoinTables(data, function (err, joinClause) {
        query.push(joinClause);
        data.query = query
        self.setPermisions(data, function (err, result) {
            query = result.query;
            query.push(' SET T.limitPrice = ' + data.trade.limitPrice + ' , T.stopPrice = ' + data.trade.stopPrice + ' ');
            query.push(' ,T.durationId = ' + data.trade.durationId + ' , T.qualifierId = ' + data.trade.qualifierId + ' ');
            query.push(' ,T.tradeActionId = ' + data.trade.tradeActionId + ' , T.isAutoAllocate = ' + data.trade.isAutoAllocate + ' ');
            query.push(' ,T.isDiscretionary = ' + data.trade.isDiscretionary + ' , T.isSolicited = ' + data.trade.isSolicited + ' ');
            query.push(' ,T.tradeActionId = ' + data.trade.tradeActionId + ' , T.orderQty = ' + data.trade.orderQty + ' ');
            query.push(', T.orderTypeId = ' + data.trade.orderTypeId + ' , T.editedBy = ' + userId + ' , T.editedDate = "' + currentDate + '" ');
            query.push(', T.isSendImmediately = ' + data.trade.isSendImmediately + ' ');
            
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push('AND T.orderStatusId IS NULL ');
                query.push(' AND T.id =' + data.id);
                query = query.join("");
                logger.debug("Query: " + query);
                connection.query(query, [], function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, data);
                });
            });
        });
    });
};

TradeDao.prototype.updateSomeFieldsOfTrade = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push('UPDATE trades as T ');
    query.push('SET T.editedBy = ' + userId + ' , T.editedDate = "' + currentDate + '" ');
    if(data.holdUntil){
        query.push(' ,T.holdUntil = "' + data.holdUntil + '" ');    
    }
    else if(data.clientDirected != undefined){
        query.push(' ,T.isClientDirected = ' + data.clientDirected+ ' ');
    }
    else if(data.settlementTypeId){
        query.push(' ,T.settlementTypeId = ' + data.settlementTypeId + ' ');
    }
    self.getWhereClause(data, function (err, whereClause) {
        query.push(whereClause);
        query.push('AND T.orderStatusId IS NULL ');
        query.push(' AND T.id =' + data.id);
        query = query.join("");
        logger.debug("Query: " + query);
        connection.query(query, [], function (err, data) {
            if (err) {
                logger.error(err);
                return cb(err);
            }
            return cb(null, data);
        });
    });
};

TradeDao.prototype.toggleIsEnabled = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push('UPDATE trades as T ');
    self.getJoinTables(data, function (err, joinClause) {
        query.push(joinClause);
    });
    if (!data.tradeIds) {
        data.query = query;
        self.setPermisions(data, function (err, result) {
            query = data.query;
        });
    }
    query.push(' SET T.isEnabled = ' + data.isEnabled + ' , T.editedBy = ' + userId + ' , T.editedDate = "' + currentDate + '" ')
    self.getWhereClause(data, function (err, whereClause) {
        query.push(whereClause);
        query.push('AND T.orderStatusId IS NULL ');
        if (data.tradeIds) {
            query.push(' AND T.id IN ( ');
            data.tradeIds.forEach(function (tradeId) {
                query.push(' ' + tradeId + ' ,');
            }, this);
            query.push(' null) ');
        }
        query = query.join("");
        logger.debug("Query: " + query);
        var queryString = connection.query(query, [], function (err, data) {
            if (err) {
                logger.error(err);
                return cb(err);
            }
            return cb(null, data);
        });
    });
};
TradeDao.prototype.deleteTrades = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push('UPDATE trades as T ');
    self.getJoinTables(data, function (err, joinClause) {
        query.push(joinClause);
    });
    if (!data.tradeIds) {
        data.query = query;
        self.setPermisions(data, function (err, result) {
            query = data.query;
        });
    }
    query.push(' SET T.isDeleted = true , T.editedBy = ' + userId + ' , T.editedDate = "' + currentDate + '" ')
    self.getWhereClause(data, function (err, whereClause) {
        query.push(whereClause);
        if (data.tradeIds) {
            query.push(' AND T.id IN ( ');
            data.tradeIds.forEach(function (tradeId) {
                query.push(' ' + tradeId + ' ,');
            }, this);
            query.push(' null) ');
        }

        query = query.join("");
        logger.debug("Query: " + query);
        var queryString = connection.query(query, [], function (err, data) {
            if (err) {
                logger.error(err);
                return cb(err);
            }
            return cb(null, data);
        });
    });
};

TradeDao.prototype.deleteZeroQuantityTrades = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push('UPDATE trades as T ');
    self.getJoinTables(data, function (err, joinClause) {
        query.push(joinClause);
        data.query = query;
        self.setPermisions(data, function (err, result) {
            query = data.query;
            query.push(' SET T.isDeleted = true , T.editedBy = ' + userId + ' , T.editedDate = "' + currentDate + '" ');
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push(" AND T.orderQty = 0");
                query = query.join("");
                logger.debug("Query: " + query);
                var queryString = connection.query(query, [], function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, data);
                });
            });
        });
    });

};

TradeDao.prototype.isTradeExist = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT t.id ');
    query.push(' FROM trades AS t ');
    query.push(" WHERE id= " + data.id);
    query.push(' AND t.isDeleted = 0 ');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

TradeDao.prototype.getOrderTypes = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT o.id, o.name ');
    query.push(' FROM orderType AS o ');
    query.push(" WHERE 1=1 ");
    query.push(' AND o.isDeleted = 0 ');
    query.push(' ORDER BY name ');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);

    });
};


TradeDao.prototype.getQualifiers = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT q.id, q.name ');
    query.push(' FROM qualifier AS q ');
    query.push(" WHERE 1=1 ");
    query.push(' AND q.isDeleted = 0 ');
    query.push(' ORDER BY name ');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);

    });
};


TradeDao.prototype.getDurations = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT d.id, d.name ');
    query.push(' FROM duration AS d ');
    query.push(" WHERE 1=1 ");
    query.push(' AND d.isDeleted = 0 ');
    query.push(' ORDER BY name ');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);

    });
};

TradeDao.prototype.getActions = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT a.id, a.name ');
    query.push(' FROM action AS a ');
    query.push(" WHERE 1=1 ");
    query.push(' AND a.isDeleted = 0 ');
    if (data.isAccountActions) {
        query.push(' AND a.isAvailableForAccount = 1 ');
    }
    else if (data.isPortfolioActions) {
        query.push(' AND a.isAvailableForProfolio = 1 ');
    }
    query.push(' ORDER BY name ');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);

    });
};

TradeDao.prototype.getTradeActions = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT ta.id, ta.name ');
    query.push(' FROM tradeAction AS ta ');
    query.push(" WHERE 1=1 ");
    query.push(' AND ta.isDeleted = 0 ');
    query.push(' ORDER BY name ');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);

    });
};

TradeDao.prototype.getSettlementTypes = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT s.id, s.name ');
    query.push(' FROM settlementType AS s ');
    query.push(" WHERE 1=1 ");
    query.push(' ORDER BY name ');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);

    });
};

TradeDao.prototype.getTradeApprovalStatus = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userRoleId = data.user.roleId;
    var tradeIds = "";
    if (data.tradeIds) {
        tradeIds = data.tradeIds;
    }
    connection.query("CALL getTradeApprovedStatusForUser(?,?)", [userRoleId, tradeIds], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows[0]);
    });
};

TradeDao.prototype.getTradeApprovalPrivilagesForUser = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userRoleId = data.user.roleId;
    var tradeIds = "";
    if (data.tradeIds) {
        tradeIds = data.tradeIds.toString();
    }
    connection.query("CALL getTradeAccessibleToUser(?,?)", [userRoleId, tradeIds], function (err, rows) {
        if (err) {
            return cb(err);
        }
        cb(null, rows[0]);
    });
};

TradeDao.prototype.getTradePrivileges = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT p.id, p.code, p.name ');
    query.push(' FROM rolePrivilege AS rp ');
    query.push(' INNER JOIN privilege AS p on p.id = rp.privilegeId and p.category= "Trade Orders"');
    query.push(" WHERE roleId= " + data.user.roleId);
    query.push(' AND rp.isDeleted = 0 AND p.isDeleted = 0 ORDER BY p.id DESC LIMIT 1');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);

    });
};

TradeDao.prototype.approveTrade = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push('UPDATE trades as T ');
    self.getJoinTables(data, function (err, joinClause) {
        query.push(joinClause);
        data.query = query;
        self.setPermisions(data, function (err, result) {
            query = result.query;
            query.push(' SET T.approvalStatusId = ' + data.approvalStatus + ' ');
            query.push(', T.editedBy = ' + userId + ' , T.editedDate = "' + currentDate + '" ');
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push(' AND T.id =' + data.id);
                query = query.join("");
                logger.debug("Query: " + query);
                var queryString = connection.query(query, [], function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, data);
                });
            });
        });
    });
};

/*
TradeDao.prototype.getTradeForProcess = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var query = [];
    var currentDate = utilDao.getSystemDateTime();
    query.push(' SELECT T.id, T.isEnabled, tradeApprovalStatus.name as approvalStatus ');
    query.push(" ,T.securityId,  st.id AS securityTypeId, st.name as securityType, security.symbol as securitySymbol, security.name as securityName ");
    query.push(" ,( CASE WHEN (c.tradeExecutionTypeId != -1 ) THEN c.tradeExecutionTypeId  ");
    query.push(" ELSE te.id  ");
    query.push(" END) AS tradeExecutionTypeId ");
    //  query.push(" , te.id as tradeExecutionTypeId");
    query.push(" , ta.name as tradeActionName, T.tradeActionId, T.orderQty, T.limitPrice, T.isSolicited");
    query.push(" , T.isAutoAllocate, account.accountNumber as accountNumber, accountType.name as accountType ");
    query.push(" , account.name as accountName, T.custodianId as custodianId, c.masterAccountNumber as blockAccountNumber ");
    query.push(" , T.reinvestDividends, CONCAT(T.action, '-', T.accountId, '-', T.securityId) AS combined ");
    query.push(' FROM trades AS T ');
    self.getJoinTables(data, function (err, fromClause) {
        query.push(fromClause);
        query.push(" LEFT JOIN custodianTradeExecutionTypeForSecurity AS cte ON cte.custodianId = c.id AND cte.securityTypeId = st.id AND cte.isDeleted = 0 ");
        query.push(" LEFT JOIN tradeExecutionType AS te ON te.id = cte.tradeExecutionTypeId ");
        query.push(" LEFT JOIN tradeAction as ta on ta.id = T.tradeActionId ");
        query.push(" LEFT JOIN tradeApprovalStatus as tradeApprovalStatus on tradeApprovalStatus.id = T.approvalStatusId ");
        query.push(" LEFT OUTER JOIN accountType as accountType on accountType.id = account.accountTypeId ");
        data.query = query;
        self.setPermisions(data, function (err, data) {
            query = data.query;
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push(' AND T.custodianId != 0 AND T.isEnabled = true AND tradeApprovalStatus.name="Approved" AND T.allocationStatusId IS NULL');
                query.push(' AND (T.holdUntil IS NULL OR T.holdUntil<="' + currentDate + '") ');
                if (data.tradeIds) {
                    query.push(' AND T.id IN ( ');
                    data.tradeIds.forEach(function (tradeId) {
                        query.push(' ' + tradeId + ' ,');
                    }, this);
                    query.push(' null) ');
                }
                query = query.join("");
                logger.debug("Query: " + query);
                var queryString = connection.query(query, function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, data);
                });
            });
        });
    });
};
*/

TradeDao.prototype.getTradeForProcess = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var tradeIds = data.tradeIds ? data.tradeIds.toString() : null;
    connection.query("CALL `getTradesForTradeFiles`(?, ?)", [userId, tradeIds], function (err, rows) {
        if (err) {
            return cb(err);
        }
        return cb(null, rows[0]);
    });
};

TradeDao.prototype.processTrade = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push('UPDATE trades as T ');
    self.getJoinTables(data, function (err, joinClause) {
        query.push(joinClause);
        data.query = query;
        self.setPermisions(data, function (err, result) {
            query = result.query;
            query.push(' SET T.allocationStatusId = ' + data.trade.allocationStatusId + ' ');
            query.push(', T.orderStatusId = ' + data.trade.orderStatusId + ' ');
            query.push(', T.hasBlock = ' + data.trade.hasBlock + ' ');
            query.push(', T.blockId = ' + data.trade.blockId + ' ');
            query.push(', T.editedBy = ' + userId + ' , T.editedDate = "' + currentDate + '" ');
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push(' AND T.id =' + data.trade.id);
                query = query.join("");
                logger.debug("Query: " + query);
                var queryString = connection.query(query, [], function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err);
                    }
                    return cb(null, data);
                });
            });
        });
    });
};

TradeDao.prototype.getModelsByTrades = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT DISTINCT M.id, M.name ');
    query.push(' FROM trades AS T INNER JOIN portfolio as P on P.id = T.portfolioId INNER JOIN model M on M.id = P.modelId ');
    if (data.tradeIds) {
        query.push(' WHERE T.id IN ( ' + data.tradeIds);
        query.push(') ');
    }
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });

};

TradeDao.prototype.getMinimumTradeInfo = function (data, cb) {
    var self = this;
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT T.id ');
    query.push(', T.tradeAmount as estAmount  ');
    query.push(', T.cashValuePostTrade ');
    query.push(" ,T.securityId ");
    query.push(" ,T.accountId ");
    query.push(' FROM trades AS T ');
    self.getJoinTables(data, function (err, fromClause) {
        query.push(fromClause);
        data.query = query;
        self.setPermisions(data, function (err, data) {
            query = data.query;
            self.getWhereClause(data, function (err, whereClause) {
                query.push(whereClause);
                query.push(' AND T.id =' + data.id);
                query = query.join("");
                logger.debug("Query: " + query);
                var queryString = connection.query(query, function (err, data) {
                    if (err) {
                        logger.error(err);
                        return cb(err, null);
                    }
                    return cb(null, data);
                });
            });
        });
    });
};

TradeDao.prototype.getTradeToSendImediate = function(data, cb){
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT T.id ');
    query.push(' FROM trades AS T ');
    query.push(' WHERE T.isAutoAllocate = 1');
    if (data.approvedTradeIds) {
        query.push(' AND T.id IN ( ');
        data.approvedTradeIds.forEach(function (tradeId) {
            query.push(' ' + tradeId + ' ,');
        }, this);
        query.push(' null) ');
    }
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err, null);
        }
        return cb(null, data);
    });

}


TradeDao.prototype.getTradeOrderMessages = function(data, cb){
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(' SELECT TOM.id as id, TOM.shortCode as shortCode, TOM.message as message, TS.severity as severity, TOMA.messageArguments as arguments');
    query.push(' FROM tradeOrderMessage AS TOM ');
    query.push(' INNER JOIN tradeOrderMessageAssn AS TOMA ON TOMA.tradeId='+data.id+' AND TOMA.tradeOrderMessageId=TOM.id' );
    query.push(' INNER JOIN tradeSeverity AS TS ON TS.id=TOM.severityId');
    query = query.join("");
    logger.debug("Query: " + query);
    var queryString = connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err, null);
        }
        return cb(null, data);
    });

}


TradeDao.prototype.checkDuplicateTrade = function(data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(" SELECT T.id, T.createdDate, T.tradeInstanceId");
    query.push(" FROM trades AS T ");
    query.push(" LEFT JOIN orderStatus AS OS ON OS.id = T.orderStatusId ");
    query.push(" WHERE T.securityId="+data.securityId);
    query.push(" And T.accountId="+data.accountId);
    query.push(" AND T.tradeActionId="+data.actionId);
    query.push(" AND (OS.name in('"+enums.TRADE_ORDER.ORDER_STATUS.NOT_SENT+"',");
    query.push("'"+enums.TRADE_ORDER.ORDER_STATUS.SENT+"',");
    query.push("'"+enums.TRADE_ORDER.ORDER_STATUS.PARTIALLY_FILLED+"',");
    query.push("'"+enums.TRADE_ORDER.ORDER_STATUS.DONE_FOR_DAY+"',");
    query.push("'"+enums.TRADE_ORDER.ORDER_STATUS.PENDING_CANCEL+"',");
    query.push("'"+enums.TRADE_ORDER.ORDER_STATUS.PENDING_REPLACE+"')");
    query.push(" OR T.orderStatusId IS NULL) ");
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
}
module.exports = TradeDao;