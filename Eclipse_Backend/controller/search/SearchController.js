"use strict";

var moduleName = __filename;

var app = require("express")();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var SearchService = require('service/search/SearchService.js');
var searchService = new SearchService();

var logger = helper.logger(moduleName);
var validate = helper.validate;

var searchModuleSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        relativePath: {
            type: 'string',
            required: true
        }
    }
};
var searchPageSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        relativePath: {
            type: 'string',
            required: true
        },
        searchModuleId: {
            type: 'number',
            required: true
        }
    }
};
/**
 * @api {get} /search/pages?moduleIds=1,2&search=vis Search Search Page
 * @apiName Search Search Page
 * @apiVersion 1.0.0
 * @apiGroup Search
 * @apiPermission appuser
 *
 * @apiDescription This API search Search Page. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/search/pages?moduleIds=1,2&search=vis
 * 
 * @apiSuccess {id}         id                  Id of search module
 * @apiSuccess {String}     name                Name of module.
 * @apiSuccess {String}     relativePath        relative path for the module.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 [
  {
    "id": 2,
    "name": "advisor view",
    "relativePath": "/page/advisorView"
  }
]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 *
 */
/**
 * @api {get} /search/pages Get Search Page
 * @apiName Get Search Page
 * @apiVersion 1.0.0
 * @apiGroup Search
 * @apiPermission appuser
 *
 * @apiDescription This API get Search Page. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/search/pages
 * 
 * @apiSuccess {id}         id                  Id of search module
 * @apiSuccess {String}     name                Name of module.
 * @apiSuccess {String}     relativePath        relative path for the module.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 [
  {
    "id": 2,
    "name": "advisor view",
    "relativePath": "/page/advisorView"
  }
]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 *
 */
app.get('/pages', function (req, res) {
    logger.info("Get search pages request received");

    var data = req.data;
    searchService.getSearchPage(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**
 * @api {post} /search/pages Add Search Page
 * @apiName Add Search Page
 * @apiVersion 1.0.0
 * @apiGroup Search
 * @apiPermission appuser
 *
 * @apiDescription This API adds Search Page. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}     name          Name of page to add.
 * @apiParam {String}     relativePath  relative path for the page.
 * @apiParam {Number}     searchModuleId module Id to which page belong
 * 
 * @apiParamExample {form-data} Request-Example:
 *     {
 *        "name":"name of page",
          "relativePath":"/page_path",
          "searchModuleId":1
 *    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/search/pages
 * 
 * @apiSuccess {String}    message                   Search Page added successfully.
 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "message": "Search Page added successfully"
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
 *
 */
app.post('/pages',validate({ body: searchPageSchema }), function (req, res) {
    logger.info("Add search pages request received");

    var data = req.data;
    searchService.addSearchPage(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**
 * @api {get} /search/modules?moduleIds=1,2&search=vis Search Search Module
 * @apiName Search Search Module
 * @apiVersion 1.0.0
 * @apiGroup Search
 * @apiPermission appuser
 *
 * @apiDescription This API search Search Module. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/search/modules?moduleIds=1,2&search=vis
 * 
 * @apiSuccess {id}         id                  Id of search module
 * @apiSuccess {String}     name                Name of module.
 * @apiSuccess {String}     relativePath        relative path for the module.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 [
  {
    "id": 2,
    "name": "advisor",
    "relativePath": "/module/advisor"
  }
]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 *
 */
/**
 * @api {get} /search/modules Get Search Module
 * @apiName Get Search Module
 * @apiVersion 1.0.0
 * @apiGroup Search
 * @apiPermission appuser
 *
 * @apiDescription This API get Search Module. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/search/modules
 * 
 * @apiSuccess {id}         id                  Id of search module
 * @apiSuccess {String}     name                Name of module.
 * @apiSuccess {String}     relativePath        relative path for the module.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 [
  {
    "id": 2,
    "name": "advisor",
    "relativePath": "/module/advisor"
  }
]
 *
 * @apiError Unauthorized Invalid / Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header"
 *     }
 *
 *
 */
app.get('/modules', function (req, res) {
    logger.info("Get module pages request received");

    var data = req.data;
    searchService.getSearchModule(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});
/**
 * @api {post} /search/modules Add Search Module
 * @apiName Add Search Module
 * @apiVersion 1.0.0
 * @apiGroup Search
 * @apiPermission appuser
 *
 * @apiDescription This API adds Search Module. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *       "Content-Type" : application/json
 *     }
 * 
 * @apiParam {String}     name          Name of module to add.
 * @apiParam {String}     relativePath  relative path for the module.
 * 
 * @apiParamExample {form-data} Request-Example:
 *     {
 *        "name":"name of module",
          "relativePath":"/module_path"
 *    }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/search/modules
 * 
 * @apiSuccess {String}    message                   Search Module added successfully.
 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "message": "Search Module added successfully"
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
 *
 */
app.post('/modules',validate({ body: searchModuleSchema }), function (req, res) {
    logger.info("Add module pages request received");

    var data = req.data;
    searchService.addSearchModule(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;