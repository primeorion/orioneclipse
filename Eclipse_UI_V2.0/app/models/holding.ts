/**DashBoard */
export interface IHoldingDashboard {
    dateTime: Date,
    value: IDashboardValueSummary,
    holdings: IDashboardHoldingSummary,
    issues: IDashboardIssueSummary,
    bars: IDashboardBarsSummary,
    topTenHoldings: IDashboardTpo10HoldingsSummary
}

/** Defines dashboard Value summary entity */
export interface IDashboardValueSummary {
    total: number,
    changeValueAmount: number,
    changeValuePercent: number,
    status: string
}

/** Defines dashboard holdings summary entity */
export interface IDashboardHoldingSummary {
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

/** Defines the bars summary entity */
export interface IDashboardBarsSummary {
    all: number,
    exclude: number,
    notInModel: number,
}

/** Defines the Top 10 holdings summary entity */
export interface IDashboardTpo10HoldingsSummary {
    totalHoldingValue: number,
    totalHoldingValueStatus: string,
    holdings: IHoldings[],
}

/** Defines the holdings */
export interface IHoldings {
    securityName: string,
    marketValue: number,
    unit: number,
    price: number,
    percentage: number,
    color: string
}
//End DashBoard

/** List */
export interface IHolding {
    id: number,
    accountNumber: string,
    securityName: string,
    price: number,
    shares: number,
    value: number,
    currentInPer: number,
    targetInPer: number,
    pendingValue: number,
    pendingInPer: number,
    excluded: boolean,
    isCash: boolean,
    isModel: boolean,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string
}

//End List
/**Holding Details */

export interface IHoldingDetails {
    id: number,
    securityName: string,
    securitySymbol: string,
    accountName: string,
    accountNumber: string,
    portfolioName: string,
    registrationName: string,
    price: number,
    shares: number,
    value: number,
    currentInPer: number,
    targetInPer: number,
    pendingValue: number,
    pendingInPer: number,
    excluded: boolean,
    isCash: boolean,
    inModel: boolean,
    GLSection: IGainLoss,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string
}

export interface IGainLoss {
    totalGainLoss: number,
    totalGainLossStatus: string,
    shortTermGL: number,
    shortTermGLStatus: string,
    longTermGL: number,
    longTermGLStatus: string
}


export interface ITaxlots {
    id: number,
    dateAcquired: Date,
    quantity: number,
    costAmount: number,
    costPerShare: number,
    GLSection: IGainLoss,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string
}



export interface ITransactions {
    id: number,
    date: Date,
    type: string,
    amount: number,
    units: number,
    cost: number,
    price:number,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string
}

//End Details


//not using
export interface IAccountSimpleWithReturnValue {
    id: number,
    name: string,   
    accountNumber: string,
    accountType: string,
    value: number,  
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string
}

export interface IPortfolioSimpleWithReturnValue {
    id: number,
    name: string,  
    value: number,  
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string
}
//end not using

export interface IHoldingWithReturnValue{
    id: number,
    name: string,  
    value: number,  
    type:string,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: string
}
/** Defines the holding filters entity */
export interface IHoldingFilter {
    id: number,
    name: string   
}
