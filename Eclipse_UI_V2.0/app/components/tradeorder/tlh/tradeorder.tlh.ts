import { Component, HostListener } from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import 'ag-grid-enterprise/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import { ITLHFilters, ITradeTLH, IGainOrLoss } from '../../../models/tradetools';
import { ITabNav } from '../../../viewmodels/tabnav';
import { TradeToolsService } from '../../../services/tradetools.service';

@Component({
    selector: 'eclipse-tradeorder-tlh',
    templateUrl: './app/components/tradeorder/tlh/tradeorder.tlh.html',
})
export class TLHComponent extends BaseComponent {
    viewName: string;
    private tlhFilters: ITLHFilters = <ITLHFilters>{};
    gridOptions: GridOptions;
    private tabsModel: ITabNav;
    private columnDefs: ColDef[];
    // private tradeTlh : any;
    private tradeTlh: ITradeTLH[] = <ITradeTLH[]>[];
    private selectedtradeTlh: ITradeTLH[] = <ITradeTLH[]>[];
    private disableCreateTradeNextBtn: boolean = true;
    private gainOrLoss: any;
    private terms: any;
    private signs : any;
    constructor(private _tradeToolsService: TradeToolsService) {
        super();
        this.viewName = "SelectionTab";
        this.tlhFilters.taxableAccountsOnly = true;
        this.getGainOrLoss();
        this.getTerms();
        this.getSigns();
    }
    getSelectedView(viewName: string) {
        debugger;
        this.viewName = viewName;
        if (viewName == "createTradesTab") {
            this.gridOptions = <GridOptions>{
                enableColResize: true
            }
            this.createColumnDefs();
            this.createTrade();
        }
    }

    /**Create TLH trades On user conditions */
    createTrade() {
        Util.responseToObject<ITradeTLH[]>(this._tradeToolsService.createTrades(this.tlhFilters))
            .subscribe(trade => {
                console.log('TLH Trades: ', trade);
                this.tradeTlh = trade;
            },
            error => {
                console.log('ERROR In TLH Trades: ', error);
            });
    }
    /**Grid Columns */
    private createColumnDefs() {
        let self = this;
        this.columnDefs = [
            <ColDef>{ headerName: "Account Name", headerTooltip: 'Model ID', field: 'accountName' },
            <ColDef>{ headerName: "Account Number", headerTooltip: 'Account Number', field: 'accountNumber' },
            <ColDef>{ headerName: "Account Type", headerTooltip: 'Account Type', field: 'accountType' },
            <ColDef>{ headerName: "Security Symbol", headerTooltip: 'Security Symbol', field: 'securitySymbol' },
            <ColDef>{ headerName: "Portfolio Realized YTD GL $", headerTooltip: 'Portfolio Realized YTD GL $', field: 'portfolioRealizedYtdGL' },
            <ColDef>{ headerName: "Total GL Amount", headerTooltip: 'Total GL Amount', field: 'totalGLAmount' },
            <ColDef>{ headerName: "GL Percent", headerTooltip: 'GL Percent', field: 'GLPercent' },
            <ColDef>{ headerName: "ST GL Amount", headerTooltip: 'ST GL Amount', field: 'STGLAmount' },
            <ColDef>{ headerName: "LT GL Amount", headerTooltip: 'LT GL Amount', field: 'LTGLAmount' },
            <ColDef>{ headerName: "Account value", headerTooltip: 'Account value', field: 'accountValue' },
            <ColDef>{ headerName: "Cash Value", headerTooltip: 'Cash Value', field: 'cashValue' },
            <ColDef>{ headerName: "Security Name", headerTooltip: 'Security Name', field: 'securityName' },
            <ColDef>{ headerName: "Current Shares", headerTooltip: 'Current Shares', field: 'currentShares' },
            <ColDef>{ headerName: "Current Value $", headerTooltip: 'Created By', field: 'currentValue' },
            <ColDef>{ headerName: "Current Percent", headerTooltip: 'Current Percent', field: 'currentPercent' },
            <ColDef>{ headerName: "Custodian", headerTooltip: 'Custodian', field: 'custodian' },
            <ColDef>{ headerName: "Management Style ", headerTooltip: 'Management Style ', field: 'managementStyle' },
            <ColDef>{ headerName: "Account ID", headerTooltip: 'Account ID', field: 'accountId' },
            <ColDef>{ headerName: "Portfolio ID", headerTooltip: 'Portfolio ID', field: 'portfolioId' }
        ];
    }
    /**Selected grid row Info */
    private onRowSelected(event) {
        debugger;
        // let trade  = event.node.data;
        // this.selectedtradeTlh.push(trade);
        let trade = this.gridOptions.api.getSelectedRows();
        this.selectedtradeTlh = trade.map(m => m);
        if (this.selectedtradeTlh.length > 0)
            this.disableCreateTradeNextBtn = false;
    }
    /**Get GainLoss*/
    getGainOrLoss() {
        let gainOrLoss = [{ "id": 1, "name": "Gain" }, { "id": 2, "name": "Loss" }]
        this.gainOrLoss = gainOrLoss;
    }
    /**Get terms*/
    getTerms() {
        let tlhTerms = [{ "id": 1, "name": "Both" }, { "id": 2, "name": "Long term" }, { "id": 3, "name": "Short term" }]
        this.terms = tlhTerms;
    }
    /**Get signs*/
    getSigns() {
        let tlhSigns = [{ "id": 1, "name": "<" }, { "id": 2, "name": ">" }, { "id": 3, "name": "=" }]
        this.signs = tlhSigns;
    }


}