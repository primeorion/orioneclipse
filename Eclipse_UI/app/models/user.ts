import {IRole} from './role';
import {ITeam} from './team'

/* Defines the team entity */
export interface IUser {
    // userId: string,
    // userName: string,
    // roles: IRole[],
    // createdOn: Date,
    // team: string,
    // status: boolean
    orionUserId: number,
    userLoginId: string,
    userName: string,
    status: number,
    createdOn: Date,
    isDeleted: number,
    role: IRole,
    teams: ITeam[],
    firmId: number,
    firmName: string,
    startDate: Date,
    expireDate: Date,
    id: number,
    name: string,
    email: string
}

export interface IOrionUser {
    userName: string,
    loginUserId: string,
    userId: number,
    userDetailId: number,
    selected: number,
    userGuid: string,
    entity: number,
    entityId: number,
    entityName: string
}

/* Defines the user entity */
export interface ICustomUser {
    // userId: number,
    id: number,
    orionUserId: number,
    userLoginId: string,
    // firstName: string,
    // lastName: string,
    name: string,
    //email: string,
    roleId: number,
    teamIds: any[],
    status: number
    startDate: string,
    expireDate: string
}
