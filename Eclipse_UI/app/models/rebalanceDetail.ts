import { ITaxlot } from './taxlot'

export interface IRebalanceDetail {
    id: number,
    securityId: number,
    securityName: string,
    symbol: number,
    dateAcquired: Date,
    securityQuantity: number,
    currentPrice: number,
    marketvalue: number,
    isDeleted: number,
    taxlots: ITaxlot[]
}