export interface IAccount {
    id: number,
    name: string,
    accountNumber: string,
    accountId: string,
    accountType: string,
    portfolio: string,
    custodian: string,
    value: number,
    managedValue: number,
    excludedValue: number,
    pendingValue: number,
    ssn: string,
    style: string,
    model: string,
    sleeveType: string,
    distributionAmount: number,
    contributionAmount: number,
    mergeIn: number,
    mergeOut: number,
    cashNeedAmount: number,
    targetCashReserve: number,
    systematicAmount: number,
    systematicDate: Date,
    sma: string,
    status: string,
    pendingTrades: string,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string
}

/** Defines the customview entity for all Accounts*/
export interface IAccountCustomView {
    id: number,
    name: string
}

/** Defines the customview entity for all Accounts*/
export interface IAccountFilters {
    id: number,
    name: string
}

export interface IAccountDashboard {
    dateTime: Date,
    value: IDashboardValueSummary,
    total: number,
    changeValueAmount: number,
    changeValuePercent: number,
    accounts: IDashboardAccountSummary,
    existing: number,
    new: number,
    issues: IDashboardIssueSummary,
    errors: number,
    warnings: number,
    bars: IDashboardBarsSummary,
    systematic: number,
    accountWithMergeIn: number,
    accountWithMergeOut: number,
    newAccount: number,
    accountWithNoPortfolio: number,
    toDo: number,
    sma: number,
    accountWithDataError: number,
    accountWithPedingTrades: number
}

/** Defines dashboard issues summary entity */
export interface IDashboardIssueSummary {
    total: number,
    errors: number,
    warnings: number
}

/** Defines dashboard Value summary entity */
export interface IDashboardValueSummary {
    total: number,
    changeValueAmount: number,
    changeValuePercent: number
}

/** Defines dashboard Accounts summary entity */
export interface IDashboardAccountSummary {
    total: number,
    existing: number,
    new: number
}

/** Defines the bars summary entity */
export interface IDashboardBarsSummary {
    systematic: number,
    accountWithMergeIn: number,
    accountWithMergeOut: number,
    newAccount: number
    accountWithNoPortfolio: number,
    toDo: number,
    sma: number
    accountWithDataError: number,
    accountWithPedingTrades: number
}

/**Account Details Entity */
export interface IAccountDetails {
    id: number,
    name: string,
    accountNumber: string,
    accountId: string,
    billingAccount: string,
    portfolio: string,
    custodian: string,
    sleeveType: string,
    advisior: string,
    ssn: string,
    model: string,
    style: string,
    registrationId: number,
    isReplenish: boolean,
    sleeveContributionPercent: number,
    sleeveDistributionPercent: number,
    sleeveTarget: number,
    sleeveToleranceLower: number,
    sleeveToleranceUpper: number,
    smaTradeable: string,
    sleeveCureent: number,
    summarySection: ISummary,
    ytdGl: IYTDGainLossSummary,
    accountValue: IAccountValueSummary,
    errorAndWarnings: IIssuesSummary,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string,



}

export interface ISummary {
    grandTotal: number,
    totalValue: number,
    managedValue: number,
    excludedValue: number,
    totalCashValue: number,
    cashReserve: number,
    cashAvailable: number,
    setAsideCash: number
}


export interface IYTDGainLossSummary {
    totalGainLoss: number,
    shortTermGL: number,
    longTermGL: number,
    shortTermGLStatus: string,
    longTermGLStatus: string,
    totalGainLossStatus: string

}

export interface IIssuesSummary {
    systematic: string,
    mergeIn: number,
    mergeOut: number,
    newAccount: boolean,
    hasPortfolios: boolean,
    custodialRestrictions: boolean,
    sma: boolean,
    importError: number,
    hasPendingTrades: boolean
}

export interface IAccountValueSummary {
    totalValueOn: Date,
    totalValue: number,
    holdings: IHoldingsSummary[],
    status: string
}

export interface IHoldingsSummary {
    securityName: string,
    marketValue: number,
    unit: number,
    price: number,
    percentage: number,
    color: string
}

export interface IAccountSimple {
    id: number,
    name: string,
    accountType: string,
    accountNumber: string,
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}

export interface IAsideCash {
    id: number,
    description: string,
    cashAmountTypeId: number,
    cashAmountTypeName: string,
    cashAmount: number,
    expirationTypeId: number,
    expirationTypeName: string,
    expirationValue: string,
    toleranceValue: number,
    expiredOn: Date,
    isReplenish: boolean,
    isExpired: boolean,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: string,
    editedOn: Date,
    editedBy: string
}

export interface IAccountAsideCash {
    id: number,
    cashAmountTypeId: number,
    cashAmount: number,
    expirationTypeId: number,
    expirationValue: string, // date or transationTypeId
    toleranceValue: number,
    description: string
}

export interface IAsideCashExpirationType {
    id: number,
    name: string
}

export interface IAsideCashTransactionType {
    id: number,
    name: string
}

export interface IAsideCashAmountType {
    id: number,
    name: string
}

/** Defines entity for sma model levels */
export interface IModelTypes {
    id: number,
    name: string
}

/** Defines sub nodes entity for model  */
export interface IModelSubNode {
    subModelId: number,
    subModelName: string
}
