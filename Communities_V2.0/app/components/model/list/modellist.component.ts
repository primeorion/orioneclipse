import { Component, ViewChild, ChangeDetectorRef, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import 'ag-grid-enterprise/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { TokenHelperService } from '../../../core/tokenhelper.service';
import { Response } from '@angular/http';
import { IModelList, IModelTemplate } from '../../../models/model';
import { ModelService } from '../../../services/model.service';
import { ITabNav, ModelTabNavComponent } from '../shared/model.tabnav.component';
import { IModelImport } from '../../../viewmodels/modelimport';
import { ModelBreadcrumbComponent } from '../../../shared/breadcrumb/modelbreadcrumb';
import { ISavedView, IExitWarning, SavedViewComponent } from '../../../shared/savedviews/savedview.component';
import { ICommunityUser } from '../../../models/community.user';

@Component({
    selector: 'community-view-model',
    templateUrl: './app/components/model/list/modellist.component.html'
})

export class ModelListComponent extends BaseComponent {
    allModelData: any;
    gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private selectedModel: number[] = [];
    private displayConfirm: boolean;
    private displayImportModel: boolean;
    private confirmType: string = 'DELETE';
    private tabsModel: ITabNav;
    private savedView: ISavedView = <ISavedView>{};
    setFilter: boolean = false;
    private modelTemplateUrl: any;
    private file: IModelImport = <IModelImport>{};
    private modelErrors: boolean;
    private checkUploadFile: boolean = true;
    private errorLog: any;
    private fileUploadError: string;
    private showFiletUploadError: boolean = false;
    private disableUploadBtn: boolean = true;
    private loggedInUserId: number;
    private checkDragFile: boolean = false;
    private dragFileName: string;
    private isStrategistUser : boolean;
    private showCloseBtn : boolean = false;

    /** Set grid context params  */
    gridContext = {
        isGridModified: false
    }
    @ViewChild(SavedViewComponent) savedViewComponent: SavedViewComponent;

    constructor(private _modelService: ModelService, private _router: Router) {
        super();
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.gridOptions = <GridOptions>{
            enableColResize: true
        }
        this.createColumnDefs();
        this.savedView = <ISavedView>{
            parentColumnDefs: this.columnDefs,
            parentGridOptions: this.gridOptions,
            exitWarning: <IExitWarning>{}
        };
        this.isStrategistUser = (this.roleTypeId == RoleType.StrategistUser);
    }

    ngOnInit() {
        let user = this._tokenHelper.getUser<ICommunityUser>();
        if (user != null) {
            this.loggedInUserId = user.id;
        }
        this.getAllModelsInfo()
        //this.createColumnDefs();
    }

    private getAllModelsInfo() {
        this._modelService.getModelList()
            .map((response: Response) => <IModelList>response.json())
            .subscribe(model => {
                this.allModelData = model;
                this.gridOptions.api.collapseAll();
                this.setFilter = true;
            })
    }

    private createColumnDefs() {
        let self = this;
        this.columnDefs = [
            <ColDef>{ headerName: "Model ID", headerTooltip: 'Model ID', field: 'id' },
            <ColDef>{ headerName: "Model Name", headerTooltip: 'Model Name', field: 'name' },
            <ColDef>{ headerName: "Style", headerTooltip: 'Style', field: 'style' },
            <ColDef>{ headerName: "Target Risk Lower", headerTooltip: 'Target Risk Lower', cellRenderer : this.percentageCellRenderer, field: 'targetRiskLower' },
            <ColDef>{ headerName: "Target Risk Upper", headerTooltip: 'Target Risk Upper', cellRenderer : this.percentageCellRenderer, field: 'targetRiskUpper' },
            <ColDef>{ headerName: "	Current Risk", headerTooltip: '	Current Risk', cellRenderer : this.percentageCellRenderer, field: 'currentRisk' },
            <ColDef>{ headerName: "Minimum Amount", headerTooltip: 'Minimum Amount', cellRenderer: this.formatCurrencyCellRenderer, field: 'minimumAmount' },
            <ColDef>{ headerName: "Advisor Fee (bps)", headerTooltip: 'Advisor Fee (bps)',cellRenderer: this.formatCurrencyCellRenderer, field: 'advisorFee' },
            <ColDef>{ headerName: "Weighted Avg. Net Expense ", headerTooltip: 'Weighted Avg. Net Expense ', cellRenderer: this.formatCurrencyCellRenderer,field:'weightedAvgNetExpense' },
            <ColDef>{ headerName: "Status", headerTooltip: 'Status', field: 'status',cellRenderer : this.statusCellRenderer },
            <ColDef>{ headerName: "Dynamic?", headerTooltip: 'Dynamic?', field: 'isDynamic', cellRenderer: this.dynamicCellRenderer },
            <ColDef>{ headerName: "Created By", headerTooltip: 'Created By', field: 'createdBy' },
            <ColDef>{
                headerName: "Created On", headerTooltip: 'Created On', field: 'createdOn',
                cellRenderer: this.dateRenderer
            },
            <ColDef>{ headerName: "Edited By", headerTooltip: 'Created By', field: 'editedBy' },
            <ColDef>{
                headerName: "Edited On", headerTooltip: 'Edited On', field: 'editedOn',
                cellRenderer: this.dateRenderer
            }
        ];
    }

    /** Status cell render */
    statusCellRenderer(params) {
        if (params.value == 1)
            params.value = 'Approved';
        else if (params.value == 2)
            params.value = 'Waiting For Approval';
        else if (params.value == 3)
            params.value = 'Not Active';
        return params.value;
    }
    /** dynamic cell render */
    dynamicCellRenderer(params) {
        return params.value == 0 ? 'False' : 'True';
    }

    /* method to display context menu on agGrid */
    private getContextMenuItems(params) {
        let isDisable = function () {
            return (params.node.data.isDeleted == 1);
        }
        /** getting model permissions from session */
        //  let permission = Util.getPermission(PRIV_USERS);
        let result = [];
        result.push({ name: '<hidden id=' + params.node.data.id + '>View Model</hidden>' });
        result.push({ name: '<hidden id=' + params.node.data.id + '>Edit Model</hidden>' });
        result.push({ name: '<hidden id=' + params.node.data.id + '>Manage Marketing</hidden>' });
        result.push({
            name: '<hidden id=' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete Model</hidden>',
            disabled: isDisable(),
        });
        result.push({ name: '<hidden id=' + params.node.data.id + '>Rebalance</hidden>' });
        return result;
    }

    private onRowDoubleClicked($event) {
        this._router.navigate(['/community/model/view', $event.data.id]);
        // this._router.navigate(['/community/model/edit', $event.data.id]);
    }
    /** Currency format */
    formatCurrencyCellRenderer(params) {
        //if (params.data.type == undefined) return null;
        if (params.value != null || params.value != undefined) {
            let currencyFormat = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2
            });
            return currencyFormat.format(params.value);
        }
        return null;
    }
        /** append Percentage */
    percentageCellRenderer(params) {
        if (params.value != null || params.value != undefined) {
            return params.value + '%';
        }
        return null;
    }
    deleteModel() {
        if (this.tabsModel.id > 0) {
            var selectedRows = this.gridOptions.api.getSelectedRows();
            for (var i = 0; i < selectedRows.length; i++) {
                this._modelService.deleteModelById(selectedRows[i].id)
                    .subscribe(model => {
                        this.displayConfirm = false;
                        this.getAllModelsInfo();
                    })
            }
        }
    }

    /*** Used to get Selected model id by row clicking*/
    private onRowClicked($event) {
        this.tabsModel.id = +$event.data.id;
    }
    private onRowSelected(event) {
        let model = this.gridOptions.api.getSelectedRows();
        this.tabsModel.ids = model.map(m => m.id);
    }

    /** * Hostlistner   */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g; //<hidden id="(?<id>[0-9]+)">(.+)';
        if (targetElement.id == "" || !targetElement.outerHTML.match('<hidden id=')) return;
        let matches = targetElement.outerHTML.match(pattern);
        // console.log('targetElement matches: ', matches);
        let [modelId = 0, deleteval = 0] = matches;
        if (targetElement.innerText === "View Model") {
            this._router.navigate(['/community/model/view', modelId]);
        }
        if (targetElement.innerText === "Edit Model") {
            this._router.navigate(['/community/model/edit', modelId]);
        }
        if (targetElement.innerText === "Manage Marketing") {
            if(this.isStrategistUser)
            this._router.navigate(['/community/model/marketing/performance', modelId]);
            else
            this._router.navigate(['/community/model/marketing/commentary', modelId]);
        }
        if (targetElement.innerText === "Rebalance") {
            //this._router.navigate(['/community/model/edit', modelId]);
        }
        if (targetElement.innerText === "Delete Model") {
            if (deleteval == 0) {
                this.displayConfirm = true;
            }
        }
    }

    /** Show delete confirm popup from tabnav component */
    showDeletePopUp(event) {
        this.displayConfirm = true;
    }

    /** Calls on model update */
    private onModelUpdated() {
        // console.log('on model upadte. gridContext: ', this.gridContext);
        if (this.setFilter) {
            this.setFilter = false;
            // console.log('on model upadte. setFilter: ', this.setFilter);
            this.gridOptions.api.setFilterModel(this.savedViewComponent.filterModel);
            this.gridContext.isGridModified = false;
        }
    }
    /** Grid has initialised  */
    onGridReady(params) {
        if (params.api) {
            let contextParams = params.api.context.contextParams.seed;
            this.gridOptions.api.addGlobalListener(function (type, event) {
                if ((type.indexOf('column') >= 0) || (type.indexOf('filterModified') >= 0) || (type.indexOf('sortChanged') >= 0)) {
                    contextParams.gridOptions.context.isGridModified = true;
                }
            });
        }
    }
    /** Model Import Pop-up */
    modelImport() {
        // document.getElementById("model-file")['value'] = "";
        this.showCloseBtn = false;
        this.showFiletUploadError = false;
        this.disableUploadBtn = true;
        this.checkUploadFile = true;
        this.displayImportModel = true;
        this.modelErrors = false;
        this.checkDragFile = false;
        this._modelService.getModelTemplate()
            .map((response: Response) => <IModelTemplate>response.json())
            .subscribe(model => {
                this.modelTemplateUrl = model.url;
            })
    }
    dragFile(event) {
        event.preventDefault();
        event.stopPropagation();

    }
    dropFile(event) {
        if (event.dataTransfer.files.length != 1) {
            this.fileUploadError = 'Only one file can be uploaded at a time.'
            this.showFiletUploadError = true;
        } else {
            this.checkDragFile = true;
            this.dragFileName = event.dataTransfer.files[0].name;
            this.selectedModelFile(event.dataTransfer.files);
        }
        event.preventDefault();
        event.stopPropagation();
    }

    selectedTemplate(event) {
        this.checkDragFile = false;
        this.selectedModelFile(event.target.files);
    }

    selectedModelFile(file) {
        this.disableUploadBtn = false;
        this.showFiletUploadError = false;
        var selectedFile = file[0];
        if (this.isValidExcelFile(selectedFile.type)) {
            this.file.model = selectedFile;
            this.file.name = selectedFile.name;
            this.file.description = "create model";
        }
        else {
            this.fileUploadError = 'Only (* .xls)  file can be uploaded.';
            this.showFiletUploadError = true;
            this.disableUploadBtn = true;
        }
    }
    //save model file to server 
    postFile() {
        if (this.file.name) {
            this._modelService.uploadModelTemplate(this.file)
                .subscribe(data => {
                    this.checkUploadFile = false;
                    this.showCloseBtn = true;
                    this.modelErrors = false;
                },
                error => {
                    this.checkUploadFile = false;
                    this.showCloseBtn = false;
                    this.modelErrors = true;
                    this.errorLog = JSON.parse(error);
                });
        }
    }
    cancelModel() {
        this.displayImportModel = false;
        this.disableUploadBtn = true;
        this.getAllModelsInfo();
    }

}