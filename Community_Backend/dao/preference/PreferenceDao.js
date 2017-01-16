"use strict";

var moduleName = __filename;
var async = require('async');
var config = require('config');
var casting = require('casting');
var messages = config.messages;
var constants = config.orionConstants;
var responseCode = config.responseCodes;
var localCache = require('service/cache').local
var logger = require('helper/Logger')(moduleName);
var utilFunctions = require('dao/util/UtilDao');
var baseDao = require('dao/BaseDao');
var preferenceConvertor = new(require("converter/preference/PreferenceConvertor"))();
var LOCATION_SETTING = 'location_Setting';
var utilService = new(require('service/util/UtilService'))();

var PreferencesDao = function() {}

// List All levels service method
PreferencesDao.prototype.listAllPreferenceLevels = function(data, cb) {

    var firmConnection = baseDao.getConnection(data);

    var query = "SELECT * FROM preferenceLevel p where (p.allowedRoleType & ? ) = ?";

    firmConnection.query(query, [data.roleType, data.roleType], function(err, rows, fields) {
        preferenceConvertor.levelResultSetToLevelEntity(rows, function(err, sanitizedResponse) {
            if (err) {
                logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.listAllPreferenceLevels(). \n Error :" + err);
                return cb(err, sanitizedResponse);
            } else {
                logger.info("Successfully executed Query : " + query + " in PreferencesDao.prototype.listAllPreferenceLevels().");
                return cb(err, sanitizedResponse);
            }
        });
    });
};

//List level by id service method
PreferencesDao.prototype.getLevelById = function(data, cb) {

    var firmConnection = baseDao.getConnection(data);

    var myQuery = "SELECT * FROM preferenceLevel where id = ?";

    firmConnection.query(myQuery, [data.preferencesFetchCriteria.levelBitValue], function(err, rows, fields) {
        preferenceConvertor.levelResultSetToLevelEntity(rows, function(err, sanitizedResponse) {
            if (err) {
                logger.error("Error while executing Query : " + myQuery + " in PreferencesDao.prototype.getLevelById(). \n Error :" + err);
                return cb(err, sanitizedResponse);
            } else {
                logger.info("Successfully executed Query : " + myQuery + " in PreferencesDao.prototype.getLevelById().");
                return cb(err, sanitizedResponse);
            }
        });
    });
};

// List level by id service method
PreferencesDao.prototype.getLevelByBitValue = function(data, cb) {

    var firmConnection = baseDao.getConnection(data);

    var myQuery = "SELECT name FROM preferenceLevel where bitValue = ?";

    firmConnection.query(myQuery, [data.preferencesFetchCriteria.levelBitValue], function(err, rows, fields) {
        if (err) {
            logger.error("Error while executing Query : " + myQuery + " in PreferencesDao.prototype.getLevelByBitValue(). \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + myQuery + " in PreferencesDao.prototype.getLevelByBitValue().");
            return cb(err, rows);
        }
    });
};

PreferencesDao.prototype.getPreferenceLevelFromCache = function(data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var preferenceLevelCache = null;

    try {
        preferenceLevelCache = localCache.get('preferenceLevel');
    } catch (err) {
        logger.error("Error while executing Query : " + myQuery + " in PreferencesDao.prototype.getPreferenceLevelFromCache. \n Error :" + err);
        return cb(err, null);
    }

    if (preferenceLevelCache == null) {
        var query = "SELECT * FROM preferenceLevel ";

        firmConnection.query(query, function(err, rows, fields) {
            preferenceConvertor.levelResultSetToLevelEntity(rows, function(err, sanitizedResponse) {
                if (err) {
                    logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.getPreferenceLevelFromCache() -> preferenceConvertor.levelResultSetToLevelEntity(). \n Error :" + err);
                    return cb(err, sanitizedResponse);
                } else {
                    logger.debug("Updating cache with preferences levels in PreferencesDao.prototype.getPreferenceLevelFromCache().");
                    localCache.put('preferenceLevel', sanitizedResponse);
                    return cb(err, sanitizedResponse);
                }
            });
        });
    } else {
        logger.debug("Fetching preferences level's list from Cache PreferencesDao.prototype.getPreferenceLevelFromCache().")
        cb(null, preferenceLevelCache);
    }
};

PreferencesDao.prototype.getLevelByName = function(data, cb) {
    var self = this;

    if (data.preferencesFetchCriteria.levelName == undefined || data.preferencesFetchCriteria.levelName == null) {
        cb(messages.preferencesInvalidHeader, null);
    }

    self.getPreferenceLevelFromCache(data, function(err, levels) {
        if (err) {
            logger.error("Error while getting levels from cache  PreferencesDao.prototype.getLevelByName()");
            return cb(messages.internalServerError, null);
        } else {
            var length = levels.length;
            logger.debug("LeveLSend : " + data.preferencesFetchCriteria.levelName);
            var levelName = data.preferencesFetchCriteria.levelName.toLowerCase();
            var selectedLevel = null;
            for (var i = 0; i < length; i++) {
                logger.debug("------------ " + JSON.stringify(levels[i]));
                if (((levels[i]).name).toLowerCase() == levelName) {
                    selectedLevel = levels[i];
                    break;
                }
            }

            if (selectedLevel != null) {
                return cb(null, selectedLevel);
            }
            return cb(messages.preferenceLevelNameNotExist, responseCode.NOT_FOUND);
        }
    });
}

PreferencesDao.prototype.getPreferenceById = function(data, cb) {
    var self = this
    var firmConnection = baseDao.getConnection(data);

    var myQuery = "SELECT * FROM preference where id = ? and isDeleted = 0";;

    firmConnection.query(myQuery, [data.preferencesFetchCriteria.preferenceId], function(err, rows, fields) {
        if (err) {
            logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.getPreferenceById(). \n Error :" + err);
            return cb(err, rows);
        } else {
            if (rows.length > 0) {
                return cb(err, rows);
            } else {
                return cb(err, rows);
            }

        }
    });
};

//Service method to get All preferences corresponding provided level information
PreferencesDao.prototype.listPreferencesByLevel = function(data, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var preferenceLevelInfoQuery = "Select * from preferenceLevel pl where pl.bitValue = ?";

    firmConnection.query(preferenceLevelInfoQuery, [data.preferencesFetchCriteria.levelBitValue], function(err, row, fields) {
        if (err) {
            logger.error("Error While executing preferenceLevelInfoQuery : " + preferenceLevelInfoQuery + " in PreferencesDao.prototype.listPreferencesByLevel() : \n" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR, null);
        } else {
            logger.info("\"" + preferenceLevelInfoQuery + "\" executed (listPreferencesByLevel()).");
            if (row[0] != undefined) {
                data.preferencesFetchCriteria.levelName = row[0].name;
                data.preferencesFetchCriteria.levelBitValue = row[0].bitValue;
                //                var preferenceListQuery = "SELECT * FROM preference p where (p.allowedRecordTypes & ? ) = ? and p.isDeleted = 0";
                var preferenceListQuery = "Select *,p.id as id, p.name as prefName, p.displayName as displayName, pc.id is Not NUll hasComponent, pc.customComponent is Not NUll AS isCustomeComponent, c.type as component," +
                    " pc.customComponent as customComponent, p.displayOrder as displayOrder , category.name as categoryName, p.waterMark as waterMark from preference p LEFT JOIN preferenceComponent pc " +
                    "ON pc.preferenceId = p.id LEFT JOIN component c ON c.id = pc.componentId LEFT JOIN preferenceCategory category ON category.id = p.categoryId" +
                    " where (p.allowedRecordTypes & ? ) = ? and p.isDeleted = 0"

                firmConnection.query(preferenceListQuery, [data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.levelBitValue], function(err, preferences) {
                    if (err) {
                        logger.error("Error while executing Query : " + preferenceListQuery + " in PreferencesDao.prototype.listPreferencesByLevel(). \n Error :" + err);
                        return cb(err, null)
                    } else {
                        logger.info("\"" + preferenceListQuery + "\" executed (listPreferencesByLevel()).");
                        var preferenceList = '';

                        var len = preferences.length;
                        var preferenceUpdatedList = [];

                        for (var i = 0; i < len; i++) {
                            if (preferenceList.length == 0) {
                                preferenceList = preferences[i].id;
                            } else {
                                preferenceList = preferenceList + ", " + preferences[i].id;
                            }

                            var prefId = preferences[i].id
                            self.getPreferencesIndicatorOptions(data, prefId, preferences[i], function(err, updatedPreference, fields) {
                                if (err) {
                                    logger.error("Error While getPreferencesIndicatorOptions in PreferencesDao.prototype.listPreferencesByLevel() : \n" + err);
                                    return cb(err, responseCode.INTERNAL_SERVER_ERROR, null);
                                } else {
                                    preferenceUpdatedList.push(updatedPreference);

                                    len--;
                                    if (len <= 0) {
                                        logger.info("Master prefernces list generated successfully. \nList " + JSON.stringify(preferences));
                                        self.updatePreferencesValues(data, preferenceUpdatedList, preferenceList, cb);
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                logger.error("Error While getting preferences level  in  PreferencesDao.prototype.listPreferencesByLevel() :  \n" + "Invalid level type.");

                return cb(messages.notFound, responseCode.NOT_FOUND, null);
            }
        }
    });
};


PreferencesDao.prototype.getPreferencesIndicatorOptions = function(data, prefId, preference, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var preferenceIndicatorQueryQuery = "Select pi.id, pi.name, pi.minValue, pi.maxValue from preferenceIndicatorOptions pi where pi.preferenceId = ?"

    firmConnection.query(preferenceIndicatorQueryQuery, [prefId], function(err, indicatorOptions, fields) {
        if (err) {
            logger.error("Error While executing preferenceIndicatorQueryQuery : " + preferenceIndicatorQueryQuery + " in PreferencesDao.prototype.listPreferencesByLevel() : \n" + err);
            return cb(err, preference);
        } else {
            if (indicatorOptions.length > 0) {
                preference["indicatorOptions"] = indicatorOptions;
            } else {
                preference["indicatorOptions"] = [];
            }

            return cb(err, preference);
        }
    });
};

//Service method to get All preferences corresponding provided level information
PreferencesDao.prototype.listPreferencesByLevelForMassUpdate = function(data, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var preferenceLevelInfoQuery = "Select * from preferenceLevel pl where pl.bitValue = ?";

    firmConnection.query(preferenceLevelInfoQuery, [data.preferencesFetchCriteria.levelBitValue], function(err, row, fields) {
        if (err) {
            logger.error("Error While executing preferenceLevelInfoQuery : " + preferenceLevelInfoQuery + " in PreferencesDao.prototype.listPreferencesByLevel() : \n" + err);
            return cb(err, responseCode.INTERNAL_SERVER_ERROR, null);
        } else {
            logger.info("\"" + preferenceLevelInfoQuery + "\" executed (listPreferencesByLevel()).");
            if (row[0] != undefined) {
                data.preferencesFetchCriteria.levelName = row[0].name;
                data.preferencesFetchCriteria.levelBitValue = row[0].bitValue;
                //                var preferenceListQuery = "SELECT * FROM preference p where (p.allowedRecordTypes & ? ) = ? and p.isDeleted = 0";
                var preferenceListQuery = "Select *,p.id as id, p.name as prefName, p.displayName as displayName, pc.id is Not NUll hasComponent, pc.customComponent is Not NUll AS isCustomeComponent, c.type as component," +
                    " pc.customComponent as customComponent, p.displayOrder as displayOrder , category.name as categoryName, p.waterMark as waterMark from preference p LEFT JOIN preferenceComponent pc " +
                    "ON pc.preferenceId = p.id LEFT JOIN component c ON c.id = pc.componentId LEFT JOIN preferenceCategory category ON category.id = p.categoryId" +
                    " where (p.allowedRecordTypes & ? ) = ? and p.isDeleted = 0"
                firmConnection.query(preferenceListQuery, [data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.levelBitValue], function(err, preferences) {
                    if (err) {
                        logger.error("Error while executing Query : " + preferenceListQuery + " in PreferencesDao.prototype.listPreferencesByLevel(). \n Error :" + err);
                        return cb(err, null)
                    } else {
                        logger.info("\"" + preferenceListQuery + "\" executed (listPreferencesByLevel()).");
                        var finalPreferenceList = [];
                        var len = preferences.length;

                        preferences.forEach(function(pref) {

                            var preferenceObj = {
                                id: null,
                                preferenceId: pref.id,
                                name: pref.prefName,
                                displayName: pref.displayName,
                                categoryType: pref.categoryName,
                                required: null,
                                valueType: pref.dataType,
                                value: null,
                                indicatorValue: null,
                                isInherited: false,
                                inheritedValue: null,
                                inheritedIndicatorValue: null,
                                inheritedFrom: null,
                                inheritedFromName: null,
                                inheritedFromId: null,
                                options: [],
                                selectedOptions: [],
                                inheritedSelectedOptions: [],
                                indicatorOptions: [],
                                componentType: pref.isCustomeComponent,
                                componentName: pref.component,
                                minlength: null,
                                maxlength: null,
                                minValue: null,
                                maxValue: null,
                                pattern: null,
                                watermarkText: pref.waterMark,
                                symbol: pref.symbol,
                                displayOrder: pref.displayOrder,
                                helpText: pref.description
                            };

                            if (!pref.hasComponent) { // if there is no component mapping
                                preferenceObj.componentType = null;
                                preferenceObj.componentName = null;
                            }
                            if (preferenceObj.componentType == 1) { // if custom componnet
                                preferenceObj.componentName = pref.customComponent;
                            }

                            if (pref.dataType.toLowerCase() == (constants.prefrenceValueType.OPTION_LIST).toLowerCase() || pref.dataType.toLowerCase() == (constants.prefrenceValueType.LIST).toLowerCase()) {
                                self.getOptionListPreference(data, pref, function(err, optionResponse) {

                                    if (err) {
                                        logger.error("Error while fetching master option list for preference (Option) : " + pref.id + " " + pref.name + "  \n" + err);
                                        return cb(err, finalPreferenceList);
                                    } else {
                                        preferenceObj.options = optionResponse;
                                        finalPreferenceList.push(preferenceObj);
                                        len--;
                                        if (len <= 0) {
                                            self.convertPreferenceResultToEntity(finalPreferenceList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    logger.error("Error while converting result set entity Block 1 :   \n" + err);
                                                    return cb(err, sanitizedResponse);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                finalPreferenceList.push(preferenceObj);
                                len--;
                                if (len <= 0) {
                                    self.convertPreferenceResultToEntity(finalPreferenceList, function(err, sanitizedResponse) {
                                        if (err) {
                                            logger.error("Error while converting result set entity Block 1 :   \n" + err);
                                            return cb(err, sanitizedResponse);
                                        } else {
                                            return cb(err, sanitizedResponse);
                                        }
                                    });
                                }

                            }

                        });

                        logger.info("Master prefernces list generated successfully. \nList " + JSON.stringify(finalPreferenceList));


                    }
                });
            } else {
                logger.error("Error While getting preferences level  in  PreferencesDao.prototype.listPreferencesByLevel() :  \n" + "Invalid level type.");

                return cb(messages.notFound, responseCode.NOT_FOUND, null);
            }
        }
    });
};

PreferencesDao.prototype.updatePreferencesValues = function(data, preferences, preferenceList, cb) {
    var self = this;
    var parentFirm = null;

    var finalPreferenceList = [];

    var len = preferences.length;
    preferences.forEach(function(pref) {

        var preferenceObj = {
            id: null,
            preferenceId: pref.id,
            name: pref.prefName,
            displayName: pref.displayName,
            categoryType: pref.categoryName,
            required: null,
            valueType: pref.dataType,
            value: null,
            indicatorValue: null,
            isInherited: false,
            inheritedValue: null,
            inheritedIndicatorValue: null,
            inheritedFrom: null,
            inheritedFromName: null,
            inheritedFromId: null,
            inheritedFromValueId: null,
            options: [],
            selectedOptions: [],
            inheritedSelectedOptions: [],
            indicatorOptions: pref.indicatorOptions,
            componentType: pref.isCustomeComponent,
            componentName: pref.component,
            minlength: null,
            maxlength: null,
            minValue: null,
            maxValue: null,
            pattern: null,
            watermarkText: pref.waterMark,
            symbol: pref.symbol,
            displayOrder: pref.displayOrder,
            helpText: pref.description
        };

        if (!pref.hasComponent) { // if there is no component mapping
            preferenceObj.componentType = null;
            preferenceObj.componentName = null;
        }
        if (preferenceObj.componentType == 1) { // if custom componnet
            preferenceObj.componentName = pref.customComponent;
        }

        if (pref.dataType.toLowerCase() !== (constants.prefrenceValueType.OPTION_LIST).toLowerCase() && pref.dataType.toLowerCase() !== (constants.prefrenceValueType.LIST).toLowerCase()) {
            // preferences without options list
            self.getPreferenceValue(data, pref, function(err, valueResponse) {

                if (err) {
                    logger.error("Error while getting preference value from self PreferencesDao.prototype.updatePreferencesValues(). \n Error : " + err);
                    return cb(err, finalPreferenceList);
                } else {

                    if (valueResponse.length > 0) {
                        preferenceObj.value = valueResponse[0].value;
                        preferenceObj.indicatorValue = valueResponse[0].indicator;
                        preferenceObj.isInherited = false;
                    }

                    var prefValueJsonObj = {
                        value: null,
                        inheritedPrefId: null,
                        isInherited: false,
                        inheritedValue: null,
                        inheritedIndicatorValue: null,
                        inheritedFrom: null,
                        inheritedFromName: null,
                        inheritedFromId: null,
                        inheritedFromValueId: null,
                        inheritedSelectedOptions: []
                    }

                    self.getFinalValueForPreference(data, pref, valueResponse, prefValueJsonObj, false, false, function(err, finalResponse) {
                        if (err) {
                            logger.error("Error while getting preferecnce from parent  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                            return cb(err, finalPreferenceList);
                        } else {

                            if (finalResponse !== undefined && finalResponse !== '') {

                                preferenceObj.value = finalResponse.value;
                                preferenceObj.id = finalResponse.id;
                                preferenceObj.isInherited = finalResponse.isInherited;
                                preferenceObj.inheritedValue = finalResponse.inheritedValue;
                                preferenceObj.inheritedIndicatorValue = finalResponse.selectedIndicatorValue;
                                preferenceObj.inheritedFrom = finalResponse.inheritedFrom;
                                preferenceObj.inheritedFromName = finalResponse.inheritedFromName;
                                preferenceObj.inheritedFromId = finalResponse.inheritedFromId;
                                preferenceObj.inheritedFromValueId = finalResponse.inheritedFromValueId;

                                finalPreferenceList.push(preferenceObj);
                                len--;
                                if (len <= 0) {
                                    logger.info("Final response generated (updatePreferencesValues()).");

                                    self.convertPreferenceResultToEntity(finalPreferenceList, function(err, sanitizedResponse) {
                                        if (err) {
                                            logger.error("Error while converting result set entity Block 1 :   \n" + err);
                                            return cb(err, sanitizedResponse);
                                        } else {
                                            return cb(err, sanitizedResponse);
                                        }
                                    });
                                }
                            } else {
                                finalPreferenceList.push(preferenceObj);
                                len--;
                                if (len <= 0) {

                                    self.convertPreferenceResultToEntity(finalPreferenceList, function(err, sanitizedResponse) {
                                        if (err) {
                                            logger.error("Error while converting result set entity Block 2 :   \n" + err);
                                            return cb(err, sanitizedResponse);
                                        } else {
                                            return cb(err, sanitizedResponse);
                                        }
                                    });
                                }
                            }
                        }
                    });
                }
            });

        } else { // for option dataType 

            self.getOptionListPreference(data, pref, function(err, optionResponse) {

                if (err) {
                    logger.error("Error while fetching master option list for preference (Option) : " + pref.id + " " + pref.name + "  \n" + err);
                    return cb(err, finalPreferenceList);
                } else {
                    preferenceObj.options = optionResponse;
                    self.getPreferenceValue(data, pref, function(err, valueResponse) {

                        if (err) {
                            logger.error("Error while fetching value id for preference (Option) : " + pref.id + " " + pref.name + "  \n" + err);
                            return cb(err, finalPreferenceList);

                        } else {

                            if (valueResponse.length > 0) {

                                var preferenceValueId = valueResponse[0].PrefId;
                                preferenceObj.indicatorValue = valueResponse[0].indicator;
                                self.getOptionValuesForPreference(data, preferenceValueId, function(err, optionValues) {

                                    if (err) {
                                        logger.error("Error while fetching select option list for preference (Option) : " + pref.id + " " + pref.name + "  \n" + err);
                                        return cb(err, finalPreferenceList);
                                    } else {
                                        preferenceObj.selectedOptions = optionValues;
                                        preferenceObj.id = preferenceValueId;

                                        var prefValueObj = {
                                            value: null,
                                            isInherited: false,
                                            inheritedPrefId: null,
                                            inheritedValue: null,
                                            inheritedIndicatorValue: null,
                                            inheritedFrom: null,
                                            inheritedFromName: null,
                                            inheritedFromId: null,
                                            inheritedFromValueId: null,
                                            selectedOptions: [],
                                            inheritedSelectedOptions: [],
                                        };

                                        self.getFinalOptionValue(data, pref, valueResponse, prefValueObj, function(err, prefResponse) {
                                            if (err) {
                                                logger.error("Error while fetching selected option for Preferenence PreferencesDao.prototype.getPreferenceValueAfterDelete() (OptionList Preference) : " + pref.id + " " + pref.name + "  \n" + err);
                                                return cb(err, preferenceObj);
                                            } else {
                                                if (prefResponse.isInherited) {

                                                    preferenceObj.isInherited = prefResponse.isInherited;
                                                    preferenceObj.inheritedFrom = prefResponse.inheritedFrom;
                                                    preferenceObj.inheritedFromName = prefResponse.inheritedFromName;
                                                    preferenceObj.inheritedFromId = prefResponse.inheritedFromId;
                                                    preferenceObj.inheritedSelectedOptions = prefResponse.inheritedSelectedOptions;
                                                    preferenceObj.inheritedFrom = prefResponse.inheritedFrom;
                                                    preferenceObj.inheritedFromValueId = prefResponse.inheritedFromValueId;
                                                    preferenceObj.inheritedIndicatorValue = prefResponse.selectedIndicatorValue;

                                                } else {
                                                    preferenceObj.isInherited = prefResponse.isInherited;
                                                }

                                                finalPreferenceList.push(preferenceObj);
                                                len--;
                                                if (len <= 0) {
                                                    logger.info("Final response generated (updatePreferencesValues()).");

                                                    self.convertPreferenceResultToEntity(finalPreferenceList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            logger.error("Error while converting result set entity Block 7 :   \n" + err);
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                });

                            } else {

                                var prefValueObj = {
                                    value: null,
                                    isInherited: false,
                                    inheritedPrefId: null,
                                    inheritedValue: null,
                                    inheritedIndicatorValue: null,
                                    inheritedFrom: null,
                                    inheritedFromName: null,
                                    inheritedFromId: null,
                                    inheritedFromValueId: null,
                                    selectedOptions: [],
                                    inheritedSelectedOptions: [],
                                };

                                self.getFinalOptionValue(data, pref, valueResponse, prefValueObj, function(err, prefResponse) {
                                    if (err) {
                                        logger.error("Error while fetching selected option for Preferenence PreferencesDao.prototype.getPreferenceValueAfterDelete() (OptionList Preference) : " + pref.id + " " + pref.name + "  \n" + err);
                                        return cb(err, preferenceObj);
                                    } else {
                                        if (prefResponse != null && prefResponse.isInherited) {

                                            preferenceObj.isInherited = prefResponse.isInherited;
                                            preferenceObj.inheritedFrom = prefResponse.inheritedFrom;
                                            preferenceObj.inheritedFromName = prefResponse.inheritedFromName;
                                            preferenceObj.inheritedFromId = prefResponse.inheritedFromId;
                                            preferenceObj.inheritedSelectedOptions = prefResponse.inheritedSelectedOptions;
                                            preferenceObj.inheritedFromValueId = prefResponse.inheritedFromValueId;
                                            preferenceObj.inheritedIndicatorValue = prefResponse.selectedIndicatorValue;

                                        } else {
                                            preferenceObj.isInherited = false;
                                        }

                                        finalPreferenceList.push(preferenceObj);
                                        len--;
                                        if (len <= 0) {
                                            logger.info("Final response generated (updatePreferencesValues()).");

                                            self.convertPreferenceResultToEntity(finalPreferenceList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    logger.error("Error while converting result set entity Block 7 :   \n" + err);
                                                    return cb(err, sanitizedResponse);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
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

PreferencesDao.prototype.getLocationOptimizationSetting = function(data, cb) {
    var self = this;
    var parentFirm = null;
    var finalPreferenceList = [];

    var firmConnection = baseDao.getConnection(data);



    var preferenceListQuery = "Select *,p.id as id, p.name as prefName, p.displayName as displayName, pc.id is Not NUll hasComponent, pc.customComponent is Not NUll AS isCustomeComponent, c.type as component," +
        " pc.customComponent as customComponent, p.displayOrder as displayOrder , category.name as categoryName, p.waterMark as waterMark from preference p LEFT JOIN preferenceComponent pc " +
        "ON pc.preferenceId = p.id LEFT JOIN component c ON c.id = pc.componentId LEFT JOIN preferenceCategory category ON category.id = p.categoryId" +
        " where (p.allowedRecordTypes & ? ) = ? and p.id = ? and p.isDeleted = 0"

    firmConnection.query(preferenceListQuery, [data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.locationOptimizationPreferenceId], function(err, preferences) {
        if (err) {
            logger.error("Error while executing Query : " + preferenceListQuery + " in PreferencesDao.prototype.getLocationOptimizationSetting(). \n Error :" + err);
            return cb(err, null);
        } else {

            if (preferences.length <= 0) {
                logger.info("Unbale to get location preference in PreferencesDao.prototype.getLocationOptimizationSetting()");
                return cb(messages.notFound, responseCode.NOT_FOUND);

            } else {

                var pref = preferences[0];


                var locationPreferenceObj = {
                    levelName: data.preferencesFetchCriteria.levelName,
                    recordId: data.preferencesFetchCriteria.recordId,
                    id: null,
                    preferenceId: data.preferencesFetchCriteria.locationOptimizationPreferenceId,
                    name: pref.prefName,
                    displayName: pref.displayName,
                    categoryType: pref.categoryName,
                    required: null,
                    valueType: pref.dataType,
                    subClasses: [],
                    isInherited: false,
                    inheritedValue: null,
                    inheritedFrom: null,
                    inheritedFromName: null,
                    inheritedFromId: null,
                    inheritedPreferenceValueId: null,
                    inheritedSubClasses: [],
                    componentType: pref.isCustomeComponent,
                    componentName: pref.component,
                    watermarkText: pref.waterMark,
                    symbol: pref.symbol,
                    displayOrder: pref.displayOrder,
                    helpText: pref.description
                };

                if (!pref.hasComponent) { // if there is no component mapping
                    locationPreferenceObj.componentType = null;
                    locationPreferenceObj.componentName = null;
                }
                if (locationPreferenceObj.componentType == 1) { // if custom componnet
                    locationPreferenceObj.componentType = 'custom';
                    locationPreferenceObj.componentName = pref.customComponent;
                } else {
                    locationPreferenceObj.componentType = 'default';
                }

                var inheritedPreferencevalueObj = null;
                var preferencevalueObj = null;

                if (data.preferencesFetchCriteria.preferenceValueId != null) {
                    preferencevalueObj = {
                        preferenceValueId: data.preferencesFetchCriteria.preferenceValueId
                    };
                }

                if (data.preferencesFetchCriteria.inheritedPreferenceValueId != null) {
                    inheritedPreferencevalueObj = {
                        preferenceValueId: data.preferencesFetchCriteria.inheritedPreferenceValueId
                    }
                }

                if (data.preferencesFetchCriteria.recordId == null) {
                    preferenceConvertor.updateLocationOptimizationResultSetToEntity(locationPreferenceObj, function(err, sanitizedResponse) {
                        if (err) {
                            logger.error("Error while converting result set entity Block 1 :   \n" + err);
                            return cb(err, sanitizedResponse);
                        } else {
                            return cb(err, sanitizedResponse);
                        }
                    });
                } else if (data.preferencesFetchCriteria.preferenceValueId == null && data.preferencesFetchCriteria.inheritedPreferenceValueId == null) {
                    preferenceConvertor.updateLocationOptimizationResultSetToEntity(locationPreferenceObj, function(err, sanitizedResponse) {
                        if (err) {
                            logger.error("Error while converting result set entity Block 1 :   \n" + err);
                            return cb(err, sanitizedResponse);
                        } else {
                            return cb(err, sanitizedResponse);
                        }
                    });
                } else if (data.preferencesFetchCriteria.preferenceValueId == null && data.preferencesFetchCriteria.inheritedPreferenceValueId != null) {
                    inheritedPreferencevalueObj = {
                        preferenceValueId: data.preferencesFetchCriteria.inheritedPreferenceValueId
                    }
                    self.getLocationOptimizationValues(data, inheritedPreferencevalueObj, function(err, finalResponse) {
                        if (err) {
                            logger.error("Error while getting preferecnce from parent  PreferencesDao.prototype.getLocationOptimizationSetting()  \n" + err);
                            return cb(err, finalPreferenceList);
                        } else {

                            if (finalResponse !== undefined && finalResponse !== '') {

                                locationPreferenceObj.inheritedSubClasses = finalResponse;
                                locationPreferenceObj.inheritedPreferenceValueId = inheritedPreferencevalueObj.preferenceValueId;

                                logger.debug("********   1)   \n" + JSON.stringify(locationPreferenceObj) + "\n");
                                preferenceConvertor.updateLocationOptimizationResultSetToEntity(locationPreferenceObj, function(err, sanitizedResponse) {
                                    if (err) {
                                        logger.error("Error while converting result set entity Block 1 :   \n" + err);
                                        return cb(err, sanitizedResponse);
                                    } else {
                                        return cb(err, sanitizedResponse);
                                    }
                                });
                            } else {
                                logger.debug("********   2)   \n" + JSON.stringify(locationPreferenceObj) + "\n");
                                preferenceConvertor.updateLocationOptimizationResultSetToEntity(locationPreferenceObj, function(err, sanitizedResponse) {
                                    if (err) {
                                        logger.error("Error while converting result set entity Block 2 :   \n" + err);
                                        return cb(err, sanitizedResponse);
                                    } else {
                                        return cb(err, sanitizedResponse);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    self.getLocationOptimizationValues(data, preferencevalueObj, function(err, subClasses) {
                        if (err) {
                            logger.error("Error while getting location preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.getLocationOptimizationSetting()  \n" + err);
                            return cb(err, finalPreferenceList);
                        } else {
                            locationPreferenceObj.subClasses = subClasses;
                            locationPreferenceObj.id = preferencevalueObj.preferenceValueId;


                            if (inheritedPreferencevalueObj == null) { // if inherited value not required
                                logger.debug("********   0)   \n" + JSON.stringify(locationPreferenceObj) + "\n");
                                preferenceConvertor.updateLocationOptimizationResultSetToEntity(locationPreferenceObj, function(err, sanitizedResponse) {
                                    if (err) {
                                        logger.error("Error while converting result set entity Block 0 :   \n" + err);
                                        return cb(err, sanitizedResponse);
                                    } else {
                                        return cb(err, sanitizedResponse);
                                    }
                                });
                            } else {

                                self.getLocationOptimizationValues(data, inheritedPreferencevalueObj, function(err, finalResponse) {
                                    if (err) {
                                        logger.error("Error while getting preferecnce from parent  PreferencesDao.prototype.getLocationOptimizationSetting()  \n" + err);
                                        return cb(err, finalPreferenceList);
                                    } else {

                                        if (finalResponse !== undefined && finalResponse !== '') {

                                            locationPreferenceObj.inheritedSubClasses = finalResponse;
                                            locationPreferenceObj.inheritedPreferenceValueId = inheritedPreferencevalueObj.preferenceValueId;

                                            logger.debug("********   1)   \n" + JSON.stringify(locationPreferenceObj) + "\n");
                                            preferenceConvertor.updateLocationOptimizationResultSetToEntity(locationPreferenceObj, function(err, sanitizedResponse) {
                                                if (err) {
                                                    logger.error("Error while converting result set entity Block 1 :   \n" + err);
                                                    return cb(err, sanitizedResponse);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        } else {
                                            logger.debug("********   2)   \n" + JSON.stringify(locationPreferenceObj) + "\n");
                                            preferenceConvertor.updateLocationOptimizationResultSetToEntity(locationPreferenceObj, function(err, sanitizedResponse) {
                                                if (err) {
                                                    logger.error("Error while converting result set entity Block 2 :   \n" + err);
                                                    return cb(err, sanitizedResponse);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
    });
};

PreferencesDao.prototype.getSecurityPreferences = function(data, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var preferenceListQuery = "Select *,p.id as id, p.name as prefName, p.displayName as displayName, pc.id is Not NUll hasComponent, pc.customComponent is Not NUll AS isCustomeComponent, c.type as component," +
        " pc.customComponent as customComponent, p.displayOrder as displayOrder , category.name as categoryName, p.waterMark as waterMark from preference p LEFT JOIN preferenceComponent pc " +
        "ON pc.preferenceId = p.id LEFT JOIN component c ON c.id = pc.componentId LEFT JOIN preferenceCategory category ON category.id = p.categoryId" +
        " where (p.allowedRecordTypes & ? ) = ? and p.id = ? and p.isDeleted = 0"

    firmConnection.query(preferenceListQuery, [data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.securityPreferenceId], function(err, preferences) {
        if (err) {
            logger.error("Error while executing Query : " + preferenceListQuery + " in PreferencesDao.prototype.getSecurityPreferences(). \n Error :" + err);
            return cb(err, null);
        } else {

            if (preferences.length <= 0) {
                logger.info("Unbale to get location preference in PreferencesDao.prototype.getSecurityPreferences()");
                return cb(messages.notFound, responseCode.NOT_FOUND);

            } else {

                var pref = preferences[0];

                var securityPref = {
                    levelName: data.preferencesFetchCriteria.levelName,
                    recordId: data.preferencesFetchCriteria.recordId,
                    id: data.preferencesFetchCriteria.preferenceValueId,
                    preferenceId: data.preferencesFetchCriteria.securityPreferenceId,
                    name: pref.prefName,
                    displayName: pref.displayName,
                    categoryType: pref.categoryName,
                    componentType: pref.isCustomeComponent,
                    componentName: pref.component,
                    securityPreferences: [],
                    inheritedSecurityPreferences: []
                };

                if (!pref.hasComponent) { // if there is no component mapping
                    securityPref.componentType = null;
                    securityPref.componentName = null;
                }
                if (securityPref.componentType == 1) { // if custom componnet
                    securityPref.componentType = 'custom';
                    securityPref.componentName = pref.customComponent;
                } else {
                    securityPref.componentType = 'default';
                }

            }

            var preferenceValueId = data.preferencesFetchCriteria.preferenceValueId; //
            var levelBitValue = data.preferencesFetchCriteria.levelBitValue;

            if (data.preferencesFetchCriteria.recordId == null) {
                return cb(err, securityPref);
                //                        self.getMasterSecurityPreferences(data, function(err, masterSecurityPref) {
                //                            if (err) {
                //                                logger.error("Error while executing getMasterSecurityPreferences in PreferencesDao.prototype.getSecurityPreferences(). \n Error :" + err);
                //                                return cb(err, prefValues);
                //                            } else {
                //                                var baseSecurityPref = {
                //                                    id: null,
                //                                    securityName: null,
                //                                    securityType: null,
                //                                    symbol: null,
                //                                    custodianSecuritySymbolId: null,
                //                                }
                //
                //                                var securityPreference = Object.assign({}, baseSecurityPref, masterSecurityPref);
                //                                //                    	 var inheritedsecurityPreference = Object.assign({}, baseSecurityPref, masterSecurityPref);
                //
                //                                securityPref.securityPreferences.push(securityPreference);
                //                                //                    	 securityPref.inheritedSecurityPreferences.push(securityPreference);
                //                                return cb(err, securityPref);
                //                            }
                //                        });
            } else {
                self.getSecurityPreferencesValues(data, preferenceValueId, levelBitValue, function(err, prefValues) {
                    if (err) {
                        logger.error("Error while executing getSecurityPreferencesValues in PreferencesDao.prototype.getSecurityPreferences(). \n Error :" + err);
                        return cb(err, prefValues);
                    } else {

                        securityPref.securityPreferences = prefValues.securityPreferences;
                        securityPref.inheritedSecurityPreferences = prefValues.inheritedSecurityPreferences;
                        self.getSecuritiesPreferencesByLevel(data, 0, function(err, preferencesList) {
                            if (err) {
                                logger.error("Error while executing getSecuritiesPreferencesByLevel in PreferencesDao.prototype.getMasterSecurityPreferences(). \n Error :" + err);
                                return cb(err, preferencesList);
                            } else {

                                if (preferencesList == null || preferencesList == undefined) {
                                    logger.error("Error while executing securityPreferenceConvertor in PreferencesDao.prototype.getSecurityPreferences(). \n Error :" + err);
                                    return cb(err, preferencesList);
                                } else {
                                    preferenceConvertor.securityPreferenceConvertor(data, securityPref, preferencesList.securityPrefValidationSet, function(err, convertedPreferences) {
                                        if (err) {
                                            logger.error("Error while executing securityPreferenceConvertor in PreferencesDao.prototype.getSecurityPreferences(). \n Error :" + err);
                                            return cb(err, convertedPreferences);
                                        } else {
                                            securityPref.securityPreferences = convertedPreferences.securityPreferences;
                                            securityPref.inheritedSecurityPreferences = convertedPreferences.inheritedSecurityPreferences;
                                            return cb(err, securityPref);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }
        }
    });
}

PreferencesDao.prototype.getSecurityPreferencesValues = function(data, preferenceValueId, levelBitValue, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var query = "CALL getSecurityPreferenceValue(?, ?, ?)";
    var firmId = data.user.firmId;
    var userId = data.user.userId;
    firmConnection.query(query, [userId, preferenceValueId, firmId], function(err, rows, fields) {
        if (err) {
            logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.getSecurityPreferencesValues(). \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in PreferencesDao.prototype.getSecurityPreferencesValues().");
            var securityPref = {
                securityPreferences: [],
                inheritedSecurityPreferences: []
            }

            if (rows.length > 0) {

                rows[0].forEach(function(security) {
                    var securityPrefValueObj = {};
                    var securityPrefInheritedValueObj = {};

                    fields[0].forEach(function(column) {

                        if (((column.name).toLowerCase().indexOf("securityid") > -1) || ((column.name).toLowerCase().indexOf("securityname") > -1) ||
                            ((column.name).toLowerCase().indexOf("securitytype") > -1) || ((column.name).toLowerCase().indexOf("symbol") > -1)) {

                            if ((column.name).toLowerCase() == 'securityid') {
                                securityPrefValueObj['id'] = security[column.name];
                                securityPrefInheritedValueObj['id'] = security[column.name];
                            } else {
                                securityPrefValueObj[column.name] = security[column.name];
                                securityPrefInheritedValueObj[column.name] = security[column.name];
                            }

                        } else if ((column.name).toLowerCase().indexOf("inherited") > -1) {
                            var value = security[column.name];
                            securityPrefInheritedValueObj[(column.name.substring(0, (column.name.indexOf("Inherited"))))] = value;
                        } else {
                            var value = security[column.name];
                            securityPrefValueObj[column.name] = value;
                        }

                    });

                    securityPref.securityPreferences.push(JSON.parse(JSON.stringify(securityPrefValueObj)));
                    securityPref.inheritedSecurityPreferences.push(JSON.parse(JSON.stringify(securityPrefInheritedValueObj)));
                });


            }

            logger.debug("Security Preferences Generated in getSecurityPreferencesValues() : " + JSON.stringify(securityPref));

            return cb(err, securityPref);
        }
    });

};

PreferencesDao.prototype.getMasterSecurityPreferences = function(data, cb) {
    var self = this;
    var levelName = data.preferencesFetchCriteria.levelBitValue;
    self.getSecuritiesPreferencesByLevel(data, 0, function(err, preferencesList) {
        if (err) {
            logger.error("Error while executing getSecuritiesPreferencesByLevel in PreferencesDao.prototype.getMasterSecurityPreferences(). \n Error :" + err);
            return cb(err, securityPref);
        } else {

            if (preferencesList.securityPrefSet.length <= 0) {
                return cb(err, securityPref);
            } else {

                var keys = Object.keys(preferencesList.securityPrefSet);
                var securityPref = {};
                keys.forEach(function(prefName) {
                    securityPref[prefName] = null;

                });

                return cb(err, securityPref);
            }
        }
    });
};

PreferencesDao.prototype.getCommunityStrategistSetting = function(data, cb) {

    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var preferenceListQuery = "Select *,p.id as id, p.name as prefName, p.displayName as displayName, pc.id is Not NUll hasComponent, pc.customComponent is Not NUll AS isCustomeComponent, c.type as component," +
        " pc.customComponent as customComponent, p.displayOrder as displayOrder , category.name as categoryName, p.waterMark as waterMark from preference p LEFT JOIN preferenceComponent pc " +
        "ON pc.preferenceId = p.id LEFT JOIN component c ON c.id = pc.componentId LEFT JOIN preferenceCategory category ON category.id = p.categoryId" +
        " where (p.allowedRecordTypes & ? ) = ? and p.id = ? and p.isDeleted = 0"

    firmConnection.query(preferenceListQuery, [data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.communityStrategistPreferenceId], function(err, preferences) {
        if (err) {
            logger.error("Error while executing Query : " + preferenceListQuery + " in PreferencesDao.prototype.getCommunityStrategistSetting(). \n Error :" + err);
            return cb(err, null);
        } else {

            if (preferences.length <= 0) {
                logger.info("Unbale to get location preference in PreferencesDao.prototype.getCommunityStrategistSetting()");
                return cb(messages.notFound, responseCode.NOT_FOUND);

            } else {

                var pref = preferences[0];

                var communityStrategist = {
                    levelName: data.preferencesFetchCriteria.levelName,
                    recordId: data.preferencesFetchCriteria.recordId,
                    id: null,
                    preferenceId: data.preferencesFetchCriteria.communityStrategistPreferenceId,
                    name: pref.prefName,
                    displayName: pref.displayName,
                    categoryType: pref.categoryName,
                    required: null,
                    valueType: pref.dataType,
                    strategists: {},
                    isInherited: false,
                    inheritedValue: null,
                    inheritedFrom: null,
                    inheritedFromName: null,
                    inheritedFromId: null,
                    inheritedStrategists: {},
                    componentType: pref.isCustomeComponent,
                    componentName: pref.component,
                    watermarkText: pref.waterMark,
                    symbol: pref.symbol,
                    displayOrder: pref.displayOrder,
                    helpText: pref.description
                };

                if (!pref.hasComponent) { // if there is no component mapping
                    communityStrategist.componentType = null;
                    communityStrategist.componentName = null;
                }
                if (communityStrategist.componentType == 1) { // if custom componnet
                    communityStrategist.componentType = 'custom';
                    communityStrategist.componentName = pref.customComponent;
                } else {
                    communityStrategist.componentType = 'default';
                }

                var inheritedPreferencevalueObj = null;
                var preferencevalueObj = null;

                logger.debug("Stratgeist Pref ValueId : " + data.preferencesFetchCriteria.preferenceValueId);
                if (data.preferencesFetchCriteria.preferenceValueId != null) {
                    preferencevalueObj = {
                        preferenceValueId: data.preferencesFetchCriteria.preferenceValueId
                    };
                }


                if (data.preferencesFetchCriteria.inheritedPreferenceValueId != null) {
                    inheritedPreferencevalueObj = {
                        preferenceValueId: data.preferencesFetchCriteria.inheritedPreferenceValueId
                    };
                }

                if (data.preferencesFetchCriteria.recordId == null) {
                    preferenceConvertor.updateCommunityStrategistResultSetToEntity(communityStrategist, function(err, sanitizedResponse) {
                        if (err) {
                            logger.error("Error while converting result set entity Block 1 :   \n" + err);
                            return cb(err, sanitizedResponse);
                        } else {
                            return cb(err, sanitizedResponse);
                        }
                    });
                    //../null/null
                } else if (data.preferencesFetchCriteria.preferenceValueId == null && data.preferencesFetchCriteria.inheritedPreferenceValueId == null) {
                    preferenceConvertor.updateCommunityStrategistResultSetToEntity(communityStrategist, function(err, sanitizedResponse) {
                        if (err) {
                            logger.error("Error while converting result set entity Block 1 :   \n" + err);
                            return cb(err, sanitizedResponse);
                        } else {
                            return cb(err, sanitizedResponse);
                        }
                    });
                    //../null/value
                } else if (data.preferencesFetchCriteria.preferenceValueId == null && data.preferencesFetchCriteria.inheritedPreferenceValueId != null) {
                    inheritedPreferencevalueObj = {
                        preferenceValueId: data.preferencesFetchCriteria.inheritedPreferenceValueId
                    }

                    self.getCommunityStrategistValues(data, inheritedPreferencevalueObj, function(err, finalResponse) {
                        if (err) {
                            logger.error("Error while getting preferecnce from parent  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                            return cb(err, finalResponse);
                        } else {

                            if (finalResponse !== undefined && finalResponse !== '') {

                                communityStrategist.inheritedPreferenceValueId = inheritedPreferencevalueObj.preferenceValueId;
                                communityStrategist.inheritedStrategists = finalResponse;

                                logger.debug("********   1)   \n" + JSON.stringify(communityStrategist) + "\n");
                                preferenceConvertor.updateCommunityStrategistResultSetToEntity(communityStrategist, function(err, sanitizedResponse) {
                                    if (err) {
                                        logger.error("Error while converting result set entity Block 1 :   \n" + err);
                                        return cb(err, sanitizedResponse);
                                    } else {
                                        return cb(err, sanitizedResponse);
                                    }
                                });
                            } else {
                                logger.debug("********   2)   \n" + JSON.stringify(communityStrategist) + "\n");
                                preferenceConvertor.updateCommunityStrategistResultSetToEntity(communityStrategist, function(err, sanitizedResponse) {
                                    if (err) {
                                        logger.error("Error while converting result set entity Block 2 :   \n" + err);
                                        return cb(err, sanitizedResponse);
                                    } else {
                                        return cb(err, sanitizedResponse);
                                    }
                                });
                            }
                        }
                    });
                    //../vaule/value And ../value/null
                } else {
                    self.getCommunityStrategistValues(data, preferencevalueObj, function(err, strategists) {
                        if (err) {
                            logger.error("Error while getting strategist preferences PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                            return cb(err, strategists);
                        } else {
                            communityStrategist.strategists = strategists;
                            communityStrategist.id = preferencevalueObj.preferenceValueId;


                            if (inheritedPreferencevalueObj == null) { // if inherited value not required
                                logger.debug("********   0)   \n" + JSON.stringify(communityStrategist) + "\n");
                                preferenceConvertor.updateCommunityStrategistResultSetToEntity(communityStrategist, function(err, sanitizedResponse) {
                                    if (err) {
                                        logger.error("Error while converting result set entity Block 0 :   \n" + err);
                                        return cb(err, sanitizedResponse);
                                    } else {
                                        return cb(err, sanitizedResponse);
                                    }
                                });
                            } else {

                                self.getCommunityStrategistValues(data, inheritedPreferencevalueObj, function(err, finalResponse) {
                                    if (err) {
                                        logger.error("Error while getting preferecnce from parent  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                        return cb(err, finalResponse);
                                    } else {

                                        if (finalResponse !== undefined && finalResponse !== '') {
                                            communityStrategist.inheritedPreferenceValueId = inheritedPreferencevalueObj.preferenceValueId;
                                            communityStrategist.inheritedStrategists = finalResponse;

                                            logger.debug("********   1)   \n" + JSON.stringify(communityStrategist) + "\n");
                                            preferenceConvertor.updateCommunityStrategistResultSetToEntity(communityStrategist, function(err, sanitizedResponse) {
                                                if (err) {
                                                    logger.error("Error while converting result set entity Block 1 :   \n" + err);
                                                    return cb(err, sanitizedResponse);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        } else {
                                            logger.debug("********   2)   \n" + JSON.stringify(communityStrategist) + "\n");
                                            preferenceConvertor.updateCommunityStrategistResultSetToEntity(communityStrategist, function(err, sanitizedResponse) {
                                                if (err) {
                                                    logger.error("Error while converting result set entity Block 2 :   \n" + err);
                                                    return cb(err, sanitizedResponse);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
    });
};

PreferencesDao.prototype.getPreferenceResponseAfterUpdate = function(data, prefId, cb) {
    var self = this;

    var firmConnection = baseDao.getConnection(data);

    var preferenceListQuery = "Select *,p.id as id, p.name as prefName, p.displayName as displayName, pc.id is Not NUll hasComponent, pc.customComponent is Not NUll AS isCustomeComponent, c.type as component," +
        " pc.customComponent as customComponent, p.displayOrder as displayOrder , category.name as categoryName, p.waterMark as waterMark from preference p LEFT JOIN preferenceComponent pc " +
        "ON pc.preferenceId = p.id LEFT JOIN component c ON c.id = pc.componentId LEFT JOIN preferenceCategory category ON category.id = p.categoryId" +
        " where p.id = ? and p.isDeleted = 0"

    firmConnection.query(preferenceListQuery, [prefId], function(err, preferences) {
        if (err) {
            logger.error("Error while executing Query : " + preferenceListQuery + " in PreferencesDao.prototype.getPreferenceResponseAfterDelete(). \n Error :" + err);
            return cb(err, null);
        } else {

            if (preferences.length <= 0) {
                logger.info("Unbale to get location preference in PreferencesDao.prototype.getPreferenceResponseAfterDelete()");
                return cb(messages.notFound, responseCode.NOT_FOUND);

            } else {
                var pref = preferences[0];

                var preferenceObj = {
                    id: null,
                    preferenceId: pref.id,
                    name: pref.prefName,
                    displayName: pref.displayName,
                    categoryType: pref.categoryName,
                    required: null,
                    valueType: pref.dataType,
                    value: null,
                    indicatorValue: null,
                    isInherited: false,
                    inheritedValue: null,
                    inheritedIndicatorValue: null,
                    inheritedFrom: null,
                    inheritedFromName: null,
                    inheritedFromId: null,
                    inheritedFromValueId: null,
                    options: [],
                    selectedOptions: [],
                    inheritedSelectedOptions: [],
                    indicatorOptions: [],
                    componentType: pref.isCustomeComponent,
                    componentName: pref.component,
                    minlength: null,
                    maxlength: null,
                    minValue: null,
                    maxValue: null,
                    pattern: null,
                    watermarkText: pref.waterMark,
                    symbol: pref.symbol,
                    displayOrder: pref.displayOrder,
                    helpText: pref.description
                };

                if (!pref.hasComponent) { // if there is no component mapping
                    preferenceObj.componentType = null;
                    preferenceObj.componentName = null;
                }
                if (preferenceObj.componentType == 1) { // if custom componnet
                	 preferenceObj.componentType = 'custom';
                    preferenceObj.componentName = pref.customComponent;
                } else {
                	preferenceObj.componentType = 'default';
                }

                if (pref.dataType.toLowerCase() !== (constants.prefrenceValueType.OPTION_LIST).toLowerCase() && pref.dataType.toLowerCase() !== (constants.prefrenceValueType.LIST).toLowerCase()) {
                    // preferences without options list
                    self.getPreferenceValue(data, pref, function(err, valueResponse) {

                        if (err) {
                            logger.error("Error while getting preference value from self PreferencesDao.prototype.getPreferenceResponseAfterDelete(). \n Error : " + err);
                            return cb(err, finalPreferenceList);
                        } else {

                            if (valueResponse.length > 0) {
                                preferenceObj.value = valueResponse[0].value;
                                preferenceObj.indicatorValue = valueResponse[0].indicator;
                                preferenceObj.isInherited = false;
                            }

                            var prefValueJsonObj = {
                                value: null,
                                inheritedPrefId: null,
                                isInherited: false,
                                inheritedValue: null,
                                inheritedIndicatorValue: null,
                                inheritedFrom: null,
                                inheritedFromName: null,
                                inheritedFromId: null,
                                inheritedFromValueId: null,
                                inheritedSubClasses: []
                            }

                            self.getFinalValueForPreference(data, pref, valueResponse, prefValueJsonObj, true, false, function(err, finalResponse) {
                                if (err) {
                                    logger.error("Error while getting preferecnce from parent  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.getPreferenceResponseAfterDelete()  \n" + err);
                                    return cb(err, finalPreferenceList);
                                } else {

                                    if (finalResponse !== undefined && finalResponse !== '') {

                                        preferenceObj.value = finalResponse.value;
                                        preferenceObj.id = finalResponse.id;
                                        preferenceObj.isInherited = finalResponse.isInherited;
                                        preferenceObj.inheritedValue = finalResponse.inheritedValue;
                                        preferenceObj.inheritedFrom = finalResponse.inheritedFrom;
                                        preferenceObj.inheritedFromName = finalResponse.inheritedFromName;
                                        preferenceObj.inheritedFromId = finalResponse.inheritedFromId;
                                        preferenceObj.inheritedFromValueId = finalResponse.inheritedFromValueId;
                                        preferenceObj.inheritedIndicatorValue = finalResponse.selectedIndicatorValue;

                                        logger.info("Final response generated (getPreferenceResponseAfterDelete()).");

                                        self.convertPreferenceResultToEntity(preferenceObj, function(err, sanitizedResponse) {
                                            if (err) {
                                                logger.error("Error while converting result set entity Block 1 :   \n" + err);
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    } else {

                                        self.convertPreferenceResultToEntity(preferenceObj, function(err, sanitizedResponse) {
                                            if (err) {
                                                logger.error("Error while converting result set entity Block 2 :   \n" + err);
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });

                } else { // for option dataType 

                    self.getOptionListPreference(data, pref, function(err, optionResponse) {

                        if (err) {
                            logger.error("Error while fetching master option list for preference (Option) : " + pref.id + " " + pref.name + "  \n" + err);
                            return cb(err, finalPreferenceList);
                        } else {
                            preferenceObj.options = optionResponse;
                            self.getPreferenceValue(data, pref, function(err, valueResponse) {

                                if (err) {
                                    logger.error("Error while fetching value id for preference (Option) : " + pref.id + " " + pref.name + "  \n" + err);
                                    return cb(err, finalPreferenceList);

                                } else {

                                    if (valueResponse.length > 0) {

                                        var preferenceValueId = valueResponse[0].PrefId;
                                        preferenceObj.indicatorValue = valueResponse[0].indicator;
                                        self.getOptionValuesForPreference(data, preferenceValueId, function(err, optionValues) {

                                            if (err) {
                                                logger.error("Error while fetching select option list for preference (Option) : " + pref.id + " " + pref.name + "  \n" + err);
                                                return cb(err, finalPreferenceList);
                                            } else {
                                                preferenceObj.selectedOptions = optionValues;
                                                preferenceObj.id = preferenceValueId;

                                                var prefValueObj = {
                                                    value: null,
                                                    isInherited: false,
                                                    inheritedPrefId: null,
                                                    inheritedValue: null,
                                                    inheritedIndicatorValue: null,
                                                    inheritedFrom: null,
                                                    inheritedFromName: null,
                                                    inheritedFromId: null,
                                                    selectedOptions: [],
                                                    inheritedSelectedOptions: [],
                                                };

                                                self.getFinalOptionValue(data, pref, valueResponse, prefValueObj, function(err, prefResponse) {
                                                    if (err) {
                                                        logger.error("Error while fetching selected option for Preferenence PreferencesDao.prototype.getPreferenceResponseAfterDelete() (OptionList Preference) : " + pref.id + " " + pref.name + "  \n" + err);
                                                        return cb(err, preferenceObj);
                                                    } else {
                                                        if (prefResponse != undefined && prefResponse != null && prefResponse.isInherited) {

                                                            preferenceObj.isInherited = prefResponse.isInherited;
                                                            preferenceObj.inheritedFrom = prefResponse.inheritedFrom;
                                                            preferenceObj.inheritedFromName = prefResponse.inheritedFromName;
                                                            preferenceObj.inheritedFromId = prefResponse.inheritedFromId;
                                                            preferenceObj.inheritedSelectedOptions = prefResponse.inheritedSelectedOptions;
                                                            preferenceObj.inheritedFrom = prefResponse.inheritedFrom;
                                                            preferenceObj.inheritedFromValueId = prefResponse.inheritedFromValueId;
                                                            preferenceObj.inheritedIndicatorValue = prefResponse.selectedIndicatorValue;

                                                        } else {
                                                            preferenceObj.isInherited = prefResponse.isInherited;
                                                        }
                                                        logger.info("Final response generated (getPreferenceResponseAfterDelete()).");

                                                        self.convertPreferenceResultToEntity(preferenceObj, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                logger.error("Error while converting result set entity Block 7 :   \n" + err);
                                                                return cb(err, sanitizedResponse);
                                                            } else {
                                                                return cb(err, sanitizedResponse);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });

                                    } else {

                                        var prefValueObj = {
                                            value: null,
                                            isInherited: false,
                                            inheritedPrefId: null,
                                            inheritedValue: null,
                                            inheritedIndicatorValue: null,
                                            inheritedFrom: null,
                                            inheritedFromName: null,
                                            inheritedFromId: null,
                                            selectedOptions: [],
                                            inheritedSelectedOptions: [],
                                        };

                                        self.getFinalOptionValue(data, pref, valueResponse, prefValueObj, function(err, prefResponse) {
                                            if (err) {
                                                logger.error("Error while fetching selected option for Preferenence PreferencesDao.prototype.getPreferenceResponseAfterDelete() (OptionList Preference) : " + pref.id + " " + pref.name + "  \n" + err);
                                                return cb(err, preferenceObj);
                                            } else {
                                                if (prefResponse != null && prefResponse.isInherited) {

                                                    preferenceObj.isInherited = prefResponse.isInherited;
                                                    preferenceObj.inheritedFrom = prefResponse.inheritedFrom;
                                                    preferenceObj.inheritedFromName = prefResponse.inheritedFromName;
                                                    preferenceObj.inheritedFromId = prefResponse.inheritedFromId;
                                                    preferenceObj.inheritedSelectedOptions = prefResponse.inheritedSelectedOptions;
                                                    preferenceObj.inheritedFrom = prefResponse.inheritedFrom;
                                                    preferenceObj.inheritedFromValueId = prefResponse.inheritedFromValueId;
                                                    preferenceObj.inheritedIndicatorValue = prefResponse.selectedIndicatorValue;

                                                } else {
                                                    preferenceObj.isInherited = false;
                                                }
                                                logger.info("Final response generated (getPreferenceResponseAfterDelete()).");

                                                self.convertPreferenceResultToEntity(preferenceObj, function(err, sanitizedResponse) {
                                                    if (err) {
                                                        logger.error("Error while converting result set entity Block 7 :   \n" + err);
                                                        return cb(err, sanitizedResponse);
                                                    } else {
                                                        return cb(err, sanitizedResponse);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        }
    });
};

PreferencesDao.prototype.getPreferenceValue = function(data, pref, cb) {
    var firmConnection = baseDao.getConnection(data);

    var lookInPVQuery = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";

    firmConnection.query(lookInPVQuery, [pref.id, data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.recordId],
        function(err, specificValue) {
            if (err) {
                logger.error("Error While executing  lookInPVQueryForSpecific: " + lookInPVQuery + " in PreferencesDao.prototype.getPreferenceValue() : \n" + err);

                return cb(err, specificValue);
            } else {
                logger.info("Query lookInPVQueryForSpecific :  " + lookInPVQuery + " executed in PreferencesDao.prototype.getPreferenceValue().");

                return cb(err, specificValue);
            }
        });
};


PreferencesDao.prototype.getFinalValueForPreference = function(data, pref, prefValueObj, prefValueJsonObj, isLocationPreference, isCommunirtySetting, cb) {
    var self = this;

    if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.FIRM) {

        if (prefValueObj != null && prefValueObj.length > 0) {
            prefValueJsonObj.value = prefValueObj[0].PrefValue;
            prefValueJsonObj.id = prefValueObj[0].PrefId
        }

        return cb(null, prefValueJsonObj);
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.CUSTODIAN) {

        if (prefValueObj != null && prefValueObj.length > 0) {
            prefValueJsonObj.value = prefValueObj[0].PrefValue;
            prefValueJsonObj.id = prefValueObj[0].PrefId
        }

        self.getCustodianParentValue(data, pref, prefValueJsonObj, function(err, parentValueReponse) {

            if (err) {
                logger.error("Error While getting custodian parent value in PreferencesDao.prototype.getFinalValueForPreference() : \n" + err);
                return cb(err, undefined);
            } else {


                if (parentValueReponse.isInherited === true) {

                    if (isLocationPreference == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getLocationOptimizationValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting location preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedSubClasses = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else if (isCommunirtySetting == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getCommunityStrategistValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting community strategist preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedStrategists = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else {
                        return cb(err, parentValueReponse);
                    }

                } else {
                    parentValueReponse.isInherited = false;
                    return cb(err, parentValueReponse);
                }
            }
        });
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.TEAM) {

        if (prefValueObj != null && prefValueObj.length > 0) {
            prefValueJsonObj.value = prefValueObj[0].PrefValue;
            prefValueJsonObj.id = prefValueObj[0].PrefId
        }

        self.getParentValueFromFirm(data, pref, prefValueJsonObj, function(err, parentValueReponse) {
            if (err) {
                logger.error("Error While getting team parent value in PreferencesDao.prototype.getFinalValueForPreference() : \n" + err);
                return cb(err, undefined);
            } else {

                if (parentValueReponse.isInherited === true) {
                    if (isLocationPreference == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getLocationOptimizationValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting location preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedSubClasses = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else if (isCommunirtySetting == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getCommunityStrategistValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting community strategist preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedStrategists = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else {
                        return cb(err, parentValueReponse);
                    }
                } else {
                    parentValueReponse.isInherited = false;
                    return cb(err, parentValueReponse);
                }

            }
        });
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.PORTFOLIO) {

        if (prefValueObj != null && prefValueObj.length > 0) {
            prefValueJsonObj.value = prefValueObj[0].PrefValue;
            prefValueJsonObj.id = prefValueObj[0].PrefId
        }
        self.getPortfolioParentValue(data, pref, prefValueJsonObj, true, function(err, parentValueReponse) {
            if (err) {
                logger.error("Error While getting team parent value in PreferencesDao.prototype.getFinalValueForPreference() : \n" + err);
                return cb(err, undefined);
            } else {

                if (parentValueReponse.isInherited === true) {

                    if (isLocationPreference == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getLocationOptimizationValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting location preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedSubClasses = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else if (isCommunirtySetting == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getCommunityStrategistValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting community strategist preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedStrategists = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else {
                        return cb(err, parentValueReponse);
                    }

                } else {
                    parentValueReponse.isInherited = false;
                    return cb(err, parentValueReponse);
                }

            }
        });
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.ACCOUNT) {

        if (prefValueObj != null && prefValueObj.length > 0) {
            prefValueJsonObj.value = prefValueObj[0].PrefValue;
            prefValueJsonObj.id = prefValueObj[0].PrefId
        }

        self.getAccountParentValue(data, pref, prefValueJsonObj, function(err, parentValueReponse) {
            if (err) {
                logger.error("Error While getting account parent value in PreferencesDao.prototype.getFinalValueForPreference() : \n" + err);
                return cb(err, undefined);
            } else {

                if (parentValueReponse.isInherited === true) {

                    if (isLocationPreference == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getLocationOptimizationValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting location preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedSubClasses = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else if (isCommunirtySetting == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getCommunityStrategistValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting community strategist preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedStrategists = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else {
                        return cb(err, parentValueReponse);
                    }

                } else {
                    parentValueReponse.isInherited = false;
                    return cb(err, parentValueReponse);
                }

            }
        });
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.MODEL) {

        if (prefValueObj != null && prefValueObj.length > 0) {
            prefValueJsonObj.value = prefValueObj[0].PrefValue;
            prefValueJsonObj.id = prefValueObj[0].PrefId
        }

        self.getParentValueFromFirm(data, pref, prefValueJsonObj, function(err, parentValueReponse) {

            if (err) {
                logger.error("Error While getting Model parent value in PreferencesDao.prototype.getFinalValueForPreference() : \n" + err);
                return cb(err, undefined);
            } else {


                if (parentValueReponse.isInherited === true) {

                    if (isLocationPreference == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getLocationOptimizationValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting location preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedSubClasses = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else if (isCommunirtySetting == true) {
                        var preferencevalueObj = {
                            preferenceValueId: parentValueReponse.inheritedPrefId
                        }
                        self.getCommunityStrategistValues(data, preferencevalueObj, function(err, subClasses) {
                            if (err) {
                                logger.error("Error while getting community strategist preference  : " + pref.id + " " + pref.name + " PreferencesDao.prototype.updatePreferencesValues()  \n" + err);
                                return cb(err, finalPreferenceList);
                            } else {
                                parentValueReponse.inheritedStrategists = subClasses;
                                return cb(err, parentValueReponse);
                            }
                        });
                    } else {
                        return cb(err, parentValueReponse);
                    }

                } else {
                    parentValueReponse.isInherited = false;
                    return cb(err, parentValueReponse);
                }
            }
        });
    } else {
        return cb(undefined, undefined);
    }
};

PreferencesDao.prototype.getOptionListPreference = function(data, pref, cb) {

    var firmConnection = baseDao.getConnection(data);

    var optionQuery = "Select po.id, po.preferenceId, po.optionName, po.optionValue, po.displayOrder as displayOrder from preferenceOption po where po.preferenceId = ? and po.isDeleted = 0";

    firmConnection.query(optionQuery, [pref.id], function(err, rows) {
        if (err) {
            logger.error("Error While executing  optionQuery : " + optionQuery + " in PreferencesDao.prototype.getOptionListPreference() : \n" + err);

            return cb(err, rows)
        } else {
            logger.info("Query optionQuery :  " + optionQuery + " executed in PreferencesDao.prototype.getOptionListPreference().");

            var options = [];

            rows.forEach(function(option) {
                options.push({
                    id: option.id,
                    name: option.optionName,
                    order: option.displayOrder
                });
            });
            return cb(err, options);
        }
    });
};

PreferencesDao.prototype.getOptionValuesForPreference = function(data, preferenceValueId, cb) {

    var firmConnection = baseDao.getConnection(data);


    var selectPreferenceOptionsQuery = "Select preferenceOptionId, prefOrder from preferenceOptionValue where preferenceValueId = ? ORDER BY prefOrder";
    firmConnection.query(selectPreferenceOptionsQuery, [preferenceValueId], function(err, rows) {
        if (err) {
            logger.error("Error While executing  selectPreferenceOptionsQuery : " + selectPreferenceOptionsQuery + " in PreferencesDao.prototype.getOptionValuesForPreference() : \n" + err);

            cb(err, rows)
        } else {

            logger.info("Query selectPreferenceOptionsQuery :  " + selectPreferenceOptionsQuery + " executed in PreferencesDao.prototype.getOptionValuesForPreference().");
            var options = [];

            rows.forEach(function(option) {
                options.push({
                    id: option.preferenceOptionId,
                    order: option.prefOrder
                });
            });
            cb(err, options);
        }
    });

};

PreferencesDao.prototype.getFinalOptionValue = function(data, pref, prefChildValue, prefValueObj, cb) {
    var self = this;

    if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.FIRM) {
        if (prefChildValue != null && prefChildValue.length > 0) {
            prefValueObj.id = prefChildValue[0].PrefId
        }

        return cb(null, prefValueObj);
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.CUSTODIAN) {

        self.getCustodianParentValue(data, pref, prefValueObj, function(err, parentValueReponse) {

            if (err) {
                logger.error("Error while fetching parent value id for Custodian preference (Option) : " + pref.id + " " + pref.name + " in PreferencesDao.prototype.getFinalOptionValue()  \n" + err);
                return cb(err, null);

            } else {

                if (parentValueReponse !== null && parentValueReponse.isInherited === true) {
                    var preferenceValueId = parentValueReponse.inheritedPrefId;
                    self.getOptionValuesForPreference(data, preferenceValueId, function(err, optionValues) {

                        if (err) {
                            logger.error("Error while fetching parent selected options for preference (Option) : " + pref.id + " " + pref.name + " in PreferencesDao.prototype.getFinalOptionValue() \n" + err);
                            return cb(err, null);
                        } else {
                            parentValueReponse.inheritedSelectedOptions = optionValues;
                            return cb(err, parentValueReponse);
                        }
                    });
                } else {
                    return cb(err, parentValueReponse);
                }

            }
        });
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.TEAM) {

        self.getParentValueFromFirm(data, pref, prefValueObj, function(err, parentValueReponse) {

            if (err) {
                logger.error("Error while fetching parent value id for Team preference (Option) : " + pref.id + " " + pref.name + "  in PreferencesDao.prototype.getFinalOptionValue() \n" + err);
                return cb(err, null);

            } else {
                if (parentValueReponse !== null && parentValueReponse.isInherited === true) {
                    var preferenceValueId = parentValueReponse.inheritedPrefId;
                    self.getOptionValuesForPreference(data, preferenceValueId, function(err, optionValues) {

                        if (err) {
                            logger.error("Error while fetching parent selected options for preference (Option) : " + pref.id + " " + pref.name + " inPreferencesDao.prototype.getFinalOptionValue()  \n" + err);
                            return cb(err, optionValues);
                        } else {
                            parentValueReponse.inheritedSelectedOptions = optionValues;
                            return cb(err, parentValueReponse);
                        }
                    });
                } else {
                    return cb(err, parentValueReponse);
                }
            }
        });
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.PORTFOLIO) {

        self.getPortfolioParentValue(data, pref, prefValueObj, true, function(err, parentValueReponse) {

            if (err) {
                logger.error("Error while fetching parent value id for Portfolio preference (Option) : " + pref.id + " " + pref.name + " in PreferencesDao.prototype.getFinalOptionValue() \n" + err);
                return cb(err, null);

            } else {
                if (parentValueReponse !== null && parentValueReponse.isInherited === true) {
                    var preferenceValueId = parentValueReponse.inheritedPrefId;
                    self.getOptionValuesForPreference(data, preferenceValueId, function(err, optionValues) {

                        if (err) {
                            logger.error("Error while fetching parent selected options for preference (Option) : " + pref.id + " " + pref.name + " inPreferencesDao.prototype.getFinalOptionValue()  \n" + err);
                            return cb(err, optionValues);
                        } else {
                            parentValueReponse.inheritedSelectedOptions = optionValues;
                            return cb(err, parentValueReponse);
                        }
                    });
                } else {
                    return cb(err, parentValueReponse);
                }
            }
        });
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.ACCOUNT) {

        self.getAccountParentValue(data, pref, prefValueObj, function(err, parentValueReponse) {

            if (err) {
                logger.error("Error while fetching parent value id for Portfolio preference (Option) : " + pref.id + " " + pref.name + " in PreferencesDao.prototype.getFinalOptionValue().self.getAccountParentValue() \n" + err);
                return cb(err, null);

            } else {
                if (parentValueReponse !== null && parentValueReponse.isInherited === true) {
                    var preferenceValueId = parentValueReponse.inheritedPrefId;
                    self.getOptionValuesForPreference(data, preferenceValueId, function(err, optionValues) {

                        if (err) {
                            logger.error("Error while fetching parent selected options for preference (Option) : " + pref.id + " " + pref.name + " inPreferencesDao.prototype.getFinalOptionValue().self.getAccountParentValue()  \n" + err);
                            return cb(err, optionValues);
                        } else {
                            parentValueReponse.inheritedSelectedOptions = optionValues;
                            return cb(err, parentValueReponse);
                        }
                    });
                } else {
                    return cb(err, parentValueReponse);
                }
            }
        });
    } else if (data.preferencesFetchCriteria.levelBitValue == constants.recordBitValue.MODEL) {

        self.getParentValueFromFirm(data, pref, prefValueObj, function(err, parentValueReponse) {

            if (err) {
                logger.error("Error while fetching parent value id for Model preference (Option) : " + pref.id + " " + pref.name + " in PreferencesDao.prototype.getFinalOptionValue()  \n" + err);
                return cb(err, null);

            } else {

                if (parentValueReponse !== null && parentValueReponse.isInherited === true) {
                    var preferenceValueId = parentValueReponse.inheritedPrefId;
                    self.getOptionValuesForPreference(data, preferenceValueId, function(err, optionValues) {

                        if (err) {
                            logger.error("Error while fetching parent selected options for preference (Option) : " + pref.id + " " + pref.name + " in PreferencesDao.prototype.getFinalOptionValue() \n" + err);
                            return cb(err, null);
                        } else {
                            parentValueReponse.inheritedSelectedOptions = optionValues;
                            return cb(err, parentValueReponse);
                        }
                    });
                } else {
                    return cb(err, parentValueReponse);
                }

            }
        });
    } else {
        return cb(null, null);
    }
};

PreferencesDao.prototype.getCustodianValue = function(data, pref, prefValueJsonObj, custodian, cb) {
    var firmConnection = baseDao.getConnection(data);
    var self = this;
    var lookInPVforCustodian = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";

    var custodianId = custodian.custodianId;
    var custodianName = custodian.custodianName;

    firmConnection.query(lookInPVforCustodian, [pref.id, 2, custodianId], function(err, custodianValue) {
        if (err) {
            logger.error("Error While executing  lookInPVforCustodian : " + lookInPVforCustodian + " (getCustodianValue()) : \n" + err);

            return cb(err, custodianValue);
        } else {
            logger.info("Query lookInPVforCustodian :  " + lookInPVforCustodian + " executed (getCustodianValue()).");

            if (custodianValue.length > 0) {

                prefValueJsonObj.isInherited = true;
                prefValueJsonObj.inheritedPrefId = custodianValue[0].PrefId;
                prefValueJsonObj.inheritedFromId = custodianId;
                prefValueJsonObj.inheritedFrom = constants.record.CUSTODIAN;
                prefValueJsonObj.inheritedFromName = custodianName; // firm name here
                prefValueJsonObj.inheritedValue = custodianValue[0].PrefValue;
                prefValueJsonObj.inheritedFromValueId = custodianValue[0].PrefId;
                prefValueJsonObj.selectedIndicatorValue = custodianValue[0].indicator;

                return cb(err, prefValueJsonObj);

            } else {

                self.getParentValueFromFirm(data, pref, prefValueJsonObj, function(err, parentValueReponse) {
                    if (err) {
                        logger.error("Error While getting team parent value in PreferencesDao.prototype.getFinalValueForPreference() : \n" + err);
                        return cb(err, undefined);
                    } else {

                        if (parentValueReponse.isInherited === true) {
                            return cb(err, parentValueReponse);
                        } else {
                            parentValueReponse.isInherited = false;
                            return cb(err, parentValueReponse);
                        }

                    }
                });
            }

        }
    });
};


PreferencesDao.prototype.getCustodianParentValue = function(data, pref, prefValueObj, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var lookInPVQuery = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";

    var parentFirmId = data.user.firmId;
    firmConnection.query(lookInPVQuery, [pref.id, 1, parentFirmId], function(err, parentValue) {
        if (err) {
            logger.error("Error While executing  lookInPVQuery : " + lookInPVQuery + " PreferencesDao.prototype.getCustodianParentValue() : \n" + err);

            return cb(err, parentValue);
        } else {
            logger.info("Query lookInPVQuery :  " + lookInPVQuery + " executed (getCustodianParentValue()).");

            if (parentValue.length <= 0) {

                return cb(err, prefValueObj);
            } else {
                if (parentValue[0].length <= 0) {
                    return cb(err, prefValueObj);
                }

                prefValueObj.isInherited = true;
                prefValueObj.inheritedPrefId = parentValue[0].PrefId;
                prefValueObj.inheritedFromId = parentFirmId;
                prefValueObj.inheritedFrom = constants.record.FIRM;;
                prefValueObj.inheritedFromName = ''; // firm name here
                prefValueObj.inheritedValue = parentValue[0].PrefValue;
                prefValueObj.inheritedFromValueId = parentValue[0].PrefId;
                prefValueObj.selectedIndicatorValue = parentValue[0].indicator;

                return cb(err, prefValueObj);
            }

        }
    });
};

PreferencesDao.prototype.getPortfolioValue = function(data, pref, cb) {
    var firmConnection = baseDao.getConnection(data);
    var self = this;
    var lookInPVforPortfolio = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";

    var portfolioId = data.preferencesFetchCriteria.portfolioId;
    var portfolioName = data.preferencesFetchCriteria.custodianName;

    firmConnection.query(lookInPVforPortfolio, [pref.id, 8, portfolioId], function(err, portfolioValue) {
        if (err) {
            logger.error("Error While executing  lookInPVforPortfolio : " + lookInPVforPortfolio + " in PreferencesDao.prototype.getPortfolioValue() : \n" + err);

            return cb(err, portfolioValue);
        } else {
            logger.info("Query lookInPVforPortfolio :  " + lookInPVforPortfolio + " executed (getPortfolioValue()).");

            if (portfolioValue.length > 0) {

                prefValueJsonObj.isInherited = true;
                prefValueJsonObj.inheritedPrefId = portfolioValue[0].PrefId;
                prefValueJsonObj.inheritedFromId = portfolioId;
                prefValueJsonObj.inheritedFrom = constants.record.PORTFOLIO;
                prefValueJsonObj.inheritedFromName = portfolioName; // firm name here
                prefValueJsonObj.inheritedValue = portfolioValue[0].PrefValue;
                prefValueJsonObj.inheritedFromValueId = portfolioValue[0].PrefId;
                prefValueJsonObj.selectedIndicatorValue = portfolioValue[0].indicator;

                return cb(err, prefValueJsonObj);

            } else {

                self.getParentValueFromFirm(data, pref, prefValueJsonObj, function(err, parentValueReponse) {
                    if (err) {
                        logger.error("Error While getting team parent value in PreferencesDao.prototype.getFinalValueForPreference() : \n" + err);
                        return cb(err, undefined);
                    } else {

                        if (parentValueReponse.isInherited === true) {
                            return cb(err, parentValueReponse);
                        } else {
                            parentValueReponse.isInherited = false;
                            return cb(err, parentValueReponse);
                        }

                    }
                });
            }
        }
    });
};

//merge portfolio and account  value
PreferencesDao.prototype.getAccountPortfolioValue = function(data, pref, prefValueJsonObj, portfolio, cb) {
    var firmConnection = baseDao.getConnection(data);
    var self = this;
    var lookInPVforPortfolio = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";

    var portfolioId = portfolio.portfolioId;
    var portfolioName = portfolio.portfolioName;

    firmConnection.query(lookInPVforPortfolio, [pref.id, 8, portfolioId], function(err, portfolioValue) {
        if (err) {
            logger.error("Error While executing  lookInPVforPortfolio : " + lookInPVforPortfolio + " in PreferencesDao.prototype.getPortfolioValue() : \n" + err);

            return cb(err, portfolioValue);
        } else {
            logger.info("Query lookInPVforPortfolio :  " + lookInPVforPortfolio + " executed (getPortfolioValue()).");

            if (portfolioValue.length > 0) {

                prefValueJsonObj.isInherited = true;
                prefValueJsonObj.inheritedPrefId = portfolioValue[0].PrefId;
                prefValueJsonObj.inheritedFromId = portfolioId;
                prefValueJsonObj.inheritedFrom = constants.record.PORTFOLIO;
                prefValueJsonObj.inheritedFromName = portfolioName; // firm name here
                prefValueJsonObj.inheritedValue = portfolioValue[0].PrefValue;
                prefValueJsonObj.inheritedFromValueId = portfolioValue[0].PrefId;
                prefValueJsonObj.selectedIndicatorValue = portfolioValue[0].indicator;

                return cb(err, prefValueJsonObj);

            } else {
                return cb(err, prefValueJsonObj);
            }
        }
    });
};

//compare portfolio against Model
PreferencesDao.prototype.getPortfolioModelValue = function(data, pref, prefValueJsonObj, portfolio, cb) {
    var firmConnection = baseDao.getConnection(data);
    var self = this;

    var protfolioModelQuery = "Select p.name as name, p.id as id, p.modelId as modelId from portfolio p where p.id = ? and isDeleted = 0"
    var lookInPVforModel = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";

    var portfolioId = portfolio.portfolioId;
    logger.debug("*********************************************");
    firmConnection.query(protfolioModelQuery, [portfolioId], function(err, portfolioModel) {
        if (err) {
            logger.error("Error While executing  protfolioModelQuery : " + protfolioModelQuery + " in PreferencesDao.prototype.getPortfolioModelValue() : \n" + err);
            return cb(err, portfolioModel);
        } else {
            if (portfolioModel.length <= 0) {
                logger.info("Portfolio does not exist in PreferencesDao.prototype.getPortfolioModelValue().");
                return cb(err, prefValueJsonObj);
            } else {
                var modelId = portfolioModel[0].modelId;
                var modelName = portfolioModel[0].name;

                if (modelId == null || modelId == undefined) {
                    logger.info("Poertfolio Model not Found PreferencesDao.prototype.getPortfolioModelValue().");
                    return cb(err, prefValueJsonObj);
                }

                firmConnection.query(lookInPVforModel, [pref.id, 16, modelId], function(err, modelValue) {
                    if (err) {
                        logger.error("Error While executing  lookInPVforModel : " + lookInPVforModel + " in PreferencesDao.prototype.getPortfolioModelValue() : \n" + err);

                        return cb(err, modelValue);
                    } else {
                        logger.info("Query lookInPVforModel :  " + lookInPVforModel + " executed (PreferencesDao.prototype.getPortfolioModelValue).");

                        if (modelValue.length > 0) {

                            prefValueJsonObj.isInherited = true;
                            prefValueJsonObj.inheritedPrefId = modelValue[0].PrefId;
                            prefValueJsonObj.inheritedFromId = modelId;
                            prefValueJsonObj.inheritedFrom = constants.record.MODEL;
                            prefValueJsonObj.inheritedFromName = modelName; // firm name here
                            prefValueJsonObj.inheritedValue = modelValue[0].PrefValue;
                            prefValueJsonObj.inheritedFromValueId = modelValue[0].PrefId;
                            prefValueJsonObj.selectedIndicatorValue = modelValue[0].indicator;

                            return cb(err, prefValueJsonObj);

                        } else {
                            return cb(err, prefValueJsonObj);
                        }
                    }
                });
            }

        }
    });
};

//compare Model against Team
PreferencesDao.prototype.getModelTeamValue = function(data, pref, prefValueJsonObj, cb) {
    var firmConnection = baseDao.getConnection(data);
    var self = this;

    var modelTeamQueryQuery = "Select t.id as teamId, t.name as teamName from userTeam ut LEFT JOIN team t ON t.id = ut.teamId " +
        "and ut.isDeleted = 0 where ut.userId = ? And ut.isPrimary = 1 And ut.isDeleted = 0";
    var lookInPVforTeam = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And" +
        "  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";
    logger.debug("UserID : " + data.user.userId);
    var userId = data.user.userId;
    logger.debug("UserID : " + userId);
    if (userId == null || userId == undefined) {
        logger.error("Error Unable to get current logged in user in PreferencesDao.prototype.getModelTeamValue()");
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }

    firmConnection.query(modelTeamQueryQuery, [userId], function(err, modelTeam) {
        if (err) {
            logger.error("Error While executing  modelTeamQueryQuery : " + modelTeamQueryQuery + " in PreferencesDao.prototype.getModelTeamValue() : \n" + err);
            return cb(err, modelTeam);
        } else {
            if (modelTeam.length <= 0) {
                logger.info("Team does not exist in PreferencesDao.prototype.getModelTeamValue().");
                return cb(err, prefValueJsonObj);
            } else {
                var teamId = modelTeam[0].teamId;
                var teamName = modelTeam[0].teamName;

                if (teamId == null || teamId == undefined) {
                    logger.info("Model Team not Found PreferencesDao.prototype.getModelTeamValue().");
                    return cb(err, prefValueJsonObj);
                }

                firmConnection.query(lookInPVforTeam, [pref.id, 4, teamId], function(err, teamValue) {
                    if (err) {
                        logger.error("Error While executing  lookInPVforTeam : " + lookInPVforTeam + " in PreferencesDao.prototype.getModelTeamValue() : \n" + err);

                        return cb(err, teamValue);
                    } else {
                        logger.info("Query lookInPVforTeam :  " + lookInPVforTeam + " executed (PreferencesDao.prototype.getModelTeamValue()).");

                        if (teamValue.length > 0) {

                            prefValueJsonObj.isInherited = true;
                            prefValueJsonObj.inheritedPrefId = teamValue[0].PrefId;
                            prefValueJsonObj.inheritedFromId = teamId;
                            prefValueJsonObj.inheritedFrom = constants.record.TEAM;
                            prefValueJsonObj.inheritedFromName = teamName; // firm name here
                            prefValueJsonObj.inheritedValue = teamValue[0].PrefValue;
                            prefValueJsonObj.inheritedFromValueId = teamValue[0].PrefId;
                            prefValueJsonObj.selectedIndicatorValue = teamValue[0].indicator;

                            return cb(err, prefValueJsonObj);

                        } else {
                            return cb(err, prefValueJsonObj);
                        }
                    }
                });
            }

        }
    });
};

PreferencesDao.prototype.getPortfolioParentValue = function(data, pref, prefValueJsonObj, isFirmIncluded, cb) {
    var firmConnection = baseDao.getConnection(data);
    var self = this;

    var lookInPVQuery = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ?" +
        " And pv.relatedTypeId = ? And pv.isDeleted = 0";
    var portfoilioModelParentQuery = "Select m.id as modelId, m.name as modelName from portfolio p LEFT JOIN model m ON m.id = p.modelId And m.isDeleted = 0 where p.id = ? and p.isDeleted = 0";

    var isPrimaryCheck = 1;

    var portfolioId = data.preferencesFetchCriteria.recordId;

    firmConnection.query(portfoilioModelParentQuery, [portfolioId], function(err, parentModel) {
        if (err) {
            logger.error("Error While executing  portfoilioModelParentQuery : " + portfoilioModelParentQuery + " in PreferencesDao.prototype.getPortfolioParentValue() : \n" + err);

            return cb(err, null);
        } else {
            logger.info("Query portfoilioModelParentQuery :  " + portfoilioModelParentQuery + " executed (PreferencesDao.prototype.getPortfolioParentValue()).");

            if (parentModel.length <= 0) {
                prefValueJsonObj.isInherited = false;
                return cb(err, prefValueJsonObj);
            } else {
                var modelId = parentModel[0].modelId;
                var modelName = parentModel[0].modelName;
                firmConnection.query(lookInPVQuery, [pref.id, 16, modelId], function(err, modelValue) {
                    if (err) {
                        logger.error("Error While executing  lookInPVQuery : " + lookInPVQuery + " in PreferencesDao.prototype.getPortfolioParentValue : \n" + err);

                        return cb(err, modelValue);
                    } else {
                        logger.info("Query lookInPVQuery :  " + lookInPVQuery + " executed (PreferencesDao.prototype.getPortfolioParentValue).");

                        //if value not found at Tea, level
                        if (modelValue != null && modelValue != undefined && modelValue.length > 0) {
                            prefValueJsonObj.isInherited = true;
                            prefValueJsonObj.inheritedPrefId = modelValue[0].PrefId;
                            prefValueJsonObj.inheritedFromId = modelId;
                            prefValueJsonObj.inheritedFrom = constants.record.MODEL;
                            prefValueJsonObj.inheritedFromName = modelName;
                            prefValueJsonObj.inheritedValue = modelValue[0].PrefValue;
                            prefValueJsonObj.inheritedFromValueId = modelValue[0].PrefId;
                            prefValueJsonObj.selectedIndicatorValue = modelValue[0].indicator;

                            return cb(err, prefValueJsonObj);
                        } else {
                            self.getParentValueFromTeam(data, pref, prefValueJsonObj, function(err, parentValueReponse) {
                                if (err) {
                                    logger.error("Error while fetching parent value id for Team preference (Option) : " + pref.id + " " + pref.name + "  in PreferencesDao.prototype.getPortfolioParentValue() \n" + err);
                                    return cb(err, null);

                                } else {

                                    // return if value inherited from team
                                    if (parentValueReponse.isInherited == true) {
                                        return cb(err, parentValueReponse);
                                    }
                                    if (isFirmIncluded == false) { // if Firm not included then rturn from here
                                        return cb(err, parentValueReponse);
                                    }


                                    self.getParentValueFromFirm(data, pref, parentValueReponse, function(err, firmValueReponse) {
                                        if (err) {

                                            return cb(err, firmValueReponse);
                                        } else {

                                            return cb(err, firmValueReponse);
                                        }
                                    });
                                }
                            });

                        }
                    }
                });
            }
        }
    });
};

PreferencesDao.prototype.getAccountParentValue = function(data, pref, prefValueJsonObj, cb) {
    var firmConnection = baseDao.getConnection(data);
    var self = this;
    var cacheKey = "ACCOUNT_" + data.preferencesFetchCriteria.recordId;
    var lookInPVQuery = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";
    var accountParentQuery = "Select p.id as portfolioId, p.name as portfolioName, c.id as custodianId, c.name as custodianName  from account tpa LEFT JOIN portfolio p ON p.id = tpa.portfolioId And p.isDeleted = 0 LEFT JOIN custodian c ON c.id = tpa.custodianId And c.isDeleted = 0 where tpa.id = ?";

    var portfolio = {
        portfolioId: null,
        portfolioName: null
    };

    var custodian = {
        custodianId: null,
        custodianName: null
    };

    firmConnection.query(accountParentQuery, [data.preferencesFetchCriteria.recordId], function(err, accountParent) {
        if (err) {
            logger.error("Error While executing  accountParentQuery : " + accountParentQuery + " PreferencesDao.prototype.getAccountParentValue : \n" + err);

            return cb(err, null);
        } else {
            logger.info("Query accountParentQuery :  " + accountParentQuery + " executed PreferencesDao.prototype.getAccountParentValue. result is : \n" + JSON.stringify(accountParent));

            if (accountParent.length <= 0) {

                return cb(err, prefValueJsonObj);
            } else {
                if (accountParent.length > 0) {
                    portfolio.portfolioId = accountParent[0].portfolioId;
                    portfolio.portfolioName = accountParent[0].portfolioName;
                    custodian.custodianId = accountParent[0].custodianId;
                    custodian.custodianName = accountParent[0].custodianName;

                    if (portfolio.portfolioId !== null && portfolio.portfolioId !== undefined) { // if portfolio is parent


                        self.getAccountPortfolioValue(data, pref, prefValueJsonObj, portfolio, function(err, accountPortfolioValue) {

                            if (err) {
                                logger.error("Error While executing  getAccountPortfolioValue() in PreferencesDao.prototype.getAccountParentValue : \n" + err);
                                return cb(err, prefValueJsonObj);
                            } else {

                                if (accountPortfolioValue.isInherited == true) {

                                    return cb(err, accountPortfolioValue);
                                } else {

                                    self.getPortfolioParentValue(data, pref, prefValueJsonObj, false, function(err, modelTeamValue) {

                                        if (err) {
                                            logger.error("Error While executing  getPortfolioModelValue() in PreferencesDao.prototype.getAccountParentValue : \n" + err);
                                            return cb(err, modelTeamValue);
                                        } else {

                                            if (modelTeamValue.isInherited == true) {
                                                return cb(err, modelTeamValue);
                                            } else {
                                                if (custodian.custodianId !== null || custodian.custodianId == undefined) {
                                                    // go back to custodian
                                                    self.getCustodianValue(data, pref, prefValueJsonObj, custodian, function(err, custodianFirmValue) {

                                                        if (err) {
                                                            logger.error("Error While executing  getCustodianValue() in PreferencesDao.prototype.getAccountParentValue : \n" + err);
                                                            return cb(err, custodianFirmValue);
                                                        } else {
                                                            return cb(err, custodianFirmValue);
                                                        }
                                                    });
                                                } else {
                                                    return cb(err, prefValueJsonObj);
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    } else if (custodian.custodianId !== null || custodian.custodianId == undefined) {
                        // go back to custodian
                        self.getCustodianValue(data, pref, prefValueJsonObj, custodian, function(err, custodianFirmValue) {

                            if (err) {
                                logger.error("Error While executing  getCustodianValue() in PreferencesDao.prototype.getAccountParentValue : \n" + err);
                                return cb(err, custodianFirmValue);
                            } else {
                                return cb(err, custodianFirmValue);
                            }
                        });
                    } else {
                        return cb(err, prefValueJsonObj);
                    }

                } else {
                    return cb(err, prefValueJsonObj);
                }
            }
        }
    });
};


//provide team value
PreferencesDao.prototype.getParentValueFromTeam = function(data, pref, prefValueJsonObj, cb) {

    var firmConnection = baseDao.getConnection(data);
    var self = this;

    var lookInPVQuery = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";
    var portfoilioParentQuery = "Select tpa.teamId as teamId, t.name as teamName from teamPortfolioAccess tpa LEFT JOIN team t ON t.id = tpa.teamId  where tpa.isPrimary = ? and tpa.portfolioId = ?";

    var isPrimaryCheck = 1;

    var portfolioId = data.preferencesFetchCriteria.recordId;

    firmConnection.query(portfoilioParentQuery, [isPrimaryCheck, portfolioId], function(err, parentTeam) {
        if (err) {
            logger.error("Error While executing  portfoilioParentQuery : " + portfoilioParentQuery + " in PreferencesDao.prototype.getPortfolioParentValue() : \n" + err);

            return cb(err, null);
        } else {
            logger.info("Query portfoilioParentQuery :  " + portfoilioParentQuery + " executed (getCustodianParentValue()).");

            if (parentTeam.length <= 0) {
                prefValueJsonObj.isInherited = false;
                return cb(err, prefValueJsonObj);
            } else {
                var teamId = parentTeam[0].teamId;
                var teamName = parentTeam[0].teamName;
                firmConnection.query(lookInPVQuery, [pref.id, 4, teamId], function(err, parentValue) {
                    if (err) {
                        logger.error("Error While executing  lookInPVQuery : " + lookInPVQuery + " inPreferencesDao.prototype.getPortfolioParentValue() : \n" + err);

                        return cb(err, parentValue);
                    } else {
                        logger.info("Query lookInPVQuery :  " + lookInPVQuery + " executed (getPortfolioParentValue()).");

                        //if value not found at Tea, level
                        if (parentValue == null || parentValue == undefined || parentValue.length <= 0) {
                            prefValueJsonObj.isInherited = false;
                            return cb(err, prefValueJsonObj);
                        } else {

                            prefValueJsonObj.isInherited = true;
                            prefValueJsonObj.inheritedPrefId = parentValue[0].PrefId;
                            prefValueJsonObj.inheritedFromId = teamId;
                            prefValueJsonObj.inheritedFrom = constants.record.TEAM;
                            prefValueJsonObj.inheritedFromName = teamName;
                            prefValueJsonObj.inheritedValue = parentValue[0].PrefValue;
                            prefValueJsonObj.inheritedFromValueId = parentValue[0].PrefId;
                            prefValueJsonObj.selectedIndicatorValue = parentValue[0].indicator;

                            return cb(err, prefValueJsonObj);
                        }
                    }
                });
            }
        }
    });
};

// provide firm value
PreferencesDao.prototype.getParentValueFromFirm = function(data, pref, prefValueObj, cb) {
    var firmConnection = baseDao.getConnection(data);

    var lookInPVQuery = "Select pv.id as PrefId, pv.value as PrefValue, pv.indicatorValue as indicator from preferenceValue pv where pv.preferenceId = ? And  pv.relatedType = ? And pv.relatedTypeId = ? And pv.isDeleted = 0";
    var firmId = data.user.firmId;
    firmConnection.query(lookInPVQuery, [pref.id, 1, firmId], function(err, parentValue) {
        if (err) {
            logger.error("Error While executing  lookInPVQuery : " + lookInPVQuery + " (getCustodianParentValue()) : \n" + err);

            return cb(err, parentValue);
        } else {
            logger.info("Query lookInPVQuery :  " + lookInPVQuery + " executed (getCustodianParentValue()).");

            if (parentValue == null || parentValue == undefined || parentValue.length <= 0) {
                return cb(err, prefValueObj);
            }

            prefValueObj.isInherited = true;
            prefValueObj.inheritedPrefId = parentValue[0].PrefId;
            prefValueObj.inheritedFromId = firmId;
            prefValueObj.inheritedFrom = constants.record.FIRM;
            prefValueObj.inheritedFromName = ''; // firm name here
            prefValueObj.inheritedValue = parentValue[0].PrefValue;
            prefValueObj.inheritedFromValueId = parentValue[0].PrefId;
            prefValueObj.selectedIndicatorValue = parentValue[0].indicator;
            return cb(err, prefValueObj);

        }
    });
};

PreferencesDao.prototype.getLocationOptimizationValues = function(data, prefereneObj, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var preferenceValueId = prefereneObj.preferenceValueId;

    var locationPrefQuery = "Select lopv.subClassId as subClassId, lp.`group` as groupName, lp.name as name, lp.code as code, lov.value as value, sb.name as " +
        "subClassName from locationOptimizationPreferenceValue lopv LEFT JOIN locationOptimizationValue lov ON lov.locationPreferenceValueId = lopv.id  LEft Join " +
        "assetSubClass sb ON sb.id = lopv.subClassId LEft join locationOptimizationPreferences lp On lp.id = lov.locationPreferenceId " +
        "where lopv.preferenceValueId = ? And lopv.isDeleted =0 And lov.isDeleted = 0 ORDER BY lopv.subClassId ASC, lp.`group` ASC, lp.`name` DESC";

    firmConnection.query(locationPrefQuery, [preferenceValueId], function(err, rows, fields) {

        if (err) {
            logger.error("Error While executing  locationPrefQuery : " + locationPrefQuery + " (PreferencesDao.prototype.getLocationOptimizationValues()) : \n" + err);
            return cb(err, rows);
        } else {
            var subClasses = [];

            if (rows.length > 0) {

                var subClassObj = JSON.parse(JSON.stringify(constants.locationOptimizationFormat));

                //				   rows.forEach(function(subClass){
                var length = rows.length;

                for (var i = 0; i < length; i++) {

                    var subClass = rows[i];

                    if (subClassObj.id == subClass.subClassId && subClassObj.id != null) {

                        if (subClass.groupName.toLowerCase() == (constants.preferenceCommonContant.LOCATION_BUY).toLowerCase()) {

                            subClassObj.buySetting[subClass.code] = subClass.value;

                        } else if (subClass.groupName.toLowerCase() == (constants.preferenceCommonContant.LOCATION_SELL).toLowerCase()) {

                            subClassObj.sellSetting[subClass.code] = subClass.value;

                        } else {


                        }

                    } else {

                        if (subClassObj.id != null) {
                            subClasses.push(JSON.parse(JSON.stringify(subClassObj)));
                        }

                        subClassObj = JSON.parse(JSON.stringify(constants.locationOptimizationFormat));

                        subClassObj.id = subClass.subClassId;
                        subClassObj.name = subClass.subClassName;

                        if (subClass.groupName.toLowerCase() == (constants.preferenceCommonContant.LOCATION_BUY).toLowerCase()) {

                            subClassObj.buySetting[subClass.code] = subClass.value;

                        } else if (subClass.groupName.toLowerCase() == (constants.preferenceCommonContant.LOCATION_SELL).toLowerCase()) {

                            subClassObj.sellSetting[subClass.code] = subClass.value;

                        } else {


                        }
                    }

                    if (i == (length - 1)) {
                        subClasses.push(JSON.parse(JSON.stringify(subClassObj)));
                    }
                }

                return cb(err, subClasses);
            } else {
                return cb(err, subClasses);
            }
        }
    });
};

PreferencesDao.prototype.getCommunityStrategistValues = function(data, prefereneObj, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var communityStrategist = {
        strategistIds: [],
        modelAccessLevel: null,
        communityModels: []
    };

    var preferenceValueId = prefereneObj.preferenceValueId;
    var modelAccesslevel = 2; // if selected
    var communityStrategistQuery = "Select csp.id, csp.preferenceValueId ,  csp.modelAccessLevel, GROUP_CONCAT(DISTINCT csv.strategistId) as strategistIds, GROUP_CONCAT(DISTINCT csm.modelId) as modelIds from communityStrategistPreferenceValue csp left join communityStrategistModel csm ON csm.communityStrategistPreferenceId = csp.id And csp.modelAccessLevel = ?  Left Join communityStrategistValue csv ON csv.communityStrategistpreferenceId = csp.id where csp.isDeleted = 0 And csp.preferenceValueId = ? group by csp.preferenceValueId";

    firmConnection.query(communityStrategistQuery, [modelAccesslevel, preferenceValueId], function(err, rows, fields) {

        if (err) {
            logger.error("Error While executing  communityStrategistQuery : " + communityStrategistQuery + " (PreferencesDao.prototype.getCommunityStrategistValues()) : \n" + err);
            return cb(err, rows);
        } else {

            if (rows.length > 0) {


                var strategistObj = rows[0];

                if (strategistObj.strategistIds != null) {
                    var ids = (strategistObj.strategistIds).split(",");
                    for (var i = 0; i < ids.length; i++) {
                        communityStrategist.strategistIds.push(parseInt(ids[i]));
                    }
                }

                communityStrategist.modelAccessLevel = strategistObj.modelAccessLevel;

                if (communityStrategist.modelAccessLevel == 2) {

                    if (strategistObj.modelIds != null) {
                        var ids = (strategistObj.modelIds).split(",");
                        for (var i = 0; i < ids.length; i++) {
                            communityStrategist.communityModels.push(parseInt(ids[i]));
                        }
                    }
                }


                return cb(err, communityStrategist);
            } else {
                return cb(err, communityStrategist);
            }
        }
    });
};


PreferencesDao.prototype.updateSecurityPreferences = function(data, preferenceValueId, pref, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var securitiesToSave = pref.securities;
    data.preferencesFetchCriteria.securityPreferenceId = pref.preferenceId;

    var preferenceObj = {
        preferenceId: pref.preferenceId,
        value: null,
        recordId: data.preferenceUpdateCriteria.recordId,
        levelBitValue: data.preferenceUpdateCriteria.levelBitValue
    }

    if (preferenceValueId != null) {

        self.deleteAllSecurities(data, preferenceValueId, function(err, deleteStatus) {
            if (err) {
                logger.error("Error While executing  deleteAllSecurities  (updateSecurityPreferences()) : \n" + err);

                return cb(err, insertStatus);
            } else {
                self.insertSecurityPreferences(data, preferenceValueId, securitiesToSave, function(err, insertStatus) {
                    if (err) {
                        logger.error("Error While executing  insertSecurityPreferences Block 1 (updateSecurityPreferences()) : \n" + err);
                        return cb(err, insertStatus);
                    } else {
                        logger.debug("Securities inserted successfully.")
                        return cb(err, insertStatus);
                    }
                });
            }
        });
    } else {
        var preferenceObj = {
            preferenceId: pref.preferenceId,
            value: null,
            recordId: data.preferenceUpdateCriteria.recordId,
            levelBitValue: data.preferenceUpdateCriteria.levelBitValue
        }
        self.insertPreferenceNewValue(data, preferenceObj, false, function(err, insertStatus) {
            if (err) {
                logger.error("Error While executing  insertPreferenceNewValue  (insertPreferenceNewValue()) : \n" + err);

                return cb(err, insertStatus);
            } else {

                if (insertStatus == undefined || insertStatus == null) {
                    logger.error("unable to insert preference value insertPreferenceNewValue  (insertPreferenceNewValue())");

                    return cb(err, insertStatus);
                }

                var insertedPrefernceId = insertStatus.insertId;
                self.insertSecurityPreferences(data, insertedPrefernceId, securitiesToSave, function(err, insertStatus) {
                    if (err) {
                        logger.error("Error While executing  insertSecurityPreferences Block 2  (updateSecurityPreferences()) : \n" + err);
                        return cb(err, insertStatus);
                    } else {
                        logger.debug("Securities inserted successfully.")
                        return cb(err, insertStatus);
                    }
                });

            }
        });
    }
};

PreferencesDao.prototype.insertSecurityPreferences = function(data, preferenceValueId, securityPrefObjs, cb) {
    var self = this;
    var firmConnection = null;

    var len = securityPrefObjs.length;

    for (var i = 0; i < len; i++) {

        var currentSecurity = securityPrefObjs[i];

        self.insertSecurityPreferenceValues(data, preferenceValueId, currentSecurity, function(err, insertStatus) {
            if (err) {
                logger.error("Error While executing  insertSecurityPreferenceValues  (insertSecurityPreferenceValues())  : \n" + err);
                return cb(err, insertStatus);
            } else {
                len--;
                if (len <= 0) {
                    return cb(err, insertStatus);
                }
            }
        });


    }
};


PreferencesDao.prototype.insertSecurityPreferenceValues = function(data, preferenceValueId, securityPrefObj, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = null;
    try {
        firmConnection = baseDao.getConnection(data);
    } catch (e) {
        logger.error("Datavase connection error.  PreferencesDao.prototype.saveOrUpdatePreferences() " + e);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }
    var levelBitValue = data.preferenceUpdateCriteria.levelBitValue;

    self.getSecuritiesPreferencesByLevel(data, levelBitValue, function(err, securityPreferences) {
        if (err) {
            logger.error("Error While executing  getSecuritiesPreferencesByLevel  (insertSecurityPreferenceValues()) for " + JSON.stringify(preferenceObj) + " : \n" + err);
            return cb(err, list);
        } else {
            if (securityPreferences == null) {
                logger.info("Unable to get security preferences list.");
                return cb(messages.notFound, securityPreferences);
            }

            var prefKeys = Object.keys(securityPreferences.securityPrefSet);
            var listToUpdate = [];

            prefKeys.forEach(function(key) {
                var rowToInsert = [];

                rowToInsert.push(preferenceValueId);
                rowToInsert.push(securityPrefObj.id);
                rowToInsert.push(securityPrefObj.custodianSecuritySymbolId);
                rowToInsert.push(securityPreferences.securityPrefSet[key]);
                //                .securityPrefSet
                var value = null

                if (securityPrefObj[key] != undefined && securityPrefObj[key] != null &&
                    key != 'taxableAlternate' && key != 'taxDeferredAlternate' && key != 'taxExemptAlternate') {
                    rowToInsert.push(securityPrefObj[key]);
                } else if (key == 'taxableAlternate' || key == 'taxDeferredAlternate' || key == 'taxExemptAlternate') {
                    rowToInsert.push(JSON.stringify(securityPrefObj[key]));
                } else {
                    rowToInsert.push(null);
                }

                if (key != "id" && key != "securityName" && key != "securityType" && key != "symbol" && key != "custodianSecuritySymbolId") {
                    listToUpdate.push(rowToInsert);
                }
            });

            var insertSecurityPrefVales = "Insert into securitySettingPreferenceValue (preferenceValueId, securityId," +
                " custodianSecuritySymbolId, securitySettingPreferenceId, value) VALUES  ?";

            firmConnection.query(insertSecurityPrefVales, [listToUpdate], function(err, status) {
                if (err) {
                    logger.error("Error While executing  insertSecurityPrefVales : " + insertSecurityPrefVales + " (insertSecurityPreferenceValues()) for " + JSON.stringify(listToUpdate) + " : \n" + err);
                    return cb(err, status);
                } else {
                    return cb(err, status);
                }
            });
        }
    });
};


PreferencesDao.prototype.getSecuritiesPreferencesByLevel = function(data, levelBitValue, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);
    var SECURITYKEY = "SECURITYPREF" + "" + levelBitValue;
    var securityPrefList = localCache.get(SECURITYKEY);

    if (securityPrefList == null || securityPrefList == undefined || securityPrefList.securityPrefSet <= 0) {
        //if already exist
        var securityPrefQuery = "Select * from securitySettingPreferences where (allowedRecordTypes & " + levelBitValue + ") = " + levelBitValue + "";

        if (levelBitValue == 0) {
            securityPrefQuery = "Select * from securitySettingPreferences where allowedRecordTypes != 0";
        }

        firmConnection.query(securityPrefQuery, function(err, status) {
            if (err) {
                logger.error("Error While executing  securityPrefQuery : " + securityPrefQuery + " (PreferencesDao.prototype.getSecuritiesPreferencesByLevel()) : \n" + err);
                return cb(err, null);
            } else {

                if (status.length > 0) {

                    var securityMaster = {
                        securityPrefSet: {},
                        securityPrefValidationSet: {}
                    };

                    status.forEach(function(securityPref) {
                        securityMaster.securityPrefSet[securityPref.name] = securityPref.id;
                        securityMaster.securityPrefValidationSet[securityPref.name] = {
                            type: securityPref.dataType
                        };
                    });
                    localCache.put(SECURITYKEY, securityMaster);
                    return cb(err, securityMaster);
                }

            }
        });
    } else {
        return cb(null, securityPrefList);
    }
}

PreferencesDao.prototype.deleteAllSecurities = function(data, securityValueId, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    //if already exist
    var securityDeleteQuery = "Delete from securitySettingPreferenceValue where preferenceValueId = ?";

    firmConnection.query(securityDeleteQuery, [securityValueId], function(err, status) {
        if (err) {
            logger.error("Error While executing  securityDeleteQuery : " + securityDeleteQuery + " (PreferencesDao.prototype.deleteAllSecurities()) : \n" + err);
            return cb(err, status);
        } else {
            return cb(err, status);
        }
    });
};

PreferencesDao.prototype.updateCommunityStrategist = function(data, preferenceValueId, pref, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    //    var preferenceValueId = data.id;
    var strategistPreferenceToSvae = pref.strategists;
    data.preferencesFetchCriteria.communityStrategistPreferenceId = pref.preferenceId;

    var preferenceObj = {
        preferenceId: pref.preferenceId,
        value: null,
        recordId: data.preferenceUpdateCriteria.recordId,
        levelBitValue: data.preferenceUpdateCriteria.levelBitValue
    }

    if (preferenceValueId != null) {

        var communityStrategistIsExistQuery = "Select cspv.id as communityPrefId from communityStrategistPreferenceValue cspv where cspv.isDeleted = 0 And cspv.preferenceValueId = ?";

        firmConnection.query(communityStrategistIsExistQuery, [preferenceValueId], function(err, rows, fields) {
            if (err) {
                logger.error("Error While executing  communityStrategistIsExistQuery : " + communityStrategistIsExistQuery + " (PreferencesDao.prototype.updateCommunityStrategist()) : \n" + err);
                return cb(err, rows);
            } else {

                if (rows.length > 0 && rows[0].communityPrefId != null && rows[0].communityPrefId != undefined) {
                    var communityPreferenceValueId = rows[0].communityPrefId;

                    //delete existing strategist and communityModels
                    self.deleteStrategist(data, communityPreferenceValueId, function(err, status) {
                        if (err) {
                            logger.error("Error While executing  deleteStrategist :  (PreferencesDao.prototype.updateCommunityStrategist()) : \n" + err);
                            return cb(err, status);
                        } else {
                            self.updateExistingStrategists(data, preferenceValueId, communityPreferenceValueId, strategistPreferenceToSvae, function(err, updateResponse) {

                                if (err) {
                                    logger.error("Error While executing  updateExistingStrategists() \n" + err);
                                    return cb(err, updateResponse);
                                } else {
                                    data.preferencesFetchCriteria.preferenceValueId = preferenceValueId;
                                    self.getCommunityStrategistSetting(data, function(err, communityStrategistUpdated) {
                                        if (err) {
                                            logger.error("Error While getting updated strategist  (PreferencesDao.prototype.updateCommunityStrategist()) : \n" + err);
                                            return cb(err, communityStrategistUpdated);
                                        } else {
                                            return cb(err, communityStrategistUpdated);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {

                    //if empty data send strategist or null object then spft delete
                    if (strategistPreferenceToSvae.strategistIds == undefined || strategistPreferenceToSvae.strategistIds.length <= 0) {
                        logger.debug("Community Model and Strategist inserted successfully.");
                        data.preferencesFetchCriteria.preferenceValueId = preferenceValueId;
                        self.getCommunityStrategistSetting(data, function(err, communityStrategistUpdated) {
                            if (err) {
                                logger.error("Error While getting updated strategist  (PreferencesDao.prototype.updateCommunityStrategist()) : \n" + err);
                                return cb(err, communityStrategistUpdated);
                            } else {
                                return cb(err, communityStrategistUpdated);
                            }
                        });
                    } else {
                        self.insertNewCommunityStrategist(data, preferenceValueId, strategistPreferenceToSvae, function(err, insertStatus) {
                            if (err) {
                                logger.error("Error While executing  insertNewCommunityStrategist  (updateExistingStrategists()) : \n" + err);

                                return cb(err, insertStatus);
                            } else {

                                var communityPreferenceValueId = insertStatus.insertId;
                                var strategistObj = strategistPreferenceToSvae;
                                if (communityPreferenceValueId == undefined || communityPreferenceValueId == null) {
                                    logger.error("Unable to insertNewCommunityStrategist  (updateExistingStrategists())");

                                    return cb(err, insertStatus);
                                }

                                self.insertCommunityStrategist(data, communityPreferenceValueId, strategistObj, function(err, status) {
                                    if (err) {
                                        logger.error("Error While executing  insertCommunityStrategist  (updateExistingStrategists()) : \n" + err);

                                        return cb(err, status);
                                    } else {
                                        self.insertCommunityModels(data, communityPreferenceValueId, strategistObj, function(err, status) {
                                            if (err) {
                                                logger.error("Error While executing  insertCommunityStrategist  (updateExistingStrategists()) : \n" + err);

                                                return cb(err, status);
                                            } else {
                                                logger.debug("Community Model and Strategist inserted successfully.");
                                                data.preferencesFetchCriteria.preferenceValueId = preferenceValueId;
                                                self.getCommunityStrategistSetting(data, function(err, communityStrategistUpdated) {
                                                    if (err) {
                                                        logger.error("Error While getting updated strategist  (PreferencesDao.prototype.updateCommunityStrategist()) : \n" + err);
                                                        return cb(err, communityStrategistUpdated);
                                                    } else {
                                                        return cb(err, communityStrategistUpdated);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    } else {
        var preferenceObj = {
            preferenceId: pref.preferenceId,
            value: null,
            recordId: data.preferenceUpdateCriteria.recordId,
            levelBitValue: data.preferenceUpdateCriteria.levelBitValue
        }
        self.insertPreferenceNewValue(data, preferenceObj, false, function(err, insertStatus) {
            if (err) {
                logger.error("Error While executing  insertPreferenceNewValue  (insertPreferenceNewValue()) : \n" + err);

                return cb(err, insertStatus);
            } else {

                if (insertStatus == undefined || insertStatus == null) {
                    logger.error("unable to insert preference value insertPreferenceNewValue  (insertPreferenceNewValue())");

                    return cb(err, insertStatus);
                }

                var insertedPrefernceId = insertStatus.insertId;

                //if empty data send strategist or null object then spft delete
                if (strategistPreferenceToSvae.strategistIds == undefined || strategistPreferenceToSvae.strategistIds.length <= 0) {
                    logger.debug("Community Model and Strategist inserted successfully.");
                    data.preferencesFetchCriteria.preferenceValueId = insertedPrefernceId;
                    self.getCommunityStrategistSetting(data, function(err, communityStrategistUpdated) {
                        if (err) {
                            logger.error("Error While getting updated strategist  (PreferencesDao.prototype.updateCommunityStrategist()) : \n" + err);
                            return cb(err, communityStrategistUpdated);
                        } else {
                            return cb(err, communityStrategistUpdated);
                        }
                    });
                } else {
                    self.insertNewCommunityStrategist(data, insertedPrefernceId, strategistPreferenceToSvae, function(err, insertStatus) {
                        if (err) {
                            logger.error("Error While executing  insertNewCommunityStrategist  (updateExistingStrategists()) : \n" + err);

                            return cb(err, insertStatus);
                        } else {

                            var communityPreferenceValueId = insertStatus.insertId;
                            var strategistObj = strategistPreferenceToSvae;
                            if (communityPreferenceValueId == undefined || communityPreferenceValueId == null) {
                                logger.error("Unable to insertNewCommunityStrategist  (updateExistingStrategists())");

                                return cb(err, insertStatus);
                            }

                            self.insertCommunityStrategist(data, communityPreferenceValueId, strategistObj, function(err, status) {
                                if (err) {
                                    logger.error("Error While executing  insertCommunityStrategist  (updateExistingStrategists()) : \n" + err);

                                    return cb(err, status);
                                } else {
                                    self.insertCommunityModels(data, communityPreferenceValueId, strategistObj, function(err, status) {
                                        if (err) {
                                            logger.error("Error While executing  insertCommunityStrategist  (updateExistingStrategists()) : \n" + err);

                                            return cb(err, status);
                                        } else {
                                            logger.error("Community Model and Strategist inserted successfully.");
                                            data.preferencesFetchCriteria.preferenceValueId = insertedPrefernceId;
                                            self.getCommunityStrategistSetting(data, function(err, communityStrategistUpdated) {
                                                if (err) {
                                                    logger.error("Error While getting updated strategist  (PreferencesDao.prototype.updateCommunityStrategist()) : \n" + err);
                                                    return cb(err, communityStrategistUpdated);
                                                } else {
                                                    return cb(err, communityStrategistUpdated);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }


            }
        });
    }
};


PreferencesDao.prototype.deleteStrategist = function(data, communityStrategistValueId, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    //if already exist
    var communityStrategistDeleteQuery = "Delete from communityStrategistModel where communityStrategistPreferenceId = ?";
    var communityStrategistModelDeleteQuery = "Delete from communityStrategistValue where communityStrategistPreferenceId = ?"

    firmConnection.query(communityStrategistDeleteQuery, [communityStrategistValueId], function(err, status) {
        if (err) {
            logger.error("Error While executing  communityStrategistDeleteQuery : " + communityStrategistDeleteQuery + " (PreferencesDao.prototype.deleteStrategist()) : \n" + err);
            return cb(err, status);
        } else {
            firmConnection.query(communityStrategistModelDeleteQuery, [communityStrategistValueId], function(err, status) {
                if (err) {
                    logger.error("Error While executing  communityStrategistModelDeleteQuery : " + communityStrategistModelDeleteQuery + " (PreferencesDao.prototype.deleteStrategist()) : \n" + err);
                    return cb(err, status);
                } else {
                    return cb(err, status);
                }
            });
        }
    });
};

PreferencesDao.prototype.updateExistingStrategists = function(data, preferenceValueId, communityPreferenceValueId, strategistObj, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);
    var preference = {
        id: preferenceValueId,
        value: null
    }
    self.updatePreferenceValue(data, preferenceValueId, preference, false, function(err, response) {
        if (err) {
            logger.error("Error while updating prefernce existing  value   (updateExistingStrategists()) : \n" + err);
            return cb(err, response);
        } else {

            if (response.affectedRows > 0) {

                var valuesToUpdate = null;
                var updateStrategistQuery = null

                //if empty data send strategist or null object then spft delete
                if (strategistObj.strategistIds != undefined && strategistObj.strategistIds.length > 0) {
                    valuesToUpdate = {
                        id: communityPreferenceValueId,
                        value: strategistObj.modelAccessLevel,
                        editedBy: utilService.getAuditUserId(data.user),
                        editedDate: systemDataTime,
                        isDeleted: 0
                    };
                    updateStrategistQuery = 'UPDATE communityStrategistPreferenceValue SET modelAccessLevel = ' + valuesToUpdate.value + ', editedBy =?, editedDate =?, isDeleted = ? WHERE id =?';

                } else {
                    valuesToUpdate = {
                        id: communityPreferenceValueId,
                        value: strategistObj.modelAccessLevel,
                        editedBy: utilService.getAuditUserId(data.user),
                        editedDate: systemDataTime,
                        isDeleted: 1
                    };
                    updateStrategistQuery = 'UPDATE communityStrategistPreferenceValue SET editedBy =?, editedDate =?, isDeleted = ? WHERE id =?';
                }




                firmConnection.query(updateStrategistQuery, [valuesToUpdate.editedBy, valuesToUpdate.editedDate, valuesToUpdate.isDeleted,
                    valuesToUpdate.id
                ], function(err, result) {
                    if (err) {
                        logger.error("Error While executing  updateStrategistQuery : " + updateStrategistQuery + " (updateExistingStrategists()) : \n" + err);

                        return cb(err, result);
                    } else {
                        logger.info("Query updateStrategistQuery :  " + updateStrategistQuery + " executed (updateExistingStrategists()).");

                        if (result.affectedRows > 0) {

                            if (strategistObj.strategistIds == undefined || strategistObj.strategistIds.length <= 0) {
                                logger.debug("Community Strategist updated successfully.");
                                return cb(err, result);
                            }

                            self.insertCommunityStrategist(data, communityPreferenceValueId, strategistObj, function(err, status) {
                                if (err) {
                                    logger.error("Error While executing  insertCommunityStrategist  (updateExistingStrategists()) : \n" + err);

                                    return cb(err, status);
                                } else {
                                    self.insertCommunityModels(data, communityPreferenceValueId, strategistObj, function(err, status) {
                                        if (err) {
                                            logger.error("Error While executing  insertCommunityStrategist  (updateExistingStrategists()) : \n" + err);

                                            return cb(err, status);
                                        } else {
                                            logger.error("Community Model and Strategist inserted successfully.");
                                            return cb(err, status);
                                        }
                                    });
                                }
                            });
                        } else {
                            logger.error("Unable to update community strategist value (updateExistingStrategists())");
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                    }
                });

            } else {
                logger.error("Unable to update preference  value (updateExistingStrategists())");
                return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
            }


        }
    });
};

PreferencesDao.prototype.insertNewCommunityStrategist = function(data, preferenceValueId, strategistObj, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);

    var preferenceObj = {
        id: null,
        modelAccessLevel: strategistObj.modelAccessLevel,
        preferenceValueId: preferenceValueId,
        isDeleted: 0,
        createdBy: utilService.getAuditUserId(data.user),
        editedBy: utilService.getAuditUserId(data.user),
        createdDate: systemDataTime,
        editedDate: systemDataTime
    };

    var insertStrategistPreferenceValue = "Insert into communityStrategistPreferenceValue (preferenceValueId, modelAccessLevel," +
        " isDeleted, createdBy, editedBy, createdDate, editedDate) VALUES  ('" + preferenceObj.preferenceValueId + "'" +
        ", '" + preferenceObj.modelAccessLevel + "'" + ", '" + preferenceObj.isDeleted + "'" + ", '" + preferenceObj.createdBy + "', '" + preferenceObj.editedBy + "', '" +
        preferenceObj.createdDate + "', '" + preferenceObj.editedDate + "')";

    firmConnection.query(insertStrategistPreferenceValue, function(err, status) {
        if (err) {
            logger.error("Error While executing  insertStrategistPreferenceValue : " + insertStrategistPreferenceValue + " (insertNewCommunityStrategist()) for " + JSON.stringify(preferenceObj) + " : \n" + err);
            return cb(err, status);
        } else {
            return cb(err, status);
        }
    });
};

PreferencesDao.prototype.insertCommunityModels = function(data, communityStrategistPreferenceId, strategistObj, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);

    var communityModels = strategistObj.communityModels;
    var len = communityModels.length;

    if (len <= 0) {
        return cb(null, true);
    }

    for (var i = 0; i < len; i++) {

        var preferenceObj = {
            id: null,
            communityStrategistPreferenceId: communityStrategistPreferenceId,
            modelId: communityModels[i],
            isDeleted: 0,
            createdBy: utilService.getAuditUserId(data.user),
            editedBy: utilService.getAuditUserId(data.user),
            createdDate: systemDataTime,
            editedDate: systemDataTime
        };

        var communityModelInsertQuery = "Insert into communityStrategistModel (communityStrategistPreferenceId, modelId," +
            " isDeleted, createdBy, editedBy, createdDate, editedDate) VALUES  ('" + preferenceObj.communityStrategistPreferenceId + "'" +
            ", '" + preferenceObj.modelId + "'" + ", '" + preferenceObj.isDeleted + "'" + ", '" + preferenceObj.createdBy + "', '" + preferenceObj.editedBy + "', '" +
            preferenceObj.createdDate + "', '" + preferenceObj.editedDate + "')";

        firmConnection.query(communityModelInsertQuery, function(err, status) {
            if (err) {
                logger.error("Error While executing  communityModelInsertQuery : " + communityModelInsertQuery + " (insertCommunityModels()) for " + JSON.stringify(preferenceObj) + " : \n" + err);

                len--;
                if (len <= 0) {
                    return cb(err, status);
                }
            } else {

                len--;
                if (len <= 0) {
                    return cb(err, status);
                }
            }
        });
    }
};

PreferencesDao.prototype.insertCommunityStrategist = function(data, communityStrategistPreferenceId, strategistObj, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);

    var strategistIds = strategistObj.strategistIds;
    var len = strategistIds.length;

    for (var i = 0; i < len; i++) {

        var preferenceObj = {
            id: null,
            communityStrategistPreferenceId: communityStrategistPreferenceId,
            strategistId: strategistIds[i],
            isDeleted: 0,
            createdBy: utilService.getAuditUserId(data.user),
            editedBy: utilService.getAuditUserId(data.user),
            createdDate: systemDataTime,
            editedDate: systemDataTime
        };

        var strategistInsertQuery = "Insert into communityStrategistValue (communityStrategistPreferenceId, strategistId," +
            " isDeleted, createdBy, editedBy, createdDate, editedDate) VALUES  ('" + preferenceObj.communityStrategistPreferenceId + "'" +
            ", '" + preferenceObj.strategistId + "'" + ", '" + preferenceObj.isDeleted + "'" + ", '" + preferenceObj.createdBy + "', '" + preferenceObj.editedBy + "', '" +
            preferenceObj.createdDate + "', '" + preferenceObj.editedDate + "')";

        firmConnection.query(strategistInsertQuery, function(err, status) {
            if (err) {
                logger.error("Error While executing  strategistInsertQuery : " + strategistInsertQuery + " (insertCommunityStrategist()) for " + JSON.stringify(preferenceObj) + " : \n" + err);

                len--;
                if (len <= 0) {
                    return cb(err, status);
                }
            } else {

                len--;
                if (len <= 0) {
                    return cb(err, status);
                }
            }
        });
    }
};

PreferencesDao.prototype.updateLocationOptimization = function(data, preferenceValueId, pref, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var locationOptimizationPreferenceToSvae = pref.subClasses;
    data.preferencesFetchCriteria.locationOptimizationPreferenceId = pref.preferenceId;

    var preferenceObj = {
        preferenceId: pref.preferenceId,
        value: null,
        recordId: data.preferenceUpdateCriteria.recordId,
        levelBitValue: data.preferenceUpdateCriteria.levelBitValue
    }


    if (preferenceValueId != null) {

        var preference = {
            id: preferenceValueId,
            value: null
        }
        self.updatePreferenceValue(data, preferenceValueId, preference, false, function(err, response) {
            if (err) {
                logger.error("Error while updating prefernce existing  value   (updateExistingStrategists()) : \n" + err);
                return cb(err, response);
            } else {

                self.updateExistingLocationSetting(data, preferenceValueId, locationOptimizationPreferenceToSvae, function(err, updateStatus) {
                    if (err) {
                        logger.error("Error while executing updateExistingLocationSetting  (Updated Insert) (updateExistingStrategists()) : \n" + err);
                        return cb(err, updateStatus);
                    } else {
                        logger.debug("Location Optimization Settings Updated Successfully (Updated Insert).");

                        //                                    data.preferencesFetchCriteria.recordId = preferenceObj.recordId;
                        //                                    data.preferencesFetchCriteria.levelBitValue = preferenceObj.levelBitValue; 
                        data.preferencesFetchCriteria.locationPreferenceId = data.preferencesFetchCriteria.locationSettingPreferenceId;
                        data.preferencesFetchCriteria.preferenceValueId = preferenceValueId;
                        self.getLocationOptimizationSetting(data, function(err, updatedPreference) {
                            if (err) {
                                logger.error("Error while executing getLocationOptimizationSetting  (Updated Insert) (updateExistingStrategists()) : \n" + err);
                                return cb(err, updatedPreference);
                            }

                            return cb(err, updatedPreference);
                        });

                    }
                });

            }
        });
    } else {
        var preferenceObj = {
            preferenceId: pref.preferenceId,
            value: null,
            recordId: data.preferenceUpdateCriteria.recordId,
            levelBitValue: data.preferenceUpdateCriteria.levelBitValue
        }
        self.insertPreferenceNewValue(data, preferenceObj, false, function(err, insertStatus) {
            if (err) {
                logger.error("Error While executing  insertPreferenceNewValue  (insertPreferenceNewValue()) : \n" + err);

                return cb(err, insertStatus);
            } else {

                if (insertStatus == undefined || insertStatus == null) {
                    logger.error("unable to insert preference value insertPreferenceNewValue  (insertPreferenceNewValue())");

                    return cb(err, insertStatus);
                }

                var insertedPrefernceId = insertStatus.insertId;
                self.updateExistingLocationSetting(data, insertedPrefernceId, locationOptimizationPreferenceToSvae, function(err, updateStatus) {
                    if (err) {
                        logger.error("Error while executing updateExistingLocationSetting  (Freash Insert) (updateExistingStrategists()) : \n" + err);
                        return cb(err, updateStatus);
                    } else {
                        logger.debug("Location Optimization Settings Updated Successfully (Freash Insert).");

                        data.preferencesFetchCriteria.recordId = preferenceObj.recordId;
                        data.preferencesFetchCriteria.levelBitValue = preferenceObj.levelBitValue;
                        data.preferencesFetchCriteria.locationPreferenceId = preferenceObj.preferenceId;
                        data.preferencesFetchCriteria.preferenceValueId = insertedPrefernceId;
                        self.getLocationOptimizationSetting(data, function(err, updatedPreference) {
                            if (err) {
                                logger.error("Error while executing getLocationOptimizationSetting  (Updated Insert) (updateExistingStrategists()) : \n" + err);
                                return cb(err, updatedPreference);
                            }

                            return cb(err, updatedPreference);
                        });
                    }
                });

            }
        });
    }
};

PreferencesDao.prototype.updateExistingLocationSetting = function(data, preferenceValueId, locationSettingObj, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);

    self.deleteExistingLocationSetting(data, preferenceValueId, function(err, deleteStatus) {
        if (err) {
            logger.error("Error While executing  deleteExistingLocationSetting  (updateExistingLocationSetting()) : \n" + err);

            return cb(err, deleteStatus);
        } else {

            if (locationSettingObj.length <= 0) {
                logger.debug("LocationSettings updated successfully.");
                return cb(err, deleteStatus);
            } else {
                self.insertUpdateLocationSetting1(data, preferenceValueId, locationSettingObj, function(err, insertStatus) {
                    if (err) {
                        logger.error("Error While executing  insertUpdateLocationSetting  (updateExistingLocationSetting()) : \n" + err);

                        return cb(err, insertStatus);
                    } else {
                        return cb(err, insertStatus);
                    }
                });
            }
        }
    })
};

PreferencesDao.prototype.deleteExistingLocationSetting = function(data, preferenceValueId, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);

    var locationSettingToDelete = {
        preferenceValueId: preferenceValueId,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: systemDataTime,
        isDeleted: 1
    };

    var deleteAllStrategistQuery = 'UPDATE locationOptimizationPreferenceValue SET editedBy =?, editedDate =?, isDeleted = ? WHERE preferenceValueId =?';

    firmConnection.query(deleteAllStrategistQuery, [locationSettingToDelete.editedBy, locationSettingToDelete.editedDate, locationSettingToDelete.isDeleted, locationSettingToDelete.preferenceValueId], function(err, result) {
        if (err) {
            logger.error("Error While executing  deleteAllStrategistQuery : " + deleteAllStrategistQuery + " (updateExistingStrategists()) : \n" + err);

            return cb(err, result);
        } else {
            return cb(err, result);
        }
    });
};

PreferencesDao.prototype.insertUpdateLocationSetting1 = function(data, preferenceValueId, locationSettingObj, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);

    var len = locationSettingObj.length;

    for (var i = 0; i < len; i++) {
        var currentSubClass = locationSettingObj[i];


        self.insertLocationOptimizationSubClass(data, preferenceValueId, currentSubClass, function(err, insertStatus) {
            if (err) {
                logger.error("Error While executing  insertStatus in (insertUpdateLocationSetting()) : \n" + err);

                return cb(err, insertStatus);
            } else {

                len--;
                if (len <= 0) {
                    return cb(err, insertStatus);
                }
            }
        });

    }
};

PreferencesDao.prototype.insertLocationOptimizationSubClass = function(data, preferenceValueId, locationSettingObj, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);
    var currentSubClass = locationSettingObj;
    var subClassId = currentSubClass.id;

    var subClassExistQuery = 'Select lopv.id from locationOptimizationPreferenceValue lopv where lopv.preferenceValueId = ? And lopv.subClassId = ? And lopv.isDeleted = 0';

    firmConnection.query(subClassExistQuery, [preferenceValueId, subClassId], function(err, subClassStatus) {
        if (err) {
            logger.error("Error While executing  subClassExistQuery : " + subClassExistQuery + " (insertUpdateLocationSetting()) : \n" + err);

            return cb(err, subClassStatus);
        } else {

            //if subClass exist
            if (subClassStatus.length > 0) {
                var id = subClassStatus[0].id;
                var updateSubClassValues = {
                    id: id,
                    editedBy: utilService.getAuditUserId(data.user),
                    editedDate: systemDataTime,
                    isDeleted: 0
                };

                var updateSubClassQuesy = 'UPDATE locationOptimizationPreferenceValue SET editedBy =?, editedDate =?, isDeleted = ? WHERE id =?';

                firmConnection.query(updateSubClassQuesy, [updateSubClassValues.editedBy, updateSubClassValues.editedDate, updateSubClassValues.isDeleted, updateSubClassValues.id], function(err, result) {
                    if (err) {
                        logger.error("Error While executing  updateSubClassQuesy : " + updateSubClassQuesy + " (insertUpdateLocationSetting()) : \n" + err);

                        return cb(err, result);
                    } else {

                        self.deleteExistingLocationPreferences(data, id, function(err, prefeecneDeleteStatus) {
                            if (err) {
                                logger.error("Error While executing  deleteExistingLocationPreferences in (insertUpdateLocationSetting()) : \n" + err);

                                return cb(err, prefeecneDeleteStatus);
                            } else {
                                self.insertUpdateLocationSetting(data, id, currentSubClass, function(err, preferenceInsertStatus) {
                                    if (err) {
                                        logger.error("Error While executing  insertUpdateLocationSetting in (insertUpdateLocationSetting()) : \n" + err);

                                        return cb(err, preferenceInsertStatus);
                                    } else {
                                        return cb(err, preferenceInsertStatus);
                                    }
                                });
                            }
                        });
                    }
                });

            } else {

                var insertSubClassValues = {
                    preferenceId: preferenceValueId,
                    subClassId: subClassId,
                    isDeleted: 0,
                    createdBy: utilService.getAuditUserId(data.user),
                    editedBy: utilService.getAuditUserId(data.user),
                    createdDate: systemDataTime,
                    editedDate: systemDataTime
                };

                var insertSubClassValuesQuery = "Insert into locationOptimizationPreferenceValue (preferenceValueId, subClassId," +
                    " isDeleted, createdBy, editedBy, createdDate, editedDate) VALUES  ('" + insertSubClassValues.preferenceId + "'" +
                    ", '" + insertSubClassValues.subClassId + "'" + ", '" + insertSubClassValues.isDeleted + "'" + ", '" + insertSubClassValues.createdBy + "', '" + insertSubClassValues.editedBy + "', '" +
                    insertSubClassValues.createdDate + "', '" + insertSubClassValues.editedDate + "')";

                firmConnection.query(insertSubClassValuesQuery, function(err, insertStatus) {
                    if (err) {
                        logger.error("Error While executing  insertSubClassValuesQuery : " + insertSubClassValuesQuery + " (insertUpdateLocationSetting()) for " + JSON.stringify(insertSubClassValues) + " : \n" + err);
                        return cb(err, insertStatus);
                    } else {
                        var insertedId = insertStatus.insertId;
                        if (insertedId != undefined && insertedId != null) {

                            self.insertUpdateLocationSetting(data, insertedId, currentSubClass, function(err, preferenceInsertStatus) {
                                if (err) {
                                    logger.error("Error While executing  insertUpdateLocationSetting in (insertUpdateLocationSetting()) : \n" + err);

                                    return cb(err, preferenceInsertStatus);
                                } else {
                                    return cb(err, preferenceInsertStatus);
                                }
                            });

                        } else {
                            logger.error("unable to insertSubClassValuesQuery  (insertUpdateLocationSetting()) for " + JSON.stringify(insertSubClassValues) + "");
                            return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
                        }
                    }
                });
            }

        }
    });
}

PreferencesDao.prototype.deleteExistingLocationPreferences = function(data, locationPreferenceValueId, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);

    var deleteAllLocationPreferenceQuery = 'Delete from locationOptimizationValue where locationPreferenceValueId = ?';

    firmConnection.query(deleteAllLocationPreferenceQuery, [locationPreferenceValueId], function(err, result) {
        if (err) {
            logger.error("Error While executing  deleteAllLocationPreferenceQuery : " + deleteAllLocationPreferenceQuery + " (deleteExistingLocationPreferences()) : \n" + err);

            return cb(err, result);
        } else {
            return cb(err, result);
        }
    });
};

PreferencesDao.prototype.insertUpdateLocationSetting = function(data, locationOptimizationPreferenceValueId, subClass, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);



    var valuesToInsert = [];

    var buySubclassSetting = subClass.buySetting;
    var sellSubClassSetting = subClass.sellSetting;

    var locationSettingEnum = localCache.get(LOCATION_SETTING);

    if (locationSettingEnum != null) {
        Object.keys(buySubclassSetting).forEach(function(key) {
            var CodeId = self.getLocationPreferenceId('Buy', key);

            if (CodeId != null) {
                var locationPreference = [];
                locationPreference.push(locationOptimizationPreferenceValueId);
                locationPreference.push(CodeId);
                locationPreference.push(buySubclassSetting[key]);
                locationPreference.push(0)
                locationPreference.push(utilService.getAuditUserId(data.user));
                locationPreference.push(utilService.getAuditUserId(data.user));
                locationPreference.push(systemDataTime);
                locationPreference.push(systemDataTime);
                valuesToInsert.push(locationPreference);
            }
        });
        Object.keys(sellSubClassSetting).forEach(function(key) {
            var CodeId = self.getLocationPreferenceId('Sell', key);

            if (CodeId != null) {
                var locationPreference = [];
                locationPreference.push(locationOptimizationPreferenceValueId);
                locationPreference.push(CodeId);
                locationPreference.push(sellSubClassSetting[key]);
                locationPreference.push(0)
                locationPreference.push(utilService.getAuditUserId(data.user));
                locationPreference.push(utilService.getAuditUserId(data.user));
                locationPreference.push(systemDataTime);
                locationPreference.push(systemDataTime);
                valuesToInsert.push(locationPreference);
            }
        });

        var insertLocationPreferenceValuesQuery = "Insert into locationOptimizationValue (locationPreferenceValueId, locationPreferenceId, value, " +
            " isDeleted, createdBy, editedBy, createdDate, editedDate) VALUES ?";

        firmConnection.query(insertLocationPreferenceValuesQuery, [valuesToInsert], function(err, insertStatus) {
            if (err) {
                logger.error("Error While executing  insertLocationPreferenceValuesQuery : " + insertLocationPreferenceValuesQuery + " (insertUpdateLocationSetting()) for " + JSON.stringify(insertSubClassValues) + " : \n" + err);
                return cb(err, insertStatus);
            } else {
                return cb(err, insertStatus);
            }
        });

    } else {
        self.getLocationSettingsMaster(data, function(err, locationSettings) {
            if (err) {
                logger.error("Error while executing getLocationSettingsMaster in PreferencesDao.prototype.insertUpdateLocationSetting(). \n Error :" + err);
                return cb(err, locationSettings);
            } else {
                localCache.put(LOCATION_SETTING, locationSettings);

                Object.keys(buySubclassSetting).forEach(function(key) {
                    var CodeId = self.getLocationPreferenceId('Buy', key);

                    if (CodeId != null) {
                        var locationPreference = [];
                        locationPreference.push(locationOptimizationPreferenceValueId);
                        locationPreference.push(CodeId);
                        locationPreference.push(buySubclassSetting[key]);
                        locationPreference.push(0)
                        locationPreference.push(utilService.getAuditUserId(data.user));
                        locationPreference.push(utilService.getAuditUserId(data.user));
                        locationPreference.push(systemDataTime);
                        locationPreference.push(systemDataTime);
                        valuesToInsert.push(locationPreference);
                    }
                });
                Object.keys(sellSubClassSetting).forEach(function(key) {
                    var CodeId = self.getLocationPreferenceId('Sell', key);

                    if (CodeId != null) {
                        var locationPreference = [];
                        locationPreference.push(locationOptimizationPreferenceValueId);
                        locationPreference.push(CodeId);
                        locationPreference.push(sellSubClassSetting[key]);
                        locationPreference.push(0)
                        locationPreference.push(utilService.getAuditUserId(data.user));
                        locationPreference.push(utilService.getAuditUserId(data.user));
                        locationPreference.push(systemDataTime);
                        locationPreference.push(systemDataTime);
                        valuesToInsert.push(locationPreference);
                    }
                });

                var insertLocationPreferenceValuesQuery = "Insert into locationOptimizationValue (locationPreferenceValueId, locationPreferenceId, value, " +
                    " isDeleted, createdBy, editedBy, createdDate, editedDate) VALUES ?";

                firmConnection.query(insertLocationPreferenceValuesQuery, [valuesToInsert], function(err, insertStatus) {
                    if (err) {
                        logger.error("Error While executing  insertLocationPreferenceValuesQuery : " + insertLocationPreferenceValuesQuery + " (insertUpdateLocationSetting()) for " + JSON.stringify(insertStatus) + " : \n" + err);
                        return cb(err, insertStatus);
                    } else {
                        return cb(err, insertStatus);
                    }
                });
            }
        });
    }
};

PreferencesDao.prototype.getLocationPreferenceId = function(group, code) {
    var self = this;
    var locationSettingEnum = localCache.get(LOCATION_SETTING);


    var locationId = null;
    locationSettingEnum.forEach(function(locationPreference) {

        if (locationPreference.group.toLowerCase() == group.toLowerCase() && locationPreference.code.toLowerCase() == code.toLowerCase()) {
            locationId = locationPreference.id;
        }

    });

    return locationId;
};

PreferencesDao.prototype.getLocationSettingsMaster = function(data, cb) {
    var firmConnection = baseDao.getConnection(data);
    var query = "Select * from locationOptimizationPreferences lop";

    firmConnection.query(query, function(err, rows, fields) {
        if (err) {
            logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.getLocationSettingsMaster(). \n Error :" + err);
            return cb(err, rows);
        } else {
            logger.info("Successfully executed Query : " + query + " in PreferencesDao.prototype.getLocationSettingsMaster().");
            localCache.put(LOCATION_SETTING, rows);
            return cb(err, rows);
        }
    });
};


PreferencesDao.prototype.saveOrUpdatePreferences = function(data, recordId, cb) {
    var self = this;

    var firmConnection = null;
    try {
        firmConnection = baseDao.getConnection(data);
    } catch (e) {
        logger.error("Datavase connection error.  PreferencesDao.prototype.saveOrUpdatePreferences() " + e);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }

    var responseList = [];
    var len = data.preferences.length;

    var preferenceLocalObj = JSON.parse(JSON.stringify(data.preferences));

    for (var i = 0; i < len; i++) {
        preferenceLocalObj[i].levelBitValue = data.preferenceUpdateCriteria.levelBitValue;
        preferenceLocalObj[i].recordId = recordId;
    }

    preferenceLocalObj.forEach(function(preference) {

        if (preference.id == null) {
            preference.id = '-1';
        }

        var findExistingValueQuery = "Select * from preferenceValue where preferenceId = '" + preference.preferenceId + "' AND relatedType = '" + preference.levelBitValue +
            "' AND relatedTypeId = '" + preference.recordId + "'";

        firmConnection.query(findExistingValueQuery, function(err, rows, fields) { // 1st to check if exist 

            var todayDate = new Date();

            if (err) {
                logger.error("Error While executing  findExistingValueQuery : " + findExistingValueQuery + " (saveOrUpdatePreferences()) : \n" + err);
                return cb(err, responseList);

            } else {
                logger.info("Query findExistingValueQuery :  " + findExistingValueQuery + " executed (saveOrUpdatePreferences()).");

                if (rows.length > 0) {

                    var preferenceValueId = rows[0].id;
                    preference.id = preferenceValueId; // just in case if new preference inserted more than one time (means same Object without generated unique id



                    if (preference.valueType.toLowerCase() === (constants.prefrenceValueType.OPTION_LIST).toLowerCase() || preference.valueType.toLowerCase() === (constants.prefrenceValueType.LIST).toLowerCase()) {
                        self.updatePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                            if (err) {
                                logger.error("Error while updating prefernce existing non optional value   : \n" + err);
                                return cb(err, responseList);
                            } else {

                                if (response != undefined && response != null) {
                                    self.updatePreferenceOptionValue(data, preferenceValueId, preference, function(err, response) {
                                        if (err) {
                                            logger.error("Error while updating prefernce option value   : \n" + err);
                                            return cb(err, responseList);
                                        } else {

                                            if (response != undefined && response != null) {
                                                responseList.push(response);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            } else {
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                } else {
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            }
                        });

                    } else { // to update existing non optional value
                        self.updatePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                            if (err) {
                                logger.error("Error while updating prefernce existing non optional value   : \n" + err);
                                return cb(err, responseList);
                            } else {

                                if (response != undefined && response != null) {
                                    responseList.push(response);
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                } else {
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }

                } else {

                    if (preference.valueType.toLowerCase() === (constants.prefrenceValueType.OPTION_LIST).toLowerCase() || preference.valueType.toLowerCase() === (constants.prefrenceValueType.LIST).toLowerCase()) {
                        self.updatePreferenceOptionValue(data, null, preference, function(err, response) {
                            if (err) {
                                logger.error("Error while updating prefernce option value   : \n" + err);
                                return cb(err, responseList);
                            } else {

                                if (response != undefined && response != null) {
                                    responseList.push(response);
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                } else {
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            }
                        });

                    } else {
                        self.insertPreferenceNewValue(data, preference, true, function(err, response) {
                            if (err) {
                                logger.error("Error while inserting prefernce value   : \n" + err);
                                return cb(err, responseList);

                            } else {

                                if (response != undefined && response != null) {
                                    responseList.push(response);
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                } else {
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });
    });
};

PreferencesDao.prototype.updatePreferenceValue = function(data, idToUpdate, preference, returnMaster, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = null;
    var firmConnection = null;

    try {
        firmConnection = baseDao.getConnection(data);
        firmConnection = baseDao.getConnection(data);
    } catch (e) {
        logger.error("Database connection error (possible reason : connection already closed due to any condition by user.) : \n" + e);

        return;
    }

    var valueToUpdate = {
        id: preference.id,
        value: preference.value,
        indicatorValue: null,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: systemDataTime,
        isDeleted: 0
    }

    if (preference.selectedIndicatorValue != null && preference.selectedIndicatorValue != "null" && preference.selectedIndicatorValue != undefined) {
        valueToUpdate.indicatorValue = preference.selectedIndicatorValue;
    }

    var preferenceUpdateQuery = 'UPDATE preferenceValue SET value =?, indicatorValue= ?, editedBy =?, editedDate =?, isDeleted = ? WHERE id =?';

    firmConnection.query(preferenceUpdateQuery, [valueToUpdate.value, valueToUpdate.indicatorValue, valueToUpdate.editedBy, valueToUpdate.editedDate, valueToUpdate.isDeleted,
        valueToUpdate.id
    ], function(err, result) {
        if (err) {
            logger.error("Error While executing  preferenceUpdateQuery : " + preferenceUpdateQuery + " (updatePreferenceValue()) : \n" + err);

            return cb(err, result);
        } else {
            logger.info("Query preferenceUpdateQuery :  " + preferenceUpdateQuery + " executed (updatePreferenceValue()).");

            if (returnMaster == false) { // in case if preference updated object not required
                return cb(err, result);
            }

            var prefId = preference.preferenceId;

            self.getPreferenceResponseAfterUpdate(data, prefId, function(err, updatedPreferece) {
                if (err) {
                    return cb(err, updatedPreferece);
                } else {
                    return cb(err, updatedPreferece);
                }
            });
        }
    });
};

PreferencesDao.prototype.insertPreferenceNewValue = function(data, preference, returnMaster, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);

    var preferenceObj = [
        preference.preferenceId, preference.levelBitValue, preference.recordId, preference.value,
        null, 0, utilService.getAuditUserId(data.user), utilService.getAuditUserId(data.user),
        systemDataTime, systemDataTime
    ];

    if (preference.selectedIndicatorValue != null && preference.selectedIndicatorValue != "null" && preference.selectedIndicatorValue != undefined) {
        preferenceObj[4] = preference.selectedIndicatorValue;
    }

    var preferenceInsertQuery = "Insert into preferenceValue (preferenceId, relatedType, relatedTypeId," +
        " value, indicatorValue, isDeleted, createdBy, editedBy, createdDate, editedDate) VALUES  (?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

    firmConnection.query(preferenceInsertQuery, preferenceObj, function(err, result) {
        if (err) {
            logger.error("Error While executing  preferenceInsertQuery : " + preferenceInsertQuery + " (insertPreferenceNewValue()) : \n" + err);

            return cb(err, result);
        } else {
            logger.info("Query preferenceInsertQuery :  " + preferenceInsertQuery + " executed (insertPreferenceNewValue()).");

            if (returnMaster == false) { // in case if preference updated object not required
                return cb(err, result);
            }

            var prefId = preference.preferenceId;

            self.getPreferenceResponseAfterUpdate(data, prefId, function(err, updatedPreferece) {
                if (err) {
                    return cb(err, updatedPreferece);
                } else {
                    return cb(err, updatedPreferece);
                }
            });
        }
    });
};

PreferencesDao.prototype.updatePreferenceOptionValue = function(data, preferenceValueId, preference, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = baseDao.getConnection(data);

    if (preferenceValueId !== undefined && preferenceValueId !== null) {
        self.insertInOptionValue(data, preferenceValueId, preference, function(err, response) {
            if (err) {
                return cb(err, response);
            } else {
                logger.info("Query insertInOptionValue  executed (updatePreferenceOptionValue() 1).");
                var prefId = preference.preferenceId;

                self.getPreferenceResponseAfterUpdate(data, prefId, function(err, updatedPreferece) {
                    if (err) {
                        return cb(err, updatedPreferece);
                    } else {
                        return cb(err, updatedPreferece);
                    }
                });
            }
        });

    } else { // new option insert

        var preferenceObj = [
            preference.preferenceId, preference.levelBitValue, preference.recordId, preference.value,
            null, 0, utilService.getAuditUserId(data.user), utilService.getAuditUserId(data.user),
            systemDataTime, systemDataTime
        ];

        if (preference.selectedIndicatorValue != null && preference.selectedIndicatorValue != "null" && preference.selectedIndicatorValue != undefined) {
            preferenceObj[4] = preference.selectedIndicatorValue;
        }

        var preferenceInsertQuery = "Insert into preferenceValue (preferenceId, relatedType, relatedTypeId," +
            " value, indicatorValue, isDeleted, createdBy, editedBy, createdDate, editedDate) VALUES  (?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

        firmConnection.query(preferenceInsertQuery, preferenceObj, function(err, result) {
            if (err) {
                logger.error("Error While executing  preferenceInsertQuery : " + preferenceInsertQuery + " (updatePreferenceOptionValue()) : \n" + err);

                return cb(err, result);
            } else {
                logger.info("Query preferenceInsertQuery :  " + preferenceInsertQuery + " executed (updatePreferenceOptionValue()).");

                var insertedPreferenceId = result.insertId;
                self.insertInOptionValue(data, insertedPreferenceId, preference, function(err, response) {
                    if (err) {
                        return cb(err, response);
                    } else {
                        logger.info("Query insertInOptionValue  executed (updatePreferenceOptionValue() 2).");
                        var prefId = preference.preferenceId;

                        self.getPreferenceResponseAfterUpdate(data, prefId, function(err, updatedPreferece) {
                            if (err) {
                                return cb(err, updatedPreferece);
                            } else {
                                return cb(err, updatedPreferece);
                            }
                        });
                    }
                });
            }
        });
    }
};

PreferencesDao.prototype.insertInOptionValue = function(data, preferenceValueId, preference, cb) {

    var firmConnection = baseDao.getConnection(data);

    var len = preference.selectedOptions.length;
    var insertedOptions = [];

    var preferenceOptionDeleteQuery = "Delete from preferenceOptionValue where preferenceValueId = ?";

    firmConnection.query(preferenceOptionDeleteQuery, [preferenceValueId], function(err, result) { // insert in preferenceValue table
        if (err) {
            logger.error("Error While executing  preferenceOptionDeleteQuery : " + preferenceOptionDeleteQuery + " (insertInOptionValue()) : \n" + err);

            return cb(err, result);
        } else {
            logger.info("Query preferenceOptionDeleteQuery :  " + preferenceOptionDeleteQuery + " executed (insertInOptionValue()).");

            if (len > 0) {
                preference.selectedOptions.forEach(function(option) {
                    var optionValueObj = {
                        id: null,
                        preferenceValueId: preferenceValueId,
                        preferenceOptionId: option.id,
                        order: (option.order == undefined || option.order == null ? 0 : (option.order))
                    };


                    var preferenceOptionInsertQuery = "Insert into preferenceOptionValue (preferenceValueId, preferenceOptionId, prefOrder) VALUES  ('" + optionValueObj.preferenceValueId +
                        "', '" + optionValueObj.preferenceOptionId + "', '" + optionValueObj.order + "')";

                    firmConnection.query(preferenceOptionInsertQuery, function(err, result) { // insert in preferenceValue table
                        if (err) {
                            logger.error("Error While executing  preferenceOptionInsertQuery : " + preferenceOptionInsertQuery + " (insertInOptionValue()) : \n" + err);

                            return cb(err, insertedOptions);
                        } else {
                            logger.info("Query preferenceOptionInsertQuery :  " + preferenceOptionInsertQuery + " executed (insertInOptionValue()).");

                            insertedOptions.push(result.insertId);
                            len--;
                            if (len <= 0) {
                                return cb(err, insertedOptions);
                            }
                        }
                    });
                });
            } else {
                return cb(null, insertedOptions);
            }
        }
    });
};

PreferencesDao.prototype.getPreferenceWithOptionsById = function(data, insertedPreferenceId, cb) {

    var firmConnection = baseDao.getConnection(data);
    var firmConnection = baseDao.getConnection(data);

    var selectPreferenceQuery = "Select id, preferenceId, relatedType, relatedTypeId, value from preferenceValue where id = ?";
    firmConnection.query(selectPreferenceQuery, [insertedPreferenceId], function(err, preferences) {
        if (err) {
            logger.error("Error While executing  selectPreferenceQuery : " + selectPreferenceQuery + " (getPreferenceWithOptionsById()) : \n" + err);

            cb(err, preferences);
        } else {

            if (preferences.length > 0) {
                logger.info("Query selectPreferenceQuery :  " + selectPreferenceQuery + " executed (getPreferenceWithOptionsById()).");
                var selectPreferenceOptionsQuery = "Select preferenceOptionId, prefOrder from preferenceOptionValue where preferenceValueId = ? ORDER BY prefOrder";
                firmConnection.query(selectPreferenceOptionsQuery, [insertedPreferenceId], function(err, rows) {
                    if (err) {
                        logger.error("Error While executing  selectPreferenceOptionsQuery : " + selectPreferenceOptionsQuery + " (getPreferenceWithOptionsById()) : \n" + err);

                        return cb(err, rows);
                    } else {
                        logger.info("Query selectPreferenceOptionsQuery :  " + selectPreferenceOptionsQuery + " executed (getPreferenceWithOptionsById()).");

                        var options = [];
                        rows.forEach(function(option) {
                            options.push({
                                id: option.preferenceOptionId,
                                order: option.prefOrder
                            });
                        });


                        preferences[0].options = options;
                        return cb(err, preferences);
                    }
                });
            } else {
                return cb(err, null);
            }
        }
    });
};

PreferencesDao.prototype.verifyRecord = function(data, recordId, cb) {
    var self = this;
    var firmConnection = baseDao.getConnection(data);
    var bitValue = data.preferencesFetchCriteria.levelBitValue;

    if (recordId == null) {
        recordId = data.preferencesFetchCriteria.recordId;
    }

    var query = null;
    if (bitValue == 1) { // get logging user's firm 

        //        if (data.user.firmId != undefined && data.user.firmId != null) {
        //
        //            if (recordId == data.user.firmId) {
        return cb(null, [{
            recordId: data.user.firmId,
            name: ''
        }]);
        //            } else {
        //                return cb(messages.preferenceRecordIdNotExist, null);
        //            }
        //        } else {
        //            logger.error("Error while gettinh current loggedIn user's firm.")
        //            return cb(messages.notFound, responseCode.NOT_FOUND);
        //        }
    } else if (bitValue == 2) {
        query = "Select *, id as recordId from custodian where id = " + recordId + " and isDeleted = 0";
    } else if (bitValue == 4) {
        query = "Select *, id as recordId from team where id = " + recordId + " and isDeleted = 0";
    } else if (bitValue == 8) {
        query = "Select *, id as recordId from portfolio where id = " + recordId + " and isDeleted = 0";
    } else if (bitValue == 16) {
        query = "Select *, id as recordId from model where id = " + recordId + " and isDeleted = 0";
    } else if (bitValue == 32) {
        query = "Select *, id as recordId from account where id = " + recordId + " and isDeleted = 0";
    } else if (bitValue == 64) {
        query = "Select * orionConnectExternalId as recordId from security where orionConnectExternalId = " + recordId + " and isDeleted = 0";
    } else if (bitValue == 128) {
        return cb(messages.notFound, null);
    } else if (bitValue == 256) {
        return cb(messages.notFound, null);
    } else if (bitValue == 511) {
        return cb(messages.notFound, null);
    } else {
        return cb(messages.notFound, null);
    }

    if (query == null) {
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }
    firmConnection.query(query, function(err, rows, fields) {
        logger.info("\"" + query + "\" executed (verifyRecord()).");
        if (err) {
            logger.error("Error while verifying record in PreferencesDao.prototype.verifyRecord \n Error : " + err);
            return cb(messages.internalServerError, rows);
        } else {
            return cb(err, rows);
        }
    });
};

PreferencesDao.prototype.getCurrentRoleType = function(data, cb) {

    var firmConnection = baseDao.getConnection(data);

    var currentUser = data.user.userId;

    var query = "Select rt.bitValue from user u LEFT JOIN role r ON r.id = u.roleId LEFT JOIN roleType rt ON rt.id = r.roleTypeId where u.id = " +
        currentUser;

    firmConnection.query(query, function(err, rows) {
        if (err) {
            return cb(err, rows);
        } else {
            if (rows.length < 1)
                return cb("", null);
            else
                return cb(err, rows[0]);
        }
    });
};

PreferencesDao.prototype.convertPreferenceResultToEntity = function(finalPreferenceList, cb) {
    preferenceConvertor.preferenceResultSetToPreferenceEntity(finalPreferenceList, function(err, sanitizedResponse) {
        if (err) {
            return cb(err, sanitizedResponse);
        } else {
            logger.info("Records list generated after conversion.");
            logger.debug("Generated Records after : " + JSON.stringify(sanitizedResponse));
            return cb(err, sanitizedResponse);
        }
    });
};

//to get current logged in user's firm total preferences for all allowed levels
PreferencesDao.prototype.getUserPreferenceCount = function(data, cb) {
    var firmConnection = baseDao.getConnection(data);

    var query = "SELECT DISTINCT count(*) as PrefCount FROM preference p where p.isDeleted = 0 And ";

    for (var i = 0; i < data.fetchCriteria.levelBitValues.length; i++) {
        var levelId = data.fetchCriteria.levelBitValues[i];

        if (i !== (data.fetchCriteria.levelBitValues.length - 1)) {
            query = query + " (p.allowedRecordTypes & " + levelId + " ) = " + levelId + " OR";
        } else {
            query = query + " (p.allowedRecordTypes & " + levelId + " ) = " + levelId + "";
        }
    }

    firmConnection.query(query, function(err, rows) {
        if (err) {
            logger.error("Error while count Query : " + query + " in PreferencesDao.prototype.getUserPreferenceCount()");
            return cb(err, rows);
        } else {
            logger.info("Success Query : " + query + " executed and result is : " + JSON.stringify(rows));
            return cb(err, rows);
        }
    });
};

PreferencesDao.prototype.getUserPreferenceEditedAfter = function(data, backDays, cb) {
    var firmConnection = baseDao.getConnection(data);

    var query = "Select count(*) as PrefCount from preferenceValue where isDeleted = 0 And editedBy = ? And DATE(editedDate) > (DATE(NOW())  - INTERVAL ? DAY)";

    var currentUserId = data.user.userId;

    firmConnection.query(query, [currentUserId, backDays], function(err, rows) {
        if (err) {
            logger.error("Errro while executing Query : " + query + " in PreferencesDao.prototype.getUserPreferenceEditedAfter()  \n " + err);
            return cb(err, rows);
        } else {
            logger.info("Success Query : " + query + " executed  in PreferencesDao.prototype.getUserPreferenceEditedAfter().")
            return cb(err, rows);
        }
    });
};

PreferencesDao.prototype.getUserPreferenceEditedOn = function(data, cb) {
    var firmConnection = baseDao.getConnection(data);

    var query = "Select count(*) as PrefCount from preferenceValue where isDeleted = 0 And editedBy = ? And DATE(editedDate) = DATE(NOW())";

    var currentUserId = data.user.userId;

    firmConnection.query(query, [currentUserId], function(err, rows) {
        if (err) {
            logger.error("Errro while executing Query : " + query + " in PreferencesDao.prototype.getUserPreferenceEditedOn()  \n " + err);
            return cb(err, rows);
        } else {
            logger.info("Success Query : " + query + " executed  in PreferencesDao.prototype.getUserPreferenceEditedAfter().")
            return cb(err, rows);
        }
    });
};

//List All levels service method
PreferencesDao.prototype.listCategories = function(data, cb) {

    var firmConnection = baseDao.getConnection(data);

    var query = "Select pc.* from preference p Left Join preferenceCategory pc ON pc.id = p.categoryId Where (p.allowedRecordTypes & ?) = ? and p.isDeleted = 0 GROUP BY pc.name Order By displayOrder ASC";

    firmConnection.query(query, [data.preferencesFetchCriteria.levelBitValue, data.preferencesFetchCriteria.levelBitValue], function(err, rows, fields) {
        if (err) {
            logger.error("Error while executing Query : " + query + " in PreferencesDao.prototype.listCategories(). \n Error :" + err);
            return cb(err, rows);
        } else {
            preferenceConvertor.categoryResultSetToEntity(rows, function(err, sanitizedResponse) {
                if (err) {
                    logger.error("Error while conversion in PreferencesDao.prototype.listCategories(). \n Error :" + err);
                    return cb(err, sanitizedResponse);
                } else {
                    logger.info("Successfully conversion in PreferencesDao.prototype.listCategories().");
                    return cb(err, sanitizedResponse);
                }
            });
        }
    });
};

PreferencesDao.prototype.saveOrUpdatePreferencesAll = function(data, recordId, cb) {
    var self = this;

    try {
        var firmConnection = baseDao.getConnection(data);
    } catch (e) {
        logger.error("Datavase connection error.  PreferencesDao.prototype.saveOrUpdatePreferences() " + e);
        return cb(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR);
    }

    var responseList = [];
    var len = data.preferences.length;

    var preferenceLocalObj = JSON.parse(JSON.stringify(data.preferences));

    for (var i = 0; i < len; i++) {
        preferenceLocalObj[i].levelBitValue = data.preferenceUpdateCriteria.levelBitValue;
        preferenceLocalObj[i].recordId = recordId;
    }

    preferenceLocalObj.forEach(function(preference) {

        if (preference.id == null) {
            preference.id = '-1';
        }

        var findExistingValueQuery = "Select * from preferenceValue where preferenceId = '" + preference.preferenceId + "' AND relatedType = '" + preference.levelBitValue +
            "' AND relatedTypeId = '" + preference.recordId + "' And isDeleted = 0";

        firmConnection.query(findExistingValueQuery, function(err, rows, fields) { // 1st to check if exist 

            var todayDate = new Date();

            if (err) {
                logger.error("Error While executing  findExistingValueQuery : " + findExistingValueQuery + " (saveOrUpdatePreferences()) : \n" + err);
                return cb(err, responseList);

            } else {
                logger.info("Query findExistingValueQuery :  " + findExistingValueQuery + " executed (saveOrUpdatePreferences()).");

                if (rows.length > 0) {

                    var preferenceValueId = rows[0].id;
                    preference.id = preferenceValueId; // just in case if new preference inserted more than one time (means same Object without generated unique id

                    //to update location Optimization preference
                    if (preference.type.toLowerCase() === (constants.preferenceType.location).toLowerCase()) {
                        if (preference.subClasses != undefined && preference.subClasses != null && preference.subClasses.length > 0) {
                            self.updateLocationOptimization(data, preferenceValueId, preference, function(err, response) {
                                if (err) {
                                    logger.error("Error while location optimization settinf prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {

                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            self.deletePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                                if (err) {
                                    logger.error("Error while deleting prefernce value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        // to update Security preference
                    } else if (preference.type.toLowerCase() === (constants.preferenceType.securityPreference).toLowerCase()) {
                        if (preference.securities != undefined && preference.securities.length > 0) {
                            self.updateSecurityPreferences(data, preferenceValueId, preference, function(err, response) {
                                if (err) {
                                    logger.error("Error while security prefernce value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {

                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });

                        } else {
                            self.deletePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                                if (err) {
                                    logger.error("Error while deleting prefernce value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        responseList.push(response);
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    } else if (preference.type.toLowerCase() === (constants.preferenceType.communityStrategist).toLowerCase()) {
                        if (preference.strategists.strategistIds != undefined && preference.strategists.strategistIds.length > 0) {
                            self.updateCommunityStrategist(data, preferenceValueId, preference, function(err, response) {
                                if (err) {
                                    logger.error("Error while updating community strategist prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            self.deletePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                                if (err) {
                                    logger.error("Error while deleting prefernce value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        responseList.push(response);
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                        //                                        len--;
                                        //                                        if (len <= 0) {
                                        //                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                        //                                                if (err) {
                                        //                                                    return cb(err, responseList);
                                        //                                                } else {
                                        //                                                    return cb(err, sanitizedResponse);
                                        //                                                }
                                        //                                            });
                                        //                                        }
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                        //                                        len--;
                                        //                                        if (len <= 0) {
                                        //                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                        //                                                if (err) {
                                        //                                                    return cb(err, responseList);
                                        //                                                } else {
                                        //                                                    return cb(err, sanitizedResponse);
                                        //                                                }
                                        //                                            });
                                        //                                        }
                                    }
                                }
                            });
                        }

                    } else if (preference.valueType.toLowerCase() === (constants.prefrenceValueType.OPTION_LIST).toLowerCase() || preference.valueType.toLowerCase() === (constants.prefrenceValueType.LIST).toLowerCase()) {

                        if (preference.selectedOptions != undefined && preference.selectedOptions.length > 0) {
                            self.updatePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                                if (err) {
                                    logger.error("Error while updating prefernce existing non optional value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        self.updatePreferenceOptionValue(data, preferenceValueId, preference, function(err, response) {
                                            if (err) {
                                                logger.error("Error while updating prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {

                                                if (response != undefined && response != null) {
                                                    responseList.push(response);
                                                    len--;
                                                    if (len <= 0) {
                                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                return cb(err, responseList);
                                                            } else {
                                                                return cb(err, sanitizedResponse);
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    len--;
                                                    if (len <= 0) {
                                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                            if (err) {
                                                                return cb(err, responseList);
                                                            } else {
                                                                return cb(err, sanitizedResponse);
                                                            }
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        } else {
                            self.deletePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                                if (err) {
                                    logger.error("Error while deleting prefernce value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        responseList.push(response);
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    } else {
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }

                    } else { // to update existing non optional value

                        if (preference.value != undefined && preference.value != null) {
                            self.updatePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                                if (err) {
                                    logger.error("Error while updating prefernce existing non optional value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        responseList.push(response);
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    } else {
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        } else {
                            self.deletePreferenceValue(data, preferenceValueId, preference, true, function(err, response) {
                                if (err) {
                                    logger.error("Error while deleting prefernce value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        responseList.push(response);
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    } else {
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                    }

                } else {

                    //to update location Optimization preference
                    if (preference.type.toLowerCase() === (constants.preferenceType.location).toLowerCase()) {
                        var locationPrefId = preference.preferenceId;
                        if (preference.subClasses != undefined && preference.subClasses != null && preference.subClasses.length > 0) {
                            self.updateLocationOptimization(data, null, preference, function(err, response) {
                                if (err) {
                                    logger.error("Error while location optimization settinf prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        self.getPreferenceResponseAfterUpdate(data, locationPrefId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, locationPrefId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        } else {

                            self.getPreferenceResponseAfterUpdate(data, locationPrefId, function(err, updatedPrefObj) {
                                if (err) {
                                    logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {
                                    responseList.push(updatedPrefObj);
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            });

                        }


                        // to update community strategist preference
                    } else if (preference.type.toLowerCase() === (constants.preferenceType.communityStrategist).toLowerCase()) {
                        var srategistPrefId = preference.preferenceId;
                        if (preference.strategists.strategistIds != undefined && preference.strategists.strategistIds.length > 0) {
                            self.updateCommunityStrategist(data, null, preference, function(err, response) {
                                if (err) {
                                    logger.error("Error while updating community strategist prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        self.getPreferenceResponseAfterUpdate(data, srategistPrefId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, srategistPrefId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            self.getPreferenceResponseAfterUpdate(data, srategistPrefId, function(err, updatedPrefObj) {
                                if (err) {
                                    logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {
                                    responseList.push(updatedPrefObj);
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            });
                        }

                    } else if (preference.type.toLowerCase() === (constants.preferenceType.securityPreference).toLowerCase()) {
                        var securityPrefId = preference.preferenceId;
                        if (preference.securities != undefined && preference.securities.length > 0) {
                            self.updateSecurityPreferences(data, null, preference, function(err, response) {
                                if (err) {
                                    logger.error("Error while updating security prefernce value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        self.getPreferenceResponseAfterUpdate(data, securityPrefId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    } else {
                                        self.getPreferenceResponseAfterUpdate(data, securityPrefId, function(err, updatedPrefObj) {
                                            if (err) {
                                                logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                                return cb(err, responseList);
                                            } else {
                                                responseList.push(updatedPrefObj);
                                                len--;
                                                if (len <= 0) {
                                                    preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                        if (err) {
                                                            return cb(err, sanitizedResponse);
                                                        } else {
                                                            return cb(err, sanitizedResponse);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });

                        } else {
                            self.getPreferenceResponseAfterUpdate(data, securityPrefId, function(err, updatedPrefObj) {
                                if (err) {
                                    logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {
                                    responseList.push(updatedPrefObj);
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    } else if (preference.valueType.toLowerCase() === (constants.prefrenceValueType.OPTION_LIST).toLowerCase() || preference.valueType.toLowerCase() === (constants.prefrenceValueType.LIST).toLowerCase()) {

                        if (preference.selectedOptions != undefined && preference.selectedOptions.length > 0) {
                            self.updatePreferenceOptionValue(data, null, preference, function(err, response) {
                                if (err) {
                                    logger.error("Error while updating prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {

                                    if (response != undefined && response != null) {
                                        responseList.push(response);
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    } else {
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                }
                            });

                        } else {
                            self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                if (err) {
                                    logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {
                                    responseList.push(updatedPrefObj);
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            });
                        }

                    } else {
                        if (preference.value != undefined && preference.value != null) {
                            self.insertPreferenceNewValue(data, preference, true, function(err, response) {
                                if (err) {
                                    logger.error("Error while inserting prefernce value   : \n" + err);
                                    return cb(err, responseList);

                                } else {

                                    if (response != undefined && response != null) {
                                        responseList.push(response);
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    } else {
                                        len--;
                                        if (len <= 0) {
                                            preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                                if (err) {
                                                    return cb(err, responseList);
                                                } else {
                                                    return cb(err, sanitizedResponse);
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        } else {
                            self.getPreferenceResponseAfterUpdate(data, preference.preferenceId, function(err, updatedPrefObj) {
                                if (err) {
                                    logger.error("Error while getting upted prefObj prefernce option value   : \n" + err);
                                    return cb(err, responseList);
                                } else {
                                    responseList.push(updatedPrefObj);
                                    len--;
                                    if (len <= 0) {
                                        preferenceConvertor.updatePreferenceResultSetToEntity(responseList, function(err, sanitizedResponse) {
                                            if (err) {
                                                return cb(err, sanitizedResponse);
                                            } else {
                                                return cb(err, sanitizedResponse);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            }
        });
    });
};

PreferencesDao.prototype.deletePreferenceValue = function(data, idToUpdate, preference, returnMaster, cb) {
    var self = this;
    var systemDataTime = utilFunctions.getSystemDateTime(null);
    var firmConnection = null;
    var firmConnection = null;

    try {
        firmConnection = baseDao.getConnection(data);
        firmConnection = baseDao.getConnection(data);
    } catch (e) {
        logger.error("Database connection error (possible reason : connection already closed due to any condition by user.) : \n" + e);

        return;
    }

    var valueToUpdate = {
        id: preference.id,
        value: preference.value,
        editedBy: utilService.getAuditUserId(data.user),
        editedDate: systemDataTime,
        isDeleted: 1
    }

    var preferenceUpdateQuery = 'UPDATE preferenceValue SET value =?, editedBy =?, editedDate =?, isDeleted = ? WHERE id =?';

    firmConnection.query(preferenceUpdateQuery, [valueToUpdate.value, valueToUpdate.editedBy, valueToUpdate.editedDate, valueToUpdate.isDeleted,
        valueToUpdate.id
    ], function(err, result) {
        if (err) {
            logger.error("Error While executing deleting prefernce Query :  preferenceUpdateQuery : " + preferenceUpdateQuery + " (updatePreferenceValue()) : \n" + err);

            return cb(err, result);
        } else {
            logger.info("Query preferenceUpdateQuery :  " + preferenceUpdateQuery + " executed (updatePreferenceValue()).");

            if (returnMaster == false) { // in case if preference updated object not required
                return cb(err, result);
            }

            var prefId = preference.preferenceId;

            self.getPreferenceResponseAfterUpdate(data, prefId, function(err, updatedPreferece) {
                if (err) {
                    return cb(err, updatedPreferece);
                } else {
                    return cb(err, updatedPreferece);
                }
            });
        }
    });
};

module.exports = PreferencesDao; // This is just a sample script. Paste your real code (javascript or HTML) here.// This is just a sample script. Paste your real code (javascript or HTML) here.