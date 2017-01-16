"use strict";

var moduleName = __filename;
var express = require('express');
var app = express();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var DashboardService = require('service/community/DashboardService.js');
var privilegeValidator = require('middleware/PrivilegeValidator.js').hasPrivilege();

var dashboardService = new DashboardService();
var logger = helper.logger(moduleName);
var validate = helper.validate;
var guid = require('guid');
var moment = require('moment');
moment.locale('en');
app.use(require('middleware/DBConnection').community);

/**@api {get} /community/dashboard/summary Get dashboard data 
 * @apiName GetDashboardSummaryData
 * @apiVersion 1.0.0
 * @apiGroup  Community-Dashboard
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets strategist list. Date is optional Query string. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/dashboard/summary
 * @apiSuccess {Number}       totalStrategist          Total Number of strategist.
 * @apiSuccess {Number}       newStrategist            Strategist created within 24hrs.
 * @apiSuccess {Number}       existingStrategist       Strategist created before 24hrs.
 * @apiSuccess {Number}       totalUsers               Total number of users.
 * @apiSuccess {Number}       newUsers                 Users created within 24hrs.
 * @apiSuccess {Number}       existingUsers            Users created before 24hrs.
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *         {
 *           "totalStrategist": 23,
 *           "newStrategist": 21,
 *           "existingStrategist": 2,
 *           "totalUsers": 2,
 *           "newUsers": 2,
 *           "existingUsers": 0
 *         }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/summary',function (req, res) {
  logger.info("Get dashboard Summary. request received");
  var data = req.data;
  dashboardService.getDashboardSummaryData(data, function (err, status, data) {
    return response(err, status, data, res);
  });
});

/** @api {get} /community/dashboard/account/summary?date={MM/DD/YYYY}&type={firm/model/advisor}
 *  Get Dashboard Account Summary.
 * @apiName GetDashboardAccount 
 * @apiVersion 1.0.0
 * @apiGroup Community-Dashboard
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets dashboard account data based on type requested. Date is optional Query string. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 *
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/dashboard/account/summary?type=firm&date=09/23/216
 * 
 * @apiParam   (QueryParamter)   {string}             Date=MM/DD/YYY Date is optional. 
 * @apiSuccess {String}     name                      Name of firm.
 * @apiSuccess {Number}     noOfAccount               No of accounts associated with firm.
 * @apiSuccess {Number}     percent                   Percent of firm.
 * @apiSuccess {Number}     totalManagedAccount       Total manged account.
 * @apiSuccess {Number}     totalPercent              Total Percent.
 * @apiSuccess {Array}      firms                     Array of firms associated.     
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       totalManagedAccount : 123,
 *       totalPercent : 100,
 *       percentChange : 15,   
 *       firms : [
 *            {
 *              "name": "firm1",
 *              "noOfAccounts": 10,
 *              "percent": 25
 *            },
 *            {
 *               "name": "firm2",
 *               "noOfAccounts": 7,
 *               "percent": 20
 *            },
 *            {
 *              "name": "firm3",
 *              "noOfAccounts": 25,
 *              "percent": 5
 *            },
 *            {
 *              "name": "firm4",
 *              "noOfAccounts": 36,
 *              "percent": 20
 *            },
 *            {
 *              "name": "firm5",
 *              "noOfAccounts": 45,
 *              "percent": 30
 *            }
 *        ]
 *     }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/account/summary', privilegeValidator,function (req, res) {
  logger.info("Get dashboard account firm request received");
  var data = req.data;

  if (req.query.type) {
    data.type = req.query.type;
  }

  if (!req.query.date) {
    return response('Date is missing', 'BAD_REQUEST', null, res);
  }

  if (req.query.date) {
    data.date = moment(new Date(req.query.date)).format('YYYY-MM-DD');
  }

    if (new Date(data.date).getTime() > new Date().getTime()) {
       return response('Invalid Date Rage Selected, end Date is greater than current date', 'BAD_REQUEST', null, res);
     }

  dashboardService.getDashboardAccountData(req.data, function (err, status, data) {
    return response(err, status, data, res);
  });
});

/** @api {get} /community/dashboard/aum/summary?type={model/advisor/firms}&date={MM/DD/YYYY} 
 * Get Dashboard AUM  Summary.   
 * @apiName GetDashboardAUMSummary 
 * @apiVersion 1.0.0
 * @apiGroup Community-Dashboard
 * @apiPermission appstrategist
 *
 * @apiDescription This API gets dashboard AUM  Summary. based on type requested. Date is optional Query param. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/dashboard/aum/summary?type=firm&date=09/23/216
 * @apiParam   (QueryParamter)   {string}             Date=MM/DD/YYY Date is optional 
 * @apiSuccess {String}     name                      Name of a firm.
 * @apiSuccess {Number}     marketValue               Market value .
 * @apiSuccess {Number}     percent                   Percentage value.
 * @apiSuccess {Number}     percentChange             Percentage increase or decrease. Positive values used to show increase whereas negative values shows decrease.
 * @apiSuccess {Number}     totalMarketValue          Sum total of all market values.
 * @apiSuccess {Number}     totalPercent              Sum total of all percent values.
 * @apiSuccess {Number}     totalOneDayBefore         Sum total of .
 * @apiSuccess {Array}      firms                     List of firm containing firm related information..     
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firms": [
 *           {
 *               "name": "firm1",
 *               "marketValue": 1210254,
 *               "percent": 25
 *           },
 *           {
 *               "name": "firm2",
 *               "marketValue": 7522654,
 *               "percent": 20
 *           },
 *           {
 *               "name": "firm3",
 *               "marketValue": 150215,
 *               "percent": 5
 *           },
 *           {
 *               "name": "firm4",
 *               "marketValue": 2510254,
 *               "percent": 30
 *           },
 *           {
 *               "name": "firm5",
 *               "marketValue": 9548436,
 *               "percent": 30
 *           }
 *       ],
 *       "totalMarketValue": 20941813,
 *       "percentChange": 15,
 *       "totalPercent": 100,
 *       "totalOneDayBefore": 3100
 *   } 
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *        "message": "Type parameter is not valid"
 *     }
 */
app.get('/aum/summary', privilegeValidator,function (req, res) {
  logger.info('Request received for aum firms by date.');
  var data = req.data;
  if (req.query.type) {
    data.type = req.query.type;
  }

  if (!req.query.date) {
    return response('Date is missing', 'BAD_REQUEST', null, res);
  }


  if (req.query.date) {
    data.date = moment(new Date(req.query.date)).format('YYYY-MM-DD');
  }

       if (new Date(data.date).getTime() > new Date().getTime()) {
       return response('Invalid date Selected, Date is greater than current date', 'BAD_REQUEST', null, res);
     }

  dashboardService.getDashboardAum(req.data, function (err, status, data) {
    return response(err, status, data, res);
  });
});

/** @api {get} /community/dashboard/cashflow/summary?type={model/advisor/firm}&startDate={MM/DD/YYYY}&endDate={MM/DD/YYYY}
* Get Dashboard Cash Flow Summary..   
* @apiName GetDashboardCashFlowSummary 
* @apiVersion 1.0.0
* @apiGroup Community-Dashboard
* @apiPermission appstrategist
*
* @apiDescription This API gets dashboard Cash Flow Summary. based on type requested. startDate and endDate are optional Query param. 
*
* @apiHeader {String} JWTToken The JWT auth token.
*
* @apiHeaderExample Header-Example:
*      {
*       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
*     }
* 
* @apiExample Example usage:
* curl -i http://baseurl/v1/community/dashboard/cashflow/summary?type=firm&startDate=11/10/2016&endDate=11/26/2016
* 
* @apiParam   (QueryParamter)   {string}           startDate=MM/DD/YYYY If this param is present then it must be followed by endDate value.
* @apiParam   (QueryParamter)   {string}           endDate=MM/DD/YYYY If this param is present then it must pe preceded by startDate value.
* @apiSuccess {String}     name                    Name of a firm.
* @apiSuccess {Number}     distribution            Distribution value.
* @apiSuccess {Number}     contribution            contribution value.
* @apiSuccess {Number}     cashFlow                cashFlow values.
* @apiSuccess {Number}     totalCashFlow           Sum total of CashFlow values.
* @apiSuccess {Number}     totalDistribution       Sum total of Distribution values.
* @apiSuccess {Number}     totalContribution       Sum total of contribution values.
* @apiSuccess {Array}      firms                   List of firm containing firm related information.     
* @apiSuccess {Array}      dailyStatistics         List of dailyStatistics containing daily statics cashflow, distribution related information.     
*  
* @apiSuccessExample {json} Success-Response:
*     HTTP/1.1 200 OK
*   {
      "totalCashflow": 3400,
      "totalDistribution": 1700,
      "totalContribution": 1700,
      "firm": [
        {
          "name": "10",
          "distribution": 300,
          "contribution": 300,
          "cashflow": 600,
          "dailyStatistics": [
            {
              "firmId": 10,
              "name": "10",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-15T18:30:00.000Z"
            },
            {
              "firmId": 10,
              "name": "10",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-16T18:30:00.000Z"
            },
            {
              "firmId": 10,
              "name": "10",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-17T18:30:00.000Z"
            }
          ]
        },
        {
          "name": "11",
          "distribution": 300,
          "contribution": 300,
          "cashflow": 600,
          "dailyStatistics": [
            {
              "firmId": 11,
              "name": "11",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-18T18:30:00.000Z"
            },
            {
              "firmId": 11,
              "name": "11",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-19T18:30:00.000Z"
            },
            {
              "firmId": 11,
              "name": "11",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-20T18:30:00.000Z"
            }
          ]
        },
        {
          "name": "12",
          "distribution": 300,
          "contribution": 300,
          "cashflow": 600,
          "dailyStatistics": [
            {
              "firmId": 12,
              "name": "12",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-21T18:30:00.000Z"
            },
            {
              "firmId": 12,
              "name": "12",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-22T18:30:00.000Z"
            },
            {
              "firmId": 12,
              "name": "12",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-23T18:30:00.000Z"
            }
          ]
        },
        {
          "name": "13",
          "distribution": 200,
          "contribution": 200,
          "cashflow": 400,
          "dailyStatistics": [
            {
              "firmId": 13,
              "name": "13",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-24T18:30:00.000Z"
            },
            {
              "firmId": 13,
              "name": "13",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-25T18:30:00.000Z"
            }
          ]
        },
        {
          "name": "8",
          "distribution": 300,
          "contribution": 300,
          "cashflow": 600,
          "dailyStatistics": [
            {
              "firmId": 8,
              "name": "8",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-09T18:30:00.000Z"
            },
            {
              "firmId": 8,
              "name": "8",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-10T18:30:00.000Z"
            },
            {
              "firmId": 8,
              "name": "8",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-11T18:30:00.000Z"
            }
          ]
        },
        {
          "name": "9",
          "distribution": 300,
          "contribution": 300,
          "cashflow": 600,
          "dailyStatistics": [
            {
              "firmId": 9,
              "name": "9",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-12T18:30:00.000Z"
            },
            {
              "firmId": 9,
              "name": "9",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-13T18:30:00.000Z"
            },
            {
              "firmId": 9,
              "name": "9",
              "distribution": 100,
              "contribution": 100,
              "cashflow": 200,
              "date": "2016-11-14T18:30:00.000Z"
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
* @apiErrorExample Response (example):
*     HTTP/1.1 400 Bad Request
*     {
*        "message":  "Missing parameter {type}"
*     }
* @apiErrorExample Response (example):
*     HTTP/1.1 422 Unprocessable Entity
*     {
*        "message":  "Invalid value for parameter {type}"
*     }
**/
app.get('/cashflow/summary', privilegeValidator,function (req, res) {
  logger.info('Request received for Cash Flow Summary.. , date.');
  var data = req.data;
  if (req.query.type) {
    data.type = req.query.type;
  }
  var startDate = req.query.startDate;
  var endDate = req.query.endDate;

  if (!endDate) {
    return response('EndDate is missing', 'BAD_REQUEST', null, res);
  }

  if (!startDate) {
    return response('StartDate is missing', 'BAD_REQUEST', null, res);
  }

  // if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
  //   return response('Invalid format', 'BAD_REQUEST', null, res);
  // }

  var sd = moment(new Date(startDate)).format('YYYY-MM-DD');
  var ed = moment(new Date(endDate)).format('YYYY-MM-DD');

  if (new Date(sd).getTime() > new Date(ed).getTime()) {
    return response('Invalid Date Rage Selected, start date is greater than end date', 'BAD_REQUEST', null, res);
  }

  if (new Date(ed).getTime() > new Date().getTime()) {
    return response('Invalid Date Rage Selected, end Date is greater than current date', 'BAD_REQUEST', null, res);
  }

  data.startDate = sd;
  data.endDate = ed;
  dashboardService.getCashFlowSummaryByType(data, function (err, status, data) {
    return response(err, status, data, res);
  });
});


module.exports = app;