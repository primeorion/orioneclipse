import { Component, ViewChild, HostListener } from '@angular/core';
//import { FORM_DIRECTIVES, FormBuilder, Control, ControlGroup, Validators } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import { Observable, Observer } from 'rxjs/Rx';
import * as Util from '../../../core/functions';
import { ITabNav, AccountsTabNavComponent } from '../shared/account.tabnav.component';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { IAccount, IAccountCustomView, IAccountFilters } from '../../../models/account';
import { AccountService } from '../../../services/account.service';
import { Accounts } from '../../../shared/accounts/assign.accounts';
import { ISavedView, IExitWarning, SavedViewComponent } from '../../../shared/savedviews/savedview.component';
//import { AccountViewComponent } from '../../../components/account/view/accountview.component';

@Component({
    selector: 'eclipse-account-list',
    templateUrl: './app/components/account/list/accountlist.component.html',
    //directives: [AccountsTabNavComponent, AgGridNg2, Dialog, Accounts, SavedViewComponent],
    providers: [AccountService]
})

export class AccountListComponent extends BaseComponent {
    private tabsModel: ITabNav;
    private accountGridOptions: GridOptions;
    private columnDefs: ColDef[];
    private accountsData: any[] = [];
    errorMessage: string;
    customViewsList: IAccountCustomView[] = [];
    accountFilterList: IAccountFilters[] = [];
    displayViewsDialog: boolean = false;
    //private editViewGroup: ControlGroup;
    private submitCategory: boolean = false;
    makeItAsDefault: boolean;
    makeItAsPublic: boolean;
    fileterTypeId: number = 0;
    showAssignPopup: boolean;
    setFilter: boolean = false;
    accountIds: number[] = [];
    private savedView: ISavedView = <ISavedView>{};

    /** Set grid context params  */
    gridContext = {
        isGridModified: false,
        isNone: false
    }

    @ViewChild(Accounts) assignComponent: Accounts;
    @ViewChild(SavedViewComponent) savedViewComponent: SavedViewComponent;
    //@ViewChild(AccountViewComponent) accountViewComponent: AccountViewComponent;

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _accountService: AccountService) { //, private builder: FormBuilder
        super(PRIV_ACCOUNTS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.accountGridOptions = <GridOptions>{};
        this.createColumnDefs();
        //this.createSaveViewControlGroup();
        this.tabsModel.action = 'L';
        //get param value when we clicked on progress bar in dashboard page
        this.fileterTypeId = Util.getRouteParam<number>(activateRoute);
        if (this.fileterTypeId == undefined)
            this.fileterTypeId = 0;
        console.log("Filter Id from constructor:", this.fileterTypeId);

        this.savedView = <ISavedView>{
            parentColumnDefs: this.columnDefs,
            parentGridOptions: this.accountGridOptions,
            exitWarning: <IExitWarning>{}
        };
    }

    ngOnInit() {
        this.getAccountFilters();
        // if (this.accountViewComponent != undefined)
        //     this.accountsData.push(this.accountViewComponent.test);
    }

    /** Get account filters */
    getAccountFilters() {
        this.ResponseToObjects<IAccountFilters>(this._accountService.getAccountFilters())
            .subscribe(model => {
                this.accountFilterList = model;
            });
    }

    /** Get accounts */
    onAccountsLoad() {
        this.ResponseToObjects<IAccountFilters>(this._accountService.getAccounts(this.fileterTypeId))
            .subscribe(model => {
                console.log("Accounts by FilterId:", model);
                this.accountsData = model;
                this.setFilter = true;
            });
    }

    /** To refresh accounts list grid */
    refreshAccountsList() {
        if (this.accountsData.length > 0) {
            this.accountGridOptions.api.collapseAll();
            this.setFilter = true;
            if (this.savedViewComponent.model.id == 0) this.gridContext.isNone = true;
            this.accountGridOptions.api.setRowData(this.accountsData);
            return;
        }
        this.onAccountsLoad();
    }

    /** Save View As Account */
    // private createSaveViewControlGroup() {
    //     this.editViewGroup = this.builder.group({
    //         name: new Control('', Validators.required)
    //     });
    // }

    /** Fires on filter change */
    onFilterChange(filter) {
        this._router.navigate(['/eclipse/account/filter', filter.target.value]);
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Account ID", field: "accountId", width: 125, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Name", field: "name", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Account Number", field: "accountNumber", width: 150, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Account Type", field: "accountType", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Portfolio", field: "portfolio", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Custodian", field: "custodian", width: 100, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Value", field: "value", width: 125, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Managed Value", field: "managedValue", cellRenderer: this.formatCurrencyCellRenderer, width: 145, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Excluded Value", field: "excludedValue", width: 145, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Pending Value ", field: "pendingValue", width: 145, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "SSN", field: "ssn", width: 75, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Style", field: "style", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Model", field: "model", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Sleeve Type", field: "sleeveType", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Distribution Amount", field: "distributionAmount", width: 160, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Contribution Amount", field: "contributionAmount", width: 160, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Merge In", field: "mergeIn", width: 125, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Merge Out", field: "mergeOut", width: 110, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Cash Need Amount", field: "cashNeedAmount", cellRenderer: this.formatCurrencyCellRenderer, width: 160, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Cash Target %", field: "targetCashReserve", width: 140, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Target Cash Reserve", field: "targetCashReserve", width: 175, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Systematic Amount ($)", field: "systematicAmount", width: 175, cellRenderer: this.formatCurrencyCellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Systematic Date", field: "systematicDate", width: 150, cellClass: 'text-center', filter: 'number', cellRenderer: this.dateRenderer },
            <ColDef>{ headerName: "SMA", field: "sma", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Pending Trades", field: "pendingTrades", width: 160, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Created On", field: "createdOn", width: 170, cellClass: 'text-center', cellRenderer: this.dateRenderer, filter: 'text' },
            <ColDef>{ headerName: "Status", field: "status", width: 75, cellClass: 'text-center', cellRenderer: this.statusRenderer, filter: 'text' },
        ];
    }

    /** Currency format */
    formatCurrencyCellRenderer(params) {
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

    /*** renders status for row data */
    private statusRenderer(params) {
        var result = '<span>';
        if (params.value == "Ok")
            result += '<i class="material-icons text-success" title="' + params.data.reason + '" >check_circle</i>';
        else if (params.value == "Warning")
            result += ' <i class="material-icons text-erorr-warning" title="' + params.data.reason + '" >warning</i>';
        else if (params.value == "Error")
            result += '<i class="material-icons text-danger" title="' + params.data.reason + '" >cancel</i>';
        else
            return null;
        return result;
    }

    /** Open Save View As popup */
    saveViewPopup() {
        this.displayViewsDialog = true;
    }

    /**On click of save view popup  */
    saveViewAs(event, formData) {
        this.submitSaveViewAs(formData);
    }

    private submitSaveViewAs(form) {
        if (form.valid) {
            this.submitCategory = false;
        }
        else {
            this.submitCategory = true
        }
    }

    /** closed Save View  popup on click of cancel*/
    closedSaveVeiwAs(event) {
        this.submitCategory = false;
        event.target.form[0].value = null;
        this.displayViewsDialog = false;
    }

    /** Fires on row double click */
    onRowDoubleClicked(event) {
        if (this.permission.canRead)
            this._router.navigate(['/eclipse/account/view', event.data.id]);
    }

    /** Method to display context menu on agGrid*/
    private getContextMenuItems(params) {
        let permission = Util.getPermission(PRIV_ACCOUNTS);
        let contextResult = [];
        let selectedRows = params.api.getSelectedRows();
        console.log("getContextMenuItems: ", selectedRows);
        if (selectedRows.length > 1) {
            if (permission.canRead) {
                contextResult.push({ name: '<hidden id=' + params.node.data.id + 'value=' + params.node.data.Assign + '>Assign Portfolio</hidden>' });
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit Preferences</hidden>' });
            }
        }
        else {
            if (permission.canRead)
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Details</hidden>' });
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Holdings</hidden>' });
            contextResult.push({ name: '<hidden id=' + params.node.data.id + 'value=' + params.node.data.Assign + '>Assign Portfolio</hidden>' });
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit Preferences</hidden>' });
        }
        return contextResult;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|i) id=')) { return; }
        let matches = targetElement.outerHTML.match(pattern);
        let [accountId = 0, deleteval = 0] = matches;
        if (targetElement.innerText === "View Details") {
            this._router.navigate(['/eclipse/account/view', accountId]);
        }
        else if (targetElement.innerText === "View Holdings") {
            this._router.navigate(['/eclipse/holding/list', "account", accountId]);
        }
        else if (targetElement.innerText == "Assign Portfolio") {
            //let account = [this.accountsData.find(a => a.id == +accountId)];
            let account = this.accountGridOptions.api.getSelectedRows();
            this.assignComponent.initFromAccount(account);
            this.showAssignPopup = true;
        }
        else if (targetElement.innerText == "Edit Preferences") {
            if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1)
                this._router.navigate(['/eclipse/admin/preferences/account', this.tabsModel.id || this.tabsModel.ids.join()]);
            else
                this._router.navigate(['/eclipse/admin/preferences/account', accountId || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
        }
    }

    /** Event fires on grid row click  */
    onRowClicked(event) {
        this.tabsModel.id = event.data.id;
        console.log("onRowClicked: ", this.tabsModel.id);
    }

    /** MultiRow selected in Accounts for Edit preferences */
    private onRowSelected(event) {
        let account = <IAccount[]>this.accountGridOptions.api.getSelectedRows();
        if (account.length > 1) {
            this.tabsModel.ids = account.map(m => m.id);
            this.tabsModel.id = undefined;
        }
        else if (account.length == 0) {
            this.tabsModel.id = account[0].id;
            this.tabsModel.ids = undefined;
        }
        console.log("onRowSelected in Accounts: ", this.tabsModel.ids);
    }

    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case "Assign":
                let account = [];
                account = this.accountGridOptions.api.getSelectedRows();
                this.assignComponent.initFromAccount(account);
                this.showAssignPopup = true;
                console.log("show Popup: ", this.accountsData);
                break;
            case "PREFERENCES":
                this._router.navigate(['/eclipse/admin/preferences/account', this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
                break;
            case "GlobalTrades":
                if (this.tabsModel.id == undefined && this.tabsModel.ids == undefined)
                    this._router.navigate(['/eclipse/tradeorder/globaltrades']);
                else
                    this._router.navigate(['/eclipse/tradeorder/globaltrades', "account", this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
                break;
            case "TradeToTarget":
                if (this.tabsModel.id == undefined && this.tabsModel.ids == undefined)
                    this._router.navigate(['/eclipse/tradeorder/tradetotarget']);
                else
                    this._router.navigate(['/eclipse/tradeorder/tradetotarget', "account", this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
                break;
            case "TickerSwap":
                if (this.tabsModel.id == undefined && this.tabsModel.ids == undefined)
                    this._router.navigate(['/eclipse/tradeorder/tickerswap']);
                else
                    this._router.navigate(['/eclipse/tradeorder/tickerswap', "account", this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]);
                break;

            default:
        }
        return;
    }

    /*** Display child page assign popup */
    callbackAssignPopup() {
        this.showAssignPopup = false;
        console.log("callbackAssignPopup: ", this.showAssignPopup);
    }

    /** Calls on model update */
    private onModelUpdated() {
        console.log('on model upadte. gridContext: ', this.gridContext);
        if (this.setFilter) {
            this.setFilter = false;
            // console.log('on model upadte. setFilter: ', this.setFilter);
            if (this.savedViewComponent.model.id > 0)
                this.accountGridOptions.api.setFilterModel(this.savedViewComponent.filterModel);
            this.gridContext.isGridModified = false;
        }
    }

    /** To deactivate component  */
    canDeactivate() {
        console.log('isGridModified from canDeactivate : ', this.accountGridOptions.context.isGridModified);
        if (this.accountGridOptions.context != undefined) {
            if (!this.accountGridOptions.context.isGridModified) return Observable.of(true);
        }
        if (this.savedViewComponent.loggedInUserViewsCount > 0 && this.savedViewComponent.model.id > 0)
            this.savedViewComponent.displayUpdateConfirmDialog = true;
        else
            this.savedView.exitWarning.show = true;
        return new Observable<boolean>((sender: Observer<boolean>) => {
            this.savedView.exitWarning.observer = sender;
        });
    }

    /** Grid has initialised  */
    onGridReady(params) {
        if (params.api) {
            let contextParams = params.api.context.contextParams.seed;
            console.log("onGridReady: ", contextParams);
            this.accountGridOptions.api.addGlobalListener(function (type, event) {
                if ((type.indexOf('column') >= 0) || (type.indexOf('filterModified') >= 0) || (type.indexOf('sortChanged') >= 0)) {
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

}