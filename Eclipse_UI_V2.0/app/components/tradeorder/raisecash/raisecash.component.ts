import { Component, HostListener, ViewChild} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { Response } from '@angular/http';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
// import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { IExcelImport } from '../../../models/tradetools';
import { IRaiseCashParentModel, IRaiseFullAmount, IRaiseCashGenerateTrade, IRaiseCashPortfolio } from '../../../models/raisecash';
import { ITradeToolCalculationMethods, ICalculationMethod } from '../../../models/tradetoolcalculation';
// import { RaiseCashService } from '../../../services/raisecash.service';
import { TradeToolsService } from '../../../services/tradetools.service';
import { PortfolioService } from '../../../services/portfolio.service';
import { TradeOrderFilterComponent } from '../../tradeorder/shared/tradeorder.tradefilter.component';
import { TradeToolsBusinessObjects } from '../../../businessobjects/tradetools.businessobjects';

@Component({
    selector: 'eclipse-tradetools-raisecash',
    templateUrl: './app/components/tradeorder/raisecash/raisecash.component.html'
})

export class RaiseCashComponent extends BaseComponent {
    private raisecashGridOptions: GridOptions;
    private emphasisGridOptions: GridOptions;
    private raisecashColDefs: ColDef[];
    private emphasisGridColDefs: ColDef[];
    viewName: string = "SelectionTab";
    selectedModelData: IRaiseCashParentModel;
    uploadedFileRecordType: string;
    selecetedItemIds: number[] = [];
    disableFilterNextBtn: boolean = true;
    calculationMethods: ICalculationMethod[] = [];
    filterdCalculationMethods: ICalculationMethod[] = [];
    selectedMethodId: number;
    isBuyRebalancewithEmphasis: boolean = false;
    modelNodes: any[];
    portfolioIdForEmphasis: number;
    isWithOutEmphasisTab: boolean = true;
    raiseFullAmountOptions: IRaiseFullAmount[] = [];
    raiseDistribution: boolean = false;
    isSleevePortfolio: boolean = false;
    reasonNote: string;
    selectedRaiseFullAmountOption: string;

    @ViewChild(TradeOrderFilterComponent) tradeOrderFilterComponent: TradeOrderFilterComponent;
    constructor(private _router: Router,
        private _tradeToolsService: TradeToolsService,
        private _portfolioService: PortfolioService,
        private tradeToolsBo: TradeToolsBusinessObjects
    ) {
        super();
        this.raisecashGridOptions = <GridOptions>{};
        this.selectedModelData = <IRaiseCashParentModel>{
            selectedFile: <IExcelImport>{}, 
            selectedVal: '', 
            selectedAccountsList: [], 
            isRaiseCash: true, 
            portfolioId: "",
            displayFilterOptions: {
                showAccounts: true, 
                showModel: false, 
                showPortfolio: false, 
                showExcelImport: true, 
                showSleeves: false, 
                showtradeGroupsForAccounts: false, 
                showSleevePortfolio: false,
                showtradeGroupsForPortfolio: false, 
                showExcelImportPortfolio: false, 
                showExcelImportSleeves: false, 
                showAmountInput: true, 
                showCalculateAtSleevePf: true
            }
        }
        this.modelNodes = [];
    }

    ngOnInit() {
        this.getRaiseCashCalculationMethods();
        this.getRaiseFullCashOptions();
    }

    /** Go to selected tab view */
    getSelectedView(viewName: string) {
        this.viewName = viewName;
        if (this.tradeOrderFilterComponent != undefined && this.tradeOrderFilterComponent.tradeFilterMethod != undefined) {
            this.selectedModelData.selectedVal = this.tradeOrderFilterComponent.tradeFilterMethod;
            this.selectedModelData.selectedAccountsList = this.tradeOrderFilterComponent.List;
            this.selectedModelData.selectedFile = this.tradeOrderFilterComponent.file;
            // this.raiseContribution = this.tradeOrderFilterComponent.raiseContribution;
            this.isSleevePortfolio = this.tradeOrderFilterComponent.isSleevePortfolio;
            this.selectedModelData.isCalculateAtSleevePf = this.tradeOrderFilterComponent.isCalculateAtSleevePf;

            //Preparing numeric array with seleceted record ids
            this.selecetedItemIds = [];
            this.tradeOrderFilterComponent.List.forEach(ele => {
                this.selecetedItemIds.push(ele.id);
            });

            if (this.tradeOrderFilterComponent.uploadResults.recordType != undefined)
                this.uploadedFileRecordType = this.tradeOrderFilterComponent.uploadResults.recordType;

            //Preparing numeric array from uploaded excel file
            this.tradeOrderFilterComponent.uploadResults.records.forEach(e => {
                if (e.isValid) {
                    this.selecetedItemIds.push(e.id);
                }
            });

            // To remove calculationMethod 'Buy Rebalance with Emphasis' on sleevePortfolio selection 
            if (this.selectedModelData.selectedVal == 'sleevePortfolio')
                this.calculationMethods = this.filterdCalculationMethods.filter(a => a.id != SpendCalculationMethods.BuyRebalancewithEmphasis);
            else
                this.calculationMethods = this.filterdCalculationMethods;

            this.createColDefs();
        }
    }

    /** To Create ColDefs */
    createColDefs() {
        this.raisecashColDefs = [];
        let self = this;
        if (this.selectedModelData.selectedVal == 'sleevePortfolio') {
            this.raisecashColDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 120 });
            this.raisecashColDefs.push(<ColDef>{ headerName: "Portfolio Name", field: 'name', width: 140 });
            this.raisecashColDefs.push(<ColDef>{ headerName: "Number", field: 'number', width: 140 });
            this.raisecashColDefs.push(<ColDef>{
                headerName: "Amount", field: "amount", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                    return self.tradeToolsBo.amountCellRenderer(params, self);
                }
            });
            this.raisecashColDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 120, cellRenderer: this.tradeToolsBo.deleteCellRenderer });
            // this.raisecashGridOptions.api.setColumnDefs(this.raisecashColDefs);
        }
        if (this.selectedModelData.selectedVal == 'account') {
            this.raisecashColDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 100 });
            this.raisecashColDefs.push(<ColDef>{ headerName: "Account Name", field: 'name', width: 220 });
            this.raisecashColDefs.push(<ColDef>{ headerName: "Type", field: 'type', width: 100 });
            this.raisecashColDefs.push(<ColDef>{ headerName: "Account Number", field: 'accountNumber', width: 220 });
            if (this.isBuyRebalancewithEmphasis) {
                this.raisecashColDefs.push(<ColDef>{
                    headerName: "Emphasis", field: "emphasis", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                        return self.tradeToolsBo.withEmphasisCellRenderer(params, self);
                    }
                });
            }
            this.raisecashColDefs.push(<ColDef>{
                headerName: "Amount", field: "amount", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                    return self.tradeToolsBo.amountCellRenderer(params, self);
                }
            });
            this.raisecashColDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 120, cellRenderer: this.tradeToolsBo.deleteCellRenderer });
            // this.raisecashGridOptions.api.setColumnDefs(this.raisecashColDefs);
        }
    }

    /** To Create ColDefs */
    createEmphasisGridColDefs() {
        this.emphasisGridColDefs = [];
        let self = this;
        if (this.selectedModelData.selectedVal == 'account') {
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "ID", field: 'id', width: 100 });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "Account Name", field: 'name', width: 220 });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "Type", field: 'type', width: 100 });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "Account Number", field: 'accountNumber', width: 220 });
            if (this.isBuyRebalancewithEmphasis) {
                this.emphasisGridColDefs.push(<ColDef>{
                    headerName: "Emphasis", field: "emphasis", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                        return self.tradeToolsBo.withEmphasisCellRenderer(params, self);
                    }
                });
            }
            this.emphasisGridColDefs.push(<ColDef>{
                headerName: "Amount", field: "amount", width: 230, cellClass: 'text-center', cellRenderer: function (params) {
                    return self.tradeToolsBo.amountCellRenderer(params, self);
                }
            });
            this.emphasisGridColDefs.push(<ColDef>{ headerName: "", field: 'delete', width: 120, cellRenderer: this.tradeToolsBo.deleteCellRenderer });
            // this.raisecashGridOptions.api.setColumnDefs(this.emphasisGridColDefs);
        }
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

    /** Fires on emphasis tabs click  */
    emphasisTabsClick(emphasisTab: string) {
        if (emphasisTab == "withOutEmphasisTab") {
            this.isWithOutEmphasisTab = true;
            this.createEmphasisGridColDefs();
            this.raisecashGridOptions.api.setColumnDefs(this.raisecashColDefs);
            this.raisecashGridOptions.api.refreshView();
        }
        else {
            this.isWithOutEmphasisTab = false;
            this.createEmphasisGridColDefs();
            this.raisecashGridOptions.api.setColumnDefs(this.raisecashColDefs);
            this.raisecashGridOptions.api.refreshView();
        }
    }

    /** Refresh the ag-grid after delete performed */
    private DeleteItem(id) {
        this.raisecashGridOptions.rowData.splice(this.raisecashGridOptions.rowData.findIndex(x => x.id == parseInt(id)), 1);
        this.raisecashGridOptions.api.setRowData(this.raisecashGridOptions.rowData);
    }

    /** Emiting event to enable/disable Next button based on selected accounts count */
    getTradeFiltersData(event) {
        this.disableFilterNextBtn = event.value;
    }

    /** To spend cash calculation methods */
    getRaiseCashCalculationMethods() {
        this.tradeToolsBo.getTradeToolCalculationMethods(TradeToolType.SpendCash) /** TODO: CHANGE IT TO RAISECASH */
            .subscribe(m => {
                this.selectedMethodId = m.selectedMethodId;
                this.calculationMethods = m.methods;
                this.filterdCalculationMethods = m.methods;
            },
            error => {
                console.log('getRaiseCashCalculationMethods error : ', error);
            })
    }

    /** Fires on calculation method change */
    changeCalculateMethod(selectedMethod) {
        this.selectedMethodId = +selectedMethod;
        /** TODO: CHANGE THIS CALCULATION METHOD ONCE INTEGRATED */
        if (this.selectedMethodId == SpendCalculationMethods.BuyRebalancewithEmphasis) {
            this.isBuyRebalancewithEmphasis = true;
        }
        else {
            this.isBuyRebalancewithEmphasis = false;
            this.createColDefs();
        }
    }

    /** To alter nodes  */
    getModelNodes(data) {
        let self = this;
        self.portfolioIdForEmphasis = data['portfolioId'];
        if (data['levels'] != undefined && data['levels'].length != 0 && data['levels'] != []) {
            data['levels'].forEach(function (val, key) {
                val['subModels'].forEach(e => {
                    // console.log('model nodes : ', self.modelNodes);
                    self.modelNodes.push({
                        level: val['level'],
                        subModelId: e['id'],
                        subModelName: e['subModelName'],
                        portfolioId: self.portfolioIdForEmphasis
                    });
                })
            });
        }
    }

    /** To get Spend full amount options */
    getRaiseFullCashOptions() {
        this.raiseFullAmountOptions = this._tradeToolsService.getTradeToolsFullCashOptions();
    }

    /** To generate trades */
    generateTrade() {
        let filterType;
        let selectedPortfolios = [];
        if (this.selectedModelData.selectedVal == 'sleevePortfolio') {
            filterType = "SleevePortfolio";
            this.selectedModelData.selectedAccountsList.forEach(e => {
                selectedPortfolios.push({ id: e.id, amount: e.amount });
            });
        }

        let selecetedAccounts = [];
        if (this.selectedModelData.selectedVal == 'account') {
            filterType = "Accounts";
            this.selectedModelData.selectedAccountsList.forEach(e => {
                selecetedAccounts.push({ portfolioId: e.portfolioId, accountId: e.id, amount: e.amount });
            });
        }

        let generateTrade = <any>{ //TODO: Use strict type
            selectedMethodId: +this.selectedMethodId,
            raiseFullAmount: this.selectedRaiseFullAmountOption,
            filterType: filterType,
            accounts: selecetedAccounts,
            sleevedPortfolios: selectedPortfolios,
            reason: this.reasonNote
        }
        console.log('spend cash generate trade input json : ', generateTrade);
    }

}
