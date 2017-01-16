export interface ISecurityPreference {
  id: number,
  securityName: string,
  securityType: string,
  symbol: string,
  redemptionFeeTypeId: number,
  redemptionFeeAmount: any;
  redemptionFeeDays: number,
  sellTradeMinAmtBySecurity: any,
  sellTradeMinPctBySecurity: any,
  buyTradeMinAmtBySecurity: any,
  buyTradeMinPctBySecurity: any,
  buyTradeMaxAmtBySecurity: any,
  buyTradeMaxPctBySecurity: any,
  sellTradeMaxAmtBySecurity: any,
  sellTradeMaxPctBySecurity: any,
  taxableAlternate: ISecuritySimple,
  taxDeferredAlternate: ISecuritySimple,
  taxExemptAlternate: ISecuritySimple,
  taxableDivReInvest: boolean,
  taxDefDivReinvest: boolean,
  taxExemptDivReinvest: boolean,
  capGainReinvestTaxable: boolean,
  capGainsReinvestTaxExempt: boolean,
  capGainsReinvestTaxDef: boolean,
  sellTransactionFee: any,
  buyTransactionFee: any,
  custodianRedemptionFeeTypeId: number,
  custodianRedemptionDays: number,
  custodianRedemptionFeeAmount: any,
  excludeHolding: boolean, 
  buyPriority: number,
  sellPriority: number,
}

export interface ISecuritySimple {
  id: number,
  name: string
}


/* Preference Community*/
export interface ICustomSecurityPreferenceSave {
  id: number,
  preferenceId: number,
  securities: ISecurityPreference
}

export interface ISecurityPreferencesGet {
  levelName: string,
  recordId: number,
  id: number,
  preferenceId: number,
  name: string,
  displayName: string,
  categoryType: string,
  componentType: string,
  componentName: string,
  securityPreferences: any[],
  inheritedSecurityPreferences: any[],
  redemptionFeeDays:number,
  redemptionFeeAmount:number
}