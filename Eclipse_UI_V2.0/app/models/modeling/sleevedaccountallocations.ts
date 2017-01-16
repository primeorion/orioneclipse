/** Portfolio-Model Allocation Model entities*/
export interface ISleevedAccountAllocation
{
    id: number,
    symbol: string,
    name: string,
    targetInAmt: number,
    currentInAmt: number,
    targetInPercent: number,
    currentInPercent: number
}

export interface ISleevedAccountTotalTargetAllocationVM
{
    symbol: string,
    name: string,
    targetInAmt: number,
    currentInAmt: number,
    targetInPercent: number,
    currentInPercent: number
}