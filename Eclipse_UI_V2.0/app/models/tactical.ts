export interface IIdName {
    id: number,
    name: string
}

export interface ITacticalPortfolio {
    portfolioInfo: ITPortfolio
    model: ITPortfolioModel[]
}

export interface ITPortfolio {
    id: number,
    portfolioName: string,
    AUM: number,
    netCash: number,
    targetAmount: number,
    targetPer: number,
    currentAmount: number,
    currentPer: number
}

export interface ITPortfolioModel {
    isSleeve: boolean,
    generalInfo: ITTGeneral,
    level1: ITTLevel1[]
}

export interface ITTGeneral {
    sleeveInfo: ITTSleeved,
    accountInfo: ITTAccount
}

export interface ITTSleeved {
    id: string,
    sleeveAUM: number,
    netCash: number,
    cashTarget: number,
    cashTargetPer: number,
    cashCurrentPer: number,
    cashCurrent: number
}

export interface ITTLevel1 {
    id: number,
    name: string,
    targetAmount: number,
    targetPercentage: number,
    currentamount: number,
    currentPercentage: number,
    level2: ITTLevel2[]
}

export interface ITTLevel2 {
    id: number,
    name: string,
    targetAmount: number,
    targetPercentage: number,
    currentamount: number,
    currentPercentage: number,
    level3: ITTLevel3[]
}

export interface ITTLevel3 {
    id: number,
    name: string,
    targetAmount: number,
    targetPercentage: number,
    currentamount: number,
    currentPercentage: number,
    level4: ITTLevel4[]
}

export interface ITTLevel4 {
    id: number,
    name: string,
    targetAmount: number,
    targetPercentage: number,
    currentamount: number,
    currentPercentage: number
}

export interface ITTSecurity {
    id: number,
    securityName: string,
    // tradeOrder: ITTTradeOrder,
    // postTrade: ITTPostTrade,
    // modelTarget: ITTModelTarget,
    // current: ITTCurrent,
    // gainLoss: ITTGainLoss,
    // comments: ITTComment,
    tradeOrderAction: number,
    tradeOrderShares: number,
    tradeOrderAmount: number,
    tradeOrderPrice: number,
    tradeOrderRedemptionFee: number,
    tradeCost: number,
    tradeOrderHoldUntil: Date;
    postTradeShares: number,
    postTradeAmount: number,
    postTradePer: number,
    modelTargetShares: number,
    modelTargetAmount: number, //renamed
    modelTargetPer: number,
    currentShares: number,
    currentAmount: number,
    currentPer: number,
    gainLossCostShortTerm: number,
    gainLossCostLongTerm: number,
    gainAmount: number,
    gainPer: number,
    tradeGain: number,
    commentsTradeReason: string,
    commentsMessage: string,
    isSMA: boolean,
    exclude: boolean,
    accounts: ITTAccount[]
}

export interface ITTTradeOrder {
    action: string,
    shares: number,
    redemptionFee: number,
    tradeCost: number,
    amount: number
}

export interface ITTPostTrade {
    shares: string,
    amount: number,
    postTradePer: number
}

export interface ITTModelTarget {
    shares: string,
    amount: number,
    modelTargetPer: number
}

export interface ITTCurrent {
    shares: string,
    amount: number,
    currentPer: number
}

export interface ITTGainLoss {
    costShortTerm: number,
    costLongTerm: number,
    gainAmount: number,
    gainPer: number,
    tradeGain: number
}

export interface ITTComment {
    tradeReason: string,
    message: string
}

export interface ITTSecurity2 {
    id: number,
    orionConnectExternalId: number,
    name: string,
    symbol: string,
    securityTypeId: number,
    securityType: string,
    price: number,
    statusId: number,
    status: string,
    isDeleted: number,
    assetCategoryId: number,
    assetCategory: string,
    assetClassId: number,
    assetClass: string,
    assetSubClassId: number,
    assetSubClass: string,
    custodialCash: string,
    createdOn: Date,
    editedOn: Date,
    createdBy: string,
    editedBy: string
}

export interface ITTAccount {
    id: number,
    account: string,
    custodian: string,
    type: string,
    shares: number,
    amount: number,
    costShortTerm: number,
    costLongTerm: number,
    gainAmount: number,
    gainPer: number,
    tradeGain: number,
    alternative: string,
    taxlots: ITTTaxlot[]
}

export interface ITTTaxlot {
    id: number,
    acquiredDate: Date,
    shares: number,
    value: number,
    costPerShare: number,
    costShortTerm: number,
    costLongTerm: number,
    gainAmount: number,
    gainPer: number,
    tradeGain: number,
    amount: number
}

export interface IPortfolioCashSummary {
    portfolioCashSummary: IPortfolioCash,
    accountCashSummary: IAccountCash[]
}

export interface IPortfolioCash {
    id: number,
    portfolioName: string,
    modelName: string,
    totalTradeCost: number,
    totalRedemptionFee: number,
    totalValue: number,
    currentValue: number,
    reserveValue: number,
    excludedValue: number,
    setAsideValue: number,
    targetValue: number,
    postTradeValue: number,
    needsValue: number
}

export interface IAccountCash {
    id: number,
    accountName: string,
    currentValue: number,
    reserveValue: number,
    totalValue: number,
    targetValue: number,
    postTradeValue: number,
    needsValue: number
}

export interface ITradeAccountSecuirtyGroup {
    secuirtyGroup: ITradeAccount[],
    taxlotGroup: ITradeTaxlot[]
}

export interface ITradeAccount {
    accountId: number,
    action: number,
    securityId: number,
    amount: number,
    shares: number,
    holdUntil: string,
}

export interface ITradeTaxlot {
    taxlotId: number,
    taxlotShare: number,
    taxlotAmount: number,
    action: number
}

export interface ITacticalQuery {
    portfolioId: number,
    accountId: number,
    usePending: boolean,
    defaultAction: string
}
