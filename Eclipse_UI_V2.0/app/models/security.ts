import { ICustodian } from './custodian'
import { IEquivalence } from './equivalence'
import { ITlh } from './tlh'

export interface ISecurity {
  id: number,
  orionConnectExternalId: number,
  symbol: string,
  name: string,
  securityTypeId: number,
  securityType: string,
  price: number,
  status: string,
  isDeleted: number,
  assetCategoryId: number,
  assetClassId: number,
  assetSubClassId: number,
  custodialCash: number,
  createdOn: Date,
  createdBy: number,
  editedOn: Date,
  editedBy: number,
  assetClass: string,
  assetCategory: string,
  assetSubClass: string,
  targetPercent: number,
  lowerModelTolerancePercent: number,
  upperModelTolerancePercent: number,
  lowerModelToleranceAmount: number,
  upperModelToleranceAmount: number,
  taxableSecurity: ISecurity[],
  taxDeferredSecurity: ISecurity[],
  taxExemptSecurity: ISecurity[],
  minTradeAmount: number,
  minInitialBuyDollar: number,
  buyPriority: IBuyPriority,
  sellPriority: ISellPriority,
  custodians: ICustodian[],
  equivalences: IEquivalence[],
  tlh: ITlh[],
  taxableFilteredSearchResult: ISecurity[],
  taxDeferredFilteredSearchResult: ISecurity[],
  taxExemptFilteredSearchResult: ISecurity[],
  isSelected:boolean
  isEdited: boolean
}

export interface IBuyPriority {
  id: number;
  displayName: string
}

export interface ISellPriority {
  id: number;
  displayName: string
}



export interface ICorporateActions {
  id: number;
  corpActionType: string,
  dynShareAllocation:number,
  spinoff:string
}

export interface IAddCorporateAction { 
  corpActionType: string,
  from:any,
  to:any,
  spinoff:string
}
