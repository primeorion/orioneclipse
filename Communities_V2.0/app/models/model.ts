/** Defines all model entity */
export interface IModelList {
    id: number,
    name: string,
    status: number,
    targetRiskLower: number,
    targetRiskUpper: number,
    currentRisk: number,
    minimumAmount: number,
    strategistId: number,
    style: string,
    tickersWithTargetInPercentage: number,
    lowerUpperToleranceInPercentage: number,
    requireCash: number
    advisorFee: number,
    weightedAvgNetExpense: number,
    isDynamic: number,
    isDeleted: number,
    createdBy: string,
    createdOn: string,
    editedBy: string,
    editedOn: string,
    securities: ISecurities[]
}

/** Defines securities entity */
export interface ISecurities {
    id: number,
    name: string,
    symbol: string,
    company: string,
    category: number,
    assetClass: string,
    subClass: string,
    type: string,
    allocation: number,
    lowerTolerancePercent: number,
    upperTolerancePercent: number
}
/** Defines security search entity */
export interface ISecurtySearch {
    id: number,
    name: string,
    symbol: string,
    company: string
    category: string,
    type: string,
    assetClass: string,
    subclass: string
}
/** Model template */
export interface IModelTemplate {
    url: string
}
/** Define Status Entities */
export interface Istatus {
    id: number,
    name: string
}

/** Model commentary */
export interface IModelCommentary {
    modelId: number,
    modelName: string,
    commentary: string
}

/** Model advertisement */
export interface IModelAdvertisement {
    modelId: number,
    modelName: string,
    advertisement: string
}


/** Model performance */
export interface IModelPerformance {
  id: number,
  modelId: number,
  modelName: string,
  date: string,
  mtd: number,
  qtd: number,
  ytd: number,
  oneYear: number,
  threeYear: number,
  fiveYear: number,
  tenYear: number,
  inception: number,
  asOnDate: string

}

/** Model Marketing Document */
export interface IModelMarketingDocument {
    id: number,
    type: number,
    displayName: string,
    documentName: string,
    path: string,
    description: string,
    strategistId: number,
    modelId: number
}