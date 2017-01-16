import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import { IAdminDashboard } from '../models/dashboard';
import { IRoleVm, IRole } from '../models/role';

@Injectable()
export class AdminService {
     private _dashBoardEndPoint = 'dashboard/admin/summary';

    constructor(private _httpClient: HttpClient) { }

    /**To get admin dashboard data */
    getAdminDashboardData() {
        return this._httpClient.getData(this._dashBoardEndPoint);
        // let model = <IAdminDashboard>({});
        // model.users = 2586; //Math.floor(Math.random() * 10);
        // model.existingUsers = 2000;
        // model.newUsers = 586;
        // model.roles = 0;
        // model.existingRoles = 0;
        // model.newRoles = 0;
        // model.teams = 260;
        // model.activeTeams = 200;
        // model.pendingTeams = 60;
        // model.custodians = 955;
        // model.approvedCustodians = 900;
        // model.declinedCustodians = 55;
        // model.firmPreferences = 104;
        // model.visits = 15489;
        // model.todayVisits = 551;
        // model.monthlyVisits = 1450;
        // return model;
    }
}
