import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import * as Util from '../../../core/functions';
import { IAccountSimpleWithReturnValue, IPortfolioSimpleWithReturnValue} from '../../../models/holding';
import { HoldingService } from '../../../services/holding.service';
import { AccountService } from '../../../services/account.service';
import { PortfolioService } from '../../../services/portfolio.service';

@Component({
    selector: 'eclipse-holding-filterby',
    templateUrl: './app/components/holding/shared/holding.filterby.component.html',
    directives: [AutoComplete],
    providers: [AccountService, PortfolioService],
    properties: ['routeName']
})
export class HoldingFilterComponent {
    routeName: string = 'dashboard';
    selectedHoldingParam: string;
    holdingValues: any;
    selectedTypeId: number;
    autoCompleteSuggestions: any[] = [];
    selectedHoldingObj: any;
    disableBtn: boolean = true;

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
        if (this.selectedHoldingParam == "Account") {
            Util.responseToObjects<IAccountSimpleWithReturnValue>(this._accountService.searchAccountsByIdWithValue(event.query.toLowerCase()))
                .subscribe(model => {
                    this.autoCompleteSuggestions = model;
                });
        }
        else if (this.selectedHoldingParam == "Portfolio") {
            Util.responseToObjects<IPortfolioSimpleWithReturnValue>(this._portfolioService.searchPortfolioByIdWithValue(event.query.toLowerCase()))
                .subscribe(model => {
                    this.autoCompleteSuggestions = model;
                });
        }
    }

    /**On selection of auto complete */
    onSelect(params: any) {
        this.selectedTypeId = params.id;

        if (this.selectedTypeId)
            this.disableBtn = false;
    }

    /**Apply button click */
    applySelectedChanges() {
        this._router.navigate(['/eclipse/holding/filter/' + this.routeName, this.selectedHoldingParam, this.selectedTypeId]);
    }

    /**Show holdings by dropdown change */
    selectedHoldingParamChange(selectedHoldingParam) {
        this.selectedHoldingParam = selectedHoldingParam;
        this.selectedHoldingObj = '';
        this.disableBtn = true;
    }

    /** To Get selected account/portfolio id, name with value */
    getNameWithvalue(type, typeId) {
        if (type == "Account") {
            Util.responseToObjects<IAccountSimpleWithReturnValue>(this._accountService.searchAccountsByIdWithValue(typeId))
                .subscribe(model => {
                    let obj = model.filter(x => x.id == typeId);
                    this.selectedHoldingObj = obj[0].id + ":" + obj[0].name + (obj[0].value ? (" - " + "$" + obj[0].value) : '');
                });
        }
        else if (type == "Portfolio") {
            Util.responseToObjects<IPortfolioSimpleWithReturnValue>(this._portfolioService.searchPortfolioByIdWithValue(typeId))
                .subscribe(model => {
                    let obj = model.filter(x => x.id == typeId);
                    this.selectedHoldingObj = obj[0].id + ":" + obj[0].name + (obj[0].value ? ("-" + "$" + obj[0].value) : '');
                });
        }
    }

    handleSelectedValue(param: any) {
        if (param.id > 0)
            this.disableBtn = false;
        else
            this.disableBtn = true;

    }

}
