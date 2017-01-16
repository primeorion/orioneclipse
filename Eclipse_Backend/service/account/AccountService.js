"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var moment = require('moment');
var config = require('config');
var util = require('util');
var messages = config.messages;
var responseCode = config.responseCode;
var localCache = require('service/cache').local;
var AccountDao = require('dao/account/AccountDao.js');
var accountDao = new AccountDao();
var AccountResponseWithOutHoldingValue = require("model/account/AccountResponseWithOutHoldingValue.js");
var AccountConverter = require("converter/account/AccountConverter.js");
var accountConverter = new AccountConverter();
var AccountService = function () { };

AccountService.prototype.getSimpleAccountList = function (data, cb) {

    var session = localCache.get(data.reqId).session;
    data.portfolioLimitedAccess = session.portfolioLimitedAccess;
    data.portfolioAllAccess = session.portfolioAllAccess;


    logger.info("Get simple account list service called (getSimpleAccountList())");
    if (data.includevalue == 'true') {
        accountDao.getSimpleAccountWithValue(data, function (err, fetched) {
            if (err) {
                logger.error("Getting simple account list (getSimpleAccountList())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched.length > 0) {
                logger.info("Preparing simple account list for UI (getSimpleAccountList())");
                accountConverter.getAccountResponseWithHoldingValue(fetched, function (err, result) {

                    logger.info("Simple account list returned successfully (getSimpleAccountList())");
                    return cb(null, responseCode.SUCCESS, result);
                });
            }
            else {
                return cb(null, responseCode.SUCCESS, []);
            }
        });
    }
    else {
        accountDao.getSimpleAccountList(data, function (err, fetched) {
            if (err) {
                logger.error("Getting simple account list (getSimpleAccountList())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (fetched.length > 0) {
                logger.info("Preparing simple account list for UI (getSimpleAccountList())");
                accountConverter.getAccountResponseWithOutHolding(fetched, function (err, result) {

                    logger.info("Simple account list returned successfully (getSimpleAccountList())");
                    return cb(null, responseCode.SUCCESS, result);
                });
            }
            else {
                return cb(null, responseCode.SUCCESS, []);
            }
        });

    }
};

AccountService.prototype.getSimpleAccountDetail = function (data, cb) {
    logger.info("Get Simple Account details service called (getSimpleAccountDetail())");
    accountDao.getSimpleAccountDetail(data, function (err, fetched) {
        if (err) {
            logger.error("Getting Simple Account detail (getSimpleAccountDetail())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } if (fetched.length > 0) {
            logger.info("Preparing Simple Account list for UI (getSimpleAccountDetail())");
            accountConverter.getAccountResponseWithOutHolding(fetched, function (err, result) {
                if (result.length > 1) {
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    return cb(null, responseCode.SUCCESS, result[0]);
                }
            });
        } else {
            logger.info("Simple account  detail not found (getSimpleAccountDetail())" + data.id);
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.getAccountList = function (data, cb) {
    logger.info("Get account list service called (getAccountList())");
    accountDao.getAccountList(data, function (err, fetched) {
        if (err) {
            logger.error("Getting account list (getAccountList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing account list for UI (getAccountList())");
            accountConverter.getAllAccountModelToResponse(fetched, function (err, result) {
                logger.info("account list returned successfully (getAccountList())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

AccountService.prototype.getAccountFilters = function (data, cb) {
    logger.info("Get account filters service called (getAccountFilters())");
    accountDao.getAccountFilters(data, function (err, result) {
        if (err) {
            logger.error("Error in getting account filters(getAccountFilters())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (result) {
            logger.info("Account filters service returned successfully (getAccountFilters())");
            return cb(null, responseCode.SUCCESS, result);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

AccountService.prototype.getAccountDetail = function (data, cb) {
    logger.info("Get Account details service called (getAccountDetail())");
    accountDao.getAccountDetail(data, function (err, fetched) {
        if (err) {
            logger.error("Getting Account detail (getAccountDetail())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } if (fetched[0].length > 0) {
            logger.info("Preparing Account details for UI (getAccountDetail())");
            accountConverter.getAccountDetailModelToResponse(fetched, function (err, result) {
                if (fetched.length > 1) {
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    return cb(null, responseCode.SUCCESS, result);
                }
            }
            );
        }
        else {
            logger.debug("Account Not exist (getAccountDetail()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.getAccountsWithSecurity = function (data, cb) {
    logger.info("Get Account with security service called (getAccountsWithSecurity())");
    accountDao.getAccountsWithSecurity(data, function (err, fetched) {
        if (err) {
            logger.error("Error (getAccountsWithSecurity())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        cb(null, responseCode.SUCCESS, fetched);
    });
};

AccountService.prototype.getNewAccountList = function (data, cb) {
    logger.info("Get new account list service called (getNewAccountList())");
    accountDao.getNewAccountList(data, function (err, fetched) {
        if (err) {
            logger.error("Getting new account list (getNewAccountList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing new account list for UI (getNewAccountList())");
            accountConverter.getAccountResponseWithOutHolding(fetched, function (err, result) {
                logger.info("New account list returned successfully (getNewAccountList())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

AccountService.prototype.getAccountListWithNoPortfolio = function (data, cb) {
    logger.info("Get account list with No Portfolio  service called (getAccountListWithNoPortfolio())");
    accountDao.getAccountListWithNoPortfolio(data, function (err, fetched) {
        if (err) {
            logger.error("Get account list with No Portfolio  service called (getAccountListWithNoPortfolio())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            logger.info("Preparing account list  with no portfolio for UI (getAccountListWithNoPortfolio())");
            accountConverter.getAccountResponseWithOutHolding(fetched, function (err, result) {
                logger.info("Account list with No Portfolio  returned successfully (getAccountListWithNoPortfolio())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

AccountService.prototype.getAsideType = function (data, cb) {
    logger.info("Get getAsideType service called (getAsideType())");
    accountDao.getAsideType(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting Aside Type (getAsideType())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            accountConverter.getAsideTypeResponse(fetched, function (err, result) {
                logger.info("Get AsideType returned successfully (getAsideType())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};

AccountService.prototype.validateAsideType = function (data, cb) {
    logger.info("Validate AsideType service called (validateAsideType())");
    var msg = null;
    var status = false;
    accountDao.validateAsideType(data, function (err, cashAmount) {
        if (err) {
            logger.error("Error in validate cash Amount TypeId (validateAsideType())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (cashAmount.count > 0) {
            logger.debug("Cash Amount Type Id Validate successfully (validateAsideType())");
            if (data.expirationTypeId) {
                accountDao.validateAsideTypeExpiration(data, function (err, expiration) {
                    if (err) {
                        logger.error("Error in validate expiration TypeId (validateAsideType())" + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (!expiration.count > 0) {
                        logger.debug("Expiration Type Id does not exist (validateAsideType())");
                        msg = messages.expirationTypeNotExist;
                        status = false;
                        return cb(null, status, msg);
                    } else {
                        status = true;
                        return cb(null, status, msg);
                    }
                });
            } else {
                logger.debug("DIRECT CALL BACK \n ");
                status = true;
                return cb(null, status, msg);
            }
            // if (data.expirationValue) {

            //     // return cb(null, true, null);
            // }
        } else {
            logger.debug("Cash Amount Type Id does not exist (validateAsideType())");
            msg = messages.cashAmountTypeNotExist;
            status = false;
            return cb(null, status, msg);
        }
    });
};

AccountService.prototype.validateCashAmount = function (data, cb) {
    logger.info("Validate AsideType service called (validateCashAmount())");
    var msg = null;
    var status = false;
    if (data.cashAmount > 0) {
        logger.debug("Cash Amount Validate successfully (validateCashAmount())");
        status = true;
        if (data.cashAmountTypeId == 2 && !(data.cashAmount <= 100)) {
            logger.debug("Cash percent should not be more then 100 (validateCashAmount())");
            status = false;
            msg = messages.cashPercentNotBe;
            return cb(null, status, msg);
        }
        else if (data.toleranceValue < 0) {
            logger.debug("Tolerance Value Validate successfully (validateCashAmount())");
            status = false;
            msg = messages.toleranceValue;
            return cb(null, status, msg);
        } else {
            logger.debug("Tolerance Value Id  (validateCashAmount())");
            status = true;
            return cb(null, status, msg);
        }
    } else {
        logger.debug("Cash Amount Type (validateCashAmount())");
        status = false;
        msg = messages.asideCashAmount;
        return cb(null, status, msg);
    }
};

AccountService.prototype.validateExpirationValue = function (data, cb) {
    logger.info("Validate AsideType service called (validateExpirationValue())");
    var msg = null;
    var status = false;
    if (data.expirationTypeId === 1 && data.expirationValue) {
        msg = messages.dateFormatNotValid;
        var isValid = moment(data.expirationValue, "MM/DD/YYYY", true).isValid();
        if (isValid) {
            status = true;
            //   new Date(moment().format("MM/DD/YYYY")) <= inputComp
            // var currentDate = moment().format('MM/DD/YYYY');
            var currentDate = new Date();
            var expirationValue = data.expirationValue;
            var inputDate = new Date(expirationValue);
            // console.log(currentDate <= inputDate);
            if (new Date(moment().format("MM/DD/YYYY")) <= inputDate) {
                status = true;
                //    var currentDate = moment().format('MM/DD/YYYY');
                return cb(null, status, msg);
            } else {
                msg = messages.dateValid;
                status = false;
                return cb(null, status, msg);
            }
        } else {
            return cb(null, status, msg);

        }
    } else if (data.expirationTypeId && data.expirationValue) {
        accountDao.validateTransactionType(data, function (err, transactionType) {
            if (err) {
                logger.error("Error in validate validate Transaction TypeId (validateExpirationValue())" + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (transactionType.count > 0) {
                status = true;
                return cb(null, status, msg);
            } else {
                msg = messages.transactionTypeNotExist;
                return cb(null, status, msg);
            }
        });
    }
    else if (data.expirationValue) {
        msg = messages.onlyExpirationValueNotAllowed;
        return cb(null, status, msg);
    }
    else {
        status = true
        return cb(null, status, msg);
    }
};

AccountService.prototype.getAsideDetails = function (data, cb) {
    logger.info("Get AsideDetails service called (getAsideDetails())");
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (getAsideDetails())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account.count > 0) {
            accountDao.validateAside(data, function (err, aside) {
                if (err) {
                    logger.error("Error in validate  Aside  (getAsideDetails())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (aside.count > 0) {
                    accountDao.getAsideDetails(data, function (err, fetched) {
                        if (err) {
                            logger.error("Error in getting Aside details (getAsideDetails())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (fetched.length > 0) {
                            accountConverter.getAsideDetailsResponse(fetched, function (err, result) {
                                logger.info("Get Aside details returned successfully (getAsideDetails())");
                                return cb(null, responseCode.SUCCESS, result);
                            });
                        } else {
                            return cb(null, responseCode.SUCCESS, []);
                        }

                    });
                } else {
                    logger.debug("Aside Not exist (getAsideDetails()) ");
                    return cb(messages.asideNotExist, responseCode.NOT_FOUND);
                }
            });
        } else {
            logger.debug("Account Not exist (getAsideDetails()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.addAsideDetails = function (data, cb) {
    logger.info("Add AsideDetails service called (addAsideDetails())");
    var self = this;
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (addAsideDetails())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account.count > 0) {
            self.validateAsideType(data, function (err, status, value) {
                if (err) {
                    logger.error("Error in validate Account  (addAsideDetails())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }

                if (status) {
                    self.validateExpirationValue(data, function (err, status, value) {
                        if (err) {
                            logger.error("Error in validate Account  (addAsideDetails())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }

                        if (status) {
                            self.validateCashAmount(data, function (err, status, value) {
                                if (err) {
                                    logger.error("Error in validate Account  (addAsideDetails())" + err);
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                }

                                if (status) {
                                    accountDao.addAsideDetails(data, function (err, fetched) {
                                        if (err) {
                                            logger.error("Error in Adding Aside details (addAsideDetails())" + err);
                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        if (fetched.affectedRows > 0) {
                                            data.id = fetched.insertId;
                                            self.getAsideDetails(data, function (err, status, result) {
                                                logger.info("Get Aside details returned successfully (addAsideDetails())");
                                                return cb(null, responseCode.CREATED, result);
                                            });
                                        }
                                    });
                                }
                                else {
                                    logger.debug("Cash amount should be in positive (addAsideDetails()) ");
                                    return cb(value, responseCode.BAD_REQUEST);
                                }
                            });
                        }
                        else {
                            logger.debug("Aside Expiration value Not exist (addAsideDetails()) ");
                            return cb(value, responseCode.NOT_FOUND);
                        }
                    });
                }
                else {
                    logger.debug("Aside type Not exist (addAsideDetails()) ");
                    return cb(value, responseCode.NOT_FOUND);
                }
            });
        } else {
            logger.debug("Account Not exist (addAsideDetails()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.updateAsideDetails = function (data, cb) {
    logger.info("Update AsideDetails service called (updateAsideDetails())");
    var self = this;
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (updateAsideDetails())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account.count > 0) {
            accountDao.validateAside(data, function (err, aside) {
                if (err) {
                    logger.error("Error in validate  Aside  (updateAsideDetails())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (aside.count > 0) {
                    self.validateAsideType(data, function (err, status, value) {
                        if (err) {
                            logger.error("Error in validate Account  (updateAsideDetails())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (status) {
                            self.validateExpirationValue(data, function (err, status, value) {
                                if (err) {
                                    logger.error("Error in validate Account  (addAsideDetails())" + err);
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                }

                                if (status) {
                                    self.validateCashAmount(data, function (err, status, value) {
                                        if (err) {
                                            logger.error("Error in validate Account  (addAsideDetails())" + err);
                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                        }
                                        if (status) {
                                            accountDao.updateAsideDetails(data, function (err, fetched) {
                                                if (err) {
                                                    logger.error("Error in updating Aside details (updateAsideDetails())" + err);
                                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                                                }
                                                if (fetched.affectedRows > 0) {
                                                    self.getAsideDetails(data, function (err, status, result) {
                                                        logger.info("Get Aside details returned successfully (updateAsideDetails())");
                                                        return cb(null, responseCode.SUCCESS, result);
                                                    });
                                                }
                                            });
                                        }
                                        else {
                                            logger.debug("Cash amount should be in positive (addAsideDetails()) ");
                                            return cb(value, responseCode.BAD_REQUEST);
                                        }
                                    });
                                } else {
                                    logger.debug("Aside Expiration value Not exist (addAsideDetails()) ");
                                    return cb(value, responseCode.NOT_FOUND);
                                }
                            });

                        } else {
                            logger.debug("Aside type Not exist (updateAsideDetails()) ");
                            return cb(value, responseCode.NOT_FOUND);
                        }
                    });

                } else {
                    logger.debug("Aside Not exist (updateAsideDetails()) ");
                    return cb(messages.asideNotExist, responseCode.NOT_FOUND);
                }
            });
        } else {
            logger.debug("Account Not exist (deleteAsideDetails()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.getAllAsideList = function (data, cb) {
    logger.info("Get Aside list service called (getAllAsideList())");
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (getAllAsideList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account.count > 0) {
            accountDao.getAllAsideList(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in getting Aside List (getAllAsideList())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (fetched.length > 0) {
                    accountConverter.getAsideListResponse(fetched, function (err, result) {
                        logger.info("Get Aside List returned successfully (getAllAsideList())");
                        return cb(null, responseCode.SUCCESS, result);
                    });
                } else {
                    return cb(null, responseCode.SUCCESS, []);
                }

            });
        } else {
            logger.debug("Account Not exist (getAllAsideList()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.deleteAsideDetails = function (data, cb) {
    logger.info("Delete Aside service called (deleteAsideDetails())");
    var self = this;
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (deleteAsideDetails())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account.count > 0) {
            accountDao.validateAside(data, function (err, aside) {
                if (err) {
                    logger.error("Error in validate  Aside  (deleteAsideDetails())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (aside.count > 0) {
                    accountDao.deleteAsideDetails(data, function (err, fetched) {
                        if (err) {
                            logger.error("Error in deleting Aside  (deleteAsideDetails())" + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (fetched.affectedRows > 0) {
                            logger.info("Aside deleted successfully (deleteAsideDetails())");
                            return cb(null, responseCode.SUCCESS, { "message": messages.asideDeleted });
                        }
                    });
                } else {
                    logger.debug("Aside Not exist (deleteAsideDetails()) ");
                    return cb(messages.asideNotExist, responseCode.NOT_FOUND);
                }
            });
        } else {
            logger.debug("Account Not exist (deleteAsideDetails()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.getModelLevelType = function (data, cb) {
    logger.info("Get Model Level Type service called (getModelLevelType())");
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (getModelLevelType())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account.count > 0) {
            accountDao.getModelLevelType(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in getting Model Level Type (getModelLevelType())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                accountConverter.getModelLevelTypeResponse(fetched, function (err, result) {
                    logger.info("Get ModelLevelType returned successfully (getModelLevelType())");
                    return cb(null, responseCode.SUCCESS, result);
                });

            });
        } else {
            logger.debug("Account Not exist (getModelLevelType()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.getModelNode = function (data, cb) {
    logger.info("Get Model Node Type service called (getModelNode())");
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (getModelNode())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account.count > 0) {
            accountDao.getModelNode(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in getting Model Node  (getModelNode())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                return cb(null, responseCode.SUCCESS, fetched);
            });
        } else {
            logger.debug("Account Not exist (getModelNode()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.setReplenish = function (data, cb) {
    logger.info("Set replenish service called (setReplenish())");
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (setReplenish())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account && account.count > 0) {
            accountDao.setReplenish(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in setting Replenish  (setReplenish())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (fetched && fetched.affectedRows > 0) {
                    accountConverter.setReplenishResponse(data, function (err, result) {
                        logger.info("Get setReplenish returned successfully (setReplenish())");
                        return cb(null, responseCode.SUCCESS, result);
                    });
                }
                else {
                    logger.debug("Unable to setReplenish for Account (setReplenish()) ");
                    return cb("Unable to setReplenish for Account", responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.debug("Account Not exist (setReplenish()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.getReplenish = function (data, cb) {
    logger.info("Get replenish service called (getReplenish())");
    accountDao.validateAccount(data, function (err, account) {
        if (err) {
            logger.error("Error in validate Account  (getReplenish())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (account.count > 0) {
            accountDao.getReplenish(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in getting Aside Type (getReplenish())" + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                accountConverter.getReplenishResponse(fetched, function (err, result) {
                    logger.info("Get AsideType returned successfully (getReplenish())");
                    return cb(null, responseCode.SUCCESS, result);
                });
            });
        }
        else {
            logger.debug("Account Not exist (getReplenish()) ");
            return cb(messages.accountNotFound, responseCode.NOT_FOUND);
        }
    });
};

AccountService.prototype.getSmaNodeList = function (data, cb) {
    logger.info("Get SMA Node service called (getSmaNodeList())");
    accountDao.getSmaNodeList(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting SMA Node  (getSmaNodeList())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (fetched.length > 0) {
            accountConverter.smaResponseNodes(fetched, function (err, result) {
                logger.info("Get SMA Node returned successfully (getSmaNodeList())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }
        else {
            return cb(null, responseCode.SUCCESS, {});
        }
    });
};

// AccountService.prototype.getSmaClass = function (data, cb) {
//     logger.info("Get SMA class service called (getSmaClass())");
//     accountDao.getSmaClass(data, function (err, fetched) {
//         if (err) {
//             logger.error("Error in getting SMA class (getSmaClass())" + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         if (fetched.length > 0) {
//             accountConverter.smaResponseNodes(fetched, function (err, result) {
//                 logger.info("Get SMA class  returned successfully (getSmaClass())");
//                 return cb(null, responseCode.SUCCESS, result);
//             });
//         }
//         else {
//             return cb(null, responseCode.SUCCESS, []);
//         }
//     });
// };

// AccountService.prototype.getSmaSecuritySubClass = function (data, cb) {
//     logger.info("Get SMA Security Sub Class service called (getSmaSecuritySubClass())");
//     accountDao.getSmaSecuritySubClass(data, function (err, fetched) {
//         if (err) {
//             logger.error("Error in getting SMA Security Sub Class (getSmaSecuritySubClass())" + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         if (fetched.length > 0) {
//             accountConverter.smaResponseNodes(fetched, function (err, result) {
//                 logger.info("Get SMA Security Sub Class returned successfully (getSmaSecuritySubClass())");
//                 return cb(null, responseCode.SUCCESS, result);
//             });
//         }
//         else {
//             return cb(null, responseCode.SUCCESS, []);
//         }
//     });
// };

AccountService.prototype.getSimpleAccountListwithPortfolioName = function (data, cb) {
    logger.info("Get Account details service called (getSimpleAccountListwithPortfolioName())");
    accountDao.getSimpleAccountListwithPortfolioName(data, function (err, fetched) {
        if (err) {
            logger.error("Getting Account detail (getSimpleAccountListwithPortfolioName())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } if (fetched.length > 0) {
            logger.info("Preparing Account details for UI (getSimpleAccountListwithPortfolioName())");
            accountConverter.getSimpleAccountListwithPortfolioNameResponse(fetched, function (err, result) {
                if (fetched.length > 1) {
                    return cb(null, responseCode.SUCCESS, result);
                } else {
                    return cb(null, responseCode.SUCCESS, result);
                }
            }
            );
        }
        else {
            logger.debug("Account Not exist (getSimpleAccountListwithPortfolioName()) ");
            return cb(null, responseCode.SUCCESS, []);
        }
    });
};


AccountService.prototype.addSmaNode = function (data, cb) {
    var self = this;

    logger.info(" Add Sma Node Service called (addSmaNode())");
    accountDao.getIdList(data, function (err, idList) {
        logger.info("Delete Id list service called (addSmaNode())");

        if (err) {
            logger.error("Error in adding sma (addSmaNode() Detail " + err);
            return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " Sub Model Id" });
        }
        data.idList = idList;
        accountDao.deleteIdList(data, function (err, activeIdList) {
            logger.info(" Add Sma Node Service called (addSmaNode())");
            accountDao.addSmaNode(data, function (err, fetched) {
                if (err) {
                    logger.error("Error in adding sma (addSmaNode()) " + err);
                    return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " Sub Model Id " });
                }
                if (fetched.affectedRows > 0) {
                    data.id = data.accountId;
                    if (data) {
                        self.getSmaNodeList(data, function (err, status, result) {
                            logger.info("Get getSmaCategory  successfully (addSmaNode())");
                            return cb(null, responseCode.CREATED, result);
                        });
                    }


                }
                else {
                    return cb(null, responseCode.SUCCESS, []);
                }
            });
        });


    });
};

AccountService.prototype.getAccountsWithOutOfTolerance = function (data, cb) {
    var self = this;
    if (data.assetType == "securityset") {
        self.getAccountsWithOutOfToleranceBySecurity(data, function (err, status, rs) {
            return cb(err, status, rs);
        });
    }
    else if (data.assetType == "category") {
        self.getAccountsWithOutOfToleranceByCategory(data, function (err, status, rs) {
            return cb(err, status, rs);
        });
    }
    else if (data.assetType == "class") {
        self.getAccountsWithOutOfToleranceByClass(data, function (err, status, rs) {
            return cb(err, status, rs);
        });
    }
    else if (data.assetType == "subclass") {
        self.getAccountsWithOutOfToleranceBySubClass(data, function (err, status, rs) {
            return cb(err, status, rs);
        });
    }
    else {
        return cb(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " asset type" });
    }
}

AccountService.prototype.getAccountsWithOutOfToleranceBySecurity = function (data, cb) {

    accountDao.getAccountsWithOutOfToleranceSecurity(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
}


AccountService.prototype.getAccountsWithOutOfToleranceByCategory = function (data, cb) {

    accountDao.getAccountsWithOutOfToleranceCategory(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
}

AccountService.prototype.getAccountsWithOutOfToleranceByClass = function (data, cb) {

    accountDao.getAccountsWithOutOfToleranceClass(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
}

AccountService.prototype.getAccountsWithOutOfToleranceBySubClass = function (data, cb) {

    accountDao.getAccountsWithOutOfToleranceSubClass(data, function (err, rs) {
        if (err) {
            logger.error(err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        if (rs && rs.length > 0) {
            return cb(null, responseCode.SUCCESS, rs[0]);
        }
        else {
            return cb(null, responseCode.SUCCESS, []);
        }
    });
}

AccountService.prototype.deleteSmaNode = function (data, cb) {
    logger.info("Delete SMA node service called (deleteSmaNode())");
    accountDao.deleteSmaNode(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting SMA node  (deleteSmaNode())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }

        logger.info("SMA node  deleted successfully (deleteSmaNode())" + data.accountId);
        return cb(null, responseCode.SUCCESS, { "message": messages.smaNodeDeleted });
    });
};

AccountService.prototype.getPortfolios = function (data, cb) {
    logger.info("Get portfolio service called getPortfolios()");
    accountDao.getPortfolios(data, function (err, fetched) {
        if (err) {
            logger.error("Error in get portfoli api getPortfolios())" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        }
        

		 if (fetched.length > 0) {
				var json = {
					"acountId" : fetched[0].id,
					"portfolioId" : fetched[0].portfolioId
				}
			
			 return cb(null, responseCode.SUCCESS, json);
		} else {
			 logger.error("Not able to get any information getPortfolios()");
			 return cb(messages.accountNotFound, responseCode.NOT_FOUND);
		}
    });
};

module.exports = AccountService;
