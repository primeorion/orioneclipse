
/* Defines the Model entity */
export interface ITrade {
    id: number,
    tradeAmount: number,
    action: string,
    portfolioId: number,
    portfolioName: string,
    modelId: number,
    modelName: string,
    securityName: string,
    accountId: number,
    accountNumber: string,
    accountType: string,
    createdOn: Date 
}

