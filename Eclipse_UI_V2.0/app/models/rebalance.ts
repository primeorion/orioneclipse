
import { IRebalanceDetail } from './rebalanceDetail'

/* Defines the Model entity */
export interface IRebalance {
    id: number,
    name: string,
    modelId: number,
    portfolioMarketValue: number,
    securityList : IRebalanceDetail[] 
}
