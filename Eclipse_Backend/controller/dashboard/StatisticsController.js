"use strict";

var app = require('express')();
var response = require('controller/ResponseController.js');
var dashboardService = require('service/dashboard/StatisticsService.js');

app.use(require('middleware/DBConnection').common);
/**
 * @api {get} /dashboard/admin/summary Get Admin Dashboard Summary 
 * @apiName GetAdminDashboardSummary
 * @apiVersion 1.0.0
 * @apiGroup Dashboard
 * @apiPermission admin
 *
 * @apiDescription This API gets dashboard summary. Dashboard Summary API requirements are :
 * 
 * 
 * <b>Teams</b>:<br>
*<i><Total: &lt; count of teams visible to the current user&gt;<br>
*Existing: &lt; teams where status = active visible to the current user and &gt; 30 days old&gt;<br>
*New: Total-Existing</i>
*
* 
*
*<b>Users:</b><br>
*<i>Total: &lt; all users count visible to the current user. &gt;<br>
*Existing: &lt; <active users count visible to the current user Created over 30 days ago. &gt;<br>
*New: Total-Existing</i>
*
* 
*
*<b>Custodian</b><br>
*<i>Total: &lt; total count of all custodians. &gt;<br>
*Active: &lt; count of custodians with at least one Account Assigned that is visible to the current user. &gt;</i>
*
* 
*
*<b>Preferences</b><br>
*<i>Total: NOTHING (to be consider in future). <br>
*Modified Today: &lt; preferences where edited date > today @ 12:01 AM for records visible to the current user. &gt;<br>
*Modified 7 days: &lt; preferences where edited date > today – 7 days for records visible to the current user. &gt;</i>
*
* 
*
*<b>Roles</b><br>
*<i>Total: &lt; total count of roles visible to the current user &gt;<br>
*Existing: &lt; count of roles visible to the current user that is Created over 30 days ago. &gt;<br>
*New: Total-Existing</i><br>
 *
 * @apiHeader {String} JWTToken The JWT auth token.
 *
 * @apiHeaderExample Header-Example:
 *     {
 *       "Authorization": Session eyJhbGciOiJIUzI1N.eyJpc3mlvbiIsImF1ZCI6Imh0dHA6Ly9z.t8SSYXmaRPZahxeS0tBj 
 *     }
 *     
 *    
 * 
 * @apiExample Example usage:
 * curl -i http://baseurl/v1/dashboard/admin/summary
 * 
 * @apiSuccess {Number}     users              	  Number of all users.
 * @apiSuccess {Number}     existingUsers         Number of existing user.
 * @apiSuccess {Number}     newUsers              Number of new users in last day.
 * @apiSuccess {Number}     roles                 Number of all roles.            
 * @apiSuccess {Number}     existingRoles         Number of existing roles.
 * @apiSuccess {Number}     newRoles              Number of new roles in last day.
 * @apiSuccess {Number}     teams                 Number of all teams.
 * @apiSuccess {Number}     activeTeams           Number of active teams.
 * @apiSuccess {Number}     pendingTeams          Number of pending teams.
 * @apiSuccess {Number}     custodians            Number of all custodians.
 * @apiSuccess {Number}     approvedCustodians    Number of approvedCustodians.
 * @apiSuccess {Number}     declinedCustodians    Number of declinedCustodians.
 * @apiSuccess {Number}     firmPreferences       Number of firmPreferences.
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     
            {
                  "users": 29,
                  "existingUsers": 29,
                  "newUsers": 0,
                  "roles": 106,
                  "existingRoles": 105,
                  "newRoles": 1,
                  "teams": 27,
                  "activeTeams": 23,
                  "pendingTeams": 4,
                  "custodians": 10,
                  "approvedCustodians": 10,
                  "declinedCustodians": 0,
                  "firmPreferences": 0
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
app.get('/summary', function(req, res){
	dashboardService.getStats(req, function(err, statusCode, rs){
		response(err, statusCode, rs, res);
	});
});

module.exports = app;