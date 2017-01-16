/* Defines the IRole Previlege entity */
export interface IRolePrivilege {
    id: number,
    name: string,
    code: string,
    type: number,
    category: string,
    roletype: number,
    canAdd: boolean,
    canRead: boolean,
    canUpdate: boolean,
    canDelete: boolean,
}

export interface ICategoryPrivilege {
    category: string,
    privileges: IRolePrivilege[],
    records: IRolePrivilege[],
    functions: IRolePrivilege[],
    type: number
}
