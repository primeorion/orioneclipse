import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import { Response } from '@angular/http';
import * as Util from '../../../core/functions';
import { PortfolioService } from '../../../services/portfolio.service';
import { IPortfolio, IPortfolioDashboard } from '../../../models/portfolio';
import { ITabNav, PortfolioTabNavComponent } from '../shared/portfolio.tabnav.component';
import { Accounts } from '../../../shared/accounts/assign.accounts';
import { AccountService } from '../../../services/account.service';

@Component({
    selector: 'eclipse-portfolio-dashboard',
    templateUrl: './app/components/portfolio/dashboard/dashboard.component.html',
    directives: [PortfolioTabNavComponent, Accounts],
    providers: [PortfolioService, AccountService]
})
export class PortfolioDashboardComponent extends BaseComponent {
    private tabsModel: ITabNav;
    portfolioSummary: IPortfolioDashboard;
    outOfTolerancePerc: number;
    cashNeedPerc: number;
    setForAutoRebalancePerc: number;
    contributionsPerc: number;
    distributionPerc: number;
    noModelPerc: number;
    blockedPerc: number;
    TLHOpportunityPerc: number;
    dataErrorsPerc: number;
    pendingsTradesPerc: number;
    portfolioTypeId: number = 113;

    outOfToleranceStatusId: number = 1;
    cashNeedStatusId: number = 2;
    setForAutoRebalanceStatusId: number = 3;
    contributionsStatusId: number = 4;
    distributionStatusId: number = 5;
    noModelStatusId: number = 6;
    blockedStatusId: number = 7;
    TLHOpportunityStatusId: number = 8;
    pendingsTradesStatusId: number = 9;
    dataErrorsStatusId: number = 10;

    showAssignPopup: boolean;
   
    @ViewChild(Accounts) assignComponent: Accounts;

    constructor(private _router: Router, private _portfolioService: PortfolioService) {
        super(PRIV_PORTFOLIOS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
    }

    ngOnInit() {
        this.onPortfolioDashboardLoad();
        //this.progressBarPercentage();
    }

    /**get portfolios summary*/
    onPortfolioDashboardLoad() {
        this.responseToObject<IPortfolioDashboard>(this._portfolioService.getPortfolioDashboardData())
            .subscribe(summary => {
                this.portfolioSummary = summary;
                console.log('portfolio Summary : ', this.portfolioSummary);
                this.progressBarPercentage();
            });
    }

    /**to get progress bar percent */
    progressBarPercentage() {
        if (this.portfolioSummary.outOfTolerance != undefined || this.portfolioSummary.outOfTolerance != null)
            this.outOfTolerancePerc = this.calculatePercentage(this.portfolioSummary.outOfTolerance, this.portfolioSummary.portfolio.total);
        if (this.portfolioSummary.noModel != undefined || this.portfolioSummary.noModel != null)
            this.noModelPerc = this.calculatePercentage(this.portfolioSummary.noModel, this.portfolioSummary.portfolio.total);

        if (this.portfolioSummary.cashNeed != undefined || this.portfolioSummary.cashNeed != null)
            this.cashNeedPerc = this.calculatePercentage(this.portfolioSummary.cashNeed, this.portfolioSummary.portfolio.total);
        if (this.portfolioSummary.blocked != undefined || this.portfolioSummary.blocked != null)
            this.blockedPerc = this.calculatePercentage(this.portfolioSummary.blocked, this.portfolioSummary.portfolio.total);

        if (this.portfolioSummary.setForAutoRebalance != undefined || this.portfolioSummary.setForAutoRebalance != null)
            this.setForAutoRebalancePerc = this.calculatePercentage(this.portfolioSummary.setForAutoRebalance, this.portfolioSummary.portfolio.total);
        if (this.portfolioSummary.TLHOpportunity != undefined || this.portfolioSummary.TLHOpportunity != null)
            this.TLHOpportunityPerc = this.calculatePercentage(this.portfolioSummary.TLHOpportunity, this.portfolioSummary.portfolio.total);

        if (this.portfolioSummary.contribution != undefined || this.portfolioSummary.contribution != null)
            this.contributionsPerc = this.calculatePercentage(this.portfolioSummary.contribution, this.portfolioSummary.portfolio.total);
        if (this.portfolioSummary.dataErrors != undefined || this.portfolioSummary.dataErrors != null)
            this.dataErrorsPerc = this.calculatePercentage(this.portfolioSummary.dataErrors, this.portfolioSummary.portfolio.total);

        if (this.portfolioSummary.distribution != undefined || this.portfolioSummary.distribution != null)
            this.distributionPerc = this.calculatePercentage(this.portfolioSummary.distribution, this.portfolioSummary.portfolio.total);
        if (this.portfolioSummary.distribution != undefined || this.portfolioSummary.distribution != null)
            this.pendingsTradesPerc = this.calculatePercentage(this.portfolioSummary.pendingTrades, this.portfolioSummary.portfolio.total);
    }

    /**to calculate percentage */
    calculatePercentage(actualValue, totalValue) {
        return ((actualValue / totalValue) * 100); //.toFixed(2);
    }

    // progressBarClick() {
    //     //alert('from progress bar click');
    //     window.location.href = '#/eclipse/portfolio/list?id='+ 3;
    // }

      /*** Display child page assign popup */
    callbackAssignPopup() {
        this.showAssignPopup = false;
        console.log("callbackAssignPopup: ", this.showAssignPopup);
    }

     /** Show delete confirm popup from tabnav component */
    showPopup(event) {
         switch (event) {
             case "Assign":
                this.showAssignPopup = true;
                break;
            default:
        }
        return;
    }


}
