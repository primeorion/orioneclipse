/** Create New Model */

export interface IModelCreate {
    id: number,
    name: string,
    displayName: string
}

export interface ISubModels{
    id: number,
    name: string,
    modelType: string,
    modelTypeId: number,
    securityAssetType: ISecurityAssetType
}

export interface ISecurityAssetType{
    assetTypeId: number,
    assetTypeName: string,
    assetName: string,
    color: string
}