/** Defines the entity for add view */
export interface IView {
    name: string,
    viewTypeId: number,
    isPublic: boolean,
    isDefault: boolean,
    filter: string,
    gridColumnDefs: any
}

/** Defines the entity for view list */
export interface IViews {
    id: number,
    name: string,
    viewType: string,
    viewTypeId: number,
    isDefault: number,
    isPublic: number,
    filter: string,
    gridColumnDefs: IColDef[],
    createdBy: number,
    createdOn: Date,
    editedBy: number,
    editedOn: Date
}

export interface IColDef {
    id: string,
    name: string,
    field: string,
    width: number,
    visible: boolean,
    sortOrder: string,
    filter: any,
    isSorted: boolean,
    isFilterActive: boolean,
    isColumnResized: boolean
}

/** Defines the entity for update view */
export interface IUpdateView {
    id: number,
    name: string,
    viewTypeId: number,
    isPublic: boolean,
    isDefault: boolean,
    filter: string,
    gridColumnDefs: any
}
