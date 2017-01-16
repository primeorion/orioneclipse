import { Component, HostListener, Input, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Observer } from 'rxjs/Rx';
import * as Util from '../../../core/functions';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { IPortfolio, IPortfolioSimple } from '../../../models/portfolio';
import { IAccount } from '../../../models/account';
import { IModel } from '../../../models/modeling/model';
import { ITradeSecurities, IExcelImport, IFileUploadResult, IFileUploadRecords } from '../../../models/tradetools';
import { TradeToolsService } from '../../../services/tradetools.service';
import { PortfolioService } from '../../../services/portfolio.service';
import { SleeveService } from '../../../services/sleeves.service';
import { AccountService } from '../../../services/account.service';
import { ModelService } from '../../../services/model.service';
import { Response } from '@angular/http';
import { IRaiseCash, ISellMethod } from '../../../models/raisecash';
import { PortfolioAutoCompleteComponent } from '../../../shared/search/portfolio.autocomplete.component';
import { SleevePfAutoCompleteComponent } from '../../../shared/search/sleeveportfolio.autocomplete.component';
import { AccountsAutoCompleteComponent } from '../../../shared/search/account.autocomplete.component';
import { SleevesAutoCompleteComponent } from '../../../shared/search/sleeves.autocomplete.component';
import { ModelAutoCompleteComponent } from '../../../shared/search/model.autocomplete.component';
import { TradeGroupsPortfolioAutoCompleteComponent } from '../../../shared/search/tradegroupsportfolio.autocomplete.component';
import { TradeGroupsAccountAutoCompleteComponent } from '../../../shared/search/tradegroupsaccount.autocomplete.component';

@Component({
    selector: 'eclipse-tradeorder-tradefilter',
    templateUrl: './app/components/tradeorder/shared/tradeorder.tradefilter.component.html',
})

export class TradeOrderFilterComponent extends BaseComponent {
    @Input() parentModel: any;
    @Output() tradeFilterCallback = new EventEmitter();
    @Output() tabSelectionCallback = new EventEmitter();
    @Input() excelData: any;

    showPortfolio: boolean = true;
    showAccounts: boolean = true;
    showSleevePortfolio: boolean;
    showModel: boolean = true;
    showSleeves: boolean = false;/** CUSTOMIZED */
    showExcelImport: boolean = true;/** CUSTOMIZED */
    showExcelImportPortfolio: boolean = false;/** CUSTOMIZED */
    showExcelImportSleeves: boolean = false;/** CUSTOMIZED */
    showtradeGroupsForPortfolio: boolean = false; /** CUSTOMIZED */
    showtradeGroupsForAccounts: boolean = false; /** CUSTOMIZED */
    showSpendContributionSleeveBal: boolean = false;
    showCalculateAtSleevePf: boolean = false;
    showAmountInput: boolean = false;
    private tradesFilterGridOptions: GridOptions;
    private tradesFilterColumnDefs: ColDef[];
    private tradesFilterData: any[] = [];
    public tradeFilterMethod: string;
    portfolio: number = 1;
    account: number = 0;
    model: number = 0;
    sleevePortfolio: number = 0;

    sleeves: number = 0;/** CUSTOMIZED */
    tradeGroupsForPortfolio: number = 0;/** CUSTOMIZED */
    tradeGroupsForAccount: number = 0;/** CUSTOMIZED */
    excelImport: number = 0;/** CUSTOMIZED */
    excelImportForPf: number = 0;/** CUSTOMIZED */
    excelImportForSlvs: number = 0;/** CUSTOMIZED */
    //showPortfolio: boolean;
    disableAdd: boolean = true;
    selectedItem: any;
    suggestions: any[] = [];
    List: any[] = [];
    selectedModel: IRaiseCash;
    disableFilterNextBtn: boolean = true;
    showtradeGroups: boolean = false;
    enteredAmount: number;
    isSpendCash: boolean = false;
    isSleevePortfolio: boolean = false;
    portfolioContributionItem: any;
    isCalculateAtSleevePf: boolean = false;
    isNotValidFile: boolean = false;

    values = [];
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

    @ViewChild(PortfolioAutoCompleteComponent) portfolioAutoCompleteComponent: PortfolioAutoCompleteComponent;
    @ViewChild(SleevePfAutoCompleteComponent) sleevePortfolioAutoCompleteComponent: SleevePfAutoCompleteComponent;
    @ViewChild(AccountsAutoCompleteComponent) accountsAutoCompleteComponent: AccountsAutoCompleteComponent;
    @ViewChild(ModelAutoCompleteComponent) modelAutoCompleteComponent: ModelAutoCompleteComponent;
    @ViewChild(SleevesAutoCompleteComponent) sleevesAutoCompleteComponent: SleevesAutoCompleteComponent;
    @ViewChild(TradeGroupsPortfolioAutoCompleteComponent) tradeGroupsPortfolioAutoCompleteComponent: TradeGroupsPortfolioAutoCompleteComponent;
    @ViewChild(TradeGroupsAccountAutoCompleteComponent) tradeGroupsAccountAutoCompleteComponent: TradeGroupsAccountAutoCompleteComponent;
    constructor(private _tradeToolsService: TradeToolsService,
        private _portfolioService: PortfolioService,
        private _sleeveService: SleeveService,
        private _accountService: AccountService,
        private _modelService: ModelService,
        private activateRoute: ActivatedRoute) {
        super();
        this.tradesFilterGridOptions = <GridOptions>{};
        // this.createColDefs();
        this.tradeFilterMethod = 'portfolio';
        this.uploadResults = <IFileUploadResult>{};
        this.uploadResults.records = [];
    }

    ngOnInit() {
        // console.log('this.parentModel from trade filter ts : ', this.parentModel);
        if (this.excelData != undefined)
            this.uploadResults = this.excelData;
        if (this.parentModel != undefined) {
            if (this.parentModel.displayFilterOptions.showModel != undefined)
                this.showModel = this.parentModel.displayFilterOptions.showModel;
            if (this.parentModel.displayFilterOptions.showAccounts != undefined)
                this.showAccounts = this.parentModel.displayFilterOptions.showAccounts;
            if (this.parentModel.displayFilterOptions.showPortfolio != undefined)
                this.showPortfolio = this.parentModel.displayFilterOptions.showPortfolio;
            if (this.parentModel.displayFilterOptions.showAmountInput != undefined)
                this.showAmountInput = this.parentModel.displayFilterOptions.showAmountInput;
            if (this.parentModel.displayFilterOptions.showSpendContributionSleeveBal != undefined)
                this.showSpendContributionSleeveBal = this.parentModel.displayFilterOptions.showSpendContributionSleeveBal;
            if (this.parentModel.displayFilterOptions.showSleevePortfolio != undefined)
                this.showSleevePortfolio = this.parentModel.displayFilterOptions.showSleevePortfolio;
            if (this.parentModel.displayFilterOptions.showCalculateAtSleevePf != undefined)
                this.showCalculateAtSleevePf = this.parentModel.displayFilterOptions.showCalculateAtSleevePf;

            /** CUSTOMIZED */
            if (this.parentModel.displayFilterOptions.showExcelImport != undefined)
                this.showExcelImport = this.parentModel.displayFilterOptions.showExcelImport;

            /** CUSTOMIZED */
            if (this.parentModel.displayFilterOptions.showSleeves != undefined)
                this.showSleeves = this.parentModel.displayFilterOptions.showSleeves;

            /** CUSTOMIZED */
            if (this.parentModel.displayFilterOptions.showExcelImportPortfolio != undefined)
                this.showExcelImportPortfolio = this.parentModel.displayFilterOptions.showExcelImportPortfolio;

            /** CUSTOMIZED */
            if (this.parentModel.displayFilterOptions.showExcelImportSleeves != undefined)
                this.showExcelImportSleeves = this.parentModel.displayFilterOptions.showExcelImportSleeves;

            /** CUSTOMIZED */
            if (this.parentModel.displayFilterOptions.showtradeGroupsForPortfolio != undefined)
                this.showtradeGroupsForPortfolio = this.parentModel.displayFilterOptions.showtradeGroupsForPortfolio;

            /** CUSTOMIZED */
            if (this.parentModel.displayFilterOptions.showtradeGroupsForAccounts != undefined)
                this.showtradeGroupsForAccounts = this.parentModel.displayFilterOptions.showtradeGroupsForAccounts;

            if (this.parentModel.displayFilterOptions.showPortfolio == false)
                this.tradeFilterMethod = 'account';

            if (this.parentModel.displayFilterOptions.showtradeGroups != undefined)
                this.showtradeGroups = this.parentModel.displayFilterOptions.showtradeGroups;

            //Check parent model values and assigning back, on next/back buttons clicks
            if (this.parentModel.selectedVal != '')
                this.tradeFilterMethod = this.parentModel.selectedVal;

            if (this.parentModel.isCalculateAtSleevePf != undefined)
                this.isCalculateAtSleevePf = this.parentModel.isCalculateAtSleevePf;

            if (this.isCalculateAtSleevePf) {
                this.showSleevePortfolio = true;
                this.showAccounts = false;
                this.isSleevePortfolio = true;
                this.List = [];
            }
            this.setRadioBtnSelection();

            if (this.parentModel.portfolioId != undefined && this.parentModel.selectedAccountsList.length == 0)
                this.getPortfoliosByQueryString(this.parentModel.portfolioId);

            if (this.parentModel.isSpendCash != undefined)
                this.isSpendCash = this.parentModel.isSpendCash;
            if (this.parentModel.selectedAccountsList.length > 0) {
                // if (this.isSpendCash)
                this.List = this.parentModel.selectedAccountsList;
                this.disableFilterNextBtn = false;
                this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
            }
            if (this.parentModel.selectedFile != undefined && this.parentModel.selectedFile.document != undefined) {
                //this.file.document = this.parentModel.selectedFile.document;
                //this.file.name = this.parentModel.selectedFile.document.name;
                this.disableFilterNextBtn = true;
                this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
            }

            this.createColDefs();
        }
        //Binding Selected ids Data - query string will have only Id's, will fetch other details and then bind the grid
        if (this.parentModel != undefined && this.parentModel.selectedAccountsList.length != 0
            && this.parentModel.selectedVal != '' && this.parentModel.isOnLoad == true) {
            this.values = [];
            this.List = [];
            this.tradeFilterMethod = this.parentModel.selectedVal;
            this.parentModel.selectedAccountsList.forEach(element => {
                //Query string data - directly ids passed &  Auto Complete-  Object.id
                this.values.push(element.id == undefined ? element : element.id);
            });
            this.setRadioBtnSelection();
            if (this.tradeFilterMethod == 'portfolio')
                this.bindPortfolioDetailsByIds(this.values);
            else if (this.tradeFilterMethod == 'account') {
                if (!this.isSpendCash)
                    this.bindAccountDetailsByIds(this.values);
            }
            else if (this.tradeFilterMethod == 'model') {
                this.bindModelDetailsByIds(this.values);
            }
            else
                this.List = this.parentModel.selectedAccountsList;
        }
    }

    /** To get portfolios */
    private getPortfoliosByQueryString(PortfolioIds: string) {
        //splitting comma seprated team ids
        let arrPortfoliosIds = PortfolioIds.split(',');
        this.getPortfolioDetailsByIds(arrPortfoliosIds);
    }

    /**get portfolioIds from query string and bind the checkbox*/
    getPortfolioDetailsByIds(PortfolioIds: any[]) {
        let apiArray = [];
        PortfolioIds.forEach(element => {
            apiArray.push(this._portfolioService.getPortfolioSearch(element)
                .map((response: Response) => <any>response.json()))
        });
        Observable.forkJoin(apiArray)
            .subscribe((modelsData: any[]) => {
                let cnt = 0;
                PortfolioIds.forEach(element => {

                    let model = modelsData[cnt].filter(item => item.id == +element);
                    if (model.length > 0) {
                        this.List.push(model[0]);
                    }
                    cnt++;
                });
                this.bindPortfoliosList();
            });
    }

    /**get portfolioIds from query string and bind the checkbox*/
    bindPortfolioDetailsByIds(PortfolioIds: any[]) {
        let apiArray = [];
        PortfolioIds.forEach(element => {
            apiArray.push(this._portfolioService.getPortfolioById(element)
                .map((response: Response) => <any>response.json()))
        });
        Observable.forkJoin(apiArray)
            .subscribe((modelsData: any[]) => {
                //this.List.push({ 'id': modelsData. })
                modelsData.forEach(elem => {
                    this.List.push({ 'id': elem.id, 'name': elem.general.portfolioName, 'tags': elem.general.tags });
                });
                this.bindPortfoliosList();
                this.isDirectTabSelection();
            });
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
                this.isDirectTabSelection();

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
                this.isDirectTabSelection();
            });
    }

    isDirectTabSelection() {
        if (this.parentModel != undefined && !this.parentModel.isBackButtonClick) {
            //Jump to Second tab as selection is already made in account/model/portfolio page.
            this.tabSelectionCallback.emit({ value: 'createTradesTab' });
        }
    }

    /** To Create ColDefs */
    createColDefs() {
        this.tradesFilterColumnDefs = [];
        let self = this;
        if (this.isSpendCash) {
            if (this.tradeFilterMethod == 'account') {
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 100 });
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "Account Name", field: 'name', width: 180 });
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "Type", field: 'type', width: 100 });
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "Account Number", field: 'accountNumber', width: 180 });
                this.tradesFilterColumnDefs.push(<ColDef>{
                    headerName: "Amount", field: "amount", width: 190, cellClass: 'text-center', cellRenderer: function (params) {
                        return self.amountCellRenderer(params, self);
                    }
                });
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 100, cellRenderer: this.deleteCellRenderer });
            }
            else if (this.tradeFilterMethod == 'sleevePortfolio') {
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 100 });
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "Portfolio Name", field: 'name', width: 180 });
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "Number", field: 'custodialAccountNumber', width: 180 });
                this.tradesFilterColumnDefs.push(<ColDef>{
                    headerName: "Amount", field: "amount", width: 190, cellClass: 'text-center', cellRenderer: function (params) {
                        return self.amountCellRenderer(params, self);
                    }
                });
                this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 100, cellRenderer: this.deleteCellRenderer });
            }
        } else {
            this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 100 });
            this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "Name", field: 'name', width: 280 });
            this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "Tag", field: 'tags', width: 260 });
            this.tradesFilterColumnDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 120, cellRenderer: this.deleteCellRenderer });
        }
        return this.tradesFilterColumnDefs;
    }

    /** To render amount cell */
    amountCellRenderer(params, self) {
        let result;
        if (params.data[params.colDef.field] == undefined) {
            result = document.createElement("label");
            return result;
        } else {
            var eInput = document.createElement("input");
            eInput.className = "form-control grid-input";
            eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];
            eInput.addEventListener('blur', function (event) {
                params.data[params.colDef.field] = (isNaN(parseFloat(eInput.value)) ? 0 : parseFloat(parseFloat(eInput.value).toFixed(2)));
            });

            // To validate contribution amount on row level
            eInput.addEventListener('keyup', function (event) {
                if (self.tradeFilterMethod == "sleevePortfolio") {
                    self.getPortfolioContributionAmount(params.data.id);
                    if (eInput.value > self.portfolioContributionItem.amount)
                        eInput.value = self.portfolioContributionItem.amount;
                }
            });

            eInput.addEventListener('keypress', function (event) {
                if (event.which == 8 || event.which == 0) {
                    return true;
                }
                if (event.which == 46 && eInput.value.indexOf('.') != -1) {
                    event.preventDefault();
                    return false;
                }
                if (event.which <= 47 || event.which >= 59) {
                    if (event.which != 46) {
                        event.preventDefault();
                        return false;
                    }
                }
            });
            return eInput;
        }
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

    /** To bind portfolio list */
    bindPortfoliosList() {
        if (this.List.length > 0 && this.tradesFilterGridOptions.api != null) {
            this.tradesFilterGridOptions.api.setRowData(this.List);
        }
    }

    /** Refresh the ag-grid after delete performed */
    private DeleteItem(id) {
        this.tradesFilterGridOptions.rowData.splice(this.tradesFilterGridOptions.rowData.findIndex(x => x.id == parseInt(id)), 1);
        this.tradesFilterGridOptions.api.setRowData(this.tradesFilterGridOptions.rowData);

        // Enable/disable Next button on filter page based on selected accounts count
        if (this.List.length == 0)
            this.disableFilterNextBtn = true;
        this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
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

    /** To get selected item from auto complete */
    getSelectedItem(item) {
        this.selectedItem = item.value;
        this.isSleevePortfolio = this.selectedItem.sleevePortfolio;
        //To auto populate amount input with contribution amount for selected sleeve portfolio
        if (this.selectedItem != undefined && this.tradeFilterMethod == 'sleevePortfolio') {
            Util.responseToObject<any>(this._portfolioService.getPortfolioContributionAmount(this.selectedItem.id))
                .subscribe(m => {
                    this.portfolioContributionItem = m;
                    this.enteredAmount = m.amount;
                });
        }
        // if (this.selectedItem != undefined)
        //     this.diableAddBtn = false;
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
            if (this.isSpendCash) {
                if (this.enteredAmount == undefined || this.enteredAmount == null) return;
                let item;
                if (this.tradeFilterMethod == 'sleevePortfolio')
                    item = { id: this.selectedItem.id, name: this.selectedItem.name, amount: this.enteredAmount, custodialAccountNumber: this.selectedItem.custodialAccountNumber }
                else
                    item = { id: this.selectedItem.id, name: this.selectedItem.name, amount: this.enteredAmount, accountNumber: this.selectedItem.accountNumber, portfolioId: this.selectedItem.portfolioId }

                this.List.push(item);
            } else {
                this.List.push(this.selectedItem);
            }

            this.tradesFilterGridOptions.api.setRowData(this.List);
            this.tradesFilterGridOptions.api.sizeColumnsToFit();
            this.selectedItem = undefined;
            this.enteredAmount = undefined;
            this.clearFilterAutoComplete();
            //To maintain back button on child page
            //this.List = this.selectedModel.parentModelData.selectedAccountsList;

            // Enable/disable Next button on filter page based on selected accounts count
            if (this.List.length > 0) {
                this.disableFilterNextBtn = false;
                this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
            }
        }
    }

    /** To clear trade filters auto complete  */
    clearFilterAutoComplete() {
        if (this.tradeFilterMethod == 'portfolio')
            this.portfolioAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'sleevePortfolio')
            this.sleevePortfolioAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'account')
            this.accountsAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'model')
            this.modelAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'sleeves') /** CUSTOMIZED */
            this.sleevesAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'tradeGroupsForPortfolio') /** CUSTOMIZED */
            this.tradeGroupsPortfolioAutoCompleteComponent.selectedItem = undefined;
        else if (this.tradeFilterMethod == 'tradeGroupsForAccount') /** CUSTOMIZED */
            this.tradeGroupsAccountAutoCompleteComponent.selectedItem = undefined;
    }

    /** Set redio button default selection */
    setRadioBtnSelection() {
        if (this.tradeFilterMethod == 'portfolio') this.portfolio = 1;
        else if (this.tradeFilterMethod == 'sleevePortfolio') this.sleevePortfolio = 1;
        else if (this.tradeFilterMethod == 'account') this.account = 1;
        else if (this.tradeFilterMethod == 'model') this.model = 1;
        else if (this.tradeFilterMethod == 'sleeves') this.sleeves = 1;/** CUSTOMIZED */
        else if (this.tradeFilterMethod == 'excelImportForPf') this.excelImportForPf = 1;/** CUSTOMIZED */
        else if (this.tradeFilterMethod == 'excelImportForSlvs') this.excelImportForSlvs = 1;/** CUSTOMIZED */
        else if (this.tradeFilterMethod == 'tradeGroupsForPortfolio') this.tradeGroupsForPortfolio = 1;/** CUSTOMIZED */
        else if (this.tradeFilterMethod == 'tradeGroupsForAccount') this.tradeGroupsForAccount = 1;/** CUSTOMIZED */
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

    /** To dragFile */
    dragFile(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    /** To drop file */
    dropFile(event) {
        this.dragFileName = "";
        this.file.name = "";
        this.uploadResults.records = [];
        if (event.dataTransfer.files.length != 1) {
            this.fileUploadError = 'Only one file can be uploaded at a time.'
            this.showFiletUploadError = true;
        }
        else if (!this.isValidExcelFile(event.dataTransfer.files[0].type)) {
            this.fileUploadError = 'Only .xlsx or .csv file can be uploaded.';
            this.showFiletUploadError = true;
        }
        else {
            this.checkDragFile = true;
            this.dragFileName = event.dataTransfer.files[0].name;
            this.selectedFile(event.dataTransfer.files);
        }
        event.preventDefault();
        event.stopPropagation();
    }

    /** To select template */
    selectedTemplate(event) {
        this.uploadResults.records = [];
        this.dragFileName = "";
        this.file.name = "";
        this.checkDragFile = false;
        if (event.target.files.length > 0)
            this.selectedFile(event.target.files);
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

            // To enabling next button after file selection
            // this.disableFilterNextBtn = false;
            // this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
        }
        else {
            this.fileUploadError = 'Only .xlsx or .csv file can be uploaded.';
            this.showFiletUploadError = true;
            this.disableUploadBtn = true;
        }
    }

    /** To upload file to server */
    postFile(selectedFile) {
        if (selectedFile.name) {
            this._tradeToolsService.uploadFileTemplate(selectedFile, this.showSleevePortfolio)
                .subscribe(uploadModel => {
                    // Spend Cash:Import file validation, specific to account/sleeveportfolio
                    if (this.isSpendCash && this.isCalculateAtSleevePf) {
                        if (uploadModel.recordType == "account")
                            this.isNotValidFile = true;
                        else
                            this.isNotValidFile = false;
                    } else if (this.isSpendCash && !this.isCalculateAtSleevePf) {
                        if (uploadModel.recordType == "portfolio")
                            this.isNotValidFile = true;
                        else
                            this.isNotValidFile = false;
                    }
                    // End

                    //To enabling next button after file selection
                    if (this.isSpendCash) {
                        if (this.isNotValidFile)
                            this.disableFilterNextBtn = true;
                        else
                            this.disableFilterNextBtn = false;
                    } else {
                        this.disableFilterNextBtn = false;
                    }
                    this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });

                    if (uploadModel.recordType == "account") {
                        let invalidRecords = uploadModel.records.filter(item => (item.isValid == false));
                        invalidRecords.forEach(item => {
                            if (item.accountId == null)
                                item.id = item.accountNumber;
                            else if (item.accountNumber == null)
                                item.id = item.accountId;
                        });
                    }
                    this.uploadResults = uploadModel;
                    // console.log('upload success: ', this.uploadResults);
                },
                error => {
                    console.log('upload error : ', error);
                });
        }
    }

    /** To delete record from file upload results table */
    deleteRecord(deleteRecord) {
        this.uploadResults.records.splice(this.uploadResults.records.findIndex(x => x.id == parseInt(deleteRecord.id)), 1);
    }

    /** Fires on checkbox 'Calculate at Sleeve Portfolio' check/uncheck */
    onChkChange(event) {
        if (event.currentTarget.checked) {
            this.showSleevePortfolio = true;
            this.showAccounts = false;
            this.isSleevePortfolio = true;
            this.tradeFilterMethod = 'sleevePortfolio';
            this.setRadioBtnSelection();
            this.List = [];
            this.createColDefs();
        }
        else {
            this.showSleevePortfolio = false;
            this.showAccounts = true;
            this.isSleevePortfolio = false;
            this.tradeFilterMethod = 'account';
            this.setRadioBtnSelection();
            this.List = [];
            this.createColDefs();
        }
        this.disableFilterNextBtn = true;
        this.tradeFilterCallback.emit({ value: this.disableFilterNextBtn });
        this.enteredAmount = undefined;
        this.isNotValidFile = false;
    }

    /** To validate Amount input */
    validateAmount(event) {
        if (this.tradeFilterMethod == "sleevePortfolio") {
            if (this.enteredAmount > this.portfolioContributionItem.amount)
                this.enteredAmount = this.portfolioContributionItem.amount;
        }
    }

    /** To accept only numberic */
    amountInputkeyPress(event) {
        return (event.charCode == 8 || event.charCode == 0) ? null : event.charCode >= 48 && event.charCode <= 57;
    }

    /** To get portfolio contribution amount */
    getPortfolioContributionAmount(sleevePortfolioId: number) {
        Util.responseToObject<any>(this._portfolioService.getPortfolioContributionAmount(sleevePortfolioId))
            .subscribe(m => {
                this.portfolioContributionItem = m;
            });
    }
}