
import { IPreferences, ILevelPreference, IPreferenceCategory, IPreferenceSave } from '../models/Preferences/preference';
import { ICustomCommunityPreference, ICustomCommunityPreferenceGet} from '../models/Preferences/preferenceCommunity';
import { ILocationOptimizationCustom, ILocationOptimizationSave} from '../models/Preferences/locationOptimization';
import { ISecurityPreferencesGet} from '../models/Preferences/securityPreference';
import { IRedemptionFeePreferencesGet} from '../models/Preferences/redemptionfeepreference'; /** NEWLY ADDED */



export interface IPreferenceDataVM {
    preferenceCategories: IPreferenceCategory[],
    levelPreferences: ILevelPreference,
    //preferences: IPreferences[],
    preferenceCommunities: ICustomCommunityPreference,
    preferenceLocationOptimization: ILocationOptimizationCustom,
    preferenceSecurityData: ISecurityPreferencesGet,
    preferenceRedemptionFeeData: IRedemptionFeePreferencesGet,/** NEWLY ADDED */
    prefPermissonMode: string
}
export interface IPreferenceDataVMCompare {
    preferences: IPreferenceSave[],
    preferenceCommunities: ICustomCommunityPreferenceGet,
    preferenceLocationOptimization: ILocationOptimizationSave,
    preferenceSecurityData: ISecurityPreferencesGet, 
    preferenceRedemptionFeeData: IRedemptionFeePreferencesGet /** NEWLY ADDED */
}