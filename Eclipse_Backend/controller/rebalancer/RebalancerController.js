"use strict";

var app = require("express")();

var moduleName = __filename;

var config = require('config');
var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');
var UserTeamAccessMiddleWare = require("middleware/UserMiddleware.js").getDifferentAccessForUser;
var RebalanceService = require('service/rebalancer/RebalanceService.js');
var responseCodes = config.responseCode;
var rebalancer_types = ['model', 'account', 'portfolio', 'community model'];
var validate = require('express-jsonschema').validate;

var rebalancerRebalance = {
  type: 'object',
  properties: {
    type: {
      type: 'String',
      required: true
    },
    ids: {
        type: ["array", "null"],
        required: true
    }//,
    // firmId: {
    //     type: 'number',
    //     required: true
    // }
  }
}

var rebalanceService = new RebalanceService();

app.get('/rebalance/model/:modelId/portfolio/:portfolioId', UserTeamAccessMiddleWare, function (req, res) {
	logger.info("Rebalance Model and portfolio request received");
    
    var data = req.data;
    if (req.query.accountId) {
        data.accountId = req.query.accountId;
    }
    if (req.query.amount) {
        data.amount = req.query.amount;
    }
    if (req.query.rebalanceType) {
        data.rebalanceType = req.query.rebalanceType;
    }
    data.modelId = req.params.modelId;
    data.portfolioId = req.params.portfolioId;
    req.data.hostname = req.headers['host'];
	  req.data.authKey =  req.headers['authorization'];
    rebalanceService.rebalanceModelAndPortfolio(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

app.get('/rebalance/assignModel/:modelId/portfolio/:portfolioId', UserTeamAccessMiddleWare, function (req, res) {
	logger.info("Assign model to portfolio request received");
    
    var data = req.data;
    data.modelId = req.params.modelId;
    data.portfolioId = req.params.portfolioId;
    rebalanceService.assignModelToPortfolio(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
app.get('/rebalance/download/:token', UserTeamAccessMiddleWare, function (req, res) {
	logger.info("Download rebalance logs request received");
    
    var data = req.data;
    data.token = req.params.token;
    rebalanceService.downloadRebalancerLogs(data, function (err, resp, data) {
        //res.setHeader('Content-disposition', 'attachment; filename=rebalancerLogs.txt');
       // res.setHeader('Content-Type', 'application/octet-stream');
        res.send(data);
        //return response(err, resp, data, res);
    });
});


/**
 * @apiIgnore Not needed now
 * @api {post} /rebalancer/rebalance Rebalance for Model
 * @apiName rebalanceTheModel
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API rebalance Model. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {Array}          modelIds     model ids to rebalance          
 * 
 * @apiParamExample {json} Request-Example:
		{
		  modelIds : [1, 2, 3]
		}
 *    
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/rebalancer/rebalance
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     
 * @apiSuccess {String}     message           Message.
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
// app.post("/rebalance", function(req, res){
// 	logger.info(" rebalance model request received ");

// 	 var json = {};
// 	 json.message = "Rebalancer started.";
	    

//     return response(null, "SUCCESS", json, res);
    
// });

/**
 * @api {POST} /rebalancer/rebalance Rebalance for Model.
 * @apiName rebalance model
 * @apiVersion 1.0.0
 * @apiGroup Models
 * @apiPermission appuser
 *
 * @apiDescription This API rebalance Model/Portfolio. There are 4 type of PORTFOLIOS: 
 * 1. Normal Portfolio (Is not sleeved)
 * 2. Normal Portfolio having DYNAMIC model
 * 3. Sleeved Portfolio having all normal accounts (No account has dynamic model)
 * 4. Sleeved Portfolio having atleast 1 account with dynamic model (known as Sleeved Account Portfolio)  
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": master
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}         type         model type to rebalance
 * @apiParam {Array}          ids          ids to rebalance  
 * 
 * @apiParamExample {json} Request-Example:
        {
          "type" : "model",
          "ids" : [1, 2, 3],
          "firmId" : 3
        }
 *    
 * @apiParamExample {json} Request-Example:
        {
          "type" : "portfolio",
          "ids" : [1, 2, 3],
          "firmId" : 3
        }
*
* @apiParamExample {json} Request-Example:
        {
          "type" : "account",
          "ids" : [1, 2, 3],
          "firmId" : 3
        }
*
* @apiParamExample {json} Request-Example:
        {
          type : 'community model',
          ids : [1, 2, 3],
          firmId : 3
        }
*
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/rebalancer/rebalance
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     
 *  @apiSuccessExample Response (example): 
 *    [
 *      {
 *        "4": {   // '4'  is portfolio Id
 *          "link": "http://54.173.63.220:8080/rebalancer/rebalance?portfolioId=4&type=NORMAL_PORTFOLIO&tradeInstanceId=261&firmId=3",
 *          "status": 500,
 *          "response": {
 *            "success": false,
 *            "message": "Zero Market value of this Portfolio",
 *            "tradeCode": 0
 *          }
 *        }
 *      },
 *      {
 *        "1": {   // '1'  is portfolio Id
 *          "link": "http://54.173.63.220:8080/rebalancer/rebalance?portfolioId=1&type=SLEEVE_PORTFOLIO&tradeInstanceId=261&firmId=3",
 *          "status": 500,
 *          "response": {
 *            "success": false,
 *            "message": "Something Went Wrong in Rebalancer due to wrong data.Please try again with proper data.",
 *            "tradeCode": 0
 *          }
 *        }
 *      },
 *      "Success!!!",
 *      {
 *        "545": {    // '545'  is model Id
 *          "SP": "CALL updateTargetPercentForDynamicModel(?)",
 *          "status": 200,
 *          "response": "Model Successfully Rebalanced!!!",
 *          "model_data": [   // model is in relationship with these portfolios and accounts
 *            {
 *              "portfolio_id": 2,
 *              "account_id": 12
 *            },
 *            {
 *              "portfolio_id": 20,
 *              "account_id": null
 *            },
 *            {
 *              "portfolio_id": 21,
 *              "account_id": null
 *            }
 *          ]
 *        }
 *      }
 *    ]
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
app.post('/rebalance', [validate({data: rebalancerRebalance})],function(req, res) {
  logger.info("Rebalance model request received!!!");
  var data = req.data;
  if (!(rebalancer_types.includes(data.type.toLowerCase()))) {
    res.status(422);
    return res.send({message:"Irrelevant Type!!!!"});  
  } 
  else{
    data.token = req.params.token;    
    rebalanceService.rebalance(data, function (err, resp, dta) {
      if(err){
        res.status(resp);
        return res.send({error: err, message: dta || err}); 
      }else if(dta != null){
        res.status(200);
        return res.send(dta);  
      }     
    }); 
  } 
});

module.exports = app;