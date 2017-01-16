import { Component, HostListener, Input, ViewChild} from '@angular/core';
import { Router, ActivatedRoute, CanDeactivate} from '@angular/router';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import * as Util from '../../../core/functions';
import { PortfolioService } from '../../../services/portfolio.service';
import { BaseComponent } from '../../../core/base.component';
import { Observable, Observer } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { ITabNav, HoldingTabNavComponent } from '../shared/holding.tabnav.component';
import {HoldingFilterComponent } from '../shared/holding.filterby.component';
import { HoldingService } from '../../../services/holding.service';
import { AccountService } from '../../../services/account.service';
import { IHolding, IPortfolioSimpleWithReturnValue, IAccountSimpleWithReturnValue, IHoldingFilter, IHoldingWithReturnValue } from '../../../models/holding';
import { ISavedView, IExitWarning, SavedViewComponent } from '../../../shared/savedviews/savedview.component';


@Component({
    selector: 'eclipse-holding-list',
    templateUrl: './app/components/holding/list/holdinglist.component.html',
    providers: [PortfolioService, HoldingService, AccountService]
})

export class HoldingListComponent extends BaseComponent {
    private tabsModel: ITabNav;
    private holdingsList: IHolding[] = [];
    holdingvalue: string;
    selectedHoldingParam: any;
    selectedTypeId: number;
    filterType: number;
    selectedHoldingObj: any;
    selectedHoldingValue: any;
    holdingFilters: IHoldingFilter[] = [];

    private gridOptions: GridOptions;
    private columnDefs: ColDef[];
    private savedView: ISavedView = <ISavedView>{};
    setFilter: boolean = false;
    accountType:string;

    @ViewChild(SavedViewComponent) savedViewComponent: SavedViewComponent;

    /** Set grid context params  */
    gridContext = {
        isGridModified: false,
        isNone: false
    }

    constructor(private _router: Router, private activateRoute: ActivatedRoute,
        private _holdingService: HoldingService, private _accountService: AccountService, private _portfolioService: PortfolioService) {
        super(PRIV_HOLDINGS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.gridOptions = <GridOptions>{};
        this.createColumnDefs();
        this.tabsModel.type = Util.getRouteParam<string>(activateRoute, 'type');
        this.tabsModel.typeId = Util.getRouteParam<number>(activateRoute, 'tid');
        this.filterType = Util.getRouteParam<number>(activateRoute, 'fid');
        this.filterType = (this.filterType == undefined) ? 0 : this.filterType;
        this.selectedHoldingParam = this.tabsModel.type;
        this.selectedTypeId = this.tabsModel.typeId;

        this.savedView = <ISavedView>{
            parentColumnDefs: this.columnDefs,
            parentGridOptions: this.gridOptions,
            exitWarning: <IExitWarning>{}
        };
    }

    ngOnInit() {
        if (this.selectedHoldingParam != undefined && this.selectedTypeId != undefined) {
            // this.onHoldingsLoad(this.selectedHoldingParam, this.selectedTypeId, this.filterType)
            this.getNameWithvalue(this.selectedHoldingParam, this.selectedTypeId);
        }
        this.getHoldingFilters();
    }


    /** Default method for on load*/
    onHoldingsLoad(type, id, filterTypeId) {
        type = undefined ? this.selectedHoldingParam : this.selectedHoldingParam;
        id = undefined ? this.selectedTypeId : this.selectedTypeId;
        Util.responseToObjects<IHolding>(this._holdingService.getHoldings(this.selectedHoldingParam, this.selectedTypeId, this.filterType))
            .subscribe(model => {
                this.holdingsList = model;
                this.setFilter = true;
            });
    }

    /** To refresh portfolios list grid */
    refreshHoldingsList() {
        console.log('this.gridContext.isGridModified refreshPortfoliosList : ', this.gridContext.isGridModified);
        if (this.holdingsList.length > 0) {
            this.gridOptions.api.collapseAll();
            this.setFilter = true;
            if (this.savedViewComponent.model.id == 0) this.gridContext.isNone = true;
            this.gridOptions.api.setRowData(this.holdingsList);
            return;
        }
        let type; let id; let filterTypeId;
        this.onHoldingsLoad(type, id, filterTypeId);
    }

    // /** Default method for on load*/
    // onHoldingsLoadByFilters(type, id, filterTypeId) {       
    //       Util.responseToObjects<IHolding>(this._holdingService.getHoldingsByFilter(type, id, filterTypeId))
    //         .subscribe(model => {
    //             this.holdingsList = model;
    //         });
    // }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        this.columnDefs = [
            <ColDef>{ headerName: "Id", field: "id", width: 110, cellClass: 'text-center', hide: true, filter: 'number' },
            <ColDef>{ headerName: "Account Number", field: "accountNumber", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Security", field: "securityName", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Price", field: "price", width: 110, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: " # Shares", field: "shares", width: 75, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Value", field: "value", width: 125, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Pending Value", field: "pendingValue", width: 110, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Pending %", field: "pendingInPer", width: 125, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Current % ", field: "currentInPer", width: 110, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Target %", field: "targetInPer", width: 75, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Excluded", field: "excluded", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Is Cash", field: "isCash", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "In Model", field: "inModel", width: 125, cellClass: 'text-center', filter: 'text' },

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

    /**Yes no Renderer */
    yesOrNoRenderer(params) {
        let col = params.column.colId;
        let obj = params.data[col];
        return obj == true ? "Yes" : obj == false ? "No" : '';
    }

    /** Method to display context menu on agGrid*/
    private getContextMenuItems(params) {
        let contextResult = [];
        let permission = Util.getPermission(PRIV_ACCOUNTS);
        if (permission.canRead)
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Details</hidden>' });

        return contextResult;
    }

    /** Hostlistner  */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if (!targetElement.outerHTML.match('<hidden id=')) return;
        let matches = targetElement.outerHTML.match(pattern);
        let [holdingId = 0, deleteval = 0] = matches;
        if (targetElement.innerText === "View Details") {
            this._router.navigate(['/eclipse/holding/view', this.selectedHoldingParam, this.selectedTypeId, holdingId]);
        }

    }

    /** row selection event to egt selected holding id */
    private onRowSelected(event) {
        this.tabsModel.id = event.node.data.id;
    }

    /** To Get selected account/portfolio id, anme with value */
    getNameWithvalue(type, typeId) {
        Util.responseToObjects<IHoldingWithReturnValue>(this._holdingService.getHoldingSearchByAccountOrPortfolio(typeId))
            .subscribe(model => {
                let obj = model.filter(x => x.id == typeId && x.type == type.toLowerCase());
                console.log("Holding data: ", obj);
                this.selectedHoldingObj = obj[0].name + " (" + obj[0].id + ")  ";
                this.selectedHoldingValue = obj[0].value;
                this.accountType=type;

            });
    }

    /** Get Holdings filters list */
    getHoldingFilters() {
        this.ResponseToObjects<IHoldingFilter>(this._holdingService.getHoldingFilters())
            .subscribe(model => {
                this.holdingFilters = model;
            });
    }

    /** Fires on filter change */
    onFilterChange(filter) {
        this._router.navigate(['/eclipse/holding/filter/' + "list", this.selectedHoldingParam, this.selectedTypeId, filter.target.value]);

    }

    /** Calls on model update */
    private onModelUpdated() {
        console.log('on model upadte. gridContext: ', this.gridContext);
        if (this.setFilter) {
            this.setFilter = false;
            // console.log('on model upadte. setFilter: ', this.setFilter);
            if (this.savedViewComponent.model.id > 0)
                this.gridOptions.api.setFilterModel(this.savedViewComponent.filterModel);
            this.gridContext.isGridModified = false;
        }
    }

    /** To deactivate component  */
    canDeactivate() {
        console.log('isGridModified from canDeactivate : ', this.gridOptions.context.isGridModified);
        if (this.gridOptions.context != undefined) {
            if (!this.gridOptions.context.isGridModified) return Observable.of(true);
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
            this.gridOptions.api.addGlobalListener(function (type, event) {
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
