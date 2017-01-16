import { Component, Input } from '@angular/core';
import { SessionHelper } from '../../core/session.helper';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { IRole } from '../../models/role';
import { PreferenceHelper } from '../../shared/preference/preference.helper';


@Component({
    selector: 'eclipse-preference-leftmenu',
    templateUrl: './app/shared/leftnavigation/preference.leftnav.component.html',
    providers: [PreferenceHelper]
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

    constructor(private _preferenceHelper: PreferenceHelper) {
        let sessionHelper = new SessionHelper();
        let sessionRole = sessionHelper.get<IRole>('role');
        this.setPreferenceMenuLinksVisibility(sessionRole.roleType, sessionHelper);
    }

    /** Set the visibily of menu links for preferences based on User privileges */
    setPreferenceMenuLinksVisibility(roleType: string, sessionHelper: any) {
        this.isFirmPrefEnabled = false;
        this.isCustodianPrefEnabled = false;
        this.isTeamPrefEnabled = false;
        this.isModelPrefEnabled = this._preferenceHelper.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF));
        this.isPortfolioPrefEnabled = this._preferenceHelper.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_PORTFOLIOPREF));
        this.isAccountPrefEnabled = this._preferenceHelper.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_ACCOUNTPREF));
        switch (roleType) {
            case 'FIRM ADMIN':
                this.isFirmPrefEnabled = this._preferenceHelper.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_FIRMPREF));
                this.isCustodianPrefEnabled = this._preferenceHelper.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_CUSTODIANPREF));
                this.isTeamPrefEnabled = this._preferenceHelper.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF));
                break;
            case 'TEAM ADMIN':
                /** FOR TEAM ADMIN Firm/Cutodian preferences will never be shown
                 * irrespective of previleges set for these
                 */
                this.isTeamPrefEnabled = this._preferenceHelper.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF));
                break;
            case 'USER':
                /** FOR normal USER Firm/Cutodian/Team preferences will never be shown
                 * irrespective of previleges set for these
                 */
                break;
        }
    }
}
