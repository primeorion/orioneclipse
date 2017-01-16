
/** Sleeve account structure for Model */
export interface IModelSleevedAccount
{
    id: number,
    name: string,
    accountId: string,
    accountNumber:number,
    portfolioId: number,
    isSelected:boolean,
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number
}