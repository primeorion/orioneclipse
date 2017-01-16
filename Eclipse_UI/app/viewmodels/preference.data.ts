
import { IPreferences, ILevelPreference, IPreferenceCategory, IPreferenceSave } from '../models/Preferences/preference';
import { ICustomCommunityPreference, ICustomCommunityPreferenceGet} from '../models/Preferences/preferenceCommunity';
import { CommunityStrategistComponent } from '../shared/communitystrategist/component.communitystrategist';
import { ILocationOptimizationCustom, ILocationOptimizationSave} from '../models/Preferences/locationOptimization';
import { ISecurityPreferencesGet} from '../models/Preferences/securityPreference';



export interface IPreferenceDataVM {
    preferenceCategories: IPreferenceCategory[],
    levelPreferences: ILevelPreference,
    //preferences: IPreferences[],
    preferenceCommunities: ICustomCommunityPreference,
    preferenceLocationOptimization: ILocationOptimizationCustom,
    preferenceSecurityData: ISecurityPreferencesGet,
    prefPermissonMode: string
}
export interface IPreferenceDataVMCompare {
    preferences: IPreferenceSave[],
    preferenceCommunities: ICustomCommunityPreferenceGet,
    preferenceLocationOptimization: ILocationOptimizationSave,
    preferenceSecurityData: ISecurityPreferencesGet
}