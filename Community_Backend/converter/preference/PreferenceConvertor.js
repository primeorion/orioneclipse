"use strict";

var moduleName = __filename;
var logger = require('helper/Logger')(moduleName);
var config = require('config');
var casting = require('casting');
var messages = config.messages;
var PreferenceLevelResponse = require("model/preference/PreferenceLevelResponse");
var PreferenceLevelEntity = require("entity/preference/PreferenceLevelEntity");
var PreferenceLevelRecordResponse = require("model/preference/PreferenceLevelRecordResponse");
var PreferenceLevelRecordEntity = require("entity/preference/PreferenceLevelRecordEntity");
var PreferenceResponse = require("model/preference/PreferenceResponse");
var PreferenceEntity = require("entity/preference/PreferenceEntity");
var PreferenceDetailResponse = require("model/preference/PreferenceDetailResponse");
var PreferenceDetailEntity = require("entity/preference/PreferenceDetailEntity");
var PreferencePrivilegeEntity = require("entity/preference/PreferencePrivilegeEntity");
var PreferencePrivilegeResponse = require("model/preference/PreferencePrivilegeResponse");
var PreferenceUpdateRequest = require("model/preference/PreferenceUpdateRequest");
var PreferenceUpdateEntity = require("entity/preference/PreferenceUpdateEntity");
var PreferenceUpdateResponse = require("model/preference/PreferenceUpdateResponse");
var PreferenceCategoryEntity = require("entity/preference/PreferenceCategoryEntity");
var PreferenceCategoryResponse = require("model/preference/PreferenceCategoryResponse");
var LocationOptimizationResponse = require("model/preference/LocationOptimizationResponse");
var LocationOptimizationEntity = require("entity/preference/LocationOptimizationEntity");
var UpdateLocationOptimizationEntity = require("entity/preference/UpdateLocationOptimizationEntity");
var CommunityStrategistResponse = require("model/preference/CommunityStrategistResponse");
var CommunityStrategistEntity = require("entity/preference/CommunityStrategistEntity");
var UpdateCommunityStrategistEntity = require("entity/preference/UpdateCommunityStrategistEntity");

var PreferenceConvertor = function() {}

PreferenceConvertor.prototype.levelEntityToLevelModel = function(data, cb) {

    var sanitizedResponse = null;

    if (data instanceof Array) { // to convert List of Levels
        var levelResponseList = [];
        data.forEach(function(level) {

            var levelObj = {
                id: level.id,
                name: level.name,
                bitValue: level.bitValue,
                shortName: level.shortName,
                allowedRoleType: level.allowedRoleType
            }
            levelResponseList.push(levelObj);
        });

        try {
            sanitizedResponse = new PreferenceLevelResponse(levelResponseList);
        } catch (e) {
            logger.error("Error while list conversion : " + e);
            return cb(messages.badRequest, sanitizedResponse);
        }
    } else if (data instanceof Object) { // to convert single level
        var levelObj = {
            id: data.id,
            name: data.name,
            bitValue: data.bitValue,
            shortName: data.shortName,
            allowedRoleType: data.allowedRoleType
        }
        try {
            sanitizedResponse = new PreferenceLevelResponse(levelObj);
        } catch (e) {
            logger.error("Error while single conversion : " + e);
            return cb(messages.badRequest, sanitizedResponse);
        }
    }

    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.recordEntityToRecordModel = function(records, cb) {

    var sanitizedResponse = null;

    if (records instanceof Array) { // to convert List of Levels
        var recordResponseList = [];
        records.forEach(function(record) {

            var reocrdObj = {
                id: record.id,
                name: record.name,
            }
            recordResponseList.push(reocrdObj);
        });

        try {
            sanitizedResponse = new PreferenceLevelRecordResponse(recordResponseList);
        } catch (e) {
            logger.error("Error while records conversion : " + e);
            return cb(messages.badRequest, sanitizedResponse);
        }
    }

    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.preferenceEntityToPreferenceModel = function(data, cb) {

    var sanitizedResponse = null;

    var preferenceResponseobj = {
        level: data.levelName,
        id: data.recordId,
        preferences: []
    }

    if (data.privileges !== null && data.privileges !== undefined) {
        preferenceResponseobj.privileges = new PreferencePrivilegeResponse(data.privileges);
    }

    if (data.preferences instanceof Array) {
        data.preferences.forEach(function(record) {

            var preferenceObj = {
                id: record.id,
                preferenceId: record.preferenceId,
                name: record.name,
                displayName: record.displayName,
                categoryType: record.categoryType,
                required: record.required,
                valueType: record.valueType,
                value: record.value,
                indicatorValue: record.indicatorValue,
                isInherited: record.isInherited,
                inheritedValue: record.inheritedValue,
                inheritedIndicatorValue: record.inheritedIndicatorValue,
                inheritedFrom: record.inheritedFrom,
                inheritedFromName: record.inheritedFromName,
                inheritedFromId: record.inheritedFromId,
                inheritedFromValueId: record.inheritedFromValueId,
                options: record.options,
                selectedOptions: record.selectedOptions,
                inheritedSelectedOptions: record.inheritedSelectedOptions,
                indicatorOptions: record.indicatorOptions,
                componentType: record.componentType,
                componentName: record.componentName,
                minlength: record.minlength,
                maxlength: record.maxlength,
                minValue: record.minValue,
                maxValue: record.maxValue,
                pattern: record.pattern,
                watermarkText: record.watermarkText,
                symbol: record.symbol,
                displayOrder: record.displayOrder,
                helpText: record.helpText
            }

            if (preferenceObj.componentType == 0) {
                preferenceObj.componentType = 'default';
            } else if (preferenceObj.componentType == 1) {
                preferenceObj.componentType = 'custom';
            } else {
                preferenceObj.componentType = null;
            }

            preferenceObj.selectedOptions.forEach(function(option) {
                var currentId = option.id;

                (preferenceObj.options).forEach(function(masterOption) {
                    if (masterOption.id == currentId) {
                        option.name = masterOption.name;
                    }
                });

            });

            preferenceObj.inheritedSelectedOptions.forEach(function(option) {
                var currentId = option.id;

                (preferenceObj.options).forEach(function(masterOption) {
                    if (masterOption.id == currentId) {
                        option.name = masterOption.name;
                    }
                });

            });



            try { // sanitize each preference detail
                var preferenceSanitizedObj = new PreferenceDetailResponse(preferenceObj);
                preferenceResponseobj.preferences.push(preferenceSanitizedObj);
            } catch (e) {
                logger.error("Error while preferenceObj conversion : " + e);
            }
        });
    }

    try { // sanitize final preferenceResponse
        sanitizedResponse = new PreferenceResponse(preferenceResponseobj);
    } catch (e) {
        logger.error("Error while preferenceResponseobj conversion : " + e);
        return cb(messages.badRequest, sanitizedResponse);
    }

    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.savePreferenceEntityToModel = function(updatedPreferencesList, cb) {

    var sanitizedRequest = null;

    var preferenceEntityObj = {
        preferences: []
    };

    if (updatedPreferencesList instanceof Array) {
        updatedPreferencesList.forEach(function(record) {

            var preferenceObj = {
                id: record.id,
                preferenceId: record.preferenceId,
                name: record.name,
                displayName: record.displayName,
                categoryType: record.categoryType,
                required: record.required,
                valueType: record.valueType,
                value: record.value,
                indicatorValue: record.indicatorValue,
                isInherited: record.isInherited,
                inheritedValue: record.inheritedValue,
                inheritedIndicatorValue: record.inheritedIndicatorValue,
                inheritedFrom: record.inheritedFrom,
                inheritedFromName: record.inheritedFromName,
                inheritedFromId: record.inheritedFromId,
                inheritedFromValueId: record.inheritedFromValueId,
                options: record.options,
                selectedOptions: record.selectedOptions,
                inheritedSelectedOptions: record.inheritedSelectedOptions,
                indicatorOptions: record.indicatorOptions,
                componentType: record.componentType,
                componentName: record.componentName,
                minlength: record.minlength,
                maxlength: record.maxlength,
                minValue: record.minValue,
                maxValue: record.maxValue,
                pattern: record.pattern,
                watermarkText: record.watermarkText,
                symbol: record.symbol,
                displayOrder: record.displayOrder,
                helpText: record.helpText
            }

            if (preferenceObj.componentType == 0) {
                preferenceObj.componentType = 'default';
            } else if (preferenceObj.componentType == 1) {
                preferenceObj.componentType = 'custom';
            } else {
                preferenceObj.componentType = null;
            }

            try { // sanitize each preference detail
                var preferenceSanitizedObj = new PreferenceDetailResponse(preferenceObj);
                preferenceEntityObj.preferences.push(preferenceSanitizedObj);
            } catch (e) {
                logger.error("Error while preferenceObj conversion : " + e);
            }
        });

        sanitizedRequest = preferenceEntityObj;
    } else {
        return cb(messages.badRequest, sanitizedRequest);
    }

    return cb(null, sanitizedRequest);
};

PreferenceConvertor.prototype.savePreferenceRequestToModel = function(data, cb) {

    var sanitizedRequest = null;

    var preferenceRequestObj = {
        preferences: []
    }


    if (data.preferences instanceof Array) {
        data.preferences.forEach(function(record) {

            var preferenceObj = {
                id: record.id,
                preferenceId: record.preferenceId,
                valueType: record.valueType,
                value: record.value,
                options: record.options,
                selectedOptions: record.selectedOptions,
                componentType: record.componentType,
                componentName: record.componentName
            }

            try { // sanitize each preference detail
                preferenceRequestObj.preferences.push(new PreferenceUpdateRequest(preferenceObj));
            } catch (e) {
                logger.error("Error while generating preferences list for save/update : " + e);
                return cb(messages.badRequest, sanitizedRequest);
            }
        });

        sanitizedRequest = preferenceRequestObj;
    } else {
        return cb(messages.badRequest, sanitizedRequest);
    }

    return cb(null, sanitizedRequest);
};

PreferenceConvertor.prototype.levelResultSetToLevelEntity = function(data, cb) {

    var sanitizedResponse = null;

    if (data instanceof Array) { // to convert List of Levels
        var levelResponseList = [];
        data.forEach(function(level) {

            var levelObj = {
                id: level.id,
                name: level.name,
                bitValue: level.bitValue,
                shortName: level.shortName,
                allowedRoleType: level.allowedRoleType
            }
            levelResponseList.push(levelObj);
        });

        try {
            sanitizedResponse = new PreferenceLevelEntity(levelResponseList);
        } catch (e) {
            logger.error("Error while generating level's list from resultset : " + e);
            return cb(messages.badRequest, sanitizedResponse);
        }
    } else if (data instanceof Object) { // to convert single level
        var levelObj = {
            id: level.id,
            name: level.name,
            bitValue: level.bitValue,
            shortName: level.shortName,
            allowedRoleType: level.allowedRoleType
        }
        try {
            sanitizedResponse = new PreferenceLevelEntity(levelResponseList);
        } catch (e) {
            logger.error("Error while generating single level entity  : " + e);
            return cb(messages.badRequest, sanitizedResponse);
        }
    }

    return cb(null, sanitizedResponse);
};


PreferenceConvertor.prototype.recordResultSetToRecordEntity = function(records, cb) {

    var sanitizedResponse = null;

    if (records instanceof Array) { // to convert List of Levels
        var recordResponseList = [];
        records.forEach(function(record) {

            var reocrdObj = {
                id: record.id,
                name: record.name,
            }
            recordResponseList.push(reocrdObj);
        });

        try {
            sanitizedResponse = new PreferenceLevelRecordEntity(recordResponseList);
        } catch (e) {
            logger.error("Error while records conversion : " + e);
            return cb(messages.badRequest, sanitizedResponse);
        }
    }

    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.preferenceResultSetToPreferenceEntity = function(preferences, cb) {

    var sanitizedResponse = null;

    if (preferences instanceof Array) {
        sanitizedResponse = [];
        preferences.forEach(function(record) {

            var preferenceObj = {
                id: record.id,
                preferenceId: record.preferenceId,
                name: record.name,

                displayName: record.displayName,
                categoryType: record.categoryType,
                required: record.required,
                valueType: record.valueType,
                value: record.value,
                indicatorValue: record.indicatorValue,
                isInherited: record.isInherited,
                inheritedValue: record.inheritedValue,
                inheritedIndicatorValue: record.inheritedIndicatorValue,
                inheritedFrom: record.inheritedFrom,
                inheritedFromName: record.inheritedFromName,
                inheritedFromId: record.inheritedFromId,
                inheritedFromValueId: record.inheritedFromValueId,
                options: record.options,
                selectedOptions: record.selectedOptions,
                inheritedSelectedOptions: record.inheritedSelectedOptions,
                indicatorOptions: record.indicatorOptions,
                componentType: record.componentType,
                componentName: record.componentName,
                //                
                //                displayName: record.displayName,
                //                categoryType: record.categoryType,
                //                required: record.required,
                //                valueType: record.valueType,
                //                value: record.value,
                //                isInherited: record.isInherited,
                //                inheritedValue: record.inheritedValue,
                //                inheritedFrom: record.inheritedFrom,
                //                inheritedFromName: record.inheritedFromName,
                //                inheritedFromId: record.inheritedFromId,
                //                inheritedFromValueId: record.inheritedFromValueId,
                //                options: record.options,
                //                selectedOptions: record.selectedOptions,
                //                inheritedSelectedOptions: record.inheritedSelectedOptions,
                //                componentType: record.componentType,
                //                componentName: record.componentName,
                minlength: record.minlength,
                maxlength: record.maxlength,
                minValue: record.minValue,
                maxValue: record.maxValue,
                pattern: record.pattern,
                watermarkText: record.watermarkText,
                symbol: record.symbol,
                displayOrder: record.displayOrder,
                helpText: record.helpText
            }

            try { // sanitize each preference detail
                sanitizedResponse.push(new PreferenceDetailEntity(preferenceObj));
            } catch (e) {
                logger.error("Error while preferenceObj conversion : " + e);
            }
        });
    } else if (preferences instanceof Object) {
        sanitizedResponse = {};
        var record = preferences;
        var preferenceObj = {
            id: record.id,
            preferenceId: record.preferenceId,
            name: record.name,
            //displayName: record.displayName,

            //            categoryType: record.categoryType,
            //            required: record.required,
            //            valueType: record.valueType,
            //            value: record.value,
            //            isInherited: record.isInherited,
            //            inheritedValue: record.inheritedValue,
            //            inheritedFrom: record.inheritedFrom,
            //            inheritedFromName: record.inheritedFromName,
            //            inheritedFromId: record.inheritedFromId,
            //            inheritedFromValueId: record.inheritedFromValueId,
            //            options: record.options,
            //            selectedOptions: record.selectedOptions,
            //            inheritedSelectedOptions: record.inheritedSelectedOptions,
            //            componentType: record.componentType,
            //            componentName: record.componentName,

            displayName: record.displayName,
            categoryType: record.categoryType,
            required: record.required,
            valueType: record.valueType,
            value: record.value,
            indicatorValue: record.indicatorValue,
            isInherited: record.isInherited,
            inheritedValue: record.inheritedValue,
            inheritedIndicatorValue: record.inheritedIndicatorValue,
            inheritedFrom: record.inheritedFrom,
            inheritedFromName: record.inheritedFromName,
            inheritedFromId: record.inheritedFromId,
            inheritedFromValueId: record.inheritedFromValueId,
            options: record.options,
            selectedOptions: record.selectedOptions,
            inheritedSelectedOptions: record.inheritedSelectedOptions,
            indicatorOptions: record.indicatorOptions,
            componentType: record.componentType,
            componentName: record.componentName,

            minlength: record.minlength,
            maxlength: record.maxlength,
            minValue: record.minValue,
            maxValue: record.maxValue,
            pattern: record.pattern,
            watermarkText: record.watermarkText,
            symbol: record.symbol,
            displayOrder: record.displayOrder,
            helpText: record.helpText
        }
        try { // sanitize each preference detail
            sanitizedResponse = new PreferenceDetailEntity(preferenceObj);
        } catch (e) {
            logger.error("Error while preferenceObj conversion : " + e);
        }
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.updatePreferenceResultSetToEntity = function(preferences, cb) {

    var sanitizedResponse = null;

    if (preferences instanceof Array) {
        sanitizedResponse = [];
        preferences.forEach(function(record) {

            var preferenceObj = {
                id: record.id,
                preferenceId: record.preferenceId,
                name: record.name,
                displayName: record.displayName,
                categoryType: record.categoryType,
                required: record.required,
                valueType: record.valueType,
                value: record.value,
                indicatorValue: record.indicatorValue,
                isInherited: record.isInherited,
                inheritedValue: record.inheritedValue,
                inheritedIndicatorValue: record.inheritedIndicatorValue,
                inheritedFrom: record.inheritedFrom,
                inheritedFromName: record.inheritedFromName,
                inheritedFromId: record.inheritedFromId,
                inheritedFromValueId: record.inheritedFromValueId,
                options: record.options,
                selectedOptions: record.selectedOptions,
                inheritedSelectedOptions: record.inheritedSelectedOptions,
                indicatorOptions: record.indicatorOptions,
                componentType: record.componentType,
                componentName: record.componentName,
                minlength: record.minlength,
                maxlength: record.maxlength,
                minValue: record.minValue,
                maxValue: record.maxValue,
                pattern: record.pattern,
                watermarkText: record.watermarkText,
                symbol: record.symbol,
                displayOrder: record.displayOrder,
                helpText: record.helpText
            }

            try { // sanitize each preference detail
                sanitizedResponse.push(new PreferenceDetailEntity(preferenceObj));
            } catch (e) {
                logger.error("Error while preferenceObj conversion : " + e);
            }
        });
    } else if (preferences instanceof Object) {
        sanitizedResponse = {};
        var record = preferences;
        var preferenceObj = {
            id: record.id,
            preferenceId: record.preferenceId,
            name: record.name,
            displayName: record.displayName,
            categoryType: record.categoryType,
            required: record.required,
            valueType: record.valueType,
            value: record.value,
            indicatorValue: record.indicatorValue,
            isInherited: record.isInherited,
            inheritedValue: record.inheritedValue,
            inheritedIndicatorValue: record.inheritedIndicatorValue,
            inheritedFrom: record.inheritedFrom,
            inheritedFromName: record.inheritedFromName,
            inheritedFromId: record.inheritedFromId,
            inheritedFromValueId: record.inheritedFromValueId,
            options: record.options,
            selectedOptions: record.selectedOptions,
            inheritedSelectedOptions: record.inheritedSelectedOptions,
            indicatorOptions: record.indicatorOptions,
            componentType: record.componentType,
            componentName: record.componentName,
            minlength: record.minlength,
            maxlength: record.maxlength,
            minValue: record.minValue,
            maxValue: record.maxValue,
            pattern: record.pattern,
            watermarkText: record.watermarkText,
            symbol: record.symbol,
            displayOrder: record.displayOrder,
            helpText: record.helpText
        }
        try { // sanitize each preference detail
            sanitizedResponse = new PreferenceDetailEntity(preferenceObj);
        } catch (e) {
            logger.error("Error while preferenceObj conversion : " + e);
        }
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.savePreferenceModelToEntity = function(data, cb) {

    var sanitizedRequest = null;

    var preferenceEntityObj = {
        preferences: []
    };

    if (data.preferences instanceof Array) {
        data.preferences.forEach(function(record) {

            var preferenceObj = {
                id: record.id,
                preferenceId: record.preferenceId,
                name: record.name,
                recordType: record.recordType,
                recordTypeId: record.recordTypeId,
                valueType: record.valueType,
                value: record.value,
                options: record.options,
                selectedOptions: record.selectedOptions,
                componentType: record.componentType,
                componentName: record.componentName
            }

            try { // sanitize each preference detail
                preferenceEntityObj.preferences.push(new PreferenceUpdateEntity(preferenceObj));
            } catch (e) {
                logger.error("Error while generating preferences list for save/update : " + e);
                return cb(messages.badRequest, sanitizedRequest);
            }
        });

        sanitizedRequest = preferenceEntityObj;
    } else {
        return cb(messages.badRequest, sanitizedRequest);
    }

    return cb(null, sanitizedRequest);
};

PreferenceConvertor.prototype.categoryResultSetToEntity = function(categories, cb) {

    var sanitizedResponse = null;

    if (categories instanceof Array) { // to convert List of Levels
        var categoryResponseList = [];
        categories.forEach(function(record) {

            var reocrdObj = {
                id: record.id,
                name: record.name,
                order: record.displayOrder
            }
            categoryResponseList.push(reocrdObj);
        });

        try {
            sanitizedResponse = new PreferenceCategoryEntity(categoryResponseList);
        } catch (e) {
            logger.error("Error while category conversion : " + e);
            return cb(messages.badRequest, sanitizedResponse);
        }
    }

    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.categoryResultSetToModel = function(categories, cb) {

    var sanitizedResponse = null;

    if (categories instanceof Array) { // to convert List of Levels
        var categoryResponseList = [];
        categories.forEach(function(record) {

            var reocrdObj = {
                id: record.id,
                name: record.name,
                order: record.order
            }
            categoryResponseList.push(reocrdObj);
        });

        try {
            sanitizedResponse = new PreferenceCategoryResponse(categoryResponseList);
        } catch (e) {
            logger.error("Error while category conversion : " + e);
            return cb(messages.badRequest, sanitizedResponse);
        }
    }

    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.updateLocationOptimizationResultSetToEntity = function(locationOnj, cb) {

    var sanitizedResponse = null;

    sanitizedResponse = {};

    var record = locationOnj;
    var preferenceObj = {
        level: record.levelName,
        recordId: record.recordId,
        id: record.id,
        preferenceId: record.preferenceId,
        name: record.name,
        displayName: record.displayName,
        categoryType: record.categoryType,
        required: record.required,
        valueType: record.valueType,
        subClasses: record.subClasses,
        isInherited: record.isInherited,
        inheritedValue: record.inheritedValue,
        inheritedFrom: record.inheritedFrom,
        inheritedFromName: record.inheritedFromName,
        inheritedFromId: record.inheritedFromId,
        inheritedFromValueId: record.inheritedPreferenceValueId,
        inheritedSubClasses: record.inheritedSubClasses,
        componentType: record.componentType,
        componentName: record.componentName,
        watermarkText: record.watermarkText,
        symbol: record.symbol,
        displayOrder: record.displayOrder,
        helpText: record.helpText
    }

    try { // sanitize each preference detail
        sanitizedResponse = new UpdateLocationOptimizationEntity(preferenceObj);
    } catch (e) {
        logger.error("Error while locationOptimization conversion : " + e);
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.locationOptimizationResultSetToEntity = function(locationOnj, cb) {

    var sanitizedResponse = null;

    sanitizedResponse = {};

    var record = locationOnj;
    var preferenceObj = {
        level: record.levelName,
        recordId: record.recordId,
        id: record.id,
        preferenceId: record.preferenceId,
        name: record.name,
        displayName: record.displayName,
        categoryType: record.categoryType,
        required: record.required,
        valueType: record.valueType,
        subClasses: record.subClasses,
        isInherited: record.isInherited,
        inheritedValue: record.inheritedValue,
        inheritedFrom: record.inheritedFrom,
        inheritedFromName: record.inheritedFromName,
        inheritedFromId: record.inheritedFromId,
        inheritedFromValueId: record.inheritedFromValueId,
        inheritedSubClasses: record.inheritedSubClasses,
        componentType: record.componentType,
        componentName: record.componentName,
        watermarkText: record.watermarkText,
        symbol: record.symbol,
        displayOrder: record.displayOrder,
        helpText: record.helpText
    }

    try { // sanitize each preference detail
        sanitizedResponse = new LocationOptimizationEntity(preferenceObj);
    } catch (e) {
        logger.error("Error while locationOptimization conversion : " + e);
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.locationOptimizationEntityToModel = function(locationOnj, cb) {

    var sanitizedResponse = null;

    sanitizedResponse = {};

    var record = locationOnj;
    var preferenceObj = {
        level: record.level,
        recordId: record.recordId,
        id: record.id,
        preferenceId: record.preferenceId,
        componentType: record.componentType,
        componentName: record.componentName,
        name: record.name,
        displayName: record.displayName,
        categoryType: record.categoryType,
        required: record.required,
        valueType: record.valueType,
        subClasses: record.subClasses,
        isInherited: record.isInherited,
        inheritedValue: record.inheritedValue,
        inheritedFrom: record.inheritedFrom,
        inheritedFromName: record.inheritedFromName,
        inheritedFromId: record.inheritedFromId,
        inheritedFromValueId: record.inheritedFromValueId,
        inheritedSubClasses: record.inheritedSubClasses,
        watermarkText: record.watermarkText,
        symbol: record.symbol,
        displayOrder: record.displayOrder,
        helpText: record.helpText
    }

    if (preferenceObj.componentType == 0) {
        preferenceObj.componentType = 'default';
    } else if (preferenceObj.componentType == 1) {
        preferenceObj.componentType = 'custom';
    } else {
        preferenceObj.componentType = null;
    }

    try { // sanitize each preference detail
        sanitizedResponse = new LocationOptimizationResponse(preferenceObj);
        //      delete sanitizedResponse.id,
        //      preferenceId: record.preferenceId,
        delete sanitizedResponse.name;
        delete sanitizedResponse.displayName;
        delete sanitizedResponse.categoryType,
            delete sanitizedResponse.required,
            delete sanitizedResponse.valueType,
            //      strategists: record.strategists,
            delete sanitizedResponse.isInherited,
            delete sanitizedResponse.inheritedValue,
            delete sanitizedResponse.inheritedFrom,
            delete sanitizedResponse.inheritedFromName,
            delete sanitizedResponse.inheritedFromId,
            //      inheritedStrategists: record.inheritedStrategists,
            //      delete sanitizedResponse.componentType,
            //      delete sanitizedResponse.componentName,
            delete sanitizedResponse.watermarkText,
            delete sanitizedResponse.symbol,
            delete sanitizedResponse.displayOrder,
            delete sanitizedResponse.helpText

    } catch (e) {
        logger.error("Error while locationOptimization conversion : " + e);
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.communityStrategistResultSetToEntity = function(locationOnj, cb) {

    var sanitizedResponse = null;

    sanitizedResponse = {};

    var record = locationOnj;
    var preferenceObj = {
        level: record.levelName,
        recordId: record.recordId,
        id: record.id,
        preferenceId: record.preferenceId,
        name: record.name,
        displayName: record.displayName,
        categoryType: record.categoryType,
        required: record.required,
        valueType: record.valueType,
        strategists: record.strategists,
        isInherited: record.isInherited,
        inheritedValue: record.inheritedValue,
        inheritedFrom: record.inheritedFrom,
        inheritedFromName: record.inheritedFromName,
        inheritedFromId: record.inheritedFromId,
        inheritedFromValueId: record.inheritedPreferenceValueId,
        inheritedStrategists: record.inheritedStrategists,
        componentType: record.componentType,
        componentName: record.componentName,
        watermarkText: record.watermarkText,
        symbol: record.symbol,
        displayOrder: record.displayOrder,
        helpText: record.helpText
    }

    try { // sanitize each preference detail
        sanitizedResponse = new CommunityStrategistEntity(preferenceObj);
    } catch (e) {
        logger.error("Error while locationOptimization conversion : " + e);
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.updateCommunityStrategistResultSetToEntity = function(locationOnj, cb) {

    var sanitizedResponse = null;

    sanitizedResponse = {};

    var record = locationOnj;
    var preferenceObj = {
        level: record.levelName,
        recordId: record.recordId,
        id: record.id,
        preferenceId: record.preferenceId,
        name: record.name,
        displayName: record.displayName,
        categoryType: record.categoryType,
        required: record.required,
        valueType: record.valueType,
        strategists: record.strategists,
        isInherited: record.isInherited,
        inheritedValue: record.inheritedValue,
        inheritedFrom: record.inheritedFrom,
        inheritedFromName: record.inheritedFromName,
        inheritedFromId: record.inheritedFromId,
        inheritedFromValueId: record.inheritedPreferenceValueId,
        inheritedStrategists: record.inheritedStrategists,
        componentType: record.componentType,
        componentName: record.componentName,
        watermarkText: record.watermarkText,
        symbol: record.symbol,
        displayOrder: record.displayOrder,
        helpText: record.helpText
    }

    try { // sanitize each preference detail
        sanitizedResponse = new UpdateCommunityStrategistEntity(preferenceObj);
    } catch (e) {
        logger.error("Error while locationOptimization conversion : " + e);
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.communityStrategistEntityToModel = function(locationOnj, cb) {

    var sanitizedResponse = null;

    sanitizedResponse = {};

    var record = locationOnj;
    var preferenceObj = {
        level: record.level,
        recordId: record.recordId,
        id: record.id,
        preferenceId: record.preferenceId,
        componentType: record.componentType,
        componentName: record.componentName,
        name: record.name,
        displayName: record.displayName,
        categoryType: record.categoryType,
        required: record.required,
        valueType: record.valueType,
        strategists: record.strategists,
        isInherited: record.isInherited,
        inheritedValue: record.inheritedValue,
        inheritedFrom: record.inheritedFrom,
        inheritedFromName: record.inheritedFromName,
        inheritedFromId: record.inheritedFromId,
        inheritedFromValueId: record.inheritedFromValueId,
        inheritedStrategists: record.inheritedStrategists,
        watermarkText: record.watermarkText,
        symbol: record.symbol,
        displayOrder: record.displayOrder,
        helpText: record.helpText
    }

    if (preferenceObj.componentType == 0) {
        preferenceObj.componentType = 'default';
    } else if (preferenceObj.componentType == 1) {
        preferenceObj.componentType = 'custom';
    } else {
        preferenceObj.componentType = null;
    }

    try { // sanitize each preference detail
        sanitizedResponse = new CommunityStrategistResponse(preferenceObj);

        //        delete sanitizedResponse.id,
        //        preferenceId: record.preferenceId,
        delete sanitizedResponse.name;
        delete sanitizedResponse.displayName;
        delete sanitizedResponse.categoryType,
            delete sanitizedResponse.required,
            delete sanitizedResponse.valueType,
            //        strategists: record.strategists,
            delete sanitizedResponse.isInherited,
            delete sanitizedResponse.inheritedValue,
            delete sanitizedResponse.inheritedFrom,
            delete sanitizedResponse.inheritedFromName,
            delete sanitizedResponse.inheritedFromId,
            //        inheritedStrategists: record.inheritedStrategists,
            //        delete sanitizedResponse.componentType,
            //        delete sanitizedResponse.componentName,
            delete sanitizedResponse.watermarkText,
            delete sanitizedResponse.symbol,
            delete sanitizedResponse.displayOrder,
            delete sanitizedResponse.helpText
    } catch (e) {
        logger.error("Error while locationOptimization conversion : " + e);
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.communityStrategistModelToEntity = function(locationOnj, cb) {

    var sanitizedResponse = null;

    sanitizedResponse = {};

    var record = locationOnj;
    var preferenceObj = {
        level: record.level,
        recordId: record.recordId,
        id: record.id,
        preferenceId: record.preferenceId,
        name: record.name,
        displayName: record.displayName,
        categoryType: record.categoryType,
        required: record.required,
        valueType: record.valueType,
        strategists: record.strategists,
        isInherited: record.isInherited,
        inheritedValue: record.inheritedValue,
        inheritedFrom: record.inheritedFrom,
        inheritedFromName: record.inheritedFromName,
        inheritedFromId: record.inheritedFromId,
        inheritedFromValueId: record.inheritedFromValueId,
        inheritedStrategists: record.inheritedStrategists,
        componentType: record.componentType,
        componentName: record.componentName,
        watermarkText: record.watermarkText,
        symbol: record.symbol,
        displayOrder: record.displayOrder,
        helpText: record.helpText
    }

    if (preferenceObj.componentType == 0) {
        preferenceObj.componentType = 'default';
    } else if (preferenceObj.componentType == 1) {
        preferenceObj.componentType = 'custom';
    } else {
        preferenceObj.componentType = null;
    }

    try { // sanitize each preference detail
        sanitizedResponse = new CommunityStrategistEntity(preferenceObj);

        delete sanitizedResponse.id,
            //        preferenceId: record.preferenceId,
            delete sanitizedResponse.name;
        delete sanitizedResponse.displayName;
        delete sanitizedResponse.categoryType,
            delete sanitizedResponse.required,
            delete sanitizedResponse.valueType,
            //        strategists: record.strategists,
            delete sanitizedResponse.isInherited,
            delete sanitizedResponse.inheritedValue,
            delete sanitizedResponse.inheritedFrom,
            delete sanitizedResponse.inheritedFromName,
            delete sanitizedResponse.inheritedFromId,
            //        inheritedStrategists: record.inheritedStrategists,
            delete sanitizedResponse.componentType,
            delete sanitizedResponse.componentName,
            delete sanitizedResponse.watermarkText,
            delete sanitizedResponse.symbol,
            delete sanitizedResponse.displayOrder,
            delete sanitizedResponse.helpText
    } catch (e) {
        logger.error("Error while locationOptimization conversion : " + e);
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.LocationOptimizationModelToEntity = function(locationOnj, cb) {

    var sanitizedResponse = null;

    sanitizedResponse = {};

    var record = locationOnj;
    var preferenceObj = {
        level: record.level,
        recordId: record.recordId,
        id: record.id,
        preferenceId: record.preferenceId,
        name: record.name,
        displayName: record.displayName,
        categoryType: record.categoryType,
        required: record.required,
        valueType: record.valueType,
        subClasses: record.subClasses,
        isInherited: record.isInherited,
        inheritedValue: record.inheritedValue,
        inheritedFrom: record.inheritedFrom,
        inheritedFromName: record.inheritedFromName,
        inheritedFromId: record.inheritedFromId,
        inheritedSubClasses: record.inheritedSubClasses,
        componentType: record.componentType,
        componentName: record.componentName,
        watermarkText: record.watermarkText,
        symbol: record.symbol,
        displayOrder: record.displayOrder,
        helpText: record.helpText
    }

    if (preferenceObj.componentType == 0) {
        preferenceObj.componentType = 'default';
    } else if (preferenceObj.componentType == 1) {
        preferenceObj.componentType = 'custom';
    } else {
        preferenceObj.componentType = null;
    }

    try { // sanitize each preference detail
        sanitizedResponse = new LocationOptimizationEntity(preferenceObj);

        delete sanitizedResponse.id,
            //        preferenceId: record.preferenceId,
            delete sanitizedResponse.name;
        delete sanitizedResponse.displayName;
        delete sanitizedResponse.categoryType,
            delete sanitizedResponse.required,
            delete sanitizedResponse.valueType,
            //        strategists: record.strategists,
            delete sanitizedResponse.isInherited,
            delete sanitizedResponse.inheritedValue,
            delete sanitizedResponse.inheritedFrom,
            delete sanitizedResponse.inheritedFromName,
            delete sanitizedResponse.inheritedFromId,
            //        inheritedStrategists: record.inheritedStrategists,
            delete sanitizedResponse.componentType,
            delete sanitizedResponse.componentName,
            delete sanitizedResponse.watermarkText,
            delete sanitizedResponse.symbol,
            delete sanitizedResponse.displayOrder,
            delete sanitizedResponse.helpText
    } catch (e) {
        logger.error("Error while locationOptimization conversion : " + e);
    }


    return cb(null, sanitizedResponse);
};

PreferenceConvertor.prototype.securityPreferenceConvertor = function(data, securityPreferences, securityPreferencesValidator, cb) {


    delete securityPreferencesValidator.taxableAlternate;
    delete securityPreferencesValidator.taxDeferredAlternate;
    delete securityPreferencesValidator.taxExemptAlternate;

    var castAll = casting.forDescriptors({
        sellTradeMaxAmtBySecurity: {
            type: securityPreferencesValidator["sellTradeMaxAmtBySecurity"].type
        },
        sellTradeMaxPctBySecurity: {
            type: securityPreferencesValidator["sellTradeMaxPctBySecurity"].type
        },
        sellTradeMinAmtBySecurity: {
            type: securityPreferencesValidator["sellTradeMinAmtBySecurity"].type
        }/*,
        sellTradeMaxAmtBySecurity: {
            type: securityPreferencesValidator["sellTradeMaxAmtBySecurity"].type
        }*/,
        sellTradeMinPctBySecurity: {
            type: securityPreferencesValidator["sellTradeMinPctBySecurity"].type
        },
        buyTradeMaxPctBySecurity: {
            type: securityPreferencesValidator["buyTradeMaxPctBySecurity"].type
        },
        buyTradeMinPctBySecurity: {
            type: securityPreferencesValidator["buyTradeMinPctBySecurity"].type
        },
        buyTradeMaxAmtBySecurity: {
            type: securityPreferencesValidator["buyTradeMaxAmtBySecurity"].type
        },
        buyTradeMinAmtBySecurity: {
            type: securityPreferencesValidator["buyTradeMinAmtBySecurity"].type
        },
        custodianRedemptionDays: {
            type: securityPreferencesValidator["custodianRedemptionDays"].type
        },
        custodianRedemptionFeeAmount: {
            type: securityPreferencesValidator["custodianRedemptionFeeAmount"].type
        },
        custodianRedemptionFeeTypeId: {
            type: securityPreferencesValidator["custodianRedemptionFeeTypeId"].type
        },
        sellTransactionFee: {
            type: securityPreferencesValidator["sellTransactionFee"].type
        },
        buyTransactionFee: {
            type: securityPreferencesValidator["buyTransactionFee"].type
        },
        capGainReinvestTaxable: {
            type: securityPreferencesValidator["capGainReinvestTaxable"].type
        },
        capGainsReinvestTaxDef: {
            type: securityPreferencesValidator["capGainsReinvestTaxDef"].type
        },
        capGainsReinvestTaxExempt: {
            type: securityPreferencesValidator["capGainsReinvestTaxExempt"].type
        },
        taxExemptDivReinvest: {
            type: securityPreferencesValidator["taxExemptDivReinvest"].type
        },
        taxableDivReInvest: {
            type: securityPreferencesValidator["taxableDivReInvest"].type
        },
        taxDefDivReinvest: {
            type: securityPreferencesValidator["taxDefDivReinvest"].type
        },
        redemptionFeeTypeId: {
            type: securityPreferencesValidator["redemptionFeeTypeId"].type
        },
        redemptionDays: {
            type: securityPreferencesValidator["redemptionDays"].type
        },
        redemptionFeeAmount: {
            type: securityPreferencesValidator["redemptionFeeAmount"].type
        },
        excludeHolding: {
            type: securityPreferencesValidator["excludeHolding"].type
        }
    });

    //	  var castAll = null;
    var securityPref = {
        securityPreferences: [],
        inheritedSecurityPreferences: []
    };


    var prefLength = securityPreferences.securityPreferences.length;
    var inheritedPrefLength = securityPreferences.inheritedSecurityPreferences.length;
    try {
        for (var i = 0; i < prefLength; i++) {
            var prefObj = castAll(securityPreferences.securityPreferences[i]);

            try {
                prefObj.taxableAlternate = JSON.parse(prefObj.taxableAlternate);
            } catch (err) {}
            try {
                prefObj.taxDeferredAlternate = JSON.parse(prefObj.taxDeferredAlternate);
            } catch (err) {}
            try {
                prefObj.taxExemptAlternate = JSON.parse(prefObj.taxExemptAlternate);
            } catch (err) {}

            securityPref.securityPreferences.push(prefObj);
        }

        for (var i = 0; i < prefLength; i++) {
            var prefObj = castAll(securityPreferences.inheritedSecurityPreferences[i]);

            try {
                prefObj.taxableAlternate = JSON.parse(prefObj.taxableAlternate);
            } catch (err) {}
            try {
                prefObj.taxDeferredAlternate = JSON.parse(prefObj.taxDeferredAlternate);
            } catch (err) {}
            try {
                prefObj.taxExemptAlternate = JSON.parse(prefObj.taxExemptAlternate);
            } catch (err) {}
            
            securityPref.inheritedSecurityPreferences.push(prefObj);
        }
    } catch (err) {
        logger.error("Error while casting securoty preferences : " + err);
        return cb(err, securityPreferences);
    }
    logger.debug("Converted : \n" + JSON.stringify(securityPref));
    return cb(null, securityPref);
}

module.exports = PreferenceConvertor;