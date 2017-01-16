"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var util = require('util');
var _ = require('underscore');
var constants = config.applicationEnum;
var PortfolioConverter = require("converter/portfolio/PortfolioConverter.js");
var PortfolioDao = require('dao/portfolio/PortfolioDao.js');
var localCache = require('service/cache').local;
var enums = require('config/constants/ApplicationEnum.js');

var messages = config.messages;
var responseCode = config.responseCode;

var portfolioDao = new PortfolioDao();
var portfolioConverter = new PortfolioConverter();

var PortfolioService = function() { }

var teamIdNotExist = false;
var teamIdsNotExist = false;

PortfolioService.prototype.getSimplePortfolioList = function(data, cb) {
    logger.info("Get simple Portfolios list service called (getSimplePortfolioList())");

    var session = localCache.get(data.reqId).session;

    var allAccess = [];
    var limitedAccess = [];
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    if (data.includevalue == 'true') {
        portfolioDao.getPortfolioWithHoldingValue(data, function(err, fetched) {
            if (err) {
                logger.error("Error in getting simple portfolio list (getPortfolioWithHoldingValue()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            portfolioConverter.getPortResWithHoldingValue(fetched, function(err, result) {
                if (err) {
                    logger.error("Error in getting simple portfolio list after conversion (getPortfolioWithHoldingValue()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("account list returned successfully (getSimpleAccountList())");
                return cb(null, responseCode.SUCCESS, result);
            });
        });
    } else {
        portfolioDao.getSimplePortfolioList(data, function(err, result) {
            if (err) {
                logger.error("Error in getting simple portfolio list (getSimplePortfolioList()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("Simple Portfolios list returned successfully (getSimplePortfolioList())");
            return cb(null, responseCode.SUCCESS, result);
        });
    }

};

/*
PortfolioService.prototype.getList = function (data, cb) {
    logger.info("Get Portfolios list service called (getList())");
    portfolioDao.getList(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting Portfolios list (getList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            if (fetched[0]) {
                portfolioConverter.getResponseModelOfPortfolioSearch(fetched[1], function (err, searchResult) {
                    if (err) {
                        logger.error("Error in getting Portfolios list (getList())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    logger.info("Portfolios List returned successfully (getList())");
                    return cb(null, responseCode.SUCCESS, searchResult);
                });
            } else {
                portfolioConverter.getResponseModelOfPortfolioList(fetched[1], function (err, result) {
                    if (err) {
                        logger.error("Error in getting Portfolios list (getList())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    logger.info("Portfolios List returned successfully (getList())");
                    return cb(null, responseCode.SUCCESS, result);
                });
            }

        } else {
            logger.info("Empty Portfolios List returned (getList())");
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};
*/

PortfolioService.prototype.getList = function(data, cb) {
    logger.info("Get Portfolios list service called (getList())");
    portfolioDao.getList(data, function(err, fetched) {
        if (err) {
            logger.error("Error in getting Portfolios list (getList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            if (data.householdIds && !data.householdIds.match(/^[0-9]+$/g)) {
                return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " of householdIds" });
            } else if (fetched[0]) {
                portfolioConverter.getResponseModelOfPortfolioSearch(fetched[1], function(err, searchResult) {
                    if (err) {
                        logger.error("Error in getting Portfolios list (getList())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    } else if (data.id) {
                        if (searchResult.length > 0) {
                            logger.info("Portfolios Data returned successfully (getList())");
                            return cb(null, responseCode.SUCCESS, searchResult[0]);
                        } else {
                            logger.debug("Portfolio does not exist (getDetails()) " + data.id);
                            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
                        }
                    }
                    logger.info("Portfolios List returned successfully (getList())");
                    return cb(null, responseCode.SUCCESS, searchResult);
                });
            } else {
                portfolioConverter.getResponseModelOfPortfolioList(fetched[1], function(err, result) {
                    if (err) {
                        logger.error("Error in getting Portfolios list (getList())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    logger.info("Portfolios List returned successfully (getList())");
                    return cb(null, responseCode.SUCCESS, result);
                });
            }
        } else {
            logger.info("Empty Portfolios List returned (getList())");
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

PortfolioService.prototype.getDetails = function(data, cb) {
    logger.info("Get Portfolio Details service called (getDetails())");
    portfolioDao.getDetails(data, function(err, fetched) {
        var sqlError = fetched[0][0] ? (fetched[0][0]['sql_error'] ? true : false) : true;
        if (err || sqlError) {
            if (!err) {
                logger.error("Error from SP (getDetails()) " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.error("Error in getting Portfolio Details (getDetails()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched[0][0]['code'] != '0') {
            portfolioConverter.getResponseModelOfPortfolioDetails(fetched, function(err, result) {
                if (err) {
                    logger.debug("Error in Portfolios Details during conversion (getDetails()) " + err);
                    return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
                }
                logger.info("Portfolios List returned successfully (getDetails())");
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.debug("Portfolio does not exist (getDetails()) " + data.id);
            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
        }
    });
};

PortfolioService.prototype.getAccountsList = function(data, cb) {
    logger.info("Get Accounts list service called (getAccountsList())");
    portfolioDao.getAccountsList(data, function(err, fetched) {
        if (err) {
            logger.error("Error in getting Accounts list (getAccountsList()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            portfolioConverter.getResponseModelOfSleevedAccountList(fetched, function(err, result) {
                if (err) {
                    logger.error("Error in Accounts list Conversion (getAccountsList()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                } if (result && result.length > 0) {
                    logger.info("Accounts List returned successfully (getAccountsList())");
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    logger.info("Accounts List returned successfully (getAccountsList())");
                    return cb(null, responseCode.SUCCESS, []);
                }
            });
        } else {
            logger.debug("Portfolio does not exist (getAccountsList()) " + data.id);
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

PortfolioService.prototype.getAccountsListSimple = function(data, cb) {
    logger.info("Get Accounts list simple service called (getAccountsListSimple())");
    portfolioDao.getAccountsListSimple(data, function(err, fetched) {
        if (err) {
            logger.error("Error in getting Accounts list simple (getAccountsListSimple()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }

        if (fetched && fetched.length > 0) {
            portfolioConverter.getResponseModelOfSleevedAccountListSimple(fetched, function(err, result) {
                if (err) {
                    logger.error("Error in Accounts list simple Conversion (getAccountsListSimple()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                } if (result && result.length > 0) {
                    logger.info("Accounts List simple returned successfully (getAccountsListSimple())");
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    logger.info("Accounts List simple returned successfully (getAccountsListSimple())");
                    return cb(null, responseCode.SUCCESS, []);
                }
            });
        } else {
            logger.debug("Portfolio does not exist (getAccountsListSimple()) " + data.id);
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

PortfolioService.prototype.getSleevedAccountsList = function(data, cb) {
    logger.info("Get Sleeved Accounts list service called (getSleevedAccountsList())");
    portfolioDao.getSleevedAccountsList(data, function(err, fetched) {
        if (err) {
            logger.error("Error in getting Sleeved Accounts list (getSleevedAccountsList()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched) {
            portfolioConverter.getResponseModelOfSleevedAccountList(fetched, function(err, result) {
                if (err) {
                    logger.error("Error in Sleeved Accounts list Conversion (getSleevedAccountsList()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                } if (result && result.length > 0) {
                    logger.info("Sleeved Accounts List returned successfully (getSleevedAccountsList())");
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    logger.info("Sleeved Accounts List returned successfully (getSleevedAccountsList())");
                    return cb(null, responseCode.SUCCESS, []);
                }
            });
        } else {
            logger.debug("Portfolio does not exist (getSleevedAccountsList()) " + data.id);
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

PortfolioService.prototype.assignPortfolioToAccounts = function(data, cb) {
    logger.info("Assign Portfolio to accounts service called (assignPortfolioToAccounts())");
    data.accountIds = _.uniq(data.accountIds);
    var accountIds = data.accountIds;
    var session = localCache.get(data.reqId).session;

    var allAccess = [];
    var limitedAccess = [];
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    var self = this;
    self.portfolioExist(data, function(err, recordExist) {
        if (err) {
            logger.error("Error in verifying PortfolioId (assignPortfolioToAccounts()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (recordExist) {
            self.validateAccountIds(data, function(err, ValidAccountIds) {
                if (err) {
                    logger.error("Error in verifying PortfolioId (assignPortfolioToAccounts()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (ValidAccountIds == accountIds.length && ValidAccountIds > 0) {
                    portfolioDao.assignPortfolioToAccounts(data, function(err, result) {
                        if (err) {
                            logger.error("Error in assigning Portfolio to accounts (assignPortfolioToAccounts()) " + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (result === 0) {
                            return cb(null, responseCode.SUCCESS, { "message": messages.portfolioNotAssignedWithAccounts });
                        }
                        logger.info("Assign Portfolio to accounts service returned successfully (assignPortfolioToAccounts())");
                        return cb(null, responseCode.SUCCESS, { "message": messages.portfolioAssignedToAccounts });
                    });
                } else {
                    logger.debug("Account Ids does not exists (assignPortfolioToAccounts)");
                    return cb(messages.AccountIdsNotFound, responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.debug("Portfolio does not exist (assignPortfolioToAccounts()) " + data.id);
            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
        }
    });
};

PortfolioService.prototype.unAssignPortfolioFromAccounts = function(data, cb) {
    logger.info("Un-Assign Portfolio from accounts service called (unAssignPortfolioFromAccounts())");
    var accountIds = [];
    if (data.accountIds) {
        data.accountIds = _.uniq(data.accountIds);
        accountIds = data.accountIds;
    }

    var session = localCache.get(data.reqId).session;

    var allAccess = [];
    var limitedAccess = [];
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    var self = this;
    self.portfolioExist(data, function(err, recordExist) {
        logger.debug("Validating portfolio service called (unAssignPortfolioFromAccounts())");
        if (err) {
            logger.error("Error in verifying PortfolioId (unAssignPortfolioFromAccounts())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (recordExist) {
            self.validateAccountIds(data, function(err, ValidAccountIds) {
                if (err) {
                    logger.error("Error in verifying PortfolioId (unAssignPortfolioFromAccounts()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (ValidAccountIds === accountIds.length) {
                    portfolioDao.unAssignPortfolioFromAccounts(data, function(err, result) {
                        if (err) {
                            logger.error("Error in UnAssigning Portfolio from accounts (unAssignPortfolioFromAccounts()) " + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (result === 0) {
                            logger.info("Failed to UnAssign Portfolio from accounts in service (unAssignPortfolioFromAccounts())");
                            return cb(messages.portfolioNotUnAssignedFromAccounts, responseCode.UNPROCESSABLE);
                        }

                        logger.info("UnAssign Portfolio from accounts service returned successfully (unAssignPortfolioFromAccounts())");
                        return cb(null, responseCode.SUCCESS, { "message": messages.portfolioUnAssignedFromAccounts });
                    });
                } else {
                    logger.debug("Account Ids does not exists (unAssignPortfolioFromAccounts)");
                    return cb(messages.AccountIdsNotFound, responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.error("Portfolio does not exist (unAssignPortfolioFromAccounts()) " + data.id);
            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
        }
    });
};

PortfolioService.prototype.getPortfolioAccountsSummary = function(data, cb) {
    logger.info("Get Portfolio accounts summary service called (getPortfolioAccountsSummary())");
    var self = this;
    var output = {
        count: 0
    };
    portfolioDao.getPortfolioAccountsSummary(data, function(err, result) {
        if (err) {
            logger.error("Error in getting Portfolio accounts summary (()): " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result && result.length > 0) {
            output.count = result.length;
        }
        logger.info("Portfolio accounts summary returned successfully (getPortfolioAccountsSummary())");
        return cb(null, responseCode.SUCCESS, output);
    });
};

PortfolioService.prototype.getStatus = function(data, cb) {
    logger.info("Get Portfolio Status service called (getStatus())");
    portfolioDao.getStatus(data, function(err, result) {
        if (err) {
            logger.error("Error in getting portfolio Status (getTypesStatus())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Portfolio Status service returned successfully (getStatus())");
        return cb(null, responseCode.SUCCESS, result);
    });
};

PortfolioService.prototype.addPortfolio = function(data, cb) {
    logger.info("Create portfolio service called  (addPortfolio())");
    var self = this;
    if (data.name && data.name.length > 0 && data.name != 'null' && data.name != "''" && data.name.trim() && data.teamIds.length > 0) {
        self.teamsExist(data, function(err, found) {
            if (err) {
                logger.error("Error in verifying Teams (addPortfolio()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (found) {
                // if (data.modelId) {
                self.modelExist(data, function(err, fetched) {
                    if (err) {
                        logger.error("Error in verifying Models (addPortfolio()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (fetched) {
                        self.createPortfolio(data, function(err, output) {
                            if (err) {
                                logger.error("Error in portfolio creation (addPortfolio()) " + err);
                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            return cb(null, responseCode.CREATED, output);
                        });
                    } else {
                        logger.debug("Model Not exist (addPortfolio()) " + data.modelId);
                        return cb(messages.portfolioModelNotFound, responseCode.NOT_FOUND);
                    }
                });
                // } else {
                //     self.createPortfolio(data, function(err, output) {
                //         if (err) {
                //             logger.error("Error in portfolio creation (addPortfolio()) " + err);
                //             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                //         }
                //         return cb(null, responseCode.CREATED, output);
                //     });
                // }
            } else if (teamIdNotExist) {
                teamIdNotExist = false;
                logger.error("Error in primaryTeamId as it does not exists teamIds(addPortfolio())");
                return cb(messages.primaryTeamIdNotFound, responseCode.NOT_FOUND);
            } else if (teamIdsNotExist) {
                teamIdsNotExist = false;
                logger.error("Teams from TeamIds Not exist (addPortfolio())");
                return cb(messages.teamIdNotFound, responseCode.NOT_FOUND);
            } else {
                logger.error("Teams from TeamIds Not exist (addPortfolio())");
                return cb(messages.teamIdNotFound, responseCode.NOT_FOUND);
            }
        });
    } else if (!data.teamIds.length > 0) {
        logger.error("teamIds can not be null or empty (updatePortfolio())");
        return cb(messages.portfolioTeamIdsEmpty, responseCode.UNPROCESSABLE);
    } else {
        logger.error("Portfolio name can not be null or empty (addPortfolio())");
        return cb(messages.portfolioNameEmpty, responseCode.UNPROCESSABLE);
    }
};

PortfolioService.prototype.deletePortfolio = function(data, cb) {
    logger.info("Delete Portfolio service called (deletePortfolio())");
    var self = this;
    self.validateSleevedPortfolios(data, function(err, sleevedExist) {
        if (err) {
            logger.error("Error in verifying Sleeved Portfolios(deletePortfolio()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (sleevedExist.length > 0) {
            data.ids = sleevedExist;
            self.getPortfolioAccountsSummary(data, function(err, code, fetched) {
                if (err) {
                    logger.error("Getting portfolio association (deletePortfolio())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (fetched.count > 0) {
                    logger.debug("Number of Accounts associated with Portfolio(deletePortfolio()) " + fetched.count);
                    return cb(messages.portfolioAccountAssociated, responseCode.UNPROCESSABLE);
                }
                portfolioDao.deletePortfolio(data, function(err, result) {
                    if (err) {
                        logger.error("Error in Deleting Portfolio (deletePortfolio()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (result.affectedRows > 0) {
                        portfolioDao.removePortfolioAssociatedToTeam(data, function(err, teamRemoved) {
                            if (err) {
                                logger.error("Error In Removing portfolio PrimaryTeam (deletePortfolio()) " + err);
                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            // if (teamRemoved.affectedRows > 0) {
                            logger.info("Portfolio deleted successfully (deletePortfolio()) " + data.ids);
                            return cb(null, responseCode.SUCCESS, { "message": messages.portfolioDeleted });
                            //   return cb(messages.portfolioDeleted, responseCode.SUCCESS);
                            // }
                        });
                    }
                    else {
                        logger.debug("Portfolio does not exist(deletePortfolio()) with Id : " + data.id);
                        return cb(messages.PortfolioNotFoundOrDeleted, responseCode.UNPROCESSABLE);
                    }
                });
            });
        }
        else {
            logger.debug("Some portfolios are sleeved so it can not be deleted(deletePortfolio()) with Ids : " + data.ids);
            return cb(messages.sleevedPortfolioNotBeDeleted, responseCode.UNPROCESSABLE);
        }
    });
};

PortfolioService.prototype.setPrimaryTeam = function(data, cb) {
    logger.info("Set Primary team in Portfolio service called (setPrimaryTeam())");
    portfolioDao.setPrimaryTeam(data, function(err, result) {
        if (err) {
            logger.error("Error in set Primary team in Portfolio(setPrimaryTeam()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.affectedRows > 0) {
            logger.info("Primary team is assigned to portfolio successfully (setPrimaryTeam())");
            return cb(null, responseCode.SUCCESS, result);
        } else {

            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
    });
};

PortfolioService.prototype.updatePortfolio = function(data, cb) {
    var invalidTeamIds = _.difference(data.teamIds, data.user.teamIds);
    var invalidTeamId = _.indexOf(data.teamIds, data.primaryTeamId);
    logger.info("Update Portfolio service called (updatePortfolio())");
    var self = this;
    if (data.name && data.name.length > 0 && data.name != 'null' && data.name != "''" && data.name.trim() && data.teamIds.length > 0) {
        self.portfolioExist(data, function(err, recordExist) {
            if (err) {
                logger.error("Error in verifying PortfolioId (updatePortfolio()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (recordExist) {
                self.validateSleevedPortfolios(data, function(err, sleevedExist) {
                    if (err) {
                        logger.error("Error in verifying Sleeved Portfolios(updatePortfolio()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (sleevedExist.length > 0) {
                        data.source = 'Team';
                        self.teamsExist(data, function(err, found) {
                            if (err) {
                                logger.error("Error in verifying Teams (updatePortfolio()) " + err);
                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            if (found) {
                                // if (data.modelId) {
                                self.modelExist(data, function(err, fetched) {
                                    if (err) {
                                        logger.error("Error in verifying Models (updatePortfolio()) " + err);
                                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    if (fetched) {
                                        self.editPortfolio(data, function(err, output) {
                                            if (err) {
                                                logger.error("Error in portfolio editPortfolio  (updatePortfolio()) " + err);
                                                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                            }
                                            return cb(null, responseCode.SUCCESS, output);
                                        });
                                    } else {
                                        logger.error("Model Not exist (updatePortfolio()) " + data.modelId);
                                        return cb(messages.portfolioModelNotFound, responseCode.NOT_FOUND);
                                    }
                                });
                                // } else {
                                //     self.editPortfolio(data, function (err, output) {
                                //         if (err) {
                                //             logger.error("Error in portfolio editPortfolio  (updatePortfolio()) " + err);
                                //             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                //         }
                                //         return cb(null, responseCode.SUCCESS, output);
                                //     });
                                // }
                            } else if (teamIdNotExist) {
                                teamIdNotExist = false;
                                logger.error("Error in primaryTeamId as it does not exists teamIds(updatePortfolio())");
                                return cb(messages.primaryTeamIdNotFound, responseCode.NOT_FOUND);
                            } else if (teamIdsNotExist) {
                                teamIdsNotExist = false;
                                logger.error("Teams from TeamIds Not exist (updatePortfolio())");
                                return cb(messages.teamIdNotFound, responseCode.NOT_FOUND);
                            } else {
                                logger.error("Teams from TeamIds Not exist (updatePortfolio())");
                                return cb(messages.teamIdNotFound, responseCode.NOT_FOUND);
                            }
                        });
                    }
                    else {
                        logger.debug("Sleeved portfolios can not be deleted(updatePortfolio()) with Ids : " + data.id);
                        return cb(messages.sleevedPortfolioNotBeUpdated, responseCode.UNPROCESSABLE);
                    }
                });
            }
            else {
                logger.error("Portfolio does not exist (updatePortfolio()) " + data.id);
                return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
            }
        });
    } else if (!data.teamIds.length > 0) {
        logger.error("teamIds can not be null or empty (updatePortfolio())");
        return cb(messages.portfolioTeamIdsEmpty, responseCode.UNPROCESSABLE);
    } else {
        logger.error("Portfolio name can not be null or empty (updatePortfolio())");
        return cb(messages.portfolioNameEmpty, responseCode.UNPROCESSABLE);
    }
};

PortfolioService.prototype.updatePrimaryTeam = function(data, cb) {
    logger.info("Update Primary team in Portfolio service called (updatePrimaryTeam())");
    portfolioDao.updatePrimaryTeam(data, function(err, result) {
        if (err) {
            logger.error("Error in update Primary team in Portfolio(updatePrimaryTeam()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.affectedRows > 0) {
            return cb(null, responseCode.SUCCESS, result);
        } else {
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
    });
};

PortfolioService.prototype.createPortfolio = function(data, cb) {
    var self = this;
    portfolioDao.addPortfolio(data, function(err, result) {
        if (err) {
            logger.error("Error in Adding portfolio (createPortfolio()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        data.id = result.insertId;
        data.source = 'Team';
        if (data.id) {
            self.setPrimaryTeam(data, function(err, code, assignedId) {
                if (err) {
                    logger.error("Error in portfolio setPrimaryTeam  (createPortfolio()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                else {
                    logger.info("Portfolio created successfully  (createPortfolio())");
                    self.getDetails(data, function(err, code, out) {
                        if (err) {
                            return cb(err, code);
                        }
                        return cb(null, out);
                    });
                }
            });
        } else {
            logger.error("Unable to create portfolio (createPortfolio()) " + err);
            return cb(messages.portfolioNotCreated, responseCode.UNPROCESSABLE);
        }
    });
};

PortfolioService.prototype.editPortfolio = function(data, cb) {
    var self = this;
    portfolioDao.updatePortfolio(data, function(err, updated) {
        if (err) {
            logger.error("Error in updating Portfolio without model Id (editPortfolio()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } else {
            if (updated.affectedRows > 0) {
                self.updatePrimaryTeam(data, function(err, code, updatePortfolioTeam) {
                    if (err) {
                        logger.error("Error in portfolio updatePrimaryTeam  (editPortfolio()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    else {
                        logger.info("Portfolio updated successfully  (editPortfolio())");
                        self.getDetails(data, function(err, code, out) {
                            if (err) {
                                return cb(err, code);
                            }
                            return cb(null, out);
                        });
                    }
                });
            }
        }
    });
};

PortfolioService.prototype.portfolioExist = function(data, cb) {
    var status = false;
    // var invalidPortfolioIds = _.difference(data.ids, data.PortfolioIds);
    portfolioDao.getPortfolioCountById(data, function(err, fetched) {
        if (err) {
            logger.error("Error in getting Portfolio exist (portfolioExist()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0 && fetched) {
            status = true;
            return cb(null, status, fetched);
        } else {
            status = false;
            return cb(null, status, fetched);
        }
    });
};

PortfolioService.prototype.validateSleevedPortfolios = function(data, cb) {
    logger.info("Validate Sleeved Portfolio service called (validateSleevedPortfolios())");
    portfolioDao.validateSleevedPortfolios(data, function(err, fetched) {
        if (err) {
            logger.error("Error in validate sleeved Portfolio (validateSleevedPortfolios()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched && fetched.length > 0) {
            return cb(null, fetched);
        } else {
            return cb(null, fetched);
        }
    });
};

PortfolioService.prototype.teamsExist = function(data, cb) {
    var status = false;
    var roleTypeId = data.user.roleTypeId;
    var invalidTeamIds = _.difference(data.teamIds, data.user.teamIds);
    var invalidTeamId = _.indexOf(data.teamIds, data.primaryTeamId);

    if (roleTypeId === enums.roleType.FIRMADMIN) {
        portfolioDao.validateTeamsForPortfolio(data, function(err, fetched) {
            if (err) {
                logger.error("Error in getting Team count (teamExist()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched.length > 0 && fetched) {
                var checkTeamIds = _.difference(data.teamIds, fetched);
                // var checkTeamId = _.indexOf(fetched, data.primaryTeamId);
                if (!(checkTeamIds && checkTeamIds.length > 0) && invalidTeamId >= 0) {
                    status = true;
                    return cb(null, status);
                } else if (checkTeamIds && checkTeamIds.length > 0) {
                    teamIdsNotExist = true;
                    return cb(null, false);
                } else if (invalidTeamId < 0) {
                    teamIdNotExist = true;
                    return cb(null, false);
                }
            } else {
                return cb(null, status);
            }
        });
    } else if (!(invalidTeamIds && invalidTeamIds.length > 0) && invalidTeamId >= 0) {
        status = true;
        return cb(null, status);
    } else if (invalidTeamId < 0) {
        teamIdNotExist = true;
        return cb(null, false);
    } else if (invalidTeamIds && invalidTeamIds.length > 0) {
        teamIdsNotExist = true;
        return cb(null, false);
    } else {
        return cb(null, false);
    }
};

PortfolioService.prototype.modelExist = function(data, cb) {
    var status = false;
    if (data.modelId) {
        portfolioDao.validateModelForPortfolio(data, function(err, fetched) {
            if (err) {
                logger.error("Error in getting Model count (modelExist()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched.count > 0) {
                status = true;
                return cb(null, status);
            } else {
                return cb(null, false);
            }
        });
    } else {
        status = true;
        return cb(null, status);
    }
};

PortfolioService.prototype.validateAccountIds = function(data, cb) {
    logger.info("Validate Account ids service called (validateAccountIds())");
    // var accountIds = data.accountIds;
    portfolioDao.validateAccountIds(data, function(err, fetched) {
        if (err) {
            logger.error("Error in validate Account ids (validateAccountIds()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        return cb(null, fetched);
    });
};

PortfolioService.prototype.getPortfoliosType = function(data, cb) {
    logger.info("Get portfolios type by ids (getPortfoliosType())");
    // var accountIds = data.accountIds;
    portfolioDao.getPortfoliosType(data, function(err, fetched) {
        if (err) {
            logger.error("Error in getting portfolios type(getPortfoliosType()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        
        var length = fetched.length;
        for(var i = 0; i < length; i++){
        	if(fetched[i].isSleeve == true) {
        		fetched[i]["type"] = constants.portfolioType.SLEEVE_PORTFOLIO;
        	} else {
        		fetched[i]["type"] = constants.portfolioType.NORMAL_PORTFOLIO;
        	}
        }
        
        return cb(null, fetched);
    });
};

//PortfolioService.prototype.getPortfolioNodes = function(data, cb) {
//    logger.info("Get portfolios nodes (getPortfolioNodes())");
//    
//    var fetched=
//    		{
//    			  "portfolioId": 1,
//    			  "modelId": 604,
//    			  "levels": [
//    			    {
//    			      "level": "0",
//    			      "subModels": [
//    			        {
//    			          "id": 343685,
//    			          "subModelName": "asddf"
//    			        }
//    			      ]
//    			    },
//    			    {
//    			      "level": "1",
//    			      "subModels": [
//    			        {
//    			          "id": 343684,
//    			          "subModelName": "Test ModDedld d13"
//    			        }
//    			      ]
//    			    },
//    			    {
//    			      "level": "2",
//    			      "subModels": [
//    			        {
//    			          "id": 343684,
//    			          "subModelName": "Test ModDedld d13"
//    			        },
//    			        {
//    			          "id": 343682,
//    			          "subModelName": "Test Moddeld 13"
//    			        },
//    			        {
//    			          "id": 343683,
//    			          "subModelName": "SSd1"
//    			        }
//    			      ]
//    			    },
//    			    {
//    			      "level": "3",
//    			      "subModels": [
//    			        {
//    			          "id": 343684,
//    			          "subModelName": "Test ModDedld d13"
//    			        },
//    			        {
//    			          "id": 343682,
//    			          "subModelName": "Test Moddeld 13"
//    			        },
//    			        {
//    			          "id": 343683,
//    			          "subModelName": "SSd1"
//    			        },
//    			        {
//    			          "id": 343681,
//    			          "subModelName": "Test dMdoSdel 13"
//    			        },
//    			        {
//    			          "id": 343679,
//    			          "subModelName": "Test Mdoddel 13"
//    			        },
//    			        {
//    			          "id": 343678,
//    			          "subModelName": "SdS1"
//    			        }
//    			      ]
//    			    },
//    			    {
//    			      "level": "3",
//    			      "subModels": [
//    			        {
//    			          "id": 343684,
//    			          "subModelName": "Test ModDedld d13"
//    			        },
//    			        {
//    			          "id": 343682,
//    			          "subModelName": "Test Moddeld 13"
//    			        },
//    			        {
//    			          "id": 343683,
//    			          "subModelName": "SSd1"
//    			        },
//    			        {
//    			          "id": 343681,
//    			          "subModelName": "Test dMdoSdel 13"
//    			        },
//    			        {
//    			          "id": 343679,
//    			          "subModelName": "Test Mdoddel 13"
//    			        },
//    			        {
//    			          "id": 343678,
//    			          "subModelName": "SdS1"
//    			        },
//    			        {
//    			          "id": 343680,
//    			          "subModelName": "SdSS1"
//    			        }
//    			      ]
//    			    }
//    			  ]
//    			}
//    return cb(null, responseCode.SUCCESS, fetched);
//}
    

    PortfolioService.prototype.getPortfolioNodes = function(data, cb) {
        logger.info("Get portfolios nodes (getPortfolioNodes())");

        portfolioDao.getPortfolioNodes(data, function(err, fetchedResponse) {
            if (err) {
                logger.error("Error in getting portfolios nodes(getPortfolioNodes()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            
            //JSon
            var responseJson = {
                "portfolioId": null ,
                "modelId": null ,
                "levels": [],
                "preSelectedNodeId": null
            }
            
            var fetched = fetchedResponse[0];
            var length = fetched.length;
            
            if(length > 0){
            	responseJson.portfolioId = fetched[0].portfolioId;
            	responseJson.modelId = fetched[0].modelId;
            }
            
            var levelJson = {
    				"level": null,
    				"subModels": []
    		}
            
            for(var i = 0; i < length; i++){
            	
            	var levelId = fetched[i].level;
            	
            	if(i != 0 && (levelId == fetched[i-1].level)){
            		var nodeJson = {
            				"id": fetched[i].subModelId,
            				"subModelName": fetched[i].subModelName
            		}
            		
            		levelJson.subModels.push(nodeJson);
            	} else { // add new level
            		
            		if(length == 1){
            			levelJson.level = levelId;
            			var nodeJson = {
                				"id": fetched[i].subModelId,
                				"subModelName": fetched[i].subModelName
                		}
                		
                		levelJson.subModels.push(nodeJson);
            			responseJson.levels.push(JSON.parse(JSON.stringify(levelJson)));
            			
            			levelJson = {
            					"level": null,
            					"subModels": []
            			}
            		} else {
                		levelJson.level = levelId;
                		
                		var nodeJson = {
                				"id": fetched[i].subModelId,
                				"subModelName": fetched[i].subModelName
                		}
                		
                		levelJson.subModels.push(nodeJson);
                		responseJson.levels.push(JSON.parse(JSON.stringify(levelJson)));
                		
                		if(i == 0){
                		levelJson = {
            					"level": null,
            					"subModels": []
            			}
                		}
            		}
            	}
            	
            	if(i == (length - 1)){
            		responseJson.levels.push(JSON.parse(JSON.stringify(levelJson)));
            	}
            	
            }
            
            return cb(null, responseCode.SUCCESS, responseJson);
        });
    };

PortfolioService.prototype.getPortfolioDetailWithAccountCashSummary = function(data, cb) {
    logger.info("Get account list with cash detail  associated to Portfolio service called (getAccountsListWithCash())");
    portfolioDao.getPortfolioDetailWithAccountCashSummary(data, function(err, fetched) {
        if (err) {
            logger.error("Error in Get account list with cash detail  associated to Portfolio (getAccountsListWithCash()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
          if (fetched.length > 0) {
            logger.info("Preparing Account details for UI (getSimpleAccountListWithPortfolioName())");
            portfolioConverter.portfolioCashSummaryResponse(fetched, function (err, result) {
                if (fetched.length > 1) {
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    return cb(null, responseCode.SUCCESS, result);
                }
            }
            );
        }
        else {
            logger.debug("Account Not exist (getSimpleAccountListWithPortfolioName()) ");
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};


PortfolioService.prototype.getPortfolioContributionAmount = function(data, cb) {
    logger.info("Get Portfoli contibution amount service called (getPortfolioContributionAmount()).");
   
    portfolioDao.getPortfolioContributionAmount(data, function(err, fetched) {
        if (err) {
            logger.error("Error while gettting contribution amount (getPortfolioContributionAmount())." + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
          if (fetched.length > 0) {
            logger.info("Success got contribution amount (getPortfolioContributionAmount()).");
          
            var response = {
            	"id": fetched[0].Id,
            	"amount": fetched[0].marketValue
            };
            
            return cb(null, responseCode.SUCCESS, response);
        } else {
            logger.debug("Portfolio Not exist (getPortfolioContributionAmount()).");
            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND, null);
        }
    });
};


module.exports = PortfolioService;