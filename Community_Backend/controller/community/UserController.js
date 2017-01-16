"use strict";

var moduleName = __filename;
var express = require('express');
var app = express();
var helper = require('helper');

var response = require('controller/ResponseController.js');
var StrategistRequest = require("model/community/strategist/StrategistRequest.js");
var UserService = require('service/community/UserService.js');
var UploadService = require('service/upload/UploadService.js');
var privilegeValidator = require('middleware/PrivilegeValidator.js').hasPrivilege();

var userService = new UserService();
var uploadService= new UploadService();
var logger = helper.logger(moduleName);
var validate = helper.validate;
var multer = require('multer');
var multerS3 = require('multer-s3')
var aws = require('aws-sdk')
var guid = require('guid');
var mkdirp = require('mkdirp');
var config = require('config');
var env = config.env.name;
var s3Properties = config.env.prop.orion["s3"];
var moment = require('moment');

app.use(require('middleware/DBConnection').community);
app.use(require('middleware/DBConnection').common);


var localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = req.uploadContext + req.params.strategistId;
        mkdirp(uploadDir, function (err) {
            if (err) {
                cb(null, uploadDir);
            } else {
                cb(null, uploadDir);
            }
        });
    },
    filename: function (req, file, cb) {
        var fileExtention = file.originalname.split('.');
        if (file.fieldname == 'logo') {
            var fileName = file.fieldname + '-' + Date.now() + '.' + fileExtention[fileExtention.length - 1];
            return cb(null, fileName);
        } else {
            var fileName = file.originalname;
            return cb(null, fileName);
        }
    }
});

/*s3 related conf*/
aws.config.region = s3Properties.region;
aws.config.update({
    accessKeyId: s3Properties.accessKeyId,
    secretAccessKey: s3Properties.secretAccessKey
});
var s3 = new aws.S3();

var upload = multer({
    storage: localStorage
});

var s3upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: s3Properties.bucket,
        metadata: function (req, file, cb) {
            var obj = {};
            obj = req.body;
            cb(null, obj);
        },
        key: function (req, file, cb) {
            var timeStamp = moment().format();
            var user = req.params.strategistId;
            var contextPath = req.uploadContext;
            if (file.fieldname == 'logo' && req.fileAttributeName == 'small') {
                var fileName = file.originalname.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + user + '/' + contextPath + req.fileAttributeName + '/' + timeStamp + '/' + file.originalname; // req.params.strategistId+fileExtention;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if (file.fieldname == 'logo' && req.fileAttributeName == 'large') {
                var fileName = file.originalname.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + user + '/' + contextPath + req.fileAttributeName + '/' + timeStamp + '/' + file.originalname; // req.params.strategistId+fileExtention;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if (req.params.modelId) {
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + 'model' + req.params.modelId + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if( req.fileAttributeName == 'user' ) {
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + 'user' + req.data.user.userId + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);                
            } else {
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + user + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            }
        }
    })
})

function fileServeMiddleware(fileAttributeName, uploadContext) {
    return function (req, res, next) {
        req.uploadContext = uploadContext;
        req.fileAttributeName = fileAttributeName;
        req.filesArray = [];
        req.signedUrls = [];
        req.fileServer = req.headers.host;
        next();
    }
}


/** @api {get} /community/users Get All Users 
 * @apiName GetAllUsers
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appuser
 *
 * @apiDescription This API gets user list. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users
 * 
 * @apiSuccess {Number}     id                    The User Id.
 * @apiSuccess {String}     name                  Full Name of the User.
 * @apiSuccess {Number}     roleId                The role id of user.
 * @apiSuccess {String}     roleType              Role of user.
 * @apiSuccess {Date}       createdOn             User creation date into application.
 * @apiSuccess {String}     createdBy             Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn              User edited date into application.
 * @apiSuccess {String}     editedBy              Full Name of user who edited the User details into the system.
 * @apiSuccess {Number}     strategistId          The Strategist Id.
 * @apiSuccess {String}     strategistName        Full Name of the strategist.
 * @apiSuccess {Date}       strategistCreatedOn   Strategist creation date into application.
 * @apiSuccess {String}     strategistCreateBy    Full Name of Strategsit who created the strategist into the system.
 * @apiSuccess {String}     strategistEditedBy    Strategist edited date into application.
 * @apiSuccess {Date}       strategistEditedOn    Full Name of Stratesgist who edited the Strategist details into the system.
 * @apiSuccess {String}     path                  Actual path of the user logo on AWS server.
 * @apiSuccess {String}     url                   Signed url of the logo.
 * @apiSuccess {String}     orionConnectExternalId  Orion connect id of the user.
 * @apiSuccess {String}     loginUserId           Login User id of the user.

 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
        {
            "id": 1,
            "name": "Prime TGT",
            "roleId": 1,
            "roleType": "Super Admin",
            "orionConnectExternalId": 370925,
            "loginUserId": "primetgi",
            "createdOn": "2016-11-18T21:10:09.000Z",
            "createdBy": "primetgi",
            "editedOn": "2016-11-22T10:26:44.000Z",
            "editedBy": null,
            "strategistId": null,
            "strategistName": null,
            "strategistCreatedOn": null,
            "strategistCreateBy": null,
            "strategistEditedBy": null,
            "strategistEditedOn": null,
            "path": "",
            "url": ""
        }]
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
    logger.info("Get users request received");
    var data = req.data;
   
    userService.getUserList(data, function (err, status, data) {
        return response(err, status, data, res);
    });   
});

/** @api {get} /community/users/role get loggedInUser RoleType
 * @apiName LoggenIn User Role
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appstrategist
 *
 * @apiDescription This API returns the list of user roles. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users/role
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *        "roleId": 1,
 *        "roleType": "Admin"
 *    }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/role', function (req, res){
    logger.info("logged in user role request received");
    var data = new StrategistRequest(req.data);
    userService.getLoggedInUserRole(data, function(err, status, data){
        return response(err, status, data, res);
    });
});

/** @api {get} /community/users/detail Get LoggedIn User Detail 
 * @apiName GetLoggedInUserDetail
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appuser
 *
 * @apiDescription This API gets user detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users/detail
 * @apiSuccess {String}     id              The User Id.
 * @apiSuccess {String}     name            Full Name of the User.
 * @apiSuccess {Integer}    roleId          User roleId.
 * @apiSuccess {String}     roleType        User roleType.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       createdOn       User creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn        User edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User details into the system.
 * @apiSuccess {Number}     eclipseDatabaseId     firm id of user.
 * @apiSuccess {String}     eclipseDatabaseName   firm name.
 * @apiSuccess {String}     orionConnectExternalId  Orion connect id of the user.
 * @apiSuccess {String}     loginUserId           Login User id of the user.
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
        "id": 1,
        "roleId": 1,
        "roleType": "Super Admin",
        "orionConnectExternalId": 370925,
        "name": "Prime TGT",
        "isDeleted": 0,
        "loginUserId": "primetgi",
        "email": "vrmurthy@primetgi.com",
        "createdDate": "2016-11-18T21:10:09.000Z",
        "createdBy": "primetgi",
        "editedDate": "2016-11-22T10:26:44.000Z",
        "editedBy": null,
        "eclipseDatabaseId": 0,
        "eclipseDatabaseName": null,
        "path": "",
        "url": ""
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
 * @apiError Not Found Invalid UserId.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not_Found
 *     {
         "message": "User does not exist"
       }
 *     
 */
app.get('/detail', function (req, res) {
    logger.info("Get user details request received");
    var data = req.data;
    userService.getLoggedinUser(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});

/** @api {get} /community/users/firms Get Firm List for logged in user
 * @apiName Firm List of logged in User 
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appuser
 *
 * @apiDescription This API returns the list of all firms of a given User.

 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users/firms
 *
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [
          {
            "firmId": 1,
            "database": "dev2_orionEclipseFirm_1020"
          },
          {
            "firmId": 2,
            "database": "dev2_orionEclipseFirm_1021"
          },
          {
            "firmId": 3,
            "database": "dev2_orionEclipseFirm_1022"
          }
        ]
 *
 * @apiError Firms not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */

app.get('/firms', function(req, res){
    logger.info('Get firmId for a user request recived.');

     var data = req.data;
    // data.id = req.params.id;

    userService.getFirmId(data, function(err, status, data){
        return response(err, status, data, res);
    });
});


/** @api {get} /community/users/:id Get User detail 
 * @apiName GetUserDetail
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appuser
 *
 * @apiDescription This API gets user detail. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users/12
 * 
 * @apiSuccess {Number}     id                    The User Id.
 * @apiSuccess {String}     name                  Full Name of the User.
 * @apiSuccess {Number}     roleId                The role id of user.
 * @apiSuccess {String}     roleType              Role of user.
   @apiSuccess {Number}     strategistId          The Strategist Id.
 * @apiSuccess {String}     strategistName        Full Name of the strategist.
 * @apiSuccess {Date}       createdOn             User creation date into application.
 * @apiSuccess {String}     createdBy             Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn              User edited date into application.
 * @apiSuccess {String}     editedBy              Full Name of user who edited the User details into the system.
 * @apiSuccess {Number}     eclipseDatabaseId     firm id of user.
 * @apiSuccess {String}     eclipseDatabaseName   firm name.
 * @apiSuccess {String}     path                  Path on S3 server.
 * @apiSuccess {String}     url                   Signed url of the logo.
 * @apiSuccess {String}     orionConnectExternalId  Orion connect id of the user.
 * @apiSuccess {String}     loginUserId           Login User id of the user.

 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
    [
            {
                "id": 1,
                "roleId": 1,
                "roleType": "Super Admin",
                "orionConnectExternalId": 370925,
                "name": "Prime TGT",
                "isDeleted": 0,
                "loginUserId": "primetgi",
                "email": "vrmurthy@primetgi.com",
                "createdDate": "2016-11-18T21:10:09.000Z",
                "createdBy": "primetgi",
                "editedDate": "2016-11-22T10:26:44.000Z",
                "editedBy": null,
                "eclipseDatabaseId": 0,
                "eclipseDatabaseName": null,
                "path": "",
                "url": ""
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
app.get('/:id', privilegeValidator, function (req, res) {
    logger.info("Get user details request received");
    var data = req.data;
    data.assignedUserId = req.params.id;
    userService.getUserDetail(data, function (err, status, data) {
        return response(err, status, data, res);
    });
});


/** @api {get} /community/users/master/roles Get User Roles List
 * @apiName User Role List
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appstrategist
 *
 * @apiDescription This API returns the list of user roles. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users/master/roles
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * 		[
 *		  {
 *		    "roleId": 1,
 *		    "roleType": "Admin"
 *		  },
 *		  {
 *		    "roleId": 2,
 *		    "roleType": "User" 
 *		  }
 *		]
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/master/roles', function (req, res){
    logger.info("user role list request received");
    var data = new StrategistRequest(req.data);
    userService.getUserRoleList(data, function(err, status, data){
        return response(err, status, data, res);
    });
});

/** @api {get} /community/users/firms/list Get Firm List
 * @apiName Firm List
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appuser
 *
 * @apiDescription This API returns the list of all firms.
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *      {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "Content-Type" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users/firms/list
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      [
          {
            "id": 1,
            "database": "dev2_orionEclipseFirm_1020"
          },
          {
            "id": 2,
            "database": "dev2_orionEclipseFirm_1021"
          },
          {
            "id": 3,
            "database": "dev2_orionEclipseFirm_1022"
          },
          {
            "id": 4,
            "database": "dev2_rebalance"
          },
          {
            "id": 5,
            "database": "dev2_orionEclipseFirm_1300"
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
app.get('/firms/list', function(req, res){
    logger.info("Get all firmId request received.");

    var data = req.data;
    // return response(null, 200, {"test":"thuis us a test."}, res);
    userService.getFirms(data, function(err, status, data){
        return response(err, status, data, res);
    });
});

/**@api {post} /community/users/logo Upload user small sized logo.
 * @apiName Upload User Profile logo 
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appstrategist
 *
 * @apiDescription This API uploads user small sized logo. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://localhost:4000/v1/community/users/logo
 *
 *
 * @apiParam (Multipart/Form-Data)  {file}             logo=File A resource file to be uploaded
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
        "url": "https://paxorions3.s3.amazonaws.com/dev/user370925/logo/2016-11-16T11%3A47%3A55%2B05%3A30/image.png?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1479313080&Signature=lYZVyg6mgjSs1wvCngMrs5HKCAg%3D"
      }
 *
 *
 * @apiError Bad_Request When without request data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 400 Bad_Request
 *     {
 *       "message": "Bad Request: Verify request data"
 *     }
 * 
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/logo', fileServeMiddleware('user', 'logo/'), s3upload.single('logo'), function (req, res) {
    logger.info("Upload logo for strategist request received");
        uploadService.uploadSmallLogo(req, res, function (err, status, data) {
            if (err) {
                logger.error("Error occured while upload small logo uploadSmallLogo() " + err);
                return response(err, status, data, res);
                /*deleteItem(res.locals.filename);*/
            }
            return response(err, status, data, res);
        });
});

//app.get('/user/logo', function(req, res){
//    logger.info("get documents of strategist for a model request received");
//       userService.getLogo(req.data, function (err, status, data) {
//                 return response(err, status, data, res);  
//        });
//});


var addUserSchema = {
    type: 'object',
    properties: {
        loginUserId: {
            type: 'string',
            required: true
        },
       name: {
           type: 'string',
           required: true
       },
       roleId: {
           type: 'number',
           required: true
       },
       orionConnectExternalId: {
           type: 'number',
           required: true
       },
       eclipseDatabaseId: {
            type : 'number',
            required: true          
       }
    }
};

/**@api {post} /community/users Add user
 * @apiName Add user
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appuser
 *
 * @apiDescription This API adds user
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *       "ContentType" : application/json 
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users
 * 
 * 
 * @apiParam {String}     loginUserId                 Login User id of the user
 * @apiParam {String}     name                        Name of the user
 * @apiParam {Number}     roleId                      role of the user
 * @apiParam {Number}     orionConnectExternalId      Connect id of the user
 * @apiParam {Number}     eclipseDatabaseId           Firm Db id of the user
 * 
 * 
 * @apiParamExample {json} Request-Example:
 *    {  
	    "loginUserId": "chrisd",
        "name": "Test",
        "roleId": 1,
        "orionConnectExternalId": 6094,
        "eclipseDatabaseId" : 1
    }
 * 
 * @apiSuccess {Number}     id                          Id of the user
 * @apiSuccess {String}     userLoginName               Login User id of the user
 * @apiSuccess {String}     email                       Email of the user
 * @apiSuccess {String}     name                        Name of the user
 * @apiSuccess {Number}     orionConnectExternalId      Connect id of the user
 * @apiSuccess {Number}     eclipseDatabaseId           Firm Db id of the user 
 * @apiSuccess {String}     eclipseDatabaseName         Firm name of the user
 * @apiSuccess {String}     createdDate                 created date 
 * @apiSuccess {String}     editedDate                  Last edited date
 * @apiSuccess {Number}     editedBy                    user id to edit
 * @apiSuccess {Number}     createdBy                   user id to create
 * @apiSuccess {Number}     isDeleted                   Deleted status of the user

 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
          "id": 370987,
          "orionConnectExternalId": 6094,
          "name": "Test",
          "isDeleted": 0,
          "userLoginName": "chrisd",
          "email": "chrisd",
          "createdDate": "2016-11-11T10:16:18.000Z",
          "createdBy": 370925,
          "editedDate": "2016-11-11T10:16:18.000Z",
          "editedBy": 370925,
          "eclipseDatabaseId": 0,
          "eclipseDatabaseName":"firm01"
      }
 *
 * @apiError Role id was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 200 
 *     {
            "message": "role does not exists."
       }
 *
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.post('/', validate({body : addUserSchema}), privilegeValidator,function(req, res){
    logger.info("add user request received");
    userService.createUser(req, function(err, status, data){
        return response(err, status, data, res);
    });
});


/**@api {put} /community/users  update logo and name of the logged in user
 * @apiName Update User Profile 
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appstrategist
 *
 * @apiDescription This API updates profile of the logged in user. 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiParam (Multipart/Form-Data)       {file}             logo=File A resource file to be uploaded
 * @apiParam (Multipart/Form-Data)       {Text}             name=Name of logged in user.
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users 
 * 
 * @apiSuccess {String}     id              The User Id.
 * @apiSuccess {String}     name            Full Name of the User.
 * @apiSuccess {Integer}    roleId          User roleId.
 * @apiSuccess {String}     roleType        User roleType.
 * @apiSuccess {String}     email           User email id.
 * @apiSuccess {Boolean}    isDeleted       User exist or not into the system.
 * @apiSuccess {Date}       createdOn       User creation date into application.
 * @apiSuccess {Number}     createdBy       Full Name of user who created the User into the system.
 * @apiSuccess {Date}       editedOn        User edited date into application.
 * @apiSuccess {String}     editedBy        Full Name of user who edited the User details into the system.
 * @apiSuccess {Number}     eclipseDatabaseId     firm id of user.
 * @apiSuccess {String}     eclipseDatabaseName   firm name.
 * @apiSuccess {String}     orionConnectExternalId  Orion connect id of the user.
 * @apiSuccess {String}     loginUserId           Login User id of the user.
 * @apiSuccess {String}     path                  Path on S3 server.
 * @apiSuccess {String}     url                   Signed url of the logo.
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    on updating successfully
 *      {
            "id": 1,
            "roleId": 1,
            "roleType": "Super Admin",
            "orionConnectExternalId": 370925,
            "name": "Prime TGT  123",
            "isDeleted": 0,
            "loginUserId": "primetgi",
            "email": "vrmurthy@primetgi.com",
            "createdDate": "2016-11-18T21:10:09.000Z",
            "createdBy": "primetgi",
            "editedDate": "2016-11-22T10:26:44.000Z",
            "editedBy": null,
            "eclipseDatabaseId": 0,
            "path": "dev/user1/logo/2016-11-25T12:18:17+05:30/logoSample8.jpg",
            "eclipseDatabaseName": null,
            "url": "https://paxorions3.s3.amazonaws.com/dev/user1/logo/2016-11-25T12%3A18%3A17%2B05%3A30/logoSample8.jpg?AWSAccessKeyId=AKIAJYQJPK7K377QTDXA&Expires=1480092511&Signature=GnCnYOj5IMiUCM7twsGpTdsGUy0%3D"
    }
 *
 * @apiError NameFieldNotFound The name to update was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
        "message": "Name not found in request form."
        }
 *
 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.put('/', fileServeMiddleware('user', 'logo/'), s3upload.single('logo'), function (req, res) {
    logger.info("Upload logo for strategist request received");
           userService.updateLogoAndName(req, res, function(err, status, data) {
               if(err) {
                   logger.error("Error occured while upload logo updateLogoAndName() " + err);
                   return response(err, status, data, res);
               }
               return response(null, status, data, res);
          }); 
});

/**@api {get} /community/users/strategists/count  Get strategist and user count
 * @apiName Get Strategist and User count 
 * @apiVersion 1.0.0
 * @apiGroup Community-User
 * @apiPermission appstrategist
 *
 * @apiDescription This API returns the strategist admin and strategist user count; 
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj
 *     }
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/community/users/strategists/count 
 * 
 * @apiSuccess {Number}     userCount              user count.
 * @apiSuccess {Number}     strategistCount        strategist count.
 * 
 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
        "userCount": 4,
        "strategistCount": 1
        }

 * @apiError Unauthorized Invalid/Without JWT Token.
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Invalid Authorization Header""
 *     }
 */
app.get('/strategists/count', privilegeValidator, function(req, res){
    logger.info('get count of strategist admin and strategist users');
    userService.getUsersStrategistCount(req.data, function(err, status, data){
        return response(err, status, data, res);
    });
});

module.exports = app;

