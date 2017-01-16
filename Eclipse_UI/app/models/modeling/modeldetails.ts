/**
 * This {Model} with the detailed structure of the Model
 * This includes child nodes associated with specific model
 */

/** Details of Model */
export interface IModelDetails {
    id: number;
    name: string;
    relatedType: string;
    relatedTypeId: number;
    rank: number;
    level: string;
    targetPercent: number;
    toleranceBand: number;
    lowerModelTolerancePercent: number;
    upperModelTolerancePercent: number;
    lowerModelToleranceAmount: number;
    upperModelToleranceAmount: number;
    lowerTradeTolerancePercent: number;
    upperTradeTolerancePercent: number
}