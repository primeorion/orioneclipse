/**
 * model for tabs navigation horizontal menu
 */
export interface ITabNav {
    id: number,
    ids: number[],
    type: string,
    typeId: number,
     count:number,
    /** L: List, A: Add, E: Edit, V: View */
    action: string,
    route: string,
    canRead: boolean,
    canAdd: boolean,
    canUpdate: boolean,
    canDelete: boolean
}