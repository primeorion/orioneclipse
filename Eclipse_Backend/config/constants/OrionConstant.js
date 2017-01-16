"use strict";

var ms = require('ms');

module.exports = {

	TOKEN_EXPIRES_IN: 36000, //36000 (s)

	secret: '8ef0e36b85d9333fc4115ebac6a3f0cc',

	CONNECT_API_KEY: 'nbffertsupereyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj',

	CRYPTO_SECRET: '836cb030501f12402692009c422304141e44d2d7db55e8c13041548f02f5a98b1b049079b7a89c88dc1c34daf6e7f28eec6d83a41db072cfeddfbd7ad09f15a0',

	ERROR_MESSAGE_KEY: "message",

	methodParse: {
		GET: "canRead",
		POST: "canAdd",
		PUT: "canUpdate",
		PATCH: "canUpdate",
		DELETE: "canDelete"
	},
	moduleCodeForPrivileges:{
		COMMUNITY: "community",
		PREFERENCE: "preference",
		ADMIN: "admin",
		TEAMS:"teams",
		SECURITY: "security",
		PORTFOLIO: "portfolio",
		MODELING: "modeling",
		ACCOUNT: "account",
		UPDATEALL: "updateall",
		ACTION:"action",
		SECURITIES:"securities",
		FULLIMPORT:"fullimport",
		PREF:"pref",
		SECURITYPRICE : "EDITSECPRICE",
		SECURITYTYPE : "EDITSECTYPE",
		APPROVEMODELASSIGN : "approvemodelassign",
		POSTIMPORTANALYSIS:"post_import_analysis",
		REFANALYTICS:"refanalytics",
		TRADEORDER:"tradeorder",
		ORDEXEC:"ordexec",
		ORDEDIT:"ordedit"
	},

	api : {
		logIn : 'https://testapi.orionadvisor.com/api/v1/security/token',
		userDetail : 'https://testapi.orionadvisor.com/api/v1/Authorization/User',
		searchOrionUser : 'https://testapi.orionadvisor.com/api/v1//Security/Profiles/Search',
		tickerSearchAPI : 'https://testapi.orionadvisor.com/api/v1/Trading/Products/Search',
		tickerDetailAPI : 'https://testapi.orionadvisor.com/api/v1/Portfolio/Products',
		getSecurityPrice : 'https://testapi.orionadvisor.com/api/v1/Trading/Products/RealTimePrices'
//		tickerSearchAPI : 'http://localhost:3000/connect/security'
	},

	orionApiResponseKey: {
		errorMessage: "statusMessage",
		orionAccessToken: "access_token",
		orionExpireTime: "expires_in"
	},
	EMAIL_TEMPLATE_PATH:{
		NOTIFICATION_EMAIL:'templates/email/Notification.html'
	},
	/** Preference Constants  **/

	record: {
		FIRM: "Firm",
		CUSTODIAN: "Custodian",
		TEAM: "Team",
		MODEL: "Model",
		PORTFOLIO: "Portfolio",
		ACCOUNT: "Account",
		SECURITY: "Security",
		HOLDING: "Holding",
		USER: "User"
	},

	recordBitValue: {
		FIRM: 1,
		CUSTODIAN: 2,
		TEAM: 4,
		MODEL: 8,
		PORTFOLIO: 16,
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
    
    preferenceValueRange: {
	minPercent: 0,
	maxPercent: 100,
	minAmount: -9007199254740992,
	maxAmount: 9007199254740992
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
		ETL_command: "sh '/home/ETLJobs/test8thDec/orionETLjobV2/orionETLjobV2_run.sh'",
		contextParam: " --context_param contextDir=/home/test_config ",
		ETL_contextParam: " --context_param contextDir=",
		inputDirParam: ' --context_param inputDir=',
		ETL_inputDirParam: '  --context_param inputDir=',
		sleeveContextParam: " --context_param contextDir=",
		importSleeveCommand: "sh '/home/ETLJobs/testJobNov11//orionETLjobV2/orionETLjobV2_run.sh' "
		// importSleeveCommand: "sh '/home/ETLJobs/test6Dec/orionETLjobV2/orionETLjobV2_run.sh' "
		 
	},
	aws: {
		s3:{
			BucketName : "orioneclipsedata",
			BaseFolderForFirms : "Firm Data New/",
		}
	},
	
	spendCash:{
		preferenceName : "spendCashMethod",
		emphasiedMethodId : 43
	},
	
	raiseCash:{
		preferenceName : "raiseCashMethod",
		emphasiedMethodId : 69
	},
	
	tradeAppIds: {
		"cashNeed": 7,
		"spendCash": 9,
		"raiseCash": 11
	},
	queryTimeout : 240000,
	sleevePortfolio:"SleevePortfolio",
	accounts:"Accounts",
	tokenExpireMilliSec:36000
};
