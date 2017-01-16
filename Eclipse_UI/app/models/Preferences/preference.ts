/* Level Preferences*/
export interface IPreferences {
  id: number,
  preferenceId: number,
  categoryType: string,
  name: string,
  displayName: string,
  required: boolean,
  displayOrder: number
  valueType: string,
  value: any,
  isInherited: boolean,
  inheritedValue: any,
  inheritedFrom: string
  inheritedFromName: string,
  inheritedFromId: number,
  inheritedFromValueId: number,
  options: any[],
  selectedOptions: any[],
  inheritedSelectedOptions: any[],
  componentType: string,
  componentName: string,
  minlength: number,
  maxlength: number,
  minValue: number,
  maxValue: number,
  pattern: string,
  watermarkText: string,
  symbol: string,
  helpText: string,
  indicatorValue: any,
  selectedIndicatorValue: any,
  inheritedIndicatorValue: any,
  indicatorOptions: any[],
  isValid: boolean
}

/* Preference collection for a Level*/
export interface ILevelPreference {
  level: string,
  id: number,
  preferences: IPreferences[],

}

/* Preference Levels (FIRM/CUSTODIAN/TEAM/MODEL/PORTFOLIO/ACCOUNT*/
export interface IPreferenceLevel {
  id: number;
  name: string;
  bitValue: number;
  shortName: string;
  allowedRoleType: number;
}

/* Dropdown/Checkbox/Radiobutton generic options*/
export interface IPreferenceOption {
  key: number,
  value: string,
  order: number
}

/* Specific Preference Level Category*/
export interface IPreferenceCategory {
  id: number,
  name: string,
  order: number
}
export interface ILevelPreferenceSave {
  level: string,
  id: number,
  ids: number[],
  defaultPreferences: IPreferenceSave[],
  locationOptimizationPreference: any,
  communityStrategistPreference: any,
  securityPreferences: any,

}

export interface IPreferenceSave {
  id: number,
  preferenceId: number,
  // name: string,
  valueType: string,
  componentType: string,
  componentName: string,
  selectedOptions: any[],
  value: string,
  options:any[]
}

