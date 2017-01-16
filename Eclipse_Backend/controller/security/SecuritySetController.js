"use strict";

var moduleName = __filename;
var app = require("express")();

var config = require("config");
var helper = require("helper");
var response = require("controller/ResponseController.js");
var SecurityService = require("service/security/SecurityService.js");
var securitySetConverter = require('converter/security/SecuritySetConverter.js');
var SecuritySetService = require("service/security/SecuritySetService.js");
var SecurityTypeService = require('service/security/SecurityTypeService.js');
var analysisMiddleware = require('middleware/AnalysisMiddleware.js')

var logger = helper.logger(moduleName);
var validate = helper.validate;
var applicationEnum = config.applicationEnum;
var responseCode = config.responseCode;
var sellPriorityMap = applicationEnum.sellPriorities;
var buyPriorityMap = applicationEnum.buyPriorities;

/*
 * modelTolerance columns will be used
*/
var securityTypeService = new SecurityTypeService();

var sellPriorityList = [];

for(var i in sellPriorityMap){
	var status = i;
	sellPriorityList.push(status);
}
	
var buyPriorityList = [];

for(var i in buyPriorityMap){
	var status = i;
	buyPriorityList.push(status);
}

var createSecuritySchema = {
	    type: 'object',
	    properties: {
	        id: {
	            type: 'number',
	            required: true
	        }
	    }
};

var securitySetIdSchema = {
	    type: 'object',
	    properties: {
	        id: {
	        	type : 'string',
	        	is : 'numeric',
	            required: true
	        }
	    }
};


var updateSecuritySetSchema = {
	    type: 'object',
	    properties: {
	    	name : {
	    		type : 'string',
	    		is : "notEmpty",
	    		required:true
	    	},
	    	description : {
	    		type : ['string', null]
	    	},
	    	isDynamic : {
	    		enum : [0, 1, false, true, null]
	    	},
	    	toleranceType : {
	    		enum : ["BAND", "ABSOLUTE"]
	    	},
	    	toleranceTypeValue : {
	    		type : ["number", null],
	    		maximum : 100
	    	},
	        securities: {
	            type: 'array',
	            is : 'sum_is_100',
	            required : true,
	            equivalence_check : 'not_in_equivalences',
	            tlh_check : 'not_in_tlh',
	            items : {
	            	type : 'object',
	            	properties:{
	            		id: {
	                		type : 'number',
	                		required : true
	                	},
	                	targetPercent : {
	                		type : 'number',
	                		minimum : 0,
	                		maximum : 100
	                	},
//	                	buyPriority : {
//	                		enum : buyPriorityList
//	                	},
//	                	sellPriority : {
//	                		enum : sellPriorityList
//	                	},
	                	rank : {
	                		is : "numericOrempty"
	                	},
	                	equivalences: {
	                		type : 'array',
	                		items : {
	                			properties : {
	                				id : {
	                					type : 'number',
	                					required : true
	                				}
//	                				buyPriority : {
//	        	                		enum : buyPriorityList
//	        	                	},
//	        	                	sellPriority : {
//	        	                		enum : sellPriorityList
//	        	                	}
	                			}
	                		}
	                	},
	                	tlh: {
	                		type : 'array',
	                		items : {
	                			properties : {
	                				id : {
	                					type : 'number'
	                				},
				                	priority : {
				                		type : ['number', null]
				                	}
	                			}
	                		}
	                	}
	            	}
	            }
	        }        
	    }
};

/**
 * @api {get} /security/securityset Get All SecuritySets 
 * @apiName GetAllSecuritySets
 * @apiVersion 1.0.0
 * @apiGroup SecuritySet
 * @apiPermission appuser
 *
 * @apiDescription This API gets securityset list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securityset
 * 
 * @apiSuccess {Number}    id						Security set Id.
 * @apiSuccess {String}    name						Name of Security set.
 * @apiSuccess {String}    toleranceType			Tolerance type can two values ABSOLUTE, BAND.
 * @apiSuccess {Number}    toleranceTypeValue			Tolerance Value.
 * @apiSuccess {String}    description				Description of Security set.
 * @apiSuccess {Number}    isModelAssigned			Tell whether model is assigned to security set.
 * @apiSuccess {Number}    isDeleted				Security set exists in system or not.
 * @apiSuccess {Date}      createdOn				Creation Date of security set.
 * @apiSuccess {Number}    createdBy				Full Name of User of who created security set in system.
 * @apiSuccess {Date}      editedOn					Edited Date of security set.
 * @apiSuccess {Number}    editedBy					Full Name of User of who edited security set in system.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        [
		  {
		    "id": 1,
		    "name": "first",
		    "description": "my first security set",
		    "isFavorite" : 1,
		    "toleranceType" : "ABSOLUTE",
		    "toleranceTypeValue" : 0,
		    "isModelAssigned": 1,
		    "isDeleted": 0,
		    "createdOn": "2016-08-02T10:14:54.000Z",
		    "createdBy": "Prime TGI",
		    "editedOn": "2016-08-10T09:00:18.000Z",
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
app.get("/", function(req, res){

	logger.info("Get all security set request received");
	
	var data = req.data;
	data.search = req.query.search;
	data.isFavorite = req.query.favorite;
	SecuritySetService.getAllSecuritySets(data, function(err, status, data){
		response(err, status, data, res);
	});

});

/**
 * @api {get} /security/securityset/sellpriority Get All securityset Sell priorities
 * @apiName GetAllSecuritySetSellPriorities
 * @apiVersion 1.0.0
 * @apiGroup SecuritySet
 * @apiPermission appuser
 *
 * @apiDescription This API gets security set sell priorities list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securityset/sellpriority
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
	     [
			  {
			    "id": 1,
			    "name": "Do Not Sell",
			    "code": "DO_NOT_SELL"
			  },
			  {
			    "id": 2,
			    "name": "Hard To Sell",
			    "code": "HARD_TO_SELL"
			  },
			  {
			    "id": 3,
			    "name": "Sell If No Gain",
			    "code": "SELL_IF_NO_GAIN"
			  },
			  {
			    "id": 4,
			    "name": "Can Sell",
			    "code": "CAN_SELL"
			  },
			  {
			    "id": 5,
			    "name": "Sell To Target",
			    "code": "SELL_TO_TARGET"
			  },
			  {
			    "id": 6,
			    "name": "Priority Sell",
			    "code": "PRIORITY_SELL"
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
 */

app.get('/sellpriority', function (req, res) {
   	logger.info("Get all security status request received");
   	
   	var data = req.data;
   	
   	SecuritySetService.getSellPriorities(data, function(err, status, data){
		return response(null, responseCode.SUCCESS, data, res);
	});
});

/**
 * @api {get} /security/securityset/buypriority Get All securityset Buy priorities
 * @apiName GetAllSecuritySetBuyPriorities
 * @apiVersion 1.0.0
 * @apiGroup SecuritySet
 * @apiPermission appuser
 *
 * @apiDescription This API gets security set buy priorities list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securityset/buypriority
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
	     [
		  {
		    "id": 1,
		    "displayName": "Do Not Buy",
		    "code": "DO_NOT_BUY"
		  },
		  {
		    "id": 2,
		    "displayName": "Hard To Buy",
		    "code": "HARD_TO_BUY"
		  },
		  {
		    "id": 3,
		    "displayName": "Can Buy",
		    "code": "CAN_BUY"
		  },
		  {
		    "id": 4,
		    "displayName": "Buy To Target",
		    "code": "BUY_TO_TARGET"
		  },
		  {
		    "id": 5,
		    "displayName": "Priority Buy",
		    "code": "PRIORITY_BUY"
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
 */

app.get('/buypriority', function (req, res) {
   	logger.info("Get all security status request received");
   	var data = req.data;
   	
   	SecuritySetService.getBuyPriorities(data, function(err, status, data){
		return response(null, responseCode.SUCCESS, data, res);
	});
});


/**
 * @api {get} /security/securityset/:id Get Detailed Security set 
 * @apiName GetSecuritiesDetail
 * @apiVersion 1.0.0
 * @apiGroup SecuritySet
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
 * curl -i http://baseurl/v1/security/securityset/:id
 * 
 * @apiSuccess {Number}        id						Security set Id.
 * @apiSuccess {String}        name						Name of Security set.
 * @apiSuccess {String}        toleranceType			Tolerance type can two values ABSOLUTE, BAND.
 * @apiSuccess {Number}        toleranceTypeValue			Tolerance Value.
 * @apiSuccess {String}        description				Description of Security set.
 * @apiSuccess {Number}        isDeleted				Security set exists in system or not.
 * @apiSuccess {Date}          createdOn				Creation Date of security set.
 * @apiSuccess {Number}        createdBy				Full Name of User of who created security set in system.
 * @apiSuccess {Date}          editedOn					Edited Date of security set.
 * @apiSuccess {Number}        editedBy					Full  Name of User of who edited security set in system.
 * @apiSuccess {Security[]}    securities				Full Name of User of who edited security set in system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		{
		  "id": 1,
		  "name": "first",
		  "description": "my first security set",
			"toleranceType" : "ABSOLUTE",
			"toleranceTypeValue" : 0,
		  "createdOn": "2016-08-02T10:14:54.000Z",
		  "createdBy": "Prime TGI",
		  "editedOn": "2016-08-10T09:00:18.000Z",
		  "editedBy": "Prime Prime",
		  "securities": [
		    {
		      "id": 8496,
		      "name": "Sysco Corporation",
		      "symbol": "SYY",
		      "rank" : 1,
		      "targetPercent": 50,
		      "lowerModelTolerancePercent": 5,
		      "upperModelTolerancePercent": 5,
		      "lowerModelToleranceAmount": 5,
		      "upperModelToleranceAmount": 5,
		      "taxableSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "taxDeferredSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "taxExemptSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "minTradeAmount": 100,
		      "minInitialBuyDollar": 100,
		      "buyPriority": {
			    "id": 1,
			    "displayName": "Do Not Buy",
			    "code": "DO_NOT_BUY"
			  },
		      "sellPriority": {
			    "id": 1,
			    "displayName": "Do Not Buy",
			    "code": "DO_NOT_BUY"
			  },
		      "equivalences": [
		        {
		          "id": 15727,
		          "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		          "symbol": "IYC",
		          "taxableSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxDeferredSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxExemptSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "minTradeAmount": 100,
		          "minInitialBuyDollar": 100,
		          "buyPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
			      "sellPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "rank" : 0
		        }
		      ],
		      "tlh": [
		        {
		          "id": 9409,
		          "name": "Medtronic PLC",
		          "symbol": "MDT",
		          "priority": 3
		        }
		      ]
		    },
		    {
		      "id": 9409,
		      "name": "Medtronic PLC",
		      "symbol": "MDT",
		      "targetPercent": 50,
		      "lowerModelTolerancePercent": 5,
		      "upperModelTolerancePercent": 5,
		      "lowerModelToleranceAmount": 5,
		      "upperModelToleranceAmount": 5,
		      "taxableSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "taxDeferredSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "taxExemptSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "minTradeAmount": 100,
		      "minInitialBuyDollar": 100,
		      "buyPriority": {
			    "id": 1,
			    "displayName": "Do Not Buy",
			    "code": "DO_NOT_BUY"
			  },
		      "sellPriority": {
			    "id": 1,
			    "displayName": "Do Not Buy",
			    "code": "DO_NOT_BUY"
			  },
		      "equivalences": [
		        {
		          "id": 15727,
		          "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		          "symbol": "IYC",
		          "taxableSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxDeferredSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxExemptSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "minTradeAmount": 100,
		          "minInitialBuyDollar": 100,
		          "buyPriority": {
			      	id : 1
			      },
			      "sellPriority": {id : 1},
		          "rank" : 0
		        }
		      ],
		      "tlh": [
		        {
		          "id": 331252,
		          "name": "iShares Tr FTSE NAREIT Mortgage REITs",
		          "symbol": "REM",
		          "priority": 1
		        },
		        {
		          "id": 9409,
		          "name": "Medtronic PLC",
		          "symbol": "MDT",
		          "priority": 2
		        }
		      ]
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

app.get("/:id", validate({ params: securitySetIdSchema }),  
				function(req, res){
	logger.info("Get security set details by id request received");

	var securityId = req.params.id;
	var data = req.data;
	data.id = securityId;
	
	SecuritySetService.getDetailedSecuritySetById(data, function(err, status, data){
		response(err, status, data, res);
	});
});


/**
 * @api {put} /security/securityset/:id Update Security set
 * @apiName UpdateSecuritySet
 * @apiVersion 1.0.0
 * @apiGroup SecuritySet
 * @apiPermission appuser
 *
 * @apiDescription This API Updates Security Set. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}        name					Name of Security set.
 * @apiParam {Number}        description			Description of Security set.
 * @apiParam {String}        toleranceType			Tolerance type can two values ABSOLUTE, BAND.
 * @apiParam {Number}        toleranceTypeValue			Tolerance Value.
 * @apiParam {Security[]}    securities				Full Name of User of who edited security set in system.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
		  "name": "first",
		  "description": "my first security set",
		  			"toleranceType" : "ABSOLUTE",
			"toleranceTypeValue" : 0,
		  "securities": [
						    {
						      "id": 8496,
						      "targetPercent": 50,
						      "lowerModelTolerancePercent": 5,
						      "upperModelTolerancePercent": 5,
						      "lowerModelToleranceAmount": 5,
						      "upperModelToleranceAmount": 5,
						      "rank" :0, 
						      "taxableSecurity": {
									"id": 8496
						      },
						      "taxDeferredSecurity" :{
									"id": 8496
						      },
						      "taxExemptSecurity": {
									"id": 8496
						      },
						      "minTradeAmount": 100,
						      "minInitialBuyDollar": 101,
						      "buyPriority": {
						      	id : 1
						      },
						      "sellPriority": {id : 1},
						      "equivalences": [
						        {
						          "id": 15727,
						          "taxableSecurity": {
									"id": 8496
							      },
							      "taxDeferredSecurity" :{
										"id": 8496
							      },
							      "taxExemptSecurity": {
										"id": 8496
							      },
						          "minTradeAmount": 100,
						          "minInitialBuyDollar": 101,
						          "buyPriority": {
							      	id : 1
							      },
							      "sellPriority": {id : 1},
						          "rank" : 0
						        }
						      ],
						      "tlh": [
						        {
						          "id": 9409,
						          "priority": 2
						        }
						      ]
						    },
						    {
						      "id": 9409,
						     "targetPercent": 50,
						      "lowerModelTolerancePercent": 5,
						      "upperModelTolerancePercent": 5,
						      "lowerModelToleranceAmount": 5,
						      "upperModelToleranceAmount": 5,
						      "taxableSecurity": {
									"id": 8496
						      },
						      "taxDeferredSecurity" :{
									"id": 8496
						      },
						      "taxExemptSecurity": {
									"id": 8496
						      },
						      "minTradeAmount": 100,
						      "minInitialBuyDollar": 100,
						      "buyPriority": {
						      	id : 1
						      },
						      "sellPriority": {id : 1},
						      "equivalences": [
						        {
						          "id": 15727,
						          "taxableSecurity": {
									"id": 8496
							      },
							      "taxDeferredSecurity" :{
										"id": 8496
							      },
							      "taxExemptSecurity": {
										"id": 8496
							      },
						          "minTradeAmount": 100,
						          "minInitialBuyDollar": 100,
						          "buyPriority": "HARD_TO_BUY",
						          "sellPriority": "HARD_TO_SELL",
						          "rank" : 0
						        }
						      ],
						      "tlh": [
								{
						          "id": 9409,
						          "priority": 1
						        },
						        {
						          "id": 331252,
						          "priority": 2
						        }
							  ]
						    }
				]
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securityset/1
 * 
 * @apiSuccess {Number}        id						Security set Id.
 * @apiSuccess {String}        name						Name of Security set.
 * @apiParam   {String}        toleranceType			Tolerance type can two values ABSOLUTE, BAND.
 * @apiParam   {Number}        toleranceTypeValue			Tolerance Value.
 * @apiSuccess {Number}        description				Description of Security set.
 * @apiSuccess {Number}        isDeleted				Security set exists in system or not.
 * @apiSuccess {Date}          createdOn				Creation Date of security set.
 * @apiSuccess {Number}        createdBy				Full Name of User of who created security set in system.
 * @apiSuccess {Date}          editedOn					Edited Date of security set.
 * @apiSuccess {Number}        editedBy					Full  Name of User of who edited security set in system.
 * @apiSuccess {Security[]}    securities				Full Name of User of who edited security set in system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		{
		  "id": 1,
		  "name": "first",
		  "description": "my first security set",
		  "toleranceType" : "ABSOLUTE",
		  "toleranceTypeValue" : 0,
		  "createdOn": "2016-08-02T10:14:54.000Z",
		  "createdBy": "Prime TGI",
		  "editedOn": "2016-08-10T09:00:18.000Z",
		  "editedBy": "Prime Prime",
		  "securities": [
		    {
		      "id": 8496,
		      "name": "Sysco Corporation",
		      "symbol": "SYY",
		      "rank" : 1,
		      "targetPercent": 50,
		      "lowerModelTolerancePercent": 5,
		      "upperModelTolerancePercent": 5,
		      "lowerModelToleranceAmount": 5,
		      "upperModelToleranceAmount": 5,
		      "taxableSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "taxDeferredSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "taxExemptSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "minTradeAmount": 100,
		      "minInitialBuyDollar": 100,
		      "buyPriority": {
			    "id": 1,
			    "displayName": "Do Not Buy",
			    "code": "DO_NOT_BUY"
			  },
		      "sellPriority": {
			    "id": 1,
			    "displayName": "Do Not Buy",
			    "code": "DO_NOT_BUY"
			  },
		      "equivalences": [
		        {
		          "id": 15727,
		          "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		          "symbol": "IYC",
		          "taxableSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxDeferredSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxExemptSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "minTradeAmount": 100,
		          "minInitialBuyDollar": 100,
		          "buyPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "sellPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "rank" : 0
		        }
		      ],
		      "tlh": [
		        {
		          "id": 9409,
		          "name": "Medtronic PLC",
		          "symbol": "MDT",
		          "priority": 3
		        }
		      ]
		    },
		    {
		      "id": 9409,
		      "name": "Medtronic PLC",
		      "symbol": "MDT",
		      "targetPercent": 50,
		      "lowerModelTolerancePercent": 5,
		      "upperModelTolerancePercent": 5,
		      "lowerModelToleranceAmount": 5,
		      "upperModelToleranceAmount": 5,
		      "taxableSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "taxDeferredSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "taxExemptSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "minTradeAmount": 100,
		      "minInitialBuyDollar": 100,
		      "buyPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		      "sellPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		      "equivalences": [
		        {
		          "id": 15727,
		          "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		          "symbol": "IYC",
		          "taxableSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxDeferredSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxExemptSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "minTradeAmount": 100,
		          "minInitialBuyDollar": 100,
		          "buyPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "sellPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "rank" : 0
		        }
		      ],
		      "tlh": [
		        {
		          "id": 331252,
		          "name": "iShares Tr FTSE NAREIT Mortgage REITs",
		          "symbol": "REM",
		          "priority": 1
		        },
		        {
		          "id": 9409,
		          "name": "Medtronic PLC",
		          "symbol": "MDT",
		          "priority": 2
		        }
		      ]
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

app.put("/:id", validate({ params: securitySetIdSchema }),  
		validate({ body : updateSecuritySetSchema }),
		analysisMiddleware.post_import_analysis,
		function(req, res){
	logger.info("update security set details by id in request received");
	
	var securitySetId = req.params.id;
	var data = req.data;
	data.id = securitySetId;
	securitySetConverter.getSecuritySetCompleteModelFromSecuritySetRequest(data, function(err, model){
		SecuritySetService.createSecuritySet(model, function(err, status, data){
			response(err, status, data, res);
		});		
	});
});


/**
 * @api {post} /security/securityset Create Security set
 * @apiName CreateSecuritySet
 * @apiVersion 1.0.0
 * @apiGroup SecuritySet
 * @apiPermission appuser
 *
 * @apiDescription This API Creates Security Set. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}        name					Name of Security set.
 * @apiParam {Number}        description			Description of Security set.
 * @apiParam {Security[]}    securities				Full Name of User of who edited security set in system.
 * 
 * @apiParamExample {json} Request-Example:
 *     {
		  "name": "first",
		  "description": "my first security set",
		  			"toleranceType" : "ABSOLUTE",
			"toleranceTypeValue" : 0,
		  "securities": [
						    {
						      "id": 8496,
						      "targetPercent": 50,
						      "lowerModelTolerancePercent": 5,
						      "upperModelTolerancePercent": 5,
						      "lowerModelToleranceAmount": 5,
						      "upperModelToleranceAmount": 5,
						      "rank" :0, 
						      "taxableSecurity": {
									"id": 8496
						      },
						      "taxDeferredSecurity" :{
									"id": 8496
						      },
						      "taxExemptSecurity": {
									"id": 8496
						      },
						      "minTradeAmount": 100,
						      "minInitialBuyDollar": 101,
						      "buyPriority": {
						      	id : 1
						      },
						      "sellPriority": {id : 1},
						      "equivalences": [
						        {
						          "id": 15727,
						          "taxableSecurity": {
									"id": 8496
							      },
							      "taxDeferredSecurity" :{
										"id": 8496
							      },
							      "taxExemptSecurity": {
										"id": 8496
							      },
						          "minTradeAmount": 100,
						          "minInitialBuyDollar": 101,
						          "buyPriority": {
							      	id : 1
							      },
							      "sellPriority": {id : 1},
						          "rank" : 0
						        }
						      ],
						      "tlh": [
						        {
						          "id": 9409,
						          "priority": 2
						        }
						      ]
						    },
						    {
						      "id": 9409,
						     "targetPercent": 50,
						      "lowerModelTolerancePercent": 5,
						      "upperModelTolerancePercent": 5,
						      "lowerModelToleranceAmount": 5,
						      "upperModelToleranceAmount": 5,
						      "taxableSecurity": {
									"id": 8496
						      },
						      "taxDeferredSecurity" :{
									"id": 8496
						      },
						      "taxExemptSecurity": {
									"id": 8496
						      },
						      "minTradeAmount": 100,
						      "minInitialBuyDollar": 100,
						      "buyPriority": {
						      	id : 1
						      },
						      "sellPriority": {id : 1},
						      "equivalences": [
						        {
						          "id": 15727,
						          "taxableSecurity": {
									"id": 8496
							      },
							      "taxDeferredSecurity" :{
										"id": 8496
							      },
							      "taxExemptSecurity": {
										"id": 8496
							      },
						          "minTradeAmount": 100,
						          "minInitialBuyDollar": 100,
						          "buyPriority": "HARD_TO_BUY",
						          "sellPriority": "HARD_TO_SELL",
						          "rank" : 0
						        }
						      ],
						      "tlh": [
								{
						          "id": 9409,
						          "priority": 1
						        },
						        {
						          "id": 331252,
						          "priority": 2
						        }
							  ]
						    }
				]
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securityset/1
 * 
 * @apiSuccess {Number}        id						Security set Id.
 * @apiSuccess {String}        name						Name of Security set.
 * @apiParam   {String}        toleranceType			Tolerance type can two values ABSOLUTE, BAND.
 * @apiParam   {Number}        toleranceTypeValue			Tolerance Value.
 * @apiSuccess {Number}        description				Description of Security set.
 * @apiSuccess {Number}        isDeleted				Security set exists in system or not.
 * @apiSuccess {Date}          createdOn				Creation Date of security set.
 * @apiSuccess {Number}        createdBy				Full Name of User of who created security set in system.
 * @apiSuccess {Date}          editedOn					Edited Date of security set.
 * @apiSuccess {Number}        editedBy					Full  Name of User of who edited security set in system.
 * @apiSuccess {Security[]}    securities				Full Name of User of who edited security set in system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
		{
		  "id": 1,
		  "name": "first",
		  "description": "my first security set",
		  "toleranceType" : "ABSOLUTE",
		  "toleranceTypeValue" : 0,
		  "createdOn": "2016-08-02T10:14:54.000Z",
		  "createdBy": "Prime TGI",
		  "editedOn": "2016-08-10T09:00:18.000Z",
		  "editedBy": "Prime Prime",
		  "securities": [
		    {
		      "id": 8496,
		      "name": "Sysco Corporation",
		      "symbol": "SYY",
		      "rank" : 1,
		      "targetPercent": 50,
		      "lowerModelTolerancePercent": 5,
		      "upperModelTolerancePercent": 5,
		      "lowerModelToleranceAmount": 5,
		      "upperModelToleranceAmount": 5,
		      "taxableSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "taxDeferredSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "taxExemptSecurity": {
		        "id": 8496,
		        "name": "Sysco Corporation",
		        "symbol": "SYY"
		      },
		      "minTradeAmount": 100,
		      "minInitialBuyDollar": 100,
		      "buyPriority": {
			    "id": 1,
			    "displayName": "Do Not Buy",
			    "code": "DO_NOT_BUY"
			  },
		      "sellPriority": {
			    "id": 1,
			    "displayName": "Do Not Buy",
			    "code": "DO_NOT_BUY"
			  },
		      "equivalences": [
		        {
		          "id": 15727,
		          "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		          "symbol": "IYC",
		          "taxableSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxDeferredSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxExemptSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "minTradeAmount": 100,
		          "minInitialBuyDollar": 100,
		          "buyPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "sellPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "rank" : 0
		        }
		      ],
		      "tlh": [
		        {
		          "id": 9409,
		          "name": "Medtronic PLC",
		          "symbol": "MDT",
		          "priority": 3
		        }
		      ]
		    },
		    {
		      "id": 9409,
		      "name": "Medtronic PLC",
		      "symbol": "MDT",
		      "targetPercent": 50,
		      "lowerModelTolerancePercent": 5,
		      "upperModelTolerancePercent": 5,
		      "lowerModelToleranceAmount": 5,
		      "upperModelToleranceAmount": 5,
		      "taxableSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "taxDeferredSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "taxExemptSecurity": {
		        "id": 8496,
		        "name": "Medtronic PLC",
		        "symbol": "MDT"
		      },
		      "minTradeAmount": 100,
		      "minInitialBuyDollar": 100,
		      "buyPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		      "sellPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		      "equivalences": [
		        {
		          "id": 15727,
		          "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		          "symbol": "IYC",
		          "taxableSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxDeferredSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "taxExemptSecurity": {
		            "id": 15727,
		            "name": "iShares Dow Jones US Consumer Cyclical Sector Index",
		            "symbol": "IYC"
		          },
		          "minTradeAmount": 100,
		          "minInitialBuyDollar": 100,
		          "buyPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "sellPriority": {
				    "id": 1,
				    "displayName": "Do Not Buy",
				    "code": "DO_NOT_BUY"
				  },
		          "rank" : 0
		        }
		      ],
		      "tlh": [
		        {
		          "id": 331252,
		          "name": "iShares Tr FTSE NAREIT Mortgage REITs",
		          "symbol": "REM",
		          "priority": 1
		        },
		        {
		          "id": 9409,
		          "name": "Medtronic PLC",
		          "symbol": "MDT",
		          "priority": 2
		        }
		      ]
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
app.post("/",
		validate({ body : updateSecuritySetSchema }),
		analysisMiddleware.post_import_analysis,
		function(req, res){
	logger.info(" create security set details by id in request received");
	
	var securitySetId = req.params.id;
	var data = req.data;
	data.id = securitySetId;
	securitySetConverter.getSecuritySetCompleteModelFromSecuritySetRequest(data, function(err, model){
		SecuritySetService.createSecuritySet(model, function(err, status, data){
			response(err, status, data, res);
		});		
	});
});

/**
 * @api {delete} /security/securityset/:id Delete SecuritySet 
 * @apiName DeleteSecuritySet
 * @apiVersion 1.0.0
 * @apiGroup SecuritySet
 * @apiPermission appuser
 *
 * @apiDescription This API deletes Security Set (soft delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securityset/1
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "SecuritySet deleted successfully"
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
 * @apiError Unprocessable_Entity When Security Set does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *     {
 *       "message": " Security Set Not Found "
 *     }
 * 
 */

app.delete("/:id", validate({ params: securitySetIdSchema }),  
		function(req, res){
	logger.info("delete security set details by id in request received");
	
	var securitySetId = req.params.id;
	var data = req.data;
	data.id = securitySetId;
	securitySetConverter.getSecuritySetCompleteModelFromSecuritySetRequest(data, function(err, model){
		SecuritySetService.deleteSecuritySet(model, function(err, status, data){
			response(err, status, data, res);
		});		
	});
});


/**
 * @api {put} /security/securityset/favorites/:id Create Security set favorite
 * @apiName CreateSecuritySetAsFavorite
 * @apiVersion 1.0.0
 * @apiGroup SecuritySet
 * @apiPermission appuser
 *
 * @apiDescription This API create security set as favorite. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Boolean}         isFavorite					 Just to tell whether this is favorite or not
 * 
 * @apiParamExample {json} Request-Example:
		{
			   "isFavorite" : BOOLEAN
		}

 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/security/securityset/favorites/:id
 * 
 * @apiSuccess {String}          message                          Favorites updated.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
		{
		    "message": "security-set set/unset as favorite"
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
app.put('/favorites/:id', function (req, res) {
	logger.info(" Set Favorites To Security Set ");
    
    var data = req.data;
    var id = req.params.id;    
    data.id = id;
    
	SecuritySetService.setUnsetFavoriteForSecuritySet(data, function (err, status, data) {
		return response(err, status, data, res);    	
	});
});


module.exports = app;