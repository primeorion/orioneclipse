/** Defines the portfolio entity */
export interface IPortfolio {
    id: number,
    name: string,
    model: string,
    team: string,
    managedValue: number,
    excludedValue: number,
    totalValue: number,
    action: string,
    tradesPending: boolean,
    percentDeviations: number,
    cashReserve: number,
    cashNeed: number,
    cash: number,
    cashPercent: number,
    minCash: number,
    minCashPercent: number,
    totalCash: number,
    totalCashPercent: number,
    autoRebalanceOn: Date,
    OUB: boolean,
    contribution: number,
    tradeBlocked: boolean,
    status: string,
    TLH: boolean,
    advisor: string,
    value: string,
    style: string,
    lastRebalancedOn: Date,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}

/** Defines the portfolio status entity */
export interface IPortfolioFilters {
    id: number,
    filter: string,
    priority: number,
    actionText: string,
    portfolioStatusValue: string
}

/** Defines the portfolio view model entity */
export interface IPortfolioViewModel {
    id: number,
    name: string,
    model: string,
    team: string,
    accounts: IAccount[],
    managedValue: number,
    excludedValue: number,
    totalValue: number,
    action: string,
    tradesPending: boolean,
    percentDeviations: number,
    cashReserve: number,
    cashNeed: number,
    cash: number,
    cashPercent: number,
    minCash: number,
    minCashPercent: number,
    totalCash: number,
    totalCashPercent: number,
    autoRebalanceOn: Date,
    OUB: boolean,
    contribution: number,
    tradeBlocked: boolean,
    status: string,
    TLH: boolean,
    advisor: string,
    value: string,
    style: string,
    lastRebalancedOn: Date,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}

/** Defines the EditPortfolio entity */
export interface IEditPortfolio {
    name: string,
    modelId: number,
    isSleevePortfolio: boolean,
    tags: string,
    teamIds: number[],
    primaryTeamId: number
}

/** Defines the portfolio simple entity */
export interface IPortfolioSimple {
    id: number,
    name: string,
    source: string,
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}

/** Defines the account entity */
export interface IAccount {
    id: number,
    name: string,
    account: string,
    accountType: string,
    managed: number,
    excludedValue: number,
    total: number,
    tradePending: boolean,
    cashValue: number,
    cashReserve: number,
    totalCash: number,
    status: string,
    portfolioId: number
    /**Properties base on Api */
    accountId: number,
    accountName: string,
    accountNumber: string,
    managedValue: number,
    totalValue: number,
    pendingValue: number

}

/** Defines dashboard portfolio entity */
export interface IPortfolioDashboard {
    analyticsOn: Date,
    portfolio: IDashboardPortfolioSummary,
    issues: IDashboardIssueSummary
    AUM: IAUMsummary,
    outOfTolerance: number,
    cashNeed: number,
    setForAutoRebalance: number,
    contribution: number,
    distribution: number,
    noModel: number,
    blocked: number,
    TLHOpportunity: number,
    dataErrors: number,
    pendingTrades: number,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: string,
    editedOn: Date,
    editedBy: string
}

/** Defines dashboard portfolio summary entity */
export interface IDashboardPortfolioSummary {
    total: number,
    existing: number,
    new: number
}

/** Defines dashboard issues summary entity */
export interface IDashboardIssueSummary {
    total: number,
    errors: number,
    warnings: number
}

/** Defines the portfolio details entity */
export interface IPortfolioDetails {
    id: number,
    general: IPortfolioGeneralInfo,
    teams: IPortfolioTeam[],
    issues: IIssuesSummary,
    summary: IPortfolioSummary,
    accounts: IPortfolioAccounts,
    isDeleted: boolean,
    createdDate: Date,
    createdBy: string,
    editedDate: Date,
    editedBy: string
}

/** Defines the general info */
export interface IPortfolioGeneralInfo {
    portfolioName: string,
    sleevePortfolio: boolean,
    modelId: number,
    modelName: string,
    tags: string
}

/** Defines the team entity */
export interface IPortfolioTeam {
    id: number
    name: string,
    isPrimary: boolean
}

/** Defines the issues summary entity */
export interface IIssuesSummary {
    outOfTolerance: number,
    cashNeed: number,
    setForAutoRebalance: boolean,
    contributions: number,
    distribution: number,
    modelAssociation: boolean,
    blocked: boolean,
    TLHOpportunity: boolean,
    dataErrors: number,
    pendingsTrades: number
}

/** Defines the portfolio summary entity */
export interface IPortfolioSummary {
    AUM: IAUMsummary,
    realized: IRealizedSummary
}

/** Defines the aum summary entity */
export interface IAUMsummary {
    total: number,
    managedValue: number,
    excludedValue: number,
    totalCash: ITotalCashSummary
    //Added for portfolio dashboard 
    changeValue: number,
    changePercent: number,
    status: string
}

/** Defines the TotalCash summary entity */
export interface ITotalCashSummary {
    total: number,
    reserve: number,
    cash: number
}

/** Defines the Realized summary entity */
export interface IRealizedSummary {
    total: number,
    shortTerm: number,
    shortTermStatus: string,
    longTerm: number,
    longTermStatus: string
}

/** Defines the accounts entity */
export interface IPortfolioAccounts {
    regular: IAccount[],
    sma: IAccount[],
    sleeved: IAccount[]
}

/** Defines the customview entity for all portfolios*/
export interface IPortfolioCustomView {
    id: number,
    name: string
}

/** Define Assigned accounts */
export interface IAddAccounts {
    accountIds: any
}
