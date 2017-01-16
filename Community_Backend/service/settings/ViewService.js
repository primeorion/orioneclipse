"use strict";

var moduleName = __filename;
var logger = require('helper/Logger.js')(moduleName);
var config = require('config');
var util = require('util');

var ViewConverter = require("converter/settings/ViewConverter.js");
var ErrorConverter = require('helper/DBToResponseCodeMapper.js');
var ViewDao = require('dao/settings/ViewDao.js');
var localCache = require('service/cache').local;

var messages = config.messages;
var responseCode = config.responseCodes;

var viewDao = new ViewDao();
var viewConverter = new ViewConverter();
var errorConverter = new ErrorConverter();

var errCode = null;
var errMessage = null;

var ViewService = function () { }

ViewService.prototype.getViewTypes = function (data, cb) {
    logger.info("Get list of all View Types service called (getViewTypes())");

    viewDao.getViewTypes(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting list of all View Types (getViewTypes())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        viewConverter.getResponseModelOfViewTypes(fetched,function (err, result) {
            if (err) {
                logger.error("Error in getting list of all View Types after conversion (getViewTypes())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("View Types List returned successfully (getViewTypes())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};

ViewService.prototype.getViewsList = function (data, cb) {
    logger.info("Get list of Views service called (getViewsList())");

    viewDao.getViewsList(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting list of Views (getViewsList())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        viewConverter.getResponseModelOfViews(fetched,function (err, result) {
            if (err) {
                logger.error("Error in getting list of Views after conversion (getViewsList())" + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }
            logger.info("Views List returned successfully (getViewsList())");
            return cb(null, responseCode.SUCCESS, result);
        });
    });
};

ViewService.prototype.getViewDetails = function (data, cb) {
    logger.info("Get View details service called (getViewDetails())");

    viewDao.getViewDetails(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting details of View (getViewDetails())" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        }
        if(fetched){
            viewConverter.getResponseModelOfViewDetails(fetched,function (err, result) {
                if (err) {
                    logger.error("Error in getting details of View after conversion (getViewDetails())" + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                }
                logger.info("View details returned successfully (getViewDetails())");
                return cb(null, responseCode.SUCCESS, result);
            });
        }else {
            return cb(messages.viewNotFound, responseCode.NOT_FOUND);
        }
    });
};

// ViewService.prototype.addView = function (data, cb) {
//     logger.info("Create View service called (addView())");
//     var self = this;
//     self.validateViewTypeId(data, function (err, validViewType) {
//         if (err) {
//             logger.error("Error in validating View type id (addView()) " + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         }
//         if (validViewType) {
//             viewDao.addView(data, function (err, fetched) {
//                 if (err) {
//                     logger.error("Error in Creating View (addView()) " + err);
//                     errorConverter.dbToResponseCodeMapper(err, function (err, errResult) {
//                         logger.debug('errResult is ' + JSON.stringify(errResult));
//                         errCode = errResult[0].code;
//                         errMessage = errResult[0].message;
//                         if (errMessage.match("Duplicate entry")) {
//                             errMessage = errResult[0].message + " for name";
//                         }
//                     });
//                     return cb(errMessage, errCode);
//                 }
//                 data.id = fetched.insertId;
//                 if (data.id) {
//                     logger.info("View created successfully  (addView())");
//                     self.getViewDetails(data, function (err, code, out) {
//                         if (err) {
//                             logger.error("Error in getting View Details (addView()) " + err);
//                             return cb(err, responseCode.INTERNAL_SERVER_ERROR)
//                         }
//                         return cb(null, responseCode.CREATED, out);
//                     });
//                 } else {
//                     logger.error("Unable to get newly created View (addView()) " + err);
//                     return cb(messages.viewNotCreated, responseCode.UNPROCESSABLE);
//                 }
//             });
//         } else {
//             logger.debug("View Type does not exist (addView()) " + data.viewTypeId);
//             return cb(messages.viewTypeNotFound, responseCode.NOT_FOUND);
//         }
//     });
// };

// ViewService.prototype.updateView = function (data, cb) {
//     logger.info("Update View service called (updateView())");
//     var self = this;
//     viewDao.getViewCountById(data, function (err, fetched) {
//         if (err) {
//             logger.error("Error in getting count of View (updateView()) " + err);
//             return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//         } else if (fetched > 0 && fetched) {
//             if (data.viewTypeId) {
//                 self.validateViewTypeId(data, function (err, validViewType) {
//                     if (err) {
//                         logger.error("Error in validating View type id (updateView()) " + err);
//                         return cb(err, responseCode.INTERNAL_SERVER_ERROR);
//                     }
//                     if (!validViewType) {
//                         logger.debug("View Type does not exist (updateView()) " + data.viewTypeId);
//                         return cb(messages.viewTypeNotFound, responseCode.NOT_FOUND);
//                     } else {
//                         viewDao.updateView(data, function (err, result) {
//                             if (err) {
//                                 logger.error("Error in updating View (updateView()) " + err);
//                                 errorConverter.dbToResponseCodeMapper(err, function (err, errResult) {
//                                     errCode = errResult.code;
//                                     errMessage = errResult.message + " for name";
//                                 });
//                                 return cb(errMessage, errCode);
//                             }
//                             if (result.affectedRows > 0) {
//                                 logger.info("View updated successfully  (updateView())");
//                                 self.getViewDetails(data, function (err, code, out) {
//                                     logger.info("Getting updated View Details (updateView())");
//                                     if (err) {
//                                         return cb("Error in getting View Details (updateView()) " + err);
//                                     }
//                                     return cb(null, responseCode.SUCCESS, out);
//                                 });
//                             } else {
//                                 logger.error("Unable to update View (updateView()) " + err);
//                                 return cb(messages.viewNotUpdated, responseCode.UNPROCESSABLE);
//                             }
//                         });
//                     }
//                 });
//             } else {
//                 viewDao.updateView(data, function (err, result) {
//                     if (err) {
//                         logger.error("Error in updating View (updateView()) " + err);
//                         errorConverter.dbToResponseCodeMapper(err, function (err, errResult) {
//                             errCode = errResult.code;
//                             errMessage = errResult.message + " for name";
//                         });
//                         return cb(errMessage, errCode);
//                     }
//                     if (result.affectedRows > 0) {
//                         logger.info("View updated successfully  (updateView())");
//                         self.getViewDetails(data, function (err, code, out) {
//                             logger.info("Getting updated View Details (updateView())");
//                             if (err) {
//                                 return cb("Error in getting View Details (updateView()) " + err);
//                             }
//                             return cb(null, responseCode.SUCCESS, out);
//                         });
//                     } else {
//                         logger.error("Unable to update View (updateView()) " + err);
//                         return cb(messages.viewNotUpdated, responseCode.UNPROCESSABLE);
//                     }
//                 });
//             }
//         } else {
//             logger.debug("View does not exist (updateView()) " + data.id);
//             return cb(messages.viewNotFound, responseCode.NOT_FOUND);
//         }
//     });
// };

ViewService.prototype.validateViewTypeId = function (data, cb) {
    logger.info("Validate View Type Id Service request received (validateViewTypeId())");
    logger.debug('view dao ' + JSON.stringify(viewDao));
    viewDao.validateViewTypeId(data, function (err, validViewType) {
        if (err) {
            logger.error("Error in Validation check for View type id (validateViewTypeId()) " + err);
            return cb(err, null);
        }
        return cb(null, validViewType);
    });
};

ViewService.prototype.deleteView = function (data, cb) {
    logger.info("Delete View service called (deleteView())");

    viewDao.getViewCountById(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting count of View (deleteView()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } else if (fetched > 0 && fetched) {
            viewDao.deleteView(data, function (err, result) {
                if (err) {
                    logger.error("Error in deleting View (deleteView()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (result.affectedRows > 0) {
                    logger.debug("View Deleted successfully (deleteView())");
                    return cb(null, responseCode.SUCCESS, { "message": messages.viewDeleted });
                } else {
                    return cb(messages.viewAccessDenied, responseCode.UNPROCESSABLE);
                }
            });
        } else {
            logger.debug("View does not exist (deleteView()) " + data.id);
            return cb(messages.viewNotFound, responseCode.NOT_FOUND);
        }
    });
};

ViewService.prototype.setDefaultView = function (data, cb) {
    logger.info("Set default View service called (setDefaultView())");
    var self = this;

    viewDao.getViewCountById(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting count of View (setDefaultView()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } else if (fetched > 0 && fetched) {
            viewDao.setDefaultView(data, function (err, result) {
                if (err) {
                    logger.error("Error in setting default view (setDefaultView()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                self.getViewDetails(data, function (err, code, out) {
                    logger.info("Getting default View Details (setDefaultView())");
                    if (err) {
                        return cb("Error in getting default View Details (setDefaultView()) " + err);
                    }
                    return cb(null, responseCode.SUCCESS, out);
                });
            });
        } else {
            logger.debug("View does not exist (updateView()) " + data.id);
            return cb(messages.viewNotFound, responseCode.NOT_FOUND);
        }
    });
};

ViewService.prototype.validateViewName = function (data, cb) {
    logger.info("Validate View name Service request received (validateViewName())");
    if (data.viewName) {
        viewDao.getViewIdByName(data, function (err, viewId) {
            if (err) {
                logger.error("Error in Validation check for View name (validateViewName()) " + err);
                return cb(err, null);
            }
            return cb(null, viewId);
        });
    } else {
        return cb(null, false);
    }
};

ViewService.prototype.addView = function (data, cb) {
    logger.info("Create View service called (addView())");
    var self = this;
    if (data.viewName) {
        self.validateViewName(data, function (err, viewId) {
            if (err) {
                logger.error("Error in validating View type id (addView()) " + err);
                return cb(err, responseCode.INTERNAL_SERVER_ERROR);
            }
            if (!viewId) {
                self.validateViewTypeId(data, function (err, validViewType) {
                    if (err) {
                        logger.error("Error in validating View type id (addView()) " + err);
                        return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                    }
                    if (validViewType) {
                        viewDao.addView(data, function (err, fetched) {
                            if (err) {
                                logger.error("Error in Creating View (addView()) " + err);
                                errorConverter.dbToResponseCodeMapper(err, function (err, errResult) {
                                    errCode = errResult.code;
                                    errMessage = errResult.message;
                                    if (errMessage.match("Duplicate entry")) {
                                        errMessage = errResult.message + " for name";
                                    }
                                });
                                return cb(errMessage, errCode);
                            }
                            data.id = fetched.insertId;
                            if (data.id) {
                                logger.info("View created successfully  (addView())");
                                self.getViewDetails(data, function (err, code, out) {
                                    if (err) {
                                        logger.error("Error in getting View Details (addView()) " + err);
                                        return cb(err, responseCode.INTERNAL_SERVER_ERROR)
                                    }
                                    return cb(null, responseCode.CREATED, out);
                                });
                            } else {
                                logger.error("Unable to get newly created View (addView()) " + err);
                                return cb(messages.viewNotCreated, responseCode.UNPROCESSABLE);
                            }
                        });
                    } else {
                        logger.debug("View Type does not exist (addView()) " + data.viewTypeId);
                        return cb(messages.viewTypeNotFound, responseCode.NOT_FOUND);
                    }
                });
            } else {
                logger.debug("View already exists with same name ");
                return cb(messages.viewAlreadyExist, responseCode.UNPROCESSABLE);
            }
        });
    } else {
        logger.info("Missing Required Parameters for add View  (addView())");
        return cb(messages.missingParameters, responseCode.BAD_REQUEST);
    }
};

ViewService.prototype.updateView = function (data, cb) {
    logger.info("Update View service called (updateView())");
    var self = this;
    viewDao.getViewCountById(data, function (err, fetched) {
        if (err) {
            logger.error("Error in getting count of View (updateView()) " + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
        } else if (fetched > 0 && fetched) {
            // if (data.viewTypeId) {
            self.validateViewTypeId(data, function (err, validViewType) {
                if (err) {
                    logger.error("Error in validating View type id (updateView()) " + err);
                    return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                }
                if (!validViewType) {
                    logger.debug("View Type does not exist (updateView()) " + data.viewTypeId);
                    return cb(messages.viewTypeNotFound, responseCode.NOT_FOUND);
                } else {
                    self.validateViewName(data, function (err, viewId) {
                        if (err) {
                            logger.error("Error in validating View Name (updateView()) " + err);
                            return cb(err, responseCode.INTERNAL_SERVER_ERROR);
                        }
                        if (viewId == data.id || !data.viewName || !viewId) {
                            viewDao.updateView(data, function (err, result) {
                                if (err) {
                                    logger.error("Error in updating View (updateView()) " + err);
                                    errorConverter.dbToResponseCodeMapper(err, function (err, errResult) {
                                        errCode = errResult.code;
                                        errMessage = errResult.message + " for name";
                                    });
                                    return cb(errMessage, errCode);
                                }
                                if (result.affectedRows > 0) {
                                    logger.info("View updated successfully  (updateView())");
                                    self.getViewDetails(data, function (err, code, out) {
                                        logger.info("Getting updated View Details (updateView())");
                                        if (err) {
                                            return cb("Error in getting View Details (updateView()) " + err);
                                        }
                                        return cb(null, responseCode.SUCCESS, out);
                                    });
                                } else {
                                    logger.error("Unable to update View (updateView()) " + err);
                                    return cb(messages.viewNotUpdated, responseCode.UNPROCESSABLE);
                                }
                            });
                        } else {
                            logger.error("View already exists with same name ");
                            return cb(messages.viewAlreadyExist, responseCode.UNPROCESSABLE);
                        }
                    });
                }
            });
            // } else {
            //     viewDao.updateView(data, function (err, result) {
            //         if (err) {
            //             logger.error("Error in updating View (updateView()) " + err);
            //             errorConverter.dbToResponseCodeMapper(err, function (err, errResult) {
            //                 errCode = errResult.code;
            //                 errMessage = errResult.message + " for name";
            //             });
            //             return cb(errMessage, errCode);
            //         }
            //         if (result.affectedRows > 0) {
            //             logger.info("View updated successfully  (updateView())");
            //             self.getViewDetails(data, function (err, code, out) {
            //                 logger.info("Getting updated View Details (updateView())");
            //                 if (err) {
            //                     return cb("Error in getting View Details (updateView()) " + err);
            //                 }
            //                 return cb(null, responseCode.SUCCESS, out);
            //             });
            //         } else {
            //             logger.error("Unable to update View (updateView()) " + err);
            //             return cb(messages.viewNotUpdated, responseCode.UNPROCESSABLE);
            //         }
            //     });
            // }
        } else {
            logger.debug("View does not exist (updateView()) " + data.id);
            return cb(messages.viewNotFound, responseCode.NOT_FOUND);
        }
    });
};

module.exports = ViewService;