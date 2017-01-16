"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var baseDao = require('dao/BaseDao');
var util = require('util');
var utilDao = require('dao/util/UtilDao.js');
var utilService = new (require('service/util/UtilService'))();
var enums = require('config/constants/ApplicationEnum.js');
var PortfolioDao = function () {}

//Get Simple Portfolio List 
PortfolioDao.prototype.getSimplePortfolioList = function (data, cb) {
	var connection = baseDao.getConnection(data);
    var arr = [];
    var limitedAccess = data.portfolioLimitedAccess;
    var allAccess = data.portfolioAllAccess;
    var roleTypeId = data.user.roleTypeId;
    logger.debug("roleTypeId is "+roleTypeId);
    var query = [];
    query.push(' SELECT p.id, p.name, ');
    query.push(" (case when (p.createdBy = 0) THEN 'Advisor' ELSE 'Team' END) as source, ");
    query.push(' p.isDeleted, p.createdDate as createdOn, ');
    query.push(' usCreated.userLoginId as createdBy, ');
    query.push(' p.editedDate as editedOn, ');
    query.push(' usEdited.userLoginId as editedBy ');
    query.push(' FROM portfolio as p ');
    query.push(" left outer join user as usCreated on usCreated.id = p.createdBy ");
    query.push(" left outer join user as usEdited on usEdited.id = p.editedBy ");
    if(roleTypeId !== enums.roleType.FIRMADMIN){
        if(allAccess && allAccess.length ===0 && limitedAccess && limitedAccess.length > 0){
        	arr = limitedAccess; 
        	query.push(' INNER JOIN teamPortfolioAccess AS tpa ON p.id = tpa.portfolioId AND tpa.teamId IN (?) AND tpa.isDeleted = 0 ');    	
        }
    }
    query.push(' WHERE 1=1 ');
    
    if (data.search) {
        query.push(' AND ');
        if (data.search.match(/^[0-9]+$/g)) {
            query.push(' (p.id= "' + data.search + '" OR ');
        }
        query.push(' p.name LIKE "%' + data.search + '%" ');
        if (data.search.match(/^[0-9]+$/g)) {
             query.push(' ) ');
         }
    }

    query.push(' AND p.isDeleted = 0 ');
    
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, [ arr ], function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }

        return cb(null, data);
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
    if(data.search){
        // console.log("You are searching : "+data.search);
    }
    if(data.householdIds){
        // console.log("Your selected option : "+data.option);
    }
    if(data.newPortfolios){
        // console.log("Your searched Portfolio Status Id : "+data.newPortfolios);
    }
    if(data.status){
        // console.log("Your searched Portfolio Status Id : "+data.status);
    }
    if (data.isDeleted && (data.isDeleted).match('^(true|false|1|0)$')) {
        
    }

    var account = [];
    var model = "aggressive";
    var managedValue = 100000;
    var excludedValue = 90000;
    var totalValue = 190000;
    var action = "Rebalance";
    var tradesPending = true;
    var percentDeviations = 5;
    var cashPercent = 10;
    var cash = 10000;
    var isDeleted = 0;

    var accountDetails1 = {
        id : 1399,
        name : "PortfolioName1",
        account : "100333",
        managedValue : 100000,
        excludedValue : 5000,
        totalValue : 105000,
        tradePending : true,
        status : "active"
    };
    var accountDetails2 = {
        id : 1398,
        name : "PortfolioName2",
        account : "100334",
        managedValue : 200000,
        excludedValue : 6000,
        totalValue : 206000,
        tradePending : true,
        status : "active"
    };
    account.push(accountDetails1);
    account.push(accountDetails2);

    var portfolios1={
           id : 1,
           name : "Demo Portfolio 1",             
        //    account : account,            
           model : model,            
           team : "Team-One",            
           managedValue : 200000,            
           excludedValue : 50000,
           totalValue : 250000,            
           action : action,            
           tradesPending : false,            
           percentDeviations : 6,
           cashReserve : 900,
           cashNeed : 9,
           cash : 9000,
           cashPercent : 9,
           minCash : 900,
           minCashPercent : 9,
           totalCash : 9900,
           totalCashPercent : 30,
           autoRebalanceDate : "2016-09-01",
           OUB : false,
           contribution : 900,
           tradeBlocked : false,
           status : "Ok",
           TLH : false,
           advisor : "advisor",
           value : 9000,
           style : "oldView",
           lastRebalancedOn : "2016-09-01",
           isDeleted : isDeleted,
           createdOn : "2016-08-31 12:37:00",
           createdBy : "Primetgi 2",
           editedOn : "2016-09-01 12:37:00",
           editedBy : "Primetgi 2"
       };
    var portfolios2={
           id : 4,
           name : "Test Portfolio 2",             
        //    account : account,            
           model : model,            
           team : "Team-One",            
           managedValue : managedValue,            
           excludedValue : excludedValue,
           totalValue : totalValue,            
           action : action,            
           tradesPending : tradesPending,            
           percentDeviations : percentDeviations,
           cashReserve : 1000,
           cashNeed : 8,
           cash : cash,
           cashPercent : cashPercent,
           minCash : 1000,
           minCashPercent : 10,
           totalCash : 11000,
           totalCashPercent : 30,
           autoRebalanceDate : "2016-09-02",
           OUB : true,
           contribution : 1000,
           tradeBlocked : true,
           status : "Warning",
           TLH : true,
           advisor : "advisor",
           value : 10000,
           style : "newView",
           lastRebalancedOn : "2016-09-02",
           isDeleted : isDeleted,
           createdOn : "2016-09-01 12:37:50",
           createdBy : "Primetgi 1",
           editedOn : "2016-09-02 12:37:50",
           editedBy : "Primetgi 1"
       }
    var portfolioList=[];
        portfolioList.push(portfolios1);
        portfolioList.push(portfolios2);

    connection.query("CALL getPortfoliosForUser (?)",data.user.userId, function (err, result) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(null, result[0]);
    });
    // return cb(null, portfolioList);
};

//Get Portfolio Status
PortfolioDao.prototype.getStatus = function (data, cb) {
    var connection = baseDao.getConnection(data);

    var query = 'SELECT * FROM portfolioStatus';
    logger.debug("Query: " + query);

    connection.query(query, function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(null, data);
    });
};

//Get Details of particular Portfolio on the basis of PortfolioId 
PortfolioDao.prototype.getDetails = function (data, cb) {

    var id = data.id;
    var general = {
        portfolioName : "PortfolioName"+id,
        sleevePortfolio : false,
        modelId : 1,
        modelName : "M1001",
        tags : "tags"
    };

    var teams = [];
    var team1 = {
        id : 1,
        name : "Team-One",
        isPrimary : true
    };
    var team2 = {
        id : 2,
        name : "Team-Two",
        isPrimary : false
    };
    teams.push(team1);
    teams.push(team2);

    var issues = {
        outOfTolerance : 12,
        cashNeed : 1200000,
        setForAutoRebalance : true,
        contributions : 100,
        distribution : 4000,
        modelAssociation : true,
        blocked : false,
        TLHOpportunity : false,
        dataErrors : 15,
        pendingsTrades : 7
    };

    var totalCash = {
      total : 1750,
      reserve : 1000,
      cash : 750
      };
    var AUM = {
     total : 4000,
     managedValue : 1250,
     excludedValue : 1000,
     totalCash : {
         reserve : 1000,
         cash : 750,
         total : 1000 + 750
      }
     };
    var realized = {
     total : 400,
     shortTerm : 500,
     shortTermStatus  :"high",
     longTerm : 100,
     longTermStatus  :"low"
    };
    var summary = {
        AUM : AUM,
        realized : realized
    };
    
    var portfolio = {
        id : id,
        general : general,
        teams : teams,
        issues : issues,
        summary : summary,
        creatisDeletededDate : "",
        createdDate : "2016-09-02 12:21:39",
        createdBy : "ETL ETL",
        editedDate : "2016-09-02 12:21:39",
        editedBy : "ETL ETL",
    };
    return cb(null, portfolio);
};

//Get Portfolio account Summary in which this call will return count of accounts associated with portfolioId
PortfolioDao.prototype.getPortfolioAccountsSummary = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = {
        count : null
    };

    var query = 'SELECT COUNT(*) FROM account WHERE isDeleted = 0 AND portfolioId = '+data.id;
    logger.debug("Query: " + query);

    connection.query(query, function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        if(data){
            result.count = data[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

//Get Accounts List
PortfolioDao.prototype.getAccountsList = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var portfolioId = data.id;
    if(data.regular){
        // console.log("---API of regular----");
    }
    if(data.sma){
        // console.log("---API of sma----");
    }
    if(data.sleeved){
        // console.log("---API of sleeved----");
    }

    var account1 = {
        accountId : 123,
        accountName : "account1",
        accountNumber : "L05C900669",
        accountType : "IRC",
        managedValue : 10000,
        excludedValue : 9000,
        totalValue : 19000,
        pendingValue : 1000,
        status : "ok",
        createdOn : "",
        createdBy : "ETL ETL",
        editedOn : "",
        editedBy : "ETL ETL"
    };
    var account2 = {
        accountId : 124,
        accountName : "account2",
        accountNumber : "L05C900669",
        accountType : "IRC",
        managedValue : 10000,
        excludedValue : 9000,
        totalValue : 19000,
        pendingValue : 1000,
        status : "ok",
        createdOn : "",
        createdBy : "ETL ETL",
        editedOn : "",
        editedBy : "ETL ETL"
    };
    var accountList = [];
    accountList.push(account1);
    accountList.push(account2);

    connection.query("CALL getAccountDetailsForPortfolio (?)",data.id, function (err, result) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(null, result[0]);
    });

    // cb(null, accountList);
};

//Method for assigning portfolioId to accountIds in account Table
PortfolioDao.prototype.assginPortfolioToAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var accountIds = data.accountIds;
    var currentDate = utilDao.getSystemDateTime();
    var query = [];

    if(accountIds.length>0){
        query.push('UPDATE account SET portfolioId = '+data.id+' , editedBy = '+data.user.userId+' , editedDate = "'+currentDate+'" ');
        query.push(' WHERE id IN ( ');
        accountIds.forEach(function(accountId) {
            query.push(' '+accountId+' ,');
        }, this);
        query.push(' null) ');
    }
    query.push(' AND isDeleted = 0');
    
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(err, data.affectedRows);
    });
};

//Method for Un-Assigning portfolioId from all accountIds associated with that PortfolioId
PortfolioDao.prototype.unassginPortfolioFromAccounts = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var currentDate = utilDao.getSystemDateTime();
    var query = [];

    query.push('UPDATE account SET portfolioId = "null" , editedBy = '+data.user.userId+' , editedDate = "'+currentDate+'" ');
    query.push(' WHERE portfolioId = '+data.id+' AND isDeleted = 0 ');
    if(data.accountId){
        query.push(' AND id = '+data.accountId+' ');
    }
    query = query.join("");
    logger.debug("Query: " + query);
    connection.query(query, function (err, data) {
        if (err) {
        	logger.error(err);
            return cb(err);
        }
        return cb(err, data.affectedRows);
    });
};

//Get number of portfolios count on the basis of Portfolio Name [internally called]
PortfolioDao.prototype.getProtfolioCountById = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var result = {
        count : null
    };
    var query = 'SELECT COUNT(*) FROM portfolio WHERE (id IN (?)) AND isDeleted = 0 ';
    connection.query(query, [data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        if(data){
            result.count = data[0]['COUNT(*)'];
        }
        return cb(null, result);
    });
};

//Get number of Model count on the basis of ModelID [internally called]
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

//Create new Portfolio
PortfolioDao.prototype.addPortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Portfolio create object", data);
    var currentDate = utilDao.getSystemDateTime();
    var inputData = {
        name: data.name,
        modelId: data.modelId,
        isSleevePortfolio: data.isSleevePortfolio,
        tags: data.tags,
        isDeleted: data.isDeleted ? data.isDeleted : 0,
        createdBy: utilService.getAuditUserId(data.user),
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: currentDate,
        createdDate: currentDate
    };
    var query = 'INSERT INTO portfolio SET ? ';
    connection.query(query, [inputData], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Method used to set Primary Team in teamPortfolioAccess Table [internally called]
PortfolioDao.prototype.setPrimaryTeam = function (inputData, cb) {
    logger.debug("Set Primary team to Portfolio object", inputData);
    var connection = baseDao.getConnection(inputData);
    var currentDate = utilDao.getSystemDateTime();

    var arr = inputData.teamIds;
    var primary = inputData.primaryTeamId;
    var query = 'INSERT INTO teamPortfolioAccess(`teamId`,`portfolioId`,`access`,`isDeleted`,`createdDate`,`createdBy`,`editedDate`,`editedBy`,`isPrimary`,`source`) VALUES';
    var data = { 
        portfolioId : inputData.id,
        source : inputData.source,
        createdBy : utilService.getAuditUserId(inputData.user),
        isDeleted : inputData.isDeleted ? inputData.isDeleted : 0,
        editedBy : utilService.getAuditUserId(inputData.user),
        createdDate : currentDate,
        editedDate : currentDate
    };

    var queryData = data.portfolioId+',0,'+data.isDeleted+',"'+data.createdDate+'","'+data.createdBy+'","'+data.editedDate+'","'+data.editedBy+'"';
    arr.forEach(function(teamId) {
        if(teamId === primary){
            query = query + '('+teamId+','+queryData+',1,"'+data.source+'"),';
        } else {
            query = query + '('+teamId+','+queryData+',0,"'+data.source+'"),';
        }
    }, this);
    query = query.substr(0,query.length-1);
    query = query + ' ON DUPLICATE KEY UPDATE isDeleted=0 ;';

    connection.query(query, function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Deletes Portfolio on the basis of PortfolioId (if and only if there is no account associated with the portfolio)
PortfolioDao.prototype.deletePortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    logger.debug("Delete Portfolio", data);
    var queryData = {
        isDeleted: 1,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    }
    var query = 'UPDATE portfolio SET ? WHERE id = ? AND isDeleted = 0 ';
    connection.query(query, [queryData, data.id], function (err, data) {
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
    var queryData = {
        isDeleted: 1,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    }
    var query = 'UPDATE teamPortfolioAccess SET ? WHERE portfolioId = ? AND isDeleted = 0 ';
    connection.query(query, [queryData, data.id], function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(null, data);
    });
};

//Update Portfolio 
PortfolioDao.prototype.updatePortfolio = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var queryData = {
        id: data.id,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: utilDao.getSystemDateTime(null)
    };
    if (data.name !== null) {
        queryData["name"] = data.name;
    }
    if (data.modelId !== null) {
        queryData["modelId"] = data.modelId;
    }
    if (data.isSleevePortfolio !== null) {
        queryData["isSleevePortfolio"] = data.isSleevePortfolio;
    }
    if (data.tags !== null) {
        queryData["tags"] = data.tags;
    }
    
    var query = 'UPDATE portfolio SET ? WHERE id = ? AND isDeleted = 0 ';
    connection.query(query, [queryData, queryData.id], function (err, updated) {
        if (err) {
            return cb(err);
        }
        return cb(null, updated);
    });
    
};

//Updates Primary Team for Portfolio[internally called]
PortfolioDao.prototype.updatePrimaryTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var self=this;
    var arr = data.teamIds;
    var primary = data.primaryTeamId;
    var queryData = {
        portfolioId : data.id,
        editedBy : utilService.getAuditUserId(data.user),
        editedDate : utilDao.getSystemDateTime(null)
    };
    var query = 'UPDATE teamPortfolioAccess SET editedBy = '+queryData.editedBy+' , editedDate = "'+queryData.editedDate+'" , isPrimary = (CASE ';
    arr.forEach(function(teamId) {
        if(teamId === primary){
            query = query + ' WHEN teamId = '+teamId+' THEN 1 ';
        } else {
            query = query + ' WHEN teamId = '+teamId+' THEN 0 ';
        }
    });
    
    query = query + ' END) ';
    query = query + ' WHERE portfolioId = '+queryData.portfolioId ;
    logger.debug(query);
    connection.query(query, function (err, updated) {
        if (err) {
            return cb(err);
        }
        self.setPrimaryTeam(data,function(err,addNew){
            if(err){
               return cb(err);
            }
            self.removePrimaryTeam(data,function(err,deleteOld){
                if(err){
                    return cb(err);
                }
                  return cb(null, deleteOld);
            });
        });
    });
};

//Removes Primary Team for Portfolio[internally called]
PortfolioDao.prototype.removePrimaryTeam = function (data, cb) {
    var connection = baseDao.getConnection(data);
    var arr = data.teamIds;
    var queryData = {
        portfolioId : data.id,
        editedBy : utilService.getAuditUserId(data.user),
        editedDate : utilDao.getSystemDateTime(null)
    };
    var selectQuery='SELECT teamId FROM teamPortfolioAccess WHERE portfolioId =' +queryData.portfolioId +' AND '+'  teamId  NOT IN ( ';

        arr.forEach(function(teamId) {
            selectQuery=selectQuery + teamId + ',';
        });
        selectQuery = selectQuery.substr(0,selectQuery.length-1) ;
        selectQuery = selectQuery + ' ); ';
        logger.debug(selectQuery);
        connection.query(selectQuery, function (err, fetched) {
            if (err) {
                return cb(err);
            }
            var deleteQuery = '';   
            if(fetched && fetched.length > 0){
                 deleteQuery = 'UPDATE teamPortfolioAccess SET isPrimary = 0 , editedBy = '+queryData.editedBy+' , editedDate = "'+queryData.editedDate+'" ,  isDeleted = 1  WHERE ';
                    fetched.forEach(function(oldTeamId){
                   
                    deleteQuery = deleteQuery +  ' teamid = '+oldTeamId.teamId+ ' OR ';
                });
                deleteQuery = deleteQuery.substr(0,deleteQuery.length-3) +' AND ';
            }else{
                deleteQuery = 'UPDATE teamPortfolioAccess SET  editedBy = '+queryData.editedBy+' , editedDate = "'+queryData.editedDate+'" ,  isDeleted = 0  WHERE ';
            }
            deleteQuery = deleteQuery + 'portfolioId = '+queryData.portfolioId+' ;' ;
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

module.exports = PortfolioDao;