"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var util = require('util');
var _ = require('underscore');
var PortfolioConverter = require("converter/portfolio/PortfolioConverter.js");
var PortfolioDao = require('dao/portfolio/PortfolioDao.js');
var localCache = require('service/cache').local;

var messages = config.messages;
var responseCode = config.responseCodes;

var portfolioDao = new PortfolioDao();
var portfolioConverter = new PortfolioConverter();

var PortfolioService = function () { }

PortfolioService.prototype.getSimplePortfolioList = function (data, cb) {
    logger.info("Get simple Portfolios list service called (getSimplePortfolioList())");

    var session = localCache.get(data.reqId).session;

    var allAccess = [];
    var limitedAccess = [];
    data.portfolioAllAccess = session.portfolioAllAccess;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;

    portfolioDao.getSimplePortfolioList(data, function (err, result) {
        if (err) {
            logger.error("Error in getting simple portfolio list (getSimplePortfolioList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Simple Portfolios list returned successfully (getSimplePortfolioList())");
        return cb(null, responseCode.SUCCESS, result);
    });
};

PortfolioService.prototype.getList = function (data, cb) {
    logger.info("Get Portfolios list service called (getList())");
    portfolioDao.getList(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting Portfolios list (getList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(fetched & fetched >0){
            portfolioConverter.getResponseModelOfPortfolioList(fetched, function (err, result) {
                logger.info("Portfolios List returned successfully (getList())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }else{
            logger.info("Empty Portfolios List returned (getList())");
            return cb(null, responseCode.SUCCESS, []);            
        }
        // logger.info("Portfolios List returned successfully (getList())");
        // return cb(null, responseCode.SUCCESS, result);
    });
};

PortfolioService.prototype.getDetails = function (data, cb) {
    logger.info("Get Portfolio Details service called (getDetails())");
    var self = this;
    self.portfolioExist(data, function (err, recordExist) {
        if (recordExist) {
            portfolioDao.getDetails(data, function (err, result) {
                if (err) {
                    logger.error("Error in getting Portfolio Details (getDetails())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("Portfolio Details returned successfully (getDetails())");
                return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.error("Portfolio does not exist (getDetails())" + data.id);
            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
        }
    });
};

PortfolioService.prototype.getAccountsList = function (data, cb) {
    logger.info("Get Accounts list service called (getAccountsList())");
    var self = this;
    self.portfolioExist(data, function (err, recordExist) {
        if (recordExist) {
            portfolioDao.getAccountsList(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in getting Accounts list (getAccountsList())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                portfolioConverter.getResponseModelOfAccountList(fetched, function (err, result) {
                    logger.info("Accounts List returned successfully (getAccountsList())");
                    if (result && result.length > 0) {
                        return cb(null, responseCode.SUCCESS, result);
                    } else {
                        return cb(messages.portfoiloNotAssignedWithAccounts, responseCode.NOT_FOUND);
                    }
                });
                // logger.info("Accounts List returned successfully (getAccountsList())");
                // return cb(null, responseCode.SUCCESS, result);
            });
        } else {
            logger.error("Portfolio does not exist (getAccountsList())" + data.id);
            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
        }
    });
};

PortfolioService.prototype.assginPortfolioToAccounts = function (data, cb) {
    logger.info("Assign Portfolio to accounts service called (assginPortfolioToAccounts())");
    var self = this;
    self.portfolioExist(data, function (err, recordExist) {
        if (recordExist) {
            portfolioDao.assginPortfolioToAccounts(data, function (err, result) {
                if (err) {
                    logger.error("Error in assigning Portfolio to accounts (assginPortfolioToAccounts())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (result === 0) {
                    return cb(messages.portfoiloNotAssignedWithAccounts, responseCode.SUCCESS);
                }
                logger.info("Assign Portfolio to accounts service returned successfully (assginPortfolioToAccounts())");
                return cb(messages.portfoiloAssignedToAccounts, responseCode.SUCCESS);
            });
        } else {
            logger.error("Portfolio does not exist (assginPortfolioToAccounts())" + data.id);
            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
        }
    });
};

PortfolioService.prototype.unassginPortfolioFromAccounts = function (data, cb) {
    logger.info("Un-Assign Portfolio from accounts service called (unassginPortfolioFromAccounts())");
    var self = this;
    self.portfolioExist(data, function (err, recordExist) {
        if (recordExist) {
            portfolioDao.unassginPortfolioFromAccounts(data, function (err, result) {
                if (err) {
                    logger.error("Error in Unassigning Portfolio from accounts (unassginPortfolioFromAccounts())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (result === 0) {
                    if (data.accountId) {
                        return cb(messages.portfoiloNotUnAssignedFromAccount, responseCode.SUCCESS);
                    } else {
                        return cb(messages.portfoiloNotUnAssignedFromAccounts, responseCode.SUCCESS);
                    }
                }
                if (data.accountId) {
                    logger.info("Unassign Portfolio from account service returned successfully (unassginPortfolioFromAccounts())");
                    return cb(messages.portfoiloUnAssignedFromAccount, responseCode.SUCCESS);
                } else {
                    logger.info("Unassign Portfolio from all accounts service returned successfully (unassginPortfolioFromAccounts())");
                    return cb(messages.portfoiloUnAssignedFromAccounts, responseCode.SUCCESS);
                }
            });
        } else {
            logger.error("Portfolio does not exist (unassginPortfolioFromAccounts())" + data.id);
            return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
        }
    });
};

PortfolioService.prototype.getPortfolioAccountsSummary = function (data, cb) {
    logger.info("Get Portfolio accounts summary service called (getPortfolioAccountsSummary())");
    var self = this;
    portfolioDao.getPortfolioAccountsSummary(data, function (err, result) {
        if (err) {
            logger.error("Error in getting Portfolio accounts summary (()): " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Portfolio accounts summary returned successfully (getPortfolioAccountsSummary())");
        return cb(null, responseCode.SUCCESS, result);
    });
};

PortfolioService.prototype.getStatus = function (data, cb) {
    logger.info("Get Portfolio Status service called (getStatus())");
    portfolioDao.getStatus(data, function (err, result) {
        if (err) {
            logger.error("Error in getting portfolio Status (getTypesStatus())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        logger.info("Portfolio Status service returned successfully (getStatus())");
        return cb(null, responseCode.SUCCESS, result);
    });
};

PortfolioService.prototype.addPortfolio = function (data, cb) {
    logger.info("Create portfolio service called  (addPortfolio())");
    var self = this;
    var invalidTeamIds = _.difference(data.teamIds, data.user.teamIds);
    var invalidTeamId = _.indexOf(data.teamIds, data.primaryTeamId);
    if(!(invalidTeamIds && invalidTeamIds.length > 0) && invalidTeamId >= 0){
        if (data.modelId) {
            portfolioDao.getModelCountById(data, function (err, fetched) {
                if (err) {
                    logger.error("Getting Model count (addPortfolio())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (fetched && fetched.length > 0) {
                    self.createPortfolio(data, function (err, output) {
                        if (err) {
                            logger.error("Error in portfolio creation (createPortfolio())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        return cb(null, responseCode.CREATED, output);
                    });
                } else {
                    logger.error("Model Not exist (addPortfolio())" + data.name);
                    return cb(messages.modelNotFound, responseCode.NOT_FOUND);
                }
            });
        } else {
            self.createPortfolio(data, function (err, output) {
                if (err) {
                    logger.error("Error in portfolio creation (createPortfolio())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.CREATED, output);
            });
        }
    } else if (invalidTeamId < 0) {
        logger.error("Error in primaryTeamId it does not exists teamIds(addPortfolio())");
        return cb(messages.primaryTeamIdNotFound, responseCode.NOT_FOUND);
    } else if (invalidTeamIds && invalidTeamIds.length > 0) {
        logger.error("Teams from TeamIds Not exist (addPortfolio())");
        return cb(messages.teamNotFound, responseCode.NOT_FOUND);
    } 
};

PortfolioService.prototype.deletePortfolio = function (data, cb) {
    logger.info("Delete Portfolio service called (deletePortfolio())");
    var self = this;
    if (data.id) {
        self.getPortfolioAccountsSummary(data, function (err, code, fetched) {
            if (err) {
                logger.error("Getting portfolio association (deletePortfolio())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched && fetched.count > 0) {
                logger.debug("No of Accounts associated with Portfolio(deletePortfolio())" + fetched.count);
                return cb(messages.portfolioAccountAssociated, responseCode.UNPROCESSABLE);
            }
            else {
                if (data.id) {
                    portfolioDao.getProtfolioCountById(data, function (err, fetched) {
                        if (err) {
                            logger.error("Getting Portfolio count (deletePortfolio())" + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (fetched.count > 0) {
                            portfolioDao.deletePortfolio(data, function (err, result) {
                                if (err) {
                                    logger.error("Error in Deleting Portfolio (deletePortfolio())" + err);
                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                }
                                if (result.affectedRows > 0) {
                                    portfolioDao.removePortfolioAssociatedToTeam(data, function (err, setPrimaryTeamRemoved) {
                                        if (err) {
                                            logger.error("Error In Removing portfolio PrimaryTeam (deletePortfolio())" + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                        } else {
                                            logger.info("Portfolio deleted successfully (deletePortfolio())" + data.id);
                                            return cb(messages.portfoiloDeleted, responseCode.SUCCESS);
                                        }
                                    });
                                }
                            });
                        } else {
                            logger.error("Portfolio does not exist(deletePortfolio()) with Id : " + data.id);
                            return cb(messages.PortfolioNotFoundOrDeleted, responseCode.UNPROCESSABLE);
                        }
                    });
                }
            }
        });
    }
    else {
        logger.info("Missing Required Parameters for delete Portfolio  (deletePortfolio())");
        return cb(messages.missingParameters, responseCode.BAD_REQUEST);
    }
};

PortfolioService.prototype.setPrimaryTeam = function (data, cb) {
    logger.info("Set Primary team in Portfolio service called (setPrimaryTeam())");
    portfolioDao.setPrimaryTeam(data, function (err, result) {
        if (err) {
            logger.error("Error in set Primary team in Portfolio(setPrimaryTeam())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.affectedRows > 0) {
            return cb(null, responseCode.SUCCESS, result);
        } else {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
    });
};

PortfolioService.prototype.updatePortfolio = function (data, cb) {
    var invalidTeamIds = _.difference(data.teamIds, data.user.teamIds);
    var invalidTeamId = _.indexOf(data.teamIds, data.primaryTeamId);
    logger.info("Update Portfolio service called (updatePortfolio())");
    var self = this;
    if (data.id) {
        portfolioDao.getProtfolioCountById(data, function (err, fetched) {
            if (err) {
                logger.error("Getting Portfolio count (updatePortfolio())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            data.source = 'Team';
            if (fetched.count > 0) {
                if(!(invalidTeamIds && invalidTeamIds.length > 0) && invalidTeamId >= 0){
                    if (data.modelId) {
                        portfolioDao.getModelCountById(data, function (err, model) {
                            if (err) {
                                logger.error("Getting Model count (updatePortfolio())" + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            if (model && model.length > 0 && !(invalidTeamIds && invalidTeamIds.length > 0) && invalidTeamId >= 0) {
                                self.editPortfolio(data, function (err, output) {
                                    if (err) {
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                                    }
                                    return cb(null, responseCode.SUCCESS, output);
                                });
                            } else if (invalidTeamId < 0) {
                                logger.error("Error in primaryTeamId it does not exists teamIds(updatePortfolio())");
                                return cb(messages.primaryTeamIdNotFound, responseCode.NOT_FOUND);
                            } else if (invalidTeamIds && invalidTeamIds.length > 0) {
                                logger.error("Teams from TeamIds Not exist (updatePortfolio())");
                                return cb(messages.teamNotFound, responseCode.NOT_FOUND);
                            } else {
                                logger.error("Model Not exist (updatePortfolio())" + data.modelId);
                                return cb(messages.modelNotFound, responseCode.NOT_FOUND);
                            }
                        });
                    } else {
                        self.editPortfolio(data, function (err, output) {
                            if (err) {
                                logger.error("Error in portfolio editPortfolio  (editPortfolio())" + err);
                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                            }
                            return cb(null, responseCode.SUCCESS, output);
                        });
                    }
                } else if (invalidTeamId < 0) {
                    logger.error("Error in primaryTeamId it does not exists teamIds(addPortfolio())");
                    return cb(messages.primaryTeamIdNotFound, responseCode.NOT_FOUND);
                } else if (invalidTeamIds && invalidTeamIds.length > 0) {
                    logger.error("Teams from TeamIds Not exist (addPortfolio())");
                    return cb(messages.teamNotFound, responseCode.NOT_FOUND);
                } 
            } else {
                logger.error("Portfolio does not exist (updatePortfolio())" + data.id);
                return cb(messages.portfolioNotFound, responseCode.NOT_FOUND);
            }
        });
    }
};

PortfolioService.prototype.updatePrimaryTeam = function (data, cb) {
    logger.info("Update Primary team in Portfolio service called (updatePrimaryTeam())");
    portfolioDao.updatePrimaryTeam(data, function (err, result) {
        if (err) {
            logger.error("Error in update Primary team in Portfolio(updatePrimaryTeam())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result.affectedRows > 0) {
            return cb(null, responseCode.SUCCESS, result);
        } else {
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
    });
};

PortfolioService.prototype.createPortfolio = function (data, cb) {
    var self = this;
    portfolioDao.addPortfolio(data, function (err, result) {
        if (err) {
            logger.error("Error in Adding portfolio (addPortfolio())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        data.id = result.insertId;
        data.source = 'Team';
        if (data.id) {
            self.setPrimaryTeam(data, function (err, code, assignedId) {
                if (err) {
                    logger.error("Error in portfolio setPrimaryTeam  (addPortfolio())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                else {
                    logger.info("Portfolio created successfully  (addPortfolio())");
                    self.getDetails(data, function (err, code, out) {
                        if (err) {
                            return cb(err, code);
                        }
                        return cb(null, out);
                    });
                }
            });
        }
    });
};

PortfolioService.prototype.editPortfolio = function (data, cb) {
    var self = this;
    portfolioDao.updatePortfolio(data, function (err, upadated) {
        if (err) {
            logger.error("Error in upadating Portfolio without model Id (editPortfolio())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        } else {
            if (upadated.affectedRows > 0) {
                self.updatePrimaryTeam(data, function (err, code, updatePortfolioTeam) {
                    if (err) {
                        logger.error("Error in portfolio updatePrimaryTeam  (editPortfolio())" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    else {
                        logger.info("Portfolio upadated successfully  (editPortfolio())");
                        self.getDetails(data, function (err, code, out) {
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

PortfolioService.prototype.portfolioExist = function (data, cb) {
    var status = false;
    portfolioDao.getProtfolioCountById(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting Portfolio exist (portfolioExist())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.count > 0 && fetched) {
            status = true;
            cb(null, status);
        } else {
            status = false;
            cb(null, status);
        }
    });
};

module.exports = PortfolioService;