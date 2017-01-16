
/** Defines aum summary entity */
export interface IAumSummery {
    percentChange: number,
    totalMarketValue: number,
    totalPercent: number,
    firms: IAumFirm[],
    models: IAumFirm[],
    advisors: IAumFirm[]
}

export interface IAumFirm {
    name: string,
    marketValue: number,
    percent: number,
    color: string
}

/** Defines dashboard account summary entity */
export interface IAccountSummery {
    totalManagedAccount: number,
    totalPercent: number,
    firms: IAccountFirm[],
    models: IAccountFirm[],
    advisors: IAccountFirm[]

}
export interface IAccountFirm {
    name: string,
    noOfAccount: number,
    percent: number,
    color: string

}

/** Defines dashboard cash flow summary entity */
export interface ICashFlowSummery {
    totalCashFlow: number,
    totalDistribution: number,
    totalContribution: number,
    firms: ICashFlow[],
    models: ICashFlow[],
    advisors: ICashFlow[]
}
export interface ICashFlow {
    name: string,
    distribution: number,
    contribution: number,
    cashFlow: number,
    color: string,
    dailyStatistics: ICashFlowDailyStatistics[]
}
export interface ICashFlowDailyStatistics {
    date: string,
    distribution: number,
    contribution: number,
    cashFlow: number
}