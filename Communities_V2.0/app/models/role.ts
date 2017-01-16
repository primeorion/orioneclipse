import {IRolePrivilege} from './roleprivileges'

/* Defines the role entity */
export interface IRoleVm {
    roles: IRole[]
}

/* Defines the role entity */
export interface IRole {
    id: number,
    name: string,
    roleType: string,
    roleTypeId: number,
    createdOn: Date,
    noofUsers: number,
    editedOn: Date,
    startDate: string,
    expireDate: string,
    status: number,
    isDeleted: boolean,
    privileges: IRolePrivilege[];
}

/* Defines the role type entity */
export interface IRoleType {
    id: number,
    roleType: string,
    bitValue: number
}
