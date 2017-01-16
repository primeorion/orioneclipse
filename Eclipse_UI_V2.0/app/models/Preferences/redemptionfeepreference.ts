/** Redemption fee Preference Model */
export interface IRedemptionFeePreference {
  id: number,
  securityName: string,
  securityType: string,
  symbol: string,
  redemptionFeeTypeId: number,
  redemptionFeeAmount: any;
  redemptionFeeDays: number
}

/* Redemption Fee Preference model for Save*/
export interface ICustomRedemptionFeePreferenceSave {
  id: number,
  preferenceId: number,
  redemptionFees: IRedemptionFeePreference
}

/** Redemption Fee preference model for Get */
export interface IRedemptionFeePreferencesGet {
  levelName: string,
  recordId: number,
  id: number,
  preferenceId: number,
  name: string,
  displayName: string,
  categoryType: string,
  componentType: string,
  componentName: string,
  redemptionFeePreferences: any[],
  inheritedRedemptionFeePreferences: any[],
  // redemptionFeeDays:number,
  // redemptionFeeAmount:number
}