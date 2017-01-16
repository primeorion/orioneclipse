/**
 * This {Model} deals with Dashboard summary details
 * This Tile shows the count(s) and status(es) of all models
 */

/** Defines Models entity */
export interface IModelDashboard {
    totalNumberOfModels: number;
    existingModels: number;
    newModels: number;
    approvedModels: number;
    approvedModelsChangeDateTime: Date;
    waitingForApprovalModels: number;
    waitingForApprovalModelsChangeDateTime: Date;
    draftModels: number;
    draftModelsChangeDateTime: Date;
    nonActiveModels: number;
    nonActiveModelsChangeDateTime: Date;
    OUBalanceModels: number;
    OUBalanceModelsChangeDateTime: Date
}


