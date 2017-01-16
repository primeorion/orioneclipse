
/**Strategist entity */
export interface ICommunityStrategist {
  id: number;
  name: string;
}

/**Community entity  */
export interface ICommunity {
  communityId: number;
  community: string;
  strategistId: number;
  isSelected: boolean;
}

// {
//   "level": "Firm",
//   "recordId": 3,
//   "id": null,
//   "preferenceId": 1,
//   "componentType": "default",
//   "componentName": "Textbox",
//   "strategists": {},
//   "inheritedFromValueId": null,
//   "inheritedStrategists": {}
// }

/* Preference Community*/
export interface IPreferenceCommunity {
  strategistIds: any;
  modelAccessLevel: number;
  communityModels: any;
}

/* Preference Community*/
export interface ICustomCommunityPreference {
  level: string;
  recordId: number;
  id: number;
  preferenceId: number;
  componentType: string;
  componentName: string;
  strategists: IPreferenceCommunity;
  inheritedFromValueId: number;
  inheritedStrategists: any;
}

/* Preference Community*/
export interface ICustomCommunityPreferenceSave {
  id: number,
  preferenceId: number;
  strategists: IPreferenceCommunity;
}

/* Preference Community*/
export interface ICustomCommunityPreferenceGet {
  preferenceId: number;
  strategists: IPreferenceCommunity;
}