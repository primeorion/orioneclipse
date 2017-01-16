
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
                if (sessionHelper.getPermission(PRIV_FIRMPREF).canRead) {
                   return eclipseAdminPrefRoute + "/" + "firm";
                }
                else if (!sessionHelper.getPermission(PRIV_FIRMPREF).canRead
                    && sessionHelper.getPermission(PRIV_CUSTODIANPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "custodian";
                }
                else if (!sessionHelper.getPermission(PRIV_FIRMPREF).canRead
                    && !sessionHelper.getPermission(PRIV_CUSTODIANPREF).canRead
                    && sessionHelper.getPermission(PRIV_TEAMPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "team";
                }
                else if (!sessionHelper.getPermission(PRIV_FIRMPREF).canRead
                    && !sessionHelper.getPermission(PRIV_CUSTODIANPREF).canRead
                    && !sessionHelper.getPermission(PRIV_TEAMPREF).canRead
                    && sessionHelper.getPermission(PRIV_MODELPREF).canRead) {
                   return eclipseAdminPrefRoute + "/" + "model";
                }
                else if (!sessionHelper.getPermission(PRIV_FIRMPREF).canRead
                    && !sessionHelper.getPermission(PRIV_CUSTODIANPREF).canRead
                    && !sessionHelper.getPermission(PRIV_TEAMPREF).canRead
                    && !sessionHelper.getPermission(PRIV_MODELPREF).canRead
                    && sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "portfolio";
                }
                else if (!sessionHelper.getPermission(PRIV_FIRMPREF).canRead
                    && !sessionHelper.getPermission(PRIV_CUSTODIANPREF).canRead
                    && !sessionHelper.getPermission(PRIV_TEAMPREF).canRead
                    && !sessionHelper.getPermission(PRIV_MODELPREF).canRead
                    && !sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead
                    && sessionHelper.getPermission(PRIV_ACCOUNTPREF).canRead) {
                   return eclipseAdminPrefRoute + "/" + "account";
                }
                break;
            case 'TEAM ADMIN':
                /** FOR TEAM ADMIN Firm/Cutodian preferences will never be shown
                 * irrespective of previleges set for these
                 */
                if (sessionHelper.getPermission(PRIV_TEAMPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "team";
                }
                else if (!sessionHelper.getPermission(PRIV_TEAMPREF).canRead
                    && sessionHelper.getPermission(PRIV_MODELPREF).canRead) {
                   return eclipseAdminPrefRoute + "/" + "model";
                }
                else if (!sessionHelper.getPermission(PRIV_TEAMPREF).canRead
                    && !sessionHelper.getPermission(PRIV_MODELPREF).canRead
                    && sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "portfolio";
                }
                else if (!sessionHelper.getPermission(PRIV_TEAMPREF).canRead
                    && !sessionHelper.getPermission(PRIV_MODELPREF).canRead
                    && !sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead
                    && sessionHelper.getPermission(PRIV_ACCOUNTPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "account";
                }
                break;
            case 'USER':
                /** FOR normal USER Firm/Cutodian/Team preferences will never be shown
                 * irrespective of previleges set for these
                 */
                if (sessionHelper.getPermission(PRIV_MODELPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "model";
                }
                else if (!sessionHelper.getPermission(PRIV_MODELPREF).canRead
                    && sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "portfolio";
                }
                else if (!sessionHelper.getPermission(PRIV_MODELPREF).canRead
                    && !sessionHelper.getPermission(PRIV_PORTFOLIOPREF).canRead
                    && sessionHelper.getPermission(PRIV_ACCOUNTPREF).canRead) {
                    return eclipseAdminPrefRoute + "/" + "account";
                }
                break;
        }
    }
}