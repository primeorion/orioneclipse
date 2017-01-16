import { GridOptions, ColDef } from 'ag-grid/main';
import { IExitWarning } from './exitwarning';
export * from './exitwarning';

/**
 * model for saved views
 */
    export interface ISavedView {
    id: number,
    parentGridOptions: GridOptions;
    parentColumnDefs: ColDef[];
    exitWarning: IExitWarning;
}
