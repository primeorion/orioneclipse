
import { Component, ViewContainerRef } from '@angular/core';
import { Injectable, Inject }       from '@angular/core';
import { IRole } from '../../models/role';
import { SessionHelper } from '../../core/session.helper';

@Injectable()
export class PreferenceHelper {
    constructor() {
    }

    /** Redirect to specific preference based on User role and privileges*/
    redirectPrefMenuBasedOnUserRoleAndPriv(roleType: string,
        sessionHelper: any,
        eclipseAdminPrefRoute: string) {
        switch (roleType) {
            case 'FIRM ADMIN':
                if (this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_FIRMPREF))) {
                    return eclipseAdminPrefRoute + "/" + "firm";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_FIRMPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_CUSTODIANPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "custodian";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_FIRMPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_CUSTODIANPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "team";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_FIRMPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_CUSTODIANPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "model";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_FIRMPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_CUSTODIANPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_PORTFOLIOPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "portfolio";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_FIRMPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_CUSTODIANPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_PORTFOLIOPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_ACCOUNTPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "account";
                }
                break;
            case 'TEAM ADMIN':
                /** FOR TEAM ADMIN Firm/Cutodian preferences will never be shown
                 * irrespective of previleges set for these
                 */
                // if (sessionHelper.getPermission(PRIV_TEAMPREF).canRead) 
                if ( this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF))) {
                    return eclipseAdminPrefRoute + "/" + "team";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "model";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_PORTFOLIOPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "portfolio";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_TEAMPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))
                    && !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_PORTFOLIOPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_ACCOUNTPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "account";
                }
                break;
            case 'USER':
                /** FOR normal USER Firm/Cutodian/Team preferences will never be shown
                 * irrespective of previleges set for these
                 */
                if ( this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))) {
                    return eclipseAdminPrefRoute + "/" + "model";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_PORTFOLIOPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "portfolio";
                }
                else if (
                    !this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_MODELPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_PORTFOLIOPREF))
                    && this.hasAtleastOneOnePermission(sessionHelper.getPermission(PRIV_ACCOUNTPREF))
                ) {
                    return eclipseAdminPrefRoute + "/" + "account";
                }
                break;
        }
    }

    hasAtleastOneOnePermission(prvlgRcrd: any) {
        if (prvlgRcrd != undefined && (prvlgRcrd.canRead || prvlgRcrd.canAdd || prvlgRcrd.canUpdate)) {
            return true;
        }
        return false;
    }
}