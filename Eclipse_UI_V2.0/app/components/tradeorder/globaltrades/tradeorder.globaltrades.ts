import { Component, HostListener, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import { Observable, Observer } from 'rxjs/Rx';
import * as Util from '../../../core/functions';
// import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { IExcelImport, IGenerateTrades, ITradeSecurity, IGlobalTradesParentModel, ISwapOptions, ITickerSwap } from '../../../models/tradetools';
import { SecurityService } from '../../../services/security.service';
import { TradeToolsService } from '../../../services/tradetools.service';
import { TradeOrderFilterComponent } from '../../tradeorder/shared/tradeorder.tradefilter.component';

@Component({
    selector: 'eclipse-tradeorder-globaltrades',
    templateUrl: './app/components/tradeorder/globaltrades/tradeorder.globaltrades.html',
})

export class GlobalTradesComponent extends BaseComponent {
    private gobalTradesGridOptions: GridOptions;
    private gobalTradesColDefs: ColDef[];
    private trades: any[] = [];
    isTickerSwap: boolean = false;
    viewName: string = "SelectionTab";
    buySecuritySuggessions: any;
    sellSecuritySuggessions: any;
    autocompleteSellResults: any[] = [];
    selectedBuySecurity: any;
    selectedSellSecurity: any;
    percent: number;
    noOfAccounts: number;
    sellSecurities: any;
    isInValidPercent: boolean = false;
    totalPercent: number = 0;
    percentVal: string = "";
    isTotalPercentExceed: boolean = false;
    isDuplicateTrade: boolean = false;
    isSameSucurity: boolean = false;
    isBuyAndSellingSameSecurity: boolean = false;
    disableFilterNextBtn: boolean = true;
    disableCreateTradeNextBtn: boolean = true;
    selecetedItemIds: number[] = [];
    optionalNote: string;
    finalTabError: string = "";
    generateTradesData: IGenerateTrades;
    tradeSecurity: ITradeSecurity[] = [];
    taxTicker_SwapOptions: ISwapOptions;
    uploadedFileRecordType: string;
    parentModelData: IGlobalTradesParentModel;
    route: string;
    filterMode: string;
    selectedIds: string;
    valuesList: string[];
    showSellSecurityMsg: boolean = false;
    @ViewChild(TradeOrderFilterComponent) tradeOrderFilterComponent: TradeOrderFilterComponent;
    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _securityService: SecurityService, private _tradeToolsService: TradeToolsService) {
        super();

        this.route = Util.activeRoute(activateRoute);
        this.valuesList = [];
        this.getQueryStringData(activateRoute);

        if (this.route == 'tickerswap') {
            this.isTickerSwap = true;
            this.percent = 100;
        }

        this.gobalTradesGridOptions = <GridOptions>{};
        this.createColDefs();
        this.parentModelData = <IGlobalTradesParentModel>{
            selectedFile: <IExcelImport>{}, selectedVal: this.filterMode, selectedAccountsList: this.valuesList, portfolioId: "",
            displayFilterOptions: {
                showPortfolio: true, showAccounts: true, showModel: true, showExcelImport: true, showSleeves: false, showtradeGroupsForAccounts: false,
                showtradeGroupsForPortfolio: true, showExcelImportPortfolio: false, showExcelImportSleeves: false
            }
        }
        this.filterMode != '' && this.valuesList.length != 0 ? this.parentModelData.isOnLoad = true : this.parentModelData.isOnLoad = false;
        this.generateTradesData = <IGenerateTrades>{};
        //let ticker = Util.getRouteParam(this.activateRoute, 'type');
        //if (ticker == "tickerswap") {
        if (this.isTickerSwap) {
            this.parentModelData.displayFilterOptions.showtradeGroupsForAccounts = true;
            this.taxTicker_SwapOptions = <ISwapOptions>{
                tickerBatch: 1,
                profitLoss: 1,
                valueType: 2,
                value: 0,
                includeTaxDeferredOrExemptAccounts: false,
                instanceNote: ""

            };
        }
    }

    ngOnInit() {
    }
    /**Get Query string data from route */
    getQueryStringData(activateRoute) {
        //getting values from Query string and passing to FilterComponent
        if (this.route == "globaltrades" || this.route == "tickerswap") {
            this.filterMode = Util.getRouteParam<string>(activateRoute, 'type');
            this.selectedIds = Util.getRouteParam<string>(activateRoute, 'ids');
        }
        this.filterMode == undefined ? this.filterMode = '' : this.filterMode;
        if (this.selectedIds != undefined)
            this.valuesList = this.selectedIds.split(',');
    }
    /** */
    checkValue(event, val) {
        var charCode = (event.which) ? event.which : event.keyCode;
        val = (val != undefined || val != null) ? val.toString() : "";
        var number = val.split('.');
        if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        //just one dot
        if (number.length > 1 && charCode == 46) {
            return false;
        }
        if (number.length > 1 && number[1].length > 1) {
            return false;//two digits after decimal
        }
    }

    /** */
    validateValue(value, tab) {
        tab == 1 ? this.isInValidPercent = false : this.finalTabError = "";
        this.isTotalPercentExceed = false;
        if (value == null || value == undefined) {
            tab == 1 ? this.isInValidPercent = true : this.finalTabError = "Enter valid value.";
            return false;
        }
        value = value.toString();
        let pattern = /^\d+(\.\d{1,2})?$/;
        if (!value.match(pattern)) {
            tab == 1 ? this.isInValidPercent = true : this.finalTabError = "Invalid value.";
            return false;
        }
        /** Value should be greaterthan '0' and lessthan or equal to 100 */
        if (+value > 100)
            this.percent = 100;
        if (+value <= 0)
            this.isInValidPercent = true;
        else
            this.isInValidPercent = false;

    }

    /** Go to selected tab view */
    getSelectedView(viewName: string) {
        this.parentModelData.isOnLoad = false;
        this.showSellSecurityMsg = false;
        this.viewName = viewName;
        if (viewName == "0")
            this.isTickerSwap == true ? this.viewName = 'finalTabTickerSwap' : this.viewName = 'finalTab';

        this.clearFields();
        if (this.tradeOrderFilterComponent != undefined && this.tradeOrderFilterComponent.tradeFilterMethod != undefined) {
            this.parentModelData.selectedVal = this.tradeOrderFilterComponent.tradeFilterMethod;
            this.parentModelData.selectedAccountsList = this.tradeOrderFilterComponent.List;
            this.parentModelData.selectedFile = this.tradeOrderFilterComponent.file;
            this.noOfAccounts = this.tradeOrderFilterComponent.List.length;

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
        }
    }

    /** To clear fields on next/back button clicks */
    clearFields() {
        if (this.viewName == "createTradesTab") {
            this.selectedSellSecurity = undefined;
            this.selectedBuySecurity = undefined;
            this.isTickerSwap ? this.percent = 100 : this.percent = undefined;
            this.trades = [];
            this.disableCreateTradeNextBtn = true;
        }
        if (this.viewName == "finalTab") this.optionalNote = undefined;
        if (this.viewName == "finalTabTickerSwap") {
            this.taxTicker_SwapOptions = <ISwapOptions>{
                tickerBatch: 1,
                profitLoss: 1,
                valueType: 2,
                value: 0,
                includeTaxDeferredOrExemptAccounts: false,
                instanceNote: ""

            };
        }
    }

    /** To Create ColDefs */
    createColDefs() {
        this.gobalTradesColDefs = [
            <ColDef>{ headerName: "# of Accounts", field: 'accountsCount', width: 180 },
            <ColDef>{ headerName: "Sell", field: 'sell', width: 220 },
            <ColDef>{ headerName: "Buy", field: 'buy', width: 220 },
            <ColDef>{ headerName: "Percent", field: 'percent', width: 150 }
        ];
    }

    /**Buy Security Search */
    buySecuritySearch(event) {
        Util.responseToObjects<any>(this._securityService.searchSecurityFromOrionEclipse(event.query, 'OPEN,EXCLUDED'))
            .subscribe(securitiesResult => {
                this.buySecuritySuggessions = securitiesResult.filter(a => a.isDeleted == 0);
            });
    }

    /** Fires on item select */
    onBuySecuritySelect(item) {
    }

    /**sell Security Search */
    sellSecuritySearch(event) {
        this.showSellSecurityMsg = false;
        //Changing filter method value based on excel header name (portfolio, account..)
        let selectedFilterOption = this.parentModelData.selectedVal;
        if (this.uploadedFileRecordType != undefined)
            selectedFilterOption = this.uploadedFileRecordType;

        Util.responseToObjects<any>(this._securityService.getSellSecurities(event.query, selectedFilterOption, this.selecetedItemIds))
            .subscribe(securitiesResult => {
                securitiesResult.length == 0 ? this.showSellSecurityMsg = true : this.showSellSecurityMsg = false;
                this.sellSecuritySuggessions = securitiesResult.filter(a => a.isDeleted == 0);
                //console.log('this.sellSecuritySuggessions : ', this.sellSecuritySuggessions);
            });
    }

    /** Fires on item select */
    onSellSecuritySelect(item) {
    }

    /** Add trade to agGrid */
    addTrade() {
        if (this.selectedSellSecurity != undefined &&
            this.selectedBuySecurity != undefined &&
            this.percent != undefined) {
            if ((typeof (this.selectedSellSecurity) == 'string') || (typeof (this.selectedBuySecurity) == 'string')) return;
            this.totalPercent = 0;
            //Reseting error massages
            this.isTotalPercentExceed = false;
            this.isBuyAndSellingSameSecurity = false;
            this.isDuplicateTrade = false;

            //To check: Is buy and Sell are same securities or not
            if (this.selectedSellSecurity.id == this.selectedBuySecurity.id) {
                this.isSameSucurity = true; return;
            } else {
                this.isSameSucurity = false;
            }

            if (this.trades.length > 0) {
                //To check: The total for the sell Securities cannot exceed 100%. 
                this.calculateTotalPercent(this.trades, this.selectedSellSecurity);
                this.totalPercent += this.percent;
                if (this.totalPercent > 100) {
                    this.isTotalPercentExceed = true;
                    return;
                } else {
                    this.isTotalPercentExceed = false;
                }

                // To check: Is the trade is duplicate or not
                this.checkDuplicateTrade(this.trades, this.selectedSellSecurity, this.selectedBuySecurity)
                if (this.isDuplicateTrade) return;

                //To Check: Do not allow BUY and SELL of same security
                let match = this.trades.find(m => m.selectedSellSecurityId == this.selectedBuySecurity.id && m.selectedBuySecurityId == this.selectedSellSecurity.id) // && m.percent == this.percent
                if (match != undefined) {
                    this.isBuyAndSellingSameSecurity = true;
                    return;
                } else {
                    this.isBuyAndSellingSameSecurity = false;
                }
            }

            let trade = { accountsCount: this.noOfAccounts, selectedSellSecurityId: this.selectedSellSecurity.id, sell: this.selectedSellSecurity.name, buy: this.selectedBuySecurity.name, selectedBuySecurityId: this.selectedBuySecurity.id, percent: this.percent };
            this.trades.push(trade);
            this.gobalTradesGridOptions.api.setRowData(this.trades);
            this.gobalTradesGridOptions.api.sizeColumnsToFit();
            this.selectedSellSecurity = undefined;
            this.selectedBuySecurity = undefined;
            this.isTickerSwap ? this.percent = 100 : this.percent = undefined;

            if (this.trades.length > 0)
                this.disableCreateTradeNextBtn = false;
            else
                this.disableCreateTradeNextBtn = true;
        }
    }

    /** To calculate total percentage*/
    calculateTotalPercent(trades, selectedSellSecurity) {
        trades.forEach(element => {
            if (element.selectedSellSecurityId == selectedSellSecurity.id)
                this.totalPercent += element.percent;
        });
    }

    /**To Check Duplicate trade */
    checkDuplicateTrade(trades, selectedSellSecurity, selectedBuySecurity) {
        let match = trades.find(m => m.selectedSellSecurityId == selectedSellSecurity.id && m.selectedBuySecurityId == selectedBuySecurity.id)
        if (match != undefined)
            this.isDuplicateTrade = true;
        else
            this.isDuplicateTrade = false;
    }

    /** To validate percentage */
    validatePercent(value) {
        this.isTotalPercentExceed = false;
        if (value > 100)
            this.percent = 100;
        if (value <= 0)
            this.isInValidPercent = true;
        else
            this.isInValidPercent = false;
    }

    /** Emiting event to enable/disable Next button based on selected accounts count */
    getTradeFiltersData(event) {
        this.disableFilterNextBtn = event.value;
    }
    /**Emitting tab selection to second tab directly as selection of Ids already made. */
    setSelectedView(event) {
        this.getSelectedView(event.value);
    }

    /** To generate trades */
    generateTrades() {
        this.finalTabError = "";
        if (this.isTickerSwap) {
            let pattern = /^\d+(\.\d{1,2})?$/;
            if (!this.percentVal.match(pattern)) {
                this.finalTabError = "Invalid value.";
                return false;
            }
            //Swap Options from final tab of tax Ticker
            this.generateTradesData.swapOptions = {
                tickerBatch: + this.taxTicker_SwapOptions.tickerBatch,
                profitLoss: + this.taxTicker_SwapOptions.profitLoss,
                value: +this.percentVal,
                valueType: +this.taxTicker_SwapOptions.valueType,
                instanceNote: this.taxTicker_SwapOptions.instanceNote,
                includeTaxDeferredOrExemptAccounts: this.taxTicker_SwapOptions.includeTaxDeferredOrExemptAccounts
            };
            //need to pass all other types as 'NULL' except selected one.
            this.generateTradesData.modelIds = null;
            this.generateTradesData.accountIds = null;
            this.generateTradesData.portfolioIds = null;
            this.generateTradesData.tradeGroupForAccountIds = null;
            this.generateTradesData.tradeGroupForPortfolioIds = null;

            //Set Ticker values
            let tickerSwap = [];
            this.trades.forEach(e => {
                let security = <ITickerSwap>{
                    sellTickerId: e.selectedSellSecurityId,
                    sellTickerName: e.sell,
                    buyTickerId: e.selectedBuySecurityId,
                    buyTickerName: e.buy,
                    percent: e.percent
                }
                tickerSwap.push(security);
            });
            this.generateTradesData.tickerSwap = tickerSwap;
        }

        //Changing filter method value based on excel header name (portfolio, account..)
        let selectedFilterOption = this.parentModelData.selectedVal;
        if (this.uploadedFileRecordType != undefined)
            selectedFilterOption = this.uploadedFileRecordType;

        if (selectedFilterOption == "portfolio")
            this.generateTradesData.portfolioIds = this.selecetedItemIds;
        else if (selectedFilterOption == "account")
            this.generateTradesData.accountIds = this.selecetedItemIds;
        else if (selectedFilterOption == "model")
            this.generateTradesData.modelIds = this.selecetedItemIds;

        if (this.isTickerSwap) {

            Util.responseToObject<any>(this._tradeToolsService.swapTickerGenerateTrades(this.generateTradesData))
                .subscribe(m => {
                    this._router.navigate(['/eclipse/tradeorder/list']);
                },
                error => {
                    console.log('generateTrades error : ', error);
                });
        }
        else {
            this.tradeSecurity = [];
            this.trades.forEach(e => {
                let security = <ITradeSecurity>{ sellSecurityId: e.selectedSellSecurityId, buySecurityId: e.selectedBuySecurityId, percent: e.percent }
                this.tradeSecurity.push(security);
            });
            this.generateTradesData.security = this.tradeSecurity;
            this.generateTradesData.notes = this.optionalNote;
            // console.log('generateTrades input json : ', JSON.stringify(this.generateTradesData));
            Util.responseToObject<any>(this._tradeToolsService.generateTrades(this.generateTradesData))
                .subscribe(m => {
                    // console.log('generateTrades success : ', m);
                    this._router.navigate(['/eclipse/tradeorder/list']);
                },
                error => {
                    console.log('generateTrades error : ', error);
                });
        }
    }
}