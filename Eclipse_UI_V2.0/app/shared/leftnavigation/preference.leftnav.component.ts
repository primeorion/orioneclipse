import { Component, Input } from '@angular/core';
import { SessionHelper } from '../../core/session.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { IRole } from '../../models/role';

@Component({
    selector: 'eclipse-preference-leftmenu',
    templateUrl: './app/shared/leftnavigation/preference.leftnav.component.html',
})

// export class PreferenceLeftNavComponent extends BaseComponent {
export class PreferenceLeftNavComponent {

    /** Preference leveel booleans */
    public showCurrentLevel: boolean = true;
    isFirmPrefEnabled: boolean;
    isCustodianPrefEnabled: boolean;
    isTeamPrefEnabled: boolean;
    isModelPrefEnabled: boolean;
    isPortfolioPrefEnabled: boolean;
    isAccountPrefEnabled: boolean;

    constructor() {
        let sessionHelper = new SessionHelper();
        let sessionRole = sessionHelper.get<IRole>('role');
        this.setPreferenceMenuLinksVisibility(sessionRole.roleType, sessionHelper);
    }

    /** Set the visibily of menu links for preferences based on User privileges */
    setPreferenceMenuLinksVisibility(roleType: string,sessionHelper:any ) {
        switch (roleType) {
            case 'FIRM ADMIN':
                this.isFirmPrefEnabled = (sessionHelper.getPermission(PRIV_FIRMPREF).canRead) ? true : false;
                this.isCustodianPrefEnabled = (sessionHelper.getPermission(PRIV_CUSTODIANPREF).canRead) ? true : false;
                this.isTeamPrefEnabled = (sessionHelper.getPermission(PRIV_TEAMPREF).canRead) ? true : false;
                this.isModelPrefEnabled = (sessionHelper.getPermission(PRIV_MODELPREF).canRead) ? true : false;
                this.isPortfolioPrefEnabled = (sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead) ? true : false;
                this.isAccountPrefEnabled = (sessionHelper.getPermission(PRIV_ACCOUNTPREF).canRead) ? true : false;
                break;
            case 'TEAM ADMIN':
                /** FOR TEAM ADMIN Firm/Cutodian preferences will never be shown
                 * irrespective of previleges set for these
                 */
                this.isFirmPrefEnabled = false;
                this.isCustodianPrefEnabled = false;
                this.isTeamPrefEnabled = (sessionHelper.getPermission(PRIV_TEAMPREF).canRead) ? true : false;
                this.isModelPrefEnabled = (sessionHelper.getPermission(PRIV_MODELPREF).canRead) ? true : false;
                this.isPortfolioPrefEnabled = (sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead) ? true : false;
                this.isAccountPrefEnabled = (sessionHelper.getPermission(PRIV_ACCOUNTPREF).canRead) ? true : false;
                break;
            case 'USER':
                /** FOR normal USER Firm/Cutodian/Team preferences will never be shown
                 * irrespective of previleges set for these
                 */
                this.isFirmPrefEnabled = false;
                this.isCustodianPrefEnabled = false;
                this.isTeamPrefEnabled = false;
                this.isModelPrefEnabled = (sessionHelper.getPermission(PRIV_MODELPREF).canRead) ? true : false;
                this.isPortfolioPrefEnabled = (sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead) ? true : false;
                this.isAccountPrefEnabled = (sessionHelper.getPermission(PRIV_ACCOUNTPREF).canRead) ? true : false;
                break;
        }
    }
}
