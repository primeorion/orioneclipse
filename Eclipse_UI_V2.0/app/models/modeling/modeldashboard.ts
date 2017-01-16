/**
 * This {Model} deals with Dashboard summary details
 * This Tile shows the count(s) and status(es) of all models
 */

/** Defines Models entity */
export interface IModelDashboard {
    totalNumberOfModels: number;
    newModels: number;
    existingModels: number;
    approvedModels: number;
    waitingForApprovalModels: number;
    draftModels: number;
    notActiveModels: number;
    OUBalanceModels: number;
    changeDateTime : Date;
    analyticsOn: Date;
}


