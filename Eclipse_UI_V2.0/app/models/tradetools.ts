/** Defines the TradeToolsFilter entity */
export interface ITradeToolsFilter {
    id: number,
    name: string,
    tag: string
}

/* Defines the Sell security entity */
export interface ISellSecurity {
    id: number,
    name: string
}

/* Defines the Trade security entity */
export interface ITradeSecurities {
    sellSecurityId: number,
    sellSecurityName: string,
    buySecurityId: number,
    buySecurityName: string
}

/* Defines the Trade groups portfolio entity */
export interface ITradeGroupsPortfolio {
    id: number,
    name: string
}

/* Defines the Trade groups portfolio entity */
export interface ITradeGroupsAccount {
    id: number,
    name: string
}

/* Defines the entity for excel import */
export interface IExcelImport {
    name: string,
    document: any
}

/* Defines the entity for generate trades */
export interface IGenerateTrades {
    accountIds: number[],
    portfolioIds: number[],
    modelIds: number[],
    tradeGroupIds: number[],
    portfolioTradeGroupIds: number[],
    tradeGroupForAccountIds: number[],
    tradeGroupForPortfolioIds: number[],
    security: ITradeSecurity[],
    tickerSwap: ITickerSwap[],
    notes: string,
    reason: string,
    swapOptions: {
        tickerBatch: number,
        profitLoss: number,
        value: number,
        valueType: number
        includeTaxDeferredOrExemptAccounts: boolean,
        instanceNote: string
    }

}

/** Defines the entity trade security */
export interface ITradeSecurity {
    sellSecurityId: number,
    buySecurityId: number,
    percent: number
}

/**Defines the entity file upload results  */
export interface IFileUploadResult {
    recordType: string,
    records: IFileUploadRecords[]
}

/**Defines the entity file upload records  */
export interface IFileUploadRecords {
    id: number,
    name: string,
    accountId: number,
    accountNumber: number,
    isValid: boolean
}

/* Defines the global trades parent model entity  */
export interface IGlobalTradesParentModel {
    selectedFile: any,
    isOnLoad: boolean,//Flag to jump to second tab incase of querystring values from portfolio/model/account.
    selectedVal: string,
    selectedAccountsList: any,
    portfolioId: any;
    displayFilterOptions: {
        showPortfolio: boolean,
        showAccounts: boolean,
        showModel: boolean,
        showtradeGroupsForPortfolio: boolean,
        showtradeGroupsForAccounts: boolean,
        showExcelImport: boolean,
        showSleeves: boolean,
        showExcelImportPortfolio: boolean,
        showExcelImportSleeves: boolean
    }
}


/** Defines the entity for Trade to Target */
export interface ITradeTraget {
    accountIds: number[],
    modelIds: number[],
    
    security: ISecurity,
    preferences: IPreferences
}

export interface ISecurity {
    securityId: number,
    targetPercent: number,
    side: number,
    isFullTrade: boolean,
    modelTypeId: number,
    reason: string
}

export interface IPreferences {
    minimumTradePercent: number,
    minimumTradeDollar: number,
    allowWashSalesId: number,
    allowShortTermGainsId: number
}

/**Define Trade Side */
export interface ITradeSide {
    id: number,
    name: string
}

/** Define Trade AllowShort Term Gains */
export interface IShortTermGain {
    id: number,
    name: string
}

/**Define list for allow Wash Sales  */
export interface IWashSales {
    id: number,
    name: string
}

/**Define  model types on the basis of 
models or portfolios, or accounts */
export interface IModelTypes {
    id: number,
    name: number,
    modelType: string,
    modelTypeId: number,
    isFavorite: boolean,
    nameSpace: null;
    securityAsset: IModelsecurityAsset
}

export interface IModelsecurityAsset{
    id: number, 
    name: string,
    color: string
}
export interface ISwapOptions {
    tickerBatch: number,
    profitLoss: number,
    value: number,
    valueType: number
    includeTaxDeferredOrExemptAccounts: boolean,
    instanceNote: string
}

export interface ITickerSwap {
    sellTickerId: number,
    sellTickerName: string,
    buyTickerId: number,
    buyTickerName: string,
    percent: number
}

export interface ITLHFilters {
    taxableAccountsOnly: boolean,
    gainLoss: number,
    term: number,
    sign : number,
    amount: number
}

export interface ITradeTLH {
    accountName: string,
    accountNumber: number,
    accountType: number,
    securitySymbol: string,
    portfolioRealizedYtdGL: number,
    totalGLAmount: number,
    GLPercent: number,
    STGLAmount: number,
    LTGLAmount: number,
    accountValue: number,
    cashValue: number,
    securityName: string,
    currentShares: string,
    currentValue: number, 
    currentPercent: number,
    custodian: string,
    managementStyle: string,
    accountId: number,
    portfolioId: number
}
/**GainOrLoss Entry */
export interface IGainOrLoss {
    id: number,
    name : string
}