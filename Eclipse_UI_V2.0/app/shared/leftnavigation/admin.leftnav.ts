import { Component, Input } from '@angular/core';
import { IAdminLeftMenu } from '../../viewmodels/admin.leftmenu';
export * from '../../viewmodels/admin.leftmenu';
import { IRole } from '../../models/role';
import { SessionHelper } from '../../core/session.helper';
import { PreferenceHelper } from '../../shared/preference/preference.helper';
import { IUIPrivilege } from '../../viewmodels/ui.privileges';
import * as Util from '../../core/functions';

@Component({
    selector: 'admin-leftmenu',
    templateUrl: './app/shared/leftnavigation/admin.leftnav.html',
    //properties: ['menuName', 'existingLabel', 'newLabel', 'isCustodian'],
    providers: [PreferenceHelper]

})
export class AdminLeftNavComponent {
    /** Variables for dynamic redirection of preference Menu */
    private confirmRedirect: string = 'PREFREDIRECT';
    eclipseAdminPrefRoute: string;
    redirectToThisRouterLink: string;
    @Input() model: IAdminLeftMenu;
    @Input() menuName: string = 'Roles';
    @Input() existingLabel: string = 'Existing';
    @Input() newLabel: string = 'New';
    uiprivilege: IUIPrivilege;
    role: IRole;

    constructor(private _preferenceHelper: PreferenceHelper) {
        /** Dynamic redirection to specific preference based on user role and privilege */
        this.uiprivilege = <IUIPrivilege>{};
        this.eclipseAdminPrefRoute = "/eclipse/admin/preferences";
        let sessionHelper = new SessionHelper();
        let roleType = sessionHelper.get<IRole>('role').roleType;
        this.redirectToThisRouterLink = this._preferenceHelper.redirectPrefMenuBasedOnUserRoleAndPriv(roleType, sessionHelper, this.eclipseAdminPrefRoute)

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
}
