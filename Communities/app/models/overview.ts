
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
    firms: IAccountFirm[]
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
    firms: ICashFlowFirm[]
}
export interface ICashFlowFirm {
    name: string,
    distribution: number,
    contribution: number,
    cashFlow: number,
    color: string
}