export interface ICommunityUser {
    id: number,
    roleId: number,
    roleType: string,
    orionConnectExternalId: number,
    name: string,
    isDeleted: boolean,
    loginUserId: string,
    email: string,
    createdDate: string,
    createdBy: string,
    editedDate: string
    editedBy: string
    eclipseDatabaseId: number,
    eclipseDatabaseName: string
    path: string,
    url: string
}

export interface IUserProfile {
    logo : any,
    name : string
}