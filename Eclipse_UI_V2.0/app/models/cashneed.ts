/* Defines the Model entity */
export interface ICashNeedParentModel {
  notes: string,
  selectedVal: string,
  selectedAccountsList: any,
  portfolioId: any,  
  displayFilterOptions: {
    showPortfolio: boolean,
    showAccounts: boolean,
    showModel: boolean,
    showSleeves: boolean,
    showtradeGroupsForPortfolio: boolean,
    showtradeGroupsForAccounts: boolean,
    showExcelImport: boolean,
    showExcelImportPortfolio: boolean,
    showExcelImportSleeves: boolean,
  }
}