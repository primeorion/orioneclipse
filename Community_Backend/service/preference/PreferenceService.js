"use strict";

var moduleName = __filename;
var config = require('config');
var sharedCache = require('service/cache').shared;
var messages = config.messages;
var responseCode = config.responseCode;
var constants = config.orionConstants;
var logger = require('helper/Logger')(moduleName);
var preferenceDao = new(require('dao/preference/PreferenceDao'))();
var response = require('controller/ResponseController');
var privilegeDao = new(require('dao/admin/PrivilegeDao'))();
var preferenceConvertor = new(require("converter/preference/PreferenceConvertor"))();

var PreferenceService = function() {};

// service to provide preferences level available to current firm/user.
PreferenceService.prototype.listAllPreferenceLevels = function(data, cb) {
    logger.info("Get all preference levels list service called (listAllPreferenceLevels())");
    preferenceDao.getCurrentRoleType(data, function(err, status) {
        if (err) {
            logger.error("Error while verifying current user role type in PreferenceService.prototype.listAllPreferenceLevels() :\n  " + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);

        } else {
            if (status == undefined || status == null) {
                logger.error("EUnable to get current user role type in PreferenceService.prototype.listAllPreferenceLevels()");
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
            }


            data.roleType = status.bitValue;
            preferenceDao.listAllPreferenceLevels(data, function(err, rows) {
                if (err) {
                    logger.error("Error while fetching list of levels in PreferenceService.prototype.listAllPreferenceLevels() :\n  " + err);
                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, rows);

                } else {
                    logger.info("Get all preference levels list service returned successfully preferenceDao.getCurrentRoleType()");

                    preferenceConvertor.levelEntityToLevelModel(rows, function(err, sanitizedResponse) {
                        if (err) {
                            logger.error("Error while converting (Entity -> Model) list of levels in PreferenceService.prototype.listAllPreferenceLevels() :\n  " + err);
                            return cb(messages.badRequest, responseCode.BAD_REQUEST, sanitizedResponse);
                        } else {
                            logger.info("Success\n List of preferences level generated PreferenceService.prototype.listAllPreferenceLevels()");
                            return cb(err, responseCode.SUCCESS, sanitizedResponse);
                        }
                    });

                }
            });
        }
    });
};

// service provide single level by given level Id
PreferenceService.prototype.getLevelById = function(data, cb) {
    var self = this;
    logger.info("Get all levels by id service called (getLevelById())");
    self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
        if (err) {
            logger.error("Error while getting logged in user information in PreferenceService.prototype.getLevelById() :\n  " + err);
            return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
        } else {
            data.user.roleId = currentUser.roleId;
            data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
            self.verifyRoleTypePermissionsAndLevelId(data, function(err, persmissonResult) {
                if (err) {
                    logger.error("Error while verifying current user role type in PreferenceService.prototype.getLevelById() :\n  " + err);
                    cb(err, persmissonResult);
                } else {
                    preferenceDao.getLevelById(data, function(err, rows) {
                        if (err) {
                            logger.error("Error while getting level from DAO in PreferenceService.prototype.getLevelById() :\n  " + err);
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, rows);

                        } else {
                            logger.info("Get all levels by id service returned sucessfully  PreferenceService.prototype.getLevelById()");

                            if (rows == undefined || rows.length < 1) {
                                logger.error("Invalid level's id passed in PreferenceService.prototype.getLevelById()  \n Level does not exist.");
                                return cb(messages.preferencesDataNotFound, responseCode.NOT_FOUND, rows);

                            } else {
                                preferenceConvertor.levelEntityToLevelModel(rows[0], function(err, sanitizedResponse) {
                                    if (err) {
                                        logger.error("Error while converting (Entity -> Model) in PreferenceService.prototype.getLevelById() :\n  " + err);
                                        return cb(messages.badRequest, responseCode.BAD_REQUEST, sanitizedResponse);
                                    } else {
                                        logger.info("Success final response returned sucessfully  PreferenceService.prototype.getLevelById()");
                                        return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });

};

// service provide level information by level's bit value
PreferenceService.prototype.getLevelByBitValue = function(data, cb) {
    preferenceDao.getLevelByBitValue(data, function(err, levelName) {

        if (err) {

            logger.error("Error while feteching level by id in PreferenceService.prototype.getLevelByBitValue() :\n  " + err);
            return cb(err, levelName);
        } else {

            logger.info("Success\n  level generated PreferenceService.prototype.getLevelByBitValue().");
            return cb(err, levelName);
        }
    });
};

PreferenceService.prototype.listPreferencesByLevel = function(data, cb) {
    var self = this;
    logger.info("Get all preferences by a level service called (listPreferencesByLevel())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error While getting current logged in user's information PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(data, function(err, permissionResult) {
                            if (err) {
                                logger.error("Error while verifying Permissions, Level id and record id in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error While fetching lebel information by bit value PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                            data.categoryCode = privilegeName;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.debug("current privileges : " + result);

                                                if (err !== null || result.length <= 0) {
                                                    logger.error("Error While verifying privileges for Module/User PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                preferenceDao.listPreferencesByLevel(data, function(err, preferences) {
                                                    if (err) {
                                                        logger.error("Error While feteching preferences by level PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                                        return cb(err, responseCode.INTERNAL_SERVER_ERROR, preferences);
                                                    } else {


                                                        var listPreferencesObj = {
                                                            levelName: data.preferencesFetchCriteria.levelName,
                                                            recordId: data.preferencesFetchCriteria.recordId,
                                                            preferences: preferences
                                                        };

                                                        preferenceConvertor.preferenceEntityToPreferenceModel(listPreferencesObj, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                                                return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
                                                            } else {
                                                                logger.info("Success. \nRecords list generated after conversion.");
                                                                return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                            }
                                                        });
                                                    }

                                                });
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.listPreferencesByLevel()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });

};

PreferenceService.prototype.listPreferencesByLevelForMassUpdate = function(data, cb) {
    var self = this;
    logger.info("Get all preferences by a level service called (listPreferencesByLevel())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error While getting current logged in user's information PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValue(data, function(err, permissionResult) {
                            if (err) {
                                logger.error("Error while verifying Permissions, Level id and record id in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error While fetching lebel information by bit value PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.debug("current privileges : " + result);

                                                if (err !== null || result.length <= 0) {
                                                    logger.error("Error While verifying privileges for Module/User PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                preferenceDao.listPreferencesByLevelForMassUpdate(data, function(err, preferences) {
                                                    if (err) {
                                                        logger.error("Error While feteching preferences by level PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                                        return cb(err, responseCode.INTERNAL_SERVER_ERROR, preferences);
                                                    } else {


                                                        var listPreferencesObj = {
                                                            levelName: data.preferencesFetchCriteria.levelName,
                                                            recordId: data.preferencesFetchCriteria.recordId,
                                                            preferences: preferences
                                                        };

                                                        preferenceConvertor.preferenceEntityToPreferenceModel(listPreferencesObj, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                                                                return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
                                                            } else {
                                                                logger.info("Success. \nRecords list generated after conversion.");
                                                                return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                            }
                                                        });
                                                    }

                                                });
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.listPreferencesByLevel()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });

};


PreferenceService.prototype.saveOrUpdatePreferences = function(data, cb) {
    var self = this;
    logger.info("Get all preferences by a level service called (listPreferencesByLevel())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                data.preferenceUpdateCriteria.levelBitValue = selectedLevel.bitValue;

                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error while verifying current user role type in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;

                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        data.preferencesFetchCriteria.levelBitValue = data.preferenceUpdateCriteria.levelBitValue;
                        data.preferencesFetchCriteria.recordId = data.preferenceUpdateCriteria.recordId;
                        
                        self.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(data, function(err, permissionResult) {

                            if (err) {
                                logger.error("Error while verifying permissions, level id and record id in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error while getting level information by bit value in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                logger.info("Unable to get level info by id in PreferenceService.prototype.saveOrUpdatePreferences()");
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.info("current privileges : " + result);
                                                if (err !== null || result.length <= 0) {
                                                    logger.error("User/Firm dos not have sufficient privileges in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                if (data.user.privilege.canUpdate) {

                                                    preferenceConvertor.savePreferenceModelToEntity(data, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            logger.error("Error while converting (Model to Entity) in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                            return cb(err, responseCodes.BAD_REQUEST, sanitizedResponse);
                                                        } else {

                                                            data.preferences = sanitizedResponse.preferences;
                                                            var recordId = data.preferenceUpdateCriteria.recordId;
                                                            preferenceDao.saveOrUpdatePreferences(data, recordId, function(err, status) {
                                                                if (err) {
                                                                    logger.error("Error while updating preferences list in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
                                                                } else {
                                                                    logger.info("preferenceDao.saveOrUpdatePreferences() executed");

                                                                    preferenceConvertor.savePreferenceEntityToModel(status, function(err, sanitizedResponse) {
                                                                        if (err) {
                                                                            logger.error("Error while convering (Entity -> Model) in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                                            return cb(messages.badRequest, responseCode.BAD_REQUEST, sanitizedResponse);
                                                                        } else {
                                                                            logger.info("Succes. \nRecords list generated after conversion.");
                                                                            return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                                        }
                                                                    });

                                                                }
                                                            });
                                                        }
                                                    });

                                                } else {
                                                    logger.info("User/Firm does not have sufficient permission to update prefernces in PreferenceService.prototype.listPreferencesByLevel()");
                                                    return cb(messages.invalidPreferencePrivileg, responseCode.UNAUTHORIZED, data.preferenceList); // temp
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.listPreferencesByLevel()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });
                    }
                });
                //     }
                // });
            }
        }
    });
};

PreferenceService.prototype.saveOrUpdateMassPreferences = function(data, cb) {
    var self = this;
    logger.info("Get all preferences by a level service called (listPreferencesByLevel())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                data.preferenceUpdateCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error while verifying current user role type in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;

                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        data.preferencesFetchCriteria.levelBitValue = data.preferenceUpdateCriteria.levelBitValue;
                        data.preferencesFetchCriteria.recordId = data.preferenceUpdateCriteria.recordId;
                        
                        self.verifyRoleTypePermissionsAndLevelBitValue(data, function(err, permissionResult) {

                            if (err) {
                                logger.error("Error while verifying permissions, level id and record id in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error while getting level information by bit value in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                logger.info("Unable to get level info by id in PreferenceService.prototype.saveOrUpdatePreferences()");
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.info("current privileges : " + result);
                                                if (err !== null || result.length <= 0) {
                                                    logger.error("User/Firm dos not have sufficient privileges in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                if (data.user.privilege.canUpdate) {

                                                    preferenceConvertor.savePreferenceModelToEntity(data, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            logger.error("Error while converting (Model to Entity) in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                            return cb(err, responseCodes.BAD_REQUEST, sanitizedResponse);
                                                        } else {

                                                            data.preferences = sanitizedResponse.preferences;


                                                            var recordCount = data.preferenceUpdateCriteria.recordIds.length;
                                                            var recordIds = data.preferenceUpdateCriteria.recordIds;
                                                            var savedPreferencesResponse = null;
                                                            for (var i = 0; i < recordCount; i++) {

                                                                var breakLoop = false;

                                                                data.preferenceUpdateCriteria.recordId = recordIds[i];
                                                                data.preferenceUpdateCriteria.recordIds =  recordIds[i];
                                                                data.preferencesFetchCriteria.recordId = data.preferenceUpdateCriteria.recordId;
                                                                var recordId = recordIds[i];
                                                                preferenceDao.verifyRecord(data, recordId, function(err, recordExistResult) {
                                                                    if (err) {
                                                                        logger.error("Error while verifying record in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(). \n " + err);
                                                                        breakLoop = true;
                                                                        if (err == messages.preferencesInvalidHeader) {
                                                                            return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
                                                                        } else if (err == messages.preferenceLevelNameNotExist) {
                                                                            return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
                                                                        } else if (err == messages.preferenceRecordIdNotExist) {
                                                                            return cb(messages.preferenceRecordIdNotExist, responseCode.NOT_FOUND, null);
                                                                        } else {
                                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                                                        }
                                                                    } else {
                                                                        if (recordExistResult <= 0) {
                                                                            logger.error("Record id does not exist preferenceService.verifyRoleTypePermissionsAndLevelBitValueAndRecordId() \n error ");
                                                                            breakLoop = true;
                                                                            return cb(messages.preferenceRecordIdNotExist, responseCode.NOT_FOUND);

                                                                        } else {

                                                                            var recordId2 = recordExistResult[0].recordId
                                                                            preferenceDao.saveOrUpdatePreferences(data, recordId2, function(err, status) {
                                                                                if (err) {
                                                                                    breakLoop = true;
                                                                                    logger.error("Error while updating preferences list in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
                                                                                } else {
                                                                                    logger.info("preferenceDao.saveOrUpdatePreferences() executed");

                                                                                    preferenceConvertor.savePreferenceEntityToModel(status, function(err, sanitizedResponse) {
                                                                                        if (err) {
                                                                                            breakLoop = true;
                                                                                            logger.error("Error while convering (Entity -> Model) in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                                                            return cb(messages.badRequest, responseCode.BAD_REQUEST, sanitizedResponse);
                                                                                        } else {
                                                                                            logger.info("Succes. \nRecords list generated after conversion.");
                                                                                            savedPreferencesResponse = sanitizedResponse
                                                                                            recordCount--;
                                                                                            if (recordCount <= 0) {
                                                                                                return cb(messages.preferencesUpdatedSuccess, responseCode.SUCCESS, messages.preferencesUpdatedSuccess);
                                                                                            }
                                                                                            //                                                                            
                                                                                        }
                                                                                    });

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });

                                                                if (breakLoop == true) {
                                                                    logger.debug("Loop break : " + i);
                                                                    break;
                                                                }
                                                            }
                                                            //                                                return cb(err, responseCode.SUCCESS, savedPreferencesResponse);
                                                        }
                                                    });

                                                } else {
                                                    logger.info("User/Firm does not have sufficient permission to update prefernces in PreferenceService.prototype.listPreferencesByLevel()");
                                                    return cb(messages.invalidPreferencePrivileg, responseCode.UNAUTHORIZED, data.preferenceList); // temp
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.listPreferencesByLevel()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });
                    }
                });
            }
        }
    });
};

PreferenceService.prototype.getPrivilegeByUserAndModule = function(data, cb) {
    privilegeDao.getPrivilegeByUserAndModule(data, function(err, result) {
        if (err) {
            logger.error("Error While getting User/Module in PreferenceService.prototype.getPrivilegeByUserAndModule() : \n" + err);
            return cb(err, result);
        } else {
            logger.info("PreferenceService.prototype.getPrivilegeByUserAndModule() executed");
            if (result.length <= 0) {
                logger.info("User does not have module privilegs in PreferenceService.prototype.getPrivilegeByUserAndModule().");
                return cb("User does not have module privilegs.", null);
            } else {
                return cb(null, result);
            }
        }
    });
};

PreferenceService.prototype.getCurrentLoggedInUserInfo = function(data, cb) {
    // get current user from redis cache.
    sharedCache.get(data.token, function(err, loggedInUser) {
        if (err) {
            logger.error("Error While executing sharedCache.get() in PreferenceService.prototype.getCurrentLoggedInUserInfo() : \n" + err);

            return cb(err, loggedInUser);
        } else {
            // if current user not define or any thing wrong happened
            if (loggedInUser == "undefined") {
                logger.error("Uable to get current loggedIn User. sharedCache.get() in PreferenceService.prototype.getCurrentLoggedInUserInfo() :  \n" + err);
                return cb("Undefined", loggedInUser);
            }

            var currentUser = {};
            try {
                currentUser = JSON.parse(loggedInUser);
            } catch (err) {
                logger.error("Error while parsing. sharedCache.get() in PreferenceService.prototype.getCurrentLoggedInUserInfo():  \n" + err);
                return cb(err, loggedInUser);
            }
            logger.info("Logged in user found. sharedCache.get() in PreferenceService.prototype.getCurrentLoggedInUserInfo().\n" + currentUser);
            return cb(err, currentUser);
        }
    });
};

PreferenceService.prototype.getPreferenceLevelFromCache = function(data, cb) {
    preferenceDao.getPreferenceLevelFromCache(data, function(err, preferenceList) {
        if (err) {
            logger.error("Error while getting preference levels from cache in PreferenceService.prototype.getPreferenceLevelFromCache():  \n" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
        } else {

            if (preferenceList.length <= 0) {
                logger.error("Error emepty list fetched from cache in PreferenceService.prototype.getPreferenceLevelFromCache().");
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            } else {
                cb(err, preferenceList);
            }
        }
    });
};

PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValue = function(data, cb) {
    var self = this;
    if (data.user.roleTypeBitValue === null || data.user.roleTypeBitValue === undefined) {
        logger.error("Error empty bit value for level in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValue().");
        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED);
    }

    var roleTypeBitValue = null

    try {
        roleTypeBitValue = parseInt(data.user.roleTypeBitValue);
    } catch (e) {
        logger.error("Error while parsing role bitValue in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValue() : \n" + e);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }

    var levelBitValue = null;

    try {
        levelBitValue = parseInt(data.preferencesFetchCriteria.levelBitValue);
    } catch (e) {
        logger.error("Error while parsing level bitValue in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValue() : \n" + e);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }

    self.getPreferenceLevelFromCache(data, function(err, prefereneList) {

        if (err) {
            logger.error("Error while getting preferences list from cache in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValue() : \n" + err);
            return cd(err, false);
        } else {
            var status = false;
            var levelIdExist = false;
            prefereneList.forEach(function(preference) {
                if (preference.bitValue == levelBitValue) {
                    levelIdExist = true;
                    try {
                        var allowedRolesBitCount = parseInt(preference.allowedRoleType);
                        if ((allowedRolesBitCount & roleTypeBitValue) == roleTypeBitValue) {
                            status = true;
                        }
                    } catch (e) {
                        logger.error("Error while verifying role permission bit value in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValue() : \n" + e);
                        status = false;
                    }
                }
            });
            if (!levelIdExist) {
                logger.error("Error \n Level id not exist in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValue()");
                return cb(messages.preferenceLevelInvalidBitValue, responseCode.NOT_FOUND);
            }
            if (status) {
                return cb(null, status);
            } else {
                logger.error("Error user does not have permissions (Role Permission) PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValue()");
                return cb(messages.Unauthorized, responseCode.UNAUTHORIZED);
            }
        }
    });
};

PreferenceService.prototype.verifyRoleTypePermissionsAndLevelId = function(data, cb) {
    var self = this;
    if (data.user.roleTypeBitValue === null || data.user.roleTypeBitValue === undefined) {
        logger.error("Error empty bit value for level in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelid().");
        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED);
    }

    var roleTypeBitValue = null

    try {
        roleTypeBitValue = parseInt(data.user.roleTypeBitValue);
    } catch (e) {
        logger.error("Error while parsing role bitValue in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelId() : \n" + e);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }

    var levelId = null;

    try {
        levelId = parseInt(data.preferencesFetchCriteria.levelBitValue);
    } catch (e) {
        logger.error("Error while parsing level id in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelId() : \n" + e);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }

    self.getPreferenceLevelFromCache(data, function(err, prefereneList) {

        if (err) {
            logger.error("Error while getting preferences list from cache in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelId() : \n" + err);
            return cd(err, false);
        } else {
            var status = false;
            var levelIdExist = false;
            prefereneList.forEach(function(preference) {
                if (preference.id == levelId) {
                    levelIdExist = true;
                    try {
                        var allowedRolesBitCount = parseInt(preference.allowedRoleType);
                        if ((allowedRolesBitCount & roleTypeBitValue) == roleTypeBitValue) {
                            status = true;
                        }
                    } catch (e) {
                        logger.error("Error while verifying role permission bit value in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelId() : \n" + e);
                        status = false;
                    }
                }
            });
            if (!levelIdExist) {
                logger.error("Error \n Level id not exist in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelId()");
                return cb(messages.preferenceLevelIdNotExist, responseCode.NOT_FOUND);
            }
            if (status) {
                return cb(null, status);
            } else {
                logger.error("Error user does not have permissions (Role Permission) PreferenceService.prototype.verifyRoleTypePermissionsAndLevelId()");
                return cb(messages.Unauthorized, responseCode.UNAUTHORIZED);
            }
        }
    });
};

PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValueAndRecordId = function(data, cb) {
    var self = this;
    if (data.user.roleTypeBitValue === null || data.user.roleTypeBitValue === undefined) {
        logger.error("Error invalid or empty role type bitValue in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValueAndRecordId().");
        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED);
    }

    var roleTypeBitValue = null

    try {
        roleTypeBitValue = parseInt(data.user.roleTypeBitValue);
    } catch (e) {
        logger.error("Error while parsing roleTypeBitvalue in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(). \n " + e);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }

    var levelBitValue = null;

    try {
        levelBitValue = parseInt(data.preferencesFetchCriteria.levelBitValue);
    } catch (e) {
        logger.error("Error while parsing level bitValue in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(). \n " + e);
        return cb("err", false);
    }


    self.getPreferenceLevelFromCache(data, function(err, prefereneList) {

        if (err) {
            return cd(err, false);
        } else {
            var status = false;
            var levelIdExist = false;
            var rcordIdExist = false;
            var len = prefereneList.length;
            for (var i = 0; i < prefereneList.length; i++) {
                var preference = prefereneList[i];

                if (preference.bitValue == levelBitValue) {
                    levelIdExist = true;
                    try {
                        var allowedRolesBitCount = parseInt(preference.allowedRoleType);
                        if ((allowedRolesBitCount & roleTypeBitValue) == roleTypeBitValue) {
                            status = true;
                            preferenceDao.verifyRecord(data, null, function(err, recordExistResult) {
                                if (err) {
                                    logger.error("Error while verifying record in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(). \n " + err);
                                    if (err == messages.preferencesInvalidHeader) {
                                        return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
                                    } else if (err == messages.preferenceLevelNameNotExist) {
                                        return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
                                    } else if (err == messages.preferenceRecordIdNotExist) {
                                        return cb(messages.preferenceRecordIdNotExist, responseCode.NOT_FOUND, null);
                                    } else {
                                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                    }

                                } else {
                                    if (recordExistResult <= 0) {
                                        logger.error("Record id does not exist preferenceService.verifyRoleTypePermissionsAndLevelBitValueAndRecordId() \n error ");
                                        return cb(messages.preferenceRecordIdNotExist, responseCode.NOT_FOUND);
                                    } else {
                                        rcordIdExist = true;
                                        return cb(null, rcordIdExist);
                                    }
                                }
                            });
                        } else {
                            len--;
                            if (len == 0) {
                                if (!levelIdExist) {
                                    logger.error("Level id does not exist in preferenceService.verifyRoleTypePermissionsAndLevelBitValueAndRecordId() Block 1 \n error ");
                                    return cb(messages.preferenceLevelIdNotExist, responseCode.NOT_FOUND);
                                }
                                if (status) {
                                    return cb(null, status);
                                } else {
                                    logger.error("User/Firm does not have sufficient  Role / Permission in preferenceService.verifyRoleTypePermissionsAndLevelBitValueAndRecordId() Block 1\n error ");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED);
                                }
                            }
                        }
                    } catch (e) {
                        logger.error("Something wronge happened while verifing credentials preferenceService.verifyRoleTypePermissionsAndLevelBitValueAndRecordId() \n error " + e);
                        status = false;
                    }
                } else {

                    len--;
                    if (len == 0) {
                        if (!levelIdExist) {
                            logger.error("Level id does not exist in preferenceService.verifyRoleTypePermissionsAndLevelBitValueAndRecordId() Block 2 \n error ");
                            return cb(messages.preferenceLevelIdNotExist, responseCode.NOT_FOUND);
                        }
                        if (status) {
                            return cb(null, status);
                        } else {
                            logger.error("User/Firm does not have sufficient  Role / Permission in preferenceService.verifyRoleTypePermissionsAndLevelBitValueAndRecordId() Block 2\n error ");
                            return cb(messages.Unauthorized, responseCode.UNAUTHORIZED);
                        }
                    }
                }
            }

        }
    });
};

PreferenceService.prototype.listCategories = function(data, cb) {
    logger.info("Get all categories servives called listCategories()");

    var self = this;


    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
        	if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error while getting logged in user info in PreferenceService.prototype.listCategories().\n " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValue(data, function(err, persmissonResult) {
                            if (err) {
                                logger.error("Error while verifying current User's role type in PreferenceService.prototype.listCategories().\n " + err);
                                return cb(err, persmissonResult);
                            } else {
                                if (persmissonResult) {
                                    preferenceDao.listCategories(data, function(err, rows) {
                                        if (err) {
                                            logger.error("Error while fetching list of categories in PreferenceService.prototype.listCategories().\n " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, rows);

                                        } else {
                                            logger.info("Get all preference categories list service returned successfully preferenceDao.listCategories()");

                                            preferenceConvertor.categoryResultSetToModel(rows, function(err, sanitizedResponse) {
                                                if (err) {
                                                    logger.error("Error while converting (Result to Model) in PreferenceService.prototype.listCategories().\n " + err);
                                                    return cb(messages.badRequest, responseCode.BAD_REQUEST, sanitizedResponse);
                                                } else {
                                                    logger.info("List categories final response generated in PreferenceService.prototype.listCategories().")
                                                    return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                }
                                            });

                                        }
                                    });
                                } else {
                                    logger.error("Error user/ firm does not have sufficient role permission in PreferenceService.prototype.listCategories().");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });
};

PreferenceService.prototype.getPreferenceDashboardSummary = function(data, cb) {
    var self = this;

    var prefSummary = {
        PreferenceTotal: 0,
        PreferenceEditedToday: 0,
        PreferenceEditedInWeek: 0
    }
    self.listAllPreferenceLevels(data, function(err, httpStatus, prfernceLevels) {
        if (err) {
            logger.error("Error while listing all preferences level in PreferenceService.prototype.getPreferenceDashboardSummary(). \n" + err);
            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, 0);
        } else {
            if (prfernceLevels.length > 0) {
                var levelBitValues = [];

                prfernceLevels.forEach(function(level) {
                    levelBitValues.push(level.bitValue);
                });

                logger.info("Level's Allowed to Current User : " + JSON.stringify(levelBitValues));

                data.fetchCriteria = {
                    levelBitValues: levelBitValues
                };
                self.getUserPreferenceSummary(data, function(err, result) {
                    if (err) {
                        logger.error("Error while getting user's preferneces summary in PreferenceService.prototype.getPreferenceDashboardSummary(). \n" + err);
                        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, result);
                    } else {
                        logger.info("Preferences allowed to Current User's firm : " + result);

                        prefSummary.PreferenceTotal = result.total;
                        prefSummary.PreferenceEditedToday = result.editedToday;
                        prefSummary.PreferenceEditedInWeek = result.editedBefore;

                        return cb(err, responseCode.SUCCESS, prefSummary);
                    }
                });
            } else {
                logger.info("No Level allowed for current user's firm.");
                return cb(err, responseCode.SUCCESS, prefSummary);
            }
        }
    });
};

PreferenceService.prototype.getUserPreferenceCount = function(data, cb) {

    preferenceDao.getUserPreferenceCount(data, function(err, result) {
        if (err) {
            logger.error("Error while getting user's prefernce count in PreferenceService.prototype.getUserPreferenceCount(). \n" + err);
            cb(err, result);
        } else {
            if (result.length > 0) {
                cb(err, result[0].PrefCount);
            } else {
                cb(err, 0);
            }

        }
    });
};

PreferenceService.prototype.getUserPreferenceSummary = function(data, cb) {
    var DayToGoBack = 7;
    var preferenceSummary = {
        total: 0,
        editedToday: 0,
        editedBefore: 0
    }

    preferenceDao.getUserPreferenceCount(data, function(err, result) {
        if (err) {
            logger.error("Error while getting user's prefernce count in PreferenceService.prototype.getUserPreferenceSummary(). \n" + err);
            cb(err, result);
        } else {
            //            
            if (result.length > 0) {
//                preferenceSummary.total = result[0].PrefCount;
                preferenceSummary.total = null;
            } else {
                logger.info("Total preference not available.")
            }
            preferenceDao.getUserPreferenceEditedAfter(data, DayToGoBack, function(err, result2) {
                if (err) {
                    logger.error("Error while getting edited today prefernce count in PreferenceService.prototype.getUserPreferenceSummary(). \n" + err);
                    cb(err, result2);
                } else {
                    if (result2.length > 0) {
                        preferenceSummary.editedBefore = result2[0].PrefCount;
                    } else {
                        logger.info("Preferences edited in last week not available.")
                    }
                    preferenceDao.getUserPreferenceEditedOn(data, function(err, result3) {
                        if (err) {
                            logger.error("Error while getting edited in week prefernce count in PreferenceService.prototype.getUserPreferenceSummary(). \n" + err);
                            cb(err, result3);
                        } else {
                            if (result3.length > 0) {
                                preferenceSummary.editedToday = result3[0].PrefCount;
                            } else {
                                logger.info("Preferences edited today not available.")
                            }

                            return cb(err, preferenceSummary);
                        }
                    });
                }
            });

        }
    });
};

PreferenceService.prototype.getLocationOptimizationSetting = function(data, cb) {
    var self = this;
    logger.info("Get location setting by a level service called (getLocationOptimizationSetting())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.getLocationOptimizationSetting:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error While getting current logged in user's information PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValue(data, function(err, permissionResult) {
                            if (err) {
                                logger.error("Error while verifying Permissions, Level id and record id in PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error While fetching lebel information by bit value PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.debug("current privileges : " + result);

                                                if (err !== null || result.length <= 0) {
                                                    logger.error("Error While verifying privileges for Module/User PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                preferenceDao.getLocationOptimizationSetting(data, function(err, preferences) {
                                                    if (err) {
                                                        logger.error("Error While feteching preferences by level PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                                                        if (err == messages.notFound) {
                                                            return cb(err, responseCode.NOT_FOUND, preferences);
                                                        } else {
                                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR, preferences);
                                                        }
                                                    } else {

                                                        preferenceConvertor.locationOptimizationEntityToModel(preferences, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                                                                return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
                                                            } else {
                                                                logger.info("Success. \nRecords list generated after conversion.");
                                                                return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                            }
                                                        });
                                                    }

                                                });
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.getLocationOptimizationSetting()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });

};

PreferenceService.prototype.getCommunityStrategistSetting = function(data, cb) {
	var self = this;
    logger.info("Get cummunity strategist setting by a level service called (getCommunityStrategistSetting())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.getCommunityStrategistSetting:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error While getting current logged in user's information PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(data, function(err, permissionResult) {
                            if (err) {
                                logger.error("Error while verifying Permissions, Level id and record id in PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error While fetching lebel information by bit value PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.debug("current privileges : " + result);

                                                if (err !== null || result.length <= 0) {
                                                    logger.error("Error While verifying privileges for Module/User PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                preferenceDao.getCommunityStrategistSetting(data, function(err, preferences) {
                                                    if (err) {
                                                        logger.error("Error While feteching preferences by level PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                                        if (err == messages.notFound) {
                                                            return cb(err, responseCode.NOT_FOUND, preferences);
                                                        } else {
                                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR, preferences);
                                                        }
                                                    } else {

                                                        preferenceConvertor.communityStrategistEntityToModel(preferences, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                                                return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
                                                            } else {
                                                                logger.info("Success. \nRecords list generated after conversion.");
                                                                return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                            }
                                                        });
                                                    }

                                                });
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.getLocationOptimizationSetting()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });
};

PreferenceService.prototype.getSecurityPreferences = function(data, cb) {
	var self = this;
    logger.info("Get security preferences by a level service called (getSecurityPreferences())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.getSecurityPreferences:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error While getting current logged in user's information PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(data, function(err, permissionResult) {
                            if (err) {
                                logger.error("Error while verifying Permissions, Level id and record id in PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error While fetching lebel information by bit value PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.debug("current privileges : " + result);

                                                if (err !== null || result.length <= 0) {
                                                    logger.error("Error While verifying privileges for Module/User PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                preferenceDao.getSecurityPreferences(data, function(err, preferences) {
                                                    if (err) {
                                                        logger.error("Error While feteching preferences by level PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                                                        if (err == messages.notFound) {
                                                            return cb(err, responseCode.NOT_FOUND, preferences);
                                                        } else {
                                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR, preferences);
                                                        }
                                                    } else {

//                                                        preferenceConvertor.communityStrategistEntityToModel(preferences, function(err, sanitizedResponse) {
//                                                            if (err) {
//                                                                logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
//                                                                return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
//                                                            } else {
                                                                logger.info("Success. \nRecords list generated after conversion.");
                                                                return cb(err, responseCode.SUCCESS, preferences);
//                                                            }
//                                                        });
                                                    }

                                                });
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.getSecurityPreferences()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });
};


PreferenceService.prototype.getMasterSecurityPreferences = function(data, cb) {
	var self = this;
    logger.info("Get security preferences by a level service called (getSecurityPreferences())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.getSecurityPreferences:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error While getting current logged in user's information PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValue(data, function(err, permissionResult) {
                            if (err) {
                                logger.error("Error while verifying Permissions, Level id and record id in PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error While fetching lebel information by bit value PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.debug("current privileges : " + result);

                                                if (err !== null || result.length <= 0) {
                                                    logger.error("Error While verifying privileges for Module/User PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                preferenceDao.getSecurityPreferences(data, function(err, preferences) {
                                                    if (err) {
                                                        logger.error("Error While feteching preferences by level PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
                                                        if (err == messages.notFound) {
                                                            return cb(err, responseCode.NOT_FOUND, preferences);
                                                        } else {
                                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR, preferences);
                                                        }
                                                    } else {

//                                                        preferenceConvertor.communityStrategistEntityToModel(preferences, function(err, sanitizedResponse) {
//                                                            if (err) {
//                                                                logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.getSecurityPreferences() :\n  " + err);
//                                                                return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
//                                                            } else {
                                                                logger.info("Success. \nRecords list generated after conversion.");
                                                                return cb(err, responseCode.SUCCESS, preferences);
//                                                            }
//                                                        });
                                                    }

                                                });
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.getSecurityPreferences()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });
};


PreferenceService.prototype.updateCommunityStrategist = function(data, cb) {
    var self = this;
    logger.info("update community strategist service called (updateCommunityStrategist())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.updateCommunityStrategist:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.updateCommunityStrategist :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.updateCommunityStrategist :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.updateCommunityStrategist:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                data.preferenceUpdateCriteria.levelBitValue = selectedLevel.bitValue;

                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error while verifying current user role type in PreferenceService.prototype.updateCommunityStrategist() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;

                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        data.preferencesFetchCriteria.levelBitValue = data.preferenceUpdateCriteria.levelBitValue;
                        data.preferencesFetchCriteria.recordId = data.preferenceUpdateCriteria.recordId;
                        
                        self.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(data, function(err, permissionResult) {

                            if (err) {
                                logger.error("Error while verifying permissions, level id and record id in PreferenceService.prototype.updateCommunityStrategist() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error while getting level information by bit value in PreferenceService.prototype.updateCommunityStrategist() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                logger.info("Unable to get level info by id in PreferenceService.prototype.updateCommunityStrategist()");
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                            data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.info("current privileges : " + result);
                                                if (err !== null || result.length <= 0) {
                                                    logger.error("User/Firm dos not have sufficient privileges in PreferenceService.prototype.updateCommunityStrategist() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                if (data.user.privilege.canUpdate) {

                                                    preferenceConvertor.communityStrategistModelToEntity(data, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            logger.error("Error while converting (Model to Entity) in PreferenceService.prototype.updateCommunityStrategist() :\n  " + err);
                                                            return cb(err, responseCodes.BAD_REQUEST, sanitizedResponse);
                                                        } else {

                                                        	
                                                            data.strategists = sanitizedResponse;
                                                            var recordId = data.preferenceUpdateCriteria.recordId;
                                                            var preferenceValueId = null;
                                                            var pref = {
                                                            		preferenceId: data.preferencesFetchCriteria.communityStrategistPreferenceId,
                                                            		strategists: sanitizedResponse.strategists,
                                                            		id: data.preferencesFetchCriteria.communityStrategistPreferenceId
                                                            };
                                                            
                                                            preferenceDao.getPreferenceValue(data, pref, function(err, preferenceStatus){
                                                            	if(err){
                                                            		logger.error("Error while getting preference status in PreferenceService.prototype.updateCommunityStrategist() :\n  " + err);
                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
                                                            	} else {
                                                            		if(preferenceStatus.length > 0){
                                                            			preferenceValueId = preferenceStatus[0].PrefId;
                                                            		} 
                                                            		
                                                                    preferenceDao.updateCommunityStrategist(data, preferenceValueId, pref, function(err, status) {
                                                                        if (err) {
                                                                            logger.error("Error while updating preferences list in PreferenceService.prototype.updateCommunityStrategist() :\n  " + err);
                                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
                                                                        } else {
                                                                            logger.info("preferenceDao.updateCommunityStrategist() executed");
                                                                            preferenceConvertor.communityStrategistEntityToModel(status, function(err, sanitizedResponse) {
                                                                                if (err) {
                                                                                    logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                                                                    return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
                                                                                } else {
                                                                                    logger.info("Success. \nRecords list generated after conversion.");
                                                                                    return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                                                }
                                                                            });

                                                                        }
                                                                    });
                                                            	}
                                                            })
                                                 
                                                        }
                                                    });

                                                } else {
                                                    logger.info("User/Firm does not have sufficient permission to update prefernces in PreferenceService.prototype.listPreferencesByLevel()");
                                                    return cb(messages.invalidPreferencePrivileg, responseCode.UNAUTHORIZED, data.preferenceList); // temp
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.listPreferencesByLevel()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });
                    }
                });
                //     }
                // });
            }
        }
    });
};

PreferenceService.prototype.updateLocationOptimization = function(data, cb) {
    var self = this;
    logger.info("update community strategist service called (updateLocationOptimization())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.updateLocationOptimization:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.updateLocationOptimization :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.updateLocationOptimization :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.updateLocationOptimization:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                data.preferenceUpdateCriteria.levelBitValue = selectedLevel.bitValue;

                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error while verifying current user role type in PreferenceService.prototype.updateLocationOptimization() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;

                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        data.preferencesFetchCriteria.levelBitValue = data.preferenceUpdateCriteria.levelBitValue;
                        data.preferencesFetchCriteria.recordId = data.preferenceUpdateCriteria.recordId;
                        
                        self.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(data, function(err, permissionResult) {

                            if (err) {
                                logger.error("Error while verifying permissions, level id and record id in PreferenceService.prototype.updateLocationOptimization() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error while getting level information by bit value in PreferenceService.prototype.updateLocationOptimization() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                logger.info("Unable to get level info by id in PreferenceService.prototype.updateLocationOptimization()");
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                            data.categoryCode = privilegeName;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.info("current privileges : " + result);
                                                if (err !== null || result.length <= 0) {
                                                    logger.error("User/Firm dos not have sufficient privileges in PreferenceService.prototype.updateLocationOptimization() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                if (data.user.privilege.canUpdate) {

                                                    preferenceConvertor.LocationOptimizationModelToEntity(data, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            logger.error("Error while converting (Model to Entity) in PreferenceService.prototype.updateLocationOptimization() :\n  " + err);
                                                            return cb(err, responseCodes.BAD_REQUEST, sanitizedResponse);
                                                        } else {

                                                            data.strategists = sanitizedResponse;
                                                            
                                                            var recordId = data.preferenceUpdateCriteria.recordId;
                                                            var preferenceValueId = null;
                                                            var pref = {
                                                            		preferenceId: data.preferencesFetchCriteria.locationSettingPreferenceId,
                                                            		subClasses: sanitizedResponse.subClasses,
                                                            		id: data.preferencesFetchCriteria.locationSettingPreferenceId
                                                            };
                                                            
                                                            preferenceDao.getPreferenceValue(data, pref, function(err, preferenceStatus){
                                                            	if(err){
                                                            		logger.error("Error while getting preference status in PreferenceService.prototype.updateCommunityStrategist() :\n  " + err);
                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
                                                            	} else {
                                                            		if(preferenceStatus.length > 0){
                                                            			preferenceValueId = preferenceStatus[0].PrefId;
                                                            		} 
                                                            		
                                                            preferenceDao.updateLocationOptimization(data, preferenceValueId, pref, function(err, status) {
                                                                if (err) {
                                                                    logger.error("Error while updating preferences list in PreferenceService.prototype.updateLocationOptimization() :\n  " + err);
                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
                                                                } else {
                                                                    logger.info("preferenceDao.updateLocationOptimization() executed");
                                                                    preferenceConvertor.locationOptimizationEntityToModel(status, function(err, sanitizedResponse) {
                                                                        if (err) {
                                                                            logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.getLocationOptimizationSetting() :\n  " + err);
                                                                            return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
                                                                        } else {
                                                                            logger.info("Success. \nRecords list generated after conversion.");
                                                                            return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                            	}
                                                            });
                                                        }
                                                    });

                                                } else {
                                                    logger.info("User/Firm does not have sufficient permission to update prefernces in PreferenceService.prototype.listPreferencesByLevel()");
                                                    return cb(messages.invalidPreferencePrivileg, responseCode.UNAUTHORIZED, data.preferenceList); // temp
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.listPreferencesByLevel()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });
                    }
                });
            }
        }
    });
};

PreferenceService.prototype.saveOrUpdatePreferencesAll = function(data, cb) {
    var self = this;
    logger.info("Get all preferences by a level service called (listPreferencesByLevel())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                data.preferenceUpdateCriteria.levelBitValue = selectedLevel.bitValue;

                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error while verifying current user role type in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;

                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        data.preferencesFetchCriteria.levelBitValue = data.preferenceUpdateCriteria.levelBitValue;
                        data.preferencesFetchCriteria.recordId = data.preferenceUpdateCriteria.recordId;
                        
                        self.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(data, function(err, permissionResult) {

                            if (err) {
                                logger.error("Error while verifying permissions, level id and record id in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error while getting level information by bit value in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                logger.info("Unable to get level info by id in PreferenceService.prototype.saveOrUpdatePreferences()");
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.info("current privileges : " + result);
                                                if (err !== null || result.length <= 0) {
                                                    logger.error("User/Firm dos not have sufficient privileges in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                if (data.user.privilege.canUpdate) {

                                                    self.generateCombinedPreferencesList(data, function(err, combinedPreferences) {
                                                        if (err) {
                                                            logger.error("Error while combining preferences in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                            return cb(messages.badRequest, responseCode.BAD_REQUEST, combinedPreferences);
                                                        } else {

                                                            data.preferences = combinedPreferences;
                                                            var recordId = data.preferenceUpdateCriteria.recordId;
                                                            preferenceDao.saveOrUpdatePreferencesAll(data, recordId, function(err, status) {
                                                                if (err) {
                                                                    logger.error("Error while updating preferences list in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
                                                                } else {
                                                                    logger.info("preferenceDao.saveOrUpdatePreferences() executed");
//
                                                                    preferenceConvertor.savePreferenceEntityToModel(status, function(err, sanitizedResponse) {
                                                                        if (err) {
                                                                            logger.error("Error while convering (Entity -> Model) in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                                            return cb(messages.badRequest, responseCode.BAD_REQUEST, status);
                                                                        } else {
                                                                            logger.info("Succes. \nRecords list generated after conversion.");
                                                                            return cb(err, responseCode.SUCCESS, status);
                                                                        }
                                                                    });

                                                                }
                                                            });
                                                        }
                                                    });

                                                } else {
                                                    logger.info("User/Firm does not have sufficient permission to update prefernces in PreferenceService.prototype.listPreferencesByLevel()");
                                                    return cb(messages.invalidPreferencePrivileg, responseCode.UNAUTHORIZED, data.preferenceList); // temp
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.listPreferencesByLevel()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });
                    }
                });
            }
        }
    });
};

PreferenceService.prototype.saveOrUpdateMassPreferencesAll = function(data, cb) {
    var self = this;
    logger.info("Get all preferences by a level service called (listPreferencesByLevel())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.listPreferencesByLevel :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.listPreferencesByLevel:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                data.preferenceUpdateCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error while verifying current user role type in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;

                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        data.preferencesFetchCriteria.levelBitValue = data.preferenceUpdateCriteria.levelBitValue;
                        data.preferencesFetchCriteria.recordId = data.preferenceUpdateCriteria.recordId;
                        
                        self.verifyRoleTypePermissionsAndLevelBitValue(data, function(err, permissionResult) {

                            if (err) {
                                logger.error("Error while verifying permissions, level id and record id in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error while getting level information by bit value in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                logger.info("Unable to get level info by id in PreferenceService.prototype.saveOrUpdatePreferences()");
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.info("current privileges : " + result);
                                                if (err !== null || result.length <= 0) {
                                                    logger.error("User/Firm dos not have sufficient privileges in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                if (data.user.privilege.canUpdate) {

                                                    self.generateCombinedPreferencesList(data, function(err, combinedPreferences) {
                                                        if (err) {
                                                            logger.error("Error while combining preferences in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                            return cb(messages.badRequest, responseCode.BAD_REQUEST, combinedPreferences);
                                                        } else {

                                                            data.preferences = combinedPreferences;

                                                            var recordCount = data.preferenceUpdateCriteria.recordIds.length;
                                                            var recordIds = data.preferenceUpdateCriteria.recordIds;
                                                            var savedPreferencesResponse = null;
                                                            for (var i = 0; i < recordCount; i++) {

                                                                var breakLoop = false;

                                                                data.preferenceUpdateCriteria.recordId = recordIds[i];
                                                                data.preferenceUpdateCriteria.recordIds =  recordIds[i];
                                                                data.preferencesFetchCriteria.recordId = data.preferenceUpdateCriteria.recordId;
                                                                var recordId = recordIds[i];
                                                                preferenceDao.verifyRecord(data, recordId, function(err, recordExistResult) {
                                                                    if (err) {
                                                                        logger.error("Error while verifying record in PreferenceService.prototype.verifyRoleTypePermissionsAndLevelBitValueAndRecordId(). \n " + err);
                                                                        breakLoop = true;
                                                                        if (err == messages.preferencesInvalidHeader) {
                                                                            return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
                                                                        } else if (err == messages.preferenceLevelNameNotExist) {
                                                                            return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
                                                                        } else if (err == messages.preferenceRecordIdNotExist) {
                                                                            return cb(messages.preferenceRecordIdNotExist, responseCode.NOT_FOUND, null);
                                                                        } else {
                                                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                                                        }
                                                                    } else {
                                                                        if (recordExistResult <= 0) {
                                                                            logger.error("Record id does not exist preferenceService.verifyRoleTypePermissionsAndLevelBitValueAndRecordId() \n error ");
                                                                            breakLoop = true;
                                                                            return cb(messages.preferenceRecordIdNotExist, responseCode.NOT_FOUND);

                                                                        } else {

                                                                            var recordId2 = recordExistResult[0].recordId
                                                                            preferenceDao.saveOrUpdatePreferencesAll(data, recordId2, function(err, status) {
                                                                                if (err) {
                                                                                    breakLoop = true;
                                                                                    logger.error("Error while updating preferences list in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                                                    return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, status);
                                                                                } else {
                                                                                    logger.info("preferenceDao.saveOrUpdatePreferences() executed");

                                                                                    preferenceConvertor.savePreferenceEntityToModel(status, function(err, sanitizedResponse) {
                                                                                        if (err) {
                                                                                            breakLoop = true;
                                                                                            logger.error("Error while convering (Entity -> Model) in PreferenceService.prototype.saveOrUpdatePreferences() :\n  " + err);
                                                                                            return cb(messages.badRequest, responseCode.BAD_REQUEST, sanitizedResponse);
                                                                                        } else {
                                                                                            logger.info("Succes. \nRecords list generated after conversion.");
                                                                                            savedPreferencesResponse = sanitizedResponse
                                                                                            recordCount--;
                                                                                            if (recordCount <= 0) {
                                                                                                return cb(messages.preferencesUpdatedSuccess, responseCode.SUCCESS, messages.preferencesUpdatedSuccess);
                                                                                            }
                                                                                            //                                                                            
                                                                                        }
                                                                                    });

                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });

                                                                if (breakLoop == true) {
                                                                    logger.debug("Loop break : " + i);
                                                                    break;
                                                                }
                                                            }
                                                            //                                                return cb(err, responseCode.SUCCESS, savedPreferencesResponse);
                                                        }
                                                    });

                                                } else {
                                                    logger.info("User/Firm does not have sufficient permission to update prefernces in PreferenceService.prototype.listPreferencesByLevel()");
                                                    return cb(messages.invalidPreferencePrivileg, responseCode.UNAUTHORIZED, data.preferenceList); // temp
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.listPreferencesByLevel()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });
                    }
                });
            }
        }
    });
};

PreferenceService.prototype.getMasterLocationOptimizationSetting = function(data, cb) {
    var self = this;
    logger.info("Get location setting by a level service called (getMasterLocationOptimizationSetting())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.getMasterLocationOptimizationSetting:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error While getting current logged in user's information PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValue(data, function(err, permissionResult) {
                            if (err) {
                                logger.error("Error while verifying Permissions, Level id and record id in PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error While fetching lebel information by bit value PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.debug("current privileges : " + result);

                                                if (err !== null || result.length <= 0) {
                                                    logger.error("Error While verifying privileges for Module/User PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                preferenceDao.getLocationOptimizationSetting(data, function(err, preferences) {
                                                    if (err) {
                                                        logger.error("Error While feteching preferences by level PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                                                        if (err == messages.notFound) {
                                                            return cb(err, responseCode.NOT_FOUND, preferences);
                                                        } else {
                                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR, preferences);
                                                        }
                                                    } else {

                                                        preferenceConvertor.locationOptimizationEntityToModel(preferences, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.getMasterLocationOptimizationSetting() :\n  " + err);
                                                                return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
                                                            } else {
                                                                logger.info("Success. \nRecords list generated after conversion.");
                                                                return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                            }
                                                        });
                                                    }

                                                });
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.getMasterLocationOptimizationSetting()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });

};

PreferenceService.prototype.getMasterCommunityStrategistSetting = function(data, cb) {
	var self = this;
    logger.info("Get cummunity strategist setting by a level service called (getCommunityStrategistSetting())\n");
    preferenceDao.getLevelByName(data, function(err, selectedLevel) {
        if (err) {
            if (err == messages.preferencesInvalidHeader) {
                logger.error("Error Invalid header values in PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                return cb(messages.preferencesInvalidHeader, responseCode.BAD_REQUEST, null);
            } else if (err == messages.preferenceLevelNameNotExist) {
                logger.error("Error Invalid lebel name in PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND, null);
            } else {
                logger.error("Error while getting level id for level name in PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            }
        } else {
            if (selectedLevel == null) {
                logger.error("Error level id not found in PreferenceService.prototype.getCommunityStrategistSetting:\n  " + err);
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
            } else {
                data.preferencesFetchCriteria.levelBitValue = selectedLevel.bitValue;
                self.getCurrentLoggedInUserInfo(data, function(err, currentUser) {
                    if (err) {
                        logger.error("Error While getting current logged in user's information PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                        return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                    } else {
                        data.user.roleId = currentUser.roleId;
                        data.user.roleTypeBitValue = currentUser.roleTypeBitValue;
                        self.verifyRoleTypePermissionsAndLevelBitValue(data, function(err, permissionResult) {
                            if (err) {
                                logger.error("Error while verifying Permissions, Level id and record id in PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                return cb(err, permissionResult);
                            } else {
                                if (permissionResult) {
                                    self.getLevelByBitValue(data, function(err, levelName) {
                                        if (err) {
                                            logger.error("Error While fetching lebel information by bit value PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                        } else {
                                            if (levelName.length <= 0) {
                                                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, null);
                                            }

                                            var privilegeName = ((levelName[0].name).toUpperCase()) + "PREF"
                                              data.categoryCode = privilegeName;;
                                            data.moduleName = constants.orineModule.Preference;

                                            self.getPrivilegeByUserAndModule(data, function(err, result) {

                                                logger.debug("current privileges : " + result);

                                                if (err !== null || result.length <= 0) {
                                                    logger.error("Error While verifying privileges for Module/User PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                                }

                                                data.user.privilege = result[0];
                                                preferenceDao.getCommunityStrategistSetting(data, function(err, preferences) {
                                                    if (err) {
                                                        logger.error("Error While feteching preferences by level PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                                        if (err == messages.notFound) {
                                                            return cb(err, responseCode.NOT_FOUND, preferences);
                                                        } else {
                                                            return cb(err, responseCode.INTERNAL_SERVER_ERROR, preferences);
                                                        }
                                                    } else {

                                                        preferenceConvertor.communityStrategistEntityToModel(preferences, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                logger.error("Error While converting (Entity -> Model) PreferenceService.prototype.getCommunityStrategistSetting() :\n  " + err);
                                                                return cb(err, responseCode.BAD_REQUEST, sanitizedResponse);
                                                            } else {
                                                                logger.info("Success. \nRecords list generated after conversion.");
                                                                return cb(err, responseCode.SUCCESS, sanitizedResponse);
                                                            }
                                                        });
                                                    }

                                                });
                                            });
                                        }
                                    });
                                } else {
                                    logger.info("User/Firm does not have sufficient permission in PreferenceService.prototype.getLocationOptimizationSetting()");
                                    return cb(messages.Unauthorized, responseCode.UNAUTHORIZED, null);
                                }
                            }
                        });

                    }
                });
            }
        }
    });
};


PreferenceService.prototype.generateCombinedPreferencesList = function(data, cb) {

    var preferencesList = [];

    try {
        var defaultPreferences = null;
        var locationOptimizationPreference = null;
        var communityStrategistPreference = null;
        var securityPreference = null;


        if (data.defaultPreferences != null)
            defaultPreferences = data.defaultPreferences;

        if (data.locationOptimizationPreference != null && data.locationOptimizationPreference.subClasses != null) {
            locationOptimizationPreference = data.locationOptimizationPreference;
        } else {
            logger.info("Skipping Location Optimization Preferences For Update.")
        }

        if (data.securityPreferences != null && data.securityPreferences.securities != null) {
            securityPreference = data.securityPreferences;
        } else {
            logger.info("Skipping Security Setting Preferences Preferences For Update.")
        }

        if (data.communityStrategistPreference != null && data.communityStrategistPreference.strategists != null) {
            communityStrategistPreference = data.communityStrategistPreference;
        } else {
            logger.info("Skipping Community Strategist Preferences For Update.")
        }
        
        if (defaultPreferences != null)
            for (var i = 0; i < defaultPreferences.length; i++) {
                defaultPreferences[i].type = constants.preferenceType.default;
                preferencesList.push(defaultPreferences[i]);
            }

        if (locationOptimizationPreference != null) {
            locationOptimizationPreference.type = constants.preferenceType.location;
            preferencesList.push(locationOptimizationPreference);
        }

        if (communityStrategistPreference != null) {
            communityStrategistPreference.type = constants.preferenceType.communityStrategist;
            preferencesList.push(communityStrategistPreference);
        }
        
        if (securityPreference != null) {
        	securityPreference.type = constants.preferenceType.securityPreference;
            preferencesList.push(securityPreference);
        }


    } catch (err) {
        logger.error("Error while combining all type of preference in generateCombinedPreferencesList() :\n" + err);
        return cb(err, preferencesList);
    }

    return cb(null, preferencesList);
}

module.exports = PreferenceService;