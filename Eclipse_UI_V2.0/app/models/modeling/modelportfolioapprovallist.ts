/** 
 * Models For Approval Portfolios
 * 
 */


export interface IModelPortfolioApprovalList {
    newModel: INewModel,
    oldModel: IOldModel,
    portfolio: ISimplePortfolio,
    requesterUserId: number,
    requesterUser: string,
    createdOn: Date
}

export interface IOldModel {
    id: number,
    name: string
}

export interface INewModel {
    id: number,
    name: string
}

export interface ISimplePortfolio {
    id: number,
    name: string
}