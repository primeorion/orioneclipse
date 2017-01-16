import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import * as Util from '../../../core/functions';
import { IHoldingWithReturnValue } from '../../../models/holding';
import { HoldingService } from '../../../services/holding.service';
import { AccountService } from '../../../services/account.service';
import { PortfolioService } from '../../../services/portfolio.service';

@Component({
    selector: 'eclipse-holding-filterby',
    templateUrl: './app/components/holding/shared/holding.filterby.component.html',
    providers: [AccountService, PortfolioService],
    // properties: ['routeName']
})
export class HoldingFilterComponent {
    @Input() routeName: string = 'dashboard';
    selectedHoldingParam: string;
    holdingValues: any;
    selectedTypeId: number;
    autoCompleteSuggestions: any[] = [];
    selectedHoldingObj: any;
    disableBtn: boolean = true;
    formatedObj: any;

    constructor(private activateRoute: ActivatedRoute, private _router: Router, private _holdingService: HoldingService,
        private _accountService: AccountService, private _portfolioService: PortfolioService) {
        this.selectedHoldingParam = Util.getRouteParam<string>(activateRoute, 'type');
        this.selectedTypeId = Util.getRouteParam<number>(activateRoute, 'tid');
        if (this.selectedHoldingParam == undefined) this.selectedHoldingParam = '';
    }

    ngOnInit() {
        this.getHoldingParameters();
        if (this.selectedHoldingParam != undefined && this.selectedTypeId != undefined)
            this.getNameWithvalue(this.selectedHoldingParam, this.selectedTypeId);

    }

    /** To get static holding selection values (parameters) */
    private getHoldingParameters() {
        this.holdingValues = this._holdingService.getHoldingParameters();
    }

    /** AutoComplete Search  by Portfolio/Account */
    loadAutoCompleteSuggestionsBySelectedHolding(event) { 
        Util.responseToObjects<IHoldingWithReturnValue>(this._holdingService.getHoldingSearchByAccountOrPortfolio(event.query.toLowerCase()))
            .subscribe(model => {
                this.autoCompleteSuggestions = model;  
            });
    }

    /**On selection of auto complete */
    onSelect(params: any) {       
        this.selectedTypeId = params.id;
        this.selectedHoldingParam=params.type;

          this.selectedHoldingObj = params.id +":"+params.name +"-"+params.value;

        if (this.selectedTypeId) {
            //   this.disableBtn = false;
            this._router.navigate(['/eclipse/holding/filter/' + this.routeName, this.selectedHoldingParam, this.selectedTypeId]);
        }
    }

    // /**Apply button click */
    // applySelectedChanges() {
    //     this._router.navigate(['/eclipse/holding/filter/' + this.routeName, this.selectedHoldingParam, this.selectedTypeId]);
    // }


    /**Show holdings by dropdown change */
    selectedHoldingParamChange(selectedHoldingParam) {
        this.selectedHoldingParam = selectedHoldingParam;
        this.selectedHoldingObj = '';
        this.disableBtn = true;
    }

    /** To Get selected account/portfolio id, name with value */
    getNameWithvalue(type, typeId) {
        Util.responseToObjects<IHoldingWithReturnValue>(this._holdingService.getHoldingSearchByAccountOrPortfolio(typeId))
            .subscribe(model => {
                let obj = model.filter(x => x.id == typeId && x.type == type.toLowerCase());
                this.selectedHoldingObj = obj[0].id + ":" + obj[0].name + (obj[0].value ? (" - " + "$" + obj[0].value) : '');
            });

    }

    handleSelectedValue(param: any) {
        // if (param.id > 0)
        //     this.disableBtn = false;
        // else
        //     this.disableBtn = true;

    }

}
