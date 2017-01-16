import { Component, ViewChild, HostListener, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Observable, Observer } from 'rxjs/Rx';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef, CsvExportParams, MenuList, MenuItem } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Dialog } from 'primeng/components/dialog/dialog';
import { BaseComponent } from '../../../core/base.component';
import { NotificationService } from '../../../core/customSubService';
import * as Util from '../../../core/functions';
import { TradeOrderTabNavComponent } from '../../tradeorder/shared/tradeorder.tabnav.component';
import { ISavedView, IExitWarning, SavedViewComponent } from '../../../shared/savedviews/savedview.component';
import { TomService } from '../../../services/tom.service';
import { ITradeOrder, IIdName, ISecurity, IPatchTradeOrder, ITradeOrderImport } from '../../../models/tom';
import { ITabNav } from '../shared/tradeorder.tabnav.component';
import { PortfolioAutoCompleteComponent } from '../../../shared/search/portfolio.autocomplete.component';
import { TacticalTradesPopupComponent } from "../../tradeorder/shared/tacticaltradespopup.component";
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { DateRendererComponent } from '../../../core/date.renderer.component';
declare var $: JQueryStatic;

@Component({
    selector: 'eclipse-tradeorder-list',
    templateUrl: './app/components/tradeorder/list/tradeorderlist.component.html'
})

export class TradeOrderListComponent extends BaseComponent {
    @ViewChild(TacticalTradesPopupComponent) taticalPopup: TacticalTradesPopupComponent;
    private tabsModel: ITabNav;
    private tradeOrderGridOptions: GridOptions;
    private grid
    private columnDefs: ColDef[];
    private tradeOrderData: ITradeOrder[] = [];
    private tradeOrder: ITradeOrder;
    private editOrder: ITradeOrder = <ITradeOrder>{};
    fileterTypeId: number = 0;
    private savedView: ISavedView = <ISavedView>{};
    setFilter: boolean = false;
    displayConfirm: boolean = false;
    displayDeletedInfo: boolean = false;
    deletedOrders: number = 0;
    selectedOrders: number = 0;
    actionType: string;
    isLimitPrice: boolean = false;
    isStopPrice: boolean = false;
    approvalMenu: IIdName[];
    displayEditOrder: boolean;
    addSecurtyPopup: boolean = false;
    private isExpanded = false;
    private selectedRpTab: string = "QT";
    private tabRpMT: string = "MT";
    private tabRpMA: string = "MA";
    /** Set grid context params  */
    gridContext = {
        isGridModified: false,
        tabAction: 'L',
        router: undefined
    }
    /** edit order */
    private orderTypes: any[] = [];
    private actionTypes: any[] = [];
    private qualifiers: any[] = [];
    private durations: any[] = []
    private tradeid: number;
    private showFileUpload: boolean = true;
    private fileName: string;
    private tradeOrders: ITradeOrderImport[] = [];
    private fileUploadError: string;
    private showFiletUploadError: boolean = false
    private file: File;
    private settelmentTypes: any[] = [];
    private messageDailog: boolean = false;
    private tradeOrderMessages: any[] = [];
    private messageShortcodes: any[] = [];
    private shortCodes: string;
    refreshSubscription: any;
    private disableUploadBtn: boolean = true;
    private checkDragFile: boolean = false;
    private dragFileName: string;
    private isPending: boolean = false;
    private disableTrade: boolean = true;
    private editOrderTitle: string;
    @ViewChild(SavedViewComponent) savedViewComponent: SavedViewComponent;

    constructor(private _router: Router, private activatedRoute: ActivatedRoute,
        private builder: FormBuilder, private _tomService: TomService,
        private _notifier: NotificationService) {
        super(PRIV_APPROVELEVEL1);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.activeRoute = Util.activeRoute(activatedRoute);
        if (this.activeRoute == 'awaiting') {
            this.tabsModel.action = 'LA';
            this.gridContext.tabAction = 'LA';
        }
        this.gridContext.router = this._router;
        this.tradeOrderGridOptions = <GridOptions>{};
        this.createColumnDefs();
        //get param value when we clicked on progress bar in dashboard page
        this.fileterTypeId = Util.getRouteParam<number>(activatedRoute);
        if (this.fileterTypeId == undefined)
            this.fileterTypeId = 0;
        // console.log("Filter Id from constructor:", this.fileterTypeId);
        this.savedView = <ISavedView>{
            parentColumnDefs: this.columnDefs,
            parentGridOptions: this.tradeOrderGridOptions,
            exitWarning: <IExitWarning>{}
        };
        this.tradeid = Util.getRouteParam<number>(this.activatedRoute);
        this.editOrder.orderType = <IIdName>{};
        this.editOrder.duration = <IIdName>{};
        this.editOrder.action = <IIdName>{};
        this.editOrder.qualifier = <IIdName>{};
        this.editOrder.security = <ISecurity>{};
        this.isExpanded = this._sessionHelper.get<boolean>('TOMRPExpanded');
        // to emit orders data on selection of model analysis Portfolio
        this.refreshSubscription = this._notifier.ordersNotify.subscribe((data: any) => {
            // refresh the grid from quick trade add
            if (data.action == "Refresh") {
                this.refreshgrid();
            }
            this.ResponseToObjects<ITradeOrder>(this._tomService.getOrdersForPortfolio(data.id))
                .subscribe(trades => {
                    this.tradeOrderData = trades;
                    //console.log(trades);            
                });
        });
    }

    ngOnInit() {
        this.getTrades();
        // this.getDurations();
        this.getOrderTypes();
        this.getTradeActions();
        this.getQualifiers();
        this.getDurations();
        this.getSettlementTypes();

    }

    onRightPanelExpand() {
        this.isExpanded = !this.isExpanded;
        this._sessionHelper.set('TOMRPExpanded', this.isExpanded);
        this.hideShowRightPanel();
        if (this.isExpanded) {
            this.notifyRightPanelMT();
            this.notifyRightPanelMA();
        }
    }

    onRightPanelTabChange(tabName) {
        this.selectedRpTab = tabName;
        if (this.selectedRpTab == 'EI') {
            this.disableTrade = true;
            document.getElementById('model-file')['value'] = null;
            this.showFileUpload = true;
            this.showFiletUploadError = false;
            this.fileName = "";
        }
        if (this.isExpanded) {
            this.notifyRightPanelMT();
            this.notifyRightPanelMA();
        }
    }

    notifyRightPanelMT() {
        // console.log('notifyRightPanelMT():- isExpanded: ' + this.isExpanded + '; selected Tab: ', this.selectedRpTab);
        if (this.selectedRpTab == this.tabRpMT) {           
            this._notifier.tomRightPanelMT.emit(this.tradeOrder);
        }
    }

    notifyRightPanelMA() {
        //  console.log('notifyRightPanelMA():- isExpanded: ' + this.isExpanded + '; selected Tab: ', this.selectedRpTab);
        if (this.isExpanded && this.selectedRpTab == this.tabRpMA) {
            this._notifier.tomRightPanelMA.emit({ tradeIds: this.tradeOrderData.map(m => m.id) });
        }
    }

    refreshgrid() {
        this.getTrades();
        this.tradeOrder = undefined;
        this.notifyRightPanelMT();
    }

    /** Get account filters */
    getTrades() {
        let serviceToExecute = (this.tabsModel.action == 'LA')
            ? this._tomService.getAwaitingAcceptenceTrades()
            : this._tomService.getTradeOrders();
        this._notifier.notify.emit({ type: "ORDERS" });
        this.ResponseToObjects<ITradeOrder>(serviceToExecute)
            .subscribe(trades => {
                this.tradeOrderData = trades;
                this.setFilter = true;
                this.notifyRightPanelMA();
            });
    }

    /** Fires on filter change */
    onFilterChange(filter) {
        this._router.navigate(['/eclipse/account/filter', filter.target.value]);
    }

    /** Create column headers for agGrid */
    private createColumnDefs() {
        let permission = Util.getPermission(PRIV_APPROVELEVEL1);
        let editPermission = Util.getPermission(PRIV_ORDEDIT);
        this.columnDefs = [
            <ColDef>{ headerName: "ID", field: "id", width: 75, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Enabled", field: "isEnabled", width: 110, cellRenderer: this.statusRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Number", field: "account.number", width: 110, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Account Id", field: "account.accountId", width: 125, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Portfolio Name", field: "portfolio.name", width: 75, cellClass: 'text-center', filter: 'text' },
            <ColDef>{
                headerName: "Messages", field: "shortCodeMessages", cellRenderer: this.messageRenderer, width: 75, cellClass: 'text-center', filter: 'text'
            },
            // <ColDef>{ headerName: "Severity ", field: "", width: 75, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Action", field: "action", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Order Qty", field: "orderQty", width: 110, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Ticker", field: "security.symbol", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Security", field: "security.name", width: 110, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Order Percent", field: "orderPercent", width: 75, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "CashValue Post Trade", field: "cashValuePostTrade", cellRenderer: this.formatCurrencyCellRenderer, width: 125, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Est Amount", field: "estimateAmmount", cellRenderer: this.formatCurrencyCellRenderer, width: 110, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "Order Type", field: "orderType.name", width: 125, cellClass: 'text-center', filter: 'text' },
            <ColDef>{ headerName: "Price", field: "price", width: 110, cellRenderer: this.formatCurrencyCellRenderer, cellClass: 'text-center', filter: 'number' },
            <ColDef>{ headerName: "CreatedDate", field: "createdDate", cellRenderer: this.dateAndTimeRenderer, width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "CreatedBy", field: "createdBy", width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Securitytype", field: "security.securityType", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Instance Description", field: "instanceDescription", width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "trading Instructions", field: "tradingInstructions", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Custodian", field: "custodian", width: 75, cellClass: 'text-center' },
            <ColDef>{
                headerName: "Hold Until", field: "holduntil", cellRenderer: this.dateAndTimeRenderer, editable: editPermission.canRead == true,
                width: 75, cellClass: 'text-center',
                cellEditor: 'richSelect',
                cellEditorFramework: {
                    component: DateRendererComponent,
                    moduleImports: [FormsModule, CalendarModule]
                }

            },
            <ColDef>{ headerName: "Account Value", field: "account.value", cellRenderer: this.formatCurrencyCellRenderer, width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Account Type", field: "account.type", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Allocation Status", field: "allocationStatus.name", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Approval Status", field: "approvalStatus.name", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Holding ID", field: "holding.id", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Holding Units", field: "holding.units", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Block ID", field: "blockId", width: 75, cellClass: 'text-center' },
            // <ColDef>{ headerName: "Calculation Method", field: "calculationMethod", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Cash Value", field: "cashValue", cellRenderer: this.formatCurrencyCellRenderer, width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Current Model Name", field: "model.name", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Days Until Long Term", field: "daysUntilLongTerm", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Edited By", field: "editedBy", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Edited Date", field: "editedDate", width: 75, cellRenderer: this.dateAndTimeRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Exec Inst", field: "execInst", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Expire Time", field: "expireTime", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Full Sett Date", field: "fullSetDate", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Gain Loss Message", field: "gainLossMessage", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Handl Inst", field: "handlInst", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Has Block", field: "hasBlock", width: 75, cellRenderer: this.statusRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Instance ID", field: "instanceId", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Instance Notes", field: "instanceNotes", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Discretionary", field: "isDiscretionary", width: 75, cellRenderer: this.statusRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Locate Reqd", field: "locateReqd", cellRenderer: this.locateRenderer, width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Long Term Gain", field: "longTermGain", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Management Style ", field: "managementStyle", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Master Account Number ", field: "masterAccountNumber", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Market Value", field: "marketValue", cellRenderer: this.formatCurrencyCellRenderer, width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Model", field: "", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Notes", field: "notes", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Order Status", field: "orderStatus.name", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Original Order Qty", field: "originalOrderQty", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Security ID", field: "security.id", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Qualified", field: "isQualified", width: 75, cellRenderer: this.statusRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Rebalance Level", field: "rebalanceLevel.name", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Reinvest Dividends", field: "reinvestDividends", width: 75, cellRenderer: this.statusRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Reinvest Long Term Gains", field: "reinvestLongTermGains", width: 75, cellRenderer: this.statusRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Reinvest Short Term Gains", field: "shortTermGain", width: 75, cellRenderer: this.statusRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Row Version", field: "rowVersion", width: 75, cellClass: 'text-center' },
            <ColDef>{
                headerName: "Settlement Type", field: "settlementType.name", editable: editPermission.canRead == true, width: 75, cellClass: 'text-center',
                cellEditor: 'richSelect',
                cellEditorParams: {
                    values: this.settelmentTypes
                }
            },
            <ColDef>{ headerName: "Pending Units", field: "pendingUnits", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Short Term Gain", field: "totalGain", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Stop Price", field: "stopPrice", cellRenderer: this.formatCurrencyCellRenderer, width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Time in Force", field: "timeInForce", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Total Gain", field: "totalGain", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Trade % of Account", field: "tradePercentOfAccount", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Transaction ID", field: "transactionId", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Wash Amount", field: "washAmount", cellRenderer: this.formatCurrencyCellRenderer, width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Wash Units", field: "washUnits", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Asset Class Name", field: "assetClassName", width: 75, cellClass: 'text-center' },
            <ColDef>{
                headerName: "Client Directed", field: "clientDirect", width: 75, editable: editPermission.canRead == true, cellRenderer: this.statusRendererforClientRedirect, cellClass: 'text-center',
                cellEditor: 'richSelect',
                cellEditorParams: {
                    // cellRenderer: this.statusRenderer,
                    values: ['true', 'false']
                }
            },
            <ColDef>{ headerName: "Min Cash Balance", field: "minimmCashBalance", cellRenderer: this.formatCurrencyCellRenderer, width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Rep Notes", field: "repNotes", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Representative Name: ", field: "representativeName", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: "Solicited: ", field: "isSolicited", width: 75, cellRenderer: this.statusRenderer, cellClass: 'text-center' }
        ];
    }

    private statusRenderer(params) {

        var result = '<span>';
        if (params.value == 1)
            result += '<i class="fa fa-check-circle text-success"></i>';
        else if (params.value == 0)
            result += '';
        else
            return null;
        return result + '</span>';
    }

    private statusRendererforClientRedirect(params) {
        var val = params.value;
        if (params.value != 1)
            val = (params.value == "true" ? 1 : 0);
        var result = '<span>';
        if (val == 1)
            result += '<i class="fa fa-check-circle text-success"></i>';
        else if (params.value == 0)
            result += '';
        else
            return null;
        return result + '</span>';
    }

    private locateRenderer(params) {
        var result = '<span>';
        if (params.value == 0)
            result += '';

        return result + '</span>';

    }
    // to render popup on message column
    private messageRenderer(params) {
        var val = ""
        if (params.value != null || params.value != undefined)
            val = params.value;
        else
            val = "";
        // var result = '<span>';
        var result = '<a id=' + params.data.id + ' class="text-gray"  value =' + val + ' title="message render" > ' + val + '</a>';
        return result;
    }

    /** Fires on row double click */
    onRowDoubleClicked(event) {
        if (this.permission.canUpdate)
            this._router.navigate(['/eclipse/tradeorder/edit', event.data.id]);
    }

    /** Event fires on grid row click */
    onRowClicked(event) {
        this.tabsModel.id = event.data.id;
        // console.log("onRowClicked: ", this.tabsModel.id);
    }

    /** MultiRow selected in Accounts for Edit preferences */
    private onRowSelected(event) {
        let tradeOrders = <ITradeOrder[]>this.tradeOrderGridOptions.api.getSelectedRows();
        this.tabsModel.id = undefined;
        this.tabsModel.ids = undefined;
        this.tradeOrder = undefined;
        if (tradeOrders.length > 1) {
            this.tabsModel.ids = tradeOrders.map(m => m.id);
        }
        else if (tradeOrders.length == 1) {
            this.tradeOrder = tradeOrders[0];
            this.tabsModel.id = this.tradeOrder.id;
            this.tabsModel.modelId = this.tradeOrder.model.id;
            this.notifyRightPanelMT();
        }
        // console.log("onRowSelected in tradeOrders: ", tradeOrders);
    }

    /** Hostlistner */
    @HostListener('click', ['$event.target'])
    public onClick(targetElement) {
        let pattern = /[0-9]+/g;
        if ((targetElement.id == "" || !targetElement.outerHTML.match('<(hidden|input|a) id=')) || (targetElement.outerHTML.match('<span'))) return;
        let matches = targetElement.outerHTML.match(pattern);
        let [id = 0, val = 0] = matches;
        if (this.gridContext.tabAction == 'LA') {
            if (targetElement.innerText === "View Blocks") {
                // this._router.navigate(['/eclipse/tradeorder/viewblocks', id]);
            } else if (targetElement.innerText === "Refresh Grid") {
                // this.refreshgrid();
            } else if (targetElement.innerText === "Export to Excel") {
                this.exportToExcel();
            } else if (targetElement.innerText === "Delete Selected") {
                // this.showConfirm("Delete");
                this.deleteOrders();
            }
            return;
        }
        if (targetElement.innerText === "View Instance") {
            // this._router.navigate(['/eclipse/tradeorder/viewinstances', id]);
        } else if (targetElement.innerText === "Edit Order") {
            this.getTradeDetails(targetElement.id);
            this.displayEditOrder = true;

            // this._router.navigate(['/eclipse/tradeorder/edit',targetElement.id]);
        } else if (targetElement.innerText === "Process Selected") {
            // this.showConfirm("Process");
            this.processOrders();
        } else if (targetElement.innerText === "Enable Selected") {
            //this.showConfirm("Enable");
            this.enableOrders();
        } else if (targetElement.innerText === "Disable Selected") {
            // this.showConfirm("Disable");
            this.disableOrders();
        } else if (targetElement.innerText === "Delete Selected") {
            this.deleteOrders();
        } else if (targetElement.innerText === "Delete Zero Qty Orders") {
            // this.showConfirm("DeleteZeroQty");
            this.deleteZeroQuantityOrders();
        } else if (["Approved", "Level 1 Approved", "Level 2 Approved", "Not Approved", "Pending Approval"].indexOf(targetElement.innerText) == 0 || ["Approved", "Level 1 Approved", "Level 2 Approved", "Not Approved", "Pending Approval"].indexOf(targetElement.innerText) == 1 || ["Approved", "Level 1 Approved", "Level 2 Approved", "Not Approved", "Pending Approval"].indexOf(targetElement.innerText) == 2) {
            this.setApprovalStatus(id);
        }
        else if (["Approved", "Level 1 Approved", "Level 2 Approved", "Not Approved", "Pending Approval"].indexOf(targetElement.innerText) == 3) {
            this.setApprovalStatus(id);
        }
        else if (["Approved", "Level 1 Approved", "Level 2 Approved", "Not Approved", "Pending Approval"].indexOf(targetElement.innerText) == 4) {
            this.setApprovalStatus(id);
        } else if (targetElement.innerText == "Load Accounts in Tactical") {
            // if (this.tabsModel.ids != undefined && this.tabsModel.ids.length > 1)
            // this._router.navigate(['/eclipse/tradeorder/tactical', this.tabsModel.ids.join()]);
        }

        if (targetElement.title == "message render") {
            // alert(targetElement.id);
            this.getTradeOrderMessages(targetElement.id);

        }
    }

    /** Method to display context menu on agGrid*/
    private getContextMenuItems(params) {
        let contextResult = [];
        let permission = Util.getPermission(PRIV_APPROVELEVEL1);
        let selectedRows = params.api.getSelectedRows();
        let clickedCell = selectedRows.find(s => s.id == params.node.data.id);
        if (clickedCell == undefined) return;
        let context = params.context;
        /** right clck menu for awaiting acceptance orders list */
        if (params.context != undefined && params.context.tabAction == 'LA') {
            if (permission.canRead) {
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Blocks</hidden>', icon: '<i class="fa fa-arrow-circle-o-left" aria-hidden="true"></i>' });
                contextResult.push('separator');
            }
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Refresh Grid</hidden>', icon: '<i class="fa fa-refresh" aria-hidden="true"></i>' });
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Export to Excel</hidden>', icon: '<i class="fa fa-file-excel-o" aria-hidden="true"></i>' });
            if (permission.canDelete) {
                contextResult.push('separator');
                contextResult.push({
                    name: '<hidden id=' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete Selected</hidden>',
                    disabled: (params.node.data.isDeleted == 1), icon: '<i class="fa fa-times" aria-hidden="true"></i>'
                });
            }
            return contextResult;
        }
        let executePermission = Util.getPermission(PRIV_ORDEXEC);
        /** right clck menu for trade orders list */
        if (selectedRows.length == 1) {
            if (permission.canRead) {
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>View Instance</hidden>', icon: '<i class="fa fa-list" aria-hidden="true"></i>' });
            }
            if (permission.canUpdate) {
                contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Edit Order</hidden>', icon: '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>' });
                contextResult.push('separator');
            }
        }
        /** check whether the user have Orders - Execution privilege */
        if (executePermission.canRead)
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Process Selected</hidden>', icon: '<i class="fa fa-retweet" aria-hidden="true"></i>' });
        if (permission.canUpdate) {
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Enable Selected</hidden>', icon: '<i class="fa fa-thumbs-o-up" aria-hidden="true"></i>' });
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Disable Selected</hidden>', icon: '<i class="fa fa-thumbs-o-down" aria-hidden="true"></i>' });
        }
        if (permission.canDelete) {
            contextResult.push({
                name: '<hidden id=' + params.node.data.id + ' value=' + params.node.data.isDeleted + '>Delete Selected</hidden>',
                disabled: (params.node.data.isDeleted == 1), icon: '<i class="fa fa-times" aria-hidden="true"></i>'
            });
        }
        if (permission.canDelete)
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Delete Zero Qty Orders</hidden>', icon: '<i class="fa fa-trash-o" aria-hidden="true"></i>' });
        contextResult.push('separator');
        if (permission.canUpdate) {
            contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Set Approval Status</hidden>', icon: '<i class="fa fa-check-square-o" aria-hidden="true"></i>' });
            contextResult.push(<MenuItem>{ name: '<hidden id=' + "1" + '>Approved</hidden>' });
            contextResult.push(<MenuItem>{ name: '<hidden id=' + "1" + '>Level 1 Approved</hidden>' });
            contextResult.push(<MenuItem>{ name: '<hidden id=' + "1" + '>Level 2 Approved</hidden>' });
            contextResult.push(<MenuItem>{ name: '<hidden id=' + "2" + '>Not Approved</hidden>' });
            contextResult.push(<MenuItem>{ name: '<hidden id=' + "3" + '>Pending Approval</hidden>' });
        }
        contextResult.push({ name: '<hidden id=' + params.node.data.id + '>Load Accounts in Tactical</hidden>', action: function () { context.router.navigate(['/eclipse/tradeorder/tactical']); }, icon: '&nbsp;<i class="fa fa-bolt" aria-hidden="true"></i>' });
        return contextResult;
    }

    /** Calls on model update */
    private onModelUpdated() {
        // console.log('on model upadte. gridContext: ', this.gridContext);
        if (this.setFilter) {
            this.setFilter = false;
            // console.log('on model upadte. setFilter: ', this.setFilter);
            if (this.savedViewComponent.model.id > 0)
                this.tradeOrderGridOptions.api.setFilterModel(this.savedViewComponent.filterModel);
            this.gridContext.isGridModified = false;
        }
    }

    /** To deactivate component  */
    canDeactivate() {
        if (this.tradeOrderGridOptions.context != undefined) {
            if (!this.tradeOrderGridOptions.context.isGridModified) return Observable.of(true);
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
            this.tradeOrderGridOptions.api.addGlobalListener(function (type, event) {
                if ((type.indexOf('column') >= 0) || (type.indexOf('filterModified') >= 0) || (type.indexOf('sortChanged') >= 0)) {
                    contextParams.gridOptions.context.isGridModified = true;
                }
            });
        }
    }

    showConfirm(event) {
        this.displayConfirm = true;
        this.actionType = event;
    }

    showMessagePopUp() {
        this.messageDailog = true;

    }

    callbackAssignPopup() {
        this.displayEditOrder = false;
        // console.log("callbackAssignPopup: ", this.showAssignPopup);
    }

    /** Action menu calls */
    DoAction(event) {
        switch (event) {
            case undefined:
                break;
            case "Process":
            case 'Enable':
            case "Disable":
            case "Delete":
            case "DeleteZeroQty":
            case "ProcessAll":
            case 'EnableAll':
            case "DisableAll":
            case "DeleteAll":
            case "DeleteAllZeroQty":
                this.showConfirm(event);
                return;
            case "Refresh":
                this.refreshgrid();
                return;
            case "Export":
                this.exportToExcel();
                return;
            case "TacticalTool":
                this.addSecurtyPopup = true;
                return;
        }
        switch (this.actionType) {
            case "Process":
                this.processOrders();
                break;
            case "ProcessAll":
                this.processOrders(true);
                break;
            case 'Enable':
                this.enableOrders();
                break;
            case 'EnableAll':
                this.enableOrders(true);
                break;
            case "Disable":
                this.disableOrders();
                break;
            case "DisableAll":
                this.disableOrders(true);
                break;
            case "Delete":
                this.deleteOrders();
                break;
            case "DeleteAll":
                this.deleteOrders(true);
                break;
            case "DeleteZeroQty":
                this.deleteZeroQuantityOrders();
                break;
            case "DeleteAllZeroQty":
                this.deleteZeroQuantityOrders(true);
                break;
        }
    }

    private getTradeIds() {
        if (this.tabsModel.ids != undefined)
            return this.tabsModel.ids
        else if (this.tabsModel.id != undefined)
            return [this.tabsModel.id];
        else
            return [];
    }

    processOrders(all: boolean = false) {
        let tradeIds = all ? [] : { 'tradeIds': this.getTradeIds() };
        Util.responseToObjects<any>(this._tomService.processTradeOrders(tradeIds))
            .subscribe(model => {
                this.refreshgrid();
            },
            error => {
                console.log(error)
                console.log(error.message);
            });
    }

    enableOrders(all: boolean = false) {
        let tradeIds = all ? [] : { 'tradeIds': this.getTradeIds() };
        Util.responseToObjects<any>(this._tomService.enableTradeOrders(tradeIds))
            .subscribe(model => {
                this.refreshgrid();
            },
            error => {
                console.log(error)
            });
    }

    disableOrders(all: boolean = false) {
        let tradeIds = all ? [] : { 'tradeIds': this.getTradeIds() };
        Util.responseToObjects<any>(this._tomService.disableTradeOrders(tradeIds))
            .subscribe(model => {
                this.refreshgrid();
            },
            error => {
                console.log(error)
            });
    }

    deleteOrders(all: boolean = false) {
        if (all) {
            Util.responseToObjects<any>(this._tomService.deleteTradeOrders())
                .subscribe(model => {
                    this.refreshgrid();
                },
                error => {
                    console.log(error)
                });
        } else {
            let tradeIds = this.getTradeIds();
            if (tradeIds.length == 1) {
                this.deleteTradeOrder(tradeIds[0]);
            } else if (tradeIds.length > 1) {
                let forkJoinData = [];
                tradeIds.forEach(id => {
                    forkJoinData.push(this.responseToObject<any>(this._tomService.deleteTradeOrder(id)));
                });
                // execute all requests one by one
                Observable.forkJoin(forkJoinData)
                    .subscribe((data: any) => {
                        this.refreshgrid();
                    });
            }
        }
    }

    /** Delete trade order by id */
    deleteTradeOrder(id) {
        Util.responseToObjects<any>(this._tomService.deleteTradeOrder(id))
            .subscribe(model => {
                this.refreshgrid();
            },
            error => {
                console.log(error)
            });
    }

    deleteZeroQuantityOrders(all: boolean = false) {
        if (all) {
            Util.responseToObjects<any>(this._tomService.deleteZeroQuantityTradeOrders())
                .subscribe(model => {
                    this.refreshgrid();
                },
                error => {
                    console.log(error)
                });
        } else {
            let tradeIds = this.getTradeIds();
            if (tradeIds.length == 1) {
                this.deleteTradeOrder(tradeIds[0]);
            } else if (tradeIds.length > 1) {
                this.deleteTradeOrders();
            }
        }
    }

    /** Delete selected trade orders */
    deleteTradeOrders() {
        let tradeOrders = <ITradeOrder[]>this.tradeOrderGridOptions.api.getSelectedRows();
        if (tradeOrders.length < 1) return;
        let forkJoinData = [];
        this.deletedOrders = 0;
        this.selectedOrders = tradeOrders.length;
        tradeOrders.forEach(trade => {
            if (!trade.orderQty) {
                this.deletedOrders++;
                forkJoinData.push(this.responseToObject<any>(this._tomService.deleteTradeOrder(trade.id)));
            }
        });
        // execute all requests one by one
        Observable.forkJoin(forkJoinData)
            .subscribe((data: any) => {
                if (this.deletedOrders != this.selectedOrders)
                    this.displayDeletedInfo = true;
                else
                    this.refreshgrid();
            });
    }

    exportToExcel() {
        var params = <CsvExportParams>{
            skipFooters: true,
            skipGroups: true,
            fileName: "Trade Orders.csv"
        };
        params.processCellCallback = function (params) {
            console.log('csv params: ', params);
            if (params.column.getColId() == "createdDate") {
                return Util.dateRenderer(params);
            } else if (params.value && params.value.toUpperCase) {
                return params.value.toUpperCase();
            } else {
                return params.value;
            }
        };
        /*if (getBooleanValue('#customHeader')) {
            params.customHeader = '[[[ This ia s sample custom header - so meta data maybe?? ]]]\n';
        }
        if (getBooleanValue('#customFooter')) {
            params.customFooter = '[[[ This ia s sample custom footer - maybe a summary line here?? ]]]\n';
        }*/
        this.tradeOrderGridOptions.api.exportDataAsCsv(params);
    }

    /*Edit order*/
    /** gets orderTypes */
    getOrderTypes() {
        Util.responseToObjects<any>(this._tomService.getOrderTypes())
            .subscribe(model => {
                this.orderTypes = model;
            },
            error => {
                console.log(error)
            });
    }

    /** gets Qualifiers */
    getQualifiers() {
        Util.responseToObjects<any>(this._tomService.getQualifiers())
            .subscribe(model => {
                this.qualifiers = model;
            },
            error => {
                console.log(error)
            });
    }

    /** gets TradeActionTypes */
    getTradeActions() {
        Util.responseToObjects<any>(this._tomService.getTradeActions())
            .subscribe(model => {
                this.actionTypes = model;
            },
            error => {
                console.log(error)
            });
    }

    /** gets durations */
    getDurations() {
        Util.responseToObjects<any>(this._tomService.getDurations())
            .subscribe(model => {
                this.durations = model;
            },
            error => {
                console.log(error)
            });
    }

    /** Save orders */
    onSubmit(_orderSave: ITradeOrder) {
        let patchTrade = this.getPatchTradeDetails(_orderSave);
        patchTrade.isSendImmediately = false;
        // console.log(JSON.stringify(patchTrade));
        this.responseToObject<IPatchTradeOrder>(this._tomService.updateOrder(_orderSave.id, patchTrade))
            .subscribe(model => {
                this.displayEditOrder = false;
            },
            error => {
                console.log(error)
            });
    }

    /** send orders , it saves and process the order- will be removed later if flag is added update  */
    onSend(_orderSave: ITradeOrder) {
        let patchTrade = this.getPatchTradeDetails(_orderSave);
        patchTrade.isSendImmediately = true;
        console.log(JSON.stringify(patchTrade));
        this.responseToObject<IPatchTradeOrder>(this._tomService.updateOrder(_orderSave.id, patchTrade))
            .subscribe(model => {
                this.displayEditOrder = false;
                this.refreshgrid();
            }, error => {
                console.log(error);
                throw error;
            });
    }

    private gotoOrderList() {
        this.displayEditOrder = false;
    }

    /** enable disable stop price based on  order Type */
    onOrderTypeChange(params) {
        console.log(params);
        this.editOrder.orderType.id = params
        if (params == OrderType.Limit || params == OrderType.Stop_Limit) {
            this.isLimitPrice = true;
        }
        else {
            this.isLimitPrice = false;
            this.editOrder.limitPrice = null;
        }
        if (params == OrderType.Stop || params == OrderType.Stop_Limit) {
            this.isStopPrice = true;
        }
        else {
            this.isStopPrice = false;
            this.editOrder.stopPrice = null;
        }
    }

    getApprovalStatus() {
        let tradeIds = this.getTradeIds().join(",");
        Util.responseToObjects<IIdName>(this._tomService.getApprovalStatus(tradeIds))
            .subscribe(models => {
                this.approvalMenu = models;
            },
            error => {
                console.log(error)
            });
    }

    setApprovalStatus(statusId) {
        let tradeIds = { 'tradeIds': this.getTradeIds() };
        Util.responseToObjects<any>(this._tomService.setApprovalStatus(statusId, tradeIds))
            .subscribe(model => {
                this.refreshgrid();
            },
            error => {
                console.log(error)
            });
    }

    getTradeDetails(id) {
        Util.responseToObject<ITradeOrder>(this._tomService.getTradeDetail(id))
            .subscribe(model => {
                this.editOrder = model;
                this.editOrderTitle = model.account.number + "-" + model.account.name;
            },
            error => {
                console.log(error)
            });
    }

    hideShowRightPanel() {
        var target = '#' + ($(this).data("target") || 'tomRightPanel');
        var divwidth = $(target).width();
        console.log('target: ', target, '; divwidth: ', divwidth, '; isExpanded: ', this.isExpanded)
        divwidth = (this.isExpanded) ? -divwidth : 0;
        $(target).css("right", divwidth);
    }

    getPatchTradeDetails(_orderSave) {
        let patchTrade = <IPatchTradeOrder>{};
        patchTrade.id = _orderSave.id;
        patchTrade.durationId = _orderSave.duration.id;
        patchTrade.orderTypeId = _orderSave.orderType.id;
        patchTrade.actionId = _orderSave.action.id;
        patchTrade.limitPrice = _orderSave.limitPrice;
        patchTrade.stopPrice = _orderSave.stopPrice;
        patchTrade.isSolicited = _orderSave.isSolicited;
        patchTrade.isDiscretionary = _orderSave.isDiscretionary;
        patchTrade.isAutoAllocate = _orderSave.isAutoAllocate;
        patchTrade.price = _orderSave.estimateAmmount;
        patchTrade.qualifierId = _orderSave.qualifier.id;
        patchTrade.orderQty = _orderSave.orderQty;
        return patchTrade;
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
    getSelectedItem(item) {
        console.log('SelectedItem from AutoComplete : ', item);
    }
    closePopup() {
        this.addSecurtyPopup = false;
    }
    onContinueClick() {
        //TODO:API integration and re-direct
        let paramValues = this.taticalPopup.queryparams;
        this._router.navigate(['/eclipse/tradeorder/tactical', paramValues.portfolioId]);
        // this._router.navigate(['/eclipse/tradeorder/tactical', this.tabsModel.id || (this.tabsModel.ids ? this.tabsModel.ids.join() : '')]); //|| this.tabsModel.ids.join()
    }
    selectedTemplate(event) {
        this.selectedModelFile(event.target.files);
    }
    selectedModelFile(file) {
        this.showFiletUploadError = false;
        var selectedFile = file[0];
        if (this.isValidExcelFile(selectedFile.type)) {
            //this.file.model = selectedFile;
            this.fileName = selectedFile.name;
            this._tomService.importTradeFile(selectedFile, this.isPending)
                .subscribe(data => {
                    this.showFileUpload = false;
                    this.tradeOrders = data;
                    // if atleast one trade order is valid then only tradebutton will be enable
                    this.tradeOrders.forEach(trade => {
                        if (trade.isValid) {
                            this.disableTrade = false;
                        }
                    })
                    // console.log("success", this.tradeOrders);
                },
                error => {
                    this.showFiletUploadError = true;
                    this.fileUploadError = JSON.parse(error).message;
                })
        }
        else {
            this.showFiletUploadError = true;
            this.fileUploadError = 'Only (*.xlsx/.xls/.csv)  file can be uploaded.'
        }
    }
    saveValidTradeOrders() {
        this.tradeOrders = this.tradeOrders.filter(t => t.isValid == true);
        if (this.tradeOrders.length > 0) {
            return this._tomService.saveUploadTrades(this.tradeOrders)
                .subscribe(data => {
                    this.onRightPanelTabChange('EI');
                    this._notifier.notify.emit({ type: "ORDERS" });

                    // console.log("save Trade", data);
                },
                error => {

                });
        }
    }

    //on quantity change corresponding value will be changed 
    onQuantityKeyUp(event) {
        //  if (!isNaN( this.editOrder.limitPrice)) 
        //  this.editOrder.price = this.editOrder.limitPrice; // will remove later once ba updates doc
        //  else if(!isNaN( this.editOrder.stopPrice))
        //   this.editOrder.price = this.editOrder.stopPrice;

        this.editOrder.estimateAmount = +((this.editOrder.price * this.editOrder.orderQty).toFixed(2));

    }

    //on Value change corresponding quantity will be changed 
    onValueKeyUp(event) {
        //  if (!isNaN( this.editOrder.limitPrice)) 
        //  this.editOrder.price = this.editOrder.limitPrice;  // will remove later once ba updates doc
        //  else if(!isNaN( this.editOrder.stopPrice))
        //   this.editOrder.price = this.editOrder.stopPrice;     
        this.editOrder.orderQty = +(((this.editOrder.estimateAmount) / (this.editOrder.price)).toFixed(0));

    }

    //update new valueof the sell after amendment
    updateChangedVal(event) {      
        if (event.colDef.field == "clientDirect") {
            Util.responseToObject<any>(this._tomService.UpdateClientDirected(event.data.id, { 'id': event.data.id, 'clientDirected': event.newValue }))
                .subscribe(model => {                  
                    console.log(model);
                },
                error => {
                    console.log(error)
                });

        }
        else if (event.colDef.field == "holduntil") {

            Util.responseToObject<any>(this._tomService.updateHoldUntil(event.data.id, { 'id': event.data.id, 'holdUntil': event.newValue }))
                .subscribe(model => {
                    console.log(model);

                },
                error => {
                    console.log(error)
                });

        }
        else if (event.colDef.field == "settlementType.name") {
            Util.responseToObject<any>(this._tomService.updateSettlementType(event.data.id, { 'id': event.data.id, 'settlementTypeId': event.data.settlementType.id }))
                .subscribe(model => {
                    console.log(model);

                },
                error => {
                    console.log(error)
                });
        }
    }

    // gets settlementType masterdata to bind on grid on amendment.
    getSettlementTypes() {
        Util.responseToObject<any>(this._tomService.getSettlementTypes())
            .subscribe(model => {
                for (let item of model) {
                    this.settelmentTypes.push(item.name);
                }
            },
            error => {
                console.log(error)
            });
    }

    //get tradeOrderMessages to display in message column of grid
    getTradeOrderMessages(id) {
        Util.responseToObject<any>(this._tomService.getTradeOrderMessages(id))
            .subscribe(model => {

                this.tradeOrderMessages = model;
                this.messageDailog = true;
            },
            error => {
                console.log(error)
            });
    }

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
    /**Pending radio button change event */
    radioChange(val: string) {
        this.isPending = (val == "Pending");
    }



}
