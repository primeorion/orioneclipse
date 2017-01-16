import { Component, ViewChild, HostListener } from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate } from '@angular/router';
import { Response } from '@angular/http';
import { Observable, Observer } from 'rxjs/Rx';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Dialog } from 'primeng/components/dialog/dialog';
import * as Util from '../../../core/functions';
import { BaseComponent } from '../../../core/base.component';
import { IPortfolio, IPortfolioViewModel, IAccount, IPortfolioFilters } from '../../../models/portfolio';
import { IView, IViews } from '../../../models/views';
import { AccountService } from '../../../services/account.service';
import { PortfolioService } from '../../../services/portfolio.service';
import { ITabNav, PortfolioTabNavComponent } from '../shared/portfolio.tabnav.component';
import { ISavedView, IExitWarning, SavedViewComponent } from '../../../shared/savedviews/savedview.component';
import { Accounts } from '../../../shared/accounts/assign.accounts';

@Component({
    selector: 'eclipse-portfolio-list',
    templateUrl: './app/components/portfolio/list/portfoliolist.component.html',
    directives: [AgGridNg2, PortfolioTabNavComponent, SavedViewComponent, Dialog, AutoComplete, Accounts],
    providers: [PortfolioService, AccountService]
})

export class PortfolioListComponent extends BaseComponent {
    private tabsModel: ITabNav;
    private savedView: ISavedView = <ISavedView>{};
    private portfolioGridOptions: GridOptions;
    private portfolioColumnDefs: ColDef[];
    private portfolios: IPortfolio[] = [];
    private accountsSuggestions: any[] = [];
    private portfolioSuggestions: any[] = []
    showAssignPopup: boolean;
    portfolioIds: number;

    portfolioList: any[] = [];
    portfolioTypeId: number;
    deleteCheck: boolean;
    displayConfirm: boolean;
    selectedPortfolioId: number;
    assignPortfolio: boolean;
    alteredPortfolios: IPortfolioViewModel[] = [];
    portfolioFiltersList: IPortfolioFilters[] = [];
    rowType: string;
    setFilter: boolean = false;

    /** Preparing group column def */
    groupColDef = {
        headerName: "Portfolio Description",
        field: "account.accountName",
        width: 160,
        //comparator: agGrid.defaultGroupComparator,
        cellRenderer: 'group',
        cellRendererParams: {
            suppressCount: true
        },
        filter: 'text'
    }
    /** Set grid context params  */
    gridContext = {
        isGridModified: false,
        portfolioId: 0
    }

    @ViewChild(Accounts) assignComponent: Accounts;
    @ViewChild(SavedViewComponent) savedViewComponent: SavedViewComponent;

    constructor(private _router: Router, private _portfolioService: PortfolioService, private activateRoute: ActivatedRoute) {
        super(PRIV_PORTFOLIOS);
        console.log('portfolio constructor()');
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.portfolioGridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.savedView = <ISavedView>{
            parentColumnDefs: this.portfolioColumnDefs,
            parentGridOptions: this.portfolioGridOptions,
            exitWarning: <IExitWarning>{}
        };
        this.portfolioTypeId = Util.getRouteParam<number>(this.activateRoute) || 0;
    }

    ngOnInit() {
        console.log('portfolio ngOnInit()');
        this.getPortfolioFilters();
    }

    /** To load portfolios */
    loadPortfolios() {
        this.ResponseToObjects<IPortfolio>(this._portfolioService.getPortfolios(this.portfolioTypeId))
            .subscribe(portfolios => {
                this.setPortfolios(portfolios);
                this.portfolios = this.alteredPortfolios;
                this.portfolioList = this.portfolios;
                this.portfolioGridOptions.api.collapseAll();
                this.setFilter = true;
            });
    }

    /** Preparing portfolio list with empty account array */
    setPortfolios(portfolios: IPortfolio[]) {
        this.alteredPortfolios = [];
        portfolios.forEach(element => {
            var portfolioViewModel = {
                id: 0,
                name: '',
                model: '',
                team: '',
                accounts: [],
                managedValue: 0,
                excludedValue: 0,
                totalValue: 0,
                action: '',
                tradesPending: false,
                percentDeviations: 0,
                cashReserve: 0,
                cashNeed: 0,
                cash: 0,
                cashPercent: 0,
                minCash: 0,
                minCashPercent: 0,
                totalCash: 0,
                totalCashPercent: 0,
                autoRebalanceOn: new Date(),
                OUB: false,
                contribution: 0,
                tradeBlocked: false,
                status: '',
                TLH: false,
                advisor: '',
                value: '',
                style: '',
                lastRebalancedOn: new Date(),
                isDeleted: false,
                createdOn: new Date(),
                createdBy: 0,
                editedOn: new Date(),
                editedBy: 0
            }
            portfolioViewModel.id = element.id;
            portfolioViewModel.name = element.name;
            portfolioViewModel.model = element.model;
            portfolioViewModel.team = element.team;
            portfolioViewModel.managedValue = element.managedValue;
            portfolioViewModel.excludedValue = element.excludedValue;
            portfolioViewModel.totalValue = element.totalValue;
            portfolioViewModel.action = element.action;
            portfolioViewModel.tradesPending = element.tradesPending;
            portfolioViewModel.percentDeviations = element.percentDeviations;
            portfolioViewModel.cashReserve = element.cashReserve;
            portfolioViewModel.cashNeed = element.cashNeed;
            portfolioViewModel.cash = element.cash;
            portfolioViewModel.cashPercent = element.cashPercent;
            portfolioViewModel.minCash = element.minCash;
            portfolioViewModel.minCashPercent = element.minCashPercent;
            portfolioViewModel.totalCash = element.totalCash;
            portfolioViewModel.totalCashPercent = element.totalCashPercent;
            portfolioViewModel.autoRebalanceOn = element.autoRebalanceOn;
            portfolioViewModel.OUB = element.OUB;
            portfolioViewModel.contribution = element.contribution;
            portfolioViewModel.tradeBlocked = element.tradeBlocked;
            portfolioViewModel.status = element.status;
            portfolioViewModel.TLH = element.TLH;
            portfolioViewModel.advisor = element.advisor;
            portfolioViewModel.value = element.value;
            portfolioViewModel.style = element.style;
            portfolioViewModel.lastRebalancedOn = element.lastRebalancedOn;
            portfolioViewModel.isDeleted = element.isDeleted;
            portfolioViewModel.createdOn = element.createdOn;
            portfolioViewModel.createdBy = element.createdBy;
            portfolioViewModel.editedOn = element.editedOn;
            portfolioViewModel.editedBy = element.editedBy;

            this.alteredPortfolios.push(portfolioViewModel);
        });
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.portfolioColumnDefs = [
            <ColDef>{ headerName: "Portfolio ID", field: "id", width: 100, cellClass: 'text-center', rowGroupIndex: 0, cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Description", field: "name", width: 140, cellRenderer: this.cellRenderer, hide: true },
            <ColDef>{ headerName: "Account ID", field: "account.accountId", width: 100, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Account#", field: "account.accountNumber", width: 100, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Account Type", field: "account.accountType", width: 120, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Pending Value", field: "account.pendingValue", width: 120, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Model", field: "model", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "Team", field: "team", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "Managed Value", field: "managedValue", width: 100, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Excluded Value", field: "excludedValue", width: 100, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Total Value", field: "totalValue", width: 120, cellClass: 'text-center', cellRenderer: this.formatCurrencyCellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Action", field: "action", width: 80, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "Trades Pending", field: "tradesPending", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "% Deviations", field: "percentDeviations", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Cash Reserve", field: "cashReserve", width: 100, cellClass: 'text-center', cellRenderer: this.cellRendererWithCurrencyFormat, filter: 'number' },
            <ColDef>{ headerName: "Cash Need", field: "cashNeed", width: 100, cellClass: 'text-center', cellRenderer: this.cellRendererWithCurrencyFormat, filter: 'number' },
            <ColDef>{ headerName: "Cash$", field: "cash", width: 120, cellClass: 'text-center', cellRenderer: this.cellRendererWithCurrencyFormat, filter: 'number' },
            <ColDef>{ headerName: "Cash %", field: "cashPercent", width: 80, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Min Cash $", field: "minCash", width: 80, cellClass: 'text-center', cellRenderer: this.cellRendererWithCurrencyFormat, filter: 'number' },
            <ColDef>{ headerName: "Min Cash Percent", field: "minCashPercent", width: 120, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Total Cash $", field: "totalCash", width: 100, cellClass: 'text-center', cellRenderer: this.cellRendererWithCurrencyFormat, filter: 'number' },
            <ColDef>{ headerName: "Total Cash Percent", field: "totalCashPercent", width: 120, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Type", field: "type", width: 120, cellClass: 'text-center', hide: true },
            <ColDef>{ headerName: "Auto Rebalance On", field: "autoRebalanceOn", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "OUB", field: "OUB", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "Contribution Amt", field: "contribution", width: 100, cellClass: 'text-center', cellRenderer: this.cellRendererWithCurrencyFormat, filter: 'number' },
            <ColDef>{ headerName: "Trade Blocked", field: "tradeBlocked", width: 80, cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "Status", field: "status", width: 90, cellClass: 'text-center', cellRenderer: this.statusCellRenderer },
            <ColDef>{ headerName: "TLH", field: "TLH", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Style", field: "style", width: 80, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "Last Rebalanced On", field: "lastRebalancedOn", width: 130, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "Created By", field: "createdBy", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Created On", field: "createdOn", width: 100, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' },
            <ColDef>{ headerName: "Edited By", field: "editedBy", width: 80, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'number' },
            <ColDef>{ headerName: "Edited On", field: "editedOn", width: 130, cellClass: 'text-center', cellRenderer: this.cellRenderer, filter: 'text' }
        ];
    }

    /** This event fires on row expand icon click */
    rowGroupOpened(param) {
        if (param.node.expanded) {
            let indexVal = this.findExpandedRowIndex(this.alteredPortfolios, "id", param.node.data.id);
            if (this.alteredPortfolios[indexVal].accounts.length == 0) {
                //let portfolioAccounts = this._portfolioService.getPortfolioAccounts(param.node.data.id);
                this.ResponseToObjects<IAccount>(this._portfolioService.getPortfolioAccounts(param.node.data.id))
                    .subscribe(accounts => {
                        let portfolioAccounts = accounts;
                        this.alteredPortfolios[indexVal].accounts = [];
                        portfolioAccounts.forEach(element => {
                            this.alteredPortfolios[indexVal].accounts.push(element);
                        });
                        let data = this.alterPorfolioRows(this.alteredPortfolios);
                        this.portfolioGridOptions.api.setRowData(data);
                        this.setFilter = true;
                    });
            }
        }
    }

    /** Find index of expanded row */
    findExpandedRowIndex(array, key, val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == val) {
                return i;
            }
        }
        return null;
    }

    /** To create multiple rows based accounts of a portfolio  */
    alterPorfolioRows(portfolios) {
        this.portfolioList = [];
        portfolios.forEach(element => {
            if (element.accounts != undefined && element.accounts.length > 0) {
                element.accounts.forEach(acc => {
                    var portfolio = {
                        type: 'A', // A - Row type Account 
                        id: 0,
                        name: '',
                        account: {},
                        model: '',
                        team: '',
                        managedValue: 0,
                        excludedValue: 0,
                        totalValue: 0,
                        action: '',
                        tradesPending: '',
                        percentDeviations: 0,
                        cashPercent: 0,
                        cash: 0,
                        cashReserve: 0,
                        totalCash: 0,
                        isDeleted: 0,
                        cashNeed: 0,
                        minCash: 0,
                        minCashPercent: 0,
                        totalCashPercent: 0,
                        autoRebalanceOn: new Date,
                        OUB: false,
                        contribution: 0,
                        tradeBlocked: false,
                        status: '',
                        TLH: false,
                        advisor: '',
                        value: '',
                        style: '',
                        lastRebalancedOn: new Date,
                        createdOn: new Date(),
                        createdBy: 0,
                        editedOn: new Date(),
                        editedBy: 0
                    }
                    portfolio.account = acc;
                    portfolio.id = element.id;
                    portfolio.name = element.name;
                    portfolio.model = element.model;
                    portfolio.team = element.team;
                    portfolio.managedValue = acc.managedValue;
                    portfolio.excludedValue = acc.excludedValue;
                    portfolio.totalValue = element.totalValue;
                    portfolio.action = element.action;
                    portfolio.tradesPending = element.tradesPending == true ? 'Yes' : 'No';
                    portfolio.percentDeviations = element.percentDeviations;
                    portfolio.cash = element.cash;
                    portfolio.cashReserve = element.cashReserve;
                    portfolio.totalCash = element.totalCash;
                    portfolio.cashPercent = element.cashPercent;
                    portfolio.isDeleted = element.isDeleted;

                    portfolio.cashNeed = element.cashNeed;
                    portfolio.minCash = element.minCash;
                    portfolio.minCashPercent = element.minCashPercent;
                    portfolio.totalCashPercent = element.totalCashPercent;
                    portfolio.autoRebalanceOn = element.autoRebalanceOn;
                    portfolio.OUB = element.OUB;
                    portfolio.contribution = element.contribution;
                    portfolio.tradeBlocked = element.tradeBlocked;
                    portfolio.status = element.status;
                    portfolio.TLH = element.TLH;
                    portfolio.advisor = element.advisor;
                    portfolio.value = element.value;
                    portfolio.style = element.style;
                    portfolio.lastRebalancedOn = element.lastRebalancedOn;
                    portfolio.createdBy = element.createdBy;
                    portfolio.createdOn = element.createdOn;
                    portfolio.editedBy = element.editedBy;
                    portfolio.editedOn = element.editedOn;

                    this.portfolioList.push(portfolio);
                });
            } else {
                this.portfolioList.push(element);
            }
        });
        //console.log('all alteredRows :', this.portfolioList);
        return this.portfolioList;
    }

    /** Fires on row double click */
    onRowDoubleClicked(event) {
        if (event.data.type == "P") {
            if (this.permission.canRead)
                this._router.navigate(['/eclipse/portfolio/view', event.data.id]);
            else if (this.permission.canUpdate)
                this._router.navigate(['/eclipse/portfolio/edit', event.data.id]);
        }
        else if (event.data.type == "A") {
            this._router.navigate(['/eclipse/account/view', event.data.account.accountId]);
        }
    }

    /** For group aggregation */
    private groupAggFunction(rows) {
        var value = {
            type: 'P', // P - Row type Portfolio
            id: 0,
            name: '',
            model: '',
            team: '',
            managedValue: 0,
            excludedValue: 0,
            totalValue: 0,
            action: '',
            tradesPending: '',
            percentDeviations: 0,
            cashPercent: 0,
            cash: 0,
            cashReserve: 0,
            totalCash: 0,
            isDeleted: 0,
            cashNeed: 0,
            minCash: 0,
            minCashPercent: 0,
            totalCashPercent: 0,
            autoRebalanceOn: new Date,
            OUB: false,
            contribution: 0,
            tradeBlocked: false,
            status: '',
            TLH: false,
            advisor: '',
            value: '',
            style: '',
            lastRebalancedOn: new Date,
            createdOn: new Date(),
            createdBy: 0,
            editedOn: new Date(),
            editedBy: 0
        };
        rows.forEach(function (row) {
            var data = row.data;
            value.id = parseInt(data.id);
            value.name = data.name;
            value.model = data.model;
            value.team = data.team;
            value.action = data.action;
            value.percentDeviations = data.percentDeviations;
            value.cashPercent = data.cashPercent;
            value.isDeleted = data.isDeleted;
            value.tradesPending = (data.tradesPending == true || data.tradesPending == "Yes") ? 'Yes' : 'No';
            value.managedValue += data.managedValue;
            value.excludedValue += data.excludedValue;
            value.totalValue += data.totalValue;
            value.cash = data.cash;
            value.cashReserve = data.cashReserve;
            value.totalCash = data.totalCash;

            value.cashNeed = data.cashNeed;
            value.minCash = data.minCash;
            value.minCashPercent = data.minCashPercent;
            value.totalCashPercent = data.totalCashPercent;
            value.autoRebalanceOn = data.autoRebalanceOn;
            value.OUB = data.OUB;
            value.contribution = data.contribution;
            value.tradeBlocked = data.tradeBlocked;
            value.status = data.status;
            value.TLH = data.TLH;
            value.advisor = data.advisor;
            value.value = data.value;
            value.style = data.style;
            value.lastRebalancedOn = data.lastRebalancedOn;
            value.createdBy = data.createdBy;
            value.createdOn = data.createdOn;
            value.editedBy = data.editedBy;
            value.editedOn = data.editedOn;

        });

        return value;
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
            else {
                return params.data[column];
            }
        }
    }

    /** Render conditional status cell value */
    statusCellRenderer(params) {
        let column = params.column.colId;
        column = column.indexOf('.') > 0 ? column.split('.')[1] : column;
        if (params.data.type == undefined) {
            return null;
        }
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

    /** Currency format */
    formatCurrencyCellRenderer(params) {
        if (params.data.type == undefined) return null;
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

    /** Render conditional cell value with currency format */
    cellRendererWithCurrencyFormat(params) {
        let column = params.column.colId;
        column = column.indexOf('.') > 0 ? column.split('.')[1] : column;
        if (params.data.type == "A" || params.data.type == undefined)
            return null;
        else {
            if (params.data[column] != null || params.data[column] != undefined) {
                let currencyFormat = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2
                });
                return currencyFormat.format(params.data[column]);
            }
        }
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if ((targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|input) id=')) || (targetElement.outerHTML.match('<span'))) return;
        let matches = targetElement.outerHTML.match(pattern);
        let [id = 0, deleteval = 0] = matches;
        if (targetElement.innerText === "View Portfolio") {
            this._router.navigate(['/eclipse/portfolio/view', id]);
        }
        else if (targetElement.innerText === "Edit Portfolio") {
            this._router.navigate(['/eclipse/portfolio/edit', id]);
        }
        else if (targetElement.innerText === "Delete") {
            this.deleteConfirm(id);
        }
        else if (targetElement.innerText == "Assign Portfolio") {
            let portfolios = [this.portfolioList.find(p => p.id == +id)];
            this.assignComponent.initFromPortfolio(portfolios);
            this.showAssignPopup = true;
        }
        else if (targetElement.innerText == "Edit preferences") {
            if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1)
                this._router.navigate(['/eclipse/admin/preferences/portfolio', this.tabsModel.ids.join()]);
            else
                this._router.navigate(['/eclipse/admin/preferences/portfolio', id]);
        }
        else if (targetElement.innerText == "Account Details") {
            this._router.navigate(['/eclipse/account/view', id]);
        }
        this.gridContext.portfolioId = id;
        this.portfolioGridOptions.api.forEachNode(this.checkboxSelection);
    }

    /** Select row on checkbox check  */
    checkboxSelection(node) {
        let portfolioId = node.rowModel.context.contextParams.seed.gridOptions.context.portfolioId;
        if (node.level == 0 && node.data.id == portfolioId) {
            if (node.selected)
                node.setSelected(false);
            else
                node.setSelected(true);
        }
    }

    /** Delete check based on accounts length */
    private deleteConfirm(portfolioId: number) {
        if (portfolioId == undefined || this.rowType != "P") return;
        this.responseToObject<any>(this._portfolioService.getPortfolioAccountsCountSummary(portfolioId))
            .subscribe(portfolioAccounts => {
                this.selectedPortfolioId = portfolioId;
                if (portfolioAccounts.count > 0)
                    this.deleteCheck = true;
                else
                    this.displayConfirm = true;
            });
    }

    /** Function to pass record index value to delete and make dialog to close*/
    deletePortfolio() {
        this._portfolioService.deletePortfolio(this.selectedPortfolioId).map((response: Response) => response.json())
            .subscribe(response => {
                this.refreshPortfoliosList();
                this.displayConfirm = false;
            })
    }

    /** To refresh portfolios list grid */
    refreshPortfoliosList() {
        this.selectedPortfolioId = undefined;
        this.loadPortfolios();
    }

    /** Method to display context menu on agGrid*/
    private getContextMenuItems(params) {
        let contextResult = [];
        let permission = Util.getPermission(PRIV_PORTFOLIOS);
        let selectedRows = params.api.getSelectedRows();
        if (selectedRows.length > 1) {
            if (permission.canUpdate)
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit preferences</hidden>' });
        }
        else {
            if (params.node.data.type == "P") {
                if (permission.canRead)
                    contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Portfolio</hidden>' });
                if (permission.canUpdate)
                    contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit Portfolio</hidden>' });
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit preferences</hidden>' });
                contextResult.push({ name: '<hidden id=' + params.node.data.id + ' value=' + params.node.data.Assign + '>Assign Portfolio</hidden>' });
                if (permission.canDelete) {
                    contextResult.push({
                        name: '<hidden id=' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete</hidden>',
                        disabled: (params.node.data.isDeleted == 1),
                    });
                }
            } else if (params.node.data.type == "A") {
                //let permission = Util.getPermission(PRIV_ACCOUNTS);
                contextResult = [
                    { name: '<hidden id=' + params.node.data.account.accountId + '>Account Details</hidden>' },
                ];
            }
        }
        return contextResult;
    }

    /** MultiRow selected in Accounts for Edit preferences */
    private onRowSelected(event) {
        let portfolio = <IPortfolio[]>this.portfolioGridOptions.api.getSelectedRows();
        if (portfolio.length > 1) {
            this.tabsModel.ids = portfolio.map(m => m.id);
            this.tabsModel.id = undefined;
        }
        else if (portfolio.length == 1) {
            this.tabsModel.id = portfolio[0].id;
            this.tabsModel.ids = undefined;
        }
        console.log("onRowSelected in Portfolio: ", this.tabsModel.ids);
    }

    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case "Delete":
                this.deleteConfirm(this.selectedPortfolioId);
                break;
            case "Assign":
                let portfolios = this.portfolioGridOptions.api.getSelectedRows();
                this.assignComponent.initFromPortfolio(portfolios);
                this.showAssignPopup = true;
                break;
            case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/portfolio', this.tabsModel.id || this.tabsModel.ids.join()]);
                break;
            default:
        }
        return;
    }

    /** Event fires on grid row click  */
    onRowClicked(event) {
        this.selectedPortfolioId = event.data.id;
        this.tabsModel.id = event.data.id;
        this.rowType = event.data.type;
    }

    /** Applying styles for grid row */
    getRowStyle(params) {
        if ((params.data.type == "A") && ((params.data.account.account == "100122") || (params.data.account.account == "300125")))
            return { 'color': 'yellow' }
    }

    /** Get portfolio status list */
    getPortfolioFilters() {
        this.ResponseToObjects<IPortfolioFilters>(this._portfolioService.getPortfolioFilters())
            .subscribe(portfolioStatus => {
                this.portfolioFiltersList = portfolioStatus;
            });
    }

    /** Fires on filter change */
    onFilterChange(filter) {
        this._router.navigate(['/eclipse/portfolio/filter', filter.target.value]);
    }

    /*** Display child page assign popup */
    callbackAssignPopup() {
        this.showAssignPopup = false;
        //console.log("callbackAssignPopup: ", this.showAssignPopup);
    }

    /** Calls on model update */
    private onModelUpdated() {
        console.log('on model upadte. gridContext: ', this.gridContext);
        if (this.setFilter) {
            this.setFilter = false;
            // console.log('on model upadte. setFilter: ', this.setFilter);
            this.portfolioGridOptions.api.setFilterModel(this.savedViewComponent.filterModel);
            this.gridContext.isGridModified = false;
        }
    }

    /** To deactivate component  */
    canDeactivate() {
        console.log('isGridModified from canDeactivate : ', this.portfolioGridOptions.context.isGridModified);
        if (!this.portfolioGridOptions.context.isGridModified) return Observable.of(true);
        if (this.savedViewComponent.loggedInUserViewsCount > 0)
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
            this.portfolioGridOptions.api.addGlobalListener(function (type, event) {
                if ((type.indexOf('column') >= 0) || (type.indexOf('filterModified') >= 0) || (type.indexOf('sortChanged') >= 0)) {
                    //console.log('column event type : ' + type);
                    //console.log('column event : ' + event);
                    contextParams.gridOptions.context.isGridModified = true;
                }
            });
        }
    }

}
