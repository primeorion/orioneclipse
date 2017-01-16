import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { ITabNav, AccountsTabNavComponent } from '../shared/account.tabnav.component';
import {Accounts} from '../../../shared/accounts/assign.accounts';
import { AccountService } from '../../../services/account.service';
import { IAccountDashboard } from '../../../models/account';

import {  PortfolioTabNavComponent } from '../../portfolio/shared/portfolio.tabnav.component';


@Component({
    selector: 'eclipse-account-dashboard',
    templateUrl: './app/components/account/dashboard/dashboard.component.html',
    directives: [AccountsTabNavComponent, PortfolioTabNavComponent, Accounts],
    providers: [AccountService]
})

export class AccountDashboardComponent extends BaseComponent {
    private tabsModel: ITabNav;
    accountSummary: IAccountDashboard;
    systematicPerc: number;
    accountWithMergeInPerc: number;
    accountWithMergeOutPerc: number;
    newAccountPerc: number;
    accountWithNoPortfolioPerc: number;
    toDoPerc: number;
    smaPerc: number;
    accountWithDataErrorPerc: number;
    accountWithPedingTradesPerc: number;

    systematicStatusId: number = 1;
    accountWithMergeInStatusId: number = 2;
    accountWithMergeOutStatusId: number = 3;
    newAccountStatusId: number = 4;
    accountWithNoPortfolioStatusId: number = 5;
    toDoStatusId: number = 6;
    smaStatusId: number = 7;
    accountWithDataErrorStatusId: number = 8;
    accountWithPedingTradesStatusId: number = 9;

    showAssignPopup: boolean;
  
    @ViewChild(Accounts) assignComponent: Accounts;

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _accountService: AccountService) {
        super(PRIV_ACCOUNTS);
        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'L';
    }

    ngOnInit() {
        this.onAccountDashboardLoad();
    }

    /**get Accounts summary*/
    onAccountDashboardLoad() {
        this.responseToObject<IAccountDashboard>(this._accountService.getAccountDashboardSummary())
            .subscribe(summary => {
                console.log("Account Summary:", summary);
                this.accountSummary = summary;
                this.progressBarPercentage();
            });
    }

    /**to get progress bar percent */
    progressBarPercentage() {
        if (this.accountSummary.bars.systematic != undefined || this.accountSummary.bars.systematic != null)
            this.systematicPerc = this.calculatePercentage(this.accountSummary.bars.systematic, this.accountSummary.accounts.total);

        if (this.accountSummary.bars.accountWithMergeIn != undefined || this.accountSummary.bars.accountWithMergeIn != null)
            this.accountWithMergeInPerc = this.calculatePercentage(this.accountSummary.bars.accountWithMergeIn, this.accountSummary.accounts.total);

        if (this.accountSummary.bars.accountWithMergeOut != undefined || this.accountSummary.bars.accountWithMergeOut != null)
            this.accountWithMergeOutPerc = this.calculatePercentage(this.accountSummary.bars.accountWithMergeOut, this.accountSummary.accounts.total);

        if (this.accountSummary.bars.newAccount != undefined || this.accountSummary.bars.newAccount != null)
            this.newAccountPerc = this.calculatePercentage(this.accountSummary.bars.newAccount, this.accountSummary.accounts.total);

        if (this.accountSummary.bars.accountWithNoPortfolio != undefined || this.accountSummary.bars.accountWithNoPortfolio != null)
            this.accountWithNoPortfolioPerc = this.calculatePercentage(this.accountSummary.bars.accountWithNoPortfolio, this.accountSummary.accounts.total);

        if (this.accountSummary.bars.toDo != undefined || this.accountSummary.bars.toDo != null)
            this.toDoPerc = this.calculatePercentage(this.accountSummary.bars.toDo, this.accountSummary.accounts.total);

        if (this.accountSummary.bars.sma != undefined || this.accountSummary.bars.sma != null)
            this.smaPerc = this.calculatePercentage(this.accountSummary.bars.sma, this.accountSummary.accounts.total);

        if (this.accountSummary.bars.accountWithDataError != undefined || this.accountSummary.bars.accountWithDataError != null)
            this.accountWithDataErrorPerc = this.calculatePercentage(this.accountSummary.bars.accountWithDataError, this.accountSummary.accounts.total);

        if (this.accountSummary.bars.accountWithPedingTrades != undefined || this.accountSummary.bars.accountWithPedingTrades != null)
            this.accountWithPedingTradesPerc = this.calculatePercentage(this.accountSummary.bars.accountWithPedingTrades, this.accountSummary.accounts.total);
    }

    /**to calculate percentage */
    calculatePercentage(actualValue, totalValue) {
        return ((actualValue / totalValue) * 100); //.toFixed(2);
    }

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
