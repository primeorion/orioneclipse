import { Component, Input, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Dialog } from 'primeng/components/dialog/dialog';
import * as Util from '../../../core/functions';
import { BaseComponent } from '../../../core/base.component';
import { ITabNav, ModelTabNavComponent } from '../shared/model.tabnav.component';
import { ModelService } from '../../../services/model.service';
import { ISavedView, IExitWarning, SavedViewComponent } from '../../../shared/savedviews/savedview.component';

/** Models import section */
import { IModel, IModelTemplate, IModelAdd } from '../../../models/modeling/model';
import { IModelStatus } from '../../../models/modeling/modelstatus';
import { IModelFilterTypes } from '../../../models/modeling/modelfiltertypes';
import { IModelingViewModel } from '../../../models/modeling/modelingviewmodel';
import { IDeleteModelStatus } from '../../../models/modeling/deletemodel';
import { IModelExcelImport } from '../../../models/modeling/modelexcelimport';
import { ICopyModel } from '../../../models/modeling/copymodel';
import { ModelGroupChart } from '../../../services/modelgroupchart.service';
import { SessionHelper } from '../../../core/session.helper';
import { IRole } from '../../../models/role';
@Component({
    selector: 'eclipse-model-list',
    templateUrl: './app/components/model/list/list.component.html',
    providers: [ModelService]
})
export class ModelListComponent extends BaseComponent {
    /************* CLASS VARIABLES and declarations *******/
    private tabsModel: ITabNav;
    private savedView: ISavedView = <ISavedView>{};
    private modelGridOptions: GridOptions;
    private modelrowData: any[] = [];
    private modelColumnDefs: ColDef[];
    private models: IModel[] = [];
    private modelSuggestions: any[] = []

    modelList: any[] = [];
    alteredModels: IModelingViewModel[] = [];
    modelFilterTypes: IModelFilterTypes[] = [];

    /*********** NUMBER VARIABLES *******/
    modelIds: number;
    modelTypeId: number;
    deletedModelsCount: number = 0;
    unDeletedModelsCount: number = 0;
    selectedModelsCount: number = 0;
    selectedRadioVal: number;

    /************ BOOLEAN VARIABLES *******/
    showAssignPopup: boolean;
    deleteCheck: boolean;
    displayConfirm: boolean;
    selectedModelId: number;
    assignModel: boolean;
    setFilter: boolean = false;
    deleteMessage: boolean = false;
    displayModelCompareSec: boolean = false;
    displayMessageSec: boolean = false;
    copyErrorMessage: boolean = false;
    areErrors: boolean = false;
    isError: boolean = false;

    /*********** STRING VARIABLES *******/
    rowType: string;
    modelApproveOrReject: string;
    errorMessage: string;
    copyErrorMessageContent: string;

    /******** Set grid context params *******/
    gridContext = {
        isGridModified: false,
        modelId: 0,
        isNone: false
    }

    /******* VARIABLES : MODEL IMPORT *******/
    private modelTemplateUrl: any;
    file: IModelExcelImport = <IModelExcelImport>{};
    private errorLog: any[];
    private modelErrors: boolean;
    private checkUploadFile: boolean = true;
    private displayImportModel: boolean;
    private showFiletUploadError: boolean = false;
    private disableUploadBtn: boolean = true;
    private checkDragFile: boolean = false;
    private showCloseBtn: boolean = false;
    private loggedInUserId: number;
    private dragFileName: string;
    private fileUploadError: string;

    /******* VARIABLES : COPY MODEL *******/
    dispCopyModel: boolean;
    infoPopup: boolean;
    copiedModelName: string;
    selectedModelName: string;

    /******* VARIABLES : MODEL IMPORT PLOTTINGS */
    public count = 0;
    public formattedData = [];
    public formattedData2 = [];
    public Level = 1;
    public levelValue: number;
    public modelchart: any;

    /******* VARIABLES : MODEL REBALANCE ******/
    rebalanceMessage: boolean = false;
    rebalanceCheck: boolean = false;
    rebalanceApprovedWarning: boolean = false;
    confirmSingleModelRebal: boolean = false;

    unRebalancedModelsCount: number = 0;
    rebalancedModelsCount: number = 0;
    eligibleRebalModelsCount: number = 0;
    nonEligibleRebalModelsCount: number = 0;
    eligibleRebalModelsArray: number[] = [];

    @ViewChild(SavedViewComponent) savedViewComponent: SavedViewComponent;

    /******** CONSTRUCTOR  *******/
    constructor(private _router: Router, private _modelService: ModelService, private activateRoute: ActivatedRoute) {
        super(PRIV_MODELS);
        //console.log('role permission:--', this.permission)
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.modelGridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.savedView = <ISavedView>{
            parentColumnDefs: this.modelColumnDefs,
            parentGridOptions: this.modelGridOptions,
            exitWarning: <IExitWarning>{}
        };
        this.modelTypeId = Util.getRouteParam<number>(activateRoute);
        if (this.modelTypeId == undefined)
            this.modelTypeId = 0;
    }

    /** INIT */
    ngOnInit() {
        this.onModelDataLoad();
        this.getModelFilters();
    }

    /** To load models */
    loadModels() {
        this.ResponseToObjects<IModel>(this._modelService.getModels(this.modelTypeId))
            .subscribe(models => {
                this.setModels(models);
                this.models = this.alteredModels;
                // // FILTER FOR NORMAL USER(NOT_ACTIVE)
                let sessionHelper = new SessionHelper();
                let roleType = sessionHelper.get<IRole>('role').roleType;
                this.modelList = (roleType == "FIRM ADMIN") ? this.models : this.models.filter(mdlD => mdlD.currentStatusId != 2);
                this.modelGridOptions.api.collapseAll();
                this.setFilter = true;
            });
    }

    /** To refresh model list grid */
    refreshModelsList() {
        // console.log('this.gridContext.isGridModified refreshModelsList : ', this.gridContext.isGridModified);
        if (this.modelList.length > 0) {
            this.modelGridOptions.api.collapseAll();
            this.setFilter = true;
            if (this.savedViewComponent.model.id == 0) this.gridContext.isNone = true;
            this.modelGridOptions.api.setRowData(this.modelList);
            return;
        }
        this.loadModels();
    }

    /** Default method for on load*/
    onModelDataLoad() {
        this.errorMessage = '';
        this.ResponseToObjects<IModel>(this._modelService.getModels(this.modelTypeId))
            .subscribe(modelingModelsdata => {
                // FILTER FOR NORMAL USER(NOT_ACTIVE)
                let sessionHelper = new SessionHelper();
                let roleType = sessionHelper.get<IRole>('role').roleType;
                this.modelList = (roleType == "FIRM ADMIN") ? this.models : this.models.filter(mdlD => mdlD.currentStatusId != 2);
                this.modelList = modelingModelsdata;
            });
        this.gridContext.isGridModified = false;
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.modelColumnDefs = [
            <ColDef>{ headerName: "Model Compare", field: "view", width: 120, cellRenderer: this.viewCellRenderer, cellClass: 'text-center', suppressMenu: true },
            <ColDef>{ headerName: "Model Name", field: "name", width: 150, filter: 'text' },
            <ColDef>{ headerName: "Model ID", field: "id", width: 120, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Description", field: "description", width: 150, cellClass: 'text', filter: 'text' },
            <ColDef>{
                headerName: "Status", field: "currentStatusId", width: 110,
                cellRenderer: function (params) {
                    let paramvalue = "";
                    let result = "";
                    paramvalue = (params.data.currentStatusId != null) ? params.data.currentStatusId
                        : params.data.statusId;
                    switch (+paramvalue) {
                        case 1:
                            result = "Approved";
                            break
                        case 2:
                            result = "Not Active";
                            break;
                        case 3:
                            result = "Waiting for Approval";
                            break;
                        case 4:
                            result = "Draft";
                            break;
                    }
                    return result;
                },
                cellClass: 'text', filter: 'text'
            },
            <ColDef>{ headerName: "Model Namespace", field: "nameSpace", width: 125, cellClass: 'text', filter: 'text' },
            <ColDef>{ headerName: "Tags", field: "tags", width: 125, cellClass: 'text', filter: 'text' },
            <ColDef>{ headerName: "Owner ID", field: "ownerUserId", width: 110, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Dynamic?", field: "isDynamic", width: 110, cellRenderer: this.booleanCellRenderer, cellClass: 'text' },
            <ColDef>{ headerName: "# Portfolios", field: "portfolioCount", width: 110, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Style", field: "managementStyle", width: 110, cellClass: 'text', filter: 'text' },
            <ColDef>{ headerName: "Community Model", field: "isCommunityModel", width: 150, cellRenderer: this.booleanCellRenderer, cellClass: 'text', filter: 'text' },
            <ColDef>{ headerName: "Approved By", field: "approvedByUserId", width: 125, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Team", field: "teams", width: 110, cellClass: 'text', valueGetter: this.teamNamesValueGetter },
            <ColDef>{ headerName: "Has Substitute?", field: "isSubstitutedForPortfolio", width: 125, cellRenderer: this.booleanCellRenderer, cellClass: 'text', filter: 'text' },
            <ColDef>{ headerName: "Created By", field: "createdBy", width: 125, cellClass: 'text', filter: 'number' },
            <ColDef>{ headerName: "Created On", field: "createdOn", cellRenderer: this.dateRenderer, width: 125, cellClass: 'text', filter: 'text' },
            <ColDef>{ headerName: "Edited By", field: "editedBy", width: 80, cellClass: 'text', filter: 'number' },
            <ColDef>{ headerName: "Edited On", field: "editedOn", width: 130, cellRenderer: this.dateRenderer, cellClass: 'text', filter: 'text' }
        ];
    }

    /************************************** Helper methods-START *************************************/
    /** renders status for row data */
    private statusRenderer(params) {
        return '<span><img src="../app/assets/img/' + (params.value == 1 ? 'green' : 'grey') + '-dot.png"/></span>';
    }

    /** Renders cell based on status and displays Eye icon for compare model */
    private viewCellRenderer(params) {
        var result = '<span>';
        if (params.node.data.status != null) {
            // if (params.node.data.currentStatusId != params.node.data.statusId)
            if (params.node.data.currentStatusId == null) {
                if (params.node.data.statusId == 1 || params.node.data.statusId == 3)
                    result += '<i id =' + params.node.data.id + ' title="View" class="btn-view fa fa-eye" aria-hidden="true"></i></span>';
            }
            else if (params.node.data.currentStatusId != null) {
                if (params.node.data.currentStatusId == 1 || params.node.data.currentStatusId == 3)
                    result += '<i id =' + params.node.data.id + ' title="View" class="btn-view fa fa-eye" aria-hidden="true"></i></span>';
            }
        }
        else
            result += '<i id =' + params.node.data.id + ' </i></span>';
        return result;
    }

    /** Check for isCommunity flag */
    private booleanCellRenderer(params) {
        var result = "";
        if (params.value != null) {
            result = (params.value == 1) ? "Yes" : "No";
        }
        return result;
    }

    /** Renders based on status filter  */
    statusFilterRenderer(params) {
        let filterParam = true;
        var result = '<span>';
        if (params.value == 0)
            result += '<img src="../app/assets/img/grey-dot.png"/>';
        else if (params.value == 1)
            result += '<img src="../app/assets/img/green-dot.png"/>';
        else
            return null;

        if (filterParam && params.value === 1)
            result += '(no records)';
        return result + '</span>';
    }

    /** To render team names */
    teamNamesValueGetter(params) {
        var teamName = '';
        params.data.teams.forEach(element => {
            teamName += element.name;
            teamName += ',';
        });
        return teamName.substring(0, teamName.length - 1);
    }

    /************************************** Helper methods-END************************************ */

    /************************************** SERVICE Calls-START*************************************/
    /** Get model status list */
    getModelFilters() {
        this.ResponseToObjects<IModelFilterTypes>(this._modelService.getModelFilters())
            .subscribe(modelFilterTypes => {
                this.modelFilterTypes = modelFilterTypes;
                // console.log('model Status List : ', this.modelFilterTypes);
            });
    }

    /************************************** SERVICE Calls-END*************************************/

    /************************************** agGrid events-START*************************************/

    /** Event fires on grid row click  */
    onRowClicked(event) {
        if (event.event.target !== undefined) {
            this.selectedModelId = event.data.id;
            this.tabsModel.id = event.data.id;
            this.rowType = event.data.type;
            this.selectedModelName = event.data.name;
        }
    }

    /** Applying styles for grid row */
    getRowStyle(params) {
        if ((params.data.type == "A") && ((params.data.account.account == "100122") || (params.data.account.account == "300125")))
            return { 'color': 'yellow' }
    }

    /** MultiRow selected in Models for Edit preferences */
    private onRowSelected(event) {
        let model = <IModel[]>this.modelGridOptions.api.getSelectedRows();
        if (model.length > 1) {
            this.tabsModel.ids = model.map(m => m.id);
            this.tabsModel.id = undefined;
            this.selectedModelId = undefined;
        }
        else if (model.length == 0) {
            this.tabsModel.id = undefined;
            this.tabsModel.ids = undefined;
            this.selectedModelId = undefined;
        }
        else if (model.length == 1) {
            this.tabsModel.id = model[0].id;
            this.rowType = event.node.data.type;
            this.tabsModel.ids = undefined;
            this.selectedModelId = model[0].id;
        }
    }

    /** Fires on row double click */
    onRowDoubleClicked(event) {
        if (this.permission.canRead)
            this._router.navigate(['/eclipse/model/view', event.data.id]);
        else if (this.permission.canUpdate)
            this._router.navigate(['/eclipse/model/viewstructure', event.data.id]);
    }

    /** Render conditional cell value */
    cellRenderer(params) {
        let column = params.column.colId;
        column = column.indexOf('.') > 0 ? column.split('.')[1] : column;
        if (column == "ag-Grid-AutoColumn") {
            var result = '<span>';
            result += '<input id=' + params.data.id + ' type="checkbox" ></input>';
            return result + ' ' + params.data.name;
        } else {
            if (params.data.type == "A" || params.data.type == undefined)
                return null;
            else
                return params.data[column];
        }
    }

    /** Render conditional status cell value */
    statusCellRenderer(params) {
        let column = params.column.colId;
        column = column.indexOf('.') > 0 ? column.split('.')[1] : column;
        if (params.data.type == undefined)
            return null;
        else if (params.data.type == "P") {
            var result = '<span>';
            if (params.data[column] == "Ok") {
                result += '<i class="material-icons text-success" title="Ok">check_circle</i>';
                return result;
            } else {
                result += '<i class="material-icons text-danger" title="Error">cancel</i>';
                return result;
            }
        } else if (params.data.type == "A") {
            var accResult = '<span>';
            if (params.data.account.status == "OPEN") {
                accResult += '<i class="material-icons text-success" title="Ok">check_circle</i>';
                return accResult;
            } else {
                accResult += '<i class="material-icons text-danger" title="Error">cancel</i>';
                return accResult;
            }
        }
    }

    /** Grid has initialised  */
    onGridReady(params) {
        if (params.api) {
            let contextParams = params.api.context.contextParams.seed;
            this.modelGridOptions.api.addGlobalListener(function (type, event) {
                if ((type.indexOf('column') >= 0) || (type.indexOf('filterModified') >= 0) || (type.indexOf('sortChanged') >= 0)) {
                    //console.log('column event type : ' + type);
                    //console.log('column event : ' + event);
                    if (contextParams.gridOptions.context.isNone) {
                        contextParams.gridOptions.context.isNone = false;
                        contextParams.gridOptions.context.isGridModified = false;
                    }
                    else
                        contextParams.gridOptions.context.isGridModified = true;
                }
            });
        }
    }

    /** Calls on model update */
    private onModelUpdated() {
        //console.log('on model upadte. gridContext: ', this.gridContext);
        if (this.setFilter) {
            this.setFilter = false;
            // console.log('on model upadte. setFilter: ', this.setFilter);
            if (this.savedViewComponent.model.id > 0)
                this.modelGridOptions.api.setFilterModel(this.savedViewComponent.filterModel);
            this.gridContext.isGridModified = false;
        }
    }

    /** To deactivate component  */
    canDeactivate() {
        //console.log('isGridModified from canDeactivate : ', this.modelGridOptions.context.isGridModified);
        if (!this.modelGridOptions.context.isGridModified) return Observable.of(true);
        if (this.savedViewComponent.loggedInUserViewsCount > 0 && this.savedViewComponent.model.id > 0)
            this.savedViewComponent.displayUpdateConfirmDialog = true;
        else
            this.savedView.exitWarning.show = true;
        return new Observable<boolean>((sender: Observer<boolean>) => {
            this.savedView.exitWarning.observer = sender;
        });
    }

    /************************************** agGrid events - END*************************************/

    /************************************** agGrid Helper Methods-START*************************************/

    /** Method to display context menu on agGrid*/
    private getContextMenuItems(params) {
        let contextResult = [];
        let permission = Util.getPermission(PRIV_MODELS);
        let mdlPermission = Util.getPermission(PRIV_APPROVEMODELASS);
        //console.log('Context menu- Permissions', permission)
        let selectedRows = params.api.getSelectedRows();
        if (selectedRows.length > 1) {
            if (permission.canUpdate)
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit preferences</hidden>' });
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Rebalance</hidden>' });
            if (permission.canDelete)
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Delete</hidden>' });
        }
        else if (selectedRows.length == 1) {
            if (permission.canRead)
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Model</hidden>' });
            /** STUB for context menu display options */
            if (!selectedRows[0].isCommunityModel) {
                if (permission.canUpdate) {
                    if (!selectedRows[0].isCommunityModel)
                        contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit Model</hidden>' });
                }
                if (selectedRows[0].status != "Not Active")
                    contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Copy</hidden>' });
            }
            if (selectedRows[0].status == "Approved")
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Rebalance</hidden>' });
            if (permission.canDelete) {
                contextResult.push({
                    name: '<hidden id=' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete</hidden>',
                    disabled: (params.node.data.isDeleted == 1 || params.node.data.sleevePortfolio == 1),
                });
            }
            if (selectedRows[0].status != "Not Active")
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit preferences</hidden>' });
        }
        return contextResult;
    }

    /************************************** agGrid Helper Methods-END*************************************/

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if ((targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|i) id='))) return;
        let matches = targetElement.outerHTML.match(pattern);
        let [id = 0, val = 0] = matches;
        if (targetElement.innerText === "View Model") {
            this._router.navigate(['/eclipse/model/view', id]);
        }
        else if (targetElement.innerText === "Edit Model") {
            /** CUSTOMIZE */
            let currentModel = this.modelList.find(mdl => mdl.id == id);
            let cs = (currentModel.currentStatusId != null) ? ((currentModel.currentStatusId == 1) ? "approved" : "pending") : ((currentModel.statusId != 1) ? "pending" : "approved");
            this._router.navigate(['/eclipse/model/edit', id, cs]);
        }
        else if (targetElement.innerText === "Delete")
            this.deleteConfirm(id);
        else if (targetElement.innerText == "Edit preferences") {
            if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1) {
                let eligiblePrefRecords = [];
                this.tabsModel.ids.forEach(modelId => {
                    let elRec = this.modelList.find(mId => mId.id == modelId &&
                        mId.status != 'Not Active');
                    if (elRec != undefined)
                        eligiblePrefRecords.push(elRec);
                })
                this._router.navigate(['/eclipse/admin/preferences/model', eligiblePrefRecords.map(m => m.id).join()]);
            }
            else
                this._router.navigate(['/eclipse/admin/preferences/model', id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
        }
        else if (targetElement.title == "View")
            this.showModelCompare(id);
        else if (targetElement.innerText === "Copy")
            this.dispCopyModel = true;
        else if (targetElement.innerText === "Rebalance") {
            this.handleRebalance();
        }
        this.gridContext.modelId = id;
    }

    /** Preparing model list with empty account array */
    setModels(models: IModel[]) {
        this.alteredModels = [];
        models.forEach(element => {
            var modeling = {
                id: 0,
                name: '',
                portfolios: null,
                portfolioCount: 0,
                modelAUM: 0,
                source: '',
                statusId: 0,
                currentStatusId: 0,
                status: '',
                nameSpace: '',
                tags: '',
                isDynamic: false,
                isSubstitutedForPortfolio: false,
                description: '',
                ownerUserId: 0,
                ownerUser: '',
                managementStyleId: 0,
                managementStyle: '',
                isCommunityModel: false,
                comunityModelId: 0,
                lastSyncDate: new Date(),
                approvedByUserId: 0,
                approvedByUser: '',
                isDeleted: false,
                createdOn: new Date(),
                createdBy: 0,
                editedOn: new Date(),
                editedBy: 0,
                teams: null,
                modelDetail: null
            }
            modeling.id = element.id;
            modeling.name = element.name;
            modeling.portfolios = element.name;
            modeling.portfolioCount = element.portfolioCount;
            modeling.modelAUM = element.modelAUM;
            modeling.source = element.source;
            modeling.statusId = element.statusId;
            modeling.currentStatusId = element.currentStatusId;
            modeling.status = element.status;
            modeling.nameSpace = element.nameSpace;
            modeling.tags = element.tags;
            modeling.isDynamic = element.isDynamic;
            modeling.isSubstitutedForPortfolio = element.isSubstitutedForPortfolio;
            modeling.description = element.description;
            modeling.ownerUserId = element.ownerUserId;
            modeling.ownerUser = element.ownerUser;
            modeling.managementStyleId = element.managementStyleId;
            modeling.managementStyle = element.managementStyle;
            modeling.isCommunityModel = element.isCommunityModel;
            modeling.comunityModelId = element.comunityModelId;
            modeling.lastSyncDate = element.lastSyncDate;
            modeling.approvedByUserId = element.approvedByUserId;
            modeling.approvedByUser = element.approvedByUser;
            modeling.isDeleted = element.isDeleted;
            modeling.createdOn = element.createdOn;
            modeling.teams = element.teams;
            modeling.createdBy = element.createdBy;
            modeling.editedOn = element.editedOn;
            modeling.editedBy = element.editedBy;
            modeling.modelDetail = element.modelDetail;
            this.alteredModels.push(modeling);
        });
    }

    /** Fires on filter change */
    onFilterChange(filter) {
        this._router.navigate(['/eclipse/model/filter', filter.target.value]);
    }

    navigateToTrades(value) {
        if (+value == 0) {
            this._router.navigate(['/eclipse/tradeorder/globaltrades', "model", this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
        }
        if (+value == 1) {
            this._router.navigate(['/eclipse/tradeorder/tickerswap', "model", this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
        }
        if (+value == 2) {
            this._router.navigate(['/eclipse/tradeorder/tradetotarget', "model", this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
        }
    }
    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case undefined:
                break;
            case "Import":
                this.modelImport();
                return;
            case "Copy":
                // this.showModelCompare(this.selectedModelId);
                this.dispCopyModel = true;
                break;
            case "View Model":
                this._router.navigate(['/eclipse/model/view', this.selectedModelId]);
                break;
            case "Rebalance":
                this.handleRebalance();
                break;
            case "Delete":
                this.deleteConfirm(this.selectedModelId);
                break;
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/model', this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')])
                break;
            default:
        }
        return;
    }

    /************************************* MODEL DELETE START***********************************/

    /** Delete check based on models length */
    private deleteConfirm(modelId: number) {
        if (this.tabsModel.id != undefined) {
            if (modelId == undefined) return;
            this._modelService.canDeleteModel(modelId)
                .map((res: Response) => <IDeleteModelStatus>res.json())
                .subscribe(possibleDeletedModels => {
                    this.selectedModelId = modelId;
                    this.displayConfirm = true;
                },
                error => {
                    this.deleteCheck = true;
                });
        }
        else
            this.displayConfirm = true;
    }

    /** Delete Model based on ID Checks for any portfolios associated */
    deleteModel() {
        this.unDeletedModelsCount = 0;
        this.deletedModelsCount = 0;
        if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1) {
            this.selectedModelsCount = this.tabsModel.ids.length;
            this.tabsModel.ids.forEach(modelId => {
                Util.responseToObject<any>(this._modelService.deleteModel(modelId))
                    .subscribe(response => {
                        this.displayConfirm = false;
                        this.deletedModelsCount += 1;
                        // console.log('deleted model count : ', this.deletedModelsCount);
                        this.refreshOnDelete();
                    },
                    error => {
                        this.unDeletedModelsCount += 1;
                        // console.log('undeleted model count : ', this.unDeletedModelsCount);
                        this.refreshOnDelete();
                    });
            });
            this.selectedModelId = undefined;
            this.deleteMessage = true;
        }
        else {
            Util.responseToObject<any>(this._modelService.deleteModel(this.selectedModelId))
                .subscribe(response => {
                    this.selectedModelId = undefined;
                    this.displayConfirm = false;
                    this.loadModels();
                });
        }
    }

    /** To call load models on delete */
    refreshOnDelete() {
        if (this.selectedModelsCount == this.deletedModelsCount + this.unDeletedModelsCount)
            this.loadModels();
    }

    /************************************* MODEL DELETE END ***********************************/



    /************************************ MODEL IMPORT SECTION - START *******************************/
    /** Model Import Pop-up */
    modelImport() {
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

    /** 
     * DRAG N DROP SECTION 
     **/

    /** Fires when file is dragged */
    dragFile(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /** Fires when file is dropped */
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

    /** Fires when template is selected  */
    selectedTemplate(event) {
        this.checkDragFile = false;
        this.selectedModelFile(event.target.files);
    }

    /** when specific file is selected */
    selectedModelFile(file) {
        this.disableUploadBtn = false;
        this.showFiletUploadError = false;
        var selectedFile = file[0];
        if (this.isValidExcelFile(selectedFile.type)) {
            this.file.file = selectedFile;
            this.file.name = selectedFile.name;
        }
        else {
            this.fileUploadError = 'Only (* .xls)  file can be uploaded.';
            this.showFiletUploadError = true;
            this.disableUploadBtn = true;
        }
    }

    /** upload template file to server */
    uploadtemplate() {
        if (this.file) {
            this._modelService.uploadModelTemplate(this.file)
                .subscribe(data => {
                    this.onModelDataLoad();
                    this.checkUploadFile = false;
                    this.showCloseBtn = true;
                    this.modelErrors = false;
                },
                error => {
                    this.checkUploadFile = false;
                    this.showCloseBtn = false;
                    this.modelErrors = true;
                    let isjSnArray = this.isArray(JSON.parse(error).message);
                    if (isjSnArray) {
                        this.areErrors = true;
                        this.isError = false;
                    }
                    else {
                        this.isError = true;
                        this.areErrors = false;
                    }
                    this.errorLog = JSON.parse(error).message;
                });
        }
    }

    /** Check whether json object is array or not */
    isArray(what) {
        return Object.prototype.toString.call(what) === '[object Array]';
    }

    /** Fires when cancel is clicked */
    cancelImport() {
        this.displayImportModel = false;
        this.disableUploadBtn = true;
    }

    /************************************ MODEL IMPORT SECTION - END *******************************/

    /************************************** Model - COPY - START*************************************/

    copyModelInfo() {
        let model = <IModel>this.modelList.find(mId => mId.id == this.selectedModelId);
        let that = this;
        if (that.copiedModelName != undefined) {
            if (model.name.toLowerCase() != that.copiedModelName.toLowerCase()) {
                that.ResponseToObjects<any[]>(that._modelService.validateModelNamespace(model.name, model.nameSpace))
                    .subscribe(scModel => {
                        // let namespace = (model.nameSpace) ? model.nameSpace : that.modelInfo.modelDetail.nameSpace;
                        let modelCopy = <ICopyModel>{
                            name: that.copiedModelName,
                            nameSpace: model.nameSpace
                        }
                        that._modelService.copyModel(that.selectedModelId, modelCopy)
                            .map((response: Response) => <any>response.json())
                            .subscribe(model => {
                                that.copiedModelName = "";
                                that.dispCopyModel = false;
                                this.onModelDataLoad();
                            },
                            error => {
                                console.log(error);
                                that.copiedModelName = "";
                                that.dispCopyModel = false;
                                console.log(error.message);
                                $(".info_popup").html(error.message);
                                that.infoPopup = true;
                            })
                    },
                    error => {
                        // console.log("error");
                        that.copiedModelName = "";
                        that.dispCopyModel = false;
                        $(".info_popup").html("NameSpace + Name should be unique across the Namespace");
                        that.infoPopup = true;
                    })

            }
            else {
                that.copiedModelName = "";
                that.dispCopyModel = false;
                $(".info_popup").html("Name should not be same for both copied and original Model");
                that.infoPopup = true;
            }
        }
    }

    /* Fires when user clicked on cancel button */
    closeInfoPopUp() {
        this.infoPopup = false;
        this.dispCopyModel = false;
    }

    /**************************************Model - COPY - END*************************************/

    /** Get model details by model Id */
    getModelDetailsById(modelId: number, status: string, currentModelstatus: string) {
        let that = this;
        this.responseToObject<IModel>(this._modelService.getModelDetail(modelId))
            .subscribe(modelDetails => {
                // that.plotChartBasedOnCompareData(modelDetails, status, currentModelstatus);
            });
    }

    /** Get pending model details if the model status is Pending/Waiting for Approval */
    getPendingModelDetail(modelId: number, status: string, currentModelstatus: string) {
        let that = this;
        this.responseToObject<IModel>(this._modelService.getPendingModelDetail(modelId))
            .subscribe(modelDetails => {

            });
    }

    /************************************** Model - Rebalance START ****************************************/


    /** Handles Rebalance based on selected Model/s */
    handleRebalance() {
        let eligibleApprRecords: any[] = [];
        if (this.tabsModel.ids != undefined && this.tabsModel.ids.length >= 1) {
            this.tabsModel.ids.forEach(modelId => {
                let elApprRec = this.modelList.find(mId => mId.id == modelId && mId.status == 'Approved');
                if (elApprRec != undefined)
                    eligibleApprRecords.push(elApprRec);
            })
            this.confirmRebalance(eligibleApprRecords);
        }
        else {
            let selectedRec = this.modelList.find(mId => mId.id == this.tabsModel.id && mId.status == 'Approved');
            if (selectedRec != undefined) {
                eligibleApprRecords.push(selectedRec);
                this.rebalanceAModelConfirm(eligibleApprRecords);
            }
            else {
                /** Show warning to the user if Approved model isn't selected */
                this.rebalanceApprovedWarning = true;
            }
        }
    }

    /** Rebalance Model based on ID Checks for any portfolios associated */
    rebalanceModel() {
        this._modelService.rebalanceModel(this.eligibleRebalModelsArray)
            .map((res: Response) => <any>res.json())
            .subscribe(possibleRebalancedModels => {
                /** this.showProgress(); */
                this.rebalanceMessage = false;
                this.confirmSingleModelRebal = false;
                this.refreshOnRebalance();
            },
            error => {
                this.rebalanceCheck = true;
                this.refreshOnRebalance();
            });
    }

    /** Rebalances single selected Model */
    rebalanceAModelConfirm(eligibleApprovedRecords: IModel[]) {
        this.eligibleRebalModelsArray = [];
        Util.responseToObject<any>(this._modelService.canRebalanceModel(eligibleApprovedRecords[0].id))
            .subscribe(response => {
                this.confirmSingleModelRebal = true;
                this.eligibleRebalModelsArray.push[eligibleApprovedRecords[0].id];
                //console.log('rebalanced model count : ', this.eligibleRebalModelsCount);
            },
            error => {
                this.refreshOnRebalance();
            });
    }

    /** Rebalance check based on models length */
    confirmRebalance(eligibleApprovedRecords: IModel[]) {
        this.eligibleRebalModelsCount = 0;
        this.nonEligibleRebalModelsCount = 0;
        this.selectedModelsCount = this.tabsModel.ids.length;

        if (this.tabsModel.ids != undefined && eligibleApprovedRecords.length >= 1) {
            eligibleApprovedRecords.forEach(model => {
                Util.responseToObject<any>(this._modelService.canRebalanceModel(model.id))
                    .subscribe(response => {
                        this.eligibleRebalModelsCount += 1;
                        this.eligibleRebalModelsArray.push[model.id];
                        //console.log('rebalanced model count : ', this.eligibleRebalModelsCount);
                    },
                    error => {
                        this.nonEligibleRebalModelsCount += 1;
                        // this.unRebalancedModelsCount += 1;
                        //console.log('unrebalanced model count : ', this.unRebalancedModelsCount);
                        // this.refreshOnRebalance();
                    });
            });
            this.selectedModelId = undefined;
            this.rebalanceMessage = true;
        }
        else {
            this.rebalanceApprovedWarning = true;
        }
    }

    /** To call load models on rebalance */
    refreshOnRebalance() {
        // if (this.selectedModelsCount == this.rebalancedModelsCount + this.unRebalancedModelsCount)
        this.loadModels();
    }

    /************************************** Model - Rebalance END  *****************************************/

    /**************************************Model - compare popup  START*************************************/
    /** Show model compare pop-up */
    showModelCompare(modelId: number) {
        this.formattedData = [];
        this.formattedData2 = [];
        this.datacount = 0;
        this.displayModelCompareSec = true;
        this.modelApproveOrReject = undefined;
        this.displayMessageSec = false;
        let currentModel = this.modelList.find(mId => mId.id == modelId);
        let permission = Util.getPermission(PRIV_APPROVEMODELCHG);
        /** COMMENTED AS PER CHANGE IN EPIC. HOWEVER, PERMISSION COULD BE 
         *  CONSIDERED FOR DISPLAYING APPROVAL SECTION
         if (this.modelTypeId == 2)
            // && permission.canRead)
            this.displayMessageSec = true;
        */
        let that = this;
        Observable.forkJoin(
            this.responseToObject<IModel>(this._modelService.getModelDetail(modelId)),
            this.responseToObject<IModel>(this._modelService.getPendingModelDetail(modelId))
        )
            .subscribe((model: any) => {
                if (currentModel.currentStatusId != null)
                    this.displayMessageSec = (model[0].statusId == 1 &&
                        (currentModel.currentStatusId == 3 || currentModel.currentStatusId == 4))
                        ? true : false;

                //console.log(model, 'model')
                //console.log('Status of model[0] :', model[0]['status'], 'Status of model[1] :', model[1]['status'])
                //console.log('model[0] :', model[0]['modelDetail'], 'model[1] :', model[1]['modelDetail'])
                that.plotChartBasedOnCompareData(model)

            },
            error => {
                //console.log(error);
                throw error;
            });

    }

    /** Set the radio selected values */
    setRadioApproveReject(event) {
        this.modelApproveOrReject = event.target.value;
    }

    /** save the model status based on selected Approve/Reject */
    saveModelStatus() {
        //console.log('model ID for saving----', this.tabsModel.id);
        /** {} should be sent as the posted object since POST needs the object */
        Util.responseToObject<any>(this._modelService.approveOrRejectPendingModel(this.tabsModel.id, this.modelApproveOrReject, {}))
            .subscribe(model => {
                this.displayModelCompareSec = false;
                this.loadModels();
            });
    }

    /** on Cancel */
    onCancel() {
        this.displayModelCompareSec = false;
    }

    /** enable/disable save based on radio button selection */
    enableSaveButton() {
        if (this.modelApproveOrReject != undefined)
            return true;
    }

    /** 
     * Model Compare Plottings 
    **/

    private datacount = 0;
    public plotChartBasedOnCompareData(data) {

        $('.compareModel').remove();
        $('.mcompare_selectLevel').empty();
        var that = this;
        var levelArray = [];
        that.modelchart = new ModelGroupChart();

        if (data[0].status == "Approved"
            // && data[0].currentStatus == "Waiting for Approval")
        ) {
            /** PLOT TWO BARS
             * 1. CURRENT: APPROVED WITHIN DATA[0] STRUCTURE
             * 2. PENDING: PENDING WITHIN DATA[1] STRUCTURE
             */
            if (!data[0]['modelDetail'] && !data[1]['modelDetail']) {
                return false;
            }
            that.Level = 1;
            if (data[0]['modelDetail'] && data[0]['modelDetail'] != null) {
                that.addChildvalues(data[0]['modelDetail']['children'], 'Current', 'first');
            }
            if (data[1]['modelDetail'] && data[1]['modelDetail'] != null) {
                if (data[0]['modelDetail'] && data[0]['modelDetail'] != null) {
                    that.Level = 1;
                    that.addChildvalues(data[1]['modelDetail']['children'], 'Pending', '');
                    that.formattedData2.forEach(function (d2, i2) {
                        that.formattedData.forEach(function (d, i) {
                            if (d2['ID'] == d['ID']) {
                                // d['Pending'] = d2['Pending'];
                                d2['Current'] = d['Current'];
                            };
                        });
                    });
                    that.formattedData = that.formattedData2;
                } else {
                    that.addChildvalues(data[1]['modelDetail']['children'], 'Pending', 'first');
                }
            }
            that.formattedData.forEach(function (d, i) {
                levelArray.push(d.level);
            });
            that.appendLevelsToDropDown(levelArray);
            that.modelchart.parseDataIntoRequiredFormat(that.formattedData, 1);
        }
        if (data[0].status == "Waiting For Approval"
            //  && data[0].currentStatus == "Waiting for Approval")
        ) {
            /** PLOT SINGLE BAR 
             * PENDING: PENDING WITHIN DATA[0] STRUCTURE
            */

            if (!data[1]['modelDetail'])
                return false;
            that.Level = 1;
            that.addChildvalues(data[1]['modelDetail']['children'], 'Pending', 'first');
            that.formattedData.forEach(function (d, i) {
                levelArray.push(d.level);
            });
            that.appendLevelsToDropDown(levelArray);
            that.modelchart.parseDataIntoRequiredFormat(that.formattedData, 1);

        }
    };

    /** function to append levels to dropdown */
    public appendLevelsToDropDown(levelArray) {
        var mLevel = Math.max.apply(Math, levelArray)
        for (var k = 0; k < mLevel; k++) {
            $('.mcompare_selectLevel').append('<option value=' + (k + 1) + '>Level ' + (k + 1) + '</option>')
        }
        levelArray = [];
    };

    /** function to add children data to the chartdata */
    public addChildvalues(data, status, first) {
        var that = this;
        var loopdata = [];
        var maxChilds = 4;
        var level = that.Level++;
        if (first)
            loopdata = that.formattedData;
        else
            loopdata = that.formattedData2;
        if (data != undefined && data.length != 0 && data != []) {
            data.forEach(function (val, key) {
                loopdata.push({
                    label: val['name'],
                    [status]: val['targetPercent'],
                    level: level,
                    ID: val['name'] + '_' + that.Level
                });
                that.addChildvalues(val['children'], status, first)
                that.Level = level + 1;
            });
        } else {
            that.Level = level;
            if (that.Level > maxChilds)
                that.Level = (that.Level + 1) - maxChilds;
        }
    }

    /************************************** Model - compare popup END *************************************/
}