import { Component, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { ITabNav, AccountsTabNavComponent } from '../shared/account.tabnav.component';
import { AccountService } from '../../../services/account.service';
import {
    IAccountDetails, IAccountSimple, IAsideCashExpirationType, IAsideCash, IAsideCashAmountType, IAsideCashTransactionType, IYTDGainLossSummary, IIssuesSummary, IAccountValueSummary, IHoldingsSummary,
    IAccountAsideCash, ISummary, IModelTypes, IModelSubNode, IAccount
} from '../../../models/account';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { DatePipe } from '@angular/common';
import { DonutChartService } from '../../../services/donutchart.service';
import { GridOptions, ColDef } from 'ag-grid/main';
import { Observable, Observer } from 'rxjs/Rx';
//import { CashAmountTypeEnum, CashExpirationTypeEnum, CashTransactionTypeEnum } from '../../../libs/account.enums';
import { Accounts } from '../../../shared/accounts/assign.accounts';
import { ContextMenuModule, MenuItem } from 'primeng/primeng';

@Component({
    selector: 'eclipse-account-view',
    templateUrl: './app/components/account/view/accountview.component.html',
    providers: [AccountService, DonutChartService]
})

export class AccountViewComponent extends BaseComponent {
    private tabsModel: ITabNav;
    accountId: number;
    private asideCashGridOptions: GridOptions;
    account: IAccountDetails = <IAccountDetails>{};
    isShortTermGain: boolean;
    isLongTermGain: boolean;
    isTotalGain: boolean;
    isAccountTotalValue: boolean;
    asideCashData: any[] = [];// IAccountAsideCash[] = [];
    asideCashList: IAsideCash[] = [];
    accountSuggestions: IAccountSimple[] = [];
    accountValueModel: IHoldingsSummary[] = [];
    totalPercentage: number = 0;
    asideCash: IAccountAsideCash = <IAccountAsideCash>{};
    colorCodes: string[] = [];
    showAssignPopup: boolean;
    displayAsideCash: boolean;
    toleranceBand: boolean;
    datepicker: boolean = true;
    expirationType: boolean;
    private columnDefs: ColDef[];
    private items: any[];
    asideCashId: number;
    selectedAsideId: number;
    displayConfirm: boolean;
    cashAmount: any;
    cashType: IAsideCashAmountType[] = [];
    cashExpiration: IAsideCashExpirationType[] = [];
    cashTransaction: IAsideCashTransactionType[] = [];
    type: string = "$";
    errorTolerance: boolean;
    errorDate: boolean;


    /**sma weightings */
    private smaWeightingsGridOptions: GridOptions;
    private smaWeightingsColumnDefs: ColDef[];
    showSmaWeightingsPopup: boolean = false;
    smaWeightings: any[] = [];
    accountModelTypes: IModelTypes[] = [];
    modelSubNodes: IModelSubNode[] = [];
    selectedLevel: number = 1;
    smaList: any[] = [];
    addSMANodes: any;
    isAddRow: boolean = false;
    isDuplicateNode: boolean = false;
    noOfRowsCheck: boolean = false;
    smaTotalPercent: number = 0;
    isValidPercent: boolean = true;
    isZeroPercent: boolean = false;
    isPercentEmpty: boolean = false;
    isNodeNotSelected: boolean = false;
    rowCountCheck: boolean = false;

    /** flags for div change if any -ve values occurs for short/long terms */
    shortermflag: boolean;
    longtermflag: boolean;
    totalglflag: boolean;
    replenish: boolean;

    @ViewChild(Accounts) assignComponent: Accounts;

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _accountService: AccountService,
        private _donutChartService: DonutChartService) {
        super(PRIV_ACCOUNTS);
        this.asideCashGridOptions = <GridOptions>{};
        this.smaWeightingsGridOptions = <GridOptions>{};
        this.account = <IAccountDetails>{};
        this.account.errorAndWarnings = <IIssuesSummary>{};
        this.account.ytdGl = <IYTDGainLossSummary>{};
        this.account.accountValue = <IAccountValueSummary>{ holdings: <IHoldingsSummary[]>[] };
        this.account.summarySection = <ISummary>{};

        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';
        this.asideCash.expirationTypeId = 1;
        this.asideCash.cashAmountTypeId = 1;
        //this.asideCash.expirationValue = "1";
        //get param value when we clicked on edit account/add account
        this.accountId = Util.getRouteParam<number>(this.activateRoute);
        if (this.accountId > 0) this.tabsModel.id = this.accountId;
        // console.log("account Id from Details:", this.accountId);
        this.createColumnDefs();
        this.createSMAWeightingsColDefs();
    }

    ngOnInit() {
        if (this.accountId > 0) {
            this.getAccountDetailsById(this.accountId);
            this.onAsideCashLoad(this.accountId);
            this.getReplenish(this.accountId);
            // this.catchingMouseRightClickEvent();
            this.getAccountModelTypes();
        }

        this.getCashEpirationType();
        this.getCashTransactionType();
        this.getCashAmountType();
        this.items = [
            {
                label: '1'
            },
            { label: '2' }];
    }

    /** To Get Account details by Id */
    getAccountDetailsById(accountId: number) {
        this.responseToObject<IAccountDetails>(this._accountService.getAccountById(accountId))
            .subscribe(model => {
                this.account = model;
                this.tabsModel.isTrue = this.account.errorAndWarnings.sma;
                //console.log("is sma account: ", this.tabsModel.isTrue);
                model.accountValue.holdings.forEach((m, index) => {
                    // m.color = OrionColors[index];
                    m.color = this.getRandomColor();
                    this.colorCodes.push(m.color);
                    this.totalPercentage += m.percentage;
                });

                // console.log("AccountDetails by Id:", this.account);
                // console.log("AccountHoldings:", this.accountValueModel);

                // To display up and down arrows for short term
                this.account.ytdGl.shortTermGLStatus === "High" ? this.isShortTermGain = true : this.isShortTermGain = false;
                // To display up and down arrows forlong term
                this.account.ytdGl.longTermGLStatus === "High" ? this.isLongTermGain = true : this.isLongTermGain = false;
                // To display up and down arrows for total
                this.account.ytdGl.totalGainLossStatus === "High" ? this.isTotalGain = true : this.isTotalGain = false;

                // To display up and down arrows for account total value
                this.account.accountValue.status === "High" ? this.isAccountTotalValue = true : this.isAccountTotalValue = false;

                // CHANGE SHORT TERM AND LONG TERM div if any -ve values
                this.account.ytdGl.shortTermGL < 0 ? this.shortermflag = true : this.shortermflag = false;
                this.account.ytdGl.longTermGL < 0 ? this.longtermflag = true : this.longtermflag = false;
                this.account.ytdGl.totalGainLoss < 0 ? this.totalglflag = true : this.totalglflag = false;
                // render portfolio summary donut chart
                let data = [];
                for (var item in this.account.summarySection) {
                    if (item == "managedValue") {
                        data.push({ "label": "Managed", "value": this.account.summarySection[item], color: '#3284b5' });
                    }
                    else if (item == "excludedValue") {
                        data.push({ "label": "Excluded", "value": this.account.summarySection[item], color: '#67a4c8' });
                    }
                    else if (item == "cashReserve") {
                        data.push({ "label": "Reserve", "value": this.account.summarySection[item], color: '#4c4e9b' });
                    }
                    else if (item == "cashAvailable") {
                        data.push({ "label": "CashAvailable", "value": this.account.summarySection[item], color: '#9b9dc7' });
                    }
                    else if (item == "setAsideCash") {
                        data.push({ "label": "Set Aside Cash", "value": this.account.summarySection[item], color: '#6c6ead' });
                    }
                    // else if (item == "totalCash") {
                    //     data.push({ "label": "Reserve", "value": this.account.summarySection[item]['reserve'] });
                    //     data.push({ "label": "Cash", "value": this.account.summarySection[item]['cash'] });
                    // }
                }
                let color = ["#286598", "#3284b5", "#4c4e9b", "#9593c4"];
                let colorArray = ['#3284b5', '#67a4c8', '#4c4e9b', '#9b9dc7', '#6c6ead']
                this._donutChartService.renderDonutChart("#accountDonut", data, colorArray, "portfolio");
                this._donutChartService.renderDonutChart(".accountDonutTopHoldings", model.accountValue.holdings, this.colorCodes, "account");
                this.catchingMouseRightClickEvent();
            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** AutoComplete Search portfolios by name */
    loadAccountSuggestions(event) {
        this.ResponseToObjects<IAccountSimple>(this._accountService.searchAccountsById(event.query.toLowerCase()))
            .subscribe(model => {
                this.accountSuggestions = model;
            });
    }

    /** Fires on account select */
    onAccountSelect(params: any) {
        this._router.navigate(['/eclipse/account/search', params.id]);
    }

    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case "Assign":
                if (this.accountId == undefined) {
                    this.showAssignPopup = true;
                }
                else {
                    let account = <IAccount>{
                        id: this.account.id,
                        name: this.account.name,
                        accountNumber: this.account.accountNumber
                    }
                    this.assignComponent.initFromAccount([account]);
                    this.showAssignPopup = true;
                }
                break;
            case "PREFERENCES":
                this._router.navigate(['/eclipse/admin/preferences/account', this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
                break;
            case "AsideCash":
                this.displayAsideCash = true;
                break;
            case "SMA Weightings":
                this.showSmaWeightingsPopup = true;
                this.getSMAList();
                break;
            default:
        }
        return;
    }

    /*** Display child page assign popup */
    callbackAssignPopup() {
        this.showAssignPopup = false;
        this.displayAsideCash = false;
        // console.log("callbackAssignPopup: ", this.showAssignPopup);
    }

    /** Dropdown Change for Expiration Type */
    onExpirationChange(params) {
        this.asideCash.expirationTypeId = +params;
        if (this.asideCash.expirationTypeId == 1) {
            this.expirationType = false;
            this.toleranceBand = false;
            this.datepicker = true;
            this.asideCash.expirationValue = "";
            this.asideCash.toleranceValue = undefined;
        }
        else {
            this.asideCash.expirationValue = "1";
            this.expirationType = true;
            this.toleranceBand = true;
            this.datepicker = false;
        }
    }

    /** Dropdown Change for Expiration Transaction */
    onTransactionExpirationChange(params) {
        this.asideCash.expirationValue = params.target.value;
    }

    /** Clear the popup data */
    resetAsideCash() {
        this.datepicker = true;
        this.displayAsideCash = false;
        this.asideCash.cashAmountTypeId = 1;
        this.asideCash.expirationTypeId = 1;
        this.asideCash.cashAmount = null;
        this.asideCash.toleranceValue = null;
        this.toleranceBand = false;
        this.asideCash.description = "";
    }

    /** Aside Cash popup */
    onAsideCashClick() {
        this.displayAsideCash = true;
        this.datepicker = true;
        this.asideCash.cashAmount = null;
        this.asideCash.expirationValue = "";
        this.asideCash.toleranceValue = null;
        this.asideCash.description = ""
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Amount Type", field: "cashAmountTypeName", cellRenderer: this.cashTypeRender, width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Amount", field: "cashAmount", width: 125, cellClass: 'text-center', filter: 'number' },
            //<ColDef>{ headerName: "Description", field: "description", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Expiration Type", field: "expirationTypeName", cellRenderer: this.expirationTypeCellRenderer, width: 165, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Expiration Date", field: "expirationValue", cellRenderer: this.ExpirationDateCellRenderer, width: 145, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Expiration Transaction Type", field: "expirationValue", cellRenderer: this.expirationTransactionTypeRenderer, width: 220, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Tolerance Band", field: "toleranceValue", width: 150, cellRenderer: this.toleranceValueTypeRenderer, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Expired On Date", field: "expiredOn", cellRenderer: this.expiredOnCellRenderer, width: 180, cellClass: 'text-center', filter: 'text' },
        ]
    }

    /** Cell Rendor for Expiration Type*/
    expirationTypeCellRenderer(params) {
        return params.node.data.expirationTypeId == 1 ? 'Date' : 'Transaction';
    }

    /** To render expired on cell */
    expiredOnCellRenderer(params) {
        return Util.dateRenderer(params);
    }

    /** To render Tolerance value on cell */
    toleranceValueTypeRenderer(params) {
        return params.node.data.expirationTypeId == 2 ? params.node.data.toleranceValue : '-';
    }

    /** Cell Rendor for Expiration Date*/
    ExpirationDateCellRenderer(params) {
        if (params.node.data.expirationTypeId == 1) {
            return Util.dateRenderer(params);
        }
        else {
            return '-';
        }
    }

    /** Render Cash Type */
    cashTypeRender(params) {
        return params.data.cashAmountTypeId == 1 ? '$' : '%';
    }

    /** Cell Rendor for Expiration Transaction Type*/
    expirationTransactionTypeRenderer(params) {
        return params.node.data.expirationTypeId == 2 ? params.node.data.expirationValue : '-';
    }

    /** Get accounts */
    onAsideCashLoad(accountId: number) {
        this.ResponseToObjects<IAsideCash>(this._accountService.getAsideCash(this.accountId))
            .subscribe(model => {
                // console.log("AsideCash :", model);
                this.asideCashList = model;
                this.asideCashData = model.filter(a => a.isExpired == false);
                this.asideCashGridOptions.api.sizeColumnsToFit();
            });
    }

    /** set Aside Cash Dropdown Change  */
    asideCashAmount(params) {
        //let ddlcash = +params;
        this.asideCash.cashAmount = null;
        if (params == "2") {
            this.type = "%";
            if (this.asideCash.cashAmount != undefined && this.asideCash.cashAmount != null && this.asideCash.cashAmount > 100)
                this.asideCash.cashAmount = 100;
        }
        else
            this.type = "$";
    }

    /** validating Set Aside Cash value */
    validatePercent(event) {
        if (this.type == "%") {
            // this.test = 
            if (this.asideCash.cashAmount > 100)
                this.asideCash.cashAmount = 100;
            if (this.asideCash.toleranceValue > 100)
                this.asideCash.toleranceValue = 100;
        }
        else {
            if (this.asideCash.toleranceValue > 100)
                this.asideCash.toleranceValue = 100;
            this.asideCash.cashAmount = this.asideCash.cashAmount;
        }
    }

    /** Save Aside Cash popup data  */
    onAsideCashSave() {
        // console.log("Write data : ", JSON.stringify(this.asideCash));
        if (this.asideCash.id > 0) {
            this.asideCash.expirationTypeId = +this.asideCash.expirationTypeId;
            this.asideCash.cashAmountTypeId = +this.asideCash.cashAmountTypeId;
            // console.log('from create role: ', JSON.stringify(this.role));
            Util.responseToObject<IAccountAsideCash>(this._accountService.updateAsideCash(this.accountId, this.asideCash))
                .subscribe(model => {
                    this.displayAsideCash = false;
                    this.onAsideCashLoad(this.accountId);
                }, error => {
                    console.log("error : ", error);
                });
        }
        else {
            this.asideCash.cashAmountTypeId = +this.asideCash.cashAmountTypeId;
            this.asideCash.expirationTypeId = +this.asideCash.expirationTypeId;
            Util.responseToObject<IAccountAsideCash>(this._accountService.addAsidecash(this.accountId, this.asideCash))
                .subscribe(model => {
                    // console.log("Aside cash value: ", model);
                    this.displayAsideCash = false;
                    this.onAsideCashLoad(this.accountId);
                }, error => {
                    console.log("error : ", error);
                });
        }
    }

    /***contextMenu for grid */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|i) id=')) { return; }
        let matches = targetElement.outerHTML.match(pattern);
        let [id = 0, deleteval = 0] = matches;
        if (targetElement.innerText === "Edit") {
            let asidecash = this.asideCashGridOptions.api.getSelectedRows();
            // console.log('aside cash value: ', asidecash);
            if (asidecash == null) return;
            Util.responseToObject<any>(this._accountService.getAsideDetailsById(this.accountId, asidecash[0].id))
                .subscribe(model => {
                    this.editAsideCash(model);
                });
        }
        else if (targetElement.innerText === "Delete") {
            this.deleteConfirm(id);
        }
        if (targetElement.title === "Delete")
            this.deleteItem(+id);
    }

    /** method to display context menu on ag-grid */
    private getContextMenuItems(params) {
        let contextMenu = [];
        // console.log("params :", params);
        if (!params.node.data.isExpired) {
            contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>Edit</hidden>' });
            contextMenu.push({ name: '<hidden id =' + params.node.data.id + '>Delete</hidden>' });
        }
        return contextMenu;
    }

    /* To get Cash Expiration types */
    getCashEpirationType() {
        this.ResponseToObjects<IAsideCashExpirationType>(this._accountService.getCashExpiration())
            .subscribe(model => {
                this.cashExpiration = model;
                // console.log("cashExpirationType : ", this.cashExpiration);
            });
    }

    /** To Get Cash Transaction Type */
    getCashTransactionType() {
        this.ResponseToObjects<IAsideCashTransactionType>(this._accountService.getCashTransaction())
            .subscribe(model => {
                this.cashTransaction = model;
                // console.log("cashTransactionType : ", this.cashTransaction);
            });
    }

    /** Dropdown for Get aside Cash Amount Type */
    getCashAmountType() {
        this.ResponseToObjects<IAsideCashAmountType>(this._accountService.getCashAmountType())
            .subscribe(model => {
                this.cashType = model;
                // console.log("CashAmountType: ", this.cashType);
            })
    }

    /**Edit Perticular Row  */
    editAsideCash(asidecashdata) {
        this.displayAsideCash = true;
        // console.log("asidecashdata : ", asidecashdata);
        this.asideCash.id = asidecashdata.id;
        //this.asideCashId = asidecashdata[0].id;
        this.asideCash.cashAmount = asidecashdata.cashAmount;
        this.asideCash.cashAmountTypeId = asidecashdata.cashAmountTypeId;
        this.asideCash.expirationTypeId = asidecashdata.expirationTypeId;
        if (this.asideCash.expirationTypeId == 1) {
            this.asideCash.expirationValue = this.formatDate(asidecashdata.expirationValue);
            this.asideCash.toleranceValue = null;
            // console.log("Date Formate: ", this.asideCash.expirationValue);
        }
        else {
            this.asideCash.expirationValue = asidecashdata.expirationValue;
            // console.log("Transaction Type: ", this.asideCash.expirationValue);
        }
        this.asideCash.toleranceValue = asidecashdata.toleranceValue;
        this.asideCash.description = asidecashdata.description;
        //this.asideCash.isReplenish = false;

        if (this.asideCash.expirationTypeId != 1)
            this.toleranceBand = true;
        else
            this.toleranceBand = false;
    }

    /** Delete Conformation */
    deleteAside() {
        this.responseToObject<IAccountAsideCash>(this._accountService.deleteAsideCash(+this.accountId, +this.selectedAsideId))
            .subscribe(model => {
                this.refreshAsideCashList();
                this.displayConfirm = false;
            });
    }

    /** Refresh Aside Cash Grid */
    refreshAsideCashList() {
        this.onAsideCashLoad(this.accountId);
    }

    /** Delete seleted Record */
    private deleteConfirm(asidecashdata) {
        this.selectedAsideId = asidecashdata;
        this.displayConfirm = true;
    }

    /**Enable Save buttom when CashAmount and Date */
    enableSaveButton() {
        let setCashAmount = this.asideCash.cashAmount;
        let setAsideDate = this.asideCash.expirationValue;
        let toleranceValue = this.asideCash.toleranceValue;

        if (setCashAmount != null && setAsideDate != "")
            return true;
        else if (this.asideCash.expirationValue == "2" && setCashAmount != null && toleranceValue != null)
            return true;
        else
            return false;

    }

    /** To filter Active AsideCash */
    filterAsideGrid(all: number) {
        // to hide right side menu options
        let selectedRadioVal = all;
        selectedRadioVal = all;
        let asideCashData = (all == 0) ? this.asideCashList.filter(a => a.isExpired == false) : this.asideCashList;
        this.asideCashGridOptions.api.setRowData(asideCashData);
    }

    /** To get replenish */
    getReplenish(accountId) {
        Util.responseToObject<any>(this._accountService.getReplenish(accountId))
            .subscribe(m => {
                this.replenish = m.isReplenish;
            }, error => {
                console.log('error : ', error);
            })
    }

    /** To get text based on replenish */
    getReplenishText() {
        return this.replenish ? "OFF" : "ON";
    }

    /** To get current replenish*/
    getCurrentReplenish() {
        return this.replenish ? "ON" : "OFF";
    }

    /** To set replenish */
    setReplenish() {
        Util.responseToObject<any>(this._accountService.setReplenish(this.accountId, !this.replenish))
            .subscribe(m => {
                this.replenish = m.isReplenish;
            }, error => {
                console.log("error : ", error);
            });
    }

    /** To catch mouse right click event on Set Aside */
    catchingMouseRightClickEvent() {
        let that = this;
        $('.tile-click').contextmenu(function (e) {
            e.preventDefault();
            if ($("#context-dd-menu").css("display") == "block") {
                $("#context-dd-menu").css({
                    display: 'none',
                    top: e.offsetY,
                    left: e.offsetX
                });
            } else {
                $("#context-dd-menu").css({
                    display: 'inline-block',
                    top: e.offsetY + 20,
                    left: e.offsetX + 20
                });
            }
        });

        //Event to be fired in order to close the custom context menu
        $('.tile-click').click(function (e) {
            $("#context-dd-menu").fadeOut(200);
        });
        $('.tile-click').mouseleave(function () {
            $("#context-dd-menu").fadeOut(200);
        })
    }


    /** SMA WEIGHTINGS CODE START */

    /** To create column defs for sma weightings grid */
    createSMAWeightingsColDefs() {
        let self = this;
        this.smaWeightingsColumnDefs = [
            <ColDef>{ headerName: "", field: "id", width: 240, cellClass: 'text-center', hide: true },
            <ColDef>{
                headerName: "Node Name", field: "name", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                    return self.nodeNameCellRenderer(params, self);
                }
            },
            <ColDef>{
                headerName: "Percentage (%)", field: "percent", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                    return self.percentCellRenderer(params, self);
                }
            },
            <ColDef>{ headerName: "Delete", field: "delete", width: 162, cellClass: 'text-center', cellRenderer: this.deleteCellRenderer }
        ];
    }

    /** To get account model types  */
    getAccountModelTypes() {
        Util.responseToObjects<IModelTypes>(this._accountService.getAccountModelTypes(this.accountId))
            .subscribe(m => {
                this.accountModelTypes = m;
                // console.log('account model types : ', this.accountModelTypes);
            },
            error => {
                console.log('account model types error: ', error);
            });
    }

    /** To add row */
    addRow() {
        this.isValidPercent = true;
        this.isDuplicateNode = false;
        this.isAddRow = true;
        //To check: Number of rows should be equals to number of nodes available under the selected Level.
        this.rowCountCheck = true;
        this.getSubNodesForModel(this.selectedLevel);
    }

    /** Fires on slecet Level dropdown change */
    onSelectLevelDdlChange(selLevel) {
        this.selectedLevel = selLevel;
        this.clearErrorMessages();
        this.smaWeightings = [];
        this.getSubNodesForModel(selLevel);
    }

    /** To get exsiting sma list */
    getSMAList() {
        Util.responseToObject<any>(this._accountService.getSMAList(this.accountId))
            .subscribe(smaListModel => {
                this.smaWeightings = [];
                if (smaListModel.selectedLevelId == null) return;
                // To bind grid with existing sma list
                this.smaList = [];
                this.smaList = smaListModel;
                //If sma weighting list is zero 
                if (smaListModel.weightings.length == 0) this.getSubNodesForModel(this.selectedLevel);

                if (smaListModel.weightings.length > 0) {
                    smaListModel.weightings.forEach(element => {
                        let row = { id: element.id, subModelId: element.subModelId, name: element.subModelName, percent: element.weightPercent, modelId: element.modelId, modelDetailId: element.modelDetailId };
                        this.smaWeightings.push(row);
                        this.smaWeightingsGridOptions.api.setRowData(this.smaWeightings);
                        this.smaWeightingsGridOptions.api.sizeColumnsToFit();
                    });
                }
                this.smaTotalPercent = 0;
                this.calculateTotalPercent(this.smaWeightings);
                // console.log('this.smaList : ', this.smaList)
            },
            error => {
                console.log('error : ', error);
            });
    }

    /** To get sub nodes for model type */
    getSubNodesForModel(modelTypeId: number) {
        Util.responseToObjects<IModelSubNode>(this._accountService.getSubNodesForModel(this.accountId, modelTypeId))
            .subscribe(m => {
                this.modelSubNodes = m;
                //To check: Number of rows should be equals to number of nodes available under the selected Level.
                if (this.rowCountCheck) {
                    this.rowCountCheck = false;
                    if (this.smaWeightings.length == this.modelSubNodes.length) {
                        this.noOfRowsCheck = true;
                        return;
                    }
                    else
                        this.noOfRowsCheck = false;

                    let newRow = {};
                    this.smaWeightings.push(newRow);
                    this.smaWeightingsGridOptions.api.setRowData(this.smaWeightings);
                }
            });
    }

    /** Delete and Refresh the sma weightings ag-grid after delete performed */
    private deleteItem(index) {
        this.smaWeightingsGridOptions.rowData.splice(index, 1);
        this.smaWeightingsGridOptions.api.setRowData(this.smaWeightingsGridOptions.rowData);
        this.clearErrorMessages();
        this.smaTotalPercent = 0;
        this.calculateTotalPercent(this.smaWeightings);
    }

    /** To Save the sam weightings changes */
    onSave() {
        let nodes = [];
        if (this.noOfRowsCheck) return;

        //Clear error massages
        this.clearErrorMessages();

        //To check duplicate nodes
        let result = this.smaWeightings.filter((nd, i) => {
            return this.smaWeightings.findIndex(m => m.subModelId == nd.subModelId) == i;
        });
        if (this.smaWeightings.length != result.length) {
            this.isDuplicateNode = true; return;
        }

        // To calculate total percent and validate percentage
        if (this.smaWeightings.length > 0) {
            this.smaTotalPercent = 0;
            this.calculateTotalPercent(this.smaWeightings);
            if (this.isZeroPercent || this.isPercentEmpty) return;
            if (this.smaTotalPercent == 100) {
                this.isValidPercent = true;
            } else {
                this.isValidPercent = false; return;
            }
        }

        this.smaWeightings.forEach(element => {
            if (element.subModelId == undefined) this.isNodeNotSelected = true;
            if (element.id == undefined) {
                element.id = null;
                element.subModelId = +element.subModelId;
            }
            // nodes.push({ id: element.id, subModelId: element.subModelId, weightPercent: element.percent, modelId: +element.modelId, modelDetailId: +element.modelDetailId, levelId: +this.selectedLevel });
            nodes.push({ id: element.id, subModelId: element.subModelId, weightPercent: element.percent, modelId: +element.modelId, modelDetailId: +element.modelDetailId });
        });
        this.addSMANodes = {
            "selectedLevelId": +this.selectedLevel,
            "weightings": nodes
        };
        // console.log('save smaWeightings json input : ', JSON.stringify(this.addSMANodes));

        if (this.isNodeNotSelected) return;
        Util.responseToObjects<any>(this._accountService.updateSmaNodeDetails(this.accountId, this.addSMANodes))
            .subscribe(m => {
                this.showSmaWeightingsPopup = false;
            },
            error => {
                console.log('sma weightings  error : ', error);
            });
    }

    /**To Clear error messages */
    clearErrorMessages() {
        this.isDuplicateNode = false;
        this.noOfRowsCheck = false;
        this.isValidPercent = true;
        this.isPercentEmpty = false;
        this.isZeroPercent = false;
        this.isNodeNotSelected = false;
    }

    /** To calculate total percentage*/
    calculateTotalPercent(smaWeightingsList) {
        if (smaWeightingsList.length == 0) this.smaTotalPercent = 0;
        smaWeightingsList.forEach(element => {
            if (element.percent == 0 || element.percent == undefined) {
                this.isPercentEmpty = (element.percent == undefined) ? true : false;
                this.isZeroPercent = (element.percent == 0) ? true : false;
            }
            if (element.percent != undefined)
                this.smaTotalPercent += element.percent;
        });
    }

    /** To render node name cell */
    nodeNameCellRenderer(params, self) {
        var eCell = document.createElement('div');
        eCell.style.cssText = "height:20px;";
        var eSelect = document.createElement("select");

        let list = self.smaList;
        if (!this.isAddRow) {
            this.selectedLevel = list.selectedLevelId;
            if (list.weightings.length > 0) {
                list.weightings.forEach(function (item) {
                    var eOption = document.createElement("option");
                    eOption.setAttribute("value", item.subModelId);
                    eOption.innerHTML = item.subModelName;
                    eOption.setAttribute("modelId", item.modelId);
                    eOption.setAttribute("modelDetailId", item.modelDetailId);
                    eSelect.appendChild(eOption);
                });
            }
        } else {
            self.modelSubNodes.forEach(function (newItem) {
                var eOption = document.createElement("option");
                eOption.setAttribute("value", newItem.subModelId);
                eOption.innerHTML = newItem.subModelName;
                eOption.setAttribute("modelId", newItem.modelId);
                eOption.setAttribute("modelDetailId", newItem.modelDetailId);
                eSelect.appendChild(eOption);
            });
        }

        eSelect.value = params.data['subModelId'];
        eCell.appendChild(eSelect);
        eSelect.focus();

        eSelect.addEventListener('change', function () {
            var newValue = eSelect.value == undefined ? '' : eSelect.selectedOptions[0].textContent;
            if (newValue != '') self.isNodeNotSelected = false;
            params.data[params.colDef.field] = newValue;
            params.data['subModelId'] = eSelect.value;
            params.data['modelId'] = eSelect.selectedOptions[0].getAttribute('modelid');
            params.data['modelDetailId'] = eSelect.selectedOptions[0].getAttribute('modelDetailId');

            var updatedNodes = [];
            updatedNodes.push(params.node);
            self.smaWeightingsGridOptions.api.refreshRows(updatedNodes);
        });
        return eCell;
    }

    /** To render percentage cell */
    percentCellRenderer(params, self) {
        var eInput = document.createElement("input");
        eInput.className = "form-control grid-input";
        eInput.value = params.data[params.colDef.field] == undefined ? '' : params.data[params.colDef.field];
        eInput.addEventListener('blur', function (event) {
            self.noOfRowsCheck = false;
            self.isPercentEmpty = false;
            self.isZeroPercent = false;
            if (!self.isValidPercentage(eInput.value, self))
                eInput.value = params.data[params.colDef.field];
            else {
                params.data[params.colDef.field] = (isNaN(parseFloat(eInput.value)) ? 0 : parseFloat(parseFloat(eInput.value).toFixed(2)));
                self.smaTotalPercent = 0;
                self.calculateTotalPercent(self.smaWeightings);
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
            if (parseInt(eInput.value + event.key) > 100) {
                event.preventDefault();
                return false;
            }
        });

        return eInput;
    }

    /** To validate percentage */
    private isValidPercentage(n, self) {
        if (n >= 0 && n <= 100) {
            return true;
        }
        return false;
    }

    /** To render delete cell render */
    deleteCellRenderer(params) {
        var result = '<span>';
        result += '<i id=' + params.rowIndex + ' title="Delete" class="fa fa-times red" aria-hidden="true"></i></span>';
        return result;
    }

    /** Fires on cancel button click */
    cancelClick() {
        this.showSmaWeightingsPopup = false;
        this.isValidPercent = true;
        this.isDuplicateNode = false;
        this.noOfRowsCheck = false;
        this.smaTotalPercent = 0;
    }

    /** SMA WEIGHTINGS CODE END */
}