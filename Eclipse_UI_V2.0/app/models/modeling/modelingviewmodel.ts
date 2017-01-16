
import { IPortfolio } from '../portfolio';
import { IModelDetails } from './modeldetails';

/** Defines the modeling view model entity */

export interface IModelingViewModel {
    id: number,
    name: string,
    // portfolios: IPortfolio[]
    portfolioCount: number,
    modelAUM: number,
    source: string,
    statusId: number,
    currentStatusId: number,
    status: string,
    nameSpace: string,
    tags: string,
    isDynamic: boolean,
    isSubstitutedForPortfolio: boolean,
    description: string,
    ownerUserId: number,
    ownerUser: string,
    managementStyleId: number,
    managementStyle: string,
    isCommunityModel: boolean,
    comunityModelId: number,
    lastSyncDate: Date,
    approvedByUserId: number,
    approvedByUser: string,
    isDeleted: boolean,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number,
    teams: any[],
    modelDetail: IModelDetails
}
