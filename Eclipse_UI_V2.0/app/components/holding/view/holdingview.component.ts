import { Component, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AgGridNg2 } from 'ag-grid-ng2/main';
import { GridOptions, ColDef } from 'ag-grid/main';
import 'ag-grid-enterprise/main';
import { Observable } from 'rxjs/Rx';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { Dialog } from 'primeng/components/dialog/dialog';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { ITabNav, HoldingTabNavComponent } from '../shared/holding.tabnav.component';
import { IHoldingDetails, IGainLoss, ITaxlots, ITransactions } from '../../../models/holding';
import { HoldingService } from '../../../services/holding.service';
import {HoldingFilterComponent } from '../shared/holding.filterby.component';

@Component({
    selector: 'eclipse-holding-view',
    templateUrl: './app/components/holding/view/holdingview.component.html',   
    providers: [HoldingService]
})
export class HoldingViewComponent extends BaseComponent {
    private tabsModel: ITabNav;
    public selectedHoldingParam: any;
    selectedTypeId: number;
    selectedHoldingId: number;
    holdingSuggestions: IHoldingDetails[] = [];
    selectedHolding: string;
    holdingDetails: IHoldingDetails = <IHoldingDetails>{};
    taxlotsDetails: ITaxlots[] = [];
    transactionDetails: ITransactions[] = [];
    isShortTermGain: boolean;
    isLongTermGain: boolean;
    isTotalGain: boolean;
    shortermflag: boolean;
    longtermflag: boolean;
    totalLossflag: boolean;
    private taxlotsGridOptions: GridOptions;
    private taxlotsColumnDefs: ColDef[];
    private transactionGridOptions: GridOptions;
    private transactionColumnDefs: ColDef[];
    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _holdingService: HoldingService) {
        super(PRIV_PORTFOLIOS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';
        this.tabsModel.type = Util.getRouteParam<string>(activateRoute, 'type');
        this.tabsModel.typeId = Util.getRouteParam<number>(activateRoute, 'tid');
        this.tabsModel.id = Util.getRouteParam<number>(activateRoute);
        this.selectedHoldingParam = this.tabsModel.type;
        this.selectedTypeId = this.tabsModel.typeId;
        this.selectedHoldingId = this.tabsModel.id;
        this.taxlotsGridOptions = <GridOptions>{};
        this.createTaxlotsColumnDefs();
        this.transactionGridOptions = <GridOptions>{};
        this.createTransactionColumnDefs();

        this.holdingDetails = <IHoldingDetails>{};
        this.holdingDetails.GLSection = <IGainLoss>{};
        this.taxlotsDetails = <ITaxlots[]>[];        
    }

    ngOnInit() {
        if (this.selectedHoldingId) {
            this.getHoldingDetailsById(this.selectedHoldingId);
            this.getHoldingTaxlotsDetailsById(this.selectedHoldingId);
            this.getHoldingTransactionDetailsById(this.selectedHoldingId);
        }
    }


    /** Used for Holdings Autocomplete */
    holdingsSearch(event) {
        Util.responseToObjects<IHoldingDetails>(this._holdingService.searchHoldings(this.selectedHoldingParam, this.selectedTypeId,event.query.toLowerCase()))
            .subscribe(model => {
                this.holdingSuggestions = model;
            });
    }

    /**On selection of holding */
    onHoldingSelection(params: any) {     
        this.selectedHolding = params;
        this.selectedHoldingId = params.id;     
        this._router.navigate(['/eclipse/holding/search',"view", this.selectedHoldingParam, this.selectedTypeId ,params.id]);
    }

    /**
  * To Get Holding details by Id
  */
    getHoldingDetailsById(holdingId: number) {
        this.responseToObject<IHoldingDetails>(this._holdingService.getHoldingDetailsById(holdingId))
            .subscribe(model => {
                this.holdingDetails = model;

                // To display up and down arrows for short term
                this.isShortTermGain = (this.holdingDetails.GLSection.shortTermGLStatus === "High") ? true : false;
                // To display up and down arrows forlong term
                this.isLongTermGain = (this.holdingDetails.GLSection.longTermGLStatus === "High") ? true : false;

                // To display up and down arrows for total
                if (this.isShortTermGain || this.isLongTermGain)
                    this.isTotalGain = true;
                else if (!this.isShortTermGain && !this.isLongTermGain)
                    this.isTotalGain = false;

                // CHANGE SHORT TERM AND LONG TERM div if any -ve values
                this.holdingDetails.GLSection.shortTermGL < 0 ? this.shortermflag = true : this.shortermflag = false;
                this.holdingDetails.GLSection.longTermGL < 0 ? this.longtermflag = true : this.longtermflag = false;
                this.holdingDetails.GLSection.totalGainLoss < 0 ? this.totalLossflag = true : this.totalLossflag = false;

                // // Convert -ve values to +ve values
                // if (this.holdingDetails.GLSection.shortTermGL < 0)
                //     this.holdingDetails.GLSection.shortTermGL = -(this.holdingDetails.GLSection.shortTermGL);
                // if (this.holdingDetails.GLSection.longTermGL < 0)
                //     this.holdingDetails.GLSection.longTermGL = -(this.holdingDetails.GLSection.longTermGL);


            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /**
     * To Get Holding tax lots details by Id
     */
    getHoldingTaxlotsDetailsById(holdingId: number) {
        this.responseToObject<ITaxlots[]>(this._holdingService.getHoldingTaxlotsDetailsById(holdingId))
            .subscribe(model => {
                this.taxlotsDetails = model;
                this.taxlotsGridOptions.api.sizeColumnsToFit();                
            });
    }

    /**
   * To Get Holding transaction details by Id
   */
    getHoldingTransactionDetailsById(holdingId: number) {
        this.responseToObject<ITransactions[]>(this._holdingService.getHoldingTTransactionDetailsById(holdingId))
            .subscribe(model => {
                this.transactionDetails = model;
                this.transactionGridOptions.api.sizeColumnsToFit();
            });
    }

    /** Create column headers for taxlots agGrid */
    private createTaxlotsColumnDefs() {
        this.taxlotsColumnDefs = [
            <ColDef>{ headerName: "Tax lot Id", field: "id", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Date Acquired", field: "dateAcquired", width: 110, cellRenderer: this.dateRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Quantity", field: "quantity", width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Cost Amount", field: "costAmount", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: " Cost per Share", field: "costPerShare", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: " Long Term Gain/Loss", field: "GLSection.longTermGL", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: " Short Term Gain/Loss", field: "GLSection.shortTermGL", width: 75, cellClass: 'text-center' },


        ];
    }

    /** Create column headers for Transactions agGrid */
    private createTransactionColumnDefs() {
        this.transactionColumnDefs = [
            <ColDef>{ headerName: "Transaction Id 	", field: "id", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Date", field: "date", width: 110, cellRenderer: this.dateRenderer, cellClass: 'text-center' },
            <ColDef>{ headerName: "Type", field: "type", width: 125, cellClass: 'text-center' },
            <ColDef>{ headerName: "Amount", field: "amount", width: 110, cellClass: 'text-center' },
            <ColDef>{ headerName: "Units", field: "units", width: 75, cellClass: 'text-center' },
            // <ColDef>{ headerName: " Cost", field: "cost", width: 75, cellClass: 'text-center' },
            <ColDef>{ headerName: " Price", field: "price", width: 75, cellClass: 'text-center' },


        ];
    }
}
