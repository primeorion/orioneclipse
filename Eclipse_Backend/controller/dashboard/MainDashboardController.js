"use strict";

var app = require("express")();
var util = require("util");
var moduleName = __filename;
var helper = require("helper");

var logger = require("helper/Logger.js")(moduleName);
var response = require("controller/ResponseController.js");
var MainDashboardService = require('service/dashboard/MainDashboardService.js');
var mainDashboardService = new MainDashboardService();
app.use(require('middleware/DBConnection').common);
/**
@api {get} /dashboard/main/summary  Get main dashboard summary
* @apiName GetMainDashboardSummary
* @apiVersion 1.0.0
* @apiGroup  Dashboard
* @apiPermission appUser
*
* @apiDescription This api will be used to get main dashboard summary
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*     {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/dashboard/main/summary

* @apiSuccess {Object}     importAnalysisSummary                  Import Analysis Summary
* @apiSuccess {Array}     warningsSummary                    Warning Summary
*  
* @apiSuccessExample {json} Success-Response:
* HTTP/1.1 200 OK
  {
   "importAnalysisSummary": {
      "lastImportedDate":"01/01/2016",
      "warnings":100,
      "errors":25,
      "latestAvailableImport":"05/05/2016",
      "isAutoImport": true,
      "totalAUM":1500000,
      "changeInAum":5,
      "lastImportPorcessTime":35,
      "priceRange": {
         "maxPriceDate":"01/01/2016",
         "securityCount":12
      }
   },
   "warningsSummary":[
      {
         "moduleName":"Portfolio",
         "total":300,
         "warning":40
      },
      {
         "moduleName":"Accounts",
         "total":300,
         "warning":40
      },
      {
         "moduleName":"Holdings",
         "total":300,
         "warning":40
      },
      {
         "moduleName":"models",
         "total":300,
         "warning":40
      },
      {
         "moduleName":"tradeOrders",
         "total":300,
         "warning":40
      }
   ]
  }
* @apiError Unauthorized Invalid/Without JWT Token.
*
* @apiErrorExample Response (example):
*     HTTP/1.1 401 Unauthorized
*     {
*       "message": "Invalid Authorization Header""
*     }
*/


app.get("/summary", function (req, res) {
  logger.info("Get main dashboard request received");
  /* var data =  
   {
    "importAnalysisSummary": {
       "lastImportedDate":"2016-12-23T07:04:25.000Z",
       "warnings":8300,
       "errors":0,
       "latestAvailableImport":"11/21/2016",
       "totalAUM":5630.00,
       "changeInAum":0.00,
       "lastImportPorcessTime":35,
       "priceRange": {
          "maxPriceDate":"2016-12-12T00:00:00.000Z",
          "securityCount":3
       }
    },
    "warningsSummary":[
       {
          "moduleName":"Portfolios",
          "total":15,
          "warning":6
       },
       {
          "moduleName":"Accounts",
          "total":1022,
          "warning":1022
       },
       {
          "moduleName":"Holdings",
          "total":393,
          "warning":1
       },
       {
          "moduleName":"Models",
          "total":239,
          "warning":113
       },
       {
          "moduleName":"TradeOrders",
          "total":30,
          "warning":0
       }
    ]
   };
   return response(null, 200, data, res);*/
  mainDashboardService.getSummary(req.data, function (err, status, data) {
      return response(err, status, data, res);
  });
});


module.exports = app;