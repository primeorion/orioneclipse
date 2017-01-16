import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import { ITabNav, AccountsTabNavComponent } from '../shared/account.tabnav.component';
import { AccountService } from '../../../services/account.service';
import { IAccountDetails, IAccountSimple, IYTDGainLossSummary, IIssuesSummary, IAccountValueSummary, IHoldingsSummary} from '../../../models/account';
import { AutoComplete } from 'primeng/components/autocomplete/autocomplete';
import { DonutChartService } from '../../../services/donutchart.service';
import {Accounts} from '../../../shared/accounts/assign.accounts';

@Component({
    selector: 'eclipse-account-view',
    templateUrl: './app/components/account/view/accountview.component.html',
    directives: [AccountsTabNavComponent, AutoComplete, Accounts],
    providers: [AccountService, DonutChartService]
})

export class AccountViewComponent extends BaseComponent {
    private tabsModel: ITabNav;
    accountId: number;
    account: IAccountDetails = <IAccountDetails>{};
    isShortTermGain: boolean;
    isLongTermGain: boolean;
    isTotalGain: boolean;
    isAccountTotalValue: boolean;
    accountSuggestions: IAccountSimple[] = [];
    accountValueModel: IHoldingsSummary[] = [];
    totalPercentage: number = 0;
    colorCodes: string[] = [];
    showAssignPopup: boolean;

    /** flags for div change if any -ve values occurs for short/long terms */
    shortermflag: boolean;
    longtermflag: boolean;
    totalglflag: boolean;


    @ViewChild(Accounts) assignComponent: Accounts;

    constructor(private _router: Router, private activateRoute: ActivatedRoute, private _accountService: AccountService,
        private _donutChartService: DonutChartService) {
        super(PRIV_ACCOUNTS);
        this.account = <IAccountDetails>{};
        this.account.issues = <IIssuesSummary>{};
        this.account.ytdGl = <IYTDGainLossSummary>{};
        this.account.accountValue = <IAccountValueSummary>{ holdings: <IHoldingsSummary[]>[] };

        this.tabsModel = Util.convertToTabNav(this.permission);
        this.tabsModel.action = 'V';


        //get param value when we clicked on edit account/add account
        this.accountId = Util.getRouteParam<number>(this.activateRoute);
        if (this.accountId > 0) this.tabsModel.id = this.accountId;
        console.log("account Id from Details:", this.accountId);
    }

    ngOnInit() {
        if (this.accountId > 0) {
            this.getAccountDetailsById(this.accountId);
        }
    }


    /**
   * To Get Account details by Id
   */
    getAccountDetailsById(accountId: number) {
        this.responseToObject<IAccountDetails>(this._accountService.getAccountById(accountId))
            .subscribe(model => {
                this.account = model;
                model.accountValue.holdings.forEach((m, index) => {
                    // m.color = OrionColors[index];
                    m.color = this.getRandomColor();
                    this.colorCodes.push(m.color);
                    this.totalPercentage += m.percentage;
                });

                console.log("AccountDetails by Id:", this.account);
                console.log("AccountHoldings:", this.accountValueModel);

                // To display up and down arrows for short term
                this.account.ytdGl.shortTermGLStatus === "High" ? this.isShortTermGain = true : this.isShortTermGain = false;
                // To display up and down arrows forlong term
                this.account.ytdGl.longTermGLStatus === "High" ? this.isLongTermGain = true : this.isLongTermGain = false;
                // To display up and down arrows for total
                this.account.ytdGl.totalGainLossStatus === "High" ? this.isTotalGain = true : this.isTotalGain = false;

                // To display up and down arrows for account total value
                this.account.accountValue.status === "High" ? this.isAccountTotalValue = true : this.isAccountTotalValue = false;

                // CHANGE SHORT TERM AND LONG TERM div if any -ve values
                this.account.ytdGl.shortTermGL < 0 ? this.shortermflag = true : this.shortermflag = false;
                this.account.ytdGl.longTermGL < 0 ? this.longtermflag = true : this.longtermflag = false;
                this.account.ytdGl.totalGainLoss < 0 ? this.totalglflag = true : this.totalglflag = false;

                // render account summary donut chart
                this._donutChartService.renderDonutChart("#accountDonut", model.accountValue.holdings, this.colorCodes, "account");

            },
            error => {
                console.log(error);
                throw error;
            });
    }

    /** AutoComplete Search portfolios by name */
    loadAccountSuggestions(event) {
        this.ResponseToObjects<IAccountSimple>(this._accountService.searchAccountsById(event.query.toLowerCase()))
            .subscribe(model => {
                this.accountSuggestions = model;
            });
    }

    onAccountSelect(params: any) {
        this._router.navigate(['/eclipse/account/search', params.id]);
    }

    /** Show delete confirm popup from tabnav component */
    showPopup(event) {
        switch (event) {
            case "Assign":
                this.showAssignPopup = true;
                break;
              case 'PREFERENCES':
                this._router.navigate(['/eclipse/admin/preferences/account', this.tabsModel.id || this.tabsModel.ids.join()]);
                break;
            default:
        }
        return;
    }

    /*** Display child page assign popup */
    callbackAssignPopup() {
        this.showAssignPopup = false;
        console.log("callbackAssignPopup: ", this.showAssignPopup);

    }
}