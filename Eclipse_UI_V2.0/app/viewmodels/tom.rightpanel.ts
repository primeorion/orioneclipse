import { IModelTolerance } from '../models/tom';
import { GridOptions, ColDef } from 'ag-grid/main';

/**
 * model for tabs navigation horizontal menu
 */
export interface ITabGrid {
    gridOptions: GridOptions;
    columnDefs: ColDef[];
    gridRowData: IModelTolerance[];
    orderSecurities: IModelTolerance[];
    orderSubClasses: IModelTolerance[];
    orderClasses: IModelTolerance[];
    orderCategories: IModelTolerance[];
}
