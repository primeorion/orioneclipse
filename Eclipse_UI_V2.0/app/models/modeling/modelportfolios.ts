
// /** List of Model Portfolios */
// export interface IModelPortfolios
// {
//     modelPortfolios: ISimpleModelPortfolio[];
// }

/** Model Portfolio structure */
export interface IModelPortfolios
{
    id: number,
    name: string,
    substitutedModelId: number,
    status:string,
    isSelected: boolean
}