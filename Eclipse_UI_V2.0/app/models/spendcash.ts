/* Defines the spend cash parent model entity  */
export interface ISpendCashParentModel {
    selectedFile: any,
    selectedVal: string,
    selectedAccountsList: any,
    portfolioId: any,
    isSpendCash: boolean,
    isCalculateAtSleevePf: boolean,
    displayFilterOptions: {
        showPortfolio: boolean,
        showAccounts: boolean,
        showModel: boolean,
        showtradeGroupsForPortfolio: boolean,
        showtradeGroupsForAccounts: boolean,
        showExcelImport: boolean,
        showSleeves: boolean,
        showExcelImportPortfolio: boolean,
        showExcelImportSleeves: boolean,
        showAmountInput: boolean,
        // showSpendContributionSleeveBal: boolean,
        showSleevePortfolio: boolean,
        showCalculateAtSleevePf: boolean
    }
}

/**Defines spend full amount entity*/
export interface ISpendFullAmount {
    id: number,
    name: string
}


/** Defines spend cash generate trade entity*/
export interface ISpendCashGenerateTrade {
    selectedMethodId: number,
    spendContribute: boolean,
    spendFullAmount: string,
    filterType: string,
    portfolios: ISpendCashPortfolio[]
}

export interface ISpendCashPortfolio {
    id: number,
    amount: number
}

// /**Defines spend cash calculation methods */
// export interface ITradeToolCalculationMethods {
//     methods: ICalculationMethod[],
//     selectedMethodId: number
// }

// /**Defines spend cash methods */
// export interface ICalculationMethod {
//     id: number,
//     name: string
// }
