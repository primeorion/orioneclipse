
import { IModelElement } from './modelElement'

/* Defines the Model entity */
export interface IModelDetail {
    id: number,
    name: string,
    isDeleted: number,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number,
    ownerUserId: number,
    dynamicModel: number,
    modelElements: IModelElement[],
    modelDetail : IModelDetail,
    children: IModelElement[]   
}