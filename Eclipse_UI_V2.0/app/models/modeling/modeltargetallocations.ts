/** Portfolio-Model Allocation Model entities*/
export interface IModelTargetAllocation
{
    id: number,
    symbol: string,
    name: string,
    targetInPercent: number
}

export interface IModelTargetAllocationVM
{
    symbol: string,
    name: string,
    targetInPercent: number
}