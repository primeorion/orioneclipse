import { ISecurity } from './security'

export interface IEquivalence{
    id: number,
    name: string,
    symbol: string,
    securityTypeId: number,
    securityType: string,
    minTradeAmount: number,
    minInitialBuyDollar: number,
    buyPriority: string,
    sellPriority: string,
    taxableSecurity: ISecurity[],
    taxDeferredSecurity: ISecurity[],
    taxExemptSecurity: ISecurity[],
    taxableFilteredSearchResult: ISecurity[],
    taxDeferredFilteredSearchResult: ISecurity[],
    taxExemptFilteredSearchResult: ISecurity[],
    isSelected: boolean
}
