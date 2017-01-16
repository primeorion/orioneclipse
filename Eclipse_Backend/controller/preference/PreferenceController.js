"use strict";

var moduleName = __filename;
var app = require("express")();
var validate = require('express-jsonschema').validate;
var config = require('config');
var sharedCache = require('service/cache/').shared;
var logger = require("helper/Logger")(moduleName);
var messages = config.messages;
var responseCodes = config.responseCodes;
var preferenceService = new(require('service/preference/PreferenceService'))();
var preferenceConvertor = new(require("converter/preference/PreferenceConvertor"))();
var response = require('controller/ResponseController');
var analysisMiddleware = require('middleware/AnalysisMiddleware.js')

app.use(require('middleware/DBConnection').common); // add common connection capability in preference

var updatePreferenceCombined = {
    type: 'object',
    properties: {
        level: {
            type: 'String',
            required: true
        },
        id: {
            type: ["number", "null"],
            required: true
        },
        ids: {
            type: ["array", "null"],
            required: true
        },
        defaultPreferences: {
            type: ["array", "null"],
            required: false,
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: ["number", "null"],
                        required: true
                    },
                    preferenceId: {
                        type: 'number',
                        required: true
                    },
                    valueType: {
                        type: 'String',
                        required: true
                    },
                    value: {
                        required: false
                    },
                    selectedOptions: {
                        type: 'array',
                        required: true,
                        items: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'number',
                                    required: true
                                },
                                order: {
                                    type: 'number',
                                    required: false
                                }
                            }
                        }

                    },
                    componentType: {
                        type: ["String", "null"],
                        required: false
                    },
                    componentName: {
                        type: ["String", "null"],
                        required: false
                    },
                    selectedIndicatorValue: {
                        type: ["String", "null", "number"],
                        required: false
                    }
                }
            }
        },
        locationOptimizationPreference: {
            type: ["object", "null"],
            required: false,
            properties: {
                id: {
                    type: ['number', 'null'],
                    required: true
                },
                preferenceId: {
                    type: 'number',
                    required: true
                },
                subClasses: {
                    type: ["array", "null"],
                    required: true,
                    items: {
                        type: 'object',
                        properties: {
                            id: {
                                type: ["number"],
                                required: true
                            },
                            name: {
                                type: ["String", "null"],
                                required: false
                            },
                            buySetting: {
                                type: 'object',
                                required: true,
                                properties: {
                                    T: {
                                        type: 'number',
                                        required: true,
                                        enum: [1, 2, 3, 4]
                                    },
                                    TD: {
                                        type: 'number',
                                        required: true,
                                        enum: [1, 2, 3, 4]
                                    },
                                    TE: {
                                        type: 'number',
                                        required: true,
                                        enum: [1, 2, 3, 4]
                                    }
                                }
                            },
                            sellSetting: {
                                type: 'object',
                                required: true,
                                properties: {
                                    T: {
                                        type: 'number',
                                        required: true,
                                        enum: [1, 2, 3, 4]
                                    },
                                    TD: {
                                        type: 'number',
                                        required: true,
                                        enum: [1, 2, 3, 4]
                                    },
                                    TE: {
                                        type: 'number',
                                        required: true,
                                        enum: [1, 2, 3, 4]
                                    }
                                }
                            }
                        }
                    }
                }
            }

        },
        communityStrategistPreference: {
            type: ["object", "null"],
            required: false,
            properties: {
                id: {
                    type: ['number', 'null'],
                    required: true
                },
                preferenceId: {
                    type: 'number',
                    required: true
                },
                strategists: {
                    type: 'object',
                    properties: {
                        strategistIds: {
                            type: ["array", "null"],
                            required: true
                        },
                        modelAccessLevel: {
                            type: ["number", "null"],
                            required: true,
                            enum: [1, 2, null]
                        },
                        communityModels: {
                            type: ["array", "null"],
                            required: true
                        }
                    }
                }
            }
        },
        securityPreferences: {
            type: ["object", "null"],
            required: false,
            properties: {
                id: {
                    type: ['number', 'null'],
                    required: true
                },
                preferenceId: {
                    type: 'number',
                    required: true
                },
                securities: {
                    type: ["array", "null"],
                    required: true
                }
            }
        }
    }
};

/**
 * @apiIgnore Not needed now
 * @api {get} /preference/clearCache  Clear Preference Cache
 * @apiName ClearPreferenceCache
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This api is used for clearing preferences cache (For back-end internal use only). 
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/clearCache
 *
 * 
 * @apiSuccessExample Response (example):
 *
 *	Cache cleared successfully.
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/clearCache', function(req, res) {
    logger.info("Get API to clear preference cache.");
    preferenceService.clearPreferenceCache(req.data, function(err, status, responseStatus) {
        logger.info("All preference cache cleared successfully.");
        return response(err, status, responseStatus, res);
    });
});

/**
 * @api {get} /preference/levels  Get Preference Levels
 * @apiName ListAllPreferenceLevels
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will provide list of preferences levels. 
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/levels
 *
 *@apiSuccess {Number}   id  Unique id of level from db.
 *@apiSuccess {String}   name Name of level.
 *@apiSuccess {Number}   bitValue  BitValue of level.
 *@apiSuccess {String}   shortName Short name for level.
 *@apiSuccess {Number}   allowedRoleType  RoleType Ids allowed for level access.
 *
 * 
 * 
 * @apiSuccessExample Response (example):
 * 				[
 *				 {
 *				   "id": 1,
 *				   "name": "Firm",
 *				   "bitValue": 1,
 *				   "shortName": "F",
 *				   "allowedRoleType": 1
 *				 },
 *				 {
 *				   "id": 2,
 *				   "name": "Custodian",
 *				   "bitValue": 2,
 *				   "shortName": "C",
 *				   "allowedRoleType": 1
 *				 },
 *					.........
 *			   ]
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/levels', function(req, res) {
    logger.info("Get all levels request received");
    preferenceService.listAllPreferenceLevels(req.data, function(err, status, levels) {
        logger.info("Get all levels response genereted.");
        return response(err, status, levels, res);
    });
});

/**
 * @api {get} /preference/:levelName/categories  Get Preference Categories
 * @apiName GetPreferenceCategories
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will return a list of preference categories by levelName
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/categories
 *
 *@apiSuccess {Array}   CategoryList  List of categories (id, name and displayOrder (order)).
 * 
 * @apiSuccessExample Response (example):
 *[
 *  {
 *    "id": 2,
 *    "name": "Dashboard",
 *    "order": 1
 *  },
 *  {
 *    "id": 1,
 *    "name": "Daily Import",
 *    "order": 2
 *  },
 *  {
 *    "id": 3,
 *    "name": "Other",
 *    "order": 3
 *  },
 *  {
 *    "id": 4,
 *    "name": "Rebalance",
 *    "order": 4
 *  }
 *]
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/:levelName/categories', function(req, res) {
    logger.info("Get all categories request received");
    if (req.params.levelName == undefined) {
        logger.error("Get all category errro : invalid or incomplete query parameter.");
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;

    var preferencesFetchCriteria = {
        levelName: levelName,
        levelBitValue: null
    };

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.listCategories(req.data, function(err, status, levels) {
        logger.info("Get all categories response genereted.");
        return response(err, status, levels, res);
    });
});

/**
 * @api {get} /preference/:levelName/master List Master Preferences
 * @apiName ListMasterPreferences
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will provide list of preferences for provided Level's name (:levelName) but without values. 
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/master
 *
 * @apiSuccess {Number}   level  name of level for which we need preferences.
 * @apiSuccess {Number}   Record id of selected level.
 * @apiSuccess {List}   preferences  List of preferences mapped by selected Level's bit value and level's record id.
 * 
 * 
 * @apiSuccessExample Response (example):
 *
 *{
 *  "level": "Firm",
 *  "id": null,
 *  "preferences": [
 *    {
 *      "id": null,
 *      "preferenceId": 1,
 *      "categoryType": "Dashboard",
 *      "name": "NewAccountDays",
 *      "displayName": "New Account Days",
 *      "required": null,
 *      "displayOrder": 1,
 *      "valueType": "number",
 *      "value": null,
 *      "indicatorValue": null,
 *      "isInherited": false,
 *      "inheritedValue": null,
 *      "inheritedIndicatorValue": null,
 *      "inheritedFrom": null,
 *      "inheritedFromName": null,
 *      "inheritedFromId": null,
 *      "inheritedFromValueId": null,
 *      "options": [],
 *      "selectedOptions": [],
 *      "inheritedSelectedOptions": [],
 *      "indicatorOptions": [],
 *      "componentType": "default",
 *      "componentName": "Textbox",
 *      "minlength": null,
 *      "maxlength": null,
 *      "minValue": null,
 *      "maxValue": null,
 *      "pattern": null,
 *      "watermarkText": null,
 *      "symbol": null,
 *      "helpText": "Dashboard to determine what accounts are considered new"
 *    },
 *     {
 *      "id": null,
 *      "preferenceId": 71,
 *      "categoryType": "Rebalance",
 *      "name": "CashNeedTaxSensitivitySettings",
 *      "displayName": "Cash Need Tax Sensitivity Settings",
 *      "required": null,
 *      "displayOrder": 68,
 *      "valueType": "List",
 *      "value": null,
 *      "indicatorValue": null,
 *      "isInherited": false,
 *      "inheritedValue": null,
 *      "inheritedIndicatorValue": null,
 *      "inheritedFrom": null,
 *      "inheritedFromName": null,
 *      "inheritedFromId": null,
 *      "inheritedFromValueId": null,
 *      "options": [
 *        {
 *          "id": 28,
 *          "name": "Off",
 *          "order": 1
 *        },
 *        {
 *          "id": 29,
 *          "name": "Low",
 *          "order": 2
 *        },
 *        {
 *          "id": 30,
 *          "name": "Medium",
 *          "order": 3
 *        },
 *        {
 *          "id": 31,
 *          "name": "High",
 *          "order": 4
 *        }
 *      ],
 *      "selectedOptions": [],
 *      "inheritedSelectedOptions": [],
 *      "indicatorOptions": [],
 *      "componentType": "default",
 *      "componentName": "Dropdown",
 *      "minlength": null,
 *      "maxlength": null,
 *      "minValue": null,
 *      "maxValue": null,
 *      "pattern": null,
 *      "watermarkText": "list",
 *      "symbol": null,
 *      "helpText": "Off, Low, Medium, High, (used by raise cash and cash need trade applications)."
 *    },
 *    .............
 *    ]
 *    }
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */

app.get('/:levelName/master', function(req, res) {
    logger.info("Get preferences mater list for corresponding selected level request received");
    if (req.params.levelName == undefined) {
        logger.error("Get preferences list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }
    var levelName = req.params.levelName;
    //    var recordId = parseInt(req.params.recordId);

    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: null,
        levelBitValue: null
    };

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data
    var start = new Date().getTime();
    preferenceService.listPreferencesByLevelForMassUpdate(req.data, function(err, status, preferences) {
        var end = new Date().getTime();
        var time = end - start;
        logger.info("Get preferences list for corresponding selected level response genereted.");
        logger.debug("############################   Request completed in (ms) : " + time);
        return response(err, status, preferences, res);
    });

});

/**
 * @api {get} /preference/:levelName/:recordId  List Preferences
 * @apiName ListPreferences
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will provide list of preferences for provided Level's name (:levelName) and Level's record id (:recordId) e.g levelId 2 Custodian and then recordId will be selected custodian's unique id 
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/1
 *
 * @apiSuccess {Number}   level  name of level for which we need preferences.
 * @apiSuccess {Number}   Record id of selected level.
 * @apiSuccess {List}   preferences  List of preferences mapped by selected Level's bit value and level's record id.
 * 
 * 
 * @apiSuccessExample Response (example):
 *
 *{
 *  "level": "Team",
 *  "id": 1,
 *  "preferences": [
 *    {
 *      "id": null,
 *      "preferenceId": 6,
 *      "categoryType": "Data Import",
 *      "name": "CommunityUpdatesAutoRebalance",
 *      "displayName": "Community Updates Auto Rebalance",
 *      "required": null,
 *      "displayOrder": 6,
 *      "valueType": "Boolean",
 *      "value": null,
 *      "indicatorValue": null,
 *      "isInherited": true,
 *      "inheritedValue": false,
 *      "inheritedIndicatorValue": null,
 *      "inheritedFrom": 'default',
 *      "inheritedFromName": null,
 *      "inheritedFromId": null,
 *      "inheritedFromValueId": null,
 *      "options": [],
 *      "selectedOptions": [],
 *      "inheritedSelectedOptions": [],
 *      "indicatorOptions": [],
 *      "componentType": "default",
 *      "componentName": "Checkbox",
 *      "minlength": null,
 *      "maxlength": null,
 *      "minValue": null,
 *      "maxValue": null,
 *      "pattern": null,
 *      "watermarkText": null,
 *      "symbol": null,
 *      "helpText": "If community model updates will trigger an auto rebalance for all portfolios assigned to the subscribed model."
 *    },
 *    {
 *      "id": null,
 *      "preferenceId": 23,
 *      "categoryType": "Rebalance",
 *      "name": "CashNeedsRebalanceGoal",
 *      "displayName": "Cash Needs Rebalance Goal",
 *      "required": null,
 *      "displayOrder": 23,
 *      "valueType": "List",
 *      "value": null,
 *      "indicatorValue": null,
 *      "isInherited": true,
 *      "inheritedValue": null,
 *      "inheritedIndicatorValue": null,
 *      "inheritedFrom": 'default',
 *      "inheritedFromName": null,
 *      "inheritedFromId": null,
 *      "inheritedFromValueId": null,
 *      "options": [
 *        {
 *          "id": 74,
 *          "name": "Min",
 *          "order": 0
 *        },
 *        {
 *          "id": 75,
 *          "name": "Mid",
 *          "order": 1
 *        },
 *        {
 *          "id": 76,
 *          "name": "Max",
 *          "order": 2
 *        }
 *      ],
 *      "selectedOptions": [],
 *      "inheritedSelectedOptions": [
 *        {
 *          "id": 74,
 *          "name": "Min",
 *          "order": 0
 *        }],
 *      "indicatorOptions": [],
 *      "componentType": "default",
 *      "componentName": "Dropdown",
 *      "minlength": null,
 *      "maxlength": null,
 *      "minValue": null,
 *      "maxValue": null,
 *      "pattern": null,
 *      "watermarkText": null,
 *      "symbol": null,
 *      "helpText": "User selects min, mid or max for the cash needs rebalance. This tell our system when doing a cash need trade which cash buffer does the user want to raise for cash., ***this is ignored during an actual rebalance when cash is out of tolerance and we always rebalance to the mid."
 *    },
 *    ........
 *    ]
 *    }
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */

app.get('/:levelName/:recordId', function(req, res) {
    logger.info("Get preferences list for corresponding selected level request received");    
    if (req.params.levelName == undefined || req.params.recordId == undefined || isNaN(req.params.recordId)) {
        logger.error("Get preferences list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }
    var levelName = req.params.levelName;

    try {
        var recordId = parseInt(req.params.recordId);
    } catch (err) {
        logger.error("Error while parsing record Id  : invalid or incomplete  parameter.\n " + err);
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        levelBitValue: null
    };

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data
    var start = new Date().getTime();
    preferenceService.listPreferencesByLevel(req.data, function(err, status, preferences) {
        var end = new Date().getTime();
        var time = end - start;
        logger.info("Get preferences list for corresponding selected level response genereted.");
        logger.debug("*******#########   Request completed in (ms) : " + time);
        return response(err, status, preferences, res);
    });

});


/**
 * @api {get} /preference/summary  Get Preference Summary
 * @apiName PreferenceSummary
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will provide count of preferences (Total, Edited Today and Edited In Week). 
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/summary
 *
 *@apiSuccess {Number}   PreferenceTotal  Total no. of preferences.
 *@apiSuccess {Number}   PreferenceEditedToday Total no. of preferences edited today.
 *@apiSuccess {Number}   PreferenceEditedInWeek  Total no. of preferences edited in week.
 *
 * 
 * 
 * @apiSuccessExample Response (example):
 *{
 *  "PreferenceTotal": 29,
 *  "PreferenceEditedToday": 0,
 *  "PreferenceEditedInWeek": 3
 *}
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/summary', function(req, res) {
    logger.info("Get preference summary request received");
    preferenceService.getPreferenceDashboardSummary(req.data, function(err, status, levels) {
        logger.info("Get preference summary response generated.");
        return response(err, status, levels, res);
    });
});

/**
 * @api {get} /preference/:levelName/locationOptimization/:locationPreferenceId/master  Get Location Optimization Setting Master Data
 * @apiName GetLocationOptimizationSettingMasterData
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This APIA will return master JSON structure for Location Optimization custom preference.
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/locationOptimization/87/master
 *
 * @apiParam {String}  level	Name of level for which preferences are going to update.
 * @apiParam {Number}  id	Record id for which we are going to update preferences.
 * @apiParam {List}  defaulttPreferences	List of all default preference.
 * 
 * 
 * @apiSuccessExample Response (example):
 *
 *{
 *  "level": "Firm",
 *  "recordId": null,
 *  "id": null,
 *  "preferenceId": 87,
 *  "componentType": "custom",
 *  "componentName": "LocationOptimizationDataGrid",
 *  "subClasses": [],
 *  "inheritedFromValueId": null,
 *  "inheritedSubClasses": []
 *}
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/:levelName/locationOptimization/:locationPreferenceId/master', function(req, res) {
    logger.debug("Get location Optimization for corresponding selected level and id request received");

    if (req.params.levelName == undefined || req.params.locationPreferenceId == undefined || isNaN(req.params.locationPreferenceId)) {
        logger.error("Get master location preference list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;
    var recordId = null;
    var locationOptimizationPreferenceId = parseInt(req.params.locationPreferenceId);
    var preferenceValueId = null;
    var inheritedPreferenceValueId = null

    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        locationOptimizationPreferenceId: locationOptimizationPreferenceId,
        levelBitValue: null,
        preferenceValueId: preferenceValueId,
        inheritedPreferenceValueId: inheritedPreferenceValueId
    };

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.getLocationOptimizationSetting(req.data, function(err, status, locationSettingObj) {
        return response(err, status, locationSettingObj, res);
    });

});

/**
 * @api {get} /preference/:levelName/securityPreference/:securityPreferenceId/master  Get Security Setting Master Data
 * @apiName GetSecuritySettingMasterData
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This APIA will return master JSON structure for Location Optimization custom preference.
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/securityPreference/103/master
 *
 * @apiParam {String}  levelName	Name of level.
 * @apiParam {Number}  recordId	Record id for which we get preference.
 * @apiParam {Number}  id	Preference value id if prefernces already updated.
 * @apiParam {Number}  preferenceId	Prefererence id in DB table.
 * @apiParam {List}  securityPreferences	List of securities for security preferences.
 * @apiParam {List}  inheritedSecurityPreferences	List of inherited securities for security preferences.
 * 
 * 
 * @apiSuccessExample Response (example):
 *
 *{
 *  "levelName": "Firm",
 *  "recordId": null,
 *  "id": null,
 *  "preferenceId": 103,
 *  "name": "SecuritySetting",
 *  "displayName": "Security Setting",
 *  "categoryType": "Security Setting",
 *  "componentType": "custom",
 *  "componentName": "SecurityDataGrid",
 *  "securityPreferences": [],
 *  "inheritedSecurityPreferences": []
 *}
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/:levelName/securityPreference/:securityPreferenceId/master', function(req, res) {
    logger.debug("Get location Optimization for corresponding selected level and id request received");

    if (req.params.levelName == undefined || req.params.securityPreferenceId == undefined || isNaN(req.params.securityPreferenceId)) {
        logger.error("Get master location preference list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;
    var recordId = null;
    var securityPreferenceId = parseInt(req.params.securityPreferenceId);
    var preferenceValueId = null;
    var inheritedPreferenceValueId = null

    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        securityPreferenceId: securityPreferenceId,
        levelBitValue: null,
        preferenceValueId: preferenceValueId,
        inheritedPreferenceValueId: inheritedPreferenceValueId
    };



    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.getMasterSecurityPreferences(req.data, function(err, status, locationSettingObj) {
        return response(err, status, locationSettingObj, res);
    });

});

/**
 * @api {get} /preference/:levelName/locationOptimization/:recordId/:locationPreferenceId/:preferenceValueId/:inheritedPreferenceValueId  Get Location Optimization Setting
 * @apiName GetLocationOptimizationSetting
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will provide location optimization preference values for provided Level's name (:levelName) and Level's record id (:recordId). Value will be accessed using  :preferenceValueId and :inheritedPreferenceValueId. So :locationPreferenceId does not play any role in selecting value for location optimization.
 *  :preferenceValueId and :inheritedPreferenceValueId are optional. If you pass both ids null ( :preferenceValueId and :inheritedPreferenceValueId) then it will return only master data without values.
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/locationOptimization/1/87/2550/null(Optional)
 *
 * @apiParam {String}  levelName	Name of level.
 * @apiParam {Number}  recordId	Record id for which we get preference.
 * @apiParam {Number}  id	Preference value id if prefernces already updated.
 * @apiParam {Number}  preferenceId	Prefererence id in DB table.
 * @apiParam {List}  subClasses	List of subClasses for location Optimization Preference.
 * @apiParam {List}  inheritedSubClasses	List of inheritedSubClasses for location Optimization Preference.
 * 
 * 
 * @apiSuccessExample Response (example):
 *
 *{
 *  "level": "Firm",
 *  "recordId": 1,
 *  "id": 1,
 *  "preferenceId": 87,
 *  "componentType": null,
 *  "componentName": "LocationOptimizationDataGrid",
 *  "subClasses": [
 *    {
 *      "id": 2417,
 *      "name": "Asset Sub Class 2417",
 *      "buySetting": {
 *        "T": 1,
 *        "TD": 1,
 *        "TE": 4
 *      },
 *      "sellSetting": {
 *        "T": 4,
 *        "TD": 4,
 *        "TE": 3
 *      }
 *    },
 *    {
 *      "id": 2418,
 *      "name": "Asset Sub Class 2418",
 *      "buySetting": {
 *        "T": 2,
 *        "TD": 2,
 *        "TE": 2
 *      },
 *      "sellSetting": {
 *        "T": 2,
 *        "TD": 2,
 *        "TE": 2
 *      }
 *    },
 *    {
 *      "id": 2419,
 *      "name": "Asset Sub Class 2419",
 *      "buySetting": {
 *        "T": 1,
 *        "TD": 1,
 *        "TE": 1
 *      },
 *      "sellSetting": {
 *        "T": 3,
 *        "TD": 3,
 *        "TE": 3
 *      }
 *    }
 *  ],
 *  "inheritedFromValueId": null,
 *  "inheritedSubClasses": []
 *}
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */

app.get('/:levelName/locationOptimization/:recordId/:locationPreferenceId/:preferenceValueId?/:inheritedPreferenceValueId?', function(req, res) {
    logger.info("Get location Optimization for corresponding selected level and id request received");

    if (req.params.levelName == undefined || req.params.recordId == undefined || isNaN(req.params.recordId) ||
        req.params.locationPreferenceId == undefined || isNaN(req.params.locationPreferenceId)) {
        logger.error("Get preferences list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;
    var recordId = parseInt(req.params.recordId);
    var locationOptimizationPreferenceId = parseInt(req.params.locationPreferenceId);
    var preferenceValueId = null;
    var inheritedPreferenceValueId = null

    if (req.params.preferenceValueId != undefined && req.params.preferenceValueId != null && req.params.preferenceValueId != 'null' &&
        (!isNaN(req.params.preferenceValueId))) {
        preferenceValueId = parseInt(req.params.preferenceValueId);
    }

    if (req.params.inheritedPreferenceValueId != undefined && req.params.inheritedPreferenceValueId != null && req.params.inheritedPreferenceValueId != 'null' &&
        (!isNaN(req.params.inheritedPreferenceValueId))) {
        inheritedPreferenceValueId = parseInt(req.params.inheritedPreferenceValueId);
    }

    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        locationOptimizationPreferenceId: locationOptimizationPreferenceId,
        levelBitValue: null,
        preferenceValueId: preferenceValueId,
        inheritedPreferenceValueId: inheritedPreferenceValueId
    };

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.getLocationOptimizationSetting(req.data, function(err, status, locationSettingObj) {
        return response(err, status, locationSettingObj, res);
    });

});

/**
 * @api {get} /preference/:levelName/communityStrategist/:communityStrategistPreferenceId/master  Get Community Strategist Preference Master
 * @apiName GetCommunityStrategist Preference Master
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will return master JSON data for Community Strategist preference.
 *
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Team/communityStrategist/7/master
 *
 * 
 * 
 * @apiSuccessExample Response (example):
 *
 *{
 *  "level": "Firm",
 *  "recordId": null,
 *  "id": null,
 *  "preferenceId": 7,
 *  "componentType": null,
 *  "componentName": "CommunityStrategistEnabledListCascadingControl",
 *  "strategists": {
 *    "strategistIds": null,
 *    "modelAccessLevel": null,
 *    "communityModels": null
 *  },
 *  "inheritedFromValueId": null,
 *  "inheritedStrategists": {
 *    "strategistIds": null,
 *    "modelAccessLevel": null,
 *    "communityModels": null
 *  }
 *}
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/:levelName/communityStrategist/:communityStrategistPreferenceId/master', function(req, res) {
    logger.info("Get community settings for corresponding selected level and id request received");

    if (req.params.levelName == undefined || req.params.communityStrategistPreferenceId == undefined || isNaN(req.params.communityStrategistPreferenceId)) {
        logger.error("Get preferences list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;
    var recordId = null;
    var communityStrategistPreferenceId = parseInt(req.params.communityStrategistPreferenceId);
    var preferenceValueId = null;
    var inheritedPreferenceValueId = null

    logger.debug("URL parameters received \n PrefValueId : " + preferenceValueId + " \n inheritedPrefValueId :" + inheritedPreferenceValueId);

    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        communityStrategistPreferenceId: communityStrategistPreferenceId,
        levelBitValue: null,
        preferenceValueId: preferenceValueId,
        inheritedPreferenceValueId: inheritedPreferenceValueId
    };

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data
    req.data.preferenceUpdateCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.getMasterCommunityStrategistSetting(req.data, function(err, status, communityStrategistObj) {
        return response(err, status, communityStrategistObj, res);
    });

});

/**
 * @api {get} /preference/:levelName/communityStrategist/:recordId/:communityStrategistPreferenceId/:preferenceValueId/:inheritedPreferenceValueId  Get Community Strategist Preference
 * @apiName GetCommunityStrategistPreference
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will provide community strategist preference values for provided Level's name (:levelName) and Level's record id (:recordId). Value will be accessed using  :preferenceValueId and :inheritedPreferenceValueId. So :communityStrategistPreferenceId does not play any role in selecting value for community strategist.
 *  :preferenceValueId and :inheritedPreferenceValueId are optional. If you pass both ids null ( :preferenceValueId and :inheritedPreferenceValueId) then it will return only master data without values.
 *
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Frim/communityStrategist/1/7/2/null
 *
 * @apiSuccess {Number}   level  name of level for which we need preferences.
 * @apiSuccess {Number}   recordId id of selected level.
 * @apiSuccess {Number}   preferenceId  strategist setting master preference id from DB.
 * @apiSuccess {Number}   recordId id of selected level.
 * @apiSuccess {List}   preferences  List of preferences mapped by selected Level's bit value and level's record id.
 * 
 * 
 * @apiSuccessExample Response (example):
 *
 *{
 *  "level": "Firm",
 *  "recordId": 3,
 *  "id": 2,
 *  "preferenceId": 7,
 *  "componentType": null,
 *  "componentName": "CommunityStrategistEnabledListCascadingControl",
 *  "strategists": {
 *    "strategistIds": [
 *      2,
 *      1
 *    ],
 *    "modelAccessLevel": 2,
 *    "communityModels": [
 *      7,
 *      10
 *    ]
 *  },
 *  "inheritedFromValueId": null,
 *  "inheritedStrategists": {
 *    "strategistIds": null,
 *    "modelAccessLevel": null,
 *    "communityModels": null
 *  }
 *}
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/:levelName/communityStrategist/:recordId/:communityStrategistPreferenceId/:preferenceValueId?/:inheritedPreferenceValueId?', function(req, res) {
    logger.info("Get community settings for corresponding selected level and id request received");

    if (req.params.levelName == undefined || req.params.recordId == undefined || isNaN(req.params.recordId) ||
        req.params.communityStrategistPreferenceId == undefined || isNaN(req.params.communityStrategistPreferenceId)) {
        logger.error("Get preferences list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;
    var recordId = parseInt(req.params.recordId);
    var communityStrategistPreferenceId = parseInt(req.params.communityStrategistPreferenceId);
    var preferenceValueId = null;
    var inheritedPreferenceValueId = null

    if (req.params.preferenceValueId != undefined && req.params.preferenceValueId != null && req.params.preferenceValueId != 'null' &&
        (!isNaN(req.params.preferenceValueId))) {
        preferenceValueId = parseInt(req.params.preferenceValueId);
    }

    if (req.params.inheritedPreferenceValueId != undefined && req.params.inheritedPreferenceValueId != null && req.params.inheritedPreferenceValueId != 'null' &&
        (!isNaN(req.params.inheritedPreferenceValueId))) {
        inheritedPreferenceValueId = parseInt(req.params.inheritedPreferenceValueId);
    }


    logger.debug("URL parameters received \n PrefValueId : " + preferenceValueId + " \n inheritedPrefValueId :" + inheritedPreferenceValueId);

    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        communityStrategistPreferenceId: communityStrategistPreferenceId,
        levelBitValue: null,
        preferenceValueId: preferenceValueId,
        inheritedPreferenceValueId: inheritedPreferenceValueId
    };

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data
    req.data.preferenceUpdateCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.getCommunityStrategistSetting(req.data, function(err, status, communityStrategistObj) {
        return response(err, status, communityStrategistObj, res);
    });

});


/**
 * @api {get} /preference/:levelName/securityPreference/:recordId/:securityPreferenceId/:preferenceValueId/:inheritedPreferenceValueId  Get Security Preferences
 * @apiName GetSecurityPreferences
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will provide security setting preferences values for provided Level's name (:levelName) and Level's record id (:recordId). Value will be accessed using  :preferenceValueId. So :securityPreferenceId does not play any role in selecting value for security Prreferences.
 *  :preferenceValueId. If you pass both ids null ( :preferenceValueId) then it will return only master data without values.
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/securityPreference/3/103/2/null
 *
 * @apiParam {String}  level	Name of level for which preferences are going to update.
 * @apiParam {Number}  id	Record id for which we are going to update preferences.
 * @apiParam {List}  securityPreferences	List of all securities preferences.
 * @apiParam {List}  inheritedSecurityPreferences	List of all inherited securities preferences. 
 * 
 * @apiSuccessExample Response (example):
 *
 {
  "levelName": "Firm",
  "recordId": 3,
  "id": 2590,
  "preferenceId": 103,
  "name": "SecuritySetting",
  "displayName": "Security Setting",
  "categoryType": "Security Setting",
  "componentType": "custom",
  "componentName": "SecurityDataGrid",
  "securityPreferences": [
    {
      "id": 14612,
      "securityName": "Agilent Technologies Inc",
      "securityType": "MUTUAL FUND",
      "symbol": " ty",
      "custodianSecuritySymbolId": 18,
      "buyTradeMaxAmtBySecurity": 1,
      "buyTradeMaxPctBySecurity": 1,
      "buyTradeMinAmtBySecurity": 1,
      "buyTradeMinPctBySecurity": 0,
      "buyTransactionFee": null,
      "capGainReinvestTaxable": true,
      "capGainsReinvestTaxDef": false,
      "capGainsReinvestTaxExempt": true,
      "custodianRedemptionDays": null,
      "custodianRedemptionFeeAmount": null,
      "custodianRedemptionFeeTypeId": null,
      "excludeHolding": null,
      "redemptionDays": null,
      "redemptionFeeAmount": null,
      "redemptionFeeTypeId": null,
      "sellTradeMaxAmtBySecurity": 1,
      "sellTradeMaxPctBySecurity": 0,
      "sellTradeMinAmtBySecurity": 1,
      "sellTradeMinPctBySecurity": 1,
      "sellTransactionFee": null,
      "buyPriority": 1,
 	    "sellPriority": 3,   
      "taxableAlternate": {
                "id": 1,
                "name": "Yahoo"
       },
      "taxableDivReInvest": true,
      "taxDefDivReinvest": true,
      "taxDeferredAlternate": {
                "id": 1,
                "name": "Yahoo"
       },
      "taxExemptAlternate": {
                "id": 1,
                "name": "Yahoo"
       },
      "taxExemptDivReinvest": true
    }
  ],
  "inheritedSecurityPreferences": [
    {
      "id": 14612,
      "securityName": "Agilent Technologies Inc",
      "securityType": "MUTUAL FUND",
      "symbol": " ty",
      "custodianSecuritySymbolId": 18,
      "buyTradeMaxAmtBySecurity": null,
      "buyTradeMaxPctBySecurity": null,
      "buyTradeMinAmtBySecurity": null,
      "buyTradeMinPctBySecurity": null,
      "buyTransactionFee": null,
      "capGainReinvestTaxable": null,
      "capGainsReinvestTaxDef": null,
      "capGainsReinvestTaxExempt": null,
      "custodianRedemptionDays": null,
      "custodianRedemptionFeeAmount": null,
      "custodianRedemptionFeeTypeId": null,
      "excludeHolding": null,
      "redemptionDays": null,
      "redemptionFeeAmount": null,
      "redemptionFeeTypeId": null,
      "sellTradeMaxAmtBySecurity": null,
      "sellTradeMaxPctBySecurity": null,
      "sellTradeMinAmtBySecurity": null,
      "sellTradeMinPctBySecurity": null,
      "sellTransactionFee": null,
      "buyPriority": 2,
 	    "sellPriority": 1,
      "taxableAlternate": null,
      "taxableDivReInvest": null,
      "taxDefDivReinvest": null,
      "taxDeferredAlternate": null,
      "taxExemptAlternate": null,
      "taxExemptDivReinvest": null
    }
  ]
}
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/:levelName/securityPreference/:recordId/:securityPreferenceId/:preferenceValueId?/:inheritedPreferenceValueId?', function(req, res) {
    logger.info("Get security settings for corresponding selected level and id request received");

    if (req.params.levelName == undefined || req.params.recordId == undefined || isNaN(req.params.recordId) ||
        req.params.securityPreferenceId == undefined || isNaN(req.params.securityPreferenceId)) {
        logger.error("Get preferences list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;
    var recordId = parseInt(req.params.recordId);
    var securityPreferenceId = parseInt(req.params.securityPreferenceId);
    var preferenceValueId = null;
    var inheritedPreferenceValueId = null;

    if (req.params.preferenceValueId != undefined && req.params.preferenceValueId != null && req.params.preferenceValueId != 'null' &&
        (!isNaN(req.params.preferenceValueId))) {
        preferenceValueId = parseInt(req.params.preferenceValueId);
    }

    //    if (req.params.inheritedPreferenceValueId != undefined && req.params.inheritedPreferenceValueId != null && req.params.inheritedPreferenceValueId != 'null' &&
    //        (!isNaN(req.params.inheritedPreferenceValueId))) {
    //        inheritedPreferenceValueId = parseInt(req.params.inheritedPreferenceValueId);
    //    }


    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        securityPreferenceId: securityPreferenceId,
        levelBitValue: null,
        preferenceValueId: preferenceValueId,
    };

    if (preferencesFetchCriteria.preferenceValueId == null) {
        preferencesFetchCriteria.preferenceValueId = inheritedPreferenceValueId;
    }

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.getSecurityPreferences(req.data, function(err, status, locationSettingObj) {
        return response(err, status, locationSettingObj, res);
    });

});

/**
 * @api {get} /preference/:levelName/redemptionfeesetting/:recordId/:redemptionFeePreferenceId/:preferenceValueId/:inheritedPreferenceValueId  Get Redemption Fee Preference
 * @apiName GetRedemptionFeePreference
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will return redemption fee preference grid.
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/redemptionfeesetting/3/103/2/null
 *
 * @apiParam {String}  level	Name of level for which preferences are going to update.
 * @apiParam {Number}  id	Record id for which we are going to update preferences.
 * @apiParam {List}  redemptionFeePreferences	List of all existing redemption fee preferences.
 * @apiParam {List}  inheritedRedemptionFeePreferences	List of all inherited  existing redemption fee preferences. 
 * 
 * @apiSuccessExample Response (JSON in case of regular RedemptionFeeSetting):
 *
{
     "levelName": "Firm",
     "recordId": < recordID > ,
     "id": < PrefValueId > ,
     "preferenceId": 111,
     "name": "redemptionFeeSetting",
     "displayName": "Redemption Fee Setting",
     "categoryType": "Rebalance",
     "componentType": "custom",
     "componentName": "RedemptionFeeGrid",
     "redemptionPreference": [{
         "id": < redemptionFeeValueId > ,
         "securityTypeId": < securityTypeId(Number) > ,
         "redemptionFeeType": < $ / % > ,
         "redemptionFeeAmount": < amount(Decimal) > ,
         "redemptionFeeDays": < Days(Number) >
     }, {
         "id": < redemptionFeeValueId > ,
         "securityTypeId": < securityTypeId(Number) > ,
         "redemptionFeeType": < $ / % > ,
         "redemptionFeeAmount": < amount(Decimal) > ,
         "redemptionFeeDays": < Days(Number) >
     }],
     "inheritedRedemptionPreference": [{
         "id": < redemptionFeeValueId > ,
         "securityTypeId": < securityTypeId(Number) > ,
         "redemptionFeeType": < $ / % > ,
         "redemptionFeeAmount": < amount(Decimal) > ,
         "redemptionFeeDays": < Days(Number) >
     }]
 }
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/:levelName/redemptionfeesetting/:recordId/:redemptionFeePreferenceId/:preferenceValueId?/:inheritedPreferenceValueId?', function(req, res) {
    logger.info("Get redemption fee settings for corresponding selected level and id request received");

    if (req.params.levelName == undefined || req.params.recordId == undefined || isNaN(req.params.recordId) ||
        req.params.redemptionFeePreferenceId == undefined || isNaN(req.params.redemptionFeePreferenceId)) {
        logger.error("Get preferences list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;
    var recordId = parseInt(req.params.recordId);
    var redemptionFeePreferenceId = parseInt(req.params.redemptionFeePreferenceId);
    var preferenceValueId = null;
    var inheritedPreferenceValueId = null;

    if (req.params.preferenceValueId != undefined && req.params.preferenceValueId != null && req.params.preferenceValueId != 'null' &&
        (!isNaN(req.params.preferenceValueId))) {
        preferenceValueId = parseInt(req.params.preferenceValueId);
    }


    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        redemptionFeePreferenceId: redemptionFeePreferenceId,
        levelBitValue: null,
        preferenceValueId: preferenceValueId,
    };

    if (preferencesFetchCriteria.preferenceValueId == null) {
        preferencesFetchCriteria.preferenceValueId = inheritedPreferenceValueId;
    }

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.getRedemptionFeePreference(req.data, function(err, status, redemptionSettingObj) {
        return response(err, status, redemptionSettingObj, res);
    });

});

/**
 * @api {get} /preference/:levelName/custodianredemptionfeesetting/:recordId/:custodianRedemptionFeePreferenceId/:preferenceValueId/:inheritedPreferenceValueId  Get Custodian Specific Redemption Fee Preference
 * @apiName GetCustodianSpecificRedemptionFeePreference
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API will return redemption fee preference grid.
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Firm/custodianredemptionfeesetting/3/103/2/null
 *
 * @apiParam {String}  level	Name of level for which preferences are going to update.
 * @apiParam {Number}  id	Record id for which we are going to update preferences.
 * @apiParam {List}  redemptionFeePreferences	List of all existing redemption fee preferences.
 * @apiParam {List}  inheritedRedemptionFeePreferences	List of all inherited  existing redemption fee preferences. 
 * 
 * @apiSuccessExample Response (JSON in case of custodian specific RedemptionFeeSetting):
 *
{
     "levelName": "Custodian",
     "recordId": < recordID > ,
     "id": < PrefValueId > ,
     "preferenceId": 112,
     "name": "custodianSpecificRedemptionFeeSetting",
     "displayName": "Custodian Specific Redemption Fee Setting",
     "categoryType": "Rebalance",
     "componentType": "custom",
     "componentName": "RedemptionFeeGrid",
     "redemptionPreference": [{
         "id": < redemptionFeeValueId > ,
         "securityTypeId": < securityTypeId(Number) > ,
         "redemptionFeeType": < $ / % > ,
         "redemptionFeeAmount": < amount(Decimal) > ,
         "redemptionFeeDays": < Days(Number) >
     }, {
         "id": < redemptionFeeValueId > ,
         "securityTypeId": < securityTypeId(Number) > ,
         "redemptionFeeType": < $ / % > ,
         "redemptionFeeAmount": < amount(Decimal) > ,
         "redemptionFeeDays": < Days(Number) >
     }],
     "inheritedRedemptionPreference": [{
         "id": < redemptionFeeValueId > ,
         "securityTypeId": < securityTypeId(Number) > ,
         "redemptionFeeType": < $ / % > ,
         "redemptionFeeAmount": < amount(Decimal) > ,
         "redemptionFeeDays": < Days(Number) >
     }]
 } 
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 */
app.get('/:levelName/custodianredemptionfeesetting/:recordId/:custodianRedemptionFeePreferenceId/:preferenceValueId?/:inheritedPreferenceValueId?', function(req, res) {
    logger.info("Get redemption fee settings for corresponding selected level and id request received");

    if (req.params.levelName == undefined || req.params.recordId == undefined || isNaN(req.params.recordId) ||
        req.params.custodianRedemptionFeePreferenceId == undefined || isNaN(req.params.custodianRedemptionFeePreferenceId)) {
        logger.error("Get preferences list errro : invalid or incomplete query parameter.")
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var levelName = req.params.levelName;
    var recordId = parseInt(req.params.recordId);
    var custodianRedemptionFeePreferenceId = parseInt(req.params.custodianRedemptionFeePreferenceId);
    var preferenceValueId = null;
    var inheritedPreferenceValueId = null;

    if (req.params.preferenceValueId != undefined && req.params.preferenceValueId != null && req.params.preferenceValueId != 'null' &&
        (!isNaN(req.params.preferenceValueId))) {
        preferenceValueId = parseInt(req.params.preferenceValueId);
    }


    var preferencesFetchCriteria = {
        levelName: levelName,
        recordId: recordId,
        custodianRedemptionFeePreferenceId: custodianRedemptionFeePreferenceId,
        levelBitValue: null,
        preferenceValueId: preferenceValueId,
    };

    if (preferencesFetchCriteria.preferenceValueId == null) {
        preferencesFetchCriteria.preferenceValueId = inheritedPreferenceValueId;
    }

    req.data.preferencesFetchCriteria = preferencesFetchCriteria; // putting fetch condition/criteria in request data

    preferenceService.getCustodianRedemptionFeePreference(req.data, function(err, status, redemptionSettingObj) {
        return response(err, status, redemptionSettingObj, res);
    });

});

/**
 * @api {put} /preference/updateAll  Update All Preferences
 * @apiName UpdateAllPreferences
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API used to update all preferences including custom preferences for given levelName and recordId.<br>Validation :  Number or Decimal type preferences will accept 0 - 100 for percent type values and -9007199254740992 - 9007199254740992 for Amount/ Non-percent Type values. API will fail (400 - Bad Request) if any validation issue happened for preference
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/updateAll
 *
 * @apiParam {String}  level	Name of level for which preferences are going to update.
 * @apiParam {Number}  id	Record id for which we are going to update preferences.
 * @apiParam {list}  defaultPreferences	List of all default preference.
 * @apiParam {Object}  locationOptimizationPreference	Location optimization setting preference object.
 * @apiParam {Object}  communityStrategistPreference	Community strategist preference object.
 * 
 * @apiParamExample Body Param (Update all default and custom preferences):
 * 
 *{
 *    "level": "Firm",
 *    "id": 3,
 *    "ids": null,
 *    "defaultPreferences": [{
 *        "id": null,
 *        "preferenceId": 41,
 *        "valueType": "number",
 *        "componentType": "default",
 *        "componentName": "Textbox",
 *        "selectedOptions": [
 *
 *        ],
 *        "selectedIndicatorValue": "%",
 *        "value": 25
 *    }, {
 *        "id": 475,
 *        "preferenceId": 81,
 *        "valueType": "SortedList",
 *        "componentType": "custom",
 *        "componentName": "TaxLotDepletionMethodSortedlist",
 *        "selectedOptions": [{
 *            "id": 37,
 *            "name": "Long Term",
 *            "order": 4
 *        }],
 *        "value": null
 *    }],
 *    "locationOptimizationPreference": {
 *        "id": null,
 *        "preferenceId": 87,
 *        "subClasses": [{
 *            "id": 2417,
 *            "name": "311",
 *            "buySetting": {
 *                "T": 1,
 *                "TD": 1,
 *                "TE": 4
 *            },
 *            "sellSetting": {
 *                "T": 4,
 *                "TD": 4,
 *                "TE": 3
 *            }
 *        }, {
 *            "id": 2418,
 *            "name": "311",
 *            "buySetting": {
 *                "T": 2,
 *                "TD": 2,
 *                "TE": 2
 *            },
 *            "sellSetting": {
 *                "T": 2,
 *                "TD": 2,
 *                "TE": 2
 *            }
 *        }, {
 *            "id": 2419,
 *            "name": "311",
 *            "buySetting": {
 *                "T": 1,
 *                "TD": 1,
 *                "TE": 1
 *            },
 *            "sellSetting": {
 *                "T": 3,
 *                "TD": 3,
 *                "TE": 3
 *            }
 *        }]
 *    },
 *    "communityStrategistPreference": {
 *        "id": null,
 *        "preferenceId": 7,
 *        "strategists": {
 *            "strategistIds": [
 *                2,
 *                1
 *            ],
 *            "modelAccessLevel": 2,
 *            "communityModels": [
 *                7, 10
 *            ]
 *        }
 *    },
 *    "securityPreferences": {
 *        "id": 2320,
 *        "preferenceId": 103,
 *        "securities": [{
 *            "id": 14612,
 *            "securityName": "Agilent Technologies Inc",
 *            "securityType": "MUTUAL FUND",
 *            "symbol": " ty",
 *            "custodianSecuritySymbolId": 18,
 *            "buyTradeMaxAmtBySecurity": 1,
 *            "buyTradeMaxPctBySecurity": 1,
 *            "buyTradeMinAmtBySecurity": 1,
 *            "buyTradeMinPctBySecurity": 0,
 *            "buyTransactionFee": null,
 *            "capGainReinvestTaxable": true,
 *            "capGainsReinvestTaxDef": false,
 *            "capGainsReinvestTaxExempt": true,
 *            "custodianRedemptionDays": null,
 *            "custodianRedemptionFeeAmount": null,
 *            "custodianRedemptionFeeTypeId": null,
 *            "excludeHolding": null,
 *            "redemptionDays": null,
 *            "redemptionFeeAmount": null,
 *            "redemptionFeeTypeId": null,
 *            "sellTradeMaxAmtBySecurity": 1,
 *            "sellTradeMaxPctBySecurity": 0,
 *            "sellTradeMinAmtBySecurity": 1,
 *            "sellTradeMinPctBySecurity": 1,
 *            "sellTransactionFee": null,
 *            "buyPriority": 4,
*     			  "sellPriority": 2,
 *            "taxableAlternate": {
 *                "id": 1,
 *                "name": "Yahoo"
 *            },
 *            "taxableDivReInvest": true,
 *            "taxDefDivReinvest": true,
 *            "taxDeferredAlternate": {
 *                "id": 1,
 *                "name": "Yahoo"
 *            },
 *            "taxExemptAlternate": {
 *                "id": 1,
 *                "name": "Yahoo"
 *            },
 *            "taxExemptDivReinvest": true
 *        }]
 *    }
 *}
 *
 *
 * @apiParamExample Body Param (if user don't want to update any type of preference then need to pass those preference type as given.):
 *
 *  "defaultPreferences": [],
 *   OR
 *  "defaultPreferences": null,
 *  "locationOptimizationPreference": {
 *        "id": null,
 *        "preferenceId": 87,
 *         "subClasses": null
 *    }
 *   OR
 *   "locationOptimizationPreference": null,
 *  "communityStrategistPreference": {
 *        "id": null,
 *        "preferenceId": 7,
 *         "strategists": {
 *    		"strategistIds": null,
 *    		"modelAccessLevel": null,
 *    		"communityModels": null
 *   
 *   }
 *   OR
 *   "communityStrategistPreference": null,
 *   "securityPreferences": {
 *        "id": 2320,
 *        "preferenceId": 103,
 *        "securities": null
 *    }
 *    OR
 *    "securityPreferences": null
 *
 * @apiSuccess {List}   Object  List of preferences with updated values.
 * 
 * @apiSuccessExample Response (example):
 *
 *[
 *  {
 *    "id": 6,
 *    "preferenceId": 41,
 *    "categoryType": "Rebalance",
 *    "name": "ReserveCashTaxable",
 *    "displayName": "Reserve Cash -Taxable",
 *    "required": null,
 *    "displayOrder": 41,
 *    "minlength": null,
 *    "maxlength": null,
 *    "minValue": null,
 *    "maxValue": null,
 *    "pattern": null,
 *    "valueType": "Decimal",
 *    "value": "25",
 *    "indicatorValue": "%",
 *    "isInherited": false,
 *    "inheritedValue": null,
 *    "inheritedIndicatorValue": null,
 *    "inheritedFrom": null,
 *    "inheritedFromName": null,
 *    "inheritedFromId": null,
 *    "inheritedFromValueId": null,
 *    "options": [],
 *    "selectedOptions": [],
 *    "inheritedSelectedOptions": [],
 *    "indicatorOptions": [
 *      {
 *        "id": 3,
 *        "name": "$",
 *        "minValue": null,
 *        "maxValue": null
 *      },
 *      {
 *        "id": 4,
 *        "name": "%",
 *        "minValue": 0,
 *        "maxValue": 100
 *      }
 *    ],
 *    "componentType": "default",
 *    "componentName": "Textbox",
 *    "helpText": "Need to allow a negative dollar amount for margin",
 *    "watermarkText": null,
 *    "symbol": null
 *  },
 *  {
 *    "id": 3,
 *    "preferenceId": 103,
 *    "categoryType": "Security Setting",
 *    "name": "SecuritySetting",
 *    "displayName": "Security Setting",
 *    "required": null,
 *    "displayOrder": 103,
 *    "minlength": null,
 *    "maxlength": null,
 *    "minValue": null,
 *    "maxValue": null,
 *    "pattern": null,
 *    "valueType": "Security Setting",
 *    "value": null,
 *    "indicatorValue": null,
 *    "isInherited": false,
 *    "inheritedValue": null,
 *    "inheritedIndicatorValue": null,
 *    "inheritedFrom": null,
 *    "inheritedFromName": null,
 *    "inheritedFromId": null,
 *    "inheritedFromValueId": null,
 *    "options": [],
 *    "selectedOptions": [],
 *    "inheritedSelectedOptions": [],
 *    "indicatorOptions": [],
 *    "componentType": "custom",
 *    "componentName": "SecurityDataGrid",
 *    "helpText": null,
 *    "watermarkText": null,
 *    "symbol": null
 *  },
 *  {
 *    "id": 1,
 *    "preferenceId": 87,
 *    "categoryType": "Rebalance",
 *    "name": "LocationOptimization",
 *    "displayName": "Location Optimization",
 *    "required": null,
 *    "displayOrder": 84,
 *    "minlength": null,
 *    "maxlength": null,
 *    "minValue": null,
 *    "maxValue": null,
 *    "pattern": null,
 *    "valueType": "Select a SubClass, and assign a value for each acc",
 *    "value": null,
 *    "indicatorValue": null,
 *    "isInherited": false,
 *    "inheritedValue": null,
 *    "inheritedIndicatorValue": null,
 *    "inheritedFrom": null,
 *    "inheritedFromName": null,
 *    "inheritedFromId": null,
 *    "inheritedFromValueId": null,
 *    "options": [],
 *    "selectedOptions": [],
 *    "inheritedSelectedOptions": [],
 *    "indicatorOptions": [],
 *    "componentType": "custom",
 *    "componentName": "LocationOptimizationDataGrid",
 *    "helpText": "Select a SubClass, and assign a value for each account type.\r\n\r\nAssign 1,2,3 or “Never”.",
 *    "watermarkText": null,
 *    "symbol": null
 *  },
 *  {
 *    "id": 2,
 *    "preferenceId": 7,
 *    "categoryType": "Data Import",
 *    "name": "CommunityStrategistEnabledList",
 *    "displayName": "Community Strategist Enabled List",
 *    "required": null,
 *    "displayOrder": 7,
 *    "minlength": null,
 *    "maxlength": null,
 *    "minValue": null,
 *    "maxValue": null,
 *    "pattern": null,
 *    "valueType": "<custom> (could be a separate table because it is ",
 *    "value": null,
 *    "indicatorValue": null,
 *    "isInherited": false,
 *    "inheritedValue": null,
 *    "inheritedIndicatorValue": null,
 *    "inheritedFrom": null,
 *    "inheritedFromName": null,
 *    "inheritedFromId": null,
 *    "inheritedFromValueId": null,
 *    "options": [],
 *    "selectedOptions": [],
 *    "inheritedSelectedOptions": [],
 *    "indicatorOptions": [],
 *    "componentType": "custom",
 *    "componentName": "CommunityStrategistEnabledListCascadingControl",
 *    "helpText": "Allow the user to select a community strategist., , From there, say enable all the strategist models, or select individual models.This will filter the list of available community models to the user when assigning models to portfolios.",
 *    "watermarkText": "Select Strategist",
 *    "symbol": null
 *  },
 *  {
 *    "id": 5,
 *    "preferenceId": 81,
 *    "categoryType": "Rebalance",
 *    "name": "TaxLotDepletionMethod",
 *    "displayName": "Tax Lot Depletion Method",
 *    "required": null,
 *    "displayOrder": 78,
 *    "minlength": null,
 *    "maxlength": null,
 *    "minValue": null,
 *    "maxValue": null,
 *    "pattern": null,
 *    "valueType": "SortedList",
 *    "value": null,
 *    "indicatorValue": null,
 *    "isInherited": false,
 *    "inheritedValue": null,
 *    "inheritedIndicatorValue": null,
 *    "inheritedFrom": null,
 *    "inheritedFromName": null,
 *    "inheritedFromId": null,
 *    "inheritedFromValueId": null,
 *    "options": [
 *      {
 *        "id": 34,
 *        "name": "Short Term Losses",
 *        "order": 1
 *      },
 *      {
 *        "id": 35,
 *        "name": "Long Term Losses",
 *        "order": 2
 *      },
 *      {
 *        "id": 36,
 *        "name": "Short Term No Gain",
 *        "order": 3
 *      },
 *      {
 *        "id": 37,
 *        "name": "Long Term No Gain",
 *        "order": 4
 *      },
 *      {
 *        "id": 81,
 *        "name": "Long Term Gain",
 *        "order": 6
 *      },
 *      {
 *        "id": 82,
 *        "name": "Short Term Gain",
 *        "order": 5
 *      }
 *    ],
 *    "selectedOptions": [
 *      {
 *        "id": 37,
 *        "order": 4
 *      }
 *    ],
 *    "inheritedSelectedOptions": [],
 *    "indicatorOptions": [],
 *    "componentType": "custom",
 *    "componentName": "TaxLotDepletionMethodSortedlist",
 *    "helpText": "This is the default sort order, allow the user to re-sort. #1 will be the first trade lot we choose to trade, #6 will be the last choice., Short Term Losses Long Term Losses Short Term No Gain Long Term No Gain Long Term Gain Short Term Gain",
 *    "watermarkText": "Sorted List",
 *    "symbol": null
 *  }
 *]
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 *
 *     HTTP/1.1 500 BAD_REQUEST
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 */
app.put('/updateAll', [validate({
    body: updatePreferenceCombined
})], analysisMiddleware.post_import_analysis, function(req, res) {
    logger.info("Save preferences list request received");

    if (req.body.level == undefined || typeof(req.body.level) !== "string") {
        logger.error("Save preferences request error : \n Invalid or wronge level name.");
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    if (req.body.id == undefined || isNaN(req.body.id)) {
        logger.error("Save preferences request error :: \n Invalid or wronge record id.");
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var updateCriteria = {
        levelName: req.body.level,
        recordId: req.body.id,
        levelBitValue: null
    };

    req.data.preferenceUpdateCriteria = updateCriteria;
    req.data.preferencesFetchCriteria = updateCriteria;

    var start = new Date().getTime();

    logger.debug("All verified in Save Preferenes.");
    preferenceService.saveOrUpdatePreferencesAll(req.data, function(err, status, savedPreference) {
        var end = new Date().getTime();
        var time = end - start;
        logger.info("Save preferences list response genereted.");
        logger.debug("############################   Request completed in (ms) : " + time);
        return response(err, status, savedPreference, res);
    });
});

/**
 * @api {put} /preference/Action/massUpdateAll  Mass Update All Preferences
 * @apiName MassUpdateAllPreferences
 * @apiVersion 1.0.0
 * @apiGroup Preferences
 * @apiPermission appuser
 *
 * @apiDescription This API used to update all preferences including custom preferences for given levelName and recordIds.<br>Validation : Number or Decimal type preferences will accept 0 - 100 for percent type values and -9007199254740992 - 9007199254740992 for Amount/ Non-percent Type values. API will fail (400 - Bad Request) if any validation issue happened for preference
 *
 * @apiHeader {String} Authorization eclipse_access_token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJPcmlvbiIsImF1ZCI6Imh0dHA6Ly9zZXNzaW9uLm9yaW9uIiwiZXhwIjoxNDY4MDc2NDg0LjY1OSwiYWN0dWFsVXNlcklkIjozNzA5MjUsImZpcm1JZCI6OTk5LCJpYXQiOjE0NjgwNDA0ODR9.lBQdFG5kK_OC5mwyQN-CpzDo3R5L9Ww0TmOWLlOKHOk
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/preference/Action/massUpdateAll
 *
 * @apiParam {String}  level	Name of level for which preferences are going to update.
 * @apiParam {Number}  id	Record id for which we are going to update preferences.
 * @apiParam {list}  defaultPreferences	List of all default preference.
 * @apiParam {Object}  locationOptimizationPreference	Location optimization setting preference object.
 * @apiParam {Object}  communityStrategistPreference	Community strategist preference object.
 * 
 * @apiParamExample Body Param (example):
 * 
 *{
 *    "level": "Firm",
 *    "id": null,
 *    "ids": [3],
 *    "defaultPreferences": [{
 *        "id": null,
 *        "preferenceId": 41,
 *        "valueType": "number",
 *        "componentType": "default",
 *        "componentName": "Textbox",
 *        "selectedOptions": [
 *
 *        ],
 *        "selectedIndicatorValue": "%",
 *        "value": 25
 *    }, {
 *        "id": 475,
 *        "preferenceId": 81,
 *        "valueType": "SortedList",
 *        "componentType": "custom",
 *        "componentName": "TaxLotDepletionMethodSortedlist",
 *        "selectedOptions": [{
 *            "id": 37,
 *            "name": "Long Term",
 *            "order": 4
 *        }],
 *        "value": null
 *    }],
 *    "locationOptimizationPreference": {
 *        "id": null,
 *        "preferenceId": 87,
 *        "subClasses": [{
 *            "id": 2417,
 *            "name": "311",
 *            "buySetting": {
 *                "T": 1,
 *                "TD": 1,
 *                "TE": 4
 *            },
 *            "sellSetting": {
 *                "T": 4,
 *                "TD": 4,
 *                "TE": 3
 *            }
 *        }, {
 *            "id": 2418,
 *            "name": "311",
 *            "buySetting": {
 *                "T": 2,
 *                "TD": 2,
 *                "TE": 2
 *            },
 *            "sellSetting": {
 *                "T": 2,
 *                "TD": 2,
 *                "TE": 2
 *            }
 *        }, {
 *            "id": 2419,
 *            "name": "311",
 *            "buySetting": {
 *                "T": 1,
 *                "TD": 1,
 *                "TE": 1
 *            },
 *            "sellSetting": {
 *                "T": 3,
 *                "TD": 3,
 *                "TE": 3
 *            }
 *        }]
 *    },
 *    "communityStrategistPreference": {
 *        "id": null,
 *        "preferenceId": 7,
 *        "strategists": {
 *            "strategistIds": [
 *                2,
 *                1
 *            ],
 *            "modelAccessLevel": 2,
 *            "communityModels": [
 *                7, 10
 *            ]
 *        }
 *    },
 *    "securityPreferences": {
 *        "id": 2320,
 *        "preferenceId": 103,
 *        "securities": [{
 *            "id": 14612,
 *            "securityName": "Agilent Technologies Inc",
 *            "securityType": "MUTUAL FUND",
 *            "symbol": " ty",
 *            "custodianSecuritySymbolId": 18,
 *            "buyTradeMaxAmtBySecurity": 1,
 *            "buyTradeMaxPctBySecurity": 1,
 *            "buyTradeMinAmtBySecurity": 1,
 *            "buyTradeMinPctBySecurity": 0,
 *            "buyTransactionFee": null,
 *            "capGainReinvestTaxable": true,
 *            "capGainsReinvestTaxDef": false,
 *            "capGainsReinvestTaxExempt": true,
 *            "custodianRedemptionDays": null,
 *            "custodianRedemptionFeeAmount": null,
 *            "custodianRedemptionFeeTypeId": null,
 *            "excludeHolding": null,
 *            "redemptionDays": null,
 *            "redemptionFeeAmount": null,
 *            "redemptionFeeTypeId": null,
 *            "sellTradeMaxAmtBySecurity": 1,
 *            "sellTradeMaxPctBySecurity": 0,
 *            "sellTradeMinAmtBySecurity": 1,
 *            "sellTradeMinPctBySecurity": 1,
 *            "sellTransactionFee": null,
 *            "buyPriority": 1,
 *    			  "sellPriority": 5,
 *            "taxableAlternate": {
 *                "id": 1,
 *                "name": "Yahoo"
 *            },
 *            "taxableDivReInvest": true,
 *            "taxDefDivReinvest": true,
 *            "taxDeferredAlternate": {
 *                "id": 1,
 *                "name": "Yahoo"
 *            },
 *            "taxExemptAlternate": {
 *                "id": 1,
 *                "name": "Yahoo"
 *            },
 *            "taxExemptDivReinvest": true
 *        }]
 *    }
 *}
 *
 *  @apiParamExample Body Param (if user don't want to update any type of preference then need to pass those preference type as given.):
 *
 *  "defaultPreferences": [],
 *   OR
 *  "defaultPreferences": null,
 *  "locationOptimizationPreference": {
 *        "id": null,
 *        "preferenceId": 87,
 *         "subClasses": null
 *    }
 *   OR
 *   "locationOptimizationPreference": null,
 *  "communityStrategistPreference": {
 *        "id": null,
 *        "preferenceId": 7,
 *         "strategists": {
 *    		"strategistIds": null,
 *    		"modelAccessLevel": null,
 *    		"communityModels": null
 *   
 *   }
 *   OR
 *   "communityStrategistPreference": null,
 *   "securityPreferences": {
 *        "id": 2320,
 *        "preferenceId": 103,
 *        "securities": null
 *    }
 *    OR
 *    "securityPreferences": null
 *
 * @apiSuccess {List}   Object  List of preferences with updated values.
 * 
 * @apiSuccessExample Response (example):
 *
 *"Preferences updated successfully."
 *
 * @apiError UNAUTHORIZED Invalid eclipse token.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * @apiError BAD_REQUEST Invalid or wrong query parameters.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *		 "message": "Invalid Authorization Header"
 *	    }
 *
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *		 "message": "Internal Server Error"
 *	    }
 *
 *     HTTP/1.1 500 BAD_REQUEST
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 */
app.put('/Action/massUpdateAll', [validate({
    body: updatePreferenceCombined
})], function(req, res) {
    logger.info("Save preferences list request received");

    if (req.body.level == undefined || typeof(req.body.level) !== "string") {
        logger.error("Save preferences request error : \n Invalid or wronge level name.");
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    if (req.body.ids == undefined) {
        logger.error("Save preferences request error :: \n Invalid or wronge record id.");
        return response(messages.preferencesInvalidParameters, responseCodes.BAD_REQUEST, null, res);
    }

    var updateCriteria = {
        levelName: req.body.level,
        recordIds: req.body.ids,
        levelBitValue: null
    };

    req.data.preferenceUpdateCriteria = updateCriteria;
    req.data.preferencesFetchCriteria = updateCriteria;

    var start = new Date().getTime();

    logger.debug("All verified in Save Preferenes.");
    preferenceService.saveOrUpdateMassPreferencesAll(req.data, function(err, status, savedPreference) {
        var end = new Date().getTime();
        var time = end - start;
        logger.info("Save preferences list response genereted.");
        logger.debug("############################   Request completed in (ms) : " + time);
        return response(err, status, savedPreference, res);
    });
});

module.exports = app;