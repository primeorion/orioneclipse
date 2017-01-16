/* Defines the Custodian entity */
export interface ICustodian {
    custodianSecuritySymbol: string,
    id: number,
    externalId: number,
    name: string,
    code: string,
    accountNumber: string,
    tradeExecutionTypeId: number,
    tradeExecutionTypeName: string,
    tradeExecutions: ITradeExecutions[],
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}

/* Defines the TradeExecutions entity */
export interface ITradeExecutions{
    securityTypeId: number,
    securityTypeName: string,
    tradeExecutionTypeId: number,
    tradeExecutionTypeName: string
}

/* Defines the Security entity */
export interface ISecurity {
    id: number,
    name: string,
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}

/* Defines the TradeExecutionType entity */
export interface ITradeExecutionType {
    id: number,
    name: string,
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}

/* Defines the SecurityType entity */
export interface ISecurityTradeExeType{
    custodianSecurity: string,
    tradeExetype:string
}

/* Defines the CustodianAccounts entity */
export interface ICustodianAccounts{
    id: number,
    accountNumber: string,
    name: string,
    portfolioId: number,
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}
