
import { Component, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { IAdminDashboard } from '../../../models/dashboard';
import { AdminService } from '../../../services/admin.service';
import { RoleService } from '../../../services/role.service';
import { IRole } from '../../../models/role';
import { IUIPrivilege } from '../../../viewmodels/ui.privileges';
import { PreferenceHelper } from '../../../shared/preference/preference.helper';

@Component({
    selector: 'eclipse-admin-dashboard',
    templateUrl: './app/components/admin/dashboard/dashboard.component.html',
    providers: [AdminService, RoleService, PreferenceHelper]
})
export class AdminDashboardComponent extends BaseComponent {
    /**
     * ng-models
     */
    private confirmRedirect: string = 'PREFREDIRECT';
    eclipseAdminPrefRoute: string;
    redirectToThisRouterLink: string;
    dashboardModel: IAdminDashboard = <IAdminDashboard>({});
    errorMessage: string;
    uiprivilege: IUIPrivilege;
    role: IRole;

    /**
     * Contructor
     */
    constructor(viewContainer: ViewContainerRef,
        private _adminService: AdminService, private _roleService: RoleService,
        private _router: Router,
        private _preferenceHelper: PreferenceHelper) {
        super();
        this.eclipseAdminPrefRoute = "/eclipse/admin/preferences";
        // initilize privileges
        this.role = this._sessionHelper.getUser().role;
        this.uiprivilege = <IUIPrivilege>{};
        this.uiprivilege.isFirmAdmin = (this.role.roleTypeId == UserType.FirmAdmin);
        this.uiprivilege.isTeamAdmin = (this.role.roleTypeId == UserType.TeamAdmin);
        this.uiprivilege.isUser = (this.role.roleTypeId == UserType.User);
        this.uiprivilege.user = Util.getPermission(PRIV_USERS);
        this.uiprivilege.hasUser = (this.uiprivilege.user != undefined) && (this.uiprivilege.user.canAdd || this.uiprivilege.user.canDelete || this.uiprivilege.user.canRead || this.uiprivilege.user.canUpdate);
        this.uiprivilege.role = Util.getPermission(PRIV_ROLES);
        this.uiprivilege.hasRole = (this.uiprivilege.role != undefined) && (this.uiprivilege.role.canAdd || this.uiprivilege.role.canDelete || this.uiprivilege.role.canRead || this.uiprivilege.role.canUpdate);
        this.uiprivilege.team = Util.getPermission(PRIV_TEAMS);
        this.uiprivilege.hasTeam = (this.uiprivilege.team != undefined) && (this.uiprivilege.team.canAdd || this.uiprivilege.team.canDelete || this.uiprivilege.team.canRead || this.uiprivilege.team.canUpdate);
        this.uiprivilege.custodian = Util.getPermission(PRIV_CUSTODIANS);
        this.uiprivilege.hasCustodian = (this.uiprivilege.custodian != undefined) && (this.uiprivilege.custodian.canAdd || this.uiprivilege.custodian.canDelete || this.uiprivilege.custodian.canRead || this.uiprivilege.custodian.canUpdate);
        this.uiprivilege.preferences = Util.getPrefsPermission();
        this.uiprivilege.hasPreferences = (this.uiprivilege.preferences != undefined) && (this.uiprivilege.preferences.canAdd || this.uiprivilege.preferences.canDelete || this.uiprivilege.preferences.canRead || this.uiprivilege.preferences.canUpdate);
        console.log('uiprivilege', this.uiprivilege.preferences);
    }

    /**
     * on initilize method
     */
    ngOnInit() {        
        this.redirectToThisRouterLink = this._preferenceHelper.redirectPrefMenuBasedOnUserRoleAndPriv(this.role.roleType, this._sessionHelper, this.eclipseAdminPrefRoute);
        console.log("redirectToThisRouterLink", this.redirectToThisRouterLink);
        // this.redirectPrefMenuBasedOnUserRoleAndPriv(roleType, sessionHelper);
        this.onDashboardLoad();
    }

    /**
     * 
     * this method fires on login button click
     */
    onDashboardLoad() {
        this.errorMessage = '';
        this.responseToObject<IAdminDashboard>(this._adminService.getAdminDashboardData())
            .subscribe(model => {
                this.dashboardModel = model;
                this.dashboardModel.visits = 15489;
                this.dashboardModel.todayVisits = 551;
                this.dashboardModel.monthlyVisits = 1450;
                this.dashboardModel.percentageHigher = 5;
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }
}
