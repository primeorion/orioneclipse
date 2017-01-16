import { Component, HostListener} from '@angular/core';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
// import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
// import { Dialog } from 'primeng/components/dialog/dialog';
import * as Util from '../../../../core/functions';
import { ITeamModel } from '../../../../models/team';
import { ModelService } from '../../../../services/model.service';
import { TeamService } from '../../../../services/team.service';

@Component({
    selector: 'eclipse-admin-teammodels',
    templateUrl: './app/components/admin/team/shared/teammodel.component.html',
    //directives: [AgGridNg2, AutoComplete, Dialog],
    providers: [TeamService, ModelService]
})

export class TeamModelsComponent {
    public gridOptions: GridOptions;
    public columnDefs: ColDef[];
    public teamModels: ITeamModel[] = [];
    modelSuggestions: ITeamModel[] = [];
    selectedModel: any;
    private displayConfirm: boolean;
    private selectedModelId: number;
    disableButton: boolean = true;
    action: string = VIEWA;
    //subscription: any;

    /** Contructor */
    constructor(private _teamService: TeamService, private _modelService: ModelService,
       ) {
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        console.log('constructor action: ', this.action);
    }

    // ngOnDestroy() {
    //     this.subscription.unsubscribe();
    //     console.log("model destroyed");
    // }

    /** Team Models initialize method */
    initTeamModels(action: string = VIEWA, teamId: number = 0) {
        this.action = action;
        if (teamId > 0) {
            // reset the column defs based on action (view, add and edit)
            if (this.action == VIEWV) this.createColumnDefs(true);
            this.loadTeamModels(teamId);
        }
    }

    /** default method for on load */
    loadTeamModels(teamId: number) {
        Util.responseToObjects<ITeamModel>(this._teamService.getTeamModels(teamId))
            .subscribe(models => {
                 console.log("model: ", models);
                this.teamModels = models.filter(a => a.isDeleted == 0);
                this.gridOptions.api.sizeColumnsToFit();  
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** create column headers for agGrid */
    private createColumnDefs(resetGrid: boolean = false) {
        this.columnDefs = [
            <ColDef>{ headerName: "Model ID", field: "id", width: 100, cellClass: 'text-center', filter:'number' },
            <ColDef>{ headerName: "Model Name", field: "name", width: 125, cellClass: 'text-center', filter:'text' },
            <ColDef>{ headerName: "Source", field: "source", width: 125, filter:'text' },
         <ColDef>{ headerName: "Added On", field: "createdOn", width: 180, cellRenderer: Util.dateRenderer, cellClass: 'text-center', filter:'text' }
        ];
        if (this.action != VIEWV)
            this.columnDefs.push(<ColDef>{ headerName: "", field: "isDeleted", width: 80, cellRenderer: this.deleteCellRenderer, cellClass: 'text-center', suppressMenu: true });
        if (resetGrid)
            this.gridOptions.api.setColumnDefs(this.columnDefs);
    }

    /** Render delete image in the options column of ag-grid */
    private deleteCellRenderer(params) {
        var result = '<span>';
        if (params.node.data != null)
            result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.id + ' title="Delete"></i>';
        return result + '</span>';
    }

    /** method to display context menu on agGrid */
    private getContextMenuItems(params) {
        var result = [
            { name: 'View details' },
            { name: 'Edit' },
            'separator',
            { name: 'Delete', shortcut: 'Alt + W' }
        ];
        return result;
    }

    /** Hostlistner */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "Delete") {
            this.selectedModelId = +targetElement.id;
            this.displayConfirm = true;
        }
    }

    /** Delete and make dialog to close */
    deleteModel() {
        this.RemoveRecord(this.selectedModelId)
        this.displayConfirm = false;
    }

    /** Removes the record from grid after confirming */
    private RemoveRecord(modelId) {
        // one index splice
        this.gridOptions.rowData.splice(this.gridOptions.rowData.findIndex(x => x.id == modelId), 1);
        // overwrite row data
        this.gridOptions.api.setRowData(this.gridOptions.rowData);
    }

    /** AutoComplete Search by ModelName */
    autoModelSearch(event) {
        Util.responseToObjects<ITeamModel>(this._modelService.getModelSearch(event.query))
            .subscribe(model => {
                let teamModelIds = this.teamModels.map(m => m.id);
                this.modelSuggestions = model.filter(m => teamModelIds.indexOf(m.id) < 0);
                // this.teamModels.forEach(element => {
                //     this.modelSuggestions = this.modelSuggestions.filter(record => record.id != element.id);
                // });
            });
    }

    /** Enable add button only after selection of Model from auto search */
    selectModel(item) {
        this.disableButton = (typeof (item) == 'string');
    }

    /** To add selected model to grid */
    addModel(item) {
        if (item != undefined) {
            item.createdOn = new Date();
            this.teamModels.push(item);
            this.gridOptions.api.setRowData(this.teamModels);
            this.selectedModel = undefined;
            this.disableButton = true;
        }
    }
}
