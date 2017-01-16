"use strict";

var moduleName = __filename;

var squel = require("squel");
var squelUtils = require("service/util/SquelUtils.js");
var cache = require('service/cache').local;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var _ = require('lodash');

var custodianEntity = require("entity/custodian/Custodian.js");
var userEntity = require("entity/user/User.js");
var accountEntity = require("entity/account/Account.js");
var securityTypeEntity = require("entity/security/SecurityType1.js");
var tradeExecutionTypeEntity = require("entity/trade/TradeExecutionType.js");
var custodianTradeExecutionTypeForSecurityEntity = require("entity/custodian/CustodianTradeExecutionTypeForSecurity.js");
var custodianSecuritySymbolEntity = require("entity/custodian/CustodianSecuritySymbol.js");

var CustodianDao = function () { }

CustodianDao.prototype.getList = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = squel.select()
    .field(custodianEntity.columns.id,"id")
    .field(custodianEntity.columns.externalId,"externalId")
    .field(custodianEntity.columns.name,"name")
    .field(custodianEntity.columns.code,"code")
    .field(custodianEntity.columns.isDeleted,"isDeleted")
    .field(custodianEntity.columns.masterAccountNumber,"masterAccountNumber")
    .field(custodianEntity.columns.createdDate,"createdDate")
    .field(custodianEntity.columns.editedDate,"editedDate")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(custodianEntity.tableName)
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
               squelUtils.joinEql(userEntity.usCreated.id,custodianEntity.columns.createdBy)
              )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
               squelUtils.joinEql(userEntity.usEdited.id,custodianEntity.columns.editedBy)
              )
    .where(
        squel.expr().and(squelUtils.eql(1,1))
        .and(squelUtils.eql(custodianEntity.columns.isDeleted,0))
    );
    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.where(
                squel.expr().and(
                    squel.expr()
                    .or(squelUtils.eql(custodianEntity.columns.id,data.search))
                    .or(squelUtils.like(custodianEntity.columns.name,data.search))
                )
            )
        } else {
            query.where(
                squel.expr().and(
                    squelUtils.like(custodianEntity.columns.name,data.search)
                )
            )
        }
        query.order(custodianEntity.columns.name);
    }
    
    query = query.toString();

    logger.debug("Custodian get list Query: " + query);
    connection.query(query, function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }

        return cb(null, resultSet);
    });
};

CustodianDao.prototype.getDetail = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var isDeleted = null;
    if (data.isDeleted) {
        isDeleted = data.isDeleted;
    }
    var query = squel.select()
    .field(custodianEntity.columns.id,"id")
    .field(custodianEntity.columns.externalId,"externalId")
    .field(custodianEntity.columns.name,"name")
    .field(custodianEntity.columns.code,"code")
    .field(custodianEntity.columns.isDeleted,"isDeleted")
    .field(custodianEntity.columns.masterAccountNumber,"masterAccountNumber")
    .field(custodianEntity.columns.tradeExecutionTypeId,"custodianTradeExecutionTypeId")
    .field(custodianEntity.columns.createdDate,"createdDate")
    .field(custodianEntity.columns.editedDate,"editedDate")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .field(securityTypeEntity.columns.id,"securityTypeId")
    .field(securityTypeEntity.columns.name,"securityTypeName")
    .field(tradeExecutionTypeEntity.columns.id,"tradeExecutionTypeId")
    .field(tradeExecutionTypeEntity.columns.name,"tradeExecutionTypeName")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(custodianEntity.tableName)
    .left_join(custodianTradeExecutionTypeForSecurityEntity.tableName, null,squel.expr()
       .and(squelUtils.joinEql(custodianTradeExecutionTypeForSecurityEntity.columns.custodianId,custodianEntity.columns.id))
       .and(squelUtils.joinEql(custodianTradeExecutionTypeForSecurityEntity.columns.isDeleted,0))
    )
    .left_join(securityTypeEntity.tableName, null,squel.expr()
       .and(squelUtils.joinEql(securityTypeEntity.columns.id,custodianTradeExecutionTypeForSecurityEntity.columns.securityTypeId))
       .and(squelUtils.joinEql(securityTypeEntity.columns.isDeleted,0))
    )
    .left_join(tradeExecutionTypeEntity.tableName, null,squel.expr()
       .and(squel.expr()
           .or(squelUtils.joinEql(tradeExecutionTypeEntity.columns.id,custodianTradeExecutionTypeForSecurityEntity.columns.tradeExecutionTypeId))
           .or(squelUtils.joinEql(tradeExecutionTypeEntity.columns.id,custodianEntity.columns.tradeExecutionTypeId))
       )
       .and(squelUtils.joinEql(tradeExecutionTypeEntity.columns.isDeleted,0))
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,custodianEntity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,custodianEntity.columns.editedBy)
    )
    .where(
        squel.expr().and(squelUtils.eql(custodianEntity.columns.id,data.id))
    );
    if (data.search) {
        if (data.search.match(/^[0-9]+$/g)) {
            query.where(
                squel.expr().and(
                    squel.expr()
                    .or(squelUtils.eql(custodianEntity.columns.id,data.search))
                    .or(squelUtils.like(custodianEntity.columns.name,data.search))
                )
            )
        } else {
            query.where(
                squel.expr().and(
                    squelUtils.like(custodianEntity.columns.name,data.search)
                )
            )
        }
    }
    if (isDeleted && (isDeleted).match('^(true|false|1|0)$')) {
        query.where(
            squel.expr().and(squelUtils.eql(custodianEntity.columns.isDeleted,isDeleted))
        )
    }else{
        query.where(
            squel.expr().and(squelUtils.eql(custodianEntity.columns.isDeleted,0))
        )
    }
    query = query.toString();

    logger.debug("Custodian get detail Query: " + query);
    connection.query(query, function (err, resultSet) {
        if (err) {
            logger.error("Error: " + err);
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
CustodianDao.prototype.get = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = squel.select()
    .from(custodianEntity.tableName)
    .where(squel.expr()
        .and(squel.expr()
            .or(squelUtils.in(custodianEntity.columns.id,data.id))
            .or(squelUtils.eql(custodianEntity.columns.externalId,data.externalId))
         )
        .and(squelUtils.eql(custodianEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Custodian get Query"+query);
    var queryString = connection.query(query, function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
    
};

CustodianDao.prototype.getCustodianSecuritySymbol = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = squel.select()
    .from(custodianSecuritySymbolEntity.tableName)
    .where(squel.expr()
        .and(squelUtils.eql(custodianSecuritySymbolEntity.columns.custodianId,data.custodianId))
        .and(squelUtils.eql(custodianSecuritySymbolEntity.columns.securitySymbol,data.securitySymbol))
//        .and(squelUtils.eql(custodianSecuritySymbolEntity.columns.securityId,data.securityId))
        .and(squelUtils.eql(custodianSecuritySymbolEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Get custodian security symbol Query"+query);
    var queryString = connection.query(query, function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

CustodianDao.prototype.getCustodianAccountsCount = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Custodian Account Count Object", data);

    var query = squel.select()
    .field("count("+accountEntity.columns.accountId+")","count")
    .from(custodianEntity.tableName)
    .left_join(accountEntity.tableName, null,squel.expr()
       .and(squelUtils.joinEql(accountEntity.columns.custodianId,custodianEntity.columns.id))
    )
    .where(squel.expr()
        .and(squelUtils.eql(custodianEntity.columns.id,data.id))
        .and(squelUtils.eql(custodianEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Get custodian account countQuery: " + query);
    connection.query(query, function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
CustodianDao.prototype.getCustodianAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Custodian Account Object", data);

    var query = squel.select()
    .field(accountEntity.columns.accountId,"id")
    .field(accountEntity.columns.accountNumber,"accountNumber")
    .field(accountEntity.columns.name,"name")
    .field(accountEntity.columns.portfolioId,"portfolioId")
    .field(accountEntity.columns.createdDate,"createdDate")
    .field(accountEntity.columns.editedDate,"editedDate")
    .field(userEntity.usCreated.userLoginId,'createdBy')
    .field(userEntity.usEdited.userLoginId,'editedBy')
    .from(custodianEntity.tableName)
    .join(accountEntity.tableName, null,squel.expr()
       .and(squelUtils.joinEql(accountEntity.columns.custodianId,custodianEntity.columns.id))
    )
    .left_join(userEntity.tableName, userEntity.usCreated.alias,
       squelUtils.joinEql(userEntity.usCreated.id,accountEntity.columns.createdBy)
    )
    .left_join(userEntity.tableName, userEntity.usEdited.alias,
       squelUtils.joinEql(userEntity.usEdited.id,accountEntity.columns.editedBy)
    )
    .where(
        squel.expr().and(squelUtils.eql(custodianEntity.columns.id,data.id))
        .and(squelUtils.eql(custodianEntity.columns.isDeleted,0))
        .and(squelUtils.eql(accountEntity.columns.isDeleted,0))
    );
    query = query.toString();

    logger.debug("Get custodian account Query: " + query);
    connection.query(query, function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

CustodianDao.prototype.delete = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Custodian Delete Object", data);

    var queryData = {};
    queryData[custodianEntity.columns.isDeleted] = 1;
    queryData[custodianEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    queryData[custodianEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    var query = [];
    query.push(' UPDATE '+custodianEntity.tableName+' SET ? ');
    query.push(' where '+custodianEntity.columns.id+' = ? ');
    query.push('AND '+custodianEntity.columns.isDeleted+' = 0 ');
    query = query.join(" ");

    logger.debug("Delete custodian Query"+query);
    connection.query(query, [queryData, data.id], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};
CustodianDao.prototype.add = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();

    logger.debug("Custodian object", data);

    var queryData = {};
    queryData[custodianEntity.columns.name] = data.name;
    queryData[custodianEntity.columns.code] = data.code;
    queryData[custodianEntity.columns.externalId] = data.externalId;
    queryData[custodianEntity.columns.masterAccountNumber] = data.masterAccountNumber;
    queryData[custodianEntity.columns.orionFirmId] = data.user.firmId;
    queryData[custodianEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[custodianEntity.columns.tradeExecutionTypeId] = data.tradeExecutionTypeId;
    queryData[custodianEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[custodianEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[custodianEntity.columns.editedDate] = currentDate;
    queryData[custodianEntity.columns.createdDate] = currentDate;

    var query = 'INSERT INTO '+custodianEntity.tableName+' SET ?';

    logger.debug("Insert custodian Query"+query);
    connection.query(query, [queryData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};
CustodianDao.prototype.updateCustodian = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var tradeExecutionTypeId = data.tradeExecutionTypeId

    logger.debug("Custodian Update object", data);

    if (tradeExecutionTypeId && tradeExecutionTypeId > 0) {

    } else {
        tradeExecutionTypeId = -1;
    }
    var queryData = {}
    queryData[custodianEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[custodianEntity.columns.tradeExecutionTypeId] = tradeExecutionTypeId;
    queryData[custodianEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[custodianEntity.columns.editedDate] = currentDate;
    
    if (data.masterAccountNumber) {
        queryData[custodianEntity.columns.masterAccountNumber] = data.masterAccountNumber
    }
    if (data.externalId) {
        queryData[custodianEntity.columns.externalId] = data.externalId
    }
    if (data.name) {
        queryData[custodianEntity.columns.name] = data.name;
    }
    if (data.code) {
        queryData[custodianEntity.columns.code] = data.code;
    }
    var query = [];
    query.push(' Update '+custodianEntity.tableName+' SET ? ');
    query.push(' Where '+custodianEntity.columns.id+' = ? ');
    query.push(' AND '+custodianEntity.columns.isDeleted+'  = 0 ');
    query = query.join(" ");

    logger.debug("Update custodian Query"+query);
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
    var queryData = {};
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.custodianId] = data.id;
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.editedDate] = currentDate;
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.createdDate] = currentDate;
    
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
    query.push(' INSERT INTO '+custodianTradeExecutionTypeForSecurityEntity.tableName);
    query.push(' ('+custodianTradeExecutionTypeForSecurityEntity.columns.custodianId);
    query.push(','+custodianTradeExecutionTypeForSecurityEntity.columns.tradeExecutionTypeId+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.securityTypeId+',');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.isDeleted+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.createdBy+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.editedBy+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.editedDate+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.createdDate+') ');
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
    
    var trades = [];
    (data.tradeExecutions).forEach(function (tradeExecution) {
        var trade = [];
        trade.push(data.id);
        trade.push(tradeExecution.tradeExecutionTypeId);
        trade.push(tradeExecution.securityTypeId);
        trade.push(0);
        trade.push(utilService.getAuditUserId(data.user));
        trade.push(utilService.getAuditUserId(data.user));
        trade.push(currentDate);
        trade.push(currentDate);
        trades.push(trade);
    });

    var query = [];
    query.push('INSERT INTO ');
    query.push(custodianTradeExecutionTypeForSecurityEntity.tableName);
    query.push(' ('+custodianTradeExecutionTypeForSecurityEntity.columns.custodianId+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.tradeExecutionTypeId+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.securityTypeId+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.isDeleted+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.createdBy+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.editedBy+', ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.editedDate+', ');
    query.push( ' '+custodianTradeExecutionTypeForSecurityEntity.columns.createdDate+')  ');
    query.push(' VALUES ? ON DUPLICATE KEY UPDATE ');
    query.push(' '+custodianTradeExecutionTypeForSecurityEntity.columns.isDeleted+'=0 ');
    query.push(' , '+custodianTradeExecutionTypeForSecurityEntity.columns.tradeExecutionTypeId+' = ');
    query.push(' VALUES('+custodianTradeExecutionTypeForSecurityEntity.columns.tradeExecutionTypeId+')');
    query.push(' , '+custodianTradeExecutionTypeForSecurityEntity.columns.editedBy+' = ' + utilService.getAuditUserId(data.user));
    query.push(' , '+custodianTradeExecutionTypeForSecurityEntity.columns.editedDate+' = "' + currentDate + '" ');
    query.push(' , '+custodianTradeExecutionTypeForSecurityEntity.columns.createdBy+' = ' + utilService.getAuditUserId(data.user));
    query.push(' , '+custodianTradeExecutionTypeForSecurityEntity.columns.createdDate+' = "' + currentDate + '" ');
    query = query.join("");


    logger.debug("Update security trade execution type Query: " + query);
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
    
    var queryData = {};
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.isDeleted] = 1;
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.editedBy] = utilService.getAuditUserId(data.user);
    queryData[custodianTradeExecutionTypeForSecurityEntity.columns.editedDate] = currentDate;
   
    var query = [];
    query.push('Update '+custodianTradeExecutionTypeForSecurityEntity.tableName);
    query.push(' SET ? WHERE '+custodianTradeExecutionTypeForSecurityEntity.columns.custodianId+' = ? ');
    query.push(' AND '+custodianTradeExecutionTypeForSecurityEntity.columns.isDeleted+' = 0 ');

    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, [queryData, data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

CustodianDao.prototype.createCustdianSecuritySymbol = function (data, cb) {

    var connection = baseDao.getConnection(data);

    var queryData = {};
    queryData[custodianSecuritySymbolEntity.columns.custodianId] = data.custodianId ;
    queryData[custodianSecuritySymbolEntity.columns.securityId] = data.securityId ;
    queryData[custodianSecuritySymbolEntity.columns.securitySymbol] = data.securitySymbol ;
    queryData[custodianSecuritySymbolEntity.columns.isDeleted] = 0;
    queryData[custodianSecuritySymbolEntity.columns.createdDate] = utilDao.getSystemDateTime(null);
    queryData[custodianSecuritySymbolEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[custodianSecuritySymbolEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    queryData[custodianSecuritySymbolEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    var query = [];
    query.push(" INSERT INTO " + custodianSecuritySymbolEntity.tableName + " SET ? ");
    query.push(" ON DUPLICATE KEY UPDATE ? ");
    query = query.join(" ");

     logger.debug("Create custodian SecuritySymbol"+query);
    connection.query(query, [queryData, queryData], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

CustodianDao.prototype.updateCustdianSecuritySymbol = function (data, cb) {

    var connection = baseDao.getConnection(data);
    
    var queryData = {};
    queryData[custodianSecuritySymbolEntity.columns.custodianId] = data.custodianId ;
    queryData[custodianSecuritySymbolEntity.columns.securityId] = data.securityId ;
    queryData[custodianSecuritySymbolEntity.columns.securitySymbol] = data.securitySymbol ;
    queryData[custodianSecuritySymbolEntity.columns.isDeleted] = data.isDeleted ? data.isDeleted : 0;
    queryData[custodianSecuritySymbolEntity.columns.createdDate] = utilDao.getSystemDateTime(null);
    queryData[custodianSecuritySymbolEntity.columns.createdBy] = utilService.getAuditUserId(data.user);
    queryData[custodianSecuritySymbolEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    queryData[custodianSecuritySymbolEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    var query = [];
    query.push(" INSERT INTO TABLE " + custodianSecuritySymbolEntity.tableName);
    query.push(" SET ? ON DUPLICATE KEY UPDATE SET ? ");
    query.push(" WHERE "+ custodianSecuritySymbolEntity.columns.custodianId+" = ? ");
    query = query.join(" ");

    logger.debug("Update custodian SecuritySymbol"+query);
    connection.query(query,[queryData,queryData,data.custodianId], function (err, resultSet) {
        if (err) {
            return cb(err);
        }
        return cb(null, resultSet);
    });
};

CustodianDao.prototype.deleteCustdianSecuritySymbol = function (data, cb) {

    var connection = baseDao.getConnection(data);

    var securityIdsNotToDelete = data.idsNotToDelete;

    var updatedData = {};
    updatedData[custodianSecuritySymbolEntity.columns.isDeleted] = 1;
    updatedData[custodianSecuritySymbolEntity.columns.editedDate] = utilDao.getSystemDateTime(null);
    updatedData[custodianSecuritySymbolEntity.columns.editedBy] = utilService.getAuditUserId(data.user);

    var query = [];
    query.push(" UPDATE " + custodianSecuritySymbolEntity.tableName);
    query.push(" SET ? WHERE "+custodianSecuritySymbolEntity.columns.securityId+" = ? ");
    if (securityIdsNotToDelete && securityIdsNotToDelete.length > 0 && Array.isArray(securityIdsNotToDelete)) {
        query.push(" AND "+custodianSecuritySymbolEntity.columns.custodianId+" NOT IN (?) ");
    }
    query = query.join("");

    logger.debug("Delete custodian security symbol Query"+query);
    connection.query(query, [updatedData, data.securityId, securityIdsNotToDelete], function (err, resultSet) {
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