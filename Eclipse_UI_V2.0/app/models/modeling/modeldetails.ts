/**
 * This {Model} with the detailed structure of the Model
 * This includes child nodes associated with specific model
 */

/** Details of Model */
export interface IModelDetails {
    id: number;
    modelDetailId: number;
    name: string;
    modelType: string;
    modelTypeId: number;
    rank: number;
    level: string;
    targetPercent: number;
    toleranceTypeValue: number;
    lowerModelTolerancePercent: number;
    upperModelTolerancePercent: number;
    lowerModelToleranceAmount: number;
    upperModelToleranceAmount: number;
    lowerTradeTolerancePercent: number;
    upperTradeTolerancePercent: number;
    leftValue: number,
    rightValue: number,
    children: IModelDetails[],
    values: any[],
    submodelList: any[],
    substitutedStyle: string
}