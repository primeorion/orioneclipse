"use strict";

var ms = require('ms');

module.exports = {

	TOKEN_EXPIRES_IN: 36000, //36000 (s)

	secret: '8ef0e36b85d9333fc4115ebac6a3f0cc',

	ERROR_MESSAGE_KEY: "message",

	methodParse: {
		GET: "canRead",
		POST: "canAdd",
		PUT: "canUpdate",
		DELETE: "canDelete"
	},
	moduleCodeForPrivileges:{
		COMMUNITY: "community"
	},

	api : {
		logIn : 'https://testapi.orionadvisor.com/api/v1/security/token',
		userDetail : 'https://testapi.orionadvisor.com/api/v1/Authorization/User',
		searchOrionUser : 'https://testapi.orionadvisor.com/api/v1//Security/Profiles/Search',
		tickerSearchAPI : 'https://testapi.orionadvisor.com/api/v1/Trading/Products/Search'
//		tickerSearchAPI : 'http://localhost:3000/connect/security'
	},

	orionApiResponseKey: {
		errorMessage: "statusMessage",
		orionAccessToken: "access_token",
		orionExpireTime: "expires_in"
	},

	/** Preference Constants  **/

	record: {
		FIRM: "Firm",
		CUSTODIAN: "Custodian",
		TEAM: "Team",
		PORTFOLIO: "Portfolio",
		MODEL: "Model",
		ACCOUNT: "Account",
		SECURITY: "Security",
		HOLDING: "Holding",
		USER: "User"
	},

	recordBitValue: {
		FIRM: 1,
		CUSTODIAN: 2,
		TEAM: 4,
		PORTFOLIO: 8,
		MODEL: 16,
		ACCOUNT: 32,
		SECURITY: 64,
		HOLDING: 128,
		USER: 256
	},

	preferenceTradeFilter: {
		TRADE_MIN: "Trade Min",
		TRADE_MAC: "Trade Min",
	},

	prefrenceValueType: {
		OPTION_LIST: "SortedList",
		LIST: "List"
	},
	
	preferenceCommonContant: {
		LOCATION_OPTIMIZATION: "Location Optimization",
		LOCATION_BUY: "Buy",
		LOCATION_SELL: "Sell"
	},
	
	orineModule: {
		Preference: 'Preferences'
	},
	
	locationOptimizationFormat: {
        id: null,
        name: null,
        buySetting: {
            T: null,
            TD: null,
            TE: null
        },
        sellSetting: {
            T: null,
            TD: null,
            TE: null
        }
    },

    preferenceType: {
    		default: 'defaultPreference',
    		location: 'locationPreference',
    		communityStrategist: 'communityStrategistPreference',
    		securityPreference: 'securityPreference'
    },

//	 api: {
//		 logIn: 'http://localhost:3000/connect/getToken/',
//		 userDetail: 'http://localhost:3000/connect/getUser/',
//		 searchOrionUser:'https://testapi.orionadvisor.com/api/v1//Security/Profiles/Search',
//		 tickerSearchAPI : 'https://testapi.orionadvisor.com/api/v1/Trading/Products/Search'
//	 },

	/**
	 * ************************** Orion Connect Token
	 * Properties************************
	 */

	token: function () {
		return {
			"iss": "Orion",
			"aud": "http://session.orion",
			"exp": Date.now() / 1000 + ms("10h") / 1000
		};
	},

	//Data Import Constant Variable

	import: {
		command: "sh /home/ETLJobs/orionETLjob18july/orionETLjobV2/orionETLjobV2_run.sh",
		contextParam: "--context_param contextDir=/home/orion_config",
		inputDirParam: '--context_param inputDir='
	},
	aws: {
		s3:{
			BucketName : "orioneclipsedata",
			BaseFolderForFirms : "Firm Data New/"
		}
	},
	template : {
		model : "templates/model/ImportModelTemplate.xlsx"
	},
	rebalanceApi:{
		rebalance : 'http://52.1.71.38:8080/rebalancer/rebalance/model'
	},
	updateModel:{
		command: "sh /home/ETLJobs/FindModelSubscribedFirms_2.4/FindModelSubscribedFirms/FindModelSubscribedFirms_run.sh"
	},
	tokenExpireMilliSec:36000
};
