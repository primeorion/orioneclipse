"use strict";

var app = require("express")();
var util = require('util');
var moduleName = __filename;
var helper = require('helper');

var logger = require("helper/Logger.js")(moduleName);
var response = require('controller/ResponseController.js');

var ViewConverter = require("converter/settings/ViewConverter.js");
var ViewRequest = require("model/settings/ViewRequest.js");
var ViewService = require('service/settings/ViewService.js');

var viewService = new ViewService();
var viewConverter = new ViewConverter();
var validate = helper.validate;

app.use(require('middleware/DBConnection').community);

var viewIdSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            is: 'numeric',
            required: true
        }
    }
}

var postViewSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            required: true
        },
        viewTypeId: {
            type: 'numeric',
            required: true
        },
        isPublic: {
            enum: [0, 1, true, false],
            required: true
        },
        isDefault: {
            enum: [0, 1, true, false],
            required: true
        },
        filter: {
            type: 'string',
        },
        gridColumnDefs: {
            type: 'json',
            required: true
        }
    }
};

var putViewSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
        },
        viewTypeId: {
            type: 'numeric',
            required: true
        },
        isPublic: {
            enum: [0, 1, true, false],
        },
        isDefault: {
            enum: [0, 1, true, false],
        },
        filter: {
            type: 'string',
        },
        gridColumnDefs: {
            type: 'json',
            required: true
        }
    }
};

/**
 * @api {get} /settings/views/viewTypes Get list of all View Types
 * @apiName GetAllViewTypes
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API gets list of all View Types. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/settings/views/viewTypes 
 * 
 * @apiSuccess {Number}     id              The View type id.
 * @apiSuccess {String}     viewType        Name of View type.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
      [
            {
                "id" : 1,
                "viewType" : "CustomListing"
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
app.get('/viewTypes', function (req, res) {
    logger.info("Get list of all View Types request received");
    var data = req.data;
    if (req.query.search) {
        data.search = req.query.search;
    }

    viewService.getViewTypes(data, function (err, status, data) {
        return response(err, status, data, res);
    });

});

/**
 * @api {get} /settings/views/ Get list of all Views 
 * @apiName GetAllViews
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API gets list of all Views. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/settings/views/
 * 
 * @apiSuccess {Number}     id                  View id.
 * @apiSuccess {String}     name                Name of the View.
 * @apiSuccess {Number}     viewTypeId          View type id.
 * @apiSuccess {String}     viewType            Name of the View type.
 * @apiSuccess {Boolean}    isDefault           True/False – Whether View is default View.
 * @apiSuccess {Boolean}    isPublic            True/False – Whether View is public View.
 * @apiSuccess {Number}     createdBy           Id of user who created the View details into the system.
 * @apiSuccess {Date}       createdOn           View created date into application.
 * @apiSuccess {Number}     editedBy            Id of user who edited the View details into the system.
 * @apiSuccess {Date}       editedOn            View edited date into application.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
     [
            {
                "id": 12,
                "name": "Custom List View",
                "viewTypeId":1,
                "viewType": "API_List", 
                "isDefault": true,
                "isPublic": false,
                "createdBy": "user login id",
                "createdOn": "2016-09-13 15:15:34",
                "editedBy": "user login id",
                "editedOn": "2016-09-13 15:15:34"
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
/**
 * @api {get} /settings/views?type={viewTypeId} Get list of all Views by View type Id
 * @apiName GetAllViewsByType
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API gets list of all Views by View type Id. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/settings/views?type=1
 * 
 * @apiSuccess {Number}     id                  View id.
 * @apiSuccess {String}     name                Name of the View.
 * @apiSuccess {Number}     viewTypeId          View type id.
 * @apiSuccess {String}     viewType            Name of the View type.
 * @apiSuccess {Boolean}    isDefault           True/False – Whether View is default View.
 * @apiSuccess {Boolean}    isPublic            True/False – Whether View is public View.
 * @apiSuccess {Number}     createdBy           Id of user who created the View details into the system.
 * @apiSuccess {Date}       createdOn           View created date into application.
 * @apiSuccess {Number}     editedBy            Id of user who edited the View details into the system.
 * @apiSuccess {Date}       editedOn            View edited date into application.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
     [
            {
                "id": 12,
                "name": "Custom List View",
                "viewTypeId":1,
                "viewType": "API_List", 
                "isDefault": true,
                "isPublic": false,
                "createdBy": "user login id",
                "createdOn": "2016-09-13 15:15:34",
                "editedBy": "user login id",
                "editedOn": "2016-09-13 15:15:34"
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
/**
 * @api {get} /settings/views?name={viewName} Get View by name
 * @apiName GetAllViewByName
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API gets View by name. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/settings/views?name=PortfolioList
 * 
 * @apiSuccess {Number}     id                  View id.
 * @apiSuccess {String}     name                Name of the View.
 * @apiSuccess {Number}     viewTypeId          View type id.
 * @apiSuccess {String}     viewType            Name of the View type.
 * @apiSuccess {Boolean}    isDefault           True/False – Whether View is default View.
 * @apiSuccess {Boolean}    isPublic            True/False – Whether View is public View.
 * @apiSuccess {Number}     createdBy           Id of user who created the View details into the system.
 * @apiSuccess {Date}       createdOn           View created date into application.
 * @apiSuccess {Number}     editedBy            Id of user who edited the View details into the system.
 * @apiSuccess {Date}       editedOn            View edited date into application.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
     [
            {
                "id": 12,
                "name": "PortfolioList",
                "viewTypeId":1,
                "viewType": "API_List", 
                "isDefault": true,
                "isPublic": false,
                "createdBy": "user login id",
                "createdOn": "2016-09-13 15:15:34",
                "editedBy": "user login id",
                "editedOn": "2016-09-13 15:15:34"
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
app.get('/', function (req, res) {
    logger.info("Get list of Views request received");
    var data = req.data;
    if (req.query.type) {
        data.type = req.query.type;
    }
    if (req.query.name) {
        data.name = req.query.name;
    }
    viewService.getViewsList(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {get} /settings/views/:id Get View Details
 * @apiName  ViewDetails.
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API gets View Details. 
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
 * curl -i http://baseurl/v1/settings/views/13
 * 
 * @apiSuccess {Number}     id                      View id.
 * @apiSuccess {String}     name                    Name of the View.
 * @apiSuccess {Number}     viewTypeId              View type id.
 * @apiSuccess {String}     viewType                Name of the View type.
 * @apiSuccess {Boolean}    isDefault               True/False – Whether View is default View.
 * @apiSuccess {Boolean}    isPublic                True/False – Whether View is public View.
 * @apiSuccess {String}     filter                  Filter used in View.
 * @apiSuccess {JSON}       gridColumnDefs          All columns Details needed to display View.
 * @apiSuccess {Date}       createdOn               View creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the View details into the system.
 * @apiSuccess {Date}       editedOn                View edited date into application.
 * @apiSuccess {Number}     editedBy                Id of user who edited the View details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
        {
            "id": 1,
            "name": "Custom list View",
            "viewTypeId":1,
            "viewType": "API_List", 
            "isDefault": true,
            "isPublic": false,
            "filter": "APIStatusId",
            "gridColumnDefs": {
                "field1" : "Whatever is saved for ng-grid state ",
                "field2" : "Whatever is saved for ng-grid state "
            },
            "createdBy": "user login id",
            "createdOn": "2016-09-13 15:15:34",
            "editedBy": "user login id",
            "editedOn": "2016-09-13 15:15:34"
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
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 * @apiError Not_Found When View does not exist.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "View does not exist"
 *     }
 * 
 */
app.get('/:id', validate({ params: viewIdSchema }), function (req, res) {
    logger.info("Get details of View request received");
    var data = req.data;
    data.id = req.params.id;

    viewService.getViewDetails(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {post} /settings/views/ Add new View
 * @apiName  AddNewView.
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API adds new View. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {String}       name                Name of the View.
 * @apiParam {Number}       viewTypeId          View type Id.
 * @apiParam {Boolean}      isPublic            True/False – Whether View is public View.
 * @apiParam {Boolean}      isDefault           True/False – Whether View is default View.
 * @apiParam {String}       filter              Filter used in View.
 * @apiParam {JSON}         gridColumnDefs      All columns Details needed to display View.
 * 
 * @apiParamExample {json} Request-Example:
        {
            "name": "Custom API list View",
            "viewTypeId":"1",
            "isPublic": true,
            "isDefault": false,
            "filter": "APIStatusId",
            "gridColumnDefs": {
                "field1" :     "Store whatever is needed by ng-grid to store",
                "field2" :     "filters/columns/sort order, column width, grouping, sums, etc"
            }
        }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/settings/views/
 * 
 * @apiSuccess (Success 201) {Number}     id                      View id.
 * @apiSuccess (Success 201) {String}     name                    Name of the View.
 * @apiSuccess (Success 201) {Number}     viewTypeId              View type id.
 * @apiSuccess (Success 201) {String}     viewType                Name of the View type.
 * @apiSuccess (Success 201) {Boolean}    isDefault               True/False – Whether View is default View.
 * @apiSuccess (Success 201) {Boolean}    isPublic                True/False – Whether View is public View.
 * @apiSuccess (Success 201) {String}     filter                  Filter used in View.
 * @apiSuccess (Success 201) {JSON}       gridColumnDefs          All columns Details needed to display View.
 * @apiSuccess (Success 201) {Date}       createdOn               View creation date into application.
 * @apiSuccess (Success 201) {Number}     createdBy               Id of user who created the View details into the system.
 * @apiSuccess (Success 201) {Date}       editedOn                View edited date into application.
 * @apiSuccess (Success 201) {Number}     editedBy                Id of user who edited the View details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 201 OK
        {
            "id": 1,
            "name": "Custom API list View",
            "viewTypeId":1,
            "viewType": "API_List", 
            "isDefault": true,
            "isPublic": false,
            "filter": "APIStatusId",
            "gridColumnDefs": {
                "field1" :     "Store whatever is needed by ng-grid to store",
                "field2" :     "filters/columns/sort order, column width, grouping, sums, etc"
            },
            "createdBy": "user login id",
            "createdOn": "2016-09-13 15:15:34",
            "editedBy": "user login id",
            "editedOn": "2016-09-13 15:15:34"
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
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 * @apiError Unprocessable_Entity When View already exist with same Name.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *      {
 *          "message": "Duplicate entry for name"
 *      }
 * 
 */
app.post('/', validate({ body: postViewSchema }), function (req, res) {
    logger.info("Create New View request received");

    var data = viewConverter.getRequestModel(req.data);

    viewService.addView(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {put} /settings/views/:id Update View
 * @apiName   UpdateView.
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API updates View. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiParam {String}       filter              Filter used in View.
 * @apiParam {JSON}         gridColumnDefs      All columns Details needed to display View.
 * 
 * @apiParamExample {json} Request-Example:
        {
            "filter": "APIStatusId",
            "gridColumnDefs": {
                "field1" :     "Store whatever is needed by ng-grid to store",
                "field2" :     "filters/columns/sort order, column width, grouping, sums, etc"
            }
        }
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/settings/views/12
 * 
 * @apiSuccess {Number}     id                      View id.
 * @apiSuccess {String}     name                    Name of the View.
 * @apiSuccess {Number}     viewTypeId              View type id.
 * @apiSuccess {String}     viewType                Name of the View type.
 * @apiSuccess {Boolean}    isDefault               True/False – Whether View is default View.
 * @apiSuccess {Boolean}    isPublic                True/False – Whether View is public View.
 * @apiSuccess {String}     filter                  Filter used in View.
 * @apiSuccess {JSON}       gridColumnDefs          All columns Details needed to display View.
 * @apiSuccess {Date}       createdOn               View creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the View details into the system.
 * @apiSuccess {Date}       editedOn                View edited date into application.
 * @apiSuccess {Number}     editedBy                Id of user who edited the View details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
        {
            "id": 12,
            "name": "Custom API list View",
            "viewTypeId":1,
            "viewType": "API_List", 
            "isDefault": true,
            "isPublic": false,
            "filter": "APIStatusId",
            "gridColumnDefs": {
                "field1" : "Whatever is saved for ng-grid state ",
                "field2" : "Whatever is saved for ng-grid state "
            },
            "createdBy": "user login id",
            "createdOn": "2016-09-13 15:15:34",
            "editedBy": "user login id",
            "editedOn": "2016-09-13 15:15:34"
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
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 * @apiError Unprocessable_Entity When View already exist with same Name.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *      {
 *          "message": "Duplicate entry for name"
 *      }
 * 
 */
app.put('/:id', validate({ params: viewIdSchema, body: putViewSchema }), function (req, res) {
    logger.info("Update View request received");

    var data = viewConverter.getRequestModel(req.data);
    data.id = req.params.id;
    viewService.updateView(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {delete} /settings/view/:id Delete View
 * @apiName DeleteView
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API deletes View (Soft Delete). 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 *
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/settings/view/:id
 * 
 * @apiSuccess {String}     message     Success message.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
        {
            "message": "View deleted successfully"
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
 * @apiError Not_Found When View does not exist or already deleted.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
 *       "message": "View does not exist"
 *     }
 * 
 * @apiError Unprocessable_Entity When View is public and created by another user.
 * 
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Unprocessable_Entity
 *      {
 *          "message": "You do not have permissions to delete this view"
 *      }
 * 
 */
app.delete('/:id', validate({ params: viewIdSchema }), function (req, res) {
    logger.info("Delete View request received");

    var data = req.data;
    data.id = req.params.id;

    viewService.deleteView(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/**
 * @api {post} /settings/views/defaultView/:id Sets view as default view
 * @apiName   SetDefaultView.
 * @apiVersion 1.0.0
 * @apiGroup Views
 * @apiPermission appuser
 *
 * @apiDescription This API sets view as default view. 
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
 * curl -i http://baseurl/v1/settings/views/defaultView/12
 * 
 * @apiSuccess {Number}     id                      View id.
 * @apiSuccess {String}     name                    Name of the View.
 * @apiSuccess {Number}     viewTypeId              View type id.
 * @apiSuccess {String}     viewType                Name of the View type.
 * @apiSuccess {Boolean}    isDefault               True/False – Whether View is default View.
 * @apiSuccess {Boolean}    isPublic                True/False – Whether View is public View.
 * @apiSuccess {String}     filter                  Filter used in View.
 * @apiSuccess {JSON}       gridColumnDefs          All columns Details needed to display View.
 * @apiSuccess {Date}       createdOn               View creation date into application.
 * @apiSuccess {Number}     createdBy               Id of user who created the View details into the system.
 * @apiSuccess {Date}       editedOn                View edited date into application.
 * @apiSuccess {Number}     editedBy                Id of user who edited the View details into the system.
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
        {
            "id": 12,
            "name": "Custom API list View",
            "viewTypeId":1,
            "viewType": "API_List", 
            "isDefault": true,
            "isPublic": false,
            "filter": "APIStatusId",
            "gridColumnDefs": {
                "field1" : "Whatever is saved for ng-grid state ",
                "field2" : "Whatever is saved for ng-grid state "
            },
            "createdBy": "user login id",
            "createdOn": "2016-09-13 15:15:34",
            "editedBy": "user login id",
            "editedOn": "2016-09-13 15:15:34"
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
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 */
app.post('/defaultView/:id', validate({ params: viewIdSchema }), function (req, res) {
    logger.info("Set default View request received");
    var data = req.data;
    data.id = req.params.id;

    viewService.setDefaultView(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

module.exports = app;