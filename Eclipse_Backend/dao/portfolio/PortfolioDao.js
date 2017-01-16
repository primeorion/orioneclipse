"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');
// var analysisDao = new(require('dao/post_import_analysis/AnalysisDao'))();
var localCache = require('service/cache').local;
var unique = require('helper').uniqueIdGenerator;
var dbConnection = require('./../../middleware/DBConnection.js');
var PortfolioDao = function () { };

//Get Simple Portfolio List 
PortfolioDao.prototype.getSimplePortfolioList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var arr = [];
    var limitedAccess = data.portfolioLimitedAccess;
    var allAccess = data.portfolioAllAccess;
    var roleTypeId = data.user.roleTypeId;
    var search = data.search ? data.search : null;
    logger.debug("roleTypeId is " + roleTypeId);
    var query = [];
    query.push(' SELECT p.id, p.name, acc.custodialAccountNumber as custodialAccountNumber, ');
    query.push(" (case when (p.createdBy = 0) THEN 'Advisor' ELSE 'Team' END) as source, ");
    query.push(' p.modelId AS modelId, ');
    query.push(' p.isSleevePortfolio AS sleevePortfolio, ');
    query.push(' p.isDeleted, p.createdDate as createdOn, ');
    query.push(' usCreated.userLoginId as createdBy, ');
    query.push(' p.editedDate as editedOn, ');
    query.push(' usEdited.userLoginId as editedBy ');
    query.push(' FROM portfolio as p ');
    query.push(" left outer join user as usCreated on usCreated.id = p.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = p.editedBy ");
    query.push(" left join account as acc on acc.portfolioId = (Select id from account a where a.portfolioId = p.id And a.isDeleted  = 0 Limit 1) And p.isSleevePortfolio = true ");
    if (roleTypeId !== enums.roleType.FIRMADMIN) {
        if (allAccess && allAccess.length === 0 && limitedAccess && limitedAccess.length > 0) {
            arr = limitedAccess;
            query.push(' INNER JOIN teamPortfolioAccess AS tpa ON p.id = tpa.portfolioId AND tpa.teamId IN (?) AND tpa.isDeleted = 0 ');
        }
    }
    query.push(' WHERE 1=1 ');

    if (data.search) {
        search = search.replace(/\"/g, "'");
        query.push(' AND (');
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' (p.id= "' + data.search + '" OR ');
        }
        query.push(' p.name LIKE "%' + search + '%" OR ');
        query.push(' p.tags LIKE "%' + search + '%" ');
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' ) ');
        }
        query.push(' ) ');
    }
    if (data.hasOwnProperty('isSleeved') && data.isSleeved === 'true') {
        query.push(' AND isSleevePortfolio = 1 ');
    } else if (data.hasOwnProperty('isSleeved') && data.isSleeved === 'false') {
        query.push(' AND isSleevePortfolio = 0 ');
    }
    query.push(' AND p.isDeleted = 0 AND p.isDisabled = 0 ');
    if (data.search) {
        query.push(' ORDER BY p.name, p.id DESC ');
    }
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, [arr], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        return cb(null, result);
    });
};

PortfolioDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT * FROM portfolio WHERE (id = ?) AND isDeleted = 0 ';
    connection.query(query, [data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Get Portfolio Detailed List
PortfolioDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var search = data.id ? data.id : null;
    var filter = data.filter ? data.filter : null;
    var param = null;
    var query = "CALL getPortfoliosForUser (?,?)";
    var response = [];
    response[0] = false;
    if (data.id) {
        search = data.id.match(/^[0-9]+$/g) ? search : 0;
        logger.debug("Searched value : " + search);
        query = "CALL searchPortfoliosByParameter (?,?,'" + search + "')";
        param = 'all';
        response[0] = true;
    }
    if (data.filter) {
        filter = data.filter.match(/^[0-9]+$/g) ? filter : 0;
        logger.debug("Searched Portfolio filter Id : " + data.filter);
        param = filter;
        response[0] = false;
    }
    if (data.householdIds) {
        // logger.debug("Searched householdIds : " + data.option);
        query = "CALL searchPortfoliosByParameter (?,?, null)";
        param = data.householdIds;
        response[0] = true;
    }
    if (data.newPortfolios) {
        // logger.debug("New Portfolio List : " + data.newPortfolios);
        query = "CALL searchPortfoliosByParameter (?,?, null)";
        param = 'new';
        response[0] = true;
    }
    connection.query(query, [userId, param], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        if (result[0]) {
            response[1] = result[0];
            return cb(null, response);
        }
        return cb("Unable to fetch PortfolioList Data in Dao (getList()) ", response);
    });
};

//Get Portfolio Status
PortfolioDao.prototype.getStatus = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = 'SELECT id As id, status As filter, priority As priority, actionText As actionText,  portfolioStatusValue As portfolioStatusValue FROM portfolioStatus';
    logger.debug("Query: " + query);

    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Get Details of particular Portfolio on the basis of PortfolioId 
PortfolioDao.prototype.getDetails = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var id = data.id;

    connection.query("CALL getPortfolioGeneralDetails (?,?,'2016-09-02 12:21:39')", [userId, id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Get Portfolio account Summary in which this call will return count of accounts associated with portfolioId
PortfolioDao.prototype.getPortfolioAccountsSummary = function (data, cb) {
    var connection = baseDao.getConnection(data);
    // var result = {
    //     count: null
    // };

    var query = 'SELECT id FROM account WHERE isDeleted = 0 AND portfolioId IN ( ';

    if (data.ids) {
        var ids = data.ids;
        ids.forEach(function (id) {
            query = query + id + ',';
        });
        query = query.substr(0, query.length - 1);
        query = query + ');';
    } else {
        query = query + data.id + ' ); ';
    }

    logger.debug("Query : " + query);

    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        // if (data) {
        //     result.count = data[0]['COUNT(*)'];
        // }
        return cb(null, result);
    });
};

//Get Accounts List
PortfolioDao.prototype.getAccountsList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var portfolioId = data.id;
    var userId = utilService.getAuditUserId(data.user);
    if (data.regular) {
        // logger.debug("---API of regular----");
    }
    if (data.sma) {
        // logger.debug("---API of sma----");
    }
    if (data.sleeved) {
        // logger.debug("---API of sleeved----");
    }

    connection.query("CALL getAccountDetailsForPortfolio (?, ?)", [userId, data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result[0]);
    });

    // cb(null, accountList);
};

//Get Accounts List
PortfolioDao.prototype.getAccountsListSimple = function (data, cb) {
    var connection = baseDao.getConnection(data);
     logger.debug("getAccountsListSimple dao: " + data.id);
    var portfolioId = data.id;
    var userId = utilService.getAuditUserId(data.user);
    var query = [];
    query.push(' Select  acc.id as id, acc.accountId as accountId,  acc.name as accountName,acc.accountNumber as accountNumber from portfolio p');
    query.push(' left JOIN account acc on p.id = acc.portfolioId and acc.isDeleted = 0 ');
    query.push(' where p.id = ' + data.id + ' and p.isDeleted = 0');
    if (data.search) {
        if (data.search) {
            query.push(' AND ( acc.id= "' + data.search + '" OR ');
            query.push(' acc.name LIKE "%' + data.search + '% ' + '" OR ');
            query.push(' acc.accountNumber LIKE "%' + data.search + '%" ) ');
        } else {
            query.push(' AND ( acc.id= "' + data.search + '" OR ');
            query.push(' acc.name LIKE "%' + data.search + '% ' + '" OR ');
            query.push(' acc.accountNumber LIKE "%' + data.search + '%" ) ');
        }
    }
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, [data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result);
    });
};

//Get Sleeved Accounts List
PortfolioDao.prototype.getSleevedAccountsList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var portfolioId = data.id;
    var userId = utilService.getAuditUserId(data.user);

    if (data.sleeved) {
        // logger.debug("---API of sleeved----");
    }

    connection.query("CALL getAccountDetailsForPortfolio (?, ?)", [userId, data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result[0]);
    });

    // cb(null, accountList);
};

//Method for assigning portfolioId to accountIds in account Table
PortfolioDao.prototype.assignPortfolioToAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var accountIds = data.accountIds;
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];

    if (accountIds.length > 0) {
        query.push('UPDATE account SET portfolioId = ' + data.id + ' , editedBy = ' + userId + ' , editedDate = "' + currentDate + '" ');
        query.push(' WHERE id IN ( ');
        accountIds.forEach(function (accountId) {
            query.push(' ' + accountId + ' ,');
        }, this);
        query.push(' null) ');
    }
    query.push(' AND isDeleted = 0');

    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(err, result.affectedRows);
    });
};

//Method for Un-Assigning portfolioId from all accountIds associated with that PortfolioId
PortfolioDao.prototype.unAssignPortfolioFromAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var accountIds = data.accountIds ? data.accountIds : null;
    var currentDate = utilDao.getSystemDateTime();
    var userId = utilService.getAuditUserId(data.user);
    var query = [];

    query.push('UPDATE account SET portfolioId = null , editedBy = ' + userId + ' , editedDate = "' + currentDate + '" ');
    query.push(' WHERE portfolioId = ' + data.id + ' AND isDeleted = 0 ');
    if (accountIds) {
        if (accountIds.length > 0) {
            query.push(' AND id IN ( ');
            accountIds.forEach(function (accountId) {
                query.push(' ' + accountId + ' ,');
            }, this);
            query.push(' null) ');
        }
    }
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(err, result.affectedRows);
    });
};

//Get number of portfolios count on the basis of Portfolio Name [internally called]
PortfolioDao.prototype.getPortfolioCountById = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var portfolioId = data.id ? data.id : 0;
    var limitedAccess = data.portfolioLimitedAccess;
    var allAccess = data.portfolioAllAccess;
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is " + roleTypeId);
    var result = {
        count: null
    };

    /*
     * when using query builder pls modelId, substitutedModelId
    */var query = 'SELECT * FROM portfolio as p ';

    if (roleTypeId !== enums.roleType.FIRMADMIN) {
        if (allAccess && allAccess.length === 0 && limitedAccess && limitedAccess.length > 0) {
            query = query + ' INNER JOIN teamPortfolioAccess AS tpa ON p.id = tpa.portfolioId AND tpa.teamId IN (' + limitedAccess + ') AND tpa.isDeleted = 0 ';
        }
    }

    query = query + ' WHERE (p.id IN (?)) AND p.isDeleted = 0 ';
    logger.debug("Query : " + query);
    var queryString = connection.query(query, [portfolioId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Validate Sleeved Portfolios [internally called]
PortfolioDao.prototype.validateSleevedPortfolios = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var limitedAccess = data.portfolioLimitedAccess;
    var allAccess = data.portfolioAllAccess;
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is " + roleTypeId);
    var result = {
        count: null
    };
    var query = 'SELECT p.id FROM portfolio as p ';
    if (roleTypeId !== enums.roleType.FIRMADMIN) {
        if (allAccess && allAccess.length === 0 && limitedAccess && limitedAccess.length > 0) {
            query = query + ' INNER JOIN teamPortfolioAccess AS tpa ON p.id = tpa.portfolioId AND tpa.teamId IN (' + limitedAccess + ') AND tpa.isDeleted = 0 ';
        }
    }
    query = query + ' WHERE (p.id IN ( ';
    if (data.ids) {
        var ids = data.ids;
        ids.forEach(function (id) {
            query = query + id + ',';
        });
        query = query.substr(0, query.length - 1);
        query = query + ')) ';
    } else {
        query = query + data.id + ' )) AND p.isDeleted = 0 ';
    }

    query = query + ' AND p.isSleevePortfolio = 0 ';
    logger.debug("Query : " + query);
    connection.query(query, function (err, out) {
        if (err) {
            return cb(err);
        }
        var portfolios = [];
        out.forEach(function (portfolio) {
            portfolios.push(portfolio.id);
        });
        return cb(null, portfolios);
    });
};

//Get number of Model count on the basis of ModelId [internally called]
/*
PortfolioDao.prototype.getModelCountById = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = 'SELECT * FROM model WHERE id = ? AND isDeleted = 0 ';
    connection.query(query, [data.modelId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
*/
//Create new Portfolio
PortfolioDao.prototype.addPortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    var currentDate = utilDao.getSystemDateTime();
    var doNotTradeExists = null;
    var inputData = {
        name: data.name,
        isSleevePortfolio: data.isSleevePortfolio ? data.isSleevePortfolio : 0,
        tags: data.tags,
        isDeleted: data.isDeleted ? data.isDeleted : 0,
        createdBy: userId,
        editedBy: userId,
        editedDate: currentDate,
        createdDate: currentDate
    };

    if (data.doNotTrade === null) {
        doNotTradeExists = false;
    } else if (data.doNotTrade === false || data.doNotTrade === 0) {
        doNotTradeExists = true;
        data.doNotTrade = 0;
        inputData['doNotTrade'] = data.doNotTrade;
    } else if (data.doNotTrade === true || data.doNotTrade === 1) {
        doNotTradeExists = true;
        data.doNotTrade = 1;
        inputData['doNotTrade'] = data.doNotTrade;
    }

    if (data.modelId === null || data.modelId === 0) {
        data.modelId = null;
        inputData['modelId'] = data.modelId;
    } else if (data.modelId) {
        inputData['modelId'] = data.modelId;
    }
    var query = 'INSERT INTO portfolio SET ? ';
    connection.query(query, [inputData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Method used to set Primary Team in teamPortfolioAccess Table [internally called]
PortfolioDao.prototype.setPrimaryTeam = function (data, cb) {
    logger.debug("Set Primary team to Portfolio object ", data);
    var userId = utilService.getAuditUserId(data.user);
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var teamIds = data.teamIds;
    var primary = data.primaryTeamId;
    connection.query(' SELECT id FROM team WHERE portfolioAccess = 1 AND id IN ( ' + teamIds + ' ) ', function (err, response) {
        if (err) {
            return cb(err);
        }
        var query = 'INSERT INTO teamPortfolioAccess(`teamId`,`portfolioId`,`access`,`isDeleted`,`createdDate`,`createdBy`,`editedDate`,`editedBy`,`isPrimary`,`source`) VALUES';
        var inputData = {
            portfolioId: data.id,
            source: data.source,
            createdBy: userId,
            isDeleted: data.isDeleted ? data.isDeleted : 0,
            editedBy: userId,
            createdDate: currentDate,
            editedDate: currentDate
        };

        var queryData = inputData.portfolioId + ',0,' + inputData.isDeleted + ',"' + inputData.createdDate + '","' + inputData.createdBy + '","' + inputData.editedDate + '","' + inputData.editedBy + '"';
        query = query + '(' + primary + ',' + queryData + ',1,"' + inputData.source + '"),';
        if (response.length > 0) {
            response.forEach(function (teamId) {
                if (teamId.id !== primary) {
                    query = query + '(' + teamId.id + ',' + queryData + ',0,"' + inputData.source + '"),';
                }
                //     if (teamId !== primary) {
                //     // query = query + '(' + primary + ',' + queryData + ',1,"' + inputData.source + '"),';
                //     // } else {
                //     // query = query + '(' + teamId + ',' + queryData + ',0,"' + inputData.source + '"),';
                //     }
            }, this);
        }
        // query = query + '((SELECT id FROM team WHERE portfolioAccess = 1 AND id IN ( ' + teamIds + ' )),' + queryData + ',0,"' + inputData.source + '"),';
        query = query.substr(0, query.length - 1);
        query = query + ' ON DUPLICATE KEY UPDATE isDeleted = 0 ;';
        logger.debug("Query : " + query);
        connection.query(query, function (err, data) {
            if (err) {
                return cb(err);
            }
            return cb(null, data);
        });
    });
};

//Deletes Portfolio on the basis of PortfolioId (if and only if there is no account associated with the portfolio)
PortfolioDao.prototype.deletePortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Delete Portfolio", data);
    var portfolioIds = data.ids;
    var queryData = {
        isDeleted: 1,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    }

    var query = 'UPDATE portfolio SET modelId = null, editedBy = ' + queryData.editedBy + ' , editedDate = "' + queryData.editedDate + '" , isDeleted = 1 WHERE isSleevePortfolio = 0 AND isDeleted = 0 AND id IN ( ';
    portfolioIds.forEach(function (portfolioId) {
        query = query + portfolioId + ',';

    });
    query = query.substr(0, query.length - 1);
    query = query + ');';
    logger.debug(query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Deletes Portfolio Associated to team [internally called]
PortfolioDao.prototype.removePortfolioAssociatedToTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Remove Portfolio's PrimaryTeam", data);
    var portfolioIds = data.ids;
    var queryData = {
        isDeleted: 1,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    }

    var query = 'UPDATE teamPortfolioAccess SET editedBy = ' + queryData.editedBy + ' , editedDate = "' + queryData.editedDate + '" , isDeleted = 1  WHERE isDeleted = 0 AND portfolioId IN ( ';
    portfolioIds.forEach(function (portfolioId) {
        query = query + portfolioId + ',';

    });
    query = query.substr(0, query.length - 1);
    query = query + ');';
    logger.debug(query);
    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Update Portfolio 
PortfolioDao.prototype.updatePortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var doNotTradeExists = null;
    var queryData = {
        id: data.id,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime()
    };
    if (data.name !== null) {
        queryData["name"] = data.name;
    }
    if (data.modelId != null && data.modelId === 0) {
        queryData["modelId"] = null;
    } else if (data.modelId != null) {
        queryData["modelId"] = data.modelId;
    }
    if (data.isSleevePortfolio !== null) {
        queryData["isSleevePortfolio"] = data.isSleevePortfolio;
    }
    if (data.tags !== null) {
        queryData["tags"] = data.tags;
    }
    if (data.doNotTrade === null) {
        doNotTradeExists = false;
    } else if (data.doNotTrade === false || data.doNotTrade === 0) {
        doNotTradeExists = true;
        data.doNotTrade = 0;
        queryData['doNotTrade'] = data.doNotTrade;
    } else if (data.doNotTrade === true || data.doNotTrade === 1) {
        doNotTradeExists = true;
        data.doNotTrade = 1;
        queryData['doNotTrade'] = data.doNotTrade;
    }

    var query = 'UPDATE portfolio SET ? WHERE id = ? AND isDeleted = 0 ';
    connection.query(query, [queryData, queryData.id], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });

};

//Updates Primary Team for Portfolio [internally called]
PortfolioDao.prototype.updatePrimaryTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var self = this;
    var arr = data.teamIds;
    var primary = data.primaryTeamId;
    var queryData = {
        portfolioId: data.id,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    };
    var query = 'UPDATE teamPortfolioAccess SET editedBy = ' + queryData.editedBy + ' , editedDate = "' + queryData.editedDate + '" , isPrimary = (CASE ';
    arr.forEach(function (teamId) {
        if (teamId === primary) {
            query = query + ' WHEN teamId = ' + teamId + ' THEN 1 ';
        } else {
            query = query + ' WHEN teamId = ' + teamId + ' THEN 0 ';
        }
    });

    query = query + ' END) ';
    query = query + ' WHERE portfolioId = ' + queryData.portfolioId;
    logger.debug(query);
    connection.query(query, function (err, updated) {
        if (err) {
            return cb(err);
        }
        self.setPrimaryTeam(data, function (err, addNew) {
            if (err) {
                return cb(err);
            }
            self.removePrimaryTeam(data, function (err, deleteOld) {
                if (err) {
                    return cb(err);
                }
                return cb(null, deleteOld);
            });
        });
    });
};

//Removes Primary Team for Portfolio [internally called]
PortfolioDao.prototype.removePrimaryTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var arr = data.teamIds;
    var queryData = {
        portfolioId: data.id,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    };
    var selectQuery = 'SELECT teamId FROM teamPortfolioAccess WHERE portfolioId =' + queryData.portfolioId + ' AND ' + '  teamId  NOT IN ( ';

    arr.forEach(function (teamId) {
        selectQuery = selectQuery + teamId + ',';
    });
    selectQuery = selectQuery.substr(0, selectQuery.length - 1);
    selectQuery = selectQuery + ' ); ';
    logger.debug(selectQuery);
    connection.query(selectQuery, function (err, fetched) {
        if (err) {
            return cb(err);
        }
        var deleteQuery = '';
        if (fetched && fetched.length > 0) {
            deleteQuery = 'UPDATE teamPortfolioAccess SET isPrimary = 0 , editedBy = ' + queryData.editedBy + ' , editedDate = "' + queryData.editedDate + '" ,  isDeleted = 1  WHERE ';
            fetched.forEach(function (oldTeamId) {

                deleteQuery = deleteQuery + ' teamId = ' + oldTeamId.teamId + ' OR ';
            });
            deleteQuery = deleteQuery.substr(0, deleteQuery.length - 3) + ' AND ';
        } else {
            deleteQuery = 'UPDATE teamPortfolioAccess SET  editedBy = ' + queryData.editedBy + ' , editedDate = "' + queryData.editedDate + '" ,  isDeleted = 0  WHERE ';
        }
        deleteQuery = deleteQuery + 'portfolioId = ' + queryData.portfolioId + ' ;';
        logger.debug(deleteQuery);
        connection.query(deleteQuery, function (err, deletedRecord) {
            if (err) {
                logger.error(err);
                return cb(err);
            }
            return cb(null, deletedRecord);
        });
    });
};

//validate Teams For Portfolio [internally called]
PortfolioDao.prototype.validateTeamsForPortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = [];
    var arr = data.teamIds;

    var selectQuery = 'SELECT id  FROM team WHERE isDeleted = 0 AND status = 1 AND (id IN (';
    arr.forEach(function (teamId) {
        selectQuery = selectQuery + teamId + ',';
    });
    selectQuery = selectQuery.substr(0, selectQuery.length - 1);
    selectQuery = selectQuery + ') OR portfolioAccess = 0 ) ;';
    logger.debug(selectQuery);
    connection.query(selectQuery, function (err, fetched) {
        if (err) {
            return cb(err);
        }
        fetched.forEach(function (fetchedTeamId) {
            result.push(fetchedTeamId.id);
        });
        return cb(null, result);
    });
};

//validate Model For Portfolio [internally called]
PortfolioDao.prototype.validateModelForPortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = [];
    var arr = data.teamIds;
    var modelId = data.modelId;
    var query = '';
    var roleTypeId = data.user.roleTypeId;

    if (roleTypeId === enums.roleType.FIRMADMIN) {
        query = 'SELECT COUNT(*) FROM model WHERE isDeleted = 0 ';
        query = query + ' AND statusId = 1 ';
        query = query + ' AND id = ' + modelId + '';
    } else {
        query = 'SELECT COUNT(*) FROM model AS m INNER JOIN  teamModelAccess AS tma ';
        query = query + ' ON  m.id = tma.modelId WHERE m.isDeleted = 0 '
        query = query + ' AND m.statusId = 1 ';
        query = query + ' AND tma.modelId = ' + modelId + ' AND tma.teamId IN (';
        arr.forEach(function (teamId) {
            query = query + teamId + ',';
        });
        query = query.substr(0, query.length - 1);
        query = query + ');';
    }
    logger.debug(query);
    connection.query(query, function (err, out) {
        if (err) {
            return cb(err);
        }
        if (out) {
            result.count = out[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

PortfolioDao.prototype.assignModel = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("assign model in Portfolio", data);
    var query = 'UPDATE portfolio SET modelId = ' + data.modelId + ' WHERE id = ?';
    connection.query(query, [data.portfolioId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//validate accountIds For Portfolio [internally called]
PortfolioDao.prototype.validateAccountIds = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var accountIds = data.accountIds;
    var query = [];
    query.push('SELECT COUNT(*) from account WHERE isDeleted = 0 AND isDisabled = 0 AND id IN ( ');
    if (accountIds) {
        accountIds.forEach(function (accountId) {
            query.push(' ' + accountId + ' ,');
        }, this);
    }
    query.push(' null) ');
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        return cb(null, result[0]['COUNT(*)']);
    });
};

PortfolioDao.prototype.getPortfolioWithHoldingValue = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var arr = [];
    var result = [];
    var limitedAccess = data.portfolioLimitedAccess;
    var allAccess = data.portfolioAllAccess;
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is " + roleTypeId);
    logger.debug("limitedAccess is " + limitedAccess);
    logger.debug("allAccess is " + allAccess);
    var query = [];
    var accountQuery = [];
    query.push(' SELECT p.id, p.name, ');
    query.push(" (case when (p.createdBy = 0) THEN 'Advisor' ELSE 'Team' END) as source, ");
    query.push(' COALESCE(sum(po.quantity * SP.price),0) as value ,');
    query.push(' COALESCE(acc.accountId, NULL) AS accountId , ');
    query.push(' COALESCE(acc.accountNumber, NULL) AS accountNumber , ');
    query.push(' COALESCE(acc.name, NULL) AS accountName , ');
    query.push(' p.modelId AS modelId, ');
    query.push(' p.isSleevePortfolio AS sleevePortfolio, ');
    query.push(' p.isDeleted, ');
    query.push(' p.createdDate as createdOn,');
    query.push(' usCreated.userLoginId as createdBy, ');
    query.push(' p.editedDate as editedOn, ');
    query.push(' usEdited.userLoginId as editedBy ');

    query.push(' FROM portfolio as p ');
    query.push(" left outer join user as usCreated on usCreated.id = p.createdBy ");
    query.push(' AND usCreated.isDeleted = 0 ');
    query.push(" left outer join user as usEdited on usEdited.id = p.editedBy ");
    query.push(" left outer join account as acc on  p.id =acc.portfolioId");
    query.push(' AND acc.isDeleted = 0 ');
    query.push(" left outer join position as po on po.accountId = acc.id ");
    query.push(' AND po.isDeleted = 0 ');
    query.push(" left outer join securityPrice as SP on SP.securityId = po.securityId ");
    query.push(' AND SP.isDeleted = 0 ');
    if (roleTypeId !== enums.roleType.FIRMADMIN) {
        if (allAccess && allAccess.length === 0 && limitedAccess && limitedAccess.length > 0) {
            arr = limitedAccess;
            query.push(' INNER JOIN teamPortfolioAccess AS tpa ON p.id = tpa.portfolioId AND tpa.teamId IN (' + arr + ') AND tpa.isDeleted = 0 ');
        }
    }
    query.push(' WHERE 1=1 ');

    if (data.search) {
        data.search = data.search.replace(/\"/g, "'");
        query.push(' AND ( ');
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' (p.id= "' + data.search + '" OR ');
        }

        if (data.searchAccounts == 'true') {
            // if (data.search.match(/^[0-9]+$/g)) {
            query.push(' acc.accountNumber LIKE "%' + data.search + '%" OR ');
            // }
            // query.push(' acc.name LIKE "%' + data.search + '%" OR ');
        }

        query.push(' p.name LIKE "%' + data.search + '%" OR ');
        query.push(' p.tags LIKE "%' + data.search + '%" ');
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' ) ');
        }
        query.push(' ) ');
    }

    query.push(' AND p.isDeleted = 0 AND p.isDisabled = 0 ');
    query.push(' GROUP BY p.id ,p.name ');
    if (data.search) {
        query.push(' order BY p.name');
    }
    query = query.join("");
    logger.debug("Portfolio Search with holding value query: " + query);

    accountQuery.push(' SELECT portfolioId FROM account where 1=1 AND ');
    accountQuery.push(' accountNumber LIKE "%' + data.search + '%" ');
    accountQuery.push(' AND isDeleted = 0 AND isDisabled = 0 ');
    accountQuery = accountQuery.join("");

    logger.debug("Portfolio Search with holding value query: " + query);
    connection.query(query, function (err, portfolio) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        result.push(portfolio);
        if (data.searchAccounts == 'true') {
            connection.query(accountQuery, function (err, portfolio) {
                if (err) {
                    logger.error(err);
                    return cb(err);
                }
                result.push(portfolio);
                return cb(null, result);
            });
        } else {
            return cb(null, result);
        }
    });
};


PortfolioDao.prototype.getPortfoliosType = function (data, cb) {

    var firmConnection = baseDao.getConnection(data);

    var query = "select p.id, p.isSleevePortfolio as isSleeve from portfolio p where p.id in (?); ";

    firmConnection.query(query, [data.portfolioIds], function (err, rows, fields) {
        if (err) {
            logger.error("Error while executing Query : " + query + " in PortfolioDao.prototype.getPortfoliosType(). \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in PortfolioDao.prototype.getPortfoliosType().");
            return cb(err, rows);
        }
    });
};

//Allot Teams to Portfolio
PortfolioDao.prototype.allotTeamsToPortfolio = function (data, cb) {
    logger.info("Allotting Teams to Portfolio");
    var query = "CALL assignTeamToAllPortfolios";
    var reqId = unique.get(),
        cacheObject = {};
    data.reqId = reqId;
    localCache.put(reqId, cacheObject);

    baseDao.getDbConnection({ data: data }, function (err, resp) {
        if (err) {
            logger.error("Error in Portfolio Dao in function PortfolioDao.allotTeamsToPortfolio(). \n Error :" + err);
            return cb(err, null);
        } else {
            var connection = baseDao.getConnection(data);
            return connection.query(query, function (err, rows, fields) {
                if (err) {
                    logger.error("Error while executing Query : " + query + " in PortfolioDao.prototype.allotTeamsToPortfolio(). \n Error :" + err);
                    dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, { statusCode: 422 }, function (err, resp) { });
                    return cb(err, null);
                } else {
                    logger.info("Successfully executed Query : " + query + " in PortfolioDao.prototype.allotTeamsToPortfolio().");
                    dbConnection.requestFinishCleanupForFirm(reqId, cacheObject, { statusCode: 201 }, function (err, resp) {
                        return cb(err, "Success!!!");
                    });
                }
            });
        }
    })
};

PortfolioDao.prototype.getPortfolioNodes = function (data, cb) {

    var firmConnection = baseDao.getConnection(data);

    var query = "call getPortfolioNodes(?)";

    firmConnection.query(query, [data.portfolioId], function (err, rows, fields) {
        if (err) {
            logger.error("Error while executing Query : " + query + " in PortfolioDao.prototype.getPortfolioNodes(). \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in PortfolioDao.prototype.getPortfolioNodes().");
            return cb(err, rows);
        }
    });
};

//Get Account cash detail  by portfolio Id
PortfolioDao.prototype.getPortfolioDetailWithAccountCashSummary = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var userId = utilService.getAuditUserId(data.user);
    logger.info("Get account list with cash detail  associated to Portfolio dao: ");

    connection.query("CALL getPortfolioCashSummary(?,?)", [userId, data.id], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }

        return cb(null, result);

    });
};

//Get Portfolio Contribution Amount
PortfolioDao.prototype.getPortfolioContributionAmount = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var portfolioId = data.portfolioId;
    var userId = utilService.getAuditUserId(data.user);

    connection.query("CALL getPortfolioMarketValue (?, ?)", [userId, portfolioId], function (err, result) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        logger.debug("Contribution Amount Dao resposne is : " + JSON.stringify(result[0]));
        return cb(null, result[0]);
    });
};

module.exports = PortfolioDao;