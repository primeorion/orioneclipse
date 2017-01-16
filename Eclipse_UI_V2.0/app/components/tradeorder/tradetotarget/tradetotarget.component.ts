import { Component, ViewChild, Input, AfterViewInit, Output, EventEmitter, HostListener } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { IRaiseCash, ISellMethod, ITradeToTarget } from '../../../models/raisecash';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { Observable, Observer } from 'rxjs/Rx';
import * as Util from '../../../core/functions';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { TradeOrderFilterComponent } from '../shared/tradeorder.tradefilter.component';
import {
    IExcelImport, IFileUploadResult, IFileUploadRecords, IGenerateTrades, ITradeSecurity, ITradeSide, IShortTermGain,
    IWashSales, IModelTypes, ISecurity, IPreferences, ITradeTraget
} from '../../../models/tradetools';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { IPortfolio, IPortfolioViewModel, IAccount, IPortfolioFilters } from '../../../models/portfolio';
import { PortfolioService } from '../../../services/portfolio.service';
import { TradeToolsService } from '../../../services/tradetools.service';
import { AccountsAutoCompleteComponent } from '../../../shared/search/account.autocomplete.component';
import { ModelAutoCompleteComponent } from '../../../shared/search/model.autocomplete.component';
import { TradeGroupsPortfolioAutoCompleteComponent } from '../../../shared/search/tradegroupsportfolio.autocomplete.component';
import { TradeGroupsAccountAutoCompleteComponent } from '../../../shared/search/tradegroupsaccount.autocomplete.component';
import { SecurityService } from '../../../services/security.service';
import { TradeOrderListComponent } from '../../tradeorder/list/tradeorderlist.component';
import { AccountService } from '../../../services/account.service';
import { ModelService } from '../../../services/model.service';

@Component({
    selector: 'eclipse-tradetotarget',
    templateUrl: './app/components/tradeorder/tradetotarget/tradetotarget.component.html',
    providers: [PortfolioService]
})

export class TradeToTargetComponent extends BaseComponent implements AfterViewInit {

    @ViewChild(AccountsAutoCompleteComponent) accountsAutoCompleteComponent: AccountsAutoCompleteComponent;
    @ViewChild(ModelAutoCompleteComponent) modelAutoCompleteComponent: ModelAutoCompleteComponent;
    @ViewChild(TradeGroupsPortfolioAutoCompleteComponent) tradeGroupsPortfolioAutoCompleteComponent: TradeGroupsPortfolioAutoCompleteComponent;
    @ViewChild(TradeGroupsAccountAutoCompleteComponent) tradeGroupsAccountAutoCompleteComponent: TradeGroupsAccountAutoCompleteComponent;
    @ViewChild(TradeOrderFilterComponent) tradeOrderFilterComponent: TradeOrderFilterComponent;
    @Output() tradeFilterCallback = new EventEmitter();
    @ViewChild(TradeOrderListComponent) tradeorderListComponent: TradeOrderListComponent;


    selectedModel: ITradeToTarget;
    noOfAccounts: number;
    private viewName: string = "SelectionTab";
    options: any;
    List: any[] = [];
    selectedItem: any;
    private showEmphasisTab: string;
    account: number = 1;
    model: number = 0;
    tradeGroupsForPortfolio: number = 0;
    tradeGroupsForAccount: number = 0;
    excelImport: number = 0;
    private portfolios: IPortfolio[] = [];
    queryStringVal: string;
    selectedPortfoliosList: any[] = [];
    disableFilterNextBtn: boolean = true;
    public tradeFilterMethod: string;
    private tradetoTargetGridOptions: GridOptions;
    private tradetoTargetColumnDefs: ColDef[];
    selecetedItemIds: number[] = [];
    uploadedFileRecordType: string;
    selectedSecurityDetail: any;
    securitySuggessions: any;
    route: string;
    filterMode: string;
    selectedIds: string;
    valuesList: string[];
    values = [];
    isTickerSwap: boolean = false;
    isSpendCash: boolean = false;
    isNotValidFile: boolean = false;

    generateTradesTargets: ITradeTraget;
    tradeSecurity: ISecurity = <ISecurity>{};
    preferences: IPreferences = <IPreferences>{};

    private trades: any[] = [];
    selectedTrades: any;

    // targetPercent: any;
    selectedTradeSide: number;

    selectedSecurityItem: any;

    /**Declare Models */
    tradeSide: ITradeSide[];
    shortTermGain: IShortTermGain[];
    washSales: IWashSales[];
    modelType: IModelTypes[];

    /**Enable checked checkbox values */
    canhaveModelType: boolean;
    canhaveTradePercentage: boolean;
    canhaveTradeDollar: boolean;
    canhaveAllowWash: boolean;
    canhaveShortTerm: boolean;

    //Excel import
    file: IExcelImport = <IExcelImport>{};
    private displayImportModel: boolean = false;
    private checkUploadFile: boolean = true;
    private disableUploadBtn: boolean = true;
    private checkDragFile: boolean = false;
    private fileUploadError: string;
    private showFiletUploadError: boolean = false;
    private modelErrors: boolean;
    private dragFileName: string;
    uploadResults: IFileUploadResult;
    fromParentPrefLevel: string;

    @Input() parentModel: any;
    @Output() tabSelectionCallback = new EventEmitter();

    constructor(private _tradeToolsService: TradeToolsService, private _portfolioService: PortfolioService,
        private _securityService: SecurityService, private _router: Router, private _accountService: AccountService,
        private _modelService: ModelService,
        private activatedRoute: ActivatedRoute) {
        super();
        this.route = Util.activeRoute(activatedRoute);
        this.valuesList = [];
        this.getQueryStringData(activatedRoute);
        if (this.route == 'tradetotarget') {
            this.isTickerSwap = true;
        }


        this.selectedModel = <ITradeToTarget>{ notes: "", sellModel: {} };

        this.selectedModel.parentModelData = {
            selectedVal: this.filterMode, selectedAccountsList: this.valuesList, showAccounts: true, showModel: true,
            isOnLoad: false, showtradeGroupsForAccounts: true, showtradeGroupsForPortfolio: true, showPortfolio: false, showSleeves: false,
            showExcelImport: true, portfolioId: ""
        }
        this.filterMode != '' && this.valuesList.length != 0 ? this.selectedModel.parentModelData.isOnLoad = true : this.selectedModel.parentModelData.isOnLoad = false;
        this.tradeSecurity.side = 1;
        this.preferences.allowWashSalesId = 0;
        this.preferences.allowShortTermGainsId = 0;

        // this.selectedModel.parentModelData = { selectedVal: '', selectedAccountsList: this.selectedPortfoliosList, showAccounts: true, showModel: true, showtradeGroups: true, showPortfolio: false, portfolioId: "" }
        this.tradeFilterMethod = 'account';
        this.uploadResults = <IFileUploadResult>{};
        this.uploadResults.records = [];
        this.tradetoTargetGridOptions = <GridOptions>{};
        this.createColDefs();
        this.selectedSecurityDetail = "";

        this.generateTradesTargets = <ITradeTraget>{};
    }

    ngOnInit() {
        if (this.queryStringVal != undefined && this.queryStringVal != "") {
            //this.selectedModel.parentModelData.portfolioId = this.queryStringVal;
        }

        //Binding Selected ids Data - query string will have only Id's, will fetch other details and then bind the grid
        if (this.selectedModel.parentModelData.selectedAccountsList.length != 0
            && this.selectedModel.parentModelData.selectedVal != '') {
            this.values = [];
            this.List = [];
            this.tradeFilterMethod = this.selectedModel.parentModelData.selectedVal;
            this.selectedModel.parentModelData.selectedAccountsList.forEach(element => {
                //Query string data - directly ids passed &  Auto Complete-  Object.id
                this.values.push(element.id == undefined ? element : element.id);
            });
            this.setRadioBtnSelection();
            if (this.tradeFilterMethod == 'account') {
                if (!this.isSpendCash)
                    this.bindAccountDetailsByIds(this.values);
            }
            else if (this.tradeFilterMethod == 'model') {
                this.bindModelDetailsByIds(this.values);
            }
            else
                this.List = this.selectedModel.parentModelData.selectedAccountsList;
        }
    }

    ngAfterViewInit() {
        if (this.queryStringVal != undefined && this.queryStringVal != "") {
            this.getView("tradeOptionsTab");
        }
    }

    /**Carries the selected Accounts/Models values in Next button */
    getView(viewName: string) {

        this.selectedModel.parentModelData.isOnLoad = false;
        this.selectedSecurityItem = undefined;
        this.selectedTrades = undefined;
        this.viewName = viewName;
        if (this.List.length > 0)
            this.disableFilterNextBtn = false;
        //  if (viewName == "0")
        //     this.isTickerSwap == true ? this.viewName = 'tradeOptionsTab' : this.viewName = 'tradeOptionsTab';
        this.getTradeside();
        this.getShortTermGain();
        this.getWashSales();

        this.setRadioBtnSelection();
        this.selecetedItemIds = this.List.map(m => m.id);
        this.getModelTypesByIds();

        if (this.uploadResults.recordType != undefined)
            this.uploadedFileRecordType = this.uploadResults.recordType;

        //Preparing numeric array from uploaded excel file
        this.uploadResults.records.forEach(e => {
            if (e.isValid) {
                this.selecetedItemIds.push(e.id);
            }
        });

        /**clear the second screen values */

        this.tradeSecurity.side = 1;

        /**To clear the minimumTradeDollar textboxes */
        this.preferences.minimumTradePercent = null;
        this.preferences.minimumTradeDollar = null;
        this.canhaveTradePercentage = false;
        this.canhaveTradeDollar = false;
        /**To clear the Allow Wash Dropdowns */
        this.preferences.allowShortTermGainsId = null;
        this.preferences.allowWashSalesId = null;
        this.canhaveShortTerm = false;
        this.canhaveAllowWash = false;

        /**clear the Security flags */
        this.tradeSecurity.targetPercent = null;
        this.tradeSecurity.isFullTrade = false;
        this.tradeSecurity.modelTypeId = null;
        this.canhaveModelType = false;
        this.tradeSecurity.reason = "";

        this.showEmphasisTab = "none";
    }

    /** To Calculate the trade to Target */
    generateTradeTraget() {
        this.tradeSecurity.securityId = this.selectedSecurityItem.id;

        if (this.tradeFilterMethod == 'account')
            this.generateTradesTargets.accountIds = this.selecetedItemIds;
        else if (this.tradeFilterMethod == 'model')
            this.generateTradesTargets.modelIds = this.selecetedItemIds;
        else if (this.tradeFilterMethod == 'excelImport')
            this.generateTradesTargets.accountIds = this.selecetedItemIds;

        this.generateTradesTargets.security = this.tradeSecurity;
        this.generateTradesTargets.preferences = this.preferences;

        this.generateTradesTargets.security.side = +this.generateTradesTargets.security.side;
        //Check optional security flags. if its false, do not set the preference properties.

        if (this.tradeSecurity.modelTypeId != undefined)
            this.generateTradesTargets.security.modelTypeId = this.canhaveModelType ? +this.tradeSecurity.modelTypeId : null;

        //Check optional preferences flags. if its false, do not set the preference properties.

        this.generateTradesTargets.preferences.allowWashSalesId = this.canhaveAllowWash ? +this.preferences.allowWashSalesId : null;
        this.generateTradesTargets.preferences.allowShortTermGainsId = this.canhaveShortTerm ? +this.preferences.allowShortTermGainsId : null;

        this.generateTradesTargets.preferences.minimumTradePercent = this.canhaveTradePercentage ? +this.preferences.minimumTradePercent : null;
        this.generateTradesTargets.preferences.minimumTradeDollar = this.canhaveTradeDollar ? +this.preferences.minimumTradeDollar : null;

        console.log("Generate Tade to Target: ", this.generateTradesTargets);

        Util.responseToObject<any>(this._tradeToolsService.calculateTarget(this.generateTradesTargets))
            .subscribe(model => {
                //console.log('Trade To Target success : ', JSON.stringify(model));
                this._router.navigate(['/eclipse/tradeorder/list']);
            },
            error => {
                console.log('generateTrades error : ', error);
            });
    }

    /** To Create ColDefs */
    createColDefs() {
        this.tradetoTargetColumnDefs = [
            <ColDef>{ headerName: "ID", field: 'id', cellClass: 'text-center', width: 100, filter: 'number' },
            <ColDef>{ headerName: "Name", field: 'name', cellClass: 'text-center', width: 280, filter: 'text' },
            <ColDef>{ headerName: "Tag", field: 'tag', cellClass: 'text-center', width: 260, filter: 'text' },
            <ColDef>{ headerName: "", field: 'delete', width: 120, cellClass: 'text-center', cellRenderer: this.deleteCellRenderer, suppressMenu: true, suppressMultiSort: true }
        ];
    }

    /** Delete cell renderer */
    deleteCellRenderer(params) {
        var result = '<span>';
        result += '<i id =' + params.node.data.id + ' title="Delete" class="fa fa-times red" aria-hidden="true"></i></span>';
        return result;
    }

    /** Hostlistener for ag-grid context menu actions */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|i) id=')) {
            return;
        }
        let matches = targetElement.outerHTML.match(pattern);
        let [id = 0, val = 0] = matches;
        if (targetElement.title === "Delete") {
            this.DeleteItem(id);
        }
    }

    /** Refresh the ag-grid after delete performed */
    private DeleteItem(id) {
        this.tradetoTargetGridOptions.rowData.splice(this.tradetoTargetGridOptions.rowData.findIndex(x => x.id == parseInt(id)), 1);
        this.tradetoTargetGridOptions.api.setRowData(this.tradetoTargetGridOptions.rowData);

        // Enable/disable Next button on filter page based on selected accounts count
        if (this.List.length == 0)
            this.disableFilterNextBtn = true;
        this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
    }

    /** To add selected item to grid */
    addItem() {

        if (this.selectedItem != undefined) {
            //Checking of duplicate entry
            if (this.List.length > 0) {
                let match = this.List.filter(m => m.id == this.selectedItem.id);
                if (match.length > 0) return;
            }

            //Item pushing into grid
            this.List.push(this.selectedItem);
            this.tradetoTargetGridOptions.api.setRowData(this.List);
            this.tradetoTargetGridOptions.api.sizeColumnsToFit();
            this.clearFilterAutoComplete();

            // Enable/disable Next button on filter page based on selected accounts count
            if (this.List.length > 0) {
                this.disableFilterNextBtn = false;
                this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
            }

            // if (this.trades.length > 0)
            //     this.disableFilterNextBtn = false;
            // else
            //     this.disableFilterNextBtn = true;
        }
    }

    /** To get selected item from auto complete */
    getSelectedItem(item) {
        this.selectedItem = item.value;
    }

    /** To clear trade filters auto complete  */
    clearFilterAutoComplete() {
        if (this.tradeFilterMethod == 'account')
            this.accountsAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'model')
            this.modelAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'tradeGroupsForPortfolio')
            this.tradeGroupsPortfolioAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'tradeGroupsForAccount')
            this.tradeGroupsAccountAutoCompleteComponent.selectedItem = undefined;
    }

    /** Fires on radio button change */
    radioBtnChange(val, selTradeFilterMethod) {
        this.tradeFilterMethod = selTradeFilterMethod;
        this.List = [];
        this.file.document = undefined;
        this.file.name = undefined;
        this.uploadResults.records = [];
        //To disable/enable next button
        this.disableFilterNextBtn = true;
        this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
    }

    /** Set redio button default selection */
    setRadioBtnSelection() {
        if (this.tradeFilterMethod == 'account') this.account = 1;
        else if (this.tradeFilterMethod == 'model') this.model = 1;
        else if (this.tradeFilterMethod == 'tradeGroupsForPortfolio') this.tradeGroupsForPortfolio = 1;
        else if (this.tradeFilterMethod == 'tradeGroupsForAccount') this.tradeGroupsForAccount = 1;
        else if (this.tradeFilterMethod == 'excelImport') this.excelImport = 1;
    }

    /** Excel Import Pop-up */
    excelImportProcess() {
        this.showFiletUploadError = false;
        //this.disableUploadBtn = true;
        this.checkUploadFile = true;
        this.displayImportModel = true;
        this.modelErrors = false;
        this.checkDragFile = false;
    }

    /** Emiting event to enable/disable Next button based on selected accounts count */
    getTradeFiltersDate(event) {
        this.disableFilterNextBtn = event.value;
    }

    /** To select file  */
    selectedFile(file) {
        //this.disableUploadBtn = false;
        this.showFiletUploadError = false;
        var selectedFile = file[0];
        if (this.isValidExcelFile(selectedFile.type)) {
            this.file.document = selectedFile;
            this.file.name = selectedFile.name;
            this.postFile(selectedFile);

            //To enabling next button after file selection
            this.disableFilterNextBtn = false;
            this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
        }
        else {
            this.fileUploadError = 'Only (* .xls)  file can be uploaded.';
            this.showFiletUploadError = true;
            this.disableUploadBtn = true;
        }
    }

    /** To upload file to server */
    postFile(selectedFile) {
        if (selectedFile.name) {
            this._tradeToolsService.uploadFileTemplate(selectedFile, false)
                .subscribe(uploadModel => {
                    if (uploadModel.recordType == "account") {
                        this.isNotValidFile = false;
                        let invalidRecords = uploadModel.records.filter(item => (item.isValid == false));
                        invalidRecords.forEach(item => {
                            if (item.accountId == null)
                                item.id = item.accountNumber;
                            else if (item.accountNumber == null)
                                item.id = item.accountId;
                        });
                    this.uploadResults = uploadModel;
                    }
                    else{
                        this.isNotValidFile = true;
                        this.disableFilterNextBtn = true;
                    }
                },
                error => {
                    console.log('upload error : ', error);
                });
        }
    }

    /** To dragFile */
    dragFile(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /** To drop file */
    dropFile(event) {
        if (event.dataTransfer.files.length != 1) {
            this.fileUploadError = 'Only one file can be uploaded at a time.'
            this.showFiletUploadError = true;
        } else {
            this.checkDragFile = true;
            this.dragFileName = event.dataTransfer.files[0].name;
            this.selectedFile(event.dataTransfer.files);
        }
        event.preventDefault();
        event.stopPropagation();
    }

    /** To select template */
    selectedTemplate(event) {
        this.checkDragFile = false;
        this.selectedFile(event.target.files);
    }


    /** To delete record from file upload results table */
    deleteRecord(deleteRecord) {
        this.uploadResults.records.splice(this.uploadResults.records.findIndex(x => x.id == parseInt(deleteRecord.id)), 1);
    }

    /** Emiting event to enable/disable Next button based on selected accounts count */
    getTradeFiltersData(event) {
        this.disableFilterNextBtn = event.value;
    }

    /**Security search */
    getSecurities(event) {
        let mode = this.tradeFilterMethod == "excelImport" ? "account" : this.tradeFilterMethod;
        Util.responseToObjects<any>(this._securityService.getSellSecurities(event.query, mode, this.selecetedItemIds))
            .subscribe(model => {
                this.securitySuggessions = model;
            });
    }

    /** Fires on select portfolio from search portfolio */
    onTradeSelect(params) {
        this.selectedTrades = params;
    }

    /*** binding TadeSide Dropdown */
    getTradeside() {
        Util.responseToObject<any>(this._tradeToolsService.getTradeSide())
            .subscribe(model => {
                this.tradeSide = model;
                // this.tradeSide.forEach(element => {
                //     this.selectedTradeSide = element.name;
                // });
            })
    }

    /** binding Allow shortTermGain Dropdown */
    getShortTermGain() {
        Util.responseToObject<any>(this._tradeToolsService.getShortTermGain())
            .subscribe(model => {
                this.shortTermGain = model;
                console.log("Allow Short Term Gains :", this.shortTermGain);
            })
    }

    /**binding Allow Wash Sales Dropdown */
    getWashSales() {
        Util.responseToObject<any>(this._tradeToolsService.getWashSales())
            .subscribe(model => {
                this.washSales = model;
            })
    }

    /** binding the Modle Type Dropdown */
    getModelTypesByIds() {
        Util.responseToObject<any>(this._tradeToolsService.getModelTypes())
            .subscribe(model => {
                this.modelType = model;
            })
    }

    /**Enable Save buttom when CashAmount and Date */
    enableCalculateButton() {
        let security = this.selectedSecurityItem;
        let tradePercent = this.tradeSecurity.targetPercent;

        if ((security != undefined && tradePercent != null) && (security != "" && tradePercent != null))
            return true;
        else
            return false;

    }

    /**Get Query string data from route */
    getQueryStringData(activateRoute) {
        //getting values from Query string and passing to FilterComponent
        if (this.route == "tradetotarget") {
            this.filterMode = Util.getRouteParam<string>(activateRoute, 'type');
            this.selectedIds = Util.getRouteParam<string>(activateRoute, 'ids');
        }
        this.filterMode == undefined ? this.filterMode = '' : this.filterMode;
        if (this.selectedIds != undefined)
            this.valuesList = this.selectedIds.split(',');
    }

    /**Emitting tab selection to second tab directly as selection of Ids already made. */
    setSelectedView(event) {
        this.getView(event.value);
    }

    /**get account details by ids and bind the grid */
    bindAccountDetailsByIds(AccountIds: any[]) {
        let apiArray = [];
        AccountIds.forEach(element => {
            apiArray.push(this._accountService.getAcountDetail(element)
                .map((response: Response) => <any>response.json()))
        });
        Observable.forkJoin(apiArray)
            .subscribe((modelsData: any[]) => {
                this.List = modelsData;
                if (this.selectedModel.parentModelData != undefined && this.selectedModel.parentModelData.isOnLoad == false)
                    this.getView("SelectionTab");
                else if (this.selectedModel.parentModelData != undefined && this.selectedModel.parentModelData.isOnLoad)
                    this.getView("tradeOptionsTab");
            });
    }

    /**get Models details by ids and bind the grid */
    bindModelDetailsByIds(ModelIds: any[]) {
        let apiArray = [];
        ModelIds.forEach(element => {
            apiArray.push(this._modelService.getModelDetail(element)
                .map((response: Response) => <any>response.json()))
        });
        Observable.forkJoin(apiArray)
            .subscribe((modelsData: any[]) => {
                this.List = modelsData;
                if (this.selectedModel.parentModelData != undefined && this.selectedModel.parentModelData.isOnLoad)
                    this.getView("SelectionTab");
                // if (this.selectedModel.parentModelData != undefined && this.selectedModel.parentModelData.isOnLoad)
                //     this.getView("tradeOptionsTab");
            });
    }
}