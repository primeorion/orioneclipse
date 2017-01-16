
/* Defines the Model entity */
export interface IRaiseCash {
  notes: string,
  parentModelData: {
    selectedVal: string,
    selectedAccountsList: any,
    showAccounts: boolean,
    showModel: boolean,
    showPortfolio: boolean,
    showExcelImport: boolean,
    showSleeves: boolean,
    showtradeGroupsForPortfolio: boolean,
    showtradeGroupsForAccounts: boolean,
    showExcelImportPortfolio: boolean,
    showExcelImportSleeves: boolean,
    portfolioId: any;
  }
  sellModel: ISellMethod;
  sellModelList: any;
}

/* Defines the Model entity */
export interface IRaiseCashParentModel {
  selectedFile: any,
  selectedVal: string,
  selectedAccountsList: any,
  portfolioId: any,
  isRaiseCash: boolean,
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
    // showSpendDistributionSleeveBal: boolean,
    showSleevePortfolio: boolean,
    showCalculateAtSleevePf: boolean
  }
}

/**Defines spend full amount entity*/
export interface IRaiseFullAmount {
  id: number,
  name: string
}


/** Defines spend cash generate trade entity*/
export interface IRaiseCashGenerateTrade {
  selectedMethodId: number,
  raiseDistribute: boolean,
  raiseFullAmount: string,
  filterType: string,
  portfolios: IRaiseCashPortfolio[]
}

export interface IRaiseCashPortfolio {
  id: number,
  amount: number
}


export interface IProratedCash {
  notes: string,
  proratedModelData: {
    selectedVal: string,
    selectedAccountsList: any,
    showPortfolio: boolean,
    showAccounts: boolean,
    showModel: boolean,
    showSleeves: boolean,
    showExcelImport: boolean,
    showtradeGroupsForPortfolio: boolean,
    showtradeGroupsForAccounts: boolean,
    showCalculatePortfolio: boolean,
    accountId: any;
  }
  sellModel: ISellMethod;
  sellModelList: any;
}

export interface ISellMethod {
  selectedVal: string,
  selectedAccount: any;
}

export interface ITradeToTarget {
  notes: string,
  parentModelData: {
    selectedVal: string,
    isOnLoad: boolean,
    selectedAccountsList: any,
    showAccounts: boolean,
    showModel: boolean,
    // showtradeGroups:boolean,
    showSleeves: boolean,
    showExcelImport: boolean,
    showtradeGroupsForPortfolio: boolean,
    showtradeGroupsForAccounts: boolean,
    showPortfolio: boolean,
    portfolioId: any;

  }
  sellModel: ISellMethod;
  sellModelList: any;
}
