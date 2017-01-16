export interface ITradeOrder {
  id: number,
  isEnabled: string,
  estimateAmount: number,
  price: number,
  model: IIdName,
  createdBy: string,
  createdDate: Date,
  editedBy: string,
  editedDate: Date,
  warningMessage: string,
  orderQty: number,
  orderPercent: number,
  cashValuePostTrade: number,
  tradingInstructions: string,
  account: IAccount,
  security: ISecurity,
  custodian: string,
  limitPrice: number,
  stopPrice: number,
  orderType: IIdName,
  qualifier: IIdName,
  duration: IIdName,
  action: IIdName,
  isDiscretionary: boolean,
  isSolicited: boolean,
  isAutoAllocate: boolean,
  portfolio: IPortfolio,
}

export interface IAccount {
  id: number;
  accountId: number;
  name: string;
  number: string
  value: string,
  type: string
  cashAvailable: number;
}

export interface IIdName {
  id: number;
  name: string;
}

export interface IKeyValue {
  key: number;
  value: string;
}

export interface ISecurity {
  id: number;
  name: string;
  symbol: string,
  securityType: string
}

export interface IPortfolio {
  id: number;
  name: string;
  isSleevedPorfolio: boolean
}

export interface IModelTolerance {
  portfolioId: number,
  portfolioName: string,
  modelId: number,
  assetId: number,
  assetName: string,
  assetSymbol: string,
  shares: number,
  accountId: number,
  targetInPercentage: number,
  currentInPercentage: number,
  postTradeInPercentage: number,
  differenceInPercentage: number,
  lowerModelTolerancePercentage: number,
  upperModelTolerancePercentage: number,
  outofTolerance: number,
  rangeInPercentage: string,
  currentInDollar: number,
  targetInDollar: number,
  differenceInDollar: number,
  postTradeInDollar: number,
  currentInShares: number,
  targetInShares: number,
  differenceInShares: number,
  postTradeInShares: number
}

export interface IModelSummary {
  costBasis: number,
  cashValue: number,
  cashDifference: number,
  totalCash: number,
  marketValueOld: number,
  marketValue: number
}

export interface IHoldings {
  id: number;
  unit: number;
  securityName: string;
  price: number;
  percentage: number;
}

/** Trade Order Files */
export interface ITradeFiles {
  id: number,
  name: string,
  format: string,
  path: string,
  status: boolean,
  URL: string,
  isDeleted: boolean,
  createdOn: Date,
  createdBy: number,
  editedOn: Date,
  editedBy: string
}

/** edit Trade Order */
export interface IQuickTradeData {
  accountId: number;
  portfolioId: number;
  actionId: number;
  securityId: number;
  dollarAmount: number;
  quantity: number;
  percentage: number;
  isSendImmediately: boolean;
}

export interface IPatchTradeOrder{

  id: number,  
  price: number, 
  orderQty: number, 
  limitPrice: number,
  stopPrice: number,
  orderTypeId: number,
  qualifierId: number,
  durationId: number,
  actionId: number,
  isDiscretionary: boolean,
  isSolicited: boolean,
  isAutoAllocate: boolean,
 isSendImmediately:boolean
 

}

export interface ITradeOrderImport{
  accId : number,
  accountId : string,
  action : string,
  dollars : string,
  security : string,
  error: string,
  isValid: boolean,
}