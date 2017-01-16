import { Component, Input, Output, HostListener, EventEmitter} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { IHoldingDashboard, IDashboardValueSummary, IDashboardHoldingSummary, IDashboardIssueSummary,
    IDashboardBarsSummary, IDashboardTpo10HoldingsSummary, IHoldings, IPortfolioSimpleWithReturnValue, IAccountSimpleWithReturnValue } from '../../../models/holding';
import { AccountService } from '../../../services/account.service';
import { HoldingService } from '../../../services/holding.service';
import { PortfolioService } from '../../../services/portfolio.service';
import { HoldingFilterComponent } from '../shared/holding.filterby.component';
import { ITabNav, HoldingTabNavComponent } from '../shared/holding.tabnav.component';

@Component({
    selector: 'eclipse-holding-dashboard',
    templateUrl: './app/components/holding/dashboard/dashboard.component.html',
    directives: [AutoComplete, HoldingTabNavComponent, HoldingFilterComponent],
    providers: [HoldingService, AccountService, PortfolioService]
})
export class HoldingDashboardComponent extends BaseComponent {
    private tabsModel: ITabNav;
    public selectedHoldingParam: any;
    holdingsSummary: IHoldingDashboard;
    selectedTypeId: number;
    totalPercentage: number = 0;
    excludedPerc: number;
    notInModelPerc: number;
    selectedHoldingObj: any;
    selectedHoldingValue: any;
    excludedId: number = 1;
    notInModelId: number = 2;

    constructor(private activateRoute: ActivatedRoute, private _router: Router,
        private _holdingService: HoldingService,
        private _accountService: AccountService, private _portfolioService: PortfolioService) {
        super(PRIV_HOLDINGS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
        this.tabsModel.type = Util.getRouteParam<string>(activateRoute, 'type');
        this.tabsModel.typeId = Util.getRouteParam<number>(activateRoute, 'tid');
        this.selectedHoldingParam = this.tabsModel.type;
        this.selectedTypeId = this.tabsModel.typeId;

        this.holdingsSummary = <IHoldingDashboard>{};
        this.holdingsSummary.value = <IDashboardValueSummary>{};
        this.holdingsSummary.holdings = <IDashboardHoldingSummary>{};
        this.holdingsSummary.issues = <IDashboardIssueSummary>{};
        this.holdingsSummary.bars = <IDashboardBarsSummary>{};
        this.holdingsSummary.top10holdings = <IDashboardTpo10HoldingsSummary>{};
        this.holdingsSummary.top10holdings.holdings = <IHoldings[]>[];
    }

    ngOnInit() {
        if (this.selectedHoldingParam != undefined && this.selectedTypeId != undefined) {
            this.onHoldingDashboardLoad(this.selectedHoldingParam, this.selectedTypeId);
            this.getNameWithvalue(this.selectedHoldingParam, this.selectedTypeId);
        }
    }

    /** Get Holdings dashboad summary */
    onHoldingDashboardLoad(type, id) {
        this.responseToObject<IHoldingDashboard>(this._holdingService.getHoldingDashboardSummaryById(type, id))
            .subscribe(summary => {
                this.holdingsSummary = summary;

                summary.top10holdings.holdings.forEach((m, index) => {
                    m.color = this.getRandomColor();
                    this.totalPercentage += m.percentage;
                })
                this.progressBarPercentage();
            });
    }


    /**to get progress bar percent */
    progressBarPercentage() {
        if (this.holdingsSummary.bars.exclude != undefined || this.holdingsSummary.bars.exclude != null)
            this.excludedPerc = this.calculatePercentage(this.holdingsSummary.bars.exclude, this.holdingsSummary.bars.all);

        if (this.holdingsSummary.bars.notInModel != undefined || this.holdingsSummary.bars.notInModel != null)
            this.notInModelPerc = this.calculatePercentage(this.holdingsSummary.bars.notInModel, this.holdingsSummary.bars.all);

    }


    /**to calculate percentage */
    calculatePercentage(actualValue, totalValue) {
        return ((actualValue / totalValue) * 100); //.toFixed(2);
    }

    /** To Get selected account/portfolio id, anme with value */
    getNameWithvalue(type, typeId) {       
        if (type == "Account") {
            Util.responseToObjects<IAccountSimpleWithReturnValue>(this._accountService.searchAccountsByIdWithValue(typeId))
                .subscribe(model => {
                   let obj = model.filter(x => x.id == typeId);
                    this.selectedHoldingObj = obj[0].name + " (" + obj[0].id + ")  ";
                    this.selectedHoldingValue =obj[0].value;
                });
        }
        else if (type == "Portfolio") {
            Util.responseToObjects<IPortfolioSimpleWithReturnValue>(this._portfolioService.searchPortfolioByIdWithValue(typeId))
                .subscribe(model => {
                   let obj = model.filter(x => x.id == typeId);
                    this.selectedHoldingObj = obj[0].name + " (" + obj[0].id + ")  ";
                    this.selectedHoldingValue = obj[0].value;
                });
        }
    }
}
