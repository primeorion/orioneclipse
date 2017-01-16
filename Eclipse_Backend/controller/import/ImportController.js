"use strict";

var moduleName = __filename;
var app = require("express")();
var helper = require('helper');
var response = require('controller/ResponseController.js');
var sharedCache = require('service/cache/').shared;
var ImportService = require('service/import/ImportService.js');
var importService = new ImportService();
var SleeveService = require('service/sleeve/SleeveService.js');
var sleeveService = new SleeveService();
var logger = helper.logger(moduleName);
var validate = helper.validate;
var localCache = require('service/cache/').local;

app.use(require('middleware/DBConnection.js').common); // add common connection cabability in user

var postDataImport = {
    type: 'object',
    properties: {
        inputDir: {
            type: 'string',
            required: true
        },

    }
};
var sleeveDataSync = {
    type: 'object',
    properties: {
        accounts: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                  orionFirmId: {
                      type: 'number',
                      required: true
                  },
                  externalId: {
                      type: 'number',
                      required: true
                  },
                  accountNumber: {
                      type: 'string',
                      required: true
                  },
                  accountId: {
                      type: 'number',
                      required: true
                  },
                  accountName: {
                      type: 'string',
                      required: true
                  },
                  portfolioId: {
                      type: 'string',
                      required: true
                  },
                  portfolioName: {
                      type: 'string',
                      required: true
                  },
                  householdId: {
                      type: 'number',
                      required: true
                  },
                  householdName: {
                      type: 'string',
                      required: true
                  },
                  accountType: {
                      type: 'string',
                      required: true
                  },
                  taxable: {
                      enum : [0,1, true, false],
                      required: true
                  },
                  accountYTDRealizedSTGL: {
                      type: 'number',
                      required: true
                  },
                  accountYTDRealizedLTGL: {
                      type: 'number',
                      required: true
                  },
                  sSN: {
                      type: 'string',
                      required: true
                  },
                  sweepSymbol: {
                      type: 'string',
                      required: true
                  },
                  sleeveType: {
                      type: 'string',
                      required: true
                  },
                  sleeveTarget: {
                      type: 'number',
                      required: true
                  },
                  sleeveContributionPercent: {
                      type: 'number',
                      required: true
                  },
                  sleeveDistributionPercent: {
                      type: 'number',
                      required: true
                  },
                  sleeveToleranceLower: {
                      type: 'number',
                      required: true
                  },
                  sleeveToleranceUpper: {
                      type: 'number',
                      required: true
                  },
                  sMA: {
                      enum : [0,1, true, false],
                      required: true
                  },
                  sMATradeable: {
                       enum : [0,1, true, false],
                      required: true
                  },
                  billingAccount: {
                       enum : [0,1, true, false],
                      required: true
                  },
                  systematicAmount: {
                      type: 'number',
                      required: true
                  },
                  systematicDate: {
                      type: 'string',
                      required: true
                  },
                  hashedSSN: {
                      type: 'string',
                      required: true
                  },
                  sleeveStrategyName: {
                      type: 'string',
                      required: true
                  },
                  sleeveContributionMethod: {
                      type: 'string',
                      required: true
                  },
                  sleeveDistributionMethod: {
                      type: 'string',
                      required: true
                  },
                  registrationId: {
                      type: 'number',
                      required: true
                  },
                  custodian: {
                      type: 'object',
                      properties: {
                        masterAccountNumber: {
                            type: 'string',
                            required: true
                        },
                        externalId: {
                            type: 'number',
                            required: true
                        },
                        name: {
                            type: 'string',
                            required: true
                        },
                        code: {
                            type: 'string',
                            required: true
                        }
                      },
                      required: true
                  },
                  advisor: {
                      type: 'object',
                      properties: {
                        name: {
                            type: 'string',
                            required: true
                        },
                        externalId: {
                            type: 'number',
                            required: true
                        },
                        number: {
                            type: 'string',
                            required: true
                        },
                        brokerDealer: {
                            type: 'string',
                            required: true
                        }
                      },
                      required: true
                  },
                  holdings: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        externalId: {
                            type: 'number',
                            required: true
                        },
                        symbol: {
                            type: 'string',
                            required: true
                        },
                        price: {
                            type: 'number',
                            required: true
                        },
                        priceDate: {
                            type: 'string',
                            required: true
                        },
                        marketValue: {
                            type: 'number',
                            required: true
                        },
                        quantity: {
                            type: 'number',
                            required: true
                        },
                        positionYTDRealizedSTGL: {
                            type: 'number',
                            required: true
                        },
                        positionYTDRealizedLTGL: {
                            type: 'number',
                            required: true
                        }
                      },
                      required: true
                    },
                    required: true
                  },
                  realizedGainLosses: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        externalId: {
                            type: 'number',
                            required: true
                        },
                        symbol: {
                            type: 'string',
                            required: true
                        },
                        grossProceeds: {
                            type: 'number',
                            required: true
                        },
                        netProceeds: {
                            type: 'number',
                            required: true
                        },
                        costAmount: {
                            type: 'number',
                            required: true
                        },
                        dateAquired: {
                            type: 'string',
                            required: true
                        },
                        sellDate: {
                            type: 'string',
                            required: true
                        },
                        quantity: {
                            type: 'number',
                            required: true
                        },
                        longTerm: {
                            enum : [0,1, true, false],
                            required: true
                        },
                        sellMethod: {
                            type: 'string',
                            required: true
                        },
                        totalGains: {
                            type: 'number',
                            required: true
                        }
                      },
                      required: true
                    },
                    required: true
                  },
                  securities: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        externalId: {
                            type: 'number',
                            required: true
                        },
                        symbol: {
                            type: 'string',
                            required: true
                        },
                        price: {
                            type: 'number',
                            required: true
                        },
                        name: {
                            type: 'string',
                            required: true
                        },
                        securityType: {
                            type: 'string',
                            required: true
                        },
                        assetCategory: {
                            type: 'string',
                            required: true
                        },
                        assetClass: {
                            type: 'string',
                            required: true
                        },
                        subClass: {
                            type: 'string',
                            required: true
                        },
                        maturityDate: {
                            type: 'string',
                            required: true
                        },
                        isCustodialCash: {
                            enum : [0,1, true, false],
                            required: true
                        }
                      },
                      required: true
                    },
                    required: true
                  },
                  taxLots: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        externalId: {
                            type: 'number',
                            required: true
                        },
                        symbol: {
                            type: 'string',
                            required: true
                        },
                        dateAcquired: {
                            type: 'string',
                            required: true
                        },
                        quantity: {
                            type: 'number',
                            required: true
                        },
                        costAmount: {
                            type: 'number',
                            required: true
                        },
                        costPerShare: {
                            type: 'number',
                            required: true
                        },
                        price: {
                            type: 'number',
                            required: true
                        },
                        marketValue: {
                            type: 'number',
                            required: true
                        },
                        priceDate: {
                            type: 'string',
                            required: true
                        }
                      },
                      required: true
                    },
                    required: true
                  },
                  transactions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        externalId: {
                            type: 'number',
                            required: true
                        },
                        symbol: {
                            type: 'string',
                            required: true
                        },
                        tradeDate: {
                            type: 'string',
                            required: true
                        },
                        quantity: {
                            type: 'number',
                            required: true
                        },
                        amount: {
                            type: 'number',
                            required: true
                        },
                        type: {
                            type: 'string',
                            required: true
                        },
                        action: {
                            type: 'string',
                            required: true
                        },
                        tradeCost: {
                            type: 'number',
                            required: true
                        },
                        eclipseTradeOrderId: {
                            type: 'number',
                            required: true
                        },
                        status: {
                            type: 'string',
                            required: true
                        },
                      },
                      required: true
                    },
                    required: true
                  },
                }
            },
            required: true
        },

    }
};
var regularImport = {
  type: "object",
  properties: {
    firmId: {
      type: "number",
      required: true
    },
    status: {
      type: "string",
      required: true
    },
    sessionId: {
      type: ["string", null],
    },
    bucket: {
      type: "string",
      required: true
    },
    path: {
      type: "string",
      required: true
    }    
  }
}
/**
 * @apiIgnore Not needed now
 * @api {post} /dataimport/action/initiate Import Process Notification 
 * @apiName DataImportNotification
 * @apiVersion 1.0.0
 * @apiGroup Import
 * 
 * @apiDescription This API notify the import process about data file upload on S3  
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 *  
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json    
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dataimport/action/initiate
 * 
 * @apiParam {String}       inputDir       AWS S3 path of uploaded data file
  
 * @apiParamExample {json} Request-Example:
 *     {
 *        "inputDir": "Firm Data New/firm1000/2016/July/week28/15_07_2016/"
 *     }
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "Message": "Successfully notified data import startup process."
 *     }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 * @apiError Bad_Request When passed inappropriate request data.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *       "message": "Unable to notify import process, please contact administrator."
 *     }
 */

// app.post('/action/initiate/', validate({ body: postDataImport }), function (req, res) {
//     logger.info("Data import notificatipon request received");
//     var data = req.data;
//     data.inputDir = req.body.inputDir;
//     importService.dataImport(req.data, function (err, status, data) {
//         return response(err, status, data, res);
//     });

// });

/**
 * @api {post} /dataimport/action/initiate/sleeveSync Sleeve Sync From Orion Connect 
 * @apiName Sleeve Sync
 * @apiVersion 1.0.0
 * @apiGroup Import
 * 
 * @apiDescription This API sync sleeve from orion connect to orion eclipse  
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 *  
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json    
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dataimport/action/initiate/sleeveSync
 * 
 * @apiParam {Number}       orionFirmId                 Firm Id from Orion Connect
 * @apiParam {Number}       externalId                  External Id from Orion Connect
 * @apiParam {Number}       accountId                   Account Id from Orion Connect
 * @apiParam {String}       accountNumber               Account Number from Orion Connect
 * @apiParam {String}       portfolioId                 Portfolio Id from Orion Connect
 * @apiParam {String}       portfolioName               Portfolio Name from Orion Connect
 * @apiParam {Number}       householdId                 Household Id from Orion Connect
 * @apiParam {String}       householdName               Household Name from Orion Connect
 * @apiParam {Boolean}      taxable                     Is Taxable from Orion Connect
 * @apiParam {Amount}       accountYTDRealizedSTGL      Account YTD Realized STGL from Orion Connect
 * @apiParam {Amount}       accountYTDRealizedLTGL      Account YTD Realized LTGL from Orion Connect
 * @apiParam {String}       sSN                         Social Security Number from Orion Connect
 * @apiParam {String}       sweepSymbol                 Sweep Symbol from Orion Connect
 * @apiParam {String}       sleeveType                  Sleeve Type from Orion Connect
 * @apiParam {Number}       sleeveTarget                Sleeve Target from Orion Connect
 * @apiParam {Number}       sleeveContributionPercent   Sleeve Contribution Method Percent from Orion Connect
 * @apiParam {Number}       sleeveDistributionPercent   Sleeve Distribution Method Percent from Orion Connect
 * @apiParam {Number}       sleeveToleranceLower        Sleeve Lower Tolerance from Orion Connect
 * @apiParam {Number}       sleeveToleranceUpper        Sleeve Uper Tolerance from Orion Connect
 * @apiParam {Boolean}      sMA                         SMA from Orion Connect
 * @apiParam {Boolean}      sMATradeable                Is SMA Tradeable from Orion Connect
 * @apiParam {Boolean}      billingAccount              Is Billing Account from Orion Connect
 * @apiParam {Amount}       systematicAmount            Systematic Amount from Orion Connect
 * @apiParam {Date}         systematicDate              Systematic Date from Orion Connect
 * @apiParam {String}       hashedSSN                   Hashed Social Security Number from Orion Connect
 * @apiParam {String}       sleeveStrategyName          Sleeve Strategy Name from Orion Connect
 * @apiParam {String}       sleeveContributionMethod    Sleeve Contribution Method from Orion Connect
 * @apiParam {String}       sleeveDistributionMethod    Sleeve Distribution Method from Orion Connect
 * @apiParam {Number}       registrationId              Registration Id from Orion Connect
 * @apiParam {Object}       custodian                   Custodian from Orion Connect
 * @apiParam {Object}       advisor                     Advisor from Orion Connect
 * @apiParam {Array}        holdings                    Holdings from Orion Connect
 * @apiParam {Array}        realizedGainLosses          RealizedGainLosses from Orion Connect
 * @apiParam {Array}        securities                  Securities from Orion Connect
 * @apiParam {Array}        taxLots                     TaxLots from Orion Connect
 * @apiParam {Array}        transactions                Transactions from Orion Connect
  
 * @apiParamExample {json} Request-Example:
 *     {"accounts":[
  {
  "orionFirmId": 477,
  "externalId": 1295,
  "accountId": 124563,
  "accountNumber": "23423423432423423",
  "accountName": "test account",
  "portfolioId": "1",
  "portfolioName": "test portfolio",
  "householdId": 127673,
  "householdName": "test house",
  "accountType": "IANKUI",
  "taxable": 1,
  "accountYTDRealizedSTGL": 500,
  "accountYTDRealizedLTGL": 1000,
  "sSN": "test ssn",
  "sweepSymbol": "KK",
  "sleeveType": "main sleeve",
  "sleeveTarget": 30,
  "sleeveContributionPercent": 10,
  "sleeveDistributionPercent": 20,
  "sleeveToleranceLower": 22,
  "sleeveToleranceUpper": 13,
  "sMA": false,
  "sMATradeable": 0,
  "billingAccount": 1,
  "systematicAmount": 1200,
  "systematicDate": "",
  "hashedSSN": "a7f7f2589e1e984e37117bc550e17e9e",
  "sleeveStrategyName": " test sleeve strategy",
  "sleeveContributionMethod": "contrib method",
  "sleeveDistributionMethod": "distrib method",
  "registrationId": 1470,
  "custodian": {
    "masterAccountNumber": "1",
    "externalId": 12,
    "name": "test cust name",
    "code": "132"
    
  },
  "advisor": {
    "name": "test adv name",
    "externalId": 31,
    "number": "advisor number",
    "brokerDealer": ""
    
  },
  "holdings": [
    {
      "externalId": 12983,
      "symbol": "MLPSX",
      "price": 1.000,
      "priceDate": "9/29/2016 12:00:00 AM",
      "marketValue": 7.000,
      "quantity": 5.000,
      "positionYTDRealizedSTGL": 0.00,
      "positionYTDRealizedLTGL": 0.01
      
    }
  ],
  "realizedGainLosses": [
    {
      "externalId": 67,
      "symbol": "MLPSX",
      "grossProceeds": 8.00,
      "netProceeds": 8.98,
      "costAmount": 35.67,
      "dateAquired": "2016-08-23 00:00:00",
      "sellDate": "2016-08-23 00:00:00",
      "quantity": 3.00,
      "longTerm": 1,
      "sellMethod": "sell meth",
      "totalGains": 3.00
      
    }
  ],
  "securities": [
    {
      "externalId": 234,
      "symbol": "MLPSX",
      "name": "test sec",
      "price": 35.02,
      "securityType": "sec type",
      "assetCategory": "sec cat",
      "assetClass": "ass cla",
      "subClass": "none",
      "maturityDate": "03/06/2016",
      "isCustodialCash": false
      
    }
  ],
  "taxLots": [
    {
      "externalId": 647,
      "symbol": "CUSTODIAL_CASH",
      "dateAcquired": "03/05/2016",
      "quantity": 1.00,
      "costAmount": 345.03,
      "costPerShare":1.03,
      "price": 22.30,
      "marketValue": 21.09,
      "priceDate": "9/29/2016 12:00:00 AM"
      
    }
  ],
  "transactions": [
    {
      "externalId": 3254,
      "symbol": "TestEQ16.53",
      "tradeDate": "04/03/2016",
      "quantity": 3.05,
      "amount": 32.06,
      "type": "sell exchange",
      "action": "sell",
      "tradeCost": 0.00,
      "eclipseTradeOrderId":1435 ,
      "status": "not confirmed"
      
    }
  ]
}
]
}


 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "Message": "Sleeve Sync process completed successfully."
 *     }
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 * @apiError Bad_Request When passed inappropriate request data.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *       "message": "Unable to start sleeve sync import process, please contact administrator."
 *     }
 */

app.post('/action/initiate/sleeveSync', validate({ body: sleeveDataSync }), function (req, res) {
    logger.info("Sleeve Data Sync request received");
    var data = req.data;
    sleeveService.sleeveSync(data, function (err, status, data) {
      if(err){
        res.status(500);
        return res.send({message:err});
      }
      res.status(200);
      return res.send(data);
    });

});

/**
 * @api {post} /dataimport/initiate Import File Check & Trigger ETL Process
 * @apiName Trigger ETL after upload on S3
 * @apiVersion 1.0.0
 * @apiGroup Import
 * 
 * @apiDescription This API notify the import process about data file upload on S3  
 * 
 * @apiHeader {String} PreSharedKey Preshared Key shared with user.
 *  
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Super nbffertsupereyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json    
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dataimport/initiate
 * 
 * @apiParam {Integer}      firmId      Connect Firm Id
 * @apiParam {String}       status      Status of Extraction (e.g. "Extract Started", "Extract Ended")
 * @apiParam {String}       [sessionId] Session Id to track Import Process
 * @apiParam {String}       bucket      Bucket where S3 folder exists
 * @apiParam {String}       path        AWS S3 path of uploaded data files
  
 * @apiParamExample {json} Request-Example:
 *     {
 *        "firmId": 488,
 *        "status": "Extract Started",
 *        "bucket": "orioneclipse",
 *        "path": "extracts/test/1100/2016/12/6/"
 *     }
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "sessionId": "187292fe27d8fbdfa2c0e9b1adeadd080c8c4002fdd725b8ada12d664eb44e8c"
 *     }
 *
  * @apiParamExample {json} Request-Example:
 *     {
 *        "firmId": 488,
 *        "status": "Extract Ended",
 *        "sessionId": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
 *        "bucket": "orioneclipse",
 *        "path": "extracts/test/1100/2016/12/6/"
 *     }
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "message": "ETL Process ran successfully!!! Import Analysis Started!!!"
 *     }
 *
 * @apiError Unauthorized Invalid Preshared Token.
 * @apiError Bad_Request When passed inappropriate request data.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized Header
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Invalid Data
 *     {
 *       "message": "Invalid Input Data!!! Check your Data like Session, Status, etc."
 *     }
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *       "message": "Unable to start ETL Process!!! Please contact Administrator."
 *     }
 */

app.post('/initiate', validate({ body: regularImport }), function (req, res) {    
    logger.info("Data import verification on S3 and triggering ETL started");    
    var data = req.data;    
    data.params = req.body;
    importService.initETL(data, function (err, status, data) {
      if(err){
        res.status(500);
        return res.send({message:err});
      }else{
        res.status(200);
        return res.send(data);  
      }             
    });

});

/**
 * @api {post} /dataimport/action/initiatefull Initiate full import process
 * @apiName Trigger Initiate full import process
 * @apiVersion 1.0.0
 * @apiGroup Import
 * 
 * @apiDescription This API initiate full import process 
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 *  
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json    
 *     }
 *  

 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dataimport/action/initiatefull
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "message": "Import Initiated successfully"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
  *     {
 *      "message": "Import Initiated successfully"
 *    }
 *
 * @apiError Unauthorized Invalid Preshared Token.
 * @apiError Bad_Request When passed inappropriate request data.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized Header
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 * 
 */
app.post("/action/initiatefull", function (req, res) {
  logger.info("Add full import request received");
  var data = req.data;
  data.importType = 1;
  importService.importData(data, function (err, status, data) {
      return response(err, status, data, res);
  });
});

/**
 * @api {post} /dataimport/action/initiatepartial Initiate partial import process
 * @apiName Trigger Initiate partial import process
 * @apiVersion 1.0.0
 * @apiGroup Import
 * 
 * @apiDescription This API initiate partial import process
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 *  
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json    
 *     }
 *  

 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dataimport/action/initiatepartial
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "message": "Import Initiated successfully"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
  *     {
 *      "message": "Import Initiated successfully"
 *    }
 *
 * @apiError Unauthorized Invalid Preshared Token.
 * @apiError Bad_Request When passed inappropriate request data.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized Header
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 * 
 */
app.post("/action/initiatepartial", function (req, res) {
  logger.info("Add full import request received");
  var data = req.data;
  data.importType = 2;
  importService.importData(data, function (err, status, data) {
      return response(err, status, data, res);
  });
});

/**
 * @api {post} /dataimport/action/accept Accept import process
 * @apiName Trigger Accept import process
 * @apiVersion 1.0.0
 * @apiGroup Import
 * 
  @apiDescription This API accept import process 
 * 
 * @apiHeader {String} JWTToken The JWT auth token.
 *  
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json    
 *     }
 *  

 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dataimport/action/accept
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "message": "Import Initiated successfully"
 *    }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
  *     {
 *      "message": "Import Initiated successfully"
 *    }
 *
 * @apiError Unauthorized Invalid Preshared Token.
 * @apiError Bad_Request When passed inappropriate request data.
 * @apiError INTERNAL_SERVER_ERROR Internal Server Error.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized Header
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 * 
 */
app.post("/action/accept", function (req, res) {
  logger.info("Add full import request received");
  var data = req.data;
  data.importType = 3;
  importService.importData(data, function (err, status, data) {
      return response(err, status, data, res);
  });
});
module.exports = app;