/** Portfolio-Model Allocation Model entities*/
export interface IModelPortfolioAllocation
{
    id: number,
    symbol: string,
    name: string,
    targetInAmt: number,
    currentInAmt: number,
    targetInPercent: number,
    currentInPercent: number
}

export interface IPortfolioTotalTargetAllocationVM
{
    symbol: string,
    name: string,
    targetInAmt: number,
    currentInAmt: number,
    targetInPercent: number,
    currentInPercent: number
}