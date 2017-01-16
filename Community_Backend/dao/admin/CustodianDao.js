"use strict";

var moduleName = __filename;
var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var Custodian = require("entity/custodian/Custodian.js");
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var _ = require('lodash');

var CustodianDao = function () { }

CustodianDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = [];
    query.push(" SELECT CU.id,CU.externalId,CU.name,CU.code,CU.isDeleted, ");
    query.push(" CU.masterAccountNumber,CU.createdDate ");
    query.push(" ,usCreated.userLoginId as createdBy ");
    query.push(" ,CU.editedDate ");
    query.push(" ,usEdited.userLoginId as editedBy ");
    query.push(" FROM custodian as CU ");
    query.push(" left outer join user as usCreated on usCreated.id = CU.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = CU.editedBy ");
    query.push(" WHERE 1=1 ");

    if (data.search) {
        query.push(" AND ");
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(" (CU.id= '" + data.search + "' OR ");
        }
        query.push(" CU.name LIKE '%" + data.search + "%' ");
        if (data.search.match(/^[0-9]+$/g)) {
             query.push(' ) ');
         }
    }
    
    query.push(' AND CU.isDeleted = 0 ');

    query = query.join("");
    logger.debug("Query: " + query);

    connection.query(query, function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, new Custodian(resultSet));
    });
};

CustodianDao.prototype.getDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }
    var query = [];
    query.push(" SELECT CU.id,CU.externalId,CU.name,CU.code,CU.isDeleted,CU.masterAccountNumber,CU.tradeExecutionTypeId as custodianTradeExecutionTypeId  ");
    query.push(" ,ST.id as securityTypeId,ST.name as securityTypeName ");
    query.push(" ,TE.id as tradeExecutionTypeId,TE.name as tradeExecutionTypeName ");
    query.push(" ,CU.createdDate,usCreated.userLoginId as createdBy ");
    query.push(" ,CU.editedDate,usEdited.userLoginId as editedBy ");
    query.push(" FROM custodian as CU ");
    query.push(" left outer join custodianTradeExecutionTypeForSecurity as CT ");
    query.push(" on CT.custodianId = CU.id AND CT.isDeleted=0 ");
    query.push(" left outer join securityType as ST on ST.id = CT.securityTypeId AND ST.isDeleted=0 ");
    query.push(" left outer join tradeExecutionType as TE on TE.id = CT.tradeExecutionTypeId ");
    query.push(" OR TE.id = CU.tradeExecutionTypeId AND TE.isDeleted=0  ");
    query.push(" left outer join user as usCreated on usCreated.id = CU.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = CU.editedBy ");
    query.push(" WHERE CU.id=? ");


    if (data.search) {
        query.push(" AND ");
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(" CU.id= '" + data.search + "' OR ");
        }
        query.push(" CU.name LIKE '%" + data.search + "%' ");
    }
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.push(" AND CU.isDeleted = " + isDeleted);
    }else{
        query.push(' AND CU.isDeleted = 0 ');
    }
    query = query.join("");
    logger.debug("Query: " + query);

    connection.query(query, [data.id], function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }
        return cb(null, new Custodian(resultSet));
    });
};
CustodianDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT * FROM custodian WHERE (id IN (?) OR externalId IN (?)) AND isDeleted = 0 ';
    var queryString = connection.query(query, [data.id,data.externalId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, new Custodian(resultSet));
    });
    
};

CustodianDao.prototype.getCustodianSecuritySymbol = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var query = 'SELECT * FROM custodianSecuritySymbol WHERE (custodianId = ? AND securitySymbol = ? AND securityId != ? AND isDeleted = 0) ';
    var queryString = connection.query(query, [data.custodianId,data.securitySymbol, data.securityId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
 //   console.log(queryString.sql);
};

CustodianDao.prototype.getCustodianAccountsCount = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Custodian Account Count Object", data);
    var query = [];
    query.push(' SELECT count(AC.accountId) FROM custodian as CU ');
    query.push(' left outer join account as AC on AC.custodianId = CU.id ');
    query.push(' where CU.id = ? AND CU.isDeleted = 0 ');
    query = query.join("");

    logger.debug("Query: " + query);
    connection.query(query, [data.id], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
CustodianDao.prototype.getCustodianAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Custodian Account Object", data);
    var query = [];
    query.push(' SELECT AC.accountId as id,AC.accountNumber,AC.name,AC.portfolioId, ');
    query.push(' AC.isDeleted ');  
    query.push(' ,AC.createdDate,usCreated.userLoginId as createdBy ');
    query.push(' ,AC.editedDate,usEdited.userLoginId as editedBy ');
    query.push(' FROM custodian as CU ');
    query.push(' inner join account as AC on AC.custodianId = CU.id ');
    query.push(" left outer join user as usCreated on usCreated.id = AC.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = AC.editedBy ");
    query.push(' where CU.id = ? AND CU.isDeleted = 0 AND AC.isDeleted = 0 ');
    query = query.join("");

    logger.debug("Query: " + query);
    connection.query(query, [data.id], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

CustodianDao.prototype.delete = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Custodian Delete Object", data);
    var queryData = {
        isDeleted: 1,
        editedDate: utilDao.getSystemDateTime(null),
        editedBy: utilService.getAuditUserId(data.user)
    };
    var query = 'UPDATE custodian SET ? where id = ? AND isDeleted = 0 '
    connection.query(query, [queryData, data.id], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
CustodianDao.prototype.add = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Custodian before object", data);
    var data = new Custodian(data);
    logger.debug("Custodian object", data);
    var currentDate = utilDao.getSystemDateTime();
    var queryData = {
        name: data.name,
        code: data.code,
        externalId: data.externalId,
        masterAccountNumber: data.masterAccountNumber,
        orionFirmId: data.user.firmId,
        isDeleted: data.isDeleted ? data.isDeleted : 0,
        tradeExecutionTypeId: data.tradeExecutionTypeId,
        createdBy: utilService.getAuditUserId(data.user),
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: currentDate,
        createdDate: currentDate
    };
    var query = 'INSERT INTO custodian SET ?';
    connection.query(query, [queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
CustodianDao.prototype.updateCustodian = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var data = new Custodian(data);
    logger.debug("Custodian Update object", data);
    var currentDate = utilDao.getSystemDateTime();
    var tradeExecutionTypeId = data.tradeExecutionTypeId
    if (tradeExecutionTypeId && tradeExecutionTypeId > 0) {

    } else {
        tradeExecutionTypeId = -1;
    }
    var queryData = {
        isDeleted: data.isDeleted ? data.isDeleted : 0,
        tradeExecutionTypeId: tradeExecutionTypeId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: currentDate
    };
    if (data.masterAccountNumber) {
        queryData.masterAccountNumber = data.masterAccountNumber
    }
    if (data.externalId) {
        queryData.externalId = data.externalId
    }
    if (data.name) {
        queryData.name = data.name;
    }
    if (data.code) {
        queryData.code = data.code;
    }
    var query = 'Update custodian SET ? Where id = ? AND isDeleted  = 0';
    connection.query(query, [queryData, data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
CustodianDao.prototype.assignSecurityTradeExecutionType = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Assign Security Trade Execution Type object", data);
    var currentDate = utilDao.getSystemDateTime();
    var tradeExecutions = data.tradeExecutions;
    var queryData = {
        custodianId: data.id,
        isDeleted: data.isDeleted ? data.isDeleted : 0,
        createdBy: utilService.getAuditUserId(data.user),
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: currentDate,
        createdDate: currentDate
    };
    var trades = [];
    tradeExecutions.forEach(function (tradeExecution) {
        var trade = [];
        trade.push(queryData.custodianId);
        trade.push(tradeExecution.tradeExecutionTypeId);
        trade.push(tradeExecution.securityTypeId);
        trade.push(queryData.isDeleted);
        trade.push(queryData.createdBy);
        trade.push(queryData.editedBy);
        trade.push(queryData.editedDate);
        trade.push(queryData.createdDate);
        trades.push(trade);
    });
    var query = [];
    query.push(' INSERT INTO custodianTradeExecutionTypeForSecurity ');
    query.push(' (custodianId,tradeExecutionTypeId,securityTypeId,isDeleted,createdBy,editedBy,editedDate,createdDate) ');
    query.push(' VALUES ? ');
    query = query.join("");
    
    connection.query(query, [trades], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
CustodianDao.prototype.updateSecurityTradeExecutionType = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Update Security Trade Execution Type object", data);
    var currentDate = utilDao.getSystemDateTime();
    var queryData = {
        custodianId: data.id,
        isDeleted: 0,
        createdBy: utilService.getAuditUserId(data.user),
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: currentDate,
        createdDate: currentDate
    };
    var trades = [];
    (data.tradeExecutions).forEach(function (tradeExecution) {
        var trade = [];
        trade.push(queryData.custodianId);
        trade.push(tradeExecution.tradeExecutionTypeId);
        trade.push(tradeExecution.securityTypeId);
        trade.push(queryData.isDeleted);
        trade.push(queryData.createdBy);
        trade.push(queryData.editedBy);
        trade.push(queryData.editedDate);
        trade.push(queryData.createdDate);
        trades.push(trade);
    });

    var query = [];
    query.push('INSERT INTO custodianTradeExecutionTypeForSecurity (custodianId, ');
    query.push(' tradeExecutionTypeId,securityTypeId,isDeleted, ');
    query.push(' createdBy,editedBy,editedDate,createdDate)  ');
    query.push(' VALUES ? ON DUPLICATE KEY UPDATE isDeleted=0 ');
    query.push(' , tradeExecutionTypeId = VALUES(tradeExecutionTypeId)');
    query.push(' , editedBy = ' + queryData.editedBy + ' , editedDate = "' + queryData.editedDate + '" ');
    query.push(' , createdBy = ' + queryData.createdBy + ' , createdDate = "' + queryData.createdDate + '" ');
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, [trades], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
CustodianDao.prototype.removeSecurityTradeExecutionType = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Remove Security Trade Execution Type object", data);
    var currentDate = utilDao.getSystemDateTime();
    var queryData = {
        custodianId: data.id
    };
    var inputData = {
        isDeleted: 1,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: currentDate
    };
    var query = [];
    query.push('Update custodianTradeExecutionTypeForSecurity SET ? WHERE custodianId = ? AND isDeleted = 0 ');

    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, [inputData, queryData.custodianId], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

var tablesNames = [
	"custodianSecuritySymbol"
];

CustodianDao.prototype.createCustdianSecuritySymbol = function (data, cb) {

    var connection = baseDao.getConnection(data);

    var custodianEntity = _.omit(data, ["reqId"]);
    var custodianId = custodianEntity.custodianId;
    var query = [];

    query.push(" INSERT INTO " + tablesNames[0] + " SET ? ");
    query.push(" ON DUPLICATE KEY UPDATE ? ");

    var query = query.join("");

    connection.query(query, [custodianEntity, custodianEntity], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

CustodianDao.prototype.updateCustdianSecuritySymbol = function (data, cb) {

    var connection = baseDao.getConnection(data);

    var custodianEntity = _.omit(data, ["reqId"]);

    var custodianId = custodianEntity.custodianId;

    var query = " INSERT INTO TABLE " + tablesNames[0] + " SET " + custodianEntity
    " ON DUPLICATE KEY UPDATE SET " + custodianEntity + " WHERE custodianId = " + custodianId
    connection.query(query, function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

CustodianDao.prototype.deleteCustdianSecuritySymbol = function (data, cb) {

    var connection = baseDao.getConnection(data);

    var custodianEntity = _.omit(data, ["reqId"]);

    var custodianId = custodianEntity.securityId;

    var securityIdsNotToDelete = data.idsNotToDelete;

    var updatedData = {
        isDeleted: 1,
        editedDate: custodianEntity.editedDate,
        editedBy: custodianEntity.editedBy,
    };

    var query = [];
    query.push(" UPDATE " + tablesNames[0] + " SET ? WHERE securityId = ? ");

    if (securityIdsNotToDelete && securityIdsNotToDelete.length > 0 && Array.isArray(securityIdsNotToDelete)) {
        query.push(" AND custodianId NOT IN (?) ");
    }

    query = query.join("");

    connection.query(query, [updatedData, custodianId, securityIdsNotToDelete], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};


CustodianDao.prototype.getCustodianSummary  = function(data,cb){
    var connection = baseDao.getConnection(data);
    var query = "CALL getDashboardSummaryCustodians(?)" ;
    var currentUserId =data.user.userId;
    connection.query(query,[currentUserId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet[0][0]);
    });
};
module.exports = CustodianDao;