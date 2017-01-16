import { Component, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions, ColDef} from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { TeamService } from '../../../services/team.service';
import { BaseComponent } from '../../../core/base.component';
import {  ITeamModel } from '../../../models/team';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Dialog } from 'primeng/components/dialog/dialog';
import { Button } from 'primeng/components/button/button';
import { ModelService } from '../../../services/model.service';

@Component({
    selector: 'eclipse-admin-teammodel',
    templateUrl: './app/components/admin/team/teammodel.component.html',
    directives: [AgGridNg2, AutoComplete, Button, Dialog],
    providers: [TeamService, ModelService]
})

export class TeamModelComponent1 extends BaseComponent {

    public gridModelOptions: GridOptions;
    private showModelGrid: boolean;
    public teamModel: ITeamModel[] = [];
    public columnModelDefs: ColDef[];

    selectedmodel: any;
    FilteredModelresults: ITeamModel[] = [];
    errorMessage: string;
    private displayConfirm: boolean;
    private selectedmodeltoDelete: number;
    private teamId: number;
    btnDisableModel: boolean = true;
    isViewModel: boolean = false;

    /**
    * Contructor
    */
    constructor(private _router: Router, private _teamService: TeamService, private _modelService: ModelService) {
        super();
        this.gridModelOptions = <GridOptions>{};
        this.showModelGrid = true;
        this.createColumnDefs();
        this.FilteredModelresults = [];
    }

    // ngOnInit() {
    //     this.onLoad();
    // }

    /** To load team models details on add */
    loadAddMode() {
        this.resetForm();
    }

    /** To load team this.selectedTeamId details on edit */
    loadEditMode(teamId: number) {
        this.teamId = teamId;
        this.onTeamModelsLoad(this.teamId);
    }

    /** To rest form */
    resetForm() {
        this.teamModel = [];
    }

    /** * default method for on load */
    onTeamModelsLoad(teamId: number) {
        this.errorMessage = '';
        //this.teamModel = this._teamService.getTeamModelData();
        this.ResponseToObjects<ITeamModel>(this._teamService.getTeamModels(teamId))
            .subscribe(model => {
                this.teamModel = model.filter(a => a.isDeleted == 0);
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }


    /** * create column headers for agGrid */
    private createColumnDefs() {
        this.columnModelDefs = [
            <ColDef>{ headerName: "Model ID", field: "id", width: 100, cellClass: 'text-center' },
            <ColDef>{ headerName: "Model Name", field: "name", width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Source", field: "source", width: 125 },
            <ColDef>{ headerName: "Added On", field: "createdOn", width: 180, cellRenderer: this.dateRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "", field: "delete", width: 80, cellRenderer: this.deleteCellRenderer, cellClass: 'text-center ' },
        ];
    }

    /** function to render cross image in the options column of ag-grid*/
    private deleteCellRenderer(params) {
        var result = '<span>';
        if (params.node.data != null)
            result += '<i class="fa fa-times red" aria-hidden="true" id =' + params.node.data.id + ' title="Delete"></i>';
        return result;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        if (targetElement.title === "Delete") {
            this.displayConfirm = true;
            this.selectedmodeltoDelete = targetElement.id;
        }
    }

    /** * method to display context menu on agGrid  */
    private getContextMenuItems(params) {
        var result = [
            {
                name: 'View Details ',
            },
            {
                name: 'Edit',
            },
            'separator',
            {
                name: 'Delete',
                shortcut: 'Alt + W',
            }
        ];
        return result;
    }

    /** function to pass record index value to delete and make dialog to close  */
    deleterModel() {
        this.RemoveRecord(this.selectedmodeltoDelete)
        this.displayConfirm = false;
    }

    /*** function removes the record from grid after confirming */
    private RemoveRecord(indexval) {
        // one index splice
        this.gridModelOptions.rowData.splice(this.gridModelOptions.rowData.findIndex(x => x.id == indexval), 1);
        // overwrite row data
        this.gridModelOptions.api.setRowData(this.gridModelOptions.rowData);
    }

    /* AutoComplete Search by ModelName */
    autoModelSearch(event) {
        this.ResponseToObjects<ITeamModel>(this._modelService.getModelSearch(event.query))
            .subscribe(model => {
                this.FilteredModelresults = model;
                this.teamModel.forEach(element => {
                    this.FilteredModelresults = this.FilteredModelresults.filter(record => record.id != element.id);
                });
            },
            error => {
                console.log(this.errorMessage);
                throw error;
            });
    }

    /** To add selected model to grid */
    addModel(item) {
        if (item != undefined || item != "") {
            item.createdOn = new Date();
            this.teamModel.push(item);
            this.gridModelOptions.api.setRowData(this.teamModel);
            this.selectedmodel = undefined;
            this.btnDisableModel = true;
        }
    }

    /**Enable add button only after selection of Model from auto search */
    handleselectedModel(modelitem) {
        if (modelitem.name) {
            this.btnDisableModel = false;
        }
        else
            this.btnDisableModel = true;
    }
}
