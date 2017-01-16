import { IRolePrivilege } from '../models/rolePrivileges';

/**
 * model for privileges check in UI
 */
export interface IUIPrivilege {
    isFirmAdmin: boolean,
    isTeamAdmin: boolean,
    isUser: boolean,
    hasUser: boolean,
    user: IRolePrivilege,
    hasRole: boolean,
    role: IRolePrivilege,
    hasTeam: boolean,
    team: IRolePrivilege,
    hasCustodian: boolean,
    custodian: IRolePrivilege,
    hasPreferences: boolean,
    preferences: IRolePrivilege,
    security: IRolePrivilege,
    hasSecurities: boolean
}
