"use strict";

var moduleName = __filename;

var _ = require("lodash");
var app = require("express")();
var helper = require("helper");
var config = require("config");
var util = require("util");
var response = require("controller/ResponseController.js");
var SecurityConverter = require('converter/security/SecurityConverter.js');
var SecurityService = require("service/security/SecurityService.js");
var SecurityTypeService = require('service/security/SecurityTypeService.js');
var baseConverter = require('converter/base/BaseConverter.js');
var analysisMiddleware = require('middleware/AnalysisMiddleware.js')
var corporateActionsService = require('service/security/CorporateActionsService.js');

var logger = helper.logger(moduleName);
var validate = helper.validate;
var messages = config.messages;
var responseCode = config.responseCode;
var applicationEnum = config.applicationEnum;
var securityStatus = applicationEnum.securityStatus;
var securityTypeService = new SecurityTypeService();

var createSecuritySchema = {
	type: 'object',
	properties: {
		id: {
			type: 'number',
			required: true
		}
	}
};

var securityIdSchema = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			is: 'numeric',
			required: true
		}
	}
};

var updateSecuritySchema = {
	type: 'object',
	properties: {
		symbol: {
			type: 'string',
			is : "notEmpty",
			required: true
		},
		price: {
			type: 'number'
		},
		status: {
			enum: ['OPEN', 'NOT_APPROVED', 'EXCLUDED', null]
		},
		custodialCash: {
			is: 'boolean'
		},
		assetCategoryId: {
			type: ["string", "number"],
			is: "numeric"
		},
		assetClassId: {
			type: ["string", "number"],
			is: "numeric"
		},
		assetSubClassId: {
			type: ["string", "number"],
			is: "numeric"
		},
		securityTypeId: {
			type: ["string", "number"],
			is: "numeric"
		},
		custodians: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: {
						type: 'number',
						required: true
					},
					custodianSecuritySymbol: {
						type: 'string',
						required: true
					}
				}
			}
		}
	}
};

/**
 * @api {get} /security/securities Get All Securities 
 * @apiName GetAllSecurities
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities
 * 
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.     
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
			  {
			    "id": 98,
			    "name": "Nwide-FP Life: Fid Asset Mgr",
			    "symbol": "_NFFAM",
			    "securityTypeId": 2,
			    "securityType": "CASH",
			    "price": null,
			    "status": "OPEN",
			    "isDeleted": 0,
			    "assetCategoryId": null,
			    "assetClassId": null,
			    "assetSubClassId": null,
			    "assetCategory": null,
			    "assetClass": null,
			    "assetSubClass": null,
			    "custodialCash": null,
			    "createdOn": "2016-08-05T07:05:51.000Z",
			    "editedOn": "2016-08-05T07:05:51.000Z",
			    "createdBy": "Prime Prime",
			    "editedBy": "Prime Prime"
			  }
        ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/**
 * @api {get} /security/securities?search={id/name/symbol} Search Securities from eclipse 
 * @apiName GetSecuritiesMatchingTheSearchCriteria
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities?search=8496
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.   
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
		    "id": 8496,
		    "name": "Sysco Corporation",
		    "symbol": "SYY",
		    "securityTypeId": null,
		    "securityType": null,
		    "price": 150,
		    "status": "OPEN",
		    "isDeleted": 0,
		    "assetCategoryId": 1,
		    "assetClassId": null,
		    "assetSubClassId": 1,
		    "assetCategory": "Fixed Income1",
		    "assetClass": null,
		    "assetSubClass": null,
		    "custodialCash": null,
		    "createdOn": null,
		    "editedOn": null,
		    "createdBy": "Prime TGI",
		    "editedBy": "Prime TGI"
		  }
		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/**
 * @api {get} /security/securities?status={OPEN/EXCLUDED/NOT_APPROVED} Get Securities under given status 
 * @apiName GetSecuritiesMatchingStatus
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
		    "id": 8496,
		    "name": "Sysco Corporation",
		    "symbol": "SYY",
		    "securityTypeId": null,
		    "securityType": null,
		    "price": 150,
		    "status": "OPEN",
		    "isDeleted": 0,
		    "assetCategoryId": 1,
		    "assetClassId": null,
		    "assetSubClassId": 1,
		    "assetCategory": "Fixed Income1",
		    "assetClass": null,
		    "assetSubClass": null,
		    "custodialCash": null,
		    "createdOn": null,
		    "editedOn": null,
		    "createdBy": "Prime TGI",
		    "editedBy": "Prime TGI"
		  }
		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/**
 * @api {get} /security/securities?search={ID/NAME/SYMBOL}&status={OPEN/EXCLUDED/NOT_APPROVED} Get Securities with search and status
 * @apiName GetSecuritiesSearch&Status
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities?search=k&status=OPEN
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
		    "id": 8496,
		    "name": "Sysco Corporation",
		    "symbol": "SYY",
		    "securityTypeId": null,
		    "securityType": null,
		    "price": 150,
		    "status": "OPEN",
		    "isDeleted": 0,
		    "assetCategoryId": 1,
		    "assetClassId": null,
		    "assetSubClassId": 1,
		    "assetCategory": "Fixed Income1",
		    "assetClass": null,
		    "assetSubClass": null,
		    "custodialCash": null,
		    "createdOn": null,
		    "editedOn": null,
		    "createdBy": "Prime TGI",
		    "editedBy": "Prime TGI"
		  }
		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/**
 * @api {get} /security/securities?assetCategoryId={id} Get Securities under given Category
 * @apiName GetSecuritiesMatchingCategory
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities?assetCategoryId=1
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
		    "id": 8496,
		    "name": "Sysco Corporation",
		    "symbol": "SYY",
		    "securityTypeId": null,
		    "securityType": null,
		    "price": 150,
		    "status": "OPEN",
		    "isDeleted": 0,
		    "assetCategoryId": 1,
		    "assetClassId": null,
		    "assetSubClassId": 1,
		    "assetCategory": "Fixed Income1",
		    "assetClass": null,
		    "assetSubClass": null,
		    "custodialCash": null,
		    "createdOn": null,
		    "editedOn": null,
		    "createdBy": "Prime TGI",
		    "editedBy": "Prime TGI"
		  }
		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/**
 * @api {get} /security/securities?assetClassId={id} Get Securities under given Class
 * @apiName GetSecuritiesMatchingClass
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities?assetClassId=1
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
		    "id": 8496,
		    "name": "Sysco Corporation",
		    "symbol": "SYY",
		    "securityTypeId": null,
		    "securityType": null,
		    "price": 150,
		    "status": "OPEN",
		    "isDeleted": 0,
		    "assetCategoryId": 1,
		    "assetClassId": 1,
		    "assetSubClassId": 1,
		    "assetCategory": "Fixed Income1",
		    "assetClass": null,
		    "assetSubClass": null,
		    "custodialCash": null,
		    "createdOn": null,
		    "editedOn": null,
		    "createdBy": "Prime TGI",
		    "editedBy": "Prime TGI"
		  }
		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/**
 * 
 * @api {get} /security/securities?assetSubClassId={id} Get Securities under given SubClass
 * @apiName GetSecuritiesMatchingSubClass
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities?assetSubClassId=1
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
		    "id": 8496,
		    "name": "Sysco Corporation",
		    "symbol": "SYY",
		    "securityTypeId": null,
		    "securityType": null,
		    "price": 150,
		    "status": "OPEN",
		    "isDeleted": 0,
		    "assetCategoryId": 1,
		    "assetClassId": 1,
		    "assetSubClassId": 1,
		    "assetCategory": "Fixed Income1",
		    "assetClass": null,
		    "assetSubClass": null,
		    "custodialCash": null,
		    "createdOn": null,
		    "editedOn": null,
		    "createdBy": "Prime TGI",
		    "editedBy": "Prime TGI"
		  }
		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

/**
 * @api {get} /v1/security/securities?search={Name/symbol}&portfolioIds={:id}&accountIds={:id}&modelIds={:id} Search Sell Securities For Trades
 * @apiName SearchSellSecuritiesForTrades
 * @apiVersion 1.0.0
 * @apiGroup TradeTool
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities?search=k&portfolioIds=&accountIds=1&modelIds=1
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {String}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {String}    editedBy					Full Name of user who edited the Security into the system.   
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
		  {
			"id": 14632,
			"orionConnectExternalId": 17594,
			"name": "ProFunds Asia 30 Svc",
			"symbol": "KYTY113",
			"securityTypeId": 1,
			"securityType": "MUTUAL FUND",
			"price": 400,
			"statusId": 6,
			"status": "OPEN",
			"isDeleted": 0,
			"assetCategoryId": 2,
			"assetCategory": "Asset Category 2",
			"assetClassId": 2,
			"assetClass": "Asset Class 2",
			"assetSubClassId": 2414,
			"assetSubClass": "Asset Sub Class 2414",
			"custodialCash": null,
			"createdOn": "2016-09-15T07:57:36.000Z",
			"editedOn": "2016-09-15T07:57:38.000Z",
			"createdBy": "prime@tgi.com",
			"editedBy": "prime@tgi.com"
  		}
	 ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */


/**
 * @api {get} /v1/security/securities?excludePortfolioIds={portfolioId} Search Securities Which are not lie in selected Portfolio 
 * @apiName GetSecuritiesNotInPortfolio
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security list which are not lie in selected portfolio. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities?excludePortfolioIds=1
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 [
  {
    "id": 14615,
    "name": "Agilent Technologies Inc"
  },
  {
    "id": 14673,
    "name": "Analog Device"
  }
  ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

app.get("/", function (req, res) {

	logger.info("Get all security request received");

	var data = req.data;

	data.search = req.query.search;
	data.assetCategoryId = req.query.assetCategoryId;
	data.assetClassId = req.query.assetClassId;
	data.assetSubClassId = req.query.assetSubClassId;
	data.excludePortfolioIds = req.query.excludePortfolioIds;
   	var status = req.query.status;
	var valid = false;
	if (data.search && (data.portfolioIds || data.accountIds || data.modelIds)) {
		if (req.query.accountIds) {
			data.accountId = req.query.accountIds;
			var accountIds = data.accountId;
			if (accountIds.indexOf(",") > -1) {
				var valid = true;
				var ids = accountIds.split(",");
				ids.forEach(function (id) {
					if (valid) {
						valid = id.match(/^[0-9]+$/g) ? true : false;
					} else {
						return response(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " in accountIds" }, res);
					}
				}, this);
			} else {
				valid = data.accountId.match(/^[0-9]+$/g) ? true : false;
			}
			if (!valid) {
				return response(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " in accountIds" }, res);
			}
		}
		if (req.query.portfolioIds) {
			data.portfolioId = req.query.portfolioIds;
			var portfolioIds = data.portfolioId;
			if (portfolioIds.indexOf(",") > -1) {
				var valid = true;
				var ids = portfolioIds.split(",");
				ids.forEach(function (id) {
					if (valid) {
						valid = id.match(/^[0-9]+$/g) ? true : false;
					} else {
						return response(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " in portfolioIds" }, res);
					}
				}, this);
			} else {
				valid = data.portfolioId.match(/^[0-9]+$/g) ? true : false;
			}
			if (!valid) {
				return response(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " in portfolioIds" }, res);
			}
		}
		if (req.query.modelIds) {
			data.modelId = req.query.modelIds;
			var modelIds = data.modelId;
			if (modelIds.indexOf(",") > -1) {
				var valid = true;
				var ids = modelIds.split(",");
				ids.forEach(function (id) {
					if (valid) {
						valid = id.match(/^[0-9]+$/g) ? true : false;
					} else {
						return response(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " in modelIds" }, res);
					}
				}, this);
			} else {
				valid = data.modelId.match(/^[0-9]+$/g) ? true : false;
			}
			if (!valid) {
				return response(null, responseCode.BAD_REQUEST, { "message": messages.badRequest + " in modelIds" }, res);
			}
		}

		SecurityService.getSellSecurityList(data, function (err, status, data) {
			return response(err, status, data, res);
		});
	}
	else if (data.excludePortfolioIds) {

		SecurityService.getSecurityListExcludePortfolioIds(data, function (err, status, data) {
			response(err, status, data, res);
		});

	}
	else {
		if (status) {
			var statusArr = status.split(",");
			if (statusArr.length > 0) {
				data.statusId = [];
				statusArr.forEach(function (item) {
					var statusId = securityStatus[item];
					if (statusId) {
						data.statusId.push(statusId);
					}
				})
			}
		}
		SecurityService.getSecurityList(data, function (err, status, data) {
			response(err, status, data, res);
		});
	}
});

/**
 * @api {get} /security/securities/orion?search={id/name} Search securities from Orion 
 * @apiName GetSecuritiesFromOrion
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security from Orion. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/orion?search=APPL
 * 
 * @apiSuccess {Number}    id					Security Id.
 * @apiSuccess {String}    name					Security Name.
 * @apiSuccess {Number}    securityTypeId		Security Type Id
 * @apiSuccess {String}    ticker		  		Security ticker 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[
			{
			    "id": 1959,
			    "name": "Amazon.com Inc",
			    "ticker": "AMZN",
			    "securityTypeId": 4
			  }
		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

app.get("/orion", function (req, res) {

	logger.info("Search securities in orion request received");

	var data = req.data;
	var dataToSearch = req.query.search;

	data.search = req.query.search;

	var model = SecurityConverter.getSecurityRequestToModel(data);

	SecurityService.orionSecuritySearch(model, function (err, status, data) {
		response(err, status, data, res);
	});
});

/**
 * @api {post} /security/securities Add Security
 * @apiName AddSecurity
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API Add Security. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Number}       id              Security ID in orion Connect
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *        "id": 323
 *    }
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * @apiSuccess {String[]}  custodians				List of Custodians associated with Security.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
        {
		  "id": 8496,
		  "name": "Sysco Corporation",
		  "symbol": "SYY",
		  "status": "OPEN",
		  "price": 2,
		  "custodialCash": null,
		  "assetCategoryId": 1,
		  "assetClassId": null,
		  "assetSubClassId": 1,
		  "assetCategory": "dsfsdf",
		  "assetClass": null,
		  "assetSubClass": null,
		  "securityTypeId": null,
		  "securityType": null,
		  "isDeleted": 0,
		  "createdOn": null,
		  "createdBy": "Prime TGI",
		  "editedOn": null,
		  "editedBy": "Prime TGI",
		  "custodians": [
		    {
		      "id": 1,
		      "custodianName": "Circle Trust",
		      "custodianCode": "CTC",
		      "custodianSecuritySymbol": "IYC"
		    },
		    {
		      "id": 3,
		      "custodianName": "Fidelity",
		      "custodianCode": "FIBG",
		      "custodianSecuritySymbol": "FDI"
		    },
		    {
		      "id": 5,
		      "custodianName": "Fund Direct",
		      "custodianCode": "DIRECT",
		      "custodianSecuritySymbol": "DR"
		    }
		  ]
		}
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 *  
 *
 */

app.post("/", validate({ body: createSecuritySchema }), function (req, res) {
	logger.info("create security request received");

	var securityId = req.body.id;
	var data = req.data;
	data.id = securityId;
	data.search = securityId;
	var model = SecurityConverter.getSecurityRequestToModel(data);

	SecurityService.getSecurityDetailFromOrion(model, function (err, status, orionSecurity) {
		if (orionSecurity) {

			SecurityService.createSecurityAssociations(orionSecurity, function (err, status, rs) {
				if (err) {
					logger.error(err);
					return response(messages.internalServerError, responseCode.INTERNAL_SERVER_ERROR, data, res);
				}

				var securityModel = SecurityConverter.getSecurityModelFromOrionSecurityResponseModel(orionSecurity);
				_.assign(securityModel, rs);


				SecurityService.createSecurity(securityModel, function (err, status, data) {
					response(err, status, data, res);
				});

			});
		} else {
			response(messages.notFound, responseCode.NOT_FOUND, null, res);
		}
	});
});


/**
 * @api {put} /security/securities/:id Update Detailed Security
 * @apiName UpdateDetailedSecurity
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API Updates Security. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiParam {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiParam {Number}    price					Latest Security price in Eclipse.
 * @apiParam {String}    status					Security Status in Eclipse.
 * @apiParam {Number}    assetCategoryId		AssetCategoryId of Security in Eclipse.
 * @apiParam {Number}    assetClassId			AssetClassId of Security in Eclipse.
 * @apiParam {Number}    assetSubClassId		AssetSubClassId of Security in Eclipse.
 * @apiParam {Number}    custodialCash			Security is custodial cash or not.
 * @apiParam {custodian[]}  custodians				List of Custodians associated with Security.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *        "price" : 400,
 *        "status" : "OPEN",
 *        "symbol" : "KYT",
 *        "securityTypeId" : 1,
 *        "assetCategoryId" : 1,
 *        "assetClassId" : 2,
 *        "assetSubClassId" : 1,
 *        "custodialCash" : 0,
 *        "custodians" : [
	         {
	         	"id": 1,
			    "custodianSecuritySymbol": "IYC"
	         }
 *        ]
 *    }
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/1
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {Number}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * @apiSuccess {String[]}  custodians				List of Custodians associated with Security.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
        {
		  "id": 8496,
		  "name": "Sysco Corporation",
		  "symbol": "SYY",
		  "status": "OPEN",
		  "price": 150,
		  "custodialCash": null,
		  "assetCategoryId": 1,
		  "assetClassId": 1,
		  "assetSubClassId": 2413,
		  "assetCategory": "Fixed Income",
		  "assetClass": "Municipal Bond",
	      "assetSubClass": "FND",
		  "securityTypeId": 1,
		  "securityType": "MUTUAL FUND",
		  "isDeleted": null,
		  "createdOn": null,
		  "createdBy": "Prime Prime",
		  "editedOn": "2016-07-21T23:41:40.000Z",
		  "editedBy": "Prime Prime",
		  "custodians": [
		    {
		      "id": 1,
		      "custodianName": "Circle Trust",
		      "custodianCode": "CTC",
		      "custodianSecuritySymbol": "IYC"
		    },
		    {
		      "id": 3,
		      "custodianName": "Fidelity",
		      "custodianCode": "FIBG",
		      "custodianSecuritySymbol": "FDI"
		    },
		    {
		      "id": 5,
		      "custodianName": "Fund Direct",
		      "custodianCode": "DIRECT",
		      "custodianSecuritySymbol": "DR"
		    }
		  ]
		}
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 *  
 *
 */

/**
 * @api {put} /security/securities/:id?list=true Update Security in list
 * @apiName UpdateSecurity
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API Updates Security. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiParam {Number}    price					Latest Security price in Eclipse.
 * @apiParam {String}    status					Security Status in Eclipse.
 * @apiParam {Number}    assetCategoryId		AssetCategoryId of Security in Eclipse.
 * @apiParam {Number}    assetClassId			AssetClassId of Security in Eclipse.
 * @apiParam {Number}    assetSubClassId		AssetSubClassId of Security in Eclipse.
 * @apiParam {Number}    custodialCash			Security is custodial cash or not.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *        "price" : 400,
 *        "status" : "OPEN",
 *        "symbol" : "KYT",
 *        "securityTypeId" : 1,
 *        "assetCategoryId" : 1,
 *        "assetClassId" : 2,
 *        "assetSubClassId" : 1,
 *        "custodialCash" : 0
 *    }
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/1
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * @apiSuccess {String[]}  custodians				List of Custodians associated with Security.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
        {
		  "id": 8496,
		  "name": "Sysco Corporation",
		  "symbol": "SYY",
		  "status": "OPEN",
		  "price": 150,
		  "custodialCash": null,
		  "assetCategoryId": 1,
		  "assetClassId": 1,
		  "assetSubClassId": 2413,
		  "assetCategory": "Fixed Income",
		  "assetClass": "Municipal Bond",
	      "assetSubClass": "FND",
		  "securityTypeId": 1,
		  "securityType": "MUTUAL FUND",
		  "isDeleted": null,
		  "createdOn": null,
		  "createdBy": "Prime Prime",
		  "editedOn": "2016-07-21T23:41:40.000Z",
		  "editedBy": "Prime Prime",
		  "custodians": [
		    {
		      "id": 1,
		      "custodianName": "Circle Trust",
		      "custodianCode": "CTC",
		      "custodianSecuritySymbol": "IYC"
		    },
		    {
		      "id": 3,
		      "custodianName": "Fidelity",
		      "custodianCode": "FIBG",
		      "custodianSecuritySymbol": "FDI"
		    },
		    {
		      "id": 5,
		      "custodianName": "Fund Direct",
		      "custodianCode": "DIRECT",
		      "custodianSecuritySymbol": "DR"
		    }
		  ]
		}
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 * @apiError Bad_Request When missing required parameters.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Missing required parameters"
 *     }
 *  
 *
 */

app.put("/:id", validate({ params: securityIdSchema }),
	validate({ body: updateSecuritySchema }),
	analysisMiddleware.post_import_analysis,
	function (req, res) {
		logger.info("Update security details request received");

		var securityId = req.params.id;
		var data = req.data;
		var LIST_UPDATE = req.query.list;

		data.id = securityId;

		var model = SecurityConverter.createOrUpdateSecurityRequestToModel(data);
		model.LIST_UPDATE = LIST_UPDATE;

		SecurityService.updateSecurity(model, function (err, status, data) {
			response(err, status, data, res);
		});

	});




/**
 * @api {get} /security/securities/securitytype Get All security type 
 * @apiName GetAllSecurityType
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security type list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/securitytype
 * 
 * @apiSuccess {String}     id              The security type Id.
 * @apiSuccess {Date}       name            Name of the SecurityType.
 * @apiSuccess {Number}     isDeleted       Security Type exist or not into the system.
 * @apiSuccess {Date}       createdOn       Security Type creation date into application.
 * @apiSuccess {Number}     createdBy       Id of user who created the Security Type into the system.
 * @apiSuccess {Date}       editedOn 	    Security Type edited date into application.
 * @apiSuccess {String}     editedBy        Id of user who edited the Security Type details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *      "id": 1,
 *      "name": "MUTUAL FUND",
 *      "isDeleted": 0,
 *      "createdOn": "2016-06-17T05:57:22.000Z",
 *      "createdBy": 0,
 *      "editedOn": "2016-06-17T05:57:25.000Z",
 *      "editedBy": 0
 *      }]
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/securitytype', function (req, res) {
	logger.info("Get all security type request received");

	var data = req.data;
	if (req.query.search) {
		data.search = req.query.search;
	}

	securityTypeService.getSecurityTypeList(data, function (err, status, data) {
		return response(err, status, data, res);
	});
});

/**
 * @api {get} /security/securities/securitystatus Get All security Status 
 * @apiName GetAllSecurityStatus
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security status list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/securitystatus
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    [
 *	   "OPEN",
 *	   "NOT_APPROVED",
 *	   "EXCLUDED"
 *	  ]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/securitystatus', function (req, res) {
	logger.info("Get all security status request received");

	var securityStatusMap = applicationEnum.securityStatus;
	var securityStatusList = [];

	for (var i in securityStatusMap) {
		var status = i;
		securityStatusList.push(status);
	}
	return response(null, responseCode.SUCCESS, securityStatusList, res);
});


/**
 * @api {get} /security/securities/:id Get Security Detail 
 * @apiName GetSecuritiesDetail
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/1
 * 
 * @apiSuccess {Number}    id						The Security Id.        
 * @apiSuccess {String}    name						Name of the Security in Eclipse.
 * @apiSuccess {String}    symbol					Symbol of the Security in Eclipse.               
 * @apiSuccess {Number}    securityTypeId			SecurityType Id in Eclipse.
 * @apiSuccess {String}    securityType    			SecurityType Name in Eclipse.
 * @apiSuccess {Number}    price					Latest Security price in Eclipse.
 * @apiSuccess {String}    status					Security Status in Eclipse.
 * @apiSuccess {Number}    isDeleted				Security exists in system or not in Eclipse. 
 * @apiSuccess {Number}    assetCategoryId			AssetCategoryId of Security in Eclipse.
 * @apiSuccess {Number}    assetClassId				AssetClassId of Security in Eclipse.
 * @apiSuccess {Number}    assetSubClassId			AssetSubClassId of Security in Eclipse.
 * @apiSuccess {String}    assetCategory			AssetCategory Name of Security in Eclipse.
 * @apiSuccess {String}    assetClass				AssetClass Name of Security in Eclipse.
 * @apiSuccess {String}    assetSubClass 			AssetSubClass Name of Security in Eclipse.
 * @apiSuccess {Number}    custodialCash			Security is custodial cash or not.
 * @apiSuccess {Date}      createdOn				Security creation Date.                   
 * @apiSuccess {Number}    createdBy				Full Name of user who created the Security into the system.     
 * @apiSuccess {Date}      editedOn					Security edited date into the system.   
 * @apiSuccess {Number}    editedBy					Full Name of user who edited the Security into the system.
 * @apiSuccess {String[]}  custodians				List of Custodians associated with Security.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
		  "id": 8496,
		  "name": "Sysco Corporation",
		  "symbol": "SYY",
		  "status": "OPEN",
		  "price": 150,
		  "custodialCash": null,
		  "assetCategoryId": 1,
		  "assetClassId": 1,
		  "assetSubClassId": 2413,
		  "assetCategory": "Fixed Income",
		  "assetClass": "Municipal Bond",
	      "assetSubClass": "FND",
		  "securityTypeId": 1,
		  "securityType": "MUTUAL FUND",
		  "isDeleted": null,
		  "createdOn": null,
		  "createdBy": "Prime Prime",
		  "editedOn": "2016-07-21T23:41:40.000Z",
		  "editedBy": "Prime Prime",
		  "custodians": [
		    {
		      "id": 1,
		      "custodianName": "Circle Trust",
		      "custodianCode": "CTC",
		      "custodianSecuritySymbol": "IYC"
		    },
		    {
		      "id": 3,
		      "custodianName": "Fidelity",
		      "custodianCode": "FIBG",
		      "custodianSecuritySymbol": "FDI"
		    },
		    {
		      "id": 5,
		      "custodianName": "Fund Direct",
		      "custodianCode": "DIRECT",
		      "custodianSecuritySymbol": "DR"
		    }
		  ]
		}
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 */

app.get("/:id", validate({ params: securityIdSchema }),
	function (req, res) {
		logger.info("Get security details by id request received");

		var securityId = req.params.id;
		var data = req.data;
		data.id = securityId;

		SecurityService.getDetailedSecurityById(data, function (err, status, data) {
			response(err, status, data, res);
		});
	});

/**
 * @api {get} /security/securities/price/:id Get Security Price 
 * @apiName GetSecurityPrice
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API gets security price by security Id. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/price/1
 * 
 * @apiSuccess {Date}      priceDate				Security price change Date.                   
 * @apiSuccess {Number}    price				    Security price.     
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
{
  "priceDate": "2016-09-13T07:26:35.000Z",
  "price": 401
}
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *     
 *     HTTP/1.1 404 Not Found
 *     {
 *      "message": "Security not found"
 *     }
 *
 */

app.get("/price/:id", function (req, res) {
		logger.info("Get security price by id request received");

		var securityId = req.params.id;
		var data = req.data;
		data.id = securityId;

		SecurityService.getSecurityPriceById(data, function (err, status, data) {
			response(err, status, data, res);
		});
	});

/**
 * @api {delete} /security/securities/:id Delete Security 
 * @apiName DeleteSecurity
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Security (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "Security deleted Successfully"
        }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *     
 * @apiError Unprocessable_Entity When Security does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Security does not exists "
 *     }
 * 
 */

app.delete('/:id', validate({ params: securityIdSchema }), function (req, res) {
	logger.info("Delete security request received");

	var data = req.data;
	data.id = req.params.id;

	SecurityService.deleteSecurityGeneral(data, function (err, status, data) {
		return response(err, status, data, res);
	});
});

/**
 * @api {post} /security/securities/:id/corporateAction create Corporate Action for Security. 
 * @apiName createCorporateActionForSecurity
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API create corporate action for Security. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/:id/corporateAction
 * 
 * @apiParam {Number}     corporateActionTypeId     corporate action typeId.        
 * @apiParam {String}     corporateActionTypeName   corporate action type name.     
 * @apiParam {Number}     to     					  what we want's it to be.        
 * @apiParam {Number}     from				      from where we want to change.   
 * @apiParam {Number}     securityId     			  securityId.                     
 * @apiParam {Number}     spinOfsecurityId     	  spinOfsecurityId.               
 * @apiParam {Number}     isDeleted     	  		  isDeleted.                      
 * @apiParam {Number}     createdOn            	  createdOn.                      
 * @apiParam {Number}     createdBy     	  		  createdBy.                      
 * @apiParam {Number}     editedOn     	  		  editedOn.                       
 * @apiParam {Number}     editedBy     	  		  editedBy. 
 *                                 
 * @apiParamExample {json} Request-Example:
	{
		"corporateActionTypeId" : 1,
		"to" : 2,
		"from": 1,
		"spinOfSecurityId": null
	}
 * 
 * @apiSuccess {Number}     id					      internal id of corporate action.
 * @apiSuccess {Number}     corporateActionTypeId     corporate action typeId.
 * @apiSuccess {String}     corporateActionTypeName   corporate action type name.
 * @apiSuccess {Number}     to     					  what we want's it to be.
 * @apiSuccess {Number}     from				      from where we want to change.
 * @apiSuccess {Number}     securityId     			  securityId.
 * @apiSuccess {Number}     spinOfsecurityId     	  spinOfsecurityId.
 * @apiSuccess {Number}     isDeleted     	  		  isDeleted.
 * @apiSuccess {Number}     createdOn            	  createdOn.
 * @apiSuccess {Number}     createdBy     	  		  createdBy.
 * @apiSuccess {Number}     editedOn     	  		  editedOn.
 * @apiSuccess {Number}     editedBy     	  		  editedBy.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
	{
	  "id": 4,
	  "corporateActionTypeId": 1,
	  "corporateActionTypeName": "Stock Split",
	  "corporateActionTypeCode": "STOCK_SPLIT",
	  "to": 2,
	  "from": 1,
	  "securityId": 0,
	  "spinOfSecurityId": null,
	  "isDeleted": 0,
	  "createdOn": "2016-11-28T07:44:03.000Z",
	  "createdBy": 66,
	  "editedOn": "2016-11-28T07:44:03.000Z",
	  "editedBy": 66
	}
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *     
 * @apiError Unprocessable_Entity When Security does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Security does not exists "
 *     }
 * 
 */

app.post('/:id/corporateAction', validate({ params: securityIdSchema }), function (req, res) {
	logger.info("create corporate action for security request received");

	var data = req.data;
	data.securityId = req.params.id;

	corporateActionsService.createCorporateActionForSecurity(data, function (err, status, data) {
		return response(err, status, data, res);
	});
});

/**
 * @api {get} /security/securities/:id/corporateAction get Corporate Actions for Security. 
 * @apiName getCorporateActionForSecurity
 * @apiVersion 1.0.0
 * @apiGroup Security
 * @apiPermission appuser
 *
 * @apiDescription This API get corporate action for Security. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securities/:id/corporateAction
 * 
 * @apiSuccess {Number}     id					      internal id of corporate action.
 * @apiSuccess {Number}     corporateActionTypeId     corporate action typeId.
 * @apiSuccess {String}     corporateActionTypeName   corporate action type name.
 * @apiSuccess {Number}     to     					  what we want's it to be.
 * @apiSuccess {Number}     from				      from where we want to change.
 * @apiSuccess {Number}     securityId     			  securityId.
 * @apiSuccess {Number}     spinOfsecurityId     	  spinOfsecurityId.
 * @apiSuccess {Number}     isDeleted     	  		  isDeleted.
 * @apiSuccess {Number}     createdOn            	  createdOn.
 * @apiSuccess {Number}     createdBy     	  		  createdBy.
 * @apiSuccess {Number}     editedOn     	  		  editedOn.
 * @apiSuccess {Number}     editedBy     	  		  editedBy.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		[{
		  "id": 4,
		  "corporateActionTypeId": 1,
		  "corporateActionTypeName": "Stock Split",
		  "corporateActionTypeCode": "STOCK_SPLIT",
		  "to": 2,
		  "from": 1,
		  "securityId": 0,
		  "spinOfSecurityId": null,
		  "isDeleted": 0,
		  "createdOn": "2016-11-28T07:44:03.000Z",
		  "createdBy": 66,
		  "editedOn": "2016-11-28T07:44:03.000Z",
		  "editedBy": 66
		}]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *     
 * @apiError Unprocessable_Entity When Security does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Security does not exists "
 *     }
 * 
 */

app.get('/:id/corporateAction', validate({ params: securityIdSchema }), function (req, res) {
	logger.info("create corporate action for security request received");

	var data = req.data;
	data.id = req.params.id;

	corporateActionsService.getCorporateActionListForSecurity(data, function (err, status, data) {
		return response(err, status, data, res);
	});
});

module.exports = app;