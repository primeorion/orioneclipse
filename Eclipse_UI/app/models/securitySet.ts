import {ISecurity} from './security'

export interface ISecuritySet{
    id: number,
    name: string,
    description: string,
    createdOn: Date,
    createdBy: number,
    editedOn: Date,
    editedBy: number,
    isDeleted: number,
    isDynamic: number,
    isModelAssigned: number,
    toleranceType: string,
    toleranceTypeValue: number,
    securities: ISecurity[]
}