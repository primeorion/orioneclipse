
import { IPortfolio } from '../portfolio';
import { IModelDetails } from './modeldetails';
import { IModelTeams } from './modelteams';

/** Model entities structure */

export interface IModel {
  id: number,
  name: string,
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
  teams: IModelTeams[],
  modelDetail: IModelDetails
}

export interface IModelAdd {
  id: number,
  name: string,
  description: string,
  statusId: number,
  currentStatusId: number,
  managementStyleId: number,
  isCommunityModel: boolean,
  isDynamic: boolean,
  tags: string,
  nameSpace: string
}

export interface ISubModel {
  id: number,
  name: string,
  modelType: string,
  modelTypeId: number,
  namespace: string,
  isFavorite: boolean,
  securityAsset: ISubModelSecurityAssetType,
  level: string,
  leftValue: number,
  rightValue: number,
  isSubstituted: boolean,
  substituteOf: number,
  children: IModelDetails[],
  isDynamic: boolean
}

export interface ISubModelSecurityAssetType {
  id: number,
  name: string,
  color: string
}

export interface IcreateNewModel {
  name: string,
  nameSpace: string,
  modelTypeId: number;
  securityAsset: ISecurityAsset;
}


export interface ISecurityAsset {
  id: number
}
export interface CreateTree {
  name: string,
  id: number,
  parent: string,
  modelType: string,
  modelDetailId: number,
  nodeName: string,
  children: any[],
  values: any[],
  submodelDataLsit: any[],
  submodelTypes: any[],
  selectedsubmodelType: number,
  substitutedStyle: string,
  isSubstituted: number,
  substitutedOf: number,

}

export interface subModelDetail {
  name: string,
  id: number,
  nameSpace: string,
  modelType: string,
  modelTypeId: number,
  modelDetailId: number,
  leftValue: number,
  rightvalue: number,
  securityAsset: any;
  assetClass: any;
  children: any;
}

export interface IModelDetailSave {
  name: string,
  modelDetailId: number,
  targetPercent: number,
  lowerModelTolerancePercent: number,
  upperModelTolerancePercent: number,
  toleranceTypeValue: number,
  lowerModelToleranceAmount: number,
  upperModelToleranceAmount: number,
  lowerTradeTolerancePercent: number,
  upperTradeTolerancePercent: number,
  rank: number,
  isEdited: number,
  isSubstituted: boolean,
  substitutedOf: number,
  children: IModelDetailChildernSave[]

}

export interface IModelStructureSaveUpdate {
  substitutedModelId: number;
  substitutedFor: number;
  modelDetail: IModelDetailSave;
  isSleeved: boolean;
}

export interface IModelDetailChildernSave {
  id: number,
  name: string,
  modelDetailId: number,
  modelTypeId: number,
  targetPercent: number,
  lowerModelTolerancePercent: number,
  upperModelTolerancePercent: number,
  toleranceTypeValue: number,
  lowerModelToleranceAmount: number,
  upperModelToleranceAmount: number,
  lowerTradeTolerancePercent: number,
  upperTradeTolerancePercent: number,
  rank: number,
  isEdited: number,
  isSubstituted: number,
  substitutedOf: number,
  children: IModelDetailChildernSave[]
}


export interface ICollectionSubModelTypes {
  id: number,
  typeName: string,
  submodelsCollection: any[],
  isDynamic: boolean
}

/** Model template */
export interface IModelTemplate {
  url: string
}