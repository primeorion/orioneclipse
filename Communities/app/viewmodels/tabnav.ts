/**
 * model for tabs navigation horizontal menu
 */
export interface ITabNav {
    id: number;
    /** L: List, A: Add, E: Edit, V: View */
    action: string,
    canRead: boolean,
    canAdd: boolean,
    canUpdate: boolean,
    canDelete: boolean
}
