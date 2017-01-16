/* Defines the team entity */
export interface IUser {
     userId: number,
    userName: string,
    status: number,
    createdOn: Date,
    isDeleted: number,
    roleType: number,
    roleStatus: string,
    //role: IRole,
    //teams: ITeam[],
    firmId: number,
    firmName: string,
    startDate: Date,
    expireDate: Date,
    id: number,
    name:string,
    email:string
}
