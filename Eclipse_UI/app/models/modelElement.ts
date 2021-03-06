/* Defines the Custodian entity */
export interface IModelElement {
    id: number,
    name: string,
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number,
    targetPercent: number,
    lowerModelTolerancePercent: number,
    upperModelTolerancePercent: number,
    toleranceBand: number,
    lowerModelToleranceAmount: number,
    upperModelToleranceAmount :number,
    lowerTradeTolerancePercent: number,
    upperTradeTolerancePercent: number,
    leftValue: number,
    rightValue: number,
    children : IModelElement[],
    parentElement : IModelElement,
    level : number,
    colorCounter:number,
    relatedTypeId: number,
    isSecuritySet: boolean,
    hasChild: boolean
}
