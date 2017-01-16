/* Defines the Privilege entity */
export interface IPrivilege {
    id: number,
    name: string,
    code: string,
    type: number,
    userLevel: number,
    category: string,
    isDeleted: boolean
}
